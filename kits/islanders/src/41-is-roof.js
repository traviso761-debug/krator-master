// prefix: is
// ================================================================= ROOFS: the West's horned saddle, the East's spire, plain gables and hips
// A roof is a parametric surface f(u,v) -> [x,y,z] (u along, v up the slope) drawn as a SHELL: the top sheet, the underside a
// thickness below it, and the edges, so the thatch reads thick from the street. A roof may be PATCHED: o.patch (0..1) is the
// share of its tiles drawn in scrap (corrugated iron, worn iron, tin) instead of its own material, seeded, so a poor house
// is thatch mended with iron, and o.patch 1 is a whole iron roof.
//   isSaddle(o)  the West: a ridge along x that sags in the middle and sweeps up into horns at both ends (o.hornRise,
//                o.hornOut); o.taper draws the eave in to the ridge at the tips (1: the Minangkabau gonjong, a spike; 0: an
//                open gable, Batak and Toraja); returns {F(s), gable(x, wallTop, hw, mk, o)} for the gable panels
//   isSpire(o)   the East: a rounded-rectangle hip whose profile is a list of [sx, sz, y] (scale of the eave's half-width and
//                half-depth, height): a wide low skirt, then a tall steep tower that ends in a short ridge (Sumba)
//   isHip(o)     a plain hip or pyramid (isSpire with two rings); isGabled(o) a plain straight gable (isSaddle with no sag)
const IS_SCRAP=['corr','corrW','corr','tin'];
/* the material of tile (i,j) of a patched roof: its own, or scrap for a seeded share */
function isPatchMk(mk,patch,salt){return (i,j)=>{if(!patch)return mk;if(patch>=1)return (i*7+j*3+salt)%5===0?'corrW':'corr';const h=h3(i*13.1+salt,j*7.7,salt*.37);return h<patch?IS_SCRAP[Math.floor(h3(i,j,salt+9)*4)%4]:mk;};}
/* would psurf's normal at the middle of f point the way `want(p, n)` asks? (psurf's facing follows the parameterisation) */
function isFlipFor(f,want){const p=f(.5,.5),a=f(.52,.5),b=f(.48,.5),c=f(.5,.52),d=f(.5,.48);const du=[a[0]-b[0],a[1]-b[1],a[2]-b[2]],dv=[c[0]-d[0],c[1]-d[1],c[2]-d[2]];
 const n=[du[1]*dv[2]-du[2]*dv[1],du[2]*dv[0]-du[0]*dv[2],du[0]*dv[1]-du[1]*dv[0]];return !want(p,n);}
/* a sheet over f, split into tiles when o.mkf picks a material per tile (patching) */
function isSheet(mk,f,nu,nv,col,o){o=o||{};const tu=o.tiles?o.tiles[0]:1,tv=o.tiles?o.tiles[1]:1;
 for(let i=0;i<tu;i++)for(let j=0;j<tv;j++){const u0=i/tu,u1=(i+1)/tu,v0=j/tv,v1=(j+1)/tv,m=o.mkf?o.mkf(i,j):mk;
  const g=(u,v)=>f(u0+(u1-u0)*u,v0+(v1-v0)*v);const sc=m!==mk&&o.scrapCol?o.scrapCol:col;
  psurf(m,g,Math.max(1,Math.round(nu/tu)),Math.max(1,Math.round(nv/tv)),m!==mk?P(m==='tin'?'tin':'rust'):sc,{flip:o.flip,colf:m===mk?o.colf:null});}}
