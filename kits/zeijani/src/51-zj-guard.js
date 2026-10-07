// prefix: zd
// ================================================================= THE GUARD AND THE OUTPOST (PLAN.md 6.4, P3c): the village guard post,
// the capital's barracks, the guard headquarters, the outpost's barracks, the watchtower, the scouts' headquarters, the muster
// ground, the palisade and its gate. Plans: their interiors items (the carved barracks' `route` is walked by the probe).

/* a pennant on a pole standing on y at (x, z) */
function zdPole(x,y,z,h,o){o=o||{};cyl('log',x,y,z,.07,h,P('woodD'),7);sph('copper',x,y+h+.06,z,.09,P('copper'),1,8);sock('flag',x,y+h-.2,z,o.ry||0,{w:o.w||1.2,h:o.fh||.7});}
/* stepped merlons along a parapet's top from a to b (local x,z), at y */
function zdMerlons(x0,z0,x1,z1,y,n){const wt=P('white');for(let i=0;i<n;i++){const t=(i+.5)/n,x=x0+(x1-x0)*t,z=z0+(z1-z0)*t,ry=Math.atan2(x1-x0,z1-z0);
 box('tuffPol',x,y,z,.44,.22,.5,wt,ry);box('tuffPol',x,y+.22,z,.44,.18,.26,wt,ry);}}

/* the village guard post: tuff blocks, a guardroom at the door and the bunks behind (the planner's), a parapet with merlons, a
   timber lookout on the roof reached by a ladder at the back, a pennant */
defBuilding({key:'zj_guardpost',name:'Village guard post',seed:5101,cut:true,tags:{types:['civic'],wealth:'middle',style:'constructed',rock:'tuff'},w:10,d:9,h:7.4,
 build(o){const top=zvShell('zj_guardpost',8,6.5,{y0:.2}),wd=P('woodD');
  zdMerlons(-3.6,3.05,3.6,3.05,top+.68,7);zdMerlons(-3.6,-3.05,3.6,-3.05,top+.68,7);
  for(const [x,z] of [[-1.6,-1.6],[1.6,-1.6],[-1.6,1.0],[1.6,1.0]])cyl('log',x,top,z,.08,2.2,wd,7);box('plank',0,top+2.2,-.3,3.6,.08,3.0,P('wood'));
  plane4('thatch',[-2.1,top+3.3,-.3],[2.1,top+3.3,-.3],[-2.1,top+2.5,1.6],.12,P('thatch'));plane4('thatch',[2.1,top+3.3,-.3],[-2.1,top+3.3,-.3],[2.1,top+2.5,-2.2],.12,P('thatch'));
  zcLadder(3.2,0,top+.1,-3.75,-3.3,wd);zvDoorway(0,.2,3.25,1.1);zdPole(-3.6,top,2.9,2.4);
  sock('emblem',2.4,2.2,3.31,0,{w:.8,h:.8});FURNISH('zeijani_stone_bench',-2.2,0,4.0,0,{setting:'outdoor'});}});

/* the capital's barracks: the door in the hall's wall under a tall stepped portal, the city's emblem over it, guard pillars with
   lanterns either side, the standard's poles */
defBuilding({key:'zj_barracks_carved',name:'The capital\'s barracks (carved)',seed:5102,originFront:true,
 tags:{types:['civic'],wealth:'middle',style:'carved',rock:'tuff',finish:'hewn'},w:26,d:25,h:8.5,
 note:'its door in the hall\'s wall: the guardroom, the pillared dormitory hall, the armoury and the mess off it',
 build(o){const it=zjItem('zj_barracks_carved');cvFromItem(it,{finish:'hewn'});zfFixtures(it);const c=P('white');
  zvFace(0,2.2,2.8,{mk:'tuffPol',n:3});for(const s of [-1,1])zfColumn('tuffPol',s*2.6,0,.25,.26,3.6,c,{square:true});
  sock('emblem',0,4.5,.08,0,{w:1.6,h:1.6});box('plain',0,3.75,.04,6.4,.12,.02,P('ochre'));
  for(const s of [-1,1]){zcLantern(s*4.4,1.6,c);zdPole(s*6.2,0,1.0,4.2,{ry:s<0?PI:0});}
  FURNISH('zeijani_trade_display',-7.6,0,1.0,0,{setting:'outdoor'});}});

/* the guard headquarters on the square: blocky tuff ashlar in two storeys (the planner's), battered corner piers, a frieze at
   the floor line, a parapet with merlons, the emblem over the door, pennants on the roof */
