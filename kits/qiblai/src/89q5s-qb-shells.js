// ================================================================= QIBLAI — every building's interior: shells, types (the owner, 2026-11-15)
// "work on wiring in kit interiors to all buildings". A building's interior is planned on its shell, the main block it is drawn
// with: while a world draws a building with QB_SHELLREC.cur set to a list, every storey stack the builder raises from the ground
// (qnStack here, xnStack of the Xanadu kit: the same arguments, in the builder's own frame) is listed; qnShellOf picks the
// biggest one that stands on the ground and holds a room, and that is the shell (a rectangle in the building's frame, its base,
// its storeys' heights, the street door in the middle of its front). qnIxType(shell, key) plans its storeys with
// kits/interiors' planBuilding (the programme from the building's tags: a dwelling, a shop, a workshop, a tavern, a temple, a
// civic hall), draws its floor, ceiling, wall lining and partitions with the kit's textured items (the floorboards, the
// lacquer, the wash), and furnishes its rooms with the catalog's pieces (qnFurnishRooms, 89q5f), all in the building's own frame
// and once per type: a world clones the type onto every lot that shares it (settlements/qiblai targets/city/90u-qc-lot-interiors.js).
// Every storey (the owner, 2026-11-16: "Yes, upper storeys"): planBuilding plans them with a stair (or a ladder) between each
// pair; qnIxType draws each storey's slab with its stair's well, the stairs, the walls of every level, and furnishes every room.
const QB_SHELLREC={cur:null};
(function(){const wrap=f=>function(x,y,z,w,d,ry,hs){const r=f.apply(this,arguments);
  if(QB_SHELLREC.cur&&Array.isArray(hs)&&hs.length)QB_SHELLREC.cur.push({x,y,z,w,d,ry:ry||0,hs:hs.slice()});return r;};   /* every stack: the ground ones are shells, a higher one may be a shell's upper storeys */
 qnStack=wrap(qnStack);if(typeof xnStack==='function')xnStack=wrap(xnStack);
 /* a ground block drawn whole (the Xanadu kit's xnWall: a battered block; vnFrame: a timber frame round a box): (x,y,z,w,h,d,ry) */
 const wrapB=f=>function(x,y,z,w,h,d,ry){const r=f.apply(this,arguments);if(QB_SHELLREC.cur)QB_SHELLREC.cur.push({x,y,z,w,d,ry:ry||0,hs:[h]});return r;};
 if(typeof xnWall==='function')xnWall=wrapB(xnWall);if(typeof vnFrame==='function')vnFrame=wrapB(vnFrame);})();
// the kit's pieces that hold no room (an open shrine, a wheel house): never an interior
const QB_IX_OPEN={qb_shrine:1,qb_wheel_house:1,qb_chorten:1,qb_kora_arcade:1,qb_kora_corner:1};
// the monks' quarters in a great monastery's cell range (settlements/qiblai 90u; prog for qnIxType): the chapel by the court door,
// the kitchen, dormitories and a store on the ground storey; dormitories and a reading room above
// the shops of a gate market's range (shops and their stores below, the shopkeepers' rooms above) and the caravanserai's
// (a common room, its kitchen, a store and a stable below; the merchants' rooms above)
const QB_IX_MARKET={name:'market',wealth:.5,program:(l,a)=>l?(a>=120?['bedroom','store','bedroom']:['bedroom','store']):(a>=120?['shop','store','shop','store']:['shop','store'])};
const QB_IX_INN={name:'inn',wealth:.45,program:(l,a)=>l?(a>=120?['bedroom','bedroom','bedroom','store']:['bedroom','bedroom']):(a>=120?['tavern','kitchen','store','stable']:['tavern','store'])};
const QB_IX_MONKS={name:'monks',wealth:.4,program:(l,a)=>l?(a>=150?['dormitory','study','dormitory','store']:['dormitory','study']):(a>=150?['shrine','kitchen','dormitory','store']:['shrine','dormitory'])};
// the shell from a building's listed stacks: the biggest footprint standing on the ground (base within 2.6 m), at least 4 x 4 m
// and a 2.4 m storey; then its upper storeys: a stack raised on its top (within 0.4 m), centred on it (within 1 m), at least
// 0.8 of its plan, adds its storeys (a Xanadu tenement's three storeys over its ground block), again while one does. hs: every
// storey's height, the ground first (at most 4); null when none (a shrine, a wall, an open market)
function qnShellOf(list){let best=null;for(const s of list||[]){if(s.y>2.6||Math.min(s.w,s.d)<4||s.hs[0]<2.4)continue;if(!best||s.w*s.d>best.w*best.d)best=s;}
 if(!best)return null;const hs=best.hs.slice();let top=best.y+hs.reduce((a,b)=>a+b,0),more=true;
 while(more&&hs.length<4){more=false;for(const s of list){if(s===best||Math.abs(s.y-top)>.4||Math.hypot(s.x-best.x,s.z-best.z)>1||s.w*s.d<.8*best.w*best.d)continue;
  for(const h of s.hs)if(hs.length<4&&h>=2.2)hs.push(h);top=s.y+s.hs.reduce((a,b)=>a+b,0);more=true;break;}}
 const r=v=>Math.round(v*100)/100,H=hs.slice(0,4).map(r);
 return{x:r(best.x),y:r(best.y),z:r(best.z),w:r(best.w),d:r(best.d),ry:r(best.ry),hs:H,h:H[0],n:H.length,
  sig:[best.x,best.y,best.z,best.w,best.d,best.ry].map(v=>r(v)).concat(H).join(',')};}
