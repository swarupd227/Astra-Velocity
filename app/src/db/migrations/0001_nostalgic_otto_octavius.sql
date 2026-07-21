CREATE TYPE "public"."content_kind" AS ENUM('sector', 'scenario', 'obligation', 'kpi', 'pack', 'element', 'best-practice', 'dashboard');--> statement-breakpoint
CREATE TYPE "public"."content_status" AS ENUM('draft', 'published', 'deprecated');--> statement-breakpoint
CREATE TABLE "content_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"kind" "content_kind" NOT NULL,
	"key" text NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"status" "content_status" DEFAULT 'draft' NOT NULL,
	"payload" jsonb NOT NULL,
	"checksum" text NOT NULL,
	"created_by" text DEFAULT 'seed' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "content_kind_key_version_idx" ON "content_items" USING btree ("kind","key","version");--> statement-breakpoint
CREATE INDEX "content_kind_status_idx" ON "content_items" USING btree ("kind","status");