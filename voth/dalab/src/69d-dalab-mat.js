// ================================================================= DALAB — materials + kit items (prefix d / D)
// What the people of Dalab build: Cahokian monumentality in rammed earth, wood, stone and scrap. Circular plans,
// thatch and shingle cones, earth mounds turfed green, and — for the priest-caste and the wealthy — megalithic
// grey stone with carved relief bands and painted murals in a Tiwanaku / Mesoamerican / Amerindian-deco idiom.
// The only saturated colours are the mural paints (red ochre, turquoise, gold, black on cream) and The God's
// light, which is COLD: a teal-white, unlike Iziz's warm bulbs — an Ancient light, kept alive by the priests.
//
// Everything textured is painted near-grey and tinted per instance with vC() (69b), except the mural, the
// mosaic and the tile, which are colour textures and are placed untinted (white).
const DPAL={
 earth:[0xb5824f,0xa8763f,0xc4915c,0x9c6d3a,0xb98a5a,0xa07a48],         // rammed earth lifts, sun-dried
 earthDark:[0x8a5e34,0x7a5230,0x92663c],                                // wet foot of a wall, plinths
 stone:[0x8a8478,0x9a948a,0x7c766c,0xa29c92,0x8e8880],                  // andesite grey — the priests' stone
 stoneWarm:[0xa89a80,0xb8a888,0x9a8c72],                                // a sandstone band, steles
 wood:[0x8a6a44,0x7a5a38,0x9a7a50,0x6a4e30],                            // oak, oiled
 woodGrey:[0x9a8c78,0x8a7a66,0xa89a86,0x7c6e5e],                        // weathered
 thatch:[0xb0985a,0xa08a4e,0xc0a868,0x9a8248],
 shingle:[0x7a6448,0x6a563e,0x8a7454,0x5e4a36],
 red:[0xa8382a,0xb8442e,0x9a3020],                                      // red ochre paint
 turq:[0x2f9a8a,0x3aa896,0x2a8a7a],                                     // turquoise paint, copper-green
 gold:[0xd8a838,0xc89a30,0xe0b848],
 skin:[0x6a9a4a,0x5a8a42,0x7aa852,0x4f7f3c,0x86b060],                   // photosynthetic green, every citizen
 robe:[0xe8dcc0,0xa8382a,0x2f9a8a,0xd8a838,0x3b3b4a,0xf0e8d8,0x8a6a3a],
 priest:[0xf0e8d8,0x2f9a8a,0xd8a838],                                   // white, turquoise, gold: the caste
 turf:[0x5f8a3a,0x6a9a44,0x557f36,0x6f9a48],
 god:0x9af0e0,                                                          // The God's light
 // THE SACRED DECO (round 4, from the reference sheet): terracotta-red walls, cream trim, turquoise-inlaid fret,
 // gold finials — the Amerindian-deco of the temples, priests' houses, the palace and the compound chapels
 sacred:[0x9c4e3c,0xa85a44,0x8e4636,0xa2523e],
 cream:[0xe8dcc0,0xf0e6cc],
 trim:[0xdcbc8e,0xe4c69a,0xd4b284],
 tq:0x3f9a88,
 laterite:[0x8a4a2a,0x9a5630,0x7a4224],                                 // the Historians' Djenne earth
 vothStone:[0x7a7068,0x8a8078,0x6a625a],                                // Voth's cooler ashlar
};
const dPick=a=>a[(rng()*a.length)|0];
const dCol=(arr,k)=>vC(dPick(arr),k);

// ---------------------------------------------------------------- textures
// Rammed earth (Chan Chan / pisé): horizontal lifts ~0.35 m with a shadow line at each joint, form-board marks,
// grit, and a damp darkening toward the foot. 128 px = 2 m.
TEX.dRammed=canvasTex(128,128,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;const lift=Math.floor(y/22),fy=y%22;
  let v=186+(h3(lift*1.7,0,3.1)-.5)*30;                       // lift to lift
  v+=(fbm(x/26,y/7,4.1,3)-.5)*26;                              // the tamping, streaky along the lift
  v+=(fbm(x/3,y/3,7.2,1)-.5)*12;                               // grit
  if(fy<1)v-=58;else if(fy<2)v-=22;else if(fy>20)v+=8;         // joint shadow, lit lip of the lift above
  if(((x+lift*53)%128)<1&&fy>2)v-=18;                          // form-board ends
  const pit=fbm(x/5,y/5,lift*.9,2);if(pit>.74)v-=(pit-.74)*140; // pock marks
  d[i]=v;d[i+1]=v*.94;d[i+2]=v*.86;d[i+3]=255;}
 g.putImageData(id,0,0);});
