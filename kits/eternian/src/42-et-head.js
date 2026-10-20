// prefix: et
// ================================================================= THE FACETED HEAD AND FIGURE GENERATOR (PLAN.md section 5, P2)
// The kit's novel piece: a face built from planes, which a generator can make in a hundred variants where a smooth
// portrait cannot (the owner's Deco-cubist references; LORE.md 6.19's statuary). One generator for every build that
// carries the Eternians' statuary: this kit draws with it, and kits/ancients' Sanctum target reads this file in place.
//
//   etHeadParams(seed, o)   the proportions, a pure function of a seed (core/rand KRAND: a hash of world, cell, index and
//                           salt), each overridable: long, broad, aged, soft (0..1), eyes 'closed' (the dead: the
//                           default and the rule) or 'open' (the living), headdress 'step' | 'fan' | 'ring' | 'none',
//                           mask (a face shell with a flat back: the masks over the canal town's doors)
//   etHeadGeo(p)            -> {pos, uv, eyes}: a non-indexed triangle list (flat shading reads every plane), chin at
//                           y 0 (a neck below it to -0.16 unless p.neck is false), crown at y 1, the face toward +z, a front-projected uv
//   etFigureGeo(p)          -> {pos, uv, eyes}: a standing figure 1 tall (head included): pose 'stand' | 'seat' |
//                           'lintel' (arms spread overhead, holding up a door: the civic door's ancestor) | 'folded'.
//                           Never striding, never armed (PLAN.md section 2)
//
// [G data]: arrays of numbers only, no three.js, no DOM: a Godot importer reads the same arrays.

/* ---------------------------------------------------------------- the proportions from a seed */
function etHeadParams(seed,o){o=o||{};const u=k=>KRAND.unit(KRAND.hash(seed>>>0,0x4ead,k));
 const pick=(v,d)=>v==null?d:v;
 return {long:pick(o.long,u(1)),broad:pick(o.broad,u(2)),aged:pick(o.aged,u(3)),soft:pick(o.soft,u(4)),
  eyes:o.eyes==='open'?'open':'closed',headdress:pick(o.headdress,['step','fan','ring','none'][Math.floor(u(5)*4)]),mask:!!o.mask,
  neck:o.neck==null?!o.mask:!!o.neck,seed:seed>>>0};}

/* ---------------------------------------------------------------- triangle-list helpers */
function etTri(G,a,b,c){G.pos.push(a[0],a[1],a[2],b[0],b[1],b[2],c[0],c[1],c[2]);
 for(const p of [a,b,c])G.uv.push(p[0]+.5,p[1]);}
function etQuad(G,a,b,c,d){etTri(G,a,b,c);etTri(G,a,c,d);}
/* a box from its two corners, optionally turned rz about z through its centre (an arm raised) */
function etGBox(G,x0,y0,z0,x1,y1,z1,rz){const cx=(x0+x1)/2,cy=(y0+y1)/2,c=Math.cos(rz||0),s=Math.sin(rz||0);
 const P=(x,y,z)=>[cx+(x-cx)*c-(y-cy)*s,cy+(x-cx)*s+(y-cy)*c,z];
 const v=[P(x0,y0,z0),P(x1,y0,z0),P(x1,y1,z0),P(x0,y1,z0),P(x0,y0,z1),P(x1,y0,z1),P(x1,y1,z1),P(x0,y1,z1)];
 for(const f of [[4,5,6,7],[1,0,3,2],[0,4,7,3],[5,1,2,6],[3,7,6,2],[0,1,5,4]])etQuad(G,v[f[0]],v[f[1]],v[f[2]],v[f[3]]);}
/* a square beam w thick from a to b (a limb): its section kept upright where it can be */
function etGBeam(G,a,b,w){const d=[b[0]-a[0],b[1]-a[1],b[2]-a[2]],L=Math.hypot(d[0],d[1],d[2])||1,u=[d[0]/L,d[1]/L,d[2]/L];
 let s=[u[1],-u[0],0];if(Math.hypot(s[0],s[1])<1e-6)s=[1,0,0];const sl=Math.hypot(s[0],s[1],s[2]);s=[s[0]/sl,s[1]/sl,s[2]/sl];
 const t=[u[1]*s[2]-u[2]*s[1],u[2]*s[0]-u[0]*s[2],u[0]*s[1]-u[1]*s[0]],h=w/2;
 const P=(p,i,j)=>[p[0]+(s[0]*i+t[0]*j)*h,p[1]+(s[1]*i+t[1]*j)*h,p[2]+(s[2]*i+t[2]*j)*h];
 const c=[[-1,-1],[1,-1],[1,1],[-1,1]];
 for(let k=0;k<4;k++){const c0=c[k],c1=c[(k+1)%4];etQuad(G,P(a,c0[0],c0[1]),P(a,c1[0],c1[1]),P(b,c1[0],c1[1]),P(b,c0[0],c0[1]));}
 etQuad(G,P(b,-1,-1),P(b,1,-1),P(b,1,1),P(b,-1,1));etQuad(G,P(a,-1,1),P(a,1,1),P(a,1,-1),P(a,-1,-1));}
