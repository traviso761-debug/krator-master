/* ============================== HOOK: THE ANCIENT CITY'S RECORDS ([G data]) ============================== */
/* Port Hook was the port district of a far larger Ancient city (the owner's site plan, 2026-11-24: plan/hook-site-plan.html,
   PROPOSAL-METROPOLIS.md section 10; S2). This fragment lays the old city as records, nothing drawn: its blocks on the
   town's own grid (the site's `grid`: 110 m blocks on 20 m streets, the core stretch's columns, rows from z1), so the
   town's streets run on into the ruin; a tower or a heap on each by the plan's field; the downtown's ring freeway span by
   span (its west arc fallen, its south-east arc the one road in, a ramp at its south end); the Pirate Emperors' wall from
   the quays to the freeway with its two gates; the south road; the Crown on the downtown's hill; the Drowned Spire; the
   thirteen hamlets, camps and posts of the environs. Page metres in the kit's frame, as every record of Hook's; the
   plan's own geometry (HOOK_RUIN_PLAN.SITE) is in the cut's world metres (x east, z south), made from the owner's sketch
   under placement B (the sketch turned 34 degrees onto today's quays).
   The field (HOOK_RUIN.field(x, z)):
     ground   'walled' on the peninsula's ground (the spit's record), 'sunk' in the drowned downtown (its record) or water
              inside the city limits next to it, 'mainland' on dry land outside the wall, 'town' in the living town's zone
              (left to the town), null outside the limits or in the open sea
     zone     by distance from the downtown's centre over the ring's radius: 'core' (under .55), 'downtown' (under 1),
              'inner' (under 2.1), 'outer'; the zone sets the designs, so height and density fall with the distance
     wild, salvage   by the ground (cleared and picked inside the wall, wild to the crowns on the mainland) and noise
   Every record is a pure function of its lattice cell (i, j) or its index on the ring (KRAND by seed, i, j, salt), with a
   stable id ('huka.<kind>...': Huka is the Hukoa's name for the whole city), so the plan is the same in any order. No
   three.js, no DOM.
     HOOK_RUIN_PLAN(o)  -> the plan; o: natH(x, z) (kit frame), toWorld / toLocal (the frame), onSpit(wx, wz) and
                           onSunk(wx, wz) (41l's records), zone (the town's zone polygon, kit frame), grid, seed, params, site
     .field .cell .blocks .towers .heaps .pods .places .spans .ramp .wall .gates .roads .crown .spire .register(T) .report */
