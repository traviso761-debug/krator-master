// ---------- Water 7 at night ----------
// When the light goes the city lights up: lanterns on every boat at anchor, under sail or in the moat (api.BOATS, riding
// with them), strings of lights along the market's stalls, lamps on the docks' cranes and over their gates, Franky
// House's string of coloured bulbs, and out at Shift Station the lighthouse's beam going round. The lanterns are glow
// sprites added over the scene (no lights of their own, so a thousand of them cost one draw); they fade in with
// nightF. (The fountain's lights, cycling through the colours, are the fountain's own: landmarks.js.)
export function lights(api){
  const {THREE,C,scene,animHooks,OSM,nightF,hour}=api;const W7=OSM.water7;if(!W7)return;
  const glow=(()=>{const c=document.createElement('canvas');c.width=c.height=64;const k=c.getContext('2d'),g=k.createRadialGradient(32,32,0,32,32,32);g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(0.25,'rgba(255,240,200,0.6)');g.addColorStop(1,'rgba(255,200,120,0)');k.fillStyle=g;k.fillRect(0,0,64,64);return new THREE.CanvasTexture(c);})();
  const pts=[],cols=[];const push=(x,y,z,c)=>{pts.push(x,y,z);const cc=new THREE.Color(c||0xffd890);cols.push(cc.r,cc.g,cc.b);};
  // the market: a string of lights over each stall row
  const T=W7.tiers,rm=(T[3][0]+T[4][0])/2,hM=T[3][1];for(const sd of [-1,1]){const rr=rm+sd*27,n=Math.floor(rr*2*Math.PI/4.5);for(let i=0;i<n;i++){const a=i/n*Math.PI*2;push(Math.cos(a)*rr,hM+3+0.3*Math.sin(i*1.7),Math.sin(a)*rr,['#ffd890','#ff9a6a','#ffe8b0','#9ad8ff'][i%4]);}}
  // the docks: a lamp at each crane's head and over each gate's beam
  for(const S of Object.values(api.DOCKSHIPS||{})){const D=S.dock;for(const sd of [-1,1]){const v=new THREE.Vector3(S.kx+sd*S.Ls*0.22,S.big?55:43,sd*(S.W/2-6)).applyMatrix4(D.matrixWorld);push(v.x,v.y,v.z,'#ff6a4a');}
    for(let k=-2;k<=2;k++){const v=new THREE.Vector3(0,33,k*S.W/5).applyMatrix4(D.matrixWorld);push(v.x,v.y,v.z,'#ffe0a0');}}
  // Franky House's bulbs, in a swag along its front
  {const [SX,SZ]=W7.scrap||[-1900,820];for(let i=0;i<24;i++){const t=i/23;push(SX+58+t*40,2.5+12-Math.sin(Math.PI*t)*2.2,SZ-36+10.6,['#ff4a4a','#ffd040','#4ad8ff','#6aff6a'][i%4]);}}
  const NS=pts.length/3,NB=(api.BOATS||[]).length*2,geo=new THREE.BufferGeometry(),P=new Float32Array((NS+NB)*3),CL=new Float32Array((NS+NB)*3);P.set(pts);CL.set(cols);
  for(let i=NS;i<NS+NB;i++){CL[i*3]=1;CL[i*3+1]=0.85;CL[i*3+2]=0.55;}
  geo.setAttribute('position',new THREE.BufferAttribute(P,3));geo.setAttribute('color',new THREE.BufferAttribute(CL,3));
  const mat=new THREE.PointsMaterial({map:glow,size:5,sizeAttenuation:true,vertexColors:true,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,opacity:0});
  const sprites=new THREE.Points(geo,mat);sprites.frustumCulled=false;sprites.userData.noFingerprint=true;scene.add(sprites);
  // the lighthouse's beam at Shift Station: a long faint cone going round
  const ST=(C.landmarks||[]).find(l=>l.model==='station'),SG=(api.LANDMARKS||[]).find(g=>g.userData&&g.userData.info&&g.userData.info.model==='station');let beam=null;
  if(ST&&SG){const p=new THREE.Vector3((ST.track||2600)-30,28,-30).applyMatrix4(SG.matrixWorld);beam=new THREE.Group();beam.position.copy(p);
    const cone=new THREE.Mesh(new THREE.ConeGeometry(60,900,24,1,true).translate(0,-450,0).rotateZ(Math.PI/2),new THREE.MeshBasicMaterial({color:0xfff0c0,transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide}));
    beam.add(cone);beam.userData.noFingerprint=true;scene.add(beam);beam.userData.cone=cone;}
  animHooks.push(now=>{const t=now/1000,n=nightF(hour());mat.opacity=Math.min(1,n*1.3);sprites.visible=n>0.02;
    const B=api.BOATS||[];for(let i=0;i<B.length;i++){const g=B[i].g,top=g.position;const j=NS+i*2;
      P[j*3]=top.x;P[j*3+1]=top.y+(B[i].mode==='anchor'||B[i].mode==='trader'?26:B[i].mode==='fisher'?8:3);P[j*3+2]=top.z;
      P[(j+1)*3]=top.x+Math.cos(-g.rotation.y)*(-14);P[(j+1)*3+1]=top.y+4;P[(j+1)*3+2]=top.z+Math.sin(-g.rotation.y)*(-14);}
    geo.attributes.position.needsUpdate=true;
    if(beam){beam.rotation.y=t*0.6;beam.userData.cone.material.opacity=0.09*n;beam.visible=n>0.05;}});
  api.ctx.details=Object.assign(api.ctx.details||{},{lanterns:NS+NB});
}
