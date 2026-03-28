#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_DIR="$(dirname "$SCRIPT_DIR")"
APP_BUNDLE="/Applications/NodeWatcher.app/Contents/MacOS/NodeTrackerApp"

echo "Cleaning build cache..."
cd "$REPO_DIR"
swift package clean

echo "Building release..."
swift build -c release

echo "Installing..."
pkill NodeTrackerApp 2>/dev/null || true
sleep 1
cp .build/release/NodeTrackerApp "$APP_BUNDLE"
open /Applications/NodeWatcher.app

echo "Done."
