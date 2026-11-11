// ================================================================ PORT CORE
// The Krator Ancient Port: constants, the segment/vessel registry, the layout
// builders the targets use, and the small shared utilities (geometry batching,
// world-UV boxes, local ground height). See API.md; CONTRACT.md is the law.
//
// AXES. x runs ALONG the coast (segments tile side by side along x). z is the
// land/sea axis: -z is LAND, +z is SEA. y is up and SEA LEVEL IS y=0. Every
// segment's deck is at y = PORT.DECK.
const PORT={
 DECK:6,          // quay top, m above sea level: every deck in the port is here
 W:220,           // the ANCHOR width (quay, pier) and the default; each segment registers its own W
 WMAX_NEW:110,    // every segment after the anchors is at most this wide (the user's rule)
 WMAX:220,        // hard ceiling the registry enforces
 SEA0:0,          // sea level
 SEABED:-30,      // the natural seabed far offshore
 CLEAR:8,         // buildings/props stay this far inside the footprint edges
 LAND_MAX:120, SEA_MAX:420,
 BERTH:-16,       // a working berth's dredged depth
 BLOCK:110,       // a land block / sea platform: at most BLOCK x BLOCK
};
// Budget classes a registration may name (read by 91-probe.js).
const PORT_CLS={seg:200000,vessel:250000,small:60000};

// ---------------------------------------------------------------- registry
// PORT_REG.seg[key] / PORT_REG.vessel[key] = the registration object as given,
// plus `kind`. Fragments call PORT_SEG({...}) / PORT_VESSEL({...}) at top
// level; the targets lay out whatever is registered, sorted by key.
const PORT_REG={seg:{},vessel:{}};
function portRegister(kind,o){
 const need=['key','name','cls','W','LAND','SEA','decays','stamps','build'];
 if(kind==='vessel')need.push('length','beam','draft');
 const miss=need.filter(k=>o[k]===undefined);
 const tag=(o&&o.key)||'(no key)';
 if(miss.length){reportErr('PORT_'+kind.toUpperCase()+' '+tag+': missing '+miss.join(', '));return;}
 if(PORT_REG.seg[o.key]||PORT_REG.vessel[o.key]){reportErr('PORT registration: duplicate key '+o.key);return;}
 if(!PORT_CLS[o.cls])reportErr('PORT '+tag+': cls must be one of '+Object.keys(PORT_CLS).join('/'));
 if(!(o.W>0&&o.W<=PORT.WMAX))reportErr('PORT '+tag+': W must be in (0, '+PORT.WMAX+'] - new segments <= '+PORT.WMAX_NEW+' (got '+o.W+')');
 if(o.LAND>PORT.LAND_MAX||o.SEA>PORT.SEA_MAX||o.LAND<0||o.SEA<0)reportErr('PORT '+tag+': LAND<=120, SEA<=420');
 if(typeof o.build!=='function'||typeof o.stamps!=='function')reportErr('PORT '+tag+': build and stamps must be functions');
 if(kind==='seg'){const pl=o.place||'coast';
  if(['coast','land','sea'].indexOf(pl)<0)reportErr('PORT '+tag+": place must be 'coast', 'land' or 'sea'");
  if(pl==='land'&&(o.SEA!==0||o.LAND>PORT.BLOCK||o.W>PORT.BLOCK))reportErr('PORT '+tag+": a place:'land' block has SEA 0, LAND and W <= "+PORT.BLOCK);
  if(pl==='sea'&&(o.LAND!==0||o.SEA>PORT.BLOCK||o.W>PORT.BLOCK))reportErr('PORT '+tag+": a place:'sea' platform has LAND 0, SEA and W <= "+PORT.BLOCK);}
 o.kind=kind;
 if(kind==='vessel'&&o.norepair===undefined)o.norepair=true;   // vessels dress their own d=3
 PORT_REG[kind][o.key]=o;}
function PORT_SEG(o){portRegister('seg',o);}
function PORT_VESSEL(o){portRegister('vessel',o);}
const portSegKeys=()=>Object.keys(PORT_REG.seg).sort();
const portVesselKeys=()=>Object.keys(PORT_REG.vessel).sort();
function portRegOf(key){return PORT_REG.seg[key]||PORT_REG.vessel[key]||null;}

// ---------------------------------------------------------------- layout
// A LAYOUT is what a target hands the scene: PORT_LAYOUT = {items:[...],
// stamps:[...world stamps...], runs:[...]}. An item is one placed segment:
//   {key, d, gx, gz, place, nb:{W,E,N,S}, slot, run, ctx, vessel, fleet, opt}
// or one free-standing vessel:
//   {vessel:true, key, d, gx, gz, heading}
//
// PLACEMENT KINDS (a registration's `place`, default 'coast'):
//   coast  a coastal segment: its quay line at local z=0, land apron
//          z in [-LAND,0], sea structure z in [0,SEA]. Tiled along x in RUNS.
//   land   a block that sits wholly on land, z in [-LAND,0] (LAND <= 110),
//          SEA 0. Placed BEHIND a coastal segment (its z=0 edge on that
//          segment's -LAND edge) or behind another land block: portBehind().
//   sea    a platform wholly in the water, z in [0,SEA] (SEA <= 110), LAND 0.
//          Placed off the seaward end of a pier (a coastal segment's z=SEA
//          edge, at its registered `seaEnd.x`) or off any side of another
//          platform: portOff().
//
// NEIGHBOURS. After the layout is made the scene calls portLinkNb(items),
// which finds every item's neighbours from the footprints and fills
// nb = {W, E, N, S}. N is the land side (-z), S the sea side (+z), W is -x, E
// is +x. Each side is
//   {kind, dz, dx, key, place, span:[a,b], list:[...]}
// kind  'seg'  another placed item touches this side (any place)
//       'land' natural land, 'sea' open water (nothing placed there)
// dz, dx  the (first) neighbour's gz / gx minus yours; for a coastal W/E
//       neighbour dz is the quay-line offset exactly as before (negative:
//       set back toward the land)
// span  the stretch of YOUR side, in your local coordinates (x for N/S, z
//       for W/E), that the first neighbour covers; `list` holds every
//       neighbour on that side with its own key/place/dz/dx/span, and
//       portSideOpen(nb,side,a,b) returns the stretches no neighbour covers.
// With nothing placed: coastal N 'land', S 'sea' and W/E from the run
// (natural 'land' at run ends unless the layout says 'sea'); a land block
// 'land' on every side; a sea platform 'sea' on every side.
//
// The z offsets the showcase cycles through, indexed (slot*2 + run*3) % 7.
// Chosen (by search) so neighbours - two apart in the table - never differ by
// more than 40 m (an 80 m step would leave a 60 m-deep apron standing clear
// of its neighbour), and the three runs of three show flush joints and 20 and
// 40 m steps in both directions.
const PORT_DZSEQ=[0,0,0,20,-20,40,-40];
function portPlaceOf(key){const R=PORT_REG.seg[key];return (R&&R.place)||'coast';}
// Footprint of a placed item in world coordinates.
function portFoot(it){const R=portRegOf(it.key);if(!R||it.vessel===true)return null;
 return {x0:it.gx-R.W/2,x1:it.gx+R.W/2,z0:it.gz-R.LAND,z1:it.gz+R.SEA};}
