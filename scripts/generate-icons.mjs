import sharp from 'sharp'
import { mkdir } from 'fs/promises'
import { existsSync } from 'fs'

const iconsDir = 'public/icons'

if (!existsSync(iconsDir)) {
  await mkdir(iconsDir, { recursive: true })
}

// SVG 512x512: fundo roxo com cantos arredondados + gamepad centralizado
// Gamepad original: x 3..31, y 13..23. Scale=11 centra perfeitamente em 512x512.
const svg = Buffer.from(`<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" rx="112" fill="#4F46E5"/>
  <g transform="translate(69, 58) scale(11)">
    <path d="M7 13 C5 13 3 15 3 17 C3 20 5 23 8 23 L10 23 L12 20 L22 20 L24 23 L26 23 C29 23 31 20 31 17 C31 15 29 13 27 13 Z" fill="#E0E7FF"/>
    <rect x="8" y="15.5" width="6" height="2" rx="1" fill="#4F46E5"/>
    <rect x="10" y="13.5" width="2" height="6" rx="1" fill="#4F46E5"/>
    <circle cx="23" cy="15" r="1.5" fill="#F59E0B"/>
    <circle cx="26" cy="17" r="1.5" fill="#6366F1"/>
    <circle cx="23" cy="19" r="1.5" fill="#34D399"/>
    <circle cx="20" cy="17" r="1.5" fill="#F87171"/>
    <rect x="15.5" y="16" width="3" height="1.5" rx="0.75" fill="#A5B4FC"/>
  </g>
</svg>`)

for (const size of [192, 512]) {
  await sharp(svg)
    .resize(size, size)
    .png()
    .toFile(`${iconsDir}/icon-${size}.png`)
  console.log(`✓ icon-${size}.png gerado`)
}

console.log('Ícones gerados em public/icons/')
