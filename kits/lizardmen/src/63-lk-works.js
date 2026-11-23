// prefix: lkw
// ================================================================= THE CAPITAL'S WORKS AND CASTE HOUSES IN STONE (Basilisk, PLAN.md section 7)
// Completes the green-black stone set of Basilisk (settlements/basilisk/PLAN.md section 7; the owner, 2026-11-17: "build some more
// additional building types"): the stone Makers' carapace house (lk-makers), the stone warriors' and Bulwarks' lodge (lk-lodge), the
// stone Allotment granary (lk-granary), the eleven-bay Great Bronze Hall with its seven furnaces (lk-bronzehall), the Lothal podium
// dock store and bronze jib crane (lk-dockstore), the wet-season salt boiling floor (lk-boil), and the Ley Slot wall wicket (lk-slot).
// Frame: origin on the ground at the plot centre, +z the front. Bronze only, never iron; odd counts; walls that lean wrong.

/* ---------------------------------------------------------------- stone Makers' carapace & terrace house (caste 2, 5 variants) */
defBuilding({key:'lk-makers',name:"Stone Makers' house",seed:7710,caste:2,cut:true,w:12,d:10,h:7.4,budget:85000,
 tags:{types:['dwelling-multi'],wealth:'rich',role:'dwelling'},
 note:'the Makers\' house in stone, brick and lacquer for Basilisk: five variants across basalt carapace, oxblood shingle with white bone spikes, flat-roofed Mohenjo-daro brick workshop terrace, jade scale with verdigris ribs, and kiln-flue hide carapace; 1.76 m Makers\' door',
 build(o){const v=((o&&o.v)|0)%5,L=v===2?9.4:9.0,Wd=6.4,wh=v===2?3.1:1.9,rh=v===3?4.1:4.5;lzCutFloor(.35);lzNoCut(()=>lkPlinth(L+1.8,Wd+1.8,.35,{leiwen:4.2}));
  const wMk=v===1||v===2||v===4?'brick':LK_ST,wCol=v===1||v===2||v===4?P('brick'):P('basalt');
  const T=lzBatterRoom(L,Wd,.35,wh,wMk,wCol,{lean:{front:.07,back:-.06,left:.1,right:-.04},
   mkf:v===3?(s=>s==='front'?'lacq':LK_ST):undefined,colf:v===3?(s=>s==='front'?P('lacq'):P('basalt')):undefined,
   front:[lzDoor(2,L/2+.8),lzVent(2,1.5,1.15)],back:[lzVent(2,2.2,1.15),lzVent(2,L-2.2,1.15)]});
  if(v===2){
   lzSlab(T.T,.35+wh,.28,LK_PL,P('basaltD'),.2);
   lzNoCut(()=>{for(const x of lzSpan(-L/2+1.0,L/2-1.0,5))lzHorn(x,.35+wh+.28,Wd/2-.4,0,1.35,.1,{curl:.5,lean:.2,mk:LK_PL,col:P('basaltD')});
    cyl('brick',-L/2+1.4,.35+wh+.28,-Wd/2+1.2,.28,1.9,P('brick'),8);cyl('bronzeC',-L/2+1.4,.35+wh+2.1,-Wd/2+1.2,.34,.18,P('verd'),8);});
  }else{
   const rs=[
    {mk:'basalt',col:P('basaltD'),n:7,ribMk:LK_PL,ribCol:P('basaltC'),endMk:LK_ST,endCol:P('basalt')},
    {mk:'shingle',col:P('oxblood'),n:7,ribMk:'bones',ribCol:P('bone'),endMk:'brick',endCol:P('brick')},
    null,
    {mk:'scaleOlive',col:P('jade'),n:5,ribMk:'bronzeC',ribCol:P('verd'),endMk:'lacq',endCol:P('lacq')},
    {mk:'hidePW',col:P('hideP'),n:9,ribMk:'ivory',ribCol:P('tusk'),endMk:'brick',endCol:P('brick')}
   ][v];
   lzRibRoof(L,Wd,wh+.35,wh+.35+rh,rs.n,{mk:rs.mk,col:rs.col,over:.65,ribR:.15,ribMk:rs.ribMk,ribCol:rs.ribCol,past:.42,bend:1.0,ext:.5,endMk:rs.endMk,endCol:rs.endCol,leanEnds:{left:.1,right:-.04},y0:.35});
   if(v===4)lzNoCut(()=>{cyl('brick',-L/2+1.2,.35+wh,-Wd/2+1.0,.26,3.4,P('brick'),8);cyl('bronzeC',-L/2+1.2,.35+wh+3.3,-Wd/2+1.0,.32,.18,P('verd'),8);});
  }
  W(-L*.24,.55,Wd/2-.07*.2+.05,0,()=>lzLeiwen(2.4,1.05,{cell:.3,mk:v===1||v===3?'lacqR':'bronze',back:'lacq'}));
  lkEyes(3,L*.8,.35+wh*.62,Wd/2-.07*(wh*.62)+.06,.24,1.8);
  lzNoCut(()=>lzPortal(.8,.35,Wd/2+.07,0,lzDoorH(2),{mk:v===1?'lacqR':'bronze'}));lzThreshold(.8,Wd/2+.24,0,lzDoorH(2)*LZ_DW);
  lzFurnRoom(L-.8,Wd-.7,.35,'court',{beds:2,ceil:v===2?2.6:rh*.62,extra:[['lizardmen_common_workbench',-L/2+1.3,.9,PI/2],['generic_trade_lathe',L/2-1.4,.6,-PI/2],['lizardmen_court_cabinet',-1.2,-Wd/2+1.0,0]]});}});

