# AgriViz 🌾

**Agricultural AI that farmers can actually read.**

Most agri-AI tools optimize for model accuracy but leave farmers staring at raw numbers they can't interpret. AgriViz flips that: it's a **visualization-first decision-support system** that turns crop-disease detection, crop recommendation, and soil analysis into color-coded, farmer-readable guidance — built for low-literacy, non-technical smallholders.

[![Live Demo](https://img.shields.io/badge/Live-Demo-6C8CFF?style=flat-square&logo=googlechrome&logoColor=white)](https://karunprem45.github.io/AgriViz/)
![CNN](https://img.shields.io/badge/CNN-Disease_Detection-D00000?style=flat-square)
![XGBoost](https://img.shields.io/badge/XGBoost-Crop_Recommendation-FF6600?style=flat-square)
![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=flat-square&logo=firebase&logoColor=black)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

> 🌐 **Live demo:** [karunprem45.github.io/AgriViz](https://karunprem45.github.io/AgriViz/)

---

## The problem

AI models for agriculture are often accurate but unusable — a smallholder farmer with limited literacy can't act on a raw confidence score or an NPK table. The gap isn't model quality; it's **interpretability at the last mile**. AgriViz was built to close that gap.

---

## What it does

- 🦠 **Crop-disease detection** — a **CNN** identifies plant diseases from leaf images
- 🌱 **Crop recommendation** — an **XGBoost** model recommends crops from soil + environmental inputs, trained on **2,200 records across 22 crops**
- 🧪 **Soil analysis** — interprets soil nutrient profiles (N, P, K) into plain guidance
- 🎨 **Farmer-readable visualizations** — every AI output is rendered as color-coded, low-text visuals instead of raw numbers
- 🔄 **Real-time sync** — Firebase keeps data live across the app

---

## 📊 Key insights uncovered

- **P–K correlation** of **r = 0.74** across the soil dataset
- **Crop-specific NPK clustering** — distinct nutrient signatures per crop group
- A unified, visualization-first workflow that makes every recommendation immediately actionable

---

## 🛠️ Tech stack

**ML** · `TensorFlow/Keras` (CNN) · `XGBoost` · `scikit-learn`
**Frontend** · `JavaScript` · `HTML/CSS` (deployed on GitHub Pages)
**Backend / Data** · `Firebase` (real-time sync)
**Viz** · `[FILL: charting library used for the color-coded visuals — e.g. Chart.js, D3, Plotly]`

---

## 🚀 Run it

The app is live on GitHub Pages — **[open the demo](https://karunprem45.github.io/AgriViz/)** directly, no setup needed.

To run locally:
```bash
git clone https://github.com/karunprem45/AgriViz.git
cd AgriViz
[FILL: real setup steps — if plain HTML/JS just open index.html;
       if a build tool is used:  npm install && npm start]
```

> Firebase config is required. Keep credentials out of git — use a template file and add the real config locally.

---

## 📁 Structure

```
AgriViz/
├── [FILL: match your actual folders]
├── models/          # trained CNN + XGBoost artifacts
├── data/            # soil / crop dataset (2,200 records, 22 crops)
└── README.md
```

---

## 🎯 Why it matters

Delivered a decision-support platform that uncovered real agronomic patterns and made AI-driven recommendations usable by the people who need them most — non-technical, low-literacy farmers. A reminder that in applied ML, **interpretation is as important as accuracy**.

---

## 👤 Author

**Karuniya Premnath** — MS Data Science @ Northeastern University
[LinkedIn](https://linkedin.com/in/karuniya-premnath) · [Portfolio](https://karunprem45.github.io/portfolio/) · premnath.k@northeastern.edu
EECE 5642 — Data Visualization — April 2026
