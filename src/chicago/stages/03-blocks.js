// ---------- buildings: every OpenStreetMap footprint extruded to its mapped height (or its levels), 3D parts where they are mapped,
// windows that light at dusk, storefront glass along the shopping streets; merged into 500 m tiles ----------
await stage('buildings');
function winTex(glow,cols,rows,seed){const cv=document.createElement('canvas');cv.width=cv.height=128;const g=cv.getContext('2d');g.fillStyle=glow?'#000':'#f4f2ee';g.fillRect(0,0,128,128);
  const R=mkRng(seed),cw=128/cols,rh=128/rows;for(let j=0;j<rows;j++)for(let i=0;i<cols;i++){const lit=R()<0.5;g.fillStyle=glow?(lit?`rgb(${220+R()*35},${190+R()*50},${130+R()*70})`:'#000'):`rgb(${50+R()*25},${62+R()*25},${78+R()*25})`;g.fillRect(i*cw+cw*0.18,j*rh+rh*0.18,cw*0.64,rh*0.6);}
  const t=new THREE.CanvasTexture(cv);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=8;return t;}
// two window rhythms: towers (narrow bays, every floor) and low buildings (wider bays)
const towerTex=winTex(false,4,4,5),towerGlow=winTex(true,4,4,6),lowTex=winTex(false,2,2,9),lowGlow=winTex(true,2,2,10);
// footprints come in either winding, so faces are drawn from both sides and each building's normals are pointed outwards explicitly
const towerM=new THREE.MeshLambertMaterial({vertexColors:true,map:towerTex,emissiveMap:towerGlow,emissive:0x000000,side:THREE.DoubleSide});
const lowM=new THREE.MeshLambertMaterial({vertexColors:true,map:lowTex,emissiveMap:lowGlow,emissive:0x000000,side:THREE.DoubleSide});
const roofM=new THREE.MeshLambertMaterial({vertexColors:true,side:THREE.DoubleSide});
const shopM=new THREE.MeshLambertMaterial({color:0x1c2630,emissive:0x000000,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2});
const blankM=new THREE.MeshLambertMaterial({vertexColors:true,side:THREE.DoubleSide});   // walls, armour plating and rubble carry no windows
const bldMats={tower:towerM,low:lowM,blank:blankM};
const BLANK_T=new Set(['wall','rubble','ruin','armour','barrier']);
const PALETTE={
  glass:['#5d7890','#6a8aa0','#4e6478','#8a9aa8','#7c8e9a','#3e5264','#9aa8b2'].map(col),
  stone:['#c8bea8','#b8ae98','#d8d0bc','#a89e8a','#e2dccb','#9c9486','#c2b49a'].map(col),
  brick:['#8a4b3a','#9c5a45','#7a4535','#b07a5a','#a8624a','#6e5a4e','#b58e6a','#8c7b6a'].map(col),
  concrete:['#a9a59c','#b6b2a8','#96928a','#c0bcb2'].map(col)};
const NAMED_COL={white:'#e8e6e0',black:'#2a2c30',grey:'#8a8a88',gray:'#8a8a88',brown:'#7a5a44',red:'#8a3a2a',beige:'#d8ccb0',tan:'#c8b08a',yellow:'#d8c070',blue:'#4a6a8a',silver:'#b0b4b8'};
function colourOf(b,h,hsh){if(b.c){const k=b.c.toLowerCase();try{return col(NAMED_COL[k]||k);}catch(e){}}
  const m=(b.mat||'').toLowerCase(),pickFrom=a=>a[Math.floor(hsh*a.length)];
  if(/glass|metal|steel/.test(m))return pickFrom(PALETTE.glass);if(/brick/.test(m))return pickFrom(PALETTE.brick);if(/stone|limestone|marble|granite/.test(m))return pickFrom(PALETTE.stone);if(/concrete/.test(m))return pickFrom(PALETTE.concrete);
  if(h>90)return hsh<0.55?pickFrom(PALETTE.glass):hsh<0.8?pickFrom(PALETTE.stone):pickFrom(PALETTE.concrete);
  if(h>35)return hsh<0.35?pickFrom(PALETTE.glass):hsh<0.65?pickFrom(PALETTE.brick):pickFrom(PALETTE.stone);
  return hsh<0.7?pickFrom(PALETTE.brick):pickFrom(PALETTE.stone);}
