// prefix: fg
// ================================================================= THE TOWN PIECES (settlements/blakhed PLAN.md section 5, step B2)
// What a Fellgang market and meeting town asks of the kit beyond a fell village's fourteen buildings:
//   fg-doublehall      the town's double meeting hall: both customs under one roof (the Fowlers' rope wall at the west end,
//                      the Ice-cutters' tally board at the east, the kerbed fire trench between)
//   fg-halting-house   an inn on the Market: hearth hall with ale crocks and stew pot, partitioned bunk bays, tack and pack room
//   fg-markethall      an open-aisled drystone-pier hall under turf: the iron weigh-beam, salt tubs, reckoning counters and stores
//   fg-booth           a three-bay market and fair booth row under lashed hide and salvage plate
//   fg-ropewalk        a 44 m town rope-walk range: head jack-house, wheeled traveller on fir rails, tar vat and four-strand run
//   fg-great-icehouse  a town-scale banked turf vault with twin-door airlock vestibule and five tiers of pond and lake ice
//   fg-smithy          a settled Traveller salvage-smithy: forge hood, hide bellows, steel-block anvil, cable and plate racks
//   fg-tannery         a tannery and felt house: soaking pits, peat-fired boiling vat under a louvred ridge, fulling board, frames
//   fg-granary         a raised drystone-pier granary on staddle caps keeping basin and in-field grain dry off the turf
//   fg-fair-stand      the Fair judges' raised stone dais, beast reckoning slate and turf canopy overlooking the ring
const FG_TOWN_FAMS={
 'fg-doublehall':[{id:'porch',wf:[.88,1],df:[.76,.82],hf:[.86,1],add:['porch'],pitch:[36,44],stony:1.3},
  {id:'bow',plan:'bow',roof:'bow',wf:[.9,1],df:[.88,1],hf:[.84,1],pitch:[35,42],stony:1.4,low:1.2},
  {id:'halfhip',roof:'halfhip',wf:[.86,1],df:[.86,1],hf:[.82,.96],pitch:[32,40],low:1.8}],
 'fg-halting-house':[{id:'porch',wf:[.84,1],df:[.74,.8],hf:[.84,1],add:['porch'],pitch:[36,44],stony:1.3},
  {id:'burst',wf:[.88,1],df:[.86,1],hf:[.86,1],stony:1.5},
  {id:'welsh',roof:'halfhip',welsh:true,wf:[.85,1],df:[.84,.96],hf:[.84,1],pitch:[34,42]},
  {id:'black',plan:'round',roof:'black',th:1.05,ov:0,wf:[.88,1],df:[.88,.98],hf:[.78,.88],pitch:[30,36],low:2.2,wins:2}],
 'fg-smithy':[{id:'lean',wf:[.7,1],df:[.82,.96],hf:[.84,1],add:['lean'],pitch:[38,46],stony:1.5},
  {id:'gable',stack:true,wf:[.82,.96],df:[.82,.96],hf:[.84,1],pitch:[38,46],stony:1.4},
  {id:'halfhip',roof:'halfhip',wf:[.82,.96],df:[.84,.96],hf:[.8,.94],pitch:[34,42],low:1.6}],
 'fg-tannery':[{id:'gable',wf:[.82,.96],df:[.82,.96],hf:[.84,1],pitch:[38,46],stony:1.3},
  {id:'croft',roof:'halfhip',wf:[.68,.72],df:[.82,.96],hf:[.82,.96],add:['outshot'],low:1.5},
  {id:'bow',plan:'bow',roof:'bow',wf:[.86,.96],df:[.86,.96],hf:[.82,.96],pitch:[34,42],low:1.3}]};

defBuilding({key:'fg-doublehall',name:'The double meeting hall',seed:9151,cut:true,w:28,d:11,h:7.4,budget:14500,
 tags:{types:['civic'],wealth:'middle',style:'drystone',role:'civic'},
 note:'the town\'s double meeting hall: both customs under one roof — the Fowlers\' rope wall at the west end ("a rope is a vote") and the Ice-cutters\' tally board at the east ("the Cold is owed"), a kerbed fire trench of four hearths down the middle, twin plate doors',
 build(o){const C=fgCx(o),B=TG.fg.BOX['fg-doublehall'];fgSet('variant','double');
  fgHouse(B,C,FG_TOWN_FAMS['fg-doublehall'],S=>{const pc=fgCol('pole',C),wc=fgCol('wood',C),kc=fgCol('stoneD',C),fz=(S.z0+S.z1)/2,L=Math.min(16.8,S.x1-S.x0-3.2);
   const zs=S.fam==='porch'?S.hd+1.73:S.hd+.02,ys=S.fam==='porch'?S.wh-1.15:Math.min(S.wh-.72,2.55);
   const d0=S.doors[0][0],d1=S.doors[1]?S.doors[1][0]:-d0;
   fgSign('A ROPE IS A VOTE',d0,ys,zs,0,C,{ch:.16});fgSign('THE COLD IS OWED',d1,ys,zs,0,C,{ch:.16});
   W(0,Math.min(2.1,S.wh-.55),S.hd+.03,0,()=>{WX(0,0,0,0,PI/2,0,()=>cyl('plate',0,0,0,.48,.05,fgCol('plate',C),12));fgMark(C.v,0,0,.06,0,.46,0xa8321e);});
   if(S.fam==='porch'){fgFurn('fellgang_common_brazier',-2.4,null,S.hd+.9,0);fgFurn('fellgang_common_brazier',2.4,null,S.hd+.9,0,{v:1});}
   /* the kerbed fire trench down the middle: four fires under four scrap hoods */
   for(const s of [-1,1])box('stone',0,0,fz+s*.58,L,.22,.22,kc);for(const s of [-1,1])box('stone',s*L/2,0,fz,.22,.22,1.36,kc);
   for(let k=0;k<4;k++){const x=-L*.38+k*L*.76/3;fgHearth(x,fz,C,{r:.42});const y=S.Y(x,0);fgHood(x,y-.1,Math.min(B.h+.35,y+.3),C);}
   /* benches along both long walls, the head's seat and rulebook in the middle, war drums at the ends */
   const bd=fgDim('fellgang_common_bench'),bw=bd.w+.25;
   for(let x=S.x0+.9;x+bw<S.x1-.5;x+=bw){if(Math.abs(x+bw/2)>1.1)fgFurnBack('fellgang_common_bench',x+bw/2,S.z0,{v:(x*3|0)&1});
    if(S.doors.every(d=>Math.abs(x+bw/2-d[0])>1.7))fgFurn('fellgang_common_bench',x+bw/2,null,S.z1-bd.d/2-.12,PI,{v:1});}
   fgFurnBack('fellgang_court_bigun_seat',0,S.z0);fgFurn('fellgang_court_rulebook',.85,null,S.z0+.65,0);
   fgFurnSide('fellgang_common_war_drum',-1,S.x0,fz+1.1);fgFurnSide('fellgang_common_war_drum',1,S.x1,fz+1.1,{v:1});
   /* west half (x < -.9): the Fowlers' ROPE WALL */
   const zb=S.z0+.01,wx0=S.x0+.5,wx1=-1.1,ww=Math.max(3,wx1-wx0);
   const np=Math.max(6,o.pegs==null?28:o.pegs|0),lost=o.lost?o.lost.slice():[Math.floor(fgU(C,51)*np)],per=Math.ceil(np/2),sp=Math.min(1.05,ww/per);
   box('wood',(wx0+wx1)/2,1.8,zb+.02,per*sp+.24,.08,.06,wc);box('wood',(wx0+wx1)/2,2.72,zb+.02,per*sp+.24,.08,.06,wc);
   for(let i=0;i<np;i++){const row=i<per?0:1,k=row?i-per:i,x=(wx0+wx1)/2+(k-(per-1)/2)*sp,y=row?2.76:1.84,col=fgMarkCol(i);
    pole('pole',[x,y+.15,zb+.03],[x,y+.2,zb+.32],.032,pc,4);fgNote('pegs');fgMark(i,x,y+.46,zb+.05,0,.17,col);
    if(lost.indexOf(i)<0){const rc=hc(col).clone().lerp(hc(0x8a7656),.55);ring('rope',x,y-.06,zb+.2,.18,.04,rc,0,PI/2,0,8);fgNote('coils');}
    else fgNote('empty');}
   /* east half (x > .9): the Ice-cutters' TALLY BOARD */
   const ex0=1.1,ex1=S.x1-.9,ew=Math.max(3,ex1-ex0),ns=Math.max(8,o.slats==null?44:o.slats|0),L2=Math.min(ew-.6,ns*.22),ecx=(ex0+ex1)/2;
   box('wood',ecx,1.4,zb+.03,L2+.36,1.68,.06,wc);
   for(let i=0;i<ns;i++){const x=ecx-L2/2+(i+.5)*L2/ns,nn=3+Math.floor(fgU(C,600+i)*7);box('wood',x,1.5,zb+.08,.1,1.48,.04,wc);fgNote('slats');
    for(let k=0;k<nn;k++){quad('plain',x+.02,1.6+k*.15,zb+.105,.065,.024,P('dark'));fgNote('notches');}}
   fgText('OWED',Math.min(S.x1-.45,ecx+L2/2+.42),2.42,zb+.04,0,.14,P('white'));},
  {doorW:1.85,doorH:2.2,noHood:true,doors:S0=>{const dx=Math.min(5.8,S0.w*.23),dh=Math.min(2.2,S0.wh-.3);return [[-dx,1.85,dh],[dx,1.85,dh]];}});}});

