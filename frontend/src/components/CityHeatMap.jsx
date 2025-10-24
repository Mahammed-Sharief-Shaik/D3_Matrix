import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import "leaflet/dist/leaflet.css";

// Helper function to determine color based on consumption value
const getColor = (consumption) => {
  if (consumption > 1000) return "#FF0000"; // Red
  if (consumption > 750) return "#FFA500"; // Orange
  if (consumption > 500) return "#FFFF00"; // Yellow
  if (consumption > 250) return "#ADFF2F"; // Green-Yellow
  return "#00FF00"; // Green
};

// Function to style each constituency polygon based on its data
const style = (feature) => ({
  fillColor: getColor(feature.properties.consumption),
  weight: 1,
  opacity: 1,
  color: "white",
  dashArray: "3",
  fillOpacity: 0.7,
});

const CityHeatMap = () => {
  // ✅ FIX: Proper useState declaration
  const [delhiGeoJSON, setDelhiGeoJSON] = useState(null);

  // Map position and zoom level
  const position = [28.6448, 77.216721]; // Centered on Delhi
  const zoom = 10;

  // ✅ FIX: Proper useEffect dependency array (empty)
  useEffect(() => {
    fetch("/delhi_ac_with_consumption.geojson")
      .then((resp) => resp.json())
      .then((json) => setDelhiGeoJSON(json))
      .catch((err) => console.error("Could not load data:", err));
  }, []); // <- Empty array ensures this runs once

  // Function to handle each feature (popup binding)
  const onEachFeature = (feature, layer) => {
    if (feature.properties && feature.properties.AC_NAME) {
      const popupContent = `
        <strong>${feature.properties.AC_NAME}</strong><br />
        Est. Consumption: ${
          feature.properties.consumption?.toFixed(2) ?? "N/A"
        } MU
      `;
      layer.bindPopup(popupContent);
    }
  };

  return (
    <div style={{ height: "100vh", width: "100%" }}>
      {delhiGeoJSON ? (
        <MapContainer
          center={position}
          zoom={zoom}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <GeoJSON
            data={delhiGeoJSON}
            style={style}
            onEachFeature={onEachFeature}
          />
        </MapContainer>
      ) : (
        <div>Loading map data...</div>
      )}
    </div>
  );
};

export default CityHeatMap;
