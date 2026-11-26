// ================================================================= HOST — the ground model: THE SUMMIT (the caldera, the pit, the vent)
// A station's ground as plain functions of (x, z) on its frame (45-host-stage.js): baseH (the closure the field bakes), STRATA
// (the rock), VENT (the vent the halo is centred on), MODEL.fieldsAt (what the kit's fields read), MODEL.after (once the field
// is baked). The summit's pages (the vent, the wall) share this one; another station replaces it (stations/<name>/).
// THE CALDERA: its centre on the axis, 31 km south-west; the main wall's foot ~31.9 km from it (4.23: the rim at 36 +- 3.5 km,
// the wall's run 9 km on the raster, here the wall as the scarps it stands for: PLAN.md section 4)
const CALD={sC:-31000,tC:0,foot:31900,yFoot:22000,rimY:25000};
// the main wall's collapse terraces, foot to rim: each a scarp (h m at ang degrees) and the bench behind its lip (w m wide,
// tilted back tilt m toward the next scarp's foot: the collapse blocks rotated as they slid). Heights scaled so the rim is
// at CALD.rimY exactly
const TER_MAIN=(function(){const S=[{h:430,ang:63},{h:360,ang:58},{h:560,ang:66},{h:300,ang:55},{h:640,ang:64},{h:630,ang:61}],B=[{w:330,tilt:14},{w:470,tilt:22},{w:260,tilt:10},{w:520,tilt:26},{w:380,tilt:16}];
 const need=CALD.rimY-CALD.yFoot+B.reduce((a,b)=>a+b.tilt,0),k=need/S.reduce((a,s)=>a+s.h,0);S.forEach(s=>{s.h*=k;s.run=s.h/Math.tan(s.ang*Math.PI/180);});
 return{S,B,rise:CALD.rimY-CALD.yFoot};})();
// THE PIT: centred on the summit vent, 900 m deep (4.23), its wall three scarps from its floor (radius PIT.floorR) out
const PIT=(function(){const s=CALD.sC+9200,t=-250,p=xzOf(s,t);   /* 9.2 km from the caldera's centre (4.23: 7 km east, 6 km north) */const S=[{h:340,ang:60},{h:260,ang:56},{h:330,ang:62}],B=[{w:210,tilt:10},{w:170,tilt:8}];
 const need=900+B.reduce((a,b)=>a+b.tilt,0),k=need/S.reduce((a,q)=>a+q.h,0);S.forEach(q=>{q.h*=k;q.run=q.h/Math.tan(q.ang*Math.PI/180);});
 const rim=1750+S.reduce((a,q)=>a+q.run,0)+B.reduce((a,b)=>a+b.w,0);
 return{s,t,x:p[0],z:p[1],floorR:1750,depth:900,S,B,rise:900,rimR:rim,name:'The nested pit (900 m deep; its floor a frozen lava lake)'};})();
// a terraced profile: ascending from d=0 (the first scarp's foot), the scarps and benches of T, each scarp's start moved by
// wob(i) m; returns {y (metres above the foot), i (the scarp or bench index), u (0..1 across it), face (0..1: on a scarp's
// face), foot (the next scarp's foot, d), lip} into o
function terraces(T,d,wob,o,hk){let a=0,y=0;const S=T.S,B=T.B,n=S.length;o.face=0;o.toFoot=Infinity;o.scarp=-1;o.onScarp=false;o.over=0;
 for(let i=0;i<n;i++){const sc=S[i],a0=a+wob(i);let h=sc.h,run=sc.run;
  /* hk(i): this scarp's height here, as a share of its own (the terraces vary along the wall); the last one takes what is left
     to the top (T.rise), so the rim keeps its height */
  if(hk){if(i<n-1){const m=hk(i);h*=m;run*=m;}else{h=Math.max(sc.h*.35,T.rise-y);run=h/Math.tan(sc.ang*Math.PI/180);}}
  o.h=h;
  if(d<a0){o.y=y;o.yBase=y;o.toFoot=a0-d;o.scarp=i;o.u=0;return o;}   // on the floor or the bench before this scarp
  if(d<a0+run){const u=(d-a0)/run,e=mix(u,u*u*(3-2*u),.6);o.y=y+h*e;o.yBase=y;o.into=d-a0;o.face=4*u*(1-u);o.u=u;o.scarp=i;o.onScarp=true;return o;}
  y+=h;a=a0+run-wob(i);
  if(i<B.length){const b=B[i],nx=a+b.w;if(d<nx+wob(i+1)){const u=clamp((d-a-wob(i))/(b.w+wob(i+1)-wob(i)),0,1);o.y=y-b.tilt*u;o.yBase=o.y;o.toFoot=nx+wob(i+1)-d;o.scarp=i+1;o.u=u;o.onScarp=false;return o;}
   y-=b.tilt;a=nx;}}
 o.y=y;o.over=d-a-wob(n-1);o.scarp=n;o.onScarp=false;o.u=0;return o;}
