// ================================================================= CORE — minimap: a plan of the world drawn from data
// A 2D map panel drawn from records a build already keeps (its placed footprints, its walk floors, its terrain
// height), not from the rendered scene, so it costs the GPU nothing and is always exactly what was built. After
// the Moria map's pattern (TODO.md has the provenance): the base layer is painted
// once into an offscreen canvas; while the panel is open the overlay (you, and which way you look) is redrawn a
// few times a second; hovering names what is under the pointer, clicking goes there.
//
// The records are plain data, and M.export() returns them with the frame and the relief grid: a Godot port
// draws the same records in a Control's _draw() (or bakes the base layer to a PNG at export time).
// Axes: x east, z south, metres; on the map north (-z) is up.
//
//   const M=KMAP.create({frame:[x0,x1,z0,z1], size:280, bg:'#101418', palette:{tag:'#hex'}, fallback:'#9a9080'})
//                                      the frame is widened to the canvas's aspect (square by default)
//   M.rect(x0,x1,z0,z1, o)             o: {tag, col, y (draw order: higher on top), name}
//   M.obb(x,z,hx,hz,ry, o)             a box of half-extents hx (local x) and hz (local z) turned by ry about +y,
//                                      three.js's convention: local (lx,lz) -> (x+lx cos ry+lz sin ry, z-lx sin ry+lz cos ry)
//   M.strip(a:[x,z], b:[x,z], w, o)    a band of full width w (roads, passages, stairs)
//   M.disc(x,z,r, o)
//   M.label(x,z,text, o)               o.size (px, 9)
//   M.fromWalk(W, colourOf(y))         every floor of a KWALK registry, coloured by its height
//   M.relief(h(x,z), {cell:24, water:0, lo, hi})   a hill-shaded height grid under everything, water below `water`
//   M.toPx(x,z) / M.toWorld(px,py)
//   M.pick(x,z)                        the topmost named or tagged record under (x,z), or null
//   M.paint(g, reliefImage)            draw the base layer into a 2D-context-like g (size x size); reliefImage is
//                                      anything g.drawImage takes, made by the host from M.reliefPixels(g)
//   M.reliefPixels(g)                  the relief as an n x n ImageData from g.createImageData, or null
//   M.overlay(g, viewer, hoverText)    viewer {x,z,dir:[dx,dz]}: the dot and the view wedge
//   M.rev()                            a counter that changes whenever a record or the relief is added: the host
//                                      repaints its cached base layer when it moves
//   M.export()                         {format:'krator-minimap', version, frame, size, records, relief}
//
// This fragment is [G data]: no document, no canvas of its own, no input. The browser panel (M.mount, the M key,
// hover and click) is core/minimap/88a-core-minimap-host.js, [web], which moves into core/host/ (GODOT-PLAN.md
// Phase 1). A build that takes this fragment takes that one too.
(function(root){
  'use strict';
  function create(o){
    o=o||{};var size=o.size||280,f=(o.frame||[-1000,1000,-1000,1000]).slice();
    var w=f[1]-f[0],d=f[3]-f[2];if(!(w>0&&d>0))throw new Error('KMAP: frame must have positive width and depth');
    if(w>d){var c=(f[2]+f[3])/2;f[2]=c-w/2;f[3]=c+w/2;}else if(d>w){var c2=(f[0]+f[1])/2;f[0]=c2-d/2;f[1]=c2+d/2;}
    var span=f[1]-f[0],pal=o.palette||{},fallback=o.fallback||'#9a9080',bg=o.bg||'#101418';
    var recs=[],seq=0,relief=null,rv=0;
    function toPx(x,z){return [(x-f[0])/span*size,(z-f[2])/span*size];}
    function toWorld(px,py){return [f[0]+px/size*span,f[2]+py/size*span];}
    function colOf(r){return r.col||pal[r.tag]||fallback;}
    function add(r,op){op=op||{};r.tag=op.tag||'';r.col=op.col||'';r.y=op.y||0;r.name=op.name||'';r.seq=seq++;recs.push(r);rv++;return r;}
    function rect(x0,x1,z0,z1,op){return add({kind:'rect',rect:[Math.min(x0,x1),Math.max(x0,x1),Math.min(z0,z1),Math.max(z0,z1)]},op);}
    function obb(x,z,hx,hz,ry,op){return add({kind:'obb',x:x,z:z,hx:hx,hz:hz,ry:ry||0},op);}
    function strip(a,b,wd,op){return add({kind:'strip',a:a.slice(0,2),b:b.slice(0,2),w:wd},op);}
    function disc(x,z,r,op){return add({kind:'disc',x:x,z:z,r:r},op);}
    function label(x,z,text,op){var r=add({kind:'label',x:x,z:z,text:String(text)},op);r.size=(op&&op.size)||9;r.y=1e9;return r;}
    function fromWalk(W,colourOf){
      W.floors.forEach(function(fl){var y=fl.kind==='rect'?fl.y:(fl.a[2]+fl.b[2])/2,col=colourOf?colourOf(y,fl):'';
        if(fl.kind==='rect')rect(fl.rect[0],fl.rect[1],fl.rect[2],fl.rect[3],{y:y,col:col,tag:fl.tag,name:fl.name});
        else strip([fl.a[0],fl.a[1]],[fl.b[0],fl.b[1]],fl.w,{y:y,col:col,tag:fl.tag,name:fl.name});});
    }
    function reliefOf(h,op){
      op=op||{};var cell=op.cell||24,water=op.water===undefined?0:op.water,n=Math.max(2,Math.ceil(span/cell)),H=new Float32Array((n+1)*(n+1));
      var lo=Infinity,hi=-Infinity;
      for(var j=0;j<=n;j++)for(var i=0;i<=n;i++){var v=h(f[0]+i*span/n,f[2]+j*span/n);H[j*(n+1)+i]=v;if(v>=water){lo=Math.min(lo,v);hi=Math.max(hi,v);}}
      if(op.lo!==undefined)lo=op.lo;if(op.hi!==undefined)hi=op.hi;if(!(hi>lo)){lo=water;hi=water+1;}
      var rgb=new Uint8Array(n*n*3),step=span/n;
      for(var jj=0;jj<n;jj++)for(var ii=0;ii<n;ii++){
        var a=H[jj*(n+1)+ii],b=H[jj*(n+1)+ii+1],c=H[(jj+1)*(n+1)+ii],dd=H[(jj+1)*(n+1)+ii+1],m=(a+b+c+dd)/4,k=(jj*n+ii)*3;
        if(m<water){var dep=Math.min(1,(water-m)/20);rgb[k]=34-dep*14;rgb[k+1]=62-dep*20;rgb[k+2]=82-dep*16;continue;}
        var t=Math.max(0,Math.min(1,(m-lo)/(hi-lo))),sx=((b+dd)-(a+c))/(2*step),sz=((c+dd)-(a+b))/(2*step);
        var shade=Math.max(.55,Math.min(1.25,1+(-sx-sz)*.9));                 // lit from the north-west
        rgb[k]=Math.min(255,(70+t*70)*shade);rgb[k+1]=Math.min(255,(74+t*58)*shade);rgb[k+2]=Math.min(255,(60+t*48)*shade);}
      relief={n:n,cell:step,rgb:rgb};rv++;return relief;
    }
    function inside(r,x,z){
      if(r.kind==='rect')return x>=r.rect[0]&&x<=r.rect[1]&&z>=r.rect[2]&&z<=r.rect[3];
      if(r.kind==='disc')return (x-r.x)*(x-r.x)+(z-r.z)*(z-r.z)<=r.r*r.r;
      if(r.kind==='obb'){var dx=x-r.x,dz=z-r.z,c=Math.cos(r.ry),s=Math.sin(r.ry),lx=dx*c-dz*s,lz=dx*s+dz*c;
        return Math.abs(lx)<=r.hx&&Math.abs(lz)<=r.hz;}
      if(r.kind==='strip'){var ax=r.a[0],az=r.a[1],ex=r.b[0]-ax,ez=r.b[1]-az,L2=ex*ex+ez*ez,t=L2>0?((x-ax)*ex+(z-az)*ez)/L2:0;
        if(t<0||t>1)return false;var px=ax+ex*t-x,pz=az+ez*t-z;return px*px+pz*pz<=r.w*r.w/4;}
      return false;
    }
    function ordered(){return recs.slice().sort(function(p,q){return p.y-q.y||p.seq-q.seq;});}
    function pick(x,z){var o2=ordered();for(var i=o2.length-1;i>=0;i--){var r=o2[i];if(r.kind!=='label'&&(r.name||r.tag)&&inside(r,x,z))return r;}return null;}
    function reliefPixels(g){
      if(!relief||!g||typeof g.createImageData!=='function')return null;
      var n=relief.n,img=g.createImageData(n,n);
      for(var p=0;p<n*n;p++){img.data[p*4]=relief.rgb[p*3];img.data[p*4+1]=relief.rgb[p*3+1];img.data[p*4+2]=relief.rgb[p*3+2];img.data[p*4+3]=255;}
      return img;
    }
    function paint(g,reliefImage){
      g.fillStyle=bg;g.fillRect(0,0,size,size);
      if(relief&&reliefImage){g.imageSmoothingEnabled=true;g.drawImage(reliefImage,0,0,size,size);}
      ordered().forEach(function(r){
        if(r.kind==='label'){var p=toPx(r.x,r.z);g.font=r.size+'px Helvetica,Arial,sans-serif';g.fillStyle='rgba(0,0,0,.6)';
          var tw=g.measureText?g.measureText(r.text).width:r.text.length*r.size*.5;g.fillText(r.text,p[0]-tw/2+1,p[1]+1);
          g.fillStyle=r.col||'#e8e0cc';g.fillText(r.text,p[0]-tw/2,p[1]);return;}
        g.fillStyle=colOf(r);g.strokeStyle=colOf(r);
        if(r.kind==='rect'){var a=toPx(r.rect[0],r.rect[2]),b=toPx(r.rect[1],r.rect[3]);g.fillRect(a[0],a[1],Math.max(1,b[0]-a[0]),Math.max(1,b[1]-a[1]));}
        else if(r.kind==='disc'){var cpx=toPx(r.x,r.z);g.beginPath();g.arc(cpx[0],cpx[1],Math.max(1,r.r/span*size),0,Math.PI*2);g.fill();}
        else if(r.kind==='strip'){var s0=toPx(r.a[0],r.a[1]),s1=toPx(r.b[0],r.b[1]);g.lineWidth=Math.max(1,r.w/span*size);g.lineCap='butt';g.beginPath();g.moveTo(s0[0],s0[1]);g.lineTo(s1[0],s1[1]);g.stroke();}
        else if(r.kind==='obb'){var c=Math.cos(r.ry),s=Math.sin(r.ry),pts=[[-1,-1],[1,-1],[1,1],[-1,1]].map(function(q){
            var lx=q[0]*r.hx,lz=q[1]*r.hz;return toPx(r.x+lx*c+lz*s,r.z-lx*s+lz*c);});
          var big=r.hx/span*size>.7||r.hz/span*size>.7;
          if(big){g.beginPath();g.moveTo(pts[0][0],pts[0][1]);for(var k=1;k<4;k++)g.lineTo(pts[k][0],pts[k][1]);g.closePath();g.fill();}
          else{var cp=toPx(r.x,r.z);g.fillRect(cp[0]-.6,cp[1]-.6,1.2,1.2);}}
      });
    }
    function overlay(g,v,hover){
      if(v){var p=toPx(v.x,v.z),dir=v.dir;
        if(dir){var ang=Math.atan2(dir[1],dir[0]);g.fillStyle='rgba(255,230,160,.35)';g.beginPath();g.moveTo(p[0],p[1]);g.arc(p[0],p[1],18,ang-.5,ang+.5);g.closePath();g.fill();}
        g.fillStyle='#ffe08a';g.beginPath();g.arc(p[0],p[1],3.5,0,Math.PI*2);g.fill();g.strokeStyle='#000';g.lineWidth=1;g.stroke();}
      if(hover){g.font='10px Helvetica,Arial,sans-serif';g.fillStyle='rgba(0,0,0,.65)';g.fillRect(0,size-16,size,16);g.fillStyle='#e8e0d0';g.fillText(hover,4,size-5);}
    }
    function exp(){
      return {format:'krator-minimap',version:1,convention:{units:'m',x:'east',z:'south',mapUp:'north (-z)'},
        frame:f.slice(),size:size,bg:bg,
        records:ordered().map(function(r){var o2={kind:r.kind,tag:r.tag,col:colOf(r),y:r.kind==='label'?null:r.y,name:r.name};
          if(r.kind==='rect')o2.rect=r.rect.slice();else if(r.kind==='strip'){o2.a=r.a.slice();o2.b=r.b.slice();o2.w=r.w;}
          else{o2.x=r.x;o2.z=r.z;if(r.kind==='disc')o2.r=r.r;if(r.kind==='obb'){o2.hx=r.hx;o2.hz=r.hz;o2.ry=r.ry;}if(r.kind==='label'){o2.text=r.text;o2.size=r.size;}}
          return o2;}),
        relief:relief?{n:relief.n,cell:relief.cell,rgb:Array.prototype.slice.call(relief.rgb)}:null};
    }
    return {rect:rect,obb:obb,strip:strip,disc:disc,label:label,fromWalk:fromWalk,relief:reliefOf,toPx:toPx,toWorld:toWorld,
      pick:pick,paint:paint,reliefPixels:reliefPixels,overlay:overlay,rev:function(){return rv;},export:exp,records:recs,frame:f,size:size};
  }
  root.KMAP={create:create};
})(typeof window!=='undefined'?window:globalThis);
