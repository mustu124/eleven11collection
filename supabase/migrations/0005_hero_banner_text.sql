-- ============================================================
-- homepage_banners: admin-editable overlay text for hero slides
-- Currently only used by the "hero" section (eyebrow/heading/subheading
-- rendered over the slide image) — nullable so mood/gifting banners,
-- which don't render text, are unaffected.
-- ============================================================
alter table homepage_banners
  add column eyebrow_text text,
  add column heading_text text,
  add column subheading_text text;
