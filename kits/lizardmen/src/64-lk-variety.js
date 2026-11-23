// prefix: lkv
// ================================================================= ARCHITECTURAL VARIETY SET FOR BASILISK (64-lk-variety.js)
// Breaks up roofline, massing and palette monotony across Basilisk's 30,000-resident wards while holding strictly to DESIGN.md
// sections 2-3 (Mohenjo-daro baked brick, dressed polygonal basalt, Shang bronze & verdigris, black & oxblood lacquer, gleaming
// hexapod bone & ivory exoskeletons, angular leiwen spirals, odd counts, caste-sized triangular portals, walls that lean wrong):
//   lk-terrace   (7719, caste 2): two-level stepped flat-roofed Mohenjo-daro brick-and-stone terrace house + bone/mat pergola
//   lk-kilnhouse (7720, caste 2): three-dome corbelled brick & basalt kiln court in a 1:1.25:1.56 whorl + smoking flues
//   lk-archive   (7721, caste 5): asymmetric stepped basalt, oxblood & verdigris-bronze seal archive + twisted corner lantern
//   lk-guildhall (7722, caste all): capital craft & lacquer hall with 11 white bone/ivory ribs over oxblood/jade/bronze carapace
//   lk-rowhouse  (7723, caste 3): narrow two-storey brick-over-basalt Drover townhouse with cantilevered stone balcony
//   lk-bastion   (7724, caste 4): twin-towered asymmetric Bulwark & warrior gate-lodge with ivory/basalt horn crowns
// Frame: origin on the ground at the plot centre, +z the front.

