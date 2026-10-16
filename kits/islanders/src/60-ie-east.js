// prefix: ie
// ================================================================= THE EAST: Kautoa's peaked houses
// The old island kingdom builds after Sumba (the owner's "sumba" references): a square house on piles behind a veranda,
// a wide low skirt of golden grass thatch, and out of its middle a TOWER of thatch rising three or four times the skirt's
// height to a short ridge with carved finials; the facades of the wealthy woven in nested diamonds and chevrons; megalith
// tombs before the doors; buffalo horns on the veranda posts; the same carved posts and white moon as the West. The poor
// patch the skirts with iron and live under hips without a tower. ieHouse draws any of them from a parameter set.
// Frame: origin on the ground at the plot centre, +z the front (the veranda and the steps).
/* o: w, d (the room), floorY, wallH, ver (the veranda's width round the room; o.verFront the front's), roof {over, skirtH
   (the skirt's rise), skirtS (its top's scale of the eave), towerH (the tower above the skirt; 0 none), towerS (the tower's
   base scale), topSx, topSz (the ridge), sq, mk, col, patch, th}, towers (several: [[x, z, scale]], over one long skirt),
   wallMk, wallCol, wallMkf, facade (a woven or painted key on the front wall and the tower's front), finial 'figure' |
   'horns' | 'moon' | 'none', posts 'carved' | 'plain', hornPosts (buffalo horns on the front posts), tombs [[x, z, ry, s,
   figures]], stair, tier, beds, furn, extra(top, sk) */
