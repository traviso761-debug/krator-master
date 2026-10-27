// ---------- Rama ----------
// Fan work, after Arthur C. Clarke's Rendezvous with Rama (1973). Nothing from any edition, cover, film design
// or game is used; every shape here is this project's own geometry, built to the numbers the novel gives.
//
// What it is built to (sources, and the facts taken from each):
//
//   Clarke, Rendezvous with Rama (1973), the novel itself
//     - object 31/439, found by Spaceguard in 2131; a cylinder 50 km long and 20 km across, turning once in four
//       minutes; the north pole is the bow and the hub is there, entered by a triple airlock
//     - three stairways from the hub to the Northern Plain, 120 degrees apart, named Alpha, Beta and Gamma:
//       ladders for the first stretch, where there is almost no weight, then stairs, levelling off at terraces
//     - the Northern Plain and its "cities", named London, Paris, Peking, Tokyo, Rome and Moscow, joined by roads;
//       windowless; everything Raman comes in threes
//     - six Straight Valleys, three to each plain, equally spaced round the cylinder, which are its suns
//     - the Cylindrical Sea, 10 km wide round the waist, frozen when they arrive; New York on its island; a
//       northern cliff of 50 m and a southern of 500 m, because Rama accelerates north and the water piles south
//     - the Southern Plain, a patchwork; the south pole's Big Horn and its six Little Horns on flying buttresses
//     - the Dawn, the thaw and the storm, Jimmy Pak's Dragonfly and the lightning, the crab biot, the wave when
//       Rama changes course, the spiders and the sharks, the Mercurian missile, the dimming and the departure
//   Wikipedia, "Rendezvous with Rama": the 16 km plain, the spin of 0.25 rpm, the sequence of the plot
//   Wikipedia and the National Space Society, "O'Neill cylinder": the spun habitat this belongs with - light
//     in long strips down the length, land between them, and the same mapping Kyrene (src/hab/) uses
//   This site's Babylon 5 (src/babylon5/station.js): the turntable, the cutaway, the drum-frame interior
//
// What the novel does not settle and this model chooses (and says so on the cards): the hull's thickness (2 km,
// from the 20 km outside and the 16 km plain), the shape of the bowls (ellipses), the south valleys turned sixty
// degrees from the north's, and every detail of the outside faces beyond the hub, which the novel leaves blank.
import {mkRng} from '../core/rng.js';
import {ramaShape} from './shape.js';
import {buildInterior} from './interior.js';
import {makeEvents} from './events.js';
import {makeSound} from './sound.js';

