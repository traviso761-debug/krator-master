// prefix: iw
// ================================================================= THE WEST'S CIVIC BUILDINGS: the assembly hall, the ceremonial square, the school
// The village's own buildings, in the house style (50-iw-west.js) grown large: the assembly hall after the owner's
// "hall.jpg" (a raised hall on carved columns and pointed arcades under a stack of horned roofs rising to a spire, grand
// stairs up the front and both sides), the ceremonial square (Nias and Sumba: paving, standing stones, the jumping stone,
// a ring of carved posts round the fire, a stepped stone platform with a shrine and offerings), and the school.
// The shared West helpers the trade, harbour and defence fragments (53-55) also use are here first.
// Frame: origin on the ground at the plot centre, +z the front.
/* ---------------------------------------------------------------- shared West helpers */
/* a pointed arch in the plane z = zc: two arcs springing at (x0, y0) and (x1, y0) meeting at the apex yA; a round rib r thick */
function iwArch(x0,x1,y0,yA,zc,r,mk,col){const R=x1-x0,k=(yA-y0)/(R*Math.sin(PI/3)),N=7,pts=[];
 for(let i=0;i<=N;i++){const a=i/N*PI/3;pts.push([x1-R*Math.cos(a),y0+R*Math.sin(a)*k,zc]);}
 for(let i=N-1;i>=0;i--){const a=i/N*PI/3;pts.push([x0+R*Math.cos(a),y0+R*Math.sin(a)*k,zc]);}
 cord(mk,pts,r,col);}
/* a row of pointed arches between consecutive posts xs (post radius pr) in the plane z = zc */
function iwArcade(xs,pr,y0,yA,zc,r){for(let i=0;i<xs.length-1;i++)iwArch(xs[i]+pr,xs[i+1]-pr,y0,yA,zc,r,'carvedR',P('carvR'));}
/* an open pavilion: posts round an L x W rectangle up to eaveY (from y0), eave and tie beams, a horned saddle roof and its
   painted gables. o.carved(x, z) true: that post is a carved pou. o.roof overrides isSaddle's options; o.ridgeH. Returns the roof. */
function iwPavilion(o){const L=o.L,Wd=o.W,eY=o.eaveY,y0=o.y0||0,nx=o.nx||Math.max(2,Math.round(L/2.8)+1);
 for(const x of isSpan(-L/2,L/2,nx))for(const s of [-1,1]){const z=s*Wd/2;
  if(o.carved&&o.carved(x,z))isPou(x,y0,z,eY-y0,o.pr||.15,{mk:'carvedR',n:Math.max(1,Math.round((eY-y0)/1.4)),ry:s>0?0:PI});
  else cyl(o.postMk||'tarred',x,y0,z,o.pr||.13,eY-y0,P('tarred'),8);}
 for(const s of [-1,1])box('wood',0,eY-.24,s*Wd/2,L+.3,.24,.2,P('woodD'));
 for(const x of isSpan(-L/2,L/2,nx))box('wood',x,eY-.2,0,.16,.18,Wd,P('woodD'));
 const rf=isSaddle(Object.assign({L,W:Wd,eaveY:eY,ridgeY:eY+(o.ridgeH||3),mk:'thatch',col:P('thatchW'),taper:1,over:.7,th:.26,nu:24},o.roof||{}));
 if(o.gable!==false)for(const s of [-1,1])rf.gable(s*L/2,eY,Wd/2,o.gableMk||'patGableW',{});
 if(o.spikes!==false)iwSpikes(rf);
 return rf;}
/* the iron spikes and brass knobs at a saddle roof's two horn tips (the gonjong finials) */
function iwSpikes(rf,s){s=s||1;for(const k of [-1,1]){const t=rf.R(k);cone('iron',t[0],t[1]-.1*s,0,.06*s,.9*s,P('iron'),6);sph('brass',t[0],t[1]+.75*s,0,.07*s,P('brass'),1,6);}}
/* a long war shield hung on a wall (facing +z in its frame): a painted board with a boss and a hand bar */
function iwShield(x,y,z,ry,s){W(x,y,z,ry,()=>{box('patGableW',0,-s*.62,.03,s*.42,s*1.24,.05,WHITE);box('wood',0,-s*.62,0,s*.46,s*1.28,.03,P('woodD'));
 sph('wood',0,0,.07,s*.09,P('woodD'),.6,8);for(const k of [-1,1])box('plain',0,k*s*.45,.06,s*.3,.04,.02,P('white'));});}
