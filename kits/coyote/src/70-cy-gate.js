// prefix: cy
// ================================================================= THE GATE (Hattusa and Derbent): curtain, tower, postern, toll gate, water gate, citadel, fodder pit
// PLAN.md sections 2, 3 and 9 (C6); biomes/outlandgate/PLAN.md sections 5 and 9. The Tierhounds close the Outland Gate's
// Narrows with a long wall after Derbent and a toll fort after Hattusa: battered stone socles, timber-laced mud-brick
// curtains and bastion towers with rounded/stepped merlons, a corbelled postern tunnel under the curtain, a toll gate flanked
// by guardian coyote-head protomes with its customs court, weighing floor and toll-keeper's room behind, a water gate of
// corbelled culverts and bronze-shod grilles over the river, a shoulder citadel and a fodder-burning pit under the seed law.
// Older stretches stand in slumped ruin states (v = 1), their fallen blocks seated on their rotated extents and watched by
// core/ruins (KRUINS.watch in 91z-cy-world.js).
const CY_GATE={WALK:4.8,SLAB:.24,DEPTH:3.8,SOCLE:1.6};
const CY_RUINS=[];
/* seat a fallen block so its lowest rotated corner lies `sink` m below local ground gy (core/ruins README: -1.0 .. +0.3 m) */
function cyRuinBlock(mk,x,z,sx,sy,sz,ry,rx,rz,col,gy,sink){
 gy=gy==null?0:gy;sink=sink==null?.08:sink;
 const m=TF(0,0,0,ry||0,rx||0,rz||0),e=m.elements;
 const hy=.5*(Math.abs(e[1])*sx+Math.abs(e[5])*sy+Math.abs(e[9])*sz);
 svNoWalk(()=>box(mk,x,gy-sink+hy-sy/2,z,sx,sy,sz,col,ry,rx,rz));}
/* register a ruined placement's world footprint so 91z-cy-world.js hands it to KRUINS.watch after the buckets flush */
function cyRuinWatch(label,w,d){
 if(PLACE_DRY||!CURREC)return;
 const org=new THREE.Vector3().applyMatrix4(CM),e=CM.elements,ry=Math.atan2(e[8],e[10]);
 CY_RUINS.push({name:label+' ('+CURREC.key+' @ '+Math.round(org.x)+','+Math.round(org.z)+')',x:org.x,y:org.y,z:org.z,ry,w,d});}
/* Hattusa's stepped/rounded mud-brick merlons along x0..x1 at z, base y */
function cyMerlons(x0,x1,y,z,t){
 const span=x1-x0,n=Math.max(2,Math.round(span/1.55));
 svNoWalk(()=>{for(let i=0;i<n;i++){const cx=x0+(i+.5)*span/n;
  box('render',cx,y,z,.92,.34,t,P('mud'));box('render',cx,y+.34,z,.64,.18,t-.04,P('mudL'));}});}
/* Hattusa Lion-Gate style guardian coyote-head protome emerging +z from a dressed jamb block */
function cyCoyoteProtome(x,y,z){
 W(x,y,z,0,()=>{svNoWalk(()=>{
  box('slab',0,-.55,-.28,.78,1.25,.64,P('stone'));
  /* chest ruff and shoulders */
  box('carve',0,-.32,.08,.62,.62,.28,P('carve'));
  /* skull, brow ridge and tapered muzzle with bared fangs */
  ellip('carve',0,.34,.18,.28,.24,.3,P('carve'),0,10);
  WX(0,.26,.44,0,.14,0,()=>{box('carve',0,-.06,0,.24,.18,.38,P('carve'));box('carve',0,-.14,.02,.2,.07,.32,P('stone'));
   for(const s of [-1,1])cone('bone',s*.07,-.14,.14,.022,.07,P('bone'),5);});
  /* pricked coyote ears */
  for(const s of [-1,1])WX(s*.17,.56,.1,0,-.12,-s*.16,()=>{cone('carve',0,0,0,.09,.34,P('carve'),6);});});});}
/* rear stone stair climbing along +x to the y = 4.8 wall-walk, its landing flush with the walk */
function cyWallStair(xFoot,zRear){
 const Y=CY_GATE.WALK,run=5.2,lw=1.3;
 svStair(xFoot,zRear,0,Y,PI/2,{style:'solid',w:1.1,run,mk:'stone',col:P('stone')});
 svNoWalk(()=>box('stone',xFoot+run+lw/2,0,zRear,lw,Y,1.15,P('stone')));
 wkPad(xFoot+run+lw/2,zRear,lw,1.15,Y);
 return {x0:xFoot+run-.05,x1:xFoot+run+lw+.05};}

