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
//   KDOORLEAF.meshes(THREE, style, {frame, glass}, n)   [frame InstancedMesh, glass InstancedMesh?] of n leaves in that style
//   KDOORLEAF.STYLES                    the style names
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
  var GEO=new Map();
  function leafGeometry(Tt,style){Tt=Tt||T;var key=style||'flat',c=GEO.get(Tt);if(!c){c={};GEO.set(Tt,c);}if(c[key])return c[key];
    var S=STYLES[key];if(!S)throw new Error('KDOORHOST.leafGeometry: no style '+key);var d=S(Tt);
    return c[key]={frame:merge(Tt,d.b,d.x),glass:d.g?merge(Tt,d.g):null};}
  function leafMeshes(Tt,style,mats,n){Tt=Tt||T;var G=leafGeometry(Tt,style),out=[new Tt.InstancedMesh(G.frame,mats.frame,n)];
    if(G.glass&&mats.glass)out.push(new Tt.InstancedMesh(G.glass,mats.glass,n));
    out.forEach(function(m,i){m.frustumCulled=false;m.castShadow=i===0;m.receiveShadow=true;m.name='door leaves '+(style||'flat')+(i?' glass':'');});return out;}
  root.KDOORLEAF={geometry:leafGeometry,meshes:leafMeshes,STYLES:Object.keys(STYLES)};
})(typeof window!=='undefined'?window:globalThis);