defBuilding({key:'zj_guard_hq',name:'The guard headquarters',seed:5103,cut:true,tags:{types:['civic'],wealth:'rich',style:'constructed',rock:'tuff'},w:16,d:12,h:10.5,
 build(o){const top=zvShell('zj_guard_hq',14,10,{y0:.4}),c=P('tuff'),wt=P('white');
  for(const sx of [-1,1])for(const sz of [-1,1]){box('ashlar',sx*6.75,.4,sz*4.75,1.0,top-.4,1.0,c);box('ashlar',sx*6.75,0,sz*4.75,1.4,.6,1.4,P('tuffDark'));}
  W(0,0,5.06,0,()=>{box('tuffPol',0,3.6,0,12.4,.6,.1,wt);});zfBand('patFrieze',0,3.64,5.12,12.2,.52,0,wt);
  zdMerlons(-6.6,4.8,6.6,4.8,top+.68,11);zdMerlons(-6.6,-4.8,6.6,-4.8,top+.68,11);
  zfSteps('ashlar',0,.4,5.15,2.2,2,P('tuffDark'),.2,.32);zvDoorway(0,.4,5,1.6,{n:3,open:1.4});
  sock('emblem',0,3.05,5.1,0,{w:1.1,h:1.1});for(const s of [-1,1])zdPole(s*5.6,top+.68,4.8,2.6);
  for(const s of [-1,1])zcLantern(s*3.2,6.4,wt);}});

/* the outpost's barracks: a stone footing, walls of kipuka logs (the planner's body, drawn in log), a pitched thatch over gable
   ends of plank, a porch rail; a weapon rack and a fire pit outside */
defBuilding({key:'zj_barracks_outpost',name:'The outpost\'s barracks',seed:5104,cut:true,tags:{types:['civic'],wealth:'poor',style:'wooden'},w:18,d:10,h:6.4,
 build(o){const wd=P('woodD'),inst=zbBody('zj_barracks_outpost',{wall:'log',wallCol:P('wood'),part:'plank',partCol:P('wood')}),B=inst&&inst.buildings[0],RY=B?B.roof.y:3.4;
  box('ashlar',0,0,0,15.4,.4,7.4,P('tuffDark'));box('plank',0,.4,0,14.4,.04,6.4,P('wood'));
  box('log',0,RY,0,15.2,.2,7.2,wd);const ridge=RY+2.2;
  plane4('thatch',[-8.0,ridge,0],[8.0,ridge,0],[-8.0,RY-.1,4.3],.16,P('thatch'));plane4('thatch',[8.0,ridge,0],[-8.0,ridge,0],[8.0,RY-.1,-4.3],.16,P('thatch'));
  for(const s of [-1,1])poly('plank',[[s*7.45,RY+.2,-3.5],[s*7.45,RY+.2,3.5],[s*7.45,ridge-.1,0]],P('wood'),true);
  box('log',0,ridge-.05,0,16.2,.18,.18,wd);
  for(const s of [-1,1])box('log',s*.7,.44,3.55,.16,2.1,.2,wd);box('log',0,2.5,3.55,1.6,.18,.2,wd);door(0,.4,3.5,0,1.2);
  zdPole(-7.0,0,4.4,4.0);
  cyl('ashlar',4.4,0,5.4,.7,.25,P('tuffDark'),12);cyl('glow',4.4,.25,5.4,.45,.03,P('ember'),10);smokeAt(4.4,.6,5.4,{r:.16});haloAt(4.4,.5,5.4,0xff8a40,false);
  FURNISH('zeijani_trade_display',-3.4,0,4.6,0,{setting:'outdoor'});FURNISH('zeijani_stone_stool',3.2,0,5.9,.4,{setting:'outdoor'});}});

/* the watchtower: a square tuff shaft over the watch's room (the planned room at its foot), a timber lookout 9 m up with a rail
   and a thatch cap on posts, a ladder up the back, a horn and a signal lamp on the lookout */
defBuilding({key:'zj_watchtower',name:'Watchtower',seed:5105,cut:true,tags:{types:['civic'],wealth:'poor',style:'constructed',rock:'tuff'},w:7,d:7,h:12.6,
 build(o){const c=P('tuff'),wd=P('woodD'),t=.4,H=9;
  box('ashlar',0,0,0,5.6,.2,5.6,P('tuffDark'));
  for(const s of [-1,1]){box('ashlar',s*(2.2+t/2),.2,0,t,H-.2,5.2,c);box('ashlar',s*1.35,.2,2.4,1.7,H-.2,t,c);}
  box('ashlar',0,.2,-2.4,4.4,H-.2,t,c);box('ashlar',0,2.4,2.4,1.0,H-2.4,t,c);
  box('plank',0,2.8,0,4.4,.2,4.4,P('wood'));
  for(const s of [-1,1])box('tuffPol',s*.55,.2,2.6,.2,2.4,.08,P('white'));box('tuffPol',0,2.6,2.6,1.3,.2,.1,P('white'));
  box('plank',0,H,0,6.0,.18,6.0,P('wood'));for(const [x,z] of [[-2.8,-2.8],[2.8,-2.8],[-2.8,2.8],[2.8,2.8]])cyl('log',x,H,z,.08,2.4,wd,7);
  for(const s of [-1,1]){box('log',0,H+1.0,s*2.9,5.8,.08,.08,wd);box('log',s*2.9,H+1.0,0,.08,.08,5.8,wd);}
  zfCone('thatch',0,H+2.35,0,4.2,2.2,P('thatch'));
  zcLadder(0,0,H+.2,-3.5,-3.1,wd);
  beam('bone',[-1.6,H+1.1,1.6],[-2.2,H+1.4,2.4],.1,P('bone'),true,8);cyl('log',1.8,H,1.8,.06,1.2,wd,6);sph('glow',1.8,H+1.32,1.8,.14,P('flame'),1,8);haloAt(1.8,H+1.3,1.8,0xffb04a,false);
  zdPole(-2.8,H+2.4,-2.8,1.6);door(0,.2,2.2,0,.9);}});

