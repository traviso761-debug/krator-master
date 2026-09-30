// ================================================================= XANADU — palette, materials, geometry, kit items (prefix x)
// Palette. sRGB hex as a painter picks them; xC() = vC() (sRGB -> linear once, see 69b).
const xC=vC;
const XPAL={
 wash:[0xf2ede2,0xece6d8,0xf6f1e6,0xe8e0d0],            // whitewash (middle, rich, sacred, civic)
 earth:[0xb89468,0xa8845a,0xc0a070,0x9a7a52],           // rammed earth / mud render (poor, farms, walls)
 ochre:[0xc98a3a,0xd39a48,0xb87a30,0xc27a3c],           // ochre wash: the second colour of the rich and of temples
 redwall:[0xa8382a,0x9a3226,0xb04432],                  // red-earth wash: the upper storey of a sacred building
 maroon:[0x6e2a2a,0x62252a,0x7a3030],                   // the twig band under a parapet
 stone:[0xb8b0a0,0xa9a192,0xc4bcac,0xb0a898],           // dressed grey stone (plinths, arches, civic)
 rubble:[0x9a948a,0x8a8478,0xa8a296,0x958d80],          // fieldstone footings, terraces, walls
 timber:[0xa87a4e,0x9a6a40,0xb88a5a,0x8a6a48],          // sawn timber (cumbas, corbels), some oil
 aged:[0x8a7e70,0x7a6e60,0x958878],                     // grey weathered timber (poor)
 dark:[0x5a3a24,0x6a4630,0x4a2e1c],                     // oiled dark hardwood (rich)
 gold:[0xe0b040,0xd4a030,0xf0c850,0xdcae3c],
 tile:[0x2aa5a0,0x1e3f8a,0x39b0b8,0x2a80a0,0x2aa5a0],   // glazed tile tints: turquoise leads, lapis second
 cloth:[0xa8382a,0xe8a030,0x2a5aa8,0x2f7a4a,0xf4efe4,0x2aa5a0,0x6e2a2a],   // pennants, awnings, valances
 leaf:[0x3f7a34,0x4f9a3a,0x2f6a2a,0x6aa04a],cypress:[0x2a4a2a,0x1f3f24,0x2f5530],
 // painted trim: window frames, corbels, columns, doors — blue and red lead, then turquoise, saffron, green
 trim:[0x2a5aa8,0xa8382a,0x2aa5a0,0xe8a030,0x2f7a4a,0x1e3f8a,0x2a5aa8,0xa8382a],
 turquoise:0x2aa5a0,lapis:0x1e3f8a,white:0xf4efe4,black:0x1a1614,blue:0x2a5aa8,red:0xa8382a,saffron:0xe8a030,green:0x2f7a4a,water:0x3a7a8a,
};

// ---------------------------------------------------------------- world UV with separate u/v tile sizes (the band and valance maps are not square)
// three.js keys a material's compiled program on onBeforeCompile.toString(). A closure built by vWorldUV (vendored)
// or a template-literal xWorldUV prints the same source whatever its K, so every world-UV material shared the first
// compiled program's scale — the stone read at the wash's K, the bath tile at the frieze's. Building the hook with
// Function() bakes the numbers into its source, so each K gets its own program. xUVKey re-hooks the vendored ones.
function xUVKey(mat,Ku,Kv){const src=`#ifdef USE_UV
#ifdef USE_INSTANCING
mat4 _im=instanceMatrix;
vec3 _sc=vec3(length(_im[0].xyz),length(_im[1].xyz),length(_im[2].xyz));
vec3 _an=abs(normal);
vec2 _sw=(_an.y>0.5)?vec2(_sc.x,_sc.z):((_an.x>0.5)?vec2(_sc.z,_sc.y):vec2(_sc.x,_sc.y));
vUv=uv*_sw*vec2(${Ku.toFixed(4)},${Kv.toFixed(4)});
#else
vUv=uv;
#endif
#endif`;mat.onBeforeCompile=new Function('sh',`sh.vertexShader=sh.vertexShader.replace('#include <uv_vertex>',${JSON.stringify(src)});`);return mat;}
function xWorldUV(mat,Ku,Kv){return xUVKey(mat,Ku,Kv);}

