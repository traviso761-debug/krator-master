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
const FG_HALL_FAMS=[{id:'porch',wf:[.85,1],df:[.75,.82],hf:[.85,1],add:['porch'],pitch:[38,46],stony:1.3},
 {id:'bow',plan:'bow',roof:'bow',wf:[.88,1],df:[.88,1],hf:[.82,1],pitch:[36,44],stony:1.4,low:1.2},
 {id:'halfhip',roof:'halfhip',wf:[.82,1],df:[.85,1],hf:[.78,.92],pitch:[32,40],low:2}];
defBuilding({key:'fg-meethall',name:'The meeting hall',seed:9111,cut:true,w:18,d:10,h:7,budget:70000,
 tags:{types:['civic'],wealth:'middle',style:'drystone',role:'civic'},
 note:'the one large room: benches down both walls, the fire down the middle; the Fowlers\' rope wall (a peg for each family, its coil hung on it, an empty peg where a family lost its rope) or the Ice-cutters\' tally board on the back wall, by a variant the station passes (fowlers or icecut). Families: a porched hall, a bow-sided hall, a low half-hipped hall',
 build(o){const C=fgCx(o),B=TG.fg.BOX['fg-meethall'],variant=o.variant==='icecut'?'icecut':'fowlers';fgSet('variant',variant);
  fgHouse(B,C,FG_HALL_FAMS,S=>{const pc=fgCol('pole',C),fz=(S.z0+S.z1)/2,kc=fgCol('stoneD',C),L=Math.min(10.4,S.x1-S.x0-2.4);
   /* the hall's words over its door, a plate shield with the hall's mark, horns over the door (a few, kept: the villages are peaceful) */
   const zs=S.fam==='porch'?S.hd+1.73:S.hd+.02,ys=S.fam==='porch'?S.wh-1.2:Math.min(S.wh-.75,2.5);
   fgSign(variant==='icecut'?'THE COLD IS OWED':'A ROPE IS A VOTE',S.doors[0][0],ys,zs,0,C,{ch:.18});
   W(S.doors[0][0]+(S.doors[0][0]>0?-2.2:2.2),1.5,S.hd+.03,0,()=>{WX(0,0,0,0,PI/2,0,()=>cyl('plate',0,0,0,.42,.05,fgCol('plate',C),12));fgMark(C.v,0,0,.06,0,.4,0xa8321e);});
   if(!C.worn&&S.fam!=='porch')W(S.doors[0][0],S.doors[0][2]+.55,S.hd+.08,0,()=>{for(const s of [-1,1])beam('horn',[s*.15,0,0],[s*.7,.45,.12],.07,P('horn'),true,5,.015);ellip('skull',0,.05,.05,.2,.16,.2,P('skull'),0,6);});
   if(S.fam==='porch')fgFurn('fellgang_common_brazier',S.doors[0][0]-2.4,null,S.hd+.9,0);
   /* the fire down the middle: a kerbed trench, three fires under three hoods */
   for(const s of [-1,1])box('stone',0,0,fz+s*.55,L,.22,.2,kc);for(const s of [-1,1])box('stone',s*L/2,0,fz,.2,.22,1.3,kc);
   for(const x of [-L/3,0,L/3]){fgHearth(x,fz,C,{r:.4});const y=S.Y(x,0);fgHood(x,y-.1,Math.min(B.h+.35,y+.3),C);}
   /* the benches down both long walls (the catalog's), the rulebook and the head's stool at the far end, the drum */
   const bd=fgDim('fellgang_common_bench'),bw=bd.w+.25;for(let x=S.x0+.8;x+bw<S.x1-.4;x+=bw){fgFurnBack('fellgang_common_bench',x+bw/2,S.z0,{v:(x*3|0)&1});
    if(Math.abs(x+bw/2-S.doors[0][0])>1.6)fgFurn('fellgang_common_bench',x+bw/2,null,S.z1-bd.d/2-.1,PI,{v:1});}
   fgFurnSide('fellgang_court_rulebook',1,S.x1,fz);fgFurnSide('fellgang_poor_stool',1,S.x1,fz+1.1);fgFurnSide('fellgang_common_war_drum',-1,S.x0,fz+1.2);
   const zb=S.z0+.01,iw=S.x1-S.x0-1;
   if(variant==='fowlers'){
    /* THE ROPE WALL: a peg per family in two rows over the back benches, the coil on it in the family's colour, its mark over it */
    const n=Math.max(1,o.pegs==null?21:o.pegs|0),lost=o.lost?o.lost.slice():[Math.floor(fgU(C,51)*n)],per=Math.ceil(n/2),sp=Math.min(1.2,iw/per),wc=fgCol('wood',C);
    box('wood',0,1.8,zb+.02,per*sp+.3,.08,.06,wc);box('wood',0,2.75,zb+.02,per*sp+.3,.08,.06,wc);
    for(let i=0;i<n;i++){const row=i<per?0:1,k=row?i-per:i,x=(k-(per-1)/2)*sp,y=row?2.8:1.85,col=fgMarkCol(i);
     pole('pole',[x,y+.15,zb+.03],[x,y+.2,zb+.33],.035,pc,4);fgNote('pegs');fgMark(i,x,y+.5,zb+.05,0,.2,col);
     if(lost.indexOf(i)<0){const rc=hc(col).clone().lerp(hc(0x8a7656),.55);ring('rope',x,y-.07,zb+.2,.2,.045,rc,0,PI/2,0,10);fgNote('coils');}
     else fgNote('empty');}
   } else {
    /* THE TALLY BOARD: a long board of slats, each notched for the blocks cut and carried; chalk at its end for this season */
    const n=Math.max(1,o.slats==null?36:o.slats|0),L2=Math.min(iw-1,n*.24),wc=fgCol('wood',C);box('wood',0,1.4,zb+.03,L2+.4,1.7,.06,wc);
    for(let i=0;i<n;i++){const x=-L2/2+(i+.5)*L2/n,nn=3+Math.floor(fgU(C,600+i)*7);box('wood',x,1.5,zb+.08,.11,1.5,.04,wc);fgNote('slats');
     for(let k=0;k<nn;k++){quad('plain',x+.02,1.61+k*.15,zb+.105,.07,.025,P('dark'));fgNote('notches');}}
    fgText('OWED',L2/2+.5,2.45,zb+.04,0,.16,P('white'));}},
  {doorW:1.9,doorH:2.2,noHood:true,doors:(S0)=>[[(fgU(C,52)-.5)*Math.max(0,S0.w-8),1.9,Math.min(2.2,S0.wh-.3)]]});}});
