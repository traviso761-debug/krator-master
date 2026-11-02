// ---------- Lake Atitlán: the lake's own landmark models ----------
// The churches are Antigua's `iglesia` (src/antigua/landmarks.js, the colonial kind every town here has, whitewashed);
// this adds what Antigua has not (the docks are the map's own piers, which the engine draws):
//   torre    the Torre Centroamericana in Sololá's plaza (1914): a slender tower in four stages, its clock in the
//            third, a small dome on top
//   cross    a hilltop cross: the one on the Cerro de Oro, over Santiago's bay
//   iguana   La Iguana Perdida, the hostel on Santa Cruz La Laguna's waterfront by the dock (over twenty years there;
//            ATI Divers, the lake's dive shop, works from it). Not mapped; drawn from its listings and what is
//            common to the shore's old places: stone terraces stepping down the slope to a wooden jetty and a dive
//            platform, the dining palapa under a hip roof of palm thatch on the lowest terrace (the family-style
//            dinner at seven), the old house of stone below and timber above with hammocks on its balcony, a dorm
//            cabin under a steep thatch A-frame, the newer rooms in a rendered block with a tile roof, a stone
//            sauna, the dive shop's hut with its tanks, a fire pit, and the garden's bananas. It turns itself to the
//            water (or `face`) and takes each terrace's level from the real slope
//   samabaj  the drowned island town off the Cerro de Oro, its platforms, stelae, houses and jetties on the lake's bed
//            (samabaj.js)
// Map data (c) OpenStreetMap contributors, ODbL.
import {landkit} from '../core/landkit.js';
import {samabaj} from './samabaj.js';