/* a slit gong (a hollowed log drum) lying on two trestles, L long, radius r; its slit up, its ends carved */
function iwGong(x,y,z,ry,L,r){W(x,y,z,ry,()=>{const h=.55;for(const k of [-1,1]){for(const s of [-1,1])beam('wood',[k*L*.32,0,s*.32],[k*L*.32,h,0],.06,P('woodD'));}
 beam('carvedR',[-L/2,h+r,0],[L/2,h+r,0],r,P('carvR'),true,10);box('plain',0,h+2*r-.025,0,L*.68,.03,r*.28,P('black'));
 for(const k of [-1,1]){ellip('carvedR',k*L/2,h+r,0,r*.35,r*.95,r*.95,P('carvR'),0,8);sph('bone',k*(L/2+.08),h+r*1.25,0,r*.2,P('shell'),1,6);}
 for(const k of [-1,1])beam('wood',[L*.1*k,h+2*r,.1],[L*.2*k+.1,h+2*r+.06,.5],.025,P('woodL'),true,4);});}
/* a standing slit drum (the upright tam-tam): a carved log h tall with a long slit and a face near the top */
function iwUprightGong(x,z,ry,h,r){W(x,0,z,ry,()=>{cyl('carvedR',0,0,0,r,h,P('carvR'),12,.85);box('plain',0,h*.15,r*.96,r*.22,h*.5,.03,P('black'));
 ellip('carvedR',0,h*.86,r*.6,r*.6,h*.09,r*.45,P('carvR'),0,10);for(const s of [-1,1]){sph('bone',s*r*.42,h*.82,r*.88,r*.22,P('shell'),.8,8);sph('plain',s*r*.42,h*.82,r*1.02,r*.1,P('black'),1,6);}
 box('plain',0,h*.7,r*.92,r*.5,h*.03,.04,P('red'));cone('carvedR',0,h,0,r*.85,r*.8,P('carvR'),10);for(const y of [h*.1,h*.68])cyl('plain',0,y,0,r*1.02,.05,P('white'),12);});}
/* a paved floor from (x0, z0) to (x1, z1): stone slabs s wide, their tops jittered */
function iwPaving(x0,x1,z0,z1,s,o){o=o||{};for(let x=x0;x<x1-.01;x+=s)for(let z=z0;z<z1-.01;z+=s){const w=Math.min(s,x1-x),d=Math.min(s,z1-z);
 box(o.mk||'stone',x+w/2,0,z+d/2,w-.06,rr(.06,.12),d-.06,P(o.col||'stone'));}}
/* a grand stair: isStair with carved lattice cheeks under its stringers and carved newel posts with figures at its foot */
function iwGrandStair(x,z,ry,y0,y1,w){const run=isStair(x,z,ry,y0,y1,w,{});W(x,0,z,ry,()=>{for(const s of [-1,1]){const xx=s*(w/2+.07);
 poly('lattice',[[xx,y0,run],[xx,y1,0],[xx,y0,0]],WHITE,true);isPou(s*(w/2+.12),y0,run+.18,1.4,.15,{mk:'carvedR',n:1,top:'figure'});}});return run;}
/* the walls of a raised drum (the clerestory under a roof tier): an L x d box of carved walls from y0 to y1 with lattice
   windows in its two ends and a painted band at its top */
function iwDrum(L,d,y0,y1){const h=y1-y0,win=[{x:0,w:Math.min(1.4,d*.35),y:h*.3,h:h*.45}];
 isWalls(L,d,y0,h,'carvedR',P('woodD'),{left:win,right:win,frame:P('woodD'),shut:false});
 for(const [x,z,ry,len] of [[0,d/2+.01,0,L],[0,-d/2-.01,PI,L],[L/2+.01,0,PI/2,d],[-L/2-.01,0,-PI/2,d]])W(x,0,z,ry,()=>box('patBand',0,y1-.5,0,len,.4,.02,WHITE));}
