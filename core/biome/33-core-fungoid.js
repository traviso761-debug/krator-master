// ================================================================= BIOME CORE — fungoid parts (BIO.fung)
// One copy of the fleshy-body parts the fungoid lineage is built from (biomes/outlands/PLAN.md section 12, C2; the
// owner, 2026-10-26). Before it every kit drew its own: bracket() in swbay, nwbay, rift and the hyperjungle, the Throne's
// cap, capTube and bladders, swbay's capTop, nhighlands' mushrooms and disc stalks, the crusts of ebadlands and
// ringisles. Opt-in: a kit lists '33-core-fungoid.js' after 30-core-foliage.js in CORE_BIOME (core/rand must be on the
// page) and calls it; nothing else changes.
//
// Two halves.
//   GEOMETRY (three.js, [draw]): BIO.fung.<part>(o) -> a unit BufferGeometry for BIO.def, so instancing, the LOD, the
//   inspector and the export are unchanged: origin at the base (a bracket at its wall, a fringe at its hanging point),
//   +y up, position, normal, uv (u round, v along) and a vertex colour that is a SHADE (a multiplier, 1 = the instance's
//   own colour): the stem paler, the gills and pores darker, a tube's rim brighter. Def it with a vertex-colour material
//   (the kits' M.vcol) or a library skin. Every size is a fraction of the unit; BIO.put scales it. The same o gives the
//   same vertices on every machine: an irregular rim or lump is KRAND.vnoise of (o.seed, angle, ring), never a draw.
//   LAYOUT (plain records, [G data]): BIO.fung.troop/shelves/pods/combs(o) -> [{p, q, s, i, u}], p [x,y,z] the base's
//   point, q [x,y,z,w] the instance rotation, s [sx,sy,sz] its scale, i the item's index, u a unit draw for the kit's
//   colour pick. Each item is drawn from KRAND.hash(o.seed, i, salt) and never from how many draws came before it, so
//   a kit that adds a cap to a troop moves no other cap. BIO.fung.Q(q) -> THREE.Quaternion; BIO.fung.put(name, recs,
//   col, at) places a layout with BIO.put (col a colour, an array to pick from by u, or a function (rec) -> colour).
//
//   cap(o)     a cap: o.form 'dome' (default), 'disc' (a flat saucer) or 'funnel' (rim up, a pit at the centre);
//              o.h the cap's height (.35 of its radius), o.seg (10), o.rings (3), o.wav rim waves (0) and o.wavA (.06),
//              o.ribs alternate rib shading and lift (0: none; a count, shaded by ribK .8), o.lump (0) a seeded wobble;
//              o.under 'gills' (default: o.gillN plates, o.gillD deep, shaded gillK .55), 'pores' (a closed underside,
//              poreK .6) or 'none'; o.stem null or {h (.6), r (.12), r1 (r*.8), seg (5), k (1.5)}: the cap on a stem,
//              the origin at the stem's foot. Radius 1.
//   bracket(o) a shelf on a wall: the wall at z 0, the shelf out along +z, o.arc (PI), o.seg (8), o.thick (.3), o.droop
//              (.15: the lip below the root), o.wav/o.wavA, o.lump; the top shaded 1, the underside poreK, the lip lipK 1.15.
//   bladder(o) a lathe body: o.swell (.5: 0 a spindle, 1 a ball), o.neck (.25: the top's radius), o.pleats (8) and
//              o.pleatA (.08), o.seg (12), o.rings (6). Radius 1 at the belly, height o.h (1.4).
//   pod(o)     a teardrop: o.tip (.35: how pointed), o.h (1.6), o.seg (8), o.rings (5); o.hang turns it to hang from
//              the origin (down -y).
//   stalk(o)   a stalk 1 high: o.r0 (.08) at the foot, o.r1 (.05) at the top, o.bend (0: the tip's offset along +x,
//              a quadratic bow), o.ribs (0) and o.ribA (.15), o.seg (6), o.rings (4), open at both ends (as BIO's rods).
//   fringe(o)  hanging threads: o.n crossed card pairs (3) round a ring of radius o.r (.6), from y 0 down to -1, o.w
//              the card's width (.25); uv 0..1 down each card (a library strand card).
//   comb(o)    a pair of lobed plates either side of a mast at the origin, out along +-x: o.w (1: half-span), o.d (.45:
//              depth along z), o.tilt (.25 rad up), o.lobes (3), o.seg (6).
//   tube(o)    a cluster of open tubes: o.n (5), radius o.r (.12), height 1 for the tallest (seeded down to o.hMin .4),
//              spread o.spread (.3), o.seg (6); the rim ring shaded rimK (1.6: brighter, for an emissive rim the kit's
//              material reads it), the inside darker (inK .45).
//   crust(o)   a flat lobed patch on the ground (y .01, normal +y): radius 1, o.lobes (5), o.lobeA (.3), o.seg (16),
//              o.rings (2); the centre shaded crustK (.85), the edge 1.
//
//   troop(o)   caps over a disc: o.n (5), o.r (1), o.size [.08,.24], o.flat [1,1] (the y scale over the size),
//              o.tilt (.1 rad), o.ground (x, z) -> y (optional; else y 0).
//   shelves(o) brackets in rows on a trunk or rock face: o.at the face's point, o.n its outward normal, o.rows (3),
//              o.per (2) a row, o.dy (.3) between rows, o.spread (.35) across, o.size [.15,.4], o.thick (.4: the y scale).
//   pods(o)    a cluster round o.at: o.n (5), o.r (.3), o.size [.1,.25], o.hang (false), o.tilt (.35).
//   combs(o)   plate pairs up a mast from o.a to o.b: o.n (4), o.t0 (.3), o.t1 (.95), each node turned a quarter (o.turn
//              PI/2), o.size [s at the foot, s at the top] ([.6,.3]).
(function(){
const {TAU,clamp,lerp}=BIO.fn;
if(typeof KRAND==='undefined'){BIO.fung=null;return;}
const nz=(x,d)=>x==null?d:x;
// a seeded wobble in [-1,1] round a ring: smooth in the angle (sampled on a circle), different per ring and per seed
const wob=(seed,a,k)=>KRAND.vnoise(Math.cos(a)*1.7+3,Math.sin(a)*1.7+3,k*.61,seed>>>0)*2-1;
const sub=(a,b)=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]],cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const dot=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2],norm=a=>{const l=Math.hypot(a[0],a[1],a[2]);return l>1e-12?[a[0]/l,a[1]/l,a[2]/l]:[0,1,0];};