export function landmarks(api){
  const {THREE,gh,inWater}=api;
  const {Model,turn}=landkit(api,{deck:0x8a6a4a,deckDark:0x5a4230,pile:0x4a3a2c,concrete:0xb4aea2,lamina:0x8a8e94,booth:0x2a7ab8,white:0xeeeae0,cream:0xe8dcb8,
    stoneGrey:0xa8a49a,blueTrim:0x2a5aa8,dark:0x2a2620,gold:0xcaa13c,dome:0xc8c4bc,
    thatch:0xa8844a,thatchDark:0x7a5e34,lakeStone:0x6e6a62,timber:0x5e4028,plank:0x8a6a48,render:0xeee6d6,roofTile:0xa4563a,diveBlue:0x2a64b0,
    hamRed:0xc83a3a,hamBlue:0x2a5ab8,hamYellow:0xe0b830,leaf:0x4a8a36,trunk:0x6a7a3a,ember:0xd86a2a,kayakR:0xe0402a,kayakY:0xf0c020,
    basalt:0x4a4a44,mossStone:0x4e5a40,siltStone:0x6a6252,siltTop:0x5a5446});
  return {
  samabaj:samabaj(api,{Model}),
  torre(L,x,z){const g0=gh(x,z),M=Model(),S=L.side||4.4,H=L.height||24;
    M.box('stoneGrey',0,0,0,S+1.4,1.2,S+1.4);M.box('cream',0,1.2,0,S,H*0.38,S);M.box('blueTrim',0,1.2+H*0.38,0,S+0.4,0.4,S+0.4);
    M.box('cream',0,1.6+H*0.38,0,S*0.86,H*0.28,S*0.86);M.box('blueTrim',0,1.6+H*0.66,0,S*0.9,0.35,S*0.9);
    const cy=2+H*0.66;M.box('white',0,cy,0,S*0.74,H*0.2,S*0.74);
    for(const [ax,az,a] of [[0,1,0],[1,0,Math.PI/2],[0,-1,Math.PI],[-1,0,-Math.PI/2]]){M.put('white',new THREE.CylinderGeometry(1.05,1.05,0.1,20).rotateX(Math.PI/2),ax*(S*0.37+0.06),cy+H*0.1,az*(S*0.37+0.06),a);
      M.put('dark',new THREE.CylinderGeometry(0.92,0.92,0.11,20).rotateX(Math.PI/2),ax*(S*0.37+0.08),cy+H*0.1,az*(S*0.37+0.08),a);
      M.put('gold',new THREE.BoxGeometry(0.07,0.7,0.03).translate(0,0.3,0),ax*(S*0.37+0.15),cy+H*0.1,az*(S*0.37+0.15),a,0,0.5);   // the hand
      // the windows of the lower stages, tall and arched
      for(const yy of [4,4+H*0.3])M.box('dark',ax*(S/2+0.02)*(yy>4?0.86:1),yy,az*(S/2+0.02)*(yy>4?0.86:1),ax?0.04:0.9,2.6,ax?0.9:0.04);}
    M.box('blueTrim',0,cy+H*0.2,0,S*0.8,0.3,S*0.8);M.put('dome',new THREE.SphereGeometry(S*0.36,14,8,0,Math.PI*2,0,Math.PI/2),0,cy+H*0.2+0.3,0);
    M.cyl('gold',0,cy+H*0.2+0.3+S*0.36,0,0.06,0.06,1.4,6);
    return M.finish(L,x,g0,z,turn(L.face||0));},

  iguana(L,x,z){const WY=(api.ctx&&api.ctx.waterLevel)||0.05;
    // which way is the water: the mean of the bearings that reach it within 120 m
    let face=L.face;if(face===undefined){let sx=0,sz=0;for(let k=0;k<36;k++){const a=k/36*Math.PI*2;for(let d=10;d<=120;d+=10)if(inWater(x+Math.sin(a)*d,z-Math.cos(a)*d)){sx+=Math.sin(a)/d;sz+=Math.cos(a)/d;break;}}face=Math.atan2(sx,sz)*180/Math.PI;}
    const ry=turn(face),c=Math.cos(ry),sn=Math.sin(ry),W=(lx,lz)=>[x+lx*c+lz*sn,z-lx*sn+lz*c],g0=gh(x,z),gy=(lx,lz)=>{const [wx,wz]=W(lx,lz);return gh(wx,wz)-g0;};
    let shore=0;for(let lz=0;lz<120;lz+=1){const [wx,wz]=W(0,lz);if(inWater(wx,wz)){shore=lz;break;}}if(!shore)shore=30;
    const M=Model(),wy=WY-g0;
    // a level pad: a stone terrace from the slope up (or down) to level y, w by d, its retaining wall on the lake side
    const pad=(cx,cz,w,d)=>{const y=Math.max(wy+0.6,Math.max(gy(cx-w/2,cz-d/2),gy(cx+w/2,cz-d/2),gy(cx,cz))+0.2),lo=Math.min(gy(cx-w/2,cz+d/2),gy(cx+w/2,cz+d/2),gy(cx,cz+d/2),wy-0.4);
      M.box('lakeStone',cx,lo,cz,w,y-lo,d);M.box('stoneGrey',cx,y,cz+d/2-0.2,w,0.12,0.4);return y;};
    const hip=(k,cx,y,cz,w,d,h)=>M.put(k,new THREE.CylinderGeometry(0.02,Math.SQRT1_2,1,4,1).rotateY(Math.PI/4).translate(0,0.5,0),cx,y,cz,0,0,0,[w,h,d]);
    // a pitched roof: a triangle w wide and h high, len long along z (ridge along z), or along x with alongX
    const gable=(k,cx,y,cz,w,h,len,alongX)=>{const t=new THREE.Shape();t.moveTo(-w/2,0);t.lineTo(w/2,0);t.lineTo(0,h);t.lineTo(-w/2,0);
      const g=new THREE.ExtrudeGeometry(t,{depth:len,bevelEnabled:false}).translate(0,0,-len/2);if(alongX)g.rotateY(Math.PI/2);return M.put(k,g,cx,y,cz);};
    const hammock=(cx,y,cz,len,ry2,k)=>{const pts=[];for(let i=0;i<=8;i++){const u=i/8-0.5;pts.push(new THREE.Vector3(u*len,-(0.25-u*u)*1.6,0));}
      M.put(k,new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),8,0.28,4,false).scale(1,1,1),cx,y,cz,ry2,0,0,[1,1,1.6]);};
    // ---- the jetty and the dive platform, out over the water ----
    const deckY=wy+0.7,j0=shore-4,j1=shore+22;
    M.box('plank',0,deckY,(j0+j1)/2,2.6,0.16,j1-j0);M.box('plank',3.5,deckY,j1-3,9.6,0.16,6);
    for(let lz=j0;lz<=j1;lz+=2.5)for(const lx of [-1.2,1.2])M.box('timber',lx,Math.min(deckY,gy(lx,lz))-2.5,lz,0.22,deckY-Math.min(deckY,gy(lx,lz))+2.5,0.22);
    for(const lx of [0.5,3.5,6.5])M.box('timber',lx+1.5,wy-2,j1-0.6,0.22,deckY-wy+2,0.22);
    M.box('timber',8,deckY,j1-3,0.12,3.2,0.12);M.box('pRed',8.55,deckY+2.4,j1-3,1.0,0.7,0.04);M.box('render',8.55,deckY+2.73,j1-3,1.1,0.1,0.05,0.62);   // the diver-down flag
    for(const [lx,k] of [[1.4,'kayakR'],[2.5,'kayakY']])M.box(k,lx+1.6,deckY+0.16,j1-4.5,0.62,0.3,3.6);
    // ---- the dive shop's hut by the jetty's root ----
    {const y=pad(-8,shore-6,6,5);M.box('render',-8,y,shore-6.4,5,2.6,3.8);M.box('diveBlue',-8,y+2.6,shore-6.4,5.6,0.18,4.6);M.box('diveBlue',-8,y+1.5,shore-4.45,3.2,0.7,0.06);
      for(let i=0;i<6;i++)M.cyl('kayakY',-9.8+i*0.42,y,shore-4.2,0.09,0.09,0.75,8);M.box('timber',-8.6,y,shore-4.2,2.8,0.08,0.3);}
    // ---- the dining palapa on the lowest terrace ----
    {const cz=shore-12,y=pad(4,cz,15,10);for(const lx of [-5.5,0,5.5])for(const lz of [-4,4])M.box('timber',4+lx,y,cz+lz,0.3,3.0,0.3);
      M.box('timber',4,y+3,cz,12,0.25,8.4);hip('thatch',4,y+3.1,cz,17,13,4.2);hip('thatchDark',4,y+3.0,cz,17.4,13.4,0.25);
      for(const lz of [-1.6,1.6]){M.box('plank',4,y+0.75,cz+lz,9,0.08,1.0);for(const lx of [-4,0,4])M.box('timber',4+lx,y,cz+lz,0.12,0.75,0.12);
        for(const sd of [-0.9,0.9])M.box('plank',4,y+0.45,cz+lz+sd,9,0.06,0.3);}
      M.box('render',-2.2,y,cz-3.2,2.4,1.1,2.4);M.box('lakeStone',-2.2,y+1.1,cz-3.2,2.6,0.1,2.6);}   // the bar
    // ---- the old house up the slope: stone below, timber above, hammocks on the balcony ----
    {const cz=shore-27,y=pad(-3,cz,13,9);M.box('lakeStone',-3,y,cz,11,2.8,7);M.box('timber',-3,y+2.8,cz,11.4,2.6,7.4);M.box('plank',-3,y+2.8,cz+4.7,11.4,0.14,2.2);
      for(const lx of [-8.4,-3,2.4])M.box('timber',lx,y+2.94,cz+5.7,0.16,2.3,0.16);M.box('timber',-3,y+3.9,cz+5.75,11.4,0.08,0.08);
      hip('thatch',-3,y+5.4,cz+0.6,15,12,4.6);hammock(-5.7,y+4.6,cz+5.2,2.6,0,'hamRed');hammock(-0.3,y+4.6,cz+5.2,2.6,0,'hamBlue');
      for(const lx of [-6,-3,0])M.box('dark',lx,y+0.8,cz+3.52,1.1,1.4,0.06);M.box('dark',-3,y+3.3,cz+3.72,1.0,2.0,0.06);}
    // ---- the dorm cabin: a steep thatch A-frame ----
    {const cz=shore-20,y=pad(-14,cz,8,8);M.box('plank',-14,y,cz,6,0.3,6.5);
      gable('thatch',-14,y+0.3,cz,7.0,6.2,7.4);
      M.box('timber',-14,y+0.3,cz+3.72,3.4,3.4,0.12);M.box('dark',-14,y+0.3,cz+3.8,1.0,2.0,0.06);M.box('hamYellow',-14,y+3.0,cz+3.8,0.9,0.9,0.06);}
    // ---- the newer rooms: rendered, two floors, a tile roof, balconies to the lake ----
    {const cz=shore-36,y=pad(10,cz,16,9);M.box('render',10,y,cz,14,5.8,7);M.box('roofTile',10,y+5.8,cz,15.2,0.2,8.2);
      gable('roofTile',10,y+6.0,cz,8.4,2.0,15.2,true);
      for(let i=0;i<5;i++){const lx=10-5.6+i*2.8;M.box('dark',lx,y+0.4,cz+3.53,0.9,2.0,0.06);M.box('dark',lx,y+3.3,cz+3.53,0.9,2.0,0.06);M.box('plank',lx,y+2.9,cz+4.1,2.2,0.1,1.2);M.box('timber',lx,y+3.0,cz+4.65,2.2,0.9,0.06);}}
    // ---- the sauna, the fire pit, the bananas ----
    {const cz=shore-8,y=pad(-16,cz,5,4);M.box('lakeStone',-16,y,cz,3.4,2.3,2.8);M.box('lamina',-16,y+2.3,cz,3.9,0.12,3.3);M.box('dark',-17.3,y+2.3,cz-0.8,0.3,1.4,0.3);M.box('timber',-16,y,cz+1.42,0.7,1.7,0.06);}
    {const cz=shore-15,y=Math.max(wy+0.6,gy(-6,cz));M.put('lakeStone',new THREE.TorusGeometry(0.9,0.22,5,10).rotateX(Math.PI/2),-6,y+0.15,cz);M.box('ember',-6,y,cz,0.8,0.12,0.8);
      for(const [lx,lz] of [[-1.9,0],[1.9,0],[0,1.9],[0,-1.9]])M.box('timber',-6+lx,y,cz+lz,lx?0.4:1.6,0.4,lx?1.6:0.4);}
    for(let i=0;i<9;i++){const lx=-20+((i*7.3)%38),lz=shore-14-((i*11.7)%26),y=gy(lx,lz);if(y<wy+0.4)continue;M.cyl('trunk',lx,y,lz,0.14,0.11,3.2,6);
      for(let k=0;k<5;k++)M.put('leaf',new THREE.BoxGeometry(0.5,0.05,2.2).translate(0,0,1.0),lx,y+3.2,lz,k*1.26,-0.5,0);}
    // the board at the jetty's root, painted with the hostel's name
    const cv=document.createElement('canvas');cv.width=512;cv.height=128;const cx=cv.getContext('2d');cx.fillStyle='#2a6a3a';cx.fillRect(0,0,512,128);cx.strokeStyle='#e8d8a8';cx.lineWidth=8;cx.strokeRect(6,6,500,116);
    cx.fillStyle='#f2e8c8';cx.font='bold 54px Georgia, serif';cx.textAlign='center';cx.textBaseline='middle';cx.fillText('La Iguana Perdida',256,66);
    const sign=new THREE.Mesh(new THREE.PlaneGeometry(3.2,0.8),new THREE.MeshLambertMaterial({map:new THREE.CanvasTexture(cv),side:THREE.DoubleSide}));
    const sy=Math.max(wy+0.6,gy(-2.6,shore-3));sign.position.set(-2.6,sy+2.2,shore-3);M.box('timber',-3.9,sy,shore-3,0.14,2.6,0.14);M.box('timber',-1.3,sy,shore-3,0.14,2.6,0.14);
    return M.finish(L,x,g0,z,ry,[sign]);},

  cross(L,x,z){const g0=gh(x,z),M=Model(),H=L.h||10;M.box('stoneGrey',0,0,0,3,1.2,3);M.box('white',0,1.2,0,0.8,H,0.8);M.box('white',0,1.2+H*0.66,0,4,0.8,0.8);
    return M.finish(L,x,g0,z,turn(L.face||0));},
  };
}
