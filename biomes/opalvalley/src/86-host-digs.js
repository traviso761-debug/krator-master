// ================================================================= HOST — the diggings, drawn from their records (PLAN.md section 4.3)
// The records are 40's (OPAL_DIGGINGS), put on this ground by the stage (45: DIGS; the pits cut and the spoil heaped there, DIG_CUT). Drawn here as places:
// an adit's timbered mouth on the wall with its dark throat, a riffle sluice's trough on trestles beside a fall, the divers' plank stage on a shore. Every
// one is registered in core/tags with its grade (kits/resources' shape: resource {kind:'opal', grade}) and its hazard; the economy is core/simulation's
// (PLAN.md section 9, item 4). Timber and void are two vertex-coloured meshes: a handful of draw calls for every digging on the page.
const DIG_MESH=(function(){const T={p:[],n:[],c:[]},V={p:[],n:[],c:[]};
 // a box of half-sizes (hx, hy, hz) at (cx, cy, cz) turned by yaw about y and pitch about its own x, into a buffer set
 function box(B,cx,cy,cz,hx,hy,hz,yaw,col,pitch){const cy_=Math.cos(yaw),sy=Math.sin(yaw),cp=Math.cos(pitch||0),sp=Math.sin(pitch||0);
  const R=(x,y,z)=>{const y1=y*cp-z*sp,z1=y*sp+z*cp;return[cx+x*cy_+z1*sy,cy+y1,cz-x*sy+z1*cy_];};
  const F=[[[1,0,0],[[1,-1,-1],[1,1,-1],[1,1,1],[1,-1,1]]],[[-1,0,0],[[-1,-1,1],[-1,1,1],[-1,1,-1],[-1,-1,-1]]],[[0,1,0],[[-1,1,-1],[-1,1,1],[1,1,1],[1,1,-1]]],
   [[0,-1,0],[[-1,-1,1],[-1,-1,-1],[1,-1,-1],[1,-1,1]]],[[0,0,1],[[1,-1,1],[1,1,1],[-1,1,1],[-1,-1,1]]],[[0,0,-1],[[-1,-1,-1],[-1,1,-1],[1,1,-1],[1,-1,-1]]]];
  const c=new THREE.Color(col).convertSRGBToLinear();
  for(const [nn,q] of F){const P=q.map(v=>R(v[0]*hx,v[1]*hy,v[2]*hz)),N=R(nn[0],nn[1],nn[2]),n=[N[0]-cx,N[1]-cy,N[2]-cz];
   for(const k of [0,1,2,0,2,3]){B.p.push(...P[k]);B.n.push(...n);B.c.push(c.r,c.g,c.b);}}}
 const WOOD=[0x6a4a32,0x7a5638,0x5e4230],wood=()=>pick(WOOD),st={adits:0,sluices:0,landings:0,pits:0,stakes:0};reseed(9101);
 const PP=[];   /* one probe point a digging (the probe counts a merged mesh's pieces by userData.probePoints) */
 DIGS.forEach(r=>{const y=terrainH(r.x,r.z);
  if(r.kind==='adit'){const yaw=Math.PI/2-r.az,   /* the box's x across the mouth ([sin az, -cos az]), its z out of the wall */cx=Math.cos(r.az),cz=Math.sin(r.az),w=r.mw/2,h=r.h,back=-2.2;   /* the mouth faces down the slope (az): its frame across it */
   const bx=r.x-cx*.6,bz=r.z-cz*.6,by=Math.max(y,terrainH(bx,bz))-.2;
   box(T,bx-Math.sin(r.az)*w,by+h/2,bz+Math.cos(r.az)*w,.14,h/2,.14,yaw,wood());box(T,bx+Math.sin(r.az)*w,by+h/2,bz-Math.cos(r.az)*w,.14,h/2,.14,yaw,wood());
   box(T,bx,by+h+.12,bz,w+.35,.14,.16,yaw,wood());   /* the posts and the cap */
   box(V,bx+cx*back,by+h/2,bz+cz*back,w-.05,h/2-.05,1.9,yaw,0x0c0a0a);   /* the dark throat, set into the wall */
   REGISTER({name:'An adit on the basalt contact ('+r.gem+' opal, '+r.grade+' grade; '+r.id+')',x:bx,z:bz,y:by-1,r:Math.max(4,w+1.5),h:h+3,
    tags:{class:'site',kind:'digging',mining:'opal',resource:r.resource,hazard:{kind:'gas',danger:.25}}});PP.push(bx,by+h/2,bz);st.adits++;}
  if(r.kind==='sluice'&&r.x){const yaw=Math.atan2(0,1),L=r.len,y0=terrainH(r.x+L/2,r.z),y1=terrainH(r.x-L/2,r.z),top=Math.max(y0,y1)+1.2,pitch=0;
   box(T,r.x,top-.15,r.z,L/2,.12,.45,0,wood());box(T,r.x,top+.12,r.z+.45,L/2,.28,.05,0,wood());box(T,r.x,top+.12,r.z-.45,L/2,.28,.05,0,wood());
   for(let k=0;k<=Math.floor(L/2.4);k++){const x=r.x-L/2+k*2.4,g=terrainH(x,r.z);box(T,x,(g+top)/2-.2,r.z,.08,Math.max(.2,(top-g)/2),.4,0,wood());
    if(k%2===0)box(T,x,top-.02,r.z,.05,.06,.42,0,0x8a6a48);}   /* the trestles, and the riffles across the trough */
   REGISTER({name:'A riffle sluice (placer gravel washed for '+r.gem+' opal; '+r.grade+' grade; '+r.id+')',x:r.x,z:r.z,y:Math.min(y0,y1)-1,r:L/2+1,h:top-Math.min(y0,y1)+3,
    tags:{class:'site',kind:'digging',mining:'opal',resource:r.resource}});PP.push(r.x,top,r.z);st.sluices++;}
  if(r.kind==='dive'&&r.x){const w=waterH(r.x+Math.cos(r.az)*9,r.z+Math.sin(r.az)*9),lv=w>-1e8?w:y,yaw=r.az,cx=Math.cos(r.az),cz=Math.sin(r.az);
   for(let k=0;k<5;k++){const x=r.x+cx*(k*2.2),z=r.z+cz*(k*2.2);box(T,x,lv+.55,z,.9,.06,1.1,yaw+Math.PI/2,wood());const g=terrainH(x,z);box(T,x,(g+lv+.5)/2,z,.07,Math.max(.3,(lv+.5-g)/2),.07,0,wood());}
   REGISTER({name:'The divers\' landing (opalized wood and lotus casts raised from the lake bed; '+r.id+')',x:r.x+cx*4,z:r.z+cz*4,y:lv-2,r:7,h:4,
    tags:{class:'site',kind:'digging',mining:'opal',resource:r.resource,hazard:{kind:'drown',danger:.45}}});PP.push(r.x+cx*4,lv+.5,r.z+cz*4);st.landings++;}
  if(r.kind==='placer'){REGISTER({name:'A placer pit and its washed gravel ('+r.gem+' opal, '+r.grade+' grade; '+r.id+')',x:r.x,z:r.z,y:y-2,r:r.r+2,h:4,
    tags:{class:'site',kind:'digging',mining:'opal',resource:r.resource}});
   box(T,r.x+r.r+.6,y+.6,r.z,.05,.6,.05,0,wood());PP.push(r.x,y,r.z);st.pits++;}});   /* a claim peg by the pit */
 const mk=(B,name,label)=>{if(!B.p.length)return null;const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(B.p,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(B.n,3));
  g.setAttribute('color',new THREE.Float32BufferAttribute(B.c,3));const m=new THREE.Mesh(g,new THREE.MeshLambertMaterial({vertexColors:true}));m.name=name;m.userData.host=true;m.userData.inspectLabel=label;scene.add(m);return m;};
 // THE SITES (the Sultanate's assay pavilion, the toll-house, the caravan landing): records for the settlement work, the ground left clear (no building:
 // a building kit's, later)
 (SITE.sites||[]).forEach(s=>{const y=terrainH(s.x,s.z);REGISTER({name:s.name+' (a site: staked out, kept clear for the settlement work)',x:s.x,z:s.z,y:y-2,r:s.r,h:6,
  tags:{class:'site',kind:s.kind,culture:s.culture,site:s.id}});
  for(let k=0;k<4;k++){const a=k/4*TAU+.4,x=s.x+Math.cos(a)*s.r*.8,z=s.z+Math.sin(a)*s.r*.8,g=terrainH(x,z);box(T,x,g+.7,z,.06,.7,.06,0,0xd8d0c0);box(T,x,g+1.3,z,.22,.04,.04,a,0xb83a2a);}   /* the corner stakes, flagged */
  PP.push(s.x,y+.5,s.z);st.stakes++;});
 const TM=mk(T,'opal-diggings-timber','The diggings\' timber (sluices, adit frames, landings, claim pegs, the sites\' stakes)');if(TM)TM.userData.probePoints=PP;
 mk(V,'opal-diggings-void','An adit\'s throat');
 return st;})();
window._digs=Object.assign({records:DIGS.length},DIG_MESH);
