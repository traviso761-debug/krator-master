// ---------- Babylon 5 ----------
// Fan work. Babylon 5 belongs to Warner Bros. and J. Michael Straczynski; nothing from the series, its models
// or its art is used, and every shape here is this project's own geometry, built to the published facts.
//
// What it is built to (sources, and the facts taken from each):
//
//   The Lurker's Guide, "The Unofficial Babylon 5 Technical Manual" (midwinter.com/lurk/ftp/b5.tech.htm)
//     - a little over five miles long; the docking guides add another 0.3 mile; 2.5 million tons
//     - the interior rotates for gravity (about 1 g at the hull); the spine, the zero-g docking bays and the
//       fusion reactor do not; the blue heat radiator fins frame the rear
//     - the front: a zero-g axial bay, two docking horns framing it with the tachyon mast above and between
//       them; the docking bay proper behind it IS in the rotating section, and every ship enters dead centre
//       and matches the spin; C&C sits beneath the bay entrance behind a great armoured window
//     - the Cobra bays are cobra-shaped projections along the round front
//     - sectors: Blue (C&C, administration), Red (business; the Zocalo), Green (the ambassadors), Brown and
//       Grey (unfinished; Down Below, where the Lurkers live), Yellow (the non-rotating rear); 95 levels
//     - the Garden is the interior of the rotating cylinder: fields, pools, cafes; twenty metres of dirt with
//       four levels of machinery under it; a train round its circumference; the zero-g train along the axis
//     - the rotating sections run on electromagnetic bearings; a double hull
//   Wikipedia, "Babylon 5": an O'Neill cylinder 5 miles (8 km) long and 0.5-1 mile across, at L5 of Epsilon III
//   The Wertzone, "Babylon 5 Rewatch: Setting the Scene": the forward sphere is Blue Sector with the axial
//     launch and recovery bay; the Cobra bays are on the arms joining the sphere to the carousel; bow to stern
//     the carousel is Red, then the Garden (through Red and Green), Green, Brown, Grey; then the zero-g rear
//     with the reactor, the radiator fins and the cargo pods
//   The Babylon Project wiki (via search): the rotating section is 840 m across; 0.9 g at 60 mph; the Cobra
//     bays are named for the four structural elements of the forward sphere, each like a cobra's raised hood
//   Model-kit build logs (CultTVman, Starship Modeler's R/M kit preview): twelve radiator panels at the rear;
//     the complex hull patterns are decals - a checkerboard on the front section, long plates down the drum;
//     the stand goes behind the arrays so the hull can still turn
//
// And what that comes to here, in metres along the axis (local y, bow +y; laid along world x at the end):
//
//   docking horns   the two zero-g guides, from the face of the sphere to +4420, with the tachyon mast between
//   the sphere      Blue Sector: centre +3460, radius 470 - a shade wider than the drum. Checkerboard plating,
//                   the bay mouth in a flattened dish at the front, C&C's window below it. It TURNS
//   Cobra bays      four hoods on arms from the collar, wrapped round the back of the sphere. They turn too
//   the carousel    840 m across, from -1450 to +2850, in five segments with trench bands between them, and
//                   long rectangular plates the length of each segment. It turns once in about 45 seconds
//   the rear        the Yellow Sector: bearing, reactor housing, spine, three rows of four blue radiator fins,
//                   the thruster block and the aft antenna, to -4000. None of it turns
//
// The colours are warm grey-beige, not silver, with blue-grey plates among them and the radiators blue.
import {lathe} from '../starship/parts.js';
import {mkRng} from '../core/rng.js';