// ---------------------------------------------------------------- the mesh writer
// A grid of points P[k][j] (k along the profile, j round), smooth normals from the grid's own differences, two
// triangles a cell, each wound to face its normal (front faces for a FrontSide material). A cell with a zero-length
// edge (the axis of a lathe) drops its degenerate triangle. out: {pos, nor, uv, col}.
function W(){return{pos:[],nor:[],uv:[],col:[]};}
function grid(out,P,C,U,V,flip){const nk=P.length,nj=P[0].length,N=[];
 for(let k=0;k<nk;k++){N[k]=[];for(let j=0;j<nj;j++){
  const ja=Math.max(0,j-1),jb=Math.min(nj-1,j+1),ka=Math.max(0,k-1),kb=Math.min(nk-1,k+1);
  let da=sub(P[k][jb],P[k][ja]);if(Math.hypot(da[0],da[1],da[2])<1e-9){const k2=k<nk-1?k+1:k-1;da=sub(P[k2][jb],P[k2][ja]);}
  let n=norm(cross(da,sub(P[kb][j],P[ka][j])));if(flip)n=[-n[0],-n[1],-n[2]];N[k][j]=n;}}
 const put=(k,j)=>{const p=P[k][j],n=N[k][j],c=C[k][j];out.pos.push(p[0],p[1],p[2]);out.nor.push(n[0],n[1],n[2]);out.uv.push(U[j],V[k]);out.col.push(c,c,c);};
 const tri=(a,b,c)=>{const pa=P[a[0]][a[1]],pb=P[b[0]][b[1]],pc=P[c[0]][c[1]],g=cross(sub(pb,pa),sub(pc,pa));
  if(Math.hypot(g[0],g[1],g[2])<1e-12)return;const nm=N[a[0]][a[1]],s=dot(g,[nm[0]+N[b[0]][b[1]][0]+N[c[0]][c[1]][0],nm[1]+N[b[0]][b[1]][1]+N[c[0]][c[1]][1],nm[2]+N[b[0]][b[1]][2]+N[c[0]][c[1]][2]]);
  if(s>=0){put(...a);put(...b);put(...c);}else{put(...a);put(...c);put(...b);}};
 for(let k=0;k<nk-1;k++)for(let j=0;j<nj-1;j++){tri([k,j],[k+1,j],[k+1,j+1]);tri([k,j],[k+1,j+1],[k,j+1]);}
 return out;}