// ---------------------------------------------------------------- materials
const xStd=(o)=>new THREE.MeshStandardMaterial(Object.assign({color:0xffffff,roughness:.92,metalness:0,side:DS},o));
MAT.xEarth=xStd({map:TEX.xEarth,roughness:1});MAT.xWash=xStd({map:TEX.xWash,roughness:.96});MAT.xTiles=xStd({map:TEX.xTiles,roughness:.42});
MAT.xPenbey=xStd({map:TEX.xPenbey,roughness:1});MAT.xRubble=xStd({map:TEX.xRubble,roughness:.97});MAT.xRock=xStd({map:TEX.xRock,roughness:1});
MAT.xPaint=xStd({roughness:.72});                                              // painted timber and plaster: the colour is the point
MAT.xGold=xStd({roughness:.36,metalness:.45});                                // gilt: tinted XPAL.gold per instance (double-sided: the wedge and lathe windings differ)
MAT.xGoldDS=xStd({roughness:.36,metalness:.45});                              // gilt planes/boxes seen from both sides
MAT.xMosA=xStd({map:TEX.xMosA,roughness:.5});MAT.xMosB=xStd({map:TEX.xMosB,roughness:.5});MAT.xBand=xStd({map:TEX.xBand,roughness:.6});
MAT.xJali=xStd({map:TEX.xJali,alphaTest:.5,roughness:.9});MAT.xValance=xStd({map:TEX.xValance,alphaTest:.5,roughness:.9});
MAT.xSun=xStd({map:TEX.xSun,alphaTest:.5,roughness:.4,metalness:.3});
MAT.xWater=xStd({roughness:.14,metalness:.25});                               // pools, channels, the mill race (tinted XPAL.water)
MAT.xMeadow=new THREE.MeshStandardMaterial({map:TEX.xMeadow,roughness:1});
vWorldUV(MAT.xEarth,.5);vWorldUV(MAT.xWash,.5);vWorldUV(MAT.xTiles,.5);vWorldUV(MAT.xPenbey,1);vWorldUV(MAT.xRubble,.25);vWorldUV(MAT.xRock,.125);
vWorldUV(MAT.xMosA,.5);vWorldUV(MAT.xMosB,.5);                                 // mosaics tile every 2 m on boxes; planes keep their own 0..1
xWorldUV(MAT.xBand,.5,1.667);xWorldUV(MAT.xJali,1,1);xWorldUV(MAT.xValance,1,2);
for(const k in MAT){const m=MAT[k];if(m&&m.userData&&m.userData.uvK)xUVKey(m,m.userData.uvK,m.userData.uvK);}   // re-hook every vWorldUV material with its own program key

// ---------------------------------------------------------------- geometry
// Persian dome: lathe, base radius 1 at y=0, tip at y=1 (instances scale [r,h,r]); it swells above the drum
const XDOME=new THREE.LatheGeometry([[0,0],[1,0],[1.06,.1],[1.12,.26],[1.08,.44],[.92,.62],[.66,.78],[.38,.9],[.14,.97],[.04,1],[0,1]].map(p=>new THREE.Vector2(p[0],p[1])),20);
// the small bulb (chhatri hoods, jharokha caps, finial bulbs)
const XBULB=new THREE.LatheGeometry([[0,0],[1,0],[1.16,.16],[1.2,.34],[1.02,.56],[.66,.76],[.32,.9],[.08,.98],[0,1]].map(p=>new THREE.Vector2(p[0],p[1])),14);
// drums: 16-sided and 8-sided, base at y=0, a face toward +z
const XDRUM=new THREE.CylinderGeometry(1,1,1,16,1).translate(0,.5,0).rotateY(Math.PI/16);
const XOCT=new THREE.CylinderGeometry(1,1,1,8,1).translate(0,.5,0).rotateY(Math.PI/8);
const XDISC=new THREE.CylinderGeometry(1,1,1,16);                                                     // centred disc (bosses, roundels, pool floors)
const XCOL=new THREE.CylinderGeometry(1,1,1,12).translate(0,.5,0);                                    // round column, base at y=0
// pointed (four-centred) arch cut in a slab: width 1, height 1, depth 1 centred on z; opening 70% of the width
function xnArchGeo(asp,ow,spring){const s=new THREE.Shape();s.moveTo(-.5,0);s.lineTo(-ow/2,0);s.lineTo(-ow/2,spring);
 s.quadraticCurveTo(-ow/2,spring+ow*.44,0,spring+ow*.62);s.quadraticCurveTo(ow/2,spring+ow*.44,ow/2,spring);
 s.lineTo(ow/2,0);s.lineTo(.5,0);s.lineTo(.5,asp);s.lineTo(-.5,asp);s.lineTo(-.5,0);
 const g=new THREE.ExtrudeGeometry(s,{depth:1,bevelEnabled:false,curveSegments:8});g.translate(0,0,-.5);g.scale(1,1/asp,1);return g;}
