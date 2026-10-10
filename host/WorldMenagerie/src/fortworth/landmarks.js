// Fort Worth: the buildings that are shapes rather than heights, on the shared landmark kit (src/core/landkit.js),
// each placed from its entry in fortworth.json.
//
//   courthouse   the Tarrant County Courthouse (1895): pink Texas granite, Renaissance Revival, its clock tower and
//                dome over the bluff where the fort stood, at the north end of Main Street
//   bass         Bass Performance Hall (1998): a limestone box with its two angels, twelve metres tall, blowing
//                their trumpets from the corners of the front
//   watergardens Philip Johnson's Water Gardens (1974): the Active Pool, water pouring down concrete terraces into a
//                square pit, and the stepped Quiet Pool beside it
//   kimbell      Louis Kahn's Kimbell Art Museum (1972): sixteen cycloid vaults of concrete, each slit along its crown
//                for the light, in three rows behind a portico of open vaults
//   modern       Tadao Ando's Modern Art Museum (2002): flat concrete roofs on Y-shaped columns, the glass
//                pavilions standing in a pond
//   pioneer      the Pioneer Tower of the Will Rogers Memorial Center (1936): an Art Deco tower, 63 m
//   exchange     the Livestock Exchange Building (1902) at the Stockyards: Mission Revival, white stucco, a red tile roof
//   coliseum     Cowtown Coliseum (1908): the first indoor rodeo, brick, its arched front
//   sign         the Fort Worth Stockyards sign: an arch over the street on two posts, the letters across it
//   umbrellas    Sundance Square Plaza's four great shade umbrellas and the fountain jets between them
//   mural        the Chisholm Trail mural (Richard Haas, 1985) on the Jett Building's south wall
//   billybobs    Billy Bob's Texas: the 1910 cattle barn that is the biggest honky-tonk in the world, and its sign
//
// Map data (c) OpenStreetMap contributors, ODbL. The geometry here is this project's own.
import {landkit} from '../core/landkit.js';