/* ---------------------------------------------------------------- 1. Mohenjo-daro stepped brick & basalt terrace house (caste 2, holds 22) */
defBuilding({key:'lk-terrace',name:'Stepped brick terrace house',seed:7719,caste:2,cut:true,w:18,d:14,h:9.6,budget:120000,
 tags:{types:['dwelling-multi'],wealth:'rich',role:'dwelling'},
 note:'an asymmetric two-level flat-roofed Mohenjo-daro terrace house in baked brick and polygonal basalt: exterior stone stair climbing to a rooftop basking deck shaded by a five-rib bone-and-mat pergola, oxblood and bronze leiwen bands, seven parapet horns, and the 1.76 m Makers\' door',
 build(o){const v=((o&&o.v)|0)%5,sg=v%2?-1:1,y0=.35,dh=lzDoorH(2),dw=dh*LZ_DW;lzCutFloor(y0);
  lzNoCut(()=>lkPlinth(16.6,12.6,y0,{leiwen:8.4}));
  const mLo=v===2?LK_ST:'brick',cLo=v===2?P('basalt'):P('brick');
  const mHi=v===0||v===3?'brick':v===4?'lacq':LK_ST,cHi=v===0||v===3?P('brick'):v===4?P('lacq'):P('basaltD');
  /* full lower storey (15.2 x 10.6 m, h 3.6 m) */
  const T1=lzBatterRoom(15.2,10.6,y0,3.6,mLo,cLo,{lean:{front:.07,back:-.05,left:.08,right:-.04},
   front:[{s:7.6-sg*2.4,w:dw,h:dh,door:true},lzVent(2,2.6,2.1),lzVent(2,12.6,2.1)],
   back:[lzVent(2,3.8,2.1),lzVent(2,7.6,2.1),lzVent(2,11.4,2.1)]});
  lzCourseRing(T1.T,y0+3.36,.24,1.1,LK_PL,P('basaltC'));
  lzSlab(T1.T,y0+3.6,.3,LK_PL,P('basaltD'),.22);
  /* asymmetric upper storey on one side (8.6 x 9.2 m, h 3.4 m -> roof at y0 + 7.3 m) */
  lzNoCut(()=>{
   W(sg*3.1,0,-.4,0,()=>{
    const T2=lzBatterRoom(8.6,9.2,y0+3.9,3.3,mHi,cHi,{lean:{front:.06,back:-.04,left:.07,right:-.03},
     front:[lzDoor(2,4.3),lzVent(2,1.8,1.9),lzVent(2,6.8,1.9)],back:[lzVent(2,2.6,1.9),lzVent(2,6.0,1.9)]});
    lzSlab(T2.T,y0+7.2,.28,v===3?'bronzeC':LK_PL,P(v===3?'verd':'basaltD'),.2);
    W(0,y0+5.6,4.6-.06*1.7+.05,0,()=>lzLeiwen(5.8,.75,{cell:.26,mk:v%2?'lacqR':'bronze',back:'lacq'}));
    for(const x of lzSpan(-3.4,3.4,5))lzHorn(x,y0+7.48,4.1,0,1.35,.1,{curl:.52,lean:.24,mk:v===1?'ivory':LK_PL,col:v===1?P('tusk'):P('basaltD')});});
   /* rooftop basking pergola & exterior stone stair on the lower terrace half (-sg) */
   W(-sg*4.1,y0+3.9,.4,0,()=>{
    for(const sx of [-2.4,0,2.4])for(const sz of [-2.6,2.6])beam('bones',[sx,0,sz],[sx,2.15,sz*.94],.07,P('boneO'),true,6);
    lzRibRoof(5.2,5.2,2.1,3.25,5,{mk:v===4?'shingle':'matW',col:P(v===4?'oxblood':'reedL'),over:.35,ribMk:'bones',ribCol:P('bone'),ribR:.085,past:.24,ext:.28,ends:false,drop:.15});
    for(const x of [-2.4,0,2.4])lzHorn(x,0,4.4,0,1.2,.095,{curl:.48,lean:.2,mk:'horn'});});
   W(-sg*6.8,y0,5.55,sg>0?PI/2:-PI/2,()=>{for(let i=0;i<10;i++){const t=(i+1)/10;box(LK_PL,0,0,-1.8+t*3.6,1.05,t*3.6,.38,P('basaltD'));}});
   W(sg*2.8,y0+1.35,5.3-.07*1.35+.05,0,()=>lzLeiwen(4.2,.95,{cell:.28,mk:'lacqR',back:'lacq'}));
   lkEyes(3,6.0,y0+2.4,5.3-.07*2.4+.06,.24,0);
   lzPortal(-sg*2.4,y0,5.36,0,dh,{mk:v===1?'lacqR':'bronze',eye:true});lzThreshold(-sg*2.4,5.55,0,dw);});
  lzFurnRoom(14.0,9.4,y0,'court',{beds:2,ceil:3.1,extra:[['lizardmen_common_workbench',-5.2,1.8,PI/2],['lizardmen_court_cabinet',5.2,1.6,-PI/2],['generic_storage_jar',-5.6,-3.2,0]]});}});

