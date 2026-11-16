// ================================================================= PHĒR — the boats (PLAN.md step P4): drawn from the plan's records
// PH_BOATS (89zp): the moored launches and cargo barges, the dugouts drawn up on the beach, the dugouts out fishing, and the
// runs (the cross-lake run's six carriers, the two market rounds, the pilgrims' launch). Each boat is the kit's piece
// (kits/xanadu/extra/88d-xa-lakecraft.js) built once into a group of its own at the origin and baked, then set where its
// record puts it: the moored and beached stay; the fishing dugouts drift on their small circles; the runs' boats go round
// their loops with the page's clock (the motion control: FRAME_HOOKS' dt). Drawn within PH_BOAT_RANGE of the camera.
// [web]: three.js.
reseed(PH.SEED+3);
const PH_BOAT_RANGE=4500,PH_BOAT_G=[];let PH_BOAT_T=0;
const phBoatGroup=(key,v,name)=>{const G=new THREE.Group();G.name=name;scene.add(G);TSTAT.cur=key+'/'+v;const r0=REG.length;
 try{VERN.place(G,key,0,0,0,{v,y:0});}catch(e){PH_FAILS.push(key+': '+(e&&e.message||e));}
 for(let i=r0;i<REG.length;i++)REG[i].type=key;TSTAT.cur=null;kbake(G);for(const n in KIT.items)KIT.items[n].length=0;return G;};
if(PH_BOATS){
 for(const m of PH_BOATS.moored){const G=phBoatGroup(m.key,m.v,'boat:'+m.id);G.position.set(m.x,m.v===2?phH(m.x,m.z)-.25:0,m.z);G.rotation.y=m.ry;PH_BOAT_G.push({G,m});}
 for(const o of PH_BOATS.out){const G=phBoatGroup(o.key,o.v,'boat:'+o.id);PH_BOAT_G.push({G,o});}
 for(const R of PH_BOATS.runs){const loop=phRunLoop(R);R.boats.forEach((b,i)=>{const G=phBoatGroup(b.key,b.v,'boat:'+R.id+':'+i);PH_BOAT_G.push({G,R,loop,b});});}}
function phBoatsTick(t){const P=camera.position;let shown=0;
 for(const E of PH_BOAT_G){let x,z,ry;
  if(E.m){x=E.m.x;z=E.m.z;}
  else if(E.o){const a=E.o.ry+t*E.o.w;x=E.o.x+Math.cos(a)*E.o.r;z=E.o.z+Math.sin(a)*E.o.r;ry=a+(E.o.w>0?0:Math.PI);E.G.position.set(x,Math.sin(t*.9+E.o.x)*.06,z);E.G.rotation.y=ry;}
  else{const q=phRunAt(E.R,E.loop,E.b,t);x=q.x;z=q.z;E.G.position.set(x,Math.sin(t*.7+E.b.phase*9)*.08,z);E.G.rotation.y=q.ry;}
  const v=Math.hypot(P.x-x,P.z-z)<PH_BOAT_RANGE;E.G.visible=v;if(v)shown++;}
 window._boatsShown=shown;}
FRAME_HOOKS.push((dt)=>{PH_BOAT_T+=Math.min(.25,dt||0);phBoatsTick(PH_BOAT_T);});phBoatsTick(0);
Object.assign(window._pher,{failed:PH_FAILS.length,fails:PH_FAILS.slice(0,20),boats:PH_BOAT_G.length,runs:PH_BOATS?PH_BOATS.runs.length:0,
 boatSpot:()=>PH_BOAT_G.map(E=>({id:E.G.name,x:+E.G.position.x.toFixed(1),z:+E.G.position.z.toFixed(1),h:+phH(E.G.position.x,E.G.position.z).toFixed(1),moored:!!E.m}))});
