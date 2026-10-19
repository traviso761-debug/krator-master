// prefix: iw
// ================================================================= THE WEST: the rumah of the western Ring Sea
// Long houses on piles under saddle roofs whose ridges sag in the middle and sweep up into horns (the owner's "rumah"
// references: Minangkabau rumah gadang with their gonjong spikes, Batak Toba houses with leaning painted gables, Toraja
// tongkonan with prow-like ends), black palm-fibre thatch, dark timber, gables and wall boards painted red, black and white,
// carved posts. The poor live in the same shapes mended with scrap. iwHouse draws any of them from a parameter set; the
// houses below are the three wealth tiers, three each.
// Frame: origin on the ground at the plot centre, +z the front. A house's ridge runs along x (a side entry, the door in the
// long front wall) unless o.gableFront, which turns the house so a gable faces the front (Batak, Toraja: the door in the gable).
/* o: L, D (the room's length and depth), floorY, wallH, roof {ridgeH, sag, hornRise, hornOut, taper, over, p, mk, col, patch,
   concave, th, nu}, gableFront, wallMk, wallCol, wallMkf(side), band (a painted frieze: a MAT key), gableMk, gableCol, lean,
   openings front/back/left/right (isWall), doorX, stair 'stair' | 'ladder' | 'log' | 'none', finial 'horns' | 'spike' |
   'figure' | 'moon' | 'none', pou (carved posts at the front corners), tier (the furniture), beds, underPig (a pig under the
   floor), extra(rf) (drawn in the house frame after the roof, rf the roof's handle), wings (rich: stepped horned roofs at
   the ends), porch (a horned porch on the front) */
