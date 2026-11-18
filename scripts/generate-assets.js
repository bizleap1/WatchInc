const fs = require('fs');
const path = require('path');

function generateWatchSVG(stoneName, primaryHex, secondaryHex, dialPatterns, bezelTone = 'gold') {
  const bezelStops = bezelTone === 'gold' 
    ? `<stop offset="0%" stop-color="#EFE2C6"/>
       <stop offset="25%" stop-color="#D7BE8A"/>
       <stop offset="50%" stop-color="#FAF1D9"/>
       <stop offset="75%" stop-color="#C2A46C"/>
       <stop offset="100%" stop-color="#E2D0AC"/>`
    : `<stop offset="0%" stop-color="#F2F4F7"/>
       <stop offset="25%" stop-color="#D5DBE1"/>
       <stop offset="50%" stop-color="#FFFFFF"/>
       <stop offset="75%" stop-color="#B8C1CC"/>
       <stop offset="100%" stop-color="#E4E8EE"/>`;

  const strapFill = bezelTone === 'gold' ? '#3B332A' : '#2D3238';

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg viewBox="0 0 800 800" width="800" height="800" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="ambientShadow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#1A1816" stop-opacity="0.28"/>
      <stop offset="65%" stop-color="#1A1816" stop-opacity="0.08"/>
      <stop offset="100%" stop-color="#1A1816" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="bezelGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      ${bezelStops}
    </linearGradient>
    <radialGradient id="stoneDialGrad" cx="45%" cy="40%" r="65%">
      <stop offset="0%" stop-color="${primaryHex}"/>
      <stop offset="65%" stop-color="${secondaryHex}"/>
      <stop offset="100%" stop-color="#1D1B18"/>
    </radialGradient>
    <linearGradient id="glassReflection" x1="0%" y1="0%" x2="70%" y2="70%">
      <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.45"/>
      <stop offset="30%" stop-color="#FFFFFF" stop-opacity="0.12"/>
      <stop offset="55%" stop-color="#FFFFFF" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="strapGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#1E1A17"/>
      <stop offset="20%" stop-color="${strapFill}"/>
      <stop offset="50%" stop-color="#544B3F"/>
      <stop offset="80%" stop-color="${strapFill}"/>
      <stop offset="100%" stop-color="#1E1A17"/>
    </linearGradient>
    <filter id="blurSoft" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="8"/>
    </filter>
  </defs>

  <!-- Ambient Floor Shadow -->
  <ellipse cx="400" cy="440" rx="270" ry="250" fill="url(#ambientShadow)" filter="url(#blurSoft)"/>

  <!-- Watch Strap (Top & Bottom) -->
  <g id="straps">
    <!-- Top Strap -->
    <path d="M 320,100 L 480,100 L 468,260 L 332,260 Z" fill="url(#strapGrad)" rx="6"/>
    <!-- Top Stitching -->
    <path d="M 334,110 L 342,250" stroke="#7E7260" stroke-width="2" stroke-dasharray="4,4" opacity="0.6"/>
    <path d="M 466,110 L 458,250" stroke="#7E7260" stroke-width="2" stroke-dasharray="4,4" opacity="0.6"/>
    
    <!-- Bottom Strap -->
    <path d="M 332,540 L 468,540 L 480,700 L 320,700 Z" fill="url(#strapGrad)" rx="6"/>
    <!-- Bottom Stitching -->
    <path d="M 342,550 L 334,690" stroke="#7E7260" stroke-width="2" stroke-dasharray="4,4" opacity="0.6"/>
    <path d="M 458,550 L 466,690" stroke="#7E7260" stroke-width="2" stroke-dasharray="4,4" opacity="0.6"/>
  </g>

  <!-- Case Lug Accents -->
  <g id="lugs" fill="url(#bezelGrad)">
    <path d="M 305,250 C 315,200 325,185 338,185 L 346,260 Z"/>
    <path d="M 495,250 C 485,200 475,185 462,185 L 454,260 Z"/>
    <path d="M 305,550 C 315,600 325,615 338,615 L 346,540 Z"/>
    <path d="M 495,550 C 485,600 475,615 462,615 L 454,540 Z"/>
  </g>

  <!-- Outer Watch Case & Bezel -->
  <circle cx="400" cy="400" r="190" fill="url(#bezelGrad)" stroke="#A68D5B" stroke-width="2"/>
  
  <!-- Crown / Winding Knurl -->
  <rect x="590" y="380" width="16" height="40" rx="3" fill="url(#bezelGrad)" stroke="#8C7342" stroke-width="1"/>
  <line x1="594" y1="384" x2="594" y2="416" stroke="#524326" stroke-width="1"/>
  <line x1="598" y1="384" x2="598" y2="416" stroke="#524326" stroke-width="1"/>
  <line x1="602" y1="384" x2="602" y2="416" stroke="#524326" stroke-width="1"/>

  <!-- Stepped Inner Bezel / Rehaut -->
  <circle cx="400" cy="400" r="172" fill="#1C1A17" stroke="url(#bezelGrad)" stroke-width="4"/>
  <circle cx="400" cy="400" r="162" fill="url(#stoneDialGrad)"/>

  <!-- Mineral Stone Inclusions & Textures -->
  <g id="stoneTextures" opacity="0.85">
    ${dialPatterns}
  </g>

  <!-- Minute Track Ring (Subtle dots) -->
  <circle cx="400" cy="400" r="150" fill="none" stroke="#FFFFFF" stroke-width="0.75" stroke-dasharray="1.5,14.2" opacity="0.35"/>

  <!-- Applied Polished Hour Markers (12, 3, 6, 9 double/single batons) -->
  <g id="markers" fill="#F7F1E1" stroke="#3A3326" stroke-width="0.5">
    <!-- 12 o'clock double baton -->
    <rect x="397" y="252" width="2.5" height="18" rx="1"/>
    <rect x="401.5" y="252" width="2.5" height="18" rx="1"/>
    <!-- 3 o'clock -->
    <rect x="530" y="398.5" width="18" height="3" rx="1"/>
    <!-- 6 o'clock -->
    <rect x="398.5" y="530" width="3" height="18" rx="1"/>
    <!-- 9 o'clock -->
    <rect x="252" y="398.5" width="18" height="3" rx="1"/>
    
    <!-- 1, 2, 4, 5, 7, 8, 10, 11 single slender batons -->
    <g transform="rotate(30 400 400)"><rect x="399" y="256" width="2" height="14" rx="1"/></g>
    <g transform="rotate(60 400 400)"><rect x="399" y="256" width="2" height="14" rx="1"/></g>
    <g transform="rotate(120 400 400)"><rect x="399" y="256" width="2" height="14" rx="1"/></g>
    <g transform="rotate(150 400 400)"><rect x="399" y="256" width="2" height="14" rx="1"/></g>
    <g transform="rotate(210 400 400)"><rect x="399" y="256" width="2" height="14" rx="1"/></g>
    <g transform="rotate(240 400 400)"><rect x="399" y="256" width="2" height="14" rx="1"/></g>
    <g transform="rotate(300 400 400)"><rect x="399" y="256" width="2" height="14" rx="1"/></g>
    <g transform="rotate(330 400 400)"><rect x="399" y="256" width="2" height="14" rx="1"/></g>
  </g>

  <!-- Editorial Sub-dial Dial Markings -->
  <text x="400" y="338" font-family="'Cormorant Garamond', Georgia, serif" font-size="11" letter-spacing="3" fill="#FFFFFF" fill-opacity="0.6" text-anchor="middle">BRAND NAME</text>
  <text x="400" y="475" font-family="'Instrument Sans', sans-serif" font-size="8.5" letter-spacing="2.5" fill="#FFFFFF" fill-opacity="0.45" text-anchor="middle">${stoneName.toUpperCase()}</text>

  <!-- Watch Hands (Time set to 10:10 editorial standard) -->
  <g id="hands" filter="drop-shadow(0px 4px 6px rgba(0,0,0,0.5))">
    <!-- Hour Hand (pointing toward ~10:08) -->
    <g transform="rotate(-54 400 400)">
      <path d="M 398.5,410 L 398,310 L 400,295 L 402,310 L 401.5,410 Z" fill="#E6D3B1" stroke="#2B2418" stroke-width="0.8"/>
      <line x1="400" y1="400" x2="400" y2="305" stroke="#FFFFFF" stroke-width="0.6" opacity="0.7"/>
    </g>

    <!-- Minute Hand (pointing toward ~02:10) -->
    <g transform="rotate(66 400 400)">
      <path d="M 398.8,416 L 398.2,260 L 400,242 L 401.8,260 L 401.2,416 Z" fill="#E6D3B1" stroke="#2B2418" stroke-width="0.8"/>
      <line x1="400" y1="400" x2="400" y2="252" stroke="#FFFFFF" stroke-width="0.6" opacity="0.7"/>
    </g>

    <!-- Center Pinion Cap -->
    <circle cx="400" cy="400" r="7" fill="url(#bezelGrad)" stroke="#1C1813" stroke-width="1"/>
    <circle cx="400" cy="400" r="2.5" fill="#1C1813"/>

    <!-- Slender Seconds Hand -->
    <g transform="rotate(215 400 400)">
      <line x1="400" y1="450" x2="400" y2="238" stroke="#D9534F" stroke-width="1.2"/>
      <circle cx="400" cy="400" r="3" fill="#D9534F"/>
      <circle cx="400" cy="435" r="2" fill="#D9534F"/>
    </g>
  </g>

  <!-- Curved Anti-Reflective Sapphire Crystal Highlight -->
  <path d="M 270,300 C 320,230 420,225 500,265 C 430,250 340,270 270,300 Z" fill="url(#glassReflection)"/>
  <ellipse cx="400" cy="400" r="161" fill="none" stroke="#FFFFFF" stroke-width="1" opacity="0.18"/>
</svg>`;
}

function generateMacroSVG(title, pColor, sColor, detailPaths) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg viewBox="0 0 1000 700" width="1000" height="700" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="macroGrad" cx="40%" cy="45%" r="70%">
      <stop offset="0%" stop-color="${pColor}"/>
      <stop offset="60%" stop-color="${sColor}"/>
      <stop offset="100%" stop-color="#141312"/>
    </radialGradient>
    <filter id="fissureGlow">
      <feGaussianBlur stdDeviation="3" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
  </defs>
  <rect width="1000" height="700" fill="url(#macroGrad)"/>
  
  <g opacity="0.65" filter="url(#fissureGlow)">
    ${detailPaths}
  </g>

  <!-- Soft vignette edge -->
  <rect width="1000" height="700" fill="none" stroke="#000000" stroke-width="40" opacity="0.15"/>
</svg>`;
}