function ieHouse(o){const w=o.w,d=o.d,fy=o.floorY,wh=o.wallH||2.1,ver=o.ver===undefined?1.1:o.ver,vf=o.verFront===undefined?ver+.4:o.verFront,
 R=Object.assign({over:.7,skirtH:1.5,skirtS:.5,towerH:7,towerS:.42,topSx:.2,topSz:.05,sq:7,mk:'thatchR',th:.32},o.roof||{}),top=fy+wh,col=R.col||P(o.thatchKey||'thatchE');
 const W2=w/2+ver,Dz0=-d/2-ver,Dz1=d/2+vf,dw=W2*2,dd=Dz1-Dz0,dcz=(Dz0+Dz1)/2;
 /* the piles carry the deck (veranda included); the room's posts run up through the deck */
 if(fy>.35){isPiles(isSpan(-W2+.2,W2-.2,Math.max(2,Math.round(dw/2.1)+1)),isSpan(Dz0+.2,Dz1-.2,Math.max(2,Math.round(dd/2.1)+1)),fy-IS_T,{r:o.pileR||.15,mk:'wood',col:P('wood'),beamY:fy*.5});}
 else box('earth',0,0,dcz,dw+.3,fy+.05,dd+.3,P('earth'));
 isCutFloor(fy);
 isDeck(dw,dd,fy,{z:dcz,col:P('planks'),beam:fy>.35});
 isWalls(w,d,fy,wh,o.wallMk||'bamboo',o.wallCol||P('bamboo'),{front:o.front||[{x:0,w:1.0,h:1.8,door:true}],back:o.back||[],left:o.left||[{x:0,w:.6,y:.9,h:.6}],right:o.right||[{x:0,w:.6,y:.9,h:.6}],
  mkf:o.wallMkf,colf:o.wallColf,frame:P('woodD'),shutMk:'bamboo',shutCol:P('bamboo')});
 if(o.facade)W(0,0,d/2+.01,0,()=>{box(o.facade,-w/4-.3,fy+.05,0,w/2-1.1,wh-.15,.03,WHITE);box(o.facade,w/4+.3,fy+.05,0,w/2-1.1,wh-.15,.03,WHITE);});
 /* the veranda's posts, carrying the skirt's eave */
 const pc=o.posts==='plain'?null:'carved';
 isNoCut(()=>{const xs=isSpan(-W2+.15,W2-.15,Math.max(2,Math.round(dw/2.6)+1));for(const x of xs){
   if(pc)isPou(x,fy,Dz1-.15,wh-.05,.12,{mk:'carved',n:2});else cyl('wood',x,fy,Dz1-.15,.1,wh,P('wood'),8);
   if(o.hornPosts&&Math.abs(x)<W2-.5)isHorns(x,fy+wh*.72,Dz1-.02,0,.9);}
  for(const z of isSpan(Dz0+.15,Dz1-.15,Math.max(2,Math.round(dd/2.6)+1)).slice(0,-1))for(const s of [-1,1])cyl('wood',s*(W2-.15),fy,z,.1,wh,P('wood'),8);
  if(ver>.5)for(const s of [-1,1])isRail([s*W2,Dz1],[s*W2,Dz0],fy,{h:.75,panel:'lattice'});});
 /* the roof: one skirt over the whole deck, a tower out of it (or several) */
 const hw=W2+R.over,hd=(dd)/2+R.over,eY=top-.05,sk=eY+R.skirtH;let towerTop=sk;
 W(0,0,dcz,0,()=>{
  const towers=o.towers||(R.towerH>0?[[0,0,1]]:[]);
  isSpire({hw,hd,sq:R.sq,mk:R.mk,col,patch:R.patch,th:R.th,cap:!towers.length,
   prof:towers.length?[[1,1,eY],[R.skirtS,R.skirtS,sk],[R.skirtS*.62,R.skirtS*.6,sk+.6]]:[[1,1,eY],[R.skirtS*.5,R.skirtS*.15,sk+.9]]});
  for(const [tx,tz,ts] of towers)W(tx,0,tz,0,()=>{const th_=R.towerH*ts,bs=R.towerS*ts;
   const sp=isSpire({hw,hd,sq:R.sq,mk:R.mk,col,patch:R.patch?R.patch*.5:0,th:R.th,nu:28,sub:4,
    prof:[[bs*1.05,bs*1.05,sk-.4],[bs,bs*.92,sk+.3],[bs*.72,bs*.6,sk+th_*.4],[bs*.5,bs*.34,sk+th_*.75],[R.topSx*ts,R.topSz*ts+.02,sk+th_]]});
   towerTop=Math.max(towerTop,sp.top);
   if(o.facade&&o.towerFacade!==false){const zf=hd*bs*.92+.05;psurf(o.facade,(u,v)=>{const y=sk+.5+v*(th_*.32),t=(y-(sk+.3))/(th_*.4-.3),sx=lerp(bs,bs*.72,clamp(t,0,1))*hw*.86,sz=lerp(bs*.92,bs*.6,clamp(t,0,1))*hd+R.th*.3+.05;return [(u-.5)*2*sx*(1-v*.25),y,sz];},4,6,WHITE,{flip:false});}
   /* the finials at the ridge's two ends */
   for(const s of [-1,1]){const fx=s*sp.topW*.85,fy2=sp.top+.15;
    if(o.finial==='horns')isHorns(fx,fy2,0,s>0?-PI/2:PI/2,1.0);else if(o.finial==='moon'){if(s>0)isMoonDisc(0,fy2+.6,0,0,.5);}
    else if(o.finial!=='none')isFigure(fx,fy2,0,0,.9,{mk:'carved'});}});});
 if(!o.towers&&R.towerH<=0)towerTop=sk+.9;
 /* the steps up to the front veranda */
 isNoCut(()=>{if(fy>.35){if(o.stair==='ladder')isLadder(o.stairX||0,Dz1+.02,0,fy,{});else if(o.stair==='log')isLogLadder(o.stairX||0,Dz1+.02,0,fy);else if(o.stair!=='none')isStair(o.stairX||0,Dz1+.02,0,0,fy,o.stairW||1.2,{mk:'stone'===o.stairMk?'stone':'planks'});}
  for(const t of o.tombs||[])isTomb(t[0],t[1],t[2]||0,{s:t[3]||1,figures:t[4]});});
 if(o.tier)isFurnRoom(w-.4,d-.4,fy,o.tier,{ceil:wh+R.skirtH*.6,beds:o.beds,extra:o.furn});
 if(o.underPig&&fy>1.2)place('pig',w*.2,-d*.1,PI*.3,{mode:'idle',sub:'east'});
 if(o.extra)o.extra(top,sk,towerTop);
 return {top,sk,towerTop,W2,Dz0,Dz1};}