// a lathe: prof [[r, y, shade], ...] in order, seg round, the arc a0..a0+arc; rad(a,k) and dy(a,k) the per-point radius
// factor and lift (the waves, ribs, pleats and lumps). The outward side is the one the profile's order makes it:
// a profile that runs DOWN and OUT (a cap's top) faces up and out; flip for one that runs up (a stalk's side).
function lathe(out,prof,o){const seg=nz(o.seg,8),arc=nz(o.arc,TAU),a0=nz(o.a0,0),P=[],C=[],U=[],V=[];
 for(let j=0;j<=seg;j++)U.push(j/seg*nz(o.rep,1));
 for(let k=0;k<prof.length;k++){const [r,y,c]=prof[k];P[k]=[];C[k]=[];V.push(nz(prof[k][3],k/(prof.length-1)));
  for(let j=0;j<=seg;j++){const a=a0+arc*j/seg,f=o.rad?o.rad(a,k,j):1,d=o.dy?o.dy(a,k,j):0,sh=o.shade?o.shade(a,k,j):1;
   P[k][j]=[Math.cos(a)*r*f,y+d,Math.sin(a)*r*f];C[k][j]=c*sh;}}
 return grid(out,P,C,U,V,o.flip);}
function make(out){return BIO.geo._make(out.pos,out.nor,out.uv,out.col);}

const F=BIO.fung={};

// ---------------------------------------------------------------- cap
F.cap=function(o){o=o||{};const form=o.form||'dome',h=nz(o.h,.35),seg=nz(o.seg,10),rings=Math.max(1,nz(o.rings,3)),seed=nz(o.seed,0),
 wav=nz(o.wav,0),wavA=nz(o.wavA,.06),ribs=nz(o.ribs,0),ribK=nz(o.ribK,.8),lump=nz(o.lump,0),under=o.under||'gills',out=W();
 const st=o.stem?{h:nz(o.stem.h,.6),r:nz(o.stem.r,.12),seg:nz(o.stem.seg,5),k:nz(o.stem.k,1.5)}:null;if(st)st.r1=nz(o.stem.r1,st.r*.8);
 const y0=st?st.h:0,rs=st?st.r1:nz(o.rIn,.1);
 // the top's profile, from the axis down and out to the rim
 const top=[];for(let k=0;k<=rings;k++){const t=k/rings;let r,y;
  if(form==='disc'){r=t;y=h*(.35+.65*(1-t*t))*.5+h*.25*(1-t);}
  else if(form==='funnel'){r=t;y=h*(.25+.75*Math.pow(t,1.3));}
  else{const ph=t*Math.PI*.5;r=Math.sin(ph);y=h*Math.cos(ph);}
  top.push([r,y0+y,1]);}
 const rimY=top[rings][1];
 const waveAt=a=>(wav?Math.sin(a*wav+seed*.37)*wavA:0),ribAt=j=>ribs?(Math.floor(j*ribs/seg)%2):0;
 const rad=(a,k)=>1+(lump?lump*wob(seed,a,k)*(k/rings):0);
 lathe(out,top,{seg,rad,dy:(a,k,j)=>(waveAt(a)+(ribs&&k?ribAt(j)*h*.12:0))*(k/rings),shade:(a,k,j)=>ribs&&k?(ribAt(j)?ribK:1):1});
 // the underside, from the rim in to the stem
 const ru=rimY-h*.12;
 if(under==='pores'){const poreK=nz(o.poreK,.6),pr=[[1,rimY,poreK],[.55,ru,poreK*.9],[rs,ru-h*.04,poreK*.8]];
  lathe(out,pr,{seg,rad:(a,k)=>k?1:rad(a,rings),dy:(a,k)=>k?0:waveAt(a)});}
 else if(under==='gills'){const n=nz(o.gillN,Math.max(8,seg*2)),gd=nz(o.gillD,.14),gk=nz(o.gillK,.55),P=[],C=[],V=[0,1],U=[];
  for(let g=0;g<n;g++){const a=g/n*TAU,c=Math.cos(a),s=Math.sin(a),R=rad(a,rings)*.97,w=waveAt(a);
   const q=[[[rs*c,ru,rs*s],[R*c,rimY+w-.01,R*s]],[[rs*c,ru-gd,rs*s],[R*c,rimY+w-gd*.25,R*s]]];
   /* one plate: two triangles, both faces (a gill is seen from either side) */
   for(const fl of [false,true])grid(out,q,[[gk,gk],[gk*.8,gk*.8]],[0,1],V,fl);}}
 /* the stem, from under the cap down to the foot (the lathe rule: a profile that runs down faces out) */
 if(st)lathe(out,[[st.r1,ru-h*.02,st.k],[lerp(st.r,st.r1,.5),y0*.5,st.k*.95],[st.r,0,st.k*.85]],{seg:st.seg});
 return make(out);};