// the programme a building's tags ask for (kits/interiors IX.BUILDING_PROGRAMS), its wealth; null: no interior
const QB_IX_WEALTH={poor:.25,middle:.5,rich:.8,civic:.7};
function qnIxProgram(key){const D=VERN.defs[key];if(!D)return null;const T=D.tags||{},ty=T.type||[],has=t=>ty.indexOf(t)>=0,w=QB_IX_WEALTH[T.wealth];
 const p=has('tavern/inn')?'tavern':has('religious')?'temple':has('industry')?'workshop':has('market/shop')?(has('single-family dwelling')||has('multi-family dwelling')?'shop':'shop'):
  has('single-family dwelling')||has('multi-family dwelling')?'dwelling':has('civic')?'civic':has('infrastructure')?'farm':null;   /* 'farm': store rooms (a granary) */
 return p?{program:p,wealth:w==null?.5:w}:null;}
// a wall along a -> b (the building's frame), y0..y1, its centre line moved off along n by off, thick; the openings
// [{u (centre along a -> b), w, y0, y1}] cut out (a door's full height; a window's sill and head kept)
function qnIxWall(a,b,n,off,thick,y0,y1,ops,item,c){const dx=b[0]-a[0],dz=b[1]-a[1],L=Math.hypot(dx,dz);if(L<.05)return;const t=[dx/L,dz/L],ry=Math.atan2(-t[1],t[0]);
 const at=(u,y,h,len)=>{if(len<.04||h<.04)return;const p=[a[0]+t[0]*u+n[0]*off,a[1]+t[1]*u+n[1]*off];vB(item,p[0],y,p[1],len,h,thick,ry,c);};
 const os=(ops||[]).map(o=>({u0:Math.max(0,o.u-o.w/2),u1:Math.min(L,o.u+o.w/2),y0:o.y0==null?0:o.y0,y1:o.y1==null?y1-y0:o.y1})).sort((p,q)=>p.u0-q.u0);
 let u=0;for(const o of os){at((u+o.u0)/2,y0,y1-y0,o.u0-u);if(o.y0>.05)at((o.u0+o.u1)/2,y0,o.y0,o.u1-o.u0);if(o.y1<y1-y0-.05)at((o.u0+o.u1)/2,y0+o.y1,y1-y0-o.y1,o.u1-o.u0);u=Math.max(u,o.u1);}
 at((u+L)/2,y0,y1-y0,L-u);}
// a slab with holes (a stair's well), y0..y1, in a material (the building's frame): kits/interiors' floors are polygons
function qnIxSlab(poly,holes,y0,y1,mat){const sh=new THREE.Shape(poly.map(p=>new THREE.Vector2(p[0],-p[1])));
 (holes||[]).forEach(h=>sh.holes.push(new THREE.Path(h.map(p=>new THREE.Vector2(p[0],-p[1])))));
 const m=new THREE.Mesh(new THREE.ExtrudeGeometry(sh,{depth:y1-y0,bevelEnabled:false}),mat);m.rotation.x=-Math.PI/2;m.position.y=y0;m.receiveShadow=true;return m;}
