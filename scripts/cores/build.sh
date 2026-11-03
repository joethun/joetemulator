#!/usr/bin/env bash
# Rebuilds the EmulatorJS cores in public/cores from source, linking each one
# against the EmulatorJS RetroArch fork plus retroarch-memory-map.patch (adds
# the ejs_get_memory_map export read by src/lib/cheevos). The recipe is
# EmulatorJS/build's (build.sh + cores.json); Emscripten is 4.0.23, which is
# what that CI actually used for the stock cores (it is the only release with
# both `_poll_js` and the named preload-plugin functions; build_env.sh's
# 3.1.74 is not it).
#
# melondsds is not built here: it has its own recipe and toolchain, see
# https://github.com/joethun/melondsds.
#
# Usage:
#   scripts/cores/build.sh                 # all cores listed below
#   scripts/cores/build.sh fceumm gambatte # just these
#
# Each core builds the variants (normal / legacy / thread / thread-legacy) that
# public/cores already ships, and reuses core.json, license.txt and build.json
# from the shipped archive. A core that fails is reported at the end and the
# rest still get built and installed.
#
# Requires podman or docker; the build image (Containerfile) is created on
# first use. Replaced archives are backed up to
# scripts/cores/.build/backup/ before new ones are copied into public/cores.
set -euo pipefail

# Tips of each repo's default branch on 2026-11-02.
RETROARCH_REPO=https://github.com/EmulatorJS/RetroArch.git
RETROARCH_REF=97f2cfa65d01d57406e4ce9459242c8ada7c7e3b   # v1.22.2 branch

