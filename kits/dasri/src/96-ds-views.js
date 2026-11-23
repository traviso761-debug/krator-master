// ================================================================= DASRI CAMERA PRESETS: Front, Back, Plan & Cliffside ([web])
// Added to VIEWS after 92-world.js's autoViews() and before 99-host-take.js.
// Strict rule (tools/check_views.py): NO apostrophe (') and NO colon (:) in any view name!
(function(){
 const rowBy=name=>ROWS.find(r=>r.family===name)||ROWS[0]||{z:0,w:60,d:16,h:18};
 const rTow=rowBy('Jabal urban tower houses');
 const rSouq=rowBy('Jabal urban souq and trades');
 const rCiv=rowBy('Jabal civic and landmarks');
 const rVilH=rowBy('Dasri village houses and compounds');
 const rVilW=rowBy('Dasri village works and oasis qasr');

 Object.assign(VIEWS,{
  'Opening':[22,19,rTow.z+38,0,9.5,rTow.z],
  'Overview':[-55,135,95,-45,6,-115],
  'Plan overview':[-35,245,-105,-35,0,-112],

  /* Urban Jabal Front & Back views (proving 4-sided standalone completion + crisp Yemeni juss & qamariya detail) */
  'Jabal urban towers - front':[10,16,rTow.z+36,2,10,rTow.z],
  'Jabal urban towers - back':[-10,17,rTow.z-36,0,10,rTow.z],
  'Jabal urban souq and trades - front':[8,13,rSouq.z+32,0,6.8,rSouq.z],
  'Jabal civic and landmarks - front':[12,18,rCiv.z+42,0,9.5,rCiv.z],
  'Jabal civic and landmarks - back':[-12,18,rCiv.z-40,0,9.0,rCiv.z],

  /* Dasri Village & Oasis Front & Back views */
  'Dasri village houses - front':[8,10,rVilH.z+28,0,4.2,rVilH.z],
  'Dasri village houses - back':[-8,11,rVilH.z-28,0,4.2,rVilH.z],
  'Dasri village works and qasr - front':[16,15,rVilW.z+42,8,5.2,rVilW.z],
  'Dasri village works and qasr - back':[-12,15,rVilW.z-40,4,5.2,rVilW.z],
  'Dasri fortified oasis qasr':[54,19,rVilW.z+38,36,5.5,rVilW.z],

  /* Dedicated Cliffside & Rock-Pinnacle Views */
  'Cliffside composition overview':[-72,58,-52,-158,12,-125],
  'Dar al-Hajar pinnacle and Jabal cliff cluster':[-96,26,4,-142,16,-62],
  'Jabal cliff abutment close-up':[-192,20,-42,-196,12,-82],
  'Dasri canyon-ledge village flush on cliff':[-122,26,-112,-168,9,-178]
 });
})();
