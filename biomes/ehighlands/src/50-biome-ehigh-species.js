// ================================================================= EASTERN HIGHLANDS — species (data + kit items)
// The high plateau of the east (the owner, Oct 2026): an altiplano at about 0.6 atm, cold, clear and dry, its Koppen
// classes the cold steppe and the tundra (BSk, ET). The model is the Andean puna with the Himalaya's strange plants:
//   the poured cushion (the llareta grown to Krator's size: one plant over a boulder, or over a whole hill: the Mother),
//   the woolback (New Zealand's vegetable sheep), the thorn cushion (the tragacanth belt's spiny hemispheres),
//   the vigil spike (Puya raimondii: a rosette for decades, one great spike, then a dead torch),
//   the ragbark (Polylepis: gnarled red woods in the gullies, bark peeling in papery layers),
//   the glass tower (the noble rhubarb: a tower of translucent bracts, a greenhouse round its flowers),
//   the hoar cereus (the woolly old-man cactus), and on the floor ichu, sedge turf, the bog's cushion quilt, tola,
//   snow wool (the snow lotus), gentians, lichens.
// THE GIANT: everything here grows toward it. Krator is tidally locked and the giant hangs fixed in the north-east
// (azimuth 66, altitude 25), and in thin air its glow is a real share of the light over a long orbit: cushions are
// thicker and higher on its side, spikes and towers tilt toward it, the ragbark's crowns fan out toward it. A plain of
// spikes all leaning one way is how a traveller knows this country (EHIGH.GIANT, EHIGH.setGiant).
// THE GLASS TOWER'S CHEMISTRY (the owner's idea): the towers make pallidine, a bitter alkaloid, in their bracts and roots.
// Moth larvae feed on the roots and store it; a fungus infects the larvae and works most of it into something milder,
// and its stalks (wormwick) come up through the turf near the towers: a prized tonic. The wild bees that work the towers'
// hidden flowers carry it undigested into their honey: tower honey is the dangerous version.
// Everything here is DATA and kit definitions; no placement.
BIO.kit('ehigh');   // this kit's own registry of items and buckets (core/biome: kits)
var EHIGH={};
(function(){const {TAU,clamp,lerp,mix,smooth,reseed,rng,rr,ri,pick,h3,vnoise,fbm,qEuler,qFacing,qUp}=BIO.fn;
const T3=BIO.host.THREE,C=h=>new T3.Color(h);EHIGH.C=C;
EHIGH.TAGS={climate:'polar',aridity:'semiarid',abyssal:false,riparian:'both',koppen:['BSk','ET']};
// the classes of the region: an ESTIMATE (the scale model's rasters were not read for this kit: KNOWN_ISSUES)
EHIGH.KOPPEN={BSk:.45,ET:.45,EF:.1};
EHIGH.ATM=.6;

// ---------------------------------------------------------------- the giant
// GIANT: the unit vector on the ground toward the giant (x east, z south). Canon: azimuth 66 from north.
EHIGH.setGiant=function(azDeg){const a=azDeg*Math.PI/180;EHIGH.GIANT=[Math.sin(a),-Math.cos(a)];EHIGH.GIANT_AZ=azDeg;
 // the yaw that turns a geometry's +x toward the giant (qEuler(0,yaw,0) maps +x to (cos yaw, 0, -sin yaw))
 EHIGH.GIANT_YAW=Math.atan2(-EHIGH.GIANT[1],EHIGH.GIANT[0]);};
EHIGH.setGiant(66);
// a direction tilted `a` radians from up toward the giant (with a little scatter): [x,y,z], unit
EHIGH.toward=function(a,jit){const g=EHIGH.GIANT,j=jit==null?.25:jit,az=Math.atan2(g[1],g[0])+rr(-j,j),s=Math.sin(a),c=Math.cos(a);return[Math.cos(az)*s,c,Math.sin(az)*s];};

// ---------------------------------------------------------------- palettes
const PAL=EHIGH.PAL={
 cushion:[0x86b236,0x94bc3c,0x78a430,0xa0c444,0x6e9a2c],cushionDeep:[0x3a6420,0x466e24,0x30561c],
 wool:[0xeceae2,0xe4e2da,0xf2efe6,0xdcdcd4],woolDark:[0x8a8c84,0x7e8078],
 thorn:[0x6e7e5a,0x7a8a62,0x627250,0x86906a],thornBloom:[0xe878a8,0xf090b8,0xd86898,0xf4a8c8,0xe8e0f0],
 vigil:[0x5e8270,0x6a8c78,0x527264,0x74947e],vigilSkirt:[0x8a7a58,0x7a6a4a,0x9a8a64],spike:[0xa8b85a,0xb8c468,0x98aa50,0xc0c878],
 torch:[0x3e3024,0x4a3a2a,0x34281e,0x56442e],floret:[0xd8e4b0,0xe8ecc0,0xc8d8a0],
 ragbark:[0xa64a28,0xbc5a30,0x923e22,0xc66c3a,0xb05030],ragLeaf:[0x3a5838,0x46643c,0x324c30,0x52703e],
 glass:[0xece6c4,0xf2ecd2,0xe2dcb6,0xf0e4c4],glassEdge:[0xe0a8a0,0xd89890],rheumLeaf:[0x4a7a3a,0x568a42,0x3e6a34],
 hair:[0xf2f0ea,0xe8e6de,0xf8f6f0],cereus:[0x587a5a,0x648464],cereusBloom:[0xd83a3a,0xe85a3a,0xc82a4a],
 ichu:[0xd8b860,0xc8a850,0xe2c674,0xbc9e4c,0xd0b058],ichuDry:[0xb8a070,0xa89060],
 turf:[0x6e6a3a,0x7a7444,0x626036,0x847a4a],turfGreen:[0x5a7034,0x667a3a],
 bogq:[0x3e7e3a,0x4a8c40,0x347034,0x5a9a46,0x2e6630],
 tola:[0x7a8a6a,0x889678,0x6c7c5e,0x96a084],tolaBloom:[0xe8d040,0xf0dc58],
 snowwool:[0xf4f2ec,0xeceae4,0xfafaf6],gentian:[0x3a5ad8,0x4a6ae8,0x2a4ac8,0x5a7af0],
 wick:[0x5a3a22,0x6a4428,0x4e321e],wickTip:[0xd8902a,0xe0a038],
 lichen:[0xe8a020,0xd8c040,0xa8c060,0xe86a2a,0xc8d0b0,0xf0d050],
 basalt:[0x5e5a56,0x4e4a48,0x6a6460,0x585048,0x645c54],scoria:[0x7a4a3a,0x6a4234,0x8a5844],
 sinter:[0xe86a1a,0xd8a020,0x5a8a2a,0x8a5a2a,0x2e7a6a],comb:[0xe8c060,0xd8a840,0xc89030,0xb88028],
 dead:[0x8a7a62,0x7a6a54,0x9a8a70],
};

// ---------------------------------------------------------------- the tree species
// H height band (for a cushion: its height; for the vigil spike: the spike's), rb a radius (a trunk's, or a dome's
// skirt), crownR (metres); barkK the bark texture (0 furrowed, 1 ragbark's papery layers, 2 the cereus's hair, 3 dead
// leaf skirt); lean: how far (radians) the species turns toward the giant; far the impostor recipe (blobs [y of H, rx
// of crownR, ry of H, colour A, colour B, options]). Bark colours are written a stop DARK.
const K=(c,a,r,kp,form)=>({climate:c,aridity:a,abyssal:false,riparian:r,koppen:kp,form});
EHIGH.SPECIES=[
 /*0*/{key:'cushion',name:'Poured cushion',H:[.5,2.6],rb:[.2,.4],crownR:[1.2,6.5],barkK:0,bark:[0x6a5a44],leaf:PAL.cushion,lean:.3,
  far:{poleU:0,blobs:[[.4,1.0,.45,'L0','L1']]},tags:K('polar','semiarid','no',['BSk','ET'],'cushion')},
 /*1*/{key:'woolback',name:'Woolback',alien:true,H:[.5,1.5],rb:[.2,.4],crownR:[.9,2.4],barkK:0,bark:[0x6a6a60],leaf:PAL.wool,lean:.3,
  far:{poleU:0,blobs:[[.4,1.0,.5,'L0','L3']]},tags:K('polar','semiarid','no',['ET','EF'],'cushion')},
 /*2*/{key:'thorn',name:'Thorn cushion',H:[.4,1.1],rb:[.1,.2],crownR:[.5,1.5],barkK:0,bark:[0x5a4a3a],leaf:PAL.thorn,lean:.3,
  far:{poleU:0,blobs:[[.45,1.0,.5,'L0','L2']]},tags:K('polar','arid','no',['BSk'],'cushion')},
 /*3*/{key:'vigil',name:'Vigil spike',alien:true,H:[8,17],rb:[.3,.5],crownR:[1.6,2.8],barkK:3,bark:PAL.vigilSkirt,leaf:PAL.vigil,lean:.2,
  far:{poleU:.95,taper:.6,blobs:[[.1,.9,.08,'L0','L1',{yOf:'R',ryOf:'R'}],[.6,.14,.32,0xa8b85a,0x98aa50]]},tags:K('polar','semiarid','no',['BSk','ET'],'rosette')},
 /*4*/{key:'ragbark',name:'Ragbark',H:[4,10.5],rb:[.18,.42],crownR:[2.4,5],barkK:1,bark:PAL.ragbark,leaf:PAL.ragLeaf,lean:.28,
  far:{poleU:.45,taper:.3,blobs:[[.72,.95,.28,'L0','L2',{off:.3}]]},tags:K('polar','subhumid','both',['BSk','ET'],'tree')},
 /*5*/{key:'glasstower',name:'Glass tower',alien:true,H:[1.6,3.8],rb:[.22,.4],crownR:[.6,1.1],barkK:0,bark:[0x6a6a50],leaf:PAL.glass,lean:.18,
  far:{poleU:0,blobs:[[.5,.5,.5,0xece6c4,0xd8d0a8]]},tags:K('polar','semiarid','no',['ET','EF'],'rosette')},
 /*6*/{key:'cereus',name:'Hoar cereus',H:[1.4,4.2],rb:[.16,.28],crownR:[.8,2],barkK:2,bark:PAL.hair,leaf:PAL.hair,lean:.22,
  far:{poleU:.95,taper:.1,blobs:[[.5,.5,.5,0xf2f0ea,0xd8d6ce]]},tags:K('polar','arid','no',['BSk'],'column')},
];
EHIGH.byKey={};EHIGH.SPECIES.forEach((S,i)=>{S.i=i;EHIGH.byKey[S.key]=S;});

// ---------------------------------------------------------------- harvest (biomes/FRUIT.md)
// What each species yields (wood, edible parts, medicinal, a note) and `fruit`: a catalog piece when the kit draws a
// fruit the catalog holds. None is in the catalog yet (KNOWN_ISSUES), so `fruit` is null throughout.
const HV=(wood,edible,medicinal,notes,fruit)=>({wood,edible:edible||[],medicinal:!!medicinal,notes:notes||'',fruit:fruit||null});
EHIGH.HARVEST={
 cushion:HV('fuel (resin)',[],true,'Cut and dried it burns hot with a resin smoke; a cushion takes a lifetime to grow a hand\'s depth, so the clans that cut them are cursed by the ones that do not. The resin is a salve for frostbite.'),
 woolback:HV('none',[],false,'From a hundred metres a flock of sheep; herders have walked an hour to round up a hillside of them.'),
 thorn:HV('none',['flowers (in tea)'],true,'Tapped for its gum: a cut at the root crown weeps a white resin that sets hard. Traded down to the lowlands as a binder for paint and medicine.'),
 vigil:HV('none',['heart (famine)','nectar'],false,'Flowers once, after decades, all together across a plain; then stands as a dead torch for years. The dry spike burns like a beacon and is lit for festivals.'),
 ragbark:HV('fuel, carving',[],true,'The bark peels in a hundred papery layers: a winter coat for the tree, kindling and writing paper for people.'),
 glasstower:HV('none',['young stalk (peeled, bitter)'],true,'Makes pallidine in its bracts and roots. Moth larvae that feed on the roots store it; a fungus that infects them works most of it into a milder tonic (wormwick). The wild bees that work its hidden flowers carry it into their honey whole: tower honey, the dangerous version.'),
 cereus:HV('none',['fruit'],false,'The white hair is the frost\'s; the red flowers open toward the giant.'),
};
EHIGH.SPECIES.forEach(S=>{S.tags.harvest=EHIGH.HARVEST[S.key]||HV('none');});

// ---------------------------------------------------------------- the small plants (the floor), tagged
// Placed by 60-floor. `items` names the instanced items that draw them, for the inspector.
const PK=(name,c,a,r,kp,form,items,hv)=>({name,tags:Object.assign(K(c,a,r,kp,form),{harvest:hv||HV('none')}),items});
EHIGH.PLANTS={
 ichu:PK('Ichu','polar','semiarid','no',['BSk','ET'],'tussock',['ichu'],HV('thatch',[],false,'The gold of the puna; roofs, rope and fodder.')),
 turf:PK('Sedge turf','polar','subhumid','no',['ET','BSk'],'turf',['turf'],HV('none',[],false,'A felt of sedge a few centimetres high on a root mat; where the mat dies it cracks into polygons.')),
 bogq:PK('Bog cushion','polar','humid','yes',['ET'],'cushion',['bogq'],HV('none',[],false,'Glossy green domes that quilt the bofedal; the herds\' best grazing.')),
 tola:PK('Tola','polar','arid','no',['BSk'],'shrub',['tola','tolabloom'],HV('fuel',[],true,'Resinous scrub; it smells of tar in the sun.')),
 snowwool:PK('Snow wool','polar','semiarid','no',['ET','EF'],'woolly',['snowwool'],HV('none',[],true,'Fist-sized cones of white wool, the last plant below the snow. Moths sleep in the wool at night.')),
 gentian:PK('Gentian','polar','subhumid','no',['ET'],'herb',['bloom'],HV('none',[],true,'')),
 wormwick:PK('Wormwick','polar','subhumid','no',['ET'],'fungus',['wick'],HV('none',['the stalk and the larva (dried)'],true,'A fungus\'s stalk out of a moth larva\'s head, in the turf near the glass towers. The fungus has worked the towers\' pallidine into a mild tonic: worth its weight in silver in the lowland cities. Clans fight over the slopes in the spring.')),
 lichen:PK('Lichens','polar','arid','no',['BSk','ET','EF'],'crust',['lichen'],HV('none',[],false,'')),
 sinter:PK('Mat algae','polar','humid','yes',['BSk'],'mat',['sinter'],HV('none',[],false,'Orange and green mats in the geysers\' run-off: each colour lives at its own temperature.')),
};
EHIGH.plantOfItem=item=>{for(const k in EHIGH.PLANTS)if(EHIGH.PLANTS[k].items.indexOf(item)>=0)return EHIGH.PLANTS[k];return null;};

// ---------------------------------------------------------------- leaf and surface textures
// Greyscale on transparent canvases (BIO.alphaTex); the per-instance colour tints them.
reseed(530041);
const TX={};
const G2=BIO.tex.grey;
/* small dense leaves: tola, the ragbark's leaflets (darker when tinted) */
TX.small=BIO.alphaTex(512,(g,S)=>{BIO.tex.clusters(S,10,.66);g.strokeStyle=G2(90);g.lineWidth=1.6;
 for(let k=0;k<16;k++){const p=BIO.tex.discPt(S,.4),q=BIO.tex.discPt(S,.9);g.beginPath();g.moveTo(p[0],p[1]);g.lineTo(q[0],q[1]);g.stroke();}
 for(let i=0;i<440;i++){const c=BIO.tex.clPt(S,.11,.92),lum=lerp(115,245,i/440)+rr(-20,12);g.fillStyle=G2(lum);g.beginPath();g.ellipse(c[0],c[1],rr(5,9),rr(2,3.5),rr(0,TAU),0,TAU);g.fill();}},[165,165,165]);
/* the ragbark's leaves: small compound leaflets in rosettes at the twig ends */
TX.rag=BIO.alphaTex(512,(g,S)=>{BIO.tex.clusters(S,12,.7);g.strokeStyle=G2(80);g.lineWidth=1.4;
 for(let k=0;k<24;k++){const p=BIO.tex.discPt(S,.35),q=BIO.tex.discPt(S,.9);g.beginPath();g.moveTo(p[0],p[1]);g.lineTo(q[0],q[1]);g.stroke();}
 for(let i=0;i<120;i++){const c=BIO.tex.clPt(S,.1,.9),lum=lerp(110,240,i/120);for(let k=0;k<7;k++)BIO.tex.leaf(g,c[0],c[1],rr(14,22),rr(4,6),k/7*TAU+rr(-.2,.2),lum+rr(-15,10),false);}},[150,150,150]);
/* ichu: fine stiff gold blades in a tall fountain with seed plumes (vertical tuft card) */
TX.ichu=BIO.alphaTex(256,(g,S)=>{g.lineCap='round';
 for(let k=0;k<90;k++){const x0=S/2+rr(-14,14),a=-Math.PI/2+rr(-.75,.75)*Math.pow(rng(),.7),L=S*rr(.5,1.0),lum=lerp(130,250,rng());
  g.strokeStyle=G2(lum);g.lineWidth=rr(1,1.8);g.beginPath();g.moveTo(x0,S);g.quadraticCurveTo(x0+Math.cos(a)*L*.4,S+Math.sin(a)*L*.7,x0+Math.cos(a)*L*1.05,S+Math.sin(a)*L*.95);g.stroke();
  if(rng()<.25){g.strokeStyle=G2(lum*.9);g.lineWidth=3;g.beginPath();g.moveTo(x0+Math.cos(a)*L*.95,S+Math.sin(a)*L*.85);g.lineTo(x0+Math.cos(a)*L*1.1,S+Math.sin(a)*L*1.0);g.stroke();}}},[180,180,180]);
/* sedge turf: a low felt of short blades seen from above (a mat card) */
TX.turf=BIO.alphaTex(256,(g,S)=>{
 // a ragged patch of felt: blades thick in the middle, thinning to a broken edge (no outline to show)
 for(let i=0;i<9000;i++){const a=rr(0,TAU),r=S*.41*Math.pow(rng(),.75)*(1+.12*Math.sin(a*5+1)+.06*Math.sin(a*13)),p=[S/2+Math.cos(a)*r,S/2+Math.sin(a)*r],b=rr(0,TAU),L=rr(1.5,4);
  g.strokeStyle=G2(lerp(80,215,rng()));g.lineWidth=rr(.8,1.5);g.beginPath();g.moveTo(p[0],p[1]);g.lineTo(p[0]+Math.cos(b)*L,p[1]+Math.sin(b)*L);g.stroke();}},[140,140,140]);
/* lichen crusts */
TX.lichen=BIO.alphaTex(128,(g,S)=>{for(let i=0;i<200;i++){const x=S/2+(rng()-.5)*S*.96,y=S/2+(rng()-.5)*S*.96;if(Math.hypot(x-S/2,y-S/2)>S*.46)continue;
 g.fillStyle=G2(lerp(120,235,rng()));g.beginPath();g.arc(x,y,rr(4,11),0,TAU);g.fill();}},[160,160,160]);
/* a bloom: five petals with an eye (gentians from above, the cereus's flowers, the thorn's crust) */
TX.bloom=BIO.alphaTex(128,(g,S)=>{const cx=S/2,cy=S/2;
 for(let p=0;p<5;p++){const a=p/5*TAU;g.fillStyle=G2(lerp(175,240,rng()));g.beginPath();g.ellipse(cx+Math.cos(a)*S*.22,cy+Math.sin(a)*S*.22,S*.21,S*.13,a,0,TAU);g.fill();}
 g.fillStyle=G2(150);g.beginPath();g.arc(cx,cy,S*.09,0,TAU);g.fill();},[210,210,210]);
/* the glass tower's basal leaf: a broad round blade with pale veins (a leaf card, base at the bottom) */
TX.broad=BIO.alphaTex(256,(g,S)=>{const cx=S/2;g.fillStyle=G2(200);g.beginPath();g.moveTo(cx,S);g.bezierCurveTo(-S*.15,S*.55,S*.2,S*.02,cx,S*.04);g.bezierCurveTo(S*.8,S*.02,S*1.15,S*.55,cx,S);g.fill();
 g.strokeStyle=G2(235);g.lineWidth=3;g.beginPath();g.moveTo(cx,S);g.lineTo(cx,S*.08);g.stroke();g.lineWidth=1.6;
 for(let k=1;k<7;k++){const y=S*(1-k*.13);for(let sd=-1;sd<=1;sd+=2){g.beginPath();g.moveTo(cx,y);g.quadraticCurveTo(cx+sd*S*.18,y-S*.06,cx+sd*S*.36*Math.sin(Math.PI*(1-k/8)),y-S*.14);g.stroke();}}},[200,200,200]);
/* the woolback's and the snow wool's fleece: tight curls (a surface texture, opaque) */
TX.wool=BIO.canvasTex(256,256,(g,w,h)=>{g.fillStyle='#d8d8d8';g.fillRect(0,0,w,h);g.lineCap='round';
 for(let i=0;i<2600;i++){const x=rng()*w,y=rng()*h,r=rr(1.5,3.5),l=rr(190,255);g.strokeStyle='rgb('+(l|0)+','+(l|0)+','+(l|0)+')';g.lineWidth=rr(.8,1.6);g.beginPath();g.arc(x,y,r,rr(0,TAU),rr(0,TAU)+rr(2,4.5));g.stroke();}
 for(let i=0;i<500;i++){g.fillStyle='rgba(150,150,150,.25)';g.beginPath();g.arc(rng()*w,rng()*h,rr(1,2),0,TAU);g.fill();}});
/* the cushion's skin: thousands of tiny rosettes packed edge to edge, each a star of leaves round a dark eye */
TX.rosettes=BIO.canvasTex(256,256,(g,w,h)=>{g.fillStyle='#909090';g.fillRect(0,0,w,h);
 for(let i=0;i<3200;i++){const x=rng()*w,y=rng()*h,r=rr(2.4,4.2),l=rr(165,245),n=ri(6,9),a0=rr(0,TAU);
  for(let k=-1;k<=1;k++)for(let j=-1;j<=1;j++){const cx=x+k*w,cy=y+j*h;if(cx<-r||cx>w+r||cy<-r||cy>h+r)continue;
   g.fillStyle='rgb('+(l*.82|0)+','+(l*.82|0)+','+(l*.82|0)+')';g.beginPath();g.arc(cx,cy,r*.95,0,TAU);g.fill();
   for(let p=0;p<n;p++){const a=a0+p/n*TAU;g.fillStyle='rgb('+(l|0)+','+(l|0)+','+(l|0)+')';g.beginPath();g.ellipse(cx+Math.cos(a)*r*.45,cy+Math.sin(a)*r*.45,r*.5,r*.22,a,0,TAU);g.fill();}
   g.fillStyle='rgba(70,70,70,.6)';g.beginPath();g.arc(cx,cy,r*.15,0,TAU);g.fill();}}});
TX.rosettes.wrapS=TX.rosettes.wrapT=T3.RepeatWrapping;
// its linear mean: the skin divides it out, so a cushion's instance colour is the colour it renders
EHIGH.SKIN_MEAN=BIO.col.texMean(TX.rosettes);
EHIGH.TEX=TX;

// ---------------------------------------------------------------- bark textures
// Painted NEAR-GREY and tinted from SPECIES.bark by the builders. 0 furrowed; 1 the ragbark's papery layers (horizontal
// sheets lifting and curling, dark gaps between); 2 the cereus's hair (fine vertical white strands over ribs);
// 3 a skirt of dead leaves (the vigil spike's trunk: down-pointing blades).
EHIGH.barkTex=function(kind){return BIO.canvasTex(256,512,(g,w,h)=>{
 g.fillStyle='#8c8c8c';g.fillRect(0,0,w,h);
 if(kind===0){
  for(let i=0;i<240;i++){const x=rng()*w,d=rng();g.strokeStyle='rgba('+(d<.5?'45,45,45':'165,165,165')+','+(.3+rng()*.5).toFixed(2)+')';
   g.lineWidth=d<.5?rr(2,5):rr(1,2);g.beginPath();g.moveTo(x,-10);g.bezierCurveTo(x+rr(-14,14),h*.33,x+rr(-14,14),h*.66,x+rr(-8,8),h+10);g.stroke();}}
 else if(kind===1){
  g.fillStyle='#4a4a4a';g.fillRect(0,0,w,h);
  for(let y=-10;y<h+10;y+=rr(5,11)){const l=rr(140,225);g.fillStyle='rgb('+(l|0)+','+(l|0)+','+(l|0)+')';g.beginPath();g.moveTo(-5,y);
   for(let x=0;x<=w+10;x+=12)g.lineTo(x,y+rr(-2,2)+3*Math.sin(x*.05+y));
   const th=rr(4,9);for(let x=w+10;x>=-5;x-=12)g.lineTo(x,y+th+rr(-2,2));g.closePath();g.fill();
   // a sheet lifting: its edge lit, its underside dark
   if(rng()<.5){const x=rr(0,w),L=rr(20,60);g.fillStyle='rgba(245,245,245,.6)';g.fillRect(x,y-1,L,1.6);g.fillStyle='rgba(30,30,30,.55)';g.fillRect(x,y+1,L,2.2);}}}
 else if(kind===2){
  g.fillStyle='#dcdcdc';g.fillRect(0,0,w,h);
  for(let x=0;x<w;x+=w/8){g.fillStyle='rgba(150,150,150,.35)';g.fillRect(x,0,3,h);}
  for(let i=0;i<1400;i++){const x=rng()*w,y=rng()*h,L=rr(12,40),l=rr(200,255);g.strokeStyle='rgba('+(l|0)+','+(l|0)+','+(l|0)+',.8)';g.lineWidth=rr(.8,1.6);
   g.beginPath();g.moveTo(x,y);g.quadraticCurveTo(x+rr(-6,6),y+L*.5,x+rr(-10,10),y+L);g.stroke();}}
 else{
  for(let y=-20;y<h;y+=rr(8,14))for(let x=-10;x<w;x+=rr(6,10)){const l=rr(110,210),L=rr(26,46);g.fillStyle='rgb('+(l|0)+','+(l|0)+','+(l|0)+')';
   g.beginPath();g.moveTo(x,y);g.lineTo(x+rr(4,7),y);g.lineTo(x+rr(1,4),y+L);g.closePath();g.fill();}}
});};
EHIGH.BARKTEX=[0,1,2,3].map(k=>EHIGH.barkTex(k));
// basalt: dark, vesicular (small round holes), with a rusty weathering
EHIGH.ROCKTEX=BIO.canvasTex(256,256,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4,s=h3(x,y,43),v=(150+(fbm(x/22,y/22,3.9,3)-.5)*50+(s<.05?-60:0)+(fbm(x/4,y/4,9.4,1)-.5)*18);d[i]=d[i+1]=d[i+2]=clamp(v,0,255);d[i+3]=255;}
 g.putImageData(id,0,0);});

