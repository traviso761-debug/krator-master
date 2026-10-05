// ================================================================= YS — the material library adapter (core/materials/PLAN.md)
// materials.json names, per material family, the library set and how it is used; tools/textures/pack.py packs those sets
// into tex/, build.py inlines them (26-matlib-pack.js, KMAT.pack('ys')), and this fragment binds them onto the materials
// the earlier fragments made: the hyk shell kit's pairs (60-hyk-mat.js: MAT[key] for the merged buckets, MAT[key+'I'] for
// the instanced pieces), the terrain (71-port-terrain.js MAT.pkGround), and the Ancient hosts' own tables (the Arcades'
// sandstone, the Bell Hall's travertine, the core's verdigris). Nothing is rebuilt: the maps are swapped in place before
// the first frame, with the set's repeat over the fragment's own UV tile (hykSurf: 4 m; the terrain: 18 m; the towers:
// their own, 1:1). Each bound material takes the library hooks (specular, the tiling break-up) after the hook it had
// (the nacre's play of colour, else the underwater tint 71-port-terrain gives every standard material: that patch skips
// a material that already has a hook, so it is called here). ?mat=proc leaves everything procedural, the look before
// the library. The cards (the weed ribbons' kelp, the karst's vines and clumps) are textures the draw pass reads
// from YS_MATLIB.cards. Also the records table for the export (window._materials). [web]: three.js materials.
const YS_MATLIB={on:typeof KMAT!=='undefined'&&KMAT.mode==='lib',bound:{},cards:{kelp:[],vine:[],clump:[]}};
(function(){if(!YS_MATLIB.on)return;const P=f=>KMAT.packed('ys',f);
 // the hooks: the material's own first (the nacre), else the underwater tint, then the library's; a cache key of its own
 // (r128 keys a program on onBeforeCompile's source, and every wrapper here reads the same)
 const hook=(m,fam,L)=>{const prev=m.onBeforeCompile;const own=!!(prev&&prev.toString().indexOf('{}')<0);
  m.onBeforeCompile=sh=>{if(own)prev(sh);else if(typeof portUWsh==='function')portUWsh(sh);KMAT.libHooks(sh,L);};
  m.customProgramCacheKey=()=>'ys|'+fam+(own?'|own':'|uw')+KMAT.libKey(L);};
 const bind=(m,fam,L,uvTile)=>{if(!m||!L)return;const T=KMAT.textures(L,{aniso:8});const rep=uvTile?[uvTile/L.scale[0],uvTile/L.scale[1]]:[1,1];
  [T.map,T.normalMap,T.roughnessMap].forEach(t=>{if(t)t.repeat.set(rep[0],rep[1]);});
  m.map=T.map;if(T.normalMap){m.normalMap=T.normalMap;m.normalScale=new THREE.Vector2(L.normalScale||1,L.normalScale||1);}
  if(T.roughnessMap){m.roughnessMap=T.roughnessMap;m.roughness=1;}m.metalnessMap=null;m.metalness=L.metal||0;
  hook(m,fam,L);m.needsUpdate=true;YS_MATLIB.bound[fam]=L.lib;};
 for(const k of ['hkShell','hkFloor','hkIn','hkBarn','hkBone','hkMosaic','hkNacre','hkCrust','hkVerd','hkWet']){const L=P(k);if(!L)continue;bind(MAT[k],k,L,4);bind(MAT[k+'I'],k,L,4);}
 {const L=P('ground');if(L&&MAT.pkGround)bind(MAT.pkGround,'ground',L,18);}   /* no ground family yet: the karst wall's drips read as stripes on the flat (KNOWN_ISSUES) */
 {const L=P('sand');if(L&&typeof HAC_MAT!=='undefined'){bind(HAC_MAT.sand,'sand',L,null);bind(HAC_MAT.sandR,'sand',L,null);}}
 {const L=P('trav');if(L&&typeof HBH_MAT!=='undefined'){bind(HBH_MAT.trav,'trav',L,null);bind(HBH_MAT.travR,'trav',L,null);}}
 {const L=P('verdigris');if(L&&MAT.verdigris)bind(MAT.verdigris,'verdigris',L,null);}
 // the cards: alpha cut-outs, mipmapped; the first kelp replaces the weed ribbons' texture (alpha-tested now)
 const card=n=>{const L=P(n);if(!L)return null;const t=KMAT.textures(L,{aniso:4}).map;t.generateMipmaps=true;t.minFilter=THREE.LinearMipmapLinearFilter;t.magFilter=THREE.LinearFilter;return t;};
 for(const [kind,n] of [['kelp',3],['vine',3],['clump',4]])for(let i=0;i<n;i++){const t=card(kind+i);if(t)YS_MATLIB.cards[kind].push(t);}
 if(YS_MATLIB.cards.kelp.length)for(const m of [MAT.hkWeed,MAT.hkWeedI]){m.map=YS_MATLIB.cards.kelp[0];m.alphaTest=.4;m.needsUpdate=true;YS_MATLIB.bound.hkWeed='card.kelp';}
})();
// the records table for the export: every family as one record (GODOT-PLAN.md Phase 3)
(function(){if(typeof KMAT==='undefined')return;const recs={};const P=f=>KMAT.packed('ys',f);
 const uv={hkShell:[4,4],hkFloor:[4,4],hkIn:[4,4],hkBarn:[4,4],hkBone:[4,4],hkMosaic:[4,4],hkNacre:[4,4],hkCrust:[4,4],hkVerd:[4,4],hkWet:[4,4],hkWeed:[1,1],ground:[18,18],sand:[20,20],trav:[20,20],verdigris:[12,12]};
 for(const fam in uv){const L=YS_MATLIB.on?P(fam):null;recs[fam]={id:'ys.'+fam,family:fam,scale:L?L.scale:uv[fam],tint:true,roughness:1,metal:L?(L.metal||0):0,specular:L?L.specular:0.5,
   breakup:L?(L.breakup||null):null,lib:L?L.lib:null,bake:!L,hook:fam==='hkNacre'?'nacre':fam==='ground'?'planar-uv':'metre-uv',note:L?'library set, tint keep '+L.tint:'procedural canvas map, vertex-coloured'};}
 for(const [kind,n] of [['kelp',3],['vine',3],['clump',4]])for(let i=0;i<n;i++){const L=YS_MATLIB.on?P(kind+i):null;if(L)recs[kind+i]={id:'ys.'+kind+i,family:'card',scale:[1,1],tint:false,roughness:.9,alphaTest:.42,doubleSided:true,lib:L.lib,note:'card'};}
 KMAT.adapter('ys',recs);window._materials=KMAT.table('ys');})();