/* an n-sided frustum (a robe, a plinth) from radius r0 at y0 to r1 at y1, its depth squashed by sz */
function etGFrustum(G,cx,cz,y0,y1,r0,r1,n,sz){sz=sz==null?1:sz;const P=(r,y,i)=>{const a=i/n*Math.PI*2+Math.PI/n;return [cx+r*Math.sin(a),y,cz+r*Math.cos(a)*sz];};
 for(let i=0;i<n;i++){etQuad(G,P(r0,y0,i),P(r0,y0,i+1),P(r1,y1,i+1),P(r1,y1,i));etTri(G,[cx,y1,cz],P(r1,y1,i),P(r1,y1,i+1));}}

/* ---------------------------------------------------------------- the head */
const ET_HEAD_ROWS=[0,.06,.14,.22,.27,.33,.4,.47,.52,.58,.64,.72,.82,.91,.97,1];
const ET_HEAD_COLS=[0,.3,.62,1.0,1.5,2.25,Math.PI];   /* the front half's columns, mirrored: few, so each plane is broad */
function etHeadGeo(p){p=p||etHeadParams(0);const G={pos:[],uv:[],eyes:p.eyes};
 const R=ET_HEAD_ROWS,C=ET_HEAD_COLS.concat(ET_HEAD_COLS.slice(1,-1).reverse().map(a=>Math.PI*2-a)),NC=C.length;
 const L=p.long,B=p.broad,A=p.aged,S=p.soft,wsc=1-.14*L;
 // the outline, row by row: the jaw narrowing to the chin (broader for `broad`), the cranium closing over the top
 const halfW=y=>{let a;if(y<.4)a=.17+(.42-.17)*Math.pow(y/.4,.62)+B*.05*(1-y/.4);else if(y<.74)a=.42+.012*Math.sin((y-.4)/.34*Math.PI);
  else a=.42*Math.sqrt(Math.max(0,1-Math.pow((y-.74)/.27,2)));return Math.max(.012,a*wsc);};
 const halfD=y=>Math.max(.012,(y<.74?.44:.46*Math.sqrt(Math.max(0,1-Math.pow((y-.74)/.27,2))))*(y<.25?.86+.4*y:1));
 // the features: forward offsets (dz) and outward ones (dx) at a row and a column (the front's columns 0..4)
 const F={};const at=(ri,ci,dz,dx)=>{const k=ri+','+ci;F[k]=F[k]||[0,0];F[k][0]+=dz;F[k][1]+=dx||0;};
 const r=y=>R.indexOf(y);
 at(r(.27),0,.09);at(r(.33),0,.22);at(r(.4),0,.15);at(r(.47),0,.09);at(r(.52),0,.06);at(r(.58),0,.03);   // the nose: a ridge to the brow
 at(r(.27),1,.05);at(r(.33),1,.07);                                                          // its wings
 at(r(.22),0,.05+S*.02);at(r(.22),1,.03+S*.015);at(r(.14),0,.02);at(r(.22),2,-.035);           // the lips; the mouth's corners set back
 at(r(.06),0,.06+B*.03);at(r(.06),1,.03);at(r(.14),1,.015);                                   // the chin
 const open=p.eyes==='open';
 at(r(.47),1,open?-.08:-.03);at(r(.47),2,open?-.07:-.035);at(r(.52),1,open?-.08:-.05);at(r(.52),2,open?-.07:-.045);   // the eyes: a flat plane under the brow
 at(r(.58),1,.065+A*.03);at(r(.58),2,.06+A*.03);at(r(.58),3,.025);at(r(.64),1,.02);         // the brow ridge
 at(r(.4),2,.045-A*.02,.015);at(r(.4),3,.03,.03);at(r(.33),2,.02);at(r(.27),2,-A*.05);at(r(.27),3,-A*.03);   // the cheek planes; hollow with age
 at(r(.14),3,0,.04*B);at(r(.06),2,0,.035*B);                                                 // the jaw's corners
 // the grid
 const PT=(ri,j)=>{const y=R[ri],ph=C[j],side=Math.sin(ph)<0?-1:1,ci=Math.min(j,NC-j)%NC,col=ET_HEAD_COLS.indexOf(C[Math.min(j,NC-j)]);
  const f=F[ri+','+(col<0?ci:col)]||[0,0],front=Math.cos(ph);
  let x=halfW(y)*Math.sin(ph)+side*f[1],z=halfD(y)*(front>0?Math.pow(front,.55):front*.92)+f[0];   /* a flat face plane */
  if(p.mask&&front<.35){z=Math.max(-.02,z*.15);}
  return [x,y,z];};
 const cols=p.mask?C.map((a,j)=>j).filter(j=>Math.cos(C[j])>-.2):C.map((a,j)=>j);
 for(let i=0;i<R.length-1;i++)for(let k=0;k<NC;k++){const j=k,j1=(k+1)%NC;
  if(p.mask&&(Math.cos(C[j])<-.2||Math.cos(C[j1])<-.2))continue;
  etQuad(G,PT(i,j),PT(i,j1),PT(i+1,j1),PT(i+1,j));}
 const top=PT(R.length-1,0);top[0]=0;top[2]=0;
 for(let k=0;k<NC;k++){if(p.mask&&(Math.cos(C[k])<-.2||Math.cos(C[(k+1)%NC])<-.2))continue;etTri(G,PT(0,(k+1)%NC),PT(0,k),[0,0,0]);}
 if(p.mask){const b=-.03;etQuad(G,[-.36*wsc,0,b],[-.36*wsc,1,b],[.36*wsc,1,b],[.36*wsc,0,b]);}   /* a flat back: it hangs on a wall */
 // the open eye: a pupil cut into the lid's plane, a pit of four faces
 if(open)for(const s of [-1,1]){const ex=s*halfW(.5)*Math.sin(.46),ey=.5,ez=halfD(.5)*Math.pow(Math.cos(.46),.55)-.07,e=.032;
  const c=[ex,ey,ez-.03],q=[[ex-e,ey-e*.6,ez],[ex+e,ey-e*.6,ez],[ex+e,ey+e*.6,ez],[ex-e,ey+e*.6,ez]];
  for(let k=0;k<4;k++)etTri(G,q[k],q[(k+1)%4],c);}
 // a short faceted neck under the jaw: a head on a plinth stands on it (the figures and masks have none)
 if(p.neck)etGFrustum(G,0,-.04,-.16,.08,.17,.15,8,.85);
 // the headdress: the stepped Deco crown, the fan (the frieze's radiating fins), the ring (the disc halo), or none
 const hd=p.mask?'none':p.headdress;
 if(hd==='step'){etGBox(G,-.34*wsc,.84,-.3,.34*wsc,.97,.2);etGBox(G,-.24*wsc,.97,-.24,.24*wsc,1.09,.12);etGBox(G,-.12,1.09,-.18,.12,1.2,.04);}
 else if(hd==='fan'){for(let k=0;k<9;k++){const a=-Math.PI*.42+k/8*Math.PI*.84,cx=Math.sin(a)*.34,cy=.74+Math.cos(a)*.34;
   etGBox(G,cx-.035,cy-.02,-.2,cx+.035,cy+.3,-.1,-a);}}
 else if(hd==='ring'){const n=14,R0=.4,R1=.46;for(let k=0;k<n;k++){const a0=k/n*Math.PI*2,a1=(k+1)/n*Math.PI*2,y0=.66,zz=-.34;
   const P1=(rr,a)=>[Math.sin(a)*rr,y0+Math.cos(a)*rr,zz];etQuad(G,P1(R0,a0),P1(R1,a0),P1(R1,a1),P1(R0,a1));etQuad(G,P1(R0,a1),P1(R1,a1),P1(R1,a0),P1(R0,a0));}}
 return G;}

