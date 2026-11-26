/* core/shader/06-core-khook.js — KHOOK: the one door for shader hooks (CORE-IMPROVEMENTS.md item 8a; README.md here).
   three r128 lets a material carry ONE onBeforeCompile. Pages chained theirs by hand (read the old hook, wrap it, replace an
   #include), and the hooks collided (one replaced the anchor another needed: the snow never reached a leaf card), recursed
   (cloudShade after wetGround), shared a program they should not have (closures with one source text), or did nothing at all
   (a String.replace whose anchor was gone). KHOOK composes every layer on a material in one fixed order, keys the program
   from every layer, and THROWS when an anchor is missing.

   KHOOK.add(mat, name, fn | spec, o) -> mat
     a layer called `name` (once per material: a second add of the name is ignored). fn(shader, renderer) edits the shader as
     a hook did; or a spec, declarative (below). The material's own onBeforeCompile (the page's, assigned before or after)
     runs first, then the layers by o.order (default 0), then in the order they were added. Assigning mat.onBeforeCompile
     afterwards goes under the layers (the page's slot), and a page hook that wraps the hook it read (prev=mat.onBeforeCompile)
     calls through to the page hook before it, not round the layers again (no recursion). The program key is the key under it
     (the material's own customProgramCacheKey, else its hook's source) + '|' + o.key (default: the name; a spec's default adds
     a hash of its text). A function layer whose closure varies with the same source MUST pass o.key. Sets needsUpdate.
   spec: {uniforms: {} | fn(sh, r) -> {}, vertex: {head, at: [inject...]}, fragment: {...}, eye: bool, skipIf: RegExp | fn(sh),
          run: fn(sh, r)}   head is put before the shader; each inject is {at, after | before | replace: glsl, fallback, optional}
   KHOOK.inject(src, e, who) -> src   one injection: e.at a chunk name ('project_vertex' -> '#include <project_vertex>') or a
     literal; e.after / e.before / e.replace the text (after: anchor + '\n' + text; before: text + '\n' + anchor). e.fallback (a
     chunk name, or {at, after | before | replace}) is used when e.at is missing; with neither found it throws (e.optional: unchanged).
   KHOOK.rep(src, find, rep, who) -> src   String.replace exactly (first match, `$` patterns and all), throwing if find (a
     string or a RegExp) is not in src. The drop-in for a hook's `.replace('#include <x>', ...)`. KHOOK.v(sh, find, rep, who)
     and KHOOK.f(sh, ...) do it to the shader's vertex or fragment text in place.
   KHOOK.has(mat, name), KHOOK.names(mat), KHOOK.copy(from, to) (a clone's layers: r128's Material.copy drops hooks)
   KHOOK.EYE   GLSL: vec3 kEye(), the eye from the view matrix. three r128 uploads cameraPosition only to Phong, Standard,
     Toon, Shader or env-mapped materials: a Lambert hook that reads it reads (0,0,0). spec.eye: true adds it to both stages.
   KHOOK.glf(x, d) -> a GLSL float literal; throws on NaN or Infinity (a NaN spliced into GLSL removed crater-drylands' ground).
   KHOOK.checkPrograms(renderer?, scene?, only?) -> [{kind: 'program' | 'anchor', ...}]   every program three could not link
     (renderer.info.programs[i].diagnostics, with the scene's materials that use it) and every anchor a layer missed. No
     renderer: every renderer a KHOOK layer compiled on (and any KHOOK.watch'ed). [] when all is runnable. only: a RegExp on the
     program's key and the anchor's layer (WATER.checkPrograms is the water's slice). The verify harness asserts it empty.
   KHOOK.warp   the reserved slot for a vertex position warp (a later core/anomaly), null and doing nothing until installed:
     {key, run(shader, renderer)}, run after every layer, and the key joins the program key. run edits inside <project_vertex>,
     after instancing and before projection. It reaches only a material with a KHOOK layer. Install it before the first compile.
   KHOOK.failures   the anchors missed so far, as records ({layer, anchor, stage, material}). */
