// prefix: lk
// ================================================================= THE CAPITAL, IN STONE: the warlord's seat
// The same forms as the village, built all in stone for the capital of the warlord who united the tribes (LORE.md section
// 6.17): the ribs, horns and tusks carved in polished basalt instead of bone, the skins basalt slab instead of hide, the
// walls cyclopean polygonal masonry on polished plinths inlaid with bronze lines, leiwen bands and spiral eyes everywhere
// (the more important the building, the more eyes), nested bronze portals on all of them. The warlord's great hall, a stone
// rib house, stone cells, a stone nest, the Interpreters' college of three twisted towers, and the capital's gate.
// Frame: origin on the ground at the plot centre, +z the front.
const LK_ST='cyclo',LK_PL='stoneP';
/* a polished plinth with bronze inlay lines round its edge and a leiwen band on the front */
function lkPlinth(w,d,h,o){o=o||{};box(LK_PL,0,0,0,w,h,d,P('basaltD'));
 for(const [x,z,ry,L] of [[0,d/2,0,w],[0,-d/2,PI,w],[w/2,0,PI/2,d],[-w/2,0,-PI/2,d]])W(x,h*.6,z,ry,()=>{box('bronzeC',0,0,.02,L-.2,.06,.03,P('verd'));if(o.leiwen&&ry===0)W(0,-h*.45,.03,0,()=>lzLeiwen(Math.min(L-1,o.leiwen),h*.7,{cell:.3,mk:'bronze',back:'lacq',t:.03,proud:.02}));});}
/* eyes along a face: n spiral eyes at height y on the +z face of a room w wide (z at the face), skipping the door's span */
function lkEyes(n,w,y,z,R,skip){for(let i=0;i<n;i++){const x=-w/2+w*(i+.5)/n;if(skip&&Math.abs(x)<skip)continue;lzNoCut(()=>lzEye(x,y,z,0,R,{mk:'bronze'}));}}
/* ---------------------------------------------------------------- the warlord's great hall: a tusk vault in stone */
defBuilding({key:'lk-greathall',name:"Warlord's great hall",seed:7701,caste:'all',cut:true,w:22,d:30,h:15,budget:160000,
 tags:{types:['civic','military'],wealth:'rich',role:'hall'},
 note:'the capital: the tusk vault of the lodge carved in polished basalt, nine pairs of stone tusks over a slab roof, a polished plinth inlaid with bronze, the front gable with seven spiral eyes and a nested bronze portal seven deep; the serpent throne on a dais at the far end',
 build(o){const L=22,Wd=12.5,h=11.5;lzCutFloor(.4);
  W(0,0,0,-PI/2,()=>{lzNoCut(()=>lkPlinth(L+3,Wd+3,.4,{}));
   lzTuskVault(L,Wd,h,9,{r:.42,mk:LK_PL,tuskCol:P('basaltD'),skinMk:'basalt',skinCol:P('basalt'),wallMk:LK_ST,wallCol:P('basalt'),eaveY:2.0,y0:.4,doors:[{z:0,c:6}],eyes:[[0,h*.72],[3.6,h*.5],[-3.6,h*.5],[5.2,h*.26],[-5.2,h*.26],[2.2,h*.3],[-2.2,h*.3]]});
   /* the dais and the throne at the far (-x) end, the hearth before it, divans along the walls */
   box(LK_PL,-L/2+2.2,.4,0,3.4,.5,6,P('basaltD'));W(-L/2+2.2,.9,0,PI/2,()=>lzLeiwen(5.4,.42,{cell:.26,mk:'bronze',back:false}));
   FURNISH('lizardmen_court_throne',-L/2+2.2,.9,0,PI/2);FURNISH('lizardmen_court_hearth',-L/2+6.5,.4,0,0);FURNISH('lizardmen_court_carpet',-2,.4,0,PI/2);
   for(const s of [-1,1]){for(let i=0;i<3;i++)FURNISH('lizardmen_court_divan',-L/2+8+i*4.2,.4,s*(Wd/2-1.1),s>0?PI:0);FURNISH('lizardmen_court_candelabra',-L/2+4.4,.4,s*2.4,0);}
   for(const s of [-1,1])FURNISH('lizardmen_court_statue',-L/2+1.2,.4,s*3.6,PI/2);FURNISH_HANG('lizardmen_court_hanging',0,h*.6,0,0);FURNISH_HANG('lizardmen_court_hanging',-6,h*.55,0,0);FURNISH_HANG('lizardmen_court_hanging',6,h*.55,0,0);});}});
