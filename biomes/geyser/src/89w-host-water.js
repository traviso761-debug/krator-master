// ================================================================= HOST - the creek and the Stair's terrace pools on core/water
// core/water (core/water/README.md), 2026-10-25, migration phase 4. THE CREEK is a WATER.flow along CREEK.P at its bed + depth (the records stay in
// 45-host-stage.js), 2.44 x the channel's half-width across as the old ribbon was, with its own rapids band [.02,.09] (the fall of the bed makes it
// white over the rapids). THE STAIR'S POOLS were painted in the ground's shader (84); each pool of the flight is a WATER.still polygon at its level
// now: the cells of the flight (1.5 m) that lie in one pool and under its level, joined, their outline traced and simplified. The ground keeps its
// sinter colours, the darkened floor under the water and the drip ridges on the walls (a wall is a curtain painted on the ground, not a WATER.fall:
// the pools are a 2-D field, not a line). The pools are drawn in three meshes by their heat (green, teal, blue), with drawPools.
// The sea is 89w-host-sea.js. The page's own ripple material and tick are gone (86-host-water.js).
const lin=c=>c.convertSRGBToLinear();
const CREEK_FLOW=(function(){const P=CREEK.P,pts=[],w=[];
 for(let i=0;i<P.length;i+=2){const lev=CREEK.bed[i]+CREEK.depth;if(lev<SEA+.05)break;pts.push([P[i][0],P[i][1],lev]);w.push(CREEK.w[i]*2.44);}
 return WATER.flow({name:CREEK.name,pts,width:w,speed:1.4,rapids:[.02,.09]});})();
const CREEK_DRAW=WATER.drawFlow(CREEK_FLOW,{shallow:lin(new THREE.Color(.16,.26,.2)),deep:lin(new THREE.Color(.1,.16,.12)),color:0xffffff,roughness:.14,metalness:.05,
 envMapIntensity:.4,step:8,across:6,margin:.5,depthBias:2,renderOrder:2,pick:true});
