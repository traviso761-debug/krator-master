// ---------- the mound, the nest under it, and the savanna round it ----------
// Everything here is in metres at the scene's scale: a worker termite (about 6 mm) is as long as a person is tall,
// so the scale is C.scale (300) to one. The mound is a Macrotermes mound as they stand on the Namibian savanna:
// three metres of sun-baked clay, here 900 m, leaning a little to the north, with lesser turrets on its flanks.
//
// Inside, as the field studies describe it:
//   the nest        a rough ball of chambers at ground level, most of it below: flattened chambers holding the
//                   fungus gardens, joined by galleries just wide enough for two workers to pass
//   the royal cell  a low wide chamber near the bottom of the nest with the queen in it, too big to leave, and
//                   the king beside her; the nurseries round it
//   the chimney     a broad shaft from the top of the nest up the middle of the mound, closed at the top
//   the connectives lateral tunnels out from the chimney to just under the skin, where they branch into the
//                   surface conduits: the lungs, warmed and cooled through the porous wall
//   foraging        tunnels out under the savanna for hundreds of metres to holes in the ground
//   the cellar      shafts down to damp clay far below, where the colony mines water
//
// Hollows are drawn as their own inside surfaces (BackSide), so from inside a gallery you see its walls and from
// the cutaway you see into the far half of everything the cut passes through. The cut face is a canvas painted
// from the same geometry: soil, with every hollow that crosses it punched out.

