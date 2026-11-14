// The Downfall (#era=downfall). Fan work from Tolkien, whose world belongs to the Tolkien Estate; every shape and
// every word here is this project's own.
//
// In this era the Hallow is forsaken, Nimloth is a stump and the Temple smokes in Armenelos (landmarks.js), and the
// weather is held overcast. Out of the west, over the sea, come the clouds shaped like eagles, their wings spread
// north and south, lit red underneath at evening. "Begin the Downfall" (or #fall=<second> in the address, which also
// starts it that far in) runs the end: the eagles come over the island, lightning strikes the Temple and its dome
// burns, the Meneltarma takes fire, and the sea rises over everything, the mountain last. Raising the sea is how
// the island goes down: the land is left where it is and the water comes up over it.
//
// In the other era this only adds the way across: a button to the Downfall.
import { mkRng } from '../core/rng.js';

export function downfall(api){
  const {THREE,ctx,scene,camera,animHooks,nightF,hour}=api;
  const land=ctx.nmLand||{},MEN=land.menel||{},MX=(MEN.at||[0,0])[0],MZ=(MEN.at||[0,0])[1],MH=MEN.h||3000;
  const peak=(ctx.menelH?ctx.menelH(MX,MZ):MH)+0;
  // ---- the way between the eras ----
  const css='position:fixed;left:50%;bottom:64px;transform:translateX(-50%);z-index:40;display:flex;gap:8px;font:13px/1.2 Georgia,serif';
  const bar=document.createElement('div');bar.style.cssText=css;document.body.appendChild(bar);
  const btn=(label,fn)=>{const b=document.createElement('button');b.textContent=label;b.style.cssText='padding:7px 13px;border-radius:4px;border:1px solid #8a7a5a;background:rgba(20,18,16,0.78);color:#efe4c8;cursor:pointer;font:inherit';b.onclick=fn;bar.appendChild(b);return b;};
  const goEra=e=>{const q=new URLSearchParams(location.hash.slice(1));q.delete('v');q.delete('view');q.delete('fall');if(e==='height')q.delete('era');else q.set('era',e);location.hash=q.toString();location.reload();};
  if(ctx.era!=='downfall'){btn('The Downfall →',()=>goEra('downfall'));ctx.details=Object.assign(ctx.details||{},{era:'height'});return;}
  btn('← Númenor at its height',()=>goEra('height'));
  const go=btn('Begin the Downfall',()=>start(0));

  let wSet=false;const holdWeather=()=>{const W=ctx.weather;if(!wSet&&W&&W.set){W.set('fair',true);wSet=true;}};
  const tex=(()=>{const c=document.createElement('canvas');c.width=c.height=64;const q=c.getContext('2d'),gr=q.createRadialGradient(32,32,0,32,32,32);
    gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(0.45,'rgba(255,255,255,0.6)');gr.addColorStop(1,'rgba(255,255,255,0)');q.fillStyle=gr;q.fillRect(0,0,64,64);return new THREE.CanvasTexture(c);})();

  // ---- the eagles of the Lords of the West: three cloud-masses in the shape of eagles, wings north and south ----
  const SPAN=150000,EAGLES=[],R=mkRng(1441);
  function eagleCloud(span){const N=4200,pos=new Float32Array(N*3),cl=new Float32Array(N*3);
    for(let k=0;k<N;k++){let x,y,z;const r=R();
      if(r<0.78){// a wing: swept back, broad at the shoulder, the long primaries spread at its tip
        const u=(R()<0.5?-1:1)*Math.pow(R(),0.8),au=Math.abs(u),chord=span*(0.13*(1-au*au*0.7)+0.02),sweep=-au*span*0.16+Math.sin(au*Math.PI)*span*0.05;
        const fing=au>0.75?Math.sin(R()*Math.PI*5)*span*0.02:0;
        z=u*span/2;const c=R();x=sweep-c*chord+fing;y=(R()-0.5)*span*0.03*(1-au*0.6)+au*au*span*0.05+(1-c)*chord*0.5;}
      else if(r<0.9){x=span*0.04-R()*span*0.22;z=(R()-0.5)*span*0.1*(1-(span*0.04-x)/(span*0.32));y=(R()-0.5)*span*0.04;}   // the body
      else if(r<0.95){const a=R()*Math.PI*2,rr=R()*span*0.03;x=span*0.08+Math.cos(a)*rr;z=Math.sin(a)*rr;y=(R()-0.5)*span*0.01;}   // the head
      else {const t=R();x=-span*0.2-t*span*0.12;z=(R()-0.5)*span*(0.03+t*0.09);y=0;}   // the tail, fanned
      pos.set([x,y,z],k*3);const d=0.07+R()*0.08;cl.set([d,d*0.97,d*1.08],k*3);}
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('color',new THREE.BufferAttribute(cl,3));
    const m=new THREE.PointsMaterial({size:5200,map:tex,vertexColors:true,transparent:true,opacity:0.92,depthWrite:false,sizeAttenuation:true});
    const p=new THREE.Points(g,m);p.rotation.z=1.15;p.frustumCulled=false;p.userData.noWire=true;p.userData.noShadow=true;p.renderOrder=4;scene.add(p);return p;}
  // they wait over the sea west of the island, coming on very slowly; begun, they come over it
  const HOME=[[-330000,-150000,30000],[-290000,0,36000],[-330000,150000,30000]],OVER=[[-60000,-120000,26000],[-30000,0,32000],[-60000,120000,26000]];
  for(let k=0;k<3;k++){const e=eagleCloud(SPAN*(k===1?1.2:0.9));e.position.set(...HOME[k].slice(0,1),HOME[k][2],HOME[k][1]);EAGLES.push(e);}
  const place=(k,f)=>{const a=HOME[k],b=OVER[k];EAGLES[k].position.set(a[0]+(b[0]-a[0])*f,a[2]+(b[2]-a[2])*f,a[1]+(b[1]-a[1])*f);};

  // ---- lightning: a jagged bolt from the cloud to what it strikes, and the sky flashing ----
  const flash=document.createElement('div');flash.style.cssText='position:fixed;inset:0;pointer-events:none;z-index:30;background:#dfe6ff;opacity:0';document.body.appendChild(flash);
  const boltM=new THREE.LineBasicMaterial({color:0xf2f4ff,transparent:true,opacity:1,depthWrite:false});let bolts=[];
  function strike(x,y,z,top){const pts=[],n=26,R2=mkRng(Math.floor(performance.now()));let px=x+(R2()-0.5)*3000,pz=z+(R2()-0.5)*3000;
    for(let i=0;i<=n;i++){const t=i/n;pts.push(new THREE.Vector3(px+(x-px)*t+(R2()-0.5)*600*(1-t),top+(y-top)*t,pz+(z-pz)*t+(R2()-0.5)*600*(1-t)));}
    const L=new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),boltM.clone());L.frustumCulled=false;L.userData.noWire=true;scene.add(L);bolts.push({L,t:0});flash.style.opacity='0.32';gU.uF.value=1;}

  // ---- the Meneltarma's fire: a glow on the summit and a column of smoke and sparks ----
  const fireG=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,color:0xff6a24,transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending}));fireG.position.set(MX,peak+60,MZ);scene.add(fireG);
  const FN=500,fpos=new Float32Array(FN*3),fage=new Float32Array(FN).map(()=>R());const fgeo=new THREE.BufferGeometry();fgeo.setAttribute('position',new THREE.BufferAttribute(fpos,3));
  const fsm=new THREE.Points(fgeo,new THREE.PointsMaterial({color:0x2e2622,size:420,map:tex,transparent:true,opacity:0,depthWrite:false}));fsm.frustumCulled=false;fsm.userData.noWire=true;scene.add(fsm);

  // ---- the sea: every water mesh rises; the far ring with it; the surf goes ----
  const waters=[],surf=[];let farRing=null;
  // the engine draws the sea in tiles in its water buffer (named 'river'); a tile standing high is the lake's, and stays
  scene.traverse(o=>{if(!o.isMesh)return;if((o.name==='water'||o.name==='river')&&(!o.geometry.boundingSphere||o.geometry.boundingSphere.center.y<5)){waters.push({o,y0:o.position.y});o.material.side=THREE.DoubleSide;o.frustumCulled=false;}
    else if(o.name==='surf')surf.push(o);
    else if(o.renderOrder===-1&&o.geometry&&o.geometry.type==='RingGeometry')farRing={o,y0:o.position.y};});
  const under=document.createElement('div');under.style.cssText='position:fixed;inset:0;pointer-events:none;z-index:29;background:linear-gradient(#1c4a5a,#08202a);opacity:0;transition:opacity 0.3s';document.body.appendChild(under);
  // the gloom: overcast weather would fog out everything past nine kilometres, and this is a thing seen from far off,
  // so the sky is darkened over the top of the view instead, more as the end comes
  // A dome round the camera inside the sky, dark overhead and clear at the horizon; the lightning lights it.
  const gU={uA:{value:0.45},uC:{value:new THREE.Color(0x141218)},uF:{value:0}};
  const gloom=new THREE.Mesh(new THREE.SphereGeometry(Math.min(200000,(ctx.skyR||200000)*0.45),32,16),new THREE.ShaderMaterial({uniforms:gU,transparent:true,depthWrite:false,side:THREE.BackSide,fog:false,
    vertexShader:'varying vec3 vD;void main(){vD=normalize(position);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
    fragmentShader:'uniform float uA;uniform vec3 uC;uniform float uF;varying vec3 vD;void main(){float a=smoothstep(-0.01,0.35,vD.y)*uA;gl_FragColor=vec4(mix(uC,vec3(0.86,0.9,1.0),uF),max(a,uF*0.5*smoothstep(-0.02,0.2,vD.y)));}'}));
  gloom.frustumCulled=false;gloom.renderOrder=5;gloom.userData.noWire=true;scene.add(gloom);
  const cap=document.createElement('div');cap.style.cssText='position:fixed;left:50%;top:18%;transform:translateX(-50%);z-index:41;color:#f2e6c8;font:italic 22px/1.3 Georgia,serif;text-shadow:0 2px 8px #000;text-align:center;opacity:0;transition:opacity 1.2s;pointer-events:none;max-width:80vw';document.body.appendChild(cap);
  const say=t=>{cap.textContent=t;cap.style.opacity=t?'1':'0';};
  const setSea=L=>{ctx.seaLevel=L;for(const w of waters)w.o.position.y=w.y0+L;if(farRing)farRing.o.position.y=farRing.y0+L;for(const s of surf)s.visible=L<2;};

  // ---- the end, in seconds from its start ----
  const D=Object.assign({arrive:30,strike:12,mountain:24,rise0:34,rise1:190,end:200},(ctx.downfallTimes||{}));
  const TOPL=peak+120;
  const CAPS=[[1,'Out of the West the clouds came, in the shape of eagles'],[D.strike,'The lightning broke on the Temple, and its dome burned'],[D.mountain,'Fire came out of the Meneltarma'],
    [D.rise0+6,'And the sea rose'],[D.rise1-30,'The Pillar of Heaven, last of all'],[D.end,'Akallabêth: the Downfallen']];
  let t0=null,lastStrike=0,ci=-1;
  function start(at){t0=performance.now()/1000-(at||0);go.textContent='Again';go.onclick=()=>{const q=new URLSearchParams(location.hash.slice(1));q.set('fall','0');location.hash=q.toString();location.reload();};}
  const ease=x=>x<=0?0:x>=1?1:x*x*(3-2*x);
  let last=0;
  animHooks.push(now=>{const dt=Math.min(0.1,(now-(last||now))/1000);last=now;holdWeather();
    const T=t0==null?-1:performance.now()/1000-t0;
    // the eagles: waiting, or coming over
    const f=T<0?0:ease(T/D.arrive);for(let k=0;k<3;k++){place(k,f);const e=EAGLES[k],n=nightF(hour());
      // lit red underneath toward evening, black in the night
      e.material.color.setRGB(1+1.4*n,1+0.1*n,1).multiplyScalar(1-0.5*n);e.material.fog=false;}
    gloom.position.copy(camera.position);gU.uF.value=Math.max(0,gU.uF.value-dt*3);
    if(T<0){setSea(0);return;}
    gU.uA.value=0.45+0.4*Math.min(1,T/D.arrive);
    while(ci+1<CAPS.length&&T>=CAPS[ci+1][0]){ci++;say(CAPS[ci][1]);}
    if(ci>=0&&T>CAPS[ci][0]+7&&ci<CAPS.length-1)say('');
    // lightning: on the Temple first, then on the mountain and anywhere
    if(T>D.strike-0.5&&T-lastStrike>(T<D.rise0?1.4:0.7)*(0.6+Math.random())){lastStrike=T;const tp=ctx.temple,L=ctx.seaLevel||0;
      if(tp&&T<D.strike+1&&L<tp.top)strike(tp.x,tp.top,tp.z,9000);
      else if(Math.random()<0.4)strike(MX+(Math.random()-0.5)*800,Math.max(L,peak)+10,MZ+(Math.random()-0.5)*800,9500);
      else{const x=(Math.random()-0.5)*300000,z=(Math.random()-0.5)*260000,g=(ctx.groundH||api.groundH)(x,z);strike(x,Math.max(L,g),z,8000);}}
    if(ctx.temple&&T>=D.strike)ctx.temple.fire=Math.min(1,(T-D.strike)/4);
    bolts=bolts.filter(b=>{b.t+=dt;b.L.material.opacity=Math.max(0,1-b.t/0.35);if(b.t>0.35){scene.remove(b.L);b.L.geometry.dispose();return false;}return true;});
    flash.style.opacity=String(Math.max(0,parseFloat(flash.style.opacity||0)-dt*2.2));
    // the mountain's fire
    const mf=T<D.mountain?0:Math.min(1,(T-D.mountain)/6),L=ctx.seaLevel||0,drowned=L>peak;
    fireG.material.opacity=drowned?0:mf*0.95;fireG.scale.setScalar(900+600*Math.sin(T*3.1)*0.2);fsm.material.opacity=drowned?0:mf*0.8;
    for(let k=0;k<FN;k++){fage[k]+=dt*0.05;if(fage[k]>1)fage[k]-=1;const a=fage[k],h=a*6000,sp=60+a*1800;
      fpos[k*3]=MX+h*0.4+Math.sin(k*1.3+a*5)*sp;fpos[k*3+1]=peak+40+h;fpos[k*3+2]=MZ+Math.cos(k*2.1+a*4)*sp;}
    fgeo.attributes.position.needsUpdate=true;
    // the sea, with a long swell on it as it comes
    const r=(T-D.rise0)/(D.rise1-D.rise0),Ls=r<=0?0:TOPL*Math.pow(Math.min(1,r),1.7)+(r>0&&r<1?Math.sin(T*0.9)*18*r:0);setSea(Math.max(0,Ls));
    under.style.opacity=camera.position.y<ctx.seaLevel-1?'0.72':'0';
    ctx.details.downfall={t:Math.round(T),sea:Math.round(ctx.seaLevel||0),peak:Math.round(peak),drowned};});
  ctx.details=Object.assign(ctx.details||{},{era:'downfall',eagles:EAGLES.length,waters:waters.length});
  // #fall=<second>: begin it already, that far in
  try{const q=new URLSearchParams(location.hash.slice(1));if(q.has('fall'))start(parseFloat(q.get('fall'))||0);}catch(e){}
}
