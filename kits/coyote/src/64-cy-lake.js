// prefix: cy
// ================================================================= THE TIERS' LAKE TOWNS: the quay house, the weir, the reed boat
// PLAN.md section 3: the lake towns of the Tiers (biomes/tiers' stations 1 and 2): a house of two storeys on its quay, the
// fish weir of stakes and wattle, the reed boat. The +z side of each is the water.
//   cyReedBoat(len)    a boat of bound reed bundles, its ends turned up, the binding in rope (len 5 m)
//   cy_lake_house      the quay house: the stone quay (steps down to the water), the boat store below (a wide ear door),
//                      the room above reached by a stair up its side, laced walls, the nets on their rack, the mooring posts
//   cy_fish_weir       a V of stakes and wattle across the shallows to a basket trap at its point
//   cy_reed_boat       the boat, a prop
function cyReedBoat(len){svNoWalk(()=>{const n=9;
 for(let i=0;i<n;i++){const f=i/(n-1),z=-len/2+f*len,e=Math.abs(f-.5)*2,w=.55*(1-e*e*.75),y=.12+Math.pow(e,3)*.55;
  cyl('reed',0,y,z,w,.06+.1*(1-e),P('reed'),10);
  if(i%2===0)cyl('rope',0,y-.02,z,w+.02,.04,P('rope'),10);}
 for(const s of [-1,1])beam('reed',[0,.55,s*len/2],[0,.95,s*(len/2+.25)],.09,P('reed'),false,0,.18);
 beam('wood',[.15,.3,-len*.3],[.4,.15,len*.35],.03,P('wood'));});}
defBuilding({key:'cy_lake_house',name:'Lake town quay house (two storeys)',seed:9921,cls:'building',kind:'house',frag:'kits/coyote',
 tags:CY_TIER_TAGS('middle','dwelling-single','house','fishing'),w:9,d:10,h:6.8,budget:60000,cut:true,front:{x:2.5,z:5,yaw:0},
 note:'a lake town house on its stone quay: steps down to the water, the boat store below behind a wide ear door, the family\'s room above reached by a stair up its side; laced brick walls, nets on their rack, mooring posts',
 build(o){const t=CY.WALL,Q=.8,G=2.8,U=2.6,x0=-3.5+t/2,x1=3.5-t/2,z0=-5+t/2,z1=1-t/2;
  /* the quay, notched for the steps */
  /* the quay's mass past the box reader (its edge would stop a walker a radius short of the steps' head); its top the floor */
  svNoWalk(()=>{box('stone',0,0,-.5,9,Q,9,P('stone'));box('stone',-1.3,0,4.5,6.4,Q,1,P('stone'));box('stone',3.85,0,4.5,1.3,Q,1,P('stone'));});
  wkPad(0,-.5,9,9,Q);wkPad(-1.3,4.5,6.4,1,Q);wkPad(3.85,4.5,1.3,1,Q);
  svStair(2.5,5,0,Q,PI,{style:'solid',w:1.3,run:.9,mk:'stone',col:P('stone')});
  /* the boat store */
  W(0,Q,0,0,()=>{cyLacedRing(x0,z0,x1,z1,G,{holes:{s:cyEarHoles(3.5-t/2,1.6,2.2)},lace:'esw'});
   cyEarDoor(0,z1,0,1.6,2.2,{name:'the boat store door'});
   box('floor',0,0,-2,6.1,.06,5.1,P('floor'));
   W(1.2,0,-2,0,()=>cyReedBoat(3.6));for(let i=0;i<3;i++)cyJar(-2.4+i*.6,-3.8,{h:.7});
   cyTarget(1.5,.06,-2,'the boat store');
   /* the room above */
   svWell('floor',0,G-.12,-2,6.16,.12,5.16,P('floor'));
   W(0,G,0,0,()=>{cyLacedRing(x0,z0,x1,z1,U,{holes:{s:[{at:1.6,w:.8,y:1,h:.8},{at:5.4,w:.8,y:1,h:.8}],w:cyEarHoles(-1.7-z0,.85,CY.DOOR_H)},lace:'esw'});
    cyEarDoor(x0,-1.7,-PI/2,.85,CY.DOOR_H,{name:'the upper door'});
    cyPlatform(x0+t/2,z0+t/2,x1-t/2,z0+t/2+1,.34,{col:P('mudL')});box('hide',0,.35,z0+t/2+.5,4,.04,.8,P('hide'));
    cyHearth(1.2,-1.6,{r:.36});cyLoom(x1-t/2-.2,-2.8,-PI/2);cyTarget(-1,.06,-1,'the room above');
    const top=cyRoof(-3.5,-5,3.5,1,U,{flush:true});cyRoofFront(7,1,top);});});
  /* the stair up the side, its landing at the upper door */
  svStair(-4,2.4,Q,Q+G,PI,{style:'open',w:.8,run:3.4,mk:'timber',col:P('timber'),rail:'left'});
  box('timber',-4,Q+G-.12,-1.6,.8,.12,1.2,P('timber'));wkPad(-4,-1.6,.8,1.2,Q+G);
  for(const z of [-2.15,-1.05])cyPost(-4.35,z,Q+G-.12,.07);
  /* the nets' rack and the mooring posts */
  svNoWalk(()=>{for(const x of [-3.6,-.6])pole('timber',[x,Q,3.4],[x,Q+2,3.4],.06,P('timber'),6);pole('timber',[-3.8,Q+1.9,3.4],[-.4,Q+1.9,3.4],.05,P('timber'),6);
   for(let i=0;i<5;i++)box('rope',-3.3+i*.65,Q+.7,3.4,.5,1.15,.02,P('rope'));
   for(const x of [-3.9,.8])cyl('timber',x,Q,4.75,.11,.7,P('timber'),8);});}});
