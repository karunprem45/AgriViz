// ============================================================
// SMART AGRICULTURE DSS — Dataset & Configuration
// Source: Crop Recommendation Dataset (Kaggle, 2,200 records, 22 classes)
// Reference: Ingle, A. (2020)
// ============================================================

const CROP_DATA = {
  rice:       { N: 80,  P: 48,  K: 40,  temperature: 23.68, humidity: 82.00, ph: 6.43, rainfall: 236.18, category: "Cereal" },
  maize:      { N: 80,  P: 40,  K: 20,  temperature: 22.39, humidity: 65.09, ph: 6.25, rainfall: 84.77,  category: "Cereal" },
  chickpea:   { N: 40,  P: 68,  K: 80,  temperature: 18.87, humidity: 16.86, ph: 7.07, rainfall: 80.06,  category: "Legume" },
  kidneybeans:{ N: 20,  P: 68,  K: 20,  temperature: 20.05, humidity: 21.60, ph: 5.74, rainfall: 105.94, category: "Legume" },
  pigeonpeas: { N: 20,  P: 68,  K: 20,  temperature: 27.74, humidity: 48.57, ph: 5.79, rainfall: 149.46, category: "Legume" },
  mothbeans:  { N: 20,  P: 48,  K: 20,  temperature: 28.19, humidity: 53.12, ph: 6.83, rainfall: 51.19,  category: "Legume" },
  mungbean:   { N: 20,  P: 48,  K: 20,  temperature: 28.52, humidity: 85.50, ph: 6.72, rainfall: 48.40,  category: "Legume" },
  blackgram:  { N: 40,  P: 68,  K: 20,  temperature: 29.97, humidity: 65.12, ph: 7.13, rainfall: 67.88,  category: "Legume" },
  lentil:     { N: 20,  P: 68,  K: 20,  temperature: 24.50, humidity: 64.80, ph: 6.93, rainfall: 45.68,  category: "Legume" },
  pomegranate:{ N: 20,  P: 10,  K: 40,  temperature: 21.84, humidity: 90.13, ph: 6.42, rainfall: 107.51, category: "Fruit" },
  banana:     { N: 100, P: 75,  K: 50,  temperature: 27.00, humidity: 80.00, ph: 5.97, rainfall: 104.63, category: "Fruit" },
  mango:      { N: 20,  P: 20,  K: 30,  temperature: 31.20, humidity: 50.16, ph: 5.77, rainfall: 94.56,  category: "Fruit" },
  grapes:     { N: 20,  P: 125, K: 200, temperature: 23.85, humidity: 81.87, ph: 6.02, rainfall: 69.65,  category: "Fruit" },
  watermelon: { N: 100, P: 10,  K: 50,  temperature: 25.59, humidity: 85.16, ph: 6.50, rainfall: 50.79,  category: "Fruit" },
  muskmelon:  { N: 100, P: 10,  K: 50,  temperature: 28.66, humidity: 92.34, ph: 6.36, rainfall: 24.69,  category: "Fruit" },
  apple:      { N: 20,  P: 125, K: 200, temperature: 22.63, humidity: 92.33, ph: 5.93, rainfall: 112.65, category: "Fruit" },
  orange:     { N: 20,  P: 10,  K: 10,  temperature: 22.77, humidity: 92.17, ph: 7.01, rainfall: 110.49, category: "Fruit" },
  papaya:     { N: 50,  P: 60,  K: 50,  temperature: 33.73, humidity: 92.41, ph: 6.74, rainfall: 142.63, category: "Fruit" },
  coconut:    { N: 20,  P: 10,  K: 30,  temperature: 27.41, humidity: 94.84, ph: 5.98, rainfall: 175.69, category: "Fruit" },
  cotton:     { N: 118, P: 46,  K: 20,  temperature: 23.99, humidity: 79.84, ph: 6.92, rainfall: 80.16,  category: "Cash Crop" },
  jute:       { N: 80,  P: 46,  K: 40,  temperature: 24.96, humidity: 79.64, ph: 6.73, rainfall: 174.79, category: "Cash Crop" },
  coffee:     { N: 100, P: 20,  K: 30,  temperature: 25.54, humidity: 58.87, ph: 6.79, rainfall: 158.07, category: "Cash Crop" }
};

