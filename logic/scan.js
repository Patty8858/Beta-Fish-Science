import { DEFAULT_THRESHOLD } from './config.js';
import { getWX } from './weather/providers.js';
import { getWaters, getPrevalenceMap, getPrevPoints } from './prevalence.js';
import { mmToPrecip, hourToTOD, skyFromClouds, baroTrend, ensureSW } from './utils.js';
import { lunarBonus } from './lunar.js';
import { CALC } from './calculators.js';

const els={
  threshold:document.getElementById('threshold'),
  speciesFilter:document.getElementById('speciesFilter'),
  lakeMulti:document.getElementById('lakeMulti'),
  status:document.getElementById('status'),
  lunarLine:document.getElementById('lunarLine'),
  results:document.getElementById('forecastResults'),
  dbg:document.getElementById('debugContent'),
  enableNotify:document.getElementById('enableNotify'),
  scan:document.getElementById('scan')
};
function setStatus(msg){ if(els.status) els.status.textContent=msg; }

export function populateLakeMulti(waters){
  els.lakeMulti.innerHTML=waters.map(w=>`<option value="${w[0]}">${w[0]}</option>`).join('');
}
export function wireNotifications(){
  els.enableNotify.addEventListener('click', async ()=>{
    if(!('Notification'in window)) return alert('Notifications not supported on this device.');
    const p=await Notification.requestPermission();
    alert(p==='granted'?'Notifications enabled (while app is open).':'Permission not granted.');
  });
}
function notify(title,body){
  if('Notification'in window && Notification.permission==='granted'){
    new Notification(title,{body,icon:'public/bite_app_icon_512.png'});
  }
}
let wiredScan=false;
export function wireScan(){
  if(wiredScan) return; wiredScan=true;
  els.scan.addEventListener('click', scan24h);
}

export async function scan24h(){
  await ensureSW();
  const btn=els.scan; if(btn.dataset.busy==='1') return; btn.dataset.busy='1';
  try{
    const threshold=parseInt(els.threshold.value||DEFAULT_THRESHOLD,10);
    const speciesSel=els.speciesFilter.value;
    const chosen=Array.from(els.lakeMulti.selectedOptions).map(o=>o.value);
    const waters=getWaters().filter(w=>chosen.length===0||chosen.includes(w[0]));
    const PREV=getPrevalenceMap();

    els.results.textContent='Fetching…'; els.status.textContent=''; els.lunarLine.textContent=''; els.dbg.innerHTML='';

    const allEvents=[];
    for(const [name,lat,lon] of waters){
      try{
        const wx=await getWX(lat,lon);
        els.lunarLine.textContent+=`${name}: ${wx.phaseLabel}; `;
        const sunriseH=parseInt(wx.sunrise.split('T')[1].slice(0,2),10);
        const sunsetH =parseInt(wx.sunset .split('T')[1].slice(0,2),10);
        const len=Math.min(wx.times.length,24);
        for(let i=0;i<len;i++){
          const ts=new Date(wx.times[i]); const h=ts.getHours();
          const tod=hourToTOD(h,sunriseH,sunsetH);
          const temp=wx.temp[i]; const wind=wx.wind[i]||0;
          const sky=skyFromClouds(wx.cc[i]??50,tod);
          const precip=mmToPrecip(wx.pr[i]??0);
          const baro=baroTrend(wx.sp,i);
          const lunar=lunarBonus(tod,wx.phaseLabel,ts,wx.moonrise,wx.moonset);
          const prevMap=PREV[name]||{};
          for(const sp of Object.keys(CALC)){
            if(speciesSel!=='ALL'&&sp!==speciesSel) continue;
            const base=CALC[sp](temp,sky,wind,baro,precip,tod);
            const prevCode=prevMap[sp]??'F';
            const final=Math.max(0,Math.min(100, base+getPrevPoints(prevCode)+lunar));
            allEvents.push({score:final,water:name,species:sp,hour:h,breakdown:{
              Base:base,TOD:tod,Sky:sky,Wind:wind,Temp:temp,Baro:baro,Precip:precip,
              LunarPhase:wx.phaseLabel,Moonrise:wx.moonrise,Moonset:wx.moonset,
              LunarBonus:lunar,PrevalenceCode:prevCode,PrevalencePts:getPrevPoints(prevCode)
            }});
          }
        }
      }catch(err){
        setStatus(`⚠️ ${name}: ${err.message||'Fetch failed'}`);
        allEvents.push({score:0,water:name,species:'(fetch error)',hour:'–',breakdown:{Error:err.message||String(err)}});
      }
    }

    allEvents.sort((a,b)=>b.score-a.score);
    const filtered=allEvents.filter(e=>e.score>threshold);
    const speciesSelTxt=speciesSel!=='ALL'?` (${speciesSel})`:'';
    const lakesTxt=(chosen.length?` [${chosen.length} lake${chosen.length>1?'s':''}]`:' [All lakes]');
    els.status.textContent = filtered.length
      ? `Showing ${filtered.length} events > ${threshold}${speciesSelTxt}${lakesTxt}`
      : `No events > ${threshold}${speciesSelTxt}${lakesTxt}`;

    els.results.innerHTML=filtered.slice(0,20).map(h=>{
      const when=(h.hour%12)||12; const ampm=h.hour<12?'am':'pm';
      return `<div class="alert">${h.species} — <b>${h.score}</b> · ${h.water} at ${when}${ampm}</div>`;
    }).join('') || "<div>No qualifying times in the next 24h.</div>";

    els.dbg.innerHTML=filtered.slice(0,10).map(ev=>{
      const cls=ev.score>=65?'score-good':(ev.score>=40?'score-fair':'score-poor');
      const when=(ev.hour==='–'?'–':`${(ev.hour%12)||12}${ev.hour<12?'am':'pm'}`);
      const b=ev.breakdown;
      return `<div class="dbg-line">
        <span class="score-badge ${cls}">${ev.score}</span>
        <b>${ev.species}</b> · ${ev.water} · ${when}
        <div class="tiny" style="margin-top:6px">
          <span class="chip">Base ${b.Base}</span>
          <span class="chip">TOD ${b.TOD}</span>
          <span class="chip">Baro ${b.Baro}</span>
          <span class="chip">Sky ${b.Sky}</span>
          <span class="chip">Precip ${b.Precip}</span>
          <span class="chip">Temp ${b.Temp}°F</span>
          <span class="chip">Lunar ${b.LunarPhase} (+${b.LunarBonus})</span>
          <span class="chip">Prev ${b.PrevalenceCode} (${b.PrevalencePts>=0?'+':''}${b.PrevalencePts})</span>
        </div>
      </div>`;
    }).join('');

    filtered.slice(0,3).forEach(h=>{
      const when=(h.hour%12)||12, ampm=h.hour<12?'AM':'PM';
      notify(`🎣 ${h.species} — ${h.score}`, `${h.water} around ${when} ${ampm}`);
    });
  } finally { btn.dataset.busy='0'; }
}
