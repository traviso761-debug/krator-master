// prefix: cy
// ================================================================= THE TIERHOUNDS (Lok-Hau): the Kingdom of the Tiers
// PLAN.md section 2: Masuleh's rule on a canyon wall (each row's roofs the lane of the row above: core/hamlet's
// 36-hamlet-terrace.js lays it), with ancient Indo-European touches, not Persian (the owner, 2026-11-16): the MEGARON for the
// halls and the rich houses (a porch between the wall-ends with two posts, the hall behind with its round hearth under a smoke
// hole and the high seat beside it), TIMBER-LACED brick (beams every few courses, their ends showing), Phrygian rock-cut
// facades, the corbelled tholos, terraced gardens on stone risers with their channels and the carved band.
// Every row piece is one storey: its roof's top at CY_TIER.STEP, its back to the hill (-z), its front (+z) on the lane.
//   cyLace(ax,az,bx,bz,ys,holes,t)   timber lacing on a wall line's outer face (cyWall's frame: the line's left), one beam a
//                                    height in ys, broken at the openings (holes as cyWall takes them); the cross-beams' ends
//   cyLacedRing(x0,z0,x1,z1,h,o)     cyRing, laced on the sides o.lace names (a string of s, e, n, w)
//   cyMegaron(o)                     a megaron in the box o.W x o.D (front +z): the porch o.porch deep between the antae and its
//                                    two posts, the cross wall's ear door, the hall with its round hearth (o.hearthR, four posts
//                                    round it when o.posts4), the high seat, the flat roof with its smoke hole; o.H the walls,
//                                    o.lace the laced sides; returns {top, hall {x0,x1,z0,z1}}
//   cyLedge(o,tier)                  a ledge house in the row: poor (one room), middling (a room and its store), rich (a megaron)
//   cy_ledge_poor, _mid, _rich       the row's houses (5, 7 and 9 m wide, 6 m deep, 3.2 m to the roof's top)
//   cy_stair_lane                    the cut stair between two rows: a solid flight up to a landing flush with the row's roofs
//   cy_terrace_wall                  a terrace garden the row's width (o.w): the stone riser with its carved band and the
//                                    channel along its head, the garden on top (the lane above)
//   cy_spring_hall                   the king's house over the spring at the canyon head: the pool hall in the podium, the
//                                    megaron on it, the stair up its face, the stores in jars along the pool
//   cy_treasury                      a corbelled tholos for the toll: the passage, the lintel and its relieving stone, the chamber
//   cy_council                       the Kingdom's council: a megaron with four posts round the hearth and benches
//   cy_rock_facade                   a Phrygian rock-cut face on a scarp: the carved gable over a niche, the geometric relief, the
//                                    name band (o.kind 'shrine': the stele in the niche; 'tomb': a false door)
const CY_TIER={STEP:3.2,DEPTH:6,ROOF:.24,LACE:[.95,1.95]};
const CY_TIER_TAGS=(w,type,role,job)=>({types:[type||'dwelling-single'],wealth:w,style:'tier',role:role||'house',job});
const CY_TIER_TEXT='Lōk-Hau Kām. Hau-Gèl Tōng.';
function cyLace(ax,az,bx,bz,ys,holes,t){const L=Math.hypot(bx-ax,bz-az);if(L<.1)return;const yaw=Math.atan2(az-bz,bx-ax),zf=t/2+.014;
 const hs=(holes||[]).map(q=>({a:q.at-q.w/2,b:q.at+q.w/2,y0:q.y||0,y1:(q.y||0)+q.h}));
 W((ax+bx)/2,0,(az+bz)/2,yaw,()=>{svNoWalk(()=>{const X=s=>s-L/2;
  for(const y of ys){const cut=hs.filter(q=>q.y0<y+.14&&q.y1>y).map(q=>[q.a,q.b]).sort((p,q)=>p[0]-q[0]);let s=0;
   const run=(a,b)=>{if(b-a<.05)return;box('timber',X((a+b)/2),y,zf,b-a,.13,.028,P('timber'));
    for(let e=a+.35;e<b-.2;e+=1.1)box('timber',X(e),y+.005,zf+.03,.11,.12,.06,P('wood'));};
   for(const c of cut){run(s,Math.max(s,c[0]-.05));s=Math.max(s,c[1]+.05);}run(s,L);}});});}
