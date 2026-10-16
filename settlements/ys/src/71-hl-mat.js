// ================================================================= HIGHLANDS — materials, geometry, kit items (prefix h)
// Palette. sRGB hex as a painter picks them; hC() = vC() (sRGB -> linear once, see 69b).
const hC=vC;
const HPAL={
 pine:[0xc08850,0xb07a44,0xc89a60,0xa87040],            // fresh-hewn logs and boards (Rustic, Republican poor/middle)
 aged:[0x8a7e70,0x7a6e60,0x958878,0x847462],            // silver-grey weathered timber (poor, tribal)
 tar:[0x4a3426,0x3a2a20,0x55392a,0x42302a],             // tarred / oiled dark timber (Norse halls, Republican rich)
 redwood:[0x5e2a1c,0x6a3020,0x542418,0x6e3624],         // the Peles red-brown of half-timber and loggias
 falu:[0x8a2e22,0x9a3a28,0x7e2a20],                     // red-painted boards (Rustic)
 stucco:[0xeee3c8,0xe8dcc0,0xf2ead6,0xe4d4b0],          // cream render (Republican middle/rich/civic)
 saxon:[0xe0b870,0xd8c0a0,0xc8d0b0,0xe4c89a,0xd8a888], // painted Transylvanian-Saxon render: ochre, sand, sage, apricot, rose
 ashlar:[0xd8d0bc,0xc8c0ac,0xe0d8c4,0xcfc4a8],          // limestone quoins, towers, civic fronts
 rubble:[0x9a948a,0x8a8478,0xa8a296,0x958d80],          // fieldstone socles
 slate:[0x565c66,0x4c525c,0x60666e,0x5a5a62],           // Peles slate
 roofGreen:[0x3f7f5f,0x2f7a6a,0x4a8a5a,0x357060],       // painted iron / glazed scale roofs (civic)
 roofRed:[0xa0402a,0x8a3424,0xb04a30],
 shingle:[0x9a8a78,0x8a7a68,0xa8987e,0xb0a28c],         // aspen / larch shingle, silvered
 bamboo:[0xc8b870,0xb8a860,0xa89850,0xd0c080],
 turf:[0xa0b080,0x90a070,0xb0b888],
 gold:[0xd4a03a,0xc89030,0xe0b048],
 // painted trim — the carving colours, NW-coast led: teal and red on black and white, with ochre and a Russian blue
 trim:[0x2e9488,0xb3322a,0xefe7d6,0x2e9488,0xb3322a,0x3a6aa8,0xd19a3a],
 teal:0x2e9488,red:0xb3322a,white:0xefe7d6,black:0x201a18,blue:0x3a6aa8,green:0x3f7a4a,ochre:0xd19a3a,
};

// ---------------------------------------------------------------- world UV with separate u/v tile sizes
// The lace and frieze maps are not square, so they need Ku != Kv: the shared vWorldUV (core/materials/opt/
// 69a-world-uv.js) takes the second K. This used to be its own closure, and like the old vWorldUV it gave every
// Ku/Kv the same shader program (three.js keys on the hook's source text), so all of them drew at one scale.
function hWorldUV(mat,Ku,Kv){return vWorldUV(mat,Ku,Kv);}