/* the scouts' headquarters (the board's temple tower): an octagonal tower of three storeys (the interiors planner's: the map room
   at the door, the store of rope and kit above, the watch's room at the top, ladders between), its ground storey tuff ashlar, its
   upper two walled in pierced lattice so the lamps inside make it glow; a band at each floor, a parapet, a small domed lantern
   room on the roof, rope coils at the door */
defBuilding({key:'zj_scout_hq',name:'The scouts\' headquarters',seed:5106,cut:true,tags:{types:['civic'],wealth:'rich',style:'constructed',rock:'tuff'},w:12,d:12,h:15,
 build(o){const c=P('tuff'),wt=P('white'),inst=zbBody('zj_scout_hq',{wall:'ashlar',wallCol:c,wallAt:Wl=>Wl.y>1?'jali':'ashlar'}),B=inst&&inst.buildings[0],RY=B?B.roof.y:9.5;
  /* octagonal rings (vertex radius r, flats on the axes, as the plan) */
  const oct=r=>[0,1,2,3,4,5,6,7].map(k=>{const a=(22.5+45*k)*PI/180;return [r*Math.cos(a),r*Math.sin(a)];});
  const ring=(y,r0,r1,h,mk)=>{const A=oct(r0),Bo=oct(r1);for(let k=0;k<8;k++){const q=[A[k],Bo[k],Bo[(k+1)%8],A[(k+1)%8]];prism(mk||'tuffPol',q,y,y+h,wt);}};
  prism('ashlar',oct(5.45),0,.3,P('tuffDark'));
  for(const F of (B?B.floors:[]))if(F.level)ring(F.y-.25,4.95,5.3,.3);
  /* the roof: a slab, a parapet, the lantern room's drum and dome, a finial; the lamps that light the lattice from inside */
  prism('ashlar',oct(5.2),RY,RY+.25,c);ring(RY+.25,4.7,5.2,.7,'ashlar');ring(RY+.95,4.65,5.3,.12);
  zfDrum('ashlar',0,RY+.25,0,1.9,1.6,c,{seg:20});zfDome('tuffPol',0,RY+1.85,0,1.9,1.5,wt,{seg:20,rows:7});cyl('copper',0,RY+3.3,0,.08,1.0,P('copper'),8);
  sph('glow',0,RY+4.4,0,.16,P('flame'),1,10);haloAt(0,RY+4.4,0,0xffb04a,false);
  for(const F of (B?B.floors:[]))if(F.level)haloAt(0,F.y+1.9,0,0xffb060,true);
  zvDoorway(0,.3,4.62,1.1,{n:2,leaf:false});sock('emblem',0,2.85,4.7,0,{w:.8,h:.8});
  FURNISH('zeijani_rope_coils',2.4,0,5.2,0,{setting:'outdoor'});FURNISH('zeijani_rope_coils',-2.5,0,5.1,.6,{v:1,setting:'outdoor'});}});

/* the muster ground: a levelled floor of paving with a kerb, a dais at the back (steps, the standard, a lamp pillar each side),
   weapon racks along one side, benches along the other */