// ---------------------------------------------------------------- geometries local to this biome
const G={};
const push3=(A,a,b,c)=>A.push(a,b,c);
// a TUFT: three crossed vertical quads, origin at the base, up to y=1
G.tuft=function(){const pos=[],uv=[],nor=[];
 for(let k=0;k<3;k++){const a=k/3*Math.PI+.2,ca=Math.cos(a),sa=Math.sin(a);
  const P=[[-.5,0],[.5,0],[.5,1],[-.5,1]].map(q=>[ca*q[0],q[1],sa*q[0],q[0]+.5,1-q[1]]);
  [0,1,2,0,2,3].forEach(i=>{pos.push(P[i][0],P[i][1],P[i][2]);uv.push(P[i][3],P[i][4]);nor.push(-sa,0,ca);});}
 return BIO.geo._make(pos,nor,uv);};
// a DOME on a polar grid: unit radius, unit height, origin at the ground, LOPSIDED toward +x (the giant: the builders
// turn +x toward it). bump(a,r) adds lumps; col(a,r,b) the vertex colour (b the bump). The shared body of the poured
// cushion, the woolback's lobes, the thorn cushion and the bog's quilt.
function dome(nr,ns,o){const pos=[],nor=[],uv=[],col=[],P=[];
 const shift=o.shift==null?.18:o.shift,side=o.side==null?.16:o.side,pw=o.pw==null?.55:o.pw;
 for(let i=0;i<=nr;i++){const r=i/nr,row=[];for(let s=0;s<=ns;s++){const a=s/ns*TAU,ca=Math.cos(a),sa=Math.sin(a);
  const rs=r*(1-side*ca)*(1+(o.wob||0)*Math.sin(a*5+1.3)),b=o.bump?o.bump(a,r):0;
  const hh=Math.pow(Math.max(0,1-r*r),pw)*(1+shift*ca*(1-r))+b*(1-r*r*.5);
  const x=ca*rs+shift*.5*(1-r*r)*0+b*ca*.25*r,z=sa*rs+b*sa*.25*r;row.push([x,Math.max(0,hh),z,b,r,a]);}P.push(row);}
 const N=(i,s)=>{const a=P[Math.min(nr,i+1)][s],b=P[Math.max(0,i-1)][s],c=P[i][(s+1)%ns],d=P[i][(s-1+ns)%ns];
  const ux=a[0]-b[0],uy=a[1]-b[1],uz=a[2]-b[2],vx=c[0]-d[0],vy=c[1]-d[1],vz=c[2]-d[2];let nx=uy*vz-uz*vy,ny=uz*vx-ux*vz,nz=ux*vy-uy*vx;const l=Math.hypot(nx,ny,nz)||1;
  if(ny<0){nx=-nx;ny=-ny;nz=-nz;}return[nx/l,ny/l,nz/l];};
 const pv=(i,s)=>{const p=P[i][s],n=i===0?[0,1,0]:N(i,s),c=o.col(p[5],p[4],p[3]);pos.push(p[0],p[1],p[2]);nor.push(n[0],n[1],n[2]);uv.push(s/ns*(o.uRep||1),p[4]*(o.vRep||1));col.push(c[0],c[1],c[2]);};
 for(let i=0;i<nr;i++)for(let s=0;s<ns;s++){pv(i,s);pv(i+1,s+1);pv(i+1,s);pv(i,s);pv(i,s+1);pv(i+1,s+1);}
 return BIO.geo._make(pos,nor,uv,col);}
