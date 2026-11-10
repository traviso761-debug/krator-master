// ================================================================= CORE — biome: animal sign on the ground (trails, wallows, dung, browse lines, trample, bone yards)  [G data]
// The Labyrinth's amendment 1 (biomes/labyrinth PLAN.md section 7): the sign herds leave, drawn from the herd records, so a herd's
// range becomes KGROUND masks and decals and its trails follow the graben corridors. The open world wants it wherever herds live.
// Plain numbers: no THREE, no DOM, no Math.random, no canvas; every draw KRAND.hash(world, cell i, cell j, salt) on one global
// lattice of cells, so a tile and the whole box agree. Opt-in; needs core/rand. Axes: y up, metres, x east, z south.
// node core/biome/test-sign.js.
//
//   KSIGN.make({herds, ground ((x, z) -> y), cost ((x, z) -> extra cost: 0 plain, negative cheaper (a corridor; held over -.9),
//     Infinity impassable (a cliff, deep water); default 0), box ([x0, z0, x1, z1]: the sign returned; default every herd's
//     range, its pastures and its water, plus margin), cell (25 m: the lattice), world (1), water ([[x, z]...]: the water any herd drinks at when it lists none),
//     reach (4 x r: how far a herd walks to drink), slopeMax (.7: steeper is a cliff), dung (.6: droppings per trail cell at one
//     herd's wear), wallowR (80 m round the water), margin (300 m: a herd's search past its points)})
//     herds: core/tags herd records from kits/fauna's FAUNALANDS.register ({id, key, at:[x, y, z], r, n}) or FAUNALANDS.plan's
//     groups ({gid, ...}), or plain {id, species, x, z, r (range m, 300), n (10), mass (kg, 400), water:[[x, z]...], browse (m:
//     the height it browses to; .4 x mass^.25), bed ([x, z]: the bedding ground; the centre), pasture ([[x, z]...]; two hashed in
//     its range), predators (false: kill sites on its trails), wallow (mass >= 200), dung ('heap' | 'pat' | 'pellet', by mass)}
//   -> {kind:'sign', v:1, world, cell, box, herds:[{id, species, bed, pasture, water, n, mass}],
//       trails:[{id ('<herd>:water:i' | '<herd>:pasture:i'), herd, to, pts:[[x, z]...], w (m wide), d (m worn in), use (how
//         many herds share it, on average along it)}] (least-cost paths on the lattice from the bedding ground; later herds, in
//         id order, prefer ground already worn, so herds share trails),
//       wallows:[{id, x, z, r}] (by the water of the heavy herds: flat ground, no higher than its neighbours' mean),
//       dung:[{id, x, z, kind, species, herd}] (along the trails and on the bedding ground, by cell),
//       browse:[{herd, species, y, x, z, r}] (the browse line for the flora), trample:{x0, z0, cell, nx, nz, v:[0..1]} (the
//       box's cells and one more round them, row by row), boneyards:[{id, x, z, r, at ('water' | 'kill')}]}
//     Every piece of sign that reaches the box is returned (a wallow or a bone yard by its radius, dung by a metre, a trail by
//     its bounds plus a cell), so maskAt agrees across a tile's edge.
//   KSIGN.maskAt(S, x, z) -> {trail (1 within .35 w of a trail's line, 0 past .6 w), trample, wallow, dung, bone}, each 0..1:
//     the KGROUND masks (a page bakes them per vertex into the attributes its layers' weights read)
//   KSIGN.export(S) -> plain JSON;  KSIGN.load(J) -> S (maskAt works on it)
// Trails are searched in each herd's own window of the lattice (its points plus margin), never the box's, so a box only chooses
// what is returned: a tile made alone with the same herds returns exactly the whole box's sign inside it.
(function(root){
  'use strict';
  if(root.KSIGN)return;
  function KRq(){var K=root.KRAND;if(!K)throw new Error('KSIGN: load core/rand/08-core-rand.js first (KRAND)');return K;}
  var SALT={pasture:0x5101,wallow:0x5102,wjit:0x5103,dung:0x5104,djit:0x5105,bone:0x5106,bjit:0x5107,kill:0x5108};
  function d(v,x){return v==null?x:v;}
  function c01(v){return v<0?0:v>1?1:v;}
  function sm(a,b,v){var t=c01((v-a)/(b-a));return t*t*(3-2*t);}
  function q4(v){return Math.sqrt(Math.sqrt(v));}
  function hidden(R,k,v){Object.defineProperty(R,k,{value:v,enumerable:false,configurable:true,writable:true});return v;}
  function r3(v){return Math.round(v*1000)/1000;}
  function segDist(x,z,a,b){var dx=b[0]-a[0],dz=b[1]-a[1],l2=dx*dx+dz*dz||1,t=((x-a[0])*dx+(z-a[1])*dz)/l2;t=t<0?0:t>1?1:t;return Math.hypot(x-a[0]-dx*t,z-a[1]-dz*t);}
  function reaches(B,x,z,r){return x+r>=B[0]&&x-r<B[2]&&z+r>=B[1]&&z-r<B[3];}

  function herdOf(h){var id=h.id!=null?h.id:h.gid;if(id==null)throw new Error('KSIGN.make: every herd needs an id (or a FAUNALANDS gid)');
    var x=h.x!=null?h.x:h.at?h.at[0]:null,z=h.z!=null?h.z:h.at?(h.at.length>2?h.at[2]:h.at[1]):null;
    if(typeof x!=='number'||typeof z!=='number')throw new Error('KSIGN.make: herd '+id+' needs x and z (or at)');
    var mass=d(h.mass,400);
    return {id:String(id),species:String(d(h.species,d(h.key,'herd'))),x:x,z:z,r:d(h.r,300),n:d(h.n,10),mass:mass,water:h.water||null,
      browse:d(h.browse,.4*q4(mass)),bed:h.bed?[h.bed[0],h.bed[1]]:[x,z],pasture:h.pasture||null,predators:!!h.predators,
      wallow:h.wallow!=null?!!h.wallow:mass>=200,dung:d(h.dung,mass>=2000?'heap':mass>=150?'pat':'pellet')};}

  function make(o){var K=KRq();if(!o||!o.herds||typeof o.ground!=='function')throw new Error('KSIGN.make: herds and ground (x, z) -> y are needed');
    var cs=d(o.cell,25),world=(o.world==null?1:o.world)>>>0,cost=o.cost||null,smax=d(o.slopeMax,.7),margin=d(o.margin,300),
      wR=d(o.wallowR,80),dens=d(o.dung,.6),ground=o.ground,gC=new Map(),xC=new Map();
    var H=o.herds.map(herdOf).sort(function(a,b){return a.id<b.id?-1:a.id>b.id?1:0;});
    for(var q=1;q<H.length;q++)if(H[q].id===H[q-1].id)throw new Error('KSIGN.make: two herds share the id '+H[q].id);
    function key(i,j){return i+','+j;}
    function cx(i){return (i+.5)*cs;}
    function gAt(i,j){var k=key(i,j),v=gC.get(k);if(v===undefined){v=ground(cx(i),cx(j));gC.set(k,v);}return v;}
    function xAt(i,j){var k=key(i,j),v=xC.get(k);if(v===undefined){v=cost?cost(cx(i),cx(j)):0;if(v==null)v=0;xC.set(k,v);}return v;}
    function cellOf(x,z){return [Math.floor(x/cs),Math.floor(z/cs)];}
    function open(i,j){return xAt(i,j)!==Infinity;}
    var wear=new Map(),trails=[],herdsOut=[];
    H.forEach(function(h){
      var past=h.pasture;if(!past){past=[];for(var p=0;p<2;p++){for(var t=0;t<6;t++){var a=6.283185307179586*K.unit(K.hash(world,K.child(0,h.id),p,t,SALT.pasture)),
          rr=h.r*(.4+.5*K.unit(K.hash(world,K.child(0,h.id),p,t,SALT.pasture+16))),px=h.bed[0]+Math.cos(a)*rr,pz=h.bed[1]+Math.sin(a)*rr,c=cellOf(px,pz);
          if(open(c[0],c[1])){past.push([px,pz]);break;}}}}
      var wat=h.water;if(!wat){var reach=d(o.reach,4*h.r);wat=(o.water||[]).filter(function(w){return Math.hypot(w[0]-h.bed[0],w[1]-h.bed[1])<=reach;})
          .sort(function(a,b){return Math.hypot(a[0]-h.bed[0],a[1]-h.bed[1])-Math.hypot(b[0]-h.bed[0],b[1]-h.bed[1])||a[0]-b[0]||a[1]-b[1];}).slice(0,2);}
      herdsOut.push({id:h.id,species:h.species,bed:h.bed.slice(),pasture:past.map(function(p){return [p[0],p[1]];}),water:wat.map(function(w){return [w[0],w[1]];}),n:h.n,mass:h.mass});
      var goals=wat.map(function(w,i){return {to:'water',i:i,p:w};}).concat(past.map(function(p,i){return {to:'pasture',i:i,p:p};}));if(!goals.length)return;
      var all=[h.bed].concat(goals.map(function(g){return g.p;})),mx=Math.min.apply(null,all.map(function(p){return p[0];}))-margin,
        Mx=Math.max.apply(null,all.map(function(p){return p[0];}))+margin,mz=Math.min.apply(null,all.map(function(p){return p[1];}))-margin,
        Mz=Math.max.apply(null,all.map(function(p){return p[1];}))+margin,i0=Math.floor(mx/cs),j0=Math.floor(mz/cs),nx=Math.floor(Mx/cs)-i0+1,nz=Math.floor(Mz/cs)-j0+1;
      if(nx*nz>4e6)throw new Error('KSIGN.make: herd '+h.id+'\'s window is '+nx+' x '+nz+' cells: a coarser cell');
      var b=cellOf(h.bed[0],h.bed[1]),path=search(i0,j0,nx,nz,b[0]-i0,b[1]-j0,goals.map(function(g){var c=cellOf(g.p[0],g.p[1]);return (c[1]-j0)*nx+(c[0]-i0);}));
      var pass=Math.sqrt(h.n*h.mass)/100;
      goals.forEach(function(g,gi){var P=path[gi];if(!P)return;var cells=P.map(function(ix){var i=ix%nx,j=(ix-i)/nx;return [i+i0,j+j0];});
        cells.forEach(function(c){var k=key(c[0],c[1]),W=wear.get(k);if(!W){W={w:0,herds:[],top:null,topW:0};wear.set(k,W);}W.w+=pass;
          if(W.herds.indexOf(h.id)<0)W.herds.push(h.id);if(pass>W.topW){W.topW=pass;W.top=h;}});
        trails.push({id:h.id+':'+g.to+':'+g.i,herd:h.id,to:g.to,cells:cells,h:h});});
      // Dijkstra over the herd's window, 8 neighbours, no corner cut past an impassable cell; ties to the lower index
      function search(i0,j0,nx,nz,si,sj,goal){var N=nx*nz,dist=new Float64Array(N).fill(Infinity),prev=new Int32Array(N).fill(-1),done=new Uint8Array(N),heap=[],left=0,G={};
        goal.forEach(function(g,k){if(g>=0&&g<N){if(!(g in G)){G[g]=[];left++;}G[g].push(k);}});
        function push(c,v){heap.push([c,v]);var n=heap.length-1;while(n>0){var p=(n-1)>>1;if(less(heap[n],heap[p])){var t=heap[n];heap[n]=heap[p];heap[p]=t;n=p;}else break;}}
        function less(a,b){return a[0]<b[0]||(a[0]===b[0]&&a[1]<b[1]);}
        function pop(){var top=heap[0],last=heap.pop();if(heap.length){heap[0]=last;var n=0;for(;;){var l=2*n+1,r=l+1,m=n;if(l<heap.length&&less(heap[l],heap[m]))m=l;if(r<heap.length&&less(heap[r],heap[m]))m=r;if(m===n)break;var t=heap[n];heap[n]=heap[m];heap[m]=t;n=m;}}return top;}
        var s=sj*nx+si;dist[s]=0;push(0,s);
        while(heap.length&&left>0){var T=pop(),c=T[1];if(done[c])continue;done[c]=1;if(c in G)left--;var ci=c%nx,cj=(c-ci)/nx,gi=i0+ci,gj=j0+cj,y0=gAt(gi,gj);
          for(var di=-1;di<=1;di++)for(var dj=-1;dj<=1;dj++){if(!di&&!dj)continue;var a=ci+di,bb=cj+dj;if(a<0||bb<0||a>=nx||bb>=nz)continue;var e=bb*nx+a;if(done[e])continue;
            var ex=xAt(gi+di,gj+dj);if(ex===Infinity)continue;if(di&&dj&&(!open(gi+di,gj)||!open(gi,gj+dj)))continue;
            var len=di&&dj?cs*Math.SQRT2:cs,sl=Math.abs(gAt(gi+di,gj+dj)-y0)/len;if(sl>smax)continue;
            var Wc=wear.get(key(gi+di,gj+dj)),disc=Wc?1-.35*c01(Wc.w):1,v=dist[c]+len*Math.max(.1,1+ex)*(1+4*(sl/smax)*(sl/smax))*disc;
            if(v<dist[e]){dist[e]=v;prev[e]=c;push(v,e);}}}
        return goal.map(function(g){if(!(g>=0&&g<N)||dist[g]===Infinity)return null;var P=[g];while(P[P.length-1]!==s)P.push(prev[P[P.length-1]]);return P.reverse();});}
    });
    var box=o.box?o.box.slice():[Infinity,Infinity,-Infinity,-Infinity];
    if(!o.box){H.forEach(function(h,hi){var O=herdsOut[hi];[[h.bed[0],h.bed[1],h.r+margin]].concat(O.pasture.concat(O.water).map(function(p){return [p[0],p[1],margin];})).forEach(function(p){
      box=[Math.min(box[0],p[0]-p[2]),Math.min(box[1],p[1]-p[2]),Math.max(box[2],p[0]+p[2]),Math.max(box[3],p[1]+p[2])];});});if(!H.length)box=[0,0,0,0];}
    var S={kind:'sign',v:1,world:world,cell:cs,box:box,herds:herdsOut,trails:[],wallows:[],dung:[],browse:[],trample:null,boneyards:[]};
    // trails: the cells chained to points (collinear runs dropped), width and wear by how many herds share them
    trails.forEach(function(T){var use=0;T.cells.forEach(function(c){use+=wear.get(key(c[0],c[1])).herds.length;});use/=T.cells.length;
      var P=T.cells.map(function(c){return [cx(c[0]),cx(c[1])];}),pts=[P[0]];
      for(var i=1;i<P.length-1;i++){var a=P[i-1],b=P[i],c=P[i+1];if((b[0]-a[0])*(c[1]-b[1])-(b[1]-a[1])*(c[0]-b[0])!==0)pts.push(b);}if(P.length>1)pts.push(P[P.length-1]);
      var bx=[Infinity,Infinity,-Infinity,-Infinity];pts.forEach(function(p){bx=[Math.min(bx[0],p[0]),Math.min(bx[1],p[1]),Math.max(bx[2],p[0]),Math.max(bx[3],p[1])];});
      if(bx[2]<box[0]-cs||bx[0]>box[2]+cs||bx[3]<box[1]-cs||bx[1]>box[3]+cs)return;
      var w0=.35*q4(T.h.mass)*(1+Math.min(1,T.h.n/40));
      S.trails.push({id:T.id,herd:T.herd,to:T.to,pts:pts,w:r3(w0*(1+.5*(use-1))),d:r3(Math.min(.6,.04*use*q4(T.h.mass))),use:r3(use)});});
    // wallows: by each water point the heavy herds drink at, low flat open cells, by hash per cell
    var wl={};H.forEach(function(h,hi){if(!h.wallow)return;herdsOut[hi].water.forEach(function(w){var c0=cellOf(w[0],w[1]),n=Math.ceil(wR/cs);
      for(var i=c0[0]-n;i<=c0[0]+n;i++)for(var j=c0[1]-n;j<=c0[1]+n;j++){var x=cx(i),z=cx(j),dd=Math.hypot(x-w[0],z-w[1]);if(dd>wR||!open(i,j))continue;
        var y=gAt(i,j),ys=[gAt(i+1,j),gAt(i-1,j),gAt(i,j+1),gAt(i,j-1)],hiY=Math.max.apply(null,ys);
        if(y>(ys[0]+ys[1]+ys[2]+ys[3])/4+.15||(hiY-y)/cs>.08)continue;if(K.unit(K.hash(world,i,j,SALT.wallow))>=.3*(1-dd/wR))continue;var k=key(i,j);if(wl[k])continue;
        var wx=x+(K.unit(K.hash(world,i,j,SALT.wjit))-.5)*cs*.6,wz=z+(K.unit(K.hash(world,i,j,SALT.wjit+1))-.5)*cs*.6;
        wl[k]={id:'w:'+k,x:wx,z:wz,r:r3(2+4*K.unit(K.hash(world,i,j,SALT.wjit+2)))};}});});
    Object.keys(wl).sort().forEach(function(k){var W=wl[k];if(reaches(box,W.x,W.z,W.r))S.wallows.push(W);});
    // dung: per trail cell by its wear, and on the bedding ground, each dropping placed by hash in its cell
    var dc={};wear.forEach(function(W,k){dc[k]={n:dens*Math.min(3,W.w),h:W.top};});
    H.forEach(function(h){var c0=cellOf(h.bed[0],h.bed[1]),rb=h.r*.3,n=Math.ceil(rb/cs);
      for(var i=c0[0]-n;i<=c0[0]+n;i++)for(var j=c0[1]-n;j<=c0[1]+n;j++){if(Math.hypot(cx(i)-h.bed[0],cx(j)-h.bed[1])>rb||!open(i,j))continue;var k=key(i,j),D=dc[k];
        if(!D)D=dc[k]={n:0,h:h};D.n+=dens*2;}});
    Object.keys(dc).sort().forEach(function(k){var D=dc[k],ij=k.split(',').map(Number),i=ij[0],j=ij[1],x0=i*cs,z0=j*cs;
      if(x0+cs+1<box[0]||x0-1>box[2]||z0+cs+1<box[1]||z0-1>box[3])return;var cnt=Math.floor(D.n+K.unit(K.hash(world,i,j,SALT.dung)));
      for(var m=0;m<cnt;m++){var x=x0+cs*K.unit(K.hash(world,i,j,m,SALT.djit)),z=z0+cs*K.unit(K.hash(world,i,j,m,SALT.djit+1));
        if(reaches(box,x,z,1))S.dung.push({id:'d:'+k+':'+m,x:x,z:z,kind:D.h.dung,species:D.h.species,herd:D.h.id});}});
    H.forEach(function(h){S.browse.push({herd:h.id,species:h.species,y:r3(h.browse),x:h.bed[0],z:h.bed[1],r:h.r});});
    // trample: the bedding ground's load (n x mass over the range's area) and the trails' wear, as S / (1 + S)
    var ti0=Math.floor(box[0]/cs)-1,tj0=Math.floor(box[1]/cs)-1,tnx=Math.max(0,Math.ceil(box[2]/cs)-ti0+1),tnz=Math.max(0,Math.ceil(box[3]/cs)-tj0+1),tv=[];
    if(tnx*tnz>4e6)throw new Error('KSIGN.make: the trample grid is '+tnx+' x '+tnz+': a coarser cell or a smaller box');
    for(var j=0;j<tnz;j++)for(var i=0;i<tnx;i++){var gi=ti0+i,gj=tj0+j,x=cx(gi),z=cx(gj),Wc=wear.get(key(gi,gj)),s=Wc?Wc.w:0;
      for(var hh=0;hh<H.length;hh++){var h=H[hh],dd=Math.hypot(x-h.bed[0],z-h.bed[1]);if(dd>=h.r)continue;var t=1-(dd/h.r)*(dd/h.r);s+=8*h.n*h.mass/(Math.PI*h.r*h.r)*t*t;}
      tv.push(r3(s/(1+s)));}
    S.trample={x0:ti0*cs,z0:tj0*cs,cell:cs,nx:tnx,nz:tnz,v:tv};
    // bone yards: at the water (by hash per water cell) and at kill sites on the trails of hunted herds
    var by={};H.forEach(function(h,hi){herdsOut[hi].water.forEach(function(w){var c=cellOf(w[0],w[1]),k=key(c[0],c[1]);if(by[k]||K.unit(K.hash(world,c[0],c[1],SALT.bone))>=.5)return;
        var a=6.283185307179586*K.unit(K.hash(world,c[0],c[1],SALT.bjit)),rr=10+20*K.unit(K.hash(world,c[0],c[1],SALT.bjit+1));
        by[k]={id:'b:'+k,x:w[0]+Math.cos(a)*rr,z:w[1]+Math.sin(a)*rr,r:r3(5+10*K.unit(K.hash(world,c[0],c[1],SALT.bjit+2))),at:'water'};});});
    trails.forEach(function(T){if(!T.h.predators||T.cells.length<3)return;var c=T.cells[Math.floor(T.cells.length*(.2+.6*K.unit(K.hash(world,K.child(0,T.id),SALT.kill))))],k=key(c[0],c[1]);
      if(by[k]||K.unit(K.hash(world,c[0],c[1],SALT.kill+1))>=.6)return;by[k]={id:'b:'+k,x:cx(c[0]),z:cx(c[1]),r:r3(4+6*K.unit(K.hash(world,c[0],c[1],SALT.bjit+3))),at:'kill'};});
    Object.keys(by).sort().forEach(function(k){var B=by[k];if(reaches(box,B.x,B.z,B.r))S.boneyards.push(B);});
    return S;}

  // a coarse index of every drawn sign, built once per S (hidden: S stays JSON-safe)
  var IG=50;
  function index(S){if(S._ix)return S._ix;var m={};function put(i,j,v){var k=i+','+j;(m[k]=m[k]||[]).push(v);}
    function span(x0,z0,x1,z1,v){for(var i=Math.floor(x0/IG);i<=Math.floor(x1/IG);i++)for(var j=Math.floor(z0/IG);j<=Math.floor(z1/IG);j++)put(i,j,v);}
    S.trails.forEach(function(T){for(var i=0;i+1<T.pts.length||i===0;i++){var a=T.pts[i],b=T.pts[Math.min(i+1,T.pts.length-1)],r=T.w;
      span(Math.min(a[0],b[0])-r,Math.min(a[1],b[1])-r,Math.max(a[0],b[0])+r,Math.max(a[1],b[1])+r,{t:'trail',a:a,b:b,w:T.w});if(T.pts.length<2)break;}});
    S.wallows.forEach(function(W){span(W.x-W.r,W.z-W.r,W.x+W.r,W.z+W.r,{t:'wallow',x:W.x,z:W.z,r:W.r});});
    S.dung.forEach(function(D){var r=D.kind==='heap'?.9:D.kind==='pat'?.5:.3;span(D.x-r,D.z-r,D.x+r,D.z+r,{t:'dung',x:D.x,z:D.z,r:r});});
    S.boneyards.forEach(function(B){span(B.x-B.r,B.z-B.r,B.x+B.r,B.z+B.r,{t:'bone',x:B.x,z:B.z,r:B.r});});
    return hidden(S,'_ix',m);}
  function maskAt(S,x,z){var o={trail:0,trample:0,wallow:0,dung:0,bone:0},L=index(S)[Math.floor(x/IG)+','+Math.floor(z/IG)]||[];
    for(var i=0;i<L.length;i++){var E=L[i];
      if(E.t==='trail')o.trail=Math.max(o.trail,1-sm(E.w*.35,E.w*.6,segDist(x,z,E.a,E.b)));
      else{var dd=Math.hypot(x-E.x,z-E.z),v=1-sm(E.r*(E.t==='wallow'?.7:.5),E.r,dd);if(v>o[E.t])o[E.t]=v;}}
    /* bilinear on the global lattice (the weights from x / cell alone, so a tile's grid and the box's agree to the bit) */
    var T=S.trample;if(T&&T.nx&&T.nz){var gx=x/T.cell-.5,gz=z/T.cell-.5,I=Math.floor(gx),J=Math.floor(gz),tx=gx-I,tz=gz-J,
        i0=I-Math.round(T.x0/T.cell),j0=J-Math.round(T.z0/T.cell);
      if(i0>=-1&&j0>=-1&&i0<T.nx&&j0<T.nz){var g=function(i,j){return i<0||j<0||i>=T.nx||j>=T.nz?0:T.v[j*T.nx+i];};
        o.trample=(g(i0,j0)*(1-tx)+g(i0+1,j0)*tx)*(1-tz)+(g(i0,j0+1)*(1-tx)+g(i0+1,j0+1)*tx)*tz;}}
    return o;}
  function exp(S){return JSON.parse(JSON.stringify(S));}
  function load(J){if(!J||J.kind!=='sign'||J.v!==1)throw new Error('KSIGN.load: not a KSIGN export (kind sign, v 1)');return exp(J);}

  root.KSIGN={version:1,make:make,maskAt:maskAt,export:exp,load:load};
})(typeof window!=='undefined'?window:globalThis);