/* ---------------------------------------------------------------- 1. Curtain run (whole v=0, slumped older stretch v=1) */
defBuilding({key:'cy_wall_run',name:'Gate curtain wall run (Hattusa and Derbent)',seed:9951,cls:'building',kind:'wall',frag:'kits/coyote',
 tags:{types:['military','infrastructure'],wealth:'middle',style:'tier',role:'wall'},w:16,d:5.6,h:6.4,budget:50000,front:{x:-5.6,z:-2.8,yaw:PI},
 note:'a curtain segment of the Gate long wall (o.w; v 0 whole, v 1 slumped older stretch watched by core/ruins): battered stone socle, timber-laced mud-brick body, contour-carved road band, wall-walk with Hattusa merlons, rear stone stair',
 build(o){o=o||{};const w=o.w==null?16:o.w,D=CY_GATE.DEPTH,Y=CY_GATE.WALK,S=CY_GATE.SOCLE,sl=CY_GATE.SLAB;
  if((o.v|0)===1){
   /* slumped older stretch: continuous socle and breached brick body touching as one main cluster on y=0, fallen blocks seated */
   const wL=w*.34,wM=w*.32,wR=w-wL-wM,xL=-w/2+wL/2,xM=-w/2+wL+wM/2,xR=w/2-wR/2;
   box('stone',xL,0,0,wL+.08,1.55,D+.16,P('stone'));box('stone',xM,0,0,wM+.12,1.15,D+.1,P('stone'));box('stone',xR,0,0,wR+.08,1.5,D+.16,P('stone'));
   box('render',xL,1.5,0,wL,1.95,D-.12,P('mudD'));box('render',xL-.4,3.4,0,wL*.65,.65,D-.28,P('mud'));
   box('render',xM,1.1,0,wM,.85,D-.24,P('mudD'));
   box('render',xR,1.45,0,wR,1.75,D-.12,P('mudD'));box('render',xR+.35,3.15,0,wR*.6,.6,D-.28,P('mud'));
   svNoWalk(()=>{for(const sx of [xL,xR])box('timber',sx,2.35,D/2-.02,w*.26,.13,.12,P('timber'));});
   /* fallen blocks seated on their rotated extents on both flanks of the breach */
   const debris=[[-1.8,2.25,1.25,.58,.82,.25,.22,-.14,'stone'],[.6,2.35,1.4,.62,.9,-.35,-.18,.24,'render'],
    [2.4,2.15,1.05,.5,.75,.5,.15,.18,'stone'],[-.7,-2.25,1.3,.55,.85,-.2,.24,-.16,'render'],[1.7,-2.15,1.1,.48,.72,.4,-.16,.2,'stone']];
   for(const d0 of debris)if(Math.abs(d0[0])<w/2-.8)cyRuinBlock(d0[8],d0[0],d0[1],d0[2],d0[3],d0[4],d0[5],d0[6],d0[7],P(d0[8]==='stone'?'stone':'mudD'),0,.08);
   if(o.watch!==false)cyRuinWatch('slumped curtain',w+1.2,D+2.2);
   return;}
  /* whole curtain: ground-level wall block (0..3.4 m) stops walkers below while leaving the stair head clear at 4.8 m */
  box('stone',0,0,0,w,S,D+.18,P('stone'));
  box('render',0,S,0,w,1.8,D,P('mud'));
  svNoWalk(()=>{box('slab',0,S-.14,D/2+.1,w,.16,.08,P('stone'));
   box('render',0,S+1.8,0,w,Y-sl-(S+1.8),D,P('mud'));});
  cyLace(-w/2,D/2,w/2,D/2,[2.3,3.5],[],.04);cyLace(w/2,-D/2,-w/2,-D/2,[2.3,3.5],[],.04);
  /* the wall-walk slab at y = 4.80 */
  box('roof',0,Y-sl,0,w,sl,D,P('roof'));
  /* front parapet and Hattusa merlons; rear kerb open where the stair lands */
  cyWall(-w/2,D/2-.18,w/2,D/2-.18,Y,.95,{t:.36,socle:0,inner:0});
  cyMerlons(-w/2+.2,w/2-.2,Y+.95,D/2-.18,.34);
  const wantStair=o.stair!==false&&w>=10;
  let gap=null;
  if(wantStair){gap=cyWallStair(-w/2+1.2,-D/2-.58);
   cyWall(-w/2,-D/2+.15,gap.x0,-D/2+.15,Y,.78,{t:.3,socle:0,inner:0});
   cyWall(gap.x1,-D/2+.15,w/2,-D/2+.15,Y,.78,{t:.3,socle:0,inner:0});}
  else cyWall(-w/2,-D/2+.15,w/2,-D/2+.15,Y,.78,{t:.3,socle:0,inner:0});
  if(w>=5){const C=cyContour(o.text==null?'Hau-Gèl Lōk-Hau. Tsēk!':o.text),cw=Math.min(w-1.4,9);
   box('slab',0,2.55,D/2+.02,cw+.4,.72,.06,P('stone'));
   const segs=cyCarve(C,0,2.65,D/2+.05,cw,.52,{lw:.032});
   if(CURREC)CURREC.carving={text:C.text,hash:C.hash,segs};}
  if(wantStair&&!o.rec)cyTarget(0,Y+.06,0,'the wall-walk');}});

