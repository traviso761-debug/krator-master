// ================================================================= IZIZ VERNACULAR — materials + kit items
// What the Izani build today, in timber, reclaimed metal and (for the rich)
// stone. Every texture here is painted NEAR-GREY and WARM so that the per-
// instance colour does the tinting — one wood map serves grey driftwood and
// oiled dark hardwood alike, one stone map serves sand and orange ashlar. The
// exceptions are the salvage maps (corrugate/panel/rust), which come from the
// Ancients kit and carry their own colour: salvage is not tinted, it is what it is.
//
// Instance colours: hex values below are sRGB as a painter would pick them, and
// vC() converts once to linear at the write — r128 does not convert instance
// colours (lesson from the biome kit), so without this every tint renders pale.
function vC(hex,k){const c=new THREE.Color(hex).convertSRGBToLinear();if(k!==undefined)c.multiplyScalar(k);return c;}

// The old Iziz palette (sands and oranges) and the timber/adobe tones of the set.
const VPAL={
 sand:[0xe9cb8c,0xdcb474,0xcf9d5b,0xe2ab5e,0xf1dba6,0xe6bd7e,0xd4a05a,0xc8a26a],   // plaster, stone tints
 orange:[0xe07a2a,0xc4641e,0xf2a24a,0xd8893c],                                     // the wall colour of Iziz; stone accents, banners
 adobe:[0xc98f5c,0xd6a06a,0xb87d4c,0xe0b07a,0xa9713f],
 woodPoor:[0x9a8c78,0x8a7a66,0xa89a86,0x7c6e5e],                                   // grey, weathered
 woodMid:[0x9a6a42,0x8a5a36,0xa87a4e,0x7a4e30],                                    // sawn, some oil
 woodRich:[0x5a3a24,0x6a4630,0x4a2e1c,0x7a4e34],                                   // dark hardwood
 awning:[0xe07a2a,0xe07a2a,0xf2a24a,0xd8893c,0xc9442a,0xe0a030,0x2f8f8a,0xb8552a,0xe07a2a],   // orange-led (Travis): 5 of 9 draws are Iziz orange, teal is the accent
 trim:[0xe07a2a,0xd8893c,0xc4641e,0xb8552a],                                                   // painted timber trim: fascias, shutters, doors on middle/rich houses
 thatch:[0xb89a5a,0xa88a4e,0xc4a66a,0x9a7e46],
 stone:[0xd8b58a,0xcfa872,0xe0c096,0xc89a62],                                      // rich house ashlar (sandstone)
 stoneDark:[0xb07a48,0xa86e3e,0xc0885a],                                           // string courses / plinths
};
const vPick=a=>a[(rng()*a.length)|0];

// ---------------------------------------------------------------- textures (world units: a 128px tile = 2 m)
TEX.wood=canvasTex(128,128,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;
  const bd=Math.floor(y/16);                                  // 0.25 m boards
  let v=178+(h3(bd*2.7,0,1.9)-.5)*34;                         // board-to-board tone
  v+=(fbm(x/22,y/2.5,4.8,2)-.5)*34;                           // grain along the board
  v+=(fbm(x/5,y/5,7.7,1)-.5)*8;
  if(y%16<1)v-=60;else if(y%16<2)v-=22;                       // shadow gap between boards
  if(((x+bd*37)%128)<2&&y%16>2)v-=30;                         // butt joints, staggered
  const knot=fbm(x/9,y/9,bd*1.3,2);if(knot>.72)v-=(knot-.72)*160;
  d[i]=v;d[i+1]=v*.93;d[i+2]=v*.84;d[i+3]=255;}
 g.putImageData(id,0,0);});
// the same boards turned upright, for posts, staves and barrels (grain must run along the member)
TEX.woodV=canvasTex(128,128,(g,w,h)=>{g.save();g.translate(w/2,h/2);g.rotate(Math.PI/2);g.drawImage(TEX.wood.image,-w/2,-h/2);g.restore();});
TEX.stone=canvasTex(256,256,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;   // ashlar: 4 m tile, blocks 1.2 x 0.6 m, coursed
 const CH=38,BW=76,MJ=3;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;
  const course=Math.floor(y/CH),off=(course%2)*BW/2,bx=Math.floor((x+off)/BW);
  const fx=(x+off)%BW,fy=y%CH;
  const joint=fx<MJ||fy<MJ;
  let v=196+(h3(bx*1.7,course*2.3,4.4)-.5)*30;                // block-to-block tone
  v+=(fbm(x/18,y/18,2.2,3)-.5)*22;                            // weathering mottle
  v+=(fbm(x/3,y/3,9.1,1)-.5)*10;                              // grit
  if(joint)v=118+(fbm(x/4,y/4,1.1,1)-.5)*20;                  // recessed mortar
  else if(fx<MJ+2||fy<MJ+2)v+=10;                             // lit arris
  const damp=clamp((fbm(x/20,y/120,5.5,2)-.5)*3,0,1)*clamp(fy/CH*1.2,0,1);v-=damp*18;
  d[i]=v;d[i+1]=v*.95;d[i+2]=v*.87;d[i+3]=255;}
 g.putImageData(id,0,0);});
