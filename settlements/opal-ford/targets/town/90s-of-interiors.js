// ================================================================= ŌPAL-PHŌRḌ — walking into the Iridescent Order's house, on demand
// The house's buildings (89zp OF_HOUSE, kind 'order') are walked into as Grēṭ-Āil's are (settlements/azure-dream targets/isle
// 90ai, which is Qiblai's city's 90u over its own place list): each listed its storey stacks while 90r drew it (QB_SHELLREC,
// kits/qiblai 89q5s); its shell is the biggest that stands on the ground (qnShellOf), its programme its tags' (qnIxProgram) but
// for the house's own pieces (src/89q8): a range of cells is a row of cells (OF_IX_CELLS), a college range the school's lecture
// hall, library and kitchen below its dormitories (OF_IX_COLLEGE). The great monastery's cell ranges are buildings of their
// own on the monks' programme (QB_IX_MONKS). Buildings that share a key and a shell share a TYPE, planned, drawn and furnished
// once in the building's frame (qnIxType: kits/interiors' planBuilding and furnishRoom, the catalog's pieces; kit.json
// "interiors") the first time the camera comes within OF_IX_NEAR, cloned to each such building nearby, hidden beyond OF_IX_FAR.
// A building's door is the one its builder drew (core/door, qnIxDoorOf), unlocked when it takes its clone; the plan's floors,
// walls and stairs go into core/walk (qnIxWalk). window._ofIx reports; buildTypes(n) builds the n commonest; walkIn(n) is
// verify.py's check. The blueprint's own room plan (iridescent/BLUEPRINT.md) is not followed room by room: the kit's planner
// lays each building's rooms from its programme. [web]: three.js clones; the plans and their walk records are the kit's [G data].
reseed(OF.SEED+5);
const OF_IX_NEAR=40,OF_IX_FAR=90;
const OF_IX_CELLS={name:'cells',wealth:.35,program:(l,a)=>Array(Math.max(4,Math.round(a/26))).fill('bedroom')};
const OF_IX_COLLEGE={name:'college',wealth:.5,program:(l,a)=>l?(a>=300?['dormitory','dormitory','dormitory','study']:['dormitory','study']):(a>=300?['hall','study','hall','kitchen','store']:['hall','study','store'])};
const OF_IX_PROG={of_cell_range:OF_IX_CELLS,of_college_range:OF_IX_COLLEGE,of_college_range_m:OF_IX_COLLEGE,of_college_range_s:OF_IX_COLLEGE};
/* the great monastery's hall (its 24 x 17 m stack of three storeys, kits/qiblai 89q3): the Hall of the Bow on the ground storey,
   the Masters' Gallery over it, the Gallery of the Bow at the top behind the moonglass (iridescent/BLUEPRINT.md, sheets M1-MR) */
const OF_IX_BOW={name:'bow',wealth:.85,program:(l,a)=>l===1?['study','study']:['shrine']};

// ---------------------------------------------------------------- the blueprint's own pieces (FURNITURE.md's NEW list)
// The prism stand, the moonglass screen, the colour-chart rack, the lens-grinding wheel and the Order's banner are owed to the
// catalog (kits/catalog's Xanadu file reaches 61 builds: with the all-builds rebuild, TODO.md); until then this page draws them
// itself, in the Hall and the Galleries of the Bow (in the hall's type, so every clone has them, each registered with core/tags
// as the type's furniture is) and the lens wheels in the Prism Workshop's yard. [web]: three.js meshes, one material set.
const OF_PROP_MAT=(function(){const M=(c,o)=>new THREE.MeshStandardMaterial(Object.assign({color:c,roughness:.6,metalness:0},o||{}));
 return{lac:M(0x2a9a94,{roughness:.35}),gilt:M(0xd4a640,{roughness:.3,metalness:.7}),prism:M(0xe8f4f4,{roughness:.05,metalness:.1,transparent:true,opacity:.55}),
  glass:M(0xeef0ea,{roughness:.2,transparent:true,opacity:.7}),wood:M(0x5a4232,{roughness:.8}),iron:M(0x4a4a4a,{roughness:.5,metalness:.6}),
  stone:M(0x9a9484,{roughness:.9}),silk:M(0x2a9a94,{roughness:.7,side:THREE.DoubleSide}),
  bands:[0xc0392b,0xe67e22,0xf1c40f,0x27ae60,0x2a9a94,0x2e5aa8,0x6a3a8a,0xf4efe4].map(c=>M(c,{roughness:.7,side:THREE.DoubleSide}))};})();
