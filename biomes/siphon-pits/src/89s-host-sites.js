// ================================================================= HOST — the people's sites (PLAN.md sections 3 and 6): RECORDS first, PLACEHOLDERS drawn
// No settlement is built here: the farmsteads, the tollhouse, the beacons, the roper camp, the stanchions and the gantry are site records (core/tags,
// registered before they are drawn) for a building kit and a hamlet pass to take (the culture is undecided: the root README's rule, "make a placeholder
// and expect it to be replaced"). Each is drawn as a plain placeholder: boxes, posts, a cone, merged by material. The Arete's iron stanchions and chains
// are the trail's own furniture and are drawn properly. The flensers' lairs are hazard records (kind 'hunter') with nothing drawn: the walls hold them.
const SITES_PEOPLE=[];
const STRUCT=(function(){const parts={stone:[],timber:[],iron:[],canvas:[],copper:[],sod:[]},PP={},M4=new THREE.Matrix4(),Q=new THREE.Quaternion(),V=new THREE.Vector3(),Sc=new THREE.Vector3();
 const add=(mat,geo,x,y,z,ry,sx,sy,sz)=>{const g=geo.index?geo.toNonIndexed():geo.clone();Q.setFromEuler(new THREE.Euler(0,ry||0,0));M4.compose(V.set(x,y,z),Q,Sc.set(sx,sy,sz));g.applyMatrix4(M4);parts[mat].push(g);(PP[mat]=PP[mat]||[]).push(x,y,z);};
 const BOX=new THREE.BoxGeometry(1,1,1),CYL=new THREE.CylinderGeometry(.5,.5,1,10),CONE=new THREE.ConeGeometry(.5,1,8);
 const site=(o)=>{SITES_PEOPLE.push(o);REGISTER({name:o.name,x:o.x,z:o.z,y:terrainH(o.x,o.z)-2,r:o.r,h:o.h,tags:Object.assign({class:'structure',placeholder:true,culture:null,kind:o.kind,type:o.type},o.tags||{})});};
 const g=(x,z)=>terrainH(x,z);
 if(SKEY==='terraces')SITE.farms.forEach((f,i)=>{const[x,z,r]=f,y=g(x,z),a=KRAND.unit(KRAND.hash(9880,i))*TAU;
  site({name:'A farmstead (a site for a building kit: sod-roofed basalt farmhouse, granary, threshing yard; placeholder)',kind:'farmstead',type:['farm','single-family dwelling'],x,z,r:r*.6,h:14});
  add('stone',BOX,x,y+1.6,z,a,16,3.6,8);add('sod',BOX,x,y+3.8,z,a,17,1,9);add('stone',CYL,x+Math.cos(a+1.6)*13,y+3,z+Math.sin(a+1.6)*13,0,6,6,6);add('sod',CONE,x+Math.cos(a+1.6)*13,y+7,z+Math.sin(a+1.6)*13,0,7,2.4,7);});
 if(SKEY==='scarp'){const t=SITE.toll,p=L.TA(t.t,t.a),y=g(p[0],p[1]),a=Math.atan2(L.nrm[1],L.nrm[0]);
  site({name:'The tollhouse and caravansary (a site under the ravine\'s wall: a building kit\'s to draw; placeholder)',kind:'tollhouse',type:['civic','tavern/inn','infrastructure'],x:p[0],z:p[1],r:t.r,h:16});
  add('stone',BOX,p[0],y+3,p[1],-a,26,6,14);add('timber',BOX,p[0],y+6.4,p[1],-a,27,.8,15);
  SITE.beacons.forEach(i=>{const q=L.RP[Math.min(L.RP.length-1,i+2)],yb=g(q[0],q[1]);site({name:'An iron beacon basket on the switchbacks',kind:'beacon',type:['infrastructure'],x:q[0],z:q[1],r:3,h:6});
   add('iron',CYL,q[0],yb+2,q[1],0,.18,4,.18);add('iron',CYL,q[0],yb+4.3,q[1],0,1.1,.7,1.1);});}
 if(SKEY==='pitfloor'){const c=SITE.camp;
  site({name:'Pit-Head 04, the siphon-ropers\' base camp (canvas huts, copper rendering kettles; placeholder)',kind:'camp',type:['industry','multi-family dwelling'],x:c.x,z:c.z,r:c.r,h:12});
  for(let k=0;k<6;k++){const a=k/6*TAU+.3,x=c.x+Math.cos(a)*c.r*.55,z=c.z+Math.sin(a)*c.r*.55,y=g(x,z);add('canvas',CONE,x,y+2.2,z,a,6,4.4,6);}
  for(let k=0;k<2;k++){const x=c.x+(k?14:-10),z=c.z+(k?-6:8),y=g(x,z);add('copper',CYL,x,y+.9,z,0,2.4,1.8,2.4);add('stone',BOX,x,y+.2,z,0,3.2,.4,3.2);}
  {const x=c.x+40,z=c.z-30,y=g(x,z);add('stone',BOX,x,y+2,z,.4,5,4,4);add('iron',CYL,x,y+60,z,0,.12,120,.12);}   /* a cable anchor on a fallen block: the cable runs up into the deck to the rim's crane */}
 if(SKEY==='arete'){const C=SITE.crest,st=SITE.stanchion;
  site({name:'The Arete Way (the caravan trail on the knife-edge: iron stanchions and chains)',kind:'trail',type:['infrastructure'],x:0,z:0,r:C[1],h:8});
  let prev=null;for(let x=C[0];x<=C[1]+1e-6;x+=st){const zc=0;for(const s of [-1,1]){const z=zc+s*1.6,y=g(x,z);add('iron',CYL,x,y+.6,z,0,.07,1.2,.07);
    if(prev){const p=prev[s>0?1:0],dx=x-p[0],dy=y+1.1-p[1],dz=z-p[2],len=Math.hypot(dx,dy,dz);const gg=CYL.clone();gg.rotateZ(Math.PI/2);
     const m=new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(0,-Math.atan2(dz,dx),Math.atan2(dy,Math.hypot(dx,dz))));m.setPosition((x+p[0])/2,(y+1.1+p[1])/2-.12,(z+p[2])/2);
     const geo=gg.toNonIndexed();geo.applyMatrix4(new THREE.Matrix4().makeScale(len,.03,.03).premultiply(m));parts.iron.push(geo);}}
   prev=[[x,g(x,-1.6)+1.1,-1.6],[x,g(x,1.6)+1.1,1.6]];}
  const G=SITE.gantry,zs=G.side*(L.crestW(G.x)/2+1),yg=g(G.x,zs-G.side*6);
  site({name:'The rim windlass gantry (it lowers the ropers into the pit in rope cradles; placeholder)',kind:'gantry',type:['industry','infrastructure'],x:G.x,z:zs,r:10,h:14});
  add('timber',BOX,G.x,yg+5,zs-G.side*5,0,.5,10,.5);add('timber',BOX,G.x,yg+10,zs+G.side*.5,0,.5,.5,12);add('timber',CYL,G.x,yg+2,zs-G.side*7,Math.PI/2,1.4,3,1.4);add('iron',CYL,G.x,yg-20,zs+G.side*6,0,.05,60,.05);
  // the flensers' lairs: under the rims, below the fog's top in a blizzard, where they lock to the rock and lunge at stragglers (kits/fauna: flenser-hound)
  SITE.lairs.forEach((l,i)=>{const[x,s]=l,e=s*(L.crestW(x)/2+8),y=g(x,e)-25;REGISTER({name:'A flenser-hound\'s lair (under the rim: an ambush on the trail)',x,z:e,y,r:14,h:40,
   tags:{hazard:{kind:'hunter',danger:.9},life:{species:'flenser-hound',kit:'kits/fauna',role:'predator',den:true}}});});
  REGISTER({name:'Black rime on the knife-edge (the windward faces glazed: it slips)',x:0,z:0,y:SITE.base-25,r:C[1],h:40,tags:{hazard:{kind:'slip',danger:.4}}});}
 const MATS={stone:0x5a5654,timber:0x6a5038,iron:0x2a2828,canvas:0xc8b898,copper:0xb06a3a,sod:0x5a6a3a},out={};
 for(const k in parts){if(!parts[k].length)continue;let n=0;for(const p of parts[k])n+=p.attributes.position.count;const pos=new Float32Array(n*3),nor=new Float32Array(n*3);let o=0;
  for(const p of parts[k]){pos.set(p.attributes.position.array,o*3);nor.set(p.attributes.normal.array,o*3);o+=p.attributes.position.count;}
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(pos,3));geo.setAttribute('normal',new THREE.BufferAttribute(nor,3));
  const mesh=new THREE.Mesh(geo,k==='copper'||k==='iron'?new THREE.MeshStandardMaterial({color:MATS[k],roughness:k==='iron'?.6:.4,metalness:.7}):new THREE.MeshLambertMaterial({color:MATS[k]}));
  mesh.userData.host=true;mesh.userData.probePoints=PP[k]||[];mesh.userData.inspectLabel=k==='iron'&&SKEY==='arete'?'Iron stanchions and chains (the Arete Way)':'A placeholder ('+k+'): a site for a building kit';scene.add(mesh);out[k]=mesh;}
 return out;})();
window._sites=SITES_PEOPLE.map(s=>({kind:s.kind,x:Math.round(s.x),z:Math.round(s.z)}));