TEX.plaster=canvasTex(128,128,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;
  let v=208+(fbm(x/30,y/30,3.3,3)-.5)*26+(fbm(x/4,y/4,6.6,1)-.5)*12;   // trowelled render
  const crack=fbm(x/12,y/12,2.1,2);if(Math.abs(crack-.5)<.006)v-=70;    // hairline cracks
  const patch=fbm(x/40,y/40,8.8,2);if(patch>.68)v-=14;                  // repaired patches a shade off
  d[i]=v;d[i+1]=v*.96;d[i+2]=v*.9;d[i+3]=255;}
 g.putImageData(id,0,0);});
TEX.thatch=canvasTex(128,128,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;
  const row=Math.floor(y/43),fy=y%43;                          // ~0.67 m courses of frond
  let v=172+(h3(Math.floor(x/2)*1.3,row,2.2)-.5)*52;           // strand to strand
  v+=(fbm(x/1.6,y/18,3.1,2)-.5)*36;                            // fibres running down
  v+=(fbm(x/20,y/20,7.7,2)-.5)*18;                             // patchy fading
  v-=clamp((fy-30)/13,0,1)*34;                                 // soft shadow under each course
  if(fy<2)v+=10;                                               // the lit edge of the course above
  d[i]=v;d[i+1]=v*.9;d[i+2]=v*.7;d[i+3]=255;}
 g.putImageData(id,0,0);});
TEX.shingle=canvasTex(128,128,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;   // split timber shingles, 0.25 x 0.5 m
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;
  const row=Math.floor(y/16),off=(row%2)*16,sx=Math.floor((x+off)/32),fx=(x+off)%32,fy=y%16;
  let v=170+(h3(sx*2.1,row*1.7,3.3)-.5)*46+(fbm(x/3,y/9,5.2,1)-.5)*16;
  if(fx<2)v-=40;if(fy>13)v-=50;else if(fy<1)v+=14;
  d[i]=v;d[i+1]=v*.92;d[i+2]=v*.8;d[i+3]=255;}
 g.putImageData(id,0,0);});
TEX.stripes=canvasTex(128,64,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;   // awning cloth: 6 stripes, tinted colour alternates with off-white
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;const on=Math.floor(x/(w/6))%2;
  const weave=((x%3)<1?-1:0)+((y%3)<1?-1:0);const v=(on?250:120)+weave*8+(fbm(x/20,y/20,4,2)-.5)*16;
  d[i]=v;d[i+1]=v;d[i+2]=v;d[i+3]=255;}
 g.putImageData(id,0,0);});
TEX.dirt=canvasTex(512,512,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;   // ground: packed red-brown earth with grass, for the showcase
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;const n=fbm(x/60,y/60,.7,3),n2=fbm(x/7,y/7,3.2,2),gr=clamp((fbm(x/40,y/40,5.5,2)-.5)*3,0,1);
  let r=118+(n-.5)*50+(n2-.5)*22,gg=82+(n-.5)*36+(n2-.5)*14,b=58+(n-.5)*26;
  r=lerp(r,70+n2*30,gr);gg=lerp(gg,98+n2*36,gr);b=lerp(b,40,gr);d[i]=r;d[i+1]=gg;d[i+2]=b;d[i+3]=255;}
 g.putImageData(id,0,0);});

// ---------------------------------------------------------------- world-unit UVs
// Instances share one geometry, so a box's 0..1 UVs would stretch one texture
// tile over a 20 m wall and squash it on a 0.2 m beam. This hook reads the
// instance scale in the vertex shader and picks, per face normal, the two axes
// that face spans, so every map tiles in metres whatever the instance size.
// K = 1 / (metres per texture tile). kbake() carries onBeforeCompile across
// its material clone.
function vWorldUV(mat,K){mat.userData.uvK=K;mat.onBeforeCompile=sh=>{sh.vertexShader=sh.vertexShader.replace('#include <uv_vertex>',
`#ifdef USE_UV
#ifdef USE_INSTANCING
mat4 _im=instanceMatrix;
vec3 _sc=vec3(length(_im[0].xyz),length(_im[1].xyz),length(_im[2].xyz));
vec3 _an=abs(normal);
vec2 _sw=(_an.y>0.5)?vec2(_sc.x,_sc.z):((_an.x>0.5)?vec2(_sc.z,_sc.y):vec2(_sc.x,_sc.y));
vUv=uv*_sw*${K.toFixed(4)};
#else
vUv=uv;
#endif
#endif`);};return mat;}
// A plain mesh keeps the UVs its geometry carries (the kit's lathes and grids are drawn in 8 m tile units, the
// vernacular ones in the material's own tile); only INSTANCES are re-tiled by their scale. Before this the hook
// re-scaled the kit's skyscraper shells by K too, so their panels tiled every 64 m and read as untextured.