/* ---------------------------------------------------------------- a stone rib house: the long house in basalt */
defBuilding({key:'lk-longhouse',name:'Stone rib house',seed:7702,caste:3,cut:true,w:22,d:11,h:10,budget:110000,
 tags:{types:['dwelling-multi'],wealth:'rich',role:'dwelling'},
 note:'the Drovers\' rib house for the capital: eleven ribs of polished basalt over a roof of basalt slab, polygonal walls leaning in and out on a bronze-inlaid plinth, a leiwen band under the eave, five spiral eyes, the Drovers\' door with a bronze frame',
 build(o){const L=18,Wd=7,wh=2.6,rh=5.2;lzCutFloor(.4);lzNoCut(()=>lkPlinth(L+2,Wd+2,.4,{leiwen:6}));
  lzBatterRoom(L,Wd,.4,wh,LK_ST,P('basalt'),{lean:{front:.1,back:-.06,left:-.04,right:.09},front:[lzDoor(3,L/2),lzVent(3,2.5,wh*.6),lzVent(3,L-2.5,wh*.6)],back:[lzVent(3,L*.3,wh*.6),lzVent(3,L*.7,wh*.6)]});
  lzRibRoof(L,Wd,wh+.45,wh+.4+rh,11,{mk:'basalt',col:P('basaltD'),over:.7,ribR:.15,ribMk:LK_PL,ribCol:P('basaltC'),past:.2,ext:.6,endMk:LK_ST,endCol:P('basalt'),leanEnds:{left:-.04,right:.09},y0:.4});
  W(0,.4+wh-.5,Wd/2-.1*(wh-.5)+.05,0,()=>lzLeiwen(L*.8,.42,{cell:.26,mk:'bronze',back:'lacq'}));
  lkEyes(5,L,.4+wh*.55,Wd/2-.1*wh*.55+.06,.3,1.2);
  lzNoCut(()=>lzPortal(0,.4,Wd/2+.08,0,lzDoorH(3),{mk:'bronze'}));lzThreshold(0,Wd/2+.25,0,1.4);
  lzFurnRoom(L-.8,Wd-.6,.4,'court',{beds:3,ceil:rh*.65,extra:[['generic_trade_hayrack',-L/2+1.5,1.2,PI/2],['lizardmen_court_cabinet',L/2-1.2,1.2,-PI/2]]});}});
/* ---------------------------------------------------------------- stone cells: the warren in polygonal masonry */
defBuilding({key:'lk-warren',name:'Stone cell-warren',seed:7703,caste:1,cut:true,w:19,d:17,h:8.6,budget:110000,
 tags:{types:['dwelling-multi'],wealth:'rich',role:'dwelling'},
 note:'the Tenders\' cells for the capital: seven domes of fitted polygonal basalt in a whorl, buttressed by horns carved in polished basalt, bronze eyes on the crowns, the slit door framed in bronze; the largest cell opens',
 build(o){const rs=[1.0,1.2,1.5,1.85,2.3,2.85,3.5];let px=0,pz=0;const cells=[];
  for(let i=0;i<rs.length;i++){const a=i*1.83+.6;if(i){px+=Math.cos(a)*(rs[i-1]+rs[i])*.9;pz+=Math.sin(a)*(rs[i-1]+rs[i])*.9;}cells.push([px,pz,rs[i]]);}
  const cx=cells.reduce((s,c)=>s+c[0],0)/cells.length,cz=cells.reduce((s,c)=>s+c[1],0)/cells.length;const big=cells[cells.length-1];const shz=-(big[1]-cz)+2.4;
  lzCutFloor(0);lzNoCut(()=>box(LK_PL,0,0,shz-2,18,.2,16,P('basaltD')));
  const cell=(x,z,r,o2)=>{const h=r*1.35;W(x,.2,z,0,()=>{lzDome(0,0,[[r,0],[r*1.03,h*.28],[r*.92,h*.58],[r*.6,h*.86],[r*.18,h*1.12],[r*.03,h*1.32],[0,h*1.34]],{mk:LK_ST,col:P('basalt'),seg:14,door:o2.door});
   const n=o2.n||5;for(let i=0;i<n;i++){const a=i*TAU/n+(o2.a0||0),bx=Math.cos(a)*r*1.05,bz=Math.sin(a)*r*1.05;if(o2.door&&Math.abs(((a-PI/2)%TAU+TAU)%TAU)<.5)continue;lzHorn(bx,0,bz,Math.atan2(-bx,-bz),r*1.6,r*.24,{curl:.5,lean:-.25,mk:LK_PL,col:P('basaltD'),nt:8,ns:6});}
   lzEye(0,h*1.0,r*.62,0,r*.16,{mk:'bronze'});
   if(o2.door){const dh=o2.door,dw=dh*.62;lzPortal(0,0,r*1.02,0,dh,{mk:'bronze'});lzThreshold(0,r+.1,0,dw);}});};
  for(let i=0;i<cells.length;i++){const c=cells[i],x=c[0]-cx,z=c[1]-cz+shz,last=i===cells.length-1;
   if(last){cell(x,z,c[2],{n:7,a0:.3,door:lzDoorH(1)});lzFurnRoom(c[2]*1.1,c[2]*1.1,.2,'court',{x,z,beds:3,ceil:c[2]*1.1,extra:[['lizardmen_court_desk',x>0?-1:1,.5,PI/2]]});}
   else lzNoCut(()=>cell(x,z,c[2],{n:i%2?5:7,a0:i*.7}));
   if(i){const p=cells[i-1];const mx=(p[0]+c[0])/2-cx,mz=(p[1]+c[1])/2-cz+shz;lzNoCut(()=>ellip(LK_ST,mx,.2,mz,Math.min(p[2],c[2])*.9,Math.min(p[2],c[2])*.5,Math.min(p[2],c[2])*.9,P('basalt'),0,10));}}}});
