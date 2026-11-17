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
 for(const r of KS_PLAN.extra){const st=WET.has(r.kind)?{y:r.y,drop:r.kind==='boat'?0:Math.max(0,r.y-KS_GROUND.h(r.x,r.z))+.3}:r.kind==='garden'?{y:r.y,drop:r.drop}:ksStance(r);   /* a garden square: one level, its own footings (41) */
  KS_PLACE.push({key:r.key,x:r.x,z:r.z,ry:r.ry,o:{v:r.v,y:st.y,drop:r.kind==='boat'||r.kind==='bridge'?0:st.drop},kind:r.kind,id:r.id,h:ksD(r.h,10),people:r.people});}
 /* THE TOWN WALL (the owner, 2026-11-17: slate, after Chiang Mai's thin brick wall; kits/xanadu 87k2), on core/city's wall
    records (41 KS_TOWN wall): each run cut into pieces of at most 14 m (o.len), its outer face away from the town, its base at
    the lowest ground under it (the higher end's ground buries its foot); a gate at each gate node, square to its road; a
    buttress at each tower node; a bastion at each corner. All kind 'wall' (90l draws them from farther off) */
 const W=KS_PLAN.wall;if(W){const C=KS_PLAN.places?KS_GROUND.at(...KS_PLAN.places.centre):[0,0];let n=0;
  const low=(pts)=>Math.min(...pts.map(p=>KS_GROUND.h(p[0],p[1])));
  const add=(key,x,z,ry,o,h)=>KS_PLACE.push({key,x,z,ry,o:Object.assign({v:0},o),kind:'wall',id:'ks.wall.'+(n++),h});
  for(const g of W.segs){const dx=g.bx-g.ax,dz=g.bz-g.az,L=Math.hypot(dx,dz),k=Math.max(1,Math.ceil(L/14)),len=L/k;
   let ry=Math.atan2(-dz,dx);if(Math.sin(ry)*((g.ax+g.bx)/2-C[0])+Math.cos(ry)*((g.az+g.bz)/2-C[1])<0)ry+=Math.PI;   /* local +z outward */
   for(let i=0;i<k;i++){const t0=i/k,t1=(i+1)/k,x=g.ax+dx*(t0+t1)/2,z=g.az+dz*(t0+t1)/2,y=low([[g.ax+dx*t0,g.az+dz*t0],[x,z],[g.ax+dx*t1,g.az+dz*t1]]);
    add('xa_slate_wall',x,z,ry,{len:len+.05,y,drop:.6},8);}}
  for(const nd of W.nodes){const r=nd.kind==='gate'?7:3;const pts=[[nd.x,nd.z],[nd.x+r,nd.z],[nd.x-r,nd.z],[nd.x,nd.z+r],[nd.x,nd.z-r]];
   if(nd.kind==='gate')add('xa_slate_gate',nd.x,nd.z,nd.ry,{pass:10.5,y:KS_GROUND.h(nd.x,nd.z),drop:Math.max(0,KS_GROUND.h(nd.x,nd.z)-low(pts))+.6,name:nd.name},11);
   else add('xa_slate_tower',nd.x,nd.z,nd.ry,{y:low(pts),drop:.6},9);}
  for(const c of W.corners){const pts=[[c.x,c.z],[c.x+7,c.z+7],[c.x-7,c.z-7],[c.x+7,c.z-7],[c.x-7,c.z+7]];add('xa_slate_bastion',c.x,c.z,Math.atan2(-KS_GROUND.UX[1],KS_GROUND.UX[0]),{y:low(pts),drop:.6},10);}}}
for(const V of KS_RINGV)for(const r of (V.records||[])){const D=ksDims(r.key,0)||{w:r.w,d:r.d,fw:r.w,fd:r.d};const q=Object.assign({},r,{fw:D.fw,fd:D.fd}),st=r.key==='xa_quay'?{y:1.7,drop:Math.max(0,1.7-KS_GROUND.h(r.x,r.z))+.3}:ksStance(q);   /* a landing's quay at the quays' level, over the water */
 KS_PLACE.push({key:r.key,x:r.x,z:r.z,ry:r.ry,o:{v:0,y:st.y,drop:st.drop},kind:'ring',village:V.id,id:'ring:'+r.id,h:ksD(r.h,8),pending:!!r.pending,w:r.w,d:r.d});}
