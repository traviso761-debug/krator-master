// ================================================================= DALAB CITY — the placement engine
// Occupancy (rotated footprints in a spatial hash), ground tests against the painted mask (roads, plazas, fields
// and water are all blocked, so a building can never sit on a street), street-facing alignment (the front of every
// def is +z; ry is the outward normal of the nearest road), and the frontage walker that fills the streets.
reseed(SEED_CITY+4);
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
// ground test: buildable at the corners, edge midpoints and centre (a 3x3 inside too for big plots); not in a precinct; not water
function groundOK(o,opt){opt=opt||{};const g=opt.grow||0,hx=o.hx+g,hz=o.hz+g;const pts=[];const nx=Math.max(1,Math.ceil(hx/4)),nz=Math.max(1,Math.ceil(hz/4));   /* every plot sampled on a ~4 m grid, corners included: a lane's end used to slip between the corners and the edge midpoints (round 10) */
 for(let i=-nx;i<=nx;i++)for(let j=-nz;j<=nz;j++)pts.push(loc(o.x,o.z,i/nx*hx,j/nz*hz,o.ry));
 const W=CITY.WORLD/2-30;for(const p of pts){if(Math.abs(p[0])>W||Math.abs(p[1])>W)return false;if(!opt.ignoreMask&&!canBuild(p[0],p[1]))return false;if(!opt.ignoreOak&&inOakCorridor(p[0],p[1]))return false;if(!opt.ignorePrecinct&&inPrecinct(p[0],p[1],opt.ppad||0))return false;if(isWater(p[0],p[1]))return false;}
 return true;}
function groundY(o){let y=1e9;for(const p of obbCorners(o,-.5))y=Math.min(y,terrainH(p[0],p[1]));y=Math.min(y,terrainH(o.x,o.z));return y-.06;}
// STREET ALIGNMENT: the outward normal of the nearest road at the plot, so the door faces the street
// a plot under an oak vault is no plot: the corridor either side of every oak road (the oaks stand 12.5 m off the line)
function inOakCorridor(x,z,pad){const n=nearestRoadPt(x,z,r=>r.oak);return !!(n&&n.d<n.road.w/2+10+1.5+(pad||0));}
// the door faces a side street when one is near, the avenue only when nothing else is
function faceRoadRy(x,z,filter){let n=nearestRoadPt(x,z,r=>!r.oak&&(!filter||filter(r)));if(!n||n.d>45)n=nearestRoadPt(x,z,filter);if(!n)return 0;return Math.atan2(n.x-x,n.z-z);}
function findSpot(hx,hz,tx,tz,opt){opt=opt||{};const R=opt.R||90,step=opt.step||8;const tries=[[tx,tz]];
 for(let r=step;r<=R;r+=step){const n=Math.max(6,Math.round(TAU*r/step));for(let i=0;i<n;i++){const a=i/n*TAU+r*.37;tries.push([tx+r*Math.cos(a),tz+r*Math.sin(a)]);}}
 for(const t of tries){const ry=opt.ry!=null?opt.ry:faceRoadRy(t[0],t[1],opt.filter);const o={x:t[0],z:t[1],hx,hz,ry,pad:opt.pad==null?1.5:opt.pad};
  if(groundOK(o,opt)&&occFree(o,o.pad))return o;}return null;}
// ---------------------------------------------------------------- placing a def
const PLACED=[];const LANDMARKS=[];
function placeDef(key,o,opt){opt=opt||{};const D=VERN.defs[key];if(!D){reportErr('placeDef: no def '+key);return null;}const sc=opt.scale||1;o.hx=D.w/2*sc;o.hz=D.d/2*sc;const y=opt.y!=null?opt.y:groundY(o);
 TSTAT.cur=key+'/'+(opt.v|0);const r0=REG.length;const G=VERN.place(scene,key,o.x,o.z,o.ry,{v:opt.v|0,scale:sc,y,lit:opt.lit});TSTAT.cur=null;
 o.built=key;o.settle=opt.settle||null;occAdd(o);PLACED.push({key,o});footprint(obbCorners(o,.6));
 if(opt.landmark){LANDMARKS.push({name:opt.landmark,x:o.x,z:o.z});let best=null;for(let i=r0;i<REG.length;i++){const r=REG[i];if(!best||r.r>best.r)best=r;}if(best){best.tags=Object.assign({},best.tags,{landmark:true});best.name=opt.landmark;}}
 return G;}
