'use client';

/**
 * 3D Disney/Pixar Clay-Style Miniature Cube Storefront of La Piccerella (Badalona):
 * - Chunky rounded 3D cube architecture with giant 3D melted-cheese pizza slice on the roof
 * - Puffy 3D "LA PICCERELLA" signboard with circular artisan crest
 * - Faithful ground-floor entrance layout from the real Badalona storefront:
 *   • Left kitchen window: stainless steel hood, glowing oven, and 3D Disney/Pixar Gustavo
 *     (the owner & symbol of La Piccerella) with live gentle waving hand & pizza peel animation
 *   • Lower left plaque: "PORCIÓ MARGARITA · 3 € · Més de 15 sabors"
 *   • Right open entrance: iconic lime-green brick interior, wooden bar with stools,
 *     warm pendant lamps, and the "PIZZETA 3€" A-frame sign
 */
export function LaPiccerella3DCubeHero() {
  return (
    <svg
      viewBox="0 0 920 760"
      className="h-full w-full max-h-full max-w-full select-none"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="La Piccerella Badalona — pizzería artesanal en estilo 3D con Gustavo saludando con su pala de pizza"
    >
      <defs>
        {/* Soft 3D clay drop shadows */}
        <filter id="clay-shadow" x="-15%" y="-15%" width="130%" height="135%">
          <feDropShadow dx="0" dy="14" stdDeviation="14" floodColor="#1A0E08" floodOpacity="0.38" />
        </filter>
        <filter id="soft-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="6" stdDeviation="6" floodColor="#231208" floodOpacity="0.28" />
        </filter>
        <filter id="cheese-shadow" x="-15%" y="-15%" width="130%" height="140%">
          <feDropShadow dx="0" dy="8" stdDeviation="5" floodColor="#6E2E0C" floodOpacity="0.34" />
        </filter>

        {/* Chunky 3D clay building gradients */}
        <linearGradient id="cube-wall" x1="0" y1="0" x2="1" y2="0.2">
          <stop offset="0%" stopColor="#FCE7B8" />
          <stop offset="16%" stopColor="#FFF0CA" />
          <stop offset="84%" stopColor="#F5D599" />
          <stop offset="100%" stopColor="#DFB370" />
        </linearGradient>

        <linearGradient id="roof-orange" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFB866" />
          <stop offset="28%" stopColor="#F49A42" />
          <stop offset="82%" stopColor="#DC7524" />
          <stop offset="100%" stopColor="#B55515" />
        </linearGradient>

        <linearGradient id="sign-band" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFBA6B" />
          <stop offset="20%" stopColor="#F29840" />
          <stop offset="80%" stopColor="#D97324" />
          <stop offset="100%" stopColor="#B35314" />
        </linearGradient>

        <linearGradient id="roof-pedestal" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#F3CD80" />
          <stop offset="20%" stopColor="#FFE5A3" />
          <stop offset="80%" stopColor="#F7D286" />
          <stop offset="100%" stopColor="#D9AC5B" />
        </linearGradient>

        {/* Giant 3D Rooftop Pizza gradients */}
        <linearGradient id="pizza-crust-3d" x1="0.2" y1="0" x2="0.8" y2="1">
          <stop offset="0%" stopColor="#E9915A" />
          <stop offset="35%" stopColor="#CC6232" />
          <stop offset="78%" stopColor="#A6421D" />
          <stop offset="100%" stopColor="#7C2B10" />
        </linearGradient>

        <linearGradient id="pizza-cheese-3d" x1="0.1" y1="0" x2="0.9" y2="1">
          <stop offset="0%" stopColor="#FFF08A" />
          <stop offset="45%" stopColor="#FFD352" />
          <stop offset="88%" stopColor="#F2AE28" />
          <stop offset="100%" stopColor="#D98B14" />
        </linearGradient>

        <radialGradient id="pep-3d" cx="35%" cy="30%" r="68%">
          <stop offset="0%" stopColor="#F05543" />
          <stop offset="65%" stopColor="#C82F22" />
          <stop offset="100%" stopColor="#8F1A12" />
        </radialGradient>

        {/* Storefront dark charcoal 3D frame */}
        <linearGradient id="frame-dark" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3B3739" />
          <stop offset="15%" stopColor="#262325" />
          <stop offset="100%" stopColor="#161416" />
        </linearGradient>

        {/* Warm glowing kitchen & lime-green interior gradients */}
        <radialGradient id="kitchen-glow" cx="50%" cy="35%" r="72%">
          <stop offset="0%" stopColor="#FFF6D6" />
          <stop offset="55%" stopColor="#F4C77B" />
          <stop offset="100%" stopColor="#C78A3E" />
        </radialGradient>

        <linearGradient id="steel-hood" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#EEF2F6" />
          <stop offset="40%" stopColor="#C8D0D9" />
          <stop offset="75%" stopColor="#949EA9" />
          <stop offset="100%" stopColor="#69737E" />
        </linearGradient>

        <linearGradient id="lime-wall" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#A6BD3A" />
          <stop offset="55%" stopColor="#869D28" />
          <stop offset="100%" stopColor="#65791B" />
        </linearGradient>

        <linearGradient id="wood-floor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#E7A659" />
          <stop offset="100%" stopColor="#B8702F" />
        </linearGradient>

        <linearGradient id="plinth-stone" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#E9CEAD" />
          <stop offset="45%" stopColor="#CFA982" />
          <stop offset="100%" stopColor="#A27954" />
        </linearGradient>

        {/* Gustavo 3D Disney/Pixar skin & clothing gradients */}
        <radialGradient id="gus-skin" cx="42%" cy="30%" r="68%">
          <stop offset="0%" stopColor="#FFE4CA" />
          <stop offset="45%" stopColor="#F5BD95" />
          <stop offset="85%" stopColor="#DC936B" />
          <stop offset="100%" stopColor="#BA724D" />
        </radialGradient>
        <radialGradient id="gus-shine" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFFBF4" stopOpacity="0.82" />
          <stop offset="100%" stopColor="#FFE5C8" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="gus-cheek" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#EB6E5C" stopOpacity="0.52" />
          <stop offset="100%" stopColor="#EB6E5C" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="gus-iris" cx="38%" cy="32%" r="62%">
          <stop offset="0%" stopColor="#82502E" />
          <stop offset="70%" stopColor="#4A2B16" />
          <stop offset="100%" stopColor="#261308" />
        </radialGradient>
        <linearGradient id="gus-shirt" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#3B404C" />
          <stop offset="55%" stopColor="#22262E" />
          <stop offset="100%" stopColor="#121419" />
        </linearGradient>
        <linearGradient id="gus-peel" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="55%" stopColor="#EAEFF5" />
          <stop offset="100%" stopColor="#C1CBD6" />
        </linearGradient>
        <radialGradient id="gus-dough" cx="40%" cy="28%" r="68%">
          <stop offset="0%" stopColor="#FFFDF9" />
          <stop offset="65%" stopColor="#F2E4CB" />
          <stop offset="100%" stopColor="#D6BE9B" />
        </radialGradient>

        {/* Clip path for Gustavo inside the left kitchen window */}
        <clipPath id="kitchen-window-clip">
          <rect x="200" y="394" width="248" height="162" rx="14" />
        </clipPath>
        <clipPath id="doorway-clip">
          <rect x="466" y="394" width="254" height="270" rx="14" />
        </clipPath>
      </defs>

      {/* ── SOFT STUDIO GROUND SHADOW ── */}
      <ellipse cx="460" cy="712" rx="330" ry="26" fill="#0B0705" fillOpacity="0.48" />

      {/* ── 3D ROUNDED DIORAMA SIDEWALK PLINTH ── */}
      <g filter="url(#clay-shadow)">
        <rect x="142" y="652" width="636" height="58" rx="26" fill="url(#plinth-stone)" />
        {/* Top bevel highlight of plinth */}
        <rect x="150" y="655" width="620" height="16" rx="10" fill="#FFF3E0" fillOpacity="0.32" />
      </g>

      {/* ── MAIN CHUNKY 3D CUBE BUILDING BODY ── */}
      <g filter="url(#clay-shadow)">
        <rect x="166" y="338" width="588" height="338" rx="30" fill="url(#cube-wall)" />
        {/* Soft left & right 3D rim light on cube walls */}
        <rect x="172" y="346" width="14" height="320" rx="7" fill="#FFFBF0" fillOpacity="0.42" />
        <rect x="736" y="346" width="14" height="320" rx="7" fill="#A67438" fillOpacity="0.22" />
      </g>

      {/* ── REAL LA PICCERELLA STOREFRONT LAYOUT (100% 3D DISNEY/PIXAR CLAY STYLE) ── */}
      {/* Chunky rounded dark charcoal storefront frame */}
      <rect x="184" y="378" width="552" height="298" rx="22" fill="url(#frame-dark)" />
      {/* Subtle top bezel sheen on frame */}
      <rect x="192" y="381" width="536" height="5" rx="2.5" fill="#FFFFFF" fillOpacity="0.16" />

      {/* ════════════ LEFT BAY: KITCHEN WINDOW + ANIMATED GUSTAVO + PORCIÓ MARGARITA PLAQUE ════════════ */}
      {/* Upper Kitchen Window Interior */}
      <g clipPath="url(#kitchen-window-clip)">
        {/* Warm golden sunlit kitchen interior */}
        <rect x="200" y="394" width="248" height="162" fill="url(#kitchen-glow)" />

        {/* Back lime-green accent wall & mini glowing menu TV inside kitchen (authentic to real photo!) */}
        <rect x="358" y="424" width="90" height="132" fill="url(#lime-wall)" />
        <rect x="372" y="456" width="62" height="40" rx="6" fill="#FFFDF8" stroke="#2D2926" strokeWidth="3" />
        <circle cx="412" cy="476" r="13" fill="#E88B38" />
        <circle cx="412" cy="476" r="10" fill="#FFD152" />
        <circle cx="408" cy="473" r="2.2" fill="#C8372D" />
        <circle cx="416" cy="478" r="2.2" fill="#C8372D" />
        <circle cx="412" cy="480" r="2" fill="#3F6B3A" />

        {/* Stacked chunky 3D pizza boxes on far left */}
        <g>
          <rect x="202" y="476" width="56" height="10" rx="3" fill="#E4BA8B" stroke="#B68755" strokeWidth="1.5" />
          <rect x="202" y="487" width="56" height="10" rx="3" fill="#ECC599" stroke="#B68755" strokeWidth="1.5" />
          <rect x="202" y="498" width="56" height="10" rx="3" fill="#E4BA8B" stroke="#B68755" strokeWidth="1.5" />
          <rect x="202" y="509" width="56" height="10" rx="3" fill="#ECC599" stroke="#B68755" strokeWidth="1.5" />
        </g>

        {/* Warm glowing pizza oven behind Gustavo */}
        <rect x="328" y="484" width="72" height="58" rx="8" fill="#525862" />
        <rect x="336" y="494" width="56" height="20" rx="5" fill="#FF9234" />
        <rect x="342" y="498" width="44" height="12" rx="4" fill="#FFE073" />

        {/* Warm hanging bronze pendant lamps */}
        <line x1="398" y1="394" x2="398" y2="424" stroke="#2A2624" strokeWidth="2.5" />
        <path d="M385 432 C385 422 411 422 411 432 Z" fill="#463329" />
        <ellipse cx="398" cy="433" rx="10" ry="3.5" fill="#FFE48F" />

        {/* ── 3D DISNEY/PIXAR GUSTAVO (OWNER & SYMBOL OF LA PICCERELLA) ── */}
        <g transform="translate(208, 412) scale(0.76)">
          {/* Right Arm + Chunky 3D Pizza Peel (Pala) — gentle animated tilt/bob */}
          <g className="gustavo-peel-arm" style={{ transformOrigin: '92px 170px' }}>
            {/* Forearm */}
            <path
              d="M116 146 C100 156 88 166 82 180 C78 190 90 198 99 190 C110 180 120 168 128 156 Z"
              fill="url(#gus-skin)"
            />
            {/* Peel handle */}
            <rect
              x="74"
              y="142"
              width="13"
              height="58"
              rx="6.5"
              transform="rotate(-8 80 170)"
              fill="#D5DCE5"
              stroke="#A3AEBC"
              strokeWidth="2"
            />
            {/* Chunky 3D Rounded-Square Pizza Peel (Pala) Blade */}
            <path
              d="M22 68 C21 53 31 46 47 46 L96 46 C112 46 121 54 120 69 L115 128 C114 140 104 148 89 148 L54 148 C39 148 29 140 27 128 Z"
              transform="rotate(-8 71 97)"
              fill="url(#gus-peel)"
              stroke="#B9C3D0"
              strokeWidth="3"
            />
            {/* Glossy Pixar specular highlight on peel */}
            <path
              d="M35 58 L96 56 C104 56 108 61 107 69 L105 90 C84 78 56 82 33 95 L31 67 C31 61 32 58 35 58 Z"
              transform="rotate(-8 71 97)"
              fill="#FFFFFF"
              fillOpacity="0.72"
            />
            {/* Gripping hand */}
            <ellipse cx="82" cy="176" rx="13" ry="10" fill="url(#gus-skin)" />
          </g>

          {/* Left Arm + Expressive 5-Finger Waving Hand (Saluto) — live waving animation! */}
          <g className="gustavo-wave-arm" style={{ transformOrigin: '212px 136px' }}>
            <path
              d="M198 140 C214 126 226 104 234 74 C236 65 253 68 251 79 C246 112 232 140 212 156 Z"
              fill="url(#gus-skin)"
            />
            <g transform="translate(243, 66) rotate(9)">
              <ellipse cx="0" cy="0" rx="15" ry="16" fill="url(#gus-skin)" />
              {/* Thumb */}
              <path d="M-12 5 C-22 -1 -23 -11 -17 -14 C-12 -16 -7 -7 -7 0 Z" fill="url(#gus-skin)" />
              {/* 4 friendly rounded Disney fingers */}
              <rect x="-11" y="-32" width="7" height="22" rx="3.5" transform="rotate(-11 -7 -19)" fill="url(#gus-skin)" />
              <rect x="-3.2" y="-36" width="7.2" height="25" rx="3.6" fill="url(#gus-skin)" />
              <rect x="4.8" y="-33" width="7" height="22" rx="3.5" transform="rotate(8 8 -19)" fill="url(#gus-skin)" />
              <rect x="11.5" y="-26" width="6.4" height="18" rx="3.2" transform="rotate(18 14 -15)" fill="url(#gus-skin)" />
            </g>
          </g>

          {/* Gustavo's Torso, Apron & Expressive 3D Disney/Pixar Head */}
          <g className="gustavo-body" style={{ transformOrigin: '160px 192px' }}>
            {/* Black T-shirt & sleeves */}
            <path d="M100 198 C104 148 118 122 140 116 L184 116 C206 122 220 148 224 198 Z" fill="url(#gus-shirt)" />
            <path d="M136 120 C116 128 102 144 96 164 L120 170 C125 152 132 138 142 130 Z" fill="url(#gus-shirt)" />
            <path d="M186 118 C206 120 222 130 232 146 L212 162 C202 150 194 140 184 136 Z" fill="url(#gus-shirt)" />

            {/* Black Pizzaiolo Apron */}
            <path d="M142 114 C143 98 180 98 181 114" stroke="#101218" strokeWidth="6" fill="none" />
            <path d="M126 130 L196 130 L204 198 L118 198 Z" fill="#15171E" />
            {/* Tiny red La Piccerella badge on apron */}
            <circle cx="179" cy="148" r="6" fill="#C8372D" />
            <circle cx="179" cy="148" r="3" fill="#FFF7EB" />

            {/* Neck */}
            <path d="M146 102 L176 102 L179 124 C168 131 154 131 143 124 Z" fill="url(#gus-skin)" />

            {/* Ears */}
            <ellipse cx="126" cy="74" rx="9" ry="13" fill="url(#gus-skin)" />
            <ellipse cx="196" cy="74" rx="9" ry="13" fill="url(#gus-skin)" />

            {/* Big Expressive 3D Disney/Pixar Bald Head */}
            <path
              d="M127 68 C127 30 142 16 161 16 C180 16 195 30 195 68 C195 96 180 112 161 112 C142 112 127 96 127 68 Z"
              fill="url(#gus-skin)"
            />
            {/* Warm crown highlight */}
            <ellipse cx="152" cy="34" rx="17" ry="9" transform="rotate(-14 152 34)" fill="url(#gus-shine)" />

            {/* Rosy Pixar cheeks */}
            <ellipse cx="141" cy="82" rx="11" ry="7" fill="url(#gus-cheek)" />
            <ellipse cx="181" cy="82" rx="11" ry="7" fill="url(#gus-cheek)" />

            {/* Kind arched eyebrows */}
            <path d="M138 55 C143 50 150 50 155 54" stroke="#856854" strokeWidth="3.5" strokeLinecap="round" />
            <path d="M167 54 C172 50 179 50 184 55" stroke="#856854" strokeWidth="3.5" strokeLinecap="round" />

            {/* Big Sparkling Disney Eyes with subtle blink */}
            <g className="gustavo-eyes" style={{ transformOrigin: '161px 67px' }}>
              <ellipse cx="147" cy="67" rx="7.6" ry="8.4" fill="#FFFFFF" />
              <circle cx="147.8" cy="67.5" r="4.8" fill="url(#gus-iris)" />
              <circle cx="148" cy="67.5" r="2.5" fill="#180D06" />
              <circle cx="145.8" cy="64.8" r="1.9" fill="#FFFFFF" />
              <path d="M139.5 63.5 C143.5 58.8 151.5 58.8 154.8 63.5" stroke="#5A3622" strokeWidth="2.1" strokeLinecap="round" />

              <ellipse cx="175" cy="67" rx="7.6" ry="8.4" fill="#FFFFFF" />
              <circle cx="174.2" cy="67.5" r="4.8" fill="url(#gus-iris)" />
              <circle cx="174" cy="67.5" r="2.5" fill="#180D06" />
              <circle cx="172.2" cy="64.8" r="1.9" fill="#FFFFFF" />
              <path d="M167.2 63.5 C170.5 58.8 178.5 58.8 182.5 63.5" stroke="#5A3622" strokeWidth="2.1" strokeLinecap="round" />
            </g>

            {/* Cute rounded Pixar nose */}
            <path d="M161 66 C165 73 167 78 164 82 C162 84 157 84 156 80" stroke="#C47852" strokeWidth="2.4" strokeLinecap="round" fill="none" />
            <ellipse cx="160" cy="77" rx="4" ry="2.5" fill="#FFECD8" fillOpacity="0.6" />

            {/* Big warm welcoming Disney smile */}
            <path d="M142 87 C148 101 174 101 180 87 C171 91 151 91 142 87 Z" fill="#8C2824" />
            <path d="M146 88.8 C153 92.8 169 92.8 176 88.8 C171 94 151 94 146 88.8 Z" fill="#FFFDF9" />
          </g>

          {/* Puffy 48h Pizza Dough Ball on the counter sill right in front of Gustavo */}
          <ellipse cx="144" cy="190" rx="30" ry="16" fill="url(#gus-dough)" />
          <ellipse cx="137" cy="184" rx="12" ry="4.5" fill="#FFFFFF" fillOpacity="0.65" />
        </g>

        {/* Chunky 3D Stainless Steel Range Hood (Cappa) overhanging top-left of kitchen window */}
        <path d="M198 392 L352 392 L382 442 L198 442 Z" fill="url(#steel-hood)" />
        <path d="M198 442 L382 442 L374 452 L198 452 Z" fill="#47505A" />
        {/* Hood specular metallic streak */}
        <path d="M220 396 L262 396 L282 438 L240 438 Z" fill="#FFFFFF" fillOpacity="0.35" />

        {/* Chunky white counter sill at bottom of kitchen window */}
        <rect x="198" y="546" width="252" height="12" rx="4" fill="#F8F4EC" />
        <rect x="198" y="546" width="252" height="3" fill="#FFFFFF" />
      </g>

      {/* Lower Left Storefront Plaque ("PORCIÓ MARGARITA · 3 €") */}
      <g filter="url(#soft-shadow)">
        <rect x="200" y="566" width="248" height="96" rx="14" fill="#FCF7EE" stroke="#E0D2BE" strokeWidth="3" />
        {/* Ornate red-brown inner frame */}
        <rect x="207" y="573" width="234" height="82" rx="9" fill="none" stroke="#B65B4B" strokeWidth="1.5" strokeOpacity="0.55" />
        {/* Circular La Piccerella emblem on left of plaque */}
        <circle cx="246" cy="614" r="29" fill="#FFFDF9" stroke="#C8372D" strokeWidth="2.8" />
        <circle cx="246" cy="614" r="23" fill="none" stroke="#3F6B3A" strokeWidth="1.2" strokeDasharray="3 2" />
        <text x="246" y="611" textAnchor="middle" fill="#2A1D17" fontSize="8.5" fontWeight="800" fontFamily="Georgia, serif">
          LA
        </text>
        <text x="246" y="622" textAnchor="middle" fill="#2A1D17" fontSize="8.2" fontWeight="900" fontFamily="Georgia, serif">
          PICCERELLA
        </text>
        {/* Right side: PORCIÓ MARGARITA 3€ */}
        <text x="360" y="592" textAnchor="middle" fill="#6D4B3B" fontSize="8.5" fontWeight="700" letterSpacing="1.1">
          PIZZERIA ARTESANAL
        </text>
        <text x="360" y="608" textAnchor="middle" fill="#261B16" fontSize="12.5" fontWeight="900" fontFamily="Georgia, serif">
          PORCIÓ MARGARITA
        </text>
        <text x="328" y="632" textAnchor="middle" fill="#C8372D" fontSize="22" fontWeight="900" fontFamily="Georgia, serif">
          3 €
        </text>
        <rect x="356" y="615" width="60" height="19" rx="9.5" fill="#F4E3CC" stroke="#C8372D" strokeWidth="1.2" />
        <text x="386" y="628" textAnchor="middle" fill="#8C2820" fontSize="8.5" fontWeight="800">
          PIZZETA
        </text>
        <text x="360" y="648" textAnchor="middle" fill="#5D463A" fontSize="8.5" fontWeight="700">
          Més de 15 sabors · Masa 48h
        </text>
      </g>

      {/* ════════════ RIGHT BAY: OPEN ENTRANCE + LIME-GREEN BRICK INTERIOR + PIZZETA 3€ SIGN ════════════ */}
      <g clipPath="url(#doorway-clip)">
        {/* Warm interior ceiling & back lime-green wall */}
        <rect x="466" y="394" width="254" height="270" fill="url(#lime-wall)" />
        {/* Warm wood floor */}
        <polygon points="466,664 720,664 684,598 500,598" fill="url(#wood-floor)" />
        {/* Iconic lime-green painted brick side wall on the right */}
        <polygon points="622,394 720,394 720,664 622,608" fill="#92AA2E" />
        <g stroke="#738A1F" strokeWidth="1.6" strokeOpacity="0.55">
          <line x1="622" y1="426" x2="720" y2="426" />
          <line x1="622" y1="454" x2="720" y2="454" />
          <line x1="622" y1="482" x2="720" y2="482" />
          <line x1="622" y1="510" x2="720" y2="510" />
          <line x1="622" y1="538" x2="720" y2="538" />
          <line x1="622" y1="566" x2="720" y2="566" />
        </g>

        {/* Warm wooden bar counter + 3 chunky barstools on the left of the entrance */}
        <polygon points="466,518 552,518 538,616 466,634" fill="#9C5D2D" />
        <polygon points="466,512 558,512 552,522 466,522" fill="#E9B97D" />
        {/* Cute chunky barstools */}
        {[512, 536].map((sx, idx) => (
          <g key={sx} transform={`translate(${sx}, ${578 + idx * 8})`}>
            <ellipse cx="0" cy="0" rx="14" ry="5.5" fill="#C97F42" />
            <line x1="-8" y1="4" x2="-10" y2="40" stroke="#2D2826" strokeWidth="3.5" strokeLinecap="round" />
            <line x1="8" y1="4" x2="10" y2="40" stroke="#2D2826" strokeWidth="3.5" strokeLinecap="round" />
            <line x1="-9" y1="24" x2="9" y2="24" stroke="#2D2826" strokeWidth="2.5" />
          </g>
        ))}

        {/* 2 Warm industrial bronze pendant lamps hanging in the entrance */}
        {[536, 594].map((lx, i) => (
          <g key={lx}>
            <line x1={lx} y1="394" x2={lx} y2={428 + i * 8} stroke="#2A2422" strokeWidth="2.8" />
            <path d={`M${lx - 18} ${442 + i * 8} C${lx - 18} ${424 + i * 8} ${lx + 18} ${424 + i * 8} ${lx + 18} ${442 + i * 8} Z`} fill="#4D362A" />
            <ellipse cx={lx} cy={443 + i * 8} rx="14" ry="4.5" fill="#FFE692" />
            <ellipse cx={lx} cy={458 + i * 8} rx="28" ry="18" fill="#FFE282" fillOpacity="0.2" />
          </g>
        ))}

        {/* Cute framed pizza posters on the right lime-green brick wall */}
        <rect x="642" y="486" width="24" height="32" rx="4" fill="#FCF5E8" stroke="#36271F" strokeWidth="2.5" />
        <circle cx="654" cy="502" r="7.5" fill="#E87D34" />
        <rect x="676" y="484" width="26" height="34" rx="4" fill="#FCF5E8" stroke="#36271F" strokeWidth="2.5" />
        <circle cx="689" cy="501" r="8" fill="#D94532" />

        {/* Iconic "PIZZETA 3€" Chunky 3D A-Frame Easel Sign by the entrance (exact match to real photo!) */}
        <g transform="translate(474, 558)" filter="url(#soft-shadow)">
          <rect x="0" y="0" width="54" height="92" rx="8" fill="#231F20" />
          <rect x="5" y="6" width="44" height="76" rx="5" fill="#FCEFD9" />
          <text x="27" y="23" textAnchor="middle" fill="#241914" fontSize="10" fontWeight="900" fontFamily="Georgia, serif">
            PIZZETA
          </text>
          <text x="27" y="45" textAnchor="middle" fill="#C8372D" fontSize="19" fontWeight="900" fontFamily="Georgia, serif">
            3€
          </text>
          {/* Mini 3D pepperoni pizza icon on the A-frame */}
          <circle cx="27" cy="64" r="13" fill="#E69244" />
          <circle cx="27" cy="64" r="10" fill="#FFD354" />
          <circle cx="23" cy="61" r="2.3" fill="#C8372D" />
          <circle cx="31" cy="62" r="2.3" fill="#C8372D" />
          <circle cx="27" cy="68" r="2.3" fill="#C8372D" />
        </g>

        {/* Right glass door panel specular sheen */}
        <polygon points="622,394 720,394 720,664 622,664" fill="#FFFFFF" fillOpacity="0.08" />
        <polygon points="646,394 674,394 630,664 622,664" fill="#FFFFFF" fillOpacity="0.16" />
        <line x1="622" y1="394" x2="622" y2="664" stroke="#1E1C1E" strokeWidth="4" />

        {/* Entrance metal doormat */}
        <polygon points="512,664 624,664 616,646 520,646" fill="#4D4845" />
      </g>

      {/* ── CUTE CHUNKY 3D PLANTER BOXES FLANKING THE CUBE (echoing Disney clay reference!) ── */}
      {[124, 718].map((px) => (
        <g key={px} transform={`translate(${px}, 608)`} filter="url(#soft-shadow)">
          {/* Puffy green bushes */}
          <circle cx="20" cy="14" r="18" fill="#468B3C" />
          <circle cx="40" cy="10" r="20" fill="#59A549" />
          <circle cx="58" cy="15" r="17" fill="#3F7E36" />
          {/* Tiny playful cream/pink blossoms */}
          <circle cx="20" cy="10" r="4" fill="#FFF3D6" />
          <circle cx="41" cy="6" r="4.5" fill="#FFB3A7" />
          <circle cx="57" cy="12" r="3.8" fill="#FFF3D6" />
          {/* Chunky terracotta planter pot */}
          <rect x="4" y="20" width="70" height="14" rx="7" fill="#E96B52" />
          <path d="M10 32 L68 32 L62 64 C61 68 58 70 54 70 L24 70 C20 70 17 68 16 64 Z" fill="#D4533C" />
          <rect x="12" y="23" width="54" height="4" rx="2" fill="#FF9C85" fillOpacity="0.55" />
        </g>
      ))}

      {/* ── SCALLOPED MINI AWNING UNDER THE SIGNBOARD (Italian / Artisanal Pizzeria accent) ── */}
      <g filter="url(#soft-shadow)">
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => {
          const x = 186 + i * 54.8;
          const colors = ['#C8372D', '#FFF7EA', '#3F6B3A', '#FFF7EA'];
          const fill = colors[i % 4];
          return (
            <path
              key={i}
              d={`M${x} 352 L${x + 54.8} 352 L${x + 54.8} 376 C${x + 54.8} 391 ${x} 391 ${x} 376 Z`}
              fill={fill}
            />
          );
        })}
      </g>

      {/* ── CHUNKY 3D ROUNDED SIGNBOARD BAND ("LA PICCERELLA") ── */}
      <g filter="url(#clay-shadow)">
        <rect x="126" y="226" width="668" height="132" rx="34" fill="url(#sign-band)" />
        {/* Top glossy 3D clay rim highlight */}
        <rect x="148" y="233" width="624" height="14" rx="7" fill="#FFE0AD" fillOpacity="0.55" />
        {/* Bottom warm shadow lip */}
        <rect x="148" y="344" width="624" height="10" rx="5" fill="#7D3208" fillOpacity="0.32" />

        {/* Puffy 3D Green-Outlined Cream Lettering "LA PICCERELLA" (matching the exact Disney clay style!) */}
        <text
          x="460"
          y="314"
          textAnchor="middle"
          fontSize="66"
          fontWeight="900"
          fontFamily="Georgia, 'Times New Roman', serif"
          letterSpacing="1.5"
          fill="#267339"
          stroke="#1D5C2C"
          strokeWidth="20"
          strokeLinejoin="round"
        >
          LA PICCERELLA
        </text>
        <text
          x="460"
          y="311"
          textAnchor="middle"
          fontSize="66"
          fontWeight="900"
          fontFamily="Georgia, 'Times New Roman', serif"
          letterSpacing="1.5"
          fill="#FFF9EE"
          stroke="#329449"
          strokeWidth="5"
          strokeLinejoin="round"
        >
          LA PICCERELLA
        </text>
      </g>

      {/* ── CHUNKY 3D ROOFTOP TIER & GIANT MELTED-CHEESE 3D PIZZA SLICE ON THE ROOF! ── */}
      {/* Upper Roof Pedestal & Chunky Orange Roof Cap */}
      <g filter="url(#clay-shadow)">
        {/* Recessed cream rooftop box */}
        <rect x="210" y="106" width="500" height="126" rx="22" fill="url(#roof-pedestal)" />
        {/* Chunky rounded orange roof crown cap */}
        <rect x="172" y="42" width="576" height="84" rx="28" fill="url(#roof-orange)" />
        <rect x="196" y="50" width="528" height="12" rx="6" fill="#FFE3B3" fillOpacity="0.55" />
      </g>

      {/* Subtle Animated Steam Wisps rising from the Giant Rooftop Pizza */}
      <g className="animate-steam-drift" opacity="0.55">
        <path d="M350 72 C340 48 362 34 352 12" stroke="#FFF4E0" strokeWidth="7" strokeLinecap="round" fill="none" />
        <path d="M460 56 C450 32 472 22 462 4" stroke="#FFF4E0" strokeWidth="6" strokeLinecap="round" fill="none" />
        <path d="M562 66 C552 44 574 30 564 10" stroke="#FFF4E0" strokeWidth="6.5" strokeLinecap="round" fill="none" />
      </g>

      {/* GIANT CHUNKY 3D PIXAR PIZZA SLICE SITTING ON TOP OF THE ROOF (with gooey cheese dripping over the sign!) */}
      <g filter="url(#cheese-shadow)">
        {/* Thin baked dough bottom edge under the slice */}
        <path
          d="M250 218 L636 218 L610 198 L272 198 Z"
          fill="#A8471E"
        />

        {/* Giant Golden Melted Cheese Triangle + 3 Gooey Playful Cheese Drips hanging over the signboard! */}
        <path
          d="M446 92
             L618 194
             C624 202 618 214 602 214
             L548 214
             C548 242 544 268 525 268
             C506 268 502 240 502 216
             L424 216
             C424 238 418 252 403 252
             C388 252 384 236 384 216
             L318 216
             C318 248 312 266 293 266
             C274 266 268 244 268 216
             L256 214
             C244 212 242 200 252 192
             Z"
          fill="url(#pizza-cheese-3d)"
        />
        {/* Glossy Pixar highlights on the melted cheese drips */}
        <ellipse cx="290" cy="242" rx="6" ry="12" fill="#FFFBE0" fillOpacity="0.6" />
        <ellipse cx="401" cy="234" rx="5" ry="9" fill="#FFFBE0" fillOpacity="0.6" />
        <ellipse cx="523" cy="244" rx="6.5" ry="13" fill="#FFFBE0" fillOpacity="0.6" />

        {/* Chunky 3D Puffy Rolled Pizza Crust (Cornicione) along the right-top edge */}
        <path
          d="M438 66
             C450 50 476 48 498 62
             L648 158
             C668 172 672 198 656 212
             C640 226 616 222 598 208
             L448 112
             C430 100 426 82 438 66 Z"
          fill="url(#pizza-crust-3d)"
        />
        {/* Glossy specular clay highlight along the puffy crust */}
        <path
          d="M466 68 L636 176"
          stroke="#FFD0A1"
          strokeWidth="12"
          strokeLinecap="round"
          strokeOpacity="0.52"
        />

        {/* Chunky 3D Pepperoni Circles on the Rooftop Pizza */}
        <g>
          <ellipse cx="434" cy="134" rx="28" ry="16" fill="url(#pep-3d)" />
          <ellipse cx="426" cy="129" rx="10" ry="4.5" fill="#FF9282" fillOpacity="0.5" />

          <ellipse cx="348" cy="186" rx="26" ry="15" fill="url(#pep-3d)" />
          <ellipse cx="341" cy="181" rx="9" ry="4" fill="#FF9282" fillOpacity="0.5" />

          <ellipse cx="476" cy="186" rx="29" ry="16" fill="url(#pep-3d)" />
          <ellipse cx="468" cy="181" rx="10" ry="4.5" fill="#FF9282" fillOpacity="0.5" />
        </g>

        {/* Chunky 3D Fresh Basil Leaves on the Rooftop Pizza */}
        <g>
          <path d="M388 154 C404 142 422 146 426 160 C410 170 392 166 388 154 Z" fill="#469641" />
          <path d="M394 156 L420 157" stroke="#A6E096" strokeWidth="2.2" strokeLinecap="round" />

          <path d="M518 164 C534 150 554 154 558 168 C542 178 524 174 518 164 Z" fill="#3D8538" />
          <path d="M524 166 L552 166" stroke="#A6E096" strokeWidth="2.2" strokeLinecap="round" />
        </g>
      </g>
    </svg>
  );
}