const XARCH=xnArchGeo(1.35,.7,.7);
// a solid pointed-arch profile (blind arches, the merlon caps): width 1, height 1, depth 1 centred
function xnArchSolidGeo(){const s=new THREE.Shape();s.moveTo(-.5,0);s.lineTo(-.5,.55);s.quadraticCurveTo(-.5,.88,0,1);s.quadraticCurveTo(.5,.88,.5,.55);s.lineTo(.5,0);s.lineTo(-.5,0);
 return new THREE.ExtrudeGeometry(s,{depth:1,bevelEnabled:false,curveSegments:6}).translate(0,0,-.5);}
const XARCHS=xnArchSolidGeo();
// bracket arm (corbel / roof horn): a quarter-round profile extruded, 1 x 1 x 1 centred
function xArmShape(){const s=new THREE.Shape();s.moveTo(0,0);s.lineTo(1,0);s.lineTo(1,.55);s.quadraticCurveTo(.9,.95,.55,1);s.lineTo(0,1);s.lineTo(0,0);return s;}
const XARM=new THREE.ExtrudeGeometry(xArmShape(),{depth:1,bevelEnabled:false,curveSegments:5}).translate(-.5,-.5,-.5);
// battered blocks: the Tibetan wall leans in. Four batters; xnWall picks the one nearest the wanted angle.
const XBAT96=vnWedgeGeo(.96,.96),XBAT92=vnWedgeGeo(.92,.92),XBAT86=vnWedgeGeo(.86,.86),XBAT80=vnWedgeGeo(.8,.8);
// a curtain wall: battered across its thickness only (local z), full length at the top, so segments meet without gaps
const XBATZ=vnWedgeGeo(1,.8);
const XLEAF=new THREE.IcosahedronGeometry(1,0);

