// Set today
document.getElementById('date').valueAsDate = new Date();

// Panels & crumbs
const panels = document.querySelectorAll('.panel');
const crumbs = document.querySelectorAll('.crumb');
function activate(i) {
  panels[i].classList.add('active');
  crumbs[i].classList.add('active');
  panels[i].scrollIntoView({behavior:'smooth'});
}
activate(0);
document.querySelectorAll('.btn').forEach((b,i) =>
  b.addEventListener('click', () => activate(i+1))
);

// Enable first button
document.getElementById('name').addEventListener('input',function(){
  this.value.trim()
    ? btn1.style.display='block'
    : btn1.style.display='none';
});

// Chart refs
let pieC, histC;

// Listen inputs
['prisPrNat','lejedeNaetter','diskonto'].forEach(id =>
  document.getElementById(id).addEventListener('input', update)
);

function update(){
  const p=+prisPrNat.value||0, n=+lejedeNaetter.value||0;
  const rev=p*n;
  if(rev){animate('brutto',rev);}
  const cost=rev*0.2, m=660, tot=cost+m;
  if(cost){
    animate('udlejning',cost);
    animate('totalCost',tot);
    drawPie([16860,cost,m]);
  }
  const net=rev-tot;
  if(net){animate('netto',net);}
  const d=+diskonto.value||0;
  if(d&&net){
    const ex=net/(d/100), delta=ex-143000, c3=net*3, tr=c3+delta;
    animate('exitPrice',ex);
    animate('delta',delta);
    animate('cash3',c3);
    animate('totalReturn',tr);
    setTimeout(renderCharts,300);
  }
}

function animate(id,val){
  const el=document.getElementById(id);
  let cur=0,step=val/60; el.classList.add('count-animation');
  const t=setInterval(()=>{
    cur=Math.min(cur+step,val);
    el.textContent=Math.round(cur).toLocaleString('da-DK')+' EUR';
    if(cur>=val){clearInterval(t);el.classList.remove('count-animation');}
  },16);
}

function drawPie(data){
  const ctx=document.getElementById('pieChart').getContext('2d');
  if(pieC) pieC.destroy();
  pieC=new Chart(ctx,{type:'doughnut',data:{labels:['Profit','Udlejning','Vedl.'],datasets:[{data,backgroundColor:['#00ff66','#ff7f00','#1c6ea4']}]},options:{plugins:{legend:{labels:{color:'#fff'}}}}});
}

function renderCharts(){
  const net=+netto.textContent.replace(/\D/g,'')||0;
  // Histogram
  const hc=document.getElementById('histogram').getContext('2d');
  if(histC) histC.destroy();
  histC=new Chart(hc,{type:'bar',data:{labels:['År 1','År 2','År 3'],datasets:[{data:[net,net*2,net*3],backgroundColor:'#1c6ea4'}]}});
  // Line
  const lc=document.getElementById('lineChart').getContext('2d');
  new Chart(lc,{type:'line',data:{labels:['År 1','År 2','År 3'],datasets:[{data:[net,net*2,net*3],borderColor:'#00ff66',fill:true,backgroundColor:'rgba(0,255,102,0.2)',tension:0.3,pointBackgroundColor:'#00ff66'}]}});
}

// Init
update();
