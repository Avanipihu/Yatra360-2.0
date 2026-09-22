import { useEffect, useState } from 'react'

/**
 * Photo for a place, hotel or business card.
 *
 * Remote images fail more often than anything else on this page — a dead
 * Wikimedia URL, a blocked host, an offline demo — so the component always
 * has something to show. Two layers of resilience:
 *
 *  1. If there's no `src` at all (an owner-submitted business that skipped
 *     the image field, a newly suggested place with no curated photo yet)
 *     or the given `src` 404s, we look up a real photo automatically from
 *     Wikipedia's public search API using the place's `name` — no API key
 *     needed, and it works for almost any real-world place or eatery name.
 *  2. Only if that lookup also comes up empty do we fall back to the
 *     generated monogram tile, which keeps card heights stable instead of
 *     collapsing the layout.
 */

// Simple in-memory cache so the same place name isn't looked up twice in
// one session (e.g. it appears in both the itinerary and crowd alternatives).
const wikiImageCache = new Map()

async function lookupWikiImage(name) {
  if (!name) return null
  if (wikiImageCache.has(name)) return wikiImageCache.get(name)

  try {
    const res = await fetch(
      `https://en.wikipedia.org/w/rest.php/v1/search/page?q=${encodeURIComponent(name)}&limit=1`
    )
    if (!res.ok) throw new Error('wiki search failed')
    const data = await res.json()
    const url = data?.pages?.[0]?.thumbnail?.url || null
    // Protocol-relative URLs (//upload.wikimedia.org/...) need a scheme.
    const resolved = url ? (url.startsWith('//') ? `https:${url}` : url) : null
    wikiImageCache.set(name, resolved)
    return resolved
  } catch {
    wikiImageCache.set(name, null)
    return null
  }
}

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
  const [fallbackSrc, setFallbackSrc] = useState(null)
  const [fallbackTried, setFallbackTried] = useState(false)
  const lookupName = name || alt

  // Reset when the identity of the photo changes (e.g. list re-renders with
  // a different place in the same slot).
  useEffect(() => {
    setFailed(false)
    setFallbackSrc(null)
    setFallbackTried(false)
  }, [src, lookupName])

  useEffect(() => {
    const needsFallback = (!src || failed) && !fallbackTried && lookupName
    if (!needsFallback) return

    let cancelled = false
    lookupWikiImage(lookupName).then(url => {
      if (!cancelled) {
        setFallbackSrc(url)
        setFallbackTried(true)
      }
    })
    return () => { cancelled = true }
  }, [src, failed, fallbackTried, lookupName])

  const effectiveSrc = src && !failed ? src : fallbackSrc
  const isGenerated = !(src && !failed) && Boolean(fallbackSrc)
  const showImage = Boolean(effectiveSrc)

  const [bg, fg] = TILES[hashOf(name || alt || '') % TILES.length]

  return (
    <figure className={`place-photo ${className}`} style={{ aspectRatio: ratio }}>
      {showImage ? (
        <img
          src={effectiveSrc}
          alt={alt || name || ''}
          loading="lazy"
          onError={() => {
            // The curated src failed — fall through to the auto-lookup.
            // If the auto-lookup itself failed, drop it so the monogram shows.
            if (effectiveSrc === src) setFailed(true)
            else setFallbackSrc(null)
          }}
        />
      ) : (
        <div className="place-photo-fallback" style={{ background: bg, color: fg }}>
          <span>{initials(name || alt)}</span>
        </div>
      )}

      {children}

      {showImage && (credit || isGenerated) && (
        <figcaption className="place-photo-credit">
          {isGenerated ? 'Photo: Wikipedia' : credit}
        </figcaption>
      )}
    </figure>
  )
}
