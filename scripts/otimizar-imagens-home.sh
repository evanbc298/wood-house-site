#!/bin/bash
# Comprime/redimensiona as imagens referenciadas em construtora.html.
# PNGs fotograficos -> JPEG (max 1600px largura, qualidade 82).
# JPEGs -> recomprime no mesmo formato (max 1600px largura, qualidade 82).
# Logos (transparencia) -> mantem PNG, so redimensiona (max 800px largura).
set -e
cd "$(dirname "$0")/.."
SITE="saidas/site"
LIST="/tmp/imgs.txt"
RENAMES="/tmp/png_to_jpg_renames.txt"
> "$RENAMES"

while read -r rel; do
  f="$SITE/$rel"
  if [ ! -f "$f" ]; then
    echo "AUSENTE: $f"
    continue
  fi
  case "$rel" in
    *logo*.png)
      tmp="$f.opt.png"
      ffmpeg -y -loglevel error -i "$f" -vf "scale='min(800,iw)':-1" -compression_level 9 "$tmp"
      mv "$tmp" "$f"
      echo "LOGO   $rel"
      ;;
    *.png)
      newrel="${rel%.png}.jpg"
      newf="$SITE/$newrel"
      ffmpeg -y -loglevel error -i "$f" -vf "scale='min(1600,iw)':-1" -q:v 4 "$newf"
      echo "$rel|$newrel" >> "$RENAMES"
      echo "PNG->JPG  $rel -> $newrel"
      ;;
    *.jpg|*.jpeg)
      tmp="$f.opt.jpg"
      ffmpeg -y -loglevel error -i "$f" -vf "scale='min(1600,iw)':-1" -q:v 4 "$tmp"
      mv "$tmp" "$f"
      echo "JPG    $rel"
      ;;
  esac
done < "$LIST"

echo "Done. Renames logged in $RENAMES"
