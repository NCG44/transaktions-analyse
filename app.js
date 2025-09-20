// Set today's date
document.getElementById('date').valueAsDate = new Date();

const panels = document.querySelectorAll('.section');
const crumbs = document.querySelectorAll('.crumb');

// EUR to DKK conversion rate
const EUR_TO_DKK = 7.44;

// Intersection Observer for scroll animations
const observerOptions = {
  threshold: 0.3,
  rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('animate-on-scroll');
      if (entry.target.id === 'section-7') {
        setTimeout(initCharts, 300);
      }
    }
  });
}, observerOptions);

panels.forEach(panel => observer.observe(panel));

function showPanel(i) {
  panels[i].classList.add('active');
  crumbs[i].classList.add('active');
  panels[i].scrollIntoView({ behavior: 'smooth', block: 'center' });
}

showPanel(0);

document.querySelectorAll('.next-btn').forEach((btn, idx) => {
  btn.addEventListener('click', () => {
    if (idx + 1 < panels.length) {
      showPanel(idx + 1);
    }
  });
});

document.getElementById('name').addEventListener('input', function () {
  document.getElementById('btn-1').style.display = this.value.trim() ? 'block' : 'none';
});

let pieChart, rentalChart, valueChart;

['prisPrNat', 'lejedeNaetter', 'diskonto'].forEach(id =>
  document.getElementById(id).addEventListener('input', updateCalculations)
);

function updateCalculations() {
  const pricePerNight = +document.getElementById('prisPrNat').value || 0;
  const rentedNights = +document.getElementById('lejedeNaetter').value || 0;
  const revenue = pricePerNight * rentedNights;

  if (revenue) {
    animateValue('brutto', revenue);
  }

  const managementFee = revenue * 0.2;
  const maintenanceCost = 660;
  const totalCosts = managementFee + maintenanceCost;

  if (managementFee) {
    animateValue('udlejning', managementFee);
    animateValue('totalCost', totalCosts);
    drawPieChart([revenue - totalCosts, managementFee, maintenanceCost]);
  }

  const netRevenue = revenue - totalCosts;
  if (netRevenue) {
    animateValue('netto', netRevenue);
  }

  const discountFactor = +document.getElementById('diskonto').value || 0;
  
  // Only calculate if discount factor is provided
  if (discountFactor && netRevenue) {
    // Exit price calculation: net annual income / discount rate
    const projectedExitPrice = (netRevenue / (discountFactor / 100));
    animateValue('exitPrice', projectedExitPrice);

    // Værdiforøgelse calculation: exit price - initial investment (assume 143,000)
    const deltaValue = projectedExitPrice - 143000;
    animateValue('delta', deltaValue);

    const cashflow3Years = netRevenue * 3;
    animateValue('cash3', cashflow3Years, true); // true for permanent neon numbers only

    const totalReturn = cashflow3Years + deltaValue;
    animateValue('totalReturn', totalReturn, true); // true for permanent neon numbers only
    animateValue('finalTotalReturn', totalReturn, true); // true for permanent neon numbers only

    // Update currency conversion
    updateCurrencyConversion(cashflow3Years, deltaValue, totalReturn);
  } else {
    // Reset værdiforøgelse if no discount factor
    document.getElementById('delta').textContent = 'Værdiforøgelse/Delta: 0 EUR';
  }
}

function updateCurrencyConversion(rental, valueAppreciation, total) {
  const rentalDKK = Math.round(rental * EUR_TO_DKK);
  const valueDKK = Math.round(valueAppreciation * EUR_TO_DKK);
  const totalDKK = Math.round(total * EUR_TO_DKK);

  // Update EUR amounts
  document.getElementById('rentalEUR').textContent = `${Math.round(rental).toLocaleString('da-DK')} EUR`;
  document.getElementById('valueEUR').textContent = `${Math.round(valueAppreciation).toLocaleString('da-DK')} EUR`;
  document.getElementById('totalEUR').textContent = `${Math.round(total).toLocaleString('da-DK')} EUR`;

  // Update DKK amounts
  document.getElementById('rentalDKK').textContent = `${rentalDKK.toLocaleString('da-DK')} DKK`;
  document.getElementById('valueDKK').textContent = `${valueDKK.toLocaleString('da-DK')} DKK`;
  document.getElementById('totalDKK').textContent = `${totalDKK.toLocaleString('da-DK')} DKK`;
}

