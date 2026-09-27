// ---------- the page three ships share ----------
// None of these run on the shared engine, for the same reason the habitat does not: the engine builds a
// plane with gravity down it and a sky dome over the lot, and out here there is no ground, no down, and the
// sky is the whole sphere. So this is a small renderer of its own - a turntable camera round one object, a
// star field, a backdrop of planets and nebulae read out of the city file, and the same panels, wireframe
// and menagerie menu every other page on the site has.
//
// Everything that is specific to a ship is in its own module and arrives here as `model(api)`. This file
// knows nothing about saucers.
//
// Fan work. Star Trek belongs to Paramount; nothing from any film, series or game is used.
import {report,LOAD,configureLoading,installErrorHandlers,stage,section} from '../core/diag.js';
import {installMenagerie} from '../core/menagerie.js';
import {createWire,installWireUI} from '../core/wire.js';
import {createRenderer,trackResize,installContextLoss,mkBtn,runHooks,runLoop,finishLoading,boot} from '../core/shell.js';
import {readHash,writeHash} from '../core/hash.js';
import {mergeParts,fold,hullPalette} from './parts.js';

const getJSON=u=>fetch(u).then(r=>{if(!r.ok)throw new Error(u+': HTTP '+r.status);return r.json();});

// ---------- the sky ----------
// A star field, and whatever the city file says is out there. Both are drawn a long way off and neither is
// ever occluded by anything, so they go on their own layer of distance rather than into the depth buffer's
// argument: the ship is metres across and the planet is thousands of kilometres away, and a single depth
// range cannot hold both without the near clip eating the hull.
function buildSky(THREE,scene,K,rnd){
  const D=K.far||900000;
  const out={bodies:[]};
  // ---- stars ----
  {
    const n=K.stars||3200;
    const pos=new Float32Array(n*3),col=new Float32Array(n*3);
    for(let i=0;i<n;i++){
      const u=rnd()*2-1,th=rnd()*Math.PI*2,s=Math.sqrt(1-u*u);
      pos[i*3]=s*Math.cos(th)*D;pos[i*3+1]=u*D;pos[i*3+2]=s*Math.sin(th)*D;
      // a band of extra brightness round the galactic plane, and a little colour in the brightest of them
      const band=1+0.7*Math.exp(-Math.pow(u/0.14,2));
      const b=Math.min(1,(0.3+0.7*Math.pow(rnd(),2.4))*band);
      const warm=rnd()<0.18,cool=rnd()<0.14;
      col[i*3]=b*(warm?1:cool?0.78:0.9);col[i*3+1]=b*0.9;col[i*3+2]=b*(cool?1:warm?0.74:0.92);
    }
    const g=new THREE.BufferGeometry();
    g.setAttribute('position',new THREE.BufferAttribute(pos,3));
    g.setAttribute('color',new THREE.BufferAttribute(col,3));
    const p=new THREE.Points(g,new THREE.PointsMaterial({size:K.starSize||1500,vertexColors:true,
      sizeAttenuation:true,transparent:true,opacity:0.95,depthWrite:false,fog:false}));
    p.userData.noWire=true;p.frustumCulled=false;scene.add(p);
  }
  // ---- nebulae ----
  // Shells of very faint additive cloud. A nebula is not an object with an edge, so it is built as a lot of
  // overlapping puffs at slightly different distances and left to accumulate.
  for(const nb of (K.nebulae||[])){
    const g=new THREE.Group();
    const base=new THREE.Color(nb.colour||'#4a2a6e');
    const R=nb.size||D*0.35;
    // The first version of this used two dozen big low-polygon spheres and you could count the facets on
    // every one of them. A nebula has no edge and no surface, so what works is a great many small puffs,
    // each almost invisible on its own and each fading out towards its own edge, left to pile up where
    // they overlap.
    const n=nb.puffs||300;
    const mats=[];
    for(let k=0;k<3;k++){
      const c=base.clone();
      c.offsetHSL((k-1)*0.035,0,(k-1)*0.05);
      mats.push(new THREE.MeshBasicMaterial({color:c,transparent:true,opacity:nb.opacity||0.0072,
        depthWrite:false,blending:THREE.AdditiveBlending,fog:false}));
    }
    // A single additive sphere is a flat disc with a hard edge: one layer of fragments, all at the same
    // opacity, so what you see is a circle. Three nested shells per puff is a three-step radial falloff,
    // and with enough puffs overlapping that reads as cloud instead of as a bag of marbles. They are all
    // merged per colour afterwards, so a two-hundred-puff nebula costs three draw calls.
    const bins=[[],[],[]];
    for(let i=0;i<n;i++){
      // Two thirds of them go into a dense core where every puff is buried in its neighbours, and the
      // rest into a thin halo where they are small enough not to be read as individual circles. A nebula
      // that is evenly scattered at one size reads as exactly what it is - a few dozen balls - however
      // faint each one is.
      const core=i%3!==2;
      const knot=Math.floor(rnd()*4);
      const kx=Math.sin(knot*2.7)*R*0.42,ky=Math.sin(knot*5.1)*R*0.16,kz=Math.cos(knot*1.9)*R*0.42;
      const sp=core?0.34:1.00, rad=core?(0.07+rnd()*0.11):(0.025+rnd()*0.045);
      const r0=R*rad;
      const px=kx+(rnd()-0.5)*R*2*sp,py=ky+(rnd()-0.5)*R*0.9*sp,pz=kz+(rnd()-0.5)*R*2*sp;
      const sx=1+rnd()*0.6,sy=0.40+rnd()*0.35,sz=1+rnd()*0.6;
      const rot=[rnd()*6.28,rnd()*6.28,rnd()*6.28];
      for(const shell of [1,0.74,0.48]){
        const sMesh=new THREE.Mesh(new THREE.SphereGeometry(r0*shell,9,7),mats[i%3]);
        sMesh.position.set(px,py,pz);sMesh.scale.set(sx,sy,sz);
        sMesh.rotation.set(rot[0],rot[1],rot[2]);
        bins[i%3].push(sMesh);
      }
    }
    for(let k=0;k<3;k++)if(bins[k].length)g.add(mergeParts(THREE,bins[k],mats[k]));
    const a=nb.az===undefined?2.2:nb.az,e=nb.el===undefined?0.2:nb.el,d=(nb.dist||0.86)*D;
    g.position.set(Math.cos(a)*Math.cos(e)*d,Math.sin(e)*d,Math.sin(a)*Math.cos(e)*d);
    // the whole sky is excluded from the wireframe and from the geometry fingerprint: what the test
    // suite is checking is the ship, not the weather behind it
    g.traverse(o=>{o.userData.noWire=true;o.frustumCulled=false;});
    scene.add(g);
  }
  // ---- worlds ----
  // Vertex colours on a sphere, because there are no textures anywhere in this project. A gas giant is
  // bands; a terrestrial world is ocean with continents thrown on it, ice at the poles and a separate layer
  // of cloud, which is most of what makes a planet look like one rather than like a marble.
  for(const b of (K.bodies||[])){
    const a=b.az||0,e=b.el||0,dist=(b.dist||0.6)*D;
    const R=Math.tan((b.deg||6)*Math.PI/180)*dist;
    const g=new THREE.Group();
    const geo=new THREE.SphereGeometry(R,b.seg||56,Math.round((b.seg||56)*0.6));
    const pos=geo.attributes.position,cols=[];
    const c=new THREE.Color(),t2=new THREE.Color();
    const pal=(b.colours||['#2a5f8c','#2f6a44','#8a7a52','#e8eef2']).map(h=>new THREE.Color(h));
    const seedA=rnd()*9,seedB=rnd()*9,seedC=rnd()*9;
    for(let i=0;i<pos.count;i++){
      const x=pos.getX(i)/R,y=pos.getY(i)/R,z=pos.getZ(i)/R;
      if(b.kind==='gas'){
        // Bands, and the trouble with bands is the join. Rounding a latitude into a palette index gives a
        // staircase where the band edge crosses the sphere's triangles; what is wanted is a band that is
        // FLAT across most of its width and blends over the last fifth, with enough wobble along it to
        // look like weather shearing against the next band along.
        const f=(y*0.5+0.5);
        const q=f*(b.bands||9)+0.55*Math.sin(y*8.4+seedA)+0.22*Math.sin(y*21+x*2.2+seedB)
               +0.12*Math.sin(z*17-y*9+seedC);
        const i0=Math.floor(q),fr=q-i0,L=pal.length;
        const A=pal[((i0%L)+L)%L],B=pal[(((i0+1)%L)+L)%L];
        const w=Math.min(1,Math.max(0,(fr-0.62)/0.34));
        c.copy(A).lerp(B,w*w*(3-2*w));
        c.multiplyScalar(0.95+0.05*Math.sin(y*57+seedB*3));
        c.multiplyScalar(1-0.16*Math.pow(Math.abs(y),3));      // the poles are duller than the equator
      }else{
        // Continents. The first go at this was three low-frequency waves thresholded, and from any
        // distance it read as three smooth stripes of colour wrapped round a ball: no coastline, no
        // detail, and a stair-step where the ice threshold crossed the sphere's triangles. What a
        // planet actually needs is octaves - a few big shapes to place the land masses, a few medium
        // ones to break the coasts up, and a fine one to keep the interiors from going flat - and a
        // coastal shelf, because the pale band of shallow water round a coast is most of what says
        // "ocean" rather than "blue paint".
        const S1=Math.sin, C1=Math.cos;
        const n= 1.00*S1(x*2.1+seedA)*C1(z*1.9+seedB)
               + 0.78*S1(z*3.4+seedC)*C1(y*3.1+seedA*1.7)
               + 0.52*S1((x+y)*5.3+seedB*2)*C1((z-x)*4.9+seedC*1.3)
               + 0.34*S1((y-z)*8.9+seedA*2.3)*C1((x+z)*7.7+seedB*1.9)
               + 0.20*S1(x*15.3+seedC*3)*C1(z*13.9+seedB*3)
               + 0.12*S1(y*23.1+seedA*4);
        const grain=0.09*S1(x*29+seedB*5)*C1(z*27+seedA*5);
        const sstep=(e0,e1,v)=>{const u=Math.min(1,Math.max(0,(v-e0)/(e1-e0)));return u*u*(3-2*u);};
        // the ice edge wanders instead of being drawn along a line of latitude, and it fades in over a
        // few degrees rather than switching at one
        const iceLat=(b.ice===undefined?0.86:b.ice)
                   -0.06*S1(x*4.3+seedC)-0.05*C1(z*5.9+seedA)-0.03*S1((x+z)*11+seedB);
        const SEA=0.40;
        if(n>SEA){
          // land: greener at the coast, drier towards the middle of a continent
          const inland=Math.min(1,(n-SEA)*0.85);
          c.copy(pal[1]).lerp(pal[2]||pal[1],inland*inland);
          c.multiplyScalar(0.92+grain*1.6+0.10*S1(x*9.1+z*7.3+seedB));
        }else{
          // Water, as a continuous ramp from the shelf down to the deeps. This used to be two bands with
          // a hard step between them, and because a sphere at sixty-four segments cannot resolve a band
          // that narrow, the step came out as a staircase of rectangles across half the planet. A ramp
          // has nothing to alias.
          const deep=pal[0].clone().multiplyScalar(0.74);
          const shelf=pal[0].clone().lerp(pal[3]||pal[0],0.34).multiplyScalar(1.10);
          c.copy(shelf).lerp(deep,sstep(0,1,(SEA-n)/0.34));
          c.multiplyScalar(1+grain*0.5);
        }
        c.lerp(pal[3]||pal[0],sstep(iceLat-0.05,iceLat+0.03,Math.abs(y))*0.96);
      }
      cols.push(c.r,c.g,c.b);
    }
    geo.setAttribute('color',new THREE.Float32BufferAttribute(cols,3));
    const world=new THREE.Mesh(geo,new THREE.MeshLambertMaterial({vertexColors:true,fog:false}));
    g.add(world);
    if(b.clouds){
      // Patches lying on the surface, not lumps standing on it. A sphere - however flattened - gets its own
      // light and dark side and reads as a boulder; a disc has one normal, shades evenly, and darkens on
      // the night side along with the ground under it, which is what a cloud does.
      //
      // The version before this one used four hundred discs of up to seven per cent of the planet's radius
      // scattered at random, and from any distance it read as torn paper stuck to a marble. Weather is not
      // scattered: it is in SYSTEMS, it is drawn out east-west by the rotation, and any one piece of it is
      // small. So these are laid down as a few dozen systems of small drawn-out discs, thickest either
      // side of the equator and thinning towards the poles, which is where the water is.
      const cm=new THREE.MeshLambertMaterial({color:0xf6fafc,transparent:true,opacity:0.62,fog:false});
      const systems=b.cloudSystems||46, per=Math.max(4,Math.round((b.cloudPuffs||900)/systems));
      const puffs=[];
      for(let sIdx=0;sIdx<systems;sIdx++){
        // where this system sits: biased to the two mid-latitude storm belts and the equator
        const belt=[0,0.34,-0.34,0.6,-0.6][sIdx%5];
        const u0=Math.max(-0.95,Math.min(0.95,belt+(rnd()-0.5)*0.30));
        const th0=rnd()*Math.PI*2;
        const spin=rnd()<0.5?-1:1;
        for(let i=0;i<per;i++){
          const t=i/per;
          // a comma-shaped trail: it curls as it goes, which is the whole look of a weather system
          const u=Math.max(-0.995,Math.min(0.995,u0+(rnd()-0.5)*0.10+spin*t*0.05*Math.sin(t*3)));
          const th=th0+(rnd()-0.5)*0.34+spin*t*0.26;
          const s=Math.sqrt(1-u*u);
          const pf=new THREE.Mesh(new THREE.CircleGeometry(R*(0.008+rnd()*0.017),14),cm);
          pf.position.set(s*Math.cos(th)*R*1.004,u*R*1.004,s*Math.sin(th)*R*1.004);
          pf.lookAt(pf.position.clone().multiplyScalar(2));
          // drawn out along the parallel, because that is the direction everything on a planet gets drawn
          pf.rotation.z=(rnd()-0.5)*0.5;
          pf.scale.set(2.2+rnd()*1.8,0.55+rnd()*0.5,1);
          puffs.push(pf);
        }
      }
      // a thousand discs is a thousand draw calls if they are left loose; they all share one material and
      // none of them ever moves on its own, so they go into the planet as a single mesh
      g.add(mergeParts(THREE,puffs,cm));
    }
    if(b.ring){
      // Rings are not a disc: they are a great many narrow ringlets with gaps between them, brightest
      // where the ice is thickest, and they have to be lit from both sides because you see them edge-on
      // from above the plane and lit from below it.
      const rc=new THREE.Color(b.ring.colour||'#b4a88c');
      const n=b.ring.bands||14;
      const inner=b.ring.inner||1.35, outer=b.ring.outer||2.35;
      for(let i=0;i<n;i++){
        const t=i/n, t2=(i+1)/n;
        const r0=R*(inner+(outer-inner)*t), r1=R*(inner+(outer-inner)*t2)*0.985;
        // a couple of dark divisions, and the ringlets thinning out at both edges
        const gap=(i===Math.floor(n*0.62))||(i===Math.floor(n*0.30));
        if(gap)continue;
        const fade=Math.min(1,Math.min(t+0.18,1.06-t)*2.1);
        const c=rc.clone().multiplyScalar(0.72+0.42*((i*7)%5)/4);
        // Lambert alone leaves a ring system nearly black, because the star is only a few degrees above
        // the ring plane and that is geometrically correct and visually useless. A little emissive puts
        // the ice back without flattening the lit side.
        const rm=new THREE.MeshLambertMaterial({color:c,emissive:c.clone().multiplyScalar(0.42),
          transparent:true,opacity:(b.ring.opacity||0.62)*fade,side:THREE.DoubleSide,
          fog:false,depthWrite:false});
        const rg=new THREE.Mesh(new THREE.RingGeometry(r0,r1,96),rm);
        rg.rotation.x=Math.PI/2;g.add(rg);
      }
      g.rotation.z=b.ring.tilt===undefined?0.38:b.ring.tilt;
    }
    g.position.set(Math.cos(a)*Math.cos(e)*dist,Math.sin(e)*dist,Math.sin(a)*Math.cos(e)*dist);
    g.rotation.y=b.spin||0;
    g.traverse(o=>{o.userData.noWire=true;o.frustumCulled=false;});
    scene.add(g);
    out.bodies.push({g,b});
  }
  return out;
}

