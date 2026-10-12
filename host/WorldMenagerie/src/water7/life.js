// ---------- Water 7's water and what moves on it ----------
// The canals (the generator's centrelines, api.OSM.water7.canals): the water in each ring canal at its tier's
// height, the grand canals stepping down the city and falling from each tier to the next, the bridges where the
// steps cross the ring canals. The yagara bulls - the fish-horses the city gets about by, each towing its boat - on
// the ring canals and round the island. The Puffing Tom, the paddle-wheeled sea train, out along its track from Blue
// Station and back (api.SEATRAIN, for the events).
export function life(api){
  const {THREE,C,scene,animHooks,OSM,camera,nightF,hour}=api;const W7=OSM.water7;if(!W7)return;
  const water=new THREE.MeshPhongMaterial({polygonOffset:true,polygonOffsetFactor:-8,polygonOffsetUnits:-16,color:0x1d6a8e,emissive:0x03141e,transparent:true,opacity:0.94,shininess:60,specular:0x6a8ea0,side:THREE.DoubleSide});   // the sea's own blue
  // the canals' ripple: the surface normal tipped by a few travelling waves of the world position, so the light moves on
  // the water (as the landmark kit's fountain water does); no texture
  {const U={value:0};water.onBeforeCompile=sh=>{sh.uniforms.uT=U;
    sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vWp;').replace('#include <worldpos_vertex>','#include <worldpos_vertex>\nvWp=(modelMatrix*vec4(transformed,1.0)).xyz;');
    sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 vWp;uniform float uT;')
      .replace('#include <normal_fragment_maps>','#include <normal_fragment_maps>\n{vec2 p=vWp.xz;float a=sin(p.x*0.9+uT*1.6)+sin(p.y*1.3-uT*1.2)+0.6*sin((p.x+p.y)*2.3+uT*2.6),b=cos(p.y*1.1+uT*1.4)+cos(p.x*1.7-uT*1.0)+0.6*cos((p.x-p.y)*2.1-uT*2.2);normal=normalize(normal+vec3(a,0.0,b)*0.05);}');};
    animHooks.push(now=>{U.value=now/1000;});}
  const foam=new THREE.MeshLambertMaterial({color:0xf4fbff,transparent:true,opacity:0.85});
  const stone=new THREE.MeshLambertMaterial({color:0xe8dcc4});
  // Back Street (OSM.water7.backstreet, degrees) is sunk to below the sea: what belongs to the tiers there - tier one's
  // wall and ring canal, the stairs - is left out of its arc, and its edges are walled
  const BSa=(W7.backstreet||[196,238]).map(d=>d*Math.PI/180),norm=a=>(a%(2*Math.PI)+2*Math.PI)%(2*Math.PI),inBS=a=>{const n=norm(a);return n>BSa[0]&&n<BSa[1];};
  const OUT=[BSa[1],BSa[0]+2*Math.PI];   // the arc that is not Back Street
  const ringArc=(r0,r1,seg)=>new THREE.RingGeometry(r0,r1,seg,1,-OUT[1],OUT[1]-OUT[0]).rotateX(-Math.PI/2);
  const cylArc=(r,h,seg)=>new THREE.CylinderGeometry(r,r,h,seg,1,true,Math.PI/2-OUT[1],OUT[1]-OUT[0]);
  const add=(g,m)=>{const me=new THREE.Mesh(g,m);me.receiveShadow=true;me.userData.noFingerprint=true;scene.add(me);return me;};
  // ---- the ring canals ----
  // The terrain's cut for a canal is 28 m wide and stepped at ten metres, so the water fills all of it and stone walls
  // line it: from the water up to the promenade, a coping along the top, and every so often steps down to a landing.
  const canalWallM=new THREE.MeshLambertMaterial({color:0xd8ccb0,side:THREE.DoubleSide}),HW=13.6;
  for(const c of W7.canals){if(c.kind!=='ring')continue;const cut=c.tier===1,g=cut?ringArc(c.r-HW,c.r+HW,240):new THREE.RingGeometry(c.r-HW,c.r+HW,240,1).rotateX(-Math.PI/2);add(g,water).position.y=c.h+0.22;   // brim-full, just over the paving
    for(const s of [-1,1]){const w=add(cut?cylArc(c.r+s*HW,3.6,240):new THREE.CylinderGeometry(c.r+s*HW,c.r+s*HW,3.6,240,1,true),canalWallM);w.position.y=c.h-1.4;
      const k=cut?ringArc(s<0?c.r-HW-2.4:c.r+HW-0.5,s<0?c.r-HW+0.5:c.r+HW+2.4,240):new THREE.RingGeometry(s<0?c.r-HW-2.4:c.r+HW-0.5,s<0?c.r-HW+0.5:c.r+HW+2.4,240,1).rotateX(-Math.PI/2);add(k,stone).position.y=c.h+0.42;}}   // a wide coping over the bank
  // ---- the tier walls: masonry from each tier down to the one below, a parapet along the top ----
  // the walls are the old city: the houses of the tiers below, buried as the next was built on them, their arched
  // windows and doors in rows in the masonry, a balcony here and there, the stains where the water has run
  const wallTex=(()=>{const c=document.createElement('canvas');c.width=512;c.height=512;const g=c.getContext('2d');let sd=3;const r=()=>{sd=(sd*16807)%2147483647;return sd/2147483647;};
    g.fillStyle='#e2d4b8';g.fillRect(0,0,512,512);for(let y=0;y<512;y+=16)for(let x=(y/16)%2?-24:0;x<512;x+=48){g.fillStyle=`rgba(${r()<0.5?255:90},${r()<0.5?240:80},${r()<0.5?220:60},${r()*0.08})`;g.fillRect(x+1,y+1,46,14);g.strokeStyle='rgba(120,100,70,0.25)';g.strokeRect(x+0.5,y+0.5,47,15);}
    for(let row=0;row<4;row++){const y=40+row*120;for(let x=18;x<512;x+=64){if(r()<0.18)continue;const door=row===3&&r()<0.4,wh=door?70:44,ww=door?30:22;
      g.fillStyle='#f4ecdc';g.beginPath();g.moveTo(x-3,y+wh+3);g.lineTo(x-3,y+ww/2);g.arc(x+ww/2,y+ww/2,ww/2+3,Math.PI,0);g.lineTo(x+ww+3,y+wh+3);g.closePath();g.fill();
      g.fillStyle=r()<0.15?'#c8a060':'#2e3842';g.beginPath();g.moveTo(x,y+wh);g.lineTo(x,y+ww/2);g.arc(x+ww/2,y+ww/2,ww/2,Math.PI,0);g.lineTo(x+ww,y+wh);g.closePath();g.fill();
      if(!door&&r()<0.2){g.fillStyle='#5a4a3a';g.fillRect(x-8,y+wh+2,ww+16,4);for(let b=0;b<6;b++)g.fillRect(x-7+b*(ww+14)/5,y+wh-8,2,10);}
      if(r()<0.3){const sc=['#3a6a5a','#3a5a8a','#8a4a3a'][Math.floor(r()*3)];g.fillStyle=sc;g.fillRect(x-10,y+ww/2,8,wh-ww/2);g.fillRect(x+ww+2,y+ww/2,8,wh-ww/2);}}
      g.fillStyle='rgba(150,130,100,0.6)';g.fillRect(0,y+112,512,5);}
    for(let i=0;i<30;i++){const x=r()*512,gr=g.createLinearGradient(0,0,0,512);gr.addColorStop(0,'rgba(90,100,90,0.18)');gr.addColorStop(1,'rgba(90,100,90,0)');g.fillStyle=gr;g.fillRect(x,0,3+r()*8,200+r()*312);}
    const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=4;return t;})();
  {const T=W7.tiers,capM=new THREE.MeshLambertMaterial({color:0xc8b898});
    for(let k=1;k<T.length;k++){const [ro,h]=T[k],lo=T[k-1][1],tx=wallTex.clone();tx.needsUpdate=true;tx.repeat.set(Math.round(ro*2*Math.PI/42),(h-lo+1)/32);
      // the wall stands fifteen metres out (a grid cell's diagonal) from the tier's edge, so the terrain grid's slope down the step stays behind it;
      // the gap on top is paved, a walk along the wall with its parapet
      const WR=ro+15,wallM=new THREE.MeshLambertMaterial({map:tx,side:THREE.DoubleSide}),w=add(k===1?cylArc(WR,h-lo+1,240):new THREE.CylinderGeometry(WR,WR,h-lo+1,240,1,true),wallM);w.position.y=(h+lo)/2-0.5;w.castShadow=true;
      add(k===1?ringArc(ro-6,WR+0.4,240):new THREE.RingGeometry(ro-6,WR+0.4,240,1).rotateX(-Math.PI/2),new THREE.MeshLambertMaterial({color:0xd4c8ac})).position.y=h+0.07;
      if(k===2){const bw=add(new THREE.CylinderGeometry(WR,WR,lo+1.6,40,1,true,Math.PI/2-BSa[1],BSa[1]-BSa[0]),wallM);bw.position.y=(lo-1.6)/2;}   // Back Street's side of tier two's wall, down to the water
      const cap=add(k===1?cylArc(WR+0.3,1.2,240):new THREE.CylinderGeometry(WR+0.3,WR+0.3,1.2,240,1,true),capM);cap.position.y=h+0.6;}
    for(const a of BSa)for(const [r0,r1,top] of [[T[2][0],T[1][0],T[1][1]],[T[1][0],T[0][0]+3,T[0][1]]]){const len=r1-r0,ew=add(new THREE.BoxGeometry(len,top+1.6,2),new THREE.MeshLambertMaterial({color:0xd8ccb0}));ew.position.set(Math.cos(a)*(r0+len/2),(top-1.6)/2,Math.sin(a)*(r0+len/2));ew.rotation.y=-a;}
    const qt=wallTex.clone();qt.needsUpdate=true;qt.repeat.set(Math.round(T[0][0]*2*Math.PI/42),0.4);const QR=T[0][0]+3.5,q=add(new THREE.CylinderGeometry(QR,QR,12.2,360,1,true),new THREE.MeshLambertMaterial({map:qt,side:THREE.DoubleSide}));q.position.y=-3.05;
    // the coping over the terrain's ten-metre step at the edge, and a kerb, so the coast is one clean line
    add(new THREE.RingGeometry(T[0][0]-14,QR+0.2,360,1).rotateX(-Math.PI/2),new THREE.MeshLambertMaterial({color:0xcfc2a4})).position.y=3.06;
    add(new THREE.CylinderGeometry(QR+0.2,QR+0.2,0.7,360,1,true),capM).position.y=3.4;}   // the quay's wall to the moat
  // ---- the grand canals: a strip along each level run, a fall at each step ----
  // the falls' streaks run along the flow (the planes' u, down the canal), and the offset carries them downstream
  const streak=(()=>{const c=document.createElement('canvas');c.width=256;c.height=64;const k=c.getContext('2d');k.fillStyle='#a8dcf0';k.fillRect(0,0,256,64);
    for(let i=0;i<240;i++){k.fillStyle=`rgba(255,255,255,${0.25+Math.random()*0.6})`;k.fillRect(Math.random()*256,Math.random()*64,10+Math.random()*50,1+Math.random()*2);}
    const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(3,2);return t;})();
  const fallM=new THREE.MeshPhongMaterial({map:streak,color:0xffffff,emissive:0x082838,transparent:true,opacity:0.88,shininess:80,specular:0xbfe8ff,side:THREE.DoubleSide,depthWrite:false});
  const falls=[];
  for(const c of W7.canals){if(c.kind!=='grand'&&c.kind!=='ramp')continue;const p=c.p;
    for(let i=0;i+1<p.length;i++){const [ax,az,ah]=p[i],[bx,bz,bh]=p[i+1],L=Math.hypot(bx-ax,bz-az),ry=-Math.atan2(bz-az,bx-ax),mx=(ax+bx)/2,mz=(az+bz)/2;
      if(Math.abs(ah-bh)<0.01){const m=add(new THREE.PlaneGeometry(L,2*HW).rotateX(-Math.PI/2),water);m.position.set(mx,ah+0.22,mz);m.rotation.y=ry;
        for(const s2 of [-1,1]){const w=add(new THREE.BoxGeometry(L,3.6,0.8),canalWallM);w.position.set(mx+Math.sin(-ry)*0+(-(bz-az)/L)*s2*(HW+0.4),ah-1.5,mz+((bx-ax)/L)*s2*(HW+0.4));w.rotation.y=ry;
          const k=add(new THREE.BoxGeometry(L,0.4,3.2),stone);k.position.set(w.position.x+(-(bz-az)/L)*s2*1.0,ah+0.42,w.position.z+((bx-ax)/L)*s2*1.0);k.rotation.y=ry;}}
      else if(c.kind==='ramp'){const lo=bh>0.7?bh+0.22:0.75,sl=add(new THREE.PlaneGeometry(Math.hypot(L,ah-bh),2*HW-2).rotateX(-Math.PI/2),fallM);sl.position.set(mx,(ah+0.22+lo)/2,mz);sl.rotation.set(0,ry,0,'YXZ');sl.rotateZ(-Math.atan2(ah-bh,L));}
      else{const drop=ah-bh,lo=bh>0.7?bh+0.22:0.75,sheet=add(new THREE.PlaneGeometry(Math.hypot(L,drop),2*HW-2).rotateX(-Math.PI/2),fallM);
        sheet.position.set(mx,(ah+0.22+lo)/2,mz);sheet.rotation.set(0,ry,0,'YXZ');sheet.rotateZ(-Math.atan2(drop,L));falls.push(sheet);
        const f=add(new THREE.BoxGeometry(5,1.2,2*HW),foam);f.position.set(bx-(bx-ax)/L*2,lo+0.3,bz-(bz-az)/L*2);f.rotation.y=ry;falls.push(f);}}}
  // the bridges where the steps cross the ring canals: an arched deck of stone and its parapets
  for(const c of W7.canals){if(c.kind!=='ring')continue;for(let k=0;k<8;k++){const a=k*Math.PI/4;if(c.tier===1&&inBS(a))continue;const x=Math.cos(a)*c.r,z=Math.sin(a)*c.r,g=new THREE.Group();
    g.add(new THREE.Mesh(new THREE.BoxGeometry(32,1.0,9),stone));const arch=new THREE.Mesh(new THREE.CylinderGeometry(13,13,9,20,1,false,0,Math.PI).rotateX(Math.PI/2),stone);arch.position.y=-11.6;arch.scale.set(1,0.3,1);g.add(arch);
    for(const s of [-1,1]){const p=new THREE.Mesh(new THREE.BoxGeometry(32,1.0,0.4),stone);p.position.set(0,1,s*4.3);g.add(p);}
    g.position.set(x,c.h+1.4,z);g.rotation.y=-a;g.traverse(o=>{o.castShadow=o.receiveShadow=true;o.userData.noFingerprint=true;});scene.add(g);}}
  animHooks.push(now=>{const t=now/1000;streak.offset.x=-t*1.6;for(const f of falls)if(f.material===foam)f.scale.set(1,1+0.3*Math.sin(t*6+f.position.x),1);const n=nightF(hour());water.emissive.setRGB(0.03+n*0.05,0.12+n*0.12,0.18+n*0.2);});

  // ---- the stairs: a flight down each tier wall where the Steps cross it, its balustrades either side ----
  {const T=W7.tiers,SA=(W7.streetAngles||[0,45,90,135,180,225,270,315]).map(d=>d*Math.PI/180),steps=[],rails=[];
    for(let k=1;k<T.length;k++){const [ro,h]=T[k],lo=T[k-1][1],drop=h-lo,run=drop*1.55,n=Math.ceil(drop/0.32),sw=8;
      for(const a of SA){if(k<=2&&inBS(a))continue;const ca=Math.cos(a),sa=Math.sin(a);
        for(let i=0;i<n;i++){const u=ro+15+run*(i+0.5)/n,yt=h-drop*(i+1)/n;steps.push([ca*u,yt,sa*u,a,run/n+0.02,Math.min(drop*(i+1)/n,3.2),sw]);}   // a flight three metres deep, sloping down the wall
        for(const sd of [-1,1]){const ox=-sa*sd*(sw/2+0.3),oz=ca*sd*(sw/2+0.3);rails.push([ca*(ro+15+run/2)+ox,(h+lo)/2+0.6,sa*(ro+15+run/2)+oz,a,Math.hypot(run,drop),Math.atan2(drop,run)]);}}}
    const sm=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),new THREE.MeshLambertMaterial({color:0xffffff}),steps.length),rm=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),new THREE.MeshLambertMaterial({color:0xece4d4}),rails.length),o=new THREE.Object3D();
    const c1=new THREE.Color('#e4d8be'),c2=new THREE.Color('#a8987c');   // treads light, risers in shadow: every other step darker so the flight reads as steps
    steps.forEach(([x,y,z,a,d,h,w],i)=>{o.position.set(x,y+h/2-0.32,z);o.rotation.set(0,-a,0);o.scale.set(d,h,w);o.updateMatrix();sm.setMatrixAt(i,o.matrix);sm.setColorAt(i,i%2?c1:c2);});
    rails.forEach(([x,y,z,a,l,pitch],i)=>{o.position.set(x,y,z);o.rotation.set(0,-a,-pitch,'YXZ');o.scale.set(l,1.1,0.45);o.updateMatrix();rm.setMatrixAt(i,o.matrix);});
    for(const m of [sm,rm]){m.castShadow=m.receiveShadow=true;m.userData.noFingerprint=true;scene.add(m);}}
  // ---- along the ring canals: the striped mooring poles, the lamps, a footbridge over each junction with a grand canal ----
  {const poles=[],lamps=[],PC=['#f4f2ec','#c8302a','#3a6aa8'];
    for(const c of W7.canals){if(c.kind!=='ring')continue;const n=Math.round(c.r*2*Math.PI/26);
      for(let i=0;i<n;i++){const a=i/n*Math.PI*2+0.02;if(c.tier===1&&inBS(a))continue;for(const sd of [-1,1]){if((i+(sd>0?1:0))%3===0)poles.push([Math.cos(a)*(c.r+sd*12),c.h,Math.sin(a)*(c.r+sd*12),PC[(i*7+(sd>0?1:2))%3]]);}
        if(i%2===0)for(const sd of [-1,1])lamps.push([Math.cos(a+0.01)*(c.r+sd*15.4),c.h+0.3,Math.sin(a+0.01)*(c.r+sd*15.4)]);}
      for(let k=0;k<8;k++){const a=(22.5+45*k)*Math.PI/180;if(c.tier===1&&inBS(a))continue;const x=Math.cos(a)*c.r,z=Math.sin(a)*c.r,g=new THREE.Group();
        g.add(new THREE.Mesh(new THREE.BoxGeometry(32,0.8,5),stone));const arch=new THREE.Mesh(new THREE.CylinderGeometry(13,13,5,20,1,false,0,Math.PI).rotateX(Math.PI/2),stone);arch.position.y=-11.6;arch.scale.set(1,0.3,1);g.add(arch);
        for(const s of [-1,1]){const pp=new THREE.Mesh(new THREE.BoxGeometry(32,0.9,0.35),stone);pp.position.set(0,0.85,s*2.3);g.add(pp);}
        g.position.set(x,c.h+1.6,z);g.rotation.y=-a;g.traverse(o=>{o.castShadow=o.receiveShadow=true;o.userData.noFingerprint=true;});scene.add(g);}}
    {const boats=poles.filter((_,i)=>i%2===0),bm=new THREE.InstancedMesh(new THREE.BoxGeometry(7,0.7,1.6),new THREE.MeshLambertMaterial({color:0x5a3a24}),boats.length),bo=new THREE.Object3D();
      boats.forEach(([x,y,z],i)=>{const a=Math.atan2(z,x),r=Math.hypot(x,z),rr=r+(r%2>1?-1.8:1.8);bo.position.set(Math.cos(a+0.012)*r,y+0.5,Math.sin(a+0.012)*r);bo.rotation.set(0,-a-Math.PI/2,0);bo.updateMatrix();bm.setMatrixAt(i,bo.matrix);});
      bm.castShadow=true;bm.userData.noFingerprint=true;scene.add(bm);}
    const pm=new THREE.InstancedMesh(new THREE.CylinderGeometry(0.16,0.2,4.2,6).translate(0,0.6,0),new THREE.MeshLambertMaterial({color:0xffffff}),poles.length),o=new THREE.Object3D(),cc=new THREE.Color();
    poles.forEach(([x,y,z,c2],i)=>{o.position.set(x,y-1.8,z);o.rotation.set(0,0,0);o.scale.set(1,1,1);o.updateMatrix();pm.setMatrixAt(i,o.matrix);pm.setColorAt(i,cc.set(c2));});
    const lampM=new THREE.MeshLambertMaterial({color:0xfff0c0,emissive:0x000000}),lp=new THREE.InstancedMesh(new THREE.CylinderGeometry(0.08,0.11,3.6,6).translate(0,1.8,0),new THREE.MeshLambertMaterial({color:0x2a2e32}),lamps.length),lh=new THREE.InstancedMesh(new THREE.BoxGeometry(0.5,0.6,0.5),lampM,lamps.length);
    lamps.forEach(([x,y,z],i)=>{o.position.set(x,y,z);o.updateMatrix();lp.setMatrixAt(i,o.matrix);o.position.y=y+3.9;o.updateMatrix();lh.setMatrixAt(i,o.matrix);});
    for(const m of [pm,lp,lh]){m.castShadow=true;m.userData.noFingerprint=true;scene.add(m);}
    animHooks.push(()=>{const n=nightF(hour());lampM.emissive.setRGB(n,0.85*n,0.5*n);});}
  // ---- the Aqua Elevator: a lock up the Lower Town's wall beside the grand canal, a boat raised in it and let down ----
  const ELEV=(()=>{const T=W7.tiers,a=(67.5-7)*Math.PI/180,ro=T[1][0],lo=T[0][1],hi=T[1][1],ca=Math.cos(a),sa=Math.sin(a),g=new THREE.Group();
    const wall=new THREE.MeshLambertMaterial({color:0xe8dcc4}),dark=new THREE.MeshLambertMaterial({color:0x2a3038}),gl=new THREE.MeshPhongMaterial({color:0x9ad0e8,transparent:true,opacity:0.35,shininess:90});
    const H=hi-lo+8;for(const sd of [-1,1]){const m=new THREE.Mesh(new THREE.BoxGeometry(26,H,3),wall);m.position.set(0,H/2,sd*9);g.add(m);}
    {const back=new THREE.Mesh(new THREE.BoxGeometry(3,H,21),wall);back.position.set(-12,H/2,0);g.add(back);const front=new THREE.Mesh(new THREE.BoxGeometry(0.4,H-6,15),gl);front.position.set(12.5,H/2+2,0);g.add(front);}
    const roof=new THREE.Mesh(new THREE.ConeGeometry(19,7,4).rotateY(Math.PI/4),new THREE.MeshLambertMaterial({color:0xc8503a}));roof.position.y=H+3.5;roof.scale.set(0.75,1,0.62);g.add(roof);
    const sign=new THREE.Mesh(new THREE.BoxGeometry(0.3,2.4,12),new THREE.MeshLambertMaterial({color:0x3a6aa8}));sign.position.set(12.8,H-3,0);g.add(sign);
    const gate=new THREE.Mesh(new THREE.BoxGeometry(0.8,6,15),dark);gate.position.set(12.6,3,0);g.add(gate);
    const wat=new THREE.Mesh(new THREE.BoxGeometry(22,1,15),new THREE.MeshPhongMaterial({color:0x3aa6d8,transparent:true,opacity:0.8,shininess:90}));g.add(wat);
    const boat=new THREE.Group();g.add(boat);   // its yagara and boat, once they are built (below)
    g.position.set(ca*(ro+24),lo,sa*(ro+24));g.rotation.y=-a;g.traverse(o=>{o.castShadow=o.receiveShadow=true;o.userData.noFingerprint=true;});scene.add(g);
    return {g,wat,boat,lo,hi};})();
  // ---- a body built of parts, coloured by vertex ----
  function body(parts){const pos=[],nor=[],col=[];for(const [g0,c,x,y,z,rx=0,ry=0,rz=0] of parts){const g=(g0.index?g0.toNonIndexed():g0.clone());g.rotateX(rx);g.rotateY(ry);g.rotateZ(rz);g.translate(x,y,z);const p=g.attributes.position,n=g.attributes.normal,cc=new THREE.Color(c);
      for(let i=0;i<p.count;i++){pos.push(p.getX(i),p.getY(i),p.getZ(i));nor.push(n.getX(i),n.getY(i),n.getZ(i));col.push(cc.r,cc.g,cc.b);}}
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(nor,3));g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));return g;}
  const B=(w,h,d)=>new THREE.BoxGeometry(w,h,d),S=(r,sx=1,sy=1,sz=1)=>new THREE.SphereGeometry(r,10,8).scale(sx,sy,sz),Cn=(r,h)=>new THREE.ConeGeometry(r,h,8);
  // the yagara bull: a fat blue-green fish-horse, its frill and fins, towing a little boat with a passenger; along +x
  const YAGARA=body([[S(1,2.2,1.1,1.0),'#5ab8c0',3.2,0.6,0],[S(0.8,1.1,1,0.9),'#5ab8c0',5.4,1.4,0],[S(0.25),'#f4f4f4',6.1,1.8,0.45],[S(0.25),'#f4f4f4',6.1,1.8,-0.45],
    [Cn(0.6,1.2),'#e0a040',4.8,2.4,0],[B(1.2,0.1,2.4),'#4aa0a8',2.6,0.4,0],[Cn(0.4,1.4),'#4aa0a8',0.8,0.6,0,0,0,Math.PI/2],
    [B(4.4,0.8,1.8),'#c8803a',-2.2,0.3,0],[B(0.9,0.7,1.6),'#e8d8b8',-3,0.9,0],[B(0.4,0.7,0.5),'#2a4a8a',-3,1.6,0],[S(0.2),'#e0b090',-3,2.15,0]]);
  const mat=new THREE.MeshLambertMaterial({vertexColors:true}),bulls=[];{const yb=new THREE.Mesh(YAGARA,mat);yb.castShadow=true;ELEV.boat.add(yb);}
  const rings=W7.canals.filter(c=>c.kind==='ring');let seed=7;const R=()=>{seed=(seed*16807)%2147483647;return seed/2147483647;};
  for(const c of rings)for(let k=0;k<6;k++)bulls.push({tier:c.tier,r:c.r+(R()<0.5?-5:5),h:c.h+0.25,a:R()*Math.PI*2,v:(2.6+R()*1.4)/c.r*(R()<0.5?-1:1)});
  for(let k=0;k<26;k++)bulls.push({r:1372+R()*90,h:0.7,sea:true,a:R()*Math.PI*2,v:(3+R()*2)/1420*(R()<0.5?-1:1)});   // round the moat, riding its swell
  const im=new THREE.InstancedMesh(YAGARA,mat,bulls.length);im.frustumCulled=false;im.castShadow=true;scene.add(im);
  // their wakes: a mark of foam dropped behind each every so often, spreading and fading
  const NW=bulls.length*8,wake=new THREE.InstancedMesh(new THREE.CircleGeometry(1,12).rotateX(-Math.PI/2),new THREE.MeshLambertMaterial({color:0xf0f8ff,transparent:true,opacity:0.55,depthWrite:false}),NW),WK=[];
  for(let i=0;i<NW;i++)WK.push({t:9,x:0,y:-100,z:0});wake.frustumCulled=false;wake.userData.noFingerprint=true;scene.add(wake);let wi=0,wAcc=0;
  // ---- the Puffing Tom: a 4-4-0 with a streamlined boiler, green and red lined in yellow, on paddle wheels; its
  // tender lettered WATER 7; coaches and a lumber flat behind. Past the sea wall its rails lie just under the sea and
  // sway with it (OSM: the station's track); the train rides them. ----
  const ST=(C.landmarks||[]).find(l=>l.model==='station'),[sx,sz]=ST?api.P(ST.at):[1290,0],TRACK=(ST&&ST.track)||2600,TRESTLE=(ST&&ST.trestle)||240;
  const GRN='#2e7a4a',RED='#b8302a',YEL='#e8c040',BLK='#1e1e22',GLD='#d0a040',CY=(r0,r1,h,s=14)=>new THREE.CylinderGeometry(r0,r1,h,s);
  const ENG=body([[CY(1.9,1.9,10,16),GRN,1.5,4.4,0,0,0,Math.PI/2],[new THREE.SphereGeometry(1.9,16,10,0,Math.PI*2,0,Math.PI/2),GRN,6.5,4.4,0,0,0,-Math.PI/2],   // the boiler, its rounded nose
    [CY(1.95,1.95,0.3,16),YEL,-1,4.4,0,0,0,Math.PI/2],[CY(1.95,1.95,0.3,16),YEL,3.5,4.4,0,0,0,Math.PI/2],
    [CY(0.7,0.5,2.6,10),BLK,4.6,7.4,0],[CY(1.1,0.7,0.8,10),BLK,4.6,8.9,0],[new THREE.SphereGeometry(0.75,10,8),GLD,1.2,6.4,0],[CY(0.45,0.45,0.6,8),GLD,6.9,5.6,0,0,0,Math.PI/2],   // stack, dome, lamp
    [B(4.2,4.6,4.6),RED,-5.6,5.0,0],[B(4.6,0.5,5.0),BLK,-5.6,7.55,0],[B(0.1,1.4,3.4),'#1e2830',-3.45,5.6,0],[B(4.3,0.3,4.7),YEL,-5.6,3.0,0],
    [B(13,0.9,3.6),BLK,0,2.0,0],[new THREE.ConeGeometry(1.2,1.6,4).rotateZ(Math.PI/2).scale(1,0.55,1.3),RED,7.1,1.6,0],                      // the frame, the cowcatcher
    [CY(0.7,0.7,0.5,12),RED,4,1.2,1.7,Math.PI/2],[CY(0.7,0.7,0.5,12),RED,4,1.2,-1.7,Math.PI/2],[CY(0.7,0.7,0.5,12),RED,2,1.2,1.7,Math.PI/2],[CY(0.7,0.7,0.5,12),RED,2,1.2,-1.7,Math.PI/2],
    [B(7,3.2,4.4),GRN,-11.5,4.2,0],[B(7.1,0.6,4.5),YEL,-11.5,4.6,0],[B(6.6,0.9,4.0),'#3a3030',-11.5,6.2,0]]);                   // the tender, its band, its coal
  const COACH=body([[B(15,3.6,3.8),RED,0,3.8,0],[B(15.2,0.4,4.0),YEL,0,2.2,0],[B(15.2,0.4,4.0),YEL,0,5.4,0],[new THREE.CylinderGeometry(2.1,2.1,15.4,14,1,false,0,Math.PI).rotateZ(Math.PI/2).rotateY(Math.PI/2),GRN,0,5.5,0],
    [B(13.5,1.4,3.86),'#1e2830',0,4.2,0],[B(15,0.9,3.4),BLK,0,1.6,0]]);
  const FLAT=body([[B(14,0.7,3.6),'#5a3a24',0,2.2,0],[B(14,0.9,3.4),BLK,0,1.4,0],...[0,1,2].flatMap(r=>[0,1,2,3].slice(0,4-r).map(c=>[CY(0.45,0.45,13,8),'#a0703e',0,3.0+r*0.8,-1.35+c*0.9+r*0.45,0,0,Math.PI/2]))]);
  const eng=new THREE.Mesh(ENG,mat),cars=new THREE.InstancedMesh(COACH,mat,5),flat=new THREE.Mesh(FLAT,mat);cars.frustumCulled=false;eng.castShadow=cars.castShadow=flat.castShadow=true;scene.add(eng,cars,flat);
  // the paddle wheels, either side of the engine, turning
  const wheels=[];for(const sd of [-1,1]){const w=new THREE.Group(),wm=new THREE.MeshLambertMaterial({color:0xb8302a}),wy=new THREE.MeshLambertMaterial({color:0xe8c040});
    const rim=new THREE.Mesh(new THREE.TorusGeometry(2.6,0.18,6,24),wm);w.add(rim);for(let k=0;k<10;k++){const pd=new THREE.Mesh(new THREE.BoxGeometry(0.25,1.4,0.9),wy);const a=k/10*Math.PI*2;pd.position.set(Math.cos(a)*2.3,Math.sin(a)*2.3,0);pd.rotation.z=a;w.add(pd);
      const sp=new THREE.Mesh(new THREE.BoxGeometry(0.12,2.3,0.12),wm);sp.position.set(Math.cos(a)*1.15,Math.sin(a)*1.15,0);sp.rotation.z=a+Math.PI/2;w.add(sp);}
    const hub=new THREE.Mesh(new THREE.CylinderGeometry(0.5,0.5,0.6,12).rotateX(Math.PI/2),wy);w.add(hub);const box=new THREE.Mesh(new THREE.CylinderGeometry(3.0,3.0,1.2,20,1,false,0,Math.PI).rotateX(Math.PI/2),new THREE.MeshLambertMaterial({color:0x2e7a4a}));box.position.z=sd*0.2;w.add(box);
    w.traverse(o=>{o.castShadow=true;o.userData.noFingerprint=true;});scene.add(w);wheels.push({w,sd,box});}
  // the rails on the sea: twenty-metre lengths, two rails on their sleepers, riding the swell
  const RAILG=body([[B(20,0.2,0.16),'#8a9096',0,0.35,-0.75],[B(20,0.2,0.16),'#8a9096',0,0.35,0.75],...[0,1,2,3,4,5,6,7,8,9].map(k=>[B(0.4,0.25,2.6),'#5a3a24',-9+k*2,0.12,0])]);
  const NR=Math.ceil((TRACK-TRESTLE)/20)+1,rails=new THREE.InstancedMesh(RAILG,mat,NR);rails.frustumCulled=false;rails.receiveShadow=true;rails.userData.noFingerprint=true;scene.add(rails);
  const railY=u=>{const x=sx+u,z=sz-12;return api.SEA?api.SEA.y(x,z)-0.28:0.45;};
  const steam=[];const SM=new THREE.MeshLambertMaterial({color:0xf4f4f4,transparent:true,opacity:0.55,depthWrite:false});
  for(let i=0;i<40;i++){const s=new THREE.Mesh(new THREE.SphereGeometry(1,8,6),SM);s.visible=false;scene.add(s);steam.push({m:s,t:0});}
  const train={s:0,dir:1,v:0,state:'wait',wait:20,whistle:0};api.SEATRAIN=train;
  const d=new THREE.Object3D();let last=0,si=0,lastPuff=0;
  animHooks.push(now=>{const dt=last?Math.min(0.1,(now-last)/1000):0;last=now;let i=0;
    for(const b of bulls){b.a+=b.v*dt;const x=Math.cos(b.a)*b.r,z=Math.sin(b.a)*b.r,fx=-Math.sin(b.a)*Math.sign(b.v),fz=Math.cos(b.a)*Math.sign(b.v);
      const by=b.sea&&api.SEA?api.SEA.y(x,z)-0.15:b.h+Math.sin(now/400+i)*0.08;d.position.set(x,by,z);d.scale.setScalar(b.tier===1&&inBS(b.a)?0.001:1);d.rotation.set(0,Math.atan2(-fz,fx),0);d.updateMatrix();im.setMatrixAt(i++,d.matrix);}
    im.instanceMatrix.needsUpdate=true;
    wAcc+=dt;if(wAcc>0.35){wAcc=0;for(const b of bulls){const x=Math.cos(b.a)*b.r,z=Math.sin(b.a)*b.r;if(b.tier===1&&inBS(b.a))continue;const w=WK[wi++%NW];w.t=0;w.x=x;w.z=z;w.y=(b.sea&&api.SEA?api.SEA.y(x,z):b.h-0.25)+0.05;}}
    for(let i=0;i<NW;i++){const w=WK[i];if(w.t<3)w.t+=dt;const k=w.t/3;d.position.set(w.x,w.t<3?w.y:-100,w.z);d.rotation.set(0,0,0);d.scale.set(0.6+k*2.6,1,0.4+k*1.6);d.updateMatrix();wake.setMatrixAt(i,d.matrix);}
    wake.instanceMatrix.needsUpdate=true;d.scale.set(1,1,1);
    // the Aqua Elevator: fill (the boat rises), hold, empty (it comes down), a minute round
    {const E=ELEV,ph=(now/1000%60)/60,f=ph<0.4?ph/0.4:ph<0.5?1:ph<0.9?1-(ph-0.5)/0.4:0,ease=f*f*(3-2*f),lvl=1+(E.hi-E.lo-1)*ease;
      E.wat.scale.y=lvl;E.wat.position.y=lvl/2;E.boat.position.set(2,lvl+0.15,0);}
    // the train: waits at the station, runs out to the horizon and back
    if(train.state==='wait'){train.wait-=dt;if(train.wait<=0){train.state='run';train.dir=train.s<=0?1:-1;}}
    else{train.v=Math.min(22,train.v+dt*3);train.s+=train.dir*train.v*dt;if(train.s>TRACK-160||train.s<0){train.s=Math.max(0,Math.min(TRACK-160,train.s));train.state='wait';train.wait=train.s<=0?(C.water7&&C.water7.trainWait)||45:20;train.v=0;}}
    // the rails first: each length at the sea's height there, tipped to follow it
    for(let k=0;k<NR;k++){const u=TRESTLE+10+k*20,y0=railY(u-10),y1=railY(u+10);d.position.set(sx+u,(y0+y1)/2,sz-12);d.rotation.set(0,0,Math.atan2(y1-y0,20));d.scale.set(1,1,1);d.updateMatrix();rails.setMatrixAt(k,d.matrix);}
    rails.instanceMatrix.needsUpdate=true;
    // then the train on them: on the trestle at its own height, out on the sea at the rails'
    const atU=u=>u<TRESTLE?2.9:railY(u)+1.7;const head=train.s+80,dirS=train.dir>0?0:Math.PI;
    const place=(o3,u,k)=>{const y0=atU(u-6),y1=atU(u+6);o3.position.set(sx+u,(y0+y1)/2-1.0,sz-12);o3.rotation.set(0,dirS,(train.dir>0?1:-1)*Math.atan2(y1-y0,12));};
    place(eng,head);for(let k=0;k<5;k++){place(d,head-(k+1)*17*train.dir);d.updateMatrix();cars.setMatrixAt(k,d.matrix);}cars.instanceMatrix.needsUpdate=true;place(flat,head-6*17*train.dir);
    const ex=sx+head-80,ez=sz-12,y=eng.position.y+1.0;
    for(const w of wheels){w.w.position.set(eng.position.x+(train.dir>0?-1:1)*0.6,eng.position.y+3.2,ez+w.sd*2.9);w.w.rotation.set(0,0,-train.s/2.6);w.box.rotation.z=train.s/2.6;}
    if((train.state==='run'||train.whistle>0)&&now-lastPuff>(train.whistle>0?120:350)){lastPuff=now;const p=steam[si++%steam.length];p.m.visible=true;p.t=0;p.m.position.set(eng.position.x+(train.dir>0?4.6:-4.6),eng.position.y+9.5,ez);}
    if(train.whistle>0)train.whistle-=dt;
    for(const p of steam)if(p.m.visible){p.t+=dt;p.m.position.y+=dt*3;p.m.position.x-=train.dir*dt*4;p.m.scale.setScalar(1.2+p.t*1.6);p.m.material.opacity=0.55;if(p.t>4)p.m.visible=false;}});
  api.ctx.details=Object.assign(api.ctx.details||{},{yagara:bulls.length,falls:falls.length/2});
}
