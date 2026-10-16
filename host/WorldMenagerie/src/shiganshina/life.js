// ---------- what moves at Shiganshina ----------
// The Titans: naked giants of four to fifteen metres, wrong in their proportions (a head too big, arms too long, a
// grin too wide), wandering the plains outside the walls with a slow, lurching walk and drifting toward the district,
// where the people are; turned back at the foot of the wall. The Garrison on the walls, walking the walkway. The
// figures are built of parts (a group each, a few dozen of them), so their legs and arms can swing.
// api.TITANS (the list), api.makeTitan(height) for the events.
export function life(api){
  const {THREE,C,scene,animHooks,camera,groundH,OSM}=api;const S=OSM.shiganshina;if(!S)return;
  let seed=845;const R=()=>{seed=(seed*16807)%2147483647;return seed/2147483647;};
  const SKIN=['#e8b8a0','#d8a890','#f0c8b0','#c89880','#e0b098'].map(c=>new THREE.MeshLambertMaterial({color:c}));
  const HAIR=['#2a1e18','#6a4a2a','#1a1a1c','#a87a4a',null].map(c=>c&&new THREE.MeshLambertMaterial({color:c}));
  const mouthM=new THREE.MeshLambertMaterial({color:0x4a1a1a}),eyeM=new THREE.MeshLambertMaterial({color:0x1a1a1a}),toothM=new THREE.MeshLambertMaterial({color:0xf4f0e6});
  const part=(geo,m,x,y,z,parent)=>{const me=new THREE.Mesh(geo,m);me.position.set(x,y,z);me.castShadow=true;parent.add(me);return me;};
  // a titan of height h: built about its own feet, facing +x; the limbs hang from pivots so they can swing
  function makeTitan(h,opts={}){const g=new THREE.Group(),k=h/10,sk=SKIN[Math.floor(R()*SKIN.length)],head=opts.head||(0.9+R()*0.7),fat=0.8+R()*0.6,arm=0.9+R()*0.5;
    const pivot=(x,y,z)=>{const p=new THREE.Group();p.position.set(x,y,z);g.add(p);return p;};
    const legs=[],arms=[];
    for(const s of [-1,1]){const p=pivot(0,5*k,s*1.1*k*fat);part(new THREE.CylinderGeometry(0.75*k*fat,0.55*k,5*k,8),sk,0,-2.5*k,0,p);part(new THREE.BoxGeometry(1.6*k,0.6*k,1.0*k),sk,0.4*k,-5*k,0,p);legs.push(p);}
    part(new THREE.CylinderGeometry(1.5*k*fat,1.3*k*fat,3.6*k,10),sk,0,6.8*k,0,g);                    // the trunk
    for(const s of [-1,1]){const p=pivot(0,8.4*k,s*1.9*k*fat);part(new THREE.CylinderGeometry(0.45*k,0.38*k,4.2*k*arm,8),sk,0,-2.1*k*arm,0,p);part(new THREE.SphereGeometry(0.55*k,8,6),sk,0,-4.3*k*arm,0,p);arms.push(p);}
    const hd=new THREE.Group();hd.position.set(0.2*k,8.8*k+1.3*k*head,0);g.add(hd);
    part(new THREE.SphereGeometry(1.3*k*head,14,10),sk,0,0,0,hd);
    for(const s of [-1,1])part(new THREE.SphereGeometry(0.2*k*head,8,6),eyeM,1.15*k*head,0.25*k*head,s*0.42*k*head,hd);
    const mouth=part(new THREE.BoxGeometry(0.3*k*head,0.35*k*head,1.3*k*head),mouthM,1.05*k*head,-0.45*k*head,0,hd);
    part(new THREE.BoxGeometry(0.32*k*head,0.12*k*head,1.25*k*head),toothM,1.08*k*head,-0.32*k*head,0,hd);   // the grin
    const hm=HAIR[Math.floor(R()*HAIR.length)];if(hm)part(new THREE.SphereGeometry(1.36*k*head,14,8,0,Math.PI*2,0,Math.PI*0.45),hm,-0.1*k,0.1*k*head,0,hd);
    g.userData.titan={h,legs,arms,hd,phase:R()*6.28};g.traverse(o=>{o.userData.noFingerprint=true;});return g;}
  api.makeTitan=makeTitan;
  // ---- the titans on the plains ----
  const DR=S.distR,titans=[];
  // outside the walls: south of Wall Maria and clear of the district's U (S.distW wide, S.distL straight, a half-circle on the end)
  const inU=(x,z,pad)=>z>0&&(z<S.distL?Math.abs(x)<S.distW+pad:Math.hypot(x,z-S.distL)<S.distW+pad);
  const outside=(x,z)=>z>40&&!inU(x,z,70);
  for(let i=0;i<(C.titans&&C.titans.count||22);i++){const h=4+R()*11;let x,z;const NR=(C.titans&&C.titans.near)||[950,4600];do{const a=R()*Math.PI,d=NR[0]+R()*(NR[1]-NR[0]);x=Math.cos(a)*d;z=Math.sin(a)*d;}while(!outside(x,z));
    const g=makeTitan(h);g.position.set(x,groundH(x,z),z);scene.add(g);titans.push({g,x,z,head:R()*6.28,v:0.6+R()*0.9,turn:0,wait:0});}
  api.TITANS=titans;
  // ---- the Garrison on the walls ----
  const SOL=new THREE.Group();scene.add(SOL);const soldiers=[];const coat=new THREE.MeshLambertMaterial({color:0x6a4a30}),trousers=new THREE.MeshLambertMaterial({color:0xe8e0cc}),face=new THREE.MeshLambertMaterial({color:0xe0b090});
  for(let i=0;i<40;i++){const s=new THREE.Group();part(new THREE.BoxGeometry(0.3,0.9,0.4),trousers,0,0.45,0,s);part(new THREE.BoxGeometry(0.35,0.7,0.5),coat,0,1.25,0,s);part(new THREE.SphereGeometry(0.14,8,6),face,0,1.75,0,s);
    const onMaria=i<18;soldiers.push({s,onMaria,u:onMaria?(R()-0.5)*9000:R(),v:(0.6+R()*0.6)*(R()<0.5?-1:1)});SOL.add(s);}
  const PATH=S.path,PC=[0];for(let i=0;i+1<PATH.length;i++)PC.push(PC[i]+Math.hypot(PATH[i+1][0]-PATH[i][0],PATH[i+1][1]-PATH[i][1]));const PL=PC[PC.length-1];
  const onPath=s=>{let i=0;while(i<PC.length-2&&PC[i+1]<s)i++;const [ax,az]=PATH[i],[bx,bz]=PATH[i+1],L=PC[i+1]-PC[i]||1,t=(s-PC[i])/L;return [ax+(bx-ax)*t,az+(bz-az)*t,Math.atan2(bz-az,bx-ax)];};
  let last=0;
  animHooks.push(now=>{const dt=last?Math.min(0.1,(now-last)/1000):0;last=now;const t=now/1000;
    for(const T of titans){const td=T.g.userData.titan;if(T.wait>0){T.wait-=dt;}else{
        // drift toward the district (the people), wander, and turn back at the wall
        const toward=Math.atan2(DR*0.6-T.z,-T.x);T.head+=(Math.sin(t*0.13+td.phase)*0.3+(T.leader?0:0.06*Math.sin(toward-T.head)))*dt;
        let nx=T.x+Math.cos(T.head)*T.v*dt*td.h*0.25,nz=T.z+Math.sin(T.head)*T.v*dt*td.h*0.25;
        if(!outside(nx,nz)||Math.abs(nx)>5800||nz>4900){T.head+=Math.PI*(0.6+R()*0.4);T.wait=2+R()*4;nx=T.x;nz=T.z;}
        T.x=nx;T.z=nz;}
      const sw=T.wait>0?0:Math.sin(t*T.v*1.6+td.phase);T.g.position.set(T.x,groundH(T.x,T.z)+Math.abs(sw)*0.04*td.h,T.z);T.g.rotation.y=-T.head;
      td.legs[0].rotation.z=sw*0.45;td.legs[1].rotation.z=-sw*0.45;td.arms[0].rotation.z=-sw*0.35-0.1;td.arms[1].rotation.z=sw*0.35-0.1;td.hd.rotation.x=Math.sin(t*0.7+td.phase)*0.15;}
    for(const so of soldiers){so.u+=so.v*dt*(so.onMaria?1:1/PL);let x,z,ry;
      if(so.onMaria){if(Math.abs(so.u)<S.distW+20)so.u=Math.sign(so.u||1)*(S.distW+20)+so.v;if(Math.abs(so.u)>5800)so.v=-so.v;x=so.u;z=-2;ry=so.v>0?0:Math.PI;}
      else{if(so.u<0.02||so.u>0.98)so.v=-so.v;const [px,pz,a]=onPath(so.u*PL);x=px;z=pz;ry=-a+(so.v>0?0:Math.PI);}
      so.s.position.set(x,S.wallH,z);so.s.rotation.y=ry;}});
  // ---- the town's furniture: the bridges over the canal, the market's stalls and its well, carts and barrels ----
  {const M=(c)=>new THREE.MeshLambertMaterial({color:c}),stone=M(0xb4a890),wood=M(0x6a4a30),G=new THREE.Group(),put=(geo,m,x,y,z,ry=0)=>{const me=new THREE.Mesh(geo,m);me.position.set(x,y,z);me.rotation.y=ry;me.castShadow=me.receiveShadow=true;G.add(me);return me;};
    for(const zb of S.streetsZ||[]){const gy=groundH(S.canalX+14,zb);put(new THREE.BoxGeometry(26,1.2,7),stone,S.canalX,gy+0.6,zb);
      const arch=put(new THREE.CylinderGeometry(8,8,7,16,1,false,0,Math.PI).rotateX(Math.PI/2),stone,S.canalX,gy-6.2,zb);arch.scale.set(1,0.5,1);
      for(const sd of [-1,1])put(new THREE.BoxGeometry(26,1,0.5),stone,S.canalX,gy+1.6,zb+sd*3.3);}
    const AW=['#a8302a','#2a5a8a','#c8a040','#3a6a3a','#e8e0cc','#8a4a8a'].map(M);
    for(let i=0;i<18;i++){const a=i/18*Math.PI*2,x=Math.cos(a)*44,z=380+Math.sin(a)*30,gy=groundH(x,z);
      for(const [px,pz] of [[-1.3,-1],[1.3,-1],[-1.3,1],[1.3,1]])put(new THREE.BoxGeometry(0.15,2.4,0.15),wood,x+px,gy+1.2,z+pz);
      put(new THREE.BoxGeometry(3,0.9,2.2),wood,x,gy+0.45,z,-a);put(new THREE.BoxGeometry(3.4,0.12,2.6),AW[i%AW.length],x,gy+2.5,z,-a);}
    {const wx=24,wz=380,gy=groundH(wx,wz);put(new THREE.CylinderGeometry(1.6,1.7,1.1,14),stone,wx,gy+0.55,wz);for(const sd of [-1,1])put(new THREE.BoxGeometry(0.2,2.6,0.2),wood,wx+sd*1.4,gy+1.6,wz);
      put(new THREE.ConeGeometry(2.2,1.2,4),M(0x8a3a2a),wx,gy+3.4,wz,Math.PI/4);put(new THREE.CylinderGeometry(0.1,0.1,2.8,6).rotateZ(Math.PI/2),wood,wx,gy+2.6,wz);}
    for(let i=0;i<30;i++){const x=(R()-0.5)*1100,z=60+R()*1200;if(!inU(x,z,-60))continue;const gy=groundH(x,z),ry=R()*6.3;
      if(i%3===0){put(new THREE.BoxGeometry(2.6,0.9,1.4),wood,x,gy+1.1,z,ry);for(const sd of [-1,1])put(new THREE.CylinderGeometry(0.55,0.55,0.15,10).rotateX(Math.PI/2),wood,x,gy+0.55,z+sd*0.8,ry);}
      else for(let b=0;b<3;b++)put(new THREE.CylinderGeometry(0.35,0.4,0.9,10),wood,x+b*0.8,gy+0.45,z,ry);}
    G.traverse(o=>{o.userData.noFingerprint=true;});scene.add(G);}
  api.ctx.details=Object.assign(api.ctx.details||{},{titans:titans.length,garrison:soldiers.length});
}