function ofPropMesh(kind){const G=new THREE.Group(),M=OF_PROP_MAT,box=(w,h,d,m,x,y,z,ry)=>{const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);o.position.set(x,y,z);if(ry)o.rotation.y=ry;G.add(o);return o;},
  cyl=(r0,r1,h,m,x,y,z,n)=>{const o=new THREE.Mesh(new THREE.CylinderGeometry(r0,r1,h,n||12),m);o.position.set(x,y,z);G.add(o);return o;};
 if(kind==='prism stand'){cyl(.32,.38,.8,M.lac,0,.4,0);cyl(.36,.36,.06,M.gilt,0,.83,0);const p=cyl(.2,.2,.55,M.prism,0,1.15,0,3);p.rotation.z=Math.PI/2;return{G,size:[.8,1.45,.8]};}
 if(kind==='moonglass screen'){for(let i=0;i<3;i++){const x=(i-1)*.92,ry=(i-1)*.35;box(.9,1.8,.03,M.glass,x,1.0,Math.abs(i-1)*.15,ry);box(.94,.06,.06,M.lac,x,1.92,Math.abs(i-1)*.15,ry);box(.94,.06,.06,M.lac,x,.08,Math.abs(i-1)*.15,ry);}return{G,size:[2.8,2,.5]};}
 if(kind==='colour-chart rack'){for(const s of[-1,1])box(.08,2.2,.08,M.wood,s*1,1.1,0);box(2.1,.08,.08,M.wood,0,2.15,0);
  M.bands.forEach((m,i)=>{const o=new THREE.Mesh(new THREE.PlaneGeometry(.22,1.5),m);o.position.set(-.86+i*.245,1.35,.02);G.add(o);});return{G,size:[2.1,2.2,.3]};}
 if(kind==='lens-grinding wheel'){box(1.4,.8,.7,M.wood,0,.4,0);const w=cyl(.45,.45,.12,M.stone,.2,1.15,0,16);w.rotation.x=Math.PI/2;box(.08,.5,.08,M.iron,.2,.85,.32);box(.5,.06,.3,M.wood,-.45,.1,.5);return{G,size:[1.4,1.6,1]};}
 if(kind==='bow banner'){cyl(.05,.05,3.6,M.gilt,0,1.8,0,8);cyl(.18,.22,.12,M.lac,0,.06,0);const c=new THREE.Mesh(new THREE.PlaneGeometry(.9,1.9),M.silk);c.position.set(.47,2.5,0);G.add(c);
  M.bands.slice(0,7).forEach((m,i)=>{const o=new THREE.Mesh(new THREE.PlaneGeometry(.09,.7),m);o.position.set(.47,1.6,.01);o.rotation.z=(i-3)*.14;G.add(o);});return{G,size:[1,3.6,.3]};}
 return null;}
const OF_PROP_KEY={'prism stand':'of_prism_stand','moonglass screen':'of_moonglass_screen','colour-chart rack':'of_colour_chart_rack','lens-grinding wheel':'of_lens_grinding_wheel','bow banner':'of_bow_banner'};
/* the hall type's pieces, in the building's frame (the shell: the hall's stack; its back, toward the spray, at -z) */
function ofBowProps(T,sh){const lv=T.plan&&T.plan.levels||[],y=i=>lv[i]?lv[i].y:null,back=sh.z-sh.d/2,out=[];
 const put=(kind,x,yy,z,ry)=>{if(yy==null)return;const P=ofPropMesh(kind);if(!P)return;P.G.position.set(x,yy,z);P.G.rotation.y=ry||0;P.G.name=kind;T.G.add(P.G);
  out.push({kind,key:OF_PROP_KEY[kind],name:kind,x,y:yy,z,ry:ry||0,size:P.size,tags:{culture:'xanadu'}});};
 put('prism stand',sh.x,y(0),back+2.2,0);for(const s of[-1,1])put('bow banner',sh.x+s*4.5,y(0),back+1.0,0);
 for(const s of[-1,1])for(const dz of[-3,3])put('colour-chart rack',sh.x+s*(sh.w/2-.7),y(1),sh.z+dz,s*-Math.PI/2);
 for(let i=-2;i<=2;i++)put('prism stand',sh.x+i*4,y(2),back+1.1,0);for(const s of[-1,1])put('moonglass screen',sh.x+s*(sh.w/2-2.5),y(2),back+2.6,0);
 if(T.F){T.F.placed=(T.F.placed||[]).concat(out);}return out.length;}
