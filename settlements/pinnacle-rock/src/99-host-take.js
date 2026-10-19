// ================================================================= HOST — Pinnacle Rock's views, inspector words and checks, handed to core/host
// The camera, the frame loop, the panel and window._api are core/host's (core/host/README.md): this fragment says what
// this page has. PLAN.md section 4 names the views; the ones for what is not built yet (the roosts, the town, the farms'
// fields) come with their stages.
const _fin=id=>ROCK.find(B=>B.id===id),_top=MESA_B.top;
const VIEWS=(function(){const V={},n0=_fin('fin-n0'),e1=_fin('fin-e1');
 V['Overview from the south-east, above the canopy']=[1500,560,1750,0,170,0];
 V['From afar (the knoll and the Inner Wall behind it)']=[2600,700,9000,0,600,-30000];
 if(n0)V['The north fins at roost height, over the gorge']=[n0.x+60,n0.top+20,-860,n0.x,n0.top-25,n0.z];
 if(e1)V['The east fins from the east']=[e1.x+330,e1.top+10,e1.z+90,e1.x,e1.top-30,e1.z];
 V['The Garden\'s mesa from the Crown']=[0,_top+14,-300,0,_top+90,0];
 if(GARDEN_B)V['Among the pinnacles (on the Garden\'s mesa)']=[70,GARDEN_B.top+8,95,-10,GARDEN_B.top+110,-30];
 V['The south nose (where the Stair comes down)']=[220,90,1000,0,140,560];
 V['The farm ring from the forest gate']=[0,12,PR.GATE.z+30,0,140,0];
 V['The gorge under the north rim']=[420,-20,PR.GORGE.z(420),-200,40,-700];
 V['The Inner Wall, north']=[0,_top+30,-560,0,1500,-40000];
 // the roosts (P2)
 {const R=ROOST.roosts.find(r=>r.plat==='deck-fin-e1')||ROOST.roosts.find(r=>/deck-fin-e/.test(r.plat));
  if(R)V['A Quetzal stall on the east fins']=[R.fx+R.ox*34+R.oz*10,R.y+8,R.fz+R.oz*34-R.ox*10,R.fx,R.y+2.5,R.fz];}
 {const G=ROOST.decks.find(d=>d.id==='deck-garden-2');if(G)V['The Garden\'s roost rings']=[G.x+150,G.y+30,G.z+120,G.x,G.y-10,G.z];}
 {const L=ROOST.lifts.find(l=>l.id==='lift-north');if(L)V['The beast lift over the gorge']=[L.tip.x+90,L.tip.y-60,L.tip.z-90,L.tip.x,L.tip.y-90,L.tip.z];}
 {const Rd=(ROOST.roads||[])[0];if(Rd){const m=Rd.pts[Math.floor(Rd.benchEnd*.45)];V['The lift road (cut along the debris slope)']=[m[0]-150,m[1]+70,m[2]-120,m[0],m[1],m[2]];}}
 {const S=ROOST.stair;if(S&&S.landings.length){const m=S.pts[S.landings[0]];V['The Stair (its upper landing)']=[m[0]-30,m[1]+6,m[2]+45,m[0],m[1]-4,m[2]];}}
 // THE TOWN (P3a): the Crown from the south-east, the house quarter from the Garden's mesa's foot, the Stair's head
 if(typeof TOWN!=='undefined'&&TOWN){const H=TOWN.lots.find(l=>l.role==='hall');
  if(H)V['The Crown (the assembly hall and the market)']=[H.x+150,_top+70,H.z+150,H.x,_top+8,H.z+20];
  V['The house quarter (west of the Garden)']=[-120,_top+45,170,-260,_top+4,40];
  const T=TOWN.lots.find(l=>l.role==='customs');if(T)V['The Stair\'s head (the toll house and the caravan market)']=[T.x-10,_top+42,T.z+95,T.x+10,_top+2,T.z-110];}
 // THE FARMS (P3b): the terraces from over the south-west, a farmhouse among the paddies
 if(typeof FARMS!=='undefined'&&FARMS){V['The terraces and the palisade (from the south-west)']=[-760,150,1250,-250,0,700];
  const Hp=FARMS.houses.find(h=>h.v===2);if(Hp)V['A paddy farm by the spring']=[Hp.x+60,Hp.y+28,Hp.z+55,Hp.x,Hp.y+2,Hp.z];}
 // THE BANDS' GROUNDS (P3c): the Quetzal's on the top by the east fins, a floor camp in its hedge
 if(typeof CAMPS!=='undefined'&&CAMPS){const Q=CAMPS.grounds.find(g=>g.tribe==='quetzal'&&g.ground==='upper');if(Q)V['The Quetzal band\'s ground (by the east fins)']=[Q.ell.x-110,_top+45,Q.ell.z+90,Q.ell.x,_top+3,Q.ell.z];
  const T=CAMPS.grounds.find(g=>g.tribe==='threehorn'&&g.ground==='lower');if(T)V['The Threehorn band\'s camp and pasture (in its thorn hedge)']=[T.ell.x+190,90,T.ell.z+260,T.ell.x-120,0,T.ell.z-60];}
 return V;})();

// ---------------------------------------------------------------- the inspector's words: the rock, the zone of the top or
// the floor (the settled plan), a plant's species and harvest
function describe(hit){const p=hit.point,o=hit.object;
 let best=null;for(const r of REG){const dx=p.x-r.x,dz=p.z-r.z;if(dx*dx+dz*dz<=r.r*r.r&&p.y>=(r.y||0)-2&&p.y<=(r.y||0)+r.h+5){if(!best||r.r<best.r)best=r;}}
 const item=o.isInstancedMesh&&o.userData.biome?(o.name||'').replace(/^biome:/,''):null;
 const PLT=item&&(NECANYONS.plantOfItem(item)||(HYPERJUNGLE.plantOfItem&&HYPERJUNGLE.plantOfItem(item)));
 const onTop=KSTACKS.at([MESA_B],p.x,p.z)&&p.y>_top-6,Z=onTop?PR.topZoneAt(p.x,p.z):PR.zoneAt(p.x,p.z);
 const hv=PLT&&PLT.tags?PLT.tags.harvest:null;
 return(PLT?PLT.name:best?best.name:(o.userData.inspectLabel||item||o.name||'mesh'))+'  ·  '+(o.userData.inspectLabel||item||'')+
  (hv?'\nharvest: wood '+hv.wood+' · edible '+(hv.edible.join(', ')||'none')+(hv.medicinal?' · medicinal':''):'')+
  '\n'+(onTop?'the top: ':'the floor: ')+Z.name+'\n'+p.x.toFixed(0)+', '+p.y.toFixed(0)+', '+p.z.toFixed(0)+'  range '+camera.position.distanceTo(p).toFixed(0)+' m';}

// ---------------------------------------------------------------- the probe's budgets and the page's checks (verify.py --assert)
const BUDGET={
 showcase:{tris:16000000,calls:240},
 cls:{pass:7000000,host:2600000},   // host: the rock, the roosts and the town (P3a: ~0.6 M, its buildings instanced)
 type:{'necanyons/trees':'pass','necanyons/carnivores':'pass','necanyons/floor':'pass','jungle/hyper':'pass','jungle/trees':'pass','jungle/floor':'pass','jungle/far':'pass','jungle/dress':'pass','jungle/fauna':'pass','pinnacle/talus':'pass','host':'host'},
};
// ---------------------------------------------------------------- THE DRAWN ROCK, measured by rays
// What hangs on the rock is checked against the rock AS DRAWN (the merged meshes of 47-host-land.js), not against KSTACKS'
// outline, which the mesh only approximates (its wall rings are at most 160 segments: on the mesa the drawn face stands up
// to 12 m inside the outline). near(box) gathers the rock's triangles in a box into one small mesh to cast at;
// gap(M, x, y, z, dx, dz) the distance along a level direction from the point to the drawn rock (cast from 8 m back:
// positive in the air, negative in the rock, null when the point is deeper in than 8 m or nothing is there)
const ROCKRAY=(function(){let meshes=null;const RC=new THREE.Raycaster(),CACHE=new Map();
 function near(x0,x1,z0,z1,y0,y1){const key=[x0,x1,z0,z1,y0,y1].map(Math.round).join(',');let m=CACHE.get(key);if(m)return m;
  if(!meshes){meshes=[];scene.traverse(o=>{if(o.isMesh&&o.userData.rock)meshes.push(o);});}
  const pos=[];meshes.forEach(o=>{const g=o.geometry,P=g.attributes.position,I=g.index,n=I?I.count:P.count;
   for(let t=0;t<n;t+=3){let inBox=false;const v=[];for(let k=0;k<3;k++){const i=I?I.getX(t+k):t+k,x=P.getX(i),y=P.getY(i),z=P.getZ(i);v.push(x,y,z);
     if(x>=x0&&x<=x1&&z>=z0&&z<=z1&&y>=y0&&y<=y1)inBox=true;}if(inBox)for(const q of v)pos.push(q);}});
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.computeBoundingSphere();
  m=new THREE.Mesh(g,new THREE.MeshBasicMaterial({side:THREE.DoubleSide}));m.updateMatrixWorld(true);CACHE.set(key,m);return m;}
 function gap(M,x,y,z,dx,dz){const L=Math.hypot(dx,dz)||1;dx/=L;dz/=L;RC.set(new THREE.Vector3(x-dx*8,y,z-dz*8),new THREE.Vector3(dx,0,dz));RC.far=60;
  const h=RC.intersectObject(M,false)[0];return h?h.distance-8:null;}
 // the drawn surface under a point (the first rock a ray down from 30 m over it meets), or null
 function under(M,x,y,z){RC.set(new THREE.Vector3(x,y+30,z),new THREE.Vector3(0,-1,0));RC.far=90;const h=RC.intersectObject(M,false)[0];return h?y+30-h.distance:null;}
 // in the rock: (dx, dz) points at the rock the point hangs on; a ray from the point itself goes the OTHER way, out from
 // it, and the first wall it meets (faces seen edge-on, a top's, skipped) faces away when the ray is leaving rock it
 // started in (the rock's faces wind outward: KSTACKS.mesh), and faces it when the point is in the air (another body's
 // wall across a cleft). Nothing met: in the air. The point's own position decides, not where a ray starts
 function inRock(M,x,y,z,dx,dz){const L=Math.hypot(dx,dz)||1;dx=-dx/L;dz=-dz/L;RC.set(new THREE.Vector3(x,y,z),new THREE.Vector3(dx,0,dz));RC.far=60;
  for(const h of RC.intersectObject(M,false)){const n=h.face&&h.face.normal;if(!n)continue;const d=n.x*dx+n.z*dz;if(Math.abs(d)<.05)continue;return d>0&&h.distance>.1;}
  return false;}
 return {near,gap,under,inRock};})();