/* ---------------------------------------------------------------- the poor */
defBuilding({key:'ie-hut-scrap',name:'Scrap hut (Kautoa)',seed:6001,cut:true,w:8.2,d:7.4,h:5.0,budget:60000,
 tags:{types:['dwelling-single'],wealth:'poor',style:'east'},
 note:'a hut on low stumps under a hip of corrugated iron and tin, tyres on the roof, walls of salvage and tarp, drums for water',
 build(o){ieHouse({w:4,d:3.4,floorY:.7,wallH:1.9,ver:.3,verFront:1.0,posts:'plain',roof:{over:.4,skirtH:1.6,skirtS:.4,towerH:0,mk:'thatch',col:P('thatchP'),patch:1,th:.06},
  wallMkf:s=>s==='front'?'reclaimed':s==='back'?'corr':s==='left'?'tin':'tarp',wallColf:s=>s==='front'?P('planks'):s==='right'?P('tarpG'):s==='left'?P('tin'):P('rust'),
  stair:'log',finial:'none',tier:'poor',beds:1,furn:[['scrap_poor_tyre_table',.6,.6,0],['scrap_poor_stool',-.3,.6,PI/2]],
  extra:(top,sk)=>{for(const [x,z] of [[-1,-.6],[1.1,.5],[.2,1.3]])isTyre(x,top+.55,z);}});
  isNoCut(()=>{isDrum(3.2,0,1.6,{col:'drumY'});isDrum(3.3,0,.9,{col:'drumR'});isScrapHeap(-3.3,.4,PI/2);});}});
defBuilding({key:'ie-hut-garden',name:'Garden hut (Kautoa)',seed:6002,cut:true,w:7.6,d:8.0,h:8.4,budget:60000,
 tags:{types:['dwelling-single'],wealth:'poor',style:'east'},
 note:'a small peaked hut on stilts at the edge of the gardens: a short tower over a skirt of grass thatch mended with iron, woven walls, a notched log',
 build(o){ieHouse({w:3.6,d:3.4,floorY:1.4,wallH:1.8,ver:.5,posts:'plain',roof:{over:.5,skirtH:1.0,towerH:3.6,towerS:.46,topSx:.3,mk:'thatch',col:P('thatchP'),patch:.3,th:.2},
  wallMk:'mat',wallCol:P('bamboo'),stair:'log',finial:'none',tier:'poor',beds:1});
  isNoCut(()=>{FURNISH('job_winnowing_mat',-2.8,0,3.2,.3,{setting:'outdoor'});isDrum(2.9,0,2.9,{col:'galv'});});}});
defBuilding({key:'ie-house-shared',name:'Shared house (Kautoa)',seed:6003,cut:true,w:12,d:9,h:8.6,budget:90000,
 tags:{types:['dwelling-multi'],wealth:'poor',style:'east'},
 note:'two families under one long hip, its little tower patched with iron, walls of planks and tin, pigs beneath',
 build(o){ieHouse({w:8,d:4.4,floorY:1.2,wallH:1.9,ver:.6,posts:'plain',roof:{over:.5,skirtH:1.4,skirtS:.48,towerH:3.2,towerS:.3,topSx:.22,mk:'thatch',col:P('thatchP'),patch:.45,th:.2},
  wallMkf:s=>s==='front'||s==='back'?'reclaimed':'corrW',wallColf:s=>s==='front'||s==='back'?P('planks'):P('rust'),front:[{x:-2,w:.9,h:1.75,door:true},{x:2,w:.9,h:1.75,door:true}],
  stair:'stair',stairX:-2,stairW:.8,finial:'none',underPig:true,tier:'poor',beds:2});
  isNoCut(()=>{isLogLadder(2,3.6,0,1.2);place('hen',4.6,3.6,1,{sub:'east'});isScrapHeap(-5.2,0,PI/2);});}});
