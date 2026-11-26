// ================================================================= HOST — the Ice-cutters' village, cut lanes, block stacks and ice road (station 9), after the atmosphere (89a), before the build (89z)
// THE VILLAGE: core/hamlet's KHAMLET.village on the Fellgang row (84f, read from stations/fowlers by station.json "core"), focus `quarry` (the ice houses and the
// sledge shed: the ice-cutting works), ~120 people; placed here so the flora keeps off it (LAND.keep) and its records are core/tags volumes before anything is
// drawn. THE LANES OF THE CUT: long strips of open water sawn in the ice near the shore (dark, at the water's level over the ice: WATER.ice draws the ice at its
// level + .06); THE STACKS: the cut blocks (1 x .6 x .6 m) stacked on the shore by the lanes, pale blue; THE SLEDGES at the stacks; THE ICE ROAD: lantern posts
// every 60 m up the road to the shelf's edge, lit by night (the carry goes down by night). All placed by KRAND hash of (station, index, salt).
const ICE=(function(){const S=STATION,V0=S.VIL,G=terrainH,slope=(x,z)=>{const e=3;return Math.hypot(G(x+e,z)-G(x-e,z),G(x,z+e)-G(x,z-e))/(2*e);};
 const road=(x,z)=>nearLine(S.ROAD,x,z).d;
 const ok=(x,z)=>{if(waterH(x,z)>G(x,z)-.5)return false;if(z>S.shoreZ(x)-30)return false;if(road(x,z)<10&&Math.hypot(x-V0.x,z-V0.z)>120)return false;return slope(x,z)<.2;};
 const V=KHAMLET.village({id:'icecut',world:8410,culture:FELLGANG.ROW,focus:'quarry',site:{x:V0.x,z:V0.z},link:{x:V0.x+10,z:S.shoreZ(V0.x+10)-4},
  resource:{x:V0.x,z:S.shoreZ(V0.x)+80,workers:40},popMax:120,dims:FELLGANG.dims,ground:{ok},siteReach:500});
 const out={village:V,site:V.site,lanes:[],stacks:[],sledges:[],lamps:[],error:V.error||null};
 if(V.error)reportErr('the Ice-cutters: '+V.error);
 const U=(i,s)=>KRAND.unit(KRAND.hash(8411,i,s)),cx=V.site?V.site.x:V0.x;
 /* the cut lanes: parallel strips off the shore below the village, 6 m wide, 60-140 m long, square to the shore */
 for(let i=0;i<7;i++){const x=cx-150+i*48+(U(i,1)-.5)*10,z0=S.shoreZ(x)+25+U(i,2)*15,len=60+80*U(i,3);out.lanes.push({id:'icecut:lane:'+i,x,z:z0+len/2,z0,z1:z0+len,w:5+2*U(i,4)});}
 /* the stacks: on the shore at each lane's head, and the sledges beside them */
 out.lanes.forEach((L,i)=>{const x=L.x+(U(i,5)-.5)*6,z=S.shoreZ(x)-42-U(i,6)*8;   /* on the shore past the water's drawn line (shore less 30 m) */out.stacks.push({id:'icecut:stack:'+i,x,z,y:G(x,z),n:3+Math.floor(U(i,7)*4),rows:2+Math.floor(U(i,8)*2)});
  if(i%2===0)out.sledges.push({id:'icecut:sledge:'+i,x:x+5,z:z-3,y:G(x+5,z-3),ry:U(i,9)*.6-.3});});
 /* the lanterns up the ice road: every 60 m from the village to the shelf's edge */
 let acc=0;for(let k=1;k<S.ROAD.length;k++){const a=S.ROAD[k-1],b=S.ROAD[k],l=Math.hypot(b[0]-a[0],b[1]-a[1]);for(let t=(60-acc%60)%60;t<l;t+=60){const x=a[0]+(b[0]-a[0])*t/l+4,z=a[1]+(b[1]-a[1])*t/l;
  if(Math.abs(x)<TERR.R-60&&Math.abs(z)<TERR.R-60)out.lamps.push({id:'icecut:lamp:'+out.lamps.length,x,z,y:G(x,z)});}acc+=l;}
 return out;})();
