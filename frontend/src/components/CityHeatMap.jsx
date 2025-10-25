import React, { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import "leaflet/dist/leaflet.css";

import { style } from "../utils/HeatMapUtils";

const CityHeatMap = () => {
  const [mergedData, setMergedData] = useState(null);
  const geoJsonLayer = useRef(null);

  const position = [28.6448, 77.216721];
  const zoom = 10.4;

  // ✅ Fetch both GeoJSON and consumption data once
  useEffect(() => {
    Promise.all([
      fetch("/src/data/delhi.geojson").then((res) => res.json()),
      fetch("/src/data/consumption.json").then((res) => res.json()),
    ])
      .then(([geoJsonData, consumptionData]) => {
        const enrichedGeoJson = {
          ...geoJsonData,
          features: geoJsonData.features.map((feature) => {
            const ward = feature.properties.wardcode;
            const consumptionValue = consumptionData[ward];
            return {
              ...feature,
              properties: {
                ...feature.properties,
                consumption: consumptionValue || 0,
              },
            };
          }),
        };
        setMergedData(enrichedGeoJson);
      })
      .catch((err) => console.error("Could not load or merge data:", err));
  }, []); // ✅ only run once

  // Add popups and hover effects
  const onEachFeature = (feature, layer) => {
    if (!feature.properties) return;
    // ✅ Log consumption to check if it's present
    console.log(
      "Ward:",
      feature.properties.wardname,
      "Consumption:",
      feature.properties.consumption
    );
    const wardName = feature.properties.wardname || "Unknown";
    const consumption = feature.properties.consumption || 0; // will merge this later
    const displayConsumption = consumption.toFixed(2);

    const content = `<strong>${wardName}</strong><br/>Consumption: ${displayConsumption} MU`;

    // Show popup on click
    layer.bindPopup(content);

    // Show tooltip on hover
    layer.bindTooltip(content, {
      permanent: false,
      direction: "top",
      className: "geo-tooltip",
    });

    layer.on({
      mouseover: (e) => {
        const l = e.target;
        l.setStyle({
          weight: 3,
          color: "#333",
          dashArray: "",
          fillOpacity: 0.9,
        });
        l.bringToFront();
      },
      mouseout: (e) => {
        if (geoJsonLayer.current) {
          geoJsonLayer.current.resetStyle(e.target);
        }
      },
    });
  };

  return (
    <div style={{ height: "100vh", width: "100%" }}>
      {mergedData ? (
        <MapContainer
          center={position}
          zoom={zoom}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <GeoJSON
            ref={geoJsonLayer}
            data={mergedData}
            style={style}
            onEachFeature={onEachFeature}
          />
        </MapContainer>
      ) : (
        <div>Loading and preparing map data...</div>
      )}
    </div>
  );
};

export default CityHeatMap;
