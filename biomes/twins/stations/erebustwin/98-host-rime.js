// ================================================================= HOST — the Rime Twin's views and checks (station 5)
// The views are found in the built scene (a tower, a cave, tube 10's mouth, a cauldron, the vent, the rim), never aimed at arithmetic alone.
// The checks (verify.py --assert) are pure functions of their inputs, each with a negative that must fail.
function STATION_VIEWS(VIEWS){const G=(x,z)=>terrainH(x,z),add=(k,v,mode,o)=>{if(v&&v.every(isFinite))VIEWS[k]=Object.assign({v,mode:mode||'day'},mode==='night'?{}:{hour:13.6},o||{});};   /* day at 13:36: the giant hides the sun here 9:30-12:00 */
 const R=RIME,V=R.V,NW=TWIN_CONES.cones[0];
 // the towers: the nearest floor tower to the vent, from the ice beside it, the others beyond
 {const T=R.towers.filter(t=>!t.flank).sort((a,b)=>Math.hypot(a.x-V[0],a.z-V[1])-Math.hypot(b.x-V[0],b.z-V[1]))[0];
  if(T){const dx=T.x-V[0],dz=T.z-V[1],l=Math.hypot(dx,dz)||1,c=[T.x+dx/l*22-dz/l*8,T.z+dz/l*22+dx/l*8];add('The ice towers',[c[0],G(c[0],c[1])+1.7,c[1],T.x,T.y+T.h*.6,T.z]);
   add('Night: an ice tower',[c[0],G(c[0],c[1])+1.7,c[1],T.x,T.y+T.h*.6,T.z],'night');}}
 // inside a steam cave: from its back toward the mouth, the blue ice round
 {const C=R.caves[0],b=[C.x-Math.cos(C.face)*C.R*.55,C.z-Math.sin(C.face)*C.R*.55],m=[C.x+Math.cos(C.face)*C.R,C.z+Math.sin(C.face)*C.R];
  add('Inside a steam cave',[b[0],C.floor+1.7,b[1],m[0],C.floor+C.H*.45,m[1]]);
  const o=[C.x+Math.cos(C.face)*(C.R+16),C.z+Math.sin(C.face)*(C.R+16)];add('A steam cave\'s mouth',[o[0],G(o[0],o[1])+1.8,o[1],C.x,C.floor+C.H*.4,C.z]);}
 // tube 10's mouth under the south-east wall
 {const C=R.tube,o=[C.x+Math.cos(C.face)*(C.R+30),C.z+Math.sin(C.face)*(C.R+30)];add('The upper mouth of tube 10',[o[0],G(o[0],o[1])+2,o[1],C.x,C.floor+C.H*.4,C.z]);}
 // a slush cauldron
 {const S=R.cauldrons[0],dx=S.x-V[0],dz=S.z-V[1],l=Math.hypot(dx,dz)||1,c=[S.x-dx/l*(S.r+9),S.z-dz/l*(S.r+9)];add('A slush cauldron',[c[0],G(c[0],c[1])+1.8,c[1],S.x,S.level,S.z]);}
 // the inner vent from its rim
 {const c=[V[0]-(R.pit.r+30),V[1]+12];add('The inner vent',[c[0],G(c[0],c[1])+2,c[1],V[0]+20,V.y+6,V[1]]);}
 // the caldera's rim from the floor: the highest wall, north-west
 {const a=R.rimAt,c=[Math.cos(a)*600,Math.sin(a)*600];add('The caldera wall',[c[0],G(c[0],c[1])+2,c[1],Math.cos(a)*2350,R.rimTop-60,2350*Math.sin(a)]);}
 // the NW Twin from the rim (its plume 134 km north-west: 89b)
 {const a=Math.atan2(NW.z,NW.x),c=[Math.cos(a)*2380,2380*Math.sin(a)];add('The NW Twin from the Rime Twin',[c[0],G(c[0],c[1])+2,c[1],NW.x,NW.floor+1200,NW.z]);}
 add('Night on the ice',(function(){const c=[V[0]-500,V[1]+420];return[c[0],G(c[0],c[1])+6,c[1],V[0],V.y+20,V[1]];})(),'night');
 {const c=[-2600,3000];add('Overview',[c[0],G(c[0],c[1])+900,c[1],V[0]*.5,SITE_Y,V[1]*.5]);}}
// THE COLD PROBE (99-host-take.js): the ice cap away from every tower, and the first steam cave
STN.coldProbe=()=>{let best=null,bd=-1;for(const p of [[-900,700],[-700,-900],[900,800],[-1200,0]]){const d=Math.min(...RIME.towers.map(t=>Math.hypot(t.x-p[0],t.z-p[1])));if(d>bd){bd=d;best=p;}}
 const C=RIME.caves[0];return{out:[best[0],terrainH(best[0],best[1])+1.6,best[1]],inn:[C.x,C.floor+1.6,C.z]};};
