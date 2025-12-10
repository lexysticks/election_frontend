import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import { useEffect, useState } from "react";

export default function NigeriaMap() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch("/nigeria.geojson")
      .then((res) => res.json())
      .then((geo) => setData(geo));
  }, []);

  return (
    <MapContainer center={[9.0820, 8.6753]} zoom={6} style={{ height: "400px" }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      {data && <GeoJSON data={data} style={{ color: "green", weight: 2 }} />}
    </MapContainer>
  );
}