export function model(api){
  const {THREE,C,scene,camera,renderer,animHooks,fold}=api;
  const K=C.station||{};
  const rnd=mkRng(K.seed||2258);
  const G=new THREE.Group();G.rotation.z=-Math.PI/2;scene.add(G);     // local +y becomes world +x
  const SPIN=new THREE.Group();G.add(SPIN);                            // the sphere, the Cobra bays, the carousel
  const pick=[];
  const piece=(parent,name,info,list)=>{const g=new THREE.Group();fold(g,list);g.userData.info={name,info};parent.add(g);pick.push(g);return g;};

  // ---------- the plating ----------
  // The one place on the ship pages that draws a texture. The station's surface IS its plating - long
  // rectangular plates down the drum, a checkerboard on the sphere - and as geometry that is ten thousand
  // boxes, which the first version tried (as five hundred) and which read as clutter rather than as plates.
  // Painted on a canvas it is one draw call, and the lit windows go in a second canvas as the emissive map.
  const tex=(w,h,paint)=>{const c=document.createElement('canvas'),e=document.createElement('canvas');c.width=e.width=w;c.height=e.height=h;
    const g=c.getContext('2d'),ge=e.getContext('2d');ge.fillStyle='#000';ge.fillRect(0,0,w,h);paint(g,ge,w,h);
    const T=new THREE.CanvasTexture(c),TE=new THREE.CanvasTexture(e);for(const t of [T,TE]){t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=8;}return [T,TE];};
  const R0=mkRng(58);
  const tone=()=>{const v=R0();return v<0.08?'#6d7a88':v<0.14?'#5f6a74':v<0.5?'#a39c8e':v<0.8?'#958f82':v<0.93?'#b2ab9d':'#827c70';};
  // the drum: sixteen columns of plates round each tile, each column cut into plates of random length, and
  // now and then a strip of windows along a plate
  const [plateT,plateE]=tex(1024,1024,(g,ge,W,H)=>{
    g.fillStyle='#8f897d';g.fillRect(0,0,W,H);
    const cols=16,cw=W/cols;
    for(let i=0;i<cols;i++){let y=0;while(y<H){const L=Math.min(H-y,40+R0()*R0()*420);
      g.fillStyle=tone();g.fillRect(i*cw+1.5,y+1.5,cw-3,L-3);
      // a rib down the plate, a darker seam across it
      if(R0()<0.4){g.fillStyle='rgba(0,0,0,0.12)';g.fillRect(i*cw+cw*0.45,y+4,cw*0.1,L-8);}
      if(R0()<0.18){ge.fillStyle=R0()<0.7?'#ffdc9a':'#bfe0ff';const n=Math.floor((L-12)/7);for(let k=0;k<n;k++)if(R0()<0.8)ge.fillRect(i*cw+cw*0.3,y+6+k*7,cw*0.4,3);
        g.fillStyle='#4a4640';g.fillRect(i*cw+cw*0.28,y+5,cw*0.44,L-10);}
      y+=L;}}
    // the grime down the seams
    g.fillStyle='rgba(40,36,30,0.35)';for(let i=0;i<=cols;i++)g.fillRect(i*cw-1,0,2,H);});
  plateT.repeat.set(6,1);plateE.repeat.set(6,1);
  // the sphere: a checkerboard of square plates, two tones, with a band of windows here and there
  const [checkT,checkE]=tex(1024,512,(g,ge,W,H)=>{const n=32,m=16,cw=W/n,ch=H/m;
    for(let i=0;i<n;i++)for(let j=0;j<m;j++){g.fillStyle=(i+j)%2?(R0()<0.15?'#6f7c88':'#a8a193'):'#8c8679';g.fillRect(i*cw,j*ch,cw,ch);
      g.strokeStyle='rgba(30,28,24,0.4)';g.strokeRect(i*cw+0.5,j*ch+0.5,cw-1,ch-1);
      if((i+j)%2&&R0()<0.2){ge.fillStyle='#ffe0a8';for(let k=0;k<4;k++)ge.fillRect(i*cw+4+k*cw/4,j*ch+ch*0.45,cw/8,ch*0.12);}}});
  const plateM=new THREE.MeshPhongMaterial({map:plateT,emissiveMap:plateE,emissive:0xffffff,emissiveIntensity:0.9,specular:0x2a2826,shininess:9});
  const checkM=new THREE.MeshPhongMaterial({map:checkT,emissiveMap:checkE,emissive:0xffffff,emissiveIntensity:0.9,specular:0x2a2826,shininess:9});
  const P=(c,f)=>new THREE.MeshPhongMaterial({color:c,specular:0x262422,shininess:8,flatShading:f!==false});
  const m={hull:P(0x9d968a,false),hullF:P(0x9d968a),panel:P(0x857f73),dark:P(0x3c3a36),trench:P(0x4a4740),blue:P(0x66737f),
    rad:new THREE.MeshPhongMaterial({color:0x2e4f82,specular:0x8aa8d8,shininess:60,flatShading:true,side:THREE.DoubleSide}),
    radFrame:P(0x7b776e),lit:new THREE.MeshBasicMaterial({color:0xffe2a8}),amber:new THREE.MeshBasicMaterial({color:0xffb24a}),
    blueLit:new THREE.MeshBasicMaterial({color:0x9ad0ff}),red:new THREE.MeshBasicMaterial({color:0xff3a2a}),green:new THREE.MeshBasicMaterial({color:0x3aff6a}),
    white:new THREE.MeshBasicMaterial({color:0xffffff})};

  // the cutaway plane: it cuts the drum's materials and nothing else
  const cut=new THREE.Plane(new THREE.Vector3(0,1,0),1e9);renderer.localClippingEnabled=true;
  const cm=mat=>{const c=mat.clone();c.clippingPlanes=[cut];return c;};
  const d={plate:cm(plateM),hull:cm(m.hull),panel:cm(m.panel),trench:cm(m.trench),dark:cm(m.dark),lit:cm(m.lit)};

  const DR=K.drumR||420, DA=K.drumAft||-1450, DF=K.drumFore||2850;
  const SY=K.sphereY||3460, SR=K.sphereR||470;

  // ---------- the carousel ----------
  // Five segments of plated cylinder with a trench band between each pair: in each trench the skin steps in,
  // there is a ring of machinery, and its walls carry rows of windows. Stringers of darker plate run the
  // length of each segment between the bands, which is most of what makes it read as long plates.
  {const parts=[],lit=[];
    const cuts=[DA,DA+860,DA+1720,DA+2580,DA+3440,DF];
    for(let s=0;s<5;s++){const y0=cuts[s]+(s?30:0),y1=cuts[s+1]-(s<4?30:0),L=y1-y0;
      const cyl=new THREE.Mesh(new THREE.CylinderGeometry(DR,DR,L,96,1,true),d.plate);cyl.position.y=(y0+y1)/2;
      // one plate tile every hundred and forty metres or so along
      const uv=cyl.geometry.attributes.uv;for(let i=0;i<uv.count;i++)uv.setY(i,uv.getY(i)*L/140);
      parts.push(cyl);
      for(let k=0;k<8;k++){const a=k/8*Math.PI*2+0.2,st=new THREE.Mesh(new THREE.BoxGeometry(22,L-20,8),d.panel);st.position.set(Math.cos(a)*(DR+3),(y0+y1)/2,Math.sin(a)*(DR+3));st.rotation.y=-a+Math.PI/2;parts.push(st);}
      // a few long equipment runs standing off the skin
      for(let k=0;k<10;k++){const a=rnd()*Math.PI*2,len=80+rnd()*300,y=y0+40+rnd()*(L-80-len)+len/2,h=6+rnd()*10;
        const b=new THREE.Mesh(new THREE.BoxGeometry(18+rnd()*30,len,h),rnd()<0.5?d.panel:d.hull);b.position.set(Math.cos(a)*(DR+h/2),y,Math.sin(a)*(DR+h/2));b.rotation.y=-a+Math.PI/2;parts.push(b);}}
    for(let s=1;s<5;s++){const y=cuts[s];
      parts.push(lathe(THREE,[[DR,y-30],[DR-26,y-26],[DR-30,y-12],[DR-30,y+12],[DR-26,y+26],[DR,y+30]],96,d.trench));
      for(let k=0;k<24;k++){const a=k/24*Math.PI*2,b=new THREE.Mesh(new THREE.BoxGeometry(34,40,30),d.dark);b.position.set(Math.cos(a)*(DR-16),y,Math.sin(a)*(DR-16));b.rotation.y=-a;parts.push(b);}
      for(const dy of [-22,22])for(let k=0;k<120;k++){if((k*7)%9===0)continue;const a=k/120*Math.PI*2,w=new THREE.Mesh(new THREE.BoxGeometry(4,3,8),d.lit);w.position.set(Math.cos(a)*(DR-4),y+dy,Math.sin(a)*(DR-4));w.rotation.y=-a;lit.push(w);}}
    // the ends of the carousel close in on the bearings
    parts.push(lathe(THREE,[[DR,DA],[DR*0.86,DA-60],[DR*0.62,DA-90]],96,d.hull));
    parts.push(lathe(THREE,[[DR,DF],[DR*0.9,DF+50],[DR*0.72,DF+70]],96,d.hull));
    piece(SPIN,'The carousel','The rotating section: 840 metres across and four and a half kilometres long, turning once every forty-five seconds for a gravity of about one g at the hull. Bow to stern it is Red Sector (business, and the Zocalo), the Garden through Red and Green, Green (the ambassadors), Brown and Grey - left unfinished when the money ran out, and the home of Down Below. Press Inside to go in.',[...parts,...lit]);}

  // ---------- the bearings and the spine (none of it turns) ----------
  {const parts=[];
    for(const y of [DA-110,DF+95])parts.push(lathe(THREE,[[DR*0.66,y-40],[DR*0.74,y-24],[DR*0.74,y+24],[DR*0.66,y+40]],64,m.dark));
    for(const y of [DA-110,DF+95])for(let k=0;k<32;k++){const a=k/32*Math.PI*2,l=new THREE.Mesh(new THREE.BoxGeometry(8,6,8),m.blueLit);l.position.set(Math.cos(a)*DR*0.745,y,Math.sin(a)*DR*0.745);parts.push(l);}
    piece(G,'The bearings','The carousel turns on electromagnetic bearings at either end, and everything that crosses between the part that turns and the part that does not - power, air, people - does it here.',parts);}

  // ---------- the sphere: Blue Sector, Command and Control, the docking bay ----------
  // A shade wider than the drum, its front flattened into a dish with the bay mouth in the middle and C&C's
  // window under it. It turns with the carousel: the ships match its spin on the way in.
  const DISH=SY+SR*0.9;
  {const prof=[];
    // the back of the sphere down to the collar, the full round, and the front cut off flat
    for(let i=0;i<=26;i++){const a=-Math.PI/2+0.42+i/26*(Math.PI-0.42-0.45);prof.push([Math.cos(a)*SR,SY+Math.sin(a)*SR]);}
    const lip=prof[prof.length-1];
    prof.push([lip[0]*0.97,lip[1]+14],[lip[0]*0.9,DISH+10],[lip[0]*0.6,DISH+18],[150,DISH+22],[0.001,DISH+22]);
    const sph=lathe(THREE,prof,64,checkM);
    const uv=sph.geometry.attributes.uv;for(let i=0;i<uv.count;i++){uv.setX(i,uv.getX(i)*2);uv.setY(i,uv.getY(i)*1.5);}
    const parts=[sph],lit=[];
    // the collar behind it, where it meets the drum
    parts.push(lathe(THREE,[[DR*0.72,DF+70],[330,DF+130],[330,SY-SR*0.86],[DR*0.9,SY-SR*0.72]],64,m.hull));
    for(let i=0;i<5;i++){const y=DF+150+i*((SY-SR*0.86-DF-170)/4);parts.push(lathe(THREE,[[332,y-10],[346,y-5],[346,y+5],[332,y+10]],64,m.panel));}
    // the dish: rings of plate stepping in to the mouth
    for(let i=0;i<4;i++){const r=lip[0]*(0.86-i*0.17);parts.push(lathe(THREE,[[r,DISH+18+i*2],[r-8,DISH+30+i*2],[r-28,DISH+30+i*2],[r-34,DISH+20+i*2]],64,i%2?m.panel:m.hullF));}
    // the bay mouth: a wide lit slot round the dark axial hub, and a ring of guide lights round the dish
    const mouth=new THREE.Mesh(new THREE.BoxGeometry(250,12,120),m.lit);mouth.position.y=DISH+26;parts.push(mouth);
    const inner=new THREE.Mesh(new THREE.BoxGeometry(222,16,96),m.dark);inner.position.y=DISH+28;parts.push(inner);
    for(let k=0;k<36;k++){const a=k/36*Math.PI*2,l=new THREE.Mesh(new THREE.BoxGeometry(12,8,12),k%3?m.lit:m.amber);l.position.set(Math.cos(a)*lip[0]*0.9,DISH+24,Math.sin(a)*lip[0]*0.9);lit.push(l);}
    // C&C: the armoured window under the bay entrance, looking out
    const cc=new THREE.Mesh(new THREE.BoxGeometry(170,10,44),m.blueLit);cc.position.set(0,DISH+22,-150);parts.push(cc);
    const ccf=new THREE.Mesh(new THREE.BoxGeometry(186,12,56),m.dark);ccf.position.set(0,DISH+20,-150);parts.push(ccf);
    piece(SPIN,'Command and Control, and the docking bay','Blue Sector: the sphere at the bow, turning with the carousel. The bay mouth is in the dish at the front - every ship enters dead centre and matches the spin on the way in - and under it is the great armoured window of C&C, a third of the way out from the axis, where the station is run.',[...parts,...lit]);}

  // ---------- the Cobra bays ----------
  // Four, one on each structural arm between the collar and the sphere. Each arm comes off the collar and
  // rises round the back of the sphere into a flared hood - the cobra - which stands proud of the sphere's
  // flank with the launch slot on its underside. They turn with everything else at the front.
  const COBRA=[];
  {const parts=[],lit=[];
    for(let k=0;k<4;k++){const a=k/4*Math.PI*2+Math.PI/4,c=Math.cos(a),s=Math.sin(a);
      const at=(r,y)=>new THREE.Vector3(c*r,y,s*r);
      // the arm: a tapered blade from the collar out and forward, following the sphere's back at a distance
      const path=[];for(let i=0;i<=10;i++){const t=i/10,y=DF+120+t*(SY-DF-60),r=345+(SR+70-345)*Math.sin(t*Math.PI/2);path.push([r,y]);}
      for(let i=0;i<10;i++){const [r0,y0]=path[i],[r1,y1]=path[i+1],mid=at((r0+r1)/2,(y0+y1)/2),len=Math.hypot(r1-r0,y1-y0);
        const b=new THREE.Mesh(new THREE.BoxGeometry(110-i*3,len+6,46),m.hullF);b.position.copy(mid);
        b.rotation.set(0,-a,0);b.rotateZ(-Math.atan2(r1-r0,y1-y0));parts.push(b);}
      // the hood: a shell of the sphere's own shape, a little outside it, flaring wider than the arm
      const hood=new THREE.Mesh(new THREE.SphereGeometry(SR+80,24,12,-0.36,0.72,Math.PI*0.2,Math.PI*0.34),m.hullF);
      hood.material=m.hullF;hood.geometry.scale(1,1,1);
      const hg=new THREE.Group();hg.add(hood);hood.position.y=SY;hood.rotation.y=Math.PI/2-a;
      // the hood's rim, and the slot under it
      const rim=new THREE.Mesh(new THREE.SphereGeometry(SR+86,24,1,-0.38,0.76,Math.PI*0.2,0.03),m.panel);rim.position.y=SY;rim.rotation.y=Math.PI/2-a;hg.add(rim);
      hg.updateMatrixWorld(true);for(const o of [hood,rim]){o.applyMatrix4(hg.matrixWorld);parts.push(o);}
      const slotY=SY+SR*0.25,slotR=Math.cos(Math.asin(0.25))*SR+50;
      const slot=new THREE.Mesh(new THREE.BoxGeometry(18,70,150),m.amber);slot.position.copy(at(slotR,slotY));slot.rotation.y=-a;lit.push(slot);
      const lipB=new THREE.Mesh(new THREE.BoxGeometry(30,16,210),m.dark);lipB.position.copy(at(slotR+6,slotY-40));lipB.rotation.y=-a;parts.push(lipB);
      // the cobra's markings: a row of lights down the spine of the hood
      for(let i=0;i<7;i++){const e=0.62-i*0.08,l=new THREE.Mesh(new THREE.BoxGeometry(10,10,10),m.lit);l.position.copy(at(Math.cos(Math.asin(Math.max(-0.99,Math.min(0.99,e))))*(SR+84),SY+e*(SR+84)));lit.push(l);}
      COBRA.push({a,r:slotR,y:slotY});}
    piece(SPIN,'The Cobra bays','Four launch bays, one on each of the structural arms that join the sphere to the carousel, each shaped like a cobra with its hood raised. The Starfuries hang inside and drop out of the slot; the spin throws them clear before they light their engines.',[...parts,...lit]);}

  // ---------- the docking horns and the tachyon mast (they do not turn) ----------
  {const parts=[],lit=[];
    const hub=lathe(THREE,[[90,DISH+10],[80,DISH+60],[60,DISH+90],[0.001,DISH+95]],24,m.dark);parts.push(hub);
    for(const sd of [-1,1]){
      // each horn: a long flattened arm from the hub, out to the side and forward, in toward its tip
      const seg=12;for(let i=0;i<seg;i++){const t0=i/seg,t1=(i+1)/seg,x=t=>sd*(80+300*Math.sin(t*Math.PI*0.62)),y=t=>DISH+60+t*(4420-DISH-60);
        const ax=x(t0),ay=y(t0),bx=x(t1),by=y(t1),len=Math.hypot(bx-ax,by-ay);
        const b=new THREE.Mesh(new THREE.BoxGeometry(40-t0*14,len+4,70-t0*26),i%3===1?m.panel:m.hullF);b.position.set((ax+bx)/2,(ay+by)/2,0);b.rotation.z=-Math.atan2(bx-ax,by-ay);parts.push(b);
        // the magnetic strips down the inner face, lit
        const st=new THREE.Mesh(new THREE.BoxGeometry(4,len*0.8,8),m.blueLit);st.position.set((ax+bx)/2-sd*(20-t0*7),(ay+by)/2,0);st.rotation.z=b.rotation.z;lit.push(st);}}
    const mast=new THREE.Mesh(new THREE.BoxGeometry(14,560,14),m.panel);mast.position.set(0,DISH+330,120);parts.push(mast);
    const dishT=lathe(THREE,[[0.001,DISH+600],[40,DISH+590],[46,DISH+570]],16,m.hullF);dishT.position.z=120;parts.push(dishT);
    piece(G,'The docking horns','The zero-g docking guides: two arms out in front of the station that do not turn, framing the axial bay. Freighters too big to come aboard park between them to be unloaded and refuelled, and the guides carry magnetic strips so the crews can walk out along them. The tachyon mast and the docking beacon stand above and between them.',[...parts,...lit]);}

  // ---------- the rear: the Yellow Sector, which does not turn ----------
  const RA=K.sternY||-4000;
  const FINS=[];
  {const parts=[],glow=[];
    // the reactor housing behind the aft bearing, then the spine stepping down to the stern
    parts.push(lathe(THREE,[[DR*0.62,DA-150],[330,DA-210],[350,DA-330],[350,DA-600],[300,DA-680],[250,DA-720],[250,RA+520],[300,RA+470],[300,RA+260],[200,RA+200],[120,RA+60],[60,RA]],48,m.hull));
    for(let i=0;i<6;i++){const y=DA-360-i*50;parts.push(lathe(THREE,[[352,y-10],[362,y-4],[362,y+4],[352,y+10]],48,m.panel));}
    for(let k=0;k<16;k++){const a=k/16*Math.PI*2;for(const y of [DA-420,DA-520]){const p=new THREE.Mesh(new THREE.BoxGeometry(26,50,6),m.amber);p.position.set(Math.cos(a)*354,y,Math.sin(a)*354);p.rotation.y=-a+Math.PI/2;glow.push(p);}}
    // the spine's ribs, and cargo pods clamped along it
    for(let i=0;i<22;i++){const y=DA-760-i*((DA-760-(RA+540))/21);parts.push(lathe(THREE,[[250,y-6],[262,y-3],[262,y+3],[250,y+6]],32,m.panel));}
    for(let k=0;k<12;k++){const a=k/12*Math.PI*2+0.13,y=DA-800-(k%3)*120;const pod=new THREE.Mesh(new THREE.BoxGeometry(70,200,70),k%2?m.blue:m.panel);pod.position.set(Math.cos(a)*300,y,Math.sin(a)*300);pod.rotation.y=-a;parts.push(pod);}
    // the thruster block at the stern, and the aft antenna
    for(let k=0;k<6;k++){const a=k/6*Math.PI*2,b=lathe(THREE,[[18,RA+140],[34,RA+100],[46,RA+60]],12,m.dark);b.position.set(Math.cos(a)*190,0,Math.sin(a)*190);parts.push(b);}
    const ant=new THREE.Mesh(new THREE.CylinderGeometry(4,10,420,6),m.panel);ant.position.y=RA-200;parts.push(ant);
    // the radiators: three rows of four blue fins, in planes through the axis at forty-five degrees, each
    // a frame of panels. They are what the rear of the station is in silhouette.
    const rows=[DA-1050,DA-1600,DA-2150],FL=K.finReach||1000,FH=K.finLen||440;
    for(const yc of rows)for(let k=0;k<4;k++){const a=k/4*Math.PI*2+Math.PI/4,c=Math.cos(a),s=Math.sin(a);
      const r0=270,r1=FL;
      const frame=(w,h,dd,r,y)=>{const b=new THREE.Mesh(new THREE.BoxGeometry(w,h,dd),m.radFrame);b.position.set(c*r,y,s*r);b.rotation.y=-a;parts.push(b);};
      frame(r1-r0,18,16,(r0+r1)/2,yc+FH/2);frame(r1-r0,18,16,(r0+r1)/2,yc-FH/2);frame(18,FH,16,r1,yc);frame(r1-r0,10,10,(r0+r1)/2,yc);
      const nu=6;for(let i=0;i<nu;i++)for(const hy of [-1,1]){const u=r0+10+(i+0.5)*(r1-r0-20)/nu,pn=new THREE.Mesh(new THREE.BoxGeometry((r1-r0-20)/nu*0.94,FH/2-16,4),m.rad);pn.position.set(c*u,yc+hy*FH/4,s*u);pn.rotation.y=-a;parts.push(pn);}
      FINS.push({x:c*r1,y:yc+FH/2,z:s*r1});}
    piece(G,'The Yellow Sector: the reactor and the radiators','The zero-g rear of the station, which does not turn: the fusion reactor behind the aft bearing, the spine with its cargo pods, the thrusters that hold the station at the L5 point, and the blue heat radiator fins - twelve of them, in three rows of four - that frame the stern.',[...parts,...glow]);}

  // ---------- the running lights ----------
  const blink=[];
  {const mk=(parent,x,y,z,mat,r)=>{const b=new THREE.Mesh(new THREE.SphereGeometry(r||9,8,6),mat);b.position.set(x,y,z);b.userData.noWire=true;parent.add(b);blink.push(b);};
    mk(G,-380,4420,0,m.red,12);mk(G,380,4420,0,m.green,12);mk(G,0,DISH+630,120,m.white,10);mk(G,0,RA-420,0,m.white,12);
    for(const f of FINS)mk(G,f.x,f.y,f.z,m.amber,8);}
  animHooks.push(now=>{const t=now%2400;for(let i=0;i<blink.length;i++)blink[i].visible=((t+i*97)%2400)<(i<4?300:180);});

  // ---------- the spin ----------
  const PERIOD=(K.period||45)*1000,OMEGA=Math.PI*2/PERIOD;
  const spinAt=now=>(now%PERIOD)*OMEGA;
  animHooks.push(now=>{SPIN.rotation.y=spinAt(now);});

  // ---------- inside ----------
  const IN=buildInterior(api,{SPIN,cut,DR,DA,DF,K});

  // ---------- the cutaway ----------
  // A plane through the axis, turned every frame to face the camera, cuts away the near half of the carousel
  // and whatever is inside it, so from outside you can look in.
  const H0=location.hash.slice(1);
  let cutOn=/(^|&)cutaway(&|$)/.test(H0);
  const wp=new THREE.Vector3();
  const setCut=on=>{cutOn=on;IN.showFromOutside(on);if(!on)cut.set(new THREE.Vector3(0,1,0),1e9);};
  animHooks.push(()=>{if(!cutOn||IN.active())return;wp.copy(camera.position);wp.x=0;if(wp.lengthSq()<1)wp.set(0,1,0);wp.normalize().negate();cut.setFromNormalAndCoplanarPoint(wp,new THREE.Vector3());});
  setCut(cutOn);

  // ---------- the traffic, the gate and the planet ----------
  const traffic=makeTraffic(api,{SPIN,COBRA,DISH,OMEGA,spinAt});
  pick.push(makeGate(api));
  makeEpsilon(api);

  const ship={radius:K.radius||4400,group:G,pick,minD:K.minD||260,
    get adaptiveNear(){return !IN.active();},
    ownsInput:()=>IN.active(),
    camFrame:now=>IN.camFrame(now),
    hashExtra:()=>(IN.active()?'&inside='+IN.where():'')+(cutOn&&!IN.active()?'&cutaway':''),
    hudOnly:now=>IN.active()?IN.hud(now):null,
    hud:now=>'spin '+Math.round(spinAt(now)/Math.PI*180)+'°'+(traffic.inbound?' · '+traffic.inbound+' inbound':''),
    buttons:{'Cutaway':()=>{if(IN.active())IN.exit();setCut(!cutOn);},'Inside':()=>{if(IN.active())IN.exit();else{setCut(false);IN.enter('garden');}}}};
  // #inside=garden|axis|zocalo|below opens there
  {const q=/(^|&)inside(=([a-z]+))?(&|$)/.exec(H0);if(q)setTimeout(()=>{setCut(false);IN.enter(q[3]||'garden');},0);}
  return ship;
}