/* ---------------------------------------------------------------- stone warriors' and Bulwarks' lodge (castes 4 and 6, 5 variants) */
defBuilding({key:'lk-lodge',name:"Stone warriors' lodge",seed:7711,caste:4,cut:true,w:15,d:21,h:12.2,budget:125000,
 tags:{types:['dwelling-multi','military'],wealth:'rich',role:'dwelling'},
 note:'the warriors\' and Bulwarks\' tusk vault for Basilisk: five variants across dark basalt tusks, gleaming ivory tusks over oxblood shingle, hexapod bone ribs over dark hide, amber horn arches over jade scale, and verdigris bronze tusks; dual 2.8 m and 4.4 m doors',
 build(o){const v=((o&&o.v)|0)%5,L=16,Wd=10.2,h=v===3?8.9:9.4;lzCutFloor(.35);
  const vs=[
   {n:7,mk:LK_PL,tCol:P('basaltD'),sMk:'basalt',sCol:P('basalt'),wMk:LK_ST,wCol:P('basalt')},
   {n:7,mk:'ivory',tCol:P('tusk'),sMk:'shingle',sCol:P('oxblood'),wMk:'brick',wCol:P('brick')},
   {n:9,mk:'bones',tCol:P('bone'),sMk:'hideW',sCol:P('hideD'),wMk:'lacq',wCol:P('lacq')},
   {n:5,mk:'horn',tCol:P('horn'),sMk:'scaleOlive',sCol:P('jade'),wMk:LK_ST,wCol:P('basaltD')},
   {n:7,mk:'bronzeC',tCol:P('verd'),sMk:'basalt',sCol:P('basaltD'),wMk:'brick',wCol:P('brick')}
  ][v];
  W(0,0,0,-PI/2,()=>{lzNoCut(()=>lkPlinth(L+2.2,Wd+2.2,.35,{leiwen:v%2?7.0:0}));
   lzTuskVault(L,Wd,h,vs.n,{r:v===3?.42:.38,mk:vs.mk,tuskCol:vs.tCol,skinMk:vs.sMk,skinCol:vs.sCol,wallMk:vs.wMk,wallCol:vs.wCol,eaveY:1.95,y0:.35,
    doors:[{z:2.45,c:4},{z:-1.55,c:6}],eyes:[[.75,h*.68],[2.6,h*.48],[-1.55,h*.64],[3.9,h*.28],[-3.9,h*.26]]});
   lzFurnRoom(Wd-1.1,L-1.4,.35,'court',{beds:3,ceil:h*.6,extra:[['generic_trade_armour_stand',-1.2,-L/2+1.3,0],['generic_trade_armour_stand',1.2,-L/2+1.3,0],
    ['generic_trade_weapon_rack',-3.8,0,PI/2],['lizardmen_training_training_dummy',3.3,5.4,0]]});});}});

/* ---------------------------------------------------------------- stone Allotment granary (after Mohenjo-daro, 5 variants) */
defBuilding({key:'lk-granary',name:'Stone Allotment granary',seed:7712,caste:3,cut:true,w:15,d:12,h:10.4,budget:100000,
 tags:{types:['industry','infrastructure'],wealth:'rich',role:'store',job:'farming'},
 note:'the capital\'s Allotment granary: eleven basalt or baked-brick podium blocks with air-duct slots keeping sabkha damp from the grain, bronze leiwen trim, and stone, oxblood-shingle, jade-scale or flat-terrace storehouses above',
 build(o){const v=((o&&o.v)|0)%5,L=10.8,Wd=7.6,py=1.95;lzCutFloor(py+.2);
  const pMk=v===1||v===3?'brick':LK_ST,pCol=v===1||v===3?P('brick'):P('basalt');
  lzNoCut(()=>{for(let i=0;i<6;i++)for(let j=0;j<2;j++){if(i===5&&j===1)continue;box(pMk,-L/2+.95+i*1.82,0,-Wd/2+1.65+j*3.9,1.58,py,3.25,pCol);}
   lkPlinth(L+1.0,Wd+1.0,.3,{leiwen:7.2});W(0,py-.1,0,0,()=>box(LK_PL,0,0,0,L+.9,.3,Wd+.9,P('basaltD')));
   for(const s of [-1,1])lzHorn(s*(L/2+.45),py+.22,Wd/2-.65,PI,2.3,.11,{curl:.42,mk:v===1?'ivory':LK_PL,col:v===1?P('tusk'):P('basaltD')});
   W(L/2-.25,0,Wd/2+.32,0,()=>{const run=2.3;for(let i=0;i<9;i++){const t=(i+1)/9;box(LK_PL,0,t*py-.14,run*(1-t)+.12,1.3,.16,.36,P('basaltD'));}});});
  const dh=lzDoorH(3),dw=dh*LZ_DW,wh=v===3?3.4:2.4;
  const Tg=lzBatterRoom(L-.6,Wd-.6,py+.2,wh,v===1?'brick':LK_ST,P(v===1?'brick':'basalt'),{lean:{front:.06,back:-.05,left:.09,right:-.04},
   front:[{s:(L-.6)/2+2.3,w:dw,h:dh,door:true},lzVent(3,1.4,1.4)],back:[lzVent(3,2.2,1.4),lzVent(3,L-2.8,1.4)]});
  if(v===3){
   lzSlab(Tg.T,py+.2+wh,.32,LK_PL,P('basaltD'),.2);
   lzNoCut(()=>{for(const x of lzSpan(-L/2+1.2,L/2-1.2,7))lzHorn(x,py+.52+wh,(Wd-.6)/2-.3,0,1.3,.1,{curl:.48,lean:.2,mk:'ivory'});});
  }else{
   const rMk=v===1?'shingle':v===2?'scaleOlive':v===4?'hideW':'basalt';
   const rCol=v===1?P('oxblood'):v===2?P('jade'):v===4?P('hideP'):P('basaltD');
   const rbMk=v===1||v===4?'bones':v===2?'bronzeC':LK_PL,rbCol=v===1||v===4?P('bone'):v===2?P('verd'):P('basaltC');
   lzRibRoof(L-.6,Wd-.6,py+2.5,py+6.9,9,{mk:rMk,col:rCol,over:.62,ribR:.14,ribMk:rbMk,ribCol:rbCol,past:.26,bend:.95,ext:.5,endMk:v===1?'brick':LK_ST,endCol:P(v===1?'brick':'basalt'),leanEnds:{left:.09,right:-.04},y0:py+.2});
  }
  lkEyes(3,L-2,py+1.45,(Wd-.6)/2-.06*1.25+.06,.26,2.8);
  lzNoCut(()=>lzPortal(2.3,py+.2,(Wd-.6)/2+.07,0,dh,{mk:v===1?'lacqR':'bronze'}));lzThreshold(2.3,(Wd-.6)/2+.22,0,dw);
  for(const [x,z] of [[-3.5,-1.7],[-1.9,-2.0],[-.2,-1.8],[1.5,-2.0],[3.1,-1.7],[-3.0,.5],[-1.1,.7],[.9,.5]])FURNISH(pick(['generic_sack','generic_storage_jar','generic_basket','generic_floor_basket']),x,py+.2,z,rr(0,TAU));
  FURNISH('lizardmen_common_board',3.6,py+.2,-2.3,0);FURNISH_HANG('lizardmen_court_hanging',0,py+(v===3?3.1:5.2),0,0);}});

