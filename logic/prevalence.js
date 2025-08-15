import { DATA_PATHS, PREV_SCALE } from './config.js';
let WATERS=[]; let PREV={};
export async function loadPrevalence(){
  const r=await fetch(DATA_PATHS.prevalence,{cache:'no-store'});
  if(!r.ok) throw new Error('Failed to load lake_species.json');
  const j=await r.json();
  WATERS=j.waters.map(w=>[w.name,w.lat,w.lon]);
  PREV={}; for(const w of j.waters) PREV[w.name]=w.prevalence;
}
export function getWaters(){ return WATERS.slice(); }
export function getPrevalenceMap(){ return PREV; }
export function getPrevPoints(code){ return PREV_SCALE[code]??0; }
