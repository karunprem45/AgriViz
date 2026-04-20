// ============================================================
// SMART AGRICULTURE DSS — Application Logic
// Disease Detection (TF.js CNN) + Soil Analysis + Crop Recommendation
// ============================================================

let model = null;
let modelLoaded = false;

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
  initTabs();
  initDiseaseDetection();
  initSoilAnalysis();
  initCropRecommendation();
  initHamburger();
});

// --- Hamburger Menu ---
function initHamburger() {
  const btn = document.getElementById('hamburger');
  if (btn) {
    btn.addEventListener('click', () => {
      document.getElementById('navLinks').classList.toggle('open');
    });
  }
}

// --- Tab System ---
function initTabs() {
  const btns = document.querySelectorAll('.app-tab-btn, .tab-btn');
  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      btns.forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById('tab-' + btn.dataset.tab).classList.add('active');
    });
  });
}

// ============================================================
// MODULE 1: DISEASE DETECTION (MobileNet CNN via TensorFlow.js)
// ============================================================

async function initDiseaseDetection() {
  loadSampleImages();
  setupUpload();
  await loadModel();
}

async function loadModel() {
  const dot = document.getElementById('modelDot');
  const text = document.getElementById('modelText');
  try {
    dot.className = 'model-status-dot loading';
    text.textContent = 'Loading CNN model...';
    model = await tf.loadLayersModel('models/plant-disease/tensorflowjs-model/model.json');
    modelLoaded = true;
    dot.className = 'model-status-dot ready';
    text.textContent = 'MobileNet CNN model loaded successfully';
  } catch (e) {
    dot.className = 'model-status-dot error';
    text.textContent = 'Model failed to load. Please use a local server (not file://).';
    console.error('Model load error:', e);
  }
}

function loadSampleImages() {
  const grid = document.getElementById('sampleGrid');
  if (!grid) return;
  const samples = [
    { file: 'TomatoEarlyBlight1.jpg', label: 'Tomato Early Blight' },
    { file: 'TomatoEarlyBlight5.jpg', label: 'Tomato Early Blight' },
    { file: 'TomatoHealthy2.jpg', label: 'Tomato Healthy' },
    { file: 'TomatoYellowCurlVirus1.jpg', label: 'Tomato Yellow Curl' },
    { file: 'TomatoYellowCurlVirus3.jpg', label: 'Tomato Yellow Curl' },
    { file: 'PotatoEarlyBlight2.jpg', label: 'Potato Early Blight' },
    { file: 'PotatoEarlyBlight4.jpg', label: 'Potato Early Blight' },
    { file: 'PotatoHealthy1.jpg', label: 'Potato Healthy' }
  ];
  samples.forEach(s => {
    const img = document.createElement('img');
    img.src = 'models/plant-disease/test-images/' + s.file;
    img.alt = s.label;
    img.title = s.label;
    img.className = 'sample-img';
    img.addEventListener('click', () => predictFromImage(img.src));
    grid.appendChild(img);
  });
}

function setupUpload() {
  const area = document.getElementById('uploadArea');
  const input = document.getElementById('imageUpload');
  if (!area || !input) return;

  area.addEventListener('click', () => input.click());
  area.addEventListener('dragover', (e) => { e.preventDefault(); area.classList.add('dragover'); });
  area.addEventListener('dragleave', () => area.classList.remove('dragover'));
  area.addEventListener('drop', (e) => {
    e.preventDefault();
    area.classList.remove('dragover');
    if (e.dataTransfer.files.length > 0) handleFile(e.dataTransfer.files[0]);
  });
  input.addEventListener('change', (e) => {
    if (e.target.files.length > 0) handleFile(e.target.files[0]);
  });
}

function handleFile(file) {
  if (!file.type.startsWith('image/')) return;
  const reader = new FileReader();
  reader.onload = (e) => predictFromImage(e.target.result);
  reader.readAsDataURL(file);
}

