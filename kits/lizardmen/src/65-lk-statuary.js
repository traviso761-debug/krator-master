// prefix: lks
// ================================================================= MONUMENTAL STATUARY OF BASILISK (65-lk-statuary.js)
// Large, oppressive, strangely shaped cyclopean verdigris-stone and cast-bronze statuary for Basilisk's avenues, Coil turns,
// courts and Mound (owner, 2026-11-18):
//   - Representative of the Lizardmen:
//       lk-colossus-watcher (7725): 19 m hunched, forward-leaning archaic Lizardman monolith with 9 bronze dorsal blades,
//                                   folded six-jointed stone limbs and a single looming spiral-eye taotie brow
//       lk-statue-phalanx   (7726): six faceless angular figures in the 1.25^k caste progression fused into one leaning wall,
//                                   each chest pierced by its triangular caste doorway ("one mind through every body")
//   - Representative of the Coil:
//       lk-colossus-coil    (7727): 17.5 m cantilevered 3D squared-spiral (leiwen) stone-and-bronze knot winding round a
//                                   suspended bronze whorl-sphere, severed at the top by the Phase Inversion gap
//       lk-statue-ouroboros (7728): top-heavy counter-twisting double helix of verdigris stone and bronze (cause & memory)
//   - Strange things only they could understand:
//       lk-statue-manifold  (7729): 16.5 m horizontally sheared non-Euclidean monolith — 7 cantilevered stone slabs shifted
//                                   into mid-air with upside-down stairs underneath and round whorl spheres emerging from stone
//       lk-statue-paradox   (7730): interpenetrating 75/105 deg bronze-and-stone triangular frames piercing an inverted,
//                                   many-eyed top-heavy polyhedron suspended over a narrow needle foot
// Frame: origin on the ground at the plot centre, +z the front.

function lksVerdPedestal(w,d,h,o){o=o||{};
 box('stoneP',0,0,0,w,h*.48,d,P('basaltD'));
 const T=lzBatterRoom(w-.7,d-.7,h*.48,h*.52,'cyclo',P('verd'),{lean:{front:.12,back:-.06,left:.09,right:-.05},inner:false});
 lzSlab(T.T,h,.22,'bronzeC',P('bronze'),.14);
 for(const [x,z,ry,L] of [[0,(d-.7)/2,0,w-1.4],[0,-(d-.7)/2,PI,w-1.4],[(w-.7)/2,0,PI/2,d-1.4],[-(w-.7)/2,0,-PI/2,d-1.4]]){
  W(x,h*.56,z+.02*(ry===0?1:ry===PI?-1:0),ry,()=>lzLeiwen(Math.max(1.4,L-.8),Math.min(.9,h*.38),{cell:.28,mk:'bronze',back:'lacq'}));}
 return h+.22;}

