/* ================================================================= SCRAP XANADU: the vocabulary (prefix xnXS)
   Local frame as in the whole kit: origin at the plot centre on the ground, +z the front, y up, metres. A face frame
   (x,z,ry) is a point on a wall's surface with ry its outward direction (72-xa-helpers.js).
   The rules the helpers keep (kits/xanadu/PLAN-SCRAP.md section 1): a shell panel is laid WHOLE, in a course, with a
   shadow joint round it; windows take whole cells of the course grid, centred on the face; every girder is dressed
   (painted shaft, bronze collars, a bracket capital); every cable is taut between posts under a bronze rail.

     xnXSBlock(x,y,z,w,h,d,ry,o) -> top     a block faced in panel courses on a dark core, storey bands of bronze, girder
                                             quoins; windows in whole cells (o.win {rows, every, from, faces, skip, kind,
                                             arch}), a door's cells left open (o.door {f, half, from, rows}, or a list)
     xnXSWin(x,y,z,ry,w,h,o)                 a window: glass over the room card, a bronze jali grid, a stepped (cholet)
                                             frame in two paints, or a pointed hood (o.arch)
     xnXSCol(x,y,z,h,ry,o)                   a dressed girder column: base plate, painted shaft, collars, bracket capital
                                             (o.cap false: a post under a plain bronze cap)
     xnXSBeam(a,b,y,o)                       a girder lintel from local [x,z] a to b, its top at y
     xnXSRail(a,b,y,o)                       a cable balustrade on the level y: girder posts, three cables, a bronze rail
     xnXSLantern(x,y,z,r,h,o) -> top         a glazed clerestory drum (lit or dim inside), its bronze mullions and rings;
                                             o.dome 'glass' | 'verd' | 'panel' crowns it (xnXSDome)
     xnXSDome(x,y,z,r,kind,o) -> tip         a dome on bronze ribs and a finial
     xnXSFinial(x,y,z,s,c)                   a bronze crown: plate, bulb, ball, spike
     xnXSWheel(x,y,z,ry,r,c)                 the eight-spoked Wheel (the Decree's sign, LORE 6.13) in bronze
     xnXSDrumFace(x,y,z,r,h,o)               a drum (a tower) faced in courses of curved-set panels, glazed strips (o.glaze)
     xnXSPool(x,y,z,w,d,ry,o)                a pool in a surround of two glazed tiles in waves; its water the kit's xWaterB
   Per-panel variation is core/rand's hash of (the building's seed, face, column, row): never the draw order. */

const XS={bronze:0xc0904c,bronzeD:0x8a5c2c,joint:0x2a2624,cable:0x2c2e32,room:0xf2c47a,stone:0xb8b0a0};
/* the paint schemes, one per variant: a = the field (the Ancients' own white), b = the course's second paint, frame the
   cholet frames, steel the girders' paint (the owner's references: Casa Vicens; the cholets; the lapis city) */
const XS_SCHEMES=[
 {a:0xf4f2ec,b:0x2f8a6a,c:0xb8322a,frame:[0xb8322a,0x2f8a6a],steel:0x2f6a56,awn:0xb8322a,tile:[0x2a4aa0,0xf4efe4]},
 {a:0xf4f2ec,b:0x2a4aa0,c:0xe8a030,frame:[0xe8a030,0x2a4aa0],steel:0x23386e,awn:0xe8a030,tile:[0x2aa5a0,0x1e3f8a]},
 {a:0xf2ece0,b:0xa8382a,c:0x2aa5a0,frame:[0x2aa5a0,0xa8382a],steel:0x6e2a2a,awn:0x2aa5a0,tile:[0x1e3f8a,0xf4efe4]}];
