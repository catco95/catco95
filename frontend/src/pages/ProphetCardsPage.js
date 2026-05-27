import { useState } from "react";
import { Link } from "react-router-dom";

const prophets = [
  {
    number: "01",
    arabicName: "نُوحٌ",
    englishName: "PROPHET NUH",
    subtitle: "WHO BUILT THE ARK",
    description: "A prophet of perseverance, patience and unwavering faith.",
    traits: [
      { label: "PATIENCE", icon: "patience" },
      { label: "FAITH", icon: "faith" },
      { label: "OBEDIENCE", icon: "obedience" },
      { label: "ENDURANCE", icon: "endurance" },
      { label: "WISDOM", icon: "wisdom" },
    ],
    accentColor: "#b8860b",
    bgFrom: "#0a1628",
    bgTo: "#0d2137",
  },
  {
    number: "02",
    arabicName: "إِبْرَاهِيمُ",
    englishName: "PROPHET IBRAHIM",
    subtitle: "FRIEND OF ALLAH",
    description: "A prophet of submission, sacrifice and pure monotheism.",
    traits: [
      { label: "SACRIFICE", icon: "sacrifice" },
      { label: "TAWAKKUL", icon: "trust" },
      { label: "SINCERITY", icon: "sincerity" },
      { label: "COURAGE", icon: "courage" },
      { label: "DEVOTION", icon: "devotion" },
    ],
    accentColor: "#c8960c",
    bgFrom: "#100a0a",
    bgTo: "#1a0e0e",
  },
  {
    number: "03",
    arabicName: "مُوسَىٰ",
    englishName: "PROPHET MUSA",
    subtitle: "WHO SPOKE WITH ALLAH",
    description: "A prophet of courage, guidance and divine conversation.",
    traits: [
      { label: "TRUST", icon: "trust" },
      { label: "REVELATION", icon: "revelation" },
      { label: "PATIENCE", icon: "patience" },
      { label: "MIRACLE", icon: "miracle" },
      { label: "GUIDANCE", icon: "guidance" },
    ],
    accentColor: "#d4a017",
    bgFrom: "#050505",
    bgTo: "#0d1a0d",
  },
  {
    number: "04",
    arabicName: "عِيسَىٰ",
    englishName: "PROPHET ISA",
    subtitle: "SPIRIT OF ALLAH",
    description: "A prophet of mercy, healing and divine signs.",
    traits: [
      { label: "MERCY", icon: "mercy" },
      { label: "HEALING", icon: "healing" },
      { label: "TRUTH", icon: "truth" },
      { label: "PURITY", icon: "purity" },
      { label: "SIGNS", icon: "signs" },
    ],
    accentColor: "#c8a415",
    bgFrom: "#080814",
    bgTo: "#0f0f1e",
  },
  {
    number: "05",
    arabicName: "مُحَمَّدٌ",
    englishName: "PROPHET MUHAMMAD",
    subtitle: "SEAL OF THE PROPHETS",
    description: "The final messenger, mercy to all the worlds.",
    traits: [
      { label: "MERCY", icon: "mercy" },
      { label: "JUSTICE", icon: "justice" },
      { label: "WISDOM", icon: "wisdom" },
      { label: "COURAGE", icon: "courage" },
      { label: "TRUTH", icon: "truth" },
    ],
    accentColor: "#d4af37",
    bgFrom: "#0a0a05",
    bgTo: "#161208",
  },
];