/* ---------------------------------------------------------------- 2. Bastion tower (whole v=0, slumped v=1) */
defBuilding({key:'cy_wall_tower',name:'Gate wall tower (bastion and watch deck)',seed:9952,cls:'building',kind:'tower',frag:'kits/coyote',
 tags:{types:['military','infrastructure'],wealth:'middle',style:'tier',role:'tower'},w:7.6,d:8.4,h:9.2,budget:65000,cut:true,front:{x:0,z:-3.8,yaw:PI},
 note:'a Hattusa bastion tower projecting forward of the curtain (v 0 whole, v 1 slumped older tower watched by core/ruins): guard room below, open side portals at the wall-walk so the walk runs through, crenellated watch deck above',
 build(o){o=o||{};const t=CY.WALL,W0=7.6,z0=-3.8+t/2,z1=4.2-t/2,x0=-W0/2+t/2,x1=W0/2-t/2,Y=CY_GATE.WALK,sl=CY_GATE.SLAB,U=2.8;
  if((o.v|0)===1){
   box('stone',0,0,.2,W0+.24,1.75,8.0+.24,P('stone'));
   box('render',-.9,1.7,.2,W0-1.8,2.7,7.8,P('mudD'));
   box('render',1.6,1.7,-1.1,2.2,1.35,5.2,P('mudD'));
   box('render',-1.5,4.35,-.6,4.4,.85,5.8,P('mud'));
   svNoWalk(()=>{box('timber',-1.2,2.8,4.12,4.2,.14,.1,P('timber'));box('timber',2.1,2.4,1.6,.18,.18,2.6,P('timber'),.35,.22,0);});
   const wr=[[-2.4,4.55,1.35,.58,.88,.2,-.22,.16,'render'],[2.2,3.4,1.5,.64,.95,-.4,.26,-.2,'stone'],
    [3.1,.8,1.2,.52,.8,.65,-.18,.25,'render'],[.4,-4.15,1.3,.5,.78,-.15,.2,.14,'stone']];
   for(const d0 of wr)cyRuinBlock(d0[8],d0[0],d0[1],d0[2],d0[3],d0[4],d0[5],d0[6],d0[7],P(d0[8]==='stone'?'stone':'mudD'),0,.08);
   if(o.watch!==false)cyRuinWatch('slumped bastion tower',W0+2.2,9.4);
   return;}
  /* ground guard room: rear ear door on n (-z), arrow slits on s (+z) */
  const slits=[1.8,3.8-t/2,W0-t-1.8].map(a=>({at:a,w:.22,y:1.9,h:.85}));
  cyLacedRing(x0,z0,x1,z1,Y-sl,{socle:1.6,holes:{n:cyEarHoles((x1-x0)/2,1.0,CY.DOOR_H),s:slits},lace:'esnw',ys:[2.2,3.4]});
  cyEarDoor(0,z0,PI,1.0,CY.DOOR_H,{name:'the tower door'});
  box('floor',0,0,.2,W0-2*t,.06,8.0-2*t,P('floor'));
  cyHearth(1.8,-1.8,{r:.34});
  svNoWalk(()=>{for(let i=0;i<4;i++)pole('wood',[2.8,0,.4+i*.55],[2.65,1.95,.4+i*.55],.022,P('wood'),5);});
  /* dog-leg stair in the west half up to the wall-walk storey (y = 4.8) */
  const SC=svStairCase({x0:-3.15,x1:-.85,z0:-1.1,z1:3.3},[0,Y],{w:1.0,style:'open',mk:'timber',col:P('timber')});
  svWell('roof',0,Y-sl,.2,W0,sl,8.0,P('roof'),SC.wells[0]);
  /* wall-walk storey: open ear portals on e and w at z = 0 so adjacent curtain walks run straight through */
  W(0,Y,0,0,()=>{
   cyLacedRing(x0,z0,x1,z1,U-sl,{socle:0,holes:{e:cyEarHoles(z1,1.35,2.1),w:cyEarHoles(-z0,1.35,2.1),s:slits.map(q=>Object.assign({},q,{y:.85}))},lace:'esnw',ys:[1.1,2.0]});
   const ST2=svStair(2.05,-2.55,0,U,0,{style:'open',w:.85,run:3.1,mk:'timber',col:P('timber'),rail:'left'});
   svWell('roof',0,U-sl,.2,W0,sl,8.0,P('roof'),ST2);
   /* crenellated watch deck at y = 7.6 */
   W(0,U,0,0,()=>{
    cyRing(x0,z0,x1,z1,0,.85,{t:.32,socle:0,plaster:false});
    cyMerlons(-W0/2+.25,W0/2-.25,.85,z1,.3);cyMerlons(-W0/2+.25,W0/2-.25,.85,z0,.3);
    svNoWalk(()=>{cyl('bronze',-2.2,0,2.8,.28,.48,P('bronze'),10);cyl('ash',-2.2,.46,2.8,.22,.06,P('ash'),10);
     sph('glow',-2.2,.54,2.8,.08,new THREE.Color(1,.46,.12),.6,6);});});});
  if(!o.rec){cyTarget(1.6,.06,-1.6,'the guard room');cyTarget(1.6,Y+.06,-2.8,'the wall-walk chamber');cyTarget(-1.6,Y+U+.06,2.2,'the watch deck');}}});

