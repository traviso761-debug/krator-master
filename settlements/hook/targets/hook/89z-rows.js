// TARGET: hook - the waterfront of Hook (settlements/hook/PLAN.md, section 2), laid out with the grid placement
// (settlements/port/src/70-port-core.js "layout") as settlements/port/targets/harbour does it: one coastal run along
// the kit's x, the Point (-x) to the Stacks (+x): on the scale model the sea is north, the frame a half turn, so the
// Point stands at the world's EAST end and the Stacks at the west (the owner, 2026-10-19: Iziz's segments east, Voth's
// west); land blocks two deep behind the Customs (the pier) and behind the Sun Canton
// (the heliport and the plain quays east of it); the L of four sea platforms off the great pier's end (the hook of
// the Hook); the five vessels. Every key the kit registers is placed at least once (verify.py: port-every-key).
// Decays are per segment, from the plan's table: 0 repaired (the working harbour in the middle), 1 worn (the edges),
// 3 salvage (where the salvagers live).
// P1 (2026-10-19): the ground behind the port (76-hook-ground.js: the Heights' ridge and the hill behind, as layout
// stamps) and the Ancient town's ruin hosts (79-hook-ancient.js) on its grid: the site's named hosts
// (site/hook-site.json `hosts`), then a host per free block by KRAND, seeded from (HOOK_SEED, stretch, row, column),
// never from how many came before. Each host is registered in core/tags before anything draws it.
const TITLE='Krator — Hook, the waterfront and the Ancient town (P1)';
const PORT_LAYOUT_DEF=(()=>{const ok=k=>!!PORT_REG.seg[k];
 // the coast, west to east: [key, decay, set-back]. Set-backs keep neighbours within 40 m of each other.
 const plan=[
  ['hbHaven',1,0],      // the Point: the Hukoa light
  ['hbFish',1,0],       // the Strand: the Hukoa harbour
  ['hbMarina',1,0],     // the Strand, east
  ['tmPass',1,0],       // the Tethyan quarter
  // the working harbour was decay 0 (the Izani's fresh repairs, PLAN.md section 6 question 5); the owner (2026-10-19)
  // wants the port's buildings rusty like the ships, which is the kit's worn decay 1 on every segment; the fresh
  // repairs come back as dressing records in P3 (scaffolds, new timber, orange rails), not as the kit's clean decay
  ['cgStore',1,-20],    // the Customs, west of the pier
  ['cgBox',1,-20],
  ['cgCrane',1,-20],
  ['pier',1,0],         // the Hook
  ['quay',1,0],         // the Imperial quay
  ['cgCrane',1,20],     // the eastern crane, worn: the signal mast
  ['slBerth',1,20],     // the Iron Court
  ['slPen',1,20],
  ['tmShip',1,0],       // the Arsenal
  ['ddDock',1,0],
  ['ddShed',1,0],
  ['ddYard',1,0],
  ['tmHeli',1,0],       // the Sun Canton
  ['quay110',1,0],      // the Stacks' shore
  ['quay110',3,-20]].filter(p=>ok(p[0]));
 const R=portRun(plan.map(p=>p[0]),0,0,plan.map(p=>p[2]),{run:0});
 R.items.forEach((it,i)=>{it.d=plan[i][1];});
 const mid=(R.x0+R.x1)/2;R.x0-=mid;R.x1-=mid;for(const it of R.items)it.gx-=mid;
 const items=R.items.slice(),stamps=[],back=[],sea=[],moored=[];
 const at=(k,n)=>{let c=0;for(const it of items)if(it.key===k&&c++===(n||0))return it;return null;};
 const pier=at('pier'),berth=at('slBerth'),heli=at('tmHeli'),q1=at('quay110',0),q2=at('quay110',1);
 // the berth holds the carrier; the pen holds its submarine by itself (87-sl-d-pen.js). The pier's slip is left to
 // the layout (fleet:[null]): the grounded giant is a free vessel at ITS decay, 3, which the pier's hook (the host's
 // decay) could not give it.
 if(berth)berth.vessel='slCarrier';
 if(pier)pier.fleet=[null];
 // land blocks: the Customs House behind the pier's axis, the granary canton behind it
 const push=(arr,b)=>{if(b)arr.push(b);return b;};
 if(pier){const a=push(back,portBehind(pier,'lbAuthority',{d:1}));if(a)push(back,portBehind(a,'lbStores',{d:1}));}
 // the Sun Canton and the Stacks: the necropolis (tank farm) behind the heliport with the tank houses behind it, the
 // container towers and compounds behind the plain quays at the eastern edge
 if(heli){const t=push(back,portBehind(heli,'lbTanks',{d:1}));if(t)push(back,portBehind(t,'chTank',{d:3}));}
 if(q1)push(back,portBehind(q1,'chStack',{d:3}));
 if(q2)push(back,portBehind(q2,'chCourt',{d:3}));
 // the hook of the Hook: two platforms seaward off the pier's end, then two east
 if(pier&&ok('spYard')){const p1=portOff(pier,'spYard','S',{d:1}),p2=portOff(p1,'spYard','S',{d:1}),
  p3=portOff(p2,'spYard','E',{d:1}),p4=portOff(p3,'spYard','E',{d:1});sea.push(p1,p2,p3,p4);}
 // the vessels the layout moors itself
 if(pier){const PR=portRegOf('pier'),e=portFoot(pier);
  // the stack town: the giant grounded in the pier's slip (the pier's own berth: x 72, bow out to sea)
  const VG=PORT_REG.vessel.vsGiant;
  if(VG){const gx=pier.gx+72,gz=pier.gz+24+VG.length/2;moored.push({vessel:true,key:'vsGiant',d:3,gx,gz,heading:0,run:0});}
  // the grain ship along the platforms' west face, the wreck off the L's east end
  const ext={x0:pier.gx+PR.seaEnd.x-55,x1:pier.gx+PR.seaEnd.x+55,z0:e.z1,z1:e.z1+220};
  const a=sea.length?portMoor('vsPanamax',1,'W',[sea[0],sea[1]],null,{dz:20}):portMoor('vsPanamax',1,'W',null,ext);
  const b=sea.length?portMoor('vsFeeder',3,'E',[sea[3]],null):portMoor('vsFeeder',3,'E',null,ext);
  for(const m of [a,b])if(m){moored.push(m.item);stamps.push(m.stamp);}
  // the sunk submarine off the platforms: beyond the seaward pair, bows to the open sea, on the seabed
  const VS=PORT_REG.vessel.slSub;
  if(VS){const host=sea.length?sea[1]:pier,f=portFoot(host),sx=f?(f.x0+f.x1)/2+30:pier.gx,sz=(f?f.z1:e.z1)+VS.length/2+40;
   moored.push({vessel:true,key:'slSub',d:3,gx:sx,gz:sz,heading:.5,run:0});
   stamps.push({kind:'dig',x0:sx-VS.length/2-30,x1:sx+VS.length/2+30,z0:sz-VS.length/2-30,z1:sz+VS.length/2+30,y:-(VS.draft+8),soft:40});}}
 // ---------------------------------------------------------------- P1: the ground behind the port
 for(const s of HOOK_GROUND.stamps())stamps.push(s);
 // ---------------------------------------------------------------- P1: the Ancient town's ruin hosts
 // A host is a land block (place 'land') whose item sits at the pad's seaward edge: gz = z + W/2 for a host centred
 // on z (79-hook-ancient.js). opt carries what the builder needs beyond the kit's fields: ry, cutY, the record's name.
 const hosts=[],SITE=HOOK_SITE,KL=KCITY.lib;
 const hostItem=(key,x,z,d,o)=>{const W=HOOK_HOSTS[key].W;return {key,d,gx:x,gz:z+W/2,place:'land',slot:0,run:0,ancient:true,
  opt:{ry:o.ry==null?0:o.ry,cutY:o.cutY==null?null:o.cutY,hostName:o.name||key,hostId:o.id}};};
 const hostFoot=it=>{const W=HOOK_HOSTS[it.key].W;return {x0:it.gx-W/2,x1:it.gx+W/2,z0:it.gz-W,z1:it.gz};};
 const overlap=(a,b,pad)=>a.x0<b.x1+pad&&a.x1>b.x0-pad&&a.z0<b.z1+pad&&a.z1>b.z0-pad;
 const taken=items.concat(back).map(portFoot).filter(Boolean);   // the Port's own footprints
 for(const h of (SITE.hosts||[])){if(!HOOK_HOSTS[h.key])continue;
  const cutY=hookHostCut(h.key,h.cut,KRAND.unit(KRAND.hash(KRAND.child(HOOK_SEED,'host-cut:'+h.id),1)));
  const it=hostItem(h.key,h.x,h.z,h.d==null?1:h.d,{ry:h.ry,cutY,name:h.name,id:h.id});const f=hostFoot(it);
  if(taken.some(t=>overlap(f,t,4))){reportErr('host '+h.id+' overlaps a Port footprint: not placed');continue;}
  hosts.push(it);taken.push(f);}
 // the rest of the grid: a host per free block by hash. A block near an avenue stays free (the avenues are laid at
 // step 3 and would knock a host out); a block under the Heights' front slope stays free (the stair and the funicular,
 // P3); the type by the site's weights, the decay by the quarter's ruin level, the cut by the quarter too.
 const G=SITE.grid||{},rows=G.rows||[],z1=G.z1==null?-150:G.z1,B=G.block||110,S=G.street||20,W=G.weights||{anArcades:1};
 const keys=Object.keys(W).filter(k=>HOOK_HOSTS[k]),wsum=keys.reduce((s,k)=>s+W[k],0);
 const quarters=(SITE.districts||[]).filter(d=>d.type==='quarter');
 const quarterAt=(x,z)=>quarters.find(q=>KL.inPoly([x,z],q.poly))||null;
 const nearAvenue=(x,z,r)=>(SITE.avenues||[]).some(a=>{for(let i=1;i<a.pts.length;i++)if(KL.segDist([x,z],a.pts[i-1],a.pts[i])<r)return true;return false;});
 const ridge=HOOK_GROUND.ridge,gridSeed=KRAND.child(HOOK_SEED,'host-grid');
 rows.forEach((st,si)=>{const [xa,xb,n]=st;
  for(let r=0;r<n;r++){const bz1=z1-r*(B+S),bz0=bz1-B;
   for(let xs=xa+S/2,c=0;xs+B<=xb;xs+=B+S,c++){const cx=xs+B/2,cz=(bz0+bz1)/2;
    const h=KRAND.stream(KRAND.hash(gridSeed,si,r,c));
    const core=cx>-730&&cx<810,p=core?(G.p==null?.45:G.p):(G.pEdge==null?.3:G.pEdge);
    if(h.next()>=p)continue;
    if(nearAvenue(cx,cz,B/2+8))continue;
    if(cx>ridge.x0&&cx<ridge.x1&&cz<ridge.z1+ridge.soft&&cz>ridge.z1-20)continue;   // the front slope of the Heights
    let u=h.next()*wsum,key=keys[keys.length-1];for(const k of keys){u-=W[k];if(u<=0){key=k;break;}}
    const q=quarterAt(cx,cz),ruin=q?(q.ruin==null?.5:q.ruin):.5;
    const d=ruin<.33?3:1,cut=ruin<.33?'tall':ruin<.66?'mid':'low';
    const cutY=hookHostCut(key,cut,h.next());
    const it=hostItem(key,cx,cz,d,{ry:0,cutY,name:HOOK_HOSTS[key].spec.name,id:'g'+si+'-'+r+'-'+c});const f=hostFoot(it);
    if(taken.some(t=>overlap(f,t,4)))continue;
    hosts.push(it);taken.push(f);}}});
 // every host and quarter in core/tags before anything is drawn (CLAUDE.md): building records of the ancient layer
 const T=KTAGS.create({build:'hook'});
 for(const it of hosts){const W=HOOK_HOSTS[it.key].W,S=HOOK_HOSTS[it.key].spec;
  it.tag=T.add({class:'building',kind:'ruin',key:it.key,name:it.opt.hostName,at:[it.gx,0,it.gz-W/2],ry:it.opt.ry,size:[W,W,it.opt.cutY||S.H],
   tags:{culture:'ancients',types:['civic'],wealth:'civic',decay:it.d,layer:'ancient'},note:it.opt.hostId}).id;}
 for(const q of quarters){let cx=0,cz=0;for(const p of q.poly){cx+=p[0];cz+=p[1];}cx/=q.poly.length;cz/=q.poly.length;
  T.add({class:'feature',kind:'quarter',key:q.id,name:q.name,at:[cx,0,cz],size:[1,1,1],tags:{layer:q.layer,holder:q.holder,mood:q.mood},note:q.id});}
 const run=Object.assign({d:0,back,sea,moored},R);
 return {items:items.concat(back,hosts,sea,moored),runs:[run],stamps,vessels:portVesselKeys(),
  harbour:{pier,back,sea},hook:{at,pier,berth,heli,hosts,tags:T}};})();
