// ---------- the castle's materials: painted on canvases, and one wall drawn by a shader ----------
// Fan work. Nothing here is a picture of anything: every surface is drawn when the page opens, from a seeded
// stream, so it comes out the same every time.
//
// Two kinds of surface:
//
//   the kit       the rooms, galleries, stairs and bridges that hang in the void, seen close. Real geometry
//                 with real textures, each texture one repeat of what it is: a metre of dark wood, two tatami
//                 mats (one ken, 1.82 m, square), one shoji panel, four fusuma panels with a painting across
//                 them, a metre of roof tiles. The kit's geometry carries its UVs in those units (kit.js).
//   the facade    the walls and the ceiling: thousands of boxes, each of them a stack of room-fronts, drawn by
//                 the fragment shader in the box's own coordinates - so a box turned on its side or hung upside
//                 down has its floors turned with it. Tiers 3.6 m high, bays one ken wide between the posts,
//                 and in each bay a lit shoji, a dark one, an open door, a painted fusuma or a plain wall; a
//                 balustrade along some tiers with lanterns along it, a band of lattice over the lintel, and a tiled eave. Every line
//                 fades to its own average before it is small enough to shimmer, the way the City's do.
//
// The facade also listens for Nakime (biwa.js): each strum bumps uEpoch, and a front goes out from her through
// every wall at uWave metres a second, and behind it the doors are not the doors they were.
import {mkRng} from '../core/rng.js';

function canvas(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;return [c,c.getContext('2d')];}
function grain(g,w,h,amt,rnd){const im=g.getImageData(0,0,w,h),d=im.data;
  for(let i=0;i<d.length;i+=4){const n=(rnd()-0.5)*amt;d[i]+=n;d[i+1]+=n*0.9;d[i+2]+=n*0.8;}g.putImageData(im,0,0);}
function tex(THREE,c,aniso,wrap=true){const t=new THREE.CanvasTexture(c);if(wrap)t.wrapS=t.wrapT=THREE.RepeatWrapping;
  t.anisotropy=aniso||4;t.needsUpdate=true;return t;}

