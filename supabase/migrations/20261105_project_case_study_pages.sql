-- Project case-study page fields.
-- Safe to run more than once.

ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS slug text,
  ADD COLUMN IF NOT EXISTS long_description text,
  ADD COLUMN IF NOT EXISTS gallery_images text[] NOT NULL DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS sort_order integer NOT NULL DEFAULT 0;

-- Create readable URLs for existing projects. Duplicate titles receive an ID suffix.
WITH generated AS (
  SELECT
    id,
    COALESCE(
      NULLIF(
        trim(BOTH '-' FROM regexp_replace(lower(COALESCE(title, 'project')), '[^a-z0-9]+', '-', 'g')),
        ''
      ),
      'project'
    ) AS base_slug
  FROM public.projects
),
duplicates AS (
  SELECT base_slug
  FROM generated
  GROUP BY base_slug
  HAVING count(*) > 1
)
UPDATE public.projects AS p
SET slug = CASE
  WHEN d.base_slug IS NULL THEN g.base_slug
  ELSE g.base_slug || '-' || p.id::text
END
FROM generated AS g
LEFT JOIN duplicates AS d ON d.base_slug = g.base_slug
WHERE p.id = g.id
  AND (p.slug IS NULL OR btrim(p.slug) = '');

ALTER TABLE public.projects
  ALTER COLUMN slug SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS projects_slug_unique_idx
  ON public.projects (slug);

CREATE INDEX IF NOT EXISTS projects_published_sort_idx
  ON public.projects (published, sort_order, created_at DESC);