// 1. Texture: grain.svg
const grainSVG = `<?xml version="1.0" encoding="UTF-8"?>
<svg viewBox="0 0 400 400" width="400" height="400" xmlns="http://www.w3.org/2000/svg">
  <filter id="noiseFilter">
    <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" stitchTiles="stitch"/>
    <feColorMatrix type="matrix" values="0 0 0 0 0.14  0 0 0 0 0.14  0 0 0 0 0.13  0 0 0 0.045 0"/>
  </filter>
  <rect width="100%" height="100%" filter="url(#noiseFilter)" opacity="0.75"/>
</svg>`;
fs.writeFileSync(path.join(__dirname, '../public/textures/grain.svg'), grainSVG);

// 2. Product Watch SVGs
// Citrine (Overflow)
const citrinePatterns = `
  <polygon points="320,310 390,280 440,320 370,360" fill="#FFE599" opacity="0.32"/>
  <polygon points="380,350 460,330 480,410 400,420" fill="#F9D776" opacity="0.25"/>
  <polygon points="310,380 390,410 360,490 290,440" fill="#F1C232" opacity="0.2"/>
  <path d="M 280,340 Q 380,390 480,350" stroke="#FFFFFF" stroke-width="1.2" opacity="0.4" fill="none"/>
  <path d="M 330,460 Q 420,410 500,470" stroke="#FFEBAA" stroke-width="1" opacity="0.45" fill="none"/>
`;
fs.writeFileSync(path.join(__dirname, '../public/images/products/overflow-dial.svg'), 
  generateWatchSVG('Citrine', '#F3C456', '#9B6C1E', citrinePatterns, 'gold'));

