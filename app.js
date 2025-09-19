// Set today's date
document.getElementById('date').valueAsDate = new Date();

const panels = document.querySelectorAll('.section');
const crumbs = document.querySelectorAll('.crumb');

// Show specified panel and breadcrumb, keep others visible
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

const pieCtx = document.getElementById('pieChart').getContext('2d');
let pieChart;
const histCtx = document.getElementById('histogram').getContext('2d');
let histChart;

const lineCtx = document.getElementById('lineChart').getContext('2d');
let lineChart;

['prisPrNat', 'lejedeNaetter', 'diskonto'].forEach(id =>
  document.getElementById(id).addEventListener('input', update)
);

function update() {
  const pricePerNight = +document.getElementById('prisPrNat').value || 0;
  const rentedNights = +document.getElementById('lejedeNaetter').value || 0;
  const revenue = pricePerNight * rentedNights;

  if (revenue) animateValue('brutto', revenue);

  const managementFee = revenue * 0.2;
  const maintenanceCost = 660;
  const totalCosts = managementFee + maintenanceCost;

  if (managementFee) {
    animateValue('udlejning', managementFee);
    animateValue('totalCost', totalCosts);
    drawPie([16860, managementFee, maintenanceCost]);
  }

  const netRevenue = revenue - totalCosts;
  if (netRevenue) animateValue('netto', netRevenue);

  const discountFactor = +document.getElementById('diskonto').value || 0;
  if (discountFactor && netRevenue) {
    const projectedExitPrice = netRevenue / (discountFactor / 100);
    animateValue('exitPrice', projectedExitPrice);

    const deltaValue = projectedExitPrice - 143000;
    animateValue('delta', deltaValue);

    const cashflow3Years = netRevenue * 3;
    animateValue('cash3', cashflow3Years);

    const totalReturn = cashflow3Years + deltaValue;
    animateValue('totalReturn', totalReturn);

    setTimeout(initCharts, 400);
  }
}

function animateValue(id, val) {
  const el = document.getElementById(id);
  let current = 0;
  const increment = val / 60;
  el.classList.add('count-animation');

  const interval = setInterval(() => {
    current += increment;
    if (current >= val) {
      clearInterval(interval);
      current = val;
      setTimeout(() => el.classList.remove('count-animation'), 100);
    }
    el.textContent = `${el.textContent.split(':')[0]}: ${Math.round(current).toLocaleString('da-DK')} EUR`;
  }, 16);
}

function drawPie(data) {
  if (pieChart) pieChart.destroy();
  pieChart = new Chart(pieCtx, {
    type: 'doughnut',
    data: {
      labels: ['Profit', 'Udlejning', 'Vedl.'],
      datasets: [{
        data,
        backgroundColor: ['#00ff66', '#ff7f00', '#1c6ea4']
      }]
    },
    options: {
      plugins: {
        legend: { labels: { color: '#fff' } }
      },
      animation: { animateScale: true, duration: 800 },
      hoverOffset: 15
    }
  });
}

function initCharts() {
  const netVal = +document.getElementById('netto').textContent.replace(/\D/g, '') || 0;

  if (histChart) histChart.destroy();
  histChart = new Chart(histCtx, {
    type: 'bar',
    data: {
      labels: ['År 1', 'År 2', 'År 3'],
      datasets: [{
        data: [netVal, netVal * 2, netVal * 3],
        backgroundColor: '#1c6ea4'
      }]
    },
    options: {
      plugins: { legend: { display: false } },
      scales: {
        x: { ticks: { color: '#fff' } },
        y: { ticks: { color: '#fff' } }
      },
      animation: { duration: 1200, easing: 'easeInOutCubic' }
    }
  });

  if (lineChart) lineChart.destroy();
  lineChart = new Chart(lineCtx, {
    type: 'line',
    data: {
      labels: ['År 1', 'År 2', 'År 3'],
      datasets: [{
        data: [netVal, netVal * 2, netVal * 3],
        borderColor: '#00ff66',
        backgroundColor: 'rgba(0,255,102,0.2)',
        fill: true,
        tension: 0.3,
        pointBackgroundColor: '#00ff66',
        pointRadius: 7,
        pointHoverRadius: 10
      }]
    },
    options: {
      responsive: true,
      scales: {
        x: {
          ticks: { color: '#fff' },
          grid: { color: 'rgba(255,255,255,0.1)' },
          title: {
            display: true,
            text: 'År',
            color: '#fff',
            font: { size: 14, weight: 'bold' }
          }
        },
        y: {
          ticks: {
            color: '#fff',
            callback: value => value.toLocaleString('da-DK') + ' EUR'
          },
          grid: { color: 'rgba(255,255,255,0.1)' },
          title: {
            display: true,
            text: 'Afkast',
            color: '#fff',
            font: { size: 14, weight: 'bold' }
          }
        }
      },
      plugins: {
        legend: { display: false },
        tooltip: { enabled: true, mode: 'nearest', intersect: false }
      },
      animation: { duration: 1500, easing: 'easeInOutExpo' }
    }
  });
}
