import { useState, useRef, useEffect } from 'react'
import styles from './DateTimePicker.module.css'

const DAYS   = ['Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa', 'Di']
const MONTHS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
]

/** Parse "2026-04-20T14:30" → { year, month (0-based), day, hour, minute } */
function parseValue(val) {
  if (!val) return null
  const [datePart, timePart = '00:00'] = val.split('T')
  const [year, month, day] = datePart.split('-').map(Number)
  const [hour, minute]     = timePart.split(':').map(Number)
  return { year, month: month - 1, day, hour, minute }
}

/** Format back to "YYYY-MM-DDTHH:MM" */
function fmt(year, month, day, hour, minute) {
  const p = n => String(n).padStart(2, '0')
  return `${year}-${p(month + 1)}-${p(day)}T${p(hour)}:${p(minute)}`
}

function daysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate()
}

/** First weekday of month, Monday-first (0 = Mon … 6 = Sun) */
function firstWeekday(year, month) {
  const d = new Date(year, month, 1).getDay()
  return d === 0 ? 6 : d - 1
}

/**
 * DateTimePicker — custom date + time picker.
 *
 * Props:
 *   value       "YYYY-MM-DDTHH:MM"  (same format as datetime-local)
 *   onChange    (val: string) => void
 *   min         "YYYY-MM-DDTHH:MM"  — earliest allowed datetime
 *   label       string  — shown above the trigger button
 *   id          string  — forwarded to trigger for <label htmlFor>
 *   alignRight  bool    — aligns dropdown to right edge (use for the second picker)
 */
