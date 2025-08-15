export function phaseLabelFrom0to1(p){
  if (p<0.12||p>0.88) return 'new';
  if (Math.abs(p-0.5)<0.12) return 'full';
  if (Math.abs(p-0.25)<0.12||Math.abs(p-0.75)<0.12) return 'quarter';
  return 'other';
}
export function phaseBoost(label){
  if (label==='new') return {day:+4,night:+2};
  if (label==='full') return {day:+2,night:+4};
  if (label==='quarter') return {day:+2,night:+2};
  return {day:+1,night:+1};
}
function isWithin(dt,t0,minutes=60){ if(!t0) return false; return Math.abs(dt-new Date(t0))/60000<=minutes; }
export function lunarBonus(tod,phaseLbl,ts,moonrise,moonset){
  const base=phaseBoost(phaseLbl); let bonus=0;
  if (['Dawn','Day','Midday','Dusk'].includes(tod)) bonus+=base.day;
  if (['Night','Dusk','Dawn'].includes(tod))        bonus+=base.night;
  if (isWithin(ts,moonrise,60)) bonus+=6;
  if (isWithin(ts,moonset,60))  bonus+=6;
  return bonus;
}