const TraitIcon = ({ icon, size = 28 }) => {
  const s = size;
  const icons = {
    trust: (
      <svg width={s} height={s} viewBox="0 0 32 32" fill="none">
        <path d="M16 4 L20 12 L28 13 L22 19 L23.5 27 L16 23 L8.5 27 L10 19 L4 13 L12 12 Z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
        <circle cx="16" cy="16" r="4" stroke="currentColor" strokeWidth="1.2" fill="none"/>
      </svg>
    ),
    revelation: (
      <svg width={s} height={s} viewBox="0 0 32 32" fill="none">
        <rect x="6" y="5" width="20" height="22" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none"/>
        <line x1="10" y1="11" x2="22" y2="11" stroke="currentColor" strokeWidth="1.2"/>
        <line x1="10" y1="15" x2="22" y2="15" stroke="currentColor" strokeWidth="1.2"/>
        <line x1="10" y1="19" x2="18" y2="19" stroke="currentColor" strokeWidth="1.2"/>
        <path d="M8 9 L10 7 L10 11 Z" fill="currentColor"/>
        <path d="M8 13 L10 11 L10 15 Z" fill="currentColor"/>
        <path d="M8 17 L10 15 L10 19 Z" fill="currentColor"/>
      </svg>
    ),
    patience: (
      <svg width={s} height={s} viewBox="0 0 32 32" fill="none">
        <polygon points="16,4 20,10 28,12 22,18 23,26 16,22 9,26 10,18 4,12 12,10" stroke="currentColor" strokeWidth="1.5" fill="none"/>
        <path d="M12 20 L16 8 L20 20" stroke="currentColor" strokeWidth="1.2" fill="none"/>
        <line x1="13" y1="17" x2="19" y2="17" stroke="currentColor" strokeWidth="1.2"/>
      </svg>
    ),
    miracle: (
      <svg width={s} height={s} viewBox="0 0 32 32" fill="none">
        <path d="M16 5 C16 5 10 12 10 18 C10 21.3 12.7 24 16 24 C19.3 24 22 21.3 22 18 C22 12 16 5 16 5Z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
        <path d="M10 18 C8 20 6 22 8 25" stroke="currentColor" strokeWidth="1.2"/>
        <path d="M22 18 C24 20 26 22 24 25" stroke="currentColor" strokeWidth="1.2"/>
        <line x1="16" y1="24" x2="16" y2="28" stroke="currentColor" strokeWidth="1.5"/>
        <line x1="14" y1="14" x2="18" y2="18" stroke="currentColor" strokeWidth="1.2"/>
      </svg>
    ),
    guidance: (
      <svg width={s} height={s} viewBox="0 0 32 32" fill="none">
        <rect x="7" y="4" width="14" height="20" rx="1.5" stroke="currentColor" strokeWidth="1.5" fill="none"/>
        <path d="M7 24 L7 28 L21 28 L21 24" stroke="currentColor" strokeWidth="1.2" fill="none"/>
        <line x1="10" y1="9" x2="18" y2="9" stroke="currentColor" strokeWidth="1.2"/>
        <line x1="10" y1="13" x2="18" y2="13" stroke="currentColor" strokeWidth="1.2"/>
        <line x1="10" y1="17" x2="15" y2="17" stroke="currentColor" strokeWidth="1.2"/>
        <path d="M14 4 L14 2 M11 5 L9 3 M17 5 L19 3" stroke="currentColor" strokeWidth="1.2"/>
      </svg>
    ),
    faith: (
      <svg width={s} height={s} viewBox="0 0 32 32" fill="none">
        <path d="M16 6 L18 14 L26 14 L20 19 L22 27 L16 22 L10 27 L12 19 L6 14 L14 14 Z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
      </svg>
    ),
    obedience: (
      <svg width={s} height={s} viewBox="0 0 32 32" fill="none">
        <circle cx="16" cy="16" r="11" stroke="currentColor" strokeWidth="1.5" fill="none"/>
        <path d="M10 16 L14 20 L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    endurance: (
      <svg width={s} height={s} viewBox="0 0 32 32" fill="none">
        <path d="M8 26 L16 6 L24 26" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinejoin="round"/>
        <path d="M10 20 L22 20" stroke="currentColor" strokeWidth="1.2"/>
        <path d="M16 6 L16 3" stroke="currentColor" strokeWidth="1.5"/>
        <circle cx="16" cy="2.5" r="1.5" fill="currentColor"/>
      </svg>
    ),
    wisdom: (
      <svg width={s} height={s} viewBox="0 0 32 32" fill="none">
        <path d="M16 5 C11 5 7 9 7 14 C7 17.5 9 20.5 12 22 L12 26 L20 26 L20 22 C23 20.5 25 17.5 25 14 C25 9 21 5 16 5Z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
        <line x1="12" y1="26" x2="20" y2="26" stroke="currentColor" strokeWidth="1.5"/>
        <line x1="13" y1="28" x2="19" y2="28" stroke="currentColor" strokeWidth="1.2"/>
        <line x1="16" y1="12" x2="16" y2="18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="16" cy="10" r="1" fill="currentColor"/>
      </svg>
    ),
    sacrifice: (
      <svg width={s} height={s} viewBox="0 0 32 32" fill="none">
        <path d="M16 5 L16 20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
        <path d="M9 12 L23 12" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M7 26 Q16 20 25 26" stroke="currentColor" strokeWidth="1.3" fill="none"/>
        <circle cx="16" cy="5" r="2" stroke="currentColor" strokeWidth="1.2" fill="none"/>
      </svg>
    ),
    sincerity: (
      <svg width={s} height={s} viewBox="0 0 32 32" fill="none">
        <path d="M16 8 C16 8 8 13 8 19 C8 22.3 11.6 25 16 25 C20.4 25 24 22.3 24 19 C24 13 16 8 16 8Z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
        <path d="M12 19 L15 22 L20 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    courage: (
      <svg width={s} height={s} viewBox="0 0 32 32" fill="none">
        <path d="M16 4 L16 28" stroke="currentColor" strokeWidth="1.8"/>
        <path d="M8 8 L16 4 L24 8 L24 18 L16 28 L8 18 Z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
        <path d="M11 13 L15 17 L21 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    devotion: (
      <svg width={s} height={s} viewBox="0 0 32 32" fill="none">
        <path d="M16 8 L7 15 L10 27 L16 24 L22 27 L25 15 Z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
        <path d="M16 8 L16 5" stroke="currentColor" strokeWidth="1.5"/>
        <circle cx="16" cy="4" r="2" stroke="currentColor" strokeWidth="1.2" fill="none"/>
        <path d="M12 19 L16 14 L20 19" stroke="currentColor" strokeWidth="1.2" fill="none"/>
      </svg>
    ),
    mercy: (
      <svg width={s} height={s} viewBox="0 0 32 32" fill="none">
        <path d="M16 27 L6 17 C4 15 4 12 6 10 C8 8 11 8 13 10 L16 13 L19 10 C21 8 24 8 26 10 C28 12 28 15 26 17 Z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
        <path d="M16 14 L16 22" stroke="currentColor" strokeWidth="1.2"/>
        <path d="M13 19 L19 19" stroke="currentColor" strokeWidth="1.2"/>
      </svg>
    ),
    healing: (
      <svg width={s} height={s} viewBox="0 0 32 32" fill="none">
        <path d="M13 5 L13 13 L5 13 L5 19 L13 19 L13 27 L19 27 L19 19 L27 19 L27 13 L19 13 L19 5 Z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
      </svg>
    ),
    truth: (
      <svg width={s} height={s} viewBox="0 0 32 32" fill="none">
        <circle cx="16" cy="16" r="11" stroke="currentColor" strokeWidth="1.5" fill="none"/>
        <line x1="16" y1="5" x2="16" y2="8" stroke="currentColor" strokeWidth="1.5"/>
        <line x1="16" y1="24" x2="16" y2="27" stroke="currentColor" strokeWidth="1.5"/>
        <line x1="5" y1="16" x2="8" y2="16" stroke="currentColor" strokeWidth="1.5"/>
        <line x1="24" y1="16" x2="27" y2="16" stroke="currentColor" strokeWidth="1.5"/>
        <circle cx="16" cy="16" r="4" stroke="currentColor" strokeWidth="1.2" fill="none"/>
      </svg>
    ),
    purity: (
      <svg width={s} height={s} viewBox="0 0 32 32" fill="none">
        <path d="M16 4 C12 10 7 15 7 20 C7 23.9 11.1 27 16 27 C20.9 27 25 23.9 25 20 C25 15 20 10 16 4Z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
        <path d="M12 20 C12 17.8 13.8 16 16 16" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
      </svg>
    ),
    signs: (
      <svg width={s} height={s} viewBox="0 0 32 32" fill="none">
        <path d="M16 4 L28 10 L28 22 L16 28 L4 22 L4 10 Z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
        <path d="M16 10 L20 16 L16 22 L12 16 Z" stroke="currentColor" strokeWidth="1.2" fill="none"/>
        <circle cx="16" cy="16" r="2" fill="currentColor"/>
      </svg>
    ),
    justice: (
      <svg width={s} height={s} viewBox="0 0 32 32" fill="none">
        <line x1="16" y1="5" x2="16" y2="27" stroke="currentColor" strokeWidth="1.5"/>
        <line x1="10" y1="10" x2="22" y2="10" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M7 14 L13 14 L10 20 Z" stroke="currentColor" strokeWidth="1.2" fill="none"/>
        <path d="M19 14 L25 14 L22 20 Z" stroke="currentColor" strokeWidth="1.2" fill="none"/>
        <line x1="13" y1="26" x2="19" y2="26" stroke="currentColor" strokeWidth="1.5"/>
      </svg>
    ),
  };
  return icons[icon] || icons["truth"];
};

