// ---------- Chernobyl: the Zone's landmark models ----------
// The map draws the plant's halls, Pripyat's blocks and Chernobyl town's houses; this adds what a box cannot be:
//   arch     the New Safe Confinement over Reactor 4: a steel arch 257 m across, 108 m high and 162 m long, clad in
//            stainless steel in bands, closed at its ends by walls fitted round the old buildings. It was built to the
//            west of the reactor and slid 327 m along its rails over it in November 2016, so its length runs east-west
//   tower    a cooling tower left unfinished when units 5 and 6 were abandoned: a hyperboloid shell of concrete,
//            thinning as it rises, on a ring beam carried by a zigzag of diagonal columns over the basin; its lifts
//            in bands of different grey and stained below the rim; rusted rebar out of the unfinished edge, and on
//            part of it (L.formwork) the climbing formwork with its decks, the panels for the next lift and a jib
//            crane (L.h its full height, L.built how much of it stands, L.r the shell's radius at its foot)
//   wheel    the Ferris wheel of Pripyat's amusement park, 26 m across, its yellow gondolas: the park was to open on
//            1 May 1986 and never did
//   duga     an array of the Duga over-the-horizon radar: masts of lattice steel in a line (L.len m, L.h m high)
//            carrying a wall of dipoles on the front and a screen of wire behind; it looked north over the pole for
//            the launches of American missiles, and radio hams round the world knew its tapping as the Woodpecker
//   emblem   the Soviet coat of arms in steel on the roof of a sixteen-storey block: the globe, the hammer and sickle
//            and the wreath on a frame (L.h the roof's height, or the mapped block's)
//   angel    the Wormwood Star: the bronze angel blowing a trumpet, made for the twenty-fifth year (2011)
//   plant    the main building of units 1 to 3, east of the arch, which the map draws as a few flat boxes. Laid out
//            from its mapped footprints in RBMK proportions, all in lat/lon on the landmark (L.hall, L.units, ...):
//            the turbine hall along the south, some 770 m from under the arch to the east end, 31 m high, its long
//            walls glazed in two bands between pilasters, a roof lantern down its length; the deaerator bays, a
//            47 m slab along its north side for each pair of units; the reactor blocks north of them, 44 m, each
//            with its reactor hall on top to 71 m, ribbed in vertical panels, and stair towers at the corners; block
//            B between units 1 and 2; unit 3's roof where the ventilation stack stood; and the units' transformers
//            in walled bays along the south wall; and the chimney north of block B, round, at its mapped height
// Map data (c) OpenStreetMap contributors, ODbL.
import {landkit} from '../core/landkit.js';

