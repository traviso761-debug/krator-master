// prefix: cy
// ================================================================= HOWL AND THE ROAD: the stage house, the runners' post, the larder
// PLAN.md section 3: Howl, the last village before the Gate (Tiers 6), keeps the road: a stage house where the pack ostriches
// and goats are stalled, the relay runners' post with its signal pole, the fort's larder.
//   cy_stage_house    the road station: a walled court, stalls under shades on three sides with their mangers, troughs and
//                     a well; the gatehouse on the road (an ear-shaped gate, two leaves, guard rooms either side of the
//                     passage, the rooms over the gate up a stair in the west guard room)
//   cy_runners_post   the relay runners' hut, laced, its bench and water jar, the signal pole with the fire basket and pennant
//   cy_larder         the fort's supply store: a long laced store on a raised floor, vents under the eaves, jars, bins,
//                     sacks and the meat racks
function cyStall(x0,z0,x1,z1,h,along){cyShade(x0,z0,x1,z1,h);
 const n=Math.max(1,Math.floor((along?x1-x0:z1-z0)/2.6));
 for(let i=0;i<=n;i++){const f=i/n;svNoWalk(()=>{if(along){const x=x0+(x1-x0)*f;box('wood',x,0,(z0+z1)/2,.06,1.1,z1-z0-.4,P('wood'));}
  else{const z=z0+(z1-z0)*f;box('wood',(x0+x1)/2,0,z,x1-x0-.4,1.1,.06,P('wood'));}});}
 for(let i=0;i<n;i++){const f=(i+.5)/n;if(along)box('timber',x0+(x1-x0)*f,.5,z0+.35,1.4,.35,.45,P('timber'));else box('timber',x0+.35,.5,z0+(z1-z0)*f,.45,.35,1.4,P('timber'));}}
defBuilding({key:'cy_stage_house',name:'Stage house (the road station)',seed:9931,cls:'building',kind:'serai',frag:'kits/coyote',
 tags:CY_TIER_TAGS('middle','inn','serai','trading'),w:24,d:22,h:6.8,budget:150000,cut:true,front:{x:0,z:11,yaw:0},
 note:'the road station at Howl: a walled court of stalls for the pack ostriches and goats under shades, mangers, troughs and a well; the gatehouse on the road, its ear-shaped gate of two leaves, the guard rooms either side of the passage, the rooms over the gate',
 build(){const t=CY.WALL,Hc=3.2,G=3.4,U=2.6,X=12,Z=11,gx=6,gz=7.4;
  /* the court's walls, the south one broken by the gatehouse */
  cyWall(-X+t/2,-Z,-X+t/2,Z,0,Hc,{inner:-1});cyWall(X-t/2,Z,X-t/2,-Z,0,Hc,{inner:-1});cyWall(X,-Z+t/2,-X,-Z+t/2,0,Hc,{inner:-1});
  cyWall(-X,Z-t/2,-gx,Z-t/2,0,Hc,{inner:-1});cyWall(gx,Z-t/2,X,Z-t/2,0,Hc,{inner:-1});
  cyLace(-X,Z-t/2,-gx,Z-t/2,[1.1],[],t);cyLace(gx,Z-t/2,X,Z-t/2,[1.1],[],t);
  /* the gatehouse: the passage through it, a guard room either side */
  const x0=-gx+t/2,x1=gx-t/2,z0=gz+t/2,z1=Z-t/2,gw=2.8,gh=2.9;
  cyLacedRing(x0,z0,x1,z1,G,{holes:{s:cyEarHoles(gx-t/2,gw,gh),n:cyEarHoles(gx-t/2,gw,gh)},lace:'esw'});
  cyEarDoor(0,z1,0,gw,gh,{name:'the gate'});
  for(const s of [-1,1])cyWall(s*1.6,z0+t/2,s*1.6,z1-t/2,0,G,{inner:0,t:.3,socle:0,holes:cyEarHoles(s>0?1.4:z1-z0-t-1.4,.85,CY.DOOR_H)});
  box('floor',0,0,(z0+z1)/2,gx*2-2*t,.06,z1-z0-t,P('stone'));
  /* the stair in the west guard room, up to the rooms over the gate */
  const SP=svStair(-5.25,8.35,0,G,PI/2,{style:'open',w:.8,run:3.1,mk:'timber',col:P('timber'),rail:'right'});
  svWell('floor',0,G-.12,(z0+z1)/2,gx*2-2*t,.12,z1-z0-t,P('floor'),SP);
  cyTarget(4,.06,9.2,'the east guard room');
  W(0,G,0,0,()=>{cyLacedRing(x0,z0,x1,z1,U,{holes:{s:[{at:2,w:.7,y:.9,h:.8},{at:gx-t/2,w:.7,y:.9,h:.8},{at:2*gx-t-2,w:.7,y:.9,h:.8}]},lace:'esw'});
   cyPlatform(1,z0+t/2,x1-t/2,z0+t/2+.9,.34,{col:P('mudL')});box('hide',3,.35,z0+t/2+.45,3.4,.04,.8,P('hide'));
   cyHearth(2.5,9.6,{r:.34});cyTarget(1.5,.06,9.4,'the rooms over the gate');
   const top=cyRoof(-gx,gz,gx,Z,U,{flush:true});cyRoofFront(gx*2,Z,top);});
  /* the stalls on three sides, the troughs and the well */
  cyStall(-X+t,-8,-X+t+3.4,5.8,2.8,false);cyStall(X-t-3.4,-8,X-t,5.8,2.8,false);cyStall(-8,-Z+t,8,-Z+t+3.4,3.0,true);
  for(const s of [-1,1]){box('stone',s*5.4,0,-1,.7,.55,4.5,P('stone'));box('water',s*5.4,.48,-1,.5,.02,4.3,new THREE.Color(.3,.38,.38));}
  svNoWalk(()=>{lathe('stone',0,-1,[[1.1,0],[1.1,.75],[.86,.75],[.86,0]],18,P('stone'));box('water',0,.3,-1,1.5,.02,1.5,new THREE.Color(.16,.22,.24));
   for(const s of [-1,1])pole('timber',[s*1.2,0,-1],[s*1.2,2.2,-1],.07,P('timber'),6);pole('timber',[-1.4,2.15,-1],[1.4,2.15,-1],.06,P('timber'),6);});
  box('floor',0,0,-1.8,X*2-2*t,.04,gz+Z-t-.6,P('gravel'));}});
