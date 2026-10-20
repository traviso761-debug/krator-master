// ================================================================= GUILIN — the layout (data: the zones on the rock and the plain)
// The host hands the kit its rock as KSTACKS records (core/terrain/37-core-stacks.js), its floor and its water's shapes;
// GUILIN.lay reads them once and answers, for any point, which zone it is in (NOTES.md, "Zones"):
//   ON THE ROCK   crown   a tower's cap, the fengcong's base: the scrub forest
//                 slope   a tower's dome: its beds' walls lean in enough to hold soil (a slope under ~70 degrees): forest
//                 cliff   a wall too steep to root on: the cliff points' scrub only (below)
//                 ledge   the base's top within 14 m of a peak's foot
//                 rim     within 2.5 m of a top's edge (the cliff rule: nothing roots)
//                 blade   the top of a stone-forest blade or pinnacle (moss, a stone orchid)
//   OFF IT        wall    within 3 m of a wall's foot (nothing roots)      foot   within 30 m of it: talus, ferns, shrubs
//                 water   the river, the pond, a flooded paddy             bank   the river's sand and pebble bars
//                 paddy   a field (its rice: the field's own state)        grove  the stone forest's floor between the rock
//                 plain   the rest: groves, grass, bamboo by the water
// and the dressing of the cliffs as records: CLIFF (points on the tower walls where scrub, a fig or a stone orchid holds
// on), DRAPES (vines hanging off a ledge's lip), PADDIES (the fields: polygon, level, state). Every value is a function
// of the records and the point, or a KRAND hash of a body's seed or a cell: no random draws. No THREE, no DOM ([G data]).
const GUILIN={};
(function(){
const K=KSTACKS,KR=KRAND,clamp=(v,a,b)=>v<a?a:v>b?b:v,sm=(a,b,v)=>{const t=clamp((v-a)/(b-a),0,1);return t*t*(3-2*t);},TAU=Math.PI*2;
const SMALL={spire:1,fin:1,balanced:1},isSmall=B=>!!SMALL[B.kind]&&!B.tower;   // a stone-forest blade (a tower is a spire too, marked tower)
let L=null,G=null,SP=null;

// ---------------------------------------------------------------- lay: the grid of beds and wall distances
// o: {bodies, floor:(x,z)=>y, R, cell (5 m), seed, footMax (34), riverD:(x,z)=>m from the river's line, riverW (its
// half-width), sfD:(x,z)=>m from the stone forest's middle, sfR (its radius), pondE:(x,z)=>the pond's ellipse distance
// (1 at its edge), pondLevel, paddy:{cell:[w,d], bund, seed}}
GUILIN.lay=function(o){
 L={bodies:o.bodies,floor:o.floor,R:o.R,seed:o.seed==null?1:o.seed,FM:o.footMax==null?34:o.footMax,riverD:o.riverD,riverW:o.riverW,
  sfD:o.sfD,sfR:o.sfR,pondE:o.pondE,pondLevel:o.pondLevel};
 GUILIN._riverW=o.riverW;
 // the bodies by place (core/space): a point reads only the bodies whose square holds it
 SP=KSPACE.create({cell:64});o.bodies.forEach(B=>SP.insert(B,B.x,B.z,B.R));
 const C=o.cell==null?5:o.cell,N=Math.ceil((o.R*2+400)/C),X0=-o.R-200;
 const who=new Int32Array(N*N),foot=new Float32Array(N*N).fill(L.FM),topY=new Float32Array(N*N).fill(-Infinity),slope=new Uint8Array(N*N);   // who: body*64+bed+1 (0: no rock); foot: m to the nearest wall foot (cap L.FM)
 // body by body over the cells round it (not cell by cell over a query: hundreds of thousands of cells, most far from rock)
 o.bodies.forEach((B,bi)=>{const i0=Math.max(0,Math.floor((B.x-B.R-L.FM-X0)/C)),i1=Math.min(N-1,Math.floor((B.x+B.R+L.FM-X0)/C)),
   j0=Math.max(0,Math.floor((B.z-B.R-L.FM-X0)/C)),j1=Math.min(N-1,Math.floor((B.z+B.R+L.FM-X0)/C)),one=[B];
  for(let j=j0;j<=j1;j++)for(let i=i0;i<=i1;i++){const x=X0+(i+.5)*C,z=X0+(j+.5)*C,k=j*N+i,c=Math.hypot(x-B.x,z-B.z);
   if(c-B.R<foot[k]){const d=footDist(B,x,z);if(d<foot[k])foot[k]=d;}   // the bounding circle first
   if(c<B.R){const a=fastAt(one,x,z);if(a&&a.top>topY[k]){topY[k]=a.top;who[k]=bi*64+a.b.k+1;slope[k]=a.wall?1:0;}}}});   // a wall cell: its points are looked up exactly
 // an edge cell (a neighbour on another bed): its points are looked up exactly
 const edge=new Uint8Array(N*N);
 for(let j=1;j<N-1;j++)for(let i=1;i<N-1;i++){const k=j*N+i,w=who[k];
  for(let dj=-1;dj<=1&&!edge[k];dj++)for(let di=-1;di<=1;di++)if(who[k+dj*N+di]!==w){edge[k]=1;break;}}
 // a stone-forest blade can be narrower than a cell: every cell its square touches is looked up exactly
 o.bodies.forEach(B=>{if(!isSmall(B))return;const i0=Math.floor((B.x-B.R-C-X0)/C),i1=Math.floor((B.x+B.R+C-X0)/C),j0=Math.floor((B.z-B.R-C-X0)/C),j1=Math.floor((B.z+B.R+C-X0)/C);
  for(let j=Math.max(0,j0);j<=Math.min(N-1,j1);j++)for(let i=Math.max(0,i0);i<=Math.min(N-1,i1);i++)edge[j*N+i]=1;});
 G={C,N,X0,who,foot,edge,slope};
 GUILIN.PADDIES=paddies(o.paddy||{});GUILIN.CLIFF=cliffPoints();GUILIN.DRAPES=drapes();
 return GUILIN;};
const nearBodies=(x,z)=>{const out=[];SP.query(x,z,0,out);return out;};
// THE OUTLINE BY TABLE: a bed's footprint radius sampled round it (every 2.5 m of its rim, 48 to 384 samples) and read back by
// interpolation, so a lookup is not KSTACKS.footR's noise every time (that is what the grid of hundreds of thousands of
// cells costs). The tables answer zones only: every height is still KSTACKS.topH's, so a plant stands on the drawn top
const TABS=new Map();
function tabR(b,a){let T=TABS.get(b);if(!T){const n=Math.max(48,Math.min(384,Math.round(TAU*Math.max(b.rx,b.rz)/2.5)));T=new Float32Array(n+1);
  for(let i=0;i<n;i++)T[i]=K.footR(b,i/n*TAU);T[n]=T[0];TABS.set(b,T);}
 const n=T.length-1;let u=a/TAU*n;u-=Math.floor(u/n)*n;const i=Math.floor(u),f=u-i;return T[i]+(T[i+1]-T[i])*f;}
// KSTACKS.at, read off the tables, and THE WALLS' SLOPE: a tapering bed's wall (a tower's dome, a blade's flank) spans
// the plan between its top's outline and its foot's; a point there is on the wall, at the height where the ray through it
// crosses the wall (the mesh's wall is straight up a bed, so this is its height to the notch and the chamfer), steep
// the bed's rise over its run. A bed's top (only a column's cap is not under the next bed's foot) is KSTACKS.topH's.
function fastAt(list,x,z){let best=null;
 for(let i=0;i<list.length;i++){const B=list[i];if(Math.abs(x-B.x)>B.R||Math.abs(z-B.z)>B.R)continue;
  for(let k=B.beds.length-1;k>=0;k--){const b=B.beds[k],tp=b.tp==null?1:b.tp,cx=b.cx+(b.tx||0),cz=b.cz+(b.tz||0),dx=x-cx,dz=z-cz;
   const rt=tabR(b,Math.atan2(dz,dx))*tp*(1-b.ch),d=Math.hypot(dx,dz)-rt;
   if(d<0){const t=K.topH(b,x,z);if(!best||t>best.top)best={S:B,b,top:t,d,wall:false,steep:0};break;}
   if(tp<.995||b.tx||b.tz){const ex=x-b.cx,ez=z-b.cz,rf=tabR(b,Math.atan2(ez,ex)),df=Math.hypot(ex,ez)-rf;
    if(df<0){const u=clamp(-df/(-df+d),0,1),y=b.y+u*b.h,run=Math.max(.01,rf-rt);
     if(!best||y>best.top)best={S:B,b,top:y,d:-1e3,wall:true,steep:b.h/run};break;}}}}
 return best;}
const footDist=(B,x,z)=>{const q=B.beds[0];return Math.hypot(x-q.cx,z-q.cz)-tabR(q,Math.atan2(z-q.cz,x-q.cx));};

// ---------------------------------------------------------------- the height of the rock
const cellOf=(x,z)=>{const i=Math.floor((x-G.X0)/G.C),j=Math.floor((z-G.X0)/G.C);return (i<0||j<0||i>=G.N||j>=G.N)?-1:j*G.N+i;};
// {B, b, top, d} of the rock over (x,z), or null off it
GUILIN.rockAt=function(x,z){const k=cellOf(x,z);if(k<0)return null;
 const w=G.who[k];if(G.edge[k]||G.slope[k]){const a=fastAt(nearBodies(x,z),x,z);return a?{B:a.S,b:a.b,top:a.top,d:a.d,wall:a.wall,steep:a.steep}:null;}
 if(!w)return null;const B=L.bodies[(w-1)>>6],b=B.beds[(w-1)&63];return {B,b,top:K.topH(b,x,z),d:null,wall:false,steep:0};};
GUILIN.top=function(x,z){const r=GUILIN.rockAt(x,z);return r?r.top:-Infinity;};
GUILIN.footD=function(x,z){const k=cellOf(x,z);if(k<0)return L.FM;const C=G.C,i=Math.floor((x-G.X0)/C),j=Math.floor((z-G.X0)/C),N=G.N;
 const u=(x-G.X0)/C-i-.5,v=(z-G.X0)/C-j-.5,i0=u<0?i-1:i,j0=v<0?j-1:j,fu=u<0?u+1:u,fv=v<0?v+1:v;   // bilinear between the cell centres
 if(i0<0||j0<0||i0>=N-1||j0>=N-1)return G.foot[k];const k0=j0*N+i0;
 return G.foot[k0]*(1-fu)*(1-fv)+G.foot[k0+1]*fu*(1-fv)+G.foot[k0+N]*(1-fu)*fv+G.foot[k0+N+1]*fu*fv;};
GUILIN.nearestFoot=function(x,z){const out=[];SP.query(x,z,L.FM,out);let best=null;out.forEach(B=>{const d=footDist(B,x,z);if(!best||d<best.d)best={S:B,d};});return best;};

// ---------------------------------------------------------------- the zone of a point
// {zone, rock, top, d (to the top's edge, < 0 inside), footD, B (the body), b (the bed), small, grove (0..1: how far into
// the stone forest), river (m from the river's line), paddy (its record, or null), up (0..1: how high on its tower)}
GUILIN.at=function(x,z){const r=GUILIN.rockAt(x,z),rd=L.riverD(x,z),gv=sm(L.sfR+60,L.sfR*.7,L.sfD(x,z));
 if(!r){const fd=GUILIN.footD(x,z),P=paddyAt(x,z);let zone='plain';
  if(rd<L.riverW||L.pondE(x,z)<1)zone='water';
  else if(fd<3)zone='wall';
  else if(P)zone=P.state==='flooded'?'water':'paddy';
  else if(rd<L.riverW+30)zone='bank';
  else if(gv>.2)zone='grove';
  else if(fd<30)zone='foot';
  else if(gv>.05)zone='grove';
  return {zone,rock:false,top:L.floor(x,z),d:fd,footD:fd,B:null,b:null,small:false,grove:gv,river:rd,paddy:P,up:0};}
 const B=r.B,b=r.b,small=isSmall(B),up=clamp((r.top-B.y0)/Math.max(1,B.top-B.y0),0,1);
 if(r.wall)return {zone:!small&&r.steep<2.75?'slope':'cliff',rock:true,top:r.top,d:-1e3,footD:0,B,b,small,grove:gv,river:rd,paddy:null,up,steep:r.steep};
 const d=r.d!=null?r.d:(Math.hypot(x-b.cx-(b.tx||0),z-b.cz-(b.tz||0))-tabR(b,Math.atan2(z-b.cz-(b.tz||0),x-b.cx-(b.tx||0)))*(b.tp==null?1:b.tp)*(1-b.ch));
 let zone=small?'blade':'crown';
 if(d>-2.5)zone='rim';
 else if(!small&&!B.tower){const nxt=B.beds.find(q=>q.tier===b.tier+1);
  if(nxt){const out=Math.hypot(x-nxt.cx,z-nxt.cz)-tabR(nxt,Math.atan2(z-nxt.cz,x-nxt.cx))*(1-nxt.nt);if(out<14)zone='ledge';}}
 return {zone,rock:true,top:r.top,d,footD:0,B,b,small,grove:gv,river:rd,paddy:null,up,steep:0};};

// ---------------------------------------------------------------- the wall: a point on a bed's face, and its outward normal
// u 0 the bed's foot .. 1 its top edge; a the angle about the bed's centre (its taper and lean followed up the bed)
GUILIN.wall=function(B,b,a,u){const f=K.prof(b,u)*(1+((b.tp==null?1:b.tp)-1)*u),cx=b.cx+(b.tx||0)*u,cz=b.cz+(b.tz||0)*u,R=K.footR(b,a)*f,x=cx+Math.cos(a)*R,z=cz+Math.sin(a)*R;
 const e=.01,R1=K.footR(b,a+e)*f,tx=cx+Math.cos(a+e)*R1-x,tz=cz+Math.sin(a+e)*R1-z,tl=Math.hypot(tx,tz)||1;
 return {x,y:b.y+u*b.h,z,nx:tz/tl,nz:-tx/tl};};

// ---------------------------------------------------------------- the cliffs' dressing (data: where the scrub holds on)
// CLIFF: points on the towers' walls, in rows ~3.2 m apart up each bed and ~3.4 m round it, kept by a hash against the
// cover there: thin low on the cliff, thick up the dome, and patchy (a noise in the angle and the height, so a tower has
// bare grey blotches and green ones, not stripes). kind 'scrub' (a cushion of evergreen shrub pressed to the face), 'fig'
// (a rock fig gripping the face), 'orchid' (the stone orchid, Dendrobium: the medicinal plant, low on a dry face) or
// 'vine' (a curtain of creeper hanging from a crack). On the stone forest's blades only the orchids.
function cover(B,a,y){return KR.fbm(Math.cos(a)*1.7+20,Math.sin(a)*1.7+20+(y||0)*.012,2,2,B.seed+53);}
function cliffPoints(){const out=[];
 L.bodies.forEach((B,bi)=>{const small=isSmall(B),span=Math.max(1,B.top-B.y0);
  B.beds.forEach((b,k)=>{const per=TAU*Math.max(b.rx,b.rz)*(1+(b.tp==null?1:b.tp))/2,rows=Math.max(1,Math.round(b.h/3.2)),n=Math.max(small?4:12,Math.round(per/(small?3.2:3.4)));
   for(let r=0;r<rows;r++)for(let i=0;i<n;i++){const h=KR.hash(B.seed,k,r*1024+i,0xC1F),p=KR.unit(h),a=(i+.5*KR.unit(KR.hash(h,1)))/n*TAU,uu=(r+.15+.7*KR.unit(KR.hash(h,2)))/rows;
    const y=b.y+uu*b.h,up=clamp((y-B.y0)/span,0,1),cv=cover(B,a,y);
    let keep,kind;
    if(small){keep=.03+.07*sm(.5,.7,cv);kind='orchid';}
    else{keep=(.22+.6*Math.pow(up,1.1))*(.2+1.0*sm(.36,.6,cv));const q=KR.unit(KR.hash(h,3));kind=q<.03?'fig':q<.07&&up<.6?'orchid':q<.12&&up>.2?'vine':'scrub';}
    if(p>=keep)continue;const w=GUILIN.wall(B,b,a,uu);if(w.y<L.floor(w.x,w.z)+1.2)continue;
    out.push({id:B.id+'/c'+k+'.'+r+'.'+i,body:bi,bed:k,a,x:w.x,y:w.y,z:w.z,nx:w.nx,nz:w.nz,up,kind,s:.6+.9*KR.unit(KR.hash(h,4))});}});});
 return out;}
// DRAPES: vines hanging off a tier's lip (the top bed of every tier under the last), every ~6 m where the face is green
function drapes(){const out=[];
 L.bodies.forEach((B,bi)=>{if(isSmall(B)||B.tower)return;   // the lips of the base's tier (a tower has none: its creepers are cliff points)
  B.beds.forEach((b,k)=>{const last=k===B.beds.length-1||B.beds[k+1].tier!==b.tier;if(!last)return;
   const per=TAU*Math.max(b.rx,b.rz),n=Math.max(8,Math.round(per/6));
   for(let i=0;i<n;i++){const h=KR.hash(B.seed,k,i,0xD4A),a=(i+.5)/n*TAU;if(KR.unit(h)>.18+.5*sm(.4,.65,cover(B,a,b.y+b.h)))continue;
    const R=K.footR(b,a)*(1-b.ch)*.99;
    out.push({id:B.id+'/v'+k+'.'+i,body:bi,bed:k,x:b.cx+Math.cos(a)*R,y:b.y+b.h,z:b.cz+Math.sin(a)*R,nx:Math.cos(a),nz:Math.sin(a),len:4+14*KR.unit(KR.hash(h,1))});}});});
 return out;}

// ---------------------------------------------------------------- the paddies (data: fields by the river)
// A grid of fields cell[0] x cell[1] metres, turned to the river's run where they lie (one angle a block of 8 x 8 cells,
// so neighbours share their bunds), kept on the flat between the bank and 450 m out, off the towers' talus and the stone
// forest, in patches; each field level (its water a hand over its highest corner) and in one STATE, hashed from its
// cell: 'flooded' (bare water, the seedlings not yet out), 'young' (bright green rice in water), 'green', 'ripe'
// (gold). The fields are the river plain's crop (kits/crops: 'rice', water 'paddy').
let PG=null;
function paddies(o){const W=o.cell?o.cell[0]:34,D=o.cell?o.cell[1]:22,bund=o.bund==null?.7:o.bund,S=o.seed==null?77:o.seed,R=L.R*.9,out=[];
 PG=KSPACE.create({cell:48});
 const blk=8;
 for(let bj=-Math.ceil(R/(D*blk));bj<=Math.ceil(R/(D*blk));bj++)for(let bi=-Math.ceil(R/(W*blk));bi<=Math.ceil(R/(W*blk));bi++){
  const bx=bi*W*blk,bz=bj*D*blk,ang=.35*(KR.unit(KR.hash(S,bi,bj,1))-.5),ca=Math.cos(ang),sa=Math.sin(ang);
  for(let j=0;j<blk;j++)for(let i=0;i<blk;i++){const lx=(i-blk/2+.5)*W,lz=(j-blk/2+.5)*D,cx=bx+lx*ca-lz*sa,cz=bz+lx*sa+lz*ca;
   if(Math.hypot(cx,cz)>R)continue;const rd=L.riverD(cx,cz);if(rd<L.riverW+42||rd>L.riverW+450)continue;
   if(L.sfD(cx,cz)<L.sfR+140)continue;if(KR.fbm(cx*.0035+9,cz*.0035-4,3,2,S+5)<.47)continue;
   const corners=[[-1,-1],[1,-1],[1,1],[-1,1]].map(q=>{const px=q[0]*(W/2-bund/2),pz=q[1]*(D/2-bund/2);return [cx+px*ca-pz*sa,cz+px*sa+pz*ca];});
   if(corners.concat([[cx,cz]]).some(p=>GUILIN.footD(p[0],p[1])<26||GUILIN.rockAt(p[0],p[1])))continue;
   let hi=-1e9,lo=1e9;corners.concat([[cx,cz]]).forEach(p=>{const y=L.floor(p[0],p[1]);hi=Math.max(hi,y);lo=Math.min(lo,y);});if(hi-lo>1.2)continue;
   const u=KR.unit(KR.hash(S,bi*blk+i,bj*blk+j,2)),state=u<.2?'flooded':u<.45?'young':u<.78?'green':'ripe';
   const P={id:'paddy/'+bi+'.'+bj+'.'+i+'.'+j,x:cx,z:cz,w:W-bund,d:D-bund,ang,poly:corners,level:hi+.16,state,crop:'rice',bund};
   P.i=out.length;out.push(P);PG.insert(P,cx,cz,Math.hypot(W,D)/2);}}
 return out;}
function inPoly(P,x,z){const dx=x-P.x,dz=z-P.z,c=Math.cos(P.ang),s=Math.sin(P.ang),u=dx*c+dz*s,v=-dx*s+dz*c;return Math.abs(u)<=P.w/2&&Math.abs(v)<=P.d/2;}
function paddyAt(x,z){if(!PG)return null;let hit=null;PG.some(x,z,0,P=>{if(inPoly(P,x,z)){hit=P;return true;}return false;});return hit;}
GUILIN.paddyAt=paddyAt;
// the water over a point: the field's level when it holds water (every state but ripe: drained before the harvest)
GUILIN.paddyWater=function(x,z){const P=paddyAt(x,z);return P&&P.state!=='ripe'?P.level:-1e9;};

// the layout as data (the export, Godot): the rock, the cliffs' dressing, the paddies
GUILIN.records=function(){return {rock:K.export(L.bodies),cliff:GUILIN.CLIFF,drapes:GUILIN.DRAPES,paddies:GUILIN.PADDIES.map(P=>{const o=Object.assign({},P);delete o.i;return o;})};};
GUILIN.bodies=()=>L.bodies;
})();
