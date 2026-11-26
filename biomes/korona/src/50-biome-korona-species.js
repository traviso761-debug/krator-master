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
/* THE HAZARDS (core/hazard, 2026-10-26): every trap of danger .3 and over is a hazard record too (57's reg writes
   tags.hazard beside tags.trap): its kind here, its danger the trap's, its state the trap's own clock (KTRAPS.state on
   the kit's id, the one its shader hashes) or, for the punji pit, its membrane's (KORONA.pitState); the rest a grab */
KORONA.HAZARDS={punjipit:{kind:'pit',stateFn:'KORONA.pitState',trigger:{by:'weight',mass:20,reset:480}},numbthorn:{kind:'poison'},
 bladderpool:{kind:'drown',effect:'hold'},maneater:{kind:'grab'},coiltendril:{kind:'grab'},groundstar:{kind:'grab'},trappad:{kind:'grab'},
 snareflower:{kind:'grab'},beartrap:{kind:'grab',effect:'bleed'}};
KORONA.hazardOf=function(key,tr,id){if(!(tr&&tr.danger>=.3))return null;
 return Object.assign({kind:'grab',danger:tr.danger,stateFn:'KTRAPS.state',seed:id},KORONA.HAZARDS[key]);};

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
 punjipit:PK('Punji pit','hypertropic','humid','yes',['Af','XA'],'floor',['pitmem','pitbody','pitmask'],HV('none',[],false,'A pitcher that lives under the ground: only its waxy lip shows at grade, and over its mouth a thin membrane it covers with dead leaves. A person who steps on it tears through onto spikes of bone-hard leaf and into the fluid below; the torn flaps hang into the pit, and the membrane grows back over the mouth in minutes. Danger 1.'),'punjipit'),
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

// ---------------------------------------------------------------- THE PUNJI PIT: a buried pitcher with a membrane that tears and regrows
// The owner, 2026-10-26: "a buried pitcher plant with a tear-through membrane that slowly regrows after a meal". A flask
// sunk in the ground (its pool and its bone-hard spikes inside), a waxy ribbed peristome at grade, and over the mouth a
// thin membrane disguised with ONE litter cell of the card sheet (KNOWN_ISSUES, closed 2026-10-26: the lid showed the
// whole sheet). Something falls through: the membrane tears into four ragged flaps that hang into the pit; then the flaps
// lift and the tear closes over minutes of world time, pale fresh tissue on the seams until the litter settles back.
// THE STATE IS DATA (Godot): KORONA.MEMBRANE is the cycle (world seconds); KORONA.pitState(rec,t) the state at world time t
// (pure; KORONA.PIT_GLSL is the same arithmetic in the shader, on the motion clock BIO.WIND.t, so the speed buttons, pause
// and ?t= drive it); each pit's record (KORONA.PITS; tags.trap.membrane on its core/tags volume) carries its phase (a hash
// of its id: KTRAPS.phase, core/rand), its seed (the tear's shape), its hang and its litter cell.
// THREE INSTANCED DRAWS for all the pits of a page: the MOUTH MASK (renderOrder 20: no colour, no depth; it writes the
// stencil where the mouth is seen), the BODY (21: the flask's inside, drawn only inside the stencil and over what the
// ground drew there: the hole in the ground), the MEMBRANE and its peristome (22: depth-tested against the body).
// KORONA.afterBake sets the orders (89z-host-build.js calls it after BIO.bake).
KORONA.MEMBRANE={whole:720,tear:.6,torn:120,regrow:360};
const sstep=(a,b,x)=>{x=clamp((x-a)/(b-a),0,1);return x*x*(3-2*x);};
/* on the one clock (KTRAPS.cycle, core/biome/37-core-traps.js): the same arithmetic as before it, so the pits do not move */
KORONA.pitState=function(p,t){const c=KORONA.MEMBRANE,L=c.whole+c.tear+c.torn+c.regrow;
 const C=KTRAPS.cycle([['whole',c.whole,0,0],['tearing',c.tear,0,1],['torn',c.torn,1,1],['regrowing',c.regrow,0,1]],t,(p.phase||0)*L),u=C.u;
 if(C.state==='whole')return {state:'whole',hang:0,gap:0,scar:1-sstep(0,c.whole*.3,u)};
 if(C.state==='tearing'){const k=C.k;return {state:'tearing',hang:k,gap:k,scar:1};}
 if(C.state==='torn')return {state:'torn',hang:1,gap:1,scar:1};
 const q=C.k;return {state:'regrowing',hang:1-sstep(0,.35,q),gap:1-sstep(.2,1,q),scar:1,progress:q};};
