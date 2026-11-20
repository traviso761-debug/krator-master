// ================================================================= 69m. MARR: palette, materials, and kit items (kits/marr/PLAN.md section 2)
// Built on the Iziz Vernacular contract (settlements/iziz/VASSAL-KITS.md): the kit draws in the Vernacular's kit items
// (69b: vPlaster, vStone, vWood, vIron, vCopperB, vCloth ...) tinted per instance with vC(hex), plus its own (prefix ma)
// below. Orange is the Vernacular's own (VPAL.orange, VPAL.trim) so Iziz Vernacular buildings sit seamlessly beside Marr's
// Spanish Colonial / New Orleans / Barcelona / Bruges streetscape.
const MPAL={
 ochre:[0xdfa848,0xd89c3c,0xe4b254,0xd29434],       // Old San Juan / Antigua mustard-gold lime wash
 coral:[0xd87654,0xcf6c4a,0xde8260,0xc86444],       // Havana / Cartagena warm terracotta-salmon plaster
 saffron:[0xe2b458,0xdca84c,0xe8bc64],              // warm saffron-sand plaster
 lime:[0xf2ece0,0xede6d8,0xf5efe4,0xe8e0d0],        // salt-bleached colonial cream-white wash
 orange:VPAL.orange,                                // shared Iziz Vernacular orange: arch bands, reveals, cornices
 trim:VPAL.trim,                                    // shared Iziz Vernacular warm trim
 cantera:[0x9c8e7a,0x928470,0xa69884],              // carved volcanic ashlar stone (quoins, portals, arcades, bridges)
 canteraDark:[0x6e6254,0x64584a,0x766a5c],          // dark tidal-zone basalt & sea-fort masonry
 tile:[0xb85236,0xae4a30,0xc25c3e],                 // barrel mission clay roof tiles (teja)
 iron:[0x1e2220,0x222e26,0x1a1e1c,0x26342a],        // New Orleans black & deep carriage-green wrought iron
 azulejo:[0x24628c,0x1e567c,0x2c729c,0x1f6e68],     // cobalt & turquoise glazed ceramic tiles (domes, fountains, dadoes)
 water:[0x2a7888,0x246a7a],                         // courtyard fountain & basin water
 wood:[0x5a3822,0x664028,0x4e301c],                 // dark tropical mahogany & cedar doors, shutters, miradors
 shadesWood:[0x6a5c4c,0x5c5042,0x766858],           // salt-weathered driftwood & tarred barge-board (De Xedaz)
 foliage:[0x3e6e32,0x4a7c3c,0x345e28,0x588a44],     // courtyard palms, citrus, herbs, and hanging ferns
 laundry:[0xe4d8c4,0xd86828,0x386890,0xc84838,0xdfb048], // drying sheets and shirts on courtyard lines
};

function MA_WASH(){return vC(vPick(rng()<.35?MPAL.lime:rng()<.65?MPAL.ochre: rng()<.85?MPAL.coral:MPAL.saffron));}
function MA_OCHRE(){return vC(vPick(MPAL.ochre));}
function MA_CORAL(){return vC(vPick(MPAL.coral));}
function MA_SAFFRON(){return vC(vPick(MPAL.saffron));}
function MA_LIME(){return vC(vPick(MPAL.lime));}
function MA_OR(){return vC(vPick(MPAL.orange));}
function MA_CANT(){return vC(vPick(MPAL.cantera));}
function MA_CANTD(){return vC(vPick(MPAL.canteraDark));}
function MA_TILE(){return vC(vPick(MPAL.tile));}
function MA_IRON(){return vC(vPick(MPAL.iron));}
function MA_AZ(){return vC(vPick(MPAL.azulejo));}
function MA_WOOD(){return vC(vPick(MPAL.wood));}
function MA_DRIFT(){return vC(vPick(MPAL.shadesWood));}

// ---------------------------------------------------------------- materials and kit items (prefix ma)
// cantera: carved volcanic stone with ashlar roughness
MAT.maCantera=MAT.stone.clone();MAT.maCantera.roughness=.78;vWorldUV(MAT.maCantera,.5);
// tile: Spanish barrel clay roof tiles (shingle map with warm terracotta tint)
MAT.maTile=MAT.shingle.clone();vWorldUV(MAT.maTile,.55);
// azulejo: glossy glazed ceramic tile (mosaic.trencadis, tinted per instance) for domes, basins, and undulating benches
MAT.maAzulejo=MAT.plaster.clone();MAT.maAzulejo.roughness=.24;MAT.maAzulejo.metalness=.08;vWorldUV(MAT.maAzulejo,1/1.2);
// zellige: full-colour cobalt-and-turquoise glazed star tile (patterns/common/zellige-blue) for fountain floors and dadoes
MAT.maZellige=MAT.plaster.clone();MAT.maZellige.roughness=.28;vWorldUV(MAT.maZellige,1/1.2);
MAT.maZelligeD=MAT.plaster.clone();MAT.maZelligeD.roughness=.28;vWorldUV(MAT.maZelligeD,2/1.2);
// yeseria: carved stucco arabesque/Churrigueresque relief (stone.stucco.yeseria) for portal friezes and civic bands
MAT.maYeseria=MAT.plaster.clone();MAT.maYeseria.roughness=.78;vWorldUV(MAT.maYeseria,1/1.5);
// courtyard pool water: glossy translucent teal-blue surface
MAT.maWater=new THREE.MeshStandardMaterial({color:0xffffff,roughness:.12,metalness:.18});
// clear glass, lit warm pane, and room interior backing card (core/door KGLASS contract)
MAT.maGlass=MAT.izGlass;
MAT.maLit=MAT.warmPane.clone();MAT.maLit.side=THREE.DoubleSide;
MAT.maRoomS=MAT.izRoom;MAT.maRoom=MAT.maRoomS.clone();MAT.maRoom.side=THREE.DoubleSide;