# name | repo | commit | buildpath | makefile | extra make args | builder
# builder is make unless noted: ppsspp runs the core's own emscripten script,
# cmake uses CMAKE_ARGS_<name> below.
CORES_TABLE='
81|https://github.com/EmulatorJS/81-libretro|86decf3ee61ea5803972948e80197bee8474796b|./|Makefile.libretro||make
a5200|https://github.com/EmulatorJS/a5200|ad6fa8cebc2698b23d0c60d4c975b4ea3a37e76a|./|Makefile||make
azahar|https://github.com/EmulatorJS/azahar|62cfcfb5e488f158f5f7ba83b725bb0ddd04da44|./|||cmake
beetle_vb|https://github.com/EmulatorJS/beetle-vb-libretro|f94d3e8f285a5ba1d011b224655f113c96a55235|./|Makefile||make
bsnes|https://github.com/EmulatorJS/bsnes-libretro|4b344745e3878e7c0675a60c624582935524b8f7|./|Makefile||make
cap32|https://github.com/EmulatorJS/libretro-cap32|c67cdf9ccd145c94ef9ca08d756ad4d1f040806a|./|Makefile||make
crocods|https://github.com/EmulatorJS/libretro-crocods|be00fb904da08d66221017f6708508298f17ff07|./|Makefile||make
desmume|https://github.com/EmulatorJS/desmume|c6317a446c3146ee30efe55a5c0763975a100ce7|./desmume/src/frontend/libretro|Makefile.libretro||make
desmume2015|https://github.com/EmulatorJS/desmume2015|b4ae0af744cf8f7895f3586ece449f876f3142e6|./desmume|Makefile.libretro||make
dosbox_pure|https://github.com/EmulatorJS/dosbox-pure|ef363f86d7ce7ff632064d969b891be2932dd767|./|Makefile||make
fbalpha2012_cps1|https://github.com/EmulatorJS/fbalpha2012_cps1|d6f5267a3abe8b079ed31d2ab3521911e6498372|./|makefile.libretro||make
fbalpha2012_cps2|https://github.com/EmulatorJS/fbalpha2012_cps2|3fb5b89d2ab719e45e814e1ad0b5ff721bffdff2|./|makefile.libretro||make
fbneo|https://github.com/EmulatorJS/FBNeo|d5f072e147cfd01cb7c095470fd9c5c2697753d8|./src/burner/libretro|Makefile||make
fceumm|https://github.com/EmulatorJS/libretro-fceumm|e1630de02074801eb96f3bc4ff33f69df9554c69|./|Makefile.libretro||make
freeintv|https://github.com/EmulatorJS/FreeIntv|d80fbad3922dc3d082410b5b379073614bec1842|./|Makefile||make
fuse|https://github.com/EmulatorJS/fuse-libretro|046de567db1f5169154afdad8a13272cd78e57b7|./|Makefile.libretro||make
gambatte|https://github.com/EmulatorJS/gambatte-libretro|c8c8bb71e0abeec34c753eab0e754e4cab61445a|./|Makefile.libretro||make
gearcoleco|https://github.com/EmulatorJS/Gearcoleco|5ee7ca213a491007ed82e411823fd0ccbe7614cd|./platforms/libretro/|Makefile||make
genesis_plus_gx|https://github.com/EmulatorJS/Genesis-Plus-GX|63f0c6870601c4bde3836519cb80d79b5798677f|./|Makefile.libretro||make
genesis_plus_gx_wide|https://github.com/EmulatorJS/Genesis-Plus-GX-Wide|275b7425d27e1a84deccfe74a1e278b96c6efcf6|./|Makefile.libretro||make
handy|https://github.com/EmulatorJS/libretro-handy|3559612a695cf54e0ba39f39327b643b0670b322|./|Makefile||make
mame2003|https://github.com/EmulatorJS/mame2003-libretro|d4d26b007b1be7887dc686d8e1198cad1094452d|./|Makefile||make
mame2003_plus|https://github.com/EmulatorJS/mame2003-plus-libretro|10d708576a7b42e347bf61aecdb6e87783be5d1d|./|Makefile||make
mednafen_ngp|https://github.com/EmulatorJS/beetle-ngp-libretro|10f91c135bb27ce23407fbb1fa2f072794da2fd7|./|Makefile||make
mednafen_pce|https://github.com/EmulatorJS/beetle-pce-libretro|a178f2f002b3ec58945061424cb412dcf18b87ce|./|Makefile||make
mednafen_pcfx|https://github.com/EmulatorJS/beetle-pcfx-libretro|b5170235dd6c93a3ad3827f142036f2c27e354bd|./|Makefile||make
mednafen_psx_hw|https://github.com/EmulatorJS/beetle-psx-libretro|779b8942761ae6a1d5857e480325ddaf80ed06d7|./|Makefile||make
mednafen_wswan|https://github.com/EmulatorJS/beetle-wswan-libretro|fbc945dc10f2ff730c739509fe414dfb2eb5c6ce|./|Makefile||make
melonds|https://github.com/EmulatorJS/melonDS|18a057d372783b42d7e297b8731f3c3d673cdcab|./|Makefile||make
mgba|https://github.com/EmulatorJS/mgba|db6592a591523ef9c45d129ed1ec792c71566d18|./|Makefile.libretro||make
mupen64plus_next|https://github.com/EmulatorJS/mupen64plus-libretro-nx|4a3925d2861f17719586dffb178c1dd5339d3a68|./|Makefile||make
nestopia|https://github.com/EmulatorJS/nestopia|c6911d40e3bfe15c7de6eded4dfcff8f9055fc17|./libretro|Makefile||make
opera|https://github.com/EmulatorJS/opera-libretro|e96e6292659b266bb6dbca69835aad069e83906e|./|Makefile||make
parallel_n64|https://github.com/EmulatorJS/parallel-n64|917b47be676d1b34e2a8dd6409188a52e2fb7265|./|Makefile||make
pcsx_rearmed|https://github.com/EmulatorJS/pcsx_rearmed|588e1338f85a5867e46245f861e3d5958e7a4592|./|Makefile.libretro||make
picodrive|https://github.com/EmulatorJS/picodrive|c38cb8a0d9099d9c5a120af17d20f5e762209bfd|./|Makefile.libretro||make
ppsspp|https://github.com/EmulatorJS/ppsspp|fa917ebd212e083912d742c830eecb242b6a98ae|./|||ppsspp
prboom|https://github.com/EmulatorJS/libretro-prboom|bf377c6efc630a452d38dc331fdf1cc1a42f18d5|./|Makefile||make
prosystem|https://github.com/EmulatorJS/prosystem-libretro|f73c953c02e104b384ae842344e4a3f25e5e5067|./|Makefile||make
puae|https://github.com/EmulatorJS/libretro-uae|063af5822129135c51b42c50522b71c8a01797dc|./|Makefile||make
same_cdi|https://github.com/EmulatorJS/same_cdi|cfb05d803f54130adf94efef88edd816d01df7a3|./|Makefile.libretro||make
smsplus|https://github.com/EmulatorJS/smsplus-gx|c642bbd0680b5959180a420036108893d0aec961|./|Makefile.libretro||make
snes9x|https://github.com/EmulatorJS/snes9x|2d4cce69f4fe1c53a2c1423cdc06f2dea8b870a1|./libretro|Makefile||make
stella2014|https://github.com/EmulatorJS/stella2014-libretro|1f578c36382bb5a86a0fe245973fa557f369738b|./|Makefile||make
vice_x128|https://github.com/EmulatorJS/vice-libretro|1b4309f4d56ded7bfc5ad7ba8d5a9a44ac3388a8|./|Makefile|EMUTYPE=x128|make
vice_x64|https://github.com/EmulatorJS/vice-libretro|1b4309f4d56ded7bfc5ad7ba8d5a9a44ac3388a8|./|Makefile|EMUTYPE=x64|make
vice_x64sc|https://github.com/EmulatorJS/vice-libretro|1b4309f4d56ded7bfc5ad7ba8d5a9a44ac3388a8|./|Makefile|EMUTYPE=x64sc|make
vice_xpet|https://github.com/EmulatorJS/vice-libretro|1b4309f4d56ded7bfc5ad7ba8d5a9a44ac3388a8|./|Makefile|EMUTYPE=xpet|make
vice_xplus4|https://github.com/EmulatorJS/vice-libretro|1b4309f4d56ded7bfc5ad7ba8d5a9a44ac3388a8|./|Makefile|EMUTYPE=xplus4|make
vice_xvic|https://github.com/EmulatorJS/vice-libretro|1b4309f4d56ded7bfc5ad7ba8d5a9a44ac3388a8|./|Makefile|EMUTYPE=xvic|make
virtualjaguar|https://github.com/EmulatorJS/virtualjaguar-libretro|2279c72953b1ebdc6b2473be0abf48fe09a0f2a4|./|Makefile||make
yabause|https://github.com/EmulatorJS/yabause|7b612a6b63dc61f8a8d197e548c95846abace03c|./yabause/src/libretro|Makefile||make
'

