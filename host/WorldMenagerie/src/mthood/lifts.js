// ---------- Mount Hood: the lifts, the skiers on the runs, and snow on the roofs ----------
// The mountain's ski areas are Timberline (the Magic Mile and the Palmer, to 2,590 m: the only lifts in North America
// that run into late summer, on the Palmer Snowfield), Mount Hood Meadows on the east side, Ski Bowl over Government
// Camp (the largest night skiing in the country) and Summit Pass. Every lift OpenStreetMap maps (api.ctx.mtn.lifts,
// bottom to top) is drawn:
//   chairlifts  towers every 70 to 110 m, a crossarm and the sheave trains on it, a terminal with its bull wheel at
//               each end, the haul rope sagging between the towers on both sides, and the chairs going round: two,
//               three, four or six seats (OSM's occupancy; the Expresses are detachable quads and six-packs and run
//               faster), riders on them in their jackets, more going up than down
//   tows        rope tows and platters on short poles, the magic carpets as belts on the snow
// They run in the day (9 to 4; Ski Bowl till 10 at night, its towers lit) in the ski season (season.lifts 1), only
// the Magic Mile, the Palmer and the camps' tows on the Palmer in summer (0.5), and stand still the rest of the year.
// Skiers and snowboarders come down the downhill runs (api.ctx.mtn.pistes) carving S-turns, more on the easy and
// intermediate runs, within 1.5 km of the camera, in the ski season (the Palmer's runs only, in summer).
// A lift's terminals carry its card. And every building's roof and the landmarks' take snow in winter: ground.js's
// snowOnTop on the materials of every building, landmark and lift house (each material once).
import {hash3} from '../core/rng.js';