const XS_YAW=[0,Math.PI/2,Math.PI,-Math.PI/2];   /* a block's faces: front, right, back, left */
let XS_SEED=33000;                                 /* the running building's seed (each builder sets it) */
const xsS=v=>XS_SCHEMES[((v|0)%3+3)%3];
/* core/rand where the page carries it (the sheet does; kit_bundle.bundle(scrap=True) adds it), else the reseeded stream */
function xsU(a,b,c){return typeof KRAND!=='undefined'?KRAND.unit(KRAND.hash(XS_SEED,a|0,b|0,c|0)):rng();}
/* a face's centre, for face f of a w x d block centred at (x,z) */
function xsFace(x,z,w,d,ry,f){return f===0?loc(x,z,0,d/2,ry):f===1?loc(x,z,w/2,0,ry):f===2?loc(x,z,0,-d/2,ry):loc(x,z,-w/2,0,ry);}
/* the paint of a panel in a course pattern */
function xsPat(pat,i,j,S,nx,rs){const a=S.a,b=S.b;
 if(pat==='checker')return(i+j)%2?b:a;
 if(pat==='band')return j%rs===rs-1?b:a;
 if(pat==='stripe')return i%3===1?b:a;
 if(pat==='diamond')return(i+j)%4===0||(i-j+400)%4===0?b:a;
 if(pat==='quoin')return(i===0||i===nx-1)&&j%2===0?b:a;
 return a;}

function xnXSBlock(x,y,z,w,h,d,ry,o){o=o||{};const S=o.S||XS_SCHEMES[0],item=o.item||'xsPanel';
 const sh=o.sh==null?3:o.sh,ns=Math.max(1,Math.round(h/sh)),rs=o.rs==null?4:o.rs,ph=h/(ns*rs),t=o.t==null?.08:o.t,gap=o.gap==null?.05:o.gap,pw0=o.pw==null?1.5:o.pw;
 vB('xPaint',x,y,z,w-.02,h,d-.02,ry,xC(XS.joint));   /* the core: every joint reads as a shadow line */
 const W=o.win,br=xC(XS.bronze),faces=o.faces||[0,1,2,3],DR=o.door?[].concat(o.door):[];   /* o.door: {f, half, from, rows} or a list: those cells left open */
 for(const f of faces){const fw=f%2?d:w+2*t,fy=ry+XS_YAW[f],c=xsFace(x,z,w,d,ry,f);let nx=Math.max(1,Math.round(fw/pw0));if(nx%2===0)nx+=1;const pw=fw/nx,mid=(nx-1)/2;
  const wf=W&&(!W.faces||W.faces.indexOf(f)>=0),every=W?(W.every==null?2:W.every):2,rows=W?(W.rows||[1,2]):[];
  for(let i=0;i<nx;i++){const u=-fw/2+pw*(i+.5);
   for(let j=0;j<ns*rs;j++){const s=Math.floor(j/rs),r=j%rs;
    const isDoor=DR.some(q=>f===(q.f==null?0:q.f)&&j>=(q.from==null?0:q.from)&&j<(q.from==null?0:q.from)+(q.rows==null?3:q.rows)&&Math.abs(i-mid)<=(q.half==null?0:q.half));
    const isWin=!isDoor&&wf&&s>=(W.from==null?0:W.from)&&rows.indexOf(r)>=0&&i>0&&i<nx-1&&Math.abs(i-mid)%every===0&&!(W.skip&&W.skip(f,i,s));
    if(isDoor)continue;
    if(isWin){if(r===rows[0]){const p=loc(c[0],c[1],u,0,fy);xnXSWin(p[0],y+j*ph+gap/2,p[1],fy,pw-gap,ph*rows.length-gap,{S,kind:W.kind,arch:W.arch,lit:o.lit});}continue;}
    const p=loc(c[0],c[1],u,t/2,fy),col=xC(xsPat(o.pat,i,j,S,nx,rs)).multiplyScalar(.93+.1*xsU(f,i,j));
    vB(item,p[0],y+j*ph+gap/2,p[1],pw-gap,ph-gap,t,fy,col);}}}
 for(let s=1;s<ns;s++)vB('xsBronzeB',x,y+s*h/ns-.05,z,w+2*t+.06,.1,d+2*t+.06,ry,br);   /* the storey bands */
 if(o.quoins!==false){const st=xC(S.steel);for(const sx of[-1,1])for(const sz of[-1,1]){const p=loc(x,z,sx*(w/2+t),sz*(d/2+t),ry);kput('xsGirder',[p[0],y+h/2,p[1]],qEuler(0,ry+Math.PI/4,0),[.28,h,.28],st);}}
 return y+h;}