// ---------------------------------------------------------------- bracket
F.bracket=function(o){o=o||{};const arc=nz(o.arc,Math.PI),seg=nz(o.seg,8),th=nz(o.thick,.3),dr=nz(o.droop,.15),seed=nz(o.seed,0),
 wav=nz(o.wav,0),wavA=nz(o.wavA,.05),lump=nz(o.lump,0),poreK=nz(o.poreK,.6),lipK=nz(o.lipK,1.15),out=W();
 /* the shelf is a half-lathe about the wall's vertical line: a0 so the arc's middle points +z */
 const a0=Math.PI*.5-arc*.5,rad=(a,k)=>1+(lump?lump*wob(seed,a,k):0),dy=a=>wav?Math.sin(a*wav+seed*.41)*wavA:0;
 const top=[[0,th,1],[.45,th*.85-dr*.3,1],[.85,th*.45-dr*.8,1.05],[1,th*.1-dr,lipK]];
 lathe(out,top,{seg,arc,a0,rad,dy:(a,k)=>dy(a)*k/3});
 const und=[[1,th*.1-dr,lipK],[.8,-dr*.75,poreK],[.35,-dr*.2,poreK*.9],[0,0,poreK*.8]];
 lathe(out,und,{seg,arc,a0,rad:(a,k)=>rad(a,3-k),dy:(a,k)=>dy(a)*(3-k)/3});
 return make(out);};

// ---------------------------------------------------------------- bladder
F.bladder=function(o){o=o||{};const sw=clamp(nz(o.swell,.5),0,1),nk=nz(o.neck,.25),H=nz(o.h,1.4),seg=nz(o.seg,12),rings=Math.max(3,nz(o.rings,6)),
 pl=nz(o.pleats,8),plA=nz(o.pleatA,.08),seed=nz(o.seed,0),lump=nz(o.lump,0),out=W(),prof=[];
 /* from the top (the neck) down to the foot: the belly at a height that rises with the swell */
 const yb=lerp(.3,.5,sw);for(let k=0;k<=rings;k++){const t=1-k/rings;let r;
  if(t>yb){const u=(t-yb)/(1-yb);r=lerp(1,nk,Math.pow(u,lerp(1.8,.9,sw)));}else{const u=t/yb;r=lerp(.18,1,Math.pow(Math.sin(u*Math.PI*.5),lerp(1.4,.6,sw)));}
  prof.push([r,t*H,lerp(.7,1.05,t)]);}
 return make(lathe(out,prof,{seg,rad:(a,k)=>1+(pl?plA*Math.cos(a*pl):0)*Math.sin(k/rings*Math.PI)+(lump?lump*wob(seed,a,k):0),
  shade:(a)=>pl?1-plA*1.5*(1-Math.cos(a*pl))*.5:1}));};