export function lifts(api){
  const {THREE,C,scene,groundH,camera,animHooks,LANDMARKS}=api;const M=api.ctx.mtn||{},S=api.ctx.season,K=C.lifts||{};
  const tag=o=>{o.userData.noFingerprint=true;return o;};
  // draw the first n instances and send only those to the GPU (a whole buffer each frame is megabytes on this many seats)
  const show=(im,n)=>{im.count=n;const a=im.instanceMatrix;a.updateRange.offset=0;a.updateRange.count=Math.max(1,n)*16;a.needsUpdate=true;
    if(im.instanceColor&&im.userData.liveColour){const c=im.instanceColor;c.updateRange.offset=0;c.updateRange.count=Math.max(1,n)*3;c.needsUpdate=true;}};
  const dec=a=>{const o=[];for(let i=0;i<a.length;i+=2)o.push([a[i]/10,a[i+1]/10]);return o;};
  const lam=c=>new THREE.MeshLambertMaterial({color:c});
  const steelM=lam(0x5a5e62),houseM=lam(0x6a4a30),roofM=lam(0x3e4a42),ropeM=new THREE.ShaderMaterial({transparent:true,depthWrite:false,fog:true,uniforms:Object.assign(THREE.UniformsUtils.clone(THREE.UniformsLib.fog),{uFar:{value:new THREE.Vector2(K.ropeFade?K.ropeFade[0]:500,K.ropeFade?K.ropeFade[1]:1100)}}),
    vertexShader:'varying float vD;\n#include <fog_pars_vertex>\nvoid main(){vec4 mvPosition=modelViewMatrix*vec4(position,1.0);vD=-mvPosition.z;gl_Position=projectionMatrix*mvPosition;\n#include <fog_vertex>\n}',
    fragmentShader:'uniform vec2 uFar;varying float vD;\n#include <common>\n#include <fog_pars_fragment>\nvoid main(){float a=1.0-smoothstep(uFar.x,uFar.y,vD);if(a<0.01)discard;gl_FragColor=vec4(0.12,0.13,0.14,a*0.9);\n#include <fog_fragment>\n}'}),chairM=lam(0x2a2c30),seatM=lam(0x2a4a7a),wheelM=lam(0x8a8c8e);
  // where Ski Bowl is: its lifts run into the night under lights
  const [BX,BZ]=api.P(K.nightAt||[45.2985,-121.7700]),NIGHT_R=K.nightR==null?1300:K.nightR;
  const SUMMER=new RegExp(K.summer||'^(Magic Mile|Palmer|FTC)','i');

  // ---- each lift's line: its supports (terminals and towers) with the rope's height on each ----
  const L=[];let nTowers=0;
  for(const r of M.lifts||[]){const pts=dec(r.p);if(pts.length<2)continue;
    const cum=[0];for(let i=1;i<pts.length;i++)cum.push(cum[i-1]+Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]));const len=cum[cum.length-1];if(len<15)continue;
    const at=s=>{let i=1;while(i<cum.length-1&&cum[i]<s)i++;const f=Math.max(0,Math.min(1,(s-cum[i-1])/((cum[i]-cum[i-1])||1)));return [pts[i-1][0]+(pts[i][0]-pts[i-1][0])*f,pts[i-1][1]+(pts[i][1]-pts[i-1][1])*f,(pts[i][0]-pts[i-1][0])/((cum[i]-cum[i-1])||1),(pts[i][1]-pts[i-1][1])/((cum[i]-cum[i-1])||1)];};
    const chair=r.k==='chair_lift'||r.k==='gondola',express=/express/i.test(r.n),occ=r.occ>0?r.occ:express?4:2,gauge=chair?(occ>=6?5.6:occ>=4?4.8:occ>=3?4.2:3.6):1.4;
    const sup=[];const term=(s)=>{const [x,z]=at(s);return {s,x,z,y:groundH(x,z)+(chair?5.2:1.0),g:groundH(x,z),t:true};};
    sup.push(term(0));
    if(chair){const n=Math.max(1,Math.round(len/(80+hash3(len,3,51)*25)));for(let i=1;i<n;i++){const s=len*i/n,[x,z]=at(s),g=groundH(x,z),h=9+hash3(i,len,52)*5;sup.push({s,x,z,y:g+h,g,h});nTowers++;}}
    else if(r.k!=='magic_carpet'){const n=Math.max(1,Math.round(len/30));for(let i=1;i<n;i++){const s=len*i/n,[x,z]=at(s),g=groundH(x,z);sup.push({s,x,z,y:g+1.1,g,h:1.4});}}
    sup.push(term(len));
    const night=Math.hypot(pts[0][0]-BX,pts[0][1]-BZ)<NIGHT_R;
    L.push({r,pts,len,at,sup,chair,express,occ,gauge,night,summer:SUMMER.test(r.n||''),speed:express?5:r.k==='chair_lift'?2.3:r.k==='magic_carpet'?0.8:2.5,spacing:express?32:16,dir:at(len/2)});}
  // the rope at distance s along the line, on one side (+1 going up, -1 coming down): the height sags between supports
  function ropeAt(l,s,side,o){const sp=l.sup;let i=1;while(i<sp.length-1&&sp[i].s<s)i++;const a=sp[i-1],b=sp[i],f=Math.max(0,Math.min(1,(s-a.s)/((b.s-a.s)||1))),span=b.s-a.s;
    const [x,z,dx,dz]=l.at(s),y=a.y+(b.y-a.y)*f-span*0.022*4*f*(1-f);o[0]=x-dz*side*l.gauge/2;o[1]=y;o[2]=z+dx*side*l.gauge/2;o[3]=dx*side;o[4]=dz*side;return o;}

  // ---- the ropes: one set of line segments for every lift ----
  {const pos=[],o=[0,0,0,0,0];for(const l of L){if(l.r.k==='magic_carpet')continue;for(const side of [1,-1]){const n=Math.ceil(l.len/12);let prev=null;
      for(let k=0;k<=n;k++){ropeAt(l,l.len*k/n,side,o);if(prev)pos.push(prev[0],prev[1],prev[2],o[0],o[1],o[2]);prev=[o[0],o[1],o[2]];}}}
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));const ls=tag(new THREE.LineSegments(g,ropeM));ls.name='lift ropes';ls.userData.noShadow=true;scene.add(ls);}

  // ---- the towers: a tapered steel pole (instanced, its height scaled) and the crossarm with its sheave trains ----
  const poleG=new THREE.CylinderGeometry(0.32,0.5,1,8).translate(0,0.5,0),armG=(()=>{const parts=[new THREE.BoxGeometry(1,0.35,0.35)];
      for(const sx of [-0.5,0.5]){parts.push(new THREE.BoxGeometry(0.14,0.5,1.8).translate(sx,-0.35,0));for(const sz of [-0.6,-0.2,0.2,0.6])parts.push(new THREE.CylinderGeometry(0.16,0.16,0.08,10).rotateZ(Math.PI/2).translate(sx,-0.55,sz));}
      parts.push(new THREE.BoxGeometry(0.06,0.06,1).translate(0,0.6,0));return mergeG(parts);})();
  function mergeG(list){const pos=[],nor=[];for(const g of list){const n=g.toNonIndexed();pos.push(...n.attributes.position.array);nor.push(...n.attributes.normal.array);}const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(nor,3));return g;}
  const towers=L.flatMap(l=>l.sup.filter(s=>!s.t).map(s=>({l,s})));
  const poleI=tag(new THREE.InstancedMesh(poleG,steelM,Math.max(1,towers.length))),armI=tag(new THREE.InstancedMesh(armG,steelM,Math.max(1,towers.length)));
  {const o3=new THREE.Object3D();towers.forEach(T=>{const {l,s}=T,[,,dx,dz]=l.at(s.s),ry=Math.atan2(dx,dz);
      const thick=l.chair?1:0.35;o3.position.set(s.x,s.g-0.3,s.z);o3.rotation.set(0,ry,0);o3.scale.set(thick,s.h+0.6,thick);o3.updateMatrix();T.m0=o3.matrix.clone();
      o3.position.set(s.x,s.y+0.35,s.z);o3.scale.set(l.chair?l.gauge+0.4:0.3,l.chair?1:0.3,l.chair?1:0.3);o3.updateMatrix();T.m1=o3.matrix.clone();});}
  poleI.count=armI.count=0;
  poleI.castShadow=armI.castShadow=true;scene.add(poleI,armI);

  // ---- the terminals: a house over the bull wheel at each end; each lift's card ----
  const MATS=new Set([houseM,roofM]);const kindName={chair_lift:'chairlift',gondola:'gondola',magic_carpet:'magic carpet',platter:'platter lift',rope_tow:'rope tow',drag_lift:'drag lift',t_bar:'T-bar'};
  const FACTS=Object.assign({'Magic Mile':'It follows the line of the Magic Mile of 1939, one of the first chairlifts in America, from Timberline up to Silcox Hut, the old top station. It runs in summer too, for walkers and sightseers.',
    'Palmer':'The highest lift on the mountain, up the Palmer Snowfield to about 2,590 m (8,500 ft). Because the snow lasts there, Timberline runs it into late summer, when ski teams and camps train on the snowfield; climbers on the South Side route pass beside it in the night.',
    'Cascade Express':'Mount Hood Meadows’ highest lift, out of Heather Canyon’s head to over 2,200 m on the east side, above the tree line.',
    'Mount Hood Express':'Mount Hood Meadows’ main lift from the base lodges.'},K.facts||{});
  const TERM={house:[],roof:[],wheel:[],belt:[]},to3=new THREE.Object3D(),putT=(k,x,y,z,ry,sx,sy,sz,rx=0)=>{to3.position.set(x,y,z);to3.rotation.set(rx,ry,0,'YXZ');to3.scale.set(sx,sy,sz);to3.updateMatrix();TERM[k].push({x,z,m:to3.matrix.clone()});};
  const pickM=new THREE.MeshBasicMaterial({visible:false});
  for(const l of L){const g=new THREE.Group();g.name='lift: '+l.r.n;
    for(const [s,top] of [[l.sup[0],false],[l.sup[l.sup.length-1],true]]){const [,,dx,dz]=l.at(s.s),ry=Math.atan2(dx,dz);
      if(l.r.k==='magic_carpet'){const [mx,mz]=l.at(l.len/2);putT('belt',mx,groundH(mx,mz)+0.1,mz,ry,1.2,0.25,l.len,-Math.atan2(l.sup[l.sup.length-1].g-l.sup[0].g,l.len));const b=new THREE.Mesh(new THREE.BoxGeometry(1.2,1,l.len),pickM);b.position.set(mx,groundH(mx,mz)+0.5,mz);b.rotation.y=ry;g.add(b);break;}
      const W=l.chair?(l.express?9:6.5):2.5,D=l.chair?(l.express?14:8):2.5,H=l.chair?(l.express?5.5:4.2):2.2,c=Math.cos(ry),sn=Math.sin(ry),back=top?1:-1;
      const hx=s.x+sn*back*D*0.3,hz=s.z+c*back*D*0.3;
      putT('house',hx,s.g-0.5,hz,ry,W,H,D);putT('roof',hx,s.g-0.5+H,hz,ry,W+1,0.4,D+1);if(l.chair)putT('wheel',s.x+sn*back*D*0.55,s.y,s.z+c*back*D*0.55,0,l.gauge/2,1,l.gauge/2);
      const pk=new THREE.Mesh(new THREE.BoxGeometry(W,H,D).translate(0,H/2,0),pickM);pk.position.set(hx,s.g-0.5,hz);pk.rotation.y=ry;g.add(pk);}
    const verb=l.r.lo&&l.r.hi?`, from ${l.r.lo} m to ${l.r.hi} m (${Math.round((l.r.hi-l.r.lo)*3.281).toLocaleString()} ft of vertical)`:'';
    const info={name:l.r.n||'A lift',info:`A ${l.express?'detachable ':''}${l.chair?l.occ+'-seat ':''}${kindName[l.r.k]||l.r.k}, ${Math.round(l.len).toLocaleString()} m long${verb}. ${FACTS[(l.r.n||'').replace(/ Chair.*$/,'')]||''}`.trim()};
    g.traverse(m=>{if(m.isMesh){m.visible=false;m.userData.info=info;}});g.userData.info=info;tag(g);scene.add(g);if(LANDMARKS)LANDMARKS.push(g);}   // invisible: only for the click
  const unitBox=new THREE.BoxGeometry(1,1,1).translate(0,0.5,0),TI={house:[unitBox,houseM],roof:[unitBox,roofM],wheel:[new THREE.CylinderGeometry(1,1,0.3,20),wheelM],belt:[new THREE.BoxGeometry(1,1,1),chairM]};
  for(const k in TI){const im=tag(new THREE.InstancedMesh(TI[k][0],TI[k][1],Math.max(1,TERM[k].length)));im.count=0;im.castShadow=im.receiveShadow=true;im.userData.wireCat='landmark';scene.add(im);TI[k]=im;}
  // towers and terminals within 2.5 km, packed to the front of their buffers; done twice a second
  let packAt=-1e9;const pack=cp=>{const R2=2500*2500;let n=0;for(const T of towers){const dx=T.s.x-cp.x,dz=T.s.z-cp.z;if(dx*dx+dz*dz<R2){poleI.setMatrixAt(n,T.m0);armI.setMatrixAt(n,T.m1);n++;}}
    show(poleI,n);show(armI,n);
    for(const k in TERM){let m=0;for(const e of TERM[k]){const dx=e.x-cp.x,dz=e.z-cp.z;if(dx*dx+dz*dz<R2)TI[k].setMatrixAt(m++,e.m);}show(TI[k],m);}};

  // ---- the chairs and their riders ----
  const chairGeo={},chairG=occ=>chairGeo[occ]||(chairGeo[occ]=(()=>{const W=occ*0.62,parts=[new THREE.BoxGeometry(0.12,2.3,0.12).translate(0,-1.15,0),new THREE.BoxGeometry(W,0.08,0.12).translate(0,-0.05,0),
      new THREE.BoxGeometry(W,0.1,0.55).translate(0,-2.35,0.12),new THREE.BoxGeometry(W,0.55,0.08).translate(0,-2.05,-0.15),new THREE.BoxGeometry(W*0.9,0.06,0.06).translate(0,-1.45,0.6),new THREE.BoxGeometry(W*0.9,0.06,0.3).translate(0,-2.9,0.55)];
    for(const sx of [-W/2,W/2])parts.push(new THREE.BoxGeometry(0.06,0.9,0.06).translate(sx,-1.9,0.3));return mergeG(parts);})());
  // a rider seated: the jacket (instance colour) and the rest (dark trousers, helmet, skis)
  const jacketG=mergeG([new THREE.BoxGeometry(0.42,0.6,0.28).translate(0,-1.95,0),new THREE.BoxGeometry(0.5,0.12,0.12).translate(0,-1.75,0.15)]);
  const restG=mergeG([new THREE.BoxGeometry(0.26,0.28,0.26).translate(0,-1.52,0.02),new THREE.BoxGeometry(0.36,0.14,0.5).translate(0,-2.25,0.3),new THREE.BoxGeometry(0.34,0.5,0.14).translate(0,-2.55,0.55),
    new THREE.BoxGeometry(0.08,0.04,1.6).translate(-0.1,-2.82,0.75),new THREE.BoxGeometry(0.08,0.04,1.6).translate(0.1,-2.82,0.75)]);
  const JACKETS=K.jackets||['#c8302a','#2a5ab8','#e8c020','#2a8a4a','#e86a1a','#1e1e22','#8a2a8a','#e8e8ea','#2ab0c8','#d84a8a','#5a6a2a','#3a3a8a'].map(h=>new THREE.Color(h));
  const chairs=[];for(const l of L){if(!l.chair)continue;const n=Math.max(2,Math.floor(2*l.len/l.spacing));for(let i=0;i<n;i++)chairs.push({l,i,n});}
  const byOcc={};for(const c of chairs)(byOcc[c.l.occ]=byOcc[c.l.occ]||[]).push(c);
  const chairI=Object.entries(byOcc).map(([occ,list])=>{const im=tag(new THREE.InstancedMesh(chairG(+occ),chairM,list.length));im.castShadow=false;scene.add(im);return {im,list};});
  // a seat for each possible rider; who sits there is decided as the chair goes round
  const seats=[];for(const c of chairs)for(let k=0;k<c.l.occ;k++)seats.push({c,k,h:hash3(c.i,k,c.l.len|0)});
  const jackI=tag(new THREE.InstancedMesh(jacketG,lam(0xffffff),Math.max(1,seats.length))),restI=tag(new THREE.InstancedMesh(restG,lam(0x24262a),Math.max(1,seats.length)));
  seats.forEach((st,i)=>jackI.setColorAt(i,JACKETS[Math.floor(st.h*JACKETS.length*7)%JACKETS.length]));jackI.userData.liveColour=true;scene.add(jackI,restI);

  // ---- the skiers and boarders on the runs ----
  const runs=[];for(const p of M.pistes||[]){if(p.k!=='downhill'||!p.p)continue;const pts=dec(p.p);if(pts.length<2)continue;const cum=[0];for(let i=1;i<pts.length;i++)cum.push(cum[i-1]+Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]));
    const len=cum[cum.length-1];if(len<80)continue;const top=groundH(pts[0][0],pts[0][1]);runs.push({p,pts,cum,len,top,high:top>2150});}
  const DENS={easy:7,novice:7,intermediate:6,advanced:3,expert:1.5,freeride:1,extreme:0.5};
  const skiers=[];for(const r of runs){const n=Math.max(1,Math.round((DENS[r.p.d]==null?3:DENS[r.p.d])*r.len/600));for(let i=0;i<n;i++){const h=hash3(i,r.len|0,61);
    skiers.push({r,s0:h*r.len,v:(r.p.d==='easy'?5:r.p.d==='intermediate'?8:11)*(0.7+hash3(i,2,62)*0.6),A:6+hash3(i,3,63)*10,lam:22+hash3(i,4,64)*20,ph:hash3(i,5,65)*6.28,board:hash3(i,6,66)<0.35,col:JACKETS[Math.floor(hash3(i,7,67)*JACKETS.length)]});}}
  const skJ=mergeG([new THREE.BoxGeometry(0.44,0.62,0.3).translate(0,1.15,0),new THREE.BoxGeometry(0.6,0.12,0.14).translate(0,1.35,0)]);
  const skR=mergeG([new THREE.BoxGeometry(0.26,0.28,0.26).translate(0,1.6,0),new THREE.BoxGeometry(0.34,0.85,0.22).translate(0,0.45,0.05)]);
  const skiG=mergeG([new THREE.BoxGeometry(0.08,0.04,1.65).translate(-0.12,0.02,0),new THREE.BoxGeometry(0.08,0.04,1.65).translate(0.12,0.02,0)]),boardG=new THREE.BoxGeometry(1.45,0.04,0.3).translate(0,0.02,0);
  const NS=skiers.length||1,skJI=tag(new THREE.InstancedMesh(skJ,lam(0xffffff),NS)),skRI=tag(new THREE.InstancedMesh(skR,lam(0x24262a),NS)),skiI=tag(new THREE.InstancedMesh(skiG,lam(0xd8d8dc),NS)),brdI=tag(new THREE.InstancedMesh(boardG,lam(0x3a3a3e),NS));
  skiers.forEach((k,i)=>skJI.setColorAt(i,k.col));skJI.userData.liveColour=true;scene.add(skJI,skRI,skiI,brdI);for(const im of [skJI,skRI,skiI,brdI,jackI,restI,...chairI.map(c=>c.im)])im.frustumCulled=false;

  // ---- snow on the roofs: every building's materials, the landmarks', the lift houses' ----
  let snowDone=false;
  function snowRoofs(){const G=api.ctx.ground;if(!G||!G.snowOnTop)return;snowDone=true;const mats=new Set(MATS);if(api.roofM)mats.add(api.roofM);   // the engine's roofs are one material
    scene.traverse(o=>{if(!o.isMesh)return;let p=o,cat=null;while(p&&!cat){cat=p.userData&&p.userData.wireCat;p=p.parent;}if(cat!=='building'&&cat!=='landmark')return;for(const m of [].concat(o.material))if(m&&!m.userData.mhSnow)mats.add(m);});
    for(const m of mats){if(m.userData.mhSnow||m.isShaderMaterial)continue;m.userData.mhSnow=true;G.snowOnTop(m);}}

  // ---- the clock ----
  const o3=new THREE.Object3D(),r5=[0,0,0,0,0],Z=new THREE.Matrix4().makeScale(0,0,0);let t=0,last=performance.now(),acc=0;
  let msAcc=0,msN=0;animHooks.push(now=>{const T0=performance.now();const dt=Math.min(0.1,(now-last)/1000);last=now;if(!snowDone)snowRoofs();
    const h=api.hour?api.hour():12,season=S?S.lifts:1,cp=camera.position;if(now-packAt>500){packAt=now;pack(cp);}
    // which lifts are turning: daytime, and the season's; Ski Bowl's under lights till ten
    for(const l of L){const day=h>=9&&h<16,nightSki=l.night&&h>=16&&h<22,on=season>=1?(day||nightSki):season>0?(l.summer&&h>=7&&h<15):false;
      l.on=on;l.v=(l.v==null?0:l.v)+((on?l.speed:0)-(l.v==null?0:l.v))*Math.min(1,dt*0.5);l.u=((l.u==null?hash3(l.len,1,71)*1000:l.u)+l.v*dt)%(2*l.len);
      {let d=1e9;for(const q of l.sup)d=Math.min(d,Math.hypot(q.x-cp.x,q.z-cp.z));l.dist=d;l.near=d<1800;}}   // the nearest support: chairs drawn within 1.8 km, riders within 900 m (a rider beyond is a pixel)
    // the chairs: round the loop, up one side and down the other; the riders on them (more going up than down)
    const fill=season>=1?0.7:0.3;let si=0;
    // only what is near is written, packed to the front of each buffer (count says how many are drawn)
    for(const {im,list} of chairI){let n=0;for(const c of list){const l=c.l;if(!l.near)continue;const uu=(l.u+c.i*2*l.len/c.n)%(2*l.len),up=uu<l.len,s=up?uu:2*l.len-uu;
        ropeAt(l,s,up?1:-1,r5);o3.position.set(r5[0],r5[1],r5[2]);o3.rotation.set(0,Math.atan2(r5[3],r5[4]),0);o3.scale.set(1,1,1);o3.updateMatrix();im.setMatrixAt(n++,o3.matrix);}
      show(im,n);}
    for(const st of seats){const c=st.c,l=c.l;if(!l.near)continue;const uu=(l.u+c.i*2*l.len/c.n)%(2*l.len),up=uu<l.len,s=up?uu:2*l.len-uu;
      // a rider is on this seat while the chair is out on the line, by the seat's own luck: winter fuller going up
      const p=(up?fill:fill*0.15)*(l.on||l.v>0.2?1:0)*(1-st.k*0.12),seated=l.dist<900&&st.h<p&&s>8&&s<l.len-8;
      if(!seated)continue;
      ropeAt(l,s,up?1:-1,r5);const ry=Math.atan2(r5[3],r5[4]),off=(st.k-(l.occ-1)/2)*0.62;o3.position.set(r5[0]+Math.cos(ry)*off,r5[1],r5[2]-Math.sin(ry)*off);o3.rotation.set(0,ry,0);o3.scale.set(1,1,1);o3.updateMatrix();
      jackI.setMatrixAt(si,o3.matrix);restI.setMatrixAt(si,o3.matrix);jackI.setColorAt(si,JACKETS[Math.floor(st.h*JACKETS.length*7)%JACKETS.length]);si++;}
    show(jackI,si);show(restI,si);
    // the skiers: down their run, carving across it, back to the top when they reach the bottom
    t+=dt;acc+=dt;const ski=S?S.skiing:1;if(now-(runs.at||0)>500){runs.at=now;for(const r of runs){let d=1e9;for(const q of r.pts)d=Math.min(d,Math.hypot(q[0]-cp.x,q[1]-cp.z));r.far=d>1200+80;}}
    let ns=0,nb=0;skiers.forEach(k=>{const r=k.r,lit=Math.hypot(r.pts[0][0]-BX,r.pts[0][1]-BZ)<NIGHT_R&&h>=16&&h<22;
      const on=ski>0&&(ski>=1||r.high)&&((h>=9&&h<16.3)||lit);
      if(!on||r.far)return;let s=(k.s0+t*k.v)%r.len;let j=1;while(j<r.cum.length-1&&r.cum[j]<s)j++;const a=r.pts[j-1],b=r.pts[j],sl=(r.cum[j]-r.cum[j-1])||1,f=(s-r.cum[j-1])/sl,dx=(b[0]-a[0])/sl,dz=(b[1]-a[1])/sl;
      const w=Math.sin(s/k.lam*6.283+k.ph),lat=k.A*w*Math.min(1,s/30,(r.len-s)/30),x=a[0]+(b[0]-a[0])*f-dz*lat,z=a[1]+(b[1]-a[1])*f+dx*lat;
      if(!on||Math.hypot(x-cp.x,z-cp.z)>1200)return;
      const dl=Math.cos(s/k.lam*6.283+k.ph)*k.A*6.283/k.lam,hx=dx-dz*dl,hz=dz+dx*dl,ry=Math.atan2(hx,hz),lean=-Math.sign(dl)*Math.min(0.5,Math.abs(dl)*0.4);
      o3.position.set(x,groundH(x,z)+0.02,z);o3.rotation.set(0,ry+(k.board?Math.PI/2*0.8:0),lean,'YXZ');o3.scale.set(1,1,1);o3.updateMatrix();
      skJI.setMatrixAt(ns,o3.matrix);skRI.setMatrixAt(ns,o3.matrix);skJI.setColorAt(ns,k.col);ns++;if(k.board)brdI.setMatrixAt(nb++,o3.matrix);else skiI.setMatrixAt(ns-1-nb,o3.matrix);});
    show(skJI,ns);show(skRI,ns);show(brdI,nb);show(skiI,ns-nb);
    msAcc+=performance.now()-T0;msN++;if(acc>1){acc=0;api.ctx.details.lifts={ms:+(msAcc/msN).toFixed(2),drawn:{chairs:chairI.reduce((a,c)=>a+c.im.count,0),riders:si,skiers:ns},lifts:L.length,running:L.filter(l=>l.on).length,towers:nTowers,chairs:chairs.length,seats:seats.length,skiers:skiers.length,runs:runs.length};}});
  if(jackI.instanceColor)jackI.instanceColor.needsUpdate=true;if(skJI.instanceColor)skJI.instanceColor.needsUpdate=true;
  api.ctx.details=Object.assign(api.ctx.details||{},{lifts:{lifts:L.length,towers:nTowers,chairs:chairs.length,seats:seats.length,skiers:skiers.length,runs:runs.length}});
  api.ctx.lifts={lines:L,ropeAt};
}