async function predictFromImage(src) {
  const resultDiv = document.getElementById('diseaseResult');
  if (!modelLoaded) {
    resultDiv.innerHTML = '<div class="placeholder-state"><p class="placeholder-text">Model is still loading. Please wait...</p></div>';
    return;
  }

  resultDiv.innerHTML = '<div class="loading-overlay"><div class="spinner"></div>Analyzing leaf image...</div>';

  // Small delay to let UI update
  await new Promise(r => setTimeout(r, 50));

  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = async () => {
    try {
      // Preprocess: resize to 224x224, normalize to 0-1
      const tensor = tf.browser.fromPixels(img)
        .resizeNearestNeighbor([224, 224])
        .toFloat()
        .div(tf.scalar(255))
        .expandDims(0);

      // Predict
      const predictions = await model.predict(tensor).data();
      tensor.dispose();

      // Get top prediction
      const maxIdx = predictions.indexOf(Math.max(...predictions));
      const confidence = predictions[maxIdx];
      const className = DISEASE_CLASSES[maxIdx] || 'Unknown';
      const isHealthy = className.toLowerCase().includes('healthy');
      const treatment = DISEASE_TREATMENTS[maxIdx] || '';

      // Render result
      renderDiseaseResult(src, className, confidence, isHealthy, treatment);
    } catch (e) {
      resultDiv.innerHTML = '<div class="placeholder-state"><p class="placeholder-text">Error analyzing image. Please try another image.</p></div>';
      console.error('Prediction error:', e);
    }
  };
  img.src = src;
}

function renderDiseaseResult(imgSrc, className, confidence, isHealthy, treatment) {
  const confPercent = (confidence * 100).toFixed(1);
  const confClass = confidence > 0.7 ? 'high' : confidence > 0.4 ? 'medium' : 'low';
  const overlayClass = isHealthy ? 'healthy' : 'disease';
  const nameClass = isHealthy ? 'healthy' : 'disease';

  let html = `
    <div class="disease-result">
      <div class="disease-image-container">
        <img src="${imgSrc}" alt="Analyzed leaf">
        <div class="disease-overlay ${overlayClass}"></div>
      </div>
      <div class="disease-name ${nameClass}">${className}</div>
      <div class="confidence-bar-container">
        <div class="confidence-bar ${confClass}" style="width: ${confPercent}%">${confPercent}%</div>
      </div>
      <p style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 0.5rem;">Confidence Score</p>`;

  if (treatment && !isHealthy) {
    html += `
      <div class="treatment-box">
        <h4>Recommended Treatment</h4>
        <p>${treatment}</p>
      </div>`;
  } else if (isHealthy) {
    html += `
      <div class="treatment-box" style="background: #f0fdf4; border-color: #bbf7d0;">
        <h4 style="color: #166534;">Status: Healthy</h4>
        <p style="color: #15803d;">No disease detected. Continue regular maintenance and monitoring of the plant.</p>
      </div>`;
  }

  html += '</div>';
  document.getElementById('diseaseResult').innerHTML = html;
}

// ============================================================
// MODULE 2: SOIL ANALYSIS
// ============================================================

function initSoilAnalysis() {
  const select = document.getElementById('soilCrop');
  if (!select) return;

  // Populate crop dropdown
  Object.keys(CROP_DATA).sort().forEach(crop => {
    const opt = document.createElement('option');
    opt.value = crop;
    opt.textContent = crop.charAt(0).toUpperCase() + crop.slice(1);
    select.appendChild(opt);
  });

  document.getElementById('analyzeSoilBtn').addEventListener('click', analyzeSoil);
}

// Valid soil reading ranges for input validation
const SOIL_RANGES = {
  N:  { min: 0, max: 300, label: 'Nitrogen (N)',    unit: 'mg/kg' },
  P:  { min: 0, max: 300, label: 'Phosphorus (P)',  unit: 'mg/kg' },
  K:  { min: 0, max: 400, label: 'Potassium (K)',   unit: 'mg/kg' },
  ph: { min: 0, max: 14,  label: 'pH Level',        unit: '' }
};