defBuilding({key:'fg-halting-house',name:'A halting house',seed:9152,cut:true,w:18,d:9.5,h:5.8,budget:10500,
 tags:{types:['inn','tavern'],wealth:'middle',style:'drystone',role:'inn',job:'brewing'},
 note:'the Fellgang inn on the Market: a warm common room with two peat hearths, feast boards, ale kegs and stew pot, partitioned bunk alcoves at one end and a tack and pack room at the other',
 build(o){const C=fgCx(o),B=TG.fg.BOX['fg-halting-house'];
  fgHouse(B,C,FG_TOWN_FAMS['fg-halting-house'],S=>{const col=fgCol('stone',C),wc=fgCol('wood',C),pc=fgCol('pole',C);
   const xb=S.x0+(S.x1-S.x0)*.68,xt=S.x0+(S.x1-S.x0)*.24;
   if(S.fam!=='burst'){
    for(const xw of [xt,xb]){fgWall(xw,S.z0,xw,S.z1-1.45,.5,0,S.wh,C,col);fgWall(xw,S.z1-.45,xw,S.z1,.5,0,S.wh,C,col);fgWall(xw,S.z1-1.45,xw,S.z1-.45,.5,1.95,S.wh,C,col);}}
   /* common hearth hall in the middle */
   const mx=(xt+xb)/2;fgHearth(mx-1.2,0,C,{r:.52});fgHearth(mx+1.6,-.4,C,{r:.44});
   fgFurn('fellgang_court_feast_board',mx-.2,null,Math.min(S.z1-1.35,.95),0);
   fgFurnBack('fellgang_common_bench',mx-1.2,S.z0);fgFurnBack('fellgang_common_bench',mx+1.2,S.z0,{v:1});
   /* the ale bar: plate-topped stone counter, kegs, stew pot and bread */
   const bx=xb-1.15,bz=S.z0+1.05;box('stone',bx,0,bz,1.7,.92,.58,fgCol('stoneD',C));box('plate',bx,.92,bz,1.86,.05,.7,fgCol('plate',C));
   fgFurn('generic_keg',bx-.45,.97,bz,0);fgFurn('generic_ale',bx+.35,.97,bz,0);fgFurn('generic_stew_pot',mx-1.2,.12,0,0);
   fgFurn('generic_bread_basket',mx-.2,.82,Math.min(S.z1-1.35,.95),0);
   /* sleeping bunks at +x: two-tier plank box-bunks along the walls */
   const rx=(xb+S.x1)/2;for(const y of [.35,1.25])if(y+.4<S.wh){box('wood',rx,y,S.z0+.55,Math.max(1.6,S.x1-xb-.5),.06,.95,wc);ellip('fur',rx,y+.1,S.z0+.55,.7,.08,.38,P('fur'),0,6);}
   for(const s of [-1,1])pole('pole',[rx+s*Math.max(.7,(S.x1-xb)*.35),.06,S.z0+1.02],[rx+s*Math.max(.7,(S.x1-xb)*.35),Math.min(1.85,S.wh-.2),S.z0+1.02],.045,pc,5);
   fgFurn('fellgang_poor_fur_bed',rx,null,Math.min(S.z1-.9,.6),PI,{v:1});
   /* tack and pack store at -x */
   const lx=(S.x0+xt)/2;fgFurn('generic_sack',lx-.3,null,S.z0+.55,0);fgFurn('generic_barrel',lx+.45,null,S.z0+.6,0);fgFurnSide('fellgang_common_wall_peg_rack',-1,S.x0,0);
   /* lantern at the door and inn sign */
   const dx=S.doors[0][0],zs=S.fam==='porch'?S.hd+1.73:S.hd+.02;
   fgSign('WARM HEARTH',dx,S.fam==='porch'?S.wh-1.15:Math.min(S.wh-.65,2.2),zs,0,C,{ch:.16});
   W(dx+(dx>0?-1.35:1.35),1.75,S.hd+.14,0,()=>{box('tin',0,0,0,.22,.26,.22,fgCol('tin',C));sph('glow',0,.12,0,.045,hc(0x7ab4ff),1.3,6);haloAt(0,.12,0,0x7ab4ff,false);});
   fgNote('bunks',3);},{doorW:1.25,doorH:2});}});

