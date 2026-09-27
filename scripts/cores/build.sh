#!/usr/bin/env bash
# Rebuilds the EmulatorJS cores whose RetroAchievements support depends on the
# core's memory map, linking them against the EmulatorJS RetroArch fork plus
# retroarch-memory-map.patch (adds the ejs_get_memory_map export read by
# src/lib/cheevos). Everything else about each core matches the stock builds
# in public/cores: same core commits, same RetroArch commit, same recipe as
# EmulatorJS/build (build.json 2.0.2), same Emscripten (4.0.23 — identified
# from the stock glue: it is the only release with both `_poll_js` and the
# named preload-plugin functions; build_env.sh's 3.1.74 is not what CI used).
# A rebuilt core's JS glue differs from stock only by the new export.
#
# Usage:
#   scripts/cores/build.sh                 # all cores listed below
#   scripts/cores/build.sh fceumm gambatte # just these
#
# Requires podman or docker; the build image (Containerfile) is created on
# first use. Replaced archives are backed up to
# scripts/cores/.build/backup/ before new ones are copied into public/cores.
set -euo pipefail

# Stock cores were built 2026-05-16 from these commits (the last commit
# before each core's build time recorded in the shipped archives).
RETROARCH_REPO=https://github.com/EmulatorJS/RetroArch.git
RETROARCH_REF=5a21e08a5de7649cfa6416d6843c0c40de27714e   # v1.22.2, 2026-05-16

# name | repo | commit | buildpath | makefile | extra make args | threads only
CORES_TABLE='
fceumm|https://github.com/EmulatorJS/libretro-fceumm|e1630de02074801eb96f3bc4ff33f69df9554c69|./|Makefile.libretro||0
gambatte|https://github.com/EmulatorJS/gambatte-libretro|c8c8bb71e0abeec34c753eab0e754e4cab61445a|./|Makefile.libretro||0
mgba|https://github.com/EmulatorJS/mgba|db6592a591523ef9c45d129ed1ec792c71566d18|./|Makefile.libretro||0
genesis_plus_gx|https://github.com/EmulatorJS/Genesis-Plus-GX|63f0c6870601c4bde3836519cb80d79b5798677f|./|Makefile.libretro||0
picodrive|https://github.com/EmulatorJS/picodrive|c38cb8a0d9099d9c5a120af17d20f5e762209bfd|./|Makefile.libretro||0
smsplus|https://github.com/EmulatorJS/smsplus-gx|c642bbd0680b5959180a420036108893d0aec961|./|Makefile.libretro||0
yabause|https://github.com/EmulatorJS/yabause|7b612a6b63dc61f8a8d197e548c95846abace03c|./yabause/src/libretro|Makefile||0
pcsx_rearmed|https://github.com/EmulatorJS/pcsx_rearmed|588e1338f85a5867e46245f861e3d5958e7a4592|./|Makefile.libretro||0
gearcoleco|https://github.com/EmulatorJS/Gearcoleco|5ee7ca213a491007ed82e411823fd0ccbe7614cd|./platforms/libretro/|Makefile||0
puae|https://github.com/EmulatorJS/libretro-uae|063af5822129135c51b42c50522b71c8a01797dc|./|Makefile||0
dosbox_pure|https://github.com/EmulatorJS/dosbox-pure|ef363f86d7ce7ff632064d969b891be2932dd767|./|Makefile||1
vice_x64|https://github.com/EmulatorJS/vice-libretro|1b4309f4d56ded7bfc5ad7ba8d5a9a44ac3388a8|./|Makefile|EMUTYPE=x64|0
vice_xvic|https://github.com/EmulatorJS/vice-libretro|1b4309f4d56ded7bfc5ad7ba8d5a9a44ac3388a8|./|Makefile|EMUTYPE=xvic|0
'

EMSDK_VERSION="${EMSDK_VERSION:-4.0.23}"
IMAGE="${IMAGE:-localhost/joetemulator-cores:$EMSDK_VERSION}"
HERE="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(cd "$HERE/../.." && pwd)"
WORK="${WORK:-$HERE/.build}"

# Make flags for a core build variant, and build-emulatorjs.sh flags for its link.
variant_flags() {
  case $1 in
    normal)        flags="";                                        ra="--clean" ;;
    legacy)        flags="EMULATORJS_LEGACY=1";                     ra="--clean --legacy" ;;
    threads)       flags="EMULATORJS_THREADS=1";                    ra="--clean --threads" ;;
    legacyThreads) flags="EMULATORJS_THREADS=1 EMULATORJS_LEGACY=1"; ra="--clean --threads --legacy" ;;
  esac
}