/* the pit's hazard: always a pit (k 1), hidden while its membrane is whole; and the page's trap speed for the hazards' clock */
if(typeof KHAZ!=='undefined'){KHAZ.STATES['KORONA.pitState']=function(rec,h,t){const m=rec.tags&&rec.tags.trap&&rec.tags.trap.membrane,s=KORONA.pitState(m||{},t);
 return {state:s.state,k:1,on:true,hidden:s.state==='whole'};};KHAZ.speed=KORONA.SPEED;}
KORONA.PIT_GLSL=['float kpitH(float p){p=fract(p*.1031);p*=p+33.33;p*=p+p;return fract(p);}',
 'float kpitN(float x){float i=floor(x),f=fract(x);f=f*f*(3.0-2.0*f);return mix(kpitH(i),kpitH(i+1.0),f);}',
 'vec3 kpitState(float t,vec4 c,float ph){float L=c.x+c.y+c.z+c.w;float u=mod(t+ph*L,L);',
 ' if(u<c.x)return vec3(0.0,0.0,1.0-smoothstep(0.0,c.x*0.3,u));u-=c.x;',
 ' if(u<c.y){float k=u/c.y;return vec3(k,k,1.0);}u-=c.y;',
 ' if(u<c.z)return vec3(1.0);u-=c.z;',
 ' float q=u/c.w;return vec3(1.0-smoothstep(0.0,0.35,q),1.0-smoothstep(0.2,1.0,q),1.0);}'].join('\n');
const PITU={uPitCyc:{value:new T3.Vector4(KORONA.MEMBRANE.whole,KORONA.MEMBRANE.tear,KORONA.MEMBRANE.torn,KORONA.MEMBRANE.regrow)},uPitForce:{value:new T3.Vector4(0,0,0,0)}};
/* a review aid: every pit held in one state ('whole', 'torn', 'regrowing', or [hang, gap, scar]); null hands them back to the clock */
KORONA.pitForce=function(s){const F={whole:[0,0,0],tearing:[.5,.5,1],torn:[1,1,1],regrowing:[.12,.45,1]},v=s==null?null:Array.isArray(s)?s:F[s];
 if(v)PITU.uPitForce.value.set(1,v[0],v[1],v[2]);else PITU.uPitForce.value.set(0,0,0,0);return v?s:'clock';};
// geometry: a triangle faces the way its vertices' normals say (the body is drawn front faces only, from inside)
function pitGeo(P,N,U,Cc,I){for(let t=0;t<I.length;t+=3){const a=I[t]*3,b=I[t+1]*3,c=I[t+2]*3,ux=P[b]-P[a],uy=P[b+1]-P[a+1],uz=P[b+2]-P[a+2],vx=P[c]-P[a],vy=P[c+1]-P[a+1],vz=P[c+2]-P[a+2];
  const cx=uy*vz-uz*vy,cy=uz*vx-ux*vz,cz=ux*vy-uy*vx,nx=N[a]+N[b]+N[c],ny=N[a+1]+N[b+1]+N[c+1],nz=N[a+2]+N[b+2]+N[c+2];
  if(cx*nx+cy*ny+cz*nz<0){const s=I[t+1];I[t+1]=I[t+2];I[t+2]=s;}}
 const g=new T3.BufferGeometry();g.setAttribute('position',new T3.Float32BufferAttribute(P,3));g.setAttribute('normal',new T3.Float32BufferAttribute(N,3));
 g.setAttribute('uv',new T3.Float32BufferAttribute(U,2));g.setAttribute('color',new T3.Float32BufferAttribute(Cc,3));g.setIndex(I);return g;}
/* the membrane (unit mouth radius): four flaps of three columns by five rings, each flap its own vertices so a tear runs
   between them; the vertex colour is data, not colour (r: the flap, -1 on the peristome; g: across the flap, 0..1); the
   uv is planar, one litter cell spread over the mouth (the shader picks the cell) */