/* ---------------------------------------------------------------- the Great Bronze Hall (Basilisk's bay foundry: 45 x 27 m, 11 bays, 7 furnaces) */
function lkwFurnace(x,y,z){W(x,y,z,0,()=>{
 box(LK_ST,0,0,0,2.8,1.35,2.6,P('basaltD'));
 lzDome(0,1.25,[[1.28,0],[1.32,.55],[1.08,1.25],[.68,1.95],[.42,2.45]],{mk:'brick',col:P('brick'),seg:12});
 cyl('brick',0,3.4,0,.44,4.8,P('brick'),10);cyl('bronzeC',0,7.95,0,.52,.28,P('verd'),10);
 /* glowing throat and bronze tapping spout on +z */
 box('plain',0,.48,1.26,.74,.52,.14,P('ember'));box('plain',0,.56,1.31,.46,.32,.08,P('flame'));
 box('bronzeC',0,.32,1.48,.28,.12,.46,P('bronze'));
 for(const s of [-1,1])beam('bronzeC',[s*1.38,.62,.4],[s*1.85,.35,.9],.055,P('verd'),true,6);});}

defBuilding({key:'lk-bronzehall',name:'Great Bronze Hall',seed:7713,caste:2,cut:true,w:45,d:27,h:14.2,budget:190000,
 tags:{types:['industry','civic'],wealth:'rich',role:'foundry',job:'smithing'},
 note:'Basilisk\'s Great Bronze Hall on the bay (PLAN.md section 4.9): 45 by 27 m on a bronze-inlaid basalt plinth, eleven polished stone ribs over a slab roof, seven domed reverberatory furnaces casting Tuatara\'s copper and Komodo and Iguana\'s tin nine to one, sunken sand mould beds, charge bins and stacked Coil ingots',
 build(o){const L=38,Wd=19,wh=4.0,rh=6.8,y0=.45;lzCutFloor(y0);
  lzNoCut(()=>lkPlinth(42,24,y0,{leiwen:18}));
  const dhM=lzDoorH(6),dwM=dhM*LZ_DW,dhS=lzDoorH(2),dwS=dhS*LZ_DW;
  lzBatterRoom(L,Wd,y0,wh,LK_ST,P('basalt'),{lean:{front:.08,back:-.06,left:.07,right:-.05},
   front:[{s:L/2,w:dwM,h:dhM,door:true},{s:L/2-11,w:dwS,h:dhS,door:true},{s:L/2+11,w:dwS,h:dhS,door:true},lzVent(4,4.0,2.4),lzVent(4,L-4.0,2.4)],
   back:[lzVent(4,6,2.5),lzVent(4,13,2.5),lzVent(4,25,2.5),lzVent(4,32,2.5)]});
  lzRibRoof(L,Wd,y0+wh+.1,y0+wh+rh,11,{mk:'basalt',col:P('basaltD'),over:.85,ribR:.22,ribMk:LK_PL,ribCol:P('basaltC'),past:.28,bend:.95,ext:.7,endMk:LK_ST,endCol:P('basalt'),leanEnds:{left:.07,right:-.05},y0});
  lkEyes(7,L-4,y0+wh*.68,Wd/2-.08*(wh*.68)+.06,.38,2.9);
  lzNoCut(()=>{
   lzPortal(0,y0,Wd/2+.08,0,dhM,{mk:'bronze',eye:true,shared:true});
   for(const sx of [-11,11])lzPortal(sx,y0,Wd/2+.07,0,dhS,{mk:'bronze'});
   /* seven chimney crowns rising above the back slope and smoke from the active smelts */
   for(let i=0;i<7;i++){const fx=-13.8+i*4.6;cyl('brick',fx,y0+wh+2.2,-5.6,.42,3.4,P('brick'),10);cyl('bronzeC',fx,y0+wh+5.45,-5.6,.5,.26,P('verd'),10);
    if(i%2===0)smokeAt(fx,y0+wh+5.9,-5.6,{r:.42,kind:'fire'});}
   /* exterior ore and ingot apron */
   for(const [hx,col,mk] of [[-15.5,P('verd'),'bronze'],[-12.8,P('verd'),'bronze'],[13.2,P('basaltD'),'basalt'],[15.8,P('lacq'),'lacq']])cone(mk,hx,0,10.6,1.25,.95,col,8);});
  lzThreshold(0,Wd/2+.28,0,dwM);
  /* seven reverberatory crucible furnaces along the north (-z) wall */
  for(let i=0;i<7;i++)lkwFurnace(-13.8+i*4.6,y0,-5.6);
  /* two sunken sand casting pits in the central floor: ingot channels and clapperless bell moulds */
  for(const px of [-6.4,6.4])W(px,y0,.8,0,()=>{
   box(LK_PL,0,0,0,7.4,.22,4.2,P('basaltD'));box('earthR',0,.22,0,6.6,.06,3.4,P('earthP'));
   for(let m=0;m<5;m++){box('bronze',-2.2+m*1.1,.28,-.8,.68,.12,1.1,P(m===2?'flame':'bronze'));}
   lathe('brick',-1.4,.95,[[.48,0],[.52,.45],[.34,.92],[.18,1.08]],10,P('brick'),{});
   lathe('bronzeC',1.4,.95,[[.44,0],[.48,.42],[.3,.88],[.15,1.02]],10,P('bronze'),{});});
  /* stacked outward-gift bronze ingots on basalt skids */
  for(const sx of [-15.2,15.2])W(sx,y0,2.2,0,()=>{box(LK_PL,0,0,0,2.4,.2,1.6,P('basaltD'));
   for(let r=0;r<3;r++)for(let c=0;c<4-r;c++)box('bronze',-.65+c*.44+r*.22,.2+r*.16,0,.38,.15,1.1,P('bronze'));});
  FURNISH('generic_trade_forge',-15.4,y0,-1.8,PI/2);FURNISH('generic_trade_anvil',-13.2,y0,-1.6,0);
  FURNISH('generic_trade_forge',15.4,y0,-1.8,-PI/2);FURNISH('generic_trade_anvil',13.2,y0,-1.6,PI);
  FURNISH('lizardmen_common_workbench',-11.0,y0,5.8,PI);FURNISH('lizardmen_common_workbench',11.0,y0,5.8,PI);
  FURNISH('generic_trade_bin',-4.2,y0,6.2,PI);FURNISH('generic_trade_bin',4.2,y0,6.2,PI);
  FURNISH('lizardmen_common_rack',-16.4,y0,5.6,PI/2);FURNISH('generic_crate',16.0,y0,5.8,-.3);}});