// the ceilings' lacquer, one material a colour for every type (a clone a type compiled a shader program each, and a clone
// loses the world-UV hook, Material.copy not carrying onBeforeCompile: 2026-11-16, the verify's GPU ran out of programs)
const QB_IX_CEIL={};
function qnIxCeilMat(hex){if(QB_IX_CEIL[hex])return QB_IX_CEIL[hex];const m=MAT.qLacq.clone();m.onBeforeCompile=MAT.qLacq.onBeforeCompile;
 if(MAT.qLacq.customProgramCacheKey)m.customProgramCacheKey=MAT.qLacq.customProgramCacheKey;m.color.setHex(hex);return QB_IX_CEIL[hex]=m;}
// a stair (solid steps, one a riser, each down to its storey's floor) or a ladder (rungs on two rails), as kits/interiors
// planned it: centre, dir (up), run, w, rise, risers, y0
function qnIxStair(S,c){const n=Math.max(1,S.risers),rh=S.rise/n,d=S.dir,ry=Math.atan2(-d[1],d[0])+Math.PI/2;
 if(S.kind==='ladder'){for(const e of[-1,1]){const q=[S.centre[0]-d[1]*e*S.w/2,S.centre[1]+d[0]*e*S.w/2];vB('vWood',q[0],S.y0,q[1],.08,S.rise,S.run,ry,c);}
  for(let i=1;i<n;i++){const u=-S.run/2+S.run*i/n;vB('vWood',S.centre[0]+d[0]*u,S.y0+i*rh-.03,S.centre[1]+d[1]*u,S.w,.05,.08,ry,c);}return;}
 for(let i=0;i<n;i++){const u=-S.run/2+S.run*(i+.5)/n;vB('vWood',S.centre[0]+d[0]*u,S.y0,S.centre[1]+d[1]*u,S.w,(i+1)*rh,S.run/n+.02,ry,c);}}
