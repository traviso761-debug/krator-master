// ================================================================= HOST — build (Pinnacle Rock: the rock's plants, then the forest)
// Two kits on one page (biomes/WORLD.md), as on the necanyons page: the necanyons kit first, on the walls, their feet and
// the stacks, but not on the mesa's top (the town's ground: PLAN.md, "no trees on the top") except in its 12 m rim band
// and on the Garden's stacks; its trees become obstacles; then the hyperjungle plants the floor (necanyons' jungleMask:
// off the rock and the walls' feet, out of the farms and the bands' grounds, thin on the cleared ground); then one bake.
window._biome=null;window._jungle=null;
// the kit's mask on this page: the water's, and nothing on the town's ground (the mesa's top and the Garden's mesa) more
// than 12 m in from its edge; the stacks on it keep theirs
const topMask=(x,z)=>{const on=KSTACKS.at(ROCK,x,z);if(!on||TOWN_GROUND.indexOf(on.S)<0)return 1;return on.d>-12?1:0;};
// THE SEEP LINES ON THE ROCK AS DRAWN (BUGS-2026-11-15 S2): necanyons' 57 hangs its carnivorous moss and maidenhair from
// a bed's lip as KSTACKS' outline gives it (K.footR, K.topH). On this 1.2 km mesa the drawn wall stands up to 12 m inside
// that outline and its weathered rim lower than the bed's top (43: PRR.wallR), so the probe found them ~4 m over the top
// and 10-17 m off the nearest drawn rock: 120 of the attach audit's 129 floaters. While the kit builds, each such card
// (above the ground, within 30 m of a body's drawn wall) is moved along its own bearing onto that wall: the moss hung
// 0.35 m off the drawn face from the drawn lip, the fern on the drawn lip. The kit's draws and their order are unchanged.
const SEEP_ON_ROCK=(function(){const K=KSTACKS,ITEMS={carnmoss:'hang',seepfern:'lip'},st={moved:0,kept:0};
 const bodyR=B=>(B.R==null?Math.max(...B.beds.map(b=>Math.max(b.rx||0,b.rz||0))):B.R)+30;
 const bedAt=(B,y)=>{let best=B.beds[0];for(const b of B.beds){if(y>=b.y)best=b;}return best;};
 // the drawn lip at bearing a: the highest y (in 0.25 m steps, at most 16 m down from y) where the drawn wall stands
 const lip=(B,cx,cz,a,y)=>{for(let t=y+1;t>y-16;t-=.25){const r=PRR.wallR(K,B,cx,cz,a,t);if(r>0)return{y:t,r};}return null;};
 function fit(name,pos){const x=pos[0],y=pos[1],z=pos[2];if(y-terrainH(x,z)<1){st.kept++;return;}
  let best=null;for(const B of NECANYONS.bodies()){if(Math.hypot(x-B.x,z-B.z)>bodyR(B))continue;const b=bedAt(B,y-2),a=Math.atan2(z-b.cz,x-b.cx),L=lip(B,b.cx,b.cz,a,y);if(!L)continue;
   const d=Math.abs(Math.hypot(x-b.cx,z-b.cz)-L.r)+Math.abs(y-L.y);if(d<30&&(!best||d<best.d))best={d,B,cx:b.cx,cz:b.cz,a,L};}
  if(!best){st.kept++;return;}const {B,cx,cz,a,L}=best;
  let r,ny;if(ITEMS[name]==='hang'){r=PRR.wallR(K,B,cx,cz,a,L.y-1)||L.r;r+=.35;ny=L.y+.25;}else{r=Math.max(0,L.r-.3);ny=L.y+.05;}
  pos[0]=cx+Math.cos(a)*r;pos[1]=ny;pos[2]=cz+Math.sin(a)*r;st.moved++;}
 return{stats:st,wrap(fn){const put=BIO.put;BIO.put=function(name,pos){if(ITEMS[name])fit(name,pos=pos.slice());return put.apply(this,[name,pos].concat([].slice.call(arguments,2)));};
  try{return fn();}finally{BIO.put=put;}}};})();
(function(){
 const t0=performance.now();
 const Q=new URLSearchParams(location.search),q=Q.has('q')?+Q.get('q'):1;
 MASK=(x,z)=>wayClear(x,z)?waterMask(x,z)*topMask(x,z):0;   // and nothing on the Stair's path or the lift road (47b)
 try{window._biome=SEEP_ON_ROCK.wrap(()=>NECANYONS.build({R:TERR.R-60,quality:q}));}catch(e){reportErr('necanyons: '+e.stack);}finally{MASK=waterMask;}
 window._seepOnRock=SEEP_ON_ROCK.stats;_mark('necanyons');
 (NECANYONS.TREES||[]).forEach(T=>OBSTACLES.push({x:T.x,z:T.z,r:T.crownR*.6+1,y0:T.y0-3,y1:T.y0+T.H}));
 if(!Q.has('nojungle')){try{MASK=jungleMask;window._jungle=HYPERJUNGLE.build({R:TERR.R-60,quality:q*.7,heroR:900,fauna:!Q.has('nofauna')});}catch(e){reportErr('hyperjungle: '+e.stack);}finally{MASK=waterMask;}}
 _mark('jungle');
 try{window._talus=dressTalus(q);}catch(e){reportErr('talus: '+e.stack);}   // the debris slope's fallen blocks (87)
 if(Q.has('nobake')){window._stats=JSON.parse(JSON.stringify(BIO.stats));window._instances=0;window._bakeCalls=0;return;}
 const b=BIO.bake();
 _mark('bake');window._instances=b.inst;window._bakeCalls=b.calls;window._buildMs=Math.round(performance.now()-t0);
 REGISTER({name:'Pinnacle Rock (the knoll and its forest)',x:0,z:0,r:TERR.R,h:560});
})();