function cyLacedRing(x0,z0,x1,z1,h,o){o=o||{};cyRing(x0,z0,x1,z1,0,h,o);const t=o.t==null?CY.WALL:o.t,e=t/2,H=o.holes||{},lace=o.lace||'',ys=o.ys||CY_TIER.LACE;
 const side=(k,ax,az,bx,bz)=>{if(lace.indexOf(k)<0||(o.skip||'').indexOf(k)>=0)return;cyLace(ax,az,bx,bz,ys,(H[k]||[]).map(q=>Object.assign({},q,{at:q.at+e})),t);};
 side('s',x0-e,z1,x1+e,z1);side('e',x1,z1+e,x1,z0-e);side('n',x1+e,z0,x0-e,z0);side('w',x0,z0-e,x0,z1+e);}
/* the front's roof beam ends and its spout: the lane above drains forward */
function cyRoofFront(w,z,y){svNoWalk(()=>{const n=Math.max(2,Math.round(w/.7));for(let i=0;i<n;i++)cyl('timber',-w/2+(i+.5)*w/n,y-.2,z+.05,.07,.14,P('timber'),7);
 box('timber',w/2-.6,y-.08,z+.12,.16,.1,.3,P('timber'));});}
function cyMegaron(o){o=o||{};const Wd=o.W,Dd=o.D,t=CY.WALL,Hh=o.H,por=o.porch==null?1.8:o.porch;
 const x0=-Wd/2+t/2,x1=Wd/2-t/2,z0=-Dd/2+t/2,zc=Dd/2-por;
 /* the hall: its south side is the cross wall, the ear door in its middle */
 cyLacedRing(x0,z0,x1,zc,Hh,{holes:{s:cyEarHoles((x1-x0)/2,1.1,CY.DOOR_H+.1)},lace:o.lace||'ens',skip:o.skip||''});
 cyEarDoor(0,zc,0,1.1,CY.DOOR_H+.1,{name:o.doorName||'the hall door'});
 /* the antae: the side walls run on to the front, cased in timber at their heads; the porch's two posts on stone bases */
 for(const s of [-1,1]){const x=s>0?x1:x0;cyWall(x,zc+t/2,x,Dd/2,0,Hh,{inner:0});
  box('timber',x,0,Dd/2-.12,t+.08,Hh,.24,P('timber'));
  if((o.lace||'ens').indexOf(s>0?'e':'w')>=0){if(s>0)cyLace(x,Dd/2,x,zc+t/2,CY_TIER.LACE,[],t);else cyLace(x,zc+t/2,x,Dd/2,CY_TIER.LACE,[],t);}
  cyl('stone',s*Wd/6,0,Dd/2-.45,.3,.22,P('stone'),12);cyl('timber',s*Wd/6,.22,Dd/2-.45,.17,Hh-.22,P('timber'),10);
  cyl('timber',s*Wd/6,Hh-.24,Dd/2-.45,.26,.24,P('timber'),10);}
 box('floor',0,0,(zc+Dd/2)/2,Wd-2*t,.06,Dd/2-zc,P('stone'));
 const hx0=x0+t/2,hx1=x1-t/2,hz0=z0+t/2,hz1=zc-t/2,hc=(hz0+hz1)/2,R=o.hearthR==null?.9:o.hearthR;
 box('floor',0,0,hc,hx1-hx0,.06,hz1-hz0,P('floor'));
 /* the round hearth, its painted rim, the four posts round it, the high seat on the east wall */
 svNoWalk(()=>{cyl('lime',0,0,hc,R,.2,P('lime'),20);cyl('ash',0,.2,hc,R-.16,.012,P('ash'),18);
  for(let i=0;i<10;i++){const a=i/10*TAU;box('plain',Math.cos(a)*(R-.02),.08,hc+Math.sin(a)*(R-.02),.22,.06,.03,P('red'),-a);}});
 smokeAt(0,.5,hc,{r:.3,kind:'fire'});
 if(o.posts4)for(const sx of [-1,1])for(const sz of [-1,1]){const px=sx*(R+.9),pz=hc+sz*(R+.9);cyl('stone',px,0,pz,.26,.18,P('stone'),12);cyl('timber',px,.18,pz,.16,Hh-.18,P('timber'),10);}
 box('wood',hx1-.5,0,hc,.8,.5,1.0,P('wood'));box('wood',hx1-.12,.5,hc,.16,.9,1.0,P('wood'));box('hide',hx1-.5,.5,hc,.7,.04,.9,P('hide'));
 /* the roof: flush over the box, its smoke hole over the hearth, a kerb round it */
 const hole={x0:-.6,x1:.6,z0:hc-.6,z1:hc+.6},yr=Hh,top=cyRoof(-Wd/2,-Dd/2,Wd/2,Dd/2,yr,{flush:true,hole:o.smokeHole===false?null:hole});
 if(o.smokeHole!==false)cyHatchFrame(hole,top,'');
 cyRoofFront(Wd,Dd/2,top);
 cyTarget(0,.06,hc+R+.5,'the hall');
 return {top,hall:{x0:hx0,x1:hx1,z0:hz0,z1:hz1},hc};}
