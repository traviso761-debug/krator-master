// Edinburgh: the buildings that are shapes rather than heights, modelled from their published dimensions on the
// shared landmark kit (src/core/landkit.js), each placed from its entry in edinburgh.json.
//
//   castle     Edinburgh Castle on the Castle Rock. The elevation tiles are too coarse to see the rock (they make it
//              forty metres short), so the model brings it: basalt cliffs from the ground up to Crown Square, on the
//              mapped outline (outline), the Esplanade ramping down to the Royal Mile, the curtain walls along the
//              cliff tops, the Half Moon Battery, the gatehouse and the Portcullis Gate, the Great Hall, the Royal
//              Palace and its tower, the National War Memorial, St Margaret's Chapel
//   stgiles    the High Kirk of St Giles: the nave, the crossing tower, the crown steeple (52 m) of eight flying ribs
//   spire      a Gothic spire on a square tower: the Hub (the Tolbooth Kirk, 72 m, the highest point of the Old Town)
//   scott      the Scott Monument (1846): a Gothic spire of 61 m in four stages, blackened sandstone, the statue of
//              Sir Walter in white marble under its arches
//   natmon     the National Monument on Calton Hill (1826): twelve Doric columns of a Parthenon never finished
//   nelson     the Nelson Monument: an upturned telescope in five stages, the time ball on its mast
//   tholos     a ring of Corinthian columns under a lantern (the Dugald Stewart Monument)
//   clock      a clock tower on a hotel's corner (the Balmoral's, 58 m, kept three minutes fast for the trains)
//   palace     the Palace of Holyroodhouse: its front of round corner towers under conical roofs
//   abbey      Holyrood Abbey: the roofless nave, its west front and the lancets
//   fountain   the Ross Fountain in Princes Street Gardens: cast iron, painted, in tiers
//
// Map data (c) OpenStreetMap contributors, ODbL. The geometry here is this project's own.
import {landkit} from '../core/landkit.js';