// Dark wood, a metre of it: straight grain up the canvas, a little figure, lacquered almost black. The grain
// runs along v, and kit.js turns the UVs so it runs along the length of whatever it is on.
function wood(rnd){
  const W=128,H=256;const [c,g]=canvas(W,H);
  g.fillStyle='#3b2517';g.fillRect(0,0,W,H);
  for(let i=0;i<90;i++){const x=rnd()*W,w=0.6+rnd()*2.4,dark=rnd()<0.6;
    g.strokeStyle=dark?`rgba(20,10,4,${0.15+rnd()*0.3})`:`rgba(120,80,48,${0.08+rnd()*0.14})`;g.lineWidth=w;
    g.beginPath();g.moveTo(x,0);for(let y=0;y<=H;y+=16)g.lineTo(x+Math.sin(y*0.02+i)*1.6,y);g.stroke();}
  grain(g,W,H,10,rnd);return c;
}
// Floorboards, polished, running up the canvas: nine boards in 1.82 m, each its own shade, with the joints
// where one board ends and the next begins.
function plank(rnd){
  const S=256;const [c,g]=canvas(S,S);const bw=S/9;
  for(let i=0;i<9;i++){const t=rnd();g.fillStyle=`rgb(${96+t*30|0},${60+t*20|0},${34+t*12|0})`;g.fillRect(i*bw,0,bw,S);
    for(let k=0;k<10;k++){g.strokeStyle=`rgba(40,22,10,${0.1+rnd()*0.18})`;g.lineWidth=0.8;const x=i*bw+rnd()*bw;
      g.beginPath();g.moveTo(x,0);g.lineTo(x+(rnd()-0.5)*3,S);g.stroke();}
    g.fillStyle='rgba(20,10,4,0.75)';g.fillRect(i*bw,0,1.5,S);
    const j=rnd()*S;g.fillRect(i*bw,j,bw,1.5);}
  // the sheen of a floor that has been walked on and polished for a long time: lighter down the middle
  const gr=g.createLinearGradient(0,0,S,0);gr.addColorStop(0,'rgba(255,220,170,0)');gr.addColorStop(0.5,'rgba(255,220,170,0.06)');gr.addColorStop(1,'rgba(255,220,170,0)');
  g.fillStyle=gr;g.fillRect(0,0,S,S);
  grain(g,S,S,12,rnd);return c;
}
// Two tatami, side by side: each one ken by half a ken, the rush woven across, a black cloth border (heri)
// down the long sides and none on the short.
function tatami(rnd){
  const S=256;const [c,g]=canvas(S,S);
  for(let m=0;m<2;m++){const x0=m*S/2;
    g.fillStyle=m?'#a79b5c':'#aa9d5a';g.fillRect(x0,0,S/2,S);
    for(let y=0;y<S;y+=2){g.fillStyle=(y/2)%2?'rgba(70,64,20,0.16)':'rgba(230,220,150,0.1)';g.fillRect(x0,y,S/2,1);}
    for(let x=x0;x<x0+S/2;x+=9){g.fillStyle='rgba(60,52,20,0.14)';g.fillRect(x,0,1,S);}
    g.fillStyle='#17191f';g.fillRect(x0,0,9,S);g.fillRect(x0+S/2-9,0,9,S);
    g.fillStyle='rgba(120,110,80,0.25)';for(let y=0;y<S;y+=6){g.fillRect(x0+3,y,3,2);g.fillRect(x0+S/2-6,y,3,2);}
    g.fillStyle='rgba(20,15,5,0.5)';g.fillRect(x0,0,S/2,1);}
  grain(g,S,S,14,rnd);return c;
}
// One shoji, half a ken wide and one tall: a wooden frame, a waist board, and paper over a lattice of kumiko,
// three across and seven up. The emissive twin is the paper alone: that is what glows.
function shoji(rnd){
  const W=128,H=256;const [c,g]=canvas(W,H);const [e,ge]=canvas(W,H);
  g.fillStyle='#eadcbc';g.fillRect(0,0,W,H);
  for(let i=0;i<500;i++){g.fillStyle=`rgba(${rnd()<0.5?'150,120,70':'255,250,235'},0.07)`;g.fillRect(rnd()*W,rnd()*H,1+rnd()*5,1);}
  ge.fillStyle='#fff';ge.fillRect(0,0,W,H);
  const wood='#4a2e1b',F=7,waist=H*0.17;
  const bar=(x,y,w,h)=>{g.fillStyle=wood;g.fillRect(x,y,w,h);ge.fillStyle='#000';ge.fillRect(x,y,w,h);};
  bar(0,0,W,F);bar(0,0,F,H);bar(W-F,0,F,H);bar(0,H-waist,W,waist);
  for(let i=1;i<3;i++)bar(F+(W-2*F)*i/3-1.5,0,3,H-waist);
  for(let i=1;i<8;i++)bar(0,F+(H-waist-F)*i/8-1.5,W,3);
  // the waist board has grain
  for(let i=0;i<12;i++){g.fillStyle='rgba(20,10,4,0.3)';g.fillRect(0,H-waist+rnd()*waist,W,1);}
  grain(g,W,H,8,rnd);return [c,e];
}
// The floor's tatami: the same two mats, but seen from standing height across hundreds of metres, where a
// black border every 91 cm turns to stripes. So the borders are olive and thin, and the rush is lighter.
function floorTatami(rnd){
  const S=256;const [c,g]=canvas(S,S);
  for(let m=0;m<2;m++){const x0=m*S/2;
    g.fillStyle=m?'#b4a263':'#b8a566';g.fillRect(x0,0,S/2,S);
    for(let y=0;y<S;y+=2){g.fillStyle=(y/2)%2?'rgba(70,64,20,0.1)':'rgba(240,225,160,0.08)';g.fillRect(x0,y,S/2,1);}
    g.fillStyle='#5a5234';g.fillRect(x0,0,4,S);g.fillRect(x0+S/2-4,0,4,S);
    g.fillStyle='rgba(40,30,10,0.25)';g.fillRect(x0,0,S/2,1);}
  grain(g,S,S,10,rnd);return c;
}
// Four fusuma: gold leaf laid in squares, bands of cloud across it (suyari-gasumi), a pine reaching in from
// the left and waves along the foot - painted across all four, so a run of them is one picture. Black lacquer
// frames, and a round pull on each.
function fusuma(rnd){
  const W=512,H=256;const [c,g]=canvas(W,H);
  for(let y=0;y<H;y+=14)for(let x=0;x<W;x+=14){const t=rnd();g.fillStyle=`rgb(${168+t*30|0},${128+t*22|0},${58+t*14|0})`;g.fillRect(x,y,14,14);
    g.fillStyle='rgba(90,60,20,0.18)';g.fillRect(x,y,14,0.7);g.fillRect(x,y,0.7,14);}
  // clouds
  for(let i=0;i<7;i++){const y=20+rnd()*(H-60),x=rnd()*W-80,w=140+rnd()*260,h=12+rnd()*16;
    g.fillStyle='rgba(248,226,160,0.55)';g.beginPath();
    if(g.roundRect)g.roundRect(x,y,w,h,h/2);else g.rect(x,y,w,h);g.fill();}
  // waves along the foot: rows of arcs
  g.strokeStyle='rgba(40,62,70,0.8)';g.lineWidth=2.2;
  for(let row=0;row<4;row++)for(let x=-20;x<W+20;x+=26){const y=H-8-row*10;g.beginPath();g.arc(x+(row%2)*13,y,12,Math.PI,2*Math.PI);g.stroke();}
  // the pine: a trunk bending in from the left, and clumps of needles
  g.strokeStyle='#2b1a10';g.lineCap='round';
  const branch=(x,y,a,l,w,d)=>{if(d>5||l<8)return;const x2=x+Math.cos(a)*l,y2=y+Math.sin(a)*l;g.lineWidth=w;g.beginPath();g.moveTo(x,y);
    g.quadraticCurveTo((x+x2)/2+(rnd()-0.5)*l*0.4,(y+y2)/2+(rnd()-0.5)*l*0.4,x2,y2);g.stroke();
    if(d>1){g.fillStyle=`rgba(${30+rnd()*20|0},${62+rnd()*20|0},${40+rnd()*10|0},0.95)`;g.beginPath();g.ellipse(x2,y2,18+rnd()*14,7+rnd()*5,a*0.2,0,Math.PI*2);g.fill();}
    branch(x2,y2,a-0.35-rnd()*0.4,l*0.7,w*0.62,d+1);branch(x2,y2,a+0.3+rnd()*0.3,l*0.62,w*0.6,d+1);};
  branch(-10,H*0.9,-0.9,110,14,0);branch(40,H*0.55,-0.1,120,8,1);
  grain(g,W,H,10,rnd);
  // the frames and pulls
  for(let i=0;i<4;i++){const x=i*W/4;g.fillStyle='#120c0a';g.fillRect(x,0,5,H);g.fillRect(x+W/4-5,0,5,H);g.fillRect(x,0,W/4,5);g.fillRect(x,H-5,W/4,5);
    const hx=i%2?x+16:x+W/4-16;g.fillStyle='#1a120c';g.beginPath();g.arc(hx,H*0.52,6,0,Math.PI*2);g.fill();
    g.strokeStyle='#8a6a2a';g.lineWidth=1.2;g.beginPath();g.arc(hx,H*0.52,6,0,Math.PI*2);g.stroke();}
  return c;
}
// Roof tiles, a metre square: rows of pan and cover tiles, each row's lip catching the light.
function roof(rnd){
  const S=128;const [c,g]=canvas(S,S);
  g.fillStyle='#24262c';g.fillRect(0,0,S,S);
  for(let y=0;y<S;y+=32){const gr=g.createLinearGradient(0,y,0,y+32);gr.addColorStop(0,'#1c1d22');gr.addColorStop(0.85,'#3a3d45');gr.addColorStop(1,'#0e0e11');g.fillStyle=gr;g.fillRect(0,y,S,32);}
  for(let x=0;x<S;x+=S/4){const gr=g.createLinearGradient(x,0,x+S/4,0);gr.addColorStop(0,'rgba(0,0,0,0.4)');gr.addColorStop(0.5,'rgba(255,255,255,0.08)');gr.addColorStop(1,'rgba(0,0,0,0.4)');g.fillStyle=gr;g.fillRect(x,0,S/4,S);}
  grain(g,S,S,12,rnd);return c;
}
// Earthen plaster, the colour of the walls over the lintels.
function plaster(rnd){
  const S=128;const [c,g]=canvas(S,S);g.fillStyle='#8a7353';g.fillRect(0,0,S,S);
  for(let i=0;i<300;i++){g.fillStyle=`rgba(${rnd()<0.5?'60,45,25':'180,160,120'},0.08)`;g.beginPath();g.arc(rnd()*S,rnd()*S,1+rnd()*5,0,Math.PI*2);g.fill();}
  grain(g,S,S,16,rnd);return c;
}
// An andon's paper: a box of light with its frame drawn on it.
function lampPaper(){
  const W=64,H=128;const [c,g]=canvas(W,H);
  const gr=g.createLinearGradient(0,0,0,H);gr.addColorStop(0,'#fff0cc');gr.addColorStop(1,'#ffcf8a');g.fillStyle=gr;g.fillRect(0,0,W,H);
  g.fillStyle='#3a2415';g.fillRect(0,0,W,5);g.fillRect(0,H-5,W,5);g.fillRect(0,0,4,H);g.fillRect(W-4,0,4,H);g.fillRect(0,H/2-1,W,2);
  return c;
}
// a soft round glow, for the lamps seen from a distance
function dot(){const [c,g]=canvas(64,64);const gr=g.createRadialGradient(32,32,0,32,32,32);
  gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(0.18,'rgba(255,255,255,0.7)');gr.addColorStop(0.45,'rgba(255,255,255,0.18)');gr.addColorStop(1,'rgba(255,255,255,0)');
  g.fillStyle=gr;g.fillRect(0,0,64,64);return c;}

