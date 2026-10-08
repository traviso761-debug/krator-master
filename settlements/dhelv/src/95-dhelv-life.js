// ================================================================= DHELV: THE RAMBLERS, DRAWN (kits/zeijani/PLAN.md 8.2; P6). Reads SIM, decides nothing.
// The life layer's clock (core/clock) steps with the frame; SIM.step() runs once a world minute; each walker is drawn at
// SIM.pose(actor, t), a pure function of motion time, as a body from an instanced pool (the nearest DHL.MAX within DHL.R of
// the camera; indoors they are hidden). The minimap shows them as dots. A click on a walker follows it and draws its way;
// Esc lets go. V shows the nav graph (its edges by kind; the ones the edge check refused, red).
// URL: ?hour=8 starts at 8:00 (else the sky's hour), ?time=run runs the day (?scale=10 ten times fast), ?walkers=N draws at
// most N, ?pop=2 doubles the homes' people, ?nolife leaves the layer out, ?nav shows the nav graph.
const DHL={clock:null,on:false,MAX:700,R:170,LAST:0,shown:0,moving:0,follow:null,pathLine:null,navLine:null,hud:null,t:0};
(function(){const Q=new URLSearchParams(location.search);if(Q.has('nolife'))return;
 DHL.MAX=Q.has('walkers')?Math.max(0,+Q.get('walkers')):DHL.MAX;
 DHL.clock=KCLOCK.make({hour:Q.has('hour')?+Q.get('hour'):SKY.hour,running:Q.get('time')==='run',scale:Q.has('scale')?+Q.get('scale'):1});
 if(Q.has('hour')){SKY.hour=DHL.clock.hour;skyApply();}
 try{DHS.init(DHL.clock,{pop:Q.has('pop')?+Q.get('pop'):1});DHS.doors(DHL.clock.hour);SIM.jump();}catch(e){reportErr('life: '+(e.stack||e));return;}
 DHL.LAST=SIM.minute();DHL.on=true;
 /* the bodies: a robe (coloured by role) and a head (the skin), one instanced mesh each, the same matrices */
 const body=new THREE.CylinderGeometry(.17,.25,1.25,8,1);body.translate(0,.63,0);const head=new THREE.SphereGeometry(.13,8,6);head.translate(0,1.42,0);
 const mb=new THREE.MeshStandardMaterial({color:0xffffff,roughness:.85}),mh=new THREE.MeshStandardMaterial({color:0xffffff,roughness:.7});
 DHL.bodies=new THREE.InstancedMesh(body,mb,Math.max(1,DHL.MAX));DHL.heads=new THREE.InstancedMesh(head,mh,Math.max(1,DHL.MAX));
 for(const m of [DHL.bodies,DHL.heads]){m.count=0;m.frustumCulled=false;m.castShadow=true;m.userData.probeSkip=true;m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);scene.add(m);}
 DHL.bodies.raycast=THREE.InstancedMesh.prototype.raycast.bind(DHL.bodies);DHL.heads.raycast=()=>{};
 const c=new THREE.Color();for(let i=0;i<Math.max(1,DHL.MAX);i++){DHL.bodies.setColorAt(i,c.set(0xffffff));DHL.heads.setColorAt(i,c.set(0xb07a58));}
 DHL.hud=document.createElement('div');DHL.hud.style.cssText='position:fixed;left:10px;top:84px;padding:6px 9px;font:11px ui-monospace,monospace;color:#e8dcc8;background:rgba(20,16,12,.72);border-radius:6px;pointer-events:none;white-space:pre;z-index:5';
 document.body.appendChild(DHL.hud);})();
/* a role's robe (the guilds' colours; the guard in dark red, the scouts in teal, foreigners in ash grey) */
DHL.COL={brewer:0xc8902a,alecap_farmer:0x8a6aa8,yam_farmer:0x9a8a40,forager:0x5a8a4a,herder:0x7a6a3a,stonecutter:0xb8b0a0,smith:0x5a4a40,alchemist:0x3a6a8a,shopkeeper:0xd8b878,
 innkeeper:0xb86a3a,guard:0x8a2a2a,scout:0x2a8a80,keeper:0x2a2a30,priest:0xe8e0d0,child:0xe0a0b0,elder:0x8a8078,mourner:0x404048,labourer:0xa08060,trader:0x9a9a92};