/* ---------------------------------------------------------------- the stone nest: the capital's nursery */
defBuilding({key:'lk-nest',name:'Stone nest hall',seed:7704,caste:'all',cut:true,w:30,d:27,h:9,budget:150000,
 tags:{types:['religious','civic'],wealth:'rich',role:'nursery'},
 note:'the nest hall for the capital: the Fermat spiral in fitted basalt, five chambers an arm, stone horns, bronze eyes on every crown and the Coil\'s great eye on the centre, nested bronze portals at both mouths',
 build(o){const a=4.4,N=5;lzCutFloor(.2);lzNoCut(()=>box(LK_PL,0,0,0,29,.2,26,P('basaltD')));
  const arm=(sg)=>{const pts=[];for(let k=N;k>=1;k--){const th=k*.86+.9,r=a*Math.sqrt(th)*sg;pts.push([Math.cos(th)*r,Math.sin(th)*r,1.5+k*.2]);}return pts;};
  const A=arm(1),B=arm(-1);
  const dome=(x,z,r,o2)=>{const h=r*1.1;W(x,.2,z,o2.ry||0,()=>{lzDome(0,0,[[r*.92,0],[r*1.06,h*.3],[r*1.0,h*.6],[r*.7,h*.86],[r*.3,h*1.04],[0,h*1.1]],{mk:LK_ST,col:P('basalt'),seg:16,door:o2.door});
   const n=o2.n||5;for(let i=0;i<n;i++){const an=i*TAU/n+(o2.a0||0),bx=Math.cos(an)*r,bz=Math.sin(an)*r;if(o2.door&&Math.abs(((an-PI/2)%TAU+TAU)%TAU)<.6)continue;lzHorn(bx,0,bz,Math.atan2(-bx,-bz),r*1.1,r*.14,{curl:.45,lean:-.35,mk:LK_PL,col:P('basaltD'),nt:7,ns:6});}
   lzEye(0,h*.95,r*.35,0,o2.big?r*.22:r*.13,{mk:'bronze',glow:!!o2.big});});};
  dome(0,0,4.6,{n:9,big:true});
  for(const [pts,sg] of [[A,1],[B,-1]]){for(let i=0;i<pts.length;i++){const p=pts[i],mouth=i===0;dome(p[0],p[1],p[2],{n:i%2?5:7,a0:i*.9,door:mouth?lzDoorH(6):0,ry:mouth?Math.atan2(p[0],p[1]):0});
    const q=i<pts.length-1?pts[i+1]:[0,0,4.6];const mx=(p[0]+q[0])/2,mz=(p[1]+q[1])/2,rr0=Math.min(p[2],q[2])*.85;lzNoCut(()=>ellip(LK_ST,mx,.2,mz,rr0,rr0*.55,rr0,P('basalt'),0,10));}
   const m=pts[0],ang=Math.atan2(m[0],m[1]),dh=lzDoorH(6),dw=dh*.62,mx=m[0]+Math.sin(ang)*m[2]*.9,mz=m[1]+Math.cos(ang)*m[2]*.9;
   lzNoCut(()=>{W(mx,.2,mz,ang,()=>{lzPortal(0,0,.1,0,dh,{mk:'bronze',eye:sg>0});box('basalt',0,0,.5,dw+.6,.16,.7,P('basaltD'));});});}
  for(let i=1;i<A.length;i++){const p=A[i];FURNISH('lizardmen_court_bed',p[0]*.98,.2,p[1]*.98,Math.atan2(-p[0],-p[1]));}
  for(let i=0;i<7;i++){const an=i*TAU/7,r=i?1.9:0;FURNISH('lizardmen_court_egg_cradle',Math.cos(an)*r,.2,Math.sin(an)*r,-an);}
  FURNISH('lizardmen_court_hearth',0,.2,-3.0,0);FURNISH_HANG('lizardmen_court_hanging',0,4.4,0,0);
  for(let i=1;i<B.length;i++){const p=B[i];FURNISH('lizardmen_court_carpet',p[0]*.95,.2,p[1]*.95,0);}}});