// Lay coastal `keys` side by side from x0 (the west edge of the first
// footprint), each at its own gz; returns the items with nb.W/E filled. Run
// ends see `endW`/`endE`.
function portRun(keys,d,x0,dzs,o){o=o||{};const out=[];let x=x0;
 keys.forEach((k,i)=>{const R=portRegOf(k);const w=R?R.W:PORT.W;
  out.push({key:k,d,gx:x+w/2,gz:dzs[i]||0,place:'coast',slot:i,run:o.run||0,ctx:!!(o.ctx&&o.ctx[i])});x+=w;});
 out.forEach((it,i)=>{
  const P=out[i-1],N=out[i+1];
  it.nb={W:P?{kind:'seg',dz:P.gz-it.gz,key:P.key}:Object.assign({kind:'land',dz:0},o.endW||{}),
         E:N?{kind:'seg',dz:N.gz-it.gz,key:N.key}:Object.assign({kind:'land',dz:0},o.endE||{})};});
 return {items:out,x0,x1:x};}
// A land block BEHIND `host` (a coastal segment or another land block): its
// z=0 edge on the host's -LAND edge, its centre o.dx along x from the host's.
function portBehind(host,key,o){o=o||{};const HR=portRegOf(host.key);if(!HR||!portRegOf(key))return null;
 return {key,d:o.d!==undefined?o.d:host.d,gx:host.gx+(o.dx||0),gz:host.gz-HR.LAND,place:'land',
  slot:host.slot||0,run:host.run||0,host:host.key};}
// A sea platform OFF `host`: side 'S' (default) puts it on the host's
// seaward edge (z = SEA) at the host's registered seaEnd.x (+o.dx); 'E' / 'W'
// beside the host (a platform), at the host's gz (+o.dz).
function portOff(host,key,side,o){side=side||'S';o=o||{};const HR=portRegOf(host.key),R=portRegOf(key);if(!HR||!R)return null;
 let gx=host.gx,gz=host.gz;
 if(side==='S'){gx+=((HR.seaEnd&&HR.seaEnd.x)||0)+(o.dx||0);gz+=HR.SEA;}
 else{const s=side==='E'?1:-1;gx+=s*(HR.W/2+R.W/2);gz+=(o.dz||0);}
 return {key,d:o.d!==undefined?o.d:host.d,gx,gz,place:'sea',slot:host.slot||0,run:host.run||0,host:host.key};}
// Fill every item's nb.{W,E,N,S} from the footprints (see above). Coastal
// W/E sides keep what portRun gave them and gain `place`, `dx`, `span`,
// `list`. Idempotent; the scene calls it on every layout.
function portLinkNb(items){const T=.6,its=items.filter(it=>it.vessel!==true&&portRegOf(it.key)),F=its.map(portFoot);
 its.forEach((A,i)=>{const a=F[i],pl=A.place||portPlaceOf(A.key);A.place=pl;const nb=A.nb||(A.nb={});
  const def={N:pl==='sea'?'sea':'land',S:pl==='land'?'land':'sea',W:pl==='sea'?'sea':'land',E:pl==='sea'?'sea':'land'};
  for(const side of ['W','E','N','S']){const list=[];
   its.forEach((B,j)=>{if(j===i)return;const b=F[j];let hit=false,s0,s1;
    if(side==='E'||side==='W'){hit=Math.abs(side==='E'?b.x0-a.x1:b.x1-a.x0)<T;s0=Math.max(a.z0,b.z0)-A.gz;s1=Math.min(a.z1,b.z1)-A.gz;}
    else{hit=Math.abs(side==='N'?b.z1-a.z0:b.z0-a.z1)<T;s0=Math.max(a.x0,b.x0)-A.gx;s1=Math.min(a.x1,b.x1)-A.gx;}
    if(hit&&s1-s0>1)list.push({kind:'seg',key:B.key,place:B.place||portPlaceOf(B.key),dz:B.gz-A.gz,dx:B.gx-A.gx,span:[s0,s1]});});
   const run=(side==='W'||side==='E')&&pl==='coast'&&nb[side]&&nb[side].kind?nb[side]:null;
   let S;
   if(run){S=Object.assign({},run);const m=run.kind==='seg'&&list.find(l=>l.key===run.key&&l.place==='coast')||list[0];
    if(m){S.place=m.place;S.dx=m.dx;S.span=m.span;}}
   else if(list.length)S=Object.assign({},list[0]);
   else S={kind:def[side],dz:0,dx:0};
   S.list=list;nb[side]=S;}});
 return items;}
// The stretches [a,b] of side `side` (local coordinates along it, between a
// and b) that no neighbour covers: where a block finishes its own edge.
function portSideOpen(nb,side,a,b){const N=nb&&nb[side];let open=[[a,b]];
 for(const l of (N&&N.list)||[]){const nx=[];for(const [p,q] of open){if(l.span[1]<=p||l.span[0]>=q){nx.push([p,q]);continue;}
  if(l.span[0]>p)nx.push([p,l.span[0]]);if(l.span[1]<q)nx.push([l.span[1],q]);}open=nx;}
 return open.filter(s=>s[1]-s[0]>.5);}
// A free-standing vessel moored alongside the E or W face of `items`' joint
// footprint (a platform chain, or `ext` = {x0,x1,z0,z1} when none), bow +z.
// Returns {item, stamp}: the stamp dredges a pocket that starts 1 m outside
// the face, so it never digs into what it is moored to.
function portMoor(key,d,side,items,ext,o){o=o||{};const V=PORT_REG.vessel[key];if(!V)return null;
 let e=ext?Object.assign({},ext):null;
 if(!ext)for(const it of items||[]){const f=portFoot(it);if(!f)continue;
  e=e?{x0:Math.min(e.x0,f.x0),x1:Math.max(e.x1,f.x1),z0:Math.min(e.z0,f.z0),z1:Math.max(e.z1,f.z1)}:Object.assign({},f);}
 if(!e)return null;const s=side==='W'?-1:1,edge=s>0?e.x1:e.x0,gap=o.gap||3;
 const x=edge+s*(gap+V.beam/2),z=(e.z0+e.z1)/2+(o.dz||0);
 const xa=edge+s*1,xb=x+s*(V.beam/2+12);
 return {item:{vessel:true,key,d,gx:x,gz:z,heading:0,run:o.run||0},
  stamp:{kind:'dig',x0:Math.min(xa,xb),x1:Math.max(xa,xb),z0:z-V.length/2-20,z1:z+V.length/2+20,y:-(V.draft+(d===1?1:5)),soft:30}};}
