// ---------- the rest of the animal: heart, great vessels, nerve cord ----------
// The park is laid out along the organism's gut and airway, and that is all the first version showed: a shaft
// with chambers off it. But a superorganism three kilometres long does not keep itself alive with a gut and a
// pair of lungs. This module adds what has to be there for the rest to make sense, all of it on the outside of
// the shaft wall, where the section view shows it and a visitor inside never saw it:
//
//   the heart            pressed into the notch in the south lung, beating in two strokes about forty times a
//                        minute, its coronary arteries and veins running in the fat of its grooves
//   the great vessels    the aorta arching off the top of the heart and running down the shaft to the springs,
//                        the Gift Gardens and both seas; the vena cava coming back up beside it; the pulmonary
//                        trunk out to the hilum of each lung and the pulmonary veins back. A pulse runs down
//                        every one of them with each beat.
//   the nerve cord       a pale cord from the collar to the drain, a ganglion every hundred and sixty metres,
//                        and a nerve out of each ganglion to whatever organ is nearest. Signals run down it.
//
// None of this is in the park's published anatomy. It is this model's reading of what the animal needs, and
// the cards say so. The incident (incident.js) drives it through the bus's heart and nerve signals (bus.js).
import { mkRng } from '../core/rng.js';

export function anatomy(api){
  const {ctx,animHooks}=api;
  const P=ctx.pit;if(!P)return;
  const {THREE,Y,TOP,AX,AZ,wallAt,radiusAt,polar,card,LAYERS}=P;
  const R=mkRng(1848);
  const UP=new THREE.Vector3(0,1,0);
  const BRON=LAYERS.find(L=>L.kind==='bronchial');
  const DEEP=P.DEEP;
  const G=new THREE.Group();

  // ---- the pulse: a bright band that runs along a vessel with each beat ----
  // One shader addition shared by everything that carries a pulse: the emissive gets a crest wherever
  // sin(phase + height*k) peaks, so as the phase advances the crest runs down the animal.
  const PU={uPhase:{value:0},uAmp:{value:1}};
  function pulsing(mat,col,k,sharp){
    const id='fppulse'+(pulsing.n=(pulsing.n||0)+1);
    const uCol={value:new THREE.Color(col)};
    mat.onBeforeCompile=sh=>{
      Object.assign(sh.uniforms,PU,{uPulseCol:uCol});
      sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying float vFpY;')
        .replace('#include <begin_vertex>','#include <begin_vertex>\nvFpY=(modelMatrix*vec4(transformed,1.0)).y;');
      sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nvarying float vFpY;uniform float uPhase;uniform float uAmp;uniform vec3 uPulseCol;')
        .replace('#include <emissivemap_fragment>',`#include <emissivemap_fragment>
totalEmissiveRadiance+=uPulseCol*uAmp*pow(max(0.0,sin(uPhase+vFpY*${k.toFixed(4)})),${sharp.toFixed(1)});`);
    };
    mat.customProgramCacheKey=()=>id;
    return mat;
  }
  const arteryM=pulsing(new THREE.MeshPhongMaterial({color:0x9c1c26,specular:0x803038,shininess:50,emissive:0x220406}),0xff4a3a,0.012,10);
  const veinM=pulsing(new THREE.MeshPhongMaterial({color:0x4a3f86,specular:0x403070,shininess:40,emissive:0x0c0a24}),0x8070ff,0.009,8);
  const nerveM=new THREE.MeshPhongMaterial({color:0xe6dcc4,specular:0x908070,shininess:30,emissive:0x2a2418});

  // A vessel along a curve, as one tube.
  function vessel(pts,r,m,seg){
    const c=new THREE.CatmullRomCurve3(pts);
    const t=new THREE.Mesh(new THREE.TubeGeometry(c,seg||Math.max(8,pts.length*6),r,8,false),m);
    t.frustumCulled=false;return t;
  }
  // The section view looks at the shaft from FRONT (camera.js's default heading). What runs the length of the
  // animal is kept to the two edges of that view, and anything that has to go round the shaft goes round the
  // back of it, so that none of it is drawn across the cutaway.
  const FRONT=1.15,LEFT=FRONT+Math.PI/2+0.1,RIGHT=FRONT-Math.PI/2-0.1+Math.PI*2;
  const wrap=a=>{while(a>Math.PI)a-=Math.PI*2;while(a<-Math.PI)a+=Math.PI*2;return a;};
  // A path round the outside of the shaft, from one angle and depth to another, a fixed distance off the wall.
  function around(a0,d0,a1,d1,off,n,front){
    const out=[];n=n||16;
    let da=wrap(a1-a0);
    // does the short way cross the front? then go the long way, unless crossing it is the point
    if(!front){const mid=wrap(FRONT-a0);if(Math.abs(da)>0.05&&Math.sign(mid)===Math.sign(da)&&Math.abs(mid)<Math.abs(da))da-=Math.sign(da)*Math.PI*2;}
    for(let k=0;k<=n;k++){const u=k/n,a=a0+da*u,d=d0+(d1-d0)*u;const [x,z]=polar(a,wallAt(d)+off);out.push(new THREE.Vector3(x,Y(d),z));}
    return out;
  }

  // ---- the heart ----
  const HA=FRONT+0.3;                                   // at the front, between the lungs, in the south lung's notch
  const HD=BRON?BRON.top+(BRON.bottom-BRON.top)*0.68:880;
  const HR=70,HL=170;                                   // radius at the base, and base-to-apex length
  const [hx,hz]=polar(HA,wallAt(HD)+HR*0.95);
  const heart=new THREE.Group();heart.position.set(hx,Y(HD),hz);
  // The long axis runs from the base (up, against the shaft) to the apex (down, out, towards the south lung).
  const outward=new THREE.Vector3(Math.cos(HA),0,Math.sin(HA)),toLung=new THREE.Vector3(-1,0,0);
  const axis=new THREE.Vector3().addScaledVector(outward,0.45).addScaledVector(UP,-1).addScaledVector(toLung,0.4).normalize();
  const orient=new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,-1,0),axis);
  // The shape, on a sphere: t runs from -1 at the base to 1 at the apex; phi is round the long axis.
  const PHI0=0.4;                                       // where the interventricular groove runs
  function heartDeform(x,y,z){
    const t=-y,phi=Math.atan2(z,x);
    let r=1-0.52*Math.pow(Math.max(0,t),1.5);           // tapering to the apex
    if(t<-0.35)r*=1+0.18*Math.exp(-(((Math.abs(phi-2.2)-0.7)/0.6)**2));   // the two atria, bulging at the base
    let dphi=Math.abs(((phi-PHI0+Math.PI)%(Math.PI*2)+Math.PI*2)%(Math.PI*2)-Math.PI);
    const iv=Math.exp(-((dphi/0.14)**2))*(t>-0.5?1:0);  // interventricular groove
    const av=Math.exp(-(((t+0.5)/0.07)**2));            // atrioventricular groove
    r*=1-0.07*iv-0.08*av+0.03*Math.sin(phi*2+0.5);      // and the right ventricle a little fuller than the left
    return {p:new THREE.Vector3(x*r*HR,y*HL/2,z*r*HR),fat:Math.max(iv,av)};
  }
  {
    const g=new THREE.SphereGeometry(1,56,42),p=g.attributes.position,col=[],c=new THREE.Color();
    const muscle=new THREE.Color(0x7c1c24),dark=new THREE.Color(0x4e1016),fat=new THREE.Color(0xcfa868);
    for(let i=0;i<p.count;i++){
      const {p:q,fat:f}=heartDeform(p.getX(i),p.getY(i),p.getZ(i));p.setXYZ(i,q.x,q.y,q.z);
      c.copy(muscle).lerp(dark,Math.max(0,-p.getY(i)/HL*2)*0.5).lerp(fat,f*0.85);
      c.multiplyScalar(0.9+0.15*Math.sin(q.x*0.2+q.z*0.17+q.y*0.05));
      col.push(c.r,c.g,c.b);
    }
    g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));g.computeVertexNormals();
    const m=new THREE.Mesh(g,new THREE.MeshPhongMaterial({vertexColors:true,specular:0x6a3038,shininess:44,emissive:0x1a0406}));
    m.quaternion.copy(orient);heart.add(m);
  }
  // The coronaries: along the grooves, a hair off the surface. A surface point for (phi, t) is found the same
  // way the mesh was made, so they sit in the grooves they are named for.
  function surf(phi,t,lift){
    const y=-t,rr=Math.sqrt(Math.max(0,1-y*y));
    const q=heartDeform(Math.cos(phi)*rr,y,Math.sin(phi)*rr).p;
    return q.multiplyScalar(lift||1.03).applyQuaternion(orient);
  }
  const cor=[],corV=[];
  cor.push(vessel(Array.from({length:12},(_,k)=>surf(PHI0,-0.45+k*0.12)),2.6,arteryM));            // the anterior descending
  cor.push(vessel(Array.from({length:14},(_,k)=>surf(PHI0+k*0.22,-0.5)),2.3,arteryM));              // circumflex
  cor.push(vessel(Array.from({length:14},(_,k)=>surf(PHI0-k*0.22,-0.52)),2.3,arteryM));             // right coronary
  for(let k=0;k<4;k++){const t0=-0.25+k*0.25,dir=k%2?1:-1;                                          // diagonals
    cor.push(vessel(Array.from({length:6},(_,j)=>surf(PHI0+dir*j*0.16,t0+j*0.07)),1.4,arteryM));}
  corV.push(vessel(Array.from({length:12},(_,k)=>surf(PHI0+0.25,-0.45+k*0.12,1.035)),2.0,veinM));
  corV.push(vessel(Array.from({length:14},(_,k)=>surf(PHI0+Math.PI+k*0.2,-0.55,1.035)),2.2,veinM));
  for(const v of cor.concat(corV))heart.add(v);
  G.add(heart);
  card({name:'The heart',info:'A muscle the size of an office block, pressed into the notch in the south lung, beating in two strokes about forty times a minute: out through the aorta, which runs down the outside of the shaft to the springs, the Gift Gardens and both seas, and back up the vena cava beside it. Its coronary arteries run in the yellow fat of its grooves. This is the model\'s own reading of the animal - the park\'s published anatomy does not show a heart.'},[heart]);

  // ---- the great vessels ----
  const vessels=[];
  const baseW=new THREE.Vector3(0,HL/2,0).applyQuaternion(orient).add(heart.position);   // the top of the heart
  const AA=LEFT+0.12,VA=LEFT-0.14;                      // the aorta and the vena cava, down the left edge of the view
  const aTop=HD-HL*0.55-40;
  // the arch: up off the heart, over, and down against the wall
  const arch=[baseW.clone(),baseW.clone().add(new THREE.Vector3(0,30,0))];
  {const [x,z]=polar(AA,wallAt(aTop)+26);arch.push(new THREE.Vector3(x,Y(aTop)+10,z));}
  arch.push(...around(AA,aTop+20,AA,DEEP-120,16,40));   // (the arch itself crosses from the heart to the edge)
  vessels.push(vessel(arch,7.5,arteryM,200));
  // the vena cava, up the other side and into the heart from behind
  const cava=around(VA,DEEP-140,VA,HD+HL*0.2,18,40);
  cava.push(new THREE.Vector3().copy(heart.position).addScaledVector(outward,-HR*0.4).add(new THREE.Vector3(0,HL*0.15,0)));
  vessels.push(vessel(cava,8,veinM,200));
  // branches off the aorta to each organ below, and a vein back from each to the cava
  const targets=[];
  const gard=P.chambers.find(c=>c.kind==='gardens');if(gard)targets.push({x:gard.x,y:gard.y+40,z:gard.z});
  for(const s of P.seas)targets.push({x:s.x,y:s.y-30,z:s.z});
  for(const pod of P.pods.slice(0,6))targets.push({x:pod.x,y:pod.y,z:pod.z});
  for(const tg of targets){
    const d=TOP-tg.y,ta=Math.atan2(tg.z-AZ,tg.x-AX);
    const go=around(AA,d-10,ta,d,16,12);go.push(new THREE.Vector3(tg.x,tg.y,tg.z));
    vessels.push(vessel(go,3.4,arteryM,80));
    const back=around(ta,d+12,VA,d+20,22,12);back.unshift(new THREE.Vector3(tg.x,tg.y-12,tg.z));
    vessels.push(vessel(back,3.2,veinM,80));
  }
  // the pulmonary trunk out to each hilum (it carries spent blood, so it is drawn blue), and the veins back
  for(const lu of P.lungs||[]){
    const d=TOP-lu.hilum.y,la=Math.atan2(lu.hilum.z-AZ,lu.hilum.x-AX);
    const out=[baseW.clone().add(new THREE.Vector3(0,10,0)),...around(HA,d+8,la,d,12,14,true)];
    vessels.push(vessel(out,5,veinM,90));
    const back=around(la,d+18,HA,HD-HL*0.3,10,14,true);back.push(heart.position.clone().add(new THREE.Vector3(0,HL*0.2,0)));
    vessels.push(vessel(back,4.4,arteryM,90));
  }
  for(const v of vessels)G.add(v);
  card({name:'The great vessels',info:'The aorta, off the top of the heart and down the outside of the shaft, with a branch into every organ below: the ballast pods, the Gift Gardens, both seas. The vena cava comes back up beside it. The pulmonary trunk carries spent blood out to each lung and the pulmonary veins bring it back. Watch any of them and a pulse runs down it with each beat. (This model\'s addition.)'},vessels);

  // ---- the nerve cord ----
  const NA=RIGHT,gangl=[],nerves=[];
  const cord=around(NA,P.D0+20,NA-0.2,DEEP-40,10,60);
  nerves.push(vessel(cord,3.2,nerveM,260));
  for(let d=P.D0+120;d<DEEP-80;d+=160){
    const a=NA-0.2*(d-P.D0-20)/(DEEP-P.D0-60),[x,z]=polar(a,wallAt(d)+10);
    gangl.push({x,y:Y(d),z,d});
    // a nerve out to the nearest organ, or into the wall if there is none close
    let best=null,bd=1e9;
    const organs=[...(P.lungs||[]).map(l=>l.hilum),heart.position,...targets.map(t=>new THREE.Vector3(t.x,t.y,t.z))];
    for(const o of organs){const dd=Math.hypot(o.x-x,o.y-Y(d),o.z-z);if(dd<bd){bd=dd;best=o;}}
    if(best&&bd<700){const mid=new THREE.Vector3((x+best.x)/2,(Y(d)+best.y)/2-20,(z+best.z)/2);
      const [ox,oz]=polar(Math.atan2(mid.z-AZ,mid.x-AX),wallAt(TOP-mid.y)+14);mid.set(ox,mid.y,oz);
      nerves.push(vessel([new THREE.Vector3(x,Y(d),z),mid,best.clone()],1.1,nerveM,24));}
  }
  for(const n of nerves)G.add(n);
  const gM=new THREE.MeshBasicMaterial({color:0xffffff});
  const gI=new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1,1),gM,gangl.length);
  {const m=new THREE.Matrix4(),c=new THREE.Color(0xfff0c0);
    gangl.forEach((g,i)=>{m.makeScale(8,6,8).setPosition(g.x,g.y,g.z);gI.setMatrixAt(i,m);gI.setColorAt(i,c);});}
  gI.frustumCulled=false;G.add(gI);
  card({name:'The nerve cord',info:'A pale cord as thick as a man, from the collar to the drain, with a ganglion every hundred and sixty metres and a nerve out of each to the nearest organ. The ganglia light as a signal passes; you can watch it run down the animal. On the night they fired all at once, and then went dark. (This model\'s addition.)'},[...nerves,gI]);

  P.group.add(G);

  // ---- alive ----
  // The heart keeps its own time: a phase that advances at the rate, and a beat in two strokes on it.
  const H={phase:0,beat:0};
  let last=performance.now();
  const gc=new THREE.Color(),dim=new THREE.Color(0x3a3020),hot=new THREE.Color(0xfff2c8),fire=new THREE.Color(0xff5a3a);
  animHooks.push(now=>{
    const dt=Math.min(0.1,(now-last)/1000);last=now;
    const HS=ctx.pitBus.signal.heart;
    H.phase+=dt*(40/60)*HS.rate;
    const f=H.phase%1;
    const lub=Math.exp(-(((f-0.08)/0.045)**2)),dub=0.6*Math.exp(-(((f-0.3)/0.045)**2));
    let c=(lub+dub)*0.07*HS.amp;
    if(HS.fib)c=HS.fib*0.02*(Math.sin(now*0.047)+Math.sin(now*0.071)+Math.sin(now*0.113))/3+c*(1-HS.fib);
    heart.scale.set(1-c,1-c*0.5,1-c);
    // the pulse down the vessels follows the beat; it fades with the heart
    PU.uPhase.value=H.phase*Math.PI*2;PU.uAmp.value=0.9*HS.amp*(1-0.7*(HS.fib||0));
    // the nerve cord: a signal every few seconds, or everything at once
    const act=ctx.pitBus.signal.nerve;
    const t=now/1000;
    for(let i=0;i<gangl.length;i++){
      const wave=Math.max(0,Math.sin(t*1.6-i*0.55));
      let k=0.25+0.75*Math.pow(wave,12);
      if(act>1)k=Math.max(k,(act-1)*(0.5+0.5*Math.sin(t*23+i*1.7)));
      k*=Math.min(1,act);
      gc.copy(dim).lerp(act>1.2?fire:hot,Math.min(1,k));gI.setColorAt(i,gc);
    }
    gI.instanceColor.needsUpdate=true;
  });

  ctx.pitBus.parts.anatomy={heart,vessels,gangl};
  ctx.details=Object.assign(ctx.details||{},{pitVessels:vessels.length,pitGanglia:gangl.length});
}
