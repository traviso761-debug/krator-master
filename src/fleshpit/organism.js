// ---------- the Permian Basin Superorganism, from the collar down ----------
// The surface of the park is a map like any other: ground, roads, buildings, and the engine draws it. The pit
// is not. It is a shaft 190 m across and two and a half kilometres deep with seven named layers opening off
// it, and nothing about that is a footprint pushed upwards - so it is built here instead, from the "pit" block
// in data/cities/fleshpit.json, and handed to the engine as one of this page's extras. No other city loads a
// line of it.
//
// Fan work. Mystery Flesh Pit National Park is Trevor Roberts's project; the anatomy, the incident and the
// names are his, the geometry is this project's own, and nothing of his is used or redistributed.
//
// What gets built, top to bottom: the concrete collar and its switchback ramp; the throat with the Lower
// Visitor Center's deck ringing it; the bronchial chambers either side; the ballast pods; the two gastric
// seas with their ferry terminal, dam and resort shelf; and the lower works over the drainage pit. Between
// each pair of layers is a sphincter ring, because the shaft is not a pipe - it is an animal, and it moves.
import { mkRng } from '../core/rng.js';

export function organism(api){
  const {THREE,C,ctx,scene,animHooks,groundH,mergeParts}=api;
  const K=C.pit; if(!K) return;
  const RNG=mkRng(1976);
  const [AX,AZ]=K.axis||[0,0];
  const LAYERS=K.layers||[];
  if(!LAYERS.length)return;
  const DEEP=LAYERS[LAYERS.length-1].bottom;
  const TOP=K.rim!==undefined?K.rim:groundH(AX,AZ+520);   // depths in the data are metres below the plain, not below the lip
  // Where the ground stops and this takes over. The generator digs the funnel to exactly here and no further,
  // so nothing of the terrain stands between an outside camera and the shaft (see the note in make-fleshpit.py).
  const D0=K.mouthDepth||146;
  const at=d=>Math.max(D0,d);

  // ---- materials ----
  // Flesh takes light badly: it is wet, it scatters, and almost nothing on it is a hard highlight. Every
  // surface down here is one of five materials, so the whole pit is five draw calls' worth of state.
  // The shaft is drawn back-face only, and that is the whole trick of this page: from inside you see the far
  // wall as you should, and from outside the near wall is simply not there, so the pit is its own cutaway and
  // the seven layers can be looked at from the side like a diagram. The ground does the same thing for free -
  // the terrain is single-sided, so the funnel's inner face is culled when you are outside looking in.
  const fleshM=new THREE.MeshLambertMaterial({color:new THREE.Color(K.flesh||'#8c4f52'),side:THREE.BackSide,vertexColors:true,emissive:0x1d090c});
  const deepM=new THREE.MeshLambertMaterial({color:new THREE.Color(K.deep||'#5d2f36'),side:THREE.DoubleSide});
  const wetM=new THREE.MeshPhongMaterial({color:0x7a3f46,specular:0x40202a,shininess:26,side:THREE.DoubleSide,flatShading:true});
  const steelM=new THREE.MeshLambertMaterial({color:0x9aa0a4});
  const deckM=new THREE.MeshLambertMaterial({color:0xb8b2a4});
  const concreteM=new THREE.MeshLambertMaterial({color:0x9a9384});
  const collarM=new THREE.MeshLambertMaterial({color:0x9a9384,side:THREE.BackSide});   // the collar rings, cut away like the shaft
  const lampM=new THREE.MeshBasicMaterial({color:new THREE.Color(K.lit||'#ffd9a0')});
  const glowM=new THREE.MeshBasicMaterial({color:0xffbe7a,transparent:true,opacity:0.5,depthWrite:false,blending:THREE.AdditiveBlending});

  const CARDS=[];          // {name, info, y} - the layer cards, for the camera's buttons and for clicks
  const parts=[];
  const box=(x,y,z,w,h,d,m)=>{const b=new THREE.Mesh(new THREE.BoxGeometry(w,h,d).translate(0,h/2,0),m);b.position.set(x,y,z);return b;};
  const Y=depth=>TOP-depth;                        // a depth in the data is a height in the world

  // ---- the shaft ----
  // One tube, built as a single buffer: a ring of vertices every few metres of depth, the radius interpolated
  // through the layers, wobbled so no two rings are the same, and pinched into a sphincter at every boundary.
  // The vertex colour darkens with depth, which is what makes the shaft read as going somewhere.
  const SEG=72, STEP=8;
  const radiusAt=d=>{
    for(const L of LAYERS){
      if(d<L.top||d>L.bottom)continue;
      const t=(d-L.top)/Math.max(1,L.bottom-L.top);
      const r=L.r0+(L.r1-L.r0)*t;
      const s=Math.min(1,Math.min(d-L.top,L.bottom-d)/26);     // the pinch at the ends of a layer
      return r*(0.72+0.28*s);
    }
    return d<0?LAYERS[0].r0:LAYERS[LAYERS.length-1].r1;
  };
  const colourAt=d=>{
    let L=LAYERS[0];for(const q of LAYERS)if(d>=q.top)L=q;
    const c=new THREE.Color(L.colour||K.flesh||'#8c4f52');
    return c.multiplyScalar(0.52+0.48*Math.max(0,1-d/DEEP));   // the light thins with depth, but never to nothing
  };
  // The wall of the shaft, as against the radius the camera and the cards use: at the very top it flares out to
  // meet the cut edge of the ground. The plain has no floor inside the orifice (C.groundHole), so if the shaft
  // were narrower than that hole there would be a ring of daylight round the mouth with nothing behind it.
  const MOUTH_R=K.mouthRadius||(C.groundHole?C.groundHole.r+12:0);
  const wallAt=d=>{const r=radiusAt(d);
    if(!MOUTH_R||d>D0+70)return r;
    const u=Math.max(0,Math.min(1,(d-(D0-34))/104));return MOUTH_R+(r-MOUTH_R)*u;};
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
        // a vein carries blood and takes the light differently; the creases between them stay dark
        const lit=0.82+0.5*vein-0.18*Math.max(0,-Math.cos(vphase))+0.06*Math.sin(d*0.021+a*3);
        col.push(c.r*lit,c.g*lit*(0.94+0.1*vein),c.b*lit*(0.92+0.08*vein));
      }
      rings.push(row);
    }
    for(let i=0;i+1<rings.length;i++)for(let k=0;k<SEG;k++){
      const a=rings[i][k],b=rings[i][(k+1)%SEG],c=rings[i+1][k],e=rings[i+1][(k+1)%SEG];
      idx.push(a,c,e,a,e,b);
    }
    const g=new THREE.BufferGeometry();
    g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));
    g.setAttribute('normal',new THREE.Float32BufferAttribute(nor,3));
    g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));
    g.setIndex(idx);g.computeBoundingSphere();
    const shaft=new THREE.Mesh(g,fleshM);shaft.receiveShadow=false;shaft.castShadow=false;
    parts.push(shaft);
  }

  // ---- the sphincter rings between the layers ----
  for(let i=1;i<LAYERS.length;i++){
    const d=LAYERS[i].top,r=radiusAt(d);
    const t=new THREE.Mesh(new THREE.TorusGeometry(r*0.92,r*0.22,8,SEG),wetM);
    t.rotation.x=Math.PI/2;t.position.set(AX,Y(d),AZ);parts.push(t);
  }

  const lamps=[],glows=[],movers=[];   // everything that lights, glows or moves, collected as it is built
  const fine=[];                       // the growth on the wall: only shown from inside the shaft

  // ---- what grows on the wall ----
  // Polyps in clusters, strands hanging between the rings, and a crease of harder tissue every hundred metres
  // or so. All of it is merged into one mesh per material - a thousand little spheres at one draw call - and
  // all of it is back-faced like the wall it grows on, so the section view stays a section.
  {
    const lumpM=new THREE.MeshLambertMaterial({color:new THREE.Color(K.flesh||'#8c4f52'),side:THREE.BackSide,emissive:0x1a080b,flatShading:true});
    const cordM=new THREE.MeshLambertMaterial({color:0x6d3339,side:THREE.BackSide,flatShading:true});
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
      const rr=wallAt(d);
      const t=new THREE.Mesh(new THREE.TorusGeometry(rr*0.985,rr*0.045,6,40),wetM);
      t.rotation.x=Math.PI/2;t.position.set(AX,Y(d),AZ);ribs.push(t);
    }
    parts.push(mergeParts(ribs,wetM));
  }

  // ---- the lamp strings ----
  // Four of them, hung from the collar and running the whole way down, because this is a national park and the
  // Park Service lit it: a cable, a lamp every forty metres, and the glow each one throws on the wall.
  const strings=[];
  for(let q=0;q<4;q++){
    const a0=0.8+q*Math.PI/2;
    const cable=[],lampsQ=[];
    for(let d=D0;d<DEEP;d+=40){
      const a=a0+0.35*Math.sin(d*0.0012+q),rr=wallAt(d)*0.93;
      const x=AX+Math.cos(a)*rr,z=AZ+Math.sin(a)*rr;
      cable.push(new THREE.Vector3(x,Y(d),z));
      const lp=new THREE.Mesh(new THREE.SphereGeometry(1.8,6,5),lampM);lp.position.set(x,Y(d),z);
      parts.push(lp);lamps.push(lp);lampsQ.push(lp);
      const gl=new THREE.Mesh(new THREE.SphereGeometry(11,7,5),glowM);gl.position.set(x,Y(d),z);fine.push(gl);glows.push(gl);
    }
    if(cable.length>1){
      const tube=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(cable),cable.length*2,0.5,4,false),steelM);
      parts.push(tube);strings.push(tube);
    }
  }

  // ---- the lifts ----
  // Four headframes on the rim drop four cages down the guides. They are the way anyone got below the collar,
  // they run whether or not anyone is watching, and they are the only thing in the pit that keeps time.
  const cages=[];
  {
    const GT=LAYERS[0].top,GB=1100;                       // the guides run from the collar down past the throat
    for(let k=0;k<4;k++){
      const a=0.5+k*Math.PI/2;
      const top=Y(at(GT)),bot=Y(GB);
      const rr=d=>wallAt(d)*0.90;
      parts.push(box(AX+Math.cos(a)*rr(400),bot,AZ+Math.sin(a)*rr(400),2.2,top-bot,2.2,steelM));
      const cage=new THREE.Group();
      const body=new THREE.Mesh(new THREE.BoxGeometry(9,12,9).translate(0,-6,0),steelM);
      const light=new THREE.Mesh(new THREE.BoxGeometry(7,1.6,0.4),lampM);light.position.set(0,-2,4.6);
      const roof=new THREE.Mesh(new THREE.BoxGeometry(11,1,11),deckM);
      cage.add(body,light,roof);lamps.push(light);
      cage.position.set(AX+Math.cos(a)*rr(400),Y(300),AZ+Math.sin(a)*rr(400));
      cage.rotation.y=-a;parts.push(cage);
      cages.push({cage,a,ph:k*1.9,lo:GB-40,hi:at(GT)+20,rr});
    }
  }

  // ---- a chamber opening off the shaft: a flattened sphere pushed out sideways ----
  function chamber(d,ang,R,H,mat){
    const g=new THREE.SphereGeometry(1,20,14);
    const m=new THREE.Mesh(g,mat||deepM);
    const r=radiusAt(d);
    m.position.set(AX+Math.cos(ang)*(r*0.55+R*0.45),Y(d),AZ+Math.sin(ang)*(r*0.55+R*0.45));
    m.scale.set(R,H/2,R*0.86);m.material.side=THREE.BackSide;   // seen from inside
    return m;
  }
  // a boardwalk: posts and a deck, run between two points at one depth
  function walk(d,a0,a1,rad,w){
    const out=[],n=Math.max(2,Math.round(Math.abs(a1-a0)*rad/18));
    for(let k=0;k<=n;k++){
      const a=a0+(a1-a0)*k/n,x=AX+Math.cos(a)*rad,z=AZ+Math.sin(a)*rad;
      out.push(box(x,Y(d)-0.4,z,w,0.5,w*0.9,deckM));
      if(k%2===0)out.push(box(x,Y(d)-5,z,0.7,5,0.7,steelM));
    }
    return out;
  }

  // ---- the fittings the Park Service put in ----
  // A handrail along an arc, which is what makes a deck read as somewhere people were allowed to stand.
  function rail(d,a0,a1,rad,h){
    const out=[],n=Math.max(2,Math.round(Math.abs(a1-a0)*rad/12));
    for(let k=0;k<=n;k++){
      const a=a0+(a1-a0)*k/n,x=AX+Math.cos(a)*rad,z=AZ+Math.sin(a)*rad;
      out.push(box(x,Y(d),z,0.35,h||1.1,0.35,steelM));
      if(k<n){const a2=a0+(a1-a0)*(k+1)/n,x2=AX+Math.cos(a2)*rad,z2=AZ+Math.sin(a2)*rad;
        const len=Math.hypot(x2-x,z2-z),bar=new THREE.Mesh(new THREE.BoxGeometry(len,0.12,0.12),steelM);
        bar.position.set((x+x2)/2,Y(d)+(h||1.1),(z+z2)/2);bar.rotation.y=-Math.atan2(z2-z,x2-x);out.push(bar);}
    }
    return out;
  }
  // a stair running down the wall between two depths, as flights with landings
  function stair(dTop,dBot,a0,turn){
    const out=[],n=Math.max(2,Math.round((dBot-dTop)/9));
    for(let k=0;k<n;k++){
      const d=dTop+(dBot-dTop)*k/n,a=a0+turn*k/n,rr=wallAt(d)*0.9;
      const fl=box(AX+Math.cos(a)*rr,Y(d),AZ+Math.sin(a)*rr,14,0.6,4.5,deckM);fl.rotation.y=-a;out.push(fl);
      const post=box(AX+Math.cos(a)*rr,Y(d)-4.5,AZ+Math.sin(a)*rr,0.5,4.5,0.5,steelM);out.push(post);
    }
    return out;
  }
  // an interpretive sign, lit: brown board, white legend, on two legs
  function sign(d,a,rad){
    const x=AX+Math.cos(a)*rad,z=AZ+Math.sin(a)*rad,out=[];
    const b=box(x,Y(d)+1.4,z,4,2.4,0.25,new THREE.MeshLambertMaterial({color:0x5d4632}));b.rotation.y=-a+Math.PI/2;
    const lit=box(x,Y(d)+2.0,z,3.2,0.9,0.4,lampM);lit.rotation.y=-a+Math.PI/2;lamps.push(lit);
    out.push(b,lit,box(x,Y(d),z,0.3,1.4,0.3,steelM));
    return out;
  }

  // ---- the layers ----
  LAYERS.forEach(L=>{
    const mid=(L.top+L.bottom)/2;
    CARDS.push({name:L.name,info:L.info||'',depth:mid,top:L.top,bottom:L.bottom});

    // the lamp strings the Park Service hung down the whole shaft, tight together where people walked
    const n=L.kind==='works'||L.kind==='collar'?26:16;
    for(let k=0;k<n;k++){
      const d=at(L.top+(L.bottom-L.top)*(k+0.5)/n),a=RNG()*Math.PI*2,rr=radiusAt(d)*0.94;
      const lp=new THREE.Mesh(new THREE.SphereGeometry(1.5,6,5),lampM);
      lp.position.set(AX+Math.cos(a)*rr,Y(d),AZ+Math.sin(a)*rr);parts.push(lp);lamps.push(lp);
      const gl=new THREE.Mesh(new THREE.SphereGeometry(11,8,6),glowM);gl.position.copy(lp.position);fine.push(gl);glows.push(gl);
    }

    if(L.kind==='collar'){
      // the poured collar, its ring beams, and the switchback ramp inside it
      for(let k=0;k<7;k++){
        const d=at(L.top+(L.bottom-L.top)*k/6),rr=radiusAt(d);
        const ring=new THREE.Mesh(new THREE.CylinderGeometry(rr*1.02,rr*1.02,5,SEG,1,true),collarM);
        ring.position.set(AX,Y(d),AZ);parts.push(ring);
      }
      for(let k=0;k<26;k++){
        const d=at(L.top+(L.bottom-L.top)*k/26),a=k*0.62,rr=radiusAt(d)*0.93;
        const s=box(AX+Math.cos(a)*rr,Y(d),AZ+Math.sin(a)*rr,16,1.2,7,deckM);s.rotation.y=-a;parts.push(s);
      }
      // the four elevator guides, running the whole height of the collar and on into the throat
      for(let k=0;k<4;k++){
        const a=0.5+k*Math.PI/2,rr=radiusAt(L.bottom)*0.97;
        parts.push(box(AX+Math.cos(a)*rr,Y(L.bottom+200),AZ+Math.sin(a)*rr,3,200+ (L.bottom-L.top),3,steelM));
      }
      // the ramp is walked, so it has a rail the whole way round, and the lip has one too
      for(const q of rail(at(L.top)+2,0,Math.PI*2,wallAt(at(L.top))*0.985,1.2))parts.push(q);
      for(let k=0;k<3;k++)for(const q of rail(at(L.top+(L.bottom-L.top)*(k+1)/4),0,Math.PI*2,wallAt(at(L.top+(L.bottom-L.top)*(k+1)/4))*0.9,1.1))parts.push(q);
      // what it says on the way in
      for(let k=0;k<5;k++)for(const q of sign(at(L.top+20+k*22),0.9+k*1.3,wallAt(at(L.top+20+k*22))*0.86))parts.push(q);
      // the gantry across the mouth that the cages hang from, and its winch houses
      for(let k=0;k<2;k++){
        const a=0.5+k*Math.PI;
        const beam=new THREE.Mesh(new THREE.BoxGeometry(wallAt(at(L.top))*2.1,3,5),steelM);
        beam.position.set(AX,Y(at(L.top))+6,AZ);beam.rotation.y=-a;parts.push(beam);
        parts.push(box(AX+Math.cos(a)*wallAt(at(L.top))*0.5,Y(at(L.top))+8,AZ+Math.sin(a)*wallAt(at(L.top))*0.5,8,5,7,deckM));
      }
    }

    if(L.kind==='throat'){
      // the Lower Visitor Center: a steel deck ringing the shaft at 420 m, with the mall standing on it
      const d=420,rr=radiusAt(d);
      const deck=new THREE.Mesh(new THREE.CylinderGeometry(rr*1.0,rr*1.0,2.4,SEG,1,true),deckM);
      deck.position.set(AX,Y(d),AZ);parts.push(deck);
      const floor=new THREE.Mesh(new THREE.RingGeometry(rr*0.52,rr*1.0,SEG),deckM);
      floor.rotation.x=-Math.PI/2;floor.position.set(AX,Y(d),AZ);floor.material.side=THREE.DoubleSide;parts.push(floor);
      for(let k=0;k<22;k++){
        const a=k/22*Math.PI*2,x=AX+Math.cos(a)*rr*0.76,z=AZ+Math.sin(a)*rr*0.76;
        const b=box(x,Y(d),z,13,6.5,9,k%3?deckM:steelM);b.rotation.y=-a;parts.push(b);
        const w=box(x+Math.cos(a)*4.6,Y(d)+1.4,z+Math.sin(a)*4.6,10,3,0.4,lampM);w.rotation.y=-a;parts.push(w);lamps.push(w);
      }
      for(let k=0;k<4;k++){   // the trailheads: tunnel mouths in the wall below the deck
        const a=0.5+k*Math.PI/2,rr2=radiusAt(470);
        const t=new THREE.Mesh(new THREE.CylinderGeometry(9,9,26,12,1,true),concreteM);
        t.position.set(AX+Math.cos(a)*rr2,Y(470),AZ+Math.sin(a)*rr2);
        t.rotation.z=Math.PI/2;t.rotation.y=-a;   // laid on its side, pointing into the wall
        parts.push(t);
      }
      // ---- the rest of the Lower Visitor Center ----
      // It is a shopping mall on a steel doughnut four hundred metres down a living shaft, and the point of
      // drawing it at all is that it looks like one: lit shopfronts, a rail you can lean on, a stair tower,
      // and the cantilevered overlook everybody queued for.
      for(const q of rail(d,0,Math.PI*2,rr*0.53,1.1))parts.push(q);         // the drop into the shaft
      for(const q of rail(d,0,Math.PI*2,rr*0.99,1.1))parts.push(q);
      for(let k=0;k<22;k++){                                                 // the upper floor and its windows
        const a=k/22*Math.PI*2,x=AX+Math.cos(a)*rr*0.78,z=AZ+Math.sin(a)*rr*0.78;
        const up=box(x,Y(d)+6.5,z,12,5,8,k%2?deckM:concreteM);up.rotation.y=-a;parts.push(up);
        const w=box(x+Math.cos(a)*4.2,Y(d)+8,z+Math.sin(a)*4.2,9,2.2,0.4,lampM);w.rotation.y=-a;parts.push(w);lamps.push(w);
      }
      for(let k=0;k<3;k++){                                                  // the stair and lift towers
        const a=1.1+k*2.1,x=AX+Math.cos(a)*rr*0.66,z=AZ+Math.sin(a)*rr*0.66;
        const tow=box(x,Y(d)-1,z,10,30,10,steelM);tow.rotation.y=-a;parts.push(tow);
        const cap=box(x,Y(d)+29,z,13,2,13,deckM);cap.rotation.y=-a;parts.push(cap);
      }
      {                                                                      // the overlook, out over the drop
        const a=2.35,len=rr*0.42;
        const arm=new THREE.Mesh(new THREE.BoxGeometry(len,1.2,14).translate(-len/2,0,0),deckM);
        arm.position.set(AX+Math.cos(a)*rr*0.53,Y(d)-0.6,AZ+Math.sin(a)*rr*0.53);arm.rotation.y=-a;parts.push(arm);
        for(const q of rail(d,a-0.16,a+0.16,rr*0.2,1.2))parts.push(q);
        for(const q of sign(d,a+0.3,rr*0.6))parts.push(q);
      }
      // the four radial catwalks out to the trailheads, and the stair on down to the forests
      for(let k=0;k<4;k++){
        const a=0.5+k*Math.PI/2,len=rr*0.44;
        const cw=new THREE.Mesh(new THREE.BoxGeometry(len,0.8,3.6).translate(len/2,0,0),deckM);
        cw.position.set(AX+Math.cos(a)*rr*0.99,Y(d)-1,AZ+Math.sin(a)*rr*0.99);cw.rotation.y=-a;parts.push(cw);
      }
      for(const q of stair(d+14,L.bottom-10,1.6,2.6))parts.push(q);
    }

    if(L.kind==='bronchial'){
      // two chambers, north and south, and the growth that fills them
      for(const side of [0,Math.PI]){
        parts.push(chamber(mid,side,210,340));
        for(let k=0;k<44;k++){
          const a=side+(RNG()-0.5)*1.5,dd=L.top+40+RNG()*(L.bottom-L.top-80);
          const rr=radiusAt(dd)+40+RNG()*150;
          const x=AX+Math.cos(a)*rr,z=AZ+Math.sin(a)*rr,h=30+RNG()*90;
          const trunk=new THREE.Mesh(new THREE.CylinderGeometry(1.6,4.5,h,7).translate(0,h/2,0),wetM);
          trunk.position.set(x,Y(dd),z);parts.push(trunk);
          for(let b=0;b<4;b++){   // the branching: each one splits twice and then stops
            const ba=RNG()*Math.PI*2,bl=h*0.35;
            const br=new THREE.Mesh(new THREE.CylinderGeometry(0.8,2.2,bl,6).translate(0,bl/2,0),wetM);
            br.position.set(x,Y(dd)+h*0.75,z);br.rotation.set(Math.cos(ba)*0.8,0,Math.sin(ba)*0.8);parts.push(br);
          }
        }
        // the boardwalk loop through the near half of the chamber, its rail, and what it is all for:
        // a platform out among the trunks with a sign on it
        const bd=L.top+150,brad=radiusAt(bd)+90;
        for(const p of walk(bd,side-0.7,side+0.7,brad,4))parts.push(p);
        for(const q of rail(bd,side-0.7,side+0.7,brad+2.2,1.1))parts.push(q);
        for(const q of rail(bd,side-0.7,side+0.7,brad-2.2,1.1))parts.push(q);
        {const pa=side+0.28,plat=box(AX+Math.cos(pa)*(brad+26),Y(bd)-0.6,AZ+Math.sin(pa)*(brad+26),22,0.9,16,deckM);
         plat.rotation.y=-pa;parts.push(plat);
         for(const q of rail(bd,pa-0.16,pa+0.16,brad+33,1.1))parts.push(q);
         for(const q of sign(bd,pa,brad+20))parts.push(q);
         parts.push(box(AX+Math.cos(pa)*(brad+26),Y(bd)-26,AZ+Math.sin(pa)*(brad+26),0.8,26,0.8,steelM));}
        // the vines: what hangs between the trunks, and the spores in the air under the lamps
        for(let k=0;k<70;k++){
          const a=side+(RNG()-0.5)*1.6,dd=L.top+30+RNG()*(L.bottom-L.top-60);
          const rr2=radiusAt(dd)+30+RNG()*190,len=20+RNG()*120;
          const v=new THREE.Mesh(new THREE.CylinderGeometry(0.35,0.12,len,4).translate(0,-len/2,0),wetM);
          v.position.set(AX+Math.cos(a)*rr2,Y(dd),AZ+Math.sin(a)*rr2);v.rotation.z=(RNG()-0.5)*0.3;parts.push(v);
        }
      }
      // Septum Falls: what the north chamber drains, 90 m of it
      const fa=0.25,fr=radiusAt(L.top+120)+120;
      const fall=new THREE.Mesh(new THREE.CylinderGeometry(3.5,6,90,10,1,true),
        new THREE.MeshLambertMaterial({color:0xc9b489,transparent:true,opacity:0.55,side:THREE.DoubleSide}));
      fall.position.set(AX+Math.cos(fa)*fr,Y(L.top+170),AZ+Math.sin(fa)*fr);parts.push(fall);
      movers.push({m:fall,kind:'fall'});
    }

    if(L.kind==='springs'){
      const pods=[];
      // the ballast pods: slack sacs on the wall, lit from inside, with the three soaking pools on decks
      // the pods carry their own light: they are the only thing down here that is lit from inside
      const podM=new THREE.MeshLambertMaterial({color:0xbe8a60,emissive:0x3c1e0a,emissiveIntensity:0.55});   // lit from inside, but they are sacs of ballast and not lamps
      for(let k=0;k<28;k++){
        const a=RNG()*Math.PI*2,dd=L.top+30+RNG()*(L.bottom-L.top-60),rr=radiusAt(dd);
        const R0=16+RNG()*26;
        const pod=new THREE.Mesh(new THREE.SphereGeometry(R0,12,9),podM);
        pod.scale.set(1,0.8+RNG()*0.4,1);
        pod.position.set(AX+Math.cos(a)*(rr-R0*0.5),Y(dd),AZ+Math.sin(a)*(rr-R0*0.5));
        parts.push(pod);pods.push(pod);
      }
      const steamM=new THREE.MeshBasicMaterial({color:0xe8d8c0,transparent:true,opacity:0.12,depthWrite:false});
      for(let k=0;k<3;k++){
        const a=k*2.1,rr=radiusAt(L.top+200)*0.8;
        for(const p of walk(L.top+200,a-0.4,a+0.4,rr,6))parts.push(p);
        for(const q of rail(L.top+200,a-0.4,a+0.4,rr+3.4,1.1))parts.push(q);
        const bath=new THREE.Mesh(new THREE.CylinderGeometry(11,11,2,16),
          new THREE.MeshPhongMaterial({color:0xe8c98e,specular:0xffffff,shininess:80,transparent:true,opacity:0.85}));
        bath.position.set(AX+Math.cos(a)*rr,Y(L.top+199),AZ+Math.sin(a)*rr);parts.push(bath);
        // the steam off it, which is the only weather down here
        for(let q2=0;q2<3;q2++){
          const st=new THREE.Mesh(new THREE.SphereGeometry(13+q2*7,8,6),steamM);
          st.position.set(AX+Math.cos(a)*rr,Y(L.top+192-q2*13),AZ+Math.sin(a)*rr);st.scale.y=0.55;
          parts.push(st);movers.push({m:st,kind:'steam',ph:RNG()*6.28,y:st.position.y});
        }
        // the changing hut and the duckboards
        const hx=AX+Math.cos(a+0.22)*rr,hz=AZ+Math.sin(a+0.22)*rr;
        const hut=box(hx,Y(L.top+200),hz,7,4,5,deckM);hut.rotation.y=-a;parts.push(hut);
        const win=box(hx+Math.cos(a)*3.6,Y(L.top+200)+2,hz+Math.sin(a)*3.6,4,1.4,0.3,lampM);win.rotation.y=-a;
        parts.push(win);lamps.push(win);
        for(const q of sign(L.top+200,a-0.5,rr))parts.push(q);
      }
      // Anodyne's tap: the lease took ballast from these pods, and the pipework is still bolted to the wall
      for(let k=0;k<9;k++){
        const a=4.9+k*0.13,rr=radiusAt(L.top+120)*0.99;
        parts.push(box(AX+Math.cos(a)*rr,Y(L.bottom-20),AZ+Math.sin(a)*rr,1.4,L.bottom-L.top-40,1.4,steelM));
      }
      {const a=4.96,rr=radiusAt(L.top+120)*0.93;
       const pump=box(AX+Math.cos(a)*rr,Y(L.top+250),AZ+Math.sin(a)*rr,16,9,11,steelM);pump.rotation.y=-a;parts.push(pump);
       const bea=new THREE.Mesh(new THREE.SphereGeometry(1.6,6,5),new THREE.MeshBasicMaterial({color:0xff3b24}));
       bea.position.set(AX+Math.cos(a)*rr,Y(L.top+240),AZ+Math.sin(a)*rr);parts.push(bea);movers.push({m:bea,kind:'strobe'});}
    }

    if(L.kind==='sea'){
      // a lake in a chamber off the shaft, and what the park hung over it
      // the lake sits in the belly of the chamber, not at its lip: put it a little below the centre and take
      // the chamber's own width at that height, or the water stands out past the rock it is supposed to be in
      const big=L.r1>140,R0=big?460:300,H0=520,dd=mid+H0*0.275,SR=R0*0.78;
      parts.push(chamber(mid,big?1.9:4.6,R0,520));
      const sea=new THREE.Mesh(new THREE.CircleGeometry(SR,40),
        new THREE.MeshPhongMaterial({color:new THREE.Color(L.water||'#c8d24a'),emissive:new THREE.Color(L.water||'#c8d24a'),
          emissiveIntensity:0.25,specular:0xffffff,shininess:60,side:THREE.DoubleSide}));
      sea.rotation.x=-Math.PI/2;
      const ca=big?1.9:4.6,cr=radiusAt(mid)*0.55+R0*0.45;
      sea.position.set(AX+Math.cos(ca)*cr,Y(dd),AZ+Math.sin(ca)*cr);parts.push(sea);
      movers.push({m:sea,kind:'sea',y:sea.position.y});
      if(!big){
        // the ferry terminal on the near shore, the dam holding the level, and the ferry itself
        const tx=AX+Math.cos(ca)*(cr-SR*0.86),tz=AZ+Math.sin(ca)*(cr-SR*0.86);
        parts.push(box(tx,Y(dd)-1,tz,44,9,26,deckM),box(tx,Y(dd)+8,tz,30,5,16,steelM));
        const dam=box(AX+Math.cos(ca)*(cr+SR*0.84),Y(dd)-14,AZ+Math.sin(ca)*(cr+SR*0.84),190,26,14,concreteM);
        dam.rotation.y=-ca;parts.push(dam);
        const ferry=box(tx,Y(dd)+0.5,tz,18,4,7,steelM);parts.push(ferry);
        movers.push({m:ferry,kind:'ferry',x0:tx,z0:tz,a:ca,R:SR*0.7});
        // the terminal is lit and has a roof, the jetty runs out into the water, and there are buoys on it
        const roof=box(tx,Y(dd)+13,tz,34,1.4,20,deckM);roof.rotation.y=-ca;parts.push(roof);
        for(let k=0;k<4;k++){const w=box(tx+Math.cos(ca)*13,Y(dd)+3+k*0,tz+Math.sin(ca)*13,26,2.4,0.4,lampM);
          w.rotation.y=-ca;parts.push(w);lamps.push(w);}
        const jetty=new THREE.Mesh(new THREE.BoxGeometry(70,1.2,7).translate(35,0,0),deckM);
        jetty.position.set(tx,Y(dd)+1.4,tz);jetty.rotation.y=-ca;parts.push(jetty);
        for(let k=0;k<7;k++){const ba=ca+(RNG()-0.5)*1.1,br=SR*(0.2+RNG()*0.7);
          const b=new THREE.Mesh(new THREE.SphereGeometry(1.8,6,5),new THREE.MeshLambertMaterial({color:0xd8481c}));
          b.position.set(tx+Math.cos(ba)*br,Y(dd)+1,tz+Math.sin(ba)*br);parts.push(b);}
        // the dam's spillway lights, on all night for fifty years
        for(let k=0;k<6;k++){const la=ca+(k-2.5)*0.055;
          const l=box(AX+Math.cos(la)*(cr+SR*0.84),Y(dd)+12,AZ+Math.sin(la)*(cr+SR*0.84),2,1,1,lampM);
          parts.push(l);lamps.push(l);}
      }else{
        // the resort: a shelf on the south wall with its 180 rooms, none of them with a window
        const sx=AX+Math.cos(ca+0.9)*(cr*0.55),sz=AZ+Math.sin(ca+0.9)*(cr*0.55);
        const shelf=box(sx,Y(dd-120),sz,150,6,70,concreteM);shelf.rotation.y=-ca;parts.push(shelf);
        for(let k=0;k<5;k++){
          const b=box(sx,Y(dd-126-k*11),sz,130-k*8,10,56,k%2?deckM:steelM);b.rotation.y=-ca;parts.push(b);
          const w=box(sx+Math.cos(ca)*29,Y(dd-126-k*11)+4,sz+Math.sin(ca)*29,120-k*8,3.5,0.5,lampM);
          w.rotation.y=-ca;parts.push(w);lamps.push(w);
        }
        // the funicular down to the water, the landing at the bottom of it, and the terrace on the roof
        {const fl=new THREE.Mesh(new THREE.BoxGeometry(4,150,4),steelM);
         fl.position.set(sx+Math.cos(ca)*40,Y(dd-60),sz+Math.sin(ca)*40);fl.rotation.z=0.22;fl.rotation.y=-ca;parts.push(fl);
         const car=box(sx+Math.cos(ca)*46,Y(dd-40),sz+Math.sin(ca)*46,6,5,5,deckM);car.rotation.y=-ca;parts.push(car);
         movers.push({m:car,kind:'lift',y0:Y(dd-40),amp:96,ph:1.2});
         const landing=box(sx+Math.cos(ca)*58,Y(dd)+1,sz+Math.sin(ca)*58,26,1.2,12,deckM);landing.rotation.y=-ca;parts.push(landing);
         for(const q of rail(dd-0.1,ca-0.12,ca+0.12,Math.hypot(sx+Math.cos(ca)*58-AX,sz+Math.sin(ca)*58-AZ),1.1))parts.push(q);}
        for(const q of sign(dd-120,ca+0.5,cr*0.6))parts.push(q);
      }
    }

    if(L.kind==='works'){
      // Little Detroit: the lower works hung off the wall, the pipe stack running up the shaft, and the drain.
      // It is a town of sorts - bunkhouses, shops, a canteen and a chapel stacked on a rack bolted to a living
      // wall, three kilometres down, with a crane over it and a catwalk to everything. Nobody planned it.
      const dd=L.top+150,rr=radiusAt(dd);
      const rustM=new THREE.MeshLambertMaterial({color:0x6e4a3a,flatShading:true});
      const CRATE=[0x7a5a3e,0x4c5a62,0x6d4340,0x59614e,0x7b6a4a];
      for(let k=0;k<7;k++){
        const a=k/7*Math.PI*2*0.55+2.4;
        const b=box(AX+Math.cos(a)*(rr-22),Y(dd+k*16),AZ+Math.sin(a)*(rr-22),34,12,22,steelM);
        b.rotation.y=-a;parts.push(b);
        const lp=box(AX+Math.cos(a)*(rr-38),Y(dd+k*16)+6,AZ+Math.sin(a)*(rr-38),8,2,2,lampM);parts.push(lp);lamps.push(lp);
      }
      // the town: containers stacked four high on the rack, every one of them a different weather
      for(let k=0;k<54;k++){
        const a=2.4+RNG()*1.9,lev=Math.floor(RNG()*5),dd2=dd+lev*16+2,rr2=rr-14-RNG()*26;
        const w=9+RNG()*7,h=5+RNG()*3;
        const c=new THREE.Mesh(new THREE.BoxGeometry(w,h,7).translate(0,h/2,0),
          new THREE.MeshLambertMaterial({color:CRATE[Math.floor(RNG()*CRATE.length)],flatShading:true}));
        c.position.set(AX+Math.cos(a)*rr2,Y(dd2),AZ+Math.sin(a)*rr2);c.rotation.y=-a+(RNG()-0.5)*0.2;parts.push(c);
        if(RNG()<0.75){const w2=box(AX+Math.cos(a)*(rr2-3.8),Y(dd2)+h*0.45,AZ+Math.sin(a)*(rr2-3.8),w*0.5,1.4,0.3,lampM);
          w2.rotation.y=-a;parts.push(w2);lamps.push(w2);}
      }
      // the catwalk web between the levels, and the ladders
      for(let k=0;k<5;k++){
        const dd2=dd+k*16+2;
        for(const q of walk(dd2,2.4,4.3,rr-30,3))parts.push(q);
        for(const q of rail(dd2,2.4,4.3,rr-27,1.0))parts.push(q);
        if(k<4)parts.push(box(AX+Math.cos(3.35)*(rr-30),Y(dd2+16),AZ+Math.sin(3.35)*(rr-30),1.2,16,1.2,steelM));
      }
      // the crane on the top deck, slewing over the drop
      {const ca2=3.1,cx=AX+Math.cos(ca2)*(rr-30),cz=AZ+Math.sin(ca2)*(rr-30);
       const mast=box(cx,Y(dd+82),cz,3,34,3,steelM);parts.push(mast);
       const jib=new THREE.Mesh(new THREE.BoxGeometry(72,2,3).translate(-22,0,0),steelM);
       jib.position.set(cx,Y(dd+116),cz);parts.push(jib);movers.push({m:jib,kind:'crane',ph:RNG()*6.28});
       const hook=box(cx,Y(dd+96),cz,1.6,1.6,1.6,steelM);parts.push(hook);}
      // the flare: what they burn off, and the only thing down here that makes its own light
      {const fa=2.2,fx=AX+Math.cos(fa)*(rr-10),fz=AZ+Math.sin(fa)*(rr-10);
       parts.push(box(fx,Y(dd+40),fz,2.4,70,2.4,rustM));
       const flame=new THREE.Mesh(new THREE.ConeGeometry(4,16,7),
         new THREE.MeshBasicMaterial({color:0xffa23c,transparent:true,opacity:0.75,blending:THREE.AdditiveBlending,depthWrite:false}));
       flame.position.set(fx,Y(dd+40)+78,fz);parts.push(flame);movers.push({m:flame,kind:'flame'});}
      // 2007: the catwalk that came down, and the wreck of the rig at the bottom of the drain
      {const wa=1.6,wr=radiusAt(L.bottom-60)*0.8;
       for(let k=0;k<5;k++){
         const b=box(AX+Math.cos(wa+k*0.12)*wr,Y(L.bottom-40-k*9),AZ+Math.sin(wa+k*0.12)*wr,16,0.8,4,deckM);
         b.rotation.set((RNG()-0.5)*0.8,-wa,(RNG()-0.5)*0.9);parts.push(b);}
       const rig=box(AX+Math.cos(wa)*wr*0.3,Y(L.bottom-6),AZ+Math.sin(wa)*wr*0.3,22,14,16,rustM);
       rig.rotation.set(0.5,-wa,0.24);parts.push(rig);
       const bea=new THREE.Mesh(new THREE.SphereGeometry(2,6,5),new THREE.MeshBasicMaterial({color:0xff3b24}));
       bea.position.set(AX+Math.cos(wa)*wr*0.3,Y(L.bottom-20),AZ+Math.sin(wa)*wr*0.3);parts.push(bea);
       movers.push({m:bea,kind:'strobe'});}
      for(let k=0;k<3;k++){   // the pipe stack: it runs from here to the surface and is the tallest thing in the park
        const a=2.0+k*0.22,rr2=radiusAt(1400)*0.97;
        parts.push(box(AX+Math.cos(a)*rr2,Y(DEEP),AZ+Math.sin(a)*rr2,3.4,DEEP-60,3.4,steelM));
      }
      // the drain: the shaft goes on, and the dark below it is where the park stops being a park
      const drain=new THREE.Mesh(new THREE.CylinderGeometry(radiusAt(DEEP)*0.8,8,420,SEG,1,true),deepM);
      drain.position.set(AX,Y(DEEP+210),AZ);parts.push(drain);
    }
  });

  // ---- everything into the scene, under one group so the page can hide it all at once ----
  const grp=new THREE.Group();
  for(const p of parts){p.castShadow=false;p.receiveShadow=false;grp.add(p);}
  // and the growth on the wall in a group of its own, because it is the one thing that does not belong in the
  // section view: it hangs off the near wall as much as the far one, and the near wall is what was cut away.
  const fineG=new THREE.Group();
  for(const p of fine){p.castShadow=false;p.receiveShadow=false;fineG.add(p);}
  grp.add(fineG);ctx.pitFine=fineG;
  scene.add(grp);

  // ---- it is alive ----
  // Peristalsis: the whole shaft swells and relaxes on a twenty-two second cycle - the twenty-two minutes of
  // the card, sped up so you can see it - and the lamps flicker the way a fifty-year-old string does.
  let t0=performance.now();
  animHooks.push(now=>{
    const t=(now-t0)/1000;
    const breath=1+0.012*Math.sin(t*Math.PI*2/22);
    grp.scale.set(breath,1,breath);
    const flick=0.86+0.14*Math.sin(t*7.3)*Math.sin(t*2.1);
    lampM.color.setRGB(1*flick,0.85*flick,0.63*flick);
    glowM.opacity=0.22+0.08*Math.sin(t*1.7);
    for(const m of movers){
      if(m.kind==='sea')m.m.position.y=m.y+0.8*Math.sin(t*0.6);
      if(m.kind==='fall')m.m.material.opacity=0.45+0.15*Math.sin(t*3.1);
      if(m.kind==='ferry'){const u=(t*0.02)%1,a=m.a+Math.PI*(u<0.5?u*2:2-u*2)*0.5;
        m.m.position.set(m.x0+Math.cos(a)*m.R*(u<0.5?u*2:2-u*2),m.m.position.y,m.z0+Math.sin(a)*m.R*(u<0.5?u*2:2-u*2));}
      if(m.kind==='steam'){m.m.position.y=m.y+6*((t*0.06+m.ph)%1);m.m.material.opacity=0.14*(1-((t*0.06+m.ph)%1));}
      if(m.kind==='strobe')m.m.visible=(now%1600)<260;
      if(m.kind==='lift')m.m.position.y=m.y0-m.amp*0.5*(1-Math.cos(t*0.08+m.ph));
      if(m.kind==='crane')m.m.rotation.y=0.5*Math.sin(t*0.05+m.ph);
      if(m.kind==='flame'){const f=0.6+0.4*Math.abs(Math.sin(t*5.1)+0.4*Math.sin(t*13));
        m.m.scale.set(0.8+0.3*f,f,0.8+0.3*f);m.m.material.opacity=0.55+0.35*f;}
    }
    // the cages, running their guides: each one takes its own time about it
    for(const c of cages){
      const u=0.5-0.5*Math.cos(t*0.05+c.ph),d=c.hi+(c.lo-c.hi)*u;
      c.cage.position.set(AX+Math.cos(c.a)*c.rr(d),Y(d),AZ+Math.sin(c.a)*c.rr(d));
    }
  });

  ctx.pitLayers=CARDS;
  ctx.details=Object.assign(ctx.details||{},{pitLayers:CARDS.length,pitDepth:DEEP,pitParts:parts.length,pitLamps:lamps.length});
}