export function landmarks(api){
  const {THREE,gh}=api;
  const {Model,turn}=landkit(api,{steel:0xd2d6da,steelDark:0x9aa2a8,steelWall:0x8a9096,concrete:0xa8a49c,concreteDark:0x8a867e,scaffold:0x6a5a4a,
    rust:0x6e5444,concreteStain:0x8e8a82,concreteFresh:0xb6b2a8,puddle:0x3a4446,rustDark:0x4e3c30,wheelYellow:0xe8c02a,wheelFrame:0xd8d0b8,wheelRed:0xb84a3a,
    sovietRed:0xa83a2e,sovietGold:0xc8a03a,bronze:0x5a4a38,plinth:0x8a8478,panel:0xd2d0c8,panelDark:0xaeaca4,rib:0xbab8b0,glazing:0x46505a,roofGrey:0x8a8884,trans:0x5e665a,dark:0x2a2620});
  // a half-ellipse ring as a shape (across x, up y), `a` and `b` its outer half-width and height, `t` the depth of its frame
  const archShape=(a,b,t,n=48)=>{const s=new THREE.Shape();for(let i=0;i<=n;i++){const u=Math.PI*i/n;s.lineTo(Math.cos(u)*a,Math.sin(u)*b);}
    for(let i=n;i>=0;i--){const u=Math.PI*i/n;s.lineTo(Math.cos(u)*(a-t),Math.sin(u)*(b-t));}return s;};
  return {
  arch(L,x,z){const g0=gh(x,z),M=Model(),A=(L.span||257)/2,H=L.h||108,LEN=L.len||162,T=12;
    M.put('steel',new THREE.ExtrudeGeometry(archShape(A,H,T),{depth:LEN,bevelEnabled:false,curveSegments:48}).translate(0,0,-LEN/2),0,0,0);
    // the cladding's bands, a little proud of the skin, and the ends' heavier ribs
    const band=new THREE.ExtrudeGeometry(archShape(A+0.4,H+0.4,T+0.8),{depth:0.9,bevelEnabled:false});
    for(let k=0;k<=LEN;k+=LEN/12)M.put(k===0||k>=LEN-0.1?'steelDark':'steelDark',band,0,0,k-LEN/2-0.45);
    // the end walls: steel panels on a frame inside the arch, a band of louvres along their top, the cranes' doors below
    const wall=new THREE.Shape();for(let i=0;i<=48;i++){const u=Math.PI*i/48;wall.lineTo(Math.cos(u)*(A-T),Math.sin(u)*(H-T));}
    const wg=new THREE.ShapeGeometry(wall,24);
    for(const s of [-1,1]){M.put('steelWall',wg,0,0,s*(LEN/2-3));M.put('steelWall',wg.clone().rotateY(Math.PI),0,0,s*(LEN/2-3.05));
      for(let k=-5;k<=5;k++)M.box('steelDark',k*(A-T)/6,0,s*(LEN/2-2.5),0.8,Math.sqrt(Math.max(0,1-(k/6)**2))*(H-T),0.8);
      M.box('dark',0,2,s*(LEN/2-2.2),24,22,0.4);}
    // the rails it slid on, running on past its west end, and the service buildings along its foot
    for(const s of [-1,1]){M.box('concreteDark',s*(A-T/2),0,-LEN/2-60,6,1.2,LEN+120);M.box('concrete',s*(A+9),0,0,14,9,LEN*0.8);}
    return M.finish(L,x,g0,z,turn(L.face==null?90:L.face));},

  tower(L,x,z){const g0=gh(x,z),M=Model(),H=L.h||150,R0=L.r||58,LEG=L.legs||9,top=L.built==null?0.72:L.built,V=THREE.Vector2;
    // the hyperboloid, its throat `a` at yt: R0 where the shell leaves the columns' ring beam, at LEG
    const yt=H*0.78,a=R0*0.6,c=(yt-LEG)/Math.sqrt((R0/a)**2-1),rAt=y=>a*Math.sqrt(1+((y-yt)/c)**2),thick=y=>0.9-0.6*Math.min(1,(y-LEG)/(H-LEG));
    const hb=LEG+(H-LEG)*top,NS=48,lathe=(k,pts,seg=96,p0=0,pl=Math.PI*2)=>M.put(k,new THREE.LatheGeometry(pts,seg,p0,pl),0,0,0);
    // the shell, outside up, over the lip and down the inside (thinning as it rises)
    {const p=[];for(let i=0;i<=NS;i++){const y=LEG+(hb-LEG)*i/NS;p.push(new V(rAt(y),y));}for(let i=NS;i>=0;i--){const y=LEG+(hb-LEG)*i/NS;p.push(new V(rAt(y)-thick(y),y));}lathe('concrete',p);}
    // the seasons' pours show as bands of a different grey, a few centimetres proud
    const band=(k,y0,y1,d=0.05,p0=0,pl=Math.PI*2,seg=96)=>{const p=[];for(let i=0;i<=4;i++){const y=y0+(y1-y0)*i/4;p.push(new V(rAt(y)+d,y));}lathe(k,p,seg,p0,pl);};
    let y=LEG+2;for(let k=0;y<hb-1;k++){const h=6+((k*53)%7)*2.2,y1=Math.min(hb-0.5,y+h);if(k%2)band(k%4===1?'concreteStain':'concreteFresh',y,y1);y=y1;}
    // the stains run down from the rim, where the rain comes off the unfinished edge
    for(let k=0;k<40;k++){const p=((k*0.618)%1)*Math.PI*2,w=0.002+((k*37)%5)*0.0012,len=4+((k*71)%9)*(2+((k*13)%4)*2);band('concreteStain',Math.max(LEG,hb-len),hb-0.2,0.08,p,w,2);}
    // the ring beam the shell starts on, and the diagonal columns under it in a zigzag
    {const p=[new V(R0-1.2,LEG-1.6),new V(R0+0.8,LEG-1.6),new V(R0+0.8,LEG+0.6),new V(R0-1.2,LEG+0.6),new V(R0-1.2,LEG-1.6)];lathe('concreteDark',p);}
    const strut=(k,ax,ay,az,bx,by,bz,r)=>{const A=new THREE.Vector3(ax,ay,az),B=new THREE.Vector3(bx,by,bz),L2=A.distanceTo(B),g=new THREE.CylinderGeometry(r,r,L2,6);
      g.applyMatrix4(new THREE.Matrix4().makeRotationFromQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),B.clone().sub(A).normalize())));g.translate((ax+bx)/2,(ay+by)/2,(az+bz)/2);M.put(k,g,0,0,0);};
    const NL=L.columns||40,rb=rAt(0)+1.5;
    for(let j=0;j<NL;j++){const ta=j/NL*Math.PI*2,ga=(j+0.5)/NL*Math.PI*2,tb=(j+1)/NL*Math.PI*2;
      for(const t of [ta,tb])strut('concreteDark',Math.cos(ga)*rb,0,Math.sin(ga)*rb,Math.cos(t)*R0,LEG-1.6,Math.sin(t)*R0,0.55);
      M.box('concreteDark',Math.cos(ga)*rb,0,Math.sin(ga)*rb,2.4,0.8,2.4,-ga);}   // the footings
    // the basin's wall round the foot, its floor, and the rain standing on it
    {const r=rb+4;lathe('concrete',[new V(r,0),new V(r+0.5,0),new V(r+0.5,1.8),new V(r,1.8),new V(r,0)],64);
      M.put('concreteDark',new THREE.CircleGeometry(r,48).rotateX(-Math.PI/2),0,0.06,0);
      for(let k=0;k<7;k++){const p=k*2.3,d=((k*0.37)%1)*r*0.7;M.put('puddle',new THREE.CircleGeometry(3+((k*13)%5)*1.6,16).rotateX(-Math.PI/2),Math.cos(p)*d,0.1,Math.sin(p)*d,0,0,0,[1,1,0.6]);}}
    // the rim: the climbing formwork left over part of it (L.formwork: [start, length] in degrees), rusted rebar standing out of the rest
    const rr=rAt(hb),tt=thick(hb),FW=L.formwork||null,f0=FW?FW[0]*Math.PI/180:0,f1=FW?f0+FW[1]*Math.PI/180:0,inFW=p=>FW&&((p-f0+Math.PI*4)%(Math.PI*2))<f1-f0;
    for(let k=0,n=Math.round(rr*Math.PI*2/1.6);k<n;k++){const p=k/n*Math.PI*2;if(inFW(p))continue;const h=1+((k*29)%7)*0.18;
      for(const d of [0.12,tt-0.12])M.box('rustDark',Math.cos(p)*(rr-d),hb,Math.sin(p)*(rr-d),0.1,h,0.1);}
    if(FW){const n=Math.round(rr*(f1-f0)/2.5);
      for(let k=0;k<=n;k++){const p=f0+(f1-f0)*k/n,cp=Math.cos(p),sp=Math.sin(p),ry=-p+Math.PI/2;
        for(const [d,w] of [[-1.6,2.6],[tt+1.6,2.6]]){const r=rr-d;
          M.box('rust',cp*r,hb-1.2,sp*r,2.6,0.25,w,ry);M.box('rust',cp*r,hb-4.2,sp*r,2.6,0.25,w,ry);   // the two decks
          M.box('rustDark',cp*(r+(d<0?1.2:-1.2)),hb-4.2,sp*(r+(d<0?1.2:-1.2)),0.12,5.4,0.12,ry);}   // their hangers and rails
        for(const d of [-0.1,tt+0.1])M.box('scaffold',cp*(rr-d),hb,sp*(rr-d),2.4,2.6,0.2,ry);}   // the panels for the next lift, never poured
      // the jib crane on the formwork, its arm out over the inside
      const pm=(f0+f1)/2,cx=Math.cos(pm)*(rr+1.6),cz=Math.sin(pm)*(rr+1.6),ix=-Math.cos(pm),iz=-Math.sin(pm);
      M.box('rust',cx,hb-1,cz,1.6,14,1.6,-pm);M.box('rust',cx+ix*9,hb+12,cz+iz*9,18,1.1,1.1,-pm);M.box('rustDark',cx-ix*3,hb+11.5,cz-iz*3,3,2,2,-pm);
      M.box('rustDark',cx+ix*16,hb+3,cz+iz*16,0.08,9,0.08);}
    return M.finish(L,x,g0,z,0);},

  wheel(L,x,z){const g0=gh(x,z),M=Model(),R=L.r||13,AX=R+1.6,N=16;
    // the A-frames and the axle
    for(const s of [-1,1]){M.put('wheelFrame',new THREE.BoxGeometry(0.5,AX+0.6,0.5).translate(0,(AX+0.6)/2,0),-4.5,0,s*2.2,0,0,-0.25);M.put('wheelFrame',new THREE.BoxGeometry(0.5,AX+0.6,0.5).translate(0,(AX+0.6)/2,0),4.5,0,s*2.2,0,0,0.25);}
    M.put('wheelFrame',new THREE.CylinderGeometry(0.35,0.35,4.8,10).rotateX(Math.PI/2),0,AX,0);
    // two rims and their spokes
    for(const s of [-1,1]){M.put('wheelRed',new THREE.TorusGeometry(R,0.22,6,64),0,AX,s*0.9);M.put('wheelFrame',new THREE.TorusGeometry(R*0.42,0.14,6,32),0,AX,s*0.9);
      for(let k=0;k<N;k++){const a=k/N*Math.PI*2;M.put('wheelFrame',new THREE.BoxGeometry(0.14,R,0.14).translate(0,R/2,0),0,AX,s*0.9,0,0,a);}}
    // the gondolas, hanging plumb: yellow, open-sided, a roof like a hat
    for(let k=0;k<N;k++){const a=k/N*Math.PI*2,gx=Math.sin(a)*R,gy=AX+Math.cos(a)*R-2.3;
      M.box('wheelYellow',gx,gy,0,1.7,1.0,1.5);M.box('wheelYellow',gx,gy+2.0,0,1.9,0.15,1.7);M.put('wheelYellow',new THREE.ConeGeometry(1.25,0.5,4).rotateY(Math.PI/4),gx,gy+2.4,0);
      for(const c of [-0.75,0.75])M.box('wheelFrame',gx+c,gy+1.0,0,0.08,1.0,0.08);M.box('wheelFrame',gx,gy+2.15,0,0.1,0.35,0.1);}
    return M.finish(L,x,g0,z,turn(L.face||0));},

  duga(L,x,z){const g0=gh(x,z),M=Model(),LEN=L.len||540,H=L.h||150,D=L.depth||28,SP=L.mast||18;
    // the masts: four legs, a horizontal tie every 7.5 m, a diagonal in every bay of the front and back
    for(let u=-LEN/2;u<=LEN/2+0.1;u+=SP){for(const zz of [-D/2,D/2])for(const xx of [-1.4,1.4])M.box('rust',u+xx,0,zz,0.45,H,0.45);
      for(let y=7.5;y<H;y+=7.5){M.box('rustDark',u,y,0,0.25,0.25,D);for(const zz of [-D/2,D/2])M.box('rustDark',u,y,zz,3.2,0.25,0.25);}}
    // the girders along the line, and the wall of dipoles on the front: a grid of crossed elements
    for(let y=6;y<H;y+=12)for(const zz of [-D/2,D/2])M.box(zz>0?'rust':'rustDark',0,y,zz,LEN,0.35,0.35);
    for(let u=-LEN/2+SP/2;u<LEN/2;u+=SP/3)for(let y=10;y<H-6;y+=11){M.put('rust',M.cached('dip',()=>new THREE.BoxGeometry(0.16,6.5,0.16)),u,y,D/2+2.2,0,0,0.78);M.put('rust',M.cached('dip',()=>new THREE.BoxGeometry(0.16,6.5,0.16)),u,y,D/2+2.2,0,0,-0.78);}
    // the reflecting screen behind: vertical wires the length of the array
    for(let u=-LEN/2;u<LEN/2;u+=3)M.box('rustDark',u,4,-D/2-1.5,0.06,H-8,0.06);
    for(let u=-LEN/2;u<=LEN/2+0.1;u+=SP)M.box('concreteDark',u,0,0,6,1.5,D+6);   // the footings
    return M.finish(L,x,g0,z,turn(L.face||0));},

  emblem(L,x,z){const g0=gh(x,z),M=Model(),y=L.h||(api.roofAt&&api.roofAt(x,z))||48,S=L.size||9;
    M.box('rustDark',-S*0.42,y,0,0.4,S*0.5,0.4);M.box('rustDark',S*0.42,y,0,0.4,S*0.5,0.4);M.box('rustDark',0,y+S*0.25,0,S*0.95,0.3,0.3);   // the frame on the roof
    const cy=y+S*0.55+S*0.42;
    M.put('sovietGold',new THREE.TorusGeometry(S*0.36,0.2,6,32),0,cy,0);                                 // the globe's rim
    for(let k=-2;k<=2;k++)M.box('sovietGold',0,cy+k*S*0.12-0.1,0,Math.sqrt(1-(k*0.33)**2)*S*0.7,0.12,0.12);  // its parallels
    M.put('sovietGold',new THREE.TorusGeometry(S*0.5,0.28,6,24,Math.PI*1.4),0,cy,0.2,0,0,-Math.PI*0.2);     // the wreath
    M.put('sovietRed',new THREE.TorusGeometry(S*0.22,0.3,6,20,Math.PI*1.3),-0.4,cy+0.2,0.5,0,0,0.6);       // the sickle
    M.put('sovietRed',new THREE.BoxGeometry(0.35,S*0.5,0.35),0.4,cy,0.5,0,0,-0.7);M.put('sovietRed',new THREE.BoxGeometry(1.6,0.6,0.4),1.3,cy+1.5,0.5,0,0,-0.7);   // the hammer
    M.put('sovietRed',new THREE.ConeGeometry(0.8,1.4,5),0,cy+S*0.58,0);                                    // the star
    return M.finish(L,x,g0,z,turn(L.face||0));},

  plant(L,x,z){const g0=gh(x,z),M=Model();
    // a rectangle [south, west, north, east] in lat/lon to local [x0, z0, x1, z1] (z grows south)
    const R=([s,w,n,e])=>{const [x0,z1]=api.P([s,w]),[x1,z0]=api.P([n,e]);return [x0-x,z0-z,x1-x,z1-z];};
    const block=(k,r,y0,y1)=>M.box(k,(r[0]+r[2])/2,y0,(r[1]+r[3])/2,r[2]-r[0],y1-y0,r[3]-r[1]);
    // things along one face of a rectangle: f is 'N', 'S', 'E' or 'W'; fn(u, along, out) per step from one end to the other
    const along=(r,f,step,fn,inset=2)=>{const ew=f==='N'||f==='S',a0=ew?r[0]:r[1],a1=ew?r[2]:r[3],o=f==='N'?r[1]:f==='S'?r[3]:f==='E'?r[2]:r[0],sg=f==='N'||f==='W'?-1:1;
      for(let u=a0+inset;u<=a1-inset+0.01;u+=step)fn(u,ew,o,sg);};
    const rib=(k,r,f,step,y0,y1,w=0.9,d=0.6)=>along(r,f,step,(u,ew,o,sg)=>M.box(k,ew?u:o+sg*d/2,y0,ew?o+sg*d/2:u,ew?w:d,y1-y0,ew?d:w));
    const band=(k,r,f,y0,h,end=3)=>{const ew=f==='N'||f==='S',o=f==='N'?r[1]:f==='S'?r[3]:f==='E'?r[2]:r[0],sg=f==='N'||f==='W'?-1:1,len=(ew?r[2]-r[0]:r[3]-r[1])-end*2;
      M.box(k,ew?(r[0]+r[2])/2:o+sg*0.15,y0,ew?o+sg*0.15:(r[1]+r[3])/2,ew?len:0.3,h,ew?0.3:len);};
    const parapet=(r,y,k='panelDark')=>{for(const f of ['N','S']){const o=f==='N'?r[1]:r[3];M.box(k,(r[0]+r[2])/2,y,o,r[2]-r[0],1.2,0.5);}for(const f of ['E','W']){const o=f==='E'?r[2]:r[0];M.box(k,o,y,(r[1]+r[3])/2,0.5,1.2,r[3]-r[1]);}};
    // ---- the turbine hall ----
    const TH=R(L.hall||[51.38868,30.1001,51.38914,30.1088]),HT=L.hallH||31;
    block('panel',TH,0,HT);parapet(TH,HT);
    for(const f of ['S','N']){rib('panelDark',TH,f,12,0,HT,1.4,0.9);band('glazing',TH,f,7,6);band('glazing',TH,f,17,9);band('panelDark',TH,f,HT-3,0.8);}
    rib('panelDark',TH,'E',12,0,HT,1.4,0.9);band('glazing',TH,'E',17,9,6);M.box('dark',TH[2]+0.3,0,(TH[1]+TH[3])/2,0.4,9,10);   // the rail doors at the east end
    {const cz=(TH[1]+TH[3])/2;M.box('roofGrey',(TH[0]+TH[2])/2,HT,cz,TH[2]-TH[0]-8,2.8,7);M.box('glazing',(TH[0]+TH[2])/2,HT+0.6,cz,TH[2]-TH[0]-9,1.6,7.3);   // the lantern
      for(let u=TH[0]+20;u<TH[2]-10;u+=24)for(const dz of [-14,14])M.cyl('roofGrey',u,HT,cz+dz,1.3,1.1,3.2,8);}   // roof vents
    // ---- the deaerator bays, one for each pair of units ----
    for(const d of (L.deaerators||[[51.38914,30.1001,51.38926,30.1019],[51.38914,30.1038,51.38926,30.1076]])){const r=R(d),H=L.deaeratorH||47;
      block('panel',r,0,H);parapet(r,H);for(const f of ['S','N']){rib('panelDark',r,f,6,HT,H,0.8,0.5);for(let y=HT+3;y<H-3;y+=5)band('glazing',r,f,y,1.6);}
      for(const f of ['E','W']){rib('panelDark',r,f,4,0,H,0.8,0.5);}
      for(let u=r[0]+15;u<r[2]-10;u+=30)M.box('roofGrey',u,H,(r[1]+r[3])/2,8,2.5,6);}
    // ---- the reactor blocks and their halls ----
    for(const U of (L.units||[])){const r=R(U.base),hall=R(U.hall),BH=U.h||44,TOP=U.top||71;
      block('panel',r,0,BH);parapet(r,BH);for(const f of ['N','S','E','W'])rib('rib',r,f,6,0,BH,0.7,0.4);
      for(const f of ['N','E','W'])for(let y=6;y<BH-4;y+=9)band('panelDark',r,f,y,0.6);
      // the reactor hall: windowless, the joints of its tall panels standing out, a deeper band at the eaves
      block('panel',hall,BH,TOP);parapet(hall,TOP);for(const f of ['N','S','E','W']){rib('rib',hall,f,3,BH,TOP-2,0.5,0.35,);band('panelDark',hall,f,TOP-3,1.6,0);}
      M.box('roofGrey',(hall[0]+hall[2])/2,TOP,(hall[1]+hall[3])/2,hall[2]-hall[0]-6,1.6,hall[3]-hall[1]-10);   // the crane hall's roof deck
      // stair and lift towers at the block's north corners, a little over its roof
      for(const sx of [r[0]+5,r[2]-5]){M.box('panelDark',sx,0,r[1]+5,8,BH+7,8);M.box('glazing',sx,6,r[1]+0.9,1.4,BH-4,0.3);}
      if(U.stack){const [sx,sz]=api.P(U.stack);M.box('roofGrey',sx-x,BH,sz-z,16,1.4,16);M.cyl('panelDark',sx-x,BH+1.4,sz-z,5.6,5.6,0.8,16);}   // where a stack stood: its plinth
      for(let u=r[0]+10;u<r[2]-6;u+=14)M.box('roofGrey',u,BH,(r[1]+r[3])/2+12,5,3,5);}
    for(const b of (L.blocks||[])){const r=R(b.at),H=b.h||30;block('panel',r,0,H);parapet(r,H);for(const f of ['N','S'])rib('rib',r,f,6,0,H,0.7,0.4);for(let y=5;y<H-3;y+=7)for(const f of ['N','E','W'])band('glazing',r,f,y,1.2);}
    // chimneys at their mapped heights: a tapering concrete shaft, ringed, with its access ladder's cage
    for(const c of (L.chimneys||[])){const [cx,cz]=api.P(c.at),H=c.h||50,r=c.r||4.5;M.cyl('panelDark',cx-x,0,cz-z,r,r*0.62,H,16);
      for(let y=10;y<H;y+=10)M.cyl('roofGrey',cx-x,y,cz-z,r*(1-0.38*y/H)+0.35,r*(1-0.38*y/H)+0.35,0.6,16);M.box('rustDark',cx-x+r*0.75,0,cz-z,0.8,H,0.8);}
    // ---- the transformers in walled bays along the south wall ----
    for(const [la,lo] of (L.transformers||[])){const [tx,tz]=api.P([la,lo]),cx=tx-x,cz=tz-z;
      for(let k=0;k<3;k++){const u=cx+(k-1)*14;M.box('trans',u,0,cz,6,5,4.5);M.box('dark',u,5,cz,1.2,2.2,1.2);for(const s of [-1,1])M.box('trans',u+s*2.6,1,cz+2.5,0.4,4,0.6);
        M.box('concrete',u+7,0,cz,0.6,7,8);}M.box('concrete',cx-21,0,cz,0.6,7,8);M.box('concreteDark',cx,0,cz,44,0.3,10);}
    return M.finish(L,x,g0,z,0);},

  angel(L,x,z){const g0=gh(x,z),M=Model();
    M.box('plinth',0,0,0,3.4,2.2,3.4);M.cyl('plinth',0,2.2,0,0.5,0.4,1.4,8);
    const y=3.6;M.cyl('bronze',0,y,0,0.55,0.25,3.4,8);M.put('bronze',new THREE.SphereGeometry(0.3,8,6),0,y+3.7,0);   // the robe and the head
    for(const s of [-1,1])M.put('bronze',new THREE.BoxGeometry(0.1,3.6,1.6).translate(0,1.4,-0.8),s*0.35,y+1.6,-0.2,s*0.5,0.35,0);   // the wings, swept back
    M.put('bronze',new THREE.ConeGeometry(0.28,2.4,8).rotateZ(-Math.PI/2.4).translate(0.9,0,0),0.2,y+3.7,0.35);   // the trumpet, raised
    return M.finish(L,x,g0,z,turn(L.face||0));},
  };
}