DHL.SKIN=[0x8a5a3a,0xa06a48,0x6a4a30,0xb07a58,0x7a5238];
FRAME_HOOKS.push(dt=>{if(!DHL.on)return;const C=DHL.clock,now=performance.now();C.step(Math.min(.1,(now-(DHL.t||now))/1000));DHL.t=now;
 /* once a world minute, never twice (a jump of the hour re-places everyone) */
 let n=0;while(DHL.LAST<SIM.minute()&&n++<30){DHL.LAST++;if(DHS.doors(C.hour)){}SIM.step();}if(DHL.LAST<SIM.minute())DHL.LAST=SIM.minute();
 if(C.running&&Math.abs(SKY.hour-C.hour)>.02){SKY.hour=C.hour;skyApply();}   /* the sky follows a running day (a world minute or so at a time) */
 /* the poses near the camera */
 const p=camera.position,t=SIM.time(),R2=DHL.R*DHL.R,near=[],M=new THREE.Matrix4(),q=new THREE.Quaternion(),Y=new THREE.Vector3(0,1,0),c=new THREE.Color();let mv=0;
 for(const a of SIM.all('actor')){if(!a.present)continue;const s=SIM.pose(a,t);if(s.hidden)continue;if(s.moving)mv++;const d=(s.x-p.x)**2+(s.y-p.y)**2+(s.z-p.z)**2;if(d<R2)near.push([d,a,s]);}
 near.sort((u,v)=>u[0]-v[0]);const N=Math.min(near.length,DHL.MAX);
 for(let i=0;i<N;i++){const [,a,s]=near[i],k=a.role==='child'?.72:a.role==='elder'?.95:1,bob=s.moving?Math.abs(Math.sin(t*7+a.k))*.05:0;
  M.compose(new THREE.Vector3(s.x,s.y+bob,s.z),q.setFromAxisAngle(Y,s.h||0),new THREE.Vector3(k,k,k));DHL.bodies.setMatrixAt(i,M);DHL.heads.setMatrixAt(i,M);
  DHL.bodies.setColorAt(i,c.set(DHL.COL[a.role]||0xcccccc));DHL.heads.setColorAt(i,c.set(DHL.SKIN[(a.k||0)%DHL.SKIN.length]));DHL.shownIds[i]=a.id;}
 DHL.bodies.count=DHL.heads.count=N;for(const m of [DHL.bodies,DHL.heads]){m.instanceMatrix.needsUpdate=true;if(m.instanceColor)m.instanceColor.needsUpdate=true;}
 DHL.shown=N;DHL.moving=mv;
 /* following a walker: the orbit's target on it, its way drawn */
 if(DHL.follow){const a=SIM.get('actor',DHL.follow);if(a){const s=SIM.pose(a,t);ctl.target.set(s.x,s.y+1.2,s.z);}}
 if(now-(DHL.hudT||0)>400){DHL.hudT=now;const h=C.hour,hm=Math.floor(h)+':'+String(Math.floor(h%1*60)).padStart(2,'0');let out=0;for(const a of SIM.all('actor'))if(a.present&&!SIM.pose(a,t).hidden)out++;
  let f='';if(DHL.follow){const a=SIM.get('actor',DHL.follow);if(a){const P=a.place&&SIM.get('place',a.place);f='\nfollowing '+a.id+', '+a.role.replace('_',' ')+': '+(a.activity||'').toLowerCase().replace('_',' ')+(P?' at '+P.name:'')+'  (Esc lets go)';}}
  DHL.hud.textContent='Dhelv '+hm+(C.running?' (running x'+C.scale+')':' (held: ?time=run)')+'  '+out+' out, '+mv+' walking, '+DHL.shown+' drawn  stone door '+(DHS.doorShut?'shut':'open')+f;}});