/* ---------------------------------------------------------------- 3. Postern tunnel under the curtain (Hattusa Yerkapi) */
defBuilding({key:'cy_postern',name:'Gate postern tunnel (corbelled sally port)',seed:9953,cls:'building',kind:'postern',frag:'kits/coyote',
 tags:{types:['military','infrastructure'],wealth:'middle',style:'tier',role:'postern'},w:14,d:7.6,h:6.4,budget:55000,front:{x:0,z:3.6,yaw:0},
 note:'Hattusa corbelled postern tunnel under the curtain (o.w): a stone-vaulted sally passage through the wall base behind a bronze-strapped ear door, the wall-walk and merlons uninterrupted above, a rear stone stair',
 build(o){o=o||{};const w=o.w==null?14:o.w,D=CY_GATE.DEPTH,Y=CY_GATE.WALK,S=CY_GATE.SOCLE,sl=CY_GATE.SLAB,pw=1.5,ph=2.15;
  const sideW=(w-pw)/2-.25;
  /* left and right solid curtain cheeks (0..3.4 m walk blocks, upper 3.4..4.56 in svNoWalk) */
  for(const s of [-1,1]){const cx=s*(pw/2+.25+sideW/2);
   box('stone',cx,0,0,sideW,S,D+.18,P('stone'));
   box('render',cx,S,0,sideW,1.8,D,P('mud'));
   svNoWalk(()=>box('render',cx,S+1.8,0,sideW,Y-sl-(S+1.8),D,P('mud')));}
  /* tunnel jamb walls from z = -3.2 to +3.2, and stepped corbelled stone vault above ph (svNoWalk so walker clears ph) */
  for(const s of [-1,1])box('stone',s*(pw/2+.2),0,0,.4,ph,6.4,P('stone'));
  svNoWalk(()=>{
   for(let k=0;k<4;k++){const inset=k*.16,yy=ph+k*.22;
    for(const s of [-1,1])box('slab',s*(pw/2+.12-inset),yy,0,.44,.24,6.4,P('stone'));}
   box('slab',0,ph+.88,0,pw+.7,.32,6.4,P('stone'));
   box('render',0,ph+1.2,0,pw+.9,Y-sl-(ph+1.2),D,P('mud'));});
  /* outer sally portal (+z) with bronze-strapped ear door, inner portal (-z) open, stone floor through */
  cyWall(-1.35,3.0,1.35,3.0,0,ph+.75,{mk:'stone',socle:0,inner:0,t:.42,holes:cyEarHoles(1.35,1.2,CY.DOOR_H)});
  cyEarDoor(0,3.0,0,1.2,CY.DOOR_H,{stone:true,name:'the postern door'});
  svNoWalk(()=>{for(const yy of [.55,1.45])box('bronze',0,yy,3.12,1.12,.06,.04,P('bronze'));});
  box('floor',0,0,0,pw,.06,7.2,P('stone'));
  cyLace(-w/2,D/2,w/2,D/2,[3.5],[],.04);cyLace(w/2,-D/2,-w/2,-D/2,[3.5],[],.04);
  /* continuous wall-walk at y = 4.80 and rear stair on the east half */
  box('roof',0,Y-sl,0,w,sl,D,P('roof'));
  cyWall(-w/2,D/2-.18,w/2,D/2-.18,Y,.95,{t:.36,socle:0,inner:0});
  cyMerlons(-w/2+.2,w/2-.2,Y+.95,D/2-.18,.34);
  const wantStair=o.stair!==false&&w>=12;
  if(wantStair){const gap=cyWallStair(1.2,-D/2-.58);
   cyWall(-w/2,-D/2+.15,gap.x0,-D/2+.15,Y,.78,{t:.3,socle:0,inner:0});
   cyWall(gap.x1,-D/2+.15,w/2,-D/2+.15,Y,.78,{t:.3,socle:0,inner:0});}
  else cyWall(-w/2,-D/2+.15,w/2,-D/2+.15,Y,.78,{t:.3,socle:0,inner:0});
  const C=cyContour(o.text==null?'Sām-Gèl. Lōk-Hau.':o.text);
  const segs=cyCarve(C,0,3.1,3.22,2.2,.45,{lw:.028});
  if(CURREC)CURREC.carving={text:C.text,hash:C.hash,segs};
  if(!o.rec){cyTarget(0,.06,0,'the postern tunnel');cyTarget(0,.06,-3.3,'the inner sally apron');
   if(wantStair)cyTarget(-2.0,Y+.06,0,'the postern wall-walk');}}});