// The showcase: one continuous coastal run per decay (intact, ruined,
// reclaimed), each holding every registered coastal segment that supports
// that decay, sorted by key, separated by `gap` metres of natural coast.
// o.back: every registered LAND block is placed once per run, in a row
//   behind the run's middle (a 110 m slot per 110 m of coastal width; any
//   keys left over go in a row behind the first).
// o.sea: the registered SEA platforms off the great pier's end (the run item
//   with a seaEnd, else the deepest), chained seaward `o.chain` long (the
//   keys cycle, so one platform key still makes a chain).
// o.slip {segKey: vesselKey}: the vessel each such segment holds (opt.vessel).
// o.moor {E: key, W: key}: vessels moored alongside the platform chain's
//   east / west faces (or off the pier head when no platform is registered).
function portLayoutShowcase(o){o=Object.assign({decays:[0,1,3],gap:440,back:true,sea:true,chain:2,slip:null,moor:null},o||{});
 const all=portSegKeys(),byP=p=>all.filter(k=>portPlaceOf(k)===p);
 const keys=byP('coast'),landK=byP('land'),seaK=byP('sea'),runs=[];let x=0;
 const has=(k,d)=>PORT_REG.seg[k].decays.indexOf(d)>=0;
 o.decays.forEach((d,r)=>{const ks=keys.filter(k=>has(k,d));
  if(!ks.length)return;
  const dzs=ks.map((k,i)=>PORT_DZSEQ[(i*2+r*3)%PORT_DZSEQ.length]);
  const R=portRun(ks,d,x,dzs,{run:r});runs.push(Object.assign({d,back:[],sea:[],moored:[]},R));x=R.x1+o.gap;});
 const mid=runs.length?(runs[0].x0+runs[runs.length-1].x1)/2:0;
 for(const R of runs){R.x0-=mid;R.x1-=mid;for(const it of R.items)it.gx-=mid;}
 const stamps=[];
 for(const R of runs){const d=R.d;
  if(o.slip)for(const it of R.items)if(o.slip[it.key])it.vessel=o.slip[it.key];
  const lk=o.back?landK.filter(k=>has(k,d)):[];
  if(lk.length){const slots=[];
   for(const it of R.items){const n=Math.floor(portRegOf(it.key).W/PORT.BLOCK+1e-6);for(let j=0;j<n;j++)slots.push({host:it,dx:(j-(n-1)/2)*PORT.BLOCK});}
   const n=Math.min(lk.length,slots.length),s0=Math.max(0,Math.floor((slots.length-n)/2));
   lk.forEach((k,i)=>{const b=i<n?portBehind(slots[s0+i].host,k,{dx:slots[s0+i].dx}):portBehind(R.back[(i-n)%n],k);if(b)R.back.push(b);});}
  let host=R.items.find(it=>portRegOf(it.key).seaEnd)||R.items.slice().sort((a,b)=>portRegOf(b.key).SEA-portRegOf(a.key).SEA)[0];
  R.pierHost=host;
  const sk=o.sea?seaK.filter(k=>has(k,d)):[];
  if(sk.length&&host)for(let i=0;i<Math.max(1,o.chain);i++){const p=portOff(i?R.sea[i-1]:host,sk[i%sk.length],'S');if(p)R.sea.push(p);}
  if(o.moor&&host){const HR=portRegOf(host.key),ex=((HR.seaEnd&&HR.seaEnd.x)||0)+host.gx,z0=host.gz+HR.SEA;
   const ext=R.sea.length?null:{x0:ex-PORT.BLOCK/2,x1:ex+PORT.BLOCK/2,z0,z1:z0+2*PORT.BLOCK};
   for(const side of ['E','W']){const k=o.moor[side];if(!k)continue;const m=portMoor(k,d,side,R.sea,ext,{run:runs.indexOf(R)});
    if(m){R.moored.push(m.item);stamps.push(m.stamp);}}}}
 const items=[].concat(...runs.map(R=>R.items.concat(R.back,R.sea,R.moored)));
 return {items,runs,stamps,vessels:portVesselKeys()};}
// The single-key dev layout, one run per decay of the key:
//  coast   the key flanked by plain `quay110`s (offset nbdz[0] / nbdz[1]);
//  land    three quay110s (the east one set back 20), the block behind the
//          middle one, a second block behind it and another behind the east
//          quay: N, S, E are neighbours (E stepped), W is natural land;
//  sea     quay110, the great pier, quay110; the platform off the pier's end
//          and a second one chained off its sea side;
//  vessel  three quays, the vessel moored off the middle one in a dredged pocket.
// Each run records its focus item (R.focus) for the views.
function portLayoutSegment(key,o){o=Object.assign({gap:440,nbdz:[0,-20],nbKey:'quay110'},o||{});
 const V=PORT_REG.vessel[key],S=PORT_REG.seg[key],R0=V||S;
 if(!R0){reportErr('PORT_ONLY: no segment or vessel registered as "'+key+'"');return {items:[],runs:[],stamps:[],vessels:[]};}
 const pl=V?'vessel':portPlaceOf(key);
 const nbk=PORT_REG.seg[o.nbKey]?o.nbKey:(pl==='coast'?key:'quay110');
 const runs=[],stamps=[],extra=[];let x=0;
 R0.decays.forEach((d,r)=>{
  const ks=pl==='coast'?[nbk,key,nbk]:pl==='sea'&&PORT_REG.seg.pier?[nbk,'pier',nbk]:[nbk,nbk,nbk];
  const dz=pl==='land'?[0,0,-20]:pl==='sea'?[0,0,0]:[o.nbdz[0],0,o.nbdz[1]];
  const R=portRun(ks,d,x,dz,{run:r,ctx:pl==='coast'?[1,0,1]:[1,1,1]});
  runs.push(Object.assign({d,back:[],sea:[]},R));x=R.x1+o.gap;});
 const mid=runs.length?(runs[0].x0+runs[runs.length-1].x1)/2:0;
 for(const R of runs){R.x0-=mid;R.x1-=mid;for(const it of R.items)it.gx-=mid;
  const M=R.items[1];R.focus=M;
  if(pl==='land'){const b=portBehind(M,key);R.back.push(b,portBehind(b,key),portBehind(R.items[2],key));R.focus=b;}
  else if(pl==='sea'){const p=portOff(M,key,'S');R.sea.push(p,portOff(p,key,'S'));R.focus=p;}
  else if(V){const Rq=portRegOf(M.key);
   const vz=M.gz+Rq.SEA+V.beam/2+14,vx=M.gx;
   extra.push({vessel:true,key,d:R.d,gx:vx,gz:vz,heading:Math.PI/2,run:runs.indexOf(R)});
   R.vessel={x:vx,z:vz};
   stamps.push({kind:'dig',x0:vx-V.length/2-30,x1:vx+V.length/2+30,z0:vz-V.beam/2-20,z1:vz+V.beam/2+24,
                y:-Math.max(V.draft+5,10),soft:40});}}
 const items=[].concat(...runs.map(R=>R.items.concat(R.back,R.sea)),extra);
 return {items,runs,stamps,vessels:V||pl!=='coast'?[]:portVesselKeys(),focus:key};}