/* a ledge house: the box w x 6 m, its walls to 2.96 m, the roof's top at 3.2 */
function cyLedge(o,tier){o=o||{};const Wd=o.w,Dd=CY_TIER.DEPTH,t=CY.WALL,Hh=CY_TIER.STEP-CY_TIER.ROOF;
 if(tier==='rich'){cyMegaron({W:Wd,D:Dd,porch:1.7,H:Hh,hearthR:.7,lace:o.rec?'s':'ens',skip:'',doorName:'the house door'});return;}
 const x0=-Wd/2+t/2,x1=Wd/2-t/2,z0=-Dd/2+t/2,z1=Dd/2-t/2,IW=x1-x0-t,ID=z1-z0-t,dx=tier==='mid'?-Wd/2+1.6:-.6,wx=tier==='mid'?.2:Wd*.72-Wd/2;
 const sh=[...cyEarHoles(dx-x0,.9,CY.DOOR_H),{at:wx-x0,w:.7,y:1.05,h:.75}];
 cyLacedRing(x0,z0,x1,z1,Hh,{holes:{s:sh},lace:o.rec?'s':'esw'});
 cyEarDoor(dx,z1,0,.9,CY.DOOR_H,{name:'the house door'});
 svNoWalk(()=>{for(let i=0;i<3;i++)box('wood',wx-.24+i*.24,1.05,z1,.04,.75,.05,P('wood'));box('timber',wx,1.8,z1,.9,.1,t+.04,P('timber'));});
 box('floor',0,0,0,IW,.06,ID,P('floor'));
 const xs=tier==='mid'?x1-2.3:x1;
 if(tier==='mid'){cyWall(xs,z0+t/2,xs,z1-t/2,0,Hh,{inner:0,t:.26,socle:0,holes:cyEarHoles(ID/2+.6,.8,1.9)});
  box('floor',(xs+.13+x1-t/2)/2,0,0,x1-xs-t/2-.13,.06,ID,P('floor'));
  for(let i=0;i<4;i++)cyJar(xs+.5+(i%2)*.8,-ID/2+.5+Math.floor(i/2)*.7,{h:.8,r:.26});cyBin(x1-t/2-.4,ID/2-.6,-PI/2);
  cyQuern(xs-.8,-ID/2+.5,0);}
 const rx=(x0+xs)/2;
 cyPlatform(x0+t/2,z0+t/2,xs-(tier==='mid'?.13:t/2),z0+t/2+1.0,.36,{col:P('mudL')});
 box('hide',rx,.37,z0+t/2+.5,Math.min(2.2,xs-x0-1),.04,.8,P('hide'));
 cyHearth(rx+.3,.2,{r:.36});cyBin(x0+t/2+.35,.7,PI/2);cyJar(x0+t/2+.35,1.5,{h:.7});
 const top=cyRoof(-Wd/2,-Dd/2,Wd/2,Dd/2,Hh,{flush:true});
 svNoWalk(()=>{cyl('render',x0+.5,top,z0+.5,.22,.55,P('mudL'),10);});
 cyRoofFront(Wd,Dd/2,top);
 cyTarget(rx,.06,.6,'floor');}