// the POURED CUSHION: a lumpy green dome of bubbles, the crevices between them dark; giant side higher
G.cushion=function(){return dome(7,22,{shift:.22,side:.18,pw:.5,wob:.05,uRep:6,vRep:3,
 bump:(a,r)=>.07*Math.sin(a*11+r*9)*Math.sin(r*13+a*3)+.05*Math.sin(a*23+r*19),
 col:(a,r,b)=>{const k=clamp(.78+b*3.2,.45,1.15)*mix(1,.62,smooth(.75,1,r));return[k,k,k];}});};
// the WOOLBACK: a heap of four or five woolly lobes (vertex white on top, grey toward the ground)
G.wool=function(){const parts=[[0,0,1,1],[.55,.25,.62,.7],[-.45,.35,.6,.66],[-.2,-.5,.58,.62],[.4,-.45,.5,.55]];const pos=[],nor=[],uv=[],col=[];
 parts.forEach(([px,pz,s,hs])=>{const g=dome(5,14,{shift:.12,side:.08,pw:.45,uRep:3,vRep:1.5,bump:(a,r)=>.05*Math.sin(a*7+r*8),col:(a,r,b)=>{const k=mix(1.0,.6,smooth(.6,1,r))*(.9+b*2);return[k,k,k];}});
  const P=g.attributes.position.array,Nn=g.attributes.normal.array,U=g.attributes.uv.array,Cc=g.attributes.color.array;
  for(let i=0;i<P.length;i+=3){pos.push(P[i]*s+px,P[i+1]*hs,P[i+2]*s+pz);nor.push(Nn[i],Nn[i+1],Nn[i+2]);col.push(Cc[i],Cc[i+1],Cc[i+2]);}for(let i=0;i<U.length;i++)uv.push(U[i]);});
 return BIO.geo._make(pos,nor,uv,col);};
