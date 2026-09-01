#!/bin/bash
# Shrink-only optimization: only downsizes images larger than MAX on their
# longer edge, otherwise just re-encodes at quality Q. Never upscales.
set -e
DIR="/Volumes/HQ/Claude/paris-pullen/assets/img/wardrobe"
LIST="/tmp/new_wardrobe_files.txt"
MAX=1000
Q=70
COUNT=0
while IFS= read -r name; do
  [ -z "$name" ] && continue
  f="$DIR/$name"
  [ -f "$f" ] || continue
  W=$(sips -g pixelWidth "$f" 2>/dev/null | awk '/pixelWidth/{print $2}')
  H=$(sips -g pixelHeight "$f" 2>/dev/null | awk '/pixelHeight/{print $2}')
  if [ -z "$W" ] || [ -z "$H" ]; then continue; fi
  BIG=$W
  if [ "$H" -gt "$W" ]; then BIG=$H; fi
  if [ "$BIG" -gt "$MAX" ]; then
    sips -Z $MAX -s format jpeg -s formatOptions $Q "$f" --out "$f" >/dev/null 2>&1
  else
    sips -s format jpeg -s formatOptions $Q "$f" --out "$f" >/dev/null 2>&1
  fi
  COUNT=$((COUNT+1))
done < "$LIST"
echo "optimized $COUNT files"
