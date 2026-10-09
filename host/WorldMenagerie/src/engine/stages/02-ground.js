// ---------- ground: OpenStreetMap land cover, the lake and river, piers and breakwaters, every street, alley and trail as geometry, bridges ----------
await stage('ground');
// geometry buffers split into tiles (2 km unless asked) so the camera can skip what it cannot see; opts.far hides a tile beyond that distance
const FAR_MESHES=[];
// How far detail is drawn. Every tiled mesh carries its own `far`; this scales all of them at once, and the render
// loop turns it down when the frame rate slips — losing clutter a kilometre away costs less than losing resolution.
const DETAIL={k:QUALITY==='high'?1:QUALITY==='medium'?0.7:0.5,max:QUALITY==='high'?1:QUALITY==='medium'?0.7:0.5,min:0.35};
ctx.detail=DETAIL;
{let t=0;const c=new THREE.Vector3();animHooks.push(now=>{if(now-t<300)return;t=now;for(const m of FAR_MESHES){c.copy(m.geometry.boundingSphere.center);m.visible=camera.position.distanceTo(c)-m.geometry.boundingSphere.radius<m.userData.far*DETAIL.k;}});}
const UP=[0,1,0];
function tiledBuffer(material,opts){const tiles=new Map();opts=opts||{};const TS=(opts.tile||2000)*WORLD;
  return {
    tile(x,z){const k=Math.floor(x/TS)+','+Math.floor(z/TS);let t=tiles.get(k);if(!t){t={p:[],n:[],c:[],idx:[]};tiles.set(k,t);}return t;},
    // Written out rather than spread. `push(...a,...b,...c,...d)` is the same twelve numbers, but every
    // call builds four argument lists and hands a variadic call twelve arguments, and this runs once per
    // quad for every road, roof, field and river in the city - a couple of million times on Chicago. The
    // arithmetic is identical; only the allocation is gone.
    quad(t,a,b,c,d,cl,nrm){const base=t.p.length/3,p=t.p,nn=t.n,cc=t.c;
      p.push(a[0],a[1],a[2],b[0],b[1],b[2],c[0],c[1],c[2],d[0],d[1],d[2]);
      const n=nrm||UP,n0=n[0],n1=n[1],n2=n[2];
      nn.push(n0,n1,n2,n0,n1,n2,n0,n1,n2,n0,n1,n2);
      const r=cl.r,g=cl.g,b2=cl.b;cc.push(r,g,b2,r,g,b2,r,g,b2,r,g,b2);
      t.idx.push(base,base+1,base+2,base,base+2,base+3);},
    poly(outer,holes,y,cl){if(outer.length<3)return;const t=this.tile(outer[0][0],outer[0][1]);const Y=typeof y==='function'?y:()=>y;
      const V=r=>r.map(([x,z])=>new THREE.Vector2(x,z));let faces;try{faces=THREE.ShapeUtils.triangulateShape(V(outer),(holes||[]).map(V));}catch(e){return;}const all=outer.concat(...(holes||[]));
      const base=t.p.length/3;for(let i=0;i<all.length;i++){const x=all[i][0],z=all[i][1];t.p.push(x,Y(x,z),z);t.n.push(0,1,0);t.c.push(cl.r,cl.g,cl.b);}for(const f of faces)t.idx.push(base+f[0],base+f[2],base+f[1]);},
    // a big area on a hillside: fill it with a grid of quads that follow the ground, instead of one flat outline
    gridPoly(rec,cell,off,cl){const {x0,x1,z0,z1}=rec.bb;
      for(let z=z0;z<z1;z+=cell)for(let x=x0;x<x1;x+=cell){const x2=Math.min(x+cell,x1),z2=Math.min(z+cell,z1);
        if(!inRec(rec,(x+x2)/2,(z+z2)/2))continue;
        this.quad(this.tile(x,z),[x,groundH(x,z)+off,z],[x,groundH(x,z2)+off,z2],[x2,groundH(x2,z2)+off,z2],[x2,groundH(x2,z)+off,z],cl);}},
    walls(ring,y0,y1,cl){for(let i=0;i<ring.length;i++){const a=ring[i],b=ring[(i+1)%ring.length],nx=b[1]-a[1],nz=-(b[0]-a[0]),nl=Math.hypot(nx,nz)||1;
      this.quad(this.tile(a[0],a[1]),[a[0],y1,a[1]],[b[0],y1,b[1]],[b[0],y0,b[1]],[a[0],y0,a[1]],cl,[nx/nl,0,nz/nl]);}},
    ribbon(pts,w,y,cl,sides){if(pts.length<2)return;const h=w/2,L=[],R=[],Y=i=>Array.isArray(y)?y[i]:typeof y==='function'?y(pts[i][0],pts[i][1]):y;   // y: one height, one per point, or a function of the point
      for(let i=0;i<pts.length;i++){const a=pts[Math.max(0,i-1)],b=pts[i],c=pts[Math.min(pts.length-1,i+1)];let d1x=b[0]-a[0],d1z=b[1]-a[1],d2x=c[0]-b[0],d2z=c[1]-b[1];
        const l1=Math.hypot(d1x,d1z)||1,l2=Math.hypot(d2x,d2z)||1;d1x/=l1;d1z/=l1;d2x/=l2;d2z/=l2;if(i===0){d1x=d2x;d1z=d2z;}if(i===pts.length-1){d2x=d1x;d2z=d1z;}
        let nx=-(d1z+d2z),nz=d1x+d2x;const nl=Math.hypot(nx,nz)||1;nx/=nl;nz/=nl;const miter=Math.min(2,1/Math.max(0.5,(nx*-d1z+nz*d1x)));
        L.push([b[0]+nx*h*miter,b[1]+nz*h*miter]);R.push([b[0]-nx*h*miter,b[1]-nz*h*miter]);}
      const dark=sides?cl.clone().multiplyScalar(0.7):null;
      for(let i=0;i+1<pts.length;i++){const t=this.tile(pts[i][0],pts[i][1]);
        const y0=Y(i),y1=Y(i+1);
        // wound left-forward-right, so the face is up whichever way round the line was drawn: the other way
        // round it is a front face pointing at the ground, and the ribbon is invisible from above.
        this.quad(t,[L[i][0],y0,L[i][1]],[L[i+1][0],y1,L[i+1][1]],[R[i+1][0],y1,R[i+1][1]],[R[i][0],y0,R[i][1]],cl);
        if(sides)for(const [A,sgn] of [[L,1],[R,-1]]){const nx=(A[i+1][1]-A[i][1])*sgn,nz=-(A[i+1][0]-A[i][0])*sgn,nl=Math.hypot(nx,nz)||1;
          this.quad(t,[A[i][0],y0,A[i][1]],[A[i+1][0],y1,A[i+1][1]],[A[i+1][0],y1-sides,A[i+1][1]],[A[i][0],y0-sides,A[i][1]],dark,[nx/nl,0,nz/nl]);}}},
    build(name){const out=[];for(const t of tiles.values()){if(!t.idx.length)continue;const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(t.p,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(t.n,3));
        g.setAttribute('color',new THREE.Float32BufferAttribute(t.c,3));g.setIndex(t.idx);g.computeBoundingSphere();const m=new THREE.Mesh(g,material);m.receiveShadow=true;m.userData.noShadow=!opts.cast;if(opts.cast)m.castShadow=true;m.name=name||'';if(opts.far){m.userData.far=opts.far;FAR_MESHES.push(m);}scene.add(m);out.push(m);}return out;}};}
