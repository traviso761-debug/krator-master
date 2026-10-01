// ---------- lightning in heavy rain: a bolt far off and a double flash (never when reduced motion is requested) ----------
section('lightning',()=>{
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const K=14,pos=new Float32Array((K+1)*6),idx=[];for(let k=0;k<K;k++){const o=k*2;idx.push(o,o+1,o+2,o+1,o+3,o+2);}
const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setIndex(idx);
const m=new THREE.MeshBasicMaterial({color:0xe8ecff,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false,fog:false,side:THREE.DoubleSide});
const bolt=new THREE.Mesh(g,m);bolt.frustumCulled=false;bolt.visible=false;bolt.userData.noWire=true;scene.add(bolt);
const R=mkRng(4711);let next=performance.now()+8000,t0=-1e9;
function strike(){const a=R()*Math.PI*2,dist=900+R()*500,cx=camera.position.x+Math.cos(a)*dist,cz=camera.position.z+Math.sin(a)*dist,top=380+R()*120,base=Math.max(meshH(cx,cz),-10);
  const sx=-Math.sin(a),sz=Math.cos(a);let x=cx,z=cz;
  for(let k=0;k<=K;k++){const y=top+(base-top)*k/K;if(k){x+=(R()-0.5)*40;z+=(R()-0.5)*40;}const w=3.2-2.4*k/K;pos.set([x-sx*w,y,z-sz*w,x+sx*w,y,z+sz*w],k*6);}
  g.attributes.position.needsUpdate=true;t0=performance.now();next=t0+6000+R()*10000;if(ctx.onStrike)ctx.onStrike(cx,(top+base)/2,cz);}
animHooks.push(now=>{if(!reduce&&ENV.izRain.value>0.6&&now>next&&!document.hidden)strike();
  const e=now-t0;let f=0;if(e<80)f=1;else if(e<150)f=0.25;else if(e<230)f=0.8;else if(e<600)f=0.8*(1-(e-230)/370);
  ENV.izFlash.value=f;bolt.visible=f>0.01;m.opacity=Math.min(1,f*1.5);});
ctx.lightning={strike};
});
