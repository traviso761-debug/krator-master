// ================================================================= SEOW — species (data + kit items): the cordillera's own plants
// The plan's borrowings (PLAN.md sections 4 and 7.3), drawn on the material library's cards, beside the NW outer wall's flora read in
// place (its larch, pines, shrubs and herbs). Where an Earth plant is the model it is named, so the drawing can be checked against it.
//   PUYA (Puya raimondii of the Andean puna; wouterwall's "puya spikes"): a rosette of saw-edged silver-blue leaves, and after decades
//     a spike of 4-9 m that flowers once and dies, standing dead for years: on the sunny slopes, the scree, the col's edges
//   RED GUYED STALK (Krator's own, biomes/godstep): a red fan-crowned stalk held up by its guy-roots in the wet seep gravel: by the
//     brooks, on the fans' live channels, on the tarns' strands (section 4, Oasis 1)
//   SKY POPPY and GOLD POPPY (Meconopsis; the high Andes' and Himalaya's poppies; oidong's sky poppies): blue-violet and golden on
//     the moraines' turf, the col and the puna after the melt, seed capsules by autumn, gone in winter
//   GOLDROOT (Rhodiola rosea, the thin-air stamina herb: section 4): fleshy rosettes in the scree under the crags
// Everything here is DATA and kit definitions; no placement (60). Tags follow the project rule (climate / aridity / abyssal / riparian /
// koppen) plus `zone` (46) and the harvest.
BIO.kit('seouterwall');   // this kit's own registry of items and buckets (core/biome: kits)
(function(){const {TAU,rr,ri}=BIO.fn;
const T3=BIO.host.THREE,C=h=>new T3.Color(h);SEOW.C=C;
const SEASON_K=typeof SEASON==='string'?SEASON:'autumn';SEOW.season=SEASON_K;
const K=(climate,aridity,riparian,koppen,zone)=>({climate,aridity,abyssal:false,riparian,koppen,zone});
const HV=(wood,edible,medicinal,notes,crop)=>({wood,edible:edible||[],medicinal:!!medicinal,notes:notes||'',crop:crop||null});
const PK=(name,tags,hv,items,extra)=>({name,tags:Object.assign(tags,{harvest:hv},extra||{}),items});
SEOW.PLANTS={
 puya:PK('Puya (the cordillera\'s giant bromeliad)',K('cold','semiarid','no',['Dsc','ET'],'puna'),
  HV('the dead spike (firewood where nothing else burns)',[],false,'Puya raimondii of the puna: a rosette of saw-edged silver-blue leaves a man\'s height across; after decades a spike of 4-9 m and thousands of flowers, then it dies and the spike stands for years. A few to a hillside, on the sunny slopes and the scree.'),['puya','puyaspike']),
 guyedstalk:PK('Red guyed stalk',K('cold','semiarid','yes',['Dsc','BSk'],'floor'),
  HV('none',[],false,'Krator\'s own (biomes/godstep): a red fan-crowned stalk held up by its guy-roots in the wet seep gravel by the brooks, on the fans and the tarns\' strands.'),['guyedstalk']),
 skypoppy:PK('Sky poppy',K('cold','semiarid','no',['Dsc','ET'],'moraine'),
  HV('none',[],false,'Meconopsis: nodding blue-violet poppies on the moraines\' turf and the col after the melt; seed capsules by autumn.'),['skypoppy']),
 goldpoppy:PK('Gold poppy',K('cold','semiarid','no',['Dsc','ET'],'puna'),
  HV('none',[],false,'Golden alpine poppies on the puna\'s gravel and the moraines in the short summer.'),['goldpoppy']),
 goldroot:PK('Goldroot',K('polar','arid','no',['ET','Dsc'],'scree'),
  HV('none',['the root (dried: smells of roses)'],true,'Roseroot (Rhodiola rosea), the thin-air stamina herb (PLAN.md section 4): fleshy rosettes in the scree under the crags.','goldroot'),['goldroot'],{crop:'goldroot'})};
SEOW.plantOfItem=item=>{for(const k in SEOW.PLANTS)if(SEOW.PLANTS[k].items.indexOf(item)>=0)return SEOW.PLANTS[k];return null;};
// the season's flowers: in bloom after the melt (spring, summer), seed capsules in autumn, nothing in winter (the counts: 60)
SEOW.BLOOM={spring:.8,summer:1,autumn:.3,winter:0}[SEASON_K];

// ---------------------------------------------------------------- textures (procedural, greyscale: the fallback when the page carries no
// library pack; the library's cards take their place: BIO.libSwap, materials.json's slots)
const TX={};
/* a rosette of strap leaves from the cell's foot (the puya, the goldroot) */
TX.rosette=BIO.alphaTex(128,(g,S)=>{g.lineCap='round';for(let k=0;k<34;k++){const a=Math.PI*(.06+.88*k/33),L=S*rr(.35,.5);
  g.strokeStyle='rgb('+ri(150,230)+','+ri(150,230)+','+ri(150,230)+')';g.lineWidth=rr(2,4);g.beginPath();g.moveTo(S/2,S*.98);g.lineTo(S/2-Math.cos(a)*L,S*.98-Math.sin(a)*L);g.stroke();}},[150,160,150]);
/* a spike over its rosette (the puya in flower) */
TX.spike=BIO.alphaTex(128,(g,S)=>{g.fillStyle='rgb(200,205,170)';g.fillRect(S*.42,S*.04,S*.16,S*.78);for(let k=0;k<20;k++){const a=Math.PI*(.06+.88*k/19),L=S*rr(.15,.25);
  g.strokeStyle='rgb(180,190,180)';g.lineWidth=3;g.beginPath();g.moveTo(S/2,S*.98);g.lineTo(S/2-Math.cos(a)*L,S*.98-Math.sin(a)*L);g.stroke();}},[170,175,150]);
/* a stalk under a fan (the guyed stalk) */
TX.stalk=BIO.alphaTex(128,(g,S)=>{g.fillStyle='rgb(200,90,60)';g.fillRect(S*.47,S*.25,S*.06,S*.75);g.beginPath();g.moveTo(S/2,S*.3);g.arc(S/2,S*.3,S*.28,Math.PI*1.1,Math.PI*1.9);g.closePath();g.fill();},[200,90,60]);
/* a few flowers on stems (the poppies) */
TX.bloom=BIO.alphaTex(128,(g,S)=>{for(let k=0;k<7;k++){const x=S*rr(.2,.8),y=S*rr(.15,.5);g.strokeStyle='rgb(120,150,110)';g.lineWidth=2;g.beginPath();g.moveTo(x,y);g.lineTo(S/2+rr(-6,6),S);g.stroke();
  g.fillStyle='rgb(235,235,235)';g.beginPath();g.arc(x,y,S*rr(.05,.08),0,TAU);g.fill();}},[200,200,200]);
SEOW.TX=TX;

// ---------------------------------------------------------------- materials (the library's cards swap in: materials.json names each slot)
const leaf=(tex,key,o)=>BIO.leafMat(tex,key,Object.assign({swayW:'(position.y)',swayA:.04,alphaTest:.4},o||{}));
const M=SEOW.MAT={
 puya:leaf(TX.rosette,'puya',{swayA:.01}),puyaspike:leaf(TX.spike,'puyaspike',{swayA:.012}),
 guyedstalk:leaf(TX.stalk,'guyedstalk',{swayA:.05}),
 skypoppy:leaf(TX.bloom,'skypoppy',{swayA:.07}),goldpoppy:leaf(TX.bloom,'goldpoppy',{swayA:.07}),
 goldroot:leaf(TX.rosette,'goldroot',{swayA:.01})};
SEOW.LIB=BIO.libSwap('seouterwall',M);
// a full-colour card carries its own colour: its instances take a near-white, a sixth of the procedural colour kept (nwouterwall's rule)
const LIBWHITE=C(0xf4f2ec);
const FULL=slot=>{if(!SEOW.LIB[slot]||typeof KMAT==='undefined'||!KMAT.packed)return false;const L=KMAT.packed('seouterwall',slot);return !!(L&&L.tint&&L.tint.keep>=.99);};
SEOW.libCol=(slot,c)=>FULL(slot)?LIBWHITE.clone().lerp(c&&c.isColor?c:C(c),.16):(c&&c.isColor?c:C(c));

// ---------------------------------------------------------------- instanced items (the NW outer wall's upright card, read in place)
const tuft=sunk=>NWOW.G.tuft(sunk);
BIO.def('puya',tuft(.04),M.puya,{label:'Puya rosettes (silver-blue, saw-edged)'});
BIO.def('puyaspike',tuft(.02),M.puyaspike,{label:'Puya in flower (a 4-9 m spike over its rosette; dead spikes stand for years)'});
BIO.def('guyedstalk',tuft(.05),M.guyedstalk,{label:'Red guyed stalks (in the wet seep gravel)'});
BIO.def('skypoppy',tuft(.05),M.skypoppy,{label:'Sky poppies ('+(SEASON_K==='autumn'?'their seed capsules, a last few flowers':SEASON_K==='winter'?'none in winter':'in flower after the melt')+')'});
BIO.def('goldpoppy',tuft(.05),M.goldpoppy,{label:'Gold poppies'});
BIO.def('goldroot',tuft(.45),M.goldroot,{label:'Goldroot (roseroot in the scree)'});   /* sunk to the rosette's foot: the card's root stays in the ground */
})();
