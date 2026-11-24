/* ============================== HUKA: THE RUIN'S RECORDS ([G data]) ============================== */
/* Huka is the whole Ancient city; Hook, the living town, is its harbour third (PROPOSAL-METROPOLIS.md, the owner's answers
   2026-11-24). This is phase M1: the other two thirds as records, nothing drawn. The Sunk City stands in the lagoon south
   of the spit, the Scarp City up the plateau's west and north faces; both on ONE Ancient grid, the port's own (the site's
   `grid`: 110 m blocks on 20 m streets, the core stretch's columns, rows from z1 inland), so the town's streets run on into
   the ruin. Page metres in the kit's frame (x along the coast, +z the sea), as every record of Hook's.
   Every record is a pure function of its lattice cell (i, j) and the fields: KRAND seeded by (seed, i, j, salt), never by
   a draw count, so the plan is the same in any order and a record keeps its id when its neighbours change. No three.js,
   no DOM: Godot and the open world take the same records.
     HOOK_RUIN_PLAN(o)      -> the plan from its inputs (below); HOOK_RUIN is the page's, on Hook's ground
       o.natH(x, z)            the natural ground, sea level 0 (HOOK_WORLD.natH)
       o.spit(x, z)            'spit' on the living port's bench, 'wall' on the hook's shank or barb (the old sea wall),
                               null elsewhere (core/world 41l's benches, through HOOK_WORLD.toWorld)
       o.portD(x, z)           metres to the living port (the spit's bench: 0 on it)
       o.grid                  the site's grid ({z1, block, street, rows}); o.seed; o.params (HOOK_RUIN_PLAN.PARAMS)
     .field(x, z)           -> {third: 'port' | 'sunk' | 'scarp' | null, h, wild, salvage, portD}: the ruin-state field
     .cell(i, j)            -> the block anchored at lattice cell (i, j) with its tower and heap, or null
     .blocks .towers .heaps .pods .villages .camps .spine   the records (each with a stable id 'huka.<kind>.<i>.<j>')
     .landmark              the crest's tower (the city's mark seen from the harbour)
     .register(T)           every record into a core/tags registry, parents before children; returns the count
     .report                the numbers the README quotes (areas, counts, shares) */