function analyzeSoil() {
  const crop = document.getElementById('soilCrop').value;
  const n = parseFloat(document.getElementById('soilN').value);
  const p = parseFloat(document.getElementById('soilP').value);
  const k = parseFloat(document.getElementById('soilK').value);
  const ph = parseFloat(document.getElementById('soilPH').value);
  const resultDiv = document.getElementById('soilResult');

  if (!crop) {
    resultDiv.innerHTML = '<div class="placeholder-state"><p class="placeholder-text">Please select a crop first.</p></div>';
    return;
  }
  if (isNaN(n) || isNaN(p) || isNaN(k) || isNaN(ph)) {
    resultDiv.innerHTML = '<div class="placeholder-state"><p class="placeholder-text">Please fill in all soil readings.</p></div>';
    return;
  }

  // --- Input Validation ---
  const inputValues = { N: n, P: p, K: k, ph: ph };
  const warnings = [];
  Object.entries(inputValues).forEach(([key, val]) => {
    const r = SOIL_RANGES[key];
    if (val < r.min) warnings.push(r.label + ' = ' + val + ' ' + r.unit + ' is below ' + r.min + '. Negative values are not physically possible for soil readings.');
    else if (val > r.max) warnings.push(r.label + ' = ' + val + ' ' + r.unit + ' exceeds typical maximum (' + r.max + '). Please verify your sensor reading.');
  });

  const thresholds = SOIL_THRESHOLDS[crop];
  const nutrients = [
    { name: 'Nitrogen (N)', key: 'N', value: n, unit: 'mg/kg', ...thresholds.N },
    { name: 'Phosphorus (P)', key: 'P', value: p, unit: 'mg/kg', ...thresholds.P },
    { name: 'Potassium (K)', key: 'K', value: k, unit: 'mg/kg', ...thresholds.K },
    { name: 'pH Level', key: 'ph', value: ph, unit: '', ...thresholds.ph }
  ];

  let html = `<h3 style="margin-bottom: 0.5rem; border-bottom: none; padding-bottom: 0;">Soil Analysis for ${crop.charAt(0).toUpperCase() + crop.slice(1)}</h3>
    <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 1rem;">
      Your readings compared against optimal thresholds. Color indicates status.
    </p>`;

  // Show input warnings
  if (warnings.length > 0) {
    html += '<div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: var(--radius); padding: 0.75rem 1rem; margin-bottom: 1rem;">';
    html += '<h4 style="color: #991b1b; font-size: 0.8rem; margin-bottom: 0.3rem; border-bottom: none; padding-bottom: 0;">Input Warning</h4>';
    html += '<ul style="margin: 0; padding-left: 1.2rem; font-size: 0.8rem; color: #7f1d1d; line-height: 1.6;">';
    warnings.forEach(w => html += '<li>' + w + '</li>');
    html += '</ul></div>';
  }

  nutrients.forEach(nut => {
    const status = getSoilStatus(nut.value, nut.min, nut.max);
    const deviation = getSoilDeviation(nut.value, nut.min, nut.max, nut.ideal);

    // Safe bar calculation: clamp value to >= 0 for rendering
    const safeVal = Math.max(0, nut.value);
    const maxBar = Math.max(safeVal, nut.max) * 1.3;
    const barWidth = maxBar > 0 ? Math.min((safeVal / maxBar) * 100, 100) : 0;
    const threshMinPos = maxBar > 0 ? Math.min((nut.min / maxBar) * 100, 100) : 0;
    const threshMaxPos = maxBar > 0 ? Math.min((nut.max / maxBar) * 100, 100) : 0;

    let barColor;
    if (status === 'optimal') barColor = '#22c55e';
    else if (status === 'deficient') barColor = '#f59e0b';
    else barColor = '#ef4444';

    // Severity label with detail
    let statusLabel = status.charAt(0).toUpperCase() + status.slice(1);
    if (status !== 'optimal' && deviation !== null) {
      statusLabel += ' (' + deviation + ')';
    }

    html += `
      <div class="soil-bar-group">
        <div class="soil-bar-header">
          <span class="soil-bar-label">${nut.name}</span>
          <span>
            <span class="soil-bar-value">${nut.value} ${nut.unit}</span>
            <span class="soil-status ${status}">${statusLabel}</span>
          </span>
        </div>
        <div class="soil-bar-track">
          <div class="soil-bar-fill" style="width: ${barWidth}%; background: ${barColor};"></div>
          <div class="soil-bar-threshold" style="left: ${threshMinPos}%;" title="Min: ${nut.min.toFixed(1)}"></div>
          <div class="soil-bar-threshold" style="left: ${threshMaxPos}%;" title="Max: ${nut.max.toFixed(1)}"></div>
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 0.7rem; color: var(--text-secondary); margin-top: 2px;">
          <span>0</span>
          <span>Ideal: ${nut.ideal.toFixed(1)} ${nut.unit} (Range: ${nut.min.toFixed(1)} \u2013 ${nut.max.toFixed(1)})</span>
        </div>
      </div>`;
  });

  // Summary
  const statuses = nutrients.map(n => getSoilStatus(n.value, n.min, n.max));
  const allOptimal = statuses.every(s => s === 'optimal');
  const severeCount = nutrients.filter((nut, i) => {
    if (statuses[i] === 'optimal') return false;
    const dev = Math.abs(nut.value - nut.ideal) / (nut.ideal || 1);
    return dev > 0.5;
  }).length;

  html += '<div style="margin-top: 1.5rem; padding: 1rem; border-radius: var(--radius); ';
  if (allOptimal) {
    html += 'background: #f0fdf4; border: 1px solid #bbf7d0;">';
    html += '<h4 style="color: #166534; margin-bottom: 0.3rem; border-bottom: none; padding-bottom: 0;">All Nutrients Optimal</h4>';
    html += '<p style="color: #15803d; font-size: 0.85rem; margin: 0;">Your soil conditions are well-suited for ' + crop + '. Continue current soil management practices.</p>';
  } else if (severeCount >= 3) {
    html += 'background: #fef2f2; border: 1px solid #fecaca;">';
    html += '<h4 style="color: #991b1b; margin-bottom: 0.3rem; border-bottom: none; padding-bottom: 0;">Critical: Multiple Severe Deficiencies</h4>';
    html += '<p style="color: #7f1d1d; font-size: 0.85rem; margin: 0;">Most readings are significantly outside the optimal range for ' + crop + '. Verify your sensor readings are correct. If accurate, this soil may require substantial amendment before planting ' + crop + '.</p>';
  } else {
    html += 'background: #fffbeb; border: 1px solid #fde68a;">';
    html += '<h4 style="color: #92400e; margin-bottom: 0.3rem; border-bottom: none; padding-bottom: 0;">Action Recommended</h4>';
    let advice = [];
    nutrients.forEach((nut, i) => {
      if (statuses[i] === 'deficient') {
        const diff = nut.min - nut.value;
        advice.push(nut.name + ' is ' + diff.toFixed(1) + ' ' + nut.unit + ' below optimal minimum \u2014 consider supplementation.');
      }
      if (statuses[i] === 'excess') {
        const diff = nut.value - nut.max;
        advice.push(nut.name + ' is ' + diff.toFixed(1) + ' ' + nut.unit + ' above optimal maximum \u2014 reduce application or consider crop alternatives.');
      }
    });
    html += '<p style="color: #78350f; font-size: 0.85rem; margin: 0;">' + advice.join('<br>') + '</p>';
  }
  html += '</div>';

  // --- Crop Suggestions Based on Soil ---
  html += renderSoilCropSuggestions(n, p, k, ph, crop);

  resultDiv.innerHTML = html;
}

