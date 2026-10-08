// prefix: dhx
// ================================================================= DHELV: PLAN.md SECTION 13'S EXTRAS, DRAWN (the owner: "work on remaining extras"). [web]
// The defs stand where the layout put them (41: the bath, the roost, the signal stations, the mirrors, the dovecotes, the vent
// heads); here the rest. The AIR SHAFTS: each carved from its deep way up through the shelf to its vent head in the forest (a
// shaft and a hole in the ground under the vent's grate), and under each, by the way, the SENTINEL: a caged bird on a bracket,
// which sickens before a person does. The BURIED LIGHT WELL: an old skylight over the dead end the layout gives it, its top
// sealed by a young flow (a glassy black plug hanging in it, drips of it frozen), votive lamps at its foot. The MIRRORS' LIGHT:
// each bronze mirror throws its well's daylight down its way in (a spot light from the mirror along the way, as strong as the
// sun is high), drawn while the camera is underground near it.
const DHX={SHAFT_R:.7,BURIED:{r0:2.6,r1:2.2,h:20},spots:[],out:{shafts:0,mirrors:0}};
/* the carving (dhCarve, 90): the shafts and the buried well's */
function dhCarveExtras(C){
 for(const S of DH.SHAFTS){const top=DH.surfaceY(S.x,S.z)+2;C.shaft({id:S.id,owner:'dhelv',c:[S.x,S.z],y0:S.y+1.5,y1:top,r0:DHX.SHAFT_R,r1:DHX.SHAFT_R,floor:false,rock:'basalt',finish:'raw'});
  C.opening({id:'dh.vent.'+S.node,c:[S.x,S.z],r:DHX.SHAFT_R,rim:.3,kind:'well'});}
 /* the decoy: from just outside the face (inside its opening's disc) 30 m in, its floor the lava's outside it */
 {const D=DH.DECOY,y=DH.groundY(D.c[0]+D.out[0]*3,D.c[1]+D.out[1]*3);D.y=y;
  C.tube({id:'dh.decoy',owner:'dhelv',pts:[[D.c[0]+D.out[0]*(DH.LIP.out+.6),y,D.c[1]+D.out[1]*(DH.LIP.out+.6)],[D.c[0]-D.out[0]*D.len,y,D.c[1]-D.out[1]*D.len]],w:D.w,h:D.h,blend:1,rock:'basalt',finish:'raw',walkW:D.w-.8});
  const id='dh.mouth.decoy';C.opening({id,c:[D.c[0]+D.out[0]*2,D.c[1]+D.out[1]*2],r:D.r+1,rim:.5,kind:'well'});DH_MOUTH.tops[id]=y+D.top;}   /* (its disc out to the columns' line) */
 const n=DH.byId['x.buried'],B=DHX.BURIED;if(n)C.shaft({id:'dh.buried',owner:'dhelv',c:[n.x,n.z],y0:n.y+1.5,y1:n.y+B.h,r0:B.r0,r1:B.r1,floor:false,rock:'basalt',finish:'raw'});}
/* the decoy's face: the gap the walls leave for it (90's dhWalls) dressed in the cliff's rock in the columns' line, its mouth open
   (made with the walls, at the page's start; the floor's height is the lava's, laid by then: 48) */
function dhDecoyFace(mat){const D=DH.DECOY,O=DH.LIP.out,y=DH.groundY(D.c[0]+D.out[0]*3,D.c[1]+D.out[1]*3),ux=-D.out[1],uz=D.out[0],hw=D.r+2.5,mw=D.r+.3,top=y+D.top,pos=[],idx=[];
 const at=(u,yy)=>[D.c[0]+D.out[0]*O+ux*u,yy,D.c[1]+D.out[1]*O+uz*u],quad=(u0,u1,y0,y1)=>{const n=pos.length/3;pos.push(...at(u0,y0),...at(u1,y0),...at(u0,y1),...at(u1,y1));idx.push(n,n+2,n+1,n+1,n+2,n+3);};
 const lip=u=>DH.shelfY(D.c[0]+ux*u,D.c[1]+uz*u,-O)+.1;
 for(let u=-hw;u<hw-1e-6;u+=1){const u2=Math.min(hw,u+1),yl=Math.min(lip(u),lip(u2));if(u2<=-mw||u>=mw)quad(u,u2,y-1.5,yl);else quad(u,u2,top,yl);}
 const geo=new THREE.BufferGeometry(),nv=pos.length/3;geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geo.setIndex(idx);geo.computeVertexNormals();
 geo.setAttribute('aW',new THREE.Float32BufferAttribute(new Float32Array(nv*4),4));geo.setAttribute('aCut',new THREE.Float32BufferAttribute(new Float32Array(nv*4),4));
 const aM=new Float32Array(nv*3);for(let v=0;v<nv;v++)aM[v*3+2]=1;geo.setAttribute('aM',new THREE.BufferAttribute(aM,3));
 const m=new THREE.Mesh(geo,mat);m.castShadow=m.receiveShadow=true;m.userData.cliff=true;m.name='the decoy’s face';return m;}