export function landmarks(api){
  const {THREE,animHooks,gh,nightF,hour}=api;
  const {Model,turn,archPanel}=landkit(api,{pinkGranite:0xc08a78,pinkDark:0x9a6a5a,limestone:0xe0d4bc,limeDark:0xc4b69c,copper:0x5a8a7a,clockFace:0xf2efe6,
    concrete:0xb8b4ac,concreteDark:0x8e8a84,glassDark:0x2a3440,glassPale:0x8aa4b4,waterBlue:0x3a7a90,stucco:0xf0e8d8,redTile:0xb0583a,brick:0x9a4a36,
    brickDark:0x7a3a2a,deco:0xd8cfb8,gold:0xc8a040,iron:0x2a2a2c,signBlack:0x1e1e1e,signYellow:0xe8c040,wood:0x7a5a3a,grass:0x5a7a3e,holly:0x34502e,cypress:0x4a6a36});
  const roof=(M,k,x,y,z,w,d,h,ry=0)=>{const s=new THREE.Shape();s.moveTo(-d/2,0);s.lineTo(d/2,0);s.lineTo(0,h);s.closePath();M.put(k,new THREE.ExtrudeGeometry(s,{depth:w,bevelEnabled:false}).translate(0,0,-w/2).rotateY(Math.PI/2),x,y,z,ry);};
  const winRow=(M,k,x0,x1,y,z,w,h,step,ry=0)=>{for(let x=x0;x<=x1;x+=step)M.box(k,x,y,z,w,h,0.15,ry);};

  return {

  // ================================================================ the Tarrant County Courthouse
  courthouse(L,x,z){const g0=gh(x,z),M=Model(),W=62,D=42,H=20;
    M.box('pinkDark',0,0,0,W+2,2.4,D+2);M.box('pinkGranite',0,2.4,0,W,H-2.4,D);M.box('pinkDark',0,H,0,W+1.2,1.4,D+1.2);
    for(const s of [-1,1]){winRow(M,'glassDark',-W/2+4,W/2-4,5,s*(D/2+0.08),1.6,3,4.4);winRow(M,'glassDark',-W/2+4,W/2-4,12,s*(D/2+0.08),1.6,3.2,4.4);}
    // the portico on the south front: columns, the pediment
    for(let u=-10;u<=10;u+=4)M.cyl('pinkGranite',u,2.4,D/2+3,0.8,0.7,H-4,12);M.box('pinkGranite',0,H-1.6,D/2+3,24,2,4);M.pediment('pinkGranite',0,H+0.4,D/2+3,24,4,4);
    // the corner pavilions with their small domes
    for(const [a,b] of [[-1,-1],[1,-1],[-1,1],[1,1]]){M.box('pinkGranite',a*(W/2-4),0,b*(D/2-4),9,H+4,9);M.dome('copper',a*(W/2-4),H+4,b*(D/2-4),4,1.1);}
    // the clock tower and its dome
    M.box('pinkGranite',0,H,0,14,14,14);for(const [a,b,ry] of [[0,1,0],[0,-1,Math.PI],[1,0,Math.PI/2],[-1,0,-Math.PI/2]])M.put('clockFace',new THREE.CylinderGeometry(2.6,2.6,0.2,24).rotateX(Math.PI/2),a*7.1,H+9,b*7.1,ry);
    M.cyl('pinkGranite',0,H+14,0,6,6,6,16);for(let i=0;i<12;i++){const a=i/12*Math.PI*2;M.cyl('pinkDark',Math.cos(a)*6.2,H+14,Math.sin(a)*6.2,0.4,0.4,6,8);}
    const top=M.dome('copper',0,H+20,0,6.4,1.2);M.lantern('copper',0,top,0,1.6,5);
    return M.finish(L,x,g0,z,turn(L.face||180));},

  // ================================================================ Bass Performance Hall
  bass(L,x,z){const g0=gh(x,z),M=Model(),W=48,D=60,H=28;
    M.box('limestone',0,0,0,W,H,D);M.box('limeDark',0,H,0,W+1,1.2,D+1);M.dome('limestone',0,H+1.2,0,14,0.35);
    M.box('glassDark',0,0,D/2+0.08,16,9,0.15);M.put('limeDark',archPanel(18,12,0.8,14,8),0,0,D/2+0.4);
    // the angels: robed figures twelve metres tall, wings up, a trumpet each, on the front corners
    for(const s of [-1,1]){const ax=s*(W/2-3),az=D/2+1;M.cyl('limestone',ax,2,az,1.5,2.4,8,10);M.cyl('limestone',ax,10,az,1.2,1.4,3,10);M.put('limestone',new THREE.SphereGeometry(1,10,8),ax,13.8,az,0,0,0,[0.9,1.1,0.9]);
      for(const w of [-1,1])M.put('limestone',new THREE.BoxGeometry(0.4,7,3.4),ax+w*1.2,12,az-1,0,0,w*0.25);
      M.put('gold',new THREE.CylinderGeometry(0.12,0.5,3.6,8).rotateZ(Math.PI/2),ax-s*2.2,13.6,az+0.6,0,0,-s*0.5);}
    return M.finish(L,x,g0,z,turn(L.face||90));},

  // ================================================================ the Water Gardens
  watergardens(L,x,z){const g0=L.ground==null?gh(x,z):L.ground,M=Model(),N=10,STEP=0.9,TOP=40;   // (the street's level: the ground under the pool is cut away, terrainCuts in fortworth.json)
    // the Active Pool: concentric terraces down into a square pit, water sheeting over every step
    // each terrace a square frame of concrete stepping down and in, the water a sheet running over its edge
    const frame=(k,y,s,h,w)=>{for(const [dx,dz,sx,sz] of [[0,-(s-w)/2,s,w],[0,(s-w)/2,s,w],[-(s-w)/2,0,w,s-2*w],[(s-w)/2,0,w,s-2*w]])M.box(k,dx,y,dz,sx,h,sz);};
    for(let i=0;i<N;i++){const s=TOP-i*3.2,y=-(i+1)*STEP;frame('concrete',y,s,STEP,1.6);frame('water',y+STEP-0.02,s-0.1,0.06,0.5);}
    M.box('water',0,-N*STEP-0.1,0,TOP-N*3.2-0.5,0.2,TOP-N*3.2-0.5);M.box('concrete',0,-N*STEP-1,0,TOP+2,1,TOP+2);
    // the Quiet Pool beside it and the Aerating Pool's jets
    M.box('concrete',60,0,0,34,0.8,34);M.box('water',60,0.78,0,30,0.05,30);
    for(let i=0;i<6;i++)for(let j=0;j<3;j++)M.cyl('glassPale',50+i*4,0.8,-10+j*10,0.2,0.05,2.4,5);   // the Aerating Pool's jets
    // the trees round it, bald cypress in their planters
    for(let i=0;i<10;i++){const a=i/10*Math.PI*2;M.cyl('concreteDark',Math.cos(a)*30,0,Math.sin(a)*30,1.6,1.6,0.8,8);M.put('cypress',new THREE.ConeGeometry(2.6,9,7).translate(0,4.5,0),Math.cos(a)*30,1.5,Math.sin(a)*30);}
    return M.finish(L,x,g0,z,turn(L.face||0));},

  // ================================================================ the Kimbell Art Museum
  kimbell(L,x,z){const g0=gh(x,z),M=Model(),VL=31,VW=7,VH=4.2,BASE=6;
    // a cycloid vault, its shell a band between two cycloids, open as a slit along its crown
    const prof=t=>{const s=new THREE.Shape(),P=[];for(let i=0;i<=24;i++){const a=i/24*2*Math.PI;P.push([((a-Math.sin(a))/(2*Math.PI)-0.5)*VW,(1-Math.cos(a))/2*VH]);}
      s.moveTo(P[0][0],0);for(const [u,v] of P)s.lineTo(u,v);s.lineTo(P[P.length-1][0],0);s.lineTo(P[P.length-1][0]-0.4,0);
      for(let i=P.length-1;i>=0;i--)s.lineTo(P[i][0]*0.92,P[i][1]*0.9);s.closePath();return new THREE.ExtrudeGeometry(s,{depth:VL,bevelEnabled:false,curveSegments:2}).translate(0,0,-VL/2);};
    const vg=prof();
    for(let row=0;row<3;row++)for(let k=0;k<(row===1?6:5);k++){const vx=(k-(row===1?2.5:2))*VW*1.15,vz=(row-1)*(VL+2);
      const open=row!==1&&k===0;   // the porticoes at the west end of the outer rows: vaults with no walls under them
      if(!open)M.box('limestone',vx,0,vz,VW,BASE,VL);else for(const c of [-1,1])for(const e of [-1,1])M.box('concrete',vx+c*(VW/2-0.4),0,vz+e*(VL/2-0.4),0.8,BASE,0.8);
      M.put('concrete',vg,vx,BASE,vz);M.box('lead',vx,BASE+VH*0.92,vz,0.4,0.15,VL-1);}
    M.box('grass',-VW*4,0.02,0,VW*2,0.04,VL*2.4);for(let i=0;i<14;i++)M.put('holly',new THREE.IcosahedronGeometry(2.2,0),-VW*4-3+(i%2)*6,3,-VL+i*4.5);   // the yaupon holly grove
    return M.finish(L,x,g0,z,turn(L.face==null?180:L.face));},

  // ================================================================ the Modern Art Museum
  modern(L,x,z){const g0=gh(x,z),M=Model();
    M.box('water',0,0.02,30,140,0.1,50);   // the pond
    for(let p=0;p<5;p++){const px=-56+p*28,pz=p%2?18:26,W=24,D=16,H=12;
      M.box('glassPale',px,0,pz,W-4,H-1,D-4);M.box('concrete',px,0,pz-D/2+1,W-6,H-1,1.2);
      M.box('concrete',px,H,pz,W+6,1.2,D+6);   // the cantilevered roof
      for(const s of [-1,1]){const cx=px+s*(W/2+1),cz=pz+D/2+1;M.box('concrete',cx,0,cz,0.9,H*0.62,0.9);for(const b of [-1,1])M.put('concrete',new THREE.BoxGeometry(0.6,H*0.45,0.6),cx+b*0.9,H*0.62+H*0.2,cz,0,0,b*0.45);}}   // the Y columns
    M.box('concrete',0,0,-6,150,10,22);
    return M.finish(L,x,g0,z,turn(L.face||0));},

  // ================================================================ the Pioneer Tower
  pioneer(L,x,z){const g0=gh(x,z),M=Model(),H=L.h||63;
    M.box('deco',0,0,0,40,12,20);M.box('deco',0,0,0,11,H*0.7,11);M.box('deco',0,H*0.7,0,9,H*0.14,9);M.box('deco',0,H*0.84,0,7,H*0.1,7);M.box('gold',0,H*0.94,0,3,H*0.06,3);
    for(const s of [-1,1])for(let y=8;y<H*0.66;y+=4)M.box('glassDark',s*5.56,y,0,0.1,2.6,1.4,0);
    for(let y=8;y<H*0.66;y+=4)M.box('glassDark',0,y,5.56,1.4,2.6,0.1);
    return M.finish(L,x,g0,z,turn(L.face||0));},

  // ================================================================ the Livestock Exchange Building
  exchange(L,x,z){const g0=gh(x,z),M=Model(),W=70,D=18,H=9;
    M.box('stucco',0,0,0,W,H,D);roof(M,'redTile',0,H,0,W+1,D+1.6,3.2);
    // the arcade along the front, and the Mission gables and bell towers
    for(let u=-W/2+3;u<W/2-2;u+=4.6)M.put('stucco',archPanel(4.6,4.4,1.4,3.4,2.6),u,0,D/2+2.2);M.box('redTile',0,4.4,D/2+2.2,W,0.3,3.2);
    for(const s of [-1,1,0]){const gx=s*W*0.36;const sh=new THREE.Shape();sh.moveTo(-6,0);sh.lineTo(-6,3);sh.quadraticCurveTo(-3,3.4,-2.2,5.6);sh.quadraticCurveTo(0,7.4,2.2,5.6);sh.quadraticCurveTo(3,3.4,6,3);sh.lineTo(6,0);sh.closePath();
      M.put('stucco',new THREE.ExtrudeGeometry(sh,{depth:1,bevelEnabled:false}),gx,H,D/2+0.2);}
    M.box('stucco',0,H,0,5,9,5);roof(M,'redTile',0,H+9,0,5.6,5.6,2.4);M.box('glassDark',0,H+5,2.55,1.4,2.4,0.1);
    for(const s of [-1,1])winRow(M,'glassDark',-W/2+3,W/2-3,5.6,s*(D/2+0.05),1.2,1.8,4.6);
    return M.finish(L,x,g0,z,turn(L.face||180));},

  // ================================================================ Cowtown Coliseum
  coliseum(L,x,z){const g0=gh(x,z),M=Model(),W=56,D=80,H=14;
    M.box('brick',0,0,0,W,H,D);M.box('brickDark',0,H,0,W+0.8,1,D+0.8);M.put('concreteDark',new THREE.CylinderGeometry(D/2,D/2,W,24,1,false,0,Math.PI).rotateZ(Math.PI/2).rotateY(Math.PI/2).scale(1,0.18,1),0,H+1,0);
    // the front: three arches, the pediment with the name
    for(const u of [-12,0,12])M.put('brick',archPanel(10,11,1.2,7,6.5),u,0,D/2+0.6);M.box('stucco',0,H+1,D/2+0.3,30,4,0.6);M.pediment('brickDark',0,H+5,D/2+0.3,34,4,0.8);
    return M.finish(L,x,g0,z,turn(L.face||180));},

  // ================================================================ Sundance Square Plaza's umbrellas
  umbrellas(L,x,z){const g0=gh(x,z),M=Model(),N=L.n||4,R=L.r||9,H=L.h||11;
    // four great shade umbrellas over the plaza, white fabric on a steel mast, ribbed, the fountain jets between
    const canopy=M.cached('umb',()=>new THREE.ConeGeometry(R,R*0.32,8,1,false).translate(0,R*0.16,0));   // an umbrella's crown, the point up
    for(let i=0;i<N;i++){const ux=(i%2-0.5)*R*2.3,uz=(Math.floor(i/2)-0.5)*R*2.3;M.cyl('iron',ux,0,uz,0.35,0.3,H,10);M.put('stucco',canopy,ux,H-R*0.3,uz,Math.PI/8);
      for(let k=0;k<8;k++){const a=k/8*Math.PI*2+Math.PI/8;M.put('iron',new THREE.CylinderGeometry(0.06,0.06,R*1.04,4).rotateZ(Math.PI/2+0.31).translate(R*0.5,0,0),ux,H-R*0.32,uz,a);}}
    for(let i=0;i<16;i++)M.cyl('glassPale',(i%4-1.5)*3,0,(Math.floor(i/4)-1.5)*3,0.12,0.04,1.6,5);   // the jets
    return M.finish(L,x,g0,z,turn(L.face||0));},

  // ================================================================ the Chisholm Trail mural
  mural(L,x,z){const g0=gh(x,z),W=L.w||38,H=L.h||16;
    // Richard Haas's trompe-l'oeil of 1985 on the Jett Building: a cattle drive crossing the Trinity under a wide
    // sky, drovers, the herd, a chuck wagon, painted on the whole south wall
    const c=document.createElement('canvas');c.width=1024;c.height=Math.round(1024*H/W);const g=c.getContext('2d'),ch=c.height;
    const sky=g.createLinearGradient(0,0,0,ch*0.6);sky.addColorStop(0,'#7a9ac0');sky.addColorStop(1,'#e8d8b0');g.fillStyle=sky;g.fillRect(0,0,1024,ch*0.6);
    g.fillStyle='#b89a6a';g.fillRect(0,ch*0.6,1024,ch*0.4);g.fillStyle='#6a8a9a';g.fillRect(0,ch*0.78,1024,ch*0.08);   // the plain and the river
    for(let i=0;i<70;i++){const cx=60+Math.random()*900,cy=ch*(0.66+Math.random()*0.16),s=10+Math.random()*10;g.fillStyle=['#5a3a24','#8a5a34','#e8dcc8','#2a1e18'][i%4];
      g.fillRect(cx,cy,s*1.8,s*0.8);g.fillRect(cx+s*1.6,cy-s*0.2,s*0.6,s*0.5);g.strokeStyle='#e8dcb8';g.lineWidth=2;g.beginPath();g.moveTo(cx+s*1.5,cy-s*0.1);g.lineTo(cx+s*2.6,cy-s*0.3);g.stroke();}
    for(let i=0;i<5;i++){const cx=100+i*190,cy=ch*0.6;g.fillStyle='#3a2a1e';g.fillRect(cx,cy,40,22);g.fillStyle='#4a6a8a';g.fillRect(cx+14,cy-26,12,28);g.fillStyle='#d8c8a0';g.fillRect(cx+8,cy-32,24,6);}
    g.strokeStyle='#e8e0cc';g.lineWidth=14;g.strokeRect(0,0,1024,ch);   // the painted frame
    const tex=new THREE.CanvasTexture(c);const m=new THREE.Mesh(new THREE.PlaneGeometry(W,H),new THREE.MeshLambertMaterial({map:tex,polygonOffset:true,polygonOffsetFactor:-2}));
    m.position.set(x,g0+H/2+3,z);m.rotation.y=turn(L.face||180);const grp=api.group(L,[m]);return grp;},

  // ================================================================ Billy Bob's Texas
  billybobs(L,x,z){const g0=gh(x,z),M=Model(),W=L.w||120,D=L.d||90,H=9;
    // the biggest honky-tonk in the world: a cattle barn of 1910, its long front, the sign on its posts
    M.box('wood',0,0,0,W,H,D);M.put('concreteDark',new THREE.CylinderGeometry(D/2,D/2,W,16,1,false,0,Math.PI).rotateZ(Math.PI/2).scale(1,0.12,1),0,H,0);
    for(let u=-W/2+4;u<W/2;u+=8)M.box('brickDark',u,0,D/2+0.1,0.8,H,0.3);
    M.box('signBlack',0,H+4,D/2+6,26,7,0.6);M.box('signYellow',0,H+4.6,D/2+6.35,24,5.6,0.08);for(const s of [-1,1])M.box('signBlack',s*11,0,D/2+6,0.6,H+5,0.6);
    const word="BILLY BOB'S TEXAS";for(let i=0;i<word.length;i++){if(word[i]===' ')continue;const u=-11+(i+0.5)*22/word.length;M.box('brick',u,H+5.4,D/2+6.42,22/word.length*0.6,3.2,0.06);}
    return M.finish(L,x,g0,z,turn(L.face||180));},

  // ================================================================ the Stockyards sign
  sign(L,x,z){const g0=gh(x,z),M=Model(),W=L.w||24,H=9;
    for(const s of [-1,1])M.box('signBlack',s*W/2,0,0,0.9,H+3,0.9);
    M.box('signBlack',0,H,0,W+1,2.6,0.5);M.box('signYellow',0,H+0.4,0.28,W-1.5,1.8,0.08);
    // the letters: FORT WORTH STOCKYARDS, as blocks of black on the yellow
    const word='FORT WORTH STOCKYARDS';for(let i=0;i<word.length;i++){if(word[i]===' ')continue;const u=-W/2+1.5+(i+0.5)*(W-3)/word.length;M.box('signBlack',u,H+0.65,0.34,(W-3)/word.length*0.62,1.3,0.06);}
    M.put('signBlack',new THREE.TorusGeometry(1.4,0.18,6,16,Math.PI),0,H+2.6,0);
    return M.finish(L,x,g0,z,turn(L.face||0));},
  };
}