/* ---------------------------------------------------------------- the assembly hall */
defBuilding({key:'iw-hall',name:'Assembly hall (West)',seed:5101,cut:true,w:37.5,d:29.5,h:35,budget:400000,
 tags:{types:['civic'],wealth:'rich',style:'west',role:'assembly hall'},
 note:'the village assembly hall (the owner\'s hall.jpg): a hall raised on carved columns and pointed arcades, a carved gallery round it, a stack of seven horned roofs crossing each other as they rise to a thatched spire, grand stairs up the front and both sides, kiosks at the back corners',
 build(o){const B=.5,Y1=3.6,top=Y1+4.6,GW=25.2,GD=16.8;
  /* the tiers: [along x?, L, W, eaveY, ridgeH, sag, hornRise, hornOut, over] */
  const TIERS=[[1,25.2,17,Y1+4.35,4.7,1.0,3.6,2.4,1.2],[0,17,13,10.2,5.6,.9,3.8,2.6,1.1],[1,14,10.5,12.8,5.4,.8,3.6,2.2,1.0],[0,10.5,8.4,15.4,5.0,.6,3.2,1.8,.9],
   [1,8,6.4,18.0,4.6,.5,2.8,1.5,.8],[0,5.6,4.6,20.6,4.0,.4,2.4,1.1,.6],[1,3.6,3.2,23.0,3.4,.3,2.0,.8,.5]];
  isNoCut(()=>{
   box('stone',0,0,0,36,B,28,P('stone'));for(const s of [-1,1])box('stone',0,B,s*13.85,36,.06,.3,P('stoneD'));
   /* the columns: carved posts round the edge, plain ones inside, girders under the floor, arcades between the edge posts */
   const xs=isSpan(-12.6,12.6,7),zs=isSpan(-8.4,8.4,5),ph=Y1-B-.4;
   for(const x of xs)for(const z of zs){const fz=Math.abs(z)>8,fx=Math.abs(x)>12;
    if(fz||fx)isPou(x,B,z,ph,.27,{mk:'carvedR',n:2,ry:fz?(z>0?0:PI):(x>0?PI/2:-PI/2)});else cyl('tarred',x,B,z,.24,ph,P('tarred'),10);}
   for(const z of zs)box('wood',0,Y1-IS_T-.4,z,GW+.6,.3,.3,P('woodD'));
   for(const s of [-1,1]){iwArcade(xs,.3,B+1.5,Y1-.55,s*8.4,.09);W(s*12.6,0,0,PI/2,()=>iwArcade(zs,.3,B+1.5,Y1-.55,0,.09));}
   isDeck(GW+1.4,GD+1.4,Y1,{beam:true});
   /* the gallery's carved balustrade, open where the three stairs arrive */
   const ex=GW/2+.6,ez=GD/2+.6,rail=(a,b)=>isRail(a,b,Y1,{panel:'lattice',h:1.0});
   rail([-ex,ez],[-1.75,ez]);rail([1.75,ez],[ex,ez]);rail([-ex,-ez],[ex,-ez]);
   for(const s of [-1,1]){rail([s*ex,-ez],[s*ex,3.2]);rail([s*ex,6.0],[s*ex,ez]);}
   /* the grand stairs: the front, and one down each side toward the front */
   iwGrandStair(0,ez,0,B,Y1,3.2);for(const s of [-1,1])iwGrandStair(s*ex,4.6,s*PI/2,B,Y1,2.6);
   /* the kiosks at the plinth's back corners: a slit gong in one, an ancestor figure in the other */
   for(const s of [-1,1])W(s*15.4,0,-11.4,0,()=>{box('stone',0,B,0,3.2,.12,2.8,P('stoneD'));
    iwPavilion({L:2.6,W:2.2,eaveY:B+2.5,y0:B+.12,ridgeH:2.0,nx:2,carved:()=>true,roof:{sag:.3,hornRise:1.5,hornOut:.7,over:.45,th:.2,nu:18}});
    if(s<0)iwGong(0,B+.12,0,0,1.9,.24);else FURNISH('islander_court_statue',0,B+.12,0,0,{setting:'outdoor'});});
   FURNISH('islander_common_bench',-4.2,B,0,0,{setting:'outdoor'});FURNISH('islander_common_bench',4.2,B,0,PI,{setting:'outdoor'});
   for(const s of [-1,1]){isLamp(s*2.6,2.4,13.6,{post:true});isFlag(s*17.2,13.2,9,{});}});
  isCutFloor(Y1);
  /* the gallery's upper arcade: carved columns with painted bands, pointed arches, the ring beam the lowest roof sits on */
  const ux=isSpan(-12.6,12.6,7),uz=isSpan(-8.4,8.4,5),cols=[];for(const x of ux)for(const s of [-1,1])cols.push([x,s*8.4]);for(const z of uz.slice(1,-1))for(const s of [-1,1])cols.push([s*12.6,z]);
  for(const [x,z] of cols){cyl('carvedR',x,Y1,z,.2,4.05,P('carvR'),10);for(const [y,c] of [[.25,'white'],[.4,'black'],[3.6,'black'],[3.75,'white']])cyl('plain',x,Y1+y,z,.22,.09,P(c),10);box('carvedR',x,Y1+3.85,z,.6,.22,.6,P('carvR'));}
  for(const s of [-1,1]){iwArcade(ux,.22,Y1+2.4,Y1+3.75,s*8.4,.07);W(s*12.6,0,0,PI/2,()=>iwArcade(uz,.22,Y1+2.4,Y1+3.75,0,.07));
   box('carvedR',0,Y1+4.0,s*8.4,GW+.4,.36,.32,P('carvR'));box('carvedR',s*12.6,Y1+4.0,0,.32,.36,GD,P('carvR'));}
  /* the hall: carved walls, tall doors and arched windows, a painted frieze, a ceiling */
  const win=xx=>xx.map(x=>({x,w:1.3,y:1.0,h:2.1}));
  isWalls(20,12,Y1,4.6,'carvedR',P('woodD'),{front:[{x:0,w:2.4,h:3.2,door:true},...win([-7.4,-4.6,4.6,7.4])],back:win([-6,-2,2,6]),left:win([-3,3]),right:win([-3,3]),shut:false});
  for(const x of [-7.4,-4.6,4.6,7.4])iwArch(x-.65,x+.65,Y1+3.1,Y1+3.75,6.08,.06,'carvedR',P('carvR'));iwArch(-1.2,1.2,Y1+3.2,Y1+4.15,6.08,.08,'carvedR',P('carvR'));
  for(const [x,z,ry,len] of [[0,6.01,0,20],[0,-6.01,PI,20],[10.01,0,PI/2,12],[-10.01,0,-PI/2,12]])W(x,0,z,ry,()=>{box('patGableW',0,top-.62,0,len,.56,.02,WHITE);box('patBand',0,Y1+.05,0,len,.36,.02,WHITE);});
  box('planks',0,top,0,20.2,.14,12.2,P('planks'));
  /* the stacked roofs, each above its drum, crossing as they rise */
  TIERS.forEach((T,k)=>{const [ax,L,Wd,eY,rH,sag,hR,hO,ov]=T;W(0,0,0,ax?0:PI/2,()=>{
   if(k)iwDrum(L,Wd*.62,top,eY+.3);
   const rf=isSaddle({L,W:Wd,eaveY:eY,ridgeY:eY+rH,sag,hornRise:hR,hornOut:hO,taper:1,over:ov,p:4,th:k?.3:.4,nu:k?30:44,eaveSag:k?.15:.3,mk:'thatch',col:P('thatchW')});
   for(const s of [-1,1])rf.gable(s*L/2,k?eY:Y1+4.2,Wd/2,'patGableW',{});iwSpikes(rf,k?.9:1.2);
   if(k===1)isMoonDisc(-(L/2+.3),eY+1.7,0,-PI/2,.9);});});
  /* the spire: flared thatch skirts round a carved mast, an iron spike, the white moon */
  cyl('carvedR',0,24.6,0,.26,6.4,P('carvR'),10);
  for(let i=0;i<4;i++){const y0=25.9+i*1.2,r=1.5-i*.3;lathe('thatch',0,0,[[r,y0],[r*.72,y0+.32],[r*.22,y0+1.3]],16,P('thatchW'));}
  cone('iron',0,30.6,0,.08,1.6,P('iron'),6);sph('brass',0,31.4,0,.12,P('brass'),1,8);isMoonDisc(0,32.2,0,0,.4);
  /* the council within: the chief's seat and its hangings, benches down both walls, the great kava bowl, lamps */
  const F=(k,x,z,ry,y)=>FURNISH(k,x,Y1+(y||0),z,ry||0);
  F('islander_court_throne',0,-5.3,0);for(const s of [-1,1]){F('islander_court_tapestry',s*3.6,-5.86,0);F('islander_common_banner',s*6.6,-5.86,0);F('islander_court_statue',s*9.1,-5.2,0);
   for(const z of [-3.4,-1.2,1.0,3.2])F('islander_common_bench',s*9.45,z,s<0?PI/2:-PI/2);FURNISH_HANG('islander_court_hanging',s*5,top-.05,.5,0);}
  F('islander_court_carpet',0,-1.8,0);F('islander_common_kava_bowl',0,-1.8,0,.03);}});