/* ---------------------------------------------------------------- the Interpreters' college: three twisted towers */
defBuilding({key:'lk-college',name:"Interpreters' college",seed:7705,caste:5,cut:true,w:24,d:16,h:26,budget:150000,
 tags:{types:['civic','religious'],wealth:'rich',role:'hall'},
 note:'three twisted towers of nine, eleven and thirteen courses on one polished plinth, joined by a battered wall with the seers\' hall behind it; spiral eyes climb every tower, a crown of horns on each, the Interpreters\' 3.5 m door with nested bronze frames',
 build(o){lzCutFloor(.4);lzNoCut(()=>lkPlinth(23,15,.4,{leiwen:8}));
  const dh=lzDoorH(5),dw=dh*.62;
  /* the hall between the towers: a battered room with the door, a slab roof */
  const T=lzBatterRoom(14,7,.4,5.2,LK_ST,P('basalt'),{lean:{front:.08,back:-.04,left:.06,right:.06},front:[{s:7,w:dw,h:dh,door:true}]});lzSlab(T.T,5.6,.4,'basalt',P('basaltD'),.25);
  lzNoCut(()=>lzPortal(0,.4,3.6,0,dh,{mk:'bronze',eye:true}));lzThreshold(0,3.8,0,dw);
  for(const [x,z,n,h,w0,w1] of [[-8.6,-2,9,16,5.2,3.4],[8.6,-2,11,20,5.6,3.6],[0,-5.5,13,24,6,3.8]]){W(x,.4,z,0,()=>{
   lzTwist(0,0,h,n,w0,w1,.07,{mk:LK_ST,col:P('basalt'),each:(i,y,w,ry)=>{if(i%2===1){const k=(i>>1)%2?-1:1;W(0,y+h/n*.5,0,ry,()=>lzEye(k*w*.5+.03*k,0,0,k*PI/2,w*.17,{mk:'bronze'}));}}});
   for(let i=0;i<7;i++){const a=i*TAU/7;lzHorn(Math.cos(a)*w1*.42,h,Math.sin(a)*w1*.42,Math.atan2(Math.cos(a),Math.sin(a)),2.4,.13,{curl:.5,lean:.35,mk:LK_PL,col:P('basaltD')});}});}
  lzFurnRoom(13,6.2,.4,'court',{beds:0,noHearth:true,ceil:5,extra:[['lizardmen_court_desk',-4,-1.5,0],['lizardmen_court_desk',4,-1.5,0],['lizardmen_court_scroll',-6,.5,PI/2],['lizardmen_court_scroll',6,.5,-PI/2],['lizardmen_court_divan',0,-2,0],['lizardmen_court_candelabra',-2,1.6,0],['lizardmen_court_candelabra',2,1.6,0]]});}});
/* ---------------------------------------------------------------- the capital's gate, its walls and its watchtowers */
/* a run of the capital's wall along x: cyclopean masonry leaning in on the outer face (+z) and out on the inner, a walk
   behind a parapet of thirteen stone horns (odd), a bronze line along the walk's edge. L long, H to the walk */