STN.counts=B=>B.stones>100&&B.blocks>50&&B.blocks+B.stones+B.obsidian<320000;
const RCHK={
 // the towers: 6-12 m, each on a warm vent (its ground over 20 C where the frozen cap is -18)
 towers(T,heat){const bad=T.filter(t=>t.h<6||t.h>12||heat(t.x,t.z)<20);return{ok:T.length>=18&&!bad.length,detail:T.length+' ice towers ('+T.filter(t=>t.flank).length+' past the rim), '+bad.length+' off 6-12 m or off a vent'};},
 // the caves: warm inside (+8 C or more), the ice cap round them below -10 C
 caves(inside,ice){const ok=inside.length>=4&&inside.every(t=>t>8)&&ice<-10;return{ok,detail:'inside the caves '+inside.map(t=>t.toFixed(0)).join(', ')+' C; the ice cap '+ice.toFixed(1)+' C'};},
 // the cauldrons: 86 C, within 10 C of the boil at the summit's pressure (Clausius-Clapeyron), boiling drawn
 cauldrons(P,p){const Tb=1/(1/373.15-8.314/40660*Math.log(p))-273.15,bad=P.filter(s=>!(s.T<=Tb&&s.T>Tb-10&&s.boil));return{ok:P.length>=3&&!bad.length,detail:P.length+' cauldrons at '+P.map(s=>s.T).join(', ')+' C; water boils at '+Tb.toFixed(1)+' C at '+p.toFixed(3)+' atm'};},
 // the ice cap: most of the caldera's floor away from the vent is glacier ice
 ice(frac){return{ok:frac>.6,detail:(frac*100).toFixed(0)+'% of the floor (away from the vent\'s melt) is glacier ice'};},
 // the rim: at the map's 5,880 m (within 80 m)
 rim(top){return{ok:Math.abs(top-5880)<80,detail:'the rim\'s highest '+top.toFixed(0)+' m (the map: 5,880)'};},
 // the NW Twin: ~134 km north-west (scale model 5.1: (988, 1458) from (1042, 1498))
 twin(d,brg){const ok=d>120000&&d<150000&&brg>285&&brg<325;return{ok,detail:(d/1000).toFixed(0)+' km at '+brg.toFixed(0)+' deg'};}};
function iceFrac(){let n=0,k=0;const X={};for(let z=-1600;z<=1600;z+=50)for(let x=-1600;x<=1600;x+=50){if(Math.hypot(x,z)>1700)continue;const dv=Math.hypot(x-RIME.V[0],z-RIME.V[1]);
  if(dv<RIME.RM(RIME.th(x,z))+80)continue;for(const q of TWINS.XKEYS)X[q]=0;MODEL.classAt(x,z,X);n++;if(X.ice>.5)k++;}return n?k/n:0;}
function caveAir(){return RIME.caves.map(C=>KHAZ_TEMP(C.x,C.floor+1.6,C.z));}
function STATION_CHECKS(){const R=[],add=(n,r)=>R.push(Object.assign({name:n},r)),p=ATMOS.airPressureAt(SKY.preset||{air:{pressure:1.6,thin:{y0:0,scale:8000}}},SITE_Y);
 add('the ice towers: 6-12 m, on the vents',RCHK.towers(RIME.towers,OASIS.heatAt));
 {const P=STN.coldProbe().out;add('the steam caves warm, the ice cap frozen',RCHK.caves(caveAir(),KHAZ_TEMP(P[0],P[1],P[2])));}
 add('the slush cauldrons near the boil',RCHK.cauldrons(RIME.cauldrons,p));
 add('the ice cap over the floor',RCHK.ice(iceFrac()));
 add('the rim at the map\'s 5,880 m',RCHK.rim(RIME.rimTop));
 {const T=TWIN_CONES.cones[0];add('the NW Twin on the horizon',RCHK.twin(Math.hypot(T.x,T.z),(Math.atan2(T.x,-T.z)*180/Math.PI+360)%360));}
 return R;}
function STATION_NEGATIVES(){const R=[],add=(n,r)=>R.push({name:n,failed:!r.ok,detail:r.detail}),p=ATMOS.airPressureAt(SKY.preset||{air:{pressure:1.6,thin:{y0:0,scale:8000}}},SITE_Y);
 add('the towers moved off their vents',RCHK.towers(RIME.towers.map(t=>Object.assign({},t,{x:t.x+300})),OASIS.heatAt));
 add('a 30 m tower',RCHK.towers(RIME.towers.map((t,i)=>i?t:Object.assign({},t,{h:30})),OASIS.heatAt));
 {const P=STN.coldProbe().out;add('a cave as cold as the ice',RCHK.caves(caveAir().map(()=>-18),KHAZ_TEMP(P[0],P[1],P[2])));}
 add('the cauldrons at sea-level boiling',RCHK.cauldrons(RIME.cauldrons.map(s=>Object.assign({},s,{T:99})),p));
 add('the floor bare of ice',RCHK.ice(0));
 add('the rim 400 m low',RCHK.rim(RIME.rimTop-400));
 add('the NW Twin due east',RCHK.twin(134000,90));
 return R;}