/* ---------------------------------------------------------------- the ceremonial square */
defBuilding({key:'iw-square',name:'Ceremonial square (West)',seed:5102,w:36,d:35,h:14,budget:250000,
 tags:{types:['plaza','religious'],wealth:'middle',style:'west',role:'ceremonial square'},
 note:'the village\'s ceremonial square (Nias, Sumba): a paved plaza, a ring of carved posts round the feast fire, a stepped stone platform with a horned shrine and offerings, standing stones down both sides, the stone jumping pillar, upright slit gongs and a gong shelter, flags and palms at the gate',
 build(o){iwPaving(-14,14,-9.5,14.5,1.4);
  for(const [x,z,w,d] of [[0,14.65,28.4,.3],[-14.15,2.5,.3,24.3],[14.15,2.5,.3,24.3]])box('stone',x,0,z,w,.2,d,P('stoneD'));
  /* the platform: three courses of stone, a shrine on top over the altar and its offerings, carved posts at its corners */
  box('stone',0,0,-12.4,16,.45,7,P('stoneD'));box('stone',0,.45,-12.8,14,.45,6,P('stone'));box('stone',0,.9,-13.2,12,.45,5,P('stone'));
  W(0,1.35,-13.8,0,()=>{iwPavilion({L:3.2,W:2.4,eaveY:2.5,ridgeH:2.2,nx:2,carved:()=>true,pr:.13,roof:{sag:.35,hornRise:1.7,hornOut:.8,over:.5,th:.22,nu:18}});
   box('stone',0,0,0,2.2,.8,1.0,P('stoneD'));const S={setting:'outdoor'};
   FURNISH('islander_common_bowl',-.6,.8,0,0,S);FURNISH('generic_fruit_bowl',0,.8,.05,0,S);FURNISH('generic_produce',.62,.8,0,0,S);
   for(const s of [-1,1])FURNISH('islander_common_candle',s*.95,.8,-.32,0,S);});
  for(const s of [-1,1]){isPou(s*5.5,1.35,-15.1,3.4,.2,{top:'figure'});isPou(s*5.5,1.35,-11.0,2.6,.2,{top:'horns'});iwUprightGong(s*8.7,-12.6,0,3.6,.38);}
  /* the ring of carved posts round the feast fire */
  for(let i=0;i<10;i++){const a=i/10*TAU+PI/10,x=Math.cos(a)*6.4,z=3+Math.sin(a)*6.4;isPou(x,.1,z,rr(2.6,3.4),.19,{ry:isFace(x,z,0,3),top:['figure','moon','horns'][i%3]});}
  sector('stone',0,3,.95,1.45,0,TAU,0,.35,P('stoneD'),24);cyl('earth',0,0,3,.96,.12,0x3a2a1e,16);
  for(let i=0;i<4;i++){const a=i*PI/4;beam('wood',[Math.cos(a)*.8,.14,3+Math.sin(a)*.8],[-Math.cos(a)*.8,.3,3-Math.sin(a)*.8],.07,P('woodD'),true,6);}
  sph('glow',0,.14,3,.38,0xff7a2a,.35,8);smokeAt(0,.6,3,{r:.35});haloAt(0,.7,3,0xff8a30,true);
  /* the jumping stone (Nias hombo batu): a squared pillar, a cap slab, the stepping stone it is leapt from */
  W(-9.6,0,6.6,PI/4,()=>cyl('stone',0,0,0,1.25,2.1,P('stone'),4,.72));box('stone',-9.6,2.1,6.6,1.42,.14,1.42,P('stoneD'));box('stone',-9.6,0,8.6,.9,.5,.7,P('stone'));
  /* standing stones down both sides, stone seats before the platform */
  for(const s of [-1,1])for(let i=0;i<5;i++)isMenhir(s*13.4,-6+i*4.2,rr(1.4,2.8),rr(.3,.46),{ry:rr(0,PI)});
  for(const x of [-6.5,-3.2,3.2,6.5]){cyl('stone',x,0,-7.6,.2,.36,P('stoneD'),8);cyl('stone',x,.36,-7.6,.55,.14,P('stone'),12);}
  /* the gong shelter */
  W(9.8,0,9.4,0,()=>{iwPavilion({L:3.4,W:2.4,eaveY:2.4,ridgeH:2.0,nx:2,roof:{sag:.35,hornRise:1.4,hornOut:.7,over:.5,th:.22,nu:18}});iwGong(0,0,0,0,2.6,.3);});
  /* the gate: carved posts, flags, lamps; palms and bananas placed, not drawn */
  for(const s of [-1,1]){isPou(s*2.3,0,15.3,3.2,.22,{top:'figure'});isFlag(s*4.0,15.6,7.5,{});isLamp(s*7.4,2.3,13.2,{post:true});}
  place('fl-coconut',-13.5,-13.6,.4,{v:1});place('fl-coconut',13.6,-13.4,2.2,{v:2});place('fl-banana',-15.4,12.3,0,{v:1});place('fl-banana',15.4,12.6,1.3,{v:2});
  door(0,0,16.5,0,4.6);}});