// The edge-case layout: the named key at decay d against every kind of side
// it can meet, one run per case, separated by natural coast. Coastal keys:
//   run 0  west neighbour set back 40, east neighbour stands out 40
//   run 1  west neighbour stands out 20, east neighbour set back 20
//   run 2  open SEA on both sides (no neighbours at all)
//   run 3  natural LAND coast on both sides
// Land blocks: 0 behind the middle of three quays at dz -40/0/+40 with
//   blocks behind all three (W and E stepped 40); 1 alone behind one quay
//   (land on three sides); 2 behind another block (S is a block).
// Sea platforms: 0 off the pier's end with a platform chained off its E side
//   and one off that one's S (an L); 1 alone off the pier's end.
function portLayoutEdges(key,o){o=Object.assign({gap:440,d:0,nbKey:'quay110'},o||{});
 if(!PORT_REG.seg[key]){reportErr('PORT_ONLY: no segment registered as "'+key+'"');return {items:[],runs:[],stamps:[],vessels:[]};}
 const pl=portPlaceOf(key),nbk=PORT_REG.seg[o.nbKey]?o.nbKey:key,d=o.d,runs=[];let x=0;
 const cases=pl==='land'?[{ks:[nbk,nbk,nbk],dz:[-40,0,40],ctx:[1,1,1],nm:'blocks stepped 40'},{ks:[nbk],dz:[0],ctx:[1],nm:'land round'},{ks:[nbk],dz:[0],ctx:[1],nm:'block behind a block'}]
  :pl==='sea'?[{ks:[nbk,PORT_REG.seg.pier?'pier':nbk,nbk],dz:[0,0,0],ctx:[1,1,1],nm:'platform L'},{ks:[PORT_REG.seg.pier?'pier':nbk],dz:[0],ctx:[1],nm:'sea round'}]
  :[{ks:[nbk,key,nbk],dz:[-40,0,40],ctx:[1,0,1],nm:'steps 40'},{ks:[nbk,key,nbk],dz:[20,0,-20],ctx:[1,0,1],nm:'steps 20'},
    {ks:[key],dz:[0],ctx:[0],endW:{kind:'sea'},endE:{kind:'sea'},nm:'sea sides'},{ks:[key],dz:[0],ctx:[0],nm:'land sides'}];
 cases.forEach((c,r)=>{const R=portRun(c.ks,d,x,c.dz,{run:r,ctx:c.ctx,endW:c.endW,endE:c.endE});
  runs.push(Object.assign({d,case:c.nm,back:[],sea:[]},R));x=R.x1+o.gap;});
 const mid=(runs[0].x0+runs[runs.length-1].x1)/2;
 for(const R of runs){R.x0-=mid;R.x1-=mid;for(const it of R.items)it.gx-=mid;
  const M=R.items[R.items.length>1?1:0];R.focus=M;
  if(pl==='land'){
   if(R.case==='blocks stepped 40'){for(const it of R.items)R.back.push(portBehind(it,key));R.focus=R.back[1];}
   else if(R.case==='land round'){R.back.push(portBehind(M,key));R.focus=R.back[0];}
   else{const b=portBehind(M,key);R.back.push(b,portBehind(b,key));R.focus=R.back[1];}}
  if(pl==='sea'){const p=portOff(M,key,'S');R.sea.push(p);R.focus=p;
   if(R.case==='platform L'){const q=portOff(p,key,'E');R.sea.push(q,portOff(q,key,'S'));}}}
 return {items:[].concat(...runs.map(R=>R.items.concat(R.back,R.sea))),runs,stamps:[],vessels:portVesselKeys(),focus:key};}
function portViewsEdges(){const V={},D=PORT.DECK,runs=PORT_LAYOUT.runs||[];if(!runs.length)return {Empty:[0,300,600,0,0,0]};
 V['Overview']=portCam(0,0,100,.15,.45,(runs[runs.length-1].x1-runs[0].x0)*.6+300);
 for(const R of runs){const F=R.focus,G=portRegOf(F.key),pl=portPlaceOf(F.key),zs=F.gz+(pl==='land'?-G.LAND/2:pl==='sea'?G.SEA/2:0)+4;
  V[R.case]=portCam(F.gx,D,F.gz+(G.SEA-G.LAND)/2,.35,.5,Math.max(300,(G.SEA+G.LAND)*1.2));
  V[R.case+' W']=portCam(F.gx-G.W/2,D,zs,-.8,.3,160);V[R.case+' E']=portCam(F.gx+G.W/2,D,zs,.8,.3,160);}
 return V;}

// ---------------------------------------------------------------- vessels
// The hook a slip or berth segment uses to show a vessel. `opt.vessels` is the
// sorted list of registered vessel keys the layout offers (empty until a
// vessel fragment exists); a segment picks one with portVesselFor(opt, i) and
// builds it with portPlaceVessel. Vessel frame: origin at MIDSHIP ON THE
// WATERLINE (y=0 is sea level), bow toward +z at heading 0, hull down to
// -draft. The vessel is charged to its own budget ('key/d'), not the segment's,
// and the PRNG is saved and restored round it, so the segment's own stream
// does not move when a vessel is edited.
// A layout may choose: opt.fleet[i] (a key, or null for none) wins, then
// opt.vessel for i=0; otherwise the registered keys are cycled by slot/run.
function portVesselFor(opt,i){i=i||0;
 if(opt&&opt.fleet&&opt.fleet[i]!==undefined){const k=opt.fleet[i];return k&&PORT_REG.vessel[k]?k:null;}
 if(opt&&i===0&&typeof opt.vessel==='string'&&PORT_REG.vessel[opt.vessel])return opt.vessel;
 const v=opt&&opt.vessels;if(!v||!v.length)return null;
 return v[((opt.slot||0)+(opt.run||0)+i)%v.length];}