const _tm={},_tp={};
// the main floor: the caldera's floor rises ~150 m to its centre (4.23); a lava plain with low wrinkle ridges and flow lobes
function floorH(x,z,rho){const r=1-Math.abs(fb(x*.0021+3.1,z*.0021-1.7,3,WORLD+1)*2-1);
 return CALD.yFoot+150*clamp(1-rho/CALD.foot,0,1)+9*r*r+6*(fb(x*.0007,z*.0007,2,WORLD+2)-.5)+1.6*(vn(x*.035,z*.035,WORLD+3)-.5);}
// the main wall at (x,z): its arc coordinate (m along the wall), its terraces wandering independently along it, gullies
// fluting each scarp's face; past the rim the crest rounds over and the outer flank falls away at 6.5% (4.23's shield)
function wallAt(x,z,o){const s=sOf(x,z),t=tOf(x,z),ds=s-CALD.sC,rho=Math.hypot(ds,t),arc=CALD.foot*Math.atan2(t,ds);
 const foot=CALD.foot+180*(fb(arc*.00045,7.3,2,WORLD+4)-.5);o.rho=rho;o.arc=arc;o.d=rho-foot;
 /* the lips wander at two scales (spurs and bays a few hundred metres across, then tens), each scarp's height swings +-30%
    along the wall (the last one makes up the rim), and gullies flute every face */
 const dw=o.d+70*(fb(arc/260,o.d/400,2,WORLD+13)-.5)*2+22*(vn(arc/55,o.d/90,WORLD+14)-.5)*2;
 if(dw<-60){o.y=0;o.yBase=0;o.face=0;o.scarp=0;o.toFoot=-dw;o.onScarp=false;o.over=-1;o.dw=dw;return o;}
 o.dw=dw;terraces(TER_MAIN,dw,i=>i===0?0:100*(fb(arc*.0011+i*7.7,i*3.1,2,WORLD+5)-.5)*2,o,i=>1+.32*(fb(arc*.0008+i*4.1,i*1.7,2,WORLD+15)-.5)*2);
 if(o.onScarp){const g=1-Math.abs(fb(arc/150+.35*o.u,o.scarp*5.3,2,WORLD+6)*2-1);o.y-=o.h*.15*o.face*g*g*g;}
 else if(o.scarp>0&&o.scarp<TER_MAIN.S.length&&dw>0){const k=Math.min(1,o.u*6,(1-o.u)*6);o.y+=k*22*(fb(x*.0065,z*.0065,2,WORLD+16)-.45);}   /* the benches: slumped, hummocky */
 if(o.scarp===TER_MAIN.S.length){const ov=o.over;o.y-=.065*ov+8*(1-Math.exp(-ov/40));}   /* the crest rounds over, then the outer flank */
 return o;}
// the pit's depth below the main floor at (x,z): 900 m inside its floor's ring, stepping up its three scarps to 0 at its rim
function pitAt(x,z,o){const dx=x-PIT.x,dz=z-PIT.z,q=Math.hypot(dx,dz),ph=Math.atan2(dz,dx);
 const qq=q*(1+.035*(fb(Math.cos(ph)*1.7+5,Math.sin(ph)*1.7,2,WORLD+7)-.5));o.q=qq;o.d=qq-PIT.floorR;
 const arc=PIT.floorR*ph,dw=o.d+30*(fb(arc/150,o.d/200,2,WORLD+17)-.5)*2;o.dw=dw;
 if(dw<0){o.y=0;o.yBase=0;o.depth=PIT.depth;o.face=0;o.onScarp=false;o.toFoot=-dw;o.scarp=0;o.inside=true;return o;}
 terraces(PIT,dw,i=>i===0?0:55*(fb(arc*.003+i*9.1,i,2,WORLD+8)-.5)*2,o,i=>1+.3*(fb(arc*.002+i*3.3,i*2.1,2,WORLD+18)-.5)*2);
 if(o.onScarp){const g=1-Math.abs(fb(arc/80+.3*o.u,o.scarp*3.7,2,WORLD+9)*2-1);o.y-=o.h*.12*o.face*g*g*g;}
 o.depth=o.scarp>=PIT.S.length?0:Math.max(0,PIT.rise-o.y);o.inside=o.scarp<PIT.S.length;return o;}

