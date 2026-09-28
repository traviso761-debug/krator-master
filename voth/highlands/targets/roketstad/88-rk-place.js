// ================================================================= ROKETSTAD — occupancy, the big plots, the chaotic street fabric
// (occupancy and ground tests after the Iziz city's 88-city-place.js) Buildings are only DESCRIBED here (PLOTS); 90b
// builds them once the scene exists. Order: the civic and forge plots are reserved round the squares and in the east
// sector FIRST, then the street fabric grows round them, so the big buildings stand in the town rather than on it.
cityBakeMasks();
// ---------------------------------------------------------------- occupancy
const OCC={cell:40,hash:{},list:[]};
function occKey(ix,iz){return ix+','+iz;}
function occCells(o){const R=Math.hypot(o.hx,o.hz)+(o.pad||0);const out=[];for(let iz=Math.floor((o.z-R)/OCC.cell);iz<=Math.floor((o.z+R)/OCC.cell);iz++)for(let ix=Math.floor((o.x-R)/OCC.cell);ix<=Math.floor((o.x+R)/OCC.cell);ix++)out.push(occKey(ix,iz));return out;}
function obbOverlap(a,b,pad){pad=pad||0;const axes=[[Math.cos(a.ry),-Math.sin(a.ry)],[Math.sin(a.ry),Math.cos(a.ry)],[Math.cos(b.ry),-Math.sin(b.ry)],[Math.sin(b.ry),Math.cos(b.ry)]];
 const dx=b.x-a.x,dz=b.z-a.z;
 for(const ax of axes){const proj=dx*ax[0]+dz*ax[1];
  const ra=Math.abs((Math.cos(a.ry)*ax[0]-Math.sin(a.ry)*ax[1]))*a.hx+Math.abs((Math.sin(a.ry)*ax[0]+Math.cos(a.ry)*ax[1]))*a.hz;
  const rb=Math.abs((Math.cos(b.ry)*ax[0]-Math.sin(b.ry)*ax[1]))*b.hx+Math.abs((Math.sin(b.ry)*ax[0]+Math.cos(b.ry)*ax[1]))*b.hz;
  if(Math.abs(proj)>ra+rb+pad)return false;}return true;}
function occFree(o,pad){const seen={};for(const k of occCells(o)){const L=OCC.hash[k];if(!L)continue;for(const q of L){if(seen[q.id])continue;seen[q.id]=1;if(obbOverlap(o,q,pad||0))return false;}}return true;}
function occAdd(o){o.id=OCC.list.length;OCC.list.push(o);for(const k of occCells(o))(OCC.hash[k]||(OCC.hash[k]=[])).push(o);return o;}
function obbCorners(o,grow){const g=grow||0;const c=Math.cos(o.ry),s=Math.sin(o.ry);return[[-1,-1],[1,-1],[1,1],[-1,1]].map(k=>[o.x+k[0]*(o.hx+g)*c+k[1]*(o.hz+g)*s,o.z-k[0]*(o.hx+g)*s+k[1]*(o.hz+g)*c]);}
// ground test: buildable at the corners, edge midpoints and centre; not in a precinct; `town` = inside the wall band
function groundOK(o,opt){opt=opt||{};const pts=obbCorners(o,opt.grow||0);pts.push([o.x,o.z]);for(let i=0;i<4;i++)pts.push([(pts[i][0]+pts[(i+1)%4][0])/2,(pts[i][1]+pts[(i+1)%4][1])/2]);
 for(const p of pts){if(Math.abs(p[0])>RK.WORLD/2-30||Math.abs(p[1])>RK.WORLD/2-30)return false;
  if(opt.town&&!insideWall(p[0],p[1],opt.margin==null?16:opt.margin))return false;
  if(opt.outside&&insideWall(p[0],p[1],-18))return false;
  if(!opt.ignoreMask&&!canBuild(p[0],p[1]))return false;if(!opt.ignorePrecinct&&inPrecinct(p[0],p[1],opt.ppad||0))return false;}
 return true;}