# ── inside the container ─────────────────────────────────────────────────────
if [ "${1:-}" = "--inside" ]; then
  shift
  JOBS="$(nproc)"
  RA=/work/RetroArch
  STAGE=/work/stage
  OUT=/work/out
  LOGS=/work/logs
  mkdir -p "$STAGE" "$OUT" "$LOGS" /work/src

  echo "==> RetroArch @ ${RETROARCH_REF:0:10} + memory-map patch"
  [ -d "$RA/.git" ] || git clone --quiet --filter=blob:none "$RETROARCH_REPO" "$RA"
  git -C "$RA" fetch --quiet origin
  git -C "$RA" checkout --quiet -f "$RETROARCH_REF"
  git -C "$RA" clean -fdxq
  git -C "$RA" apply /patches/retroarch-memory-map.patch

  for want in "$@"; do
    row="$(printf '%s\n' "$CORES_TABLE" | awk -F'|' -v n="$want" '$1 == n')"
    [ -n "$row" ] || { echo "unknown core: $want" >&2; exit 1; }
    IFS='|' read -r name repo commit buildpath makefile extra threads_only <<<"$row"
    src="/work/src/$(basename "$repo")"

    echo "==> $name @ ${commit:0:10}"
    [ -d "$src/.git" ] || git clone --quiet "$repo" "$src"
    git -C "$src" fetch --quiet origin || true
    git -C "$src" checkout --quiet -f "$commit"
    git -C "$src" submodule update --quiet --init --recursive

    # Same make invocation as EmulatorJS/build's build.sh.
    args="INITIAL_HEAP=268435456 AUTO_MEMORY_GROWTH=1 $extra"
    # Thread-only cores still get a legacy (WebGL1) thread build, as upstream.
    variants="threads legacyThreads"
    [ "$threads_only" = 1 ] || variants="normal legacy threads legacyThreads"
    for v in $variants; do
      variant_flags "$v"
      echo "    bitcode ($v)"
      mkdir -p "$STAGE/$name/$v"
      (
        cd "$src/$buildpath"
        rm -f ./*.bc
        emmake make -f "$makefile" clean $args >/dev/null 2>&1 || true
        # shellcheck disable=SC2086
        emmake make -j"$JOBS" -f "$makefile" platform=emscripten $flags $args
        mv ./*.bc "$STAGE/$name/$v/"
      ) >"$LOGS/$name-$v-core.log" 2>&1 || { echo "!! core build failed: $LOGS/$name-$v-core.log" >&2; exit 1; }
    done

    # Link each variant with RetroArch (one clean build per variant, as upstream).
    for v in $variants; do
      variant_flags "$v"
      echo "    link ($v)"
      (
        cd "$RA/emulatorjs"
        rm -f ./*.bc
        cp "$STAGE/$name/$v/"*.bc ./
        # shellcheck disable=SC2086
        emmake ./build-emulatorjs.sh $ra
        rm -f ./*.bc
      ) >"$LOGS/$name-$v-link.log" 2>&1 || { echo "!! link failed: $LOGS/$name-$v-link.log" >&2; exit 1; }
    done

    # Package: add the metadata from the stock archive (core.json keeps the
    # frontend's pinned core options; build.json/license are unchanged).
    for f in /work/EmulatorJS/data/cores/"$name"-*wasm.data; do
      [ -f "$f" ] || continue
      base="$(basename "$f")"
      stock="/stock/$base"
      [ -f "$stock" ] || { echo "!! no stock archive for $base" >&2; exit 1; }
      meta="$(mktemp -d)"
      (cd "$meta" && 7z x -y "$stock" core.json license.txt build.json >/dev/null) || true
      (cd "$meta" && 7z a -t7z "$f" ./* >/dev/null)
      rm -rf "$meta"
      mv "$f" "$OUT/$base"
      echo "    packed $base"
    done
  done
  exit 0
fi

# ── host ─────────────────────────────────────────────────────────────────────
ENGINE="$(command -v podman || command -v docker || true)"
[ -n "$ENGINE" ] || { echo "podman or docker is required" >&2; exit 1; }

if ! "$ENGINE" image inspect "$IMAGE" >/dev/null 2>&1; then
  echo "==> building $IMAGE"
  "$ENGINE" build -t "$IMAGE" --build-arg EMSDK_VERSION="$EMSDK_VERSION" -f "$HERE/Containerfile" "$HERE"
fi

if [ $# -eq 0 ]; then
  set -- $(printf '%s\n' "$CORES_TABLE" | awk -F'|' 'NF > 1 {print $1}')
fi

mkdir -p "$WORK/out" "$WORK/backup"
rm -f "$WORK/out/"*.data

"$ENGINE" run --rm \
  -v "$WORK:/work:Z" \
  -v "$HERE:/patches:ro,Z" \
  -v "$ROOT/public/cores:/stock:ro,Z" \
  -w /work "$IMAGE" bash /patches/build.sh --inside "$@"

echo "==> installing into public/cores"
for f in "$WORK/out/"*.data; do
  base="$(basename "$f")"
  if [ -f "$ROOT/public/cores/$base" ] && [ ! -f "$WORK/backup/$base" ]; then
    cp "$ROOT/public/cores/$base" "$WORK/backup/$base"
  fi
  cp "$f" "$ROOT/public/cores/$base"
  echo "    $base"
done
