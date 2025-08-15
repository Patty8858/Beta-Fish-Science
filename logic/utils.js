export const clamp = (x,a,b)=>Math.max(a,Math.min(b,x));
export const mmToPrecip = mm => mm>=5?'Heavy':(mm>0?'Light':'None');

export function hourToTOD(h,sunriseH,sunsetH){
  if (h>=Math.max(0,sunriseH-1)&&h<=Math.min(23,sunriseH+1)) return 'Dawn';
  if (h>=Math.max(0,sunsetH-1) &&h<=Math.min(23,sunsetH+1))  return 'Dusk';
  if (h>=sunriseH+2 && h<=sunsetH-2) return (h>=11&&h<=13)?'Midday':'Day';
  return 'Night';
}
export function skyFromClouds(cc,tod){
  if (tod==='Dawn'||tod==='Dusk') return 'Dawn/Dusk light';
  if (cc>=70) return 'Overcast';
  if (cc<=30 && tod==='Midday') return 'Sunny (midday)';
  return 'Mixed / Partly';
}
export function baroTrend(series,i){
  if (!series) return 'Stable';
  const w=series.slice(Math.max(0,i-6),Math.min(series.length,i+6));
  if (w.length<12) return 'Stable';
  const avg=a=>a.reduce((x,y)=>x+y,0)/a.length;
  const diff=avg(w.slice(6))-avg(w.slice(0,6));
  if (diff<=-3) return 'Falling';
  if (diff>1.5) return 'Rising';
  return 'Stable';
}
export async function ensureSW(){
  if (!('serviceWorker' in navigator)) return;
  try{ await navigator.serviceWorker.register('sw.js'); }catch(e){ console.warn('SW register',e); }
}