function iwHouse(o){const L=o.L,D=o.D,fy=o.floorY,wh=o.wallH||2.2,R=Object.assign({ridgeH:3.4,sag:.9,hornRise:3,hornOut:1.4,taper:1,over:.8,p:4,mk:'thatch'},o.roof||{});
 const body=()=>{const top=fy+wh;isCutFloor(fy);   /* before the piles and the deck: they stay when the house opens */
  if(fy>.35){const nx=Math.max(2,Math.round(L/2.3)+1),nz=Math.max(2,Math.round(D/2.3)+1);
   isPiles(isSpan(-L/2+.25,L/2-.25,nx),isSpan(-D/2+.25,D/2-.25,nz),fy-IS_T,{r:o.pileR||.17,mk:o.pileMk||'tarred',col:P('tarred'),beamY:fy*.5,square:o.square});}
  else box('earth',0,0,0,L+.3,fy+.05,D+.3,P('earth'));
  isDeck(L,D,fy,{col:P('planks'),beam:fy>.35});
  isWalls(L,D,fy,wh,o.wallMk||'planks',o.wallCol||P('planks'),{front:o.front,back:o.back,left:o.left,right:o.right,mkf:o.wallMkf,colf:o.wallColf,
   frame:o.frame===undefined?P('woodD'):o.frame,shutMk:o.shutMk,shutCol:o.shutCol});
  /* a painted frieze under the eave and a dado at the floor, all round */
  if(o.band){const bh=o.bandH||.42;for(const [x,z,ry,len] of [[0,D/2+.01,0,L],[0,-D/2-.01,PI,L],[L/2+.01,0,PI/2,D],[-L/2-.01,0,-PI/2,D]])
   W(x,0,z,ry,()=>{box(o.band,0,top-bh-.02,0,len,bh,.02,WHITE);if(o.dado!==false)box(o.band,0,fy+.02,0,len,bh*.7,.02,WHITE);});}
  const rf=isSaddle(Object.assign({L:L+(o.roofL||0),W:D,eaveY:top-.08,ridgeY:top-.08+R.ridgeH,col:R.col||P(o.thatchKey||'thatchW')},R));
  if(o.gableMk!==false)for(const s of [-1,1])rf.gable(s*(L/2+.02),top,D/2+.02,o.gableMk||'patGableW',{lean:o.lean,col:o.gableCol});
  /* the finials at the ridge's two tips */
  for(const s of [-1,1]){const t=rf.R(s);const fx=t[0],fyy=t[1]+.1;
   if(o.finial==='horns')isHorns(fx,fyy-.05,0,s>0?-PI/2:PI/2,1.4);
   else if(o.finial==='figure')isFigure(fx*.97,fyy-.25,0,s>0?PI/2:-PI/2,1.1,{mk:'carvedR'});
   else if(o.finial==='moon')isMoonDisc(fx*.98,fyy+.4,0,s>0?PI/2:-PI/2,.45);
   else if(o.finial!=='none'){cone('iron',fx,fyy-.15,0,.06,.9,P('iron'),6);sph('brass',fx,fyy+.75,0,.07,P('brass'),1,6);}}
  /* the wings: stepped horned roofs at both ends (the rumah gadang's anjung) */
  if(o.wings)for(const s of [-1,1])W(s*(L/2-o.wings.L/2),0,0,0,()=>{isSaddle(Object.assign({},R,{L:o.wings.L,W:D*.92,eaveY:top-.5,ridgeY:top-.5+R.ridgeH*.75,sag:.4,hornRise:R.hornRise*.8,hornOut:.7,over:.6,col:R.col||P(o.thatchKey||'thatchW'),nu:18}));});
  /* the porch: a horned roof on posts over the front door, its ridge across the house */
  if(o.porch){const pw=o.porch.w||3,pd=o.porch.d||2.4;isNoCut(()=>{W(o.doorX||0,0,D/2+pd/2,0,()=>{
   for(const [x,z] of [[-pw/2,pd/2],[pw/2,pd/2]])isPou(x,fy,z,wh+.2,.13,{mk:'carvedR',n:2});
   isDeck(pw+.4,pd,fy,{col:P('planks'),beam:false});
   W(0,0,0,-PI/2,()=>{const pr=isSaddle({L:pd+.4,W:pw+.2,eaveY:top+.2,ridgeY:top+.2+R.ridgeH*.7,sag:.25,hornRise:R.hornRise*.75,hornOut:.5,taper:1,over:.5,mk:R.mk,col:R.col||P(o.thatchKey||'thatchW'),nu:16});
    pr.gable(pd/2+.2,top+.2,pw/2+.1,o.gableMk||'patGableW',{});});});});}
  if(o.pou)isNoCut(()=>{for(const s of [-1,1])isPou(s*(L/2-.1),fy,D/2+.25,wh-.1,.14,{mk:'carvedR',top:o.pou===true?'none':o.pou});});
  /* the way up */
  const dx=isDoorX(o.doorX,o.front);isNoCut(()=>{if(fy>.35){if(o.stair==='ladder')isLadder(dx,D/2+.05,0,fy,{});else if(o.stair==='log')isLogLadder(dx,D/2+.05,0,fy);
   else if(o.stair!=='none')isStair(dx,D/2+.02+(o.porch?(o.porch.d||2.4):0),0,0,fy,o.stairW||1.0);}});
  if(o.underPig&&fy>1.2)place('pig',L*.25,-D*.15,PI*.7,{mode:'idle',sub:'west'});
  if(o.tier)isFurnRoom(L-.4,D-.4,fy,o.tier,{ceil:wh+R.ridgeH*.5,beds:o.beds,extra:o.furn});
  if(o.extra)o.extra(rf,top);};
 if(o.gableFront)W(0,0,0,-PI/2,body);else body();}
