// ================================================================= HYPERJUNGLE — the lands' shared helpers (PLAN-LANDS.md sections 2-5; J2-J6, 2026-11-08)
// The geometry and placement helpers the lands' builders share (56 the savage land, 57 the north; biomes/savannarim reads them in
// place for its own species). Functions only: nothing runs at load but their definition, so station 1 and every world that reads
// this kit in place draw what they drew.
HYPERJUNGLE.LANDS=HYPERJUNGLE.LANDS||{};
HYPERJUNGLE.builders=HYPERJUNGLE.builders||{};
(function(){
const TH=()=>BIO.host.THREE;
const lin=h=>{const c=new (TH().Color)(h).convertSRGBToLinear();return[c.r,c.g,c.b];};
const mixC=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t];
const sc3=(a,k)=>[a[0]*k,a[1]*k,a[2]*k];
// a trap record (core/biome 37) where the page carries KTRAPS, else the plain fields (a reader of this kit without 37)
const TRAP=o=>typeof KTRAPS!=='undefined'?KTRAPS.make(o):o;
// ---------------------------------------------------------------- unit geometry helpers (shared by the lands' fragments)
// geo(fn): fn(api) with api.v(p, col, uv) -> index and api.f(a, b, c); returns an indexed BufferGeometry with position, uv, colour
// and smooth normals (BIO.def un-indexes or welds it). rev(api, prof, seg, col, o): a surface of revolution, prof [[r, y], ...]
// bottom up, col(i, s) -> linear colour; o.arc (TAU) an open sheet, o.r(i, a) a radius factor, o.x/o.z its axis
const G={lin,mixC,sc3,TRAP,
 geo(fn){const P=[],Uv=[],Cc=[],I=[],api={v(p,c,uv){P.push(p[0],p[1],p[2]);Cc.push(c[0],c[1],c[2]);Uv.push(uv?uv[0]:0,uv?uv[1]:0);return P.length/3-1;},f(a,b,c){I.push(a,b,c);}};
  fn(api);const T=TH(),g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(P,3));g.setAttribute('uv',new T.Float32BufferAttribute(Uv,2));
  g.setAttribute('color',new T.Float32BufferAttribute(Cc,3));g.setIndex(I);g.computeVertexNormals();return g;},
 rev(api,prof,seg,col,o){o=o||{};const arc=o.arc==null?TAU:o.arc,closed=o.arc==null,n=prof.length,ns=closed?seg:seg+1,rows=[];
  for(let i=0;i<n;i++){const row=[];for(let s=0;s<ns;s++){const a=((o.a0==null?0:o.a0))+s/seg*arc,k=o.r?o.r(i,a):1,r=prof[i][0]*k;
    row.push(api.v([((o.x==null?0:o.x))+Math.cos(a)*r,prof[i][1],((o.z==null?0:o.z))+Math.sin(a)*r],col(i,s),[s/seg,i/(n-1)]));}rows.push(row);}
  for(let i=0;i<n-1;i++)for(let s=0;s<seg;s++){const s1=closed?(s+1)%seg:s+1,a=rows[i][s],b=rows[i][s1],c=rows[i+1][s],d=rows[i+1][s1];api.f(a,c,d);api.f(a,d,b);}
  return rows;},
 // a flat blade along +x from the origin: length 1, half-width w(t), droop (y falling as t^2), cup (the edges lifted), its colour col(t, side)
 blade(api,o){const n=(o.n==null?8:o.n),m=(o.m==null?2:o.m),rows=[];for(let i=0;i<=n;i++){const t=i/n,w=o.w(t),y=-((o.droop==null?0:o.droop))*t*t,row=[];
   for(let j=-m;j<=m;j++){const s=j/m;row.push(api.v([t,y+((o.cup==null?0:o.cup))*s*s*w,s*w],o.col(t,s),[t,.5+.5*s]));}rows.push(row);}
  for(let i=0;i<n;i++)for(let j=0;j<2*m;j++){const a=rows[i][j],b=rows[i][j+1],c=rows[i+1][j],d=rows[i+1][j+1];api.f(a,c,d);api.f(a,d,b);}},
 // a vertex-coloured solid that sways a little, with the kit's cross-fade (the 'pod' material's options)
 vmat(key,o){o=o||{};return BIO.leafMat(null,key,Object.assign({swayW:'(position.y)',swayA:.03,alphaTest:0,vertexColors:true},o));},
 // a vertex-coloured STRUCTURE (a trunk, a stem): Lambert with the kit's cross-fade, not a leaf material, so the attachment audit
 // counts it as what holds the cards (core/biome README, "What held means")
 smat(){const m=BIO.solidMat(null);m.vertexColors=true;return m;},
 // a library card or map from the kit's pack, or null (no pack: the open world, or the family not yet in materials.json)
 lib(n,card){const L=HYPERJUNGLE.LIBP?HYPERJUNGLE.LIBP(n):null;if(!L)return null;const t=KMAT.textures(L,{aniso:card?4:8,flipY:card?false:undefined}).map;
  if(card){t.generateMipmaps=true;t.minFilter=TH().LinearMipmapLinearFilter;t.magFilter=TH().LinearFilter;}else t.wrapS=t.wrapT=TH().RepeatWrapping;return{map:t,scale:L.scale||[4,4],L};},
 // a point on a cell's lattice: [x, z, hash, u(k)] for cell (i, j) of `cell` metres (KRAND.hash(world, i, j, salt)); the caller loops
 cellPt(world,i,j,cell,salt){const h=KRAND.hash(world,i,j,salt),u=k=>KRAND.unit(KRAND.hash(h,k,0,salt));return[(i+u(1))*cell,(j+u(2))*cell,h,u];}};
