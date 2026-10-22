// ================================================================= HOST — the seed weather (biomes/nsemiarid/PLAN.md, section 7)
// In the seed season a layer of drifting seeds rides the wind: plumes, cotton and parachutes in a box round the camera,
// carried downwind (NSEMIARID.WIND), bobbing, sinking and lifting again, wrapped at the box's edges so the drift never
// ends. Host-only, drawn as one Points cloud; ?seeds=0 turns it off. A world binds it to core/atmos's wind (in Godot,
// particles on atm_wind): this page keeps the kit's prevailing wind at a steady 6 m/s.
const SEEDS=(function(){const Q=new URLSearchParams(location.search);if(Q.get('seeds')==='0')return null;
 const N=2600,BOX=[260,90,260],pos=new Float32Array(N*3),ph=new Float32Array(N),rnd=BIO.fn.rng;
 for(let i=0;i<N;i++){pos[i*3]=(rnd()-.5)*BOX[0]*2;pos[i*3+1]=rnd()*BOX[1];pos[i*3+2]=(rnd()-.5)*BOX[2]*2;ph[i]=rnd()*6.283;}
 const tex=BIO.canvasTex(64,64,(g,w,h)=>{g.clearRect(0,0,w,h);const c=w/2;g.strokeStyle='rgba(255,255,255,.9)';g.lineWidth=1.2;
  for(let k=0;k<14;k++){const a=k/14*6.283;g.beginPath();g.moveTo(c,c);g.lineTo(c+Math.cos(a)*c*.85,c+Math.sin(a)*c*.85);g.stroke();}
  g.fillStyle='rgba(255,255,255,1)';g.beginPath();g.arc(c,c,3,0,6.283);g.fill();});
 const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(pos,3));
 const mat=new THREE.PointsMaterial({map:tex,size:.9,sizeAttenuation:true,transparent:true,depthWrite:false,alphaTest:.05,color:0xf4f0e6,opacity:.9});
 const P=new THREE.Points(geo,mat);P.frustumCulled=false;P.userData.probeSkip=true;P.userData.host=true;P.userData.inspectLabel='The seed weather';scene.add(P);
 let t=0;const SPEED=6;
 TICKS.push(dt=>{t+=dt;const w=NSEMIARID.WIND,c=camera.position;
  for(let i=0;i<N;i++){const k=i*3;pos[k]+=w[0]*SPEED*dt+Math.sin(t*.7+ph[i])*.4*dt;pos[k+2]+=w[1]*SPEED*dt+Math.cos(t*.6+ph[i])*.4*dt;pos[k+1]+=Math.sin(t*1.3+ph[i]*2)*.5*dt-.15*dt;
   for(const a of [0,2]){const lim=BOX[a];if(pos[k+a]>lim)pos[k+a]-=lim*2;else if(pos[k+a]<-lim)pos[k+a]+=lim*2;}
   if(pos[k+1]<0)pos[k+1]+=BOX[1];else if(pos[k+1]>BOX[1])pos[k+1]-=BOX[1];}
  P.position.set(c.x,Math.max(terrainH(c.x,c.z),c.y-BOX[1]*.6),c.z);geo.attributes.position.needsUpdate=true;});
 return{points:P,n:N};})();