defBuilding({key:'cy_runners_post',name:'Runners post (hut and signal pole)',seed:9932,cls:'building',kind:'post',frag:'kits/coyote',
 tags:CY_TIER_TAGS('poor','infrastructure','post'),w:7,d:6,h:9.6,budget:30000,cut:true,front:{x:-1.25,z:3,yaw:0},
 note:'the relay runners\' hut on the road, laced, a bench at its door and a water jar; the signal pole beside it with its fire basket and the Kingdom\'s pennant',
 build(){const t=CY.WALL,x0=-3.5+t/2,x1=1+t/2,z0=-3+t/2,z1=1+t/2+.6;
  cyLacedRing(x0,z0,x1,z1,2.6,{holes:{s:cyEarHoles(-1.25-x0,.85,CY.DOOR_H)},lace:'esw'});
  cyEarDoor(-1.25,z1,0,.85,CY.DOOR_H,{name:'the runners door'});
  box('floor',(x0+x1)/2,0,(z0+z1)/2,x1-x0-t,.06,z1-z0-t,P('floor'));
  cyPlatform(x0+t/2,z0+t/2,x1-t/2,z0+t/2+.9,.34,{col:P('mudL')});cyHearth(-1.6,0,{r:.3});
  const top=cyRoof(x0-t/2,z0-t/2,x1+t/2,z1+t/2,2.6,{});
  box('wood',-2.6,0,z1+.75,1.6,.42,.4,P('wood'));cyJar(.2,z1+.6,{h:.75});
  cyTarget(-1.5,.06,-.6,'the runners room');
  svNoWalk(()=>{const px=2.6,pz=-1;cyl('stone',px,0,pz,.55,.4,P('stone'),12);pole('timber',[px,0,pz],[px,8.6,pz],.13,P('timber'),8);
   pole('timber',[px-.9,6.8,pz],[px+.9,6.8,pz],.06,P('timber'),6);
   for(let i=0;i<8;i++){const a=i/8*TAU;beam('timber',[px+Math.cos(a)*.15,8.6,pz+Math.sin(a)*.15],[px+Math.cos(a)*.42,9.4,pz+Math.sin(a)*.42],.025,P('timber'));}
   cyl('ash',px,8.75,pz,.3,.12,P('ash'),10);
   box('plain',px+.55,7.6,pz,1.0,.55,.02,P('red'));
   for(let i=0;i<6;i++)pole('timber',[px-.55+i*.06,0,pz+.5],[px-.75+i*.1,1.8,pz+.9],.03,P('timber'),5);});}});
defBuilding({key:'cy_larder',name:'Larder (the fort\'s supply store)',seed:9933,cls:'building',kind:'store',frag:'kits/coyote',
 tags:CY_TIER_TAGS('middle','industry','store','warehousing'),w:10,d:6,h:4.2,budget:40000,cut:true,front:{x:-2,z:3,yaw:0},
 note:'the fort\'s supply store: a long laced store on a raised floor, vents under the eaves, jars of grain and oil, bins, sacks, the meat racks',
 build(){const t=CY.WALL,F=.5,x0=-5+t/2,x1=5-t/2,z0=-3+t/2,z1=2.2-t/2,Hh=3.2;
  const vents=[1.5,3.5,5.5,7.5].map(a=>({at:a,w:.3,y:2.55,h:.25}));
  cyLacedRing(x0,z0,x1,z1,Hh,{holes:{s:cyEarHoles(-2-x0,1.0,CY.DOOR_H).map(q=>Object.assign({},q,{y:q.y+F})),n:vents},lace:'esnw',ys:[1.3,2.3]});
  W(0,F,0,0,()=>cyEarDoor(-2,z1,0,1.0,CY.DOOR_H,{name:'the larder door'}));
  svStair(-2,3,0,F,PI,{style:'solid',w:1.2,run:.6,mk:'stone',col:P('stone')});box('stone',-2,0,2.4,1.2,F,.4,P('stone'));wkPad(-2,2.4,1.2,.4,F);
  box('floor',0,F-.06,(z0+z1)/2,x1-x0-t,.06,z1-z0-t,P('timber'));
  W(0,F,0,0,()=>{for(let i=0;i<6;i++)cyJar(-4.2+i*.75,-1.9,{h:.95,r:.3});
   for(let i=0;i<3;i++)cyBin(1.2+i*1.1,-2,0,{w:.9,h:.8});
   for(let i=0;i<5;i++)box('hide',2.6+(i%3)*.5,0,.6+Math.floor(i/3)*.6,.45,.4,.35,P('rope'));
   svNoWalk(()=>{pole('timber',[.5,2.4,-1],[4,2.4,-1],.05,P('timber'),6);for(let i=0;i<6;i++)box('plain',.8+i*.55,1.9,-1,.18,.45,.1,P('red'));});
   cyTarget(0,.06,0,'the store');});
  cyRoof(-5,-3,5,2.2,Hh,{});}});
