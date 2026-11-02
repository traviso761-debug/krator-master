  // ---- volcanic vents: lava floor, glow, smoke (main + secondaries) ----
  const VENTS=(DATA.vents&&DATA.vents.length)?DATA.vents:[{px:DATA.volc.px,floor:DATA.volc.floor,scale:1.0,radius:9.0}];
  const reduceMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
  function makeVent(v){
    const vx=v.px[0]/(OW-1)*Wkm-Wkm/2, vzz=v.px[1]/(OH-1)*Hkm-Hkm/2, vFloor=v.floor/1000;
    const sc=v.scale||1.0, rad=v.radius||9.0, gey=v.kind==='geyser';
    const lc=document.createElement('canvas'); lc.width=lc.height=256; const lg=lc.getContext('2d');
    const grd=lg.createRadialGradient(128,128,0,128,128,128); if(gey){ grd.addColorStop(0,'#f4fbff'); grd.addColorStop(0.45,'#bfe6ea'); grd.addColorStop(0.8,'#d9c9a0'); grd.addColorStop(1,'rgba(220,210,180,0)'); } else { grd.addColorStop(0,'#fff1a0'); grd.addColorStop(0.35,'#ff7a1a'); grd.addColorStop(0.8,'#6b1a08'); grd.addColorStop(1,'rgba(40,10,5,0)'); }
    lg.fillStyle=grd; lg.fillRect(0,0,256,256);
    lg.globalCompositeOperation='multiply'; for(let i=0;i<(gey?0:40);i++){ lg.strokeStyle='rgba(30,10,5,.55)'; lg.lineWidth=1+Math.random()*3; lg.beginPath(); const a=Math.random()*6.28, r0=Math.random()*90; lg.moveTo(128+Math.cos(a)*r0,128+Math.sin(a)*r0); lg.lineTo(128+Math.cos(a+1)*r0*1.2,128+Math.sin(a+1)*r0*1.2); lg.stroke(); }
    const lava=new THREE.Mesh(new THREE.CircleGeometry(rad,40), new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(lc),transparent:true,depthWrite:false}));
    lava.rotation.x=-Math.PI/2; scene.add(lava);
    const glow=new THREE.PointLight(0xff6a1a,gey?0:2.5*sc,120*sc,1.6); scene.add(glow);
    // smoke: a particle column drifting with the NW wind
    const N=Math.max(160,Math.round(700*sc)), sPos=new Float32Array(N*3), sAge=new Float32Array(N), sSeed=new Float32Array(N);
    for(let i=0;i<N;i++){ sAge[i]=Math.random(); sSeed[i]=Math.random(); }
    const sGeo=new THREE.BufferGeometry(); sGeo.setAttribute('position',new THREE.BufferAttribute(sPos,3)); sGeo.setAttribute('aAge',new THREE.BufferAttribute(sAge,1)); sGeo.setAttribute('aSeed',new THREE.BufferAttribute(sSeed,1));
    const sMat=new THREE.ShaderMaterial({transparent:true,depthWrite:false,uniforms:{uScale:{value:1},uSteam:{value:gey?1:0}},
      vertexShader:`attribute float aAge; attribute float aSeed; varying float vAge; uniform float uScale;
        void main(){ vAge=aAge; vec4 mv=modelViewMatrix*vec4(position,1.0); gl_PointSize=(12.0+110.0*aAge)*uScale*300.0/max(1.0,-mv.z); gl_Position=projectionMatrix*mv; }`,
      fragmentShader:`varying float vAge; uniform float uSteam; void main(){ vec2 d=gl_PointCoord-0.5; float r=length(d)*2.0; if(r>1.0) discard; float a=(1.0-r*r)*(1.0-vAge)*mix(0.16,0.34,uSteam); vec3 c=mix(mix(vec3(0.95,0.55,0.3),vec3(0.55,0.55,0.58),min(1.0,vAge*4.0)),vec3(0.97,0.98,1.0),uSteam); gl_FragColor=vec4(c,a); }`});
    const smoke=new THREE.Points(sGeo,sMat); scene.add(smoke);
    function place(){ lava.position.set(vx,vFloor*vex+0.05*vex,vzz); glow.position.set(vx,vFloor*vex+6*vex,vzz); sMat.uniforms.uScale.value=Math.sqrt(vex/5)*sc; }
    function step(dt){
      const rise=vex*1.0;
      for(let i=0;i<N;i++){
        if(!reduceMotion) sAge[i]+=dt*(0.045+0.03*sSeed[i]); if(sAge[i]>1){ sAge[i]-=1; }
        const a=sAge[i], sw=sSeed[i]*6.283;
        const spread=(gey?(1+a*a*16):(3+a*a*55))*sc, drift=a*a*(gey?35:110)*sc;   // NW wind: plume leans to the SE (+x, +z); geysers: a tight steam column
        sPos[i*3]=vx+Math.cos(sw+a*3)*spread*(0.6+sSeed[i])+drift*0.7;
        sPos[i*3+1]=vFloor*vex+2*vex+a*70*rise*sc*(gey?2.6*(0.8+0.4*Math.abs(Math.sin(sSeed[i]*40.0))):(0.7+0.3*sSeed[i]));
        sPos[i*3+2]=vzz+Math.sin(sw+a*3)*spread*(0.6+sSeed[i])+drift*0.7;
      }
      sGeo.attributes.position.needsUpdate=true; sGeo.attributes.aAge.needsUpdate=true;
    }
    return {place:place,step:step,glow:glow,scale:sc,lit:gey?0:1};
  }
  const vents=VENTS.map(makeVent);
  function placeVolcano(){ vents.forEach(v=>v.place()); }
  function stepSmoke(dt){ vents.forEach(v=>v.step(dt)); }
  let vex=5;
  stepSmoke(0);
  function applyVex(){
    for(let i=0;i<pos.count;i++) pos.setY(i, base[i]*vex);
    pos.needsUpdate=true; geo.computeVertexNormals();
    for(let j=0;j<MH;j++) for(let i=0;i<MW;i++){
      const sx=Math.min(VW-1,i*MSTRIDE), sy=Math.min(VH-1,j*MSTRIDE), sidx=sy*VW+sx, vidx=j*MW+i;
      wpos.setY(vidx, whas[sidx] ? wlev[sidx]/1000*vex+0.02*vex : base[vidx]*vex-0.4*vex);
    }
    wpos.needsUpdate=true; wgeo.computeVertexNormals();
    placeVolcano();
    if(handles.children.length) placeHandles();
    if(window.__settReady) drawSettlements();
  }
  applyVex();