/* the drawing (buildWorld, 90: after the sites, into the world's buckets) */
function dhExtras(){const B=DH.byId,wd=P('woodD'),ir=P('soot');
 /* the sentinels: a post at the way's side under each shaft, an arm, a cage of bars, a yellow bird on its perch */
 for(const S of DH.SHAFTS){const e=DH.EDGES.find(q=>q.a===S.node||q.b===S.node),o=B[e.a===S.node?e.b:e.a],L=Math.hypot(o.x-S.x,o.z-S.z)||1,nx=-(o.z-S.z)/L,nz=(o.x-S.x)/L,hw=Math.max(1.2,((e.w||4)-.6)/2-.5);
  const x=S.x+nx*hw,z=S.z+nz*hw,y=S.y,cx=x-nx*.55,cz=z-nz*.55;
  cyl('log',x,y,z,.06,2.3,wd,6);beam('log',[x,y+2.2,z],[cx,y+2.25,cz],.04,wd,true,5);
  for(let i=0;i<8;i++){const a=i*TAU/8;box('iron',cx+Math.cos(a)*.17,y+1.62,cz+Math.sin(a)*.17,.012,.36,.012,ir);}
  cyl('iron',cx,y+1.6,cz,.19,.02,ir,10);zfCone('iron',cx,y+1.98,cz,.2,.16,ir);box('log',cx,y+1.72,cz,.3,.015,.015,wd);
  sph('plain',cx,y+1.78,cz,.06,P('ochre'),.9,8);zfCone('plain',cx+.06,y+1.79,cz,.018,.04,P('cinnabar'));DHX.out.shafts++;}
 /* the decoy's choke: the passage's end heaped with fallen rock to its roof */
 {const D=DH.DECOY,ex=D.c[0]-D.out[0]*D.len,ez=D.c[1]-D.out[1]*D.len;for(let i=0;i<26;i++){const a=i*2.399,r=1.9*Math.sqrt(((i*.618)%1)),s=.5+.6*((i*.37)%1),u=(i%3)*.9;
   sph('tuffHewn',ex+Math.cos(a)*r+D.out[0]*u,D.y+s*.6+((i*.53)%1)*2.6,ez+Math.sin(a)*r+D.out[1]*u,s,P('soot'),.7,7);}}
 /* the buried light well: the plug (a black glassy bulb), its frozen drips, a few votive lamps at the shaft's foot */
 const n=B['x.buried'];if(n){const K=DHX.BURIED,top=n.y+K.h,c=P('soot');
  sph('basaltPol',n.x,top-1.2,n.z,K.r1*1.05,c,.75,18);for(let i=0;i<9;i++){const a=i*TAU/9+.4,r=K.r1*(.35+.4*((i*.618)%1)),l=.8+1.6*((i*.371)%1);
   const x=n.x+Math.cos(a)*r,z=n.z+Math.sin(a)*r;beam('basaltPol',[x,top-1.4,z],[x,top-1.4-l,z],.08+.06*((i*.29)%1),c,true,6);}
  for(let i=0;i<5;i++){const a=i*TAU/5,x=n.x+Math.cos(a)*1.6,z=n.z+Math.sin(a)*1.6;cyl('tuffHewn',x,n.y,z,.12,.12,P('tuffDark'),8);sph('glow',x,n.y+.2,z,.06,P('flame'),1,8);haloAt(x,n.y+.22,z,0xffb04a,false);}}}
/* the mirrors' spot lights: made on the first frame (the scene is 90's); aimed and lit each frame the camera is underground near one */
FRAME_HOOKS.push(()=>{if(!DHX.made){DHX.made=true;for(const M of DH.MIRRORS){const s=new THREE.SpotLight(0xfff2dc,0,140,.16,.7,1.2);s.castShadow=false;s.visible=false;scene.add(s);scene.add(s.target);DHX.spots.push({M,s});DHX.out.mirrors++;}}
 const p=camera.position,under=p.y<terrainH(p.x,p.z)-2,day=Math.max(0,Math.min(1,(LIGHTDIR.y-.05)/.3))*(NIGHT.on?0:1);
 for(const {M,s} of DHX.spots){const S=M.site,on=under&&day>0&&Math.hypot(S.x-p.x,S.z-p.z)<260;s.visible=on;if(!on)continue;
  const a=DH.byId[M.aim[0]],b=DH.byId[M.aim[1]];s.position.set(S.x,S.y+2.6,S.z);s.target.position.set(b.x,b.y+1.2,b.z);s.target.updateMatrixWorld();
  s.color.copy(sun.color);s.intensity=5*day;s.distance=Math.hypot(b.x-S.x,b.z-S.z)+30;}});