/* ---------------------------------------------------------------- the figure: 1 tall, the head on top (PLAN.md section 5) */
/* a hand at the wrist w: a palm and four fingers along d (unit), spread along a (unit), a thumb off the side; s long */
function etGHand(G,w,d,a,s){const at=(t,u)=>[w[0]+d[0]*t+a[0]*u,w[1]+d[1]*t+a[1]*u,w[2]+d[2]*t+a[2]*u];
 etGBeam(G,w,at(s*.5,0),s*.4);
 for(let f=0;f<4;f++){const u=(f-1.5)*s*.1;etGBeam(G,at(s*.48,u),at(s*(f===1||f===2?1:.88),u),s*.085);}
 etGBeam(G,at(s*.12,s*.2),at(s*.48,s*.32),s*.09);}
function etFigureGeo(p){p=p||{};const pose=p.pose||'stand',G={pos:[],uv:[],eyes:'closed'};
 const hp=etHeadParams(p.seed||0,{eyes:p.eyes,headdress:p.headdress||'step',neck:false}),seat=pose==='seat';
 const hH=.15,shY=seat?.62:.8,hipY=seat?.36:.45;
 // the robe: a faceted bell to the shoulders (a seated figure: on its block, the knees forward)
 if(seat){etGBox(G,-.2,0,-.18,.2,hipY-.02,.16);etGBox(G,-.15,hipY-.02,-.02,.15,hipY+.07,.3);etGBox(G,-.14,0,.18,.14,hipY-.02,.3);}
 etGFrustum(G,0,0,seat?hipY:0,shY,seat?.17:.22,.15,8,.72);
 etGBox(G,-.21,shY-.05,-.08,.21,shY+.03,.08);                                        // the shoulders' bar
 // the arms by pose: folded across the chest, spread overhead holding a lintel, or down at the sides
 if(pose==='folded'){etGBox(G,-.19,shY-.32,-.05,-.13,shY-.02,.06);etGBox(G,.13,shY-.32,-.05,.19,shY-.02,.06);etGBox(G,-.18,shY-.3,.05,.13,shY-.22,.12);
  etGHand(G,[.13,shY-.26,.09],[-1,0,0],[0,1,0],.07);}   /* the right hand over the left forearm */
 else if(pose==='lintel'){const sp=p.spread==null?.38:p.spread;   /* p.spread: the hands' reach from the axis (a gate's colossi hold closer) */
  for(const sx of [-1,1]){const sh=[sx*.19,shY-.01,0],el=[sx*(.19+.14*sp/.38),shY+.14,0],hd=[sx*sp,shY+.34,0];
   etGBeam(G,sh,el,.065);etGBeam(G,el,hd,.055);etGHand(G,hd,[0,1,0],[0,0,1],.045);}}   /* the hands under the lintel at shY + .38, fingers up */
 else{etGBox(G,-.22,shY-.42,-.05,-.16,shY-.02,.05);etGBox(G,.16,shY-.42,-.05,.22,shY-.02,.05);
  if(seat){etGBox(G,-.2,hipY+.05,.05,-.14,hipY+.1,.26);etGBox(G,.14,hipY+.05,.05,.2,hipY+.1,.26);
   for(const sx of [-1,1])etGHand(G,[sx*.17,hipY+.08,.26],[0,-.29,.96],[1,0,0],.08);}   /* the hands on the knees */
  else for(const sx of [-1,1])etGHand(G,[sx*.19,shY-.42,0],[0,-1,0],[0,0,1],.08);}   /* the hands at the sides */
 etGBox(G,-.05,shY+.02,-.05,.05,shY+.06,.05);                                        // the neck
 // the head, scaled to hH and set on the neck
 const H=etHeadGeo(hp);G.eyes=H.eyes;const w=hH*.92;
 for(let i=0;i<H.pos.length;i+=3){G.pos.push(H.pos[i]*w,shY+.05+H.pos[i+1]*hH,H.pos[i+2]*w);}
 for(let i=0;i<H.uv.length;i+=2)G.uv.push(H.uv[i],H.uv[i+1]);
 return G;}