// ---------------------------------------------------------------- materials
MAT.wood=new THREE.MeshStandardMaterial({map:TEX.wood,color:0xffffff,roughness:.92,metalness:0,side:DS});
MAT.woodV=new THREE.MeshStandardMaterial({map:TEX.woodV,color:0xffffff,roughness:.92,metalness:0,side:DS});
MAT.void=new THREE.MeshBasicMaterial({color:0x0b0907});   // openings: unlit so a doorway reads as a doorway in any light
MAT.stone=new THREE.MeshStandardMaterial({map:TEX.stone,color:0xffffff,roughness:.96,metalness:0,side:DS});
MAT.plaster=new THREE.MeshStandardMaterial({map:TEX.plaster,color:0xffffff,roughness:.97,metalness:0,side:DS});
MAT.thatch=new THREE.MeshStandardMaterial({map:TEX.thatch,color:0xffffff,roughness:1,metalness:0,side:DS});
MAT.shingle=new THREE.MeshStandardMaterial({map:TEX.shingle,color:0xffffff,roughness:.95,metalness:0,side:DS});
MAT.cloth=new THREE.MeshStandardMaterial({map:TEX.stripes,color:0xffffff,roughness:.9,metalness:0,side:DS});
MAT.iron=new THREE.MeshStandardMaterial({color:0x2e2a26,roughness:.62,metalness:.55});
MAT.clay=new THREE.MeshStandardMaterial({color:0x9a5a38,roughness:.9,metalness:0});
MAT.warmPane=new THREE.MeshBasicMaterial({color:0xffcf8a});          // an electrically lit window: rich + civic only
MAT.bulb=new THREE.MeshBasicMaterial({color:0xfff3d6});
MAT.dirt=new THREE.MeshStandardMaterial({map:TEX.dirt,roughness:1});
vWorldUV(MAT.wood,.5);vWorldUV(MAT.woodV,.5);vWorldUV(MAT.stone,.25);vWorldUV(MAT.plaster,.5);vWorldUV(MAT.thatch,.5);vWorldUV(MAT.shingle,.5);vWorldUV(MAT.cloth,.5);
vWorldUV(MAT.corrugate,.5);vWorldUV(MAT.tarp,.5);vWorldUV(MAT.timber,.5);vWorldUV(MAT.white,.125);vWorldUV(MAT.rust,.125);vWorldUV(MAT.verdigris,.25);vWorldUV(MAT.clay,.5);

// ---------------------------------------------------------------- geometry
// Wedge: base 1x1 at y=0, top (tx x tz) at y=1. tz≈0 gives a gable roof with
// its ridge along local x; tx=tz≈0 gives a pyramid; 0.6/0.6 a battered block.
function vnWedgeGeo(tx,tz){const p=[],uv=[],idx=[];const c=[[-.5,0,-.5],[.5,0,-.5],[.5,0,.5],[-.5,0,.5],[-tx/2,1,-tz/2],[tx/2,1,-tz/2],[tx/2,1,tz/2],[-tx/2,1,tz/2]];
 const faces=[[0,1,5,4],[1,2,6,5],[2,3,7,6],[3,0,4,7],[4,5,6,7],[3,2,1,0]];
 faces.forEach(f=>{const b=p.length/3;f.forEach((vi,i)=>{p.push(...c[vi]);uv.push(i===1||i===2?1:0,i>=2?1:0);});idx.push(b,b+1,b+2,b,b+2,b+3);});
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();return g;}
// A roof SLAB with world-ish UVs so the shingle/thatch courses run across it:
// 1 x 1 x 1 box whose uv is scaled by the caller through the instance? No —
// instances share one geometry, so the texture tiles per unit of scale; the
// maps are drawn at 2 m per tile so a 6 m slab shows 3 courses. Good enough.
const VBOX=new THREE.BoxGeometry(1,1,1);
const VPOST=new THREE.CylinderGeometry(1,1,1,8).translate(0,.5,0);           // base at y=0
const VPOSTB=new THREE.CylinderGeometry(.85,1,1,8).translate(0,.5,0);        // tapering
const VDOME=new THREE.SphereGeometry(1,20,10,0,TAU,0,Math.PI/2);
const VBALL=new THREE.SphereGeometry(1,10,7);
const VCONE=new THREE.ConeGeometry(1,1,10).translate(0,.5,0);
const VPLANE=new THREE.PlaneGeometry(1,1);
const VGABLE=vnWedgeGeo(1,.02), VPYR=vnWedgeGeo(.04,.04), VBATTER=vnWedgeGeo(.86,.86), VHIP=vnWedgeGeo(.5,.04);