// the THORN CUSHION: a dense grey-green dome bristling with pale spines (thin triangles out along the normal)
G.thorn=function(){const g=dome(4,12,{shift:.15,side:.12,pw:.6,bump:(a,r)=>.03*Math.sin(a*9+r*7),col:(a,r,b)=>{const k=mix(.95,.6,smooth(.6,1,r));return[k,k,k];}});
 const pos=Array.from(g.attributes.position.array),nor=Array.from(g.attributes.normal.array),uv=Array.from(g.attributes.uv.array),col=Array.from(g.attributes.color.array);
 for(let k=0;k<90;k++){const a=rr(0,TAU),r=Math.sqrt(rng())*.97,ca=Math.cos(a),sa=Math.sin(a),rs=r*(1-.12*ca),hh=Math.pow(Math.max(0,1-r*r),.6)*(1+.15*ca*(1-r));
  const bx=ca*rs,bz=sa*rs,n=[ca*r*.9,Math.max(.25,1-r*.7),sa*r*.9],nl=Math.hypot(...n),L=rr(.1,.2),w=.018,px=-sa,pz=ca;
  const tip=[bx+n[0]/nl*L,hh+n[1]/nl*L,bz+n[2]/nl*L];
  [[bx-px*w,hh,bz-pz*w],[bx+px*w,hh,bz+pz*w],tip].forEach((p,i)=>{pos.push(...p);nor.push(n[0]/nl,n[1]/nl,n[2]/nl);uv.push(0,0);const c=i===2?1.5:1.1;col.push(c,c*.98,c*.9);});}
 return BIO.geo._make(pos,nor,uv,col);};
