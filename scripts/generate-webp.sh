#!/bin/bash

# Script to generate WebP versions of images
# Requires: brew install webp (on macOS) or apt-get install webp (on Linux)

echo "🖼️  Generating WebP versions for missing images..."

# Change to the project root directory
cd "$(dirname "$0")/.." || exit

# Function to convert image to WebP
convert_to_webp() {
    local input_file="$1"
    local output_file="${input_file%.*}.webp"
    
    if [ ! -f "$output_file" ]; then
        echo "Converting: $input_file → $output_file"
        cwebp -q 85 "$input_file" -o "$output_file"
    else
        echo "Skipping: $output_file already exists"
    fi
}

# Convert hero images in public/images
echo -e "\n📁 Processing hero images..."
for img in public/images/hero-*.{jpg,jpeg,png}; do
    if [ -f "$img" ]; then
        convert_to_webp "$img"
    fi
done

# Convert lovable-uploads images
echo -e "\n📁 Processing lovable-uploads images..."
for img in public/lovable-uploads/*.{jpg,jpeg,png}; do
    if [ -f "$img" ]; then
        convert_to_webp "$img"
    fi
done

# Convert other images
echo -e "\n📁 Processing other images..."
for img in public/images/{logo,text-logo}.png; do
    if [ -f "$img" ]; then
        convert_to_webp "$img"
    fi
done

echo -e "\n✅ WebP generation complete!"
echo "Note: Make sure you have 'webp' installed (brew install webp on macOS)"