// place near a target, facing the nearest street (ANTI-OVERLAP: spiral out until free); returns the OBB or null
function placeNear(key,tx,tz,opt){opt=opt||{};const D=VERN.defs[key];if(!D)return null;const sc=opt.scale||1;const o=findSpot(D.w/2*sc+(opt.grow||1),D.d/2*sc+(opt.grow||1),tx,tz,{R:opt.R||120,step:opt.step||9,ry:opt.ry,filter:opt.filter,pad:opt.pad,ppad:opt.ppad,ignoreMask:opt.ignoreMask,ignorePrecinct:opt.ignorePrecinct,ignoreOak:opt.ignoreOak});
 if(!o)return null;o.hx=D.w/2*sc;o.hz=D.d/2*sc;placeDef(key,o,opt);return o;}
// the FRONTAGE WALKER: along a road, every `pitch` metres, a lot on each side set back `setback` from the edge; the
// plot faces the road; picks a key from `pick(t,side)`; stops when `max` placed. Returns the count.
function frontage(R,pitch,setback,pick,max,opt){opt=opt||{};let n=0;const P=R.pts;let carry=pitch*rng();
 for(let i=0;i<P.length-1&&n<max;i++){const a=P[i],b=P[i+1];const L=Math.hypot(b[0]-a[0],b[1]-a[1]);if(L<1)continue;const ux=(b[0]-a[0])/L,uz=(b[1]-a[1])/L;
  for(let d=carry;d<L&&n<max;d+=pitch){for(const side of[-1,1]){if(n>=max)break;const key=pick(d/L,side);if(!key)continue;const D=VERN.defs[key];if(!D)continue;
   const hx=D.w/2,hz=D.d/2;const off=R.w/2+(R.oak?Math.max(setback,12):setback)+hz;/* an avenue's houses stand back past the oaks */const cx=a[0]+ux*d+(-uz)*side*off,cz=a[1]+uz*d+ux*side*off;
   const ry=Math.atan2((a[0]+ux*d)-cx,(a[1]+uz*d)-cz);   // face the road: the door toward the road's centreline
   const o={x:cx,z:cz,hx:hx+1,hz:hz+1,ry,pad:1.5};if(!groundOK(o,{ppad:2})||!occFree(o,1.5))continue;
   o.hx=hx;o.hz=hz;placeDef(key,o,Object.assign({settle:opt.settle},opt.each?opt.each(key):{}));n++;}}
  carry=(carry+Math.ceil((L-carry)/pitch)*pitch)-L;}
 return n;}
// a bridge: planks over the channel where a road crosses it
function dnBridge(b){const c=vC(0x6a5a44);const L=(channelD(b.x,b.z).w||8)+6;const y=terrainH(b.x+Math.sin(b.ry)*L,b.z+Math.cos(b.ry)*L);
 kput('vWood',[b.x,WATER_Y+.9,b.z],qEuler(0,b.ry,0),[Math.min(b.w,10),.3,L],c);for(const sd of[-1,1]){const p=loc(b.x,b.z,sd*Math.min(b.w,10)/2,0,b.ry);kput('vWood',[p[0],WATER_Y+1.5,p[1]],qEuler(0,b.ry,0),[.12,.9,L],c);}
 for(let k=-1;k<=1;k++){const p=loc(b.x,b.z,0,k*L*.4,b.ry);for(const sd of[-1,1]){const q=loc(p[0],p[1],sd*Math.min(b.w,10)*.45,0,b.ry);kput('vPostB',[q[0],WATER_Y-1,q[1]],null,[.16,2.2,.16],c);}}}
// ---------------------------------------------------------------- the Ancient lab, through a VERN wrapper (as Iziz wraps its Ancient guilds)
function buildDalabLab(G,o){reseed(8901);const r0=VERN.cur.r0;let H=null;const lush=BIOME.lush;BIOME.lush=0;   // no hypertree overgrowth: the lowlands biome dresses the compound
 try{H=withFlatGround(()=>buildDalab(G,0,0,1));}catch(e){reportErr('lab: '+e.stack);}finally{BIOME.lush=lush;KOFF=[0,0,0];}
 vnAdoptREG(r0,n=>n,{type:['civic','religious'],wealth:'civic',lit:true,ancient:true});
 // the great dome's registration becomes the landmark
 for(let i=r0;i<REG.length;i++)if(/great dome/.test(REG[i].name)){REG[i].tags.landmark=true;REG[i].name='The God — the Ancient lab';}
 return H;}
dDef({key:'dalab_lab',name:'The Ancient lab',family:'ancient',tags:{type:['civic','religious'],wealth:'civic',lit:true,landmark:true,ancient:true},w:600*4.105*.4/1,d:600*4.105*.4,h:390*4.105*.4,build:buildDalabLab});
