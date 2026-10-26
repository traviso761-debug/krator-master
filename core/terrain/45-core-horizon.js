// ================================================================= CORE — horizon maps (KHORIZON: terrain shadows and sky visibility)  [G data]
// HEIGHT-RESEARCH.md item 2 (2026-10-26, the final rebuild's R2). Baked once per page: for each texel of a heightfield,
// the elevation of the horizon in 8 azimuths, packed into two RGBA8 arrays (directions 0-3 and 4-7; byte = 255 sin(angle),
// a horizon below level counts as level). At run time a pixel is in shadow when the sun stands below the horizon
// interpolated for the sun's azimuth (soft over a few degrees): mountains cast long shadows across the valleys at a low
// sun, at every distance, which a shadow map does not. The mean of the eight is sky visibility: an ambient occlusion for
// gorges, canyon floors and the feet of cliffs. The shading is core/terrain/host/45-core-horizon-shade.js
// (KHORIZON.shade). Sources: Timonen and Westerholm 2010 (horizon mapping), HEIGHT-RESEARCH.md.
//
// No THREE, no DOM: plain maths, node-tested (test-horizon.js). Axes: y up, metres, x east, z south. Direction d points
// along (cos(d * 45 deg), sin(d * 45 deg)) in x-z: 0 east, 2 south, 4 west, 6 north.
//
//   KHORIZON.bake(o)
//        o.box      [x0, z0, x1, z1] the area the maps cover (texel centres at x0 + (i + .5) / n * (x1 - x0))
//        o.n        texels a side (256; 512 for a fine page: 2 MB)
//        o.h(x, z)  the height (read n*n times, once a texel); or o.H (Float32Array n*n, row by row: z outer) given
//        o.far      {h(x, z), box, n}: an optional coarse grid round it (a far field, KFAR's lattice reader) the rays read
//                   beyond o.box, so a range outside the map shades the map
//        o.reach    how far a ray looks (6000 m); o.bias (0.3 m) lifts the eye off its own texel
//        -> {n, box, dirs: 8, A (Uint8Array n*n*4: directions 0-3), B (4-7), sky (Float32Array n*n, 1 open .. 0 shut),
//            steps (the ray's sample distances)}
//   KHORIZON.at(H, x, z, sunDir, soft)  the shadow (0 shade .. 1 lit) the shader computes, for tests and placement:
//        sunDir [x, y, z] (any length), soft (.035, sin of the half-width of the penumbra); outside the box 1
//   KHORIZON.skyAt(H, x, z)   the sky visibility there (bilinear), 1 outside
//   KHORIZON.horizon(H, x, z, az)  sin of the horizon's elevation at azimuth az (radians, atan2(z, x)), interpolated
//   KHORIZON.hash(H)   a determinism hash
(function(root){
  var KR=root.KRAND,D=8;
  function clamp(v,a,b){return v<a?a:v>b?b:v;}
  function grid(h,box,n){var H=new Float32Array(n*n),w=box[2]-box[0],d=box[3]-box[1];
    for(var j=0;j<n;j++)for(var i=0;i<n;i++)H[j*n+i]=h(box[0]+(i+.5)/n*w,box[1]+(j+.5)/n*d);return H;}
  // a bilinear reader on texel centres; NaN off the grid
  function reader(H,box,n){var w=box[2]-box[0],d=box[3]-box[1];
    return function(x,z){var fu=(x-box[0])/w*n-.5,fv=(z-box[1])/d*n-.5;if(fu<-.5||fv<-.5||fu>n-.5||fv>n-.5)return NaN;
      fu=clamp(fu,0,n-1.000001);fv=clamp(fv,0,n-1.000001);var i=Math.floor(fu),j=Math.floor(fv),a=fu-i,b=fv-j,k=j*n+i;
      return H[k]*(1-a)*(1-b)+H[k+1]*a*(1-b)+H[k+n]*(1-a)*b+H[k+n+1]*a*b;};}
  function bake(o){
    if(!o||!o.box||o.box.length!==4||!(o.box[2]>o.box[0])||!(o.box[3]>o.box[1]))throw new Error('KHORIZON.bake: o.box [x0,z0,x1,z1]');
    var n=o.n==null?256:o.n,box=o.box;if(!(n>=2))throw new Error('KHORIZON.bake: o.n must be at least 2');
    var H=o.H?o.H:(typeof o.h==='function'?grid(o.h,box,n):null);if(!H||H.length!==n*n)throw new Error('KHORIZON.bake: o.h(x,z), or o.H of n*n heights');
    var rd=reader(H,box,n),fr=null;
    if(o.far){var fn=o.far.n==null?128:o.far.n,FH=o.far.H||grid(o.far.h,o.far.box,fn);fr=reader(FH,o.far.box,fn);}
    var reach=o.reach==null?6000:o.reach,bias=o.bias==null?.3:o.bias,cs=Math.max((box[2]-box[0])/n,(box[3]-box[1])/n),steps=[];
    for(var t=cs*.75;t<reach;t+=Math.max(cs*.5,t*.06))steps.push(t);
    var A=new Uint8Array(n*n*4),B=new Uint8Array(n*n*4),sky=new Float32Array(n*n),dx=[],dz=[],w=box[2]-box[0],dd=box[3]-box[1];
    for(var q=0;q<D;q++){var a=q*2*Math.PI/D;dx.push(Math.cos(a));dz.push(Math.sin(a));}
    for(var j=0;j<n;j++)for(var i=0;i<n;i++){var k=j*n+i,x=box[0]+(i+.5)/n*w,z=box[1]+(j+.5)/n*dd,h0=H[k]+bias,sum=0;
      for(q=0;q<D;q++){var best=0;
        for(var s=0;s<steps.length;s++){var T=steps[s],px=x+dx[q]*T,pz=z+dz[q]*T,hh=rd(px,pz);if(hh!==hh){if(!fr)break;hh=fr(px,pz);if(hh!==hh)break;}
          var tn=(hh-h0)/T;if(tn>best)best=tn;}
        var sn=best/Math.sqrt(1+best*best),by=Math.round(sn*255);sum+=sn;
        if(q<4)A[k*4+q]=by;else B[k*4+q-4]=by;}
      sky[k]=1-sum/D;}
    return {n:n,box:box.slice(),dirs:D,A:A,B:B,sky:sky,steps:steps};}
  // the horizon (sin) at a texel for azimuth az, between the two nearest directions; bilinear in space as the GPU does
  function texel(Hz,i,j,q){q=((q%D)+D)%D;var k=(j*Hz.n+i)*4;return (q<4?Hz.A[k+q]:Hz.B[k+q-4])/255;}
  function horizon(Hz,x,z,az){var n=Hz.n,b=Hz.box,fu=(x-b[0])/(b[2]-b[0])*n-.5,fv=(z-b[1])/(b[3]-b[1])*n-.5;if(fu<-.5||fv<-.5||fu>n-.5||fv>n-.5)return 0;
    fu=clamp(fu,0,n-1.000001);fv=clamp(fv,0,n-1.000001);var i=Math.floor(fu),j=Math.floor(fv),a=fu-i,c=fv-j,f=((az/(2*Math.PI))*D%D+D)%D,q0=Math.floor(f),t=f-q0;
    var v=function(q){return texel(Hz,i,j,q)*(1-a)*(1-c)+texel(Hz,i+1,j,q)*a*(1-c)+texel(Hz,i,j+1,q)*(1-a)*c+texel(Hz,i+1,j+1,q)*a*c;};
    return v(q0)*(1-t)+v(q0+1)*t;}
  function sm(a,b,v){var t=clamp((v-a)/(b-a),0,1);return t*t*(3-2*t);}
  function at(Hz,x,z,s,soft){var b=Hz.box;if(x<b[0]||z<b[1]||x>b[2]||z>b[3])return 1;var l=Math.hypot(s[0],s[1],s[2]);if(!(l>0))return 1;
    var sy=s[1]/l,hz=horizon(Hz,x,z,Math.atan2(s[2],s[0])),k=soft==null?.035:soft;return sm(hz-k,hz+k,sy);}
  function skyAt(Hz,x,z){var b=Hz.box;if(x<b[0]||z<b[1]||x>b[2]||z>b[3])return 1;return reader(Hz.sky,b,Hz.n)(x,z);}
  function hash(Hz){var h=KR?KR.hash(11,Hz.n,Hz.dirs):Hz.n>>>0;for(var i=0;i<Hz.A.length;i+=3)h=KR?KR.hash(h,Hz.A[i],Hz.B[i]):((h*31+Hz.A[i]*7+Hz.B[i])>>>0);return h>>>0;}
  root.KHORIZON=Object.assign(root.KHORIZON||{},{bake:bake,at:at,skyAt:skyAt,horizon:horizon,hash:hash,grid:grid,dirs:D});
})(typeof globalThis!=='undefined'?globalThis:this);
