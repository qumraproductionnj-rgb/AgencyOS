'use strict'

// Generates a simple PNG icon using pure Node.js (no canvas dependency)
// Creates a minimal valid 1x1 PNG as placeholder — replace with real icons before release

const fs = require('fs')
const path = require('path')

// Minimal 1x1 transparent PNG (valid PNG file)
// In production, replace with real 1024x1024 icon
const PLACEHOLDER_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  'base64',
)

const assetsDir = path.join(__dirname, '..', 'assets')
if (!fs.existsSync(assetsDir)) fs.mkdirSync(assetsDir, { recursive: true })

const files = ['icon.png', 'tray-icon.png']
for (const file of files) {
  const dest = path.join(assetsDir, file)
  if (!fs.existsSync(dest)) {
    fs.writeFileSync(dest, PLACEHOLDER_PNG)
    console.log('Created placeholder:', file)
  } else {
    console.log('Already exists:', file)
  }
}

console.log('Done. Replace assets/ with real icons before building.')
