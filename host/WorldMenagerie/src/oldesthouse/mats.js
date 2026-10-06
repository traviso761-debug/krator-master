// ---------- the Oldest House's surfaces, painted on canvases when the page opens ----------
// Fan work after Remedy Entertainment's Control (2019); nothing of theirs is used. Every texture here is drawn
// procedurally: board-marked and panelled concrete, the Bureau's red carpet, walnut panelling, terrazzo, white
// tile, steel grating, the black rock of the Quarry and the Foundation, the Ashtray Maze's sunburst paper, the
// motel's blue, acoustic ceiling tile, filed paper. Each is tiled in world metres (TEX_M: metres per repeat),
// and coloured by its material - the canvases are mostly grey so one map serves several tints.
function canvas(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;return [c,c.getContext('2d')];}
function noise(g,w,h,amt,rnd){const im=g.getImageData(0,0,w,h),d=im.data;for(let i=0;i<d.length;i+=4){const n=(rnd()-0.5)*amt;d[i]+=n;d[i+1]+=n;d[i+2]+=n;}g.putImageData(im,0,0);}
function blot(g,w,h,n,r,col,rnd){for(let i=0;i<n;i++){const x=rnd()*w,y=rnd()*h,R=r*(0.3+rnd()),gr=g.createRadialGradient(x,y,0,x,y,R);gr.addColorStop(0,col);gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.fillRect(x-R,y-R,2*R,2*R);}}
// (the shared renderer draws in linear space - core/shell.js sets no output encoding - so colours and canvases go
// in as they are, not converted)
function tex(THREE,c,aniso){const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=aniso;return t;}

// board-marked concrete: courses of form boards, the tie holes in rows, stains
function concrete(rnd,boards){const S=256,[c,g]=canvas(S,S);g.fillStyle='#b8b4ac';g.fillRect(0,0,S,S);
  if(boards){for(let y=0;y<S;y+=16){g.fillStyle=`rgba(${rnd()<0.5?0:255},${rnd()<0.5?0:255},0,0)`;const k=rnd()*14-7;g.fillStyle=`rgb(${184+k},${180+k},${172+k})`;g.fillRect(0,y,S,16);g.fillStyle='rgba(60,58,54,0.25)';g.fillRect(0,y,S,1);}}
  else{g.strokeStyle='rgba(70,66,60,0.45)';g.lineWidth=1.5;g.strokeRect(0.5,0.5,S-1,S-1);}
  g.fillStyle='rgba(50,48,44,0.6)';for(let i=0;i<4;i++)for(let j=0;j<4;j++){g.beginPath();g.arc(32+i*64,32+j*64,2.2,0,7);g.fill();}
  blot(g,S,S,10,40,'rgba(90,84,76,0.12)',rnd);noise(g,S,S,22,rnd);return c;}
function carpet(rnd){const S=128,[c,g]=canvas(S,S);g.fillStyle='#ffffff';g.fillRect(0,0,S,S);noise(g,S,S,26,rnd);blot(g,S,S,6,30,'rgba(0,0,0,0.06)',rnd);return c;}
function wood(rnd){const W=128,H=256,[c,g]=canvas(W,H);for(let x=0;x<W;x+=32){const k=rnd()*30-15;g.fillStyle=`rgb(${120+k},${70+k*0.6},${44+k*0.4})`;g.fillRect(x,0,32,H);
    for(let i=0;i<40;i++){g.strokeStyle=`rgba(40,20,10,${0.08+rnd()*0.12})`;g.beginPath();const xx=x+rnd()*32;g.moveTo(xx,0);g.bezierCurveTo(xx+rnd()*6-3,H/3,xx+rnd()*6-3,2*H/3,xx+rnd()*4-2,H);g.stroke();}
    g.fillStyle='rgba(20,10,4,0.5)';g.fillRect(x,0,1.5,H);}noise(g,W,H,10,rnd);return c;}
function terrazzo(rnd){const S=256,[c,g]=canvas(S,S);g.fillStyle='#d8d4cc';g.fillRect(0,0,S,S);for(let i=0;i<1600;i++){const r=0.6+rnd()*2.2,k=rnd();g.fillStyle=k<0.4?'#8a8478':k<0.7?'#f4f2ee':k<0.85?'#6a5a4a':'#a89a88';g.beginPath();g.arc(rnd()*S,rnd()*S,r,0,7);g.fill();}
  g.strokeStyle='rgba(120,112,100,0.5)';g.strokeRect(0.5,0.5,S-1,S-1);noise(g,S,S,10,rnd);return c;}