function animateValue(id, targetValue, permanentNeonNumbers = false, suffix = ' EUR') {
  const element = document.getElementById(id);
  if (!element) return;

  element.classList.add('counting-animation');
  
  let currentValue = 0;
  const increment = targetValue / 80;
  const duration = 1200;
  const stepTime = duration / 80;

  const interval = setInterval(() => {
    currentValue += increment;
    if (currentValue >= targetValue) {
      clearInterval(interval);
      currentValue = targetValue;
      setTimeout(() => {
        element.classList.remove('counting-animation');
        // Apply neon green to numbers only (not the entire text)
        if (permanentNeonNumbers) {
          element.classList.add('neon-permanent');
          applyNeonToNumbersOnly(element);
        }
      }, 200);
    }
    
    const displayValue = Math.round(currentValue);
    const label = element.textContent.split(':')[0];
    element.textContent = `${label}: ${displayValue.toLocaleString('da-DK')}${suffix}`;
  }, stepTime);
}

// Function to apply neon green only to numbers
function applyNeonToNumbersOnly(element) {
  const text = element.textContent;
  const parts = text.split(':');
  
  if (parts.length === 2) {
    const label = parts[0].trim();
    const value = parts[1].trim();
    
    // Create HTML with styled numbers
    element.innerHTML = `<span class="label-text">${label}:</span> <span class="neon-number">${value}</span>`;
  }
}

function drawPieChart(data) {
  const ctx = document.getElementById('pieChart').getContext('2d');
  
  if (pieChart) pieChart.destroy();
  
  pieChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Profit', 'Udlejningsselskab (20%)', 'Vedligeholdelse'],
      datasets: [{
        data: data,
        backgroundColor: [
          'rgba(0, 255, 102, 0.8)',
          'rgba(255, 127, 0, 0.8)',
          'rgba(28, 110, 164, 0.8)'
        ],
        borderColor: [
          '#00ff66',
          '#ff7f00',
          '#1c6ea4'
        ],
        borderWidth: 3,
        hoverOffset: 15
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: '#ffffff',
            font: { size: 14, weight: '600' },
            padding: 20,
            usePointStyle: true
          }
        },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          titleColor: '#00ff66',
          bodyColor: '#ffffff',
          borderColor: '#00ff66',
          borderWidth: 1
        }
      },
      animation: {
        animateRotate: true,
        animateScale: true,
        duration: 1500,
        easing: 'easeInOutQuart'
      }
    }
  });
}

function initCharts() {
  const netValue = +document.getElementById('netto').textContent.replace(/\D/g, '') || 0;
  const deltaValue = +document.getElementById('delta').textContent.replace(/\D/g, '') || 0;
  
  if (netValue === 0) return;

  // Rental Income Chart
  drawRentalChart(netValue);
  
  // Value Appreciation Chart
  drawValueChart(deltaValue);
}

function drawRentalChart(netValue) {
  const ctx = document.getElementById('rentalChart').getContext('2d');
  
  if (rentalChart) rentalChart.destroy();
  
  rentalChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['2027', '2028', '2029', '2030'],
      datasets: [{
        label: 'Akkumuleret lejeindtægt',
        data: [netValue, netValue * 2, netValue * 3, netValue * 4],
        borderColor: '#00ff66',
        backgroundColor: 'rgba(0, 255, 102, 0.1)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#00ff66',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 3,
        pointRadius: 8,
        pointHoverRadius: 12,
        borderWidth: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          ticks: { 
            color: '#ffffff',
            font: { size: 12, weight: '600' }
          },
          grid: { 
            color: 'rgba(255, 255, 255, 0.1)',
            borderColor: '#00ff66'
          }
        },
        y: {
          ticks: {
            color: '#ffffff',
            font: { size: 12, weight: '600' },
            callback: value => value.toLocaleString('da-DK') + ' EUR'
          },
          grid: { 
            color: 'rgba(255, 255, 255, 0.1)',
            borderColor: '#00ff66'
          }
        }
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          titleColor: '#00ff66',
          bodyColor: '#ffffff',
          borderColor: '#00ff66',
          borderWidth: 2,
          callbacks: {
            label: function(context) {
              return `Lejeindtægt: ${context.parsed.y.toLocaleString('da-DK')} EUR`;
            }
          }
        }
      },
      animation: {
        duration: 3000,
        easing: 'easeInOutCubic',
        onProgress: function(animation) {
          const progress = animation.currentStep / animation.numSteps;
          const canvas = animation.chart.canvas;
          
          // Add glow effect during animation
          if (progress < 1) {
            canvas.style.filter = `drop-shadow(0 0 ${5 + progress * 10}px rgba(0, 255, 102, ${0.3 + progress * 0.3}))`;
          } else {
            canvas.style.filter = 'drop-shadow(0 4px 15px rgba(9, 181, 218, 0.1))';
          }
          
          // Progressive line drawing
          this.data.datasets.forEach((dataset, index) => {
            const meta = this.getDatasetMeta(index);
            meta.data.forEach((point, pointIndex) => {
              if (pointIndex / meta.data.length <= progress) {
                point.options.pointRadius = 8;
              } else {
                point.options.pointRadius = 0;
              }
            });
          });
        }
      },
      interaction: {
        intersect: false,
        mode: 'index'
      }
    }
  });
}

