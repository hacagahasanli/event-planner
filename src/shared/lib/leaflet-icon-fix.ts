import L from "leaflet"
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png"
import markerIcon from "leaflet/dist/images/marker-icon.png"
import markerShadow from "leaflet/dist/images/marker-shadow.png"

// Vite doesn't resolve Leaflet's default marker image URLs correctly out of
// the box — this points them at the bundled assets instead.
type IconDefaultWithPrivate = typeof L.Icon.Default.prototype & {
  _getIconUrl?: unknown
}

delete (L.Icon.Default.prototype as IconDefaultWithPrivate)._getIconUrl

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
})
