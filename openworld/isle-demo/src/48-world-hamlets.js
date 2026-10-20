// ================================================================= ISLE DEMO — the hamlets: four resource villages and what they work
// [G data] core/hamlet/PLAN.md section 4 (H4): the salt village on the big north-west pan (Kautoa's), the iron mine in
// Valapo's mountains, the lumber village in the wet jungle east of Kautoa, the ranch on the savanna north of it. Each
// spec names its focus, its parent town and the survey's patch; ISLE_HAMLETS.make() finds the resource in that patch on
// the world's own ground (the isles kit's gather tag for salt and pasture, its zones for the forest, the heights for the
// iron), places it, sites the village beside it on dry, gentle ground, and lays the village out with KHAMLET.village. No
// three.js, no DOM: every number is a function of the world's fields and the specs (KRAND inside the generator), so the
// same villages come out in Godot. 88h-world-hamlets.js draws them; it decides nothing.
//   ISLE_HAMLETS.SPECS                  the four, in order
//   ISLE_HAMLETS.make(dims, opt)        -> {villages: [{spec, village, resource, link}], resources: [records], errors: []}
//                                        dims(key) -> {w, d, h} (the kits' boxes)
//   ISLE_HAMLETS.groundOk(x, z)         dry land, gentle, no cliff, not the salt crust, not a town's ground
var ISLE_HAMLETS=(function(){
const SPECS=[
 {id:'hamlet-salt',name:'Salt village',focus:'salt',parent:'Kautoa',near:[-14776,-107820],look:7000},
 {id:'hamlet-mine',name:'Iron mine',focus:'mine',parent:'Valapo',near:[-18000,66000],look:6000,metal:'iron',grade:'medium'},
 {id:'hamlet-lumber',name:'Lumber village',focus:'lumber',parent:'Kautoa',near:[74697,-42993],look:7000},
 {id:'hamlet-ranch',name:'Ranch',focus:'ranch',parent:'Kautoa',near:[20093,-117084],look:7000}];
const CELL=150,SLOPE=.3,DRY=1.2;
const H=(x,z)=>WORLD.H(x,z),wet=(x,z)=>WORLD.water(x,z)>H(x,z)-DRY;
const slope=(x,z)=>Math.max(Math.abs(H(x+4,z)-H(x-4,z)),Math.abs(H(x,z+4)-H(x,z-4)))/8;
const G=(x,z)=>RINGISLES.gather(x,z),Z=(x,z)=>RINGISLES.zones(x,z);
function groundOk(x,z){if(wet(x,z)||slope(x,z)>SLOPE)return false;const z0=Z(x,z);if(z0.cliff>.3||z0.pan>.3||z0.mangal>.3)return false;return !WORLD.townW(x,z);}
const parentOf=n=>{const s=WORLD_DATA.meta.settlements.find(q=>q.name===n);return s?[s.x,s.z]:null;};
/* the patch's cells, scanned on a CELL grid round the survey point, in a fixed order */
function cells(sp,fn){const out=[],n=Math.floor(sp.look/CELL);
 for(let j=-n;j<=n;j++)for(let i=-n;i<=n;i++){const x=sp.near[0]+i*CELL,z=sp.near[1]+j*CELL;if(i*i+j*j>n*n)continue;const v=fn(x,z);if(v)out.push({x,z,v});}
 return out;}
const near=(L,p)=>{let b=null,bd=1e18;for(const c of L){const d=Math.hypot(c.x-p[0],c.z-p[1]);if(d<bd){bd=d;b=c;}}return b;};
function hull(P){P=P.slice().sort((a,b)=>a[0]-b[0]||a[1]-b[1]);if(P.length<3)return P;const cr=(o,a,b)=>(a[0]-o[0])*(b[1]-o[1])-(a[1]-o[1])*(b[0]-o[0]);
 const lo=[],up=[];for(const p of P){while(lo.length>1&&cr(lo[lo.length-2],lo[lo.length-1],p)<=0)lo.pop();lo.push(p);}
 for(let i=P.length-1;i>=0;i--){const p=P[i];while(up.length>1&&cr(up[up.length-2],up[up.length-1],p)<=0)up.pop();up.push(p);}
 return lo.slice(0,-1).concat(up.slice(0,-1));}
/* a field from the patch's cells within R of a seed cell: its hull, its capacity (km2 of full weight), its grade */
function field(sp,kind,L,seed,R){const own=L.filter(c=>Math.hypot(c.x-seed.x,c.z-seed.z)<R),a=CELL*CELL/1e6;
 const cap=own.reduce((s,c)=>s+(c.v===true?1:c.v),0)*a,mean=own.length?own.reduce((s,c)=>s+(c.v===true?1:c.v),0)/own.length:0;
 let grade=resFieldGrade(mean);
 if(kind==='salt'){const rain=WORLD.at?WORLD.at(seed.x,seed.z).rain:null;grade=rain==null?'medium':rain<800?'high':rain<1200?'medium':'low';}
 return{id:sp.id+':field',kind,grade,cap:Math.round(cap*100)/100,cells:own.length,poly:hull(own.map(c=>[c.x,c.z]))};}

function make(dims,opt){opt=opt||{};const out={villages:[],resources:[],errors:[]};
 for(const sp of SPECS){const P=parentOf(sp.parent);if(!P){out.errors.push(sp.id+': no parent '+sp.parent);continue;}
  let res=null,start=null,workers=null;
  if(sp.focus==='salt'||sp.focus==='ranch'){
   const kind=sp.focus==='salt'?'salt':'pasture',L=cells(sp,(x,z)=>{if(wet(x,z))return 0;const g=G(x,z);return kind==='salt'?(g.salt||0):(g.pasture>.5?g.pasture:0);});
   if(!L.length){out.errors.push(sp.id+': no '+kind+' in the patch');continue;}
   const seed=kind==='salt'?near(L,P):near(L,sp.near);res=field(sp,kind,L,seed,kind==='salt'?2500:3000);
   workers=resFieldWorkers(res);res.x=seed.x;res.z=seed.z;start=[seed.x,seed.z];}
  else if(sp.focus==='lumber'){
   const L=cells(sp,(x,z)=>{if(wet(x,z))return 0;const z0=Z(x,z);return z0.forest>.6?z0.forest:0;});
   if(!L.length){out.errors.push(sp.id+': no forest in the patch');continue;}
   const seed=near(L,P);res={id:sp.id+':stand',kind:'stand',x:seed.x,z:seed.z,radius:600};start=[seed.x,seed.z];}
  else if(sp.focus==='mine'){
   const L=cells(sp,(x,z)=>wet(x,z)?0:H(x,z)+1e4);if(!L.length){out.errors.push(sp.id+': no land in the patch');continue;}
   let top=L[0];for(const c of L)if(c.v>top.v)top=c;
   res={id:sp.id+':node',kind:sp.metal,grade:sp.grade,x:top.x,z:top.z,key:resNodeKey(sp.metal,sp.grade),node:true};start=[top.x,top.z];}
  /* the village starts beside its resource, toward its town; siteFor finds dry flat ground from there */
  const dx=P[0]-start[0],dz=P[1]-start[1],L0=Math.hypot(dx,dz)||1,ux=dx/L0,uz=dz/L0,off=sp.focus==='mine'?180:sp.focus==='ranch'?0:260;
  const site={x:start[0]+ux*off,z:start[1]+uz*off};
  const v=KHAMLET.village({id:sp.id,world:opt.world==null?4242:opt.world,culture:'islander_east',focus:sp.focus,site,
   link:{x:site.x+ux*400,z:site.z+uz*400},resource:{x:res.x,z:res.z,workers:workers==null?undefined:workers},dims,
   ground:{ok:groundOk},siteReach:sp.focus==='mine'?300:900});
  if(v.error)out.errors.push(sp.id+': '+v.error);
  out.villages.push({spec:sp,village:v,resource:res,parent:P});out.resources.push(res);}
 return out;}
return{SPECS,make,groundOk,CELL};})();
