// ================================================================= HOST — the Terraces: the lines, the city below, the station's checks
// [web] What the farm plan (41d, STAGE.plan) holds that the city stage (70) does not draw: the pylon lines (lattice towers, standing, leaning,
// fallen or cut to a stump, the wires slung between the ones that stand), and the city below toward the lake (the shelf's and the floor's
// towers as plain rusted prisms, 3 to 16 km out on the model's ground, under the page's fog: the skyline the station looks down on). The farm's
// buildings, the aqueduct's modules among them, are 70's towers: heroes, box shells and impostors by the metropolis kit's machinery. Everything
// here is registered (core/tags) before it is drawn. The station's checks join the shared ones (99: STAGE.shared, STAGE.checks).
const AV_FARM=(function(){const P=STAGE.plan,out={pylons:[],wires:[],far:[],ms:0};const t0=performance.now();
 const steel=new THREE.MeshStandardMaterial({color:0x5c4c40,roughness:.82,metalness:.45}),M4=new THREE.Matrix4(),Q=new THREE.Quaternion(),V=new THREE.Vector3(),S3=new THREE.Vector3(),E=new THREE.Euler();
 /* a geometry of beams (each a box from a to b, w thick), merged into one */
 const beams=list=>{const pos=[],nor=[],idx=[];list.forEach(([a,b,w])=>{const g=new THREE.BoxGeometry(w,w,1),d=new THREE.Vector3(b[0]-a[0],b[1]-a[1],b[2]-a[2]),L=d.length();g.scale(1,1,L);
   const m=new THREE.Matrix4().lookAt(new THREE.Vector3(0,0,0),d,Math.abs(d.y/L)>.99?new THREE.Vector3(1,0,0):new THREE.Vector3(0,1,0));m.setPosition((a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2);g.applyMatrix4(m);
   const o=pos.length/3;pos.push(...g.attributes.position.array);nor.push(...g.attributes.normal.array);for(const i of g.index.array)idx.push(i+o);});
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(nor,3));g.setIndex(idx);return g;};
 /* the pylon: four legs from an 8 m square to 2 m at 30 m and a peak at 42, crossarms at 30 m (16 m) and 36 m (12 m), X braces on each face every 6 m */
 const PY=(function(){const L=[],leg=y=>4-3*Math.min(1,y/30),H=42;for(const sx of[-1,1])for(const sz of[-1,1]){L.push([[sx*4,0,sz*4],[sx*1,30,sz*1],.45]);L.push([[sx*1,30,sz*1],[0,H,0],.3]);}
  for(let y=0;y<30;y+=6){const a=leg(y),b=leg(y+6);for(const f of[0,1,2,3]){const s=f<2?1:-1,ax=f%2;const P0=ax?[s*a,y,-a]:[-a,y,s*a],P1=ax?[s*b,y+6,b]:[b,y+6,s*b],P2=ax?[s*a,y,a]:[a,y,s*a],P3=ax?[s*b,y+6,-b]:[-b,y+6,s*b];L.push([P0,P1,.14],[P2,P3,.14]);}}
  L.push([[-8,30,0],[8,30,0],.4],[[-6,36,0],[6,36,0],.35],[[-8,30,0],[-1,33,0],.2],[[8,30,0],[1,33,0],.2]);return{geo:beams(L),stub:beams([[[-4,0,-4],[-3.4,4,-3.4],.45],[[4,0,-4],[3.4,4,-3.4],.45],[[-4,0,4],[-3.4,4,3.4],.45],[[4,0,4],[3.4,4,3.4],.45]]),attach:[[-8,30],[8,30],[-6,36],[6,36]],H};})();
 const all=[].concat(...P.pylons.map(l=>l.list));
 /* registered first: a line each, then every pylon */
 P.pylons.forEach(l=>{if(!l.list.length)return;const a=l.list[0],b=l.list[l.list.length-1];REGISTER({name:'A pylon line ('+l.list.length+' pylons, '+l.list.filter(p=>p.state==='up').length+' standing)',kind:'line',x:(a.x+b.x)/2,z:(a.z+b.z)/2,y:terrainH((a.x+b.x)/2,(a.z+b.z)/2),r:Math.hypot(b.x-a.x,b.z-a.z)/2+60,h:44,tags:{kind:'line',line:'pylons',id:l.id}});});
 all.forEach(p=>{p.y=terrainH(p.x,p.z);REGISTER({name:'A pylon ('+p.state+')',kind:'pylon',x:p.x,z:p.z,y:p.y,r:6,h:p.state==='up'||p.state==='leaning'?PY.H:p.state==='fallen'?4:4,tags:{kind:'pylon',state:p.state}});});
 const up=all.filter(p=>p.state==='up'||p.state==='leaning'),down=all.filter(p=>p.state==='fallen'),stumps=all.filter(p=>p.state==='stump');
 const mkIM=(g,list,place,label)=>{const im=new THREE.InstancedMesh(g,steel,Math.max(1,list.length));list.forEach((p,i)=>{place(p);im.setMatrixAt(i,M4);});im.count=list.length;im.instanceMatrix.needsUpdate=true;im.frustumCulled=false;im.userData.inspectLabel=label;im.userData.host=true;im.castShadow=!!MP.shadow;scene.add(im);return im;};
 /* standing (a leaning one tipped about its foot toward leanDir); fallen, on its side along fallDir; a stump, its legs cut at 4 m */
 mkIM(PY.geo,up,p=>{E.set(0,p.yaw,0,'YXZ');Q.setFromEuler(E);if(p.lean){const ax=new THREE.Vector3(Math.cos(p.leanDir),0,Math.sin(p.leanDir));Q.premultiply(new THREE.Quaternion().setFromAxisAngle(ax,p.lean*Math.PI/180));}M4.compose(V.set(p.x,p.y-.3,p.z),Q,S3.set(1,1,1));},'a pylon');
 mkIM(PY.geo,down,p=>{const d=[Math.cos(p.fallDir),Math.sin(p.fallDir)],ax=new THREE.Vector3(-d[1],0,d[0]);Q.setFromAxisAngle(ax,-Math.PI/2*.97);Q.multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0),p.yaw));M4.compose(V.set(p.x,terrainH(p.x+d[0]*20,p.z+d[1]*20)+3.6,p.z),Q,S3.set(1,1,1));},'a fallen pylon');
 mkIM(PY.stub,stumps,p=>{E.set(0,p.yaw,0,'YXZ');Q.setFromEuler(E);M4.compose(V.set(p.x,p.y-.2,p.z),Q,S3.set(1,1,1));},'a pylon cut to a stump');
 /* the wires: four conductors between each two neighbours that stand, sagging 3% of the span, eight lengths each; none past a fallen pylon */
 P.pylons.forEach(l=>{for(let i=0;i+1<l.list.length;i++){const a=l.list[i],b=l.list[i+1];if(!(a.state==='up'||a.state==='leaning')||!(b.state==='up'||b.state==='leaning'))continue;
  PY.attach.forEach(([ox,oy])=>{const pa=[a.x+Math.cos(a.yaw)*ox,a.y+oy,a.z-Math.sin(a.yaw)*ox],pb=[b.x+Math.cos(b.yaw)*ox,b.y+oy,b.z-Math.sin(b.yaw)*ox],span=Math.hypot(pb[0]-pa[0],pb[2]-pa[2]),sag=.03*span,seg=[];
   for(let k=0;k<=8;k++){const t=k/8;seg.push([pa[0]+(pb[0]-pa[0])*t,pa[1]+(pb[1]-pa[1])*t-sag*4*t*(1-t),pa[2]+(pb[2]-pa[2])*t]);}out.wires.push({line:l.id,pts:seg,sag});});}});
 {const n=out.wires.length*8,g=new THREE.BoxGeometry(.09,.09,1),im=new THREE.InstancedMesh(g,new THREE.MeshStandardMaterial({color:0x2a2622,roughness:.6,metalness:.6}),Math.max(1,n));let i=0;const up0=new THREE.Vector3(0,1,0);
  out.wires.forEach(w=>{for(let k=0;k<8;k++){const a=w.pts[k],b=w.pts[k+1],d=new THREE.Vector3(b[0]-a[0],b[1]-a[1],b[2]-a[2]),L=d.length();M4.lookAt(new THREE.Vector3(0,0,0),d,up0);Q.setFromRotationMatrix(M4);M4.compose(V.set((a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2),Q,S3.set(1,1,L));im.setMatrixAt(i++,M4);}});
  im.count=i;im.instanceMatrix.needsUpdate=true;im.frustumCulled=false;im.userData.inspectLabel='the wires of a pylon line';im.userData.host=true;scene.add(im);}
 out.pylons=all;
 /* THE CITY BELOW: on a 240 m lattice from 3.2 to 16 km, where the model's ground is the shelf or the floor (under 300 m) and dry, a tower by the
    density field's chance; the floor's tall (60 to 220 m), the shelf's midrises (16 to 60), three in five cut down to a ruin's height; one prism a
    tower, rust-grey by hash, on the model's ground (the far ground's own heights) */
 {const F=STAGE.F,LY=STAGE.lakeY,S=STAGE.seed,list=[],R0=3200,R1=16000;for(let i=-70;i<=70;i++)for(let j=-70;j<=70;j++){const h=KRAND.hash(S,i+300,j+300,91),u=k=>KRAND.unit(KRAND.hash(h,k,0,0)),x=i*240+(u(1)-.5)*150,z=j*240+(u(2)-.5)*150,d=Math.hypot(x,z);
   if(d<R0||d>R1)continue;const gy=STAGE.modelY(x,z),abs=gy+STAGE.base;if(gy<LY+3||abs>300)continue;const den=F.density(x,z);if(u(3)>den*.9)continue;
   const tall=abs<100,H0=tall?60+160*Math.pow(u(4),1.6):16+44*u(4),cut=u(5)<.6?.2+.5*u(6):1,hgt=Math.max(10,H0*cut),w=tall?24+30*u(7):30+40*u(7),dd=tall?24+26*u(8):18+30*u(8);
   list.push({x,z,y:gy,w,d:dd,h:hgt,yaw:u(9)*Math.PI,tone:.75+.35*u(10)});if(list.length>=2600)break;}
  const g=new THREE.BoxGeometry(1,1,1);g.translate(0,.5,0);const im=new THREE.InstancedMesh(g,new THREE.MeshLambertMaterial({color:0xffffff}),Math.max(1,list.length)),C=new THREE.Color();
  list.forEach((t,i)=>{E.set(0,t.yaw,0,'YXZ');Q.setFromEuler(E);M4.compose(V.set(t.x,t.y-2,t.z),Q,S3.set(t.w,t.h+2,t.d));im.setMatrixAt(i,M4);C.setRGB(.30*t.tone,.26*t.tone,.23*t.tone);im.setColorAt(i,C);});
  im.count=list.length;im.instanceMatrix.needsUpdate=true;if(im.instanceColor)im.instanceColor.needsUpdate=true;im.frustumCulled=false;im.userData.inspectLabel='the city below (the shelf and the floor)';im.userData.host=true;scene.add(im);
  if(list.length)REGISTER({name:'The city below: the shelf\'s and the floor\'s towers toward the lake ('+list.length+')',kind:'farcity',x:0,z:9000,y:STAGE.lakeY,r:16000,h:240,tags:{kind:'farcity',count:list.length}});out.far=list;}
 REGISTER({name:'The farm roads',kind:'line',x:P.hub.x,z:P.hub.z,y:P.hub.y,r:STAGE.R,h:2,tags:{kind:'line',line:'roads',count:P.roads.length}});
 out.ms=Math.round(performance.now()-t0);return out;})();
