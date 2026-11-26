// ---------- Sarajevo: the buildings that are shapes rather than heights ----------
// Modelled from their published dimensions on the shared landmark kit (src/core/landkit.js), each placed from its
// entry in sarajevo.json. Everything else is its own mapped footprint, extruded by the engine; the mosques the map
// carries and these do not model get their domes and minarets in mosques.js.
//
//   mosque      an Ottoman mosque of the classical kind: a square prayer hall under one dome on an octagonal drum,
//               the portico of small domes on columns across the front, a pencil minaret with one balcony at the
//               front corner, and the courtyard's fountain under its wooden roof. Gazi Husrev-beg's (1530), the
//               Emperor's (1566), Ferhadija (1561)
//   clocktower  the Sahat-kula: a stone shaft of 30 m and the clock room on top, its clock set to lunar time (a la
//               turca), so that it reads twelve at sunset
//   sebilj      the Sebilj in Baščaršija: Vitkovac's wooden kiosk fountain of 1891, octagonal, under a green dome
//   vijecnica   the City Hall (1896), pseudo-Moorish: striped walls of ochre and red, horseshoe arches, crenellations,
//               the hexagonal hall under its glass dome, on its mapped outline
//   oldbridge   an Ottoman stone bridge over the Miljacka, humped, its piers pierced by round "eyes": the Latin Bridge
//   cathedral   the Cathedral of the Sacred Heart (1889): neo-Gothic, two west towers of 43 m with their spires
//   bastion     the Yellow Bastion (Žuta tabija), 18th century, on the hill over Vratnik: its battered walls on the
//               mapped outline, and the cannon that fires at sunset in Ramadan
//   twist       the Avaz Twist Tower (2008): 142 m of glass turning on itself, its crown and spire to 172 m
//   holiday     the Holiday Inn (1983), built for the Olympics: a stepped block in mustard yellow and brown
//   flame       the Eternal Flame (1946): the memorial wall in Ferhadija, and its flame
//   cablecar    the Trebević cable car (1959, rebuilt 2018): the gondolas from Bistrik up the mountain, on the
//               mapped line, its pylons and its two stations
//   bobsleigh   the 1984 Olympic bobsleigh and luge track on Trebević: a concrete trough winding down the mountain,
//               banked in its curves, disused since the war and covered in graffiti
//   stadium     the Olympic stadium at Koševo, where the Games opened on 8 February 1984: the bowl of stands round
//               the running track, the floodlights, the cauldron
//
// Map data (c) OpenStreetMap contributors, ODbL. The geometry here is this project's own.
import {landkit} from '../core/landkit.js';
import {mkRng} from '../core/rng.js';