// geometries for arches, columns, balusters, domes, and ceramic urns
const MADISC=new THREE.CylinderGeometry(1,1,1,24).rotateX(Math.PI/2);
const MAHALF=(()=>{const s=new THREE.Shape();s.moveTo(-1,0);s.absarc(0,0,1,Math.PI,0,true);s.lineTo(-1,0);
 const g=new THREE.ExtrudeGeometry(s,{depth:1,bevelEnabled:false,curveSegments:20});g.translate(0,0,-.5);return g;})();
const MASPANDREL=(()=>{const maN=16,maP=[],maUv=[],maIdx=[];
 for(const sg of[-1,1])for(let i=0;i<maN;i++){const a0=(i/maN)*(Math.PI/2),a1=((i+1)/maN)*(Math.PI/2),x0=sg*Math.cos(a0),y0=Math.sin(a0),x1=sg*Math.cos(a1),y1=Math.sin(a1),cx=sg*1.02,cy=1.02;
  for(const z of[-.5,.5]){const maB=maP.length/3;maP.push(x0,y0,z,x1,y1,z,cx,cy,z);maUv.push(x0*.5+.5,y0,x1*.5+.5,y1,cx*.5+.5,cy);maIdx.push(maB,maB+1,maB+2,maB,maB+2,maB+1);}
  const maBS=maP.length/3;maP.push(x0,y0,-.5,x1,y1,-.5,x1,y1,.5,x0,y0,.5);maUv.push(0,0,1,0,1,1,0,1);maIdx.push(maBS,maBS+1,maBS+2,maBS,maBS+2,maBS+3,maBS,maBS+2,maBS+1,maBS,maBS+3,maBS+2);}
 const maG=new THREE.BufferGeometry();maG.setAttribute('position',new THREE.Float32BufferAttribute(maP,3));maG.setAttribute('uv',new THREE.Float32BufferAttribute(maUv,2));maG.setIndex(maIdx);maG.computeVertexNormals();return maG;})();
const MARIB=new THREE.TorusGeometry(1,.055,6,10,Math.PI/2);
const MARING=new THREE.TorusGeometry(1,.1,6,24).rotateX(Math.PI/2);
const MACOL=new THREE.LatheGeometry([[1,0],[1,.06],[.96,.2],[.98,.42],[.94,.68],[.86,.92],[.84,1]].map(p=>new THREE.Vector2(p[0],p[1])),10);
const MABAL=new THREE.LatheGeometry([[.32,0],[.32,.08],[.15,.12],[.28,.38],[.34,.52],[.26,.68],[.16,.84],[.3,.92],[.32,1]].map(p=>new THREE.Vector2(p[0],p[1])),8);
const MAURN=new THREE.LatheGeometry([[.28,0],[.3,.1],[.16,.22],[.42,.52],[.46,.68],[.32,.84],[.38,.94],[.18,1]].map(p=>new THREE.Vector2(p[0],p[1])),10);
const MADRUM=new THREE.CylinderGeometry(1,1,1,16).translate(0,.5,0);
const MACONE=new THREE.ConeGeometry(1,1,16).translate(0,.5,0);

kdef('maCantera',VBOX,MAT.maCantera);
kdef('maTileB',VBOX,MAT.maTile);
kdef('maHipTile',VHIP,MAT.maTile);
kdef('maGableTile',VGABLE,MAT.maTile);
kdef('maPyrTile',VPYR,MAT.maTile);
kdef('maAzulejo',VBOX,MAT.maAzulejo);
kdef('maZellige',VBOX,MAT.maZellige);
kdef('maYeseria',VBOX,MAT.maYeseria);
kdef('maWater',VBOX,MAT.maWater);
kdef('maRoomB',VBOX,MAT.maRoomS);
kdef('maWinB',VBOX,MAT.maGlass);

kdef('maDisc',MADISC,MAT.plaster);
kdef('maDiscC',MADISC,MAT.maCantera);
kdef('maDiscAz',MADISC,MAT.maAzulejo);
kdef('maDiscZel',MADISC,MAT.maZelligeD);
kdef('maDiscG',MADISC,MAT.maGlass);
kdef('maDiscL',MADISC,MAT.maLit);
kdef('maDiscD',MADISC,MAT.maRoomS);

kdef('maHalfD',MAHALF,MAT.maRoom);
kdef('maHalfG',MAHALF,MAT.maGlass);
kdef('maHalfL',MAHALF,MAT.maLit);
kdef('maHalfP',MAHALF,MAT.plaster);
kdef('maHalfW',MAHALF,MAT.wood);
kdef('maSpandrelP',MASPANDREL,MAT.plaster);
kdef('maSpandrelC',MASPANDREL,MAT.maCantera);
kdef('maSpandrelI',MASPANDREL,MAT.iron);

kdef('maCol',MACOL,MAT.maCantera);
kdef('maColP',MACOL,MAT.plaster);
kdef('maBaluster',MABAL,MAT.maCantera);
kdef('maUrn',MAURN,MAT.maCantera);
kdef('maUrnAz',MAURN,MAT.maAzulejo);
kdef('maDrum',MADRUM,MAT.plaster);
kdef('maDrumC',MADRUM,MAT.maCantera);
kdef('maConeTile',MACONE,MAT.maTile);
kdef('maDomeTile',VDOME,MAT.maTile);
kdef('maDomeAz',VDOME,MAT.maAzulejo);
kdef('maDomeCu',VDOME,MAT.verdigris);
kdef('maRib',MARIB,MAT.plaster);
kdef('maRibAz',MARIB,MAT.maAzulejo);
kdef('maRing',MARING,MAT.maCantera);