defBuilding({key:'zj_muster',name:'The muster ground',seed:5107,cls:'feature',tags:{types:['civic'],wealth:'middle',style:'constructed',rock:'tuff'},w:22,d:16,h:6,front:{x:0,z:7.2},
 note:'a levelled floor, a dais, weapon racks, the standard',
 build(o){const c=P('tuffDark'),wt=P('white');
  box('paving',0,0,0,20,.12,14,c);for(const [x,z,w,d] of [[0,7.1,20.4,.3],[0,-7.1,20.4,.3],[10.1,0,.3,14],[-10.1,0,.3,14]])box('ashlar',x,0,z,w,.3,d,c);
  box('ashlar',0,0,-5.2,7,.9,3,c);box('tuffPol',0,.9,-5.2,7.1,.06,3.1,wt);zfSteps('ashlar',0,.9,-3.55,3,4,c,.225,.3);
  zdPole(0,.96,-6.0,4.6,{w:1.8,fh:1.0});for(const s of [-1,1])zcLantern(s*3.0,-5.6,wt);
  for(let i=0;i<4;i++){FURNISH('zeijani_trade_display',-9.0,0,-3.6+i*2.6,PI/2,{setting:'outdoor'});FURNISH('zeijani_stone_bench',9.0,0,-3.6+i*2.6,-PI/2,{setting:'outdoor'});}}});

/* the outpost's palisade: a run of sharpened kipuka logs on a bank, a walkway of planks behind on posts; the run is a walk block */
function zdLogs(x0,x1,z,h){const wd=P('wood');for(let x=x0;x<=x1+1e-6;x+=.36){const hh=h+rr(-.25,.25);cyl('log',x,0,z,.17,hh,wd,7);cone('log',x,hh,z,.17,.4,P('woodD'),7);}
 for(const y of [1.0,h-.6])box('log',(x0+x1)/2,y,z-.22,x1-x0+.2,.14,.12,P('woodD'));}
function zdBlock(x0,x1,z0,z1,y0,y1){const a=cvW(x0,y0,z0),b=cvW(x1,y1,z1);KWALK.block([Math.min(a[0],b[0]),Math.max(a[0],b[0]),Math.min(a[2],b[2]),Math.max(a[2],b[2]),a[1],b[1]],'built:palisade');}
defBuilding({key:'zj_palisade',name:'Palisade (a run)',seed:5108,cls:'infrastructure',tags:{types:['infrastructure'],wealth:'poor',style:'wooden'},w:13,d:4,h:4.4,front:{x:0,z:1.0},
 note:'sharpened kipuka logs on an earth bank, a plank walkway behind on posts; one 12 m run, placed end to end round the outpost',
 build(o){box('earth',0,0,0,12.6,.4,1.6,P('earth'));zdLogs(-6,6,.2,3.6);
  for(let x=-5.4;x<=5.5;x+=1.8)cyl('log',x,0,-1.0,.08,2.2,P('woodD'),6);box('plank',0,2.2,-1.0,12.2,.08,1.0,P('wood'));
  zdBlock(-6.2,6.2,-.05,.45,0,3.6);}});

/* the gate: two log towers, a lintel walkway over the gateway with a roof, a pair of plank leaves standing open; the towers
   are walk blocks, the gateway (3 m) open */
defBuilding({key:'zj_gate',name:'The outpost\'s gate',seed:5109,cls:'infrastructure',tags:{types:['infrastructure'],wealth:'poor',style:'wooden'},w:12,d:5,h:8,
 note:'two log towers either side of a 3 m gateway, a roofed walkway over it, the leaves standing open',
 build(o){const wd=P('woodD');
  for(const s of [-1,1]){const x=s*3.0;W(x,0,0,0,()=>{for(const [dx,dz] of [[-1.2,-1.2],[1.2,-1.2],[-1.2,1.2],[1.2,1.2]])cyl('log',dx,0,dz,.2,6.2,wd,8);
    for(const dz of [-1.2,1.2])for(let k=-1;k<=1;k++)cyl('log',k*.4,0,dz,.17,4.2,P('wood'),7);for(const dx of [-1.2,1.2])for(let k=-1;k<=1;k++)cyl('log',dx,0,k*.4,.17,4.2,P('wood'),7);
    box('plank',0,4.2,0,2.8,.12,2.8,P('wood'));zfCone('thatch',0,6.0,0,2.3,1.9,P('thatch'));});
   zdBlock(x-1.45,x+1.45,-1.45,1.45,0,4.2);
   W(s*1.5,0,.6,s*1.25,()=>{box('plank',-s*.75,0,0,1.5,3.2,.1,P('wood'));for(const y of [.6,2.4])box('log',-s*.75,y,.08,1.4,.12,.08,wd);});}
  box('log',0,4.2,0,4.6,.3,.5,wd);box('plank',0,4.5,0,4.6,.08,2.4,P('wood'));for(const z of [-1.1,1.1])box('log',0,5.4,z,4.6,.1,.1,wd);
  plane4('thatch',[-2.4,6.2,0],[2.4,6.2,0],[-2.4,5.6,1.5],.1,P('thatch'));plane4('thatch',[2.4,6.2,0],[-2.4,6.2,0],[2.4,5.6,-1.5],.1,P('thatch'));
  sock('emblem',0,3.3,.3,0,{w:1.0,h:1.0});zdPole(3.0,6.9,0,1.0);door(0,0,0,0,3.0);}});
