// TARGET: city — the walk-in interiors, on demand (the owner, 2026-11-15: "work on interiors", walk-in, on demand; PLAN.md
// section 4: "the interiors only on demand (a monastery's hall, the Hall of the Decree, a hostel), not city-wide")
// Four rooms inside their own buildings, each the kit's interior piece drawn in place (kits/qiblai src/89q5: o.cut false, the
// building's storey plan less its walls, its storey height) and furnished by the kit's pass (qnFurnishRooms, 89q5f):
//   the sanctum of the Rainbow Temple   the temple's sanctum storey on the third terrace (qb_temple, 89q4)
//   the council chamber                 the Hall of the Decree's ground storey (qb_hall_decree, the Temple Mountain's NW quarter)
//   an assembly hall                    the hall of the first whole great monastery the plan places (its spoke's colour)
//   a hostel dormitory                  the ground storey of the pilgrims' hostel nearest the south avenue on the kora
// Nothing is built at load: a room is placed, baked and furnished into a group of its own the first time the camera comes
// within QC_IX_NEAR of it, and shown while within QC_IX_FAR. window._qiblaiIx reports them; buildAll() builds every one (the
// verify's check).
const QC_IX_NEAR=70,QC_IX_FAR=160;
const QC_IX=(function(){const S={rooms:[],built:0,pieces:0,fails:[],byRoom:[],missing:{},tex:{meshes:0,mapped:0,bare:[]},ms:0};
 const report=()=>{window._qiblaiIx={rooms:S.rooms.map(R=>({name:R.name,key:R.key,built:R.built,at:[+R.cx.toFixed(1),+R.cy.toFixed(1),+R.cz.toFixed(1)]})),
  built:S.built,pieces:S.pieces,fails:S.fails.slice(0,8),byRoom:S.byRoom,missing:S.missing,tex:S.tex,ms:S.ms,buildAll:S.buildAll};};
 if(!VERN.defs.qb_ix_sanctum||!QC_LM){report();return S;}
 // a room inside a building: (bx, bz, bry) the building's plot, (lx, lz, ly) the storey's centre and base in its frame
 const add=(name,key,bx,bz,bry,by,lx,lz,ly,o)=>{const p=loc(bx,bz,lx,lz,bry);
  S.rooms.push({name,key,x:p[0],z:p[1],ry:bry,o:Object.assign({cut:false,y:by+ly},o),cx:p[0],cy:by+ly+o.H/2,cz:p[1],G:null,built:false});};
 const L=QC_LM,LY=qcD(L.level,0),inset=.9;
 // the temple's sanctum: 28 m square, on the third of three 6 m terraces (each 0.3 m over the last's roof), its storey 5.2 m;
 // the terrace's roof plate runs on under it (0.98 m over the storey's base) and its own roof slab hangs 0.8 m into it, so the
 // room stands on the plate, 3.3 m to its ceiling (measured by a ray down the drawn temple, 2026-11-15)
 add('Sanctum of the Rainbow Temple','qb_ix_sanctum',L.x,L.z,0,LY,0,0,3*(6+.3)+1.0,{W:28-inset,D:28-inset,H:3.3});
 // the Hall of the Decree: at (-100, -100) in the Temple Mountain, its storey 40 x 28 m on a 2.2 m plinth, set 3 m back
 add('Council chamber of the Prismarchy','qb_ix_hall',L.x-100,L.z-100,0,LY,0,-3,2.2,{W:40-inset,D:28-inset,H:6.0,sideDoors:true});
 // a whole great monastery's assembly hall: 24 x 17 m, its storey 5 m on the court's 1.2 m and its own 0.6 m plinth, 8.3 m back
 const m=QC_PLACE.find(p=>p.kind==='monastery'&&p.key==='qb_monastery');
 if(m)add('Assembly hall ('+QSPOKE[m.o.v%8].name+')','qb_ix_assembly',m.x,m.z,m.ry,qcD(m.o.y,0),0,-26+7+2.2+8.5,1.8,{W:24-inset,D:17-inset,H:5.0,v:m.o.v});
 // the hostel nearest the south avenue on the kora: its storey 24 x 14 m, 3.6 m on a 0.7 m plinth, 1 m back
 const hs=QC_PLACE.filter(p=>p.key==='qb_hostel'&&p.z>L.z).sort((a,b)=>(Math.abs(a.x-L.x)-Math.abs(b.x-L.x))||(a.z-b.z));
 if(hs.length){const h=hs[0];add('Hostel dormitory','qb_ix_hostel',h.x,h.z,h.ry,qcD(h.o.y,0),0,-1,.7,{W:24-inset,D:14-inset,H:3.6});}
 S.build=function(R){if(R.built)return R;const t0=performance.now(),G=new THREE.Group();G.name='interior:'+R.key;scene.add(G);
  const r0=QB_ROOMS.length;TSTAT.cur=R.key+'/0';VERN.place(G,R.key,R.x,R.z,R.ry,R.o);TSTAT.cur=null;kbake(G);for(const n in KIT.items)KIT.items[n].length=0;
  const F=qnFurnishRooms(QB_ROOMS.slice(r0),G,{seed:33861+S.rooms.indexOf(R),frag:'90t-qc-interiors.js',name:'furniture:'+R.key,perType:3,passes:2,backtrack:4});
  R.G=G;R.built=true;S.built++;S.pieces+=F.pieces;S.fails=S.fails.concat(F.fails);S.byRoom=S.byRoom.concat(F.byRoom);
  for(const k in F.missing)S.missing[k]=qcD(S.missing[k],0)+F.missing[k];
  if(F.tex){S.tex.meshes+=F.tex.meshes;S.tex.mapped+=F.tex.mapped;S.tex.bare=S.tex.bare.concat(F.tex.bare).slice(0,12);}
  S.ms+=Math.round(performance.now()-t0);report();return R;};
 S.buildAll=function(){S.rooms.forEach(S.build);return window._qiblaiIx;};
 FRAME_HOOKS.push(()=>{const P=camera.position;for(const R of S.rooms){const d=Math.hypot(P.x-R.cx,P.y-R.cy,P.z-R.cz);
  if(!R.built&&d<QC_IX_NEAR){try{S.build(R);}catch(e){R.built=true;reportErr('qiblai interior '+R.name+': '+(e&&e.stack||e));}}
  if(R.G)R.G.visible=d<QC_IX_FAR;}});
 report();return S;})();
