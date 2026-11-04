// ================================================================= HOST — the people's works: Eternian furniture on the coast
// The owner (2026-10-26): the works only on the biome pages, no city massing; tagged as Eternian furniture (core/tags: class
// furniture, culture eternian, outdoor, with the job each serves) and noted in kits/eternian/KNOWN_ISSUES.md to be
// backported into the Eternian kit the next time it is rebuilt. Until then they are drawn here, simply, from the library's
// stone, limewash and weathered wood (materials.json works.*), one mesh per surface for every work on the page.
//   kelpkiln   a Hebridean kelp kiln: a long shallow stone-lined trench where the dried kelp is burned to ash (the potash and
//              soda the glassmakers and soapmakers buy), a heap drying beside it; the first one is burning, its smoke
//              leaning inland on the wind
//   limekiln   a squat round kiln on the coral terraces, whitewashed with its own lime, a draw-arch at its foot, coral rubble
//   wrackheap  wrack carted off the strand, heaped to rot for the fields
//   wrackcart  a two-wheeled cart with its load of wrack
//   terraces   walled terraces up a slope, the fields manured with wrack (the stone walls follow the ground)
//   fold       a goat fold: a ring of dry-stone wall with a gap for the gate (the goats are the coast's wealth)
//   rack       a drying rack: kelp and wine weed hung on poles to dry (as nori, as kombu)
// Farport's harbour (station 1, map 5.1; the owner, 2026-11-01: the harbour stays at the water, in the tsunami's reach):
//   quay       a stretch of stone quay along the estuary's bank, its face down to the bed, bollards along its edge (kits/eternian et_quay)
//   pier       a timber jetty on piles out across the arm (et_dock's)
//   slip       the dockyard's slip: a stone ramp into the water and a hull in frame on it (et_dock)
//   tsunamistone  a stone stele on the run-up line (100 m): the State's warning not to build below it (Earth's tsunami stones, Japan)
// A STATION'S SITES (STAGE.sites: the old city on the plateau, the factory quarter by the quays) are registered, not drawn: a settlement
// build places them (kits/eternian), and the plants keep clear of the city's.
// Every work is a registered volume (REGISTER) and a core/tags record, and an obstacle the plants keep clear of.
const WORKS=[];
(function(){
 const LIBW=(function(){if(typeof KMAT==='undefined'||KMAT.mode!=='lib')return {};const o={};
  ['works.stone','works.lime','works.wood','heap'].forEach(k=>{const P=KMAT.packed('farside',k);if(P)o[k]=Object.assign({scale:P.scale[0]},KMAT.textures(P,{aniso:8}));});return o;})();
 const mat=(k,col,o)=>{const L=LIBW[k];const m=new THREE.MeshStandardMaterial(Object.assign({color:L?0xffffff:col,roughness:.92,metalness:0,map:L?L.map:null,normalMap:L&&L.normalMap||null,roughnessMap:L&&L.roughnessMap||null},o||{}));
  if(m.map){m.map.wrapS=m.map.wrapT=THREE.RepeatWrapping;}m.userData.libScale=L?L.scale:2;return m;};
 const MATS={stone:mat('works.stone',0x8a857a),lime:mat('works.lime',0xece8de),wood:mat('works.wood',0x6a5a46),
  wrack:mat('heap',0x5a4c22,{roughness:.55}),ash:new THREE.MeshStandardMaterial({color:0x3a3632,roughness:1}),dark:new THREE.MeshStandardMaterial({color:0x141210,roughness:1}),
  weed:new THREE.MeshStandardMaterial({color:0x5e5226,roughness:.6,side:THREE.DoubleSide}),wine:new THREE.MeshStandardMaterial({color:0x8a1e2c,roughness:.6,side:THREE.DoubleSide}),
  coral:new THREE.MeshStandardMaterial({color:0xf0ece2,roughness:.95})};
 const BUF={};Object.keys(MATS).forEach(k=>{BUF[k]={pos:[],nor:[],uv:[]};});
 const _m=new THREE.Matrix4(),_q=new THREE.Quaternion(),_e=new THREE.Euler(),_s=new THREE.Vector3(),_p=new THREE.Vector3(),_v=new THREE.Vector3(),_nm=new THREE.Matrix3();
 // add a geometry to a surface's buffer, placed at p, turned by ry (and rx, rz), scaled by s; uv in world metres over the
 // surface's tile (so a big wall and a small one show the stone at one size)
 function add(k,geo,p,ry,s,rx,rz){const g=geo.index?geo.toNonIndexed():geo,a=g.attributes.position,n=g.attributes.normal,B=BUF[k],tile=MATS[k].userData.libScale||2;
  _e.set(rx||0,ry||0,rz||0,'YXZ');_q.setFromEuler(_e);_s.set(s[0],s[1],s[2]);_p.set(p[0],p[1],p[2]);_m.compose(_p,_q,_s);_nm.getNormalMatrix(_m);
  for(let i=0;i<a.count;i++){_v.set(a.getX(i),a.getY(i),a.getZ(i)).applyMatrix4(_m);B.pos.push(_v.x,_v.y,_v.z);const vx=_v.x,vy=_v.y,vz=_v.z;
   _v.set(n.getX(i),n.getY(i),n.getZ(i)).applyMatrix3(_nm).normalize();B.nor.push(_v.x,_v.y,_v.z);
   const ax=Math.abs(_v.x),ay=Math.abs(_v.y),az=Math.abs(_v.z);B.uv.push((ay>ax&&ay>az?vx:ax>az?vz:vx)/tile,(ay>ax&&ay>az?vz:vy)/tile);}}
 const BOX=new THREE.BoxGeometry(1,1,1).translate(0,.5,0),CYL=new THREE.CylinderGeometry(.5,.5,1,14,1,false).translate(0,.5,0),
  RING=r=>new THREE.CylinderGeometry(.5,.5,1,18,1,true).translate(0,.5,0),LUMP=new THREE.SphereGeometry(1,9,6,0,Math.PI*2,0,Math.PI*.5),
  WHEEL=new THREE.CylinderGeometry(.5,.5,1,12).rotateZ(Math.PI/2),PLANE=new THREE.PlaneGeometry(1,1).translate(0,-.5,0),SPH=new THREE.SphereGeometry(1,10,7);
 const G=(x,z)=>terrainH(x,z);
 // the ground's lowest point under a footprint (a work stands into the slope, never on stilts)
 const foot=(x,z,r)=>{let lo=G(x,z);for(let i=0;i<8;i++){const a=i/8*Math.PI*2;lo=Math.min(lo,G(x+Math.cos(a)*r,z+Math.sin(a)*r));}return lo;};
 const W=BIO.host.farside.wind,windA=Math.atan2(W[1],W[0]);
 const rot=(x,z,ry)=>[x*Math.cos(ry)+z*Math.sin(ry),-x*Math.sin(ry)+z*Math.cos(ry)];
 const KIND={
  kelpkiln(x,z,ry,i){const y=foot(x,z,4);   /* the trench, its stone lining a course above the ground, the ash in it, a heap of kelp drying beside */
   add('stone',BOX,[x,y-.2,z],ry,[7,.75,.5],0,0);const s1=rot(0,.85,ry),s2=rot(0,-.85,ry);
   add('stone',BOX,[x+s1[0],y-.2,z+s1[1]],ry,[7,.8,.45]);add('stone',BOX,[x+s2[0],y-.2,z+s2[1]],ry,[7,.8,.45]);
   add('ash',BOX,[x,y+.05,z],ry,[6.6,.3,1.2]);const h=rot(0,3.4,ry);add('wrack',LUMP,[x+h[0],G(x+h[0],z+h[1])-.2,z+h[1]],ry,[3.2,1.1,1.4]);
   if(i===0){const sm=new THREE.MeshBasicMaterial({color:0xb8b6ae,transparent:true,opacity:.3,depthWrite:false,fog:true});   /* the burning one's smoke, inland on the wind */
    for(let k=0;k<9;k++){const t=k/8,r=1.2+t*9,m=new THREE.Mesh(SPH,sm.clone());m.material.opacity=.34*(1-t*.75);m.scale.setScalar(r);
     m.position.set(x+W[0]*t*t*60,y+1.5+t*26,z+W[1]*t*t*60);m.userData.probeSkip=true;m.userData.host=true;m.userData.inspectLabel='Kelp smoke';m.renderOrder=2;scene.add(m);}}
   return {r:4.2,h:2,name:'A kelp kiln (the trench where the kelp is burned to ash)',job:'salt'};},
  limekiln(x,z,ry){const y=foot(x,z,3.2);
   add('lime',new THREE.CylinderGeometry(2.3,3.1,5.2,16,1,false).translate(0,2.6,0),[x,y-.4,z],ry,[1,1,1]);
   add('stone',RING(),[x,y+4.8,z],ry,[4.7,.5,4.7]);add('dark',BOX,[x,y-.2,z],ry,[1.1,1.7,6.3]);   /* the draw-arch, cut through */
   for(let k=0;k<6;k++){const a=ry+k*.6+.4,r=4+k%2;add('coral',LUMP,[x+Math.cos(a)*r,G(x+Math.cos(a)*r,z+Math.sin(a)*r)-.15,z+Math.sin(a)*r],a,[.9+.2*(k%3),.6,.8]);}
   return {r:3.6,h:5.4,name:'A lime kiln (the spray coral burned to lime: the mortar and the whitewash)',job:'quarrying'};},
  wrackheap(x,z,ry){const y=G(x,z);add('wrack',LUMP,[x,y-.3,z],ry,[3.4,1.5,2.2]);add('wrack',LUMP,[x+1.6,y-.3,z+1],ry+.7,[2,1,1.6]);
   return {r:3.6,h:1.6,name:'A wrack heap (carted off the strand to rot for the fields)',job:'farming'};},
  wrackcart(x,z,ry){const y=G(x,z)+.55,o=rot(0,.9,ry),o2=rot(0,-.9,ry),f=rot(2.4,0,ry);
   add('wood',BOX,[x,y+.1,z],ry,[2.4,.12,1.5]);add('wood',BOX,[x,y+.22,z],ry,[2.4,.4,.08],0,0);
   add('wood',WHEEL,[x+o[0],y,z+o[1]],ry,[.14,1.1,1.1]);add('wood',WHEEL,[x+o2[0],y,z+o2[1]],ry,[.14,1.1,1.1]);
   add('wood',BOX,[x+f[0]+rot(0,.55,ry)[0],y+.05,z+f[1]+rot(0,.55,ry)[1]],ry,[2.6,.08,.08]);add('wood',BOX,[x+f[0]+rot(0,-.55,ry)[0],y+.05,z+f[1]+rot(0,-.55,ry)[1]],ry,[2.6,.08,.08]);
   add('wrack',LUMP,[x,y+.22,z],ry,[1.1,.65,.7]);return {r:2.4,h:1.6,name:'A wrack cart',job:'farming'};},
  terraces(x,z,ry){const steps=6,len=46;   /* walls along the contour, each a run of short courses following the ground */
   for(let k=0;k<steps;k++){const off=rot(0,k*11-steps*5.5,ry);for(let j=0;j<len/2;j++){const a=rot(j*2-len/2+1,0,ry),px=x+off[0]+a[0],pz=z+off[1]+a[1];
     add('stone',BOX,[px,G(px,pz)-.3,pz],ry,[2.05,1.25,.7]);}}
   return {r:len*.6,h:2,name:'Walled terraces (the fields, manured with wrack)',job:'farming'};},
  fold(x,z,ry){const R=9;for(let k=0;k<26;k++){const a=k/26*Math.PI*2+ry;if(k===0)continue;const px=x+Math.cos(a)*R,pz=z+Math.sin(a)*R;
    add('stone',BOX,[px,G(px,pz)-.3,pz],-a,[.8,1.4,2.3]);}
   return {r:R+1,h:1.5,name:'A goat fold (the coast\'s wealth: milk, meat, hair and hides from goats fat on kelp)',job:'herding'};},
  rack(x,z,ry){const y=G(x,z);for(const e of [-2.4,2.4]){const o=rot(e,0,ry);add('wood',BOX,[x+o[0],y-.2,z+o[1]],ry,[.12,2.3,.12]);}
   const tp=rot(0,0,ry);add('wood',BOX,[x+tp[0],y+2,z+tp[1]],ry,[5,.1,.1]);
   for(let k=0;k<14;k++){const o=rot(-2.2+k*.34,0,ry);add(k%3===0?'wine':'weed',PLANE,[x+o[0],y+1.95,z+o[1]],ry,[.28,1.2+.3*(k%2),1],0,.0);}
   return {r:3,h:2.3,name:'A drying rack (kelp and wine weed hung to dry)',job:'farming'};},
  quay(x,z,ry){const L=56,D=4.5,top=2.4;   /* the face from the bed to 2.4 m over the sea, a coping course, bollards along the water side */
   add('stone',BOX,[x,-9,z],ry,[L,top+9,D]);add('lime',BOX,[x,top,z],ry,[L,.25,D+.2]);
   for(let k=0;k<5;k++){const o=rot(-L/2+5.6+k*11.2,-D/2+.6,ry);add('dark',CYL,[x+o[0],top+.25,z+o[1]],ry,[.45,.7,.45]);}
   return {r:L/2,h:top+1,name:'A quay (Farport\'s harbour: in the tsunami\'s reach, as the harbour must be)',job:'trading'};},
  pier(x,z,ry){const L=34,Wd=3.2,top=1.8;   /* piles and a deck out over the arm from the bank (local -z: across it) */
   const o=rot(0,-L/2,ry);add('wood',BOX,[x+o[0],top,z+o[1]],ry,[Wd,.22,L]);
   for(let k=0;k<=6;k++)for(const e of [-1,1]){const q=rot(e*(Wd/2-.2),-k*L/6,ry);add('wood',CYL,[x+q[0],-8,z+q[1]],ry,[.36,top+8,.36]);}
   return {r:L/2+2,h:top+1,name:'A jetty (Farport\'s harbour)',job:'fishing'};},
  slip(x,z,ry){const L=40,Wd=9;   /* a stone ramp down into the water across the arm, a hull's keel and ribs in frame on it */
   const o=rot(0,-L/2,ry);add('stone',BOX,[x+o[0],-2.2,z+o[1]],ry,[Wd,1.2,L],-.08,0);
   const kq=rot(0,-12,ry);add('wood',BOX,[x+kq[0],1.1,z+kq[1]],ry,[.4,.5,22],-.08,0);
   for(let k=0;k<9;k++){const q=rot(0,-3-k*2.3,ry),y=.9-k*.18;for(const e of [-1,1])add('wood',BOX,[x+q[0]+rot(e*1.8,0,ry)[0],y+1.4,z+q[1]+rot(e*1.8,0,ry)[1]],ry,[.22,3.4,.22],0,e*.32);}
   return {r:L/2+2,h:5,name:'The dockyard\'s slip (a hull in frame)',job:'carpentry'};},
  tsunamistone(x,z,ry){const y=foot(x,z,1);   /* a dressed stele on a plinth, its face to the sea */
   add('stone',BOX,[x,y-.3,z],ry,[1.6,.6,1.6]);add('stone',BOX,[x,y+.25,z],ry,[.9,2.6,.36]);add('lime',BOX,[x,y+2.85,z],ry,[1.05,.2,.46]);
   return {r:1.4,h:3,name:'A tsunami stone (on the run-up line, 100 m: "do not build below this stone")',job:null};}};
 // a work whose u is null stands on the station's run-up line at its v (STAGE.tsunami.contour)
 const RES=w=>{if(w[1]!=null)return w;const T=STAGE.tsunami,u=T&&T.contour?T.contour(w[2],T.runup):null;return u==null?null:[w[0],u,w[2],w[3]];};
 const WL=(STAGE.works||[]).map(RES).filter(Boolean);window._worksNamed=WL.length;
 WL.forEach((w,i)=>{const kind=w[0],p=STAGE.XZ(w[1],w[2]),ry=windA+(w[3]||0),f=KIND[kind];if(!f)return;
  const n=WORKS.filter(o=>o.kind===kind).length,info=f(p[0],p[1],ry,n),y=G(p[0],p[1]);
  const rec={name:info.name,key:'farside_'+kind,cls:'furniture',x:p[0],y,z:p[1],r:info.r,h:info.h+1,
   tags:Object.assign({culture:'eternian',setting:'outdoor',biome:'farside',backport:'kits/eternian'},info.job?{job:info.job}:{})};
  WORKS.push({kind,x:p[0],z:p[1],y,r:info.r});REGISTER(rec);OBSTACLES.push({x:p[0],z:p[1],r:info.r+1.5,y0:y-3,y1:y+info.h+4});});
 // the sites (registered landmarks, not drawn; the city's held clear of the plants)
 window._sites=(STAGE.sites||[]).map(s=>{const p=STAGE.XZ(s[1],s[2]),y=G(p[0],p[1]);
  REGISTER({name:s[0],key:'farport_'+s[4],cls:'landmark',x:p[0],y,z:p[1],r:s[3],h:40,tags:{culture:'eternian',biome:'farside',backport:'settlement build'}});
  if(s[4]==='city')OBSTACLES.push({x:p[0],z:p[1],r:s[3],y0:y-20,y1:y+60});return {key:s[4],x:p[0],z:p[1],y,r:s[3]};});
 for(const k in BUF){const B=BUF[k];if(!B.pos.length)continue;const g=new THREE.BufferGeometry();
  g.setAttribute('position',new THREE.Float32BufferAttribute(B.pos,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(B.nor,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(B.uv,2));
  const m=new THREE.Mesh(g,MATS[k]);m.userData.host=true;m.userData.inspectLabel='The works ('+k+')';
  m.userData.probePoints=[].concat(...WORKS.map(o=>[o.x,o.y+.5,o.z]));   /* one point a work: the probe finds each work in its registered volume */
  scene.add(m);}
 window._works=WORKS.length;
})();