export function landmarks(api){
  const {THREE,animHooks,gh,nightF,hour}=api;
  const {Model,mat,turn}=landkit(api,{sandstone:0x8c8476,sandDark:0x5e574c,sootStone:0x3e3a34,slate:0x4a4e54,basalt:0x4a4640,basaltMoss:0x56603e,
    marble:0xeeebe4,glassDark:0x2a3440,ironTeal:0x2e6a68,ironGold:0xc8a040,lead:0x6a7074,clockFace:0xf2efe6,paving:0x8e8a82,grass:0x5a7a3e,mullion:0x7a7266,waterBlue:0x4a6a72,
    shopRed:0x9a2a2a,shopBlue:0x2a4a8a,shopYellow:0xd8b030,shopGreen:0x2a6a4a,shopPink:0xc85a8a,shopTeal:0x2a8a8a,shopOrange:0xd8782a,shopPurple:0x5a3a7a,flagBlue:0x1e4ab0,flagWhite:0xf4f4f4,iron:0x2a2a2c});
  const V3=THREE.Vector3,Q=new THREE.Quaternion(),E=new THREE.Euler(),UP=new V3(0,0,1);
  function beam(M,k,a,b,t){const d=new V3().subVectors(b,a),len=d.length();if(len<0.01)return;Q.setFromUnitVectors(UP,d.normalize());E.setFromQuaternion(Q,'YXZ');
    M.put(k,new THREE.BoxGeometry(t,t,len),(a.x+b.x)/2,(a.y+b.y)/2,(a.z+b.z)/2,E.y,E.x,E.z);}
  // a prism on a ring (points relative to the model), from y0 to y1, the base ring scaled out by `batter`
  function prism(M,k,ring,y0,y1,batter=1,cap=null){const n=ring.length,cx=ring.reduce((s,p)=>s+p[0],0)/n,cz=ring.reduce((s,p)=>s+p[1],0)/n,pos=[];
    const bot=ring.map(([x,z])=>[cx+(x-cx)*batter,cz+(z-cz)*batter]);
    for(let i=0;i<n;i++){const a=ring[i],b=ring[(i+1)%n],c=bot[(i+1)%n],d=bot[i];pos.push(a[0],y1,a[1],c[0],y0,c[1],b[0],y1,b[1], a[0],y1,a[1],d[0],y0,d[1],c[0],y0,c[1]);}
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(new Float32Array(pos.length/3*2),2));g.computeVertexNormals();M.put(k,g,0,0,0);
    if(cap){const tri=THREE.ShapeUtils.triangulateShape(ring.map(([x,z])=>new THREE.Vector2(x,z)),[]),cp=[];for(const f of tri)for(const k2 of [f[0],f[2],f[1]])cp.push(ring[k2][0],y1,ring[k2][1]);
      const gc=new THREE.BufferGeometry();gc.setAttribute('position',new THREE.Float32BufferAttribute(cp,3));gc.setAttribute('uv',new THREE.Float32BufferAttribute(new Float32Array(cp.length/3*2),2));gc.computeVertexNormals();M.put(cap,gc,0,0,0);}}
  // a pitched roof along x: w long, d deep, ridge h above y
  const roof=(M,k,x,y,z,w,d,h,ry=0)=>{const s=new THREE.Shape();s.moveTo(-d/2,0);s.lineTo(d/2,0);s.lineTo(0,h);s.closePath();M.put(k,new THREE.ExtrudeGeometry(s,{depth:w,bevelEnabled:false}).translate(0,0,-w/2).rotateY(Math.PI/2),x,y,z,ry);};
  // a Gothic spire: an octagonal cone with pinnacles round its foot
  const spire=(M,k,x,y,z,r,h,pin=true)=>{M.cyl(k,x,y,z,r,0.15,h,8);if(pin)for(let i=0;i<4;i++){const a=i*Math.PI/2+Math.PI/4;M.cyl(k,x+Math.cos(a)*r*1.25,y-1,z+Math.sin(a)*r*1.25,0.5,0.05,h*0.22,6);}};
  // a pointed (lancet) window at (x,y,z) facing along the model's z (ry turns it): dark glass, a mullion, the arch head
  const win=(M,x,y,z,w,h,ry)=>{M.box('glassDark',x,y,z,w,h-w*0.5,0.12,ry);M.put('glassDark',new THREE.CylinderGeometry(w*0.5,w*0.5,0.12,10,1,false,0,Math.PI).rotateX(Math.PI/2).rotateZ(Math.PI/2),x,y+h-w*0.5,z,ry,0,Math.PI/2);
    if(w>1.5)M.box('mullion',x,y,z,0.14,h-w*0.45,0.16,ry);};
  // a crenellated parapet along a straight run
  const parapet=(M,k,ax,az,bx,bz,y,h=1.2)=>{const L=Math.hypot(bx-ax,bz-az),ry=-Math.atan2(bz-az,bx-ax);M.put(k,new THREE.BoxGeometry(L,h*0.55,0.7).translate(0,h*0.275,0),(ax+bx)/2,y,(az+bz)/2,ry);
    for(let s=0.6;s<L;s+=1.4){const t=s/L;M.box(k,ax+(bx-ax)*t,y+h*0.55,az+(bz-az)*t,0.7,h*0.45,0.72,ry);}};

  return {

  // ================================================================ Edinburgh Castle
  castle(L,x,z){const M=Model(),P=api.P,ring=L.outline.map(p=>{const [px,pz]=P(p);return [px-x,pz-z];}),TOP=L.top,g0=gh(x,z),y=TOP-g0;
    // the rock and the Esplanade are in the ground (terrainRaise in edinburgh.json), the castle's buildings are the
    // mapped ones standing on it; this adds the curtain walls along the cliff tops and the Half Moon Battery
    for(let i=0;i<ring.length;i++){const a=ring[i],b=ring[(i+1)%ring.length],L2=Math.hypot(b[0]-a[0],b[1]-a[1]),ry=-Math.atan2(b[1]-a[1],b[0]-a[0]);
      M.put('sandstone',new THREE.BoxGeometry(L2+0.8,9,1.8).translate(0,4.5,0),(a[0]+b[0])/2,y-5,(a[1]+b[1])/2,ry);parapet(M,'sandstone',a[0],a[1],b[0],b[1],y+4);}
    const at=(la,lo)=>{const [px,pz]=P([la,lo]);return [px-x,pz-z];};
    {const [hx,hz]=at(...L.halfmoon);M.cyl('sandstone',hx,y-18,hz,16,17.5,26,24);M.cyl('sandDark',hx,y+8,hz,16.4,16.4,1.4,24);M.cyl('sandstone',hx+5,y+8,hz-3,7,7,9,12);
      for(let i=0;i<6;i++){const a=-1+i*0.4;M.put('iron',new THREE.CylinderGeometry(0.22,0.3,2.6,8).rotateZ(Math.PI/2),hx+Math.cos(a)*14.5,y+9.6,hz+Math.sin(a)*14.5,-a);}}   // its guns
    // the flags: the Union flag on the palace's tower, the Saltire on the Half Moon Battery
    for(const [la,lo,hh] of L.flags||[]){const [fx,fz]=at(la,lo),gy=gh(x+fx,z+fz)-g0;M.cyl('lead',fx,gy,fz,0.09,0.07,hh,6);M.box('flagBlue',fx+1.5,gy+hh-2,fz,3,1.9,0.06);
      for(const sg of [-1,1])M.put('flagWhite',new THREE.BoxGeometry(3.4,0.28,0.07),fx+1.5,gy+hh-1.05,fz,0,0,sg*0.56);}
    // Mons Meg: the great bombard of 1449 on its carriage by St Margaret's Chapel
    if(L.monsmeg){const [mx,mz]=at(...L.monsmeg),my=gh(x+mx,z+mz)-g0;M.box('sandDark',mx,my,mz,4.2,0.9,1.6);M.put('iron',new THREE.CylinderGeometry(0.62,0.7,4,14).rotateZ(Math.PI/2-0.08),mx,my+1.5,mz);
      for(const sd of [-1,1])M.put('sandDark',new THREE.CylinderGeometry(0.75,0.75,0.25,12).rotateX(Math.PI/2),mx-1,my+0.75,mz+sd*0.95);}
    return M.finish(L,x,g0,z,0);},

  // ================================================================ St Giles'
  // The nave and choir with their aisles, buttressed between tall traceried windows, a battlemented parapet with
  // pinnacles, the transepts' gables; the crossing tower with its clock; on it the crown of eight flying ribs.
  stgiles(L,x,z){const g0=gh(x,z),M=Model(),k='sootStone',LEN=62,W=24,H=17,TX=L.tower||8;
    M.box(k,0,0,0,LEN,H,W);M.box(k,0,H,0,LEN-2,4,W-12);roof(M,'lead',0,H+4,0,LEN-2,W-12,4);roof(M,'lead',0,H,0,LEN,W,2.2);   // the aisles and the clerestory over them
    for(const s2 of [-1,1]){for(let u=-LEN/2+2;u<=LEN/2-2;u+=5.6){if(Math.abs(u-TX)<8)continue;
        M.box(k,u,0,s2*(W/2+0.6),1.2,H-1,1.4);M.cyl(k,u,H-1,s2*(W/2+0.6),0.45,0.05,3.2,4);                       // a buttress and its pinnacle
        if(u+2.8<LEN/2-1){win(M,u+2.8,4,s2*(W/2+0.06),2.4,9.5,0);win(M,u+2.8,H+0.6,s2*(W/2-5.9),1.8,2.6,0);}}      // the aisle window; the clerestory's
      parapet(M,k,-LEN/2,s2*W/2,LEN/2,s2*W/2,H);
      M.box(k,TX,0,s2*15.5,14,H-1,9);roof(M,'lead',TX,H-1,s2*15.5,9,14,5,Math.PI/2);win(M,TX,4,s2*20.06,3.2,10,Math.PI/2);}   // the transepts, their great windows
    win(M,-LEN/2-0.06,4,0,4,11,Math.PI/2);win(M,LEN/2+0.06,4,0,5,12,Math.PI/2);                                   // west and east windows
    M.box(k,TX,0,0,11,38,11);for(const [a,b] of [[1,1],[-1,1],[-1,-1],[1,-1]])M.cyl(k,TX+a*5.3,38,b*5.3,0.55,0.08,4.5,6);
    parapet(M,k,TX-5.5,-5.5,TX+5.5,-5.5,38);parapet(M,k,TX-5.5,5.5,TX+5.5,5.5,38);
    for(const [a,b,ry] of [[1,0,Math.PI/2],[-1,0,Math.PI/2],[0,1,0],[0,-1,0]]){M.put('clockFace',new THREE.CylinderGeometry(1.4,1.4,0.15,20).rotateX(Math.PI/2),TX+a*5.58,30,b*5.58,ry+Math.PI/2*(b!==0?1:0));
      win(M,TX+a*5.56,20,b*5.56,1.6,6,ry);}
    const top=new V3(TX,50,0);for(let i=0;i<8;i++){const a=i*Math.PI/4,r=i%2?5.5:7.6,b=new V3(TX+Math.cos(a)*r,38.6,Math.sin(a)*r),m=new V3(TX+Math.cos(a)*r*0.55,46,Math.sin(a)*r*0.55);
      beam(M,k,b,m,0.6);beam(M,k,m,top,0.5);M.cyl(k,m.x,m.y,m.z,0.35,0.05,2.6,5);for(let c=1;c<4;c++){const q=new V3().lerpVectors(b,m,c/4);M.box(k,q.x,q.y+0.4,q.z,0.3,0.5,0.3);}}   // the ribs, crocketed
    M.cyl(k,TX,50,0,1.3,0.1,4.6,8);M.box('ironGold',TX,54.5,0,0.2,1.2,0.2);M.box('ironGold',TX,55.2,0,0.8,0.12,0.12);
    return M.finish(L,x,g0,z,turn(L.face||0));},

  // ================================================================ a Gothic spire on a square tower (the Hub)
  spire(L,x,z){const g0=gh(x,z),M=Model(),k='sootStone',T=L.tower||34,H=L.towerH||72,S=L.side||11;
    M.box(k,0,0,0,S,T,S);for(const [a,b] of [[1,1],[-1,1],[-1,-1],[1,-1]]){M.box(k,a*(S/2+0.4),0,b*(S/2+0.4),1.6,T-2,1.6);M.cyl(k,a*S/2,T,b*S/2,0.8,0.1,8,6);}
    for(const [a,b,ry] of [[1,0,Math.PI/2],[-1,0,Math.PI/2],[0,1,0],[0,-1,0]]){win(M,a*(S/2+0.05),T-14,b*(S/2+0.05),2.4,10,ry);win(M,a*(S/2+0.05),2,b*(S/2+0.05),3,8,ry);}
    // the spire, with its lucarnes and crockets
    M.cyl(k,0,T,0,S*0.42,0.15,H-T,8);for(let y=T+6;y<H-6;y+=5){const r=S*0.42*(1-(y-T)/(H-T));for(let i=0;i<8;i++){const a=i*Math.PI/4+Math.PI/8;M.box(k,Math.cos(a)*r,y,Math.sin(a)*r,0.35,0.5,0.35);}}
    for(let i=0;i<4;i++){const a=i*Math.PI/2;M.box(k,Math.cos(a)*S*0.33,T+3,Math.sin(a)*S*0.33,1.4,3,1.4,a);}
    if(L.nave){M.box(k,-S/2-L.nave/2,0,0,L.nave,14,S+6);roof(M,'slate',-S/2-L.nave/2,14,0,L.nave,S+6,5);for(let u=-S/2-3;u>-S/2-L.nave+2;u-=5)for(const s2 of [-1,1])win(M,u,3,s2*(S/2+3.05),1.8,7,0);}
    return M.finish(L,x,g0,z,turn(L.face||0));},

  // ================================================================ the Scott Monument
  // Kemp's spire: four great arched piers round Steell's statue of Scott and his dog Maida, a turret on each corner,
  // then four more stages, each with its pinnacles and its open arches, the spire crocketed to the finial.
  scott(L,x,z){const g0=gh(x,z),M=Model(),k='sootStone';
    M.box(k,0,0,0,22,1.2,22);
    for(const [a,b] of [[1,1],[-1,1],[-1,-1],[1,-1]]){M.box(k,a*6.4,1.2,b*6.4,3.8,16,3.8);M.cyl(k,a*8.6,1.2,b*8.6,1.1,1.1,18,8);M.cyl(k,a*8.6,19.2,b*8.6,1.1,0.1,9,8);
      for(let h=4;h<26;h+=5)M.box(k,a*8.6,h,b*8.6,2.6,0.3,2.6);}
    // the four arches: a pointed arch of two leaning slabs over each opening
    for(const [ax,az,ry] of [[1,0,Math.PI/2],[-1,0,Math.PI/2],[0,1,0],[0,-1,0]]){const ox=ax*6.4,oz=az*6.4;M.box(k,ox,14,oz,ry?2.2:9,3.2,ry?9:2.2);
      for(const sd of [-1,1])M.put(k,new THREE.BoxGeometry(5.4,1.2,2.2),ox+(ry?0:sd*2.2),12.2,oz+(ry?sd*2.2:0),ry,0,sd*0.75);
      M.cyl(k,ox,17.2,oz,0.5,0.05,6,5);}   // and the gablet's finial over it
    M.box(k,0,17.2,0,16,1.4,16);parapet(M,k,-8,-8,8,-8,18.6,1);parapet(M,k,-8,8,8,8,18.6,1);parapet(M,k,-8,-8,-8,8,18.6,1);parapet(M,k,8,-8,8,8,18.6,1);
    M.box('marble',0,1.2,0,3,1.6,3);M.cyl('marble',0,2.8,0,1.0,0.75,3.4,10);M.box('marble',0.35,2.8,0,1.5,1.3,2.4);M.put('marble',new THREE.SphereGeometry(0.42,10,8),0,6.5,0);M.box('marble',-1.6,1.2,0.8,1.6,0.9,0.6);   // Scott, and Maida at his feet
    let s=11.5,y=20;for(const h of [12,10,8,6.5]){M.box(k,0,y,0,s,h,s);for(const [a,b] of [[1,1],[-1,1],[-1,-1],[1,-1]]){M.cyl(k,a*s/2,y,b*s/2,0.45,0.45,h,6);M.cyl(k,a*s/2,y+h,b*s/2,0.45,0.05,4.5,5);}
      for(const [a,b,ry] of [[1,0,Math.PI/2],[-1,0,Math.PI/2],[0,1,0],[0,-1,0]])win(M,a*(s/2+0.05),y+1,b*(s/2+0.05),s*0.32,h*0.62,ry);
      y+=h;s*=0.74;}
    M.cyl(k,0,y,0,s*0.5,0.12,61-y,8);for(let yy=y+2;yy<59;yy+=2.2){const r=s*0.5*(1-(yy-y)/(61-y));for(let i=0;i<8;i++){const a=i*Math.PI/4;M.box(k,Math.cos(a)*r,yy,Math.sin(a)*r,0.25,0.3,0.25);}}
    return M.finish(L,x,g0,z,turn(L.face||0));},

  // ================================================================ the National Monument
  natmon(L,x,z){const g0=gh(x,z),M=Model(),k='sandstone',SP=4.4,CH=10.4;
    for(let i=0;i<3;i++)M.box(k,-2-i*0.5,i*0.55,0,41-i*1.4,0.55,13-i*1.2);M.box('sandDark',-6,-3,0,46,3,16);   // the stepped stylobate on its rubble podium
    const cols=[];for(let i=0;i<8;i++)cols.push([0,(i-3.5)*SP]);for(const sd of [-1,1]){cols.push([-SP,sd*3.5*SP]);cols.push([-2*SP,sd*3.5*SP]);}
    for(const [cx,cz] of cols){M.cyl(k,cx,1.65,cz,0.95,0.8,CH,16);M.cyl(k,cx,1.65+CH,cz,0.8,1.05,0.4,16);M.box(k,cx,2.05+CH,cz,2.2,0.45,2.2);
      for(let f=0;f<10;f++){const a=f/10*Math.PI*2;M.box('sandDark',cx+Math.cos(a)*0.86,1.65,cz+Math.sin(a)*0.86,0.06,CH,0.06,-a);}}   // flutes
    // the architrave, the frieze of triglyphs, the cornice
    M.box(k,-SP,2.5+CH,0,2*SP+2.4,1.4,7*SP+2.4);M.box(k,-SP,3.9+CH,0,2*SP+2.6,1.3,7*SP+2.6);
    for(let i=0;i<=14;i++){const zz=-3.5*SP+i*SP/2;M.box('sandDark',0.75,3.9+CH,zz,0.12,1.3,0.55);}
    M.box(k,-SP,5.2+CH,0,2*SP+3.2,0.5,7*SP+3.2);
    return M.finish(L,x,g0,z,turn(L.face||0));},

  // ================================================================ the Nelson Monument
  nelson(L,x,z){const g0=gh(x,z),M=Model(),k='sandstone';
    // the castellated cottage round the foot (it was a tea room), five-sided, with its door and windows
    for(let i=0;i<5;i++){const a=i*Math.PI*2/5,b=(i+1)*Math.PI*2/5,R=9.5,ax=Math.cos(a)*R,az=Math.sin(a)*R,bx=Math.cos(b)*R,bz=Math.sin(b)*R;
      M.put(k,new THREE.BoxGeometry(Math.hypot(bx-ax,bz-az)+0.6,5.6,0.9).translate(0,2.8,0),(ax+bx)/2,0,(az+bz)/2,-Math.atan2(bz-az,bx-ax));parapet(M,k,ax,az,bx,bz,5.6,1.2);
      const mx=(ax+bx)/2*1.01,mz=(az+bz)/2*1.01,ry=-Math.atan2(bz-az,bx-ax);if(i===0)M.box('glassDark',mx,0,mz,1.6,2.8,0.2,ry);else win(M,mx,1.6,mz,1.2,2.2,ry);}
    let r=4.6,y=5.6;for(const h of [9,6,5,4,3.4]){M.cyl(k,0,y,0,r,r,h,16);M.cyl(k,0,y+h,0,r+0.45,r+0.45,0.6,16);
      for(let i=0;i<6;i++){const a=i*Math.PI/3+y;win(M,Math.cos(a)*(r+0.03),y+h*0.3,Math.sin(a)*(r+0.03),0.6,h*0.35,-a+Math.PI/2);}y+=h+0.6;r*=0.82;}
    for(let i=0;i<8;i++){const a=i*Math.PI/4;M.box(k,Math.cos(a)*r*1.05,y,Math.sin(a)*r*1.05,0.9,0.9,0.9);}
    M.cyl('lead',0,y,0,0.15,0.12,6,6);M.box('lead',0,y+5.2,0,2.4,0.1,0.1);M.put('ironGold',new THREE.SphereGeometry(0.8,12,8),0,y+4.4,0);   // the mast and the time ball
    return M.finish(L,x,g0,z,0);},

  // ================================================================ a ring of columns under a lantern
  tholos(L,x,z){const g0=gh(x,z),M=Model(),k='sandstone',R=L.radius||3.6,N=L.columns||9;
    M.cyl(k,0,0,0,R+1.8,R+1.8,1.2,24);M.cyl(k,0,1.2,0,R+1.2,R+1.2,1.8,24);
    for(let i=0;i<N;i++){const a=i*Math.PI*2/N,cx=Math.cos(a)*R,cz=Math.sin(a)*R;M.cyl(k,cx,3,cz,0.4,0.35,6.4,10);M.cyl(k,cx,9.4,cz,0.5,0.36,0.6,10);}
    M.cyl(k,0,10,0,R+0.6,R+0.6,1.2,24);M.cyl(k,0,11.2,0,R*0.75,R*0.75,0.4,24);for(let i=0;i<8;i++){const a=i*Math.PI/4;M.box(k,Math.cos(a)*R*0.6,11.6,Math.sin(a)*R*0.6,0.35,1.6,0.35);}
    M.cyl(k,0,11.6,0,R*0.55,R*0.55,1.6,16);M.put(k,new THREE.SphereGeometry(R*0.56,16,8,0,Math.PI*2,0,Math.PI/2),0,13.2,0);M.cyl(k,0,15.2,0,0.3,0.05,1.4,8);
    return M.finish(L,x,g0,z,0);},

  // ================================================================ a clock tower (the Balmoral's)
  clock(L,x,z){const g0=gh(x,z),M=Model(),k='sandstone',H=L.towerH||58,S=L.side||11,y0=L.from||22;
    M.box(k,0,y0,0,S,H-y0-14,S);for(const [a,b] of [[1,1],[-1,1],[-1,-1],[1,-1]])M.box(k,a*(S/2+0.3),y0,b*(S/2+0.3),1.4,H-y0-14,1.4);
    const cy=H-18;for(const [a,b,ry] of [[1,0,0],[-1,0,0],[0,1,Math.PI/2],[0,-1,Math.PI/2]]){M.put('clockFace',new THREE.CylinderGeometry(2.2,2.2,0.2,24).rotateZ(Math.PI/2),a*(S/2+0.1),cy,b*(S/2+0.1),ry);
      for(let h=y0+3;h<cy-4;h+=3.6)win(M,a*(S/2+0.05),h,b*(S/2+0.05),1.4,2,ry+Math.PI/2);}
    for(const [a,b] of [[1,1],[-1,1],[-1,-1],[1,-1]]){M.cyl(k,a*S/2,H-14,b*S/2,1.2,1.2,5,10);M.cyl('lead',a*S/2,H-9,b*S/2,1.3,0.1,3,10);}
    M.box(k,0,H-14,0,S-2,5,S-2);M.cyl('lead',0,H-9,0,S*0.4,0.3,9,4,Math.PI/4);M.cyl('lead',0,H,0,0.08,0.08,2.4,4);
    const g=M.finish(L,x,g0,z,turn(L.face||0));
    const lit=new Set();g.traverse(q=>{if(q.isMesh&&q.material===mat('clockFace'))lit.add(q.material);});animHooks.push(()=>{const n=nightF(hour());for(const m of lit)m.emissive.setRGB(n*0.9,n*0.85,n*0.6);});
    return g;},

  // ================================================================ the Palace of Holyroodhouse: the tower front
  // James V's tower and its twin, round towers with conical roofs on their corners; the front between them of
  // three storeys of windows; the gate under a cupola with the crown on it; chimneys along the roof.
  palace(L,x,z){const g0=gh(x,z),M=Model(),k='sandstone',W=L.width||70,D=L.depth||14,H=16;
    M.box(k,0,0,0,D,H,W);roof(M,'slate',0,H,0,W,D,5,Math.PI/2);parapet(M,k,D/2,-W/2+16,D/2,W/2-16,H,1);
    for(let u=-W/2+18;u<=W/2-18;u+=3.4)for(const h of [2.5,7,11.5])win(M,D/2+0.05,h,u,1.2,2.6,Math.PI/2);
    for(let u=-W/2+20;u<W/2-18;u+=9)M.box(k,-1,H+3,u,1.4,4,2.6);
    for(const s2 of [-1,1]){M.box(k,0,0,s2*(W/2-8),D+6,22,16);for(const [a,b] of [[1,1],[1,-1]]){M.cyl(k,a*(D/2+3),0,s2*(W/2-8)+b*8,3.2,3.2,24,16);M.cyl('slate',a*(D/2+3),24,s2*(W/2-8)+b*8,3.5,0.1,6,16);M.cyl('ironGold',a*(D/2+3),30,s2*(W/2-8)+b*8,0.06,0.06,1.5,4);}
      parapet(M,k,D/2+3,s2*(W/2-8)-6,D/2+3,s2*(W/2-8)+6,22,1.2);for(const h of [4,10,15])for(const b of [-3,3])win(M,D/2+3.05,h,s2*(W/2-8)+b,1.1,2.6,Math.PI/2);}
    // the gate: paired columns, the royal arms, the cupola and the crown
    M.box(k,D/2+0.6,0,0,1.2,9,8);for(const b of [-2.6,2.6])M.cyl(k,D/2+1.4,0,b,0.45,0.4,7,10);M.box('glassDark',D/2+1.25,0,0,0.2,5,3);M.box('ironGold',D/2+1.3,6.2,0,0.2,1.6,2.2);
    M.cyl(k,0,H+3,0,2.4,2.4,4,12);M.put('lead',new THREE.SphereGeometry(2.6,14,8,0,Math.PI*2,0,Math.PI/2),0,H+7,0);M.put('ironGold',new THREE.SphereGeometry(0.6,10,8),0,H+9.8,0);
    return M.finish(L,x,g0,z,turn(L.face||0));},

  // ================================================================ Holyrood Abbey
  abbey(L,x,z){const g0=gh(x,z),M=Model(),k='sandDark',LEN=46,W=17,H=14;
    for(const s2 of [-1,1]){for(let u=-LEN/2;u<LEN/2-1;u+=5.5){M.box(k,u,0,s2*W/2,1.6,H,1.6);M.box(k,u+2.75,H-4,s2*W/2,4,1,1.2);M.box(k,u,0,s2*(W/2+1.4),1.2,H-3,1.2);}
      M.box(k,0,0,s2*W/2,LEN,3,1);for(let u=-LEN/2+2.75;u<LEN/2-3;u+=5.5)win(M,u,5,s2*(W/2+0.85),1.6,5.5,0);}
    // the west front: the great doorway, the lancets and the rose
    M.box(k,-LEN/2,0,0,2,H+6,W+2);for(const s2 of [-1,1]){M.box(k,-LEN/2,0,s2*(W/2+2),4,H+10,4);M.cyl(k,-LEN/2,H+10,s2*(W/2+2),1.2,0.1,4,8);}
    M.box('glassDark',-LEN/2-1.05,0,0,0.2,6,3.4);for(const b of [-3,0,3])win(M,-LEN/2-1.06,8,b,1.4,6,Math.PI/2);
    M.put('glassDark',new THREE.CylinderGeometry(2,2,0.2,16).rotateZ(Math.PI/2),-LEN/2-1.06,H+2.5,0);
    return M.finish(L,x,g0,z,turn(L.face||0));},

  // ================================================================ the Ross Fountain
  fountain(L,x,z){const g0=gh(x,z),M=Model();
    M.cyl('sandstone',0,0,0,7,7.4,0.8,24);M.cyl('ironTeal',0,0.8,0,1.6,2.2,2.4,12);M.cyl('ironGold',0,3.2,0,4,3.2,0.5,20);M.cyl('ironTeal',0,3.7,0,0.9,1.2,2.6,10);
    for(let i=0;i<4;i++){const a=i*Math.PI/2;M.cyl('ironGold',Math.cos(a)*1.3,3.7,Math.sin(a)*1.3,0.3,0.25,1.6,8);M.put('ironGold',new THREE.SphereGeometry(0.3,8,6),Math.cos(a)*1.3,5.6,Math.sin(a)*1.3);}   // the four seated figures
    M.cyl('ironGold',0,6.3,0,2.2,1.6,0.4,16);M.cyl('ironTeal',0,6.7,0,0.5,0.7,1.6,8);M.cyl('ironTeal',0,8.3,0,0.3,0.4,1.2,8);M.put('ironGold',new THREE.SphereGeometry(0.55,12,8),0,9.9,0);
    for(let i=0;i<4;i++){const a=i*Math.PI/2+Math.PI/4;M.cyl('ironTeal',Math.cos(a)*2.4,0.8,Math.sin(a)*2.4,0.35,0.35,2.8,8);M.put('ironGold',new THREE.SphereGeometry(0.4,8,6),Math.cos(a)*2.4,3.8,Math.sin(a)*2.4);}
    M.cyl('waterBlue',0,0.75,0,6.4,6.4,0.12,24);
    return M.finish(L,x,g0,z,0);},

  // ================================================================ a Greek temple front on a gallery (the Mound)
  // Playfair's two: the National Gallery (Ionic, 1859) and the Royal Scottish Academy (Doric, 1826) - a long
  // block of columns all round, porticoes at the ends, the RSA's sphinxes and Queen Victoria on its roof.
  temple(L,x,z){const g0=gh(x,z),M=Model(),k='sandstone',LEN=L.length||66,W=L.width||22,CH=L.columnH||9,ion=L.order==='ionic';
    M.box('sandDark',0,-2,0,LEN+4,2.6,W+4);M.box(k,0,0.6,0,LEN,1.2,W);M.box(k,0,1.8,0,LEN-4,CH+1.6,W-5);
    const col=(cx,cz)=>{M.cyl(k,cx,1.8,cz,0.62,0.55,CH,12);if(ion){M.box(k,cx,1.8+CH,cz,1.6,0.45,0.9);}else M.box(k,cx,1.8+CH,cz,1.4,0.35,1.4);};
    for(let u=-LEN/2+1.5;u<=LEN/2-1.5;u+=3.2){col(u,W/2-1);col(u,-W/2+1);}for(const sd of [-1,1])for(let v=-W/2+4;v<=W/2-4;v+=3.2)col(sd*(LEN/2-1),v);
    M.box(k,0,2.2+CH,0,LEN+0.4,2.2,W+0.4);roof(M,'lead',0,4.4+CH,0,LEN,W,3);
    for(const sd of [-1,1]){const s3=new THREE.Shape();s3.moveTo(-W/2-0.2,0);s3.lineTo(W/2+0.2,0);s3.lineTo(0,3.2);s3.closePath();M.put(k,new THREE.ExtrudeGeometry(s3,{depth:0.8,bevelEnabled:false}).rotateY(Math.PI/2),sd*(LEN/2+0.2)-0.4,4.4+CH,0);}   // the pediments
    if(L.statue){M.box(k,LEN/2-5,4.4+CH+2.6,0,2,1.6,2);M.cyl('sandDark',LEN/2-5,4.4+CH+4.2,0,0.6,0.4,2.6,8);for(const sd of [-1,1])M.box('sandDark',sd*(LEN/2-2),4.4+CH,W/2-2,2.4,1.4,1);}
    return M.finish(L,x,g0,z,turn(L.face||0));},

  // ================================================================ the Camera Obscura: the Outlook Tower
  obscura(L,x,z){const g0=gh(x,z),M=Model(),k='sandstone',H=L.towerH||26;
    M.box(k,0,0,0,14,H-6,12);for(let h=3;h<H-8;h+=3.4)for(const b of [-4,0,4])win(M,7.05,h,b,1.1,2,Math.PI/2);
    M.box(k,2,H-6,0,8,4,8);parapet(M,k,-2,-4,6,-4,H-2,1);parapet(M,k,-2,4,6,4,H-2,1);
    M.cyl('slate',2,H-2,0,2.4,2.4,1.6,16);M.put('slate',new THREE.SphereGeometry(2.5,16,8,0,Math.PI*2,0,Math.PI/2),2,H-0.4,0);M.cyl('lead',2,H+2,0,0.06,0.06,2,4);   // the dark dome of the camera
    roof(M,'slate',-4,H-6,0,8,12,3.5);
    return M.finish(L,x,g0,z,turn(L.face||0));},

  // ================================================================ a kirk with a churchyard (Greyfriars), and Bobby
  kirk(L,x,z){const g0=gh(x,z),M=Model(),k='sandDark',LEN=L.length||48,W=L.width||20,H=12;
    M.box(k,0,0,0,LEN,H,W);roof(M,'slate',0,H,0,LEN,W,7);for(const sd of [-1,1])for(let u=-LEN/2+4;u<LEN/2-3;u+=5.5){M.box(k,u-2.7,0,sd*(W/2+0.5),1,H-2,1);win(M,u,2.5,sd*(W/2+0.05),2,6.5,0);}
    for(const sd of [-1,1])win(M,sd*(LEN/2+0.05),2.5,0,3.4,8,Math.PI/2);
    // the stones of the kirkyard, leaning, and the Covenanters' Prison gate
    for(let i=0;i<60;i++){const a=i*2.399,r=W/2+5+((i*7)%17);M.box('sandDark',Math.cos(a)*(LEN/2+((i*3)%9)),0,Math.sin(a)*r,0.7,1+((i*13)%10)/8,0.18,a);}
    if(L.bobby){const [bx,bz]=api.P(L.bobby),bgx=bx-x,bgz=bz-z,gb=gh(bx,bz)-g0;M.cyl('sandstone',bgx,gb,bgz,0.5,0.6,1.6,10);M.box('lead',bgx,gb+1.6,bgz,0.45,0.35,0.2);M.put('lead',new THREE.SphereGeometry(0.12,8,6),bgx+0.25,gb+2.0,bgz);}
    return M.finish(L,x,g0,z,turn(L.face||0));},

  // ================================================================ St Mary's Episcopal Cathedral: three spires
  // Sir George Gilbert Scott's (1879): the central spire of 90 m over the crossing, the two western ones (the
  // Barbara and Mary) of 60; the nave long and high between them.
  cathedral(L,x,z){const g0=gh(x,z),M=Model(),k='sandDark',LEN=L.length||84,W=L.width||26,H=21;
    M.box(k,0,0,0,LEN,H,W);roof(M,'slate',0,H,0,LEN,W,9);for(const sd of [-1,1])for(let u=-LEN/2+5;u<LEN/2-4;u+=6){M.box(k,u-3,0,sd*(W/2+0.6),1.2,H-2,1.2);M.cyl(k,u-3,H-2,sd*(W/2+0.6),0.4,0.05,3,4);win(M,u,4,sd*(W/2+0.05),2.4,10,0);}
    const tower=(tx,tz,S,T,top)=>{M.box(k,tx,0,tz,S,T,S);for(const [a,b] of [[1,1],[-1,1],[-1,-1],[1,-1]]){M.box(k,tx+a*(S/2+0.3),0,tz+b*(S/2+0.3),1.4,T-3,1.4);M.cyl(k,tx+a*S/2,T,tz+b*S/2,0.6,0.08,5,6);}
      for(const [a,b,ry] of [[1,0,Math.PI/2],[-1,0,Math.PI/2],[0,1,0],[0,-1,0]])win(M,tx+a*(S/2+0.05),T-11,tz+b*(S/2+0.05),S*0.25,8,ry);
      M.cyl(k,tx,T,tz,S*0.45,0.15,top-T,8);for(let yy=T+5;yy<top-5;yy+=4){const r=S*0.45*(1-(yy-T)/(top-T));for(let i=0;i<8;i++){const a=i*Math.PI/4;M.box(k,tx+Math.cos(a)*r,yy,tz+Math.sin(a)*r,0.3,0.4,0.3);}}};
    tower(LEN*0.15,0,14,46,90);for(const sd of [-1,1])tower(-LEN/2+5,sd*(W/2+3),9,32,60);
    win(M,-LEN/2-0.06,5,0,5,13,Math.PI/2);
    return M.finish(L,x,g0,z,turn(L.face||0));},

  // ================================================================ a dome on a quadrangle (the Old College), the Golden Boy on it
  dome(L,x,z){const g0=gh(x,z),M=Model(),k='sandstone',S=L.side||30,H=L.towerH||18;
    M.box(k,0,0,0,S,H,S);for(const [a,b,ry] of [[1,0,Math.PI/2],[-1,0,Math.PI/2],[0,1,0],[0,-1,0]])for(let u=-S/2+3;u<=S/2-3;u+=3.6)for(const h of [3,8.5,13])win(M,a?a*(S/2+0.05):u,h,b?b*(S/2+0.05):u,1.3,2.8,ry);
    for(const b of [-4,-1.4,1.4,4])M.cyl(k,S/2+1.2,0,b,0.7,0.65,H-2,12);M.box(k,S/2+1,H-2,0,2.4,2,11);   // the portico's great columns
    M.cyl(k,0,H,0,6,6,6,20);M.put('lead',new THREE.SphereGeometry(6.2,20,10,0,Math.PI*2,0,Math.PI/2),0,H+6,0);M.cyl(k,0,H+11.6,0,1.2,1.2,2.4,10);M.cyl('lead',0,H+14,0,0.9,0.1,2,8);
    M.cyl('ironGold',0,H+16,0,0.25,0.3,2,8);M.put('ironGold',new THREE.SphereGeometry(0.3,8,6),0,H+18.3,0);M.box('ironGold',0.3,H+17.2,0,0.12,1.6,0.12);   // the Golden Boy with his torch
    return M.finish(L,x,g0,z,turn(L.face||0));},

  // ================================================================ the City Observatory on Calton Hill
  observatory(L,x,z){const g0=gh(x,z),M=Model(),k='sandstone';
    M.box(k,0,0,0,18,6,18);for(const [a,b,ry] of [[1,0,Math.PI/2],[-1,0,Math.PI/2],[0,1,0],[0,-1,0]]){M.box(k,a*10,0,b*10,a?2:6,7,b?2:6);for(const c of [-1.5,1.5])M.cyl(k,a*11+(b?c:0),0,b*11+(a?c:0),0.35,0.3,6,8);}
    M.cyl(k,0,6,0,3.4,3.4,2.6,16);M.put('lead',new THREE.SphereGeometry(3.5,16,8,0,Math.PI*2,0,Math.PI/2),0,8.6,0);
    for(const [a,b] of [[1,1],[-1,-1]])M.cyl(k,a*14,0,b*14,2,2,5,12);
    return M.finish(L,x,g0,z,turn(L.face||0));},

  // ================================================================ Victoria Street's shopfronts: painted, in a curve
  // The bow of Victoria Street down to the Grassmarket, its shopfronts painted every colour; the terrace over them
  // with its railing. Placed along the street (line): a shopfront every few metres on the north side's buildings.
  colourstreet(L,x,z){const g0=gh(x,z),M=Model(),pts=L.line.map(p=>{const [px,pz]=api.P(p);return [px-x,pz-z];}),off=L.offset||7,W=L.shop||5.4;let n=0;
    const COLS=['shopRed','shopBlue','shopYellow','shopGreen','shopPink','shopTeal','shopOrange','shopPurple'];
    for(const side of L.sides||[1]){for(let i=0;i+1<pts.length;i++){const [ax,az]=pts[i],[bx,bz]=pts[i+1],len=Math.hypot(bx-ax,bz-az),ux=(bx-ax)/len,uz=(bz-az)/len,ry=-Math.atan2(uz,ux);
      for(let u=W/2;u<len;u+=W+0.4){const px=ax+ux*u-uz*off*side,pz=az+uz*u+ux*off*side,gy=gh(px+x,pz+z)-g0,c=COLS[(n++*5)%COLS.length];
        M.box(c,px,gy,pz,W,3.6,0.35,ry);M.box('glassDark',px+uz*0.2*side,gy+0.5,pz-ux*0.2*side,W*0.62,2.2,0.12,ry);M.box('ironGold',px+uz*0.2*side,gy+3.0,pz-ux*0.2*side,W*0.7,0.4,0.1,ry);}}}
    return M.finish(L,x,g0,z,0);},

  };
}