/* ---------------------------------------------------------------- the middle */
defBuilding({key:'ie-house-uma',name:'Uma (Kautoa)',seed:6011,cut:true,w:12.4,d:13.4,h:14.5,budget:120000,
 tags:{types:['dwelling-single'],wealth:'middle',style:'east'},
 note:'the Kautoan family house: a square room on piles behind a veranda, a wide skirt of golden thatch, the tall tower rising out of it to a ridge with carved finials, a megalith tomb before the steps',
 build(o){ieHouse({w:6.4,d:6,floorY:1.6,wallH:2.1,ver:1.0,verFront:1.6,roof:{over:.8,skirtH:1.5,skirtS:.5,towerH:8,towerS:.4,topSx:.19,topSz:.05},
  wallMk:'bamboo',facade:'patWeave',towerFacade:false,stair:'stair',finial:'figure',tier:'middle',underPig:true,tombs:[[3.6,6.2,0,.8,false]]});}});
defBuilding({key:'ie-house-twin',name:'Twin-peaked house (Kautoa)',seed:6012,cut:true,w:18,d:13,h:14.0,budget:150000,
 tags:{types:['dwelling-multi'],wealth:'middle',style:'east'},
 note:'a long house for two related families: one skirt over both rooms, two towers rising from it, a long veranda, the family\'s tombs before it',
 build(o){ieHouse({w:12,d:6,floorY:1.6,wallH:2.1,ver:1.0,verFront:1.6,roof:{over:.8,skirtH:1.5,skirtS:.62,towerH:7,towerS:.24,topSx:.12,topSz:.04,sq:9},
  towers:[[-3.1,0,1],[3.1,0,1]],front:[{x:-3,w:1,h:1.8,door:true},{x:3,w:1,h:1.8,door:true}],wallMk:'bamboo',facade:'patWeave',towerFacade:false,stair:'stair',stairX:0,stairW:1.6,
  finial:'figure',tier:'middle',beds:2,tombs:[[-5,6.4,0,.85,false],[5,6.4,0,.85,true]]});}});
defBuilding({key:'ie-house-clan',name:'Clan house (Kautoa)',seed:6013,cut:true,w:15,d:16,h:17,budget:150000,
 tags:{types:['dwelling-multi'],wealth:'middle',style:'east'},
 note:'a clan\'s great house: a broad room, verandas all round, a very tall tower with horns on its ridge, buffalo horns on the front posts, woven panels on the facade',
 build(o){ieHouse({w:8.4,d:8,floorY:1.8,wallH:2.3,ver:1.4,verFront:2.0,roof:{over:.9,skirtH:1.8,skirtS:.5,towerH:10,towerS:.36,topSx:.19,topSz:.05},
  wallMk:'bamboo',facade:'patGableE',towerFacade:false,stair:'stair',stairW:1.6,finial:'horns',hornPosts:true,tier:'middle',beds:2,
  furn:[['islander_common_loom',2.4,0,-PI/2],['islander_common_kava_bowl',0,1.6,0]],tombs:[[-4.5,7.6,0,1,true]]});}});
/* ---------------------------------------------------------------- the rich */
defBuilding({key:'ie-house-wealthy',name:'Wealthy house (Kautoa)',seed:6021,cut:true,w:16,d:17,h:20,budget:200000,
 tags:{types:['dwelling-single'],wealth:'rich',style:'east'},
 note:'a wealthy family\'s house (the owner\'s "sumba - wealthy" reference): the tower\'s face woven in nested diamonds and chevrons from the skirt to the ridge, carved posts hung with horns, the moon on the ridge, two tombs with stone figures',
 build(o){ieHouse({w:8.6,d:8,floorY:2.0,wallH:2.4,ver:1.4,verFront:2.0,roof:{over:1.0,skirtH:1.7,skirtS:.48,towerH:12.5,towerS:.42,topSx:.2,topSz:.05},
  wallMk:'planks',wallCol:P('woodL'),facade:'patGableE',stair:'stair',stairW:1.8,finial:'moon',hornPosts:true,tier:'rich',beds:2,
  furn:[['islander_court_throne',0,-1.6,0],['islander_court_statue',3.3,-3,0]],tombs:[[-4.2,8.6,0,1.1,true],[4.2,8.6,0,1.1,true]]});}});