// Rose Quartz (Cherish)
const rosePatterns = `
  <path d="M 280,300 Q 360,370 440,320 T 520,380" stroke="#FFFFFF" stroke-width="2.5" opacity="0.4" fill="none"/>
  <path d="M 310,450 Q 400,410 490,460" stroke="#FFF0F3" stroke-width="2" opacity="0.35" fill="none"/>
  <ellipse cx="380" cy="370" rx="90" ry="70" fill="#FFF2F5" opacity="0.28" filter="blur(10px)"/>
  <ellipse cx="440" cy="430" rx="70" ry="50" fill="#E89BAA" opacity="0.35" filter="blur(8px)"/>
`;
fs.writeFileSync(path.join(__dirname, '../public/images/products/cherish-dial.svg'), 
  generateWatchSVG('Rose Quartz', '#F7B7C5', '#8C4355', rosePatterns, 'silver'));

// Amethyst (Hush)
const amethystPatterns = `
  <path d="M 260,340 L 400,280 L 540,340" stroke="#D1C4E9" stroke-width="3" opacity="0.4" fill="none"/>
  <path d="M 270,390 L 400,330 L 530,390" stroke="#EDE7F6" stroke-width="2" opacity="0.45" fill="none"/>
  <path d="M 290,450 L 400,400 L 510,450" stroke="#B39DDB" stroke-width="2.5" opacity="0.35" fill="none"/>
  <polygon points="340,350 400,310 460,360 400,410" fill="#7E57C2" opacity="0.3"/>
`;
fs.writeFileSync(path.join(__dirname, '../public/images/products/hush-dial.svg'), 
  generateWatchSVG('Amethyst', '#A38DC4', '#452A68', amethystPatterns, 'silver'));

