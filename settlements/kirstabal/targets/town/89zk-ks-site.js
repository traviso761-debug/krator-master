// ================================================================= KIRSTABAL — the site on the page: the ground, the town, the ring
// Runs after every kit def is registered and before the scene (90-scene). The ground every builder and the camera read is
// KS_GROUND.h (src/40-ks-ground.js); the town is KS_TOWN.make (src/41-ks-town.js: core/city) and the ring's villages
// KS_RING.make (src/42-ks-ring.js: core/hamlet), both with the Xanadu kit's boxes (VERN.defs). Each record is seated on its
// ground (its base at the highest corner, a footing down to the lowest: Erewhon's stance) and listed for 90l to draw. The
// lake's nine villages stand 25-115 km off and are records for the open world (K6), not drawn here. Records only: no drawing.
terrainH=function(x,z){return KS_GROUND.h(x,z);};
KTAGS.page=KTAGS.page||KTAGS.create({build:'kirstabal'});
const ksD=(x,d)=>x==null?d:x;   /* a numeric default: 0 is a value */
const ksDims=(key,v)=>{const D=VERN.defs[key];return D?{key,v:ksD(v,0),w:D.w,d:D.d,h:ksD(D.h,8),fw:D.fw||D.w,fd:D.fd||D.d}:null;};
let KS_PLAN=null,KS_ERR=null,KS_RINGV=[];
try{KS_PLAN=KS_TOWN.make({dims:ksDims});}catch(e){KS_ERR=e;reportErr('kirstabal: the town did not lay: '+(e&&e.stack||e));}
try{KS_RINGV=KS_RING.make({dims:ksDims,which:'ring'});}catch(e){reportErr('kirstabal: the ring did not lay: '+(e&&e.stack||e));}
/* the stance: a piece's base at the highest corner of its footprint on the ground, its footing (o.drop) to the lowest */
const ksStance=(r)=>{if(r.fixedY!=null)return{y:r.fixedY,drop:0};const c=Math.cos(r.ry),s=Math.sin(r.ry),hw=ksD(r.fw,r.w)/2,hd=ksD(r.fd,r.d)/2;let lo=1e9,hi=-1e9;
 for(const [a,b] of [[-1,-1],[1,-1],[1,1],[-1,1],[0,0]]){const x=r.x+a*hw*c+b*hd*s,z=r.z-a*hw*s+b*hd*c,y=KS_GROUND.h(x,z);lo=Math.min(lo,y);hi=Math.max(hi,y);}
 return{y:hi+.05,drop:Math.max(0,hi-lo)+.3};};
/* what 90l places: {key, x, z, ry, o: {v, y, drop}, h, kind, id} */
const KS_PLACE=[];
if(KS_PLAN){
 for(const r of KS_PLAN.lots){const st=ksStance(r);KS_PLACE.push({key:r.key,x:r.x,z:r.z,ry:r.ry,o:{v:r.v,y:st.y,drop:st.drop},kind:r.cls==='landmark'?'landmark':r.civic?'civic':'lot',cls:r.cls,id:r.id,h:ksD(r.h,10),people:r.people});}
 const WET=new Set(['quay','mole','lighthouse','boat','bridge']);   /* on the water or over the river: their own level */
 for(const r of KS_PLAN.extra){const st=WET.has(r.kind)?{y:r.y,drop:r.kind==='boat'?0:Math.max(0,r.y-KS_GROUND.h(r.x,r.z))+.3}:ksStance(r);
  KS_PLACE.push({key:r.key,x:r.x,z:r.z,ry:r.ry,o:{v:r.v,y:st.y,drop:r.kind==='boat'||r.kind==='bridge'?0:st.drop},kind:r.kind,id:r.id,h:ksD(r.h,10),people:r.people});}}
for(const V of KS_RINGV)for(const r of (V.records||[])){const D=ksDims(r.key,0)||{w:r.w,d:r.d,fw:r.w,fd:r.d};const q=Object.assign({},r,{fw:D.fw,fd:D.fd}),st=ksStance(q);
 KS_PLACE.push({key:r.key,x:r.x,z:r.z,ry:r.ry,o:{v:0,y:st.y,drop:st.drop},kind:'ring',village:V.id,id:'ring:'+r.id,h:ksD(r.h,8),pending:!!r.pending,w:r.w,d:r.d});}
window._kirstabalPlan={err:KS_ERR?String(KS_ERR):null,place:KS_PLACE.length,lots:KS_PLAN?KS_PLAN.lots.length:0,extra:KS_PLAN?KS_PLAN.extra.length:0,
 people:KS_PLAN?KS_PLAN.census.people:0,ways:KS_PLAN?KS_PLAN.ways.length:0,ring:KS_RINGV.map(V=>({id:V.id,error:V.error||null,records:(V.records||[]).length,pop:V.census&&V.census.pop}))};
/* the flora's mask (the vendored Vale of Xanadu biome Xanadu's page carries: a stand-in until the Rift floor's Af biome is bound,
   KNOWN_ISSUES.md), from the records, never from pixels: the country wild (1) but the water, the ways, the zone's made ground
   (the odd tree, .05) and every building's footprint */
const KS_SPACE=KCITY.lib.KSPACE.create({cell:40});
for(const p of KS_PLACE){const D=VERN.defs[p.key];if(D)KS_SPACE.insert(p,p.x,p.z,Math.hypot(D.fw||D.w,D.fd||D.d)/2+2);}
const KS_WAYS=KCITY.lib.KSPACE.create({cell:40});
if(KS_PLAN)for(const w of KS_PLAN.ways.concat(KS_PLAN.roads))for(let i=1;i<w.pts.length;i++){const a=w.pts[i-1],b=w.pts[i];KS_WAYS.insert({a,b,w:w.w},(a[0]+b[0])/2,(a[1]+b[1])/2,Math.hypot(b[0]-a[0],b[1]-a[1])/2+w.w);}
function ksBioMask(x,z){if(KS_GROUND.h(x,z)<1.2)return 0;
 for(const s of KS_WAYS.query(x,z,1))if(KCITY.lib.segDist([x,z],s.a,s.b)<s.w/2+2)return 0;
 for(const p of KS_SPACE.query(x,z,1)){const D=VERN.defs[p.key];if(Math.hypot(x-p.x,z-p.z)<Math.hypot(D.fw||D.w,D.fd||D.d)/2+2)return 0;}
 const v=KS_GROUND.v(x,z),u=KS_GROUND.u(x,z);if(u>-760&&u<820&&v<60)return 0;   /* the beach, the quays and the quay street: open */
 if(u>-580&&u<680&&v>20&&v<660)return .05;return 1;}
if(typeof BIO!=='undefined'&&BIO.host){Object.assign(BIO.host,{mask:ksBioMask,origin:[[0,0],[-1200,1600],[1600,1400]],center:[200,400],
 fields:{wet:(x,z)=>Math.min(1,.7+Math.max(0,1-Math.abs(KS_GROUND.v(x,z))/250)*.25),salt:()=>0,upland:()=>0,flow:()=>0,mist:()=>0}});}
