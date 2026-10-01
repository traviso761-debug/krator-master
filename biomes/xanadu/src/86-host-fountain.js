// ================================================================= HOST — the fountain
// "From this chasm, with ceaseless turmoil seething ... a mighty fountain
// momently was forced": at the river's head a column of water and spray is
// thrown up in bursts, every few seconds, and falls back into the chasm. A
// particle system on the host (a biome never animates water): points with a
// soft round sprite, ballistic, spawned in pulses.
const FOUNTAIN=(function(){const N=2600,src=RIV.P[0],y0=RIV.bed[0]+.6;
 const pos=new Float32Array(N*3),vel=new Float32Array(N*3),life=new Float32Array(N);
 for(let i=0;i<N;i++){life[i]=-1;pos[i*3]=src[0];pos[i*3+1]=-9999;pos[i*3+2]=src[1];}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));
 const tex=BIO.canvasTex(64,64,(c,w,h)=>{const gr=c.createRadialGradient(32,32,0,32,32,32);gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(.4,'rgba(245,250,252,.55)');gr.addColorStop(1,'rgba(240,248,250,0)');c.fillStyle=gr;c.fillRect(0,0,w,h);});
 const m=new THREE.PointsMaterial({size:3.2,map:tex,transparent:true,depthWrite:false,opacity:.6,color:0xf4fafc,sizeAttenuation:true,fog:true});
 const P=new THREE.Points(g,m);P.frustumCulled=false;P.userData.probeSkip=true;P.renderOrder=3;scene.add(P);
 let t=0,next=0;
 TICKS.push(dt=>{t+=dt;const pulse=Math.pow(Math.max(0,Math.sin(t*1.3)*Math.sin(t*.47+1)),.5);   // bursts, half-intermitted
  let spawn=Math.round((40+500*pulse)*dt*10);
  for(let i=0;i<N&&spawn>0;i++){if(life[i]>0)continue;spawn--;
   const a=Math.random()*TAU,s=Math.random()*3,v=mix(18,44,Math.random())*(0.55+0.45*pulse);
   pos[i*3]=src[0]+Math.cos(a)*s;pos[i*3+1]=y0;pos[i*3+2]=src[1]+Math.sin(a)*s;
   const sp=mix(1,9,Math.pow(Math.random(),2));vel[i*3]=Math.cos(a)*sp;vel[i*3+1]=v*mix(.6,1,Math.random());vel[i*3+2]=Math.sin(a)*sp;life[i]=v/9.8*2;}
  for(let i=0;i<N;i++){if(life[i]<=0)continue;life[i]-=dt;vel[i*3+1]-=9.8*dt;vel[i*3]*=.995;vel[i*3+2]*=.995;
   pos[i*3]+=vel[i*3]*dt;pos[i*3+1]+=vel[i*3+1]*dt;pos[i*3+2]+=vel[i*3+2]*dt;if(pos[i*3+1]<y0-1||life[i]<=0){life[i]=-1;pos[i*3+1]=-9999;}}
  g.attributes.position.needsUpdate=true;});
 return P;})();
