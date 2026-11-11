// ================================================================= CORE HOST — cavern: the rock cut (a dollhouse at every level)  [web]
// Lifted 2026-11-11 from the Zeijani kit (kits/zeijani/src/40-zj-cave.js: the cut-away and CV_BOXCUT; settlements/dhelv's cut boxes) for
// every cave page, with the owner's leave (kits/tungang/PLAN.md section 6.5, question 14; core/host/UNDERGROUND.md). The kit keeps its own
// fork until it adopts this (kits/zeijani/KNOWN_ISSUES.md). OPT-IN BY FILE AND BY MATERIAL: a build lists it beside 39e and puts the layer
// on its rock material; a page without it is unchanged. Needs core/shader (KHOOK) and 39-core-cavern.js.
//
// In the cut, each void's rock opens `above` metres over that void's OWN floor (a room's, a stair's foot, a hall's, a tube's lowest
// point; a shaft opens whole above its foot): looked at from above, every level shows its rooms with their walls standing to waist or
// head height, whatever the level. Rock that is no void's own (the ground's surface, a mass, a monolith) opens only inside the cut boxes:
// turned boxes with a floor (open above floor + above) and an optional top (shut above it), Dhelv's carved sites nearest the camera.
//
//   KCAVERN.cutFloor(P) -> the floor a primitive's rock opens above, or null (not a void: a monolith, a mass, a body)
//   KCAVERN.cutWeight(C, {own(P) -> bool (default: every void), attr: 0}) -> fn for KCAVERN.drawRock's `weight`: writes into out[attr]
//     the floor of the vertex's own void, or KCAVERN.CUT_NONE (1e6) where it has none (the ground, a mass). drawRock({attrs: ['aKCut'],
//     weight: KCAVERN.cutWeight(C)}) (with other weights: compose, or pass attr: the index of 'aKCut')
//   KCAVERN.cutLayer(material, {attr: 'aKCut'}) -> material   the KHOOK layer 'kcavern-cut' (once per material)
//   KCAVERN.cut: {U (the shared uniforms), set(on), on, above(m: 2), boxes([{x, z, hw, hd, ry, floor, top?}]) (at most 32; [] clears),
//     MAX: 32, discards(y, ownFloor, x, z) -> bool (the shader's rule in JS: a pick's filter, and the node test's)}
(function(root){
  'use strict';
  var K=root.KCAVERN;if(!K)throw new Error('host/39h-core-cavern-cut: load core/terrain/39-core-cavern.js first');
  var NONE=1e6,MAX=32;K.CUT_NONE=NONE;
  K.cutFloor=function(P){if(!P)return null;var k=P.kind;
    if(k==='room')return P.y;if(k==='stair')return Math.min(P.a[1],P.b[1]);if(k==='hall')return P.c[1];if(k==='shaft')return P.y0-2;
    if(k==='trench')return P.y0;if((k==='tube'||k==='bore')&&P.pts&&P.pts.length){var m=1e30;for(var i=0;i<P.pts.length;i++)m=Math.min(m,P.pts[i][1]);
      if(k==='bore'){var r=Math.min(P.r==null?1:P.r,P.r1==null?(P.r==null?1:P.r):P.r1);m-=r;}return m;}
    return null;};
  K.cutWeight=function(C,o){o=o||{};var own=o.own||null,at=o.attr==null?0:o.attr,F=C.prims.map(function(P){var f=K.cutFloor(P);return f==null||(own&&!own(P))?NONE:f;});
    return function(x,y,z,nx,ny,nz,ch,i,out){var p=ch.prim[i];out[at]=p===65535||p>=F.length?NONE:F[p];};};
  // ---------------------------------------------------------------- the shared state and the layer
  var U=null;
  function uniforms(){if(U)return U;var T=root.THREE,a=[],b=[];for(var i=0;i<MAX;i++){a.push(new T.Vector4());b.push(new T.Vector4());}
    U={uKCutOn:{value:0},uKCutAbove:{value:2},uKCutA:{value:a},uKCutB:{value:b}};return U;}
  var S={MAX:MAX,on:false,list:[],get U(){return uniforms();}};
  S.set=function(on){S.on=!!on;uniforms().uKCutOn.value=S.on?1:0;return S.on;};
  S.above=function(m){uniforms().uKCutAbove.value=m==null?2:m;};
  /* uKCutA: centre x, z, half width, half depth; uKCutB: cos, sin of its turn, its floor, its top (NONE: no top). A box past MAX is dropped */
  S.boxes=function(list){var u=uniforms();S.list=(list||[]).slice(0,MAX);for(var i=0;i<MAX;i++){var q=S.list[i],A=u.uKCutA.value[i],B=u.uKCutB.value[i];
    if(!q){A.set(0,0,0,0);B.set(0,0,-NONE,0);continue;}A.set(q.x,q.z,q.hw,q.hd);B.set(Math.cos(q.ry||0),Math.sin(q.ry||0),q.floor,q.top==null?NONE:q.top);}
    return S.list.length;};
  S.discards=function(x,y,z,own){if(!S.on)return false;var ab=U?U.uKCutAbove.value:2;if(own<NONE*.5)return y>own+ab;
    for(var i=0;i<S.list.length;i++){var q=S.list[i],dx=x-q.x,dz=z-q.z,c=Math.cos(q.ry||0),s=Math.sin(q.ry||0),lx=dx*c-dz*s,lz=dx*s+dz*c;
      if(Math.abs(lx)<q.hw&&Math.abs(lz)<q.hd&&y>q.floor+ab&&(q.top==null||y<q.top))return true;}return false;};
  K.cut=S;
  var HEADV='attribute float aKCut;varying float vKCut;varying vec3 vKCutW;\n';
  var HEADF='uniform float uKCutOn;uniform float uKCutAbove;uniform vec4 uKCutA['+MAX+'];uniform vec4 uKCutB['+MAX+'];varying float vKCut;varying vec3 vKCutW;\n';
  var VTX='{vKCut=aKCut;vec4 kcw=vec4(transformed,1.);\n#ifdef USE_INSTANCING\nkcw=instanceMatrix*kcw;\n#endif\nvKCutW=(modelMatrix*kcw).xyz;}';
  var FRG='if(uKCutOn>.5){if(vKCut<'+(NONE*.5).toFixed(1)+'){if(vKCutW.y>vKCut+uKCutAbove)discard;}'+
    'else{for(int i=0;i<'+MAX+';i++){vec4 a=uKCutA[i],b=uKCutB[i];if(a.z<=0.)continue;vec2 d=vKCutW.xz-a.xy;float lx=d.x*b.x-d.y*b.y,lz=d.x*b.y+d.y*b.x;'+
    'if(abs(lx)<a.z&&abs(lz)<a.w&&vKCutW.y>b.z+uKCutAbove&&vKCutW.y<b.w)discard;}}}';
  K.cutLayer=function(m,o){o=o||{};var at=o.attr||'aKCut';if(!root.KHOOK)throw new Error('KCAVERN.cutLayer: core/shader (KHOOK) is not on this page');
    var hv=at==='aKCut'?HEADV:HEADV.replace('attribute float aKCut','attribute float '+at),vx=at==='aKCut'?VTX:VTX.replace('vKCut=aKCut','vKCut='+at);
    return root.KHOOK.add(m,'kcavern-cut'+(at==='aKCut'?'':':'+at),{uniforms:function(){return uniforms();},
      vertex:{head:hv,at:[{at:'project_vertex',after:vx}]},fragment:{head:HEADF,at:[{at:'clipping_planes_fragment',after:FRG}]}});};
  K.cutGLSL={vertex:VTX,fragment:FRG};
})(typeof window!=='undefined'?window:globalThis);