(function(root){'use strict';
 var K={failures:[],renderers:[],warp:null},KLAYERS=typeof WeakMap!=='undefined'?new WeakMap():null;
 var inc=function(a){return /^[A-Za-z_][A-Za-z0-9_]*$/.test(a)?'#include <'+a+'>':a;};
 var hash=function(s){var h=2166136261;for(var i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return(h>>>0).toString(36);};
K.hash=hash;
K.glf=function(x,d){if(typeof x!=='number'||!isFinite(x))throw new Error('KHOOK.glf: not a finite number: '+x);var s=d==null?String(x):x.toFixed(d);return/[.eE]/.test(s)?s:s+'.0';};
K.EYE='\n#ifndef KHOOK_EYE\n#define KHOOK_EYE\nvec3 kEye(){return -(viewMatrix[3].xyz*mat3(viewMatrix));}\n#endif\n';
K.watch=function(r){if(r&&K.renderers.indexOf(r)<0)K.renderers.push(r);return r;};
 var cur={layer:null,mat:null};
 var fail=function(who,find,stage){var m=cur.mat,rec={layer:who||cur.layer||'?',anchor:String(find),stage:stage||'?',material:m?(m.type||'')+(m.name?' '+m.name:''):'?'};
 if(!K.failures.some(function(f){return f.layer===rec.layer&&f.anchor===rec.anchor&&f.stage===rec.stage&&f.material===rec.material;}))K.failures.push(rec);
 var e=new Error('KHOOK: layer "'+rec.layer+'": anchor '+rec.anchor+' missing in the '+rec.stage+' shader of '+rec.material);e.khook=rec;throw e;};
K.rep=function(src,find,rep,who,stage){var ok=typeof find==='string'?src.indexOf(find)>=0:(find.lastIndex=0,find.test(src));if(find.lastIndex)find.lastIndex=0;
 if(!ok)fail(who,find,stage);return src.replace(find,rep);};
K.v=function(sh,find,rep,who){sh.vertexShader=K.rep(sh.vertexShader,find,rep,who,'vertex');return sh;};
K.f=function(sh,find,rep,who){sh.fragmentShader=K.rep(sh.fragmentShader,find,rep,who,'fragment');return sh;};
K.inject=function(src,e,who,stage){var one=function(at,x){var a=inc(at);if(src.indexOf(a)<0)return null;
  var t=x.replace!=null?x.replace:x.after!=null?a+'\n'+x.after:x.before+'\n'+a;return src.replace(a,function(){return t;});};
 var r=one(e.at,e);if(r!=null)return r;
 if(e.fallback!=null){var F=typeof e.fallback==='string'?Object.assign({},e,{at:e.fallback}):e.fallback;r=one(F.at,F);if(r!=null)return r;}
 if(e.optional)return src;fail(who,inc(e.at)+(e.fallback!=null?' (or '+inc(typeof e.fallback==='string'?e.fallback:e.fallback.at)+')':''),stage);};
// the declarative layer
 var specFn=function(name,o){return function(sh,r){
  if(o.skipIf&&(typeof o.skipIf==='function'?o.skipIf(sh):o.skipIf.test(sh.vertexShader+'\n'+sh.fragmentShader)))return;
  if(o.uniforms){var u=typeof o.uniforms==='function'?o.uniforms.call(this,sh,r):o.uniforms;for(var k in u)sh.uniforms[k]=u[k];}
  ['vertex','fragment'].forEach(function(st){var S=o[st],key=st+'Shader';if(!S&&!o.eye)return;var src=sh[key];
   (S&&S.at||[]).forEach(function(e){src=K.inject(src,e,name,st);});
   if(S&&S.head)src=S.head+src;if(o.eye)src=K.EYE+src;sh[key]=src;});
  if(o.run)o.run.call(this,sh,r);};};
 var specKey=function(name,o){var t=[];['vertex','fragment'].forEach(function(st){var S=o[st];if(!S)return;t.push(st,S.head||'');(S.at||[]).forEach(function(e){t.push(JSON.stringify(e));});});
 return name+':'+hash(t.join('\u0001')+(o.eye?'e':'')+(o.run?String(o.run):''));};
// one state per material: the page's slot (with its history, for wrappers), the layers, the composed hook
 var state=function(mat){var st=KLAYERS?KLAYERS.get(mat):mat.__khook;if(st)return st;
 st={names:[],layers:[],seq:0,pages:null,depth:0};
 var d=Object.getOwnPropertyDescriptor(mat,'onBeforeCompile');
 if(d&&d.get){st.page=function(){return d.get.call(mat);};st.setPage=d.set?function(v){d.set.call(mat,v);}:function(){};}   /* a hook from before KHOOK that kept its own accessor: it is the page's slot */
 else{st.pages=[mat.onBeforeCompile];st.page=function(){return st.pages[st.pages.length-1];};st.setPage=function(v){st.pages.push(v);};}
 st.hook=function(sh,r){if(r)K.watch(r);
  if(st.depth>0){var P=st.pages?st.pages[st.pages.length-1-st.depth]:null;if(P){st.depth++;try{P.call(this,sh,r);}finally{st.depth--;}}return;}   /* a page hook calling the hook it read: the one before it */
  st.depth=1;var was={layer:cur.layer,mat:cur.mat};cur.mat=mat;
  try{var p=st.page();cur.layer='(the page\'s hook)';if(p)p.call(this,sh,r);
   var L=st.layers.slice().sort(function(a,b){return a.order-b.order||a.seq-b.seq;});
   for(var i=0;i<L.length;i++){cur.layer=L[i].name;L[i].run.call(this,sh,r);}
   if(K.warp){cur.layer='(the warp)';K.warp.run.call(this,sh,r);}}
  finally{st.depth=0;cur.layer=was.layer;cur.mat=was.mat;}};
 Object.defineProperty(mat,'onBeforeCompile',{configurable:true,enumerable:true,get:function(){return st.hook;},set:function(v){st.setPage(v);}});
 if(KLAYERS)KLAYERS.set(mat,st);else Object.defineProperty(mat,'__khook',{value:st});
 return st;};
/* the material's own key: one set on the material itself (a page's, or a layer's before), never three's default */
 var ownKey=function(mat){var k=mat.customProgramCacheKey,T=root.THREE,d=T&&T.Material&&T.Material.prototype.customProgramCacheKey;
 return k&&Object.prototype.hasOwnProperty.call(mat,'customProgramCacheKey')&&k!==d?k:null;};
K.add=function(mat,name,fn,o){if(!mat)return mat;
 if(fn&&typeof fn==='object'){o=Object.assign({},fn,o||{});fn=null;}else o=o||{};
 var st=state(mat);if(st.names.indexOf(name)>=0)return mat;st.names.push(name);
 mat.userData=mat.userData||{};(mat.userData.atmHooks||(mat.userData.atmHooks=[])).push(name);   /* the names, readable where the layers are not (as ATMOS.shaderHook kept them) */
 var lk=o.key!=null?o.key:fn?name:specKey(name,o),own=ownKey(mat);
 st.layers.push({name:name,order:o.order==null?0:o.order,seq:st.seq++,run:fn||specFn(name,o),key:lk});
 mat.customProgramCacheKey=function(){var k;if(own)k=own.call(this);else{var p=st.page();k=p?p.toString():'';}return k+'|'+(typeof lk==='function'?lk.call(this):lk)+(K.warp?'|warp:'+K.warp.key:'');};
 mat.needsUpdate=true;return mat;};
K.has=function(mat,name){var st=mat&&(KLAYERS?KLAYERS.get(mat):mat.__khook);return !!st&&st.names.indexOf(name)>=0;};
K.names=function(mat){var st=mat&&(KLAYERS?KLAYERS.get(mat):mat.__khook);return st?st.names.slice():[];};
K.copy=function(from,to){var st=from&&(KLAYERS?KLAYERS.get(from):from.__khook);if(!st||!to)return to;
 if(to.userData&&to.userData.atmHooks)to.userData.atmHooks=to.userData.atmHooks.filter(function(n){return st.names.indexOf(n)<0;});
 st.layers.slice().sort(function(a,b){return a.seq-b.seq;}).forEach(function(L){K.add(to,L.name,L.run,{order:L.order,key:L.key});});return to;};
// the programs three could not link, and the anchors missed
K.checkPrograms=function(r,scene,only){var rs=r?[r]:K.renderers,out=[],by=new Map();
 rs.forEach(function(R){var P=R&&R.info&&R.info.programs||[];
  P.forEach(function(p){var d=p.diagnostics;if(!d||d.runnable!==false||only&&!only.test(String(p.cacheKey||'')))return;
   var rec={kind:'program',name:p.name||'',key:String(p.cacheKey||'').slice(0,120),programLog:d.programLog||'',vertexLog:d.vertexShader?d.vertexShader.log:'',fragmentLog:d.fragmentShader?d.fragmentShader.log:'',materials:[]};
   by.set(p,rec);out.push(rec);});
  if(scene&&R.properties&&by.size)scene.traverse(function(ob){var ms=ob.material?(Array.isArray(ob.material)?ob.material:[ob.material]):[];
   ms.forEach(function(m){var pr=R.properties.get(m),rec=pr&&by.get(pr.program);if(rec&&rec.materials.every(function(x){return x.ref!==m;}))rec.materials.push({ref:m,type:m.type,name:m.name||'',object:ob.name||'',layers:K.names(m)});});});});
 K.failures.forEach(function(f){if(!only||only.test(f.layer))out.push(Object.assign({kind:'anchor'},f));});
 return out;};
root.KHOOK=K;
})(typeof window!=='undefined'?window:globalThis);