// the plan's numbers (PLAN.md section 1, the settled layout)
const HCHK={
 // the mesa: 250 m over its south foot, about 1.2 km north-south by 0.8 km
 mesa(B){const b=B.beds[B.beds.length-1],S=a=>{let m=0;for(let k=-6;k<=6;k++)m=Math.max(m,KSTACKS.footR(b,a+k*.03)*(1-b.ch));return m;};   // the widest near each axis: a gully is not the mesa's size
  const ns=S(Math.PI/2)+S(-Math.PI/2),ew=S(0)+S(Math.PI),over=B.top-floorH(0,650);
  return{ok:over>240&&over<260&&ns>1050&&ns<1350&&ew>680&&ew<920,detail:'top '+over.toFixed(0)+' m over the south foot; '+ns.toFixed(0)+' m north-south by '+ew.toFixed(0)+' m'};},
 // the fins: ten, each wholly on the top at least 12 m in from the edge, 40-90 m over it, and SPREAD round the rim (the
 // owner, 2026-10-19: not clustered): at least five of the eight compass sectors hold one, and no 250 m circle holds
 // more than three
 fins(F){const bad=[];F.forEach(B=>{const b=B.beds[0];for(let i=0;i<24;i++){const a=i/24*TAU,R=KSTACKS.footR(b,a),A=KSTACKS.at([MESA_B],b.cx+Math.cos(a)*R,b.cz+Math.sin(a)*R);
   if(!A||A.d>-12){bad.push(B.id+' near the edge');break;}}const h=B.top-_top;if(h<38||h>95)bad.push(B.id+' '+h.toFixed(0)+' m');});
  const sec=new Set(F.map(B=>Math.floor(((Math.atan2(B.z,B.x)+TAU)%TAU)/(TAU/8))));
  let crowd=0;F.forEach(A=>{crowd=Math.max(crowd,F.filter(B=>Math.hypot(A.x-B.x,A.z-B.z)<250).length);});
  return{ok:F.length===10&&!bad.length&&sec.size>=5&&crowd<=3,detail:F.length+' fins; '+sec.size+' of 8 sectors; at most '+crowd+' within 250 m'+(bad.length?'; '+bad.join(', '):'')};},
 // the Garden: a smaller, lower mesa in the middle of the top (40-70 m over it, 350-480 m across), its pinnacles on it,
 // fourteen or more (with those on the Heart), tallest at the centre (the owner, 2026-10-19: even larger): those within
 // 100 m of its middle 180 m or more on average over its top, the outer ones lower; four carry roost rings
 garden(G,GB){const gtop=GB?GB.top:0,b=GB?GB.beds[GB.beds.length-1]:null,across=b?KSTACKS.footR(b,0)+KSTACKS.footR(b,Math.PI):0,rise=GB?GB.top-_top:0;
  const on=G.filter(B=>GB&&B.y0>gtop-10),h=B=>B.top-gtop,avg=L=>L.length?L.reduce((s,B)=>s+h(B),0)/L.length:0;
  const pin=on.filter(B=>B.kind==='spire'),inner=pin.filter(B=>Math.hypot(B.x-GB.x,B.z-GB.z)<100),outer=pin.filter(B=>Math.hypot(B.x-GB.x,B.z-GB.z)>=100),hi=avg(inner),lo=avg(outer);
  return{ok:!!GB&&rise>40&&rise<70&&across>350&&across<480&&on.length>=14&&G.filter(B=>B.ring).length===4&&hi>=180&&hi>lo+20,
   detail:'the Garden\'s mesa '+rise.toFixed(0)+' m over the top, '+across.toFixed(0)+' m across; '+on.length+' stacks on it ('+pin.length+' pinnacles); the centre\'s '+hi.toFixed(0)+
    ' m on average, the outer '+lo.toFixed(0)+' m; '+G.filter(B=>B.ring).length+' with rings'};},
 // the Heart: one more mesa in the Garden's middle (the owner, 2026-10-19), about half the height of the pinnacles there
 // (its rise over the Garden's mesa .4-.6 of theirs), three or more of them rising out of it, and weathered harder than
 // the Garden's mesa: how far its beds' rims stand from the same body cut clean (weather 0), as a share of the radius,
 // half as much again as the Garden's mesa's
 heart(H,GB,G,HS,GS){if(!H||!GB)return{ok:false,detail:'no Heart'};const K=KSTACKS,wx=(B,S)=>{const C=K.make({id:'clean',kind:'butte',x:B.x,z:B.z,y0:B.y0,seed:S.seed,lobes:S.lobes,
   weather:0,shoulder:S.shoulder,bed:S.bed,tiers:[{h:B.top-B.y0,r:S.r,e:S.e,ry:S.ry}]});let d=0,m=0;
   for(let k=0;k<Math.min(B.beds.length,C.beds.length);k++)for(let i=0;i<72;i++){const a=i/72*TAU,r0=K.footR(C.beds[k],a);d+=Math.abs(K.footR(B.beds[k],a)-r0);m+=r0;}return d/m;};
  const rise=H.top-GB.top,on=G.filter(B=>B.kind==='spire'&&K.at([H],B.x,B.z)),ph=on.length?on.reduce((s,B)=>s+B.top-GB.top,0)/on.length:0,wh=wx(H,HS),wg=wx(GB,GS);
  return{ok:on.length>=3&&rise>.4*ph&&rise<.6*ph&&wh>wg*1.5,detail:'the Heart '+rise.toFixed(0)+' m over the Garden\'s mesa; '+on.length+' pinnacles on it, '+ph.toFixed(0)+
   ' m on average; weathered '+(wh*100).toFixed(1)+'% of its radius (the Garden\'s mesa '+(wg*100).toFixed(1)+'%)'};},
 // no tree on the top (the town's ground) past its 12 m rim band, except on the Garden's stacks
 noTrees(T){const on=T.filter(t=>{const S=KSTACKS.at(ROCK,t.x,t.z);return !!S&&TOWN_GROUND.indexOf(S.S)>=0&&S.d<=-12;});
  return{ok:on.length===0,detail:on.length+' trees on the town\'s ground ('+T.length+' trees on the page)'};},
 // the forest keeps out of the farms and the bands' grounds: no hyperjungle geometry inside the palisade or a hedge
 cleared(pts){let n=0,ex=null;for(const p of pts){const Z=PR.zoneAt(p[0],p[1]).zone;if(Z==='farms'||Z==='pasture'||Z==='camp'||Z==='hedged'||Z==='fair'){n++;ex=ex||Z;}}
  return{ok:n===0&&pts.length>1000,detail:n+' forest points in the farms or a band\'s ground'+(ex?' (first in '+ex+')':'')+' of '+pts.length+' sampled'};},
 // the land is the scale model's: the page's floor at the knoll's middle and edge against WORLD.H (42)
 model(){const d=[[0,0],[1800,0],[-1800,0],[0,1800],[0,-1500]].map(q=>Math.abs(floorH(q[0],q[1])-(WORLD.H(q[0],q[1])-WORLD_H0)));
  const wall=WORLD.H(0,-48000)-WORLD_H0;
  return{ok:Math.max(...d)<.01&&wall>2500,detail:'floor = the model ('+Math.max(...d).toFixed(3)+' m off); the Inner Wall '+wall.toFixed(0)+' m over the knoll 48 km north'};},
 // THE ROOSTS (P2). The decks: a stall deck on each Wing's fin (seven) and on the four ringed Garden pinnacles, a ring on
 // every fin; no rock standing on a deck (its inner edge, its middle, its outer edge) from its own stack or any other
 decks(D){const bad=[],K=KSTACKS;D.forEach(d=>{const own=ROCK.find(B=>B.id===d.stack),others=ROCK.filter(B=>B!==own&&B.top>d.y-2);
   for(let i=0;i<d.inner.length;i+=2){const a=d.inner[i],b=d.outer[i],pts=[a,[(a[0]+b[0])/2,(a[1]+b[1])/2],b];
    for(const p of pts){if(own&&K.topAt([own],p[0],p[1])>d.y-1||others.length&&K.topAt(others,p[0],p[1])>d.y-2){bad.push(d.id);return;}}}});
  const st=D.filter(d=>d.level==='stall'),wingFins=st.filter(d=>d.group!=='garden').length,garden=st.filter(d=>d.group==='garden').length,fins=new Set(D.filter(d=>/^fin-/.test(d.stack)).map(d=>d.stack)).size;
  return{ok:!bad.length&&wingFins===7&&garden===4&&fins===10,detail:st.length+' stall decks ('+wingFins+' on the Wings\' fins, '+garden+' in the Garden), '+(D.length-st.length)+' lookout rings; rings on '+fins+' fins'+(bad.length?'; rock on '+bad.slice(0,4).join(', '):'')};},
 // the stalls: every Wing has eight or more, the east fins (the Quetzal's) some; every perch's way out (150 m straight
 // out from its stall, the stall's width either side) has no rock within 10 m under the deck
 stalls(R){const K=KSTACKS,bad=[],by={};R.forEach(r=>{by[r.wing]=(by[r.wing]||0)+1;const tx=-r.oz,tz=r.ox;
   for(let e=4;e<=150&&bad.indexOf(r.id)<0;e+=6)for(const q of [-5.5,0,5.5]){const x=r.fx+r.ox*e+tx*q,z=r.fz+r.oz*e+tz*q;if(K.topAt(ROCK,x,z)>r.y-10){bad.push(r.id);break;}}});
  const east=R.filter(r=>/deck-fin-e/.test(r.plat)).length;
  return{ok:!bad.length&&(by.wingclaw||0)>=8&&(by.quetzal||0)>=8&&(by.nightwing||0)>=8&&east>=8,detail:R.length+' stalls: '+Object.keys(by).map(k=>k+' '+by[k]).join(', ')+'; '+east+' on the east fins'+(bad.length?'; blocked: '+bad.slice(0,4).join(', '):'')};},
 // the bridges: four, each between the stall decks of one group's fins, under 90 m, each end on its deck
 bridges(B,D){const bad=[];B.forEach(b=>{const da=D.find(d=>d.id===b.a.deck),db=D.find(d=>d.id===b.b.deck);
   if(!da||!db||da.group!==db.group||da.level!=='stall'||db.level!=='stall'){bad.push(b.id+' joins two groups');return;}
   if(b.L>90)bad.push(b.id+' '+b.L.toFixed(0)+' m');
   [[b.a,da],[b.b,db]].forEach(q=>{const p=q[0],d=q[1],a=Math.atan2(p.z-d.z,p.x-d.x),i=Math.round(((a/TAU*PRR.N)%PRR.N+PRR.N)%PRR.N)%PRR.N,r=Math.hypot(p.x-d.x,p.z-d.z);
    if(r>Math.hypot(d.outer[i][0]-d.x,d.outer[i][1]-d.z)+.5||r<Math.hypot(d.inner[i][0]-d.x,d.inner[i][1]-d.z))bad.push(b.id+' off its deck');});});
  return{ok:B.length===4&&!bad.length,detail:B.length+' bridges ('+B.map(b=>b.id.replace(/^bridge-/,'')+' '+b.L.toFixed(0)+' m').join(', ')+')'+(bad.length?'; '+bad.join(', '):'')};},
 // the lifts: the cable hangs 3 m or more clear of the wall all the way down, the landing on the ground under the tip
 lifts(L){const bad=[];L.forEach(l=>{if(l.clear<3)bad.push(l.id+' '+l.clear.toFixed(1)+' m off the wall');if(Math.abs(l.foot.y-terrainH(l.foot.x,l.foot.z))>1.5)bad.push(l.id+' landing off the ground');});
  return{ok:L.length===2&&!bad.length,detail:L.map(l=>l.id+': '+l.len.toFixed(0)+' m boom, '+l.clear.toFixed(1)+' m clear, '+(_top-l.foot.y).toFixed(0)+' m drop').join('; ')+(bad.length?'; '+bad.join(', '):'')};},
 // the Stair: from the top to the fair ground, gated at its head and its foot (owner, 2026-10-19: no middle gate), no flight steeper than 35 degrees, and ON THE ROCK AT
 // EVERY BED (owner, 2026-10-19: "check it is actually wrapping at each slice of the plateau"; "clips when there's an
 // overhang"), measured against the DRAWN rock (ROCKRAY), tread by tread: CLEAR (the walkway's middle out of the rock
 // .5, 1.3 and 2.1 m over the tread: no bed juts through it) and CARRIED (a cut tread's masonry meets the rock 2.7 m
 // under it, a gallery's bracket 3.6 m under it); every landing's slab clear over its middle and carried at both ends and
 // its middle; the head down the shoulder never over the drawn ledges. Reported bed by bed
 stair(S){if(!S)return{ok:false,detail:'no Stair'};const P=S.pts,g=S.ground,end=g[g.length-1],Z=PR.zoneAt(end[0],end[2]).zone,cx=MESA_B.x,cz=MESA_B.z;
  let steep=0;for(let i=S.shoulder;i+1<P.length;i++){const p=P[i],q=P[i+1],run=Math.hypot(q[0]-p[0],q[2]-p[2]);if(run>.05)steep=Math.max(steep,Math.abs(q[1]-p[1])/run);}
  let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9,y0=1e9,y1=-1e9;P.forEach(p=>{x0=Math.min(x0,p[0]);x1=Math.max(x1,p[0]);z0=Math.min(z0,p[2]);z1=Math.max(z1,p[2]);y0=Math.min(y0,p[1]);y1=Math.max(y1,p[1]);});
  const M=ROCKRAY.near(x0-40,x1+40,z0-40,z1+40,y0-12,y1+6);
  /* a point dr out from p along its ray from the mesa's middle (dy up), and the gap from there inward to the drawn rock
     (null: deeper in the rock than 8 m) */
  const G=(p,dr,dy)=>{const a=Math.atan2(p[2]-cz,p[0]-cx);return ROCKRAY.gap(M,p[0]+Math.cos(a)*dr,p[1]+(dy||0),p[2]+Math.sin(a)*dr,-Math.cos(a),-Math.sin(a));};
  const clipped=(p,h)=>{const a=Math.atan2(p[2]-cz,p[0]-cx);return ROCKRAY.inRock(M,p[0],p[1]+h,p[2],-Math.cos(a),-Math.sin(a));};   /* the walkway's middle h over the tread in the drawn rock */
  const offRock=v=>v!=null&&v>.1;
  const bedOf=y=>MESA_B.beds.findIndex(b=>y>=b.y&&y<b.y+b.h),passed=new Set(),loose=new Set(),why={clip:0,unsupported:0,bracket:0,landing:0,head:0};let worst=0;
  const flag=(bi,k,v)=>{loose.add(bi);why[k]++;if(v!=null&&isFinite(v))worst=Math.max(worst,Math.abs(v));};
  const lipR=P[S.shoulder-1][3];for(let i=0;i<S.shoulder;i++){const p=P[i];if(p[3]>lipR-1.6)continue;const u=ROCKRAY.under(M,p[0],p[1],p[2]);if(u!=null&&p[1]>u+.1)flag(bedOf(p[1]),'head',p[1]-u);}   /* the steps at the lip are the first flight's */
  for(let i=S.shoulder;i<P.length;i++){const p=P[i],k=p[4],bi=bedOf(p[1]-.25);if(bi<0)continue;passed.add(bi);
   for(const h of [.5,1.3,2.1]){if(clipped(p,h)){flag(bi,'clip',null);break;}}
   if(!(p[5]>0)){flag(bi,'unsupported',null);continue;}
   const v=Math.min(...[0,.3].map(dy=>G(p,p[5]-(k%2?.3:.2)-p[3],-(k%2?3.6:2.7)+dy)).map(x=>x==null?-1:x));
   if(v>.1)flag(bi,k%2?'bracket':'unsupported',v);}
  (S.slabs||[]).forEach(L=>{const bi=bedOf(L.y-.25),c=[cx+Math.cos(L.a)*(L.ends[1].inner+L.outer)/2,L.y,cz+Math.sin(L.a)*(L.ends[1].inner+L.outer)/2];
   for(const h of [.5,1.3,2.1]){if(clipped(c,h)){flag(bi,'landing',null);break;}}
   const f=[cx+Math.cos(L.a)*(L.rf-.2),L.y,cz+Math.sin(L.a)*(L.rf-.2)],vf=Math.min(...[0,.3].map(dy=>G(f,0,-3+dy)).map(x=>x==null?-1:x));if(!(L.rf>0)||vf>.1)flag(bi,'landing',vf);});
  const ok=Math.abs(P[0][1]-_top)<1.5&&(Z==='fair'||PR.inEll(end[0],end[2],PR.FAIR,15))&&S.gates.length===2&&steep<.7&&!loose.size;
  return{ok,detail:'from '+P[0][1].toFixed(0)+' m to the '+Z+'; '+S.flights+' flights, '+S.landings.length+' landings, '+S.gates.length+' gates; steepest '+(Math.atan(steep)*180/Math.PI).toFixed(0)+
   ' degrees; clear and carried on the drawn rock at '+(passed.size-[...loose].filter(b=>passed.has(b)).length)+' of the '+passed.size+' beds it passes'+
   (loose.size?' (fails at beds '+[...loose].slice(0,8).join(', ')+': '+Object.keys(why).filter(k=>why[k]).map(k=>why[k]+' '+k).join(', ')+'; worst '+worst.toFixed(2)+' m)':'')};},
 // THE GATES: every gate's posts, open leaves and lintel out of the drawn rock, at the heights they stand; a gate on a
 // landing with its leaves over the landing's platform (inside its span along the face and between its inner and outer
 // edges), so they open flat onto it and touch no stair
 gates(S){if(!S)return{ok:false,detail:'no Stair'};const cx=MESA_B.x,cz=MESA_B.z,bad=[];
  S.gates.forEach(G=>{const c=Math.cos(G.ry),s=Math.sin(G.ry),L=(a,h,b)=>[G.x+c*a+s*b,G.y+h,G.z-s*a+c*b],hw=G.w/2,pts=[];
   [-1,1].forEach(q=>{for(const h of [.3,2.4,4.4])pts.push(['post',L(q*(hw+.3),h,0)]);for(const b of [.4,.8,1.6])for(const h of [.3,1.8,3.4])pts.push(['leaf',L(q*(hw+.2)-q*.1*b/1.6,h,b)]);});
   pts.push(['lintel',L(-hw-.9,4.4,0)],['lintel',L(hw+.9,4.4,0)]);
   const M=ROCKRAY.near(G.x-30,G.x+30,G.z-30,G.z+30,G.y-10,G.y+10);
   pts.forEach(([what,p])=>{const dx=cx-p[0],dz=cz-p[2];if(ROCKRAY.inRock(M,p[0],p[1],p[2],dx,dz))bad.push(G.id+' '+what+' in the rock');});
   if(G.landing!=null){const Ld=S.slabs[G.landing];if(!Ld){bad.push(G.id+' no landing');return;}const E=Ld.ends,a0=Math.min(E[0].a,E[E.length-1].a),a1=Math.max(E[0].a,E[E.length-1].a),rin=Math.max(...E.map(e=>e.inner));
    pts.filter(q=>q[0]==='leaf').forEach(([w,p])=>{const a=Math.atan2(p[2]-cz,p[0]-cx),r=Math.hypot(p[0]-cx,p[2]-cz);if(a<a0-.001||a>a1+.001||r<rin-.05||r>Ld.outer+.05)bad.push(G.id+' leaf off its landing');});}});
  const u=[...new Set(bad)];return{ok:!u.length,detail:S.gates.length+' gates'+(u.length?': '+u.slice(0,6).join(', '):', clear of the rock')};},
 // THE LIFT ROAD: from the beast lift's landing to the palisade (the north-west gate), no steeper than 1 in 7 where it is
 // a road, through no band's ground nor the pond, and cleared: no plant of the rock's, nor anything of the forest within 6 m of the ground, on it (a crown beside it may overhang)
 road(Rd,L){if(!Rd||!L)return{ok:false,detail:'no lift road'};const P=Rd.pts,s=P[0],e=P[P.length-1];let g=0,through=null;
  for(let i=4;i<P.length;i++){const a=P[i-1],b=P[i],run=Math.hypot(b[0]-a[0],b[2]-a[2]);if(run>.5)g=Math.max(g,Math.abs(b[1]-a[1])/run);}
  P.forEach(p=>{const z=PR.zoneAt(p[0],p[2]).zone;if(!through&&(z==='pasture'||z==='camp'||z==='hedged'||z==='pond'))through=z;});
  const atGate=PR.PALISADE.some(q=>Math.hypot(q[0]-e[0],q[1]-e[2])<2),onIt=(x,z)=>{const wa=PR.wayAt(x,z,2);return wa&&wa.d<1;};
  const trees=(NECANYONS.TREES||[]).filter(t=>onIt(t.x,t.z)).length,forest=_forestPts(true).filter(p=>onIt(p[0],p[1])).length;
  return{ok:Math.hypot(s[0]-L.foot.x,s[2]-L.foot.z)<8&&atGate&&g<=1/7&&!through&&!trees&&!forest,
   detail:Math.round(P.length*3)+' m from the landing ('+s[1].toFixed(0)+' m) to the north-west gate ('+e[1].toFixed(0)+' m)'+(atGate?'':' (NOT at the palisade)')+', '+(Rd.benchEnd*3)+' m of it a bench on the slope; steepest 1 in '+(1/Math.max(g,1e-6)).toFixed(1)+
    (through?'; through the '+through:'')+'; '+trees+' plants and '+forest+' forest points on it'};},
 // the climbs: every deck has one, from the ground at its stack's foot (or the deck under it) to its own height, and each
 // ATTACHED, measured against the DRAWN rock (ROCKRAY): every tread's inner edge within .3 m of the drawn wall, every
 // bracket's foot on or in it; every deck's struts find rock under it
 climbs(C,D){const bad=[];let loose=0,all=0,feet=0,feetBad=0,worst=0,clip=0;D.forEach(d=>{const c=C.find(c=>c.deck===d.id);if(!c){bad.push(d.id+' no climb');return;}const P=c.pts,last=P[P.length-1],S=ROCK.find(B=>B.id===d.stack);
   if(Math.abs(last[1]-d.y)>.05)bad.push(d.id+' short');let st=0;for(let i=0;i+1<P.length;i++){const run=Math.hypot(P[i+1][0]-P[i][0],P[i+1][2]-P[i][2]);if(run>.05)st=Math.max(st,(P[i+1][1]-P[i][1])/run);}if(st>.66)bad.push(d.id+' steep');
   const M=ROCKRAY.near(S.x-S.R-10,S.x+S.R+10,S.z-S.R-10,S.z+S.R+10,S.y0-5,S.top+5);let l=0;
   P.forEach((p,i)=>{const q=P[Math.min(P.length-1,i+1)],r=P[Math.max(0,i-1)],tx=q[0]-r[0],tz=q[2]-r[2],tl=Math.hypot(tx,tz)||1;
    /* the inward side: the side of the tread nearer the stack's middle at that height */
    const cc=KSTACKS.ring(S,Math.min(p[1],S.top-.5),24);let mx=S.x,mz=S.z;if(cc){mx=0;mz=0;cc.forEach(v=>{mx+=v[0];mz+=v[1];});mx/=cc.length;mz/=cc.length;}
    let nx=tz/tl,nz=-tx/tl;if(nx*(mx-p[0])+nz*(mz-p[2])<0){nx=-nx;nz=-nz;}
    const gg=[-.2,-.5].map(dy=>ROCKRAY.gap(M,p[0]+nx*.9,p[1]+dy,p[2]+nz*.9,nx,nz)).map(v=>v==null?-1:v),gm=Math.min(...gg);all++;   /* the nearer of two heights: a ray through the seam between two beds' rows is not a gap */if(gm>.3&&!(i===0&&c.from!=='foot')){l++;loose++;worst=Math.max(worst,gm);}   /* a lookout's climb starts on the stall deck's walkway */
    /* never under rock: the tread's middle 1 m and 1.8 m over it out of the drawn rock */
    for(const h of [1,1.8]){if(ROCKRAY.inRock(M,p[0],p[1]+h,p[2],nx,nz)){clip++;break;}}
    if(p.length>=6){feet++;const gf=Math.min(...[0,.3].map(dy=>ROCKRAY.gap(M,p[3],p[4]+dy,p[5],mx-p[3],mz-p[5])).map(v=>v==null?-1:v));if(gf>.1)feetBad++;}});
   if(l)bad.push(d.id+' off the rock at '+l+' of '+P.length+' treads');
   const fe=(d.feet||[]).filter((f,i)=>i%3===0&&!(f[3]>0)).length;if(fe)bad.push(d.id+' '+fe+' struts on no rock');});
  if(feetBad)bad.push(feetBad+' climb brackets off the rock');if(clip)bad.push(clip+' climb treads under rock');
  return{ok:!bad.length,detail:C.length+' climbs for '+D.length+' decks, '+C.reduce((s,c)=>s+c.pts.length,0)+' steps, '+(all-loose)+' of '+all+' against the drawn rock'+(loose?' (worst '+worst.toFixed(2)+' m off)':'')+', '+(feet-feetBad)+' of '+feet+' brackets in it'+(bad.length?'; '+bad.slice(0,4).join(', '):'')};},
 // THE TOWN (P3a: core/city on the top). Every building on the cap rock, 12 m in from its rim and off the rock standing
 // on it (each footprint's corners and edges' middles under the mesa's own top: KSTACKS.at, the highest bed there); no two
 // footprints overlapping (oriented boxes, a separating axis); none reaching a street's carriageway (the exact-streets
 // rule); none in the Deep Root precinct or a band's ground (P3c, P3d), nor within 6 m of a lift's head, the Stair's head
 // gate or a climb's start; standing on the ground (within 2.5 m of the cap); the landmarks the plan names (the hall, the
 // shrine, each Wing's barracks, the toll house, the beast stage); and every trade the town carries with a building
 town(T){if(!T)return{ok:false,detail:'no town'};const L=T.lots,K=KSTACKS,KL=KCITY.lib,bad=[],TP=PR.TOP;
  const box=l=>{const c=Math.cos(l.ry),s=Math.sin(l.ry),u=[c,-s],v=[s,c],hw=l.w/2,hd=l.d/2;return {c:[l.x,l.z],u,v,hw,hd,C:[[-1,-1],[1,-1],[1,1],[-1,1]].map(q=>[l.x+u[0]*hw*q[0]+v[0]*hd*q[1],l.z+u[1]*hw*q[0]+v[1]*hd*q[1]])};};
  const B=L.map(box),ell=(E,x,z,p)=>((x-E.x)/(E.rx+p))**2+((z-E.z)/(E.rz+p))**2<1;
  // apart, or touching within 15 cm (core/city's clash counts two boxes that touch as apart, and a float's worth more)
  const sat=(a,b)=>{for(const ax of [a.u,a.v,b.u,b.v]){const pr=P=>P.map(q=>q[0]*ax[0]+q[1]*ax[1]),A=pr(a.C),Bq=pr(b.C);if(Math.max(...A)<=Math.min(...Bq)+.15||Math.max(...Bq)<=Math.min(...A)+.15)return false;}return true;};
  // the grid the overlap test buckets by (20 m)
  const G=new Map();B.forEach((b,i)=>{const r=Math.hypot(b.hw,b.hd);for(let gx=Math.floor((b.c[0]-r)/20);gx<=Math.floor((b.c[0]+r)/20);gx++)for(let gz=Math.floor((b.c[1]-r)/20);gz<=Math.floor((b.c[1]+r)/20);gz++){const k=gx+','+gz;(G.get(k)||G.set(k,[]).get(k)).push(i);}});
  let over=0,street=0,cap=0,res=0,nh=0,ground=0;const seen=new Set();
  G.forEach(list=>{for(let a=0;a<list.length;a++)for(let b=a+1;b<list.length;b++){const i=list[a],j=list[b],k=i<j?i+'|'+j:j+'|'+i;if(seen.has(k))continue;seen.add(k);
   if(sat(B[i],B[j])){over++;if(bad.length<8)bad.push('overlap '+(L[i].name||L[i].key)+' / '+(L[j].name||L[j].key));}}});
  const W=T.ways.map(w=>{const P=w.closed?w.pts.concat([w.pts[0]]):w.pts;let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9;P.forEach(q=>{x0=Math.min(x0,q[0]);x1=Math.max(x1,q[0]);z0=Math.min(z0,q[1]);z1=Math.max(z1,q[1]);});return {P,hw:w.w/2,x0,x1,z0,z1,tag:w.tag};});
  const heads=[];ROOST.lifts.forEach(l=>[l.root,l.capstan].forEach(q=>{if(q)heads.push([q.x,q.z]);}));ROOST.stair.gates.forEach(g=>{if(Math.abs(g.y-_top)<3)heads.push([g.x,g.z]);});
  ROOST.climbs.forEach(c=>{const q=c.pts[0];if(Math.abs(q[1]-_top)<3)heads.push([q[0],q[2]]);});
  B.forEach((b,i)=>{const l=L[i],r=Math.hypot(b.hw,b.hd),nm=l.name||l.key;
   // the carriageway: a square's own stalls and hall stand on their square, not a street
   for(const w of W){if(b.c[0]<w.x0-r-w.hw||b.c[0]>w.x1+r+w.hw||b.c[1]<w.z0-r-w.hw||b.c[1]>w.z1+r+w.hw)continue;let d=1e9;for(let k=1;k<w.P.length;k++)d=Math.min(d,KL.polySegDist(b.C,w.P[k-1],w.P[k]));
    if(d<w.hw-.05){street++;if(bad.length<8)bad.push(nm+' on '+(w.tag||'a street')+' ('+(w.hw-d).toFixed(1)+' m)');break;}}
   const pts=b.C.concat(b.C.map((q,k)=>{const n=b.C[(k+1)%4];return[(q[0]+n[0])/2,(q[1]+n[1])/2];}));
   if(pts.some(q=>{const a=K.at(ROCK,q[0],q[1]);return !a||a.S!==MESA_B||a.d>-PRT.RIM+.5||a.top<_top-5;})){cap++;if(bad.length<8)bad.push(nm+' off the cap (the rim band or the rock)');}
   if(pts.some(q=>ell(TP.precinct,q[0],q[1],0)||TP.camps.some(c=>ell(c,q[0],q[1],0)))){res++;if(bad.length<8)bad.push(nm+' in a reserved ground');}
   if(heads.some(hq=>KL.polySegDist(b.C,hq,hq)<6)){nh++;if(bad.length<8)bad.push(nm+' on a head');}
   if(Math.abs(l.y-T.h(l.x,l.z))>2.5){ground++;if(bad.length<8)bad.push(nm+' '+(l.y-T.h(l.x,l.z)).toFixed(1)+' m off the ground');}});
  const need=['hall','shrine','customs','stage'],roles=new Set(L.map(l=>l.role));need.forEach(r=>{if(!roles.has(r))bad.push('no '+r);});
  ['wingclaw','quetzal','nightwing'].forEach(w=>{if(!L.some(l=>l.role==='barracks'&&l.name&&l.name.indexOf(w)>=0))bad.push('no '+w+' barracks');});
  const tr=PRT.trades(CAT.TRADES,L),miss=tr.filter(t=>!t.n).map(t=>t.trade);if(miss.length)bad.push('no building for '+miss.slice(0,4).join(', '));
  const lots=L.filter(l=>!l.landmark).length,ok=!bad.length&&lots>=400;
  return{ok,detail:L.length+' buildings ('+(L.length-lots)+' landmarks), '+T.ways.length+' streets; '+tr.length+' trades carried'+
   (bad.length?': '+bad.slice(0,8).join('; '):'; no overlap, none on a street, off the rim band and the rock, the grounds and the heads clear')+(lots<400?'; only '+lots+' lots':'')};},
 // THE FARMS (P3b): six terraces of field cells inside the palisade, no two cells overlapping, every cell on farmland
 // (corners, edges' middles, centre: PR.zoneAt 'farms', so off the road, the fair ground, the ways, the pond and the
 // hedges), off the debris slope and the farm tracks; the orchards on the two outer terraces and only there; the paddies
 // by the spring; twelve farmhouses, each wholly in its cell; the palisade unbroken from where the debris slope rises at
 // one end to the other but at its gates and posts; the forest gate on the road and the north-west gate where the lift
 // road comes in; a track from each other gate in to the terrace way
 farms(F){if(!F)return{ok:false,detail:'no farms'};const bad=[],C=F.cells,SP=PR.SPRING;
  const sat=(A,B)=>{const ax=P=>P.map((a,j)=>{const b=P[(j+1)%P.length];return[-(b[1]-a[1]),b[0]-a[0]];});for(const n of ax(A).concat(ax(B))){const pr=P=>P.map(q=>q[0]*n[0]+q[1]*n[1]),a=pr(A),b=pr(B);
    if(Math.max(...a)<=Math.min(...b)+.05||Math.max(...b)<=Math.min(...a)+.05)return false;}return true;};
  const G=new Map();C.forEach((c,i)=>{const k=Math.floor(c.x/60)+','+Math.floor(c.z/60);(G.get(k)||G.set(k,[]).get(k)).push(i);});
  let over=0;C.forEach((c,i)=>{const gx=Math.floor(c.x/60),gz=Math.floor(c.z/60);for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++)(G.get((gx+a)+','+(gz+b))||[]).forEach(j=>{if(j>i&&sat(c.corners,C[j].corners)){over++;if(bad.length<8)bad.push('cells overlap: '+c.id+' / '+C[j].id);}});});
  const trackD=q=>{let d=1e9;F.tracks.forEach(T=>{for(let i=1;i<T.pts.length;i++){const a=T.pts[i-1],b=T.pts[i],dx=b[0]-a[0],dz=b[1]-a[1],L2=Math.max(1e-9,dx*dx+dz*dz),t=Math.max(0,Math.min(1,((q[0]-a[0])*dx+(q[1]-a[1])*dz)/L2));d=Math.min(d,Math.hypot(q[0]-a[0]-dx*t,q[1]-a[1]-dz*t)-T.w/2);}});return d;};
  let off=0;C.forEach(c=>{const Q=c.corners,pts=Q.concat(Q.map((q,j)=>[(q[0]+Q[(j+1)%4][0])/2,(q[1]+Q[(j+1)%4][1])/2]),[[c.x,c.z]]);
   const why=pts.map(q=>{const z=PR.zoneAt(q[0],q[1]).zone;return z!=='farms'?'on the '+z:groundH(q[0],q[1])-floorH(q[0],q[1])>.6?'on the debris slope':trackD(q)<.5?'on a track':null;}).find(Boolean);
   if(why){off++;if(bad.length<8)bad.push(c.id+' '+why);}});
  const per=[0,0,0,0,0,0];C.forEach(c=>per[c.k]++);per.forEach((n,k)=>{if(n<20)bad.push('terrace '+(k+1)+' has '+n+' cells');});
  C.forEach(c=>{if((c.kind==='orchard')!==(c.k>=4)&&c.kind!=='farmstead'&&bad.length<12)bad.push(c.id+(c.kind==='orchard'?' an orchard on terrace '+(c.k+1):' not an orchard on terrace '+(c.k+1)));});
  const pad=C.filter(c=>c.kind==='paddy');if(pad.length<10)bad.push('only '+pad.length+' paddies');pad.forEach(c=>{if(Math.hypot(c.x-SP.x,c.z-SP.z)>300&&bad.length<12)bad.push(c.id+' a paddy '+Math.round(Math.hypot(c.x-SP.x,c.z-SP.z))+' m from the spring');});
  // the farmhouses: twelve, each wholly in its cell (its footprint's corners inside the cell's quad), none overlapping
  const inQ=(q,Q)=>{let sg=0;for(let j=0;j<4;j++){const a=Q[j],b=Q[(j+1)%4],cr=(b[0]-a[0])*(q[1]-a[1])-(b[1]-a[1])*(q[0]-a[0]);if(Math.abs(cr)<1e-6)continue;if(!sg)sg=Math.sign(cr);else if(Math.sign(cr)!==sg)return false;}return true;};
  const fp=h=>{const u=[Math.cos(h.ry),-Math.sin(h.ry)],v=[Math.sin(h.ry),Math.cos(h.ry)];return[[-1,-1],[1,-1],[1,1],[-1,1]].map(q=>[h.x+u[0]*h.w/2*q[0]+v[0]*h.d/2*q[1],h.z+u[1]*h.w/2*q[0]+v[1]*h.d/2*q[1]]);};
  if(F.houses.length!==12)bad.push(F.houses.length+' farmhouses');
  F.houses.forEach((h,i)=>{const c=C.find(c=>c.id===h.cell);if(!c||!fp(h).every(q=>inQ(q,c.corners)))bad.push(h.id+' not wholly in its cell');
   F.houses.forEach((h2,j)=>{if(j>i&&sat(fp(h),fp(h2)))bad.push(h.id+' overlaps '+h2.id);});});
  // the palisade: its runs and pieces cover the line from end to end, no gap over 2 m
  const P=F.palisade,iv=P.runs.map(r=>[r.s0,r.s1]).concat(P.gates.concat(P.posts).map(g=>[g.s-g.w/2,g.s+g.w/2])).sort((a,b)=>a[0]-b[0]);
  let reach=P.s0,gap=0;iv.forEach(q=>{if(q[0]>reach+2){gap++;if(bad.length<12)bad.push('a gap in the palisade at '+Math.round(reach)+'-'+Math.round(q[0])+' m');}reach=Math.max(reach,q[1]);});
  if(reach<P.s1-2)bad.push('the palisade stops '+Math.round(P.s1-reach)+' m short');
  const fg=P.gates.find(g=>g.road),nw=P.gates.find(g=>/north-west/.test(g.name));
  if(!fg||Math.hypot(fg.x-PR.GATE.x,fg.z-PR.GATE.z)>8)bad.push('no forest gate on the road');
  const Rd=(ROOST.roads||[])[0],re=Rd?Rd.pts[Rd.pts.length-1]:null;if(!nw||!re||Math.hypot(nw.x-re[0],nw.z-re[2])>10)bad.push('no north-west gate where the lift road comes in');
  P.gates.filter(g=>!g.road).forEach(g=>{if(!F.tracks.some(T=>T.pts.some(q=>Math.hypot(q[0]-g.x,q[1]-g.z)<14)))bad.push('no track to '+g.name);});
  if(!F.tracks.some(T=>/terrace way/.test(T.name)))bad.push('no terrace way');
  const by={};C.forEach(c=>by[c.kind]=(by[c.kind]||0)+1);
  return{ok:!bad.length,detail:C.length+' cells on '+per.filter(Boolean).length+' terraces ('+Object.keys(by).map(k=>by[k]+' '+k).join(', ')+'), '+F.houses.length+' farmhouses, '+P.gates.length+' gates, '+P.posts.length+' posts'+
   (bad.length?': '+bad.slice(0,8).join('; '):'; no overlap, all on farmland, the palisade unbroken')};},
 // THE BANDS' GROUNDS (P3c): a ground for each tribe as the kit's table has it (BR_CAMP: the flyers' only on the top, the
 // Dragonfly's, the Spider's and the Mammoth's only on the floor), every tent and pen it names pitched, no two overlapping,
 // each inside its ground (the top's on the cap 12 m in from the rim and off the rock; the floor's tents in the camp,
 // its pens in the hedge), none on a town lot or street; every hedge closed (its pieces end to end) with its two gates,
 // every pasture's fence with its gate; a banner on every ground; a track from every floor camp to a palisade gate,
 // through no farm and no other band's hedge
 camps(Cm){if(!Cm)return{ok:false,detail:'no camps'};const bad=[],G=Cm.grounds,K=KSTACKS,TOP=_top,ON=ROCK.filter(B=>B!==MESA_B&&Math.abs(B.y0-(TOP-1))<4);
  const want=[];CAT.CAMP&&Object.keys(CAT.CAMP).forEach(t=>Object.keys(CAT.CAMP[t].grounds).forEach(gr=>want.push(t+'/'+gr)));
  const have=G.map(g=>g.tribe+'/'+g.ground);want.forEach(w=>{if(have.indexOf(w)<0)bad.push('no '+w+' ground');});have.forEach(h=>{if(want.indexOf(h)<0)bad.push(h+': not in BR_CAMP');});
  const box=it=>{const c=Math.cos(it.ry),sn=Math.sin(it.ry),u=[c,-sn],v=[sn,c];return {u,v,C:[[-1,-1],[1,-1],[1,1],[-1,1]].map(q=>[it.x+u[0]*it.w/2*q[0]+v[0]*it.d/2*q[1],it.z+u[1]*it.w/2*q[0]+v[1]*it.d/2*q[1]])};};
  const sat=(a,b)=>{for(const ax of [a.u,a.v,b.u,b.v]){const pr=P=>P.map(q=>q[0]*ax[0]+q[1]*ax[1]),A=pr(a.C),B2=pr(b.C);if(Math.max(...A)<=Math.min(...B2)+.15||Math.max(...B2)<=Math.min(...A)+.15)return false;}return true;};
  const all=[];G.forEach(g=>g.items.forEach(it=>all.push({g,it,b:box(it)})));
  const inE=(E,q,k)=>((q[0]-E.x)/(E.rx*k))**2+((q[1]-E.z)/(E.rz*k))**2<=1;
  const tl=TOWN?TOWN.lots.map(box):[];
  G.forEach(g=>{const T=CAT.CAMP[g.tribe],gr=T&&T.grounds[g.ground];if(gr){const n=gr.tents.concat(gr.pens).reduce((s,e)=>s+e.n,0);if(g.items.length!==n)bad.push(g.tribe+'/'+g.ground+' '+g.items.length+' of '+n+' pitched');
    if(!g.items.some(it=>/chief/.test(it.key)))bad.push(g.tribe+'/'+g.ground+' no chief');}
   if(!g.banner)bad.push(g.tribe+'/'+g.ground+' no banner');});
  for(let i=0;i<all.length;i++)for(let j=i+1;j<all.length;j++){const A=all[i],B=all[j];if(Math.hypot(A.it.x-B.it.x,A.it.z-B.it.z)>60)continue;if(sat(A.b,B.b)&&bad.length<10)bad.push('overlap: '+A.it.name+' / '+B.it.name);}
  all.forEach(({g,it,b})=>{const pts=b.C.concat([[it.x,it.z]]);
   if(g.ground==='upper'){if(pts.some(q=>{const a=K.at(ROCK,q[0],q[1]);if(!a||a.S!==MESA_B||a.d>-11.5||a.top<TOP-5)return true;const f=K.foot(ON,q[0],q[1]);return f&&f.d<5.5;})&&bad.length<12)bad.push(it.name+' off the cap or on the rock');
    if(!pts.every(q=>inE(g.ell,q,1.02))&&bad.length<12)bad.push(it.name+' out of its ground');
    if(tl.some(t=>Math.hypot(t.C[0][0]-it.x,t.C[0][1]-it.z)<60&&sat(t,b))&&bad.length<12)bad.push(it.name+' on a town lot');}
   else{const i2=PR.CAMPS.findIndex(c=>c.tribe===g.tribe),H=PR.HEDGES[i2];if(H&&!pts.every(q=>PR.inPoly(q[0],q[1],H.pts))&&bad.length<12)bad.push(it.name+' out of its hedge');}});
  if(TOWN){const W=TOWN.ways;all.filter(a=>a.g.ground==='upper').forEach(({it,b})=>{for(const w of W){const P=w.closed?w.pts.concat([w.pts[0]]):w.pts;for(let k=1;k<P.length;k++){if(KCITY.lib.polySegDist(b.C,P[k-1],P[k])<w.w/2-.05){if(bad.length<12)bad.push(it.name+' on '+(w.tag||'a street'));return;}}}});}
  // the hedges and fences: closed, with their gates
  G.filter(g=>g.ground==='lower').forEach(g=>{[['hedge',g.hedge,2],['fence',g.fence,1]].forEach(([nm,P,ng])=>{if(!P.length){if(nm==='hedge')bad.push(g.tribe+' no hedge');return;}
    const ends=P.map(p=>{const ux=Math.cos(p.ry),uz=-Math.sin(p.ry);return [[p.x-ux*p.span/2,p.z-uz*p.span/2],[p.x+ux*p.span/2,p.z+uz*p.span/2]];});
    let gap=0;ends.forEach((e,k)=>{const n=ends[(k+1)%ends.length];if(Math.hypot(e[1][0]-n[0][0],e[1][1]-n[0][1])>.5)gap++;});
    if(gap)bad.push(g.tribe+' '+nm+': '+gap+' gaps');const gs=P.filter(p=>p.v===1).length;if(gs!==ng)bad.push(g.tribe+' '+nm+': '+gs+' gates (want '+ng+')');});
   if(!g.track)bad.push(g.tribe+' no track');else{const P=g.track.pts;const e0=P[P.length-1];if(P.some(q=>Math.hypot(q[0]-e0[0],q[1]-e0[1])>4&&PR.inFarms(q[0],q[1])))bad.push(g.track.name+' through the farms');
    const end=P[P.length-1];if(!FARMS||!FARMS.palisade.gates.some(G2=>Math.hypot(G2.x-end[0],G2.z-end[1])<3))bad.push(g.track.name+' does not reach a gate');
    PR.HEDGES.forEach((H,k)=>{if(PR.CAMPS[k].tribe===g.tribe)return;if(P.some(q=>PR.inPoly(q[0],q[1],H.pts))&&bad.length<14)bad.push(g.track.name+' through the '+PR.CAMPS[k].tribe+' hedge');});}});
  const up=G.filter(g=>g.ground==='upper').length,lo=G.length-up;
  return{ok:!bad.length,detail:G.length+' grounds ('+up+' on the top, '+lo+' on the floor), '+all.length+' tents and pens'+(bad.length?': '+bad.slice(0,8).join('; '):'; every one pitched, apart, in its ground; the hedges closed, the gates and tracks there')};},
 // EACH WING'S BEASTS IN ITS OWN STALLS (owner, 2026-10-19): every beast on a perch, or coming in to one, is one its bay
 // takes (the Quetzal's quetzalcoatlus, the Wingclaw's archaeopteryx, the Nightwing's bats; the Garden the three)
 wings(list){if(!PRFLY)return{ok:false,detail:'no flyers'};const L=PRFLY.LABEL,bad=list.filter(a=>a.bay&&a.bay.allow&&a.bay.allow.indexOf(a.sp)<0),by={};
  list.forEach(a=>{if(!a.bay||!a.bay.plat)return;const w=a.bay.plat.wing||'?',k=w+': '+L[a.sp];by[k]=(by[k]||0)+1;});
  return{ok:!bad.length&&list.filter(a=>a.bay).length>20,detail:Object.keys(by).sort().map(k=>k+' '+by[k]).join(', ')+(bad.length?'; WRONG: '+bad.slice(0,4).map(a=>L[a.sp]+' in '+a.bay.id).join(', '):'')};},
 // the flyers (Girder's, on these roosts): a quetzal sent in from 300 m out lands on an east fin's perch (P2's test), and
 // in a minute and a half of traffic no beast aloft passes through the rock
 flyers(decks){if(!PRFLY)return{ok:false,detail:'no flyers'};const F=PRFLY,sent=[];
  decks.forEach(id=>{const a=F.land(id,F.SP.Q,12);if(a)sent.push(a);});
  let inRock=0,samples=0;for(let k=0;k<180;k++){F.sim(.5,12);for(const a of F.list()){if(a.state!=='fly')continue;samples++;if(KSTACKS.topAt(ROCK,a.x,a.z)>a.y+.5)inRock++;}}
  const landed=sent.filter(a=>a.state==='perch'&&a.bay&&/deck-fin-e/.test(a.bay.plat.id)),S=F.stats();
  return{ok:landed.length>=1&&inRock===0&&S.usable>=60,detail:sent.length+' quetzals sent to the east fins, '+landed.length+' on a perch; '+S.usable+' of '+(S.bays.ok+S.bays.blocked)+' bays in use; '+
   S.animals+' beasts, '+S.totals.arrivals+' arrivals and '+S.totals.departures+' departures so far; '+inRock+' of '+samples+' samples aloft in the rock'};}};