/* ---------------------------------------------------------------- 4. Toll gate (guardian coyote protomes, customs court, weighing floor) */
defBuilding({key:'cy_toll_gate',name:'Toll gate (coyote protomes and customs court)',seed:9954,cls:'building',kind:'gate',frag:'kits/coyote',
 tags:CY_TIER_TAGS('rich','civic','gate','customs'),w:18,d:22,h:9.6,budget:160000,cut:true,front:{x:0,z:10.6,yaw:0},
 note:'the Tierhound toll gate: two flanking bastion towers with carved coyote-head guardian protomes and a contour-carved lintel over the double gate; behind it the customs court, the raised weighing floor with its bronze balance scale, and the toll-keeper room',
 build(o){o=o||{};const t=CY.WALL,Y=CY_GATE.WALK,sl=CY_GATE.SLAB,U=3.0;
  /* curtain-line abutment wings at z = -1.9..+1.9, x = +-5.4..+-9.0 so adjacent curtain runs socket in at z = 0 */
  for(const s of [-1,1]){const cx=s*7.2,ww=3.6;
   box('stone',cx,0,0,ww,1.6,3.96,P('stone'));
   box('render',cx,1.6,0,ww,1.8,3.8,P('mud'));
   svNoWalk(()=>box('render',cx,3.4,0,ww,Y-sl-3.4,3.8,P('mud')));
   box('roof',cx,Y-sl,0,ww,sl,3.8,P('roof'));
   cyWall(cx-ww/2,1.72,cx+ww/2,1.72,Y,.95,{t:.36,socle:0,inner:0});
   cyMerlons(cx-ww/2+.15,cx+ww/2-.15,Y+.95,1.72,.34);}
  /* two flanking gate towers at x = +-5.1, z = +1.9..+10.1 (solid bastion bases + upper watch chambers) */
  for(const s of [-1,1]){const tx=s*5.1,tw=4.6,tz0=1.9,tz1=10.1,tzc=(tz0+tz1)/2,td=tz1-tz0;
   box('stone',tx,0,tzc,tw+.2,1.75,td+.2,P('stone'));
   box('render',tx,1.75,tzc,tw,Y-sl-1.75,td,P('mud'));
   cyLace(tx-tw/2,tz1,tx+tw/2,tz1,[2.4,3.6],[],.04);
   box('roof',tx,Y-sl,tzc,tw,sl,td,P('roof'));
   W(tx,Y,tzc,0,()=>{
    const hx0=-tw/2+t/2,hx1=tw/2-t/2,hz0=-td/2+t/2,hz1=td/2-t/2;
    const holes={s:[{at:(hx1-hx0)/2,w:.24,y:.9,h:.85}]};
    holes[s<0?'e':'w']=cyEarHoles(td/2-2.2,1.1,2.05);
    cyLacedRing(hx0,hz0,hx1,hz1,U-sl,{socle:0,holes,lace:'esnw',ys:[1.1,2.1]});
    const top=cyRoof(-tw/2,-td/2,tw/2,td/2,U-sl,{flush:true});
    cyMerlons(-tw/2+.2,tw/2-.2,top,td/2-.18,.3);});}
  /* the gate passage (x = -2.8..+2.8, clear 2.8 m between stone jambs; z = +1.9..+10.1) and the guardian coyote protomes */
  for(const s of [-1,1])box('slab',s*2.55,0,6.0,.5,3.6,8.2,P('stone'));
  cyWall(-2.8,9.75,2.8,9.75,0,Y-sl,{mk:'stone',socle:0,inner:0,t:.55,holes:cyEarHoles(2.8,2.6,2.95)});
  cyEarDoor(0,9.75,0,2.6,2.95,{stone:true,name:'the toll gate'});
  for(const s of [-1,1])cyCoyoteProtome(s*2.15,1.25,10.08);
  const C=cyContour(o.text==null?'Hau-Gèl Lōk-Hau. Kām-Tōng.':o.text);
  const segs=cyCarve(C,0,3.65,10.04,4.2,.58,{lw:.035});
  if(CURREC)CURREC.carving={text:C.text,hash:C.hash,segs};
  box('floor',0,0,6.0,4.6,.06,8.6,P('stone'));
  /* bridge deck over the gate passage at y = 4.80, uniting both wings and flanking towers end to end */
  svNoWalk(()=>{box('render',0,3.55,3.2,10.8,Y-sl-3.55,9.8,P('mud'));});
  box('roof',0,Y-sl,0,10.8,sl,3.8,P('roof'));
  box('roof',0,Y-sl,5.0,5.8,sl,6.4,P('roof'));
  cyWall(-2.8,8.02,2.8,8.02,Y,.95,{t:.34,socle:0,inner:0});cyMerlons(-2.6,2.6,Y+.95,8.02,.32);
  /* the walled customs court behind (-10.4 .. +1.9, x = -8.8 .. +8.8), open archway at z = -10.4 on the road */
  cyWall(-8.8+t/2,-10.4,-8.8+t/2,-1.9,0,3.3,{inner:1});
  cyWall(8.8-t/2,-1.9,8.8-t/2,-10.4,0,3.3,{inner:1});
  cyWall(8.8,-10.4+t/2,2.1,-10.4+t/2,0,3.3,{inner:1});
  cyWall(-2.1,-10.4+t/2,-8.8,-10.4+t/2,0,3.3,{inner:1});
  svNoWalk(()=>box('slab',0,3.05,-10.4+t/2,4.6,.35,t+.1,P('stone')));
  box('floor',0,0,-4.4,17.2,.04,12.6,P('gravel'));
  box('floor',0,0,-4.4,3.8,.06,12.8,P('stone'));
  /* west side of court: the raised stone weighing floor and great bronze balance scale */
  svNoWalk(()=>box('slab',-5.7,0,-5.8,4.2,.32,5.6,P('stone')));
  wkPad(-5.7,-5.8,4.2,5.6,.32);
  svStair(-3.6,-5.8,0,.32,-PI/2,{style:'solid',w:1.4,run:.45,mk:'stone',col:P('stone')});
  cyShade(-7.8,-8.6,-3.6,-3.0,3.0);
  svNoWalk(()=>{
   for(const sz of [-1,1])pole('timber',[-5.8,.32,-5.8+sz*.95],[-5.8,2.55,-5.8+sz*.95],.07,P('timber'),7);
   pole('timber',[-5.8,2.5,-6.9],[-5.8,2.5,-4.7],.06,P('timber'),7);
   pole('bronze',[-5.8,1.95,-6.65],[-5.8,1.95,-4.95],.035,P('bronze'),8);
   pole('bronze',[-5.8,2.5,-5.8],[-5.8,1.95,-5.8],.03,P('bronze'),6);
   for(const sz of [-1,1]){const pz=-5.8+sz*.82;
    pole('rope',[-5.8,1.95,pz],[-5.8,1.15,pz],.014,P('rope'),5);
    cyl('bronze',-5.8,1.1,pz,.34,.05,P('bronze'),12);}
   for(let i=0;i<3;i++)cyl('stone',-6.9,.32,-7.6+i*.5,.16+.03*i,.22,P('carve'),10);
   for(let i=0;i<4;i++)box('hide',-6.8+(i%2)*.7,.32,-4.3+Math.floor(i/2)*.65,.55,.42,.45,P('rope'));});
  /* east side of court: the laced toll-keeper's room */
  const rx0=3.4+t/2,rx1=8.4-t/2,rz0=-8.9+t/2,rz1=-3.1-t/2;
  cyLacedRing(rx0,rz0,rx1,rz1,2.9,{holes:{w:cyEarHoles((rz1-rz0)/2,.95,CY.DOOR_H)},lace:'nsw'});
  cyEarDoor(rx0,-6.0,-PI/2,.95,CY.DOOR_H,{name:'the toll-keeper door'});
  box('floor',(rx0+rx1)/2,0,-6.0,rx1-rx0-t,.06,rz1-rz0-t,P('floor'));
  svNoWalk(()=>{box('wood',6.2,0,-5.4,1.1,.74,.65,P('wood'));box('bronze',7.2,0,-7.6,.8,.52,.55,P('bronze'));
   for(let i=0;i<3;i++)cyJar(4.5+i*.65,-8.1,{h:.72,r:.24});});
  cyRoof(3.4,-8.9,8.4,-3.1,2.9,{flush:true});
  /* stone stair in the north-west court climbing to the y = 4.80 wing and gatehouse bridge */
  {const gap=cyWallStair(-7.4,-2.48);
   cyWall(-9,-1.75,gap.x0,-1.75,Y,.78,{t:.3,socle:0,inner:0});
   cyWall(gap.x1,-1.75,9,-1.75,Y,.78,{t:.3,socle:0,inner:0});}
  cyTarget(0,.06,-4.4,'the customs court');
  cyTarget(-5.0,.38,-5.8,'the weighing floor');
  cyTarget(5.6,.06,-6.0,'the toll-keeper room');
  cyTarget(0,Y+.06,5.0,'the gatehouse bridge');}});

