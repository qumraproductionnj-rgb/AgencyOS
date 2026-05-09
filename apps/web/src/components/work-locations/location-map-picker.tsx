'use client'

import { MapContainer, TileLayer, Marker, useMapEvents, Circle } from 'react-leaflet'
import L from 'leaflet'

import 'leaflet/dist/leaflet.css'

// Fix Leaflet default icon issue in bundlers
const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})
L.Marker.prototype.options.icon = defaultIcon

interface Props {
  latitude: number
  longitude: number
  radius: number
  onChange: (lat: number, lng: number) => void
}

function ClickHandler({ onChange }: { onChange: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onChange(e.latlng.lat, e.latlng.lng)
    },
  })
  return null
}

export function LocationMapPicker({ latitude, longitude, radius, onChange }: Props) {
  return (
    <div className="h-[300px] w-full overflow-hidden rounded-md border">
      <MapContainer
        center={[latitude, longitude]}
        zoom={15}
        className="h-full w-full"
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ClickHandler onChange={onChange} />
        <Marker position={[latitude, longitude]} />
        <Circle
          center={[latitude, longitude]}
          radius={radius}
          pathOptions={{ color: '#2563eb', fillOpacity: 0.1 }}
        />
      </MapContainer>
    </div>
  )
}
