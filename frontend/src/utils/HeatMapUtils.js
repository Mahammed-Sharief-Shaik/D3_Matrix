// Helper: determine color based on consumption
export const getColor = (consumption) => {
  if (!consumption) return "#808080"; // grey = no data
  if (consumption > 1000) return "#FF0000"; // Red
  if (consumption > 750) return "#FFA500"; // Orange
  if (consumption > 500) return "#FFFF00"; // Yellow
  if (consumption > 250) return "#ADFF2F"; // Green-Yellow
  return "#00FF00"; // Green
};

// Style function for GeoJSON features
export const style = (feature) => {
  console.log(
    "AC:",
    feature.properties.AC_NAME,
    "Consumption:",
    feature.properties.consumption
  );
  return {
    fillColor: getColor(feature.properties.consumption),
    weight: 1,
    opacity: 1,
    color: "white",
    dashArray: "3",
    fillOpacity: 0.7,
  };
};
