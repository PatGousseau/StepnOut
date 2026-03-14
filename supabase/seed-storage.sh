#!/bin/bash
# Upload seed images to local Supabase storage bucket
# Run this after `supabase db reset`

set -e

SUPABASE_URL="http://127.0.0.1:54321"
# Local development service role key (safe to commit - only works locally)
SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU"
BUCKET="challenge-uploads"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ASSETS_DIR="$SCRIPT_DIR/seed-assets"

echo "Waiting for local Supabase to be ready..."

for attempt in {1..40}; do
  if curl -s -o /dev/null -w "%{http_code}" "$SUPABASE_URL/storage/v1/bucket" \
    -H "Authorization: Bearer $SERVICE_ROLE_KEY" | grep -q "^200$"; then
    break
  fi

  if [ "$attempt" -eq 40 ]; then
    echo "Supabase storage API not responding at $SUPABASE_URL after waiting."
    echo "Try: supabase status && supabase logs --tail"
    exit 1
  fi

  sleep 0.5
done

echo "Ensuring storage bucket exists..."
BUCKET_EXISTS=$(curl -s "$SUPABASE_URL/storage/v1/bucket" \
  -H "Authorization: Bearer $SERVICE_ROLE_KEY" | grep -c "\"name\":\"$BUCKET\"" || true)

if [ "$BUCKET_EXISTS" -eq 0 ]; then
  curl -s -X POST "$SUPABASE_URL/storage/v1/bucket" \
    -H "Authorization: Bearer $SERVICE_ROLE_KEY" \
    -H "Content-Type: application/json" \
    -d "{\"id\":\"$BUCKET\",\"name\":\"$BUCKET\",\"public\":true}" > /dev/null
fi

echo "Uploading seed images to storage bucket..."

for i in 1 2 3 4 5 6; do
  echo "  Uploading seed_$i.jpg -> image/seed_$i.jpg"
  curl -s -X POST "$SUPABASE_URL/storage/v1/object/$BUCKET/image/seed_$i.jpg" \
    -H "Authorization: Bearer $SERVICE_ROLE_KEY" \
    -H "Content-Type: image/jpeg" \
    --data-binary "@$ASSETS_DIR/seed_$i.jpg" > /dev/null
done

# Upload seed_6 also as video thumbnail
echo "  Uploading seed_6.jpg -> thumbnails/video/seed_6.jpg"
curl -s -X POST "$SUPABASE_URL/storage/v1/object/$BUCKET/thumbnails/video/seed_6.jpg" \
  -H "Authorization: Bearer $SERVICE_ROLE_KEY" \
  -H "Content-Type: image/jpeg" \
  --data-binary "@$ASSETS_DIR/seed_6.jpg" > /dev/null

echo "Done! Seed images uploaded to $BUCKET bucket."
