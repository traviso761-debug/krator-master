// ================================================================= THE SLABFIELDS — species (data + kit items; PLAN.md section 9)
// The Anvil's foot is a dry bench (141 mm, Dsc, +8 degC mean at 3.3 km) where a landslide has laid a field of rubble and blocks. What lives here
// answers what the apron gives: SHADE and DAMP (the voids under and north of the blocks keep their snowmelt: ferns), WATER (the spring line at the
// toe: reed), BARE ROCK (lichen on every block), and the bench's dry ground between (bunch grass; the high country's cushions, read in place from
// biomes/oidong: OIDONG.buildHigh). All four are Earth's kinds, as PLAN.md section 9 has them for the aprons ("talus flora read from the highland
// kits"): no neighbour kit that has them is built yet (the Siphon Pits' is on its own branch; the Loom-Chasms' only planned), so the kit carries
// them until one does, as biomes/highrift carries its tussock. Fauna are the fauna kit's (vertebrate-grade hexapods, never insects).
// Tags follow the project rule (climate / aridity / abyssal / riparian / Koppen) plus `native`. Everything here is DATA and kit definitions;
// placement is 60-biome-slab-place.js.
BIO.kit('slabfields');   // this kit's own registry of items and buckets (core/biome: kits)
var SLAB={SITES:SLAB_SITES};
(function(){const {TAU,clamp,smooth}=BIO.fn;
const T3=BIO.host.THREE,C=h=>new T3.Color(h);SLAB.C=C;
const K=(c,a,r,kp,o)=>Object.assign({climate:c,aridity:a,abyssal:false,riparian:r,koppen:kp,holy:false,shared:null,alien:false,native:false},o||{});
const HV=(wood,edible,medicinal,note)=>({wood,edible:edible||[],medicinal:!!medicinal,note:note||''});
// ---------------------------------------------------------------- palettes (sRGB hex; the colour maths is the core's)
const PAL=SLAB.PAL={
 fern:[0x5e7a46,0x6a8a4e,0x50683e,0x748e56],reed:[0x8a8a52,0x9a9860,0x7a7c48,0xa8a46c],grass:[0xb0a070,0xbcae7e,0xa49464,0xc4b688],
 lichen:[0xc8823a,0xd89448,0xb8b4a8,0xa8a89c,0x9ca46a,0xd8c860]};
// ---------------------------------------------------------------- the species
const SPECIES=SLAB.SPECIES=[
 {key:'voidfern',name:'Void fern',how:'a low fern in the gaps and on the north side of the apron\'s blocks, where the shade keeps the snowmelt into summer: the one soft green on the rubble',
  items:['slfern'],tags:K('cold-temperate','semiarid','no',['Dsc','Dsb','ET'])},
 {key:'seepreed',name:'Seep reed',how:'reed in the hollows of the spring line at the apron\'s toe, where the rubble\'s water rises',
  items:['slreed'],tags:K('cold-temperate','semiarid','yes',['Dsc','Dsb'])},
 {key:'bunchgrass',name:'Bench bunchgrass',how:'needle grass in tufts on the bench\'s dry ground, thinning onto the apron\'s finer rubble',
  items:['slgrass'],tags:K('cold-temperate','semiarid','no',['Dsc','Dsb','BSk','ET'])},
 {key:'blocklichen',name:'Block lichen',how:'crusts of orange, grey and yellow-green on every block and on the rubble\'s larger stones; the oldest rings date a block\'s fall',
  items:['sllichen'],tags:K('polar','semiarid','no',['Dsc','Dsb','ET','EF'])}];
SPECIES.forEach((S,i)=>{S.i=i;});
SLAB.HARVEST={voidfern:HV('none',['fiddleheads (spring)'],false,''),seepreed:HV('thatch and matting',[],false,''),
 bunchgrass:HV('thatch (and bedding)',[],false,''),blocklichen:HV('none',[],true,'Boiled, an orange dye; its rings tell how long a block has lain.')};
SPECIES.forEach(S=>{S.tags.harvest=SLAB.HARVEST[S.key];});
const byKey={};SPECIES.forEach(S=>byKey[S.key]=S);SLAB.byKey=byKey;
SLAB.plantOfItem=it=>{for(const S of SPECIES)if(S.items.indexOf(it)>=0)return S;return null;};
// ---------------------------------------------------------------- textures and materials (a card's procedural map is the fallback when the pack is absent:
// the library card swaps in by its slot, BIO.libSwap, materials.json: fern -> card.fern, reed -> card.reed, grass -> card.stipa)
const TX={};
const blades=(r,g,b,n,curl)=>BIO.alphaTex(256,(c,S)=>{for(let k=0;k<n;k++){const x0=S*(.3+.4*((k*37)%100)/100),a=-.9+1.8*((k*53)%100)/100;c.strokeStyle='rgba('+r+','+g+','+b+',1)';c.lineWidth=2;
 c.beginPath();c.moveTo(x0,S);c.quadraticCurveTo(x0+a*S*curl,S*.5,x0+a*S*curl*2.2,S*(.05+.25*((k*17)%100)/100));c.stroke();}},[r,g,b]);
TX.grass=blades(190,176,130,70,.15);TX.reed=blades(150,150,96,40,.05);
TX.fern=BIO.alphaTex(256,(c,S)=>{c.strokeStyle='rgba(96,130,74,1)';for(let k=0;k<9;k++){const a=-1.1+2.2*k/8;c.lineWidth=2;c.beginPath();c.moveTo(S*.5,S);
 const ex=S*.5+Math.sin(a)*S*.45,ey=S-Math.cos(a)*S*.85;c.lineTo(ex,ey);c.stroke();for(let j=1;j<9;j++){const t=j/9,px=S*.5+(ex-S*.5)*t,py=S+(ey-S)*t,l=S*.07*(1-t*.6);
 c.beginPath();c.moveTo(px,py);c.lineTo(px+Math.cos(a)*l,py+Math.sin(a)*l);c.moveTo(px,py);c.lineTo(px-Math.cos(a)*l,py-Math.sin(a)*l);c.stroke();}}},[96,130,74]);
const solid=()=>{const m=BIO.solidMat?BIO.solidMat(null):new T3.MeshLambertMaterial({color:0xffffff});m.vertexColors=true;return m;};
const M=SLAB.M={
 grass:BIO.leafMat(TX.grass,'sl-grass',{aN:true,swayW:'1.0',swayA:.10}),
 reed:BIO.leafMat(TX.reed,'sl-reed',{aN:true,swayW:'.8',swayA:.08}),
 fern:BIO.leafMat(TX.fern,'sl-fern',{aN:true,swayW:'.4',swayA:.03}),
 solid:solid()};
SLAB.SWAP=BIO.libSwap('slabfields',M);
// ---------------------------------------------------------------- the items
BIO.def('slfern',BIO.geo.clump(),M.fern,{label:'Void fern',attrs:['aN']});   /* aN: the leafMat's per-instance normal (without it the shader normalises zero: black) */
BIO.def('slreed',BIO.geo.clump(),M.reed,{label:'Seep reed',attrs:['aN']});
BIO.def('slgrass',BIO.geo.clump(),M.grass,{label:'Bench bunchgrass',attrs:['aN']});
BIO.def('sllichen',BIO.fung.cap({form:'disc',h:.06,seg:9,rings:2,lump:.4,under:'none',seed:51301}),M.solid,{label:'Block lichen'});
})();
