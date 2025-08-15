import { clamp } from './utils.js';

function sBass(t,sky,wind,baro,precip,tod){
  let p=0;
  if (t>=65&&t<=75) p+=40;
  else if (t>=58&&t<65) p+=clamp((t-58)/(65-58)*30,0,30);
  else if (t>75&&t<=82) p+=clamp((82-t)/(82-75)*30,0,30);
  if (tod==='Dawn'||tod==='Dusk') p+=8;
  if (sky==='Mixed / Partly'||sky==='Overcast') p+=8;
  if (sky==='Sunny (midday)') p-=5;
  if (wind>=4&&wind<=14) p+=10; else if (wind<=2) p+=4; else if (wind>22) p-=4;
  p+=({Falling:10,Stable:6,Rising:2}[baro]||0);
  if (precip==='Light') p+=4; if (precip==='Heavy') p-=6;
  return clamp(Math.round(p),0,100);
}
function sWalleye(t,sky,wind,baro,precip,tod){
  let p=0;
  if (t>=55&&t<=68) p+=40;
  else if (t>=48&&t<55) p+=clamp((t-48)/(55-48)*28,0,28);
  else if (t>68&&t<=74) p+=clamp((74-t)/(74-68)*22,0,22);
  if (tod==='Dawn'||tod==='Dusk') p+=10; if (tod==='Night') p+=8;
  if (sky==='Overcast') p+=12; if (sky==='Sunny (midday)') p-=6;
  if (wind>=6&&wind<=18) p+=10; else if (wind<3) p+=2; else if (wind>22) p-=4;
  p+=({Falling:12,Stable:4,Rising:0}[baro]||0);
  if (precip==='Light') p+=4; if (precip==='Heavy') p-=6;
  return clamp(Math.round(p),0,100);
}
function sTrout(t,sky,wind,baro,precip,tod){
  let p=0;
  if (t>=50&&t<=65) p+=40;
  else if (t>=44&&t<50) p+=clamp((t-44)/(50-44)*26,0,26);
  else if (t>65&&t<=70) p+=clamp((70-t)/(70-65)*18,0,18);
  if (sky==='Overcast') p+=10; if (sky==='Sunny (midday)') p-=5;
  if (wind>=3&&wind<=10) p+=6; else if (wind>18) p-=6;
  p+=({Falling:6,Stable:8,Rising:2}[baro]||0);
  if (precip==='Light') p+=2; if (precip==='Heavy') p-=10;
  if (tod==='Dawn'||tod==='Dusk') p+=6; if (tod==='Midday') p-=4;
  return clamp(Math.round(p),0,100);
}
function sPike(t,sky,wind,baro,precip,tod){
  let p=0;
  if (t>=60&&t<=70) p+=40;
  else if (t>=52&&t<60) p+=clamp((t-52)/(60-52)*28,0,28);
  else if (t>70&&t<=76) p+=clamp((76-t)/(76-70)*22,0,22);
  if (sky==='Overcast'||tod==='Dawn'||tod==='Dusk') p+=10;
  if (wind>=6&&wind<=15) p+=8; else if (wind>20) p-=4;
  p+=({Falling:12,Stable:4,Rising:0}[baro]||0);
  if (precip==='Light') p+=4; if (precip==='Heavy') p-=6;
  return clamp(Math.round(p),0,100);
}
function sMusky(t,sky,wind,baro,precip,tod){
  let p=0;
  if (t>=63&&t<=75) p+=40;
  else if (t>=56&&t<63) p+=clamp((t-56)/(63-56)*28,0,28);
  else if (t>75&&t<=80) p+=clamp((80-t)/(80-75)*22,0,22);
  if (sky==='Overcast'||tod==='Dusk'||tod==='Night') p+=10;
  if (sky==='Sunny (midday)') p-=6;
  if (wind>=8&&wind<=16) p+=10; else if (wind>24) p-=4;
  p+=({Falling:15,Stable:4,Rising:-3}[baro]||0);
  if (precip==='Light') p+=6; if (precip==='Heavy') p-=8;
  if (tod==='Midday') p-=6;
  return clamp(Math.round(p),0,100);
}
function sPickerel(t,sky,wind,baro,precip,tod){
  let p=0;
  if (t>=62&&t<=76) p+=40;
  else if (t>=56&&t<62) p+=clamp((t-56)/(62-56)*28,0,28);
  else if (t>76&&t<=80) p+=clamp((80-t)/(80-76)*18,0,18);
  if (sky==='Mixed / Partly'||sky==='Overcast'||tod==='Dawn'||tod==='Dusk') p+=8;
  if (wind>=3&&wind<=12) p+=8; else if (wind<2) p+=3; else if (wind>20) p-=4;
  p+=({Falling:10,Stable:6,Rising:2}[baro]||0);
  if (precip==='Light') p+=4; if (precip==='Heavy') p-=6;
  return clamp(Math.round(p),0,100);
}
function sPerch(t,sky,wind,baro,precip,tod){
  let p=0;
  if (t>=55&&t<=68) p+=40;
  else if (t>=48&&t<55) p+=clamp((t-48)/(55-48)*26,0,26);
  else if (t>68&&t<=74) p+=clamp((74-t)/(74-68)*18,0,18);
  if (sky==='Mixed / Partly'||sky==='Overcast') p+=6;
  if (wind>=2&&wind<=10) p+=8; else if (wind>18) p-=4;
  p+=({Falling:6,Stable:6,Rising:4}[baro]||0);
  if (precip==='Heavy') p-=6;
  if (tod==='Dawn'||tod==='Dusk') p+=4;
  return clamp(Math.round(p),0,100);
}
export const CALC={
  'Bass':sBass,'Walleye':sWalleye,'Trout':sTrout,
  'Northern Pike':sPike,'Muskellunge':sMusky,'Chain Pickerel':sPickerel,'Perch':sPerch
};