# As in EmulatorJS/build's cores.json.
CMAKE_ARGS_azahar=(-DCMAKE_BUILD_TYPE=Release
  "-DCMAKE_CXX_FLAGS=-pthread -msimd128" "-DCMAKE_C_FLAGS=-pthread -msimd128"
  -DENABLE_LIBRETRO=ON -DENABLE_QT=OFF -DENABLE_SDL2=OFF -DENABLE_TESTS=OFF
  -DENABLE_CUBEB=OFF -DENABLE_OPENAL=OFF -DENABLE_VULKAN=OFF -DENABLE_LIBUSB=OFF
  -DENABLE_SCRIPTING=OFF -DENABLE_WEB_SERVICE=OFF -DENABLE_SOFTWARE_RENDERER=OFF
  -DENABLE_GENERIC=ON)
CMAKE_EXCLUDES="libCatch2.a libCatch2Main.a libCatch2WithMain.a libgtest.a libgtest_main.a libgmock.a libgmock_main.a"

EMSDK_VERSION="${EMSDK_VERSION:-4.0.23}"
HERE="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(cd "$HERE/../.." && pwd)"
WORK="${WORK:-$HERE/.build}"
# Tagged by Containerfile contents so a changed recipe gets a fresh image.
IMAGE="${IMAGE:-localhost/joetemulator-cores:$EMSDK_VERSION-$(sha256sum "$HERE/Containerfile" | cut -c1-8)}"

