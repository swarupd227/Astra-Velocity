ALTER TYPE "public"."content_kind" ADD VALUE 'platform';--> statement-breakpoint
ALTER TYPE "public"."content_kind" ADD VALUE 'friction-pattern';--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "platform_keys" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "platform_variants" jsonb DEFAULT '[]'::jsonb NOT NULL;