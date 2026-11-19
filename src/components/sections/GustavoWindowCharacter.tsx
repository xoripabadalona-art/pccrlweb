'use client';

/**
 * Gustavo — owner & symbol of La Piccerella (Badalona), stylized in 3D Disney/Pixar
 * cartoon style inside the left kitchen window of the 3D cube storefront.
 * - Right hand (viewer left): holds the signature square pizza peel (pala) with gentle motion.
 * - Left hand (viewer right): waves warmly in a gentle continuous greeting animation.
 * - Respects prefers-reduced-motion via CSS media query in globals.css.
 */
export function GustavoWindowCharacter() {
  return (
    <div
      className="pointer-events-none absolute overflow-hidden"
      style={{
        /* Precisely registered to the left kitchen window interior of the 1920x1080 cube diorama */
        left: '25.8%',
        top: '35.8%',
        width: '23.4%',
        height: '22.4%',
      }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 320 220"
        className="h-full w-full drop-shadow-[0_6px_12px_rgba(10,8,6,0.45)]"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* 3D Pixar subsurface skin gradients */}
          <radialGradient id="g-skin-head" cx="42%" cy="30%" r="68%">
            <stop offset="0%" stopColor="#FFE1C6" />
            <stop offset="42%" stopColor="#F5BD96" />
            <stop offset="82%" stopColor="#DE976E" />
            <stop offset="100%" stopColor="#BF7752" />
          </radialGradient>
          <radialGradient id="g-skin-hand" cx="40%" cy="32%" r="68%">
            <stop offset="0%" stopColor="#FFE0C2" />
            <stop offset="55%" stopColor="#F1B58C" />
            <stop offset="100%" stopColor="#CE855E" />
          </radialGradient>
          <radialGradient id="g-cheek" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#EA6E5C" stopOpacity="0.48" />
            <stop offset="100%" stopColor="#EA6E5C" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="g-crown-shine" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFF7EB" stopOpacity="0.72" />
            <stop offset="65%" stopColor="#FFE8D0" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#FFE8D0" stopOpacity="0" />
          </radialGradient>

          {/* 3D clothing gradients (black t-shirt + black pizzaiolo apron) */}
          <linearGradient id="g-shirt" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#353944" />
            <stop offset="55%" stopColor="#20232A" />
            <stop offset="100%" stopColor="#121418" />
          </linearGradient>
          <linearGradient id="g-apron" x1="0.2" y1="0" x2="0.8" y2="1">
            <stop offset="0%" stopColor="#252830" />
            <stop offset="60%" stopColor="#16181E" />
            <stop offset="100%" stopColor="#0C0D11" />
          </linearGradient>

          {/* 3D brushed aluminum/white pizza peel (pala) */}
          <linearGradient id="g-peel-blade" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="48%" stopColor="#EDEFF3" />
            <stop offset="85%" stopColor="#D3D8E0" />
            <stop offset="100%" stopColor="#B8C0CC" />
          </linearGradient>
          <linearGradient id="g-peel-handle" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#C8CFD9" />
            <stop offset="50%" stopColor="#F5F7FA" />
            <stop offset="100%" stopColor="#9EA7B5" />
          </linearGradient>

          {/* 3D pizza dough ball resting on the counter */}
          <radialGradient id="g-dough" cx="42%" cy="28%" r="68%">
            <stop offset="0%" stopColor="#FFFDF8" />
            <stop offset="60%" stopColor="#F2E6D0" />
            <stop offset="100%" stopColor="#D8C4A4" />
          </radialGradient>

          {/* Soft Pixar eye iris */}
          <radialGradient id="g-iris" cx="40%" cy="35%" r="60%">
            <stop offset="0%" stopColor="#7C4E2D" />
            <stop offset="70%" stopColor="#4A2B16" />
            <stop offset="100%" stopColor="#2A160A" />
          </radialGradient>
        </defs>

        {/* ── RIGHT ARM + PIZZA PEEL (viewer's left) — gentle bob/tilt animation ── */}
        <g className="gustavo-peel-arm" style={{ transformOrigin: '108px 186px' }}>
          {/* Forearm holding peel handle */}
          <path
            d="M126 168 C114 176 102 184 96 196 C92 204 102 212 110 206 C120 198 130 188 138 178 Z"
            fill="url(#g-skin-hand)"
          />
          {/* Pizza Peel (Pala) handle */}
          <rect
            x="88"
            y="160"
            width="11"
            height="56"
            rx="5"
            transform="rotate(-7 93 188)"
            fill="url(#g-peel-handle)"
            stroke="#9AA4B2"
            strokeWidth="1.2"
          />
          {/* Large Rounded-Square Pizza Peel (Pala) Blade */}
          <path
            d="M36 92 C35 79 44 72 58 72 L106 72 C120 72 128 80 127 93 L122 146 C121 157 112 164 98 164 L66 164 C52 164 43 157 41 146 Z"
            transform="rotate(-7 82 118)"
            fill="url(#g-peel-blade)"
            stroke="#C2C9D4"
            strokeWidth="2"
          />
          {/* Peel inner metallic sheen highlight */}
          <path
            d="M48 84 L106 82 C113 82 117 87 116 94 L114 114 C94 102 68 106 46 118 L44 92 C44 87 45 84 48 84 Z"
            transform="rotate(-7 82 118)"
            fill="#FFFFFF"
            fillOpacity="0.65"
          />
          {/* Subtle flour dust on peel */}
          <ellipse
            cx="84"
            cy="128"
            rx="20"
            ry="10"
            transform="rotate(-7 84 128)"
            fill="#FFFDF7"
            fillOpacity="0.45"
          />
          {/* Fingers gripping the peel handle */}
          <ellipse cx="95" cy="193" rx="11" ry="8.5" fill="url(#g-skin-hand)" />
          <path
            d="M86 190 C90 187 98 187 102 190"
            stroke="#C77E58"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
          <path
            d="M87 195 C91 193 98 193 102 195"
            stroke="#C77E58"
            strokeWidth="1.3"
            strokeLinecap="round"
          />
        </g>

        {/* ── LEFT ARM + WAVING HAND (viewer's right) — friendly greeting wave ── */}
        <g className="gustavo-wave-arm" style={{ transformOrigin: '216px 146px' }}>
          {/* Raised forearm */}
          <path
            d="M204 152 C216 140 226 120 232 94 C234 86 248 88 247 98 C243 128 232 152 214 166 Z"
            fill="url(#g-skin-hand)"
          />
          {/* Expressive Disney/Pixar open waving hand (5 fingers!) */}
          <g transform="translate(239, 86) rotate(8)">
            {/* Palm */}
            <ellipse cx="0" cy="0" rx="12.5" ry="13.5" fill="url(#g-skin-hand)" />
            {/* Thumb */}
            <path
              d="M-10 4 C-18 -1 -19 -9 -14 -11 C-10 -13 -6 -6 -6 0 Z"
              fill="url(#g-skin-hand)"
            />
            {/* Index finger */}
            <rect x="-9" y="-27" width="5.6" height="19" rx="2.8" transform="rotate(-10 -6 -16)" fill="url(#g-skin-hand)" />
            {/* Middle finger */}
            <rect x="-2.6" y="-30" width="5.8" height="21" rx="2.9" fill="url(#g-skin-hand)" />
            {/* Ring finger */}
            <rect x="3.8" y="-28" width="5.6" height="19" rx="2.8" transform="rotate(8 6 -16)" fill="url(#g-skin-hand)" />
            {/* Pinky finger */}
            <rect x="9.2" y="-22" width="5.1" height="15" rx="2.5" transform="rotate(18 11 -13)" fill="url(#g-skin-hand)" />
            {/* Warm palm crease */}
            <path
              d="M-6 -2 C-1 -5 5 -4 8 -1"
              stroke="#C97F58"
              strokeWidth="1.3"
              strokeLinecap="round"
              fill="none"
            />
          </g>
        </g>

        {/* ── MAIN BODY & HEAD — subtle breathing & warm head-tilt bob ── */}
        <g className="gustavo-body" style={{ transformOrigin: '166px 210px' }}>
          {/* Black T-shirt shoulders & sleeves */}
          <path
            d="M112 220 C114 172 126 144 146 138 L188 138 C208 144 220 172 222 220 Z"
            fill="url(#g-shirt)"
          />
          {/* Right sleeve (viewer left) */}
          <path
            d="M142 142 C124 148 112 162 108 182 L130 186 C134 170 140 158 148 150 Z"
            fill="url(#g-shirt)"
          />
          {/* Left sleeve (viewer right, raised with waving arm) */}
          <path
            d="M188 140 C206 142 220 150 228 164 L210 178 C202 168 194 160 186 156 Z"
            fill="url(#g-shirt)"
          />

          {/* Black Pizzaiolo Apron with neck strap */}
          <path
            d="M149 134 C150 120 184 120 185 134"
            stroke="#101217"
            strokeWidth="5"
            fill="none"
          />
          <path
            d="M134 150 L198 150 L206 220 L126 220 Z"
            fill="url(#g-apron)"
          />
          {/* Subtle authentic flour dust on apron */}
          <ellipse cx="148" cy="186" rx="14" ry="7" fill="#F4EBDD" fillOpacity="0.09" />
          <ellipse cx="184" cy="196" rx="11" ry="6" fill="#F4EBDD" fillOpacity="0.07" />
          {/* Tiny warm red crest dot on apron chest */}
          <circle cx="182" cy="167" r="4.5" fill="#C8372D" fillOpacity="0.82" />
          <circle cx="182" cy="167" r="2.2" fill="#F4EBDD" fillOpacity="0.85" />

          {/* Neck */}
          <path
            d="M153 122 L179 122 L182 145 C172 151 160 151 150 145 Z"
            fill="url(#g-skin-head)"
          />
          {/* Neck chin shadow */}
          <ellipse cx="166" cy="129" rx="14" ry="6" fill="#A65E3B" fillOpacity="0.45" />

          {/* Friendly rounded ears */}
          <ellipse cx="136" cy="96" rx="7.5" ry="11" fill="url(#g-skin-head)" />
          <path d="M134 92 C137 94 137 99 134 101" stroke="#BF7550" strokeWidth="1.5" strokeLinecap="round" />
          <ellipse cx="196" cy="96" rx="7.5" ry="11" fill="url(#g-skin-head)" />
          <path d="M198 92 C195 94 195 99 198 101" stroke="#BF7550" strokeWidth="1.5" strokeLinecap="round" />

          {/* Expressive 3D Disney/Pixar Bald Head */}
          <path
            d="M137 90 C137 56 150 44 166 44 C182 44 195 56 195 90 C195 114 182 129 166 129 C150 129 137 114 137 90 Z"
            fill="url(#g-skin-head)"
          />
          {/* Warm specular Pixar sheen on Gustavo's bald forehead */}
          <ellipse cx="158" cy="60" rx="14" ry="8" transform="rotate(-14 158 60)" fill="url(#g-crown-shine)" />

          {/* Warm rosy Pixar cheeks */}
          <ellipse cx="149" cy="102" rx="9" ry="6" fill="url(#g-cheek)" />
          <ellipse cx="183" cy="102" rx="9" ry="6" fill="url(#g-cheek)" />

          {/* Cheerful arched eyebrows */}
          <path
            d="M146 79 C150 75 156 75 160 78"
            stroke="#8A6E5A"
            strokeWidth="2.8"
            strokeLinecap="round"
          />
          <path
            d="M172 78 C176 75 182 75 186 79"
            stroke="#8A6E5A"
            strokeWidth="2.8"
            strokeLinecap="round"
          />

          {/* Big Expressive Disney/Pixar Eyes (with subtle natural blink) */}
          <g className="gustavo-eyes" style={{ transformOrigin: '166px 89px' }}>
            {/* Left eye */}
            <ellipse cx="154" cy="89" rx="6.2" ry="6.8" fill="#FFFFFF" />
            <circle cx="154.6" cy="89.5" r="3.9" fill="url(#g-iris)" />
            <circle cx="154.8" cy="89.5" r="2.0" fill="#180D06" />
            <circle cx="153.1" cy="87.4" r="1.45" fill="#FFFFFF" />
            <circle cx="156.4" cy="91.2" r="0.65" fill="#FFFFFF" fillOpacity="0.8" />
            <path d="M147.8 86.2 C151 82.4 157.5 82.4 160.2 86.2" stroke="#5E3924" strokeWidth="1.7" strokeLinecap="round" />

            {/* Right eye */}
            <ellipse cx="178" cy="89" rx="6.2" ry="6.8" fill="#FFFFFF" />
            <circle cx="177.4" cy="89.5" r="3.9" fill="url(#g-iris)" />
            <circle cx="177.2" cy="89.5" r="2.0" fill="#180D06" />
            <circle cx="175.8" cy="87.4" r="1.45" fill="#FFFFFF" />
            <circle cx="179.1" cy="91.2" r="0.65" fill="#FFFFFF" fillOpacity="0.8" />
            <path d="M171.8 86.2 C174.5 82.4 181 82.4 184.2 86.2" stroke="#5E3924" strokeWidth="1.7" strokeLinecap="round" />
          </g>

          {/* Rounded friendly Pixar nose */}
          <path
            d="M166 89 C169 95 171 99 169 102 C167 104 163 104 162 101"
            stroke="#C77B54"
            strokeWidth="1.9"
            strokeLinecap="round"
            fill="none"
          />
          <ellipse cx="165.5" cy="98.5" rx="3.2" ry="2" fill="#FFE7D1" fillOpacity="0.55" />

          {/* Big proud welcoming Disney smile */}
          <path
            d="M151 107 C156 118 176 118 181 107 C174 110 158 110 151 107 Z"
            fill="#8E2B26"
          />
          {/* Upper smile teeth */}
          <path
            d="M154 108.4 C160 111.5 172 111.5 178 108.4 C174 112.5 158 112.5 154 108.4 Z"
            fill="#FFFDF9"
          />
          {/* Smile dimple creases */}
          <path d="M148 105 C147 108 148.5 110 150.5 110" stroke="#C57A54" strokeWidth="1.4" strokeLinecap="round" />
          <path d="M184 105 C185 108 183.5 110 181.5 110" stroke="#C57A54" strokeWidth="1.4" strokeLinecap="round" />
        </g>

        {/* ── FOREGROUND 48h DOUGH BALL & WHITE COUNTER SILL (grounds Gustavo inside the kitchen!) ── */}
        <ellipse cx="152" cy="212" rx="28" ry="15" fill="url(#g-dough)" />
        <ellipse cx="146" cy="206" rx="11" ry="4.5" fill="#FFFFFF" fillOpacity="0.6" />
        {/* White counter ledge trim */}
        <rect x="0" y="213" width="320" height="7" fill="#F2EFEA" />
        <rect x="0" y="213" width="320" height="1.5" fill="#D4CFC7" />
      </svg>
    </div>
  );
}
