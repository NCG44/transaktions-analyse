// Auto-set date
const dateInput = document.getElementById('date');
dateInput.valueAsDate = new Date();

// Section control and breadcrumbs
const sections = [...document.querySelectorAll('.section')];
let current = 1;
function showSection(i) {
  sections[current-1].classList.remove('active');
  document.getElementById(`crumb-${current}`).classList.remove('active');
  current = i;
  sections[current-1].classList.add('active');
  document.getElementById(`crumb-${current}`).classList.add('active');
  sections[current-1].scrollIntoView({behavior:'smooth',block:'center'});
  if (current === 7) setTimeout(initCharts, 500);
}
for (let i = 1; i <= 6; i++) {
  document.getElementById(`btn-${i}`).onclick = () => showSection(i+1);
}

// Enable first next button
document.getElementById('name').oninput = function() {
  document.getElementById('btn-1').style.display = this.value.trim() ? 'block' : 'none';
};

// Calculation triggers
['prisPrNat','lejedeNaetter','diskonto'].forEach(id => {
  document.getElementById(id).oninput = updateCalc;
});

let pieChart, histChart;

function updateCalc() {
  const p = +document.getElementById('prisPrNat').value || 0;
  const n = +document.getElementById('lejedeNaetter').value || 0;
  const rev = p * n;
  if (rev) {
    animate('brutto', rev);
    document.getElementById('btn-2').style.display = 'block';
  }
  const cost = rev * 0.2;
  const maint = 660;
  const tot = cost + maint;
  if (cost) {
    animate('udlejning', cost);
    animate('totalCost', tot);
    drawPieChart([rev-cost, cost, maint]);
    document.getElementById('btn-3').style.display = 'block';
  }
  const net = rev - tot;
  if (net) {
    animate('netto', net);
    document.getElementById('btn-4').style.display = 'block';
  }
  const d = +document.getElementById('diskonto').value || 0;
  if (d && net) {
    const exitPrice = net / (d/100);
    animate('exitPrice', exitPrice);
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

function animate(id, value) {
  const el = document.getElementById(id);
  let current = 0, step = value / 60;
  el.classList.add('count-animation');
  const timer = setInterval(() => {
    current += step;
    if (current >= value) { clearInterval(timer); current = value; setTimeout(() => el.classList.remove('count-animation'), 100); }
    el.textContent = `${el.textContent.split(':')[0]}: ${Math.round(current).toLocaleString('da-DK')} EUR`;
  }, 16);
}

function animateWithDKK(id, value) {
  animate(id, value);
  setTimeout(() => {
    document.getElementById(id + 'DKK').textContent = `(${Math.round(value*7.44).toLocaleString('da-DK')} DKK)`;
  }, 1000);
}

function drawPieChart(data) {
  const ctx = document.getElementById('pieChart').getContext('2d');
  if (pieChart) pieChart.destroy();
  pieChart = new Chart(ctx, {
    type: 'doughnut',
    data: { labels: ['Profit', 'Udlejning', 'Vedl.'], datasets: [{ data, backgroundColor: ['#00FF66', '#1A3E65', '#0C3C60'] }] },
    options: { plugins: { legend: { labels: { color: '#fff' } } }, animation: { animateScale: true, duration: 800 }, hoverOffset: 15 }
  });
}

function initCharts() {
  const revNet = +document.getElementById('netto').textContent.replace(/\D/g,'') || 0;
  // histogram
  const hctx = document.getElementById('histogram').getContext('2d');
  if (histChart) histChart.destroy();
  histChart = new Chart(hctx, {
    type: 'bar',
    data: { labels: ['År 1','År 2','År 3'], datasets: [{ data: [revNet, revNet*2, revNet*3], backgroundColor: '#1A3E65' }] },
    options: { plugins: { legend: { display: false } }, scales: { x: { ticks: { color:'#fff' } }, y: { ticks: { color:'#fff'} } }, animation: { duration: 1200, easing: 'easeInOutCubic' } }
  });
  // line chart
  const lctx = document.getElementById('lineChart').getContext('2d');
  new Chart(lctx, {
    type: 'line',
    data: { labels: ['År 1','År 2','År 3'], datasets: [{ data: [revNet, revNet*2, revNet*3], borderColor: '#00FF66', backgroundColor: 'rgba(0,255,102,0.2)', fill: true, tension: 0.3, pointBackgroundColor: '#00FF66', pointHoverRadius: 8 }] },
    options: { responsive: true, scales: { x: { ticks: { color: '#fff' }, grid: { color: 'rgba(255,255,255,0.1)' } }, y:{ ticks:{ color:'#fff', callback: v => v.toLocaleString('da-DK')+' EUR'}, grid:{ color:'rgba(255,255,255,0.1)'} } }, plugins: { legend: { display: false } }, animation: { duration: 1500, easing: 'easeInOutExpo' } }
  });
}

// initialize
document.addEventListener('DOMContentLoaded', () => {
  updateCalc();
});