// ---------------------------------------------------------------- pod
F.pod=function(o){o=o||{};const tip=clamp(nz(o.tip,.35),0,1),H=nz(o.h,1.6),seg=nz(o.seg,8),rings=Math.max(3,nz(o.rings,5)),out=W(),prof=[],hang=!!o.hang;
 /* r = sin(PI t^p) / 2: a p under 1 drops the belly and draws the top out to a point */
 const p=lerp(1,.55,tip);for(let k=0;k<=rings;k++){const t=1-k/rings;prof.push([.5*Math.sin(Math.PI*Math.pow(t,p)),t*H,lerp(.8,1.05,t)]);}
 /* hung: the point at the origin, the belly below; the profile still runs down, so it still faces out */
 if(hang)for(const q of prof)q[1]=-(H-q[1]);
 return make(lathe(out,prof,{seg}));};

// ---------------------------------------------------------------- stalk
F.stalk=function(o){o=o||{};const r0=nz(o.r0,.08),r1=nz(o.r1,.05),bend=nz(o.bend,0),ribs=nz(o.ribs,0),ribA=nz(o.ribA,.15),seg=nz(o.seg,6),rings=Math.max(1,nz(o.rings,4)),
 P=[],C=[],U=[],V=[];for(let j=0;j<=seg;j++)U.push(j/seg);
 /* from the top down, so the side faces out (the lathe rule) */
 for(let k=0;k<=rings;k++){const t=1-k/rings,r=lerp(r0,r1,t),cx=bend*t*t;P[k]=[];C[k]=[];V.push(t);
  for(let j=0;j<=seg;j++){const a=j/seg*TAU,f=1+(ribs?ribA*Math.cos(a*ribs):0);P[k][j]=[cx+Math.cos(a)*r*f,t,Math.sin(a)*r*f];C[k][j]=lerp(.8,1,t)*(ribs?1-ribA*(1-Math.cos(a*ribs))*.5:1);}}
 return make(grid(W(),P,C,U,V,false));};

// ---------------------------------------------------------------- fringe
F.fringe=function(o){o=o||{};const n=nz(o.n,3),R=nz(o.r,.6),w=nz(o.w,.25)*.5,out=W();
 for(let i=0;i<n;i++){const a=i/n*TAU+nz(o.a0,.3),cx=Math.cos(a)*R,cz=Math.sin(a)*R;
  for(let s=0;s<2;s++){const b=a+s*Math.PI*.5,ux=Math.cos(b)*w,uz=Math.sin(b)*w,
   q=[[[cx-ux,0,cz-uz],[cx+ux,0,cz+uz]],[[cx-ux,-1,cz-uz],[cx+ux,-1,cz+uz]]];
   for(const fl of [false,true])grid(out,q,[[1,1],[.85,.85]],[0,1],[0,1],fl);}}
 return make(out);};

// ---------------------------------------------------------------- comb
F.comb=function(o){o=o||{};const w=nz(o.w,1),d=nz(o.d,.45),tilt=nz(o.tilt,.25),lobes=nz(o.lobes,3),seg=Math.max(2,nz(o.seg,6)),out=W();
 for(const side of [1,-1]){const P=[[],[]],C=[[],[]],U=[],V=[0,1];
  for(let j=0;j<=seg;j++){const t=j/seg,x=side*w*t,lift=Math.tan(tilt)*w*t,lb=1-.3*Math.abs(Math.sin(t*lobes*Math.PI)),dz=d*.5*lb*(1-.35*t*t);
   U.push(t);P[0].push([x,lift,-dz]);P[1].push([x,lift,dz]);C[0].push(lerp(.75,1,t));C[1].push(lerp(.75,1,t));}
  for(const fl of [false,true])grid(out,P,C,U,V,fl);}
 return make(out);};