// ---------------------------------------------------------------- the station's checks (99 runs them after the shared ones), each with a negative
const FCHK={
 /* the farm's buildings on their plinths: the drawn ground level under each box (nine points inside it within 0.3 m of the record's y) */
 plinths(T){let bad=[];for(const t of T){if(t.family==='aqueduct')continue;for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++){const lx=a*(t.rx-7),lz=b*(t.rz-7),x=t.x+lx*t.c+lz*t.s,z=t.z-lx*t.s+lz*t.c;if(Math.abs(terrainH(x,z)-t.y)>.3){bad.push(t.id);a=b=2;}}}
  return{ok:T.length>40&&!bad.length,detail:T.filter(t=>t.family!=='aqueduct').length+' buildings, '+bad.length+' off their plinths'+(bad.length?' ('+bad.slice(0,3).join(', ')+')':'')};},
 /* nothing in a road: no building's box (an aqueduct's piers, not its arches) and no pylon within the carriageway */
 roads(T,pyl){const P=STAGE.plan,J=MP.aqueductJoin,bad=[];for(const t of T){const boxes=t.family==='aqueduct'?[0,1,2,3].map(k=>{const u=-J.len/2+k*J.span;return{x:t.x+u*t.c,z:t.z-u*t.s,c:t.c,s:t.s,rx:J.pier/2+.3,rz:J.depth/2+.3};}):[{x:t.x,z:t.z,c:t.c,s:t.s,rx:t.rx-6,rz:t.rz-6}];
   for(const B of boxes){for(let k=0;k<12;k++){const a=k/12*TAU,lx=Math.cos(a)*B.rx,lz=Math.sin(a)*B.rz,x=B.x+lx*B.c+lz*B.s,z=B.z-lx*B.s+lz*B.c;if(P.roadD(x,z)<.5){bad.push(t.id);break;}}}}
  for(const p of pyl)if(P.roadD(p.x,p.z)<3)bad.push(p.id);return{ok:!bad.length,detail:P.roads.length+' roads; '+bad.length+' things in one'+(bad.length?' ('+[...new Set(bad)].slice(0,3).join(', ')+')':'')};},
 /* the aqueduct continuous: its modules end to end (0.6 m), the channel level but for its fall, each standing on its bed (the ground at its piers'
    feet within 0.5 m of its base) */
 aqueduct(A){let worst=0,step=0,off=0;for(let i=1;i<A.length;i++){worst=Math.max(worst,Math.hypot(A[i-1].b[0]-A[i].a[0],A[i-1].b[1]-A[i].a[1]));step=Math.max(step,Math.abs(A[i-1].y-A[i].y));}
  const J=MP.aqueductJoin;for(const t of A)for(let k=0;k<=J.arches;k++){const u=-J.len/2+k*J.span;off=Math.max(off,Math.abs(terrainH(t.x+u*t.c,t.z-u*t.s)-t.y));}
  return{ok:A.length>=20&&worst<.6&&step<.05&&off<.5,detail:A.length+' modules; the worst joint '+worst.toFixed(2)+' m apart, the channel stepping '+step.toFixed(3)+' m, the piers\' feet '+off.toFixed(2)+' m off their bed'};},
 crossings(X){const bad=X.filter(x=>!x.good);return{ok:X.length>0&&!bad.length,detail:X.length+' roads cross the aqueduct, '+bad.length+' not under an arch'};},
 /* the wires: slung between standing pylons, never through the ground (their lowest point 8 m or more over it) */
 wires(W){let low=0;for(const w of W)for(const p of w.pts)if(p[1]-terrainH(p[0],p[2])<8){low++;break;}return{ok:W.length>=20&&!low,detail:W.length+' wires, '+low+' near or through the ground'};},
 /* the city below: towers out to 16 km on the shelf and the floor, none on the page, none under the lake */
 farCity(L){let near=0,wet=0;for(const t of L){if(Math.hypot(t.x,t.z)<STAGE.R+300)near++;if(t.y<STAGE.lakeY+2)wet++;}return{ok:L.length>=300&&!near&&!wet,detail:L.length+' towers below, '+near+' on the page, '+wet+' under the lake'};},
 /* the fields gone to thicket (87t): the crops' plants and the orchards' trees drawn in their fields, none on a road or a plinth */
 thicket(Th){if(!Th||!Th.ok)return{ok:false,detail:'no thicket'};const P=STAGE.plan;let bad=0;for(const r of Th.sample){if(P.roadD(r[0],r[1])<0||STAGE.built(r[0],r[1])>.8)bad++;}
  const um=Th.unmapped||[],cb=Th.cellBad||[];return{ok:Th.plants>=20000&&Th.trees>=2000&&Th.crops.length>=4&&!bad&&!um.length&&!cb.length,detail:(um.length?um.length+' cards with no map ('+um.slice(0,3).join(', ')+'); ':'')+(cb.length?cb.length+' cards wider than a cell ('+cb.slice(0,3).join(', ')+'); ':'')+Th.fields+' fields: '+Th.plants+' crop clumps, '+Th.trees+' orchard trees ('+Th.grown+' grown feral) of '+Th.crops.join(', ')+'; '+bad+' of '+Th.sample.length+' sampled on a road or a plinth'};},
 /* the pods overgrown on top (87t): every standing pod with a dome left under its mat (thirty quads or more; a broken pod's ring, eight; a stump
    none: their heaps carry fifteen clumps or more), and every clump's foot within 0.5 m of its own pod's mat as drawn (the quads the mesh was made of: each foot's nearest triangle, BIO.triDist) */
 podTops(L,lift){if(!L||!L.length)return{ok:false,detail:'no pod tops'};const dy=lift==null?0:lift,pods=STAGE.plan.towers.filter(t=>t.family==='pod'&&t.state!=='fallen').length;
  const need=t=>t.state==='stump'||t.state==='broken'?0:30;let thin=0,feet=0,off=0,quads=0,heap=0;const A={},B={},C={},v=(p,o)=>(o.x=p[0],o.y=p[1],o.z=p[2],o);
  for(const P of L){quads+=P.quads.length;const hp=P.heap||[];heap+=hp.length;if(P.quads.length<need(P.t)||(P.t.state==='broken'||P.t.state==='stump')&&hp.length<15)thin++;
   /* a heap's clump on the heap's own surface (KRUBBLE.at on MP.heaps, the function its mesh is drawn from), within 0.3 m */
   if(hp.length){const HP=MP.heaps(MP.FAMILY.pod,P.t.state);for(const f of hp){feet++;if(Math.abs(KRUBBLE.at(HP,f[0],f[2])-.15-(f[1]+dy))>.3)off++;}}for(const f of P.feet){feet++;const x=f[0],y=f[1]+dy,z=f[2];let d=1e9;
    for(const q of P.quads){d=Math.min(d,BIO.triDist(x,y,z,v(q[0],A),v(q[1],B),v(q[2],C)),BIO.triDist(x,y,z,v(q[0],A),v(q[2],B),v(q[3],C)));if(d<.5)break;}if(d>.5)off++;}}
  return{ok:L.length===pods&&!thin&&feet>=pods*20&&!off,detail:L.length+' of '+pods+' pods, '+quads+' quads of vines, '+heap+' clumps on the heaps, '+thin+' bare (a dome or a heap left uncovered); '+feet+' clumps, '+off+' off their mat or heap'};},
 /* the streets (46z STAGE.transit, drawn by 74): every plan road a transit road with its junctions, the furniture dead, a riot's war at most
    (no crater), weeds through the asphalt each on its road's surface (within 0.1 m of levelAt, inside the carriageway and pavements) */
 streets(TR,n,Th){if(!TR||!TR.net)return{ok:false,detail:'no streets'};const P=STAGE.plan,need=P.roads.length+P.roads.filter(r=>r.kind==='ring').length*3;let off=0;
  for(const q of (Th&&Th.weedSample)||[]){const Rd=TR.net.roads[q[3]],pr=Rd.path.project(q[0],q[2]);if(Math.abs(Rd.levelAt(q[0],q[2])-q[1])>.1||pr.d>Rd.width/2+(Rd.pavement==null?0:Rd.pavement)+.8)off++;}
  const dead=typeof KratorTransitFurniture!=='undefined'&&KratorTransitFurniture.dead===true,ready=!!(n&&n.roads);
  return{ok:TR.net.roads.length===need&&TR.net.junctions.length>=10&&ready&&n.pieces>100&&dead&&!TR.craters&&Th&&Th.weeds>=20000&&!off,
   detail:TR.net.roads.length+' roads of '+need+', '+TR.net.junctions.length+' junctions, '+(ready?n.pieces+' furniture pieces and '+n.warPieces+' of war drawn by cell':'not drawn')+(dead?', dead':', LIT')+'; '+TR.craters+' craters; '+(Th?Th.weeds+' weeds ('+Th.roadBush+' bushes), '+off+' of '+(Th.weedSample||[]).length+' sampled off their road':'no weeds')};},
 /* the ruins of the farm belt: a few whole, most of the glass gone, some down */
 ruins(T){const B=T.filter(t=>t.family!=='aqueduct'),n=B.length,f=s=>B.filter(t=>t.state===s).length/Math.max(1,n);return{ok:n>40&&f('intact')<=.12&&f('gutted')>=.15&&(f('fallen')+f('stump'))>=.08,detail:Math.round(f('intact')*100)+'% whole, '+Math.round(f('gutted')*100)+'% gutted, '+Math.round((f('fallen')+f('stump'))*100)+'% down of '+n}; }};