function xnXSWin(x,y,z,ry,w,h,o){o=o||{};const S=o.S||XS_SCHEMES[0],br=xC(XS.bronze),kind=o.kind||(o.lit?'lit':'glass');
 xnPane(x,y+.05,z,w-.1,h-.1,.16,ry,kind);
 const nv=Math.max(1,Math.round(w/.34)),nh=Math.max(1,Math.round(h/.34));   /* the jali: a grid of small panes in bronze */
 for(let k=1;k<nv;k++){const p=loc(x,z,-w/2+w*k/nv,.1,ry);vB('xsBronzeB',p[0],y,p[1],.035,h,.03,ry,br);}
 for(let k=1;k<nh;k++){const p=loc(x,z,0,.1,ry);vB('xsBronzeB',p[0],y+h*k/nh-.0175,p[1],w,.035,.03,ry,br);}
 const c1=xC(S.frame[0]),c2=xC(S.frame[1]);
 for(const s of[-1,1]){const p=loc(x,z,s*(w/2+.07),.09,ry);vB('xPaint',p[0],y-.14,p[1],.14,h+.28,.12,ry,c1);
  const q=loc(x,z,s*(w/2+.24),.07,ry);vB('xPaint',q[0],y-.3,q[1],.14,h+.5,.1,ry,c2);}
 const m=loc(x,z,0,.09,ry),n=loc(x,z,0,.07,ry);
 vB('xPaint',m[0],y-.14,m[1],w+.28,.14,.12,ry,c1);vB('xPaint',m[0],y+h,m[1],w+.28,.14,.12,ry,c1);
 vB('xPaint',n[0],y-.3,n[1],w+.62,.14,.1,ry,c2);
 if(o.arch){kput('xArcP',[m[0],y+h+.14,m[1]],qEuler(0,ry,0),[w+.62,Math.min(1.1,w*.6),.12],c2);vBall('xsBall',m[0],y+h+.18+Math.min(1.1,w*.6),m[1],.09,br);}
 else{vB('xPaint',n[0],y+h+.14,n[1],w+.9,.16,.1,ry,c2);vB('xPaint',n[0],y+h+.3,n[1],w*.62,.14,.1,ry,c2);vB('xPaint',n[0],y+h+.44,n[1],w*.3,.12,.1,ry,c1);}}   /* the stepped cholet crest */

function xnXSCol(x,y,z,h,ry,o){o=o||{};const S=o.S||XS_SCHEMES[0],c=o.c||xC(S.steel),br=xC(XS.bronze),s=o.s==null?.32:o.s;
 vB('xsBronzeB',x,y,z,s*1.7,.14,s*1.7,ry,br);const L=h-.62;
 kput('xsGirder',[x,y+.14+L/2,z],qEuler(0,ry,0),[s,L,s],c);
 for(const k of[.3,.62])vB('xsBronzeB',x,y+.14+L*k,z,s*1.18,.12,s*1.18,ry,br);
 if(o.cap===false){vB('xsBronzeB',x,y+h-.14,z,s*1.4,.14,s*1.4,ry,br);return;}   /* a post: a plain bronze cap */
 for(const sd of[-1,1]){const p=loc(x,z,sd*s*.5,0,ry);xnBracket(p[0],y+h-.14,p[1],ry+sd*Math.PI/2,.55,.46,s*.8,c,'xArm');}
 vB('xsBronzeB',x,y+h-.14,z,s*3,.14,s*1.4,ry,br);}

function xnXSBeam(a,b,y,o){o=o||{};const S=o.S||XS_SCHEMES[0],dx=b[0]-a[0],dz=b[1]-a[1],L=Math.hypot(dx,dz),hh=o.h==null?.42:o.h;
 kput('xsGirderX',[(a[0]+b[0])/2,y-hh/2,(a[1]+b[1])/2],qEuler(0,Math.atan2(-dz,dx),0),[L,hh,o.w==null?.3:o.w],o.c||xC(S.steel));}

