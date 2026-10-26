// The rocks of Cape Perpetua's shore at a metre: Devil's Churn, Cook's Chasm and the Spouting Horn, and Thor's Well,
// from the USGS lidar patches tools/make-yachats.py writes into the land file (ctx.yaLand.patches). Called by coast.js.
//
//   the patches     each a 1 m heightfield (the map's ground is 10 m, too coarse for a slot a few metres wide),
//                   eased into the map's ground over its last 8 m; the map's ground under it is let down so it never
//                   shows through. Coloured as the shore is: black wet basalt with its bands (the green weed low, the
//                   blue-black mussels, the pale barnacles over them), dry basalt on the walls, salal and grass on top
//   the slots       the surge comes in up each slot's traced line from the sea (make-yachats.py: head first) as a
//                   front of white water that climbs as the slot narrows, and at the head it throws its spray: in
//                   Devil's Churn up the walls higher than the trail, at the Spouting Horn out of the crack under the
//                   highway in a jet, the way a whale blows
//   Thor's Well     a bowl 3 m across in the shelf, about 6 m deep (the roof of a sea cave fallen in). Every wave:
//                   the sea washes over the shelf, pours into the hole from all round, the hole fills from below,
//                   domes, spouts and overflows, and the overflow drains back in as if the ocean were going down a
//                   plughole
//
// ctx.yaSurge (events.js: the high tide) makes all of it bigger and more often. Lidar: USGS 3DEP (public domain).
import { hash3 } from '../core/rng.js';