// the BOG QUILT: a flat glossy dome, a cell of the bofedal's cushion carpet
G.bogq=function(){return dome(3,10,{shift:.05,side:.05,pw:.35,bump:(a,r)=>.04*Math.sin(a*6+r*5),col:(a,r,b)=>{const k=mix(1.08,.6,smooth(.55,1,r));return[k,k,k];}});};
// a ROSETTE of narrow stiff blades, vertex-coloured pale at the base, unit radius (the vigil spike's: long, arching,
// many tiers; the outermost droop)
G.rosette=function(tiers,droop){const pos=[],nor=[],uv=[],col=[];droop=droop||0;
 tiers.forEach((tr,ti)=>{const n=tr[0],R=tr[1],el=tr[2],wd=tr[3];const a0=ti*.31;
  for(let k=0;k<n;k++){const a=a0+k/n*TAU,ca=Math.cos(a),sa=Math.sin(a),px=-sa,pz=ca,W=wd*R;
   const P=t=>{const r=R*t,e=el-droop*t*t*(1-ti/tiers.length);return[ca*r*Math.cos(e),Math.sin(e)*r+.05,sa*r*Math.cos(e)];};
   const A=[ca*.04,.02,sa*.04],M=P(.5),T=P(1),nrm=[-Math.sin(el)*ca,Math.cos(el),-Math.sin(el)*sa];
   const pv=(p,c)=>{pos.push(p[0],p[1],p[2]);nor.push(nrm[0],nrm[1],nrm[2]);uv.push(0,0);col.push(c,c,c);};
   pv([A[0]-px*W,A[1],A[2]-pz*W],.6);pv([M[0]+px*W*.8,M[1],M[2]+pz*W*.8],.85);pv([A[0]+px*W,A[1],A[2]+pz*W],.6);
   pv([A[0]-px*W,A[1],A[2]-pz*W],.6);pv([M[0]-px*W*.8,M[1],M[2]-pz*W*.8],.85);pv([M[0]+px*W*.8,M[1],M[2]+pz*W*.8],.85);
   pv([M[0]-px*W*.8,M[1],M[2]-pz*W*.8],.85);pv(T,1.05);pv([M[0]+px*W*.8,M[1],M[2]+pz*W*.8],.85);}});
 return BIO.geo._make(pos,nor,uv,col);};
