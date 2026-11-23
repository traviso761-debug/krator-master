// ================================================================= HOST — STATION 2: THE WEAVE-STEP'S WAYSTATION, ITS DANGERS, CHECKS AND VIEWS
// THE WAYSTATION (PLAN.md section 5: the Yuni road crosses the Loom from the Cradle to the chasms and Mungo; the station record: "a fortified
// waystation on the caravan road, windbreak palisades"). An NPC stop, Yuni-built, here as RECORDS FIRST: plain data, one per building or piece,
// each with its culture, role, kit key and box, keyed by a stable id, registered in core/tags before anything is drawn, then drawn as STAND-INS AT
// THEIR BOXES. Every record is `pending` (core/hamlet's word): the Yuni kit's buildings draw through the Yuni engine, which this page does not
// carry, and core/hamlet has no `trade` focus for a waystation (the Great Chasm's post is laid the same way, by hand). Laid on the pad (44w:
// STATION.PAD, cut and filled to one height), turned to face the road, its gate on the road side:
//   a square court behind walls of banco adobe with the Tiebele bands, a squat tower at each corner, the gatehouse; the keeper's tower-house, the
//   travellers' rooms and the stores along the inner walls; a stable court for the caravans' beasts; a cistern fed off the bench's seeps; and
//   outside, windbreak palisades of poles and woven brush on the west and north, where the dust comes from.
const STEP=(function(){const S=STATION,P=S.PAD,W=99250;
 /* the road's direction past the pad: the compound turns to it (local x along the road), its gate on the road's side */
 const nr=nearLine(S.ROAD.pts,P.x,P.z),ra=S.ROAD.pts[nr.i],rb=S.ROAD.pts[nr.i+1],ry=-Math.atan2(rb[1]-ra[1],rb[0]-ra[0]);
 const cs=Math.cos(ry),sn=Math.sin(ry),toW=(lx,lz)=>[P.x+lx*cs+lz*sn,P.z-lx*sn+lz*cs];
 /* which side of the road the pad stands: the gate faces the road */
 const side=Math.sign((P.x-ra[0])*(rb[1]-ra[1])-(P.z-ra[1])*(rb[0]-ra[0]))||1,gz=side>0?1:-1;
 const R=[],add=o=>{const w=toW(o.lx,o.lz);R.push(Object.assign({pending:true,culture:'yuni',settlement:'weave-step-waystation',x:w[0],z:w[1],ry:ry+(o.rot||0)},o));};
 const H=23,T=1.4,WH=5.5;
 add({id:'way:wall-gate-w',name:'The waystation\'s wall (the road side, west of the gate)',role:'wall',kind:'wall',key:'wall',lx:-H/2-3.5,lz:gz*H,w:H-7,d:T,h:WH});
 add({id:'way:wall-gate-e',name:'The waystation\'s wall (the road side, east of the gate)',role:'wall',kind:'wall',key:'wall',lx:H/2+3.5,lz:gz*H,w:H-7,d:T,h:WH});
 add({id:'way:wall-back',name:'The waystation\'s back wall',role:'wall',kind:'wall',key:'wall',lx:0,lz:-gz*H,w:2*H,d:T,h:WH});
 add({id:'way:wall-w',name:'The waystation\'s west wall',role:'wall',kind:'wall',key:'wall',lx:-H,lz:0,w:T,d:2*H,h:WH});
 add({id:'way:wall-e',name:'The waystation\'s east wall',role:'wall',kind:'wall',key:'wall',lx:H,lz:0,w:T,d:2*H,h:WH});
 for(const [i,cx,cz] of [[0,-1,-1],[1,1,-1],[2,1,1],[3,-1,1]])add({id:'way:tower-'+i,name:'A corner tower of the waystation',role:'defence',kind:'tower',key:'civic_bell_tower',lx:cx*H,lz:cz*H,w:7,d:7,h:10});
 add({id:'way:gatehouse',name:'The gatehouse (the road\'s gate, barred at dusk)',role:'gate',kind:'gate',key:'gate',lx:0,lz:gz*H,w:9,d:6,h:8.5});
 add({id:'way:keeper',name:'The keeper\'s tower-house',role:'keeper',kind:'tower',key:'rich_tower_house',lx:-H+8,lz:-gz*(H-8),w:10,d:10,h:16});
 for(let k=0;k<4;k++)add({id:'way:room-'+k,name:'A travellers\' room (against the back wall)',role:'lodging',kind:'room',key:'trade_tavern',lx:-H+18+k*7.2,lz:-gz*(H-4.5),w:6.6,d:7,h:4.2});
 for(let k=0;k<3;k++)add({id:'way:store-'+k,name:'A store (against the west wall: fodder, water skins, grain)',role:'store',kind:'room',key:'prop_granary_store',lx:-H+4.5,lz:-gz*(H-20)+gz*k*8.5,w:7,d:8,h:4});
 add({id:'way:stable',name:'The stable court (the caravans\' beasts)',role:'stable',kind:'pen',key:'prop_animal_pen',lx:H-10,lz:0,w:16,d:30,h:1.6});
 add({id:'way:cistern',name:'The cistern (fed off the bench\'s seeps by a covered channel)',role:'water',kind:'well',key:'prop_well',lx:2,lz:2,w:5,d:5,h:1.1});
 /* the windbreaks: lines of poles and brush outside the west and north walls (rot turns a line to run along the local z) */
 add({id:'way:palisade-w1',name:'A windbreak palisade (poles and woven brush)',role:'windbreak',kind:'palisade',key:'palisade',lx:-H-10,lz:0,w:1.2,d:2*H+24,h:2.8});
 add({id:'way:palisade-w2',name:'A windbreak palisade (poles and woven brush)',role:'windbreak',kind:'palisade',key:'palisade',lx:-H-20,lz:-gz*4,w:1.2,d:2*H+20,h:2.4});
 add({id:'way:palisade-n',name:'A windbreak palisade (poles and woven brush)',role:'windbreak',kind:'palisade',key:'palisade',lx:-6,lz:-gz*(H+10),w:2*H+20,d:1.2,h:2.6});
 const RECT=R.map(r=>({x:r.x,z:r.z,c:Math.cos(r.ry),s:Math.sin(r.ry),w:r.w/2+1.5,d:r.d/2+1.5}));
 function occupied(x,z){for(const q of RECT){const dx=x-q.x,dz=z-q.z,lx=dx*q.c-dz*q.s,lz=dx*q.s+dz*q.c;if(Math.abs(lx)<q.w&&Math.abs(lz)<q.d)return true;}return false;}
 const COL={adobe:0xb48a5e,band:0x2e2622,wood:0x6a4e36,brush:0x8a7a52,stone:0x7a7064};
 const out={records:R.length,pending:0};
 // ---------------------------------------------------------------- the build: register every record, then the stand-ins
 function build(){const acc={},add2=(k,g,M)=>{(acc[k]=acc[k]||[]).push({g,M});};
  const BOX=new THREE.BoxGeometry(1,1,1).translate(0,.5,0),CYL=new THREE.CylinderGeometry(.5,.5,1,8).translate(0,.5,0),Q=new THREE.Quaternion(),E=new THREE.Euler();
  const put=(k,g,x,y,z,r,sx,sy,sz)=>add2(k,g,new THREE.Matrix4().compose(new THREE.Vector3(x,y,z),Q.clone().setFromEuler(E.set(0,r,0)),new THREE.Vector3(sx,sy,sz)));
  for(const r of R){const y0=P.y-.4,top=P.y+r.h;r.y0=y0;
   REGISTER({name:r.name+' (the Weave-Step\'s waystation)',key:r.id,x:r.x,z:r.z,y:y0,r:Math.hypot(r.w,r.d)*.5,h:top-y0+1.5,
    tags:{culture:'yuni',settlement:r.settlement,role:r.role,pending:!!r.pending,kit:'yuni:'+r.key}});
   OBSTACLES.push({x:r.x,z:r.z,r:Math.hypot(r.w,r.d)*.5+1,y0:y0-1,y1:top});if(r.pending)out.pending++;}
  for(const r of R){const y0=r.y0,Hh=r.h+.4;
   if(r.kind==='palisade'){const L=Math.max(r.w,r.d),n=Math.round(L/1.6),along=r.w>r.d,c=Math.cos(r.ry),s=Math.sin(r.ry);
    for(let i=0;i<=n;i++){const t=(i/n-.5)*L,lx=along?t:0,lz=along?0:t;put('wood',CYL,r.x+lx*c+lz*s,y0,r.z-lx*s+lz*c,0,.16,Hh+.3,.16);}
    put('brush',BOX,r.x,y0+.5,r.z,r.ry,along?L:.35,Hh-.6,along?.35:L);}
   else if(r.kind==='pen'){const c=Math.cos(r.ry),s=Math.sin(r.ry);for(const sd of [-1,1]){put('wood',BOX,r.x+sd*r.w*.5*c,y0,r.z-sd*r.w*.5*s,r.ry,.18,Hh,r.d);put('wood',BOX,r.x+sd*r.d*.5*s,y0,r.z+sd*r.d*.5*c,r.ry,r.w,Hh,.18);}}
   else if(r.kind==='well')put('stone',CYL,r.x,y0,r.z,0,r.w,Hh,r.d);
   else if(r.kind==='tower'){put('adobe',BOX,r.x,y0,r.z,r.ry,r.w,Hh,r.d);for(let k=1;k<4;k++)put('band',BOX,r.x,y0+Hh*k/4,r.z,r.ry,r.w+.06,.45,r.d+.06);}
   else{put('adobe',BOX,r.x,y0,r.z,r.ry,r.w,Hh,r.d);if(r.kind!=='wall')put('band',BOX,r.x,y0+Hh*.66,r.z,r.ry,r.w+.05,.4,r.d+.05);}}
  for(const k in acc){const byG=new Map();for(const e of acc[k]){if(!byG.has(e.g))byG.set(e.g,[]);byG.get(e.g).push(e.M);}
   for(const [g,Ms] of byG){const m=new THREE.InstancedMesh(g,new THREE.MeshLambertMaterial({color:COL[k]}),Ms.length);Ms.forEach((M,i)=>m.setMatrixAt(i,M));m.userData.host=true;m.userData.post=true;
    m.userData.inspectLabel={adobe:'Banco adobe (a stand-in: the Yuni kit\'s)',band:'Tiebele band (a stand-in)',wood:'Poles',brush:'Woven brush (a windbreak)',stone:'The cistern\'s kerb'}[k];scene.add(m);}}
  window._step=out;return out;}
 // ---------------------------------------------------------------- the dangers: the canyons' rims and walls, the benches' risers
 function hazards(){const Hz=[];
  S.GU.forEach((G,gi)=>{const L=G.lines[0];if(!L)return;for(let i=2;i<L.pts.length;i+=Math.max(2,Math.round(L.pts.length/6))){const p=L.pts[i],q=L.pts[Math.min(L.pts.length-1,i+1)];
    if(Math.abs(p[0])>TERR.R||Math.abs(p[1])>TERR.R)continue;const dx=q[0]-p[0],dz=q[1]-p[1],l=Math.hypot(dx,dz)||1,nx=-dz/l,nz=dx/l,off=G.w+12;
    for(const sd of [1,-1])Hz.push({name:'A box canyon\'s rim (a fall to its floor)',kind:'fall',x:p[0]+nx*sd*off,z:p[1]+nz*sd*off,r:40,h:20,danger:.9,tell:{sign:'the bench ends at a sheer edge'}});
    Hz.push({name:'Rockfall off a box canyon\'s walls',kind:'crush',x:p[0],z:p[1],r:G.w*1.6,h:16,y:p[2]-1,danger:.4,tell:{sign:'fresh basalt blocks on the floor'}});}});
  let n=0;for(let gx=-2100;gx<=2100&&n<8;gx+=600)for(let gz=-2100;gz<=2100&&n<8;gz+=700){if(S.roadD(gx,gz)<80||S.guAt(gx,gz))continue;
   for(let k=0;k<30;k++){const x=gx+k*10,a=S.terAt(x,gz);if(a&&a.part==='riser'){Hz.push({name:'A bench\'s riser (a sheer 22 m drop)',kind:'fall',x,z:gz,r:30,h:24,danger:.7,tell:{sign:'the tread breaks off at a basalt edge'}});n++;break;}}}
  return Hz;}
 // ---------------------------------------------------------------- the checks, each fed a broken input that must fail
 /* a fall-line transect's drops: runs of the drawn ground falling more than 12 m within 40 m (a riser) */
 function steps(f,x0,z0,x1,z1){const n=Math.ceil(Math.hypot(x1-x0,z1-z0)/4),H=[];for(let i=0;i<=n;i++){const t=i/n,x=x0+(x1-x0)*t,z=z0+(z1-z0)*t;if(S.guAt(x,z)||S.roadD(x,z)<60){H.push(null);continue;}H.push(f(x,z));}
  let k=0,i=0;while(i<H.length-10){if(H[i]!=null&&H[i+10]!=null&&H[i]-H[i+10]>12){k++;i+=12;}else i++;}return k;}
 const TR=[[-2300,-700,2300,-500],[-2300,700,2300,600],[-2300,-2300,2300,-2300+200]];
 const CK={
  waystation(Rs,f){const bad=Rs.filter(r=>{const c=Math.cos(r.ry),s=Math.sin(r.ry);return [[-.45,-.45],[.45,-.45],[.45,.45],[-.45,.45],[0,0]].some(o=>{const lx=o[0]*r.w,lz=o[1]*r.d;return Math.abs(f(r.x+lx*c+lz*s,r.z-lx*s+lz*c)-P.y)>.6;});});
   const pend=Rs.filter(r=>r.pending).length;
   return{ok:Rs.length>8&&!bad.length&&pend===Rs.length,detail:bad.length?bad.length+' waystation records off the level pad (first '+bad[0].id+')':Rs.length+' Yuni records on the pad at '+P.y.toFixed(1)+' m (within 0.6 m on the drawn ground), every one pending: drawn as stand-ins'};},
  benches(f){const k=TR.map(t=>steps(f,t[0],t[1],t[2],t[3]));return{ok:k.every(v=>v>=4),detail:'risers crossed on three fall-line transects of the drawn ground: '+k.join(', ')+' (4 or more each)'};},
  canyons(G){let up=0,n=0;for(const g of G)for(const L of g.lines){n++;for(let i=1;i<L.pts.length;i++)if(L.pts[i][2]>L.pts[i-1][2]+1e-6)up++;}
   return{ok:n>0&&!up,detail:up?up+' places a box canyon\'s floor climbs downstream':n+' box canyon floors (trunks and branches), none climbing downstream'};},
  road(f){let worst=0,at=null;const P2=S.ROAD.pts;for(let i=0;i<P2.length-1;i++){const a=P2[i],b=P2[i+1],l=Math.hypot(b[0]-a[0],b[1]-a[1]),n=Math.ceil(l/10);
    for(let k=0;k<n;k++){const x=a[0]+(b[0]-a[0])*k/n,z=a[1]+(b[1]-a[1])*k/n,x2=a[0]+(b[0]-a[0])*(k+1)/n,z2=a[1]+(b[1]-a[1])*(k+1)/n;
     if(Math.max(Math.abs(x),Math.abs(z),Math.abs(x2),Math.abs(z2))>TERR.R-60)continue;const g=Math.abs(f(x2,z2)-f(x,z))/(l/n);if(g>worst){worst=g;at=[x|0,z|0];}}}
   return{ok:worst<.2,detail:'the road\'s steepest 10 m on the drawn ground: '+(worst*100).toFixed(1)+'% at '+at+' (under 20%, a pack train\'s grade: the notches through the risers; the model\'s ramp is 13% in the page\'s west)'};}};
 function checks(add){add('the waystation is Yuni records on its level pad, pending stand-ins',CK.waystation(R,drawnH));add('the benches stand as steps (risers on the fall line)',CK.benches(drawnH));
  add('the box canyons\' floors never climb downstream',CK.canyons(S.GU));add('the road keeps a pack train\'s grade through the benches',CK.road(drawnH));}
 function negatives(add){add('a waystation off its pad',CK.waystation([Object.assign({},R[0],{x:R[0].x+400})],drawnH));
  add('a ramp with no benches',CK.benches(S.g0));
  add('a box canyon climbing',CK.canyons([{lines:[{pts:[[0,0,10],[10,0,9],[20,0,12]]}]}]));
  add('a road over the benches\' risers',CK.road(S.g1Raw||((x,z)=>KRELIEF.shape(S.TER,x,z,S.g0(x,z)))));}
 // ---------------------------------------------------------------- the views (each camera over the drawn ground: 99's check)
 function views(H){const {look}=H,G0=S.GU[0],hd=G0.heads&&G0.heads[0],tr=G0.lines[0].pts,mid=tr[Math.floor(tr.length*.45)],gw=toW(0,gz*(23+40)),gate=toW(0,gz*23);
  const V={};
  V['The waystation from the road']=look(gw[0]-60*Math.cos(ry),gw[1]+60*Math.sin(ry),1.8,gate[0],gate[1],4);
  V['Up the benches (their riser faces)']=look(1300,-250,2.5,-1200,-200,60);   /* from below, looking up the fall line: the risers face the camera */
  if(hd)V['A box canyon\'s head']=look(hd.x-(hd.dir?Math.cos(hd.dir):1)*60,hd.z-(hd.dir?Math.sin(hd.dir):0)*60,2,mid[0],mid[1],0);
  else V['A box canyon\'s head']=look(tr[0][0]-80,tr[0][1],2,mid[0],mid[1],0);
  V['Along the road east']=look(-1300,230,2.2,900,-430,2);
  V['Over the chasms']=look(300,-260,3,40000,-6000,-900);   /* from the step's middle, high over the fall to the east */
  V['The Cradle\'s fans from the step']=look(-1600,600,2.5,-40000,-26000,800);
  V['From afar']=look(-2600,2600,480,300,-200,0);
  return V;}
 return{R,build,hazards,checks,negatives,views,occupied};})();
