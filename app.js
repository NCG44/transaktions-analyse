// Auto-set date
document.getElementById('date').valueAsDate = new Date();

// Collect sections and breadcrumbs
const sections = Array.from(document.querySelectorAll('.section'));
const crumbs = Array.from(document.querySelectorAll('.crumb'));

// Initialize: show only section 1 and breadcrumb 1
sections.forEach((sec, i) => sec.classList.toggle('active', i === 0));
crumbs.forEach((c, i) => c.classList.toggle('active', i === 0));

function showSection(index) {
  // Activate breadcrumb and section without hiding previous ones
  sections[index - 1].classList.add('active');
  crumbs[index - 1].classList.add('active');
  sections[index - 1].scrollIntoView({ behavior: 'smooth', block: 'center' });
  if (index === 7) setTimeout(initCharts, 500);
}

// Attach next-button handlers
for (let i = 1; i <= 6; i++) {
  document.getElementById(`btn-${i}`).onclick = () => showSection(i + 1);
}

// Enable first next button when Name is entered
document.getElementById('name').oninput = function() {
  document.getElementById('btn-1').style.display =
    this.value.trim() ? 'block' : 'none';
};

// Calculation inputs
['prisPrNat','lejedeNaetter','diskonto'].forEach(id => {
  document.getElementById(id).oninput = updateCalc;
});

let pieChart, histChart;

function updateCalc() {
  const pris = +document.getElementById('prisPrNat').value || 0;
  const nat = +document.getElementById('lejedeNaetter').value || 0;
  const rev = pris * nat;
  if (rev) {
    animateValue('brutto', rev);
    document.getElementById('btn-2').style.display = 'block';
  }
  const cost = rev * 0.2;
  const maint = 660;
  const tot = cost + maint;
  if (cost) {
    animateValue('udlejning', cost);
    animateValue('totalCost', tot);
    // Set profit slice to 16860
    drawPieChart([16860, cost, maint]);
    document.getElementById('btn-3').style.display = 'block';
  }
  const net = rev - tot;
  if (net) {
    animateValue('netto', net);
    document.getElementById('btn-4').style.display = 'block';
  }
  const disc = +document.getElementById('diskonto').value || 0;
  if (disc && net) {
    const exitPrice = net / (disc / 100);
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

function animateValue(id, value) {
  const el = document.getElementById(id);
  let cur = 0;
  const step = value / 60;
  el.classList.add('count-animation');
  const timer = setInterval(() => {
    cur = Math.min(cur + step, value);
    if (cur === value) {
      clearInterval(timer);
      setTimeout(() => el.classList.remove('count-animation'), 100);
    }
    el.textContent = `${el.textContent.split(':')[0]}: ${Math.round(cur).toLocaleString('da-DK')} EUR`;
  }, 16);
}

function animateWithDKK(id, value) {
  animateValue(id, value);
  setTimeout(() => {
    document.getElementById(id + 'DKK').textContent =
      `(${Math.round(value * 7.44).toLocaleString('da-DK')} DKK)`;
  }, 1000);
}

function drawPieChart(data) {
  const ctx = document.getElementById('pieChart').getContext('2d');
  if (pieChart) pieChart.destroy();
  pieChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Profit','Udlejning','Vedl.'],
      datasets: [{
        data,
        backgroundColor: ['#00FF66','#FFA500','#1A3E65']
      }]
    },
    options: {
      plugins: { legend: { labels: { color: '#fff' } } },
      animation: { animateScale: true, duration: 800 },
      hoverOffset: 15
    }
  });
}

function initCharts() {
  const netVal = +document.getElementById('netto').textContent.replace(/\D/g,'') || 0;
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
  // Line chart
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
        pointHoverRadius: 8
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
