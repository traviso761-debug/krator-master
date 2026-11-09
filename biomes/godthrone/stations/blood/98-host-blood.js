// ================================================================= HOST — the bloodfalls' views and checks (station 6)
// 99-host-take.js reads STATION_VIEWS and STATION_CHECKS / STATION_NEGATIVES (each check with a broken input that must fail).
function STATION_VIEWS(VIEWS){const G=(x,z)=>terrainH(x,z),add=(k,v,mode)=>{if(v)VIEWS[k]={v,mode:mode||'day'};},mx=FALL.x,mz=marginZ(FALL.x);
 add('The bloodfalls',[mx+30,G(mx+30,mz+95)+6,mz+95,mx,G(mx,mz-4)+8,mz-4]);
 add('The falls, close',[mx+10,G(mx+10,mz+28)+3,mz+28,mx,G(mx,mz-1)+4,mz-1]);
 add('The red pool and the terraces',[mx-40,G(mx-40,mz+90)+12,mz+90,mx,QOLBED(0),mz+40]);
 add('Along the ice cliff',[mx-700,G(mx-700,marginZ(mx-700)+80)+10,marginZ(mx-700)+80,mx+300,G(mx+300,marginZ(mx+300))+20,marginZ(mx+300)]);
 {const P=QOL.pts,i=Math.min(P.length-2,12),p=P[i],q=P[i+1];add('The blood river',[p[0]+60,G(p[0]+60,p[1])+14,p[1],q[0],QOLBED(_qd[i+1]),q[1]]);
  const j=Math.min(P.length-2,30),a=P[j],b=P[j+1];add('The riverweed',[a[0]+8,QOLBED(_qd[j])+4,a[1],b[0],QOLBED(_qd[j+1]),b[1]]);}
 add('Down Qol Ḍrāi to the Vale',[mx+200,G(mx+200,mz-200)+40,mz-200,mx+1600,G(mx+1600,mz+9000)-400,mz+9000]);
 add('The Red Gill from the ice',[mx-300,G(mx-300,mz-600)+20,mz-600,0,SO.y0,0]);
 add('Overview',[mx-3400,G(mx-3400,mz-3000)+1400,mz-3000,mx+300,FALL.foot,mz+1200]);
 add('Dawn, the falls',[mx+60,G(mx+60,mz+140)+10,mz+140,mx,G(mx,mz)+10,mz],'dawn');
 add('Night, the falls',[mx+40,G(mx+40,mz+110)+8,mz+110,mx,G(mx,mz)+5,mz],'night');}
const BCHK={
 // the falls rust as they fall: fresh at the mouth, red by the foot (W.rustAt by the brine's age in the air)
 rust(B){const a=B.rustF(0),b=B.rustF(1);return{ok:a<.3&&b>.8,detail:'rusted '+(a*100).toFixed(0)+'% at the mouth, '+(b*100).toFixed(0)+'% at the foot (tau '+B.tau+' s, '+B.fall.tFall.toFixed(1)+' s falling)'};},
 // the stain: on the cliff by the mouth and on the fan below (the record), and the ground's rust field paints the fan
 stain(B,field){const m=B.mouth,f=B.foot;let on=0;for(let k=1;k<10;k++){const y=m.y+(f[2]-m.y)*k/10;on=Math.max(on,B.stainAt(m.x,y,m.z+.5),B.stainAt(m.x,y,m.z+3));}const fan=B.stainAt(f[0],f[2],f[1]+10),g=field(f[0],f[1]+10);
  return{ok:on>.5&&fan>.3&&g>.4,detail:'the stain '+on.toFixed(2)+' down the face (mouth '+m.y.toFixed(1)+' m, foot '+f[2].toFixed(1)+'), '+fan.toFixed(2)+' on the fan; the ground\'s rust '+g.toFixed(2)};},
 // the ice cliff: 30 m+ of ice within 15 m behind the margin, its face near vertical (25 m+ down within 10 m)
 cliff(T,drop){const ok=T>30&&drop>25;return{ok,detail:T.toFixed(0)+' m of ice 15 m behind the margin; '+drop.toFixed(0)+' m down across its last 10 m'};},
 // the river: its bed never climbs, the drawn ground on its line is its floor (to 2 m), the riverweed in it
 river(bed,off,weed){let up=0;for(let i=1;i<bed.length;i++)if(bed[i]>bed[i-1]+1e-6)up++;return{ok:!up&&off===0&&weed>50,detail:bed.length+' bed samples, '+up+' climbing; '+off+' off the drawn floor; '+weed+' blades of riverweed'};},
 air(p){const ok=Math.abs(p-.82)<.03;return{ok,detail:p.toFixed(3)+' atm at the falls (map 5.1: 0.82)'};}};
const presAt=y=>ATMOS.airPressureAt(SKY.preset||{air:{pressure:1.6,thin:{y0:0,scale:8000}}},y);
const bedSamples=()=>{const o=[];for(let s=0;s<_qd[_qd.length-1];s+=25)o.push(QOLBED(s));return o;};
const offFloor=()=>{let n=0;for(let i=4;i<QOL.pts.length;i+=3){const p=QOL.pts[i];if(!inMap(p[0],p[1]))continue;if(Math.abs(terrainH(p[0],p[1])-QOLBED(_qd[i]))>2)n++;}return n;};
const cliffNow=()=>{const mx=FALL.x,mz=marginZ(mx);return[ICE.T(mx,mz-15),terrainH(mx,mz-8)-terrainH(mx,mz+2)];};
function STATION_CHECKS(){const R=[],add=(n,r)=>R.push(Object.assign({name:n},r)),B=BLOOD.B,c=cliffNow();
 add('the falls rust as they fall',BCHK.rust(B));
 add('the stain on the cliff and the fan',BCHK.stain(B,FIELD.rust));
 add('the ice cliff stands over the falls',BCHK.cliff(c[0],c[1]));
 add('Qol Ḍrāi: its bed falls, drawn, weed in it',BCHK.river(bedSamples(),offFloor(),QOL_DRAW?QOL_DRAW.weed:0));
 add('the air at the falls',BCHK.air(presAt(FALL.foot)));
 return R;}
function STATION_NEGATIVES(){const R=[],add=(n,r)=>R.push({name:n,failed:!r.ok,detail:r.detail}),B=BLOOD.B,c=cliffNow();
 add('brine that never rusts',BCHK.rust(Object.assign({},B,{rustF:f=>WATER.rustAt(.1+f*B.fall.tFall,1e6)})));
 add('no stain on the fan',BCHK.stain(B,()=>0));
 add('a sloping ice front',BCHK.cliff(c[0],c[1]*.3));
 add('the river run uphill',BCHK.river(bedSamples().reverse(),offFloor(),QOL_DRAW?QOL_DRAW.weed:0));
 add('the summit\'s air at the falls',BCHK.air(presAt(25000)));
 return R;}