function lkWallRun(L, H, o){o=o||{};const t=o.t||3.2;
 const T=lzBatterRoom(L,t,0,H,LK_ST,P('basalt'),{lean:{front:.09,back:-.05,left:0,right:0},inner:false});
 lzSlab(T.T,H,.4,'basalt',P('basaltD'),.05);
 /* the parapet on the outer edge: a low leaning wall, and the horns on it */
 const zf=T.zf+.05;lzWall([-L/2,zf],[L/2,zf],[-L/2,zf-.12],[L/2,zf-.12],H+.4,1.3,LK_ST,P('basalt'),[],{});
 for(const x of lzSpan(-L/2+.8,L/2-.8,o.n||13))lzHorn(x,H+1.7,zf-.3,0,1.6,.14,{curl:.55,lean:.25,mk:LK_PL,col:P('basaltD'),nt:7,ns:6});
 box('bronzeC',0,H+.42,T.zb+.3,L-.4,.05,.06,P('verd'));
 if(o.leiwen)W(0,H*.55,zf+.1*(H*.55)*0+ (T.zf-(T.zf-(-t/2))*0)+.0,0,()=>{});
 return T;}
defBuilding({key:'lk-gate',name:'Capital gate',seed:7706,caste:'all',cut:false,w:22,d:12,h:17,budget:110000,
 tags:{types:['military','infrastructure'],wealth:'rich',role:'gate'},
 note:'a gatehouse of polygonal basalt between two battered pylons: one triangular passage sized for the Bulwarks (6 m high, 3.7 m wide) through a solid block, nested bronze frames seven deep at both mouths, a great spiral eye over the way, two stone horns crossing above; glyph spirals and leiwen bands on the pylons; the wall runs meet its pylons',
 build(o){const H=6.0,dw=3.7,PB=.3;lzNoCut(()=>lkPlinth(21,11,PB,{}));
  /* the pylons */
  for(const s of [-1,1])W(s*7.4,PB,0,0,()=>{const T=lzBatterRoom(6.2,8,0,13,LK_ST,P('basalt'),{lean:{front:.1,back:.1,left:.08,right:.08},inner:false});lzSlab(T.T,13,.5,'basalt',P('basaltD'),.2);
   W(0,.6,4-.1*.6+.04,0,()=>lzGlyphSpiral(4.2,9.5,{mk:'bronze',mirror:s<0,turns:3}));W(0,11,4-.1*11+.05,0,()=>lzLeiwen(3.6,1.1,{cell:.3,mk:'bronze',back:'lacq'}));
   lzHorn(0,13.5,0,s>0?-PI/2:PI/2,5.2,.32,{curl:.75,lean:.2,mk:LK_PL,col:P('basaltD')});lzEye(s*(3.1-.08*7),7,0,s>0?PI/2:-PI/2,.5,{mk:'bronze'});});
  /* the gatehouse block: a solid battered mass between the pylons with the passage cut through it, front and back */
  const T=lzBatterRoom(8.6,8,PB,H+3.4,LK_ST,P('basalt'),{lean:{front:.06,back:.06,left:0,right:0},front:[{s:4.3,w:dw,h:H,door:true}],back:[{s:4.3,w:dw,h:H,door:true}]});
  lzSlab(T.T,PB+H+3.4,.5,'basalt',P('basaltD'),.15);
  /* the passage's side walls and ceiling: a tunnel the width of the door, so the block reads solid */
  for(const s of [-1,1])lzWall(s>0?[dw/2+.05,4]:[-dw/2-.05,-4],s>0?[dw/2+.05,-4]:[-dw/2-.05,4],s>0?[dw/2+.05,-4]:[-dw/2-.05,4],s>0?[dw/2+.05,4]:[-dw/2-.05,-4],PB,H*.52,LK_PL,P('basaltD'),[],{inner:false});
  /* the two mouths: nested bronze frames, the eye above the front one, the leiwen lintel band */
  for(const s of [-1,1]){const zf=s*(4-.06*0)+s*.1;lzPortal(0,PB,s*4.12,s>0?0:PI,H,{mk:'bronze',step:.5});lzThreshold(0,s*4.6,s>0?0:PI,dw);}
  W(0,PB+H+1.2,4-.06*(H+1.2)+.06,0,()=>lzLeiwen(7.4,1.1,{cell:.3,mk:'bronze',back:'lacq'}));
  lzEye(0,PB+H+2.4,4-.06*(H+2.4)+.1,0,.95,{mk:'bronze'});lzEye(0,PB+H+2.4,-(4-.06*(H+2.4)+.1),PI,.7,{mk:'bronze'});
  door(0,PB,4,0,dw);}});