/* the openings most houses take: a door in the middle of the front, windows either side and at the back */
function iwOpen(L,n,door){const o=[];if(door!==false)o.push({x:door||0,w:1.0,h:1.85,door:true});const step=L/(n+1);for(let i=1;i<=n;i++){const x=-L/2+i*step;if(Math.abs(x-(door||0))>1.1)o.push({x,w:.7,y:.85,h:.8});}return o;}
/* ---------------------------------------------------------------- the poor: the same shapes, mended with scrap */
defBuilding({key:'iw-hut-scrap',name:'Scrap hut (West)',seed:5001,cut:true,w:7.6,d:6.6,h:5.6,budget:60000,
 tags:{types:['dwelling-single'],wealth:'poor',style:'west'},
 note:'a one-room hut on stumps under a horned roof of corrugated iron held down by tyres, walls of salvage, a tarp lean-to and a water drum',
 build(o){iwHouse({L:4.6,D:3.4,floorY:.9,wallH:1.9,roof:{ridgeH:1.9,sag:.35,hornRise:1.1,hornOut:.5,taper:.5,over:.5,patch:1,th:.06},gableMk:'tin',gableCol:P('tin'),
  wallMkf:s=>s==='front'?'reclaimed':s==='back'?'corrW':s==='left'?'tin':'bamboo',wallColf:s=>s==='front'?P('planks'):s==='left'?P('tin'):s==='right'?P('bamboo'):P('rust'),
  front:[{x:-.6,w:.9,h:1.7,door:true},{x:1.2,w:.6,y:.8,h:.6}],back:[{x:.5,w:.6,y:.8,h:.6}],stair:'log',finial:'none',tier:'poor',beds:1,furn:[['scrap_poor_tyre_table',.9,.5,0],['scrap_poor_stool',.1,.6,PI/2]],
  extra:(rf)=>{for(const [x,z] of [[-1.2,.9],[.8,1.3],[1.4,-1.1],[-.6,-1.5]]){const p=rf.F(z>0?1:-1)((x/2.6+1)/2,.45);isTyre(p[0],p[1]+.02,p[2]);}}});
  isNoCut(()=>{isTarp([2.4,2.1,-1.6],[2.4,2.1,1.6],[3.7,1.2,1.6],[3.7,1.2,-1.6],.25,P('tarpB'));for(const z of [-1.6,1.6])pole('wood',[3.7,0,z],[3.7,1.25,z],.05,P('wood'),6);
   isDrum(3.0,0,.2,{col:'drumB'});isDrum(-2.9,0,-.9,{col:'drumR'});isScrapHeap(-2.8,1.6,PI/2);});}});
defBuilding({key:'iw-hut-fisher',name:"Fisher's hut (West)",seed:5002,cut:true,w:8.4,d:7.0,h:6.6,budget:60000,
 tags:{types:['dwelling-single'],wealth:'poor',style:'west',role:'fisher'},
 note:'a fisher\'s hut on tall bamboo stilts: palm-leaf thatch mended with iron, woven walls, a ladder, nets drying on a rack',
 build(o){iwHouse({L:5.2,D:3.8,floorY:1.7,wallH:2.0,pileMk:'bamboo',pileR:.1,roof:{ridgeH:2.2,sag:.5,hornRise:1.4,hornOut:.7,taper:.6,over:.6,mk:'palm',col:P('palmL'),patch:.3,th:.18},
  thatchKey:'palmL',gableMk:'mat',gableCol:P('bamboo'),wallMk:'mat',wallCol:P('bamboo'),front:[{x:.8,w:.9,h:1.75,door:true},{x:-1.3,w:.6,y:.8,h:.55}],back:[],
  stair:'ladder',doorX:.8,finial:'none',tier:'poor',beds:1});
  isNoCut(()=>{FURNISH('job_net_frame',-2.6,0,2.7,.3,{setting:'outdoor'});FURNISH('job_fish_tray',2.7,0,2.6,-.2,{setting:'outdoor'});isDrum(-3.4,0,-.4,{col:'galv'});});}});
defBuilding({key:'iw-house-shared',name:'Shared longhut (West)',seed:5003,cut:true,w:12.2,d:7.4,h:6.6,budget:80000,
 tags:{types:['dwelling-multi'],wealth:'poor',style:'west'},
 note:'two poor families under one long roof, half thatch and half iron, walls of planks and tin, a pig under the floor',
 build(o){iwHouse({L:9.4,D:4.4,floorY:1.3,wallH:2.0,roof:{ridgeH:2.3,sag:.7,hornRise:1.6,hornOut:.8,taper:.7,over:.6,patch:.5,th:.2},thatchKey:'thatchP',
  wallMkf:s=>s==='front'||s==='back'?'reclaimed':'corrW',wallColf:s=>s==='front'||s==='back'?P('planks'):P('rust'),gableMk:'reclaimed',gableCol:P('planks'),
  front:[{x:-2.4,w:.9,h:1.75,door:true},{x:2.4,w:.9,h:1.75,door:true},{x:0,w:.6,y:.8,h:.6}],back:[{x:-2.4,w:.6,y:.8,h:.6},{x:2.4,w:.6,y:.8,h:.6}],
  doorX:-2.4,stair:'stair',stairW:.8,finial:'none',underPig:true,tier:'poor',beds:2});
  isNoCut(()=>{isLogLadder(2.4,2.25,0,1.3);isScrapHeap(5.4,1,PI/2);isDrum(-5.3,0,1.2,{});place('hen',-3.6,3.0,1.2,{sub:'west'});});}});
