// ---------- Galaxy class: damage you can see ----------
// Fan work. Star Trek belongs to Paramount.
//
// A hit on the hull (the shields down) leaves a scorch where it lands, painted into the skin: each hull material has
// a scorch map over the same uv as its colour (skin.js), and the hit is found on the hull by casting along the bolt's
// path to the point it struck, which gives the part, the texel and, from the triangle it is on, how many metres a
// texel is there, so a scorch is the same size on the dish as on a nacelle. The mark is ragged (soot thrown out in
// streaks from a burnt core), puts out the windows under it, and is hot at first: the core glows orange and cools
// over a few seconds. Marks add up; they do not fade by themselves (damage control patches the hull, not the paint).
//
// A hit on a nacelle vents plasma: a blue-white plume pouring out of the hole and trailing aft, until it is fixed.
// One shot in three that would have hit the saucer is aimed at a nacelle instead (W.aimHull, which events.js asks).
//
// Docked at a starbase, the repair crews take both away over a quarter of a minute.
import {nacSurf,NACY,NACZ} from './hull.js';
import {scorchMap} from './skin.js';

const HASH=(a,b)=>{let h=Math.imul(a|0,0x27d4eb2d)^Math.imul(b|0,0x165667b1);h=Math.imul(h^(h>>>15),0x85ebca6b);h=Math.imul(h^(h>>>13),0xc2b2ae35);return ((h^(h>>>16))>>>0)/4294967296;};