const col=h=>new THREE.Color(h);
const gY=off=>(x,z)=>groundH(x,z)+off;   // a height that follows the ground
// A city may mottle its ground ("groundMottle": strength, e.g. 0.12): lighter and darker patches by world position, on
// the scale of a few metres and of tens, so a big lawn reads as grass worn and lush rather than one flat sheet of paint
const MOTTLE=+C.groundMottle||0;
const groundMat=off=>{const m=new THREE.MeshLambertMaterial({vertexColors:true,polygonOffset:true,polygonOffsetFactor:-off,polygonOffsetUnits:-off*2});
  if(MOTTLE){m.onBeforeCompile=sh=>{sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec2 vGw;').replace('#include <worldpos_vertex>','#include <worldpos_vertex>\nvGw=(modelMatrix*vec4(transformed,1.0)).xz;');
    sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nvarying vec2 vGw;\nfloat gHash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}\nfloat gNoise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(gHash(i),gHash(i+vec2(1,0)),f.x),mix(gHash(i+vec2(0,1)),gHash(i+vec2(1,1)),f.x),f.y);}')
      .replace('#include <color_fragment>','#include <color_fragment>\n{float n=gNoise(vGw*0.21)*0.55+gNoise(vGw*0.037)*0.45;float g=step(vColor.r+0.02,vColor.g);diffuseColor.rgb*=1.0+('+MOTTLE.toFixed(3)+'*(1.0+g))*(n-0.5)*2.0;}');};m.customProgramCacheKey=()=>'mottle'+off;}
  return m;};
// A city's paving (C.paving: {classes: [road classes], plazas: true, metres: m}): the ground carries no texture
// coordinates, so a paving texture is laid by world position instead - seamless across streets, junctions and
// squares - and multiplied into the ground's own colour. The one pattern so far is Rome's sampietrini: basalt setts
// in fan arcs, the joints pale.
const PAVE=C.paving||null;
function settTex(){const N=512,cv=document.createElement('canvas');cv.width=cv.height=N;const g=cv.getContext('2d'),R=mkRng(1871);g.fillStyle='#cfc8bb';g.fillRect(0,0,N,N);
  const F=N/4;   // a fan every quarter tile: arcs of setts round a point on the fan's lower edge
  for(let fy=-1;fy<=4;fy++)for(let fx=-1;fx<=4;fx++){const ox=fx*F+(fy%2?F/2:0),oy=fy*F;
    for(let ring=1;ring<=9;ring++){const rr=ring*F/9.2,n=Math.max(3,Math.round(Math.PI*rr/(F/10)));
      for(let k=0;k<n;k++){const a=Math.PI*(k+0.5)/n,cx=ox+F/2+Math.cos(a)*rr,cy=oy+F-Math.sin(a)*rr,s=F/12.5,v=0.78+R()*0.3;
        g.save();g.translate(((cx%N)+N)%N,((cy%N)+N)%N);g.rotate(-a);g.fillStyle=`rgb(${Math.round(118*v)},${Math.round(113*v)},${Math.round(106*v)})`;g.fillRect(-s/2,-s/2,s*0.9,s*0.9);g.restore();}}}
  const t=new THREE.CanvasTexture(cv);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=8;return t;}
