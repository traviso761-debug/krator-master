// ================================================================= EREWHON — the placement engine
// Occupancy (rotated footprints in a spatial hash), ground tests against the painted mask, the plot's stance on a
// slope (the kit's footing fills under a building whose base stands at the uphill grade), and the PLAN: buildings are
// only described here (key, plot, variant, drop); 90b builds them chunk by chunk so each chunk bakes into its own
// meshes for the runtime LOD.
const OCC={cell:40,hash:{},list:[]};
function occKey(ix,iz){return ix+','+iz;}
function occCells(o){const R=Math.hypot(o.hx,o.hz)+(o.pad||0);const out=[];for(let iz=Math.floor((o.z-R)/OCC.cell);iz<=Math.floor((o.z+R)/OCC.cell);iz++)for(let ix=Math.floor((o.x-R)/OCC.cell);ix<=Math.floor((o.x+R)/OCC.cell);ix++)out.push(occKey(ix,iz));return out;}
function obbOverlap(a,b,pad){pad=pad||0;const axes=[[Math.cos(a.ry),-Math.sin(a.ry)],[Math.sin(a.ry),Math.cos(a.ry)],[Math.cos(b.ry),-Math.sin(b.ry)],[Math.sin(b.ry),Math.cos(b.ry)]];const dx=b.x-a.x,dz=b.z-a.z;
 for(const ax of axes){const proj=dx*ax[0]+dz*ax[1];const ra=Math.abs(Math.cos(a.ry)*ax[0]-Math.sin(a.ry)*ax[1])*a.hx+Math.abs(Math.sin(a.ry)*ax[0]+Math.cos(a.ry)*ax[1])*a.hz;
  const rb=Math.abs(Math.cos(b.ry)*ax[0]-Math.sin(b.ry)*ax[1])*b.hx+Math.abs(Math.sin(b.ry)*ax[0]+Math.cos(b.ry)*ax[1])*b.hz;if(Math.abs(proj)>ra+rb+pad)return false;}return true;}
function occFree(o,pad){const seen={};for(const k of occCells(o)){const L=OCC.hash[k];if(!L)continue;for(const q of L){if(seen[q.id])continue;seen[q.id]=1;if(obbOverlap(o,q,pad||0))return false;}}return true;}
function occAdd(o){o.id=OCC.list.length;OCC.list.push(o);for(const k of occCells(o))(OCC.hash[k]||(OCC.hash[k]=[])).push(o);return o;}
function obbCorners(o,grow){const g=grow||0;const c=Math.cos(o.ry),s=Math.sin(o.ry);return[[-1,-1],[1,-1],[1,1],[-1,1]].map(k=>[o.x+k[0]*(o.hx+g)*c+k[1]*(o.hz+g)*s,o.z-k[0]*(o.hx+g)*s+k[1]*(o.hz+g)*c]);}
function groundOK(o,opt){opt=opt||{};const pts=obbCorners(o,opt.grow||0);pts.push([o.x,o.z]);for(let i=0;i<4;i++)pts.push([(pts[i][0]+pts[(i+1)%4][0])/2,(pts[i][1]+pts[(i+1)%4][1])/2]);
 for(const p of pts){if(!onMap(p[0],p[1],10))return false;if(!opt.ignoreMask&&!canBuild(p[0],p[1]))return false;if(!opt.ignorePrecinct&&inPrecinct(p[0],p[1],opt.ppad||0))return false;}return true;}
// the stance: the base at the highest corner, the footing dropping to the lowest; null when the drop is past what a footing can carry
function stance(o,maxDrop){let lo=1e9,hi=-1e9;for(const p of obbCorners(o,-.5)){const h=terrainH(p[0],p[1]);lo=Math.min(lo,h);hi=Math.max(hi,h);}const hc=terrainH(o.x,o.z);lo=Math.min(lo,hc);hi=Math.max(hi,hc);
 const drop=hi-lo;if(drop>(maxDrop||14))return null;return{y:hi+.05,drop:drop+.6};}
// ---------------------------------------------------------------- the plan
const PLAN=[];const CHUNKS={};
function chunkKey(x,z){return Math.floor(x/ER.CHUNK)+','+Math.floor(z/ER.CHUNK);}
function plan(key,x,z,ry,o,extra){const D=VERN.defs[key];if(!D){reportErr('plan: no def '+key);return null;}const P=Object.assign({key,x,z,ry:ry||0,o:o||{},ck:(extra&&extra.landmark)?'landmark':chunkKey(x,z)},extra||{});PLAN.push(P);(CHUNKS[P.ck]||(CHUNKS[P.ck]=[])).push(P);return P;}
// a def's footprint half-sizes (fw/fd are the footing footprint; fall back to the plot)
function halfOf(D){return{hx:(D.fw||D.w*.9)/2,hz:(D.fd||D.d*.9)/2};}
// place a def facing a road point: the plot centre is set back from the road by its half depth, the front (+z) toward the road
function planFront(key,rx,rz,nx,nz,opt){opt=opt||{};const D=VERN.defs[key];if(!D)return null;const H=halfOf(D);const gap=opt.gap==null?1.2:opt.gap;
 const cx=rx-nx*(H.hz+gap),cz=rz-nz*(H.hz+gap);const ry=Math.atan2(nx,nz);const o={x:cx,z:cz,hx:H.hx,hz:H.hz,ry,pad:opt.pad==null?1.0:opt.pad};
 if(!groundOK(o,Object.assign({grow:-1.2},opt))||!occFree(o,o.pad))return null;const st=stance(o,opt.maxDrop||12);if(!st)return null;
 occAdd(o);const v=opt.v!=null?opt.v:Math.floor(rng()*(D.nv||3));const P=plan(key,cx,cz,ry,{v,drop:st.drop,y:st.y,lit:opt.lit},{h:D.h||8,obb:o,wealth:opt.wealth});if(P){P.y=st.y;P.front=[rx,rz];footprint(obbCorners(o,.3));}return P;}
// a landmark at a levelled pad: flattens a disc, marks a precinct, plans it in the always-drawn chunk
function planLandmark(key,x,z,ry,opt){opt=opt||{};const D=VERN.defs[key];if(!D)return null;const H=halfOf(D);const r=Math.hypot(H.hx,H.hz)*(opt.rk||1.0);
 const y=opt.y!=null?opt.y:terrainBase(x,z)+(opt.dy||0);cityFlat(x,z,r+2,opt.apron||Math.max(10,r*.5),y);
 const o={x,z,hx:H.hx,hz:H.hz,ry:ry||0,pad:2};occAdd(o);precinct(x,z,r+(opt.ppad||6),D.name);BIO_OBSTACLES.push({x,z,r:r+4});
 const P=plan(key,x,z,ry,Object.assign({v:opt.v||0,y},opt.o||{}),{landmark:true,h:D.h||10,obb:o});P.y=y;footprint(obbCorners(o,.5));return P;}
