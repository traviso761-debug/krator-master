// ---------- the volcanoes: what the elevation cannot show of Fuego, Acatenango and Agua ----------
// The three cones are in the ground already (the AWS elevation carries them to within a few metres of their
// summits). This adds what they do and what stands on them:
//
//   Fuego       never quiet: a thin plume off the crater all day, leaning with the trade wind; every few minutes an
//               explosion, a grey-brown column a kilometre high and, after dark, incandescent blocks rolling down the
//               cone; the lava glow in the head of the barranca it fills (found by walking downhill from the crater
//               along C.volcanoes.fuego.flow, so it lies in the real gully). api.ctx.fuegoBlast(strength) fires one now.
//   Acatenango  the twin summit's cross, and the climbers' camp lights at about 3600 m on the side facing Fuego,
//               where everyone sleeps to watch it
//   Agua        the crater's rim and the cross and antennas on it
//
// Everything is sized to be read from the valley, ten to fifteen kilometres off; none of it is in the layout fingerprint.
export function volcanoes(api){
  const {THREE,C,scene,P,groundH,animHooks,nightF}=api;const K=C.volcanoes;if(!K)return;
  const hourNow=()=>api.hour?api.hour():12;
  const tag=o=>{o.traverse(q=>{q.userData.noFingerprint=true;q.userData.noWire=true;});return o;};
  let seed=1717;const R=()=>{seed=(seed*16807)%2147483647;return seed/2147483647;};
  const [wx,wz]=(()=>{const b=(K.windFrom==null?60:K.windFrom)*Math.PI/180;return [-Math.sin(b),Math.cos(b)];})();   // the wind blows from this bearing: the plume leans away
  const out={};

  // ---- particles: one pool of soft billboards for ash, one additive for fire ----
  function softTex(){const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d'),gr=g.createRadialGradient(32,32,2,32,32,31);
    gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(0.5,'rgba(255,255,255,0.55)');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.fillRect(0,0,64,64);return new THREE.CanvasTexture(c);}
  const TEX=softTex();
  function pool(MAXP,size,blend,opacity){const pos=new Float32Array(MAXP*3),col=new Float32Array(MAXP*3),v=new Float32Array(MAXP*3),life=new Float32Array(MAXP),age=new Float32Array(MAXP),grav=new Float32Array(MAXP),grow=new Float32Array(MAXP),sz=new Float32Array(MAXP);
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('color',new THREE.BufferAttribute(col,3));g.setAttribute('size_',new THREE.BufferAttribute(sz,1));
    // per-particle size in world metres (PointsMaterial has one size for all, so the shader reads size_ instead):
    // a column puff grows from 60 m to several hundred
    const m=new THREE.PointsMaterial({size,map:TEX,vertexColors:true,transparent:true,opacity,depthWrite:false,blending:blend,sizeAttenuation:true});
    m.onBeforeCompile=sh=>{sh.vertexShader=sh.vertexShader.replace('uniform float size;','uniform float size;\nattribute float size_;').replace('gl_PointSize = size;','gl_PointSize = size_;');};
    const pts=new THREE.Points(g,m);pts.frustumCulled=false;tag(pts);scene.add(pts);
    for(let i=0;i<MAXP;i++)pos[i*3+1]=-9999;let next=0,last=performance.now();
    animHooks.push(now=>{const dt=Math.min(0.1,(now-last)/1000);last=now;let any=false;
      for(let i=0;i<MAXP;i++){if(life[i]<=0)continue;any=true;age[i]+=dt;if(age[i]>=life[i]){life[i]=0;pos[i*3+1]=-9999;continue;}
        if(grav[i]>0)v[i*3+1]-=grav[i]*dt;else{const k=1-0.18*dt;v[i*3+1]*=k;v[i*3]=v[i*3]*k+wx*0.18*dt*12;v[i*3+2]=v[i*3+2]*k+wz*0.18*dt*12;}   // fire falls; ash loses its lift and goes with the wind
        pos[i*3]+=v[i*3]*dt;pos[i*3+1]+=v[i*3+1]*dt;pos[i*3+2]+=v[i*3+2]*dt;
        if(grav[i]>0){const gy=groundH(pos[i*3],pos[i*3+2]);if(pos[i*3+1]<gy+2){pos[i*3+1]=gy+2;v[i*3+1]=Math.abs(v[i*3+1])*0.25;v[i*3]*=0.7;v[i*3+2]*=0.7;}}   // a block bounces and rolls
        sz[i]+=grow[i]*dt;}
      if(any){g.attributes.position.needsUpdate=true;g.attributes.size_.needsUpdate=true;g.attributes.color.needsUpdate=true;}});
    return {m,emit(x,y,z,vx,vy,vz,c,l,gr,s0,gw){const i=next;next=(next+1)%MAXP;pos[i*3]=x;pos[i*3+1]=y;pos[i*3+2]=z;v[i*3]=vx;v[i*3+1]=vy;v[i*3+2]=vz;
      col[i*3]=c.r;col[i*3+1]=c.g;col[i*3+2]=c.b;life[i]=l;age[i]=0;grav[i]=gr;sz[i]=s0;grow[i]=gw;}};}
  const ash=pool(2600,1,THREE.NormalBlending,0.72),fire=pool(1800,1,THREE.AdditiveBlending,1);

  // ================================================================ Fuego
  if(K.fuego){const F=K.fuego,[fx,fz]=P(F.at),top=groundH(fx,fz),cr=F.crater||90;out.fuego={x:fx,z:fz,y:top};
    // the crater's glow (the cone and its crater are in the ground: a ring of scoria on top read as a lid)
    const glowM=new THREE.SpriteMaterial({map:TEX,color:0xff6a1a,transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending});
    const glow=new THREE.Sprite(glowM);glow.position.set(fx,top+30,fz);glow.scale.setScalar(cr*6);tag(glow);scene.add(glow);
    const lamp=new THREE.PointLight(0xff5a14,0,3000,1.2);lamp.position.set(fx,top+80,fz);scene.add(lamp);
    // the lava in the barranca: from the crater downhill, a step at a time, held to the general heading F.flow
    // (bearing, degrees) so it takes the gully on that side rather than the first dip it meets
    {const b=(F.flow==null?200:F.flow)*Math.PI/180,hx=Math.sin(b),hz=-Math.cos(b),pts=[];let x=fx+hx*cr,z=fz+hz*cr,dx=hx,dz=hz;
      for(let s=0;s<(F.flowLen||1600)/20;s++){pts.push(new THREE.Vector3(x,groundH(x,z)+3,z));let best=null;
        for(let a=-0.9;a<=0.9;a+=0.15){const c=Math.cos(a),sn=Math.sin(a),ux=dx*c-dz*sn,uz=dx*sn+dz*c,h=groundH(x+ux*20,z+uz*20)-(ux*hx+uz*hz)*4;if(!best||h<best[0])best=[h,ux,uz];}
        dx=best[1]*0.6+hx*0.4;dz=best[2]*0.6+hz*0.4;const l=Math.hypot(dx,dz);dx/=l;dz/=l;x+=dx*20;z+=dz*20;}
      const lavaM=new THREE.MeshBasicMaterial({color:0xff5010,transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending});
      const tube=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),pts.length*2,9,5,false),lavaM);tag(tube);scene.add(tube);out.fuego.lava=lavaM;out.fuego.flowEnd=pts[pts.length-1];}
    // the daily plume: a puff every few seconds, rising a few hundred metres and drifting off with the wind
    const PLUME=new THREE.Color(F.plumeColour||'#b8b0a6'),BLAST=new THREE.Color(F.ashColour||'#6e655c'),FIRE=new THREE.Color(0xff7a20),EMBER=new THREE.Color(0xffc060);
    let tPuff=0,tNext=performance.now()+(F.firstBlast||40)*1000,last=performance.now(),surge=0;
    function blast(k=1){surge=Math.max(surge,k);const n=Math.round(90*k);
      for(let i=0;i<n;i++){const up=60+R()*90*k,sp=R()*14;const a=R()*Math.PI*2;
        ash.emit(fx+(R()-0.5)*cr,top+10,fz+(R()-0.5)*cr,Math.cos(a)*sp+wx*6,up*(0.4+R()*0.6),Math.sin(a)*sp+wz*6,BLAST,40+R()*50*k,0,60+R()*60,9+R()*8);}
      const night=nightF(hourNow());if(night>0.05)for(let i=0;i<Math.round(260*k);i++){const a=R()*Math.PI*2,sp=20+R()*55*k;
        fire.emit(fx+(R()-0.5)*cr*0.6,top+15,fz+(R()-0.5)*cr*0.6,Math.cos(a)*sp,40+R()*90*k,Math.sin(a)*sp,R()<0.3?EMBER:FIRE,6+R()*10,9.8,10+R()*12,-0.6);}}
    out.fuego.blast=blast;api.ctx.fuegoBlast=blast;
    animHooks.push(now=>{const dt=Math.min(0.1,(now-last)/1000);last=now;const n=nightF(hourNow());
      tPuff+=dt;if(tPuff>0.6){tPuff=0;const c=PLUME;ash.emit(fx+(R()-0.5)*cr*0.8,top+8,fz+(R()-0.5)*cr*0.8,wx*8+(R()-0.5)*3,9+R()*6,wz*8+(R()-0.5)*3,c,90+R()*60,0,90+R()*50,7+R()*5);}
      if(now>tNext){tNext=now+((F.every||[150,420])[0]+R()*((F.every||[150,420])[1]-(F.every||[150,420])[0]))*1000;blast(0.5+R()*0.7);}
      surge=Math.max(0,surge-dt*0.12);
      glowM.opacity=n*(0.35+0.5*surge+0.08*Math.sin(now*0.003));lamp.intensity=n*(0.6+2.5*surge);
      if(out.fuego.lava)out.fuego.lava.opacity=n*(0.55+0.2*Math.sin(now*0.0011));});}

  // ================================================================ Acatenango
  if(K.acatenango){const A=K.acatenango,[ax,az]=P(A.at),y=groundH(ax,az);out.acatenango={x:ax,z:az,y};
    const wood=new THREE.MeshLambertMaterial({color:0x5a4634});
    const cross=new THREE.Group();cross.add(new THREE.Mesh(new THREE.BoxGeometry(0.5,6,0.5).translate(0,3,0),wood));cross.add(new THREE.Mesh(new THREE.BoxGeometry(3,0.45,0.45).translate(0,4.4,0),wood));
    cross.position.set(ax,y,az);tag(cross);scene.add(cross);
    // the camp: tents on the shoulder facing Fuego, their lanterns lit after dark
    if(A.camp){const [cx,cz]=P(A.camp),tents=new THREE.Group(),lights=[],TC=[0xd85a2a,0x2a6ad8,0xe8c02a,0x3a8a4a,0xd8d8d0];
      for(let i=0;i<(A.tents||22);i++){const tx=cx+(R()-0.5)*90,tz=cz+(R()-0.5)*60,ty=groundH(tx,tz);
        const t=new THREE.Mesh(new THREE.ConeGeometry(1.8,1.6,4).translate(0,0.8,0),new THREE.MeshLambertMaterial({color:TC[i%TC.length]}));t.position.set(tx,ty,tz);t.rotation.y=R()*3;tents.add(t);
        const l=new THREE.Sprite(new THREE.SpriteMaterial({map:TEX,color:0xffc070,transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending}));l.position.set(tx,ty+1.2,tz);l.scale.setScalar(9);tents.add(l);lights.push(l);}
      tag(tents);scene.add(tents);animHooks.push(()=>{const n=nightF(hourNow());for(const l of lights)l.material.opacity=n*0.9;});}}

  // ================================================================ Agua
  if(K.agua){const G=K.agua,[gx,gz]=P(G.at),y=groundH(gx,gz);out.agua={x:gx,z:gz,y};
    const grey=new THREE.MeshLambertMaterial({color:0x8a8e92}),white=new THREE.MeshLambertMaterial({color:0xe8e6e0}),red=new THREE.MeshLambertMaterial({color:0xb02a24});
    const g=new THREE.Group();
    for(const [ox,oz,h] of G.antennas||[[40,-60,28],[70,-30,18],[-20,-80,22]]){const ty=groundH(gx+ox,gz+oz);
      const at=(m,x,y,z)=>{m.position.set(x,y,z);g.add(m);};
      for(let s=0;s<h;s+=4)at(new THREE.Mesh(new THREE.BoxGeometry(1.2,4,1.2).translate(0,2,0),(s/4)%2?red:white),gx+ox,ty+s,gz+oz);   // a mast in red and white
      at(new THREE.Mesh(new THREE.BoxGeometry(4,3,3).translate(0,1.5,0),grey),gx+ox+4,ty,gz+oz+3);}                                        // its hut
    {const ty=groundH(gx,gz);const c=new THREE.Group();c.add(new THREE.Mesh(new THREE.BoxGeometry(0.6,7,0.6).translate(0,3.5,0),white));c.add(new THREE.Mesh(new THREE.BoxGeometry(3.6,0.5,0.5).translate(0,5.2,0),white));c.position.set(gx,ty,gz);g.add(c);}
    tag(g);scene.add(g);}

  api.ctx.volcanoes=out;
  api.ctx.details=Object.assign(api.ctx.details||{},{volcanoes:Object.keys(out).length});
}
