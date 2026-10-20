// prefix: et
// ================================================================= THE TOOLKIT: walls, openings, the oculus, the mask, flutes, parapets
// Everything here draws in the current frame (pushM/popM, 30-geo.js) with the def's front toward +z. The canal town's
// grammar (kits/eternian/PLAN.md section 2): white lime over block, openings with stepped Deco heads and shutters, an
// oculus (a ring window), a mask of the household's dead over every door (closed eyes), fluted piers, stepped parapets,
// cast pattern block where a wall must breathe (geometric, never glyphic). The pier bundle, the lancet bundle and the
// tracery grid are P1's.
const ET_T=.3;   /* a wall's thickness */
/* the cut-away: geometry drawn inside fn stays whole when the building opens; etCutFloor raises the cut's floor */
function etNoCut(fn){const keep=CUTC;CUTC=[keep[0],keep[1],keep[2],0];try{fn();}finally{CUTC=keep;}}
function etCutFloor(y){CUTC=[CUTC[0],CUTC[1],CUTC[2]+y,CUTC[3]];}
/* the yaw that turns a piece at (x, z) to face (tx, tz) */
function etFace(x,z,tx,tz){return Math.atan2((tx||0)-x,(tz||0)-z);}

/* the mask over the door is the statuary's (43-et-statue.js: etMask, from the head generator) */

/* ---------------------------------------------------------------- the oculus: a ring window of radius r facing +z */
function etOculus(x,y,z,r,o){o=o||{};ring(o.mk||'lime',x,y,z,r,r*.16,o.col||P('limeShade'));
 ellip('glass',x,y,z-.02,r*.86,r*.86,.04,o.lit?P('glassLit'):P('glass'),0,16);
 if(o.cross!==false){box('iron',x,y-r*.84,z+.02,.05,r*1.68,.04,P('iron'));box('iron',x,y-.025,z+.02,r*1.68,.05,.04,P('iron'));}}

/* ---------------------------------------------------------------- a stepped Deco head over an opening (w wide, at y) */
function etStepHead(x,y,z,w,o){o=o||{};const c=o.col||P('limeShade'),n=o.steps==null?3:o.steps;
 for(let i=0;i<n;i++){const ww=w+.5-i*(w*.28),hh=.14;if(ww<.2)break;box(o.mk||'lime',x,y+i*hh,z,ww,hh,.12+.04*(n-i),c);}}

/* ---------------------------------------------------------------- a wall with openings
   L long, from y0 up h, mk/col its face, along x in the current frame, thickness ET_T about z=0 (its front at +ET_T/2).
   An opening {x, w, h, y (sill; a door's is 0), door, shut (shutters, default on a window), head ('step' | 'flat'),
   mask (over a door; maskMetal 'terracotta' or 'lead'), leaf (a door's colour)}. The surround is a raised band of lime; a window has its glass set back */
function etWall(L,y0,h,mk,col,opens,o){o=o||{};const t=o.t||ET_T,fz=t/2;opens=(opens||[]).slice().sort((a,b)=>a.x-b.x);let x=-L/2;
 const seg=(a,b,ya,yb)=>{if(b-a>.01&&yb-ya>.01)box(mk,(a+b)/2,y0+ya,0,b-a,yb-ya,t,col);};
 const SY=q=>q.door?0:(q.y==null?.95:q.y),TOP=q=>Math.min(h,SY(q)+q.h);
 /* the wall first, by columns: openings whose spans overlap are stacked in one column (a window over a door, the
    bay's two storeys), and the wall fills under the lowest, between each pair and over the highest, never across one */
 {const cols=[];for(const q of opens){const a=q.x-q.w/2,b=q.x+q.w/2,c=cols[cols.length-1];
   if(c&&a<c.b-.01){c.b=Math.max(c.b,b);c.q.push(q);}else cols.push({a:a,b:b,q:[q]});}
  for(const c of cols){seg(x,c.a,0,h);const st=c.q.slice().sort((p,r)=>SY(p)-SY(r));let yy=0;
   for(const q of st){const a=q.x-q.w/2,b=q.x+q.w/2;seg(c.a,c.b,yy,SY(q));if(a>c.a)seg(c.a,a,SY(q),TOP(q));if(b<c.b)seg(b,c.b,SY(q),TOP(q));yy=TOP(q);}
   seg(c.a,c.b,yy,h);x=Math.max(x,c.b);}}
 for(const q of opens){const a=q.x-q.w/2,b=q.x+q.w/2,sy=SY(q),top=TOP(q);
  if(q.gap)continue;                                                                     /* a plain opening: a bay opens off the room */
  const sc=o.frame||P('limeShade');                                                      /* the surround */
  for(const s of [a-.09,b+.09])box('lime',s,y0+sy,fz+.03,.18,top-sy,.08,sc);
  if(!q.door)box('lime',q.x,y0+sy-.1,fz+.06,q.w+.4,.12,.18,sc);                          /* the sill */
  if(q.head!=='flat')etStepHead(q.x,y0+top,fz+.03,q.w,{col:sc});
  if(q.door){box('timber',q.x,y0,-.02,q.w-.06,top-.04,.08,q.leaf||P('timber'));        /* the leaf, set back */
   for(let i=0;i<3;i++)box('timber',q.x,y0+.35+i*(top-.6)/3,.04,q.w-.3,.05,.03,new THREE.Color(q.leaf||P('timber')).multiplyScalar(.8));
   box('brass',q.x+q.w*.32,y0+1.0,.06,.05,.18,.04,P('bronze'));
   door(q.x,y0,fz,0,q.w);
   if(q.mask!==false)etMask(q.x,y0+top+.62,fz+.1,.46,q.maskMetal);}
  else{/* the glass; a steel window's is dark and opaque, so its grid reads against it from the street */
   box(q.steel?'plain':'glass',q.x,y0+sy,-.04,q.w-.04,top-sy,.04,q.lit?P('glassLit'):q.steel?new THREE.Color(P('glass')).multiplyScalar(.8):P('glass'));
   if(q.steel){const ir=P('iron');                                                         /* Deco steel glazing: a fine grid */
    for(let k=1;k<Math.round(q.w/.3);k++)box('iron',q.x-q.w/2+k*q.w/Math.round(q.w/.3),y0+sy,.0,.05,top-sy,.06,ir);
    for(let k=1;k<Math.round((top-sy)/.42);k++)box('iron',q.x,y0+sy+k*(top-sy)/Math.round((top-sy)/.42),.0,q.w,.05,.06,ir);}
   else box('timber',q.x,y0+sy,-.02,.05,top-sy,.06,P('timber'));                         /* the mullion */
   if(q.shut!==false){const sk=o.shutKey||'shutter';                                     /* louvred shutters, folded open */
    for(const s of [-1,1]){const sx=q.x+s*(q.w*.75+.06);box('shutter',sx,y0+sy,fz+.05,q.w/2,top-sy,.04,o.shutCol||P(sk));
     for(let k=1;k<Math.floor((top-sy)/.22);k++)box('shutter',sx,y0+sy+k*.22,fz+.08,q.w/2-.06,.025,.02,new THREE.Color(o.shutCol||P(sk)).multiplyScalar(.82));}}}}
 seg(x,L/2,0,h);}
