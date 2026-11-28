// ================================================================= GIHON — the site on the page: the ground, the town, the forbidden city, the ring
// Runs after every kit def is registered and before the scene (90-scene). The ground every builder and the camera read is
// GH_GROUND.h (src/40-gh-ground.js); the town is GH_TOWN.make (src/41-gh-town.js: core/city, the forbidden city on its terrace)
// and the ring's villages GH_RING.make (src/42-gh-ring.js: core/hamlet), with the Xanadu kit's boxes (VERN.defs). Each record is
// seated on its ground (Kirstabal's stance: its base at the highest corner, a footing down to the lowest) and listed for 90h to
// draw. The Alph's hamlets and the Landing (G3) stand 30-140 km off: records for the open world, not drawn here. Records only,
// but the forbidden city's wall def (gh_fc_wall: the fort asset's ward, drawn by its own 80g helpers).
terrainH=function(x,z){return GH_GROUND.h(x,z);};
KTAGS.page=KTAGS.page||KTAGS.create({build:'gihon'});
const ghD=(x,d)=>x==null?d:x;   /* a numeric default: 0 is a value */
const ghDims=(key,v)=>{const D=VERN.defs[key];return D?{key,v:ghD(v,0),w:D.w,d:D.d,h:ghD(D.h,8),fw:D.fw||D.w,fd:D.fd||D.d}:null;};
let GH_PLAN=null,GH_ERR=null,GH_RINGV=[];
try{GH_PLAN=GH_TOWN.make({dims:ghDims});}catch(e){GH_ERR=e;reportErr('gihon: the town did not lay: '+(e&&e.stack||e));}
try{GH_RINGV=GH_RING.make({dims:ghDims,which:'ring'});}catch(e){reportErr('gihon: the ring did not lay: '+(e&&e.stack||e));}
const ghStance=(r)=>{if(r.fixedY!=null)return{y:r.fixedY,drop:0};const c=Math.cos(r.ry),s=Math.sin(r.ry),hw=ghD(r.fw,r.w)/2,hd=ghD(r.fd,r.d)/2;let lo=1e9,hi=-1e9;
 for(const [a,b] of [[-1,-1],[1,-1],[1,1],[-1,1],[0,0]]){const x=r.x+a*hw*c+b*hd*s,z=r.z-a*hw*s+b*hd*c,y=GH_GROUND.h(x,z);lo=Math.min(lo,y);hi=Math.max(hi,y);}
 return{y:hi+.05,drop:Math.max(0,hi-lo)+.3};};
/* THE FORBIDDEN CITY'S WALL (PLAN.md section 3; kits/xanadu 80f/80g, the Xanadui fort asset): the ward XFORT.plan laid on the
   square's corners (41), its curtains raised to a royal wall, drawn here with the asset's own pieces: the curtains with their
   merlons and band and walks (each curtain open where a gate stands in it), the towers, the two gatehouses, a flight up to each
   walk. One def placed once at the square's centre on its terrace (x east, z south: the plan's own frame) */
const GH_FCW=GH_PLAN&&GH_PLAN.fc&&GH_PLAN.fc.ward;
if(GH_FCW&&typeof xfCurtain==='function'){const P=GH_FCW.plan,ext=Math.max(...P.curtains.map(c=>Math.max(Math.abs(c.a[0]),Math.abs(c.a[1]))))*2+30;
 XA.def({key:'gh_fc_wall',name:'Gihon’s forbidden city (its wall, towers and gates)',family:'Gihon',tags:{type:['defense','military'],wealth:'civic',lit:false},w:ext,d:ext,h:20,fw:ext-20,fd:ext-20,
  build:function(G,o){reseed(41955);const C=xfCols('royal'),nm='Gihon’s forbidden city',tag='fort:gh_fc_wall/0';
   P.curtains.forEach(c=>{const L=Math.hypot(c.b[0]-c.a[0],c.b[1]-c.a[1]),mid=[(c.a[0]+c.b[0])/2,(c.a[1]+c.b[1])/2];vnReg(nm+' — curtain',mid[0],mid[1],L/2,c.h+1.3,{part:'wall'});
    const cut=[0];P.gates.filter(g=>g.curtain===c.id).forEach(g=>{const w=(g.w+3.2)/2/L;cut.push(g.t-w,g.t+w);});cut.push(1);
    for(let i=0;i<cut.length;i+=2){xfCurtain(c,cut[i],cut[i+1],c.h,C,{merlons:true,band:true});xfWalk(c,cut[i],cut[i+1],c.h,tag);}});
   P.towers.forEach(t=>{vnReg(nm+' — tower',t.ctr[0],t.ctr[1],XFORT.half(t)+.5,t.h+2,{part:'tower'});xfTower(t,C,{seed:41955},t.id);});
   P.gates.forEach(g=>{const c=P.curtains.find(q=>q.id===g.curtain);vnReg(nm+' — gate',g.at[0],g.at[1],g.w/2+2,(c?c.h:7)+4,{part:'gate'});xfGate(g,c,C,'kept',g.id==='gate.n');});
   P.stairs.forEach(s=>{const c=P.curtains.find(q=>q.id===s.curtain);if(c)xfStair(c,s.u,c.h,C,tag);});}});}
