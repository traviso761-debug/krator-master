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
// ground). shell: qnShellOf's; key: the kit key (its tags pick the programme); seed. Returns {G, plan, F (qnFurnishRooms'
// result: F.placed the pieces), ms} or null (no programme, no shell, no kits/interiors on the page)
function qnIxType(shell,key,seed){const P=qnIxProgram(key),IX=typeof KratorInteriors!=='undefined'?KratorInteriors:null;if(!P||!shell||!IX||!IX.planBuilding)return null;
 const t0=performance.now(),inset=.3,hw=shell.w/2-inset,hd=shell.d/2-inset,c=Math.cos(shell.ry),s=Math.sin(shell.ry);
 const W=(u,v)=>[shell.x+u*c+v*s,shell.z-u*s+v*c];   /* the stack's frame (+v its front) to the building's */
 /* the storeys: each planner level's clear height is its drawn storey less the slab, so level k's floor lies on storey k's base */
 const poly=[W(-hw,-hd),W(hw,-hd),W(hw,hd),W(-hw,hd)],door=W(0,hd),y=shell.y+.06,SL=.2,hs=shell.hs||[shell.h],levels=hs.map(v=>({h:Math.max(2.2,v-SL)}));
 let B=null;try{B=IX.planBuilding({id:'qiblai.type.'+key+'.'+IX.hash(shell.sig),poly,y,levels,doors:[{at:door,w:1.2}],culture:'xanadu',wealth:P.wealth,
  wall:.2,partition:.12,slab:.2,roof:'flat',windows:false},P.program,{seed:seed|0});}catch(e){return{error:'plan: '+(e&&e.message||e)};}
 const G=new THREE.Group();G.name='interior-type:'+key;
 // the shell drawn with the kit's items into G (kput's frame is the world's: none is set here, so G's frame is the building's)
 const saveK=KXF;KXF=null;const w0=xC(0xece4d6);   /* fixed colours: this runs on demand, after the page's draws */
 const ceilC=xC(P.program==='temple'?0x2a4a7a:0x7a4a32),Lv=B.levels,top=Lv[Lv.length-1];
 vB('qPlankB',shell.x,shell.y,shell.z,shell.w-2*inset,.06,shell.d-2*inset,shell.ry,xC(0xf0e8dc));   /* the ground floor */
 vB('qLacqB',shell.x,top.y+top.h-.12,shell.z,shell.w-2*inset,.1,shell.d-2*inset,shell.ry,ceilC);   /* the top storey's ceiling */
 for(const Wl of B.walls){const n=Wl.kind==='exterior'?[-Wl.out[0],-Wl.out[1]]:[0,0],y1=Wl.y+Wl.h-(Wl.level===Lv.length-1?.12:0);
  qnIxWall(Wl.a,Wl.b,n,Wl.kind==='exterior'?Wl.thick/2:0,Wl.thick,Wl.y,y1,Wl.openings,'xWashB',Wl.kind==='exterior'?w0:w0.clone().multiplyScalar(.94));}
 for(const S of B.stairs||[])if(S.centre)qnIxStair(S,xC(0x7a5a3c));
 KXF=saveK;kbake(G);for(const k in KIT.items)KIT.items[k].length=0;
 /* the upper floors: a plank slab over a lacquered ceiling, each with its stair's well cut out */
 if(Lv.length>1){const mC=qnIxCeilMat(ceilC.getHex());for(const F of B.floors||[]){if(!F.level)continue;
  G.add(qnIxSlab(F.poly,F.holes,F.y-SL+.04,F.y,MAT.qPlank));G.add(qnIxSlab(F.poly,F.holes,F.y-SL,F.y-SL+.04,mC));}}
 const rooms=B.rooms;
 const F=qnFurnishRooms(rooms,G,{seed:33871+(seed|0),noTags:true,perType:3,passes:2,backtrack:4,name:'furniture:'+key});
 return{G,plan:B,F,program:P.program,ms:Math.round(performance.now()-t0)};}
