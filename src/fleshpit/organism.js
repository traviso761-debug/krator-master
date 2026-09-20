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
  const {THREE,C,ctx,scene,animHooks,groundH}=api;
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
  const SEG=48, STEP=12;
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
    return c.multiplyScalar(0.35+0.65*Math.max(0,1-d/DEEP));   // the light does not reach the bottom
  };
  {
    const pos=[],nor=[],col=[],idx=[],rings=[];
    for(let d=D0-14;d<=DEEP+140;d+=STEP){
      const r=radiusAt(d),y=Y(d),c=colourAt(d),row=[];
      for(let k=0;k<SEG;k++){
        const a=k/SEG*Math.PI*2;
        // the wall is not a cylinder: it is ribbed round and lumpy down, and the lumps move with depth
        const wob=1+0.055*Math.sin(a*6+d*0.02)+0.035*Math.sin(a*11-d*0.013)+0.05*Math.sin(d*0.05+k);
        const rr=r*wob;
        row.push(pos.length/3);
        pos.push(AX+Math.cos(a)*rr,y,AZ+Math.sin(a)*rr);
        nor.push(Math.cos(a),0,Math.sin(a));                    // outward; back-face rendering flips them for the light
        col.push(c.r,c.g,c.b);
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

  // ---- the layers ----
  const lamps=[],glows=[],movers=[];
  LAYERS.forEach(L=>{
    const mid=(L.top+L.bottom)/2;
    CARDS.push({name:L.name,info:L.info||'',depth:mid,top:L.top,bottom:L.bottom});

    // the lamp strings the Park Service hung down the whole shaft, tight together where people walked
    const n=L.kind==='works'||L.kind==='collar'?26:16;
    for(let k=0;k<n;k++){
      const d=at(L.top+(L.bottom-L.top)*(k+0.5)/n),a=RNG()*Math.PI*2,rr=radiusAt(d)*0.94;
      const lp=new THREE.Mesh(new THREE.SphereGeometry(1.5,6,5),lampM);
      lp.position.set(AX+Math.cos(a)*rr,Y(d),AZ+Math.sin(a)*rr);parts.push(lp);lamps.push(lp);
      const gl=new THREE.Mesh(new THREE.SphereGeometry(17,8,6),glowM);gl.position.copy(lp.position);parts.push(gl);glows.push(gl);
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
        // the boardwalk loop through the near half of the chamber
        for(const p of walk(L.top+150,side-0.7,side+0.7,radiusAt(L.top+150)+90,4))parts.push(p);
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
      const podM=new THREE.MeshLambertMaterial({color:0xd8a06a,emissive:0x7a3f14,emissiveIntensity:0.9});
      for(let k=0;k<28;k++){
        const a=RNG()*Math.PI*2,dd=L.top+30+RNG()*(L.bottom-L.top-60),rr=radiusAt(dd);
        const R0=16+RNG()*26;
        const pod=new THREE.Mesh(new THREE.SphereGeometry(R0,12,9),podM);
        pod.scale.set(1,0.8+RNG()*0.4,1);
        pod.position.set(AX+Math.cos(a)*(rr-R0*0.5),Y(dd),AZ+Math.sin(a)*(rr-R0*0.5));
        parts.push(pod);pods.push(pod);
      }
      for(let k=0;k<3;k++){
        const a=k*2.1,rr=radiusAt(L.top+200)*0.8;
        for(const p of walk(L.top+200,a-0.4,a+0.4,rr,6))parts.push(p);
        const bath=new THREE.Mesh(new THREE.CylinderGeometry(11,11,2,16),
          new THREE.MeshPhongMaterial({color:0xe8c98e,specular:0xffffff,shininess:80,transparent:true,opacity:0.85}));
        bath.position.set(AX+Math.cos(a)*rr,Y(L.top+199),AZ+Math.sin(a)*rr);parts.push(bath);
      }
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
      }else{
        // the resort: a shelf on the south wall with its 180 rooms, none of them with a window
        const sx=AX+Math.cos(ca+0.9)*(cr*0.55),sz=AZ+Math.sin(ca+0.9)*(cr*0.55);
        const shelf=box(sx,Y(dd-120),sz,150,6,70,concreteM);shelf.rotation.y=-ca;parts.push(shelf);
        for(let k=0;k<5;k++){
          const b=box(sx,Y(dd-126-k*11),sz,130-k*8,10,56,k%2?deckM:steelM);b.rotation.y=-ca;parts.push(b);
          const w=box(sx+Math.cos(ca)*29,Y(dd-126-k*11)+4,sz+Math.sin(ca)*29,120-k*8,3.5,0.5,lampM);
          w.rotation.y=-ca;parts.push(w);lamps.push(w);
        }
      }
    }

    if(L.kind==='works'){
      // Little Detroit: the lower works hung off the wall, the pipe stack running up the shaft, and the drain
      const dd=L.top+150,rr=radiusAt(dd);
      for(let k=0;k<7;k++){
        const a=k/7*Math.PI*2*0.55+2.4;
        const b=box(AX+Math.cos(a)*(rr-22),Y(dd+k*16),AZ+Math.sin(a)*(rr-22),34,12,22,steelM);
        b.rotation.y=-a;parts.push(b);
        const lp=box(AX+Math.cos(a)*(rr-38),Y(dd+k*16)+6,AZ+Math.sin(a)*(rr-38),8,2,2,lampM);parts.push(lp);lamps.push(lp);
      }
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
    }
  });

  ctx.pitLayers=CARDS;
  ctx.details=Object.assign(ctx.details||{},{pitLayers:CARDS.length,pitDepth:DEEP,pitParts:parts.length,pitLamps:lamps.length});
}