function groundY(o){let y=1e9;for(const p of obbCorners(o,-.5))y=Math.min(y,terrainH(p[0],p[1]));y=Math.min(y,terrainH(o.x,o.z));return y-.08;}
// the slope under a footprint (m of fall across it) — a big building on a steep bit gets its plot levelled
function plotFall(o){let lo=1e9,hi=-1e9;for(const p of obbCorners(o,0).concat([[o.x,o.z]])){const h=terrainH(p[0],p[1]);lo=Math.min(lo,h);hi=Math.max(hi,h);}return hi-lo;}
// spiral out from a target until a footprint fits; faceRoad turns the front (+z) to the nearest road, faceAt to a point
function findSpot(hx,hz,tx,tz,ry,opt){opt=opt||{};const R=opt.R||90,step=opt.step||8;const tries=[[tx,tz]];
 for(let r=step;r<=R;r+=step){const n=Math.max(6,Math.round(TAU*r/step));for(let i=0;i<n;i++){const a=i/n*TAU+r*.37;tries.push([tx+r*Math.cos(a),tz+r*Math.sin(a)]);}}
 for(const t of tries){const o={x:t[0],z:t[1],hx,hz,ry,pad:opt.pad==null?1.5:opt.pad};
  if(opt.faceAt)o.ry=Math.atan2(opt.faceAt[0]-t[0],opt.faceAt[1]-t[1]);
  else if(opt.faceRoad){const n=nearestRoadPt(t[0],t[1]);if(n)o.ry=Math.atan2(n.x-t[0],n.z-t[1]);}
  if(groundOK(o,opt)&&occFree(o,o.pad))return o;}return null;}
// ---------------------------------------------------------------- the plots (built in 90b in this order)
const PLOTS=[];   // {key,o,opt}
// reclaimed where the kit has a twin (Travis: "predominately reclaimed versions in this build")
const RECLAIM=.78;
function kitKey(key){const t=key+'_reclaimed',D=VERN.defs[key];if(D&&D.tags.wealth==='rich')return key;   // wealthy houses never take metal roofs
 return VERN.defs[t]&&rng()<RECLAIM?t:key;}
function plot(key,o,opt){o.key=key;occAdd(o);footprint(obbCorners(o,.8));PLOTS.push({key,o,opt:opt||{}});return o;}
// reserve a plot for a def near (tx,tz): front toward `face` (a point) or the nearest road
function reserve(key,tx,tz,opt){opt=opt||{};const D=VERN.defs[key];if(!D){reportErr('no def '+key);return null;}const sc=opt.scale||1;
 const o=findSpot(D.w/2*sc+1,D.d/2*sc+1,tx,tz,0,Object.assign({R:opt.R||120,step:opt.step||7,pad:opt.pad==null?2:opt.pad,faceRoad:!opt.face,faceAt:opt.face,town:opt.town!==false,ppad:1},opt.spot||{}));
 if(!o){reportErr('no room for '+key+' near '+(tx|0)+','+(tz|0));return null;}o.hx-=1;o.hz-=1;return plot(key,o,opt);}
