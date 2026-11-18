// prefix: cy
// ================================================================= THE GATE LONG WALL: Derbent across a test floor, KCITY wall + core/water
// PLAN.md sections 0, 4, 9 and 11 (C6); biomes/outlandgate/PLAN.md section 5. Lays the long wall from wall foot to wall foot
// across a 140 m test valley floor from core/city's wall records (35-cy-wall-plan.js cyWallPlan -> KCITY.site.wall and
// KCITY.site.wallSegs): two canyon scarps at the ends, the road through cy_toll_gate with cy_runner_shrine at its foot and
// cy_fodder_pit on the caravan apron, Hau-Gel flowing on core/water (WATER.flow in 91z-cy-world.js) through cy_water_gate's
// corbelled culverts, cy_postern on the inner curtain, and the east stretch in its slumped older state watched by core/ruins.
defBuilding({key:'cy_gate_wall',name:'The Gate long wall across the Narrows (KCITY wall and core water)',seed:9961,cls:'building',kind:'wall_complex',frag:'kits/coyote',
 tags:{types:['military','infrastructure'],wealth:'rich',style:'tier',role:'gate'},w:158,d:64,h:12.6,budget:1800000,front:{x:-32,z:28.5,yaw:0},
 note:'the Gate across a test valley floor: KCITY.site.wall and wallSegs lay three towers, the toll gate on the road and the water gate over a core/water river (Hau-Gel), with a postern, a slumped older stretch on core/ruins, the runner shrine at the road foot and the fodder pit',
 build(o){o=o||{};const world=o.world==null?13:o.world,rx=-32,wx=32;
  const roadPts=[[rx,-29],[rx,29]],riverPts=[[wx,-29],[wx,29]];
  const WP=cyWallPlan({
   id:o.id||'gate-narrows',world,
   chain:[[-70,0],[70,0]],
   ways:[
    {id:'hounds-road',name:'Hounds Road',kind:'road',pts:roadPts},
    {id:'hau-gel',name:'Hau-Gel',kind:'river',pts:riverPts}
   ],
   towerGap:35,posternSeg:1,slumpedSegs:[3],slumpedTowers:[2],dims:cyDims
  });
  if(WP.error){reportErr('cy_gate_wall: '+WP.error);return;}
  /* the two canyon wall feet (west x = -75.5, east x = +75.5) that the long wall closes from foot to foot */
  svNoWalk(()=>{
   for(const s of [-1,1]){
    box('rock',s*75.2,0,0,7.2,12.2,26,P('rock'));
    box('rock',s*72.4,0,2.5,5.0,7.6,18,P('rock'));
    box('rock',s*73.6,0,-9.5,5.8,9.2,14,P('rock'));}
   /* the river's gravel banks either side of Hau-Gel (x = 32, channel width 8.4 m), notched clear of the water gate */
   for(const s of [-1,1])for(const sz of [-1,1]){
    box('gravel',wx+s*5.8,0,sz*16.8,3.2,.42,24.4,P('gravel'));}
   box('gravel',wx,0,-17,8.8,.03,24,P('stone'));box('gravel',wx,0,17,8.8,.03,24,P('stone'));});
  /* the road from +z (outside the wall, z = +29) through the toll gate's court to -z (inside, z = -29) */
  box('floor',rx,0,19.8,5.6,.04,18.4,P('stone'));
  box('floor',rx,0,-19.6,5.6,.04,18.4,P('stone'));
  /* the nodes and curtain segments exactly as cyWallPlan gives them; watch the east slumped stretch as one ruin region */
  const children=[];
  for(const n of WP.nodes){
   const r=place(n.key,n.x,n.z,n.ry,{y:0,v:n.v,rec:n,watch:false,tags:n.v?{state:'ruined'}:null});
   if(r)children.push({plan:n,rec:r});}
  for(const sg of WP.segs){
   const r=place(sg.key,sg.x,sg.z,sg.ry,{y:0,w:sg.w,v:sg.v,rec:sg,watch:false,stair:sg.v===0,tags:sg.v?{state:'ruined'}:null});
   if(r)children.push({plan:sg,rec:r});}
  /* watch the slumped eastern stretch (Seg 3 + Tower 2: local x = +41 .. +74) in KRUINS */
  cyRuinWatch('Gate eastern slumped stretch',34,12);
  /* move that watch's centre onto the slumped stretch (local x = +57.5, z = 0) */
  if(!PLACE_DRY&&CY_RUINS.length){
   const p=new THREE.Vector3(57.5,0,0).applyMatrix4(CM);
   CY_RUINS[CY_RUINS.length-1].x=p.x;CY_RUINS[CY_RUINS.length-1].z=p.z;}
  /* road-foot shrine (within 8 m of the road's foot at [rx, 29]), milestone, and caravan fodder-burning pit */
  const shX=rx-6.8,shZ=25.2;
  const rShrine=place('cy_runner_shrine',shX,shZ,PI/2,{y:0,text:'Hau-Gèl! Lōk-Hau.'});
  place('cy_milestone',rx+4.2,24.5,0,{y:0,text:'Hau-Gèl Lōk.'});
  place('cy_fodder_pit',rx+12.5,20.5,0,{y:0});
  /* record the river line in world coordinates for 91z-cy-world.js (WATER.flow + WATER.drawFlow) and the gate audit */
  if(CURREC&&!PLACE_DRY){
   const toW=(lx,ly,lz)=>{const v=new THREE.Vector3(lx,ly,lz).applyMatrix4(CM);return [v.x,v.z,v.y];};
   const rPts=[[-29,.68],[-8,.64],[0,.61],[8,.58],[29,.52]].map(q=>toW(wx,q[1],q[0]));
   const footW=toW(rx,0,29),shW=rShrine?[rShrine.x,rShrine.z]:[0,0];
   CURREC.river={name:'Hau-Gel (test channel)',pts:rPts,width:8.2,speed:1.6};
   CURREC.gateWall={
    plan:WP,
    footDist:[Math.hypot(WP.nodes[0].x-WP.footA[0],WP.nodes[0].z-WP.footA[1]),Math.hypot(WP.nodes[WP.nodes.length-1].x-WP.footB[0],WP.nodes[WP.nodes.length-1].z-WP.footB[1])],
    roadFoot:[footW[0],footW[1]],
    shrineAt:shW,
    shrineDist:Math.hypot(shW[0]-footW[0],shW[1]-footW[1]),
    waterGateX:toW(wx,0,0)
   };
   cyTarget(rx,.06,22,'the road approach');
   cyTarget(rx,.06,-4.4,'the toll gate customs court');
   cyTarget(shX+.6,.06,shZ,'the road-foot shrine');
   cyTarget(rx+12.5,.06,22.9,'the fodder-burning apron');
   cyTarget(WP.segs[1].x,.06,-3.3,'the postern inner apron');
   cyTarget(0,CY_GATE.WALK+.06,.4,'the central wall-walk');
   cyTarget(wx,CY_GATE.WALK+.06,.4,'the water-gate walk');}}});