/* ---------------------------------------------------------------- the Dock Store on its Lothal podium (33 x 21 m) */
defBuilding({key:'lk-dockstore',name:'Stone dock store',seed:7714,caste:2,cut:true,w:33,d:21,h:11.8,budget:170000,
 tags:{types:['industry','infrastructure'],wealth:'rich',role:'warehouse',job:'warehousing'},
 note:'the capital\'s waterborne Coil store beside the Lothal dock (PLAN.md section 4.9): thirteen cyclopean basalt ventilation piers keeping bay spray clear of the floor, a stone quay ramp and horned bronze cargo crane on +z, and a nine-rib basalt vault over tallied Allotment stores',
 build(o){const L=27,Wd=14.4,py=2.2;lzCutFloor(py+.24);
  lzNoCut(()=>{
   /* 13 ventilation piers (odd: 7 front, 6 back with the crane bastion occupying the seventh) */
   for(let i=0;i<7;i++)for(let j=0;j<2;j++){if(i===6&&j===1)continue;
    box(LK_ST,-L/2+1.8+i*3.9,0,-Wd/2+2.4+j*(Wd-4.8),3.1,py,3.8,P('basalt'));}
   box(LK_PL,0,py-.08,0,L+1.4,.32,Wd+1.4,P('basaltD'));
   W(0,py-.02,(Wd+1.4)/2+.03,0,()=>lzLeiwen(L*.75,.48,{cell:.28,mk:'bronze',back:'lacq'}));
   /* central stone loading ramp on +z */
   for(let s=0;s<10;s++){const t=(s+1)/10;box(LK_PL,0,0,Wd/2+3.1*(1-t)+.35,3.6,t*py,.38,P('basaltD'));}
   /* cantilevered horned bronze-and-basalt cargo jib crane on the +x/+z quay corner */
   W(L/2-2.2,py+.24,Wd/2-.4,.35,()=>{
    cyl('bronzeC',0,0,0,.26,4.2,P('bronze'),10);
    lzHorn(0,3.6,0,0,4.2,.22,{curl:.48,lean:.52,mk:LK_PL,col:P('basaltD')});
    beam('rope',[0,3.8,.2],[0,5.8,2.4],.035,P('reedD'),true,5);
    beam('rope',[0,5.8,2.4],[0,1.8,2.4],.035,P('reedD'),true,5);
    box('matW',0,1.2,2.4,1.1,.85,1.1,P('reedL'));});});
  const dh=lzDoorH(6),dw=dh*LZ_DW;
  lzBatterRoom(L-.8,Wd-.8,py+.24,2.8,LK_ST,P('basalt'),{lean:{front:.07,back:-.05,left:.08,right:-.05},
   front:[{s:(L-.8)/2,w:dw,h:dh,door:true},lzVent(4,3.4,1.7),lzVent(4,L-4.2,1.7)],
   back:[lzVent(4,4.5,1.7),lzVent(4,13.5,1.7),lzVent(4,22.5,1.7)]});
  lzRibRoof(L-.8,Wd-.8,py+2.95,py+7.8,9,{mk:'basalt',col:P('basaltD'),over:.7,ribR:.18,ribMk:LK_PL,ribCol:P('basaltC'),past:.26,bend:.95,ext:.55,endMk:LK_ST,endCol:P('basalt'),leanEnds:{left:.08,right:-.05},y0:py+.24});
  lkEyes(5,L-4,py+1.85,(Wd-.8)/2-.07*1.6+.06,.32,2.9);
  lzNoCut(()=>{lzPortal(0,py+.24,(Wd-.8)/2+.08,0,dh,{mk:'bronze',eye:true,shared:true});
   lzStela(-6.2,Wd/2+1.8,.15,2.6,.75,{});lzStela(6.2,Wd/2+1.8,-.15,2.6,.75,{mirror:true});});
  lzThreshold(0,(Wd-.8)/2+.26,0,dw);
  for(let i=0;i<5;i++){const gx=-9.6+i*4.8;if(Math.abs(gx)<2.2)continue;
   FURNISH('generic_crate',gx,py+.24,-4.2,0);FURNISH('generic_sack',gx+.9,py+.24,-3.8,.4);
   FURNISH('generic_storage_jar',gx-.8,py+.24,3.4,0);FURNISH('generic_trade_barrel',gx+.7,py+.24,3.2,.2);}
  FURNISH('lizardmen_common_chest',-2.8,py+.24,-4.4,0);FURNISH('lizardmen_common_chest',2.8,py+.24,-4.4,0);
  FURNISH('lizardmen_common_board',-10.8,py+.24,0,PI/2);FURNISH('lizardmen_common_rack',10.8,py+.24,0,-PI/2);}});

