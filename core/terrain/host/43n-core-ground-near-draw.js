// ================================================================= CORE — the near ground drawn (KGROUND.nearMesh; the data is 43n-core-ground-near.js)
// [G native] Godot's terrain LOD (a clipmap or chunks) does this itself; what crosses over is the height function and the attributes.
// KGROUND.nearMesh(mesh, o) follows the camera with a fine patch of a page's coarse grid ground (mesh: one indexed grid of N x N cells,
// split a,b,d / b,c,d; the patch shares its material, so the page's shader, layers and relief draw it the same). When the camera's cell
// leaves the patch's middle by o.step cells, the next patch is built over a few frames (o.budget ms a frame) while the last one stays;
// a jump (the camera outside the drawn patch) builds it at once. Its normals are its own (central differences on the fine grid), eased to
// the coarse mesh's at the rim; o.cavity (default {rings: [2, 6], depth: [.12, .6], k: 1}) bakes the patch's own small hollows into aKGAO
// where the coarse grid carries it (KGROUND.cavity, the relief's mesh term), so a ledge's foot darkens with its step.
//   o: {h(x, z), N, x0, z0, cs (the coarse grid), size (96 m: the patch's side, a whole odd number of cells), cell (.5 m) | sub, blend (cs),
//       step (1 cell), budget (4 ms), maxH (150 m: higher over the ground the camera keeps the last patch), cavity, skip [attribute names
//       not copied], THREE}
//   -> {mesh, update(camera), sync(camera), box(), stats {builds, ms, verts, tris}, rough()}
//   ?near=0 on the page: the page's own switch (KGROUND.nearMesh is not called)
(function(root){
  var K=root.KGROUND||(root.KGROUND={});
  function nearMesh(mesh,o){o=o||{};if(!K.near)throw new Error('core/terrain: KGROUND.nearMesh needs 43n-core-ground-near.js on the page');var T=o.THREE||root.THREE,g=mesh.geometry;
    if(!g.index)throw new Error('KGROUND.nearMesh: the coarse ground must be indexed');if(typeof o.h!=='function')throw new Error('KGROUND.nearMesh: o.h(x, z) is required');
    var skip={position:1,normal:1};(o.skip||[]).forEach(function(n){skip[n]=1;});
    var attrs={};Object.keys(g.attributes).forEach(function(n){if(!skip[n])attrs[n]={array:g.attributes[n].array,size:g.attributes[n].itemSize};});
    if(!g.attributes.normal)g.computeVertexNormals();
    var G=K.near.grid({N:o.N,x0:o.x0,z0:o.z0,cs:o.cs,pos:g.attributes.position.array,normal:g.attributes.normal.array,attrs:attrs});
    var n=Math.max(3,Math.round((o.size==null?96:o.size)/G.cs));if(n%2===0)n++;n=Math.min(n,G.N);
    var step=o.step==null?1:o.step,budget=o.budget==null?4:o.budget,maxH=o.maxH==null?150:o.maxH,
      cav=o.cavity===false?null:Object.assign({rings:[2,6],depth:[.12,.6],k:1},o.cavity||{}),bo={h:o.h,sub:o.sub,cell:o.cell,blend:o.blend};
    var fine=new T.Mesh(new T.BufferGeometry(),o.material||mesh.material);fine.name='ground:near';fine.visible=false;
    for(var u in mesh.userData)fine.userData[u]=mesh.userData[u];fine.userData.nearGround=true;
    fine.renderOrder=mesh.renderOrder;fine.receiveShadow=mesh.receiveShadow;fine.castShadow=mesh.castShadow;(mesh.parent||o.scene).add(fine);
    var cur=null,job=null,saved=null,stats={builds:0,ms:0,last:0,verts:0,tris:0};
    function finish(P){var t0=performance.now(),nx=P.nx,fc=P.fc,pos=P.pos,nrm=new Float32Array(nx*nx*3);
      for(var j=0;j<nx;j++)for(var i=0;i<nx;i++){var k=j*nx+i,il=i>0?k-1:k,ir=i<nx-1?k+1:k,jd=j>0?k-nx:k,ju=j<nx-1?k+nx:k,
          gx=(pos[ir*3+1]-pos[il*3+1])/(((i<nx-1)+(i>0))*fc),gz=(pos[ju*3+1]-pos[jd*3+1])/(((j<nx-1)+(j>0))*fc),r=P.ramp[k];
        var ax=-gx,ay=1,az=-gz,L=Math.hypot(ax,ay,az);ax/=L;ay/=L;az/=L;
        ax=P.normal[k*3]+(ax-P.normal[k*3])*r;ay=P.normal[k*3+1]+(ay-P.normal[k*3+1])*r;az=P.normal[k*3+2]+(az-P.normal[k*3+2])*r;L=Math.hypot(ax,ay,az);if(!(L>0))L=1;
        nrm[k*3]=ax/L;nrm[k*3+1]=ay/L;nrm[k*3+2]=az/L;}
      if(cav&&P.attrs.aKGAO){var c=K.cavity({pos:pos,index:P.idx,normal:nrm,count:nx*nx},{rings:cav.rings,depth:cav.depth}),A=P.attrs.aKGAO;
        for(var q=0;q<c.length;q++)A[q]=Math.max(A[q],Math.min(1,c[q]*cav.k)*P.ramp[q]);}
      var ng=new T.BufferGeometry();ng.setAttribute('position',new T.BufferAttribute(pos,3));ng.setAttribute('normal',new T.BufferAttribute(nrm,3));
      Object.keys(P.attrs).forEach(function(a){ng.setAttribute(a,new T.BufferAttribute(P.attrs[a],attrs[a].size));});
      ng.setIndex(new T.BufferAttribute(P.idx,1));ng.computeBoundingSphere();ng.computeBoundingBox();
      var old=fine.geometry;fine.geometry=ng;old.dispose();fine.visible=true;
      /* the coarse cells under the patch: degenerate in its index (the last patch's put back), uploaded as one range */
      var ia=g.index;saved=K.near.cut(ia.array,G,P.box,saved);ia.updateRange.offset=saved.lo;ia.updateRange.count=saved.hi-saved.lo;ia.needsUpdate=true;
      saved.lo=saved.cutLo;saved.hi=saved.cutHi;cur=P;job=null;stats.builds++;stats.verts=nx*nx;stats.tris=P.idx.length/3;stats.ms+=performance.now()-t0;}
    function want(cam){var p=cam.position||cam,b=K.near.box(G,p.x,p.z,n);return b;}
    function inside(p,b){var x0=G.x0+b.i0*G.cs,z0=G.z0+b.j0*G.cs,s=b.n*G.cs;return p.x>x0&&p.x<x0+s&&p.z>z0&&p.z<z0+s;}
    function same(a,b){return a&&b&&a.i0===b.i0&&a.j0===b.j0;}
    function run(b,ms){var t0=performance.now();if(!job||!same(job.box,b))job={box:b,P:null,row:0};
      var nx=b.n*K.near.sub(G,bo)+1,rows=ms==null?nx:Math.max(2,job.rpr?Math.floor(ms/job.rpr):8);
      while(job.row<nx){var r1=Math.min(nx,job.row+rows),t1=performance.now();bo.rows=[job.row,r1];bo.into=job.P;job.P=K.near.build(G,b,bo);
        job.rpr=Math.max(.001,(performance.now()-t1)/(r1-job.row));job.row=r1;if(ms!=null&&performance.now()-t0>=ms)break;}
      bo.rows=null;bo.into=null;stats.ms+=performance.now()-t0;stats.last=performance.now()-t0;if(job.row>=nx)finish(job.P);}
    function update(cam){var p=cam.position||cam;if(cur&&p.y-o.h(p.x,p.z)>maxH)return;var b=want(cam);
      if(cur&&Math.abs(b.i0-cur.box.i0)<=step&&Math.abs(b.j0-cur.box.j0)<=step){if(job&&!same(job.box,cur.box))job=null;return;}
      if(!cur||!inside(p,cur.box))return run(b,null);   /* a jump: at once */
      run(b,budget);}
    function sync(cam){var b=want(cam);if(!cur||!same(b,cur.box))run(b,null);}
    function rough(){return cur?K.near.rough(cur.pos,cur.nx,G):null;}
    return {mesh:fine,update:update,sync:sync,box:function(){return cur?cur.box:null;},stats:stats,rough:rough,grid:G,
      dispose:function(){if(saved){K.near.uncut(g.index.array,saved);g.index.needsUpdate=true;saved=null;}fine.visible=false;cur=null;}};}
  K.nearMesh=nearMesh;
  /* KGROUND.clampBump(mat, {tilt}) -> mat: the relief's bump (KGROUND.hook's o.relief, Mikkelsen's surface gradient) with its tilt capped at
     atan(tilt) off the face (1: 45 degrees). Up close on a steep face the layers' blended height changes inside a pixel (a height-blend
     edge, a pebble's rim), the gradient runs away and the bumped normal turns from the light: single black pixels and streaks down the
     slope (ebadlands' near ground, 2026-11-22). A KHOOK layer after KGROUND's: a twin kgBumpC beside kgBump and the lit normal's call
     moved to it, so KGROUND's own text (and every page that does not ask) is unchanged. A material with no bumped normal is left as it is */
  K.clampBump=function(mat,o){o=o||{};var H=root.KHOOK,t=H.glf(o.tilt==null?1:o.tilt);
    return H.add(mat,'kground-bump-clamp',function(sh){var fs=sh.fragmentShader;if(fs.indexOf('normal=kgBump(')<0||fs.indexOf('vec3 kgBump(')<0)return;
      fs=H.rep(fs,'vec3 kgBump(','vec3 kgBumpC(vec3 vp,vec3 n,float h){vec3 px=dFdx(vp),py=dFdy(vp),r1=cross(py,n),r2=cross(n,px);float dt=dot(px,r1);'+
        'vec3 g=sign(dt)*(dFdx(h)*r1+dFdy(h)*r2);float gl=length(g),cap='+t+'*abs(dt);if(gl>cap)g*=cap/gl;return normalize(abs(dt)*n-g);}\nvec3 kgBump(','kground-bump-clamp');
      sh.fragmentShader=fs.split('normal=kgBump(').join('normal=kgBumpC(');},{order:1,key:'kground-bump-clamp-'+t});};
})(typeof globalThis!=='undefined'?globalThis:this);