window._ice=ICE;
(function(){const V=ICE.village;if(!V.records)return;
 V.records.forEach(r=>REGISTER({name:'The Ice-cutters: '+r.key,x:r.x,z:r.z,y:terrainH(r.x,r.z)-1,r:Math.max(r.w,r.d)*.6,h:r.h+1.5,key:r.key,village:'icecut'}));
 ICE.lanes.forEach(L=>REGISTER({name:'A cut lane in the ice (open water: thin ice at its edges)',x:L.x,z:L.z,y:STATION.LAKE-2,r:Math.max(L.w,L.z1-L.z0)*.55,h:3,lane:L.id,tags:{hazard:{kind:'drown',danger:.8,falloff:'none',shape:{type:'cyl',r:L.w*.5,h:3}}}}));
 ICE.stacks.forEach(s=>REGISTER({name:'Ice blocks, stacked for the carry',x:s.x,z:s.z,y:s.y-.5,r:3,h:s.rows*.62+1,stack:s.id}));
 ICE.lamps.forEach(l=>REGISTER({name:'A lantern post on the ice road (lit for the night carry)',x:l.x,z:l.z,y:l.y-.3,r:.6,h:2.6,lamp:l.id}));
 const cx=V.site.x,cz=V.site.z;let rad=0;V.records.forEach(r=>rad=Math.max(rad,Math.hypot(r.x-cx,r.z-cz)));ICE.radius=rad+30;
 LAND.keep=(x,z)=>{if(Math.hypot(x-cx,z-cz)<ICE.radius)return 0;if(nearLine(STATION.ROAD,x,z).d<6)return 0;for(const s of ICE.stacks)if(Math.hypot(x-s.x,z-s.z)<8)return 0;return 1;};})();
LAND.build=function(){const T=THREE,V=ICE.village;if(!V.records)return{village:0};
 FELLGANG.draw(V,{scene,ground:terrainH,seed:8412,label:'The Ice-cutters (a Fellgang village)'});FELLGANG.lanes(V,{scene,ground:terrainH});
 const box=new T.BoxGeometry(1,1,1),m=new T.Matrix4(),q=new T.Quaternion(),e=new T.Euler();
 /* the lanes of open water: dark slabs at the water's level, a hair over the ice's top so they read through it */
 const IL=new T.InstancedMesh(box,new T.MeshStandardMaterial({color:0x0e1a22,roughness:.08,metalness:.1}),Math.max(1,ICE.lanes.length));
 ICE.lanes.forEach((L,i)=>IL.setMatrixAt(i,m.compose(new T.Vector3(L.x,STATION.LAKE+.075,L.z),q,new T.Vector3(L.w,.02,L.z1-L.z0))));IL.count=ICE.lanes.length;
 /* the blocks: pale blue, a little translucent-looking (glossy), stacked in rows */
 const nb=ICE.stacks.reduce((a,s)=>a+s.n*s.rows,0),IB=new T.InstancedMesh(box,new T.MeshStandardMaterial({color:0xbcdcea,roughness:.12,metalness:0,emissive:0x0a1a24}),Math.max(1,nb));let b=0;
 ICE.stacks.forEach((s,i)=>{for(let r=0;r<s.rows;r++)for(let k=0;k<s.n-r;k++){const x=s.x+(k-(s.n-r-1)/2)*1.05,y=s.y+.3+r*.62;IB.setMatrixAt(b++,m.compose(new T.Vector3(x,y,s.z),q.setFromEuler(e.set(0,(KRAND.unit(KRAND.hash(8413,i,k))-.5)*.08,0)),new T.Vector3(1,.6,.6)));}});IB.count=b;
 /* the sledges: a bed on two runners */
 const IS=new T.InstancedMesh(box,new T.MeshStandardMaterial({color:0x5a4430,roughness:.9}),Math.max(1,ICE.sledges.length*3));let s3=0;
 ICE.sledges.forEach(sl=>{q.setFromEuler(e.set(0,sl.ry,0));const R=new T.Vector3(Math.cos(sl.ry),0,-Math.sin(sl.ry));
  IS.setMatrixAt(s3++,m.compose(new T.Vector3(sl.x,sl.y+.45,sl.z),q,new T.Vector3(1.4,.12,3.2)));
  for(const d of [-.6,.6])IS.setMatrixAt(s3++,m.compose(new T.Vector3(sl.x+R.x*d,sl.y+.18,sl.z+R.z*d),q,new T.Vector3(.08,.3,3.4)));});IS.count=s3;
 /* the lantern posts and their lamps (the lamp's glow follows the night: RRIM.night's way, in the tick below) */
 const IP=new T.InstancedMesh(box,new T.MeshStandardMaterial({color:0x3a2e24,roughness:.9}),Math.max(1,ICE.lamps.length)),lampM=new T.MeshStandardMaterial({color:0xffd9a0,emissive:0xffb050,emissiveIntensity:1.6}),
  IG=new T.InstancedMesh(new T.SphereGeometry(.16,8,6),lampM,Math.max(1,ICE.lamps.length));
 ICE.lamps.forEach((l,i)=>{IP.setMatrixAt(i,m.compose(new T.Vector3(l.x,l.y+1.1,l.z),q.set(0,0,0,1),new T.Vector3(.12,2.2,.12)));IG.setMatrixAt(i,m.compose(new T.Vector3(l.x,l.y+2.3,l.z),q,new T.Vector3(1,1.3,1)));});
 IP.count=IG.count=ICE.lamps.length;ICE.lampM=lampM;
 [[IL,'A cut lane in the ice (open water)'],[IB,'Ice blocks, stacked for the carry'],[IS,'A sledge for the carry'],[IP,'A lantern post on the ice road'],[IG,'A lantern (lit for the night carry)']].forEach(([o,l])=>{o.userData.host=true;o.userData.inspectLabel=l;scene.add(o);});
 IG.userData.noSnow=true;lampM.userData.noSnow=true;IL.material.userData.noSnow=true;IB.material.userData.noSnow=true;   /* open water and fresh-cut ice hold no snow (89z's snowOnScene skips them) */
 tick(()=>{if(ICE.lampM)ICE.lampM.emissiveIntensity=.2+1.8*(1-smooth(.04,.5,sun.intensity));});
 return{village:V.records.length,pop:V.census&&V.census.pop,lanes:ICE.lanes.length,blocks:b,lamps:ICE.lamps.length};};