defBuilding({key:'fg-markethall',name:'The market hall',seed:9153,cut:true,w:20,d:10.5,h:6.2,budget:9500,
 tags:{types:['market','civic'],wealth:'middle',style:'drystone',role:'market',job:'trading'},
 note:'stone piers under a wide bell-fir and turf roof, open along its bays so drovers and townsfolk weigh salt, cheese, wool and valley grain out of the sleet; an iron weigh-beam hung in the middle',
 build(o){const C=fgCx(o),B0=TG.fg.BOX['fg-markethall'],B=fgFillBox(B0,C,[.86,.96],[.84,.96],[.85,.98]);
  const hw=B.w/2,hd=B.d/2,wh=Math.max(2.45,B.h*.46),rise=B.h-.12-wh,col=fgCol('stone',C),sc=fgCol('stoneD',C),pc=fgCol('pole',C),wc=fgCol('wood',C),look=fgTurfLook(C);
  fgPlinth(-hw,hw,-hd,hd,C);
  /* stone piers round both long sides (five bays), low kerb walls at the corners, drystone gables over end tie-walls */
  const nb=5;for(let i=0;i<=nb;i++){const x=-hw+.45+i*(B.w-.9)/nb;for(const sz of [-1,1])box('stone',x,0,sz*(hd-.42),.82,wh,.82,col);}
  for(const sx of [-1,1]){const x=sx*(hw-.38);fgWall(x,-hd+.8,x,-1.45,.7,0,wh,C,col);fgWall(x,1.45,x,hd-.8,.7,0,wh,C,col);box('stoneD',x,2.25,0,.76,.28,3.4,sc);fgWall(x,-1.45,x,1.45,.7,2.53,wh,C,col);}
  const T=fgTurfRoof(hw+.12,hd+.1,wh-.05,rise,'halfhip','x',C,{look});
  for(const sx of [-1,1]){const x=sx*(hw-.38);fgGableSlab('stone','x',x,.7,-hd+.08,hd-.08,wh-.04,z=>T.Y(x-.35,z)-.08,z=>T.Y(x+.35,z)-.08,col,12);}
  /* tie-beams, king-posts and purlins inside */
  for(let i=1;i<nb;i++){const x=-hw+.45+i*(B.w-.9)/nb,yr=T.Y(x,0)-.34;pole('pole',[x,wh-.08,-hd+.5],[x,wh-.08,hd-.5],.1,pc,6);pole('pole',[x,wh-.04,0],[x,yr,0],.08,pc,5);
   for(const sz of [-1,1])pole('pole',[x,wh-.05,sz*(hd-.55)],[x,yr,0],.06,pc,5);}
  pole('pole',[-hw+.6,wh+rise-.38,0],[hw-.6,wh+rise-.38,0],.1,pc,6);
  /* the town's great iron weigh-beam hung in the centre bay, with twin scale pans */
  const wy=wh-.1;cord('cable',[[0,wy,0],[0,1.95,0]],.02,P('cable'));beam('iron',[-1.15,1.95,0],[1.15,1.95,0],.035,P('iron'),true,6);
  for(const sx of [-1,1]){const px=sx*1.08;for(const dz of [-.26,.26])cord('cord',[[px,1.95,0],[px+sx*.02,1.05,dz]],.01,P('rope'));
   cyl('plate',px,1,0,.38,.05,fgCol('plate',C),10);if(sx>0)ellip('plain',px,1.08,0,.26,.14,.24,P('white'),0,6);}
  /* four stone-and-plate market counters in two rows, leaving the cross-walk clear */
  for(const sx of [-1,1])for(const sz of [-1,1]){const cx=sx*(hw*.48),cz=sz*(hd*.36);
   box('stone',cx,0,cz,3.2,.9,.68,sc);box('plate',cx,.9,cz,3.36,.05,.8,fgCol('plate',C));
   if(sz<0){fgFurn('job_salt_tub',cx-.8,.95,cz,0);fgFurn('generic_cheese',cx+.5,.95,cz,0);}
   else{fgFurn('generic_produce',cx-.7,.95,cz,0);fgFurn('generic_strongbox',cx+.85,.95,cz,PI);}}
  fgFurn('job_salt_heap',-hw*.62,null,-hd*.55,0);fgFurn('generic_sack',hw*.64,null,-hd*.52,.4);
  fgFurn('generic_barrel',-hw*.68,null,hd*.52,0);fgFurn('generic_crate',hw*.66,null,hd*.5,0);
  fgSign('FAIR WEIGHT',0,wh-.42,hd+.04,0,C,{ch:.17});
  door(0,0,hd-.4,0,2.8,2.3);fgNote('counters',4);}});

defBuilding({key:'fg-booth',name:'Market booths',seed:9154,cut:true,w:10,d:4,h:3.4,budget:3500,
 tags:{types:['market','shop'],wealth:'poor',style:'salvage',role:'stall',job:'trading'},
 note:'three market or fair stalls side by side on a drystone kerb: bell-fir posts, a sloped awning of hide and lashed plate, plank counters and salt, cheese and felt',
 build(o){const C=fgCx(o),B=fgFillBox(TG.fg.BOX['fg-booth'],C,[.84,.96],[.82,.95],[.84,.98]),hw=B.w/2,hd=B.d/2;
  const yf=B.h-.08,yb=Math.max(1.85,B.h*.62),col=fgCol('stone',C),pc=fgCol('pole',C),wc=fgCol('wood',C);
  fgPlinth(-hw,hw,-hd,hd,C);
  /* low drystone windbreak along the back, four post pairs, purlins and sloped hide awning with a plate patch */
  fgWall(-hw+.15,-hd+.28,hw-.15,-hd+.28,.5,0,1.25,C,col);
  for(let i=0;i<=3;i++){const x=-hw+.22+i*(B.w-.44)/3;pole('pole',[x,.06,hd-.22],[x,yf-.06,hd-.22],.075,pc,6);pole('pole',[x,.06,-hd+.28],[x,yb-.04,-hd+.28],.075,pc,6);
   beam('pole',[x,yf-.1,hd-.22],[x,yb-.06,-hd+.28],.055,pc,5);}
  for(const [y,z] of [[yf-.08,hd-.22],[(yf+yb)/2-.08,0],[yb-.06,-hd+.28]])pole('pole',[-hw+.1,y,z],[hw-.1,y,z],.06,pc,5);
  fgSlab('hideW',[-hw-.1,yf,hd-.1],[hw+.1,yf,hd-.1],[-hw-.1,yb,-hd-.08],.04,P('hide'));
  fgSlab('plate',[-B.w*.18,yf+.04,hd-.14],[B.w*.18,yf+.04,hd-.14],[-B.w*.18,(yf+yb)/2+.04,0],.035,fgCol('plate',C));
  for(const sx of [-1,1])fgLash([sx*(hw-.12),yf,hd-.12],[sx*(hw-.12),1.1,hd-.22]);
  /* three stall counters along the front, wares on them, sacks and baskets behind */
  for(let k=0;k<3;k++){const cx=-hw+(k+.5)*B.w/3,bw=B.w/3-.38;
   for(const sx of [-1,1])box('stoneD',cx+sx*(bw/2-.18),0,hd-.55,.28,.86,.52,fgCol('stoneD',C));
   box('wood',cx,.86,hd-.55,bw+.08,.06,.64,wc);
   if(k===0){fgFurn('job_salt_tub',cx-.35,.92,hd-.55,0);ellip('plain',cx+.35,.98,hd-.55,.22,.1,.18,P('white'),0,5);}
   else if(k===1){fgFurn('generic_cheese',cx-.3,.92,hd-.55,0);fgFurn('generic_bread_basket',cx+.35,.92,hd-.55,0);}
   else{for(let r=0;r<3;r++)WX(cx-.35+r*.32,.98,hd-.55,0,0,PI/2,()=>cyl('hide',0,0,0,.1,.46,hc([0x8a321e,0x5e5448,0xc8902e][(r+C.v)%3]),8));}}
  fgFurn('generic_sack',-hw*.55,null,-hd+.75,.2);fgFurn('generic_floor_basket',hw*.52,null,-hd+.78,0);
  if(!C.worn)fgSign(pick(['MARKET','FAIR','TRADE']),0,yf-.42,hd-.14,0,C,{ch:.12,kind:'rust',ink:'white'});
  fgNote('stalls',3);}});