/* ---------------------------------------------------------------- 1. The Watcher in Concert (19 m Lizardman monolith) */
defBuilding({key:'lk-colossus-watcher',name:'Colossus of the Watcher',seed:7725,caste:'all',cut:false,w:12,d:12,h:19.5,budget:95000,
 front:{x:0,z:6,yaw:0},tags:{types:['statue','civic'],wealth:'rich',role:'monument'},
 note:'an oppressive 19 m archaic Lizardman colossus in verdigris stone and cast bronze: hunched forward over the avenue so its faceless taotie-and-spiral-eye head looms above passersby, nine bronze dorsal blades curving down its spine, gaunt six-jointed stone limbs folded across a leiwen thorax',
 build(o){const v=((o&&o.v)|0)%5,y0=lksVerdPedestal(9.8,9.8,2.2);
  const stCol=v===1?P('jade'):v===3?P('basaltD'):P('verd'),brCol=v%2?P('bronze'):P('verd');
  const janus=v===4?[-1,1]:[1];
  for(const dir of janus)W(0,y0,janus.length>1?-dir*.9:0,dir<0?PI:0,()=>{
   const sc=janus.length>1?.82:1.0;
   /* hunched forward-leaning monolith torso (wider at the shoulders than the waist: oppressive reverse taper!) */
   lzWall([-2.1*sc,1.4*sc],[2.1*sc,1.4*sc],[-2.85*sc,2.55*sc],[2.85*sc,2.55*sc],0,8.6*sc,'cyclo',stCol,[],{inner:false});
   lzWall([2.1*sc,-1.8*sc],[-2.1*sc,-1.8*sc],[2.3*sc,-.5*sc],[-2.3*sc,-.5*sc],0,8.6*sc,'cyclo',P('basaltD'),[],{inner:false});
   lzWall([2.1*sc,1.4*sc],[2.1*sc,-1.8*sc],[2.85*sc,2.55*sc],[2.3*sc,-.5*sc],0,8.6*sc,'stoneP',stCol,[],{inner:false});
   lzWall([-2.1*sc,-1.8*sc],[-2.1*sc,1.4*sc],[-2.3*sc,-.5*sc],[-2.85*sc,2.55*sc],0,8.6*sc,'stoneP',stCol,[],{inner:false});
   box('stoneP',0,8.55*sc,1.0*sc,5.7*sc,.45*sc,3.1*sc,stCol);
   /* folded angular six-jointed arms & taloned hands across the thorax */
   for(const s of [-1,1]){
    beam('stoneP',[s*2.75*sc,7.8*sc,1.8*sc],[s*2.1*sc,4.6*sc,2.35*sc],.46*sc,P('basaltD'),true,6);
    beam('stoneP',[s*2.1*sc,4.6*sc,2.35*sc],[s*.45*sc,5.3*sc,2.55*sc],.38*sc,stCol,true,6);
    for(let c=0;c<3;c++)beam('bronzeC',[s*(.45-.18*c)*sc,(5.3-.22*c)*sc,2.62*sc],[s*(-.15-.15*c)*sc,(4.9-.24*c)*sc,2.72*sc],.07*sc,brCol,true,5);}
   /* inlaid bronze leiwen breastplate & sweeping coiled tail-skirt at the base */
   WX(0,5.6*sc,2.15*sc,-.13,0,0,()=>lzLeiwen(3.2*sc,2.4*sc,{cell:.28,mk:'bronze',back:'lacq',eye:true}));
   tube('cyclo',t=>{const a=t*PI*1.35;return [Math.sin(a)*2.7*sc,(1-t)*.9*sc,-1.4*sc-Math.cos(a)*1.6*sc];},t=>[.68*(1-.55*t)*sc,.48*(1-.5*t)*sc],14,7,P('basaltD'),{caps:true});
   /* elongated hunched neck & oppressive overhanging taotie-brow head */
   beam('cyclo',[0,8.5*sc,1.15*sc],[0,12.2*sc,2.85*sc],1.18*sc,stCol,true,7);
   WX(0,12.5*sc,3.05*sc,.34,0,0,()=>{
    box('stoneP',0,0,0,3.2*sc,2.5*sc,2.6*sc,P('basaltD'));
    box('bronzeC',0,1.15*sc,.15*sc,3.6*sc,.34*sc,2.8*sc,brCol);
    lzEye(0,.15*sc,1.34*sc,0,.92*sc,{mk:'bronze',glow:v===0||v===2});
    for(const s of [-1,1]){
     lzHorn(s*1.45*sc,.9*sc,.2*sc,s>0?-PI/2+.3:PI/2-.3,3.6*sc,.24*sc,{curl:.72,lean:.28,mk:'bronzeC',col:brCol});
     lzHorn(s*.85*sc,1.3*sc,-.2*sc,PI,2.8*sc,.18*sc,{curl:.45,lean:.35,mk:v===2?'ivory':'stoneP',col:v===2?P('tusk'):stCol});}});
   /* nine cast-bronze dorsal crest blades sweeping down the arched spine */
   for(let i=0;i<9;i++){const u=i/8,ny=lerp(2.2,11.8,u)*sc,nz=lerp(-1.55,1.65,u)*sc+Math.sin(u*PI)*(-.45*sc);
    lzHorn(0,ny,nz,PI,(1.3+Math.sin(u*PI)*1.5)*sc,.14*sc,{curl:.35,lean:.42,mk:'bronzeC',col:brCol,nt:6,ns:5});}
   /* variant 1 & 3 carry a towering 15 m ceremonial bronze ge dagger-axe shaft beside the colossus */
   if((v===1||v===3)&&janus.length===1){
    cyl('bronzeC',3.1,0,1.6,.14,14.8,P('bronze'),8);
    box('bronzeC',2.15,13.6,1.6,2.1,.44,.12,P('verd'));box('bronzeC',3.1,14.3,1.6,.28,1.5,.12,P('verd'));}});}});