/* ---------------------------------------------------------------- 5. Water gate (corbelled culverts and bronze-shod grilles) */
defBuilding({key:'cy_water_gate',name:'Water gate (corbelled culverts and bronze grilles)',seed:9955,cls:'building',kind:'water_gate',frag:'kits/coyote',
 tags:{types:['military','infrastructure'],wealth:'middle',style:'tier',role:'water_gate'},w:18,d:8.4,h:6.8,budget:65000,front:{x:-7.8,z:-2.6,yaw:PI},
 note:'the long wall over Hau-Gel: ashlar bank abutments and a pointed cutwater pier carrying two corbelled stone culverts, bronze-shod portcullis grilles hung from windlasses above, and the continuous wall-walk with merlons',
 build(o){o=o||{};const D=CY_GATE.DEPTH,Y=CY_GATE.WALK,sl=CY_GATE.SLAB;
  /* stone invert sill on the river bed (svNoWalk, flush at y = 0..0.06 so WATER.flow passes over it) */
  svNoWalk(()=>box('stone',0,0,0,11.0,.06,5.6,P('stone')));
  /* west and east bank abutments (x = -9..-5.2 and +5.2..+9): solid stone up to 3.4, upper to 4.56 */
  for(const s of [-1,1]){const ax=s*7.1,aw=3.8;
   box('stone',ax,0,0,aw,2.2,D+.3,P('stone'));
   box('render',ax,2.2,0,aw,1.2,D,P('mud'));
   svNoWalk(()=>box('render',ax,3.4,0,aw,Y-sl-3.4,D,P('mud')));}
  /* central cutwater pier (x = -1.0..+1.0) with pointed upstream (-z) and downstream (+z) prows */
  box('stone',0,0,0,2.0,3.25,D+.3,P('stone'));
  svNoWalk(()=>{
   prism('stone',[[-1.0,-(D/2+.15)],[1.0,-(D/2+.15)],[0,-(D/2+1.35)]],0,2.6,P('stone'));
   prism('stone',[[1.0,D/2+.15],[-1.0,D/2+.15],[0,D/2+1.35]],0,2.6,P('stone'));});
  /* two corbelled stone culverts (x = -5.2..-1.0 and +1.0..+5.2, clear width 4.2 m, crown at y = 3.25 m) + bronze-shod grilles */
  svNoWalk(()=>{
   for(const cx of [-3.1,3.1]){
    for(let k=0;k<4;k++){const st=k*.34,yy=2.15+k*.28;
     box('slab',cx-(2.1-.32-st),yy,0,.68,.3,D+.16,P('stone'));
     box('slab',cx+(2.1-.32-st),yy,0,.68,.3,D+.16,P('stone'));}
    box('slab',cx,3.25,0,4.4,.34,D+.2,P('stone'));
    /* bronze-shod portcullis grille: vertical bars down to y = 0.58 m (clear of bed, dipping into river surface) + crossbars */
    for(let i=0;i<8;i++){const bx=cx-1.68+i*.48;
     pole('timber',[bx,.78,.2],[bx,3.35,.2],.038,P('wood'),6);
     cone('bronze',bx,.78,.2,.052,-.22,P('bronze'),6);}
    for(const gy of [1.15,2.05,2.85])box('bronze',cx,gy,.2,3.7,.07,.1,P('bronze'));
    /* windlass drum on the gallery above */
    pole('timber',[cx-.9,Y+.55,-.55],[cx+.9,Y+.55,-.55],.1,P('timber'),8);
    for(const s2 of [-1,1])box('timber',cx+s2*.95,Y,-.55,.14,.72,.28,P('timber'));}
   box('render',0,3.55,0,10.6,Y-sl-3.55,D,P('mud'));});
  cyLace(-9,D/2,9,D/2,[3.8],[],.04);cyLace(9,-D/2,-9,-D/2,[3.8],[],.04);
  /* continuous wall-walk at y = 4.80 + parapet + merlons + west bank stair */
  box('roof',0,Y-sl,0,18,sl,D,P('roof'));
  cyWall(-9,D/2-.18,9,D/2-.18,Y,.95,{t:.36,socle:0,inner:0});
  cyMerlons(-8.8,8.8,Y+.95,D/2-.18,.34);
  if(o.stair!==false){const gap=cyWallStair(-8.6,-D/2-.58);
   cyWall(-9,-D/2+.15,gap.x0,-D/2+.15,Y,.78,{t:.3,socle:0,inner:0});
   cyWall(gap.x1,-D/2+.15,9,-D/2+.15,Y,.78,{t:.3,socle:0,inner:0});}
  else cyWall(-9,-D/2+.15,9,-D/2+.15,Y,.78,{t:.3,socle:0,inner:0});
  const C=cyContour(o.text==null?'Hau-Gèl. Lōk-Hau.':o.text);
  const segs=cyCarve(C,0,3.75,D/2+.02,4.4,.52,{lw:.032});
  if(CURREC){CURREC.carving={text:C.text,hash:C.hash,segs};
   CURREC.culverts={spans:[[-5.2,-1.0],[1.0,5.2]],crownY:3.25,grilleTipY:.56};}
  if(!o.rec&&o.stair!==false)cyTarget(0,Y+.06,.4,'the water-gate walk');}});