export function damage(W){
  const {THREE,G,SAU,animHooks,pick}=W,F=W.fx,V=()=>new THREE.Vector3();
  const hull=pick.filter(o=>o.isMesh&&o.material&&o.material.userData&&o.material.userData.scorch);
  const ray=new THREE.Raycaster();
  const maps=new Set(),hot=[],vents=[];
  let marks=0,repairing=null;

  // ---- where a shot lands ----
  W.aimHull=()=>{
    if(Math.random()>0.33)return null;
    // a point on a nacelle's skin, along its working length, anywhere round it, in the stardrive's frame (which is
    // the saucer's too while the saucer is home: events.js aims in the saucer's frame then, the stardrive's if not)
    const side=Math.random()<0.5?1:-1,p={x:0,y:0,z:0};nacSurf(side)(0.12+Math.random()*0.75,Math.random(),p);
    return V().set(p.x,p.y,p.z);
  };

  // ---- painting a scorch ----
  function texFor(m){
    const img=m.map&&m.map.image,w=Math.max(16,Math.round((img?img.width:1024)/4)),h=Math.max(16,Math.round((img?img.height:512)/4));
    const t=scorchMap(THREE,m,w,h);maps.add(t);return t;
  }
  function paint(hit,R,dm){
    const m=hit.object.material,t=texFor(m),D=t.image.data,TW=t.image.width,TH=t.image.height,uv=hit.uv;if(!uv)return;
    // metres per unit of u and of v here, from the triangle that was hit
    const g=hit.object.geometry,pa=g.attributes.position,ua=g.attributes.uv,f=hit.face;
    const P=[f.a,f.b,f.c].map(i=>V().fromBufferAttribute(pa,i)),U=[f.a,f.b,f.c].map(i=>new THREE.Vector2().fromBufferAttribute(ua,i));
    hit.object.updateWorldMatrix(true,false);for(const p of P)p.applyMatrix4(hit.object.matrixWorld);
    const e1=P[1].sub(P[0]),e2=P[2].sub(P[0]),d1=U[1].sub(U[0]),d2=U[2].sub(U[0]),det=d1.x*d2.y-d2.x*d1.y;
    let mu=200,mv=200;
    if(Math.abs(det)>1e-12){mu=e1.clone().multiplyScalar(d2.y).addScaledVector(e2,-d1.y).divideScalar(det).length();mv=e2.clone().multiplyScalar(d1.x).addScaledVector(e1,-d2.x).divideScalar(det).length();}
    // the radius in texels each way, kept sane where the mapping is extreme (the tip of a nacelle)
    const rx=Math.max(1.5,Math.min(TW/6,R/Math.max(1e-3,mu)*TW)),ry=Math.max(1.5,Math.min(TH/3,R/Math.max(1e-3,mv)*TH));
    const cx=uv.x*TW,cy=uv.y*TH,seed=(marks++)*7919+13;
    // the streaks: soot thrown out further along a few directions
    const rays=[];for(let k=0;k<7;k++)rays.push([HASH(seed,k)*Math.PI*2,0.5+HASH(seed,k+50)]);
    const x0=Math.floor(cx-rx*1.9),x1=Math.ceil(cx+rx*1.9),y0=Math.max(0,Math.floor(cy-ry*1.9)),y1=Math.min(TH-1,Math.ceil(cy+ry*1.9));
    const wrap=!m.userData.planUV;
    for(let y=y0;y<=y1;y++)for(let xx=x0;xx<=x1;xx++){
      let x=xx;if(x<0||x>=TW){if(!wrap)continue;x=((x%TW)+TW)%TW;}
      const dx=(xx+0.5-cx)/rx,dy=(y+0.5-cy)/ry,r=Math.hypot(dx,dy);if(r>1.9)continue;
      const a=Math.atan2(dy,dx);let reach=1;for(const [ra,k] of rays){let da=Math.abs(a-ra);da=Math.min(da,Math.PI*2-da);reach=Math.max(reach,1+k*0.9*Math.max(0,1-da/0.22));}
      const n=HASH(x*3+seed,y*5+seed),n2=HASH((x>>2)+seed,(y>>2)*7+seed),s=Math.max(0,1-r/reach)*(0.55+0.25*n+0.2*n2),soot=Math.min(1,Math.pow(s,0.8)*1.2*(0.6+0.4*dm));
      const o=(y*TW+x)*4;D[o]=Math.max(D[o],Math.round(255*soot));
      const heat=Math.max(0,1-r/0.55);if(heat>0)D[o+1]=Math.max(D[o+1],Math.round(255*heat*(0.8+0.2*n)));}
    t.needsUpdate=true;hot.push({t,x0,x1,y0,y1,wrap});
    return {m,uv};
  }
  // the heat goes out of fresh marks: a few times a second, only over the marks still hot
  let coolT=0;
  animHooks.push(now=>{
    if(!hot.length||now-coolT<150)return;coolT=now;
    for(let i=hot.length-1;i>=0;i--){const h=hot[i],D=h.t.image.data,TW=h.t.image.width;let left=0;
      for(let y=h.y0;y<=h.y1;y++)for(let xx=h.x0;xx<=h.x1;xx++){let x=xx;if(x<0||x>=TW){if(!h.wrap)continue;x=((x%TW)+TW)%TW;}const o=(y*TW+x)*4+1;if(D[o]){D[o]=Math.floor(D[o]*0.86);left+=D[o];}}
      h.t.needsUpdate=true;if(!left)hot.splice(i,1);}
  });

  // ---- venting plasma ----
  function vent(hit){
    if(vents.length>=3)return;
    const p=G.worldToLocal(hit.point.clone()),n=hit.face?hit.face.normal.clone().transformDirection(hit.object.matrixWorld).transformDirection(new THREE.Matrix4().copy(G.matrixWorld).invert()):V().set(0,1,0);
    if(n.dot(V().set(0,p.y-NACY,p.z-Math.sign(p.z)*NACZ))<0)n.negate();
    const N=160,pos=new Float32Array(N*3),seed=[];for(let i=0;i<N;i++)seed.push([Math.random(),Math.random()-0.5,Math.random()-0.5]);
    const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(pos,3));
    const mat=new THREE.PointsMaterial({map:W.glowTex,color:0x7fb4ff,size:9,sizeAttenuation:true,transparent:true,opacity:0.8,depthWrite:false,blending:THREE.AdditiveBlending,toneMapped:false});
    const pts=new THREE.Points(geo,mat);pts.frustumCulled=false;pts.userData.noWire=true;pts.raycast=()=>{};G.add(pts);
    const core=F.sprite(0xbfe6ff,16,0.9);core.position.copy(p);G.add(core);
    const t1=V().set(-n.y,n.x,0);if(t1.lengthSq()<1e-4)t1.set(0,0,1);t1.normalize();const t2=n.clone().cross(t1);
    const v={pts,geo,mat,core,k:1};vents.push(v);
    F.run(()=>{const t=performance.now()*0.001;
      for(let i=0;i<N;i++){const s=seed[i],f=(s[0]+t*0.9)%1,d=f*90;
        // out of the hole along the skin's normal, spreading, and swept aft as it goes (the field drags it)
        const x=p.x+n.x*d*0.6-f*f*70+(t1.x*s[1]+t2.x*s[2])*d*0.5,y=p.y+n.y*d*0.6+(t1.y*s[1]+t2.y*s[2])*d*0.5,z=p.z+n.z*d*0.6+(t1.z*s[1]+t2.z*s[2])*d*0.5;pos.set([x,y,z],i*3);}
      geo.attributes.position.needsUpdate=true;mat.opacity=0.75*v.k*(0.8+0.2*Math.sin(t*19));core.material.opacity=v.k*(0.6+0.4*Math.sin(t*31)*Math.sin(t*7));
      if(v.k<=0){G.remove(pts,core);geo.dispose();mat.dispose();return false;}});
  }

  // ---- the hit ----
  const NAC='A warp nacelle';
  W.on('hullhit',({p,from,dm})=>{
    const dir=p.clone().sub(from||p.clone().add(V().set(1,0,0))).normalize();
    ray.set(p.clone().addScaledVector(dir,-60),dir);ray.far=140;
    const hit=ray.intersectObjects(hull,false)[0];if(!hit)return;
    const r=paint(hit,(8+Math.random()*7)*Math.sqrt(dm||1),dm||1);
    if(r&&hit.object.userData.info&&hit.object.userData.info.name===NAC)vent(hit);
  });

  // ---- the repair crews ----
  function repair(){
    if(repairing||(!maps.size&&!vents.length))return;
    F.note&&F.note('Repair crews are on the hull: the scorched plating is coming off'+(vents.length?', and the nacelle is being sealed.':'.'));
    const t0=performance.now();let last=0;
    repairing=true;
    F.run(()=>{const u=Math.min(1,(performance.now()-t0)/15000);
      for(const v of vents)v.k=Math.min(v.k,1-Math.min(1,u*2.5));
      if(u-last>0.05||u>=1){last=u;
        for(const t of maps){const D=t.image.data;
          // each texel goes in the order of a hash, so the plating comes back in patches, not as a fade
          for(let i=0,n=D.length/4;i<n;i++){if(!D[i*4])continue;if(HASH(i,77)<u){D[i*4]=0;D[i*4+1]=0;}}t.needsUpdate=true;}}
      if(u>=1){vents.length=0;hot.length=0;repairing=null;F.note&&F.note('Repairs complete: the hull is clean.');return false;}});
  }
  W.on('docked',()=>repair());
  return {state:()=>({marks,vents:vents.length,maps:maps.size}),repair};
}