/* ---------------------------------------------------------------- 2. The Six Phases of the Flesh (stepped caste phalanx) */
defBuilding({key:'lk-statue-phalanx',name:'Phalanx of the Six Castes',seed:7726,caste:'all',cut:false,w:14,d:9,h:13.5,budget:85000,
 front:{x:0,z:4.5,yaw:0},tags:{types:['statue','civic'],wealth:'rich',role:'monument'},
 note:'six stark angular green-stone figures fused shoulder-to-shoulder in the exact 1.25x caste progression from Tender to Bulwark, leaning sideways at 75 degrees; each chest is pierced clean through by its caste\'s triangular doorway and threaded by one bronze spine of recurring memory',
 build(o){const v=((o&&o.v)|0)%5,dir=v%2?-1:1,y0=lksVerdPedestal(12.6,6.8,1.7);
  const stCol=v===2?P('jade'):P('verd');
  let curX=-5.0*dir;
  const order=[1,2,3,4,5,6];
  for(let i=0;i<6;i++){const c=order[i],sc=Math.pow(1.25,i),fw=(.92+.18*i),fh=2.6*sc,fd=1.4+.18*i;
   const x=curX+dir*fw*.5;curX+=dir*(fw+.16);
   W(x,y0,0,0,()=>{
    const dh=Math.min(fh*.48,1.05*sc),dw=dh*.62;
    const T=lzBatterRoom(fw,fd,0,fh,'stoneP',i%2?stCol:P('basaltD'),{
     lean:{front:.08,back:-.06,left:dir*.11,right:-dir*.11},
     front:[{s:fw/2,w:dw,h:dh,door:true}],back:[{s:fw/2,w:dw,h:dh,door:true}]});
    lzSlab(T.T,fh,.2,'bronzeC',P('verd'),.12);
    /* abstract angular horned head-block atop each figure */
    const hx=-dir*.11*fh;
    box('cyclo',hx,fh+.2,.08,fw*.68,fh*.2,fd*.72,stCol,.12*dir);
    lzEye(hx,fh+.2+fh*.1,fd*.36+.1,0,Math.min(.42,.12*sc),{mk:'bronze',glow:c===5});
    for(const s of [-1,1])lzHorn(hx+s*fw*.28,fh+.2+fh*.18,0,s>0?-PI/2:PI/2,.65*sc,.06*sc,{curl:.6,lean:.25,mk:c>=5?'bronzeC':'stoneP',col:P(c>=5?'bronze':'basaltD'),nt:6,ns:5});});}
  /* continuous cast-bronze memory-cord piercing all six chests */
  beam('bronzeC',[-5.4,y0+1.5,.15],[5.4,y0+5.2,.15],.13,P('bronze'),true,8);}});