defBuilding({key:'fg-ropewalk',name:'A town rope-walk range',seed:9155,cut:true,w:44,d:5.5,h:4.4,budget:11000,
 tags:{types:['industry'],wealth:'middle',style:'drystone',role:'works',job:'ropemaking'},
 note:'a 44 m town rope-walk shed: a walled jack-house at the head, a wheeled traveller car on fir rails down the walk, a peat-heated tar kettle, Ancient steel wire spliced with lobe-larch bark cordage, and family coil pegs along the back wall',
 build(o){const C=fgCx(o),B=fgFillBox(TG.fg.BOX['fg-ropewalk'],C,[.9,.98],[.84,.96],[.86,.98]),S=fgShed(B,C,{fe:fgLerp([2.35,2.7],fgU(C,24))});
  const pc=fgCol('pole',C),wc=fgCol('wood',C),col=fgCol('stone',C),ic=P('iron');
  /* the head jack-house at -x (4.4 m enclosed bay with crank gears and strand hooks) */
  const jx=S.x0+4.2;fgWall(jx,S.z0,jx,S.z1-.9,.5,0,S.fe,C,col);
  const x0=jx+.35,x1=S.hw-1.8,yj=1.02;
  box('wood',x0-.25,.85,.15,.16,.55,1.3,wc);for(const dz of [-.36,-.12,.12,.36])beam('iron',[x0-.15,yj,.15+dz],[x0+.12,yj,.15+dz],.022,ic,true,5);
  /* fir rails down the walk and the wheeled traveller car near +x */
  for(const dz of [-.48,.48])box('wood',(x0+x1)/2,.06,.15+dz,x1-x0,.07,.09,wc);
  const tx=x1-2.4;W(tx,.13,.15,0,()=>{box('wood',0,.12,0,1.1,.1,1.06,wc);for(const sx of [-.4,.4])for(const sz of [-.48,.48])WX(sx,0,sz,PI/2,0,0,()=>cyl('iron',0,0,0,.11,.06,ic,8));
   for(const sz of [-.38,.38])pole('pole',[0,.22,sz],[0,1.08,sz],.06,pc,5);box('wood',0,.82,0,.14,.34,.95,wc);
   beam('iron',[.08,.92,0],[.36,1.15,0],.025,ic,true,5);});
  /* four taut strand runs supported by cross-trees every 5 m */
  for(const dz of [-.36,-.12,.12,.36]){const P0=[];for(let k=0;k<=16;k++){const t=k/16;P0.push([x0+.1+(tx-x0-.2)*t,yj-.05*Math.sin(PI*t),.15+dz*(1-.55*t)]);}
   cord(dz<0?'cable':'cord',P0,.014,dz<0?P('cable'):P('rope'));}
  for(let x=x0+4.2;x<tx-1.6;x+=5){pole('pole',[x,.06,.15],[x,yj+.06,.15],.045,pc,5);box('wood',x,yj-.05,.15,.09,.05,.92,wc);}
  /* the tar kettle at +x over a low stone firebox, splicing benches and family pegs along the back wall */
  const kx=S.hw-1.05;box('stoneD',kx,0,-.35,1.1,.48,1.1,fgCol('stoneD',C));cyl('iron',kx,.48,-.35,.42,.46,ic,10);cyl('plain',kx,.91,-.35,.38,.02,P('tyre'),10);
  if(!C.worn)smokeAt(kx,1.15,-.35,{r:.22});
  for(const bx of [-6,6]){box('wood',bx,.72,S.z0+.52,2.4,.06,.68,wc);for(const s of [-1,1])box('wood',bx+s*1,.06,S.z0+.52,.08,.66,.58,wc);
   ring('cable',bx+.4,.84,S.z0+.52,.3,.04,P('cable'));}
  fgPegRow(o.pegs==null?24:o.pegs|0,jx+.8,S.x1-1.8,2.18,S.z0+.01,C);
  fgFurn('job_pole_rack',S.x0+1.9,null,S.z0+.48,0);fgFurn('job_oil_drum_lying',kx-1.5,null,S.z0+.55,0);
  fgFurn('generic_floor_basket',0,null,S.z0+.48,0);
  fgSign('HOLD FAST',0,S.fe-.68,S.hd-.08,0,C,{ch:.17});}});