/* ---------------------------------------------------------------- wet-season salt boiling floor (27 x 15 m, open pavilion) */
defBuilding({key:'lk-boil',name:'Salt boiling floor',seed:7715,caste:2,cut:false,w:27,d:15,h:7.6,budget:110000,
 tags:{types:['industry'],wealth:'middle',role:'saltworks',job:'salt'},front:{x:0,z:7.5,yaw:0},
 note:'Basilisk\'s wet-season salt works on the sabkha strand (PLAN.md section 4.9, scaled to 55 t/yr): an open-eaved seven-rib basalt-slab pavilion keeping ~2,000 mm of hypertropic rain off five brick brine-boiling flues fired with jungle charcoal, crusted bronze evaporating pans, a brine settling tank and conical salt-draining baskets',
 build(o){const L=24,Wd=12.4,y0=.28;
  box(LK_PL,0,0,0,L+1.4,y0,Wd+1.4,P('basaltD'));
  /* seven pairs of battered basalt pillars supporting an open-sided basalt-slab canopy */
  for(const x of lzSpan(-L/2+1.2,L/2-1.2,7))for(const s of [-1,1])box(LK_ST,x,y0,s*(Wd/2-.55),.68,3.1,.68,P('basalt'));
  lzRibRoof(L,Wd,y0+3.05,y0+6.4,7,{mk:'basalt',col:P('basaltD'),over:.65,ribR:.15,ribMk:LK_PL,ribCol:P('basaltC'),past:.24,bend:.95,ext:.45,ends:false,y0});
  /* five long brick brine-boiling hearths (odd: 5) with glowing fire mouths and white-crusted bronze pans */
  for(let i=0;i<5;i++){const hx=-7.2+i*3.6;W(hx,y0,-.4,0,()=>{
   box('brick',0,0,0,2.1,.78,6.8,P('brick'));
   box('plain',0,.24,3.38,.68,.38,.12,P('ember'));
   box('bronzeC',0,.78,0,1.92,.22,6.2,P('bronze'));
   box('earthR',0,.96,0,1.74,.08,5.9,P('white'));
   cyl('brick',0,.78,-3.1,.28,3.8,P('brick'),8);
   if(i%2===0)smokeAt(hx,y0+4.7,-3.5,{r:.35,kind:'steam'});});}
  /* brine settling trough on -x and jungle-charcoal bunker on +x */
  W(-10.4,y0,0,0,()=>{box(LK_ST,0,0,0,2.2,.92,8.4,P('basalt'));box('jade',0,.78,0,1.76,.08,7.9,P('turq'));});
  W(10.4,y0,-1.4,0,()=>{box(LK_ST,0,0,0,2.2,.85,5.2,P('basaltD'));cone('lacq',0,.45,0,.95,1.15,P('black'),8);});
  /* salt-cone draining rack and baskets on +z apron */
  for(let k=0;k<5;k++)cone('earthR',-3.6+k*1.8,y0,4.8,.38,.62,P('white'),8);
  FURNISH('generic_basket',8.8,y0,4.4,.3,{setting:'outdoor'});FURNISH('generic_sack',10.2,y0,4.2,-.4,{setting:'outdoor'});
  FURNISH('generic_storage_jar',-9.8,y0,4.8,0,{setting:'outdoor'});}});