// a FLOWER SPIKE: a tall knobbly column, the florets a checker of light and dark (vertex colour); unit height, radius .5
G.spire=function(){const pos=[],nor=[],uv=[],col=[];const seg=10,nr=26,P=[];
 const hh=(i,s)=>{const v=Math.sin(i*12.9898+s*78.233)*43758.5453;return v-Math.floor(v);};
 for(let i=0;i<=nr;i++){const t=i/nr,r=.5*Math.pow(Math.sin(Math.PI*Math.min(1,t*.96+.03)),.45)*(1-.55*t),row=[];
  for(let s=0;s<seg;s++){const a=s/seg*TAU,k=hh(i,s),bump=i===0||i===nr?1:1+.28*k;row.push([Math.cos(a)*r*bump,t,Math.sin(a)*r*bump,mix(.68,1.15,k)]);}P.push(row);}
 const pv=p=>{const l=Math.hypot(p[0],p[2])||1;pos.push(p[0],p[1],p[2]);nor.push(p[0]/l,.2,p[2]/l);uv.push(0,0);col.push(p[3],p[3],p[3]);};
 for(let i=0;i<nr;i++)for(let s=0;s<seg;s++){const a=P[i][s],b=P[i][(s+1)%seg],c=P[i+1][s],d=P[i+1][(s+1)%seg];pv(a);pv(d);pv(c);pv(a);pv(b);pv(d);}
 return BIO.geo._make(pos,nor,uv,col);};
// the GLASS TOWER: tiers of broad cupped bracts shingled down a cone, each overlapping the one above it; unit height,
// origin at the base. Vertex colour: greener low down, cream above, a blush at the bract tips.
G.tower=function(){const pos=[],nor=[],uv=[],col=[];const tiers=13;
 for(let t=0;t<tiers;t++){const u=t/tiers,y0=u*.94,R=.36*Math.pow(Math.sin(Math.PI*Math.min(1,u*.85+.18)),.8)*(1-.35*u)+.05,n=7,a0=t*.45;
  for(let k=0;k<n;k++){const a=a0+k/n*TAU,ca=Math.cos(a),sa=Math.sin(a),px=-sa,pz=ca,W=R*.62,L=.15+.06*(1-u);
   // a bract: base on the axis-side ring, tip hanging down and out over the tier below (cupped: its middle bowed out)
   const b=[ca*R*.55,y0+L,sa*R*.55],m=[ca*(R*1.04),y0+L*.45,sa*(R*1.04)],tp=[ca*R*.96,y0-L*.25,sa*R*.96];
   const g=mix(.85,1.08,smooth(0,.35,u)),cB=[g*.88,g,g*.78],cM=[1.04,1.04,.94],cT=[1.12,.9,.86],nn=[ca,.35,sa];
   const pv=(p,c)=>{pos.push(p[0],p[1],p[2]);nor.push(nn[0],nn[1],nn[2]);uv.push(0,0);col.push(c[0],c[1],c[2]);};
   pv([b[0]-px*W*.6,b[1],b[2]-pz*W*.6],cB);pv([m[0]-px*W,m[1],m[2]-pz*W],cM);pv([m[0]+px*W,m[1],m[2]+pz*W],cM);
   pv([b[0]-px*W*.6,b[1],b[2]-pz*W*.6],cB);pv([m[0]+px*W,m[1],m[2]+pz*W],cM);pv([b[0]+px*W*.6,b[1],b[2]+pz*W*.6],cB);
   pv([m[0]-px*W,m[1],m[2]-pz*W],cM);pv(tp,cT);pv([m[0]+px*W,m[1],m[2]+pz*W],cM);}}
 return BIO.geo._make(pos,nor,uv,col);};
