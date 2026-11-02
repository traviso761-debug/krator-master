// ---------- Crater Lake: the park's buildings and the lake's rocks ----------
//   lodge     Crater Lake Lodge on the rim at Rim Village (opened 1915, taken apart and rebuilt 1991-95): a ground
//             floor of rough local stone, three floors of brown bark-shingle over it, a steep roof full of dormers,
//             stone chimneys, and the stone terrace on the lake side where people sit to watch the evening
//   lookout   a fire lookout: the Watchman's (1932) a stone ground floor with the glazed cab over it; Mount Scott's
//             a two-storey timber tower, the cab on top. `tower` picks the second
//   sinnott   the Sinnott Memorial Overlook (1931), built into the caldera wall under Rim Village: a stone room open
//             to the lake behind a parapet, its roof a terrace
//   phantom   the Phantom Ship: a spine of old andesite standing out of the water off the south shore, its spires
//             like masts, 50 m high and 150 m long, with a few trees on it
// Map data (c) OpenStreetMap contributors, ODbL.
import {landkit} from '../core/landkit.js';
import {hash3} from '../core/rng.js';

export function landmarks(api){
  const {THREE,gh}=api;
  const {Model,turn}=landkit(api,{lodgeStone:0x7e7a72,shingle:0x6a4a30,shingleDark:0x55392a,roofGreen:0x4a564a,trimWhite:0xe6e2d6,glass:0x2a3238,
    lookStone:0x8a857c,cab:0xc8bfa8,cabRoof:0x5a5a58,timber:0x6a5038,andesite:0x6e665c,andesiteDark:0x544e48,fir:0x2a4630});
  const WY=()=>(api.ctx&&api.ctx.waterLevel)||0.05;
  return {
  lodge(L,x,z){const g0=gh(x,z),M=Model(),LEN=L.len||70,D=L.depth||15,ST=4.2,UP=9.6,RH=L.roofH||7.5;
    M.box('lodgeStone',0,-2,0,LEN,ST+2,D);M.box('shingle',0,ST,0,LEN,UP,D);M.box('trimWhite',0,ST-0.1,0,LEN+0.2,0.2,D+0.2);
    // the roof: a gable along the length, shed dormers in rows on both faces, the end gables in shingle
    {const t=new THREE.Shape();t.moveTo(-D/2-0.8,0);t.lineTo(D/2+0.8,0);t.lineTo(0,RH);t.lineTo(-D/2-0.8,0);
      M.put('roofGreen',new THREE.ExtrudeGeometry(t,{depth:LEN+1.6,bevelEnabled:false}).translate(0,0,-(LEN+1.6)/2).rotateY(Math.PI/2),0,ST+UP,0);
      for(const sd of [-1,1])for(let i=0;i<9;i++){const lx=-LEN/2+5+i*(LEN-10)/8;M.box('shingleDark',lx,ST+UP+0.6,sd*D*0.26,3.2,2.2,2.6);M.box('roofGreen',lx,ST+UP+2.8,sd*D*0.26,3.6,0.18,3.2);M.box('glass',lx,ST+UP+1.0,sd*(D*0.26+1.32),2.2,1.2,0.05);}}
    for(const lx of [-LEN*0.3,LEN*0.18])M.box('lodgeStone',lx,ST+UP,0,2.6,RH+1.6,2.4);
    // the windows: white frames on the shingle, in three rows; the ground floor's set deep in the stone
    for(const sd of [-1,1])for(let i=0;i<20;i++){const lx=-LEN/2+2.5+i*(LEN-5)/19;
      for(let f=0;f<3;f++){M.box('trimWhite',lx,ST+0.8+f*3.2,sd*(D/2+0.02),1.3,1.7,0.06);M.box('glass',lx,ST+0.95+f*3.2,sd*(D/2+0.05),1.0,1.4,0.05);}
      if(i%2)M.box('glass',lx,1.0,sd*(D/2+0.03),1.2,1.8,0.06);}
    // the lake terrace: a stone wall and paving out from the +z face, chairs in a row along it
    M.box('lodgeStone',0,-1.2,D/2+3.5,LEN*0.8,1.2,7);M.box('lodgeStone',0,0,D/2+6.8,LEN*0.8,1.0,0.5);
    for(let i=0;i<16;i++){const lx=-LEN*0.36+i*LEN*0.048;M.box('timber',lx,0,D/2+5.6,0.7,0.45,0.7);M.box('timber',lx,0.45,D/2+5.9,0.7,0.8,0.1);}
    return M.finish(L,x,g0,z,turn(L.face||0));},

  lookout(L,x,z){const g0=gh(x,z),M=Model(),C=L.cab||5.2;let y=0;
    if(L.tower){const H=L.height||9;for(const sx of [-1,1])for(const sz of [-1,1])M.box('timber',sx*C*0.42,0,sz*C*0.42,0.3,H,0.3);
      for(let k=1;k<4;k++)M.box('timber',0,k*H/4,0,C*0.9,0.18,C*0.9);M.box('timber',C*0.3,0,0,0.9,H,0.9);y=H;}
    else{M.box('lookStone',0,-0.5,0,C+1,3.4,C+1);y=2.9;}
    M.box('cab',0,y,0,C,1.1,C);M.box('glass',0,y+1.1,0,C-0.1,1.5,C-0.1);for(const sx of [-1,1])for(const sz of [-1,1])M.box('cab',sx*(C/2-0.08),y+1.1,sz*(C/2-0.08),0.16,1.5,0.16);
    M.box('cab',0,y+2.6,0,C+0.3,0.25,C+0.3);M.put('cabRoof',new THREE.ConeGeometry((C+1.4)*Math.SQRT1_2,1.6,4).rotateY(Math.PI/4).translate(0,0.8,0),0,y+2.85,0);
    M.box('timber',0,y-0.15,0,C+2,0.15,C+2);   // the catwalk round the cab
    for(let k=0;k<12;k++){const a=k/12*Math.PI*2,r=(C+2)/2;M.box('timber',Math.cos(a)*r*0.98,y,Math.sin(a)*r*0.98,0.08,1.0,0.08);}
    M.cyl('cabRoof',0,y+4.4,0,0.03,0.03,2.2,4);   // the lightning rod
    return M.finish(L,x,g0,z,turn(L.face||0));},

  sinnott(L,x,z){const g0=gh(x,z),M=Model(),W=L.w||16,D=L.d||9,H=L.h||3.8,dy=L.drop==null?-8:L.drop;
    // dropped into the wall: the room's floor `drop` m under the map's point (on the rim), its roof a terrace
    M.box('lookStone',0,dy-3,0,W+2,3,D+2);M.box('lookStone',-W/2+0.4,dy,0,0.8,H,D);M.box('lookStone',W/2-0.4,dy,0,0.8,H,D);M.box('lookStone',0,dy,-D/2+0.4,W,H,0.8);
    M.box('lookStone',0,dy+H,0,W+0.6,0.6,D+0.6);M.box('lookStone',0,dy,D/2-0.2,W,1.0,0.5);   // the roof slab, and the parapet at the open lake side
    for(let i=0;i<3;i++)M.box('lookStone',-W/3+i*W/3,dy,D/2-0.4,0.9,H,0.9);   // the piers of the opening
    M.box('lookStone',0,dy+H+0.6,D/2,W+0.6,0.9,0.4);M.box('lookStone',0,dy+H,-D/2-3,3,-dy-H+1,4);   // the terrace's parapet, and the stair down from the rim
    return M.finish(L,x,g0,z,turn(L.face||0));},

  phantom(L,x,z){const M=Model(),wy=WY(),LEN=L.len||150,H=L.h||50,N=L.spires||14;
    // the hull: a long low ridge awash; the spires along it, tallest amidships, leaning a little
    M.put('andesiteDark',new THREE.IcosahedronGeometry(1,1).scale(LEN*0.5,9,LEN*0.13),0,-2,0);
    for(let i=0;i<N;i++){const u=i/(N-1)-0.5,h=H*(0.35+0.65*Math.cos(u*Math.PI)**1.5)*(0.7+hash3(i,3,1)*0.5),w=3+hash3(i,4,2)*5,lx=u*LEN*0.85+(hash3(i,5,3)-0.5)*6,lz=(hash3(i,6,4)-0.5)*LEN*0.12;
      M.put(i%3?'andesite':'andesiteDark',new THREE.ConeGeometry(w,h,5+(i%3)).translate(0,h/2,0),lx,0,lz,hash3(i,7,5)*3,(hash3(i,8,6)-0.5)*0.12,(hash3(i,9,7)-0.5)*0.15);
      if(hash3(i,10,8)<0.3)M.put('fir',new THREE.ConeGeometry(1.4,6,6).translate(0,3,0),lx+w*0.6,h*0.25,lz);}
    return M.finish(L,x,wy,z,turn(L.face||0));},
  };
}
