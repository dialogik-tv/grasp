#!/bin/bash

# Remove old data
rm -rf ../grasp-dist/css
rm -rf ../grasp-dist/js
rm ../grasp-dist/index.html

# Move dist folder to dist directory
mv dist/* ../grasp-dist/
