// prefix: km
// ================================================================= THE KIMR HOUSE: drawing the pueblo on its rock (KIMR.md section 3)
// "Southwestern meets Cimmerian": Pueblo forms with the Ice Age's weight. The rock, battered, its stones largest at the foot; on
// it the room blocks of adobe over a course of rough stone, stepped back storey by storey, the hero's rooms washed in kaolin; no
// door at the ground: T-doors onto the terraces under hide screens, roof hatches, ladders whose poles stand high over the hatch
// with horn caps; vigas of larch out of the walls, every second capped in horn; mammoth ribs upright in the outer parapets; the
// Aurochs skull on its post over the hero's roof; ochre hand-prints by the doors; drying racks on the terraces. Below the rock: the
// long ladders up its face, the round room under a glyptodont's shell, the pen walled with mammoth bones, the dung walls.
// Everything drawn is a record of core/pueblo's plan or of the site (44-km-plan.js): this fragment decides nothing about where.
//   kmBuild(P, S, C)   the whole house in the def's frame (the house's frame: the rock's top at y 0); registers it in core/tags
//                      first when the placement is not dry
// Def: km-house (v 0..2: the yard 12, 14 or 16 m wide; every plan and rock its own draws).
const KM_DARK=0x16120e;
/* the kit's palette (P, 26k-kit.js) under a name the plan's parameter P does not shadow */
function kmPal(k){return P(k);}
function kmCx(o){o=o||{};return {v:o.v|0,o};}
function kmSet(k,v){if(!CURREC)return;(CURREC.km||(CURREC.km={}))[k]=v;}
/* the points counter-clockwise as prism() takes them (x, z: a positive area); a polygon moved in (t > 0) or out (t < 0) */
function kmCCW(pts){let a=0;for(let i=0;i<pts.length;i++){const p=pts[i],q=pts[(i+1)%pts.length];a+=p[0]*q[1]-q[0]*p[1];}return a>0?pts:pts.slice().reverse();}
function kmInset(pts,t){const c=KPUEBLO.centroid(pts);return pts.map(p=>{const dx=p[0]-c[0],dz=p[1]-c[1],L=Math.hypot(dx,dz)||1;return [p[0]-dx/L*t,p[1]-dz/L*t];});}
function kmRect(x0,z0,x1,z1){return kmCCW([[x0,z0],[x1,z0],[x1,z1],[x0,z1]]);}
/* a door's place along its cell's front edge (the hand-prints read it too) */
function kmDoorX(P,c,r,L){return (kmU(P,c.seg,r.storey,92)-.5)*Math.max(0,L-2.2);}
/* ---------------------------------------------------------------- the rock */
/* four courses, each set in from the one below (the batter), the top course's top at y 0; boulders round the foot; the ledge's
   packed earth on the top */
function kmRock(P,R,S){const n=4,H=R.h,F=H*R.batter;
 for(let k=0;k<n;k++){const y0=-H+H*k/n,y1=-H+H*(k+1)/n,o=F*(1-(k+.5)/n)+(kmU(P,k,1,40)-.5)*.12;
  prism(k?'stone':'stoneD',kmRect(R.x0-o,R.z0-o,R.x1+o,R.z1+o),y0-(k?0:.6),y1,kmPal(k?'stone':'stoneD'));
  /* the facing: two rows of rough blocks a course, laid proud of the core, the largest at the foot (cyclopean, never coursed
     neatly: each block's width, height and set-back drawn from the hash) */
  const ch=(y1-y0)/2,sides=[[R.x0-o,R.z1+o,R.x1-R.x0+2*o,0,1],[R.x0-o,R.z0-o,R.x1-R.x0+2*o,0,-1],[R.x0-o,R.z0-o,R.z1-R.z0+2*o,1,-1],[R.x1+o,R.z0-o,R.z1-R.z0+2*o,1,1]];
  sides.forEach((sd,si)=>{const [px,pz,L,alongZ,sg]=sd;for(let row=0;row<2;row++){let t=row*.5*(2.6-k*.4),i=0;
   while(t<L-.3){const u=kmU(P,k*1000+si*100+row*50+i,3,47),u2=kmU(P,k*1000+si*100+row*50+i,4,47),w=Math.min(L-t,(2.6-k*.4)*(.55+.9*u)),hh=ch*(.62+.36*u2),d=.18+.34*u2;
    const a=t+w/2,yb=y0+row*ch+(ch-hh)/2,x=alongZ?px+sg*(d/2-.06):px+a,z=alongZ?pz+a:pz+sg*(d/2-.06);
    box(u<.1?'stoneD':'stone',x,yb+(u2-.5)*ch*.2,z,alongZ?d:w-.12,hh,alongZ?w-.12:d,kmPal(u<.1?'stoneD':'stone'),0,(u-.5)*.06,(u2-.5)*.06);S.stones++;t+=w;i++;}}});}
 prism('roofE',kmRect(R.x0+.05,R.z0+.05,R.x1-.05,R.z1-.05),0,.05,kmPal('roofE'));
 /* the boulders at the foot, every ~2.2 m round the perimeter */
 const pts=[[R.x0-F,R.z0-F],[R.x1+F,R.z0-F],[R.x1+F,R.z1+F],[R.x0-F,R.z1+F]];let b=0;
 for(let i=0;i<4;i++){const p=pts[i],q=pts[(i+1)%4],L=Math.hypot(q[0]-p[0],q[1]-p[1]),ux=(q[0]-p[0])/L,uz=(q[1]-p[1])/L;
  for(let t=.8;t<L-.4;t+=2.2){const u=kmU(P,i*100+b,2,41),s=.7+u*.8;
   ellip('stone',p[0]+ux*t-uz*.15,-H+s*.35,p[1]+uz*t+ux*.15,s*1.1,s*.7,s*.9,kmPal('stone'),u*6,7);b++;}}
 S.boulders=b;}