// Carved relief: a stepped-fret meander (the Andean chakana / Mesoamerican xicalcoliuhqui key) cut into stone,
// raised faces lit from above, recesses in shadow. Grey, tinted. 256 px = 4 m; one motif cell = 1 m.
TEX.dRelief=canvasTex(256,256,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;const CELL=64;
 // height field: nested stepped diamonds in each cell, alternating raised / recessed; a border groove round the cell
 const hf=(x,y)=>{const cx=x%CELL,cy=y%CELL;const bx=Math.floor(x/CELL),by=Math.floor(y/CELL);
  const u=Math.abs(cx-CELL/2),v=Math.abs(cy-CELL/2);const q=8;const su=Math.floor(u/q),sv=Math.floor(v/q);
  const ring=Math.max(su,sv);                                   // stepped square rings
  const spiral=((bx+by)%2)?((ring+ (su>sv?1:0))%2):(ring%2);    // alternate cells break the symmetry
  let z=spiral?1:0;
  if(cx<3||cy<3||cx>CELL-4||cy>CELL-4)z=0;                      // groove between cells
  if(ring===0)z=1;
  return z;};
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;const z=hf(x,y);
  const up=hf(x,(y-2+h)%h),lf=hf((x-2+w)%w,y),dn=hf(x,(y+2)%h);
  let v=z?188:132;v+=(fbm(x/9,y/9,5.5,2)-.5)*18+(fbm(x/2.5,y/2.5,8.1,1)-.5)*8;
  if(z&&!up)v+=34;if(z&&!lf)v+=12;if(!z&&up)v-=30;if(!z&&dn)v+=6;     // lit top arris, shadow under a ledge
  d[i]=v;d[i+1]=v*.96;d[i+2]=v*.9;d[i+3]=255;}
 g.putImageData(id,0,0);});