export function makeTextures(THREE,seed,aniso){
  const rnd=mkRng(seed*7919+13);
  const [sh,shE]=shoji(rnd);
  return {wood:tex(THREE,wood(rnd),aniso),plank:tex(THREE,plank(rnd),aniso),tatami:tex(THREE,tatami(rnd),aniso),
    shoji:tex(THREE,sh,aniso),shojiE:tex(THREE,shE,aniso),fusuma:tex(THREE,fusuma(rnd),aniso),roof:tex(THREE,roof(rnd),aniso),
    plaster:tex(THREE,plaster(rnd),aniso),floor:tex(THREE,floorTatami(rnd),aniso),lamp:tex(THREE,lampPaper(),aniso),dot:tex(THREE,dot(),1,false)};
}

// The size of one repeat of each texture, in metres [across, up]: kit.js divides by these.
export const TEX_M={wood:[0.5,1],plank:[1.82,1.82],tatami:[1.82,1.82],shojiLit:[0.91,1.82],shojiDim:[0.91,1.82],
  fusuma:[3.64,1.82],roof:[1,1],plaster:[1,1],lamp:[0.3,0.6]};

// The kit's materials. Everything is double-sided: a room hung upside down, or seen from outside through its
// open front, shows its back faces, and they are surfaces too. `tint` makes a set for somewhere lit another
// colour (Doma's garden is lit green, not amber).
export function makeKitMats(THREE,T,tint){
  const D=THREE.DoubleSide,warm=new THREE.Color(tint||0xffa860);
  const L=o=>new THREE.MeshLambertMaterial(Object.assign({side:D},o));
  return {
    wood:L({map:T.wood,color:0xcfc0b0}),
    plank:L({map:T.plank,color:0xffffff}),
    tatami:L({map:T.tatami,color:0xf0f0e0,emissive:warm.clone().multiplyScalar(0.06),emissiveMap:T.tatami}),
    shojiLit:L({map:T.shoji,emissive:warm.clone().multiplyScalar(0.95),emissiveMap:T.shojiE}),
    shojiDim:L({map:T.shoji,color:0x8a8070,emissive:warm.clone().multiplyScalar(0.16),emissiveMap:T.shojiE}),
    fusuma:L({map:T.fusuma,emissive:warm.clone().multiplyScalar(0.22),emissiveMap:T.fusuma}),
    roof:L({map:T.roof,color:0xd8dce4}),
    plaster:L({map:T.plaster,color:0xc8b8a0,emissive:warm.clone().multiplyScalar(0.05),emissiveMap:T.plaster}),
    lamp:L({map:T.lamp,emissive:warm.clone().lerp(new THREE.Color(0xffffff),0.35),emissiveMap:T.lamp}),
  };
}

