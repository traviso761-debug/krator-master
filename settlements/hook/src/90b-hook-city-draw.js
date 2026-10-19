/* ============================== HOOK: DRAWING THE SITE ([web]) ============================== */
/* The plan's streets through core/city's own drawing (50-city-host-streets.js HOST.buildStreets, inside the KCITY
   bundle), the quarters as outlines draped on the ground with a label each, the markers as small labels. `z` toggles
   the site overlay. window._city is what verify.py reads. */
(()=>{const C=HOOK_CITY,P=C.P,HOST=KCITY.lib.HOST;
 window._city={ready:!!P,log:C.log,ways:P?P.ways.length:0,districts:P?P.districts.length:0,landmarks:P?P.landmarks.length:0,
  hosts:P?P.landmarks.filter(L=>L.ancient).length:0,plan:P?C.K.export():null};
 if(!P)return;
 const site=new THREE.Group();site.name='hook-site';scene.add(site);
 try{HOST.buildStreets();for(const k in HOST.streets){const m=HOST.streets[k];scene.remove(m);site.add(m);}}catch(e){reportErr('streets '+e.stack);}
 const COL={hukoa:0x2b7a3b,tethys:0x2a6f9e,iziz:0xc8601a,voth:0x5a3d8c,salvage:0x6b6b6b,ancient:0x3a3a3a};
 const lift=1.4;
 for(const D of P.districts){const col=COL[D.layer]||0xffffff,pts=[];
  const poly=D.poly.concat([D.poly[0]]);
  for(let i=1;i<poly.length;i++){const a=poly[i-1],b=poly[i],n=Math.max(2,Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/6));
   for(let k=0;k<n;k++){const t=k/n,x=a[0]+(b[0]-a[0])*t,z=a[1]+(b[1]-a[1])*t;pts.push(new THREE.Vector3(x,terrainH(x,z)+lift,z));}}
  pts.push(pts[0].clone());
  const line=new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),new THREE.LineBasicMaterial({color:col,transparent:true,opacity:.85,depthTest:false}));
  line.renderOrder=19;line.userData={kind:'district',probeSkip:true};site.add(line);
  let cx=0,cz=0;for(const p of D.poly){cx+=p[0];cz+=p[1];}cx/=D.poly.length;cz/=D.poly.length;
  const s=HOST.label(D.name,cx,terrainH(cx,cz)+34,cz,120,2);scene.remove(s);site.add(s);}
 for(const m of (C.site.markers||[])){const s=HOST.label(m.id,m.x,terrainH(m.x,m.z)+14,m.z,30,1);scene.remove(s);site.add(s);}
 addEventListener('keydown',e=>{if(e.key==='z'&&!e.ctrlKey&&!e.metaKey)site.visible=!site.visible;});})();