// Every vessel placed so far: {key, d, x, z, heading, host, stat} in world
// coordinates (views and the boundary overlay read it after the scene).
const PORT_VPLACED=[];
function portPlaceVessel(G,key,x,z,heading,d,o){const V=PORT_REG.vessel[key];if(!V)return null;
 const ds=V.decays.indexOf(d)>=0?d:V.decays[0];
 pbFlush();                      // the host's batch so far is charged to the host, not the vessel
 const s0=_seed,k0=KOFF,t0=TSTAT.cur,h0=HOLES,c0=PORT_CUR;PORT_CUR={W:V.W,LAND:V.LAND,SEA:V.SEA,key};
 const wx=KOFF[0]+x,wz=KOFF[2]+z;
 TSTAT.cur=portStatKey(key,ds);HOLES=ds>=3?.55:1;KOFF=[0,0,0];let VG=null;const r0=REG.length;
 PORT_OWN[TSTAT.cur]={key,d:ds,name:V.name,place:'vessel',host:t0};const p0=PORT_PART;PORT_PART=null;
 PORT_VPLACED.push({key,d:ds,x:wx,z:wz,heading:heading||0,host:t0,stat:TSTAT.cur});
 try{VG=V.build(scene,wx,wz,ds,Object.assign({heading:heading||0,d:ds,key,host:TSTAT.cur},o||{}));}
 catch(e){reportErr('vessel '+key+' d='+ds+' '+e.stack);}
 try{pbFlush();}catch(e){reportErr('vessel flush '+e.stack);}
 if(ds>=3&&VG&&!V.norepair){KOFF=[wx,0,wz];try{portRepair(VG,ds);}catch(e){reportErr(key+' repair '+e.stack);}}
 for(let i=r0;i<REG.length;i++)REG[i].type=key;
 if(VG&&VG.isObject3D){const st=TSTAT.cur;VG.userData.own=st;VG.traverse(o=>{if((o.isMesh||o.isInstancedMesh)&&!o.userData.own)o.userData.own=st;});}
 KOFF=k0;TSTAT.cur=t0;HOLES=h0;_seed=s0;PORT_CUR=c0;PORT_PART=p0;
 return VG;}

// ---------------------------------------------------------------- stats keys
// One TSTAT key per PLACED INSTANCE: 'quay/0', and 'quay/0#2' for a second
// quay at the same decay (the segment target flanks with quays). The probe
// reads the class from the part before '/'.
const PORT_STATN={};
function portStatKey(key,d){const k=key+'/'+d;PORT_STATN[k]=(PORT_STATN[k]||0)+1;
 return PORT_STATN[k]>1?k+'#'+PORT_STATN[k]:k;}

// ---------------------------------------------------------------- geometry batching
// Draw calls are per mesh. The port helpers therefore do not call mesh() for
// every wall and slab: they hand geometry to pbAdd(), and the scene merges the
// batch into ONE mesh per (parent, material) right after each builder returns
// (pbFlush). Builders may use it too. Geometry must already be in the
// parent's local frame (bake offsets with .translate / .rotateY). Opaque
// materials only - transparent ones are depth-sorted per mesh.
// `noRepair` keeps the result out of the d=3 salvage pass (walls below water).
const PB=new Map();
function pbAdd(geo,mat,parent,noRepair){if(!geo||!parent)return;
 const k=parent.uuid+'|'+mat.uuid+'|'+(noRepair?1:0);let b=PB.get(k);
 if(!b){b={parent,mat,noRepair:!!noRepair,geos:[]};PB.set(k,b);}b.geos.push(geo);}
function pbFlush(){for(const b of PB.values()){const m=meshMerged(b.geos,b.mat,b.parent);if(m&&b.noRepair)m.userData.noRepair=true;}PB.clear();}

// A BoxGeometry whose UVs are in world units / `tile` metres per texture
// repeat, so the kit's 8 m textures keep their scale on a 220 m wall instead
// of stretching one tile over it.
function boxUV(w,h,dp,tile){tile=tile||8;const g=new THREE.BoxGeometry(w,h,dp);const uv=g.attributes.uv;
 // face order in r128: +x, -x, +y, -y, +z, -z; 4 vertices each
 const S=[[dp,h],[dp,h],[w,dp],[w,dp],[w,h],[w,h]];
 for(let f=0;f<6;f++)for(let v=0;v<4;v++){const i=f*4+v;uv.setXY(i,uv.getX(i)*S[f][0]/tile,uv.getY(i)*S[f][1]/tile);}
 return g;}
// Rotate about y by `yaw`, then translate. In place; returns the geometry.
function pgeo(g,x,y,z,yaw){if(yaw)g.rotateY(yaw);g.translate(x||0,y||0,z||0);return g;}
// A world-UV box from its centre, sizes and yaw, straight into the batch.
function pbBox(parent,mat,x,y,z,w,h,dp,yaw,tile,noRepair){pbAdd(pgeo(boxUV(w,h,dp,tile),x,y,z,yaw),mat,parent,noRepair);}
// Yaw that turns local +x onto the direction (tx,tz).
const portYaw=(tx,tz)=>Math.atan2(-tz,tx);
// Merge geometries into one BufferGeometry (for compound kit items).
function pkMergeGeo(geos){let nv=0,ni=0;
 for(const g of geos){nv+=g.attributes.position.count;ni+=g.index?g.index.count:g.attributes.position.count;}
 const P=new Float32Array(nv*3),N=new Float32Array(nv*3),U=new Float32Array(nv*2),I=new Uint32Array(ni);let vo=0,io=0;
 for(const g of geos){const A=g.attributes,c=A.position.count;P.set(A.position.array,vo*3);
  if(A.normal)N.set(A.normal.array,vo*3);if(A.uv)U.set(A.uv.array,vo*2);
  if(g.index){const ix=g.index.array;for(let i=0;i<ix.length;i++)I[io+i]=ix[i]+vo;io+=ix.length;}
  else{for(let i=0;i<c;i++)I[io+i]=vo+i;io+=c;}vo+=c;}
 const G=new THREE.BufferGeometry();G.setAttribute('position',new THREE.BufferAttribute(P,3));
 G.setAttribute('normal',new THREE.BufferAttribute(N,3));G.setAttribute('uv',new THREE.BufferAttribute(U,2));
 G.setIndex(new THREE.BufferAttribute(I,1));return G;}

