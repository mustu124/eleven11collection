-- Seed the 15 launch categories.
insert into categories (name, slug, sort_order) values
  ('Earrings', 'earrings', 1),
  ('Ear Cuffs', 'ear-cuffs', 2),
  ('Bracelet Kadas', 'bracelet-kadas', 3),
  ('Bracelets', 'bracelets', 4),
  ('Rings', 'rings', 5),
  ('Watches', 'watches', 6),
  ('Pendants', 'pendants', 7),
  ('Enamel Bangles', 'enamel-bangles', 8),
  ('Hand Cuffs', 'hand-cuffs', 9),
  ('Hand Chains', 'hand-chains', 10),
  ('Anklets', 'anklets', 11),
  ('Crochet', 'crochet', 12),
  ('Jewellery Boxes', 'jewellery-boxes', 13),
  ('Waist Chains', 'waist-chains', 14),
  ('Others', 'others', 15)
on conflict (slug) do nothing;
