// Auto-set date
document.getElementById('date').valueAsDate = new Date();

// Collect sections and breadcrumbs
const sections = Array.from(document.querySelectorAll('.section'));
const crumbs = Array.from(document.querySelectorAll('.crumb'));
sections.forEach(sec => sec.classList.add('active')); 
// Initially show only section 1
sections.forEach((sec, i) => { if (i !== 0) sec.classList.remove('active'); });
crumbs.forEach((c, i) => { if (i !== 0) c.classList.remove('active'); });

function showSection(index) {
  // Activate breadcrumb and section without hiding previous
  sections[index - 1].classList.add('active');
  crumbs[index - 1].classList.add('active');
  sections[index - 1].scrollIntoView({behavior:'smooth', block:'center'});
  if (index === 7) setTimeout(initCharts, 500);
}

for (let i = 1; i <= 6; i++) {
  document.getElementById(`btn-${i}`).addEventListener('click', () => showSection(i + 1));
}

// Enable first next button when name is entered
document.getElementById('name').addEventListener('input', function() {
  document.getElementById('btn-1').style.display =
    this.value.trim() ? 'block' : 'none';
});

// Calculation triggers
['prisPrNat', 'lejedeNaetter', 'diskonto'].forEach(id => {
  document.getElementById(id).addEventListener('input', updateCalc);
});

let pieChart, histChart;

// Perform calculations and animate
function updateCalc() {
  const p = +document.getElementById('prisPrNat').value || 0;
  const n = +document.getElementById('lejedeNaetter').value || 0;
  const rev = p * n;
  if (rev) {
    animateValue('brutto', rev);
    document.getElementById('btn-2').style.display = 'block';
  }
  const cost = rev * 0.2, maint = 660, tot = cost + maint;
  if (cost) {
    animateValue('udlejning', cost);
    animateValue('totalCost', tot);
    drawPie([rev - cost, cost, maint]);
    document.getElementById('btn-3').style.display = 'block';
  }
  const net = rev - tot;
  if (net) {
    animateValue('netto', net);
    document.getElementById('btn-4').style.display = 'block';
  }
  const d = +document.getElementById('diskonto').value || 0;
  if (d && net) {
    const exitPrice = net / (d / 100);
    animateValue('exitPrice', exitPrice);
    const delta = exitPrice - 143000;
    animateWithDKK('delta', delta);
    const cash3 = net * 3;
    animateWithDKK('cash3', cash3);
    const totalRet = cash3 + delta;
    animateWithDKK('totalReturn', totalRet);
    document.getElementById('btn-5').style.display = 'block';
    document.getElementById('btn-6').style.display = 'block';
  }
}

function animateValue(id, val) {
  const el = document.getElementById(id);
  let cur = 0, step = val / 60;
  el.classList.add('count-animation');
  const timer = setInterval(() => {
    cur += step;
    if (cur >= val) {
      clearInterval(timer);
      cur = val;
      setTimeout(() => el.classList.remove('count-animation'), 100);
    }
    el.textContent = `${el.textContent.split(':')[0]}: ${Math.round(cur).toLocaleString('da-DK')} EUR`;
  }, 16);
}

function animateWithDKK(id, val) {
  animateValue(id, val);
  setTimeout(() => {
    document.getElementById(id + 'DKK').textContent =
      `(${Math.round(val * 7.44).toLocaleString('da-DK')} DKK)`;
  }, 1000);
}

function drawPie(data) {
  const ctx = document.getElementById('pieChart').getContext('2d');
  if (pieChart) pieChart.destroy();
  pieChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Profit', 'Udlejning', 'Vedl.'],
      datasets: [{ data, backgroundColor: ['#00FF66', '#1A3E65', '#0C3C60'] }]
    },
    options: {
      plugins: { legend: { labels: { color: '#fff' } } },
      animation: { animateScale: true, duration: 800 },
      hoverOffset: 15
    }
  });
}

function initCharts() {
  const netVal = +document.getElementById('netto').textContent.replace(/\D/g, '') || 0;
  // Histogram
  const hctx = document.getElementById('histogram').getContext('2d');
  if (histChart) histChart.destroy();
  histChart = new Chart(hctx, {
    type: 'bar',
    data: {
      labels: ['År 1','År 2','År 3'],
      datasets: [{ data: [netVal, netVal * 2, netVal * 3], backgroundColor: '#1A3E65' }]
    },
    options: {
      plugins: { legend: { display: false } },
      scales: { x: { ticks: { color: '#fff' } }, y: { ticks: { color: '#fff' } } },
      animation: { duration: 1200, easing: 'easeInOutCubic' }
    }
  });
  // Line chart with milestone animation
  const lctx = document.getElementById('lineChart').getContext('2d');
  new Chart(lctx, {
    type: 'line',
    data: {
      labels: ['År 1','År 2','År 3'],
      datasets: [{
        data: [netVal, netVal * 2, netVal * 3],
        borderColor: '#00FF66',
        backgroundColor: 'rgba(0,255,102,0.2)',
        fill: true,
        tension: 0.3,
        pointBackgroundColor: '#00FF66',
        pointHoverRadius: 8,
        pointRadius: 6
      }]
    },
    options: {
      responsive: true,
      scales: {
        x: { ticks: { color: '#fff' }, grid: { color: 'rgba(255,255,255,0.1)' } },
        y: {
          ticks: { color: '#fff', callback: v => v.toLocaleString('da-DK') + ' EUR' },
          grid: { color: 'rgba(255,255,255,0.1)' }
        }
      },
      plugins: { legend: { display: false } },
      animation: { duration: 1500, easing: 'easeInOutExpo' }
    }
  });
}

// Initialize
updateCalc();