export function buildMound(K){
  const {THREE,C,R,fabric}=K;
  const V3=THREE.Vector3;
  const H=C.mound.height,RB=C.mound.base,LX=C.mound.lean[0],LZ=C.mound.lean[1];
  const ph=[R()*6.3,R()*6.3,R()*6.3,R()*6.3];

  // ---- the mound's skin: a radius for every height and bearing (the section painter uses it too) ----
  const axis=y=>[LX*Math.max(0,y),LZ*Math.max(0,y)];
  function radius(y,th){const u=Math.min(1,Math.max(0,y)/H);
    const core=RB*Math.pow(1-u,0.9)*(1+0.32*Math.exp(-Math.max(0,y)/38));
    const n=0.09*Math.sin(3*th+y/140+ph[0])+0.06*Math.sin(5*th-y/90+ph[1])+0.035*Math.sin(11*th+y/60+ph[2])+0.02*Math.sin(y/25+2*th+ph[3]);
    return Math.max(0.5,core*(1+n));}
  const surf=(y,th)=>{const [ax,az]=axis(y),r=radius(y,th);return new V3(ax+Math.cos(th)*r,y,az+Math.sin(th)*r);};

  const mats=K.mats;
  // the skin as a grid round the axis, closed at the tip
  {const NT=110,NY=150,pos=[],uv=[],idx=[];
    for(let j=0;j<=NY;j++){const y=-8+(H+8)*Math.pow(j/NY,1.0);for(let i=0;i<=NT;i++){const th=i/NT*Math.PI*2,p=j===NY?new V3(axis(H)[0],H,axis(H)[1]):surf(y,th);
      pos.push(p.x,p.y,p.z);uv.push(i/NT*48,y/22);}}
    for(let j=0;j<NY;j++)for(let i=0;i<NT;i++){const a=j*(NT+1)+i,b=a+1,c=a+NT+1,d=c+1;idx.push(a,c,b,b,c,d);}
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
    g.setIndex(idx);g.computeVertexNormals();const m=new THREE.Mesh(g,mats.clay);m.name='mound';fabric.add(m);}
  // the turrets on its flanks: lesser spires grown out of the main one (kept clear of the cut, which is x = 0)
  for(const [rr,th,h,r0] of C.mound.turrets){const bx=Math.cos(th)*rr,bz=Math.sin(th)*rr,y0=40,NT=48,NY=40,pos=[],uv=[],idx=[],q=R()*6;
    for(let j=0;j<=NY;j++){const y=y0+h*j/NY,u=j/NY;for(let i=0;i<=NT;i++){const t=i/NT*Math.PI*2,r=j===NY?0.3:r0*Math.pow(1-u,0.8)*(1+0.12*Math.sin(3*t+y/30+q)+0.06*Math.sin(7*t-y/14));
      pos.push(bx*(1-0.25*u)+Math.cos(t)*r,y,bz*(1-0.25*u)+Math.sin(t)*r);uv.push(i/NT*16,y/22);}}
    for(let j=0;j<NY;j++)for(let i=0;i<NT;i++){const a=j*(NT+1)+i,b=a+1,c=a+NT+1,d=c+1;idx.push(a,c,b,b,c,d);}
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
    g.setIndex(idx);g.computeVertexNormals();fabric.add(new THREE.Mesh(g,mats.clay));}

  // ---- the hollows: chambers (ellipsoids) and tunnels (swept tubes), all merged into one inside-out mesh ----
  const H_pos=[],H_nor=[],H_col=[],paths=[],chambers=[],mouths=[];
  const colOf=k=>new THREE.Color(C.hollowColours[k]||C.hollowColours.gallery);
  function addEllipsoid(c,ax,b,az,kind){const g=new THREE.SphereGeometry(1,15,9).toNonIndexed(),p=g.attributes.position,col=colOf(kind);
    for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i);H_pos.push(c.x+x*ax,c.y+y*b,c.z+z*az);
      const n=new V3(x/ax,y/b,z/az).normalize();H_nor.push(n.x,n.y,n.z);H_col.push(col.r,col.g,col.b);}g.dispose();}
  // a tube along points with a radius at each: parallel-transported rings
  function sweep(pts,rad,kind,seg=7){const col=colOf(kind),n=pts.length;if(n<2)return;
    const T=[],N=[],Bn=[];for(let i=0;i<n;i++){const a=pts[Math.max(0,i-1)],b=pts[Math.min(n-1,i+1)];T.push(b.clone().sub(a).normalize());}
    let nn=Math.abs(T[0].y)<0.9?new V3(0,1,0):new V3(1,0,0);nn=nn.sub(T[0].clone().multiplyScalar(nn.dot(T[0]))).normalize();
    for(let i=0;i<n;i++){if(i){nn=nn.sub(T[i].clone().multiplyScalar(nn.dot(T[i]))).normalize();}N.push(nn.clone());Bn.push(T[i].clone().cross(nn).normalize());}
    const ring=i=>{const out=[];for(let k=0;k<=seg;k++){const a=k/seg*Math.PI*2,d=N[i].clone().multiplyScalar(Math.cos(a)).addScaledVector(Bn[i],Math.sin(a));out.push([pts[i].clone().addScaledVector(d,rad[i]),d]);}return out;};
    let r0=ring(0);for(let i=1;i<n;i++){const r1=ring(i);for(let k=0;k<seg;k++){for(const [v,d] of [r0[k],r0[k+1],r1[k],r0[k+1],r1[k+1],r1[k]])   /* wound to face out: BackSide shows the inside */{H_pos.push(v.x,v.y,v.z);H_nor.push(d.x,d.y,d.z);H_col.push(col.r,col.g,col.b);}}r0=r1;}
    return {T,N};}
  // a path: kept for the section painter and for whoever walks or blows along it
  function tube(pts,rad,kind,opt={}){if(typeof rad==='number')rad=pts.map(()=>rad);const fr=sweep(pts,rad,kind,opt.seg);
    const L=[0];for(let i=1;i<pts.length;i++)L.push(L[i-1]+pts[i].distanceTo(pts[i-1]));
    const P={pts,rad,kind,L,len:L[L.length-1],N:fr?fr.N:null};paths.push(P);return P;}
  // smooth a few control points into a dense path
  const curve=(ctrl,step=2.5)=>{const c=new THREE.CatmullRomCurve3(ctrl);const n=Math.max(2,Math.ceil(c.getLength()/step));return c.getSpacedPoints(n);};
  // where a direction from a chamber's middle meets its wall
  const wallAt=(ch,d)=>ch.c.clone().addScaledVector(d,1/Math.sqrt((d.x/ch.ax)**2+(d.y/ch.b)**2+(d.z/ch.az)**2));
  function chamber(c,ax,b,az,kind){const ch={c,ax,b,az,kind,links:0};chambers.push(ch);addEllipsoid(c,ax,b,az,kind);return ch;}
  // a gallery between two chambers, wall to wall, with a dark mouth where it opens into each
  function gallery(a,b,r,kind='gallery'){const d=b.c.clone().sub(a.c).normalize(),p0=wallAt(a,d),p1=wallAt(b,d.clone().negate());
    const mid=p0.clone().lerp(p1,0.5).add(new V3((R()-0.5)*8,(R()-0.5)*5,(R()-0.5)*8));
    const P=tube(curve([p0.clone().addScaledVector(d,-0.6),mid,p1.clone().addScaledVector(d,0.6)]),r,kind);mouths.push([p0,d.clone().negate(),r],[p1,d.clone(),r]);a.links++;b.links++;return P;}

  // the nest: chambers packed in a ball, the royal cell and the nurseries near the bottom, the cupola on top
  const NC=new V3(...C.nest.at),NR=C.nest.r;
  const royal=chamber(new V3(NC.x,NC.y-22,NC.z),32,10,22,'royal');
  const cupola=chamber(new V3(NC.x,NC.y+NR*0.86,NC.z),46,20,46,'gallery');
  const comb=[];let tries=0;
  while(comb.length<C.nest.chambers&&tries++<20000){const a=C.nest.size[0]+R()*(C.nest.size[1]-C.nest.size[0]),onCut=R()<C.nest.onCut;
    const p=new V3(onCut?(R()-0.5)*a*0.5:(R()*2-1)*NR,(R()*2-1)*NR*0.92,(R()*2-1)*NR).add(NC);
    if(p.distanceTo(NC)>NR-a-6)continue;if(chambers.some(ch=>Math.hypot((p.x-ch.c.x)/(Math.max(ch.ax,ch.az)+a),(p.y-ch.c.y)/(ch.b+a*0.55),(p.z-ch.c.z)/(Math.max(ch.ax,ch.az)+a))<1.18))continue;
    comb.push(chamber(p,a*(0.9+R()*0.3),a*0.55,a*(0.9+R()*0.3),'gallery'));}
  // the nurseries: the comb chambers nearest the queen
  const nurseries=comb.slice().sort((p,q)=>p.c.distanceTo(royal.c)-q.c.distanceTo(royal.c)).slice(0,5);for(const n of nurseries)n.nursery=true;
  const gardens=comb.filter(c=>!c.nursery);
  // galleries: each chamber to its nearest two or three, and a tree over all of them so nothing is cut off
  const all=chambers.slice(),key=new Set(),link=(a,b,r)=>{const k=Math.min(all.indexOf(a),all.indexOf(b))+'-'+Math.max(all.indexOf(a),all.indexOf(b));if(key.has(k)||a===b)return;key.add(k);gallery(a,b,r);};
  {const inTree=[all[0]],rest=all.slice(1);while(rest.length){let best=null;for(const a of inTree)for(const b of rest){const d=a.c.distanceTo(b.c);if(!best||d<best[2])best=[a,b,d];}link(best[0],best[1],C.nest.gallery);inTree.push(best[1]);rest.splice(rest.indexOf(best[1]),1);}}
  for(const a of all){const near=all.filter(b=>b!==a).sort((p,q)=>p.c.distanceTo(a.c)-q.c.distanceTo(a.c)).slice(0,a.kind==='royal'?6:2);for(const b of near)if(b.c.distanceTo(a.c)<95)link(a,b,C.nest.gallery);}

  // the chimney: up the middle from the cupola nearly to the tip, wide below, narrowing
  const chimTop=H*0.9,chimPts=[];for(let y=cupola.c.y+cupola.b*0.8;y<=chimTop;y+=5){const [ax,az]=axis(y);chimPts.push(new V3(ax,y,az+Math.cos(y/110)*5));}
  const chimney=tube(chimPts,chimPts.map(p=>24-16*(p.y-chimPts[0].y)/(chimTop-chimPts[0].y)),'chimney',{seg:14});
  const chimAt=y=>{let best=chimPts[0];for(const p of chimPts)if(Math.abs(p.y-y)<Math.abs(best.y-y))best=p;return best;};
  // the connectives, out from the chimney to just under the skin, and the conduits that run up under it
  const connectives=[],conduits=[];
  C.mound.connectives.forEach((y,li)=>{for(let k=0;k<6;k++){const th=Math.PI/2+k/6*Math.PI*2+(k%3?li*0.35+R()*0.3:0),c0=chimAt(y),y1=y+45,rIn=radius(y1,th)-20,[ax,az]=axis(y1);
      const p3=new V3(ax+Math.cos(th)*rIn,y1,az+Math.sin(th)*rIn),p1=c0.clone().add(new V3(Math.cos(th)*12,6,Math.sin(th)*12)),p2=c0.clone().lerp(p3,0.6).add(new V3(0,22,0));
      const P=tube(curve([p1,p2,p3],3),(()=>{const pts=curve([p1,p2,p3],3);return pts.map((_,i)=>6-2.5*i/(pts.length-1));})(),'gallery');connectives.push(P);
      for(const s of [-1,0,1]){const pts=[];for(let j=0;j<=22;j++){const yy=y1+j*6.5,t=th+s*(0.12+j*0.012),r=radius(yy,t)-8,[bx,bz]=axis(yy);pts.push(new V3(bx+Math.cos(t)*r,yy,bz+Math.sin(t)*r));}
        conduits.push(tube([p3.clone(),...pts],2.1,'conduit',{seg:7}));}}});
  // the base tunnels: from the nest's flanks out to the skirt at the foot of the mound
  for(let k=0;k<8;k++){const th=k/8*Math.PI*2+0.2,ch=chambers.filter(c=>c.c.y>NC.y).sort((p,q)=>Math.cos(Math.atan2(q.c.z-NC.z,q.c.x-NC.x)-th)-Math.cos(Math.atan2(p.c.z-NC.z,p.c.x-NC.x)-th))[0]||cupola;
    const r1=radius(14,th)-14,p1=new V3(Math.cos(th)*r1,14,Math.sin(th)*r1),d=p1.clone().sub(ch.c).normalize(),p0=wallAt(ch,d);
    tube(curve([p0,p0.clone().lerp(p1,0.5).add(new V3(0,-10,0)),p1]),2.4,'gallery');mouths.push([p0,d.clone().negate(),2.4]);}
  // foraging tunnels: out from the bottom of the nest, along under the savanna, up to a hole in the ground
  const holes=[],forage=[];
  for(let k=0;k<C.foraging.count;k++){const th=k/C.foraging.count*Math.PI*2+(k%(C.foraging.count/4)?R()*0.4:0),onCut=Math.abs(Math.cos(th))<0.01,len=C.foraging.min+R()*(C.foraging.max-C.foraging.min);
    const ch=chambers.filter(c=>c.c.y<NC.y-40).sort((p,q)=>Math.cos(Math.atan2(q.c.z-NC.z,q.c.x-NC.x)-th)-Math.cos(Math.atan2(p.c.z-NC.z,p.c.x-NC.x)-th))[0]||royal;
    const d0=new V3(Math.cos(th),-0.15,Math.sin(th)).normalize(),p0=wallAt(ch,d0),ctrl=[p0];const depth=-28-R()*25;
    for(let j=1;j<=6;j++){const t=j/6,r=NR*0.9+t*(len-NR*0.9),w=th+(onCut?0:Math.sin(t*5+k)*0.08);ctrl.push(new V3(Math.cos(w)*r,depth+Math.sin(t*7+k)*6,Math.sin(w)*r));}
    const e=ctrl[ctrl.length-1];ctrl.push(new V3(e.x,-8,e.z),new V3(e.x,0.5,e.z));
    forage.push(tube(curve(ctrl,3),1.8,'gallery'));mouths.push([p0,d0.clone().negate(),1.8]);holes.push(new V3(e.x,0,e.z));}
  // the cellar: shafts from the bottom of the nest down to damp clay
  const cellar=[];for(let k=0;k<3;k++){const c=new V3(0,C.cellar.depth-(k===1?30:0),NC.z+(k-1)*95),damp=chamber(c,22,8,18,'damp');
    const top=chambers.filter(ch=>ch.kind!=='damp'&&Math.abs(ch.c.x)<ch.ax*0.5).sort((p,q)=>(p.c.y-q.c.y)+0.3*(p.c.distanceTo(c)-q.c.distanceTo(c)))[0];
    const d=new V3(0,-1,0),p0=wallAt(top,d),p1=wallAt(damp,new V3(0,1,0));cellar.push(tube(curve([p0,p0.clone().lerp(p1,0.5).add(new V3(0,0,(R()-0.5)*30)),p1],3),2.4,'damp'));
    mouths.push([p0,new V3(0,1,0),2],[p1,new V3(0,-1,0),2]);cellar.push(damp);}

  {const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(H_pos,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(H_nor,3));
    g.setAttribute('color',new THREE.Float32BufferAttribute(H_col,3));g.computeBoundingSphere();const m=new THREE.Mesh(g,mats.hollow);m.name='hollows';fabric.add(m);}
  // the mouths: a dark disc where each tunnel opens into a chamber, so from inside a chamber the way on shows
  {const pos=[],nor=[];const disc=new THREE.CircleGeometry(1,12).toNonIndexed(),q=new THREE.Quaternion(),z=new V3(0,0,1);
    for(const [p,face,r] of mouths){q.setFromUnitVectors(z,face);const at=p.clone().addScaledVector(face,0.35),dp=disc.attributes.position;
      for(let i=0;i<dp.count;i++){const v=new V3(dp.getX(i)*r*1.15,dp.getY(i)*r*1.15,0).applyQuaternion(q).add(at);pos.push(v.x,v.y,v.z);nor.push(face.x,face.y,face.z);}}
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(nor,3));
    fabric.add(new THREE.Mesh(g,mats.mouth));}

  // ---- the fungus gardens: spongy combs on the chamber floors, white nodules on them ----
  {const pos=[],nor=[],col=[],nod=[];const fine=new THREE.IcosahedronGeometry(1,1).toNonIndexed().attributes.position,coarse=new THREE.IcosahedronGeometry(1,0).toNonIndexed().attributes.position;
    for(const ch of gardens){const near=Math.abs(ch.c.x)<Math.max(ch.ax,ch.az)+12,bp=near?fine:coarse,n=near?7+Math.floor(R()*4):5+Math.floor(R()*3);
      for(let k=0;k<n;k++){const a=R()*Math.PI*2,rr=Math.sqrt(R())*0.62,c=new V3(ch.c.x+Math.cos(a)*rr*ch.ax,ch.c.y-ch.b*0.42+R()*ch.b*0.3,ch.c.z+Math.sin(a)*rr*ch.az),s=Math.min(ch.ax,ch.az)*(0.16+R()*0.12);
        const tint=new THREE.Color(C.comb.colour).offsetHSL(0,(R()-0.5)*0.08,(R()-0.5)*0.1),q=R()*9;
        /* the folds: a ridged sponge, darker in the grooves */
        for(let i=0;i<bp.count;i++){const v=new V3(bp.getX(i),bp.getY(i),bp.getZ(i)),f=Math.sin(v.x*7+q)*Math.sin(v.y*8-q)+Math.sin(v.z*7+q*0.5)*Math.sin(v.x*6-q*0.3),w=1+0.12*f;
          const p=v.clone().multiplyScalar(s*w);p.y*=0.75;p.add(c);pos.push(p.x,p.y,p.z);nor.push(v.x,v.y/0.75,v.z);const sh=0.82+0.18*Math.max(-1,Math.min(1,f));col.push(tint.r*sh,tint.g*sh,tint.b*sh);}
        for(let j=0;j<2;j++){const t=new V3(R()-0.5,0.7+R()*0.3,R()-0.5).normalize();nod.push(c.clone().addScaledVector(t,s*0.95));}}}
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(nor,3));
    g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));g.normalizeNormals();fabric.add(new THREE.Mesh(g,mats.comb));   /* the sphere's own normals: smooth */
    const im=new THREE.InstancedMesh(new THREE.IcosahedronGeometry(0.45,0),mats.nodule,nod.length),m4=new THREE.Matrix4();
    nod.forEach((p,i)=>{m4.makeTranslation(p.x,p.y,p.z);im.setMatrixAt(i,m4);});fabric.add(im);}

  // ---- the savanna: red sand to the horizon, grass as tall as towers, pebbles as big as houses ----
  {const g=new THREE.CircleGeometry(C.savanna.radius,72).rotateX(-Math.PI/2);const m=new THREE.Mesh(g,mats.sand);m.name='ground';fabric.add(m);}
  const tufts=[];
  const inTrench=(x,z,pad=0)=>x>-pad&&x<C.cut.length+pad&&Math.abs(z)<C.cut.half+pad;
  {const blade=new THREE.BufferGeometry(),pos=[],col=[],NS=6;   // one blade: a tapered strip, curving over as it rises
    for(let j=0;j<NS;j++){const y0=j/NS,y1=(j+1)/NS,w0=0.5*(1-y0),w1=0.5*(1-y1),b0=0.35*y0*y0,b1=0.35*y1*y1,c0=0.45+0.55*y0,c1=0.45+0.55*y1;
      for(const [x,y,z,c] of [[-w0,y0,b0,c0],[w0,y0,b0,c0],[w1,y1,b1,c1],[-w0,y0,b0,c0],[w1,y1,b1,c1],[-w1,y1,b1,c1]]){pos.push(x,y,z);col.push(c,c,c);}}
    blade.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));blade.setAttribute('color',new THREE.Float32BufferAttribute(col,3));blade.computeVertexNormals();
    const list=[];for(let t=0;t<C.savanna.tufts;t++){const a=R()*Math.PI*2,d=C.savanna.grassFrom+Math.pow(R(),0.7)*(C.savanna.grassTo-C.savanna.grassFrom),x=Math.cos(a)*d,z=Math.sin(a)*d;
      if(inTrench(x,z,80))continue;const n=8+Math.floor(R()*14),hh=60+R()*120;tufts.push(new V3(x,0,z));
      for(let k=0;k<n;k++){const b=R()*Math.PI*2,o=R()*14;list.push([x+Math.cos(b)*o,z+Math.sin(b)*o,b+(R()-0.5),hh*(0.6+R()*0.5),2.4+R()*2.2,R()]);}}
    const im=new THREE.InstancedMesh(blade,mats.grass,list.length),o=new THREE.Object3D(),c=new THREE.Color();
    list.forEach(([x,z,yaw,h,w,t],i)=>{o.position.set(x,0,z);o.rotation.set(0,yaw,0);o.scale.set(w,h,h);o.updateMatrix();im.setMatrixAt(i,o.matrix);
      im.setColorAt(i,c.set(C.savanna.grass[0]).lerp(new THREE.Color(C.savanna.grass[1]),t));});
    im.name='grass';fabric.add(im);}
  {const list=[];for(let k=0;k<C.savanna.pebbles;k++){const a=R()*Math.PI*2,d=RB*1.25+Math.pow(R(),0.8)*2600,x=Math.cos(a)*d,z=Math.sin(a)*d;if(inTrench(x,z,40))continue;list.push([x,z,2+R()*R()*16,R()*6]);}
    const im=new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1,0),mats.pebble,list.length),o=new THREE.Object3D();
    list.forEach(([x,z,s,r],i)=>{o.position.set(x,s*0.3,z);o.rotation.set(r,r*1.7,r*0.6);o.scale.set(s,s*0.7,s*1.2);o.updateMatrix();im.setMatrixAt(i,o.matrix);});fabric.add(im);}
  // the foraging holes: a little rampart of soil pellets round each
  for(const h of holes){if(inTrench(h.x,h.z,10))continue;const m=new THREE.Mesh(new THREE.TorusGeometry(4.5,1.6,6,14).rotateX(Math.PI/2),mats.clay);m.position.set(h.x,0.4,h.z);fabric.add(m);}
  // water standing on the cellar floors
  for(const ch of chambers)if(ch.kind==='damp'){const m=new THREE.Mesh(new THREE.CircleGeometry(1,24).rotateX(-Math.PI/2),mats.water);m.scale.set(ch.ax*0.62,1,ch.az*0.62);m.position.set(ch.c.x,ch.c.y-ch.b*0.72,ch.c.z);fabric.add(m);}
  // other mounds across the savanna: older ones worn down to domes, a young one still a spire
  for(const [x,z,h,r,worn] of C.savanna.others){const NT=40,NY=26,pos=[],uv=[],idx=[],q=R()*6;
    for(let j=0;j<=NY;j++){const u=j/NY,y=h*u;for(let i=0;i<=NT;i++){const t=i/NT*Math.PI*2,rr=j===NY?0.5:r*(worn?Math.sqrt(Math.max(0,1-u*u)):Math.pow(1-u,0.9)*(1+0.3*Math.exp(-y/(h*0.05))))*(1+0.08*Math.sin(3*t+q+y/80)+0.04*Math.sin(7*t-y/40));
      pos.push(x+Math.cos(t)*rr,y,z+Math.sin(t)*rr);uv.push(i/NT*16,y/22);}}
    for(let j=0;j<NY;j++)for(let i=0;i<NT;i++){const a=j*(NT+1)+i,b=a+1,c=a+NT+1,d=c+1;idx.push(a,c,b,b,c,d);}
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();
    fabric.add(new THREE.Mesh(g,worn?mats.clayOld:mats.clay));}
  // an acacia on the horizon: six metres of tree is nearly two kilometres here
  {const [ax,az,s]=C.savanna.acacia,parts=new THREE.Group();parts.position.set(ax,0,az);
    const trunk=new THREE.Mesh(new THREE.CylinderGeometry(0.03*s,0.06*s,0.62*s,8).translate(0,0.31*s,0),mats.bark);parts.add(trunk);
    for(let k=0;k<4;k++){const a=k*1.6+0.4,b=new THREE.Mesh(new THREE.CylinderGeometry(0.015*s,0.03*s,0.35*s,6).translate(0,0.175*s,0),mats.bark);b.position.set(0,0.5*s,0);b.rotation.set(Math.sin(a)*0.7,0,Math.cos(a)*0.7);parts.add(b);}
    for(let k=0;k<9;k++){const a=k/9*Math.PI*2,r=k?0.22*s:0,c=new THREE.Mesh(new THREE.SphereGeometry(0.2*s,10,6),mats.canopy);c.scale.set(1.3,0.28,1.3);c.position.set(Math.cos(a)*r,0.72*s+(k%2)*0.03*s,Math.sin(a)*r);parts.add(c);}
    fabric.add(parts);}

  // ---- the cut: its face painted from the geometry, and the walls of the trench beside the mound ----
  const CUT=C.cut,cutGroup=new THREE.Group();cutGroup.name='cut';cutGroup.visible=false;
  {const Z0=-CUT.half,Z1=CUT.half,Y0=CUT.floor,Y1=H+20,W=1024,HH=Math.round(W*(Y1-Y0)/(Z1-Z0)),sx=W/(Z1-Z0),sy=HH/(Y1-Y0);
    const cv=document.createElement('canvas');cv.width=W;cv.height=HH;const g=cv.getContext('2d');
    const px=z=>(Z1-z)*sx,py=y=>(Y1-y)*sy;   // plane: canvas x runs toward -z (the plane faces +x)
    // the soil in its layers, then the mound above the ground; a grain of pellets over everything
    const strata=[[0,'#b4643a'],[-45,'#a85c36'],[-130,'#9b6846'],[-260,'#8c705a'],[-380,'#6f5a4a']];
    for(let i=0;i<strata.length;i++){const yt=strata[i][0],yb=i+1<strata.length?strata[i+1][0]:Y0;g.fillStyle=strata[i][1];g.fillRect(0,py(yt),W,py(yb)-py(yt)+1);}
    {const img=g.getImageData(0,0,W,HH),d=img.data,col=new THREE.Color(C.mound.sectionColour);
      for(let j=0;j<py(0);j++){const y=Y1-j/sy,[ax,az]=axis(y);for(let i=0;i<W;i++){const z=Z1-i/sx,th=Math.atan2(z-az,0-ax),dd=Math.hypot(ax,z-az),o=(j*W+i)*4;
        if(y>0&&dd<radius(y,th)){d[o]=col.r*255;d[o+1]=col.g*255;d[o+2]=col.b*255;d[o+3]=255;}else{d[o+3]=0;}}}
      for(let i=0;i<d.length;i+=4){if(!d[i+3])continue;const n=(K.R2()-0.5)*26;d[i]+=n;d[i+1]+=n*0.8;d[i+2]+=n*0.6;}
      g.putImageData(img,0,0);}
    // the hollows the cut passes through: a smoothed lining, then out
    const holes2=[];
    for(const ch of chambers)if(Math.abs(ch.c.x)<ch.ax){const k=Math.sqrt(1-(ch.c.x/ch.ax)**2);holes2.push(['e',ch.c.z,ch.c.y,ch.az*k,ch.b*k]);}
    for(const P of paths)for(let i=0;i<P.pts.length;i++){const p=P.pts[i],r=P.rad[i];if(Math.abs(p.x)<r)holes2.push(['c',p.z,p.y,Math.sqrt(r*r-p.x*p.x)]);}
    const draw=(h,grow)=>{g.beginPath();if(h[0]==='e')g.ellipse(px(h[1]),py(h[2]),(h[3]+grow)*sx,(h[4]+grow)*sy,0,0,Math.PI*2);else g.arc(px(h[1]),py(h[2]),(h[3]+grow)*sx,0,Math.PI*2);g.fill();};
    g.fillStyle='rgba(70,36,18,0.55)';for(const h of holes2)draw(h,1.6);
    g.globalCompositeOperation='destination-out';g.fillStyle='#000';for(const h of holes2)draw(h,0);g.globalCompositeOperation='source-over';
    const t=new THREE.CanvasTexture(cv);t.anisotropy=K.aniso;
    const face=new THREE.Mesh(new THREE.PlaneGeometry(Z1-Z0,Y1-Y0).rotateY(Math.PI/2).translate(0,(Y0+Y1)/2,(Z0+Z1)/2),new THREE.MeshLambertMaterial({map:t,alphaTest:0.5,side:THREE.DoubleSide}));
    face.userData.noClip=true;face.userData.noFingerprint=true;face.name='section';cutGroup.add(face);
    // the trench's other walls, painted the same way: the soil in its layers, and every tunnel that crosses a wall
    // (the foraging tunnels, mostly) punched through it, so you see into the part of it beyond
    const L=CUT.length,D=-Y0;
    function wall(len,dist,uOf){const WW=2048,WH=Math.round(WW*D/len),wx=WW/len,wy=WH/D,c=document.createElement('canvas');c.width=WW;c.height=WH;const w=c.getContext('2d');
      for(let i=0;i<strata.length;i++){const yt=strata[i][0],yb=i+1<strata.length?strata[i+1][0]:Y0;w.fillStyle=strata[i][1];w.fillRect(0,(0-yt)*wy,WW,(yt-yb)*wy+1);}
      {const img=w.getImageData(0,0,WW,WH),d=img.data;for(let i=0;i<d.length;i+=4){const n=(K.R2()-0.5)*22;d[i]+=n;d[i+1]+=n*0.8;d[i+2]+=n*0.6;}w.putImageData(img,0,0);}
      const hs=[];for(const P of paths)for(let i=0;i<P.pts.length;i++){const p=P.pts[i],r=P.rad[i],dd=dist(p);if(Math.abs(dd)<r&&p.y<0){const u=uOf(p);if(u>-r&&u<len+r)hs.push([u,p.y,Math.sqrt(r*r-dd*dd)]);}}
      const dr=(h,gr)=>{w.beginPath();w.arc(h[0]*wx,(0-h[1])*wy,(h[2]+gr)*wx,0,Math.PI*2);w.fill();};
      w.fillStyle='rgba(50,24,12,0.6)';for(const h of hs)dr(h,3.5);w.fillStyle='rgba(70,36,18,0.5)';for(const h of hs)dr(h,1.5);w.globalCompositeOperation='destination-out';for(const h of hs)dr(h,0);w.globalCompositeOperation='source-over';
      const t=new THREE.CanvasTexture(c);t.anisotropy=K.aniso;return new THREE.MeshLambertMaterial({map:t,alphaTest:0.5,side:THREE.DoubleSide});}
    for(const s of [-1,1]){const w=new THREE.Mesh(new THREE.PlaneGeometry(L,D).translate(L/2,-D/2,s*CUT.half),wall(L,p=>p.z-s*CUT.half,p=>p.x));w.userData.noClip=true;cutGroup.add(w);}
    {const w=new THREE.Mesh(new THREE.PlaneGeometry(2*CUT.half,D).rotateY(Math.PI/2).translate(L,-D/2,0),wall(2*CUT.half,p=>p.x-L,p=>CUT.half-p.z));w.userData.noClip=true;cutGroup.add(w);}
    const fl=new THREE.MeshLambertMaterial({color:strata[strata.length-1][1]});
    {const f=new THREE.Mesh(new THREE.PlaneGeometry(L,2*CUT.half).rotateX(-Math.PI/2).translate(L/2,Y0,0),fl);f.userData.noClip=true;cutGroup.add(f);}
    for(const o of cutGroup.children)o.userData.noFingerprint=true;
    K.scene.add(cutGroup);}

  return {radius,axis,surf,paths,chambers,royal,cupola,gardens,nurseries,chimney,connectives,conduits,forage,cellar,holes,tufts,cutGroup,inTrench};
}
