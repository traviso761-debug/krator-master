// ================================================================= HOST — the Fowlers' village, ropes and nest ledges (station 8), after the atmosphere (89a) and before the build (89z)
// THE VILLAGE: core/hamlet's KHAMLET.village on the Fellgang row (84f), focus `ranch` (the rope house, the egg store, the pens: the fowling works), ~140 people;
// placed here, before the flora, so the glass forest keeps off it (LAND.keep) and so its records are core/tags volumes before anything is drawn. Drawn in
// LAND.build (89z runs it before the bake) as FELLGANG's stand-ins. THE ROPES: one per household, up the lower face from the wall's foot along its fall line
// (a ribbon 5 cm wide, pegged every 25 m, a ladder up its first 18 m), each its family's stretch: the rope is the family's vote (PLAN.md section 6).
// THE NEST LEDGES: the face's ledges near the ropes (slope under .6, 60-700 m up), each a cluster of nests with eggs; the flyers are kits/fauna's, owed.
const FOWL=(function(){const S=STATION,V0=S.VIL,G=terrainH,slope=(x,z)=>{const e=3;return Math.hypot(G(x+e,z)-G(x-e,z),G(x,z+e)-G(x,z-e))/(2*e);};
 const ok=(x,z)=>{if(waterH(x,z)>G(x,z)-.5)return false;if(z<S.footZ(x)+45||z>S.shoreZ(x)-25)return false;return slope(x,z)<.22;};
 const V=KHAMLET.village({id:'fowlers',world:8310,culture:FELLGANG.ROW,focus:'ranch',site:{x:V0.x,z:V0.z},link:{x:V0.x+30,z:S.shoreZ(V0.x+30)-6},
  resource:{x:V0.x,z:S.footZ(V0.x),workers:44},popMax:150,dims:FELLGANG.dims,ground:{ok},siteReach:500});
 const out={village:V,site:V.site,ropes:[],nests:[],error:V.error||null};
 if(V.error)reportErr('the Fowlers: '+V.error);
 /* the ropes: one per household, spread along the foot within 700 m of the village, each up its fall line */
 const hh=Math.max(6,Math.round(((V.census&&V.census.pop)||140)/5)),U=(i,s)=>KRAND.unit(KRAND.hash(8311,i,s));
 for(let i=0;i<hh;i++){const x=(V.site?V.site.x:V0.x)+(i/(hh-1)-.5)*1300+(U(i,1)-.5)*40,z0=S.footZ(x)+4,y0=G(x,z0),top=180+260*U(i,2);
  const pts=[[x,y0+.3,z0]];let z=z0,px=x;for(let k=0;k<400;k++){z-=3;px+=(U(i,10+k)-.5)*.8;const y=G(px,z);pts.push([px,y+.35,z]);if(y-y0>top)break;}
  out.ropes.push({id:'fowlers:rope:'+i,x,z:z0,y0,top:pts[pts.length-1][1],pts,family:i});}
 /* the nest ledges: along each rope's column, where the face flattens */
 out.ropes.forEach((r,i)=>{let last=-1e9;r.pts.forEach((p,k)=>{const h=p[1]-r.y0;if(h<60||h-last<45)return;const s=slope(p[0],p[2]);if(s<.6){
  for(let j=-1;j<=1;j++){const x=p[0]+j*7+(U(i*31+k,3)-.5)*3,z=p[2]+(U(i*31+k,4)-.5)*3;out.nests.push({id:'fowlers:nest:'+i+':'+k+':'+j,x,z,y:G(x,z),eggs:1+Math.floor(U(i*31+k+j,5)*3)});}last=h;}});});
 return out;})();
