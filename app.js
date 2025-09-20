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

let pieChart, lineChart;

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
    animateValue('cash3', cashflow3Years, true); // true for permanent neon

    const totalReturn = cashflow3Years + deltaValue;
    animateValue('totalReturn', totalReturn, true); // true for permanent neon
    animateValue('finalTotalReturn', totalReturn, true); // true for permanent neon

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

  document.getElementById('rentalDKK').textContent = `${rentalDKK.toLocaleString('da-DK')} DKK`;
  document.getElementById('valueDKK').textContent = `${valueDKK.toLocaleString('da-DK')} DKK`;
  document.getElementById('totalDKK').textContent = `${totalDKK.toLocaleString('da-DK')} DKK`;
}

function animateValue(id, targetValue, permanentNeon = false, suffix = ' EUR') {
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
        // Keep neon green permanently for afkast values
        if (permanentNeon) {
          element.classList.add('neon-permanent');
        }
      }, 200);
    }
    
    const displayValue = Math.round(currentValue);
    const label = element.textContent.split(':')[0];
    element.textContent = `${label}: ${displayValue.toLocaleString('da-DK')}${suffix}`;
  }, stepTime);
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

  const ctx = document.getElementById('lineChart').getContext('2d');
  
  if (lineChart) lineChart.destroy();
  
  // Timeline: Rental income starts Jan 2027, Value appreciation happens at completion (2027)
  lineChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['2027', '2028', '2029', '2030'],
      datasets: [
        {
          label: 'Akkumuleret lejeindkomst (fra 2027)',
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
        },
        {
          label: 'Værdiforøgelse (2027 completion)',
          data: [deltaValue, deltaValue, deltaValue, deltaValue],
          borderColor: '#09B5DA',
          backgroundColor: 'rgba(9, 181, 218, 0.1)',
          fill: false,
          tension: 0,
          pointBackgroundColor: '#09B5DA',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 3,
          pointRadius: 8,
          pointHoverRadius: 12,
          borderWidth: 4,
          borderDash: [10, 5]
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          ticks: { 
            color: '#ffffff',
            font: { size: 14, weight: '600' }
          },
          grid: { 
            color: 'rgba(255, 255, 255, 0.1)',
            borderColor: '#09B5DA'
          }
        },
        y: {
          ticks: {
            color: '#ffffff',
            font: { size: 14, weight: '600' },
            callback: value => value.toLocaleString('da-DK') + ' EUR'
          },
          grid: { 
            color: 'rgba(255, 255, 255, 0.1)',
            borderColor: '#09B5DA'
          }
        }
      },
      plugins: {
        legend: {
          position: 'top',
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
          borderWidth: 2
        }
      },
      animation: {
        duration: 2000,
        easing: 'easeInOutCubic',
        onProgress: function(animation) {
          const progress = animation.currentStep / animation.numSteps;
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
      }
    }
  });
}

// Initialize
updateCalculations();