defBuilding({key:'ie-house-great',name:'Great uma (Kautoa)',seed:6022,cut:true,w:19,d:20,h:23,budget:220000,
 tags:{types:['dwelling-multi','religious'],wealth:'rich',style:'east',role:'ancestral house'},
 note:'the ancestral house of a noble clan: the tallest tower in the village, verandas all round on carved posts, a great tomb with stone figures, the ancestors\' shrine in the roof',
 build(o){const r=ieHouse({w:10.4,d:10,floorY:2.0,wallH:2.6,ver:1.8,verFront:2.4,roof:{over:1.1,skirtH:2.1,skirtS:.46,towerH:15,towerS:.38,topSx:.19,topSz:.05,th:.38},
  wallMk:'planks',wallCol:P('woodL'),facade:'patGableE2',stair:'stair',stairW:2.0,finial:'figure',hornPosts:true,tier:'rich',beds:2,
  furn:[['islander_court_throne',0,-2.6,0],['islander_court_tapestry',-3,-4.6,0],['islander_court_statue',4.2,-4,0],['islander_court_statue',-4.2,-4,0],['islander_common_kava_bowl',0,1.8,0]],
  tombs:[[0,9.4,0,1.4,true]]});
  isNoCut(()=>{for(const s of [-1,1])isFlag(s*8.2,9.6,10,{ry:s>0?0:PI});});}});
defBuilding({key:'ie-house-noble',name:'Noble compound (Kautoa)',seed:6023,cut:true,w:30,d:27,h:18,budget:260000,
 tags:{types:['dwelling-single'],wealth:'rich',style:'east',role:'compound'},
 note:'a noble household inside a coral-stone wall: the peaked house, two raised granaries, a row of tombs, the gate flanked by carved posts',
 build(o){W(0,0,-2,0,()=>ieHouse({w:8,d:7.2,floorY:1.9,wallH:2.3,ver:1.2,verFront:1.8,roof:{over:.9,skirtH:1.7,skirtS:.5,towerH:10,towerS:.4,topSx:.19,topSz:.05},
  wallMk:'planks',wallCol:P('woodL'),facade:'patGableE',stair:'stair',stairW:1.6,finial:'moon',hornPosts:true,tier:'rich',beds:2,furn:[['islander_court_throne',0,-1.4,0]]}));
  isNoCut(()=>{const hw=14.4,hd=12.8;for(const [x0,z0,x1,z1] of [[-hw,-hd,hw,-hd],[-hw,-hd,-hw,hd],[hw,-hd,hw,hd],[-hw,hd,-2.2,hd],[2.2,hd,hw,hd]]){const L=Math.hypot(x1-x0,z1-z0);
    W((x0+x1)/2,0,(z0+z1)/2,Math.atan2(x1-x0,z1-z0)-PI/2,()=>{box('coral',0,0,0,L+.6,1.6,.6,P('coral'));box('stone',0,1.6,0,L+.7,.14,.7,P('stone'));});}
   for(const s of [-1,1])isPou(s*2.6,0,hd+.3,3.2,.2,{mk:'carved',top:'figure'});
   for(const s of [-1,1])W(s*10,0,-6,0,()=>{isPiles(isSpan(-1.1,1.1,2),isSpan(-1.1,1.1,2),1.8,{r:.12,beams:false});for(const x of [-1.1,1.1])for(const z of [-1.1,1.1])cyl('wood',x,1.4,z,.32,.06,P('woodD'),10);
    isDeck(2.8,2.8,1.95,{col:P('planks'),beam:false});box('bamboo',0,1.95,0,2.4,1.3,2.4,P('bamboo'));isHip({hw:1.9,hd:1.9,eaveY:3.2,topY:6.2,topS:.2,topS2:.06,mk:'thatchR',col:P('thatchE'),th:.2});});
   for(let k=0;k<3;k++)isTomb(-7+k*7,8.6,0,{s:.9,figures:k===1});});}});