// Murals: COLOUR friezes, 2 x 2 m tiles, four variants (dMuralTex(v)). Stepped-fret borders top and bottom; between them
//   0  an avatar of The God (rayed head, one great eye, staffs) and a hero in profile (spear, shield)
//   1  a procession of three heroes with spears and banners, walking left
//   2  two avatars flanking the eye-in-the-sun, rays to the border — His watchful benevolence
//   3  the beasts of the fields: two lizards under a fret sky, a sheaf of maize between them — the peasant mural
// Red ochre, turquoise, gold, black on a cream lime wash; the paint worn at the foot.
function dMuralTex(v){return canvasTex(256,256,(g,w,h)=>{
 g.fillStyle='#e6d8b8';g.fillRect(0,0,w,h);
 const RED='#a8382a',TQ='#2f9a8a',GOLD='#d8a838',BLK='#2a2420',CREAM='#efe6cc';
 const fret=(y0,hh,col)=>{g.fillStyle=col;const s=hh/4;for(let x=0;x<w;x+=s*6){
  g.fillRect(x,y0,s*5,s);g.fillRect(x,y0+hh-s,s*5,s);g.fillRect(x,y0,s,hh);g.fillRect(x+s*2,y0+s,s*3,s);g.fillRect(x+s*4,y0+s,s,hh-s*2);g.fillRect(x+s*2,y0+s,s,hh-s*2-s);}};
 g.fillStyle=RED;g.fillRect(0,0,w,10);g.fillRect(0,h-10,w,10);fret(12,28,BLK);fret(h-40,28,BLK);
 g.fillStyle=TQ;g.fillRect(0,42,w,3);g.fillRect(0,h-45,w,3);
 const god=(cx,cy,s)=>{
  for(let k=0;k<9;k++){const a=Math.PI*(k/8);const rx=cx+Math.cos(a)*s*.95,ry=cy-s*.55-Math.sin(a)*s*.9;g.fillStyle=k%2?RED:GOLD;g.fillRect(rx-s*.06,ry-s*.14,s*.12,s*.28);}
  g.fillStyle=RED;g.fillRect(cx-s*.5,cy-s*.95,s,s*.8);
  g.fillStyle=BLK;g.fillRect(cx-s*.5,cy-s*.95,s,s*.08);g.fillRect(cx-s*.5,cy-s*.15,s,s*.05);
  g.fillStyle=CREAM;g.beginPath();g.arc(cx,cy-s*.55,s*.26,0,TAU);g.fill();g.fillStyle=BLK;g.beginPath();g.arc(cx,cy-s*.55,s*.12,0,TAU);g.fill();
  g.fillStyle=TQ;g.fillRect(cx-s*.42,cy-s*.15,s*.84,s*.9);g.fillStyle=GOLD;for(let k=0;k<3;k++)g.fillRect(cx-s*.34,cy+s*(.05+k*.25),s*.68,s*.08);
  g.fillStyle=BLK;g.fillRect(cx-s*.72,cy-s*.7,s*.08,s*1.5);g.fillRect(cx+s*.64,cy-s*.7,s*.08,s*1.5);
  g.fillStyle=RED;g.fillRect(cx-s*.78,cy-s*.78,s*.2,s*.14);g.fillRect(cx+s*.58,cy-s*.78,s*.2,s*.14);
  g.fillStyle=BLK;g.fillRect(cx-s*.36,cy+s*.75,s*.26,s*.22);g.fillRect(cx+s*.1,cy+s*.75,s*.26,s*.22);};
 const hero=(cx,cy,s,flip,banner)=>{const f=flip?-1:1;
  g.fillStyle=BLK;g.fillRect(cx-s*.28,cy-s*.7,s*.56,s*.5);
  g.fillStyle=RED;g.fillRect(cx-s*.28,cy-s*.86,s*.56,s*.16);g.fillRect(cx+f*s*.2,cy-s*.55,f*s*.22,s*.16);
  g.fillStyle=GOLD;g.fillRect(cx-s*.36,cy-s*.2,s*.72,s*.8);g.fillStyle=TQ;g.fillRect(cx-s*.36,cy+s*.2,s*.72,s*.14);
  g.fillStyle=BLK;g.fillRect(cx+f*s*.5,cy-s*1.0,s*.07,s*1.9);
  if(banner){g.fillStyle=banner;g.fillRect(cx+f*s*.5+(f>0?s*.07:-s*.5),cy-s*1.0,s*.5,s*.36);}
  else{g.fillStyle=RED;g.beginPath();g.arc(cx-f*s*.62,cy+s*.1,s*.3,0,TAU);g.fill();g.fillStyle=CREAM;g.beginPath();g.arc(cx-f*s*.62,cy+s*.1,s*.12,0,TAU);g.fill();}
  g.fillStyle=BLK;g.fillRect(cx-s*.3,cy+s*.6,s*.22,s*.34);g.fillRect(cx+s*.08,cy+s*.6,s*.22,s*.34);};
 const sun=(cx,cy,r)=>{for(let k=0;k<16;k++){const a=k/16*TAU;g.fillStyle=k%2?RED:GOLD;g.beginPath();g.moveTo(cx+Math.cos(a-.08)*r*1.05,cy+Math.sin(a-.08)*r*1.05);g.lineTo(cx+Math.cos(a)*r*1.8,cy+Math.sin(a)*r*1.8);g.lineTo(cx+Math.cos(a+.08)*r*1.05,cy+Math.sin(a+.08)*r*1.05);g.fill();}
  g.fillStyle=GOLD;g.beginPath();g.arc(cx,cy,r,0,TAU);g.fill();g.fillStyle=CREAM;g.beginPath();g.ellipse(cx,cy,r*.62,r*.36,0,0,TAU);g.fill();g.fillStyle=BLK;g.beginPath();g.arc(cx,cy,r*.26,0,TAU);g.fill();};
 const liz=(cx,cy,s,f)=>{g.fillStyle=TQ;g.beginPath();g.ellipse(cx,cy,s*.9,s*.32,0,0,TAU);g.fill();   // body
  g.beginPath();g.moveTo(cx-f*s*.85,cy-s*.12);g.lineTo(cx-f*s*2.0,cy+s*.05);g.lineTo(cx-f*s*.85,cy+s*.2);g.fill();   // tail
  g.fillStyle=GOLD;for(let k=0;k<5;k++)g.fillRect(cx-s*.6+k*s*.3,cy-s*.16,s*.12,s*.32);                             // stripes
  g.fillStyle=TQ;g.fillRect(cx+f*s*.8,cy-s*.28,f*s*.55,s*.36);g.fillStyle=BLK;g.fillRect(cx+f*s*1.15,cy-s*.2,f*s*.1,s*.1);   // head, eye
  g.fillStyle=BLK;for(const lx of[-.45,.45]){g.fillRect(cx+lx*s-s*.06,cy+s*.2,s*.12,s*.5);g.fillRect(cx+lx*s-s*.18,cy+s*.62,s*.36,s*.08);}};
 if(v===0){god(64,132,34);hero(192,138,30,false);}
 else if(v===1){hero(48,138,28,true,GOLD);hero(128,138,28,true,TQ);hero(208,138,28,true,RED);}
 else if(v===2){god(40,136,26);sun(128,124,26);god(216,136,26);}
 else{liz(64,130,24,1);liz(196,130,24,-1);g.fillStyle=GOLD;for(let k=0;k<5;k++)g.fillRect(122+k*3,96+Math.abs(k-2)*8,3,60);g.fillStyle=TQ;g.fillRect(118,150,22,8);}
 const id=g.getImageData(0,0,w,h),d=id.data;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;const wear=clamp((fbm(x/40,y/40,6.6+v,3)-.42)*2.2,0,1)*.45+clamp((y/h-.7)*1.6,0,1)*.5*fbm(x/9,y/9,2.2,2);
  for(let c=0;c<3;c++)d[i+c]=d[i+c]+(214-d[i+c])*wear*.8;const gr=(fbm(x/5,y/5,1.7,1)-.5)*14;d[i]+=gr;d[i+1]+=gr;d[i+2]+=gr;}
 g.putImageData(id,0,0);});}