/* ---------------------------------------------------------------- 3. The Great Coil and the Fracture (17.5 m 3D leiwen knot) */
defBuilding({key:'lk-colossus-coil',name:'Monument of the Fractured Coil',seed:7727,caste:'all',cut:false,w:14,d:14,h:18.0,budget:95000,
 front:{x:0,z:7,yaw:0},tags:{types:['statue','civic','religious'],wealth:'rich',role:'monument'},
 note:'a colossal 17.5 m cantilevered three-dimensional squared spiral (leiwen) of verdigris stone and cast bronze turning at sharp 75 and 105 degree angles around a suspended bronze whorl-sphere; at its uppermost turn one stone beam is cleanly severed in mid-air — the Phase Inversion',
 build(o){const v=((o&&o.v)|0)%5,chir=v%2?-1:1,y0=lksVerdPedestal(11.4,11.4,2.1);
  const stCol=v===1?P('basaltD'):P('verd'),brCol=P('bronze');
  /* two massive skew piers anchoring the rising 3D angular spiral */
  for(const s of [-1,1])W(s*3.4,y0,-s*1.2,.26*chir,()=>{
   const Tp=lzBatterRoom(2.2,2.6,0,5.8,'cyclo',P('basaltD'),{lean:{front:.05,back:-.05,left:-.06,right:.06},inner:false});
   lzSlab(Tp.T,5.8,.24,'bronzeC',P('verd'),.12);});
  /* 13 angular 3D spiral segments rising & winding inward from r=4.8 m up to y0+14.8 m, skipping segment 10's middle (the Fracture!) */
  const pts=[];let curR=4.7,curY=1.8;
  for(let k=0;k<=13;k++){const a=(k*PI/2+.26*(k%2))*chir;pts.push([Math.cos(a)*curR,curY,Math.sin(a)*curR]);
   if(k%2===1)curR*=.86;curY+=1.02;}
  for(let k=0;k<pts.length-1;k++){const a=pts[k],b=pts[k+1],th=.62-.022*k;
   if(k===10){
    /* the deliberate Fracture: severed stone ends with taut bronze filaments bridging the void */
    const m1=[lerp(a[0],b[0],.3),lerp(a[1],b[1],.3),lerp(a[2],b[2],.3)];
    const m2=[lerp(a[0],b[0],.74),lerp(a[1],b[1],.74),lerp(a[2],b[2],.74)];
    beam('cyclo',a,m1,th,P('oxblood'),true,6);beam('cyclo',m2,b,th,stCol,true,6);
    for(const off of [-.18,0,.18])beam('bronzeC',[m1[0],m1[1]+off,m1[2]],[m2[0],m2[1]-off,m2[2]],.04,P('verd'),true,5);
   }else{
    beam(k%3===0?'bronzeC':'stoneP',a,b,th,k%3===0?brCol:stCol,true,6);
    box('bronzeC',b[0],b[1]-th*.5,b[2],th*1.5,th*1.5,th*1.5,P('verd'),k*.26);
   }}
  /* suspended carved whorl-sphere (DESIGN 2.3a: round whorl inside the squared built spiral) */
  const cy=y0+8.6;
  sph('bronzeC',0,cy,0,1.65,P('bronze'),1,16);
  for(let r=0;r<5;r++)ring('stoneP',0,cy,0,1.72,.065,P('verd'),r*.62,r*.45,0,20);
  for(const q of [0,PI/2,PI,-PI/2])W(0,cy,0,q,()=>lzEye(0,0,1.68,0,.44,{mk:'bronze',glow:true}));
  for(const s of [-1,1])beam('bronzeC',[s*3.4,y0+5.8,-s*1.2],[0,cy,0],.075,P('bronze'),true,6);}});

/* ---------------------------------------------------------------- 4. Twin Helices of Recurrence (top-heavy counter-spirals) */
defBuilding({key:'lk-statue-ouroboros',name:'Twin Helices of Recurrence',seed:7728,caste:'all',cut:false,w:11,d:11,h:15.5,budget:90000,
 front:{x:0,z:5.5,yaw:0},tags:{types:['statue','civic'],wealth:'rich',role:'monument'},
 note:'two jagged counter-spiralling helices of dark verdigris stone and cast bronze (clockwise and counter-clockwise: memory and cause) pinching narrow at the waist and flaring oppressively wide overhead around seven suspended spiral eyes',
 build(o){const v=((o&&o.v)|0)%5,y0=lksVerdPedestal(8.8,8.8,1.8),H=12.4;
  for(const sg of [-1,1]){
   const mk=sg>0?'stoneP':'bronzeC',col=sg>0?P(v===2?'jade':'verd'):P(v%2?'bronze':'verd');
   const N=16;let prev=null;
   for(let i=0;i<=N;i++){const t=i/N,a=sg*(t*TAU*1.45+(sg<0?PI:0));
    /* pinch at t=0.38, flare wide toward t=0.92 for oppressive top-heavy silhouette */
    const rad=2.6*(1-.48*Math.sin(t*PI*.85))+.95*t*t;
    const cur=[Math.cos(a)*rad,y0+t*H,Math.sin(a)*rad];
    if(prev)beam(mk,prev,cur,.34+.18*t,col,true,6);
    if(i%3===0&&i>0)lzHorn(cur[0],cur[1],cur[2],a+(sg>0?0:PI),1.45,.11,{curl:.55,lean:.3,mk:'bronzeC',col:P('bronze'),nt:6,ns:5});
    prev=cur;}}
  /* central vertical spine of 7 bronze discs & spiral eyes */
  cyl('lacq',0,y0,0,.22,H+.4,P('lacq'),10);
  for(let k=0;k<7;k++){const ey=y0+1.4+k*1.65;
   ring('bronzeC',0,ey,0,.85+.08*k,.06,P('verd'),0,0,0,16);
   lzEye(0,ey,.12,0,.32,{mk:'bronze',glow:k===6});lzEye(0,ey,-.12,PI,.32,{mk:'bronze'});}}});