window._fowl=FOWL;
/* the records in core/tags before anything is drawn; the forest keeps off the village and the rope feet */
(function(){const V=FOWL.village;if(!V.records)return;
 V.records.forEach(r=>REGISTER({name:'The Fowlers: '+r.key,x:r.x,z:r.z,y:terrainH(r.x,r.z)-1,r:Math.max(r.w,r.d)*.6,h:r.h+1.5,key:r.key,village:'fowlers'}));
 FOWL.ropes.forEach(r=>REGISTER({name:'A family\'s rope (the Fowlers): its stretch of the face',x:r.x,z:r.z-40,y:r.y0,r:45,h:r.top-r.y0+2,rope:r.id}));
 FOWL.nests.forEach(n=>REGISTER({name:'A nest ledge on the wall (the cliff-nesting flyers\': kits/fauna, owed)',x:n.x,z:n.z,y:n.y-.3,r:1.5,h:1.5,nest:n.id}));
 const pts=V.records.map(r=>[r.x,r.z]),cx=V.site.x,cz=V.site.z;let rad=0;pts.forEach(p=>rad=Math.max(rad,Math.hypot(p[0]-cx,p[1]-cz)));FOWL.radius=rad+30;
 LAND.keep=(x,z)=>{if(Math.hypot(x-cx,z-cz)<FOWL.radius)return 0;for(const r of V.records)if(Math.abs(x-r.x)<r.w&&Math.abs(z-r.z)<r.w)return 0;return 1;};})();
// THE DRAWING (LAND.build: 89z, before the bake): the village's stand-ins and lanes (84f), the ropes, pegs and ladders, the nests and eggs
LAND.build=function(){const T=THREE,V=FOWL.village;if(!V.records)return{village:0};
 FELLGANG.draw(V,{scene,ground:terrainH,seed:8312,label:'The Fowlers (a Fellgang village)'});FELLGANG.lanes(V,{scene,ground:terrainH});
 const rp=[],rc=[],col=new T.Color(0x5a4630),push=(a,b,w)=>{const dx=b[0]-a[0],dz=b[2]-a[2],l=Math.hypot(dx,dz)||1,nx=-dz/l*w,nz=dx/l*w;
  rp.push(a[0]-nx,a[1],a[2]-nz,a[0]+nx,a[1],a[2]+nz,b[0]+nx,b[1],b[2]+nz,a[0]-nx,a[1],a[2]-nz,b[0]+nx,b[1],b[2]+nz,b[0]-nx,b[1],b[2]-nz);
  rp.push(a[0],a[1]-w,a[2],a[0],a[1]+w,a[2],b[0],b[1]+w,b[2],a[0],a[1]-w,a[2],b[0],b[1]+w,b[2],b[0],b[1]-w,b[2]);for(let k=0;k<12;k++)rc.push(col.r,col.g,col.b);};
 FOWL.ropes.forEach(r=>{for(let k=1;k<r.pts.length;k++)push(r.pts[k-1],r.pts[k],.03);
  /* the ladder up the first 18 m: two rails a little out from the rope, rungs every 40 cm */
  const L=r.pts.filter(p=>p[1]-r.y0<18);for(let k=1;k<L.length;k++){const a=L[k-1],b=L[k];push([a[0]-.25,a[1],a[2]],[b[0]-.25,b[1],b[2]],.035);push([a[0]+.25,a[1],a[2]],[b[0]+.25,b[1],b[2]],.035);}
  for(let y=r.y0+.4;y<r.y0+18;y+=.4){const p=L.find(q=>q[1]>=y)||L[L.length-1];push([p[0]-.25,y,p[2]],[p[0]+.25,y,p[2]+.001],.025);}});
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(rp,3));g.setAttribute('color',new T.Float32BufferAttribute(rc,3));g.computeVertexNormals();
 const rm=new T.Mesh(g,new T.MeshStandardMaterial({vertexColors:true,roughness:1,side:T.DoubleSide}));rm.name='fowlers:ropes';rm.userData.host=true;rm.userData.probePoints=[].concat(...FOWL.ropes.map(r=>{const p=r.pts[Math.floor(r.pts.length/2)];return[p[0],p[1],p[2]];}));rm.userData.inspectLabel='The families\' ropes and ladders';scene.add(rm);
 /* the nests (a shallow cup of sticks) and their eggs, instanced */
 const N=FOWL.nests,ne=N.reduce((a,n)=>a+n.eggs,0),cup=new T.Mesh(new T.CylinderGeometry(.42,.28,.18,10),new T.MeshStandardMaterial({color:0x4a3a28,roughness:1})),egg=new T.Mesh(new T.SphereGeometry(.07,8,6),new T.MeshStandardMaterial({color:0xd8d0bc,roughness:.6}));
 const IC=new T.InstancedMesh(cup.geometry,cup.material,Math.max(1,N.length)),IE=new T.InstancedMesh(egg.geometry,egg.material,Math.max(1,ne)),m=new T.Matrix4(),q=new T.Quaternion(),s=new T.Vector3(1,1,1),sE=new T.Vector3(1,1.3,1);let e=0;
 N.forEach((n,i)=>{IC.setMatrixAt(i,m.compose(new T.Vector3(n.x,n.y+.06,n.z),q,s));for(let k=0;k<n.eggs;k++){const a=k*2.2;IE.setMatrixAt(e++,m.compose(new T.Vector3(n.x+Math.cos(a)*.12,n.y+.2,n.z+Math.sin(a)*.12),q,sE));}});
 IC.count=N.length;IE.count=e;[IC,IE].forEach(o=>{o.userData.host=true;o.userData.inspectLabel='A nest on a ledge of the wall';scene.add(o);});
 return{village:V.records.length,pop:V.census&&V.census.pop,ropes:FOWL.ropes.length,nests:N.length};};
