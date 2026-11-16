// ================================================================= SAVANNARIM — the e rim's cousins (PLAN-LANDS.md section 5.1; J5, 2026-11-08)
// "The old lines": the eastern abyss's Palaeozoic lineages come down to the monsoon savannah as fire-hardened relics, and the e
// highlands' pull toward the giant shows in the rim's own species, fading from east to west. Every one a cousin (BIO.kin, core/biome 32):
// the source kit's own builder, read in place (build.py NEIGH: a station names eastabyss and ehighlands; the e highlands' registry is
// 'ehigh', so its cousins are 'ehigh.<key>'), with the row's change. Records
// here at load (appended to SAVRIM.SPECIES: indices never reused); the kin objects only when a page asks (SAVRIM.LANDS.east.cousins(),
// null for a source not on the page), so station 1 and the north build nothing of them.
//   firescale     eastabyss.sigillaria: an unbranched pole 25-45 m, one tuft of grass-leaves, the corky bark charred on the fire's side
//   monsooncycad  eastabyss.cycad: 5-10 m, the stands flushing bright green out of the char together after a burn (sago, leached)
//   dambotail     eastabyss.horsetail: 8-15 m, jointed, in whorls, in the dambos (scouring rush)
//   emberspike    ehighlands.vigil: a woody spike 6-12 m; whole stands flower together after the dry-season burn, leaning to the giant
//   monsoonrag    ehighlands.ragbark: 30-50 m, deciduous in the dry season, ragged peeling bark, its crown combed toward the giant
//   bolster       ehighlands.cushion: a low cushion on the ironstone pavements, emerald in the rains, fire-orange and dry in the dry
//   glasswand     ehighlands.glasstower (optional; taken as proposed): a small translucent cousin of the glass tower on the pavements,
//                 the same moth and the same pallidine: Fridon's wormwick trade (proposed)
SAVRIM.LANDS=SAVRIM.LANDS||{};
{const HV=SAVRIM.HV,T=o=>Object.assign({},SAVRIM.TAGS,{land:'east'},o);
 const R=[
  {key:'firescale',name:'Fire scale-tree',from:'eastabyss.sigillaria',kind:'tree',tags:T({fire:'resister',koppen:['Aw','Am'],harvest:HV('cork (the corky bark)',[],false,'The abyss\'s seal-tree come down to the fire savannah: its leaf-cushion bark thick, corky and charred black on the side the fires come from.'),earth:'Sigillaria; the corky bark of fire-savannah trees'})},
  {key:'monsooncycad',name:'Monsoon cycad',from:'eastabyss.cycad',kind:'tree',tags:T({fire:'resprouter',koppen:['Aw','Am'],harvest:HV('none',['sago (toxic until leached for a week, like the abyss\'s salt-cone kernels)'],false,'After every fire the stands flush bright green out of the char together.'),earth:'Cycas armstrongii (Kakadu)'})},
  {key:'dambotail',name:'Dambo horsetail',from:'eastabyss.horsetail',kind:'tree',tags:T({riparian:'yes',koppen:['Aw','Am'],harvest:HV('scouring rush (an abrasive)',[],false,'A jointed horsetail in whorls, 8-15 m, in the dambos.'),earth:'Calamites; scouring rush'})},
  {key:'emberspike',name:'Ember spike',from:'ehigh.vigil',kind:'tree',tags:T({fire:'pyrophyte',koppen:['Aw','Am'],harvest:HV('none',['nectar (drunk from the spike)'],false,'Whole stands flower together after the dry-season burn, leaning toward the giant.'),earth:'Xanthorrhoea (grass-trees), which flower after fire'})},
  {key:'monsoonrag',name:'Monsoon ragbark',from:'ehigh.ragbark',kind:'tree',tags:T({koppen:['Aw','Am'],pheno:'deciduous',harvest:HV('timber, bark cloth',[],false,'Drops its leaves in the dry season; its crown fans out toward the giant, so a stand reads as combed toward the north-east.'),earth:'the miombo trees that drop their leaves in the dry season'})},
  {key:'bolster',name:'Bolster',from:'ehigh.cushion',kind:'cushion',tags:T({koppen:['Aw'],harvest:HV('none',[],false,'A low cushion on the ironstone and the rock pavements: emerald in the rains, fire-orange and dry in the dry season.'),earth:'Borya, the resurrection plant of Australian granite'})},
  {key:'glasswand',name:'Glass wand',from:'ehigh.glasstower',kind:'rosette',optional:true,tags:T({koppen:['Aw'],harvest:HV('none',['wormwick (proposed: the pallidine tonic of the moth larvae at its roots)'],true,'A small translucent-stemmed cousin of the glass tower on the pavements, carrying the same moth and the same pallidine: the source of Fridon\'s wormwick trade (proposed).'),earth:'none (the e highlands\' glass tower)'})}];
 R.forEach(S=>{if(!SAVRIM.byKey[S.key]){SAVRIM.SPECIES.push(S);SAVRIM.byKey[S.key]=S;}});
 const L=SAVRIM.LANDS.east={land:'east',keys:R.map(S=>S.key),_k:null};
 // the cousins (lazy): each a BIO.kin of its source, or null where the source kit is not on the page. The size and habit of each row;
 // the lean (an ehighlands record's own `lean`, radians to the giant) is set per plant by the host (the pull fading west)
 L.cousins=function(){if(L._k)return L._k;const K=L._k={},kin=(from,d)=>BIO.kin&&BIO.kitBuilder(from.split('.')[0],from.split('.')[1])?BIO.kin(from,d):null;
  K.firescale=kin('eastabyss.sigillaria',{key:'firescale',name:'Fire scale-tree',scale:{H:1.3,rb:1.2,crownR:1.1},tags:SAVRIM.byKey.firescale.tags,
   colour:{bark:[0x3a3a30,0x2e2e26,0x4a4a3c]},habit:{crown:{lift:.1,n:2.2,size:1.3,el:[-.75,1.1],clear:false,skirt:1.6}}});
  K.monsooncycad=kin('eastabyss.cycad',{key:'monsooncycad',name:'Monsoon cycad',scale:1.0,tags:SAVRIM.byKey.monsooncycad.tags});
  K.dambotail=kin('eastabyss.horsetail',{key:'dambotail',name:'Dambo horsetail',scale:{H:.48,rb:.6,crownR:.6},tags:SAVRIM.byKey.dambotail.tags});
  K.emberspike=kin('ehigh.vigil',{key:'emberspike',name:'Ember spike',scale:{H:.72,rb:1.1,crownR:.9},tags:SAVRIM.byKey.emberspike.tags,habit:{lean:.3,far:null}});
  K.monsoonrag=kin('ehigh.ragbark',{key:'monsoonrag',name:'Monsoon ragbark',scale:{H:5,rb:4.5,crownR:3.4},tags:SAVRIM.byKey.monsoonrag.tags,habit:{lean:.3}});
  K.bolster=kin('ehigh.cushion',{key:'bolster',name:'Bolster',scale:{H:.7,rb:1,crownR:.6},tags:SAVRIM.byKey.bolster.tags,habit:{lean:.2,far:null}});
  K.glasswand=kin('ehigh.glasstower',{key:'glasswand',name:'Glass wand',scale:{H:.7,rb:.6,crownR:.7},tags:SAVRIM.byKey.glasswand.tags,habit:{lean:.15,far:null}});
  return K;};}