TEX.dMural=dMuralTex(0);TEX.dMural1=dMuralTex(1);TEX.dMural2=dMuralTex(2);TEX.dMural3=dMuralTex(3);
// The same stepped-fret height field, in COLOUR: cream faces over turquoise recesses (the inlay of the deco temples).
TEX.dReliefTq=canvasTex(256,256,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;const CELL=64;
 const hf=(x,y)=>{const cx=x%CELL,cy=y%CELL;const bx=Math.floor(x/CELL),by=Math.floor(y/CELL);
  const u=Math.abs(cx-CELL/2),v=Math.abs(cy-CELL/2);const q=8;const su=Math.floor(u/q),sv=Math.floor(v/q);const ring=Math.max(su,sv);
  const spiral=((bx+by)%2)?((ring+(su>sv?1:0))%2):(ring%2);let z=spiral?1:0;if(cx<3||cy<3||cx>CELL-4||cy>CELL-4)z=0;if(ring===0)z=1;return z;};
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;const z=hf(x,y);const up=hf(x,(y-2+h)%h);
  let r,gg,b;if(z){r=226;gg=196;b=150;if(!up){r+=22;gg+=20;b+=16;}}else{r=56;gg=140;b=124;if(up){r-=18;gg-=30;b-=26;}}
  const n=(fbm(x/9,y/9,5.5,2)-.5)*16;r+=n;gg+=n;b+=n;d[i]=r;d[i+1]=gg;d[i+2]=b;d[i+3]=255;}
 g.putImageData(id,0,0);});