/* ---------------------------------------------------------------- a column of rooms */
function kmCell(P,c,S){const h=P.storey,top=c.storeys*h,pts=kmCCW(c.pts);
 /* the stone course at the foot, a hand's width proud of the adobe; the body (kaolin on the hero's); the earth roof */
 prism('stone',kmInset(pts,-.05),0,.75,kmPal('stone'));
 prism(c.hero?'kaolin':'adobe',pts,.75,top,kmPal(c.hero?'kaolin':'adobe'));
 prism('roofE',kmInset(pts,.08),top,top+.1,kmPal('roofE'));
 for(const E0 of KPUEBLO.EDGES){const side=E0[0],o2=c.nb[side]&&P.byId[c.nb[side]],nt=o2?o2.storeys*h:0;if(nt>=top-.01)continue;kmFace(P,c,side,nt,top,S);}}
/* one exposed face of a column from nt (the neighbour's roof, or the rock) to top: the parapet, and the vigas on the front and
   back faces under every storey's roof, every second one capped in horn */
function kmFace(P,c,side,nt,top,S){const E=kmEdge(c,side),h=P.storey,si=['front','right','back','left'].indexOf(side);
 W(E.m[0],0,E.m[1],E.ry,()=>{const L=E.L;
  box(c.hero?'kaolin':'adobe',0,top,-.16,L+.04,.45,.32,kmPal(c.hero?'kaolin':'adobe'));
  if(side!=='front'&&side!=='back')return;
  for(let j=Math.max(0,Math.floor(nt/h+1e-6));j<c.storeys;j++){const yv=(j+1)*h-.42,n=Math.max(2,Math.floor(L/.85));
   for(let k=0;k<n;k++){const x=-L/2+(k+.5)*L/n,bone=kmU(P,c.seg*16+k,j*4+si,43)<.15;
    if(bone)beam('bone',[x,yv,-.05],[x,yv+.02,.55],.11,kmPal('bone'),true,6,.13);else box('pole',x,yv-.08,.22,.16,.16,.5,kmPal('pole'));
    if(k%2===0)box('horn',x,yv-.1,.48,.2,.2,.12,kmPal('horn'));S.vigas++;}}});}
/* ---------------------------------------------------------------- doors, windows, hatches, hand-prints */
/* a T-door: the dark opening, narrow below and wide above; a larch lintel; a painted hide screen on most. A window: a small dark
   square under a pole sill */
