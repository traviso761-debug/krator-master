// ================================================================= OUTLAND GATE — the kit: its own species and items
// The gap's floor is an ecotone (PLAN.md section 4): at the Narrows (station 1) it is the crater side's, Earth-like riparian woods on a warm
// braided floor (Cfa). The trees are the NEIGHBOURS' SPECIES, read in place (build.py's KIN: ebadlands' Fremont cottonwood, Gambel oak and
// bigtooth maple, grown by core/biome's BIO.kin in 60); the kit's own is what no neighbour draws: the REED BEDS on the channels' lips (rods
// on BIO.fung's stalk part: no card). The Outlands' fungoid stragglers belong to the gap's southern floor (station 3), not here.
// Data and kit items; no placement (60 places them).
BIO.kit('ogate');   // this kit's own registry of items and buckets
var OGATE={};
(function(){const T3=BIO.host.THREE,FG=BIO.fung;
OGATE.C=h=>new T3.Color(h);
OGATE.TAGS={climate:'warm',aridity:'humid',abyssal:false,riparian:'both',koppen:['Cfa']};
const HV=(use,edible,notes)=>({wood:'none',use:use||'none',edible:edible||[],medicinal:false,notes:notes||'',fruit:null});
OGATE.SPECIES=[
 {key:'gatereed',name:'Gate reed',items:['reed'],how:'Tall reeds in dense beds on the channels\' lips and the braid bars\' wet edges, bending in the up-valley wind: the crater side\'s, come up the gap with the river. 2-3.5 m.',
  tags:{climate:'warm',aridity:'humid',abyssal:false,riparian:'yes',koppen:['Cfa'],lineage:'earth-like',harvest:HV('thatch, matting, cord',[],'Cut by the fort\'s people for thatch and the toll-house\'s matting.')}},
];
OGATE.byKey={};OGATE.SPECIES.forEach((S,i)=>{S.i=i;OGATE.byKey[S.key]=S;});
// the kin (60): the neighbours' rows as this page grows them (BIO.kin's records), their tags this station's
OGATE.KIN=[
 {from:'ebadlands.cottonwood',key:'gatecottonwood',name:'Gate cottonwood',scale:{H:1.1,rb:1.15,crownR:1.1},where:'the channels\' banks and the braid bars',tags:{riparian:'yes',koppen:['Cfa']}},
 {from:'ebadlands.cottonwood',key:'barcottonwood',name:'Bar cottonwood (pioneer)',scale:{H:.35,rb:.4,crownR:.45},where:'the gravel bars, young',tags:{riparian:'yes',koppen:['Cfa']}},
 {from:'ebadlands.oak',key:'gateoak',name:'Gate oak',scale:{H:1.4,rb:1.3,crownR:1.3},where:'the floor\'s dry edges and the old bars',tags:{riparian:'no',koppen:['Cfa']}},
 {from:'ebadlands.maple',key:'gatemaple',name:'Gate maple',scale:{H:1.2,rb:1.2,crownR:1.15},where:'the old flood channels\' damp swales',tags:{riparian:'both',koppen:['Cfa']}},
];
OGATE.PAL={reed:[0x7a8a4a,0x8a9452,0x6e7e44,0x9a9a62],reedDry:[0xa89a6a,0xb4a676]};
const M=OGATE.MAT={reed:BIO.barkMat(null)};
/* the reed: a rod bending toward its tip, a few sides (a bed is hundreds of them) */
BIO.def('reed',FG.stalk({r0:.07,r1:.02,bend:.12,seg:3,rings:3,seed:6121}),M.reed,{label:'Gate reeds'});
})();
