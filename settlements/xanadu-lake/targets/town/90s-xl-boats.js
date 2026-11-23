// ================================================================= THE LAKE TOWNS — the boats: drawn from the plan's records
// XL_TOWN.boats (89zq xlBoats): the launches and the market barge moored off the quay, the dugouts drawn up on the landing
// stair and the beach, the dugouts out fishing. Each boat is the kit's piece (kits/xanadu/extra/88d-xa-lakecraft.js) built
// once into a group of its own at the origin and baked, then set where its record puts it: the moored and the drawn-up stay,
// the fishing dugouts drift on their small circles with the page's clock (FRAME_HOOKS' dt). Drawn within XL_BOAT_RANGE of
// the camera. [web]: three.js.
reseed((XL.seed(XLK)>>>8)+3);
const XL_BOAT_RANGE=3500,XL_BOAT_G=[];let XL_BOAT_T=0;
const xlBoatGroup=(key,v,name)=>{const G=new THREE.Group();G.name=name;scene.add(G);TSTAT.cur=key+'/'+v;const r0=REG.length;
 try{VERN.place(G,key,0,0,0,{v,y:0});}catch(e){XL_FAILS.push(key+': '+(e&&e.message||e));}
 for(let i=r0;i<REG.length;i++)REG[i].type=key;TSTAT.cur=null;kbake(G);for(const n in KIT.items)KIT.items[n].length=0;return G;};
const XLB_=XLT.boats||{moored:[],out:[]};
for(const m of XLB_.moored){const G=xlBoatGroup(m.key,m.v,'boat:'+m.id);G.position.set(m.x,m.beached?Math.max(0,terrainH(m.x,m.z))-.2:0,m.z);G.rotation.y=m.ry;XL_BOAT_G.push({G,m});}
for(const o of XLB_.out){const G=xlBoatGroup(o.key,o.v,'boat:'+o.id);XL_BOAT_G.push({G,o});}
function xlBoatsTick(t){const P=camera.position;let shown=0;
 for(const E of XL_BOAT_G){let x,z;
  if(E.m){x=E.m.x;z=E.m.z;}
  else{const a=E.o.ry+t*E.o.w;x=E.o.x+Math.cos(a)*E.o.r;z=E.o.z+Math.sin(a)*E.o.r;E.G.position.set(x,Math.sin(t*.9+E.o.x)*.06,z);E.G.rotation.y=a+(E.o.w>0?0:Math.PI);}
  const v=Math.hypot(P.x-x,P.z-z)<XL_BOAT_RANGE;E.G.visible=v;if(v)shown++;}
 window._boatsShown=shown;}
FRAME_HOOKS.push((dt)=>{XL_BOAT_T+=Math.min(.25,dt||0);xlBoatsTick(XL_BOAT_T);});xlBoatsTick(0);
Object.assign(window._xl,{failed:XL_FAILS.length,fails:XL_FAILS.slice(0,20),boatsDrawn:XL_BOAT_G.length,
 boatSpot:()=>XL_BOAT_G.map(E=>({id:E.G.name,key:(E.m||E.o).key,x:+E.G.position.x.toFixed(1),z:+E.G.position.z.toFixed(1),h:+terrainH(E.G.position.x,E.G.position.z).toFixed(2),beached:!!(E.m&&E.m.beached),moored:!!E.m}))});