function kmDoor(P,r,S){const c=P.byId[r.cell],E=kmEdge(c,'front'),y0=r.y0,dk=hc(KM_DARK);
 W(E.m[0],0,E.m[1],E.ry,()=>{const x=kmDoorX(P,c,r,E.L);
  if(r.face==='door'){box('plain',x,y0+.02,.012,.62,1.25,.03,dk);box('plain',x,y0+1.27,.012,1.04,.55,.03,dk);
   pole('pole',[x-.75,y0+1.9,.08],[x+.75,y0+1.9,.08],.07,kmPal('pole'),6);
   if(kmU(P,c.seg,r.storey,93)<.7){box('hide',x+.08,y0+.08,.05,.7,1.72,.025,kmPal('hide'));
    /* the hide's painted sign: a red bar and a black dot (the household's mark) */
    box('plain',x+.08,y0+1.2,.07,.36,.08,.01,kmPal('ochre'));ellip('plain',x+.08,y0+.95,.07,.07,.07,.01,kmPal('char'),0,6);}
   S.doors++;door(E.m[0]+E.n[0]*.1,y0,E.m[1]+E.n[1]*.1,E.ry,.62,1.8);}
  else{box('plain',x,y0+1.2,.012,.4,.36,.03,dk);pole('pole',[x-.32,y0+1.17,.06],[x+.32,y0+1.17,.06],.04,kmPal('pole'),5);S.windows++;}});}
/* the hand-prints by a door: n prints in red ochre at a child's to a grown hand's height, left and right of the opening */
function kmHands(P,Hd,S){const r=P.rooms.find(q=>q.id===Hd.room);if(!r)return;const c=P.byId[r.cell],E=kmEdge(c,'front');
 W(E.m[0],0,E.m[1],E.ry,()=>{const x0=kmDoorX(P,c,r,E.L);
  for(let k=0;k<Hd.n;k++){const s=k%2?1:-1,u=kmU(P,Hd.seed,k,44),x=x0+s*(.85+u*.35),y=r.y0+.9+kmU(P,Hd.seed,k,45)*.8,sz=.13+u*.05;
   /* the palm and five fingers, a flat print on the wall */
   box('plain',x,y,.012,sz,sz*1.05,.006,kmPal('ochre'),0,0,(u-.5)*.4);
   for(let f=0;f<5;f++){const a=(f-2)*.32+(u-.5)*.4,fl=sz*(f===0||f===4?.55:.8);box('plain',x+Math.sin(a)*sz*.55,y+sz*.9+Math.cos(a)*fl*.2,.013,sz*.17,fl,.006,kmPal('ochre'),0,0,-a);}S.hands++;}});}
/* a roof hatch: a dark square in a coping of poles; its ladder's poles out of it when a ladder climbs from the room below */
function kmHatch(P,H,S){const c=P.byId[H.cell],ry=Math.atan2(c.n[0],c.n[1]);
 W(H.x,H.y+.1,H.z,ry,()=>{box('plain',0,0,0,.8,.04,.8,hc(KM_DARK));for(const s of [-1,1]){box('pole',s*.48,0,0,.12,.12,1.05,kmPal('pole'));box('pole',0,0,s*.48,1.05,.12,.12,kmPal('pole'));}
  if(H.ladder)kmRails(-1,1.9,-.12,-.3,.5);});S.hatches++;}
/* two rails and rungs from (y0, z0) to (y1, z1) in the current frame, half-width hw: larch poles lashed with sinew, a horn cap on
   each pole's top */
function kmRails(y0,y1,z0,z1,hw){for(const s of [-1,1]){beam('pole',[s*hw,y0,z0],[s*hw,y1,z1],.06,kmPal('pole'),true,6,.045);cone('horn',s*hw,y1,z1,.07,.24,kmPal('hornTip'),7);}
 for(let y=y0+.35;y<y1-.4;y+=.34){const t=(y-y0)/(y1-y0),z=z0+(z1-z0)*t;box('pole',0,y,z,2*hw+.08,.06,.06,kmPal('pole'));box('sinew',hw,y-.02,z,.06,.1,.08,kmPal('sinew'));box('sinew',-hw,y-.02,z,.06,.1,.08,kmPal('sinew'));}}
/* a ladder of the plan: its foot .55 m out from the face, its top against it; the poles stand 1.8 m over the roof it reaches */
function kmLadder(L,S){W(L.x,L.y0,L.z,L.ry,()=>kmRails(L.y0>0?.1:0,L.y1-L.y0+1.8,0,-.45,.26));S.ladders++;}
/* the long ladders up the rock's front: along its batter, from the floor to 1.8 m over the landing */
function kmEntry(E,R,S){const H=R.h,run=E.z-R.z1;W(E.x,E.y0,E.z,E.ry,()=>{const y1=H+1.8,z1=-run-1.8*run/H;kmRails(0,y1,0,z1,.32);
  /* the pegs that hold it to the rock, half-way */pole('pole',[-.45,H*.5,-run*.5-.05],[.45,H*.5,-run*.5-.05],.05,kmPal('pole'),5);});S.entries++;}