/* four walls round a w x d room from y0 up h; o.front/back/left/right: openings per side (etWall). The front faces +z;
   the side walls run between the front and the back */
function etWalls(w,d,y0,h,mk,col,o){o=o||{};const t=o.t||ET_T;
 const S=[['front',0,d/2-t/2,0,w],['back',0,-d/2+t/2,PI,w],['right',w/2-t/2,0,PI/2,d-2*t],['left',-w/2+t/2,0,-PI/2,d-2*t]];
 for(const [side,x,z,ry,L] of S){pushM(TF(x,0,z,ry));etWall(L,y0,h,mk,col,o[side]||[],o);popM();}}

/* ---------------------------------------------------------------- flutes: n half-round reeds on a face at z, x0..x1, y0..y1 */
function etFlutes(x0,x1,y0,y1,z,n,col){const r=Math.min(.16,(x1-x0)/(n*2.1));
 for(let i=0;i<n;i++){const x=x0+(x1-x0)*(i+.5)/n;cyl('lime',x,y0,z,r,y1-y0,col||P('lime'),8);}}

/* ---------------------------------------------------------------- the parapet: a band round a w x d roof at y, h tall, with a
   coping; o.crown: a stepped crown at the front's centre (o.crownX, o.crownW wide, o.steps), the canal town's sign of a house */
function etParapet(w,d,y,h,o){o=o||{};const t=.22,c=o.col||P('lime'),cp=o.cope||P('limeShade');
 for(const [x,z,L,ry] of [[0,d/2-t/2,w,0],[0,-d/2+t/2,w,0],[w/2-t/2,0,d,PI/2],[-w/2+t/2,0,d,PI/2]]){
  box('lime',x,y,z,ry?t:L,h,ry?L:t,c);box('lime',x,y+h,z,ry?t+.12:L+.12,.1,ry?L+.12:t+.12,cp);}
 if(o.crown){const cx=o.crownX||0,cw=o.crownW||2.4,n=o.steps||3;
  for(let i=0;i<n;i++){const ww=cw-i*cw/n*.8;box('lime',cx,y+h+.1+i*.45,d/2-t/2,ww,.45,t+.04,i%2?cp:c);}
  if(o.crownMask)etMask(cx,y+h+.1+n*.45*.55,d/2+.06,.5,o.crownMask);}}

/* ---------------------------------------------------------------- cast pattern block: a pierced screen L x h along x at z,
   blocks of `s` metres with a stepped geometric relief, every other one pierced (Lloyd Wright's textile block: never glyphic) */
function etBlockScreen(L,h,y0,z,o){o=o||{};const s=o.s||.4,c=o.col||P('block'),nx=Math.floor(L/s),ny=Math.floor(h/s);
 for(let i=0;i<nx;i++)for(let j=0;j<ny;j++){const x=-L/2+(i+.5)*s,y=y0+j*s,pierce=(i+j)%2===0&&j>0&&j<ny-1;
  if(pierce){box('block',x,y,z,s,s*.18,s*.6,c);box('block',x,y+s*.82,z,s,s*.18,s*.6,c);
   for(const sx of [-1,1])box('block',x+sx*s*.41,y+s*.18,z,s*.18,s*.64,s*.6,c);}
  else{box('block',x,y,z,s-.01,s-.01,s*.6,c);box('block',x,y+s*.25,z+s*.3,s*.5,s*.5,.04,new THREE.Color(c).multiplyScalar(.9));
   box('block',x,y+s*.38,z+s*.32,s*.24,s*.24,.04,new THREE.Color(c).multiplyScalar(.82));}}}

/* ---------------------------------------------------------------- a straight stair: n treads from (x, y0, z0) rising +y and
   running toward +z by `run` each, w wide; each tread a block a walker stands on (37-wk-rec.js reads it as a floor) */
function etStair(x,y0,z0,w,rise,run,n,col){for(let i=0;i<n;i++)box('timber',x,y0+i*rise,z0+i*run+run/2*Math.sign(run),w,rise,Math.abs(run),col||P('timber'));}
