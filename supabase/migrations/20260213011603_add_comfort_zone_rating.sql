-- Add comfort_zone_rating column to post table
-- Nullable because non-challenge posts won't have a rating
ALTER TABLE post ADD COLUMN comfort_zone_rating integer;

-- Add CHECK constraint: value must be between 1 and 10
ALTER TABLE post ADD CONSTRAINT comfort_zone_rating_range
  CHECK (comfort_zone_rating IS NULL OR (comfort_zone_rating >= 1 AND comfort_zone_rating <= 10));
