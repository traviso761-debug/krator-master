// ================================================================= 78s. THE SKYSCRAPERS' FLOOR PLANS (the owner, 2026-10-19)
// "Work on skyscraper interiors; add slum quarters into the first 12 levels of the skyscrapers, then the upper stories have
// junk and scrap and walls+room partitions are randomly broken per the established ancient kit rules. Fallen buildings do
// not need rooms." This is the plan, as plain data (no THREE, no DOM: [G data]); 78v draws it, settlements/iziz/towers
// blueprint.py draws the same plan as sheets (towers/plan_dump.js runs this file in node).
//   IZTOWER.plan(key, d, s)   key 'skyA'..'skyF', d the decay the city built it at (1 ruined, 3 repaired; 2 toppled: null),
//                             s its placement scale -> {key, d, s, storeys:[...], shaft} or null
// Everything is in WORLD metres in the tower's own frame (its builder's local x, z times s; y above the group's origin, the
// kit's y times s), so a storey is 3.2 m whatever the tower's scale (the kit's own floor plates, 1.2 to 2.4 m apart at the
// city's scale, are left out when the interiors are on: IZS_HOLLOW.sky). Each storey:
//   {j, y, h, kind: 'slum' (the first 12) | 'junk', outline: [[x,z]...] (the inside of the tower's lining at the storey's
//    ceiling), core: [x0,x1,z0,z1] (the stair core, centred on cx,cz), corridor: [x0,x1,z0,z1], hole: the stairwell rising
//    from the storey below (null on the first), cells: [{id, poly, door:[x,z], kind}], walls: [{a:[x,z], b:[x,z], kind:
//    'radial'|'front'|'core', broken: 0 (whole) | -1 (gone) | 0..1 (the stub's share of its height)}], stair: the flight up}
// The cells: the ring between the corridor and the lining, cut radially every ~3.4 m of the lining (a cell shallower than
// 2 m is left to the corridor). The slum storeys' partitions are whole (shanty walls); above them the Ancients' own office
// partitions break by the kit's hole rule (32-surfaces.js holeFn): fbm(u * 4.5 * k + seed * .31, y * .028 * k, seed, 3)
// below .34 * d * HOLES (HOLES .55 for a repaired tower, as the city builds it), a broken wall keeping a jagged stub.
// The same engine plans the city's other Ancient buildings (78w-iziz-ancients-plan.js, 2026-10-19): IZTOWER.plan(key, d, s,
// noise, K) takes a building's own descriptor K in place of T[key]. What K may add to a tower's fields:
//   levels(d)      the storeys by hand, in kit units: [{y, h, lobby, outline:[[x,z]...], layout, rooms, walls, entrance, noSlab}]
//   outline(y,n,k) the lining at kit height y as a polygon (kit units), in place of a shape
//   rows           as the towers'; a row taller than 1.5 storeys at this scale holds round(row / 3.2 m) storeys (a transplant)
//   layout         'ring' (the towers'), 'slim' (a drum too small for a corridor: a narrow switchback across it, a room either
//                  side), 'rooms' (a house: the level's own rooms and walls), 'bar' (a long block: a corridor down it, the core
//                  across it, cells either side)
//   door           the street door's bearing (default +z); lobbyMin the lobby's least height (default 3 m); openRooms: a storey
//                  too tight for the corridor is four rooms round the core (the towers leave it open)
const IZTOWER=(function(){
 const TAU=Math.PI*2,clamp=(v,a,b)=>v<a?a:v>b?b:v,sq=(th,n)=>1/Math.pow(Math.pow(Math.abs(Math.cos(th)),n)+Math.pow(Math.abs(Math.sin(th)),n),1/n);
 const CELLKIND={slum:'cottage',junk:'store',rubble:'rubble',lobby:'hall'};
 const STOREY=3.2,LOBBY=4.0,SLUM=12,CELL=3.4,MIN_DEPTH=2.0,DOUBLE=7.5,CORE=[-1.6,1.6,-2.1,2.1],CORR=1.3,HOLE=[-1.1,1.1,-2.1,1.0];
 // ---- the towers, in their builders' local units (the geometry report in the blueprint's BLUEPRINT.md cites the lines)
 const T={
  skyA:{name:'Skyscraper A — the Conocylinder',seed:7,body:69,top:d=>d===2?128:d===1?351:412,lobby:'shaft',scar:{u0:.3,w:.1,y0:64,cut:361.2,frac:.42},rows:{pitch:4.2,phase:72.7},shaft:{y0:5,lin:.86,r:y=>(22-4*clamp((y-5)/64,0,1))*.86},
   r:y=>{const t=clamp((y-64)/356,0,1);return 40+26*Math.pow(Math.abs(t-.42)/.58,1.7)*(t<.42?1:1.15);},inner:.86,shape:'circle'},
  skyB:{name:'Skyscraper B — the Scallop Stack',seed:17,body:35,top:d=>d===2?81:d===1?234:296,lobby:'shaft',scar:{u0:.3,w:.08,y0:32,cut:240,frac:.45},rows:{pitch:5,phase:36.8},shaft:{y0:5,lin:.86,r:()=>16*.86},
   r:y=>26+10*Math.pow(clamp(y/300,0,1),1.4),inner:.83,shape:'circle'},
  skyC:{name:'Skyscraper C — the Tripod',seed:37,body:158,top:d=>d===2?184:d===1?334:376,lobby:'sky',scar:{u0:.3,w:.08,y0:156,cut:342,frac:.4},rows:{pitch:7,phase:166.6},
   shaft:{y0:5,lin:.82,legs:[Math.PI/6,5*Math.PI/6,3*Math.PI/2],r:y=>15*Math.sqrt(1+1.2*Math.pow((y-75)/75,2))*.82,at:(y,a)=>{const r=38-(y-5)*18/150;return[r*Math.cos(a),r*Math.sin(a)];}},
   r:y=>{const t=clamp((y-150)/230,0,1);return 34*(1-.35*t)*(1+.12*Math.sin(Math.PI*t));},inner:.86,shape:'circle'},
  skyD:{name:'Skyscraper D — the Monolith',seed:47,body:5,top:d=>d===2?68:d===1?250:336,lobby:'body',scar:{u0:.3,w:.13,y0:14,cut:258.4,frac:.38},rows:{pitch:12,phase:13.5},
   r:y=>{const t=clamp(y/340,0,1);return 30*(1-.12*t)+(t>.84?9*Math.pow((t-.84)/.16,.7):0);},inner:.84,shape:'circle'},
  skyE:{name:'Skyscraper E — the Sail',seed:57,body:18.3,rows:{pitch:4,phase:18.3},top:d=>d===2?74:d===1?288:354,lobby:'body',shape:'lens',inner:.9,layout:'spine',
   a:y=>34*(1-.45*Math.pow(clamp(y/360,0,1),1.3)),b:y=>13*(1-.3*clamp(y/360,0,1)),rot:y=>.8*clamp(y/360,0,1),r:y=>34},
  skyF:{name:'Skyscraper F — the Trays',seed:67,body:22,top:d=>d===2?70:d===1?232:288,lobby:'body',shape:'trays',inner:.70,coreR:9.5,
   r:y=>{const t=clamp((y-10)/290,0,1);return 28*(1-.2*t)+6*Math.sin(Math.PI*t);}}};
 // the lining's inside at local height y, as a polygon in local units (n points)
 function outlineLocal(K,y,n,k){const out=[];if(K.outline)return K.outline(y,n,k);
  if(K.shape==='lens'){const a=K.a(y)*K.inner,b=K.b(y)*K.inner,r=K.rot(y),c=Math.cos(r),s=Math.sin(r);
   for(let i=0;i<n;i++){const t=i/n*2,side=t<1?1:-1,u=t<1?t:t-1,x=(u-.5)*2*a*side,z=side*b*(1-Math.pow(2*u-1,2));out.push([x*c-z*s,x*s+z*c]);}return out;}
  for(let i=0;i<n;i++){const th=i/n*TAU;let R=K.r(y)*K.inner;if(K.shape==='trays')R*=1+.22*Math.cos(3*(th-k*.14));out.push([R*Math.cos(th),R*Math.sin(th)]);}
  return out;}
 // where the ray from the centre at th leaves a polygon (convex or star-shaped about the centre)
 function rayHit(P,th){const dx=Math.cos(th),dz=Math.sin(th);let best=null;
  for(let i=0;i<P.length;i++){const a=P[i],b=P[(i+1)%P.length],ex=b[0]-a[0],ez=b[1]-a[1],den=dx*ez-dz*ex;if(Math.abs(den)<1e-9)continue;
   const t=(a[0]*ez-a[1]*ex)/den,u=(a[0]*dz-a[1]*dx)/den;if(t>0&&u>=-1e-9&&u<=1+1e-9&&(best===null||t<best))best=t;}
  return best===null?0:best;}
 const rectPoly=r=>[[r[0],r[2]],[r[1],r[2]],[r[1],r[3]],[r[0],r[3]]];
 // the slim drum's core: a switchback 1.6 x 4 m, flights 0.7 m wide, their head on the strip z 1.1 to 2 (78v draws it)
 const SLIM={core:[-.9,.9,-2.0,2.3],hole:[-.9,.9,-2.0,1.1],fw:.8,zf:1.1,zb:-2.0};   // fw 0.8: at 0.7 a walker (0.35 m) touched the rails
 const area=P=>{let a=0;for(let i=0;i<P.length;i++){const p=P[i],q=P[(i+1)%P.length];a+=p[0]*q[1]-q[0]*p[1];}return a/2;};
 // the z extent of a polygon along the line x
 function spanAt(P,x){let lo=1e9,hi=-1e9;for(let i=0;i<P.length;i++){const a=P[i],b=P[(i+1)%P.length];if(a[0]===b[0]||(a[0]-x)*(b[0]-x)>0)continue;
  const z=a[1]+(b[1]-a[1])*(x-a[0])/(b[0]-a[0]);lo=Math.min(lo,z);hi=Math.max(hi,z);}return lo<hi?[lo,hi]:null;}
 const doorAt=(outline,th,w)=>{const r=rayHit(outline,th);return{at:[+(r*Math.cos(th)).toFixed(3),+(r*Math.sin(th)).toFixed(3)],w,ry:+Math.atan2(Math.cos(th),Math.sin(th)).toFixed(4)};};
 const round3=O=>O.map(p=>[+p[0].toFixed(3),+p[1].toFixed(3)]);
 // the part of a polygon with ax*x + az*z <= c (Sutherland-Hodgman, one plane)
 function clip(P,ax,az,c){const out=[];for(let i=0;i<P.length;i++){const p=P[i],q=P[(i+1)%P.length],sp=ax*p[0]+az*p[1]-c,sq=ax*q[0]+az*q[1]-c;
  if(sp<=0)out.push(p);if((sp<=0)!==(sq<=0)){const t=sp/(sp-sq);out.push([p[0]+(q[0]-p[0])*t,p[1]+(q[1]-p[1])*t]);}}return out;}
 // a lobby: the floor round the core as four open rooms, one a quadrant, each with the core's corner notched out of it
 function quadrants(outline,id,kind,core){const R=[],C=core||CORE;
  for(const [sx,sz] of[[1,1],[-1,1],[-1,-1],[1,-1]]){let P=clip(clip(outline,-sx,0,0),0,-sz,0);if(P.length<3)continue;
   let k=0,best=1e9;P.forEach((p,i)=>{const d=Math.hypot(p[0],p[1]);if(d<best){best=d;k=i;}});
   const prev=P[(k+P.length-1)%P.length],cx=sx>0?C[1]+.1:C[0]-.1,cz=sz>0?C[3]+.1:C[2]-.1;
   const notch=Math.abs(prev[0])<1e-6?[[0,cz],[cx,cz],[cx,0]]:[[cx,0],[cx,cz],[0,cz]];
   P.splice(k,1,...notch);R.push({id:id+(sx>0?'e':'w')+(sz>0?'n':'s'),poly:P.map(p=>[+p[0].toFixed(3),+p[1].toFixed(3)]),door:[+(cx*.5).toFixed(3),+cz.toFixed(3)],kind,open:true});}
  return R;}
 const ang=p=>{const a=Math.atan2(p[1],p[0]);return a<0?a+TAU:a;};
 function plan(key,d,s,noise,KX){const K=KX||T[key];if(!K||!(s>0))return null;
  const fbm=noise||((x,y,z)=>.5),dEff=d*(d===3?.55:1),thr=Math.min(.9,.34*dEff),kk=1/s,bodyLobby=K.lobby==='body'||K.lobby==='sky';
  // a ruined or toppled tower's cut is jagged (the kit's lathe jag, 10 m at kit scale, and its tear): the storeys stop 12 m (kit)
  // below the cut, or the rooms stood over the broken rim
  const topK=K.top(d)-(KX||d===3?0:12);
  const storeys=[],y0=K.body*s,yTop=topK*s;let j=0,y=y0;
  const levels=[];
  if(K.levels){for(const L of K.levels(d,s))levels.push({y:L.y*s,h:L.h*s,k:L.k==null?0:L.k,lobby:!!L.lobby,L});}
  else if(K.rows&&K.rows.pitch*s>STOREY*1.5){// a transplant at twice its size: a window row 6 to 10 m tall holds two or three
   // storeys, the first floor on the row's spandrel (the lobby as below, its least height K.lobbyMin)
   const pt=K.rows.pitch,per=Math.round(pt*s/STOREY),u=pt/per;let fl=K.rows.phase;
   const first=bodyLobby?K.body+(K.lobbyMin==null?3.0:K.lobbyMin)*kk:K.body;while(fl<first-1e-6)fl+=u;while(fl-u>=first-1e-6)fl-=u;
   if(bodyLobby&&fl<=topK){const lh=(fl-K.body)*s;if(lh>5){levels.push({y,h:lh/2,k:0,lobby:true},{y:y+lh/2,h:lh/2,k:0,lobby:true});}else levels.push({y,h:lh,k:0,lobby:true});}
   for(;(fl+u)<=topK+1e-6;fl+=u)levels.push({y:fl*s,h:u*s,k:0});}
  else if(K.shape==='trays'){for(let i=0;;i++){const ly=22+12*i;if(ly+9.4>topK)break;if((1+i)%7===3)continue;levels.push({y:ly*s,h:9.4*s,k:1+i,lobby:bodyLobby&&!levels.length});}}
  else if(K.rows){// storeys on the tower's own window rhythm: n rows a storey (the nearest to 3.2 m at this scale), each floor in
   // the spandrel between two rows, so no slab crosses a window (the lobby keeps the body's foot)
   // the lobby's ceiling is the first row at least 3 m up (a lobby over 5 m is a lobby and a gallery over it, so no stair climbs
   // more than a storey)
   const pt=K.rows.pitch,n=Math.max(1,Math.round(STOREY/(pt*s))),step=n*pt;let fl=K.rows.phase;
   const first=bodyLobby?K.body+(K.lobbyMin==null?3.0:K.lobbyMin)*kk:K.body;while(fl<first-1e-6)fl+=pt;while(fl-pt>=first-1e-6)fl-=pt;
   if(bodyLobby&&fl<=topK){const lh=(fl-K.body)*s;if(lh>5){levels.push({y,h:lh/2,k:0,lobby:true},{y:y+lh/2,h:lh/2,k:0,lobby:true});}else levels.push({y,h:lh,k:0,lobby:true});}
   for(;(fl+step)<=topK+1e-6;fl+=step)levels.push({y:fl*s,h:step*s,k:0});}
  else{let y=y0;if(bodyLobby&&y+LOBBY<=yTop){levels.push({y,h:LOBBY,k:0,lobby:true});y+=LOBBY;}for(;y+STOREY<=yTop;y+=STOREY)levels.push({y,h:STOREY,k:0});}
  const nLobby=levels.filter(L=>L.lobby).length;
  for(const L of levels){const ly=(L.y+L.h)*kk,n0=nLobby,kind=L.lobby?'lobby':d!==3?'rubble':j-n0<SLUM?'slum':'junk';
   const broke=(u,yy)=>{if(kind==='slum'||kind==='lobby')return 0;const v=fbm(u*4.5*.35+K.seed*.31,yy*kk*.028*3,K.seed,3);if(v>=thr)return 0;const f=v/thr;return f<.35?-1:clamp(.15+.7*(f-.35),.15,.85);};   // 0 whole, -1 gone, else the stub's share
   const lay=L.L&&L.L.layout||K.layout;
   if(lay==='spine'){storeys.push(spine(K,L,j,ly,kind,broke));j++;continue;}
   // the lining at the storey's narrower end (an hourglass narrows up to its waist and widens above it: taken at the top only,
   // the slabs and walls above A's waist stood out of the shell at their foot)
   const oAt=yy=>outlineLocal(K,yy,64,L.k),ar=O=>Math.abs(O.reduce((a,p,i)=>{const q=O[(i+1)%O.length];return a+p[0]*q[1]-q[0]*p[1];},0));
   const outline=(L.L&&L.L.outline?L.L.outline:(()=>{const A=oAt(ly),B=oAt(L.y*kk);return ar(B)<ar(A)?B:A;})()).map(p=>[p[0]*s,p[1]*s]);
   const S=lay==='slim'?slim(K,L,j,kind,broke,outline):lay==='rooms'?rooms(K,L,j,kind,broke,outline):lay==='bar'?bar(K,L,j,kind,broke,outline):ring(K,L,j,kind,broke,outline);
   if(L.L&&L.L.noSlab)S.noSlab=true;
   storeys.push(S);j++;}
  // the ring: cells between two boundaries round the centre, cut radially every ~3.4 m of the outer one. A narrow tower
  // (the floor at most DOUBLE deep from the corridor round the core to the lining) has one ring of cells off a corridor round
  // the core. A wide one has the corridor out at 42 % of the depth, cells on both sides of it, and the inner ring's cell in
  // front of the core's door left open as the passage to it.
  function scarAt(a,b,yy){const S=K.scar;if(!S||d!==1)return false;const ly=yy*kk-S.y0,L=S.cut-S.y0,yN=L*S.frac;if(ly<yN)return false;
   const t=Math.pow((ly-yN)/Math.max(1,L-yN),.75),w=S.w*t*1.25,ua=a/TAU,ub=b/TAU;let e=1;
   for(const u of[ua,ub,(ua+ub)/2]){let x=Math.abs(u-S.u0)%1;if(x>.5)x=1-x;e=Math.min(e,x);}
   const inside=((S.u0-ua)%1+1)%1<=((ub-ua)%1+1)%1;return inside||e<w;}
  function ring(K,L,j,kind,broke,outline){const cells=[],walls=[],corridorPolys=[],cr=rectPoly(CORE),C=CORE;
   // the corridor round the core, narrowed to fit inside the lining (the Trays' top storeys); none fits: an open storey
   let m=CORR;const inside=p=>{const t=Math.atan2(p[1],p[0]);return Math.hypot(p[0],p[1])<rayHit(outline,t)-.3;};
   // (no narrower than 1.1 m: at 0.9 a walker stepping out of a cell met the core's wall; the owner, 2026-10-19, thresholds)
   while(m>=1.1&&!rectPoly([CORE[0]-m,CORE[1]+m,CORE[2]-m,CORE[3]+m]).every(inside))m-=.1;
   if(kind==='lobby'){const C=CORE,walls=[{a:[C[0],C[2]],b:[C[1],C[2]],kind:'core',broken:0},{a:[C[1],C[2]],b:[C[1],C[3]],kind:'core',broken:0},{a:[C[0],C[2]],b:[C[0],C[3]],kind:'core',broken:0},
     {a:[C[0],C[3]],b:[-.5,C[3]],kind:'core',broken:0},{a:[.5,C[3]],b:[C[1],C[3]],kind:'core',broken:0}];
    return{j,y:+L.y.toFixed(3),h:+L.h.toFixed(3),k:L.k,kind,rot:0,doors:['+z'],layout:'lobby',outline:outline.map(p=>[+p[0].toFixed(3),+p[1].toFixed(3)]),core:CORE.slice(),corridor:CORE.slice(),corridorPolys:[],
     holes:j||K.shaft&&K.lobby==='body'?[{r:HOLE.slice(),at:[0,0],rot:0}]:[],entrance:j||K.lobby==='sky'||K.shaft&&K.shaft.open?null:K.door==null?{at:[0,+(rayHit(outline,Math.PI/2)).toFixed(3)],w:2.2,ry:0}:doorAt(outline,K.door,2.2),cells:quadrants(outline,'s'+j+'q','hall'),walls};}
   if(m<1.1&&K.openRooms){const C=CORE;return{j,y:+L.y.toFixed(3),h:+L.h.toFixed(3),k:L.k,kind,rot:0,doors:['+z'],layout:'open',outline:outline.map(p=>[+p[0].toFixed(3),+p[1].toFixed(3)]),core:CORE.slice(),corridor:CORE.slice(),corridorPolys:[],
     holes:j||!bodyLobby&&K.shaft?[{r:HOLE.slice(),at:[0,0],rot:0}]:[],cells:quadrants(outline,'s'+j+'q',CELLKIND[kind]).map(c=>Object.assign(c,{open:false})),
     walls:[[C[0],C[2],C[1],C[2]],[C[1],C[2],C[1],C[3]],[C[0],C[2],C[0],C[3]],[C[0],C[3],-.5,C[3]],[.5,C[3],C[1],C[3]]].map(w=>({a:[w[0],w[1]],b:[w[2],w[3]],kind:'core',broken:0})).concat(quadWalls(outline,C,broke,L.y))};}
   if(m<1.1)return{j,y:+L.y.toFixed(3),h:+L.h.toFixed(3),k:L.k,kind,rot:0,doors:['+z'],layout:'open',outline:outline.map(p=>[+p[0].toFixed(3),+p[1].toFixed(3)]),core:CORE.slice(),corridor:CORE.slice(),corridorPolys:[],holes:j||!bodyLobby&&K.shaft?[{r:HOLE.slice(),at:[0,0],rot:0}]:[],cells,walls:[]};
   const corr=[CORE[0]-m,CORE[1]+m,CORE[2]-m,CORE[3]+m],kr=rectPoly(corr);
   const N=48,depth=[];for(let i=0;i<N;i++){const t=i/N*TAU;depth.push(rayHit(outline,t)-rayHit(kr,t));}
   const wide=Math.min(...depth)>DOUBLE,P=(r,t)=>[+(r*Math.cos(t)).toFixed(3),+(r*Math.sin(t)).toFixed(3)];
   const fo=t=>rayHit(outline,t),fc=t=>rayHit(cr,t),fk=t=>rayHit(kr,t);let gone=0;
   const ri=t=>{const c=fc(t);return c+(fo(t)-c)*.42-CORR/2;},ro=t=>ri(t)+CORR;
   // cells between inner(t) and outer(t), doors on side 'in' or 'out'; skip(t0, t1) leaves a slot open
   const band=(inner,outer,side,tag,skip,opt)=>{opt=opt||{};let perim=0;for(let i=0;i<N;i++){const a=i/N*TAU,b=(i+1)/N*TAU,ra=(inner(a)+outer(a))/2,rb=(inner(b)+outer(b))/2;perim+=Math.hypot(rb*Math.cos(b)-ra*Math.cos(a),rb*Math.sin(b)-ra*Math.sin(a));}   // sized on the band's middle line
    // and no more cells than leave each 1.8 m along its door's side (the pentagon block's narrow top storeys cut wedges under a
    // metre wide at the corridor: a partition stood behind every door; the owner, 2026-10-19)
    let dper=0;{const ds=side==='in'?inner:outer;for(let i=0;i<N;i++){const a=i/N*TAU,b=(i+1)/N*TAU,ra=ds(a),rb=ds(b);dper+=Math.hypot(rb*Math.cos(b)-ra*Math.cos(a),rb*Math.sin(b)-ra*Math.sin(a));}}
    const n=opt.n||Math.max(2,Math.min(Math.max(6,Math.round(perim/CELL)),Math.floor(dper/1.8))),off=opt.off==null?.5/n*TAU:opt.off,t=k=>k/n*TAU+off,live=[];
    // a cell is deep enough in its middle (MIN_DEPTH) and nowhere under 0.6 m (the Trays' valleys)
    for(let i=0;i<n;i++){const a=t(i),b=t(i+1),m=(a+b)/2;live.push(outer(m)-inner(m)>=MIN_DEPTH&&Math.min(outer(a)-inner(a),outer(b)-inner(b))>=.6&&!(skip&&skip(a,b)));}
    for(let i=0;i<n;i++){const a0=t(i),b0=t(i+1);if(skip&&skip(a0,b0)){const q=[];for(let k=0;k<=4;k++){const u=a0+(b0-a0)*k/4;q.push(P(inner(u),u));}for(let k=4;k>=0;k--){const u=a0+(b0-a0)*k/4;q.push(P(outer(u),u));}corridorPolys.push(q);continue;}   // the open slot: the passage
     if(!live[i])continue;const a=t(i),b=t(i+1),m=(a+b)/2,poly=[];if(scarAt(a,b,L.y+L.h)){gone++;continue;}
     for(let k=0;k<=4;k++){const u=a+(b-a)*k/4;poly.push(P(inner(u),u));}for(let k=4;k>=0;k--){const u=a+(b-a)*k/4;poly.push(P(outer(u),u));}
     // the front follows the door side (a cell wrapping a corner of the corridor's rectangle turns with it), and the door stands
     // in the middle of its longest straight run: at the middle angle it fell on that corner, and the front's other leg stood
     // half a metre in front of it (the owner, 2026-10-20: the setback tower's and Sky F's cell doors)
     const ds=side==='in'?inner:outer,FP=[];for(let k=0;k<=8;k++){const u=a+(b-a)*k/8;FP.push(P(ds(u),u));}
     const segL=k=>Math.hypot(FP[k+1][0]-FP[k][0],FP[k+1][1]-FP[k][1]),dirOf=k=>Math.atan2(FP[k+1][1]-FP[k][1],FP[k+1][0]-FP[k][0]);
     // the straight runs; of those 0.9 m or longer, the one with the most room behind its middle (0.6 m in, to the cell's other
     // walls: a wedge round the corridor's corner is a sliver behind one leg), else the longest
     const runs=[];{let r0=0;for(let k=0;k<8;k++){if(k>r0&&Math.abs(Math.atan2(Math.sin(dirOf(k)-dirOf(k-1)),Math.cos(dirOf(k)-dirOf(k-1))))>.15){runs.push([r0,k-1]);r0=k;}}runs.push([r0,7]);}
     const runL=R=>{let L=0;for(let q=R[0];q<=R[1];q++)L+=segL(q);return L;},cx0=poly.reduce((s,p)=>s+p[0],0)/poly.length,cz0=poly.reduce((s,p)=>s+p[1],0)/poly.length;
     const clear=R=>{const A=FP[R[0]],B=FP[R[1]+1],mx=(A[0]+B[0])/2,mz=(A[1]+B[1])/2,L=Math.hypot(B[0]-A[0],B[1]-A[1])||1;let nx=-(B[1]-A[1])/L,nz=(B[0]-A[0])/L;if(nx*(cx0-mx)+nz*(cz0-mz)<0){nx=-nx;nz=-nz;}
      const qx=mx+nx*.6,qz=mz+nz*.6;let d=1e9;for(let e=0;e<poly.length;e++){const p0=poly[e],p1=poly[(e+1)%poly.length],ex=p1[0]-p0[0],ez=p1[1]-p0[1],l2=ex*ex+ez*ez||1,t=Math.max(0,Math.min(1,((qx-p0[0])*ex+(qz-p0[1])*ez)/l2));d=Math.min(d,Math.hypot(p0[0]+ex*t-qx,p0[1]+ez*t-qz));}return d;};
     let pick=null;for(const R of runs){const L=runL(R);if(L<.9)continue;const c=clear(R);if(!pick||c>pick.c+.05||Math.abs(c-pick.c)<=.05&&L>pick.L)pick={R,L,c};}
     if(!pick){let L0=0;for(const R of runs){const L=runL(R);if(L>L0){L0=L;pick={R,L};}}}
     const best=[pick.L,pick.R[0],pick.R[1]];
     let half=best[0]/2,kd=best[1];while(kd<best[2]&&half>segL(kd)){half-=segL(kd);kd++;}
     const tt=segL(kd)>1e-6?half/segL(kd):0,door=[+(FP[kd][0]+(FP[kd+1][0]-FP[kd][0])*tt).toFixed(3),+(FP[kd][1]+(FP[kd+1][1]-FP[kd][1])*tt).toFixed(3)];
     cells.push({id:'s'+j+tag+i,poly,door,kind:CELLKIND[kind]});
     {const pre=FP.slice(0,best[1]+1).concat([door]),post=[door].concat(FP.slice(best[2]+1));   /* the run is one straight leg each side of the door (its gap is cut from that leg) */const bA=broke(i+.25+(tag==='o'?0:200),L.y),bB=broke(i+.75+(tag==='o'?0:200),L.y);
      const run=(Q,bk,last)=>{const out=[];for(let q=0;q+1<Q.length;q++)if(Math.hypot(Q[q+1][0]-Q[q][0],Q[q+1][1]-Q[q][1])>.02)out.push([Q[q],Q[q+1]]);return out;};
      const A=run(pre),B=run(post);A.forEach((w,q)=>walls.push({a:w[0],b:w[1],kind:'front',broken:bA,door:q===A.length-1?'b':undefined}));B.forEach((w,q)=>walls.push({a:w[0],b:w[1],kind:'front',broken:bB,door:q===0?'a':undefined}));}
     walls.push({a:P(inner(a),a),b:P(outer(a),a),kind:'radial',broken:broke(i+(tag==='o'?0:200),L.y)});
     if(!live[(i+1)%n])walls.push({a:P(inner(b),b),b:P(outer(b),b),kind:'radial',broken:broke(i+1+(tag==='o'?0:200),L.y)});}};
   if(!wide){band(fk,fo,'in','o',null,K.shape==='trays'?{n:6,off:L.k*.14+Math.PI/3}:null);corridorPolys.push(kr);}   // the Trays: a cell from each lobe's valley to its peak
   else{const td=Math.PI/2;band(fc,ri,'out','i',(a,b)=>a<=td&&b>=td);band(ro,fo,'in','o');
    for(let i=0;i<N;i++){const a=i/N*TAU,b=(i+1)/N*TAU;corridorPolys.push([P(ri(a),a),P(ri(b),b),P(ro(b),b),P(ro(a),a)]);}
    }
   walls.push({a:[C[0],C[2]],b:[C[1],C[2]],kind:'core',broken:0},{a:[C[1],C[2]],b:[C[1],C[3]],kind:'core',broken:0},{a:[C[0],C[2]],b:[C[0],C[3]],kind:'core',broken:0},
    {a:[C[0],C[3]],b:[-.5,C[3]],kind:'core',broken:0},{a:[.5,C[3]],b:[C[1],C[3]],kind:'core',broken:0});
   return{j,y:+L.y.toFixed(3),h:+L.h.toFixed(3),k:L.k,kind,rot:0,doors:['+z'],layout:wide?'double':'single',outline:outline.map(p=>[+p[0].toFixed(3),+p[1].toFixed(3)]),
    core:CORE.slice(),corridor:corr,corridorPolys,holes:j||!bodyLobby&&K.shaft?[{r:HOLE.slice(),at:[0,0],rot:0}]:[],cells,walls,scarred:gone};}
  // the partitions of a storey too tight for the corridor (openRooms): the four rooms round the core, a door in each wall,
  // the +z wall stopped a metre short of the core so the core's door opens on a landing between two of them
  function quadWalls(outline,C,broke,yy){const W=[],P=(r,t)=>[+(r*Math.cos(t)).toFixed(3),+(r*Math.sin(t)).toFixed(3)];
   for(const [t,r0] of[[Math.PI/2,C[3]+1.0],[0,C[1]+.1],[-Math.PI/2,-C[2]+.1],[Math.PI,-C[0]+.1]]){const r1=rayHit(outline,t)-.05;if(r1-r0<1.4)continue;const rd=r0+.7;
    W.push({a:P(r0,t),b:P(rd,t),kind:'front',broken:broke(t*3+.25,yy),door:'b'},{a:P(rd,t),b:P(r1,t),kind:'front',broken:broke(t*3+.75,yy),door:'a'});}
   return W;}
  // the slim drum (a column of Apartments C, 2.5 m inside): SLIM's narrow switchback across the middle, turned so the strip at
  // the head of its flights faces the street door (K.door), a room either side of it, each with its door off that strip; the
  // core's long sides are the rooms' front walls, and break by the rule like any partition
  function slim(K,L,j,kind,broke,outline){const th=K.door==null?Math.PI/2:K.door,rot=th-Math.PI/2,c=Math.cos(rot),sn=Math.sin(rot);
   const toL=p=>[p[0]*c+p[1]*sn,-p[0]*sn+p[1]*c],R=p=>[+(p[0]*c-p[1]*sn).toFixed(3),+(p[0]*sn+p[1]*c).toFixed(3)];
   const O=outline.map(toL),C=SLIM.core,cells=[],walls=[],lobby=kind==='lobby';
   for(const sx of[1,-1]){const Pp=clip(O,-sx,0,-(C[1]+.1));if(Pp.length<3||Math.abs(area(Pp))<2)continue;const x=sx*(C[1]+.05),sp=spanAt(O,x);if(!sp)continue;
    const dz=clamp((SLIM.zf+C[3])/2,sp[0]+.6,sp[1]-1.0);   /* a metre in from the lining: at 0.6 a walker leaving the room met it */
    cells.push({id:'s'+j+(sx>0?'e':'w'),poly:Pp.map(R),door:R([x,dz]),kind:lobby?'hall':CELLKIND[kind],open:lobby});
    walls.push({a:R([x,sp[0]]),b:R([x,dz]),kind:'front',broken:broke(sx+.25,L.y),door:'b'},{a:R([x,dz]),b:R([x,sp[1]]),kind:'front',broken:broke(sx+.75,L.y),door:'a'});}
   const z1=(spanAt(O,0)||[0,C[3]])[1];
   return{j,y:+L.y.toFixed(3),h:+L.h.toFixed(3),k:L.k,kind,rot:+rot.toFixed(4),doors:['+z'],layout:'slim',outline:round3(outline),core:C.slice(),corridor:[C[0],C[1],SLIM.zf,z1],
    corridorPolys:[rectPoly([C[0],C[1],SLIM.zf,z1]).map(R)],stair:SLIM,holes:j||K.shaft?[{r:SLIM.hole.slice(),at:[0,0],rot:+rot.toFixed(4)}]:[],
    entrance:!j&&K.entry!==false?doorAt(outline,th,1.0):null,cells,walls};}
  // a house: the level's own rooms and partitions (kit units, scaled here), its street door, no core (a stair, when it has one,
  // is the level's: {a, b, w} a straight flight from a to b in kit units)
  function rooms(K,L,j,kind,broke,outline){const Lv=L.L,sc=p=>[+(p[0]*s).toFixed(3),+(p[1]*s).toFixed(3)],cells=[],walls=[];
   (Lv.rooms||[]).forEach((r,i)=>{const hall=!!r.hall||kind==='lobby';cells.push({id:'s'+j+'r'+i,poly:r.poly.map(sc),door:sc(r.door),kind:hall?'hall':CELLKIND[kind],open:!!r.open});});
   (Lv.walls||[]).forEach((w,i)=>walls.push({a:sc(w.a),b:sc(w.b),kind:w.kind||(w.door?'front':'radial'),broken:w.kind==='core'?0:broke(i+.5,L.y),door:w.door}));
   const E=Lv.entrance;
   return{j,y:+L.y.toFixed(3),h:+L.h.toFixed(3),k:L.k,kind,rot:0,doors:[],layout:'rooms',outline:round3(outline),core:null,corridor:null,corridorPolys:(Lv.corridors||[]).map(q=>q.map(sc)),
    holes:[],stair:null,entrance:E?{at:sc(E.at),w:E.w==null?1.0:E.w,h:E.h,ry:+Math.atan2(Math.cos(E.th),Math.sin(E.th)).toFixed(4),steps:E.steps!==false,leaf:E.leaf!==false}:null,cells,walls};}
  // the bar (the honeycomb wall: a long block bent on an arc, K.bar {c, R, hd, a0, a1, core, door, alive(u, y, fbm)} in kit
  // units, a point at angle a lying at c + r (sin a, cos a)): a corridor down its middle, the stair core across it at `core`
  // (its doors at both ends, as the Sail's), cells either side cut every ~3.4 m, a cell left out where alive() says the block
  // has come down (the honeycomb's bite). The lobby is halls the whole depth of the block, ~10 m long, a door between each
  function bar(K,L,j,kind,broke,outline){const B=K.bar,Rc=B.R*s,hd=B.hd*s,W=.6,cx=B.c[0]*s,cz=B.c[1]*s,lobby=kind==='lobby';
   const P=(r,a)=>[+(cx+r*Math.sin(a)).toFixed(3),+(cz+r*Math.cos(a)).toFixed(3)],A=u=>B.a0+(B.a1-B.a0)*u;
   const ac=A(B.core),dc=2.7/Rc,inCore=(a,b)=>b>ac-dc&&a<ac+dc,top=(L.y+L.h)*kk,alive=u=>!B.alive||B.alive(u,top,fbm);
   const n=Math.max(2,Math.round(Rc*(B.a1-B.a0)/(lobby?10:CELL))),cells=[],walls=[],cp=[];
   const live=i=>i>=0&&i<n&&!inCore(A(i/n),A((i+1)/n))&&alive((i+.5)/n);
   for(const [r0,r1,tag] of lobby?[[Rc-hd,Rc+hd,'h']]:[[Rc-hd,Rc-W,'i'],[Rc+W,Rc+hd,'o']]){const dr=tag==='i'?r1:r0;
    for(let i=0;i<n;i++){if(!live(i))continue;const a=A(i/n),b=A((i+1)/n),m=(a+b)/2,g=(tag==='o'?0:300)+i,poly=[];
     for(let k=0;k<=3;k++)poly.push(P(r0,a+(b-a)*k/3));for(let k=3;k>=0;k--)poly.push(P(r1,a+(b-a)*k/3));
     const door=lobby?P(Rc,a):P(dr,m);cells.push({id:'s'+j+tag+i,poly,door,kind:lobby?'hall':CELLKIND[kind],open:lobby});
     if(!lobby)walls.push({a:P(dr,a),b:door,kind:'front',broken:broke(g+.25,L.y),door:'b'},{a:door,b:P(dr,b),kind:'front',broken:broke(g+.75,L.y),door:'a'});
     if(i>0){if(lobby){if(live(i-1))walls.push({a:P(r0,a),b:P(Rc,a),kind:'radial',broken:0,door:'b'},{a:P(Rc,a),b:P(r1,a),kind:'radial',broken:0,door:'a'});else walls.push({a:P(r0,a),b:P(r1,a),kind:'radial',broken:0});}
      else walls.push({a:P(r0,a),b:P(r1,a),kind:'radial',broken:broke(g,L.y)});}
     if(i<n-1&&!live(i+1))walls.push({a:P(r0,b),b:P(r1,b),kind:'radial',broken:lobby?0:broke(g+1,L.y)});}}
   if(!lobby)for(const [u0,u1] of[[B.a0,ac-dc],[ac+dc,B.a1]]){const q=[];for(let k=0;k<=8;k++)q.push(P(Rc-W,u0+(u1-u0)*k/8));for(let k=8;k>=0;k--)q.push(P(Rc+W,u0+(u1-u0)*k/8));cp.push(q);}
   // the core: its x across the block, its z along the arc (the turn that takes (0,1) to the tangent (cos a, -sin a))
   const rot=Math.atan2(-Math.cos(ac),-Math.sin(ac)),at=P(Rc,ac),cr=Math.cos(rot),sr=Math.sin(rot),Q=p=>[+(at[0]+p[0]*cr-p[1]*sr).toFixed(3),+(at[1]+p[0]*sr+p[1]*cr).toFixed(3)],C=CORE;
   walls.push({a:Q([C[0],C[2]]),b:Q([C[0],C[3]]),kind:'core',broken:0},{a:Q([C[1],C[2]]),b:Q([C[1],C[3]]),kind:'core',broken:0});
   for(const z of[C[2],C[3]])walls.push({a:Q([C[0],z]),b:Q([-.5,z]),kind:'core',broken:0},{a:Q([.5,z]),b:Q([C[1],z]),kind:'core',broken:0});
   const ad=A(B.door);
   return{j,y:+L.y.toFixed(3),h:+L.h.toFixed(3),k:L.k,kind,rot:+rot.toFixed(4),at,doors:['+z','-z'],layout:'bar',outline:round3(outline),core:CORE.slice(),corridor:null,corridorPolys:cp,
    holes:j?[{r:HOLE.slice(),at,rot:+rot.toFixed(4)}]:[],entrance:lobby&&!j?{at:P(Rc+hd,ad),w:2.0,ry:+ad.toFixed(4)}:null,cells,walls};}
  // the spine (the Sail: a lens 7 m deep at the foot, 5 m at the top, turning 0.8 rad up its height): the stair core in the
  // middle with a door at each end, a corridor along the lens's long axis, the cells either side of it out to the lining;
  // planned in the lens's own frame, then turned with the storey (core, corridor and hole stay as rects with the storey's rot)
  function spine(K,L,j,ly,kind,broke){const s_=s,a=K.a(L.y*kk)*K.inner*s_,b0=K.b(L.y*kk)*K.inner*s_,rot=K.rot(L.y*kk),c=Math.cos(rot),sn=Math.sin(rot);
   const R=p=>[+(p[0]*c-p[1]*sn).toFixed(3),+(p[0]*sn+p[1]*c).toFixed(3)],B=x=>b0*(1-Math.pow(x/a,2)),W=.55,MD=1.8;   // a narrower corridor, shallower cells: the lens is 7 m deep at most
   const xe=b0>W+MD?a*Math.sqrt(1-(W+MD)/b0):0,cells=[],walls=[];
   const CL=[CORE[2],CORE[3],CORE[0],CORE[1]];   // the core turned a quarter: its long side along the lens
   for(const sx of[1,-1]){const x0=CL[1],n=xe-x0>=2.2?Math.max(1,Math.round((xe-x0)/CELL)):0;
    // too narrow for cells: the end of the lens past the core is one open room (its door the core's)
    if((!n||kind==='lobby')&&a-x0>2.5){const poly=[];for(let k=0;k<=8;k++){const x=sx*(x0+(a-.4-x0)*k/8);poly.push([x,B(x)]);}for(let k=8;k>=0;k--){const x=sx*(x0+(a-.4-x0)*k/8);poly.push([x,-B(x)]);}
     cells.push({id:'s'+j+(sx>0?'e':'w')+'end',poly:poly.map(R),door:R([sx*x0,0]),kind:CELLKIND[kind],open:true});continue;}
    for(let i=0;i<n;i++){const u0=x0+(xe-x0)*i/n,u1=x0+(xe-x0)*(i+1)/n,X0=sx*u0,X1=sx*u1;
     for(const sz of[1,-1]){const poly=[[X0,sz*W],[X1,sz*W]];for(let k=0;k<=4;k++){const x=X1+(X0-X1)*k/4;poly.push([x,sz*B(x)]);}
      const xm=(X0+X1)/2,id='s'+j+(sx>0?'e':'w')+i+(sz>0?'n':'s');
      cells.push({id,poly:poly.map(R),door:R([xm,sz*W]),kind:CELLKIND[kind]});
      walls.push({a:R([X0,sz*W]),b:R([xm,sz*W]),kind:'front',broken:broke(i*2+(sz>0?0:1)+(sx>0?0:40)+.25,L.y),door:'b'},{a:R([xm,sz*W]),b:R([X1,sz*W]),kind:'front',broken:broke(i*2+(sz>0?0:1)+(sx>0?0:40)+.75,L.y),door:'a'});
      walls.push({a:R([X0,sz*W]),b:R([X0,sz*B(X0)]),kind:'radial',broken:broke(i*2+(sz>0?0:1)+(sx>0?0:40),L.y)});
      if(i===n-1)walls.push({a:R([X1,sz*W]),b:R([X1,sz*B(X1)]),kind:'radial',broken:broke(i*2+(sz>0?0:1)+(sx>0?0:40)+1,L.y)});}}}
   const C=CL;walls.push({a:R([C[0],C[2]]),b:R([C[1],C[2]]),kind:'core',broken:0},{a:R([C[0],C[3]]),b:R([C[1],C[3]]),kind:'core',broken:0});
   for(const x of[C[0],C[1]])walls.push({a:R([x,C[2]]),b:R([x,-.5]),kind:'core',broken:0},{a:R([x,.5]),b:R([x,C[3]]),kind:'core',broken:0});
   const outline=[];for(let k=0;k<=24;k++){const x=-a+2*a*k/24;outline.push(R([x,B(x)]));}for(let k=1;k<24;k++){const x=a-2*a*k/24;outline.push(R([x,-B(x)]));}
   const cx=Math.max(xe,a-.4,C[1]);
   return{j,y:+L.y.toFixed(3),h:+L.h.toFixed(3),k:0,kind,rot:+(rot+Math.PI/2).toFixed(4),lensRot:+rot.toFixed(4),doors:['+z','-z'],layout:'spine',outline,core:CORE.slice(),corridor:[-cx,cx,-W,W],corridorPolys:[[[-cx,-W],[cx,-W],[cx,W],[-cx,W]].map(R)],
    holes:j?[{r:HOLE.slice(),at:[0,0],rot:+(K.rot(storeys[j-1].y*kk)+Math.PI/2).toFixed(4)}]:[],entrance:kind==='lobby'&&!j?{at:R([a-.3,0]),w:2.0,ry:+(Math.PI/2-rot).toFixed(4)}:null,cells,walls};}
  // the shaft from the ground to the body: a stair core stack inside the base cone, core, or a leg, landings every storey
  // (up to the first storey's floor, not the body's foot: A's first floor is 1.1 m above it, and the shaft stopped short)
  const yS=storeys.length?storeys[0].y:y0;
  const shafts=[];if(K.shaft)for(const a of K.shaft.legs||[null]){const sh=[],n=Math.max(1,Math.round((yS-K.shaft.y0*s)/STOREY)),hh=(yS-K.shaft.y0*s)/n;
   for(let i=0;i<n;i++){const y=K.shaft.y0*s+i*hh,ym=(y+hh/2)*kk,at=a===null?[0,0]:K.shaft.at(ym,a).map(v=>v*s),r=K.shaft.r(ym)*s;
    const st={y:+y.toFixed(3),h:+hh.toFixed(3),at:[+at[0].toFixed(3),+at[1].toFixed(3)],r:+r.toFixed(3)};
    // the street door in the shell, not on the lining inside it (r is the lining's, lin of the shell's): it stood 0.9-1.5 m back in a
    // dark tunnel, and the owner saw no door on C's legs. The lobby's floor runs out to it (rOut)
    if(K.shaft.lin)st.rOut=+(r/K.shaft.lin).toFixed(3);
    if(i===0&&!K.shaft.open){const out=a===null?[0,1]:[Math.cos(a),Math.sin(a)],re=(st.rOut||r)-(a===null?.25:.45);st.entrance={at:[+(at[0]+out[0]*re).toFixed(3),+(at[1]+out[1]*re).toFixed(3)],w:2.0,ry:+Math.atan2(out[0],out[1]).toFixed(4)};
     if(a===null){const ring=[];for(let k=0;k<32;k++){const t=k/32*TAU;ring.push([r*Math.cos(t),r*Math.sin(t)]);}st.lobby=true;st.cells=quadrants(ring,'lobby','hall');}}
    sh.push(st);}
   // a leg leans (C's), so each storey's core sits a little in from the one below: every flight runs across the lean (the
   // core's x along it), and each well is widened on its -x side by the shift, so the flight below arrives through it and the
   // next flight starts on solid floor beside it
   const dl=sh.length>1?[sh[sh.length-1].at[0]-sh[0].at[0],sh[sh.length-1].at[1]-sh[0].at[1]]:[0,0],rot=Math.hypot(dl[0],dl[1])>.01?Math.atan2(dl[1],dl[0]):0;
   sh.forEach((st,i)=>{st.rot=+rot.toFixed(4);if(i){const off=Math.hypot(st.at[0]-sh[i-1].at[0],st.at[1]-sh[i-1].at[1]);st.hole={r:[+(HOLE[0]-off-.05).toFixed(3),HOLE[1],HOLE[2],HOLE[3]],at:st.at.slice(),rot:st.rot};}});
   shafts.push(sh);}
  // C: the legs' stairs arrive on the sky lobby, each through a well in its floor
  if(K.lobby==='sky'&&storeys.length&&storeys[0].kind==='lobby')storeys[0].holes=shafts.map(sh=>({r:HOLE.slice(),at:sh[sh.length-1].at.slice(),rot:sh[sh.length-1].rot}));
  // the others: the shaft's last flight arrives through a well in the first storey's floor
  else if(storeys.length)storeys[0].holes=storeys[0].holes.concat(shafts.map(sh=>({r:HOLE.slice(),at:sh[sh.length-1].at.slice(),rot:sh[sh.length-1].rot})));
  // every storey's rise to the next floor, for the stair: the storey's own height, or the gap to the next storey (the Trays)
  storeys.forEach((S,i)=>{S.rise=+((i+1<storeys.length?storeys[i+1].y:S.y+S.h)-S.y).toFixed(3);});
  return{key,name:K.name,d,s,storeys,shafts,lobby:K.lobby,body:+y0.toFixed(3),top:+yTop.toFixed(3),stairs:{core:CORE,hole:HOLE,storey:STOREY}};}
 return{plan,T,outlineLocal,STOREY,SLUM};})();
