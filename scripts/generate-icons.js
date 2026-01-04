#!/usr/bin/env node

/**
 * Generates PWA icons from base SVG
 * Run: node scripts/generate-icons.js
 */

const fs = require('fs').promises
const path = require('path')
const sharp = require('sharp')

const BASE_SVG = path.join(__dirname, '../public/icon.svg')
const OUTPUT_DIR = path.join(__dirname, '../public')

const SIZES = [72, 96, 128, 144, 152, 192, 384, 512]
const MASKABLE_SIZES = [192, 512]

async function generateIcons() {
  try {
    console.log('🎨 Generating PWA icons...\n')

    // Read SVG
    const svgBuffer = await fs.readFile(BASE_SVG)

    // Generate standard icons
    for (const size of SIZES) {
      const outputPath = path.join(OUTPUT_DIR, `icon-${size}x${size}.png`)
      await sharp(svgBuffer)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 22, g: 163, b: 74, alpha: 1 },
        })
        .png()
        .toFile(outputPath)
      console.log(`✅ Generated icon-${size}x${size}.png`)
    }

    // Generate maskable icons (with padding for safe area)
    for (const size of MASKABLE_SIZES) {
      const outputPath = path.join(OUTPUT_DIR, `icon-maskable-${size}x${size}.png`)

      // Maskable icons need 40% padding (safe area)
      const iconSize = Math.round(size * 0.6)
      const padding = Math.round((size - iconSize) / 2)

      await sharp(svgBuffer)
        .resize(iconSize, iconSize, {
          fit: 'contain',
          background: { r: 22, g: 163, b: 74, alpha: 0 },
        })
        .extend({
          top: padding,
          bottom: padding,
          left: padding,
          right: padding,
          background: { r: 22, g: 163, b: 74, alpha: 1 },
        })
        .png()
        .toFile(outputPath)
      console.log(`✅ Generated icon-maskable-${size}x${size}.png`)
    }

    console.log('\n✨ Done! All PWA icons generated successfully.')
  } catch (error) {
    console.error('❌ Error generating icons:', error.message)
    process.exit(1)
  }
}

generateIcons()
