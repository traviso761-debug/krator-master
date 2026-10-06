// ================================================================= YS CITY — the ground paint: streets, highways and precincts as stamps (PLAN.md P3 step 2)
// The old grid's streets are Ancient paving that runs on under the water; the three highways leave the main market
// along the coast NE, inland NW and along the southern shore; precincts take their ground: the market paved, the
// farms soil, the mustering ground paved, the pens and harbours left to their builders. Everything here is a polygon
// stamp with `kind:'paint'` (the adapted port terrain: paint only, no reshaping; the roads themselves are ribbons, below) pushed onto CITY_STAMPS, which the
// city's PORT_LAYOUT_DEF carries into the terrain. Reserving the streets before anything builds is the one rule that
// stops overlaps: the placer never puts a footprint on a street.
const CITY_STAMPS=[];
const STREET_W=14,HIGHWAY_W=18,LANE_W=7;
LAYOUT.streets=[];LAYOUT.highways=[];
function ysStripPoly(a,b,w){const dx=b[0]-a[0],dz=b[1]-a[1];const L=Math.hypot(dx,dz)||1;const nx=-dz/L*w/2,nz=dx/L*w/2;return [[a[0]+nx,a[1]+nz],[b[0]+nx,b[1]+nz],[b[0]-nx,b[1]-nz],[a[0]-nx,a[1]-nz]];}
(function streets(){const U=LAYOUT.U,V=LAYOUT.V,P=LAYOUT.P;
 // a street between two neighbouring blocks (both present), dry where the plane is above the water, else a canal: the
 // lattice lines run along the block edges, so the street centre line is the shared edge
 const seen={};for(const b of LAYOUT.blocks)for(const [di,dj] of [[1,0],[0,1]]){const n=ysBlock(b.i+di,b.j+dj);if(!n)continue;
  const key=b.i+','+b.j+'-'+di+','+dj;if(seen[key])continue;seen[key]=1;
  // the shared edge: midway between the centres, running along the other axis
  const mx=(b.x+n.x)/2,mz=(b.z+n.z)/2;const ax=di?V:U;const a=[mx-ax[0]*P/2,mz-ax[1]*P/2],e=[mx+ax[0]*P/2,mz+ax[1]*P/2];
  // its kind from the old plane at its own midpoint: a street between a land block and a canal block lies in the water
  const ym=ysPlaneY(ysShoreDist(mx,mz));
  LAYOUT.streets.push({a,b:e,w:STREET_W,kind:ym>1?'street':ym>-1.2?'awash':'canal',blocks:[b,n]});}

 // the highways: from the head along +T (the coast NE), along -N (inland NW) and along -T (the southern shore)
 const H=LAYOUT.HEAD,T=LAYOUT.T,N=LAYOUT.N;
 for(const [d,L,name] of [[T,1500*LAYOUT.K,'NE coast'],[[-N[0],-N[1]],1600*LAYOUT.K,'NW inland'],[[-T[0],-T[1]],1400*LAYOUT.K,'S shore']]){
  const pts=[[H[0],H[1]]];let x=H[0],z=H[1];for(let s=60;s<=L;s+=60){x=H[0]+d[0]*s;z=H[1]+d[1]*s;
   // the coast roads keep 40 m inland of the waterline: nudge along the landward normal where the shore comes close
   if(name!=='NW inland'){const sd=ysShoreDist(x,z);if(sd<40){x-=N[0]*(40-sd);z-=N[1]*(40-sd);}}pts.push([x,z]);}
  LAYOUT.highways.push({name,pts,w:HIGHWAY_W});}
 // the stamps: dry streets and the highways painted; the awash streets keep their paving too (it shows at low water)
 // the streets, except the canals and the ones the river valley cuts (a highway crosses it: its span comes later)
 // (the road stamps are pushed by ysRoadStamps() once the karst field has trimmed the roads: 87d-city-karst.js)
 // precincts: the market block and the mustering ground paved, the farm blocks soil
 for(const b of LAYOUT.blocks){const pv=b.use==='main_market'||b.use==='headland_military'?'pave':b.use==='farm'?'soil':null;if(!pv||b.kind!=='land')continue;
  const h=P*.46;CITY_STAMPS.push({kind:'paint',poly:[[-1,-1],[1,-1],[1,1],[-1,1]].map(q=>[b.x+U[0]*q[0]*h+V[0]*q[1]*h,b.z+U[1]*q[0]*h+V[1]*q[1]*h]),paint:pv,soft:0});}
 LAYOUT.stampCount=CITY_STAMPS.length;
})();
// the roads: the dry and awash streets and lanes (not the ones the river valley cuts: a highway crosses it, its span
// comes later) and the highways. Each is a stamp with NO paint (the stamp keeps the scrub and the trees off the road;
// Travis, Oct 5 2026: the vertex paint on the 10 m grid read as a zig-zag) and a ribbon of paving laid on the ground
// by the draw pass (88b, ysRoadRibbons) from LAYOUT.roads. Called once the karst has trimmed the roads (87d).
LAYOUT.roads=[];
function ysRoadInValley(a,b){const r=ysRiverDist((a[0]+b[0])/2,(a[1]+b[1])/2);return r.d<r.w*2.6;}
// the lanes (Travis, Oct 5 2026: smaller streets to address the buildings in the middle of a block): a neighbourhood
// block with no reclaimed Ancient on it is quartered by two lanes through its centre, one along each axis, from street
// to street; the placer makes them once its land hosts stand (88), reserves them, and lines them with the small houses
// and corner shops that stood in the courtyard ring
function ysLanes(b){const U=LAYOUT.U,V=LAYOUT.V,h=LAYOUT.P/2-STREET_W/2;const out=[];
 for(const ax of [U,V]){const s={a:[b.x-ax[0]*h,b.z-ax[1]*h],b:[b.x+ax[0]*h,b.z+ax[1]*h],w:LANE_W,kind:'lane',blocks:[b,b],lane:true};if(ysRoadInValley(s.a,s.b))continue;
  LAYOUT.streets.push(s);CITY_STAMPS.push({kind:'paint',poly:ysStripPoly(s.a,s.b,s.w),paint:null,soft:0,road:true});LAYOUT.roads.push({a:s.a,b:s.b,w:s.w,kind:'lane'});out.push(s);}
 LAYOUT.stampCount=CITY_STAMPS.length;return out;}
function ysRoadStamps(){const inValley=ysRoadInValley;
 for(const s of LAYOUT.streets){if(s.kind==='canal'||inValley(s.a,s.b))continue;CITY_STAMPS.push({kind:'paint',poly:ysStripPoly(s.a,s.b,s.w),paint:null,soft:0,road:true});LAYOUT.roads.push({a:s.a,b:s.b,w:s.w,kind:s.kind});}
 for(const h of LAYOUT.highways)for(let i=1;i<h.pts.length;i++){CITY_STAMPS.push({kind:'paint',poly:ysStripPoly(h.pts[i-1],h.pts[i],h.w),paint:null,soft:0,road:true});LAYOUT.roads.push({a:h.pts[i-1],b:h.pts[i],w:h.w,kind:'highway',run:h.name,i});}
 LAYOUT.stampCount=CITY_STAMPS.length;}
