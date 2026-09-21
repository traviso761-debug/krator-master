// ---------- the sky over Europa ----------
// The engine draws a graded dome and calls it sky, which is right for a planet with air and wrong here.
// What is actually overhead:
//
//   nothing            no atmosphere at all, so the sky is black at noon and the stars do not twinkle
//   Jupiter            twenty-four times the width of the Moon from Earth, always in the same place in the
//                      sky because Europa is tidally locked - it does not rise or set, it just hangs there
//                      and goes through its phases. This is the single strangest fact about living here.
//   the sun            a twenty-fifth of the light, small and hard, with shadows that have no fill in them
//   the other moons    Io and Ganymede, bright enough to read by when they are up
//
// Jupiter is drawn as a banded sphere with vertex colours. There are no textures anywhere in this project
// and there is no reason to start now: the bands are what you see and they are bands.
import { mkRng } from '../core/rng.js';

export function sky(api){
  const {THREE,C,ctx,scene,animHooks,camera}=api;
  const K=C.space;if(!K)return;
  const R=mkRng(1610);

  // ---- the stars ----
  // Real ones: a shell of points far enough out that nothing ever gets near it, brighter towards the
  // galactic plane because that is what the sky actually looks like when there is no air in the way.
  {
    const N=K.stars||2600, D=K.far||160000;
    const pos=new Float32Array(N*3), col=new Float32Array(N*3);
    for(let i=0;i<N;i++){
      const u=R()*2-1, th=R()*Math.PI*2, s=Math.sqrt(1-u*u);
      const x=s*Math.cos(th), y=Math.abs(u)*0.85+0.04, z=s*Math.sin(th);
      pos[i*3]=x*D;pos[i*3+1]=y*D;pos[i*3+2]=z*D;
      // a band of extra stars round the plane, and a little colour in the brightest of them
      const b=(0.35+0.65*Math.pow(R(),2.2))*(1+0.5*Math.exp(-Math.pow((Math.abs(u)-0.12)/0.1,2)));
      const warm=R()<0.2;
      col[i*3]=Math.min(1,b*(warm?1.0:0.82));
      col[i*3+1]=Math.min(1,b*0.88);
      col[i*3+2]=Math.min(1,b*(warm?0.78:1.0));
    }
    const g=new THREE.BufferGeometry();
    g.setAttribute('position',new THREE.BufferAttribute(pos,3));
    g.setAttribute('color',new THREE.BufferAttribute(col,3));
    const pts=new THREE.Points(g,new THREE.PointsMaterial({size:K.starSize||420,vertexColors:true,
      sizeAttenuation:true,transparent:true,opacity:0.95,depthWrite:false}));
    pts.userData.noWire=true;pts.userData.noShadow=true;pts.frustumCulled=false;scene.add(pts);
  }

  // ---- Jupiter ----
  // Tidally locked means it does not move. It is drawn at a distance that keeps it behind everything and
  // sized so that it subtends the forty-odd degrees it actually does from the sub-Jovian hemisphere, which
  // is an absurd amount of sky and is the whole reason this page exists.
  {
    const D=(K.far||160000)*0.62, RAD=D*Math.tan((K.jupiterDeg||19)*Math.PI/180);
    const geo=new THREE.SphereGeometry(RAD,64,48);
    const pos=geo.attributes.position, col=[];
    const BANDS=[[0.00,'#d8c4a6'],[0.10,'#c2a88a'],[0.17,'#e0d2bc'],[0.24,'#b08f6e'],[0.31,'#d9c7ae'],
                 [0.38,'#a8815f'],[0.44,'#e6dac6'],[0.52,'#cbb497'],[0.60,'#9d7a59'],[0.68,'#dbcbb2'],
                 [0.76,'#bfa384'],[0.84,'#cbbda4'],[1.00,'#a89680']];
    const c=new THREE.Color(), tmp=new THREE.Color();
    for(let i=0;i<pos.count;i++){
      const y=pos.getY(i)/RAD;                        // -1 at the south pole, 1 at the north
      const t=Math.abs(y);
      let cl=BANDS[BANDS.length-1][1];
      for(let b=0;b<BANDS.length;b++)if(t<=BANDS[b][0]){cl=BANDS[b][1];break;}
      c.set(cl);
      // the turbulence at the band edges, and a little noise everywhere
      const n=0.94+0.06*Math.sin(y*46+pos.getX(i)/RAD*7)+0.03*Math.sin(y*113);
      tmp.copy(c).multiplyScalar(n);
      col.push(tmp.r,tmp.g,tmp.b);
    }
    geo.setAttribute('color',new THREE.Float32BufferAttribute(col,3));
    const jup=new THREE.Mesh(geo,new THREE.MeshBasicMaterial({vertexColors:true,fog:false}));
    // the Great Red Spot: an oval on the southern side, because it is the one feature everybody can name
    const spot=new THREE.Mesh(new THREE.SphereGeometry(RAD*0.14,20,14),
      new THREE.MeshBasicMaterial({color:0xb4704a,fog:false}));
    spot.scale.set(1.5,0.62,1.0);
    spot.position.set(RAD*0.52,-RAD*0.30,RAD*0.80);
    jup.add(spot);
    const a=(K.jupiterAz===undefined?2.1:K.jupiterAz), el=(K.jupiterEl===undefined?0.62:K.jupiterEl);
    jup.position.set(Math.cos(a)*Math.cos(el)*D,Math.sin(el)*D,Math.sin(a)*Math.cos(el)*D);
    jup.lookAt(0,0,0);
    jup.userData.noWire=true;jup.userData.noShadow=true;jup.renderOrder=-2;jup.frustumCulled=false;
    scene.add(jup);
    ctx.details=Object.assign(ctx.details||{},{jupiter:(K.jupiterDeg||19)*2+' degrees across'});
    // the light off it: Jupiter is a real light source here, weak and reddish and from a fixed direction
    const jl=new THREE.DirectionalLight(0xffd2a0,K.jupiterLight===undefined?0.35:K.jupiterLight);
    jl.position.copy(jup.position).normalize().multiplyScalar(4000);scene.add(jl);
  }

  // ---- the other moons ----
  {
    const D=(K.far||160000)*0.8;
    for(const [az,el,r,cl] of (K.moons||[[0.6,0.9,0.006,'#d8cbb2'],[4.4,0.44,0.004,'#cfd4d8']])){
      const s=new THREE.Mesh(new THREE.SphereGeometry(D*r,16,12),
        new THREE.MeshBasicMaterial({color:cl,fog:false}));
      s.position.set(Math.cos(az)*Math.cos(el)*D,Math.sin(el)*D,Math.sin(az)*Math.cos(el)*D);
      s.userData.noWire=true;s.userData.noShadow=true;s.frustumCulled=false;scene.add(s);
    }
  }

  // the sky itself is not lit from below by anything, so whatever the engine's dome is doing, it should be
  // doing it very quietly
  scene.traverse(o=>{if(o.userData&&o.userData.noWire&&o.material&&o.material.fog!==undefined&&o.geometry
    &&o.geometry.type==='SphereGeometry'&&o.renderOrder===-1)o.material.fog=false;});
}