// tree(T, o): a broadleaf tree into the bark bucket o.fam (its vertex colour o.col0): a bole from the foot to o.bole (.62) of T.H,
// flared at the foot (o.flare .5), tapering from T.rb, and a leader on to the top; o.limbs (6) limbs from o.from (.45) up the bole, each
// at an elevation in o.el [lo, hi] (rad) and o.len [lo, hi] x T.crownR long, its tip let down o.droop (0) x its length, forked into
// o.forks (2) twigs; the crown on the twig ends (BIO.clumpOn, o.item: o.per a twig, o.size, o.flat, o.col(r, i)); o.flowers {item,
// per, size, col, flat}; o.lean [x, z] tilts the whole. T.lv 2 near, 1 mid (fewer limbs, no forks' flowers), 0 far (half again).
// Every number from KRAND.hash(T.seed, k, salt). Returns {segs, tris, clumps}
G.tree=function(T,o){const u=(k,s)=>KRAND.unit(KRAND.hash(T.seed>>>0,k,0,((s==null?0:s))+0x7e1)),lv=T.lv==null?2:T.lv,fam=o.fam,col=o.col0==null?0xffffff:o.col0;
 const H=T.H,rb=T.rb,lean=o.lean||[0,0],top=o.bole==null?.62:o.bole,from=o.from==null?.45:o.from,fl=o.flare==null?.5:o.flare;let tris=0;
 const ax=t=>[T.x+lean[0]*H*t*t,T.y0+H*t,T.z+lean[1]*H*t*t],rAt=t=>rb*(1-.62*Math.min(t,top)/top);
 const segs=BIO.tree(T.x,T.z,()=>{
  const P=[],nb=lv>=2?8:5;for(let i=0;i<=nb;i++){const t=i/nb*top,a=ax(t);P.push({x:a[0],y:a[1],z:a[2],r:rAt(t)*(1+fl*Math.pow(Math.max(0,1-t/.07),2))});}
  tris+=BIO.tube(fam,P,col,{seg:lv>=2?9:6});
  {const a=ax(top),b=ax(.82),c=ax(1);tris+=BIO.tube(fam,[{x:a[0],y:a[1],z:a[2],r:rAt(top)},{x:b[0],y:b[1],z:b[2],r:rAt(top)*.55},{x:c[0],y:c[1],z:c[2],r:Math.max(.08,rb*.06)}],col,{seg:lv>=2?6:4});}
  const nL=Math.max(2,Math.round((o.limbs==null?6:o.limbs)*(lv>=2?1:lv===1?.7:.5)));
  for(let k=0;k<nL;k++){const t0=from+(top+.2-from)*(k+u(k,1))/nL,a0=ax(Math.min(t0,.95)),az=k*2.39996+u(k,2)*.7+(T.seed%628)/100,
    el=o.el?o.el[0]+(o.el[1]-o.el[0])*u(k,3):.5,L=T.crownR*(o.len?o.len[0]+(o.len[1]-o.len[0])*u(k,4):.8)*(1-.35*smooth(.8,1,t0)),r0=Math.max(.12,rAt(t0)*.5);
   const ce=Math.cos(el),se=Math.sin(el),dr=((o.droop==null?0:o.droop))*L;
   const m=[a0[0]+Math.cos(az)*ce*L*.5,a0[1]+se*L*.5,a0[2]+Math.sin(az)*ce*L*.5],e=[a0[0]+Math.cos(az)*ce*L,a0[1]+se*L-dr,a0[2]+Math.sin(az)*ce*L];
   tris+=BIO.tube(fam,[{x:a0[0],y:a0[1],z:a0[2],r:r0},{x:m[0],y:m[1],z:m[2],r:r0*.55},{x:e[0],y:e[1],z:e[2],r:Math.max(.06,r0*.18)}],col,{seg:lv>=2?6:4});
   const nf=lv>=1?(o.forks==null?2:o.forks):0;
   for(let f=0;f<nf;f++){const fa=az+(f?-1:1)*(.45+.4*u(k*7+f,5)),fl2=L*(.35+.25*u(k*7+f,6)),fe=[m[0]+Math.cos(fa)*fl2,m[1]+fl2*(.15+.4*u(k*7+f,7))-dr*.4,m[2]+Math.sin(fa)*fl2];
    tris+=BIO.tube(fam,[{x:m[0],y:m[1],z:m[2],r:r0*.4},{x:fe[0],y:fe[1],z:fe[2],r:Math.max(.05,r0*.12)}],col,{seg:lv>=2?4:3});}}},{});
 let clumps=0;const own=BIO.owner;BIO.owner=[T.x,T.z];
 try{const k=lv>=2?1:lv===1?.6:.35;
  if(o.item)clumps=BIO.clumpOn(o.item,segs,{per:Math.max(1,Math.round((o.per==null?3:o.per)*k)),size:o.size||[6,10],flat:o.flat==null?.7:o.flat,t0:.45,t1:1,seed:T.seed>>>0,salt:0x7e2,col:o.col,extra:o.extra});
  const F=o.flowers;if(F&&lv>=1)BIO.clumpOn(F.item,segs,{per:Math.max(1,Math.round(((F.per==null?2:F.per))*k)),size:F.size||[1,1.5],flat:F.flat==null?1:F.flat,t0:.7,t1:1,seed:T.seed>>>0,salt:0x7e3,col:F.col});}
 finally{BIO.owner=own;}
 return{segs,tris,clumps};};
// a bark canvas (a stand-in until the library set comes): w x h, painted by paint(g, w, h, u) with u(k) from KRAND (never Math.random),
// cached by key; a repeat-wrapped sRGB texture (BIO.canvasTex)
const BARKS={};
G.barkCanvas=function(key,w,h,paint){if(BARKS[key])return BARKS[key];const u=k=>KRAND.unit(KRAND.hash(0x7ba,k,0,KRAND.child(3,key)));
 return BARKS[key]=BIO.canvasTex(w,h,(g,W,Hh)=>paint(g,W,Hh,u));};
HYPERJUNGLE.LANDS.G=G;
})();