// ---------- the inside of the carousel ----------
// Built in the carousel's own frame, so it turns with it, and drawn with baked light rather than lit by the
// scene: the only sun in here is the rod down the axis, which lights every square metre of the Garden floor
// from straight overhead, and a directional star coming through the hull would be wrong everywhere.
//
//   the Garden     the middle of the drum, open to the axis: fields, woods, a lake, paths, a few buildings,
//                  the train round the circumference, and the two great end walls with their levels and
//                  windows climbing from the ground to the hub. Stand on the floor and the land goes up both
//                  sides and meets overhead
//   the Zocalo     Red Sector, forward of the Garden: a bazaar in a ring forty metres high near the hull,
//                  stalls and shopfronts and awnings and hanging lamps, the floor curving up ahead of you
//   Down Below     Brown Sector, aft: twenty metres from floor to ceiling, pipes and crates and lean-tos,
//                  lamps that mostly do not work
function buildInterior(api,O){
  const {THREE,C,scene,camera,renderer,animHooks}=api;
  const {SPIN,cut}=O;
  const K=(C.station&&C.station.inside)||{};
  const rnd=mkRng(1701);
  const IN=new THREE.Group();IN.visible=false;SPIN.add(IN);
  const GR=K.gardenR||340, GA=K.gardenAft||200, GF=K.gardenFore||1650;
  const ZR=K.zocaloR||398, ZC=K.zocaloCeil||358, ZA=GF+60, ZF=K.zocaloFore||2320;
  const BR=K.belowR||402, BC=K.belowCeil||382, BA=K.belowAft||-1100, BF=GA-60;
  const col=h=>new THREE.Color(h);
  // A material that takes its colour from the vertices, with the cutaway plane on it and the fog.
  const vM=(side)=>new THREE.MeshBasicMaterial({vertexColors:true,side:side||THREE.FrontSide,clippingPlanes:[cut],fog:true});
  // Bake the light into a geometry's vertex colours: full where a face looks at the axis (the sun), less where
  // it looks along the drum or round it, least where it looks away - and a touch of ambient for everything.
  const inward=new THREE.Vector3(),nrm=new THREE.Vector3();
  function bake(g,base,amb,keep){g=g.index?g.toNonIndexed():g;g.computeVertexNormals();const p=g.attributes.position,n=g.attributes.normal,cols=new Float32Array(p.count*3),c=new THREE.Color();
    for(let i=0;i<p.count;i++){inward.set(-p.getX(i),0,-p.getZ(i));const L=inward.length()||1;inward.multiplyScalar(1/L);nrm.fromBufferAttribute(n,i);
      const k=(amb===undefined?0.42:amb)+(1-(amb===undefined?0.42:amb))*Math.max(0,nrm.dot(inward));c.copy(Array.isArray(base)?base[i%base.length]:base).multiplyScalar(k);cols[i*3]=c.r;cols[i*3+1]=c.g;cols[i*3+2]=c.b;}
    g.setAttribute('color',new THREE.BufferAttribute(cols,3));return g;}
  // merge a list of meshes' geometries (already baked, positioned) into one
  function mergeBaked(list,mat){const pos=[],colr=[];const v=new THREE.Vector3();
    for(const mm of list){mm.updateMatrix();const g=mm.geometry,p=g.attributes.position,c=g.attributes.color;
      for(let i=0;i<p.count;i++){v.fromBufferAttribute(p,i).applyMatrix4(mm.matrix);pos.push(v.x,v.y,v.z);colr.push(c.getX(i),c.getY(i),c.getZ(i));}}
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('color',new THREE.Float32BufferAttribute(colr,3));g.computeBoundingSphere();
    const out=new THREE.Mesh(g,mat);out.frustumCulled=false;return out;}
  // a box standing on the inside of a cylinder of radius r, at angle a and axial y, h tall (toward the axis)
  function standing(w,h,dd,a,y,r,base,amb){const g=bake(new THREE.BoxGeometry(w,h,dd).translate(0,h/2,0),base,amb);
    const mm=new THREE.Mesh(g);mm.position.set(Math.cos(a)*r,y,Math.sin(a)*r);
    // local +y of the box points to the axis
    mm.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),new THREE.Vector3(-Math.cos(a),0,-Math.sin(a)));return mm;}
  // A tube's inner face: vertex colours from fn(angle, y) -> colour, seen from inside.
  function innerTube(r,y0,y1,na,ny,fn,side){const pos=[],colr=[],idx=[],c=new THREE.Color();
    for(let j=0;j<=ny;j++){const y=y0+(y1-y0)*j/ny;for(let i=0;i<=na;i++){const a=i/na*Math.PI*2;const rr=typeof r==='function'?r(a,y):r;pos.push(Math.cos(a)*rr,y,Math.sin(a)*rr);fn(a,y,c);colr.push(c.r,c.g,c.b);}}
    for(let j=0;j<ny;j++)for(let i=0;i<na;i++){const q=j*(na+1)+i;idx.push(q,q+1,q+na+1,q+1,q+na+2,q+na+1);}
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('color',new THREE.Float32BufferAttribute(colr,3));g.setIndex(idx);g.computeBoundingSphere();
    const mm=new THREE.Mesh(g,vM(side||THREE.DoubleSide));mm.frustumCulled=false;return mm;}
  // a wall across the drum (an annulus from r0 to r1 at axial y) with rows of lit windows and ledges on it
  function endWall(y,r0,r1,face,base,winCol,rowsEvery,lit){const out=[];
    out.push(innerTube(r=>r,0,0,1,1,()=>{},THREE.DoubleSide));out.pop();
    const g=new THREE.RingGeometry(r0,r1,96,8);g.rotateX(Math.PI/2);g.translate(0,y,0);
    out.push(new THREE.Mesh(bake(g,base,0.6),vM(THREE.DoubleSide)));
    // the levels: a ledge every rowsEvery metres of radius, and a band of windows above each
    const ledges=[],wins=[];
    for(let r=r1-rowsEvery;r>r0+10;r-=rowsEvery){
      const L=new THREE.Mesh(bake(new THREE.CylinderGeometry(r,r,4,96,1,true).translate(0,y+face*2,0),col('#8e8a82'),0.5));ledges.push(L);
      const lip=new THREE.Mesh(bake(new THREE.RingGeometry(r-1,r+0.2,96,1).rotateX(Math.PI/2).translate(0,y+face*4,0),col('#6f6b64'),0.7));ledges.push(lip);
      const n=Math.floor(r*Math.PI*2/(lit?7:9));for(let k=0;k<n;k++){if(rnd()<(lit?0.25:0.5))continue;const a=k/n*Math.PI*2,w=new THREE.Mesh(bake(new THREE.PlaneGeometry(3.2,2.2),col(winCol[k%winCol.length]),1));
        w.position.set(Math.cos(a)*(r+rowsEvery*0.45),y+face*0.3,Math.sin(a)*(r+rowsEvery*0.45));w.lookAt(w.position.x,y+face*10,w.position.z);w.rotateZ(a+Math.PI/2);wins.push(w);}}
    if(ledges.length)out.push(mergeBaked(ledges,vM(THREE.DoubleSide)));if(wins.length)out.push(mergeBaked(wins,vM(THREE.DoubleSide)));
    return out;}

  // ================= the Garden =================
  {const fields=['#6f8a3a','#8a9a44','#a89a4a','#5f7d34','#7c8f3e','#b8a456','#56733a'].map(col),wood=col('#2f4a26'),path=col('#b9ab8a'),lake=col('#3f7892'),lawn=col('#6f9a48');
    const parcel=(a,y)=>{const ia=Math.floor(a/(Math.PI*2)*36),iy=Math.floor((y-GA)/70);return {ia,iy,h:((ia*73+iy*151)%97)/97};};
    const LAKE=(a,y)=>{const da=Math.atan2(Math.sin(a-1.1),Math.cos(a-1.1));return (da*GR/170)**2+((y-980)/150)**2<1;};
    const isPath=(a,y)=>{const s=a/(Math.PI*2)*8;return Math.abs(s-Math.round(s))*GR*Math.PI*2/8<5||((y-GA)%230)<8;};
    const ground=innerTube((a,y)=>GR+(LAKE(a,y)?4:0)+0.6*Math.sin(a*9+y*0.02),GA,GF,288,150,(a,y,c)=>{
      if(LAKE(a,y)){c.copy(lake);return;}
      if(isPath(a,y)){c.copy(path);return;}
      const P=parcel(a,y);
      if(y<GA+120||y>GF-120)c.copy(lawn).multiplyScalar(0.92+0.1*P.h);
      else if(P.h<0.22)c.copy(wood).multiplyScalar(0.9+0.2*P.h);
      else c.copy(fields[P.ia*3+P.iy*5&0x7fff]?fields[(P.ia*3+P.iy*5)%fields.length]:fields[0]).multiplyScalar(0.88+0.24*P.h);
      // furrows across the fields, so they read as fields from the floor
      if(P.h>=0.22&&y>GA+120&&y<GF-120&&((Math.floor(y/3)+P.ia)%2))c.multiplyScalar(0.93);});
    IN.add(ground);
    // the lake's surface, a sheet just above its bed, pale with the light off the far side
    {const wat=innerTube((a,y)=>GR+0.6,960-150,980+150,120,30,(a,y,c)=>{c.set(LAKE(a,y)?'#6fa8c0':'#000');});
      const idx=wat.geometry.index.array,keep=[],p=wat.geometry.attributes.position;
      for(let i=0;i<idx.length;i+=3){const x=(p.getX(idx[i])+p.getX(idx[i+1])+p.getX(idx[i+2]))/3,z=(p.getZ(idx[i])+p.getZ(idx[i+1])+p.getZ(idx[i+2]))/3,y=(p.getY(idx[i])+p.getY(idx[i+1])+p.getY(idx[i+2]))/3;if(LAKE(Math.atan2(z,x)<0?Math.atan2(z,x)+Math.PI*2:Math.atan2(z,x),y))keep.push(idx[i],idx[i+1],idx[i+2]);}
      wat.geometry.setIndex(keep);IN.add(wat);}
    // the trees: woods where the parcels are wood, orchards in rows along the edges, single trees on the lawns
    {const N=K.trees||5200,treeG=bake(new THREE.ConeGeometry(4.2,13,7).translate(0,10.5,0),col('#3b6230'),0.55),trunkG=bake(new THREE.CylinderGeometry(0.5,0.7,4.5,5).translate(0,2.25,0),col('#5a4632'),0.6);
      // Crowns and trunks have a material each: in three.js r128 an instanced mesh with per-instance colours (the crowns)
      // and one without (the trunks) must not share one, or whichever draws second gets a program that reads a colour
      // buffer it does not have (render: "isInterleavedBufferAttribute" of null).
      const tM=vM(),im=new THREE.InstancedMesh(treeG,tM,N),it=new THREE.InstancedMesh(trunkG,vM(),N),o=new THREE.Object3D(),cc=new THREE.Color();let n=0;
      for(let k=0;k<N*4&&n<N;k++){const a=rnd()*Math.PI*2,y=GA+15+rnd()*(GF-GA-30),P=parcel(a,y);
        const woodHere=P.h<0.22&&y>GA+120&&y<GF-120,lawnHere=y<GA+120||y>GF-120;if(LAKE(a,y)||isPath(a,y))continue;
        if(!woodHere&&!(lawnHere&&rnd()<0.08)&&!(rnd()<0.012))continue;
        o.position.set(Math.cos(a)*GR,y,Math.sin(a)*GR);o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),new THREE.Vector3(-Math.cos(a),0,-Math.sin(a)));o.rotateY(rnd()*6);o.scale.setScalar(0.7+rnd()*0.7);o.updateMatrix();
        im.setMatrixAt(n,o.matrix);it.setMatrixAt(n,o.matrix);cc.setHSL(0.26+rnd()*0.08,0.4,0.72+rnd()*0.4);im.setColorAt(n,cc);n++;}
      im.count=it.count=n;for(const x of [im,it]){x.frustumCulled=false;IN.add(x);}}
    // the buildings: cafes and pavilions along the paths, pale stone and awnings
    {const list=[];for(let k=0;k<60;k++){const s=Math.floor(rnd()*8),a=s/8*Math.PI*2+(rnd()<0.5?-1:1)*(10/GR),y=GA+140+rnd()*(GF-GA-280);if(LAKE(a,y))continue;
        const w=8+rnd()*12,h=4+rnd()*6,dd=8+rnd()*14;list.push(standing(w,h,dd,a,y,GR,col(rnd()<0.6?'#d8d0c0':'#c9b89a'),0.5));
        list.push(standing(w+3,1.2,dd+3,a,y,GR-h,col(['#a8483a','#3a6a8a','#c8a040'][k%3]),0.7));}
      IN.add(mergeBaked(list,vM()));}
    // the train round the circumference near the fore wall, on a raised bed
    {const list=[standing(0.001,0,0,0,0,GR,col('#000'))];list.pop();
      const bed=new THREE.Mesh(bake(new THREE.CylinderGeometry(GR-1.5,GR-1.5,8,192,1,true).translate(0,GF-60,0),col('#4a4640'),0.8));list.push(bed);
      IN.add(mergeBaked(list,vM(THREE.DoubleSide)));
      const car=bake(new THREE.BoxGeometry(22,4,3.2).translate(0,2,0),col('#d8d4cc'),0.55),train=new THREE.InstancedMesh(car,vM(),6);train.frustumCulled=false;IN.add(train);
      const o=new THREE.Object3D();animHooks.push(now=>{if(!IN.visible)return;const t=now/1000*0.035;
        for(let k=0;k<6;k++){const a=t-k*24/(GR-2);o.position.set(Math.cos(a)*(GR-2),GF-60,Math.sin(a)*(GR-2));o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),new THREE.Vector3(-Math.cos(a),0,-Math.sin(a)));o.rotateY(-a);o.updateMatrix();train.setMatrixAt(k,o.matrix);}train.instanceMatrix.needsUpdate=true;});}
    // the end walls: the cliff of levels from the floor to the hub, windows all the way up
    for(const [y,face] of [[GA,1],[GF,-1]])for(const mm of endWall(y,24,GR,face,col('#b4ada0'),['#fff0c8','#ffe2a0','#d8ecff'],16,true))IN.add(mm);
    // the sun: a rod down the axis the length of the Garden, and the zero-g train's tube inside it
    {const rod=new THREE.Mesh(new THREE.CylinderGeometry(7,7,GF-GA,24),new THREE.MeshBasicMaterial({color:0xfff6dc,clippingPlanes:[cut],fog:true}));rod.position.y=(GA+GF)/2;IN.add(rod);
      const halo=new THREE.Mesh(new THREE.CylinderGeometry(16,16,GF-GA,24,1,true),new THREE.MeshBasicMaterial({color:0xfff2c8,transparent:true,opacity:0.18,depthWrite:false,clippingPlanes:[cut],fog:true}));halo.position.y=(GA+GF)/2;IN.add(halo);
      for(const y of [GA,GF]){const hub=new THREE.Mesh(bake(new THREE.CylinderGeometry(24,30,20,24).translate(0,y,0),col('#8c877e'),0.6),vM());IN.add(hub);}}}

  // ================= the Zocalo =================
  // Red Sector, forward of the Garden: a ring forty metres high down by the hull, which is where the
  // gravity is heaviest and the rents are highest. Stalls, shopfronts with their names lit, awnings, and
  // lamps hung from the ceiling.
  {const floor=innerTube(ZR,ZA,ZF,240,40,(a,y,c)=>{const t=(Math.floor(a*ZR/6)+Math.floor(y/6))%2;c.set(t?'#6a4034':'#5a362c');if(((y-ZA)%80)<10)c.set('#8a6a4a');});
    const ceil=innerTube(ZC,ZA,ZF,240,20,(a,y,c)=>{c.set(((Math.floor(a*ZC/10))%6===0)?'#e8d0a0':'#2a2420');});
    IN.add(floor,ceil);
    const list=[],lamps=[],signs=[];
    const SIGN=['#ff5a3a','#3ac8ff','#ffc83a','#b85aff','#5aff8a','#ff8ac8'].map(col);
    // shops in blocks along lanes that run round the ring, three rows of them along the axis
    for(let a=0;a<Math.PI*2-0.001;a+=16/ZR){for(const yl of [ZA+60,ZA+170,ZA+280,ZA+390,ZA+500]){if(yl>ZF-40)continue;
        if(rnd()<0.12)continue;const h=6+rnd()*10,w=12,dd=22+rnd()*14,y=yl+(rnd()-0.5)*6;
        list.push(standing(w,h,dd,a,y,ZR,col(['#8a6a54','#7a5a4a','#9a7a5a','#6a5a50'][Math.floor(rnd()*4)]),0.45));
        // the shopfront facing up the lane, lit, and an awning
        const s=standing(w*0.8,2.2,0.4,a,y+dd/2+0.3,ZR-h*0.55,SIGN[Math.floor(rnd()*SIGN.length)],1);signs.push(s);
        if(rnd()<0.6)list.push(standing(w,0.6,6,a,y+dd/2+3,ZR-3.6,col(['#b8483a','#d8a03a','#3a78a8','#5aa05a'][Math.floor(rnd()*4)]),0.8));}
      // stalls down the middle of the lanes
      if(rnd()<0.5)list.push(standing(4,2.4,4,a,ZA+115+Math.floor(rnd()*4)*110,ZR,col('#b8a078'),0.6));}
    // the lamps: small lit boxes hung below the ceiling, warm
    for(let k=0;k<900;k++){const a=rnd()*Math.PI*2,y=ZA+10+rnd()*(ZF-ZA-20);lamps.push(standing(1.4,0.8,1.4,a,y,ZC+6,col('#ffe0a0'),1));}
    IN.add(mergeBaked(list,vM()),mergeBaked(signs,vM(THREE.DoubleSide)),mergeBaked(lamps,vM()));
    for(const [y,face] of [[ZA,1],[ZF,-1]])for(const mm of endWall(y,ZC,ZR,face,col('#5a4038'),['#ffd08a','#ff9a5a','#ffe8b8'],10,true))IN.add(mm);}

  // ================= Down Below =================
  // Brown Sector: unfinished, dark, twenty metres from floor to ceiling. Bare deck, pipes running along the
  // ceiling, crates, shelters of tarp and sheet, and lamps - the few that work are sodium orange, and some of
  // those flicker.
  const FLICK=[];
  {const floor=innerTube(BR,BA,BF,240,50,(a,y,c)=>{c.set(((Math.floor(a*BR/4)+Math.floor(y/4))%2)?'#3a3834':'#34322e');if(Math.sin(a*37+y*0.05)>0.94)c.set('#26241f');});
    const ceil=innerTube(BC,BA,BF,240,30,(a,y,c)=>{c.set('#1e1d1b');});
    IN.add(floor,ceil);
    const list=[],pipes=[];
    for(let k=0;k<14;k++){const a=k/14*Math.PI*2+0.1,p=new THREE.Mesh(bake(new THREE.CylinderGeometry(1.2,1.2,BF-BA,8).translate(0,(BA+BF)/2,0),col('#5a5046'),0.35));p.position.set(Math.cos(a)*(BC+2.5),0,Math.sin(a)*(BC+2.5));pipes.push(p);}
    for(let k=0;k<700;k++){const a=rnd()*Math.PI*2,y=BA+10+rnd()*(BF-BA-20);
      if(rnd()<0.6)list.push(standing(1.5+rnd()*3,1.2+rnd()*2.4,1.5+rnd()*3,a,y,BR,col(['#5a4a36','#4a4640','#6a5a40'][k%3]),0.4));
      else list.push(standing(3+rnd()*4,2+rnd()*2,3+rnd()*5,a,y,BR,col(['#4a5a6a','#6a4a3a','#5a5a3a','#3a4a5a'][k%4]),0.35));}
    // pillars floor to ceiling in rows, because this part of the station was never fitted out
    for(let a=0;a<Math.PI*2;a+=40/BR)for(let y=BA+40;y<BF-20;y+=60)list.push(standing(2.4,BR-BC,2.4,a,y,BR,col('#4a4843'),0.4));
    IN.add(mergeBaked([...list,...pipes],vM()));
    // the lamps, kept separate so the flickering ones can flicker
    const lampG=bake(new THREE.BoxGeometry(2,0.6,1).translate(0,0.3,0),col('#ffa84a'),1),N=220,lm=new THREE.MeshBasicMaterial({vertexColors:true,clippingPlanes:[cut],fog:true});
    const im=new THREE.InstancedMesh(lampG,lm,N),o=new THREE.Object3D(),cc=new THREE.Color();
    for(let k=0;k<N;k++){const a=rnd()*Math.PI*2,y=BA+10+rnd()*(BF-BA-20);o.position.set(Math.cos(a)*(BC+1),y,Math.sin(a)*(BC+1));o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),new THREE.Vector3(Math.cos(a),0,Math.sin(a)));o.updateMatrix();im.setMatrixAt(k,o.matrix);
      const dead=rnd()<0.35;cc.setRGB(dead?0.2:1,dead?0.18:1,dead?0.15:1);im.setColorAt(k,cc);if(!dead&&rnd()<0.2)FLICK.push({k,ph:rnd()*10});}
    im.frustumCulled=false;IN.add(im);
    animHooks.push(now=>{if(!IN.visible)return;for(const f of FLICK){const on=Math.sin(now*0.013+f.ph*7)>-0.2||Math.sin(now*0.0021+f.ph)>0.6;cc.setRGB(on?1:0.25,on?1:0.22,on?1:0.18);im.setColorAt(f.k,cc);}im.instanceColor.needsUpdate=true;});
    for(const [y,face] of [[BA,1],[BF,-1]])for(const mm of endWall(y,BC,BR,face,col('#3a3834'),['#a8783a','#6a5a3a'],10,false))IN.add(mm);}

  IN.traverse(o=>{o.userData.noWire=true;});

  // ================= being inside =================
  // The camera rides the drum: its position and its up are worked out in the drum's frame and carried round
  // with it, so the floor stays down and the far side of the land stays overhead however fast it turns.
  const W={on:false,where:'garden',a:0.4,y:GA+160,yaw:0,pitch:0.12,eye:1.7,fly:0};
  const PLACES={
    garden:{r:GR,y0:GA+20,y1:GF-20,label:'The Garden',fog:[0xc8d4dc,0.00055],start:{a:0.4,y:GA+160,yaw:0,pitch:0.1}},
    axis:{r:0,y0:GA+40,y1:GF-40,label:'The Garden, from the axis',fog:[0xc8d4dc,0.0005],start:{a:0,y:GA+40,yaw:0,pitch:0}},
    zocalo:{r:ZR,y0:ZA+10,y1:ZF-10,label:'The Zocalo',fog:[0x5a3a28,0.0028],start:{a:0,y:ZA+115,yaw:Math.PI/2,pitch:0.08}},
    below:{r:BR,y0:BA+10,y1:BF-10,label:'Down Below',fog:[0x14110c,0.0065],start:{a:0,y:(BA+BF)/2,yaw:Math.PI/2,pitch:0.02}},
  };
  const keys=new Set();let drag=null,fog0=null,bg0=null;
  const el=renderer.domElement;
  el.addEventListener('pointerdown',e=>{if(W.on)drag={x:e.clientX,y:e.clientY};});
  addEventListener('pointerup',()=>{drag=null;});
  el.addEventListener('pointermove',e=>{if(!W.on||!drag)return;W.yaw-=(e.clientX-drag.x)*0.004;W.pitch=Math.max(-1.5,Math.min(1.5,W.pitch+(e.clientY-drag.y)*0.004));drag.x=e.clientX;drag.y=e.clientY;});
  addEventListener('keydown',e=>{if(!W.on)return;const k=e.key.toLowerCase();if('wasdqe'.includes(k)||k==='shift'){keys.add(k);e.preventDefault();}if(k==='escape')exit();});
  addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));
  addEventListener('blur',()=>keys.clear());
  // the panel of places, shown while inside
  const panel=document.createElement('div');panel.id='b5inside';
  panel.style.cssText='position:fixed;right:10px;top:46px;display:none;flex-direction:column;gap:4px;z-index:6;font:12px Helvetica,Arial,sans-serif';
  const PB={};
  for(const [k,label] of [['garden','Stand in the Garden'],['axis','Float at the axis'],['zocalo','The Zocalo'],['below','Down Below'],['out','Back outside']]){
    const b=document.createElement('button');b.type='button';b.textContent=label;b.style.cssText='background:rgba(8,20,34,.88);color:#dfe8f0;border:1px solid #3f5a74;padding:6px 10px;cursor:pointer;text-align:left';
    b.onclick=()=>{if(k==='out')exit();else go(k);};panel.appendChild(b);PB[k]=b;}
  const tip=document.createElement('div');tip.style.cssText='color:#b8c8d8;background:rgba(8,20,34,.7);padding:4px 8px;max-width:190px;line-height:1.35';
  tip.textContent='Drag to look. W A S D to walk (at the axis: to float), Shift to hurry. Esc goes back outside.';panel.appendChild(tip);
  document.body.appendChild(panel);
  const saved={near:0,far:0,fov:0};
  function go(where){W.where=PLACES[where]?where:'garden';Object.assign(W,PLACES[W.where].start);
    const F=PLACES[W.where].fog;scene.fog=new THREE.FogExp2(F[0],F[1]);renderer.setClearColor(F[0]);
    for(const [k,b] of Object.entries(PB))b.style.borderColor=k===W.where?'#9fd0ff':'#3f5a74';}
  function enter(where){if(!W.on){W.on=true;IN.visible=true;saved.near=camera.near;saved.far=camera.far;saved.fov=camera.fov;fog0=scene.fog;bg0=renderer.getClearColor(new THREE.Color()).getHex();
      camera.near=0.25;camera.far=9000;camera.fov=70;camera.updateProjectionMatrix();cut.set(new THREE.Vector3(0,1,0),1e9);panel.style.display='flex';}
    go(where);}
  function exit(){if(!W.on)return;W.on=false;IN.visible=showOutside;scene.fog=fog0;renderer.setClearColor(bg0);camera.near=saved.near;camera.far=saved.far;camera.fov=saved.fov;camera.updateProjectionMatrix();panel.style.display='none';}
  let showOutside=false,last=0;
  const pL=new THREE.Vector3(),fL=new THREE.Vector3(),uL=new THREE.Vector3(),out=new THREE.Vector3(),circ=new THREE.Vector3(),ax=new THREE.Vector3(0,1,0),tgt=new THREE.Vector3();
  function camFrame(now){if(!W.on){last=now;return false;}
    const dt=Math.min(0.1,(now-last)/1000);last=now;const PL=PLACES[W.where];
    const sp=(keys.has('shift')?(W.where==='axis'?160:18):(W.where==='axis'?40:4.2))*dt;
    let fw=(keys.has('w')?1:0)-(keys.has('s')?1:0),st=(keys.has('d')?1:0)-(keys.has('a')?1:0);
    if(W.where==='axis'){
      // floating: along wherever you are looking, and sideways; you stay near the axis, where there is no weight
      const cy=Math.cos(W.yaw),sy=Math.sin(W.yaw),cp=Math.cos(W.pitch),spp=Math.sin(W.pitch);
      W.y+=(fw*cy*cp)*sp;W.fly=Math.max(-(GR-40),Math.min(GR-40,(W.fly||0)+(fw*spp+st*0.0)*sp));W.a+=st*sp/Math.max(20,Math.abs(W.fly)+20);
    }else{
      // walking on the floor: forward along the ground, which is along the axis and round the drum
      const cy=Math.cos(W.yaw),sy=Math.sin(W.yaw);
      W.y+=(fw*cy-st*sy)*sp;W.a+=(fw*sy+st*cy)*sp/PL.r;}
    W.y=Math.max(PL.y0,Math.min(PL.y1,W.y));
    // where the eye is, in the drum's frame
    const a=W.a;out.set(Math.cos(a),0,Math.sin(a));circ.set(-Math.sin(a),0,Math.cos(a));
    if(W.where==='axis'){pL.copy(out).multiplyScalar(W.fly||0);pL.y=W.y;uL.copy(out).negate();}
    else{pL.copy(out).multiplyScalar(PL.r-W.eye);pL.y=W.y;uL.copy(out).negate();}
    // the look: yaw in the plane of the floor (0 is along the axis, bow-ward), pitch up toward the axis
    fL.copy(ax).multiplyScalar(Math.cos(W.yaw)).addScaledVector(circ,Math.sin(W.yaw)).multiplyScalar(Math.cos(W.pitch)).addScaledVector(uL,Math.sin(W.pitch)).normalize();
    // and into the world, on the drum as it is this frame
    SPIN.updateMatrixWorld(true);const M=SPIN.matrixWorld;
    camera.position.copy(pL).applyMatrix4(M);
    tgt.copy(fL).transformDirection(M).add(camera.position);
    camera.up.copy(uL).transformDirection(M);camera.lookAt(tgt);
    return true;}
  const hud=now=>{const PL=PLACES[W.where];if(!PL)return '';
    const g=W.where==='axis'?Math.abs(W.fly||0)/420:PL.r/420;
    return PL.label+' · '+Math.round(W.y)+' m along · '+(W.where==='axis'?Math.round(Math.abs(W.fly||0))+' m off the axis':'on the floor, '+Math.round(PL.r)+' m from the axis')+' · '+(0.95*g).toFixed(2)+' g';};
  return {active:()=>W.on,where:()=>W.where,enter,exit,camFrame,hud,
    showFromOutside:on=>{showOutside=on;if(!W.on)IN.visible=on;}};
}

