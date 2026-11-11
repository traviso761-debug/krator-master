// ================================================================= CORE HOST — cavern: the chunks drawn (KCAVERN.drawRock)  [web]
// Lifted 2026-11-09 from the Hearths' cave page (biomes/hearths, stations/crystals 84) for every cave page: a built KCAVERN's chunks merged
// into one mesh per `tile` m square (a handful of draws, each culled by its box), with the page's own per-vertex weights (the masks its KGROUND
// layers read) and the chunk's occlusion as the vertex colour. The page owns the material (its shader, its layers); this only makes geometry.
//
//   KCAVERN.drawRock(C, {THREE, material, tile (64), attrs: ['aA', 'aB'] (the weight attributes' names), weight(x, y, z, nx, ny, nz, ch, i, out)
//        (fills out[k] for each attr, 0..1; ch is the chunk's arrays, i the vertex: ch.w, ch.occ, ch.prim, ch.mat), color(occ) -> [r, g, b]
//        (default: .42 + .58 occ, a little warm), ground ('keep'|'drop': the ground's triangles inside an opening's rim, prim 65535; 'keep'),
//        label, name, cavity (KGROUND.cavityMesh's options, or null)})
//     -> {group (THREE.Group, not added), meshes, chunks, tris, ms}. Each mesh: userData {host, rock, inspectLabel, cavernTile}.
(function(root){
  'use strict';
  var K=root.KCAVERN;if(!K)throw new Error('host/39e-core-cavern-draw: load core/terrain/39-core-cavern.js first');
  var now=function(){return typeof performance!=='undefined'?performance.now():Date.now();};
  K.drawRock=function(C,o){o=o||{};var T=o.THREE||root.THREE;if(!T)throw new Error('KCAVERN.drawRock: THREE');if(!o.material)throw new Error('KCAVERN.drawRock: a material');
    var tile=o.tile==null?64:o.tile,attrs=o.attrs||[],G=65535,keepGround=o.ground!=='drop',t0=now(),groups=new Map(),chunks=0,tris=0,w=new Array(attrs.length);
    var color=o.color||function(oc){var v=.42+.58*oc;return [v,v*.97,v*.94];};
    C.chunks.forEach(function(key){var ch=C.meshChunk(key);if(!ch.idx.length)return;chunks++;
      var gk=Math.floor(ch.origin[0]/tile)+','+Math.floor(ch.origin[2]/tile),g=groups.get(gk);
      if(!g){g={pos:[],nrm:[],col:[],a:attrs.map(function(){return [];}),idx:[],n:0};groups.set(gk,g);}
      var nv=ch.pos.length/3;
      for(var i=0;i<nv;i++){var x=ch.pos[i*3],y=ch.pos[i*3+1],z=ch.pos[i*3+2],nx=ch.nrm[i*3],ny=ch.nrm[i*3+1],nz=ch.nrm[i*3+2];
        g.pos.push(x,y,z);g.nrm.push(nx,ny,nz);var c=color(ch.occ[i]);g.col.push(c[0],c[1],c[2]);
        if(attrs.length){for(var k=0;k<attrs.length;k++)w[k]=0;if(o.weight)o.weight(x,y,z,nx,ny,nz,ch,i,w);for(k=0;k<attrs.length;k++)g.a[k].push(w[k]);}}
      for(var t=0;t<ch.idx.length;t+=3){var a=ch.idx[t],b=ch.idx[t+1],e=ch.idx[t+2];
        if(!keepGround&&(ch.prim[a]===G||ch.prim[b]===G||ch.prim[e]===G))continue;g.idx.push(a+g.n,b+g.n,e+g.n);tris++;}
      g.n+=nv;});
    var grp=new T.Group();grp.name=o.name||'the cavern\'s rock';
    groups.forEach(function(g,gk){if(!g.idx.length)return;var geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(g.pos,3));
      geo.setAttribute('normal',new T.Float32BufferAttribute(g.nrm,3));geo.setAttribute('color',new T.Float32BufferAttribute(g.col,3));
      attrs.forEach(function(n,k){geo.setAttribute(n,new T.Float32BufferAttribute(g.a[k],1));});
      geo.setIndex(g.n>65535?new T.Uint32BufferAttribute(g.idx,1):new T.Uint16BufferAttribute(g.idx,1));geo.computeBoundingSphere();geo.computeBoundingBox();
      var m=new T.Mesh(geo,o.material);m.name='rock '+gk;m.userData.host=true;m.userData.rock=true;m.userData.cavernTile=gk;m.userData.inspectLabel=o.label||'Rock';
      if(o.cavity&&root.KGROUND&&root.KGROUND.cavityMesh)root.KGROUND.cavityMesh(m,o.cavity);grp.add(m);});
    return {group:grp,meshes:grp.children.length,chunks:chunks,tris:tris,ms:Math.round(now()-t0)};};
})(typeof window!=='undefined'?window:globalThis);
