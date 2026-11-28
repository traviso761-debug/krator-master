// prefix: hs
// ================================================================= LAKESIDE HANDSPEAK SIGHTLINE SHOWCASE (PLAN.md §3, seed 37401)
//   37401 hs_lakeside_sanctuary_row   Ribbon-Lake Handspeak Sightline Promenade & Quay Diorama (cls: 'feature', kind: 'showcase'):
//                                     mirror-calm WATER.still ribbon-lake basin, paved granite promenade, facing colonnaded
//                                     Handspeak sign-galleries with chest-height parabolic reflector lamps, 8-stepped snow-white
//                                     quartz optical heliograph tower, 440/660 Hz bianzhong court & Open-Palm monoliths.

defBuilding({key:'hs_lakeside_sanctuary_row',name:'Ribbon-Lake Handspeak Sightline Sanctuary Row',seed:37401,
 cls:'feature',kind:'showcase',cut:false,
 w:34.0,d:21.6,h:18.2,budget:280000,
 tags:{types:['infrastructure','plaza'],style:'gallery',landmark:true},
 note:'ribbon-lake waterfront promenade aligning twin Handspeak sign-galleries, chest-height quartz reflector lamps, an 8-stepped snow-white quartz heliograph spire and 440 Hz bianzhong racks across an unbroken sightline court',
 build(){
  const G=.38;
  /* Paved granite lakeside promenade deck (south/centre) */
  svNoWalk(()=>{
   box('granite',0,0,2.2,32.0,.24,13.6,P('granite'));
   box('paving',0,.24,2.2,31.4,.14,13.0,P('paving'));
  });
  wkPad(0,2.2,31.0,12.6,G);
  /* Mirror-calm north ribbon-lake waterfront basin (WATER.still) */
  const bw=31.6,bd=6.2,bz=-7.2,kt=.42;
  svNoWalk(()=>{
   box('slate',0,0,bz,bw,.08,bd,P('slateD'));
   box('granite',0,.08,bz-bd/2+kt/2,bw,.4,kt,P('granite'));
   for(const sx of [-1,1])box('granite',sx*(bw/2-kt/2),.08,bz,kt,.4,bd-kt,P('granite'));
   /* Moored silent cypress ferry skiff on the mirror water */
   ellip('cypress',-6.5,.32,bz,.68,.24,2.4,P('cypress'),.08,12);
   ellip('birch',-6.5,.42,bz,.52,.11,2.05,P('birch'),.08,10);
  });
  if(CURREC&&!PLACE_DRY){
   const c=new THREE.Vector3(0,0,bz).applyMatrix4(CM),hw=bw*.5-.46,hd=bd*.5-.46;
   (CURREC.stills||(CURREC.stills=[])).push({
    name:'showcase_ribbon_lake',level:.32,
    bounds:[c.x-hw,c.z-hd,c.x+hw,c.z+hd],
    poly:[[c.x-hw,c.z-hd],[c.x+hw,c.z-hd],[c.x+hw,c.z+hd],[c.x-hw,c.z+hd]],
    color:0x184b5e,roughness:.03
   });
  }
  /* Twin facing colonnaded Handspeak sign-galleries across the sightline promenade (unbroken waist-to-head view!) */
  hsSignGallery(-7.2,G,5.8,11.6,2.4,2.95,PI,{deck:false,bays:4,openCenter:true});
  hsSignGallery(-7.2,G,-1.8,11.6,2.4,2.95,0,{deck:false,bays:4,openCenter:true});
  /* East lakeside snow-white quartz optical heliograph spire + west stepped quartz votive pavilion */
  hsQuartzSpireTower(10.8,-.8,3.0,G,10.6,{steps:8,heliograph:true,doorYaw:-PI/2,walkFloor:false});
  svNoWalk(()=>box('ashlar',-13.8,G,2.0,2.8,3.6,2.8,P('ashlar')));
  hsQuartzPyramid(-13.8,2.0,2.9,G+3.6,3.4,7,{heliograph:false});
  /* Twin 440/660 Hz bianzhong & nephrite harmonic racks + twin Raised Open-Palm monoliths */
  hsHarmonicRack(4.2,G,5.8,2.8,PI,{chimes:6,h:2.55});
  hsHarmonicRack(4.2,G,-1.8,2.8,0,{chimes:6,h:2.55});
  hsPalmMonolith(13.6,G,6.6,3.1,0);
  hsPalmMonolith(-13.8,G,6.6,3.1,0);
  hsSignBanner(0,G,6.8,0,3.6,{mk:'linen'});
  hsFurnList([
   ['hush_tea_sign_table',-9.5,G,2.0,0],
   ['hush_tea_sign_table',-4.5,G,2.0,0],
   ['hush_primer_tablet_stand',1.2,G,2.0,0],
   ['hush_handspeak_mirror_lamp',7.2,G,3.2,0],
   ['hush_handspeak_mirror_lamp',7.2,G,.8,PI],
   ['hush_cable_capstan',0,G,-3.6,0]
  ]);
 }});