// where the forest STANDS, sampled: the hyperjungle's instances (every 7th) and its merged meshes' vertices within 4 m of the
// ground (a trunk's foot, a fern: a crown leaning over a hedge is not the forest inside it)
function _forestPts(low){const out=[],v=new THREE.Vector3(),M=new THREE.Matrix4();   /* low: only what stands within 6 m of the ground (not a crown overhanging) */
 scene.traverse(o=>{if(!o.userData||o.userData.kit!=='hyperjungle')return;
  if(o.isInstancedMesh){for(let i=0;i<o.count;i+=low?1:7){o.getMatrixAt(i,M);v.setFromMatrixPosition(M);if(!low||v.y-terrainH(v.x,v.z)<6)out.push([v.x,v.z]);}}
  else if(o.isMesh&&o.geometry&&o.geometry.attributes.position){const P=o.geometry.attributes.position;
   for(let i=0;i<P.count;i+=13){v.fromBufferAttribute(P,i).applyMatrix4(o.matrixWorld);if(v.y-terrainH(v.x,v.z)<4)out.push([v.x,v.z]);}}});
 return out;}
const _fins=()=>ROCK.filter(B=>/^fin-/.test(B.id)),_garden=()=>ROCK.filter(B=>/^garden-/.test(B.id));
function hostChecks(){const R=[],add=(name,r)=>R.push(Object.assign({name},r));
 add('the mesa: 250 m, 1.2 by 0.8 km',HCHK.mesa(MESA_B));
 add('ten fins on the rim, spread round it',HCHK.fins(_fins()));
 add('the Garden\'s mesa and its pinnacles',HCHK.garden(_garden(),GARDEN_B));
 add('the Heart: a third mesa, half the pinnacles\' height, the most weathered',HCHK.heart(HEART_B,GARDEN_B,_garden(),PR.HEART_MESA,PR.GARDEN_MESA));
 add('no tree on the town\'s ground',HCHK.noTrees(NECANYONS.TREES||[]));
 add('the forest out of the farms and the grounds',HCHK.cleared(_forestPts()));
 add('the land is the scale model\'s',HCHK.model());
 add('the roost decks: on the Wings\' fins and the Garden, clear of the rock',HCHK.decks(ROOST.decks));
 add('the stalls: every Wing\'s, each with its way out open',HCHK.stalls(ROOST.roosts));
 add('the bridges between a group\'s fins',HCHK.bridges(ROOST.bridges,ROOST.decks));
 add('the lifts: the cables clear of the wall',HCHK.lifts(ROOST.lifts));
 add('the Stair: the top to the fair ground, gated at head and foot',HCHK.stair(ROOST.stair));
 add('a climb to every deck',HCHK.climbs(ROOST.climbs,ROOST.decks));
 add('the flyers: a quetzal lands on an east fin',HCHK.flyers(['deck-fin-e0','deck-fin-e1','deck-fin-e2']));
 add('each Wing\'s beasts in its own stalls',HCHK.wings(PRFLY?PRFLY.list():[]));
 add('the gates: clear of the rock',HCHK.gates(ROOST.stair));
 add('the town on the top: every building on the cap, apart, off the streets; every trade',HCHK.town(TOWN));
 add('the farms: six terraces of fields, twelve farmhouses, the palisade and its gates',HCHK.farms(FARMS));
 add('the bands\' grounds: every tribe\'s, pitched, hedged, with its track',HCHK.camps(CAMPS));
 add('the lift road: the beast lift to the north-west gate, cleared',HCHK.road((ROOST.roads||[])[0],ROOST.lifts.find(l=>l.id==='lift-north')));
 return R;}