function worldMapped(mat,tex,metres){mat.onBeforeCompile=sh=>{sh.uniforms.pavTex={value:tex};sh.uniforms.pavScale={value:1/metres};
    sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec2 vPavXZ;').replace('#include <begin_vertex>','#include <begin_vertex>\nvPavXZ=(modelMatrix*vec4(transformed,1.0)).xz;');
    sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nuniform sampler2D pavTex;uniform float pavScale;varying vec2 vPavXZ;').replace('#include <map_fragment>','#include <map_fragment>\ndiffuseColor.rgb*=texture2D(pavTex,vPavXZ*pavScale).rgb*1.35;');};
  mat.customProgramCacheKey=()=>'paved';return mat;}
const PAVE_TEX=PAVE?settTex():null,PAVE_CLASSES=new Set(PAVE?PAVE.classes||[]:[]);
const paveMat=off=>worldMapped(groundMat(off),PAVE_TEX,PAVE.metres||3.2);
const stoneM=new THREE.MeshLambertMaterial({color:0xbdb5a6}),steelM=new THREE.MeshLambertMaterial({color:0x6b6f75});
section('ground',()=>{
  // the land underneath everything, then the land cover, big areas first so the details paint over them
  // the ground itself: a flat plane where there is no elevation data, otherwise the height grid in cullable chunks
  if(!TER&&C.landFromCity){
    // ---- a city that is not on any ground ----
    // Venice is not a city with water in it, it is water with a city in it, and it has no height grid: the
    // flat plate drawn under a city without one came out as grey land to the horizon with canals cut into
    // it, which is the exact opposite of the place. So the sheet under everything is the lagoon, and the
    // islands are rasterised out of the city itself - a cell is land if a building, a street or a campo is
    // within a few metres of it, and everything else is water. The mapped canals are drawn over the top of
    // it afterwards, so a rio narrower than the grid filling in costs nothing.
    const LK=C.landFromCity,CELL=LK.cell||9,GROW=LK.grow||8;
    const gnx=Math.ceil((B.w+800)/CELL),gnz=Math.ceil((B.d+800)/CELL),gx0=B.x0-400,gz0=B.z0-400;
    const land=new Uint8Array(gnx*gnz);
    const mark=(ax,az,bx,bz)=>{const i0=Math.max(0,Math.floor((ax-gx0)/CELL)),i1=Math.min(gnx-1,Math.ceil((bx-gx0)/CELL));
      const j0=Math.max(0,Math.floor((az-gz0)/CELL)),j1=Math.min(gnz-1,Math.ceil((bz-gz0)/CELL));
      for(let j=j0;j<=j1;j++)for(let i=i0;i<=i1;i++)land[j*gnx+i]=1;};
    for(const b of OSM.buildings){const p=b.p;let ax=1e9,az=1e9,bx=-1e9,bz=-1e9;
      for(let i=0;i+1<p.length;i+=2){const px=p[i]/10,pz=p[i+1]/10;if(px<ax)ax=px;if(px>bx)bx=px;if(pz<az)az=pz;if(pz>bz)bz=pz;}
      mark(ax-GROW,az-GROW,bx+GROW,bz+GROW);}
    for(const r of ROADS){const w=(r.w||4)/2+GROW*0.6;
      for(let i=0;i+1<r.pts.length;i++){const a=r.pts[i],b2=r.pts[i+1];
        mark(Math.min(a[0],b2[0])-w,Math.min(a[1],b2[1])-w,Math.max(a[0],b2[0])+w,Math.max(a[1],b2[1])+w);}}
    for(const a of AREAS)if(a.bb&&a.kind!=='water')mark(a.bb.x0-2,a.bb.z0-2,a.bb.x1+2,a.bb.z1+2);
    const isL=(i,j)=>i>=0&&j>=0&&i<gnx&&j<gnz&&land[j*gnx+i]===1;
    const lb=tiledBuffer(new THREE.MeshLambertMaterial({vertexColors:true,side:THREE.DoubleSide}),{tile:900});
    const lc=col((C.terrainColours||{}).low||'#8d8272'),qc=col(LK.quay||'#b0a695');
    const DROP=LK.drop===undefined?-0.8:LK.drop;
    let cells=0;
    for(let j=0;j<gnz;j++){let i=0;
      while(i<gnx){
        if(!isL(i,j)){i++;continue;}
        let k=i;while(k<gnx&&isL(k,j))k++;
        const ax=gx0+i*CELL,bx=gx0+k*CELL,az=gz0+j*CELL,bz=az+CELL,t=lb.tile(ax,az);
        lb.quad(t,[ax,0,az],[bx,0,az],[bx,0,bz],[ax,0,bz],lc);
        cells+=k-i;
        // the quay: a wall down to the water wherever the island stops, or the islands read as paper
        for(let q=i;q<k;q++){const cx0=gx0+q*CELL,cx1=cx0+CELL;
          if(!isL(q,j-1))lb.quad(t,[cx0,0,az],[cx1,0,az],[cx1,DROP,az],[cx0,DROP,az],qc,[0,0,-1]);
          if(!isL(q,j+1))lb.quad(t,[cx1,0,bz],[cx0,0,bz],[cx0,DROP,bz],[cx1,DROP,bz],qc,[0,0,1]);}
        lb.quad(t,[ax,0,bz],[ax,0,az],[ax,DROP,az],[ax,DROP,bz],qc,[-1,0,0]);
        lb.quad(t,[bx,0,az],[bx,0,bz],[bx,DROP,bz],[bx,DROP,az],qc,[1,0,0]);
        i=k;}}
    lb.build('land');
    ctx.details=Object.assign(ctx.details||{},{landCells:cells,landArea:Math.round(cells*CELL*CELL/10000)/100+' km2'});
  }
  else if(!TER){const base=new THREE.Mesh(new THREE.PlaneGeometry(B.w+400,B.d+400),new THREE.MeshLambertMaterial({color:0x5c5a53}));base.userData.wireCat='ground';base.rotation.x=-Math.PI/2;base.position.set(B.cx,-0.02,B.cz);base.receiveShadow=true;scene.add(base);}
  else{const TER_RELIEF=(()=>{let lo=1e9,hi=-1e9;for(let i=0;i<TER.h.length;i+=7){const v=TER.h[i];if(v<lo)lo=v;if(v>hi)hi=v;}return hi-lo;})();
    // Colour by height and slope relative to the land's own relief. Fixed at 120 m a mountain range reads as one
    // flat colour, because everything above the first hill is already at the top of the ramp; and a slope measured
    // over kilometre samples is a tenth of what it is over metres.
    const H_AT=Math.max(120,TER_RELIEF*0.35),SLOPE_K=1.2*Math.max(1,WORLD*0.3);
    const HOLE=C.groundHole?[C.groundHole.at[0],C.groundHole.at[1],C.groundHole.r]:null;   // [x, z, radius]: ground that is not there
    const TC=C.terrainColours||{},terM=new THREE.MeshLambertMaterial({vertexColors:true}),CH=48,   // a city may set its own earth colours
      low=col(TC.low||'#5c5a53'),high=col(TC.high||'#4a5a42'),steepC=col(TC.steep||'#6a6052'),cc=new THREE.Color(),
      SNOW=typeof C.snow==='number'?C.snow:0,snowC=col(TC.snow||'#eef1f4'),
      // tints: a colour worked into the rock of one place, strongest on the steep faces - Caradhras is the Redhorn
      TINTS=(C.terrainTints||[]).map(t=>{const [x,z]=P(t.at);return {x,z,r:t.r,c:col(t.colour),k:t.strength===undefined?0.7:t.strength};});
    const LODD=Array.isArray(C.terrainLOD)?C.terrainLOD:null,LODS=[];
    for(let cj=0;cj<TER.nz-1;cj+=CH)for(let ci=0;ci<TER.nx-1;ci+=CH){const w=Math.min(CH,TER.nx-1-ci),d=Math.min(CH,TER.nz-1-cj),pos=[],colr=[],idx=[];
      for(let j=0;j<=d;j++)for(let i=0;i<=w;i++){const gi=ci+i,gj=cj+j,x=TER.x0+gi*TER.step,z=TER.z0+gj*TER.step,y=TER.h[gj*TER.nx+gi];
        const gx=(TER.h[gj*TER.nx+Math.min(TER.nx-1,gi+1)]-TER.h[gj*TER.nx+Math.max(0,gi-1)])/(2*TER.step),
              gz=(TER.h[Math.min(TER.nz-1,gj+1)*TER.nx+gi]-TER.h[Math.max(0,gj-1)*TER.nx+gi])/(2*TER.step),slope=Math.hypot(gx,gz);
        pos.push(x,y,z);cc.copy(low).lerp(high,Math.min(1,y/H_AT)).lerp(steepC,Math.min(1,slope*SLOPE_K));
        // a city with mountains in it can have snow on them (C.snow, the snow-line): white above it, ragged at the
        // edge, and off the steepest faces, where the rock shows through
        for(const t of TINTS){const d=Math.hypot(x-t.x,z-t.z);if(d<t.r)cc.lerp(t.c,t.k*(1-d/t.r)*(0.35+0.65*Math.min(1,slope*SLOPE_K)));}
        if(SNOW){const k=Math.max(0,Math.min(1,(y-SNOW+140*Math.sin(x*0.004)*Math.cos(z*0.0035))/260));if(k>0)cc.lerp(snowC,k*(1-Math.min(1,slope*(C.snowShed||1.1))*0.7));}
        colr.push(cc.r,cc.g,cc.b);}
      // A heightfield cannot have a hole in it, so a city that needs one says where: quads whose middle falls
      // inside it are simply not drawn. The Flesh Pit's orifice is the only one - without it the funnel floor
      // is a lid over the shaft, and from the rim you look down at a flat disc rather than into the pit.
      for(let j=0;j<d;j++)for(let i=0;i<w;i++){const a=j*(w+1)+i;
        if(HOLE){const hx=TER.x0+(ci+i+0.5)*TER.step,hz=TER.z0+(cj+j+0.5)*TER.step;if(Math.hypot(hx-HOLE[0],hz-HOLE[1])<HOLE[2])continue;}
        idx.push(a,a+w+1,a+1,a+1,a+w+1,a+w+2);}
      const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('color',new THREE.Float32BufferAttribute(colr,3));g.setIndex(idx);g.computeVertexNormals();g.computeBoundingSphere();
      const m=new THREE.Mesh(g,terM);m.name='terrain';m.userData.wireCat='ground';m.receiveShadow=true;m.castShadow=TER_RELIEF>40;scene.add(m);
      // A country-sized map can ask for its ground in levels of detail (C.terrainLOD: [d1, d2] metres): each
      // chunk again at every second and every fourth point, and the camera's distance to the chunk picks which
      // is drawn. The coarse levels carry a skirt hung from their edges, so that where a fine chunk meets a
      // coarse one the crack between them is closed from below. (The full level has none: given one, the
      // full-detail chunks round the camera stopped drawing at all.) Yellowstone's ground was a million triangles drawn
      // from everywhere; this makes it a fraction of that without touching any map that does not ask.
      if(LODD){const levels=[m];
        const skirt=(P,Cc,I,W,D,depth)=>{const edge=[];for(let i=0;i<=W;i++)edge.push(i);for(let j=1;j<=D;j++)edge.push(j*(W+1)+W);for(let i=W-1;i>=0;i--)edge.push(D*(W+1)+i);for(let j=D-1;j>=0;j--)edge.push(j*(W+1));
          const base=P.length/3;for(const v of edge){P.push(P[v*3],P[v*3+1]-depth,P[v*3+2]);Cc.push(Cc[v*3],Cc[v*3+1],Cc[v*3+2]);}
          for(let k=0;k+1<edge.length;k++){const a=edge[k],b=edge[k+1],c=base+k,d=base+k+1;I.push(a,c,b,b,c,d);}return {edge,base};};
        for(const st of [2,4]){if(w%st||d%st)break;const W=w/st,D=d/st,P=[],Cc=[],I=[];
          for(let j=0;j<=D;j++)for(let i=0;i<=W;i++){const v=(j*st)*(w+1)+i*st;P.push(pos[v*3],pos[v*3+1],pos[v*3+2]);Cc.push(colr[v*3],colr[v*3+1],colr[v*3+2]);}
          for(let j=0;j<D;j++)for(let i=0;i<W;i++){const a=j*(W+1)+i;I.push(a,a+W+1,a+1,a+1,a+W+1,a+W+2);}
          // the surface's own normals first, and then the skirt, lit as the edge it hangs from: computed with the
          // skirt in place, the edge's normals tipped over and every chunk had a dark band round it
          const gs=new THREE.BufferGeometry();gs.setAttribute('position',new THREE.Float32BufferAttribute(P,3));gs.setIndex(I.slice());gs.computeVertexNormals();const NS=Array.from(gs.attributes.normal.array);gs.dispose();
          const sk=skirt(P,Cc,I,W,D,TER.step*st*1.5);for(const v of sk.edge)NS.push(NS[v*3],NS[v*3+1],NS[v*3+2]);
          const gl=new THREE.BufferGeometry();gl.setAttribute('position',new THREE.Float32BufferAttribute(P,3));gl.setAttribute('color',new THREE.Float32BufferAttribute(Cc,3));gl.setAttribute('normal',new THREE.Float32BufferAttribute(NS,3));gl.setIndex(I);gl.computeBoundingSphere();
          const ml=new THREE.Mesh(gl,terM);ml.name='terrain';ml.userData.wireCat='ground';ml.userData.lod=st;ml.receiveShadow=true;ml.visible=false;scene.add(ml);levels.push(ml);}
        LODS.push({x:TER.x0+(ci+w/2)*TER.step,z:TER.z0+(cj+d/2)*TER.step,levels});}}
    if(LODS.length){let t=0;animHooks.push(now=>{if(now-t<250)return;t=now;const p=camera.position;
      for(const c of LODS){const dist=Math.hypot(c.x-p.x,c.z-p.z),k=dist<LODD[0]?0:dist<LODD[1]?1:2,L=Math.min(k,c.levels.length-1);c.levels.forEach((m,i)=>{m.visible=i===L;});}});}
    // land beyond the map, so distant hills and mountains have something to stand on
    // The ring used to start at the map's circumscribed radius, which leaves a gap over the middle of each map
    // edge where the background showed through as a pale slab on the horizon. It now starts inside the box and
    // underlaps it: the terrain and the water both sit above it, so the only place it shows is past the edge.
    const far=new THREE.Mesh(new THREE.RingGeometry(Math.min(B.w,B.d)*0.45,Math.min(42000*WORLD,SKY_R*0.8),72,1),new THREE.MeshLambertMaterial({color:col((C.terrainColours||{}).far||'#76837c')}));   // fogged like the land it continues, or it reads as a dark shelf around the map
    // A map whose ground is six hundred metres up needs its horizon plate up there too, or the land ends in a
  // cliff with a pale sheet a long way below it. farLevel is where the world outside the box sits.
  far.rotation.x=-Math.PI/2;far.position.set(B.cx,(typeof C.farLevel==='number')?C.farLevel:-1.5,B.cz);far.userData.noShadow=true;far.userData.noWire=true;far.renderOrder=-1;scene.add(far);}
  // A city can retune the land-cover palette: the defaults are a modern map's greens, and on the Pelennor
  // they read as lawns rolled out over the fields.
  const AREA_COL=Object.assign({},{residential:'#5b664e',commercial:'#6c6962',industrial:'#615d56',construction:'#7a6e5a',campus:'#66755a',parking:'#4a4b4f',park:'#5f8a48',golf:'#6a9a50',cemetery:'#5a7a48',railyard:'#6a645a',reserve:'#557a44',wood:'#3f6a38',grass:'#6a9a52',zoo:'#648a4a',garden:'#5a9048',sand:'#dccda4',plaza:'#b8b0a2',pitch:'#4f8a3e',track:'#9a4a36',play:'#b89a6a',stadium:'#707070'},C.areaColours||{});
  const BIG=new Set(['park','golf','cemetery','railyard','reserve','wood','grass','zoo']),USE=new Set(['residential','commercial','industrial','construction','campus']);
  const use=tiledBuffer(groundMat(0.5)),land=tiledBuffer(groundMat(1)),detail=tiledBuffer(groundMat(2),{tile:1000,far:4000*WORLD}),paved=PAVE&&PAVE.plazas?tiledBuffer(paveMat(2),{tile:1000}):null;
  // residential blocks get a little variety in their yards so a neighbourhood does not read as one flat sheet
  for(const a of AREAS){let c=col(AREA_COL[a.kind]||'#6a9a52');if(a.kind==='residential'){const h=hash3(a.bb.x0,a.bb.z0,11);c=c.clone().offsetHSL(0,(h-0.5)*0.06,(h-0.5)*0.05);}
    const buf=paved&&a.kind==='plaza'?paved:USE.has(a.kind)?use:BIG.has(a.kind)?land:detail,big=(a.bb.x1-a.bb.x0)*(a.bb.z1-a.bb.z0);
    // an area that meets a terrain cut follows the ground too, or it would be drawn flat across the cutting
    const cutHit=TER&&TER.cutBoxes&&TER.cutBoxes.some(q=>a.bb.x1>q.x0&&a.bb.x0<q.x1&&a.bb.z1>q.z0&&a.bb.z0<q.z1);
    if(TER&&(big>4000*WORLD*WORLD||cutHit))buf.gridPoly(a,(big>40000*WORLD*WORLD?25:cutHit?6:12)*WORLD,0.06,c);else buf.poly(a.o,a.i,gY(0.06),c);}   // anything sizeable follows the ground; small patches stay flat
  for(const b of BEACHES)detail.poly(b.o,b.i,gY(0.07),col('#dccda4'));
  use.build('land use');land.build('land');detail.build('land detail');if(paved)paved.build('piazze');
});
// water: the lake with the real shore (islands cut out), the river, lagoons and harbour basins
// A sea-level city's water is one sheet the size of the map, so a bright specular spreads right across it and
// reads as a pale slab against the horizon. Open water gets a duller sheen than a river does.
const WSHINE=C.seaLevelWater?26:90;
const waterM=new THREE.MeshPhongMaterial({color:0x2a5f8c,specular:C.seaLevelWater?0x40627a:0x9fc4e0,shininess:WSHINE,polygonOffset:true,polygonOffsetFactor:-3,polygonOffsetUnits:-6});
// still, dark water - a mountain tarn, not a river under a blue sky - is lakeColour, and a duller sheen
if(C.lakeColour){waterM.color.set(C.lakeColour);waterM.specular.set(C.lakeSheen||0x4a5a68);}
section('water',()=>{
  // a city with no ground of its own floats on one sheet of open water the size of the map
  if(C.landFromCity){const sea=new THREE.Mesh(new THREE.PlaneGeometry(B.w+6000,B.d+6000),waterM);
    sea.rotation.x=-Math.PI/2;sea.position.set(B.cx,C.landFromCity.water===undefined?-0.45:C.landFromCity.water,B.cz);
    sea.name='water';sea.userData.wireCat='water';sea.receiveShadow=true;scene.add(sea);}
  if(LAKE.length>2){const clip=([x,z])=>[Math.max(B.x0-200,Math.min(B.x1+3000,x)),Math.max(B.z0-3000,Math.min(B.z1+3000,z))];
  const shape=new THREE.Shape(LAKE.map(clip).map(([x,z])=>new THREE.Vector2(x,-z)));
  for(const r of ISLANDS)shape.holes.push(new THREE.Path(r.map(([x,z])=>new THREE.Vector2(x,-z))));
  const lake=new THREE.Mesh(new THREE.ShapeGeometry(shape),waterM);lake.name='water';lake.userData.wireCat='water';lake.rotation.x=-Math.PI/2;lake.position.y=0.05;lake.receiveShadow=true;scene.add(lake);}   // cities without a lake shore skip this
  const TOX=C.toxicWater?new RegExp(C.toxicWater,'i'):null;
  const toxM=TOX?new THREE.MeshPhongMaterial({color:new THREE.Color(C.waterColour||'#3a5f52'),specular:0x7fa08c,shininess:40,polygonOffset:true,polygonOffsetFactor:-3,polygonOffsetUnits:-6}):null;
  const wb=tiledBuffer(waterM),tb=toxM?tiledBuffer(toxM):null;
  // The elevation tiles put a tidal river's surface at the same level the water plane is drawn at, and across a
  // sheet kilometres wide the depth test stops separating them at grazing angles: the bed shows through as a pale
  // slab. Open water is drawn clear of it.
  // A city can put its sea above itself: waterLevel raises the whole sheet, and what holds it back is the
  // city's own problem. Night City's is 95 m up, which is why there is a wall along the shore.
  const WY=(typeof C.waterLevel==='number')?C.waterLevel:(C.seaLevelWater?0.7:0.05);
  ctx.waterLevel=WY;
  for(const w of WATER)((TOX&&TOX.test(w.name))?tb:wb).poly(w.o,w.i,(w.y===undefined?WY:w.y),col('#2a5f8c'));
  wb.build('river');if(tb)tb.build('toxic channels');
  animHooks.push(now=>{waterM.shininess=WSHINE*0.78+WSHINE*0.28*Math.sin(now*0.0011);});
});
// piers and breakwaters: raised slabs with walls down to the water
section('piers',()=>{const pb=tiledBuffer(new THREE.MeshLambertMaterial({vertexColors:true}),{cast:true}),c=col('#b8b2a6'),side=col('#8a857a');
  for(const p of PIERS){if(p.line)pb.ribbon(p.line,p.w,2.2,c,2.4);else{pb.poly(p.o,p.i,2.2,c);pb.walls(p.o,-1.2,2.2,side);}}
  pb.build('piers');});
// streets: sidewalks under the carriageway, alleys, trails; bridges lifted as decks; commuter rail at grade
// A city can retune these: an ice road is not asphalt, and a graded lane on Europa that comes out black
// reads as a canal. roadColours in the config overrides any of them.
const ROAD_COL=Object.assign({},{motorway:'#3a3b3f',trunk:'#3a3b3f',primary:'#3c3d41',secondary:'#404145',tertiary:'#44454a',residential:'#48494d',unclassified:'#48494d',living_street:'#4f5054',pedestrian:'#b3ab9c',alley:'#56575a',trail:'#8e8a80'},C.roadColours||{});
const WALKED=new Set(['primary','secondary','tertiary','residential','unclassified','living_street']);
// bridge decks: a height per bridge (named in the config, e.g. the Fremont Bridge at 52 m, or the city's default over water),
// held at full height over the water and wherever another bridge way continues, ramping down to the street over land
const BRIDGE_H=Object.entries(C.bridgeHeights||{}).map(([re,h])=>[new RegExp(re,'i'),h]);
{const vk=p=>Math.round(p[0]*2)+','+Math.round(p[1]*2),ends=new Map();
 for(const r of ROADS)if(r.bridge||r.layer>0)for(const p of [r.pts[0],r.pts[r.pts.length-1]])ends.set(vk(p),(ends.get(vk(p))||0)+1);
 for(const r of ROADS){if(!(r.bridge||r.layer>0)){r.deck=0;r.ys=null;continue;}
   const cum=[0];for(let i=0;i+1<r.pts.length;i++)cum.push(cum[i]+Math.hypot(r.pts[i+1][0]-r.pts[i][0],r.pts[i+1][1]-r.pts[i][1]));
   let wet=false;const wetAt=r.pts.map((p,i)=>{let w=inWater(p[0],p[1]);if(i+1<r.pts.length){const q=r.pts[i+1],L2=cum[i+1]-cum[i];for(let u=8;u<L2;u+=8)if(inWater(p[0]+(q[0]-p[0])*u/L2,p[1]+(q[1]-p[1])*u/L2)){w=true;break;}}if(w)wet=true;return w;});
   const named=BRIDGE_H.find(([re])=>re.test(r.name));
   const H=named?named[1]:wet?(C.bridgeDeck||6):6*Math.max(1,r.layer||1);
   const ramp=Math.min(H>10?160:30,r.len*0.4),c0=(ends.get(vk(r.pts[0]))||0)>1,c1=(ends.get(vk(r.pts[r.pts.length-1]))||0)>1;
   const firstWet=wetAt.indexOf(true),lastWet=wetAt.lastIndexOf(true);
   r.ys=cum.map((s,i)=>{const gh=groundH(r.pts[i][0],r.pts[i][1]);if(firstWet>=0&&i>=firstWet&&i<=lastWet+1)return Math.max(H,gh+2);
     const a=c0?1:smooth(0,ramp,s),b=c1?1:smooth(0,ramp,r.len-s);
     // a city on a plateau (C.bridgeOverGround) measures a deck from the ground under it, not from the water's level
     return C.bridgeOverGround?gh+Math.max(0.6,H*Math.min(a,b)):Math.max(gh+0.6,H*Math.min(a,b));});   // over land the deck meets the hillside it lands on
   r.deck=H;}}
const deckY=r=>r.deck||0;
// the deck height at any point along a road segment
function deckAtRoad(road,k,x,z){if(!road.ys)return 0;const [ax,az]=road.pts[k],[bx,bz]=road.pts[k+1],L=(bx-ax)**2+(bz-az)**2,t=L?Math.max(0,Math.min(1,((x-ax)*(bx-ax)+(z-az)*(bz-az))/L)):0;return road.ys[k]+(road.ys[k+1]-road.ys[k])*t;}
function deckAt(x,z){const b=roadsNear(x,z,2,r=>r.deck>0);if(!b.length)return 0;let best=0;for(const q of b)best=Math.max(best,deckAtRoad(q.road,q.k,x,z));return best;}
const BRIDGES=[],PIERS_AT=[];
// break a polyline into pieces of at most `step` metres so it can follow the ground
function resample(pts,step){const out=[];for(let i=0;i+1<pts.length;i++){const [ax,az]=pts[i],[bx,bz]=pts[i+1],L=Math.hypot(bx-ax,bz-az),n=Math.max(1,Math.ceil(L/step));for(let k=0;k<n;k++){const u=k/n;out.push([ax+(bx-ax)*u,az+(bz-az)*u]);}}out.push(pts[pts.length-1]);return out;}
section('streets',()=>{
  const pavedRoad=PAVE?tiledBuffer(paveMat(5)):null,marks=C.laneMarkings?tiledBuffer(groundMat(6),{tile:1000,far:2500*WORLD}):null,LANE=new Set(C.laneMarkings?C.laneMarkings.classes||['primary','secondary','trunk']:[]),markC=col((C.laneMarkings||{}).colour||'#e6e2d8');
  const walk=tiledBuffer(groundMat(4),{tile:1000,far:3000*WORLD}),road=tiledBuffer(groundMat(5)),trail=tiledBuffer(groundMat(6),{tile:1000,far:5000*WORLD}),deck=tiledBuffer(new THREE.MeshLambertMaterial({vertexColors:true}),{cast:true});
  const walkC=col('#a39f95'),namedTrail=col('#7f8a8c'),TRAIL_PALE=nameRe(C.trails);   // the city's named trails are paler
  for(const r of ROADS){const y=deckY(r),c=col(ROAD_COL[r.c]||'#48494d');
    if(y>0){// resample every 8 m so the ramps are smooth, then the deck with a parapet-deep side, and piers every 45 m
      const pts=[],ys=[];for(let i=0;i+1<r.pts.length;i++){const [ax,az]=r.pts[i],[bx,bz]=r.pts[i+1],L2=Math.hypot(bx-ax,bz-az),n=Math.max(1,Math.ceil(L2/(8*WORLD)));for(let k=0;k<n;k++){const u=k/n;pts.push([ax+(bx-ax)*u,az+(bz-az)*u]);ys.push(r.ys[i]+(r.ys[i+1]-r.ys[i])*u);}}
      pts.push(r.pts[r.pts.length-1]);ys.push(r.ys[r.ys.length-1]);
      deck.ribbon(pts,r.w+(WALKED.has(r.c)?4:1),ys,c,y>12?2.4:1.6);BRIDGES.push(r);
      for(let k=0,run=0;k+1<pts.length;k++){run+=Math.hypot(pts[k+1][0]-pts[k][0],pts[k+1][1]-pts[k][1]);if(run<45||ys[k]<7)continue;run=0;PIERS_AT.push([pts[k][0],pts[k][1],ys[k]-(y>12?2.4:1.6),Math.atan2(pts[k+1][1]-pts[k][1],pts[k+1][0]-pts[k][0]),r.w,groundH(pts[k][0],pts[k][1])]);}
      continue;}
    const pts=TER?resample(r.pts,14*WORLD):r.pts;   // follow the ground, at a step that suits the size of the map
    if(r.c==='trail'){trail.ribbon(pts,r.w,gY(0.09),TRAIL_PALE.test(r.name)?namedTrail:c);continue;}
    // a city whose roads have no pavements (sidewalks: false) - a paved plain, a mountain track - leaves the pale
    // strip out; drawn under Isengard's roads it put a white edge along every one
    if(WALKED.has(r.c)&&C.sidewalks!==false)walk.ribbon(pts,r.w+5,gY(0.06),walkC);
    (pavedRoad&&PAVE_CLASSES.has(r.c)?pavedRoad:r.c==='alley'?walk:road).ribbon(pts,r.w,gY(0.08),c);
    // lane markings on the main roads: a dashed centre line, a solid line a little in from each edge
    if(marks&&LANE.has(r.c)&&r.w>=7){const off=(p,i,d)=>{const a=p[Math.max(0,i-1)],b=p[Math.min(p.length-1,i+1)],dx=b[0]-a[0],dz=b[1]-a[1],l=Math.hypot(dx,dz)||1;return [p[i][0]-dz/l*d,p[i][1]+dx/l*d];};
      for(const sd of [-1,1])marks.ribbon(pts.map((_,i)=>off(pts,i,sd*(r.w/2-0.5))),0.14,gY(0.1),markC);
      let run=0;for(let i=0;i+1<pts.length;i++){const a=pts[i],b=pts[i+1],L=Math.hypot(b[0]-a[0],b[1]-a[1]);for(let u=(6-run%6)%6;u+3<=L;u+=6){const t0=u/L,t1=(u+3)/L;marks.ribbon([[a[0]+(b[0]-a[0])*t0,a[1]+(b[1]-a[1])*t0],[a[0]+(b[0]-a[0])*t1,a[1]+(b[1]-a[1])*t1]],0.15,gY(0.1),markC);}run+=L;}}}
  const rail=tiledBuffer(groundMat(4));for(const r of RAILS)if(!r.elevated&&r.type==='rail')rail.ribbon(TER?resample(r.pts,14):r.pts,5,gY(0.07),col('#5a534a'));
  if(pavedRoad)pavedRoad.build('paved streets');if(marks)marks.build('lane markings');
  // tram tracks: a pair of steel rails along each mapped tram line, set into the street
  if(C.tramTracks){const tt=tiledBuffer(groundMat(6),{tile:1000,far:2000*WORLD}),steel=col('#8c8e92');for(const r of RAILS){if(r.type!=='tram'||r.elevated)continue;const p=TER?resample(r.pts,8):r.pts;
      for(const sd of [-1,1]){const q=p.map((_,i)=>{const a=p[Math.max(0,i-1)],b=p[Math.min(p.length-1,i+1)],dx=b[0]-a[0],dz=b[1]-a[1],l=Math.hypot(dx,dz)||1;return [p[i][0]-dz/l*sd*0.72,p[i][1]+dx/l*sd*0.72];});tt.ribbon(q,0.11,gY(0.11),steel);}}tt.build('tram tracks');}
  walk.build('sidewalks');road.build('streets');trail.build('trails');deck.build('bridges');rail.build('rail');
  {const pm=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1).translate(0,0.5,0),new THREE.MeshLambertMaterial({color:0x8a8680}),Math.max(1,PIERS_AT.length)),d=new THREE.Object3D();
   PIERS_AT.forEach(([x,z,top,a,w,g],i)=>{const foot=Math.min(g,0)-1;d.position.set(x,foot,z);d.rotation.set(0,-a,0);d.scale.set(2,Math.max(1,top-foot),Math.max(3,w*0.45));d.updateMatrix();pm.setMatrixAt(i,d.matrix);});pm.count=PIERS_AT.length;scene.add(pm);ctx.details=Object.assign(ctx.details||{},{bridgePiers:PIERS_AT.length});}
  // movable (bascule) bridges get a bridge house at each corner, as the river bridges downtown do
  const houseM=new THREE.MeshLambertMaterial({color:0xc8bca8}),roofM=new THREE.MeshLambertMaterial({color:0x5a6a62});let nh=0;
  for(const r of BRIDGES){if(r.bridge!==2||r.len<30)continue;const a=r.pts[0],b=r.pts[r.pts.length-1],dx=(b[0]-a[0])/r.len,dz=(b[1]-a[1])/r.len,ang=-Math.atan2(dz,dx);
    for(const [p,s] of [[a,1],[b,-1]])for(const sd of [-1,1]){const x=p[0]+dx*s*5-dz*sd*(r.w/2+6),z=p[1]+dz*s*5+dx*sd*(r.w/2+6);if(inWater(x,z))continue;
      const h=new THREE.Mesh(new THREE.BoxGeometry(8,10,8),houseM);h.position.set(x,groundH(x,z)+5,z);h.rotation.y=ang;h.castShadow=true;const rf=new THREE.Mesh(new THREE.ConeGeometry(6.2,3,4),roofM);rf.position.set(x,groundH(x,z)+11.5,z);rf.rotation.y=ang+Math.PI/4;scene.add(h,rf);nh++;}}
  ctx.details=Object.assign(ctx.details||{},{bridges:BRIDGES.length,bridgeHouses:nh});
});
Object.assign(API,{col,stoneM,steelM,gY});