/* what 90h places: {key, x, z, ry, o: {v, y, drop}, h, kind, id} */
const GH_PLACE=[],GH_EMPTY=[];
if(GH_PLAN){
 for(const r of GH_PLAN.lots){const st=ghStance(r);if(r.vacant){GH_EMPTY.push(Object.assign({},r,{y:st.y-.05}));continue;}GH_PLACE.push({key:r.key,x:r.x,z:r.z,ry:r.ry,o:{v:r.v,y:st.y,drop:st.drop},kind:r.cls==='landmark'?'landmark':r.civic?'civic':'lot',cls:r.cls,id:r.id,h:ghD(r.h,10),people:r.people});}
 const WET=new Set(['quay','mole','lighthouse','boat','bridge','slip']);
 for(const r of GH_PLAN.extra){const st=WET.has(r.kind)?{y:r.y,drop:r.kind==='boat'||r.kind==='slip'||r.kind==='mole'||r.kind==='quay'||r.kind==='bridge'?0:Math.max(0,r.y-GH_GROUND.h(r.x,r.z))+.3}
   :r.kind==='garden'?{y:r.y,drop:r.drop}:r.kind==='fc'?{y:r.y+.05,drop:.4}:ghStance(r);
  GH_PLACE.push({key:r.key,x:r.x,z:r.z,ry:r.ry,o:{v:r.v,y:st.y,drop:r.kind==='boat'||r.kind==='bridge'?0:st.drop,len:r.len},kind:r.kind,id:r.id,h:ghD(r.h,10),people:r.people});}
 if(GH_FCW&&VERN.defs.gh_fc_wall)GH_PLACE.push({key:'gh_fc_wall',x:GH_FCW.c[0],z:GH_FCW.c[1],ry:0,o:{v:0,y:GH_FCW.y,drop:.6},kind:'fcwall',id:'gh.fc.wall',h:16,people:0});
 /* THE TOWN WALL (Kirstabal's slate wall, kits/xanadu 87k2) on core/city's wall records: runs of at most 14 m, a gate at each
    gate node, a buttress at each tower node, a bastion at each corner; kind 'wall' */
 const W=GH_PLAN.wall;if(W){const C=[0,0];let n=0;
  const low=(pts)=>Math.min(...pts.map(p=>GH_GROUND.h(p[0],p[1])));
  const add=(key,x,z,ry,o,h)=>GH_PLACE.push({key,x,z,ry,o:Object.assign({v:0},o),kind:'wall',id:'gh.wall.'+(n++),h});
  for(const g of W.segs){const dx=g.bx-g.ax,dz=g.bz-g.az,L=Math.hypot(dx,dz),k=Math.max(1,Math.ceil(L/14)),len=L/k;
   let ry=Math.atan2(-dz,dx);if(Math.sin(ry)*((g.ax+g.bx)/2-C[0])+Math.cos(ry)*((g.az+g.bz)/2-C[1])<0)ry+=Math.PI;
   for(let i=0;i<k;i++){const t0=i/k,t1=(i+1)/k,x=g.ax+dx*(t0+t1)/2,z=g.az+dz*(t0+t1)/2,y=low([[g.ax+dx*t0,g.az+dz*t0],[x,z],[g.ax+dx*t1,g.az+dz*t1]]);
    add('xa_slate_wall',x,z,ry,{len:len+.05,y,drop:.6},8);}}
  for(const nd of W.nodes){const r=nd.kind==='gate'?7:3;const pts=[[nd.x,nd.z],[nd.x+r,nd.z],[nd.x-r,nd.z],[nd.x,nd.z+r],[nd.x,nd.z-r]];
   if(nd.kind==='gate')add('xa_slate_gate',nd.x,nd.z,nd.ry,{pass:10.5,y:GH_GROUND.h(nd.x,nd.z),drop:Math.max(0,GH_GROUND.h(nd.x,nd.z)-low(pts))+.6,name:nd.name},11);
   else add('xa_slate_tower',nd.x,nd.z,nd.ry,{y:low(pts),drop:.6},9);}
  for(const c of W.corners){const pts=[[c.x,c.z],[c.x+7,c.z+7],[c.x-7,c.z-7],[c.x+7,c.z-7],[c.x-7,c.z+7]];add('xa_slate_bastion',c.x,c.z,0,{y:low(pts),drop:.6},10);}}}
