// ================================================================= CORE — walk registry (floors and blockers)
// One list of where a walker can stand and what stops it, written by whatever builds the geometry, at the
// moment it builds it (the Moria carver's pattern; TODO.md has the provenance).
// The walker, the minimap, click-to-go and the Godot export all read this one list, so none of them can
// disagree with what was built. Plain maths, no THREE, no DOM; a no-op until something registers.
//
// Axes: y up, metres, x east, z south (glTF and Godot's convention).
//
//   const W=KWALK                      the shared instance (KWALK.create() makes an independent one)
//   W.floor({rect:[x0,x1,z0,z1], y, name, tag})        a level floor
//   W.strip({a:[x,z,y], b:[x,z,y], w, name, tag})      a strip between two points whose floor rises along it
//                                                      (a passage, a stair, a ramp, a bridge); w is its full width
//   W.poly({pts:[[x,z,y],...], name, tag})            a floor over a polygon (kits/zeijani: the carved rooms, round and
//                                                      rounded): any simple polygon when every y is the same; CONVEX when
//                                                      the heights differ, its floor then planar per fan triangle from pts[0]
//   W.block([x0,x1,z0,z1,y0,y1], tag)                  a solid a walker cannot enter (a pillar, a hearth, a house)
//   W.floorsAt(x,z)               every floor over (x,z): [[y, rec], ...], highest first
//   W.floorBelow(x,z,y,step)      the highest floor at or below y+step (0.6): [y, rec], or null
//   W.blocked(x,y,z,r,h)          the first block a walker of radius r (0.3) and height h (1.7) standing at
//                                 (x,y,z) overlaps, or null
//   W.push(x,y,z,r,h)             [x,z] moved out of every block it overlaps: pushed to the nearest point of each
//                                 box (a hair past it, so blocked() agrees), three passes for corners, so a walker
//                                 slides round them instead of stopping
//   W.bounds()                    [x0,x1,z0,z1] over everything registered, or null
//   W.export()                    {format:'krator-walk', version, convention, floors, blocks}: for Godot, the
//                                 floors become navigation-mesh source and the blocks collision boxes
//   W.clear()
//
// A spatial hash (cell 16 m) keeps the queries local. Records keep insertion order, and a later floor at the
// same height wins ties, so the result never depends on the hash.
(function(root){
  'use strict';
  var CELL=16;
  function create(){
    var floors=[],blocks=[],grid=new Map(),seq=0;
    function key(i,j){return i+','+j;}
    function put(rec,x0,x1,z0,z1){
      var i0=Math.floor(x0/CELL),i1=Math.floor(x1/CELL),j0=Math.floor(z0/CELL),j1=Math.floor(z1/CELL);
      for(var i=i0;i<=i1;i++)for(var j=j0;j<=j1;j++){var k=key(i,j),a=grid.get(k);if(!a){a=[];grid.set(k,a);}a.push(rec);}
    }
    function near(x,z){return grid.get(key(Math.floor(x/CELL),Math.floor(z/CELL)))||[];}
    function num(v,what){if(typeof v!=='number'||!isFinite(v))throw new Error('KWALK: '+what+' must be a finite number');return v;}

    function floor(o){
      var r=o.rect;if(!r||r.length!==4)throw new Error('KWALK.floor: rect [x0,x1,z0,z1] required');
      var x0=Math.min(r[0],r[1]),x1=Math.max(r[0],r[1]),z0=Math.min(r[2],r[3]),z1=Math.max(r[2],r[3]);
      var rec={kind:'rect',rect:[x0,x1,z0,z1],y:num(o.y,'floor y'),name:o.name||'',tag:o.tag||'',seq:seq++};
      floors.push(rec);put(rec,x0,x1,z0,z1);return rec;
    }
    function strip(o){
      var a=o.a,b=o.b;if(!a||!b||a.length!==3||b.length!==3)throw new Error('KWALK.strip: a and b are [x,z,y]');
      var w=num(o.w,'strip w');if(w<=0)throw new Error('KWALK.strip: w must be positive');
      var rec={kind:'strip',a:a.slice(),b:b.slice(),w:w,name:o.name||'',tag:o.tag||'',seq:seq++},h=w/2;
      floors.push(rec);
      put(rec,Math.min(a[0],b[0])-h,Math.max(a[0],b[0])+h,Math.min(a[1],b[1])-h,Math.max(a[1],b[1])+h);return rec;
    }
    function poly(o){
      var P=o.pts;if(!P||P.length<3)throw new Error('KWALK.poly: pts [[x,z,y],...] (3 or more) required');
      var pts=P.map(function(p,i){if(!p||p.length!==3)throw new Error('KWALK.poly: point '+i+' is not [x,z,y]');
        return [num(p[0],'poly x'),num(p[1],'poly z'),num(p[2],'poly y')];});
      var x0=1e300,x1=-1e300,z0=1e300,z1=-1e300,level=true,area=0;
      for(var i=0;i<pts.length;i++){var q=pts[i],n=pts[(i+1)%pts.length];x0=Math.min(x0,q[0]);x1=Math.max(x1,q[0]);z0=Math.min(z0,q[1]);z1=Math.max(z1,q[1]);
        if(q[2]!==pts[0][2])level=false;area+=q[0]*n[1]-n[0]*q[1];}
      if(Math.abs(area)<1e-9)throw new Error('KWALK.poly: degenerate polygon');
      if(!level){// a sloped floor must be convex: every turn the same way as the winding
        for(var k=0;k<pts.length;k++){var a=pts[k],b=pts[(k+1)%pts.length],c=pts[(k+2)%pts.length];
          var cr=(b[0]-a[0])*(c[1]-b[1])-(b[1]-a[1])*(c[0]-b[0]);if(cr*area<-1e-9)throw new Error('KWALK.poly: a sloped floor must be convex');}}
      var rec={kind:'poly',pts:pts,level:level,box:null,bbox:[x0,x1,z0,z1],name:o.name||'',tag:o.tag||'',seq:seq++};
      floors.push(rec);put(rec,x0,x1,z0,z1);return rec;
    }
    function inPoly(P,x,z){var c=false;for(var i=0,j=P.length-1;i<P.length;j=i++){var a=P[i],b=P[j];
      if((a[1]>z)!==(b[1]>z)&&x<(b[0]-a[0])*(z-a[1])/(b[1]-a[1])+a[0])c=!c;}return c;}
    function block(bx,tag){
      if(!bx||bx.length!==6)throw new Error('KWALK.block: [x0,x1,z0,z1,y0,y1] required');
      var rec={box:[Math.min(bx[0],bx[1]),Math.max(bx[0],bx[1]),Math.min(bx[2],bx[3]),Math.max(bx[2],bx[3]),
        Math.min(bx[4],bx[5]),Math.max(bx[4],bx[5])],tag:tag||'',seq:seq++};
      blocks.push(rec);put(rec,rec.box[0],rec.box[1],rec.box[2],rec.box[3]);return rec;
    }
    // the floor height of one record at (x,z), or null when (x,z) is off it
    function heightOn(f,x,z){
      if(f.kind==='rect'){var r=f.rect;return x>=r[0]&&x<=r[1]&&z>=r[2]&&z<=r[3]?f.y:null;}
      if(f.kind==='poly'){var bb=f.bbox;if(x<bb[0]||x>bb[1]||z<bb[2]||z>bb[3]||!inPoly(f.pts,x,z))return null;
        var P=f.pts;if(f.level)return P[0][2];
        for(var t=1;t<P.length-1;t++){// the fan triangle (P0, Pt, Pt+1) holding (x,z): barycentric height
          var A=P[0],B=P[t],C=P[t+1],d=(B[1]-C[1])*(A[0]-C[0])+(C[0]-B[0])*(A[1]-C[1]);if(Math.abs(d)<1e-12)continue;
          var l1=((B[1]-C[1])*(x-C[0])+(C[0]-B[0])*(z-C[1]))/d,l2=((C[1]-A[1])*(x-C[0])+(A[0]-C[0])*(z-C[1]))/d,l3=1-l1-l2;
          if(l1>=-1e-9&&l2>=-1e-9&&l3>=-1e-9)return l1*A[2]+l2*B[2]+l3*C[2];}
        return null;}
      var a=f.a,b=f.b,dx=b[0]-a[0],dz=b[1]-a[1],L2=dx*dx+dz*dz;
      var t=L2>0?((x-a[0])*dx+(z-a[1])*dz)/L2:0;if(t<0||t>1)return null;
      var px=a[0]+dx*t-x,pz=a[1]+dz*t-z;if(px*px+pz*pz>f.w*f.w/4)return null;
      return a[2]+(b[2]-a[2])*t;
    }
    function floorsAt(x,z){
      var out=[],c=near(x,z);
      for(var i=0;i<c.length;i++){var f=c[i];if(f.box||f.kind===undefined)continue;var y=heightOn(f,x,z);if(y!==null)out.push([y,f]);}
      out.sort(function(p,q){return q[0]-p[0]||q[1].seq-p[1].seq;});return out;
    }
    function floorBelow(x,z,y,step){
      var s=step===undefined?0.6:step,fs=floorsAt(x,z);
      for(var i=0;i<fs.length;i++)if(fs[i][0]<=y+s)return fs[i];
      return null;
    }
    // the blocks whose plan a circle of radius r at (x,z) may touch, and whose span meets [y, y+h]
    function candidates(x,y,z,r,h){
      var out=[],seen=new Set(),i0=Math.floor((x-r)/CELL),i1=Math.floor((x+r)/CELL),j0=Math.floor((z-r)/CELL),j1=Math.floor((z+r)/CELL);
      for(var i=i0;i<=i1;i++)for(var j=j0;j<=j1;j++){var a=grid.get(key(i,j));if(!a)continue;
        for(var k=0;k<a.length;k++){var b=a[k];if(!b.box||b.kind||seen.has(b))continue;seen.add(b);
          if(b.box[5]>y&&b.box[4]<y+h)out.push(b);}}
      out.sort(function(p,q){return p.seq-q.seq;});return out;
    }
    function blocked(x,y,z,r,h){
      r=r===undefined?0.3:r;h=h===undefined?1.7:h;var c=candidates(x,y,z,r,h);
      for(var i=0;i<c.length;i++){var B=c[i].box,cx=Math.max(B[0],Math.min(x,B[1])),cz=Math.max(B[2],Math.min(z,B[3]));
        if((x-cx)*(x-cx)+(z-cz)*(z-cz)<r*r)return c[i];}
      return null;
    }
    function push(x,y,z,r,h){
      r=r===undefined?0.3:r;h=h===undefined?1.7:h;
      for(var pass=0;pass<3;pass++){var c=candidates(x,y,z,r,h),moved=false;
        for(var i=0;i<c.length;i++){var B=c[i].box,cx=Math.max(B[0],Math.min(x,B[1])),cz=Math.max(B[2],Math.min(z,B[3]));
          var dx=x-cx,dz=z-cz,d2=dx*dx+dz*dz;if(d2>=r*r)continue;
          if(d2>1e-12){var d=Math.sqrt(d2),k=r*(1+1e-9)/d;x=cx+dx*k;z=cz+dz*k;}
          else{// the centre is inside the box: leave by the nearest face
            var e=[x-B[0],B[1]-x,z-B[2],B[3]-z],m=Math.min(e[0],e[1],e[2],e[3]);
            var rr=r*(1+1e-9);if(m===e[0])x=B[0]-rr;else if(m===e[1])x=B[1]+rr;else if(m===e[2])z=B[2]-rr;else z=B[3]+rr;}
          moved=true;}
        if(!moved)break;}
      return [x,z];
    }
    function bounds(){
      var b=null;function grow(x0,x1,z0,z1){if(!b)b=[x0,x1,z0,z1];else{b[0]=Math.min(b[0],x0);b[1]=Math.max(b[1],x1);b[2]=Math.min(b[2],z0);b[3]=Math.max(b[3],z1);}}
      floors.forEach(function(f){if(f.kind==='rect')grow.apply(null,f.rect);else if(f.kind==='poly')grow.apply(null,f.bbox);
        else{var h=f.w/2;grow(Math.min(f.a[0],f.b[0])-h,Math.max(f.a[0],f.b[0])+h,Math.min(f.a[1],f.b[1])-h,Math.max(f.a[1],f.b[1])+h);}});
      blocks.forEach(function(k){grow(k.box[0],k.box[1],k.box[2],k.box[3]);});
      return b;
    }
    function exp(){
      return {format:'krator-walk',version:1,
        convention:{units:'m',up:'+y',x:'east',z:'south',handed:'right'},
        floors:floors.map(function(f){return f.kind==='rect'?{kind:'rect',rect:f.rect.slice(),y:f.y,name:f.name,tag:f.tag}
          :f.kind==='poly'?{kind:'poly',pts:f.pts.map(function(p){return p.slice();}),name:f.name,tag:f.tag}
          :{kind:'strip',a:f.a.slice(),b:f.b.slice(),w:f.w,name:f.name,tag:f.tag};}),
        blocks:blocks.map(function(k){return {box:k.box.slice(),tag:k.tag};})};
    }
    function clear(){floors.length=0;blocks.length=0;grid.clear();seq=0;}
    return {floor:floor,strip:strip,poly:poly,block:block,floorsAt:floorsAt,floorBelow:floorBelow,blocked:blocked,push:push,
      bounds:bounds,export:exp,clear:clear,floors:floors,blocks:blocks,heightOn:heightOn};
  }
  var W=create();W.create=create;
  root.KWALK=W;
})(typeof window!=='undefined'?window:globalThis);