// Tiger's Eye (Ascent)
const tigereyePatterns = `
  <path d="M 260,300 C 340,310 460,290 540,300" stroke="#DF9B40" stroke-width="12" opacity="0.7" fill="none"/>
  <path d="M 250,335 C 330,345 470,325 550,335" stroke="#4E3114" stroke-width="14" opacity="0.85" fill="none"/>
  <path d="M 250,375 C 350,385 460,365 550,375" stroke="#F6BE68" stroke-width="16" opacity="0.85" fill="none"/>
  <path d="M 250,420 C 340,430 470,410 550,420" stroke="#68411B" stroke-width="14" opacity="0.85" fill="none"/>
  <path d="M 260,460 C 350,470 460,450 540,460" stroke="#DDA046" stroke-width="12" opacity="0.75" fill="none"/>
`;
fs.writeFileSync(path.join(__dirname, '../public/images/products/ascent-dial.svg'), 
  generateWatchSVG("Tiger's Eye", '#B87A32', '#3D240E', tigereyePatterns, 'gold'));

// Sunstone (Wildfire)
const sunstonePatterns = `
  <ellipse cx="400" cy="400" rx="140" ry="140" fill="#F8A585" opacity="0.3" filter="blur(15px)"/>
  <g fill="#FFE0B2" opacity="0.8">
    <circle cx="340" cy="340" r="2.5"/><circle cx="380" cy="320" r="3"/><circle cx="430" cy="335" r="2"/>
    <circle cx="360" cy="380" r="3.5"/><circle cx="420" cy="390" r="4"/><circle cx="450" cy="360" r="2.5"/>
    <circle cx="330" cy="420" r="3"/><circle cx="385" cy="440" r="3.5"/><circle cx="440" cy="430" r="2"/>
  </g>
  <path d="M 310,360 Q 400,320 490,380" stroke="#FFCCBC" stroke-width="1.5" opacity="0.5" fill="none"/>
`;
fs.writeFileSync(path.join(__dirname, '../public/images/products/wildfire-dial.svg'), 
  generateWatchSVG('Sunstone', '#E88665', '#6D2B1A', sunstonePatterns, 'gold'));

// Sodalite (Cadence)
const sodalitePatterns = `
  <path d="M 270,320 C 330,340 370,300 430,330 T 530,310" stroke="#F4F8FB" stroke-width="3" opacity="0.65" fill="none"/>
  <path d="M 300,430 C 360,410 410,460 480,420 T 520,460" stroke="#FFFFFF" stroke-width="2.5" opacity="0.6" fill="none"/>
  <path d="M 370,300 L 350,440" stroke="#E1EBF2" stroke-width="1.8" opacity="0.45" fill="none"/>
  <ellipse cx="360" cy="380" rx="60" ry="40" fill="#2E4D68" opacity="0.5"/>
  <ellipse cx="460" cy="360" rx="50" ry="35" fill="#1C354C" opacity="0.6"/>
`;
fs.writeFileSync(path.join(__dirname, '../public/images/products/cadence-dial.svg'), 
  generateWatchSVG('Sodalite', '#4C6F91', '#16283A', sodalitePatterns, 'silver'));

