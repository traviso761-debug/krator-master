// ================================================================= KORONA — species (data + kit items)
// Korona's own life on top of the necanyons kit's (read in place: its canyon flora and its harmless carnivores grow on the
// rock here too). The rule (NOTES.md): carnivory follows poor soil. Where the ground is bare quartzite or leached sand and
// no silt has come, a plant eats what it catches, and on the warm wet floor of a gorge or a hollow the traps are sized
// for a person. Where silt lies the herbs take over: the reagents that bring people here.
//   TREES: the coin tree (a wind-pruned dwarf of the summit's cracks, frosted coin leaves) and the lace fan (a fungus-tree
//     of the dim wet gorge: tiers of translucent lace fans on a twisted bole)
//   THE SUMMIT: the lace pitcher (a small sun pitcher of the bogs), the rainbow fan (THE REAGENT: a fan rosette in every
//     colour but one, in the pavement's soil pockets), storm pods (sealed pods on the exposed rim)
//   THE HELL (57 places them; each carries a trap record with its danger, core/biome/37-core-traps.js): the great sundew
//     (a frond fountain, flypaper, holds a child's arm), the cobra lily, the blood trumpet, the MAN-EATER (a pitcher a
//     person falls into), the ground star (a snap trap flat on the peat), the blood bulb (the sticky moor), the coil
//     tendril (a grab), the trap pad on the sucking pools, the snare flower, and the lures that hang over them
// Everything here is DATA and kit definitions; no placement. Tags follow the project rule (climate / aridity / abyssal /
// riparian / koppen) plus `zone` (the necanyons zones) and, on a carnivore, `trap` (its danger is the hazard).
const KORONA={};
BIO.kit('korona');   // this kit's own registry of items and buckets (core/biome: kits)
(function(){const {TAU,clamp,lerp,mix,smooth,reseed,rng,rr,ri,pick,h3,vnoise,fbm}=BIO.fn;
const T3=BIO.host.THREE,C=h=>new T3.Color(h);KORONA.C=C;
KORONA.TAGS={climate:'tropic',aridity:'humid',abyssal:false,riparian:'no',koppen:['Cfa','Af','Aw']};

// ---------------------------------------------------------------- palettes (sRGB; a library card carries its own colour)
const PAL=KORONA.PAL={
 coin:[0xa8bcc8,0xc4d2da,0xd05a48,0xd8a040],coinBark:[0x6a6660,0x7a7670,0x5a5650],
 lacefan:[0xf0a060,0xf8c890,0xe8904a],lacefanBark:[0x7a5a48,0x6a4c3c,0x86685a],
 lace:[0xf0ece4,0xe8e0d0,0x9a1e2a],gsundew:[0x9ab040,0xb8302a,0x6a8a34],
 rfan:[0xe04020,0xd8e040,0x40c8c0,0x60a0e0,0xf0b030,0x90e0a0,0xf0e0c0,0x182848,0xc02020],
 stormpod:[0x5a9a30,0x8ac040,0xc8c890],cobra:[0x7aa040,0xb8c850,0xa02828],trumpet:[0x7a1018,0xb8202a,0x4a6a2a],
 pitcher:[0x4a7a30,0x6a9a40,0x5a8a38],pitcherSpot:[0x7a1a1a,0x5a1212],throat:[0xc8c860,0xb84030,0x8a1a20],
 tendril:[0xb8c030,0xa8b028,0x2a4a1e],star:[0xc83020,0xe05030,0xd84028],lure:[0xf4f0e8,0xe8b030,0xb02030],
 bulb:[0xc02828,0xe04040,0xd03030],bulbStalk:[0x5a1818,0x6a2020],snare:[0xd84a30,0xe8a040,0x8a2a2a],pad:[0x4a7a2a,0x6a9a3a,0x5a8a34],
 stalk:[0x5a6a3a,0x6a7a44,0x4a5a30],cairn:[0x8a8078,0x9a9088,0x7a7068],stag:[0x4a7a3a,0x5a8a44]};

// ---------------------------------------------------------------- the trap records (core/biome/37-core-traps.js): danger is the hazard
const TR=KTRAPS.make;
KORONA.TRAPS={
 lacepitcher:TR({kind:'pitfall',mouth:.08,preyMax:'insect',lure:'nectar'}),
 greatsundew:TR({kind:'flypaper',mouth:.5,preyMax:'medium',lure:'dew',danger:.15}),
 cobralily:TR({kind:'pitfall',mouth:.2,preyMax:'small',lure:'nectar'}),
 bloodtrumpet:TR({kind:'pitfall',mouth:.3,preyMax:'medium',lure:'nectar',danger:.1}),
 maneater:TR({kind:'pitfall',mouth:1.3,preyMax:'person',lure:'scent',danger:1,cycle:{wait:600,shut:1.5,digest:86400,reopen:600}}),   /* a pitfall has no cycle of its own; the lid's drop takes the grab's */
 groundstar:TR({kind:'snap',mouth:1.4,preyMax:'large',lure:'scent',danger:.6}),
 bloodbulb:TR({kind:'flypaper',mouth:.15,preyMax:'small',lure:'dew',danger:.05}),
 coiltendril:TR({kind:'grab',mouth:2,preyMax:'person',lure:null,danger:1}),
 bladderpool:TR({kind:'suction',mouth:.3,preyMax:'medium',lure:null,danger:.3}),
 trappad:TR({kind:'snap',mouth:1.8,preyMax:'large',lure:null,danger:.4}),
 snareflower:TR({kind:'snare',mouth:.6,preyMax:'medium',lure:'scent',danger:.5}),
 punjipit:TR({kind:'pitfall',mouth:1.1,preyMax:'person',lure:null,danger:1}),
 beartrap:TR({kind:'snap',mouth:1.3,preyMax:'large',lure:'scent',danger:.8}),
 frosttank:TR({kind:'tank',mouth:.3,preyMax:'small',lure:null,danger:.2}),
 butterwort:TR({kind:'flypaper',mouth:.03,preyMax:'insect',lure:'dew'}),
 numbthorn:TR({kind:'snare',mouth:.1,preyMax:'person',lure:null,danger:.7,cycle:{wait:900000,shut:.4,digest:300000,reopen:60000}})};

// ---------------------------------------------------------------- the tree-scale species
const K=(climate,aridity,riparian,koppen,zone)=>Object.assign({},KORONA.TAGS,{climate,aridity,riparian,koppen,zone});
KORONA.SPECIES=[
 {key:'cointree',name:'Coin tree',H:[2.5,6],rb:[.12,.3],crownR:[1.4,3],leaf:PAL.coin,barkC:PAL.coinBark,
  far:{blobs:[[.7,.8,.4,0xa8bcc8,0xd05a48]]},tags:K('temperate','humid','no',['Cfa','Cfb'],'cap')},
 {key:'lacefan',name:'Lace fan tree',H:[6,14],rb:[.3,.6],crownR:[2.5,5],leaf:PAL.lacefan,barkC:PAL.lacefanBark,
  far:{blobs:[[.62,.9,.4,0xf0a060,0x4a3528]]},tags:K('hypertropic','humid','both',['Af','XA'],'foot')},
];
KORONA.SPECIES.forEach((S,i)=>S.i=i);
KORONA.byKeyS={};KORONA.SPECIES.forEach(S=>KORONA.byKeyS[S.key]=S);

// ---------------------------------------------------------------- harvest (biomes/FRUIT.md; kits/crops)
const HV=(wood,edible,medicinal,notes,fruit)=>({wood,edible:edible||[],medicinal:!!medicinal,notes:notes||'',fruit:fruit||null});
KORONA.HV=HV;
KORONA.HARVEST={
 cointree:HV('firewood (gnarled, slow)',[],false,'A dwarf tree wind-pruned to a bonsai in the pavement\'s cracks: round coin leaves frosted silver-blue, a coral or amber flush at the edge. The summit\'s one tree.'),
 lacefan:HV('none (a fungus)',['lace fan flesh (dried; bitter, a reagent)'],true,'A fungus-tree of the dim wet gorge: a twisted dark bole and tiers of translucent peach lace fans that glow at dusk. The dried fan is a reagent (a stimulant; a tonic in small doses).'),
};
KORONA.SPECIES.forEach(S=>{S.tags.harvest=KORONA.HARVEST[S.key]||HV('none');});

// ---------------------------------------------------------------- the small plants and the carnivores, tagged
// Placed by 57 (the hell) and 60 (the summit). `items` names the instanced items that draw each, for the inspector.
const PK=(name,c,a,r,kp,zone,items,hv,trap)=>({name,tags:Object.assign(K(c,a,r,kp,zone),{harvest:hv||HV('none')},trap?{trap:KORONA.TRAPS[trap]}:{}),items});
KORONA.PLANTS={
 lacepitcher:PK('Lace pitcher','temperate','humid','yes',['Cfa'],'cap',['lace0','lace1'],HV('none',['nectar (from the hood)'],false,'The summit\'s small sun pitcher: green tubes laced white and crimson at the hood, in the sphagnum of the pavement\'s hollows. Insects drown in it; it is the idyllic end of the rule.'),'lacepitcher'),
 rainbowfan:PK('Rainbow fan','temperate','humid','no',['Cfa'],'cap',['rfan0','rfan1','rfan2','rfan3','rfan4'],HV('none',[],true,'THE REAGENT: a pleated fan rosette in the pavement\'s soil pockets, each plant one colour family (crimson, lime, teal, blue, gold, mint, cream, navy, black-red) and no two alike. The dried blades are the apothecaries\' dyes and reagents; a crimson one is worth a season\'s climb. Grows only where the summit holds a little silt, never on the bare rock.')),
 stormpod:PK('Storm pods','temperate','humid','no',['Cfa'],'rim',['stormpod0','stormpod1'],HV('none',['pod seeds (roasted)'],false,'Tall sealed green pods on the exposed rim that split after a storm; the tribes gather the seeds.')),
 greatsundew:PK('Great sundew','tropic','humid','yes',['Af','Cfa'],'foot',['gsundew0','gsundew1'],HV('none',[],true,'A sundew the size of a tree fern: a fountain of arching fronds beaded with dew that holds a frog, a bird, a child\'s arm, and curls over it in an hour. The first trap in Korona that holds more than an insect; its dew is the rimdew\'s syrup, stronger.'),'greatsundew'),
 cobralily:PK('Cobra lily','tropic','humid','yes',['Af'],'foot',['cobra0','cobra1','cobrab0','cobrab1'],HV('none',[],false,'Hooded green tubes twisting up to a cobra\'s head with translucent windows and a forked red tongue: a pitfall for frogs and lizards. A meadow of them stands where the seeps run out into a hollow; the safe path crosses it.'),'cobralily'),
 bloodtrumpet:PK('Blood trumpet','tropic','humid','yes',['Af'],'floor',['trumpet0','trumpet1'],HV('none',[],false,'Waist-high crimson trumpets with a cream throat, glossy as if wet: a pitfall that takes a rat or a small dog.'),'bloodtrumpet'),
 maneater:PK('Man-eater pitcher','hypertropic','humid','yes',['Af','XA'],'floor',['lure0','lure1','hood'],HV('none',[],false,'THE MAN-EATER: a pitcher two or three metres tall, waxy green mottled with blood, its lid half open, a lure flower on a stalk beside it. A person who slips on its rim goes into a throat of downward hairs and digestive fluid. Danger 1. Only where the ground is poor, wet and warm (the hell field).'),'maneater'),
 groundstar:PK('Ground star','tropic','humid','yes',['Af'],'floor',['star0','star1'],HV('none',[],false,'A red tentacled mouth lying flat on the peat, a metre across: tread on it and it closes on the leg. Danger 0.6.'),'groundstar'),
 bloodbulb:PK('Blood bulbs','tropic','humid','yes',['Af'],'floor',['bulb0','bulb1'],HV('none',[],true,'Fist-sized sticky red heads on thin dark stalks standing in thousands across the open flats of a hollow: the moor. Each holds what brushes it; a person walks through and comes out bleeding and sticky. The heads are a styptic.'),'bloodbulb'),
 coiltendril:PK('Coil tendril','hypertropic','humid','yes',['Af','XA'],'floor',['stalk','tendriltip'],HV('none',[],false,'Yellow-green banded coils lying across the floor, warty and waxy, that lift and wind round whatever steps inside the coil. Danger 1.'),'coiltendril'),
 bladderpool:PK('Sucking pool','tropic','humid','yes',['Af'],'floor',['pad'],HV('none',[],false,'A black pool whose bed is a carpet of green bladders: a foot that stirs them is sucked down to the knee. Danger 0.3. Trap pads float on it.'),'bladderpool'),
 trappad:PK('Trap pad','tropic','humid','yes',['Af'],'floor',['pad'],HV('none',[],false,'A giant lily pad floating on a sucking pool, its edge fringed with hairs: it folds on what lands on it. Danger 0.4.'),'trappad'),
 snareflower:PK('Snare flower','tropic','humid','yes',['Af'],'floor',['snare'],HV('none',[],false,'The Throne\'s snare flower, here on the warm poor floor: petals that are a noose. Danger 0.5.'),'snareflower'),
 punjipit:PK('Punji pit','hypertropic','humid','yes',['Af','XA'],'floor',['lid','spike','mouth'],HV('none',[],false,'A pitcher that lives under the ground: only its lid shows, a round of dead leaves flush with the floor, and a person who steps on it goes through onto spikes of bone-hard leaf and into the fluid below. A third stand with the mouth open and the lid thrown back. Danger 1.'),'punjipit'),
 beartrap:PK('Bear-trap plant','tropic','humid','yes',['Af'],'floor',['jaw'],HV('none',[],false,'A flytrap of a kind: two toothed jaws a metre and more across lying open on the peat, their teeth interlocked when they shut. A leg stepped between them is held to the bone; they shut in a blink and open again in a week. Danger 0.8.'),'beartrap'),
 numbthorn:PK('Lash flower (the numb thorn)','tropic','humid','yes',['Af','Cfa'],'floor',['petal','mouth'],HV('none',[],true,'A thick segmented stalk out of a rosette of leaves, and on it a flower of four big pleated orange petals round a hot-pink throat, a long tongue hanging from it. The tongue lashes at what comes near and its touch numbs a limb in a minute, the whole body in ten; the petals fold over the throat on what it holds, and the floor\'s other traps finish the rest. The tribes milk the tongue for a hunting poison and a surgeon\'s numbing. Danger 0.7.'),'numbthorn'),
 frosttank:PK('Frost tank','polar','humid','yes',['ET','Dsc'],'cap',['mouth'],HV('none',[],false,'A small pale pitcher of the ice tables that holds meltwater: it freezes at night, takes what falls through the thin ice by day, and splits in spring to drop a winter\'s catch. A foot goes through it to the ankle. Danger 0.2.'),'frosttank'),
 butterwort:PK('Butterworts','polar','humid','yes',['ET','Dsc'],'cap',['pad'],HV('none',[],true,'Sticky pale rosettes flat on the melt pools\' margins, the ice tables\' flypaper for the summer\'s flies. Their leaves curdle milk and heal a cut.'),'butterwort'),
 wallfern:PK('Staghorn ferns','tropic','humid','yes',['Af','Cfa'],'ledge',['staghorn'],HV('none',[],false,'Staghorn ferns pressed to the wet wall under every seep line: the hanging gardens\' green.')),
 cairn:PK('A cairn (the safe path)','tropic','humid','no',['Af'],'floor',['cairn'],HV('none',[],false,'A stone the tribes set every twenty paces along the one way through a hollow. Whistle the Hum and keep to the cairns.')),
};
KORONA.plantOfItem=item=>{for(const k in KORONA.PLANTS)if(KORONA.PLANTS[k].items.indexOf(item)>=0)return KORONA.PLANTS[k];return null;};
KORONA.CARNIVORES=Object.keys(KORONA.PLANTS).filter(k=>KORONA.PLANTS[k].tags.trap);

// ---------------------------------------------------------------- leaf textures (procedural, greyscale: the fallback when the page
// carries no library pack). The owner's 3 x 3 sheets are shown by cell (cellUV); the fallbacks are painted 3 x 3 too.
reseed(500091);
const TX={},G2=v=>'rgb('+(v|0)+','+(v|0)+','+(v|0)+')',S9=fn=>(g,S)=>{for(let j=0;j<3;j++)for(let i=0;i<3;i++){g.save();g.translate(i*S/3,j*S/3);g.scale(1/3,1/3);fn(g,S,i+3*j);g.restore();}};
/* an upright clump: tubes standing from the cell's foot (pitchers, pods, trumpets, cobra lilies) */
TX.tubes=BIO.alphaTex(256,S9((g,S)=>{for(let k=0;k<4;k++){const x=S*(.28+k*.14),h=S*rr(.5,.85);g.fillStyle=G2(rr(140,215));g.beginPath();g.moveTo(x-S*.035,S);g.lineTo(x-S*.07,S-h);g.lineTo(x+S*.07,S-h);g.lineTo(x+S*.035,S);g.closePath();g.fill();
  g.fillStyle=G2(100);g.beginPath();g.ellipse(x,S-h,S*.07,S*.025,0,0,TAU);g.fill();}}),[120,110,60]);
/* a frond arching over from the foot, fringed (the great sundew) */
TX.frond=BIO.alphaTex(256,S9((g,S)=>{g.strokeStyle=G2(170);g.lineWidth=S*.03;g.beginPath();g.moveTo(S*.5,S);g.quadraticCurveTo(S*.5,S*.3,S*.72,S*.14);g.stroke();
  g.lineWidth=2;for(let t=0;t<1;t+=.045){const x=S*.5+(S*.22)*t*t,y=S-(S*.86)*t;g.strokeStyle=G2(rr(150,235));g.beginPath();g.moveTo(x-S*.1,y);g.lineTo(x+S*.1,y);g.stroke();}}),[90,110,50]);
/* a twig end with round leaves (the coin tree) */
TX.coin=BIO.alphaTex(256,S9((g,S)=>{g.strokeStyle=G2(110);g.lineWidth=S*.025;g.beginPath();g.moveTo(S*.5,S);g.quadraticCurveTo(S*.45,S*.6,S*.55,S*.3);g.stroke();
  for(let k=0;k<12;k++){g.fillStyle=G2(rr(160,235));g.beginPath();g.arc(S*.5+rr(-.3,.3)*S,S*.5+rr(-.35,.3)*S,S*rr(.05,.09),0,TAU);g.fill();}}),[170,180,190]);
/* a pleated fan from the foot (the rainbow fan, the lace fan) */
TX.fan=BIO.alphaTex(256,S9((g,S)=>{const c=S/2,y0=S*.95;for(let k=0;k<40;k++){const a=-Math.PI*.92+k/39*Math.PI*.84,L=S*rr(.6,.85);g.strokeStyle=G2(rr(130,235));g.lineWidth=S*.026;g.beginPath();g.moveTo(c,y0);g.lineTo(c+Math.cos(a)*L,y0+Math.sin(a)*L);g.stroke();}}),[120,120,120]);
/* a star of tentacles round a mouth, from above (the ground star) */
TX.star=BIO.alphaTex(256,S9((g,S)=>{const c=S/2;g.lineCap='round';for(let k=0;k<14;k++){const a=k/14*TAU;g.strokeStyle=G2(rr(150,220));g.lineWidth=S*.05;g.beginPath();g.moveTo(c,c);g.quadraticCurveTo(c+Math.cos(a)*S*.3,c+Math.sin(a)*S*.3,c+Math.cos(a+.6)*S*.42,c+Math.sin(a+.6)*S*.42);g.stroke();}
  g.fillStyle=G2(60);g.beginPath();g.arc(c,c,S*.1,0,TAU);g.fill();}),[200,70,50]);
/* a pom-pom head on a stalk (the blood bulb) and a bloom on a stalk (the lure) */
TX.bulb=BIO.alphaTex(256,S9((g,S)=>{g.strokeStyle=G2(90);g.lineWidth=S*.02;g.beginPath();g.moveTo(S*.5,S);g.lineTo(S*.52,S*.35);g.stroke();g.fillStyle=G2(200);for(let k=0;k<40;k++){const a=rr(0,TAU),d=S*.14*Math.sqrt(rng());g.beginPath();g.arc(S*.52+Math.cos(a)*d,S*.3+Math.sin(a)*d,S*.018,0,TAU);g.fill();}}),[190,60,50]);
TX.bloom=BIO.alphaTex(256,S9((g,S)=>{g.strokeStyle=G2(90);g.lineWidth=S*.02;g.beginPath();g.moveTo(S*.5,S);g.lineTo(S*.5,S*.42);g.stroke();for(let k=0;k<5;k++){const a=k/5*TAU;g.fillStyle=G2(rr(190,245));g.beginPath();g.ellipse(S*.5+Math.cos(a)*S*.14,S*.3+Math.sin(a)*S*.14,S*.12,S*.06,a,0,TAU);g.fill();}g.fillStyle=G2(120);g.beginPath();g.arc(S*.5,S*.3,S*.05,0,TAU);g.fill();}),[220,200,160]);
/* a snap trap's lobe: a half moon, hinge at the bottom, teeth round the arc (the bear trap) */
TX.jaw=BIO.alphaTex(256,S9((g,S)=>{const cx=S/2,cy=S*.95,R=S*.4;g.fillStyle=G2(180);g.beginPath();g.arc(cx,cy,R,Math.PI,TAU);g.closePath();g.fill();
  g.strokeStyle=G2(235);g.lineWidth=S*.025;for(let k=1;k<16;k++){const a=Math.PI+k/16*Math.PI;g.beginPath();g.moveTo(cx+Math.cos(a)*R,cy+Math.sin(a)*R);g.lineTo(cx+Math.cos(a)*R*1.25,cy+Math.sin(a)*R*1.25);g.stroke();}}),[150,60,50]);
/* dead leaves lying flat (the punji pit's lid) */
TX.lid=BIO.alphaTex(128,(g,S)=>{for(let i=0;i<70;i++){const x=S*rr(.1,.9),y=S*rr(.1,.9),r=S*rr(.05,.1);g.fillStyle=G2(rr(90,190));g.beginPath();g.ellipse(x,y,r,r*.6,rr(0,TAU),0,TAU);g.fill();}},[110,80,50]);
/* a lily pad from above, a fern pressed flat */
TX.pad=BIO.alphaTex(128,(g,S)=>{g.fillStyle=G2(180);g.beginPath();g.arc(S/2,S/2,S*.46,.3,TAU-.3);g.lineTo(S/2,S/2);g.closePath();g.fill();},[80,120,50]);
TX.stag=BIO.alphaTex(128,(g,S)=>{g.strokeStyle=G2(190);g.lineWidth=S*.08;g.lineCap='round';for(let k=0;k<5;k++){const a=-Math.PI/2+(k-2)*.35;g.beginPath();g.moveTo(S/2,S);g.lineTo(S/2+Math.cos(a)*S*.8,S+Math.sin(a)*S*.8);g.stroke();}},[80,120,60]);
/* the man-eater's skins: mottled waxy (outside), hairy (the throat), banded (the tendril) */
const skinTex=(fn,w,h)=>BIO.canvasTex(w||256,h||256,(g,W,H)=>{const id=g.createImageData(W,H),d=id.data;for(let y=0;y<H;y++)for(let x=0;x<W;x++){const i=(y*W+x)*4,v=clamp(fn(x,y,W,H),0,255);d[i]=d[i+1]=d[i+2]=v;d[i+3]=255;}g.putImageData(id,0,0);},true);
KORONA.SKIN={
 pitcher:skinTex((x,y)=>165+40*(fbm(x*.04,y*.04,81,3)-.5)-60*smooth(.6,.7,fbm(x*.09,y*.09,82,2))+10*(h3(x,y,83)-.5)),
 throat:skinTex((x,y,W,H)=>150+30*(fbm(x*.05,y*.2,84,2)-.5)+25*Math.sin(x*.9+fbm(x*.1,y*.1,85,2)*6)*(y/H)),
 tendril:skinTex((x,y,W,H)=>140+70*Math.pow(Math.abs(Math.sin(y/H*TAU*3)),.6)+14*(h3(x,y,86)-.5)),
 coin:skinTex((x,y)=>155+40*(fbm(x*.15,y*.012,87,3)-.5)+12*(h3(x,y,88)-.5)),
 lacefan:skinTex((x,y)=>120+60*(fbm(x*.08,y*.015,89,3)-.5)+16*(h3(x,y,90)-.5))};
KORONA.TX=TX;

// ---------------------------------------------------------------- geometries (the necanyons kit's, read in place) and cell mapping
const G=KORONA.G=NECANYONS.G;
const cellUV=(geo,cell)=>{if(!cell)return geo;const g=geo.clone(),u=g.attributes.uv;for(let i=0;i<u.count;i++)u.setXY(i,cell[0]+u.getX(i)*(cell[2]-cell[0]),cell[1]+u.getY(i)*(cell[3]-cell[1]));return g;};
const CELL=k=>{const i=k%3,j=Math.floor(k/3);return[i/3,j/3,(i+1)/3,(j+1)/3];};
KORONA.CELL=CELL;

// ---------------------------------------------------------------- materials
const leaf=(tex,key,o)=>BIO.leafMat(tex,key,Object.assign({swayW:'(position.y)',swayA:.05,alphaTest:.4},o||{}));
const M=KORONA.MAT={
 bark:{coin:BIO.barkMat(KORONA.SKIN.coin),lacefan:BIO.barkMat(KORONA.SKIN.lacefan)},
 pitcher:BIO.barkMat(KORONA.SKIN.pitcher),throat:BIO.barkMat(KORONA.SKIN.throat),tendril:BIO.barkMat(KORONA.SKIN.tendril),
 lace:leaf(TX.tubes,'lace',{swayA:.03}),gsundew:leaf(TX.frond,'gsundew',{swayA:.05}),coin:leaf(TX.coin,'coin',{swayA:.07}),
 rfan:leaf(TX.fan,'rfan',{swayA:.04}),lacefan:leaf(TX.fan,'lacefan',{swayA:.03}),stormpod:leaf(TX.tubes,'stormpod',{swayA:.06}),
 cobra:leaf(TX.tubes,'cobra',{swayA:.04}),cobrab:leaf(TX.tubes,'cobrab',{swayA:.04}),trumpet:leaf(TX.tubes,'trumpet',{swayA:.03}),
 star:leaf(TX.star,'star',{swayW:'0.0',swayA:0}),lure:leaf(TX.bloom,'lure',{swayA:.06}),bulb:leaf(TX.bulb,'bulb',{swayA:.08}),
 snare:leaf(TX.bloom,'snare',{swayA:.05}),giantpad:leaf(TX.pad,'giantpad',{swayW:'0.0',swayA:0}),staghorn:leaf(TX.stag,'staghorn',{swayA:.03}),
 jaw:leaf(TX.jaw,'jaw',{swayW:'0.0',swayA:0,alphaTest:.45}),lid:leaf(TX.lid,'lid',{swayW:'0.0',swayA:0}),petal:leaf(TX.fan,'petal',{swayW:'0.0',swayA:0}),
 /* the moving ends (instanced, on the trap cycle): the man-eater's lid in the pitcher's skin, the coil tendril's tip in the tendril's; their maps follow the buckets' after the swap */
 hood:leaf(KORONA.SKIN.pitcher,'hood',{swayW:'0.0',swayA:0,alphaTest:0}),tendriltip:(()=>{const m=BIO.barkMat(KORONA.SKIN.tendril);m.vertexColors=false;m.userData.bio={kind:'bark',key:BIO.kitKey('tendriltip')};return m;})(),   /* a bark (Lambert) on a rod: the leaf hook shades a cylinder dark */
 solid:BIO.solidMat(null)};
// THE LIBRARY (core/materials/PLAN.md): the slots materials.json names take the library's maps; the procedural ones stay
// without the pack. A sheet's cell is the item's uv (cellUV), not the pack's: one texture per sheet, many cells
KORONA.LIB=BIO.libSwap('korona',M);
if(M.pitcher.map){M.hood.map=M.pitcher.map;M.hood.needsUpdate=true;}if(M.tendril.map){M.tendriltip.map=M.tendril.map;M.tendriltip.needsUpdate=true;}   /* the library's skins on the moving ends too */
const LIBWHITE=C(0xf4f2ec);
const FULL=slot=>{if(!KORONA.LIB[slot]||typeof KMAT==='undefined'||!KMAT.packed)return false;const L=KMAT.packed('korona',slot);return !!(L&&L.tint&&L.tint.keep>=.99);};
KORONA.libCol=(slot,c)=>FULL(slot)?LIBWHITE.clone().lerp(c&&c.isColor?c:C(c),.14):c;
KORONA.FULL=FULL;
// THE TRAPS GO OFF IN THE SHADER (core/biome/37-core-traps.js, KTRAPS.GLSL; the owner, 2026-10-19): each trap item carries
// aTrap = [phase, side, angle, 0]; its vertices move by its trap's k (0 open .. 1 shut) from the wind clock and the phase
// hashed from the trap's id (SPEED compresses the week between snaps for a page). Three motions: HINGE (a jaw turning
// about its hinge line, side +1/-1), FOLD (a pad folding in half about its middle), WHIP (a thorn swinging about its base).
KORONA.SPEED=20000;
function trapHook(mat,trap,kind){const c=trap.cycle,sp=KORONA.SPEED,base=mat.onBeforeCompile;
 const U={value:new T3.Vector4(c.wait/sp,c.shut,c.digest/sp,c.reopen/sp)};
 const xf=kind==='fold'?'{float k=ktrapK(uWindT,uCyc,aTrap.x);float th=aTrap.z*k;float c=cos(th),s=sin(th);transformed=vec3(position.x*c,position.y+abs(position.x)*s,position.z);}'
  :'{float k=ktrapK(uWindT,uCyc,aTrap.x);float th=aTrap.y*mix(aTrap.z,0.05,k);float c=cos(th),s=sin(th);transformed=vec3(position.x,position.y*c-position.z*s,position.y*s+position.z*c);}';
 const hooked=!!base;
 mat.onBeforeCompile=sh=>{sh.uniforms.uCyc=U;if(!hooked)sh.uniforms.uWindT=BIO.WIND.t;
  sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nattribute vec4 aTrap;\nuniform vec4 uCyc;\nuniform float uWindT;\n'+KTRAPS.GLSL)
   .replace('#include <begin_vertex>','vec3 transformed=vec3(position);\n'+xf);
  if(base)base(sh);
  sh.vertexShader=sh.vertexShader.replace(/uniform float uWindT;\n(?=[\s\S]*uniform float uWindT;)/,'');};
 if(!mat.userData.bio)mat.userData.bio={kind:'solid'};mat.userData.bio.trap=trap.kind;
 const ck='kotrap|'+BIO.kitKey(kind)+'|'+(mat.userData.bio.key||kind);mat.customProgramCacheKey=function(){return ck;};}
trapHook(M.jaw,KORONA.TRAPS.beartrap,'hinge');
trapHook(M.star,KORONA.TRAPS.groundstar,'fold');
trapHook(M.giantpad,KORONA.TRAPS.trappad,'fold');
M.thorn=BIO.solidMat(null);trapHook(M.thorn,KORONA.TRAPS.numbthorn,'whip');
trapHook(M.petal,KORONA.TRAPS.numbthorn,'hinge');
// THE MOVING ENDS (KNOWN_ISSUES, closed 2026-10-19): the man-eater's lid is a card hinged on the back of its rim (hinge: up at
// its angle while the trap waits, dropped flat over the mouth when it shuts); the coil tendril's tip is a rod whipping about
// its base (whip: lying on along the coil while it waits, standing up when it shuts: the grab)
trapHook(M.hood,KORONA.TRAPS.maneater,'hinge');trapHook(M.tendriltip,KORONA.TRAPS.coiltendril,'whip');

[['bark.coin','Coin-tree trunks'],['bark.lacefan','Lace-fan boles (dark, fibrous)'],['pitcher','Man-eater pitchers (the waxy outside)'],['throat','Man-eater throats (hairs and fluid)'],['tendril','Coil tendrils (banded, warty)']]
 .forEach(([k,lab])=>{const m=k==='bark.coin'?M.bark.coin:k==='bark.lacefan'?M.bark.lacefan:M[k];BIO.bucket(k,m,{label:lab,uvScale:k==='pitcher'?[1.4,1.4]:k==='throat'?[1,1]:k==='tendril'?[.8,.8]:[2,3]});});
BIO.bucket('far',BIO.barkMat(null),{label:'Far trees (impostors)'});

// ---------------------------------------------------------------- instanced items: the owner's sheets by cell, two or more cells each
const cells=(name,geoFn,mat,ks,label)=>{ks.forEach((k,i)=>BIO.def(name+i,cellUV(geoFn(),CELL(k)),mat,{label}));};let ks;
cells('lace',G.tuft,M.lace,[0,4],'Lace pitchers (the summit\'s sun pitcher)');
cells('gsundew',G.fan,M.gsundew,[0,4],'Great sundew fronds');
cells('coin',G.tuft,M.coin,[1,6],'Coin-tree twigs (frosted coin leaves)');
cells('rfan',G.tuft,M.rfan,[0,2,4,6,8],'Rainbow fans (the reagent)');
cells('lacefan',G.fan,M.lacefan,[0,4],'Lace fans (a fungus-tree\'s crowns)');
cells('stormpod',G.tuft,M.stormpod,[0,4],'Storm pods');
cells('cobra',G.tuft,M.cobra,[0,4],'Cobra lilies');cells('cobrab',G.tuft,M.cobrab,[1,5],'Cobra lilies');
cells('trumpet',G.tuft,M.trumpet,[0,4],'Blood trumpets');
ks=[0,4];ks.forEach((k,i)=>BIO.def('star'+i,cellUV(G.pad(),CELL(k)),M.star,{attrs:['aTrap'],label:'Ground stars (a trap flat on the peat)'}));
cells('lure',G.tuft,M.lure,[0,4],'Lures (false flowers over the traps)');
cells('bulb',G.tuft,M.bulb,[0,4],'Blood bulbs (the sticky moor)');
BIO.def('snare',cellUV(G.tuft(),CELL(4)),M.snare,{label:'Snare flowers'});
BIO.def('pad',G.pad(),M.giantpad,{attrs:['aTrap'],label:'Trap pads (on the sucking pools)'});
BIO.def('staghorn',G.fan(),M.staghorn,{label:'Staghorn ferns (on the wet wall)'});
BIO.def('cairn',new T3.IcosahedronGeometry(1,0),M.solid,{label:'Cairns (the safe path)'});
BIO.def('jaw',cellUV(G.lobe(),CELL(4)),M.jaw,{attrs:['aTrap'],label:'Bear-trap jaws'});
BIO.def('lid',G.pad(),M.lid,{label:'Punji-pit lids (dead leaves flush with the floor)'});
BIO.def('mouth',G.pad(),M.solid,{label:'Maws (a punji pit\'s open mouth, a trap pad\'s middle)'});
BIO.def('spike',BIO.geo.rod(4),M.solid,{label:'Spikes and teeth'});
{const g=BIO.geo.rod(4);g.translate(0,.5,0);BIO.def('thorn',g,M.thorn,{attrs:['aTrap'],label:'Numb thorns (they whip)'});}
{const g=G.pad();g.translate(0,0,.5);BIO.def('hood',g,M.hood,{attrs:['aTrap'],label:'Man-eater lids (hinged on the rim: they drop)'});}
{const g=BIO.geo.rod(6);g.translate(0,.5,0);BIO.def('tendriltip',g,M.tendriltip,{attrs:['aTrap'],label:'Coil-tendril tips (they whip up)'});}
BIO.def('petal',cellUV(G.lobe(),CELL(4)),M.petal,{attrs:['aTrap'],label:'Lash-flower petals (they fold over the throat)'});
BIO.def('stalk',BIO.geo.rod(5),M.solid,{label:'Stalks and stems'});
})();