/* ---------------------------------------------------------------- the Ley Slot through Basilisk's east wall (1.2 m Tender wicket) */
defBuilding({key:'lk-slot',name:'Ley Slot wall wicket',seed:7716,caste:1,cut:false,w:20,d:12,h:11.5,budget:85000,
 tags:{types:['military','infrastructure','religious'],wealth:'rich',role:'gate'},front:{x:0,z:6,yaw:0},
 note:'the Ley Slot in Basilisk\'s east wall (PLAN.md section 4.7): a 20 m cyclopean wall run pierced straight on the 50.6 degree ley line by a Tender\'s triangular wicket, crowned with a glowing spiral eye; the only opening in the 8.2 km wall besides the South Gate',
 build(o){const dh=lzDoorH(1),dw=dh*LZ_DW,PB=.3;
  lzNoCut(()=>box(LK_PL,0,0,0,19.4,PB,6.4,P('basaltD')));
  /* two cyclopean wall wings flanking the central ley monolith */
  for(const s of [-1,1])W(s*6.1,PB,0,0,()=>lkWallRun(6.8,8.0,{n:5}));
  const T=lzBatterRoom(5.6,4.2,PB,8.6,LK_ST,P('basaltD'),{lean:{front:.08,back:-.04,left:0,right:0},
   front:[{s:2.8,w:dw,h:dh,openOnly:true}],back:[{s:2.8,w:dw,h:dh,openOnly:true}]});
  lzSlab(T.T,PB+8.6,.42,'basalt',P('basaltD'),.12);
  for(const k of [-1,1]){const f=(u,v)=>{const y=dh*v;return [k*dw/2*(1-v),PB+y,lerp(-2.1-.04*y,2.1-.08*y,u)];};
   psurf(LK_PL,f,3,3,P('basaltD'),{flip:k>0});}
  /* parapet horns on the central pier (3: odd) and straight paved ley flagstones running through */
  for(const x of [-1.8,0,1.8])lzHorn(x,PB+9.0,1.5,0,1.7,.14,{curl:.55,lean:.25,mk:LK_PL,col:P('basaltD'),nt:7,ns:6});
  box(LK_PL,0,.04,0,dw+.55,.28,11.2,P('basaltC'));
  box('bronzeC',0,PB+.02,0,.14,.04,11.0,P('verd'));
  for(const s of [-1,1]){lzPortal(0,PB,s*2.14,s>0?0:PI,dh,{mk:'bronze',eye:s>0});lzThreshold(0,s*2.55,s>0?0:PI,dw);}
  W(0,PB+dh+1.25,2.1-.08*(dh+1.25)+.05,0,()=>lzLeiwen(3.8,.68,{cell:.24,mk:'bronze',back:'lacq'}));
  lzEye(0,PB+5.4,2.1-.08*5.4+.07,0,.62,{mk:'bronze',glow:true});
  door(0,PB,2.2,0,dw,dh);}});