for(const V of GH_RINGV)for(const r of (V.records||[])){const D=ghDims(r.key,0)||{w:r.w,d:r.d,fw:r.w,fd:r.d};const st=ghStance(Object.assign({},r,{fw:D.fw,fd:D.fd}));
 GH_PLACE.push({key:r.key,x:r.x,z:r.z,ry:r.ry,o:{v:0,y:st.y,drop:st.drop},kind:'ring',village:V.id,id:'ring:'+r.id,h:ghD(r.h,8),pending:!!r.pending,w:r.w,d:r.d});}
window._gihonPlan={err:GH_ERR?String(GH_ERR):null,place:GH_PLACE.length,lots:GH_PLAN?GH_PLAN.lots.length:0,extra:GH_PLAN?GH_PLAN.extra.length:0,
 people:GH_PLAN?GH_PLAN.census.people:0,fcPeople:GH_PLAN?GH_PLAN.census.fc:0,fc:GH_FCW?{curtains:GH_FCW.plan.curtains.length,towers:GH_FCW.plan.towers.length,gates:GH_FCW.plan.gates.map(g=>g.id),faults:GH_FCW.plan.faults||[],pieces:GH_PLAN.fc.pieces.length,y:GH_FCW.y}:null,
 wall:GH_PLAN&&GH_PLAN.wall?{gates:GH_PLAN.wall.nodes.filter(n=>n.kind==='gate').length,named:GH_PLAN.wall.nodes.filter(n=>n.kind==='gate'&&n.named).length,
  names:GH_PLAN.wall.nodes.filter(n=>n.kind==='gate').map(n=>n.name),towers:GH_PLAN.wall.nodes.filter(n=>n.kind==='tower').length,corners:GH_PLAN.wall.corners.length,runs:GH_PLAN.wall.segs.length}:null,
 ways:GH_PLAN?GH_PLAN.ways.length:0,ring:GH_RINGV.map(V=>({id:V.id,error:V.error||null,records:(V.records||[]).length,pop:V.census&&V.census.pop}))};
/* the flora's mask, from the records, never from pixels: the country wild (1) but the water, the ways, the town's made ground and
   every building's footprint; the yards inside the wall a third of the country's */
const GH_SPACE=KCITY.lib.KSPACE.create({cell:40});
for(const p of GH_PLACE){const D=VERN.defs[p.key];if(D&&p.kind!=='fcwall')GH_SPACE.insert(p,p.x,p.z,Math.hypot(D.fw||D.w,D.fd||D.d)/2+(p.kind==='ring'?2:8));}
const GH_WAYS=KCITY.lib.KSPACE.create({cell:40});
if(GH_PLAN)for(const w of GH_PLAN.ways.concat(GH_PLAN.roads))for(let i=1;i<w.pts.length;i++){const a=w.pts[i-1],b=w.pts[i];GH_WAYS.insert({a,b,w:w.w},(a[0]+b[0])/2,(a[1]+b[1])/2,Math.hypot(b[0]-a[0],b[1]-a[1])/2+w.w);}
/* the ring's fields (records: the country's paint and the flora's mask read them) */
const GH_FIELDS=[];
for(const V of GH_RINGV){if(!V.site)continue;const farm=V.focus==='farming',c=[V.site.x,V.site.z],R0=farm?160:200,R1=farm?900:1100,P0=[70,160];
 for(let i=Math.floor((c[0]-R1)/P0[0]);i<=Math.ceil((c[0]+R1)/P0[0]);i++)for(let j=Math.floor((c[1]-R1)/P0[1]);j<=Math.ceil((c[1]+R1)/P0[1]);j++){
  const x0=i*P0[0]+3,z0=j*P0[1]+3,cx=x0+P0[0]/2-3,cz=z0+P0[1]/2-3,r=Math.hypot(cx-c[0],cz-c[1]);if(r<R0||r>R1)continue;
  if(GH_GROUND.h(cx,cz)<3||GH_GROUND.riverAt(cx,cz)[0]<100)continue;const u=KRAND.unit(KRAND.hash(41925,i,j));if(u<.18)continue;
  GH_FIELDS.push({id:V.id+'.field.'+i+'.'+j,box:[x0,z0,x0+P0[0]-6,z0+P0[1]-6],kind:farm?(u<.42?'tilled':u<.7?'crop':'fallow'):'paddock'});}}
