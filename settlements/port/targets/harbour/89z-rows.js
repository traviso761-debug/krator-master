// TARGET: harbour - a small Long-Beach-like composition (refs/long-beach.png)
// built with the grid placement (70-port-core.js "layout"): one coastal
// run of existing segments with the great pier in the middle; land blocks two
// rows deep behind its centre (the hinterland of yards and sheds); and sea
// platforms off the pier's end, chained seaward and then east into an L, like
// Long Beach's Pier J / Pier T landfill, with basins between. Ships: the giant
// in the pier's slip, the drone carrier at the deep-water berth, the Panamax
// along the platforms' west face, the feeder off the L's east end.
// Whatever place:'land' / place:'sea' keys are registered are used, cycled;
// with none registered the run and the ships still stand.
const TITLE='Krator Ancient Port — harbour';
const HARBOUR_D=0;                     // the decay the whole harbour is built in
const PORT_LAYOUT_DEF=(()=>{const d=HARBOUR_D,ok=k=>PORT_REG.seg[k]&&PORT_REG.seg[k].decays.indexOf(d)>=0;
 const byP=p=>portSegKeys().filter(k=>portPlaceOf(k)===p&&ok(k));
 // the coast, west to east, and each segment's set-back (neighbours <= 40 apart)
 const plan=[['hbHaven',0],['hbMarina',0],['tmPass',0],['cgStore',-20],['cgBox',-20],['cgCrane',-20],['pier',0],
  ['quay',0],['cgCrane',20],['slBerth',20],['tmShip',0],['ddDock',0],['hbFish',0]].filter(p=>ok(p[0]));
 const R=portRun(plan.map(p=>p[0]),d,0,plan.map(p=>p[1]),{run:0});
 const mid=(R.x0+R.x1)/2;R.x0-=mid;R.x1-=mid;for(const it of R.items)it.gx-=mid;
 const items=R.items.slice(),stamps=[],back=[],sea=[],moored=[];
 for(const it of items){if(it.key==='pier')it.vessel='vsGiant';if(it.key==='slBerth')it.vessel='slCarrier';}
 // land blocks: a 110 m slot behind every 110 m of the central coast (cgStore
 // .. slBerth), and a second row behind the middle four
 const lk=byP('land');let li=0;
 if(lk.length){const from=items.findIndex(it=>it.key==='cgStore'),to=items.findIndex(it=>it.key==='slBerth');
  const row1=[];
  items.forEach((it,i)=>{if(from<0||to<0||i<from||i>to)return;const n=Math.floor(portRegOf(it.key).W/PORT.BLOCK+1e-6);
   for(let j=0;j<n;j++){const b=portBehind(it,lk[li++%lk.length],{dx:(j-(n-1)/2)*PORT.BLOCK});if(b)row1.push(b);}});
  const m0=Math.max(0,Math.floor(row1.length/2)-2);
  for(const h of row1.slice(m0,m0+4)){const b=portBehind(h,lk[li++%lk.length]);if(b)back.push(b);}
  back.unshift(...row1);}
 // sea platforms off the pier's end: two seaward, then two east (an L)
 const sk=byP('sea'),pier=items.find(it=>it.key==='pier');let si=0;const nk=()=>sk[si++%sk.length];
 if(sk.length&&pier){const p1=portOff(pier,nk(),'S'),p2=portOff(p1,nk(),'S'),p3=portOff(p2,nk(),'E'),p4=portOff(p3,nk(),'E');
  sea.push(p1,p2,p3,p4);}
 // ships alongside: the Panamax on the west face of the seaward pair, the
 // feeder off the east end of the L (or both off the pier head, no platforms)
 if(pier){const e=portFoot(pier),ex=pier.gx+portRegOf('pier').seaEnd.x,ext={x0:ex-55,x1:ex+55,z0:e.z1,z1:e.z1+220};
  const a=sea.length?portMoor('vsPanamax',d,'W',[sea[0],sea[1]],null,{dz:20}):portMoor('vsPanamax',d,'W',null,ext);
  const b=sea.length?portMoor('vsFeeder',d,'E',[sea[3]],null):portMoor('vsFeeder',d,'E',null,ext);
  for(const m of [a,b])if(m){moored.push(m.item);stamps.push(m.stamp);}}
 const run=Object.assign({d,back,sea,moored},R);
 return {items:items.concat(back,sea,moored),runs:[run],stamps,vessels:portVesselKeys(),harbour:{pier,back,sea}};})();