/* ---------------------------------------------------------------- 2. Three-dome brick & lacquer kiln court (caste 2, holds 16) */
defBuilding({key:'lk-kilnhouse',name:'Three-dome kiln house',seed:7720,caste:2,cut:true,w:16,d:14,h:10.2,budget:115000,
 tags:{types:['dwelling-multi','industry'],wealth:'rich',role:'workshop',job:'pottery'},
 note:'a Makers\' ceramic, glaze and brick-firing house: three corbelled beehive domes in a 1 : 1.25 : 1.56 whorl joined to a low oxblood-and-basalt moulding wing, smoking bronze-collared flues and turquoise glaze vats',
 build(o){const v=((o&&o.v)|0)%5,chir=v%2?-1:1,y0=.3,dh=lzDoorH(2),dw=dh*LZ_DW;lzCutFloor(y0);
  lzNoCut(()=>lkPlinth(14.8,12.8,y0,{leiwen:7.2}));
  const dMk=v===2?LK_ST:v===4?'earthR':'brick',dCol=v===2?P('basalt'):v===4?P('earth'):P('brick');
  const domes=[[chir*4.1,-2.8,1.95],[chir*1.2,-3.3,2.45],[-chir*2.6,-2.2,3.15]];
  for(let i=0;i<3;i++){const [dx,dz,r]=domes[i],h=r*1.85;
   W(dx,y0,dz,0,()=>{
    lzDome(0,0,[[r,0],[r*1.04,h*.26],[r*.88,h*.56],[r*.56,h*.82],[.36,h*.98]],{mk:dMk,col:dCol,seg:14});
    cyl('brick',0,h*.92,0,.38,.95,P('brick'),10);cyl('bronzeC',0,h+.78,0,.46,.22,P('verd'),10);
    if(i===2||i===0)smokeAt(dx,y0+h+1.05,dz,{r:.3,kind:'fire'});
    for(let k=0;k<5;k++){const a=k*TAU/5+.3;lzHorn(Math.cos(a)*r*1.02,0,Math.sin(a)*r*1.02,Math.atan2(-Math.cos(a),-Math.sin(a)),r*1.3,.16,{curl:.48,lean:-.22,mk:v===1?'ivory':'horn'});}});}
  /* front moulding & dwelling wing (+z) */
  W(0,0,2.6,0,()=>{
   const Tw=lzBatterRoom(12.6,5.8,y0,2.8,v===1?'lacq':LK_ST,P(v===1?'lacq':'basalt'),{lean:{front:.07,back:-.04,left:.08,right:-.05},
    front:[{s:6.3+chir*1.6,w:dw,h:dh,door:true},lzVent(2,2.2,1.6),lzVent(2,10.4,1.6)]});
   if(v===0||v===3)lzSlab(Tw.T,y0+2.8,.28,LK_PL,P('basaltD'),.18);
   else lzRibRoof(12.6,5.8,y0+2.75,y0+5.7,7,{mk:v===1?'shingle':'scaleOlive',col:P(v===1?'oxblood':'jade'),over:.5,ribMk:'bones',ribCol:P('bone'),ribR:.12,past:.3,ext:.38,endMk:'brick',endCol:P('brick'),y0});
   W(-chir*2.8,y0+.95,2.9-.07*.95+.05,0,()=>lzLeiwen(3.6,.95,{cell:.26,mk:'lacqR',back:'lacq'}));
   lzNoCut(()=>{lzPortal(chir*1.6,y0,2.96,0,dh,{mk:'bronze',eye:true});lzThreshold(chir*1.6,3.15,0,dw);});
   FURNISH('lizardmen_common_workbench',-3.8,y0,-.8,0);FURNISH('generic_storage_jar',3.8,y0,-1.4,0);
   FURNISH('generic_storage_jar',4.6,y0,-.6,.5);FURNISH('lizardmen_common_bed',-4.2,y0,-1.8,0);FURNISH('lizardmen_common_chest',0,y0,-1.9,0);});
  lzNoCut(()=>{W(chir*4.6,y0,2.8,0,()=>{box('brick',0,0,0,2.2,.68,2.0,P('brick'));box('jade',0,.56,0,1.76,.08,1.56,P('turq'));});});}});

