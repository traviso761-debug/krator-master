// The Yachats coast: what grows on the land, the rock and the surf along the shore, and the sea in the blowholes. An
// extra, run once the engine has built the ground, the sea, the roads and the landmarks. It reads ctx.yaLand, the
// file tools/make-yachats.py writes beside the map. The forest and the surf are Olympic's machinery
// (src/olympic/nature.js) on a coast fifty times smaller:
//
//   the ground's colour   the forest floor under the trees, the basalt of the shore black where OpenStreetMap maps
//                         its shelves and wherever the ground falls steeply to the sea, the strand pale above the tide
//   the forest            grown in tiles round the camera: Sitka spruce in the fog belt along the shore, western
//                         hemlock and Douglas-fir on the cape's slopes, red alder down the creeks, and shore pine
//                         blown flat over the bluffs; in the village only in the gaps between the houses
//   the basalt            the shelves at the waterline, slabs of black rock just over the tide
//   the surf              a band of foam along the shore that comes in in lines and runs up the beaches
//   the blowholes         Thor's Well filling and draining, the Spouting Horn's jet, Devil's Churn throwing spray;
//                         ctx.yaSurge (the storm in events.js) makes all three bigger and more often
import { hash3, mkRng } from '../core/rng.js';

export function coast(api){
  const {THREE,ctx,C,scene,camera,animHooks,inWater,roadsNear,buildingsAt,nightF,hour,P,groundH}=api;
  const land=ctx.yaLand;if(!land){api.report('coast',new Error('no land file'));return;}
  const Y=C.yachats||{};
  const col=h=>new THREE.Color(h);
  const lightNow=()=>0.3+0.7*(1-nightF(hour()));
  const dec=f=>{const o=[];for(let i=0;i<f.length;i+=2)o.push([f[i]/10,f[i+1]/10]);return o;};
  const inPoly=(x,z,r)=>{let c=false;for(let i=0,j=r.length-1;i<r.length;j=i++){const [xi,zi]=r[i],[xj,zj]=r[j];if((zi>z)!==(zj>z)&&x<(xj-xi)*(z-zi)/(zj-zi)+xi)c=!c;}return c;};
  ctx.yaSurge=ctx.yaSurge||1;

  // ---- what the land is: the village, the shelves, the sea's edge ----
  const TOWN=(Y.town||[]).map(b=>{const [x0,z1]=P([b[0],b[1]]),[x1,z0]=P([b[2],b[3]]);return [x0,z0,x1,z1];});
  const inTown=(x,z)=>TOWN.some(([x0,z0,x1,z1])=>x>=x0&&x<=x1&&z>=z0&&z<=z1);
  const ROCK=land.rock.map(dec).map(r=>{let x0=1e9,z0=1e9,x1=-1e9,z1=-1e9;for(const [x,z] of r){x0=Math.min(x0,x);x1=Math.max(x1,x);z0=Math.min(z0,z);z1=Math.max(z1,z);}return {r,x0,z0,x1,z1};});
  const onRock=(x,z)=>ROCK.some(q=>x>=q.x0&&x<=q.x1&&z>=q.z0&&z<=q.z1&&inPoly(x,z,q.r));
  // how near the open sea: the ground 40, 120 and 250 m west of a point (the shore runs north and south here)
  const seaward=(x,z)=>groundH(x-40,z)<0.6?2:groundH(x-120,z)<0.6?1:groundH(x-250,z)<0.6?0.5:0;

  // ---- the ground's colour ----
  const terr=[];scene.traverse(o=>{if(o.isMesh&&o.name==='terrain')terr.push(o);});
  const PAL={forest:[col('#24402a'),col('#2c4a2e'),col('#1e3824')],floor:[col('#3a4a2e'),col('#44522e')],rock:[col('#2a2a28'),col('#383836'),col('#22221f')],
    strand:[col('#b8ac90'),col('#a89c80')],grass:[col('#6a7a44'),col('#7a8448')]};
  const cc=new THREE.Color(),tmp=new THREE.Color();
  let recoloured=0;
  for(const t of terr){const g=t.geometry,p=g.attributes.position,n=g.attributes.normal,c=g.attributes.color;if(!c)continue;
    for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i),ny=n.getY(i),slope=Math.sqrt(Math.max(0,1-ny*ny))/Math.max(0.05,ny);
      if(y<-0.5)continue;
      const h1=hash3(Math.round(x/30),Math.round(z/30),3),sea=seaward(x,z);
      cc.setRGB(c.getX(i),c.getY(i),c.getZ(i));
      if(!inTown(x,z)&&y>4){cc.copy(PAL.forest[0]).lerp(PAL.forest[1],h1).lerp(PAL.forest[2],hash3(Math.round(x/90),Math.round(z/90),5)*0.6);
        if(sea>=1&&y<40)cc.lerp(tmp.copy(PAL.grass[0]).lerp(PAL.grass[1],h1),0.45);}   // the bluffs' salal and grass, where the trees give out
      if(y<7&&sea>=1&&slope<0.35&&!onRock(x,z))cc.lerp(tmp.copy(PAL.strand[0]).lerp(PAL.strand[1],h1),Math.min(1,(7-y)/4)*0.85);   // the strand
      if(onRock(x,z)||(slope>0.9&&y<60&&sea>=0.5)||(slope>1.6))cc.copy(PAL.rock[0]).lerp(PAL.rock[1],h1).lerp(PAL.rock[2],hash3(x|0,z|0,7)*0.5);   // the basalt
      c.setXYZ(i,cc.r,cc.g,cc.b);recoloured++;}
    c.needsUpdate=true;}

  // ---- the sea past the map: the engine's horizon plate is land all round, and out here half of it is the Pacific ----
  // A sheet at the water's level round the west half of the box, from where the coast leaves the map at its north
  // and south edges, out to the horizon; the land plate stays east of it.
  {const B=api.B,F=40000,ends=land.coast.map(dec).flatMap(r=>[r[0],r[r.length-1]]);
    const edgeX=zz=>{let best=null;for(const [x,z] of ends)if(Math.abs(z-zz)<300&&(best===null||x<best))best=x;return best===null?B.x0+(B.x1-B.x0)*0.45:best;};
    const xn=edgeX(B.z0),xs=edgeX(B.z1),pts=[[xn,B.z0-F],[B.x0-F,B.z0-F],[B.x0-F,B.z1+F],[xs,B.z1+F],[xs,B.z1],[B.x0,B.z1],[B.x0,B.z0],[xn,B.z0]];
    let wm=null;scene.traverse(o=>{if(!wm&&o.isMesh&&o.userData.wireCat==='water')wm=o.material;});
    const sh=new THREE.Shape(pts.map(([x,z])=>new THREE.Vector2(x,-z))),sea=new THREE.Mesh(new THREE.ShapeGeometry(sh),wm||new THREE.MeshPhongMaterial({color:0x2a5466}));
    sea.rotation.x=-Math.PI/2;sea.position.y=ctx.waterLevel==null?0.7:ctx.waterLevel;sea.name='open sea';sea.userData.noWire=true;sea.userData.noFingerprint=true;scene.add(sea);}

  // ---- the basalt shelves: slabs of black rock just over the tide, where the map has them ----
  {const g=[],R=mkRng(1804);
    for(const q of ROCK){const area=(q.x1-q.x0)*(q.z1-q.z0),n=Math.min(260,Math.max(3,Math.round(area/60)));
      for(let k=0;k<n;k++){const x=q.x0+R()*(q.x1-q.x0),z=q.z0+R()*(q.z1-q.z0);if(!inPoly(x,z,q.r))continue;
        const w=3+R()*7,d=2+R()*5,y=Math.max(groundH(x,z),0.2);g.push([x,y,z,w,d,0.6+R()*1.6,R()*3.14]);}}
    const geo=new THREE.BoxGeometry(1,1,1).translate(0,0.5,0),im=new THREE.InstancedMesh(geo,new THREE.MeshLambertMaterial({color:0x2a2a28,flatShading:true}),Math.max(1,g.length)),d=new THREE.Object3D();
    g.forEach(([x,y,z,w,dd,h,a],i)=>{d.position.set(x,y-0.8,z);d.rotation.set((hash3(x,z,1)-0.5)*0.2,a,(hash3(x,z,2)-0.5)*0.2);d.scale.set(w,h+0.8,dd);d.updateMatrix();im.setMatrixAt(i,d.matrix);});
    im.count=Math.max(1,g.length);im.receiveShadow=true;im.name='basalt';im.userData.wireCat='ground';scene.add(im);
    ctx.details=Object.assign(ctx.details||{},{basaltSlabs:g.length});}

  // ---- the surf: a band of foam along the shore, the waves coming in in lines ----
  {const pos=[],uv=[],idx=[];let nv=0;
    for(const r of land.coast){const pts=dec(r),res=[];
      for(let i=0;i+1<pts.length;i++){const [ax,az]=pts[i],[bx,bz]=pts[i+1],L=Math.hypot(bx-ax,bz-az),n=Math.max(1,Math.ceil(L/12));for(let k=0;k<n;k++)res.push([ax+(bx-ax)*k/n,az+(bz-az)*k/n]);}
      let open=false,s=0;
      for(let i=0;i<res.length;i++){const [x,z]=res[i],a=res[Math.max(0,i-1)],b=res[Math.min(res.length-1,i+1)],dx=b[0]-a[0],dz=b[1]-a[1],l=Math.hypot(dx,dz)||1;
        const sx=-dz/l,sz=dx/l,wid=onRock(x,z)?40:90;   // OSM coastlines run with the land on the left looking north-up; z runs south here, so the sea is (-dz, dx)
        if(!api.inMap(x,z,0)){open=false;continue;}
        if(i)s+=Math.hypot(x-res[i-1][0],z-res[i-1][1]);
        pos.push(x-sx*6,0.8,z-sz*6,x+sx*wid,0.8,z+sz*wid);uv.push(s,0,s,1);
        if(open)idx.push(nv-2,nv,nv-1,nv-1,nv,nv+1);nv+=2;open=true;}}
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeBoundingSphere();
    const U=Object.assign({uTime:{value:0},uLight:{value:1},uSurge:{value:1}},THREE.UniformsLib.fog);
    const mat=new THREE.ShaderMaterial({uniforms:U,transparent:true,depthWrite:false,fog:true,
      vertexShader:`varying vec2 vUv;
#include <fog_pars_vertex>
void main(){vUv=uv;vec4 mvPosition=modelViewMatrix*vec4(position,1.0);gl_Position=projectionMatrix*mvPosition;
#include <fog_vertex>
}`,
      fragmentShader:`uniform float uTime;uniform float uLight;uniform float uSurge;varying vec2 vUv;
#include <fog_pars_fragment>
float h(float x){return fract(sin(x*12.9898)*43758.5453);}
void main(){float s=vUv.x,v=vUv.y;float t=uTime*0.09*(0.8+0.2*uSurge);
 float lines=0.0;for(int k=0;k<4;k++){float ph=fract(t+float(k)/4.0+h(floor(s/120.0))*0.25);float d=abs((1.0-v)-ph);lines+=smoothstep(0.06*uSurge,0.0,d)*(0.55+0.45*sin(s*0.06+float(k)*2.1))*smoothstep(0.0,0.3,ph);}
 float wash=smoothstep(0.3,0.0,v)*(0.6+0.4*sin(s*0.03+uTime*0.7));
 float a=clamp(lines*0.6+wash*0.75,0.0,0.94);
 gl_FragColor=vec4(vec3(0.95,0.97,0.98)*uLight,a);if(a<0.02)discard;
#include <fog_fragment>
}`});
    const m=new THREE.Mesh(g,mat);m.name='surf';m.userData.noWire=true;m.userData.noFingerprint=true;m.renderOrder=2;scene.add(m);
    animHooks.push(now=>{U.uTime.value=now/1000;U.uLight.value=lightNow();U.uSurge.value=Math.min(2.2,ctx.yaSurge);});
    ctx.details=Object.assign(ctx.details||{},{surfVerts:nv});}

  // ---- the blowholes: the sea coming up through the rock ----
  // Each is a burst of spray (points thrown up and falling back) at its own rhythm, and Thor's Well also a ring of
  // foam that spreads over the shelf and drains back into the hole.
  {const holes=C.landmarks.filter(L=>L.model==='blowhole').map(L=>{const [x,z]=P(L.at);return {L,x,z,k:L.kind||'well',next:2000+Math.random()*4000,t:-1};});
    const N=420,sprayM=new THREE.PointsMaterial({color:0xf4f8fa,size:1.6,transparent:true,opacity:0.85,depthWrite:false,sizeAttenuation:true});
    for(const h of holes){const g=new THREE.BufferGeometry(),p=new Float32Array(N*3),v=new Float32Array(N*3);g.setAttribute('position',new THREE.BufferAttribute(p,3));
      const pts=new THREE.Points(g,sprayM.clone());pts.frustumCulled=false;pts.visible=false;pts.userData.noWire=true;pts.userData.noFingerprint=true;scene.add(pts);h.pts=pts;h.p=p;h.v=v;
      if(h.k==='well'){const ring=new THREE.Mesh(new THREE.RingGeometry(2.6,7,32).rotateX(-Math.PI/2),new THREE.MeshBasicMaterial({color:0xf0f4f4,transparent:true,opacity:0,depthWrite:false}));
        ring.position.set(h.x,Math.max(0.4,groundH(h.x,h.z))+0.5,h.z);ring.userData.noWire=true;ring.userData.noFingerprint=true;scene.add(ring);h.ring=ring;}}
    const burst=h=>{const s=Math.min(2.4,ctx.yaSurge),up=h.k==='horn'?16:h.k==='well'?7:11;
      for(let i=0;i<N;i++){const a=Math.random()*6.28,r=Math.random()*(h.k==='churn'?4:1.5);
        h.p[i*3]=h.x+Math.cos(a)*r;h.p[i*3+1]=Math.max(0.4,groundH(h.x,h.z));h.p[i*3+2]=h.z+Math.sin(a)*r;
        const sp=h.k==='well'?4+Math.random()*3:1.5+Math.random()*2.5;h.v[i*3]=Math.cos(a)*sp*(h.k==='churn'?1.6:1);h.v[i*3+1]=(up*0.5+Math.random()*up)*Math.sqrt(s);h.v[i*3+2]=Math.sin(a)*sp;}
      h.t=0;h.pts.visible=true;};
    let last=0;
    animHooks.push(now=>{const dt=Math.min(0.05,(now-(last||now))/1000);last=now;
      for(const h of holes){const near=camera.position.distanceTo(h.pts.position.set(0,0,0))<1e9&&Math.hypot(camera.position.x-h.x,camera.position.z-h.z)<3000;
        if(!near){h.pts.visible=false;continue;}
        if(h.t<0&&now>h.next){burst(h);h.next=now+(h.k==='horn'?5000:h.k==='well'?9000:7000)/Math.min(2.4,ctx.yaSurge)*(0.7+Math.random()*0.6);}
        if(h.t>=0){h.t+=dt;const g0=Math.max(0.4,groundH(h.x,h.z));
          for(let i=0;i<N;i++){h.v[i*3+1]-=9.8*dt;h.p[i*3]+=h.v[i*3]*dt;h.p[i*3+1]=Math.max(g0-1,h.p[i*3+1]+h.v[i*3+1]*dt);h.p[i*3+2]+=h.v[i*3+2]*dt;}
          h.pts.geometry.attributes.position.needsUpdate=true;h.pts.material.opacity=Math.max(0,0.9-h.t*0.3)*lightNow();
          if(h.ring){const f=h.t<1.2?h.t/1.2:Math.max(0,1-(h.t-1.2)/2.4);h.ring.material.opacity=f*0.75*lightNow();h.ring.scale.setScalar(h.t<1.2?0.6+h.t*0.5:1.2-(h.t-1.2)*0.25);}   // spreads, then drains back in
          if(h.t>3.6){h.t=-1;h.pts.visible=false;if(h.ring)h.ring.material.opacity=0;}}}});
    ctx.details=Object.assign(ctx.details||{},{blowholes:holes.length});}

  // ---- the forest ----
  // Each tree is a unit geometry scaled per instance; near the camera the whole tree, further out a spike.
  const merge=(parts)=>{const pos=[],colr=[];for(const [g0,c] of parts){const g=g0.index?g0.toNonIndexed():g0;pos.push(...g.attributes.position.array);for(let i=0;i<g.attributes.position.count;i++)colr.push(c[0],c[1],c[2]);}
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('color',new THREE.Float32BufferAttribute(colr,3));g.computeVertexNormals();return g;};
  const BARK=[0.45,0.36,0.3],WHITE=[1,1,1],PALE=[0.66,0.64,0.6];
  const GEO={
    fir:merge([[new THREE.CylinderGeometry(0.014,0.03,0.4,5,1,true).translate(0,0.2,0),BARK],[new THREE.ConeGeometry(0.16,0.42,7,1,true).translate(0,0.5,0),WHITE],
      [new THREE.ConeGeometry(0.12,0.34,7,1,true).translate(0,0.72,0),WHITE],[new THREE.ConeGeometry(0.07,0.26,6,1,true).translate(0,0.9,0),WHITE]]),
    spruce:merge([[new THREE.CylinderGeometry(0.022,0.05,0.42,6,1,true).translate(0,0.21,0),BARK],[new THREE.ConeGeometry(0.26,0.5,8,1,true).translate(0,0.55,0),WHITE],
      [new THREE.ConeGeometry(0.19,0.36,7,1,true).translate(0.03,0.8,0),WHITE],[new THREE.IcosahedronGeometry(0.08,0).translate(-0.12,0.48,0.05),WHITE]]),
    // shore pine: a short crooked trunk and a crown swept flat and inland (east, +x) by the wind off the sea
    pine:merge([[new THREE.CylinderGeometry(0.04,0.07,0.5,5,1,true).translate(0,0.25,0).applyMatrix4(new THREE.Matrix4().makeShear(0,0,0.25,0,0,0)),BARK],
      [new THREE.IcosahedronGeometry(0.3,1).scale(1.3,0.75,1).translate(0.14,0.66,0),WHITE],[new THREE.IcosahedronGeometry(0.22,1).scale(1.2,0.7,1).translate(0.36,0.56,0.1),WHITE],[new THREE.IcosahedronGeometry(0.18,0).scale(1,0.8,1).translate(-0.1,0.5,-0.08),WHITE]]),
    alder:merge([[new THREE.CylinderGeometry(0.018,0.03,0.6,5,1,true).translate(0,0.3,0),PALE],[new THREE.IcosahedronGeometry(0.18,0).scale(1,1.6,1).translate(0,0.66,0),WHITE],
      [new THREE.IcosahedronGeometry(0.12,0).scale(1,1.4,1).translate(0.08,0.86,0.03),WHITE]]),
    far:new THREE.ConeGeometry(0.16,0.95,3,1,true).translate(0,0.5,0)};
  const treeM=new THREE.MeshLambertMaterial({vertexColors:true}),farM=new THREE.MeshLambertMaterial();
  const TILE=Y.forestTile||500,NEAR=Y.forestNear||2600,PER=Y.forestPerTile||2600,FULL=Y.forestFull||900;
  const tiles=new Map();
  const PALS={fir:['#22402a','#28462c','#1e3a26','#2c4a30'],spruce:['#2a4a32','#30502e','#24442c'],pine:['#34502c','#3a5630','#2e4628'],alder:['#5a7a3a','#628040','#567636']};
  for(const k in PALS)PALS[k]=PALS[k].map(col);
  const creeks=(api.WATERWAYS||[]);
  const nearCreek=(x,z)=>{for(const w of creeks){const p=w.pts||w.p||[];for(let i=0;i<p.length;i++){const q=p[i];const qx=q[0]===undefined?null:q[0],qz=q[1];if(qx!=null&&Math.abs(qx-x)<40&&Math.abs(qz-z)<40)return true;}}return false;};
  // kept clear: round each landmark and under each viewpoint's camera (the West Shelter's view is over the treetops)
  const CLEAR=[...C.landmarks.map(L=>{const [x,z]=P(L.at);return [x,z,L.model==='westshelter'?75:L.model==='blowhole'?0:18];}),
    ...Object.values(C.views||{}).map(([f])=>{const [x,z]=P(f);return [x,z,f[2]-groundH(x,z)<60?35:0];})].filter(q=>q[2]>0);
  const cleared=(x,z)=>CLEAR.some(([cx,cz,r])=>(x-cx)*(x-cx)+(z-cz)*(z-cz)<r*r);
  function buildTile(tx,tz){
    const R=mkRng(tx*73856093^tz*19349663),d=new THREE.Object3D(),L={fir:[],spruce:[],pine:[],alder:[]},FAR=[],FC=[];
    for(let k=0;k<PER;k++){const x=(tx+R())*TILE,z=(tz+R())*TILE,r=R();
      const y=groundH(x,z);
      if(y<3||!api.inMap(x,z,10)||inWater(x,z))continue;
      const town=inTown(x,z),sea=seaward(x,z);
      if(r>(town?0.07:sea>=2?0.25:0.92))continue;
      if(onRock(x,z)||cleared(x,z))continue;
      const nx=groundH(x+5,z)-groundH(x-5,z),nz=groundH(x,z+5)-groundH(x,z-5);if(Math.hypot(nx,nz)/10>1.4)continue;   // the cliffs stay bare
      if(roadsNear(x,z,town?5:7,q=>q.c!=='trail').length)continue;
      if(buildingsAt(x,z,town?6:10).length)continue;
      d.position.set(x,y-0.3,z);d.rotation.set(0,sea>=1?0:R()*6.28,0);
      const kind=sea>=1&&y<45&&R()<0.6?'pine':y<60&&R()<0.55?'spruce':R()<0.12&&nearCreek(x,z)?'alder':y<25&&R()<0.15?'alder':R()<0.5?'fir':'spruce';
      if(town&&kind!=='pine'&&kind!=='alder'&&R()<0.5)continue;   // the village keeps a few big spruce, not a forest
      const h=kind==='pine'?(sea>=2?3+R()*4:5+R()*6):kind==='spruce'?22+R()*24:kind==='alder'?10+R()*9:24+R()*26;
      const wd=kind==='pine'?1.4:kind==='spruce'?1.1:1;
      d.scale.set(h*wd,h,h*wd);d.updateMatrix();const c=PALS[kind][Math.floor(R()*PALS[kind].length)];
      L[kind].push([d.matrix.clone(),c]);FAR.push(d.matrix.clone());FC.push(c);}
    ctx.details.forestTrees=(ctx.details.forestTrees||0)+FAR.length;
    const cx=(tx+0.5)*TILE,cz=(tz+0.5)*TILE,sph=new THREE.Sphere(new THREE.Vector3(cx,groundH(cx,cz)+20,cz),TILE*0.75+60);
    const mk=(geo,mat,arr,cols)=>{if(!arr.length)return null;const g=new THREE.BufferGeometry();for(const a in geo.attributes)g.setAttribute(a,geo.attributes[a]);if(geo.index)g.setIndex(geo.index);g.boundingSphere=sph;
      const im=new THREE.InstancedMesh(g,mat,arr.length);arr.forEach((m,i)=>im.setMatrixAt(i,m));if(cols)cols.forEach((c,i)=>im.setColorAt(i,c));
      im.castShadow=false;im.receiveShadow=true;im.userData.noWire=true;im.userData.noFingerprint=true;im.userData.total=arr.length;scene.add(im);return im;};
    const near=[];for(const kind in L){const a=L[kind];if(a.length)near.push(mk(GEO[kind],treeM,a.map(q=>q[0]),a.map(q=>q[1])));}
    return {near,far:mk(GEO.far,farM,FAR,FC),cx,cz,used:0};
  }
  let lastT=0;
  animHooks.push(now=>{if(now-lastT<200)return;lastT=now;
    const cp=camera.position,above=cp.y-Math.max(0,groundH(cp.x,cp.z));
    const reach=above>4000?0:NEAR*Math.max(0.5,Math.min(1,1.4-above/3000));
    const ti0=Math.floor((cp.x-reach)/TILE),ti1=Math.floor((cp.x+reach)/TILE),tj0=Math.floor((cp.z-reach)/TILE),tj1=Math.floor((cp.z+reach)/TILE);
    // the nearest tiles first, and more of them at once while the forest round the camera is still bare
    const want=[];
    for(let tj=tj0;tj<=tj1&&reach>0;tj++)for(let ti=ti0;ti<=ti1;ti++){const cx=(ti+0.5)*TILE,cz=(tj+0.5)*TILE,dist=Math.hypot(cx-cp.x,cz-cp.z);
      if(dist<=reach+TILE*0.7)want.push([dist,ti,tj]);}
    want.sort((a,b)=>a[0]-b[0]);let made=0;
    for(const [dist,ti,tj] of want){const key=ti+','+tj;let t=tiles.get(key);
      if(!t){if(made>=(dist<FULL?8:3))continue;t=buildTile(ti,tj);tiles.set(key,t);made++;}
      t.used=now;}
    for(const [key,t] of tiles){const dist=Math.hypot(t.cx-cp.x,t.cz-cp.z),on=reach>0&&dist<=reach+TILE*0.7,full=on&&dist<FULL;
      const f=on?Math.max(0.15,Math.min(1,1.25-dist/(NEAR*0.9))):0;
      for(const im of t.near)if(im){im.visible=full;im.count=Math.max(1,Math.floor(im.userData.total*f));}
      if(t.far){t.far.visible=on&&!full;t.far.count=Math.max(1,Math.floor(t.far.userData.total*f));}
      if(!on&&now-t.used>60000){for(const im of [...t.near,t.far])if(im){scene.remove(im);im.dispose();}tiles.delete(key);}}
    ctx.details.forestTiles=tiles.size;});
  ctx.details=Object.assign(ctx.details||{},{recoloured,forest:'spruce, fir, alder and shore pine in '+TILE+' m tiles within '+NEAR+' m, whole within '+FULL+' m'});
}
