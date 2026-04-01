#!/usr/bin/env bash
set -euo pipefail

if [ "$#" -ne 2 ]; then
  echo "Usage: $0 <Portpourri.app|Portpourri-*.zip> <expected-version>" >&2
  exit 64
fi

TARGET="$1"
EXPECTED_VERSION="$2"
TEMP_DIR=""

cleanup() {
  if [ -n "$TEMP_DIR" ] && [ -d "$TEMP_DIR" ]; then
    rm -rf "$TEMP_DIR"
  fi
}
trap cleanup EXIT

if [ -d "$TARGET" ]; then
  APP_DIR="$TARGET"
elif [ -f "$TARGET" ]; then
  TEMP_DIR="$(mktemp -d)"
  ditto -x -k "$TARGET" "$TEMP_DIR"
  APP_DIR="$TEMP_DIR/Portpourri.app"
else
  echo "Target not found: $TARGET" >&2
  exit 66
fi

INFO_PLIST="$APP_DIR/Contents/Info.plist"
if [ ! -f "$INFO_PLIST" ]; then
  echo "Info.plist not found inside $APP_DIR" >&2
  exit 66
fi

read_plist() {
  /usr/libexec/PlistBuddy -c "Print :$1" "$INFO_PLIST"
}

SHORT_VERSION="$(read_plist CFBundleShortVersionString)"
BUILD_VERSION="$(read_plist CFBundleVersion)"
BUNDLE_NAME="$(read_plist CFBundleName)"
EXECUTABLE_NAME="$(read_plist CFBundleExecutable)"
LS_UI_ELEMENT="$(read_plist LSUIElement)"
BUILD_TIMESTAMP="$(read_plist NWBuildTimestamp)"

if [ "$SHORT_VERSION" != "$EXPECTED_VERSION" ]; then
  echo "CFBundleShortVersionString mismatch: expected $EXPECTED_VERSION, got $SHORT_VERSION" >&2
  exit 65
fi

if [ "$BUILD_VERSION" != "$EXPECTED_VERSION" ]; then
  echo "CFBundleVersion mismatch: expected $EXPECTED_VERSION, got $BUILD_VERSION" >&2
  exit 65
fi

if [ "$BUNDLE_NAME" != "Portpourri" ]; then
  echo "CFBundleName mismatch: expected Portpourri, got $BUNDLE_NAME" >&2
  exit 65
fi

if [ "$EXECUTABLE_NAME" != "PortpourriApp" ]; then
  echo "CFBundleExecutable mismatch: expected PortpourriApp, got $EXECUTABLE_NAME" >&2
  exit 65
fi

if [ "$LS_UI_ELEMENT" != "true" ]; then
  echo "LSUIElement mismatch: expected true, got $LS_UI_ELEMENT" >&2
  exit 65
fi

echo "Verified bundle:"
echo "  path: $APP_DIR"
echo "  version: $SHORT_VERSION"
echo "  build: $BUILD_VERSION"
echo "  bundle: $BUNDLE_NAME"
echo "  executable: $EXECUTABLE_NAME"
echo "  LSUIElement: $LS_UI_ELEMENT"
echo "  build timestamp: $BUILD_TIMESTAMP"