/* ---------------------------------------------------------------- 5. The Sheared Manifold (non-Euclidean sliced monolith) */
defBuilding({key:'lk-statue-manifold',name:'The Sheared Manifold',seed:7729,caste:'all',cut:false,w:13,d:13,h:17.0,budget:90000,
 front:{x:0,z:6.5,yaw:0},tags:{types:['statue','civic','religious'],wealth:'rich',role:'monument'},
 note:'a strange spacetime-anomaly monument only the Lizardmen comprehend: a 16 m verdigris-basalt monolith cleanly sliced into seven horizontal slabs displaced sideways into impossible mid-air cantilevers, with upside-down staircases carved beneath the overhangs and round whorl spheres half-emerged from flat stone',
 build(o){const v=((o&&o.v)|0)%5,chir=v%2?-1:1,y0=lksVerdPedestal(10.4,10.4,1.8);
  let ox=0,oz=0;
  for(let i=0;i<7;i++){
   const sh=1.82,sy=y0+i*(sh+.18),sw=5.2-.18*i,sd=4.6-.14*i;
   /* sudden lateral phase-shifts at slices 2, 3, 4, 5 */
   if(i>=1){const a=(i*1.32+.4)*chir,step=(i===3||i===4)?1.55:.85;ox+=Math.cos(a)*step;oz+=Math.sin(a)*step;
    ox=Math.max(-2.6,Math.min(2.6,ox));oz=Math.max(-2.6,Math.min(2.6,oz));}
   W(ox,sy,oz,i*.11*chir,()=>{
    const mk=i===3?'lacqR':i%2?'stoneP':'cyclo',col=i===3?P('oxblood'):P(v===1?'jade':'verd');
    box(mk,0,0,0,sw,sh,sd,col);
    box('bronzeC',0,sh-.08,0,sw+.16,.1,sd+.16,P('bronze'));
    /* internal bronze shear-pins visible in the 18 cm levitation gap below each shifted slab */
    if(i>0)for(const px of [-.9,.9])cyl('bronzeC',px,-.2,0,.14,.24,P('bronze'),8);
    /* upside-down staircases clinging to the undersides of overhanging slabs! */
    if(i===2||i===4||i===5)for(let st=0;st<6;st++)box('stoneP',-sw*.35+st*.38,-(st+1)*.14,sd*.22,.38,(st+1)*.14,1.1,P('basaltD'));
    /* Scottish-ball round whorl spheres half-emerged through the flat vertical faces */
    if(i===1||i===4){sph('bronzeC',0,sh*.5,sd/2,.62,P('verd'),1,14);ring('lacq',0,sh*.5,sd/2+.22,.56,.045,P('lacq'),PI/2,0,0,14);}
    if(i===6){for(const q of [0,PI/2,PI,-PI/2])W(0,sh*.55,0,q,()=>lzEye(0,0,sd/2+.04,0,.42,{mk:'bronze',glow:true}));
     for(let h=0;h<5;h++){const a2=h*TAU/5;lzHorn(Math.cos(a2)*1.5,sh,Math.sin(a2)*1.5,a2,2.1,.13,{curl:.6,lean:.28,mk:'bronzeC',col:P('verd')});}}});}
  /* diagonal 50.6 deg bronze ley-spear piercing clean through the sheared stack */
  beam('bronzeC',[-3.2,y0+.4,-2.6],[3.1,y0+13.8,2.5],.11,P('bronze'),true,8);}});