defBuilding({key:'fg-cairnhall',name:'The cairn house',seed:9112,cut:true,w:7,d:7,h:6,budget:80000,
 tags:{types:['religious','funerary'],style:'drystone',role:'religious',job:'worship'},
 note:'a corbelled drystone round house; inside, the dead\'s names scratched on slate tallies hung in rows (no carving); the old rules said aloud from its step',
 build(o){const C=fgCx(o),fr=fgLerp([.72,1],fgU(C,21)),r=3.5*fr,t=.8,wh=2.6*fgLerp([.85,1],fgU(C,22)),Ht=6*Math.max(.78,fgLerp([.78,1],fgU(C,23))),g=.2/fr,col=fgCol('stone',C),a0=PI/2+g,a1=PI/2-g+TAU;fgSet('fill',+fr.toFixed(2));
  cyl('stone',0,C.lo,0,r+.02,.06-C.lo,col,22);
  sector('stone',0,0,r-t,r,a0,a1,0,wh,col);box('stoneD',0,1.85,r-t/2,1.5,.3,t+.04,fgCol('stoneD',C));
  sector('stone',0,0,r-t,r,PI/2-g-.02,PI/2+g+.02,2.15,wh,col,3);
  /* the corbels: each course steps in until a capstone closes the dome; turf over the crown */
  const nc=8,cs=(Ht-.6-wh)/nc;for(let k=0;k<nc;k++){const y0=wh+k*cs,ro=r*(1-Math.pow((k+1)/nc,1.5)*.82),ri=Math.max(.2,ro-.75);sector('stone',0,0,ri,ro,0,TAU,y0,y0+cs+.01,k%2?col:fgCol('stone',C),18);}
  cyl('stoneD',0,wh+nc*cs,0,.75,.22,fgCol('stoneD',C),12);
  lathe('turf',0,0,[[r*.72,wh+(Ht-wh)*.35],[r*.55,wh+(Ht-wh)*.62],[r*.3,wh+(Ht-wh)*.85],[0,Ht]],16,fgTurfCol(C,fgTurfLook(C)));
  /* the step the old rules are said from, and the plate door */
  box('stoneD',0,0,r+.02,1.9,.26,.42,fgCol('stoneD',C));fgDoor(0,r-t/2,.95,1.75,C,{th:t,name:'the cairn house door'});
  /* inside: a stone bench round the wall, and the slate tallies on cords in three rows (a name scratched on each) */
  const ri=r-t-.02;sector('stone',0,0,ri-.42,ri,a0+.15,a1-.15,0,.45,fgCol('stoneD',C));
  for(const y of [1.15,1.6,2.05]){const P0=[],arc=(a1-a0-.4)*ri,n=Math.floor(arc/.24);
   for(let k=0;k<=12;k++){const a=a0+.2+(a1-a0-.4)*k/12;P0.push([Math.cos(a)*(ri-.03),y+.12,Math.sin(a)*(ri-.03)]);}cord('cord',P0,.008,P('rope'));
   for(let k=0;k<n;k++){const a=a0+.2+(a1-a0-.4)*(k+.5)/n,x=Math.cos(a)*(ri-.05),z=Math.sin(a)*(ri-.05),ry=Math.atan2(-x,-z);
    box('stoneD',x,y-.08,z,.1,.16,.015,P('slate'),ry,rr(-.08,.08));W(x,y,z,ry,()=>quad('plain',0,-.02,.009,.06,.008,P('white')));fgNote('tallies');}}
  fgFurn('fellgang_poor_tallow_lamp',-1.6,.45,-1.9,0);fgFurn('fellgang_poor_tallow_lamp',1.6,.45,-1.9,0,{v:1});
  if(C.worn)fgRubble(1.4,r-.15,3,C);}});