// one building type: plan its storeys, draw them and furnish them into a group in the building's frame (y 0 at the plot's
// ground). shell: qnShellOf's; key: the kit key (its tags pick the programme); seed; door: the street door the builder drew,
// in the shell's frame (qnIxDoorOf: {n [nu, nv] its face's outward normal, t along the face, w, h}; default the front's
// middle). Returns {G, plan, F (qnFurnishRooms' result: F.placed the pieces), door, ms} or null (no programme, no shell,
// no kits/interiors on the page). With a drawn door, the street doorway is drawn through: jambs and a threshold over the wall's depth, and a
// depth-only pane (QB_IX_PORTAL) on the face, so an open door shows the room, not the body's solid face behind it
function qnIxType(shell,key,seed,door,prog){const P=prog||qnIxProgram(key),IX=typeof KratorInteriors!=='undefined'?KratorInteriors:null;if(!P||!shell||!IX||!IX.planBuilding)return null;
 const t0=performance.now(),inset=.3,hw=shell.w/2-inset,hd=shell.d/2-inset,c=Math.cos(shell.ry),s=Math.sin(shell.ry);
 const W=(u,v)=>[shell.x+u*c+v*s,shell.z-u*s+v*c];   /* the stack's frame (+v its front) to the building's */
 /* the storeys: each planner level's clear height is its drawn storey less the slab, so level k's floor lies on storey k's base */
 const Dr=door||{n:[0,1],t:0,w:1.2,h:2.2},side=Dr.n[0]!==0,ext=side?hd:hw,dw=Math.max(.95,Math.min(Dr.w+.1,2*ext-1)),tt=Math.max(-ext+dw/2+.35,Math.min(ext-dw/2-.35,Dr.t));
 const fp=(off,t)=>side?W(Dr.n[0]*off,t):W(t,Dr.n[1]*off);   /* a point off the shell's centre along the door's normal, t along its face */
 const poly=[W(-hw,-hd),W(hw,-hd),W(hw,hd),W(-hw,hd)],y=shell.y+.06,SL=.2,hs=shell.hs||[shell.h],levels=hs.map(v=>({h:Math.max(2.2,v-SL)}));
 let B=null;try{B=IX.planBuilding({id:'qiblai.type.'+key+'.'+IX.hash(shell.sig),poly,y,levels,doors:[{at:fp(side?hw:hd,tt),w:dw}],culture:'xanadu',wealth:P.wealth,
  wall:.2,partition:.12,slab:.2,roof:'flat',windows:false},P.program,{seed:seed|0});}catch(e){return{error:'plan: '+(e&&e.message||e)};}
 const G=new THREE.Group();G.name='interior-type:'+key;
 // the shell drawn with the kit's items into G (kput's frame is the world's: none is set here, so G's frame is the building's)
 const saveK=KXF;KXF=null;const w0=xC(0xece4d6);   /* fixed colours: this runs on demand, after the page's draws */
 const ceilC=xC(P.program==='temple'?0x2a4a7a:P.name==='monks'?0x6a2a24:0x7a4a32),Lv=B.levels,top=Lv[Lv.length-1];
 vB('qPlankB',shell.x,shell.y,shell.z,shell.w-2*inset,.06,shell.d-2*inset,shell.ry,xC(0xf0e8dc));   /* the ground floor */
 vB('qLacqB',shell.x,top.y+top.h-.12,shell.z,shell.w-2*inset,.1,shell.d-2*inset,shell.ry,ceilC);   /* the top storey's ceiling */
 for(const Wl of B.walls){const n=Wl.kind==='exterior'?[-Wl.out[0],-Wl.out[1]]:[0,0],y1=Wl.y+Wl.h-(Wl.level===Lv.length-1?.12:0);
  qnIxWall(Wl.a,Wl.b,n,Wl.kind==='exterior'?Wl.thick/2:0,Wl.thick,Wl.y,y1,Wl.openings,'xWashB',Wl.kind==='exterior'?w0:w0.clone().multiplyScalar(.94));}
 for(const S of B.stairs||[])if(S.centre)qnIxStair(S,xC(0x7a5a3c));
 /* the street doorway through the wall's depth (the face to the lining): two jambs, a lintel, a threshold */
 const fw=side?shell.w/2:shell.d/2,dep=fw-(side?hw:hd)+.02,mid=(fw+(side?hw:hd))/2,bry=shell.ry+(side?Math.PI/2:0),dh=Math.max(2,Math.min(Dr.h,hs[0]-.3));
 if(door&&!door.noPortal)for(const e of[-1,1]){const q=fp(mid,tt+e*(dw/2+.06));vB('xWashB',q[0],shell.y,q[1],.12,dh+.05,dep,bry,w0);}
 if(door&&!door.noPortal){const q=fp(mid,tt);vB('xWashB',q[0],shell.y+dh,q[1],dw+.24,.25,dep,bry,w0);vB('qPlankB',q[0],shell.y,q[1],dw,.06,dep,bry,xC(0xf0e8dc));}
 KXF=saveK;kbake(G);for(const k in KIT.items)KIT.items[k].length=0;
 /* the upper floors: a plank slab over a lacquered ceiling, each with its stair's well cut out */
 if(Lv.length>1){const mC=qnIxCeilMat(ceilC.getHex());for(const F of B.floors||[]){if(!F.level)continue;
  G.add(qnIxSlab(F.poly,F.holes,F.y-SL+.04,F.y,MAT.qPlank));G.add(qnIxSlab(F.poly,F.holes,F.y-SL,F.y-SL+.04,mC));}}
 const rooms=B.rooms;
 const F=qnFurnishRooms(rooms,G,{seed:33871+(seed|0),noTags:true,perType:3,passes:2,backtrack:4,name:'furniture:'+key});
 /* drawn before the page (renderOrder -2), then the portal (-1) on the face, then the body, whose face the portal hides */
 G.traverse(o=>{if(o.isMesh)o.renderOrder=-2;});
 if(door&&!door.noPortal){const q=fp(fw+.012,tt),m=new THREE.Mesh(new THREE.PlaneGeometry(dw,dh),QB_IX_PORTAL);m.position.set(q[0],shell.y+dh/2,q[1]);
  m.rotation.y=shell.ry+Math.atan2(Dr.n[0],Dr.n[1]);m.renderOrder=-1;m.castShadow=m.receiveShadow=false;m.raycast=()=>{};m.userData.probeSkip=true;m.name='portal';G.add(m);}
 return{G,plan:B,F,program:P.name||P.program,door:{at:fp(side?hw:hd,tt),w:dw,h:dh},ms:Math.round(performance.now()-t0)};}