// 3. Macro Images
fs.writeFileSync(path.join(__dirname, '../public/images/products/overflow-macro.svg'),
  generateMacroSVG('Citrine Macro', '#D49E35', '#4A340F', `
    <polygon points="100,100 400,50 600,300 200,400" fill="#FFDA66" opacity="0.25"/>
    <polygon points="500,200 850,150 900,550 550,500" fill="#F7BF38" opacity="0.3"/>
    <path d="M 50,250 L 950,380" stroke="#FFFFFF" stroke-width="2" opacity="0.5"/>
    <path d="M 200,50 L 700,650" stroke="#FFE899" stroke-width="1.5" opacity="0.4"/>
  `));

fs.writeFileSync(path.join(__dirname, '../public/images/products/cherish-macro.svg'),
  generateMacroSVG('Rose Quartz Macro', '#E89BAA', '#592532', `
    <ellipse cx="500" cy="350" rx="350" ry="250" fill="#FFDEE5" opacity="0.25"/>
    <path d="M 100,200 Q 500,400 900,250" stroke="#FFFFFF" stroke-width="3" opacity="0.45" fill="none"/>
    <path d="M 200,500 Q 600,300 850,550" stroke="#FFFFFF" stroke-width="2" opacity="0.4" fill="none"/>
  `));

fs.writeFileSync(path.join(__dirname, '../public/images/products/hush-macro.svg'),
  generateMacroSVG('Amethyst Macro', '#9B84BA', '#361E52', `
    <polygon points="200,100 500,50 800,250 450,400" fill="#CBB7E6" opacity="0.25"/>
    <path d="M 150,300 L 500,150 L 850,350" stroke="#FFFFFF" stroke-width="3" opacity="0.5" fill="none"/>
    <path d="M 200,450 L 500,300 L 800,500" stroke="#E6DBF5" stroke-width="2" opacity="0.45" fill="none"/>
  `));

fs.writeFileSync(path.join(__dirname, '../public/images/products/ascent-macro.svg'),
  generateMacroSVG("Tiger's Eye Macro", '#B87A32', '#2A1708', `
    <rect y="100" width="1000" height="80" fill="#DF9B40" opacity="0.6"/>
    <rect y="220" width="1000" height="90" fill="#F8C471" opacity="0.75"/>
    <rect y="360" width="1000" height="110" fill="#935116" opacity="0.8"/>
    <rect y="510" width="1000" height="80" fill="#F39C12" opacity="0.65"/>
  `));

fs.writeFileSync(path.join(__dirname, '../public/images/products/wildfire-macro.svg'),
  generateMacroSVG('Sunstone Macro', '#E57351', '#4A1D11', `
    <circle cx="500" cy="350" r="300" fill="#FFA07A" opacity="0.2"/>
    <g fill="#FFE4D6" opacity="0.85">
      <circle cx="250" cy="200" r="5"/><circle cx="380" cy="180" r="4"/><circle cx="550" cy="220" r="6"/>
      <circle cx="700" cy="260" r="5"/><circle cx="320" cy="380" r="7"/><circle cx="480" cy="350" r="6"/>
      <circle cx="640" cy="420" r="5"/><circle cx="780" cy="360" r="4"/><circle cx="420" cy="500" r="6"/>
    </g>
  `));

fs.writeFileSync(path.join(__dirname, '../public/images/products/cadence-macro.svg'),
  generateMacroSVG('Sodalite Macro', '#3E6182', '#0E1D2B', `
    <path d="M 100,150 Q 400,280 800,180 T 950,300" stroke="#FFFFFF" stroke-width="5" opacity="0.7" fill="none"/>
    <path d="M 150,450 Q 550,350 850,500" stroke="#EBF3F9" stroke-width="4" opacity="0.65" fill="none"/>
    <path d="M 450,100 L 400,600" stroke="#D3E2EE" stroke-width="3" opacity="0.5" fill="none"/>
  `));