const OF_IX=(function(){const S={lots:[],types:{},nTypes:0,built:0,clones:0,noShell:0,noProgram:0,skipped:0,fails:[],ms:0,byProgram:{},tex:{meshes:0,mapped:0},doors:0,walked:0,ranges:0};
 const report=()=>{window._ofIx={lots:S.lots.length,types:S.nTypes,built:S.built,clones:S.clones,noShell:S.noShell,noProgram:S.noProgram,skipped:S.skipped,noStorey:S.noStorey|0,
  byProgram:S.byProgram,fails:S.fails.slice(0,8),ms:S.ms,tex:S.tex,doors:S.doors,walked:S.walked,ranges:S.ranges,hall:S.hall|0,bowProps:S.bowProps|0,buildTypes:S.buildTypes,walkIn:S.walkIn,error:S.error};};
 if(typeof qnShellOf!=='function'||typeof qnIxType!=='function'){S.error='the Qiblai kit\'s interiors (89q5s) are not on the page';report();return S;}
 const hash=s=>{let h=0x811c9dc5;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,0x01000193)>>>0;}return h;};
 const byId=new Map();for(const D of KDOOR.list){const m=/^(.*)\.\d+(#\d+)?$/.exec(D.id);if(m)(byId.get(m[1])||byId.set(m[1],[]).get(m[1])).push(D);}   /* a builder's doors by their placement: key@x,z */
 S.walk=typeof KWALK!=='undefined'?KWALK:null;
 /* every drawn door's leaf a walk block (core/door: shut, it closes its doorway; open, it clears it), as Grēṭ-Āil's 90ag binds them */
 if(S.walk&&KDOOR.walk)KDOOR.walk(S.walk);
 const addLot=(p,id,sh,prog)=>{const pose={x:p.x,z:p.z,y:ofD(p.o.y,0),ry:p.ry},dr=qnIxDoorOf(sh,pose,byId.get(p.key+'@'+Math.round(p.x)+','+Math.round(p.z)))||(QB_IX_ARCH[p.key]?Object.assign({D:null},QB_IX_ARCH[p.key]):null);if(dr)S.doors++;
  const tk=p.key+'|'+sh.sig+'|'+(prog?prog.name:'')+'|'+(dr?dr.n.join(',')+','+dr.t+','+dr.w+','+dr.h:'-'),c=loc(p.x,p.z,sh.x,sh.z,p.ry);
  if(!S.types[tk]){S.types[tk]={tk,key:p.key,sh,prog:prog||null,door:dr?{n:dr.n,t:dr.t,w:dr.w,h:dr.h,noPortal:!!dr.noPortal}:null,n:0,T:null,tried:false};S.nTypes++;}S.types[tk].n++;
  S.lots.push({p,id,tk,G:null,x:c[0],z:c[1],pose,D:dr?dr.D:null});};
 const house=OF_PLACE.filter(p=>p.kind==='order');
 /* the great monastery's cell ranges (each storey stack 5.5-7.5 m deep, 14 m long or more): the monks' quarters */
 for(const p of house){if(p.key!=='qb_monastery'||!p.stacks)continue;let i=0;
  for(const s of p.stacks){const dd=Math.min(s.w,s.d);if(dd<5.5||dd>7.5||Math.max(s.w,s.d)<14||s.hs[0]>4.4)continue;const sh=qnShellOf([s]);if(sh){addLot(p,p.id+'.range'+(i++),sh,QB_IX_MONKS);S.ranges++;}}
  /* the hall: the stack of three storeys at least 15 m deep */
  const hs=p.stacks.find(s=>Math.min(s.w,s.d)>=15&&s.hs.length>=3);if(hs){const sh=qnShellOf([hs]);if(sh){addLot(p,p.id+'.hall',sh,OF_IX_BOW);S.hall=(S.hall|0)+1;}}
  p.stacks=null;}
 for(const p of house){if(!p.stacks)continue;if(!p.stacks.length){p.stacks=null;S.noStorey=(S.noStorey|0)+1;continue;}
  if(QB_IX_OPEN[p.key]){p.stacks=null;S.skipped++;continue;}
  const sh=qnShellOf(p.stacks);p.stacks=null;if(!sh){S.noShell++;continue;}const prog=OF_IX_PROG[p.key]||null;if(!prog&&!qnIxProgram(p.key)){S.noProgram++;continue;}
  addLot(p,p.id,sh,prog);}
 if(typeof IZDOOR!=='undefined'&&IZDOOR.meshes)for(const im of IZDOOR.meshes(KIT.meshes||{}))if(!im.material.transparent)im.renderOrder=-2;   /* a shut leaf drawn before the doorway's portal */
 // a type built once (its template is not in the scene: buildings take clones of it); a plan short of a required piece is
 // planned again on the next seed, up to three times, and the one with the fewest misses kept
 S.buildType=function(ty){if(ty.tried)return ty.T;ty.tried=true;const t0=performance.now();
  try{let T=null;for(let k=0;k<3;k++){const U=qnIxType(ty.sh,ty.key,hash(ty.tk)+k*7919,ty.door,ty.prog);if(!U||!U.G){if(!T)T=U;break;}
    if(!T||!T.G||U.F.fails.length<T.F.fails.length)T=U;if(!T.F.fails.length)break;}
   if(T&&T.G&&ty.prog===OF_IX_BOW)S.bowProps=ofBowProps(T,ty.sh);   /* the Hall and the Galleries of the Bow: the blueprint's pieces */
   if(T&&T.G){ty.T=T;S.built++;S.byProgram[T.program]=ofD(S.byProgram[T.program],0)+1;
    if(T.F){S.fails=S.fails.concat(T.F.fails.map(f=>ty.key+': '+f));if(T.F.tex){S.tex.meshes+=T.F.tex.meshes;S.tex.mapped+=T.F.tex.mapped;}}}
   else if(T&&T.error)S.fails.push(ty.key+': '+T.error);}
  catch(e){S.fails.push(ty.key+': '+(e&&e.message||e));}
  S.ms+=Math.round(performance.now()-t0);report();return ty.T;};
 const T0=()=>KTAGS.page||(KTAGS.page=KTAGS.create({build:'opal-ford'}));
 S.place=function(L){const ty=S.types[L.tk],T=ty&&ty.T;if(!T)return;const p=L.p,y=ofD(p.o.y,0),g=T.G.clone();
  g.name='interior:'+L.id;g.position.set(p.x,y,p.z);g.rotation.y=p.ry;scene.add(g);L.G=g;S.clones++;
  if(S.walk){const D=L.D,on=D?D.blocks.map(b=>!b.off):[];if(D)S.walk.setBlock(D.blocks,false);   /* the flight's climb test walks through the doorway */
   const a=D?[D.at[0]+Math.sin(D.yaw)*1.2,D.at[2]+Math.cos(D.yaw)*1.2]:[p.x,p.z];
   const ga=S.walk.floorBelow(a[0],a[1],L.pose.y+T.plan.levels[0].y,.1);
   try{if(qnIxWalk(T,L.pose,S.walk,Math.max(terrainH(a[0],a[1]),ga?ga[0]:-1e9),'interior:'+L.id))S.walked++;}catch(e){S.fails.push(p.key+' walk: '+(e&&e.message||e));}
   if(D){D.blocks.forEach((b,i)=>S.walk.setBlock(b,on[i]));D.locked=false;}}
  const TG=T0();for(const q of(T.F&&T.F.placed)||[]){const w=loc(p.x,p.z,q.x,q.z,p.ry);
   TG.add({prefix:'ixf','class':'furniture',kind:q.kind,key:q.key,name:q.name,at:[w[0],y+q.y,w[1]],ry:q.ry+p.ry,size:q.size,tags:Object.assign({},q.tags,{building:L.id}),frag:'90s-of-interiors.js'});}};
 // the walk-in check: for a building of each of the n commonest built types with a drawn door, its clone placed: the door shut
 // blocks the doorway, opened clears it, and a walker from outside reaches every floor and stair of it. The doors shut again after
 S.walkIn=function(n){const out=[];if(!S.walk)return{error:'no core/walk on the page'};
  for(const ty of Object.values(S.types).filter(ty=>ty.T&&ty.door).sort((a,b)=>b.n-a.n).slice(0,n==null?6:n)){
   const L=S.lots.find(L=>L.tk===ty.tk);if(!L)continue;if(!L.G)S.place(L);const tag='interior:'+L.id,P0=L.pose;
   const ar=!L.D&&ty.T.door,w0=ar?loc(P0.x,P0.z,ar.at[0],ar.at[1],P0.ry):null,ay=ar?P0.ry+ty.sh.ry+Math.atan2(ty.door.n[0],ty.door.n[1]):0;
   const D=L.D||{at:[w0[0],P0.y+ty.sh.y,w0[1]],yaw:ay,blocks:[]},ox=Math.sin(D.yaw),oz=Math.cos(D.yaw);
   let shut=true,open=true;if(L.D){KDOOR.close(D);for(let i=0;i<40;i++)KDOOR.step(.1);shut=!!S.walk.blocked(D.at[0],D.at[1]+.1,D.at[2],.3,1.6);KDOOR.open(D,{by:'player'});for(let i=0;i<40;i++)KDOOR.step(.1);
    open=!S.walk.blocked(D.at[0],D.at[1]+.1,D.at[2],.3,1.6);}
   const sx=D.at[0]+ox*2.6,sz=D.at[2]+oz*2.6,sf=S.walk.floorBelow(sx,sz,D.at[1],.1),rb=Math.max(ty.sh.w,ty.sh.d)/2+8;
   const R=S.walk.reach([[sx,Math.max(terrainH(sx,sz),sf?sf[0]:-1e9),sz]],{ground:terrainH,box:[L.x-rb,L.x+rb,L.z-rb,L.z+rb]}),mine=F=>F.tag===tag;
   const un=R.unreached.filter(mine).map(F=>F.name.split('.').slice(-3).join('.'));if(L.D){KDOOR.close(D);for(let i=0;i<40;i++)KDOOR.step(.1);}
   out.push({key:ty.key+(ty.prog?' ('+ty.prog.name+')':''),lot:L.id,shut,open,floors:R.reached.filter(mine).length,unreached:un,ok:shut&&open&&!un.length&&R.reached.some(mine)});}
  return out;};
 S.buildTypes=function(n){Object.values(S.types).sort((a,b)=>b.n-a.n).slice(0,n==null?8:n).forEach(S.buildType);report();return window._ofIx;};
 // the frame hook: every few frames, the buildings near the camera; at most one new type and six clones a pass
 let tick=0;FRAME_HOOKS.push(()=>{if((tick++)%6)return;const P=camera.position;let newType=0,newClone=0;
  for(const L of S.lots){const d=Math.hypot(P.x-L.x,P.z-L.z);
   if(L.G){L.G.visible=d<OF_IX_FAR;continue;}if(d>=OF_IX_NEAR)continue;
   const ty=S.types[L.tk];if(!ty.tried){if(newType)continue;newType++;S.buildType(ty);}
   if(ty.T&&newClone<6){S.place(L);newClone++;}}
  if(newClone)report();});
 report();return S;})();
// the Prism Workshop's yard (89zp OF_HOUSE: the Glaziers' lodge at site u -50, v 216, its front to the south-west): two
// lens-grinding wheels before its door, registered with core/tags as props
(function ofWorkshopYard(){const Hh=OF.HOUSE,TG=KTAGS.page||(KTAGS.page=KTAGS.create({build:'opal-ford'}));let n=0;
 for(const du of[-3.2,3.2]){const x=Hh.x0+204,z=Hh.z0-50+du,y=ofH(x,z),P=ofPropMesh('lens-grinding wheel');if(!P)continue;
  P.G.position.set(x,y,z);P.G.rotation.y=-Math.PI/2;P.G.name='lens-grinding wheel';scene.add(P.G);
  TG.add({'class':'prop',kind:'lens-grinding wheel',key:OF_PROP_KEY['lens-grinding wheel'],name:'a lens-grinding wheel (the Prism Workshop)',at:[x,y,z],ry:-Math.PI/2,size:P.size,tags:{culture:'xanadu'},frag:'90s-of-interiors.js'});n++;}
 window._ofIx.yardProps=n;})();