function HOOK_RUIN_PLAN(o){
 /* the ground read once a point: a block's middle is read by its field, its corners' pass and its record (a third of the
    plan's reads, each a full WORLD.H); the same numbers, memoized by the exact point */
 const NAT=new Map(),natH=(x,z)=>{const k=x+','+z;let v=NAT.get(k);if(v===undefined){v=o.natH(x,z);NAT.set(k,v);}return v;};
 const P=o.params||HOOK_RUIN_PLAN.PARAMS,SITE=o.site||HOOK_RUIN_PLAN.SITE,G=o.grid||{},seed=(o.seed==null?P.seed:o.seed)>>>0;
 const B=G.block==null?110:G.block,S=G.street==null?20:G.street,PITCH=B+S,Z1=G.z1==null?-150:G.z1;
 /* the column phase: the core stretch's (the rows entry with the most rows), as the town's hosts are laid (89z-rows.js) */
 let coreRow=null;for(const r of (G.rows||[]))if(!coreRow||r[2]>coreRow[2])coreRow=r;
 const X0=(coreRow?coreRow[0]:-730)+S/2+B/2,CZ0=Z1-B/2;
 const cx=i=>X0+i*PITCH,cz=j=>CZ0-j*PITCH;
 const U=(i,j,salt)=>KRAND.unit(KRAND.hash(seed,i+5000,j+5000,salt));
 const clamp=(v,a,b)=>v<a?a:v>b?b:v,smooth=(a,b,v)=>{const t=clamp((v-a)/(b-a),0,1);return t*t*(3-2*t);};
 const inPoly=(x,z,poly)=>{let c=false;for(let k=0,l=poly.length-1;k<poly.length;l=k++){const a=poly[k],b=poly[l];
  if((a[1]>z)!==(b[1]>z)&&x<(b[0]-a[0])*(z-a[1])/(b[1]-a[1])+a[0])c=!c;}return c;};
 const local=p=>o.toLocal(p[0],p[1]);
 const CTR=SITE.centre,RR=SITE.ringR,LIM=SITE.limits,ZONE=o.zone||null;
 /* THE TOWN the ruin leaves alone is its quarters (o.quarters: the site's quarter polygons, where Port Hook builds) and
    P.townMargin round them; the build zone's reserve beyond them (its south, where nothing is built yet) is the ruin's,
    so the port meets the city (the owner, 2026-11-24). With no quarters given, the zone. townD: metres off the town (0 in it) */
 const QS=o.quarters&&o.quarters.length?o.quarters:(ZONE?[ZONE]:[]);
 const polyD=(x,z,Q)=>{let d=1e9;for(let i=0,j=Q.length-1;i<Q.length;j=i++){const a=Q[j],b=Q[i],dx=b[0]-a[0],dz=b[1]-a[1],l2=Math.max(1e-9,dx*dx+dz*dz),
  t=Math.max(0,Math.min(1,((x-a[0])*dx+(z-a[1])*dz)/l2));d=Math.min(d,Math.hypot(a[0]+dx*t-x,a[1]+dz*t-z));}return d;};
 const townD=(x,z)=>{let d=1e9;for(const Q of QS){if(inPoly(x,z,Q))return 0;d=Math.min(d,polyD(x,z,Q));}return d;};
 const townAt=(x,z)=>QS.length>0&&townD(x,z)<=(o.quarters&&o.quarters.length?P.townMargin:0);
 /* THE BAND (the owner, 2026-11-24: "skyscraper stumps and medium sized ones so the port looks continuous with the city"):
    the walled ground within P.band.r of the town, where the port meets the ruin */
 const inBand=(x,z)=>QS.length>0&&townD(x,z)<=P.band.r;
 /* ---- the field */
 function zoneOf(r){const q=r/RR;return q<P.zones.core?'core':q<1?'downtown':q<P.zones.inner?'inner':'outer';}
 function field(x,z){
  const w=o.toWorld(x,z),r=Math.hypot(w[0]-CTR[0],w[1]-CTR[1]),zone=zoneOf(r);
  const out={ground:null,zone,r,h:0,wild:0,salvage:0};
  if(!inPoly(w[0],w[1],LIM))return out;
  if(townAt(x,z)){out.ground='town';return out;}
  const h=natH(x,z);out.h=h;
  if(o.onSpit(w[0],w[1]))out.ground='walled';
  else if(o.onSunk(w[0],w[1]))out.ground='sunk';
  else if(h>=0)out.ground='mainland';
  else return out;
  const n=KRAND.fbm(x*.0016+3.1,z*.0016-5.7,0,3,seed+17)-.5,Wd=P.wild[out.ground],Sv=P.salvage[out.ground];
  out.wild=clamp(Wd+n*P.wildNoise,0,1);out.salvage=clamp(Sv+n*.2,0,1);
  return out;}
 /* ---- one lattice cell: its field and its ground; null where no block stands (the sea, the town, a cliff) */
 function base(i,j){
  const x=cx(i),z=cz(j),f=field(x,z);if(!f.ground||f.ground==='town')return null;
  const hb=B/2;let lo=1e9,hi=-1e9,sum=0;
  for(const p of [[0,0],[-hb,-hb],[hb,-hb],[-hb,hb],[hb,hb]]){const v=natH(x+p[0],z+p[1]);lo=Math.min(lo,v);hi=Math.max(hi,v);sum+=v;}
  const slope=(hi-lo)/B;
  /* too steep for a block, but in the band a hill takes its ruins (the Crown's hill, the ridge): single blocks, stumps */
  if(f.ground!=='sunk'&&slope>P.maxSlope&&!(f.ground==='walled'&&slope<=P.band.maxSlope&&inBand(x,z)))return null;
  return {i,j,x,z,f,lo,hi,mean:sum/5,slope};}
 /* ---- blocks: a 2 x 2 tile is four blocks, two long ones or one square, by the tile's hash and its zone's shares, only
    where all four cells stand on one ground in one zone (a pure function of the tile) */
 const tileOf=(i,j)=>[Math.floor(i/2)*2,Math.floor(j/2)*2];
 const tiles=new Map();
 function pattern(I,J){const key=I+','+J;if(tiles.has(key))return tiles.get(key);
  const c=[base(I,J),base(I+1,J),base(I,J+1),base(I+1,J+1)];let kind='four';
  if(c.every(Boolean)&&c.every(q=>q.f.ground===c[0].f.ground&&q.f.zone===c[0].f.zone)&&
   (c[0].f.ground==='sunk'||Math.max(...c.map(q=>q.hi))-Math.min(...c.map(q=>q.lo))<=P.maxSlope*(2*B+S))){
   const u=U(I,J,1),sh=P.merge[c[0].f.zone];kind=u<sh.square?'square':u<sh.square+sh.long?'long':'four';}
  const pt={kind,c};tiles.set(key,pt);return pt;}
 /* a quarried clearing keeps its building's foundations (the owner, 2026-11-24: no complete gap between the port and the
    ruins): the footprint's outline as broken wall stubs, each side in three pieces kept by hash, 0.6 to 3.6 m high, and
    half of them a small heap of the rubble left over; plain records, each wall [x0, z0, x1, z1, h] */
 function foundation(blk,i,j){const w=blk.w,d=blk.d,fw=w*(.45+.35*U(i,j,21)),fd=d*(.45+.35*U(i,j,22));
  const fx=blk.x+(w-fw)*(U(i,j,23)-.5)*.6,fz=blk.z+(d-fd)*(U(i,j,24)-.5)*.6,C=[[fx-fw/2,fz-fd/2],[fx+fw/2,fz-fd/2],[fx+fw/2,fz+fd/2],[fx-fw/2,fz+fd/2]],walls=[];
  for(let sd=0;sd<4;sd++){const A=C[sd],Bp=C[(sd+1)%4];for(let k=0;k<3;k++){const q=30+sd*3+k;if(U(i,j,q)<.38)continue;
   const f=.55+.4*U(i,j,q+20),t0=(k+.5)/3-f/6,t1=(k+.5)/3+f/6,h=.6+3*Math.pow(U(i,j,q+40),2);
   walls.push([+(A[0]+(Bp[0]-A[0])*t0).toFixed(2),+(A[1]+(Bp[1]-A[1])*t0).toFixed(2),+(A[0]+(Bp[0]-A[0])*t1).toFixed(2),+(A[1]+(Bp[1]-A[1])*t1).toFixed(2),+h.toFixed(2)]);}}
  blk.found={id:'huka.f.'+i+'.'+j,kind:'foundation',parent:blk.id,x:+fx.toFixed(2),z:+fz.toFixed(2),y:blk.pad==null?blk.y:blk.pad,w:+fw.toFixed(2),d:+fd.toFixed(2),walls};
  if(U(i,j,25)<.5){const c=C[Math.floor(U(i,j,26)*4)%4],hx=fx+(c[0]-fx)*.55,hz=fz+(c[1]-fz)*.55;
   blk.heap={id:'huka.h.'+i+'.'+j,kind:'heap',parent:blk.id,x:+hx.toFixed(2),z:+hz.toFixed(2),y:blk.y,r:+(Math.min(w,d)*(.07+.05*U(i,j,27))).toFixed(2),wet:false,wild:blk.wild,left:true};}}
 const DES=HOOK_RUIN_PLAN.DESIGNS;
 function pick(list,u){let s=0;for(const k in list)s+=list[k];let v=u*s,last=null;for(const k in list){last=k;v-=list[k];if(v<=0)return k;}return last;}
 function stateOf(i,j,ground,band){const u=U(i,j,4),sh=band?P.band.shares:P.shares[ground];let acc=0;
  for(let k=0;k<P.STATES.length;k++){acc+=sh[k];if(u<acc)return P.STATES[k];}return P.STATES[P.STATES.length-1];}
 const GLEBE=SITE.places.find(p=>p.id==='H2'),glebe=GLEBE?local(GLEBE.at):null;
 function cell(i,j){
  const [I,J]=tileOf(i,j),pt=pattern(I,J);
  let si=1,sj=1;
  if(pt.kind==='square'){if(i!==I||j!==J)return null;si=2;sj=2;}
  else if(pt.kind==='long'){if(i!==I)return null;si=2;}
  const own=pt.c[(i-I)+2*(j-J)];if(!own)return null;
  const parts=[];for(let a=0;a<si;a++)for(let b=0;b<sj;b++)parts.push(pt.c[(i-I+a)+2*(j-J+b)]);
  const x=cx(i)+(si-1)*PITCH/2,z=cz(j)-(sj-1)*PITCH/2,w=si*B+(si-1)*S,d=sj*B+(sj-1)*S;
  const f=own.f,ground=f.ground,zone=f.zone;
  const lo=Math.min(...parts.map(q=>q.lo)),hi=Math.max(...parts.map(q=>q.hi)),mean=parts.reduce((s,q)=>s+q.mean,0)/parts.length;
  const id='huka.b.'+i+'.'+j,y=+natH(x,z).toFixed(3);
  const blk={id,kind:'block',i,j,si,sj,ground,zone,x,z,w,d,y,lo:+lo.toFixed(3),hi:+hi.toFixed(3),
   depth:ground==='sunk'?+Math.max(0,-mean).toFixed(3):0,slope:+((hi-lo)/Math.max(w,d)).toFixed(4),
   wild:+f.wild.toFixed(4),salvage:+f.salvage.toFixed(4),r:Math.round(f.r)};
  if(ground!=='sunk')blk.pad=+hi.toFixed(3);   /* the pad a dry block's building stands on: its highest corner */
  /* inside the wall the ground is cleared or reclaimed: a block may be cleared (its rubble quarried), and round the Glebe
     cleared into fields */
  const band=ground==='walled'&&inBand(x,z),hill=band&&parts.some(q=>q.slope>P.maxSlope);if(band)blk.band=true;if(hill)blk.hill=true;
  const span=si===2&&sj===2?'square':si===2?'long':'single';
  if(ground==='walled'&&U(i,j,10)<P.cleared*(band?P.band.cleared:1)){blk.use=glebe&&Math.hypot(x-glebe[0],z-glebe[1])<P.glebeR?'field':'cleared';
   if(blk.use==='cleared')foundation(blk,i,j);
   /* in the band a field keeps a skyscraper's stump standing in it now and then */
   else if(band&&span==='single'&&U(i,j,12)<P.band.fieldStump){const fam=pick(P.band.stumpFamilies,U(i,j,3));makeTower(blk,i,j,fam,'stump',false,span,f);}
   return blk;}
  if(U(i,j,2)>=(band?P.band.tower:P.tower[zone])){
   if(U(i,j,3)<P.heap[ground])blk.heap={id:'huka.h.'+i+'.'+j,kind:'heap',parent:id,x,z,y:blk.y,r:+(Math.min(w,d)*(.3+.15*U(i,j,9))).toFixed(2),
    wet:ground==='sunk',wild:blk.wild};
   return blk;}
  const fam=pick(band?P.band.families[span]:P.families[zone][span],U(i,j,3));
  makeTower(blk,i,j,fam,stateOf(i,j,ground,band),band,span,f);
  return blk;}
 function makeTower(blk,i,j,fam,state,band,span,f){const D=DES[fam],id=blk.id,ground=blk.ground,zone=blk.zone,x=blk.x,z=blk.z;
  const wildLook=state!=='intact'&&U(i,j,5)<f.wild;
  const q=Math.floor(U(i,j,6)*4),yaw=span==='long'?(q&1)*Math.PI:q*Math.PI/2;
  const lean=(state==='intact'||state==='gutted'||state==='fallen')?0:+((state==='skeleton'?2:state==='stump'?3:5)*U(i,j,8)).toFixed(3);
  blk.tower={id:'huka.t.'+i+'.'+j,kind:'tower',parent:id,family:fam,state,look:state+(wildLook?'.wild':''),key:fam+'.'+state+(wildLook?'.wild':''),
   x,z,y:ground==='sunk'?blk.y:blk.pad,yaw:+yaw.toFixed(6),lean,leanDir:+(U(i,j,7)*Math.PI*2).toFixed(4),
   w:D.w,d:D.d,roof:D.roof,tip:D.tip,design:D.kind,wet:ground==='sunk',ground,zone};
  if(blk.band)blk.tower.band=true;}
 /* ---- every cell of the city limits' lattice */
 let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9;for(const p of LIM){const q=local(p);x0=Math.min(x0,q[0]);x1=Math.max(x1,q[0]);z0=Math.min(z0,q[1]);z1=Math.max(z1,q[1]);}
 const iA=Math.floor((x0-X0)/PITCH)-1,iB=Math.ceil((x1-X0)/PITCH)+1,jA=Math.floor((CZ0-z1)/PITCH)-1,jB=Math.ceil((CZ0-z0)/PITCH)+1;
 const blocks=[];for(let j=jA;j<=jB;j++)for(let i=iA;i<=iB;i++){const b=cell(i,j);if(b)blocks.push(b);}
 const towers=blocks.filter(b=>b.tower).map(b=>b.tower),heaps=blocks.filter(b=>b.heap).map(b=>b.heap);
 const byId=new Map();for(const b of blocks)byId.set(b.id,b);
 /* ---- the landmarks: the Crown, the downtown hill's tower that still stands, the port's mark from the sea; the Drowned
    Spire, one Spindle standing to its crown in the water, the Hykkousoi's village. Each the nearest single block of its
    ground to the plan's point (ties by id), its tower set by the plan */
 function nearest(at,ground){const q=local(at);let best=null,bd=1e18;
  for(const b of blocks){if(b.ground!==ground||b.si!==1||b.sj!==1)continue;const dd=Math.hypot(b.x-q[0],b.z-q[1]);if(dd<bd||(dd===bd&&b.id<best.id)){bd=dd;best=b;}}return best;}
 function setTower(b,fam,state,extra){const D=DES[fam];delete b.heap;delete b.use;
  b.tower=Object.assign({id:'huka.t.'+b.i+'.'+b.j,kind:'tower',parent:b.id,family:fam,state,look:state,key:fam+'.'+state,x:b.x,z:b.z,
   y:b.ground==='sunk'?b.y:b.pad,yaw:0,lean:0,leanDir:0,w:D.w,d:D.d,roof:D.roof,tip:D.tip,design:D.kind,wet:b.ground==='sunk',ground:b.ground,zone:b.zone},extra);
  return b.tower;}
 const crownB=nearest(SITE.crown,'walled'),SPIRE=SITE.places.find(p=>p.id==='C1'),spireB=SPIRE?nearest(SPIRE.at,'sunk'):null;
 const crown=crownB?setTower(crownB,P.crown.family,P.crown.state,{landmark:true,name:'The Crown'}):null;
 const spire=spireB?setTower(spireB,P.spire.family,P.spire.state,{landmark:true,name:'The Drowned Spire',reclaimed:true}):null;
 const towersAll=blocks.filter(b=>b.tower).map(b=>b.tower),heapsAll=blocks.filter(b=>b.heap).map(b=>b.heap),foundAll=blocks.filter(b=>b.found).map(b=>b.found);
 /* ---- Hykkousoi pods: a ring of them on the Spire's crown, and now and then on another tower standing in the water */
 const STANDING={intact:1,gutted:1,crown:1};
 const pods=[];
 if(spire){const b=byId.get(spire.parent);for(let k=0;k<P.pods.spire;k++)pods.push({id:'huka.p.'+b.i+'.'+b.j+'.'+k,kind:'pod',parent:spire.id,x:spire.x,z:spire.z,
  y:+(spire.y+spire.roof*(.78+.2*U(b.i,b.j,20+k))).toFixed(2),a:+(k/P.pods.spire*Math.PI*2+U(b.i,b.j,30+k)*.4).toFixed(4)});}
 for(const t of towersAll){if(t===spire||!t.wet||!STANDING[t.state]||t.roof<P.pods.minRoof)continue;const b=byId.get(t.parent);if(U(b.i,b.j,11)>=P.pods.p)continue;
  const n=1+Math.floor(U(b.i,b.j,12)*2);
  for(let k=0;k<n;k++)pods.push({id:'huka.p.'+b.i+'.'+b.j+'.'+k,kind:'pod',parent:t.id,x:t.x,z:t.z,y:+(t.y+t.roof*(.4+.45*U(b.i,b.j,20+k))).toFixed(2),a:+(U(b.i,b.j,30+k)*Math.PI*2).toFixed(4)});
  t.reclaimed=true;}
 /* ---- the ring freeway: a span between each two of the plan's ring points (every 3 degrees of the sketch's angle, about
    94 m); fallen over the west arc, standing over the south-east arc (the approach), standing or broken by hash over the
    dry arc; the deck DECK m over the ground or the water under it */
 const inArc=(a,r)=>r[0]<=r[1]?a>=r[0]&&a<r[1]:a>=r[0]||a<r[1];
 const deckY=(x,z)=>+(Math.max(0,natH(x,z))+P.deck).toFixed(2);
 const spans=[];
 for(let k=0;k<SITE.ring.length;k++){const a=SITE.ring[k],b=SITE.ring[(k+1)%SITE.ring.length],am=a[2]+1.5;
  const p0=local(a),p1=local(b),mx=(p0[0]+p1[0])/2,mz=(p0[1]+p1[1])/2;
  const arc=inArc(am,SITE.arcs.fallen)?'fallen':inArc(am,SITE.arcs.approach)?'approach':'dry';
  const state=arc==='fallen'?'fallen':arc==='approach'?'standing':(U(9000,k,21)<P.dryBroken?'broken':'standing');
  spans.push({id:'huka.fw.'+a[2],kind:'span',arc,state,p0,p1,x:mx,z:mz,y:deckY(mx,mz),len:+Math.hypot(p1[0]-p0[0],p1[1]-p0[1]).toFixed(1),
   yaw:+Math.atan2(p1[0]-p0[0],p1[1]-p0[1]).toFixed(5),wet:natH(mx,mz)<0});}
 const r0=local(SITE.ramp[0]),r1=local(SITE.ramp[1]);
 const ramp={id:'huka.fw.ramp',kind:'ramp',p0:r0,p1:r1,y0:deckY(r0[0],r0[1]),y1:+Math.max(0,natH(r1[0],r1[1])).toFixed(2),state:'standing'};
 /* ---- the wall (the Pirate Emperors', of Ancient rubble, repaired by Voth, held by the Izani) and its gates */
 const w0=local(SITE.wall[0]),w1=local(SITE.wall[1]);
 const wall={id:'huka.wall',kind:'wall',p0:w0,p1:w1,len:+Math.hypot(w1[0]-w0[0],w1[1]-w0[1]).toFixed(1),h:P.wallH};
 const gates=[{id:'huka.wall.harbour',kind:'gate',name:'the harbour bastion',parent:wall.id,x:w0[0],z:w0[1],y:+Math.max(0,natH(w0[0],w0[1])).toFixed(2)},
  {id:'huka.wall.freeway',kind:'gate',name:'the Freeway Gate',parent:wall.id,x:w1[0],z:w1[1],y:+Math.max(0,natH(w1[0],w1[1])).toFixed(2)}];
 const roads=SITE.road.map((pl,k)=>({id:'huka.road.'+k,kind:'road',pts:pl.map(local)}));
 /* ---- the places of the environs (records here; drawn later on core/hamlet and core/camp) */
 const places=SITE.places.map(p=>{const q=local(p.at),h=natH(q[0],q[1]);
  const pl={id:'huka.'+p.id.toLowerCase(),code:p.id,name:p.name,kind:p.kind,x:q[0],z:q[1],y:+Math.max(0,h).toFixed(2),ground:h<0?'water':'land',
   inside:!!o.onSpit(p.at[0],p.at[1]),culture:p.culture,people:p.people,work:p.work};
  if(p.id==='C1'&&spire){pl.parent=spire.id;pl.y=+(spire.y+spire.roof*.7).toFixed(2);}
  if(p.id==='C3'){let best=null,bd=1e18;for(const s of spans)if(s.state!=='fallen'){const dd=Math.hypot(s.x-q[0],s.z-q[1]);if(dd<bd){bd=dd;best=s;}}
   if(best){pl.parent=best.id;pl.y=best.y;}}
  return pl;});
 /* ---- core/tags: a record each, parents first */
 const tagState=t=>t.state==='fallen'?'toppled':t.reclaimed?'reclaimed':t.state==='intact'?'intact':
  (byId.get(t.parent).salvage>=.5?'salvage':'ruined');
 function register(T){let n=0;const add=r=>{T.add(r);n++;};
  for(const b of blocks)add({id:b.id,class:'feature',kind:'block',key:b.ground+'.'+(b.si*b.sj),name:'Ancient block '+b.i+','+b.j,at:[b.x,b.ground==='sunk'?b.y:b.pad,b.z],
   size:[b.w,b.d,1],tags:{culture:'ancient',state:b.use?'salvage':'ruined',district:b.zone,quarter:b.ground},note:(b.use||'')+' wild '+b.wild});
  for(const t of towersAll)add({id:t.id,class:t.landmark?'landmark':'building',kind:'ruin',key:t.key,parent:t.parent,name:t.name||(DES[t.family].name+' ('+t.look+')'),
   at:[t.x,t.y,t.z],ry:t.yaw,size:[t.w,t.d,t.tip],tags:{culture:'ancient',state:tagState(t),family:t.family,variant:t.look,district:t.zone,quarter:t.ground,landmark:!!t.landmark}});
  for(const f of foundAll)add({id:f.id,class:'feature',kind:'foundation',key:'cleared',parent:f.parent,name:'Ancient foundations',at:[f.x,f.y,f.z],
   size:[f.w,f.d,Math.max(...f.walls.map(q=>q[4]),.5)],tags:{culture:'ancient',state:'salvage'},note:f.walls.length+' wall stubs'});
  for(const h of heapsAll)add({id:h.id,class:'feature',kind:'heap',key:h.wet?'island':'heap',parent:h.parent,name:h.wet?'Rubble island':'Rubble heap',at:[h.x,h.y,h.z],r:h.r,h:4,
   tags:{culture:'ancient',state:'toppled'}});
  for(const p of pods)add({id:p.id,class:'building',kind:'pod',key:'hyk-pod',parent:p.parent,name:'Hykkousoi pod',at:[p.x,p.y,p.z],ry:p.a,size:[12,12,10],
   tags:{culture:'hykkousoi',state:'reclaimed'}});
  add({id:'huka.fw',class:'infrastructure',kind:'freeway',key:'ring',name:'The ring freeway',at:[local(SITE.centre)[0],P.deck,local(SITE.centre)[1]],r:RR,h:P.deck,
   tags:{culture:'ancient',state:'ruined'},note:spans.filter(s=>s.state==='fallen').length+' spans fallen'});
  for(const s of spans)add({id:s.id,class:'infrastructure',kind:'span',key:s.state,parent:'huka.fw',name:'Freeway span ('+s.arc+')',at:[s.x,s.y,s.z],ry:s.yaw,size:[24,s.len,4],
   tags:{culture:'ancient',state:s.state==='fallen'?'toppled':'ruined',part:s.arc}});
  add({id:ramp.id,class:'infrastructure',kind:'ramp',key:'south',parent:'huka.fw',name:'The south ramp',at:[(ramp.p0[0]+ramp.p1[0])/2,(ramp.y0+ramp.y1)/2,(ramp.p0[1]+ramp.p1[1])/2],
   size:[24,Math.hypot(ramp.p1[0]-ramp.p0[0],ramp.p1[1]-ramp.p0[1]),4],tags:{culture:'ancient',state:'ruined'}});
  add({id:wall.id,class:'infrastructure',kind:'wall',key:'city-wall',name:'The city wall',at:[(w0[0]+w1[0])/2,0,(w0[1]+w1[1])/2],ry:Math.atan2(w1[0]-w0[0],w1[1]-w0[1]),size:[8,wall.len,wall.h],
   tags:{culture:'iziz',state:'rehab',style:'pirate-emperors'}});
  for(const g of gates)add({id:g.id,class:'infrastructure',kind:'gate',key:g.id.split('.').pop(),parent:wall.id,name:g.name,at:[g.x,g.y,g.z],size:[30,20,16],tags:{culture:'iziz',state:'rehab'}});
  for(const r of roads)add({id:r.id,class:'infrastructure',kind:'road',key:'south-road',name:'The south road',at:[r.pts[0][0],0,r.pts[0][1]],size:[8,1,1],tags:{state:'ruined'}});
  for(const p of places)add({id:p.id,class:'feature',kind:p.kind,key:p.code,parent:p.parent,name:p.name,at:[p.x,p.y,p.z],r:p.kind==='hamlet'?120:p.kind==='post'?30:60,h:10,
   tags:{culture:p.culture,role:p.work},note:p.people+' people; '+(p.inside?'inside':'outside')+' the wall'});
  return n;}
 /* ---- the report */
 const cell2=PITCH*PITCH/1e6,count=(arr,k)=>{const c={};for(const x of arr)c[x[k]]=(c[x[k]]||0)+1;return c;};
 const km2={};for(const b of blocks)km2[b.ground]=+((km2[b.ground]||0)+b.si*b.sj*cell2).toFixed(2);
 const roof={};for(const z of ['core','downtown','inner','outer']){const t=towersAll.filter(q=>q.zone===z);roof[z]=t.length?Math.round(t.reduce((s,q)=>s+q.roof,0)/t.length):0;}
 const report={lattice:{X0,CZ0,pitch:PITCH,i:[iA,iB],j:[jA,jB]},km2,blocks:blocks.length,towers:towersAll.length,heaps:heapsAll.length,foundations:foundAll.length,pods:pods.length,
  byGround:count(blocks,'ground'),byZone:count(towersAll,'zone'),meanRoof:roof,states:count(towersAll,'state'),
  cleared:blocks.filter(b=>b.use).length,spans:count(spans,'state'),places:places.length,crown:crown?crown.id:null,spire:spire?spire.id:null};
 return {townAt,townD,field,cell,blocks,towers:towersAll,heaps:heapsAll,foundations:foundAll,pods,spans,ramp,wall,gates,roads,places,crown,spire,register,report,cx,cz,PITCH};}
