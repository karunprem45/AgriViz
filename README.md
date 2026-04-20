# AgriViz DSS — Smart Agriculture Decision Support System

A data visualization-driven decision support system for smart agriculture that integrates AI with targeted visual interfaces to deliver actionable agricultural insights directly in the browser.

**Live Demo**: [https://karunprem45.github.io/AgriViz/](https://karunprem45.github.io/AgriViz/)

---

## Modules

### 1. Disease Detection
- MobileNet v1 CNN via TensorFlow.js — runs entirely in the browser
- Trained on PlantVillage dataset (87,867 images, 38 classes, 14 crop species)
- Upload a leaf image or select from samples to get disease classification with confidence score
- Includes treatment recommendations for detected diseases

### 2. Soil Analysis
- Enter N, P, K, and pH readings against a selected target crop
- Color-coded nutrient status bars (Optimal / Deficient / Excess) with deviation reporting
- Crop suggestions ranked by soil suitability across all 22 crops
- Input validation with warnings for out-of-range values

### 3. Crop Recommendation
- Per-feature similarity algorithm across 7 agronomic parameters (N, P, K, Temperature, Humidity, pH, Rainfall)
- Top 5 crop matches with per-feature comparison bars and similarity dots
- Handles edge cases: negative values, extreme inputs, low-match scenarios

---

## Dataset Visualizations

Three interactive canvas-based charts drawn without external chart libraries:

- **NPK Grouped Bar Chart** — Nitrogen, Phosphorus, and Potassium profiles across 10 key crops
- **Feature Correlation Heatmap** — Pearson correlation coefficients between 7 agronomic features
- **Temperature vs. Rainfall Scatter Plot** — Agro-climatic clustering by crop category

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | HTML5, CSS3, Vanilla JavaScript |
| ML Inference | TensorFlow.js (MobileNet v1) |
| Charts | HTML Canvas (no external libraries) |
| Hosting | GitHub Pages |

---

## Project Structure

```
AgriViz/
├── index.html              # Application page (Dashboard)
├── about.html              # Research page (Paper)
├── css/
│   └── style.css           # Unified research-grade design system
├── js/
│   ├── app.js              # Application logic (3 modules)
│   ├── charts.js           # Canvas-based visualizations
│   └── data.js             # Dataset, thresholds, constants
├── models/
│   └── plant-disease/
│       ├── tensorflowjs-model/   # MobileNet CNN weights
│       ├── test-images/          # Sample leaf images
│       └── class_indices.json    # 38-class label mapping
├── .nojekyll               # Bypass Jekyll on GitHub Pages
└── Karuniya_DV-Report.pdf  # Research report
```

---

## Local Development

No build tools required. Serve with any static file server:

```bash
# Python
python -m http.server 8080

# Node.js
npx serve .
```

Open `http://localhost:8080` in your browser.

> **Note**: The disease detection module requires HTTP (not `file://`) due to TensorFlow.js model loading.

---

## Author

**Karuniya Premnath**
Khoury College of Computer Sciences, Northeastern University
EECE 5642 — Data Visualization — April 2026