function tile(rnd){const S=128,[c,g]=canvas(S,S);g.fillStyle='#8a8a86';g.fillRect(0,0,S,S);for(let i=0;i<4;i++)for(let j=0;j<4;j++){const k=rnd()*10;g.fillStyle=`rgb(${236-k},${236-k},${232-k})`;g.fillRect(i*32+1,j*32+1,30,30);}noise(g,S,S,8,rnd);return c;}
function grate(rnd){const S=128,[c,g]=canvas(S,S);g.fillStyle='#1c1c1e';g.fillRect(0,0,S,S);g.fillStyle='#7a7a78';for(let i=0;i<S;i+=8){g.fillRect(i,0,2,S);g.fillRect(0,i,S,1.5);}noise(g,S,S,16,rnd);return c;}
function rock(rnd){const S=256,[c,g]=canvas(S,S);g.fillStyle='#4a4a4c';g.fillRect(0,0,S,S);blot(g,S,S,60,30,'rgba(0,0,0,0.25)',rnd);blot(g,S,S,30,18,'rgba(255,255,255,0.08)',rnd);
  for(let i=0;i<40;i++){g.strokeStyle=`rgba(0,0,0,${0.2+rnd()*0.3})`;g.lineWidth=0.6+rnd();g.beginPath();let x=rnd()*S,y=rnd()*S;g.moveTo(x,y);for(let k=0;k<5;k++){x+=rnd()*40-20;y+=rnd()*40-20;g.lineTo(x,y);}g.stroke();}noise(g,S,S,30,rnd);return c;}
// the Ashtray Maze's paper: cream and red sunbursts in a diamond lattice
function ashtray(){const W=128,H=256,[c,g]=canvas(W,H);g.fillStyle='#e8d8b8';g.fillRect(0,0,W,H);
  const diamond=(cx,cy)=>{for(let k=0;k<24;k++){const a=k/24*Math.PI*2;g.strokeStyle=k%2?'#a8201a':'#e8d8b8';g.lineWidth=5;g.beginPath();g.moveTo(cx,cy);g.lineTo(cx+Math.cos(a)*64*Math.abs(Math.cos(a))+Math.cos(a)*10,cy+Math.sin(a)*128*Math.abs(Math.sin(a))+Math.sin(a)*10);g.stroke();}};
  g.save();g.beginPath();g.moveTo(64,0);g.lineTo(128,128);g.lineTo(64,256);g.lineTo(0,128);g.closePath();g.clip();g.fillStyle='#8a1a14';g.fillRect(0,0,W,H);diamond(64,128);g.restore();
  g.strokeStyle='#5a1008';g.lineWidth=3;g.beginPath();g.moveTo(64,0);g.lineTo(128,128);g.lineTo(64,256);g.lineTo(0,128);g.closePath();g.stroke();return c;}
function motel(rnd){const S=128,[c,g]=canvas(S,S);g.fillStyle='#ffffff';g.fillRect(0,0,S,S);for(let x=0;x<S;x+=16){g.fillStyle='rgba(0,0,0,0.08)';g.fillRect(x,0,6,S);}noise(g,S,S,12,rnd);return c;}
function ceiling(rnd){const S=128,[c,g]=canvas(S,S);g.fillStyle='#d4d2cc';g.fillRect(0,0,S,S);for(let i=0;i<500;i++){g.fillStyle='rgba(90,88,84,0.35)';g.fillRect(rnd()*S,rnd()*S,1,1);}g.strokeStyle='#8a8880';g.lineWidth=2;g.strokeRect(1,1,S-2,S-2);return c;}
function paper(rnd){const S=128,[c,g]=canvas(S,S);g.fillStyle='#f2efe6';g.fillRect(0,0,S,S);g.fillStyle='rgba(60,60,80,0.4)';for(let y=12;y<S;y+=8)g.fillRect(10,y,60+rnd()*50,1.2);noise(g,S,S,8,rnd);return c;}
// a soft round dot, for glows and the motes in the air
function dot(){const [c,g]=canvas(64,64);const gr=g.createRadialGradient(32,32,0,32,32,32);gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(0.35,'rgba(255,255,255,0.5)');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.fillRect(0,0,64,64);return c;}