// facing the centre of a square, on its rim, at bearing a
function onSquare(key,sq,a,opt){const S=SQUARES[sq],D=VERN.defs[key];const r=S.r+D.d/2+3;return reserve(key,S.x+r*Math.cos(a),S.z+r*Math.sin(a),Object.assign({face:[S.x,S.z],R:40,step:5},opt||{}));}
(function reserveCivic(){reseed(SEED_RK+4);const M=SQUARES.main,Mk=SQUARES.market,Tp=SQUARES.temple;
 // the main square: town hall to the north, barracks and the mustering ground to the east, the watch to the south
 onSquare('hl_rep_town_hall','main',-Math.PI/2-.25,{landmark:"Town hall"});
 onSquare('hl_rep_barracks','main',.35,{landmark:'Barracks'});
 {const b=PLOTS[PLOTS.length-1].o;reserve('hl_rep_muster',b.x+Math.cos(.35)*60,b.z+Math.sin(.35)*60+30,{R:110,landmark:'Mustering ground'});}
 onSquare('hl_rep_watch','main',Math.PI/2+.5,{});
 onSquare('hl_rep_guild_merc','main',Math.PI-.35,{landmark:'Mercenary Guild'});
 onSquare('hl_rep_inn','main',Math.PI/2-.55,{});
 // the market square: the market hall on it, the theatre and the Mechanics' Guild off it
 onSquare('hl_rep_market_hall','market',-.6,{});
 onSquare('hl_rep_theater','market',Math.PI-.4,{landmark:'Theatre'});
 onSquare('hl_rep_guild_mech','market',Math.PI*.55,{landmark:"Mechanics' Guild"});
 // the temple square: the Temple of the Pantheon, the school, the hospital, the Astronomers
 onSquare('hl_rep_temple','temple',Math.PI+.25,{landmark:'Temple of the Pantheon'});
 onSquare('hl_rep_school','temple',Math.PI/2+.2,{});
 {const p=townPt(2.1,245);reserve('hl_rep_hospital',p[0],p[1],{R:90});}
 {const p=townPt(-2.9,110);reserve('hl_rep_guild_astro',p[0],p[1],{R:90,landmark:"Astronomers' Guild"});}
 // by the gates: warehouses and the caravanserai / Farmers' Guild at the south (farm) gate
 {const p=townPt(RK.GATES.S-.35,wallR(RK.GATES.S)-60);reserve('hl_rep_guild_farm',p[0],p[1],{R:80,landmark:"Farmers' Guild"});}
 {const p=townPt(RK.GATES.N+.35,wallR(RK.GATES.N)-62);reserve(kitKey('hl_rep_stables'),p[0],p[1],{R:80});}
 for(const g of[RK.GATES.N-.3,RK.GATES.S+.33,RK.GATES.E+.5]){const p=townPt(g,wallR(g)-48);reserve(kitKey(rng()<.5?'hl_rep_warehouse_a':'hl_rep_warehouse_b'),p[0],p[1],{R:70});}
 // the forge district: the east sector — the Forgehouse by the wall, the guilds and the big smithies round it
 {const p=townPt(-.28,wallR(-.28)-66);reserve('hl_rep_forgehouse',p[0],p[1],{R:70,step:6,landmark:'The Forgehouse',spot:{margin:14}});}
 {const p=townPt(.42,245);reserve('hl_rep_guild_alch',p[0],p[1],{R:80,landmark:"Alchemists' Guild"});}
 {const p=townPt(-.05,185);reserve('hl_rep_guild_smith',p[0],p[1],{R:70,landmark:'Guild of Smiths'});}
 {const p=townPt(-.55,230);reserve('hl_rep_generator',p[0],p[1],{R:80});}
 for(const [a,r] of[[.2,205],[-.3,190],[.55,300]]){const p=townPt(a,r);reserve(kitKey('hl_rep_smithy_large'),p[0],p[1],{R:70});}
 for(const [a,r] of[[.1,290],[-.12,260],[.35,165],[-.45,300],[.62,215]]){const p=townPt(a,r);reserve(kitKey('hl_rep_smithy_small'),p[0],p[1],{R:50});}
})();
cityBakeMasks();
// ---------------------------------------------------------------- the chaotic street fabric
// Every point of the town should be within ~28 m of a street. Pick an unserved point, walk from the nearest street
// toward it and on past it with a wandering heading, and stop at the wall, a precinct, a plot, or another street
// (joining it). What comes out is a medieval tangle rather than a grid, and every street connects.
const STREETS={made:0,tries:0};
(function growStreets(){reseed(SEED_RK+5);const G=10;const pts=[];
 for(let x=TC.x-TC.R-40;x<=TC.x+TC.R+40;x+=G)for(let z=TC.z-TC.R-40;z<=TC.z+TC.R+40;z+=G){const jx=x+rr(-3,3),jz=z+rr(-3,3);if(!insideWall(jx,jz,26)||!canBuild(jx,jz)||inPrecinct(jx,jz,2))continue;pts.push([jx,jz]);}
 const served=p=>{const n=nearestRoadPt(p[0],p[1],null,40);return n&&n.d<23;};   // blocks ~45 m deep: a row each side and a yard between
 const blockedAt=(x,z)=>!insideWall(x,z,22)||inPrecinct(x,z,1)||!occFree({x,z,hx:3.5,hz:3.5,ry:0},0);
 let pool=pts.filter(p=>!served(p));
 for(let it=0;it<1400&&pool.length;it++){const p=pool[Math.floor(rng()*pool.length)];STREETS.tries++;
  const n=nearestRoadPt(p[0],p[1],null,400);if(!n){pool=pool.filter(q=>q!==p);continue;}
  let hd=Math.atan2(p[1]-n.z,p[0]-n.x);const path=[[n.x,n.z]];let x=n.x,z=n.z,len=0;const L=Math.hypot(p[0]-n.x,p[1]-n.z)+rr(30,110);let joined=false;
  // long straight-ish runs with bends between them: room for continuous rows of houses
  while(len<L){const seg=rr(20,34);hd+=len?rr(-.26,.26):0;const nx=x+Math.cos(hd)*seg,nz=z+Math.sin(hd)*seg;
   if(blockedAt(nx,nz)){break;}
   if(len>24){const m=nearestRoadPt(nx,nz,null,30);if(m&&m.d<9){path.push([m.x,m.z]);joined=true;break;}}
   x=nx;z=nz;len+=seg;path.push([x,z]);}
  let bx0=1e9,bx1=-1e9,bz0=1e9,bz1=-1e9;for(const q of path){bx0=Math.min(bx0,q[0]);bx1=Math.max(bx1,q[0]);bz0=Math.min(bz0,q[1]);bz1=Math.max(bz1,q[1]);}
  if(path.length>=3||joined&&path.length>=2){const w=rng()<.35?4.2:6;road(path,w,w<5?KL.lane:KL.street,{zone:'fabric'});STREETS.made++;
   pool=pool.filter(q=>q!==p&&!(q[0]>bx0-30&&q[0]<bx1+30&&q[1]>bz0-30&&q[1]<bz1+30&&served(q)));}
  else pool=pool.filter(q=>q!==p);}
 window._streets=STREETS.made;window._unserved=pool.length;cityBakeMasks();})();