function pitMembraneGeo(){const P=[],N=[],U=[],Cc=[],I=[],RING=[0,.32,.6,.82,.93,1],NF=4,NC=3,Y=.04;
 const v=(x,y,z,f,w)=>{P.push(x,y,z);N.push(0,1,0);U.push(.5+.37*x,.5+.37*z);Cc.push(f,w,0);return P.length/3-1;};
 for(let f=0;f<NF;f++){const a0=f*TAU/NF,da=TAU/NF/NC,ac=a0+TAU/NF/2,tip=v(Math.cos(ac)*.002,Y,Math.sin(ac)*.002,f,.5);let prev=null;
  for(let b=1;b<RING.length;b++){const row=[];for(let c=0;c<=NC;c++){const a=a0+c*da;row.push(v(Math.cos(a)*RING[b],Y,Math.sin(a)*RING[b],f,c/NC));}
   if(b===1)for(let c=0;c<NC;c++)I.push(tip,row[c],row[c+1]);else for(let c=0;c<NC;c++)I.push(prev[c],row[c],row[c+1],prev[c],row[c+1],prev[c+1]);
   prev=row;}}
 const PR=[[.97,.05],[1.06,.095],[1.17,.075],[1.3,-.05]],NS=12;let prev=null;   /* the peristome: up over the membrane's edge, its outer edge under the litter */
 for(const [r,y] of PR){const row=[];for(let s=0;s<=NS;s++){const a=s*TAU/NS;row.push(v(Math.cos(a)*r,y,Math.sin(a)*r,-1,0));}
  if(prev)for(let s=0;s<NS;s++)I.push(prev[s],row[s],row[s+1],prev[s],row[s+1],prev[s+1]);prev=row;}
 return pitGeo(P,N,U,Cc,I);}
/* the body: the flask's inside from the lip down to the pool (normals inward; drawn deep first, then the pool, then the
   spikes, since it draws over whatever is there), darkening with depth (vertex colour) */
function pitBodyGeo(){const P=[],N=[],U=[],Cc=[],I=[],PROF=[[1,.06],[.95,0],[.88,-.25],[1.02,-.65],[1.3,-1.15],[1.37,-1.55]],NS=10,FL=-1.55;
 const dk=y=>1-.8*sstep(0,1.4,-y),v=(x,y,z,nx,ny,nz,u,w,c)=>{P.push(x,y,z);N.push(nx,ny,nz);U.push(u,w);Cc.push(c[0],c[1],c[2]);return P.length/3-1;};
 const rows=PROF.map(([r,y],k)=>{const p0=PROF[Math.max(0,k-1)],p1=PROF[Math.min(PROF.length-1,k+1)],dr=p1[0]-p0[0],dy=p1[1]-p0[1],L=Math.hypot(dr,dy)||1,ir=dy/L,iy=-dr/L,d=dk(y),row=[];
  for(let s=0;s<=NS;s++){const a=s*TAU/NS,ca=Math.cos(a),sa=Math.sin(a);row.push(v(ca*r,y,sa*r,ca*ir,iy,sa*ir,s/NS*2,-y*.8,[d,d*.96,d*.86]));}return row;});
 for(let k=rows.length-2;k>=0;k--){const A=rows[k],B=rows[k+1];for(let s=0;s<NS;s++)I.push(A[s],B[s],B[s+1],A[s],B[s+1],A[s+1]);}
 /* the pool: murky amber-olive with a reddish cast (the owner, 2026-10-26: less red), on the throat map's pale band (v .9) not its red middle */
 const fc=[.1,.075,.14],c0=v(0,FL,0,0,1,0,.5,.9,fc),fr=[];for(let s=0;s<=NS;s++){const a=s*TAU/NS;fr.push(v(Math.cos(a)*1.36,FL,Math.sin(a)*1.36,0,1,0,.5,.9,fc));}
 for(let s=0;s<NS;s++)I.push(c0,fr[s],fr[s+1]);
 const spike=(b,t,w)=>{const ax=[t[0]-b[0],t[1]-b[1],t[2]-b[2]],L=Math.hypot(ax[0],ax[1],ax[2]);ax[0]/=L;ax[1]/=L;ax[2]/=L;
  const r0=Math.abs(ax[1])<.9?[0,1,0]:[1,0,0],e1=[ax[1]*r0[2]-ax[2]*r0[1],ax[2]*r0[0]-ax[0]*r0[2],ax[0]*r0[1]-ax[1]*r0[0]],l1=Math.hypot(e1[0],e1[1],e1[2]);e1[0]/=l1;e1[1]/=l1;e1[2]/=l1;
  const e2=[ax[1]*e1[2]-ax[2]*e1[1],ax[2]*e1[0]-ax[0]*e1[2],ax[0]*e1[1]-ax[1]*e1[0]],d=dk(t[1])*.9,c=[.8*d,.74*d,.6*d];
  for(let j=0;j<3;j++){const a=j*TAU/3,a2=a+TAU/3,am=a+TAU/6,n=[0,1,2].map(q=>e1[q]*Math.cos(am)+e2[q]*Math.sin(am));
   const p=aa=>[0,1,2].map(q=>b[q]+w*(e1[q]*Math.cos(aa)+e2[q]*Math.sin(aa)));
   I.push(v(...p(a),...n,.5,.5,c),v(...p(a2),...n,.5,.5,c),v(t[0],t[1],t[2],...n,.5,.5,c));}};
 for(let k=0;k<5;k++){const a=k*TAU/5+.3,ca=Math.cos(a),sa=Math.sin(a);spike([ca*1.22,-1.05,sa*1.22],[ca*.42,-.42,sa*.42],.06);}
 for(let k=0;k<3;k++){const a=k*TAU/3+1.1,ca=Math.cos(a),sa=Math.sin(a);spike([ca*.55,FL,sa*.55],[ca*.4,-.8,sa*.4],.05);}
 return pitGeo(P,N,U,Cc,I);}
