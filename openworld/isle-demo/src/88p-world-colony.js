// ================================================================= ISLE DEMO — Nephtos drawn: the colony's placeholder plan
// [web] settlements/isle-demo PLAN.md section 15. Draws what 48p laid out (ISLE_COLONY.made: settlements/isle-demo 47k's
// radial plan); it decides nothing. Every lot is registered in core/tags first (build 'isle-demo:Nephtos', culture
// hykkousoi), then drawn as a STAND-IN: the Ys kit's Hykkousoi buildings are not on this page (settlements/ys, a 2 MB
// engine of its own), so a lot is white-limed walls under a sea-green roof, the civic four (the palazzo, the council hall,
// the temple, the customs house) under a dome; the streets are ribbons of pale stone on the ground, the agora a paved
// disc, the quay a stone pier out from the beach with the Ring Sea kit's Hykkousoi vessels at its berths (a Tethyan
// corbita and a pearl ship). The flora and floor keep off the colony's ground (WORLD.clearHook, chained).
//   window._colony   {made, lots, drawn, tags(), ships, error}: the verify's view
var COLONY_DRAW;LATE.push(()=>{COLONY_DRAW=(function(){   /* after the world is loaded and 48t has laid the towns and the colony */
const scene=HOST.scene;
const C=typeof ISLE_COLONY!=='undefined'?ISLE_COLONY.make():null;
if(!C||C.error){window._colony={error:C?C.error:'no colony (48p)'};return;}
const F=C.frame,H=(x,z)=>WORLD.H(x,z),TAGS=KTAGS.create({build:'isle-demo:'+C.town}),D=ISLE.COLONY_DIMS;
const W2=l=>({x:F.x+l.x,z:F.z+l.z});
/* the records */
const town=TAGS.add({class:'landmark',kind:'settlement',key:'colony:'+C.town,name:C.town,at:[C.centre[0],H(C.centre[0],C.centre[1]),C.centre[1]],r:C.reach,h:20,
 tags:{culture:'hykkousoi',types:['civic'],role:'colony'},note:C.town+', the Hykkousoi port colony of Tethys (a placeholder radial plan): '+C.census.citizens+' people in '+C.census.households+' households'});
const recs=C.R.lots.map(l=>{const p=W2(l),d=D[l.key]||{w:l.w,d:l.d,h:6},y=H(p.x,p.z)-.15;
 TAGS.child(town.id,{class:'building',key:l.key,at:[p.x,y,p.z],ry:l.ry,size:[l.w,l.d,d.h],tags:{culture:'hykkousoi',types:d.types||['industry'],wealth:d.wealth||'common',role:l.role},note:l.name+' (a stand-in)'});
 return{x:p.x,y,z:p.z,ry:l.ry,w:l.w,d:l.d,h:d.h,key:l.key};});
for(const w of C.R.plan.ways)TAGS.child(town.id,{class:'infrastructure',kind:'street',key:w.cls,at:[F.x+w.pts[0][0],H(F.x+w.pts[0][0],F.z+w.pts[0][1]),F.z+w.pts[0][1]],ry:0,size:[w.w,1,.1],tags:{types:['infrastructure']}});
/* the flora and floor off its ground */
{const prev=WORLD.clearHook;WORLD.clearHook=(x,z)=>(prev&&prev(x,z))||ISLE_COLONY.inside(x,z);}
/* the pieces */
const DOMED={'hyk-palazzo':1,'hyk-agora-hall':1,'hyk-temple':1,'hyk-customs':1};
const wallM=new THREE.MeshLambertMaterial({color:new THREE.Color(0xe9e3d3).convertSRGBToLinear()}),roofM=new THREE.MeshLambertMaterial({color:new THREE.Color(0x3f8c84).convertSRGBToLinear()}),
 domeM=new THREE.MeshLambertMaterial({color:new THREE.Color(0x5aa6a0).convertSRGBToLinear()}),stoneM=new THREE.MeshLambertMaterial({color:new THREE.Color(0xc9c0aa).convertSRGBToLinear(),side:THREE.DoubleSide,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-4});
const boxG=new THREE.BoxGeometry(1,1,1).translate(0,.5,0),domeG=new THREE.SphereGeometry(.5,16,8,0,Math.PI*2,0,Math.PI/2);
const m4=new THREE.Matrix4(),q=new THREE.Quaternion(),e=new THREE.Euler(),v3=new THREE.Vector3(),G=new THREE.Group();G.name='colony '+C.town;
const walls=new THREE.InstancedMesh(boxG,wallM,recs.length),roofs=new THREE.InstancedMesh(boxG,roofM,recs.length),dk=recs.filter(r=>DOMED[r.key]),domes=new THREE.InstancedMesh(domeG,domeM,Math.max(1,dk.length));
recs.forEach((r,i)=>{q.setFromEuler(e.set(0,r.ry,0));const wh=r.h*.72;
 walls.setMatrixAt(i,m4.compose(v3.set(r.x,r.y,r.z),q,new THREE.Vector3(r.w*.94,wh,r.d*.94)));
 roofs.setMatrixAt(i,m4.compose(v3.set(r.x,r.y+wh,r.z),q,new THREE.Vector3(r.w,.6,r.d)));});
dk.forEach((r,i)=>{q.setFromEuler(e.set(0,r.ry,0));const s=Math.min(r.w,r.d)*.7;domes.setMatrixAt(i,m4.compose(v3.set(r.x,r.y+r.h*.72+.6,r.z),q,new THREE.Vector3(s,s*.8,s)));});
if(!dk.length)domes.count=0;
walls.name=roofs.name='colony stand-ins';domes.name='colony domes';G.add(walls,roofs,domes);
/* the streets, the agora and the quay on the ground */
function ribbon(pts,w,lift){const pos=[],idx=[];let k=0;
 for(let i=0;i<pts.length-1;i++){const a=pts[i],b=pts[i+1],L=Math.hypot(b[0]-a[0],b[1]-a[1])||1,px=-(b[1]-a[1])/L*w/2,pz=(b[0]-a[0])/L*w/2;
  for(const p of [[a[0]-px,a[1]-pz],[a[0]+px,a[1]+pz],[b[0]-px,b[1]-pz],[b[0]+px,b[1]+pz]]){const x=F.x+p[0],z=F.z+p[1];pos.push(x,H(x,z)+lift,z);}
  idx.push(k,k+1,k+2,k+1,k+3,k+2);k+=4;}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setIndex(idx);g.computeVertexNormals();return new THREE.Mesh(g,stoneM);}
for(const w of C.R.plan.ways){const m=ribbon(w.pts,w.w,.3);m.name='colony street';G.add(m);}
for(const g of C.R.plan.greens){const c=C.R.centre,pos=[],idx=[],n=g.poly.length,cx=F.x+c[0],cz=F.z+c[1];pos.push(cx,H(cx,cz)+.32,cz);
 g.poly.forEach(p=>{const x=F.x+p[0],z=F.z+p[1];pos.push(x,H(x,z)+.32,z);});for(let i=0;i<n;i++)idx.push(0,1+(i+1)%n,1+i);
 const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geo.setIndex(idx);geo.computeVertexNormals();const m=new THREE.Mesh(geo,stoneM);m.name='the agora';G.add(m);}
const L=C.R.landings[0],sx=C.site.sea[0],sz=C.site.sea[1];
if(L){const len=ISLE.COLONY.berthOut,pier=new THREE.Mesh(boxG,stoneM),y0=F.sea-1.5;q.setFromEuler(e.set(0,Math.atan2(sx,sz),0));
 pier.matrixAutoUpdate=false;pier.matrix.compose(v3.set(F.x+L.x+sx*len/2,y0,F.z+L.z+sz*len/2),q,new THREE.Vector3(9,2.6,len));pier.name='the quay of '+C.town;G.add(pier);}
scene.add(G);
/* the Hykkousoi vessels at the berths */
const ships=[];
if(L&&typeof RINGSEA!=='undefined')for(const B of L.berths){let r=null;try{r=RINGSEA.make(B.key);}catch(err){r=null;}if(!r)continue;
 r.group.position.set(F.x+B.x,F.sea,F.z+B.z);r.group.rotation.y=B.heading;r.group.name=C.town+' berth '+B.key;scene.add(r.group);ships.push(B.key);}
window._colony={made:{town:C.town,centre:C.centre,reach:C.reach,frame:F,site:{beach:C.site.beach,sea:C.site.sea,share:C.site.share,tried:C.site.tried},census:C.census},
 lots:recs.length,domes:dk.length,streets:C.R.plan.ways.length,ships,tags:()=>TAGS.audit(),recs:()=>recs};
return window._colony;})();});