defBuilding({key:'cy_ledge_poor',name:'Tier ledge house (one room)',seed:9901,cls:'building',kind:'house',frag:'kits/coyote',
 tags:CY_TIER_TAGS('poor'),w:5,d:6,h:3.2,budget:30000,cut:true,front:{x:-.6,z:3,yaw:0},
 note:'a Tierhound house in its row: one room behind a timber-laced front, the ear door and a latticed window on the lane; its roof the lane of the row above',
 build(o){cyLedge(Object.assign({w:5},o||{}),'poor');}});
defBuilding({key:'cy_ledge_mid',name:'Tier ledge house (a room and its store)',seed:9902,cls:'building',kind:'house',frag:'kits/coyote',
 tags:CY_TIER_TAGS('middle'),w:7,d:6,h:3.2,budget:36000,cut:true,front:{x:-1.9,z:3,yaw:0},
 note:'a middling Tierhound house: the room and a store of jars through an inner ear door, a quern, the laced front; its roof the lane above',
 build(o){cyLedge(Object.assign({w:7},o||{}),'mid');}});
defBuilding({key:'cy_ledge_rich',name:'Tier ledge house (a small megaron)',seed:9903,cls:'building',kind:'house',frag:'kits/coyote',
 tags:CY_TIER_TAGS('rich'),w:9,d:6,h:3.2,budget:45000,cut:true,front:{x:0,z:3,yaw:0},
 note:'a rich Tierhound house: a small megaron, its porch between the wall-ends and two posts on the lane, the hall behind with the round hearth and the high seat; the roof the lane above, the smoke hole kerbed',
 build(o){cyLedge(Object.assign({w:9},o||{}),'rich');}});
defBuilding({key:'cy_stair_lane',name:'Tier stair lane (cut between two rows)',seed:9904,cls:'building',kind:'stair',frag:'kits/coyote',
 tags:{types:['infrastructure'],style:'tier',role:'stair'},w:2.4,d:6,h:3.2,budget:12000,front:{x:0,z:3,yaw:0},
 note:'the stair cut between two rows: solid steps from the lane up to a landing flush with the row\'s roofs, where the next flight starts; a runnel down its side',
 build(o){const S=CY_TIER.STEP,Dd=CY_TIER.DEPTH,L=1.6,run=Dd-L;
  svStair(0,Dd/2,0,S,PI,{style:'solid',w:2.2,run,mk:'stone',col:P('stone')});
  /* the landing's mass is drawn past the box reader (a block there stops a walker a radius short of the flight's head): its top is the floor */
  svNoWalk(()=>box('stone',0,0,-Dd/2+L/2,2.4,S,L,P('stone')));wkPad(0,-Dd/2+L/2,2.4,L,S);
  svNoWalk(()=>{beam('stone',[1.06,.06,Dd/2],[1.06,S+.02,-Dd/2+L],.06,P('stone'),false,0,.14);});
  cyTarget(0,S,-Dd/2+L/2,'the landing');}});
defBuilding({key:'cy_terrace_wall',name:'Tier terrace garden (riser, channel and band)',seed:9905,cls:'building',kind:'garden',frag:'kits/coyote',
 tags:{types:['farm'],wealth:'poor',style:'tier',role:'garden',job:'farming'},w:4,d:6,h:3.4,budget:16000,front:{x:0,z:3,yaw:0},
 note:'a terrace garden in a row: the stone riser on the lane below with the carved band (its text the record\'s) and the channel along its head, beans and vines on the earth behind; its top the lane above',
 build(o){o=o||{};const w=o.w==null?4:o.w,S=CY_TIER.STEP,Dd=CY_TIER.DEPTH,zr=Dd/2-.3;
  box('stone',0,0,zr,w,S-.2,.6,P('stone'));
  box('slab',0,S-.2,Dd/2-.075,w,.2,.15,P('stone'));box('slab',0,S-.2,Dd/2-.525,w,.2,.15,P('stone'));
  box('water',0,S-.12,zr,w-.02,.02,.3,new THREE.Color(.3,.42,.44));
  box('gravel',0,0,-.3,w,S-.08,Dd-.6,P('gravel'));box('floor',0,S-.08,-.3,w,.08,Dd-.6,P('floor'));
  if(w>=1.2){svNoWalk(()=>{const n=Math.max(1,Math.floor(w/1.1));for(let i=0;i<n;i++)for(let j=0;j<3;j++){const x=-w/2+(i+.5)*w/n,z=-2.2+j*1.5;
    pole('wood',[x,S,z],[x,S+1.1,z],.025,P('wood'),5);box('plain',x,S+.15,z,.5,.75,.4,new THREE.Color(.33+rr(-.04,.04),.45,.22));}});
   if(w>=2.2){const C=cyContour(o.text==null?CY_TIER_TEXT:o.text),segs=cyCarve(C,0,1.75,Dd/2,w-.6,.7,{lw:.035});if(CURREC)CURREC.carving={text:C.text,hash:C.hash,segs};}}}});
