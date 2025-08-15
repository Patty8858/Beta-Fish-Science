import { phaseLabelFrom0to1 } from '../lunar.js';

export async function fetchOpenMeteo(lat,lon){
  const tz=Intl.DateTimeFormat().resolvedOptions().timeZone;
  const url=`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}`+
    `&hourly=temperature_2m,precipitation,cloud_cover,wind_speed_10m,surface_pressure`+
    `&daily=sunrise,sunset,moon_phase,moonrise,moonset&temperature_unit=fahrenheit`+
    `&windspeed_unit=mph&timezone=${encodeURIComponent(tz)}&forecast_days=2`;
  const r=await fetch(url); if(!r.ok) throw new Error('Open-Meteo HTTP '+r.status);
  const j=await r.json(); if(!j?.hourly?.time?.length) throw new Error('Open-Meteo missing hourly');
  const phase0=(j.daily?.moon_phase?.[0]??0.25);
  const phaseLbl=phaseLabelFrom0to1((typeof phase0==='number'&&!Number.isNaN(phase0))?phase0:0.25);
  return {
    provider:'om',
    times:j.hourly.time,temp:j.hourly.temperature_2m,wind:j.hourly.wind_speed_10m,
    cc:j.hourly.cloud_cover,pr:j.hourly.precipitation,sp:j.hourly.surface_pressure,
    sunrise:j.daily.sunrise?.[0],sunset:j.daily.sunset?.[0],
    phaseLabel:phaseLbl,moonrise:j.daily.moonrise?.[0]??null,moonset:j.daily.moonset?.[0]??null
  };
}

export async function fetchNWS(lat,lon){
  const pts=await fetch(`https://api.weather.gov/points/${lat},${lon}`,{headers:{'Accept':'application/geo+json'}});
  if(!pts.ok) throw new Error('NWS points HTTP '+pts.status);
  const pj=await pts.json();
  const r=await fetch(pj.properties.forecastHourly,{headers:{'Accept':'application/geo+json'}});
  if(!r.ok) throw new Error('NWS hourly HTTP '+r.status);
  const j=await r.json(); const p=(j.properties?.periods||[]).slice(0,36);
  const now=new Date(); const dateStr=now.toISOString().slice(0,10);
  return {
    provider:'nws',
    times:p.map(x=>x.startTime),temp:p.map(x=>x.temperature),
    wind:p.map(x=>{const m=/(\d+)/.exec(x.windSpeed||'');return m?+m[1]:0}),
    cc:p.map(_=>50),pr:p.map(_=>0),sp:null,
    sunrise:`${dateStr}T06:00`,sunset:`${dateStr}T20:00`,
    phaseLabel:'other',moonrise:`${dateStr}T15:00`,moonset:`${dateStr}T03:00`
  };
}

export async function getWX(lat,lon){
  try{ return await fetchOpenMeteo(lat,lon); }
  catch(e){ console.warn('Open-Meteo failed → NWS',e); return await fetchNWS(lat,lon); }
}
