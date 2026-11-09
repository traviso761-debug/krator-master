// ================================================================= CORE HOST — geodes drawn (KGEODE.draw)  [web]
// Draws KGEODE's records (39f-core-geode.js) and decides nothing: every piece is where its record put it. Instanced, one draw a piece:
//   NODULES    a whole geode (a loose one not broken): a knobbly rough sphere, its skin grey-brown (the basalt's weathered rind)
//   SHELLS     a broken geode's half: a hemispherical bowl, the skin outside, the agate rind's lip at its rim, the cavity inside dark
//   FACES      the cut face across a broken half: a ring of agate bands (vertex colour: white, blue-grey, smoky) round the cavity
//   CAVITIES   the cavity inside the ring: a disc of amethyst druse just under the face (it reads however the ground cuts the bowl)
//   POINTS     amethyst points: each broken geode's cluster (a few points in its cavity) and every lining point KGEODE.line gave (the
//              walk-in geode's), a six-sided point, translucent purple, its glow a cheap fake (no refraction) brighter at a grazing view
// A broken geode stands half proud of its ground: its cut face out along n by half its radius, half its bowl in the rock or the ground.
//
//   const G = KGEODE.draw(recs, {THREE, points (KGEODE.line's), maps {skin, agate, amethyst} (THREE textures or null), lamp (a uniform
//        {value} 0..1: a light near the eye's glow), tint (0x8a5fc0)})   -> {group (not added), counts {nodules, shells, faces, points}, tris}
(function(root){
  'use strict';
  var K=root.KGEODE;if(!K)throw new Error('host/39g-core-geode-draw: load core/terrain/39f-core-geode.js first');
  K.draw=function(recs,o){o=o||{};var T=o.THREE||root.THREE;if(!T)throw new Error('KGEODE.draw: THREE');var R=root.KRAND,M=o.maps||{},pts=o.points||[];
    var u=function(id,k){var h=0;for(var i=0;i<id.length;i++)h=(h*31+id.charCodeAt(i))|0;return R.unit(R.hash(h,k));};
    // ---- the unit pieces (radius 1, the cut face on y = 0 looking +y; a point along +y, 0..1)
    function knobbly(g,amt){var p=g.attributes.position,v=new T.Vector3();for(var i=0;i<p.count;i++){v.fromBufferAttribute(p,i);var k=1+amt*(Math.sin(v.x*7.1+v.y*3.3)*Math.sin(v.z*6.7-v.y*5.1));p.setXYZ(i,v.x*k,v.y*k,v.z*k);}g.computeVertexNormals();return g;}
    var gNod=knobbly(new T.IcosahedronGeometry(1,1),.08);
    var gShell=knobbly(new T.SphereGeometry(1,12,4,0,Math.PI*2,Math.PI/2,Math.PI/2),.06);   /* the lower half: a bowl under y = 0, open upward */
    var gFace=(function(){var seg=16,rings=[.62,.7,.8,.88,.94,1],cols=[[.22,.18,.26],[.86,.88,.9],[.62,.68,.78],[.9,.9,.92],[.55,.56,.6],[.4,.38,.36]],P=[],C=[],I=[];
      rings.forEach(function(rr,k){for(var s=0;s<=seg;s++){var a=s/seg*Math.PI*2;P.push(Math.cos(a)*rr,0,Math.sin(a)*rr);C.push(cols[k][0],cols[k][1],cols[k][2]);}});
      for(var k=0;k+1<rings.length;k++)for(var s=0;s<seg;s++){var a=k*(seg+1)+s,b=a+seg+1;I.push(a,b,a+1,a+1,b,b+1);}
      var U=[];for(var q=0;q<P.length;q+=3)U.push(P[q]*.5+.5,P[q+2]*.5+.5);
      var g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(P,3));g.setAttribute('color',new T.Float32BufferAttribute(C,3));g.setAttribute('uv',new T.Float32BufferAttribute(U,2));
      g.setIndex(I);g.computeVertexNormals();return g;})();
    var gCav=new T.CircleGeometry(.64,20);gCav.rotateX(-Math.PI/2);gCav.translate(0,-.03,0);   /* the cavity: a disc of druse just under the face, inside the agate ring */
    var gPt=(function(){var g=new T.ConeGeometry(.5,1,6,1,false);g.translate(0,.5,0);return g;})();
    // ---- the instances
    var L={nod:[],shell:[],face:[],cav:[],pt:[]},m=new T.Matrix4(),q=new T.Quaternion(),q2=new T.Quaternion(),up=new T.Vector3(0,1,0),v=new T.Vector3(),s=new T.Vector3(),dn=new T.Vector3();
    function put(list,x,y,z,dir,spin,sx,sy,sz){dn.set(dir[0],dir[1],dir[2]).normalize();q.setFromUnitVectors(up,dn);q2.setFromAxisAngle(dn,spin);q.premultiply(q2);m.compose(v.set(x,y,z),q,s.set(sx,sy,sz));list.push(m.toArray());}
    recs.forEach(function(r){var n=r.n||[0,1,0];
      if(!r.split){var tl=r.tilt||0;put(L.nod,r.x,r.y+r.r*.55,r.z,[Math.sin(tl)*Math.cos(r.az),Math.cos(tl),Math.sin(tl)*Math.sin(r.az)],r.az,r.r,r.r*.85,r.r);return;}
      /* a broken half: its face along n (a wall geode's out of the cliff; a loose one's up, tipped a little), its centre set back into the rock or the ground */
      var dir=r.kind==='wall'?n:[Math.sin(r.tilt)*Math.cos(r.az)*.6,1,Math.sin(r.tilt)*Math.sin(r.az)*.6],dl0=Math.hypot(dir[0],dir[1],dir[2]);dir=[dir[0]/dl0,dir[1]/dl0,dir[2]/dl0];
      /* half proud of its ground: the face out by half a radius, half the bowl still in the rock (the ground's mesh is not cut: a cavity under it would not show) */
      var out=r.r*.5,cx=r.x+dir[0]*out,cy=r.y+dir[1]*out,cz=r.z+dir[2]*out;
      put(L.shell,cx,cy,cz,dir,r.az,r.r,r.r,r.r);put(L.face,cx,cy,cz,dir,r.az,r.r,r.r,r.r);put(L.cav,cx,cy,cz,dir,r.az,r.r,r.r,r.r);
      /* its cluster: a few points standing in the cavity, from round its floor toward the middle */
      for(var k=0;k<4;k++){var a=k/4*Math.PI*2+u(r.id,k),rr=r.r*.5*u(r.id,10+k),t1=[Math.cos(a)*rr,0,Math.sin(a)*rr];
        var dl=new T.Vector3(t1[0],-r.r*.45,t1[2]).applyQuaternion(new T.Quaternion().setFromUnitVectors(up,new T.Vector3(dir[0],dir[1],dir[2]).normalize()));
        put(L.pt,cx+dl.x,cy+dl.y,cz+dl.z,dir,u(r.id,20+k)*6.3,r.r*.16,r.r*(.25+.25*u(r.id,30+k)),r.r*.16);}});
    pts.forEach(function(p){put(L.pt,p.x-p.d[0]*.02,p.y-p.d[1]*.02,p.z-p.d[2]*.02,p.d,p.spin,p.len*p.w,p.len,p.len*p.w);});
    // ---- the materials
    var lamp=o.lamp||{value:0},tint=new T.Color(o.tint==null?0x8a5fc0:o.tint);
    var mSkin=new T.MeshStandardMaterial({color:0x8a8078,roughness:.95,metalness:0,map:M.skin||null});
    var mShell=new T.MeshStandardMaterial({color:0x7a726c,roughness:.95,metalness:0,map:M.skin||null,side:T.DoubleSide});
    var mFace=new T.MeshStandardMaterial({color:0xffffff,roughness:.35,metalness:0,vertexColors:true,map:M.agate||null});
    var mCav=new T.MeshStandardMaterial({color:tint.clone().lerp(new T.Color(0xffffff),.25),roughness:.3,metalness:0,map:M.amethyst||null,emissive:tint.clone().multiplyScalar(.18)});
    var mPt=new T.MeshStandardMaterial({color:tint,roughness:.15,metalness:0,map:M.amethyst||null,transparent:true,opacity:.86,flatShading:true});
    root.KHOOK.add(mPt,'kgeode-amethyst',{uniforms:function(){return {uLamp:lamp,uTint:{value:tint}};},
      fragment:{head:'uniform float uLamp;uniform vec3 uTint;\n',at:[{at:'emissivemap_fragment',after:'{float th=1.0-abs(dot(normalize(normal),normalize(vViewPosition)));float dl=length(vViewPosition);'+
       'totalEmissiveRadiance+=uTint*(0.16+0.9*uLamp*exp(-dl/9.0))*(0.35+0.65*th*th);}'}]}},{key:'kgeode-amethyst'});
    var grp=new T.Group();grp.name='geodes';var tris=0,counts={};
    function inst(geo,mat,list,name,label){counts[name]=list.length;if(!list.length)return null;var im=new T.InstancedMesh(geo,mat,list.length);
      for(var i=0;i<list.length;i++)im.instanceMatrix.array.set(list[i],i*16);im.instanceMatrix.needsUpdate=true;if(im.computeBoundingSphere)im.computeBoundingSphere();
      im.name='geodes:'+name;im.userData.host=true;im.userData.geode=true;im.userData.inspectLabel=label;grp.add(im);
      tris+=list.length*(geo.index?geo.index.count:geo.attributes.position.count)/3;return im;}
    inst(gNod,mSkin,L.nod,'nodules','A geode, whole (a knobbly nodule weathered out of the flow top)');
    inst(gShell,mShell,L.shell,'shells','A geode broken open (its shell)');
    inst(gFace,mFace,L.face,'faces','A geode broken open (the agate rind round its cavity)');
    inst(gCav,mCav,L.cav,'cavities','A geode broken open (its cavity, amethyst druse)');
    var ptM=inst(gPt,mPt,L.pt,'points','Amethyst');if(ptM)ptM.renderOrder=2;
    return {group:grp,counts:counts,tris:Math.round(tris)};};
})(typeof window!=='undefined'?window:globalThis);