/* ---------------------------------------------------------------- 6. Shoulder citadel (barracks, granary, cistern, commander's megaron) */
defBuilding({key:'cy_citadel',name:'Gate shoulder citadel (barracks, granary, cistern and commander)',seed:9956,cls:'building',kind:'citadel',frag:'kits/coyote',
 tags:{types:['military','civic'],wealth:'rich',style:'tier',role:'citadel'},w:28,d:26,h:9.8,budget:220000,cut:true,front:{x:0,z:13.0,yaw:0},
 note:'the fort on the Gate shoulder above the Narrows: a dressed stone podium, laced curtain and four corner turrets, the commander megaron, the barracks, the raised granary and the shaded stone cistern',
 build(o){o=o||{};const P0=.8,t=CY.WALL,CW=26,CD=23.6,cz=-.6,zS=cz+CD/2,zN=cz-CD/2,xE=CW/2,xW=-CW/2,Hc=3.6;
  /* stone podium and front entrance stair */
  svNoWalk(()=>{box('stone',0,0,cz,CW+.4,P0-.1,CD+.4,P('stone'));box('slab',0,P0-.1,cz,CW,.1,CD,P('stone'));});
  wkPad(0,cz,CW,CD,P0);
  svStair(0,13.0,0,P0,PI,{style:'solid',w:2.8,run:1.6,mk:'stone',col:P('stone')});
  W(0,P0,0,0,()=>{
   /* curtain walls and four corner turrets */
   cyWall(xW+t/2,zN,xW+t/2,zS,0,Hc,{socle:1.0,inner:-1});
   cyWall(xE-t/2,zS,xE-t/2,zN,0,Hc,{socle:1.0,inner:-1});
   cyWall(xE,zN+t/2,xW,zN+t/2,0,Hc,{socle:1.0,inner:-1});
   cyWall(xW,zS-t/2,-2.2,zS-t/2,0,Hc,{socle:1.0,inner:-1});
   cyWall(2.2,zS-t/2,xE,zS-t/2,0,Hc,{socle:1.0,inner:-1});
   cyWall(-2.6,zS-t/2,2.6,zS-t/2,0,Hc+.6,{mk:'stone',socle:0,inner:0,t:.52,holes:cyEarHoles(2.6,2.2,2.55)});
   cyEarDoor(0,zS-t/2,0,2.2,2.55,{stone:true,name:'the citadel gate'});
   const C=cyContour(o.text==null?'Lōk-Hau Kām. Hau-Gèl!':o.text);
   const segs=cyCarve(C,0,3.15,zS+.06,3.8,.5,{lw:.032});
   if(CURREC)CURREC.carving={text:C.text,hash:C.hash,segs};
   for(const sx of [-1,1])for(const sz of [-1,1]){const tx=sx*(xE-.9),tz=cz+sz*(CD/2-.9);
    svNoWalk(()=>{box('stone',tx,0,tz,3.0,1.4,3.0,P('stone'));box('render',tx,1.4,tz,2.8,3.6,2.8,P('mud'));
     cyMerlons(tx-1.2,tx+1.2,5.0,tz+sz*1.25,.28);});}
   box('floor',0,0,cz,CW-2*t,.04,CD-2*t,P('gravel'));
   /* 1. Commander's megaron (north-west) */
   W(-6.2,0,-5.8,0,()=>{cyMegaron({W:8.2,D:9.6,porch:1.8,H:3.8,hearthR:.75,lace:'ens',doorName:'the commander door'});});
   /* 2. Barracks (south-west, facing east into the court) */
   {const bx0=-11.6+t/2,bx1=-5.4-t/2,bz0=1.2+t/2,bz1=9.2-t/2;
    cyLacedRing(bx0,bz0,bx1,bz1,2.9,{holes:{e:cyEarHoles((bz1-bz0)/2,1.0,CY.DOOR_H)},lace:'esn'});
    cyEarDoor(bx1,5.2,PI/2,1.0,CY.DOOR_H,{name:'the barracks door'});
    box('floor',(bx0+bx1)/2,0,5.2,bx1-bx0-t,.06,bz1-bz0-t,P('floor'));
    cyPlatform(bx0+t/2,bz0+t/2,bx0+t/2+1.6,bz1-t/2,.36,{col:P('mudL')});
    cyHearth(-7.4,5.2,{r:.36});
    svNoWalk(()=>{for(let i=0;i<6;i++)pole('wood',[-6.2,0,2.2+i*.5],[-6.35,2.05,2.2+i*.5],.022,P('wood'),5);});
    cyRoof(-11.6,1.2,-5.4,9.2,2.9,{flush:true});}
   /* 3. Granary (south-east, raised bins and jars, facing west into the court) */
   {const gx0=5.4+t/2,gx1=11.6-t/2,gz0=1.2+t/2,gz1=9.2-t/2;
    cyLacedRing(gx0,gz0,gx1,gz1,3.0,{holes:{w:cyEarHoles((gz1-gz0)/2,1.0,CY.DOOR_H)},lace:'wsn'});
    cyEarDoor(gx0,5.2,-PI/2,1.0,CY.DOOR_H,{name:'the granary door'});
    box('floor',(gx0+gx1)/2,0,5.2,gx1-gx0-t,.06,gz1-gz0-t,P('floor'));
    for(let i=0;i<4;i++)cyBin(10.4,2.4+i*1.6,-PI/2,{w:.95,h:.85});
    for(let i=0;i<5;i++)cyJar(7.2+(i%2)*.85,2.6+Math.floor(i/2)*1.2,{h:.88,r:.28});
    cyRoof(5.4,1.2,11.6,9.2,3.0,{flush:true});}
   /* 4.Cistern (north-east, kerbed stone basin under a timber shade roof) */
   cyShade(5.2,-9.6,10.8,-4.0,2.9);
   svNoWalk(()=>{
    for(const sx of [-1,1])box('stone',8.0+sx*2.35,0,-6.8,.3,0.75,5.0,P('stone'));
    for(const sz of [-1,1])box('stone',8.0,0,-6.8+sz*2.35,4.4,0.75,.3,P('stone'));
    box('water',8.0,.52,-6.8,4.3,.03,4.3,new THREE.Color(.22,.36,.4));});
   cyTarget(0,.06,2.0,'the citadel court');
   cyTarget(-8.2,.06,5.2,'the barracks');
   cyTarget(8.2,.06,5.2,'the granary');});}});