STAGE.checks=function(add){const P=STAGE.plan,T=P.towers;add('the farm buildings stand on their plinths',FCHK.plinths(T));add('nothing stands in a road',FCHK.roads(T,AV_FARM.pylons));add('the aqueduct is continuous on its bed',FCHK.aqueduct(P.aqueduct.modules));
 add('every road crosses the aqueduct under an arch',FCHK.crossings(P.crossings));add('the pylon lines carry their wires clear of the ground',FCHK.wires(AV_FARM.wires));add('the city lies below toward the lake',FCHK.farCity(AV_FARM.far));
 add('the fields and orchards have gone to thicket',FCHK.thicket(typeof AV_THICKET!=='undefined'?AV_THICKET:null));add('the farm belt is ruined',FCHK.ruins(T));add('the pods are overgrown on top',FCHK.podTops(window.AV_POD_TOPS));
 add('the streets are the transit kit streets, ruined and grassed over',FCHK.streets(STAGE.transit,typeof AVTR!=='undefined'?AVTR.n:null,typeof AV_THICKET!=='undefined'?AV_THICKET:null));};
STAGE.negatives=function(add){const P=STAGE.plan,T=P.towers,pod=T.find(t=>t.family==='pod'),tr=P.roads.find(r=>r.kind==='trunk')||P.roads[0],q=tr.pts[Math.min(3,tr.pts.length-1)];
 add('a pod moved 300 m off its plinth',FCHK.plinths([Object.assign({},pod,{x:pod.x+300,z:pod.z+300})].concat(T)));   /* 40 m set a honeycomb's pod on its neighbour's level */
 add('a pod standing on the trunk road',FCHK.roads([Object.assign({},pod,{x:q[0],z:q[1]})],[]));
 {const A=P.aqueduct.modules;add('a module missing from the aqueduct',FCHK.aqueduct(A.filter((t,i)=>i!==Math.floor(A.length/2))));}
 add('a crossing beside its arch',FCHK.crossings(P.crossings.map((x,i)=>i?x:Object.assign({},x,{good:false}))));
 add('a wire sagging into the ground',FCHK.wires(AV_FARM.wires.map((w,i)=>i?w:Object.assign({},w,{pts:w.pts.map((p,k)=>k===4?[p[0],terrainH(p[0],p[2])+1,p[2]]:p)}))));
 add('the city below standing on the page',FCHK.farCity(AV_FARM.far.concat([{x:0,z:0,y:0}])));
 add('no thicket in the fields',FCHK.thicket(typeof AV_THICKET!=='undefined'&&AV_THICKET?Object.assign({},AV_THICKET,{plants:0,trees:0}):null));
 add('a card drawn with no map (a solid quad)',FCHK.thicket(typeof AV_THICKET!=='undefined'&&AV_THICKET?Object.assign({},AV_THICKET,{unmapped:['thicket.card_crop_melon']}):null));
 add('a card smeared across its sheet',FCHK.thicket(typeof AV_THICKET!=='undefined'&&AV_THICKET?Object.assign({},AV_THICKET,{cellBad:['thk.cotton.a']}):null));
 add('the pod clumps lifted 3 m off the domes',FCHK.podTops(window.AV_POD_TOPS,3));
 add('a gutted pod left bare',FCHK.podTops((window.AV_POD_TOPS||[]).map(P=>P.t.state!=='gutted'?P:Object.assign({},P,{quads:[],feet:[]}))));
 add('the weeds lifted 2 m off the streets',FCHK.streets(STAGE.transit,typeof AVTR!=='undefined'?AVTR.n:null,typeof AV_THICKET!=='undefined'&&AV_THICKET?Object.assign({},AV_THICKET,{weedSample:AV_THICKET.weedSample.map(q=>[q[0],q[1]+2,q[2],q[3]])}):null));
 add('the street lamps lit',(()=>{const K=typeof KratorTransitFurniture!=='undefined'?KratorTransitFurniture:null,d=K&&K.dead;if(K)K.dead=false;try{return FCHK.streets(STAGE.transit,typeof AVTR!=='undefined'?AVTR.n:null,typeof AV_THICKET!=='undefined'?AV_THICKET:null);}finally{if(K)K.dead=d;}})());
 add('every farm building whole',FCHK.ruins(T.map(t=>Object.assign({},t,{state:'intact'}))));};