/* the designs the ruin stands (kits/metropolis: 46-mp-designs.js MP.DESIGNS, 40-mp-records.js MP.FAMILY for the Spindle and
   the Ledger, 46f-mp-farm.js for the Soleri farms): footprint (w along the record's x, d along its z), roof and tip, kind.
   Copied because Hook's page does not load the kit; tests/test-hook-ruin.js checks every row against the kit's records */
HOOK_RUIN_PLAN.DESIGNS={
 spindle:{name:'The Spindle',w:92,d:92,roof:234,tip:262,kind:'skyscraper'},ledger:{name:'The Ledger',w:126,d:24,roof:48.6,tip:57,kind:'midrise'},
 organ:{name:'The Organ',w:96,d:34,roof:228,tip:240,kind:'skyscraper'},wedge:{name:'The Wedge',w:64,d:56,roof:188,tip:188,kind:'skyscraper'},
 yoke:{name:'The Yoke',w:124,d:46,roof:172,tip:196,kind:'skyscraper'},reed:{name:'The Reed',w:58,d:24,roof:204,tip:204,kind:'skyscraper'},
 telescope:{name:'The Telescope',w:62,d:62,roof:176,tip:188,kind:'skyscraper'},stalk:{name:'The Stalk',w:68,d:68,roof:156,tip:236,kind:'skyscraper'},
 swell:{name:'The Swell',w:80,d:80,roof:196,tip:200,kind:'skyscraper'},
 terrace:{name:'The Terrace',w:128,d:128,roof:42,tip:42,kind:'midrise'},cupola:{name:'The Cupola',w:104,d:104,roof:24,tip:44,kind:'midrise'},
 crescent:{name:'The Long Curve',w:180,d:60,roof:36,tip:36,kind:'midrise'},terrarium:{name:'The Terrarium',w:80,d:80,roof:66,tip:66,kind:'midrise'},
 arcades:{name:'The Arcades',w:84,d:52,roof:26,tip:26,kind:'midrise'},pods:{name:'The Pods',w:120,d:84,roof:48,tip:52,kind:'midrise'},
 spiral:{name:'The Spiral',w:68,d:68,roof:30,tip:38,kind:'midrise'},
 stack:{name:'The Growing Stack',w:64,d:72,roof:35,tip:37.5,kind:'farm'},vault:{name:'The Vault House',w:100,d:40,roof:18,tip:21.6,kind:'farm'},
 watertower:{name:'The Water Tower',w:36,d:36,roof:46,tip:54,kind:'farm'},hall:{name:'The Hub Hall',w:64,d:64,roof:15.6,tip:27,kind:'farm'}};