// ---------------------------------------------------------------- kit items
kdef('vWood',VBOX,MAT.wood);kdef('vStone',VBOX,MAT.stone);kdef('vPlaster',VBOX,MAT.plaster);kdef('vCorr',VBOX,MAT.corrugate);
kdef('vIron',VBOX,MAT.iron);kdef('vThatchB',VBOX,MAT.thatch);kdef('vShingleB',VBOX,MAT.shingle);kdef('vCopperB',VBOX,MAT.verdigris);
kdef('vPanelB',VBOX,MAT.white);kdef('vRustB',VBOX,MAT.rust);kdef('vClothB',VBOX,MAT.cloth);kdef('vTarpB',VBOX,MAT.tarp);kdef('vClayB',VBOX,MAT.clay);kdef('vDarkB',VBOX,MAT.void);
kdef('vSheet',VPLANE,MAT.corrugate);kdef('vBoard',VPLANE,MAT.wood);kdef('vPlate',VPLANE,MAT.rust);kdef('vPlateW',VPLANE,MAT.white);kdef('vTarp',VPLANE,MAT.tarp);kdef('vCloth',VPLANE,MAT.cloth);
kdef('vPost',VPOST,MAT.woodV);kdef('vPostB',VPOSTB,MAT.woodV);kdef('vPostS',VPOST,MAT.stone);kdef('vPipe',VPOST,MAT.iron);kdef('vPipeR',VPOST,MAT.rust);kdef('vPipeC',VPOST,MAT.verdigris);kdef('vClayPot',VPOSTB,MAT.clay);kdef('vBarrel',new THREE.CylinderGeometry(1,.9,1,10).translate(0,.5,0),MAT.woodV);kdef('vTank',VPOST,MAT.corrugate);kdef('vTankW',new THREE.CylinderGeometry(1,1,1,24).translate(0,.5,0),MAT.white);kdef('vTankR',new THREE.CylinderGeometry(1,1,1,24).translate(0,.5,0),MAT.rust);kdef('vStave',new THREE.CylinderGeometry(1,1,1,14).translate(0,.5,0),MAT.woodV);
kdef('vDomeS',VDOME,MAT.stone);kdef('vDomeC',VDOME,MAT.verdigris);kdef('vDomeP',VDOME,MAT.plaster);kdef('vBall',VBALL,MAT.iron);kdef('vGourd',VBALL,MAT.clay);kdef('vSack',VBALL,MAT.tarp);kdef('vLeaf',VBALL,MAT.moss);
kdef('vConeT',VCONE,MAT.thatch);kdef('vConeC',VCONE,MAT.verdigris);kdef('vConeI',VCONE,MAT.iron);
kdef('vGableS',VGABLE,MAT.shingle);kdef('vGableT',VGABLE,MAT.thatch);kdef('vGableC',VGABLE,MAT.corrugate);kdef('vGableCu',VGABLE,MAT.verdigris);kdef('vGableP',VGABLE,MAT.white);kdef('vGableW',VGABLE,MAT.wood);kdef('vGableSt',VGABLE,MAT.stone);kdef('vGablePl',VGABLE,MAT.plaster);
kdef('vPyrS',VPYR,MAT.stone);kdef('vPyrCu',VPYR,MAT.verdigris);kdef('vPyrT',VPYR,MAT.thatch);kdef('vPyrSh',VPYR,MAT.shingle);kdef('vPyrC',VPYR,MAT.corrugate);
kdef('vBatterS',VBATTER,MAT.stone);kdef('vBatterP',VBATTER,MAT.plaster);kdef('vBatterW',VBATTER,MAT.wood);
kdef('vHipS',VHIP,MAT.shingle);kdef('vHipT',VHIP,MAT.thatch);kdef('vHipCu',VHIP,MAT.verdigris);kdef('vHipC',VHIP,MAT.corrugate);
MAT.ember=new THREE.MeshBasicMaterial({color:0xff7a2a});               // forge/kiln fire — not electric, so allowed anywhere
kdef('vEmber',VBALL,MAT.ember);
kdef('vWinLit',VBOX,MAT.warmPane);kdef('vWinGlass',VBOX,MAT.darkGlass);kdef('vBulb',VBALL,MAT.bulb);kdef('vHoop',new THREE.TorusGeometry(1,.06,5,16),MAT.iron);
kdef('vRope',new THREE.CylinderGeometry(1,1,1,5).translate(0,.5,0),MAT.tarp);
kdef('vFlag',VBOX,MAT.stone);   // paving slabs, tinted
kdef('vRock',VBALL,MAT.stone);kdef('vFinial',VBALL,MAT.verdigris);kdef('vBallW',VBALL,MAT.slab);