// THE STATION'S CHECKS (99: LAND.checks / LAND.negatives), each with a broken input that must fail
const FC9={village:V=>{const n=V&&V.records?V.records.length:0,keys=n?new Set(V.records.map(r=>r.key)):new Set(),need=['fg-meethall','fg-icehouse','fg-sledgeshed'],miss=need.filter(k=>!keys.has(k));
  return{ok:!!V&&!V.error&&n>=8&&!miss.length,detail:V&&V.error?V.error:n+' buildings, '+((V&&V.census&&V.census.pop)||0)+' people'+(miss.length?'; missing '+miss.join(', '):'')};},
 dry:V=>{const bad=(V.records||[]).filter(r=>waterH(r.x,r.z)>terrainH(r.x,r.z)-.3);return{ok:(V.records||[]).length>0&&!bad.length,detail:bad.length?bad.length+' buildings on the ice':'every building on the shore, dry'};},
 lanes:L=>{const bad=L.filter(l=>!(waterH(l.x,l.z0+1)>terrainH(l.x,l.z0+1))||!(waterH(l.x,l.z1-1)>terrainH(l.x,l.z1-1)));return{ok:L.length>=4&&!bad.length,detail:L.length+' cut lanes'+(bad.length?', '+bad.length+' off the ice':', all on the lake')};},
 stacks:S=>{const bad=S.filter(s=>waterH(s.x,s.z)>terrainH(s.x,s.z)-.2);return{ok:S.length>=4&&!bad.length,detail:S.length+' stacks'+(bad.length?', '+bad.length+' on the ice':', all on the shore')};}};
LAND.checks=(add,P)=>{add('the Ice-cutters\' village placed on its shelf (core/hamlet, the Fellgang row)',FC9.village(ICE.village));add('the village on dry ground',FC9.dry(ICE.village));
 add('the cut lanes on the ice',FC9.lanes(ICE.lanes));add('the blocks stacked on the shore',FC9.stacks(ICE.stacks));};
LAND.negatives=(add,P)=>{add('a village with no ice house',FC9.village({records:(ICE.village.records||[]).filter(r=>r.key!=='fg-icehouse'),census:ICE.village.census}));
 add('a building on the ice',FC9.dry({records:[{x:STATION.VIL.x,z:STATION.shoreZ(STATION.VIL.x)+300}]}));
 add('a cut lane on the land',FC9.lanes([{x:STATION.VIL.x,z:STATION.VIL.z,z0:STATION.VIL.z-30,z1:STATION.VIL.z+30,w:6}]));
 add('a stack out on the ice',FC9.stacks([{x:STATION.VIL.x,z:STATION.shoreZ(STATION.VIL.x)+300}]));};
