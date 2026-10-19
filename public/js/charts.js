// ==========================================================================
// LOW COFFE - CHART RENDERING MODULE
// Supports Chart.js with Canvas fallback for offline reliability
// ==========================================================================

let salesChartInstance = null;
let miniChartInstance = null;

const Charts = {
  renderSalesTrend(canvasId, labels, data) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Destroy existing instance if any
    if (salesChartInstance) {
      salesChartInstance.destroy();
      salesChartInstance = null;
    }

    if (typeof Chart !== 'undefined') {
      try {
        const gradient = ctx.createLinearGradient(0, 0, 0, 200);
        gradient.addColorStop(0, 'rgba(168, 142, 130, 0.45)');
        gradient.addColorStop(1, 'rgba(168, 142, 130, 0.02)');

        salesChartInstance = new Chart(ctx, {
          type: 'line',
          data: {
            labels: labels,
            datasets: [{
              label: 'Pendapatan Harian (Rp)',
              data: data,
              borderColor: '#3F2F2F',
              backgroundColor: gradient,
              borderWidth: 2.5,
              tension: 0.38,
              fill: true,
              pointBackgroundColor: '#FFFFFF',
              pointBorderColor: '#3F2F2F',
              pointBorderWidth: 2,
              pointRadius: 4,
              pointHoverRadius: 6
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
              tooltip: {
                backgroundColor: '#2D2222',
                titleFont: { family: 'Plus Jakarta Sans', size: 12, weight: 'bold' },
                bodyFont: { family: 'Plus Jakarta Sans', size: 12 },
                padding: 10,
                displayColors: false,
                callbacks: {
                  label: function(context) {
                    return 'Rp ' + Number(context.parsed.y).toLocaleString('id-ID');
                  }
                }
              }
            },
            scales: {
              x: {
                grid: { display: false },
                ticks: { font: { family: 'Plus Jakarta Sans', size: 10 }, color: '#786B66' }
              },
              y: {
                grid: { color: 'rgba(232, 223, 218, 0.6)' },
                ticks: {
                  font: { family: 'Plus Jakarta Sans', size: 10 },
                  color: '#786B66',
                  callback: function(value) {
                    return 'Rp ' + (value / 1000).toLocaleString('id-ID') + 'k';
                  }
                }
              }
            }
          }
        });
        return;
      } catch (e) {
        console.warn('Chart.js render failed, using canvas fallback:', e);
      }
    }

    // Native HTML5 Canvas Fallback if Chart.js is not loaded
    this.renderCanvasFallback(canvas, labels, data);
  },

  renderMiniTrend(canvasId, labels, data) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (miniChartInstance) {
      miniChartInstance.destroy();
      miniChartInstance = null;
    }

    if (typeof Chart !== 'undefined') {
      try {
        miniChartInstance = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: labels.slice(-7),
            datasets: [{
              data: data.slice(-7),
              backgroundColor: '#A88E82',
              borderRadius: 4,
              barPercentage: 0.6
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
              tooltip: { enabled: true }
            },
            scales: {
              x: { grid: { display: false }, ticks: { font: { size: 9 }, color: '#786B66' } },
              y: { display: false }
            }
          }
        });
        return;
      } catch (e) {
        console.warn('Mini Chart.js failed:', e);
      }
    }
  },

  renderCanvasFallback(canvas, labels, data) {
    const ctx = canvas.getContext('2d');
    const width = canvas.width = canvas.parentElement.clientWidth || 320;
    const height = canvas.height = 200;

    ctx.clearRect(0, 0, width, height);

    const padding = 35;
    const maxVal = Math.max(...data) * 1.1;
    const minVal = 0;
    const pts = [];

    const stepX = (width - padding * 2) / (data.length - 1);

    data.forEach((val, i) => {
      const x = padding + i * stepX;
      const y = height - padding - ((val - minVal) / (maxVal - minVal)) * (height - padding * 2);
      pts.push({ x, y, val, label: labels[i] });
    });

    // Draw Line
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) {
      ctx.lineTo(pts[i].x, pts[i].y);
    }
    ctx.strokeStyle = '#3F2F2F';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Draw Points
    pts.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#FFFFFF';
      ctx.fill();
      ctx.strokeStyle = '#3F2F2F';
      ctx.lineWidth = 2;
      ctx.stroke();
    });
  }
};
