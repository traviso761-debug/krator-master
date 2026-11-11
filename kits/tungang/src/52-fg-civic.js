// prefix: fg
// ================================================================= THE MEETING HALL AND THE CAIRN HOUSE (PLAN.md sections 1.3, 3.3.1)
// fg-meethall: the village's one large room (the lapsed union's form): benches down both long walls, the fire down the middle,
// a scrap-plate porch, and by the variant the station passes either the Fowlers' ROPE WALL (a peg for each family, its coil
// hung on it, its mark painted over it, an empty peg where a family lost its rope: "a rope is a vote") or the Ice-cutters'
// TALLY BOARD (a long board of notched slats, a notch for each block cut and carried: "the Cold is owed"; the Book's habit
// without the Book). o.variant 'fowlers' | 'icecut'; o.pegs the families (default 21, the Fowlers' station); o.lost the
// empty pegs (default one, by the hall's seed); o.slats the tally's slats (default 36).
// fg-cairnhall: a corbelled drystone round house; inside the dead's names scratched on slate tallies hung in rows (no carving:
// PLAN.md section 11); the old rules said aloud from its step.
defBuilding({key:'fg-meethall',name:'The meeting hall',seed:9111,cut:true,w:18,d:10,h:7,budget:150000,
 tags:{types:['civic'],wealth:'middle',style:'drystone',role:'civic'},
 note:'the one large room: benches down both walls, the fire down the middle; the Fowlers\' rope wall (a peg for each family, its coil hung on it, an empty peg where a family lost its rope) or the Ice-cutters\' tally board on the back wall, by a variant the station passes (fowlers or icecut); a scrap-plate porch',
 build(o){const C=fgCx(o),B=TG.fg.BOX['fg-meethall'],sb=1.8,S=fgShell(B,C,{setback:sb,doors:[[0,1.9,2.2]]});
  const variant=o.variant==='icecut'?'icecut':'fowlers';fgSet('variant',variant);
  /* the porch: two posts, the eave beam, plate screens lashed to the posts at its ends, a brazier, the hall's slogan */
  const pc=fgCol('pole',C),zp=S.hd-.22;for(const s of [-1,1]){pole('pole',[s*3.2,.06,zp],[s*3.2,S.wh,zp],.15,pc,8);
   W(s*(S.hw-1.6),0,S.hd-sb/2,PI/2,()=>{box('rust',0,.3,0,sb-.3,2.1,.05,fgCol('rust',C));for(const t of [-.5,.5])fgLash([t*(sb-.4),2.45,-.03],[t*(sb-.4),.25,.05]);});}
  pole('pole',[-S.hw+.4,S.wh-.08,zp],[S.hw-.4,S.wh-.08,zp],.14,pc,8);box('stoneD',0,.04,S.hd-sb/2,S.hw*2-1.6,.04,sb-.1,fgCol('stoneD',C));
  fgSign(variant==='icecut'?'THE COLD IS OWED':'A ROPE IS A VOTE',0,S.wh-.72,zp+.17,0,C,{ch:.2});
  fgFurn('fellgang_common_brazier',-4.6,null,S.hd-.9,0);
  /* trophies on the hall: a horn rack over the porch, a shield of white plate on a post (a few, kept: the villages are peaceful) */
  if(!C.worn)W(0,S.wh+.25,zp,0,()=>{for(const s of [-1,1])beam('horn',[s*.15,0,0],[s*.75,.5,.15],.08,P('horn'),true,6,.015);ellip('skull',0,.05,.05,.2,.16,.22,P('skull'),0,8);});
  W(3.2,1.6,zp+.17,0,()=>{WX(0,0,0,0,PI/2,0,()=>cyl('plate',0,0,0,.42,.05,fgCol('plate',C),14));fgMark(C.v,0,0,.06,0,.4,0xa8321e);});
  /* the fire down the middle: a kerbed trench with three fires under three hoods */
  const fz=(S.z0+S.z1)/2,kc=fgCol('stoneD',C);for(const s of [-1,1])box('stone',0,0,fz+s*.55,10.4,.22,.2,kc);for(const s of [-1,1])box('stone',s*5.3,0,fz,.2,.22,1.3,kc);
  for(const x of [-3.4,0,3.4]){fgHearth(x,fz,C,{r:.4});fgHood(x,S.rid,S.rid+.47,C);}
  /* the benches down both long walls (the catalog's), the steward's... no: the head's seat at the far end, the rulebook */
  const bw=fgDim('fellgang_common_bench').w+.25;for(let x=S.x0+1;x+bw/2<S.x1-.6;x+=bw){fgFurnBack('fellgang_common_bench',x+bw/2,S.z0,{v:(x*3|0)&1});
   if(Math.abs(x+bw/2)>1.6)fgFurn('fellgang_common_bench',x+bw/2,null,S.z1-fgDim('fellgang_common_bench').d/2-.1,PI,{v:1});}
  fgFurnSide('fellgang_court_rulebook',1,S.x1,fz);fgFurnSide('fellgang_poor_stool',1,S.x1,fz+1.1);
  fgFurnSide('fellgang_common_war_drum',-1,S.x0,fz+1.2);fgFurnBack('fellgang_poor_tallow_lamp',S.x0+.5,S.z0);fgFurnBack('fellgang_poor_tallow_lamp',S.x1-.5,S.z0,{v:1});
  const zb=S.z0+.01;
  if(variant==='fowlers'){
   /* THE ROPE WALL: a peg per family in two rows over the back benches, the coil on it in the family's colour, its mark over it */
   const n=Math.max(1,o.pegs==null?21:o.pegs|0),lost=o.lost?o.lost.slice():[Math.floor(rng()*n)],per=Math.ceil(n/2),sp=Math.min(1.2,13/per),wc=fgCol('wood',C);
   box('wood',0,1.8,zb+.02,per*sp+.5,.08,.06,wc);box('wood',0,2.75,zb+.02,per*sp+.5,.08,.06,wc);
   for(let i=0;i<n;i++){const row=i<per?0:1,k=row?i-per:i,x=(k-(per-1)/2)*sp,y=row?2.8:1.85,col=fgMarkCol(i);
    pole('pole',[x,y+.15,zb+.03],[x,y+.2,zb+.33],.035,pc,5);fgNote('pegs');fgMark(i,x,y+.5,zb+.05,0,.2,col);
    if(lost.indexOf(i)<0){const rc=hc(col).clone().lerp(hc(0x8a7656),.55);ring('rope',x,y-.07,zb+.2,.2,.045,rc,0,PI/2,0,14);cord('rope',[[x+.15,y-.15,zb+.24],[x+.2,y-.55,zb+.26]],.02,rc);fgNote('coils');}
    else fgNote('empty');}
  } else {
   /* THE TALLY BOARD: a long board of slats, each notched for the blocks cut and carried; chalk at the end for this season */
   const n=Math.max(1,o.slats==null?36:o.slats|0),L=Math.min(12,n*.24),wc=fgCol('wood',C);box('wood',0,1.4,zb+.03,L+.4,1.7,.06,wc);
   for(let i=0;i<n;i++){const x=-L/2+(i+.5)*L/n,nn=3+Math.floor(rng()*7);box('wood',x,1.5,zb+.08,.11,1.5,.04,fgCol('wood',C));fgNote('slats');
    for(let k=0;k<nn;k++){box('plain',x+.02,1.6+k*.15,zb+.1,.07,.025,.012,P('dark'));fgNote('notches');}}
   fgText('OWED',L/2+.5,2.45,zb+.04,0,.16,P('white'));}
  /* worn: a bench gone, the fire cold (fgHearth), a plate screen fallen */
  if(C.worn)box('rust',S.hw-1.8,.06,S.hd-.6,1.4,.05,1.2,fgCol('rust',C),.2);}});