// a HONEYCOMB: a wild bees' comb hung from an overhang, a half-disc slab with a pale cell rim (vertex colour); unit,
// hung from y=0 down, facing +z
G.comb=function(){const pos=[],nor=[],uv=[],col=[];const n=10,th=.06;
 for(const sd of [1,-1])for(let k=0;k<n;k++){const a0=Math.PI+k/n*Math.PI,a1=Math.PI+(k+1)/n*Math.PI;
  const P=[[0,0],[Math.cos(a0)*.5,Math.sin(a0)*1],[Math.cos(a1)*.5,Math.sin(a1)*1]].map(p=>[p[0],p[1],sd*th]);
  const pv=(p,c)=>{pos.push(p[0],p[1],p[2]);nor.push(0,0,sd);uv.push(0,0);col.push(c,c*.95,c*.8);};
  if(sd>0){pv(P[0],.85);pv(P[1],1.1);pv(P[2],1.1);}else{pv(P[0],.85);pv(P[2],1.1);pv(P[1],1.1);}}
 return BIO.geo._make(pos,nor,uv,col);};
// WORMWICK: a thin dark stalk out of the turf with a swollen orange tip; unit height, origin at the ground
G.wick=function(){const g=new T3.CylinderGeometry(.08,.22,1,5,3,false).translate(0,.5,0).toNonIndexed(),p=g.attributes.position.array,col=[];
 for(let i=0;i<p.length;i+=3){const y=p[i+1];if(y>.78){p[i]*=1.6;p[i+2]*=1.6;}const tip=smooth(.7,.85,y);col.push(mix(.45,1.4,tip),mix(.3,.9,tip),mix(.18,.3,tip));}
 g.setAttribute('color',new T3.Float32BufferAttribute(col,3));return g;};
// a LEAF QUAD: one broad leaf card lying along +x from its base at the origin, gently arched, face up
G.leafquad=function(){const pos=[],uv=[],nor=[],X=[0,.5,1],Yb=[0,.1,0];
 for(let i=0;i<2;i++)for(const q of [[i,-.5],[i+1,-.5],[i+1,.5],[i,-.5],[i+1,.5],[i,.5]]){const x=X[q[0]];pos.push(x,Yb[q[0]],q[1]);uv.push(q[1]+.5,1-x);nor.push(0,1,0);}
 return BIO.geo._make(pos,nor,uv);};
G.rod=function(){return new T3.CylinderGeometry(.5,.5,1,5,1,true);};
// a flat DISC, face up, unit radius, its uv the unit square (the core's mat lifts each wedge on its own, so its edges
// crack open over a filled card)
G.disc=function(){const pos=[],nor=[],uv=[],N=12;for(let k=0;k<N;k++){const a0=k/N*TAU,a1=(k+1)/N*TAU;
 [[0,0],[Math.cos(a1),Math.sin(a1)],[Math.cos(a0),Math.sin(a0)]].forEach(p=>{pos.push(p[0],.02,p[1]);nor.push(0,1,0);uv.push(.5+p[0]*.5,.5+p[1]*.5);});}
 return BIO.geo._make(pos,nor,uv);};
EHIGH.G=G;

// ---------------------------------------------------------------- materials
const M=EHIGH.MAT={
 bark:EHIGH.BARKTEX.map(t=>BIO.barkMat(t)),
 small:BIO.leafMat(TX.small,'small',{aN:true,swayW:'1.0',swayA:.05}),
 rag:BIO.leafMat(TX.rag,'rag',{aN:true,swayW:'1.0',swayA:.06}),
 ichu:BIO.leafMat(TX.ichu,'ichu',{swayW:'(position.y)',swayA:.13,alphaTest:.4}),
 turf:BIO.leafMat(TX.turf,'turf',{swayW:'0.0',swayA:0,alphaTest:.35}),
 lichen:BIO.leafMat(TX.lichen,'lichen',{swayW:'0.0',swayA:0,alphaTest:.3}),
 bloom:BIO.leafMat(TX.bloom,'bloom',{swayW:'1.0',swayA:.04,alphaTest:.4}),
 broad:BIO.leafMat(TX.broad,'broad',{aN:true,swayW:'(position.x)',swayA:.04,alphaTest:.4}),
 // vertex-coloured solids that do not sway (cushions, rosettes) and ones that do a little (spikes)
 vcol:BIO.leafMat(null,'vcol',{swayW:'0.0',swayA:0,alphaTest:0,vertexColors:true}),
 vsway:BIO.leafMat(null,'vsway',{swayW:'(position.y)',swayA:.03,alphaTest:0,vertexColors:true}),
 // the cushion's skin and the fleece: textured and vertex-coloured
 cushion:BIO.leafMat(TX.rosettes,'cushionskin',{swayW:'0.0',swayA:0,alphaTest:0,vertexColors:true}),
 wool:BIO.leafMat(TX.wool,'wool',{swayW:'0.0',swayA:0,alphaTest:0,vertexColors:true}),
 glass:BIO.leafMat(null,'glass',{swayW:'(position.y)',swayA:.02,alphaTest:0,vertexColors:true}),
 solid:BIO.solidMat(null,0xffffff),
 rock:BIO.solidMat(EHIGH.ROCKTEX),
 mother:BIO.barkMat(TX.rosettes),
};
// THE GLASS: the tower's bracts pass light. Lambert cannot, so the material adds it back: a glow from inside that is
// strongest when the viewer looks toward the sun through the tower (backlit), and a steady faint one otherwise.
{const hook=M.glass.onBeforeCompile;M.glass.onBeforeCompile=function(sh){hook(sh);
 sh.fragmentShader=sh.fragmentShader.replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\n'+
  '{vec3 _V=normalize(cameraPosition-vFlWP);float _bl=pow(max(dot(-_V,uSunDir),0.0),2.5);'+
  'totalEmissiveRadiance+=diffuseColor.rgb*vec3(1.0,0.96,0.82)*(0.16+0.85*_bl);}');};}
// THE CUSHION SKIN: the rosette texture tiles in world metres (the instance's own uv would stretch it on a big
// cushion); the mother's bucket carries its own uv, already in metres
{const hook=M.cushion.onBeforeCompile;M.cushion.onBeforeCompile=function(sh){hook(sh);
 sh.fragmentShader=sh.fragmentShader.replace('#include <map_fragment>','vec4 texelColor=texture2D(map,vFlWP.xz*'+(1/(EHIGH.SKIN_SCALE||1.33)).toFixed(3)+'+vFlWP.y*0.25);texelColor=mapTexelToLinear(texelColor);diffuseColor*=texelColor*'+(1/Math.max(.1,(EHIGH.SKIN_MEAN[0]+EHIGH.SKIN_MEAN[1]+EHIGH.SKIN_MEAN[2])/3)).toFixed(3)+';');};}