/* the plan's numbers (the owner's site plan and answers, 2026-11-24; plan/hook-site-plan.html) */
HOOK_RUIN_PLAN.PARAMS={
 seed:0x48554b41,
 zones:{core:.55,inner:2.1},maxSlope:.45,townMargin:60,
 /* the band where the port meets the ruin (the owner, 2026-11-24): the walled ground within r m of the town's zone; its
    hills taken up to maxSlope; a block cleared at `cleared` of the walled share, a building on `tower` of them, skyscraper
    stumps and broken towers among gutted mid-rises (`families`, `shares` in STATES' order), a field's stump at fieldStump */
 band:{r:900,maxSlope:1.2,cleared:.3,tower:.9,fieldStump:.3,shares:[0,.3,.04,.18,.38,.1,0],
  families:{single:{spindle:2,organ:1,reed:2,wedge:1,swell:1,telescope:1,terrarium:2,cupola:1,spiral:1},long:{yoke:1,ledger:2,crescent:2,pods:2},square:{terrace:2}},
  stumpFamilies:{spindle:2,reed:2,wedge:1,swell:1,organ:1,telescope:1}},
 STATES:['intact','gutted','crown','broken','stump','skeleton','fallen'],
 /* the states' shares by ground: inside the wall picked clean (the tops taken, the shells stripped); drowned (cut down to
    the water, a few standing clear); the mainland as the valley's far ruin (AV.RUIN_CUTS, the owner's "further still") */
 shares:{walled:[0,.28,.08,.18,.32,.09,.05],sunk:[.02,.06,.08,.24,.28,.14,.18],mainland:[.02,.05,.08,.22,.25,.16,.22]},
 wild:{walled:.15,sunk:.5,mainland:.85},salvage:{walled:.8,sunk:.4,mainland:.15},wildNoise:.3,
 cleared:.45,glebeR:650,
 /* a block's tower by its zone: density and height fall with the distance from the downtown */
 tower:{core:.92,downtown:.8,inner:.55,outer:.22},heap:{walled:.1,sunk:.55,mainland:.4},
 merge:{core:{square:.05,long:.2},downtown:{square:.08,long:.2},inner:{square:.12,long:.18},outer:{square:.1,long:.15}},
 families:{
  core:{single:{spindle:3,stalk:2,telescope:2,organ:2,swell:1},long:{yoke:2,ledger:1},square:{crescent:1}},
  downtown:{single:{reed:3,wedge:2,telescope:2,stalk:1,swell:1,spindle:1},long:{yoke:1,ledger:2,crescent:1},square:{terrace:1}},
  inner:{single:{terrarium:2,spiral:2,cupola:2,arcades:2},long:{crescent:2,pods:2,ledger:1},square:{terrace:2}},
  outer:{single:{stack:2,watertower:1,hall:2,arcades:1,spiral:1},long:{vault:2,pods:1},square:{terrace:1}}},
 crown:{family:'spindle',state:'gutted'},spire:{family:'spindle',state:'crown'},
 pods:{spire:6,p:.12,minRoof:120},
 deck:14,dryBroken:.3,wallH:12};
