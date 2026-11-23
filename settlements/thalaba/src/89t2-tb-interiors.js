// ================================================================= THALABA — the interior set of the town's own pieces and the mission's
// The rooms of Thalaba's own pieces (src/89t1-tb-pieces.js) and of the Dalab mission's healers' hall, as a kits/interiors set
// (IX.sets.add; sets/README.md says how an item is written), registered on the page beside the Xanadu set, so that with
// ?interiors=1 (settlements/xanadu/src/89y-xa-interiors.js) their wall blocks are drawn hollow and their rooms planned and
// furnished as the Xanadu kit's are. Local frame = the builder's: origin at the plot centre on the ground, +z the front.
// The room kinds are kits/interiors' own (src/30-programs.js): the Devisers' counting room is a shop (its counter), the clerks'
// rooms a study, the strongroom a store; a counting room, a strongroom or an infirmary of their own would be new kinds there.
// The furniture: the Xanadu culture for Thalaba's pieces; the mission's hall the generic culture, since the page's catalog
// bundle (Xanadu's 69d: xanadu, iziz, generic, scrap) carries no Dalab culture file. Starts here, as the pieces do; it goes into
// kits/interiors/sets/ with them once they go upstream (KNOWN_ISSUES.md). [G data]
(function(IX){if(!IX||!IX.sets||IX.sets.byName.thalaba)return;
 const rect=IX.sets.shape.rect,r3=v=>Math.round(v*1000)/1000;
 // the kit's batter (kits/xanadu 72-xa-helpers.js xnBatterK, as kits/interiors/sets/xanadu.js reads it): a battered block's top
 // is k times its base, and its storeys are planned INSET on that top (kits/iziz-vernacular 69e6)
 const batK=(w,h,d)=>{const want=1-2*h*.088/Math.min(w,d);return want>.94?.96:want>.89?.92:want>.83?.86:.8;};
 // the Devisers' hall (buildTbDevisers: one battered block 28 x 8.4 x 12 at z -13, two storeys of 4.4 and 4.0 on a 0.6 m footing)
 const hk=batK(28,8.4,12),hz=-13,hw=r3(28*hk),hd=r3(12*hk);
 IX.sets.add({set:'thalaba',title:'Thalaba: the town\'s own pieces and the Dalab mission',culture:'xanadu',items:[
  {key:'tb_devisers',name:'The Rare Devisers\' house',culture:'xanadu',wealth:.8,types:['market/shop','industry'],residence:false,lot:[52,42],
   bodies:[
    {id:'hall',poly:rect(hw,hd,0,hz),y:.6,levels:[{h:4.4},{h:4.0}],wall:.45,roof:'flat',inset:true,
     doors:[{at:[0,r3(hz+hd/2)],w:2.4}],program:[['shop','study','store'],['study','library','bedroom','bedroom']]},
    {id:'strongroom',poly:rect(9,8,19,-15),y:0,levels:[{h:5.6}],wall:.6,roof:'flat',windows:false,
     doors:[{at:[19,-11],w:1.6}],program:['store']}],
   note:'the counting room (a shop: the counter where the expeditions are paid and the Sultan\'s share counted out), the clerks\' rooms and the factor\'s over it; the strongroom of the rarities, no window; the sulfur shed and the wax store are open-fronted'},
  {key:'tb_watchhouse',name:'The road warden\'s watch house',culture:'xanadu',wealth:.65,types:['civic'],residence:false,lot:[14,14],
   bodies:[{id:'house',poly:rect(9,7,0,0),y:.5,levels:[{h:2.9},{h:2.7}],wall:.4,roof:'flat',
    doors:[{at:[0,3.5],w:1.4}],program:[['guard','store'],['bedroom','bedroom']]}],
   note:'the guard room below, the warden\'s and his men\'s rooms over it, behind the gallery'},
  {key:'tb_calcarone',name:'Calcarone (a sulfur kiln)',types:['industry'],skip:'an open kiln: a ring wall round its charge'},
  // the Dalab mission (the Dalab set's pieces, settlements/dalab/src, read in place): the healers' hall is one plain block
  // (vB 20 x 4.4 x 9 on a 0.6 m platform); the granaries and the family compound are round huts drawn by the Dalab helpers
  // (dnGranary, dnRoundHouse), which the hollow wrap does not reach, so they stay solid
  {key:'dalab_healers',name:'The Dalab mission: the genepriests\' house (the healers\' hall)',culture:'generic',wealth:.65,types:['civic','religious'],residence:false,lot:[36,28],
   bodies:[{id:'hall',poly:rect(20,9,0,0),y:.6,levels:[{h:4.4}],wall:.45,roof:'flat',
    doors:[{at:[0,4.5],w:1.8}],program:[['hall','study','store']]}],
   note:'the sick room (the hall), the genepriests\' study, the seed and specimen store; the dispensary drum stays solid'},
  {key:'dalab_granaries',name:'The Dalab mission: the seed and specimen stores',types:['farm','infrastructure'],skip:'round granaries drawn by the Dalab helpers (dnGranary): no hollow wrap'},
  {key:'dalab_compound',name:'The Dalab mission: the lodging for the hired men',types:['multi-family dwelling'],skip:'round houses drawn by the Dalab helpers (dnRoundHouse): no hollow wrap'}]});
})(typeof KratorInteriors!=='undefined'?KratorInteriors:null);
