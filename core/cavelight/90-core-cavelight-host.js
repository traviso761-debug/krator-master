// ================================================================= CORE — the light underground: the three.js host (KCAVELIGHT.host)  [web]
// Poses three.js r128 lights from KCAVELIGHT's records each frame (core/cavelight/README.md, "The host"). Lifted from Dhelv's cave
// light (settlements/dhelv/src/94-dhelv-light.js: the switch, the wells' spot, sky light, bounce, shaft and motes, the pool) and the
// building-kit engine's night pool (core/engine/91n-night.js: the halo sprite, the pool of PointLights). It takes the page's own
// renderer, sun and hemisphere light, so a page with no core/host and no ATMOS (the Hearths' cave stations) can use it.
//
//   const CL = KCAVELIGHT.host({THREE, scene, renderer, camera, sun, hemi, ground(x, z), inVoid(x, y, z), sunDir() -> [x, y, z] | Vector3,
//                               day() -> 0..1, night() -> bool (the pool above ground too), pool 14, spots 4, halos true, shadows false,
//                               exposure: {surface, cave, max, floor, ramp} | false (the page keeps its exposure), lights() -> records,
//                               openings() -> records, reach 220 (m: openings lit within it), world (the motes' seed)})
//   CL.update(t)     each frame after the camera moved (t: the page's clock, s)
//   CL.rebuild()     after the records changed: the halos made again
//   CL.rebase()      the sun's and hemisphere's intensities read again as the surface's (a page whose sky changed them)
//   CL.state         {under, exposure, ambient, sky, sun, d (m to daylight), opening, pool (lit), spots, halos, openings (lit)}
//   CL.dispose()
(function(root){
  'use strict';
  var KC=root.KCAVELIGHT;if(!KC)throw new Error('core/cavelight 90-core-cavelight-host.js: load 10-core-cavelight.js first');
  function d(v,x){return v==null?x:v;}
  KC.host=function(o){
    var T=o.THREE||root.THREE,scene=o.scene,renderer=o.renderer,camera=o.camera,sun=o.sun||null,hemi=o.hemi||null;
    if(!T||!scene||!camera)throw new Error('KCAVELIGHT.host: THREE, scene and camera');
    var lightsOf=o.lights||KC.all,openOf=o.openings||KC.openings,POOL=d(o.pool,14),SPOTS=d(o.spots,4),reach=d(o.reach,220),EX=o.exposure===false?null:(o.exposure||{});
    var root3=new T.Group();root3.name='cavelight';root3.userData.probeSkip=true;scene.add(root3);
    var base={sun:sun?sun.intensity:0,hemi:hemi?hemi.intensity:0,exp:renderer?renderer.toneMappingExposure:1};
    var env=null,st={under:false,exposure:base.exp,ambient:1,sky:1,sun:1,d:Infinity,opening:null,pool:0,spots:0,halos:0,openings:0};
    var col=new T.Color(),v3=new T.Vector3(),up=new T.Vector3(0,1,0);
    function noRay(m){m.userData.probeSkip=true;m.raycast=function(){};return m;}

    /* the halo sprite (the engine's), one Points draw of every lit record */
    var haloTex=(function(){var c=document.createElement('canvas');c.width=c.height=64;var g=c.getContext('2d'),gr=g.createRadialGradient(32,32,0,32,32,32);
      gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(.25,'rgba(255,255,255,.55)');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.fillRect(0,0,64,64);return new T.CanvasTexture(c);})();
    var haloMat=new T.PointsMaterial({size:1.1,map:haloTex,vertexColors:true,transparent:true,depthWrite:false,blending:T.AdditiveBlending,sizeAttenuation:true,opacity:.25});haloMat.toneMapped=false;
    var halos=null;
    function rebuild(){if(halos){root3.remove(halos);halos.geometry.dispose();halos=null;}st.halos=0;if(o.halos===false)return;
      var p=[],c=[],L=lightsOf();
      L.forEach(function(r){if(r.on===false)return;col.set(r.colour);var k=Math.min(1.1,.45+r.intensity*.45);
        var put=function(x,y,z){p.push(x,y,z);c.push(col.r*k,col.g*k,col.b*k);};
        if(r.to){var n=Math.max(1,Math.round(Math.hypot(r.to[0]-r.x,r.to[1]-r.y,r.to[2]-r.z)/1.5));for(var i=0;i<=n;i++){var t=i/n;put(r.x+(r.to[0]-r.x)*t,r.y+(r.to[1]-r.y)*t,r.z+(r.to[2]-r.z)*t);}}
        else put(r.x,r.y,r.z);});
      if(!p.length)return;var g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(p,3));g.setAttribute('color',new T.Float32BufferAttribute(c,3));
      halos=noRay(new T.Points(g,haloMat));halos.frustumCulled=false;root3.add(halos);st.halos=p.length/3;}

    /* the pool: N point lights and a few spots for the hooded records */
    var pool=[],spots=[];
    for(var i=0;i<POOL;i++){var l=new T.PointLight(0xffa860,0,9,1.6);l.visible=false;root3.add(l);pool.push(l);}
    for(var j=0;j<SPOTS;j++){var s=new T.SpotLight(0xffffff,0,16,.7,.4,1.6);s.visible=false;root3.add(s);root3.add(s.target);spots.push(s);}
    function poolOff(){pool.forEach(function(l){l.visible=false;});spots.forEach(function(s){s.visible=false;});st.pool=st.spots=0;}
    function poolSet(p,t){var near=KC.near(p.x,p.y,p.z,POOL+SPOTS,lightsOf()),np=0,ns=0;
      for(var k=0;k<near.length;k++){var r=near[k],f=KC.flicker(r,t);col.set(r.colour);
        if(r.hood){if(ns>=SPOTS)continue;var S=spots[ns++];S.visible=true;S.position.set(r.x,r.y,r.z);S.target.position.set(r.x+r.hood.dir[0],r.y+r.hood.dir[1],r.z+r.hood.dir[2]);S.target.updateMatrixWorld();
          S.angle=r.hood.angle;S.distance=r.range;S.color.copy(col);S.intensity=r.intensity*f;continue;}
        if(np>=POOL)continue;var L=pool[np++];L.visible=true;
        if(r.to){/* a strip: the light at its point nearest the eye */var ux=r.to[0]-r.x,uy=r.to[1]-r.y,uz=r.to[2]-r.z,L2=ux*ux+uy*uy+uz*uz,q=L2>0?Math.max(0,Math.min(1,((p.x-r.x)*ux+(p.y-r.y)*uy+(p.z-r.z)*uz)/L2)):0;
          L.position.set(r.x+ux*q,r.y+uy*q,r.z+uz*q);}else L.position.set(r.x,r.y+.05,r.z);
        L.color.copy(col);L.intensity=r.intensity*f;L.distance=r.range;}
      for(var a=np;a<POOL;a++)pool[a].visible=false;for(var b=ns;b<SPOTS;b++)spots[b].visible=false;st.pool=np;st.spots=ns;}

    /* the openings' daylight (Dhelv's): made on first need, per opening */
    var OL={},shaftTex=(function(){var c=document.createElement('canvas');c.width=4;c.height=128;var g=c.getContext('2d'),gr=g.createLinearGradient(0,0,0,128);
      gr.addColorStop(0,'rgba(255,255,255,0)');gr.addColorStop(.12,'rgba(255,255,255,.9)');gr.addColorStop(1,'rgba(255,255,255,.15)');g.fillStyle=gr;g.fillRect(0,0,4,128);return new T.CanvasTexture(c);})();
    function openingLights(O){if(OL[O.id])return OL[O.id];var E={};
      E.spot=new T.SpotLight(0xfff0dc,0,0,.2,.35,1);if(o.shadows){E.spot.castShadow=true;E.spot.shadow.mapSize.set(1024,1024);E.spot.shadow.bias=-.0006;E.spot.shadow.normalBias=.4;}
      E.sky=new T.SpotLight(0xd8e4ff,0,0,.2,.85,1);E.bounce=new T.PointLight(0xffe2b8,0,O.r*7,1.2);
      [E.spot,E.sky].forEach(function(s){root3.add(s);root3.add(s.target);});root3.add(E.bounce);
      var m=new T.MeshBasicMaterial({color:0xfff0d0,map:shaftTex,transparent:true,opacity:0,blending:T.AdditiveBlending,depthWrite:false,side:T.DoubleSide});m.toneMapped=false;
      E.shaft=noRay(new T.Mesh(new T.CylinderGeometry(1,1,1,32,1,true),m));root3.add(E.shaft);
      /* the motes: positions in the beam's frame from KRAND (not Math.random: the same specks every load) */
      var K=root.KRAND,sd=K?K.child(d(o.world,0)>>>0,'cavelight.motes.'+O.id):0,N=320,pos=new Float32Array(N*3),seed=new Float32Array(N*3);
      for(var i=0;i<N;i++){var ua=K?K.unit(K.hash(sd,i,1)):((i*.618)%1),ub=K?K.unit(K.hash(sd,i,2)):((i*.381)%1),uc=K?K.unit(K.hash(sd,i,3)):((i*.127)%1),a=ua*6.2832,rr=Math.sqrt(ub);
        seed[i*3]=Math.cos(a)*rr;seed[i*3+1]=Math.sin(a)*rr;seed[i*3+2]=uc;}
      var g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(pos,3));
      var pm=new T.PointsMaterial({size:.09,map:haloTex,color:0xfff2d0,transparent:true,opacity:.75,depthWrite:false,blending:T.AdditiveBlending,sizeAttenuation:true});pm.toneMapped=false;
      E.motes={pts:noRay(new T.Points(g,pm)),seed:seed,N:N};E.motes.pts.frustumCulled=false;root3.add(E.motes.pts);
      E.show=function(on){E.spot.visible=E.sky.visible=E.bounce.visible=E.shaft.visible=E.motes.pts.visible=on;};E.show(false);
      return OL[O.id]=E;}
    function dirNow(){var s=o.sunDir?o.sunDir():[.4,.8,.45];if(s&&s.isVector3)s=[s.x,s.y,s.z];var L=Math.hypot(s[0],s[1],s[2])||1;return [s[0]/L,s[1]/L,s[2]/L];}
    function openingsSet(p,t,day){var O=openOf(),lit=0,sd=dirNow(),ux=new T.Vector3(1,0,0).cross(v3.set(sd[0],sd[1],sd[2])).normalize(),vx=new T.Vector3().crossVectors(v3,ux);
      for(var i=0;i<O.length;i++){var Q=O[i],near=Math.hypot(Q.c[0]-p.x,Q.c[1]-p.z)<Q.r+reach,on=near&&day>0;if(!on){if(OL[Q.id])OL[Q.id].show(false);continue;}
        var E=openingLights(Q),D=KC.daylight(Q,sd,day);E.show(true);lit++;if(sun)E.spot.color.copy(sun.color);
        if(D.spot){E.spot.position.fromArray(D.spot.pos);E.spot.target.position.fromArray(D.spot.target);E.spot.target.updateMatrixWorld();E.spot.angle=D.spot.angle;E.spot.intensity=D.spot.intensity*(base.sun?base.sun/1.4:1);
          if(E.spot.castShadow){E.spot.shadow.camera.near=D.spot.shadowNear;E.spot.shadow.camera.far=D.spot.shadowFar;E.spot.shadow.camera.updateProjectionMatrix();}}else E.spot.visible=false;
        E.sky.position.fromArray(D.sky.pos);E.sky.target.position.fromArray(D.sky.target);E.sky.target.updateMatrixWorld();E.sky.angle=D.sky.angle;E.sky.intensity=D.sky.intensity;E.sky.distance=d(D.sky.distance,0);if(hemi)E.sky.color.copy(hemi.color).lerp(col.set(0xffffff),.5);
        E.bounce.position.fromArray(D.bounce.pos);E.bounce.distance=D.bounce.distance;E.bounce.intensity=D.bounce.intensity;
        if(!D.shaft){E.shaft.visible=E.motes.pts.visible=false;continue;}
        E.shaft.position.fromArray(D.shaft.mid);E.shaft.scale.set(D.shaft.r,D.shaft.len,D.shaft.r);v3.set(Q.c[0]-D.beam.to[0],Q.top-Q.floor,Q.c[1]-D.beam.to[2]).normalize();E.shaft.quaternion.setFromUnitVectors(up,v3);E.shaft.material.opacity=D.shaft.opacity;
        var M=E.motes,a=M.pts.geometry.attributes.position.array,fx=D.beam.to[0],fz=D.beam.to[2],rr=Q.r*.85;
        for(var k=0;k<M.N;k++){var s0=M.seed[k*3],s1=M.seed[k*3+1],tt=(M.seed[k*3+2]+t*.006*(1+k%5*.2))%1,sw=.06*Math.sin(t*.7+k);
          var cx=Q.c[0]+(fx-Q.c[0])*tt,cy=Q.top+(Q.floor-Q.top)*tt,cz=Q.c[1]+(fz-Q.c[1])*tt;
          a[k*3]=cx+(ux.x*(s0+sw)+vx.x*s1)*rr;a[k*3+1]=cy+(ux.y*(s0+sw)+vx.y*s1)*rr+3*Math.sin(k*1.3);a[k*3+2]=cz+(ux.z*(s0+sw)+vx.z*s1)*rr;}
        M.pts.geometry.attributes.position.needsUpdate=true;}
      st.openings=lit;}

    var CL={state:st,root:root3,
      update:function(t){var p=camera.getWorldPosition(new T.Vector3()),gy=o.ground?o.ground(p.x,p.z):Infinity,inV=o.inVoid?!!o.inVoid(p.x,p.y,p.z):false;
        var under=KC.under({y:p.y,ground:gy,inVoid:inV,margin:o.margin}),day=o.day?Math.max(0,Math.min(1,o.day())):1;
        var E=KC.exposureAt(p.x,p.y,p.z,{under:under,day:day,ramp:EX?EX.ramp:null,surface:EX&&EX.surface!=null?EX.surface:base.exp,
          cave:EX&&EX.cave,max:EX&&EX.max,floor:EX&&EX.floor,night:EX&&EX.night,sunIn:EX&&EX.sunIn},openOf());
        st.under=under;st.d=E.d;st.opening=E.opening;st.ambient=E.ambient;st.sky=E.sky;st.sun=E.sun;
        if(EX&&renderer){renderer.toneMappingExposure=E.exposure;st.exposure=E.exposure;}else st.exposure=renderer?renderer.toneMappingExposure:1;
        if(sun){sun.intensity=base.sun*E.sun;sun.visible=E.sun>.002;}
        if(hemi)hemi.intensity=under?base.hemi*E.ambient:base.hemi;
        /* no sky in the reflections once the sky's share is under half */
        if(under&&E.sky<.5){if(scene.environment){env=scene.environment;scene.environment=null;}}else if(env&&!scene.environment){scene.environment=env;env=null;}
        haloMat.opacity=under?.85:(o.night&&o.night()?.95:.25);haloMat.size=under?1.4:1.1;
        if(under||(o.night&&o.night()))poolSet(p,t);else poolOff();
        openingsSet(p,t,day);},
      rebuild:rebuild,
      rebase:function(){base.sun=sun?sun.intensity:0;base.hemi=hemi?hemi.intensity:0;base.exp=renderer?renderer.toneMappingExposure:1;},
      dispose:function(){scene.remove(root3);root3.traverse(function(m){if(m.geometry)m.geometry.dispose();if(m.material)m.material.dispose();});haloTex.dispose();shaftTex.dispose();
        if(env&&!scene.environment)scene.environment=env;if(sun){sun.intensity=base.sun;sun.visible=true;}if(hemi)hemi.intensity=base.hemi;if(renderer)renderer.toneMappingExposure=base.exp;}};
    rebuild();return CL;};
})(typeof window!=='undefined'?window:globalThis);
