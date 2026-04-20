// ============================================================
// SMART AGRICULTURE DSS — Dataset Visualizations
// NPK Grouped Bar Chart, Correlation Heatmap, Scatter Plot
// All drawn on HTML Canvas — no external chart libraries
// ============================================================

const tooltip = document.getElementById('chartTooltip');

function showTooltip(e, text) {
  if (!tooltip) return;
  tooltip.textContent = text;
  tooltip.classList.add('visible');
  tooltip.style.left = (e.clientX + 12) + 'px';
  tooltip.style.top = (e.clientY - 10) + 'px';
}

function hideTooltip() {
  if (tooltip) tooltip.classList.remove('visible');
}

// Wait for DOM + data.js
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    drawNPKChart();
    drawHeatmap();
    drawScatterPlot();
  }, 100);
  window.addEventListener('resize', () => {
    drawNPKChart();
    drawHeatmap();
    drawScatterPlot();
  });
});

// ============================================================
// 1. NPK GROUPED BAR CHART
// ============================================================

function drawNPKChart() {
  const canvas = document.getElementById('npkChart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.parentElement.getBoundingClientRect();
  canvas.width = rect.width * dpr;
  canvas.height = 370 * dpr;
  canvas.style.height = '370px';
  ctx.scale(dpr, dpr);
  const W = rect.width;
  const H = 370;

  ctx.clearRect(0, 0, W, H);

  const crops = NPK_CHART_CROPS;
  const pad = { top: 40, right: 25, bottom: 70, left: 62 };
  const chartW = W - pad.left - pad.right;
  const chartH = H - pad.top - pad.bottom;

  // Find max value
  let maxVal = 0;
  crops.forEach(c => {
    const d = CROP_DATA[c];
    maxVal = Math.max(maxVal, d.N, d.P, d.K);
  });
  maxVal = Math.ceil(maxVal / 50) * 50 + 20;

  const groupW = chartW / crops.length;
  const barW = groupW * 0.22;
  const gap = groupW * 0.06;
  const colors = { N: '#2563eb', P: '#16a34a', K: '#ea580c' };

  // Grid lines
  ctx.strokeStyle = 'rgba(0,0,0,0.07)';
  ctx.lineWidth = 0.5;
  const gridLines = 5;
  for (let i = 0; i <= gridLines; i++) {
    const y = pad.top + chartH - (i / gridLines) * chartH;
    ctx.beginPath();
    ctx.moveTo(pad.left, y);
    ctx.lineTo(W - pad.right, y);
    ctx.stroke();

    // Y-axis tick label
    ctx.fillStyle = '#64748b';
    ctx.font = '10px Inter, sans-serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.fillText(Math.round((i / gridLines) * maxVal), pad.left - 8, y);
  }

  // Axis lines
  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(pad.left, pad.top);
  ctx.lineTo(pad.left, pad.top + chartH);
  ctx.lineTo(W - pad.right, pad.top + chartH);
  ctx.stroke();

  // Y-axis title
  ctx.save();
  ctx.translate(16, pad.top + chartH / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillStyle = '#475569';
  ctx.font = '600 11px Inter, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('Nutrient Content (mg/kg)', 0, 0);
  ctx.restore();

  // Bars + hover regions
  const barRegions = [];

  crops.forEach((crop, i) => {
    const d = CROP_DATA[crop];
    const vals = [d.N, d.P, d.K];
    const keys = ['N', 'P', 'K'];
    const x0 = pad.left + i * groupW + (groupW - 3 * barW - 2 * gap) / 2;

    keys.forEach((key, j) => {
      const val = vals[j];
      const barH = (val / maxVal) * chartH;
      const x = x0 + j * (barW + gap);
      const y = pad.top + chartH - barH;

      ctx.fillStyle = colors[key];
      ctx.beginPath();
      roundRect(ctx, x, y, barW, barH, 3);
      ctx.fill();

      barRegions.push({ x, y, w: barW, h: barH, crop, key, val });
    });

    // Crop label — rotated slightly for 10 items
    ctx.save();
    const labelX = pad.left + i * groupW + groupW / 2;
    const labelY = H - pad.bottom + 14;
    ctx.translate(labelX, labelY);
    ctx.rotate(-Math.PI / 7);
    ctx.fillStyle = '#475569';
    ctx.font = '10px Inter, sans-serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'top';
    ctx.fillText(crop.charAt(0).toUpperCase() + crop.slice(1), 0, 0);
    ctx.restore();
  });

  // Legend — centered above chart area
  const legendItems = [
    { key: 'N', label: 'Nitrogen (N)' },
    { key: 'P', label: 'Phosphorus (P)' },
    { key: 'K', label: 'Potassium (K)' }
  ];
  const legendItemWidth = 95;
  const totalLegendW = legendItems.length * legendItemWidth;
  const legendStartX = pad.left + (chartW - totalLegendW) / 2;
  const legendY = pad.top - 18;

  legendItems.forEach((item, i) => {
    const lx = legendStartX + i * legendItemWidth;
    // Color box
    ctx.fillStyle = colors[item.key];
    roundRectFill(ctx, lx, legendY - 4, 12, 9, 2);
    // Label
    ctx.fillStyle = '#475569';
    ctx.font = '10px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(item.label, lx + 16, legendY + 1);
  });

  // Hover interaction
  canvas.onmousemove = (e) => {
    const r = canvas.getBoundingClientRect();
    const mx = e.clientX - r.left;
    const my = e.clientY - r.top;
    let found = false;
    for (const b of barRegions) {
      if (mx >= b.x && mx <= b.x + b.w && my >= b.y && my <= b.y + b.h) {
        showTooltip(e, `${b.crop.charAt(0).toUpperCase() + b.crop.slice(1)} — ${b.key}: ${b.val} mg/kg`);
        canvas.style.cursor = 'pointer';
        found = true;
        break;
      }
    }
    if (!found) { hideTooltip(); canvas.style.cursor = 'default'; }
  };
  canvas.onmouseleave = hideTooltip;
}

// ============================================================
// 2. CORRELATION HEATMAP
// ============================================================

function drawHeatmap() {
  const canvas = document.getElementById('heatmapChart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.parentElement.getBoundingClientRect();
  canvas.width = rect.width * dpr;
  canvas.height = 440 * dpr;
  canvas.style.height = '440px';
  ctx.scale(dpr, dpr);
  const W = rect.width;
  const H = 440;

  ctx.clearRect(0, 0, W, H);

  const labels = FEATURE_LABELS;
  const n = labels.length;
  const pad = { top: 95, right: 60, bottom: 45, left: 95 };
  const gridW = W - pad.left - pad.right;
  const gridH = H - pad.top - pad.bottom;
  const cellW = gridW / n;
  const cellH = gridH / n;
  const cellRegions = [];

  // Cells
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const val = CORRELATION_MATRIX[i][j];
      const x = pad.left + j * cellW;
      const y = pad.top + i * cellH;

      ctx.fillStyle = corrColor(val);
      ctx.fillRect(x, y, cellW - 1, cellH - 1);

      // Value text — adapts to cell size
      const valFont = cellW < 40 ? 8 : cellW < 50 ? 9 : 10;
      ctx.fillStyle = Math.abs(val) > 0.55 ? '#fff' : '#1e293b';
      ctx.font = 'bold ' + valFont + 'px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(val.toFixed(2), x + cellW / 2, y + cellH / 2);

      cellRegions.push({ x, y, w: cellW, h: cellH, row: labels[i], col: labels[j], val });
    }

    // Row labels (left side)
    ctx.fillStyle = '#334155';
    ctx.font = '500 10px Inter, sans-serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.fillText(labels[i], pad.left - 10, pad.top + i * cellH + cellH / 2);
  }

  // Column labels (above grid, rotated -45°)
  for (let j = 0; j < n; j++) {
    const cx = pad.left + j * cellW + cellW / 2;

    // Small tick line
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(cx, pad.top);
    ctx.lineTo(cx, pad.top - 4);
    ctx.stroke();

    // Rotated label — close to grid with clear gap
    ctx.save();
    ctx.translate(cx, pad.top - 6);
    ctx.rotate(-Math.PI / 4);
    ctx.fillStyle = '#334155';
    ctx.font = '500 10px Inter, sans-serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.fillText(labels[j], 0, 0);
    ctx.restore();
  }

  // Grid border
  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 1;
  ctx.strokeRect(pad.left, pad.top, n * cellW - 1, n * cellH - 1);

  // Color scale legend (bottom)
  const scaleW = Math.min(140, gridW * 0.45);
  const scaleH = 10;
  const scaleX = pad.left + (gridW - scaleW) / 2;
  const scaleY = H - 28;

  // Gradient bar
  for (let px = 0; px < scaleW; px++) {
    const val = -1 + (px / scaleW) * 2;
    ctx.fillStyle = corrColor(val);
    ctx.fillRect(scaleX + px, scaleY, 1, scaleH);
  }
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 0.5;
  ctx.strokeRect(scaleX, scaleY, scaleW, scaleH);

  // Scale tick labels
  ctx.fillStyle = '#64748b';
  ctx.font = '9px Inter, sans-serif';
  ctx.textBaseline = 'top';
  ctx.textAlign = 'center';
  ctx.fillText('\u20131.0', scaleX, scaleY + scaleH + 3);
  ctx.fillText('0', scaleX + scaleW / 2, scaleY + scaleH + 3);
  ctx.fillText('+1.0', scaleX + scaleW, scaleY + scaleH + 3);

  // Scale title
  ctx.fillStyle = '#475569';
  ctx.font = '9px Inter, sans-serif';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  ctx.fillText('Pearson r', scaleX - 8, scaleY + scaleH / 2);

  // Hover
  canvas.onmousemove = (e) => {
    const r = canvas.getBoundingClientRect();
    const mx = e.clientX - r.left;
    const my = e.clientY - r.top;
    let found = false;
    for (const c of cellRegions) {
      if (mx >= c.x && mx <= c.x + c.w && my >= c.y && my <= c.y + c.h) {
        showTooltip(e, `${c.row} vs ${c.col}: r = ${c.val.toFixed(2)}`);
        canvas.style.cursor = 'pointer';
        found = true;
        break;
      }
    }
    if (!found) { hideTooltip(); canvas.style.cursor = 'default'; }
  };
  canvas.onmouseleave = hideTooltip;
}

function corrColor(val) {
  // Diverging: blue (negative) → white (zero) → red (positive)
  if (val >= 0) {
    const t = Math.min(val, 1);
    if (t > 0.5) {
      const s = (t - 0.5) * 2;
      return `rgb(${Math.round(180 - s * 100)}, ${Math.round(60 - s * 30)}, ${Math.round(50 - s * 10)})`;
    }
    const s = t * 2;
    return `rgb(${Math.round(235 - s * 55)}, ${Math.round(235 - s * 175)}, ${Math.round(245 - s * 195)})`;
  } else {
    const t = Math.min(Math.abs(val), 1);
    if (t > 0.5) {
      const s = (t - 0.5) * 2;
      return `rgb(${Math.round(50 + (1 - s) * 30)}, ${Math.round(80 + (1 - s) * 40)}, ${Math.round(170 - s * 30)})`;
    }
    const s = t * 2;
    return `rgb(${Math.round(235 - s * 155)}, ${Math.round(235 - s * 115)}, ${Math.round(245 - s * 55)})`;
  }
}

// ============================================================
// 3. TEMPERATURE vs RAINFALL SCATTER PLOT
// ============================================================

function drawScatterPlot() {
  const canvas = document.getElementById('scatterChart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.parentElement.getBoundingClientRect();
  canvas.width = rect.width * dpr;
  canvas.height = 440 * dpr;
  canvas.style.height = '440px';
  ctx.scale(dpr, dpr);
  const W = rect.width;
  const H = 440;

  ctx.clearRect(0, 0, W, H);

  const pad = { top: 40, right: 20, bottom: 55, left: 62 };
  const chartW = W - pad.left - pad.right;
  const chartH = H - pad.top - pad.bottom;

  // Axis ranges
  const tempMin = 5, tempMax = 48;
  const rainMin = 0, rainMax = 280;

  // Grid
  ctx.strokeStyle = 'rgba(0,0,0,0.07)';
  ctx.lineWidth = 0.5;
  for (let i = 0; i <= 5; i++) {
    // Horizontal grid + Y tick labels
    const y = pad.top + chartH - (i / 5) * chartH;
    ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(W - pad.right, y); ctx.stroke();
    ctx.fillStyle = '#64748b';
    ctx.font = '10px Inter, sans-serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.fillText(Math.round(rainMin + (i / 5) * (rainMax - rainMin)), pad.left - 8, y);

    // Vertical grid + X tick labels
    const x = pad.left + (i / 5) * chartW;
    ctx.beginPath(); ctx.moveTo(x, pad.top); ctx.lineTo(x, pad.top + chartH); ctx.stroke();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(Math.round(tempMin + (i / 5) * (tempMax - tempMin)) + '\u00B0C', x, pad.top + chartH + 6);
  }

  // Axis lines
  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(pad.left, pad.top);
  ctx.lineTo(pad.left, pad.top + chartH);
  ctx.lineTo(W - pad.right, pad.top + chartH);
  ctx.stroke();

  // X-axis label
  ctx.fillStyle = '#475569';
  ctx.font = '600 11px Inter, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillText('Temperature (\u00B0C)', pad.left + chartW / 2, H - 14);

  // Y-axis label
  ctx.save();
  ctx.translate(16, pad.top + chartH / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillStyle = '#475569';
  ctx.font = '600 11px Inter, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('Rainfall (mm)', 0, 0);
  ctx.restore();

  // Plot dots
  const dotRegions = [];
  Object.entries(SCATTER_DATA).forEach(([category, points]) => {
    const color = CATEGORY_COLORS[category];
    points.forEach(pt => {
      const x = pad.left + ((pt.temp - tempMin) / (tempMax - tempMin)) * chartW;
      const y = pad.top + chartH - ((pt.rain - rainMin) / (rainMax - rainMin)) * chartH;
      const r = 4.5;

      ctx.globalAlpha = 0.7;
      ctx.fillStyle = color.fill;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();

      ctx.globalAlpha = 0.9;
      ctx.strokeStyle = color.stroke;
      ctx.lineWidth = 1;
      ctx.stroke();

      dotRegions.push({ x, y, r: r + 2, category: color.label, temp: pt.temp, rain: pt.rain });
    });
  });
  ctx.globalAlpha = 1;

  // Legend — top-right boxed
  const categories = Object.entries(CATEGORY_COLORS);
  const legendPadX = 10;
  const legendPadY = 6;
  const legendLineH = 16;
  const legendBoxW = 100;
  const legendBoxH = legendPadY * 2 + categories.length * legendLineH;
  const lbx = W - pad.right - legendBoxW - 6;
  const lby = pad.top + 6;

  // Legend background
  ctx.fillStyle = 'rgba(255,255,255,0.9)';
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 1;
  roundRectFill(ctx, lbx, lby, legendBoxW, legendBoxH, 4);
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 1;
  roundRectStroke(ctx, lbx, lby, legendBoxW, legendBoxH, 4);

  categories.forEach(([cat, color], i) => {
    const cy = lby + legendPadY + i * legendLineH + legendLineH / 2;
    const cx = lbx + legendPadX + 5;

    // Dot
    ctx.fillStyle = color.fill;
    ctx.globalAlpha = 0.85;
    ctx.beginPath();
    ctx.arc(cx, cy, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;

    // Label
    ctx.fillStyle = '#475569';
    ctx.font = '10px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(color.label, cx + 9, cy);
  });

  // Hover
  canvas.onmousemove = (e) => {
    const r = canvas.getBoundingClientRect();
    const mx = e.clientX - r.left;
    const my = e.clientY - r.top;
    let found = false;
    for (const d of dotRegions) {
      const dist = Math.sqrt((mx - d.x) ** 2 + (my - d.y) ** 2);
      if (dist <= d.r) {
        showTooltip(e, `${d.category} — Temp: ${d.temp}\u00B0C, Rain: ${d.rain}mm`);
        canvas.style.cursor = 'pointer';
        found = true;
        break;
      }
    }
    if (!found) { hideTooltip(); canvas.style.cursor = 'default'; }
  };
  canvas.onmouseleave = hideTooltip;
}

// ============================================================
// UTILITY: Rounded Rectangle
// ============================================================
function roundRect(ctx, x, y, w, h, r) {
  if (h < r * 2) r = h / 2;
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h);
  ctx.lineTo(x, y + h);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function roundRectFill(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
  ctx.fill();
}

function roundRectStroke(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
  ctx.stroke();
}
