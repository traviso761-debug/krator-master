// ---------- Barcelona: the buildings that are shapes rather than heights ----------
// Everything else in the city is its own mapped footprint, extruded by the engine: the Eixample's chamfered blocks
// round their courtyards, the old city's lanes. These are the buildings a massing model gets wrong, because what makes
// them what they are is a shape - Gaudí's above all. Each is modelled here from published dimensions and placed on
// its mapped site, turned to its mapped orientation (the config's "face" is the bearing the front looks toward); the
// mapped footprints it replaces are dropped with "clear" or "clearArea".
//
// The kit is src/core/landkit.js (Model, pooled parts merged by material), with Barcelona's stones and Gaudí's
// trencadís: mosaic is many small parts each in its own glazed colour, which from any distance reads as the broken
// tile it is. Night lighting is by material: a key listed in a model's `glow` table is lit after dark.
//
// Map data (c) OpenStreetMap contributors, ODbL. The geometry is this project's own, from published dimensions.
import {mkRng} from '../core/rng.js';
import {landkit} from '../core/landkit.js';

export function landmarks(api){
  const {THREE,animHooks,gh,nightF,hour,P}=api;
  const V3=THREE.Vector3;
  const BCN={sfOld:0x9a8768,sfStone:0xc6b691,sfPale:0xd9cfb6,sfWhite:0xebe6da,ceramic:0xf6f4ee,glass:0x26303a,glassBlue:0x3b5c7a,crossGlass:0xe8eef0,
    mosRed:0xc4302a,mosGold:0xd9a92e,mosGreen:0x4f8c3a,mosBlue:0x2d6aa6,mosTeal:0x2a8a8a,mosOrange:0xe07a2a,mosYellow:0xe9c93a,mosWhite:0xf1eee6,
    mosPurple:0x7c4c8e,mosPink:0xd77a9a,cypress:0x3a6638,crane:0xe2b11e,craneRed:0xb8302a,scaffold:0x8d9092,net:0x9aa29a,
    brickBcn:0xa9553a,brickDark:0x7d3b28,sandstone:0xd8c49c,montjuic:0xcbb68e,gothic:0xb2a58a,gothicDark:0x8c806c,ironGreen:0x2f4a3f,iron:0x26262a,
    rubble:0x8a6e52,batWall:0x8fa6b0,boneWhite:0xe9e1cf,roofSlate:0x5a5f66,
    agRed:0xb5322a,agOrange:0xd2602a,agOchre:0xc89a3a,agTeal:0x3f7f86,agBlue:0x2f5f9a,agSky:0x8eaac4,agPale:0xc8d2d8,agGlass:0x8aa0b0,
    wGlass:0x7f97ab,wFrame:0xd8dcde,cable:0x202022,cabin:0xc8302a,steelPale:0xa9adb0,bronzeDark:0x4a3c2a,lion:0x4e4230,leadDome:0x7d8683,
    tileRoof:0xb8663e,warmLamp:0xffd9a0,greenGlass:0x3f6a4a,lampWhite:0xfff6e0};
  const {Model,mat,setMat,turn}=landkit(api,BCN);
  // every one of Barcelona's own keys is drawn from both sides: lathes, tubes and the hand-made strips here wind
  // either way, and a model seen from inside a courtyard or under a vault must not lose its walls
  for(const k in BCN)setMat(k,new THREE.MeshLambertMaterial({color:BCN[k],side:THREE.DoubleSide}));
  setMat('wGlass',new THREE.MeshPhongMaterial({color:0xa8bccb,specular:0xffffff,shininess:120,emissive:0x1a2430,side:THREE.DoubleSide}));
  setMat('agGlass',new THREE.MeshPhongMaterial({color:BCN.agGlass,specular:0xc0d0e0,shininess:60,transparent:true,opacity:0.35,depthWrite:false,side:THREE.DoubleSide}));
  setMat('glass',new THREE.MeshPhongMaterial({color:BCN.glass,specular:0x8090a0,shininess:40,side:THREE.DoubleSide}));
  const Q=new THREE.Quaternion(),E=new THREE.Euler(),UPZ=new V3(0,0,1);
  // a straight member between two points, t thick (a lattice bar, a brace, a cable)
  function beam(M,k,a,b,t,t2){const d=new V3().subVectors(b,a),len=d.length();if(len<0.01)return;Q.setFromUnitVectors(UPZ,d.normalize());E.setFromQuaternion(Q,'YXZ');
    M.put(k,M.cached('bm'+t+','+(t2||t),()=>new THREE.BoxGeometry(t,t2||t,1)),(a.x+b.x)/2,(a.y+b.y)/2,(a.z+b.z)/2,E.y,E.x,E.z,[1,1,len]);}
  // a solid of revolution from [radius, height] pairs, bottom to top
  const lathe=(M,k,prof,seg,x,y,z,sx=1,sz=1)=>M.put(k,M.cached('la'+seg+':'+prof.map(p=>p[0].toFixed(2)+','+p[1].toFixed(2)).join(';'),()=>new THREE.LatheGeometry(prof.map(([r,h])=>new THREE.Vector2(Math.max(r,0.001),h)),seg)),x,y,z,0,0,0,sx!==1||sz!==1?[sx,1,sz]:undefined);
  const sphere=(M,k,x,y,z,r,seg=10)=>M.put(k,M.cached('sp'+seg,()=>new THREE.SphereGeometry(1,seg,Math.max(4,seg*0.7|0))),x,y,z,0,0,0,[r,r,r]);
  const cone=(M,k,x,y,z,r,h,seg=10)=>M.put(k,M.cached('cn'+r+','+h+','+seg,()=>new THREE.ConeGeometry(r,h,seg).translate(0,h/2,0)),x,y,z);
  // a pitched roof: a triangular prism, its ridge along z (or along x when alongX), w wide at the eaves, h high
  const ridge=(M,k,x,y,z,w,h,len,alongX)=>M.put(k,M.cached('rg'+w+','+h+','+len,()=>{const s=new THREE.Shape();s.moveTo(-w/2,0);s.lineTo(w/2,0);s.lineTo(0,h);s.lineTo(-w/2,0);return new THREE.ExtrudeGeometry(s,{depth:len,bevelEnabled:false}).translate(0,0,-len/2);}),x,y,z,alongX?Math.PI/2:0);
  // after dark: each listed key's material glows its colour times the night (and an optional pulse of time)
  function glow(table,fn){const mats=Object.keys(table).map(k=>[mat(k),table[k]]);
    animHooks.push(now=>{const n=nightF(hour());for(const [m,c] of mats){if(!m.emissive)continue;const f=fn?fn(now,c):1;m.emissive.setRGB(c[0]*n*f,c[1]*n*f,c[2]*n*f);}});}
  // the mapped footprint under a point (the largest that holds it), as [[x,z],...], with its centre and long axis
  function footprintAt(x,z,minA=40){let best=null;for(const b of api.OSM.buildings){const p=b.p;let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9;
      for(let i=0;i+1<p.length;i+=2){const px=p[i]/10,pz=p[i+1]/10;if(px<x0)x0=px;if(px>x1)x1=px;if(pz<z0)z0=pz;if(pz>z1)z1=pz;}
      if(x<x0||x>x1||z<z0||z>z1)continue;const r=[];for(let i=0;i+1<p.length;i+=2)r.push([p[i]/10,p[i+1]/10]);
      if(!api.inPoly(x,z,r))continue;const a=Math.abs(api.polyArea(r));if(a>=minA&&(!best||a>best.a))best={ring:r,a,b};}
    if(!best)return null;let cx=0,cz=0;for(const [px,pz] of best.ring){cx+=px;cz+=pz;}cx/=best.ring.length;cz/=best.ring.length;
    let sxx=0,szz=0,sxz=0;for(const [px,pz] of best.ring){sxx+=(px-cx)**2;szz+=(pz-cz)**2;sxz+=(px-cx)*(pz-cz);}
    best.cx=cx;best.cz=cz;best.axis=0.5*Math.atan2(2*sxz,sxx-szz);return best;}
  // world position of a point in a model's frame (the kit's convention: ry about y, the model built facing +z)
  const toWorld=(x,z,ry,lx,lz)=>[x+lx*Math.cos(ry)+lz*Math.sin(ry),z-lx*Math.sin(ry)+lz*Math.cos(ry)];
  const MOSAIC=['mosBlue','mosGreen','mosYellow','mosWhite','mosOrange','mosRed','mosTeal','mosPurple'];

  // ---- a tower crane, its jib turning slowly (the Sagrada Família has had cranes over it for a century) ----
  function crane(L,x,z,ry,lx,lz,H,jib,seed){const [wx,wz]=toWorld(x,z,ry,lx,lz),g0=gh(wx,wz),M=Model(),J=Model();
    const s=1.0,lv=4;
    for(let h=0;h<H;h+=lv){for(const [a,b] of [[[-1,-1],[1,-1]],[[1,-1],[1,1]],[[1,1],[-1,1]],[[-1,1],[-1,-1]]]){
        beam(M,'crane',new V3(a[0]*s,h,a[1]*s),new V3(b[0]*s,h+lv,b[1]*s),0.18);}
      for(const c of [[-1,-1],[1,-1],[1,1],[-1,1]])beam(M,'crane',new V3(c[0]*s,h,c[1]*s),new V3(c[0]*s,h+lv,c[1]*s),0.28);}
    M.box('crane',0,H,0,2.6,1.2,2.6);
    // the turning part: the cab, the jib with its trolley, the counter-jib and its weights, the A-frame and the ties
    J.box('crane',0,0,0,2.4,1.4,2.4);J.box('mosWhite',1.6,0,0.6,1.6,2.2,1.8);J.box('glass',2.42,0.6,0.6,0.05,1.2,1.5);
    for(let u=0;u<jib;u+=3){beam(J,'crane',new V3(0,1.4,u),new V3(0,1.4,u+3),0.22);beam(J,'crane',new V3(-0.8,0,u),new V3(-0.8,0,u+3),0.2);beam(J,'crane',new V3(0.8,0,u),new V3(0.8,0,u+3),0.2);
      beam(J,'crane',new V3(-0.8,0,u),new V3(0,1.4,u+1.5),0.12);beam(J,'crane',new V3(0.8,0,u),new V3(0,1.4,u+1.5),0.12);}
    for(let u=0;u<jib*0.3;u+=3){beam(J,'crane',new V3(-0.8,0,-u),new V3(-0.8,0,-u-3),0.2);beam(J,'crane',new V3(0.8,0,-u),new V3(0.8,0,-u-3),0.2);}
    J.box('montjuic',0,-1.6,-jib*0.28,2.4,3.0,2.6);beam(J,'crane',new V3(0,1.2,0),new V3(0,8,0),0.4);
    beam(J,'cable',new V3(0,8,0),new V3(0,1.4,jib*0.7),0.08);beam(J,'cable',new V3(0,8,0),new V3(0,0,-jib*0.3),0.08);
    J.box('craneRed',0,-0.9,jib*0.55,1.4,0.8,1.6);beam(J,'cable',new V3(0,-0.9,jib*0.55),new V3(0,-30,jib*0.55),0.05);
    J.box('craneRed',0,8,0,0.5,0.5,0.5);
    M.finish(L,wx,g0,wz,0);const j=J.finish(L,wx,g0+H+1.2,wz,ry+seed);
    const R=mkRng(seed*97|0),w=0.02+R()*0.03,ph=R()*6;animHooks.push(now=>{j.rotation.y=ry+seed+Math.sin(now/1000*w+ph)*1.2;});}

  return {

  // ================================================================ the Sagrada Família
  // Gaudí's basilica, begun 1882, as it stands in 2026, the centenary of his death: the Tower of Jesus Christ finished
  // at 172.5 m with its cross - the tallest church tower in the world - the four Evangelists' towers at 135 m round it
  // (Luke's bull, Mark's lion, John's eagle, Matthew's angel), the Virgin Mary's at 138 m over the apse with its
  // twelve-pointed star, and the eight Apostles' towers of the Nativity (north-east) and Passion (south-west) fronts,
  // 98 to 112 m. The Glory front, the main one, on Carrer de Mallorca, is still building: its portico in scaffold, its
  // four towers not yet begun, the cranes over it.
  // The plan is a Latin cross of five naves (45 m across, the central one 45 m high) and a transept of three (30 m,
  // 60 m from end to end), the apse at the north-west end ringed by its chapels' spires. The model's frame: +z is
  // the Glory front, +x the Nativity, -x the Passion, -z the apse; origin at the crossing.
  // The Apostles' towers are Gaudí's parabolic spindles: round from the portal up, perforated by spiralling louvres
  // that let out the bells' sound, each finished in a pinnacle of Venetian mosaic, a bishop's mitre and cross.
  sagrada(L,x,z){const g0=gh(x,z),M=Model(),ry=turn(L.face==null?135:L.face),R=mkRng(1882);
    // ---- the body ----
    const NAVE_Z0=-8,NAVE_Z1=58,NL=NAVE_Z1-NAVE_Z0,NC=(NAVE_Z0+NAVE_Z1)/2;
    M.box('sfStone',0,0,NC,15,45,NL);for(const s of [-1,1])M.box('sfStone',s*15,0,NC,15,30,NL);
    M.box('sfStone',0,0,0,62,45,15);for(const s of [-1,1])M.box('sfStone',0,0,s*11.25,62,30,7.5);
    // the apse: the ambulatory and its seven chapels, the high apse inside it, and the chapels' spires
    M.cyl('sfOld',0,0,-16,22,22,30,28);M.cyl('sfStone',0,0,-14,12,11,48,24);
    for(let i=0;i<7;i++){const a=(i/6-0.5)*Math.PI*1.05,px=Math.sin(a)*22.6,pz=-16-Math.cos(a)*22.6;
      lathe(M,'sfOld',[[3.0,0],[2.6,6],[1.9,12],[1.1,17],[0.3,21],[0.02,22]],10,px,28,pz);
      sphere(M,'mosGold',px,50.6,pz,0.7,8);
      for(let j=0;j<3;j++)M.box('glass',px*0.96,8+j*7,pz*0.96+0.6,1.8,5,0.4);}
    // windows: the aisles', the clerestory's, the transept's: tall, pointed, set in pale frames
    for(let zz=NAVE_Z0+5;zz<NAVE_Z1-3;zz+=7.5)for(const s of [-1,1]){
      M.box('sfPale',s*22.55,6,zz,0.3,21,4.4);M.box('glass',s*22.75,7,zz,0.3,19,3.2);cone(M,'sfPale',s*22.6,28,zz,1.6,3.2,4);
      M.box('glass',s*7.65,31.5,zz,0.3,12,3.0);cone(M,'sfPale',s*7.7,43.5,zz,1.4,2.6,4);}
    for(let xx=-26;xx<=26;xx+=7.5){if(Math.abs(xx)<10)continue;for(const s of [-1,1]){M.box('glass',xx,7,s*15.1,3.2,19,0.3);M.box('glass',xx,31.5,s*7.65,3.0,12,0.3);}}
    // the roofs: the aisles' and the transept aisles' low pitches, the nave's and the transept's steep ones, and the
    // lanterns along their ridges (Gaudí's roof is a row of pointed hyperboloid skylights, not a slope of tiles)
    for(const s of [-1,1])ridge(M,'sfPale',s*15,30,NC,15.2,4,NL);ridge(M,'sfPale',0,45,NC,15.4,13,NL);
    for(const s of [-1,1])ridge(M,'sfPale',0,30,s*11.25,7.7,3,62,true);ridge(M,'sfPale',0,45,0,15.4,13,62,true);
    for(let zz=NAVE_Z0+10;zz<NAVE_Z1-2;zz+=7.5)lathe(M,'sfWhite',[[1.6,0],[1.3,5],[0.7,9],[0.05,12]],8,0,53,zz);
    for(const xx of [-27,-21,21,27])lathe(M,'sfWhite',[[1.5,0],[1.2,4.5],[0.6,8],[0.05,11]],8,xx,53,0);
    // the pinnacles over the aisle buttresses, crowned with baskets of fruit in mosaic
    const FRUIT=['mosOrange','mosRed','mosYellow','mosGreen','mosPurple','mosPink'];
    const basket=(px,y,pz)=>{M.cyl('sfPale',px,y,pz,1.0,0.7,6,8);sphere(M,'sfWhite',px,y+6.6,pz,1.0,8);
      for(let i=0;i<5;i++){const a=i/5*Math.PI*2+R()*0.6;sphere(M,FRUIT[(R()*FRUIT.length)|0],px+Math.cos(a)*0.85,y+7.4+R()*0.8,pz+Math.sin(a)*0.85,0.62,8);}
      sphere(M,FRUIT[(R()*FRUIT.length)|0],px,y+8.6,pz,0.7,8);};
    for(let zz=NAVE_Z0+9;zz<NAVE_Z1;zz+=7.5)for(const s of [-1,1]){basket(s*22.4,30,zz);basket(s*7.6,45,zz);}
    for(let xx=-26;xx<=26;xx+=7.5){if(Math.abs(xx)<10)continue;for(const s of [-1,1])basket(xx,30,s*15);}
    // ---- the crossing, and the six great towers over it ----
    M.box('sfPale',0,45,0,30,18,30);
    for(const [sx,sz] of [[1,1],[1,-1],[-1,1],[-1,-1]])lathe(M,'sfPale',[[3.4,0],[2.6,8],[1.2,13],[0.05,15]],8,sx*13.5,63,sz*13.5);
    // a tall tower: the shaft turned from its profile, ribs up it, the slits of its windows, the ceramic above `white`
    const tower=(cx,cz,prof,ribs,white,slits)=>{lathe(M,'sfPale',prof,28,cx,0,cz);
      const top=prof[prof.length-1][1],rAt=h=>{for(let i=0;i+1<prof.length;i++){const [r0,h0]=prof[i],[r1,h1]=prof[i+1];if(h<=h1)return r0+(r1-r0)*(h-h0)/(h1-h0||1);}return prof[prof.length-1][0];};
      if(white!=null){const wp=prof.filter(p=>p[1]>=white).map(([r,h])=>[r*1.025,h]);wp.unshift([rAt(white)*1.025,white]);lathe(M,'ceramic',wp,28,cx,0,cz);}
      for(let i=0;i<ribs;i++){const a=i/ribs*Math.PI*2,pts=[];for(let h=prof[0][1];h<=top-1;h+=4){const r=rAt(h)+0.35;pts.push(new V3(cx+Math.cos(a)*r,h,cz+Math.sin(a)*r));}
        for(let j=0;j+1<pts.length;j++)beam(M,(white!=null&&pts[j].y>white)?'ceramic':'sfStone',pts[j],pts[j+1],0.55);}
      for(const [h0,h1,n] of slits)for(let h=h0;h<h1;h+=6.5)for(let i=0;i<n;i++){const a=(i+0.5)/n*Math.PI*2,r=rAt(h+2.5)+0.15;
        M.put('glass',M.cached('slit',()=>new THREE.BoxGeometry(0.9,5,0.5).translate(0,2.5,0)),cx+Math.cos(a)*r,h,cz+Math.sin(a)*r,Math.atan2(Math.cos(a),Math.sin(a)));}
      return rAt;};
    // the Evangelists: four towers of 135 m, each crowned with its symbol in white and gold
    const EV=[[13.5,13.5,'bull'],[-13.5,13.5,'lion'],[-13.5,-13.5,'eagle'],[13.5,-13.5,'angel']];
    for(const [ex,ez,sym] of EV){tower(ex,ez,[[6.4,40],[6.2,70],[5.7,95],[4.8,110],[3.4,120],[2.4,126],[1.6,128]],12,104,[[66,112,8]]);
      const y=128;M.cyl('mosGold',ex,y,ez,1.8,1.4,1.2,10);
      if(sym==='bull'){M.box('mosWhite',ex,y+1.2,ez,2.2,2.4,3.6);M.box('mosWhite',ex,y+2.6,ez+2.0,1.6,1.6,1.6);for(const s of [-1,1])beam(M,'mosGold',new V3(ex+s*0.6,y+3.8,ez+2.2),new V3(ex+s*1.6,y+5.0,ez+2.0),0.3);}
      else if(sym==='lion'){M.box('mosWhite',ex,y+1.2,ez,2.0,2.2,3.4);sphere(M,'mosGold',ex,y+3.4,ez+1.8,1.3,10);M.box('mosWhite',ex,y+3.0,ez+2.6,0.9,0.9,1.0);}
      else if(sym==='eagle'){M.box('mosWhite',ex,y+1.2,ez,1.4,3.4,1.6);sphere(M,'mosWhite',ex,y+5.0,ez+0.3,0.8,8);for(const s of [-1,1])M.put('mosGold',M.cached('wing',()=>new THREE.BoxGeometry(3.6,0.35,1.6)),ex+s*2.0,y+3.4,ez,0,0,s*0.55);}
      else{M.cyl('mosWhite',ex,y+1.2,ez,1.0,0.6,3.4,10);sphere(M,'mosWhite',ex,y+5.1,ez,0.7,8);for(const s of [-1,1])M.put('mosGold',M.cached('wing',()=>new THREE.BoxGeometry(3.6,0.35,1.6)),ex+s*1.8,y+3.6,ez,0,0,s*0.85);}
      sphere(M,'lampWhite',ex,y+6.6,ez,0.5,8);}
    // the Virgin Mary's, over the apse: 138 m, its twelve-pointed star of glass and steel lit from within
    {const mz=-26;tower(0,mz,[[7.6,40],[7.3,75],[6.6,98],[5.2,114],[3.6,124],[2.4,130]],12,106,[[60,118,10]]);
      const sy=134.5;sphere(M,'crossGlass',0,sy,mz,2.0,12);
      const ico=new THREE.IcosahedronGeometry(1,0).attributes.position,dirs=[],seen=new Set();
      for(let i=0;i<ico.count;i++){const v=new V3().fromBufferAttribute(ico,i).normalize(),k=v.toArray().map(c=>c.toFixed(2)).join();if(!seen.has(k)){seen.add(k);dirs.push(v);}}
      for(const d of dirs){Q.setFromUnitVectors(new V3(0,1,0),d);E.setFromQuaternion(Q,'YXZ');M.put('crossGlass',M.cached('starpt',()=>new THREE.ConeGeometry(0.7,3.4,6).translate(0,1.7+1.4,0)),0,sy,mz,E.y,E.x,E.z);}}
    // Jesus Christ's: 172.5 m to the top of the cross, the cross itself 13.5 m tall and 17 m across its four arms
    {tower(0,0,[[11.2,40],[11.0,70],[10.4,100],[9.2,122],[7.4,138],[5.4,148],[3.4,154],[2.2,157]],16,126,[[72,140,12]]);
      M.cyl('mosWhite',0,157,0,2.0,1.6,1.6,12);
      const cy=158.6,ch=13.9,arm=8.5;M.box('crossGlass',0,cy,0,2.4,ch,2.4);
      for(const [ax,az] of [[1,0],[-1,0],[0,1],[0,-1]]){M.box('crossGlass',ax*arm/2,cy+ch*0.62-1.2,az*arm/2,ax?arm:2.2,2.4,az?arm:2.2);
        lathe(M,'mosWhite',[[0.9,0],[1.2,0.6],[0.3,1.4]],8,ax*arm,cy+ch*0.62-1.4,az*arm);}
      for(const [ax,az] of [[1,0],[-1,0],[0,1],[0,-1]])M.box('ceramic',ax*1.3,cy,az*1.3,ax?0.2:2.6,ch,az?0.2:2.6);}
    // ---- the Apostles: four towers to each of the Nativity and Passion fronts ----
    const apostle=(cx,cz,H,old)=>{const Hs=H-21,k=old?'sfOld':'sfStone';
      const prof=[];for(let i=0;i<=12;i++){const t=i/12;prof.push([4.6*(1-0.5*Math.pow(t,1.7)),t*Hs]);}
      lathe(M,k,prof,24,cx,0,cz);
      const rAt=h=>4.6*(1-0.5*Math.pow(Math.min(1,h/Hs),1.7));
      // the louvres, spiralling up from above the portals
      for(let h=34,row=0;h<Hs-3;h+=3.2,row++)for(let i=0;i<6;i++){const a=i/6*Math.PI*2+row*0.5,r=rAt(h)+0.05;
        M.put('glass',M.cached('louvre',()=>new THREE.BoxGeometry(1.0,1.3,0.5)),cx+Math.cos(a)*r,h,cz+Math.sin(a)*r,Math.atan2(Math.cos(a),Math.sin(a)));}
      // the words up them in yellow: "Hosanna", "Excelsis", "Sanctus" - a band of letters round each tower
      for(let i=0;i<14;i++){const a=i/14*Math.PI*2,h=Hs-9,r=rAt(h)+0.12;M.put('mosYellow',M.cached('letter',()=>new THREE.BoxGeometry(0.8,1.4,0.3)),cx+Math.cos(a)*r,h,cz+Math.sin(a)*r,Math.atan2(Math.cos(a),Math.sin(a)));}
      // the pinnacle: a neck, the mitre in white and red mosaic, a ring of gold knobs, and the cross with its balls
      const y=Hs,rt=rAt(Hs);lathe(M,k,[[rt,0],[rt*0.55,3]],12,cx,y,cz);
      lathe(M,'mosWhite',[[1.3,0],[2.0,2.5],[2.3,6],[2.0,10],[1.3,13],[0.5,15.5]],12,cx,y+3,cz);
      for(let i=0;i<6;i++){const a=i/6*Math.PI*2;M.box('mosRed',cx+Math.cos(a)*1.9,y+5,cz+Math.sin(a)*1.9,0.6,8,0.6);sphere(M,'mosGold',cx+Math.cos(a)*2.45,y+8,cz+Math.sin(a)*2.45,0.55,8);
        sphere(M,'mosWhite',cx+Math.cos(a+0.5)*2.0,y+11.5,cz+Math.sin(a+0.5)*2.0,0.5,8);}
      M.box('mosGold',cx,y+18,cz,0.5,4,0.5);M.box('mosGold',cx,y+19.4,cz,2.4,0.5,0.5);M.box('mosGold',cx,y+19.4,cz,0.5,0.5,2.4);
      for(const [ax,az] of [[1,0],[-1,0],[0,1],[0,-1]])sphere(M,'mosWhite',cx+ax*1.3,y+19.6,cz+az*1.3,0.4,8);sphere(M,'mosWhite',cx,y+22.2,cz,0.45,8);};
    // the Nativity front (+x): Gaudí's own, the only part he saw finished (its first tower in 1925); its stone the
    // darkest, its portals a carved forest - Faith, Hope and Charity - and the cypress of the Tree of Life over them
    {const fx=34;M.box('sfOld',fx,0,0,10,30,46);
      for(const [pz,w,h] of [[0,9,26],[-13,6.5,20],[13,6.5,20]]){M.box('glass',fx+5.05,0,pz,0.3,h*0.62,w*0.7);
        lathe(M,'sfOld',[[w/2,0],[w*0.42,h*0.25],[w*0.25,h*0.5],[0.1,h*0.72]],10,fx+3,26,pz,0.6,1);
        for(let i=0;i<14;i++){const yy=6+R()*(h-6),zz=pz+(R()-0.5)*w*0.9;sphere(M,R()<0.5?'sfOld':'sfStone',fx+5.1+R()*0.6,yy,zz,0.5+R()*0.7,6);}}
      M.box('sfOld',fx+1,30,0,6,10,16);M.pediment('sfOld',fx+1,40,0,14,17,5,Math.PI/2);for(const s2 of [-1,1])M.pediment('sfOld',fx+2,30,s2*13,9,10,4,Math.PI/2);
      lathe(M,'cypress',[[1.8,0],[2.6,4],[2.2,9],[1.2,13],[0.05,16]],12,fx+1,56,0);
      for(let i=0;i<8;i++){const a=i/8*Math.PI*2;M.box('mosWhite',fx+1+Math.cos(a)*2.4,60+R()*6,Math.sin(a)*2.4,0.5,0.5,0.5);}
      sphere(M,'mosRed',fx+1,72.4,0,0.6,8);
      apostle(fx+2,-22,98.8,true);apostle(fx+2,-7.6,107,true);apostle(fx+2,7.6,107,true);apostle(fx+2,22,98.8,true);}
    // the Passion front (-x): Subirachs's, finished 2018: stark, its portico a slab on six leaning columns like bones,
    // the frieze of eighteen columns over it, and the Resurrected Christ in a bridge between the middle towers
    {const fx=-34;M.box('sfStone',fx,0,0,10,24,46);M.box('glass',fx-5.05,0,0,0.3,18,26);
      M.box('sfPale',fx-9,26,0,10,3.4,40);
      for(let i=0;i<6;i++){const zz=-17.5+i*7,tilt=(i-2.5)*0.07;beam(M,'sfPale',new V3(fx-12+R()*0.6,0,zz+tilt*-26),new V3(fx-9.5,26.2,zz),1.4,1.8);}
      for(let i=0;i<18;i++){const zz=-17+i*2;M.box('sfPale',fx-12.6,29.4,zz,0.8,8+Math.abs(i-8.5)*0.5,0.9);}
      M.put('sfPale',M.cached('pedP',()=>{const s=new THREE.Shape();s.moveTo(-20,0);s.lineTo(20,0);s.lineTo(0,12);s.lineTo(-20,0);return new THREE.ExtrudeGeometry(s,{depth:2,bevelEnabled:false});}),fx-13.4,38,0,Math.PI/2);
      M.box('sfPale',fx-2,58,0,3,3,15.2);M.statue('mosWhite',fx-2,61,0,5.2,-Math.PI/2);
      apostle(fx-2,-22,107,false);apostle(fx-2,-7.6,112,false);apostle(fx-2,7.6,112,false);apostle(fx-2,22,107,false);}
    // the Glory front (+z), the main one, building: the portico's bulk in scaffold and netting, and the cranes
    {const fz=NAVE_Z1;M.box('sfPale',0,0,fz+4,46,34,8);
      for(let i=0;i<7;i++){const xx=-19.5+i*6.5;M.box('sfWhite',xx,0,fz+8.6,2.6,20+(i%3)*3,1.6);}
      for(let xx=-24;xx<=24;xx+=3)M.box('scaffold',xx,0,fz+10.6,0.14,40,0.14);
      for(let xx=-24;xx<=24;xx+=3)M.box('scaffold',xx,0,fz+12.4,0.14,40,0.14);
      for(let yy=2;yy<=40;yy+=2)for(const zz of [fz+10.6,fz+12.4])M.box('scaffold',0,yy,zz,48,0.12,0.12);
      for(let yy=2;yy<=40;yy+=2)M.box('montjuic',0,yy,fz+11.5,48,0.1,1.9);
      M.box('net',-12,10,fz+12.6,20,30,0.08);M.box('net',14,4,fz+12.6,16,32,0.08);}
    const g=M.finish(L,x,g0,z,ry);
    crane(L,x,z,ry,22,NAVE_Z1+2,150,58,0.7);crane(L,x,z,ry,-26,NAVE_Z1-10,128,50,2.3);
    // after dark the Jesus cross and Mary's star burn white, the Evangelists' symbols gold, the stone floodlit warm
    glow({crossGlass:[1.0,1.0,0.98],lampWhite:[1,0.95,0.85],mosGold:[0.5,0.35,0.08],ceramic:[0.42,0.4,0.36],sfPale:[0.3,0.24,0.14],sfStone:[0.28,0.22,0.12],sfOld:[0.24,0.18,0.1],mosWhite:[0.3,0.3,0.28]});
    return g;},

  // ================================================================ Casa Batlló
  // Gaudí's remodelling of 1904-06, Passeig de Gràcia 43: a façade of rippling trencadís in blues, greens and ochres
  // strewn with ceramic discs, the balconies masks of bone-white iron, the noble floor's windows framed in sandstone
  // bones; the roof the back of a dragon, its scales shading from green to blue to rose, its spine of great round
  // tiles, and on its left the tower with the four-armed cross that is St George's lance. Front faces +z.
  batllo(L,x,z){const g0=gh(x,z),M=Model(),ry=turn(L.face||0),R=mkRng(1906),W=L.width||14.6,D=L.depth||22,H=21.5;
    M.box('batWall',0,0,-D/2,W,H,D);
    // the façade's skin: tiles in rippled rows, the discs over them
    const wave=(xx,yy)=>0.25*Math.sin(xx*0.9+yy*0.45)+0.18*Math.sin(yy*1.3-xx*0.4);
    const TILE=['mosBlue','mosTeal','mosGreen','mosBlue','batWall','mosOrange','mosWhite','mosPurple'];
    for(let yy=8;yy<H-0.4;yy+=0.75)for(let xx=-W/2+0.4;xx<W/2-0.3;xx+=0.75)M.box(TILE[(R()*TILE.length)|0],xx,yy,0.12+wave(xx,yy),0.72,0.72,0.16);
    for(let i=0;i<46;i++){const xx=-W/2+0.8+R()*(W-1.6),yy=8.5+R()*(H-9.5);M.put(R()<0.5?'mosYellow':R()<0.5?'mosPink':'mosGreen',M.cached('disc',()=>new THREE.CylinderGeometry(0.42,0.42,0.12,10).rotateX(Math.PI/2)),xx,yy,0.3+wave(xx,yy));}
    // the upper floors: windows in rows narrowing upward, each under its mask balcony
    const BAYS=[[-5.3,1.7],[-2.0,1.7],[2.0,1.7],[5.3,1.7]];
    for(let f=0;f<4;f++){const yy=8.6+f*3.15;for(const [bx,bw] of BAYS){const w=bw*(1-f*0.08);M.box('glass',bx,yy,0.36,w,2.2,0.12);
        M.put('boneWhite',M.cached('mask',()=>new THREE.CylinderGeometry(1,1,1,12,1,true,-Math.PI/2,Math.PI).rotateY(Math.PI/2).scale(1,1,0.5)),bx,yy+0.55,0.6,0,0,0,[w*0.62,1.0,0.9]);
        for(const s of [-1,1])sphere(M,'glass',bx+s*w*0.2,yy+0.9,1.0,0.16,6);}}
    // the noble floor: a great undulating window in a frame of sandstone bones, the columns down to the street
    M.box('sandstone',0,0,0.2,W,8,0.6);M.box('glass',0,1,0.55,W-1.2,6,0.2);
    for(let i=0;i<7;i++){const xx=-W/2+1+i*(W-2)/6;for(let j=0;j<5;j++){M.cyl('sandstone',xx,j*1.5,0.75,0.34+(j%2)*0.14,0.42-(j%2)*0.1,1.5,8);}}
    for(let i=0;i<6;i++){const xx=-W/2+2.1+i*(W-2)/6;M.put('sandstone',M.cached('nobArch',()=>new THREE.TorusGeometry(1.1,0.22,6,10,Math.PI)),xx,6.3,0.8);}
    // the roof: the dragon's back - scales on a hump from the tower to the right-hand edge - and its spine
    const SC=['mosGreen','mosGreen','mosTeal','mosBlue','mosBlue','mosPurple','mosPink','mosPink'];
    for(let xx=-W/2+3.2;xx<W/2;xx+=0.6){const t=(xx+W/2-3.2)/(W-3.2),k=SC[Math.min(SC.length-1,(t*SC.length)|0)];
      for(let a=0.15;a<Math.PI-0.1;a+=0.26){const yy=H+Math.sin(a)*3.4,zz=-2.4-Math.cos(a)*2.6;M.put(R()<0.85?k:SC[(R()*SC.length)|0],M.cached('scale',()=>new THREE.BoxGeometry(0.6,0.7,0.12)),xx,yy,zz,0,a-Math.PI/2);}
      if(Math.round(xx*10/0.6)%2===0)sphere(M,R()<0.5?'mosYellow':'mosOrange',xx,H+3.6,-2.4,0.36,8);}
    M.box('batWall',0.8,H,-D/2-0.6,W-1.6,2.2,D-3);
    // the chimneys behind the ridge, in clusters, each capped in mosaic
    for(const [cx,cz] of [[-3,-9],[1,-9.6],[4.6,-8.4],[-1,-14]])for(let i=0;i<4;i++){const px=cx+(i%2)*0.8,pz=cz+(i>>1)*0.8;M.cyl('sandstone',px,H,pz,0.3,0.34,3.4,8);sphere(M,MOSAIC[(R()*MOSAIC.length)|0],px,H+3.6,pz,0.4,8);}
    // the tower: a turret of tiles with the monograms of the Holy Family, the bulb, and the four-armed cross
    {const tx=-W/2+1.6,tz=-1.6;M.cyl('mosWhite',tx,H,tz,1.3,1.1,6.8,14);for(let i=0;i<3;i++)M.box(['mosGreen','mosBlue','mosGold'][i],tx,H+1.6+i*1.8,tz+1.05,1.1,1.1,0.2);
      lathe(M,'sandstone',[[1.0,0],[1.4,1.0],[1.2,2.0],[0.4,2.8]],12,tx,H+6.8,tz);
      for(const [ax,az] of [[1,0],[-1,0],[0,1],[0,-1]])M.box('mosGold',tx+ax*0.6,H+10.2,tz+az*0.6,ax?1.2:0.5,0.5,az?1.2:0.5);M.box('mosGold',tx,H+9.6,tz,0.5,2.0,0.5);sphere(M,'mosGold',tx,H+11.8,tz,0.45,8);}
    const g=M.finish(L,x,g0,z,ry);glow({sandstone:[0.32,0.26,0.16],mosBlue:[0.06,0.12,0.3],mosTeal:[0.05,0.2,0.2],mosGreen:[0.06,0.18,0.06],boneWhite:[0.5,0.48,0.42]});return g;},

  // ================================================================ Casa Amatller
  // Puig i Cadafalch's, 1898-1900, next door to the Batlló: the "Block of Discord"'s Flemish one, a stepped gable of
  // pink sgraffito and glazed tiles over a Gothic façade. Front faces +z.
  amatller(L,x,z){const g0=gh(x,z),M=Model(),ry=turn(L.face||0),R=mkRng(1900),W=L.width||17,D=L.depth||22,H=19;
    M.box('sandstone',0,0,-D/2,W,H,D);M.box('mosPink',0,9,0.12,W,10,0.2);
    for(let i=0;i<5;i++){const st=i,w=W-st*2.9;M.box(i%2?'mosPink':'sandstone',0,H+st*2.4,-0.2,w,2.4,0.8);
      for(let j=0;j<Math.max(1,(w/1.2)|0);j++)M.box(MOSAIC[(R()*4)|0],-w/2+0.6+j*1.2,H+st*2.4+1.4,0.25,0.5,0.5,0.1);}
    M.box('sandstone',0,H+12,-0.2,2.4,2.4,0.8);M.box('mosGold',0,H+14.4,-0.2,0.4,1.8,0.4);
    for(let f=0;f<3;f++)for(const bx of [-5.4,-1.8,1.8,5.4])M.box('glass',bx,4+f*4.6,0.3,1.4,2.4,0.1);
    M.box('glass',0,0.6,0.3,4.4,3.8,0.1);M.box('iron',0,13.2,0.6,W-3,0.12,0.9);
    return M.finish(L,x,g0,z,ry);},

  // ================================================================ Casa Milà, La Pedrera
  // Gaudí's last house, 1906-12, on the chamfered corner of Passeig de Gràcia and Provença: a cliff of Garraf
  // limestone in waves, no straight line in it, the balconies' tangled wrought iron (Jujol's) hung over the deep
  // windows, and on the roof the stairheads and chimneys like helmeted warriors. Built on its own mapped footprint:
  // each floor's slab edge is a wave along the street front, the floors between them glass behind stone piers.
  pedrera(L,x,z){const fp=footprintAt(x,z,300);const g0=gh(x,z),M=Model(),R=mkRng(1912),H=L.height||28,FL=3.6;
    let ring=fp?fp.ring:null;if(!ring)return null;
    // the outline, densified to a metre and walked anticlockwise, with each point's outward normal and arc length
    if(api.polyArea(ring)<0)ring=ring.slice().reverse();
    const pts=[];for(let i=0;i<ring.length;i++){const [ax,az]=ring[i],[bx,bz]=ring[(i+1)%ring.length],l=Math.hypot(bx-ax,bz-az),n=Math.max(1,Math.ceil(l));
      for(let j=0;j<n;j++)pts.push([ax+(bx-ax)*j/n,az+(bz-az)*j/n]);}
    const N=pts.length,nor=[],sAt=[];let s=0;for(let i=0;i<N;i++){const p=pts[(i+N-1)%N],q=pts[(i+1)%N],tx=q[0]-p[0],tz=q[1]-p[1],tl=Math.hypot(tx,tz)||1;
      const sg=api.polyArea(ring)>0?1:-1;nor.push([tz/tl*sg,-tx/tl*sg]);sAt.push(s);s+=Math.hypot(q[0]-pts[i][0],q[1]-pts[i][1])/2;}
    // which way is out: test the first normal against the ring
    {const [px,pz]=pts[0],[nx,nz]=nor[0];if(api.inPoly(px+nx*0.8,pz+nz*0.8,ring))for(const n of nor){n[0]=-n[0];n[1]=-n[1];}}
    // only the street fronts wave (where a neighbour stands against the wall, the wall stays flat): a point fronts the
    // street when there is no other building a few metres out from it
    const front=pts.map(([px,pz],i)=>{const [nx,nz]=nor[i],ox=px+nx*4,oz=pz+nz*4;return !api.buildingsAt(ox,oz,0).some(b=>api.inPoly(ox,oz,b.ring));});
    const sm=front.map((f,i)=>{let a=0;for(let k=-3;k<=3;k++)a+=front[(i+k+N)%N]?1:0;return a/7;});
    const wav=(i,y)=>sm[i]*(0.55+0.45*Math.sin(sAt[i]/5.3+y/4.1)+0.35*Math.sin(sAt[i]/2.3-y/2.7));
    // a strip of quads round the ring from y0 to y1 at an offset from the outline
    const strip=(k,y0,y1,off,ny=6)=>{const p=[],idx=[];for(let j=0;j<=ny;j++){const y=y0+(y1-y0)*j/ny;for(let i=0;i<=N;i++){const ii=i%N,o=off(ii,y);p.push(pts[ii][0]-x+nor[ii][0]*o,y,pts[ii][1]-z+nor[ii][1]*o);}}
      for(let j=0;j<ny;j++)for(let i=0;i<N;i++){const a=j*(N+1)+i,b=a+N+1;idx.push(a,b,a+1,a+1,b,b+1);}
      const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setIndex(idx);g.computeVertexNormals();M.put(k,g,0,0,0);};
    // the core behind the glass, a little inside the outline
    strip('glass',0,H,()=>-0.6,1);
    // the slabs' edges: the stone bands that wave, one to each floor, and their undersides and tops
    for(let f=0;f<=7;f++){const y0=f===0?0:f*FL-0.4,y1=f===0?1.0:f*FL+(f===7?1.6:0.9);if(y0>H+2)break;
      strip('montjuic',y0,y1,(i,y)=>wav(i,y)+0.35,3);
      const cap=(y,inn)=>{const p=[],idx=[];for(let i=0;i<=N;i++){const ii=i%N,o=wav(ii,y)+0.35;p.push(pts[ii][0]-x+nor[ii][0]*o,y,pts[ii][1]-z+nor[ii][1]*o,pts[ii][0]-x-nor[ii][0]*0.6,y,pts[ii][1]-z-nor[ii][1]*0.6);}
        for(let i=0;i<N;i++){const a=i*2;idx.push(a,a+1,a+2,a+1,a+3,a+2);}const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setIndex(idx);g.computeVertexNormals();M.put('montjuic',g,0,0,0);};
      cap(y0,false);cap(y1,true);
      // the wrought iron over the windows of this floor, hanging in tangles from the band
      if(f>=1&&f<=5)for(let i=0;i<N;i+=4){if(sm[i]<0.6||R()<0.3)continue;const o=wav(i,y1)+0.5,px=pts[i][0]-x+nor[i][0]*o,pz=pts[i][1]-z+nor[i][1]*o,ang=Math.atan2(nor[i][0],nor[i][1]);
        for(let k=0;k<3;k++)M.put('iron',M.cached('tangle',()=>new THREE.TorusGeometry(0.4,0.06,3,6)),px+(R()-0.5)*1.6*Math.cos(ang),y1+0.3+R()*0.7,pz-(R()-0.5)*1.6*Math.sin(ang),ang+R(),R()*3,R()*3);}}
    // the piers between the windows, following the waves
    for(let i=0;i<N;i+=3){if(sm[i]<0.5)continue;const o=wav(i,H/2)*0.8+0.1;M.put('montjuic',M.cached('pier',()=>new THREE.BoxGeometry(0.9,1,1.0).translate(0,0.5,0)),pts[i][0]-x+nor[i][0]*o,0,pts[i][1]-z+nor[i][1]*o,Math.atan2(nor[i][0],nor[i][1]),0,0,[1,H,1]);}
    // the attic: a white wave of Catalan arches, and on the roof terrace the warriors - stairheads in trencadís, the
    // chimneys' helmeted heads in stone - placed over the footprint's interior
    strip('sfWhite',H,H+2.4,(i,y)=>wav(i,y)*0.6-0.4,3);
    const inside=[];for(let t=0;t<4000&&inside.length<30;t++){const i=(R()*N)|0,d=2+R()*9,px=pts[i][0]-nor[i][0]*d,pz=pts[i][1]-nor[i][1]*d;if(api.inPoly(px,pz,ring)&&!inside.some(q=>Math.hypot(q[0]-px,q[1]-pz)<4))inside.push([px,pz]);}
    inside.forEach(([px,pz],i)=>{const lx=px-x,lz=pz-z,big=i%5===0;
      if(big){lathe(M,'mosWhite',[[1.8,0],[2.0,2],[1.4,4],[1.7,5.2],[0.9,6.6],[0.1,7.4]],12,lx,H+2.4,lz);M.box('mosGreen',lx,H+5.6,lz,0.9,0.7,2.2);}
      else{lathe(M,'sandstone',[[0.8,0],[0.6,1.8],[1.0,2.6],[0.9,3.4],[0.6,3.9],[0.15,4.4]],10,lx,H+2.4,lz);M.box('glass',lx,H+5.0,lz,0.9,0.25,1.1);}});
    const g=M.finish(L,x,g0,z,0);glow({montjuic:[0.3,0.25,0.17],glass:[0.18,0.13,0.06]});return g;},

  // ================================================================ Park Güell: the terrace, the hall, the steps, the lodges
  // Gaudí's garden city of 1900-14 on the Muntanya Pelada, which became a park: in from Carrer d'Olot between the two
  // gatehouses with their gingerbread roofs of trencadís (the porter's lodge with its tower and four-armed cross), up
  // the double stair past the mosaic salamander to the Hypostyle Room's eighty-six Doric columns, and over them the
  // Nature Square, its edge the serpentine bench, a hundred metres of broken tile. The frame faces the gate (+z).
  parkguell(L,x,z){const M=Model(),R=mkRng(1914);
    const [gx,gz]=P(L.gate),[ox,oz]=[gx-x,gz-z],gd=Math.hypot(ox,oz)||1,ry=L.face!=null?turn(L.face):Math.atan2(ox,oz),cs=Math.cos(ry),sn=Math.sin(ry);
    // world to the model's frame (+z toward the gate), and back
    const loc=ll=>{const [wx,wz]=P(ll),dx=wx-x,dz=wz-z;return [dx*cs-dz*sn,dx*sn+dz*cs];};
    const yAt=(lx,lz)=>{const [wx,wz]=toWorld(x,z,ry,lx,lz);return gh(wx,wz);};
    // the Nature Square: its mapped outline raised as a terrace, sand on top, its rubble walls down to the ground
    const sq=(L.square||[]).map(loc);let front=26;for(const [lx,lz] of sq)if(Math.abs(lx)<16)front=Math.max(front,lz);
    const top=Math.max(gh(x,z)+1.5,yAt(0,front+8)+8),y0=top;
    if(sq.length>2){const shape=new THREE.Shape();sq.forEach(([lx,lz],k)=>k?shape.lineTo(lx,lz):shape.moveTo(lx,lz));
      let lo=0;for(const [lx,lz] of sq)lo=Math.min(lo,yAt(lx,lz)-y0);const d=-lo+2;
      M.put('rubble',new THREE.ExtrudeGeometry(shape,{depth:d,bevelEnabled:false}).rotateX(Math.PI/2).translate(0,-0.5,0),0,0,0);
      M.put('sandstone',new THREE.ExtrudeGeometry(shape,{depth:0.5,bevelEnabled:false}).rotateX(Math.PI/2),0,0,0);}
    // the Hypostyle Room under the front of the square: its Doric columns, the outer ones leaning, the ceiling's discs
    const hall0=Math.min(-6,yAt(0,front+6)-y0),hz0=front-17;M.box('sfWhite',0,-1.6,front-8.5,30,1.1,18);
    for(let i=0;i<7;i++)for(let j=0;j<5;j++){const cx=-13.5+i*4.5,cz=hz0+1.5+j*3.6;M.cyl('sfWhite',cx,hall0,cz,0.75,0.7,-hall0-1.6,12);M.cyl('sfWhite',cx,-2.6,cz,0.95,1.25,1.0,12);}
    for(let i=0;i<8;i++)M.put(MOSAIC[(R()*MOSAIC.length)|0],M.cached('pgDisc',()=>new THREE.CylinderGeometry(1.0,1.0,0.12,12)),-11+(i%4)*7.3,-1.7,hz0+4+((i/4)|0)*8);
    for(let i=0;i<7;i++){const cx=-13.5+i*4.5;M.cyl('sfWhite',cx,hall0,front+0.2,0.85,0.75,-hall0-1.6,12);}
    M.box('sfWhite',0,-2.5,front+0.4,31,1.0,0.8);for(let i=0;i<30;i++)M.box('sfWhite',-14.5+i,-1.5,front+0.4,0.24,0.7,0.24);
    // the serpentine bench on its mapped line, each tile its own colour, the seat in white
    {const b=(L.bench||[]).map(loc);for(let k=0;k+1<b.length;k++){const [ax,az]=b[k],[bx,bz]=b[k+1],l=Math.hypot(bx-ax,bz-az);if(l<0.05)continue;const a=Math.atan2(bx-ax,bz-az),n=Math.max(1,Math.round(l/0.5));
        for(let t=0;t<n;t++){const u=(t+0.5)/n,px=ax+(bx-ax)*u,pz=az+(bz-az)*u;for(let r=0;r<3;r++)M.put(MOSAIC[(R()*MOSAIC.length)|0],M.cached('bench',()=>new THREE.BoxGeometry(0.42,0.3,0.5)),px,0.08+r*0.29,pz,a,0,0,[1,1,l/n/0.5+0.04]);}
        M.put('mosWhite',M.cached('seat',()=>new THREE.BoxGeometry(0.7,0.12,1)),(ax+bx)/2,0.42,(az+bz)/2,a,0,0,[1,1,l+0.02]);}}
    // the double stair from the gate up to the hall, the salamander on its middle landing, the grotto basins
    {const z1=Math.max(front+6,gd-9),sy=yAt(0,z1)-y0,n=Math.max(12,Math.round((z1-front-1)/0.8)),lz=(z1+front+1)/2;
      for(let i=0;i<n;i++){const t=i/n,zz=z1-t*(z1-front-1),yy=sy+(hall0-sy)*t;for(const sd of [-1,1])M.box('rubble',sd*4.6,yy-0.6,zz,5.4,0.6+Math.abs(hall0-sy)/n,(z1-front-1)/n+0.05);}
      M.box('rubble',0,Math.min(sy,hall0)-1,lz,3.6,Math.abs(hall0-sy)/2+1,z1-front-1);
      const ly=sy+(hall0-sy)*0.5,sal=[[0,0.6,0,1.1],[0,0.9,-1.3,0.95],[0,1.1,-2.5,0.8],[0,0.8,1.3,0.9],[0,0.5,2.5,0.6],[0.4,0.4,3.5,0.4]];
      for(const [sx,sy2,sz,r] of sal){sphere(M,'mosGreen',sx,ly+sy2,lz+sz,r,10);for(let k=0;k<6;k++)sphere(M,MOSAIC[(R()*5)|0],sx+(R()-0.5)*r*1.6,ly+sy2+(R()-0.2)*r,lz+sz+(R()-0.5)*r*1.4,r*0.32,6);}}
    // the gatehouses, on their mapped sites: rubble walls, roofs of trencadís in waves; the porter's lodge with its
    // checkered tower and four-armed cross, the other with the red-and-white toadstool on its chimney
    for(const [la,lo,kind] of L.lodges||[]){const [lx,lz]=loc([la,lo]),yb=yAt(lx,lz)-y0;M.box('rubble',lx,yb,lz,10,7,8);
      for(let i=0;i<80;i++){const a=R()*Math.PI*2,rr=R(),px=lx+Math.cos(a)*rr*5,pz=lz+Math.sin(a)*rr*4,hh=yb+7.2+(1-rr*rr)*4;M.box(R()<0.55?'mosWhite':R()<0.5?'rubble':'mosBlue',px,hh,pz,1.1,0.4,1.1,R()*3);}
      lathe(M,'mosWhite',[[5.2,0],[4.8,1.5],[3.2,3.4],[1.1,4.6],[0.05,5.0]],14,lx,yb+7,lz,1,0.8);
      if(kind==='tower'){const tx=lx+3.4,tz=lz+2.4;lathe(M,'mosBlue',[[1.7,0],[1.25,6],[1.05,10],[1.35,13],[0.6,15],[0.2,16]],14,tx,yb,tz);
        for(let i=0;i<48;i++){const a=R()*Math.PI*2,hh=2+R()*13;M.box('mosWhite',tx+Math.cos(a)*1.34,yb+hh,tz+Math.sin(a)*1.34,0.5,0.5,0.1,-a+Math.PI/2);}
        for(const [ax,az] of [[1,0],[-1,0],[0,1],[0,-1]])M.box('mosWhite',tx+ax*0.7,yb+16.6,tz+az*0.7,ax?1.4:0.4,0.4,az?1.4:0.4);M.box('mosWhite',tx,yb+15.8,tz,0.4,2.2,0.4);}
      else{M.cyl('mosWhite',lx,yb+11,lz,0.5,0.5,2.5,10);lathe(M,'mosRed',[[0.4,0],[1.6,0.6],[1.8,1.2],[1.0,1.9],[0.05,2.2]],12,lx,yb+13.5,lz);
        for(let i=0;i<8;i++){const a=i/8*Math.PI*2;sphere(M,'mosWhite',lx+Math.cos(a)*1.3,yb+14.5,lz+Math.sin(a)*1.3,0.22,6);}}}
    // the wall along Carrer d'Olot with its medallions
    {const lz=gd+1,yb=yAt(0,lz)-y0;for(const sd of [-1,1])M.box('rubble',sd*34,yb,lz,40,3.2,1.0);for(let i=0;i<6;i++){const sd=i<3?-1:1,px=sd*(20+(i%3)*11);M.put('mosWhite',M.cached('medal',()=>new THREE.CylinderGeometry(1.1,1.1,0.3,12).rotateX(Math.PI/2)),px,yb+3.0,lz+0.5);}}
    return M.finish(L,x,y0,z,ry);},

  // ================================================================ Palau de la Música Catalana
  // Domènech i Montaner's concert hall for the Orfeó Català, 1905-08: red brick in tiers, the columns of the loggia
  // clad in mosaic flowers, the busts of Palestrina, Bach, Beethoven and Wagner over the front, and on the corner the
  // great carved group of Catalan song, Miquel Blay's. Front (Carrer de Sant Pere més Alt) faces +z.
  palaumusica(L,x,z){const g0=gh(x,z),M=Model(),ry=turn(L.face||0),R=mkRng(1908),W=L.width||36,D=L.depth||30,H=25;
    M.box('brickBcn',0,0,-D/2,W,H,D);M.box('sandstone',0,0,0.3,W,4,0.8);
    // the loggia on the first floor: paired columns in mosaic, the arches between them
    for(let i=0;i<12;i++){const xx=-W/2+2+i*(W-4)/11;M.cyl('mosGreen',xx,4.5,1.2,0.42,0.42,6.4,10);
      for(let j=0;j<10;j++)sphere(M,['mosRed','mosYellow','mosPink','mosGreen','mosWhite'][(R()*5)|0],xx+Math.cos(j)*0.4,4.9+j*0.6,1.2+Math.sin(j)*0.4,0.18,5);}
    M.box('glass',0,4.5,0.2,W-2,6.6,0.3);M.box('sandstone',0,11,1.2,W,1.2,2.2);
    for(let i=0;i<11;i++){const xx=-W/2+3.6+i*(W-4)/11;M.put('mosWhite',M.cached('pmArch',()=>new THREE.TorusGeometry(1.2,0.2,6,10,Math.PI)),xx,9.8,1.25);}
    // the upper tiers, the mosaic band, the busts
    M.box('brickDark',0,12.2,-0.2,W,7,0.8);for(let i=0;i<W/1.2;i++)M.box(MOSAIC[(R()*MOSAIC.length)|0],-W/2+0.6+i*1.2,19.4,0.28,1.0,1.4,0.16);
    for(let i=0;i<4;i++){const xx=-W/2+5+i*(W-10)/3;M.box('sandstone',xx,12.4,0.6,1.6,2.8,1.4);sphere(M,'boneWhite',xx,16.0,0.9,0.9,8);}
    // the corner group: the figure of song, St George over her, the singers round
    {const cx=W/2-0.8;M.box('sandstone',cx,4,1.2,3.2,11,3.2);for(let i=0;i<7;i++)M.statue('boneWhite',cx+(R()-0.5)*2.2,8+R()*5,1.6+R(),1.8+R()*0.6,R()*6);
      M.cyl('mosGold',cx,15.2,1.2,1.4,1.0,2.2,12);sphere(M,'mosGold',cx,18.4,1.2,1.2,12);}
    // the roof: the skylight's glass dome seen from outside as a lantern, and the tiled pitches
    ridge(M,'tileRoof',0,H,-D/2,W,4.6,D-2,true);M.cyl('greenGlass',4,H+2,-D/2,4,3.4,2.4,16);
    const g=M.finish(L,x,g0,z,ry);glow({glass:[0.6,0.42,0.18],greenGlass:[0.3,0.4,0.25],sandstone:[0.25,0.2,0.12]});return g;},

  // ================================================================ Torre Glòries (Torre Agbar)
  // Jean Nouvel's, 2005: a bullet of 144 m in 38 floors, two concrete shells, the inner clad in aluminium panels in
  // twenty-five colours - the reds and oranges of the earth at the foot, the blues of sky and sea at the top - and over
  // it all a skin of glass louvres; 4,500 windows in it, scattered. After dark, 4,500 LEDs paint it.
  glories(L,x,z){const g0=gh(x,z),M=Model(),R=mkRng(2005),H=144,R0=L.r||19.5,sq=L.squash||0.86,ry=turn(L.face||0);
    const rAt=h=>h<96?R0*(1+0.012*Math.sin(h/20)):R0*Math.sqrt(Math.max(0,1-Math.pow((h-96)/(H-96),2)));
    const BANDS=['agRed','agRed','agOrange','agOrange','agOchre','agOchre','agTeal','agTeal','agBlue','agBlue','agSky','agPale'];
    const nb=BANDS.length;for(let b=0;b<nb;b++){const h0=b*H/nb,h1=(b+1)*H/nb,prof=[];for(let j=0;j<=6;j++){const h=h0+(h1-h0)*j/6;prof.push([rAt(h),h]);}
      lathe(M,BANDS[b],prof,40,0,0,0,1,sq);}
    // the windows, scattered: dark panes in the coloured shell
    for(let i=0;i<1400;i++){const h=2+R()*(H-14),a=R()*Math.PI*2,r=rAt(h)+0.05;if(r<3)continue;
      M.put('glass',M.cached('agwin',()=>new THREE.BoxGeometry(0.9,1.2,0.2)),Math.cos(a)*r,h,Math.sin(a)*r*sq,Math.atan2(Math.cos(a),Math.sin(a)*sq));}
    // the louvres' skin
    {const prof=[];for(let h=0;h<=H;h+=4)prof.push([rAt(h)+0.7,h]);prof.push([0.01,H+0.6]);lathe(M,'agGlass',prof,40,0,0,0,1,sq*((R0+0.7*sq)/(R0+0.7)));}
    const g=M.finish(L,x,g0,z,ry);
    // the LEDs: after dark the colours run up the tower and change
    const bm=BANDS.map(k=>mat(k));animHooks.push(now=>{const n=nightF(hour());const t=now/1000;for(let b=0;b<bm.length;b++){const m=bm[b];if(!m.emissive)continue;
      const hue=((t*0.02+b*0.045)%1),c=new THREE.Color().setHSL(hue,0.85,0.5);m.emissive.setRGB(c.r*n*0.85,c.g*n*0.85,c.b*n*0.85);}});
    return g;},

  // ================================================================ the Arc de Triomf
  // Josep Vilaseca's gateway to the Universal Exhibition of 1888: red brick in the Neo-Mudéjar manner, 30 m high, its
  // single arch across the promenade of Lluís Companys, a frieze of stone round it (Barcelona welcoming the nations),
  // the corner piers rising into turrets. The opening runs along the promenade: "face" is its bearing.
  arctriomf(L,x,z){const g0=gh(x,z),M=Model(),ry=turn(L.face||135),W=L.w||24,D=L.d||12,H=29.5,R=mkRng(1888);
    // the two piers and the arch over them, in brick, with its stone springing courses
    for(const s of [-1,1]){M.box('brickBcn',s*(W/2-3.4),0,0,6.8,H-4.5,D);for(let i=0;i<6;i++)M.box('brickDark',s*(W/2-3.4),2+i*3.6,D/2+0.05,6.2,0.4,0.2);
      for(let i=0;i<6;i++)M.box('brickDark',s*(W/2-3.4),2+i*3.6,-D/2-0.05,6.2,0.4,0.2);}
    const span=W-13.6;M.box('brickBcn',0,H-11,0,span+0.2,6.5,D);M.put('brickBcn',M.cached('archT',()=>new THREE.CylinderGeometry(span/2,span/2,D,20,1,true,Math.PI/2,Math.PI).rotateX(Math.PI/2)),0,H-11,0,0,0,0,[1,0.8,1]);
    M.box('sandstone',0,H-11.2,0,W,0.6,D+0.4);
    // the frieze round the top, and the attic over it
    M.box('sandstone',0,H-7.8,0,W+0.4,3.2,D+0.4);for(let i=0;i<20;i++)M.statue('boneWhite',-W/2+1+i*(W-2)/19,H-7.4,D/2+0.3,2.4,0);
    M.box('brickBcn',0,H-4.6,0,W,3.2,D);M.box('sandstone',0,H-1.4,0,W+0.6,0.6,D+0.6);
    // the corner turrets and their domes, the bats' crowns, the gilded globes
    for(const sx of [-1,1])for(const sz of [-1,1]){const cx=sx*(W/2-1.2),cz=sz*(D/2-1.2);M.cyl('brickBcn',cx,0,cz,1.4,1.4,H,10);M.cyl('sandstone',cx,H,cz,1.6,1.6,0.6,10);
      lathe(M,'tileRoof',[[1.5,0],[1.3,1.4],[0.7,2.6],[0.05,3.4]],10,cx,H+0.6,cz);sphere(M,'mosGold',cx,H+4.2,cz,0.45,8);}
    M.box('brickBcn',0,H-1.0,0,8,3.4,D*0.6);lathe(M,'sandstone',[[2.2,0],[1.8,2],[0.4,3.4]],12,0,H+2.4,0);sphere(M,'mosGold',0,H+6.2,0,0.6,10);
    const g=M.finish(L,x,g0,z,ry);glow({brickBcn:[0.32,0.18,0.1],sandstone:[0.34,0.28,0.18]});return g;},

  // ================================================================ the Columbus monument
  // Gaietà Buïgas's, for the Exhibition of 1888, at the foot of La Rambla: 60 m, a stepped base with eight bronze
  // lions, an octagonal pedestal with its reliefs and statues, a Corinthian iron column, a globe, and Columbus on it
  // pointing out to sea. "face" is where he points.
  colom(L,x,z){const g0=gh(x,z),M=Model(),ry=turn(L.face||135);
    M.cyl('montjuic',0,0,0,11.5,11.5,1.2,8);M.cyl('montjuic',0,1.2,0,9.2,9.2,1.2,8);
    for(let i=0;i<8;i++){const a=i/8*Math.PI*2+Math.PI/8,px=Math.cos(a)*9.6,pz=Math.sin(a)*9.6;M.box('montjuic',px,1.2,pz,2.6,2.4,4.2,-a);
      M.box('lion',px,3.6,pz,1.4,1.6,3.0,-a);sphere(M,'lion',px+Math.cos(a)*1.3,5.3,pz+Math.sin(a)*1.3,0.85,8);}
    M.cyl('montjuic',0,2.4,0,6.2,6.6,8,8);for(let i=0;i<8;i++){const a=i/8*Math.PI*2;M.statue('bronzeDark',Math.cos(a)*6.4,5.0,Math.sin(a)*6.4,3.2,-a+Math.PI/2);}
    M.cyl('montjuic',0,10.4,0,4.6,5.2,6.4,8);M.cyl('montjuic',0,16.8,0,5.0,5.0,1.0,8);for(let i=0;i<4;i++){const a=i/4*Math.PI*2+Math.PI/4;M.statue('bronzeDark',Math.cos(a)*4.4,17.8,Math.sin(a)*4.4,3.2,-a+Math.PI/2);}
    M.cyl('montjuic',0,17.8,0,3.0,3.0,3.4,8);
    M.column('bronzeDark',0,21.2,0,30,1.55,'corinthian','mosGold');
    M.cyl('bronzeDark',0,51.4,0,2.2,1.4,1.5,12);sphere(M,'mosGold',0,54.6,0,2.0,14);
    // Columbus: robed, the left hand on his hip, the right arm out pointing to sea (+z)
    {const y=56.4,h=7.2;M.cyl('bronzeDark',0,y,0,h*0.16,h*0.12,h*0.42,10);M.cyl('bronzeDark',0,y+h*0.42,0,h*0.12,h*0.15,h*0.3,10);
      sphere(M,'bronzeDark',0,y+h*0.83,0,h*0.08,8);M.box('bronzeDark',0,y+h*0.73,0,h*0.34,h*0.07,h*0.16);
      beam(M,'bronzeDark',new V3(-h*0.17,y+h*0.74,0),new V3(-h*0.34,y+h*0.5,h*0.02),h*0.07);beam(M,'bronzeDark',new V3(h*0.17,y+h*0.75,0),new V3(h*0.22,y+h*0.78,h*0.42),h*0.07);}
    const g=M.finish(L,x,g0,z,ry);glow({mosGold:[0.6,0.45,0.12],montjuic:[0.3,0.25,0.18]});return g;},

  // ================================================================ the Hotel W, "la Vela"
  // Ricardo Bofill's sail on the new breakwater at the end of Barceloneta, 2009: 99 m of mirror glass, its plan a
  // lens and its height bellying like a sail in the wind, the low podium behind it. "face" is where its curve faces.
  hotelw(L,x,z){const g0=gh(x,z),M=Model(),ry=turn(L.face||180),H=99,LEN=L.length||92,WD=L.width||19;
    const p=[],idx=[],NY=24,NA=48;
    // each level a lens: the front arc bellies further out than the back, and the whole narrows and leans as it rises
    for(let j=0;j<=NY;j++){const t=j/NY,y=t*H,half=LEN/2*(1-0.62*Math.pow(t,1.6)),w=WD*(1-0.6*t),lean=-8*t*t;
      for(let i=0;i<=NA;i++){const u=i/NA*Math.PI*2,c=Math.cos(u),s=Math.sin(u);p.push(c*half,y,lean+(s>0?s*w*0.75:s*w*0.25));}}
    for(let j=0;j<NY;j++)for(let i=0;i<NA;i++){const a=j*(NA+1)+i,b=a+NA+1;idx.push(a,b,a+1,a+1,b,b+1);}
    const sg=new THREE.BufferGeometry();sg.setAttribute('position',new THREE.Float32BufferAttribute(p,3));sg.setIndex(idx);sg.computeVertexNormals();M.put('wGlass',sg,0,0,0);
    // the top, closed; the floor lines across the glass; the podium
    {const tp=[],ti=[],t=1,half=LEN/2*(1-0.62),w=WD*(1-0.6),lean=-8;tp.push(0,H,lean);for(let i=0;i<=NA;i++){const u=i/NA*Math.PI*2,c=Math.cos(u),s=Math.sin(u);tp.push(c*half,H,lean+(s>0?s*w*0.75:s*w*0.25));}
      for(let i=1;i<=NA;i++)ti.push(0,i,i+1);const tg=new THREE.BufferGeometry();tg.setAttribute('position',new THREE.Float32BufferAttribute(tp,3));tg.setIndex(ti);tg.computeVertexNormals();M.put('wFrame',tg,0,0,0);}
    for(let j=1;j<NY;j+=1){const t=j/NY,y=t*H,half=LEN/2*(1-0.62*Math.pow(t,1.6)),w=WD*(1-0.6*t),lean=-8*t*t;M.put('wFrame',M.cached('wline'+j,()=>{const c=new THREE.EllipseCurve(0,0,half*1.003,w*0.75*1.01,0,Math.PI,false,0);const pts=c.getPoints(30).map(q=>new V3(q.x,0,q.y));return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),30,0.12,3,false);}),0,y,lean);}
    M.box('wFrame',0,0,-WD*0.25-14,LEN*0.9,9,26);M.box('glass',0,1,-WD*0.25-0.6,LEN*0.8,5,0.4);
    const g=M.finish(L,x,g0,z,ry);glow({wFrame:[0.25,0.28,0.34]});
    // the windows lit after dark: a warm glow through the mirror glass
    animHooks.push(()=>{const n=nightF(hour()),m=mat('wGlass');m.emissive.setRGB(0.1+n*0.22,0.14+n*0.12,0.19-n*0.05);});
    return g;},

  // ================================================================ the Cathedral of the Holy Cross and St Eulalia
  // Catalan Gothic of 1298-1448, with the neo-Gothic front and its spire of 70 m finished only in 1913 (to a design of
  // 1408): the front a cliff of pinnacles and crockets over the steps of the Pla de la Seu, the octagonal bell towers
  // over the transept, the cloister with its geese. Placed on its mapped footprint and turned to its long axis; "face"
  // is the bearing of the front.
  cathedral(L,x,z){const g0=gh(x,z),M=Model(),ry=turn(L.face||315),R=mkRng(1913),LEN=L.length||90,WD=L.width||40,H=28;
    M.box('gothic',0,0,-LEN/2,WD-14,H,LEN);for(const s of [-1,1])M.box('gothic',s*(WD/2-4),0,-LEN/2,8,18,LEN-10);
    ridge(M,'gothicDark',0,H,-LEN/2,WD-14,6,LEN-4);
    for(let zz=-8;zz>-LEN+8;zz-=8)for(const s of [-1,1]){M.box('gothic',s*(WD/2-0.6),0,zz,1.6,22,2.2);lathe(M,'gothic',[[0.8,0],[0.6,3],[0.05,6]],6,s*(WD/2-0.6),22,zz);
      beam(M,'gothic',new V3(s*(WD/2-0.6),20,zz),new V3(s*(WD/2-7.2),H-3,zz),1.0);M.box('glass',s*(WD/2-7.1),H-14,zz-4,0.3,9,2.2);}
    // the apse's polygon, its buttresses
    M.cyl('gothic',0,0,-LEN+4,WD/2-6,WD/2-6,H-2,10);lathe(M,'gothicDark',[[WD/2-6,0],[WD/2-9,4],[0.05,8]],10,0,H-2,-LEN+4);
    // the two octagonal bell towers over the transept
    for(const s of [-1,1]){M.cyl('gothic',s*(WD/2-2),0,-LEN*0.42,4.4,4.2,50,8);for(let i=0;i<8;i++){const a=i/8*Math.PI*2;M.box('glass',s*(WD/2-2)+Math.cos(a)*4.25,40,-LEN*0.42+Math.sin(a)*4.25,1.2,6,0.3,-a+Math.PI/2);}
      M.cyl('gothicDark',s*(WD/2-2),50,-LEN*0.42,4.6,4.6,1,8);}
    // the front: the portal, the rose, the pinnacles, the spires either side and the great one over the crossing
    M.box('gothic',0,0,0.5,WD-8,H+4,3);M.box('glass',0,1,2.05,6,11,0.2);lathe(M,'gothic',[[4.2,0],[3.4,4],[0.05,9]],4,0,12,2.1,1,0.2);
    M.put('glass',M.cached('rose',()=>new THREE.CylinderGeometry(3.4,3.4,0.3,20).rotateX(Math.PI/2)),0,21,2.1);
    for(let i=0;i<13;i++){const xx=-WD/2+5+i*(WD-10)/12;lathe(M,'gothic',[[0.7,0],[0.5,4],[0.05,8+R()*4]],6,xx,H+4,1);}
    const spire=(sx,sz,y,h,r)=>{M.cyl('gothic',sx,0,sz,r,r,y,8);lathe(M,'gothic',[[r,0],[r*0.85,h*0.2],[r*0.2,h*0.95],[0.05,h]],8,sx,y,sz);
      for(let i=0;i<10;i++){const t=0.15+i*0.08,a=i*1.3;M.box('gothic',sx+Math.cos(a)*r*(1-t)*0.95,y+h*t,sz+Math.sin(a)*r*(1-t)*0.95,0.6,0.9,0.6);}
      for(let i=0;i<4;i++){const a=i/4*Math.PI*2+Math.PI/4;lathe(M,'gothic',[[0.6,0],[0.05,5]],6,sx+Math.cos(a)*r*1.05,y,sz+Math.sin(a)*r*1.05);}};
    spire(-WD/2+5,-1,36,17,2.8);spire(WD/2-5,-1,36,17,2.8);spire(0,-LEN*0.42-5,36,34,4.6);
    const g=M.finish(L,x,g0,z,ry);glow({gothic:[0.34,0.28,0.18],glass:[0.2,0.14,0.06]});return g;},

  // ================================================================ Santa Maria del Mar
  // The church of the Ribera's sailors and porters, 1329-83, built in fifty-four years and all of a piece: Catalan
  // Gothic at its plainest, a wide hall of a nave on octagonal piers, the walls sheer, the roof flat terraces, the two
  // octagonal towers either side of the front and the rose window between them. "face" is the front's bearing.
  smdelmar(L,x,z){const g0=gh(x,z),M=Model(),ry=turn(L.face||240),LEN=L.length||78,WD=L.width||33,H=33;
    M.box('gothic',0,0,-LEN/2,WD,H-6,LEN);M.box('gothic',0,H-6,-LEN/2,WD-12,6,LEN);M.box('gothicDark',0,H,-LEN/2,WD-11,0.6,LEN);
    for(let zz=-6;zz>-LEN+6;zz-=8.6)for(const s of [-1,1]){M.box('gothic',s*(WD/2+0.6),0,zz,1.4,H-8,2.4);M.box('glass',s*(WD/2-5.5),H-17,zz-4.3,0.3,10,2.0);}
    M.cyl('gothic',0,0,-LEN+3,WD/2,WD/2,H-6,10);
    for(const s of [-1,1]){M.cyl('gothic',s*(WD/2-3.2),0,-1.6,3.6,3.4,40,8);M.cyl('gothicDark',s*(WD/2-3.2),40,-1.6,3.8,3.8,0.8,8);
      for(let i=0;i<8;i++){const a=i/8*Math.PI*2;M.box('glass',s*(WD/2-3.2)+Math.cos(a)*3.45,31,-1.6+Math.sin(a)*3.45,1.0,5,0.3,-a+Math.PI/2);}}
    M.put('glass',M.cached('rose2',()=>new THREE.CylinderGeometry(5.2,5.2,0.3,24).rotateX(Math.PI/2)),0,21,0.2);M.put('gothic',M.cached('roseR',()=>new THREE.TorusGeometry(5.4,0.5,6,24)),0,21,0.25);
    M.box('glass',0,0.6,0.15,4.4,8.6,0.2);lathe(M,'gothic',[[3.4,0],[2.6,3],[0.05,6]],4,0,9,0.2,1,0.2);
    for(const s of [-1,1])M.box('gothic',s*6,0,0.4,1.6,14,0.8);
    const g=M.finish(L,x,g0,z,ry);glow({gothic:[0.32,0.26,0.16],glass:[0.2,0.14,0.06]});return g;},

  // ================================================================ the Boqueria
  // The Mercat de Sant Josep on La Rambla: its iron arch of 1914 over the entrance, the coloured glass of the
  // market's name and arms in it, and behind it the hall's iron roof of 1914 over the stalls. Front faces +z.
  boqueria(L,x,z){const g0=gh(x,z),M=Model(),ry=turn(L.face||45),R=mkRng(1914),W=L.width||26;
    for(const s of [-1,1]){M.box('ironGreen',s*(W/2-0.6),0,0,1.0,12,1.0);M.box('ironGreen',s*(W/2-3),0,0,0.6,9,0.6);}
    M.put('ironGreen',M.cached('bqArch',()=>new THREE.TorusGeometry(W/2-0.6,0.5,6,24,Math.PI)),0,9,0,0,0,0,[1,0.42,1]);
    M.box('ironGreen',0,9,0,W-1,0.6,0.8);
    for(let i=0;i<22;i++){const t=i/21,a=Math.PI*t,xx=Math.cos(a)*(W/2-3),yy=9.6+Math.sin(a)*(W/2-3)*0.36;M.box(MOSAIC[(R()*MOSAIC.length)|0],xx*0.92,yy-1.2,0,1.4,1.6,0.12);}
    M.box('mosRed',0,13.2,0.1,5,1.6,0.14);M.box('mosYellow',0,14.6,0.1,2.2,1.6,0.14);
    // the hall behind is the mapped one, extruded by the engine
    const g=M.finish(L,x,g0,z,ry);glow({mosYellow:[0.5,0.4,0.1],mosRed:[0.5,0.1,0.06],greenGlass:[0.3,0.36,0.2]});return g;},

  // ================================================================ the Palau Nacional, Montjuïc
  // Built for the International Exhibition of 1929 and now the Museu Nacional d'Art de Catalunya: a palace in the
  // Spanish Renaissance manner on the brow of the hill over the Magic Fountain, its central dome after St Peter's, two
  // smaller ones, four corner towers like the Giralda's, the long colonnaded front. "face" is the front's bearing.
  palaunacional(L,x,z){const g0=gh(x,z),M=Model(),ry=turn(L.face||333),W=L.width||150,D=L.depth||90,H=24;
    M.box('montjuic',0,0,-D/2,W,H,D);M.box('montjuic',0,H,-D/2,W-30,6,D-20);
    for(let i=0;i<22;i++){const xx=-W/2+6+i*(W-12)/21;if(Math.abs(xx)<14)continue;M.column('sandstone',xx,8,1.2,13,0.6,'ionic');}
    M.box('sandstone',0,21,1.2,W,1.4,2.6);M.box('glass',0,8,0.15,W-14,10,0.2);
    // the front portico and its pediment
    M.box('montjuic',0,0,4,30,8,8);for(let i=0;i<6;i++)M.column('sandstone',-12.5+i*5,8,6.6,16,0.8,'corinthian');M.box('sandstone',0,24,6,30,2,10);M.pediment('montjuic',0,26,6,30,6,10);
    // the domes: the great one over the hall, two lesser either side; the four corner towers
    {const dz=-D/2+5;M.cyl('montjuic',0,H+6,dz,16,16,14,24);for(let i=0;i<16;i++){const a=i/16*Math.PI*2;M.box('glass',Math.cos(a)*16.1,H+10,dz+Math.sin(a)*16.1,2.4,5,0.3,-a+Math.PI/2);}
      const t=M.dome('leadDome',0,H+20,dz,16,1.15,{ribs:16,ribK:'sandstone'});M.lantern('sandstone',0,t,dz,2.6,10);}
    for(const s of [-1,1]){const dz=-D/2+5;M.cyl('montjuic',s*34,H+6,dz,7,7,6,16);const t=M.dome('leadDome',s*34,H+12,dz,7,1.1,{ribs:12,ribK:'sandstone'});M.lantern('sandstone',s*34,t,dz,1.2,5);}
    for(const sx of [-1,1])for(const sz of [0,-1]){const cx=sx*(W/2-6),cz=sz*(D-12)-6;M.box('montjuic',cx,H,cz,10,22,10);M.box('sandstone',cx,H+22,cz,11,1.4,11);
      M.box('montjuic',cx,H+23.4,cz,7,8,7);lathe(M,'tileRoof',[[4.4,0],[3.4,3],[0.05,7]],8,cx,H+31.4,cz);sphere(M,'mosGold',cx,H+38.6,cz,0.5,8);}
    const g=M.finish(L,x,g0,z,ry);glow({montjuic:[0.42,0.34,0.2],sandstone:[0.42,0.34,0.2],leadDome:[0.2,0.2,0.22]});return g;},

  // ================================================================ the Castle of Montjuïc
  // The fortress on the summit (173 m), the star of bastions of the 1750s round a square keep, with its moat, its
  // watch tower and the flag; for two centuries it held the city under its guns. Placed on the summit; "face" turns it.
  castle(L,x,z){const g0=gh(x,z),M=Model(),ry=turn(L.face||0),S=L.side||120,R=mkRng(1751);
    // the bastioned trace: a square with an arrow-headed bastion at each corner, walls battered outward
    const ring=[],h=S/2,b=S*0.2;for(const [sx,sz] of [[1,1],[-1,1],[-1,-1],[1,-1]]){ring.push([sx*h,sz*(h-b)],[sx*(h+b*0.8),sz*(h+b*0.8)],[sx*(h-b),sz*h]);}
    const shape=new THREE.Shape();ring.forEach(([px,pz],i)=>i?shape.lineTo(px,pz):shape.moveTo(px,pz));
    M.put('montjuic',M.cached('trace',()=>new THREE.ExtrudeGeometry(shape,{depth:10,bevelEnabled:false}).rotateX(Math.PI/2).translate(0,10,0)),0,-3,0);
    M.put('sandstone',M.cached('coping',()=>new THREE.ExtrudeGeometry(shape,{depth:0.8,bevelEnabled:false}).rotateX(Math.PI/2).translate(0,0.8,0)),0,7,0,0,0,0,[1.004,1,1.004]);
    // the keep round its parade ground, the watch tower, the flag
    for(const [cx,cz,w,d] of [[0,-h*0.55,S*0.7,12],[0,h*0.55,S*0.7,12],[-h*0.55,0,12,S*0.5],[h*0.55,0,12,S*0.5]])M.box('montjuic',cx,7,cz,w,9,d);
    M.box('montjuic',0,7,-h*0.55,8,18,8);M.box('sandstone',0,25,-h*0.55,9,1,9);M.box('iron',0,26,-h*0.55,0.2,10,0.2);M.box('mosRed',2,32.6,-h*0.55,4,1,0.06);M.box('mosYellow',2,33.6,-h*0.55,4,1.4,0.06);M.box('mosRed',2,34.6,-h*0.55,4,1,0.06);
    for(let i=0;i<40;i++){const [px,pz]=ring[(i*3)%ring.length];M.box('sandstone',px*0.98,7.8,pz*0.98,1.2,1.0,1.2);}
    const g=M.finish(L,x,g0,z,ry);glow({montjuic:[0.24,0.2,0.14]});return g;},

  // ================================================================ the Port Cable Car (Telefèric del Port)
  // Carles Buïgas's aerial tramway of 1931, across the harbour from Barceloneta to Montjuïc: the Torre de Sant
  // Sebastià (78 m) on the beach side, the Torre de Jaume I (107 m) on the Moll de Barcelona, and the station at
  // Miramar on the hill; two red cabins shuttling, each with nineteen people. "towers": [[lat, lon, height], ...].
  cablecar(L,x,z){const T=L.towers.map(([la,lo,h])=>{const [tx,tz]=P([la,lo]);return {x:tx,z:tz,h,g:gh(tx,tz)};}),M=Model();
    const ox=T[0].x,oz=T[0].z,oy=T[0].g;
    T.forEach((t,i)=>{const lx=t.x-ox,lz=t.z-oz,ly=t.g-oy;if(i===T.length-1){M.box('montjuic',lx,ly,lz,14,t.h,10);M.box('glass',lx,ly+t.h*0.5,lz+5.05,10,t.h*0.35,0.2);return;}
      // a steel lattice tower, square, tapering, with the machine house at the top
      const s0=7,s1=4.2,H=t.h-8,C=[[1,1],[-1,1],[-1,-1],[1,-1]];
      for(let h=0;h<H;h+=6){const a=s0+(s1-s0)*h/H,b=s0+(s1-s0)*Math.min(H,h+6)/H;for(let c=0;c<4;c++){const [px,pz]=C[c],[qx,qz]=C[(c+1)%4];
          beam(M,'steelPale',new V3(lx+px*a,ly+h,lz+pz*a),new V3(lx+px*b,ly+Math.min(H,h+6),lz+pz*b),0.7);
          beam(M,'steelPale',new V3(lx+px*a,ly+h,lz+pz*a),new V3(lx+qx*b,ly+Math.min(H,h+6),lz+qz*b),0.25);beam(M,'steelPale',new V3(lx+qx*a,ly+h,lz+qz*a),new V3(lx+px*b,ly+Math.min(H,h+6),lz+pz*b),0.25);}}
      M.box('steelPale',lx,ly+H,lz,s1*2+5,1.2,s1*2+5);M.box('glass',lx,ly+H+1.2,lz,s1*2+3,5,s1*2+3);M.box('steelPale',lx,ly+H+6.2,lz,s1*2+4,1.4,s1*2+4);});
    // the cables between them, sagging, and the two cabins on them
    const tops=T.map(t=>new V3(t.x-ox,t.g-oy+t.h-2,t.z-oz)),span=[];
    for(let i=0;i+1<tops.length;i++){const a=tops[i],b=tops[i+1],len=a.distanceTo(b);for(const off of [-1.4,1.4]){let prev=null;const dir=new V3().subVectors(b,a),side=new V3(-dir.z,0,dir.x).normalize().multiplyScalar(off);
        for(let k=0;k<=24;k++){const t=k/24,p=new V3().lerpVectors(a,b,t).add(side);p.y-=Math.sin(t*Math.PI)*len*0.035;if(prev)beam(M,'cable',prev,p,0.12);prev=p;}}
      span.push([a,b,len]);}
    const g=M.finish(L,ox,oy,oz,0);
    const cab=new THREE.Group();{const C2=Model();C2.box('cabin',0,-5.2,0,2.4,2.6,2.6);C2.box('glass',0,-4.6,0,2.5,1.2,2.7);C2.box('steelPale',0,-2.6,0,0.3,2.6,0.3);C2.box('steelPale',0,-0.1,0,0.6,0.4,1.8);
      const a=C2.finish(L,0,0,0,0);const b=a.clone();cab.add(a,b);}
    api.scene.add(cab);const total=span.reduce((q,v)=>q+v[2],0);
    // each cabin on its own cable, shuttling end to end in about five minutes; the two pass in the middle
    animHooks.push(now=>{const t0=(now/1000)%300/300;cab.children.forEach((c,i)=>{let d=(1-Math.abs(((t0+i*0.5)%1)*2-1))*total;
      for(let k=0;k<span.length;k++){const [a,b,len]=span[k];if(d>len&&k<span.length-1){d-=len;continue;}const t=Math.min(1,d/len),side=new V3(-(b.z-a.z),0,b.x-a.x).normalize().multiplyScalar(i?1.4:-1.4);
        c.position.lerpVectors(a,b,t).add(side);c.position.y-=Math.sin(t*Math.PI)*len*0.035;c.position.x+=ox;c.position.y+=oy;c.position.z+=oz;break;}});});
    return g;},

  // ================================================================ the Venetian towers of the Plaça d'Espanya
  // Ramon Reventós's pair, 1929, after the campanile of St Mark's: 47 m of brick, the gateway to the Exhibition.
  venetian(L,x,z){const g0=gh(x,z),M=Model(),ry=turn(L.face||0),gap=L.gap||32;
    for(const s of [-1,1]){const cx=s*gap/2;M.box('brickBcn',cx,0,0,7.2,33,7.2);M.box('sandstone',cx,33,0,8,1,8);M.box('sandstone',cx,34,0,7.2,5,7.2);
      for(const [ax,az] of [[1,0],[-1,0],[0,1],[0,-1]])M.box('glass',cx+ax*3.62,34.6,az*3.62,az?1.6:0.1,3,ax?1.6:0.1);
      M.box('brickBcn',cx,39,0,7.2,2.4,7.2);M.put('tileRoof',M.cached('vpyr',()=>new THREE.ConeGeometry(5.0,8,4).rotateY(Math.PI/4).translate(0,4,0)),cx,41.4,0);sphere(M,'mosGold',cx,49.6,0,0.5,8);}
    return M.finish(L,x,g0,z,ry);},

  // ================================================================ Frank Gehry's fish (El Peix)
  // The golden steel fish over the Port Olímpic, 1992: 56 m long, a lattice of bronze-coloured strips over the boardwalk.
  peix(L,x,z){const g0=gh(x,z),M=Model(),ry=turn(L.face||45);
    for(let i=0;i<28;i++){const t=i/27,u=(t-0.5)*54,rr=Math.sin(Math.PI*Math.pow(t,0.8))*9+0.6,cy=24+Math.sin(t*Math.PI*1.2)*3;
      M.put('mosGold',M.cached('fishRib',()=>new THREE.TorusGeometry(1,0.06,4,18)),0,cy,u,Math.PI/2,0,0,[rr,rr*0.75,1]);}
    for(let a=0;a<6;a++)beam(M,'mosGold',new V3(Math.cos(a)*7,22,-24),new V3(Math.cos(a)*7,26,24),0.2);
    for(const [px,pz] of [[-6,-14],[6,-14],[-6,10],[6,10]])beam(M,'steelPale',new V3(px,0,pz),new V3(px*0.6,22,pz),0.7);
    const g=M.finish(L,x,g0,z,ry);glow({mosGold:[0.4,0.3,0.1]});return g;},

  };
}