export default function DateTimePicker({ value, onChange, min, label, id, alignRight = false }) {
  const [open, setOpen] = useState(false)
  const wrapRef = useRef(null)

  const parsed    = parseValue(value)
  const minParsed = parseValue(min)
  const today     = new Date()

  const [viewYear,  setViewYear]  = useState(parsed?.year  ?? today.getFullYear())
  const [viewMonth, setViewMonth] = useState(parsed?.month ?? today.getMonth())

  /* Close on outside click or Escape */
  useEffect(() => {
    function onPointer(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false)
    }
    function onKey(e) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [])

  /* Sync calendar view when value changes from outside (preset buttons) */
  useEffect(() => {
    if (parsed) {
      setViewYear(parsed.year)
      setViewMonth(parsed.month)
    }
  }, [value])

  /* ── Helpers ── */

  function isDayDisabled(day) {
    if (!minParsed) return false
    const d    = new Date(viewYear, viewMonth, day)
    const minD = new Date(minParsed.year, minParsed.month, minParsed.day)
    // Disable strictly before min date
    return d < minD
  }

  function isSelected(day) {
    return parsed &&
      parsed.year === viewYear &&
      parsed.month === viewMonth &&
      parsed.day === day
  }

  function isToday(day) {
    return (
      today.getFullYear() === viewYear &&
      today.getMonth()    === viewMonth &&
      today.getDate()     === day
    )
  }

  /* ── Actions ── */

  function selectDay(day) {
    const hour   = parsed?.hour   ?? 12
    const minute = parsed?.minute ?? 0
    onChange(fmt(viewYear, viewMonth, day, hour, minute))
  }

  function changeHour(delta) {
    if (!parsed) return
    const newHour = (parsed.hour + delta + 24) % 24
    onChange(fmt(parsed.year, parsed.month, parsed.day, newHour, parsed.minute))
  }

  function changeMinute(delta) {
    if (!parsed) return
    // Snap to nearest 5-min mark, then step
    const snapped   = Math.round(parsed.minute / 5) * 5
    const newMinute = ((snapped + delta) + 60) % 60
    onChange(fmt(parsed.year, parsed.month, parsed.day, parsed.hour, newMinute))
  }

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1) }
    else setViewMonth(m => m - 1)
  }

  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1) }
    else setViewMonth(m => m + 1)
  }

  /* ── Display ── */

  const displayValue = parsed
    ? `${String(parsed.day).padStart(2, '0')}/${String(parsed.month + 1).padStart(2, '0')}/${parsed.year}  ·  ${String(parsed.hour).padStart(2, '0')}:${String(parsed.minute).padStart(2, '0')}`
    : '—'

  const dim     = daysInMonth(viewYear, viewMonth)
  const leading = firstWeekday(viewYear, viewMonth)

  return (
    <div className={styles.wrap} ref={wrapRef}>
      {label && <label className={styles.label} htmlFor={id}>{label}</label>}

      <button
        id={id}
        type="button"
        className={`${styles.trigger} ${open ? styles.triggerOpen : ''}`}
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        aria-haspopup="true"
      >
        <svg className={styles.calIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15" aria-hidden="true">
          <rect x="3" y="4" width="18" height="18" rx="2"/>
          <line x1="16" y1="2" x2="16" y2="6"/>
          <line x1="8"  y1="2" x2="8"  y2="6"/>
          <line x1="3"  y1="10" x2="21" y2="10"/>
        </svg>
        <span className={styles.triggerText}>{displayValue}</span>
        <svg className={`${styles.chevron} ${open ? styles.chevronUp : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="12" height="12" aria-hidden="true">
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>

      {open && (
        <div className={`${styles.dropdown} ${alignRight ? styles.dropdownRight : ''}`} role="dialog" aria-label={label ?? 'Sélectionner une date et une heure'}>

          {/* ── Calendar ── */}
          <div className={styles.calNav}>
            <button type="button" className={styles.navBtn} onClick={prevMonth} aria-label="Mois précédent">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="14" height="14"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            <span className={styles.calTitle}>{MONTHS[viewMonth]} {viewYear}</span>
            <button type="button" className={styles.navBtn} onClick={nextMonth} aria-label="Mois suivant">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="14" height="14"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </div>

          <div className={styles.dayHeaders}>
            {DAYS.map(d => <span key={d} className={styles.dayHeader}>{d}</span>)}
          </div>

          <div className={styles.grid}>
            {Array.from({ length: leading }, (_, i) => (
              <span key={`e-${i}`} />
            ))}
            {Array.from({ length: dim }, (_, i) => {
              const day      = i + 1
              const disabled = isDayDisabled(day)
              const selected = isSelected(day)
              const todayMk  = isToday(day)
              return (
                <button
                  key={day}
                  type="button"
                  disabled={disabled}
                  onClick={() => selectDay(day)}
                  className={[
                    styles.day,
                    selected ? styles.daySelected : '',
                    todayMk && !selected ? styles.dayToday : '',
                  ].join(' ')}
                  aria-label={`${day} ${MONTHS[viewMonth]} ${viewYear}${selected ? ', sélectionné' : ''}`}
                  aria-pressed={selected}
                >
                  {day}
                </button>
              )
            })}
          </div>

          <div className={styles.divider} />

          {/* ── Time picker ── */}
          <div className={styles.timePicker}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14" className={styles.clockIcon} aria-hidden="true">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>

            {/* Hours */}
            <div className={styles.timeUnit}>
              <button type="button" className={styles.timeBtn} onClick={() => changeHour(1)} aria-label="Augmenter l'heure">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="10" height="10"><polyline points="18 15 12 9 6 15"/></svg>
              </button>
              <span className={styles.timeVal} aria-live="polite">{String(parsed?.hour ?? 0).padStart(2, '0')}</span>
              <button type="button" className={styles.timeBtn} onClick={() => changeHour(-1)} aria-label="Diminuer l'heure">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="10" height="10"><polyline points="6 9 12 15 18 9"/></svg>
              </button>
            </div>

            <span className={styles.timeSep}>:</span>

            {/* Minutes */}
            <div className={styles.timeUnit}>
              <button type="button" className={styles.timeBtn} onClick={() => changeMinute(5)} aria-label="Augmenter les minutes">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="10" height="10"><polyline points="18 15 12 9 6 15"/></svg>
              </button>
              <span className={styles.timeVal} aria-live="polite">{String(parsed?.minute ?? 0).padStart(2, '0')}</span>
              <button type="button" className={styles.timeBtn} onClick={() => changeMinute(-5)} aria-label="Diminuer les minutes">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="10" height="10"><polyline points="6 9 12 15 18 9"/></svg>
              </button>
            </div>

            <span className={styles.timeHint}>par 5 min</span>
          </div>

          <button type="button" className={styles.confirmBtn} onClick={() => setOpen(false)}>
            Valider
          </button>
        </div>
      )}
    </div>
  )
}