// ---------------------------------------------------------------- materials
const hStd=(o)=>new THREE.MeshStandardMaterial(Object.assign({color:0xffffff,roughness:.92,metalness:0,side:DS},o));
MAT.logs=hStd({map:TEX.logs});MAT.scale=hStd({map:TEX.scale,roughness:.78});MAT.rubbleW=hStd({map:TEX.rubble,roughness:.97});
MAT.turf=hStd({map:TEX.turf,roughness:1});MAT.bamboo=hStd({map:TEX.bambooV,roughness:.7});MAT.bmat=hStd({map:TEX.bmat,roughness:.95});
MAT.paint=hStd({roughness:.72});                         // painted timber: trims, brackets, shutters — no grain, the colour is the point
MAT.gold=hStd({color:0xffffff,roughness:.38,metalness:.35,side:THREE.FrontSide});
MAT.formA=hStd({map:TEX.formA,roughness:.8});MAT.formW=hStd({map:TEX.formW,roughness:.8});MAT.formV=hStd({map:TEX.formV,roughness:.8});
MAT.formT=hStd({map:TEX.formT,roughness:.8});MAT.formB=hStd({map:TEX.formB,roughness:.8});MAT.formF=hStd({map:TEX.formF,roughness:.8});
MAT.totem=hStd({map:TEX.totem,roughness:.82,side:THREE.FrontSide});MAT.totemP=hStd({map:TEX.totemP,roughness:.82,side:THREE.FrontSide});
MAT.wing=hStd({map:TEX.wing,alphaTest:.5,roughness:.85});
MAT.laceV=hStd({map:TEX.laceV,alphaTest:.5,roughness:.75});MAT.laceB=hStd({map:TEX.laceB,alphaTest:.5,roughness:.8});
MAT.clock=hStd({map:TEX.clock,roughness:.6});
MAT.meadow=new THREE.MeshStandardMaterial({map:TEX.meadow,roughness:1});
MAT.rock=hStd({map:TEX.rock,roughness:1});                // cliff faces (plain mesh, UVs from the geometry)
vWorldUV(MAT.logs,.5);vWorldUV(MAT.scale,.5);vWorldUV(MAT.rubbleW,.25);vWorldUV(MAT.turf,.5);vWorldUV(MAT.bamboo,.5);vWorldUV(MAT.bmat,.5);
hWorldUV(MAT.formF,.5,2);          // frieze: 2 m x 0.5 m tile (boards 0.5 m tall show one band)
hWorldUV(MAT.laceV,.5,2);          // valance: 2 m x 0.5 m tile
hWorldUV(MAT.laceB,1.25,1);        // balustrade: 0.8 m x 1 m tile (four 0.2 m boards)

// ---------------------------------------------------------------- geometry
// onion dome: lathe, base radius 1 at y=0, tip at y=1 (instances scale [r,h,r])
const HONION=new THREE.LatheGeometry([[0,0],[1,0],[1.1,.1],[1.2,.24],[1.18,.36],[1.02,.5],[.72,.66],[.4,.8],[.16,.9],[.05,.97],[.02,1.0],[0,1.0]].map(p=>new THREE.Vector2(p[0],p[1])),16);
// helm / bulb for small cupolas: a squatter, fatter onion
const HBULB=new THREE.LatheGeometry([[0,0],[1,0],[1.25,.2],[1.3,.4],[1.1,.62],[.6,.82],[.2,.94],[0,1]].map(p=>new THREE.Vector2(p[0],p[1])),14);
// tented (shatior) roof and octagonal drum: 8 sides, a face (not a corner) toward +z
const HTENT=new THREE.CylinderGeometry(.015,1,1,8,1).translate(0,.5,0).rotateY(Math.PI/8);
const HOCT=new THREE.CylinderGeometry(1,1,1,8,1).translate(0,.5,0).rotateY(Math.PI/8);
// keel arch (kokoshnik / bochka): the Russian ogee, width 1 (x -.5..+.5), height 1 (y 0..1), extruded 1 along z (centred)
function hKeelShape(){const s=new THREE.Shape();s.moveTo(-.5,0);s.lineTo(-.5,.3);s.bezierCurveTo(-.5,.66,-.16,.62,-.04,.86);s.quadraticCurveTo(0,.94,0,1);
 s.quadraticCurveTo(0,.94,.04,.86);s.bezierCurveTo(.16,.62,.5,.66,.5,.3);s.lineTo(.5,0);s.lineTo(-.5,0);return s;}
const HKEEL=new THREE.ExtrudeGeometry(hKeelShape(),{depth:1,bevelEnabled:false,curveSegments:10}).translate(0,0,-.5);
// log end: a short horizontal cylinder along local x (instances scale [length, r, r])
const HLOG=new THREE.CylinderGeometry(1,1,1,8).rotateZ(Math.PI/2);
// a pole (totem) — more sides than a post, so the carving reads
const HPOLE=new THREE.CylinderGeometry(1,1,1,16).translate(0,.5,0);
// curved roof tile for the "swept" eave corners and dougong arms: a quarter-round bracket profile, extruded (1 x 1 x 1)
function hArmShape(){const s=new THREE.Shape();s.moveTo(0,0);s.lineTo(1,0);s.lineTo(1,.55);s.quadraticCurveTo(.9,.95,.55,1);s.lineTo(0,1);s.lineTo(0,0);return s;}
const HARM=new THREE.ExtrudeGeometry(hArmShape(),{depth:1,bevelEnabled:false,curveSegments:5}).translate(-.5,-.5,-.5);