// Rank all crops by soil suitability (N, P, K, pH)
function renderSoilCropSuggestions(n, p, k, ph, targetCrop) {
  const soilFeatures = ['N', 'P', 'K', 'ph'];
  const userSoil = { N: n, P: p, K: k, ph: ph };

  // Score each crop: count how many nutrients fall within optimal range + compute closeness
  const scored = [];
  Object.entries(CROP_DATA).forEach(([crop, profile]) => {
    const t = SOIL_THRESHOLDS[crop];
    let optimalCount = 0;
    let totalSim = 0;

    soilFeatures.forEach(f => {
      const val = userSoil[f];
      const th = t[f];
      // Check if within optimal range
      if (val >= th.min && val <= th.max) {
        optimalCount++;
        totalSim += 1;
      } else {
        // How far off, relative to the range width
        const rangeWidth = th.max - th.min || 1;
        const dist = val < th.min ? (th.min - val) / rangeWidth : (val - th.max) / rangeWidth;
        totalSim += Math.max(0, 1 - dist);
      }
    });

    const match = (totalSim / soilFeatures.length) * 100;
    scored.push({ crop, match, optimalCount, category: profile.category });
  });

  scored.sort((a, b) => b.match - a.match || b.optimalCount - a.optimalCount);

  // Find target crop's rank
  const targetRank = scored.findIndex(s => s.crop === targetCrop) + 1;
  const targetScore = scored.find(s => s.crop === targetCrop);

  let html = '<div style="margin-top: 1.75rem; padding-top: 1.25rem; border-top: 1px solid var(--border-light);">';
  html += '<h4 style="margin-bottom: 0.3rem; border-bottom: none; padding-bottom: 0; font-size: 0.92rem;">Crop Suggestions Based on Your Soil</h4>';
  html += '<p style="font-size: 0.82rem; color: var(--text-secondary); margin-bottom: 1rem;">All 22 crops ranked by how well your N, P, K, and pH readings match their optimal thresholds.</p>';

  // Target crop position indicator
  if (targetScore) {
    let posColor, posLabel;
    if (targetScore.optimalCount === 4) {
      posColor = '#16a34a'; posLabel = 'Excellent fit';
    } else if (targetScore.optimalCount >= 3) {
      posColor = '#16a34a'; posLabel = 'Good fit';
    } else if (targetScore.optimalCount >= 2) {
      posColor = '#d97706'; posLabel = 'Partial fit';
    } else {
      posColor = '#dc2626'; posLabel = 'Poor fit';
    }
    html += '<div style="background: var(--bg-alt); border: 1px solid var(--border-light); border-radius: var(--radius); padding: 0.6rem 0.85rem; margin-bottom: 1rem; display: flex; justify-content: space-between; align-items: center;">';
    html += '<span style="font-size: 0.82rem;"><strong>' + targetCrop.charAt(0).toUpperCase() + targetCrop.slice(1) + '</strong> (your target) ranks <strong>#' + targetRank + '</strong> of 22 crops</span>';
    html += '<span style="font-size: 0.72rem; font-weight: 600; color: ' + posColor + '; background: ' + posColor + '14; padding: 0.15rem 0.5rem; border-radius: 100px;">' + targetScore.optimalCount + '/4 optimal \u2014 ' + posLabel + '</span>';
    html += '</div>';
  }

  // Top 5 suggestions
  const top5 = scored.slice(0, 5);
  top5.forEach((item, idx) => {
    const t = SOIL_THRESHOLDS[item.crop];
    const isTarget = item.crop === targetCrop;

    let matchColor;
    if (item.match >= 75) matchColor = '#16a34a';
    else if (item.match >= 50) matchColor = '#d97706';
    else matchColor = '#dc2626';

    html += '<div style="background: ' + (isTarget ? '#eff6ff' : '#fff') + '; border: 1px solid ' + (isTarget ? '#93c5fd' : 'var(--border-light)') + '; border-radius: var(--radius); padding: 0.75rem 0.85rem; margin-bottom: 0.5rem;">';
    html += '<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.4rem;">';
    html += '<div style="display: flex; align-items: center; gap: 0.6rem;">';
    html += '<span style="font-size: 0.72rem; font-weight: 700; background: var(--accent); color: #fff; width: 22px; height: 22px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center;">' + (idx + 1) + '</span>';
    html += '<strong style="font-size: 0.88rem; text-transform: capitalize;">' + item.crop + '</strong>';
    if (isTarget) html += '<span style="font-size: 0.68rem; font-weight: 600; color: var(--accent); background: #dbeafe; padding: 0.1rem 0.4rem; border-radius: 3px;">YOUR TARGET</span>';
    html += '<span style="font-size: 0.7rem; color: var(--text-muted); background: var(--bg-alt); padding: 0.1rem 0.4rem; border-radius: 3px;">' + item.category + '</span>';
    html += '</div>';
    html += '<span style="font-size: 0.82rem; font-weight: 700; color: ' + matchColor + ';">' + item.match.toFixed(1) + '%</span>';
    html += '</div>';

    // Compact nutrient fit indicators
    html += '<div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">';
    soilFeatures.forEach(f => {
      const val = userSoil[f];
      const th = t[f];
      const inRange = val >= th.min && val <= th.max;
      const label = f === 'ph' ? 'pH' : f;
      const dotColor = inRange ? '#16a34a' : '#dc2626';
      const idealStr = f === 'ph' ? th.ideal.toFixed(1) : Math.round(th.ideal);
      html += '<span style="font-size: 0.72rem; color: var(--text-secondary);">';
      html += '<span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:' + dotColor + ';vertical-align:middle;margin-right:3px;"></span>';
      html += label + ': ' + (f === 'ph' ? val.toFixed(1) : val) + ' / ' + idealStr;
      html += '</span>';
    });
    html += '</div>';
    html += '</div>';
  });

  // Show remaining crops if target isn't in top 5
  if (targetRank > 5) {
    html += '<div style="text-align: center; font-size: 0.78rem; color: var(--text-muted); padding: 0.3rem 0;">...</div>';
    // Show the target crop's row
    const t = SOIL_THRESHOLDS[targetCrop];
    let matchColor;
    if (targetScore.match >= 75) matchColor = '#16a34a';
    else if (targetScore.match >= 50) matchColor = '#d97706';
    else matchColor = '#dc2626';

    html += '<div style="background: #eff6ff; border: 1px solid #93c5fd; border-radius: var(--radius); padding: 0.75rem 0.85rem; margin-bottom: 0.5rem;">';
    html += '<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.4rem;">';
    html += '<div style="display: flex; align-items: center; gap: 0.6rem;">';
    html += '<span style="font-size: 0.72rem; font-weight: 700; background: #94a3b8; color: #fff; width: 22px; height: 22px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center;">' + targetRank + '</span>';
    html += '<strong style="font-size: 0.88rem; text-transform: capitalize;">' + targetCrop + '</strong>';
    html += '<span style="font-size: 0.68rem; font-weight: 600; color: var(--accent); background: #dbeafe; padding: 0.1rem 0.4rem; border-radius: 3px;">YOUR TARGET</span>';
    html += '</div>';
    html += '<span style="font-size: 0.82rem; font-weight: 700; color: ' + matchColor + ';">' + targetScore.match.toFixed(1) + '%</span>';
    html += '</div>';

    html += '<div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">';
    soilFeatures.forEach(f => {
      const val = userSoil[f];
      const th = t[f];
      const inRange = val >= th.min && val <= th.max;
      const label = f === 'ph' ? 'pH' : f;
      const dotColor = inRange ? '#16a34a' : '#dc2626';
      const idealStr = f === 'ph' ? th.ideal.toFixed(1) : Math.round(th.ideal);
      html += '<span style="font-size: 0.72rem; color: var(--text-secondary);">';
      html += '<span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:' + dotColor + ';vertical-align:middle;margin-right:3px;"></span>';
      html += label + ': ' + (f === 'ph' ? val.toFixed(1) : val) + ' / ' + idealStr;
      html += '</span>';
    });
    html += '</div>';
    html += '</div>';
  }

  html += '<div style="font-size: 0.7rem; color: var(--text-muted); margin-top: 0.5rem; display: flex; gap: 0.75rem;">';
  html += '<span><span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:#16a34a;vertical-align:middle;"></span> Within optimal range</span>';
  html += '<span><span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:#dc2626;vertical-align:middle;"></span> Outside optimal range</span>';
  html += '</div>';
  html += '</div>';

  return html;
}