// A tall deco panel (1 x 4): a turquoise field with a cream stylised avatar — the rayed head, the great eye, chevron
// body, three vertical lines — the pier ornament of the temples. Plain UVs; never tiles.
TEX.dDecoPanel=canvasTex(64,256,(g,w,h)=>{g.fillStyle='#3f9a88';g.fillRect(0,0,w,h);g.fillStyle='#e4c69a';
 g.fillRect(3,3,w-6,3);g.fillRect(3,h-6,w-6,3);g.fillRect(3,3,3,h-6);g.fillRect(w-6,3,3,h-6);
 for(let k=0;k<7;k++){const a=Math.PI*(k/6);g.fillRect(32+Math.cos(a)*22-2,44-Math.sin(a)*20-8,4,12);}   // rays
 g.fillRect(18,40,28,26);g.fillStyle='#3f9a88';g.fillRect(24,48,16,10);g.fillStyle='#e4c69a';g.fillRect(29,50,6,6);   // head, eye
 g.fillRect(14,72,36,4);for(let k=0;k<5;k++){g.fillRect(16+k*8,80,4,60);}                                   // shoulders, five lines
 for(let k=0;k<4;k++){const y=150+k*22;g.beginPath();g.moveTo(14,y);g.lineTo(32,y+10);g.lineTo(50,y);g.lineTo(50,y+5);g.lineTo(32,y+15);g.lineTo(14,y+5);g.fill();}   // chevrons
 g.fillRect(22,238,20,8);g.fillRect(28,232,8,6);});
TEX.dDecoPanel.wrapS=TEX.dDecoPanel.wrapT=THREE.ClampToEdgeWrapping;
// Diamond-checker tile, 2 m: ochre, turquoise and cream lozenges with dark grout.
TEX.dChecker=canvasTex(128,128,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;const S=32;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;const u=x/S,v=y/S;const a=Math.floor(u+v),b=Math.floor(u-v+64);const k=((a%2)+2*(((b%2)+2)%2));
  const fu=(u+v)%1,fv=(u-v+64)%1;const grout=fu<.06||fv<.06;const COL=[[204,140,72],[70,150,134],[228,206,166],[184,110,64]];let c=COL[k%4];
  const n=(fbm(x/7,y/7,3.3,2)-.5)*18;let r=c[0]+n,gg=c[1]+n,bb=c[2]+n;if(grout){r*=.45;gg*=.45;bb*=.45;}d[i]=r;d[i+1]=gg;d[i+2]=bb;d[i+3]=255;}
 g.putImageData(id,0,0);});
// Banner: a hung cloth with the eye of The God as its device, GREY so the field takes the tint; the device stays pale.
TEX.dBanner=canvasTex(64,192,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;const u=x/w-.5,v=y/h;let val=112+(fbm(x/6,y/6,2.2,2)-.5)*18+((x%3<1)?-6:0);
  const r=Math.hypot(u*2.2,(v-.36)*2.4);if(r<.34&&r>.24)val=236;if(r<.11)val=236;                       // the eye: ring + pupil
  for(let k=0;k<7;k++){const a=Math.PI*(k/6);const rx=Math.cos(a)*.42,ry=-.36-Math.sin(a)*.42*.45;if(Math.abs(u-rx)<.03&&Math.abs(v-ry+.36-.36)<.04)val=236;}   // rays
  if(v>.62&&v<.66)val=236;if(v>.70&&v<.74)val=236;                                                     // two bars
  if(v>.94&&((x%6)<3))val=0;if(v<.03)val=200;if(Math.abs(u)>.47)val*=.7;
  d[i]=val;d[i+1]=val;d[i+2]=val;d[i+3]=255;}
 g.putImageData(id,0,0);});
// Turf: cropped grass over a mound, greyscale (tinted green per instance); mole-hills of bare earth.
TEX.dTurf=canvasTex(256,256,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;let v=170+(fbm(x/30,y/30,1.9,3)-.5)*40+(fbm(x/4,y/4,4.4,2)-.5)*44;
  const bare=fbm(x/22,y/22,7.3,2);if(bare>.76)v=140+(bare-.76)*200;d[i]=v;d[i+1]=v*1.02;d[i+2]=v*.78;d[i+3]=255;}
 g.putImageData(id,0,0);});