// ---------------------------------------------------------------- kit items
kdef('xEarthB',VBOX,MAT.xEarth);kdef('xWashB',VBOX,MAT.xWash);kdef('xTilesB',VBOX,MAT.xTiles);kdef('xBandB',VBOX,MAT.xPenbey);kdef('xRubB',VBOX,MAT.xRubble);kdef('xRockB',VBOX,MAT.xRock);
kdef('xPaint',VBOX,MAT.xPaint);kdef('xGoldB',VBOX,MAT.xGoldDS);kdef('xMosAB',VBOX,MAT.xMosA);kdef('xMosBB',VBOX,MAT.xMosB);kdef('xFriezeB',VBOX,MAT.xBand);kdef('xWaterB',VBOX,MAT.xWater);
kdef('xMosA',VPLANE,MAT.xMosA);kdef('xMosB',VPLANE,MAT.xMosB);kdef('xJali',VPLANE,MAT.xJali);kdef('xValance',VPLANE,MAT.xValance);kdef('xPaintPl',VPLANE,MAT.xPaint);kdef('xSun',VPLANE,MAT.xSun);
kdef('xGold',VBALL,MAT.xGold);kdef('xPaintBall',VBALL,MAT.xPaint);kdef('xLeaf',XLEAF,MAT.moss);kdef('xConeL',VCONE,MAT.moss);kdef('xBoulder',new THREE.IcosahedronGeometry(1,1),MAT.xRock);
kdef('xDomeW',XDOME,MAT.xWash);kdef('xDomeT',XDOME,MAT.xTiles);kdef('xDomeG',XDOME,MAT.xGold);kdef('xDomeS',XDOME,MAT.stone);kdef('xDomeM',XDOME,MAT.xMosB);
kdef('xBulbT',XBULB,MAT.xTiles);kdef('xBulbG',XBULB,MAT.xGold);kdef('xBulbW',XBULB,MAT.xWash);
kdef('xDrumW',XDRUM,MAT.xWash);kdef('xDrumT',XDRUM,MAT.xTiles);kdef('xDrumS',XDRUM,MAT.stone);kdef('xDrumM',XDRUM,MAT.xMosA);kdef('xDrumE',XDRUM,MAT.xEarth);
kdef('xOctW',XOCT,MAT.xWash);kdef('xOctT',XOCT,MAT.xTiles);kdef('xOctS',XOCT,MAT.stone);kdef('xOctP',XOCT,MAT.xPaint);
kdef('xDisc',XDISC,MAT.xPaint);kdef('xDiscG',XDISC,MAT.xGoldDS);kdef('xDiscS',XDISC,MAT.stone);kdef('xDiscWater',XDISC,MAT.xWater);
kdef('xCol',XCOL,MAT.xPaint);kdef('xColS',XCOL,MAT.stone);kdef('xColG',XCOL,MAT.xGold);kdef('xColW',XCOL,MAT.woodV);
kdef('xArchW',XARCH,MAT.xWash);kdef('xArchS',XARCH,MAT.stone);kdef('xArchM',XARCH,MAT.xMosA);kdef('xArchE',XARCH,MAT.xEarth);kdef('xArchP',XARCH,MAT.xPaint);
kdef('xArcS',XARCHS,MAT.stone);kdef('xArcW',XARCHS,MAT.xWash);kdef('xArcM',XARCHS,MAT.xMosB);kdef('xArcP',XARCHS,MAT.xPaint);kdef('xArcDark',XARCHS,MAT.void);
kdef('xArm',XARM,MAT.xPaint);kdef('xArmW',XARM,MAT.wood);kdef('xArmS',XARM,MAT.stone);kdef('xArmG',XARM,MAT.xGoldDS);
kdef('xBatW96',XBAT96,MAT.xWash);kdef('xBatW92',XBAT92,MAT.xWash);kdef('xBatW86',XBAT86,MAT.xWash);kdef('xBatW80',XBAT80,MAT.xWash);
kdef('xBatE96',XBAT96,MAT.xEarth);kdef('xBatE92',XBAT92,MAT.xEarth);kdef('xBatE86',XBAT86,MAT.xEarth);kdef('xBatE80',XBAT80,MAT.xEarth);
kdef('xBatS96',XBAT96,MAT.xRubble);kdef('xBatS92',XBAT92,MAT.xRubble);kdef('xBatS86',XBAT86,MAT.xRubble);kdef('xBatS80',XBAT80,MAT.xRubble);
kdef('xBatD96',XBAT96,MAT.stone);kdef('xBatD92',XBAT92,MAT.stone);kdef('xBatD86',XBAT86,MAT.stone);kdef('xBatD80',XBAT80,MAT.stone);
kdef('xWallD',XBATZ,MAT.stone);kdef('xWallS',XBATZ,MAT.xRubble);kdef('xWallW',XBATZ,MAT.xWash);kdef('xWallE',XBATZ,MAT.xEarth);
kdef('xHipG',VHIP,MAT.xGold);kdef('xPyrG',VPYR,MAT.xGold);kdef('xHipT',VHIP,MAT.xTiles);kdef('xPyrT',VPYR,MAT.xTiles);kdef('xGableT',VGABLE,MAT.xTiles);kdef('xHipE',VHIP,MAT.xEarth);kdef('xGableE',VGABLE,MAT.xEarth);
kdef('xConeG',VCONE,MAT.xGold);kdef('xConeT',VCONE,MAT.xTiles);kdef('xConeW',VCONE,MAT.xWash);kdef('xConeP',VCONE,MAT.xPaint);