window._kirstabalPlan={err:KS_ERR?String(KS_ERR):null,place:KS_PLACE.length,lots:KS_PLAN?KS_PLAN.lots.length:0,extra:KS_PLAN?KS_PLAN.extra.length:0,
 people:KS_PLAN?KS_PLAN.census.people:0,wall:KS_PLAN&&KS_PLAN.wall?{gates:KS_PLAN.wall.nodes.filter(n=>n.kind==='gate').length,named:KS_PLAN.wall.nodes.filter(n=>n.kind==='gate'&&n.named).length,
  names:KS_PLAN.wall.nodes.filter(n=>n.kind==='gate').map(n=>n.name),towers:KS_PLAN.wall.nodes.filter(n=>n.kind==='tower').length,corners:KS_PLAN.wall.corners.length,runs:KS_PLAN.wall.segs.length}:null,ways:KS_PLAN?KS_PLAN.ways.length:0,ring:KS_RINGV.map(V=>({id:V.id,error:V.error||null,records:(V.records||[]).length,pop:V.census&&V.census.pop}))};
/* the flora's mask (the vendored Vale of Xanadu biome Xanadu's page carries: a stand-in until the Rift floor's Af biome is bound,
   KNOWN_ISSUES.md), from the records, never from pixels: the country wild (1) but the water, the ways, the zone's made ground
   (the odd tree, .05) and every building's footprint */
const KS_SPACE=KCITY.lib.KSPACE.create({cell:40});
for(const p of KS_PLACE){const D=VERN.defs[p.key];if(D)KS_SPACE.insert(p,p.x,p.z,Math.hypot(D.fw||D.w,D.fd||D.d)/2+(p.kind==='ring'?2:8));}
const KS_WAYS=KCITY.lib.KSPACE.create({cell:40});
if(KS_PLAN)for(const w of KS_PLAN.ways.concat(KS_PLAN.roads))for(let i=1;i<w.pts.length;i++){const a=w.pts[i-1],b=w.pts[i];KS_WAYS.insert({a,b,w:w.w},(a[0]+b[0])/2,(a[1]+b[1])/2,Math.hypot(b[0]-a[0],b[1]-a[1])/2+w.w);}
/* the ring's fields (records: the country's paint and the flora's mask read them): strips round each farming village and the
   ranch's paddocks, tilled, standing or fallow by their own hash, kept off the water, Keb Riwa's banks and the villages */
const KS_FIELDS=[];
for(const V of KS_RINGV){if(!V.site||V.focus==='fishing')continue;const farm=V.focus==='farming',c=[V.site.x,V.site.z],R0=farm?160:200,R1=farm?900:1100,P0=[70,160];
 for(let i=Math.floor((c[0]-R1)/P0[0]);i<=Math.ceil((c[0]+R1)/P0[0]);i++)for(let j=Math.floor((c[1]-R1)/P0[1]);j<=Math.ceil((c[1]+R1)/P0[1]);j++){
  const x0=i*P0[0]+3,z0=j*P0[1]+3,cx=x0+P0[0]/2-3,cz=z0+P0[1]/2-3,r=Math.hypot(cx-c[0],cz-c[1]);if(r<R0||r>R1)continue;
  if(KS_GROUND.h(cx,cz)<3||KS_GROUND.riverAt(cx,cz)[0]<130)continue;const u=KRAND.unit(KRAND.hash(41625,i,j));if(u<.18)continue;
  KS_FIELDS.push({id:V.id+'.field.'+i+'.'+j,box:[x0,z0,x0+P0[0]-6,z0+P0[1]-6],kind:farm?(u<.42?'tilled':u<.7?'crop':'fallow'):'paddock'});}}