// Ground for the showcase: the SW lowlands — packed earth, grass, a hoof-worn plaza around each site.
TEX.dGround=canvasTex(512,512,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;const n=fbm(x/60,y/60,.7,3),n2=fbm(x/7,y/7,3.2,2),gr=clamp((fbm(x/40,y/40,5.5,2)-.42)*3,0,1);
  let r=132+(n-.5)*50+(n2-.5)*22,gg=102+(n-.5)*36+(n2-.5)*14,b=70+(n-.5)*26;
  r=lerp(r,78+n2*30,gr);gg=lerp(gg,112+n2*36,gr);b=lerp(b,48,gr);d[i]=r;d[i+1]=gg;d[i+2]=b;d[i+3]=255;}
 g.putImageData(id,0,0);});
// Pantile (for the Vothic embassy hall) and blue-and-white mosaic (the Historians'): short re-descriptions of the
// Iziz ported kit's vp* maps, kept here so the Dalab kit needs nothing from 75/76.
TEX.dTile=canvasTex(128,128,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;const row=Math.floor(y/19),fy=y%19,off=(row%2)*8,fx=(x+off)%16,tx=Math.floor((x+off)/16);
  const curve=Math.sin(fx/16*Math.PI);let v=150+curve*46+(h3(tx*1.7,row*2.3,3.1)-.5)*30+(fbm(x/9,y/9,4.4,2)-.5)*14;
  if(fy>16)v-=55;else if(fy<1)v+=8;if(fx<1)v-=30;d[i]=v;d[i+1]=v*.92;d[i+2]=v*.86;d[i+3]=255;}
 g.putImageData(id,0,0);});
TEX.dMosaic=canvasTex(128,128,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;const tx=Math.floor(x/8),ty=Math.floor(y/8),grout=(x%8<1)||(y%8<1);
  const u=(x/128)%.5,vv=(y/128);const diamond=Math.abs(u-.25)+Math.abs(vv-.5)<.24;const blue=diamond?(Math.abs(u-.25)+Math.abs(vv-.5)>.12):false;
  let r,gg,b;if(blue){r=42+h3(tx,ty,1)*30;gg=106+h3(tx,ty,2)*40;b=176+h3(tx,ty,3)*40;}else{r=236+h3(tx,ty,4)*14;gg=232+h3(tx,ty,5)*12;b=218+h3(tx,ty,6)*14;}
  if(diamond&&!blue){r=216;gg=150+h3(tx,ty,7)*30;b=48;}if(grout){r*=.55;gg*=.55;b*=.55;}d[i]=r;d[i+1]=gg;d[i+2]=b;d[i+3]=255;}
 g.putImageData(id,0,0);});
// the showcase ground swaps to the lowlands map (MAT.dirt was made in 69b against TEX.dirt)
MAT.dirt.map=TEX.dGround;MAT.dirt.needsUpdate=true;

