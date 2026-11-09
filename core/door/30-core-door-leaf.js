// ================================================================= CORE — doors, the leaves' look (core/door)
// A door leaf in a style, as geometry the builders instance: a unit leaf ([-.5, .5] on each axis, scaled to the leaf's w, h,
// t), its frame and its glass apart (two materials, two InstancedMeshes posed together: KDOORHOST.instanced takes both).
// THREE, no DOM; load it ahead of the builders (a kit defines its leaf items from it as it loads: 69e5's vDoorLeaf.<style>).
//
//   KDOORLEAF.geometry(THREE, style)    {frame, glass} BufferGeometries (glass null when the style has none), cached by style:
//        'flat'    one slab (the plain leaf every kit had)
//        'plank'   boards with ledges across both faces (a barn's, a hut's, a hatch)
//        'panel'   stiles, rails, a lock rail and four sunk panels (a house's front door)
//        'glazed'  a frame over a kick rail with glazing bars over one light (French doors, a hall's glazed pair)
//        'half'    panels below, a glazed light above (a shop's, a stable's)
//        'glass'   a thin frame round one light (a shop front's, the Ancients' sliding panes)
//        'louvre'  slats between stiles and rails (a saloon's, a shutter's)
//        'grille'  bars with nothing between (a portcullis, a cage, a gaol's)
//        'slat'    horizontal slats (a roller shutter, an up-and-over door)
//        'plate'   a heavy plate with a rim and ribs both sides (a blast door, a floodgate, a vault's)
//        'disc'    a round plate (an iris)
//      with HARDWARE (2026-11-09: the detail the plain leaves lost), a third part in metal, `hw`:
//        'banded'  a panelled leaf with three brass bands across both faces, studded, and a ring pull (the ger's lacquered door)
//        'scrolled' the half-glazed leaf with gilt scrolls on its lower panels and a brass knob (the vardo's)
//        'panel+pull', 'glazed+pull', 'half+pull', 'plank+pull'   that leaf with a bar pull on both faces at the lock rail (Pylon's,
//                  Talia's); '+ring' a ring pull instead (a plank door's iron ring)
//   KDOORLEAF.geometry(...).hw          the hardware's geometry (null when the style has none), drawn in a metal (brass, gilt, iron)
//   KDOORLEAF.meshes(THREE, style, {frame, glass, hw}, n)   [frame InstancedMesh, glass InstancedMesh?, hardware InstancedMesh?] of n
//                                       leaves in that style (a part is left out when the style or mats lacks it); KDOORHOST.instanced
//                                       poses every one at the same index
//   KDOORLEAF.STYLES                    the style names; KDOORLEAF.HARDWARE the hardware sets ('bands', 'scrolls', 'pull', 'ring', 'knob')
(function(root){
  var T=root.THREE;
  // ---- the leaf styles: boxes [cx, cy, cz, sx, sy, sz] in the unit leaf, merged into one geometry
  function merge(Tt,boxes,extra){var pos=[],nor=[],uv=[],idx=[],n=0,parts=boxes.map(function(b){return new Tt.BoxGeometry(b[3],b[4],b[5]).translate(b[0],b[1],b[2]);});
    if(extra)parts=parts.concat(extra);
    parts.forEach(function(g){var P=g.attributes.position.array,N=g.attributes.normal.array,I=g.index?g.index.array:null,c=P.length/3;
      for(var i=0;i<P.length;i++){pos.push(P[i]);nor.push(N[i]);}
      /* the leaf's UVs projected across the whole leaf (not each part's own 0..1): the grain runs on through stile, rail and
         panel as on one board, the face as the plain leaf's was */
      for(i=0;i<P.length;i+=3){var ax=Math.abs(N[i]),ay=Math.abs(N[i+1]),az=Math.abs(N[i+2]);
        if(az>=ax&&az>=ay)uv.push(P[i]+.5,P[i+1]+.5);else if(ax>=ay)uv.push(P[i+2]+.5,P[i+1]+.5);else uv.push(P[i]+.5,P[i+2]+.5);}
      if(I)for(i=0;i<I.length;i++)idx.push(I[i]+n);else for(i=0;i<c;i++)idx.push(i+n);n+=c;g.dispose&&g.dispose();});
    var G=new Tt.BufferGeometry();G.setAttribute('position',new Tt.Float32BufferAttribute(pos,3));G.setAttribute('normal',new Tt.Float32BufferAttribute(nor,3));
    G.setAttribute('uv',new Tt.Float32BufferAttribute(uv,2));G.setIndex(idx);G.computeBoundingSphere();return G;}
  function frameBoxes(st,rt,rb){return[[-.5+st/2,0,0,st,1,1],[.5-st/2,0,0,st,1,1],[0,.5-rt/2,0,1-2*st,rt,1],[0,-.5+rb/2,0,1-2*st,rb,1]];}
  var STYLES={
    flat:function(){return{b:[[0,0,0,1,1,1]]};},
    plank:function(){var b=[],n=5,g=.012,w=(1-g*(n-1))/n;for(var i=0;i<n;i++)b.push([-.5+w/2+i*(w+g),0,0,w,1,.62]);
      for(var y of[-.32,.32])for(var z of[-.405,.405])b.push([0,y,z,.92,.07,.19]);return{b:b};},
    panel:function(){var b=frameBoxes(.13,.09,.15).concat([[0,.02,0,1-.26,.07,1],[0,.255,0,.07,.38,1],[0,-.215,0,.07,.4,1]]);
      for(var x of[-.2,.2]){b.push([x,.255,0,.27,.38,.5]);b.push([x,-.215,0,.27,.4,.5]);}return{b:b};},
    glazed:function(){var b=frameBoxes(.13,.08,.18).concat([[0,.05,0,.035,.74,.4],[0,.22,0,.74,.03,.4],[0,-.13,0,.74,.03,.4]]);return{b:b,g:[[0,.05,0,.74,.74,.12]]};},
    half:function(){var b=frameBoxes(.13,.08,.15).concat([[0,-.04,0,1-.26,.07,1],[0,.21,0,.035,.42,.4],[0,-.255,0,.07,.36,1]]);
      for(var x of[-.2,.2])b.push([x,-.255,0,.27,.36,.5]);return{b:b,g:[[0,.21,0,.74,.42,.12]]};},
    glass:function(){return{b:frameBoxes(.06,.05,.08),g:[[0,.015,0,.88,.87,.18]]};},
    louvre:function(){var b=frameBoxes(.14,.1,.12),n=9,top=.4,bot=-.38;for(var i=0;i<n;i++)b.push([0,bot+(i+.5)*(top-bot)/n,0,.72,.045,.7]);return{b:b};},
    grille:function(){var b=[],i;for(i=0;i<7;i++)b.push([-.5+.03+i*(.94/6),0,0,.06,1,1]);for(i=0;i<5;i++)b.push([0,-.45+i*.225,0,1,.05,.8]);return{b:b};},
    plate:function(){var b=[[0,0,0,1,1,.6]].concat(frameBoxes(.07,.06,.06).map(function(q){return[q[0],q[1],q[2],q[3],q[4],1];}));
      for(var y of[-.25,0,.25])b.push([0,y,0,.86,.035,.9]);for(var x of[-.22,.22])b.push([x,0,0,.03,.86,.9]);return{b:b};},
    slat:function(){var b=[],n=16,g=.006,h=(1-g*(n-1))/n;for(var i=0;i<n;i++)b.push([0,-.5+h/2+i*(h+g),0,1,h,.8]);return{b:b};},
    disc:function(Tt){return{b:[],x:[new Tt.CylinderGeometry(.5,.5,1,28).rotateX(Math.PI/2)]};}};
  // ---- the hardware: boxes in the unit leaf, on both faces (z beyond the leaf's +-.5: they stand proud of it), merged as one part.
  // A leaf is far thinner than it is wide, so a part's depth is given in the leaf's own thickness (the unit z) and kept small
  var HW={
    bands:function(){var b=[],ys=[-.34,.02,.36];ys.forEach(function(y){[-.62,.62].forEach(function(z){b.push([0,y,z,.98,.045,.3]);
      for(var x=-.38;x<=.39;x+=.19)b.push([x,y,z*1.08,.035,.03,.3]);});});   /* three bands each face, five studs on each */
      return b.concat(HW.ring());},
    scrolls:function(){var b=[];[-.2,.2].forEach(function(x){[-.62,.62].forEach(function(z){var s=x<0?-1:1;
      for(var k=0;k<7;k++){var a=k/6*Math.PI*1.5,r=.075*(1-k/9);b.push([x+s*Math.cos(a)*r,-.255+Math.sin(a)*r*1.6,z,.03,.03,.3]);}
      b.push([x,-.36,z,.2,.02,.3],[x,-.15,z,.2,.02,.3]);});});   /* an S of gilt beads on each lower panel, a gilt rule over and under */
      return b.concat(HW.knob());},
    pull:function(){var b=[];[-.62,.62].forEach(function(z){var s=z<0?-1:1;b.push([.36,.02,z*1.3,.025,.2,.3],[.36,.1,z,.025,.025,.5],[.36,-.06,z,.025,.025,.5]);});return b;},
    ring:function(){var b=[];[-.62,.62].forEach(function(z){b.push([.33,.04,z,.05,.05,.3]);for(var k=0;k<8;k++){var a=k/8*Math.PI*2;b.push([.33+Math.cos(a)*.045,-.02+Math.sin(a)*.06,z*1.25,.02,.02,.3]);}});return b;},
    knob:function(){var b=[];[-.62,.62].forEach(function(z){b.push([.36,.02,z,.04,.04,.3],[.36,.02,z*1.35,.06,.06,.3]);});return b;}};
  var COMPOSED={banded:['panel','bands'],scrolled:['half','scrolls']};
  ['panel','glazed','half','plank'].forEach(function(st){COMPOSED[st+'+pull']=[st,'pull'];COMPOSED[st+'+ring']=[st,'ring'];});
  var GEO=new Map();
  function leafGeometry(Tt,style){Tt=Tt||T;var key=style||'flat',c=GEO.get(Tt);if(!c){c={};GEO.set(Tt,c);}if(c[key])return c[key];
    var C=COMPOSED[key],S=STYLES[C?C[0]:key];if(!S)throw new Error('KDOORHOST.leafGeometry: no style '+key);var d=S(Tt);
    return c[key]={frame:merge(Tt,d.b,d.x),glass:d.g?merge(Tt,d.g):null,hw:C?merge(Tt,HW[C[1]]()):null};}
  function leafMeshes(Tt,style,mats,n){Tt=Tt||T;var G=leafGeometry(Tt,style),out=[new Tt.InstancedMesh(G.frame,mats.frame,n)],nm=[''];
    if(G.glass&&mats.glass){out.push(new Tt.InstancedMesh(G.glass,mats.glass,n));nm.push(' glass');}
    if(G.hw&&mats.hw){out.push(new Tt.InstancedMesh(G.hw,mats.hw,n));nm.push(' hardware');}
    out.forEach(function(m,i){m.frustumCulled=false;m.castShadow=i===0;m.receiveShadow=true;m.name='door leaves '+(style||'flat')+nm[i];});return out;}
  root.KDOORLEAF={geometry:leafGeometry,meshes:leafMeshes,STYLES:Object.keys(STYLES).concat(Object.keys(COMPOSED)),HARDWARE:Object.keys(HW)};
})(typeof window!=='undefined'?window:globalThis);