CREEK_DRAW.mesh.userData.inspectLabel=CREEK.name;
// ---- the Stair's pools
const STAIR_POOLS=[];
(function(){const t=GEYSER.R&&GEYSER.R.terraces[0];if(!t||!t.seeds||!t.mask)return;
 const B=t.box,c=1.5,nx=Math.ceil((B[2]-B[0])/c),nz=Math.ceil((B[3]-B[1])/c),groups=new Map();
 for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const x=B[0]+(i+.5)*c,z=B[1]+(j+.5)*c;if(t.mask(x,z)<.98)continue;
  const q=GEYSER.poolAt(t,x,z),A=q.A;if(!A||A.sea||A.dry)continue;
  if(terrainH(x,z)>=A.L+t.lip-.05)continue;
  const k=A.iu*65536+A.iv;let g=groups.get(k);if(!g)groups.set(k,g={A,cells:new Set()});g.cells.add(j*nx+i);}
 const dp=(P,tol)=>{if(P.length<4)return P;let md=0,mi=0;const a=P[0],b=P[P.length-1],dx=b[0]-a[0],dz=b[1]-a[1],L=Math.hypot(dx,dz)||1;
  for(let i=1;i<P.length-1;i++){const d=Math.abs((P[i][0]-a[0])*dz-(P[i][1]-a[1])*dx)/L;if(d>md){md=d;mi=i;}}
  if(md<=tol)return[a,b];return dp(P.slice(0,mi+1),tol).slice(0,-1).concat(dp(P.slice(mi),tol));};
 groups.forEach(g=>{const seen=new Set();
  for(const s0 of g.cells){if(seen.has(s0))continue;const comp=new Set([s0]),st=[s0];seen.add(s0);
   while(st.length){const s=st.pop(),i=s%nx,j=(s-i)/nx;for(const n of[[i-1,j],[i+1,j],[i,j-1],[i,j+1]]){const k=n[1]*nx+n[0];if(n[0]<0||n[1]<0||n[0]>=nx||n[1]>=nz||!g.cells.has(k)||seen.has(k))continue;seen.add(k);comp.add(k);st.push(k);}}
   if(comp.size<5)continue;
   const E=new Map(),add=(a,b)=>{const k=a[0]+','+a[1];let l=E.get(k);if(!l)E.set(k,l=[]);l.push(b);};
   for(const s of comp){const i=s%nx,j=(s-i)/nx,out=(a,b)=>!comp.has(b*nx+a)||a<0||b<0||a>=nx||b>=nz;
    if(out(i,j-1))add([i,j],[i+1,j]);if(out(i+1,j))add([i+1,j],[i+1,j+1]);if(out(i,j+1))add([i+1,j+1],[i,j+1]);if(out(i-1,j))add([i,j+1],[i,j]);}
   let best=null,ba=0;
   while(E.size){const k0=E.keys().next().value,p0=k0.split(',').map(Number),loop=[p0];let cur=p0;
    for(let n=0;n<100000;n++){const k=cur[0]+','+cur[1],l=E.get(k);if(!l||!l.length)break;const nx2=l.pop();if(!l.length)E.delete(k);
     if(nx2[0]===p0[0]&&nx2[1]===p0[1])break;loop.push(nx2);cur=nx2;}
    let ar=0;for(let i=0;i<loop.length;i++){const a=loop[i],b=loop[(i+1)%loop.length];ar+=a[0]*b[1]-b[0]*a[1];}
    if(Math.abs(ar)>ba){ba=Math.abs(ar);best=loop;}
    if(!E.has(k0)&&E.size===0)break;}
   if(!best||best.length<4)continue;
   let poly=best.map(p=>[B[0]+p[0]*c,B[1]+p[1]*c]);
   const ring=(tol)=>{let m=0,md=0;for(let i=1;i<poly.length;i++){const d=Math.hypot(poly[i][0]-poly[0][0],poly[i][1]-poly[0][1]);if(d>md){md=d;m=i;}}
    return dp(poly.slice(0,m+1),tol).slice(0,-1).concat(dp(poly.slice(m).concat([poly[0]]),tol).slice(0,-1));};
   let tol=.7,sp=ring(tol);while(sp.length>44&&tol<4){tol*=1.35;sp=ring(tol);}
   if(sp.length<3)continue;
   /* rounded lobes (2026-10-26): two rounds of Chaikin's corner cutting take the cell outline's corners off, inside its hull */
   for(let it=0;it<2&&sp.length>=4;it++){const o=[];for(let i=0;i<sp.length;i++){const a=sp[i],b2=sp[(i+1)%sp.length];o.push([a[0]*.75+b2[0]*.25,a[1]*.75+b2[1]*.25],[a[0]*.25+b2[0]*.75,a[1]*.25+b2[1]*.75]);}sp=o;}
   const heat=GEYSER.at(g.A.x,g.A.z).heat;
   STAIR_POOLS.push({S:WATER.still({name:'A terrace pool of the Stair',level:g.A.L+t.lip-.03,poly:sp}),heat});}});})();
const STAIR_DRAWS=[[0,.25,[.2,.48,.36]],[.25,.5,[.18,.56,.62]],[.5,2,[.3,.7,.8]]].map(b=>{
 const list=STAIR_POOLS.filter(p=>p.heat>=b[0]&&p.heat<b[1]).map(p=>p.S);if(!list.length)return null;
 return WATER.drawPools(list,{color:lin(new THREE.Color(b[2][0],b[2][1],b[2][2])).getHex(),opacity:.78,roughness:.06,metalness:.1,envMapIntensity:.35,renderOrder:1,pick:true,name:'The Stair pools'});}).filter(Boolean);
window._water={creek:!!CREEK_DRAW,pools:STAIR_POOLS.length,poolMeshes:STAIR_DRAWS.length};
_mark('water');
