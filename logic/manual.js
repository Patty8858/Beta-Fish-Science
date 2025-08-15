import { CALC } from './calculators.js';
import { getWaters, getPrevalenceMap } from './prevalence.js';

const els={
  lakeSelect:document.getElementById('waterbody'),
  species:document.getElementById('species'),
  temp:document.getElementById('m_temp'),
  wind:document.getElementById('m_wind'),
  sky:document.getElementById('m_sky'),
  baro:document.getElementById('m_baro'),
  precip:document.getElementById('m_precip'),
  phase:document.getElementById('m_phase'),
  near:document.getElementById('m_near'),
  tod:document.getElementById('m_tod'),
  go:document.getElementById('m_go'),
  out:document.getElementById('manualResult')
};
export function populateManualWaters(){
  const waters=getWaters();
  els.lakeSelect.innerHTML=waters.map(w=>`<option>${w[0]}</option>`).join('');
}
export function wireManual(){
  els.go.addEventListener('click', ()=>{
    const sp=els.species.value, lake=els.lakeSelect.value;
    const t=parseFloat(els.temp.value||'0');
    const w=parseFloat(els.wind.value||'0');
    const sky=els.sky.value, baro=els.baro.value, precip=els.precip.value, tod=els.tod.value;
    const phaseLabel=els.phase.value; const near=els.near.value==='yes'?6:0;
    const basePhase=(label=>label==='new'?{day:+4,night:+2}:label==='full'?{day:+2,night:+4}:label==='quarter'?{day:+2,night:+2}:{day:+1,night:+1})(phaseLabel);
    let lunar=basePhase.day+basePhase.night+near; if(tod==='Night') lunar+=2;

    const base=CALC[sp](t,sky,w,baro,precip,tod);
    const PREV=getPrevalenceMap(); const prevCode=PREV[lake]?.[sp]??'F';
    const prevPts={E:10,G:6,F:2,L:-4,A:-12}[prevCode]??0;
    const final=Math.max(0,Math.min(100, base+prevPts+lunar));

    els.out.innerHTML=`<b>Score: ${final}</b><br>Base: ${base} &nbsp;|&nbsp; Lake: ${prevCode} (${prevPts>=0?'+':''}${prevPts}) &nbsp;|&nbsp; Lunar: +${lunar}`;
  });
}