defBuilding({key:'fg-great-icehouse',name:'A great ice house',seed:9156,cut:true,w:20,d:13,h:5.8,budget:11000,
 tags:{types:['industry'],wealth:'middle',style:'drystone',role:'works',job:'warehousing'},
 note:'a town-scale turf-banked corbelled ice vault: buttressed drystone facade faced in salvage plate, double-door airlock passage, timber loading chute, and five deep tiers of pond and lake ice packed in sawdust and snow',
 build(o){const C=fgCx(o),B=fgFillBox(TG.fg.BOX['fg-great-icehouse'],C,[.84,1],[.86,1],[.84,1]),rw=B.w/2,rd=B.d/2,H=B.h,dent=2.7*Math.min(1,B.d/13);
  const dk=a=>{let d=((a-PI/2+PI)%TAU+TAU)%TAU-PI;return Math.exp(-(d/.4)*(d/.4));};
  psurf('turf',(u,v)=>{const a=u*TAU,c=Math.cos(v*PI/2),e=Math.sin(v*PI/2),k=1-dk(a)*dent/rd*(1-e*e*.68);return [Math.cos(a)*rw*c*k,H*e,Math.sin(a)*rd*c*k];},34,11,fgTurfCol(C,fgTurfLook(C)),{flip:true});
  psurf('turf',(u,v)=>{const a=u*TAU,k=1-dk(a)*dent/rd,px=Math.cos(a)*rw*k,pz=Math.sin(a)*rd*k;return [px,v*(Math.min(0,C.gl(px,pz))-.5),pz];},34,1,fgCol('turf',C));
  const vw=rw-1.15,vd=rd-2,vh=H-.78;
  psurf('stone',(u,v)=>{const a=u*TAU,c=Math.cos(v*PI/2),e=Math.sin(v*PI/2),k=1-dk(a)*1.1/vd*(1-e*e*.68);return [Math.cos(a)*vw*c*k,vh*e,Math.sin(a)*vd*c*k];},30,9,fgCol('stone',C));
  psurf('stoneD',(u,v)=>{const a=u*TAU;return [Math.cos(a)*vw*v,.05,Math.sin(a)*vd*v];},30,2,fgCol('stoneD',C),{up:true});
  {let lo=1e9,cx=0,cz=0;for(const sx of [-1,1])for(const sz of [-1,1]){const g=C.gl(sx*rw*.72,sz*rd*.72);if(g<lo){lo=g;cx=sx;cz=sz;}}
   fgPlinth(-2.8,2.8,rd-2.6,rd-.2,C);box('stone',cx*rw*.65,C.lo,cz*rd*.65,1.4,-C.lo+.04,1.4,fgCol('stone',C));}
  /* buttressed airlock entrance facade, hoist beam over the lintel, loading apron and slide */
  const zf=rd-1.65,col=fgCol('stone',C),sc=fgCol('stoneD',C);
  fgWall(-3.1,zf,-.85,zf,.7,0,3,C,col);fgWall(.85,zf,3.1,zf,.7,0,3,C,col);
  for(const s of [-1,1]){fgWall(s*3.1,zf-1.8,s*3.1,zf+.45,.65,0,2.65,C,col);fgWall(s*1.05,vd-1.5,s*1.05,zf-.35,.48,0,2.45,C,col);}
  box('stoneD',0,2.15,zf,2.2,.36,.78,sc);fgWall(-.85,zf,.85,zf,.7,2.51,3,C,col);
  box('stoneD',0,2.45,(zf+vd-1.2)/2,2.5,.28,zf-vd+1.7,sc);
  beam('iron',[0,2.82,zf-.1],[0,2.82,zf+.95],.045,P('iron'),true,6);ring('cable',0,2.68,zf+.85,.11,.022,P('cable'));
  for(const s of [-1,1])fgPatch(s*1.85,2.55,zf+.37,1.1,1.8,0,C,s<0?'plate':'rust');
  fgDoor(0,zf,1.65,2.1,C,{th:.7,name:'the great ice house outer door'});
  box('stoneD',0,0,(zf+.35+rd-.06)/2,3.4,.12,rd-.06-zf-.35,sc);
  box('wood',-.55,.12,zf+.78,.68,.06,1.15,fgCol('wood',C),0,.08);
  /* slate reckoning board and sledge outside */
  W(2.05,1.05,zf+.42,0,()=>{box('rust',0,0,0,.78,.72,.03,hc(0x3a3430));let n=0;
   for(let g=0;g<6+C.v%3;g++)for(let k=0;k<5;k++){const x=-.3+(g%3)*.24+k*.03,y=.1+Math.floor(g/3)*.22;
    if(k<4)box('plain',x,y,.02,.008,.14,.004,P('white'));else box('plain',x-.06,y+.06,.02,.14,.008,.004,P('white'),0,0,.5);n++;}fgNote('chalk',n);});
  fgSign('THE COLD IS OWED',0,3.18,zf+.38,0,C,{ch:.14});
  /* five tiers of ice blocks in sawdust and snow inside the vault */
  const iw=vw-.85,id=vd-.85,ic=P('ice');let nb=0;
  for(let tier=0;tier<5;tier++){const y=.08+tier*.68;for(let z=-id+.45;z<=id-.4;z+=.86)for(let x=-iw+.65;x<=iw-.6;x+=1.22){
   if(Math.abs(x)<1.55&&z>id-2.6)continue;const f=1-(x/iw)*(x/iw)-(z/id)*(z/id);if(f<=0||y+.7>(vh-.42)*Math.sqrt(f))continue;
   box('ice',x,y,z,1.12,.6,.76,ic,rr(-.03,.03));nb++;if(C.worn&&rng()<.2)continue;
   box('straw',x,y+.6,z,1.16,.06,.8,P('sawdust'));if(tier===4||y+1.4>(vh-.42)*Math.sqrt(f))box('straw',x,y+.66,z,1.18,.08,.82,P('snow'));}}
  fgNote('blocks',nb);
  if(typeof KratorFurniture!=='undefined'&&KratorFurniture.has('fellgang_common_ice_sledge'))fgFurn('fellgang_common_ice_sledge',-2.2,null,0,PI/2);}});

defBuilding({key:'fg-smithy',name:'The salvage-smithy',seed:9157,cut:true,w:11,d:8,h:5,budget:8500,
 tags:{types:['industry','shop'],wealth:'middle',style:'drystone',role:'works',job:'smithing'},
 note:'a settled Traveller smithy working Ancient steel plate, wire rope and sledge runners: raised stone forge and scrap hood, twin hide bellows, block anvil, stone quench trough and cable racks',
 build(o){const C=fgCx(o),B=TG.fg.BOX['fg-smithy'];
  fgHouse(B,C,FG_TOWN_FAMS['fg-smithy'],S=>{const sc=fgCol('stoneD',C),ic=P('iron'),pc=fgCol('pole',C),wc=fgCol('wood',C);
   /* raised stone forge hearth against the back wall, scrap smoke hood, glowing coals */
   const fx=S.x0+1.55,fz=S.z0+1.05;box('stone',fx,0,fz,1.9,.86,1.45,sc);box('stoneD',fx,.86,fz,1.5,.14,1.1,P('peat'));
   box('scrap',fx,1.72,fz,1.85,.65,1.35,fgCol('scrap',C));cyl('iron',fx,2.35,fz,.22,Math.max(.8,S.Y(fx,fz)-2.1),ic,8);
   if(!C.worn){for(let k=0;k<4;k++)ellip('glow',fx+rr(-.28,.28),.98,fz+rr(-.2,.2),.13,.06,.11,hc(0xff5a18),rr(0,PI),4);
    smokeAt(fx,Math.min(B.h+.3,S.Y(fx,fz)+.35),fz,{r:.32});haloAt(fx,1.15,fz,0xff6a20,true);}
   /* twin hide bellows on a fir frame beside the forge */
   W(fx+1.55,.55,fz,0,()=>{for(const dy of [0,.28]){box('wood',0,dy,0,.95,.05,.58,wc);ellip('hide',-.05,dy+.12,0,.42,.12,.26,P('hide'),0,6);}
    beam('iron',[-.52,.14,0],[-.85,.32,0],.03,ic,true,5);pole('pole',[.35,.35,.2],[.65,1.05,.35],.03,pc,5);});
   /* Ancient steel-block anvil on a fir butt, stone quench trough, workbench and racks of cut plate and cable */
   cyl('pole',0,.06,.15,.36,.58,pc,8);box('iron',0,.64,.15,.68,.26,.32,ic);beam('iron',[.34,.82,.15],[.58,.84,.15],.07,ic,true,5,.015);
   box('stoneD',1.35,0,.35,1.25,.58,.62,sc);box('plain',1.35,.48,.35,1.05,.05,.44,hc(0x33444c));
   const rx=S.x1-.55;box('wood',rx-.55,.78,S.z0+.52,1.9,.06,.62,wc);for(const s of [-1,1])box('wood',rx-.55+s*.8,.06,S.z0+.52,.08,.72,.55,wc);
   for(let k=0;k<4;k++)box(k%2?'plate':'rust',rx-.2,.06,S.z1-1.35+k*.18,.05,1.25,.85,fgCol(k%2?'plate':'rust',C),.08);
   ring('cable',rx-.65,.88,S.z0+.52,.28,.04,P('cable'));
   fgFurn('fellgang_common_brazier',S.x0+.75,null,Math.min(S.z1-.75,.8),0);fgFurn('job_plank_stack',rx-.8,null,Math.min(S.z1-.8,.85),PI/2);
   fgDoorSign(S,C,{text:'HARD IRON',ch:.14,kind:'rust',ink:'white'});fgNote('forges',1);},{doorW:1.55,doorH:2,noHood:true});}});