/* ---------------------------------------------------------------- the dress */
/* an Aurochs skull facing +z at the current origin, its horns raised into a lyre: s the scale (1: a great bull's, 1.5 m across) */
function kmSkull(s){ellip('skull',0,.2*s,.02*s,.17*s,.2*s,.26*s,kmPal('skull'),0,7);ellip('skull',0,.08*s,.25*s,.1*s,.09*s,.13*s,kmPal('skull'),0,6);
 ellip('plain',-.08*s,.24*s,.13*s,.035*s,.04*s,.02*s,hc(KM_DARK),0,5);ellip('plain',.08*s,.24*s,.13*s,.035*s,.04*s,.02*s,hc(KM_DARK),0,5);
 for(const sx of [-1,1]){const a=[sx*.14*s,.3*s,0],b=[sx*.48*s,.38*s,.05*s],c=[sx*.72*s,.72*s,.08*s],d=[sx*.6*s,1.08*s,-.02*s];
  beam('horn',a,b,.09*s,kmPal('horn'),true,6,.07*s);beam('horn',b,c,.07*s,kmPal('horn'),true,6,.045*s);beam('horn',c,d,.045*s,kmPal('hornTip'),true,5,.008*s);}}
function kmCrest(Cr,S){W(Cr.x,Cr.y,Cr.z,Cr.ry,()=>{pole('pole',[0,-.2,0],[0,Cr.post,0],.12,kmPal('pole'),7);
 /* the ochre bands round the post, and the skull on its top */
 for(const y of [.6,1.1,1.6])cyl('plain',0,Cr.post*y/2.4,0,.135,.12,kmPal('ochre'),8);W(0,Cr.post-.15,.12,0,()=>kmSkull(Cr.span/1.5));});S.crest++;}
/* mammoth ribs set upright in an outer parapet's top, curving outward: a spiked palisade */
function kmRibs(Rb,S){W(Rb.x,Rb.y,Rb.z,Rb.ry,()=>{for(let k=0;k<Rb.n;k++){const x=-Rb.L/2+(k+.5)*Rb.L/Rb.n,l=1+((k*7)%5)*.08;
 beam('bone',[x,-.15,-.16],[x,.7*l,-.05],.075,kmPal('bone'),true,5,.06);beam('bone',[x,.7*l,-.05],[x,1.25*l,.22],.06,kmPal('bone'),true,5,.012);S.ribs++;}});}
/* a drying rack: two posts, a crossbar, hides and meat strips hung from it */
function kmRack(Rk,S){W(Rk.x,Rk.y+.1,Rk.z,Rk.ry,()=>{const L=Rk.L;for(const s of [-1,1])pole('pole',[s*L/2,0,0],[s*L/2,1.9,0],.05,kmPal('pole'),6);
 pole('pole',[-L/2-.15,1.85,0],[L/2+.15,1.85,0],.045,kmPal('pole'),6);
 box('hide',-L/4,.55,0,L*.42,1.22,.02,kmPal('hide'));for(let k=0;k<5;k++)box('plain',.12+k*L*.08,1.2,0,.07,.6-(k%2)*.12,.04,kmPal('meat'));});S.racks++;}
/* the round room: half sunk, a ring wall of rough stone standing .9 m, the glyptodont's shell over it with its rosettes; the
   ladder out of the hole near the shell's top */
function kmRound(Rd,S){const r=Rd.r;W(Rd.x,Rd.y,Rd.z,0,()=>{sector('stone',0,0,r-.55,r,0,TAU,-.3,Rd.wall,kmPal('stone'),28);
 ellip('shell',0,Rd.wall-.15,0,r+.2,1.9,r*.92,kmPal('shell'),0,14);
 /* the osteoderms' rosettes in rings over the dome */
 for(let i=1;i<=4;i++){const e=i/5*1.35,na=Math.max(5,Math.round(14*Math.cos(e)));for(let a=0;a<na;a++){const t=(a+(i%2)*.5)/na*TAU;
  ellip('shell',Math.cos(t)*Math.cos(e)*(r+.2),Rd.wall-.15+Math.sin(e)*1.9,Math.sin(t)*Math.cos(e)*r*.92,.22,.1,.22,kmPal('shellB'),t,6);S.osteoderms++;}}
 /* the hatch near the top, and the ladder's poles standing out of it */
 W(.6,Rd.wall+1.6,.3,0,()=>{box('plain',0,0,0,.75,.08,.75,hc(KM_DARK));kmRails(-1.5,1.9,.12,-.12,.24);});
 /* an Aurochs skull over the way in */W(0,Rd.wall-.1,r*.92+.15,0,()=>kmSkull(.7));});S.round++;}