# Make flags for a core build variant, build-emulatorjs.sh flags for its link,
# and the archive suffix it produces.
variant_flags() {
  case $1 in
    normal)        flags="";                                        ra="--clean";                    suffix="wasm.data" ;;
    legacy)        flags="EMULATORJS_LEGACY=1";                     ra="--clean --legacy";           suffix="legacy-wasm.data" ;;
    threads)       flags="EMULATORJS_THREADS=1";                    ra="--clean --threads";          suffix="thread-wasm.data" ;;
    legacyThreads) flags="EMULATORJS_THREADS=1 EMULATORJS_LEGACY=1"; ra="--clean --threads --legacy"; suffix="thread-legacy-wasm.data" ;;
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

  # Builds one core's bitcode for each variant into $STAGE/$name/<variant>/.
  build_core() {
    case $builder in
      make)
        # Same make invocation as EmulatorJS/build's build.sh.
        args="INITIAL_HEAP=268435456 AUTO_MEMORY_GROWTH=1 $extra"
        for v in $variants; do
          variant_flags "$v"
          echo "    bitcode ($v)"
          (
            cd "$src/$buildpath"
            rm -f ./*.bc
            emmake make -f "$makefile" clean $args >/dev/null 2>&1 || true
            # shellcheck disable=SC2086
            emmake make -j"$JOBS" -f "$makefile" platform=emscripten $flags $args
            mv ./*.bc "$STAGE/$name/$v/"
          ) >"$LOGS/$name-$v-core.log" 2>&1 || { echo "!! core build failed: $LOGS/$name-$v-core.log" >&2; return 1; }
        done
        ;;
      ppsspp)
        # The core's script builds ffmpeg too; RetroArch links ffmpeg/*.a for ppsspp.
        echo "    bitcode (threads)"
        (
          cd "$src"
          rm -rf libretro/emscripten/build "$RA/ffmpeg"
          bash libretro/emscripten/build_emscripten.sh
          cp -r libretro/emscripten/build "$RA/ffmpeg"
          mv libretro/emscripten/build/*.bc "$STAGE/$name/threads/"
          rm -f "$OUT/ppsspp-assets.zip"
          (cd assets && zip -qr "$OUT/ppsspp-assets.zip" ./*)
        ) >"$LOGS/$name-threads-core.log" 2>&1 || { echo "!! core build failed: $LOGS/$name-threads-core.log" >&2; return 1; }
        ;;
      cmake)
        echo "    bitcode (threads)"
        local -n cmake_args="CMAKE_ARGS_$name"
        (
          cd "$src"
          rm -rf build-emscripten && mkdir build-emscripten && cd build-emscripten
          emcmake cmake .. "${cmake_args[@]}"
          emmake make -j"$JOBS"
          {
            echo "create ${name}_libretro_emscripten.a"
            find . -name '*.a' -not -path './CMakeFiles/*' | sort | while read -r a; do
              case " $CMAKE_EXCLUDES " in *" ${a##*/} "*) continue ;; esac
              echo "addlib ${a#./}"
            done
            echo "save"
            echo "end"
          } > merge.mri
          emar -M < merge.mri
          mv "${name}_libretro_emscripten.a" "$STAGE/$name/threads/${name}_libretro_emscripten.bc"
        ) >"$LOGS/$name-threads-core.log" 2>&1 || { echo "!! core build failed: $LOGS/$name-threads-core.log" >&2; return 1; }
        ;;
    esac
  }

  # Links each staged variant with RetroArch (one clean build per variant, as
  # upstream), then packs in the metadata from the stock archive (core.json
  # keeps the frontend's pinned core options; build.json/license are unchanged).
  link_core() {
    rm -f /work/EmulatorJS/data/cores/"$name"-*wasm.data
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
      ) >"$LOGS/$name-$v-link.log" 2>&1 || { echo "!! link failed: $LOGS/$name-$v-link.log" >&2; return 1; }

      base="$name-$suffix"
      f="/work/EmulatorJS/data/cores/$base"
      [ -f "$f" ] || { echo "!! link produced no $base" >&2; return 1; }
      meta="$(mktemp -d)"
      (cd "$meta" && 7z x -y "/stock/$base" core.json license.txt build.json >/dev/null) || true
      (cd "$meta" && 7z a -t7z "$f" ./* >/dev/null)
      rm -rf "$meta"
      mv "$f" "$OUT/$base"
      echo "    packed $base"
    done
  }

  failed=()
  for want in "$@"; do
    row="$(printf '%s\n' "$CORES_TABLE" | awk -F'|' -v n="$want" '$1 == n')"
    [ -n "$row" ] || { echo "unknown core: $want" >&2; failed+=("$want"); continue; }
    IFS='|' read -r name repo commit buildpath makefile extra builder <<<"$row"
    src="/work/src/$(basename "$repo")"

    # Build the variants public/cores ships for this core.
    variants=""
    for v in normal legacy threads legacyThreads; do
      variant_flags "$v"
      [ -f "/stock/$name-$suffix" ] && variants="$variants $v"
    done
    [ -n "$variants" ] || { echo "!! $name: no archive in public/cores to replace" >&2; failed+=("$name"); continue; }

    echo "==> $name @ ${commit:0:10} ($builder:$variants)"
    if ! {
      { [ -d "$src/.git" ] || git clone --quiet "$repo" "$src"; } &&
      { git -C "$src" fetch --quiet origin || true; } &&
      git -C "$src" checkout --quiet -f "$commit" &&
      git -C "$src" clean -fdxq &&
      # Not fatal, as in EmulatorJS/build: mupen64plus_next has a nested
      # submodule (lightning/gnulib) with no URL that it builds fine without.
      { git -C "$src" submodule update --quiet --init --recursive --force ||
        echo "warning: submodule update failed, continuing"; }
    } >"$LOGS/$name-checkout.log" 2>&1; then
      echo "!! checkout failed: $LOGS/$name-checkout.log" >&2; failed+=("$name"); continue
    fi

    rm -rf "${STAGE:?}/$name"
    for v in $variants; do mkdir -p "$STAGE/$name/$v"; done
    build_core && link_core || failed+=("$name")
  done

  if [ ${#failed[@]} -gt 0 ]; then
    echo "!! failed: ${failed[*]}" >&2
    exit 1
  fi
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
rm -f "$WORK/out/"*.data "$WORK/out/"*.zip

status=0
"$ENGINE" run --rm \
  -v "$WORK:/work:Z" \
  -v "$HERE:/patches:ro,Z" \
  -v "$ROOT/public/cores:/stock:ro,Z" \
  -w /work "$IMAGE" bash /patches/build.sh --inside "$@" || status=$?

echo "==> installing into public/cores"
for f in "$WORK/out/"*.data "$WORK/out/"*.zip; do
  [ -f "$f" ] || continue
  base="$(basename "$f")"
  if [ -f "$ROOT/public/cores/$base" ] && [ ! -f "$WORK/backup/$base" ]; then
    cp "$ROOT/public/cores/$base" "$WORK/backup/$base"
  fi
  cp "$f" "$ROOT/public/cores/$base"
  echo "    $base"
done
exit "$status"
