// ---------- Lake Atitlán: what is on the water and along its edge ----------
// The lake is the engine's water at the datum. This adds what makes it Atitlán's (C.lake):
//   lanchas    the public boats: open fibreglass launches under a tarp roof on poles, a dozen passengers on the
//              benches, an outboard, running from muelle to muelle (C.lake.routes: [from, to, boats], the docks by
//              name in C.lake.docks). Each route is found through the water on a coarse grid (A*), so a boat from
//              Panajachel to Santiago goes round the point into Santiago's bay rather than over it; it waits at
//              the dock, then goes back. A wake trails each one
//   cayucos    the fishermen's dugouts, one man paddling or sitting with a line, near the shores (C.lake.cayucos)
//   tul        the reed beds in the shallows (C.lake.reeds: [lat, lon, radius] zones), cut for the petates
//   drowned    the lake has risen five metres since 2009: dead trees standing in the water off the shore, and the
//              roofs of drowned houses and docks just showing (C.lake.drowned zones)
//   the shore  a band of dark volcanic sand and stones along the waterline, over the coarse ground's edge
//   Xocomil    the afternoon wind off the Pacific: whitecaps on the water round the camera and the boats rolling;
//              api.ctx.lake.wind(k) sets it, 0 to 1 (events.js blows it)
// None of it is in the layout fingerprint. Map data (c) OpenStreetMap contributors, ODbL.
import {mkRng,hash3} from '../core/rng.js';