/* ---------------------------------------------------------------- 3. Stepped basalt & verdigris-bronze seal archive (caste 5, holds 14) */
defBuilding({key:'lk-archive',name:'Stepped seal and stela archive',seed:7721,caste:5,cut:true,w:17,d:15,h:12.8,budget:130000,
 tags:{types:['civic','religious'],wealth:'rich',role:'hall',job:'scribing'},
 note:'an Interpreters\' and Scribe-Tenders\' archive for the Mound and district courts: stepped L-plan cyclopean basalt and oxblood lacquer halls roofed in verdigris-patinated bronze slabs, a twisted five-course corner lantern with glowing spiral-eye oculi, and mirrored stelae at the 3.5 m portal',
 build(o){const v=((o&&o.v)|0)%5,sg=v%2?-1:1,y0=.38,dh=lzDoorH(5),dw=dh*LZ_DW;lzCutFloor(y0);
  lzNoCut(()=>lkPlinth(15.8,13.8,y0,{leiwen:9.6}));
  const wMk=v===1?'lacq':v===3?'brick':LK_PL,wCol=v===1?P('lacq'):v===3?P('brick'):P('basaltD');
  const capMk=v===2?'scaleOlive':'bronzeC',capCol=v===2?P('jade'):P('verd');
  /* main reading & seal-vault hall (14.2 x 9.6 m, h 4.6 m) */
  const T=lzBatterRoom(14.2,9.6,y0,4.6,wMk,wCol,{lean:{front:.08,back:-.04,left:.06,right:-.05},
   front:[{s:7.1-sg*1.8,w:dw,h:dh,door:true},lzVent(5,2.4,2.8),lzVent(5,11.8,2.8)],
   back:[lzVent(5,3.6,2.8),lzVent(5,7.1,2.8),lzVent(5,10.6,2.8)]});
  lzSlab(T.T,y0+4.6,.36,capMk,capCol,.26);
  lzNoCut(()=>{
   /* stepped upper bronze-roofed vault + twisted 5-course lantern tower on sg corner */
   W(-sg*2.2,0,-1.0,0,()=>{
    const T2=lzBatterRoom(8.4,6.4,y0+4.96,2.8,LK_ST,P('basalt'),{lean:{front:.06,back:-.04,left:.06,right:-.04}});
    lzSlab(T2.T,y0+7.76,.32,capMk,capCol,.22);
    for(const x of lzSpan(-3.4,3.4,5))lzHorn(x,y0+8.08,2.8,0,1.4,.11,{curl:.5,lean:.25,mk:'bronzeC',col:P('verd')});});
   W(sg*4.4,y0+4.96,-1.6,0,()=>{
    lzTwist(0,0,6.2,5,4.6,3.1,sg*.08,{mk:LK_PL,col:P('basaltD'),each:(i,yy,ww,ry)=>{
     W(0,yy+1.1,0,ry,()=>box('lacqR',0,0,0,ww+.14,.12,ww+.14,P('oxblood')));
     if(i===2||i===4)W(0,yy+.6,0,ry,()=>lzEye(0,0,ww/2+.03,0,.3,{mk:'bronze',glow:true}));}});
    for(let i=0;i<5;i++){const a=i*TAU/5;lzHorn(Math.cos(a)*1.3,6.2,Math.sin(a)*1.3,Math.atan2(Math.cos(a),Math.sin(a)),1.7,.12,{curl:.52,lean:.3,mk:'ivory'});}});
   W(sg*2.8,y0+1.4,4.8-.08*1.4+.05,0,()=>lzGlyphSpiral(3.4,2.4,{mk:'bronze',turns:3,mirror:sg<0}));
   lkEyes(5,12.2,y0+3.8,4.8-.08*3.8+.06,.28,2.8);
   lzPortal(-sg*1.8,y0,4.86,0,dh,{mk:'bronze',eye:true});lzThreshold(-sg*1.8,5.1,0,dw);
   lzStela(-sg*1.8-2.6,5.9,.12,2.4,.68,{});lzStela(-sg*1.8+2.6,5.9,-.12,2.4,.68,{mirror:true,wrapped:v===4});});
  lzFurnRoom(13.0,8.4,y0,'court',{beds:0,noHearth:true,ceil:4.1,extra:[['lizardmen_court_desk',-3.8,-1.8,0],['lizardmen_court_desk',3.8,-1.8,0],
   ['lizardmen_court_bookcase',-5.6,.6,PI/2],['lizardmen_court_bookcase',5.6,.6,-PI/2],['lizardmen_court_scroll',0,-2.8,0],['lizardmen_court_candelabra',-2.2,2.2,0],['lizardmen_court_candelabra',2.2,2.2,0]]});}});

