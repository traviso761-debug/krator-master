// ---------- the Permian Basin Superorganism, from the collar down ----------
// The surface of the park is a map like any other: ground, roads, buildings, and the engine draws it. The pit
// is not. It is a shaft two and a half kilometres deep with seven named layers opening off it, and nothing
// about that is a footprint pushed upwards - so it is built here instead, from the "pit" block in
// data/cities/fleshpit.json, and handed to the engine as one of this page's extras. No other city loads a
// line of it.
//
// Fan work. Mystery Flesh Pit National Park is Trevor Roberts's project; the anatomy, the incident and the
// names are his, the geometry is this project's own, and nothing of his is used or redistributed.
//
// What gets built, top to bottom: the concrete collar; the entry tube, held open by steel stents; the Sand
// Gullet and its pumps; the Nexial Cavity, with the Lower Visitor Center hung in the middle of it on a gantry
// and eight hydraulic rams; the bronchial chambers either side; the ballast pods and the Gift Gardens; the two
// gastric seas with their ferry terminal, dam, resort shelf and the labiod junction between them; and the
// lower works over the drainage pit. Between each pair of layers is a sphincter ring.
//
// The one idea the whole park turns on is that the machinery is fighting the animal. So the animal moves and
// the machinery does not: the wall, the rings and everything growing on them breathe in a vertex shader, as a
// wave running down the shaft, and every piece of steel stays exactly where it was bolted. Where the two meet
// - the stents, the rams - the steel is what gives.
import { mkRng } from '../core/rng.js';
import { buildSprings } from './springs.js';
import { signBoard, faceTowards } from './signs.js';
import { buildLungs } from './lungs.js';

