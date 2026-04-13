import { Link } from 'react-router-dom'
import styles from './Home.module.css'

export default function Home() {
  return (
    <div className={styles.hero}>
      <div className={styles.content}>
        <p className={styles.tagline}>Solution de gestion de parking</p>
        <h1 className={styles.title}>
          Gérez vos parkings<br />facilement
        </h1>
        <p className={styles.subtitle}>
          Une solution simple et efficace pour gérer<br />
          vos parkings en toute sérénité.
        </p>
        <Link to="/login" className={styles.cta}>Commencer</Link>
      </div>

      <div className={styles.illustration}>
        <svg viewBox="0 0 520 340" xmlns="http://www.w3.org/2000/svg" className={styles.svg}>
          {/* Background glow */}
          <ellipse cx="320" cy="170" rx="200" ry="180" fill="#00A0F3" opacity="0.08"/>
          <ellipse cx="380" cy="120" rx="120" ry="120" fill="#0000FF" opacity="0.12"/>

          {/* Building */}
          <rect x="310" y="60" width="130" height="190" rx="6" fill="#0A0048"/>
          <rect x="310" y="60" width="130" height="12" rx="3" fill="#00A0F3" opacity="0.5"/>
          {/* Windows */}
          {[0,1,2].map(row => [0,1,2].map(col => (
            <rect key={`${row}-${col}`}
              x={322 + col * 38} y={85 + row * 45}
              width="26" height="32" rx="3"
              fill="#00A0F3" opacity={0.15 + (col + row) * 0.08}
            />
          )))}
          {/* Parking sign */}
          <rect x="350" y="210" width="50" height="32" rx="4" fill="#0000FF"/>
          <text x="375" y="231" textAnchor="middle" fill="white" fontSize="18" fontWeight="bold" fontFamily="sans-serif">P</text>

          {/* Road */}
          <rect x="100" y="255" width="350" height="18" rx="3" fill="#0A0048"/>
          <rect x="185" y="261" width="40" height="6" rx="2" fill="#FF9E42" opacity="0.7"/>
          <rect x="255" y="261" width="40" height="6" rx="2" fill="#FF9E42" opacity="0.7"/>

          {/* Barrier pole */}
          <rect x="200" y="190" width="10" height="65" rx="4" fill="#d0d0e8"/>
          {/* Barrier arm — raised */}
          <rect x="204" y="192" width="90" height="10" rx="4" fill="#FF6B35"
            transform="rotate(-35 204 192)"/>
          <rect x="204" y="192" width="90" height="10" rx="4" fill="transparent"
            stroke="#fff" strokeWidth="1" strokeDasharray="12 8" opacity="0.4"
            transform="rotate(-35 204 192)"/>

          {/* Car body */}
          <g transform="translate(105, 205)">
            {/* Shadow */}
            <ellipse cx="65" cy="72" rx="60" ry="8" fill="#000" opacity="0.2"/>
            {/* Body lower */}
            <rect x="5" y="38" width="120" height="34" rx="8" fill="#1a3a8f"/>
            {/* Body upper / cabin */}
            <rect x="22" y="14" width="82" height="32" rx="8" fill="#1e45a8"/>
            {/* Windshield front */}
            <rect x="78" y="17" width="24" height="25" rx="4" fill="#00A0F3" opacity="0.5"/>
            {/* Windshield rear */}
            <rect x="22" y="17" width="22" height="25" rx="4" fill="#00A0F3" opacity="0.35"/>
            {/* Headlight */}
            <rect x="118" y="42" width="10" height="10" rx="3" fill="#FFE066"/>
            {/* Taillight */}
            <rect x="2" y="42" width="8" height="10" rx="3" fill="#FF6B35"/>
            {/* Wheels */}
            <circle cx="28" cy="68" r="16" fill="#060035"/>
            <circle cx="28" cy="68" r="9" fill="#2a2a5a"/>
            <circle cx="28" cy="68" r="4" fill="#888"/>
            <circle cx="100" cy="68" r="16" fill="#060035"/>
            <circle cx="100" cy="68" r="9" fill="#2a2a5a"/>
            <circle cx="100" cy="68" r="4" fill="#888"/>
          </g>

          {/* Shield */}
          <g transform="translate(390, 45)">
            <path d="M40,0 L80,18 L80,50 C80,72 62,88 40,95 C18,88 0,72 0,50 L0,18 Z"
              fill="#FF9E42" opacity="0.95"/>
            <path d="M40,6 L74,22 L74,50 C74,68 58,82 40,88 C22,82 6,68 6,50 L6,22 Z"
              fill="#e8892a" opacity="0.5"/>
            {/* Checkmark */}
            <path d="M22,50 L34,62 L58,36"
              stroke="white" strokeWidth="7" fill="none"
              strokeLinecap="round" strokeLinejoin="round"/>
          </g>

          {/* Location pin */}
          <g transform="translate(170, 175)">
            <circle cx="0" cy="0" r="14" fill="#00A0F3"/>
            <circle cx="0" cy="0" r="6" fill="white"/>
            <path d="M0,14 L-7,28 L7,28 Z" fill="#00A0F3"/>
          </g>

          {/* Small dots decoration */}
          <circle cx="150" cy="100" r="3" fill="#00A0F3" opacity="0.5"/>
          <circle cx="165" cy="115" r="2" fill="#FF9E42" opacity="0.6"/>
          <circle cx="480" cy="220" r="4" fill="#00A0F3" opacity="0.4"/>
          <circle cx="460" cy="240" r="2" fill="#FF9E42" opacity="0.5"/>
        </svg>
      </div>
    </div>
  )
}