const IslamicCorner = ({ position }) => {
  const transforms = {
    tl: "translate(0,0)",
    tr: "translate(100,0) scale(-1,1)",
    bl: "translate(0,100) scale(1,-1)",
    br: "translate(100,100) scale(-1,-1)",
  };
  return (
    <svg
      width="60"
      height="60"
      viewBox="0 0 100 100"
      className="absolute"
      style={{
        top: position.includes("t") ? 0 : "auto",
        bottom: position.includes("b") ? 0 : "auto",
        left: position.includes("l") ? 0 : "auto",
        right: position.includes("r") ? 0 : "auto",
      }}
    >
      <g transform={transforms[position]}>
        <path
          d="M5 5 L40 5 L40 10 L10 10 L10 40 L5 40 Z"
          fill="#d4af37"
          opacity="0.9"
        />
        <path
          d="M5 5 L5 25 Q5 8 22 5 Z"
          fill="#d4af37"
          opacity="0.5"
        />
        <circle cx="18" cy="18" r="4" fill="none" stroke="#d4af37" strokeWidth="1" opacity="0.7"/>
        <path d="M14 14 L18 10 L22 14 L22 22 L18 26 L14 22 Z" fill="none" stroke="#d4af37" strokeWidth="0.8" opacity="0.5"/>
      </g>
    </svg>
  );
};

