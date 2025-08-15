export function wireDiagnostics(){
  const btn=document.getElementById('runDiag'); const out=document.getElementById('diagOut');
  if(!btn||!out) return;
  btn.addEventListener('click', async ()=>{
    const log=(...a)=>out.textContent+=a.join(' ')+'\\n'; out.textContent='';
    const ids=['lakeMulti','threshold','speciesFilter','scan','status','forecastResults',
      'species','waterbody','m_temp','m_wind','m_sky','m_baro','m_precip','m_phase','m_near','m_tod','m_go','manualResult',
      'map','spotsList'];
    const missing=ids.filter(id=>!document.getElementById(id));
    log('[DOM] missing:',missing.length?missing.join(', '):'OK');
    try{const r=await fetch('data/lake_species.json',{cache:'no-store'});log('[JSON] lake_species:',r.ok?'OK':'HTTP '+r.status);}catch(e){log('[JSON] lake_species error:',e.message);}
    try{const r=await fetch('data/spots.json',{cache:'no-store'});log('[JSON] spots:',r.ok?'OK':'HTTP '+r.status);}catch(e){log('[JSON] spots error:',e.message);}
    try{const {getWX}=await import('./weather/providers.js'); const wx=await getWX(43.16,-77.60); log('[Weather] provider:',wx.provider,'hours:',wx.times?.length||0);}catch(e){log('[Weather] probe:',e.message);}
  });
}