/* a SHELL: the top sheet facing out (want), the underside th below it facing in, the edges round it */
function isShell(mk,f,nu,nv,col,th,o){o=o||{};const want=o.want||((p,n)=>n[1]>0);const inner=(u,v)=>{const p=f(u,v);return [p[0]*(o.shrink?1-th*o.shrink:1),p[1]-th,p[2]*(o.shrink?1-th*o.shrink:1)];};
 const fo=isFlipFor(f,want),fi=isFlipFor(inner,(p,n)=>!want(p,n));
 isSheet(mk,f,nu,nv,col,Object.assign({},o,{flip:fo}));isSheet(o.underMk||mk,inner,nu,nv,o.underCol||col,Object.assign({},o,{flip:fi,mkf:o.underMk?null:o.mkf}));
 const edge=(g,n)=>{psurf(mk,g,n,1,col);psurf(mk,g,n,1,col,{flip:true});};
 for(const e of o.edges||['v0','u0','u1']){if(e==='v0')edge((u,t)=>{const a=f(u,0),b=inner(u,0);return [lerp(a[0],b[0],t),lerp(a[1],b[1],t),lerp(a[2],b[2],t)];},nu);
  else if(e==='v1')edge((u,t)=>{const a=f(u,1),b=inner(u,1);return [lerp(a[0],b[0],t),lerp(a[1],b[1],t),lerp(a[2],b[2],t)];},nu);
  else{const uu=e==='u0'?0:1;edge((v,t)=>{const a=f(uu,v),b=inner(uu,v);return [lerp(a[0],b[0],t),lerp(a[1],b[1],t),lerp(a[2],b[2],t)];},nv);}}}
/* ---------------------------------------------------------------- the West's saddle roof */
/* o: L (the ridge's length between the gables), W (the house's depth, z), eaveY, ridgeY, over (eave overhang), sag (the ridge's
   dip at the middle), hornRise, hornOut (the tips' rise and reach past L/2), p (how late the sweep starts: 3..6), taper (0..1),
   eaveSag, eaveRise (the eave line's own curve), concave (the slope's hollow), th, mk, col, patch, nu, nv, lean (the gable
   lean, for the panels) */
function isSaddle(o){const L=o.L,Wd=o.W,ov=o.over===undefined?.7:o.over,eY=o.eaveY,rY=o.ridgeY,sag=o.sag||0,hR=o.hornRise||0,hO=o.hornOut||0,pw=o.p||4,tp=o.taper||0,
  eS=o.eaveSag===undefined?sag*.6:o.eaveSag,eR=o.eaveRise===undefined?hR*.45:o.eaveRise,cv=o.concave===undefined?.25:o.concave,th=o.th||.28,mk=o.mk||'thatch',col=o.col||P('thatchW');
 const R=u=>{const a=Math.abs(u);return [u*(L/2+hO*Math.pow(a,3)),rY-sag*(1-u*u)+hR*Math.pow(a,pw),0];};
 const E=(u,s)=>{const a=Math.abs(u),r=R(u),f=tp*Math.pow(a,o.tq||4);return [u*(L/2+ov+hO*Math.pow(a,3)),lerp(eY-eS*(1-u*u)+eR*Math.pow(a,pw),r[1],f),lerp(s*(Wd/2+ov),0,f)];};
 const F=s=>(u,v)=>{const uu=u*2-1,e=E(uu,s),r=R(uu);return [lerp(e[0],r[0],v),lerp(e[1],r[1],v)-cv*Math.sin(PI*v)*(1-Math.pow(Math.abs(uu),4)),lerp(e[2],r[2],v)];};
 const nu=o.nu||30,nv=o.nv||6,tl=o.tiles||[6,2];
 for(const s of [-1,1])isShell(mk,F(s),nu,nv,col,th,{mkf:isPatchMk(mk,o.patch,s>0?3:11),tiles:o.patch?tl:null,edges:['v0','u0','u1'],underCol:o.underCol});
 /* the ridge cap: a roll along the ridge line, o.cap false for none */
 if(o.cap!==false){const pts=[];for(let i=0;i<=nu;i++)pts.push(R(i/nu*2-1));tube(o.capMk||mk,t=>{const q=R(t*2-1);return [q[0],q[1]+.02,0];},t=>[th*.7,th*.7],nu,6,o.capCol||col);}
 /* the gable panel at x = gx under this roof: from the wall top (wallTop) across the house (half-width hw) up to the roof's
    underside, leaning out by o.lean per metre of height; painted (mk), double-sided. Returns the apex height. */
 const gable=(gx,wallTop,hw,gmk,go)=>{go=go||{};const sg=gx<0?-1:1,uu=(()=>{let a=0,b=1;for(let k=0;k<30;k++){const m=(a+b)/2;if(R(m)[0]<Math.abs(gx))a=m;else b=m;}return (a+b)/2;})()*sg;
  const u01=(uu+1)/2,lean=go.lean===undefined?(o.lean||0):go.lean,pts=[];const under=(s,v)=>{const p=F(s)(u01,v);return [gx+sg*lean*Math.max(0,p[1]-th-wallTop),p[1]-th-.02,p[2]];};
  const side=s=>{const out=[];for(let k=0;k<=12;k++){const v=k/12,p=under(s,v);if(Math.abs(p[2])<=hw+.01&&p[1]>wallTop)out.push(p);}return out;};
  const A=side(1),B=side(-1).reverse();if(!A.length||!B.length)return wallTop;
  pts.push([gx,wallTop,0],[gx,wallTop,hw],...A,...B,[gx,wallTop,-hw]);
  poly(gmk,pts,go.col||WHITE,true);
  return Math.max(...A.map(p=>p[1]));};
 return {F,R,E,gable,th};}