const ProphetCard = ({ prophet, total = 5 }) => {
  const gold = "#d4af37";
  const lightGold = "#f0d060";

  return (
    <div
      className="relative select-none"
      style={{
        width: 380,
        minHeight: 560,
        background: `radial-gradient(ellipse at 50% 40%, #1a1a0a 0%, ${prophet.bgFrom} 60%, #000 100%)`,
        border: `2px solid ${gold}`,
        borderRadius: 12,
        boxShadow: `0 0 40px rgba(212,175,55,0.25), inset 0 0 60px rgba(0,0,0,0.6)`,
        fontFamily: "'Georgia', 'Times New Roman', serif",
        overflow: "hidden",
      }}
    >
      {/* Outer border inset */}
      <div
        className="absolute inset-2 rounded-lg pointer-events-none"
        style={{ border: `1px solid rgba(212,175,55,0.35)`, borderRadius: 8 }}
      />

      {/* Corner ornaments */}
      <IslamicCorner position="tl" />
      <IslamicCorner position="tr" />
      <IslamicCorner position="bl" />
      <IslamicCorner position="br" />

      {/* Top header */}
      <div className="relative z-10 pt-4 px-5 flex items-start justify-between">
        {/* Number badge */}
        <div
          className="flex flex-col items-center"
          style={{ border: `1px solid ${gold}`, padding: "4px 10px", borderRadius: 4 }}
        >
          <span style={{ color: gold, fontSize: 28, fontWeight: "bold", lineHeight: 1 }}>
            {prophet.number}
          </span>
          <span style={{ color: gold, fontSize: 10, letterSpacing: 1 }}>
            OF {String(total).padStart(2, "0")}
          </span>
          <div style={{ color: gold, fontSize: 14, marginTop: 2 }}>⚜</div>
        </div>

        {/* Series title */}
        <div className="flex flex-col items-center flex-1 px-3 pt-1">
          <div className="flex items-center gap-2">
            <div style={{ height: 1, width: 20, background: gold, opacity: 0.6 }} />
            <span style={{ color: gold, fontSize: 11, letterSpacing: 3, fontWeight: "bold" }}>
              ULUL AZM
            </span>
            <div style={{ height: 1, width: 20, background: gold, opacity: 0.6 }} />
          </div>
          <div className="flex items-center gap-1 mt-1">
            <div style={{ height: 1, width: 8, background: gold, opacity: 0.5 }} />
            <span style={{ color: lightGold, fontSize: 9, letterSpacing: 2 }}>TREASURY EDITION</span>
            <div style={{ height: 1, width: 8, background: gold, opacity: 0.5 }} />
          </div>
          {/* Decorative diamond row */}
          <div className="flex items-center gap-1 mt-1">
            <svg width="40" height="8" viewBox="0 0 40 8">
              <line x1="0" y1="4" x2="14" y2="4" stroke={gold} strokeWidth="0.8" opacity="0.6"/>
              <rect x="16" y="2" width="4" height="4" fill={gold} opacity="0.7" transform="rotate(45 18 4)"/>
              <rect x="20" y="3" width="2" height="2" fill={gold} opacity="0.5" transform="rotate(45 21 4)"/>
              <line x1="24" y1="4" x2="40" y2="4" stroke={gold} strokeWidth="0.8" opacity="0.6"/>
            </svg>
          </div>
        </div>

        {/* Arabic badge top right */}
        <div
          className="flex flex-col items-center justify-center"
          style={{
            border: `1px solid ${gold}`,
            padding: "4px 8px",
            borderRadius: 4,
            background: "rgba(0,0,0,0.4)",
          }}
        >
          <span style={{ color: gold, fontSize: 12, direction: "rtl", lineHeight: 1.4 }}>أُولُو</span>
          <span style={{ color: gold, fontSize: 12, direction: "rtl", lineHeight: 1.4 }}>الْعَزْمِ</span>
        </div>
      </div>

      {/* Arabic name */}
      <div className="relative z-10 text-center mt-3 px-4">
        <div
          style={{
            color: gold,
            fontSize: 58,
            fontFamily: "'Georgia', serif",
            lineHeight: 1,
            textShadow: `0 0 30px rgba(212,175,55,0.6), 0 2px 8px rgba(0,0,0,0.8)`,
            letterSpacing: 4,
          }}
        >
          {prophet.arabicName}
        </div>
      </div>

      {/* Decorative divider */}
      <div className="relative z-10 flex items-center justify-center gap-2 mt-1 px-8">
        <div style={{ height: 1, flex: 1, background: `linear-gradient(to right, transparent, ${gold})`, opacity: 0.5 }} />
        <span style={{ color: gold, fontSize: 11, letterSpacing: 1, direction: "rtl" }}>عليه السلام</span>
        <div style={{ height: 1, flex: 1, background: `linear-gradient(to left, transparent, ${gold})`, opacity: 0.5 }} />
      </div>

      {/* Scene illustration area */}
      <div
        className="relative mx-4 mt-3 overflow-hidden"
        style={{
          height: 160,
          borderRadius: 6,
          border: `1px solid rgba(212,175,55,0.3)`,
          background: `radial-gradient(ellipse at 50% 70%, rgba(180,120,0,0.4) 0%, rgba(5,20,5,0.9) 60%, rgba(0,0,0,0.95) 100%)`,
        }}
      >
        <SceneIllustration prophet={prophet} />
      </div>

      {/* English name */}
      <div className="relative z-10 text-center mt-3 px-4">
        <div className="flex items-center justify-center gap-2 mb-1">
          <div style={{ height: 1, width: 30, background: gold, opacity: 0.5 }} />
          <span style={{ color: "rgba(212,175,55,0.7)", fontSize: 10, letterSpacing: 2, direction: "rtl" }}>عليه السلام</span>
          <div style={{ height: 1, width: 30, background: gold, opacity: 0.5 }} />
        </div>
        <div
          style={{
            color: "#fff",
            fontSize: 20,
            fontWeight: "bold",
            letterSpacing: 4,
            textShadow: "0 1px 4px rgba(0,0,0,0.8)",
          }}
        >
          {prophet.englishName}
        </div>
        <div className="flex items-center justify-center gap-2 mt-1">
          <div style={{ height: 1, width: 40, background: gold, opacity: 0.5 }} />
          <span style={{ color: "rgba(212,175,55,0.6)", fontSize: 10, letterSpacing: 2, direction: "rtl" }}>عليه السلام</span>
          <div style={{ height: 1, width: 40, background: gold, opacity: 0.5 }} />
        </div>
      </div>

      {/* Islamic rosette */}
      <div className="flex justify-center mt-2">
        <IslamicRosette size={24} color={gold} />
      </div>

      {/* Subtitle banner */}
      <div className="relative mx-4 mt-2">
        <div
          style={{
            border: `1px solid ${gold}`,
            borderRadius: 4,
            padding: "6px 12px",
            background: "rgba(0,0,0,0.5)",
            textAlign: "center",
          }}
        >
          {/* Banner corner decorations */}
          <div style={{ position: "absolute", top: -1, left: -1, width: 8, height: 8, border: `1px solid ${gold}`, borderRadius: "0 0 4px 0" }} />
          <div style={{ position: "absolute", top: -1, right: -1, width: 8, height: 8, border: `1px solid ${gold}`, borderRadius: "0 0 0 4px" }} />
          <div style={{ position: "absolute", bottom: -1, left: -1, width: 8, height: 8, border: `1px solid ${gold}`, borderRadius: "0 4px 0 0" }} />
          <div style={{ position: "absolute", bottom: -1, right: -1, width: 8, height: 8, border: `1px solid ${gold}`, borderRadius: "4px 0 0 0" }} />
          <div
            style={{
              color: gold,
              fontSize: 14,
              fontWeight: "bold",
              letterSpacing: 2,
              textTransform: "uppercase",
            }}
          >
            {prophet.subtitle}
          </div>
          <div
            style={{
              color: "rgba(255,255,255,0.75)",
              fontSize: 9.5,
              letterSpacing: 1.5,
              marginTop: 2,
              textTransform: "uppercase",
            }}
          >
            {prophet.description}
          </div>
        </div>
      </div>

      {/* Trait icons */}
      <div className="flex justify-between px-4 mt-3 gap-1">
        {prophet.traits.map((trait) => (
          <div
            key={trait.label}
            className="flex flex-col items-center gap-1"
            style={{ flex: 1 }}
          >
            <div
              style={{
                border: `1px solid ${gold}`,
                borderRadius: 6,
                padding: "6px 4px 4px",
                background: "rgba(0,0,0,0.4)",
                color: gold,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "100%",
                aspectRatio: "3/4",
                position: "relative",
              }}
            >
              {/* Arch top */}
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: "60%",
                  height: "40%",
                  borderRadius: "50% 50% 0 0",
                  border: `1px solid rgba(212,175,55,0.4)`,
                  borderBottom: "none",
                  top: -1,
                }}
              />
              <TraitIcon icon={trait.icon} size={22} />
            </div>
            <span
              style={{
                color: gold,
                fontSize: 7.5,
                letterSpacing: 0.8,
                textAlign: "center",
                fontWeight: "bold",
                textTransform: "uppercase",
              }}
            >
              {trait.label}
            </span>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="relative z-10 mt-3 mb-4 px-6 flex flex-col items-center gap-1">
        <div className="flex items-center gap-2 w-full">
          <div style={{ height: 1, flex: 1, background: gold, opacity: 0.4 }} />
          <div
            style={{
              border: `1px solid ${gold}`,
              padding: "2px 14px",
              borderRadius: 3,
              color: gold,
              fontSize: 9,
              letterSpacing: 2,
              whiteSpace: "nowrap",
            }}
          >
            CARD {prophet.number} OF {String(total).padStart(2, "0")}
          </div>
          <div style={{ height: 1, flex: 1, background: gold, opacity: 0.4 }} />
        </div>
        <div className="flex items-center gap-3 mt-1">
          <span style={{ color: gold, fontSize: 9, letterSpacing: 2 }}>COLLECT</span>
          <span style={{ color: gold, fontSize: 10 }}>✦</span>
          <span style={{ color: gold, fontSize: 9, letterSpacing: 2 }}>LEARN</span>
          <span style={{ color: gold, fontSize: 10 }}>✦</span>
          <span style={{ color: gold, fontSize: 9, letterSpacing: 2 }}>REMEMBER</span>
        </div>
      </div>
    </div>
  );
};

const IslamicRosette = ({ size = 24, color = "#d4af37" }) => {
  const r = size;
  const petals = 8;
  return (
    <svg width={r * 2} height={r * 2} viewBox="0 0 48 48">
      {Array.from({ length: petals }).map((_, i) => {
        const angle = (i * 360) / petals;
        return (
          <ellipse
            key={i}
            cx="24"
            cy="14"
            rx="3"
            ry="9"
            fill="none"
            stroke={color}
            strokeWidth="0.8"
            opacity="0.8"
            transform={`rotate(${angle} 24 24)`}
          />
        );
      })}
      <circle cx="24" cy="24" r="4" fill="none" stroke={color} strokeWidth="0.8" opacity="0.7"/>
      <circle cx="24" cy="24" r="2" fill={color} opacity="0.6"/>
    </svg>
  );
};

const SceneIllustration = ({ prophet }) => {
  const scenes = {
    "01": <NuhScene />,
    "02": <IbrahimScene />,
    "03": <MusaScene />,
    "04": <IsaScene />,
    "05": <MuhammadScene />,
  };
  return scenes[prophet.number] || <MusaScene />;
};

const MusaScene = () => (
  <svg width="100%" height="100%" viewBox="0 0 340 160" preserveAspectRatio="xMidYMid slice">
    <defs>
      <radialGradient id="musa-glow" cx="50%" cy="60%" r="50%">
        <stop offset="0%" stopColor="#d4a017" stopOpacity="0.9"/>
        <stop offset="40%" stopColor="#7a5500" stopOpacity="0.5"/>
        <stop offset="100%" stopColor="#000" stopOpacity="0"/>
      </radialGradient>
      <radialGradient id="musa-sky" cx="50%" cy="50%" r="70%">
        <stop offset="0%" stopColor="#1a1200"/>
        <stop offset="100%" stopColor="#000"/>
      </radialGradient>
    </defs>
    <rect width="340" height="160" fill="url(#musa-sky)"/>
    <ellipse cx="170" cy="100" rx="100" ry="70" fill="url(#musa-glow)"/>
    {/* Left wave */}
    <path d="M0 40 Q20 20 40 35 Q60 50 80 30 Q100 10 120 35 Q140 60 130 90 Q120 120 80 130 L0 130 Z" fill="#0a2a15" opacity="0.95"/>
    <path d="M0 30 Q25 10 50 28 Q75 46 90 25 Q110 0 130 28 Q150 56 140 100 L0 120Z" fill="#0d3318" opacity="0.8"/>
    <path d="M10 20 Q30 5 55 22 Q80 39 95 18 Q118 -5 138 24" fill="none" stroke="#1a5a28" strokeWidth="3" opacity="0.7"/>
    {/* Right wave */}
    <path d="M340 40 Q320 20 300 35 Q280 50 260 30 Q240 10 220 35 Q200 60 210 90 Q220 120 260 130 L340 130 Z" fill="#0a2a15" opacity="0.95"/>
    <path d="M340 30 Q315 10 290 28 Q265 46 250 25 Q230 0 210 28 Q190 56 200 100 L340 120Z" fill="#0d3318" opacity="0.8"/>
    <path d="M330 20 Q310 5 285 22 Q260 39 245 18 Q222 -5 202 24" fill="none" stroke="#1a5a28" strokeWidth="3" opacity="0.7"/>
    {/* Path between waves */}
    <path d="M125 80 Q170 70 215 80 L215 160 L125 160 Z" fill="#1a0e00" opacity="0.5"/>
    <path d="M130 90 Q170 82 210 90 Q170 78 130 90Z" fill="#d4a017" opacity="0.15"/>
    {/* Light beam */}
    <path d="M170 0 L145 80 L195 80 Z" fill="#d4a017" opacity="0.12"/>
    <path d="M170 5 L158 75 L182 75 Z" fill="#f0c840" opacity="0.08"/>
    {/* Staff */}
    <line x1="170" y1="150" x2="170" y2="68" stroke="#4a2800" strokeWidth="3.5"/>
    <path d="M170 68 Q167 60 172 55 Q177 50 173 44 Q169 38 175 34" fill="none" stroke="#5a3200" strokeWidth="3" strokeLinecap="round"/>
    {/* Staff glow */}
    <ellipse cx="170" cy="80" rx="6" ry="40" fill="#d4a017" opacity="0.08"/>
    {/* Ground cracks */}
    <path d="M140 145 L160 140 L155 155" fill="none" stroke="#2a1800" strokeWidth="1"/>
    <path d="M185 148 L175 142 L190 155" fill="none" stroke="#2a1800" strokeWidth="1"/>
    {/* Wave foam highlights */}
    <path d="M30 38 Q50 30 70 38" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5"/>
    <path d="M250 38 Q270 30 310 38" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5"/>
  </svg>
);

const NuhScene = () => (
  <svg width="100%" height="100%" viewBox="0 0 340 160" preserveAspectRatio="xMidYMid slice">
    <defs>
      <radialGradient id="nuh-sky" cx="50%" cy="30%" r="70%">
        <stop offset="0%" stopColor="#0a1a2e"/>
        <stop offset="100%" stopColor="#000"/>
      </radialGradient>
      <radialGradient id="nuh-moon" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#d4a017" stopOpacity="0.3"/>
        <stop offset="100%" stopColor="#000" stopOpacity="0"/>
      </radialGradient>
    </defs>
    <rect width="340" height="160" fill="url(#nuh-sky)"/>
    <ellipse cx="280" cy="35" rx="60" ry="60" fill="url(#nuh-moon)"/>
    <circle cx="280" cy="35" r="18" fill="none" stroke="#d4a017" strokeWidth="1" opacity="0.5"/>
    <circle cx="280" cy="35" r="14" fill="#1a1200" opacity="0.8"/>
    {/* Stormy waves */}
    <path d="M0 90 Q30 70 60 85 Q90 100 120 78 Q150 56 180 80 Q210 104 240 82 Q270 60 300 80 Q330 100 340 88 L340 160 L0 160Z" fill="#0a1e3a" opacity="0.95"/>
    <path d="M0 100 Q40 80 80 96 Q120 112 160 92 Q200 72 240 94 Q280 116 340 98 L340 160 L0 160Z" fill="#05111f" opacity="0.9"/>
    {/* Ark */}
    <path d="M90 95 L250 95 Q260 95 262 105 L80 105 Q78 95 90 95Z" fill="#3a2010" stroke="#5a3018" strokeWidth="1"/>
    <rect x="85" y="75" width="170" height="22" rx="3" fill="#4a2a14" stroke="#6a4020" strokeWidth="1"/>
    <rect x="100" y="60" width="140" height="17" rx="3" fill="#5a3418" stroke="#7a5028" strokeWidth="1"/>
    <line x1="170" y1="60" x2="170" y2="20" stroke="#3a2010" strokeWidth="2.5"/>
    <path d="M170 20 L200 50 L140 50 Z" fill="#4a2818" opacity="0.8"/>
    {/* Rain */}
    {[20,50,80,110,140,160,200,230,260,290,310].map((x, i) => (
      <line key={i} x1={x} y1={i % 2 === 0 ? 5 : 15} x2={x - 3} y2={i % 2 === 0 ? 25 : 35} stroke="rgba(180,220,255,0.25)" strokeWidth="0.8"/>
    ))}
    {/* Wave highlights */}
    <path d="M0 90 Q30 78 60 85" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5"/>
    <path d="M180 80 Q210 68 240 82" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5"/>
  </svg>
);

const IbrahimScene = () => (
  <svg width="100%" height="100%" viewBox="0 0 340 160" preserveAspectRatio="xMidYMid slice">
    <defs>
      <radialGradient id="ibr-fire" cx="50%" cy="60%" r="50%">
        <stop offset="0%" stopColor="#ff8c00" stopOpacity="0.9"/>
        <stop offset="50%" stopColor="#c83200" stopOpacity="0.5"/>
        <stop offset="100%" stopColor="#000" stopOpacity="0"/>
      </radialGradient>
    </defs>
    <rect width="340" height="160" fill="#080205"/>
    <ellipse cx="170" cy="110" rx="140" ry="80" fill="url(#ibr-fire)"/>
    {/* Flames */}
    {[120,145,165,185,210].map((x, i) => (
      <path key={i}
        d={`M${x} 140 Q${x - 10 + i * 3} ${110 - i * 5} ${x + 5} ${90 - i * 6} Q${x + 15} ${110 - i * 4} ${x + 10} 140`}
        fill={i % 2 === 0 ? "#d46000" : "#e87800"}
        opacity="0.7"
      />
    ))}
    {[130,155,170,195].map((x, i) => (
      <path key={i}
        d={`M${x} 140 Q${x - 8} ${100 - i * 8} ${x + 4} ${75 - i * 6} Q${x + 12} ${100 - i * 6} ${x + 8} 140`}
        fill="#ff9c20"
        opacity="0.6"
      />
    ))}
    {/* Central figure silhouette */}
    <ellipse cx="170" cy="108" rx="12" ry="16" fill="#000" opacity="0.9"/>
    <circle cx="170" cy="90" r="7" fill="#000" opacity="0.9"/>
    {/* Raised hands */}
    <path d="M158 100 L148 88 M182 100 L192 88" stroke="#000" strokeWidth="3" strokeLinecap="round" opacity="0.9"/>
    {/* Light from above */}
    <path d="M170 0 L150 60 L190 60 Z" fill="#d4a017" opacity="0.08"/>
    <ellipse cx="170" cy="60" rx="15" ry="5" fill="#d4a017" opacity="0.15"/>
    {/* Smoke */}
    <path d="M130 80 Q140 60 155 70 Q145 40 165 50 Q155 25 175 35" fill="none" stroke="rgba(100,100,100,0.3)" strokeWidth="4"/>
    <path d="M200 85 Q210 65 200 55 Q215 35 205 25" fill="none" stroke="rgba(80,80,80,0.25)" strokeWidth="3"/>
  </svg>
);

const IsaScene = () => (
  <svg width="100%" height="100%" viewBox="0 0 340 160" preserveAspectRatio="xMidYMid slice">
    <defs>
      <radialGradient id="isa-light" cx="50%" cy="40%" r="60%">
        <stop offset="0%" stopColor="#c8e8ff" stopOpacity="0.5"/>
        <stop offset="60%" stopColor="#1a3a5a" stopOpacity="0.3"/>
        <stop offset="100%" stopColor="#000" stopOpacity="0"/>
      </radialGradient>
    </defs>
    <rect width="340" height="160" fill="#050a14"/>
    <ellipse cx="170" cy="70" rx="130" ry="90" fill="url(#isa-light)"/>
    {/* Stars */}
    {[[60,20],[100,15],[200,18],[250,25],[300,12],[40,40],[280,35]].map(([x,y],i) => (
      <circle key={i} cx={x} cy={y} r={i%2===0?1:1.5} fill="#d4af37" opacity="0.8"/>
    ))}
    {/* Clouds */}
    <ellipse cx="100" cy="45" rx="45" ry="18" fill="#0a1e34" opacity="0.8"/>
    <ellipse cx="240" cy="40" rx="50" ry="16" fill="#0a1e34" opacity="0.8"/>
    {/* Figure */}
    <circle cx="170" cy="80" r="10" fill="#0d1e30" opacity="0.9"/>
    <path d="M160 90 Q155 115 158 140 L182 140 Q185 115 180 90Z" fill="#0d2040" opacity="0.9"/>
    {/* Raised arm */}
    <path d="M162 95 Q148 82 140 70" stroke="#0d1a2e" strokeWidth="5" strokeLinecap="round" fill="none" opacity="0.9"/>
    {/* Light rays */}
    {[30,60,90,120,150,180,210,240,270,300,330].map((angle, i) => {
      const rad = (angle * Math.PI) / 180;
      return (
        <line key={i}
          x1="170" y1="70"
          x2={170 + Math.cos(rad) * 80}
          y2={70 + Math.sin(rad) * 50}
          stroke="#c8e8ff"
          strokeWidth="0.6"
          opacity="0.12"
        />
      );
    })}
    {/* Birds */}
    <path d="M80 35 Q85 30 90 35 Q95 30 100 35" fill="none" stroke="rgba(212,175,55,0.5)" strokeWidth="1"/>
    <path d="M220 42 Q225 37 230 42 Q235 37 240 42" fill="none" stroke="rgba(212,175,55,0.5)" strokeWidth="1"/>
    {/* Ground */}
    <path d="M0 140 Q85 130 170 135 Q255 140 340 130 L340 160 L0 160Z" fill="#050f1a" opacity="0.9"/>
  </svg>
);

const MuhammadScene = () => (
  <svg width="100%" height="100%" viewBox="0 0 340 160" preserveAspectRatio="xMidYMid slice">
    <defs>
      <radialGradient id="muh-glow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#d4a017" stopOpacity="0.5"/>
        <stop offset="60%" stopColor="#7a5500" stopOpacity="0.2"/>
        <stop offset="100%" stopColor="#000" stopOpacity="0"/>
      </radialGradient>
      <radialGradient id="muh-sky" cx="50%" cy="30%" r="80%">
        <stop offset="0%" stopColor="#0a1420"/>
        <stop offset="100%" stopColor="#000"/>
      </radialGradient>
    </defs>
    <rect width="340" height="160" fill="url(#muh-sky)"/>
    <ellipse cx="170" cy="80" rx="120" ry="80" fill="url(#muh-glow)"/>
    {/* Stars */}
    {[[40,15],[80,8],[130,12],[210,10],[260,18],[300,8],[320,30],[20,40],[310,45]].map(([x,y],i) => (
      <circle key={i} cx={x} cy={y} r={i%3===0?1.5:1} fill="#d4af37" opacity={0.5+i*0.05}/>
    ))}
    {/* Crescent moon */}
    <circle cx="280" cy="30" r="16" fill="#0a1420"/>
    <circle cx="272" cy="26" r="14" fill="#0a1420" opacity="0.98"/>
    <circle cx="285" cy="30" r="13" fill="none" stroke="#d4a017" strokeWidth="0.8" opacity="0.6"/>
    {/* Mecca silhouette - Kaaba */}
    <rect x="145" y="95" width="50" height="45" fill="#0a0a08" stroke="#2a2010" strokeWidth="1"/>
    <rect x="158" y="105" width="24" height="35" fill="#050504" opacity="0.8"/>
    <rect x="153" y="88" width="34" height="10" fill="#0d0d0a" stroke="#1a1808" strokeWidth="0.5"/>
    {/* Pillars around kaaba */}
    <rect x="130" y="105" width="8" height="35" fill="#0d0d0a" opacity="0.7"/>
    <rect x="202" y="105" width="8" height="35" fill="#0d0d0a" opacity="0.7"/>
    {/* Minarets */}
    <rect x="80" y="80" width="12" height="60" fill="#0a0a08" opacity="0.8"/>
    <path d="M80 80 L86 70 L92 80Z" fill="#0d0d0a"/>
    <rect x="248" y="80" width="12" height="60" fill="#0a0a08" opacity="0.8"/>
    <path d="M248 80 L254 70 L260 80Z" fill="#0d0d0a"/>
    {/* Golden light path */}
    <path d="M170 0 L155 90 L185 90 Z" fill="#d4a017" opacity="0.06"/>
    {/* Ground */}
    <rect x="0" y="140" width="340" height="20" fill="#060604"/>
    <path d="M0 140 Q170 135 340 140" fill="#080806" stroke="#1a1808" strokeWidth="0.5"/>
    {/* Crowd silhouettes */}
    {[50,70,90,110,130,210,230,250,270,290].map((x,i) => (
      <ellipse key={i} cx={x} cy={148} rx={4} ry={10} fill="#050504" opacity="0.8"/>
    ))}
  </svg>
);

export default function ProphetCardsPage() {
  const [activeCard, setActiveCard] = useState(2);
  const gold = "#d4af37";

  return (
    <div
      className="min-h-screen flex flex-col items-center"
      style={{
        background: "linear-gradient(135deg, #0a0a0a 0%, #111108 50%, #0a0a0a 100%)",
        fontFamily: "'Georgia', serif",
      }}
    >
      {/* Header */}
      <div className="w-full text-center pt-10 pb-4 px-4">
        <div className="flex items-center justify-center gap-3 mb-2">
          <div style={{ height: 1, width: 60, background: gold, opacity: 0.5 }} />
          <span style={{ color: gold, fontSize: 11, letterSpacing: 4, textTransform: "uppercase" }}>
            Treasury Edition
          </span>
          <div style={{ height: 1, width: 60, background: gold, opacity: 0.5 }} />
        </div>
        <h1
          style={{
            color: gold,
            fontSize: 32,
            fontWeight: "bold",
            letterSpacing: 6,
            textTransform: "uppercase",
            textShadow: "0 0 30px rgba(212,175,55,0.4)",
          }}
        >
          Ulul Azm
        </h1>
        <p style={{ color: "rgba(212,175,55,0.6)", fontSize: 12, letterSpacing: 3, marginTop: 4 }}>
          The Prophets of Firm Resolve
        </p>
      </div>

      {/* Card selector tabs */}
      <div className="flex gap-2 mb-8 mt-2">
        {prophets.map((p, i) => (
          <button
            key={p.number}
            onClick={() => setActiveCard(i)}
            style={{
              border: `1px solid ${i === activeCard ? gold : "rgba(212,175,55,0.3)"}`,
              background: i === activeCard ? "rgba(212,175,55,0.15)" : "transparent",
              color: i === activeCard ? gold : "rgba(212,175,55,0.45)",
              padding: "4px 12px",
              borderRadius: 4,
              fontSize: 12,
              letterSpacing: 1,
              cursor: "pointer",
              transition: "all 0.2s",
              fontFamily: "inherit",
            }}
          >
            {p.number}
          </button>
        ))}
      </div>

      {/* Card display */}
      <div
        className="flex gap-8 items-center px-4"
        style={{ maxWidth: 1100, width: "100%", justifyContent: "center" }}
      >
        {/* Previous card peek */}
        {activeCard > 0 && (
          <div
            className="hidden md:block cursor-pointer"
            style={{ opacity: 0.35, transform: "scale(0.75) translateX(40px)", transformOrigin: "right center", transition: "all 0.3s" }}
            onClick={() => setActiveCard(activeCard - 1)}
          >
            <ProphetCard prophet={prophets[activeCard - 1]} total={prophets.length} />
          </div>
        )}

        {/* Active card */}
        <div style={{ transition: "all 0.4s", filter: "drop-shadow(0 0 30px rgba(212,175,55,0.3))" }}>
          <ProphetCard prophet={prophets[activeCard]} total={prophets.length} />
        </div>

        {/* Next card peek */}
        {activeCard < prophets.length - 1 && (
          <div
            className="hidden md:block cursor-pointer"
            style={{ opacity: 0.35, transform: "scale(0.75) translateX(-40px)", transformOrigin: "left center", transition: "all 0.3s" }}
            onClick={() => setActiveCard(activeCard + 1)}
          >
            <ProphetCard prophet={prophets[activeCard + 1]} total={prophets.length} />
          </div>
        )}
      </div>

      {/* Navigation arrows */}
      <div className="flex gap-6 mt-8 mb-10">
        <button
          onClick={() => setActiveCard(Math.max(0, activeCard - 1))}
          disabled={activeCard === 0}
          style={{
            border: `1px solid ${activeCard === 0 ? "rgba(212,175,55,0.2)" : gold}`,
            background: "transparent",
            color: activeCard === 0 ? "rgba(212,175,55,0.25)" : gold,
            width: 44, height: 44, borderRadius: "50%",
            fontSize: 18, cursor: activeCard === 0 ? "not-allowed" : "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "all 0.2s",
          }}
        >
          ←
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {prophets.map((_, i) => (
            <div
              key={i}
              onClick={() => setActiveCard(i)}
              style={{
                width: i === activeCard ? 20 : 6,
                height: 6,
                borderRadius: 3,
                background: i === activeCard ? gold : "rgba(212,175,55,0.3)",
                cursor: "pointer",
                transition: "all 0.3s",
              }}
            />
          ))}
        </div>
        <button
          onClick={() => setActiveCard(Math.min(prophets.length - 1, activeCard + 1))}
          disabled={activeCard === prophets.length - 1}
          style={{
            border: `1px solid ${activeCard === prophets.length - 1 ? "rgba(212,175,55,0.2)" : gold}`,
            background: "transparent",
            color: activeCard === prophets.length - 1 ? "rgba(212,175,55,0.25)" : gold,
            width: 44, height: 44, borderRadius: "50%",
            fontSize: 18, cursor: activeCard === prophets.length - 1 ? "not-allowed" : "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "all 0.2s",
          }}
        >
          →
        </button>
      </div>

      {/* Back link */}
      <Link
        to="/"
        style={{
          color: "rgba(212,175,55,0.5)",
          fontSize: 11,
          letterSpacing: 2,
          textDecoration: "none",
          marginBottom: 32,
          textTransform: "uppercase",
        }}
      >
        ← Back to Home
      </Link>
    </div>
  );
}