// ---------------------------------------------------------------- the library (core/materials/PLAN.md, Eastern highlands)
// When the page carries this kit's pack (materials.json -> KMAT.pack('ehigh'): the showcase), the procedural textures
// give way to the library's. The painters above still ran, so the random stream, and every plant's place and shape, are
// unchanged. A page without the pack (an open world) keeps the procedural ones; ?mat=proc shows them here. A card used
// on a tuft or a leaf quad is one cell cut from its sheet of nine; the ragbark's leaf card is used whole on its clumps.
// A cut cell loads asynchronously; window._texPending counts it, as KMAT's own textures do.
const LIBP=n=>(typeof KMAT!=='undefined'&&KMAT.mode==='lib'&&KMAT.packed)?KMAT.packed('ehigh',n):null;
const LIB=EHIGH.LIB={has:n=>!!LIBP(n)};
const lin=v=>{const c=Math.pow(v,2.2);return[c,c,c];};
function libCard(n){const L=LIBP(n);if(!L)return null;const t=KMAT.textures(L,{aniso:4,flipY:false}).map;
 t.generateMipmaps=true;t.minFilter=T3.LinearMipmapLinearFilter;t.magFilter=T3.LinearFilter;return t;}
function libCell(n,box,W,H){const L=LIBP(n);if(!L)return null;const c=document.createElement('canvas');c.width=W;c.height=H;
 const t=new T3.CanvasTexture(c);t.flipY=false;t.encoding=T3.sRGBEncoding;t.wrapS=t.wrapT=T3.ClampToEdgeWrapping;t.anisotropy=4;
 const img=new Image();if(typeof window!=='undefined')window._texPending=(window._texPending||0)+1;
 img.onload=()=>{const w=img.width,h=img.height,g=c.getContext('2d');g.drawImage(img,box[0]*w,box[1]*h,(box[2]-box[0])*w,(box[3]-box[1])*h,0,0,W,H);t.needsUpdate=true;window._texPending--;};
 img.onerror=()=>{window._texPending--;BIO.err('ehigh: a library card failed to decode: '+n);};
 img.src=L.map;return t;}
const CELL=(i,j)=>[i/3+.005,j/3+.005,(i+1)/3-.005,(j+1)/3-.005];   // a cell of a 3 x 3 sheet, column i, row j
const libMap=n=>{const L=LIBP(n);if(!L)return null;const t=KMAT.textures(L,{aniso:4}).map;t.wrapS=t.wrapT=T3.RepeatWrapping;return{t,scale:L.scale,mean:L.mean>0?L.mean:.6};};
EHIGH.LIBMEAN={};
{const use=(k,t,at)=>{if(t){M[k].map=t;M[k].alphaTest=at==null?.4:at;}};
 use('ichu',libCell('leaf.ichu',CELL(1,1),256,256),.3);
 use('rag',libCard('leaf.rag'),.4);
 use('broad',libCell('leaf.broad',CELL(1,1),256,256),.4);}
LIB.rag=!!LIBP('leaf.rag');LIB.broad=!!LIBP('leaf.broad');LIB.ichu=!!LIBP('leaf.ichu');
// the skins: the cushions' and the Mother's (the shaders divide out the pack's mean, as they did the canvas's)
{const L=libMap('skin.cushion');if(L){M.cushion.map=L.t;M.mother.map=L.t;EHIGH.SKIN_MEAN=lin(L.mean);EHIGH.SKIN_SCALE=L.scale[0];}}
{const L=libMap('skin.fleece');if(L)M.wool.map=L.t;}
{const L=libMap('stone.basalt');if(L){M.rock.map=L.t;LIB.basalt=true;EHIGH.LIBMEAN.rock=L.mean;EHIGH.BASALT={map:L.t,mean:L.mean};}}
const RAGL=libMap('bark.ragbark');if(RAGL){M.bark[1].map=RAGL.t;EHIGH.LIBMEAN.bark1=RAGL.mean;}
['Furrowed bark','Ragbark (papery layers)','Hoar cereus (white hair)','Dead leaf skirt'].forEach((lab,i)=>BIO.bucket('bark'+i,M.bark[i],{label:lab,uvScale:i===1?(RAGL?RAGL.scale:[2,2.5]):i===2?[1.5,2]:[3,4]}));
BIO.bucket('mother',M.mother,{label:'The Mother Cushion'});
BIO.bucket('far',BIO.barkMat(null),{label:'Far plants (impostors)'});

// ---------------------------------------------------------------- instanced items
BIO.def('small',BIO.geo.clump(),M.small,{attrs:['aN'],label:'Tola foliage'});
BIO.def('rag',BIO.geo.clump(),M.rag,{attrs:['aN'],label:'Ragbark leaves'});
BIO.def('ichu',G.tuft(),M.ichu,{label:'Ichu'});
BIO.def('turf',G.disc(),M.turf,{label:'Sedge turf'});
BIO.def('lichen',BIO.geo.mat(),M.lichen,{label:'Lichens and mat algae'});
BIO.def('sinter',BIO.geo.mat(),M.lichen,{label:'Mat algae (the geysers\' run-off)'});
BIO.def('bloom',BIO.geo.bloom(),M.bloom,{label:'Flowers'});
BIO.def('broad',G.leafquad(),M.broad,{attrs:['aN'],label:'Glass-tower leaves'});
BIO.def('cushion',G.cushion(),M.cushion,{label:'Poured cushions'});
BIO.def('bogq',G.bogq(),M.cushion,{label:'Bog cushions'});
BIO.def('wool',G.wool(),M.wool,{label:'Woolbacks'});
// a vertex-coloured material needs a colour on every vertex (a missing attribute reads black): the snow wool's ball
// is white on top, greyer underneath
BIO.def('snowwool',(function(){const g=new T3.IcosahedronGeometry(1,1).toNonIndexed(),p=g.attributes.position.array,c=[];
 for(let i=0;i<p.length;i+=3){const k=mix(.65,1.05,smooth(-.8,.6,p[i+1]));c.push(k,k,k);}g.setAttribute('color',new T3.Float32BufferAttribute(c,3));return g;})(),M.wool,{label:'Snow wool'});
BIO.def('thorn',G.thorn(),M.vcol,{label:'Thorn cushions'});
BIO.def('rosette',G.rosette([[22,1.0,.12,.05],[18,.88,.4,.05],[14,.72,.7,.05],[10,.55,1.0,.05],[6,.38,1.3,.05]],.9),M.vcol,{label:'Rosettes (vigil spike)'});
BIO.def('spire',G.spire(),M.vsway,{label:'Flower spikes (vigil spike)'});
BIO.def('tower',G.tower(),M.glass,{label:'Glass towers'});
BIO.def('comb',G.comb(),M.vcol,{label:'Wild honeycomb (tower honey)'});
BIO.def('wick',G.wick(),M.vcol,{label:'Wormwick'});
BIO.def('lobe',BIO.geo.lobe(),M.solid,{label:'Shrub masses'});
BIO.def('rod',G.rod(),M.solid,{label:'Stems'});
BIO.def('boulder',new T3.IcosahedronGeometry(1,1),M.rock,{label:'Basalt boulders'});
BIO.def('stone',new T3.IcosahedronGeometry(1,0),M.rock,{label:'Stones'});
BIO.def('fruit',new T3.IcosahedronGeometry(1,0),M.solid,{label:'Fruit and flower eyes'});
})();