// ---------------------------------------------------------------- tube
F.tube=function(o){o=o||{};const n=nz(o.n,5),R=nz(o.r,.12),hMin=nz(o.hMin,.4),sp=nz(o.spread,.3),seg=nz(o.seg,6),rimK=nz(o.rimK,1.6),inK=nz(o.inK,.45),seed=nz(o.seed,0),out=W();
 for(let i=0;i<n;i++){const u=KRAND.unit(KRAND.hash(seed,i,0x7B)),v=KRAND.unit(KRAND.hash(seed,i,0x7C)),a=v*TAU,d=i?sp*Math.sqrt(u):0,
  cx=Math.cos(a)*d,cz=Math.sin(a)*d,h=i?lerp(hMin,.95,KRAND.unit(KRAND.hash(seed,i,0x7D))):1,r=R*lerp(.7,1.1,u),off=[cx,0,cz];
  const side=[[r*1.05,h,rimK],[r,h*.92,1],[r*.92,h*.4,.9],[r*.95,0,.75]],inside=[[r*.8,h*.6,inK*.7],[r*.85,h,inK]];
  const a1=out.pos.length;lathe(out,side,{seg});lathe(out,inside,{seg});
  for(let k=a1;k<out.pos.length;k+=3){out.pos[k]+=off[0];out.pos[k+2]+=off[2];}}
 return make(out);};

// ---------------------------------------------------------------- crust
F.crust=function(o){o=o||{};const lobes=nz(o.lobes,5),la=nz(o.lobeA,.3),seg=nz(o.seg,16),rings=Math.max(1,nz(o.rings,2)),seed=nz(o.seed,0),ck=nz(o.crustK,.85),prof=[];
 for(let k=0;k<=rings;k++){const t=k/rings;prof.push([t,.01,lerp(ck,1,t)]);}
 return make(lathe(W(),prof,{seg,rad:(a,k)=>k?1-la*.5+la*.5*Math.cos(a*lobes+seed*.53)+la*.3*wob(seed,a,1):1}));};

// ---------------------------------------------------------------- layout (records only)
// a quaternion [x,y,z,w]: a yaw about +y, then tilts about x and z (the kits' qEuler(tx, yaw, tz) for small tilts)
function qmul(a,b){return[a[3]*b[0]+a[0]*b[3]+a[1]*b[2]-a[2]*b[1],a[3]*b[1]-a[0]*b[2]+a[1]*b[3]+a[2]*b[0],a[3]*b[2]+a[0]*b[1]-a[1]*b[0]+a[2]*b[3],a[3]*b[3]-a[0]*b[0]-a[1]*b[1]-a[2]*b[2]];}
const qAx=(ax,t)=>{const s=Math.sin(t/2);return[ax[0]*s,ax[1]*s,ax[2]*s,Math.cos(t/2)];};
const qYT=(yaw,tx,tz)=>qmul(qmul(qAx([0,1,0],yaw),qAx([1,0,0],tx||0)),qAx([0,0,1],tz||0));
// the rotation taking +y to dir (shortest arc), then yaw about dir
function qTo(dir,yaw){const d=norm(dir),c=d[1];let q;
 if(c>1-1e-9)q=[0,0,0,1];else if(c<-1+1e-9)q=[1,0,0,0];else{const ax=norm([d[2],0,-d[0]]);q=qAx(ax,Math.acos(c));}
 return yaw?qmul(q,qAx([0,1,0],yaw)):q;}
const H=(seed,i,k,salt)=>KRAND.unit(KRAND.hash(seed>>>0,i|0,k|0,salt|0));
const rng2=(r,u)=>Array.isArray(r)?lerp(r[0],r[1],u):r;
F.qYT=qYT;F.qTo=qTo;F.qmul=qmul;

F.troop=function(o){o=o||{};const n=nz(o.n,5),R=nz(o.r,1),seed=nz(o.seed,0),salt=nz(o.salt,0x5EED),size=nz(o.size,[.08,.24]),flat=nz(o.flat,[1,1]),tilt=nz(o.tilt,.1),at=nz(o.at,[0,0,0]),out=[];
 for(let i=0;i<n;i++){const a=H(seed,i,1,salt)*TAU,d=i?R*Math.sqrt(H(seed,i,2,salt)):R*.15*H(seed,i,2,salt),x=at[0]+Math.cos(a)*d,z=at[2]+Math.sin(a)*d,
  s=rng2(size,H(seed,i,3,salt)),fy=rng2(flat,H(seed,i,4,salt)),y=o.ground?o.ground(x,z):at[1];
  out.push({p:[x,y,z],q:qYT(H(seed,i,5,salt)*TAU,(H(seed,i,6,salt)*2-1)*tilt,(H(seed,i,7,salt)*2-1)*tilt),s:[s,s*fy,s],i,u:H(seed,i,8,salt)});}
 return out;};

