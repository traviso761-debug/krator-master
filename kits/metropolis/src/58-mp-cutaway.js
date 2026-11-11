// ================================================================= METROPOLIS — the cut-away  [web]
// The building in front of the eye (the one under the middle of the screen, else the nearest real one) cut at a storey's ceiling: everything of it above is clipped
// away (a plane on copies of its materials, drawn on both faces so the cut shows the walls' thickness), and the storey under the cut opens with its ceiling hidden,
// so you look down into the furnished floor. X (or the panel's button) toggles it, [ and ] move the cut a storey. A ruin is cut no higher than its standing skin. The
// fourteen without plans yet, and the Ancients kit's buildings, are cut at a storey's height and show their walls. (kits/interiors' IX.view.cutaway works on its own room shells; these towers are not
// built from them, so this is the same idea on a clipping plane.)
MP.cut={on:false,g:null,k:0,plane:new THREE.Plane(new THREE.Vector3(0,-1,0),0)};
renderer.localClippingEnabled=true;
// the levels of a placed hero: a planned family's own, else storeys of the record's height
MP.cutLevels=function(m){const p=m.key.split('.'),F=MP.FAMILY[p[0]];if(F){const sk=MP.ruin(F,p[1]).skin;return {F,plans:true,L:F.levels.filter(L=>L.y+L.h<=sk+.01)};}
 const D=MP.DESIGNS[p[0]]||MP.ANCIENTS[p[0]],n=Math.max(1,Math.floor(D.height.roof/D.sh)),L=[];for(let k=0;k<n;k++)L.push({k,y:k*D.sh,h:D.sh});return {F:D,plans:false,L};};
// the hero under the middle of the screen, else the nearest
MP.cutPick=function(){const rc=new THREE.Raycaster();rc.setFromCamera(new THREE.Vector2(0,0),camera);const live=MPS.live.filter(g=>g.userData.mp);let best=null,bd=1e9;
 live.forEach(g=>{const h=rc.intersectObjects(g.children,false)[0];if(h&&h.distance<bd){bd=h.distance;best=g;}});if(best)return best;
 const e=camera.position;live.forEach(g=>{const m=g.userData.mp,d=Math.hypot(e.x-m.x,e.z-m.z);if(d<bd){bd=d;best=g;}});return best;};
function mpCutMats(g,on){g.traverse(o=>{if(!o.isMesh)return;
 if(on){if(o.userData._cutMat)return;const m=o.material,c=m.clone();c.onBeforeCompile=m.onBeforeCompile;c.customProgramCacheKey=m.customProgramCacheKey;c.userData=Object.assign({},m.userData);c.clippingPlanes=[MP.cut.plane];c.clipShadows=true;c.side=THREE.DoubleSide;o.userData._cutMat=m;o.material=c;}
 else if(o.userData._cutMat){o.material.dispose();o.material=o.userData._cutMat;o.userData._cutMat=null;}});}
// cut the target at level k: the plane under the storey's ceiling, the storey open, its ceiling hidden
MP.cutSet=function(k){const C=MP.cut;if(!C.on||!C.g)return;const m=C.g.userData.mp,Lv=MP.cutLevels(m);if(!Lv.L.length)return;k=Math.max(0,Math.min(Lv.L.length-1,k));C.k=k;
 const L=Lv.L[k];C.plane.constant=L.y+L.h-.3;MP.closeStoreys();
 if(Lv.plans){MP.openStorey(Lv.F.id,L.k,m.x,m.z,m.yaw);const o=MP.open[MP.open.length-1];if(o)o.g.traverse(q=>{if(q.name==='ceiling')q.visible=false;});}
 C.label=Lv.F.name+', L'+L.k+(L.use?' '+L.use:'');};
MP.cutToggle=function(){const C=MP.cut;if(C.on){MP.cutOff();return false;}const g=MP.cutPick();if(!g)return false;C.on=true;C.g=g;mpCutMats(g,true);
 const m=g.userData.mp,Lv=MP.cutLevels(m),e=camera.position;let k=0;Lv.L.forEach((L,i)=>{if(L.y<=e.y-1.5)k=i;});if(k===0&&e.y>Lv.L[Lv.L.length-1].y)k=Lv.L.length-1;MP.cutSet(Math.min(k,Lv.L.length-1));
 /* look down into the cut from a little above and outside it */
 const L=Lv.L[C.k],R=Math.max(Lv.F.footprint.r||0,(Lv.F.footprint.w||0)/2,(Lv.F.footprint.d||0)/2,20),y=L.y+L.h;if(window._api&&window._api.setView)window._api.setView(m.x+R*.9,y+R*1.1,m.z+R*1.3,m.x,y-2,m.z);return true;};
MP.cutStep=function(d){if(MP.cut.on)MP.cutSet(MP.cut.k+d);};
MP.cutOff=function(){const C=MP.cut;if(C.g)mpCutMats(C.g,false);C.on=false;C.g=null;C.label='';MP.closeStoreys();};
// the cut ends when its building leaves (a view changes, the tiers drop the hero)
MP.cutTick=function(){const C=MP.cut;if(C.on&&(!C.g||MPS.live.indexOf(C.g)<0))MP.cutOff();};