// ---------------------------------------------------------------- materials
MAT.dRammed=new THREE.MeshStandardMaterial({map:TEX.dRammed,color:0xffffff,roughness:.98,metalness:0,side:DS});vWorldUV(MAT.dRammed,.5);
MAT.dRelief=new THREE.MeshStandardMaterial({map:TEX.dRelief,color:0xffffff,roughness:.95,metalness:0,side:DS});vWorldUV(MAT.dRelief,.25);
MAT.dMural=new THREE.MeshStandardMaterial({map:TEX.dMural,color:0xffffff,roughness:.94,metalness:0,side:DS});vWorldUV(MAT.dMural,.5);   // boxes: a 2 m band shows the whole frieze and tiles along the wall
MAT.dMuralP=new THREE.MeshStandardMaterial({map:TEX.dMural,color:0xffffff,roughness:.94,metalness:0,side:DS});                          // planes: one whole tile stretched to the plane (round-house facets)
for(const v of[1,2,3]){MAT['dMural'+v]=new THREE.MeshStandardMaterial({map:TEX['dMural'+v],color:0xffffff,roughness:.94,metalness:0,side:DS});vWorldUV(MAT['dMural'+v],.5);MAT['dMuralP'+v]=new THREE.MeshStandardMaterial({map:TEX['dMural'+v],color:0xffffff,roughness:.94,metalness:0,side:DS});}
MAT.dReliefTq=new THREE.MeshStandardMaterial({map:TEX.dReliefTq,color:0xffffff,roughness:.9,metalness:0,side:DS});vWorldUV(MAT.dReliefTq,.25);
MAT.dDecoPanel=new THREE.MeshStandardMaterial({map:TEX.dDecoPanel,color:0xffffff,roughness:.9,metalness:0,side:DS});
MAT.dChecker=new THREE.MeshStandardMaterial({map:TEX.dChecker,color:0xffffff,roughness:.7,metalness:0,side:DS});vWorldUV(MAT.dChecker,.5);
MAT.dBanner=new THREE.MeshStandardMaterial({map:TEX.dBanner,color:0xffffff,roughness:.9,metalness:0,side:DS});                          // plain UVs: the device must not tile
MAT.dTurf=new THREE.MeshStandardMaterial({map:TEX.dTurf,color:0xffffff,roughness:1,metalness:0,side:DS});vWorldUV(MAT.dTurf,.25);
// a mound is a real mesh (lathe), whose UVs are the geometry's 0..1: this copy tiles the turf across it by repeat
MAT.dTurfMesh=new THREE.MeshStandardMaterial({map:(()=>{const t=TEX.dTurf.clone();t.needsUpdate=true;t.repeat.set(24,8);return t;})(),color:vC(0x6a9a44),roughness:1,metalness:0,side:DS});   // a mesh has no instance tint: the colour lives on the material
MAT.dTile=new THREE.MeshStandardMaterial({map:TEX.dTile,color:0xffffff,roughness:.9,metalness:0,side:DS});vWorldUV(MAT.dTile,.5);
MAT.dMosaic=new THREE.MeshStandardMaterial({map:TEX.dMosaic,color:0xffffff,roughness:.45,metalness:.05,side:DS});vWorldUV(MAT.dMosaic,1);
MAT.dGilt=new THREE.MeshStandardMaterial({color:0xd0a53c,roughness:.32,metalness:.75});
MAT.dGod=new THREE.MeshBasicMaterial({color:0x5fe0cc});                                              // The God's light: unlit, so it IS the light (night)
MAT.dGodDay=new THREE.MeshStandardMaterial({color:0x163a3a,metalness:.6,roughness:.3,side:DS});     // the same pane by day: dark green glass
// the spill of a light: a radial card, teal, additive — the same idea as the Ancients' ember card
TEX.dGlow=canvasTex(64,64,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;const rad=Math.hypot(x-w/2,y-h/2)/(w/2);const a=Math.pow(clamp(1-rad,0,1),2.4);d[i]=150;d[i+1]=240;d[i+2]=225;d[i+3]=clamp(a,0,1)*255;}
 g.putImageData(id,0,0);});
TEX.dGlow.wrapS=TEX.dGlow.wrapT=THREE.ClampToEdgeWrapping;
MAT.dGodGlow=new THREE.MeshBasicMaterial({map:TEX.dGlow,color:0xffffff,transparent:true,opacity:.55,blending:THREE.AdditiveBlending,depthWrite:false,fog:false,side:DS});   // spill halo, night

// ---------------------------------------------------------------- geometry
const DDRUM=new THREE.CylinderGeometry(1,1,1,24).translate(0,.5,0);         // base at y=0, round enough for a house
const DDRUMB=new THREE.CylinderGeometry(.93,1,1,24).translate(0,.5,0);      // battered drum
const DRING=new THREE.TorusGeometry(1,.08,6,32);
const DCONESH=new THREE.ConeGeometry(1,1,24).translate(0,.5,0);
const DDOMELOW=new THREE.SphereGeometry(1,24,8,0,TAU,0,Math.PI/2);

