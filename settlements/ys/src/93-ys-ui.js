// ================================================================= YS CITY — dev tools: the hour of day and the city budgets
// (the inspector, polygon tool, walk mode, labels and compass are the standard pack in src/92-camera.js)
BUDGET.showcase={tris:12000000,calls:220};
{const wrap=document.createElement('span');wrap.style.cssText='display:inline-flex;align-items:center;gap:4px;margin-left:6px;font:12px system-ui;color:#d8f4f0';
 const lab=document.createElement('span');lab.textContent='hour '+YSCLOCK.hour.toFixed(1);const sl=document.createElement('input');sl.type='range';sl.min=0;sl.max=24;sl.step=.1;sl.value=YSCLOCK.hour;sl.style.width='120px';
 sl.oninput=()=>{setHour(parseFloat(sl.value));lab.textContent='hour '+YSCLOCK.hour.toFixed(1);};wrap.appendChild(lab);wrap.appendChild(sl);ui.appendChild(wrap);
 FRAME_HOOKS.push(()=>{if(Math.abs(parseFloat(sl.value)-YSCLOCK.hour)>.05){sl.value=YSCLOCK.hour;lab.textContent='hour '+YSCLOCK.hour.toFixed(1);}});}
// ---- Inside (the state and switch are in 92-camera.js, with the presets): the button
uiButton('Inside',false,()=>setInside(!INSIDE.on));
// ---- Rooms: every ROOM outline as a ribbon at its floor, every SPOT as a coloured disc (bed blue, food orange, store brown,
// hearth red, seat green, table yellow, work grey, shrine violet) - the interiors spec's room-outline debug view
const ROOMV={on:false,grp:null};const ROOM_COL={bed:0x4a8cff,food:0xff9a2a,store:0x8a5a2a,hearth:0xff3a2a,seat:0x4ad06a,table:0xffe04a,work:0x9a9a9a,shrine:0xb06aff};
function roomsBuild(){const G=new THREE.Group();G.userData.probeSkip=true;const ribbon=[],idx=[];
 for(const rm of ROOMS){const P=rm.poly,y=rm.y+.15;for(let i=0;i<P.length;i++){const a=P[i],b=P[(i+1)%P.length];const dx=b[0]-a[0],dz=b[1]-a[1],L=Math.hypot(dx,dz)||1;const nx=-dz/L*.12,nz=dx/L*.12;const k=ribbon.length/3;
  ribbon.push(a[0]-nx,y,a[1]-nz,b[0]-nx,y,b[1]-nz,b[0]+nx,y,b[1]+nz,a[0]+nx,y,a[1]+nz);idx.push(k,k+2,k+1,k,k+3,k+2);}}
 if(ribbon.length){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(ribbon,3));g.setIndex(idx);
  const m=new THREE.Mesh(g,new THREE.MeshBasicMaterial({color:0x5fc8c0,side:THREE.DoubleSide,depthTest:false,transparent:true,opacity:.9,fog:false}));m.renderOrder=1000;G.add(m);}
 for(const s of SPOTS){const rm=ROOMS[s.room];const y=(rm?rm.y:0)+.12;const g=new THREE.CircleGeometry(.5,18);g.rotateX(-Math.PI/2);
  const m=new THREE.Mesh(g,new THREE.MeshBasicMaterial({color:ROOM_COL[s.kind]||0xffffff,depthTest:false,transparent:true,opacity:.75,side:THREE.DoubleSide,fog:false}));
  m.position.set(s.x,y,s.z);m.rotation.y=s.ry;m.scale.set(s.w,1,s.d);m.renderOrder=1001;G.add(m);}
 G.traverse(o=>{o.userData.probeSkip=true;o.frustumCulled=false;});scene.add(G);return G;}
function setRooms(on){on=!!on;ROOMV.on=on;if(on&&!ROOMV.grp)ROOMV.grp=roomsBuild();if(ROOMV.grp)ROOMV.grp.visible=on;
 const bt=[...ui.querySelectorAll('button')].find(b=>b.textContent==='Rooms');if(bt)bt.classList.toggle('on',on);return on;}
uiButton('Rooms',false,()=>setRooms(!ROOMV.on));
window._api.setRooms=on=>setRooms(on);
window._api.city={CITY:typeof CITY!=='undefined'?CITY:null,layout:()=>PORT_LAYOUT.items.length,hour:()=>YSCLOCK.hour,placed:()=>HYK_PLACED.map(p=>({key:p.key,x:p.x,z:p.z})),layoutCensus:()=>typeof ysLayoutCensus==='function'?ysLayoutCensus():null};