const PITCHED=new Set(['house','detached','semidetached_house','terrace','bungalow','cabin','church','chapel']);
const SHINGLE=['#4a4644','#5a3a32','#3e4a52','#6a5a4a','#2e3034','#584a44'].map(col);
const ROOFTOP=[];   // flat roofs big enough for equipment or a water tank, for the details stage
// a gable roof over the footprint's oriented bounding box
function gableRoof(rf,ring,cx,cz,h,shingle,wall){let sxx=0,szz=0,sxz=0;for(const [x,z] of ring){sxx+=(x-cx)**2;szz+=(z-cz)**2;sxz+=(x-cx)*(z-cz);}
  let a=0.5*Math.atan2(2*sxz,sxx-szz),ux=Math.cos(a),uz=Math.sin(a);let u0=1e9,u1=-1e9,v0=1e9,v1=-1e9;
  for(const [x,z] of ring){const u=(x-cx)*ux+(z-cz)*uz,v=-(x-cx)*uz+(z-cz)*ux;u0=Math.min(u0,u);u1=Math.max(u1,u);v0=Math.min(v0,v);v1=Math.max(v1,v);}
  if(v1-v0>u1-u0){[ux,uz]=[-uz,ux];[u0,u1,v0,v1]=[v0,v1,-u1,-u0];}   // ridge along the long side
  const W=(u,v,y)=>[cx+u*ux-v*uz,y,cz+u*uz+v*ux],rh=Math.min(4.2,(v1-v0)*0.42),vm=(v0+v1)/2;
  const A=W(u0,v0,h),Bp=W(u1,v0,h),Cp=W(u1,v1,h),D=W(u0,v1,h),R0=W(u0,vm,h+rh),R1=W(u1,vm,h+rh);
  const tri=(p,q,r,cl)=>{const e1=[q[0]-p[0],q[1]-p[1],q[2]-p[2]],e2=[r[0]-p[0],r[1]-p[1],r[2]-p[2]];let n=[e1[1]*e2[2]-e1[2]*e2[1],e1[2]*e2[0]-e1[0]*e2[2],e1[0]*e2[1]-e1[1]*e2[0]];const l=Math.hypot(...n)||1;n=n.map(v=>v/l);if(n[1]<0)n=n.map(v=>-v);
    const base=rf.p.length/3;rf.p.push(...p,...q,...r);for(let k=0;k<3;k++){rf.n.push(...n);rf.c.push(cl.r,cl.g,cl.b);}rf.idx.push(base,base+1,base+2);};
  const sl=shingle,sl2=shingle.clone().multiplyScalar(0.8);
  tri(A,Bp,R1,sl);tri(A,R1,R0,sl);tri(D,R0,R1,sl2);tri(D,R1,Cp,sl2);tri(A,R0,D,wall);tri(Bp,Cp,R1,wall);}
