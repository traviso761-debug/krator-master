// TARGET: hook - the waterfront of Hook (settlements/hook/PLAN.md, section 2), laid out with the grid placement
// (settlements/port/src/70-port-core.js "layout") as settlements/port/targets/harbour does it: one coastal run west
// to east, the Point to the Stacks; land blocks two deep behind the Customs (the pier) and behind the Sun Canton
// (the heliport and the plain quays east of it); the L of four sea platforms off the great pier's end (the hook of
// the Hook); the five vessels. Every key the kit registers is placed at least once (verify.py: port-every-key).
// Decays are per segment, from the plan's table: 0 repaired (the working harbour in the middle), 1 worn (the edges),
// 3 salvage (where the salvagers live).
const TITLE='Krator — Hook, the waterfront (P0)';
const PORT_LAYOUT_DEF=(()=>{const ok=k=>!!PORT_REG.seg[k];
 // the coast, west to east: [key, decay, set-back]. Set-backs keep neighbours within 40 m of each other.
 const plan=[
  ['hbHaven',1,0],      // the Point: the Hukoa light
  ['hbFish',1,0],       // the Strand: the Hukoa harbour
  ['hbMarina',1,0],     // the Strand, east
  ['tmPass',1,0],       // the Tethyan quarter
  ['cgStore',0,-20],    // the Customs, west of the pier
  ['cgBox',0,-20],
  ['cgCrane',0,-20],
  ['pier',0,0],         // the Hook
  ['quay',0,0],         // the Imperial quay
  ['cgCrane',1,20],     // the eastern crane, worn: the signal mast
  ['slBerth',1,20],     // the Iron Court
  ['slPen',1,20],
  ['tmShip',0,0],       // the Arsenal
  ['ddDock',0,0],
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
 if(pier){const a=push(back,portBehind(pier,'lbAuthority',{d:0}));if(a)push(back,portBehind(a,'lbStores',{d:1}));}
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
 const run=Object.assign({d:0,back,sea,moored},R);
 return {items:items.concat(back,sea,moored),runs:[run],stamps,vessels:portVesselKeys(),
  harbour:{pier,back,sea},hook:{at,pier,berth,heli}};})();