/* ---------------------------------------------------------------- 6. The Impossible Frame (skew portals & inverted eyed polyhedron) */
defBuilding({key:'lk-statue-paradox',name:'The Impossible Tusk-Frame',seed:7730,caste:'all',cut:false,w:12,d:12,h:16.0,budget:90000,
 front:{x:0,z:6,yaw:0},tags:{types:['statue','civic','religious'],wealth:'rich',role:'monument'},
 note:'three giant interpenetrating triangular and rhombic stone-and-bronze frames tilted at 75 and 105 degrees that pierce an oppressive inverted polyhedron (poised on a narrow bronze point, wide and looming overhead) studded with asymmetric spiral eyes and inward-pointing horns',
 build(o){const v=((o&&o.v)|0)%5,y0=lksVerdPedestal(9.6,9.6,1.8);
  /* central inverted top-heavy monolith: 1.1 m narrow needle at foot, flaring to 5.2 m wide overhead! */
  W(0,y0,0,.32,()=>{
   const b0=.65,t0=2.55,H=9.8;
   lzWall([-b0,b0],[b0,b0],[-t0,t0],[t0,t0],1.4,H,'cyclo',P('verd'),[],{inner:false});
   lzWall([b0,-b0],[-b0,-b0],[t0,-t0],[-t0,-t0],1.4,H,'cyclo',P('basaltD'),[],{inner:false});
   lzWall([b0,b0],[b0,-b0],[t0,t0],[t0,-t0],1.4,H,'stoneP',P('jade'),[],{inner:false});
   lzWall([-b0,-b0],[-b0,b0],[-t0,-t0],[-t0,t0],1.4,H,'stoneP',P('verd'),[],{inner:false});
   box('bronzeC',0,1.4+H,0,t0*2+.2,.32,t0*2+.2,P('bronze'));
   cyl('bronzeC',0,0,0,.48,1.55,P('bronze'),8);
   /* cluster of asymmetric spiral eyes staring downward from the overhanging faces */
   for(const [ang,ey,er,gl] of [[0,8.6,.58,true],[0,6.2,.34,false],[PI/2,9.2,.48,false],[PI,8.0,.52,true],[-PI/2,7.1,.38,false],[-PI/2,9.6,.32,false]]){
    const fz=lerp(b0,t0,(ey-1.4)/H);
    W(0,0,0,ang,()=>WX(0,ey,fz+.06,.19,0,0,()=>lzEye(0,0,0,0,er,{mk:'bronze',glow:gl})));}
   /* seven horns curling INWARD over the top rim toward a dark void */
   for(let i=0;i<7;i++){const a=i*TAU/7;lzHorn(Math.cos(a)*2.2,1.72+H,Math.sin(a)*2.2,Math.atan2(-Math.cos(a),-Math.sin(a)),2.1,.13,{curl:.7,lean:.35,mk:v%2?'ivory':'bronzeC',col:P(v%2?'tusk':'verd')});}});
  /* three giant skew triangular portals (at 0, 105 and 210 deg) slicing right through the inverted mass */
  for(let k=0;k<3;k++){const ry=k*1.8326+(v*.3),fh=12.6-.9*k,fw=6.8-.5*k;
   W(0,y0,0,ry,()=>{
    const mk=k===1?'bronzeC':'stoneP',col=k===1?P('bronze'):P('verd');
    beam(mk,[-fw/2,0,0],[0,fh,0],.34,col,true,6);
    beam(mk,[fw/2,0,0],[0,fh,0],.34,col,true,6);
    beam('bronzeC',[-fw*.36,fh*.28,0],[fw*.36,fh*.28,0],.22,P('verd'),true,6);});}}});