function hostNegatives(){const R=[],add=(name,r)=>R.push({name,failed:!r.ok,detail:r.detail}),F=_fins();
 add('the fins in one row on the north rim (as first drawn)',HCHK.fins(F.map((B,i)=>Object.assign({},B,{x:-270+i*60,z:-520}))));
 add('a fin over the edge',HCHK.fins(F.map((B,i)=>i?B:Object.assign({},B,{beds:[Object.assign({},B.beds[0],{cx:B.beds[0].cx*1.25,cz:B.beds[0].cz*1.25})]}))));
 add('a mesa 180 m high',HCHK.mesa(Object.assign({},MESA_B,{top:MESA_B.top-70})));
 add('the Garden all one height (no taller centre)',HCHK.garden(_garden().map(B=>Object.assign({},B,{top:B.y0+60})),GARDEN_B));
 add('no Garden\'s mesa (the pinnacles on the main top)',HCHK.garden(_garden(),null));
 add('no Heart',HCHK.heart(null,GARDEN_B,_garden(),PR.HEART_MESA,PR.GARDEN_MESA));
 add('a Heart as weathered as the Garden\'s mesa',HCHK.heart(Object.assign({},HEART_B,{beds:KSTACKS.make({id:'x',kind:'butte',x:HEART_B.x,z:HEART_B.z,y0:HEART_B.y0,seed:PR.HEART_MESA.seed,
  lobes:PR.HEART_MESA.lobes,weather:PR.GARDEN_MESA.weather,shoulder:PR.HEART_MESA.shoulder,bed:PR.HEART_MESA.bed,tiers:[{h:HEART_B.top-HEART_B.y0,r:PR.HEART_MESA.r,e:PR.HEART_MESA.e}]}).beds}),GARDEN_B,_garden(),PR.HEART_MESA,PR.GARDEN_MESA));
 add('a Heart as tall as its pinnacles',HCHK.heart(Object.assign({},HEART_B,{top:HEART_B.top+110}),GARDEN_B,_garden(),PR.HEART_MESA,PR.GARDEN_MESA));
 add('a tree in the Crown',HCHK.noTrees((NECANYONS.TREES||[]).concat([{x:0,z:-300,y0:_top}])));
 add('a tree in the farms',HCHK.cleared(_forestPts().concat([[-400,800]])));   // in the fields west of the road
 // the roosts' negatives
 {const d=ROOST.decks.find(d=>d.id==='deck-fin-e1');if(d)add('a deck cut into its fin (its inner edge 3 m into the rock)',HCHK.decks(ROOST.decks.map(D=>D!==d?D:Object.assign({},D,{inner:D.inner.map(p=>{const dx=p[0]-D.x,dz=p[1]-D.z,l=Math.hypot(dx,dz);return [p[0]-dx/l*3.8,p[1]-dz/l*3.8];})}))));}
 add('a perch facing its own fin',HCHK.stalls(ROOST.roosts.map((r,i)=>i?r:Object.assign({},r,{ox:-r.ox,oz:-r.oz}))));
 {const n0=ROOST.decks.find(d=>d.id==='deck-fin-n0'),e0=ROOST.decks.find(d=>d.id==='deck-fin-e0');
  if(n0&&e0)add('a bridge from the north fins to the east',HCHK.bridges(ROOST.bridges.map((b,i)=>i?b:Object.assign({},b,{b:{x:e0.outer[0][0],y:e0.y,z:e0.outer[0][1],deck:e0.id}})),ROOST.decks));}
 add('a lift whose cable rubs the wall',HCHK.lifts(ROOST.lifts.map((l,i)=>i?l:Object.assign({},l,{clear:l.clear-6}))));
 add('the Stair with one gate',HCHK.stair(Object.assign({},ROOST.stair,{gates:ROOST.stair.gates.slice(1)})));
 add('the Stair ending in the gorge',HCHK.stair(Object.assign({},ROOST.stair,{ground:ROOST.stair.ground.concat([[0,0,PR.GORGE.z(0)]])})));
 add('a deck with no climb',HCHK.climbs(ROOST.climbs.slice(1),ROOST.decks));
 add('a quetzal sent to a lookout ring (no stalls)',HCHK.flyers(['deck-fin-ne-look']));
 {const S=ROOST.stair;add('the Stair\'s flights 4 m out from the face',HCHK.stair(Object.assign({},S,{pts:S.pts.map((p,i)=>i<S.shoulder?p:[p[0]+(p[0]-MESA_B.x)/p[3]*4,p[1],p[2]+(p[2]-MESA_B.z)/p[3]*4,p[3]+4,p[4],p[5]-1e3])})));}
 {const c0=ROOST.climbs[0];add('a climb 3 m out from its fin',HCHK.climbs(ROOST.climbs.map(c=>c!==c0?c:Object.assign({},c,{pts:c.pts.map(p=>{const S=ROCK.find(B=>'deck-'+B.id===c.deck),dx=p[0]-S.x,dz=p[2]-S.z,L=Math.hypot(dx,dz)||1;return [p[0]+dx/L*3,p[1],p[2]+dz/L*3];})})),ROOST.decks));}
 if(PRFLY){const B=PRFLY.bays.find(b=>b.plat.wing==='quetzal');add('an archaeopteryx in a Quetzal stall',HCHK.wings(PRFLY.list().concat([{sp:PRFLY.SP.A,bay:B}])));}
 add('a gate in the rock (the head gate sunk 3 m into the cap rock)',HCHK.gates(Object.assign({},ROOST.stair,{gates:ROOST.stair.gates.map((g,i)=>i?g:Object.assign({},g,{y:g.y-3}))})));
 if(TOWN){const T=TOWN,i=T.lots.findIndex(l=>!l.landmark),L0=T.lots[i],mv=(f)=>Object.assign({},T,{lots:T.lots.map((l,k)=>k===i?Object.assign({},l,f(l)):l)});
  const Wy=T.ways.find(w=>w.cls==='avenue'),q=Wy.pts[Math.floor(Wy.pts.length/2)],cg=PR.TOP.camps[0],cp=TOWN.cap[0];
  add('a house on an avenue',HCHK.town(mv(()=>({x:q[0],z:q[1]}))));
  add('a house in the Wingclaw band\'s ground',HCHK.town(mv(()=>({x:cg.x,z:cg.z}))));
  add('a house on the rim',HCHK.town(mv(()=>({x:cp[0]*.985,z:cp[1]*.985}))));
  add('two houses on one footprint',HCHK.town(Object.assign({},T,{lots:T.lots.concat([Object.assign({},L0,{x:L0.x+1,id:L0.id+'b'})])})));
  add('no assembly hall',HCHK.town(Object.assign({},T,{lots:T.lots.filter(l=>l.role!=='hall')})));
  add('no tannery (the tanners without a building)',HCHK.town(Object.assign({},T,{lots:T.lots.filter(l=>l.key!=='br_bldg_tannery')})));}
 if(FARMS){const F=FARMS,c0=F.cells.find(c=>c.k===1&&c.kind==='crop'),or=F.cells.find(c=>c.k===0&&c.kind!=='farmstead'),h0=F.houses[0];
  const mvCell=(c,dx,dz)=>Object.assign({},F,{cells:F.cells.map(x=>x!==c?x:Object.assign({},x,{x:x.x+dx,z:x.z+dz,corners:x.corners.map(q=>[q[0]+dx,q[1]+dz])}))});
  if(c0){const q=PR.ROAD.pts[1];add('a field on the forest road',HCHK.farms(mvCell(c0,q[0]-c0.x,q[1]-c0.z)));}
  if(or)add('an orchard on the first terrace',HCHK.farms(Object.assign({},F,{cells:F.cells.map(x=>x!==or?x:Object.assign({},x,{kind:'orchard'}))})));
  if(h0)add('a farmhouse half off its cell',HCHK.farms(Object.assign({},F,{houses:F.houses.map(h=>h!==h0?h:Object.assign({},h,{x:h.x+16}))})));
  add('a gap in the palisade',HCHK.farms(Object.assign({},F,{palisade:Object.assign({},F.palisade,{runs:F.palisade.runs.filter((r,i)=>i!==1)})})));
  add('no forest gate',HCHK.farms(Object.assign({},F,{palisade:Object.assign({},F.palisade,{gates:F.palisade.gates.filter(g=>!g.road)})})));
  {const pd=F.cells.find(c=>c.kind==='paddy');if(pd)add('a paddy by the east gate',HCHK.farms(Object.assign({},F,{cells:F.cells.map(x=>x.k===1&&x.kind==='crop'&&x.g<40?Object.assign({},x,{kind:'paddy'}):x)})));}}
 if(CAMPS){const C=CAMPS,mv=(f)=>Object.assign({},C,{grounds:C.grounds.map(f)}),up=C.grounds.find(g=>g.ground==='upper'),lo=C.grounds.find(g=>g.ground==='lower');
  if(up)add('a tent in the Crown',HCHK.camps(mv(g=>g!==up?g:Object.assign({},g,{items:g.items.map((it,i)=>i?it:Object.assign({},it,{x:0,z:-330}))}))));
  if(lo)add('a gap in a thorn hedge',HCHK.camps(mv(g=>g!==lo?g:Object.assign({},g,{hedge:g.hedge.filter((p,i)=>i<5||i>8)}))));
  if(lo)add('a hedge with no gates',HCHK.camps(mv(g=>g!==lo?g:Object.assign({},g,{hedge:g.hedge.map(p=>Object.assign({},p,{v:0}))}))));
  if(up)add('a band\'s ground without its chief',HCHK.camps(mv(g=>g!==up?g:Object.assign({},g,{items:g.items.filter(it=>!/chief/.test(it.key))}))));
  if(lo&&lo.track)add('a camp\'s track through the farms',HCHK.camps(mv(g=>g!==lo?g:Object.assign({},g,{track:Object.assign({},g.track,{pts:[[0,900]].concat(g.track.pts)})}))));
  add('a flyer band camped on the floor',HCHK.camps(Object.assign({},C,{grounds:C.grounds.concat([Object.assign({},lo,{tribe:'quetzal'})])})));}
 {const Rd=(ROOST.roads||[])[0];if(Rd)add('the lift road through the seep pond',HCHK.road(Object.assign({},Rd,{pts:Rd.pts.concat([[PR.POND.x,0,PR.POND.z]])}),ROOST.lifts.find(l=>l.id==='lift-north')));}
 return R;}