const GH_FIELDX=KCITY.lib.KSPACE.create({cell:200});for(const f of GH_FIELDS)GH_FIELDX.insert(f,(f.box[0]+f.box[2])/2,(f.box[1]+f.box[3])/2,90);
const ghFieldAt=(x,z)=>{for(const f of GH_FIELDX.query(x,z,1))if(x>f.box[0]&&x<f.box[2]&&z>f.box[1]&&z<f.box[3])return f;return null;};
/* the Rift floor's wetness (Kirstabal's climate: Af, 1,020-1,100 mm here): the apron's middling rain made wetter by the lake's
   shore and the Opal River's banks */
const ghSm=(a,b,t)=>{t=Math.max(0,Math.min(1,(t-a)/(b-a)));return t*t*(3-2*t);};
const ghWet=(x,z)=>Math.max(0,Math.min(1,.38+.32*ghSm(700,40,GH_GROUND.v(x,z))+.38*ghSm(420,60,GH_GROUND.riverAt(x,z)[0])));
function ghInWall(x,z){const P=GH_PLAN&&GH_PLAN.zone;if(!P)return false;let c=false;
 for(let i=0,j=P.length-1;i<P.length;j=i++){const a=P[i],b=P[j];if((a[1]>z)!==(b[1]>z)&&x<(b[0]-a[0])*(z-a[1])/(b[1]-a[1])+a[0])c=!c;}return c;}
function ghBioMask(x,z){if(GH_GROUND.h(x,z)<1.2||GH_GROUND.inMoat(x,z,6))return 0;
 if(GH_GROUND.riverAt(x,z)[0]<GH_GROUND.river.width/2+6)return 0;
 for(const s of GH_WAYS.query(x,z,1))if(KCITY.lib.segDist([x,z],s.a,s.b)<s.w/2+2)return 0;
 for(const p of GH_SPACE.query(x,z,1)){const D=VERN.defs[p.key];if(Math.hypot(x-p.x,z-p.z)<Math.hypot(D.fw||D.w,D.fd||D.d)/2+(p.kind==='ring'?2:8))return 0;}
 const v=GH_GROUND.v(x,z),u=GH_GROUND.u(x,z);if(u>-1100&&u<700&&v<80)return 0;   /* the beach, the quays and the quay street: open */
 if(GH_PLAN&&GH_PLAN.fc){const B=GH_PLAN.fc.box;if(u>B[0]&&u<B[2]&&v>B[1]&&v<B[3])return 0;}   /* the forbidden city's terrace: paved and drilled */
 {const B=GH_PLAN&&GH_PLAN.places?GH_PLAN.places.bazaar:null;if(B&&Math.abs(u-B[0])<40&&Math.abs(v-B[1])<40)return 0;}
 if(ghInWall(x,z))return .33;
 if(u>-1150&&u<1150&&v>0&&v<1550)return .06;   /* the quarters outside the walls and the river front */
 const f=ghFieldAt(x,z);if(f)return f.kind==='tilled'||f.kind==='crop'?0:.2;
 return 1;}
if(typeof BIO!=='undefined'&&BIO.host){Object.assign(BIO.host,{mask:ghBioMask,origin:[[0,0],[-1400,1600],[1600,1600]],center:[0,700],
 fields:{wet:(x,z)=>Math.min(1,.7+Math.max(0,1-Math.abs(GH_GROUND.v(x,z))/250)*.25),salt:()=>0,upland:()=>0,flow:()=>0,mist:()=>0}});}
