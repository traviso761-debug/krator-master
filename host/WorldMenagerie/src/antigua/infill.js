// ---------- infill: the houses OpenStreetMap does not have ----------
// A block in Antigua is walled all the way round by its houses: one storey (now and then two), fronts touching,
// the patios and gardens hidden behind. The map has many of them but not all, and where it has none the block
// reads as a lawn with a few houses on it. This walks every street within C.infill.zones ([lat, lon, radius]),
// both sides, and wherever the frontage is empty - no mapped building, no plaza, park or pitch, no landmark - it
// builds a run of houses: each C.infill.width metres wide (a range), C.infill.depth deep, stopping short of the
// cross streets. A house is a limewashed box with a flat roof behind and a slope of clay tile down to the street;
// C.infill.parapets of them stand behind a moulded parapet instead, C.infill.tapias are not houses but a garden's
// wall, tiled on top, with trees and bougainvillea over it, and half the two-storey ones have a wooden balcony.
// The houses go into api.INFILL ({ring, g, h}) for src/antigua/casas.js to dress. They are not in the layout
// fingerprint: a re-mapped street changes them, which is what they are for.
export function infill(api){
  const {THREE,C,scene,ROADS,AREAS,P,groundH,buildingsAt,inPoly,roadsNear,inWater,animHooks,camera}=api;const K=C.infill;if(!K)return;
  const ZONES=(K.zones||[]).map(([la,lo,r])=>{const [x,z]=P([la,lo]);return [x,z,r];});
  const inZone=(x,z)=>ZONES.some(([zx,zz,r])=>(x-zx)**2+(z-zz)**2<r*r);
  const [W0,W1]=K.width||[7,15],DEPTH=K.depth||11,SET=K.setback||1.3,CLASSES=new Set(K.classes||['residential','living_street','unclassified','tertiary','secondary','pedestrian']);
  const OPEN=new Set(['park','plaza','pitch','cemetery','stadium','garden','play','grass','golf','finca','farm','wood','reserve','parking']);   // (a parking lot is often an atrium or a plaza: La Merced's)
  // the open areas on a 100 m grid, so a test looks at the few that reach that cell
  const AG=new Map();for(const a of AREAS){if(!OPEN.has(a.kind))continue;for(let i=Math.floor(a.bb.x0/100);i<=Math.floor(a.bb.x1/100);i++)for(let j=Math.floor(a.bb.z0/100);j<=Math.floor(a.bb.z1/100);j++){const k=i*100003+j;if(!AG.has(k))AG.set(k,[]);AG.get(k).push(a);}}
  const openAt=(x,z)=>(AG.get(Math.floor(x/100)*100003+Math.floor(z/100))||[]).some(a=>x>=a.bb.x0&&x<=a.bb.x1&&z>=a.bb.z0&&z<=a.bb.z1&&inPoly(x,z,a.o)&&!(a.i||[]).some(h=>inPoly(x,z,h)));
  const LM=(C.landmarks||[]).filter(l=>l.model).map(l=>{const [x,z]=P(l.at);return [x,z,(l.len||l.w||20)*0.75+8];});
  const nearLandmark=(x,z)=>LM.some(([lx,lz,r])=>(x-lx)**2+(z-lz)**2<r*r);
  const built=(x,z)=>buildingsAt(x,z,2).some(b=>inPoly(x,z,b.ring));
  const placed=[],PG=new Map(),pkey=(x,z)=>Math.floor(x/40)*100003+Math.floor(z/40);
  const takenAt=(x,z)=>{for(let i=-1;i<=1;i++)for(let j=-1;j<=1;j++)for(const q of PG.get(pkey(x+i*40,z+j*40))||[])if(inPoly(x,z,q.ring))return true;return false;};
  const hsh=(x,z,s)=>{const k=Math.sin(x*12.9898+z*78.233+s*37.719)*43758.5453;return k-Math.floor(k);};
  // can a house stand on this patch? every sample point free, the back of it clear of any other street
  function free(pts,road){for(const [x,z] of pts){if(!inZone(x,z)||nearLandmark(x,z)||takenAt(x,z)||built(x,z)||openAt(x,z)||inWater(x,z))return false;
      if(roadsNear(x,z,0.8,r=>r.c!=='trail').some(q=>q.road!==road))return false;}return true;}
  for(const road of ROADS){if(!CLASSES.has(road.c)||road.bridge)continue;
    for(let i=0;i+1<road.pts.length;i++){const [ax,az]=road.pts[i],[bx,bz]=road.pts[i+1],L=Math.hypot(bx-ax,bz-az);if(L<W0)continue;
      if(!ZONES.some(([zx,zz,r])=>Math.hypot((ax+bx)/2-zx,(az+bz)/2-zz)<r+L/2+20))continue;
      const ux=(bx-ax)/L,uz=(bz-az)/L;
      for(const sd of [-1,1]){const nx=-uz*sd,nz=ux*sd,off=road.w/2+SET;let s=road.w/2+4;   // clear of the junction at the segment's start
        while(s<L-road.w/2-4-W0){const w=Math.min(W0+hsh(ax+s,az,sd)*(W1-W0),L-road.w/2-4-s);if(w<W0*0.8)break;
          const f0=[ax+ux*s+nx*off,az+uz*s+nz*off],f1=[f0[0]+ux*w,f0[1]+uz*w],b1=[f1[0]+nx*DEPTH,f1[1]+nz*DEPTH],b0=[f0[0]+nx*DEPTH,f0[1]+nz*DEPTH];
          const mid=(p,q,t=0.5)=>[p[0]+(q[0]-p[0])*t,p[1]+(q[1]-p[1])*t],c=mid(f0,b1);
          const samples=[mid(f0,b0,0.15),mid(f1,b1,0.15),mid(f0,b0,0.85),mid(f1,b1,0.85),c,mid(mid(f0,f1),mid(b0,b1),0.15)];
          if(free(samples,road)){const g=Math.min(groundH(...f0),groundH(...f1),groundH(...b0),groundH(...b1)),two=hsh(c[0],c[1],7)<(K.twoStorey||0.12),H=(two?7.8:4.6)+hsh(c[0],c[1],8)*1.4;
            // what stands here: a house with its tile slope, a house behind a parapet, or a garden behind its tapia
            const k9=hsh(c[0],c[1],9),kind=two?'casa':k9<(K.tapias||0.12)?'tapia':k9<(K.tapias||0.12)+(K.parapets||0.25)?'parapet':'casa';
            const rec={ring:[f0,f1,b1,b0],g,h:g+(kind==='tapia'?3.2:H),cx:c[0],cz:c[1],ux,uz,nx,nz,w,two,kind};placed.push(rec);{const k=pkey(...c);if(!PG.has(k))PG.set(k,[]);PG.get(k).push(rec);}s+=w;}
          else s+=2;}}}}
  // ---- draw: a wall box, a flat roof, the tile slope to the street (or a parapet; or a garden wall and its trees);
  // one instanced mesh for each shape, in tiles ----
  const PAL=(C.palette&&C.palette.brick)||['#e0b040','#c8603a','#e8dcc0'],ROOFC=C.roofColours||['#a8583a'],FLAT=C.flatRoofColours||['#b8ac98'],TRIM='#efe8d8',WOOD='#4a2e1a';
  const LEAF=['#3e6a2e','#4a7a34','#36602a','#5a8a3a'],BLOOM=['#c8307a','#d8508a','#e86a2a','#b82a6a'];   // the trees over the tapias, and the bougainvillea on them
  const TILE=500,parts=new Map(),put=(k,x,y,z,sx,sy,sz,ry,rx,c)=>{const t=Math.floor(x/TILE)+','+Math.floor(z/TILE);if(!parts.has(t))parts.set(t,{cx:(Math.floor(x/TILE)+0.5)*TILE,cz:(Math.floor(z/TILE)+0.5)*TILE,box:[],slope:[],crown:[]});parts.get(t)[k].push([x,y,z,sx,sy,sz,ry,rx,c]);};
  let tapias=0,parapets=0,balconies=0;
  for(const q of placed){const [f0,f1,b1]=q.ring,cx=q.cx,cz=q.cz,H=q.h-q.g,ry=-Math.atan2(q.uz,q.ux),wall=PAL[Math.floor(hsh(cx,cz,1)*PAL.length)];
    const fm=[(f0[0]+f1[0])/2,(f0[1]+f1[1])/2],front=(d,y,sx,sy,sz,c,k='box')=>put(k,fm[0]+q.nx*d,y,fm[1]+q.nz*d,sx,sy,sz,ry,0,c);   // d: metres in from the front
    if(q.kind==='tapia'){tapias++;
      front(0.25,q.g+1.45,q.w,3.5,0.5,wall);front(0.25,q.h+0.06,q.w+0.1,0.16,0.8,ROOFC[Math.floor(hsh(cx,cz,3)*ROOFC.length)]);   // the wall and its tiled coping
      const n=q.w>10?2:1;for(let t=0;t<n;t++){const u=(t+0.5)/n-0.5,d=4+hsh(cx,cz,10+t)*4,tx=fm[0]+q.ux*u*q.w*0.7+q.nx*d,tz=fm[1]+q.uz*u*q.w*0.7+q.nz*d,r=2.4+hsh(cx,cz,12+t)*1.8,ty=q.g+3+r*0.8;
        put('box',tx,q.g+(ty-q.g)/2,tz,0.35,ty-q.g,0.35,0,0,'#5a4634');put('crown',tx,ty,tz,r,r*0.85,r,hsh(cx,cz,14+t)*6,0,LEAF[Math.floor(hsh(cx,cz,15+t)*LEAF.length)]);}
      if(hsh(cx,cz,16)<0.6)put('crown',fm[0]+q.ux*(hsh(cx,cz,17)-0.5)*q.w*0.6-q.nx*0.1,q.h+0.2,fm[1]+q.uz*(hsh(cx,cz,17)-0.5)*q.w*0.6-q.nz*0.1,1.6,0.9,1.0,ry,0,BLOOM[Math.floor(hsh(cx,cz,18)*BLOOM.length)]);   // bougainvillea over the top
      continue;}
    put('box',cx,q.g+H/2-0.3,cz,q.w,H+0.6,DEPTH,ry,0,wall);                                                     // the house, its foot sunk a little for the slope
    if(q.kind==='parapet'){parapets++;
      put('box',cx,q.h+0.05,cz,q.w-0.2,0.1,DEPTH-0.6,ry,0,FLAT[Math.floor(hsh(cx,cz,2)*FLAT.length)]);            // the flat roof, all of it
      front(0.18,q.h+0.35,q.w,0.7,0.36,wall);front(-0.05,q.h-0.12,q.w+0.15,0.24,0.5,TRIM);front(-0.05,q.h+0.72,q.w+0.15,0.12,0.46,TRIM);}   // the parapet, its cornice and coping
    else{put('box',cx+q.nx*1.5,q.h+0.05,cz+q.nz*1.5,q.w,0.1,DEPTH-3,ry,0,FLAT[Math.floor(hsh(cx,cz,2)*FLAT.length)]);   // the flat roof behind
      const fd=Math.min(4.5,DEPTH*0.45),rise=1.4,slen=Math.hypot(fd,rise),fx=fm[0]+q.nx*fd/2,fz=fm[1]+q.nz*fd/2;
      put('slope',fx-q.nx*0.4,q.h+rise/2,fz-q.nz*0.4,q.w+0.2,0.16,slen+0.6,ry,Math.atan2(rise,fd)*(q.ux*q.nz-q.uz*q.nx),ROOFC[Math.floor(hsh(cx,cz,3)*ROOFC.length)]);}   // the tiles to the street
    if(q.two&&hsh(cx,cz,19)<0.55){balconies++;const bw=Math.min(q.w*0.6,6),by=q.g+4.3;   // a wooden balcony on the upper floor
      front(-0.45,by,bw,0.15,0.9,WOOD);front(-0.86,by+0.5,bw,0.9,0.06,WOOD);for(const sd of [-1,1])put('box',fm[0]+q.ux*sd*bw/2-q.nx*0.45,by+0.5,fm[1]+q.uz*sd*bw/2-q.nz*0.45,0.06,0.9,0.9,ry,0,WOOD);
      front(-0.02,by+1.25,bw*0.8,2.3,0.1,'#1a1e22');}}                                                        // and the doors behind it
  const BOX=new THREE.BoxGeometry(1,1,1),ICO=new THREE.IcosahedronGeometry(1,0),mat=new THREE.MeshLambertMaterial({color:0xffffff}),leafM=new THREE.MeshLambertMaterial({color:0xffffff,flatShading:true}),M4=new THREE.Matrix4(),Qt=new THREE.Quaternion(),E=new THREE.Euler(),V=new THREE.Vector3(),S=new THREE.Vector3(),col=new THREE.Color();
  // a bounding sphere round each tile, not the shape's own at the origin: otherwise a tile is culled whenever the
  // middle of the map is off screen
  const tileGeo=(G,cx,cz,y)=>{const g=G.clone();g.boundingSphere=new THREE.Sphere(new THREE.Vector3(cx,y,cz),TILE*0.75+20);return g;};
  const tiles=[];for(const t of parts.values())for(const k of ['box','slope','crown']){const L=t[k];if(!L.length)continue;const im=new THREE.InstancedMesh(tileGeo(k==='crown'?ICO:BOX,t.cx,t.cz,L[0][1]),k==='crown'?leafM:mat,L.length);
    // the slope is turned about the wall's own axis: its frame is the house's (yaw ry), then tilted down to the street
    // (rx is signed by which way the box's +z points, to the back or to the street, on that side of the road)
    L.forEach(([x,y,z,sx,sy,sz,ry,rx,c],i)=>{E.set(k==='slope'?-rx:0,ry,0,'YXZ');M4.compose(V.set(x,y,z),Qt.setFromEuler(E),S.set(sx,sy,sz));im.setMatrixAt(i,M4);im.setColorAt(i,col.set(c));});
    im.castShadow=im.receiveShadow=true;im.userData.noFingerprint=true;im.userData.wireCat='buildings';scene.add(im);tiles.push([im,t.cx,t.cz]);}
  const FAR=(K.far||5000);let last=0;animHooks.push(now=>{if(now-last<500)return;last=now;const p=camera.position;for(const [im,x,z] of tiles)im.visible=(x-p.x)**2+(z-p.z)**2<FAR*FAR;});
  api.INFILL=placed;
  api.ctx.details=Object.assign(api.ctx.details||{},{infillHouses:placed.length,infillTapias:tapias,infillParapets:parapets,infillBalconies:balconies});
}