defBuilding({key:'fg-tannery',name:'The tannery and felt house',seed:9158,cut:true,w:13,d:8.5,h:4.8,budget:8500,
 tags:{types:['industry'],wealth:'poor',style:'drystone',role:'works',job:'tanning'},
 note:'Blakhed\'s felt and hide works: stone-lined soaking and liming pits, a peat-fired boiling cauldron under a louvred turf ridge, a fulling and felting board with rolled felt bolts, and hides laced in bell-fir frames',
 build(o){const C=fgCx(o),B=TG.fg.BOX['fg-tannery'];
  fgHouse(B,C,FG_TOWN_FAMS['fg-tannery'],S=>{const sc=fgCol('stoneD',C),wc=fgCol('wood',C),ic=P('iron');
   fgLouvre(S,Math.min(S.w*.42,3.2),Math.min(B.h+.3,S.Y(0,0)+.42),C);
   /* three sunken-kerbed stone soaking and liming vats along the -x end */
   for(let k=0;k<3;k++){const vx=S.x0+1.05,vz=S.z0+.95+k*1.55;if(vz+.65>S.z1)continue;
    box('stoneD',vx,0,vz,1.35,.52,1.25,sc);box('plain',vx,.42,vz,1.08,.05,.98,hc(k===0?0xc8c2b2:0x4e3c2c));}
   /* peat-fired boiling vat in the middle for fulling wool into thick rim felt */
   box('stoneD',-.2,0,S.z0+1.15,1.25,.52,1.25,sc);cyl('iron',-.2,.52,S.z0+1.15,.48,.48,ic,10);
   if(!C.worn){ellip('glow',-.2,.14,S.z0+1.82,.14,.05,.1,hc(0xd04a18),0,4);haloAt(-.2,.35,S.z0+1.15,0xff6a20,false);}
   /* long plank fulling and felting board at +x, bolts of dyed and grey felt stacked */
   const tx=Math.max(1.2,(S.x1-.4)/2+.6);box('wood',tx,.78,0,2.8,.07,1.15,wc,-.05);
   for(const sx of [-1.1,1.1])for(const sz of [-.42,.42])box('wood',tx+sx,.06,sz,.09,.72,.09,wc);
   box('hide',tx,.85,0,2.3,.05,.92,hc(0xd8d2c4));
   for(let k=0;k<4;k++)WX(S.x1-.65,.22+k*.22,S.z0+.75,0,PI/2,PI/2,()=>cyl('hide',0,0,0,.12,1.1,hc([0x6e685e,0x8a321e,0xc8902e,0xd8d2c4][k%4]),8));
   /* catalog tanning frames along the wall and outside by the door */
   fgFurnBack('fellgang_common_tanning_frame',Math.min(S.x1-1.3,1.5),S.z0);
   fgFurnSide('fellgang_common_tanning_frame',1,S.x1,Math.min(S.z1-1.1,.6),null);
   fgFurn('fellgang_poor_hide_sacks',0,null,Math.min(S.z1-.8,.9),0);
   fgDoorSign(S,C,{text:'FELT AND HIDE',ch:.13,kind:'plate'});fgNote('vats',3);},{doorW:1.25,doorH:1.9,noHood:true});}});

defBuilding({key:'fg-granary',name:'A raised granary',seed:9159,cut:true,w:11,d:7.5,h:5.2,budget:8000,
 tags:{types:['farm','industry'],wealth:'middle',style:'drystone',role:'warehouse',job:'warehousing'},
 note:'a drystone-and-timber granary lifted on mushroom-capped staddle piers so damp turf and vermin never reach the town\'s frostoat, buckwheat and caravan grain; detached stone steps before the plate door',
 build(o){const C=fgCx(o),B0=TG.fg.BOX['fg-granary'];
  const w=B0.w*fgLerp([.82,.95],fgU(C,21)),d=B0.d*fgLerp([.74,.84],fgU(C,22)),H=B0.h*fgLerp([.84,.98],fgU(C,23));
  fgSet('fill',[+(w/B0.w).toFixed(2),+(d/B0.d).toFixed(2),+(H/B0.h).toFixed(2)]);
  const hw=w/2,hd=d/2,yf=.68,whL=fgLerp([1.72,1.98],fgU(C,24)),rise=Math.max(.9,H-.1-yf-whL),zo=-.32;
  const col=fgCol('stone',C),sc=fgCol('stoneD',C),wc=fgCol('wood',C),pc=fgCol('pole',C),look=fgTurfLook(C);
  const C2=Object.assign({},C,{gl:(x,z)=>C.gl(x,z+zo)});
  /* flagged yard footing down to C.lo, then eight drystone staddle piers with wide slate rat-caps */
  W(0,0,zo,0,()=>{fgPlinth(-hw,hw,-hd,hd,C2,{top:.05});
   for(let i=0;i<4;i++)for(const sz of [-1,1]){const px=-hw+.75+i*(w-1.5)/3,pz=sz*(hd-.62);
    box('stone',px,.05,pz,.58,.52,.58,col);box('stoneD',px,.57,pz,.92,.1,.92,sc);}
   for(const sz of [-1,1])pole('pole',[-hw+.2,yf-.04,sz*(hd-.62)],[hw-.2,yf-.04,sz*(hd-.62)],.1,pc,6);
   box('wood',0,yf,0,w-.16,.1,d-.16,wc);});
  /* detached stone steps before the front door (a 14 cm vermin gap before the sill) */
  for(let k=0;k<3;k++)box('stoneD',0,k*.21,zo+hd+.22+(2-k)*.26,1.45,.22,.28,sc);
  wkPad(0,zo+hd+.48,1.45,.82,yf);
  /* the raised storehouse shell and grain bins inside */
  W(0,yf+.08,zo,0,()=>{const S=fgRange({w,d,wh:whL,rise,th:.62,plan:'rect',roof:C.v%3===2?'halfhip':'gable',ax:'x',ov:.12,
    doors:[[0,1.05,Math.min(1.68,whL-.22)]],wins:[],look},C2);
   /* four plank-walled grain bins along the back and ends, filled with frostoat and buckwheat */
   const bz=S.z0+.95,bw=(S.x1-S.x0)/4;box('wood',0,0,bz+.85,S.x1-S.x0,.95,.07,wc);
   for(let i=0;i<=4;i++){const bx=S.x0+i*bw;if(i>0&&i<4)box('wood',bx,0,bz,.07,1.02,1.7,wc);
    if(i<4){const hg=.52+.28*fgU(C,710+i);box('straw',bx+bw/2,.02,bz,bw-.1,hg,1.62,hc(i%2?0xc49a4e:0xa66e3e));}}
   fgFurn('generic_meal_ark',S.x0+1.1,0,Math.min(S.z1-.65,.75),0);
   fgFurn('generic_sack',S.x1-.85,0,Math.min(S.z1-.65,.75),-.3);fgFurn('generic_sack',S.x1-1.45,0,Math.min(S.z1-.7,.75),.4,{v:1});
   fgFurn('job_winnowing_tub',-1.15,0,Math.min(S.z1-.7,.75),0);
   fgSign('DRY CORN',1.55,Math.min(1.05,whL-.5),hd+.02,0,C,{ch:.13});fgNote('bins',4);});}});