// Ground height at a point given in the CURRENT BUILDER'S LOCAL frame (KOFF is
// added for you). terrainH itself takes world coordinates.
function portH(lx,lz){return terrainH(lx+KOFF[0],lz+KOFF[2]);}
// A deterministic hash in [0,1) for stamps(), which must NOT call rng():
// stamps run before any builder reseeds.
const portHash=(a,b,c)=>h3(a*.137+11.3,b*.071+2.9,(c||0)*.193+5.1);

// The placement being built right now (its opt), set by the scene around each
// build() call, so helpers can default to the segment's own width.
let PORT_CUR=null;
const portCurW=()=>(PORT_CUR&&PORT_CUR.W)||PORT.W;
// Scene-state hooks: setNight() in 92-camera.js calls every function here
// with (on). The water registers one; a segment may register its own.
const PORT_NIGHT=[];

// The d=3 salvage pass: portRepairPass() (below) on the group. It skips
// every child marked userData.noRepair (quay walls down to the seabed, pier
// columns, anything under water), invisible and transparent meshes, thin
// members and open paving. The scene calls this; builders need not.
function portRepair(G,d){portRepairPass(G,d);}

// View helper for the targets' VIEWS tables: look at (tx,ty,tz) from bearing
// `az` (radians; 0 = from the sea, +z; PI/2 = from the east, +x), elevation
// `el` (radians) at distance `r`. Returns [cx,cy,cz,tx,ty,tz].
function portCam(tx,ty,tz,az,el,r,night){const c=Math.cos(el);
 const v=[tx+r*c*Math.sin(az),ty+r*Math.sin(el),tz+r*c*Math.cos(az),tx,ty,tz];if(night)v.push(1);return v;}
const PORT_DNAME={0:'Intact',1:'Ruined',3:'Reclaimed'};
const portDName=d=>PORT_DNAME[d]||('Decay '+d);
// The generic preset tables. Called from a target's 91z-views.js, after the
// scene has run, so they read the layout that was actually built.
function portViewsShowcase(){const V={},L=PORT_LAYOUT,D=PORT.DECK,runs=L.runs||[];if(!runs.length)return {Empty:[0,300,600,0,0,0]};
 const X0=runs[0].x0,X1=runs[runs.length-1].x1,span=X1-X0;
 const ext=its=>{let z0=1e9,z1=-1e9,x0=1e9,x1=-1e9;for(const it of its){const f=portFoot(it);if(!f)continue;
  z0=Math.min(z0,f.z0);z1=Math.max(z1,f.z1);x0=Math.min(x0,f.x0);x1=Math.max(x1,f.x1);}return {x0,x1,z0,z1};};
 const all=ext(L.items);
 V['Overview']=portCam((X0+X1)/2,0,90,.18,.42,span*.62+300);
 for(const R of runs){const nm=portDName(R.d),mid=(R.x0+R.x1)/2,w=R.x1-R.x0,e=ext(R.items.concat(R.back||[],R.sea||[]));
  V[nm+' run']=portCam(mid,D,(e.z0+e.z1)/2,.3,.5,Math.max(w,(e.z1-e.z0)*1.5)*.78+180);}
 for(const R of runs){const nm=portDName(R.d);
  for(let j=1;j<R.items.length;j++){const A=R.items[j-1],B=R.items[j],x=(A.gx+B.gx)/2;
   V[nm+' junction '+j]=portCam(x,D,Math.max(A.gz,B.gz)+6,.55,.32,150);}
  const a=R.items[0],b=R.items[R.items.length-1],ra=portRegOf(a.key),rb=portRegOf(b.key);
  V[nm+' west end']=portCam(a.gx-ra.W/2,D,a.gz+8,-.75,.3,190);
  V[nm+' east end']=portCam(b.gx+rb.W/2,D,b.gz+8,.75,.3,190);
  if(R.back&&R.back.length){const e=ext(R.back);V[nm+' land blocks']=portCam((e.x0+e.x1)/2,D,(e.z0+e.z1)/2,-.25,.55,Math.max(e.x1-e.x0,e.z1-e.z0)*1.1+160);}
  if(R.sea&&R.sea.length){const e=ext(R.sea.concat(R.moored||[]));const x=(e.x0+e.x1)/2;
   V[nm+' sea platforms']=portCam(x,D,(e.z0+e.z1)/2,.5,.5,Math.max(e.x1-e.x0+120,e.z1-e.z0)*1.1+200);}}
 const q=L.items.find(it=>it.key==='quay'&&it.d===0)||L.items[0];
 V['Eye level on the quay']=[q.gx-70,D+1.7,q.gz-9,q.gx+40,D+2.2,q.gz-3];
 V['From the sea']=[(X0+X1)/2,16,Math.max(760,all.z1+380),(X0+X1)/2,6,0];
 V['From above']=[(X0+X1)/2,span*.75+400,150,(X0+X1)/2,0,149];
 const rl=runs[runs.length-1];V['Night over the '+portDName(rl.d).toLowerCase()+' run']=portCam((rl.x0+rl.x1)/2,D,60,.3,.3,(rl.x1-rl.x0)*.6+200,1);
 // the footprint overlay on (8th element): every placed segment outlined and labelled
 const r0=runs[Math.floor(runs.length/2)];
 V['Segment bounds']=portCam((r0.x0+r0.x1)/2,D,(all.z0+all.z1)/2,.1,.95,(r0.x1-r0.x0)*.62+300,0).concat([0,1]);
 return V;}