/* ---------------------------------------------------------------- the veil (the owner's quality pass, 2026-10-20): cloth
   over a head of the generator's frame (chin at 0, crown at 1, the neck's foot at -0.16), hugging the crown and falling in
   folds to the foot, the folds deepening as they fall, the brow and nose faintly through it at the front. p.seed turns
   the folds. Returns {pos, uv} as etHeadGeo does */
function etVeilGeo(p){p=p||{};const G={pos:[],uv:[]},ph0=KRAND.unit(KRAND.hash((p.seed|0)>>>0,0x7e11,1))*TAU,NF=11,NR=14,NC=33;
 const Y=i=>1.14-(1.30)*i/(NR-1);
 const R=y=>y>.62?.47*Math.sqrt(Math.max(0,1-Math.pow((y-.56)/.6,2)))+.02:.47+(.62-y)*.07;
 const P=(i,j)=>{const y=Y(i),t=i/(NR-1),a=j/(NC-1)*TAU,fold=t*t*.11*Math.sin(NF*a+ph0)+t*.04*Math.sin(5*a+2*ph0);
  const front=Math.max(0,Math.cos(a)),face=(y>.15&&y<.9?.25*Math.sin((y-.15)/.75*Math.PI):0)*Math.pow(front,2.5);   /* over the brow, nose and chin */
  const r=R(y)*(1+fold)+face;return [r*Math.sin(a),y,r*Math.cos(a)*.98];};
 for(let i=0;i<NR-1;i++)for(let j=0;j<NC-1;j++)etQuad(G,P(i,j),P(i+1,j),P(i+1,j+1),P(i,j+1));
 return G;}
globalThis.etHeadParams=etHeadParams;globalThis.etHeadGeo=etHeadGeo;globalThis.etFigureGeo=etFigureGeo;globalThis.etVeilGeo=etVeilGeo;
