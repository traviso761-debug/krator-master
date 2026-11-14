// Numenor's landmarks: the Meneltarma with its spiral road, the Hallow and the eagles; Armenelos's walls, the King's
// House and its tower, and Nimloth, the White Tree; the ships in the havens; Calmindon on Tol Uinen; the tombs of the
// Noirinan. Fan work from Tolkien, whose world belongs to the Tolkien Estate; every shape is this project's own.
// src/numenor/main.js hands them to build() as ctx.models; each is handed (L,x,z) as the engine's own models are.
import { mkRng } from '../core/rng.js';

export function landmarks(api){
  const {ctx,THREE,animHooks,scene,camera,nightF,hour,box,group,gh,mergeParts}=api;
  const white=new THREE.MeshPhongMaterial({color:0xf2efe6,specular:0x6a6a66,shininess:14});
  const pale=new THREE.MeshPhongMaterial({color:0xdcd6c6,specular:0x4a4a46,shininess:10});
  const slate=new THREE.MeshPhongMaterial({color:0x3e5a74,specular:0x8aa0b4,shininess:30});
  const silver=new THREE.MeshPhongMaterial({color:0xc8d0d8,specular:0xffffff,shininess:70});
  const V=(x,y,z)=>new THREE.Vector3(x,y,z);
  // Things that have to be seen from a long way off on a map seven hundred kilometres wide (an eagle, a ship) are
  // grown with distance, as Mordor's fellbeasts are: never smaller than this fraction of the view's height.
  const grow=(obj,base,minPx)=>{const d=camera.position.distanceTo(obj.position),need=d*Math.tan(camera.fov*Math.PI/360)*2*(minPx/innerHeight);
    obj.scale.setScalar(Math.max(1,need/base));};

  // ---- a ship: a long hull, a high stern, masts and sails; the Numenoreans' own (no ship from any source) ----
  const shipParts=(len,masts,sailCol)=>{const g=new THREE.Group(),hullM=new THREE.MeshLambertMaterial({color:0x4a3a2c}),deckM=new THREE.MeshLambertMaterial({color:0x8a7454}),
      sailM=new THREE.MeshLambertMaterial({color:sailCol||0xf4f0e4,side:THREE.DoubleSide}),w=len*0.2;
    const hull=new THREE.Mesh(new THREE.CylinderGeometry(w*0.5,w*0.32,len,10,1,false,0,Math.PI).rotateZ(Math.PI/2).rotateX(Math.PI),hullM);
    hull.scale.set(1,1.15,1);hull.position.y=w*0.25;g.add(hull);
    const deck=new THREE.Mesh(new THREE.BoxGeometry(len*0.96,w*0.06,w*0.9),deckM);deck.position.y=w*0.27;g.add(deck);
    const stern=new THREE.Mesh(new THREE.BoxGeometry(len*0.16,w*0.7,w*0.84),hullM);stern.position.set(-len*0.42,w*0.6,0);g.add(stern);
    const prow=new THREE.Mesh(new THREE.ConeGeometry(w*0.12,len*0.22,5).rotateZ(-Math.PI/2-0.35),hullM);prow.position.set(len*0.55,w*0.55,0);g.add(prow);
    for(let k=0;k<masts;k++){const mx=len*(0.22-k*0.3),mh=len*(0.75-k*0.12);
      const mast=new THREE.Mesh(new THREE.CylinderGeometry(w*0.04,w*0.05,mh,5).translate(0,mh/2,0),hullM);mast.position.set(mx,w*0.3,0);g.add(mast);
      const sail=new THREE.Mesh(new THREE.PlaneGeometry(w*2.3,mh*0.55,4,1),sailM);
      {const p=sail.geometry.attributes.position;for(let i=0;i<p.count;i++){const u=p.getX(i)/(w*1.15);p.setZ(i,(1-u*u)*w*0.35);}sail.geometry.computeVertexNormals();}
      sail.rotation.y=Math.PI/2;sail.position.set(mx+w*0.12,w*0.3+mh*0.55,0);g.add(sail);}
    return g;};
  ctx.shipParts=shipParts;

  return {
  meneltarma(L,x,z){   // the Pillar of Heaven: the spiral road up it, the Hallow on top, and the eagles
    const FOOT=L.foot||14000,HAL=L.hallow||650,MH=L.height||3000,parts=[];
    // The ground is a kilometre grid, which makes a mountain a pyramid of facets with a ridge for a summit. The
    // mountain is drawn again here, finely, from the same formula tools/make-numenor.py raised it with: the
    // generator's ground is that land plus the mountain at each grid point, so the land under it is the grid less
    // the mountain as the grid sampled it, and the mountain is added back at full resolution. Where the grid stands
    // higher (between its points on the convex flanks) the grid is kept, so the coarse ground never shows through.
    const T=api.OSM.terrain,ST=T.step,TX0=T.x0/10,TZ0=T.z0/10;
    const mAt=(px,pz)=>{const d=Math.hypot(px-x,pz-z);if(d>=FOOT)return 0;if(d<HAL)return MH;const t=(d-HAL)/(FOOT-HAL),a=Math.atan2(pz-z,px-x);
      const k=1+0.08*Math.sin(a*7+1.3)*t+0.05*Math.sin(a*13)*t;return MH*(0.82*Math.pow(1-t,1.5)+0.18*Math.pow(1-t,6))*k;};
    const mGrid=(px,pz)=>{const fi=(px-TX0)/ST,fj=(pz-TZ0)/ST,i=Math.floor(fi),j=Math.floor(fj),f=fi-i,g=fj-j,X=i*ST+TX0,Z=j*ST+TZ0;
      return (mAt(X,Z)*(1-f)+mAt(X+ST,Z)*f)*(1-g)+(mAt(X,Z+ST)*(1-f)+mAt(X+ST,Z+ST)*f)*g;};
    const fineH=(px,pz)=>{const c=gh(px,pz);return Math.max(c,c-mGrid(px,pz)+mAt(px,pz))+0.6;};
    ctx.menelH=fineH;
    // the coarse ground is pressed down under the fine mountain, so none of its facets shows through
    scene.traverse(o=>{if(!o.isMesh||o.name!=='terrain')return;const p=o.geometry.attributes.position;let hit=0;
      for(let i=0;i<p.count;i++){const px=p.getX(i),pz=p.getZ(i);if(Math.hypot(px-x,pz-z)<FOOT*1.03){p.setY(i,Math.min(p.getY(i),fineH(px,pz)-25));hit++;}}
      if(hit){p.needsUpdate=true;o.geometry.computeBoundingSphere();}});
    {const NR=150,NA=240,pos=[],colr=[],idx=[],cc=new THREE.Color(),grass=new THREE.Color('#6e9a48'),grass2=new THREE.Color('#86a656'),rock=new THREE.Color('#8e887c'),rock2=new THREE.Color('#a49e92'),turf=new THREE.Color('#7aa452');
      const rOf=i=>i===0?0:HAL*0.98*Math.pow(i/12,1)*(i<=12?1:0)+(i>12?HAL*0.98+(FOOT*1.02-HAL*0.98)*Math.pow((i-12)/(NR-12),1.35):0);
      const hsh=(a,b)=>{const t=Math.sin(a*127.1+b*311.7)*43758.5453;return t-Math.floor(t);};
      for(let i=0;i<=NR;i++){const r=rOf(i);for(let k=0;k<NA;k++){const a=k/NA*Math.PI*2,px=x+Math.cos(a)*r,pz=z+Math.sin(a)*r,y=fineH(px,pz);pos.push(px,y,pz);
        // grass on the long lower slopes and the summit, rock where it is steep, the colour broken up
        const e=4,sl=Math.hypot(fineH(px+e*30,pz)-fineH(px-e*30,pz),fineH(px,pz+e*30)-fineH(px,pz-e*30))/(2*e*30),n=hsh(Math.round(px/90),Math.round(pz/90));
        if(r<HAL)cc.copy(turf).lerp(grass2,n*0.5);else{const rk=Math.min(1,Math.max(0,(sl-0.42)*3.2+(n-0.5)*0.5));cc.copy(grass).lerp(grass2,n).lerp(n>0.5?rock2:rock,rk);}
        colr.push(cc.r,cc.g,cc.b);}}
      for(let i=0;i<NR;i++)for(let k=0;k<NA;k++){const a=i*NA+k,b=i*NA+(k+1)%NA,c=(i+1)*NA+k,d=(i+1)*NA+(k+1)%NA;idx.push(a,c,b,b,c,d);}
      const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('color',new THREE.Float32BufferAttribute(colr,3));g.setIndex(idx);g.computeVertexNormals();
      const m=new THREE.Mesh(g,new THREE.MeshLambertMaterial({vertexColors:true}));m.name='meneltarma';m.receiveShadow=true;m.castShadow=false;m.userData.info=L;m.userData.wireCat='ground';scene.add(m);}
    // the road: from the foot, where the Hallow Road comes in, round and round to the summit, three and a half turns
    {const [fx,fz]=L.roadFrom||[FOOT,0],a0=Math.atan2(fz-z,fx-x),N=1400,TURNS=3.5,Wd=9,pos=[],idx=[];
      for(let i=0;i<=N;i++){const t=i/N,r=(FOOT*0.98)*(1-t)+HAL*1.05*t,a=a0+t*TURNS*Math.PI*2,px=x+Math.cos(a)*r,pz=z+Math.sin(a)*r;
        // across the road: outward, so its two edges sit on the slope
        const ox=Math.cos(a)*Wd/2,oz=Math.sin(a)*Wd/2;
        pos.push(px-ox,fineH(px-ox,pz-oz)+1.6,pz-oz,px+ox,fineH(px+ox,pz+oz)+1.6,pz+oz);
        if(i)idx.push(2*i-2,2*i,2*i-1,2*i-1,2*i,2*i+1);}
      const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setIndex(idx);g.computeVertexNormals();
      const road=new THREE.Mesh(g,new THREE.MeshLambertMaterial({color:0xd8ceb4,side:THREE.DoubleSide,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-4}));
      road.userData.info=L;road.receiveShadow=true;scene.add(road);}
    // the Hallow: nothing built, nothing raised. A ring of worn turf where the people stood, and the path up into it
    {const ring=new THREE.Mesh(new THREE.RingGeometry(HAL*0.7,HAL*0.78,64).rotateX(-Math.PI/2),new THREE.MeshLambertMaterial({color:0xb8b49a,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-4}));
      ring.position.set(x,fineH(x,z)+1.2,z);ring.userData.info=L;scene.add(ring);
      // a marker for picking it: an invisible disc over the summit, so a click on the Hallow says what it is
      const pick=new THREE.Mesh(new THREE.CylinderGeometry(HAL,HAL,30,24),new THREE.MeshBasicMaterial({visible:false}));pick.position.set(x,fineH(x,z)+15,z);parts.push(pick);}
    const g=group(L,parts);
    // the eagles of Manwe, keeping watch: three of them circling the summit, high, very slowly
    {const E=[],M=new THREE.MeshLambertMaterial({color:0x5a4632,flatShading:true}),N=L.eagles||3;
      const wingG=new THREE.BufferGeometry();
      wingG.setAttribute('position',new THREE.Float32BufferAttribute([0,0,-0.5, 0,0,0.5, -1.4,0.05,0, 0,0,-0.5, 0,0,0.5, 1.4,0.05,0],3));wingG.computeVertexNormals();
      for(let k=0;k<N;k++){const o=new THREE.Group(),body=new THREE.Mesh(new THREE.ConeGeometry(0.22,1.4,5).rotateX(Math.PI/2),M);o.add(body);
        const wl=new THREE.Mesh(wingG,M);wl.scale.set(1,1,1);o.add(wl);o.userData={k,wl};scene.add(o);E.push(o);}
      const TOP=fineH(x,z),SPAN=6;   // a great eagle: six metres across
      animHooks.push(now=>{const t=now/1000;
        for(const o of E){const k=o.userData.k,a=t*0.05+k*2.1,r=2200+k*900,y=TOP+500+k*220+Math.sin(t*0.2+k)*80;
          o.position.set(x+Math.cos(a)*r,y,z+Math.sin(a)*r);o.rotation.set(0,-a,0.28);
          o.userData.wl.rotation.z=Math.sin(t*1.3+k)*0.08;
          grow(o,SPAN/2.8,4);o.scale.multiplyScalar(SPAN/2.8);}});}
    return g;},

  armenelos(L,x,z){   // the City of Kings: its walls, the King's court, the King's House and its tower, and the White Tree
    const g0=gh(x,z),parts=[],RW=L.walls||2450,TH=L.tower||130;
    // the walls: a ring round the hill, towers along it, four gates
    const NW=96;for(let k=0;k<NW;k++){const a0=k/NW*Math.PI*2,a1=(k+1)/NW*Math.PI*2,am=(a0+a1)/2;
      if(k%24===0)continue;   // the gates
      const x0=x+Math.cos(a0)*RW,z0=z+Math.sin(a0)*RW,x1=x+Math.cos(a1)*RW,z1=z+Math.sin(a1)*RW,len=Math.hypot(x1-x0,z1-z0),mx=(x0+x1)/2,mz=(z0+z1)/2;
      const w=box(mx,gh(mx,mz)-4,mz,len+2,18,6,pale);w.rotation.y=-am+Math.PI/2;parts.push(w);
      if(k%4===0){const tx=x0,tz=z0;const t=new THREE.Mesh(new THREE.CylinderGeometry(8,9,30,10).translate(0,15,0),pale);t.position.set(tx,gh(tx,tz)-4,tz);parts.push(t);}}
    for(let k=0;k<4;k++){const a=(k*24+0.5)/NW*Math.PI*2;for(const s of [-1,1]){const aa=a+s*0.018,tx=x+Math.cos(aa)*RW,tz=z+Math.sin(aa)*RW;
      const t=new THREE.Mesh(new THREE.CylinderGeometry(11,12,38,10).translate(0,19,0),white);t.position.set(tx,gh(tx,tz)-4,tz);parts.push(t);
      const c=new THREE.Mesh(new THREE.ConeGeometry(13,16,10).translate(0,46,0),slate);c.position.copy(t.position);parts.push(c);}}
    // the King's court: a paved square on the top of the hill
    {const court=new THREE.Mesh(new THREE.BoxGeometry(260,2,200).translate(0,1,0),new THREE.MeshLambertMaterial({color:0xe6e0d0}));court.position.set(x,g0-0.5,z);parts.push(court);}
    // the King's House: a long hall with wings, on the north side of the court, and the tower rising out of it
    {const hx=x,hz=z-150,hall=box(hx,g0,hz,180,26,48,white);parts.push(hall);
      const roof=new THREE.Mesh(new THREE.CylinderGeometry(1,1,180,3).rotateZ(Math.PI/2),slate);roof.scale.set(1,14,26);roof.position.set(hx,g0+26+7,hz);parts.push(roof);
      for(const s of [-1,1]){const wg=box(hx+s*110,g0,hz+40,40,20,120,white);parts.push(wg);
        const wr=new THREE.Mesh(new THREE.CylinderGeometry(1,1,120,3).rotateX(Math.PI/2),slate);wr.scale.set(22,11,1);wr.position.set(hx+s*110,g0+20+5.5,hz+40);parts.push(wr);}
      // the tower: slender and white, a lantern and a silver roof on it, the highest thing in the city
      const tw=new THREE.Mesh(new THREE.CylinderGeometry(9,13,TH,16).translate(0,TH/2,0),white);tw.position.set(hx,g0,hz-10);parts.push(tw);
      const band=new THREE.Mesh(new THREE.CylinderGeometry(13,13,5,16).translate(0,TH*0.62,0),silver);band.position.copy(tw.position);parts.push(band);
      const lan=new THREE.Mesh(new THREE.CylinderGeometry(10,10,12,16).translate(0,TH+6,0),new THREE.MeshPhongMaterial({color:0xfff2c8,emissive:0x302010}));lan.position.copy(tw.position);parts.push(lan);
      const cap=new THREE.Mesh(new THREE.ConeGeometry(12,30,16).translate(0,TH+12+15,0),silver);cap.position.copy(tw.position);parts.push(cap);
      ctx.towerLamp=lan.material;}
    // Nimloth, the White Tree, in the middle of the court: a wide crown of white blossom on a pale trunk, fragrant at dusk
    {const tx=x,tz=z+20,trunkM=new THREE.MeshLambertMaterial({color:0xbab4a8}),bloom=new THREE.MeshPhongMaterial({color:0xffffff,emissive:0x2a2a30,shininess:4,flatShading:true});
      const tr=new THREE.Mesh(new THREE.CylinderGeometry(0.9,1.6,10,7).translate(0,5,0),trunkM);tr.position.set(tx,g0+1,tz);parts.push(tr);
      const R=mkRng(1700),crown=[];
      for(let k=0;k<5;k++){const a=k/5*Math.PI*2+0.3,l=5+R()*2;const br=new THREE.Mesh(new THREE.CylinderGeometry(0.3,0.6,l,5).translate(0,l/2,0),trunkM);
        br.position.set(tx,g0+9,tz);br.rotation.set(Math.cos(a)*0.7,0,Math.sin(a)*0.7);parts.push(br);}
      for(let k=0;k<22;k++){const a=R()*Math.PI*2,r=R()*7,b=new THREE.Mesh(new THREE.IcosahedronGeometry(2.2+R()*1.6,1),bloom);
        b.position.set(tx+Math.cos(a)*r,g0+12+R()*5-r*0.25,tz+Math.sin(a)*r);b.scale.y=0.7;crown.push(b);}
      parts.push(mergeParts(crown,bloom));
      // its glow at dusk: faint, and only at dusk and in the night
      animHooks.push(()=>{const n=nightF(hour());bloom.emissive.setRGB(0.16+0.3*n,0.16+0.3*n,0.19+0.32*n);
        if(ctx.towerLamp)ctx.towerLamp.emissive.setRGB(0.2+0.8*n,0.14+0.6*n,0.06+0.25*n);});
      // a low white rail round the tree
      const rail=new THREE.Mesh(new THREE.TorusGeometry(11,0.5,4,32).rotateX(Math.PI/2),white);rail.position.set(tx,g0+1.6,tz);parts.push(rail);}
    // the great houses of the lords round the court
    for(let k=0;k<10;k++){const a=k/10*Math.PI*2+0.3,r=260+(k%3)*40,hx=x+Math.cos(a)*r,hz=z+Math.sin(a)*r;
      const b=box(hx,gh(hx,hz)-1,hz,50,18,30,white);b.rotation.y=-a;parts.push(b);
      const rf=new THREE.Mesh(new THREE.CylinderGeometry(1,1,50,3).rotateZ(Math.PI/2),slate);rf.scale.set(1,8,16);rf.position.set(hx,gh(hx,hz)+17+4,hz);rf.rotation.y=-a;parts.push(rf);}
    return group(L,parts);},

  haven(L,x,z){   // a haven's ships: moored off its quays, sails furled on some, others coming and going (life.js)
    const parts=[],R=mkRng(Math.round(x)^Math.round(z)),n=L.ships||6,A=L.turn||0;
    // toward the water from the town: A is the bearing of the harbour less a right angle, as the generator writes it
    const ux=Math.cos(A),uz=Math.sin(A);
    for(let k=0;k<n;k++){let px=x,pz=z,t=0;
      // out from the town until the water, then a little further, spread along the shore
      const side=(k-(n-1)/2)*70,sx=-uz*side,sz=ux*side;
      while(t<4000&&gh(px+sx,pz+sz)>0.2){t+=40;px=x+ux*t;pz=z+uz*t;}
      px+=sx+ux*(120+R()*120);pz+=sz+uz*(120+R()*120);
      const len=36+R()*28,s=shipParts(len,len>50?3:2,R()<0.3?0xe8dcc0:0xf6f2e8);s.position.set(px,0.4,pz);s.rotation.y=-(A+Math.PI/2+R()*0.3-0.15);
      s.traverse(o=>{if(o.isMesh){o.castShadow=true;o.userData.info=L;}});parts.push(s);}
    return group(L,parts);},

  calmindon(L,x,z){   // the tower on Tol Uinen: round, white, a light at its head
    const g0=Math.max(2,gh(x,z)),H=L.height||90,parts=[];
    const t=new THREE.Mesh(new THREE.CylinderGeometry(7,11,H,14).translate(0,H/2,0),white);t.position.set(x,g0,z);parts.push(t);
    for(const f of [0.35,0.7]){const b=new THREE.Mesh(new THREE.CylinderGeometry(12,12,3,14).translate(0,H*f,0),pale);b.position.copy(t.position);parts.push(b);}
    const lm=new THREE.MeshBasicMaterial({color:0xfff0c0});const lt=new THREE.Mesh(new THREE.CylinderGeometry(6,6,8,12).translate(0,H+4,0),lm);lt.position.copy(t.position);parts.push(lt);
    const cap=new THREE.Mesh(new THREE.ConeGeometry(8,14,12).translate(0,H+8+7,0),slate);cap.position.copy(t.position);parts.push(cap);
    const glow=new THREE.Sprite(new THREE.SpriteMaterial({color:0xffe0a0,transparent:true,opacity:0,depthWrite:false}));glow.position.set(x,g0+H+4,z);glow.scale.set(120,120,1);scene.add(glow);
    animHooks.push(now=>{const n=nightF(hour());glow.material.opacity=n*(0.65+0.2*Math.sin(now*0.002));});
    return group(L,parts);},

  noirinan(L,x,z){   // the Valley of Tombs: a face of rock with the doors of the tombs cut in it, in a row, and a white path
    const parts=[],A=L.turn||0,ux=Math.cos(A),uz=Math.sin(A),nx=-uz,nz=ux;
    const rock=new THREE.MeshPhongMaterial({color:0x8a857a,flatShading:true,shininess:4}),door=new THREE.MeshBasicMaterial({color:0x14120f});
    const N=19;for(let k=0;k<N;k++){const s=(k-(N-1)/2)*42,px=x+nx*s,pz=z+nz*s,y=gh(px,pz);
      const face=box(px+ux*14,y-6,pz+uz*14,40,34,10,rock);face.rotation.y=-Math.atan2(nz,nx);parts.push(face);
      const d=box(px+ux*8.6,y,pz+uz*8.6,6,10,0.6,door);d.rotation.y=-Math.atan2(nz,nx);parts.push(d);
      const lin=box(px+ux*8.4,y+10,pz+uz*8.4,9,1.6,1.2,white);lin.rotation.y=-Math.atan2(nz,nx);parts.push(lin);}
    const path=box(x-ux*4,gh(x,z)-0.6,z-uz*4,N*42,1.2,6,new THREE.MeshLambertMaterial({color:0xe2dccc}));path.rotation.y=-Math.atan2(nz,nx);parts.push(path);
    return group(L,parts);},
  };
}