// ---------------------------------------------------------------- kit items
kdef('hLogB',VBOX,MAT.logs);kdef('hScaleB',VBOX,MAT.scale);kdef('hRubB',VBOX,MAT.rubbleW);kdef('hTurfB',VBOX,MAT.turf);kdef('hBMatB',VBOX,MAT.bmat);
kdef('hPaint',VBOX,MAT.paint);kdef('hGoldB',VBOX,MAT.gold);kdef('hGold',VBALL,MAT.gold);kdef('hPaintBall',VBALL,MAT.paint);
kdef('hFormA',VPLANE,MAT.formA);kdef('hFormW',VPLANE,MAT.formW);kdef('hFormV',VPLANE,MAT.formV);kdef('hFormT',VPLANE,MAT.formT);kdef('hFormB',VPLANE,MAT.formB);kdef('hFormF',VBOX,MAT.formF);
kdef('hLaceV',VPLANE,MAT.laceV);kdef('hLaceB',VPLANE,MAT.laceB);kdef('hWing',VPLANE,MAT.wing);kdef('hClock',VPLANE,MAT.clock);
kdef('hTotem',HPOLE,MAT.totem);kdef('hTotemP',HPOLE,MAT.totemP);
kdef('hBamboo',new THREE.CylinderGeometry(1,1,1,7).translate(0,.5,0),MAT.bamboo);kdef('hBambooC',new THREE.CylinderGeometry(.5,.5,1,7),MAT.bamboo);   // hBambooC is CENTRED (for beam(): w = diameter)
kdef('hLogEnd',HLOG,MAT.woodV);kdef('hLogX',HLOG,MAT.logs);   // log ends at notched corners; whole logs lying along x (beams, woodpiles, cliff struts)
kdef('hOnionG',HONION,MAT.gold);kdef('hOnionSc',HONION,MAT.scale);kdef('hOnionSh',HONION,MAT.shingle);
kdef('hBulbG',HBULB,MAT.gold);kdef('hBulbSc',HBULB,MAT.scale);kdef('hBulbSh',HBULB,MAT.shingle);
kdef('hTentSc',HTENT,MAT.scale);kdef('hTentSh',HTENT,MAT.shingle);kdef('hTentT',HTENT,MAT.thatch);
kdef('hOctP',HOCT,MAT.plaster);kdef('hOctL',HOCT,MAT.logs);kdef('hOctW',HOCT,MAT.wood);kdef('hOctS',HOCT,MAT.stone);kdef('hOctSh',HOCT,MAT.shingle);
kdef('hKeelSc',HKEEL,MAT.scale);kdef('hKeelW',HKEEL,MAT.wood);kdef('hKeelP',HKEEL,MAT.plaster);kdef('hKeelSh',HKEEL,MAT.shingle);kdef('hKeelG',HKEEL,MAT.gold);kdef('hKeelDark',HKEEL,MAT.void);
kdef('hGableSc',VGABLE,MAT.scale);kdef('hGableTurf',VGABLE,MAT.turf);kdef('hGableLog',VGABLE,MAT.logs);kdef('hGableBM',VGABLE,MAT.bmat);kdef('hGableRub',VGABLE,MAT.rubbleW);kdef('hGablePaint',VGABLE,MAT.paint);
kdef('hPyrSc',VPYR,MAT.scale);kdef('hHipSc',VHIP,MAT.scale);kdef('hHipTurf',VHIP,MAT.turf);kdef('hHipSh',VHIP,MAT.shingle);
kdef('hBatterRub',VBATTER,MAT.rubbleW);
kdef('hArm',HARM,MAT.paint);kdef('hArmW',HARM,MAT.wood);
kdef('hConeG',VCONE,MAT.gold);kdef('hConeSc',VCONE,MAT.scale);kdef('hConeSh',VCONE,MAT.shingle);
