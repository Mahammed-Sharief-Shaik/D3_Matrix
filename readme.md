# AI City Electricity Demand Forecasting

A compact project to explore AI-driven short- and medium-term electricity demand forecasting for cities to enable "smart resource conservation". This repository contains a React + Vite frontend (visualization & scenario controls) and a placeholder backend.

## Overview

Accurate city-scale demand forecasts reduce waste, cut emissions, and improve grid stability. This project focuses on practical forecasting horizons (very short, short, medium, long) and provides a prototype dashboard to explore scenarios.

## Goals

- Build a reproducible pipeline for demand forecasting.
- Provide UI controls to test scenarios and visualize forecast vs historical load.
- Evaluate models with standard metrics (MAE, RMSE, MAPE).
- Enable downstream use cases: demand response, renewable integration, storage optimization.

## Time horizons

- Very Short-Term (VSTLF): minutes–hours — real-time grid ops.
- Short-Term (STLF): hours–week — daily planning and unit commitment.
- Medium-Term (MTLF): week–year — procurement and maintenance.
- Long-Term (LTLF): multi-year — infrastructure planning.

## Approach

- Data pipeline: ingest historical load, weather, calendar features; clean and engineer features.
- Baselines: statistical models (ARIMA/SARIMA), ML (Random Forest / XGBoost).
- Deep learning: LSTM/GRU and Transformer-based sequence models for improved accuracy on long-range dependencies.
- Evaluation: MAE, RMSE, MAPE, and visual inspection of forecast vs historical.

## Project structure

- frontend/ — React + Vite UI prototype
  - src/App.jsx — main layout and components
  - src/components/DemandForecast.jsx — Recharts graphs and tabs
  - src/utils/tempData.js — mock data for visualizations
- backend/ — placeholder for API and model serving (currently empty)
- readme.md — this document

(See [frontend/src/App.jsx](c:\Academics\D3_Matrix\frontend\src\App.jsx) and [frontend/src/components/DemandForecast.jsx](c:\Academics\D3_Matrix\frontend\src\components\DemandForecast.jsx) for the UI code.)

## Technologies used and sources

- React — https://reactjs.org/
- Vite — https://vitejs.dev/
- Tailwind CSS — https://tailwindcss.com/
- Recharts — https://recharts.org/
- Node.js / npm — https://nodejs.org/
- (Optional) Express, Mongoose, Axios, etc. for backend API and persistence

## Packages Used In This Project

| Package                                                          | Description                                                                  | Downloads                                                                                                                      |
| ---------------------------------------------------------------- | ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| [Axios](https://www.npmjs.com/package/axios)                     | Promise-based HTTP client for the browser and Node.js                        | [![NPM Badge](https://img.shields.io/npm/dt/axios.svg?maxAge=3600)](https://www.npmjs.com/package/axios)                       |
| [Cors](https://www.npmjs.com/package/cors)                       | Middleware to enable CORS (Cross-Origin Resource Sharing) in Express.js      | [![NPM Badge](https://img.shields.io/npm/dt/cors.svg?maxAge=3600)](https://www.npmjs.com/package/cors)                         |
| [Express](https://www.npmjs.com/package/express)                 | Fast, unopinionated, minimalist web framework for Node.js                    | [![NPM Badge](https://img.shields.io/npm/dt/express.svg?maxAge=3600)](https://www.npmjs.com/package/express)                   |
| [Mongoose](https://www.npmjs.com/package/mongoose)               | MongoDB object modeling tool designed to work in an asynchronous environment | [![NPM Badge](https://img.shields.io/npm/dt/mongoose.svg?maxAge=3600)](https://www.npmjs.com/package/mongoose)                 |
| [React](https://www.npmjs.com/package/react)                     | JavaScript library for building user interfaces                              | [![NPM Badge](https://img.shields.io/npm/dt/react.svg?maxAge=3600)](https://www.npmjs.com/package/react)                       |
| [React Router](https://www.npmjs.com/package/react-router-dom)   | Declarative routing for React apps                                           | [![NPM Badge](https://img.shields.io/npm/dt/react-router-dom.svg?maxAge=3600)](https://www.npmjs.com/package/react-router-dom) |
| [Bcrypt](https://www.npmjs.com/package/bcrypt)                   | A library to help you hash passwords                                         | [![NPM Badge](https://img.shields.io/npm/dt/bcrypt.svg?maxAge=3600)](https://www.npmjs.com/package/bcrypt)                     |
| [Jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken)       | A library to sign, verify, and decode JSON Web Tokens                        | [![NPM Badge](https://img.shields.io/npm/dt/jsonwebtoken.svg?maxAge=3600)](https://www.npmjs.com/package/jsonwebtoken)         |
| [react-chartjs-2](https://www.npmjs.com/package/react-chartjs-2) | React wrapper for Chart.js 2                                                 | ![NPM Badge](https://img.shields.io/npm/dt/react-chartjs-2.svg?maxAge=3600)                                                    |
| [chart.js](https://www.npmjs.com/package/chart.js)               | Simple yet flexible JavaScript charting library                              | ![NPM Badge](https://img.shields.io/npm/dt/chart.js.svg?maxAge=3600)                                                           |

Note: The current frontend package.json includes React, Recharts, Tailwind and related tooling. Backend dependencies (Express, Mongoose, etc.) can be added as needed.

## Setup & Run (frontend)

1. Open a terminal in the frontend folder:
   - Windows PowerShell / CMD:
     - cd c:\Academics\D3_Matrix\frontend
2. Install:
   - npm install
3. Start dev server:
   - npm run dev
4. Open the URL shown by Vite (usually http://localhost:5173)

## Data & Evaluation

- Start with public datasets (UCI, Kaggle, DOE) and local utility data where available.
- Feature suggestions: time-of-day, day-of-week, holiday flags, temperature, humidity, economic indicators, EV penetration.
- Evaluate models using MAE, RMSE, and MAPE. Visualize residuals and forecast vs actual.

## Contributing

- Create issues for features or data sources.
- Add models under a dedicated backend/models or experiments/ folder.
- Add tests and examples for reproducibility.

## License

Add project license (e.g., MIT) as desired.

## References

- Recharts: https://recharts.org/
- Vite: https://vitejs.dev/
- Tailwind: https://tailwindcss.com/