/* ---------------------------------------------------------------- the East's spire roof */
/* o: hw, hd (the eave's half-width and half-depth), prof [[sx, sz, y], ...] from the eave up, sq (the corner's squareness:
   2 an ellipse, 8 a rounded rectangle), th, mk, col, patch, nu, sub (rows per profile step), o.cap a ridge cap at the top */
function isSpire(o){const hw=o.hw,hd=o.hd,pr=o.prof,n=pr.length,sq=o.sq||6,th=o.th||.3,mk=o.mk||'thatchR',col=o.col||P('thatchE');
 const rad=(a,sx,sz)=>{const c=Math.abs(Math.cos(a)),s=Math.abs(Math.sin(a));return 1/Math.pow(Math.pow(c/(hw*sx),sq)+Math.pow(s/(hd*sz),sq),1/sq);};
 const at=v=>{const t=v*(n-1),j=Math.min(n-2,Math.floor(t)),f=t-j;return [lerp(pr[j][0],pr[j+1][0],f),lerp(pr[j][1],pr[j+1][1],f),lerp(pr[j][2],pr[j+1][2],f)];};
 const f=(u,v)=>{const a=u*TAU+PI/4,q=at(v),r=rad(a,q[0],q[1]);return [Math.cos(a)*r,q[2],Math.sin(a)*r];};
 const nu=o.nu||40,sub=o.sub||3;
 isShell(mk,f,nu,(n-1)*sub,col,th,{want:(p,nn)=>p[0]*nn[0]+p[2]*nn[2]>0,mkf:isPatchMk(mk,o.patch,7),tiles:o.patch?[8,Math.max(1,n-1)]:null,edges:['v0'],shrink:.4,underCol:o.underCol});
 const top=pr[n-1];if(o.cap!==false){box(o.capMk||'wood',0,top[2]-.05,0,hw*top[0]*2+.3,.22,Math.max(.25,hd*top[1]*2+.1),o.capCol||P('woodD'));}
 return {f,top:top[2],topW:hw*top[0],topD:hd*top[1],rad};}
/* a plain hip (or a pyramid when the top's sx = sz = 0) */
function isHip(o){return isSpire(Object.assign({sq:12,sub:2,cap:o.cap},o,{prof:o.prof||[[1,1,o.eaveY],[o.topS===undefined?.15:o.topS,o.topS2===undefined?.02:o.topS2,o.topY]]}));}
/* a plain straight gable roof along x */
function isGabled(o){return isSaddle(Object.assign({sag:0,hornRise:0,hornOut:0,concave:.04,eaveSag:0,eaveRise:0},o));}