DHL.shownIds=[];
/* the minimap's dots: everyone out on the map's half of the world, those near the camera's height bright */
DHMAP.extra.push((g,F,p,mode)=>{if(!DHL.on)return;const t=SIM.time();for(const a of SIM.all('actor')){if(!a.present)continue;const s=SIM.pose(a,t);if(s.hidden||(mode==='outpost')!==(s.x<DH.PLAT.cliffX+30))continue;
  g.fillStyle=Math.abs(s.y-p.y)<6?'#'+(DHL.COL[a.role]||0xcccccc).toString(16).padStart(6,'0'):'rgba(200,190,170,.35)';g.fillRect(F.X(s.x)-1,F.Z(s.z)-1,2,2);}});
/* a click on a walker follows it; its way (the current task's legs) drawn as a line; Esc lets go */
renderer.domElement.addEventListener('pointerup',e=>{if(!DHL.on||e.button!==0||DHL.bodies.count===0)return;const r=renderer.domElement.getBoundingClientRect(),m=new THREE.Vector2((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1),ray=new THREE.Raycaster();
 ray.setFromCamera(m,camera);const h=ray.intersectObject(DHL.bodies,false)[0];if(!h||h.instanceId==null)return;DHL.follow=DHL.shownIds[h.instanceId];dhlPath();});
addEventListener('keydown',e=>{if(e.key==='Escape'&&DHL.follow){DHL.follow=null;dhlPath();}
  if((e.key==='['||e.key===']')&&DHL.on&&e.target.tagName!=='TEXTAREA'&&e.target.tagName!=='SELECT'){DHL.clock.hour=SKY.hour;DHS.doors(SKY.hour);SIM.jump();DHL.LAST=SIM.minute();}   /* 94 moved the sky's hour: the day jumps with it */
 if((e.key==='v'||e.key==='V')&&e.target.tagName!=='TEXTAREA'&&e.target.tagName!=='INPUT')dhlNav(!DHL.navLine);});
function dhlPath(){if(DHL.pathLine){scene.remove(DHL.pathLine);DHL.pathLine.geometry.dispose();DHL.pathLine=null;}const a=DHL.follow&&SIM.get('actor',DHL.follow);if(!a||!a.task)return;
 const v=[];for(const L of a.task.legs||[]){const P=L.route.pts;for(let i=1;i<P.length;i++)v.push(P[i-1][0],P[i-1][1]+.3,P[i-1][2],P[i][0],P[i][1]+.3,P[i][2]);}if(!v.length)return;
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(v,3));const l=new THREE.LineSegments(g,new THREE.LineBasicMaterial({color:0xffe060,depthTest:false,transparent:true}));
 l.renderOrder=9;l.userData.probeSkip=true;l.raycast=()=>{};scene.add(l);DHL.pathLine=l;}
/* the nav graph drawn: the grids' edges dim, the ways blue, the doors yellow, the ones the edge check refused red */
function dhlNav(on){if(DHL.navLine){scene.remove(DHL.navLine);DHL.navLine.geometry.dispose();DHL.navLine=null;}if(!on)return;const B=DHN.get();
 if(!DHN.lastBad)DHN.lastBad=new Set(DHN.chkEdges(B).map(b=>b.e));const v=[],c=[],K={floor:[.16,.2,.14],door:[.8,.65,.2],way:[.25,.45,.85],bad:[1,.1,.05]};
 for(const e of B.edges){const a=B.byId[e.a],b=B.byId[e.b],k=DHN.lastBad.has(e)?K.bad:e.kind==='floor'?K.floor:e.kind==='door'?K.door:K.way;v.push(a.x,a.y+.15,a.z,b.x,b.y+.15,b.z);c.push(...k,...k);}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(v,3));g.setAttribute('color',new THREE.Float32BufferAttribute(c,3));
 const l=new THREE.LineSegments(g,new THREE.LineBasicMaterial({vertexColors:true,toneMapped:false}));l.userData.probeSkip=true;l.raycast=()=>{};scene.add(l);DHL.navLine=l;}
if(new URLSearchParams(location.search).has('nav'))setTimeout(()=>dhlNav(true),0);