// ---------- the facade ----------
const COMMON=`
varying vec3 vL;varying vec3 vS;varying vec3 vLN;varying vec3 vW;varying float vSeed;varying float vLit;varying float vStyle;
uniform float uEpoch;uniform float uWaveT;uniform vec3 uOrigin;uniform float uWave;
float bh(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float bn2(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);
  return mix(mix(bh(i),bh(i+vec2(1,0)),f.x),mix(bh(i+vec2(0,1)),bh(i+vec2(1,1)),f.x),f.y);}
// a ruled line every 'period', 'width' wide, faded before it can alias (as the City's are)
float rule(float c,float period,float width){
  float fw=max(fwidth(c),1e-4);float d=abs(fract(c/period+0.5)-0.5)*period;
  float hw=max(width*0.5,fw*0.5);
  return (1.0-smoothstep(hw,hw+fw,d))*min(1.0,width/fw)*smoothstep(2.5,7.0,period/fw);}
float band(float c,float a,float b){float fw=max(fwidth(c),1e-4);return smoothstep(a-fw,a+fw,c)*(1.0-smoothstep(b-fw,b+fw,c));}
float resolved(vec2 p,float size){float fw=max(length(fwidth(p)),1e-4);return smoothstep(1.2,5.0,size/fw);}
`;
// In: u along the face, v up it from the bottom of the box (metres), n the box-space normal.
const FACADE=`
 const float T=3.6,K=1.82;
 vec3 WOOD=vec3(0.23,0.14,0.085),PAPER=vec3(0.93,0.84,0.66),PLAST=vec3(0.5,0.41,0.29),TILE=vec3(0.16,0.165,0.19);
 vec3 WARM=vec3(1.0,0.62,0.30);
 float s=vSeed;
 // which generation of doors this pixel sees: the wave from Nakime's last strum may not have got here yet
 float dist=length(vW-uOrigin);float arrived=step(dist,uWaveT*uWave);float ep=uEpoch-1.0+arrived;
 float front=exp(-abs(dist-uWaveT*uWave)*0.06)*step(0.5,uEpoch)*smoothstep(12.0,2.0,uWaveT);
 if(abs(n.y)<0.5){
  float u=(abs(n.x)>0.5?vL.z*sign(n.x):-vL.x*sign(n.z))+97.0*s;
  float v=vL.y+0.5*vS.y;
  float ti=floor(v/T),fv=v-ti*T,bi=floor(u/K),fu=u-bi*K;
  // how many of its bays are lit: most blocks few, some none at all, a few blazing
  float lr=fract(s*7.31);float litF=vLit>=0.0?vLit:(lr<0.22?0.015:0.05+0.34*pow(fract(s*13.7),1.6));
  float hT=bh(vec2(ti,s*91.0));
  bool roofT=hT<0.45+0.45*fract(s*3.7);
  bool rail=bh(vec2(ti+7.0,s*33.0))<0.6;
  if(vStyle>0.5){
   // the rooms hung from the ceiling, as the anime draws them: plain dark boards, and in each bay one small
   // window of vertical slats, some lit and some not
   vec3 c=WOOD*0.9;vec3 g=vec3(0.0);
   // two ken to a bay, and a window a ken wide in the middle of it
   float K2=2.0*K,bj=floor(u/K2),fj=u-bj*K2;
   float hw=bh(vec2(bj,ti)+s*23.0+ep*1.7);float wlit=step(hw,litF);
   float win=band(fj,K*0.5,K*1.5)*band(fv,0.7,2.5);fu=fj;
   float slat=rule(fu,0.12,0.03)*resolved(vec2(u,v),0.12);
   c=mix(c,mix(wlit>0.5?PAPER:PAPER*0.18,WOOD,slat*0.85),win);g+=WARM*1.1*win*wlit*(1.0-slat*0.8);
   c=mix(c,WOOD*1.4,(rule(fv,T,0.08)+rule(fj,K2,0.1))*resolved(vec2(u,v),0.3)*0.6);
   float far=resolved(vec2(u,v),K);c=mix(WOOD*0.9+PAPER*0.2*litF,c,far);g=mix(WARM*0.35*litF,g,far);
   col*=c;glow+=g+vec3(1.0,0.8,0.55)*front*0.35;
  }else{
  // bays go in runs of two to six, the way a run of shoji slides along one track: a lit room is lit all along
  float runL=2.0+floor(bh(vec2(ti,s*5.0)+ep)*5.0);float ri=floor((bi+floor(bh(vec2(ti,s))*6.0))/runL);
  float hb=bh(vec2(ri,ti)+s*17.0+ep*3.17);
  // the bay: lit shoji, a dark one, a door open onto the dark, a painted fusuma, or a plain wall
  vec3 bay;vec3 bg=vec3(0.0);
  float kx=rule(fu,K*0.5,0.035)+rule(fu+0.3,0.3,0.03),ky=rule(fv,0.27,0.03);
  float kum=max(kx,ky)*resolved(vec2(u,v),0.3);
  if(hb<litF){bay=mix(PAPER,WOOD,kum*0.8);bg=WARM*(0.5+0.35*bh(vec2(bi*1.3,ti)+s))*(1.0-kum*0.85);}
  else if(hb<litF+0.22){bay=mix(PAPER*0.32,WOOD,kum*0.8);bg=WARM*0.05;}
  else if(hb<litF+0.33){bay=vec3(0.015,0.012,0.01);bg=WARM*0.12*smoothstep(1.0,0.2,fv);}
  else if(hb<litF+0.5){float cl=bn2(vec2(u*0.9,fv*3.0+s*9.0));bay=mix(vec3(0.55,0.42,0.18),vec3(0.8,0.66,0.34),smoothstep(0.45,0.7,cl));bg=WARM*0.1;}
  else{bay=PLAST*0.7;}
  float bayMask=band(fv,0.3,2.3);
  vec3 c=WOOD;vec3 g=vec3(0.0);
  c=mix(c,bay,bayMask);g+=bg*bayMask;
  // the waist of a shoji, and the floor's edge under it
  c=mix(c,WOOD*1.1,band(fv,0.3,0.55)*step(hb,litF+0.22));g*=1.0-band(fv,0.3,0.55)*step(hb,litF+0.22);
  c=mix(c,WOOD*1.6,rule(fv,T,0.05)*resolved(vec2(u,v),0.2));
  // the posts, one ken apart
  float post=rule(fu,K,0.14);c=mix(c,WOOD*0.9,post);g*=1.0-post;
  // a balustrade along the engawa
  if(rail){float r=band(fv,0.95,1.05)+band(fv,0.35,0.42)+rule(fu,0.46,0.06)*band(fv,0.35,1.0);r=clamp(r,0.0,1.0)*resolved(vec2(u,v),0.5);
   c=mix(c,WOOD*1.25,r);g*=1.0-r*0.9;}
  // lanterns along the rail, a bay apart: the rows of orange points every wide shot of the castle is full of
  if(rail&&bh(vec2(ti+3.0,s*51.0))<0.5){float ld=length(vec2((fu-K*0.5)*1.4,fv-1.28));float fwl=max(fwidth(fv),1e-4);
   float lamp=1.0-smoothstep(0.13,0.13+fwl*1.5,ld);c=mix(c,vec3(1.0,0.85,0.6),lamp);g+=WARM*2.2*lamp+WARM*0.25*exp(-ld*ld*8.0);}
  // the lintel, the lattice transom over it (lit from behind where the bay is), and the beam over that
  float lint=band(fv,2.3,2.44)+band(fv,2.68,2.76);c=mix(c,WOOD*0.95,lint);
  float ram=band(fv,2.44,2.68);
  float lat=max(rule(fu+fv,0.2,0.04),rule(fu-fv,0.2,0.04))*resolved(vec2(u,v),0.2);
  c=mix(c,mix(PAPER*0.5,WOOD,lat),ram);g+=ram*(1.0-lat)*(hb<litF?WARM*0.45:vec3(0.0));
  // the eave: a tiled skirt, its lip a pale fascia; or a band of plaster where a tier has no eave
  float up=band(fv,2.76,T);
  if(roofT){float tl=rule(fu,0.28,0.1)*0.35+rule(fv,0.26,0.05)*0.4;vec3 tc=TILE*(1.0-tl*resolved(vec2(u,v),0.28))*(0.8+0.3*smoothstep(2.76,T,fv));
   c=mix(c,tc,up);c=mix(c,vec3(0.62,0.55,0.44),band(fv,2.76,2.84));}
  else{c=mix(c,PLAST*0.8,up);}
  // a slow unevenness, so a wall of it does not read as wallpaper
  c*=0.85+0.3*bn2(vec2(u*0.05,v*0.03)+s*11.0);
  // lamplight falls on the wood round a lit bay
  g+=WARM*0.06*step(hb,litF)*(1.0-bayMask);
  // far off, the bays blur into the average of a wall of them
  float far=resolved(vec2(u,v),K);
  vec3 avgC=mix(WOOD,PAPER,0.35*litF+0.1);vec3 avgG=WARM*(litF*0.5+(rail?0.05:0.0));
  c=mix(avgC,c,far);g=mix(avgG,g,far);
  col*=c;glow+=g;
  }
 }else if(n.y>0.5){
  // a roof: tiles, or a deck of boards
  vec2 q=vL.xz+s*40.0;
  if(fract(s*5.3)<0.7){float tl=rule(q.x,0.28,0.1)*0.35+rule(q.y,0.26,0.05)*0.4;col*=TILE*(1.0-tl*resolved(q,0.28));}
  else{col*=WOOD*1.5*(1.0-0.5*rule(q.x,0.2,0.02));}
 }else{
  // the underside: joists a half-ken apart, and the dark between them
  vec2 q=vL.xz;col*=WOOD*0.6*(1.0-0.5*rule(q.x,0.91,0.12));
 }
 glow+=vec3(1.0,0.8,0.55)*front*0.35;
`;
// The eaves: a tiled slope along x (the strip is scaled in x only), down to a pale fascia at the outer edge.
const EAVE=`
 vec3 TILE=vec3(0.16,0.165,0.19);
 float along=vL.x+97.0*vSeed;
 if(n.y<-0.3){col*=vec3(0.23,0.14,0.085)*0.9*(1.0-0.4*rule(along,0.45,0.08));glow+=vec3(1.0,0.62,0.3)*0.05;}
 else if(abs(n.y)<0.3){col*=vec3(0.62,0.55,0.44);}
 else{float tl=rule(along,0.28,0.1)*0.45;col*=TILE*(1.0-tl*resolved(vec2(along,vL.z),0.28))*(0.8+0.4*fract(vL.z*3.7));}
`;