export function lake(api){
  const {THREE,C,scene,OSM,P,groundH,inWater,animHooks,camera}=api;const K=C.lake;if(!K)return;
  const WY=api.ctx.waterLevel||0.05,R=mkRng(K.seed||1955),tag=o=>{o.traverse(q=>{q.userData.noFingerprint=true;});return o;};
  const [bs,bw,bn,be]=C.bounds,[X0,Z1]=P([bs,bw]),[X1,Z0]=P([bn,be]);
  // is (x, z) within r of the shore? (land somewhere on a ring of eight points round it)
  const nearShore=(x,z,r)=>{for(let k=0;k<8;k++){const a=k*Math.PI/4;if(!inWater(x+Math.cos(a)*r,z+Math.sin(a)*r))return true;}return false;};
  // a point in the water within [r0, r1] of the shore, near a zone's centre (lat, lon, radius), or null
  const shorePoint=(zone,r0,r1)=>{const [cx,cz]=P([zone[0],zone[1]]);for(let t=0;t<40;t++){const a=R()*Math.PI*2,d=Math.sqrt(R())*zone[2],x=cx+Math.cos(a)*d,z=cz+Math.sin(a)*d;
      if(inWater(x,z)&&nearShore(x,z,r1)&&!nearShore(x,z,r0))return [x,z];}return null;};
  const grp=tag(new THREE.Group());grp.name='lake';scene.add(grp);
  const merge=gs=>{const pos=[],col=[];for(const [g,c] of gs){const a=g.toNonIndexed().attributes.position.array,cc=new THREE.Color(c);for(let i=0;i<a.length;i+=3){pos.push(a[i],a[i+1],a[i+2]);col.push(cc.r,cc.g,cc.b);}}
    const ge=new THREE.BufferGeometry();ge.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));ge.setAttribute('color',new THREE.Float32BufferAttribute(col,3));ge.computeVertexNormals();return ge;};
  const bx=(w,h,d,x,y,z,ry=0)=>new THREE.BoxGeometry(w,h,d).rotateY(ry).translate(x,y,z);
  const br=(w,h,d,rx,rz,x,y,z)=>new THREE.BoxGeometry(w,h,d).rotateX(rx).rotateZ(rz).translate(x,y,z);   // a branch, leaning
  const vmat=new THREE.MeshLambertMaterial({vertexColors:true}),o=new THREE.Object3D(),detail={};

  // ---------------------------------------------------------------- the shore
  {const S=K.shore||{},inW=S.water===undefined?1.2:S.water,out=S.land===undefined?6:S.land,pos=[],col=[],c=new THREE.Color(),SAND=['#5a544c','#6a6258','#4e4a44','#7a7266'].map(h=>new THREE.Color(h));
    for(const w of (OSM.water||[])){if(K.name&&w.n&&w.n!==K.name)continue;const rings=[w.o,...(w.i||[])];
      for(const o2 of rings){const r=[];for(let i=0;i+1<o2.length;i+=2)r.push([o2[i]/10,o2[i+1]/10]);if(r.length<3)continue;
        for(let i=0;i<r.length;i++){const p=r[i],q=r[(i+1)%r.length],L=Math.hypot(q[0]-p[0],q[1]-p[1]);if(L<0.5||L>400)continue;
          let nx=(q[1]-p[1])/L,nz=-(q[0]-p[0])/L;const mx=(p[0]+q[0])/2,mz=(p[1]+q[1])/2;if(inWater(mx+nx*3,mz+nz*3)){nx=-nx;nz=-nz;}   // n: toward the land
          const ga=Math.max(WY+0.08,groundH(p[0]+nx*out,p[1]+nz*out)+0.06),gb=Math.max(WY+0.08,groundH(q[0]+nx*out,q[1]+nz*out)+0.06);
          const A=[p[0]-nx*inW,WY-0.3,p[1]-nz*inW],B=[q[0]-nx*inW,WY-0.3,q[1]-nz*inW],Cc=[q[0]+nx*out,gb,q[1]+nz*out],D=[p[0]+nx*out,ga,p[1]+nz*out],
            M1=[p[0]+nx*1.2,Math.max(WY+0.12,Math.min(ga,WY+0.5)),p[1]+nz*1.2],M2=[q[0]+nx*1.2,Math.max(WY+0.12,Math.min(gb,WY+0.5)),q[1]+nz*1.2];
          for(const [a,b,cc,d] of [[A,B,M2,M1],[M1,M2,Cc,D]]){pos.push(...a,...b,...cc,...a,...cc,...d);
            c.copy(SAND[Math.floor(hash3(mx,mz,3)*SAND.length)]);for(let k=0;k<6;k++)col.push(c.r,c.g,c.b);}}}}
    if(pos.length){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));g.computeVertexNormals();
      const m=new THREE.Mesh(g,new THREE.MeshLambertMaterial({vertexColors:true,side:THREE.DoubleSide,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-2}));m.receiveShadow=true;grp.add(m);detail.shore=Math.round(pos.length/18);}}

  // ---------------------------------------------------------------- the routes, found through the water
  const CELL=K.cell||60,NX=Math.ceil((X1-X0)/CELL),NZ=Math.ceil((Z1-Z0)/CELL),wet=new Uint8Array(NX*NZ);
  for(let j=0;j<NZ;j++)for(let i=0;i<NX;i++){const x=X0+(i+0.5)*CELL,z=Z0+(j+0.5)*CELL;wet[j*NX+i]=inWater(x,z)&&!nearShore(x,z,CELL*0.7)?1:0;}
  const cellOf=(x,z)=>{let best=null,bd=1e18;const ci=Math.floor((x-X0)/CELL),cj=Math.floor((z-Z0)/CELL);
    for(let r=0;r<12&&!best;r++)for(let j=cj-r;j<=cj+r;j++)for(let i=ci-r;i<=ci+r;i++){if(i<0||j<0||i>=NX||j>=NZ||!wet[j*NX+i])continue;const d=(X0+(i+0.5)*CELL-x)**2+(Z0+(j+0.5)*CELL-z)**2;if(d<bd){bd=d;best=[i,j];}}return best;};
  function route(ax,az,bx2,bz){const s=cellOf(ax,az),t=cellOf(bx2,bz);if(!s||!t)return null;const N=NX*NZ,g=new Float32Array(N).fill(1e18),from=new Int32Array(N).fill(-1),done=new Uint8Array(N),open=[];
    const h=k=>Math.hypot(k%NX-t[0],Math.floor(k/NX)-t[1]);const s0=s[1]*NX+s[0],t0=t[1]*NX+t[0];g[s0]=0;open.push([h(s0),s0]);
    while(open.length){let bi=0;for(let i=1;i<open.length;i++)if(open[i][0]<open[bi][0])bi=i;const [,k]=open[bi];open[bi]=open[open.length-1];open.pop();if(done[k])continue;done[k]=1;if(k===t0)break;
      const ki=k%NX,kj=Math.floor(k/NX);for(let dj=-1;dj<=1;dj++)for(let di=-1;di<=1;di++){if(!di&&!dj)continue;const i=ki+di,j=kj+dj;if(i<0||j<0||i>=NX||j>=NZ)continue;const q=j*NX+i;if(!wet[q]||done[q])continue;
        const ng=g[k]+Math.hypot(di,dj);if(ng<g[q]){g[q]=ng;from[q]=k;open.push([ng+h(q),q]);}}}
    if(from[t0]<0&&t0!==s0)return null;const cells=[];for(let k=t0;k>=0;k=from[k]){cells.push([X0+(k%NX+0.5)*CELL,Z0+(Math.floor(k/NX)+0.5)*CELL]);if(k===s0)break;}cells.reverse();
    // pull the string: keep a point only where the straight line to the next kept one would cross land
    const clear=(a,b)=>{const L=Math.hypot(b[0]-a[0],b[1]-a[1]);for(let u=0;u<L;u+=CELL*0.4){const x=a[0]+(b[0]-a[0])*u/L,z=a[1]+(b[1]-a[1])*u/L;if(!inWater(x,z)||nearShore(x,z,CELL*0.5))return false;}return true;};
    const pts=[[ax,az],cells[0]];let i=0;while(i<cells.length-1){let j=cells.length-1;while(j>i+1&&!clear(cells[i],cells[j]))j--;pts.push(cells[j]);i=j;}pts.push([bx2,bz]);
    // round the corners: Chaikin, twice
    let p=pts;for(let it=0;it<2;it++){const q=[p[0]];for(let k=0;k+1<p.length;k++){const a=p[k],b=p[k+1];q.push([a[0]*0.75+b[0]*0.25,a[1]*0.75+b[1]*0.25],[a[0]*0.25+b[0]*0.75,a[1]*0.25+b[1]*0.75]);}q.push(p[p.length-1]);p=q;}
    const cum=[0];for(let k=1;k<p.length;k++)cum.push(cum[k-1]+Math.hypot(p[k][0]-p[k-1][0],p[k][1]-p[k-1][1]));return {pts:p,cum,len:cum[cum.length-1]};}
  const along=(r,s)=>{s=Math.max(0,Math.min(r.len,s));let k=1;while(k<r.cum.length-1&&r.cum[k]<s)k++;const a=r.pts[k-1],b=r.pts[k],f=(s-r.cum[k-1])/((r.cum[k]-r.cum[k-1])||1);return [a[0]+(b[0]-a[0])*f,a[1]+(b[1]-a[1])*f,Math.atan2(b[0]-a[0],b[1]-a[1])];};
  const DOCKS={};for(const [n,ll] of Object.entries(K.docks||{})){const [x,z]=P(ll);DOCKS[n]={x,z};}
  const ROUTES=[];for(const [a,b,n] of (K.routes||[])){const A=DOCKS[a],B=DOCKS[b];if(!A||!B)continue;const r=route(A.x,A.z,B.x,B.z);if(r){r.from=a;r.to=b;r.boats=n||2;ROUTES.push(r);}}

  // ---------------------------------------------------------------- the lanchas
  // built facing +z, 10 m long: the hull (white over a coloured sheer), the benches and their passengers, the tarp
  // roof on its poles, the outboard at the stern
  const hullShape=new THREE.Shape();hullShape.moveTo(-1.1,-5);hullShape.lineTo(1.1,-5);hullShape.lineTo(1.25,1.5);hullShape.quadraticCurveTo(1.1,4.2,0,5.2);hullShape.quadraticCurveTo(-1.1,4.2,-1.25,1.5);hullShape.closePath();
  const hull=new THREE.ExtrudeGeometry(hullShape,{depth:0.9,bevelEnabled:false}).rotateX(Math.PI/2).translate(0,0.75,0);
  // the sheer: a coloured band round the gunwale, the hull's outline less an inset of it
  const sheerShape=new THREE.Shape(hullShape.getPoints(24).map(p=>new THREE.Vector2(p.x*1.02,p.y*1.01)));sheerShape.holes.push(new THREE.Path(hullShape.getPoints(24).map(p=>new THREE.Vector2(p.x*0.88,p.y*0.95)).reverse()));
  const sheer=new THREE.ExtrudeGeometry(sheerShape,{depth:0.22,bevelEnabled:false}).rotateX(Math.PI/2).translate(0,0.97,0);
  const parts=(stripe,tarp)=>{const L=[[hull,'#f2f2ee'],[sheer,stripe],[bx(2.1,0.08,9.2,0,0.32,-0.2),'#c8c2b4'],[bx(0.5,0.9,0.5,0,0.6,-5.3),'#2a2a2e'],[bx(0.15,0.7,0.2,0,0.05,-5.35),'#3a3a3e']];
    for(let k=0;k<5;k++){const z=-3.4+k*1.6;L.push([bx(2.0,0.1,0.35,0,0.75,z),'#8a5a3a']);for(const sx of [-0.55,0,0.55])if(hash3(k,sx,7)<0.75){const sh=['#c83a3a','#3a5ac8','#e8e0d0','#3a8a5a','#d88a2a','#7a3a8a'][Math.floor(hash3(k,sx,8)*6)];L.push([bx(0.36,0.55,0.3,sx,1.05,z),sh],[bx(0.2,0.22,0.2,sx,1.45,z),'#6a4a32']);}}
    for(const [sx,sz] of [[-1,-4.4],[1,-4.4],[-1,3],[1,3]])L.push([bx(0.06,1.6,0.06,sx,1.6,sz),'#c8c8c8']);L.push([bx(2.3,0.06,8.0,0,2.42,-0.7),tarp]);return merge(L);};
  const LIVERY=[['#2a5ab8','#2a4a9a'],['#c83a2a','#1e3a6a'],['#2a8a4a','#3a6a3a'],['#e8b830','#2a5ab8'],['#1e2e4a','#c8c8c8']];
  const BOATS=[];for(const r of ROUTES)for(let k=0;k<r.boats;k++)BOATS.push({r,s:(k/r.boats)*r.len*2,v:(K.speed||9)*(0.9+R()*0.2),liv:Math.floor(R()*LIVERY.length),wait:0,ph:R()*6});
  const boatMeshes=LIVERY.map(([s,t])=>{const im=new THREE.InstancedMesh(parts(s,t),vmat,Math.max(1,BOATS.length));im.count=0;im.castShadow=true;grp.add(im);return im;});
  // the wake: a long pale V on the water behind the stern
  const wakeTex=(()=>{const cv=document.createElement('canvas');cv.width=64;cv.height=256;const c=cv.getContext('2d');const g=c.createLinearGradient(0,0,0,256);g.addColorStop(0,'rgba(255,255,255,0.75)');g.addColorStop(1,'rgba(255,255,255,0)');
    c.strokeStyle=g;c.lineWidth=5;c.beginPath();c.moveTo(32,0);c.lineTo(4,256);c.moveTo(32,0);c.lineTo(60,256);c.stroke();c.fillStyle=g;c.globalAlpha=0.35;c.fillRect(26,0,12,256);return new THREE.CanvasTexture(cv);})();
  const wakes=new THREE.InstancedMesh(new THREE.PlaneGeometry(9,32).rotateX(-Math.PI/2).translate(0,0,-21),new THREE.MeshBasicMaterial({map:wakeTex,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-4,polygonOffsetUnits:-8}),Math.max(1,BOATS.length));
  wakes.count=0;grp.add(wakes);
  let WIND=0,windTo=0;
  const boatAt=(b)=>{const r=b.r,L=r.len,leg=b.s%(2*L),back=leg>L,s=back?2*L-leg:leg,[x,z,a]=along(r,s);return {x,z,ry:back?a+Math.PI:a,moving:b.wait<=0};};
  const poseBoats=(now,dt)=>{const cnt=new Array(LIVERY.length).fill(0);let w=0;
    for(const b of BOATS){if(b.wait>0)b.wait-=dt;else{const L=b.r.len,before=Math.floor(b.s/L);b.s+=b.v*dt;if(Math.floor(b.s/L)!==before)b.wait=K.dwell||45;}
      const q=boatAt(b),roll=Math.sin(now*0.0011+b.ph)*(0.02+WIND*0.09),pitch=Math.sin(now*0.0017+b.ph*2)*(0.01+WIND*0.06)+(q.moving?-0.05:0);
      o.position.set(q.x,WY-0.35+Math.sin(now*0.002+b.ph)*0.05*(1+WIND*3),q.z);o.rotation.set(pitch,q.ry,roll,'YXZ');o.scale.setScalar(1);o.updateMatrix();b.q=q;
      const im=boatMeshes[b.liv];im.setMatrixAt(cnt[b.liv]++,o.matrix);
      if(q.moving){o.position.y=WY+0.04;o.rotation.set(0,q.ry,0);o.updateMatrix();wakes.setMatrixAt(w++,o.matrix);}}
    boatMeshes.forEach((im,i)=>{im.count=cnt[i];im.instanceMatrix.needsUpdate=true;});wakes.count=w;wakes.instanceMatrix.needsUpdate=true;};

  // ---------------------------------------------------------------- the cayucos
  const CAY=K.cayucos||{},cay=[];
  {const zones=CAY.zones||Object.values(K.docks||{}).map(([la,lo])=>[la,lo,900]);for(let t=0;t<(CAY.count||50)*6&&cay.length<(CAY.count||50);t++){const z=zones[Math.floor(R()*zones.length)],p=shorePoint(z,25,(CAY.reach||260));if(p)cay.push({x:p[0],z:p[1],ry:R()*6.28,ph:R()*6,drift:(R()-0.5)*0.3,pad:R()<0.5});}}
  const cayGeo=merge([[new THREE.CylinderGeometry(0.42,0.42,5,8,1,false,0,Math.PI).rotateZ(Math.PI).rotateX(Math.PI/2).translate(0,0.4,0),'#5a3a24'],[bx(0.7,0.06,4.4,0,0.18,0),'#3e2a1a'],
    [bx(0.4,0.5,0.3,0,0.62,-0.6),'#e8e2d6'],[bx(0.24,0.26,0.24,0,1.0,-0.6),'#6a4a32'],[new THREE.CylinderGeometry(0.42,0.42,0.06,10).translate(0,1.16,-0.6),'#d8c08a'],[new THREE.CylinderGeometry(0.16,0.2,0.18,8).translate(0,1.24,-0.6),'#d8c08a'],
    [br(0.06,0.06,1.8,0.5,0,0.45,0.75,-0.3),'#8a6a4a']]);
  const cayM=new THREE.InstancedMesh(cayGeo,vmat,Math.max(1,cay.length));cayM.count=cay.length;cayM.castShadow=true;grp.add(cayM);
  const poseCay=(now)=>{cay.forEach((c,i)=>{o.position.set(c.x+Math.sin(now*0.00005+c.ph)*6,WY-0.3+Math.sin(now*0.0013+c.ph)*0.04*(1+WIND*4),c.z+Math.cos(now*0.00004+c.ph)*6);
    o.rotation.set(Math.sin(now*0.0011+c.ph)*0.03*(1+WIND*3),c.ry+Math.sin(now*0.00007+c.ph)*0.4,Math.sin(now*0.0016+c.ph)*0.04*(1+WIND*3),'YXZ');o.scale.setScalar(1);o.updateMatrix();cayM.setMatrixAt(i,o.matrix);});cayM.instanceMatrix.needsUpdate=true;};

  // ---------------------------------------------------------------- the tul
  {const RD=K.reeds||{};const tex=(()=>{const cv=document.createElement('canvas');cv.width=128;cv.height=256;const c=cv.getContext('2d');
      for(let i=0;i<70;i++){const x=4+Math.random()*120,h=120+Math.random()*130,lean=(Math.random()-0.5)*24,g=110+Math.random()*70|0;c.strokeStyle=`rgb(${g*0.7|0},${g},${g*0.45|0})`;c.lineWidth=1.5+Math.random()*2;
        c.beginPath();c.moveTo(x,256);c.quadraticCurveTo(x+lean*0.3,256-h*0.6,x+lean,256-h);c.stroke();if(Math.random()<0.3){c.fillStyle='#7a5a32';c.fillRect(x+lean-2,256-h-8,4,10);}}
      const t=new THREE.CanvasTexture(cv);return t;})();
    const clump=new THREE.PlaneGeometry(3.2,2.6).translate(0,1.3,0),g2=clump.clone().rotateY(Math.PI/2),g3=clump.clone().rotateY(Math.PI/4);
    const geo=(()=>{const gs=[clump,g2,g3].map(g=>g.toNonIndexed());const pos=[],uv=[];for(const g of gs){pos.push(...g.attributes.position.array);uv.push(...g.attributes.uv.array);}
      const ge=new THREE.BufferGeometry();ge.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));ge.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));ge.computeVertexNormals();return ge;})();
    const pts=[];for(const z of (RD.zones||[]))for(let t=0;t<(z[3]||120)*4&&pts.length<(RD.max||4000);t++){const p=shorePoint(z,1,RD.reach||28);if(p)pts.push(p);}
    if(pts.length){const im=new THREE.InstancedMesh(geo,new THREE.MeshLambertMaterial({map:tex,alphaTest:0.4,side:THREE.DoubleSide}),pts.length);
      pts.forEach(([x,z],i)=>{o.position.set(x,WY-0.25,z);o.rotation.set(0,hash3(x,z,4)*6.28,0);o.scale.set(0.8+hash3(x,z,5)*0.7,0.7+hash3(x,z,6)*0.7,0.8+hash3(x,z,5)*0.7);o.updateMatrix();im.setMatrixAt(i,o.matrix);});
      grp.add(im);detail.reeds=pts.length;}}

  // ---------------------------------------------------------------- the drowned shore
  {const DR=K.drowned||{},trees=[],roofs=[];
    for(const z of (DR.zones||[])){for(let t=0;t<(z[3]||30)*5&&trees.length<(DR.trees||260);t++){const p=shorePoint(z,3,DR.reach||40);if(p)trees.push(p);}
      for(let t=0;t<(z[4]||0)*8;t++){const p=shorePoint(z,6,30);if(p)roofs.push(p);}}
    if(trees.length){const tg=merge([[new THREE.CylinderGeometry(0.12,0.25,7,6).translate(0,2.5,0),'#8a847a'],[br(0.1,2.4,0.1,0,-0.6,0.6,5,0),'#8a847a'],[br(0.08,2,0.08,0,0.5,-0.5,5.4,0.2),'#7a756c'],[br(0.07,1.6,0.07,0.5,0,0,6,-0.4),'#7a756c']]);
      const im=new THREE.InstancedMesh(tg,vmat,trees.length);trees.forEach(([x,z],i)=>{o.position.set(x,WY-1,z);o.rotation.set((hash3(x,z,1)-0.5)*0.2,hash3(x,z,2)*6.28,(hash3(x,z,3)-0.5)*0.2);o.scale.setScalar(0.6+hash3(x,z,4)*0.8);o.updateMatrix();im.setMatrixAt(i,o.matrix);});
      im.castShadow=true;grp.add(im);detail.drownedTrees=trees.length;}
    if(roofs.length){const rg=merge([[bx(6,0.15,5,0,0,0),'#8a5a3a'],[bx(0.25,1.4,0.25,2.8,-0.5,2.3),'#b8b0a0'],[bx(0.25,1.4,0.25,-2.8,-0.5,2.3),'#b8b0a0']]);
      const im=new THREE.InstancedMesh(rg,vmat,roofs.length);roofs.forEach(([x,z],i)=>{o.position.set(x,WY+0.25,z);o.rotation.set(0.12,hash3(x,z,5)*6.28,0);o.scale.setScalar(1);o.updateMatrix();im.setMatrixAt(i,o.matrix);});grp.add(im);detail.drownedRoofs=roofs.length;}}

  // ---------------------------------------------------------------- the Xocomil's whitecaps
  const CAPS=900,capTex=(()=>{const cv=document.createElement('canvas');cv.width=64;cv.height=32;const c=cv.getContext('2d');const g=c.createRadialGradient(32,16,1,32,16,30);g.addColorStop(0,'rgba(255,255,255,0.95)');g.addColorStop(1,'rgba(255,255,255,0)');c.fillStyle=g;c.fillRect(0,0,64,32);return new THREE.CanvasTexture(cv);})();
  const capMat=new THREE.MeshBasicMaterial({map:capTex,transparent:true,depthWrite:false,opacity:0,polygonOffset:true,polygonOffsetFactor:-4,polygonOffsetUnits:-8});
  const caps=new THREE.InstancedMesh(new THREE.PlaneGeometry(1,1).rotateX(-Math.PI/2),capMat,CAPS);caps.visible=false;grp.add(caps);const capS=[];for(let i=0;i<CAPS;i++)capS.push({u:R(),v:R(),ph:R()*6,s:2+R()*5});
  const poseCaps=(now)=>{const p=camera.position,REACH=Math.min(1400,80+(p.y-WY)*5),ox=Math.floor(p.x/REACH)*REACH,oz=Math.floor(p.z/REACH)*REACH;let n=0;
    for(const c of capS){let x=ox+(c.u-0.5)*2*REACH+REACH*0.5,z=oz+(c.v-0.5)*2*REACH+REACH*0.5;const life=(Math.sin(now*0.0007+c.ph)+1)/2;if(life<0.45||!inWater(x,z))continue;
      o.position.set(x,WY+0.06,z);o.rotation.set(0,c.ph,0);o.scale.set(c.s*life*(0.5+WIND),1,c.s*0.4*life*(0.5+WIND));o.updateMatrix();caps.setMatrixAt(n++,o.matrix);}
    caps.count=n;caps.instanceMatrix.needsUpdate=true;};
  let last=performance.now(),capT=0;
  animHooks.push(now=>{const dt=Math.min(0.1,(now-last)/1000)*(api.ctx.evspeed||1);last=now;WIND+=(windTo-WIND)*Math.min(1,dt*0.15);
    poseBoats(now,dt);const p=camera.position;if(p.y-WY<2500)poseCay(now);
    capMat.opacity=Math.min(0.85,WIND*1.2);caps.visible=WIND>0.03;if(caps.visible&&now-capT>200){capT=now;poseCaps(now);}});
  poseBoats(last,0);poseCay(last);
  api.ctx.lake={wind:k=>{windTo=Math.max(0,Math.min(1,k));},windNow:()=>WIND,boats:BOATS,boatAt,routes:ROUTES,docks:DOCKS,WY};
  api.ctx.details=Object.assign(api.ctx.details||{},{lake:Object.assign(detail,{routes:ROUTES.map(r=>r.from+'-'+r.to+':'+Math.round(r.len)),boats:BOATS.length,cayucos:cay.length})});
}
