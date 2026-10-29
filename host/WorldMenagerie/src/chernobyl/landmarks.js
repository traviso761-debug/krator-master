// ---------- Chernobyl: the Zone's landmark models ----------
// The map draws the plant's halls, Pripyat's blocks and Chernobyl town's houses; this adds what a box cannot be:
//   arch     the New Safe Confinement over Reactor 4: a steel arch 257 m across, 108 m high and 162 m long, clad in
//            stainless steel in bands, closed at its ends by walls fitted round the old buildings. It was built to the
//            west of the reactor and slid 327 m along its rails over it in November 2016, so its length runs east-west
//   tower    a cooling tower left unfinished when units 5 and 6 were abandoned: a hyperboloid shell of concrete, its
//            top ragged where the pours stopped and its scaffold still standing (L.h its height, L.r its base radius)
//   wheel    the Ferris wheel of Pripyat's amusement park, 26 m across, its yellow gondolas: the park was to open on
//            1 May 1986 and never did
//   duga     an array of the Duga over-the-horizon radar: masts of lattice steel in a line (L.len m, L.h m high)
//            carrying a wall of dipoles on the front and a screen of wire behind; it looked north over the pole for
//            the launches of American missiles, and radio hams round the world knew its tapping as the Woodpecker
//   emblem   the Soviet coat of arms in steel on the roof of a sixteen-storey block: the globe, the hammer and sickle
//            and the wreath on a frame (L.h the roof's height, or the mapped block's)
//   angel    the Wormwood Star: the bronze angel blowing a trumpet, made for the twenty-fifth year (2011)
// Map data (c) OpenStreetMap contributors, ODbL.
import {landkit} from '../core/landkit.js';

export function landmarks(api){
  const {THREE,gh}=api;
  const {Model,turn}=landkit(api,{steel:0xd2d6da,steelDark:0x9aa2a8,steelWall:0x8a9096,concrete:0xa8a49c,concreteDark:0x8a867e,scaffold:0x6a5a4a,
    rust:0x6e5444,rustDark:0x4e3c30,wheelYellow:0xe8c02a,wheelFrame:0xd8d0b8,wheelRed:0xb84a3a,
    sovietRed:0xa83a2e,sovietGold:0xc8a03a,bronze:0x5a4a38,plinth:0x8a8478,dark:0x2a2620});
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

  tower(L,x,z){const g0=gh(x,z),M=Model(),H=L.h||150,R0=L.r||58,top=L.built==null?0.72:L.built,pts=[];
    // a hyperboloid: the throat two-thirds up, the shell a few metres thick
    const yt=H*0.72,a=R0*0.62,c=yt/Math.sqrt((R0/a)**2-1),rAt=y=>a*Math.sqrt(1+((y-yt)/c)**2);   // the throat `a` at yt, R0 at the foot
    const hb=H*top;for(let i=0;i<=24;i++){const y=hb*i/24;pts.push(new THREE.Vector2(rAt(y),y));}for(let i=24;i>=0;i--){const y=hb*i/24;pts.push(new THREE.Vector2(rAt(y)-0.8,y));}
    M.put('concrete',new THREE.LatheGeometry(pts,64),0,0,0);
    // the ragged top: the last pours stopped at different heights round the ring
    for(let k=0;k<90;k++){const a=k/90*Math.PI*2,h=Math.max(0,Math.sin(a*3+1)*2.2+Math.sin(a*7)*1.4),r=rAt(hb)-0.4;if(h>0.3)M.box('concrete',Math.cos(a)*r,hb,Math.sin(a)*r,rAt(hb)*0.075,h,0.8,-a+Math.PI/2);}
    // the diagonal legs it stands on, and the scaffold left on the climbing formwork
    for(let k=0;k<44;k++){const a=k/44*Math.PI*2;M.put('concreteDark',new THREE.BoxGeometry(1.2,9,1.2).translate(0,4.5,0),Math.cos(a)*R0,0,Math.sin(a)*R0,-a,0,0.35);}
    for(let k=0;k<6;k++){const a=k/6*Math.PI*2+0.3,r=rAt(hb)+2;M.box('scaffold',Math.cos(a)*r,hb-12,Math.sin(a)*r,2.4,16,2.4,-a);}
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

  angel(L,x,z){const g0=gh(x,z),M=Model();
    M.box('plinth',0,0,0,3.4,2.2,3.4);M.cyl('plinth',0,2.2,0,0.5,0.4,1.4,8);
    const y=3.6;M.cyl('bronze',0,y,0,0.55,0.25,3.4,8);M.put('bronze',new THREE.SphereGeometry(0.3,8,6),0,y+3.7,0);   // the robe and the head
    for(const s of [-1,1])M.put('bronze',new THREE.BoxGeometry(0.1,3.6,1.6).translate(0,1.4,-0.8),s*0.35,y+1.6,-0.2,s*0.5,0.35,0);   // the wings, swept back
    M.put('bronze',new THREE.ConeGeometry(0.28,2.4,8).rotateZ(-Math.PI/2.4).translate(0.9,0,0),0.2,y+3.7,0.35);   // the trumpet, raised
    return M.finish(L,x,g0,z,turn(L.face||0));},
  };
}