function HOOK_RUIN_PLAN(o){
 const P=o.params||HOOK_RUIN_PLAN.PARAMS,G=o.grid||{},seed=(o.seed==null?P.seed:o.seed)>>>0;
 const B=G.block==null?110:G.block,S=G.street==null?20:G.street,PITCH=B+S,Z1=G.z1==null?-150:G.z1;
 /* the column phase: the core stretch's (the rows entry with the most rows: the Customs to the Arsenal), as the town's
    hosts are laid there (targets/hook/89z-rows.js: the first column's west edge at xa + S/2) */
 let core=null;for(const r of (G.rows||[]))if(!core||r[2]>core[2])core=r;
 const X0=(core?core[0]:-730)+S/2+B/2,CZ0=Z1-B/2;
 const cx=i=>X0+i*PITCH,cz=j=>CZ0-j*PITCH;
 const U=(i,j,salt)=>KRAND.unit(KRAND.hash(seed,i+5000,j+5000,salt));
 const clamp=(v,a,b)=>v<a?a:v>b?b:v,smooth=(a,b,v)=>{const t=clamp((v-a)/(b-a),0,1);return t*t*(3-2*t);};
 const inPoly=(x,z,poly)=>{let c=false;for(let k=0,l=poly.length-1;k<poly.length;l=k++){const a=poly[k],b=poly[l];
  if((a[1]>z)!==(b[1]>z)&&x<(b[0]-a[0])*(z-a[1])/(b[1]-a[1])+a[0])c=!c;}return c;};
 /* ---- the ruin-state field: which third, how wild, how picked over (the owner's gradient: picked clean with paths near
    the port, wilder with distance, jungle to the crowns in the far lagoon and up the scarp) */
 function field(x,z){
  const h=o.natH(x,z),sp=o.spit(x,z),d=o.portD(x,z);
  let third=null;
  if(sp==='spit')third='port';
  else if(inPoly(x,z,P.extent))third=(h<0||sp==='wall')?'sunk':h<=P.scarpTop?'scarp':null;
  const n=KRAND.fbm(x*.0016+3.1,z*.0016-5.7,0,3,seed+17);
  const up=third==='scarp'?smooth(0,P.scarpTop,h)*P.wildUp:0;
  const wild=third&&third!=='port'?clamp(smooth(P.wild0,P.wild1,d)+up+(n-.5)*P.wildNoise,0,1):0;
  const salvage=third&&third!=='port'?1-smooth(0,P.salvageR,d):0;
  return {third,h,wild,salvage,portD:d};}
 /* the spine: the Hook's axis (the site's a-axis, the pier's line) run on south across the lagoon, an Ancient avenue
    2 spineHalf wide; a block whose edge would stand on it stays free */
 const spineX=P.spineX,onSpine=x=>Math.abs(x-spineX)-B/2<P.spineHalf;
 /* one lattice cell: its field and its ground; null where no block can stand */
 function base(i,j){
  if(j<P.jMin)return null;
  const x=cx(i),z=cz(j);if(onSpine(x))return null;
  const f=field(x,z);if(!f.third||f.third==='port')return null;
  const hb=B/2;let lo=1e9,hi=-1e9,sum=0;
  for(const p of [[0,0],[-hb,-hb],[hb,-hb],[-hb,hb],[hb,hb]]){const v=o.natH(x+p[0],z+p[1]);lo=Math.min(lo,v);hi=Math.max(hi,v);sum+=v;}
  const slope=(hi-lo)/B;
  if(f.third==='scarp'&&slope>P.maxSlope)return null;
  return {i,j,x,z,f,lo,hi,mean:sum/5,slope};}
 /* ---- blocks: a 2 x 2 tile of cells is four blocks, two long ones (2 x 1, each row) or one square, by the tile's hash;
    a merge only where all four cells stand in the same third (a pure function of the tile, so the same in any order) */
 const tileOf=(i,j)=>[Math.floor(i/2)*2,Math.floor(j/2)*2];
 function pattern(I,J){
  const c=[base(I,J),base(I+1,J),base(I,J+1),base(I+1,J+1)];
  if(!c.every(Boolean))return {kind:'four',c};
  const t=c[0].f.third;if(!c.every(q=>q.f.third===t))return {kind:'four',c};
  if(t==='scarp'&&Math.max(...c.map(q=>q.hi))-Math.min(...c.map(q=>q.lo))>P.maxSlope*(2*B+S))return {kind:'four',c};
  const u=U(I,J,1),sh=P.merge[t];
  return {kind:u<sh.square?'square':u<sh.square+sh.long?'long':'four',c};}
 const DES=HOOK_RUIN_PLAN.DESIGNS;
 function pick(list,u){let s=0;for(const k in list)s+=list[k];let v=u*s,last=null;for(const k in list){last=k;v-=list[k];if(v<=0)return k;}return last;}
 function stateOf(i,j,f){
  /* the shares: near the port the salvagers' (the tops taken, the shells stripped: gutted and stump), far off the
     valley's (biomes/ancientsvalley/src/41-av-field.js AV.RUIN_CUTS, the owner's "further still"), blended by salvage */
  const u=U(i,j,4),near=P.sharesNear,far=P.sharesFar;let acc=0;
  for(let k=0;k<P.STATES.length;k++){acc+=near[k]*f.salvage+far[k]*(1-f.salvage);if(u<acc)return P.STATES[k];}
  return P.STATES[P.STATES.length-1];}
 /* the block anchored at (i, j): its span (si, sj), its ground, its tower or heap */
 function cell(i,j){
  const [I,J]=tileOf(i,j),pt=pattern(I,J);
  let si=1,sj=1;
  if(pt.kind==='square'){if(i!==I||j!==J)return null;si=2;sj=2;}
  else if(pt.kind==='long'){if(i!==I)return null;si=2;}
  const own=pt.c[(i-I)+2*(j-J)];if(!own)return null;
  const parts=[];for(let a=0;a<si;a++)for(let b=0;b<sj;b++)parts.push(pt.c[(i-I+a)+2*(j-J+b)]);
  const x=cx(i)+(si-1)*PITCH/2,z=cz(j)-(sj-1)*PITCH/2,w=si*B+(si-1)*S,d=sj*B+(sj-1)*S;
  const f=field(x,z),third=own.f.third;
  const lo=Math.min(...parts.map(q=>q.lo)),hi=Math.max(...parts.map(q=>q.hi)),mean=parts.reduce((s,q)=>s+q.mean,0)/parts.length;
  const id='huka.b.'+i+'.'+j;
  const blk={id,kind:'block',i,j,si,sj,third,x,z,w,d,y:+o.natH(x,z).toFixed(3),lo:+lo.toFixed(3),hi:+hi.toFixed(3),
   depth:third==='sunk'?+Math.max(0,-mean).toFixed(3):0,slope:+((hi-lo)/Math.max(w,d)).toFixed(4),
   wild:+f.wild.toFixed(4),salvage:+f.salvage.toFixed(4),ring:Math.floor(f.portD/500)};
  /* the pad a scarp block's building stands on: its highest corner, cut into the slope (M3 checks the batter) */
  if(third==='scarp')blk.pad=+hi.toFixed(3);
  const span=si===2&&sj===2?'square':si===2?'long':'single';
  const pT=P.tower[third];
  if(U(i,j,2)>=pT){
   /* no tower: a heap of the block's fallen rubble (a KRUBBLE island in the lagoon), or open ground */
   if(U(i,j,3)<P.heap[third])blk.heap={id:'huka.h.'+i+'.'+j,kind:'heap',parent:id,x,z,y:blk.y,r:+(Math.min(w,d)*(.3+.15*U(i,j,9))).toFixed(2),
    wet:third==='sunk',wild:blk.wild};
   return blk;}
  const fam=pick(P.families[third][span],U(i,j,3)),D=DES[fam];
  const state=stateOf(i,j,f),wildLook=U(i,j,5)<f.wild;
  /* a rectangle keeps its long side along the span's long side; else a quarter turn by hash */
  const q=Math.floor(U(i,j,6)*4),yaw=span==='long'?(q&1)*Math.PI:q*Math.PI/2;
  const lean=(state==='intact'||state==='gutted'||state==='fallen')?0:+((state==='skeleton'?2:state==='stump'?3:5)*U(i,j,8)).toFixed(3);
  blk.tower={id:'huka.t.'+i+'.'+j,kind:'tower',parent:id,family:fam,state,look:state+(wildLook?'.wild':''),key:fam+'.'+state+(wildLook?'.wild':''),
   x,z,y:third==='scarp'?blk.pad:blk.y,yaw:+yaw.toFixed(6),lean,leanDir:+(U(i,j,7)*Math.PI*2).toFixed(4),
   w:D.w,d:D.d,roof:D.roof,tip:D.tip,design:D.kind,wet:third==='sunk',third};
  return blk;}
 /* ---- every cell of the extent's lattice */
 let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9;for(const p of P.extent){x0=Math.min(x0,p[0]);x1=Math.max(x1,p[0]);z0=Math.min(z0,p[1]);z1=Math.max(z1,p[1]);}
 const iA=Math.floor((x0-X0)/PITCH)-1,iB=Math.ceil((x1-X0)/PITCH)+1,jA=Math.max(P.jMin,Math.floor((CZ0-z1)/PITCH)-1),jB=Math.ceil((CZ0-z0)/PITCH)+1;
 const blocks=[];for(let j=jA;j<=jB;j++)for(let i=iA;i<=iB;i++){const b=cell(i,j);if(b)blocks.push(b);}
 const towers=blocks.filter(b=>b.tower).map(b=>b.tower),heaps=blocks.filter(b=>b.heap).map(b=>b.heap);
 /* ---- the crest's landmark: the scarp's highest standing pad (ties by id), its tower made the city's mark from the harbour,
    a tall design standing to its crown */
 let crest=null;for(const b of blocks)if(b.third==='scarp'&&b.tower&&b.si===1&&(!crest||b.pad>crest.pad||(b.pad===crest.pad&&b.id<crest.id)))crest=b;
 if(crest){const t=crest.tower,D=DES[P.crest.family];Object.assign(t,{family:P.crest.family,state:P.crest.state,look:P.crest.state+'.wild',
  key:P.crest.family+'.'+P.crest.state+'.wild',w:D.w,d:D.d,roof:D.roof,tip:D.tip,design:D.kind,lean:0,landmark:true});}
 /* ---- the ruin's people (the owner's answer 3; drawn in later phases, placed here): Hykkousoi pods on the towers that still
    stand in the water, Hukoa stilt villages among the drowned stumps, salvagers' camps on dry ground at the ruin's edge.
    A village or camp is the best-scoring candidate of its sector (P.sector m squares), by hash: one per sector at most */
 const STANDING={intact:1,gutted:1,crown:1};
 const pods=[];for(const t of towers){const b=blocks.find(q=>q.id===t.parent);
  if(t.wet&&STANDING[t.state]&&t.roof>=P.pods.minRoof&&!t.landmark&&U(b.i,b.j,11)<P.pods.p){
   const n=1+Math.floor(U(b.i,b.j,12)*P.pods.max);
   for(let k=0;k<n;k++)pods.push({id:'huka.p.'+b.i+'.'+b.j+'.'+k,kind:'pod',parent:t.id,x:t.x,z:t.z,
    y:+(t.y+t.roof*(.35+.5*U(b.i,b.j,20+k))).toFixed(2),a:+(U(b.i,b.j,30+k)*Math.PI*2).toFixed(4)});
   t.reclaimed=true;}}
 const sectorOf=b=>Math.floor(b.x/P.sector)+','+Math.floor(b.z/P.sector);
 function bestPer(cands,score){const by={};for(const c of cands){const k=sectorOf(c),s=score(c);if(!by[k]||s>by[k].s||(s===by[k].s&&c.id<by[k].c.id))by[k]={c,s};}
  return Object.keys(by).sort().map(k=>by[k].c);}
 const LOW={stump:1,broken:1,skeleton:1,fallen:1};
 const vCand=blocks.filter(b=>b.third==='sunk'&&b.depth>=P.villages.depth[0]&&b.depth<=P.villages.depth[1]&&b.wild>=P.villages.wild[0]&&b.wild<=P.villages.wild[1]&&
  (!b.tower||LOW[b.tower.state]));
 const villages=bestPer(vCand,b=>U(b.i,b.j,13)).filter(b=>U(b.i,b.j,14)<P.villages.p).map(b=>{
  const near=towers.filter(t=>t.wet&&LOW[t.state]&&Math.hypot(t.x-b.x,t.z-b.z)<=P.villages.r).map(t=>t.id).sort();
  for(const t of towers)if(near.indexOf(t.id)>=0)t.reclaimed=true;
  return {id:'huka.v.'+b.i+'.'+b.j,kind:'village',parent:b.id,x:b.x,z:b.z,y:0,r:P.villages.r,stilts:near};});
 const cCand=blocks.filter(b=>(b.third==='scarp'&&b.lo<=P.camps.maxH||b.third==='sunk'&&b.depth===0)&&b.salvage>=P.camps.salvage);
 const camps=bestPer(cCand,b=>U(b.i,b.j,15)).filter(b=>U(b.i,b.j,16)<P.camps.p).map(b=>
  ({id:'huka.c.'+b.i+'.'+b.j,kind:'camp',parent:b.id,x:b.x,z:b.z,y:b.third==='scarp'?b.pad:b.y,r:P.camps.r}));
 /* ---- the spine: the axis run on from the town's end (the site's a-axis) to the extent's far edge, a stretch per row:
    'land' over dry ground, 'causeway' a raised road at the water (kept near the port), 'gap' where it is broken
    (more with distance), 'drowned' where the water is too deep for the causeway (M4 draws them) */
 const spine={id:'huka.spine',kind:'avenue',x:spineX,stretches:[]};
 for(let j=P.jMin;j<=jB;j++){const z=cz(j),f=field(spineX,z);if(!f.third||f.third==='port')continue;
  const h=o.natH(spineX,z);
  const kind=h>=0?'land':-h>P.causeway.maxDepth?'drowned':U(1000,j,17)<P.causeway.gap*smooth(0,P.wild1,f.portD)?'gap':'causeway';
  spine.stretches.push({j,z0:z+PITCH/2,z1:z-PITCH/2,kind,h:+h.toFixed(3)});}
 spine.z0=spine.stretches.length?spine.stretches[0].z0:null;spine.z1=spine.stretches.length?spine.stretches[spine.stretches.length-1].z1:null;
 /* the tags state a record carries (core/tags VOCAB.states): fallen is toppled; lived in again, reclaimed; picked over, salvage */
 const tagState=t=>t.state==='fallen'?'toppled':t.reclaimed?'reclaimed':t.state==='intact'?'intact':t.landmark?'ruined':(blocks.find(b=>b.id===t.parent).salvage>=.5?'salvage':'ruined');
 function register(T){let n=0;
  const add=r=>{T.add(r);n++;};
  add({id:spine.id,class:'infrastructure',kind:'avenue',key:'huka-spine',name:'The Spine (the Hook\'s axis across the Sunk City)',
   at:[spineX,0,spine.z0==null?0:(spine.z0+spine.z1)/2],size:[2*P.spineHalf,1,spine.z0==null?1:Math.abs(spine.z0-spine.z1)],
   tags:{culture:'ancient',state:'ruined',district:'huka'},note:spine.stretches.map(s=>s.kind[0]).join('')});
  for(const b of blocks)add({id:b.id,class:'feature',kind:'block',key:b.third+'.'+(b.si*b.sj),name:'Huka block '+b.i+','+b.j,at:[b.x,b.third==='scarp'?b.pad:b.y,b.z],
   size:[b.w,b.d,1],tags:{culture:'ancient',state:'ruined',district:'huka',quarter:b.third},note:'wild '+b.wild+' salvage '+b.salvage});
  for(const t of towers)add({id:t.id,class:t.landmark?'landmark':'building',kind:'ruin',key:t.key,parent:t.parent,name:DES[t.family].name+' ('+t.look+')',
   at:[t.x,t.y,t.z],ry:t.yaw,size:[t.w,t.d,t.tip],tags:{culture:'ancient',state:tagState(t),family:t.family,variant:t.look,district:'huka',quarter:t.third,landmark:!!t.landmark}});
  for(const h of heaps)add({id:h.id,class:'feature',kind:'heap',key:h.wet?'island':'heap',parent:h.parent,name:h.wet?'Rubble island':'Rubble heap',at:[h.x,h.y,h.z],r:h.r,h:4,
   tags:{culture:'ancient',state:'toppled',district:'huka'}});
  for(const p of pods)add({id:p.id,class:'building',kind:'pod',key:'hyk-pod',parent:p.parent,name:'Hykkousoi pod',at:[p.x,p.y,p.z],ry:p.a,size:[12,12,10],
   tags:{culture:'hykkousoi',state:'reclaimed',district:'huka'}});
  for(const v of villages)add({id:v.id,class:'feature',kind:'village',key:'hukoa-stilts',parent:v.parent,name:'Hukoa stilt village',at:[v.x,v.y,v.z],r:v.r,h:10,
   tags:{culture:'islander',state:'reclaimed',district:'huka',role:'fishers'},note:v.stilts.length+' stumps'});
  for(const c of camps)add({id:c.id,class:'feature',kind:'camp',key:'salvagers',parent:c.parent,name:'Salvagers\' camp',at:[c.x,c.y,c.z],r:c.r,h:6,
   tags:{culture:'ancient',state:'salvage',district:'huka',role:'salvagers'}});
  return n;}
 /* the report: areas by third (blocks' ground, km2), counts, the states' shares */
 const area=t=>+(blocks.filter(b=>b.third===t).reduce((s,b)=>s+(b.si*PITCH)*(b.sj*PITCH),0)/1e6).toFixed(2);
 const states={};for(const t of towers)states[t.state]=(states[t.state]||0)+1;
 const report={lattice:{X0,CZ0,pitch:PITCH,block:B,i:[iA,iB],j:[jA,jB]},km2:{sunk:area('sunk'),scarp:area('scarp')},
  blocks:blocks.length,towers:towers.length,heaps:heaps.length,pods:pods.length,villages:villages.length,camps:camps.length,
  states,crest:crest?{id:crest.tower.id,pad:crest.pad}:null,spine:spine.stretches.map(s=>s.kind[0]).join('')};
 return {field,cell,blocks,towers,heaps,pods,villages,camps,spine,landmark:crest?crest.tower:null,register,report,cx,cz,PITCH};}
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
/* the plan's numbers (the owner's answers 2026-11-24; PROPOSAL-METROPOLIS.md sections 2-4) */
HOOK_RUIN_PLAN.PARAMS={
 seed:0x48554b41,
 /* the ruin's extent in the kit's frame (x along the coast, +z the sea; the plateau is the kit's -x, the shank its +x): the
    lagoon south of the spit from the plateau's west foot to the shank, and the plateau's north face east of the spit's
    root, to the 420 m contour (scarpTop) */
 extent:[[-2400,-1650],[-4200,-1650],[-4200,-3000],[-3400,-3400],[-2300,-3700],[-1000,-3700],[400,-3300],[1500,-2800],[2600,-2300],[2600,-1650]],
 scarpTop:420,maxSlope:.45,jMin:3,
 spineX:-225,spineHalf:20,
 STATES:['intact','gutted','crown','broken','stump','skeleton','fallen'],
 sharesNear:[0,.28,.08,.18,.32,.09,.05],sharesFar:[.02,.05,.08,.22,.25,.16,.22],
 wild0:300,wild1:1900,wildUp:.45,wildNoise:.3,salvageR:1100,
 merge:{sunk:{square:0,long:.22},scarp:{square:.16,long:.18}},
 tower:{sunk:.66,scarp:.58},heap:{sunk:.55,scarp:.35},
 families:{
  sunk:{single:{reed:3,stalk:3,organ:2,spindle:2,wedge:1,swell:1,telescope:1,arcades:2},long:{crescent:3,ledger:2,yoke:1},square:{crescent:1}},
  scarp:{single:{terrarium:2,spiral:2,cupola:2,telescope:1,stack:2,watertower:1,hall:1},long:{pods:2,ledger:1,vault:2},square:{terrace:3,cupola:1}}},
 crest:{family:'spindle',state:'crown'},
 pods:{p:.4,max:3,minRoof:120},
 sector:750,villages:{depth:[.5,6],wild:[.12,.7],p:.7,r:220},camps:{maxH:30,salvage:.25,p:.8,r:60},
 causeway:{maxDepth:6,gap:.6}};
/* the page's plan: on Hook's ground (75d), the spit's benches (core/world 41l, the site's landforms) and the site's grid */
const HOOK_RUIN=(function(){
 /* the walled peninsula: the spit's record (world/landforms.json, the owner's site plan, placement B), by 41l's own distance
    (0 on its ground, its outline as it wanders). The shank and barb are gone (drowned), so nothing is 'wall' any more; S2
    redoes this plan on the site plan's field (PROPOSAL-METROPOLIS.md section 10) */
 const SPIT=WLAND.benches.filter(b=>b.id==='lf_hook_spit');
 const bD=(b,x,z)=>WLAND.benchD(b,x,z);
 const spit=(x,z)=>{const w=HOOK_WORLD.toWorld(x,z);for(const b of SPIT)if(bD(b,w[0],w[1])===0)return 'spit';return null;};
 const main=SPIT.find(b=>b.id==='lf_hook_spit');
 const portD=(x,z)=>{const w=HOOK_WORLD.toWorld(x,z);return main?bD(main,w[0],w[1]):Math.hypot(x,z);};
 return HOOK_RUIN_PLAN({natH:HOOK_WORLD.natH,spit,portD,grid:HOOK_SITE.grid});})();