/* the pen: walls of stacked mammoth long bones on three layers, a jaw or a skull at the corners, the gate under an arch of two
   tusks meeting */
function kmPen(Pn,S){W(0,Pn.y,0,0,()=>{const pts=[[Pn.x0,Pn.z1],[Pn.x0,Pn.z0],[Pn.x1,Pn.z0],[Pn.x1,Pn.z1]],G=Pn.gate,P0={world:Math.round(Pn.x0*100)};
 const run=(p,q,gap)=>{const L=Math.hypot(q[0]-p[0],q[1]-p[1]),ux=(q[0]-p[0])/L,uz=(q[1]-p[1])/L;let i=0;
  for(let t=0;t<L-.2;t+=.95){const x=p[0]+ux*(t+.47),z=p[1]+uz*(t+.47);if(gap&&Math.abs(x-gap.x)<gap.w/2)continue;
   for(let j=0;j<3;j++){const u=kmU(P0,i,j,46),a=Math.atan2(uz,ux)+(u-.5)*.25;const dx=Math.cos(a)*.55,dz=Math.sin(a)*.55,y=.18+j*.27;
    beam('bone',[x-dx,y,z-dz],[x+dx,y+(u-.5)*.06,z+dz],.12,kmPal('bone'),true,6,.1);ellip('bone',x-dx,y,z-dz,.13,.13,.13,kmPal('bone'),0,5);ellip('bone',x+dx,y,z+dz,.13,.13,.13,kmPal('bone'),0,5);}
   i++;S.penBones+=3;}};
 run(pts[0],pts[1]);run(pts[1],pts[2]);run(pts[2],pts[3]);run(pts[3],pts[0],{x:G.x,w:G.w});
 for(const p of pts)W(p[0],0,p[1],0,()=>{ellip('skull',0,.55,0,.32,.35,.4,kmPal('skull'),0,7);});
 /* the gate: a tusk planted on each side, curving up and in until their tips meet over the way */
 for(const s of [-1,1]){const x=G.x+s*G.w/2,z=Pn.z1;beam('ivory',[x,0,z],[x-s*.15,1.6,z+.1],.13,kmPal('ivory'),true,7,.11);beam('ivory',[x-s*.15,1.6,z+.1],[x-s*G.w*.38,2.5,z+.05],.11,kmPal('ivory'),true,7,.07);
  beam('ivory',[x-s*G.w*.38,2.5,z+.05],[x-s*G.w*.47,2.62,z],.07,kmPal('ivory'),true,6,.02);}});S.pen++;}
/* a dung wall: cakes stacked flat in courses, each course a little out of line */
function kmDung(D,S){W(D.x,D.y,D.z,D.ry,()=>{const n=Math.round(D.h/.11);for(let j=0;j<n;j++){const o=((j*7)%3-1)*.03;box('dung',o,j*.11,0,D.L-(j%2)*.08,.1,.36-(j>n-3?.06:0),kmPal('dung'));}});S.dung++;}
/* ---------------------------------------------------------------- registration and the whole house */
function kmRegister(P,St,T,parent,at,ry,name){const r=KPUEBLO.register(P,T,{parent,culture:'kimr',at,ry,name,frag:KIT.frag});let n=r.count;
 const fx=(kind,nm,x,y,z,size,role,cls)=>{T.child(parent,{'class':cls||'fixture',kind,key:'km-'+kind,name:name+': '+nm,at:at(x,y,z),ry,size,tags:{culture:'kimr',part:kind,role},frag:KIT.frag});n++;};
 const R=St.rock;fx('rock','the rock (the plinth the blocks stand on)',(R.x0+R.x1)/2,-R.h,(R.z0+R.z1)/2,[R.x1-R.x0,R.z1-R.z0,R.h],'defence','part');
 St.entries.forEach(E=>fx('ladder','a long ladder up the rock (pulled up at night)',E.x,E.y0,E.z,[.7,.4,R.h+1.8],'way-in'));
 fx('round-room','the round room (under a glyptodont\'s shell)',St.round.x,St.round.y,St.round.z,[2*St.round.r,2*St.round.r,St.round.wall+1.9],'meeting','part');
 fx('pen','the pen (walled with mammoth bones)',(St.pen.x0+St.pen.x1)/2,St.pen.y,(St.pen.z0+St.pen.z1)/2,[St.pen.x1-St.pen.x0,St.pen.z1-St.pen.z0,1],'livestock','part');
 St.dung.forEach(D=>fx('dung','a dung wall (fuel)',D.x,D.y,D.z,[D.L,.4,D.h],'fuel'));
 St.crest.forEach(C=>fx('crest','the Aurochs skull on its post',C.x,C.y,C.z,[C.span,.6,C.post+1.2],'trophy'));
 St.racks.forEach(Rk=>fx('rack','a drying rack',Rk.x,Rk.y,Rk.z,[Rk.L,.3,1.9],'store'));
 return n;}