/* ---------------------------------------------------------------- two-storey stone Makers' courtyard insula (caste 2, holds 44, 5 variants) */
defBuilding({key:'lk-insula',name:"Stone Makers' courtyard insula",seed:7717,caste:2,cut:true,w:26,d:22,h:11.4,budget:150000,
 tags:{types:['dwelling-multi','industry'],wealth:'rich',role:'dwelling'},
 note:'a two-storey Mohenjo-daro courtyard block for Basilisk\'s 30,000-resident wards: five distinct compositions across basalt kiln-halls, flat-roofed baked-brick terraces with bone-and-mat pergolas, twisted corner towers, oxblood-and-bone lacquer courts and verdigris bronze workshops',
 build(o){const v=((o&&o.v)|0)%5,y0=.35,dh=lzDoorH(2),dw=dh*LZ_DW;lzCutFloor(y0);
  lzNoCut(()=>lkPlinth(24.8,20.8,y0,{leiwen:11.0}));
  box('stoneP',0,y0-.08,0,22.8,.12,18.8,P('basaltD'));
  const rWallMk=v===1||v===3?'brick':LK_ST,rWallCol=v===1||v===3?P('brick'):P('basalt');
  const rRoofMk=v===1?'shingle':v===2?'scaleOlive':v===3?'hideW':v===4?'bronzeC':'basalt';
  const rRoofCol=v===1?P('oxblood'):v===2?P('jade'):v===3?P('hideD'):v===4?P('verd'):P('basaltD');
  const rRibMk=v===1||v===3?'bones':v===2?'ivory':LK_PL,rRibCol=v===1||v===3?P('bone'):v===2?P('tusk'):P('basaltC');
  /* rear two-storey workshop hall (shortened on v===2 to make room for a twisted corner tower!) */
  const rW=v===2?15.6:22.4,rX=v===2?3.2:0;
  W(rX,0,-6.0,0,()=>{
   const T=lzBatterRoom(rW,6.4,y0,5.2,rWallMk,rWallCol,{lean:{front:.06,back:-.05,left:.08,right:-.04},
    front:[lzDoor(2,rW/2),lzVent(2,3.4,1.2),lzVent(2,rW-3.4,1.2),lzVent(2,5.0,3.4),lzVent(2,rW-5.0,3.4)],
    back:[lzVent(2,4.0,3.4),lzVent(2,rW/2,3.4),lzVent(2,rW-4.0,3.4)]});
   lzCourseRing(T.T,y0+2.35,.24,1.0,LK_PL,P('basaltC'));
   lzRibRoof(rW,6.4,y0+5.15,y0+9.6,v===2?7:v===3?11:9,{mk:rRoofMk,col:rRoofCol,over:.55,ribR:.15,ribMk:rRibMk,ribCol:rRibCol,past:.34,bend:.98,ext:.45,endMk:rWallMk,endCol:rWallCol,leanEnds:{left:.08,right:-.04},y0});
   if(v===0||v===4)for(const sx of [-6.8,0,6.8]){cyl('brick',sx,y0+5.2,-2.4,.28,4.4,P('brick'),8);cyl('bronzeC',sx,y0+9.45,-2.4,.34,.2,P('verd'),8);}
   FURNISH('lizardmen_common_workbench',-rW/2+2.6,y0,-.8,0);FURNISH('generic_trade_lathe',rW/2-2.6,y0,-.8,PI);
   FURNISH('lizardmen_court_cabinet',-1.8,y0,-1.8,0);FURNISH('lizardmen_common_bed',2.0,y0,-1.6,0);});
  if(v===2)lzNoCut(()=>{W(-8.0,y0,-6.0,0,()=>{lzTwist(0,0,9.8,7,5.8,4.0,-.07,{mk:LK_ST,col:P('basaltD'),each:(i,yy,ww,ry)=>{if(i===4)W(0,yy+.7,0,ry,()=>lzEye(0,0,ww/2+.03,0,.32,{mk:'bronze',glow:true}));}});
   for(let i=0;i<5;i++){const a=i*TAU/5;lzHorn(Math.cos(a)*1.7,9.8,Math.sin(a)*1.7,Math.atan2(Math.cos(a),Math.sin(a)),1.8,.12,{curl:.5,lean:.3,mk:'ivory'});}});});
  /* left and right wings: flat Mohenjo-daro terraces on v===1 or one side of v===2/4, arched carapaces otherwise */
  for(const s of [-1,1])W(s*8.5,0,2.8,s>0?-PI/2:PI/2,()=>{
   const flatWing=(v===1)||(v===2&&s>0)||(v===4&&s<0);
   const wMk2=flatWing||v===1?'brick':v===3?'lacq':LK_ST,wCol2=flatWing||v===1?P('brick'):v===3?P('lacq'):P('basalt');
   const Tw=lzBatterRoom(11.4,5.4,y0,flatWing?4.8:4.2,wMk2,wCol2,{lean:{front:.06,back:-.04,left:.07,right:-.03},
    front:[lzDoor(2,5.7),lzVent(2,2.4,2.6),lzVent(2,9.0,2.6)]});
   if(flatWing){
    lzSlab(Tw.T,y0+4.8,.3,LK_PL,P('basaltD'),.18);
    lzNoCut(()=>{for(const x of lzSpan(-4.6,4.6,5))lzHorn(x,y0+5.1,2.2,0,1.25,.095,{curl:.5,lean:.2,mk:'ivory'});
     if(s<0)W(0,y0+5.1,0,0,()=>{for(const sx of [-2.8,0,2.8])for(const sz of [-1.6,1.6])beam('bones',[sx,0,sz],[sx,1.8,sz],.06,P('boneO'),true,5);
      box('matW',0,1.8,0,6.2,.08,3.6,P('reedL'));});});
   }else{
    const wm=v===3?'shingle':v===2?'scaleOlive':'basalt',wc=v===3?P('oxblood'):v===2?P('jade'):P('basaltD');
    lzRibRoof(11.4,5.4,y0+4.15,y0+7.8,7,{mk:wm,col:wc,over:.5,ribR:.14,ribMk:rRibMk,ribCol:rRibCol,past:.28,bend:.96,ext:.4,endMk:'brick',endCol:P('brick'),y0});
   }});
  /* front street range & Makers' portal (+z) + courtyard kilns/vats */
  lzNoCut(()=>{
   W(0,0,7.9,0,()=>{
    const Tf=lzBatterRoom(11.6,3.4,y0,3.3,v===3?'lacq':'brick',P(v===3?'lacq':'brick'),{lean:{front:.07,back:-.04,left:0,right:0},
     front:[{s:5.8,w:dw,h:dh,door:true},lzVent(2,2.2,1.3),lzVent(2,9.4,1.3)],back:[{s:5.8,w:dw,h:dh,openOnly:true}]});
    for(const k of [-1,1]){const f=(u,v)=>{const y=dh*v;return [k*dw/2*(1-v),y0+y,lerp(-1.7-.04*y,1.7-.07*y,u)];};psurf(LK_PL,f,3,3,P('basaltD'),{flip:k>0});}
    lzSlab(Tf.T,y0+3.3,.32,'basalt',P('basaltD'),.12);
    W(0,y0+dh+.48,1.7-.07*(dh+.48)+.05,0,()=>lzLeiwen(4.8,.68,{cell:.26,mk:v%2?'lacqR':'bronze',back:'lacq'}));
    lkEyes(5,9.2,y0+2.45,1.7-.07*2.1+.06,.22,2.2);
    lzPortal(0,y0,1.74,0,dh,{mk:v===1||v===3?'lacqR':'bronze'});lzThreshold(0,1.95,0,dw);});
   W(-4.4,y0,1.8,0,()=>{for(let i=0;i<8;i++){const t=(i+1)/8;box(LK_PL,0,0,-1.8+t*3.2,1.15,t*2.65,.42,P('basaltD'));}});
   if(v===3)for(const kx of [1.2,4.0])lzDome(kx,2.0,[[1.15,y0],[1.2,y0+.7],[.85,y0+1.7],[.32,y0+2.5],[0,y0+2.6]],{mk:'brick',col:P('brick'),seg:10});
   else W(2.4,y0,2.2,0,()=>{box('brick',0,0,0,2.6,.72,2.2,P('brick'));box('jade',0,.58,0,2.1,.08,1.7,P(v===1?'oxblood':'turq'));});});
  FURNISH('generic_storage_jar',-2.2,y0,4.2,.3,{setting:'outdoor'});FURNISH('generic_crate',3.4,y0,4.6,-.4,{setting:'outdoor'});
  door(0,y0,9.6,0,dw,dh);}});