export function model(api){
  const {THREE,C,scene,camera,renderer,animHooks,fold}=api;
  const K=C.rama||{};
  const S=ramaShape(K);
  const TAU=Math.PI*2;
  const G=new THREE.Group();G.rotation.z=-Math.PI/2;scene.add(G);   // Rama's +y (north) becomes world +x
  const SPIN=new THREE.Group();G.add(SPIN);
  const pick=[];
  // fold() merges by material and keeps no texture coordinates, so the plated parts go in whole
  const piece=(parent,name,info,list)=>{const g=new THREE.Group();fold(g,list.filter(m=>!m.material.map));for(const m of list)if(m.material.map)g.add(m);
    g.userData.info={name,info};parent.add(g);pick.push(g);return g;};
  // The state of the world inside: the suns, the flares, the ice, the cloud, the lightning. The events move
  // these and the interior draws them.
  const LS={sun:1,flare:0,ice:0,cloud:0.18,lightning:0,flash:0,sunEach:null};

  // ---------- the cutaway ----------
  const cut=new THREE.Plane(new THREE.Vector3(0,1,0),1e9);renderer.localClippingEnabled=true;

  // ---------- the hull ----------
  // The novel says almost nothing about the outside except that it is a perfect cylinder, dull, that has
  // plainly been made. So: plating that only shows up close - large plates in grey with a little brown in it,
  // seams, and the pitting of however long it has been travelling - and nothing else to break the line.
  const R0=mkRng(S.seed);
  const tex=(w,h,paint)=>{const c=document.createElement('canvas');c.width=w;c.height=h;paint(c.getContext('2d'),w,h);
    const T=new THREE.CanvasTexture(c);T.wrapS=T.wrapT=THREE.RepeatWrapping;T.anisotropy=8;return T;};
  const plateT=tex(2048,1024,(g,W,H)=>{
    g.fillStyle='#8a8986';g.fillRect(0,0,W,H);
    const tones=['#8b8a87','#888784','#8e8c89','#858481','#8a8884','#878580','#8d8b87'];
    const cols=16,cw=W/cols;
    for(let i=0;i<cols;i++){let y=R0()*-200;while(y<H){const L=Math.min(H-y,220+R0()*620);g.fillStyle=tones[Math.floor(R0()*tones.length)];g.fillRect(i*cw+1,y+1,cw-2,L-2);
      if(R0()<0.25){g.fillStyle='rgba(0,0,0,0.05)';g.fillRect(i*cw+cw*0.2,y+8,cw*0.6,L-16);}y+=L;}}
    g.fillStyle='rgba(30,28,26,0.45)';for(let i=0;i<=cols;i++)g.fillRect(i*cw-1,0,2,H);
    // the pitting: tens of thousands of years of dust, as small dark flecks with a lighter rim
    for(let k=0;k<5000;k++){const x=R0()*W,y=R0()*H,r=0.6+R0()*R0()*3.5;g.fillStyle='rgba(40,38,34,0.55)';g.beginPath();g.arc(x,y,r,0,TAU);g.fill();
      g.strokeStyle='rgba(190,186,176,0.25)';g.lineWidth=0.6;g.stroke();}
    // and long faint scorch streaks along the axis, from whatever it has passed through
    for(let k=0;k<40;k++){const x=R0()*W,y=R0()*H,l=100+R0()*400;const gr=g.createLinearGradient(x,y,x,y+l);gr.addColorStop(0,'rgba(60,52,44,0)');gr.addColorStop(0.5,'rgba(60,52,44,0.12)');gr.addColorStop(1,'rgba(60,52,44,0)');g.fillStyle=gr;g.fillRect(x,y,3+R0()*6,l);}});
  const faceT=tex(1024,1024,(g,W,H)=>{g.fillStyle='#868480';g.fillRect(0,0,W,H);const n=16,cw=W/n;
    for(let i=0;i<n;i++)for(let j=0;j<n;j++){g.fillStyle=['#8a8884','#83817d','#8e8c87','#7e7c78'][Math.floor(R0()*4)];g.fillRect(i*cw+1,j*cw+1,cw-2,cw-2);}
    for(let k=0;k<2500;k++){g.fillStyle='rgba(40,38,34,0.5)';g.beginPath();g.arc(R0()*W,R0()*H,0.6+R0()*R0()*3,0,TAU);g.fill();}});
  const Ph=(o)=>new THREE.MeshPhongMaterial(Object.assign({color:0xffffff,specular:0x1c1c1a,shininess:6,clippingPlanes:[cut],side:THREE.DoubleSide},o||{}));
  // the plating is its own bump map: seams sunk, pits sunk, so a low Sun picks the plates out
  const m={plate:Ph({map:plateT,bumpMap:plateT,bumpScale:1.2,color:0xb8b6b0,specular:0x2c2b28,shininess:12}),face:Ph({map:faceT,bumpMap:faceT,bumpScale:1.2,color:0xb8b6b0}),hull:Ph({color:0x8b8a86,flatShading:true}),dark:Ph({color:0x55534f,flatShading:true}),
    rib:Ph({color:0x9a9893,flatShading:true}),hatch:Ph({color:0x2c2e32,flatShading:true})};
  const lathe=(prof,seg,mat)=>{const pts=prof.map(([r,y])=>new THREE.Vector2(Math.max(0.01,r),y));if(pts[pts.length-1].y<pts[0].y)pts.reverse();return new THREE.Mesh(new THREE.LatheGeometry(pts,seg),mat);};
  const RIM=700;
  {const parts=[];
    // the barrel: plates a few hundred metres on a side, one tile round every forty-five degrees
    const L=2*(S.L2-RIM),cyl=new THREE.Mesh(new THREE.CylinderGeometry(S.RO,S.RO,L,256,1,true),m.plate);
    const uv=cyl.geometry.attributes.uv;for(let i=0;i<uv.count;i++){uv.setX(i,uv.getX(i)*8);uv.setY(i,uv.getY(i)*L/9000);}
    parts.push(cyl);
    // the seams the outside does show: shallow girth bands over the shores and where the bowls begin, and
    // three long seams down the length, a third of the way round from each other - the one decoration Rama
    // has on the outside, and it is in threes
    for(const y of [S.SH,-S.SH,S.PE,-S.PE,0])parts.push(lathe([[S.RO,y-160],[S.RO+14,y-130],[S.RO+14,y+130],[S.RO,y+160]],256,m.rib));
    for(let k=0;k<3;k++){const a=k*TAU/3+TAU/6,b=new THREE.Mesh(new THREE.BoxGeometry(70,L,10),m.rib);b.position.set(Math.cos(a)*(S.RO+4),0,Math.sin(a)*(S.RO+4));b.rotation.y=-a+Math.PI/2;parts.push(b);}
    // the rims, rounded
    for(const sg of [1,-1]){const pr=[];for(let i=0;i<=12;i++){const t=i/12*Math.PI/2;pr.push([S.RO-RIM+Math.cos(t)*RIM,sg*(S.L2-RIM+Math.sin(t)*RIM)]);}parts.push(lathe(pr,256,m.hull));}
    piece(SPIN,'The hull','A cylinder fifty kilometres long and twenty across, so geometrically perfect it might have been turned on a lathe, dull grey and nearly featureless. It turns once every four minutes, which gives the plains inside about six-tenths of a gravity. Spaceguard took it for an asteroid (31/439) until a probe went close in 2131. The model makes its shell two kilometres thick, from the novel\'s twenty kilometres outside and sixteen-kilometre plain.',parts);}

  // ---------- the north face and the hub ----------
  // The bow. A flat face with low concentric rings, and on the axis the hub: a drum standing out of the face,
  // the only thing on the outside that looks like a way in. Three airlocks in its end, one for each stairway.
  {const parts=[],y=S.L2;
    const face=new THREE.Mesh(new THREE.RingGeometry(S.HUBO,S.RO-RIM,256,8),m.face);face.geometry.rotateX(-Math.PI/2);face.position.y=y;
    {const uv=face.geometry.attributes.uv;for(let i=0;i<uv.count;i++){uv.setXY(i,uv.getX(i)*6,uv.getY(i)*6);}}
    parts.push(face);
    for(const [r,h] of [[1200,30],[3000,22],[5200,18],[7600,26],[9000,12]])parts.push(lathe([[r-60,y],[r-40,y+h],[r+40,y+h],[r+60,y]],256,m.rib));
    for(let k=0;k<3;k++){const a=S.STAIRS[k].a,b=new THREE.Mesh(new THREE.BoxGeometry(S.RO-RIM-S.HUBO-200,10,60),m.rib);const rm=(S.RO-RIM+S.HUBO)/2;b.position.set(Math.cos(a)*rm,y+5,Math.sin(a)*rm);b.rotation.y=-a;parts.push(b);}
    piece(SPIN,'The north face','The bow: Rama accelerates toward this end. A flat face of plates with low rings round the hub. The novel describes nothing on it but the hub itself; the rings and the three radial seams here are this model\'s.',parts);
    const hub=[];
    hub.push(lathe([[S.HUBO+60,y],[S.HUBO,y+40],[S.HUBO,y+200],[S.HUBO-30,y+220],[S.HUBR+20,y+220],[S.HUBR+20,y+200]],96,m.hull));
    for(const st of S.STAIRS){const a=st.a+Math.PI/3,r=(S.HUBO+S.HUBR)/2+10;
      const d=new THREE.Mesh(new THREE.BoxGeometry(42,8,42),m.dark);d.position.set(Math.cos(a)*r,y+222,Math.sin(a)*r);d.rotation.y=-a;hub.push(d);
      const h=new THREE.Mesh(new THREE.BoxGeometry(30,9,30),m.hatch);h.position.set(Math.cos(a)*r,y+224,Math.sin(a)*r);h.rotation.y=-a;hub.push(h);
      // the wheel that opens it, a disc on its face
      const w=new THREE.Mesh(new THREE.CylinderGeometry(6,6,4,16),m.rib);w.position.set(Math.cos(a)*r,y+230,Math.sin(a)*r);hub.push(w);}
    piece(SPIN,'The hub and its airlocks','On the axis at the north pole, where the spin is no more than a slow roll and a ship can dock. Three airlocks in its end, each a triple lock, each opening onto one of the three stairways down the Northern Bowl. The first party found the doors could be opened from outside with a plain wheel, as if whoever built them had expected visitors.',hub);}

  // ---------- the south face ----------
  // The stern. The novel never describes it from outside; here it carries a central boss over the Big Horn and
  // six lesser ones over the Little Horns, which is a guess at what the drive looks like from behind.
  {const parts=[],y=-S.L2;
    const face=new THREE.Mesh(new THREE.RingGeometry(0.01,S.RO-RIM,256,8),m.face);face.geometry.rotateX(Math.PI/2);face.position.y=y;
    {const uv=face.geometry.attributes.uv;for(let i=0;i<uv.count;i++){uv.setXY(i,uv.getX(i)*6,uv.getY(i)*6);}}
    parts.push(face);
    parts.push(lathe([[1800,y],[1700,y-120],[1300,y-260],[700,y-340],[0,y-360]],128,m.hull));
    for(const [r,h] of [[2300,40],[4600,24],[6800,30],[8800,16]])parts.push(lathe([[r-70,y],[r-50,y-h],[r+50,y-h],[r+70,y]],256,m.rib));
    for(const a of S.LITTLE_A){const b=lathe([[480,0],[440,-60],[260,-120],[0,-140]],48,m.dark);b.position.set(Math.cos(a)*S.LHR,y,Math.sin(a)*S.LHR);parts.push(b);}
    piece(SPIN,'The south face','The stern, where the drive is. The novel never shows it from outside; the boss on the axis over the Big Horn and the six over the Little Horns are this model\'s guess at the drive seen from behind.',parts);}

  // ---------- the inside ----------
  let snd=null;
  const IN=buildInterior(api,{SPIN,cut,S,LS,onEnter:on=>{SEC.visible=!on&&cutOn;},onStrike:()=>{if(snd)snd.thunder(Math.random()*0.6);}});
  snd=makeSound({LS,IN});
  animHooks.push(now=>snd.update(now));
  // what you can click on inside, when the cutaway opens it: invisible shapes over the landmarks
  {const ghost=new THREE.MeshBasicMaterial({visible:false,clippingPlanes:[cut]});
    ghost.side=THREE.DoubleSide;     // the far half is seen from inside once the near half is cut away
    const add=(name,info,geo,M)=>{const g=new THREE.Group();const mm=new THREE.Mesh(geo,ghost);mm.applyMatrix4(M);g.add(mm);g.userData.info={name,info};IN.group.add(g);pick.push(g);};
    for(const q of IN.CITIES)add(q.name,q.info+' A city of the Northern Plain, about '+(q.r*2/1000).toFixed(1)+' km across.',new THREE.SphereGeometry(q.r,12,8),IN.placeOn(q.a,q.y,S.RI,0));
    add('New York','The island in the middle of the Cylindrical Sea, ten kilometres round it and three across, walled, and covered in towers - the nearest thing in Rama to a city as people mean the word. It is built in three identical sectors. The crew crossed the Sea to it on the raft Resolution, rowing over water a few weeks thawed.',new THREE.SphereGeometry(2400,12,8),IN.placeOn(S.NYA,0,S.SEA,0));
    for(let i=0;i<IN.valleys.length;i++){const v=IN.valleys[i];add('A Straight Valley','One of Rama\'s six suns: a trench 300 m wide and 60 m deep the length of its plain, with the light in its floor. Three to each plain, a third of the way round from each other, so that wherever you stand there is a sun beside you and two more across the sky. Before the Dawn they were dark, and the crew took them for canals.',new THREE.BoxGeometry(600,200,v.y1-v.y0),IN.placeOn(v.c,(v.y0+v.y1)/2,v.R,0));}
    add('The Cylindrical Sea','A ring of water ten kilometres wide round Rama\'s waist, frozen when the crew arrived and thawed by the Sun as Rama fell inward. It was not water anyone would drink: a soup of organic compounds, alive with microorganisms. Its north shore is a cliff of fifty metres, its south of five hundred - because Rama accelerates toward its north pole, and when it does the Sea is thrown south.',new THREE.CylinderGeometry(S.SEA,S.SEA,2*S.SH,48,1,true),new THREE.Matrix4());
    add('The Big Horn','A spike on the axis at the south pole, 8 km long in this model, pointing back at the hub; six Little Horns round it, held to it and to the bowl by flying buttresses. The crew took it for part of the drive. As Rama neared the Sun a field built up round it and it discharged in lightning, which is what brought Jimmy Pak\'s Dragonfly down.',new THREE.CylinderGeometry(300,1400,S.BIG,12).translate(0,-S.HUBY+S.BIG/2,0),new THREE.Matrix4());
    add('The Northern Bowl','The end of the world, curving up from the plain to the hub, 8 km of it. Three stairways go down it, Alpha, Beta and Gamma, ladders at first, where there is almost no weight, then stairs that level off at four terraces. Near the hub you could float down; at the foot you weigh six-tenths of what you weigh at home.',new THREE.CylinderGeometry(800,S.RI,S.BD,24,1,true).translate(0,S.PE+S.BD/2,0),new THREE.Matrix4());
    add('Camp Alpha','The crew\'s base at the foot of Alpha stairway: inflatable domes, a mast with lamps, stores, and the three-wheeled cart. Everything here they carried down eight kilometres of stairs.',new THREE.SphereGeometry(300,8,6),IN.placeOn(S.STAIRS[0].a,S.PE-140,S.RI,0));}

  // ---------- the cross-section ----------
  // A plane through the axis, turned every frame to face the camera, cuts away the near half of the hull and
  // everything inside it (the clipping plane). And because Rama is a solid of revolution, what the plane cuts
  // through is the same shape whichever way it faces: the profile, mirrored about the axis. So the section is
  // that profile, drawn once as a flat face hatched the way a draughtsman hatches a cut, turned with the plane.
  const SEC=new THREE.Group();SEC.visible=false;G.add(SEC);
  {const hatch=tex(256,256,(g,W,H)=>{g.fillStyle='#5f5c58';g.fillRect(0,0,W,H);g.strokeStyle='rgba(30,28,26,0.75)';g.lineWidth=5;
      for(let k=-W;k<W*2;k+=32){g.beginPath();g.moveTo(k,0);g.lineTo(k+H,H);g.stroke();}});
    const P=[];const arc=(cx,cy,r,t0,t1,n)=>{for(let i=0;i<=n;i++){const t=t0+(t1-t0)*i/n;P.push([cx+Math.cos(t)*r,cy+Math.sin(t)*r]);}};
    // the right half of the hull's section, outside: up the airlock shaft, over the hub, along the north face,
    // round the rim, down the barrel, round the south rim, along the south face to the axis
    const A=[[S.HUBR,S.L2+200],[S.HUBO,S.L2+200],[S.HUBO,S.L2]];
    const tmp=P.length;arc(S.RO-RIM,S.L2-RIM,RIM,Math.PI/2,0,8);arc(S.RO-RIM,-S.L2+RIM,RIM,0,-Math.PI/2,8);A.push(...P.splice(tmp));A.push([0,-S.L2]);
    // and inside: from the south pole up the bowl, the Southern Plain, the cliff, the Sea's bed, the northern
    // cliff, the Northern Plain, and up the bowl to the shaft
    const B=[[0,-S.HUBY]];for(let i=1;i<=24;i++){const t=i/24*Math.PI/2;B.push([S.RS*Math.sin(t),-S.PE-S.BD*Math.cos(t)]);}
    B.push([S.RS,-S.SH],[S.BED,-S.SH],[S.BED,S.SH],[S.RI,S.SH],[S.RI,S.PE]);
    for(let i=1;i<=24;i++){const t=i/24*Math.PI/2;B.push([Math.max(S.HUBR,S.RI*Math.cos(t)),S.PE+S.BD*Math.sin(t)]);}
    B[B.length-1]=[S.HUBR,S.HUBY];
    const mir=l=>l.map(([x,y])=>[-x,y]);
    const outline=[...A,...mir(A).reverse().slice(1),[-S.HUBR,S.HUBY],...mir(B).reverse().slice(1),...B.slice(1)];
    const shapeOf=pts=>{const sh=new THREE.Shape();pts.forEach(([x,y],i)=>i?sh.lineTo(x,y):sh.moveTo(x,y));sh.closePath();return sh;};
    const wallG=new THREE.ShapeGeometry(shapeOf(outline));
    {const p=wallG.attributes.position,uv=new Float32Array(p.count*2);for(let i=0;i<p.count;i++){uv[i*2]=p.getX(i)/700;uv[i*2+1]=p.getY(i)/700;}wallG.setAttribute('uv',new THREE.BufferAttribute(uv,2));}
    const secM=new THREE.MeshBasicMaterial({map:hatch,side:THREE.DoubleSide});
    SEC.add(new THREE.Mesh(wallG,secM));
    // the Big Horn's section, on the axis
    const hp=S.BIG_PROFILE.map(([r,y])=>[r,y]);const horn=[...hp,...mir(hp).reverse().slice(1)];
    SEC.add(new THREE.Mesh(new THREE.ShapeGeometry(shapeOf(horn)),new THREE.MeshBasicMaterial({color:0x7a7670,side:THREE.DoubleSide})));
    // the Sea, both sides: blue water, or white ice
    const seaSec=new THREE.MeshBasicMaterial({color:0x2a6a80,side:THREE.DoubleSide});SEC.userData.seaSec=seaSec;
    for(const sd of [1,-1])SEC.add(new THREE.Mesh(new THREE.ShapeGeometry(shapeOf([[sd*S.SEA,-S.SH],[sd*S.BED,-S.SH],[sd*S.BED,S.SH],[sd*S.SEA,S.SH]])),seaSec));
    // the outline, in the colour of a draughtsman's ink
    const lineM=new THREE.LineBasicMaterial({color:0xe8c98a});
    for(const pts of [outline,horn]){const g=new THREE.BufferGeometry().setFromPoints(pts.map(([x,y])=>new THREE.Vector3(x,y,1)));SEC.add(new THREE.LineLoop(g,lineM));}
    // the labels, laid out in the section's plane
    // two lines each: a name in capitals, and a fact under it
    const label=(text,x,y,size,colour)=>{const lines=text.split('\n'),c=document.createElement('canvas'),g=c.getContext('2d');
      const font=i=>(i?'400 38px':'600 46px')+' Georgia,serif';let w=0;lines.forEach((l,i)=>{g.font=font(i);w=Math.max(w,g.measureText(l).width);});
      w=Math.ceil(w)+28;const H=16+lines.length*50;c.width=w;c.height=H;g.fillStyle='rgba(10,12,16,0.66)';g.fillRect(0,0,w,H);
      g.fillStyle=colour||'#f0dca8';g.fillRect(0,0,4,H);g.textBaseline='middle';
      lines.forEach((l,i)=>{g.font=font(i);g.fillStyle=i?'#d8d0bc':(colour||'#f0dca8');g.fillText(l,14,8+25+i*50);});
      const t=new THREE.CanvasTexture(c);t.minFilter=THREE.LinearFilter;const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:t,depthTest:false,depthWrite:false,transparent:true}));
      const h=(size||1)*1150*H/66;sp.scale.set(h*w/H,h,1);sp.position.set(x,y,40);sp.renderOrder=10;SEC.add(sp);return sp;};
    label('THE HUB\ntriple airlock · 0 g',0,S.L2+2600);
    label('NORTHERN BOWL\nstairways Alpha, Beta, Gamma',-4200,22000);
    label('NORTHERN PLAIN\n0.56 g · six cities',-4300,12500);
    label('STRAIGHT VALLEYS\nsix of them: the suns',3800,14000,1,'#fff4d8');
    label('northern cliff\n50 m',5400,6700,0.8);
    label('CYLINDRICAL SEA\n10 km wide',-4800,0);
    label('NEW YORK\nan island of towers',3900,0,0.85);
    label('southern cliff\n500 m',5400,-6700,0.8);
    label('SOUTHERN PLAIN\na patchwork',-4300,-12500);
    label('BIG HORN\n8 km, on the axis',2600,-16500);
    label('LITTLE HORNS\nsix, on flying buttresses',-3600,-21700,0.85);
    label('HULL\n2 km thick',-9000,17000,0.8,'#d8d4cc');
    label('50 km long\none turn in 4 minutes',0,-S.L2-2600,0.9,'#d8d4cc');
    SEC.traverse(o=>{o.userData.noWire=true;o.frustumCulled=false;});}

  const H0=location.hash.slice(1);
  let cutOn=/(^|&)cutaway(&|$)/.test(H0);
  const camL=new THREE.Vector3(),nW=new THREE.Vector3();
  const setCut=on=>{cutOn=on;IN.showFromOutside(on);SEC.visible=on&&!IN.active();if(!on)cut.set(new THREE.Vector3(0,1,0),1e9);};
  animHooks.push(()=>{SEC.userData.seaSec.color.set(0x2a6a80).lerp(new THREE.Color(0xdfeef4),LS.ice);
    if(!cutOn||IN.active())return;
    // in Rama's frame: which way the camera is from the axis
    camL.copy(camera.position);G.worldToLocal(camL);camL.y=0;if(camL.lengthSq()<1)camL.set(0,0,1);camL.normalize();
    SEC.rotation.y=Math.atan2(camL.x,camL.z);SEC.position.copy(camL).multiplyScalar(-3);
    nW.copy(camL).negate().applyQuaternion(G.quaternion);cut.setFromNormalAndCoplanarPoint(nW,G.position);});

  // ---------- the Sun ----------
  // Rama falls in past the orbit of Venus, so the Sun is large and fierce: the key light, and a glare to go with it.
  {const SL=(C.space&&C.space.starLight)||{},a=SL.az===undefined?-0.55:SL.az,e=SL.el===undefined?0.22:SL.el;
    const c=document.createElement('canvas');c.width=c.height=256;const g=c.getContext('2d'),gr=g.createRadialGradient(128,128,0,128,128,128);
    gr.addColorStop(0,'rgba(255,255,250,1)');gr.addColorStop(0.08,'rgba(255,250,235,1)');gr.addColorStop(0.2,'rgba(255,236,200,0.5)');gr.addColorStop(0.5,'rgba(255,210,160,0.1)');gr.addColorStop(1,'rgba(255,200,150,0)');
    g.fillStyle=gr;g.fillRect(0,0,256,256);
    const sun=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(c),depthWrite:false,transparent:true,blending:THREE.AdditiveBlending,fog:false}));
    sun.position.set(Math.cos(a)*Math.cos(e),Math.sin(e),Math.sin(a)*Math.cos(e)).multiplyScalar(1200000);sun.scale.setScalar(260000);sun.userData.noWire=true;sun.frustumCulled=false;scene.add(sun);}

  // ---------- the spin ----------
  const PERIOD=S.PERIOD*1000;
  const spinAt=now=>(now%PERIOD)/PERIOD*TAU;
  animHooks.push(now=>{SPIN.rotation.y=spinAt(now);});

  // ---------- the events ----------
  const EV=makeEvents(api,{G,SPIN,S,LS,IN,setCut:on=>setCut(on),cutOn:()=>cutOn,spinAt,pick,snd});

  const ship={radius:K.radius||27000,group:G,pick,minD:K.minD||300,
    adaptiveNear:false,
    ownsInput:()=>IN.active(),
    // a viewpoint is outside: picking one stops a scene and leaves the interior
    onView:()=>{EV.halt();if(IN.active())IN.exit();
      if(/(^|&)event=/.test(location.hash.slice(1)))history.replaceState(null,'','#'+location.hash.slice(1).split('&').filter(k=>!/^event=/.test(k)).join('&'));},
    camFrame:now=>IN.camFrame(now)||EV.camFrame(now),
    hashExtra:()=>(IN.active()&&IN.where()!=='event'?'&inside='+IN.where():'')+(cutOn&&!IN.active()?'&cutaway':''),
    hudOnly:now=>IN.active()?IN.hud(now)+EV.hudTail():null,
    hud:now=>'spin '+Math.round(spinAt(now)/Math.PI*180)+'° · one turn in 4 min · '+(LS.sun>0.5?'lit inside':'dark inside')+(LS.ice>0.5?' · the Sea frozen':' · the Sea thawed')+EV.hudTail(),
    buttons:{'Cutaway':()=>{if(IN.active())IN.exit();setCut(!cutOn);},
      'Inside':()=>{if(IN.active())IN.exit();else{setCut(false);IN.enter('hub');}},
      'Events':()=>EV.toggle(),
      'Sound':()=>snd.toggle()}};
  // #inside=<place> opens there; #event=<id> plays one; #cutaway opens the section
  {const q=/(^|&)inside(=([a-z]+))?(&|$)/.exec(H0);if(q)setTimeout(()=>{setCut(false);IN.enter(q[3]||'hub');},0);}
  if(/(^|&)sound(&|$)/.test(H0))snd.toggle();
  {const q=/(^|&)event=([a-z]+)/.exec(H0);if(q)setTimeout(()=>EV.play(q[2]),600);}
  setCut(cutOn);
  return ship;
}