function kmBuild(P,St,C){const S={boulders:0,stones:0,vigas:0,doors:0,windows:0,hands:0,hatches:0,ladders:0,entries:0,crest:0,ribs:0,racks:0,round:0,osteoderms:0,pen:0,penBones:0,dung:0};
 const R=St.rock,ox=St.off[0],oz=St.off[1];
 if(!PLACE_DRY&&CURREC&&CURREC.tid&&SVTAGS){const M=CM.clone(),at=(x,y,z)=>{const v=new THREE.Vector3(x+ox,y+R.h,z+oz).applyMatrix4(M);return [+v.x.toFixed(4),+v.y.toFixed(4),+v.z.toFixed(4)];};
  kmSet('registered',kmRegister(P,St,SVTAGS,CURREC.tid,at,CURREC.ry,CURREC.name));}
 W(ox,R.h,oz,0,()=>{kmRock(P,R,S);
  P.cells.forEach(c=>kmCell(P,c,S));
  P.rooms.forEach(r=>{if(r.face)kmDoor(P,r,S);});
  St.hands.forEach(Hd=>kmHands(P,Hd,S));
  P.hatches.forEach(H=>kmHatch(P,H,S));
  P.ladders.forEach(L=>kmLadder(L,S));
  St.entries.forEach(E=>kmEntry(E,R,S));
  St.crest.forEach(Cr=>kmCrest(Cr,S));St.ribs.forEach(Rb=>kmRibs(Rb,S));St.racks.forEach(Rk=>kmRack(Rk,S));
  kmRound(St.round,S);kmPen(St.pen,S);St.dung.forEach(D=>kmDung(D,S));
  /* the house's way in (core/engine's record front): the west long ladder's foot, facing the front */
  const E0=St.entries[0];door(E0.x,-R.h,E0.z+.3,0,1,2);});
 kmSet('plan',P.id);kmSet('cells',P.cells.length);kmSet('rooms',P.rooms.length);kmSet('pop',P.census.pop);kmSet('rockH',R.h);for(const k in S)kmSet(k,S[k]);
 return S;}
/* the declared box: the largest of the three yards' sites */
const KM_BOX=[0,1,2].map(v=>kmSite(KM.plan(v)).box).reduce((a,b)=>({w:Math.max(a.w,b.w),d:Math.max(a.d,b.d),h:Math.max(a.h,b.h)}));
defBuilding({key:'km-house',name:'Kimr: a clan\'s pueblo on its rock',seed:9801,cut:false,w:+(KM_BOX.w+.4).toFixed(2),d:+(KM_BOX.d+.4).toFixed(2),h:+(KM_BOX.h+.3).toFixed(2),budget:220000,
 tags:{types:['dwelling-multi'],wealth:'middle',style:'pueblo',role:'dwelling'},
 note:'the Kimr\'s raised pueblo (core/pueblo, a U round a yard open to the front) on a battered rock 7-10 m high: adobe blocks stepping up four storeys, the hero\'s rooms washed in kaolin under the Aurochs skull, no door at the ground, ladders with horn-capped poles, mammoth ribs in the parapets; below the rock the long ladders, the round room under a glyptodont\'s shell, the pen walled with mammoth bones, the dung walls. A matrilineal house: its rooms pass from mother to daughter (LORE.md 6.24)',
 build(o){const C=kmCx(o),P=o.plan||KM.plan(C.v);kmBuild(P,kmSite(P),C);}});