// 4. Macro stone dial for Section 5 ("Dial no. 0147")
const dial0147SVG = `<?xml version="1.0" encoding="UTF-8"?>
<svg viewBox="0 0 1000 800" width="1000" height="800" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="macroDial0147" cx="48%" cy="46%" r="65%">
      <stop offset="0%" stop-color="#FCEFD2"/>
      <stop offset="35%" stop-color="#E5B25D"/>
      <stop offset="70%" stop-color="#9C6B22"/>
      <stop offset="100%" stop-color="#3A2408"/>
    </radialGradient>
    <linearGradient id="engraveGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFFDF7" stop-opacity="0.9"/>
      <stop offset="100%" stop-color="#C29F5F" stop-opacity="0.7"/>
    </linearGradient>
  </defs>

  <!-- Macro Stone Background -->
  <rect width="1000" height="800" fill="url(#macroDial0147)"/>
  
  <!-- Natural Quartz Crystal Fissures -->
  <g opacity="0.6">
    <path d="M 120,200 Q 450,320 850,180" stroke="#FFF7E6" stroke-width="2.5" fill="none"/>
    <path d="M 200,500 Q 520,410 900,580" stroke="#FFFFFF" stroke-width="1.8" fill="none"/>
    <polygon points="340,280 520,240 600,420 420,460" fill="#FFEAA8" opacity="0.25"/>
    <polygon points="560,380 780,340 820,560 620,580" fill="#F3BF55" opacity="0.2"/>
  </g>

  <!-- Circular Dial Edge Guide (Subtle Macro Curve) -->
  <circle cx="500" cy="400" r="340" fill="none" stroke="#FFFFFF" stroke-width="1.5" stroke-dasharray="3,18" opacity="0.4"/>

  <!-- Engraved Dial Identification Plaque / Micro-Inscription -->
  <g transform="translate(320, 520)">
    <rect width="360" height="68" rx="8" fill="#1C1814" fill-opacity="0.75" stroke="#C29F5F" stroke-width="1"/>
    <text x="180" y="30" font-family="'Instrument Sans', sans-serif" font-size="11" letter-spacing="3" fill="#C29F5F" text-anchor="middle">AUTHENTICATED SPECIMEN</text>
    <text x="180" y="52" font-family="'Cormorant Garamond', Georgia, serif" font-weight="600" font-size="19" letter-spacing="2" fill="url(#engraveGrad)" text-anchor="middle">Dial no. 0147</text>
  </g>
</svg>`;
fs.writeFileSync(path.join(__dirname, '../public/images/products/macro-dial-0147.svg'), dial0147SVG);