// ---------- Epsilon III ----------
// The shared planet generator paints continents and oceans on the vertices of a sphere, which from this close
// comes out in blocks. Epsilon III is a dead world - pale ochre and dun, banded, with its weather drawn out
// along the bands - and a shader does that smoothly at any distance, with the terminator and a thin haze at
// the limb. It is drawn here rather than in the shared sky so that no other page changes.
function makeEpsilon(api){
  const {THREE,C,scene}=api;
  const E=(C.space&&C.space.epsilon)||{};
  const SL=(C.space&&C.space.starLight)||{};
  const D=(C.space&&C.space.far||1400000)*(E.dist||0.5),R=Math.tan((E.deg||22)*Math.PI/180)*D;
  const a=E.az===undefined?-1.2:E.az,e=E.el===undefined?-0.55:E.el;
  const la=SL.az===undefined?0.4:SL.az,le=SL.el===undefined?0.3:SL.el;
  const L=new THREE.Vector3(Math.cos(la)*Math.cos(le),Math.sin(le),Math.sin(la)*Math.cos(le)).normalize();
  const mat=new THREE.ShaderMaterial({uniforms:{uL:{value:L}},
    vertexShader:`varying vec3 vN;varying vec3 vP;varying vec3 vW;void main(){vP=normalize(position);vN=normalize(mat3(modelMatrix)*normal);vec4 w=modelMatrix*vec4(position,1.0);vW=w.xyz;gl_Position=projectionMatrix*viewMatrix*w;}`,
    fragmentShader:`uniform vec3 uL;varying vec3 vN;varying vec3 vP;varying vec3 vW;
float h(vec3 p){return fract(sin(dot(p,vec3(127.1,311.7,74.7)))*43758.5453);}
float n3(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);
 return mix(mix(mix(h(i),h(i+vec3(1,0,0)),f.x),mix(h(i+vec3(0,1,0)),h(i+vec3(1,1,0)),f.x),f.y),mix(mix(h(i+vec3(0,0,1)),h(i+vec3(1,0,1)),f.x),mix(h(i+vec3(0,1,1)),h(i+vec3(1,1,1)),f.x),f.y),f.z);}
float fb(vec3 p){float s=0.0,a=0.5;for(int i=0;i<6;i++){s+=a*n3(p);p=p*2.07+vec3(1.3,7.1,3.7);a*=0.5;}return s;}
void main(){
 vec3 p=vP;
 // bands along the latitude, sheared by weather drawn out east-west
 float w=fb(vec3(p.x*3.0,p.y*9.0,p.z*3.0));
 float b=sin(p.y*17.0+w*5.0)*0.5+0.5;
 float g=fb(p*6.0+vec3(3.0));
 vec3 c1=vec3(0.78,0.66,0.46),c2=vec3(0.62,0.48,0.32),c3=vec3(0.86,0.78,0.62),c4=vec3(0.48,0.36,0.24);
 vec3 c=mix(c2,c1,smoothstep(0.2,0.8,b));
 c=mix(c,c3,smoothstep(0.55,0.8,g)*0.6);
 c=mix(c,c4,smoothstep(0.62,0.85,fb(p*14.0+vec3(9.0)))*0.35);
 // the craters and scars of a dead world, faint
 c*=0.9+0.2*fb(p*40.0);
 // polar caps of pale dust
 c=mix(c,vec3(0.88,0.84,0.76),smoothstep(0.82,0.95,abs(p.y)+0.05*w));
 float d=dot(normalize(vN),uL);
 float lit=smoothstep(-0.08,0.35,d);
 vec3 V=normalize(cameraPosition-vW);
 float rim=pow(1.0-max(0.0,dot(normalize(vN),V)),3.0);
 vec3 col=c*(0.04+0.96*lit)+vec3(0.9,0.62,0.36)*rim*0.45*smoothstep(-0.2,0.3,d);
 gl_FragColor=vec4(col,1.0);}`});
  const planet=new THREE.Mesh(new THREE.SphereGeometry(R,160,110),mat);
  planet.position.set(Math.cos(a)*Math.cos(e)*D,Math.sin(e)*D,Math.sin(a)*Math.cos(e)*D);planet.rotation.z=0.18;
  planet.userData.noWire=true;planet.frustumCulled=false;scene.add(planet);
  api.animHooks.push(()=>{planet.rotation.y+=1.2e-5;});
}