// Segment target: each decay of the focus key; its sides; from the sea,
// above, at eye level, at night. Works for a vessel focus too.
function portViewsSegment(){const V={},L=PORT_LAYOUT,D=PORT.DECK,runs=L.runs||[];if(!runs.length)return {Empty:[0,300,600,0,0,0]};
 const X0=runs[0].x0,X1=runs[runs.length-1].x1;
 const foc=R=>R.focus||R.items[1]||R.items[0];
 const fo=R=>{if(R.vessel){const Vr=PORT_REG.vessel[L.focus];return {x:R.vessel.x,z:R.vessel.z,y:4,w:Vr.length+60,dp:Vr.beam+60,gz:R.vessel.z,land:0,sea:0};}
  const it=foc(R),G=portRegOf(it.key);return {x:it.gx,z:it.gz+(G.SEA-G.LAND)/2,y:D,w:G.W,dp:G.LAND+G.SEA,gz:it.gz,land:G.LAND,sea:G.SEA};};
 V['Overview']=portCam((X0+X1)/2,0,120,.2,.45,(X1-X0)*.6+300);
 for(const R of runs){const F=fo(R);V[portDName(R.d)]=portCam(F.x,F.y,F.z,.45,.42,Math.max(260,F.dp*.95+F.w*.35+80));}
 const R0=runs[0],F0=fo(R0),it0=foc(R0),pl=portPlaceOf(it0.key),zs=pl==='coast'?6:F0.z-it0.gz;
 if(!R0.vessel){const w0=portRegOf(it0.key).W;V['West side']=portCam(it0.gx-w0/2,D,it0.gz+zs,-.7,.34,170);
  V['East side']=portCam(it0.gx+w0/2,D,it0.gz+zs,.7,.34,170);
  const Rr=runs.find(r=>r.d===1);if(Rr){const it=foc(Rr);V['Ruined sides']=portCam(it.gx,D,it.gz+(pl==='coast'?20:zs),.05,.5,300);}}
 V['From the sea']=[F0.x,14,F0.gz+F0.sea+280,F0.x,8,F0.gz];
 V['Above']=[F0.x,Math.max(500,F0.dp*1.25+200),F0.z+1,F0.x,0,F0.z];
 const we=portRegOf(it0.key).W;
 V['Eye level']=R0.vessel?[F0.x-40,D+1.7,F0.gz-F0.dp/2-20,F0.x,8,F0.gz]:pl==='coast'?[it0.gx-we*.32,D+1.7,it0.gz-10,it0.gx+we*.14,D+2.2,it0.gz-4]
  :[it0.gx-we*.32,D+1.7,F0.z-F0.dp*.3,it0.gx+we*.14,D+2.2,F0.z];
 const Rn=runs[runs.length-1],Fn=fo(Rn);V['Night']=portCam(Fn.x,Fn.y,Fn.z,.4,.35,Math.max(240,Fn.dp*.8+120),1);
 V['Bounds']=portCam(F0.x,D,F0.z,.1,.9,Math.max(420,F0.dp*1.3+F0.w),0).concat([0,1]);
 return V;}

// ---------------------------------------------------------------- inspector tags
// Click-to-inspect names what it hit even without a REGISTER volume. Every
// mesh made through mesh()/meshMerged() (so every pbFlush batch) and every
// kput instance is tagged, at creation, with the budget key being built
// (TSTAT.cur: 'cgBox/1', 'vsGiant/3#2') and the current PART name, if a
// builder set one with portPart('straddle carrier') ... portPart(null). The
// scene fills PORT_OWN[stat] = {key, d, name, place, host} for every placed
// segment and vessel, so the inspector can say "Container dock (ruined) -
// near Straddle carrier / pkCont40R" at worst. REGISTER volumes stay the
// preferred, more specific name. None of this draws from the PRNG.
const PORT_OWN={'env/0':{key:'env',d:0,name:'Terrain and nature'}};
let PORT_PART=null;
function portPart(name){PORT_PART=name||null;}
{const _mesh0=mesh;
 mesh=function(geo,mat,parent,x,y,z){const m=_mesh0(geo,mat,parent,x,y,z);
  if(TSTAT.cur)m.userData.own=TSTAT.cur;if(PORT_PART)m.userData.part=PORT_PART;return m;};
 const _kput0=kput;
 kput=function(name,p,q,s,c){_kput0(name,p,q,s,c);const L=KIT.items[name];
  if(L&&L.length){const it=L[L.length-1];it.own=TSTAT.cur;if(PORT_PART)it.part=PORT_PART;}};}
// REGISTER, port edition: (x, y, z) go through the group transform KXF as
// kput's positions do, so a helper that registers itself (portContainerHouse,
// portShed) lands in the right place inside a rotated vessel or crane group.
// A caller that has already transformed its point passes xf:false. Each
// entry also remembers its owner (TSTAT.cur) and part.
REGISTER=function(o){let x=o.x,y=o.y||0,z=o.z;
 if(KXF&&o.xf!==false){const v=new THREE.Vector3(x,y,z).applyMatrix4(KXF.m);x=v.x;y=v.y;z=v.z;}
 REG.push({name:o.name,x:x+KOFF[0],y,z:z+KOFF[2],r:o.r,h:o.h,own:TSTAT.cur,part:PORT_PART||undefined});};
// The owner record of a stat key, and its display name.
function portOwnerOf(stat){if(!stat)return null;
 return PORT_OWN[stat]||PORT_OWN[stat.split('#')[0]]||{key:stat.split('/')[0],d:+stat.split('/')[1]||0,name:stat.split('/')[0]};}
function portOwnerName(stat){const o=portOwnerOf(stat);if(!o)return '';if(o.key==='env')return o.name;
 let s=o.name+' ('+portDName(o.d).toLowerCase()+')';
 if(o.host){const h=portOwnerOf(o.host);if(h&&h.key!=='env')s+=' at the '+h.name.toLowerCase();}
 return s;}