const KS_FIELDX=KCITY.lib.KSPACE.create({cell:200});for(const f of KS_FIELDS)KS_FIELDX.insert(f,(f.box[0]+f.box[2])/2,(f.box[1]+f.box[3])/2,90);
const ksFieldAt=(x,z)=>{for(const f of KS_FIELDX.query(x,z,1))if(x>f.box[0]&&x<f.box[2]&&z>f.box[1]&&z<f.box[3])return f;return null;};
/* the Rift floor's wetness (the climate; the flora's `wet` field and the ground's tint read it): the apron's middling rain (.36)
   made wetter by the lake's shore (to +.32 within 700 m), by Keb Riwa's banks (to +.38 within 420 m) and toward the scarp's foot
   (to +.2 east of 2.2 km) */
const ksSm=(a,b,t)=>{t=Math.max(0,Math.min(1,(t-a)/(b-a)));return t*t*(3-2*t);};
const ksWet=(x,z)=>Math.max(0,Math.min(1,.36+.32*ksSm(700,40,KS_GROUND.v(x,z))+.38*ksSm(420,80,KS_GROUND.riverAt(x,z)[0])+.2*ksSm(2200,4200,x)));
/* inside the town wall: the build zone core/city laid the town in (KS_PLAN.zone, the wall drawn in 6 m) */
function ksInWall(x,z){const P=KS_PLAN&&KS_PLAN.zone;if(!P)return false;let c=false;
 for(let i=0,j=P.length-1;i<P.length;j=i++){const a=P[i],b=P[j];if((a[1]>z)!==(b[1]>z)&&x<(b[0]-a[0])*(z-a[1])/(b[1]-a[1])+a[0])c=!c;}return c;}
function ksBioMask(x,z){if(KS_GROUND.h(x,z)<1.2||KS_GROUND.inMoat(x,z,6))return 0;   /* the lake, the river, the moat and its banks */
 for(const s of KS_WAYS.query(x,z,1))if(KCITY.lib.segDist([x,z],s.a,s.b)<s.w/2+2)return 0;
 for(const p of KS_SPACE.query(x,z,1)){const D=VERN.defs[p.key];if(Math.hypot(x-p.x,z-p.z)<Math.hypot(D.fw||D.w,D.fd||D.d)/2+(p.kind==='ring'?2:8))return 0;}   /* a clearing round every town building */
 const v=KS_GROUND.v(x,z),u=KS_GROUND.u(x,z);if(u>-760&&u<820&&v<60)return 0;   /* the beach, the quays and the quay street: open */
 /* the town's yards and gardens (the owner, 2026-11-16: "add some gardens and foliage"): inside the build zone, wherever the
    clearings round the houses and the streets leave ground, a third of the country's trees and plants */
 {const B=KS_PLAN&&KS_PLAN.places?KS_PLAN.places.bazaar:null;if(B&&Math.abs(u-B[0])<36&&Math.abs(v-B[1])<36)return 0;}   /* the bazaar square: open */
 if(ksInWall(x,z))return .33;   /* inside the wall (41's build zone) */
 if(u>-600&&u<700&&v>20&&v<780)return .05;   /* the works quarter (the latex house, the tea factory, the fermentaries), the seat, the barracks and the monastery's ground */
 const f=ksFieldAt(x,z);if(f)return f.kind==='tilled'||f.kind==='crop'?0:.2;   /* the fields: none in the tilled and standing, a few in the fallow and the paddocks */
 return 1;}
if(typeof BIO!=='undefined'&&BIO.host){Object.assign(BIO.host,{mask:ksBioMask,origin:[[0,0],[-1200,1600],[1600,1400]],center:[200,400],
 fields:{wet:(x,z)=>Math.min(1,.7+Math.max(0,1-Math.abs(KS_GROUND.v(x,z))/250)*.25),salt:()=>0,upland:()=>0,flow:()=>0,mist:()=>0}});}