/* ---------------------------------------------------------------- the king's house over the spring */
defBuilding({key:'cy_spring_hall',name:'Spring hall (the king\'s megaron over the spring)',seed:9906,cls:'building',kind:'palace',frag:'kits/coyote',
 tags:CY_TIER_TAGS('rich','civic','palace'),w:14,d:20.6,h:8.6,budget:140000,cut:true,front:{x:-6.6,z:10.3,yaw:0},
 note:'the king\'s house at the canyon head: a podium of dressed stone over the spring, the pool hall in it behind an ear door, the stores in jars along the pool; on the podium a megaron (porch, two posts, the hall with its round hearth, four posts and the high seat); the stair up the podium\'s face; the name band on the podium',
 build(o){o=o||{};const S=CY_TIER.STEP,t=CY.WALL,PW=13,PD=18.4,pz0=-10.3,pz1=pz0+PD,pc=(pz0+pz1)/2;
  /* the podium: the pool hall's walls, its roof the terrace */
  cyRing(-PW/2+t/2,pz0+t/2,PW/2-t/2,pz1-t/2,0,S-.3,{mk:'stone',socle:0,plaster:false,holes:{s:cyEarHoles(PW/2-t/2+2.2,1.3,2.3)}});
  cyEarDoor(2.2,pz1-t/2,0,1.3,2.3,{stone:true,name:'the pool hall door'});
  box('floor',0,0,pc,PW-2*t,.06,PD-2*t,P('stone'));
  svNoWalk(()=>{box('stone',0,0,pc-1,6.4,.5,7,P('stone'));box('water',0,.38,pc-1,6,.02,6.6,new THREE.Color(.28,.42,.46));
   for(let i=0;i<8;i++){cyJar(-PW/2+t+.5,pz0+2+i*1.6,{h:.9,r:.3});cyJar(PW/2-t-.5,pz0+2+i*1.6,{h:.9,r:.3});}});
  for(const sx of [-1,1])for(const sz of [-1,1])box('stone',sx*4.2,0,pc-1+sz*4.6,.6,S-.3,.6,P('stone'));
  const ptop=cyRoof(-PW/2,pz0,PW/2,pz1,S-.3,{flush:true});
  cyTarget(-2,.06,pc+5,'the pool hall');
  /* the stair up the podium's face (along +x), its landing beside the door */
  svStair(-6.4,pz1+.6,0,ptop,PI/2,{style:'solid',w:1.2,run:4.3,mk:'stone',col:P('stone')});
  svNoWalk(()=>box('stone',-1.55,0,pz1+.6,1.3,ptop,1.2,P('stone')));wkPad(-1.55,pz1+.6,1.3,1.2,ptop);
  /* the name band on the podium's face */
  const C=cyContour(o.text==null?'Lōk-Hau Kām-Gèl. Hau-Tōng Lōk.':o.text),segs=cyCarve(C,4.9,1.2,pz1,2.6,.6,{lw:.035});
  if(CURREC)CURREC.carving={text:C.text,hash:C.hash,segs};
  /* the megaron on the podium */
  W(0,ptop,-1.5,0,()=>{cyMegaron({W:10,D:13.5,porch:2.4,H:4.2,hearthR:1.1,posts4:true,lace:'ens',doorName:'the king\'s hall door'});});}});
