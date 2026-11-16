// TARGET: city — every lot building's interior, on demand (the owner, 2026-11-15: "work on wiring in kit interiors to all
// buildings"). Each lot's building listed its storey stacks while 90r drew it (QB_SHELLREC, kits/qiblai 89q5s); its shell is
// the biggest that stands on the ground (qnShellOf), its programme its tags' (qnIxProgram: a dwelling, a shop, a workshop, a
// tavern, a temple, a civic hall). Lots that share a key and a shell share a TYPE: planned, drawn and furnished once in the
// building's own frame (qnIxType: kits/interiors' planBuilding and furnishRoom, the kit's textured items), the first time the
// camera comes within QC_LIX_NEAR of a lot of that type; every such lot nearby then takes a clone of it at its pose, its
// pieces registered in core/tags at their place, and hides it again beyond QC_LIX_FAR. One new type and a few clones a frame,
// so the walk never stalls on more than one plan. The four great rooms (90t) are their buildings' own; the ground storey only.
// window._qiblaiLix reports; buildTypes(n) builds the n commonest types (the verify's check).
const QC_LIX_NEAR=34,QC_LIX_FAR=80;
const QC_LIX=(function(){const S={lots:[],types:{},nTypes:0,built:0,clones:0,noShell:0,noProgram:0,open:0,fails:[],ms:0,byProgram:{},tex:{meshes:0,mapped:0}};
 const report=()=>{window._qiblaiLix={lots:S.lots.length,types:S.nTypes,built:S.built,clones:S.clones,noShell:S.noShell,noProgram:S.noProgram,open:S.open,
  byProgram:S.byProgram,fails:S.fails.slice(0,8),ms:S.ms,tex:S.tex,buildTypes:S.buildTypes};};
 if(typeof qnShellOf!=='function'){report();return S;}
 const hosts=new Set(((typeof QC_IX!=='undefined'&&QC_IX.rooms)||[]).map(R=>R.host).filter(Boolean));   /* a lot that holds one of 90t's great rooms keeps that room */
 for(const p of QC_PLACE){if(p.kind!=='lot')continue;if(QB_IX_OPEN[p.key]||hosts.has(p)){p.stacks=null;S.open++;continue;}const sh=qnShellOf(p.stacks);p.stacks=null;
  if(!sh){S.noShell++;continue;}if(!qnIxProgram(p.key)){S.noProgram++;continue;}
  const tk=p.key+'|'+sh.sig;if(!S.types[tk]){S.types[tk]={tk,key:p.key,sh,n:0,T:null,tried:false};S.nTypes++;}S.types[tk].n++;
  S.lots.push({p,tk,G:null,x:p.x,z:p.z});}
 // a type built once (its template is not in the scene: lots take clones of it)
 S.buildType=function(ty){if(ty.tried)return ty.T;ty.tried=true;const t0=performance.now();
  try{const T=qnIxType(ty.sh,ty.key,qcHash(ty.tk));if(T&&T.G){ty.T=T;S.built++;S.byProgram[T.program]=qcD(S.byProgram[T.program],0)+1;
    if(T.F){S.fails=S.fails.concat(T.F.fails.map(f=>ty.key+': '+f));if(T.F.tex){S.tex.meshes+=T.F.tex.meshes;S.tex.mapped+=T.F.tex.mapped;}}}
   else if(T&&T.error)S.fails.push(ty.key+': '+T.error);}
  catch(e){S.fails.push(ty.key+': '+(e&&e.message||e));}
  S.ms+=Math.round(performance.now()-t0);report();return ty.T;};
 // a lot's clone of its type, at its pose; its pieces registered where they stand
 const T0=()=>KTAGS.page||(KTAGS.page=KTAGS.create({build:'xanadu'}));
 S.place=function(L){const ty=S.types[L.tk],T=ty&&ty.T;if(!T)return;const p=L.p,y=qcD(p.o.y,0),g=T.G.clone();
  g.name='interior:'+p.id;g.position.set(p.x,y,p.z);g.rotation.y=p.ry;scene.add(g);L.G=g;S.clones++;
  const TG=T0();for(const q of(T.F&&T.F.placed)||[]){const w=loc(p.x,p.z,q.x,q.z,p.ry);
   TG.add({prefix:'ixf','class':'furniture',kind:q.kind,key:q.key,name:q.name,at:[w[0],y+q.y,w[1]],ry:q.ry+p.ry,size:q.size,tags:Object.assign({},q.tags,{building:p.id}),frag:'90u-qc-lot-interiors.js'});}};
 S.buildTypes=function(n){const L=Object.values(S.types).sort((a,b)=>b.n-a.n).slice(0,n==null?8:n);L.forEach(S.buildType);report();return window._qiblaiLix;};
 // the frame hook: every few frames, the lots near the camera; at most one new type and six clones a pass
 let tick=0;FRAME_HOOKS.push(()=>{if((tick++)%6)return;const P=camera.position;let newType=0,newClone=0;
  for(const L of S.lots){const d=Math.hypot(P.x-L.x,P.z-L.z);
   if(L.G){L.G.visible=d<QC_LIX_FAR;continue;}if(d>=QC_LIX_NEAR)continue;
   const ty=S.types[L.tk];if(!ty.tried){if(newType)continue;newType++;S.buildType(ty);}
   if(ty.T&&newClone<6){S.place(L);newClone++;}}
  if(newClone)report();});
 report();return S;})();
