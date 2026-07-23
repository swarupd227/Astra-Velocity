#!/usr/bin/env bash
# =============================================================================
# Astra Velocity — DB migration + content seed against Azure, with NO manual
# credentials. Run this any time after `az acr build` + `az containerapp
# update` roll out a new image — it is always safe to re-run (migrations are
# additive/idempotent; seeding upserts by checksum; demo users are
# create-or-update, never destructive).
#
# How it avoids needing DATABASE_URL / AUTH_SECRET typed in by hand:
# the astra-web Container App already holds them as secrets (set once at
# `az containerapp create` time in azure-deploy.sh). This script reads the
# secret VALUES back out of that already-deployed app via
# `az containerapp secret show` — the one Azure CLI command that returns a
# Container App secret's plaintext, not just its name/metadata — so the only
# things you need to know are the resource group and app name, which are
# fixed for this deployment.
#
# Usage (from anywhere, Cloud Shell or a fresh clone):
#   bash deploy/azure-migrate.sh
# Optional overrides (env vars, all have sane defaults for this deployment):
#   RG=rg-astra-velocity APP=astra-web SUB=<subscription-id> REPO_DIR=~/Astra-Velocity \
#     bash deploy/azure-migrate.sh
# =============================================================================
set -euo pipefail

SUB="${SUB:-688ff410-b717-4bbb-81a4-33b7540fcb71}"
RG="${RG:-rg-astra-velocity}"
APP="${APP:-astra-web}"
REPO_URL="${REPO_URL:-https://github.com/swarupd227/Astra-Velocity.git}"
REPO_DIR="${REPO_DIR:-$HOME/Astra-Velocity}"

echo "==> Subscription"
az account set --subscription "$SUB"

echo "==> Repo"
if [ ! -d "$REPO_DIR/.git" ]; then
  git clone "$REPO_URL" "$REPO_DIR"
fi
cd "$REPO_DIR"
git pull --ff-only

echo "==> Reading DATABASE_URL / AUTH_SECRET from the deployed Container App's own secrets"
# `secret show` (singular) returns the plaintext value; `secret list` does not.
DATABASE_URL="$(az containerapp secret show -g "$RG" -n "$APP" --secret-name dburl --query value -o tsv)"
AUTH_SECRET="$(az containerapp secret show -g "$RG" -n "$APP" --secret-name authsecret --query value -o tsv)"

if [ -z "$DATABASE_URL" ] || [ -z "$AUTH_SECRET" ]; then
  echo "Could not read dburl/authsecret from Container App '$APP' in '$RG'." >&2
  echo "Confirm the app exists and was created with --secrets dburl=... authsecret=..." >&2
  exit 1
fi
export DATABASE_URL AUTH_SECRET
echo "    (values retrieved — not printed)"

cd app
echo "==> Installing dependencies"
npm ci --no-audit --no-fund

echo "==> Migrating schema"
npm run db:migrate

echo "==> Seeding demo users + content library"
npm run db:seed

echo "==> Seeding AI prompt templates + routing defaults"
npm run db:seed:ai

# Secrets only ever lived in this shell's env for the commands above.
unset DATABASE_URL AUTH_SECRET

echo "==> Done. Verify: curl \$(az containerapp show -g $RG -n $APP --query properties.configuration.ingress.fqdn -o tsv)/api/health"
