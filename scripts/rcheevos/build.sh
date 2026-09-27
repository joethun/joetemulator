#!/usr/bin/env bash
# Builds public/lib/rcheevos.{js,wasm} — rcheevos' rc_client + rhash compiled
# to a standalone wasm module, bridged to TypeScript by rcw.c.
#
# Requires podman or docker (uses the official emsdk image). Usage:
#   scripts/rcheevos/build.sh
#
# RCHEEVOS_REF pins the upstream release. Bumping it can change the C API
# (e.g. develop renames softcore→casual, unofficial→unpromoted), so rebuild
# and re-test rcw.c when you do.
set -euo pipefail

RCHEEVOS_REF="${RCHEEVOS_REF:-v12.5.0}"
EMSDK_IMAGE="${EMSDK_IMAGE:-docker.io/emscripten/emsdk:4.0.12}"
# CHD support for disc hashing, compiled via its unity.c amalgamation (which
# at this commit omits the A/V Huffman codec, so that file is added separately).
LIBCHDR_REF="${LIBCHDR_REF:-607694ca0812edfc9cc2030c64634fc2393668de}"
# rc_libretro.c needs libretro.h; pin it to the RetroArch release the cores track.
LIBRETRO_H_URL="${LIBRETRO_H_URL:-https://raw.githubusercontent.com/libretro/RetroArch/v1.22.2/libretro-common/include/libretro.h}"

HERE="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(cd "$HERE/../.." && pwd)"
WORK="${WORK:-$HERE/.build}"
OUT="$ROOT/public/lib"

ENGINE="$(command -v podman || command -v docker || true)"
[ -n "$ENGINE" ] || { echo "podman or docker is required" >&2; exit 1; }

mkdir -p "$WORK"
if [ ! -d "$WORK/rcheevos/.git" ]; then
  git clone --quiet https://github.com/RetroAchievements/rcheevos.git "$WORK/rcheevos"
fi
git -C "$WORK/rcheevos" fetch --quiet --tags origin
git -C "$WORK/rcheevos" checkout --quiet "$RCHEEVOS_REF"
if [ ! -d "$WORK/libchdr/.git" ]; then
  git clone --quiet https://github.com/rtissera/libchdr.git "$WORK/libchdr"
fi
git -C "$WORK/libchdr" fetch --quiet origin
git -C "$WORK/libchdr" checkout --quiet "$LIBCHDR_REF"
cp "$HERE/rcw.c" "$HERE/rcw_chd.c" "$WORK/"
mkdir -p "$WORK/include"
[ -f "$WORK/include/libretro.h" ] || curl -fsSL "$LIBRETRO_H_URL" -o "$WORK/include/libretro.h"

EXPORTS='["_malloc","_free"]'
RUNTIME='["UTF8ToString","stringToNewUTF8","HEAPU8"]'

# The sources are globbed inside the container, so run emcc through a shell.
"$ENGINE" run --rm -v "$WORK:/src:Z" -v "$OUT:/out:Z" -w /src \
  -e EXPORTS="$EXPORTS" -e RUNTIME="$RUNTIME" "$EMSDK_IMAGE" bash -c '
  emcc -O3 -flto \
    -DRC_NO_THREADS -DRC_CLIENT_SUPPORTS_HASH -DRC_HASH_NO_ENCRYPTED \
    -Iinclude -Ircheevos/include -Ircheevos/src -Ircheevos/src/rcheevos \
    -Ilibchdr/include -Ilibchdr/deps/lzma-26.02/include -Ilibchdr/deps/miniz-3.1.2 -Ilibchdr/deps/zstd-1.5.7 \
    -DWANT_RAW_DATA_SECTOR=1 -DWANT_SUBCODE=1 -DVERIFY_BLOCK_CRC=1 -DLOWRAM_TARGET=0 -DZ7_ST \
    rcw.c rcw_chd.c libchdr/unity.c libchdr/src/libchdr_codec_avhuff.c \
    rcheevos/src/rc_client.c rcheevos/src/rc_libretro.c rcheevos/src/rc_compat.c rcheevos/src/rc_util.c rcheevos/src/rc_version.c \
    rcheevos/src/rcheevos/*.c \
    rcheevos/src/rapi/*.c \
    rcheevos/src/rhash/md5.c rcheevos/src/rhash/hash.c rcheevos/src/rhash/hash_rom.c \
    rcheevos/src/rhash/hash_disc.c rcheevos/src/rhash/cdreader.c rcheevos/src/rhash/hash_zip.c \
    -sMODULARIZE=1 -sEXPORT_NAME=RcheevosModule -sENVIRONMENT=web \
    -sALLOW_MEMORY_GROWTH=1 -sFILESYSTEM=0 \
    -sEXPORTED_FUNCTIONS="$EXPORTS" -sEXPORTED_RUNTIME_METHODS="$RUNTIME" \
    -o /out/rcheevos.js
'

echo "built $OUT/rcheevos.js ($(git -C "$WORK/rcheevos" describe --tags))"
