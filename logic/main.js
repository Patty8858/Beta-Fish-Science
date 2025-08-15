import { ensureSW } from './utils.js';
import { loadPrevalence, getWaters } from './prevalence.js';
import { loadSpots, initMapIfNeeded, invalidateMap } from './map.js';
import { populateLakeMulti, wireNotifications, wireScan /*, scan24h*/ } from './scan.js';
import { populateManualWaters, wireManual } from './manual.js';
import { FALLBACK_WATERS, APP_VERSION } from './config.js';
import { wireDiagnostics } from './diag.js';

function showTab(id){
  ['forecast','manual','spots'].forEach(x=>document.getElementById(x).classList.add('hidden'));
  document.getElementById(id).classList.remove('hidden');
  ['tab-forecast','tab-manual','tab-spots'].forEach(x=>document.getElementById(x).classList.remove('active'));
  document.getElementById('tab-'+id).classList.add('active');
  if(id==='spots') setTimeout(()=>{ initMapIfNeeded(); invalidateMap(); },0);
}
function wireTabs(){
  document.querySelectorAll('nav [data-tab]').forEach(btn=>btn.addEventListener('click',()=>showTab(btn.dataset.tab)));
}

(async function init(){
  const ver = document.getElementById('ver'); if (ver) ver.textContent=`Up and running — v${APP_VERSION}`;
  wireTabs(); wireDiagnostics(); wireNotifications(); wireScan(); wireManual();
  await ensureSW();

  const fallback=FALLBACK_WATERS.map(n=>[n,0,0]);
  populateLakeMulti(fallback);
  document.getElementById('waterbody').innerHTML=fallback.map(w=>`<option>${w[0]}</option>`).join('');

  try{
    await loadPrevalence();
    await loadSpots();
    const waters=getWaters();
    populateLakeMulti(waters);
    populateManualWaters();
  }catch(e){
    const st=document.getElementById('status');
    if(st) st.textContent='⚠️ Data failed to load: check /data JSON files.';
    console.warn('Init data issue',e);
  }

  // scan24h(); // optional autorun
})();