function drawValueChart(deltaValue) {
  const ctx = document.getElementById('valueChart').getContext('2d');
  
  if (valueChart) valueChart.destroy();
  
  // Create curved growth data points from 2025 to 2027 only
  const baseValue = 143000; // Starting property value
  const finalValue = baseValue + deltaValue; // Final property value
  
  // Generate curved growth from 2025 to 2027
  const growthData = [
    baseValue, // 2025 - starting point
    baseValue + (deltaValue * 0.15), // 2026 - slow growth
    finalValue // 2027 - completion
  ];
  
  valueChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['2025', '2026', '2027'],
      datasets: [{
        label: 'Værdiforøgelse',
        data: growthData,
        borderColor: '#09B5DA',
        backgroundColor: 'rgba(9, 181, 218, 0.1)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: ['#09B5DA', '#09B5DA', '#00ff66'],
        pointBorderColor: '#ffffff',
        pointBorderWidth: 3,
        pointRadius: [6, 6, 12],
        pointHoverRadius: [10, 10, 16],
        pointHoverBackgroundColor: ['#09B5DA', '#09B5DA', '#00ff66'],
        borderWidth: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          ticks: { 
            color: '#ffffff',
            font: { size: 12, weight: '600' }
          },
          grid: { 
            color: 'rgba(255, 255, 255, 0.1)',
            borderColor: '#09B5DA'
          }
        },
        y: {
          ticks: {
            color: '#ffffff',
            font: { size: 12, weight: '600' },
            callback: value => value.toLocaleString('da-DK') + ' EUR'
          },
          grid: { 
            color: 'rgba(255, 255, 255, 0.1)',
            borderColor: '#09B5DA'
          }
        }
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          titleColor: '#09B5DA',
          bodyColor: '#ffffff',
          borderColor: '#09B5DA',
          borderWidth: 2,
          callbacks: {
            label: function(context) {
              if (context.dataIndex === context.dataset.data.length - 1) {
                return `Færdig værdi: ${context.parsed.y.toLocaleString('da-DK')} EUR`;
              }
              return `Værdi: ${context.parsed.y.toLocaleString('da-DK')} EUR`;
            }
          }
        }
      },
      animation: {
        duration: 3000,
        easing: 'easeInOutCubic',
        onProgress: function(animation) {
          const progress = animation.currentStep / animation.numSteps;
          const canvas = animation.chart.canvas;
          
          // Add glow effect during animation
          if (progress < 1) {
            canvas.style.filter = `drop-shadow(0 0 ${5 + progress * 10}px rgba(9, 181, 218, ${0.3 + progress * 0.3}))`;
          } else {
            canvas.style.filter = 'drop-shadow(0 4px 15px rgba(9, 181, 218, 0.1))';
          }
          
          // Progressive line drawing
          this.data.datasets.forEach((dataset, index) => {
            const meta = this.getDatasetMeta(index);
            meta.data.forEach((point, pointIndex) => {
              if (pointIndex / meta.data.length <= progress) {
                if (pointIndex === meta.data.length - 1) {
                  point.options.pointRadius = 12; // Special end point
                } else {
                  point.options.pointRadius = 6;
                }
              } else {
                point.options.pointRadius = 0;
              }
            });
          });
        }
      },
      interaction: {
        intersect: false,
        mode: 'index'
      }
    }
  });
}

// Initialize
updateCalculations();