/* ---------------------------------------------------------------- the middle: the three classic houses */
defBuilding({key:'iw-house-rumah',name:'Rumah (West)',seed:5011,cut:true,w:16.6,d:12.6,h:11.6,budget:120000,
 tags:{types:['dwelling-single'],wealth:'middle',style:'west'},
 note:'the western family house: a long room on piles, a black thatch saddle roof sweeping up into two gonjong spikes, gables painted red, black and white, a stair to the door in the long wall',
 build(o){iwHouse({L:10,D:6,floorY:1.7,wallH:2.4,roof:{ridgeH:3.6,sag:1.1,hornRise:3.4,hornOut:1.6,taper:1,over:.9,th:.32},band:'patBand',bandH:.36,
  front:iwOpen(10,4),back:iwOpen(10,3,false),left:[{x:0,w:.7,y:.85,h:.8}],right:[{x:0,w:.7,y:.85,h:.8}],stair:'stair',finial:'spike',tier:'middle',underPig:true});}});
defBuilding({key:'iw-house-batak',name:'Batak house (West)',seed:5012,cut:true,w:11.8,d:16.4,h:12.2,budget:120000,
 tags:{types:['dwelling-multi'],wealth:'middle',style:'west'},
 note:'a Batak-style house for several families: massive piles and tie beams, low walls, a towering boat-shaped roof whose gables lean out over the ends, painted with spirals and lozenges, buffalo horns on the gables',
 build(o){iwHouse({gableFront:true,L:9.5,D:6.2,floorY:1.9,wallH:1.4,pileR:.24,square:false,roof:{ridgeH:5.2,sag:1.3,hornRise:2.6,hornOut:2.2,taper:0,over:1.0,p:3,concave:.5,th:.34},
  lean:.18,band:'patGableW',bandH:.5,dado:false,right:[{x:0,w:1.0,h:1.35,door:true}],left:[],front:[{x:-2,w:.6,y:.5,h:.5},{x:2,w:.6,y:.5,h:.5}],back:[{x:0,w:.6,y:.5,h:.5}],
  stair:'none',finial:'horns',tier:'middle',beds:2,
  extra:()=>{isNoCut(()=>isStair(4.8,0,PI/2,0,1.9,1.0));}});}});
defBuilding({key:'iw-house-tongkonan',name:'Tongkonan (West)',seed:5013,cut:true,w:10.4,d:19.0,h:12.8,budget:130000,
 tags:{types:['dwelling-single'],wealth:'middle',style:'west'},
 note:'a Toraja-style tongkonan: the roof\'s ends reach far out like prows, the front one carried on a tall carved post hung with buffalo horns; the walls carved and painted in panels',
 build(o){iwHouse({gableFront:true,L:8.6,D:5.0,floorY:2.0,wallH:1.9,roof:{ridgeH:4.2,sag:.9,hornRise:3.8,hornOut:3.4,taper:.15,over:.7,p:2.6,concave:.35,th:.3},
  lean:0,band:'patGableW',bandH:.6,wallMk:'carved',wallCol:P('woodD'),gableMk:'patStory',right:[{x:0,w:.9,h:1.6,door:true}],left:[],front:[{x:0,w:.6,y:.8,h:.6}],back:[{x:0,w:.6,y:.8,h:.6}],
  stair:'none',finial:'none',tier:'middle',beds:1,
  extra:(rf)=>{const t=rf.R(1);isNoCut(()=>{isPou(t[0]-.6,0,0,t[1]-.5,.22,{mk:'carvedR',n:4});for(let k=0;k<5;k++)isHorns(t[0]-.6,2.6+k*.55,.24,0,1.3-k*.12);
   isLadder(4.3+.05,0,PI/2,2.0,{});});}});}});
/* ---------------------------------------------------------------- the rich */
defBuilding({key:'iw-house-gadang',name:'Rumah gadang (West)',seed:5021,cut:true,w:28,d:15,h:15.5,budget:220000,
 tags:{types:['dwelling-multi'],wealth:'rich',style:'west'},
 note:'the great house of a matrilineal clan: a long hall of rooms on piles under a main roof and stepped wings, six gonjong spikes, carved and painted walls, a horned porch over the stair',
 build(o){iwHouse({L:18,D:7.2,floorY:1.9,wallH:2.6,roof:{ridgeH:4.6,sag:1.6,hornRise:4.6,hornOut:2.2,taper:1,over:1.0,th:.36,nu:40},wings:{L:4.2},
  wallMk:'carvedR',wallCol:P('woodD'),band:'patGableW2',bandH:.5,gableMk:'patGableW2',front:iwOpen(18,8),back:iwOpen(18,6,false),stair:'stair',stairW:1.4,porch:{w:3.2,d:2.6},finial:'spike',tier:'rich',beds:2,
  furn:[['islander_court_throne',0,-1.4,0],['islander_court_tapestry',4,-3.4,0],['islander_court_tapestry',-4,-3.4,0],['islander_court_statue',8,-2.8,0],['islander_court_statue',-8,-2.8,0]]});
  isNoCut(()=>{for(const s of [-1,1])isFlag(s*7,6.2,9,{});});}});