const REPLACED=new Set(C.landmarks.flatMap(l=>l.replace||[]).map(s=>s.toLowerCase()));
const HEIGHT_FIX=C.landmarks.filter(l=>l.height||l.colour).map(l=>{const [x,z]=P(l.at);return {x,z,h:l.height||0,c:l.colour?col(l.colour):null};});   // known heights and colours for landmarks whose OSM tags are missing or wrong   // known heights for landmarks whose OSM height is missing or wrong
const STADIUMS=C.landmarks.filter(l=>l.stadium).map(l=>({...l,xz:P(l.at)}));
const BUILDINGS=[];   // named buildings {name,h,cx,cz,tile,kind,start,end}, for picking
const BGRID=new Map();   // every drawn footprint on a 100 m grid: {ring,h,m,x0,x1,z0,z1,name}
function buildingsAt(x,z,r){const out=[];r=r||0;for(let gi=Math.floor((x-r)/100);gi<=Math.floor((x+r)/100);gi++)for(let gj=Math.floor((z-r)/100);gj<=Math.floor((z+r)/100);gj++)for(const b of BGRID.get(gi*100003+gj)||[])if(x>=b.x0-r&&x<=b.x1+r&&z>=b.z0-r&&z<=b.z1+r&&!out.includes(b))out.push(b);return out;}
function roofAt(x,z){let h=0;for(const b of buildingsAt(x,z,0))if(inPoly(x,z,b.ring))h=Math.max(h,b.h);if(h)return h;for(const b of buildingsAt(x,z,20))h=Math.max(h,b.h);return h;}
const PICK_TILES=[];
section('buildings',()=>{
  const tiles=new Map();
  const T=(x,z)=>{const k=Math.floor(x/800)+','+Math.floor(z/800);let t=tiles.get(k);if(!t){t={walls:{tower:{p:[],n:[],u:[],c:[],idx:[],own:[]},low:{p:[],n:[],u:[],c:[],idx:[],own:[]},blank:{p:[],n:[],u:[],c:[],idx:[],own:[]}},roof:{p:[],n:[],c:[],idx:[]},shop:{p:[],n:[],idx:[]}};tiles.set(k,t);}return t;};
  const MAIN=new Set(['primary','secondary','tertiary','pedestrian','trunk']);
  let n=0,stores=0,skippedStadium=0;
  for(const b of OSM.buildings){const ring=dec(b.p);if(ring.length<3)continue;
    const name=(b.n||'').toLowerCase();if(name&&REPLACED.has(name))continue;
    let cx=0,cz=0;for(const [x,z] of ring){cx+=x;cz+=z;}cx/=ring.length;cz/=ring.length;
    if(!inMap(cx,cz,0))continue;
    // stadiums are drawn as bowls elsewhere; skip their solid outlines
    if(b.t==='stadium'||STADIUMS.some(s=>Math.hypot(s.xz[0]-cx,s.xz[1]-cz)<120&&Math.abs(polyArea(ring))>6000)){skippedStadium++;continue;}
    const g0=groundMin(ring);let h=g0+b.h,fixC=null;const m0=g0+(b.m||0);   // the lowest ground under the footprint: the building stands on it
    for(const f of HEIGHT_FIX)if(Math.abs(f.x-cx)<120&&Math.abs(f.z-cz)<120&&inPoly(f.x,f.z,ring)){if(h-g0<f.h*0.6)h=g0+f.h;if(f.c)fixC=f.c;}
    const hsh=hash3(cx,cz,3),c=fixC||colourOf(b,h-g0,hsh),tall=h-g0>30,W=BLANK_T.has(b.t)?'blank':(tall?'tower':'low'),t=T(cx,cz),wb=t.walls[W];
    const start=wb.idx.length;
    {const bb=bbox(ring),rec={ring,h,m:m0,x0:bb.x0,x1:bb.x1,z0:bb.z0,z1:bb.z1,name:b.n||''};for(let gi=Math.floor(bb.x0/100);gi<=Math.floor(bb.x1/100);gi++)for(let gj=Math.floor(bb.z0/100);gj<=Math.floor(bb.z1/100);gj++){const k=gi*100003+gj;let a=BGRID.get(k);if(!a){a=[];BGRID.set(k,a);}a.push(rec);}}
    // walls: u runs along the facade (one bay per 3.5 m, towers 3 m), v up the floors (3.6 m)
    let per=0;const bay=tall?3:3.5,fl=3.6;
    const e0=ring[0],e1=ring[1],el=Math.hypot(e1[0]-e0[0],e1[1]-e0[1])||1,out=inPoly((e0[0]+e1[0])/2+(e1[1]-e0[1])/el*0.3,(e0[1]+e1[1])/2-(e1[0]-e0[0])/el*0.3,ring)?-1:1;   // +1 when (dz,-dx) points outside
    for(let i=0;i<ring.length;i++){const a=ring[i],bb=ring[(i+1)%ring.length],len=Math.hypot(bb[0]-a[0],bb[1]-a[1]);if(len<0.05)continue;
      const nx=out*(bb[1]-a[1])/len,nz=-out*(bb[0]-a[0])/len,base=wb.p.length/3,u0=per/bay,u1=(per+len)/bay;per+=len;
      wb.p.push(a[0],h,a[1],bb[0],h,bb[1],bb[0],m0,bb[1],a[0],m0,a[1]);for(let k=0;k<4;k++){wb.n.push(nx,0,nz);wb.c.push(c.r,c.g,c.b);}
      wb.u.push(u0,(h-g0)/fl,u1,(h-g0)/fl,u1,(m0-g0)/fl,u0,(m0-g0)/fl);wb.idx.push(base,base+1,base+2,base,base+2,base+3);
      // storefront glass: ground-floor walls within a few metres of a main street, in the detailed areas
      if(m0-g0<1&&len>4&&h-g0>=6&&focusAt(cx,cz)){const mx=(a[0]+bb[0])/2,mz=(a[1]+bb[1])/2;
        if(roadsNear(mx+nx*3,mz+nz*3,8,r=>MAIN.has(r.c)).length){const s=t.shop,sb=s.p.length/3,o=0.15,ins=Math.min(1,len*0.1),ax=a[0]+(bb[0]-a[0])/len*ins,az=a[1]+(bb[1]-a[1])/len*ins,bx=bb[0]-(bb[0]-a[0])/len*ins,bz=bb[1]-(bb[1]-a[1])/len*ins;
          s.p.push(ax+nx*o,g0+4.2,az+nz*o,bx+nx*o,g0+4.2,bz+nz*o,bx+nx*o,g0+0.3,bz+nz*o,ax+nx*o,g0+0.3,az+nz*o);for(let k=0;k<4;k++)s.n.push(nx,0,nz);s.idx.push(sb,sb+1,sb+2,sb,sb+2,sb+3);stores++;}}}
    // roof: houses get a pitched roof fitted to their footprint (ridge along the long side), everything else is flat
    const rf=t.roof,rc=c.clone().multiplyScalar(0.72),area=Math.abs(polyArea(ring));
    const pitched=(b.r==='g'||b.r==='h'||PITCHED.has(b.t)||(b.t==='residential'&&h-g0<=11&&area<220&&hsh<0.35))&&area<600&&h-g0<=16&&b.r!=='f';
    if(pitched)gableRoof(rf,ring,cx,cz,h,SHINGLE[Math.floor(hash3(cx,cz,9)*SHINGLE.length)],c);
    else{const rb=rf.p.length/3;let faces;try{faces=THREE.ShapeUtils.triangulateShape(ring.map(([x,z])=>new THREE.Vector2(x,z)),[]);}catch(e){faces=[];}
      for(const [x,z] of ring){rf.p.push(x,h,z);rf.n.push(0,1,0);rf.c.push(rc.r,rc.g,rc.b);}for(const f of faces)rf.idx.push(rb+f[0],rb+f[2],rb+f[1]);
      if(area>350&&h-g0>=7&&!tall)ROOFTOP.push({x:cx,z:cz,h,area,ring,brick:PALETTE.brick.includes(c),hsh});}
    if(b.n){BUILDINGS.push({name:b.n,h,cx,cz,tile:t,kind:W,start,end:wb.idx.length});}
    n++;}
  // build the tile meshes
  const mk=(d,mat,withUV)=>{if(!d.idx.length)return null;const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(d.p,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(d.n,3));
    if(d.c)g.setAttribute('color',new THREE.Float32BufferAttribute(d.c,3));if(withUV)g.setAttribute('uv',new THREE.Float32BufferAttribute(d.u,2));g.setIndex(d.idx);g.computeBoundingSphere();const m=new THREE.Mesh(g,mat);m.castShadow=m.receiveShadow=true;scene.add(m);return m;};
  const far=(m,d)=>{if(m){m.userData.far=d;FAR_MESHES.push(m);}};
  for(const t of tiles.values()){for(const W of ['tower','low','blank']){const m=mk(t.walls[W],bldMats[W],true);if(m){m.userData.pick={tile:t,kind:W};PICK_TILES.push(m);t.walls[W].mesh=m;if(W==='low')far(m,4500);}}
    far(mk(t.roof,roofM,false),4500);const s=mk(t.shop,shopM,false);if(s){s.castShadow=false;far(s,1500);}}
  ctx.lotList=[];for(const a of BGRID.values())for(const r of a)if(!r._fp){r._fp=1;ctx.lotList.push({x:(r.x0+r.x1)/2,z:(r.z0+r.z1)/2,w:r.x1-r.x0,dpt:r.z1-r.z0,h:r.h,ry:0,kind:'osm',fixed:false});}   // the test fingerprint: every drawn footprint
  ctx.lotList.sort((p,q)=>p.x-q.x||p.z-q.z);ctx.lots=ctx.lotList.length;
  ctx.details=Object.assign(ctx.details||{},{buildingsDrawn:n,storefronts:stores,stadiumOutlinesSkipped:skippedStadium,tiles:tiles.size});
});
// which named building a click hit: the wall triangle index maps back to the building that made it
function buildingAt(hit){const pk=hit.object.userData.pick;if(!pk)return null;const tri=hit.faceIndex*3;return BUILDINGS.find(b=>b.tile===pk.tile&&b.kind===pk.kind&&tri>=b.start&&tri<b.end)||null;}
// windows and storefronts come on at dusk
animHooks.push(()=>{const w=windowF(hourCur);towerM.emissive.setRGB(w,w*0.92,w*0.8);lowM.emissive.setRGB(w*0.9,w*0.8,w*0.62);shopM.emissive.setRGB(w*0.6,w*0.52,w*0.34);});