/* ---------------------------------------------------------------- 4. Oxblood, jade & bone-ribbed capital craft hall (caste all, holds 14) */
defBuilding({key:'lk-guildhall',name:'Capital lacquer and craft hall',seed:7722,caste:'all',cut:true,w:21,d:14,h:10.6,budget:130000,
 tags:{types:['industry','civic'],wealth:'rich',role:'workshop',job:'weaving'},
 note:'the stone capital\'s counterpart to the village reed hall: battered baked-brick and black-lacquer walls on a bronze-inlaid plinth, eleven gleaming hexapod bone or ivory ribs crossing high above an oxblood-lacquered shingle, jade-scale or verdigris-bronze carapace, and a nested Bulwark-height portal',
 build(o){const v=((o&&o.v)|0)%5,L=16.6,Wd=9.4,wh=3.0,rh=5.4,y0=.36,dh=lzDoorH(6),dw=dh*LZ_DW;lzCutFloor(y0);
  lzNoCut(()=>lkPlinth(19.2,12.0,y0,{leiwen:10.4}));
  const wMk=v===1||v===4?'brick':'lacq',wCol=v===1||v===4?P('brick'):v===2?P('oxblood'):P('lacq');
  const rMk=v===1?'scaleOlive':v===2?'basalt':v===3?'bronzeC':'shingle';
  const rCol=v===1?P('jade'):v===2?P('basaltD'):v===3?P('verd'):P('oxblood');
  const rbMk=v===3?'ivory':'bones',rbCol=v===3?P('tusk'):P('bone');
  lzBatterRoom(L,Wd,y0,wh,wMk,wCol,{lean:{front:.08,back:-.05,left:.09,right:-.04},
   mkf:s=>s==='left'||s==='right'?LK_ST:wMk,colf:s=>s==='left'||s==='right'?P('basalt'):wCol,
   front:[{s:L/2,w:dw,h:dh,door:true},lzVent(4,2.2,1.8),lzVent(4,L-2.2,1.8)],
   back:[lzVent(4,3.6,1.8),lzVent(4,L/2,1.8),lzVent(4,L-3.6,1.8)]});
  lzRibRoof(L,Wd,y0+wh+.05,y0+wh+rh,11,{mk:rMk,col:rCol,over:.72,ribR:.17,ribMk:rbMk,ribCol:rbCol,past:.38,bend:.96,ext:.6,endMk:'lacq',endCol:P('lacq'),leanEnds:{left:.09,right:-.04},y0});
  lzNoCut(()=>{
   for(const s of [-1,1])W(s*5.2,y0+.58,Wd/2-.08*.58+.05,0,()=>lzLeiwen(3.1,1.18,{cell:.28,mk:v===0?'bronze':'lacqR',back:'lacq',chir:s}));
   lkEyes(5,L-3,y0+wh*.82,Wd/2-.08*wh*.82+.06,.28,2.9);
   lzPortal(0,y0,Wd/2+.08,0,dh,{mk:v%2?'ivory':'bronze',eye:true,shared:true});lzThreshold(0,Wd/2+.26,0,dw);});
  lzFurnRoom(L-1.2,Wd-1.0,y0,'court',{beds:0,noHearth:true,ceil:4.8,extra:[['lizardmen_common_loom',-5.2,-2.4,0],['lizardmen_common_workbench',0,-2.6,0],
   ['generic_trade_display',5.2,-2.4,0],['lizardmen_common_screen',3.4,.8,PI/2],['generic_trade_press',-2.4,1.6,PI/2],['lizardmen_court_cabinet',5.6,1.8,-PI/2]]});}});

