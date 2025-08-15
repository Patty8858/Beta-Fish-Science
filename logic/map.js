import { MAP_DEFAULT, DATA_PATHS } from './config.js';
let mapInit=false, map=null, SPOTS=[];
function gmapsSatLink(lat,lon,zoom=17){return `https://www.google.com/maps/@?api=1&map_action=map&center=${lat},${lon}&zoom=${zoom}&basemap=satellite`;}
function gmapsDirLink(lat,lon){return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`;}
export async function loadSpots(){
  const r=await fetch(DATA_PATHS.spots,{cache:'no-store'});
  if(!r.ok) throw new Error('Failed to load spots.json'); const j=await r.json();
  SPOTS=j.spots||[];
}
export function initMapIfNeeded(){
  if(mapInit||typeof L==='undefined'||!SPOTS.length) return; mapInit=true;
  map=L.map('map',{zoomControl:true}).setView([MAP_DEFAULT.lat,MAP_DEFAULT.lon],MAP_DEFAULT.zoom);
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:18,attribution:'© OpenStreetMap'}).addTo(map);
  const listDiv=document.getElementById('spotsList'); const items=[];
  SPOTS.forEach(s=>{
    const m=L.marker([s.lat,s.lon]).addTo(map);
    const popup=`<div class="spotPop">
      <h4>${s.name}</h4><div class="tiny"><b>Waterbody:</b> ${s.water}</div>
      <p>${s.access_notes||''}</p>
      <div class="tags">${s.type?`<span class="tag">${s.type}</span>`:''}${s.parking?`<span class="tag">Parking: ${s.parking}</span>`:''}</div>
      <div style="margin-top:6px"><a class="btn" href="${gmapsSatLink(s.lat,s.lon)}" target="_blank" rel="noopener">Satellite</a>
      <a class="btn" href="${gmapsDirLink(s.lat,s.lon)}" target="_blank" rel="noopener">Directions</a></div></div>`;
    m.bindPopup(popup);
    items.push(`<div class="tiny">• <b>${s.water}</b> — ${s.name} (${s.type||'access'})</div>`);
  });
  listDiv.innerHTML=items.join('');
}
export function invalidateMap(){ if(map) setTimeout(()=>map.invalidateSize(),0); }