// ---------------------------------------------------------------- the page, handed to the host
window._registered=REG.length;
KHOST.take({build:'pinnacle-rock',title:'Pinnacle Rock',
 hint:'Pinnacle Rock: the Beast Riders\' roost town on a red sandstone mesa (the rock, the roosts, the town on the top, the farms and the bands\' grounds)',
 scene,camera,renderer,ground:terrainH,clear:1.8,registry:REG,views:VIEWS,ticks:TICKS,
 hourTicks:[(dt,hour)=>{if(PRFLY)PRFLY.update(dt,hour);}],   // Girder's flyers on the roosts (89b, build.py flyers_fragment)
 sky:{follow(c){sky.position.copy(c.position);giant.position.copy(c.position).addScaledVector(giantDir,GIANT_DIST);giantRing.position.copy(giant.position);}},
 inspect:describe,stats:()=>'inst '+window._instances,
 layers:{'flora and fauna':{match:o=>!!(o.userData&&o.userData.biome)},'the rock':{match:o=>!!(o.userData&&o.userData.rock)},
  'the roosts':{match:o=>!!(o.userData&&o.userData.roost)},'the town':{match:o=>!!(o.userData&&o.userData.town)},'the farms':{match:o=>!!(o.userData&&o.userData.farms)},'the camps':{match:o=>!!(o.userData&&o.userData.camps)},'the flyers':{match:o=>!!(o.userData&&o.userData.flyers)},
  'the far land':{match:o=>!!(o.userData&&o.userData.far)},'sky':{objects:()=>[sky,giant,giantRing]}},
 exporters:{biome:()=>BIO.export(),layout:()=>({rock:KSTACKS.export(ROCK),plan:PR,roosts:ROOST,town:TOWN?TOWN.K.export():null,farms:FARMS?{terraces:FARMS.terraces,cells:FARMS.cells,houses:FARMS.houses,palisade:FARMS.palisade,tracks:FARMS.tracks}:null,camps:CAMPS?{grounds:CAMPS.grounds,tracks:CAMPS.tracks}:null})},
 budget:BUDGET,types:()=>BIO.stats,
 api:{hostChecks,hostNegatives,
  get totals(){const t=BIO.totals();return {tris:t.tris,inst:t.inst,meshes:t.meshes,registered:REG.length,types:Object.keys(BIO.stats).length};},
  biome:()=>window._biome,jungle:()=>window._jungle,far:()=>({rings:FAR.rings,around:FAR.around,water:FAR.water}),
  town:()=>TOWN?{ms:TOWN.ms,lots:TOWN.lots.length,ways:TOWN.ways.length,log:TOWN.log,failed:TOWN.failed,missing:TOWN.missing,trades:TOWN.trades,draw:TOWN_DRAW}:null,
  farms:()=>FARMS?{ms:FARMS.ms,cells:FARMS.cells.length,houses:FARMS.houses.length,log:FARMS.log,draw:FARMS_DRAW}:null,
  camps:()=>CAMPS?{ms:CAMPS.ms,log:CAMPS.log,draw:CAMPS_DRAW}:null,
  roosts:()=>({ms:ROOST.ms,decks:ROOST.decks.length,stalls:ROOST.roosts.length,bridges:ROOST.bridges.length,lifts:ROOST.lifts.length,climbs:ROOST.climbs.length,why:ROOST.why})}});