// NPK chart display crops (10 representative crops from report)
const NPK_CHART_CROPS = ["rice", "cotton", "apple", "chickpea", "orange", "banana", "maize", "coffee", "grapes", "watermelon"];

// Feature correlation matrix (Pearson r-values from dataset analysis)
// Order: N, P, K, Temperature, Humidity, pH, Rainfall
const FEATURE_LABELS = ["N", "P", "K", "Temperature", "Humidity", "pH", "Rainfall"];
const CORRELATION_MATRIX = [
  [ 1.00, -0.23, -0.14,  0.03, -0.10,  0.10, -0.06],  // N
  [-0.23,  1.00,  0.74, -0.13,  0.12, -0.14,  0.04],   // P
  [-0.14,  0.74,  1.00, -0.16,  0.19, -0.17,  0.01],   // K
  [ 0.03, -0.13, -0.16,  1.00, -0.06, -0.02, -0.03],   // Temperature
  [-0.10,  0.12,  0.19, -0.06,  1.00, -0.01,  0.09],   // Humidity
  [ 0.10, -0.14, -0.17, -0.02, -0.01,  1.00,  0.05],   // pH
  [-0.06,  0.04,  0.01, -0.03,  0.09,  0.05,  1.00]    // Rainfall
];

// Scatter plot data — representative points per category (sampled from 2,200 records)
const SCATTER_DATA = {
  "Cereal": [
    {temp:23.5,rain:240},{temp:24.1,rain:220},{temp:22.8,rain:260},{temp:21.5,rain:190},
    {temp:25.0,rain:200},{temp:23.0,rain:180},{temp:22.0,rain:230},{temp:24.5,rain:210},
    {temp:20.5,rain:195},{temp:26.0,rain:175},{temp:23.2,rain:250},{temp:21.8,rain:205},
    {temp:22.5,rain:215},{temp:24.8,rain:185},{temp:23.8,rain:225},{temp:22.2,rain:245},
    {temp:25.5,rain:190},{temp:21.0,rain:235},{temp:24.0,rain:88},{temp:22.6,rain:95},
    {temp:23.4,rain:78},{temp:21.9,rain:82},{temp:25.2,rain:75},{temp:20.8,rain:90},
    {temp:24.3,rain:85},{temp:22.1,rain:92},{temp:23.7,rain:70},{temp:21.3,rain:100},
    {temp:24.7,rain:80},{temp:22.9,rain:86},{temp:25.8,rain:72},{temp:20.2,rain:94}
  ],
  "Legume": [
    {temp:18.5,rain:80},{temp:20.0,rain:105},{temp:27.5,rain:150},{temp:28.0,rain:55},
    {temp:28.5,rain:48},{temp:30.0,rain:68},{temp:24.5,rain:46},{temp:19.0,rain:82},
    {temp:20.5,rain:110},{temp:27.0,rain:145},{temp:29.0,rain:52},{temp:28.2,rain:50},
    {temp:29.5,rain:65},{temp:24.0,rain:48},{temp:18.0,rain:78},{temp:21.0,rain:100},
    {temp:26.5,rain:140},{temp:28.8,rain:58},{temp:27.8,rain:45},{temp:30.5,rain:70},
    {temp:25.0,rain:50},{temp:19.5,rain:85},{temp:20.8,rain:108},{temp:26.0,rain:135},
    {temp:29.2,rain:60},{temp:28.3,rain:42},{temp:29.8,rain:72},{temp:24.8,rain:52},
    {temp:17.5,rain:75},{temp:21.5,rain:95},{temp:27.2,rain:130},{temp:28.6,rain:62}
  ],
  "Fruit": [
    {temp:22.0,rain:110},{temp:27.0,rain:105},{temp:31.0,rain:95},{temp:24.0,rain:70},
    {temp:26.0,rain:51},{temp:29.0,rain:25},{temp:22.5,rain:113},{temp:23.0,rain:175},
    {temp:34.0,rain:140},{temp:28.0,rain:50},{temp:22.0,rain:92},{temp:21.5,rain:108},
    {temp:33.0,rain:145},{temp:25.5,rain:52},{temp:23.5,rain:69},{temp:27.5,rain:176},
    {temp:30.0,rain:90},{temp:22.8,rain:115},{temp:35.0,rain:138},{temp:26.5,rain:48},
    {temp:10.5,rain:120},{temp:15.0,rain:100},{temp:38.0,rain:80},{temp:42.0,rain:60},
    {temp:12.0,rain:130},{temp:40.0,rain:70},{temp:44.0,rain:55},{temp:14.0,rain:110},
    {temp:36.0,rain:85},{temp:18.0,rain:105},{temp:32.0,rain:142},{temp:20.0,rain:95}
  ],
  "Cash Crop": [
    {temp:24.0,rain:80},{temp:25.0,rain:175},{temp:25.5,rain:158},{temp:24.5,rain:82},
    {temp:23.5,rain:78},{temp:26.0,rain:170},{temp:26.5,rain:160},{temp:23.0,rain:85},
    {temp:24.8,rain:76},{temp:25.8,rain:172},{temp:26.2,rain:155},{temp:23.8,rain:88},
    {temp:22.5,rain:82},{temp:24.2,rain:168},{temp:25.2,rain:162},{temp:22.8,rain:80},
    {temp:24.5,rain:74},{temp:26.8,rain:178},{temp:27.0,rain:150},{temp:23.2,rain:90},
    {temp:25.5,rain:79},{temp:24.0,rain:165},{temp:26.0,rain:148},{temp:22.0,rain:84},
    {temp:24.2,rain:77},{temp:25.0,rain:180},{temp:25.8,rain:165},{temp:23.5,rain:86},
    {temp:24.8,rain:81},{temp:26.2,rain:172},{temp:27.2,rain:155},{temp:22.5,rain:92}
  ]
};