export function rocks(api,land,{lightNow}){
  const {THREE,C,ctx,scene,camera,animHooks,groundH,P}=api;
  const PATCH=(land.patches||[]).map(p=>{const s=p.slot||[],slot=[];for(let i=0;i<s.length;i+=3)slot.push([s[i]/10,s[i+1]/10,s[i+2]/10]);
    return {name:p.name,x0:p.x0/10,z0:p.z0/10,st:p.step/10,nx:p.nx,nz:p.nz,H:Float32Array.from(p.h,v=>v/10),slot};});
  if(!PATCH.length)return;
  const inP=(p,x,z)=>x>=p.x0&&z>=p.z0&&x<=p.x0+(p.nx-1)*p.st&&z<=p.z0+(p.nz-1)*p.st;
  const raw=(p,x,z)=>{const fx=Math.max(0,Math.min(p.nx-1.001,(x-p.x0)/p.st)),fz=Math.max(0,Math.min(p.nz-1.001,(z-p.z0)/p.st)),i=fx|0,j=fz|0,u=fx-i,v=fz-j,H=p.H,n=p.nx;
    return (H[j*n+i]*(1-u)+H[j*n+i+1]*u)*(1-v)+(H[(j+1)*n+i]*(1-u)+H[(j+1)*n+i+1]*u)*v;};
  const FEATHER=8;
  const edge=(p,x,z)=>Math.min(x-p.x0,z-p.z0,p.x0+(p.nx-1)*p.st-x,p.z0+(p.nz-1)*p.st-z);
  // the height on a patch, eased into the map's ground over its last metres
  const hAt=(p,x,z)=>{const f=Math.max(0,Math.min(1,edge(p,x,z)/FEATHER));return f>=1?raw(p,x,z):groundH(x,z)*(1-f)+raw(p,x,z)*f;};
  const rockH=(x,z)=>{for(const p of PATCH)if(inP(p,x,z))return hAt(p,x,z);return groundH(x,z);};
  ctx.yaRockH=rockH;
  api.groundH=rockH;   // the extras after this one (the crowds, the street life) stand people on the rock, not on the map's 10 m

  // ---- Thor's Well: the bowl in the shelf ----
  const WL=C.landmarks.find(L=>L.model==='blowhole'&&L.kind==='well');let well=null;
  if(WL){const [wx,wz]=P(WL.at),p=PATCH.find(q=>inP(q,wx,wz));
    if(p){// the shelf's own height round it, then the bowl: steep sides into a shaft
      let s=0,n=0;for(let a=0;a<12;a++){s+=raw(p,wx+Math.cos(a/12*6.28)*5,wz+Math.sin(a/12*6.28)*5);n++;}const shelf=s/n;
      for(let j=0;j<p.nz;j++)for(let i=0;i<p.nx;i++){const x=p.x0+i*p.st,z=p.z0+j*p.st,d=Math.hypot(x-wx,z-wz);if(d>4.5)continue;
        const k=j*p.nx+i;p.H[k]=d<1.5?shelf-6:d<3.2?shelf-6+(d-1.5)/1.7*5.4:Math.min(p.H[k],shelf-0.6+(d-3.2)/1.3*0.6);}
      // which way the sea is: the nearest water round it
      let best=1e9,sd=[-1,0];for(let a=0;a<24;a++){const dx=Math.cos(a/24*6.28),dz=Math.sin(a/24*6.28);for(let r=4;r<80;r+=2)if(raw(p,wx+dx*r,wz+dz*r)<0.6){if(r<best){best=r;sd=[dx,dz];}break;}}
      well={x:wx,z:wz,shelf,sea:sd,seaR:Math.min(best,40)};}}

  // ---- the patches' ground ----
  const COL={deep:[0x14,0x17,0x17],weed:[0x2a,0x38,0x22],mussel:[0x1a,0x1c,0x22],barn:[0x6c,0x6a,0x60],wet:[0x1e,0x20,0x1f],dry:[0x34,0x33,0x30],dry2:[0x40,0x3e,0x38],
    lichen:[0x8a,0x7a,0x50],salal:[0x2c,0x48,0x2a],grass:[0x5a,0x6a,0x38]};
  const mix=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t];
  for(const p of PATCH){const nx=p.nx,nz=p.nz,pos=new Float32Array(nx*nz*3),col=new Float32Array(nx*nz*3),idx=[];
    for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const k=j*nx+i,x=p.x0+i*p.st,z=p.z0+j*p.st,y=hAt(p,x,z);pos[k*3]=x;pos[k*3+1]=y+0.03;pos[k*3+2]=z;}
    for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const k=j*nx+i,y=pos[k*3+1];
      const gx=(pos[(j*nx+Math.min(nx-1,i+1))*3+1]-pos[(j*nx+Math.max(0,i-1))*3+1])/2,gz=(pos[(Math.min(nz-1,j+1)*nx+i)*3+1]-pos[(Math.max(0,j-1)*nx+i)*3+1])/2,sl=Math.hypot(gx,gz);
      const h1=hash3(i,j,11),h2=hash3(i>>2,j>>2,12);let c;
      if(y<0.4)c=COL.deep;
      else if(y<1.6)c=mix(COL.weed,COL.wet,h2*0.6);                       // the weed, awash at every tide
      else if(y<2.4)c=mix(COL.mussel,COL.wet,h1*0.4);                     // the mussel beds
      else if(y<3.2)c=mix(COL.barn,COL.wet,0.35+h1*0.4);                  // the barnacles, pale over them
      else if(sl>0.7||y<7)c=mix(COL.dry,COL.dry2,h1)                      // the dry basalt, the walls
      else c=sl<0.35?mix(COL.salal,COL.grass,h2*0.5):mix(COL.salal,COL.dry,0.4);   // salal and grass on top
      if(c===COL.dry||(y>=3.2&&sl>0.7&&h1>0.93))c=mix(c,COL.lichen,0.35);  // lichen on the dry rock
      const f=Math.max(0,Math.min(1,edge(p,pos[k*3],pos[k*3+2])/FEATHER));   // the feather keeps the map's colour under it
      col[k*3]=c[0]/255;col[k*3+1]=c[1]/255;col[k*3+2]=c[2]/255;if(f<1){col[k*3]*=0.85+0.15*f;col[k*3+1]*=0.85+0.15*f;col[k*3+2]*=0.85+0.15*f;}}
    for(let j=0;j<nz-1;j++)for(let i=0;i<nx-1;i++){const a=j*nx+i,b=a+1,c=a+nx,d=c+1;idx.push(a,c,b,b,c,d);}
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('color',new THREE.BufferAttribute(col,3));g.setIndex(idx);g.computeVertexNormals();
    const m=new THREE.Mesh(g,new THREE.MeshLambertMaterial({vertexColors:true,flatShading:true}));m.name='rocks:'+p.name;m.receiveShadow=true;m.userData.wireCat='ground';scene.add(m);
    // the map's ground under the patch is let down below the lowest of it near each vertex, so it never shows through
    scene.traverse(o=>{if(!o.isMesh||o.name!=='terrain')return;const P_=o.geometry.attributes.position;let moved=0;
      for(let i=0;i<P_.count;i++){const x=P_.getX(i),z=P_.getZ(i);if(!inP(p,x,z)||edge(p,x,z)<FEATHER+2)continue;
        let lo=1e9;for(let dz=-8;dz<=8;dz+=2)for(let dx=-8;dx<=8;dx+=2)lo=Math.min(lo,raw(p,x+dx,z+dz));
        const y=Math.min(P_.getY(i),lo-0.8);if(y!==P_.getY(i)){P_.setY(i,y);moved++;}}
      if(moved){P_.needsUpdate=true;o.geometry.computeVertexNormals();o.geometry.computeBoundingSphere();}});}

  // ---- what the engine draped over the map's ground (the trails, the paths, the areas) is draped over the rock ----
  {let n=0;const I=new THREE.Matrix4();
    scene.traverse(o=>{if(!o.isMesh||o.isInstancedMesh||o.name==='terrain'||/^rocks:/.test(o.name)||!o.geometry||!o.geometry.attributes.position)return;
      let q=o;while(q){if(q.userData&&q.userData.wireCat==='landmark')return;q=q.parent;}
      o.updateMatrixWorld();if(!o.matrixWorld.equals(I))return;
      const P_=o.geometry.attributes.position;let moved=0;
      for(let i=0;i<P_.count;i++){const x=P_.getX(i),z=P_.getZ(i);const p=PATCH.find(q=>inP(q,x,z));if(!p)continue;
        const y=P_.getY(i),g=groundH(x,z);if(Math.abs(y-g)>0.8)continue;P_.setY(i,y-g+hAt(p,x,z));moved++;}
      if(moved){P_.needsUpdate=true;o.geometry.computeBoundingSphere();n+=moved;}});
    ctx.details=Object.assign(ctx.details||{},{redraped:n});}

  // ---- the surge in the slots ----
  const WY=ctx.waterLevel==null?0.7:ctx.waterLevel,surge=()=>Math.min(2.4,ctx.yaSurge||1);
  const SLOTS=[];
  const SPEC={churn:{L:150,per:11,c:9,amp:2.6,spray:'churn'},cooks:{L:130,per:9,c:8,amp:2.0,spray:'horn'}};
  const slotMat=()=>new THREE.ShaderMaterial({transparent:true,depthWrite:false,fog:true,
    uniforms:Object.assign({uT:{value:0},uPer:{value:10},uC:{value:8},uL:{value:100},uAmp:{value:2},uLight:{value:1},uSurge:{value:1}},THREE.UniformsLib.fog),
    vertexShader:`uniform float uT,uPer,uC,uL,uAmp,uSurge;attribute float aS;attribute float aV;varying float vS,vV,vF;
#include <fog_pars_vertex>
float front(float s){float tau=mod(uT,uPer),sf=uL-uC*tau;   // the front runs in from the mouth (s=uL) to the head (s=0)
  float ahead=smoothstep(0.0,6.0,sf-s);                    // still to come: the slot's own slop
  float past=clamp((s-sf)/uL,0.0,1.0);                      // behind the front: the water stands up, then drains
  float drain=exp(-max(0.0,tau-uL/uC)*0.6);
  float funnel=0.35+0.65*(1.0-s/uL);                        // higher as the slot narrows
  return mix(0.15*sin(uT*0.9+s*0.2),uAmp*uSurge*funnel*(1.0-past*0.4)*drain,1.0-ahead);}
void main(){vS=aS;vV=aV;float y=front(aS);vF=clamp(y/(uAmp*uSurge+0.01),0.0,1.0);
  vec4 mvPosition=modelViewMatrix*vec4(position.x,position.y+y,position.z,1.0);gl_Position=projectionMatrix*mvPosition;
#include <fog_vertex>
}`,
    fragmentShader:`uniform float uT,uLight;varying float vS,vV,vF;
#include <fog_pars_fragment>
float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}
void main(){float edge=smoothstep(0.0,0.25,0.5-abs(vV-0.5));
  float foam=n(vec2(vS*0.35-uT*1.2,vV*6.0))*0.6+n(vec2(vS*1.3+uT*0.7,vV*14.0))*0.4;
  float white=clamp(vF*1.3+(1.0-edge)*0.5,0.0,1.0)*smoothstep(0.35,0.75,foam+vF*0.5);
  vec3 c=mix(vec3(0.10,0.24,0.27),vec3(0.93,0.96,0.97),white);
  gl_FragColor=vec4(c*uLight,0.78+0.2*white);
#include <fog_fragment>
}`});
  for(const p of PATCH){const S=SPEC[p.name];if(!S||p.slot.length<2)continue;
    // resample the traced line (head first) every 1.5 m, out to S.L metres from the head
    const pts=[];let acc=0;
    for(let k=0;k+1<p.slot.length&&acc<S.L;k++){const [ax,az,aw]=p.slot[k],[bx,bz,bw]=p.slot[k+1],l=Math.hypot(bx-ax,bz-az),n=Math.max(1,Math.ceil(l/1.5));
      for(let q=0;q<n&&acc<S.L;q++){const t=q/n;pts.push([ax+(bx-ax)*t,az+(bz-az)*t,aw+(bw-aw)*t,acc]);acc+=l/n;}}
    const L=acc,pos=[],aS=[],aV=[],idx=[];
    for(let i=0;i<pts.length;i++){const [x,z,w,s]=pts[i],a=pts[Math.max(0,i-1)],b=pts[Math.min(pts.length-1,i+1)],dx=b[0]-a[0],dz=b[1]-a[1],l=Math.hypot(dx,dz)||1,nx=-dz/l,nz=dx/l,hw=Math.max(1.6,Math.min(16,w*0.5));
      pos.push(x-nx*hw,WY+0.05,z-nz*hw,x+nx*hw,WY+0.05,z+nz*hw);aS.push(s,s);aV.push(0,1);if(i)idx.push(i*2-2,i*2,i*2-1,i*2-1,i*2,i*2+1);}
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('aS',new THREE.Float32BufferAttribute(aS,1));g.setAttribute('aV',new THREE.Float32BufferAttribute(aV,1));g.setIndex(idx);g.computeBoundingSphere();
    g.boundingSphere.radius+=20;
    const mat=slotMat();mat.uniforms.uPer.value=S.per;mat.uniforms.uC.value=S.c;mat.uniforms.uL.value=L;mat.uniforms.uAmp.value=S.amp;
    const m=new THREE.Mesh(g,mat);m.name='surge:'+p.name;m.renderOrder=3;m.userData.noWire=true;m.userData.noFingerprint=true;scene.add(m);
    const [hx,hz]=pts[0],[mx,mz]=pts[Math.min(pts.length-1,12)],ax=hx-mx,az=hz-mz,al=Math.hypot(ax,az)||1;
    SLOTS.push({p,S,L,mat,head:[hx,hz],dir:[ax/al,az/al],off:hash3(hx|0,hz|0,3)*S.per,fired:-1});}

  // ---- the spray: points thrown and falling back ----
  const N=500;
  const mkSpray=(size)=>{const g=new THREE.BufferGeometry(),p=new Float32Array(N*3),v=new Float32Array(N*3);g.setAttribute('position',new THREE.BufferAttribute(p,3));
    const pts=new THREE.Points(g,new THREE.PointsMaterial({color:0xf4f8fa,size,transparent:true,opacity:0,depthWrite:false,sizeAttenuation:true}));
    pts.frustumCulled=false;pts.userData.noWire=true;pts.userData.noFingerprint=true;scene.add(pts);return {pts,p,v,t:-1};};
  const throwSpray=(sp,x,y,z,fn)=>{for(let i=0;i<N;i++){const o=fn(i);sp.p[i*3]=x+o[0];sp.p[i*3+1]=y+o[1];sp.p[i*3+2]=z+o[2];sp.v[i*3]=o[3];sp.v[i*3+1]=o[4];sp.v[i*3+2]=o[5];}sp.t=0;sp.floor=y-2;};
  const stepSpray=(sp,dt,life)=>{if(sp.t<0)return;sp.t+=dt;const P_=sp.p,V=sp.v;
    for(let i=0;i<N;i++){V[i*3+1]-=9.8*dt;V[i*3]*=1-0.6*dt;V[i*3+2]*=1-0.6*dt;P_[i*3]+=V[i*3]*dt;P_[i*3+1]=Math.max(sp.floor,P_[i*3+1]+V[i*3+1]*dt);P_[i*3+2]+=V[i*3+2]*dt;}
    sp.pts.geometry.attributes.position.needsUpdate=true;sp.pts.material.opacity=Math.max(0,0.9-sp.t/life)*lightNow();if(sp.t>life){sp.t=-1;sp.pts.material.opacity=0;}};
  const R=Math.random;
  for(const s of SLOTS){s.spray=mkSpray(s.S.spray==='horn'?0.9:1.3);s.mist=mkSpray(2.6);}
  // where the Spouting Horn blows: OpenStreetMap's point, by the head of Cook's Chasm
  const HL=C.landmarks.find(L=>L.model==='blowhole'&&L.kind==='horn');const horn=HL?P(HL.at):null;

  // ---- Thor's Well's water ----
  let W=null;
  if(well){const sheetMat=new THREE.ShaderMaterial({transparent:true,depthWrite:false,fog:true,
      uniforms:Object.assign({uT:{value:0},uIn:{value:1},uOp:{value:0},uR0:{value:1.5},uLight:{value:1}},THREE.UniformsLib.fog),
      vertexShader:`varying vec2 vP;
#include <fog_pars_vertex>
void main(){vP=position.xz;vec4 mvPosition=modelViewMatrix*vec4(position,1.0);gl_Position=projectionMatrix*mvPosition;
#include <fog_vertex>
}`,
      fragmentShader:`uniform float uT,uIn,uOp,uR0,uLight;varying vec2 vP;
#include <fog_pars_fragment>
float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}
void main(){float r=length(vP),a=atan(vP.y,vP.x);if(r<uR0)discard;
  float streak=n(vec2(a*9.0,r*1.4+uIn*uT*3.0))*0.7+n(vec2(a*23.0,r*3.0+uIn*uT*5.0))*0.3;   // foam running in (or out) along the radii
  float white=smoothstep(0.45,0.8,streak)*(0.5+0.5*smoothstep(uR0+3.0,uR0,r));
  vec3 c=mix(vec3(0.16,0.30,0.33),vec3(0.94,0.97,0.98),white);
  gl_FragColor=vec4(c*uLight,uOp*(0.55+0.4*white)*smoothstep(1.0,0.75,r/12.0));
#include <fog_fragment>
}`});
    const sheet=new THREE.Mesh(new THREE.CircleGeometry(12,64).rotateX(-Math.PI/2),sheetMat);sheet.position.set(well.x,well.shelf+0.12,well.z);
    sheet.renderOrder=3;sheet.userData.noWire=true;sheet.userData.noFingerprint=true;scene.add(sheet);
    const pool=new THREE.Mesh(new THREE.CircleGeometry(1.6,24).rotateX(-Math.PI/2),new THREE.MeshLambertMaterial({color:0x2a5460,transparent:true,opacity:0.92}));
    pool.position.set(well.x,well.shelf-5,well.z);pool.userData.noWire=true;pool.userData.noFingerprint=true;scene.add(pool);
    // the wash coming over the shelf from the sea: a sheet that slides in from the seaward side
    const wash=new THREE.Mesh(new THREE.CircleGeometry(1,40).rotateX(-Math.PI/2),new THREE.MeshLambertMaterial({color:0xdfe8ea,transparent:true,opacity:0,depthWrite:false}));
    wash.userData.noWire=true;wash.userData.noFingerprint=true;wash.renderOrder=3;scene.add(wash);
    W={sheet,sheetMat,pool,wash,spout:mkSpray(0.7),fall:mkSpray(0.5),per:12,off:0,last:-1};}

  let last=0;
  animHooks.push(now=>{const dt=Math.min(0.05,(now-(last||now))/1000);last=now;const t=now/1000,L_=lightNow(),sg=surge();
    const cp=camera.position;
    for(const s of SLOTS){const U=s.mat.uniforms;U.uT.value=t+s.off;U.uLight.value=L_;U.uSurge.value=sg;U.uPer.value=s.S.per/Math.sqrt(sg);
      const far=Math.hypot(cp.x-s.head[0],cp.z-s.head[1])>3500;s.mat.visible=!far;
      const tau=(t+s.off)%U.uPer.value,arrive=s.L/s.S.c,cyc=Math.floor((t+s.off)/U.uPer.value);
      if(!far&&tau>=arrive&&s.fired!==cyc){s.fired=cyc;const [hx,hz]=s.S.spray==='horn'&&horn?horn:s.head,gy=WY+s.S.amp*sg*0.8,[dx,dz]=s.dir;
        if(s.S.spray==='horn'){// a jet out of the crack: up, and leaning out over the chasm toward the sea
          throwSpray(s.spray,hx,Math.max(gy,rockH(hx,hz)-0.5),hz,()=>{const sp=1.2+R()*1.6;return [(R()-0.5)*0.6,R()*0.4,(R()-0.5)*0.6,-dx*sp*2+(R()-0.5)*sp,(9+R()*6)*Math.sqrt(sg),-dz*sp*2+(R()-0.5)*sp];});}
        else{// the Churn: the wave slams into the head and goes up the walls, spray higher than the trail
          throwSpray(s.spray,hx,gy,hz,()=>{const a=R()*6.28,r=R()*3;return [Math.cos(a)*r,R(),Math.sin(a)*r,-dx*(2+R()*4)+Math.cos(a)*R()*3,(10+R()*9)*Math.sqrt(sg),-dz*(2+R()*4)+Math.sin(a)*R()*3];});}
        throwSpray(s.mist,hx,gy+2,hz,()=>{const a=R()*6.28,r=R()*4;return [Math.cos(a)*r,R()*2,Math.sin(a)*r,Math.cos(a)*(1+R()*2)+1.5,(3+R()*5)*Math.sqrt(sg),Math.sin(a)*(1+R()*2)];});}
      stepSpray(s.spray,dt,3.2);stepSpray(s.mist,dt,4.5);}
    if(W){const per=W.per/Math.sqrt(sg),tau=(t%per)/per*12,x=well.x,z=well.z,S0=well.shelf,[sx,sz]=well.sea;   // the cycle in twelve "seconds"
      const far=Math.hypot(cp.x-x,cp.z-z)>2500;W.sheet.visible=W.wash.visible=W.pool.visible=!far;
      W.sheetMat.uniforms.uT.value=t;W.sheetMat.uniforms.uLight.value=L_;
      // 0-3 the wash comes over the shelf from the sea
      if(tau<3){const f=tau/3,r=2+f*9,cx=x+sx*(well.seaR*(1-f)*0.8),cz=z+sz*(well.seaR*(1-f)*0.8);W.wash.position.set(cx,S0+0.1,cz);W.wash.scale.set(r,1,r);W.wash.material.opacity=0.55*Math.min(1,f*3)*L_;}
      else W.wash.material.opacity=Math.max(0,W.wash.material.opacity-dt*1.5);
      // 3-6 it pours into the hole from all round; 9.5-12 the overflow drains back in
      const inflow=tau>=3&&tau<6?1-(tau-3)/3*0.6:tau>=9.5?1-(tau-9.5)/2.5:0,outflow=tau>=8&&tau<9.5?(tau-8)/1.5:0;
      W.sheetMat.uniforms.uIn.value=outflow>0?-1:1;W.sheetMat.uniforms.uOp.value=Math.max(inflow,outflow>0?0.9:0)*sg**0.3;
      if(inflow>0&&W.fall.t<0&&Math.random()<0.5)throwSpray(W.fall,x,S0,z,()=>{const a=R()*6.28,r=1.5+R()*0.3;return [Math.cos(a)*r,0,Math.sin(a)*r,-Math.cos(a)*0.8,-1-R()*2,-Math.sin(a)*0.8];});
      // 6-8 the hole fills from below; 8-9.5 it domes, spouts and spills over
      const lvl=tau<6?S0-5+Math.max(0,3-tau)*0.4:tau<8?S0-5+(tau-6)/2*5.2:tau<9.5?S0+0.2:S0+0.2-(tau-9.5)/2.5*5.2;
      W.pool.position.y=lvl;
      if(tau>=8&&W.last!==Math.floor(t/per)){W.last=Math.floor(t/per);throwSpray(W.spout,x,S0+0.3,z,()=>{const a=R()*6.28,r=R()*1.3;return [Math.cos(a)*r,0,Math.sin(a)*r,Math.cos(a)*(1+R()*2),(3+R()*4)*Math.sqrt(sg),Math.sin(a)*(1+R()*2)];});}
      stepSpray(W.spout,dt,2.6);stepSpray(W.fall,dt,1.4);}});
  ctx.details=Object.assign(ctx.details||{},{lidarPatches:PATCH.map(p=>p.name+' '+p.nx+'x'+p.nz).join(', '),slots:SLOTS.map(s=>s.p.name+' '+Math.round(s.L)+' m').join(', '),thorsWell:!!well});
}