/* ---------------------------------------------------------------- stone Drovers' sledge court / caravanserai (caste 3, holds 66, 5 variants) */
defBuilding({key:'lk-caravanserai',name:"Stone Drovers' sledge court",seed:7718,caste:3,cut:true,w:28,d:22,h:11.0,budget:155000,
 tags:{types:['dwelling-multi','infrastructure'],wealth:'rich',role:'dwelling',job:'warehousing'},
 note:'Basilisk\'s high-density Drovers\' courtyard compound: five architectural variants across basalt rib-vaults, flat-roofed Mohenjo-daro brick galleries, bone-and-hide caravan halls, jade-roofed transverse barns and tusk-crowned gatehouses; 2.26 m Drovers\' portal',
 build(o){const v=((o&&o.v)|0)%5,y0=.35,dh=lzDoorH(3),dw=dh*LZ_DW;lzCutFloor(y0);
  lzNoCut(()=>lkPlinth(26.8,20.8,y0,{leiwen:12.0}));
  box('stoneP',0,y0-.08,0,25.0,.12,19.0,P('basaltD'));
  for(const s of [-1,1])W(s*9.1,0,-.4,s>0?-PI/2:PI/2,()=>{
   const flatSide=(v===1&&s<0)||(v===3)||(v===4&&s>0);
   const wMk=v===1||v===2||(v===4&&s>0)?'brick':LK_ST,wCol=wMk==='brick'?P('brick'):P('basalt');
   const T=lzBatterRoom(18.4,6.8,y0,flatSide?4.8:4.5,wMk,wCol,{lean:{front:.07,back:-.05,left:.09,right:-.04},
    front:[lzDoor(3,5.2),lzDoor(3,13.2),lzVent(3,9.2,2.8),lzVent(3,3.0,2.8),lzVent(3,15.4,2.8)],
    back:[lzVent(3,4.6,2.8),lzVent(3,9.2,2.8),lzVent(3,13.8,2.8)]});
   lzCourseRing(T.T,y0+2.58,.24,1.0,LK_PL,P('basaltC'));
   if(flatSide){
    lzSlab(T.T,y0+4.8,.32,LK_PL,P('basaltD'),.2);
    lzNoCut(()=>{for(const x of lzSpan(-7.6,7.6,7))lzHorn(x,y0+5.12,2.8,0,1.35,.1,{curl:.5,lean:.22,mk:v===3?'ivory':LK_PL,col:v===3?P('tusk'):P('basaltD')});});
   }else{
    const rMk=v===1?'shingle':v===2?'hideW':v===4?'scaleOlive':'basalt';
    const rCol=v===1?P('oxblood'):v===2?P('hideD'):v===4?P('jade'):P('basaltD');
    const rbMk=v===1||v===2?'bones':v===4?'bronzeC':LK_PL,rbCol=v===1||v===2?P('bone'):v===4?P('verd'):P('basaltC');
    lzRibRoof(18.4,6.8,y0+4.45,y0+9.2,v===2?11:9,{mk:rMk,col:rCol,over:.6,ribR:.15,ribMk:rbMk,ribCol:rbCol,past:.34,bend:.98,ext:.46,endMk:wMk,endCol:wCol,leanEnds:{left:.09,right:-.04},y0});
   }
   if(s<0){FURNISH('lizardmen_common_bed',-5.8,y0,-1.6,0);FURNISH('lizardmen_common_bed',5.8,y0,-1.6,0);FURNISH('lizardmen_common_table',0,y0,-.8,0);}
   else{FURNISH('lizardmen_common_bed',-5.6,y0,-1.6,0);FURNISH('lizardmen_common_chest',0,y0,-1.9,0);FURNISH('generic_sack',5.4,y0,-1.4,.4);}});
  lzNoCut(()=>{
   W(0,0,-7.0,0,()=>{
    const rH=v===3?4.8:3.6,Tr=lzBatterRoom(11.4,4.8,y0,rH,v===1?'brick':LK_ST,P(v===1?'brick':'basaltD'),{lean:{front:.06,back:-.05,left:0,right:0},front:[lzDoor(3,5.7),lzVent(3,2.2,1.6),lzVent(3,9.2,1.6)]});
    if(v===3)lzRibRoof(11.4,4.8,y0+4.75,y0+8.9,7,{mk:'scaleOlive',col:P('jade'),over:.5,ribMk:'ivory',ribCol:P('tusk'),ribR:.14,past:.32,ext:.35,endMk:LK_ST,endCol:P('basalt'),y0});
    else lzSlab(Tr.T,y0+rH,.34,'basalt',P('basaltD'),.14);});
   const gH=v===4?5.2:4.1;
   W(0,0,7.8,0,()=>{
    const Tg=lzBatterRoom(11.4,3.2,y0,gH,v===1?'brick':LK_ST,P(v===1?'brick':v===4?'basaltD':'basalt'),{lean:{front:.08,back:-.04,left:0,right:0},
     front:[{s:5.7,w:dw,h:dh,door:true}],back:[{s:5.7,w:dw,h:dh,openOnly:true}]});
    for(const k of [-1,1]){const f=(u,v)=>{const y=dh*v;return [k*dw/2*(1-v),y0+y,lerp(-1.6-.04*y,1.6-.08*y,u)];};psurf(LK_PL,f,3,3,P('basaltD'),{flip:k>0});}
    lzSlab(Tg.T,y0+gH,.36,'basalt',P('basaltD'),.14);
    for(const s of [-1,1])lzHorn(s*4.6,y0+gH+.35,0,s>0?-PI/2:PI/2,v===2?3.1:2.4,.15,{curl:.55,lean:.22,mk:v===2||v===1?'ivory':LK_PL,col:v===2||v===1?P('tusk'):P('basaltD')});
    W(0,y0+dh+.52,1.6-.08*(dh+.52)+.05,0,()=>lzLeiwen(4.6,.76,{cell:.26,mk:v===1||v===4?'lacqR':'bronze',back:'lacq'}));
    lzPortal(0,y0,1.64,0,dh,{mk:v===2?'ivory':'bronze',eye:true});lzThreshold(0,1.88,0,dw);});
   lwSledge(-1.6,1.2,.22,'goods');
   box(LK_ST,2.8,y0,-1.8,1.4,.68,3.6,P('basalt'));box('jade',2.8,y0+.56,-1.8,1.02,.08,3.1,P('turq'));});
  door(0,y0,9.4,0,dw,dh);}});