// ---------------------------------------------------------------- the vent
// A fissure on the pit's floor (along FISS.dir, from FISS.a to FISS.b m about the vent), the spatter rampart either side of
// its crack, and three cones on it: the vent's own (its crater, and in it the throat where the lava stands) and two smaller
const FISS=(function(){const a=.55,d=[Math.cos(a),Math.sin(a)];return{dir:d,a:-620,b:520,name:'The summit vent\'s fissure (fuming; its crack hot)'};})();
const fissPt=u=>xzOf(PIT.s+FISS.dir[0]*u,PIT.t+FISS.dir[1]*u);
const CONES=[{u:0,h:46,r:150,crater:.44,cd:34,throat:24,main:true,name:'The summit vent (its cone; a lava throat in its crater, fuming)'},
 {u:-380,h:18,r:72,crater:.4,cd:11,name:'A spatter cone on the fissure'},{u:330,h:25,r:88,crater:.42,cd:15,name:'A spatter cone on the fissure'}]
 .map(C=>{const p=fissPt(C.u);return Object.assign(C,{x:p[0],z:p[1]});});
function fissAt(x,z){const s=sOf(x,z)-PIT.s,t=tOf(x,z)-PIT.t,u=s*FISS.dir[0]+t*FISS.dir[1],l=-s*FISS.dir[1]+t*FISS.dir[0];
 if(u<FISS.a-80||u>FISS.b+80)return{h:0,k:0,crack:0,u,l};
 const e=smooth(FISS.a-80,FISS.a+60,u)*smooth(FISS.b+80,FISS.b-60,u),a=Math.abs(l-4*Math.sin(u*.011));
 return{h:e*(10*Math.exp(-Math.pow((a-13)/8,2))-3*smooth(5,1.5,a)),k:e*smooth(34,14,a),crack:e*smooth(4.5,1.5,a),u,l};}
function coneAt(x,z){let h=0,k=0,throat=0,C0=null;for(const C of CONES){const d=Math.hypot(x-C.x,z-C.z)/C.r;if(d>1.5)continue;
 const hh=C.h*Math.pow(smooth(1.05,C.crater*.95,d),1.1)-C.cd*smooth(C.crater*1.02,C.crater*.2,d);if(hh>h){h=hh;C0=C;}k=Math.max(k,smooth(1.3,.85,d));
 if(C.throat){const dt=Math.hypot(x-C.x,z-C.z);throat=Math.max(throat,smooth(C.throat*1.25,C.throat*.7,dt));}}
 return{h,k,throat,C:C0};}
const VENT=CONES[0];VENT.lavaY=0;   // the throat's lava level, set once the ground is baked (88-host-build.js reads it)

// ---------------------------------------------------------------- the rock (KSTRATA, the tibasalt recipe; PLAN.md section 3)
// Thin black flows with an ilmenite sheen, orange and black glass-bead horizons between eruptions, rubbly flow tops; the
// alteration line (the bead beds to palagonite) is the dry-cold line, 8,500 m (the recipe's default): far below everything
// here, so the summit's beds are fresh. The beds dip gently away from the caldera's centre (the shield's own flows)
const STRATA=KSTRATA.create({seed:KR.hash(WORLD,0,0,0x57A7),formations:[{recipe:'tibasalt'}],range:[20600,25400],
 dip:[-SQ,SQ,.004],warp:[6,1.6],wash:{m:2},regolith:.35,dust:0x2a2624});

// ---------------------------------------------------------------- the ground (baked once: KFIELD)
// baseH: the closure (the floor, the wall, the pit, the vent, the talus at every scarp's foot); then the ledge pass on the
// lattice's own gradient (each flow a ledge, the bead beds recessed: KSTRATA.ledge), then the field. terrainH reads the
// field inside the map, the closure past it (the far field's, 82-host-sky.js). The ground mesh's vertices are the field's
// grid points (84-host-ground.js), so what is planted on the field stands on the ground as drawn.
const TALUS_MAIN=TER_MAIN.S.map((sc,i)=>KRELIEF.talus({footD:(x,z)=>{const o=wallAt(x,z,_tm);return o.scarp===i?(o.onScarp?-o.into:o.toFoot):Infinity;},h:Math.min(70,sc.h*.11),reach:Math.min(220,sc.h*.36),seed:KR.hash(WORLD,1,i,0x7A1)}));
const TALUS_PIT=PIT.S.map((sc,i)=>KRELIEF.talus({footD:(x,z)=>{const o=pitAt(x,z,_tp);return o.scarp===i&&o.inside?(o.onScarp?-o.into:o.toFoot):Infinity;},h:Math.min(45,sc.h*.1),reach:Math.min(120,sc.h*.33),seed:KR.hash(WORLD,2,i,0x7A2)}));
const _w={},_p={};
function baseH(x,z){const W=wallAt(x,z,_w),n=TER_MAIN.S.length;let wy=W.y;
 /* the talus banks against each scarp's foot: the ground is the higher of the scarp and the apron (the wall goes down into it) */
 if(W.scarp<n&&(W.onScarp||W.toFoot<240))wy=Math.max(W.y,W.yBase+TALUS_MAIN[W.scarp](x,z));
 const fl=floorH(x,z,W.rho);let y=CALD.yFoot+wy+smooth(260,0,W.dw)*(fl-CALD.yFoot);   // the floor's own relief fades into the wall's foot
 const P=pitAt(x,z,_p);
 if(P.depth>0){let py=P.y;if(P.inside&&(P.onScarp||P.toFoot<140))py=Math.max(P.y,P.yBase+TALUS_PIT[P.scarp](x,z));
  y-=Math.max(0,PIT.rise-py);
  y-=(fl-CALD.yFoot)*.6*smooth(0,-150,P.d);   /* the pit's floor is a frozen lava lake: flatter than the plain above */
  if(P.d<0){const F=fissAt(x,z),C=coneAt(x,z);y+=Math.max(F.h,C.h)-30*C.throat;}}   /* the throat: a shaft 30 m down in the crater's floor */
 return y;}
