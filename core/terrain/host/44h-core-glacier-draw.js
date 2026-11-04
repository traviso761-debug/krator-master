// ================================================================= CORE — glacier: the drawing ([web])
// The browser half of core/terrain/44g-core-glacier.js (KGLACIER): it draws the records the data half places. Lifted
// 2026-11-03 from the Throne's glacier station (stations/glacier/86-host-glacier.js), verbatim, so its page draws what it
// drew: the same BIO.fn draws in the same order. Needs THREE, core/biome (BIO) and the data half loaded first.
//
//   const D = KGLACIER.drawer({scene, register, fog, ticks, onLight, camera, renderer, map, tint})
//     map       the ice's albedo (the library's clear ice), or null: the flat ice colours
//     register  the host's REGISTER (a volume record per cave and arch)        ticks, onLight  the host's TICKS and _onLight
//   D.defSerac(mat, label)       BIO item 'serac': a broken block of ice, its top chiselled to a slant (seracs and icebergs)
//   D.defTower(mat, label)       BIO item 'icetower': a lumpy chimney of frozen steam
//   D.putSerac(r, colour)        a serac or berg record (G.seracs, G.bergs) put as a 'serac' item
//   D.cave(C)                    an ice cave's shell: an outer dome, an inner face lit blue through the ice (deeper away from
//                                its mouth), a rim where they meet; C: {x, z, R, H, face, mouth, floor, name}
//   D.arch(A)                    a bowed span of ice: A {x, z, span, rise, tube, a, name}
//   D.crevasse(r, ice)           a crevasse record cut as a dark slot into the ice's top (ice: the host's ice-top height fn)
//   D.steam(src)                 steam points: src [{x, z, y, n, size, rise, rate}] (fumaroles, tower tops, cave mouths)
//   D.mats                       {out, arch, inner, steam} (the inner face's and the steam's uniforms follow day and night)
(function(root){
  if(!root.KGLACIER)throw new Error('44h-core-glacier-draw.js needs 44g-core-glacier.js first');
  root.KGLACIER.drawer=function(E){
    const {TAU,clamp,reseed,rng,rr,fbm,qEuler}=BIO.fn,scene=E.scene,MAP=E.map||null;
    const C3=h=>new THREE.Color(h);
    const defSerac=(mat,label)=>BIO.def('serac',(function(){const g=new THREE.BoxGeometry(1,1,1,3,4,3),p=g.attributes.position,J={};reseed(8611);
     for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i),k=x.toFixed(3)+','+y.toFixed(3)+','+z.toFixed(3);if(!J[k])J[k]=[rr(-.13,.13),rr(-.1,.1),rr(-.13,.13)];const j=J[k],t=y+.5;
      p.setXYZ(i,x*(1-.3*t)+j[0],t+j[1]-.35*t*(x+.5),z*(1-.2*t)+j[2]);}g.computeVertexNormals();return g;})(),mat,{label:label||'Seracs and icebergs'});
    const defTower=(mat,label)=>BIO.def('icetower',(function(){const g=new THREE.LatheGeometry([[2.2,0],[2.0,.1],[1.6,.3],[1.3,.5],[1.05,.7],[.8,.88],[.55,.97],[.32,1.0],[.2,1.0]].map(q=>new THREE.Vector2(q[0]/2.2,q[1])),14),p=g.attributes.position;
     for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i),a=Math.atan2(z,x),k=1+.22*Math.sin(a*3+y*7)+.12*Math.sin(a*5-y*13);p.setXYZ(i,x*k,y,z*k);}g.computeVertexNormals();return g;})(),mat,{label:label||'Ice towers (frozen steam)'});
    function putSerac(r,col,y){BIO.put('serac',[r.x,y==null?(r.y!=null?r.y-r.s*.35:E.ground(r.x,r.z)-r.h*.3):y,r.z],qEuler(r.tilt[0],r.yaw,r.tilt[1]),[r.s,r.h,r.d],col);}
    // the caves' faces
    const out=new THREE.MeshLambertMaterial({color:MAP?0xffffff:0xd8e8f4,map:MAP,side:THREE.DoubleSide}),arch=new THREE.MeshPhongMaterial({color:MAP?0xffffff:0xc8def0,map:MAP,specular:0x6688aa,shininess:40,flatShading:true});
    const inner=new THREE.ShaderMaterial({fog:true,side:THREE.DoubleSide,uniforms:THREE.UniformsUtils.merge([THREE.UniformsLib.fog,{uNight:{value:0}}]),
     vertexShader:['#include <fog_pars_vertex>','attribute float aD;varying float vD;varying vec3 vWP;','void main(){vD=aD;vec4 wp=modelMatrix*vec4(position,1.0);vWP=wp.xyz;vec4 mvPosition=viewMatrix*wp;gl_Position=projectionMatrix*mvPosition;','#include <fog_vertex>','}'].join('\n'),
     fragmentShader:['#include <fog_pars_fragment>','uniform float uNight;varying float vD;varying vec3 vWP;',
      'void main(){float sc=0.5+0.5*sin(vWP.x*1.7+sin(vWP.y*2.3)*1.5)*sin(vWP.z*1.9+sin(vWP.x*1.1));',
      ' vec3 day=mix(vec3(0.62,0.86,0.98),vec3(0.06,0.26,0.52),smoothstep(0.0,1.0,vD))*(0.82+0.3*sc);',
      ' vec3 night=mix(vec3(0.10,0.26,0.30),vec3(0.03,0.10,0.18),vD)*(0.8+0.3*sc)+vec3(0.05,0.14,0.10)*(1.0-vD);',
      ' gl_FragColor=vec4(mix(day,night,uNight),1.0);','#include <fog_fragment>','}'].join('\n')});
    if(E.tint)inner.fragmentShader=inner.fragmentShader.replace('gl_FragColor=vec4(mix(day,night,uNight),1.0);','gl_FragColor=vec4(mix(day,night,uNight)*vec3('+E.tint.map(v=>v.toFixed(3)).join(',')+'),1.0);');
    inner.uniforms.fogColor.value=scene.fog.color;inner.uniforms.fogDensity.value=scene.fog.density;
    function cave(C){const FQ=E.fine==null?1:E.fine,NT=48*FQ,NP=14*FQ,TH=.16,po=[],pi=[],di=[];reseed(8620+Math.round(C.R));   /* E.fine (opt-in): a finer shell, the mouth's edge less stepped */
     const fq=FQ,jit=[];for(let i=0;i<=NT;i++){jit[i]=[];for(let j=0;j<=NP;j++)jit[i][j]=(i===NT?jit[0][j]:1+.12*(fbm(i/fq*.35,j/fq*.4,8621+C.R,2)-.5)*2);}   /* the same lumps at any fineness */
     const P=(i,j,s)=>{const th=i/NT*TAU,ph=j/NP*Math.PI/2,r=C.R*jit[i][j]*s,y=C.H*Math.cos(ph)*(s<1?.92:1);return[C.x+Math.cos(th)*Math.sin(ph)*r,C.floor-.6+y+(j===NP?0:0),C.z+Math.sin(th)*Math.sin(ph)*r];};
     const inMouth=(i,j)=>{const th=(i+.5)/NT*TAU,ph=(j+.5)/NP;let d=Math.abs(((th-C.face)%TAU+TAU+Math.PI)%TAU-Math.PI);const lo=E.mouthTop==null?.32:E.mouthTop;   /* E.mouthTop (opt-in): how high the mouth opens (a share of the polar angle from the top; larger: a lower opening, more roof) */   // ph: 0 the top, 1 the ground; the arch opens below lo
      if(ph<lo)return false;return d<C.mouth*Math.PI*Math.sqrt(clamp((ph-lo)/(1-lo),0,1));};
     const depth=(i,j)=>{const th=i/NT*TAU;return clamp(Math.abs(((th-C.face)%TAU+TAU+Math.PI)%TAU-Math.PI)/Math.PI,0,1);};
     const tri=(arr,a,b,c)=>{arr.push(...a,...b,...c);};
     for(let i=0;i<NT;i++)for(let j=0;j<NP;j++){if(inMouth(i,j))continue;
      const a=P(i,j,1),b=P(i+1,j,1),c=P(i+1,j+1,1),d=P(i,j+1,1);tri(po,a,c,b);tri(po,a,d,c);
      const A=P(i,j,1-TH),B=P(i+1,j,1-TH),Cc=P(i+1,j+1,1-TH),D=P(i,j+1,1-TH);tri(pi,A,B,Cc);tri(pi,A,Cc,D);di.push(depth(i,j),depth(i+1,j),depth(i+1,j+1),depth(i,j),depth(i+1,j+1),depth(i,j+1));
      // the rim: wherever a neighbour is the mouth, close the gap between the faces
      const rim=(o0,o1,i0,i1,k0,k1)=>{tri(pi,o0,o1,i1);tri(pi,o0,i1,i0);di.push(k0,k1,k1,k0,k1,k0);};
      if(i>0&&inMouth(i-1,j)||i===0&&inMouth(NT-1,j))rim(a,d,A,D,depth(i,j),depth(i,j+1));
      if(inMouth((i+1)%NT,j))rim(b,c,B,Cc,depth(i+1,j),depth(i+1,j+1));
      if(j<NP-1&&inMouth(i,j+1))rim(d,c,D,Cc,depth(i,j+1),depth(i+1,j+1));}
     // E.skirt (m, opt-in; 2026-11-03, Copper Glacier): the shell's foot carried down past the ground under it (a slope, a coarse ground mesh), so
     // it never stands on air; both faces, the mouth's threshold left open
     if(E.skirt)for(let i=0;i<NT;i++){if(inMouth(i,NP-1))continue;const a=P(i,NP,1),b=P(i+1,NP,1),A=P(i,NP,1-TH),B=P(i+1,NP,1-TH);
      const dn=p=>[p[0],Math.min(p[1],E.ground(p[0],p[2])-.4)-E.skirt,p[2]];tri(po,a,dn(b),b);tri(po,a,dn(a),dn(b));tri(pi,A,B,dn(B));tri(pi,A,dn(B),dn(A));di.push(1,1,1,1,1,1);}
     // E.apron (a share of R, opt-in; 2026-11-03, Copper Glacier): a fillet of ice from the shell's lower flank out to the ground, so the dome sits in the
     // terrain, not on it (the ground mesh's cells are as wide as a cave: it cannot carve the join). K rings outward, each falling from the flank's
     // height to just under the ground there; the mouth's columns left open
     if(E.apron){const K=5,j0=Math.round(NP*.79),ring=(i,k)=>{const th=i/NT*TAU,f=P(i,j0,1),r0=Math.hypot(f[0]-C.x,f[2]-C.z),t=k/K,r=r0+C.R*E.apron*t,x=C.x+Math.cos(th)*r,z=C.z+Math.sin(th)*r,
       e=t*t*(3-2*t);return[x,f[1]+(Math.min(f[1],E.ground(x,z))-.35-f[1])*e,z];};
      const open=i=>inMouth(i,NP-1)||inMouth(i,j0)||inMouth((i+NT-1)%NT,NP-1)||inMouth((i+1)%NT,NP-1);
      for(let i=0;i<NT;i++){if(open(i)||open((i+1)%NT))continue;for(let k=0;k<K;k++){const a=ring(i,k),b=ring(i+1,k),c=ring(i+1,k+1),d=ring(i,k+1);tri(po,a,c,b);tri(po,a,d,c);}}}     const go=new THREE.BufferGeometry();go.setAttribute('position',new THREE.Float32BufferAttribute(po,3));{const uv=[];for(let k=0;k<po.length;k+=3){const dx=po[k]-C.x,dz=po[k+2]-C.z;
      if(E.uvWorld)uv.push(po[k]*.11,(po[k+1]*.8+po[k+2]*.6)*.11);   /* opt-in: a planar map, no pole swirl at the dome's top */
      else uv.push((Math.atan2(dz,dx)/TAU+.5)*C.R*.35,(po[k+1]-C.floor)*.12);}go.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));}go.computeVertexNormals();
     const gi=new THREE.BufferGeometry();gi.setAttribute('position',new THREE.Float32BufferAttribute(pi,3));gi.setAttribute('aD',new THREE.Float32BufferAttribute(di,1));gi.computeVertexNormals();
     const mo=new THREE.Mesh(go,out),mi=new THREE.Mesh(gi,inner);mo.userData.inspectLabel=mi.userData.inspectLabel=C.name;scene.add(mo);scene.add(mi);
     // E.caveFloor (a material, opt-in): the cave's own floor, a disc under the shell, for a host whose ground runs over the dome (a cave buried in
     // the glacier, its ice drawn by the ground mesh: the ground is not under the shell any more)
     if(E.caveFloor){const fp=[],fn=[],R1=C.R*1.02;for(let i=0;i<NT;i++){const t0=i/NT*TAU,t1=(i+1)/NT*TAU,y=C.floor+.03;
      fp.push(C.x,y,C.z,C.x+Math.cos(t1)*R1,y,C.z+Math.sin(t1)*R1,C.x+Math.cos(t0)*R1,y,C.z+Math.sin(t0)*R1);for(let k=0;k<3;k++)fn.push(0,1,0);}
      const gf=new THREE.BufferGeometry();gf.setAttribute('position',new THREE.Float32BufferAttribute(fp,3));gf.setAttribute('normal',new THREE.Float32BufferAttribute(fn,3));
      const mf=new THREE.Mesh(gf,E.caveFloor);mf.userData.inspectLabel=C.name+' (its floor)';mf.receiveShadow=true;scene.add(mf);}
     E.register(Object.assign({name:C.name,x:C.x,z:C.z,y:C.floor-1,r:C.R*1.15,h:C.H+4},C.reg||{}));return[mo,mi];}
    function archAt(A,y){const R0=A.span/2,g=new THREE.TorusGeometry(R0,A.tube,12,48,Math.PI),p=g.attributes.position;reseed(8640);
     // each ring of the tube pushed out from its own centre: thick at the feet, thinner over the top, lumpy all along; the
     // span then raised to its rise
     for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i),t=Math.atan2(y,x),cx=Math.cos(t)*R0,cy=Math.sin(t)*R0,
       k=(1+.9*Math.pow(1-Math.sin(t),2))*(1+.35*(fbm(x*.18+3,y*.18+z*.25,8641,2)-.5)*2);
      p.setXYZ(i,cx+(x-cx)*k,(cy+(y-cy)*k)*(A.rise/R0),z*k);}
     g.computeVertexNormals();const m=new THREE.Mesh(g,arch);y=y==null?E.ground(A.x,A.z)-A.tube*.8:y;m.position.set(A.x,y,A.z);m.rotation.y=-A.a;m.userData.inspectLabel=A.name;scene.add(m);
     E.register({name:A.name,x:A.x,z:A.z,y:y-2,r:A.span*.7,h:A.rise+6,arch:true});return m;}
    // a crevasse: a dark wedge sunk into the ice's top along its length, its lips a little raised (one quad strip each side)
    const crevMat=new THREE.MeshLambertMaterial({color:0x2a5a7a,side:THREE.DoubleSide});
    function crevasses(list,iceTop){if(!list.length)return null;const P=[],I=[];let n=0;
     list.forEach(r=>{const cu=Math.cos(r.yaw),su=Math.sin(r.yaw),ax=E.across[0]*cu+E.up[0]*su,az=E.across[1]*cu+E.up[1]*su,ox=-az,oz=ax,K=8;
      for(let k=0;k<=K;k++){const t=(k/K-.5)*r.len,w=r.w*.5*Math.sqrt(1-Math.pow(2*k/K-1,2)),x=r.x+ax*t,z=r.z+az*t,y=iceTop(x,z),d=Math.min(r.w*3,8)*(w/(r.w*.5+1e-6));
       P.push(x+ox*w,y+.05,z+oz*w, x,y-d,z, x-ox*w,y+.05,z-oz*w);
       if(k){const b=n+(k-1)*3,c=n+k*3;I.push(b,b+1,c,c,b+1,c+1, b+1,b+2,c+1,c+1,b+2,c+2);}}n+=(K+1)*3;});
     const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setIndex(I);g.computeVertexNormals();
     const m=new THREE.Mesh(g,crevMat);m.userData.inspectLabel='Crevasses';scene.add(m);return m;}
    // the steam
    const SU={uT:{value:0},uScale:{value:innerHeight*.5},uCol:{value:new THREE.Color(0xf2f4f6)}};
    const steamMat=new THREE.ShaderMaterial({transparent:true,depthWrite:false,fog:true,uniforms:THREE.UniformsUtils.merge([THREE.UniformsLib.fog,SU]),
     vertexShader:['#include <fog_pars_vertex>','attribute vec4 aS;uniform float uT,uScale;varying float vA;',
      'void main(){float ph=fract(uT*aS.y+aS.x);vec3 p=position+vec3(sin(ph*6.0+aS.x*9.0)*aS.z*0.4+ph*aS.z*2.5,ph*aS.w,cos(ph*5.0+aS.x*7.0)*aS.z*0.4+ph*aS.z*1.2);',
      ' vec4 mvPosition=modelViewMatrix*vec4(p,1.0);gl_Position=projectionMatrix*mvPosition;gl_PointSize=uScale*aS.z*(0.6+ph*2.2)/max(1.0,-mvPosition.z);',
      ' vA=smoothstep(0.0,0.12,ph)*(1.0-ph)*0.5;','#include <fog_vertex>','}'].join('\n'),
     fragmentShader:['#include <fog_pars_fragment>','uniform vec3 uCol;varying float vA;',
      'void main(){vec2 q=gl_PointCoord-0.5;float r=length(q);if(r>0.5)discard;gl_FragColor=vec4(uCol,vA*smoothstep(0.5,0.1,r));','#include <fog_fragment>','}'].join('\n')});
    steamMat.uniforms.fogColor.value=scene.fog.color;steamMat.uniforms.fogDensity.value=scene.fog.density;
    ['uT','uScale','uCol'].forEach(k=>steamMat.uniforms[k]=SU[k]);
    function steam(src,seed){reseed(seed==null?8650:seed);const P=[],A=[];
     src.forEach(s=>{for(let i=0;i<s.n;i++){P.push(s.x+rr(-1.2,1.2),s.y,s.z+rr(-1.2,1.2));A.push(rng(),s.rate*rr(.8,1.2),s.size*rr(.7,1.3),s.rise*rr(.7,1.3));}});
     const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setAttribute('aS',new THREE.Float32BufferAttribute(A,4));
     const pts=new THREE.Points(g,steamMat);pts.frustumCulled=false;pts.userData.probeSkip=true;pts.renderOrder=2;scene.add(pts);return pts;}
    let steamOn=false;
    function bindClock(){if(steamOn)return;steamOn=true;
     E.ticks.push(dt=>{SU.uT.value+=dt;SU.uScale.value=innerHeight*E.renderer.getPixelRatio()/(2*Math.tan(E.camera.fov*Math.PI/360));});
     E.onLight.push(m=>{const n=m==='night';SU.uCol.value.setHex(n?0x40444c:0xf2f4f6);inner.uniforms.uNight.value=n?1:0;});}
    return{defSerac,defTower,putSerac,cave,arch:archAt,crevasses,steam,bindClock,mats:{out,arch,inner,steam:steamMat},C3};};
})(typeof window!=='undefined'?window:globalThis);