// 5. Selenite Resting Plate (Section 7)
const selenitePlateSVG = `<?xml version="1.0" encoding="UTF-8"?>
<svg viewBox="0 0 1000 700" width="1000" height="700" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="plateAmbient" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#2B2824" stop-opacity="0.2"/>
      <stop offset="70%" stop-color="#2B2824" stop-opacity="0.04"/>
      <stop offset="100%" stop-color="#2B2824" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="seleniteBody" x1="0%" y1="0%" x2="100%" y2="80%">
      <stop offset="0%" stop-color="#FFFFFF"/>
      <stop offset="35%" stop-color="#F2F3F5"/>
      <stop offset="70%" stop-color="#E2E6EB"/>
      <stop offset="100%" stop-color="#CBD1D8"/>
    </linearGradient>
    <linearGradient id="plateRim" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.95"/>
      <stop offset="100%" stop-color="#B0B8C1" stop-opacity="0.6"/>
    </linearGradient>
  </defs>

  <!-- Clean Ivory / Soft Linen Still Life Surface -->
  <rect width="1000" height="700" fill="#F7F4ED"/>

  <!-- Subtle Ambient Glow -->
  <ellipse cx="500" cy="460" rx="420" ry="180" fill="url(#plateAmbient)"/>

  <!-- Selenite Dish / Resting Slab Base Shadow -->
  <ellipse cx="490" cy="410" rx="360" ry="140" fill="#2E2B27" opacity="0.14"/>

  <!-- Selenite Plate (Carved natural fibrous gypsum crystal) -->
  <ellipse cx="480" cy="380" rx="350" ry="130" fill="url(#seleniteBody)" stroke="url(#plateRim)" stroke-width="3"/>
  <ellipse cx="480" cy="375" rx="320" ry="110" fill="#FFFFFF" fill-opacity="0.6" stroke="#FFFFFF" stroke-width="1.5"/>

  <!-- Natural Fibrous Selenite Linear Striations -->
  <g stroke="#FFFFFF" stroke-width="1" opacity="0.75">
    <line x1="220" y1="360" x2="740" y2="360"/>
    <line x1="200" y1="375" x2="760" y2="375"/>
    <line x1="230" y1="390" x2="730" y2="390"/>
    <line x1="260" y1="345" x2="700" y2="345"/>
    <line x1="280" y1="405" x2="680" y2="405"/>
  </g>

  <!-- Watch Resting Beside / Partially upon the Selenite Plate -->
  <g transform="translate(380, 260) scale(0.65)" filter="drop-shadow(0px 12px 20px rgba(0,0,0,0.22))">
    <!-- Re-use watch miniature outline -->
    <ellipse cx="400" cy="400" r="180" fill="#DFC89C" stroke="#A68D5B" stroke-width="3"/>
    <circle cx="400" cy="400" r="150" fill="#F3C456"/>
    <!-- Citrine quartz texture inside mini watch -->
    <polygon points="340,320 430,300 460,380 370,410" fill="#FFE599" opacity="0.45"/>
    <!-- Watch Hands -->
    <line x1="400" y1="400" x2="360" y2="330" stroke="#FFFFFF" stroke-width="4" stroke-linecap="round"/>
    <line x1="400" y1="400" x2="450" y2="370" stroke="#FFFFFF" stroke-width="3.5" stroke-linecap="round"/>
    <circle cx="400" cy="400" r="7" fill="#8C7342"/>
  </g>

  <!-- Refined Editorial Title / Caption on Still Life -->
  <text x="500" y="585" font-family="'Cormorant Garamond', Georgia, serif" font-style="italic" font-size="16" letter-spacing="1.5" fill="#696560" text-anchor="middle">Selenite Resting Plate</text>
  <text x="500" y="610" font-family="'Instrument Sans', sans-serif" font-size="10" letter-spacing="2" fill="#8C8780" text-anchor="middle">OPTIONAL ACCREDITED COMPANION PIECE</text>
</svg>`;
fs.writeFileSync(path.join(__dirname, '../public/images/products/selenite-plate.svg'), selenitePlateSVG);

// 6. Practitioner Sample Card (Section 6)
const sampleCardSVG = `<?xml version="1.0" encoding="UTF-8"?>
<svg viewBox="0 0 900 600" width="900" height="600" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <filter id="cardShadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="16" stdDeviation="20" flood-color="#1F1D1A" flood-opacity="0.14"/>
    </filter>
  </defs>

  <rect width="900" height="600" fill="#FAF7F2"/>

  <!-- Card Body -->
  <g filter="url(#cardShadow)">
    <rect x="120" y="80" width="660" height="440" rx="16" fill="#FFFFFF" stroke="#E5DEC9" stroke-width="1.5"/>
  </g>

  <!-- Double Fine Inset Border -->
  <rect x="140" y="100" width="620" height="400" rx="10" fill="none" stroke="#ECE4D2" stroke-width="1"/>
  
  <!-- Header Wordmark -->
  <text x="450" y="150" font-family="'Cormorant Garamond', Georgia, serif" font-size="14" letter-spacing="5" fill="#242321" text-anchor="middle">BRAND NAME</text>
  <text x="450" y="172" font-family="'Instrument Sans', sans-serif" font-size="9" letter-spacing="3" fill="#8C8780" text-anchor="middle">PRACTITIONER ATTESTATION RECORD</text>

  <!-- Horizontal divider -->
  <line x1="200" y1="195" x2="700" y2="195" stroke="#EAE2D1" stroke-width="1"/>

  <!-- Sample Watermark / Stamp -->
  <g transform="translate(610, 310) rotate(-14)">
    <rect x="-65" y="-22" width="130" height="44" rx="4" fill="none" stroke="#C29F5F" stroke-width="1.5" stroke-dasharray="4,2"/>
    <text x="0" y="6" font-family="'Instrument Sans', sans-serif" font-weight="600" font-size="12" letter-spacing="3" fill="#C29F5F" text-anchor="middle">SAMPLE CARD</text>
  </g>

  <!-- Field: Dial Identification -->
  <text x="200" y="245" font-family="'Instrument Sans', sans-serif" font-size="10" letter-spacing="2" fill="#8C8780">SPECIMEN NUMBER</text>
  <text x="200" y="278" font-family="'Cormorant Garamond', Georgia, serif" font-size="24" letter-spacing="1" fill="#242321">Dial no. 0147</text>

  <!-- Field: Intention -->
  <text x="200" y="330" font-family="'Instrument Sans', sans-serif" font-size="10" letter-spacing="2" fill="#8C8780">TRADITIONAL INTENTION</text>
  <text x="200" y="358" font-family="'Cormorant Garamond', Georgia, serif" font-style="italic" font-size="18" fill="#3D3833">Worn for abundance, in the tradition of citrine.</text>

  <!-- Field: Practitioner -->
  <text x="200" y="415" font-family="'Instrument Sans', sans-serif" font-size="10" letter-spacing="2" fill="#8C8780">PREPARED &amp; ENERGIZED BY</text>
  <text x="200" y="442" font-family="'Cormorant Garamond', Georgia, serif" font-size="19" fill="#242321">Energized by Elena V. before it ships.</text>

  <!-- Field: Date / Season -->
  <text x="520" y="415" font-family="'Instrument Sans', sans-serif" font-size="10" letter-spacing="2" fill="#8C8780">SEASON OF DEDICATION</text>
  <text x="520" y="442" font-family="'Cormorant Garamond', Georgia, serif" font-size="19" fill="#242321">Autumn 2026</text>

  <!-- Bottom Certification Note -->
  <text x="450" y="480" font-family="'Instrument Sans', sans-serif" font-size="8.5" letter-spacing="1" fill="#A8A29A" text-anchor="middle">This illustrative card accompanies the individually prepared timepiece upon dispatch.</text>
</svg>`;
fs.writeFileSync(path.join(__dirname, '../public/images/rituals/sample-card.svg'), sampleCardSVG);