/* the site plan in the cut's world metres (x east, z south), GENERATED from the owner's sketch under placement B (the
   sketch turned 34 degrees onto today's quays; plan/hook-site-plan.html): the downtown's centre and the ring freeway's radius,
   its points every 3 degrees of the sketch's angle [x, z, angle], the arcs (sketch degrees), the ramp, the south road,
   the wall, the city limits, the Crown and the places */
﻿﻿﻿HOOK_RUIN_PLAN.SITE={"centre":[-418,1594],"ringR":1786,"ring":[[1070,605,0],[1120,685,3],[1165,766,6],[1206,850,9],[1243,936,12],[1275,1024,15],[1303,1113,18],[1326,1204,21],[1344,1296,24],[1357,1388,27],[1365,1482,30],[1368,1575,33],[1367,1669,36],[1361,1762,39],[1349,1855,42],[1333,1947,45],[1312,2038,48],[1287,2128,51],[1257,2216,54],[1222,2303,57],[1182,2388,60],[1139,2471,63],[1090,2551,66],[1038,2628,69],[982,2703,72],[922,2775,75],[859,2843,78],[791,2908,81],[721,2970,84],[647,3028,87],[571,3081,90],[492,3131,93],[410,3177,96],[326,3218,99],[240,3254,102],[152,3287,105],[63,3314,108],[-28,3337,111],[-120,3355,114],[-212,3368,117],[-305,3376,120],[-399,3380,123],[-492,3378,126],[-586,3372,129],[-678,3361,132],[-771,3345,135],[-862,3324,138],[-952,3298,141],[-1040,3268,144],[-1127,3233,147],[-1212,3194,150],[-1294,3150,153],[-1375,3102,156],[-1452,3050,159],[-1527,2993,162],[-1599,2933,165],[-1667,2870,168],[-1732,2803,171],[-1794,2732,174],[-1851,2659,177],[-1905,2582,180],[-1955,2503,183],[-2000,2421,186],[-2041,2337,189],[-2078,2251,192],[-2110,2163,195],[-2138,2074,198],[-2161,1983,201],[-2179,1892,204],[-2192,1799,207],[-2200,1706,210],[-2203,1612,213],[-2202,1519,216],[-2196,1426,219],[-2184,1333,222],[-2168,1241,225],[-2147,1150,228],[-2122,1060,231],[-2092,971,234],[-2057,884,237],[-2017,800,240],[-1974,717,243],[-1926,637,246],[-1873,559,249],[-1817,484,252],[-1757,413,255],[-1694,344,258],[-1626,279,261],[-1556,218,264],[-1482,160,267],[-1406,106,270],[-1327,56,273],[-1245,11,276],[-1161,-30,279],[-1075,-67,282],[-987,-99,285],[-898,-127,288],[-807,-149,291],[-715,-167,294],[-623,-180,297],[-530,-189,300],[-436,-192,303],[-343,-191,306],[-249,-184,309],[-157,-173,312],[-65,-157,315],[27,-136,318],[117,-111,321],[205,-80,324],[292,-45,327],[377,-6,330],[459,38,333],[539,86,336],[617,138,339],[692,194,342],[764,254,345],[832,318,348],[897,385,351],[959,455,354],[1016,529,357]],"arcs":{"fallen":[120,240],"approach":[30,120]},"ramp":[[922,2775],[1926,2908]],"road":[[[1926,2908],[1106,5098],[-256,6738]],[[1926,2908],[3818,3121],[4998,3317]]],"wall":[[1750,-600],[1364,1474]],"limits":[[3507,-2496],[3759,-2226],[3994,-1934],[4088,-1573],[4169,-1214],[4153,-837],[4139,-474],[4083,-119],[4060,224],[4074,563],[4105,908],[4113,1260],[4080,1611],[4009,1956],[3859,2276],[3687,2583],[3496,2876],[3298,3160],[3059,3412],[2783,3623],[2516,3833],[2247,4033],[1992,4248],[1729,4458],[1450,4650],[1169,4849],[877,5043],[572,5246],[249,5429],[-100,5547],[-458,5685],[-829,5695],[-1197,5621],[-1558,5552],[-1906,5429],[-2229,5241],[-2541,5061],[-2834,4860],[-3122,4668],[-3394,4459],[-3656,4244],[-3920,4034],[-4138,3777],[-4379,3545],[-4615,3304],[-4800,3023],[-4988,2743],[-5157,2451],[-5333,2157],[-5490,1850],[-5582,1519],[-5651,1181],[-5712,842],[-5718,498],[-5745,151],[-5747,-197],[-5783,-557],[-5791,-924],[-5716,-1278],[-5617,-1630],[-5520,-1987],[-5383,-2333],[-5099,-2588],[-4780,-2801],[-4475,-3003],[-4181,-3198],[-3897,-3392],[-3609,-3576],[-3329,-3763],[-3048,-3956],[-2759,-4143],[-2449,-4296],[-2125,-4415],[-1792,-4511],[-1450,-4568],[-1106,-4617],[-757,-4598],[-415,-4554],[-69,-4530],[266,-4453],[595,-4353],[911,-4218],[1220,-4075],[1525,-3924],[1825,-3765],[2116,-3583],[2402,-3394],[2708,-3213],[3002,-3010],[3297,-2790]],"crown":[-416,647],"places":[{"id":"H1","name":"Lantern Point","kind":"hamlet","at":[-2747,-3125],"culture":"islander","people":180,"work":"fishing"},{"id":"H2","name":"The Glebe","kind":"hamlet","at":[-2244,847],"culture":"iziz","people":300,"work":"farming"},{"id":"H3","name":"Breakers' Yard","kind":"hamlet","at":[-951,1213],"culture":"ancients-salvage","people":250,"work":"salvage"},{"id":"H4","name":"Freeway Gate","kind":"hamlet","at":[1014,1272],"culture":"iziz","people":150,"work":"way station"},{"id":"P1","name":"Signal Hill","kind":"post","at":[-2735,-472],"culture":"iziz","people":30,"work":"signal post"},{"id":"C1","name":"Drowned Spire","kind":"camp","at":[-954,3000],"culture":"hykkousoi","people":200,"work":"village in a tower"},{"id":"C2","name":"Mangrove stilts","kind":"camp","at":[-584,4400],"culture":"islander","people":60,"work":"seasonal"},{"id":"C3","name":"Deck camp","kind":"camp","at":[433,3164],"culture":"ancients-salvage","people":30,"work":"venture"},{"id":"C4","name":"South Ramp post","kind":"post","at":[1926,2908],"culture":"iziz","people":20,"work":"patrol post"},{"id":"C5","name":"Charcoal burners","kind":"camp","at":[782,5138],"culture":"islander","people":40,"work":"seasonal"},{"id":"C6","name":"Salt pans","kind":"hamlet","at":[-4,6326],"culture":"islander","people":120,"work":"salt"},{"id":"C7","name":"Timber camp","kind":"camp","at":[3017,-1773],"culture":"iziz","people":50,"work":"venture"},{"id":"C8","name":"Hunters' camp","kind":"camp","at":[4124,1079],"culture":"iziz","people":15,"work":"seasonal"}]};
/* the page's plan: on Hook's ground (75d), the site plan's landforms (core/world 41l: the walled peninsula is the spit's
   record, the drowned downtown lf_hook_sunk) and the site's grid and zone */
const HOOK_RUIN=(function(){
 const rec=id=>WLAND.benches.find(b=>b.id===id),SPIT=rec('lf_hook_spit'),SUNK=rec('lf_hook_sunk');
 const on=b=>(x,z)=>!!b&&WLAND.benchD(b,x,z)===0;
 const Z=(HOOK_SITE.districts||[]).find(d=>d.type==='zone');
 return HOOK_RUIN_PLAN({natH:HOOK_WORLD.natH,toWorld:HOOK_WORLD.toWorld,toLocal:HOOK_WORLD.toLocal,onSpit:on(SPIT),onSunk:on(SUNK),
  zone:Z?Z.poly:null,quarters:(HOOK_SITE.districts||[]).filter(d=>d.type==='quarter').map(d=>d.poly),grid:HOOK_SITE.grid});})();
