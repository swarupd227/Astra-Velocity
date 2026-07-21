#!/usr/bin/env bash
# =============================================================================
# Astra Velocity — manual Azure deployment (run from the repo root, bash)
# Subscription: Microsoft Azure Sponsorship
# Architecture: Azure Container Apps (web + worker) + PostgreSQL Flexible
#               Server + Azure Cache for Redis + Azure Container Registry
# =============================================================================
set -euo pipefail

# ---- 0. Variables (edit LOC/names if you like; ACR/PG/REDIS names are global) --
SUB="688ff410-b717-4bbb-81a4-33b7540fcb71"
LOC="eastus"
RG="rg-astra-velocity"
ACR="acrastravelocity"          # lowercase alphanumeric, globally unique
PG="pg-astra-velocity"          # globally unique
REDIS="redis-astra-velocity"    # globally unique
ENVN="cae-astra-velocity"
PG_ADMIN="astra"
PG_PASS="$(openssl rand -base64 24 | tr -d '=+/')"
AUTH_SECRET="$(openssl rand -base64 32)"
MY_IP="$(curl -s https://api.ipify.org)"   # for running migrations from this machine

echo "Save these now (shown once):"
echo "  PG_PASS=$PG_PASS"
echo "  AUTH_SECRET=$AUTH_SECRET"

# ---- 1. Login & subscription ------------------------------------------------
az login
az account set --subscription "$SUB"
az extension add --name containerapp --upgrade

# ---- 2. Resource group & container registry ---------------------------------
az group create -n "$RG" -l "$LOC"
az acr create -g "$RG" -n "$ACR" --sku Basic --admin-enabled true

# ---- 3. Build & push both images in Azure (no local docker needed) ----------
az acr build -r "$ACR" -t astra-velocity-web:v1    --target web    ./app
az acr build -r "$ACR" -t astra-velocity-worker:v1 --target worker ./app

# ---- 4. PostgreSQL Flexible Server (Postgres 16) ----------------------------
# --public-access 0.0.0.0 = "allow Azure services"; your IP added for migrations.
# NOTE: some regions are restricted for PG Flexible on sponsorship subscriptions
# (eastus was, in practice). If create fails with "location is restricted", try:
# westus2 -> centralus -> westus3 -> canadacentral -> northeurope.
PG_LOC="westus2"
az postgres flexible-server create -g "$RG" -n "$PG" -l "$PG_LOC" \
  --admin-user "$PG_ADMIN" --admin-password "$PG_PASS" \
  --tier Burstable --sku-name Standard_B1ms --storage-size 32 --version 16 \
  --public-access 0.0.0.0
az postgres flexible-server firewall-rule create -g "$RG" -s "$PG" -n allow-my-ip \
  --start-ip-address "$MY_IP" --end-ip-address "$MY_IP"
az postgres flexible-server db create -g "$RG" -s "$PG" -n astra_velocity

DATABASE_URL="postgres://${PG_ADMIN}:${PG_PASS}@${PG}.postgres.database.azure.com:5432/astra_velocity?sslmode=require"

# ---- 5. Azure Cache for Redis (Basic C0; provisioning takes ~15-20 min) -----
# If this region is restricted too, use -l "$PG_LOC" instead.
az redis create -g "$RG" -n "$REDIS" -l "$LOC" --sku Basic --vm-size c0
REDIS_KEY="$(az redis list-keys -g "$RG" -n "$REDIS" --query primaryKey -o tsv)"
REDIS_URL="rediss://:${REDIS_KEY}@${REDIS}.redis.cache.windows.net:6380"

# ---- 6. Migrations + seed (run from this machine against Azure PG) ----------
# NOTE: app/.env.local overrides env vars (dotenv override:true) — park it first.
cd app
[ -f .env.local ] && mv .env.local .env.local.bak
DATABASE_URL="$DATABASE_URL" npm run db:migrate
DATABASE_URL="$DATABASE_URL" AUTH_SECRET="$AUTH_SECRET" npm run db:seed
DATABASE_URL="$DATABASE_URL" AUTH_SECRET="$AUTH_SECRET" npm run db:seed:ai
[ -f .env.local.bak ] && mv .env.local.bak .env.local
cd ..

# ---- 7. Container Apps environment ------------------------------------------
az containerapp env create -g "$RG" -n "$ENVN" -l "$LOC"

ACR_SERVER="${ACR}.azurecr.io"
ACR_USER="$(az acr credential show -n "$ACR" --query username -o tsv)"
ACR_PASSWORD="$(az acr credential show -n "$ACR" --query 'passwords[0].value' -o tsv)"

# ---- 8. Web app (external HTTPS ingress on 3000) -----------------------------
az containerapp create -g "$RG" -n astra-web --environment "$ENVN" \
  --image "$ACR_SERVER/astra-velocity-web:v1" \
  --registry-server "$ACR_SERVER" --registry-username "$ACR_USER" --registry-password "$ACR_PASSWORD" \
  --target-port 3000 --ingress external \
  --min-replicas 1 --max-replicas 2 --cpu 1.0 --memory 2.0Gi \
  --secrets dburl="$DATABASE_URL" redisurl="$REDIS_URL" authsecret="$AUTH_SECRET" \
  --env-vars DATABASE_URL=secretref:dburl REDIS_URL=secretref:redisurl \
             AUTH_SECRET=secretref:authsecret AUTH_TRUST_HOST=true NODE_ENV=production

FQDN="$(az containerapp show -g "$RG" -n astra-web --query properties.configuration.ingress.fqdn -o tsv)"

# Tell Auth.js its canonical HTTPS origin (secure cookies just work behind ACA TLS)
az containerapp update -g "$RG" -n astra-web --set-env-vars "AUTH_URL=https://${FQDN}"

# ---- 9. Worker (no ingress) ---------------------------------------------------
az containerapp create -g "$RG" -n astra-worker --environment "$ENVN" \
  --image "$ACR_SERVER/astra-velocity-worker:v1" \
  --registry-server "$ACR_SERVER" --registry-username "$ACR_USER" --registry-password "$ACR_PASSWORD" \
  --min-replicas 1 --max-replicas 1 --cpu 0.5 --memory 1.0Gi \
  --secrets dburl="$DATABASE_URL" redisurl="$REDIS_URL" \
  --env-vars DATABASE_URL=secretref:dburl REDIS_URL=secretref:redisurl NODE_ENV=production

# ---- 10. Done -----------------------------------------------------------------
echo "============================================================"
echo "Astra Velocity is live at:  https://${FQDN}"
echo "Login: platform.admin@astra.demo / AstraDemo!2026"
echo "Health check: https://${FQDN}/api/health"
echo "============================================================"

# ---- Redeploy after code changes ---------------------------------------------
# az acr build -r $ACR -t astra-velocity-web:v2 --target web ./app
# az containerapp update -g $RG -n astra-web --image $ACR_SERVER/astra-velocity-web:v2
# (same pattern for the worker; bump the tag each time)