function getSoilStatus(value, min, max) {
  if (value < min) return 'deficient';
  if (value > max) return 'excess';
  return 'optimal';
}

// Returns a human-readable deviation string like "-30.0 mg/kg" or "+25%"
function getSoilDeviation(value, min, max, ideal) {
  if (value >= min && value <= max) return null;
  if (value < min) {
    const diff = min - value;
    const pct = ideal > 0 ? Math.round((diff / ideal) * 100) : 0;
    return '\u2212' + diff.toFixed(1) + (pct > 10 ? ', ' + pct + '% below' : '');
  } else {
    const diff = value - max;
    const pct = ideal > 0 ? Math.round((diff / ideal) * 100) : 0;
    return '+' + diff.toFixed(1) + (pct > 10 ? ', ' + pct + '% above' : '');
  }
}

// ============================================================
// MODULE 3: CROP RECOMMENDATION
// ============================================================

// Valid agricultural ranges for input validation
const INPUT_RANGES = {
  N:           { min: 0,   max: 200,  label: 'Nitrogen',    unit: 'mg/kg' },
  P:           { min: 0,   max: 200,  label: 'Phosphorus',  unit: 'mg/kg' },
  K:           { min: 0,   max: 300,  label: 'Potassium',   unit: 'mg/kg' },
  temperature: { min: -5,  max: 55,   label: 'Temperature', unit: '\u00B0C' },
  humidity:    { min: 0,   max: 100,  label: 'Humidity',    unit: '%' },
  ph:          { min: 0,   max: 14,   label: 'pH',          unit: '' },
  rainfall:    { min: 0,   max: 500,  label: 'Rainfall',    unit: 'mm' }
};