/* ---------------------------------------------------------------- 5. Two-storey brick & scale-roofed Drover rowhouse (caste 3, holds 24) */
defBuilding({key:'lk-rowhouse',name:'Two-storey Drover townhouse',seed:7723,caste:3,cut:true,w:15,d:12,h:10.4,budget:105000,
 tags:{types:['dwelling-multi'],wealth:'rich',role:'dwelling'},
 note:'a tall narrow two-storey Mohenjo-daro townhouse for Basilisk\'s dense Drover streets: battered basalt ground walls carrying a baked-brick upper storey, cantilevered stone basking balcony, and jade-scale, oxblood-shingle or flat horn-crowned roofs',
 build(o){const v=((o&&o.v)|0)%5,L=12.6,Wd=8.8,y0=.35,dh=lzDoorH(3),dw=dh*LZ_DW,dx=v%2?1.65:-1.65;lzCutFloor(y0);
  lzNoCut(()=>lkPlinth(13.8,10.2,y0,{leiwen:6.8}));
  const T0=lzBatterRoom(L,Wd,y0,2.8,LK_ST,P('basalt'),{lean:{front:.06,back:-.04,left:.05,right:-.03},
   front:[{s:L/2+dx,w:dw,h:dh,door:true},lzVent(3,2.2,1.7),lzVent(3,L-2.2,1.7)],back:[lzVent(3,3.2,1.7),lzVent(3,L-3.2,1.7)]});
  lzCourseRing(T0.T,y0+2.56,.24,1.0,LK_PL,P('basaltC'));
  const T1=lzBatterRoom(L-.3,Wd-.3,y0+2.8,2.5,v===3?LK_PL:'brick',P(v===3?'basaltD':'brick'),{lean:{front:.05,back:-.03,left:.05,right:-.03},
   front:[lzDoor(3,(L-.3)/2),lzVent(3,2.2,1.4),lzVent(3,L-2.5,1.4)],back:[lzVent(3,3.2,1.4),lzVent(3,L-3.5,1.4)]});
  /* cantilevered stone basking balcony on +z (three brackets: odd, flanking the ground portal cleanly) */
  lzNoCut(()=>{
   box(LK_PL,0,y0+2.68,Wd/2+.55,7.4,.22,1.35,P('basaltD'));
   for(const bx of [-3.3,0,3.3])box(LK_ST,bx,y0+2.15,Wd/2+.32,.36,.55,.85,P('basalt'));
   for(const hx of [-3.4,0,3.4])lzHorn(hx,y0+2.9,Wd/2+1.12,0,1.05,.08,{curl:.5,lean:.25,mk:'ivory'});
   lzPortal(dx,y0,Wd/2+.07,0,dh,{mk:v===1?'lacqR':'bronze'});lzThreshold(dx,Wd/2+.25,0,dw);});
  if(v===2){
   lzSlab(T1.T,y0+5.3,.3,LK_PL,P('basaltD'),.22);
   lzNoCut(()=>{for(const x of lzSpan(-5.0,5.0,7))lzHorn(x,y0+5.6,3.8,0,1.3,.1,{curl:.5,lean:.22,mk:'horn'});});
  }else{
   const rMk=v===0?'scaleOlive':v===1?'shingle':v===3?'bronzeC':'hideW';
   const rCol=v===0?P('jade'):v===1?P('oxblood'):v===3?P('verd'):P('hideD');
   const rbMk=v===0||v===3?'ivory':'bones',rbCol=v===0||v===3?P('tusk'):P('bone');
   lzRibRoof(L-.3,Wd-.3,y0+5.25,y0+8.9,7,{mk:rMk,col:rCol,over:.58,ribR:.14,ribMk:rbMk,ribCol:rbCol,past:.32,bend:.96,ext:.45,endMk:'brick',endCol:P('brick'),leanEnds:{left:.05,right:-.03},y0:y0+2.8});
  }
  lkEyes(3,L-2,y0+4.3,Wd/2-.22,.24,2.0);
  lzFurnRoom(L-1.0,Wd-1.0,y0,'court',{beds:3,ceil:2.4,extra:[['generic_trade_hayrack',-4.6,1.4,PI/2],['lizardmen_court_cabinet',4.6,1.4,-PI/2]]});}});