defBuilding({key:'fg-fair-stand',name:'The Fair judges\' stand',seed:9160,cut:true,w:8,d:6,h:4.6,budget:4500,
 tags:{types:['civic','market'],wealth:'middle',style:'drystone',role:'civic',job:'trading'},
 note:'the raised drystone dais overlooking the Fair\'s beast ring: stone steps up, turf-and-plate canopy on bell-fir posts, the judges\' seat, rulebook, war drum and beast tally slate',
 build(o){const C=fgCx(o),B=fgFillBox(TG.fg.BOX['fg-fair-stand'],C,[.84,.96],[.84,.96],[.86,.98]),hw=B.w/2,hd=B.d/2;
  const yd=.72,yf=B.h-.12,yb=Math.max(2.75,B.h*.72),col=fgCol('stone',C),sc=fgCol('stoneD',C),pc=fgCol('pole',C);
  fgPlinth(-hw,hw,-hd,hd,C,{top:yd});
  /* coping round the dais, stone steps recessed into the -x flank, drystone back wall, canopy posts and roof */
  box('stoneD',0,yd-.12,0,B.w+.08,.12,B.d+.08,sc);
  for(let k=0;k<3;k++)box('stoneD',-hw+.45,k*.24,-hd+.55+k*.34,.88,.25,.34,sc);
  fgWall(-hw+.3,-hd+.32,hw-.3,-hd+.32,.6,yd,yb,C,col);
  for(const sx of [-1,1]){pole('pole',[sx*(hw-.28),yd,hd-.28],[sx*(hw-.28),yf-.08,hd-.28],.095,pc,6);
   pole('pole',[sx*(hw-.28),yd,-hd+.35],[sx*(hw-.28),yb,-hd+.35],.085,pc,6);beam('pole',[sx*(hw-.28),yf-.1,hd-.28],[sx*(hw-.28),yb-.04,-hd+.35],.07,pc,5);}
  pole('pole',[-hw+.15,yf-.08,hd-.28],[hw-.15,yf-.08,hd-.28],.09,pc,6);
  fgSlab('turf',[-hw-.14,yf-.04,hd+.04],[hw+.14,yf-.04,hd+.04],[-hw-.14,yb+.08,-hd-.08],.26,fgTurfCol(C,fgTurfLook(C)));
  /* judges' furnishings on the dais, horn standards and tally slate */
  fgFurn('fellgang_court_bigun_seat',0,yd,-hd+1.15,0);fgFurn('fellgang_court_rulebook',.95,yd,-.1,0);
  fgFurn('fellgang_common_war_drum',-1.15,yd,-.05,.3);fgFurn('fellgang_common_brazier',hw-.95,yd,hd-.85,0);
  W(hw-1.15,yd+.85,-hd+.66,0,()=>{box('rust',0,0,0,.9,.85,.04,hc(0x3a3430));for(let r=0;r<3;r++)quad('plain',0,.18+r*.24,.025,.68,.02,P('white'));});
  for(const sx of [-1,1])fgMark(C.v+(sx>0?1:0),sx*(hw-.9),yd*.45,hd+.05,0,.32);
  fgSign('ALL HANDS',0,yf-.46,hd-.2,0,C,{ch:.14});fgNote('dais',1);}});