export function organism(api){
  const {THREE,C,ctx,scene,animHooks,groundH,mergeParts,LANDMARKS}=api;
  const SIG=ctx.pitBus.signal;          // what the incident is doing (src/fleshpit/bus.js)
  const K=C.pit; if(!K) return;
  const RNG=mkRng(1976);
  const [AX,AZ]=K.axis||[0,0];
  const LAYERS=K.layers||[];
  if(!LAYERS.length)return;
  const F=K.features||{};
  const DEEP=LAYERS[LAYERS.length-1].bottom;
  const TOP=K.rim!==undefined?K.rim:groundH(AX,AZ+520);   // depths in the data are metres below the plain, not below the lip
  // Where the ground stops and this takes over. The generator digs the funnel to exactly here and no further,
  // so nothing of the terrain stands between an outside camera and the shaft (see the note in make-fleshpit.py).
  const D0=K.mouthDepth||146;
  const at=d=>Math.max(D0,d);
  const THROAT=LAYERS.find(L=>L.kind==='throat');
  const CAV=THROAT&&THROAT.cavity;                 // the Nexial Cavity: where the entry tube opens out
  const [S0,S1,SP]=(THROAT&&THROAT.stents)||[0,-1,24];   // the stent hoops: first, last, spacing
  const DECK=CAV?CAV.at+15:420;                    // the Lower Visitor Center's deck
  const DI=40,DO=118;                              // ...and its inner and outer edges

  // ---- the shape of the shaft ----
  // The radius is interpolated through the layers and pinched into a sphincter at every boundary. The Nexial
  // Cavity is an ellipse let into the throat: a dome over the visitor center and a floor under it.
  const radiusAt=d=>{
    for(const L of LAYERS){
      if(d<L.top||d>L.bottom)continue;
      const t=(d-L.top)/Math.max(1,L.bottom-L.top);
      let r=L.r0+(L.r1-L.r0)*t;
      if(L.cavity){const u=(d-L.cavity.at)/(L.cavity.h/2);if(Math.abs(u)<1)r+=(L.cavity.r-r)*Math.sqrt(1-u*u);}
      const s=Math.min(1,Math.min(d-L.top,L.bottom-d)/26);     // the pinch at the ends of a layer
      return r*(0.72+0.28*s);
    }
    return d<0?LAYERS[0].r0:LAYERS[LAYERS.length-1].r1;
  };
  // Between two stents the wall bulges; at a stent it is pulled in to the hoop. m is 0 at a hoop, 1 halfway.
  const stentM=d=>(d<S0-SP/2||d>S1+SP/2)?1:Math.abs(((d-S0)/SP)-Math.floor((d-S0)/SP)-0.5)*2;
  const colourAt=d=>{
    let L=LAYERS[0];for(const q of LAYERS)if(d>=q.top)L=q;
    const c=new THREE.Color(L.colour||K.flesh||'#8c4f52');
    return c.multiplyScalar(0.52+0.48*Math.max(0,1-d/DEEP));   // the light thins with depth, but never to nothing
  };
  // The wall of the shaft, as against the radius the camera and the cards use: at the very top it flares out to
  // meet the cut edge of the ground. The plain has no floor inside the orifice (C.groundHole), so if the shaft
  // were narrower than that hole there would be a ring of daylight round the mouth with nothing behind it.
  const MOUTH_R=K.mouthRadius||(C.groundHole?C.groundHole.r+12:0);
  const wallAt=d=>{let r=radiusAt(d);
    r*=1-0.06*Math.pow(1-stentM(d),6);            // tucked in to each stent hoop
    if(!MOUTH_R||d>D0+70)return r;
    const u=Math.max(0,Math.min(1,(d-(D0-34))/104));return MOUTH_R+(r-MOUTH_R)*u;};
  const Y=depth=>TOP-depth;                        // a depth in the data is a height in the world

  // ---- breathing ----
  // Peristalsis: a wave that runs down the shaft on a twenty-two second cycle - the twenty-two minutes of the
  // card, sped up so you can see it - with a slower swell under it. The same function is written twice, once
  // here for the rams and once in GLSL for the flesh, and they must agree. BR is what the incident turns up.
  const BR={t:0,amp:K.breath||0.016,rate:1};
  const breathAt=d=>{
    const w=0.7*Math.sin(BR.t*0.2856-d*0.0045)+0.3*Math.sin(BR.t*0.11+d*0.001);
    const inS=d>=S0&&d<=S1?1:0,m=stentM(d);
    return BR.amp*w*(inS?Math.min(1,m*m*1.6):1);
  };
  const U={uT:{value:0},uAmp:{value:BR.amp},uStent:{value:new THREE.Vector4(S0,S1,SP,THROAT&&THROAT.stents?1:0)},
    uAxis:{value:new THREE.Vector2(AX,AZ)},uTop:{value:TOP}};
  let bid=0;
  function breathe(mat){
    const id='fpbreath'+(bid++);
    mat.onBeforeCompile=sh=>{
      Object.assign(sh.uniforms,U);
      sh.vertexShader=sh.vertexShader.replace('#include <common>',`#include <common>
uniform float uT;uniform float uAmp;uniform vec4 uStent;uniform vec2 uAxis;uniform float uTop;
float fpBreath(float y){float d=uTop-y;float w=0.7*sin(uT*0.2856-d*0.0045)+0.3*sin(uT*0.11+d*0.001);
 float m=abs(fract((d-uStent.x)/uStent.z)-0.5)*2.0;float inS=uStent.w*step(uStent.x,d)*step(d,uStent.y);
 return uAmp*w*mix(1.0,min(1.0,m*m*1.6),inS);}`)
      .replace('#include <project_vertex>',`vec4 fpW=modelMatrix*vec4(transformed,1.0);vec2 fpR=fpW.xz-uAxis;fpW.xz+=fpR*fpBreath(fpW.y);
vec4 mvPosition=viewMatrix*fpW;gl_Position=projectionMatrix*mvPosition;`);
    };
    mat.customProgramCacheKey=()=>id;   // one program each, so every material gets the uniforms handed to it
    return mat;
  }

  // (The wall used to carry a strata shader - muscle, sinew, bone and fat banded on the lining itself. The
  // stratified look belongs to the cut, not the lining: it is drawn on the section's cut face now, section.js.)

  // ---- materials ----
  // Flesh takes light badly: it is wet, it scatters, and almost nothing on it is a hard highlight - so a low,
  // broad sheen and never a glint. The shaft is drawn back-face only, and that is the whole trick of this page:
  // from inside you see the far wall as you should, and from outside the near wall is simply not there, so the
  // pit is its own cutaway and the seven layers can be looked at from the side like a diagram.
  const fleshM=breathe(new THREE.MeshPhongMaterial({color:new THREE.Color(K.flesh||'#8c4f52'),side:THREE.BackSide,vertexColors:true,
    emissive:0x1d090c,specular:0x3a1a1e,shininess:12}));
  const deepM=new THREE.MeshLambertMaterial({color:new THREE.Color(K.deep||'#5d2f36'),side:THREE.BackSide,emissive:0x12060a});
  const ringM=breathe(new THREE.MeshPhongMaterial({color:0x7a3f46,specular:0x40202a,shininess:26,side:THREE.DoubleSide,flatShading:true}));
  const wetM=new THREE.MeshPhongMaterial({color:0x7a3f46,specular:0x40202a,shininess:26,side:THREE.DoubleSide,flatShading:true});
  const steelM=new THREE.MeshLambertMaterial({color:0x9aa0a4});
  const darkSteelM=new THREE.MeshLambertMaterial({color:0x5e6468});
  const yellowM=new THREE.MeshLambertMaterial({color:0xd9a431});   // Anodyne's plant: rams, pumps, rigs
  const chromeM=new THREE.MeshPhongMaterial({color:0xcfd4d8,specular:0xffffff,shininess:90});
  const deckM=new THREE.MeshLambertMaterial({color:0xb8b2a4});
  const brownM=new THREE.MeshLambertMaterial({color:0x6a5040});   // Park Service brown, on everything they built
  const concreteM=new THREE.MeshLambertMaterial({color:0x9a9384});
  const collarM=new THREE.MeshLambertMaterial({color:0x9a9384,side:THREE.BackSide});   // the collar rings, cut away like the shaft
  const stentM_=new THREE.MeshLambertMaterial({color:0x8d949a,side:THREE.BackSide});  // ...and the stents, for the same reason
  // The light, by who hung it. The Park Service's strings are sodium, the colour of a highway at night; the
  // visitor center and the resort are fluorescent tubes; Anodyne's works are mercury vapour, which is bluer and
  // nobody's idea of pleasant. None of it is green, whatever the photographs say.
  const sodiumM=new THREE.MeshBasicMaterial({color:new THREE.Color(K.lit||'#ffb35c')});
  const fluorM=new THREE.MeshBasicMaterial({color:0xeef3ff});
  const mercM=new THREE.MeshBasicMaterial({color:0xd4e2ff});
  // The glow each lamp throws on the wet wall: one cloud of soft points for all of them, a radial gradient on
  // each, rather than a translucent ball per lamp - which was six hundred draw calls of octagons.
  const glowM=(()=>{const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d');
    const gr=g.createRadialGradient(32,32,0,32,32,32);gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(0.25,'rgba(255,255,255,0.45)');gr.addColorStop(1,'rgba(255,255,255,0)');
    g.fillStyle=gr;g.fillRect(0,0,64,64);
    return new THREE.PointsMaterial({color:0xffa860,map:new THREE.CanvasTexture(c),size:34,sizeAttenuation:true,transparent:true,opacity:0.5,depthWrite:false,blending:THREE.AdditiveBlending});})();
  const redM=new THREE.MeshBasicMaterial({color:0xff3b24});

  const CARDS=[];          // {name, info, y} - the layer cards, for the camera's buttons
  const parts=[];
  const box=(x,y,z,w,h,d,m)=>{const b=new THREE.Mesh(new THREE.BoxGeometry(w,h,d).translate(0,h/2,0),m);b.position.set(x,y,z);return b;};
  const polar=(a,r)=>[AX+Math.cos(a)*r,AZ+Math.sin(a)*r];
  const UP=new THREE.Vector3(0,1,0);
  // a bar from one point to another: a strut, a cable, a ramp
  function strut(a,b,w,h,m){
    const dir=new THREE.Vector3().subVectors(b,a),len=dir.length();
    const s=new THREE.Mesh(new THREE.BoxGeometry(w,len,h||w),m);
    s.position.copy(a).addScaledVector(dir,0.5);s.quaternion.setFromUnitVectors(UP,dir.normalize());return s;
  }
  // Anything with a card goes into the engine's pick list, so a click on it reads it. tag() marks things where
  // they stand; card() gathers loose parts into a group of their own first, so that at the end they can be
  // merged down by material (consolidate(), below) and still be one clickable thing.
  function tag(info,objs){for(const m of objs){m.userData.info=info;m.traverse(o=>o.userData.info=info);LANDMARKS.push(m);}return objs;}
  const cardGroups=[];
  function card(info,objs){const g=new THREE.Group();for(const o of objs)g.add(o);g.userData.info=info;cardGroups.push(g);return [g];}

  // ---- the shaft ----
  // One tube, built as a single buffer: a ring of vertices every few metres of depth, wobbled so no two rings
  // are the same. The vertex colour darkens with depth, which is what makes the shaft read as going somewhere.
  const SEG=72, STEP=6;
  {
    const pos=[],nor=[],col=[],idx=[],rings=[];
    for(let d=D0-34;d<=DEEP+140;d+=STEP){
      const r=wallAt(d),y=Y(d),c=colourAt(d),row=[];
      for(let k=0;k<SEG;k++){
        const a=k/SEG*Math.PI*2;
        // The wall is not a cylinder. It is ribbed around, lumpy down, and carried by veins - and the veins are
        // cut into the tube itself rather than stuck on it, because anything stuck on the near wall would still
        // be there in the section view, where the near wall is supposed to have gone.
        const wob=1+0.055*Math.sin(a*6+d*0.02)+0.035*Math.sin(a*11-d*0.013)+0.05*Math.sin(d*0.05+k);
        // eleven veins standing proud of it, wandering as they descend, and the hollow either side of each
        const vphase=a*11-d*0.004+1.7*Math.sin(d*0.0016);
        const vein=Math.pow(Math.max(0,Math.cos(vphase)),7);
        const groove=0.02*Math.cos(vphase*2);
        // the growth rings: a shallow crease every few metres, tighter where a sphincter is coming
        const crease=0.018*Math.sin(d*0.21)+0.012*Math.sin(d*0.63+a*2);
        const rr=r*(wob+0.075*vein-groove+crease);
        row.push(pos.length/3);
        pos.push(AX+Math.cos(a)*rr,y,AZ+Math.sin(a)*rr);
        nor.push(Math.cos(a),0,Math.sin(a));                    // outward; back-face rendering flips them for the light
        // a vein carries blood and takes the light differently; the creases between them stay dark, and the
        // flesh pressed against a stent is pale where the steel has been on it for thirty years
        const bruise=d>=S0-4&&d<=S1+4?0.22*Math.pow(1-stentM(d),8):0;
        const lit=0.82+0.5*vein-0.18*Math.max(0,-Math.cos(vphase))+0.06*Math.sin(d*0.021+a*3);
        col.push(c.r*lit+bruise*0.5,c.g*lit*(0.94+0.1*vein)+bruise*0.35,c.b*lit*(0.92+0.08*vein)+bruise*0.3);
      }
      rings.push(row);
    }
    for(let i=0;i+1<rings.length;i++)for(let k=0;k<SEG;k++){
      const a=rings[i][k],b=rings[i][(k+1)%SEG],c=rings[i+1][k],e=rings[i+1][(k+1)%SEG];
      idx.push(a,e,c,a,b,e);   // wound to face out, so that BackSide is the inside: see the note on materials
    }
    const g=new THREE.BufferGeometry();
    g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));
    g.setAttribute('normal',new THREE.Float32BufferAttribute(nor,3));
    g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));
    g.setIndex(idx);g.computeBoundingSphere();
    // the shaft breathes in the shader, so its bounds are a little bigger than its buffer says
    g.boundingSphere.radius*=1.05;
    const shaft=new THREE.Mesh(g,fleshM);shaft.frustumCulled=false;
    parts.push(shaft);
  }

  // ---- the sphincter rings between the layers ----
  // Except the first: where the collar ends the concrete does, and the throat takes over without a ring, which
  // is what lets the elevator guides come down straight. And except where the two seas meet, which is not a
  // sphincter at all but the Prime Labiod Junction, and gets built with the seas.
  const LABIOD=F.labiod&&F.labiod.depth;
  for(let i=2;i<LAYERS.length;i++){
    const d=LAYERS[i].top;if(LABIOD&&Math.abs(d-LABIOD)<2)continue;
    const r=radiusAt(d);
    const t=new THREE.Mesh(new THREE.TorusGeometry(r*0.92,r*0.22,8,SEG),ringM);
    t.rotation.x=Math.PI/2;t.position.set(AX,Y(d),AZ);parts.push(t);
  }
  if(LAYERS[1]){const d=LAYERS[1].top,r=radiusAt(d);        // the lip of the collar: the last of the concrete
    const lip=new THREE.Mesh(new THREE.CylinderGeometry(r*1.02,r*0.96,8,SEG,1,true),collarM);
    lip.position.set(AX,Y(d)+4,AZ);parts.push(lip);}

  const lamps=[],glows=[],movers=[];   // everything that lights, glows or moves, collected as it is built
  const fine=[];                       // the growth on the wall: only shown from inside the shaft

  // ---- what grows on the wall ----
  // Polyps in clusters, strands hanging between the rings, and a crease of harder tissue every hundred metres
  // or so. All of it is merged into one mesh per material - a thousand little spheres at one draw call - and
  // all of it breathes and is back-faced like the wall it grows on, so the section view stays a section.
  {
    const lumpM=breathe(new THREE.MeshLambertMaterial({color:new THREE.Color(K.flesh||'#8c4f52'),side:THREE.BackSide,emissive:0x1a080b,flatShading:true}));
    const cordM=breathe(new THREE.MeshLambertMaterial({color:0x6d3339,side:THREE.BackSide,flatShading:true}));
    const lumps=[],cords=[];
    for(let c=0;c<240;c++){                       // a cluster, and then the polyps in it
      const cd=D0+RNG()*(DEEP-D0),ca=RNG()*Math.PI*2;
      for(let k=0;k<6;k++){
        const d=cd+(RNG()-0.5)*70,a=ca+(RNG()-0.5)*0.4,rr=wallAt(d),R0=1.6+RNG()*5;
        const m=new THREE.Mesh(new THREE.SphereGeometry(R0,6,5),lumpM);
        m.scale.set(1,0.7+RNG()*0.6,0.8+RNG()*0.4);
        m.position.set(AX+Math.cos(a)*(rr-R0*0.35),Y(d),AZ+Math.sin(a)*(rr-R0*0.35));
        lumps.push(m);
      }
    }
    for(let k=0;k<260;k++){                       // strands: they hang off the wall and sway
      const d=D0+RNG()*(DEEP-D0),a=RNG()*Math.PI*2,rr=wallAt(d),len=12+RNG()*90;
      const m=new THREE.Mesh(new THREE.CylinderGeometry(0.5+RNG()*1.4,0.12,len,5).translate(0,-len/2,0),cordM);
      m.position.set(AX+Math.cos(a)*(rr-2),Y(d),AZ+Math.sin(a)*(rr-2));
      m.rotation.set((RNG()-0.5)*0.5,RNG()*3,(RNG()-0.5)*0.5);
      cords.push(m);
    }
    fine.push(mergeParts(lumps,lumpM),mergeParts(cords,cordM));
    // the hard rings: a crease of tougher tissue between the sphincters, which is what gives the shaft its scale
    const ribs=[];
    for(let d=D0+60;d<DEEP;d+=118){
      if(d>S0-10&&d<S1+10)continue;               // where the stents are, the steel is the ribbing
      const rr=wallAt(d);
      const t=new THREE.Mesh(new THREE.TorusGeometry(rr*0.985,rr*0.045,6,40),ringM);
      t.rotation.x=Math.PI/2;t.position.set(AX,Y(d),AZ);ribs.push(t);
    }
    if(ribs.length)parts.push(mergeParts(ribs,ringM));
    // Deeper, the wall carries bone and tendon you can see standing out of it: ribs - arcs of bone set into the
    // wall, more and heavier the deeper you go - and tendons strung taut across it between them.
    const boneM=breathe(new THREE.MeshPhongMaterial({color:0xd8ccb0,specular:0x806a50,shininess:22,side:THREE.DoubleSide,emissive:0x1a140c}));
    const tendonM=breathe(new THREE.MeshPhongMaterial({color:0xe6dcd4,specular:0xffffff,shininess:60,emissive:0x18120e}));
    const bones=[],tendons=[];
    for(let d=D0+220;d<DEEP-20;d+=24){
      const deep=(d-D0)/(DEEP-D0);
      if(RNG()>0.25+0.7*deep)continue;
      const rr=wallAt(d)*0.99,arcL=0.5+RNG()*(0.8+deep),th=1.4+deep*3.4+RNG()*1.2,a0=RNG()*Math.PI*2;
      const t=new THREE.Mesh(new THREE.TorusGeometry(rr,th,6,Math.max(6,Math.round(arcL*20)),arcL),boneM);
      t.rotation.set(Math.PI/2,0,a0);t.position.set(AX,Y(d),AZ);bones.push(t);
      if(RNG()<0.35+0.5*deep){                                 // a tendon from this rib to the next one down
        const d2=d+18+RNG()*40,a1=a0+(RNG()-0.2)*arcL,a2=a1+(RNG()-0.5)*0.6;
        const [x1,z1]=polar(a1,wallAt(d)*0.965),[x2,z2]=polar(a2,wallAt(d2)*0.965);
        tendons.push(strut(new THREE.Vector3(x1,Y(d),z1),new THREE.Vector3(x2,Y(d2),z2),0.6+deep*1.4,0.6+deep*1.4,tendonM));
      }
    }
    if(bones.length)fine.push(mergeParts(bones,boneM));
    if(tendons.length)fine.push(mergeParts(tendons,tendonM));
  }

  // ---- the lamp strings ----
  // Four of them, hung from the collar and running the whole way down, because this is a national park and the
  // Park Service lit it: a cable, a lamp every forty metres, and the glow each one throws on the wall.
  for(let q=0;q<4;q++){
    const a0=0.8+q*Math.PI/2;
    const cable=[];
    for(let d=D0;d<DEEP;d+=40){
      const a=a0+0.35*Math.sin(d*0.0012+q),rr=wallAt(d)*0.93;
      const x=AX+Math.cos(a)*rr,z=AZ+Math.sin(a)*rr;
      cable.push(new THREE.Vector3(x,Y(d),z));
      const lp=new THREE.Mesh(new THREE.SphereGeometry(1.8,6,5),sodiumM);lp.position.set(x,Y(d),z);
      parts.push(lp);lamps.push(lp);
      glows.push(x,Y(d),z);
    }
    if(cable.length>1)parts.push(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(cable),cable.length*2,0.5,4,false),steelM));
  }

  // ---- the fittings the Park Service put in ----
  // a boardwalk: a continuous deck run between two angles at one depth, on posts, with cross-beams under it
  function walk(d,a0,a1,rad,w){
    const out=[],n=Math.max(2,Math.round(Math.abs(a1-a0)*rad/6)),seg=Math.abs(a1-a0)*rad/n;
    for(let k=0;k<n;k++){
      const a=a0+(a1-a0)*(k+0.5)/n,[x,z]=polar(a,rad);
      const b=box(x,Y(d)-0.4,z,w,0.5,seg*1.04,deckM);b.rotation.y=-a;out.push(b);
      if(k%3===0){for(const sd of [-1,1]){const [px,pz]=polar(a,rad+sd*(w/2-0.4));out.push(box(px,Y(d)-5,pz,0.5,4.6,0.5,steelM));}
        const cb=box(x,Y(d)-0.9,z,w,0.4,0.4,steelM);cb.rotation.y=-a;out.push(cb);}
    }
    return out;
  }
  // A handrail along an arc, which is what makes a deck read as somewhere people were allowed to stand.
  function rail(d,a0,a1,rad,h){
    const out=[],n=Math.max(2,Math.round(Math.abs(a1-a0)*rad/12));
    for(let k=0;k<=n;k++){
      const a=a0+(a1-a0)*k/n,[x,z]=polar(a,rad);
      out.push(box(x,Y(d),z,0.35,h||1.1,0.35,steelM));
      if(k<n){const a2=a0+(a1-a0)*(k+1)/n,[x2,z2]=polar(a2,rad);
        const len=Math.hypot(x2-x,z2-z),bar=new THREE.Mesh(new THREE.BoxGeometry(len,0.12,0.12),steelM);
        bar.position.set((x+x2)/2,Y(d)+(h||1.1),(z+z2)/2);bar.rotation.y=-Math.atan2(z2-z,x2-x);out.push(bar);}
    }
    return out;
  }
  // An interpretive sign: a lettered board on two legs, lit, turned to face the axis. What it says comes from
  // the layer's "signs" in the data, in turn; a layer with none gets a plain board.
  const signCount=new Map();
  function sign(d,a,rad,L,style){
    const list=(L&&L.signs)||[],n=signCount.get(L)||0;signCount.set(L,n+1);
    const lines=list.length?list[n%list.length]:['MYSTERY FLESH PIT',''];
    const [x,z]=polar(a,rad);
    const b=signBoard(THREE,lines,{style:style||(/ANODYNE|PERSONNEL|HARD HAT|CREW/.test(lines.join(' '))?'company':'nps'),w:4.6,h:2.3});
    b.position.set(x,Y(d)+2.6,z);b.rotation.y=faceTowards(x,z,AX,AZ);
    lamps.push(b);
    return [b,box(x-Math.cos(a+1.57)*1.8,Y(d),z-Math.sin(a+1.57)*1.8,0.25,1.6,0.25,brownM),
      box(x+Math.cos(a+1.57)*1.8,Y(d),z+Math.sin(a+1.57)*1.8,0.25,1.6,0.25,brownM)];
  }
  // ---- a chamber opening off the shaft: a flattened sphere pushed out sideways ----
  function chamber(d,ang,R,H,mat){
    const m=new THREE.Mesh(new THREE.SphereGeometry(1,24,16),mat||deepM);
    const r=radiusAt(d);
    m.position.set(AX+Math.cos(ang)*(r*0.55+R*0.45),Y(d),AZ+Math.sin(ang)*(r*0.55+R*0.45));
    m.scale.set(R,H/2,R*0.86);
    return m;
  }

  // ---- the lifts ----
  // Two sets. Four cages from the headframes on the rim down the entry tube to the visitor center deck, on
  // guides that hang straight through the stents; and two from the deck on down past the forests, on guides in
  // the open well with a catwalk out to each.
  const cages=[];
  const RGU=56,RGL=24;
  for(let k=0;k<4;k++){
    const a=0.5+k*Math.PI/2,[x,z]=polar(a,RGU);
    parts.push(box(x,Y(DECK),z,1.6,Y(at(0))-Y(DECK)+30,1.6,steelM));
    cages.push({a,r:RGU,hi:at(0)+4,lo:DECK-1,ph:k*1.9,w:9});
  }
  const LIFT_BOT=1100;
  for(let k=0;k<2;k++){
    const a=1.3+k*Math.PI,[x,z]=polar(a,RGL);
    parts.push(box(x,Y(LIFT_BOT+20),z,1.4,LIFT_BOT-DECK+40,1.4,steelM));
    cages.push({a,r:RGL,hi:DECK-1,lo:LIFT_BOT,ph:k*2.7+0.6,w:7});
  }
  for(const c of cages){
    const g=new THREE.Group();
    g.add(new THREE.Mesh(new THREE.BoxGeometry(c.w,c.w*1.3,c.w).translate(0,-c.w*0.65,0),steelM));
    const light=new THREE.Mesh(new THREE.BoxGeometry(c.w*0.8,1.4,0.4),fluorM);light.position.set(0,-2,c.w/2+0.1);g.add(light);
    g.add(new THREE.Mesh(new THREE.BoxGeometry(c.w+2,1,c.w+2),yellowM));
    g.rotation.y=-c.a+Math.PI/2;c.g=g;parts.push(g);
  }

  // ---- the layers ----
  let LVC=null,LVC_PIVOT=null;const rams=[];
  const seas=[],chambersOut=[],pods=[],lungsOut=[],stands=[],cavities=[];let lungFluid=null;   // cavities: for the section's cut (section.js)
  LAYERS.forEach(L=>{
    const mid=(L.top+L.bottom)/2;
    CARDS.push({name:L.name,info:L.info||'',depth:mid,top:L.top,bottom:L.bottom});

    // the lamps the Park Service scattered on the wall, tight together where people walked
    const n=L.kind==='works'||L.kind==='collar'?26:16;
    const lm=L.kind==='works'?mercM:sodiumM;
    for(let k=0;k<n;k++){
      const d=at(L.top+(L.bottom-L.top)*(k+0.5)/n),a=RNG()*Math.PI*2,rr=wallAt(d)*0.94;
      const lp=new THREE.Mesh(new THREE.SphereGeometry(1.5,6,5),lm);
      lp.position.set(AX+Math.cos(a)*rr,Y(d),AZ+Math.sin(a)*rr);parts.push(lp);lamps.push(lp);
      glows.push(lp.position.x,lp.position.y,lp.position.z);
    }

    if(L.kind==='collar'){
      // the poured collar, its ring beams, and the switchback ramp inside it
      for(let k=0;k<7;k++){
        const d=at(L.top+(L.bottom-L.top)*k/6),rr=radiusAt(d);
        const ring=new THREE.Mesh(new THREE.CylinderGeometry(rr*1.02,rr*1.02,5,SEG,1,true),collarM);
        ring.position.set(AX,Y(d),AZ);parts.push(ring);
      }
      for(let k=0;k<26;k++){
        const d=at(L.top+(L.bottom-L.top)*k/26),a=k*0.62,[x,z]=polar(a,radiusAt(d)*0.93);
        const s=box(x,Y(d),z,16,1.2,7,deckM);s.rotation.y=-a;parts.push(s);
      }
      // the gallery these landings open on to: a walkway the whole way round the inside of the collar
      {const gd=at(L.top)+6,gr=radiusAt(gd)*0.9;
       parts.push(...walk(gd,0,Math.PI*2,gr,5),...rail(gd,0,Math.PI*2,gr-2.6,1.1));
       stands.push({kind:'gallery',path:Array.from({length:73},(_,k)=>{const [x,z]=polar(k/72*Math.PI*2,gr);return [x,Y(gd)+0.1,z];}),n:120,
         exits:[0,1,2,3].map(k=>polar(0.5+k*Math.PI/2,RGU))});}
      for(const q of rail(at(L.top)+2,0,Math.PI*2,wallAt(at(L.top))*0.985,1.2))parts.push(q);
      // what it says on the way in
      for(let k=0;k<5;k++)for(const q of sign(at(L.top)+4+k*2,0.9+k*1.3,wallAt(at(L.top)+4+k*2)*0.84,L))parts.push(q);
      // the gantry across the mouth that the cages hang from, and its winch houses
      for(let k=0;k<2;k++){
        const a=0.5+k*Math.PI/2;
        const beam=new THREE.Mesh(new THREE.BoxGeometry(wallAt(at(L.top))*2.1,3,5),darkSteelM);
        beam.position.set(AX,Y(at(L.top))+6,AZ);beam.rotation.y=-a;parts.push(beam);
        for(const sd of [1,-1]){const [x,z]=polar(a+(sd<0?Math.PI:0),RGU);
          const w=box(x,Y(at(L.top))+7.5,z,10,5,8,yellowM);w.rotation.y=-a;parts.push(w);}
      }
    }

    if(L.kind==='throat'){
      // ---- the entry tube: the stents ----
      // A steel hoop every SP metres, cleated into the wall, with the tension cables of the retaining frame run
      // down between them. The wall is pulled in to each hoop (wallAt) and bulges between; in the shader the
      // bulge is what breathes and the hoop is what holds.
      const hoops=[],cleats=[];
      for(let d=S0;d<=S1;d+=SP){
        const r=radiusAt(d)*0.94-0.4;
        const h=new THREE.Mesh(new THREE.CylinderGeometry(r,r,2.6,SEG,1,true),stentM_);h.position.set(AX,Y(d),AZ);hoops.push(h);
        for(let k=0;k<12;k++){const a=k/12*Math.PI*2+0.13,[x,z]=polar(a,r+0.6);
          const c=box(x,Y(d)-1.8,z,1.2,3.6,2.2,darkSteelM);c.rotation.y=-a;cleats.push(c);}
      }
      parts.push(mergeParts(cleats,darkSteelM));
      const cables=[];
      for(let k=0;k<8;k++){const a=k/8*Math.PI*2+0.39;
        for(let d=S0;d+SP<=S1;d+=SP){
          const [x0,z0]=polar(a,radiusAt(d)*0.94-1.2),[x1,z1]=polar(a,radiusAt(d+SP)*0.94-1.2);
          cables.push(strut(new THREE.Vector3(x0,Y(d),z0),new THREE.Vector3(x1,Y(d+SP),z1),0.35,0.35,darkSteelM));}}
      fine.push(mergeParts(cables,darkSteelM));
      parts.push(...card({name:'The entry tube',info:'Steel stent hoops every '+SP+' m, cleated into the wall, with tension cables run between them: the only thing keeping the throat open. The investigation found the cables corroded through. The flesh round each hoop is pale where the steel has pressed on it since 1976.'},hoops));

      // ---- the Sand Gullet ----
      // A ledge on the wall near the bottom of the stents, the three pumps that kept it dry, and the discharge
      // pipes running back up to the collar. Two lost power on the night; the third had seized.
      if(F.gullet){
        const d=Math.min(F.gullet.depth||280,S1-10),a0=3.6,rr=wallAt(d)*0.9,G=[];
        G.push(...walk(d,a0-0.45,a0+0.45,rr,7),...rail(d,a0-0.45,a0+0.45,rr-3.8,1.1));
        for(let k=0;k<3;k++){const a=a0-0.3+k*0.3,[x,z]=polar(a,rr+1);
          const p=box(x,Y(d)+0.2,z,7,5,6,yellowM);p.rotation.y=-a;G.push(p);
          const m=new THREE.Mesh(new THREE.CylinderGeometry(1.6,1.6,4,10),darkSteelM);m.position.set(x,Y(d)+7,z);G.push(m);
          const [px,pz]=polar(a,wallAt(d)*0.97);
          G.push(box(px,Y(d),pz,1.2,d-at(0),1.2,darkSteelM));   // the discharge, up the wall to the collar
          const bea=new THREE.Mesh(new THREE.SphereGeometry(0.8,6,5),redM);bea.position.set(x,Y(d)+10,z);G.push(bea);
          if(k<2)movers.push({m:bea,kind:'strobe',ph:k*400});}
        const grate=new THREE.Mesh(new THREE.RingGeometry(rr-6,rr+2,24,1,-(a0+0.4),0.8),new THREE.MeshLambertMaterial({color:0x4a4e52,side:THREE.DoubleSide}));
        grate.rotation.x=-Math.PI/2;grate.position.set(AX,Y(d+6),AZ);G.push(grate);
        for(const q of sign(d,a0+0.5,rr-4,L,'company'))G.push(q);
        parts.push(...card(F.gullet,G));
        {const [cx,cz]=polar(a0,rr-2);stands.push({kind:'crew',x:cx,y:Y(d),z:cz,spread:10,n:7,crew:true});}
      }

      // ---- the Lower Visitor Center, hung in the Nexial Cavity ----
      // It is a shopping mall on a steel doughnut four hundred metres down a living shaft, and the point of
      // drawing it at all is that it looks like one: lit shopfronts, a rail you can lean on, stair towers, the
      // cantilevered overlook everybody queued for. It does not touch the wall. It hangs from a ring gantry by
      // eight cables, and eight rams brace it sideways against the cavity, taking up the breath.
      const lvc=[],d=DECK,info={name:'Lower Visitor Center',info:L.info};
      const deckMesh=new THREE.Mesh(new THREE.RingGeometry(DI,DO,SEG,1),new THREE.MeshLambertMaterial({color:0xb8b2a4,side:THREE.DoubleSide}));
      deckMesh.rotation.x=-Math.PI/2;deckMesh.position.set(AX,Y(d),AZ);lvc.push(deckMesh);
      const under=new THREE.Mesh(new THREE.CylinderGeometry(DO,DO*0.9,7,SEG,1,true),darkSteelM);under.position.set(AX,Y(d)-3.5,AZ);lvc.push(under);
      const underIn=new THREE.Mesh(new THREE.CylinderGeometry(DI,DI*1.05,7,SEG,1,true),darkSteelM);underIn.position.set(AX,Y(d)-3.5,AZ);lvc.push(underIn);
      lvc.push(...rail(d,0,Math.PI*2,DI+0.5,1.1),...rail(d,0,Math.PI*2,DO-0.5,1.1));
      const RS=(DI+DO)/2;
      // ---- the shops ----
      // Twenty-two units round the ring, two floors each, every one of them a real business with a name over the
      // door: a storefront of lit glass and an awning on the outer concourse, a window and a small sign on the
      // inner one, and the offices and staff rooms upstairs. The list is in the data (pit.shops); what they sell
      // is the park's joke - it is a mall, four hundred metres down, and it is exactly like any other mall.
      const SHOPS=(K.shops&&K.shops.length)?K.shops:[['GIFT SHOP','',0x8a2a24,0xe8d8b0]];
      const NU=22,shopMats=new Map();
      const tint=c=>{if(!shopMats.has(c))shopMats.set(c,new THREE.MeshLambertMaterial({color:c}));return shopMats.get(c);};
      const furn=[];   // benches, planters, lamp posts, bins: merged with the deck
      for(let k=0;k<NU;k++){
        const a=(k+0.5)/NU*Math.PI*2,S=SHOPS[k%SHOPS.length],[name,sub,awn,face]=S;
        if([1.1,3.2,5.3].some(t=>Math.abs(Math.atan2(Math.sin(a-t),Math.cos(a-t)))<0.16))continue;   // where the stair towers stand
        const [x,z]=polar(a,RS),tang=-a+Math.PI/2;
        const b=box(x,Y(d),z,15,6.4,12,tint(face));b.rotation.y=tang;lvc.push(b);
        const up=box(x,Y(d)+6.4,z,14.4,5,11.4,k%2?deckM:concreteM);up.rotation.y=tang;lvc.push(up);
        const cornice=box(x,Y(d)+11.4,z,15.2,0.6,12.2,brownM);cornice.rotation.y=tang;lvc.push(cornice);
        for(const sd of [1,-1]){
          const [wx,wz]=polar(a,RS+sd*6.05);
          const glassFront=box(wx,Y(d)+0.2,wz,sd>0?12:9,sd>0?3.6:2.4,0.3,fluorM);glassFront.rotation.y=tang;lvc.push(glassFront);lamps.push(glassFront);
          const w2=box(wx,Y(d)+8,wz,12,1.8,0.3,fluorM);w2.rotation.y=tang;lvc.push(w2);lamps.push(w2);
          if(sd>0){
            // the awning, sloping out over the concourse, and the name on the fascia above it
            const [ax2,az2]=polar(a,RS+7.4);
            const aw=new THREE.Mesh(new THREE.BoxGeometry(14,0.25,3),tint(awn));aw.position.set(ax2,Y(d)+4.3,az2);
            aw.rotation.order='YXZ';aw.rotation.y=tang;aw.rotation.x=0.35;lvc.push(aw);
            const [sx2,sz2]=polar(a,RS+6.3);
            const sg=signBoard(THREE,[name,sub],{w:12.5,h:1.7,style:['#'+face.toString(16).padStart(6,'0'),'#'+awn.toString(16).padStart(6,'0'),'#'+awn.toString(16).padStart(6,'0')]});
            sg.position.set(sx2,Y(d)+5.6,sz2);sg.rotation.y=faceTowards(sx2,sz2,AX+Math.cos(a)*(RS+50),AZ+Math.sin(a)*(RS+50));lvc.push(sg);lamps.push(sg);
          }else{
            const [sx2,sz2]=polar(a,RS-6.3);
            const sg=signBoard(THREE,[name,''],{w:6,h:1,style:['#'+face.toString(16).padStart(6,'0'),'#'+awn.toString(16).padStart(6,'0'),'#'+awn.toString(16).padStart(6,'0')]});
            sg.position.set(sx2,Y(d)+3.2,sz2);sg.rotation.y=faceTowards(sx2,sz2,AX,AZ);lvc.push(sg);lamps.push(sg);
          }
        }
        // out on the concourse in front of it: a lamp post with two globes, and a bench or a planter or a cart
        {const [lx,lz]=polar(a+Math.PI/NU,RS+17);furn.push(box(lx,Y(d),lz,0.25,4.2,0.25,darkSteelM));
         const gl=box(lx,Y(d)+4.2,lz,1.4,0.5,0.5,fluorM);gl.rotation.y=tang;lvc.push(gl);lamps.push(gl);}
        const [fx,fz]=polar(a,RS+22);
        if(S[4]==='food'){                                     // café tables with umbrellas outside the food places
          for(let q=0;q<3;q++){const [tx,tz]=polar(a+(q-1)*0.045,RS+20+(q%2)*6);
            furn.push(box(tx,Y(d),tz,1.3,0.8,1.3,deckM),box(tx,Y(d),tz,0.1,2.6,0.1,darkSteelM));
            const u=new THREE.Mesh(new THREE.ConeGeometry(1.7,0.7,8),tint(awn));u.position.set(tx,Y(d)+2.9,tz);lvc.push(u);}
        }else if(k%3===0){const pl=box(fx,Y(d),fz,4,0.9,2,concreteM);pl.rotation.y=tang;furn.push(pl);
          const sh=new THREE.Mesh(new THREE.IcosahedronGeometry(1.3,0),wetM);sh.position.set(fx,Y(d)+1.6,fz);lvc.push(sh);}   // the planters grow what grows down here
        else if(k%3===1){const bn=box(fx,Y(d),fz,4,0.45,0.7,brownM);bn.rotation.y=tang;furn.push(bn);}
        else{const cart=box(fx,Y(d),fz,2.2,1.1,1.4,tint(awn));cart.rotation.y=tang;lvc.push(cart);
          const u=new THREE.Mesh(new THREE.ConeGeometry(1.5,0.6,6),tint(face));u.position.set(fx,Y(d)+2.8,fz);lvc.push(u);furn.push(box(fx,Y(d),fz,0.08,2.6,0.08,darkSteelM));}
        // and on the inner concourse: a bench facing the well, every other unit a coin telescope pointing down it
        {const [bx2,bz2]=polar(a,DI+6);const bn=box(bx2,Y(d),bz2,4,0.45,0.7,brownM);bn.rotation.y=tang;furn.push(bn);
         if(k%2===0){const [tx,tz]=polar(a+0.08,DI+2.2);furn.push(box(tx,Y(d),tz,0.2,1.1,0.2,darkSteelM));
           const sc=new THREE.Mesh(new THREE.CylinderGeometry(0.18,0.24,0.9,8).rotateX(Math.PI/2+0.7),new THREE.MeshLambertMaterial({color:0x3a6a5a}));
           sc.position.set(tx,Y(d)+1.4,tz);sc.rotation.y=tang;lvc.push(sc);}}
      }
      // the emergency phones on the outer rail, blue, lit, one every eighth of the way round
      for(let k=0;k<8;k++){const a=k/8*Math.PI*2+0.1,[px,pz]=polar(a,DO-2.5);
        furn.push(box(px,Y(d),pz,0.25,1.6,0.25,darkSteelM));
        const ph=box(px,Y(d)+1.6,pz,0.7,0.9,0.5,new THREE.MeshBasicMaterial({color:0x3a78e0}));lvc.push(ph);}
      // the information kiosk, where the stair towers are not
      {const [ix,iz]=polar(0.2,RS+24);const kiosk=new THREE.Mesh(new THREE.CylinderGeometry(3,3,3,12),brownM);kiosk.position.set(ix,Y(d)+1.5,iz);lvc.push(kiosk);
       const cap=new THREE.Mesh(new THREE.ConeGeometry(4.2,1.4,12),deckM);cap.position.set(ix,Y(d)+3.7,iz);lvc.push(cap);
       const sg=signBoard(THREE,['INFORMATION','Lost & found · Tours · First aid'],{w:5,h:1.4});sg.position.set(ix,Y(d)+5.2,iz);sg.rotation.y=faceTowards(ix,iz,AX,AZ)+Math.PI;lvc.push(sg);lamps.push(sg);}
      lvc.push(...furn);
      for(let k=0;k<3;k++){                                      // the stair towers, and a roof garden on one
        const a=1.1+k*2.1,[x,z]=polar(a,RS);
        const tow=box(x,Y(d)-1,z,10,26,10,brownM);tow.rotation.y=-a;lvc.push(tow);
        const cap=box(x,Y(d)+25,z,13,2,13,deckM);cap.rotation.y=-a;lvc.push(cap);
      }
      {                                                          // the overlook, out over the drop
        const a=2.35,len=38,[x,z]=polar(a,DO);
        const arm=new THREE.Mesh(new THREE.BoxGeometry(len,1.2,12).translate(len/2,0,0),deckM);
        arm.position.set(x,Y(d)-0.6,z);arm.rotation.y=-a;lvc.push(arm);
        lvc.push(...rail(d,a-0.05,a+0.05,DO+len-1,1.2));
        const [sx,sz]=polar(a,DO+len-4);
        const b=signBoard(THREE,(L.signs&&L.signs[1])||['STAY BEHIND THE RAIL',''],{w:4.6,h:2.3});
        b.position.set(sx,Y(d)+2.4,sz);b.rotation.y=faceTowards(sx,sz,AX,AZ);lvc.push(b);lamps.push(b);
      }
      for(let k=0;k<2;k++){                                      // catwalks in to the two lower lifts
        const a=1.3+k*Math.PI;
        const [x0,z0]=polar(a,RGL+4),[x1,z1]=polar(a,DI+1);
        lvc.push(strut(new THREE.Vector3(x0,Y(d)-0.4,z0),new THREE.Vector3(x1,Y(d)-0.4,z1),3,0.6,deckM));
      }
      for(let k=0;k<3;k++)for(const q of sign(d,0.6+k*2.1,RS+7,L))lvc.push(q);
      // who was on it: the concourse between the shops and either rail, and the queue out on the overlook
      stands.push({kind:'deck',lvc:true,y:Y(d),rIn:DI+2,rOut:DO-2,avoid:[RS-7,RS+7],n:460,
        exits:[0,1,2].map(k=>polar(1.1+k*2.1,RS))});
      {const [ox,oz]=polar(2.35,DO+24);stands.push({kind:'overlook',lvc:true,x:ox,y:Y(d),z:oz,spread:9,n:36});}
      // the ramps down to the trailheads, which open off the cavity wall below the deck
      const TH=d+52;
      for(let k=0;k<4;k++){
        const a=0.1+k*Math.PI/2,rw=wallAt(TH);
        const [x0,z0]=polar(a,DO-2),[x1,z1]=polar(a,rw-3);
        lvc.push(strut(new THREE.Vector3(x0,Y(d)-0.5,z0),new THREE.Vector3(x1,Y(TH),z1),4,0.8,deckM));
        const t=new THREE.Mesh(new THREE.CylinderGeometry(8,8,20,12,1,true),concreteM);
        const [tx,tz]=polar(a,rw+4);t.position.set(tx,Y(TH)+4,tz);t.rotation.z=Math.PI/2;t.rotation.y=-a;parts.push(t);
        const tl=box(tx-Math.cos(a)*9,Y(TH)+10,tz-Math.sin(a)*9,5,1,1,sodiumM);tl.rotation.y=-a+Math.PI/2;parts.push(tl);lamps.push(tl);
      }
      // the gantry: a ring truss braced into the dome of the cavity, and the eight cables the deck hangs from
      const GD=CAV?CAV.at-CAV.h*0.32:d-80,GR=DO-6;
      const gantry=[];
      const gring=new THREE.Mesh(new THREE.TorusGeometry(GR,1.8,6,SEG),darkSteelM);gring.rotation.x=Math.PI/2;gring.position.set(AX,Y(GD),AZ);gantry.push(gring);
      for(let k=0;k<8;k++){
        const a=k/8*Math.PI*2+0.2,rw=wallAt(GD);
        const [x0,z0]=polar(a,GR),[x1,z1]=polar(a,rw+2);
        gantry.push(strut(new THREE.Vector3(x0,Y(GD),z0),new THREE.Vector3(x1,Y(GD)+14,z1),2.4,2.4,darkSteelM));
        const [cx,cz]=polar(a,GR);
        lvc.push(strut(new THREE.Vector3(cx,Y(GD),cz),new THREE.Vector3(cx,Y(d)+12,cz),0.5,0.5,steelM));
      }
      parts.push(...card({name:'The gantry',info:'The ring truss the Lower Visitor Center hung from, braced into the dome of the Nexial Cavity. Its base joint was designed to flex eight degrees. On the night it flexed further.'},gantry));
      // the rams: a barrel on the wall and a rod on the deck, eight of them, sliding in and out with the breath
      const barrels=[];
      for(let k=0;k<8;k++){
        const a=k/8*Math.PI*2+0.59,rw=wallAt(d),BL=26;
        const [rx,rz]=polar(a,DO);
        const rod=new THREE.Mesh(new THREE.CylinderGeometry(0.9,0.9,rw-DO-BL+8,10).rotateZ(Math.PI/2).translate((rw-DO-BL+8)/2,0,0),chromeM);
        rod.position.set(rx,Y(d)-2,rz);rod.rotation.y=-a;lvc.push(rod);
        const barrel=new THREE.Group();
        barrel.add(new THREE.Mesh(new THREE.CylinderGeometry(2.2,2.2,BL,12).rotateZ(Math.PI/2),yellowM));
        barrel.add(new THREE.Mesh(new THREE.BoxGeometry(4,7,7).translate(BL/2+1,0,0),darkSteelM));   // the wall mount
        barrel.rotation.y=-a;barrels.push(barrel);
        rams.push({g:barrel,a,r0:rw-BL/2,d});
      }
      parts.push(...card({name:'The rams',info:'Eight hydraulic rams between the deck and the cavity wall, each one sliding in and out all day to hold the Lower Visitor Center level while the wall breathed round it. When the power went at 21:48 they stopped holding.'},barrels));
      // the deck goes in a group of its own on a pivot at its centre, so the night can tip it and let it go
      LVC_PIVOT=new THREE.Group();LVC_PIVOT.position.set(AX,Y(d),AZ);
      LVC=new THREE.Group();LVC.position.set(-AX,-Y(d),-AZ);LVC_PIVOT.add(LVC);
      for(const m of lvc)LVC.add(m);
      tag(info,[LVC]);
    }

    if(L.kind==='bronchial'){
      // The forests are the organism's lungs: the shaft is its windpipe, and a main bronchus leaves the wall on
      // each side and branches through a lung until every twig ends in air sacs. See lungs.js.
      const LU=buildLungs({THREE,RNG,AX,AZ,Y,radiusAt,mergeParts,top:L.top,bottom:L.bottom});
      for(const lu of LU.lungs){
        parts.push(lu.g);
        tag({name:lu.left?'The south lung':'The north lung',info:(lu.left?'Two lobes and a notch where the organism\'s heart presses in. ':'Three lobes, the upper one the size of a stadium. ')+
          'What the park sold as the Bronchial Forests are the airways of this lung, seen from inside: a main bronchus off the shaft wall that divides '+lu.segments+' times on its way out, cartilage rings on the big branches, the pulmonary artery and vein either side, and at the end of every twig a bunch of glossy air sacs. The whole lung fills and empties on the breath.'},[lu.g]);
        cavities.push({kind:'ell',c:lu.centre.clone(),r:[lu.A,lu.H/2,lu.A*0.82]});
        chambersOut.push({kind:'bronchial',side:lu.side,x:lu.centre.x,y:lu.centre.y,z:lu.centre.z,R:lu.A,H:lu.H,perches:lu.perches});
        movers.push({m:null,kind:'lung',lu});
        if(lu.acini&&F.bulbules)lu.acini.userData.info=F.bulbules;
      }
      lungsOut.push(...LU.lungs);lungFluid=LU.fluidU;
      movers.push({m:null,kind:'bulb',mat:LU.acinusM});
      for(const side of [0,Math.PI]){
        // the boardwalk loop through the near half of the lung, its rail, and what it is all for: a platform out
        // among the airways with a sign on it
        const bd=L.top+150,brad=radiusAt(bd)+90;
        parts.push(...walk(bd,side-0.7,side+0.7,brad,4),...rail(bd,side-0.7,side+0.7,brad+2.2,1.1),...rail(bd,side-0.7,side+0.7,brad-2.2,1.1));
        stands.push({kind:'boardwalk',d:bd,a0:side-0.65,a1:side+0.65,r:brad,n:70});
        {const pa=side+0.28,[px,pz]=polar(pa,brad+26),plat=box(px,Y(bd)-0.6,pz,22,0.9,16,deckM);
         plat.rotation.y=-pa;parts.push(plat);
         parts.push(...rail(bd,pa-0.16,pa+0.16,brad+33,1.1),...sign(bd,pa,brad+20,L));
         parts.push(box(px,Y(bd)-26,pz,0.8,26,0.8,steelM));
         stands.push({kind:'platform',x:px,y:Y(bd),z:pz,spread:7,n:24});}
      }
      // Septum Falls: what the north chamber drains, 90 m of it, into a plunge pool the Park Service fenced
      const fa=0.25,fr=radiusAt(L.top+120)+120,[fx,fz]=polar(fa,fr);
      const fallM=new THREE.MeshLambertMaterial({color:0xc9b489,transparent:true,opacity:0.55,side:THREE.DoubleSide,emissive:0x2a2010});
      const fall=new THREE.Mesh(new THREE.CylinderGeometry(3.5,6,90,10,1,true),fallM);
      fall.position.set(fx,Y(L.top+170),fz);
      const pool=new THREE.Mesh(new THREE.CircleGeometry(24,24),new THREE.MeshPhongMaterial({color:0xb8a064,emissive:0x2a200c,specular:0xffffff,shininess:60,side:THREE.DoubleSide}));
      pool.rotation.x=-Math.PI/2;pool.position.set(fx,Y(L.top+215),fz);
      const spray=new THREE.Mesh(new THREE.SphereGeometry(16,10,7),new THREE.MeshBasicMaterial({color:0xe8dcc0,transparent:true,opacity:0.14,depthWrite:false}));
      spray.position.set(fx,Y(L.top+208),fz);spray.scale.y=0.5;
      const poolRail=[];for(let k=0;k<20;k++){const a=k/20*Math.PI*2;poolRail.push(box(fx+Math.cos(a)*27,Y(L.top+215),fz+Math.sin(a)*27,0.35,1.1,0.35,steelM));}
      const pl=box(fx+30,Y(L.top+215)+3,fz,2,1,2,sodiumM);lamps.push(pl);
      parts.push(...card(F.falls||{name:'Septum Falls',info:''},[fall,pool,spray,pl,mergeParts(poolRail,steelM)]));
      movers.push({m:fall,kind:'fall'},{m:spray,kind:'steam',ph:0.3,y:spray.position.y});
      for(const q of sign(L.top+215,fa+0.12,fr-22,L))parts.push(q);
    }

    if(L.kind==='springs'){
      // The springs are a cluster of bath bulbs off the south-west of the shaft, drawn from the park's own
      // leaflet: see springs.js.
      const SPR=buildSprings({THREE,RNG,AX,AZ,Y,D0,wallAt,mergeParts,signBoard,faceTowards,card,L,F,
        M:{wetM,deckM,brownM,steelM,darkSteelM,yellowM,fluorM,mercM}});
      parts.push(...SPR.parts);pods.push(...SPR.pods);stands.push(...SPR.stands);lamps.push(...SPR.lamps);movers.push(...SPR.movers);
      cavities.push(...SPR.cavities);

      // ---- the Gift Gardens ----
      // A chamber on the east wall full of organs that grow things, and the rigs Anodyne plugged into them:
      // frames, a conveyor up to the shaft, work lights on poles, and the crew hut.
      if(F.gardens){
        const gd=F.gardens.depth||1300,ga=0.15,G=[];
        const ch=chamber(gd,ga,120,150,new THREE.MeshLambertMaterial({color:0x6a3438,side:THREE.BackSide,emissive:0x1a0808}));G.push(ch);
        cavities.push({kind:'ell',c:ch.position.clone(),r:[120,75,103]});
        const cx=ch.position.x,cz=ch.position.z,floor=Y(gd)-52;
        const organM=new THREE.MeshLambertMaterial({color:0xd09a78,emissive:0x5a2a14,emissiveIntensity:0.7,flatShading:true});
        const organs=[],frames=[];
        for(let k=0;k<18;k++){
          const a=RNG()*Math.PI*2,r=15+RNG()*55,ox=cx+Math.cos(a)*r,oz=cz+Math.sin(a)*r*0.8,R0=4+RNG()*7;
          const o=new THREE.Mesh(new THREE.IcosahedronGeometry(R0,1),organM);o.position.set(ox,floor+R0*0.6,oz);o.scale.y=0.7;organs.push(o);
          if(k%2===0){   // a rig over it: four legs, a head frame, and the harvest arm going in
            for(const [dx,dz] of [[-1,-1],[1,-1],[1,1],[-1,1]])frames.push(box(ox+dx*(R0+2),floor,oz+dz*(R0+2),0.8,R0*2.4,0.8,yellowM));
            frames.push(box(ox,floor+R0*2.4,oz,R0*2+5,1,R0*2+5,yellowM),box(ox,floor+R0*0.9,oz,1,R0*1.5,1,darkSteelM));
          }
        }
        G.push(mergeParts(organs,organM),mergeParts(frames,yellowM));
        const [sx,sz]=polar(ga,wallAt(gd-30)*0.95);
        G.push(strut(new THREE.Vector3(cx,floor+2,cz),new THREE.Vector3(sx,Y(gd-30),sz),3.5,1.2,darkSteelM));   // the conveyor
        for(let k=0;k<6;k++){const a=k/6*Math.PI*2,px=cx+Math.cos(a)*66,pz=cz+Math.sin(a)*56;
          G.push(box(px,floor,pz,0.6,18,0.6,steelM));
          const l=box(px,floor+18,pz,4,1.2,2,mercM);lamps.push(l);G.push(l);}
        const hut=box(cx-60,floor,cz+10,14,5,8,yellowM);G.push(hut);
        stands.push({kind:'crew',x:cx,y:floor,z:cz,spread:48,n:22,crew:true});
        for(const q of sign(gd+2,ga-0.25,wallAt(gd)*0.9,L,'company'))G.push(q);
        parts.push(...card(F.gardens,G));
        chambersOut.push({kind:'gardens',x:cx,y:floor,z:cz,R:120,H:150});
      }
    }

    if(L.kind==='sea'){
      // a lake in a chamber off the shaft, and what the park hung over it
      // the lake sits in the belly of the chamber, not at its lip: put it a little below the centre and take
      // the chamber's own width at that height, or the water stands out past the rock it is supposed to be in
      const big=L.r1>140,R0=big?460:300,H0=520,dd=mid+H0*0.275,SR=R0*0.78;
      const ca=big?1.9:4.6;
      {const ch=chamber(mid,ca,R0,520);parts.push(ch);
       cavities.push({kind:'ell',c:ch.position.clone(),r:[R0,260,R0*0.86],level:Y(dd),fluid:new THREE.Color(L.water||'#c8b24a')});}
      const seaM=new THREE.MeshPhongMaterial({color:new THREE.Color(L.water||'#c8b24a'),emissive:new THREE.Color(L.water||'#c8b24a'),
          emissiveIntensity:0.22,specular:0xffffff,shininess:60,side:THREE.DoubleSide});
      const sea=new THREE.Mesh(new THREE.CircleGeometry(SR,48),seaM);
      sea.rotation.x=-Math.PI/2;
      const cr=radiusAt(mid)*0.55+R0*0.45;
      const [sx,sz]=polar(ca,cr);
      sea.position.set(sx,Y(dd),sz);parts.push(sea);
      tag({name:L.name,info:L.info},[sea]);
      movers.push({m:sea,kind:'sea',y:sea.position.y});
      // the scum: rafts of foam that drift on it
      const foamM=new THREE.MeshLambertMaterial({color:0xe6dcae,transparent:true,opacity:0.6,depthWrite:false});
      for(let k=0;k<14;k++){const a=RNG()*Math.PI*2,r=RNG()*SR*0.85;
        const f=new THREE.Mesh(new THREE.CircleGeometry(8+RNG()*22,9),foamM);f.rotation.x=-Math.PI/2;
        f.position.set(sx+Math.cos(a)*r,Y(dd)+0.3,sz+Math.sin(a)*r);f.scale.set(1,0.5+RNG()*0.6,1);parts.push(f);
        movers.push({m:f,kind:'foam',cx:sx,cz:sz,a,r,ph:RNG()*6.28});}
      seas.push({x:sx,z:sz,y:Y(dd),R:SR,big,name:L.name});
      if(!big){
        // the ferry terminal on the near shore, the dam holding the level, and the ferry itself
        const [tx,tz]=polar(ca,cr-SR*0.86);
        parts.push(box(tx,Y(dd)-1,tz,44,9,26,brownM),box(tx,Y(dd)+8,tz,30,5,16,deckM));
        stands.push({kind:'terminal',x:tx,y:Y(dd)+8,z:tz,spread:18,n:34});
        const [dx,dz]=polar(ca,cr+SR*0.84);
        const dam=box(dx,Y(dd)-14,dz,190,26,14,concreteM);
        dam.rotation.y=-ca;parts.push(dam);
        const ferry=new THREE.Group();
        ferry.add(new THREE.Mesh(new THREE.BoxGeometry(22,3,8).translate(0,1.5,0),new THREE.MeshLambertMaterial({color:0xe8e2d4})));
        ferry.add(new THREE.Mesh(new THREE.BoxGeometry(12,3,6).translate(-2,4.5,0),brownM));
        const fw=new THREE.Mesh(new THREE.BoxGeometry(12.2,1,6.2).translate(-2,4.8,0),fluorM);ferry.add(fw);lamps.push(fw);
        ferry.position.set(tx,Y(dd)+0.2,tz);parts.push(ferry);
        movers.push({m:ferry,kind:'ferry',x0:tx,z0:tz,a:ca,R:SR*0.7,y:ferry.position.y});
        tag({name:'The gastric ferry',info:'A steel-hulled launch with an acid-proof coat that had to be renewed every eleven weeks. Forty seats, a ranger at each end, and the rule that nobody put a hand over the side.'},[ferry]);
        // the terminal is lit and has a roof, the jetty runs out into the water, and there are buoys on it
        const roof=box(tx,Y(dd)+13,tz,34,1.4,20,deckM);roof.rotation.y=-ca;parts.push(roof);
        {const w=box(tx+Math.cos(ca)*13,Y(dd)+3,tz+Math.sin(ca)*13,26,2.4,0.4,fluorM);
          w.rotation.y=-ca+Math.PI/2;parts.push(w);lamps.push(w);}
        const jetty=new THREE.Mesh(new THREE.BoxGeometry(70,1.2,7).translate(35,0,0),deckM);
        jetty.position.set(tx,Y(dd)+1.4,tz);jetty.rotation.y=-ca;parts.push(jetty);
        for(let k=0;k<7;k++){const ba=ca+(RNG()-0.5)*1.1,br=SR*(0.2+RNG()*0.7);
          const b=new THREE.Mesh(new THREE.SphereGeometry(1.8,6,5),new THREE.MeshLambertMaterial({color:0xd8481c}));
          b.position.set(tx+Math.cos(ba)*br,Y(dd)+1,tz+Math.sin(ba)*br);parts.push(b);}
        // the dam's spillway lights, on all night for fifty years
        for(let k=0;k<6;k++){const la=ca+(k-2.5)*0.055,[lx,lz]=polar(la,cr+SR*0.84);
          const l=box(lx,Y(dd)+12,lz,2,1,1,sodiumM);parts.push(l);lamps.push(l);}
        {const [gx,gz]=polar(ca,cr-SR*0.86+30);
          const b=signBoard(THREE,(L.signs&&L.signs[0])||['GASTRIC FERRY',''],{w:9,h:3});
          b.position.set(gx,Y(dd)+17,gz);b.rotation.y=faceTowards(gx,gz,sx,sz);parts.push(b);lamps.push(b);}
        // Oyster's Shame: a fold in the shaft wall above the sea, and the truck it closed on
        if(F.oyster){
          const od=F.oyster.depth||1560,oa=ca+0.55,rw=wallAt(od),O=[];
          for(const sd of [1,-1]){const [lx,lz]=polar(oa,rw-6);
            const lip=new THREE.Mesh(new THREE.SphereGeometry(1,14,10),ringM);
            lip.scale.set(12,5,26);lip.position.set(lx,Y(od)+sd*4.2,lz);lip.rotation.y=-oa;O.push(lip);}
          const [kx,kz]=polar(oa,rw-11);
          const truck=new THREE.Group();
          truck.add(new THREE.Mesh(new THREE.BoxGeometry(5.4,1.8,2.2).translate(0,0.9,0),new THREE.MeshLambertMaterial({color:0xe9e6dc})));
          truck.add(new THREE.Mesh(new THREE.BoxGeometry(2.2,1.3,2.1).translate(-0.6,2.4,0),new THREE.MeshLambertMaterial({color:0x2e5a3a})));
          const lb=new THREE.Mesh(new THREE.BoxGeometry(1.2,0.3,1.6).translate(-0.6,3.2,0),redM);truck.add(lb);
          truck.position.set(kx,Y(od)-0.6,kz);truck.rotation.set(0.18,-oa+Math.PI/2,0.35);O.push(truck);
          movers.push({m:lb,kind:'strobe',ph:800});
          fine.push(...card(F.oyster,O));
        }
      }else{
        // the resort: a shelf on the south wall with its 180 rooms, none of them with a window
        const [rx,rz]=polar(ca+0.9,cr*0.55);
        const shelf=box(rx,Y(dd-120),rz,150,6,70,concreteM);shelf.rotation.y=-ca;parts.push(shelf);
        const R=[shelf];
        for(let k=0;k<5;k++){
          const b=box(rx,Y(dd-126-k*11),rz,130-k*8,10,56,k%2?deckM:concreteM);b.rotation.y=-ca;R.push(b);
          const w=box(rx+Math.cos(ca)*29,Y(dd-126-k*11)+4,rz+Math.sin(ca)*29,120-k*8,3.5,0.5,fluorM);
          w.rotation.y=-ca;R.push(w);lamps.push(w);
        }
        // the funicular down to the water, the landing at the bottom of it, and the lettering on the roof
        {const fl=new THREE.Mesh(new THREE.BoxGeometry(4,150,4),steelM);
         fl.position.set(rx+Math.cos(ca)*40,Y(dd-60),rz+Math.sin(ca)*40);fl.rotation.z=0.22;fl.rotation.y=-ca;R.push(fl);
         const car=box(rx+Math.cos(ca)*46,Y(dd-40),rz+Math.sin(ca)*46,6,5,5,deckM);car.rotation.y=-ca;R.push(car);
         movers.push({m:car,kind:'lift',y0:Y(dd-40),amp:96,ph:1.2});
         const landing=box(rx+Math.cos(ca)*58,Y(dd)+1,rz+Math.sin(ca)*58,26,1.2,12,deckM);landing.rotation.y=-ca;R.push(landing);
         stands.push({kind:'landing',x:rx+Math.cos(ca)*58,y:Y(dd)+2.2,z:rz+Math.sin(ca)*58,spread:10,n:22});}
        {const b=signBoard(THREE,(L.signs&&L.signs[0])||['INTRAPARK THERMAL WELLNESS RESORT',''],{w:60,h:7,style:'nps'});
         b.position.set(rx+Math.cos(ca)*30,Y(dd-120)+8,rz+Math.sin(ca)*30);b.rotation.y=faceTowards(b.position.x,b.position.z,sx,sz);R.push(b);lamps.push(b);}
        parts.push(...card({name:'Intrapark Thermal Wellness Resort',info:'180 rooms on a concrete shelf over the Greater Gastric Sea, none of them with a window, all of them booked through 2008. The funicular ran guests down to a landing on the water for the evening walk, which was the only thing in the brochure you could not do anywhere else.'},R));
      }
    }

    if(L.kind==='works'){
      // Little Detroit: the lower works hung off the wall, the pipe stack running up the shaft, and the drain.
      // It is a town of sorts - bunkhouses, shops, a canteen and a chapel stacked on a rack bolted to a living
      // wall, three kilometres down, with a crane over it and a catwalk to everything. Nobody planned it.
      const dd=L.top+150,rr=radiusAt(dd),W=[];
      const rustM=new THREE.MeshLambertMaterial({color:0x6e4a3a,flatShading:true});
      const CRATE=[0x7a5a3e,0x4c5a62,0x6d4340,0x59614e,0x7b6a4a];
      for(let k=0;k<7;k++){
        const a=k/7*Math.PI*2*0.55+2.4,[x,z]=polar(a,rr-22);
        const b=box(x,Y(dd+k*16),z,34,12,22,steelM);b.rotation.y=-a;W.push(b);
        const [lx,lz]=polar(a,rr-38);const lp=box(lx,Y(dd+k*16)+6,lz,8,2,2,mercM);W.push(lp);lamps.push(lp);
      }
      // the town: containers stacked on the rack, every one of them a different weather
      const crates=[];
      for(let k=0;k<54;k++){
        const a=2.4+RNG()*1.9,lev=Math.floor(RNG()*5),dd2=dd+lev*16+2,rr2=rr-14-RNG()*26;
        const w=9+RNG()*7,h=5+RNG()*3;
        const c=new THREE.Mesh(new THREE.BoxGeometry(w,h,7).translate(0,h/2,0),
          new THREE.MeshLambertMaterial({color:CRATE[Math.floor(RNG()*CRATE.length)],flatShading:true}));
        const [cx,cz]=polar(a,rr2);c.position.set(cx,Y(dd2),cz);c.rotation.y=-a+(RNG()-0.5)*0.2;crates.push(c);
        if(RNG()<0.75){const [wx,wz]=polar(a,rr2-3.8),w2=box(wx,Y(dd2)+h*0.45,wz,w*0.5,1.4,0.3,fluorM);
          w2.rotation.y=-a+Math.PI/2;W.push(w2);lamps.push(w2);}
      }
      W.push(...crates);
      // the catwalk web between the levels, and the ladders
      for(let k=0;k<5;k++){
        const dd2=dd+k*16+2;
        W.push(...walk(dd2,2.4,4.3,rr-30,3),...rail(dd2,2.4,4.3,rr-27,1.0));
        stands.push({kind:'catwalk',d:dd2,a0:2.5,a1:4.2,r:rr-30,n:12,crew:true});
        if(k<4){const [lx,lz]=polar(3.35,rr-30);W.push(box(lx,Y(dd2+16),lz,1.2,16,1.2,steelM));}
      }
      for(const q of sign(dd+2,3.0,rr-34,L))W.push(q);
      for(const q of sign(dd+34,3.8,rr-34,L))W.push(q);
      // the crane on the top deck, slewing over the drop
      {const [cx,cz]=polar(3.1,rr-30);
       W.push(box(cx,Y(dd+82),cz,3,34,3,yellowM));
       const jib=new THREE.Mesh(new THREE.BoxGeometry(72,2,3).translate(-22,0,0),yellowM);
       jib.position.set(cx,Y(dd+116),cz);W.push(jib);movers.push({m:jib,kind:'crane',ph:RNG()*6.28});
       W.push(box(cx,Y(dd+96),cz,1.6,1.6,1.6,steelM));}
      // the flare: what they burn off, and the only thing down here that makes its own light
      {const [fx,fz]=polar(2.2,rr-10);
       W.push(box(fx,Y(dd+40),fz,2.4,70,2.4,rustM));
       const flame=new THREE.Mesh(new THREE.ConeGeometry(4,16,7),
         new THREE.MeshBasicMaterial({color:0xffa23c,transparent:true,opacity:0.75,blending:THREE.AdditiveBlending,depthWrite:false}));
       flame.position.set(fx,Y(dd+40)+78,fz);W.push(flame);movers.push({m:flame,kind:'flame'});}
      parts.push(...card({name:'Little Detroit',info:L.info},W));
      // 2007: the catwalk that came down, and the wreck of the rig at the bottom of the drain
      {const wa=1.6,wr=radiusAt(L.bottom-60)*0.8;
       for(let k=0;k<5;k++){
         const [bx,bz]=polar(wa+k*0.12,wr);
         const b=box(bx,Y(L.bottom-40-k*9),bz,16,0.8,4,deckM);
         b.rotation.set((RNG()-0.5)*0.8,-wa,(RNG()-0.5)*0.9);parts.push(b);}
       const [rx,rz]=polar(wa,wr*0.3);
       const rig=box(rx,Y(L.bottom-6),rz,22,14,16,rustM);
       rig.rotation.set(0.5,-wa,0.24);parts.push(rig);
       const bea=new THREE.Mesh(new THREE.SphereGeometry(2,6,5),redM);
       bea.position.set(rx,Y(L.bottom-20),rz);parts.push(bea);
       movers.push({m:bea,kind:'strobe',ph:300});}
      for(let k=0;k<3;k++){   // the pipe stack: it runs from here to the surface and is the tallest thing in the park
        const [px,pz]=polar(2.0+k*0.22,radiusAt(1400)*0.97);
        parts.push(box(px,Y(DEEP),pz,3.4,DEEP-60,3.4,darkSteelM));
      }
      // the drain: the shaft goes on, and the dark below it is where the park stops being a park
      const drain=new THREE.Mesh(new THREE.CylinderGeometry(radiusAt(DEEP)*0.8,8,420,SEG,1,true),deepM);
      drain.position.set(AX,Y(DEEP+210),AZ);parts.push(drain);
    }
  });

  // ---- the Prime Labiod Junction ----
  // Where the Lesser Sea gives on to the Greater there is no sphincter but a pair of lips, thick and folded,
  // pressed shut. It is what opened on the night.
  if(LABIOD){
    const r=radiusAt(LABIOD),J=[];
    const labM=breathe(new THREE.MeshPhongMaterial({color:0x8a3c48,specular:0x602838,shininess:40,side:THREE.DoubleSide,flatShading:true,emissive:0x1a0408}));
    for(const sd of [1,-1]){
      const t=new THREE.Mesh(new THREE.TorusGeometry(r*0.78,r*0.3,10,SEG),labM);
      t.rotation.x=Math.PI/2;t.position.set(AX,Y(LABIOD)+sd*r*0.2,AZ);t.scale.set(1,1,0.8);J.push(t);
    }
    parts.push(...card(F.labiod,J));
    ctx.pitBus.parts.labiod={lips:J,r};
  }

  // ---- merge what does not move ----
  // Everything above was built as one mesh per box, because that is the easy way to place things; drawn that
  // way it is thousands of draw calls. So everything that does not move, flicker on its own, carry a texture or
  // carry colours per vertex is merged down by material - within each card's group, within the deck, and
  // across the rest - and the lamps still flicker, because the flicker is on the material they share.
  const keep=new Set(movers.map(m=>m.m).filter(Boolean));
  if(ctx.pitBus.parts.labiod)for(const l of ctx.pitBus.parts.labiod.lips)keep.add(l);
  function consolidate(list){
    const by=new Map(),out=[];
    for(const m of list){
      const ok=m.isMesh&&!m.children.length&&!Array.isArray(m.material)&&!m.material.map&&!m.material.vertexColors
        &&!keep.has(m)&&m.geometry.attributes.normal&&m.frustumCulled;
      if(!ok){out.push(m);continue;}
      if(!by.has(m.material))by.set(m.material,[]);by.get(m.material).push(m);
    }
    for(const [mat,ms] of by)out.push(ms.length===1?ms[0]:mergeParts(ms,mat));
    return out;
  }
  for(const g of cardGroups){const kids=g.children.slice();for(const k of kids)g.remove(k);for(const k of consolidate(kids))g.add(k);tag(g.userData.info,[g]);}
  if(LVC){const kids=LVC.children.slice();for(const k of kids)LVC.remove(k);for(const k of consolidate(kids))LVC.add(k);}
  const merged=consolidate(parts);
  {const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(glows,3));
   const pts=new THREE.Points(g,glowM);fine.push(pts);}

  // ---- everything into the scene, under one group so the page can hide it all at once ----
  const grp=new THREE.Group();
  for(const p of merged){p.castShadow=false;p.receiveShadow=false;grp.add(p);}
  if(LVC_PIVOT)grp.add(LVC_PIVOT);
  // and the growth on the wall in a group of its own, because it is the one thing that does not belong in the
  // section view: it hangs off the near wall as much as the far one, and the near wall is what was cut away.
  const fineG=new THREE.Group();
  for(const p of fine){p.castShadow=false;p.receiveShadow=false;fineG.add(p);}
  grp.add(fineG);ctx.pitBus.parts.fine=fineG;
  scene.add(grp);

  // ---- it is alive ----
  // The flesh breathes in the shader (breathe(), above). What happens here is everything else: the rams taking
  // up the breath, the lamps flickering the way a fifty-year-old string does, the ferry, the steam, the cages.
  let last=performance.now();
  const LAMPS={sodium:sodiumM,fluor:fluorM,merc:mercM,glow:glowM,red:redM};
  const BASE={sodium:sodiumM.color.clone(),fluor:fluorM.color.clone(),merc:mercM.color.clone()};
  animHooks.push(now=>{
    const dt=Math.min(0.1,(now-last)/1000);last=now;
    BR.t+=dt*BR.rate;const t=BR.t;
    U.uT.value=t;U.uAmp.value=BR.amp;
    const flick=0.86+0.14*Math.sin(now*0.0073)*Math.sin(now*0.0021);
    const pow=SIG.power;         // the incident cuts the power
    sodiumM.color.copy(BASE.sodium).multiplyScalar(flick*pow);
    mercM.color.copy(BASE.merc).multiplyScalar((0.9+0.1*Math.sin(now*0.013))*pow);
    fluorM.color.copy(BASE.fluor).multiplyScalar((0.97+0.03*Math.sin(now*0.05))*pow);
    glowM.opacity=(0.22+0.08*Math.sin(now*0.0017))*pow;
    for(const m of movers){
      const churn=SIG.seaChurn;
      if(m.kind==='sea'){m.m.position.y=m.y+0.8*Math.sin(t*0.6)+churn*(2.5*Math.sin(t*2.3)+1.2*Math.sin(t*5.1));
        m.m.rotation.x=-Math.PI/2+churn*0.02*Math.sin(t*1.7);m.m.rotation.y=churn*0.02*Math.cos(t*1.3);}
      else if(m.kind==='fall')m.m.material.opacity=0.45+0.15*Math.sin(t*3.1);
      else if(m.kind==='ferry'){
        const wreck=SIG.ferryWreck;
        if(wreck>0){   // on the night it stops where it is, heels over and goes down
          m.m.rotation.z=wreck*1.9+churn*0.1*Math.sin(t*2);m.m.position.y=m.y-wreck*6+churn*1.5*Math.sin(t*2.3);}
        else{const u=(t*0.02)%1,s=u<0.5?u*2:2-u*2,a=m.a+Math.PI*s*0.5;
          m.m.position.set(m.x0+Math.cos(a)*m.R*s,m.y,m.z0+Math.sin(a)*m.R*s);m.m.rotation.set(0,-a,0);}}
      else if(m.kind==='steam'){const u=(t*0.06+m.ph)%1;m.m.position.y=m.y+6*u;m.m.material.opacity=0.14*(1-u);}
      else if(m.kind==='strobe')m.m.visible=((now+(m.ph||0))%1600)<260;
      else if(m.kind==='lift')m.m.position.y=m.y0-m.amp*0.5*(1-Math.cos(t*0.08+m.ph));
      else if(m.kind==='crane')m.m.rotation.y=0.5*Math.sin(t*0.05+m.ph);
      else if(m.kind==='flame'){const f=0.6+0.4*Math.abs(Math.sin(t*5.1)+0.4*Math.sin(t*13));
        m.m.scale.set(0.8+0.3*f,f,0.8+0.3*f);m.m.material.opacity=0.55+0.35*f;}
      else if(m.kind==='lung'){   // the lung fills and empties about its hilum; on the night it gasps
        const lu=m.lu,fit=SIG.lungFit;
        const k=1+2.4*breathAt(TOP-lu.hilum.y)+fit*(0.05*Math.abs(Math.sin(t*5.3+lu.side))+0.025*Math.sin(t*13.1+lu.side*2));
        lu.g.scale.setScalar(k);}
      else if(m.kind==='foam'){const a=m.a+t*(0.004+churn*0.05);m.m.position.x=m.cx+Math.cos(a)*m.r;m.m.position.z=m.cz+Math.sin(a)*m.r;}
      else if(m.kind==='bulb')m.mat.emissive.setRGB(0.16+0.08*Math.sin(t*0.2856),0.05,0.06);
      else if(m.kind==='pods')m.mat.emissiveIntensity=0.5+0.15*Math.sin(t*0.2856+1);
    }
    // the rams: the barrel rides the wall, the rod stays with the deck
    for(const r of rams){
      const k=1+breathAt(r.d)+SIG.ramKick*Math.sin(now*0.004+r.a*3);
      const rr=r.r0*k;r.g.position.set(AX+Math.cos(r.a)*rr,Y(r.d)-2,AZ+Math.sin(r.a)*rr);
    }
    // the cages, running their guides: each one takes its own time about it
    // (the incident stops them where they are when the power goes, and takes one of them down itself)
    if(!SIG.cageHalt)for(const c of cages){
      const u=0.5-0.5*Math.cos(t*0.05+c.ph),d=c.hi+(c.lo-c.hi)*u;
      c.g.position.set(AX+Math.cos(c.a)*c.r,Y(d),AZ+Math.sin(c.a)*c.r);
    }
  });

  // What the other modules on this page need to find their way round the pit: fauna.js puts its animals on
  // these walls and in these seas, and incident.js takes hold of the deck, the breath and the lights.
  ctx.pit={THREE,AX,AZ,TOP,Y,D0,DEEP,LAYERS,radiusAt,wallAt,breathAt,BR,U,breathe,card:tag,polar,
    group:grp,fine:fineG,lvc:LVC_PIVOT,deck:DECK,deckR:[DI,DO],rams,lamps:LAMPS,seas,chambers:chambersOut,pods,cav:CAV,
    lungs:lungsOut,lungFluid,stands,cages,groundH,mouthR:MOUTH_R,cavities};
  ctx.pitBus.parts.layers=CARDS;
  ctx.details=Object.assign(ctx.details||{},{pitLayers:CARDS.length,pitDepth:DEEP,pitParts:parts.length,pitMeshes:merged.length,pitLamps:lamps.length});
}