// Scatter plot colors per category
const CATEGORY_COLORS = {
  "Cereal":    { fill: "#2563eb", stroke: "#1d4ed8", label: "Cereals" },
  "Legume":    { fill: "#16a34a", stroke: "#15803d", label: "Legumes" },
  "Fruit":     { fill: "#ea580c", stroke: "#c2410c", label: "Fruits" },
  "Cash Crop": { fill: "#9333ea", stroke: "#7e22ce", label: "Cash Crops" }
};

// Soil thresholds for analysis (optimal ranges per crop)
const SOIL_THRESHOLDS = {};
Object.keys(CROP_DATA).forEach(crop => {
  const d = CROP_DATA[crop];
  SOIL_THRESHOLDS[crop] = {
    N:  { min: d.N * 0.7,  max: d.N * 1.3,  ideal: d.N },
    P:  { min: d.P * 0.7,  max: d.P * 1.3,  ideal: d.P },
    K:  { min: d.K * 0.7,  max: d.K * 1.3,  ideal: d.K },
    ph: { min: d.ph - 0.5, max: d.ph + 0.5, ideal: d.ph }
  };
});

// Disease class labels (38 classes from PlantVillage)
const DISEASE_CLASSES = {
  0: "Apple — Apple Scab",
  1: "Apple — Black Rot",
  2: "Apple — Cedar Apple Rust",
  3: "Apple — Healthy",
  4: "Blueberry — Healthy",
  5: "Cherry — Powdery Mildew",
  6: "Cherry — Healthy",
  7: "Corn — Cercospora Leaf Spot (Gray Leaf Spot)",
  8: "Corn — Common Rust",
  9: "Corn — Northern Leaf Blight",
  10: "Corn — Healthy",
  11: "Grape — Black Rot",
  12: "Grape — Esca (Black Measles)",
  13: "Grape — Leaf Blight (Isariopsis Leaf Spot)",
  14: "Grape — Healthy",
  15: "Orange — Huanglongbing (Citrus Greening)",
  16: "Peach — Bacterial Spot",
  17: "Peach — Healthy",
  18: "Pepper Bell — Bacterial Spot",
  19: "Pepper Bell — Healthy",
  20: "Potato — Early Blight",
  21: "Potato — Late Blight",
  22: "Potato — Healthy",
  23: "Raspberry — Healthy",
  24: "Soybean — Healthy",
  25: "Squash — Powdery Mildew",
  26: "Strawberry — Leaf Scorch",
  27: "Strawberry — Healthy",
  28: "Tomato — Bacterial Spot",
  29: "Tomato — Early Blight",
  30: "Tomato — Late Blight",
  31: "Tomato — Leaf Mold",
  32: "Tomato — Septoria Leaf Spot",
  33: "Tomato — Spider Mites (Two-Spotted Spider Mite)",
  34: "Tomato — Target Spot",
  35: "Tomato — Yellow Leaf Curl Virus",
  36: "Tomato — Mosaic Virus",
  37: "Tomato — Healthy"
};