defBuilding({key:'fg-cairnhall',name:'The cairn house',seed:9112,cut:true,w:7,d:7,h:6,budget:80000,
 tags:{types:['religious','funerary'],style:'drystone',role:'religious',job:'worship'},
 note:'a corbelled drystone round house; inside, the dead\'s names scratched on slate tallies hung in rows (no carving); the old rules said aloud from its step',
 build(o){const C=fgCx(o),r=3.5,t=.8,wh=2.6,g=.2,col=fgCol('stone',C),a0=PI/2+g,a1=PI/2-g+TAU;
  cyl('stone',0,C.lo,0,r+.02,.06-C.lo,col,22);
  sector('stone',0,0,r-t,r,a0,a1,0,wh,col);box('stoneD',0,1.85,r-t/2,1.5,.3,t+.04,fgCol('stoneD',C));
  sector('stone',0,0,r-t,r,PI/2-g-.02,PI/2+g+.02,2.15,wh,col,3);
  /* the corbels: each course steps in until a capstone closes the dome; turf over the crown */
  const nc=8;for(let k=0;k<nc;k++){const y0=wh+k*.34,ro=r*(1-Math.pow((k+1)/nc,1.5)*.82),ri=Math.max(.2,ro-.75);sector('stone',0,0,ri,ro,0,TAU,y0,y0+.35,k%2?col:fgCol('stone',C),24);}
  cyl('stoneD',0,wh+nc*.34,0,.75,.22,fgCol('stoneD',C),12);
  lathe('turf',0,0,[[r*.72,wh+1.2],[r*.55,wh+2.2],[r*.3,wh+2.95],[0,6]],18,fgCol('turf',C));
  /* the step the old rules are said from, and the plate door */
  box('stoneD',0,0,r+.02,1.9,.26,.42,fgCol('stoneD',C));fgDoor(0,r-t/2,.95,1.75,C,{th:t,name:'the cairn house door'});
  /* inside: a stone bench round the wall, and the slate tallies on cords in three rows (a name scratched on each) */
  const ri=r-t-.02;sector('stone',0,0,ri-.42,ri,a0+.15,a1-.15,0,.45,fgCol('stoneD',C));
  for(const y of [1.15,1.6,2.05]){const P0=[],arc=(a1-a0-.4)*ri,n=Math.floor(arc/.17);
   for(let k=0;k<=12;k++){const a=a0+.2+(a1-a0-.4)*k/12;P0.push([Math.cos(a)*(ri-.03),y+.12,Math.sin(a)*(ri-.03)]);}cord('cord',P0,.008,P('rope'));
   for(let k=0;k<n;k++){const a=a0+.2+(a1-a0-.4)*(k+.5)/n,x=Math.cos(a)*(ri-.05),z=Math.sin(a)*(ri-.05),ry=Math.atan2(-x,-z);
    box('stoneD',x,y-.08,z,.1,.16,.015,P('slate'),ry,rr(-.08,.08));W(x,y,z,ry,()=>box('plain',rr(-.02,.02),-.02,.009,.06,.008,.003,P('white')));fgNote('tallies');}}
  fgFurn('fellgang_poor_tallow_lamp',-1.6,.45,-1.9,0);fgFurn('fellgang_poor_tallow_lamp',1.6,.45,-1.9,0,{v:1});
  if(C.worn)fgRubble(1.4,r-.15,3,C);}});