function initCropRecommendation() {
  const btn = document.getElementById('recommendBtn');
  if (btn) btn.addEventListener('click', recommendCrops);
}

function recommendCrops() {
  const n = parseFloat(document.getElementById('cropN').value);
  const p = parseFloat(document.getElementById('cropP').value);
  const k = parseFloat(document.getElementById('cropK').value);
  const temp = parseFloat(document.getElementById('cropTemp').value);
  const humid = parseFloat(document.getElementById('cropHumid').value);
  const ph = parseFloat(document.getElementById('cropPH').value);
  const rain = parseFloat(document.getElementById('cropRain').value);
  const resultDiv = document.getElementById('cropResult');

  if ([n, p, k, temp, humid, ph, rain].some(isNaN)) {
    resultDiv.innerHTML = '<div class="placeholder-state"><p class="placeholder-text">Please fill in all field conditions.</p></div>';
    return;
  }

  const userValues = { N: n, P: p, K: k, temperature: temp, humidity: humid, ph: ph, rainfall: rain };
  const features = ['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall'];

  // --- Input Validation ---
  const warnings = [];
  features.forEach(f => {
    const v = userValues[f];
    const r = INPUT_RANGES[f];
    if (v < r.min) warnings.push(r.label + ' (' + v + ' ' + r.unit + ') is below minimum (' + r.min + '). Negative or zero values may not reflect real conditions.');
    else if (v > r.max) warnings.push(r.label + ' (' + v + ' ' + r.unit + ') exceeds typical maximum (' + r.max + '). Please verify your reading.');
  });

  // --- Compute feature ranges from dataset ---
  const ranges = {};
  features.forEach(f => {
    const vals = Object.values(CROP_DATA).map(c => c[f]);
    ranges[f] = { min: Math.min(...vals), max: Math.max(...vals) };
  });

  // --- Per-feature similarity algorithm ---
  // For each crop, compute similarity per feature: max(0, 1 - |diff|/range)
  // Then average across all features for overall match %
  const scores = [];
  Object.entries(CROP_DATA).forEach(([crop, profile]) => {
    const featureScores = {};
    let totalSim = 0;

    features.forEach(f => {
      const range = ranges[f].max - ranges[f].min || 1;
      const diff = Math.abs(userValues[f] - profile[f]) / range;
      const sim = Math.max(0, 1 - diff);
      featureScores[f] = sim;
      totalSim += sim;
    });

    const match = (totalSim / features.length) * 100;
    scores.push({ crop, match, profile, featureScores });
  });

  scores.sort((a, b) => b.match - a.match);
  const top5 = scores.slice(0, 5);
  const bestMatch = top5[0].match;

  // --- Render Results ---
  let html = `<h3 style="margin-bottom: 0.5rem; border-bottom: none; padding-bottom: 0;">Top Crop Recommendations</h3>
    <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 1rem;">
      Ranked by per-feature similarity between your conditions and each crop's optimal profile.
    </p>`;

  // Show input warnings if any
  if (warnings.length > 0) {
    html += '<div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: var(--radius); padding: 0.75rem 1rem; margin-bottom: 1rem;">';
    html += '<h4 style="color: #991b1b; font-size: 0.8rem; margin-bottom: 0.3rem; border-bottom: none; padding-bottom: 0;">Input Warning</h4>';
    html += '<ul style="margin: 0; padding-left: 1.2rem; font-size: 0.8rem; color: #7f1d1d; line-height: 1.6;">';
    warnings.forEach(w => html += '<li>' + w + '</li>');
    html += '</ul></div>';
  }

  // Show match quality banner
  if (bestMatch < 40) {
    html += '<div style="background: #fffbeb; border: 1px solid #fde68a; border-radius: var(--radius); padding: 0.75rem 1rem; margin-bottom: 1rem;">';
    html += '<h4 style="color: #92400e; font-size: 0.8rem; margin-bottom: 0.2rem; border-bottom: none; padding-bottom: 0;">Low Match Quality</h4>';
    html += '<p style="color: #78350f; font-size: 0.8rem; margin: 0;">Your field conditions are significantly different from all crop profiles in the dataset. Results below are best available matches but may not be reliable for planting decisions.</p>';
    html += '</div>';
  }

  top5.forEach((item, idx) => {
    // Match quality color
    let matchColor;
    if (item.match >= 75) matchColor = '#16a34a';
    else if (item.match >= 50) matchColor = '#d97706';
    else matchColor = '#dc2626';

    html += `<div class="crop-card">
      <div class="crop-card-header">
        <div style="display: flex; align-items: center; gap: 0.75rem;">
          <div class="crop-rank">${idx + 1}</div>
          <div class="crop-name">${item.crop}</div>
          <span style="font-size: 0.72rem; color: var(--text-secondary); background: var(--bg-alt); padding: 0.15rem 0.5rem; border-radius: 4px; border: 1px solid var(--border-light);">${item.profile.category}</span>
        </div>
        <div style="font-size: 0.88rem; font-weight: 700; color: ${matchColor}; font-variant-numeric: tabular-nums;">${item.match.toFixed(1)}%</div>
      </div>`;

    const displayFeatures = [
      { key: 'N', label: 'Nitrogen' },
      { key: 'P', label: 'Phosphorus' },
      { key: 'K', label: 'Potassium' },
      { key: 'temperature', label: 'Temp' },
      { key: 'humidity', label: 'Humidity' },
      { key: 'ph', label: 'pH' },
      { key: 'rainfall', label: 'Rainfall' }
    ];

    displayFeatures.forEach(f => {
      const yours = userValues[f.key];
      const ideal = item.profile[f.key];
      const maxVal = Math.max(Math.abs(yours), ideal, 1);
      const yoursWidth = yours > 0 ? Math.min((yours / maxVal) * 100, 100) : 0;
      const idealWidth = Math.min((ideal / maxVal) * 100, 100);
      const featureSim = item.featureScores[f.key];

      // Color code the feature: green if close, amber if moderate, red if far
      let simDot;
      if (featureSim >= 0.8) simDot = '#16a34a';
      else if (featureSim >= 0.5) simDot = '#d97706';
      else simDot = '#dc2626';

      html += `<div class="crop-compare-row">
        <div class="crop-compare-label"><span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:${simDot};margin-right:4px;vertical-align:middle;"></span>${f.label}</div>
        <div class="crop-compare-bars">
          <div class="crop-compare-bar yours" style="width: ${yoursWidth}%;"></div>
          <div class="crop-compare-bar ideal" style="width: ${idealWidth}%;"></div>
        </div>
        <div class="crop-compare-value">${yours.toFixed(1)} / ${ideal.toFixed(1)}</div>
      </div>`;
    });

    html += `<div style="display: flex; gap: 1rem; margin-top: 0.5rem; font-size: 0.72rem; color: var(--text-muted);">
      <span><span style="display: inline-block; width: 12px; height: 8px; background: var(--accent); border-radius: 2px; opacity: 0.8;"></span> Your values</span>
      <span><span style="display: inline-block; width: 12px; height: 8px; background: #94a3b8; border-radius: 2px; opacity: 0.35;"></span> Ideal values</span>
      <span style="margin-left: auto;"><span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:#16a34a;vertical-align:middle;"></span> Close
      <span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:#d97706;vertical-align:middle;margin-left:6px;"></span> Moderate
      <span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:#dc2626;vertical-align:middle;margin-left:6px;"></span> Far</span>
    </div></div>`;
  });

  resultDiv.innerHTML = html;
}
