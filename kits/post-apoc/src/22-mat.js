// ---------------------------------------------------------------- materials
// One material per key; the geometry engine merges every piece of a key into one mesh, so the whole set is ~16 draw calls.
// Vertex colours tint the grayscale maps. Colours are sRGB hex; hc() converts to the linear working space.
const MAT={};
function mkMat(key,tex,o){o=o||{};const m=new THREE.MeshStandardMaterial({map:tex||null,vertexColors:true,roughness:o.rough===undefined?.85:o.rough,metalness:o.metal||0,side:o.side||THREE.FrontSide,
 transparent:!!o.transparent,opacity:o.opacity===undefined?1:o.opacity,alphaTest:o.alphaTest||0,depthWrite:o.depthWrite===undefined?true:o.depthWrite});
 if(o.bump&&tex){m.bumpMap=tex;m.bumpScale=o.bump;}if(o.emissive){m.emissive=new THREE.Color(o.emissive);m.emissiveIntensity=o.ei||1;}
 MAT[key]=m;return m;}
mkMat('corr',TEX.corr,{rough:.9,metal:.08,bump:1.4});   /* rusted sheet is matt: rough and barely metallic, so dusk light and the moon do not glaze it */
mkMat('corrH',TEX.corrH,{rough:.9,metal:.08,bump:1.4});
mkMat('cont',TEX.cont,{rough:.9,metal:.08,bump:1.6});
mkMat('sheet',TEX.sheet,{rough:.92,metal:.08,bump:1.2});
mkMat('plank',TEX.plank,{rough:.92,bump:.35});
mkMat('earth',TEX.earth,{rough:1,bump:.8});
mkMat('conc',TEX.conc,{rough:.88,bump:.8});
mkMat('iron',TEX.iron,{rough:.88,metal:.1,bump:.35});
mkMat('wood',TEX.wood,{rough:.92,bump:.5});
mkMat('steel',TEX.steel,{rough:.75,metal:.1,bump:.12});   /* metalness stays low: with no environment map a strongly metallic surface renders black */
mkMat('bottle',TEX.bottle,{rough:.25,metal:.05,bump:.8});
mkMat('rubber',null,{rough:.95});
mkMat('cloth',TEX.weave,{rough:1,side:THREE.DoubleSide});
mkMat('chain',TEX.chain,{rough:.85,metal:.15,side:THREE.DoubleSide,alphaTest:.4});
mkMat('glass',null,{rough:.08,metal:.1,transparent:true,opacity:.78,depthWrite:false,emissive:0x061012,ei:.5});
{const m=new THREE.MeshBasicMaterial({vertexColors:true});m.toneMapped=false;MAT.glow=m;}   // lamps, fire, lit windows
mkMat('water',null,{rough:.1,metal:.35,transparent:true,opacity:.9,depthWrite:false});TILE.water=1;MAT.water.color.setRGB(.5,.58,.56);   // muted: harbour water should not out-shout the rust   // dock water: a plate just above the ground plane
{const m=new THREE.MeshBasicMaterial({vertexColors:true});m.toneMapped=false;MAT.winlit=m;}   /* lit windows: emit() moves about half the glass panes here; 91n-night.js dims it by day and brightens it by night */
TILE.winlit=1;
MAT.plain=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.9});           // untextured painted stuff (leaves, hides, ropes)
TILE.plain=1;TILE.rubber=1;TILE.glass=1;TILE.glow=1;
const SRGB2LIN=c=>{c.convertSRGBToLinear();return c;};
// WEATHERING. Reclaimed metal and timber never keeps a bright paint: on these material families emit() desaturates the tint and pulls it toward rust
// (strength 0..1). Cloth, glass, glow, bottles, plain paint and the culture marks (canvas materials) are left alone, so a culture's awnings and
// banners stay bright against the rusted junk.
const WEATHER={corr:1,corrH:1,cont:1,sheet:1,iron:.9,plank:.7,wood:.55,steel:.15};
const _wc=new THREE.Color(),_hsl={h:0,s:0,l:0},RUSTLIN=new THREE.Color(0.30,0.105,0.045);
function weather(c,k){_wc.copy(c);_wc.getHSL(_hsl);const s=_hsl.s*(1-.72*k),l=_hsl.l*(1-.08*k);_wc.setHSL(_hsl.h,s,l);_wc.lerp(RUSTLIN,.20*k*(1-Math.min(1,_hsl.l*1.6)*.35));return _wc;}
const _HC={};function hc(hex){let c=_HC[hex];if(!c){c=SRGB2LIN(new THREE.Color(hex));_HC[hex]=c;}return c;}
// jittered copy of a hex colour (value drift only), deterministic through the PRNG
function jc(hex,j){j=j===undefined?.08:j;const c=new THREE.Color(hex);const f=1+rr(-j,j);c.r=clamp(c.r*f,0,1);c.g=clamp(c.g*(1+rr(-j,j)*.5+(f-1)*.5),0,1);c.b=clamp(c.b*(1+(f-1)*.6),0,1);return SRGB2LIN(c);}
// ---------------------------------------------------------------- the palette (culture-neutral)
const PAL={
 rust:[0x8a4a2a,0x9b5530,0x7a3f26,0xa6603a,0x6e3a24,0x8c5a3a],           // rusted steel
 paint:[0x7a2e28,0x9a3a2c,0x2f5f8f,0x3b7f6e,0x4d6f3c,0xc99a2e,0xc5c0b4,0x8a5a30,0xd06a30,0x6a4c7a],   // faded container livery
 grey:[0x8c8c86,0x9a9a92,0x777770,0xa8a49a],
 galv:[0xb4b8b8,0xa8acac,0xc0c2bd,0x9a9e9c],                            // galvanised sheet
 wood:[0x9a7a52,0x8a6a44,0xa88a5e,0x7a5c3c,0xb09468],                    // weathered planks
 woodD:[0x5c4630,0x4e3a28,0x6a5238],
 cloth:[0xb8a888,0xa89a7c,0x8a7a62,0xc6b898],                             // tarp/canvas
 tarp:[0x3a6a8a,0x5a7a4a,0x8a4a3a,0xb09a4a],
 bone:[0xe0d6c0,0xd0c4a8],
 conc:[0xd8d6d0,0xcfccc4],                                                  // Ancient arcology ceramic
 glass:[0x6a9a94,0x7aa8a0,0x5a8a8c],
 black:[0x2a2826,0x33302c],
};
function P(k){return jc(pick(PAL[k]),.07);}