// THE MODEL'S FIELDS (45c caches them on a 20 m lattice): face (0..1 on a scarp's face), talus (the aprons at the scarps' feet),
// rampart (the spatter rampart and the cones), glass (the pit's frozen lake), vent (near the vent: sublimates, fumes), halo
// (the glass halo's thickness) and orange (its orange share), given the slope and the hollows there
const _fo1={},_fo2={};
const MODEL={fieldsAt(x,z,sl,hollow,o){const W=wallAt(x,z,_fo1),P=pitAt(x,z,_fo2),dV=Math.hypot(x-VENT.x,z-VENT.z),F=fissAt(x,z),C=coneAt(x,z);
  o.face=Math.max(W.onScarp?W.face:0,P.onScarp&&P.depth>0?P.face:0);
  o.talus=Math.max(!W.onScarp&&W.scarp<TER_MAIN.S.length?smooth(Math.min(220,(TER_MAIN.S[W.scarp]||{h:0}).h*.36),0,W.toFoot):0,
   P.inside&&!P.onScarp&&P.d>=0?smooth(Math.min(120,(PIT.S[P.scarp]||{h:0}).h*.33),0,P.toFoot):0);
  o.rampart=Math.max(F.k,C.k);o.glass=P.depth>0?smooth(40,-60,P.d):0;   /* the pit's floor: a frozen lava lake's glassy skin */
  o.vent=Math.max(smooth(900,60,dV),F.crack*.8);
  /* the halo: tens of km round the vent (it reaches the rim), thicker near it, held in the hollows and on the benches, shed by
     every steep face; its orange share falls from the vent outward, banded ring by ring */
  const thick=.45+.55*Math.exp(-dV/2600)+.35*hollow;
  o.halo=clamp(thick*smooth(.95,.45,sl)*(1-.7*o.rampart),0,1);
  const band=fb(dV/260,Math.atan2(z-VENT.z,x-VENT.x)*1.1+dV/1900,2,WORLD+11),ring=smooth(.4,.68,band);
  o.orange=clamp(.95*Math.exp(-dV/1500)+.4*ring*smooth(5200,900,dV)+.25*hollow-.22,0,1);return o;},
 /* once the field is baked (terrainH exists): the vent's heights, the portal */
 after(){{const C=VENT,base=terrainH(C.x+C.r*1.2,C.z);C.base=base;C.lavaY=terrainH(C.x,C.z)+6;C.top=base+C.h;}   /* the lava stands 6 m deep in the throat's bottom */
  PORTAL=(function(){const t=1350,ds0=Math.sqrt(Math.pow(CALD.foot+TER_MAIN.S.reduce((a,q)=>a+q.run,0)+TER_MAIN.B.reduce((a,b)=>a+b.w,0),2)-t*t);
 /* the crest along the radial line through t: the highest ground within 300 m of the rim's nominal place, then 14 m out onto it */
 let best=-1e9,bs=0;for(let k=-60;k<=60;k++){const s=CALD.sC+ds0+k*5,p=xzOf(s,t),y=terrainH(p[0],p[1]);if(y>best){best=y;bs=s;}}
 const p=xzOf(bs+14,t),c=xzOf(CALD.sC,0),ry=Math.atan2(c[0]-p[0],c[1]-p[1]);   // its face toward the caldera's centre (local +z)
 return{x:p[0],z:p[1],y:terrainH(p[0],p[1]),ry,w:14,h:11,d:9,crest:best,name:'A sealed portal (the Ancients\' tunnels from Pluton come out here)',
  tags:{culture:'ancient',type:['infrastructure'],sealed:true,placeholder:'the Pluton settlement plan dresses it'}};})();}};
var PORTAL=null;
// ---------------------------------------------------------------- the portal (PLAN.md section 6)
// The Ancients' tunnels from Pluton come out on the caldera's rim: a sealed portal, its face turned into the caldera. Its
// place on the rim stays as built (the owner, 2026-10-26): on the wall station's stretch of the rim, as a record first
