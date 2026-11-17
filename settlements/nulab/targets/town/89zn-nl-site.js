// ================================================================= NULAB — the site on the page: the ground, the town, the ring
// Runs after every kit def is registered and before the scene (90-scene). The ground every builder and the camera read is
// NL_GROUND.h (src/40-nl-ground.js); the town is NL_TOWN.make (src/41-nl-town.js: core/city) and the near ring NL_RING.make
// (src/42-nl-ring.js: core/hamlet's Dalab row), both with the Dalab set's boxes (VERN.defs) and the town's pending boxes. Each
// record is seated on its ground (Erewhon's stance: its base at the highest corner, a footing down to the lowest) and listed for
// 90o to draw. Records only: no drawing.
terrainH=function(x,z){return NL_GROUND.h(x,z);};
KTAGS.page=KTAGS.page||KTAGS.create({build:'nulab'});
const nlD=(x,d)=>x==null?d:x;   /* a numeric default: 0 is a value */
const nlDims=(key,v)=>{const D=VERN.defs[key];if(D)return{key,v:nlD(v,0),w:D.w,d:D.d,h:nlD(D.h,8),fw:D.fw||D.w,fd:D.fd||D.d};
 const P=NL_TOWN.PENDING[key];return P?{key,v:0,w:P.w,d:P.d,h:P.h,fw:P.w,fd:P.d,pending:true}:null;};
let NL_PLAN=null,NL_ERR=null,NL_RINGV=[];
try{NL_PLAN=NL_TOWN.make({dims:nlDims});}catch(e){NL_ERR=e;reportErr('nulab: the town did not lay: '+(e&&e.stack||e));}
try{NL_RINGV=NL_RING.make({dims:nlDims});}catch(e){reportErr('nulab: the ring did not lay: '+(e&&e.stack||e));}
/* the stance: a piece's base at the highest corner of its footprint on the ground, its footing (o.drop) to the lowest */
const nlStance=(r)=>{const c=Math.cos(r.ry),sn=Math.sin(r.ry),hw=nlD(r.fw,r.w)/2,hd=nlD(r.fd,r.d)/2;let lo=1e9,hi=-1e9;
 for(const [a,b] of [[-1,-1],[1,-1],[1,1],[-1,1],[0,0]]){const x=r.x+a*hw*c+b*hd*sn,z=r.z-a*hw*sn+b*hd*c,y=NL_GROUND.h(x,z);lo=Math.min(lo,y);hi=Math.max(hi,y);}
 return{y:hi+.05,drop:Math.max(0,hi-lo)+.3};};
/* a variant by the record's id (the set's pieces carry nv variants; the layout keeps v 0) */
function nlHash(s){let h=2166136261;for(let i=0;i<s.length;i++)h=Math.imul(h^s.charCodeAt(i),16777619)>>>0;return h;}
const nlV=(key,id,v)=>{const D=VERN.defs[key];const n=D&&D.nv>1?Math.min(D.nv,3):1;return v?v:nlHash(String(id)+key)%n;};
/* what 90o places: {key, x, z, ry, o: {v, y, drop}, h, kind, id, pending} */
const NL_PLACE=[];
if(NL_PLAN){
 for(const r of NL_PLAN.lots){const st=nlStance(r);NL_PLACE.push({key:r.key,x:r.x,z:r.z,ry:r.ry,o:{v:nlV(r.key,r.id,r.v),y:st.y,drop:st.drop},kind:r.cls==='landmark'?'landmark':r.civic?'civic':'lot',
  cls:r.cls,id:r.id,h:nlD(r.h,10),w:r.fw,d:r.fd,people:r.people,name:r.name,quarter:r.quarter,pending:!VERN.defs[r.key]});}
 for(const r of NL_PLAN.extra){const st=r.kind==='harbour'&&r.y!=null?{y:r.y,drop:Math.max(0,r.y-NL_GROUND.h(r.x,r.z))+.3}:nlStance(r);
  NL_PLACE.push({key:r.key,x:r.x,z:r.z,ry:r.ry,o:{v:0,y:st.y,drop:st.drop},kind:r.kind,id:r.id,h:nlD(r.h,10),w:r.fw,d:r.fd,people:r.people,name:r.name,pending:!VERN.defs[r.key]});}}
for(const V of NL_RINGV)for(const r of (V.records||[])){const D=nlDims(r.key,0)||{w:r.w,d:r.d,fw:r.w,fd:r.d};const q=Object.assign({},r,{fw:D.fw,fd:D.fd});
 const st=r.key==='nl_jetty'?{y:NL_GROUND.LAKE+1.4,drop:Math.max(0,NL_GROUND.LAKE+1.4-NL_GROUND.h(r.x,r.z))+.3}:nlStance(q);   /* a landing's jetty at its deck's level, over the water */
 NL_PLACE.push({key:r.key,x:r.x,z:r.z,ry:r.ry,o:{v:nlV(r.key,r.id,0),y:st.y,drop:st.drop},kind:'ring',village:V.id,id:'ring:'+r.id,h:nlD(r.h,8),w:D.fw,d:D.fd,pending:!VERN.defs[r.key]});}