/* ---------------------------------------------------------------- 6. Twin-towered Bulwark & warrior gate-lodge (castes 4 & 6, holds 34) */
defBuilding({key:'lk-bastion',name:'Twin-towered warrior bastion',seed:7724,caste:4,cut:true,w:18,d:16,h:14.4,budget:140000,
 tags:{types:['dwelling-multi','military'],wealth:'rich',role:'dwelling'},
 note:'a fortified urban garrison lodge for Line warriors and Bulwarks: two asymmetric battered towers (one higher by 1.25x, the Coil\'s ratio) flanking a flat-roofed cyclopean and baked-brick armoury hall with both the 2.8 m and 4.4 m portals and crowns of ivory or basalt horns',
 build(o){const v=((o&&o.v)|0)%5,sg=v%2?-1:1,y0=.38,dh4=lzDoorH(4),dw4=dh4*LZ_DW,dh6=lzDoorH(6),dw6=dh6*LZ_DW;lzCutFloor(y0);
  lzNoCut(()=>lkPlinth(16.8,14.8,y0,{leiwen:9.2}));
  const wMk=v===1||v===3?'brick':LK_ST,wCol=v===1||v===3?P('brick'):P('basalt');
  /* central armoury hall (14.4 x 11.2 m, h 5.8 m) with dual caste 4 & 6 portals */
  const Tc=lzBatterRoom(14.4,11.2,y0,5.8,wMk,wCol,{lean:{front:.07,back:-.05,left:.06,right:-.04},
   front:[{s:7.2-2.4,w:dw6,h:dh6,door:true},{s:7.2+2.8,w:dw4,h:dh4,door:true}],
   back:[lzVent(4,3.6,3.4),lzVent(4,7.2,3.4),lzVent(4,10.8,3.4)]});
  lzSlab(Tc.T,y0+5.8,.36,LK_PL,P('basaltD'),.24);
  /* asymmetric corner bastion towers on +z/-z flanks (heights 9.2 m and 11.8 m) */
  lzNoCut(()=>{
   for(const [s,th,nC] of [[sg,11.6,7],[-sg,9.2,5]])W(s*5.3,y0,-1.8,0,()=>{
    lzTwist(0,0,th,nC,5.2,3.7,s*.055,{mk:v===2?LK_PL:LK_ST,col:P(v===2?'basaltD':'basalt'),each:(i,yy,ww,ry)=>{
     if(v===1||v===4)W(0,yy+th/nC-.12,0,ry,()=>box('lacqR',0,0,0,ww+.14,.12,ww+.14,P('oxblood')));
     if(i===nC-2)W(0,yy+.6,0,ry,()=>{for(const q of [0,PI/2,PI,-PI/2])W(0,0,0,q,()=>lzEye(0,0,ww/2+.03,0,.28,{mk:'bronze'}));});}});
    const hMk=v===1||v===3?'ivory':v===4?'bronzeC':LK_PL,hCol=v===1||v===3?P('tusk'):v===4?P('verd'):P('basaltD');
    for(let i=0;i<7;i++){const a=i*TAU/7;lzHorn(Math.cos(a)*1.55,th,Math.sin(a)*1.55,Math.atan2(Math.cos(a),Math.sin(a)),1.85,.13,{curl:.52,lean:.28,mk:hMk,col:hCol});}});
   for(const x of lzSpan(-5.8,5.8,9))lzHorn(x,y0+6.16,5.1,0,1.4,.11,{curl:.5,lean:.22,mk:LK_PL,col:P('basaltD')});
   W(.2,y0+4.95,5.6-.07*4.95+.05,0,()=>lzLeiwen(9.6,.68,{cell:.28,mk:v%2?'lacqR':'bronze',back:'lacq'}));
   lzPortal(-2.4,y0,5.68,0,dh6,{mk:'bronze',eye:true,shared:true});lzThreshold(-2.4,5.92,0,dw6);
   lzPortal(2.8,y0,5.68,0,dh4,{mk:v===1?'lacqR':'bronze'});lzThreshold(2.8,5.88,0,dw4);});
  for(let c=6;c>=3;c--)lmArmour(-5.2+(6-c)*2.2,-4.0,0,LZ_CASTE[c].h);
  lmRack(4.6,-4.0,0,7);
  lzFurnRoom(13.0,9.8,y0,'court',{beds:3,ceil:5.1,extra:[['generic_trade_armour_stand',-4.8,2.2,PI/2],['generic_trade_weapon_rack',4.8,2.2,-PI/2],['lizardmen_training_training_dummy',0,1.6,0]]});}});