function pitMaskGeo(){const P=[0,.065,0],N=[0,1,0],U=[.5,.5],Cc=[1,1,1],I=[],NS=12;
 for(let s=0;s<=NS;s++){const a=s*TAU/NS;P.push(Math.cos(a)*.97,.065,Math.sin(a)*.97);N.push(0,1,0);U.push(.5,.5);Cc.push(1,1,1);if(s)I.push(0,s,s+1);}
 return pitGeo(P,N,U,Cc,I);}
// materials (made after the library's swap: the membrane takes the litter card's map, the body the throat's)
const linC=h=>C(h).convertSRGBToLinear();
M.pitmask=new T3.MeshBasicMaterial({colorWrite:false,depthWrite:false});
Object.assign(M.pitmask,{stencilWrite:true,stencilRef:1,stencilFunc:T3.AlwaysStencilFunc,stencilFail:T3.KeepStencilOp,stencilZFail:T3.KeepStencilOp,stencilZPass:T3.ReplaceStencilOp});
M.pitmask.userData.bio={kind:'mask',key:BIO.kitKey('pitmask'),pit:'mask (a stencil: where the ground is cut)'};
M.pitbody=new T3.MeshLambertMaterial({color:0xffffff,map:M.throat.map||null,vertexColors:true,side:T3.FrontSide});
Object.assign(M.pitbody,{stencilWrite:true,stencilRef:1,stencilFunc:T3.EqualStencilFunc,stencilFail:T3.KeepStencilOp,stencilZFail:T3.KeepStencilOp,stencilZPass:T3.KeepStencilOp,depthFunc:T3.AlwaysDepth});
M.pitbody.userData.bio={kind:'bark',key:BIO.kitKey('pitbody'),pit:'body (drawn inside the mask, over the ground)'};
M.pitmem=new T3.MeshLambertMaterial({color:0xffffff,map:M.lid.map||null,side:T3.DoubleSide});
M.pitmem.userData.bio={kind:'leaf',key:BIO.kitKey('pitmem'),opts:{swayW:'0.0',swayA:0},pit:'membrane (KORONA.PIT_GLSL: aPit = phase, seed, hang, cell)'};
{const U=Object.assign({uTis:{value:linC(0x7a6a46)},uTisB:{value:linC(0x4a3c26)},uScar:{value:linC(0xc8c27a)},uPeri:{value:linC(0x9a2e24)},uPeriB:{value:linC(0x4a4220)}},PITU),ck='kopit|'+BIO.kitKey('pitmem');
 M.pitmem.onBeforeCompile=sh=>{Object.assign(sh.uniforms,U);sh.uniforms.uWindT=BIO.WIND.t;
  sh.vertexShader=sh.vertexShader.replace('#include <common>',['#include <common>','attribute vec4 aPit;','attribute vec3 color;','uniform float uWindT;','uniform vec4 uPitCyc;','uniform vec4 uPitForce;',
    'varying vec3 vPS;','varying vec3 vPL;','varying vec2 vXZ;','varying float vPD;','varying float vSeed;',KORONA.PIT_GLSL].join('\n'))
   .replace('#include <uv_vertex>','#include <uv_vertex>\n#ifdef USE_UV\nvUv=(vec2(mod(aPit.w,3.0),floor(aPit.w/3.0+0.01))+uv)/3.0;\n#endif')
   .replace('#include <beginnormal_vertex>',['vec3 _ps=uPitForce.x>0.5?uPitForce.yzw:kpitState(uWindT,uPitCyc,aPit.x);',
    'float _rho=length(position.xz);vec3 _pos=position;vec3 objectNormal=normal;float _dep=0.0;',
    'if(color.x>-0.5&&_rho<0.93){float d=0.93-_rho;float th=_ps.x*aPit.z*(0.95+0.3*kpitH(aPit.y*97.0+color.x*13.0))*(1.0+0.25*d);',
    ' vec2 dir=position.xz/max(_rho,1e-4);float rr=0.93-d*cos(th);_pos=vec3(dir.x*rr,position.y-d*sin(th),dir.y*rr);_dep=d*sin(th);',
    ' objectNormal=vec3(-sin(th)*dir.x,cos(th),-sin(th)*dir.y);}',
    'vPS=_ps;vPL=vec3(_rho,color.y,color.x);vXZ=position.xz;vPD=_dep;vSeed=aPit.y;'].join('\n'))
   .replace('#include <begin_vertex>','vec3 transformed=_pos;');
  sh.fragmentShader=sh.fragmentShader.replace('#include <common>',['#include <common>','uniform vec3 uTis;','uniform vec3 uTisB;','uniform vec3 uScar;','uniform vec3 uPeri;','uniform vec3 uPeriB;',
    'varying vec3 vPS;','varying vec3 vPL;','varying vec2 vXZ;','varying float vPD;','varying float vSeed;',KORONA.PIT_GLSL].join('\n'))
   .replace('#include <map_fragment>',['vec4 texelColor=vec4(0.45,0.38,0.26,1.0);','#ifdef USE_MAP','texelColor=mapTexelToLinear(texture2D(map,vUv));','#endif',
    'float _r=length(vXZ);vec3 _c;',
    'if(vPL.z<-0.5){float _a=atan(vXZ.y,vXZ.x);float _rib=0.74+0.26*cos(_a*44.0);',
    ' vec3 _pe=mix(uPeriB,uPeri,1.0-smoothstep(0.98,1.16,_r))*_rib;',
    /* litter flecked over the lip (the owner, 2026-10-26): a second look into the same cell, the pile's dense middle scaled onto the ring and turned, in a broken ring; the red shows in its gaps, most at the inner edge */
    ' vec2 _xr=mat2(-0.13,0.99,-0.99,-0.13)*vXZ;vec4 _t2=mapTexelToLinear(texture2D(map,(floor(vUv*3.0)+0.5+0.3*_xr/1.3)/3.0));',
    ' float _br=smoothstep(0.3,0.62,kpitN(_a*5.0+vSeed*41.0)*0.7+kpitN(_a*17.0+_r*9.0+vSeed*13.0)*0.45);',
    ' float _cv=max(smoothstep(0.3,0.6,texelColor.a)*smoothstep(1.1,1.27,_r)*0.9,smoothstep(0.35,0.6,_t2.a)*_br*mix(0.55,0.97,smoothstep(1.0,1.18,_r)));',
    ' _c=mix(_pe,mix(texelColor.rgb,_t2.rgb,step(texelColor.a,_t2.a)),_cv);}',
    'else{float _e=min(vPL.y,1.0-vPL.y);float _sd=vPL.y<0.5?0.0:1.0;',
    ' float _gw=vPS.y*(0.05+0.2*clamp(1.0-_r/0.93,0.0,1.0))*(0.55+0.9*kpitN(_r*11.0+vSeed*57.0+vPL.z*5.3+_sd*2.7));',
    ' float _ho=vPS.y*(0.16+0.12*kpitN(atan(vXZ.y,vXZ.x)*2.5+vSeed*31.0));',
    ' if(_r<0.93&&(_e<_gw||_r<_ho))discard;',
    ' float _sc=vPS.z*max(1.0-smoothstep(0.02,0.15,_e),1.0-smoothstep(0.1,0.28,_r))*step(_r,0.95);',
    ' float _li=smoothstep(0.3,0.6,texelColor.a)*(1.0-0.85*_sc);',
    ' _c=gl_FrontFacing?mix(mix(uTis,uScar,_sc),texelColor.rgb,_li):uTisB;',
    ' _c*=mix(1.0,0.35,smoothstep(0.0,0.8,vPD));}',
    'diffuseColor.rgb*=_c;diffuseColor.a=1.0;'].join('\n'));};
 M.pitmem.customProgramCacheKey=function(){return ck;};BIO._tickWind();}