// 7. Hero Floating Elements (organic crystal shards matching the 6 stones)
const heroFloatingStones = [
  { name: 'overflow-float', color1: '#FFDE7D', color2: '#D49E35' },
  { name: 'cherish-float', color1: '#FCD7E0', color2: '#D9889A' },
  { name: 'hush-float', color1: '#D6C8EA', color2: '#8F7CA8' },
  { name: 'ascent-float', color1: '#E8BF87', color2: '#A6743A' },
  { name: 'wildfire-float', color1: '#F9B7A2', color2: '#D97B5F' },
  { name: 'cadence-float', color1: '#8FAFC9', color2: '#4C6B85' },
];

heroFloatingStones.forEach(stone => {
  const floatSVG = `<?xml version="1.0" encoding="UTF-8"?>
<svg viewBox="0 0 200 200" width="200" height="200" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="${stone.name}-grad" cx="40%" cy="35%" r="65%">
      <stop offset="0%" stop-color="${stone.color1}" stop-opacity="0.95"/>
      <stop offset="65%" stop-color="${stone.color2}" stop-opacity="0.8"/>
      <stop offset="100%" stop-color="#242321" stop-opacity="0.2"/>
    </radialGradient>
    <filter id="softGlow">
      <feGaussianBlur stdDeviation="4" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
  </defs>
  <g filter="url(#softGlow)">
    <polygon points="100,20 160,70 140,150 70,170 30,110 50,45" fill="url(#${stone.name}-grad)" stroke="#FFFFFF" stroke-width="1" stroke-opacity="0.6"/>
    <!-- Facet lines -->
    <line x1="100" y1="20" x2="105" y2="100" stroke="#FFFFFF" stroke-width="0.8" opacity="0.6"/>
    <line x1="160" y1="70" x2="105" y2="100" stroke="#FFFFFF" stroke-width="0.8" opacity="0.5"/>
    <line x1="140" y1="150" x2="105" y2="100" stroke="#FFFFFF" stroke-width="0.8" opacity="0.5"/>
    <line x1="70" y1="170" x2="105" y2="100" stroke="#FFFFFF" stroke-width="0.8" opacity="0.5"/>
    <line x1="30" y1="110" x2="105" y2="100" stroke="#FFFFFF" stroke-width="0.8" opacity="0.5"/>
    <line x1="50" y1="45" x2="105" y2="100" stroke="#FFFFFF" stroke-width="0.8" opacity="0.6"/>
  </g>
</svg>`;
  fs.writeFileSync(path.join(__dirname, `../public/images/hero/${stone.name}.svg`), floatSVG);
});

console.log('Successfully generated all SVG visual assets!');
