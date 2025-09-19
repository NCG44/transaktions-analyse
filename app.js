// Set date to today
document.getElementById('date').valueAsDate = new Date();

// Section management and breadcrumbs
const sections = document.querySelectorAll('.section');
let current = 1;
function showSection(i) {
  sections[current-1].classList.remove('active');
  document.getElementById(`crumb-${current}`).classList.remove('active');
  current = i;
  sections[current-1].classList.add('active');
  document.getElementById(`crumb-${current}`).classList.add('active');
  sections[current-1].scrollIntoView({behavior:'smooth',block:'center'});
  if (current === 7) setTimeout(initLineChart,500);
}
for (let i=1; i<=6; i++) {
  document.getElementById(`btn-${i}`).addEventListener('click', () => showSection(i+1));
}

// Enable first next button
const nameInput = document.getElementById('name');
nameInput.addEventListener('input', () => {
  document.getElementById('btn-1').style.display = nameInput.value.trim() ? 'block' : 'none';
});

// Calculation listeners
['prisPrNat','lejedeNaetter','diskonto'].forEach(id =>
  document.getElementById(id).addEventListener('input', updateCalc)
);
let pieChart;

function updateCalc() {
  const p = +document.getElementById('prisPrNat').value || 0;
  const n = +document.getElementById('lejedeNaetter').value || 0;
  const rev = p * n;
  if (rev) {
    animate('brutto', rev);
    document.getElementById('btn-2').style.display = 'block';
  }
  const cost = rev * 0.2, maint = 660, tot = cost + maint;
  if (cost) {
    animate('udlejning', cost);
    animate('totalCost', tot);
    drawPie([rev-cost, cost, maint]);
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

function animate(id, val, suffix=' EUR') {
  const el = document.getElementById(id);
  let cur=0, inc=val/60;
  el.classList.add('count-animation');
  const t = setInterval(() => {
    cur += inc;
    if (cur >= val) { clearInterval(t); cur = val; setTimeout(() => el.classList.remove('count-animation'), 100); }
    const txt = `${Math.round(cur).toLocaleString('da-DK')}${suffix}`;
    el.textContent = el.textContent.split(':')[0] + ': ' + txt;
  }, 16);
}

function animateWithDKK(id, val) {
  animate(id, val);
  setTimeout(() => {
    document.getElementById(id+'DKK').textContent = `(${Math.round(val*7.44).toLocaleString('da-DK')} DKK)`;
  }, 1000);
}

function drawPie(data) {
  const ctx = document.getElementById('pieChart').getContext('2d');
  if (pieChart) pieChart.destroy();
  pieChart = new Chart(ctx, {
    type: 'doughnut',
    data: { labels:['Profit','Udlejning','Vedl.'], datasets:[{ data, backgroundColor:['#32CD32','#09B5DA','#0C3C60'] }] },
    options: { plugins:{ legend:{ labels:{ color:'#fff' }}}, animation:{ animateScale:true, duration:1500 }, hoverOffset:20 }
  });
}

function initLineChart() {
  const ctx = document.getElementById('lineChart').getContext('2d');
  const net = +document.getElementById('netto').textContent.replace(/\D/g,'')||0;
  new Chart(ctx, {
    type:'line', data:{ labels:['År 1','År 2','År 3'], datasets:[{ data:[net,net*2,net*3], borderColor:'#32CD32', tension:0.3, fill:true, backgroundColor:'rgba(50,205,50,0.1)', pointHoverRadius:10, pointHoverBackgroundColor:'#32CD32' }] },
    options:{ responsive:true, scales:{ x:{ ticks:{ color:'#fff' }, grid:{ color:'rgba(255,255,255,0.1)' } }, y:{ beginAtZero:true, ticks:{ color:'#fff', callback:v=>v.toLocaleString('da-DK')+' EUR' }, grid:{ color:'rgba(255,255,255,0.1)' } } }, plugins:{ legend:{ labels:{ color:'#fff' }}}, animation:{ duration:2000 } }
  });
}

// Initial call
updateCalc();