KORONA.RENDER_ORDER={pitmask:20,pitbody:21,pitmem:22};
KORONA.afterBake=function(meshes){let n=0;(meshes||BIO.baked).forEach(m=>{const o=KORONA.RENDER_ORDER[(m.name||'').replace(/^biome:/,'')];if(o!=null){m.renderOrder=o;n++;}});return n;};

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
/* the punji pit's three draws (above): M.lid stays in M only to take the library's litter card for the membrane */
BIO.def('pitmask',pitMaskGeo(),M.pitmask,{label:'Punji-pit mouths (a stencil: the hole in the ground)'});
BIO.def('pitbody',pitBodyGeo(),M.pitbody,{label:'Punji-pit throats (the buried flask, its pool and spikes)'});
BIO.def('pitmem',pitMembraneGeo(),M.pitmem,{attrs:['aPit'],label:'Punji-pit membranes (litter over the mouth: they tear and regrow)'});
BIO.def('mouth',G.pad(),M.solid,{label:'Maws (a trap pad\'s middle, a throat\'s fluid)'});
BIO.def('spike',BIO.geo.rod(4),M.solid,{label:'Spikes and teeth'});
{const g=BIO.geo.rod(4);g.translate(0,.5,0);BIO.def('thorn',g,M.thorn,{attrs:['aTrap'],label:'Numb thorns (they whip)'});}
/* THE MAN-EATER'S LID (KNOWN_ISSUES, closed 2026-10-26: it was a flat card): a Nepenthes lid, a shallow dome over the mouth
   (unit disc on x, z from the hinge at z 0; y in metres, 0.22 high, its edge turned down) with the spur standing up and
   back at the hinge; 63 triangles where the card had 10. The trap hook turns it about the hinge as it turned the card */
{const pos=[],nor=[],uv=[],RG=[0,.42,.78,1],NS=12,Hd=.22,yOf=f=>Hd*(1-f*f)-(f>.9?.03:0);
 const P=(f,a)=>{const x=Math.cos(a)*.5*f,z=.5+Math.sin(a)*.5*f,g=2*Hd*f/.5,n=[Math.cos(a)*g,1,Math.sin(a)*g],l=Math.hypot(n[0],n[1],n[2]);return {p:[x,yOf(f),z],n:[n[0]/l,n[1]/l,n[2]/l],u:[.5+x,z]};};
 const tri=(...vs)=>vs.forEach(v=>{pos.push(...v.p);nor.push(...v.n);uv.push(...v.u);});
 for(let r=1;r<RG.length;r++)for(let s=0;s<NS;s++){const a0=s/NS*TAU,a1=(s+1)/NS*TAU;
  if(r===1)tri(P(0,0),P(RG[1],a1),P(RG[1],a0));else tri(P(RG[r-1],a0),P(RG[r-1],a1),P(RG[r],a1),P(RG[r-1],a0),P(RG[r],a1),P(RG[r],a0));}
 const sp=(p,n)=>({p,n,u:[.5+p[0],Math.max(0,p[2])]}),up=[0,.6,-.8];
 tri(sp([-.05,yOf(.92),.04],up),sp([.05,yOf(.92),.04],up),sp([0,.34,-.1],up),sp([-.05,yOf(.92),.04],[-1,0,0]),sp([0,yOf(.85),.1],[-1,0,0]),sp([0,.34,-.1],[-1,0,0]),
  sp([.05,yOf(.92),.04],[1,0,0]),sp([0,yOf(.85),.1],[1,0,0]),sp([0,.34,-.1],[1,0,0]));
 BIO.def('hood',BIO.geo._make(pos,nor,uv),M.hood,{attrs:['aTrap'],label:'Man-eater lids (a domed lid with its spur, hinged on the rim: they drop)'});}
{const g=BIO.geo.rod(6);g.translate(0,.5,0);BIO.def('tendriltip',g,M.tendriltip,{attrs:['aTrap'],label:'Coil-tendril tips (they whip up)'});}
BIO.def('petal',cellUV(G.lobe(),CELL(4)),M.petal,{attrs:['aTrap'],label:'Lash-flower petals (they fold over the throat)'});
BIO.def('stalk',BIO.geo.rod(5),M.solid,{label:'Stalks and stems'});
})();
