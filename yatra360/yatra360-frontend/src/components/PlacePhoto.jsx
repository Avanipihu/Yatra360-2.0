import { useState } from 'react'

/**
 * Photo for a place, hotel or business card.
 *
 * Remote images fail more often than anything else on this page — a dead
 * Wikimedia URL, a blocked host, an offline demo — so the component always
 * has something to show. The fallback is a generated monogram tile built
 * from the name, which keeps card heights stable instead of collapsing the
 * layout when an image 404s.
 */

// Deterministic palette pick, so the same place always gets the same tile.
const TILES = [
  ['#2C6E63', '#D8E8E3'],
  ['#C98A2B', '#F1DFB8'],
  ['#B4432E', '#F4DCD5'],
  ['#3A3F3C', '#E4E7E0'],
]

function hashOf(value = '') {
  let h = 0
  for (let i = 0; i < value.length; i += 1) {
    h = (h * 31 + value.charCodeAt(i)) % 100000
  }
  return h
}

function initials(name = '') {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase()
}

export default function PlacePhoto({
  src,
  alt,
  name,
  credit,
  ratio = '16 / 10',
  className = '',
  children,
}) {
  const [failed, setFailed] = useState(false)
  const showImage = Boolean(src) && !failed

  const [bg, fg] = TILES[hashOf(name || alt || '') % TILES.length]

  return (
    <figure className={`place-photo ${className}`} style={{ aspectRatio: ratio }}>
      {showImage ? (
        <img
          src={src}
          alt={alt || name || ''}
          loading="lazy"
          onError={() => setFailed(true)}
        />
      ) : (
        <div className="place-photo-fallback" style={{ background: bg, color: fg }}>
          <span>{initials(name || alt)}</span>
        </div>
      )}

      {children}

      {showImage && credit && (
        <figcaption className="place-photo-credit">{credit}</figcaption>
      )}
    </figure>
  )
}