// Disease treatment suggestions
const DISEASE_TREATMENTS = {
  0: "Apply fungicides such as captan or myclobutanil. Remove and destroy fallen leaves to reduce inoculum.",
  1: "Prune and destroy infected branches. Apply copper-based fungicides during dormant season.",
  2: "Remove nearby juniper hosts. Apply preventive fungicides in spring before symptoms appear.",
  3: "No treatment needed. Continue regular maintenance and monitoring.",
  4: "No treatment needed. Continue regular maintenance and monitoring.",
  5: "Apply sulfur-based or potassium bicarbonate fungicides. Ensure good air circulation.",
  6: "No treatment needed. Continue regular maintenance and monitoring.",
  7: "Apply foliar fungicides containing strobilurins. Rotate crops and use resistant hybrids.",
  8: "Apply fungicides at first sign of pustules. Use resistant hybrids and early planting.",
  9: "Apply foliar fungicides. Practice crop rotation and tillage to reduce residue.",
  10: "No treatment needed. Continue regular maintenance and monitoring.",
  11: "Apply mancozeb-based fungicides. Remove mummified berries and practice canopy management.",
  12: "No cure available. Remove and destroy infected vines. Protect wounds from infection.",
  13: "Apply copper-based fungicides. Remove infected leaves and improve air circulation.",
  14: "No treatment needed. Continue regular maintenance and monitoring.",
  15: "No cure exists. Remove and destroy infected trees to prevent spread. Control psyllid vectors.",
  16: "Apply copper-based bactericides. Avoid overhead irrigation and remove infected fruits.",
  17: "No treatment needed. Continue regular maintenance and monitoring.",
  18: "Apply copper-based sprays. Remove infected plant debris and practice crop rotation.",
  19: "No treatment needed. Continue regular maintenance and monitoring.",
  20: "Apply chlorothalonil or mancozeb fungicides. Practice crop rotation and remove plant debris.",
  21: "Apply metalaxyl-based fungicides immediately. Destroy infected tubers and improve drainage.",
  22: "No treatment needed. Continue regular maintenance and monitoring.",
  23: "No treatment needed. Continue regular maintenance and monitoring.",
  24: "No treatment needed. Continue regular maintenance and monitoring.",
  25: "Apply sulfur or potassium bicarbonate fungicides. Improve air circulation around plants.",
  26: "Remove and destroy infected leaves. Apply appropriate fungicides and avoid overhead watering.",
  27: "No treatment needed. Continue regular maintenance and monitoring.",
  28: "Apply copper-based bactericides. Remove infected foliage and avoid working with wet plants.",
  29: "Apply mancozeb or chlorothalonil fungicides. Mulch around plants and practice crop rotation.",
  30: "Apply metalaxyl or mancozeb fungicides immediately. Remove infected plants and improve air flow.",
  31: "Reduce humidity and improve ventilation. Apply chlorothalonil-based fungicides.",
  32: "Apply mancozeb or copper fungicides. Remove infected lower leaves and avoid overhead irrigation.",
  33: "Apply miticides or insecticidal soap. Increase humidity and remove heavily infested leaves.",
  34: "Apply chlorothalonil or copper fungicides. Practice crop rotation and remove plant debris.",
  35: "Control whitefly vectors with insecticides. Use resistant varieties and remove infected plants.",
  36: "No cure available. Remove infected plants immediately. Disinfect tools and hands after handling.",
  37: "No treatment needed. Continue regular maintenance and monitoring."
};