/* ---------------------------------------------------------------- 7. Fodder-burning pit (the seed law at the Gate) */
defBuilding({key:'cy_fodder_pit',name:'Fodder-burning pit (the Gate seed law)',seed:9957,cls:'building',kind:'works',frag:'kits/coyote',
 tags:CY_TIER_TAGS('poor','infrastructure','fodder_pit','customs'),w:9.0,d:8.0,h:2.6,budget:20000,front:{x:0,z:4.0,yaw:0},
 note:'where incoming caravans burn their outside fodder under the Gate seed law before buying the Kingdom feed: a stone-kerbed ash pit, a wind-wall with the seed-law stele, bronze rakes and stacked fodder bundles',
 build(o){o=o||{};
  box('floor',0,0,2.2,7.8,.05,3.2,P('stone'));
  /* wind-wall on -z with the carved seed-law stele */
  cyWall(-3.6,-2.8,3.6,-2.8,0,1.65,{mk:'stone',socle:0,inner:0,t:.38});
  box('slab',0,0,-2.52,.92,2.35,.26,P('stone'));box('slab',0,2.35,-2.52,1.04,.12,.32,P('stone'));
  const C=cyContour(o.text==null?'Tsēk! Hām-Gèl Lōk-Hau.':o.text);
  const segs=cyCarve(C,0,.55,-2.38,.74,1.5,{lw:.022,wrap:true});
  if(CURREC)CURREC.carving={text:C.text,hash:C.hash,segs};
  /* stone-kerbed burning pit */
  svNoWalk(()=>{
   for(const sx of [-1,1])box('stone',sx*2.35,0,-.45,.34,.58,3.4,P('stone'));
   for(const sz of [-1,1])box('stone',0,0,-.45+sz*1.55,4.36,.58,.34,P('stone'));
   box('ash',0,0,-.45,4.0,.28,2.8,P('ash'));
   for(let i=0;i<6;i++)sph('glow',rr(-1.4,1.4),.32,-.45+rr(-.9,.9),.075,new THREE.Color(1,.44,.12),.55,6);
   /* fodder bales awaiting burning + bronze fire rakes */
   for(let i=0;i<5;i++)box('reed',3.35+(i%2)*.55,0,.3+Math.floor(i/2)*.7,.52,.42,.62,P('reed'));
   for(let i=0;i<2;i++){pole('wood',[-2.6+i*.45,0,-2.45],[-2.5+i*.45,1.85,-2.58],.025,P('wood'),5);
    box('bronze',-2.6+i*.45,.04,-2.38,.36,.08,.06,P('bronze'));}});
  smokeAt(0,.65,-.45,{r:.45,kind:'fire'});
  cyTarget(0,.06,2.4,'the burning apron');}});