defBuilding({key:'cy_fish_weir',name:'Fish weir (stakes and wattle, a basket trap)',seed:9922,cls:'building',kind:'works',frag:'kits/coyote',
 tags:CY_TIER_TAGS('poor','industry','works','fishing'),w:14,d:8,h:1.6,budget:20000,front:{x:0,z:-4,yaw:PI},
 note:'a V of stakes and wattle across the lake\'s shallows to a basket trap at its point; the fish swim in on the current',
 build(){svNoWalk(()=>{box('water',0,0,0,14,.02,8,new THREE.Color(.3,.42,.44));
  for(const s of [-1,1]){const a=[s*6.6,-3.6],b=[s*.6,2.6],n=14;
   for(let i=0;i<=n;i++){const f=i/n,x=a[0]+(b[0]-a[0])*f,z=a[1]+(b[1]-a[1])*f;pole('wood',[x,-.4,z],[x,1.3+rr(-.1,.15),z],.045,P('wood'),5);}
   for(const y of [.35,.7,1.05])beam('reed',[a[0],y,a[1]],[b[0],y,b[1]],.05,P('reed'),false,0,.16);}
  lathe('reed',0,3.1,[[.45,0],[.5,.5],[.4,.9],[.12,1.05],[0,1.1]],12,P('reed'));
  for(const s of [-1,1])pole('wood',[s*.55,-.4,3.1],[s*.55,1.5,3.1],.05,P('wood'),5);});}});
defBuilding({key:'cy_reed_boat',name:'Reed boat',seed:9923,cls:'prop',kind:'boat',frag:'kits/coyote',
 tags:{types:['infrastructure'],style:'tier',role:'boat',job:'fishing'},w:1.4,d:5.6,h:1.1,budget:12000,front:{x:0,z:2.8,yaw:0},
 note:'a boat of bound reed bundles, its ends turned up, a paddle laid in it',
 build(){cyReedBoat(5);}});