export function makeFacadeMats(THREE){
  const U={uEpoch:{value:0},uWaveT:{value:99},uOrigin:{value:new THREE.Vector3()},uWave:{value:140}};
  function mk(kind,color){
    const m=new THREE.MeshLambertMaterial({color,side:THREE.DoubleSide});
    m.extensions={derivatives:true};
    m.onBeforeCompile=sh=>{
      Object.assign(sh.uniforms,U);
      sh.vertexShader='varying vec3 vL;varying vec3 vS;varying vec3 vLN;varying vec3 vW;varying float vSeed;varying float vLit;varying float vStyle;\n'+sh.vertexShader.replace('#include <fog_vertex>',`#include <fog_vertex>
 vec3 sc=vec3(1.0);vec3 ic=vec3(0.0);vec4 wp=vec4(transformed,1.0);
 #ifdef USE_INSTANCING
 sc=vec3(length(instanceMatrix[0].xyz),length(instanceMatrix[1].xyz),length(instanceMatrix[2].xyz));ic=instanceMatrix[3].xyz;wp=instanceMatrix*wp;
 #endif
 vL=transformed*sc;vS=sc;vLN=objectNormal;vW=(modelMatrix*wp).xyz;
 // the seed rides in the instance colour, not the position, so a box the biwa moves keeps its doors
 // g: how many bays are lit, when the builder says (below zero: work it out from the seed); b: the style
 vLit=-1.0;vStyle=0.0;
 #ifdef USE_INSTANCING_COLOR
 vSeed=instanceColor.r;vLit=instanceColor.g;vStyle=instanceColor.b;
 #else
 vSeed=fract(sin(dot(floor(ic*2.0),vec3(12.9898,78.233,37.719)))*43758.5453);
 #endif`);
      sh.fragmentShader=COMMON+sh.fragmentShader
        .replace('#include <color_fragment>',`#include <color_fragment>
 vec3 glow=vec3(0.0);
 {vec3 n=normalize(vLN);vec3 col=diffuse;
 ${kind==='eave'?EAVE:FACADE}
 diffuseColor.rgb=col;}`)
        .replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\n totalEmissiveRadiance+=glow;');
    };
    m.customProgramCacheKey=()=>'mugen-'+kind;
    return m;
  }
  return {U,facade:mk('facade',0xffffff),eave:mk('eave',0xffffff)};
}