defBuilding({key:'iw-house-chief',name:"Chief's house (West)",seed:5022,cut:true,w:22,d:18,h:17,budget:220000,
 tags:{types:['dwelling-single','civic'],wealth:'rich',style:'west',role:'chief'},
 note:'the chief\'s house (the owner\'s "chief" reference): two storeys of carved, painted panels, a front pavilion with its own soaring gonjong over an arcaded porch, side roofs stepping down in spikes, the white moon on the gables',
 build(o){iwHouse({L:14,D:8,floorY:1.2,wallH:4.6,roof:{ridgeH:5.4,sag:1.9,hornRise:5.0,hornOut:2.0,taper:1,over:1.0,th:.36,nu:36},wings:{L:3.6},
  wallMk:'carvedR',wallCol:P('woodD'),band:'patGableW',bandH:.55,front:[{x:0,w:1.3,h:2.2,door:true},...iwOpen(14,5,false).map(q=>Object.assign({},q,{y:.9})),...iwOpen(14,5,false).map(q=>Object.assign({},q,{y:3.1}))],
  back:iwOpen(14,4,false),stair:'stair',stairW:1.6,porch:{w:4.4,d:3.4},finial:'moon',pou:'figure',tier:'rich',beds:2,
  furn:[['islander_court_throne',0,-2.4,0],['islander_court_table',0,0,0],['islander_court_statue',5.6,-3.2,0],['islander_court_statue',-5.6,-3.2,0]],
  extra:()=>{box('planks',0,1.2+2.3,0,13.6,.12,7.6,P('planks'));}});   /* the upper floor */
  isNoCut(()=>{for(const s of [-1,1]){isMenhir(s*9.5,7.5,2.2,.35);isLamp(s*4,2.2,8.2,{post:true});}});}});
defBuilding({key:'iw-house-tongkonan-great',name:'Great tongkonan (West)',seed:5023,cut:true,w:14,d:27,h:16.5,budget:220000,
 tags:{types:['dwelling-single','religious'],wealth:'rich',style:'west',role:'ancestral house'},
 note:'the ancestral house of a noble line: a huge prow-ended tongkonan, every wall carved and painted, a tower of buffalo horns up its front post, a carved effigy gallery, a buffalo tethered before it',
 build(o){iwHouse({gableFront:true,L:12,D:6.4,floorY:2.4,wallH:2.2,pileR:.22,roof:{ridgeH:5.6,sag:1.2,hornRise:5.0,hornOut:4.6,taper:.15,over:.9,p:2.6,concave:.45,th:.34,nu:40},
  band:'patGableW',bandH:.7,wallMk:'carvedR',wallCol:P('woodD'),gableMk:'patStory',right:[{x:0,w:1.0,h:1.7,door:true}],left:[],front:iwOpen(12,4,false),back:iwOpen(12,4,false),
  stair:'none',finial:'none',tier:'rich',beds:2,
  extra:(rf)=>{const t=rf.R(1);isNoCut(()=>{isPou(t[0]-.8,0,0,t[1]-.6,.28,{mk:'carvedR',n:5});for(let k=0;k<9;k++)isHorns(t[0]-.8,3.0+k*.5,.3,0,1.5-k*.08);
   isStair(6.05,0,PI/2,0,2.4,1.2);
   /* the effigy gallery (tau-tau) on a ledge beside the door */
   box('carved',7.2,2.4,-2.2,1.2,.1,2.4,P('woodD'));for(let k=0;k<3;k++)isFigure(7.3,2.5,-3+k*.8,PI/2,.9,{mk:'carved'});});}});
  place('buffalo',5.5,10.5,PI*.4,{mode:'idle',sub:'west',activity:'REST'});}});
