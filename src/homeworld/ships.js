// ---------- Homeworld: the ships ----------
// Fan work. Homeworld belongs to its makers (Relic Entertainment, and now Gearbox); nothing from the game, its
// models or its art is used, and every shape here is this project's own geometry, built after the general
// silhouettes: the Mothership's curved tower, the Scaffold's cradle of girders, the small craft. Every builder
// returns a group facing +x, and every one is baked (bake, below): its parts merged into one mesh for each
// material, so a fighter is two or three draw calls and not twenty.
import {mkRng} from '../core/rng.js';

export function shipKit(THREE){
  const P=(c,o)=>new THREE.MeshPhongMaterial(Object.assign({color:c,specular:0x3a3a3a,shininess:24,flatShading:true},o||{}));
  // the two sides' colours: the Kushan pale hull with the desert's orange on it; the Taiidan dark red and gold
  const M={hull:P(0xbcb7ac),hull2:P(0x9c978d),hull3:P(0x86827a),dark:P(0x3a3836),stripe:P(0xc8582a),metal:P(0x6c7278,{shininess:50}),glass:P(0x223040,{specular:0x9ab8d8,shininess:90}),
    lit:new THREE.MeshBasicMaterial({color:0xffe2a8}),blue:new THREE.MeshBasicMaterial({color:0xbfe0ff}),amber:new THREE.MeshBasicMaterial({color:0xffb050}),
    red:new THREE.MeshBasicMaterial({color:0xff3a2a}),green:new THREE.MeshBasicMaterial({color:0x3aff6a}),white:new THREE.MeshBasicMaterial({color:0xffffff}),
    tai:P(0x6a2226),tai2:P(0x3a1c1e),tai3:P(0x8a3a30),gold:P(0xc8a040,{shininess:60}),drone:P(0x8a8a82),rock:P(0x6e645a),rock2:P(0x5a5048)};
  const box=(g,w,h,d,mat,x,y,z,r)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);m.position.set(x||0,y||0,z||0);if(r)m.rotation.set(r[0]||0,r[1]||0,r[2]||0);g.add(m);return m;};
  const cyl=(g,r0,r1,l,mat,x,y,z,axis,seg)=>{const m=new THREE.Mesh(new THREE.CylinderGeometry(r0,r1,l,seg||12),mat);if(axis==='x')m.rotation.z=-Math.PI/2;else if(axis==='z')m.rotation.x=Math.PI/2;m.position.set(x||0,y||0,z||0);g.add(m);return m;};
  const cone=(g,r,l,mat,x,y,z,seg)=>{const m=new THREE.Mesh(new THREE.ConeGeometry(r,l,seg||8),mat);m.rotation.z=-Math.PI/2;m.position.set(x||0,y||0,z||0);g.add(m);return m;};
  // a flat plate cut to a shape in the x-z plane and given thickness: wings, blades, fins
  const plate=(g,pts,th,mat,y,sd)=>{const s=new THREE.Shape();pts.forEach(([x,z],i)=>i?s.lineTo(x,z*(sd||1)):s.moveTo(x,z*(sd||1)));
    const geo=new THREE.ExtrudeGeometry(s,{depth:th,bevelEnabled:false});geo.rotateX(Math.PI/2);geo.translate(0,(y||0)+th/2,0);const m=new THREE.Mesh(geo,mat);g.add(m);return m;};

  // ---- baking: every mesh under a group merged into one per material, keeping its texture co-ordinates ----
  // keep: groups (or meshes) left as they are, because something moves them or changes them
  function bake(g,keep){const K=new Set(keep||[]);g.updateMatrixWorld(true);const inv=g.matrixWorld.clone().invert();
    const by=new Map(),drop=[];
    g.traverse(o=>{if(!o.isMesh||o.isInstancedMesh)return;for(let a=o;a&&a!==g;a=a.parent)if(K.has(a))return;
      let L=by.get(o.material);if(!L){L=[];by.set(o.material,L);}L.push(o);drop.push(o);});
    const m4=new THREE.Matrix4(),nm=new THREE.Matrix3(),v=new THREE.Vector3();
    for(const [mat,list] of by){const pos=[],nor=[],uv=[];
      for(const o of list){m4.multiplyMatrices(inv,o.matrixWorld);nm.getNormalMatrix(m4);const geo=o.geometry.index?o.geometry.toNonIndexed():o.geometry;
        const p=geo.attributes.position,n=geo.attributes.normal,u=geo.attributes.uv;
        for(let i=0;i<p.count;i++){v.fromBufferAttribute(p,i).applyMatrix4(m4);pos.push(v.x,v.y,v.z);
          if(n){v.fromBufferAttribute(n,i).applyNormalMatrix(nm).normalize();nor.push(v.x,v.y,v.z);}else nor.push(0,1,0);uv.push(u?u.getX(i):0,u?u.getY(i):0);}}
      const G=new THREE.BufferGeometry();G.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));G.setAttribute('normal',new THREE.Float32BufferAttribute(nor,3));G.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
      G.computeBoundingSphere();g.add(new THREE.Mesh(G,mat));}
    for(const o of drop)o.parent.remove(o);
    return g;}

  // ---- the hull plating ----
  // Big plates, not tiles: runs of long plates in courses, each a shade off its neighbours, the seams dark,
  // insets and louvres let into some of them, the livery bands in orange, rows of ports lit along some
  // courses, and the grime of sixty years in orbit streaked down the lot.
  const plating=(()=>{const S=1024,c=document.createElement('canvas'),e=document.createElement('canvas');c.width=e.width=c.height=e.height=S;
    const g=c.getContext('2d'),ge=e.getContext('2d'),R=mkRng(1999);g.fillStyle='#b9b4a9';g.fillRect(0,0,S,S);ge.fillStyle='#000';ge.fillRect(0,0,S,S);
    const course=[40,56,72,96];let y=0;
    while(y<S){const h=course[Math.floor(R()*course.length)];let x=-Math.floor(R()*120);
      while(x<S){const w=80+Math.floor(R()*5)*48,v=R();const base=v<0.08?[142,137,128]:v<0.22?[168,163,154]:v<0.88?[186,181,170]:[200,196,186];
        const j=(R()-0.5)*10;g.fillStyle=`rgb(${base[0]+j|0},${base[1]+j|0},${base[2]+j|0})`;g.fillRect(x+2,y+2,w-3,h-3);
        g.fillStyle='rgba(255,255,255,0.08)';g.fillRect(x+2,y+2,w-3,2);                       // a lit upper edge
        g.fillStyle='rgba(0,0,0,0.16)';g.fillRect(x+2,y+h-3,w-3,2);                          // a shadowed lower one
        const r=R();
        if(r<0.12){g.fillStyle='rgba(60,58,54,0.55)';g.fillRect(x+10,y+8,w-20,h-16);g.strokeStyle='rgba(30,28,26,0.6)';g.strokeRect(x+10.5,y+8.5,w-21,h-17);}
        else if(r<0.2){g.fillStyle='rgba(90,86,80,0.5)';for(let q=x+12;q<x+w-12;q+=10)g.fillRect(q,y+10,5,h-20);}      // louvres
        else if(r<0.26){g.fillStyle='#c8582a';g.fillRect(x+2,y+2,w-3,h-3);g.fillStyle='rgba(0,0,0,0.15)';g.fillRect(x+2,y+h-8,w-3,5);}
        if(R()<0.35){g.fillStyle='rgba(40,38,34,0.6)';for(const [px,py] of [[6,6],[w-8,6],[6,h-8],[w-8,h-8]])g.fillRect(x+px,y+py,2,2);}   // rivets
        if(R()<0.13){const n=Math.floor((w-16)/9);for(let q=0;q<n;q++){const px=x+10+q*9;g.fillStyle='#2a2826';g.fillRect(px,y+h/2-3,5,5);
            if(R()<0.75){ge.fillStyle=R()<0.85?'#ffd08a':'#bfe0ff';ge.fillRect(px,y+h/2-3,5,5);}}}
        x+=w;}
      g.fillStyle='rgba(30,28,24,0.9)';g.fillRect(0,y,S,2);y+=h;}
    // the livery: a broad orange band and a narrow dark one, across every tile
    g.fillStyle='#c8582a';g.fillRect(0,610,S,34);g.fillStyle='#3a3836';g.fillRect(0,648,S,8);g.fillStyle='#e0a040';g.fillRect(0,660,S,4);
    // the grime, in streaks down the plates
    for(let q=0;q<180;q++){const x=R()*S,w=2+R()*14,y0=R()*S,h=40+R()*260;const gr=g.createLinearGradient(0,y0,0,y0+h);gr.addColorStop(0,'rgba(50,44,36,0.12)');gr.addColorStop(1,'rgba(50,44,36,0)');g.fillStyle=gr;g.fillRect(x,y0,w,h);}
    const T=new THREE.CanvasTexture(c),TE=new THREE.CanvasTexture(e);for(const t of [T,TE]){t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(1/520,1/520);t.anisotropy=8;}return {T,TE};})();
  const plateM=new THREE.MeshPhongMaterial({map:plating.T,emissiveMap:plating.TE,emissive:0xffffff,emissiveIntensity:0.9,specular:0x333333,shininess:22,flatShading:true,side:THREE.DoubleSide});
  // the hangar's mouth: a painting of the inside of it - the deck going back in lamplit perspective, the
  // gantries overhead, a ship on the cradle - so that from outside there is depth in it
  const bayTex=(()=>{const W=512,H=256,c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d'),R=mkRng(77);
    const gr=g.createLinearGradient(0,0,0,H);gr.addColorStop(0,'#2a2018');gr.addColorStop(0.5,'#6a4a2a');gr.addColorStop(1,'#1a140e');g.fillStyle=gr;g.fillRect(0,0,W,H);
    const vx=W/2,vy=H*0.46;
    g.strokeStyle='rgba(255,200,120,0.45)';g.lineWidth=2;for(let q=-8;q<=8;q++){g.beginPath();g.moveTo(vx+q*6,vy);g.lineTo(vx+q*70,H);g.stroke();}
    for(let q=1;q<9;q++){const t=q/9,y=vy+(H-vy)*t*t;g.strokeStyle=`rgba(255,190,110,${0.15+0.3*t})`;g.beginPath();g.moveTo(0,y);g.lineTo(W,y);g.stroke();}
    for(let q=1;q<8;q++){const t=q/8,y=vy-vy*t*t;g.strokeStyle='rgba(40,34,28,0.9)';g.lineWidth=4*t+1;g.beginPath();g.moveTo(0,y);g.lineTo(W,y);g.stroke();}
    for(let q=0;q<30;q++){const t=R(),x=vx+(R()-0.5)*W*t,y=vy-vy*t*0.9;g.fillStyle='rgba(255,230,170,0.9)';g.fillRect(x,y,2+t*3,1+t*2);}
    const rg=g.createRadialGradient(vx,vy,4,vx,vy,120);rg.addColorStop(0,'rgba(255,220,160,0.9)');rg.addColorStop(1,'rgba(255,220,160,0)');g.fillStyle=rg;g.fillRect(0,0,W,H);
    g.fillStyle='rgba(60,56,50,0.95)';g.fillRect(vx-60,vy+10,120,26);g.fillRect(vx-20,vy-4,40,16);
    return new THREE.CanvasTexture(c);})();
  const bayM=new THREE.MeshBasicMaterial({map:bayTex});
  // the glow in an engine's throat, and its plume: white at the heart, blue out to the rim
  const glowTex=(()=>{const c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d'),gr=g.createRadialGradient(64,64,0,64,64,64);
    gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(0.35,'rgba(190,225,255,0.95)');gr.addColorStop(0.75,'rgba(80,140,255,0.5)');gr.addColorStop(1,'rgba(40,80,255,0)');g.fillStyle=gr;g.fillRect(0,0,128,128);return new THREE.CanvasTexture(c);})();
  const plumeTex=(()=>{const c=document.createElement('canvas');c.width=16;c.height=128;const g=c.getContext('2d'),gr=g.createLinearGradient(0,0,0,128);
    gr.addColorStop(0,'rgba(60,110,255,0)');gr.addColorStop(0.55,'rgba(110,160,255,0.16)');gr.addColorStop(0.9,'rgba(180,215,255,0.42)');gr.addColorStop(1,'rgba(220,240,255,0.55)');g.fillStyle=gr;g.fillRect(0,0,16,128);return new THREE.CanvasTexture(c);})();
  const throatM=new THREE.MeshBasicMaterial({map:glowTex,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false});
  const plumeM=new THREE.MeshBasicMaterial({map:plumeTex,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide});
  const bellM=P(0x2e2c2a,{side:THREE.DoubleSide});
  // an engine: its bell, a collar, the lit throat, and the plume streaming aft (-x)
  const nozzle=(g,r,len,x,y,z,plumes)=>{const prof=[[r*0.62,0],[r*0.75,len*0.35],[r*0.95,len*0.7],[r*1.06,len]].map(([a,b])=>new THREE.Vector2(a,b));
    const bell=new THREE.Mesh(new THREE.LatheGeometry(prof,18),bellM);bell.rotation.z=Math.PI/2;bell.position.set(x+len/2,y,z);g.add(bell);
    cyl(g,r*0.72,r*0.72,len*0.25,M.metal,x+len*0.55,y,z,'x',18);
    const th=new THREE.Mesh(new THREE.CircleGeometry(r*1.2,24),throatM);th.rotation.y=-Math.PI/2;th.position.set(x-len*0.45,y,z);g.add(th);
    const pl=new THREE.Mesh(new THREE.CylinderGeometry(r*0.12,r*0.8,r*7,16,1,true).translate(0,r*3.5,0),plumeM);pl.rotation.z=Math.PI/2;pl.position.set(x-len*0.5,y,z);
    g.add(pl);if(plumes)plumes.push(pl);return th;};
  const blinkM={red:new THREE.MeshBasicMaterial({color:0xff3020}),green:new THREE.MeshBasicMaterial({color:0x30ff60}),white:new THREE.MeshBasicMaterial({color:0xffffff})};

  // ---- the Mothership ----
  // A tower. Her art director made her stand upright, a tall ship against the flat band of the galaxy, so that
  // wherever you had turned the camera you could see at a glance which way was up; and she is curved, so that
  // the players called her the Banana. What the Kushan's own briefing says of her is built in: she was laid up
  // in the Scaffold in layers from the centre sections outward until the last layer of ceramic armour went on,
  // and under 65 per cent of that armour is the honeycomb of her storage; a single great hangar through the
  // middle of her, open on both flanks, with docking sleeves; parallel production bays; conventional fusion
  // drives venting plasma through shaped magnetic bottles, and manoeuvring jets; the hyperspace drive heavily
  // shielded in the lower aft of her; auxiliary fusion pylons. Here: an inner hull H tall swept section by
  // section up a spine that bows forward in the middle and back at both ends - sharp at the prow, blunt aft,
  // deepest low down - its honeycomb showing wherever the armour is off; over it the armour, plate by plate,
  // stood proud of the hull with gaps between; and the rest on that. Faces +x.
  const honey=(()=>{const S=512,c=document.createElement('canvas');c.width=c.height=S;const g=c.getContext('2d');g.fillStyle='#57544e';g.fillRect(0,0,S,S);
    const r=14,w=r*Math.sqrt(3);g.strokeStyle='#2e2c29';g.lineWidth=3;g.fillStyle='#6a665f';
    for(let row=-1;row<S/(r*1.5)+1;row++)for(let col=-1;col<S/w+1;col++){const cx=col*w+(row%2?w/2:0),cy=row*r*1.5;g.beginPath();for(let q=0;q<6;q++){const a=Math.PI/6+q*Math.PI/3;g.lineTo(cx+Math.cos(a)*r,cy+Math.sin(a)*r);}g.closePath();g.fill();g.stroke();}
    const T=new THREE.CanvasTexture(c);T.wrapS=T.wrapT=THREE.RepeatWrapping;T.repeat.set(1/140,1/140);return T;})();
  const innerM=new THREE.MeshPhongMaterial({map:honey,specular:0x1a1a1a,shininess:10,flatShading:true,side:THREE.DoubleSide});
  function mothership(H){const g=new THREE.Group(),k=H/3000,N=72;
    const bend=t=>{const s=2*t-1;return k*(230-500*s*s);};                     // the spine: forward amidships, well back at the ends
    const prof=t=>Math.pow(Math.sin(Math.PI*Math.min(1,Math.max(0,t*0.97+0.015))),0.62);
    const depth=t=>k*(360+660*prof(t))*(1-0.28*t);
    const width=t=>k*(130+210*Math.pow(prof(t),1.2));
    const SEC=[[0.5,0],[0.42,0.2],[0.3,0.44],[0.02,0.5],[-0.3,0.47],[-0.46,0.38],[-0.5,0.2],[-0.5,-0.2],[-0.46,-0.38],[-0.3,-0.47],[0.02,-0.5],[0.3,-0.44],[0.42,-0.2]];
    const at=(t,j,s)=>{const D=depth(t),W=width(t),[a,b]=SEC[j%SEC.length];s=s||1;return [bend(t)+a*D*s,-H/2+t*H,b*W*s];};
    const yAt=t=>-H/2+t*H,frontAt=t=>bend(t)+0.5*depth(t),aftAt=t=>bend(t)-0.5*depth(t);
    // the inner hull, its honeycomb showing
    {const Pp=[],UV=[],I=[],M_=SEC.length;
      for(let i=0;i<=N;i++){const t=i/N;let per=0;for(let j=0;j<=M_;j++){const q=at(t,j,0.985);Pp.push(...q);if(j){const r=at(t,j-1,0.985);per+=Math.hypot(q[0]-r[0],q[2]-r[2]);}UV.push(per,q[1]);}}
      for(let i=0;i<N;i++)for(let j=0;j<M_;j++){const a=i*(M_+1)+j,b=a+M_+1;I.push(a,a+1,b+1,a,b+1,b);}
      for(const [i,up] of [[0,false],[N,true]]){const t=i/N,c=Pp.length/3;Pp.push(bend(t),yAt(t),0);UV.push(0,0);for(let j=0;j<M_;j++){const a=i*(M_+1)+j;if(up)I.push(a,a+1,c);else I.push(a+1,a,c);}}
      const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(Pp,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(UV,2));geo.setIndex(I);geo.computeVertexNormals();
      g.add(new THREE.Mesh(geo,innerM));}
    // the armour: plate by plate over the hull, a little proud of it, with gaps between; some bays left open
    // down to the honeycomb, as the last layers went on; and none where the hangar, the engines and the
    // hyperspace drive are
    const HT=0.5;
    {const R=mkRng(1111),P=[],UV=[],rows=[];for(let t=0.02;t<0.975;){const h=0.026+R()*0.014;rows.push([t,Math.min(0.975,t+h)]);t+=h;}
      const lerp3=(a,b,u)=>[a[0]+(b[0]-a[0])*u,a[1]+(b[1]-a[1])*u,a[2]+(b[2]-a[2])*u];
      for(const [t0,t1] of rows)for(let j=0;j<SEC.length;j++){const tc=(t0+t1)/2;
        if(Math.abs(tc-HT)<0.075&&[2,3,9,10].includes(j))continue;            // the hangar mouths
        if(tc<0.5&&j>=4&&j<=8)continue;                                     // the engines and the hyperspace drive, aft
        if(R()<0.12)continue;                                               // an open bay
        const splits=j===3||j===10?3:j===2||j===4||j===9||j===11?2:1;
        for(let q=0;q<splits;q++){if(R()<0.05)continue;const u0=q/splits+0.02,u1=(q+1)/splits-0.02,g0=t0+0.0025,g1=t1-0.0025,s=1.012+R()*0.006;
          const c=[lerp3(at(g0,j,s),at(g0,j+1,s),u0),lerp3(at(g0,j,s),at(g0,j+1,s),u1),lerp3(at(g1,j,s),at(g1,j+1,s),u1),lerp3(at(g1,j,s),at(g1,j+1,s),u0)];
          for(const n of [0,1,2,0,2,3]){P.push(...c[n]);UV.push(c[n][0]+c[n][2],c[n][1]);}}}
      const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(P,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(UV,2));geo.computeVertexNormals();
      g.add(new THREE.Mesh(geo,plateM));}
    // collars of heavier plate between the great sections
    for(const t of [0.14,0.28,0.43,0.57,0.72,0.86]){const sh=new THREE.Shape();SEC.forEach(([a,b],j)=>{const x=a*depth(t)*1.03,z=b*width(t)*1.045;j?sh.lineTo(x,-z):sh.moveTo(x,-z);});
      const bg=new THREE.ExtrudeGeometry(sh,{depth:(t===0.43||t===0.57?34:18)*k,bevelEnabled:false});bg.rotateX(-Math.PI/2);const m=new THREE.Mesh(bg,M.hull3);m.position.set(bend(t),yAt(t)-9*k,0);g.add(m);}
    // the keel-blade down the prow, ribbed
    for(let i=0;i<28;i++){const t0=0.06+i*0.031,t1=t0+0.032,a=V(frontAt(t0),yAt(t0)),b=V(frontAt(t1),yAt(t1)),L=Math.hypot(b.x-a.x,b.y-a.y),ang=Math.atan2(b.y-a.y,b.x-a.x)-Math.PI/2;
      const m=new THREE.Mesh(new THREE.BoxGeometry(50*k,L+2,16*k),i%7===3?M.stripe:M.hull2);m.position.set((a.x+b.x)/2+20*k,(a.y+b.y)/2,0);m.rotation.z=ang;g.add(m);
      const rib=new THREE.Mesh(new THREE.BoxGeometry(62*k,7*k,22*k),M.dark);rib.position.set(a.x+24*k,a.y,0);rib.rotation.z=ang;g.add(rib);}
    // the hangar, through her middle and open on both flanks: the capital-ship door drawn up into the hull,
    // the lower door down, the inside seen through the mouth, docking sleeves reaching out of it, hazard
    // stripes on the sill, and guide lamps down both sides of the opening
    const hx=bend(HT)+0.02*depth(HT),hw=width(HT)/2,hl=depth(HT)*0.6,hh=330*k,guides=[];
    for(const sd of [-1,1]){box(g,hl*1.08,hh*1.1,10*k,M.dark,hx,yAt(HT),sd*(hw+2*k));
      const mouth=new THREE.Mesh(new THREE.PlaneGeometry(hl*0.94,hh*0.86),bayM);mouth.position.set(hx,yAt(HT),sd*(hw+8*k));if(sd<0)mouth.rotation.y=Math.PI;g.add(mouth);
      for(const dy of [-1,1]){box(g,hl*1.1,hh*0.36,20*k,M.hull2,hx,yAt(HT)+dy*hh*0.71,sd*(hw+12*k));box(g,hl*1.1,12*k,21*k,M.stripe,hx,yAt(HT)+dy*hh*0.54,sd*(hw+13*k));
        for(let q=0;q<7;q++)box(g,hl*0.1,hh*0.3,5*k,M.hull3,hx-hl*0.46+q*hl*0.153,yAt(HT)+dy*hh*0.71,sd*(hw+23*k));}
      for(let q=0;q<14;q++)box(g,hl/28,14*k,21*k,q%2?M.dark:M.gold,hx-hl/2+hl*(q+0.5)/14,yAt(HT)-hh*0.47,sd*(hw+14*k));
      for(const dx of [-0.28,0,0.28]){cyl(g,14*k,14*k,70*k,M.metal,hx+dx*hl,yAt(HT)-hh*0.2,sd*(hw+40*k),'z',12);box(g,34*k,34*k,10*k,M.hull3,hx+dx*hl,yAt(HT)-hh*0.2,sd*(hw+76*k));}
      for(const ex of [-1,1])for(let q=0;q<7;q++){const l=new THREE.Mesh(new THREE.BoxGeometry(11*k,11*k,6*k),new THREE.MeshBasicMaterial({color:0xffffff}));l.position.set(hx+ex*hl*0.5,yAt(HT)-hh*0.38+q*hh*0.126,sd*(hw+15*k));g.add(l);guides.push(l);}}
    // the parallel production bays, a row of smaller doors low on the starboard flank, and the small dock
    for(let q=0;q<4;q++){const t=0.17+q*0.055,x=bend(t)+0.05*depth(t),z=width(t)/2;box(g,150*k,95*k,10*k,M.dark,x,yAt(t),z+3*k);
      const d=new THREE.Mesh(new THREE.PlaneGeometry(130*k,76*k),bayM);d.position.set(x,yAt(t),z+9*k);g.add(d);box(g,152*k,8*k,12*k,M.stripe,x,yAt(t)+52*k,z+4*k);}
    // the hyperspace drive, low down aft, in its armour: a block of heavy plate banded round, with the glow
    // of the core through its slots
    const coreGlow=new THREE.MeshBasicMaterial({color:0xa888ff});
    {const t0=0.04,t1=0.2,tc=(t0+t1)/2,x=aftAt(tc);box(g,260*k,(t1-t0)*H,width(tc)*0.92,M.hull3,x+70*k,yAt(tc),0);
      for(let q=0;q<5;q++){const y=yAt(t0)+(q+0.5)*(t1-t0)*H/5;box(g,272*k,18*k,width(tc)*0.95,M.dark,x+70*k,y+(t1-t0)*H/12,0);box(g,6*k,26*k,width(tc)*0.6,coreGlow,x-62*k,y,0);}}
    // the fusion drives up the aft face above it, in their housings: bells, lit throats, plumes, and round
    // each plume the rings of its magnetic bottle
    const eng=[],plumes=[];
    for(const [t,r,n] of [[0.25,95,2],[0.33,82,3],[0.41,62,3],[0.62,40,2],[0.7,36,2]]){const x=aftAt(t);
      box(g,95*k,r*2.6*k,width(t)*0.88,M.hull3,x+22*k,yAt(t),0);
      for(let q=0;q<n;q++){const z=(n===1?0:(q/(n-1)-0.5))*width(t)*0.66;eng.push(nozzle(g,r*k,85*k,x-42*k,yAt(t),z,plumes).position.clone());
        for(const dx of [1.1,2.1]){const ring=new THREE.Mesh(new THREE.TorusGeometry(r*0.78*k,r*0.08*k,6,20),M.metal);ring.rotation.y=Math.PI/2;ring.position.set(x-85*k-dx*r*k,yAt(t),z);g.add(ring);}}}
    // the auxiliary fusion pylons, out from her flanks, glowing at their tips
    const pylonM=new THREE.MeshBasicMaterial({color:0xcfe8ff});
    for(const t of [0.3,0.68,0.84])for(const sd of [-1,1]){const x=bend(t)-0.12*depth(t),z=sd*width(t)/2;
      const p=cyl(g,10*k,18*k,110*k,M.hull2,x,yAt(t),z+sd*55*k,'z',10);if(sd<0)p.rotation.x=-Math.PI/2;
      const tip=new THREE.Mesh(new THREE.TorusGeometry(18*k,5*k,6,16),pylonM);tip.position.set(x,yAt(t),z+sd*112*k);g.add(tip);box(g,20*k,20*k,8*k,M.dark,x,yAt(t),z+sd*118*k);}
    // manoeuvring jets, in clusters fore and aft, top and bottom; their puffs come and go (fleet.js)
    const puffs=[];
    for(const [t,fore] of [[0.965,1],[0.965,0],[0.035,1],[0.035,0]]){const x=fore?frontAt(t)-20*k:aftAt(t)+20*k,y=yAt(t);
      for(let q=-1;q<=1;q++){cyl(g,6*k,9*k,22*k,M.dark,x,y+(t>0.5?14:-14)*k,q*26*k,'y',8);
        const pf=new THREE.Mesh(new THREE.ConeGeometry(12*k,70*k,10,1,true).translate(0,-35*k,0),plumeM);pf.position.set(x,y+(t>0.5?4:-4)*k,q*26*k);if(t>0.5)pf.rotation.z=Math.PI;g.add(pf);puffs.push(pf);}}
    // the core on top, stepping up, with its masts, a dish, the sensor ring and the long array
    const blinks=[];
    {const t=1,x=bend(t),y=yAt(t);[[340,60,200],[240,70,150],[140,60,100]].forEach(([l,h,w],i)=>box(g,l*k,h*k,w*k,i===1?M.stripe:M.hull,x-20*k,y+(30+i*62)*k,0));
      box(g,270*k,8*k,160*k,M.lit,x-20*k,y+62*k,0);
      for(const [dx,h,dz] of [[-60,260,10],[40,180,-30],[100,120,40],[-140,150,-50]]){cyl(g,5*k,5*k,h*k,M.metal,x+dx*k,y+(190+h/2)*k,dz*k);
        const b=new THREE.Mesh(new THREE.SphereGeometry(9*k,8,6),blinkM.red);b.position.set(x+dx*k,y+(190+h)*k,dz*k);g.add(b);blinks.push(b);}
      const dish=new THREE.Mesh(new THREE.SphereGeometry(60*k,16,8,0,Math.PI*2,0,Math.PI/3),M.hull2);dish.rotation.z=Math.PI/2;dish.position.set(x-150*k,y+80*k,0);g.add(dish);
      const ring=new THREE.Mesh(new THREE.TorusGeometry(110*k,6*k,6,32),M.metal);ring.rotation.x=Math.PI/2;ring.position.set(x-20*k,y+215*k,0);g.add(ring);
      box(g,300*k,6*k,6*k,M.metal,x+60*k,y+120*k,0);for(let q=0;q<6;q++)box(g,4*k,40*k,4*k,M.metal,x-80*k+q*50*k,y+140*k,0);}
    // her running lights: red to port, green to starboard, white on the prow, at the top and the foot
    for(const [t,col,side] of [[0.95,'red',-1],[0.95,'green',1],[0.05,'red',-1],[0.05,'green',1],[0.5,'white',0]]){const b=new THREE.Mesh(new THREE.SphereGeometry(12*k,8,6),blinkM[col]);
      b.position.set(side?bend(t):frontAt(t)+34*k,yAt(t),side*(width(t)/2*1.03+12*k));g.add(b);blinks.push(b);}
    // the paint: big blocks of colour on the flanks, the way the painters of the old paperback covers did them
    for(const sd of [-1,1])for(const [t,h,col] of [[0.22,120,M.stripe],[0.63,70,M.stripe],[0.79,150,M.dark],[0.7,24,M.gold],[0.36,30,M.gold],[0.9,50,M.stripe]]){const W=width(t)/2,D=depth(t);
      box(g,D*0.6,h*k,6*k,col,bend(t)-D*0.08,yAt(t),sd*(W*1.03+4*k));}
    // the clutter of a working ship on the aft face: housings, conduits, radiator fins and blisters
    {const R=mkRng(4242),D=new THREE.Object3D(),spots=[[],[],[],[]];
      for(let i=0;i<1400;i++){const t=0.5+R()*0.47,kind=Math.floor(R()*4),x=aftAt(t)-3*k,z=(R()-0.5)*width(t)*0.62;spots[kind].push([x,yAt(t),z,-Math.PI/2,0.5+R()*1.1,R()]);}
      for(let i=0;i<900;i++){const t=0.04+R()*0.92;if(Math.abs(t-HT)<0.08)continue;const kind=Math.floor(R()*4),sd=R()<0.5?-1:1,u=R()*0.6-0.3;
        spots[kind].push([bend(t)+u*depth(t),yAt(t),sd*(width(t)*0.5*1.03+3*k),sd>0?0:Math.PI,0.4+R()*0.8,R()]);}
      const geos=[new THREE.BoxGeometry(24*k,12*k,8*k).translate(0,0,4*k),new THREE.CylinderGeometry(3*k,3*k,60*k,6).rotateZ(Math.PI/2).translate(0,0,4*k),
        new THREE.BoxGeometry(30*k,4*k,3*k).translate(0,0,1.5*k),new THREE.SphereGeometry(8*k,8,4,0,Math.PI*2,0,Math.PI/2).rotateX(Math.PI/2)];
      const mats=[M.hull3,M.metal,M.dark,M.hull2];
      spots.forEach((list,kind)=>{const im=new THREE.InstancedMesh(geos[kind],mats[kind],list.length);
        list.forEach(([x,y,z,ry,s,r],i)=>{D.position.set(x,y,z);D.rotation.set(0,ry,kind===2?0:(r<0.5?0:Math.PI/2));D.scale.set(s,s,1);D.updateMatrix();im.setMatrixAt(i,D.matrix);});
        g.add(im);});}
    bake(g,[...guides,...blinks,...plumes,...puffs]);
    g.userData={bay:new THREE.Vector3(hx,yAt(HT),hw+80*k),dock:new THREE.Vector3(bend(0.3),yAt(0.3),width(0.3)/2+30*k),eng,plumes,puffs,guides,blinks,coreGlow,pylonM,H,
      depth:depth(0.5),front:frontAt(0.5),aft:Math.min(aftAt(0.05),aftAt(0.95))};return g;}
  const V=(x,y)=>({x,y});

  // ---- the Scaffold ----
  // The orbital yard she was built in, Kharak's only moon, and in the game shorter than she is: she stood
  // in its clutches, and in the end parts of it went into her. A frame of four laced trusses with square
  // frames along it and bracing across the sides; the docking arms that held her, open now, on the face
  // towards her; the materials plants clamped to its sides with their fusion torches burning inward; and at
  // its head the Phased Disassembler Array, a ring of emitters round a chunk of planetoid, cutting it into the
  // stuff ships are made of. Lamps at the corners. Returns the group, its girders ([a, b] ends, for the wreck
  // of it in the third mission), its lamps and the disassembler's moving parts.
  function scaffold(len,span){const g=new THREE.Group(),beams=[],mat=P(0x707a84,{shininess:40}),joint=P(0x4e565e);
    const add=(a,b,r)=>{beams.push([a,b,r]);};
    const h=span/2,N=Math.max(4,Math.round(len/280));
    const C=[[-h,-h],[-h,h],[h,-h],[h,h]];
    for(const [y,z] of C){for(const [dy,dz] of [[-12,-12],[-12,12],[12,-12],[12,12]])add(new THREE.Vector3(-len/2,y+dy,z+dz),new THREE.Vector3(len/2,y+dy,z+dz),4.5);
      for(let x=-len/2;x<len/2;x+=56)add(new THREE.Vector3(x,y-12,z-12),new THREE.Vector3(x+56,y+12,z+12),1.8);}
    for(let i=0;i<=N;i++){const x=-len/2+i*len/N;
      for(let q=0;q<4;q++){const [y0,z0]=[[-h,-h],[-h,h],[h,h],[h,-h]][q],[y1,z1]=[[-h,h],[h,h],[h,-h],[-h,-h]][q];add(new THREE.Vector3(x,y0,z0),new THREE.Vector3(x,y1,z1),10);}
      if(i<N){const x1=x+len/N;add(new THREE.Vector3(x,h,-h),new THREE.Vector3(x1,h,h),6);add(new THREE.Vector3(x,-h,h),new THREE.Vector3(x1,-h,-h),6);add(new THREE.Vector3(x,-h,-h),new THREE.Vector3(x1,h,-h),6);add(new THREE.Vector3(x,h,h),new THREE.Vector3(x1,-h,h),6);}}
    for(const [a,b,r] of beams){const L=a.distanceTo(b),m=new THREE.Mesh(new THREE.BoxGeometry(r*2,L,r*2),mat);m.position.copy(a).add(b).multiplyScalar(0.5);m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),b.clone().sub(a).normalize());g.add(m);}
    for(let i=0;i<=N;i++)for(const [y,z] of C){const j=new THREE.Mesh(new THREE.BoxGeometry(46,46,46),joint);j.position.set(-len/2+i*len/N,y,z);g.add(j);}
    // the materials plants, on the two sides that do not face her, their torches burning inward
    const torchM=new THREE.MeshBasicMaterial({color:0xffa050,transparent:true,opacity:0.8,blending:THREE.AdditiveBlending,depthWrite:false});
    for(let i=0;i<N;i++){const x=-len/2+(i+0.5)*len/N;for(const sd of [-1,1]){const z=sd*(h+90);
      box(g,190,150,130,i%2?M.hull2:M.hull,x,h*0.2,z);box(g,192,10,132,M.stripe,x,h*0.2+60,z);for(let q=0;q<6;q++)box(g,20,6,1,M.lit,x-60+q*24,h*0.2+20,z+sd*65.5);
      for(const dy of [-50,40]){cyl(g,6,14,50,M.dark,x,h*0.2+dy,z-sd*85,'z',10);const tc=new THREE.Mesh(new THREE.ConeGeometry(12,70,10,1,true),torchM);tc.rotation.x=sd*Math.PI/2;tc.position.set(x,h*0.2+dy,z-sd*140);g.add(tc);}}}
    // the docking arms that held her, on the face towards her when the frame stands upright behind her
    for(let i=1;i<N;i++){const x=-len/2+i*len/N;for(const sd of [-1,1]){box(g,30,170,30,joint,x,-h-85,sd*h*0.55);box(g,70,50,70,joint,x,-h-170,sd*h*0.55);box(g,80,10,10,M.stripe,x,-h-150,sd*h*0.55);}}
    // the Phased Disassembler Array at the head of the frame: struts up from the corners to a ring of
    // emitters, and in the middle of the ring a chunk of planetoid being taken apart
    const DX=len/2+420,RR=380,rays=[],dis=new THREE.Group();dis.position.set(DX,0,0);g.add(dis);
    for(const [y,z] of C)add(new THREE.Vector3(len/2,y,z),new THREE.Vector3(DX-40,y*RR/h*0.72,z*RR/h*0.72),8);
    {const b0=beams.length-4;for(let q=b0;q<beams.length;q++){const [a,b,r]=beams[q],L=a.distanceTo(b),m=new THREE.Mesh(new THREE.BoxGeometry(r*2,L,r*2),mat);m.position.copy(a).add(b).multiplyScalar(0.5);m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),b.clone().sub(a).normalize());g.add(m);}}
    const ring=new THREE.Mesh(new THREE.TorusGeometry(RR,22,8,48),joint);ring.rotation.y=Math.PI/2;dis.add(ring);
    const rayM=new THREE.MeshBasicMaterial({color:0xffd0a0,transparent:true,opacity:0.8,blending:THREE.AdditiveBlending,depthWrite:false});
    for(let q=0;q<8;q++){const a=q/8*Math.PI*2,y=Math.cos(a)*RR,z=Math.sin(a)*RR;const e=new THREE.Mesh(new THREE.BoxGeometry(40,40,60),M.hull2);e.position.set(0,y*0.92,z*0.92);e.lookAt(new THREE.Vector3(DX,0,0));dis.add(e);
      const L=RR*0.92-170,ray=new THREE.Mesh(new THREE.CylinderGeometry(3,5,L,6).translate(0,L/2,0),rayM);ray.position.set(0,y*0.92,z*0.92);ray.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),new THREE.Vector3(0,-y,-z).normalize());dis.add(ray);rays.push(ray);}
    const chunk=asteroid(170,909);chunk.material=M.rock2;dis.add(chunk);
    const cutM=new THREE.MeshBasicMaterial({color:0xff6a20});for(let q=0;q<5;q++){const c=new THREE.Mesh(new THREE.TorusGeometry(150+q*6,3,4,32,Math.PI*(0.6+q*0.2)),cutM);c.rotation.set(q,q*1.7,q*0.6);chunk.add(c);}
    const lamps=[];for(let i=0;i<=N;i++)for(const [y,z] of C){const l=new THREE.Mesh(new THREE.SphereGeometry(11,6,4),i%2?blinkM.white:blinkM.red);l.position.set(-len/2+i*len/N,y+28*Math.sign(y),z+28*Math.sign(z));g.add(l);lamps.push(l);}
    bake(g,[...lamps,dis]);bake(dis,[...rays,chunk]);
    return {g,beams,mat,lamps,dis:{g:dis,rays,rayM,chunk,center:new THREE.Vector3(DX,0,0)}};}

  // ---- the small craft ----
  // Each a few metres to a few tens of metres. Seen from kilometres off they are their engine lights and
  // trails (fleet.js); these are for when the camera comes close.
  function scout(team){const g=new THREE.Group(),tai=team==='tai',a=tai?M.tai:M.hull,b=tai?M.gold:M.stripe,d=tai?M.tai2:M.dark;
    // a slim fuselage with its canopy, swept wings, a pair of engine pods under them
    box(g,8,1.4,1.8,a,0,0,0);cone(g,0.9,3.4,a,5.6,0,0,6);box(g,2.2,0.7,1.1,M.glass,2.4,0.9,0);
    for(const sd of [-1,1]){plate(g,[[1.5,0.8],[-2.8,4.6],[-4.2,4.6],[-3.2,0.8]],0.35,a,0,sd);plate(g,[[-2.2,3.6],[-3.6,4.4],[-4.1,4.4],[-3,3.6]],0.4,b,0.05,sd);
      cyl(g,0.5,0.62,3.6,d,-2.4,-0.6,sd*1.9,'x',8);}
    return bake(g);}
  function interceptor(team){const g=new THREE.Group(),tai=team==='tai',a=tai?M.tai:M.hull,b=tai?M.gold:M.stripe,d=tai?M.tai2:M.dark;
    // blade wings swept forward, twin engines, a long nose
    box(g,11,1.6,2,a,0,0,0);cone(g,1,4.4,a,7.6,0,0,6);box(g,2.6,0.8,1.2,M.glass,3.2,1,0);
    for(const sd of [-1,1]){plate(g,[[-3,0.9],[2.4,5.4],[1.2,5.8],[-4.8,1.2]],0.4,a,0,sd);plate(g,[[1.6,5],[2.4,5.4],[1.2,5.8],[0.6,5.3]],0.45,b,0.02,sd);
      cyl(g,0.7,0.85,5,d,-3.6,0,sd*1.5,'x',8);cyl(g,0.12,0.12,3,M.metal,2.6,-0.4,sd*4,'x',4);}
    g.scale.setScalar(1.3);bake(g);g.scale.setScalar(1);g.children.forEach(m=>m.geometry.scale(1.3,1.3,1.3));return g;}
  function corvette(team){const g=new THREE.Group(),tai=team==='tai',a=tai?M.tai:M.hull,b=tai?M.gold:M.stripe,d=tai?M.tai2:M.dark,a2=tai?M.tai3:M.hull2;
    // a heavy hull, its bridge forward, two engine sponsons, and a twin turret on the back
    box(g,26,7,10,a,0,0,0);box(g,10,5,7,a2,15,-0.5,0);cone(g,3.2,5,a2,22,-0.5,0,6);box(g,4,1.6,6,M.glass,17,2,0);
    for(const sd of [-1,1]){box(g,22,5.5,5,d,-3,0,sd*8.2);box(g,9,1,5.3,b,-3,3,sd*8.2);cyl(g,2,2.4,3,M.dark,-15,0,sd*8.2,'x',10);box(g,3,6,1,a2,-8,0,sd*5.4);}
    cyl(g,2.6,3,2.4,d,-2,4.8,0,'y',10);for(const dz of [-0.8,0.8])cyl(g,0.35,0.35,8,M.metal,2.6,5.4,dz,'x',6);
    for(let q=0;q<6;q++)box(g,1.4,0.8,0.3,M.lit,-9+q*3.2,1,5.1);
    return bake(g);}
  function salvage(){const g=new THREE.Group();
    // a squat hull with two clamping arms reaching forward, and a grapple between them
    box(g,13,4.4,6,M.hull,0,0,0);box(g,5,3,5,M.hull2,-7.5,0,0);box(g,3,1.3,4,M.glass,3,2.4,0);
    for(const sd of [-1,1]){box(g,10,1.4,1.4,M.stripe,6.5,0,sd*3.6,[0,sd*0.35,0]);box(g,3,2.4,2.4,M.dark,11.4,0,sd*5.6);box(g,1.6,1.6,3,M.metal,12.6,0,sd*4.4);}
    cyl(g,0.4,0.4,6,M.metal,8,0,0,'x',6);cyl(g,1.6,2,2,M.dark,-10.5,0,0,'x',10);
    return bake(g);}
  function collector(){const g=new THREE.Group();
    // a big box of a hull, its hold behind, and the scoop at the front: two jaws and the intake between
    box(g,60,26,30,M.hull,0,0,0);box(g,60,5,31,M.stripe,0,8,0);box(g,26,22,28,M.hull2,-38,0,0);box(g,20,6,32,M.hull3,-38,12,0);
    for(const sd of [-1,1]){box(g,30,6,6,M.dark,40,-6,sd*10,[0,sd*0.25,0]);box(g,10,10,4,M.metal,56,-6,sd*14);for(let q=0;q<5;q++)box(g,5,4,1,M.lit,-20+q*10,2,sd*15.2);}
    box(g,6,14,16,M.dark,31,-2,0);cyl(g,9,12,10,M.dark,-54,0,0,'x',14);box(g,8,3,20,M.glass,22,12,0);
    return bake(g);}
  function research(){const g=new THREE.Group(),mods=[],hub=new THREE.Group();g.add(hub);
    // the Hub: a drum with its docking collar and a ring round it, and the modules docked round that
    cyl(hub,40,40,80,M.hull,0,0,0,'y',20);cyl(hub,42,42,10,M.stripe,0,20,0,'y',20);cyl(hub,20,28,30,M.hull2,0,55,0,'y',14);cyl(hub,3,3,60,M.metal,0,95,0,'y',6);
    const ring=new THREE.Mesh(new THREE.TorusGeometry(70,4,6,40),M.metal);ring.rotation.x=Math.PI/2;hub.add(ring);
    for(let q=0;q<12;q++){const a=q/12*Math.PI*2;box(hub,6,4,1,M.lit,Math.cos(a)*40.5,0,Math.sin(a)*40.5,[0,-a+Math.PI/2,0]);}
    bake(hub);
    for(let q=0;q<6;q++){const a=q/6*Math.PI*2,m=new THREE.Group();m.position.set(Math.cos(a)*105,0,Math.sin(a)*105);m.rotation.y=-a;
      box(m,60,50,40,q%2?M.hull2:M.hull,0,0,0);box(m,40,8,8,M.metal,-48,0,0);box(m,40,30,2,M.lit,0,0,21);box(m,62,6,42,M.stripe,0,20,0);box(m,20,20,20,M.hull3,26,0,0);
      g.add(m);bake(m);mods.push(m);}
    g.userData.mods=mods;return g;}
  function drone(){const g=new THREE.Group();g.add(new THREE.Mesh(new THREE.OctahedronGeometry(3.2,0),M.drone));
    for(let q=0;q<4;q++){const f=box(g,0.4,6,1.6,M.dark,-1,0,0);f.rotation.x=q*Math.PI/2;f.position.set(-1.5,Math.cos(q*Math.PI/2)*2.5,Math.sin(q*Math.PI/2)*2.5);}
    const l=new THREE.Mesh(new THREE.SphereGeometry(0.8,6,4),M.red);l.position.x=3;g.add(l);return bake(g);}
  // a cryo tray: "a long mechanical cargo container" - a frame of rails and ribs a little over half a
  // kilometre long, and racked on its four faces a thousand Rack Modules of a hundred sleepers each, a hundred
  // thousand to the tray, six trays for the six hundred thousand; power units at both ends, a docking clamp,
  // and lamps down its back that share one material, so a failing tray can flicker all of them at once
  function cryotray(){const g=new THREE.Group(),L=560,W=64,h=W/2;
    box(g,L,10,10,M.dark,0,0,0);
    for(const [y,z] of [[1,1],[1,-1],[-1,1],[-1,-1]])box(g,L+10,6,6,M.metal,0,y*h,z*h);
    for(let x=-L/2;x<=L/2+0.1;x+=35){for(const [w,hh,d,y,z] of [[5,W,5,0,h],[5,W,5,0,-h],[5,5,W,h,0],[5,5,W,-h,0]])box(g,w,hh,d,M.hull3,x,y,z);}
    for(const sd of [-1,1]){box(g,40,W+16,W+16,M.hull2,sd*(L/2+20),0,0);box(g,42,10,W+18,M.stripe,sd*(L/2+20),h,0);cyl(g,16,20,14,M.dark,sd*(L/2+46),0,0,'x',12);
      const r=new THREE.Mesh(new THREE.TorusGeometry(24,4,6,18),M.blue);r.rotation.y=Math.PI/2;r.position.set(sd*(L/2+56),0,0);g.add(r);}
    box(g,20,20,20,M.metal,L/2+66,0,0);box(g,8,40,40,M.stripe,L/2+78,0,0);
    const lightM=new THREE.MeshBasicMaterial({color:0xbfe0ff});for(let i=0;i<10;i++){const l=new THREE.Mesh(new THREE.SphereGeometry(2.6,6,4),lightM);l.position.set(-L/2+28+i*56,h+6,0);g.add(l);}
    bake(g);
    // the Rack Modules: a thousand, on the four faces, 25 along by 10 across
    {const im=new THREE.InstancedMesh(new THREE.BoxGeometry(19,5.4,5.4),new THREE.MeshPhongMaterial({specular:0x333333,shininess:30,flatShading:true}),1000),D=new THREE.Object3D(),c=new THREE.Color(),R=mkRng(600000);let n=0;
      for(let f=0;f<4;f++)for(let a=0;a<25;a++)for(let b=0;b<10;b++){const x=-L/2+11+a*21.8,v=-h+4+b*(W-8)/9;
        if(f===0)D.position.set(x,h-4,v);else if(f===1)D.position.set(x,-h+4,v);else if(f===2)D.position.set(x,v,h-4);else D.position.set(x,v,-h+4);
        D.rotation.set(0,0,0);D.updateMatrix();im.setMatrixAt(n,D.matrix);const r=R();c.set(r<0.12?0xcfe6ff:r<0.5?0xb4b0a6:r<0.85?0x9a968c:0xc8582a);im.setColorAt(n,c);n++;}
      g.add(im);g.userData.racks=im;}
    g.userData.lightMat=lightM;return g;}
  // a Heavy Lifter Unit: the stubby hauler that boosted the Rack Modules up from Kharak to the trays, a module
  // slung under it
  function lifter(){const g=new THREE.Group();box(g,34,10,14,M.hull,0,0,0);box(g,10,8,10,M.hull2,20,2,0);box(g,4,2,8,M.glass,24,5,0);
    for(const sd of [-1,1]){box(g,26,4,4,M.stripe,0,5.5,sd*7.2);cyl(g,3,4,6,M.dark,-19,0,sd*5,'x',8);}
    box(g,19,5.4,5.4,M.hull2,0,-9,0);box(g,21,1.2,7,M.metal,0,-6,0);return bake(g);}
  function asteroid(r,seed){const R=mkRng(seed),geo=new THREE.IcosahedronGeometry(r,2),p=geo.attributes.position;
    for(let i=0;i<p.count;i++){const v=new THREE.Vector3().fromBufferAttribute(p,i),q=0.75+0.5*Math.abs(Math.sin(v.x*0.13+seed)*Math.cos(v.y*0.11-seed)+0.3*Math.sin(v.z*0.2)+0.15*Math.sin(v.x*0.5+v.z*0.4));v.multiplyScalar(q*(0.92+0.16*R()));p.setXYZ(i,v.x,v.y,v.z);}
    geo.computeVertexNormals();return new THREE.Mesh(geo,R()<0.5?M.rock:M.rock2);}
  return {M,blinkM,mothership,scaffold,scout,interceptor,corvette,salvage,collector,research,drone,cryotray,lifter,asteroid,bake};
}