// the Xanadu kit's houses whose way in is no door record (core/door) but an archway: the merchant's konak's arch with its two
// timber leaves ajar (u 3.2 on its front). door.noPortal: a doorway walked through with no pane drawn in it
const QB_IX_ARCH={xa_rich_c:{n:[0,1],t:3.2,w:2.4,h:3.2}};
// the depth-only pane in a street doorway: it writes depth and no colour, so the body's solid face behind it (drawn later)
// fails the depth test there and the room drawn before it shows (the kit's bodies are solid: the Vernacular's locked doors)
const QB_IX_PORTAL=new THREE.MeshBasicMaterial({colorWrite:false});
// the street door a builder drew on a shell: the KDOOR record (core/door) on one of its faces with its sill on the shell's
// base, the front's first (then the nearest the face's middle). pose {x, z, y, ry}: the building's place. Returns
// {D, n, t, w, h} in the shell's frame, or null
function qnIxDoorOf(shell,pose,doors){let best=null,bs=1e9;const c=Math.cos(pose.ry),s=Math.sin(pose.ry),c2=Math.cos(shell.ry),s2=Math.sin(shell.ry);
 for(const D of doors||[]){const dx=D.at[0]-pose.x,dz=D.at[2]-pose.z,u=dx*c-dz*s-shell.x,v=dx*s+dz*c-shell.z,su=u*c2-v*s2,sv=u*s2+v*c2;
  if(Math.abs(D.at[1]-pose.y-shell.y)>.35)continue;
  /* on a face: within 0.6 m inside it, or up to 1.3 m out in front of it (a door at the front of a porch or an iwan: the manor's) */
  const on=e=>e>-.6&&e<1.3;let n=null,t=0;if(on(Math.abs(sv)-shell.d/2)&&Math.abs(su)<shell.w/2){n=[0,sv>0?1:-1];t=su;}
  else if(on(Math.abs(su)-shell.w/2)&&Math.abs(sv)<shell.d/2){n=[su>0?1:-1,0];t=sv;}
  if(!n)continue;const sc=(n[1]===1?0:100)+Math.abs(t);if(sc<bs){bs=sc;best={D,n,t:Math.round(t*10)/10,w:Math.round(D.w*10)/10,h:Math.round(D.h*10)/10};}}
 return best;}
// a type's plan into a core/walk registry at a building's place (pose {x, z, y, ry}): kits/interiors' IX.walk.register on a
// view of W that turns the building's frame into the world's (each wall block a square about its centre, as the planner's
// are). ground: the ground's height outside the street door (world); the entry flight rises from it. Returns its report
function qnIxWalk(T,pose,W,ground,tag){const IX=KratorInteriors;if(!T||!T.plan||!W||!IX.walk)return null;
 const c=Math.cos(pose.ry),s=Math.sin(pose.ry),f=(x,z)=>[pose.x+x*c+z*s,pose.z-x*s+z*c],Y=pose.y;
 const V={floor:o=>{const r=o.rect;return W.poly({pts:[[r[0],r[2]],[r[1],r[2]],[r[1],r[3]],[r[0],r[3]]].map(q=>f(q[0],q[1]).concat(o.y+Y)),name:o.name,tag:o.tag});},
  strip:o=>{const a=f(o.a[0],o.a[1]),b=f(o.b[0],o.b[1]);return W.strip({a:[a[0],a[1],o.a[2]+Y],b:[b[0],b[1],o.b[2]+Y],w:o.w,name:o.name,tag:o.tag});},
  poly:o=>W.poly({pts:o.pts.map(q=>f(q[0],q[1]).concat(q[2]+Y)),name:o.name,tag:o.tag}),
  block:(b,tg)=>{const m=f((b[0]+b[1])/2,(b[2]+b[3])/2),h=Math.max(b[1]-b[0],b[3]-b[2])/2;return W.block([m[0]-h,m[0]+h,m[1]-h,m[1]+h,b[4]+Y,b[5]+Y],tg);},
  blocked:(x,y,z,r,h)=>{const m=f(x,z);return W.blocked(m[0],y+Y,m[1],r,h);},
  floorBelow:(x,z,y,st)=>{const m=f(x,z);return W.floorBelow(m[0],m[1],y+Y,st);}};
 return IX.walk.register({id:tag,rooms:[],buildings:[T.plan],baseY:ground-Y},V,{tag,blockStep:.15});}   /* 0.15 m blocks: a 0.9 m door clears ~0.95 (0.3's left 0.8, tight for a 0.35 m walker) */