// ---------- the ships ----------
// Nothing here is part of the model the test suite checks, so all of it is noWire. At this scale a Starfury
// is fifteen metres on a station of eight thousand, so each carries an engine light drawn at a fixed size
// on screen; the hull is there for close up.
function makeTraffic(api,O){
  const {THREE,C,scene,animHooks}=api;
  const K=(C.station&&C.station.traffic)||{};
  const out={inbound:0};
  const grey=new THREE.MeshPhongMaterial({color:0x9d968a,specular:0x333333,shininess:12,flatShading:true});
  const darkM=new THREE.MeshPhongMaterial({color:0x4a4843,flatShading:true});
  const glows=(n,colour,size)=>{const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(new Float32Array(n*3).fill(-1e7),3));
    const p=new THREE.Points(g,new THREE.PointsMaterial({color:colour,size,sizeAttenuation:false,transparent:true,opacity:0.95,depthWrite:false}));
    p.frustumCulled=false;p.userData.noWire=true;scene.add(p);return p;};
  // a Starfury: the cockpit pod forward, and four engine arms in an X with a pod on each - it faces +x
  const fury=()=>{const g=new THREE.Group();
    g.add(new THREE.Mesh(new THREE.BoxGeometry(9,2.4,2.4),grey));
    const nose=new THREE.Mesh(new THREE.ConeGeometry(1.3,3,6),grey);nose.rotation.z=-Math.PI/2;nose.position.x=6;g.add(nose);
    for(const [sy,sz] of [[1,1],[1,-1],[-1,1],[-1,-1]]){const arm=new THREE.Mesh(new THREE.BoxGeometry(1.6,6,0.8),grey);arm.position.set(-2.6,sy*2.4,sz*2.4);arm.rotation.x=sy*sz*-0.785;g.add(arm);
      const pod=new THREE.Mesh(new THREE.BoxGeometry(4,1.3,1.3),darkM);pod.position.set(-3,sy*4.4,sz*4.4);g.add(pod);}
    g.traverse(o=>o.userData.noWire=true);return g;};
  const transport=len=>{const g=new THREE.Group();
    g.add(new THREE.Mesh(new THREE.BoxGeometry(len,len*0.18,len*0.22),grey));
    const pods=new THREE.Mesh(new THREE.BoxGeometry(len*0.3,len*0.26,len*0.34),darkM);pods.position.x=-len*0.4;g.add(pods);
    const bridge=new THREE.Mesh(new THREE.BoxGeometry(len*0.14,len*0.1,len*0.12),darkM);bridge.position.set(len*0.36,len*0.12,0);g.add(bridge);
    g.traverse(o=>o.userData.noWire=true);return g;};

  // ---- the approach: transports queued down the lane off the bow, closing, rolling to the spin, and in ----
  const NQ=K.queue||9,LANE=O.DISH+40,Q=[];
  for(let i=0;i<NQ;i++){const len=80+((i*37)%5)*40,s=transport(len);scene.add(s);Q.push({s,len,ph:i/NQ,off:[((i*53)%7-3)*18,((i*29)%5-2)*18]});}
  const qGlow=glows(NQ,0xffb060,4);
  // ---- the patrols ----
  const NF=K.flights||4,F=[];
  for(let f=0;f<NF;f++)for(let k=0;k<4;k++){const s=fury();scene.add(s);F.push({s,f,k});}
  const fGlow=glows(NF*4,0x8ac8ff,3);
  // ---- the launch ----
  // A flight of four out of one Cobra bay, a second apart. Each is let go from the slot and keeps the speed
  // the spin gave it - so it drifts away along the tangent while the bay turns on without it - then flips to
  // face forward on its thrusters, lights its engines, and goes, accelerating hard, into a diamond ahead of
  // the station. Then the next bay round.
  const L=[];for(let k=0;k<4;k++){const s=fury();s.visible=false;scene.add(s);L.push({s,k});}
  const lGlow=glows(4,0x9ad8ff,3),lBurn=glows(4,0xcfefff,7);
  const CYCLE=(K.launchEvery||45)*1000;
  const v=new THREE.Vector3(),v2=new THREE.Vector3(),p0=new THREE.Vector3(),vel=new THREE.Vector3(),q0=new THREE.Quaternion(),q1=new THREE.Quaternion(),m4=new THREE.Matrix4();
  const FWD=new THREE.Vector3(1,0,0);
  animHooks.push(now=>{const t=now/1000;
    let inb=0;const qp=qGlow.geometry.attributes.position;
    for(let i=0;i<NQ;i++){const q=Q[i],u=((t/(K.queueTime||240))+q.ph)%1;
      const dist=9000*Math.pow(1-u,1.6)+20,x=LANE+dist;
      q.s.position.set(x,q.off[0]*(1-u),q.off[1]*(1-u));
      // in the last stretch the ship rolls up to the station's spin and holds it through the mouth
      const roll=u>0.9?O.spinAt(now)*Math.min(1,(u-0.9)/0.05):0;q.s.rotation.set(roll,Math.PI,0);
      q.s.visible=u<0.995;if(u<0.97)inb++;qp.setXYZ(i,x+q.len*0.5,q.s.position.y,q.s.position.z);}
    qp.needsUpdate=true;out.inbound=inb;
    const fp=fGlow.geometry.attributes.position;
    for(const p of F){const ph=t*0.018*(1+p.f*0.13)+p.f*1.6,a=4200+p.f*500,b=1800+p.f*260,tilt=p.f*0.8;
      v.set(Math.cos(ph)*a,Math.sin(ph)*b*Math.cos(tilt),Math.sin(ph)*b*Math.sin(tilt));
      v2.set(-Math.sin(ph)*a,Math.cos(ph)*b*Math.cos(tilt),Math.cos(ph)*b*Math.sin(tilt)).normalize();
      const off=[[0,0],[30,-30],[30,30],[60,0]][p.k];
      p.s.position.copy(v).addScaledVector(v2,-off[0]);p.s.position.y+=off[1]*0.5;p.s.position.z+=off[1];
      m4.lookAt(p.s.position,v.copy(p.s.position).add(v2),new THREE.Vector3(0,1,0));p.s.quaternion.setFromRotationMatrix(m4);p.s.rotateY(Math.PI/2);
      fp.setXYZ(p.f*4+p.k,p.s.position.x,p.s.position.y,p.s.position.z);}
    fp.needsUpdate=true;
    // the launch
    const cyc=Math.floor(now/CYCLE),bay=O.COBRA[cyc%O.COBRA.length],lp=lGlow.geometry.attributes.position,bp=lBurn.geometry.attributes.position;
    for(const l of L){const tr=(now-cyc*CYCLE)/1000-l.k*1.1;
      if(tr<0||tr>32||!bay){l.s.visible=false;lp.setXYZ(l.k,0,-1e7,0);bp.setXYZ(l.k,0,-1e7,0);continue;}
      l.s.visible=true;
      // the moment of release: where the slot was and how fast it was moving, in the world
      const tRel=now-tr*1000,ang=O.spinAt(tRel)+bay.a;
      // local (x,y,z) round the axis: x=cos(ang)r, z=sin(ang)r; the station frame turns local +y to world +x,
      // local +x to world -y
      p0.set(bay.y,-Math.cos(ang)*bay.r,Math.sin(ang)*bay.r);
      const vt=O.OMEGA*1000*bay.r;vel.set(0,Math.sin(ang)*vt,Math.cos(ang)*vt);
      // drift, flip, burn
      const DRIFT=2.6,FLIP=1.6,T=Math.max(0,tr-DRIFT-FLIP),A=55;
      l.s.position.copy(p0).addScaledVector(vel,tr).add(v.set(0.5*A*T*T+T*40,0,0));
      // it faces outward as it leaves the slot, then turns to face forward, then flies along its path
      const outDir=v2.set(0,-Math.cos(ang),Math.sin(ang));
      m4.lookAt(new THREE.Vector3(),outDir,FWD);q0.setFromRotationMatrix(m4);
      const vNow=v.copy(vel).add(new THREE.Vector3(A*T+40*(T>0?1:0),0,0));m4.lookAt(new THREE.Vector3(),vNow.normalize(),new THREE.Vector3(0,1,0));q1.setFromRotationMatrix(m4);
      const f=Math.max(0,Math.min(1,(tr-DRIFT)/FLIP));l.s.quaternion.copy(q0).slerp(q1,f*f*(3-2*f));l.s.rotateY(Math.PI/2);
      const burning=tr>DRIFT+FLIP;
      lp.setXYZ(l.k,l.s.position.x,l.s.position.y,l.s.position.z);
      if(burning){v.set(-6,0,0).applyQuaternion(l.s.quaternion);bp.setXYZ(l.k,l.s.position.x+v.x,l.s.position.y+v.y,l.s.position.z+v.z);}else bp.setXYZ(l.k,0,-1e7,0);}
    lp.needsUpdate=bp.needsUpdate=true;
  });
  return out;
}

