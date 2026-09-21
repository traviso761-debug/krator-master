// ---------- the inside of a cylinder ----------
// Every other place in the menagerie is built on a plane with gravity pointing down it. This one is not.
// It is a rotating habitat: a cylinder several kilometres across, spun so that what is bolted to the inside
// of the hull is held against it, and the ground is therefore the inside surface of the tube. Walk far
// enough in any direction across it and you come back. Look up and you see the far side of the country
// hanging over you, with its rivers running the wrong way round the sky.
//
// So the whole model is built in cylinder coordinates and mapped into world space once, by one function:
//
//     u   along the axis, in metres, 0 at the south cap
//     a   around the axis, in radians
//     h   height above the hull's inner surface - "up" is towards the axis, so this is subtracted from R
//
//   at(u, a, h) -> (x, y, z), with the axis lying along world x and the world origin at the middle of it
//
// Everything else - the land, the water, the towns, the rail, the end caps - is written in (u, a) and knows
// nothing about the mapping. What makes the place read as what it is: the strips of land and window
// alternating round the circumference, so you always have sky on two sides and country overhead; the sun
// tube down the axis, because there is nowhere else to put a sun; and the fact that the far valleys are
// lit by the same tube from underneath.
import { mkRng } from '../core/rng.js';

export function world(api){
  const {THREE,C,ctx,scene,camera,animHooks,mergeParts}=api;
  const K=C.hab||{};
  const R=K.radius||3200, L=K.length||19000, VALLEYS=K.valleys||3;
  const RNG=mkRng(K.seed||1974);
  const SEGA=K.segA||168, SEGU=K.segU||140;            // how finely the hull is tessellated

  // ---- the one mapping ----
  const at=(u,a,h)=>{const r=R-(h||0);
    return new THREE.Vector3(u-L/2, Math.cos(a)*r, Math.sin(a)*r);};
  const put=(m,u,a,h)=>{const p=at(u,a,h);m.position.copy(p);
    // "down" is outwards, so everything standing on the ground is turned to face the axis
    m.rotation.set(0,0,0);m.rotateX(Math.PI/2);m.rotateY(0);m.up.set(0,0,0);
    m.lookAt(new THREE.Vector3(p.x,0,0));m.rotateX(-Math.PI/2);return m;};

  // which strip of the circumference a bearing falls in: land, or window
  const STRIP=Math.PI*2/(VALLEYS*2);
  const stripOf=a=>Math.floor(((a%(Math.PI*2))+Math.PI*2)%(Math.PI*2)/STRIP);
  const isLand=a=>stripOf(a)%2===0;
  const landMid=k=>(k*2+0.5)*STRIP;

  // ---- the land ----
  // A height field in (u, a), a few tens of metres of relief on a hull several kilometres across: enough to
  // make a valley read as a valley without pretending the place has mountains. Rivers run down the middle of
  // each valley strip because that is where the water would end up; the lakes are where it stops.
  const relief=(u,a)=>{
    const k=stripOf(a), t=(((a%(Math.PI*2))+Math.PI*2)%(Math.PI*2))/STRIP-k;   // across the strip, 0..1
    const s=u/L;
    if(k%2)return 0;                                    // a window is a window
    const across=Math.sin(t*Math.PI);                   // it rises at the seams and falls in the middle
    let h=34*(1-across)+6*Math.sin(s*31+k)+4*Math.sin(s*57+t*9);
    h+=16*Math.sin(s*9.1+k*2.1)*across;
    h-=22*Math.exp(-(((t-0.5)/0.10)**2))*(0.55+0.45*Math.sin(s*13+k));  // the river's own trench
    return h;
  };
  const riverAt=(u,k)=>landMid(k)+STRIP*0.5*0.06*Math.sin(u/L*11+k);   // the line the river takes

  const parts=[],fine=[];
  // The hull's own triangles already face the axis - wound along u and round a, the cross product points
// inwards - so this is front-faced with normals pointing at the sun tube. Drawn back-faced, which is
// what a tube seen from inside usually wants, the whole country is invisible.
const hullM=new THREE.MeshLambertMaterial({color:0x6e6a62,vertexColors:true});
  const glassM=new THREE.MeshBasicMaterial({color:0x0b1020,side:THREE.DoubleSide,transparent:true,opacity:0.22,depthWrite:false});
  const ribM=new THREE.MeshLambertMaterial({color:0x8a8f96,side:THREE.DoubleSide,flatShading:true});
  // seven point lights on one specular surface is seven suns on the water; this is nearly matt
const waterM=new THREE.MeshPhongMaterial({color:0x2c586e,specular:0x22343c,shininess:12,side:THREE.DoubleSide});
  const GREEN=[0x4a6b3a,0x55753f,0x3f5f36,0x6a7d42,0x51683a];
  const CROP=[0x8a8a4a,0x9a8f52,0x77803f,0xa39a5e];

  // ---- the hull, as one buffer ----
  {
    const pos=[],nor=[],col=[],idx=[],rows=[];
    const c=new THREE.Color();
    for(let j=0;j<=SEGU;j++){
      const u=L*j/SEGU,row=[];
      for(let i=0;i<SEGA;i++){
        const a=i/SEGA*Math.PI*2;
        const land=isLand(a);
        const h=land?relief(u,a):0;
        const p=at(u,a,h);
        row.push(pos.length/3);
        pos.push(p.x,p.y,p.z);
        nor.push(0,-Math.cos(a),-Math.sin(a));           // inwards, towards the axis and the light
        if(!land){c.setHex(0x1a1c22);}
        else{
          const k=stripOf(a),t=(((a%(Math.PI*2))+Math.PI*2)%(Math.PI*2))/STRIP-k;
          // Fields, on a grid laid over the hull: a colour per field rather than per vertex, because a
          // colour per vertex is a smear and what this place looks like from three kilometres up is a
          // patchwork. Four hundred metres a side, which is a big field and a small pixel from over there.
          const fu=Math.floor(u/420),fa=Math.floor(t*26);
          const hsh=Math.abs(Math.sin(fu*12.9898+fa*78.233+k*37.719)*43758.5453)%1;
          const near=Math.abs(t-0.5)<0.05;
          c.setHex(near?0x2f5a6e:(hsh<0.42?CROP[Math.floor(hsh*9)%CROP.length]:GREEN[Math.floor(hsh*13)%GREEN.length]));
          c.multiplyScalar(0.86+0.14*(hsh*7%1));
        }
        col.push(c.r,c.g,c.b);
      }
      rows.push(row);
    }
    for(let j=0;j<SEGU;j++)for(let i=0;i<SEGA;i++){
      const a0=rows[j][i],b0=rows[j][(i+1)%SEGA],a1=rows[j+1][i],b1=rows[j+1][(i+1)%SEGA];
      idx.push(a0,a1,b1,a0,b1,b0);
    }
    const g=new THREE.BufferGeometry();
    g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));
    g.setAttribute('normal',new THREE.Float32BufferAttribute(nor,3));
    g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));
    g.setIndex(idx);g.computeBoundingSphere();
    parts.push(new THREE.Mesh(g,hullM));
  }

  // ---- the windows ----
  // Three strips of glass the length of the hull. They are drawn as their own shell just inside the land so
  // they read as panes rather than as holes, and the ribs between the panes are the only structure anyone
  // inside can see holding the place together.
  for(let k=0;k<VALLEYS;k++){
    const a0=(k*2+1)*STRIP,a1=a0+STRIP;
    const pos=[],idx=[],rows=[];
    for(let j=0;j<=40;j++){
      const u=L*j/40,row=[];
      for(let i=0;i<=16;i++){const a=a0+(a1-a0)*i/16,p=at(u,a,-2);row.push(pos.length/3);pos.push(p.x,p.y,p.z);}
      rows.push(row);
    }
    for(let j=0;j<40;j++)for(let i=0;i<16;i++){
      const A=rows[j][i],B=rows[j][i+1],Cc=rows[j+1][i],D=rows[j+1][i+1];idx.push(A,Cc,D,A,D,B);
    }
    const g=new THREE.BufferGeometry();
    g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setIndex(idx);
    g.computeVertexNormals();g.computeBoundingSphere();
    parts.push(new THREE.Mesh(g,glassM));
    // the ribs: one every few hundred metres along, and the two long edges
    const ribs=[];
    for(let j=0;j<=26;j++){
      const u=L*j/26;
      for(let i=0;i<10;i++){
        const a=a0+(a1-a0)*(i+0.5)/10,p0=at(u,a,0),p1=at(u,a+(a1-a0)/10*0.98,0);
        const len=p0.distanceTo(p1);
        const m=new THREE.Mesh(new THREE.BoxGeometry(26,18,len),ribM);
        m.position.copy(p0.clone().add(p1).multiplyScalar(0.5));
        m.lookAt(new THREE.Vector3(m.position.x,0,0));ribs.push(m);
      }
    }
    for(const sd of [0,1]){
      const a=sd?a1:a0;
      for(let j=0;j<40;j++){
        const p0=at(L*j/40,a,0),p1=at(L*(j+1)/40,a,0);
        const m=new THREE.Mesh(new THREE.BoxGeometry(L/40,34,58),ribM);
        m.position.copy(p0.clone().add(p1).multiplyScalar(0.5));
        m.lookAt(new THREE.Vector3(m.position.x,0,0));ribs.push(m);
      }
    }
    parts.push(mergeParts(ribs,ribM));
  }

  // ---- the end caps ----
  // Cones closing each end, terraced, with the axle housing at the middle where the docking is done.
  for(const end of [0,1]){
    // The cones close the tube, so they step *inwards* from the rim: built the other way round they taper
    // away into space and from inside the habitat both ends are open holes with stars in them.
    const u=end?L:0,dir=end?-1:1,caps=[];
    for(let t=0;t<9;t++){
      const r0=R*(1-t/9),r1=R*(1-(t+1)/9),len=R*0.085;
      const cone=new THREE.Mesh(new THREE.CylinderGeometry(r1,r0,len,SEGA/3,1,true).rotateZ(Math.PI/2),
        new THREE.MeshLambertMaterial({color:t%2?0x5d5a54:0x676259,emissive:0x2b2f35,side:THREE.BackSide,flatShading:true}));
      cone.position.set(u-L/2+dir*(t*len+len/2),0,0);caps.push(cone);
    }
    parts.push(...caps);
    const hub=new THREE.Mesh(new THREE.CylinderGeometry(R*0.1,R*0.1,R*0.3,16).rotateZ(Math.PI/2),
      new THREE.MeshLambertMaterial({color:0x8d939a,flatShading:true}));
    hub.position.set(u-L/2+dir*R*0.4,0,0);parts.push(hub);
  }

  // ---- the sun ----
  // A tube down the axis. There is nowhere else to put a sun in a place like this, and it is why the far
  // valleys are lit from underneath: the light comes from the middle of the sky, not from beyond it.
  const sunM=new THREE.MeshBasicMaterial({color:0xfff0cf});
  const sunTube=new THREE.Mesh(new THREE.CylinderGeometry(K.sunR||34,K.sunR||34,L*0.94,12).rotateZ(Math.PI/2),sunM);
  scene.add(sunTube);
  const haloM=new THREE.MeshBasicMaterial({color:0xffe9b8,transparent:true,opacity:0.16,depthWrite:false});
  const halo=new THREE.Mesh(new THREE.CylinderGeometry((K.sunR||34)*4.6,(K.sunR||34)*4.6,L*0.94,12).rotateZ(Math.PI/2),haloM);
  scene.add(halo);

  // ---- the water ----
  // A river down the middle of every valley and a lake where it widens. Drawn back-faced like the hull, so
  // from the far side of the cylinder you see the water of the valley overhead, which is the whole point.
  for(let k=0;k<VALLEYS;k++){
    const pos=[],idx=[],rows=[];
    for(let j=0;j<=70;j++){
      const u=L*j/70,a=riverAt(u,k);
      // in radians: at this radius a hundredth of a strip is about thirty metres of water
      const w=STRIP*(0.011+0.006*Math.sin(u/L*7+k)+0.055*Math.max(0,Math.sin(u/L*3.1+k*2)-0.86)*7);
      const l=at(u,a-w,-4),r=at(u,a+w,-4);
      rows.push([pos.length/3,pos.length/3+1]);pos.push(l.x,l.y,l.z,r.x,r.y,r.z);
    }
    for(let j=0;j<70;j++){const [a0,b0]=rows[j],[a1,b1]=rows[j+1];idx.push(a0,a1,b1,a0,b1,b0);}
    const g=new THREE.BufferGeometry();
    g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setIndex(idx);
    g.computeVertexNormals();g.computeBoundingSphere();
    parts.push(new THREE.Mesh(g,waterM));
  }

  // ---- the field boundaries ----
  // The colours alone read as a patchwork from three kilometres up and as a smear from the ground. Hedges
  // and ditches along the same 420 m grid give the land an edge at every distance, and they are what makes
  // it look farmed rather than painted.
  {
    const hedgeM=new THREE.MeshLambertMaterial({color:0x35502c,flatShading:true});
    const hedges=[];
    for(let k=0;k<VALLEYS;k++){
      const a0=k*2*STRIP, a1=a0+STRIP;
      for(let fu=0;fu<L/420;fu++){                      // the cross-fences, running across the valley
        const u=fu*420;
        if(u<L*0.03||u>L*0.97)continue;
        for(let i=0;i<20;i++){
          const aa=a0+(a1-a0)*(i+0.5)/20;
          if(Math.abs((aa-a0)/(a1-a0)-0.5)<0.06)continue;   // not across the river
          const m=new THREE.Mesh(new THREE.BoxGeometry(2.5,3,(a1-a0)/20*R*0.98),hedgeM);
          put(m,u,aa,relief(u,aa)+1.5);hedges.push(m);
        }
      }
      for(let i=0;i<=26;i++){                            // and the long ones, up the valley
        const aa=a0+(a1-a0)*i/26;
        if(Math.abs(i/26-0.5)<0.07)continue;
        for(let fu=0;fu<L/500;fu++){
          const u=fu*500+250;
          if(u<L*0.03||u>L*0.97)continue;
          const m=new THREE.Mesh(new THREE.BoxGeometry(500*0.98,3,2.5),hedgeM);
          put(m,u,aa,relief(u,aa)+1.5);hedges.push(m);
        }
      }
    }
    parts.push(mergeParts(hedges,hedgeM));
  }

  // ---- what people built ----
  // Towns strung along each valley, the terrace blocks facing the river, and the line that runs the length
  // of the hull past all of them. Everything is small: the hull is the landscape here, and a ten-storey
  // block three kilometres overhead has to read as a town rather than as a smudge.
  const wallM=new THREE.MeshLambertMaterial({color:0xcfc7b4,flatShading:true});
  const roofM=new THREE.MeshLambertMaterial({color:0x7b5f4e,flatShading:true});
  const steelM=new THREE.MeshLambertMaterial({color:0x9aa0a6,flatShading:true});
  const glow=new THREE.MeshBasicMaterial({color:0xffd9a0});
  const walls=[],roofs=[],rails=[],lamps=[],lots=[];
  const TOWNS=K.towns||9;
  for(let k=0;k<VALLEYS;k++){
    for(let t=0;t<TOWNS;t++){
      const u=L*(0.08+0.84*(t+0.5)/TOWNS),a0=riverAt(u,k);
      const side=(t%2)?1:-1;
      const n=26+Math.floor(RNG()*34);
      // A town here is a grid of blocks on a street plan, not a scatter: land is the one thing this place
      // has none of - twenty-seven square kilometres for the whole world - so nothing is built loose.
      const BLK=56,ST=14;
      for(let b=0;b<n;b++){
        const bu=Math.floor(RNG()*7)-3, ba=Math.floor(RNG()*5)-2;
        const du=bu*(BLK+ST)+(RNG()-0.5)*(BLK-16);
        const da=side*(STRIP*0.05)+ba*((BLK+ST)/R)+(RNG()-0.5)*(BLK-16)/R;
        const uu=u+du,aa=a0+da;
        const gh=relief(uu,aa);
        const w=14+RNG()*22,d=11+RNG()*16,hh=9+RNG()*26;
        const m=new THREE.Mesh(new THREE.BoxGeometry(w,hh,d).translate(0,hh/2,0),wallM);
        put(m,uu,aa,gh);walls.push(m);
        lots.push({x:uu,z:aa*1000,w:w,dpt:d,h:hh,ry:0,kind:'town'});   // the shape probe.py hashes
        const rf=new THREE.Mesh(new THREE.BoxGeometry(w*1.08,2.4,d*1.08),roofM);
        put(rf,uu,aa,gh+hh);roofs.push(rf);
        // the windows: what makes a town a town once the tube dims
        const win=new THREE.Mesh(new THREE.BoxGeometry(w*0.8,hh*0.55,d*0.8),glow);
        put(win,uu,aa,gh+hh*0.2);lamps.push(win);
        if(RNG()<0.2){const sp=new THREE.Mesh(new THREE.ConeGeometry(3,18,6),roofM);
          put(sp,uu,aa,gh+hh+2);roofs.push(sp);}
      }
      // the streets of it, as a paved grid
      {const roadM=new THREE.MeshLambertMaterial({color:0x4b4a46,flatShading:true});
       for(let g2=-3;g2<=3;g2++){
         const uu=u+g2*(BLK+ST);
         const strip=new THREE.Mesh(new THREE.BoxGeometry(ST,1.2,(BLK+ST)*5),roadM);
         put(strip,uu,a0+side*STRIP*0.05,relief(uu,a0)+0.6);rails.push(strip);
       }
       for(let g2=-2;g2<=2;g2++){
         const aa=a0+side*STRIP*0.05+g2*((BLK+ST)/R);
         const strip=new THREE.Mesh(new THREE.BoxGeometry((BLK+ST)*7,1.2,ST),roadM);
         put(strip,u,aa,relief(u,aa)+0.6);rails.push(strip);
       }}
      // the quay and a bridge over the river at every town
      const br=new THREE.Mesh(new THREE.BoxGeometry(70,4,STRIP*R*0.14),steelM);
      put(br,u,a0,relief(u,a0)+12);rails.push(br);
    }
    // the line: a viaduct the whole length of the valley, on piers
    for(let j=0;j<120;j++){
      const u=L*(0.04+0.92*j/120),a=riverAt(u,k)+STRIP*0.30;
      const gh=relief(u,a);
      const deck=new THREE.Mesh(new THREE.BoxGeometry(L*0.92/120,3,14),steelM);
      put(deck,u,a,gh+22);rails.push(deck);
      if(j%2===0){const pier=new THREE.Mesh(new THREE.BoxGeometry(5,22,5).translate(0,11,0),steelM);
        put(pier,u,a,gh);rails.push(pier);}
    }
  }
  parts.push(mergeParts(walls,wallM),mergeParts(roofs,roofM),mergeParts(rails,steelM));
  if(lamps.length)parts.push(mergeParts(lamps,glow));

  // ---- cloud ----
  // Weather in a cylinder is a ring: the air is held against the hull by the same spin everything else is,
  // so cloud forms in a band at a height and goes round rather than over. These are flat and thin and sit
  // at about a fifth of the radius, which is where the air stops being useful to breathe.
  {
    const cloudM=new THREE.MeshBasicMaterial({color:0xf4f6f8,transparent:true,opacity:0.1,depthWrite:false});
    const clouds=[];
    for(let k=0;k<(K.clouds||120);k++){
      // over the land, not over the windows: cloud on the glass looks like something on the glass
      const kk=Math.floor(RNG()*VALLEYS),a=kk*2*STRIP+STRIP*(0.12+0.76*RNG());
      const u=L*(0.04+0.92*RNG()),h=R*(0.13+0.09*RNG());
      const g=new THREE.Group();
      for(let q=0;q<3;q++){                            // a few overlapping puffs read better than one lens
        const m=new THREE.Mesh(new THREE.SphereGeometry(1,7,5),cloudM);
        m.scale.set(60+RNG()*150,22+RNG()*26,60+RNG()*130);
        m.position.set((RNG()-0.5)*220,(RNG()-0.5)*18,(RNG()-0.5)*160);g.add(m);
      }
      const p=at(u,a,h);g.position.copy(p);g.lookAt(new THREE.Vector3(p.x,0,0));g.rotateX(-Math.PI/2);
      scene.add(g);clouds.push({m:g,u,a,h,v:(RNG()-0.5)*0.00003});
    }
    animHooks.push(now=>{for(const c of clouds){
      const a=c.a+now*c.v,p=at(c.u,a,c.h);c.m.position.copy(p);
      c.m.lookAt(new THREE.Vector3(p.x,0,0));c.m.rotateX(-Math.PI/2);}});
  }

  // ---- the gliders ----
  // At a tenth of a gravity, a hundred metres under the axis, a person with wings can stay up all afternoon.
  // Everyone who has ever drawn one of these has drawn somebody flying in it, and they were right to.
  {
    const wingM=new THREE.MeshLambertMaterial({color:0xe8e2d0,side:THREE.DoubleSide,flatShading:true});
    const pilotM=new THREE.MeshLambertMaterial({color:0x40464e});
    const gliders=[];
    for(let k=0;k<(K.gliders||7);k++){
      const g=new THREE.Group();
      const wing=new THREE.Mesh(new THREE.BoxGeometry(3.2,0.3,17),wingM);g.add(wing);
      const tail=new THREE.Mesh(new THREE.BoxGeometry(1.6,0.25,5),wingM);tail.position.x=-4.4;g.add(tail);
      const fin=new THREE.Mesh(new THREE.BoxGeometry(1.4,2.2,0.2),wingM);fin.position.set(-4.4,1,0);g.add(fin);
      const body=new THREE.Mesh(new THREE.BoxGeometry(6,0.9,0.9),pilotM);g.add(body);
      scene.add(g);
      gliders.push({g,u:L*(0.1+0.8*RNG()),a:RNG()*Math.PI*2,h:R*(0.55+0.3*RNG()),
        va:(RNG()<0.5?-1:1)*(0.00006+RNG()*0.00009),vu:(RNG()-0.5)*0.02,ph:RNG()*6.28});
    }
    animHooks.push(now=>{for(const q of gliders){
      const a=q.a+now*q.va, h=q.h+Math.sin(now*0.0003+q.ph)*R*0.06;
      const u=q.u+Math.sin(now*0.00012+q.ph)*1400;
      const p=at(u,a,h);q.g.position.copy(p);
      q.g.lookAt(new THREE.Vector3(p.x,0,0));q.g.rotateX(-Math.PI/2);
      q.g.rotateY(q.va>0?Math.PI/2:-Math.PI/2);q.g.rotateZ(q.va>0?0.4:-0.4);
    }});
  }

  // ---- the boats on the river ----
  {
    const boatM=new THREE.MeshLambertMaterial({color:0xd9d2c0,flatShading:true});
    const boats=[];
    for(let k=0;k<(K.boats||18);k++){
      const kk=Math.floor(RNG()*VALLEYS);
      const g=new THREE.Group();
      const hull=new THREE.Mesh(new THREE.BoxGeometry(11,1.6,3.4),boatM);g.add(hull);
      const cab=new THREE.Mesh(new THREE.BoxGeometry(4,1.8,2.6),boatM);cab.position.set(-1,1.7,0);g.add(cab);
      scene.add(g);boats.push({g,k:kk,s:RNG(),dir:RNG()<0.5?-1:1});
    }
    animHooks.push(now=>{for(const b of boats){
      b.s=(b.s+b.dir*0.00002+1)%1;
      const u=L*(0.06+0.88*b.s),a=riverAt(u,b.k),p=at(u,a,-3);
      b.g.position.copy(p);b.g.lookAt(new THREE.Vector3(p.x,0,0));b.g.rotateX(-Math.PI/2);
      b.g.rotateY(b.dir>0?Math.PI/2:-Math.PI/2);
    }});
  }

  // ---- the trains ----
  const trains=[];
  for(let k=0;k<VALLEYS;k++){
    const g=new THREE.Group();
    for(let c=0;c<5;c++){
      const car=new THREE.Mesh(new THREE.BoxGeometry(46,9,11),steelM);car.position.x=c*50;g.add(car);
      const win=new THREE.Mesh(new THREE.BoxGeometry(40,2.6,11.4),glow);win.position.set(c*50,1.4,0);g.add(win);
    }
    scene.add(g);trains.push({g,k,s:RNG(),dir:RNG()<0.5?-1:1});
  }

  // ---- everything into the scene ----
  const grp=new THREE.Group();
  for(const p of parts){p.castShadow=false;p.receiveShadow=false;grp.add(p);}
  scene.add(grp);

  // ---- the day, and the spin ----
  // The tube dims and brightens on a cycle rather than rising and setting, because it cannot set: it runs
  // the length of the sky. Nothing else in the menagerie has a sky that goes dark all at once.
  let t0=performance.now();
  animHooks.push(now=>{
    const t=(now-t0)/1000;
    const day=(t/(K.day||240))%1;
    const lit=Math.max(0.06,Math.sin(day*Math.PI*2)*0.5+0.5);
    sunM.color.setRGB(1*lit,0.94*lit,0.81*lit);
    haloM.opacity=0.05+0.16*lit;
    glow.color.setRGB(1*(1.15-lit),0.85*(1.15-lit),0.6*(1.15-lit));   // the towns light as the tube dims
    hullM.emissive&&hullM.emissive.setRGB(0,0,0);
    for(const tr of trains){
      tr.s=(tr.s+tr.dir*(now-(tr.last||now))/1000*0.0016+1)%1;tr.last=now;
      const u=L*(0.04+0.92*tr.s),a=riverAt(u,tr.k)+STRIP*0.30;
      const p=at(u,a,relief(u,a)+27);
      tr.g.position.copy(p);
      tr.g.lookAt(new THREE.Vector3(p.x,0,0));tr.g.rotateX(-Math.PI/2);tr.g.rotateY(tr.dir>0?Math.PI/2:-Math.PI/2);
    }
  });

  ctx.hab={R,L,at,relief,riverAt,STRIP,VALLEYS,landMid};
  // the same fingerprint every other page keeps, so tools/probe.py can tell whether the place moved:
  // where every building in every town stands, in cylinder coordinates
  ctx.lotList=lots;
  ctx.details=Object.assign(ctx.details||{},{
    hull:(R*2/1000).toFixed(1)+' km across, '+(L/1000).toFixed(0)+' km long',
    valleys:VALLEYS,towns:VALLEYS*TOWNS,buildings:walls.length,
    spinGravity:((R*Math.pow(Math.PI*2/(K.spin||114),2))/9.81).toFixed(2)+' g at the hull'});
}