export async function starshipPage(opts){
  installErrorHandlers();window.LOAD=LOAD;
  configureLoading({prefix:opts.prefix||'loading… ',labels:opts.labels||{},lines:opts.lines||[]});
  const ctx=window._iz={};
  boot(run);

  async function run(){
    if(!window.THREE){document.getElementById('loading').textContent=
      'three.js did not load (vendor/three/three.min.js). Check the site mounts and reload.';return;}
    const THREE=window.THREE;
    await stage('config');
    const C=await getJSON('data/cities/'+opts.city+'.json');
    document.getElementById('title').textContent=(C.name||opts.city).toUpperCase();
    if(C.attribution){const at=document.createElement('div');at.id='attribution';
      at.textContent=C.attribution;document.body.appendChild(at);}

    const scene=new THREE.Scene();
    const camera=new THREE.PerspectiveCamera(48,innerWidth/innerHeight,0.6,2400000);
    const renderer=createRenderer(THREE,{pixelCap:1.8,clear:0x020306});
    installContextLoss(renderer);
    const animHooks=[];

    // ---- light ----
    // One star, hard, from a fixed direction, and almost nothing to fill it: space has no sky to bounce
    // light off, so the shadowed side of a hull is nearly black and that is correct. A little ambient keeps
    // the panelling from disappearing entirely, and a dim fill from the planet's direction stands in for
    // the light a world that size actually throws back at you.
    const SL=C.space&&C.space.starLight||{};
    const key=new THREE.DirectionalLight(new THREE.Color(SL.colour||'#fff4e2'),SL.intensity===undefined?2.0:SL.intensity);
    {const a=SL.az===undefined?-0.8:SL.az,e=SL.el===undefined?0.45:SL.el;
     key.position.set(Math.cos(a)*Math.cos(e),Math.sin(e),Math.sin(a)*Math.cos(e)).multiplyScalar(10000);}
    scene.add(key);
    scene.add(new THREE.AmbientLight(0x2a3340,SL.ambient===undefined?0.5:SL.ambient));
    {const FL=C.space&&C.space.fill||{};
     const fill=new THREE.DirectionalLight(new THREE.Color(FL.colour||'#5a7fa8'),FL.intensity===undefined?0.5:FL.intensity);
     const a=FL.az===undefined?2.2:FL.az,e=FL.el===undefined?-0.5:FL.el;
     fill.position.set(Math.cos(a)*Math.cos(e),Math.sin(e),Math.sin(a)*Math.cos(e)).multiplyScalar(10000);
     scene.add(fill);}
    // A third light, very dim, that always comes from wherever the camera is. There is nothing physical
    // about it: it is there because with one hard star and one planet-shine fill, whichever way you turn
    // the ship one big flat face of it ends up pointing at neither, and a pylon the size of a house goes
    // to pure black. This keeps that face at about six per cent grey, which is enough to read its shape
    // and not enough to look lit.
    const lamp=new THREE.DirectionalLight(new THREE.Color((SL.lampColour)||'#9fb4cc'),
                                          SL.lamp===undefined?0.26:SL.lamp);
    scene.add(lamp);

    await stage('sky');
    let sky=null;
    section('sky',()=>{
      let s=(C.space&&C.space.seed)||12345;
      const rnd=()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296;};
      sky=buildSky(THREE,scene,C.space||{},rnd);
    });

    // ---- the ship ----
    await stage('hull');
    const api={THREE,C,ctx,scene,camera,renderer,animHooks,mergeParts:(m,mat)=>mergeParts(THREE,m,mat),
               fold:(g,p)=>fold(THREE,g,p),palette:o=>hullPalette(THREE,o)};
    let SHIP={radius:400};
    section('hull',()=>{SHIP=opts.model(api)||SHIP;});

    // ---- the fingerprint ----
    // Every other page on this site is checked by the test suite against a golden: build it, and the layout
    // has to come out the same. A ship has no lots to count, so what is recorded instead is the model
    // itself - every merged mesh, where its bounding sphere is, how big it is and how many vertices are in
    // it. Nudge a station in the table of cross-sections and the hash moves, which is the whole point.
    section('fingerprint',()=>{
      const rows=[];
      scene.traverse(o=>{
        if(!o.isMesh||!o.geometry||!o.geometry.attributes.position)return;
        if(o.userData.isWire||o.userData.noWire)return;
        const g=o.geometry;
        if(!g.boundingSphere)g.computeBoundingSphere();
        const b=g.boundingSphere;
        o.updateWorldMatrix(true,false);
        const c=b.center.clone().applyMatrix4(o.matrixWorld);
        rows.push({x:c.x,z:c.z,w:b.radius,dpt:g.attributes.position.count,h:c.y,ry:0,
                   kind:o.material&&o.material.color?o.material.color.getHexString():'?',fixed:false});
      });
      rows.sort((p,q)=>p.x-q.x||p.h-q.h||p.z-q.z||p.dpt-q.dpt);
      ctx.lotList=rows;
    });

    // ---- the camera: a turntable round one object ----
    await stage('ui');
    const V={az:C.view0&&C.view0.az!==undefined?C.view0.az:0.9,
             el:C.view0&&C.view0.el!==undefined?C.view0.el:0.24,
             d:C.view0&&C.view0.d!==undefined?C.view0.d:SHIP.radius*3.4,
             tx:0,ty:0,tz:0,roll:0};
    const target=new THREE.Vector3();
    function frame(){
      target.set(V.tx,V.ty,V.tz);
      camera.position.set(target.x+Math.cos(V.az)*Math.cos(V.el)*V.d,
                          target.y+Math.sin(V.el)*V.d,
                          target.z+Math.sin(V.az)*Math.cos(V.el)*V.d);
      camera.up.set(Math.sin(V.roll),Math.cos(V.roll),0);
      camera.lookAt(target);
      lamp.position.copy(camera.position);
    }

    const el=renderer.domElement;
    let drag=null;
    el.addEventListener('pointerdown',e=>{el.setPointerCapture(e.pointerId);
      drag={x:e.clientX,y:e.clientY,pan:e.button===2||e.shiftKey};});
    el.addEventListener('contextmenu',e=>e.preventDefault());
    addEventListener('pointerup',()=>{drag=null;});
    addEventListener('pointercancel',()=>{drag=null;});
    el.addEventListener('lostpointercapture',()=>{drag=null;});
    addEventListener('blur',()=>{drag=null;});
    document.addEventListener('visibilitychange',()=>{drag=null;});
    el.addEventListener('pointermove',e=>{
      if(drag&&e.buttons===0&&e.pointerType!=='touch'){drag=null;return;}
      if(!drag||(SHIP.ownsInput&&SHIP.ownsInput()))return;
      const dx=e.clientX-drag.x,dy=e.clientY-drag.y;drag.x=e.clientX;drag.y=e.clientY;
      if(drag.pan){
        const s=V.d*0.0013;
        const right=new THREE.Vector3().subVectors(camera.position,target).cross(camera.up).normalize();
        const up=camera.up.clone();
        V.tx-=right.x*dx*s+up.x*-dy*s;V.ty-=right.y*dx*s+up.y*-dy*s;V.tz-=right.z*dx*s+up.z*-dy*s;
      }else{
        V.az-=dx*0.005;V.el=Math.max(-1.45,Math.min(1.45,V.el+dy*0.004));
      }});
    // how close you may get: a third of the ship's radius by default, which for an eight-kilometre station is
    // a kilometre and a half off the hull and nowhere near its docking bay, so a model may say for itself
    const DMIN=SHIP.minD||SHIP.radius*0.35;
    el.addEventListener('wheel',e=>{e.preventDefault();if(SHIP.ownsInput&&SHIP.ownsInput())return;
      V.d=Math.max(DMIN,Math.min(SHIP.radius*160,V.d*Math.exp(e.deltaY*0.0011)));},{passive:false});
    // pinch, for the pages people actually look at these on
    {let pinch=null;const pts=new Map();
     el.addEventListener('pointerdown',e=>{if(e.pointerType==='touch')pts.set(e.pointerId,e);});
     el.addEventListener('pointermove',e=>{if(e.pointerType!=='touch'||!pts.has(e.pointerId))return;
       pts.set(e.pointerId,e);
       if(pts.size===2){const [a,b]=[...pts.values()];
         const d=Math.hypot(a.clientX-b.clientX,a.clientY-b.clientY);
         if(pinch)V.d=Math.max(DMIN,Math.min(SHIP.radius*160,V.d*pinch/d));
         pinch=d;drag=null;}});
     const drop=e=>{pts.delete(e.pointerId);if(pts.size<2)pinch=null;};
     addEventListener('pointerup',drop);addEventListener('pointercancel',drop);}

    // ---- the cards ----
    // A model that hangs {name, info} on the userData of a part gets a card for it when it is clicked, the
    // way a landmark does in a city. A click is a press and release that did not move: a drag is the camera.
    {const card=document.getElementById('card'),ray=new THREE.Raycaster(),m2=new THREE.Vector2();let down=null;
     const close=()=>{if(card){card.classList.remove('open');card.style.display='';}};
     const show=L=>{if(!card)return;card.innerHTML='';const h=document.createElement('h2');h.textContent=L.name;
       const p=document.createElement('p');p.textContent=L.info||'';const b=document.createElement('button');b.type='button';
       b.textContent='Close';b.onclick=close;card.append(h,p,b);card.classList.add('open');card.style.display='block';};
     el.addEventListener('pointerdown',e=>{down={x:e.clientX,y:e.clientY};});
     el.addEventListener('pointerup',e=>{if(!down||Math.hypot(e.clientX-down.x,e.clientY-down.y)>5){down=null;return;}down=null;
       const picks=SHIP.pick||[];if(!picks.length)return;
       m2.set(e.clientX/innerWidth*2-1,-(e.clientY/innerHeight)*2+1);ray.setFromCamera(m2,camera);
       for(const h of ray.intersectObjects(picks,true)){let o=h.object;
         // a part cut away by a clipping plane is not there to be clicked
         const cp=o.material&&o.material.clippingPlanes;if(cp&&cp.some(pl=>pl.distanceToPoint(h.point)<0))continue;
         while(o&&!o.userData.info)o=o.parent;if(o){show(o.userData.info);return;}}
       close();});
     addEventListener('keydown',e=>{if(e.key==='Escape')close();});}

    // ---- the panels ----
    const ui=document.getElementById('ui'),viewsEl=document.getElementById('views');
    const vbtn=mkBtn('Views',ui,()=>{const o=!viewsEl.classList.contains('open');
      viewsEl.classList.toggle('open',o);vbtn.setAttribute('aria-expanded',String(o));});
    vbtn.setAttribute('aria-expanded','false');
    {const h=document.createElement('div');h.className='sub';h.textContent='Viewpoints';viewsEl.appendChild(h);}
    const goto=v=>{Object.assign(V,{tx:0,ty:0,tz:0,roll:0},v);};
    for(const [name,v] of Object.entries(C.views||{}))mkBtn(name,viewsEl,()=>{
      goto(v);viewsEl.classList.remove('open');vbtn.setAttribute('aria-expanded','false');});
    if(SHIP.buttons)for(const [label,fn] of Object.entries(SHIP.buttons))mkBtn(label,ui,fn);
    const wire=createWire({THREE,scene,animHooks});
    installWireUI({ui,mkBtn,wire,hash:location.hash.slice(1)});
    ctx.wire=wire;
    installMenagerie({ui,mkBtn}).catch(e=>report('menagerie',e));

    // #view=<name> opens at one of them, and #v=az,el,d is what the camera writes back
    {const h=readHash(),vn=h.get('view');
     if(vn!==null){const want=vn.toLowerCase();
       for(const [name,v] of Object.entries(C.views||{}))if(name.toLowerCase()===want)goto(v);}
     const q=/^[-\d.,]+$/.exec(h.get('v')||'');
     if(q){const n=q[0].split(',').map(Number);
       if(n.length>=3&&n.every(Number.isFinite)){V.az=n[0];V.el=n[1];V.d=n[2];
         if(n.length>=6){V.tx=n[3];V.ty=n[4];V.tz=n[5];}}}}
    {let t=0,extraKeys=[];setInterval(()=>{const now=Date.now();if(now-t<1400)return;t=now;
      const r=x=>Math.round(x*1000)/1000;
      // a model that has a mode of its own (a cutaway, an interior) keeps it in the address too; the keys it
      // wrote last time and has not written now are taken out, and #view= goes once the camera has its own
      const set={v:[r(V.az),r(V.el),Math.round(V.d)].join(','),view:null};
      for(const k of extraKeys)set[k]=null;
      const ex=new URLSearchParams((SHIP.hashExtra?SHIP.hashExtra():'').replace(/^&/,''));
      extraKeys=[];for(const [k,v] of ex){set[k]=v===''?true:v;extraKeys.push(k);}
      writeHash(set,['v']);},1500);}

    trackResize(renderer,camera);

    const hud=document.createElement('div');hud.id='timebar';
    hud.style.cssText='font:12px Georgia,serif;color:#9fc4e0';
    const side=document.getElementById('side');if(side)side.appendChild(hud);

    finishLoading({hintMs:14000});

    runLoop(now=>{
      runHooks(animHooks,now);
      if(sky)for(const q of sky.bodies)if(q.b.rate)q.g.rotation.y+=q.b.rate;
      // a model may take the camera over - Babylon 5's interior rides the drum - and then the turntable waits
      if(!(SHIP.camFrame&&SHIP.camFrame(now)))frame();
      // A station kilometres long seen from kilometres off wants the near plane out of the way, or its
      // panelling fights itself in the depth buffer; one looked at from a hundred metres wants it close.
      if(SHIP.adaptiveNear){const n=Math.max(0.6,Math.min(40,V.d*0.004));if(Math.abs(n-camera.near)>n*0.2){camera.near=n;camera.updateProjectionMatrix();}}
      hud.textContent=SHIP.hudOnly?SHIP.hudOnly(now)||'':(V.d>=1000?(V.d/1000).toFixed(1)+' km':Math.round(V.d)+' m')+' off'+(SHIP.hud?' · '+SHIP.hud(now):'');
      renderer.render(scene,camera);
    });
    ctx.details=Object.assign(ctx.details||{},{ship:C.name});
  }
}