defBuilding({key:'lk-wall',name:'Capital wall',seed:7707,caste:'all',cut:false,w:22,d:6,h:11.5,budget:70000,
 tags:{types:['military','infrastructure'],wealth:'rich',role:'wall'},
 note:'a 20 m run of the capital\'s wall: cyclopean basalt 8 m to the walk, leaning in on the outer face and out on the inner, a parapet of thirteen stone horns, a bronze line along the walk; runs join end to end and meet the gate\'s pylons and the watchtowers',
 build(o){lzNoCut(()=>box(LK_PL,0,0,0,21,.3,5,P('basaltD')));W(0,.3,0,0,()=>lkWallRun(20,8,{n:13}));
  /* a stair up to the walk on the inner side */
  W(6,0,-2.4,PI,()=>{for(let i=0;i<22;i++){const t=(i+1)/22;box(LK_PL,0,0,-(t*6-.14),1.4,.3+t*8,.3,P('basaltD'));}});
  door(0,.3,2.8,0,2);}});
defBuilding({key:'lk-watchtower',name:'Stone watchtower',seed:7708,caste:4,cut:true,w:12,d:12,h:24,budget:110000,
 tags:{types:['military'],wealth:'rich',role:'watch'},
 note:'a twisted tower of eleven courses, 18 m, hollow below for the guard room (the warriors\' door), a walk on top behind a parapet of eleven stone horns, a great bronze eye facing each way; wall runs meet its sides',
 build(o){const h=18,n=11,w0=7.2,w1=5.2,ch=h/n,hollow=2;lzCutFloor(0);lzNoCut(()=>lkPlinth(10.5,10.5,.3,{}));
  const dh=lzDoorH(4),dw=dh*.62;
  for(let i=0;i<hollow;i++){const t=i/(n-1),w=lerp(w0,w1,t),ry=i*.06;W(0,.3+i*ch,0,ry,()=>lzBatterRoom(w,w,0,ch+.02,LK_ST,P('basalt'),{lean:{front:.02,back:-.02,left:.03,right:-.01},front:i===0?[{s:w/2,w:dw,h:dh,door:true}]:[]}));}
  const cy=.3+hollow*ch,cw=lerp(w0,w1,(hollow-1)/(n-1))-.2;box(LK_ST,0,cy-.3,0,cw,.3,cw,P('basaltD'),(hollow-1)*.06);
  lzTwist(0,0,h,n,w0,w1,.06,{mk:LK_ST,col:P('basalt'),start:hollow,each:(i,y,w,ry)=>{if(i===n-2)W(0,y+ch*.5,0,ry,()=>{for(const q of [0,PI/2,PI,-PI/2])W(0,0,0,q,()=>lzEye(0,0,w/2+.03,0,w*.2,{mk:'bronze'}));});}});
  /* the walk: a slab, a parapet with eleven horns */
  W(0,.3+h,0,(n-1)*.06,()=>{box('basalt',0,0,0,w1+.6,.4,w1+.6,P('basaltD'));for(let k=0;k<4;k++)W(0,.4,0,k*PI/2,()=>{lzWall([-w1/2-.3,w1/2+.3],[w1/2+.3,w1/2+.3],[-w1/2-.3,w1/2+.2],[w1/2+.3,w1/2+.2],0,1.2,LK_ST,P('basalt'),[],{});});
   for(let i=0;i<11;i++){const a=i*TAU/11;const r=w1/2+.25;lzHorn(Math.cos(a)*r,1.6,Math.sin(a)*r,Math.atan2(Math.cos(a),Math.sin(a)),1.6,.13,{curl:.5,lean:.3,mk:LK_PL,col:P('basaltD'),nt:7,ns:6});}});
  lzNoCut(()=>lzPortal(0,.3,w0/2+.04,0,dh,{mk:'bronze'}));lzThreshold(0,w0/2+.3,0,dw);
  FURNISH('lizardmen_common_rack',2.2,.3,-1.8,-PI/2);FURNISH('lizardmen_common_bed',-2,.3,-1.6,0);FURNISH('generic_trade_locker',-2.4,.3,1.4,PI/2);FURNISH('lizardmen_common_stool',.6,.3,.8,0);FURNISH('generic_water',1.8,.3,1.4,0);}});
