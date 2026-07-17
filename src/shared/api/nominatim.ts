/**
 * Free geocoding via OpenStreetMap's Nominatim public API — no API key
 * needed. Please keep request volume light (it's a shared public service);
 * fine for a small personal app.
 */
const NOMINATIM_BASE = "https://nominatim.openstreetmap.org"

export interface PlaceResult {
  displayName: string
  lat: number
  lng: number
}

interface NominatimItem {
  display_name: string
  lat: string
  lon: string
}

export async function searchPlaces(query: string, signal?: AbortSignal): Promise<PlaceResult[]> {
  if (!query.trim()) return []

  const url = `${NOMINATIM_BASE}/search?format=jsonv2&addressdetails=0&limit=6&q=${encodeURIComponent(query)}`
  const res = await fetch(url, { signal, headers: { Accept: "application/json" } })
  if (!res.ok) throw new Error("Location axtarışı alınmadı")

  const items = (await res.json()) as NominatimItem[]
  return items.map((item) => ({
    displayName: item.display_name,
    lat: Number(item.lat),
    lng: Number(item.lon),
  }))
}

export async function reverseGeocode(lat: number, lng: number): Promise<string> {
  const url = `${NOMINATIM_BASE}/reverse?format=jsonv2&lat=${lat}&lon=${lng}`
  const res = await fetch(url, { headers: { Accept: "application/json" } })
  if (!res.ok) return `${lat.toFixed(5)}, ${lng.toFixed(5)}`

  const item = (await res.json()) as { display_name?: string }
  return item.display_name ?? `${lat.toFixed(5)}, ${lng.toFixed(5)}`
}