function xnXSRail(a,b,y,o){o=o||{};const S=o.S||XS_SCHEMES[0],dx=b[0]-a[0],dz=b[1]-a[1],L=Math.hypot(dx,dz),n=Math.max(1,Math.round(L/1.6)),yaw=Math.atan2(-dz,dx);
 const st=xC(S.steel),cab=xC(XS.cable),br=xC(XS.bronze);
 for(let k=0;k<=n;k++){const t=k/n;kput('xsGirder',[a[0]+dx*t,y+.5,a[1]+dz*t],qEuler(0,yaw,0),[.09,1,.09],st);}
 for(const hh of[.34,.66])beam('xsCable',[a[0],y+hh,a[1]],[b[0],y+hh,b[1]],.012,.012,cab);
 beam('xsBronzeB',[a[0],y+1.03,a[1]],[b[0],y+1.03,b[1]],.07,.05,br);}

function xnXSLantern(x,y,z,r,h,o){o=o||{};const n=(o.n==null?8:o.n),br=xC(XS.bronze),ap=Math.PI/n;
 kput('xOctP',[x,y,z],null,[r*.82,h,r*.82],o.lit?xC(XS.room):IZ_ROOMC);   /* the room inside: lit, or the room's dim colour */
 for(let k=0;k<n;k++){const a=k*TAU/n;vB('xsGlassB',x+Math.sin(a)*r,y,z+Math.cos(a)*r,2*r*Math.tan(ap)-.08,h,.05,a);
  vB('xsBronzeB',x+Math.sin(a)*r*1.01,y+h*.55,z+Math.cos(a)*r*1.01,2*r*Math.tan(ap),.05,.06,a,br);
  const b=a+ap,rc=r/Math.cos(ap);vPst('xsBronzeC',x+Math.sin(b)*rc,y,z+Math.cos(b)*rc,.06,h,br);}
 kput('xsBronzeOct',[x,y-.14,z],qEuler(0,ap,0),[r*1.1,.16,r*1.1],br);kput('xsBronzeOct',[x,y+h,z],qEuler(0,ap,0),[r*1.12,.16,r*1.12],br);
 if(o.dome)return xnXSDome(x,y+h+.16,z,r*1.04,o.dome,o);
 return y+h+.16;}

const XS_RIB=[[1,0],[1.12,.26],[.92,.62],[.38,.9],[0,1]];   /* XDOME's profile, read at its turns */
function xnXSDome(x,y,z,r,kind,o){o=o||{};const H=r*(o.rise==null?.95:o.rise),br=xC(XS.bronze),n=o.ribs!=null?o.ribs:o.n!=null?o.n:8;
 const it=kind==='glass'?'xsGlassDome':kind==='verd'?'xsDomeV':'xsDomeW';
 kput(it,[x,y,z],null,[r,H,r],kind==='panel'?xC((o.S||XS_SCHEMES[0]).a):null);
 if(kind==='glass')kput('xOctP',[x,y,z],null,[r*.5,H*.5,r*.5],o.lit?xC(XS.room):IZ_ROOMC);
 for(let k=0;k<n;k++){const a=k*TAU/n,P=XS_RIB.map(q=>[x+Math.sin(a)*r*1.01*q[0],y+H*q[1],z+Math.cos(a)*r*1.01*q[0]]);
  for(let i=0;i<P.length-1;i++)beam('xsBronzeB',P[i],P[i+1],.08,.06,br);}
 kput('xsRing',[x,y+H*.26,z],qEuler(Math.PI/2,0,0),[r*1.13,r*1.13,r*1.13],br);
 if(o.wheel)xnXSWheel(x,y+H+r*.32+.6,z,(o.wheelRy==null?0:o.wheelRy),r*.32+.2,br);else xnXSFinial(x,y+H-.02,z,o.fin==null?Math.max(.8,r*.4):o.fin,br);
 return y+H;}

function xnXSFinial(x,y,z,s,c){c=c||xC(XS.bronze);kput('xsBronzeOct',[x,y,z],null,[s*.3,s*.12,s*.3],c);kput('xsBulbB',[x,y+s*.12,z],null,[s*.22,s*.42,s*.22],c);
 vBall('xsBall',x,y+s*.62,z,s*.1,c);kput('xsConeB',[x,y+s*.68,z],null,[s*.05,s*.6,s*.05],c);}