// ---------------------------------------------------------------- the salvage pass, port edition
// The kit's repairPass() (69-mat-salvage.js) samples EVERY mesh under the
// group, so on the port it stuck shanties and patches to invisible
// night-only light beams (the shacks floating round the reclaimed
// lighthouse), to glass, to open paving and to thin members (crane bars,
// rails, masts). This is the same two populations under the port's rules:
//  * sources: visible, opaque MeshStandard meshes only (no probeSkip or
//    noRepair on it or an ancestor, no invisible ancestor); nothing sampled
//    below y = 0.4;
//  * patches only on wall triangles whose shortest edge is >= 1.2 m, and
//    no bigger than 1.6x that edge (a 0.5 m bar gets none);
//  * shanties only on RAISED flat triangles (a roof, a platform: not at deck
//    level and more than 1 m over the ground or sea under it) whose shortest
//    edge is >= 3 m. Open deck and paving get the odd planter or water butt.
function portFaceSamples(G,count,lo,hi){
 const tri=[],cum=[],v=new THREE.Vector3();let tot=0;
 G.updateMatrixWorld(true);const inv=new THREE.Matrix4().copy(G.matrixWorld).invert();
 const ok=o=>{if(!o.isMesh||o.isInstancedMesh)return false;
  for(let p=o;p&&p!==G;p=p.parent){if(!p.visible)return false;if(p.userData&&(p.userData.noRepair||p.userData.probeSkip))return false;}
  const m=o.material;return !!m&&!Array.isArray(m)&&m.isMeshStandardMaterial&&!m.transparent&&m.opacity>=1&&m.visible!==false;};
 G.traverse(o=>{if(!ok(o))return;const g=o.geometry,A=g&&g.attributes&&g.attributes.position;if(!A)return;
  const M=new THREE.Matrix4().multiplyMatrices(inv,o.matrixWorld);
  const P=A.array,I=g.index?g.index.array:null,nT=I?I.length/3:A.count/3;
  for(let f=0;f<nT;f++){const a=(I?I[f*3]:f*3)*3,b=(I?I[f*3+1]:f*3+1)*3,c=(I?I[f*3+2]:f*3+2)*3;
   v.set(P[a],P[a+1],P[a+2]).applyMatrix4(M);const ax=v.x,ay=v.y,az=v.z;
   v.set(P[b],P[b+1],P[b+2]).applyMatrix4(M);const bx=v.x,by=v.y,bz=v.z;
   v.set(P[c],P[c+1],P[c+2]).applyMatrix4(M);const cx=v.x,cy=v.y,cz=v.z;
   const ux=bx-ax,uy=by-ay,uz=bz-az,wx=cx-ax,wy=cy-ay,wz=cz-az;
   const nx=uy*wz-uz*wy,ny=uz*wx-ux*wz,nz=ux*wy-uy*wx,L=Math.hypot(nx,ny,nz);
   if(!(L>1e-9))continue;const up=Math.abs(ny/L);if(up<lo||up>hi)continue;
   const e=Math.min(Math.hypot(ux,uy,uz),Math.hypot(wx,wy,wz),Math.hypot(cx-bx,cy-by,cz-bz));
   tot+=L*.5;tri.push([ax,ay,az,bx,by,bz,cx,cy,cz,nx/L,ny/L,nz/L,e]);cum.push(tot);}});
 const out=[];
 if(tot>0)for(let i=0;i<count;i++){const t=rng()*tot;let a=0,b=cum.length-1;
  while(a<b){const m=(a+b)>>1;if(cum[m]<t)a=m+1;else b=m;}
  const T=tri[a];let u=rng(),w=rng();if(u+w>1){u=1-u;w=1-w;}
  out.push({p:[T[0]+u*(T[3]-T[0])+w*(T[6]-T[0]),T[1]+u*(T[4]-T[1])+w*(T[7]-T[1]),T[2]+u*(T[5]-T[2])+w*(T[8]-T[2])],n:[T[9],T[10],T[11]],e:T[12]});}
 return {out,area:tot};}
function portRepairPass(G,d){
 const A=portFaceSamples(G,0,0,1.01).area;if(!(A>0))return;
 // scaled by the sampled area, not the bounding box: a light beam or a long
 // rail no longer inflates the count
 const sz=clamp(Math.sqrt(A)*1.1,18,620);
 const nSide=Math.round(clamp(sz*.62,16,340)),nUp=Math.round(clamp(sz*.40,12,240));
 const PATCH=['patchSheet','patchPlate','patchBoard','patchTarp'],D=PORT.DECK;
 const k0=PORT_PART;portPart('salvage');
 for(const f of portFaceSamples(G,nSide,0,.34).out){
  if(rng()<.42)continue;
  if(f.p[1]<.4||f.e<1.2)continue;
  const n=f.n,w=Math.min(rr(2,7.5),f.e*1.6),h=Math.min(rr(1.6,5),f.e*1.6);
  const q=qFacing(n).multiply(qEuler(0,0,rr(-.24,.24)));
  kput(PATCH[(rng()*4)|0],[f.p[0]+n[0]*.25,f.p[1]+n[1]*.25,f.p[2]+n[2]*.25],q,[w,h,1],null);
  if(rng()<.09)kput('dot',[f.p[0]+n[0]*.6,f.p[1]+n[1]*.6+h*.35,f.p[2]+n[2]*.6],q,[1.2,1.2,1],WARM);}
 for(const f of portFaceSamples(G,nUp,.62,1.01).out){const p=f.p,r=rng();if(p[1]<.4)continue;
  const gy=Math.max(0,terrainH(p[0]+KOFF[0],p[2]+KOFF[2]));
  if(Math.abs(p[1]-D)<.7||p[1]-gy<1){                        // deck, paving, ground-level slabs
   if(r<.12)kput('waterButt',[p[0],p[1]+1.15,p[2]],null,[1.15,2.3,1.15],null);
   else if(r<.3&&f.e>=1.5){kput('planter',[p[0],p[1]+.35,p[2]],qEuler(0,rng()*TAU,0),[rr(1.6,3.2),.7,rr(1,1.8)],null);
    for(let k=0;k<3;k++)kput('moss',[p[0]+rr(-1.1,1.1),p[1]+.95,p[2]+rr(-.7,.7)],null,[.75,.5,.75],new THREE.Color().setHSL(rr(.26,.34),.55,.28));}
   continue;}
  if(r<.32&&f.e>=3){const w=rr(2.5,Math.min(6.5,f.e*1.4)),hh=rr(2,3.8),dp=rr(2.5,Math.min(6,f.e*1.4));const yaw=rng()*TAU;
   kput('shantyBox',[p[0],p[1]+hh/2,p[2]],qEuler(0,yaw,0),[w,hh,dp],null);
   kput('shantyRoof',[p[0],p[1]+hh+.2,p[2]],qEuler(rr(.08,.26),yaw,0),[w*1.3,1,dp*1.3],null);
   if(rng()<.45)kput('spipe',[p[0]+w*.28,p[1]+hh+1.4,p[2]],null,[.28,3,.28],null);}
  else if(f.e<1)continue;
  else if(r<.50)kput('waterButt',[p[0],p[1]+1.15,p[2]],null,[1.15,2.3,1.15],null);
  else if(r<.73){kput('planter',[p[0],p[1]+.35,p[2]],qEuler(0,rng()*TAU,0),[rr(1.6,Math.min(4.2,f.e*1.8)),.7,rr(1,2.2)],null);
   for(let k=0;k<3;k++)kput('moss',[p[0]+rr(-1.3,1.3),p[1]+.95,p[2]+rr(-.9,.9)],null,[.75,.5,.75],new THREE.Color().setHSL(rr(.26,.34),.55,.28));}
  else if(r<.87)kput('plank',[p[0],p[1]+.12,p[2]],qEuler(0,rng()*TAU,0),[rr(2,Math.min(6,f.e*2)),.22,rr(.5,1.3)],null);
  else if(rng()<.5)kput('dot',[p[0],p[1]+1.7,p[2]],qEuler(0,rng()*TAU,0),[1.2,1.2,1],WARM);}
 portPart(k0);}
