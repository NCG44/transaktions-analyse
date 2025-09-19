// Auto-date
document.getElementById('date').valueAsDate = new Date();

// Sections & steps
const panels = document.querySelectorAll('.panel');
const steps = document.querySelectorAll('.step');
function show(i) {
  panels[i].classList.add('active');
  steps[i].classList.add('active');
  panels[i].scrollIntoView({behavior:'smooth'});
}
show(0);
document.querySelectorAll('.btn').forEach((btn, idx) => {
  btn.addEventListener('click', () => show(idx+1));
});

// Enable first button
document.getElementById('name').addEventListener('input', function(){
  document.getElementById('btn-1').style.display =
    this.value.trim() ? 'block' : 'none';
});

// Calculations
['prisPrNat','lejedeNaetter','diskonto'].forEach(id =>
  document.getElementById(id).addEventListener('input', update)
);

let pieC, histC;

function update() {
  const p=+prisPrNat.value||0, n=+lejedeNaetter.value||0;
  const rev=p*n;
  if(rev){animate('brutto',rev); btn2.style.display='block';}
  const cost=rev*0.2, m=660, tot=cost+m;
  if(cost){
    animate('udlejning',cost);
    animate('totalCost',tot);
    drawPie([16860,cost,m]);
    btn3.style.display='block';
  }
  const net=rev-tot;
  if(net){animate('netto',net); btn4.style.display='block';}
  const d=+diskonto.value||0;
  if(d&&net){
    const ep=net/(d/100);
    animate('exitPrice',ep);
    const delta=ep-143000, c3=net*3, tr=c3+delta;
    animate('delta',delta);
    animate('cash3',c3);
    animate('totalReturn',tr);
    btn5.style.display='block'; btn6.style.display='block';
    setTimeout(charts,300);
  }
}

function animate(id,val){
  const el=document.getElementById(id);
  let c=0,step=val/60;el.classList.add('count-animation');
  const t=setInterval(()=>{
    c=Math.min(c+step,val);
    el.textContent=`${el.textContent.split(':')[0]}: ${Math.round(c).toLocaleString('da-DK')} EUR`;
    if(c>=val){clearInterval(t);el.classList.remove('count-animation');}
  },16);
}

function drawPie(arr){
  const ctx=pieC=document.getElementById('pieChart').getContext('2d');
  if(pieC) pieC.destroy();
  pieC=new Chart(ctx,{
    type:'doughnut',
    data:{labels:['Profit','Udlejning','Vedl.'], datasets:[{data:arr,backgroundColor:['#00FF66','#FFA500','#1A3E65']}]},
    options:{plugins:{legend:{labels:{color:'#fff'}}},animation:{duration:600}}
  });
}

function charts(){
  const net=+netto.textContent.replace(/\D/g,'')||0;
  // histogram
  const hc=document.getElementById('histogram').getContext('2d');
  if(histC) histC.destroy();
  histC=new Chart(hc,{type:'bar',data:{labels:['År1','År2','År3'],datasets:[{data:[net,net*2,net*3],backgroundColor:'#1A3E65'}]},options:{animation:{duration:800}}});
  // line
  const lc=document.getElementById('lineChart').getContext('2d');
  new Chart(lc,{type:'line',data:{labels:['År1','År2','År3'],datasets:[{data:[net,net*2,net*3],borderColor:'#00FF66',fill:true,backgroundColor:'rgba(0,255,102,0.2)',tension:0.3,pointBackgroundColor:'#00FF66'}]},options:{animation:{duration:800}}});
}

// initialize
update();