export function landmarks(api){
  const {THREE,animHooks,gh,nightF}=api;
  const {Model,mat,setMat,turn,archPanel,crossing}=landkit(api,{kamen:0xd9d2c2,kamenDark:0xb5ad9c,lead:0x7a8286,leadDark:0x5f6669,copper:0x5e9a82,
    wood:0x6e4a2c,woodDark:0x4a3020,lattice:0x3a2a1c,whitewash:0xece8de,tile:0xa8543a,ochre:0xd8a868,stripeRed:0xa8473a,stucco:0xd9c29a,
    gothic:0xd6c8a6,gothicDark:0xae9f80,roofSlate:0x5a5e66,bastion:0xd8b878,bastionDark:0xb89a5c,glass:0x4a6a7c,glassPale:0x8aa8b8,unisGlass:0x26323c,unisBand:0x8a9096,slab:0xc8ccd0,
    mustard:0xd8a830,brown:0x6a4a32,concrete:0xa8a49c,concreteDark:0x86827a,iron:0x2a2a2c,steel:0x9aa0a6,cabin:0xd83a2a,track:0xc85a2a,
    grass:0x5a7a3e,g1:0xd84a8a,g2:0x3a8ad8,g3:0xe8c838,g4:0x3ac87a,g5:0xe86a2a,g6:0xf2f2f2,flame:0xffb040,dark:0x2a231e,gold:0xcaa13c});
  const V3=THREE.Vector3,Q=new THREE.Quaternion(),E=new THREE.Euler(),UP=new V3(0,0,1);
  // the curtain wall's skin (a 12 m by 8 floor tile: mullions, spandrels, the panes' tints) and its night light, and
  // the Avaz sign; materials the kit's plain colours cannot be
  {const cell=(lit)=>{const cv=document.createElement('canvas');cv.width=256;cv.height=256;const c=cv.getContext('2d'),R=mkRng(lit?7:6);
      for(let j=0;j<8;j++)for(let i=0;i<8;i++){const k=R();if(lit){c.fillStyle=k<0.42?`rgb(${230+R()*25|0},${200+R()*35|0},${140+R()*50|0})`:'#000';}
        else c.fillStyle=`rgb(${48+k*26|0},${92+k*30|0},${104+k*30|0})`;c.fillRect(i*32,j*32,32,32);}
      c.fillStyle=lit?'#000':'#a8b6bc';for(let j=0;j<8;j++)c.fillRect(0,j*32+26,256,6);for(let i=0;i<=8;i++)c.fillRect(i*32-1,0,2,256);
      const t=new THREE.CanvasTexture(cv);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=4;return t;};
    const g=new THREE.MeshPhongMaterial({color:0xffffff,map:cell(false),emissive:0xffffff,emissiveMap:cell(true),emissiveIntensity:0,specular:0x8aa0aa,shininess:60});
    animHooks.push(()=>{const h=api.hour?api.hour():12,w=api.windowF?api.windowF(h):nightF(h)*0.5;g.emissiveIntensity=Math.min(1,w*1.6);});   // lit with the city's windows
    const cv=document.createElement('canvas');cv.width=512;cv.height=128;const c=cv.getContext('2d');c.fillStyle='#f4f2ee';c.fillRect(0,0,512,128);
    c.fillStyle='#d4202a';c.font='bold 108px Helvetica,Arial,sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText('AVAZ',256,70);
    const sign=new THREE.MeshLambertMaterial({map:new THREE.CanvasTexture(cv),emissive:0x401010,side:THREE.DoubleSide});
    setMat('avazGlass',g);setMat('avazSign',sign);}

  const P=api.P;
  // a beam between two points
  function beam(M,k,a,b,t){const d=new V3().subVectors(b,a),len=d.length();if(len<0.01)return;Q.setFromUnitVectors(UP,d.normalize());E.setFromQuaternion(Q,'YXZ');
    M.put(k,new THREE.BoxGeometry(t,t,len),(a.x+b.x)/2,(a.y+b.y)/2,(a.z+b.z)/2,E.y,E.x,E.z);}
  // a prism on a ring (points relative to the model) from y0 to y1, and its cap
  // the water's level at a point: the reach that holds it (water areas carry their own level, y), or null
  const REACHES=(api.OSM.water||[]).filter(w=>typeof w.y==='number').map(w=>{const r=[];for(let i=0;i+1<w.o.length;i+=2)r.push([w.o[i]/10,w.o[i+1]/10]);return {r,y:w.y};});
  const waterY=(x,z)=>{for(const w of REACHES)if(api.inPoly(x,z,w.r))return w.y;return null;};
  function prism(M,k,ring,y0,y1,cap){const n=ring.length,pos=[];
    for(let i=0;i<n;i++){const a=ring[i],b=ring[(i+1)%n];pos.push(a[0],y1,a[1],b[0],y0,b[1],b[0],y1,b[1], a[0],y1,a[1],a[0],y0,a[1],b[0],y0,b[1]);}
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(new Float32Array(pos.length/3*2),2));
    g.computeVertexNormals();M.put(k,g,0,0,0);
    if(cap){const tri=THREE.ShapeUtils.triangulateShape(ring.map(([x,z])=>new THREE.Vector2(x,z)),[]),cp=[];for(const f of tri)for(const q of [f[0],f[2],f[1]])cp.push(ring[q][0],y1,ring[q][1]);
      const gc=new THREE.BufferGeometry();gc.setAttribute('position',new THREE.Float32BufferAttribute(cp,3));gc.setAttribute('uv',new THREE.Float32BufferAttribute(new Float32Array(cp.length/3*2),2));gc.computeVertexNormals();M.put(cap,gc,0,0,0);}}
  // a ring's winding: the rings from the map may go either way; walls want their outsides out
  const ccw=ring=>{let a=0;for(let i=0;i<ring.length;i++){const p=ring[i],q=ring[(i+1)%ring.length];a+=p[0]*q[1]-q[0]*p[1];}return a>0?ring:ring.slice().reverse();};
  const local=(L,x,z,list)=>list.map(p=>{const [px,pz]=P(p);return [px-x,pz-z];});
  // things along a ring's edges, every `step` metres: fn(px, pz, ry facing out, edge length)
  function alongRing(ring,step,fn){const n=ring.length;for(let i=0;i<n;i++){const [ax,az]=ring[i],[bx,bz]=ring[(i+1)%n],len=Math.hypot(bx-ax,bz-az);if(len<step*0.6)continue;
    const m=Math.max(1,Math.floor(len/step)),tx=(bx-ax)/len,tz=(bz-az)/len,nx=tz,nz=-tx,ry=Math.atan2(nx,nz);
    for(let k=0;k<m;k++){const u=(k+0.5)/m*len;fn(ax+tx*u,az+tz*u,ry,len/m,nx,nz);}}}
  // ---- the Ottoman pieces ----
  // a minaret: a square base, a many-sided shaft, the balcony (şerefe) on its corbels, the upper shaft, and the
  // lead-sheathed pencil cone with its finial (alem); H overall to the tip of the cone
  function minaret(M,x,y,z,H,r,stone){const k=stone||'kamen',base=Math.max(3,H*0.14),bal=H*0.66,cone=H*0.2;
    M.box(k,x,y,z,r*2.6,base,r*2.6);M.cyl(k,x,y+base,z,r*1.3,r,r*1.2,12);
    M.cyl(k,x,y+base+r*1.2,z,r,r,bal-base-r*1.2,12);
    M.cyl('kamenDark',x,y+bal-1.0,z,r,r*1.7,1.0,12);M.cyl(k,x,y+bal,z,r*1.75,r*1.75,0.3,12);
    for(let i=0;i<12;i++){const a=i/12*Math.PI*2;M.box('kamen',x+Math.cos(a)*r*1.68,y+bal+0.3,z+Math.sin(a)*r*1.68,0.12,1.0,r*0.55,-a+Math.PI/2);}
    M.cyl(k,x,y+bal,z,r*0.86,r*0.86,H-cone-bal,12);
    M.put('lead',new THREE.ConeGeometry(r*0.95,cone,12).translate(0,cone/2,0),x,y+H-cone,z);
    M.cyl('gold',x,y+H,z,0.06,0.06,1.4,6);M.put('gold',new THREE.SphereGeometry(0.22,8,6),x,y+H+0.6,z);M.put('gold',new THREE.TorusGeometry(0.3,0.05,5,10,Math.PI*1.4),x,y+H+1.25,z,0,0,0.7);}
  // a şadırvan: the ablution fountain, an octagonal basin under a wooden roof on eight posts
  function sadirvan(M,x,y,z,r){M.cyl('kamen',x,y,z,r,r,0.9,8);M.cyl('water',x,y+0.75,z,r*0.85,r*0.85,0.12,8);M.cyl('kamen',x,y,z,0.5,0.4,1.6,8);
    for(let i=0;i<8;i++){const a=(i+0.5)/8*Math.PI*2;M.cyl('wood',x+Math.cos(a)*r*1.15,y,z+Math.sin(a)*r*1.15,0.14,0.14,3.2,6);}
    M.put('lead',new THREE.ConeGeometry(r*1.55,1.6,8).translate(0,0.8,0),x,y+3.2,z,Math.PI/8);M.put('lead',new THREE.SphereGeometry(r*0.6,10,6,0,Math.PI*2,0,Math.PI/2),x,y+4.0,z);}
  // the horseshoe arch of the Moorish revival: a dark opening, its ring and a striped voussoir band; faces +z
  function horseshoe(M,x,y,z,w,h,ry){const c=Math.cos(ry),s=Math.sin(ry),r=w/2;
    M.box('dark',x,y,z,w,h-r,0.12,ry);M.put('dark',new THREE.CylinderGeometry(r*1.08,r*1.08,0.12,14,1,false,0,Math.PI*1.25).rotateX(Math.PI/2).rotateZ(-Math.PI*0.125),x,y+h-r,z,ry);
    for(let i=0;i<9;i++){const a=-0.4+i/8*(Math.PI+0.8),px=Math.cos(a)*r*1.25,py=Math.sin(a)*r*1.25;M.box(i%2?'stripeRed':'ochre',x+px*c,y+h-r+py-0.25,z-px*s,0.55,0.5,0.25,ry);}}

  // a gondola for the cable car: a cabin on its hanger and grip
  const gondolaGeo=(()=>{const g=new THREE.Group();const m=(geo,c)=>{const o=new THREE.Mesh(geo,new THREE.MeshLambertMaterial({color:c}));g.add(o);return o;};
    m(new THREE.BoxGeometry(2.0,2.1,2.0).translate(0,-4.3,0),0xd83a2a);m(new THREE.BoxGeometry(2.04,0.9,2.04).translate(0,-4.2,0),0x2a3440);
    m(new THREE.BoxGeometry(2.1,0.15,2.1).translate(0,-3.2,0),0xe8e8e8);m(new THREE.BoxGeometry(0.12,3.0,0.12).translate(0,-1.8,0),0x6a6e72);m(new THREE.BoxGeometry(0.5,0.4,0.9).translate(0,-0.2,0),0x3a3c40);
    return g;})();

  return {

  // ================================================================ an Ottoman mosque
  // Built facing +z (the front, the portico and the door; the mihrab at -z, toward Mecca). S the hall's side, D the
  // dome's diameter, Hw the walls, Hm the minaret, porch the small domes across the portico.
  mosque(L,x,z){const g0=gh(x,z),M=Model(),S=L.side||16,Hw=L.wall||12,D=L.dome||13,Hm=L.minaret||45,np=L.porch==null?5:L.porch,k='kamen';
    // the hall: stone walls in courses, two rows of windows, the arched ones below in pairs
    M.box(k,0,0,0,S,Hw,S);M.box('kamenDark',0,Hw-0.6,0,S+0.4,0.6,S+0.4);
    for(const [ax,az,ry] of [[1,0,Math.PI/2],[-1,0,-Math.PI/2],[0,-1,Math.PI]])for(const f of [-0.28,0.28])for(const [yy,hh] of [[1.6,3.0],[6.4,2.4]]){
      const px=ax?ax*(S/2+0.02):f*S,pz=az?az*(S/2+0.02):f*S;M.box('dark',px,yy,pz,ax?0.06:1.3,hh,ax?1.3:0.06);}
    // the squinches, the octagonal drum with its windows, the dome in lead and its finial
    const R=D/2;M.cyl('kamenDark',0,Hw,0,S*0.62,S*0.56,1.6,8,Math.PI/8);M.cyl(k,0,Hw+1.6,0,R*1.12,R*1.12,2.4,8,Math.PI/8);
    for(let i=0;i<8;i++){const a=(i+0.5)/8*Math.PI*2;M.box('dark',Math.cos(a)*R*1.1,Hw+2.0,Math.sin(a)*R*1.1,0.9,1.5,0.1,-a+Math.PI/2);}
    M.put('lead',new THREE.SphereGeometry(R,28,12,0,Math.PI*2,0,Math.PI/2).scale(1,0.92,1),0,Hw+4.0,0);
    M.cyl('gold',0,Hw+4+R*0.92,0,0.08,0.08,1.8,6);M.put('gold',new THREE.SphereGeometry(0.3,8,6),0,Hw+4.6+R*0.92,0);M.put('gold',new THREE.TorusGeometry(0.42,0.07,5,10,Math.PI*1.4),0,Hw+5.6+R*0.92,0,0,0,0.7);
    // the mihrab's projection at the back
    M.box(k,0,0,-S/2-1.2,S*0.3,Hw*0.75,2.4);M.put('lead',new THREE.SphereGeometry(S*0.15,12,6,0,Math.PI,0,Math.PI/2).rotateY(Math.PI),0,Hw*0.75,-S/2-1.2);
    // the portico: a row of small domes on arches and columns across the front
    if(np>0){const pd=6.5,w=S/np,ph=Hw*0.62;M.box(k,0,0,S/2+pd/2,S,0.5,pd);
      for(let i=0;i<=np;i++){const px=-S/2+i*w;M.column(k,px,0.5,S/2+pd-0.6,ph-1.4,0.42,'tuscan');}
      for(let i=0;i<np;i++){const px=-S/2+(i+0.5)*w;M.put(k,archPanel(w,1.6,0.8,w*0.9,0.2),px,ph-0.9,S/2+pd-0.6);
        M.box(k,px,ph+0.6,S/2+pd/2,w,0.6,pd);M.put('lead',new THREE.SphereGeometry(w*0.36,14,6,0,Math.PI*2,0,Math.PI/2),px,ph+1.2,S/2+pd/2);}
      M.box('kamenDark',0,ph+0.5,S/2+pd/2,S+0.3,0.3,pd+0.3);
      M.box('woodDark',0,0.5,S/2+0.1,1.8,3.4,0.2);}               // the door
    else{M.put('lead',new THREE.BoxGeometry(S,0.3,5),0,Hw*0.55,S/2+2.5);for(const sx of [-1,1])M.box('wood',sx*(S/2-0.4),0,S/2+4.6,0.3,Hw*0.55,0.3);M.box('woodDark',0,0,S/2+0.1,1.8,3.4,0.2);}
    // the minaret at the front corner, on the right as you face the door
    minaret(M,L.minaretSide===-1?-(S/2+1.8):S/2+1.8,0,S/2-1.8,Hm,1.15);
    // the courtyard in front: its paving and the fountain
    if(L.court!==false){M.box('kamenDark',0,-0.3,S/2+(np?6.5:5)+11,S+10,0.35,20);sadirvan(M,0,0,S/2+(np?6.5:5)+11,2.4);}
    return M.finish(L,x,g0,z,turn(L.face||0));},

  // ================================================================ the Sahat-kula
  clocktower(L,x,z){const g0=gh(x,z),M=Model(),H=L.height||30,s=L.side||3.6,k='kamen';
    M.box(k,0,0,0,s+0.6,1.0,s+0.6);M.box(k,0,1,0,s,H-6,s);for(let y=4;y<H-6;y+=4.5)M.box('kamenDark',0,y,0,s+0.12,0.25,s+0.12);
    for(const [ax,az,ry] of [[0,1,0],[1,0,Math.PI/2],[0,-1,Math.PI],[-1,0,-Math.PI/2]])M.box('dark',ax*(s/2+0.03),H*0.4,az*(s/2+0.03),ax?0.05:0.4,1.0,ax?0.4:0.05);
    // the clock room: wider, its four faces with their dials, under a lead pyramid and the finial
    M.box('kamenDark',0,H-6,0,s+0.8,0.4,s+0.8);M.box('whitewash',0,H-5.6,0,s+0.5,3.4,s+0.5);
    for(const [ax,az,ry] of [[0,1,0],[1,0,Math.PI/2],[0,-1,Math.PI],[-1,0,-Math.PI/2]]){M.put('whitewash',new THREE.CylinderGeometry(1.15,1.15,0.12,20).rotateX(Math.PI/2),ax*(s/2+0.32),H-4.0,az*(s/2+0.32),ry);
      M.put('dark',new THREE.CylinderGeometry(1.0,1.0,0.13,20).rotateX(Math.PI/2),ax*(s/2+0.34),H-4.0,az*(s/2+0.34),ry);
      M.put('gold',new THREE.BoxGeometry(0.08,0.8,0.04).translate(0,0.35,0),ax*(s/2+0.42),H-4.0,az*(s/2+0.42),ry,0,0.6);}
    M.box('woodDark',0,H-2.2,0,s+1.6,0.25,s+1.6);M.put('lead',new THREE.ConeGeometry((s+1.6)*0.72,2.6,4).rotateY(Math.PI/4).translate(0,1.3,0),0,H-1.95,0);
    M.cyl('gold',0,H+0.6,0,0.05,0.05,1.6,6);M.put('gold',new THREE.SphereGeometry(0.2,8,6),0,H+1.2,0);
    return M.finish(L,x,g0,z,turn(L.face||0));},

  // ================================================================ the Sebilj
  sebilj(L,x,z){const g0=gh(x,z),M=Model();
    // the stone base: an octagonal step, the drinking basins and their brass taps on the sides
    M.cyl('kamen',0,0,0,3.4,3.4,0.35,8,Math.PI/8);M.cyl('kamen',0,0.35,0,2.9,2.9,0.75,8,Math.PI/8);
    for(let i=0;i<8;i++){const a=i/8*Math.PI*2;M.box('kamenDark',Math.cos(a)*3.0,0.35,Math.sin(a)*3.0,0.9,0.35,0.5,-a+Math.PI/2);if(i%2===0)M.cyl('gold',Math.cos(a)*2.95,0.9,Math.sin(a)*2.95,0.05,0.05,0.2,6);}
    // the wooden kiosk: eight posts, the lattice screens between them, the cornice
    const r=2.5,y0=1.1,h=2.6;for(let i=0;i<8;i++){const a=i/8*Math.PI*2+Math.PI/8;M.box('wood',Math.cos(a)*r,y0,Math.sin(a)*r,0.22,h,0.22,-a);}
    for(let i=0;i<8;i++){const a=(i+0.5)/8*Math.PI*2+Math.PI/8,w=2*r*Math.sin(Math.PI/8),px=Math.cos(a)*r*0.93,pz=Math.sin(a)*r*0.93,ry=-a+Math.PI/2;
      M.box('woodDark',px,y0,pz,w*0.95,0.8,0.12,ry);for(let j=0;j<6;j++)M.box('lattice',px,y0+0.9+j*0.27,pz,w*0.92,0.05,0.08,ry);
      for(let j=-2;j<=2;j++){const c=Math.cos(ry),s=Math.sin(ry);M.box('lattice',px+j*w*0.18*c,y0+0.9,pz-j*w*0.18*s,0.05,1.55,0.08,ry);}}
    M.cyl('wood',0,y0+h,0,r*1.08,r*1.08,0.35,8,Math.PI/8);
    // the wide eaves, then the drum and the dome, green, and the crescent
    M.put('copper',new THREE.ConeGeometry(3.7,1.2,8,1,true).rotateY(Math.PI/8).translate(0,0.6,0),0,y0+h+0.1,0);M.put('copper',new THREE.CylinderGeometry(3.7,3.7,0.12,8).rotateY(Math.PI/8),0,y0+h+0.1,0);
    M.cyl('wood',0,y0+h+1.1,0,1.75,1.75,0.7,8,Math.PI/8);M.put('copper',new THREE.SphereGeometry(1.85,16,8,0,Math.PI*2,0,Math.PI/2).scale(1,1.15,1),0,y0+h+1.8,0);
    M.cyl('gold',0,y0+h+3.9,0,0.04,0.04,0.9,6);M.put('gold',new THREE.SphereGeometry(0.14,8,6),0,y0+h+4.25,0);M.put('gold',new THREE.TorusGeometry(0.22,0.04,5,10,Math.PI*1.4),0,y0+h+4.75,0,0,0,0.7);
    return M.finish(L,x,g0,z,0);},

  // ================================================================ the Vijećnica
  vijecnica(L,x,z){const g0=gh(x,z),M=Model(),ring=ccw(local(L,x,z,L.outline)),H=L.height||20;
    // the walls in courses of ochre and red, two to a storey, and the deep base
    prism(M,'kamenDark',ring,-2,1.4);let red=false;for(let y=1.4;y<H-0.01;y+=0.9){const y1=Math.min(H,y+0.9);prism(M,red?'stripeRed':'ochre',ring,y,y1);red=!red;}
    // the windows: horseshoe arches in every bay, three storeys; the merlons along the top
    alongRing(ring,4.6,(px,pz,ry,w,nx,nz)=>{for(const [yy,hh] of [[2.6,3.2],[8.2,3.6],[14.0,3.0]])if(yy+hh<H-1)horseshoe(M,px+nx*0.05,yy,pz+nz*0.05,Math.min(1.8,w*0.42),hh,ry);});
    alongRing(ring,1.6,(px,pz,ry)=>{M.box('ochre',px,H,pz,0.8,1.1,0.5,ry);M.put('stripeRed',new THREE.ConeGeometry(0.42,0.6,4).rotateY(Math.PI/4).translate(0,0.3,0),px,H+1.1,pz,ry);});
    // the roof, low; the hexagonal hall rising in the middle under its glass dome, its ribs
    {const cx=ring.reduce((s,p)=>s+p[0],0)/ring.length,cz=ring.reduce((s,p)=>s+p[1],0)/ring.length,hr=L.hall||9;prism(M,'leadDark',ring.map(([a,b])=>[a+(cx-a)*0.04,b+(cz-b)*0.04]),H-0.4,H-0.2,'leadDark');
      M.cyl('ochre',cx,H-0.3,cz,hr,hr,5,6);for(let i=0;i<6;i++){const a=(i+0.5)/6*Math.PI*2;horseshoe(M,cx+Math.cos(a)*hr*0.87,H+0.3,cz+Math.sin(a)*hr*0.87,1.4,3.4,-a+Math.PI/2);}
      M.put('glassPale',new THREE.SphereGeometry(hr*0.95,6,6,0,Math.PI*2,0,Math.PI/2).scale(1,0.55,1),cx,H+4.7,cz);
      for(let i=0;i<6;i++){const a=i/6*Math.PI*2;beam(M,'iron',new V3(cx+Math.cos(a)*hr*0.95,H+4.7,cz+Math.sin(a)*hr*0.95),new V3(cx,H+4.7+hr*0.52,cz),0.25);}
      M.put('gold',new THREE.SphereGeometry(0.4,8,6),cx,H+5.3+hr*0.52,cz);}
    // the corner turrets, each under its little ribbed dome
    for(const p of (L.turrets||[])){const [tx,tz]=P(p);const lx=tx-x,lz=tz-z;M.cyl('ochre',lx,0,lz,2.2,2.2,H+3.5,8);for(let y=2;y<H+3;y+=1.8)M.cyl('stripeRed',lx,y,lz,2.25,2.25,0.9,8);
      M.put('copper',new THREE.SphereGeometry(2.3,10,6,0,Math.PI*2,0,Math.PI/2).scale(1,1.5,1),lx,H+3.5,lz);M.cyl('gold',lx,H+6.9,lz,0.05,0.05,1.2,6);}
    // the entrance: three great horseshoe arches under a raised parapet
    if(L.entrance){const [ex,ez]=P(L.entrance),ry=turn(L.face||0),c=Math.cos(ry),s=Math.sin(ry);for(const k of [-1,0,1])horseshoe(M,ex-x+k*3.6*c,0,ez-z-k*3.6*s,2.8,7.5,ry);
      M.box('ochre',ex-x,H,ez-z,13,3.2,1.0,ry);for(let k=-5;k<=5;k++)M.box('stripeRed',ex-x+k*1.2*c,H+3.2,ez-z-k*1.2*s,0.6,0.8,1.0,ry);}
    return M.finish(L,x,g0,z,0);},

  // ================================================================ the Latin Bridge
  // Four stone arches over the Miljacka, the deck humped over the middle, the two piers in the river each pierced
  // by a round "eye" to let the floods through. On its north-east corner, Schiller's delicatessen, where Gavrilo
  // Princip stood on 28 June 1914 (the museum now).
  oldbridge(L,x,z){const c=crossing(L.road||L.name,x,z);if(!c)return null;const M=Model(),n=L.arches||4,len=c.half*2+8,span=len/n,pw=Math.max(1.8,span*0.22),w=Math.max(4.6,Math.min(c.w,7)),ry=Math.atan2(-c.uz,c.ux);
    // the river's own level here (its reach's, tools/build-osm-city.py terrain.reaches) and the streets at either end
    const wy=waterY(c.x,c.z),bank=Math.max(gh(c.x+c.ux*(len/2+4),c.z+c.uz*(len/2+4)),gh(c.x-c.ux*(len/2+4),c.z-c.uz*(len/2+4)));
    const gw=wy===null?gh(c.x,c.z):Math.max(wy,bank-(L.deck||3.4)),base=(wy===null?gw:wy)-1.2,hump=L.hump||2.2,deck=(u)=>gw+(L.deck||3.4)+hump*(1-(u/(len/2))**2);
    for(let i=0;i<n;i++){const u=-len/2+span*(i+0.5),px=c.x+c.ux*u,pz=c.z+c.uz*u,mid=Math.abs(i-(n-1)/2)<1,top=deck(u)-0.4,H=top-base,wo=span-pw;
      M.put('kamen',archPanel(span*1.02,H,w,wo,Math.max(0.6,H-wo*0.5-0.6)),px,base,pz,ry);
      for(const sd of [-1,1]){const ox=-c.uz*sd*(w/2+0.1),oz=c.ux*sd*(w/2+0.1),sh=Math.max(0.6,H-wo*0.5-0.6);for(let k=0;k<=8;k++){const a=Math.PI*k/8,lx=Math.cos(a)*(wo/2+0.35),ly=sh+Math.sin(a)*(wo/2+0.35);
        M.box('kamenDark',px+c.ux*lx+ox,base+ly-0.35,pz+c.uz*lx+oz,0.7,0.7,0.25,ry);}}}
    // the eyes over the piers
    for(let i=1;i<n;i++){const u=-len/2+span*i,px=c.x+c.ux*u,pz=c.z+c.uz*u;M.put('dark',new THREE.CylinderGeometry(0.75,0.75,w+0.3,14).rotateX(Math.PI/2),px,deck(u)-2.2,pz,ry);
      for(const sd of [-1,1]){const s2=new THREE.Shape();s2.moveTo(-pw/2,0);s2.lineTo(pw/2,0);s2.lineTo(0,pw*0.9);s2.lineTo(-pw/2,0);
        M.put('kamen',new THREE.ExtrudeGeometry(s2,{depth:4.5,bevelEnabled:false}).rotateX(-Math.PI/2),px-c.uz*sd*w/2,base,pz+c.ux*sd*w/2,ry+(sd>0?0:Math.PI));}}
    // the parapets, humped with the deck
    for(const sd of [-1,1])for(let u=-len/2-3;u<len/2+3;u+=2){const a=deck(Math.max(-len/2,Math.min(len/2,u))),px=c.x+c.ux*(u+1)-c.uz*sd*(w/2-0.25),pz=c.z+c.uz*(u+1)+c.ux*sd*(w/2-0.25);M.box('kamen',px,a,pz,2.05,0.95,0.45,ry);}
    return M.finish(L,0,0,0,0);},

  // ================================================================ the Cathedral of the Sacred Heart
  // Built facing +z: the west front and its two towers at +z, the apse at -z.
  cathedral(L,x,z){const g0=gh(x,z),M=Model(),k='gothic',LEN=L.length||41,W=L.width||21,H=L.height||18,T=L.towerH||43;
    M.box(k,0,0,-1,W,H,LEN-8);M.box('kamenDark',0,H-0.8,-1,W+0.4,0.8,LEN-7.6);
    {const s=new THREE.Shape();s.moveTo(-W/2,0);s.lineTo(W/2,0);s.lineTo(0,H*0.6);s.closePath();M.put('roofSlate',new THREE.ExtrudeGeometry(s,{depth:LEN-8,bevelEnabled:false}).translate(0,0,-(LEN-8)/2),0,H,-1);}
    // the apse: a half-polygon, its roof
    M.cyl(k,0,0,-LEN/2+3,W*0.36,W*0.36,H*0.85,7);M.put('roofSlate',new THREE.ConeGeometry(W*0.38,H*0.45,7).translate(0,H*0.225,0),0,H*0.85,-LEN/2+3);
    // buttresses and the tall lancets between them
    for(let i=0;i<5;i++){const zz=-LEN/2+8+i*(LEN-12)/4.5;for(const sx of [-1,1]){M.box('gothicDark',sx*(W/2+0.6),0,zz,1.2,H*0.85,1.4);M.put('gothicDark',new THREE.ConeGeometry(0.6,2.2,4).rotateY(Math.PI/4).translate(0,1.1,0),sx*(W/2+0.6),H*0.85,zz);
      if(i<4)M.box('dark',sx*(W/2+0.03),3,zz+3.3,0.06,H*0.55,1.4);}}
    // the west front: two towers, the gable with its rose between them, three portals
    const tw=6.2,tx=W/2-tw/2+0.6,fz=LEN/2-4;for(const sx of [-1,1]){const px=sx*tx;M.box(k,px,0,fz,tw,T*0.68,tw);
      for(let y=6;y<T*0.68;y+=6.5)M.box('gothicDark',px,y,fz,tw+0.2,0.35,tw+0.2);
      M.box('dark',px,T*0.68-6.5,fz+tw/2+0.02,1.1,4.2,0.06);M.box('dark',px,T*0.68-6.5,fz,tw+0.04,4.2,1.1);
      for(const [cx,cz] of [[1,1],[-1,1],[1,-1],[-1,-1]])M.put('gothicDark',new THREE.ConeGeometry(0.5,3.2,4).rotateY(Math.PI/4).translate(0,1.6,0),px+cx*tw/2,T*0.68,fz+cz*tw/2);
      M.put('roofSlate',new THREE.ConeGeometry(tw*0.62,T*0.32,8).rotateY(Math.PI/8).translate(0,T*0.16,0),px,T*0.68,fz);
      M.cyl('gold',px,T,fz,0.06,0.06,2,6);M.box('gold',px,T+1.3,fz,0.9,0.1,0.1);
      // each tower's clock under the belfry, and its pairs of lancets, one pair a storey, up the front and the side
      M.put('whitewash',new THREE.CylinderGeometry(1.25,1.25,0.12,20).rotateX(Math.PI/2),px,T*0.68-9.4,fz+tw/2+0.08);M.put('gothicDark',new THREE.TorusGeometry(1.3,0.12,5,20),px,T*0.68-9.4,fz+tw/2+0.14);
      M.put('dark',new THREE.BoxGeometry(0.07,0.9,0.04).translate(0,0.35,0),px,T*0.68-9.4,fz+tw/2+0.16,0,0,0.9);M.put('dark',new THREE.BoxGeometry(0.07,0.6,0.04).translate(0,0.25,0),px,T*0.68-9.4,fz+tw/2+0.16,0,0,-0.4);
      for(let y=7.5;y<T*0.68-13;y+=6.5)for(const lx of [-0.75,0.75]){M.box('dark',px+lx,y,fz+tw/2+0.03,0.6,2.6,0.06);M.put('dark',new THREE.ConeGeometry(0.42,0.8,3).rotateY(Math.PI/6).translate(0,0.4,0),px+lx,y+2.6,fz+tw/2+0.03);
        M.box('dark',px+sx*(tw/2+0.03),y,fz+lx,0.06,2.6,0.6);}}
    // the tracery of the rose, and the lancets' pointed heads along the nave
    for(let i=0;i<8;i++){const a=i/8*Math.PI;M.put('gothicDark',new THREE.BoxGeometry(5.2,0.14,0.08),0,H-3,fz+tw/2+0.12,0,0,a);}
    for(let i=0;i<4;i++){const zz=-LEN/2+8+i*(LEN-12)/4.5+3.3;for(const sx of [-1,1])M.put('dark',new THREE.ConeGeometry(0.75,1.3,3).translate(0,0.65,0),sx*(W/2+0.02),3+H*0.55,zz,Math.PI/2,0,0,[0.1,1,1]);}
    // John Paul II in bronze in the square before the door (2014)
    if(L.statue!==false){M.box('kamen',0,0,fz+tw/2+(L.statueAt||14),2.2,1.6,2.2);M.statue('bronzeDark',0,1.6,fz+tw/2+(L.statueAt||14),3.4);}
    {const s=new THREE.Shape();s.moveTo(-(tx-tw/2),0);s.lineTo(tx-tw/2,0);s.lineTo(0,9);s.closePath();M.put(k,new THREE.ExtrudeGeometry(s,{depth:1.2,bevelEnabled:false}),0,H,fz+tw/2-1.2);}
    M.put('glass',new THREE.CylinderGeometry(2.6,2.6,0.2,24).rotateX(Math.PI/2),0,H-3,fz+tw/2+0.05);M.put('gothicDark',new THREE.TorusGeometry(2.7,0.25,6,24),0,H-3,fz+tw/2+0.08);
    for(const px of [-tx,0,tx]){const w0=px?1.8:2.6;M.box('dark',px,0,fz+tw/2+0.02,w0,px?4.5:6,0.06);M.put('gothicDark',new THREE.ConeGeometry(w0*0.7,2.2,3).rotateY(Math.PI/6).translate(0,1.1,0),px,px?4.5:6,fz+tw/2+0.4);}
    return M.finish(L,x,g0,z,turn(L.face||0));},

  // ================================================================ the Yellow Bastion
  bastion(L,x,z){const g0=gh(x,z),M=Model(),ring=ccw(local(L,x,z,L.outline)),H=L.height||7;
    // its walls follow the ground under them: each edge's foot at the lower of its ends, the top level at the
    // bastion's own height over its highest corner, so the hill side is low and the valley side tall
    const top=Math.max(...ring.map(([a,b])=>gh(a+x,b+z)))-g0+2.2;
    prism(M,'bastion',ring.map(([a,b])=>[a*1.06,b*1.06]),Math.min(...ring.map(([a,b])=>gh(a+x,b+z)))-g0-3,top-H*0.35);
    prism(M,'bastion',ring,top-H*0.35,top,'grass');prism(M,'bastionDark',ring.map(([a,b])=>[a*1.07,b*1.07]),top-H*0.35-0.4,top-H*0.35);
    alongRing(ring,3.0,(px,pz,ry,w,nx,nz)=>{M.box('bastion',px+nx*-0.4,top,pz+nz*-0.4,1.7,1.1,1.0,ry);});
    // the cannon on its carriage, pointing over the city (L.gun: where it stands; L.gunFace: its bearing)
    if(L.gun){const [gx,gz]=P(L.gun),lx=gx-x,lz=gz-z,ry=turn(L.gunFace||220);M.box('woodDark',lx,top,lz,1.2,0.7,2.2,ry);
      for(const sd of [-1,1]){const c=Math.cos(ry),s=Math.sin(ry);M.put('woodDark',new THREE.CylinderGeometry(0.55,0.55,0.15,12).rotateZ(Math.PI/2),lx+sd*0.7*c,top+0.55,lz-sd*0.7*s,ry);}
      M.put('iron',new THREE.CylinderGeometry(0.22,0.3,2.8,12).rotateX(Math.PI/2).translate(0,0,0.6),lx,top+1.0,lz,ry);}
    return M.finish(L,x,g0,z,0);},

  // ================================================================ the UNIS towers
  // Momo and Uzeir: twin towers of 1986 at Marijin Dvor, each a square with its corners cut, dark glass between
  // pale metal spandrels floor over floor, a fin up each cut corner, two floors set back at the top for the plant, and
  // a mast. Burned out in 1992 (their black shells were a photograph of the siege), reclad and reopened in 2007.
  unis(L,x,z){const g0=gh(x,z),M=Model(),S=(L.side||19)/2,c=L.chamfer||3.6,F=L.floors||26,FH=L.floorH||3.8;
    const plan=k=>[[S-c,-S],[S,-S+c],[S,S-c],[S-c,S],[-S+c,S],[-S,S-c],[-S,-S+c],[-S+c,-S]].map(([p,q])=>[p*k,q*k]);
    prism(M,'concrete',plan(1.18),-1,FH*1.2,'slab');                                   // the podium's plinth
    for(let f=0;f<F;f++){const y=FH*1.2+f*FH;prism(M,'unisGlass',plan(1),y,y+FH-0.85);prism(M,'unisBand',plan(1.012),y+FH-0.85,y+FH);}
    const H=FH*1.2+F*FH;
    for(const [p,q] of [[S-c/2,-S+c/2],[S-c/2,S-c/2],[-S+c/2,S-c/2],[-S+c/2,-S+c/2]])M.box('unisBand',p*1.02,FH*1.2,q*1.02,0.8,H-FH*1.2+1.2,0.8,Math.atan2(p,q));
    prism(M,'unisBand',plan(0.82),H,H+FH*2);prism(M,'slab',plan(0.86),H+FH*2,H+FH*2+0.6);    // the plant floors, set back
    M.cyl('steel',0,H+FH*2+0.6,0,0.5,0.15,L.mast||14,6);
    return M.finish(L,x,g0,z,turn(L.face||0));},
  // ================================================================ the Avaz Twist Tower
  // The newspaper Dnevni Avaz's tower (2008): 142 m and 40 floors of blue-green glass, its plate a rounded rectangle
  // turned a little more at every floor, so the long faces wind round it. Silver bands at the plant floors, the
  // observation deck and its cafe on the 35th behind a band of clear glass, the paper's name in red under the crown,
  // the crown's open frame carrying the twist on, and the mast to 172 m. At its foot the paper's own house, a low
  // glass block on a podium of granite, and the lobby's two-storey glazing under a canopy. The curtain wall is one
  // textured skin (mullions every 1.5 m, the spandrel at each floor), lit floor by floor at night.
  twist(L,x,z){const g0=gh(x,z),M=Model(),H=L.height||142,F=L.floors||40,a=L.a||17,b=L.b||12,TW=(L.twist||70)*Math.PI/180,N=40,FH=H/F,DECK=L.deck||35;
    const plate=(t,k=1)=>{const pts=[];for(let i=0;i<N;i++){const q=i/N*Math.PI*2,cx=Math.cos(q),cz=Math.sin(q);
        const px=Math.sign(cx)*Math.pow(Math.abs(cx),0.4)*a*k,pz=Math.sign(cz)*Math.pow(Math.abs(cz),0.4)*b*k;pts.push([px*Math.cos(t)-pz*Math.sin(t),px*Math.sin(t)+pz*Math.cos(t)]);}return pts;};
    // the skin: u along the plate's perimeter, v up the floors, so the texture's cells are the bays
    const lv=[];for(let f=0;f<=F;f++)lv.push({y:f*FH,r:plate(TW*f/F)});
    const skin=(f0,f1,key)=>{const pos=[],uv=[];for(let f=f0;f<f1;f++){const A=lv[f],B=lv[f+1];let s=0;
      for(let i=0;i<N;i++){const j=(i+1)%N,[ax,az]=A.r[i],[bx,bz]=A.r[j],[cx,cz]=B.r[j],[dx,dz]=B.r[i],L2=Math.hypot(bx-ax,bz-az),u0=s/12,u1=(s+L2)/12,v0=f/8,v1=(f+1)/8;s+=L2;
        pos.push(ax,A.y,az,dx,B.y,dz,cx,B.y,cz, ax,A.y,az,cx,B.y,cz,bx,A.y,bz);uv.push(u0,v0,u0,v1,u1,v1, u0,v0,u1,v1,u1,v0);}}
      const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.computeVertexNormals();M.put(key,g,0,0,0);};
    skin(2,DECK-1,'avazGlass');skin(DECK,F,'avazGlass');skin(DECK-1,DECK,'glassPale');      // the deck's floor in clear glass
    // the lobby: two floors of clear glass, set in under the first slab, the canopy over the door
    prism(M,'glassPale',plate(0,0.96),0,FH*2);prism(M,'steel',plate(0,1.0),FH*2-0.3,FH*2+0.2);
    M.box('steel',0,FH*1.6,b+5,14,0.5,9);for(const sx of [-6,6])M.cyl('steel',sx,0,b+9,0.2,0.2,FH*1.6,8);
    // the silver bands: every fifth floor, and the plant floors
    for(let f=5;f<F;f+=5){const r=lv[f].r.map(([p,q])=>[p*1.015,q*1.015]);prism(M,'steel',r,lv[f].y-0.35,lv[f].y+0.25);}
    // the observation deck: its railing ring, and the cafe's dark interior behind the clear glass
    {const y=lv[DECK-1].y;prism(M,'dark',lv[DECK-1].r.map(([p,q])=>[p*0.9,q*0.9]),y+0.2,y+FH-0.2);prism(M,'steel',lv[DECK-1].r.map(([p,q])=>[p*1.03,q*1.03]),y-0.2,y+0.25);
      prism(M,'steel',lv[DECK].r.map(([p,q])=>[p*1.03,q*1.03]),y+FH-0.25,y+FH+0.2);}
    // the paper's name, red on white, on both long faces under the crown
    {const t=TW*(F-2.5)/F,yy=lv[F-3].y+0.4;for(const sd of [1,-1]){const ox=-sd*b*1.0*Math.sin(t),oz=sd*b*1.0*Math.cos(t);
      M.put('avazSign',new THREE.PlaneGeometry(13,3.4).translate(0,1.7,0),ox,yy,oz,-t+(sd>0?0:Math.PI));}}
    // the top: a parapet, the crown's frame carrying the twist two floors on, its ring, and the mast
    prism(M,'steel',lv[F].r.map(([p,q])=>[p*1.02,q*1.02]),H-0.2,H+1.4,'slab');
    {const top=plate(TW*1.07,0.94);for(let i=0;i<N;i+=2){const [px,pz]=lv[F].r[i],[qx,qz]=top[i];beam(M,'steel',new V3(px,H+1.4,pz),new V3(qx,H+11,qz),0.45);}
      prism(M,'steel',top,H+10.6,H+11.4);prism(M,'steel',top.map(([p,q])=>[p*0.55,q*0.55]),H+5.5,H+6.1);
      for(let i=0;i<N;i+=5){const [qx,qz]=top[i];beam(M,'steel',new V3(qx,H+11,qz),new V3(qx*0.55,H+6,qz*0.55),0.3);}}
    M.cyl('concreteDark',0,H+1.4,0,3,2.6,6,10);M.cyl('steel',0,H+7.4,0,1.0,0.5,10,8);M.cyl('steel',0,H+17.4,0,0.5,0.12,(L.spire||172)-H-17.4,6);
    M.put('cabin',new THREE.SphereGeometry(0.5,8,6),0,(L.spire||172)+0.3,0);                 // the aircraft-warning light
    // the podium and the paper's house beside the tower
    prism(M,'concreteDark',plate(0,1.7),-2,0.6,'slab');
    {const hx=L.houseX==null?-a-22:L.houseX,hw=L.houseW||30,hd=L.houseD||22,hf=L.houseFloors||5;M.box('concreteDark',hx,-2,0,hw+2,2.6,hd+2);
      for(let f=0;f<hf;f++){M.box('avazGlass',hx,0.6+f*4,0,hw,3.2,hd);M.box('steel',hx,3.8+f*4,0,hw+0.4,0.8,hd+0.4);}M.box('slab',hx,0.6+hf*4,0,hw-4,2.4,hd-4);}
    return M.finish(L,x,g0,z,turn(L.face||0));},

  // ================================================================ the Holiday Inn
  // Built for the 1984 Olympics: a block of cubes stepped back, in mustard yellow and brown, round a tall atrium;
  // the press's hotel through the siege, on what the world called Sniper Alley.
  holiday(L,x,z){const g0=gh(x,z),M=Model(),W=L.width||64,D=L.depth||40,FL=L.floors||10,fh=3.4;
    for(let f=0;f<FL;f++){const inset=f>FL-3?(f-(FL-3))*4:0,w=W-inset*2,d=D-inset*2,y=f*fh;
      M.box('mustard',0,y,0,w,fh-0.9,d);M.box('brown',0,y+fh-0.9,0,w-0.6,0.9,d-0.6);
      // the facade's grid of square bays: each a yellow cube a little proud, every other one set back in brown
      for(const [ax,az,len] of [[0,1,w],[0,-1,w],[1,0,d],[-1,0,d]])for(let k=-len/2+2;k<len/2-1;k+=4){const px=ax?ax*(w/2+0.25):k,pz=az?az*(d/2+0.25):k,flip=((k/4|0)+f)%2;
        M.box(flip?'brown':'mustard',px,y+0.2,pz,ax?0.5:3.3,fh-1.3,ax?3.3:0.5);}}
    M.box('brown',0,FL*fh,0,W-30,3.5,D-26);M.box('glassPale',0,FL*fh+3.5,0,W-32,1.4,D-28);           // the atrium's lantern
    M.box('mustard',0,0,D/2+6,W*0.6,5,12);M.box('brown',0,5,D/2+6,W*0.6+0.6,0.7,12.6);                    // the low entrance wing
    return M.finish(L,x,g0,z,turn(L.face||0));},

  // ================================================================ the Eternal Flame
  flame(L,x,z){const g0=gh(x,z),M=Model();
    M.box('kamen',0,0,0,7.5,5.2,0.8);M.box('kamenDark',0,5.2,0,7.9,0.4,1.0);M.box('gold',0,3.2,0.42,4.4,0.9,0.04);
    M.box('kamenDark',0,0,1.0,2.4,0.5,1.4);M.put('iron',new THREE.CylinderGeometry(0.55,0.35,0.5,12),0,0.75,1.0);
    const g=M.finish(L,x,g0,z,turn(L.face||0));
    // the flame itself: two flickering cones, brighter at night
    const fm=new THREE.MeshBasicMaterial({color:0xffa030,transparent:true,opacity:0.85,depthWrite:false}),fi=new THREE.MeshBasicMaterial({color:0xfff0a0,transparent:true,opacity:0.9,depthWrite:false});
    const f1=new THREE.Mesh(new THREE.ConeGeometry(0.35,1.0,10).translate(0,0.5,0),fm),f2=new THREE.Mesh(new THREE.ConeGeometry(0.18,0.6,8).translate(0,0.3,0),fi);
    for(const f of [f1,f2]){f.position.set(0,1.0,1.0);f.userData.noWire=true;f.userData.noFingerprint=true;g.add(f);}
    animHooks.push(now=>{const t=now/1000;f1.scale.set(1+0.1*Math.sin(t*13),0.85+0.25*Math.abs(Math.sin(t*7.1)+0.4*Math.sin(t*17.3)),1+0.1*Math.cos(t*11));f2.scale.y=0.8+0.3*Math.abs(Math.sin(t*9.7));});
    return g;},

  // ================================================================ the Trebević cable car
  // Its line from the map (L.line), the stations at its ends, a pylon at each of L.pylons (fractions along it),
  // the haul rope pair over them, and the gondolas going round: up one side, down the other.
  cablecar(L,x,z){const M=Model(),pts=L.line.map(p=>{const [px,pz]=P(p);return [px,pz];}),n=pts.length;
    const seg=[0];for(let i=1;i<n;i++)seg.push(seg[i-1]+Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]));const LEN=seg[n-1];
    const at=s=>{s=Math.max(0,Math.min(LEN,s));let i=0;while(i<n-2&&seg[i+1]<s)i++;const f=(s-seg[i])/((seg[i+1]-seg[i])||1);return [pts[i][0]+(pts[i+1][0]-pts[i][0])*f,pts[i][1]+(pts[i+1][1]-pts[i][1])*f];};
    const [x0,z0]=at(0),[x1,z1]=at(LEN),ux=(x1-x0)/Math.hypot(x1-x0,z1-z0),uz=(z1-z0)/Math.hypot(x1-x0,z1-z0),nx=-uz,nz=ux,ry=Math.atan2(ux,uz);
    // the rope's height: H over the ground at each support; straight between supports, sagging a little
    const sup=[0,...(L.pylons||[0.2,0.4,0.6,0.8]).map(f=>f*LEN),LEN],H0=L.stationH||9,HP=L.pylonH||22;
    const supY=sup.map((s,i)=>{const [px,pz]=at(s);return gh(px,pz)+(i===0||i===sup.length-1?H0:HP);});
    const rope=(s)=>{let i=0;while(i<sup.length-2&&sup[i+1]<s)i++;const f=(s-sup[i])/((sup[i+1]-sup[i])||1);return supY[i]+(supY[i+1]-supY[i])*f-Math.sin(f*Math.PI)*(sup[i+1]-sup[i])*0.035;};
    // the stations: a hall over the rope, the bullwheel
    for(const [s,dir] of [[0,1],[LEN,-1]]){const [px,pz]=at(s),g=gh(px,pz);M.box('concrete',px-ux*dir*6,g,pz-uz*dir*6,14,H0+3,24,ry);M.box('glassPale',px-ux*dir*6,g+3,pz-uz*dir*6,14.2,H0-3,20,ry);
      M.box('steel',px-ux*dir*6,g+H0+3,pz-uz*dir*6,15,0.6,25,ry);M.put('iron',new THREE.CylinderGeometry(2.6,2.6,0.4,20),px,g+H0,pz);}
    for(let i=1;i<sup.length-1;i++){const [px,pz]=at(sup[i]),g=gh(px,pz);M.box('steel',px,g,pz,1.2,HP,1.2,ry);M.box('steel',px,g+HP-0.4,pz,0.6,0.6,7.2,ry+Math.PI/2);
      for(const sd of [-1,1])M.box('iron',px+nx*sd*3.2,g+HP-0.8,pz+nz*sd*3.2,0.4,0.6,4,ry);}
    // the ropes, both sides, as thin beams between successive samples
    for(const sd of [-1,1])for(let s=0;s<LEN;s+=20){const s1=Math.min(LEN,s+20),[ax,az]=at(s),[bx,bz]=at(s1);beam(M,'iron',new V3(ax+nx*sd*3.2,rope(s),az+nz*sd*3.2),new V3(bx+nx*sd*3.2,rope(s1),bz+nz*sd*3.2),0.12);}
    const g=M.finish(L,0,0,0,0);
    // the gondolas: up on one rope, down on the other, 5 m/s, one every 100 m or so
    const K=Math.round(LEN*2/(L.every||110)),cabs=[];
    for(let i=0;i<K;i++){const c=gondolaGeo.clone();c.traverse(o=>{o.userData.noWire=true;o.userData.noFingerprint=true;});g.add(c);cabs.push(c);}
    const rec=api.ctx.cablecar={at,rope,LEN,nx,nz,ry,cabs};
    animHooks.push(now=>{const v=L.speed||5,loop=LEN*2,t=now/1000;for(let i=0;i<K;i++){let s=(t*v+i*loop/K)%loop;const up=s<LEN,sd=up?1:-1;if(!up)s=loop-s;
      const [px,pz]=at(s),c=cabs[i];c.position.set(px+nx*sd*3.2,rope(s),pz+nz*sd*3.2);c.rotation.y=ry;}});
    return g;},

  // ================================================================ the Olympic bobsleigh track
  // The trough is a floor and two walls swept along the mapped line, laid on the ground; in a curve the outer wall
  // rises into the banking. Concrete gone grey and stained, and graffiti over all of it.
  bobsleigh(L,x,z){const M=Model(),R=mkRng(1984),W=1.6;
    for(const line of L.lines){const pts=line.map(p=>{const [px,pz]=P(p);return [px,pz];});
      // resample every 3 m
      const S=[];for(let i=0;i+1<pts.length;i++){const [ax,az]=pts[i],[bx,bz]=pts[i+1],len=Math.hypot(bx-ax,bz-az),m=Math.max(1,Math.round(len/3));for(let k=0;k<m;k++)S.push([ax+(bx-ax)*k/m,az+(bz-az)*k/m]);}S.push(pts[pts.length-1]);
      const n=S.length;if(n<3)continue;const fl=[],wl=[];
      const dir=i=>{const a=S[Math.max(0,i-1)],b=S[Math.min(n-1,i+1)],l=Math.hypot(b[0]-a[0],b[1]-a[1])||1;return [(b[0]-a[0])/l,(b[1]-a[1])/l];};
      const curv=i=>{const a=dir(Math.max(0,i-3)),b=dir(Math.min(n-1,i+3));return a[0]*b[1]-a[1]*b[0];};
      const rows=[];for(let i=0;i<n;i++){const [tx,tz]=dir(i),nx=-tz,nz=tx,g=gh(S[i][0],S[i][1])+0.3,k=Math.max(-1,Math.min(1,curv(i)*4)),hl=1.1+Math.max(0,k)*2.4,hr=1.1+Math.max(0,-k)*2.4;
        rows.push({x:S[i][0],z:S[i][1],g,nx,nz,hl,hr});}
      const quad=(arr,a,b,c,d)=>arr.push(...a,...b,...c,...a,...c,...d);
      for(let i=0;i+1<n;i++){const A=rows[i],B=rows[i+1];
        const p=(r,o,h)=>[r.x+r.nx*o,r.g+h,r.z+r.nz*o];
        quad(fl,p(A,-W,0),p(B,-W,0),p(B,W,0),p(A,W,0));
        quad(wl,p(A,W,0),p(B,W,0),p(B,W+0.3,B.hl),p(A,W+0.3,A.hl));quad(wl,p(A,W+0.3,A.hl),p(B,W+0.3,B.hl),p(B,W+0.6,0),p(A,W+0.6,0));
        quad(wl,p(A,-W-0.3,A.hr),p(B,-W-0.3,B.hr),p(B,-W,0),p(A,-W,0));quad(wl,p(A,-W-0.6,0),p(B,-W-0.6,0),p(B,-W-0.3,B.hr),p(A,-W-0.3,A.hr));
        // graffiti: a panel of colour on a wall now and then
        if(R()<0.22){const k='g'+(1+Math.floor(R()*6)),sd=R()<0.5?1:-1,h=sd>0?Math.min(A.hl,B.hl):Math.min(A.hr,B.hr),o=sd*(W+0.06);const pa=[];
          quad(pa,p(A,o,0.15),p(B,o,0.15),p(B,o,h*0.8),p(A,o,h*0.8));const gg=new THREE.BufferGeometry();gg.setAttribute('position',new THREE.Float32BufferAttribute(pa,3));gg.setAttribute('uv',new THREE.Float32BufferAttribute(new Float32Array(pa.length/3*2),2));gg.computeVertexNormals();M.put(k,gg,0,0,0);}}
      for(const [arr,k] of [[fl,'concrete'],[wl,'concreteDark']]){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(arr,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(new Float32Array(arr.length/3*2),2));g.computeVertexNormals();M.put(k,g,0,0,0);}
      if(!api.ctx.bobLine)api.ctx.bobLine=rows;}
    const g=M.finish(L,0,0,0,0);g.traverse(o=>{if(o.material)o.material.side=THREE.DoubleSide;});return g;},

  // ================================================================ the Koševo stadium
  // An oval of stands round the running track: a long axis (L.axis, its bearing), the stands raking up, the
  // floodlight masts at the corners, the scoreboard, and the Olympic cauldron on its tower at the end.
  stadium(L,x,z){const M=Model(),A=L.a||118,B=L.b||84,ROWS=L.rows||14,ry=turn(L.axis||0)-Math.PI/2;
    // the site slopes: the bowl stands level at the highest ground inside it, on a plinth down to the lowest
    let g0=-1e9,gl=1e9;for(let u=-1;u<=1;u+=0.125)for(let v=-1;v<=1;v+=0.125){if(u*u+v*v>1)continue;const lx=u*A*0.95,lz=v*B*0.95,wx=x+lx*Math.cos(ry)+lz*Math.sin(ry),wz=z-lx*Math.sin(ry)+lz*Math.cos(ry),g=gh(wx,wz);g0=Math.max(g0,g);gl=Math.min(gl,g);}
    if(g0-gl>0.3)M.put('concreteDark',new THREE.CylinderGeometry(1,1,g0-gl+0.5,64).scale(A*(0.75+ROWS*0.018),1,B*(0.75+ROWS*0.018)).translate(0,-(g0-gl+0.5)/2+0.05,0),0,0,0);
    // the field and the track
    M.put('grass',new THREE.CylinderGeometry(1,1,0.2,48).scale(A*0.62,1,B*0.55),0,0,0);
    M.put('track',new THREE.RingGeometry(1,1.13,48).rotateX(-Math.PI/2).scale(A*0.62,1,B*0.55),0,0.12,0);
    // the stands: a ring of steps rising outward
    for(let r=0;r<ROWS;r++){const f=0.74+r*0.018,h=0.5+r*0.62;M.put(r%2?'concrete':'concreteDark',new THREE.CylinderGeometry(1,1,h,64,1,true).scale(A*f,1,B*f).translate(0,h/2,0),0,0,0);
      M.put('concrete',new THREE.RingGeometry(1,1+0.018/f,64).rotateX(-Math.PI/2).scale(A*f,1,B*f),0,h,0);}
    {const h=0.5+ROWS*0.62;M.put('concreteDark',new THREE.CylinderGeometry(1,1,h+2,64,1,true).scale(A*(0.74+ROWS*0.018),1,B*(0.74+ROWS*0.018)).translate(0,(h+2)/2,0),0,0,0);}
    for(const [sx,sz] of [[1,1],[-1,1],[1,-1],[-1,-1]]){const px=sx*A*0.86,pz=sz*B*0.86;M.box('steel',px,0,pz,1.2,48,1.2);M.box('steel',px,48,pz,7,4,1.0,Math.atan2(-px,-pz));}
    // the cauldron's tower at the east end (+x in the model)
    const cx=A*0.88;M.box('concrete',cx,0,0,3,26,3);M.cyl('steel',cx,26,0,1.2,2.6,2.2,16);
    const g=M.finish(L,x,g0,z,ry);
    api.ctx.cauldron={g,x:cx,y:28.4,z:0,A,B,rows:ROWS};
    return g;},
  };
}