window._nulabPlan={err:NL_ERR?String(NL_ERR):null,place:NL_PLACE.length,lots:NL_PLAN?NL_PLAN.lots.length:0,extra:NL_PLAN?NL_PLAN.extra.length:0,
 people:NL_PLAN?NL_PLAN.census.people:0,byQuarter:NL_PLAN?NL_PLAN.census.byQuarter:{},ways:NL_PLAN?NL_PLAN.ways.length:0,
 ring:NL_RINGV.map(V=>({id:V.id,error:V.error||null,records:(V.records||[]).length,pop:V.census&&V.census.pop,parcels:V.farm&&V.farm.parcels?V.farm.parcels.length:0})),
 pin:{model:+NL_GROUND.model(NL_GROUND.PIN[0],NL_GROUND.PIN[1]).toFixed(1),drawn:+NL_GROUND.h(NL_GROUND.PIN[0],NL_GROUND.PIN[1]).toFixed(1)}};
/* the fields: the ring's farmland parcels (KHAMLET.farmland records: in crop, resting, a farmhouse's yard), indexed for the paint
   and the flora's mask */
const NL_FIELDS=[];
for(const V of NL_RINGV)if(V.farm&&V.farm.parcels)for(const p of V.farm.parcels){const ps=p.size/2-2;NL_FIELDS.push({id:p.id,box:[p.x-ps,p.z-ps,p.x+ps,p.z+ps],kind:p.state==='crop'?(p.kind==='orchard'?'orchard':'crop'):p.state==='yard'?'yard':'fallow',crop:p.crop});}
const NL_FIELDX=KCITY.lib.KSPACE.create({cell:200});for(const f of NL_FIELDS)NL_FIELDX.insert(f,(f.box[0]+f.box[2])/2,(f.box[1]+f.box[3])/2,60);
const nlFieldAt=(x,z)=>{for(const f of NL_FIELDX.query(x,z,1))if(x>f.box[0]&&x<f.box[2]&&z>f.box[1]&&z<f.box[3])return f;return null;};
/* the flora's mask, from the records, never from pixels: the country wild (1) but the water, the ways, every building's
   footprint and its clearing, the quays, the town's zones (the odd tree, .06), the fields (none in crop; a few in the fallow) */
const NL_SPACE=KCITY.lib.KSPACE.create({cell:40});
for(const p of NL_PLACE)NL_SPACE.insert(p,p.x,p.z,Math.hypot(nlD(p.w,10),nlD(p.d,10))/2+(p.kind==='ring'?3:6));
const NL_WAYS=KCITY.lib.KSPACE.create({cell:40});
if(NL_PLAN)for(const w of NL_PLAN.ways.concat(NL_PLAN.roads))for(let i=1;i<w.pts.length;i++){const a=w.pts[i-1],b=w.pts[i];NL_WAYS.insert({a,b,w:w.w},(a[0]+b[0])/2,(a[1]+b[1])/2,Math.hypot(b[0]-a[0],b[1]-a[1])/2+w.w);}
for(const V of NL_RINGV)for(const l of V.lanes||[])for(let i=1;i<(l.pts||[]).length;i++){const a=l.pts[i-1],b=l.pts[i];NL_WAYS.insert({a,b,w:l.w==null?4:l.w},(a[0]+b[0])/2,(a[1]+b[1])/2,Math.hypot(b[0]-a[0],b[1]-a[1])/2+6);}
const nlInPoly=(P,x,z)=>{let c=false;for(let i=0,j=P.length-1;i<P.length;j=i++){const a=P[i],b=P[j];if((a[1]>z)!==(b[1]>z)&&x<(b[0]-a[0])*(z-a[1])/(b[1]-a[1])+a[0])c=!c;}return c;};
function nlBioMask(x,z){if(NL_GROUND.h(x,z)<NL_GROUND.LAKE+.8)return 0;if(NL_GROUND.riverAt(x,z)[0]<NL_GROUND.river.width/2+8)return 0;
 for(const s of NL_WAYS.query(x,z,1))if(KCITY.lib.segDist([x,z],s.a,s.b)<s.w/2+2)return 0;
 for(const p of NL_SPACE.query(x,z,1))if(Math.hypot(x-p.x,z-p.z)<Math.hypot(nlD(p.w,10),nlD(p.d,10))/2+(p.kind==='ring'?3:6))return 0;
 if(NL_PLAN){if(nlInPoly(NL_PLAN.zones.town,x,z)||nlInPoly(NL_PLAN.zones.works,x,z))return .06;
  const R=NL_PLAN.rings.precinct;if(Math.hypot(x-R.c[0],z-R.c[1])<R.r+12)return .1;}
 if(x>NL_GROUND.HARBOUR.x0-60&&x<NL_GROUND.HARBOUR.x0+10&&z>-2400&&z<-600)return 0;   /* the shore's boat sheds and racks */
 const f=nlFieldAt(x,z);if(f)return f.kind==='fallow'?.15:f.kind==='orchard'?.5:0;
 return 1;}
/* the climate's wetness (the flora's `wet` field and the grass's tint): the basin's Csa, about 1,130 mm with a dry summer (.42),
   wetter by the lake's and the bay's shore (to +.3 within 600 m) and the Chimes Riba's banks (to +.3 within 400 m) */
const nlSm=(a,b,t)=>{t=Math.max(0,Math.min(1,(t-a)/(b-a)));return t*t*(3-2*t);};
const nlWet=(x,z)=>Math.max(0,Math.min(1,.42+.3*nlSm(16,0,NL_GROUND.h(x,z)-NL_GROUND.LAKE)+.3*nlSm(400,80,NL_GROUND.riverAt(x,z)[0])));
if(typeof BIO!=='undefined'&&BIO.host){Object.assign(BIO.host,{mask:nlBioMask,origin:[[0,0],[-900,1100],[900,-1300]],center:[0,0],
 fields:{wet:(x,z)=>nlWet(x,z),salt:()=>0,upland:()=>0,flow:()=>0,mist:()=>0}});}