/* ---------------------------------------------------------------- the treasury: a corbelled tholos */
defBuilding({key:'cy_treasury',name:'Treasury (a corbelled tholos)',seed:9907,cls:'building',kind:'store',frag:'kits/coyote',
 tags:CY_TIER_TAGS('rich','civic','treasury'),w:9,d:14,h:6.4,budget:60000,cut:true,front:{x:0,z:7,yaw:0},
 note:'the toll\'s store: a beehive chamber of stone courses stepped in to a capstone, reached down a walled passage; the lintel and the relieving stone over the door carry the coyote\'s ears; jars, chests and bronze ingots inside',
 build(o){o=o||{};const R=3.4,T=.7,cz=-2.5,ga=.22;
  /* the chamber's courses (inside and out), open where the door stands */
  /* the cap's last ring stops short of the axis: a band closing on one point shades from a zero normal (black) */
  svNoWalk(()=>{const prof=[[R+T,0],[R+T,2.2],[R+T-.2,3.6],[R+T-.8,4.9],[R+T-1.9,5.9],[.35,6.38],[0,6.4]];
   const inner=[[R,0],[R,2.1],[R-.35,3.2],[R-1.0,4.2],[R-2.0,5.0],[.3,5.39],[0,5.4]];
   lathe('stone',0,cz,prof,22,P('stone'),{a0:PI/2+ga,a1:PI/2+TAU-ga});
   lathe('stone',0,cz,inner,22,P('stone'),{a0:PI/2+ga,a1:PI/2+TAU-ga,inward:true});
   lathe('stone',0,cz,prof.slice(2),22,P('stone'),{a0:PI/2-ga,a1:PI/2+ga});
   lathe('stone',0,cz,inner.slice(2),22,P('stone'),{a0:PI/2-ga,a1:PI/2+ga,inward:true});});
  box('floor',0,0,cz,4.7,.06,4.7,P('stone'));
  /* the door's wall in the ring's gap, the ear door in it, the relieving stone over the lintel */
  const zf=cz+R+T/2-.1;
  cyWall(-1.6,zf,1.6,zf,0,3.7,{mk:'stone',socle:0,inner:0,t:T+.2,holes:cyEarHoles(1.6,1.2,2.2)});
  cyEarDoor(0,zf,0,1.2,2.2,{stone:true,name:'the treasury door'});
  svNoWalk(()=>{[1.3,.86,.42].forEach((w,i)=>box('carve',0,2.76+i*.26,zf+(T+.2)/2+.02,w,.24,.04,P('carve')));});
  /* the passage: two walls from the door out to the front */
  for(const s of [-1,1])cyWall(s*1.25,zf+.4,s*1.25,7,0,2.4,{mk:'stone',socle:0,inner:0,t:.5});
  box('floor',0,0,(zf+7)/2,2,.06,7-zf,P('stone'));
  /* the toll: jars, chests, ingot stacks */
  for(let i=0;i<7;i++){const a=PI*(.85+i*.18);cyJar(Math.cos(a)*(R-.5),cz+Math.sin(a)*(R-.5),{h:.85,r:.28});}
  for(const s of [-1,1]){box('wood',s*1.6,0,cz-1.2,.9,.6,.6,P('wood'));box('timber',s*1.6,.6,cz-1.2,.95,.06,.65,P('timber'));
   for(let k=0;k<3;k++)box('plain',s*.7,.06+k*.08,cz+.4,.5,.07,.24,new THREE.Color(.62,.44,.22));}
  cyTarget(0,.06,cz,'the chamber');}});
/* ---------------------------------------------------------------- the council: a megaron */
defBuilding({key:'cy_council',name:'Council megaron',seed:9908,cls:'building',kind:'hall',frag:'kits/coyote',
 tags:CY_TIER_TAGS('middle','civic','council'),w:10,d:14,h:4.9,budget:70000,cut:true,front:{x:0,z:7,yaw:0},
 note:'the Kingdom\'s council: a megaron with its porch and two posts, the hall\'s four posts round the round hearth, benches along the walls, the king\'s high seat; the laced walls and the name band over the porch',
 build(o){o=o||{};const M=cyMegaron({W:10,D:14,porch:2.4,H:4.4,hearthR:1.0,posts4:true,lace:'ens',doorName:'the council door'}),h=M.hall;
  for(const s of [-1,1])box('lime',s>0?h.x1-.3:h.x0+.3,0,(h.z0+h.z1)/2-.6,.6,.45,h.z1-h.z0-2.4,P('lime'));
  box('lime',(h.x0+h.x1)/2-1,0,h.z0+.3,h.x1-h.x0-3,.45,.6,P('lime'));
  const C=cyContour(o.text==null?'Lōk-Hau Kām. Hau-Tōng.':o.text),segs=cyCarve(C,0,3.3,7-2.4+CY.WALL/2+.01,5,.55,{lw:.035});
  if(CURREC)CURREC.carving={text:C.text,hash:C.hash,segs};}});