export function makeTextures(THREE,rnd,aniso){
  return {concrete:tex(THREE,concrete(rnd,true),aniso),panel:tex(THREE,concrete(rnd,false),aniso),carpet:tex(THREE,carpet(rnd),aniso),wood:tex(THREE,wood(rnd),aniso),
    terrazzo:tex(THREE,terrazzo(rnd),aniso),tile:tex(THREE,tile(rnd),aniso),grate:tex(THREE,grate(rnd),aniso),rock:tex(THREE,rock(rnd),aniso),ashtray:tex(THREE,ashtray(),aniso),
    motel:tex(THREE,motel(rnd),aniso),ceiling:tex(THREE,ceiling(rnd),aniso),paper:tex(THREE,paper(rnd),aniso),dot:tex(THREE,dot(),aniso)};
}

// metres per texture repeat, [across, up]
export const TEX_M={concrete:[4,4],panel:[3,3],carpet:[2,2],wood:[1.2,2.4],terrazzo:[2.4,2.4],tile:[1.2,1.2],grate:[1,1],rock:[6,6],ashtray:[1.2,2.4],motel:[1.6,1.6],ceiling:[1.2,1.2],paper:[0.6,0.6]};

// the materials: key -> [texture, colour, options]. Builders write geometry under these keys; a key with a
// ':' suffix (e.g. 'concrete:ceil') shares the look but becomes its own mesh, so ceilings can be lifted away.
export const MAT_DEF={
  concrete:['concrete',0xd6d2ca],concreteDark:['concrete',0x8a867e],concreteWarm:['concrete',0xcfc4b4],brick:['panel',0x9a5a44],brickDark:['panel',0x6a4234],panel:['panel',0xe2ded6],panelDark:['panel',0x7a7670],
  carpet:['carpet',0x8a1a1c],carpetDark:['carpet',0x4a1012],carpetGrey:['carpet',0x5a5654],wood:['wood',0xffffff],woodDark:['wood',0x8a7a70],
  terrazzo:['terrazzo',0xffffff],tile:['tile',0xffffff],tileGreen:['tile',0x9ac8b0],grate:['grate',0xffffff],steel:[null,0x6a6c70],steelDark:[null,0x2e3034],brass:[null,0xb8903a],
  rock:['rock',0xffffff],rockBlack:['rock',0x5a5a60],rockRed:['rock',0xb06a5a],ashtray:['ashtray',0xffffff],motel:['motel',0x2a4a9a],ceiling:['ceiling',0xffffff],paper:['paper',0xffffff],
  glass:[null,0x9ab8c0,{transparent:true,opacity:0.35}],leaf:[null,0x3a6a32],leafDark:[null,0x24401f],bark:[null,0x5a3a26],black:[null,0x0c0c0e],white:[null,0xf4f4f2],red:[null,0xc8201a],orange:[null,0xe8641a],
  yellow:[null,0xe8b830],teal:[null,0x3aa8a8],pipe:[null,0xd89a3a],pipeRed:[null,0xb8301a],
  // the ones that give light: they are not lit, they shine
  lightPanel:[null,0xfff8ec,{emissive:true}],lightWarm:[null,0xffc880,{emissive:true}],lightTeal:[null,0x7affe8,{emissive:true}],lightRed:[null,0xff3a2a,{emissive:true}],
  lightFurnace:[null,0xffc030,{emissive:true}],lightWhite:[null,0xffffff,{emissive:true}],lightBlue:[null,0x6ab8ff,{emissive:true}],screen:[null,0x8affc8,{emissive:true}],
};

export function makeMaterial(THREE,T,key){
  const base=key.split(':')[0],d=MAT_DEF[base];if(!d)throw new Error('no material '+base);
  const [tk,color,o={}]=d,col=new THREE.Color(color);
  if(o.emissive)return new THREE.MeshBasicMaterial({color:col,fog:true});
  // the light is baked into the vertex colours (kit.js bake), so the fabric is unlit: it shows its colour times
  // the baked light, and nothing else touches it
  return new THREE.MeshBasicMaterial({color:col,map:tk?T[tk]:null,vertexColors:true,transparent:!!o.transparent,opacity:o.opacity==null?1:o.opacity,depthWrite:!o.transparent,fog:true});
}