/* ---------------------------------------------------------------- the school */
defBuilding({key:'iw-school',name:'School (West)',seed:5103,cut:true,w:19,d:13,h:12,budget:150000,
 tags:{types:['civic'],wealth:'middle',style:'west',role:'school'},
 note:'the village school: a long airy room on piles under a two-spiked roof, wide windows down its front, rows of benches before the board, the moon on its gables; a flag and a slit gong to call the children',
 build(o){const fy=1.1,wh=2.6;iwHouse({L:12,D:6.4,floorY:fy,wallH:wh,roof:{ridgeH:3.6,sag:1,hornRise:3,hornOut:1.4,taper:1,over:.9,th:.3},band:'patBand',bandH:.36,
  front:[{x:0,w:1.1,h:2.0,door:true},{x:-4.3,w:1.6,y:.7,h:1.3},{x:-2.1,w:1.2,y:.7,h:1.3},{x:2.1,w:1.2,y:.7,h:1.3},{x:4.3,w:1.6,y:.7,h:1.3}],
  back:[{x:-3.6,w:1.2,y:.9,h:1.1},{x:3.6,w:1.2,y:.9,h:1.1}],left:[{x:0,w:1,y:.9,h:1.1}],right:[{x:0,w:1,y:.9,h:1.1}],stair:'stair',stairW:1.2,finial:'moon',
  extra:()=>{const F=(k,x,z,ry,y)=>FURNISH(k,x,fy+(y||0),z,ry||0);
   F('islander_common_board',0,-3.0,0);F('islander_common_desk',0,-1.9,0);F('islander_common_books',.3,-1.9,0,svfH('islander_common_desk',0,1.1));
   for(const z of [-.4,.8,2.0])for(const s of [-1,1]){F('islander_common_bench',s*2.5,z,PI);if(z<1.5)F('islander_common_books',s*2.5+.4,z,PI,svfH('islander_common_bench',0,.48));}
   F('islander_common_bookcase',-5.65,-1.4,PI/2);for(const s of [-1,1])FURNISH_HANG('islander_common_hanging',s*3,fy+wh+.7,.3,0);}});
  isNoCut(()=>{isFlag(-7.0,4.4,7,{});iwGong(5.6,0,4.7,0,1.6,.2);FURNISH('islander_common_bench',-3.8,0,4.9,0,{setting:'outdoor'});});}});
