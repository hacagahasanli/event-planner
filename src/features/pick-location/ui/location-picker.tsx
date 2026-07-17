import "leaflet/dist/leaflet.css"
import "@/shared/lib/leaflet-icon-fix"

import { Loader2, MapPin, Search } from "lucide-react"
import { useEffect, useState } from "react"
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { reverseGeocode, searchPlaces, type PlaceResult } from "@/shared/api/nominatim"
import { useDebouncedValue } from "@/shared/lib/use-debounced-value"

export interface LocationValue {
  name: string
  lat: number
  lng: number
}

const DEFAULT_CENTER: [number, number] = [40.4093, 49.8671] // Baku

function ClickToPlace({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng)
    },
  })
  return null
}

function FlyToPosition({ position }: { position: [number, number] | null }) {
  const map = useMap()
  useEffect(() => {
    if (position) map.flyTo(position, 15, { duration: 0.8 })
  }, [position, map])
  return null
}

export function LocationPicker({
  value,
  onChange,
}: {
  value: LocationValue | null
  onChange: (value: LocationValue) => void
}) {
  const [query, setQuery] = useState("")
  const debouncedQuery = useDebouncedValue(query, 400)
  const [results, setResults] = useState<PlaceResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showResults, setShowResults] = useState(false)

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults([])
      return
    }
    const controller = new AbortController()
    setIsSearching(true)
    searchPlaces(debouncedQuery, controller.signal)
      .then(setResults)
      .catch(() => {
        /* aborted or offline — ignore */
      })
      .finally(() => setIsSearching(false))
    return () => controller.abort()
  }, [debouncedQuery])

  const position: [number, number] | null = value ? [value.lat, value.lng] : null

  async function placeAt(lat: number, lng: number) {
    onChange({ name: value?.name ?? "", lat, lng })
    const name = await reverseGeocode(lat, lng)
    onChange({ name, lat, lng })
  }

  function handleSelectResult(result: PlaceResult) {
    onChange({ name: result.displayName, lat: result.lat, lng: result.lng })
    setQuery("")
    setResults([])
    setShowResults(false)
  }

  return (
    <div className="flex flex-col gap-2">
      <Label>Location</Label>

      <div className="relative">
        <div className="relative">
          <Search className="text-muted-foreground absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
          <Input
            className="pl-8"
            placeholder="Ünvan axtar (məs: Fountain Square, Baku)"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setShowResults(true)
            }}
            onFocus={() => setShowResults(true)}
          />
          {isSearching && (
            <Loader2 className="text-muted-foreground absolute top-1/2 right-2.5 size-4 -translate-y-1/2 animate-spin" />
          )}
        </div>

        {showResults && results.length > 0 && (
          <div className="bg-popover absolute z-1000 mt-1 max-h-64 w-full overflow-y-auto rounded-lg border shadow-md">
            {results.map((r, i) => (
              <button
                key={`${r.lat}-${r.lng}-${i}`}
                type="button"
                onClick={() => handleSelectResult(r)}
                className="hover:bg-accent flex w-full items-start gap-2 px-3 py-2 text-left text-sm"
              >
                <MapPin className="text-muted-foreground mt-0.5 size-4 shrink-0" />
                <span className="line-clamp-2">{r.displayName}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="h-64 w-full overflow-hidden rounded-lg border">
        <MapContainer
          center={position ?? DEFAULT_CENTER}
          zoom={position ? 15 : 11}
          className="h-full w-full"
          scrollWheelZoom
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ClickToPlace onPick={placeAt} />
          <FlyToPosition position={position} />
          {position && (
            <Marker
              position={position}
              draggable
              eventHandlers={{
                dragend: (e) => {
                  const latlng = e.target.getLatLng()
                  placeAt(latlng.lat, latlng.lng)
                },
              }}
            />
          )}
        </MapContainer>
      </div>

      <Input
        placeholder="Yer adı (məs: Dostumun evi, Sahil parkı...)"
        value={value?.name ?? ""}
        onChange={(e) => value && onChange({ ...value, name: e.target.value })}
        disabled={!value}
      />
      <p className="text-muted-foreground text-xs">
        Xəritədə klikləyərək və ya yuxarıda axtararaq yer seç — API key lazım deyil.
      </p>
    </div>
  )
}