F.shelves=function(o){o=o||{};const at=nz(o.at,[0,0,0]),nn=norm([nz(o.n,[0,0,1])[0],0,nz(o.n,[0,0,1])[2]]),rows=nz(o.rows,3),per=nz(o.per,2),dy=nz(o.dy,.3),sp=nz(o.spread,.35),
 size=nz(o.size,[.15,.4]),th=nz(o.thick,.4),seed=nz(o.seed,0),salt=nz(o.salt,0x5E1F),out=[];
 /* the bracket's +z to the face's normal: a yaw about +y */
 const yaw=Math.atan2(nn[0],nn[2]),side=[nn[2],0,-nn[0]];let i=0;
 for(let r=0;r<rows;r++)for(let c=0;c<per;c++,i++){const u=H(seed,i,1,salt),s=rng2(size,H(seed,i,2,salt))*lerp(1,.75,rows>1?r/(rows-1):0),
  x=(per>1?(c/(per-1)-.5)*2:0)*sp+(u-.5)*sp*.5,y=r*dy+(H(seed,i,3,salt)-.5)*dy*.4;
  out.push({p:[at[0]+side[0]*x+nn[0]*.02,at[1]+y,at[2]+side[2]*x+nn[2]*.02],q:qYT(yaw+(H(seed,i,4,salt)-.5)*.5,(H(seed,i,5,salt)-.5)*.3,0),s:[s,s*th,s],i,u:H(seed,i,6,salt)});}
 return out;};

F.pods=function(o){o=o||{};const at=nz(o.at,[0,0,0]),n=nz(o.n,5),R=nz(o.r,.3),size=nz(o.size,[.1,.25]),tilt=nz(o.tilt,.35),seed=nz(o.seed,0),salt=nz(o.salt,0x90D5),out=[];
 for(let i=0;i<n;i++){const a=H(seed,i,1,salt)*TAU,d=R*Math.sqrt(H(seed,i,2,salt)),s=rng2(size,H(seed,i,3,salt)),t=H(seed,i,4,salt)*tilt;
  /* each pod leans out from the cluster's centre, the way a bunch splays */
  out.push({p:[at[0]+Math.cos(a)*d,at[1]+(o.hang?-1:1)*H(seed,i,5,salt)*R*.3,at[2]+Math.sin(a)*d],q:qTo([Math.cos(a)*Math.sin(t),Math.cos(t),Math.sin(a)*Math.sin(t)],H(seed,i,6,salt)*TAU),s:[s,s,s],i,u:H(seed,i,7,salt)});}
 return out;};

F.combs=function(o){o=o||{};const a=nz(o.a,[0,0,0]),b=nz(o.b,[0,1,0]),n=nz(o.n,4),t0=nz(o.t0,.3),t1=nz(o.t1,.95),turn=nz(o.turn,Math.PI/2),size=nz(o.size,[.6,.3]),seed=nz(o.seed,0),salt=nz(o.salt,0xC0B),
 dir=sub(b,a),out=[];
 for(let i=0;i<n;i++){const t=n>1?lerp(t0,t1,i/(n-1)):t0,s=rng2(size,n>1?i/(n-1):0)*lerp(.9,1.1,H(seed,i,1,salt));
  out.push({p:[a[0]+dir[0]*t,a[1]+dir[1]*t,a[2]+dir[2]*t],q:qTo(dir,i*turn+(H(seed,i,2,salt)-.5)*.3),s:[s,s,s],i,u:H(seed,i,3,salt)});}
 return out;};

// ---------------------------------------------------------------- the host side of a layout
F.Q=function(q){const T=BIO.host.THREE;return new T.Quaternion(q[0],q[1],q[2],q[3]);};
F.put=function(name,recs,col,at){const T=BIO.host.THREE,o=at||[0,0,0];let n=0;
 for(const r of recs){const c=typeof col==='function'?col(r):Array.isArray(col)?col[Math.floor(r.u*col.length)%col.length]:col;
  BIO.put(name,[r.p[0]+o[0],r.p[1]+o[1],r.p[2]+o[2]],F.Q(r.q),r.s,c==null?null:(c.isColor?c:new T.Color(c)));n++;}
 return n;};
})();