function xnXSWheel(x,y,z,ry,r,c){c=c||xC(XS.bronze);kput('xsRing',[x,y,z],qEuler(0,ry,0),[r,r,r*2.5],c);
 for(let k=0;k<8;k++){const a=k*Math.PI/4,p=loc(x,z,Math.sin(a)*r*.96,0,ry);beam('xsBronzeB',[x,y,z],[p[0],y+Math.cos(a)*r*.96,p[1]],.07,.05,c);
  const q=loc(x,z,Math.sin(a)*r*1.12,0,ry);vBall('xsBall',q[0],y+Math.cos(a)*r*1.12,q[1],r*.07,c);}
 vBall('xPaintBall',x,y,z,r*.18,xC(XPAL.maroon[0]));const h=loc(x,z,0,.06,ry);vBall('xsBall',h[0],y,h[1],r*.1,xC(XPAL.saffron));
 vPst('xsBronzeC',x,y-r*1.6,z,.07,r*.6,c);}

function xnXSDrumFace(x,y,z,r,h,o){o=o||{};const S=o.S||XS_SCHEMES[0],item=o.item||'xsPanelV',t=.08,gap=.05,br=xC(XS.bronze);
 const n=Math.max(8,Math.round(TAU*r/(o.pw==null?1.3:o.pw))),rs=o.rs==null?4:o.rs,ns=Math.max(1,Math.round(h/(o.sh==null?3:o.sh))),ph=h/(ns*rs),cw=TAU*r/n;
 kput('xDrumS',[x,y,z],null,[r-.02,h,r-.02],xC(XS.joint));
 const gl=o.glaze||[];
 for(let i=0;i<n;i++){const a=i*TAU/n;const isG=gl.some(g=>Math.abs(((a-g+Math.PI)%TAU+TAU)%TAU-Math.PI)<TAU/n*.6);
  if(isG){const p=[x+Math.sin(a)*r,z+Math.cos(a)*r];xnPane(p[0],y+.6,p[1],cw-.12,h-1.2,.2,a,o.lit?'lit':'glass');
   for(let k=1;k<Math.round((h-1.2)/.6);k++){const q=[x+Math.sin(a)*(r+.11),z+Math.cos(a)*(r+.11)];vB('xsBronzeB',q[0],y+.6+k*.6,q[1],cw-.12,.04,.03,a,br);}
   for(const s of[-1,1]){const b=a+s*cw/(2*r);vB('xsBronzeB',x+Math.sin(b)*(r+.06),y+.4,z+Math.cos(b)*(r+.06),.12,h-.8,.12,b,br);}continue;}
  for(let j=0;j<ns*rs;j++){const p=[x+Math.sin(a)*(r+t/2),z+Math.cos(a)*(r+t/2)];
   const col=o.pat?xC(xsPat(o.pat,i,j,S,n,rs)).multiplyScalar(.93+.1*xsU(9,i,j)):xC(0xffffff).multiplyScalar(.9+.14*xsU(9,i,j));
   vB(item,p[0],y+j*ph+gap/2,p[1],cw-gap,ph-gap,t,a,col);}}
 for(let s=0;s<=ns;s++)kput('xsRing',[x,y+s*h/ns,z],qEuler(Math.PI/2,0,0),[r+.12,r+.12,r*2],br);   /* the bronze bands */
 return y+h;}

function xnXSPool(x,y,z,w,d,ry,o){o=o||{};const S=o.S||XS_SCHEMES[0],c0=xC(S.tile[0]),c1=xC(S.tile[1]),e=1.3,W=w+2*e,D=d+2*e;
 const n=Math.max(6,Math.round(D/.5));
 for(let k=0;k<n;k++){const lz=-D/2+D*(k+.5)/n;   /* the surround: bands of two glazed tiles, each set a little sideways like a swell */
  const sw=Math.sin(k*1.1)*.5,p=loc(x,z,sw*.3,lz,ry);vB('xPaint',p[0],y,p[1],W-Math.abs(sw)*.6,.05,D/n+.01,ry,k%2?c1:c0);}
 for(const s of[-1,1]){const p=loc(x,z,0,s*(d/2+.15),ry),q=loc(x,z,s*(w/2+.15),0,ry);vB('xPaint',p[0],y,p[1],w+.6,.36,.3,ry,c0);vB('xPaint',q[0],y,q[1],.3,.36,d,ry,c0);}
 vB('xWaterB',x,y+.04,z,w,.26,d,ry,xC(XPAL.water));}   /* the water: the kit's still water (core/water on the sheet: 90-xa-still.js) */