// ---------- the jump gate ----------
// Four long prongs standing out from a square frame, their inner faces studded with emitters. When it opens
// the emitters flare and the space between the prongs tears into a vortex - orange at the rim, blue and white
// at the throat - and something comes through towards the station.
function makeGate(api){
  const {THREE,C,scene,animHooks}=api;
  const K=(C.station&&C.station.gate)||{};
  const at=K.at||[9000,1600,-12000],S=K.size||1400;
  const G=new THREE.Group();G.position.set(at[0],at[1],at[2]);G.lookAt(0,0,0);scene.add(G);
  const frame=new THREE.MeshPhongMaterial({color:0x8a857a,flatShading:true,shininess:8}),dark=new THREE.MeshPhongMaterial({color:0x4a4843,flatShading:true});
  const emit=new THREE.MeshBasicMaterial({color:0xc89a3a});
  for(let k=0;k<4;k++){const a=k/4*Math.PI*2+Math.PI/4,g=new THREE.Group();g.rotation.z=a;
    // the base of the prong on the frame, and the prong itself, tapering, standing forward toward the station
    const base=new THREE.Mesh(new THREE.BoxGeometry(260,160,260),dark);base.position.set(S*0.72,0,-120);g.add(base);
    for(let i=0;i<8;i++){const t=i/8,len=S*0.28,w=90-t*55;const seg=new THREE.Mesh(new THREE.BoxGeometry(w,w*0.8,len),i%2?frame:dark);
      seg.position.set(S*(0.72-t*0.08),0,len*(i+0.5));g.add(seg);
      const e=new THREE.Mesh(new THREE.BoxGeometry(12,w*0.5,len*0.7),emit);e.position.set(S*(0.72-t*0.08)-w/2-4,0,len*(i+0.5));g.add(e);}
    G.add(g);}
  // the frame joining the four bases
  for(let k=0;k<4;k++){const a=k/4*Math.PI*2,b=new THREE.Mesh(new THREE.BoxGeometry(S*1.05,70,90),frame);b.position.set(Math.cos(a)*S*0.52,Math.sin(a)*S*0.52,-120);b.rotation.z=a+Math.PI/2;G.add(b);}
  G.userData.info={name:'The jump gate',info:'A few kilometres off the bow. Most ships have no jump engines of their own and come and go through here: the gate tears a vortex into hyperspace between its four prongs and they go through it. It is why a station is parked in this system at all.'};
  const V=new THREE.Group();V.position.z=S*1.1;G.add(V);
  const coreM=new THREE.MeshBasicMaterial({color:0xcfe4ff,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide});
  const rimM=new THREE.MeshBasicMaterial({color:0xff9a3a,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide});
  const midM=new THREE.MeshBasicMaterial({color:0x4a8aff,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide});
  V.add(new THREE.Mesh(new THREE.CircleGeometry(S*0.2,40),coreM));
  const rings=[];
  for(let i=0;i<10;i++){const r=new THREE.Mesh(new THREE.RingGeometry(S*(0.18+i*0.055),S*(0.22+i*0.055),56,1,0,Math.PI*(1.2+(i%3)*0.25)),i<5?midM:rimM);r.position.z=-i*S*0.06;V.add(r);rings.push(r);}
  const funnel=new THREE.Mesh(new THREE.CylinderGeometry(S*0.7,S*0.05,S*1.8,40,1,true),midM);funnel.rotation.x=Math.PI/2;funnel.position.z=-S*0.9;V.add(funnel);
  V.traverse(o=>{o.userData.noWire=true;o.frustumCulled=false;});
  const ship=new THREE.Mesh(new THREE.BoxGeometry(60,40,260),new THREE.MeshPhongMaterial({color:0x9d968a,flatShading:true}));ship.userData.noWire=true;G.add(ship);
  const PERIOD=(K.period||40)*1000,OPEN=(K.open||9)*1000;
  animHooks.push(now=>{const t=now%PERIOD;let f=0;
    if(t<OPEN){const u=t/OPEN;f=Math.pow(Math.sin(u*Math.PI),0.6);}
    coreM.opacity=0.9*f;midM.opacity=0.5*f;rimM.opacity=0.65*f;V.scale.setScalar(0.15+0.85*f);V.visible=f>0.01;
    rings.forEach((r,i)=>{r.rotation.z=now*0.0012*(i%2?1:-1)+i*0.7;});
    const su=(t-OPEN*0.35)/(PERIOD*0.5);ship.visible=su>0&&su<1;ship.position.set(0,0,S*1.1-200+su*8000);
    emit.color.setHex(f>0.01?0xfff0b0:0xc89a3a);});
  return G;
}
