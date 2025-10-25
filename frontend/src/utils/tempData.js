// src/data/mockData.js

/**
 * Helper function to get day names for the 'today' chart
 * @param {number} dayOffset - How many days to offset from today (e.g., -3, 0, 3)
 * @returns {string} - "Today" or the 3-letter day name (e.g., "Mon")
 */
const getDayName = (dayOffset) => {
  if (dayOffset === 0) {
    return "Today";
  }
  const date = new Date();
  date.setDate(date.getDate() + dayOffset);
  return date.toLocaleDateString("en-US", { weekday: "short" });
};

// 1. Daily Data (24-hour cycle with peak)
export const todayData = [
  { name: "00:00", forecast: 150, historical: 145 },
  { name: "02:00", forecast: 140, historical: 135 },
  { name: "04:00", forecast: 135, historical: 130 },
  { name: "06:00", forecast: 160, historical: 155 },
  { name: "08:00", forecast: 190, historical: 180 },
  { name: "10:00", forecast: 210, historical: 200 },
  { name: "12:00", forecast: 220, historical: 215 },
  { name: "14:00", forecast: 230, historical: 225 },
  { name: "16:00", forecast: 250, historical: 240 },
  { name: "17:00", forecast: 280, historical: 270 }, // Peak starts
  { name: "18:00", forecast: 310, historical: 300 }, // Peak
  { name: "19:00", forecast: 305, historical: 295 }, // Peak
  { name: "20:00", forecast: 290, historical: 280 }, // Peak ends
  { name: "22:00", forecast: 220, historical: 210 },
  { name: "24:00", forecast: 170, historical: 165 },
];

// 2. Today Data (Day -3 to Day +3)


// 3. Monthly Data (12 Months)
// (Using the more logical data from the first example)
export const monthlyData = [
  { name: "Jan", forecast: 260, historical: 240 },
  { name: "Feb", forecast: 280, historical: 250 },
  { name: "Mar", forecast: 300, historical: 270 },
  { name: "Apr", forecast: 290, historical: 280 },
  { name: "May", forecast: 310, historical: 300 },
  { name: "Jun", forecast: 330, historical: 310 },
  { name: "Jul", forecast: 350, historical: 340 },
  { name: "Aug", forecast: 340, historical: 330 },
  { name: "Sep", forecast: 320, historical: 300 },
  { name: "Oct", forecast: 300, historical: 280 },
  { name: "Nov", forecast: 280, historical: 260 },
  { name: "Dec", forecast: 270, historical: 250 },
];

// 4. Annual Data (Year-over-Year)