/* ---------------------------------------------------------------- a Phrygian rock-cut face */
defBuilding({key:'cy_rock_facade',name:'Rock-cut facade (Phrygian, on a scarp)',seed:9909,cls:'building',kind:'shrine',frag:'kits/coyote',
 tags:{types:['religious'],wealth:'middle',style:'tier',role:'shrine'},w:10,d:4.6,h:12,budget:40000,cut:true,front:{x:0,z:2.3,yaw:0},
 note:'a face cut in the canyon\'s rock: a gable carved over a tall panel of geometric relief, a niche at its foot (a shrine\'s stele, or a tomb\'s false door), the name band under the gable; set on a scarp by the host (o.kind shrine or tomb)',
 build(o){o=o||{};const tomb=o.kind==='tomb',Wd=10,Dd=4.6,Hh=12,zf=Dd/2-.6,pw=6.4,ph=6.0,py=3.0;
  /* the scarp block, cut back for the face */
  box('rock',0,0,(zf-Dd/2)/2,Wd,Hh,zf+Dd/2,P('rock'));
  box('rock',-(pw/2+.8+(Wd/2-pw/2-.8)/2),0,zf+.3,Wd/2-pw/2-.8,Hh,.6,P('rock'));box('rock',pw/2+.8+(Wd/2-pw/2-.8)/2,0,zf+.3,Wd/2-pw/2-.8,Hh,.6,P('rock'));
  box('rock',0,py+ph+2.4,zf+.3,pw+1.6,Hh-py-ph-2.4,.6,P('rock'));
  /* the frame, the gable and its acroterion, the relief panel */
  svNoWalk(()=>{for(const s of [-1,1])box('carve',s*(pw/2+.35),0,zf+.15,.5,py+ph,.3,P('carve'));
   box('carve',0,py+ph,zf+.15,pw+1.2,.4,.3,P('carve'));
   for(const s of [-1,1])beam('carve',[s*(pw/2+.6),py+ph+.4,zf+.15],[0,py+ph+2.3,zf+.15],.3,P('carve'),false,0,.36);
   cyl('carve',0,py+ph+2.2,zf+.15,.35,.5,P('carve'),10);
   for(let i=0;i<6;i++)for(let j=0;j<7;j++){const x=-pw/2+.55+i*(pw-1.1)/5,y=py+.6+j*(ph-1)/6,k=(i+j)%2;
    box('carve',x,y,zf+.02,k?.7:.4,k?.4:.7,.06,P('carve'));}
   box('carve',0,py-.1,zf+.06,pw,.12,.12,P('carve'));});
  /* the niche and what stands in it */
  box('plain',0,.1,zf+.01,1.8,2.4,.02,new THREE.Color(.16,.13,.1));
  if(tomb){box('carve',0,.1,zf-.05,1.4,2.2,.08,P('carve'));for(const s of [-1,1])box('carve',s*.4,1.1,zf+.01,.04,.04,.03,P('stone'));}
  else{box('slab',0,.1,zf+.15,.7,1.7,.22,P('stone'));cyBird(0,1.2,zf+.27,.5);box('stone',0,0,zf+.3,1.4,.5,.5,P('stone'));
   for(const s of [-1,1])cyJar(s*.5,zf+.3,{y:.5,h:.25,r:.12});}
  const C=cyContour(o.text==null?'Hau-Gèl Lōk. Kām-Tōng.':o.text),segs=cyCarve(C,0,py+ph+.55,zf+.31,pw-.6,.5,{lw:.04});
  if(CURREC)CURREC.carving={text:C.text,hash:C.hash,segs};}});