defBuilding({key:'fg-dugout-icehouse',name:'A dugout ice-house',seed:9168,cut:true,w:11,d:13,h:3.8,budget:6800,
 tags:{types:['industry'],wealth:'middle',style:'drystone',role:'works',job:'warehousing'},
 note:'an earth-bermed dugout ice-cellar sunk into a banked pit: battered drystone retaining walls, stone-revetted entrance trench with timber slide chute and sloped storm-cellar doors, low turf A-frame roof lashed with hold-down cables, frost-vent stack, and slatted timber ice-cribs packed with pond and lake ice in sawdust',
 build(o){const C=fgCx(o),B=fgFillBox(TG.fg.BOX['fg-dugout-icehouse'],C,[.86,.96],[.86,.96],[.84,.97]),hw=B.w/2,hd=B.d/2,H=B.h;
  const yb=1.42,rid=H-.22,pw=hw-1.55,z0=-hd+1.55,z1=hd-2.85,zm=(z0+z1)/2,ph=(z1-z0)/2;
  const col=fgCol('stone',C),sc=fgCol('stoneD',C),wc=fgCol('wood',C),pc=fgCol('pole',C),ic=P('iron'),look=fgTurfLook(C),tc=fgTurfCol(C,look);
  /* full flagged stone cold-pit floor and foundation skirt reaching C.lo */
  fgPlinth(-pw-.45,pw+.45,z0-.45,hd-.12,C,{top:.06});
  {let lo=1e9,cx=0,cz=0;for(const sx of [-1,1])for(const sz of [-1,1]){const g=C.gl(sx*hw*.82,sz*hd*.82);if(g<lo){lo=g;cx=sx;cz=sz;}}
   box('stone',cx*hw*.72,C.lo,cz*hd*.72,1.3,-C.lo+.06,1.3,col);}
  /* sculpted horseshoe earth-and-turf excavation spoil berm banking up around the sides (-x, +x), rear (-z) and front shoulders */
  const sPow=(c,p)=>(c<0?-1:1)*Math.pow(Math.abs(c),p),a0=PI/2+.26,a1=PI/2+TAU-.26;
  const bermPt=(u,v)=>{const a=a0+(a1-a0)*u,ca=Math.cos(a),sa=Math.sin(a);
   const ox=sPow(ca,.72)*hw,oz=sPow(sa,.72)*hd;
   const ix=Math.max(-pw-.12,Math.min(pw+.12,ca*(pw*1.38))),iz=Math.max(z0-.12,Math.min(z1+.18,zm+sa*(ph*1.38)));
   return [ox+(ix-ox)*v,yb*Math.sin(v*PI/2),oz+(iz-oz)*v];};
  psurf('turf',bermPt,28,5,tc,{up:true});
  psurf('turf',(u,v)=>{const p=bermPt(u,0);return [p[0],v*(Math.min(0,C.gl(p[0],p[2]))-.48),p[2]];},28,1,fgCol('turf',C));
  for(let k=0;k<8;k++){const a=a0+.2+k*(a1-a0-.4)/7,p=bermPt((a-a0)/(a1-a0),.35+(k%3)*.18);
   ellip('stone',p[0],p[1]-.04,p[2],.26,.15,.22,k%2?col:sc,a,6);}
  /* sunken drystone pit lining walls (x = +-pw, z = z0, and front bulkhead at z1) + meltwater drainage trench in the floor */
  fgWall(-pw,z0,pw,z0,.6,0,yb+.06,C,col);
  for(const sx of [-1,1])fgWall(sx*pw,z0+.3,sx*pw,z1,.6,0,yb+.06,C,col);
  fgWall(-pw-.2,z1,-.66,z1,.65,0,yb+.08,C,col);fgWall(.66,z1,pw+.2,z1,.65,0,yb+.08,C,col);
  box('stoneD',0,1.88,z1,1.85,.3,0.72,sc);
  box('stoneD',0,.02,zm,.34,.06,z1-z0-.8,hc(0x2e3438));
  for(let z=z0+.8;z<z1-.5;z+=.65)box('iron',0,.07,z,.38,.02,.05,ic);
  /* low steep turf A-frame roof springing directly off the 1.42 m earth berms along z, with flush drystone gables and hold-down cables */
  W(0,0,zm,0,()=>{const ea=ph+.24,eb=pw+.28,T=fgTurfRoof(ea,eb,yb-.04,rid-yb,'gable','z',C,{look});
   const nr=Math.max(3,Math.round(2*ph/2.1));
   for(let i=0;i<=nr;i++){const z=-ph+.25+i*(2*ph-.5)/nr;for(const sx of [-1,1])pole('pole',[sx*(pw-.15),yb-.06,z],[0,rid-.34,z],.06,pc,5);}
   pole('pole',[0,rid-.32,-ea+.15],[0,rid-.32,ea-.15],.095,pc,6);
   fgGableSlab('stone','z',-ph,0.6,-pw-.05,pw+.05,yb-.04,bx=>T.Y(-ph-.3,bx)-.08,bx=>T.Y(-ph+.3,bx)-.08,col,4);
   fgGableSlab('stone','z',ph,0.65,-pw-.05,pw+.05,Math.max(yb-.04,2.14),bx=>T.Y(ph-.32,bx)-.08,bx=>T.Y(ph+.32,bx)-.08,col,4);
   for(const sx of [-1,1])fgGableSlab('stone','z',ph,0.65,sx>.0?.66:-pw-.05,sx>.0?pw+.05:-.66,yb-.04,bx=>Math.min(2.18,T.Y(ph-.32,bx)-.08),bx=>Math.min(2.18,T.Y(ph+.32,bx)-.08),col,2);
   /* gale hold-down cables lashed over the turf ridge and anchored to boulder deadmen on the berms */
   for(const z of [-ph*.55,0,ph*.55]){const P0=[];for(let k=0;k<=8;k++){const x=-eb+2*eb*k/8;P0.push([x,T.Y(z,x)+.04,z]);}
    cord('cable',P0,.016,P('cable'));for(const sx of [-1,1])ellip('stone',sx*(eb+.18),yb-.08,z,.22,.16,.19,sc,0,6);}
   /* rear timber frost-vent chimney stack with rusted salvage-plate snow hood */
   const vz=-ph+.85,vy=T.Y(vz,0);box('wood',0,vy-.25,vz,.46,.58,.46,wc);
   fgSlab('rust',[-.36,vy+.36,vz+.34],[.36,vy+.36,vz+.34],[-.36,vy+.28,vz-.34],.035,fgCol('rust',C));});
  /* stone-revetted entrance trench at +z, sloped storm-cellar bulkhead flaps propped open, timber ice-slide and hoist beam */
  for(const sx of [-1,1]){const xw=sx*1.38;
   fgGableSlab('stone','x',xw,.52,z1+.15,hd-.18,.04,bz=>yb-(bz-z1)/(hd-z1)*.82,bz=>yb-(bz-z1)/(hd-z1)*.82,col,3);
   /* open sloped storm-cellar plank flap resting against the trench cheek on an iron stay */
   W(sx*1.08,yb-.22,(z1+hd-.45)/2,0,()=>{box('wood',0,0,0,.82,.05,hd-z1-.75,wc,0,-sx*1.08);
    for(const dz of [-.55,.55])box('iron',0,.03,dz,.78,.025,.06,ic,0,-sx*1.08);});
   pole('pole',[sx*1.28,.06,z1+.35],[sx*1.28,2.62,z1+.35],.085,pc,6);}
  pole('pole',[-1.42,2.58,z1+.35],[1.42,2.58,z1+.35],.09,pc,6);
  beam('pole',[0,2.58,z1-.15],[0,2.58,z1+1.15],.075,pc,6);ring('iron',0,2.44,z1+.98,.11,.022,ic,0,0,0,8);
  cord('rope',[[0,2.42,z1+.98],[0,1.25,z1+.98]],.014,P('rope'));
  box('wood',-.52,.12,(z1+hd-.28)/2,.58,.06,hd-z1-.45,wc,0,.04);
  for(const sx of [-.26,.26])box('wood',-.52+sx,.17,(z1+hd-.28)/2,.05,.09,hd-z1-.45,wc);
  fgDoor(0,z1,1.22,1.84,C,{th:.65,name:'the dugout ice-house door'});
  fgSign('DUG ICE',0,2.34,z1+.36,0,C,{ch:.13,kind:'plate'});
  /* interior: slatted timber ice-crib bins packed with three tiers of pond & lake ice in sawdust, plus cold-larder hooks & tools */
  let nb=0;const cz0=z0+.55,cz1=z1-1.65;
  for(const sx of [-1,1]){const bx=sx*(pw*.52);
   for(let z=cz0;z<=cz1+.05;z+=1.35)pole('pole',[sx*.58,.06,z],[sx*.58,1.95,z],.045,pc,5);
   for(const y of [.45,.98,1.52])box('wood',sx*.58,y,(cz0+cz1)/2,.04,.1,cz1-cz0,wc);
   for(let tier=0;tier<3;tier++){const y=.08+tier*.58;
    for(let z=cz0+.38;z<=cz1-.32;z+=.78){box('ice',bx,y,z,pw-.88,.5,.68,P('ice'),rr(-.025,.025));nb++;
     box('straw',bx,y+.5,z,pw-.84,.055,.72,P('sawdust'));
     if(tier===2)box('straw',bx,y+.55,z,pw-.82,.07,.74,P('snow'));}}}
  /* cold-vestibule crossbeam with hung meat/butter crocks, ice saw, tongs and lobelia cold-lamp */
  pole('pole',[-pw+.2,1.88,z1-.95],[pw-.2,1.88,z1-.95],.05,pc,5);
  for(const x of [-1.45,-.85,.95,1.5]){cord('cord',[[x,1.88,z1-.95],[x,1.52,z1-.95]],.009,P('rope'));
   ellip('hide',x,1.34,z1-.95,.12,.22,.1,hc(0x6e4e36),0,5);}
  fgFurn('generic_crock',pw-.55,.06,z1-.78,0);fgFurn('generic_barrel',-pw+.6,.06,z1-.82,0);
  box('iron',-.92,.45,z1-.42,.03,1.15,.18,ic,0,.1);
  sph('glow',.88,1.72,z1-.42,.04,hc(0x7ab4ff),1.2,6);haloAt(.88,1.72,z1-.42,0x7ab4ff,false);
  fgNote('blocks',nb);}});