// THE STATION'S CHECKS (99: LAND.checks / LAND.negatives), each with a broken input that must fail
const FC8={village:V=>{const n=V&&V.records?V.records.length:0,keys=n?new Set(V.records.map(r=>r.key)):new Set(),need=['fg-meethall','fg-ropehouse','fg-eggstore'],miss=need.filter(k=>!keys.has(k));
  return{ok:!!V&&!V.error&&n>=8&&!miss.length,detail:V&&V.error?V.error:n+' buildings, '+((V&&V.census&&V.census.pop)||0)+' people'+(miss.length?'; missing '+miss.join(', '):'')};},
 dry:V=>{const bad=(V.records||[]).filter(r=>waterH(r.x,r.z)>terrainH(r.x,r.z)-.3||r.z<STATION.footZ(r.x)+30);return{ok:(V.records||[]).length>0&&!bad.length,detail:bad.length?bad.length+' buildings in the water or on the wall':'every building on the bench, dry'};},
 ropes:R=>{const bad=R.filter(r=>r.top-r.y0<120||Math.abs(r.pts[0][2]-STATION.footZ(r.x))>12);return{ok:R.length>=6&&!bad.length,detail:R.length+' ropes'+(bad.length?', '+bad.length+' short or off the foot':', each from the foot 120 m and more up the face')};},
 forest:T=>{const V=FOWL.village,bad=T.filter(t=>(V.records||[]).some(r=>Math.abs(t.x-r.x)<r.w*.6&&Math.abs(t.z-r.z)<r.w*.6));return{ok:!bad.length,detail:bad.length?bad.length+' trees in the village\'s buildings':'no tree stands in a building'};}};
LAND.checks=(add,P)=>{add('the Fowlers\' village placed on its bench (core/hamlet, the Fellgang row)',FC8.village(FOWL.village));add('the village dry and off the wall',FC8.dry(FOWL.village));
 add('the families\' ropes up the face',FC8.ropes(FOWL.ropes));add('the glass forest keeps out of the village',FC8.forest(RRIM.TREES||[]));};
LAND.negatives=(add,P)=>{add('a village with no meeting hall',FC8.village({records:(FOWL.village.records||[]).filter(r=>r.key!=='fg-meethall'),census:FOWL.village.census}));
 add('a building on the wall',FC8.dry({records:[{x:STATION.VIL.x,z:STATION.footZ(STATION.VIL.x)-200}]}));
 add('a rope that stops at the foot',FC8.ropes([{x:0,z:STATION.footZ(0),y0:2400,top:2410,pts:[[0,2400,STATION.footZ(0)]]}]));
 add('a tree in the meeting hall',(function(){const r=(FOWL.village.records||[])[0]||{x:0,z:0,w:10};return FC8.forest([{x:r.x,z:r.z}]);})());};
