#!/bin/bash
REPO_URL="https://github.com/NguetchuissiBrunel/navigoo-map-components"
BRANCH="main"
DEST_DIR="node_modules/@navigoo/map-components"

echo "Cloning navigoo-map-components from $REPO_URL..."
git clone -b $BRANCH $REPO_URL $DEST_DIR
cd $DEST_DIR
echo "Installing dependencies..."
npm install
echo "Building the library..."
npm run build
echo "Installation complete!"