// ---------------------------------------------------------------- kit items
kdef('dEarth',VBOX,MAT.dRammed);kdef('dEarthBat',VBATTER,MAT.dRammed);kdef('dEarthDrum',DDRUM,MAT.dRammed);kdef('dEarthDrumB',DDRUMB,MAT.dRammed);kdef('dEarthDome',DDOMELOW,MAT.dRammed);
kdef('dRelief',VBOX,MAT.dRelief);kdef('dReliefTq',VBOX,MAT.dReliefTq);kdef('dDecoPanel',VPLANE,MAT.dDecoPanel);kdef('dChecker',VBOX,MAT.dChecker);kdef('dReliefBat',VBATTER,MAT.dRelief);kdef('dReliefDrum',DDRUM,MAT.dRelief);
kdef('dStoneDrum',DDRUM,MAT.stone);kdef('dStoneDrumB',DDRUMB,MAT.stone);kdef('dStoneDome',DDOMELOW,MAT.stone);kdef('dStonePyr',VPYR,MAT.stone);
kdef('dMural',VPLANE,MAT.dMuralP);kdef('dMuralB',VBOX,MAT.dMural);for(const v of[1,2,3]){kdef('dMural'+v,VPLANE,MAT['dMuralP'+v]);kdef('dMuralB'+v,VBOX,MAT['dMural'+v]);}
const DMURALS=['dMural','dMural1','dMural2','dMural3'],DMURALBS=['dMuralB','dMuralB1','dMuralB2','dMuralB3'];
kdef('dBanner',VPLANE,MAT.dBanner);
kdef('dTurf',VBOX,MAT.dTurf);kdef('dTurfDome',DDOMELOW,MAT.dTurf);kdef('dTurfDrum',DDRUMB,MAT.dTurf);kdef('dTurfCone',DCONESH,MAT.dTurf);
kdef('dWoodDrum',DDRUM,MAT.woodV);kdef('dStaveDrum',new THREE.CylinderGeometry(1,1,1,18).translate(0,.5,0),MAT.woodV);
kdef('dConeSh',DCONESH,MAT.shingle);kdef('dConeT',DCONESH,MAT.thatch);kdef('dConeTile',DCONESH,MAT.dTile);kdef('dConeCu',DCONESH,MAT.verdigris);kdef('dConeScrap',DCONESH,MAT.corrugate);
kdef('dTile',VBOX,MAT.dTile);kdef('dGableTile',VGABLE,MAT.dTile);kdef('dHipTile',VHIP,MAT.dTile);kdef('dPyrTile',VPYR,MAT.dTile);
kdef('dMosaic',VBOX,MAT.dMosaic);kdef('dGilt',VBOX,MAT.dGilt);kdef('dGiltDome',VDOME,MAT.dGilt);kdef('dGiltBall',VBALL,MAT.dGilt);
kdef('dPanelDome',VDOME,MAT.white);kdef('dRustDome',VDOME,MAT.rust);kdef('dPanelDrum',DDRUM,MAT.white);kdef('dRustDrum',DDRUM,MAT.rust);
kdef('dGlow',VBOX,MAT.dGod);kdef('dGlowDay',VBOX,MAT.dGodDay);kdef('dGodBall',VBALL,MAT.dGod);kdef('dGlassBall',VBALL,MAT.darkGlass);kdef('dGodStrip',new THREE.BoxGeometry(1,.14,.14),MAT.dGod);kdef('dGodHalo',VPLANE,MAT.dGodGlow);
MAT.dHide=new THREE.MeshStandardMaterial({color:0xffffff,roughness:.85,metalness:0});   // animal hide: tinted per instance
kdef('dHideBall',VBALL,MAT.dHide);kdef('dHideCone',VCONE,MAT.dHide);kdef('dHideBox',VBOX,MAT.dHide);kdef('dHideDrum',DDRUM,MAT.dHide);
kdef('dRing',DRING,MAT.iron);kdef('dRopeRing',DRING,MAT.tarp);
// what the hour toggles (see 94-dalab-light.js): The God's light and the hearth fires by night, dark glass by day
const DNIGHT_ITEMS=['dGlow','dGodBall','dGodStrip','dGodHalo','fireWin','ember','emberB'];
const DDAY_ITEMS=['dGlowDay','dGlassBall'];
