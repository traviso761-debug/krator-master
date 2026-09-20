// City 17: the Citadel and everything else the Combine put up. Fan work - every shape is this project's own
// low-poly geometry modelled from the silhouettes, and no game assets are used. Half-Life 2 belongs to Valve.
// None of it appears in any other city, so it lives with this page instead of in the shared engine, and
// src/city17/main.js hands it to build() as ctx.models.
import { mkRng, smooth } from '../core/rng.js';

// Each of these is handed (L,x,z) exactly as one of the engine's own models is: L is the landmark's entry in the
// city file, x and z are where it stands. Everything they draw with comes out of the engine's api.
export function landmarks(api){
  const {THREE,animHooks,scene,nightF,hour,box,group,gh,roofAt,mergeParts,stoneM,steelM}=api;
  return {
  citadel(L,x,z){   // a blade two miles high: a slab tower on a skirt, plated and finned, tied to the city by its cables
    // Modelled from the silhouettes: the thing is not a tower in the sense a skyscraper is. It is a slab - half
    // as deep as it is wide - driven into the middle of a low city and tapering as it goes up, with its corners
    // chamfered so each face reads as one plane, hull plates hanging off the faces, a stepped spine of fins down
    // one edge, and the cables. The cables matter more than any of the rest: nothing else says how big it is.
    // Everything is drawn against its own width, so a city file that changes the height keeps the proportions.
    const H=L.height||3200,g0=gh(x,z),parts=[],A=L.turn||0.22,CR=mkRng(4417);
    // the alloy takes light rather than returning it - almost no specular - and the faces are flat so the plates
    // read as plates. Blue-grey, not black: at this size a black tower is a hole in the sky.
    const hull=new THREE.MeshPhongMaterial({color:0x46566a,specular:0x0e141c,shininess:3,flatShading:true});
    const dark=new THREE.MeshPhongMaterial({color:0x37475a,specular:0x0c1016,shininess:3,flatShading:true});
    const plateM=new THREE.MeshPhongMaterial({color:0x3e4e62,specular:0x0e141c,shininess:3,flatShading:true});
    const inner=new THREE.MeshPhongMaterial({color:0x161c24,specular:0x060809,shininess:2,flatShading:true});
    const cableM=new THREE.MeshPhongMaterial({color:0x20262e,specular:0x0a0c10,shininess:4});
    // The profile, across the broad face. A wide foot for the first fiftieth, then the shaft proper, which
    // narrows the whole way up: 260 m across at the shoulder of the skirt, 150 under the crown.
    const W0=L.width||260;
    const wid=t=>t<0.012?W0*2.5-(W0*1.45/0.012)*t:t<0.05?W0*1.16-W0*0.16*(t-0.012)/0.038:
      t<0.86?W0*(1-0.34*smooth(0.05,0.86,t)):t<0.95?W0*0.66-W0*0.10*(t-0.86)/0.09:W0*0.56*(1-(t-0.95)/0.05*0.45);
    const dep=t=>wid(t)*0.52;                       // a blade: half as deep as it is wide
    // the shaft: octagonal prisms, so the four corners are chamfered and each face is one plane
    const SEG=26;
    const prism=(w,d,h,mat)=>{const m=new THREE.Mesh(new THREE.CylinderGeometry(0.5,0.5,1,8,1).rotateY(Math.PI/8).translate(0,0.5,0),mat);
      m.scale.set(w/0.9239,h,d/0.9239);return m;};   // the flats of a unit octagon sit at 0.9239 of its radius
    for(let k=0;k<SEG;k++){const t0=k/SEG,t1=(k+1)/SEG,hh=H*(t1-t0)*1.01;
      const b=new THREE.Mesh(new THREE.CylinderGeometry(0.5,0.5,1,8,1).rotateY(Math.PI/8).translate(0,0.5,0),k%4?hull:dark);
      b.scale.set(wid((t0+t1)/2)/0.9239,hh,dep((t0+t1)/2)/0.9239);
      b.position.set(x,g0+H*t0,z);b.rotation.y=A;parts.push(b);}
    // the skirt: the mass it stands in, and the angular blocks shouldering out of the ground around it
    {const sk=prism(W0*2.9,W0*2.9*0.52,H*0.016,dark);sk.position.set(x,g0-6,z);sk.rotation.y=A;parts.push(sk);}
    for(let k=0;k<16;k++){const a=k/16*Math.PI*2+0.3,r=W0*(0.95+CR()*0.75),w=W0*(0.3+CR()*0.45);
      const b=new THREE.Mesh(new THREE.BoxGeometry(w,W0*(0.14+CR()*0.3),W0*(0.3+CR()*0.26)),k%2?dark:hull);
      b.position.set(x+Math.cos(a)*r,g0-8+CR()*22,z+Math.sin(a)*r);b.rotation.set(0,-a+CR()*0.4,0);parts.push(b);}
    // the hull plates: long vertical panels standing a little proud of the two broad faces, in courses. Long,
    // because a jigsaw of small ones is noise at two miles; the eye wants to see the height in one run.
    const faceAt=(t,f)=>{const a=A+f*Math.PI/2,w=wid(t),d=dep(t);return {a,half:(f%2?d:w)/2,lat:(f%2?w:d)};};
    for(let f=0;f<4;f++){const broad=f%2===0;let t=0.05;
      while(t<0.93){const th=(broad?0.075:0.10)+CR()*0.05,tc=Math.min(0.93,t+th/2),{a,half,lat}=faceAt(tc,f);
        let off=-0.45;while(off<0.45){const pw=(broad?0.17:0.26)+CR()*0.14,o=off+pw/2;
          const pl=new THREE.Mesh(new THREE.BoxGeometry(lat*pw*0.92,H*th*0.97,W0*0.05).translate(0,H*th*0.485,0),CR()<0.4?plateM:(CR()<0.5?hull:dark));
          pl.position.set(x+Math.cos(a)*(half+W0*0.016)-Math.sin(a)*lat*o,g0+H*t,z+Math.sin(a)*(half+W0*0.016)+Math.cos(a)*lat*o);
          pl.rotation.y=-a;parts.push(pl);off+=pw;}
        t+=th;}}
    // the ribs: six seams running the whole height of each broad face, which is what gives it its grain
    for(const f of [0,2])for(let i=0;i<6;i++){const o=-0.42+i*0.168;
      for(let k=0;k<SEG;k++){const t0=0.05+(0.88*k/SEG),t1=0.05+(0.88*(k+1)/SEG),tc=(t0+t1)/2,{a,half,lat}=faceAt(tc,f);
        const rib=new THREE.Mesh(new THREE.BoxGeometry(W0*0.035,H*(t1-t0)*1.02,W0*0.07).translate(0,H*(t1-t0)/2,0),dark);
        rib.position.set(x+Math.cos(a)*(half+W0*0.03)-Math.sin(a)*lat*o,g0+H*t0,z+Math.sin(a)*(half+W0*0.03)+Math.cos(a)*lat*o);
        rib.rotation.y=-a;parts.push(rib);}}
    // the fins: blades hanging off the broad faces in the upper half, tapering to a point, some of them long
    for(const f of [0,2])for(let k=0;k<11;k++){const t=0.44+k*0.043+CR()*0.02,{a,half,lat}=faceAt(t,f);
      const o=(CR()-0.5)*0.76,len=H*(0.03+CR()*0.075),w=W0*(0.05+CR()*0.06);
      const fin=new THREE.Mesh(new THREE.CylinderGeometry(0.5,0.06,1,4,1).rotateY(Math.PI/4).translate(0,-0.5,0),CR()<0.5?hull:dark);
      fin.scale.set(w,len,W0*0.10);
      fin.position.set(x+Math.cos(a)*(half+W0*0.04)-Math.sin(a)*lat*o,g0+H*t,z+Math.sin(a)*(half+W0*0.04)+Math.cos(a)*lat*o);
      fin.rotation.y=-a;parts.push(fin);}
    // the spine: a stepped stack of slabs cantilevered off one narrow edge, stepping further out as it climbs
    for(let k=0;k<26;k++){const t=0.62+k*0.0125,{a,half}=faceAt(t,1),out=W0*(0.10+0.55*(k/26));
      const st=new THREE.Mesh(new THREE.BoxGeometry(out,H*0.006,dep(t)*0.5).translate(out/2,0,0),k%2?plateM:dark);
      st.position.set(x+Math.cos(a)*half,g0+H*t,z+Math.sin(a)*half);st.rotation.y=-a;parts.push(st);}
    // ---- the cables ----
    // The one thing that says how big it is. They leave the shaft low down, sag, and come to ground out in the
    // city, hundreds of metres away; the far ends stand on the land where they land, not at the tower's foot.
    const NC=L.cables===undefined?16:L.cables,cables=[];
    for(let k=0;k<NC;k++){const a=A+k/NC*Math.PI*2+CR()*0.2,t=0.12+CR()*0.42;
      const {half}=faceAt(t,Math.abs(Math.cos(a-A))>0.7?0:1);
      const ax=x+Math.cos(a)*(half+W0*0.05),ay=g0+H*t,az=z+Math.sin(a)*(half+W0*0.05);
      const reach=W0*(2.6+CR()*7.5),bx=x+Math.cos(a)*reach,bz=z+Math.sin(a)*reach,by=gh(bx,bz)+4;
      // the sag: a cable this long hangs, so the middle drops below the straight line between its ends
      const pts=[];for(let i=0;i<=14;i++){const u=i/14,sx=ax+(bx-ax)*u,sz=az+(bz-az)*u;
        const straight=ay+(by-ay)*u,sag=Math.sin(Math.PI*u)*(ay-by)*0.26;
        pts.push(new THREE.Vector3(sx,Math.max(gh(sx,sz)+3,straight-sag),sz));}
      const curve=new THREE.CatmullRomCurve3(pts);
      const tube=new THREE.Mesh(new THREE.TubeGeometry(curve,30,W0*0.007,5,false),cableM);parts.push(tube);
      // the anchor it is tied to, out in the streets
      parts.push(box(bx,by-4,bz,W0*0.07,W0*0.09,W0*0.07,dark));cables.push([ax,ay,az]);}
    // eight plates that slide: they telescope out over minutes and show the works behind them
    const sliders=[];
    for(let k=0;k<8;k++){const f=k%4,t=0.2+CR()*0.6,{a,half,lat}=faceAt(t,f),o=(CR()-0.5)*0.5;
      const px=x+Math.cos(a)*half-Math.sin(a)*lat*o,pz=z+Math.sin(a)*half+Math.cos(a)*lat*o,py=g0+H*t;
      const shaftH=H*0.055;
      // what is behind the plate: a lit track with a pod running up and down it
      const bay=new THREE.Mesh(new THREE.BoxGeometry(lat*0.2,shaftH,10).translate(0,shaftH/2,0),inner);
      bay.position.set(px,py,pz);bay.rotation.y=-a;parts.push(bay);
      const condM=new THREE.MeshBasicMaterial({color:0x6fd0ff,transparent:true,opacity:0.8});
      const strip=new THREE.Mesh(new THREE.BoxGeometry(lat*0.12,shaftH*0.94,3),condM);
      strip.position.set(px+Math.cos(a)*3,py+shaftH*0.5,pz+Math.sin(a)*3);strip.rotation.y=-a;parts.push(strip);
      const pod=new THREE.Mesh(new THREE.BoxGeometry(9,13,9),dark);pod.position.set(px+Math.cos(a)*5,py,pz+Math.sin(a)*5);
      scene.add(pod);
      const pl=new THREE.Mesh(new THREE.BoxGeometry(lat*0.22,shaftH,15).translate(0,shaftH/2,0),hull);
      pl.rotation.y=-a;scene.add(pl);
      sliders.push({pl,pod,px,py,pz,a,shaftH,ph:CR()*6.28,sp:0.00006+CR()*0.00005,condM});}
    // the conduits up the spine, and the pulses that run up them
    const plasmaM=new THREE.MeshBasicMaterial({color:0x7fd4ff,transparent:true,opacity:0.5});
    const pulseM=new THREE.MeshBasicMaterial({color:0xe8f8ff,transparent:true,opacity:0.9});
    const pulses=[];
    for(let c=0;c<6;c++){const a=A+c/6*Math.PI*2+0.19,t0=0.1,t1=0.9;
      for(let k=0;k<9;k++){const ta=t0+(t1-t0)*k/9,tb=t0+(t1-t0)*(k+1)/9,w=wid((ta+tb)/2),d=dep((ta+tb)/2);
        const r=(Math.abs(Math.cos(a-A))>0.7?w:d)/2;
        const seg=new THREE.Mesh(new THREE.BoxGeometry(7,H*(tb-ta)*1.02,6).translate(0,H*(tb-ta)/2,0),plasmaM);
        seg.position.set(x+Math.cos(a)*(r+6),g0+H*ta,z+Math.sin(a)*(r+6));seg.rotation.y=-a;parts.push(seg);}
      const p=new THREE.Mesh(new THREE.BoxGeometry(11,40,9),pulseM);scene.add(p);
      pulses.push({p,a,ph:CR(),sp:0.06+CR()*0.05});}
    // ---- the crown ----
    // The top is the heaviest part of it, and it overhangs: a shoulder of plate thrown out past the shaft, a
    // ring of masses standing on that, and the arms reaching out over the city from underneath. A tower this
    // slender needs the weight up there or it reads as a mast with furniture on it.
    {const sh=prism(W0*1.55,W0*1.55*0.52,H*0.05,dark);sh.position.set(x,g0+H*0.845,z);sh.rotation.y=A;parts.push(sh);
     const sh2=prism(W0*1.15,W0*1.15*0.52,H*0.055,hull);sh2.position.set(x,g0+H*0.893,z);sh2.rotation.y=A;parts.push(sh2);}
    for(let k=0;k<14;k++){const a=A+k/14*Math.PI*2+0.35,t=0.885+((k*53)%5)*0.014,r=W0*(0.34+((k*31)%4)*0.13);
      const w=W0*(0.3+((k*29)%4)*0.13),hh=H*(0.035+((k*71)%6)*0.016),d=W0*(0.26+((k*17)%3)*0.1);
      const b=new THREE.Mesh(new THREE.BoxGeometry(w,hh,d).translate(0,hh/2,0),k%2?hull:dark);
      b.position.set(x+Math.cos(a)*r,g0+H*t,z+Math.sin(a)*r);b.rotation.set(0.04*Math.sin(a),-a+0.25,0.05*Math.cos(a));parts.push(b);}
    // the arms: short, deep and swept down, hanging off the underside of the shoulder
    for(let k=0;k<8;k++){const a=A+k/8*Math.PI*2+0.9,t=0.845+((k*37)%3)*0.02,len=W0*(0.55+((k*53)%4)*0.22);
      const arm=new THREE.Mesh(new THREE.BoxGeometry(len,W0*(0.3+((k*29)%3)*0.12),W0*0.42).translate(len/2,0,0),k%2?dark:hull);
      arm.position.set(x+Math.cos(a)*W0*0.5,g0+H*t,z+Math.sin(a)*W0*0.5);
      arm.rotation.set(0,-a,-0.12-0.05*(((k*19)%3)));parts.push(arm);}
    {const cap=prism(W0*0.34,W0*0.34*0.52,H*0.04,dark);cap.position.set(x,g0+H*0.965,z);cap.rotation.y=A;parts.push(cap);}
    // the reactor link at the apex: an aperture that never settles
    const flareM=new THREE.MeshBasicMaterial({color:0xdcf2ff,transparent:true,opacity:0.9});
    const core=new THREE.Mesh(new THREE.SphereGeometry(W0*0.26,20,14),flareM);core.position.set(x,g0+H*1.005,z);parts.push(core);
    const halo=new THREE.Mesh(new THREE.TorusGeometry(W0*0.72,W0*0.03,6,44),flareM);halo.position.set(x,g0+H*1.005,z);halo.rotation.x=Math.PI/2;parts.push(halo);
    const arcs=[];for(let k=0;k<5;k++){const arc=new THREE.Mesh(new THREE.BoxGeometry(W0*(0.5+CR()*0.45),9,9),flareM);
      arc.position.set(x,g0+H*1.005,z);scene.add(arc);arcs.push({arc,ph:CR()*6.28,sp:0.0009+CR()*0.0016});}
    // spotlights off the upper tiers, sweeping the sky and the streets
    const beamM=new THREE.MeshBasicMaterial({color:0xf0f6ff,transparent:true,opacity:0.07,side:THREE.DoubleSide,depthWrite:false});
    const beams=[];for(let k=0;k<4;k++){const sw=new THREE.Group();sw.position.set(x,g0+H*(0.78+k*0.04),z);
      const bm=new THREE.Mesh(new THREE.ConeGeometry(70,2100,10,1,true).rotateZ(Math.PI/2).translate(1050,0,0),beamM);
      bm.rotation.z=-0.55-k*0.12;sw.add(bm);scene.add(sw);beams.push({sw,sp:0.00013+k*0.00004,ph:k*1.7});}
    // haze banking against the upper tiers
    const hazeM=new THREE.MeshBasicMaterial({color:0xb6c4d2,transparent:true,opacity:0.07,depthWrite:false});
    const hazes=[];for(let k=0;k<5;k++){const hz=new THREE.Mesh(new THREE.SphereGeometry(1,18,12),hazeM);
      // cloud banking on it, not plates through it: wide, very flat, and never centred on the shaft
      hz.scale.set(W0*(3.4+k*0.9),W0*0.16,W0*(2.8+k*0.8));
      hz.position.set(x+(CR()-0.5)*W0*1.6,g0+H*(0.58+k*0.09),z+(CR()-0.5)*W0*1.6);
      scene.add(hz);hazes.push({hz,ph:CR()*6.28});}
    // merge everything static: ~700 boxes collapse to one mesh per material
    const liveM=new Set([plasmaM,pulseM,flareM,beamM,hazeM]),byMat=new Map(),keep=[];
    for(const m of parts){if(!m.material||liveM.has(m.material)){keep.push(m);continue;}
      let arr=byMat.get(m.material);if(!arr){arr=[];byMat.set(m.material,arr);}arr.push(m);}
    const merged=[];for(const [mat,list] of byMat)merged.push(mergeParts(list,mat));
    const g=group(L,merged.concat(keep));
    const beacons=[];for(const t of [0.4,0.62,0.82,0.96]){const b=new THREE.Mesh(new THREE.SphereGeometry(9,8,6),new THREE.MeshBasicMaterial({color:0xff3020}));
      b.position.set(x,g0+H*t,z+dep(t)*0.5+12);beacons.push(b);scene.add(b);}
    animHooks.push(now=>{const n=nightF(hour()),p=0.6+0.4*Math.sin(now*0.0007);
      // the reactor: never the same twice
      const fl=0.55+0.45*Math.abs(Math.sin(now*0.0031)+0.4*Math.sin(now*0.011));
      flareM.opacity=Math.min(1,(0.55+0.35*n)*fl);core.scale.setScalar(0.88+0.22*fl);halo.rotation.z=now*0.00009;
      for(const a of arcs){a.arc.rotation.set(Math.sin(now*a.sp+a.ph)*2.2,now*a.sp*3+a.ph,Math.cos(now*a.sp*1.7+a.ph)*2.2);
        a.arc.scale.setScalar(0.6+0.7*fl);}
      // plasma in the conduits, and a pulse climbing each one
      plasmaM.opacity=(0.30+0.32*n)*p;pulseM.opacity=(0.5+0.5*n)*(0.7+0.3*Math.sin(now*0.004));
      for(const q of pulses){const t=((now*0.00004*q.sp*220)+q.ph)%1,tt=0.1+t*0.8,w=wid(tt),d=dep(tt);
        const r=(Math.abs(Math.cos(q.a-A))>0.7?w:d)/2;
        q.p.position.set(x+Math.cos(q.a)*(r+7),g0+H*tt,z+Math.sin(q.a)*(r+7));q.p.rotation.y=-q.a;}
      // hull plates telescoping out, with a pod running the exposed track
      for(const s of sliders){const u=Math.sin(now*s.sp+s.ph),open=Math.max(0,u)*26;
        s.pl.position.set(s.px+Math.cos(s.a)*(6+open),s.py,s.pz+Math.sin(s.a)*(6+open));
        const pt=(Math.sin(now*s.sp*3.1+s.ph)*0.5+0.5);
        s.pod.position.set(s.px+Math.cos(s.a)*5,s.py+pt*s.shaftH,s.pz+Math.sin(s.a)*5);
        s.condM.opacity=(0.35+0.45*n)*(0.5+0.5*Math.sin(now*0.003+s.ph));}
      // spotlights, only once it is dark enough for them to show
      const on=n>0.15;for(const b of beams){b.sw.visible=on;b.sw.rotation.y=now*b.sp+b.ph;}
      beamM.opacity=0.05+0.06*n;
      for(const h of hazes){h.hz.rotation.y=now*0.00002+h.ph;}
      for(const b of beacons)b.visible=(now%2200)<1100;});
    return g;},
  nexus(L,x,z){   // the block the Combine armoured over: fins up the sides, a crest and masts on the roof
    const g0=gh(x,z),top=Math.max(roofAt(x,z),g0+70),parts=[],m=new THREE.MeshPhongMaterial({color:0x3a4048,specular:0x6a7a8a,shininess:14,flatShading:true});
    for(let k=0;k<4;k++){const a=k/4*Math.PI*2+Math.PI/4,fin=new THREE.Mesh(new THREE.BoxGeometry(12,top-g0,46).translate(0,(top-g0)/2,0),m);
      fin.position.set(x+Math.cos(a)*54,g0,z+Math.sin(a)*54);fin.rotation.y=-a;parts.push(fin);}
    const crest=new THREE.Mesh(new THREE.CylinderGeometry(16,46,34,6).translate(0,17,0),m);crest.position.set(x,top,z);parts.push(crest);
    for(const [dx,dz] of [[-34,-26],[34,-26],[-34,26],[34,26]])parts.push(box(x+dx,top,z+dz,3,26+((dx+dz)%13),3,m));
    const emM=new THREE.MeshBasicMaterial({color:0x8fd0ff});   // the mark they put on everything, in the plainest geometry that carries it
    const ey=top-38,ez=z+47;   // a spine with two arms swept up and out, on a foot: angular, and not a cross
    parts.push(box(x,ey,ez,5,26,1.6,emM),box(x,ey-5,ez,15,4,1.6,emM));
    for(const sd of [-1,1]){const arm=box(x+sd*3,ey+9,ez,3.6,18,1.6,emM);arm.rotation.z=-sd*0.62;parts.push(arm);}
    const g=group(L,parts);animHooks.push(()=>{const n=nightF(hour());emM.color.setRGB(0.25+0.35*n,0.55+0.3*n,0.75+0.25*n);});return g;},
  forcegate(L,x,z){   // a checkpoint: armoured blockhouses either side, a field across the gap, a lamp above it
    const a=L.ang||0,ux=-Math.sin(a),uz=Math.cos(a),g0=gh(x,z),parts=[],m=new THREE.MeshPhongMaterial({color:0x414750,specular:0x6a7a8a,shininess:14,flatShading:true});
    for(const s of [-1,1]){const bx=x+ux*s*15,bz=z+uz*s*15;const gb=gh(bx,bz);parts.push(box(bx,gb,bz,12,19,12,m));
      const cap=new THREE.Mesh(new THREE.CylinderGeometry(4,9,7,6).translate(0,3.5,0),m);cap.position.set(bx,gb+19,bz);parts.push(cap);}
    parts.push(box(x,g0+18,z,34,4,7,m));
    const fieldM=new THREE.MeshBasicMaterial({color:0x8fd8ff,transparent:true,opacity:0.22,side:THREE.DoubleSide,depthWrite:false});
    const field=new THREE.Mesh(new THREE.PlaneGeometry(22,17),fieldM);field.position.set(x,g0+8.5,z);field.rotation.y=-a;parts.push(field);
    const lamp=new THREE.Mesh(new THREE.SphereGeometry(1,8,6),new THREE.MeshBasicMaterial({color:0xff5020}));lamp.position.set(x,g0+21,z);parts.push(lamp);
    const g=group(L,parts);
    animHooks.push(now=>{fieldM.opacity=0.16+0.12*Math.abs(Math.sin(now*0.0016));lamp.visible=(now%1800)<900;});
    return g;},
  pylon(L,x,z){   // a generator: an angular mass carried on a column, lit from underneath
    const g0=gh(x,z),H=L.height||46,parts=[],m=new THREE.MeshPhongMaterial({color:0x3e444c,specular:0x70808f,shininess:14,flatShading:true});
    parts.push(box(x,g0,z,13,H,13,m));
    const headH=22,head=new THREE.Mesh(new THREE.CylinderGeometry(27,15,headH,6).translate(0,headH/2,0),m);head.position.set(x,g0+H,z);parts.push(head);
    for(let k=0;k<3;k++){const a=k/3*Math.PI*2+0.5,arm=new THREE.Mesh(new THREE.BoxGeometry(22,4,7),m);
      arm.position.set(x+Math.cos(a)*22,g0+H+headH*0.6,z+Math.sin(a)*22);arm.rotation.y=-a;parts.push(arm);}
    const glowM=new THREE.MeshBasicMaterial({color:0x9fd8ff,transparent:true,opacity:0.6});
    const under=new THREE.Mesh(new THREE.SphereGeometry(9,12,8),glowM);under.position.set(x,g0+H-3,z);parts.push(under);
    const g=group(L,parts);animHooks.push(now=>{const n=nightF(hour());glowM.opacity=(0.35+0.4*n)*(0.7+0.3*Math.sin(now*0.0027));});return g;},
  strider(L,x,z){   // a three-legged walker over the blocks, feet stepping in turn
    const g0=gh(x,z),parts=[],m=new THREE.MeshPhongMaterial({color:0x3c424a,specular:0x70808f,shininess:16,flatShading:true});
    const BODY=19,REACH=15,root=new THREE.Group();root.position.set(x,g0,z);
    const pod=new THREE.Mesh(new THREE.SphereGeometry(4.4,12,9),m);pod.scale.set(1.9,0.85,1);pod.position.y=BODY;root.add(pod);
    const snout=new THREE.Mesh(new THREE.CylinderGeometry(0.7,2.4,9,6).rotateZ(Math.PI/2),m);snout.position.set(7,BODY,0);root.add(snout);
    const eye=new THREE.Mesh(new THREE.SphereGeometry(1,8,6),new THREE.MeshBasicMaterial({color:0xff6030}));eye.position.set(11,BODY,0);root.add(eye);
    const legs=[];for(let k=0;k<3;k++){const a=k/3*Math.PI*2+Math.PI/6;
      const thigh=new THREE.Mesh(new THREE.CylinderGeometry(0.75,0.6,1,5).translate(0,0.5,0),m),shin=new THREE.Mesh(new THREE.CylinderGeometry(0.5,0.32,1,5).translate(0,0.5,0),m);
      root.add(thigh,shin);legs.push({a,thigh,shin,ph:k/3});}
    parts.push(root);
    const g=group(L,parts);
    const aim=new THREE.Vector3(),tmp=new THREE.Vector3();
    animHooks.push(now=>{const t=now/2600,walk=(t%1);root.position.y=g0+Math.sin(t*Math.PI*6)*0.35;
      for(const lg of legs){const ph=(walk+lg.ph)%1,lift=Math.max(0,Math.sin(ph*Math.PI))*5.5;
        const reach=REACH+Math.cos(ph*Math.PI*2)*3.5,fx=Math.cos(lg.a)*reach,fz=Math.sin(lg.a)*reach,fy=lift;
        const hipY=BODY-1.5,kx=fx*0.55,kz=fz*0.55,ky=hipY*0.55+fy*0.45+4.5;   // the knee rides high and outboard, as they do
        const put=(mesh,ax,ay,az,bx,by,bz)=>{aim.set(bx-ax,by-ay,bz-az);const len=aim.length()||1;
          mesh.position.set(ax,ay,az);mesh.scale.set(1,len,1);tmp.copy(aim).normalize();
          mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),tmp);};
        put(lg.thigh,0,hipY,0,kx,ky,kz);put(lg.shin,kx,ky,kz,fx,fy,fz);}});
    return g;},
  gunships(L,x,z){   // flyers circling the tower, banked into the turn
    const parts=[],m=new THREE.MeshPhongMaterial({color:0x2e343c,specular:0x70808f,shininess:20,flatShading:true}),ships=[];
    for(let k=0;k<(L.count||3);k++){const g=new THREE.Group();
      const body=new THREE.Mesh(new THREE.SphereGeometry(3.4,12,9),m);body.scale.set(2.7,0.9,1);g.add(body);
      const tail=new THREE.Mesh(new THREE.CylinderGeometry(1.5,0.4,11,6).rotateZ(Math.PI/2),m);tail.position.set(-11,0,0);g.add(tail);
      for(const sd of [-1,1]){const wing=new THREE.Mesh(new THREE.BoxGeometry(7,0.8,12),m);wing.position.set(-1,0.6,sd*6);wing.rotation.x=sd*0.25;g.add(wing);}
      const lamp=new THREE.Mesh(new THREE.SphereGeometry(0.8,8,6),new THREE.MeshBasicMaterial({color:0xff5030}));lamp.position.set(9,0,0);g.add(lamp);
      scene.add(g);ships.push({g,r:(L.radius||430)+k*95,y:(L.alt||190)+k*62,ph:k/(L.count||3)*Math.PI*2,v:0.000058+k*0.000012,lamp});}
    const g=group(L,parts);
    animHooks.push(now=>{for(const s of ships){const a=s.ph+now*s.v;s.g.position.set(x+Math.cos(a)*s.r,gh(x,z)+s.y,z+Math.sin(a)*s.r);
      s.g.rotation.set(0,-a-Math.PI/2,0.34);s.lamp.visible=(now%1500)<750;}});
    return g;},
  screenmast(L,x,z){   // a public screen on a mast: blank grey by day, lit after dark
    const g0=gh(x,z),parts=[],m=new THREE.MeshPhongMaterial({color:0x424851,specular:0x6a7a8a,shininess:12,flatShading:true});
    const faceM=new THREE.MeshBasicMaterial({color:0x1e242b});
    parts.push(box(x-6,g0,z,1.6,19,1.6,m),box(x+6,g0,z,1.6,19,1.6,m),box(x,g0+18,z,15,1.6,1.6,m));
    parts.push(box(x,g0+18.6,z-0.5,17,10.5,0.9,m));
    const face=box(x,g0+19,z+0.1,14.5,8.6,0.5,faceM);parts.push(face);
    const g=group(L,parts);
    animHooks.push(now=>{const n=nightF(hour()),f=0.05+0.55*n*(0.88+0.12*Math.sin(now*0.005));faceM.color.setRGB(f*0.5,f*0.7,f*0.92);});
    return g;},
  // ---- Vashrin (data/cities/vashrin.json): the fictional city's own structures ----
  spiretower(L,x,z){   // the tower over the plaza: a battered shaft that splits into three prongs around a lit aperture
    const H=L.height||520,g0=gh(x,z),parts=[],R0=68,R1=26;
    const shellM=new THREE.MeshPhongMaterial({color:0x3c4048,specular:0x9099a8,shininess:26,flatShading:true});
    const prof=[];for(let k=0;k<=16;k++){const t=k/16,r=R0*(1-Math.pow(t,1.5))+R1*Math.pow(t,1.5)-Math.sin(t*Math.PI)*5;prof.push(new THREE.Vector2(Math.max(6,r),g0+H*0.78*t));}
    const shaft=new THREE.Mesh(new THREE.LatheGeometry(prof,9),shellM);shaft.position.set(x,0,z);parts.push(shaft);
    for(let k=0;k<3;k++){   // the prongs, leaning in towards the aperture
      const a=k/3*Math.PI*2+0.5,pr=new THREE.Mesh(new THREE.CylinderGeometry(5,17,H*0.28,5).translate(0,H*0.14,0),shellM);
      pr.position.set(x+Math.cos(a)*17,g0+H*0.74,z+Math.sin(a)*17);pr.rotation.set(Math.sin(a)*0.2,0,-Math.cos(a)*0.2);parts.push(pr);}
    for(let k=0;k<6;k++){   // buttress fins down the lower third
      const a=k/6*Math.PI*2,hF=H*(0.3+0.06*(k%2)),fin=new THREE.Mesh(new THREE.BoxGeometry(20,hF,7).translate(0,hF/2,0),shellM);
      fin.position.set(x+Math.cos(a)*(R0-7),g0,z+Math.sin(a)*(R0-7));fin.rotation.y=-a;parts.push(fin);}
    {const plinth=new THREE.Mesh(new THREE.CylinderGeometry(R0*1.5,R0*1.62,7,9).translate(0,3.5,0),stoneM);plinth.position.set(x,g0-1,z);parts.push(plinth);}   // the plaza steps up to it
    const glowM=new THREE.MeshBasicMaterial({color:0x9fd8ff,transparent:true,opacity:0.8});
    const eye=new THREE.Mesh(new THREE.SphereGeometry(16,20,12),glowM);eye.position.set(x,g0+H*0.8,z);parts.push(eye);
    const halo=new THREE.Mesh(new THREE.TorusGeometry(44,2.2,6,40),glowM);halo.position.set(x,g0+H*0.68,z);halo.rotation.x=Math.PI/2;parts.push(halo);
    for(let k=0;k<4;k++){   // service bands, each one a little narrower than the shaft it wraps
      const t=0.16+k*0.16,r=(R0*(1-t)+R1*t-Math.sin(t*Math.PI)*7)*1.16;
      const b=new THREE.Mesh(new THREE.CylinderGeometry(r,r*1.04,3.2,9).translate(0,1.6,0),shellM);b.position.set(x,g0+H*0.78*t,z);b.rotation.y=k*0.35;parts.push(b);}
    const stripM=new THREE.MeshBasicMaterial({color:0x6fa8d0,transparent:true,opacity:0.2});   // the seams down the shaft, which only show at night
    const strips=[];for(let k=0;k<6;k++){const a=k/6*Math.PI*2+0.3,hS=H*0.5,st=new THREE.Mesh(new THREE.BoxGeometry(1.2,hS,1.2).translate(0,hS/2,0),stripM);
      st.position.set(x+Math.cos(a)*(R1+11),g0+H*0.26,z+Math.sin(a)*(R1+11));strips.push(st);parts.push(st);}
    const g=group(L,parts);
    animHooks.push(now=>{const n=nightF(hour()),p=0.55+0.45*Math.sin(now*0.0011);glowM.opacity=(0.35+0.5*n)*p;halo.rotation.z=now*0.00012;eye.scale.setScalar(0.94+0.1*p);
      for(const st of strips)st.visible=n>0.2;stripM.opacity=0.42*n*p;});
    return g;},
  checkpoint(L,x,z){   // a gate through the ring wall: blockhouses, a beam over the road, a barrier that lifts
    const a=L.ang||0,ux=-Math.sin(a),uz=Math.cos(a),g0=gh(x,z),parts=[],m=new THREE.MeshLambertMaterial({color:0x60605c}),y=new THREE.MeshLambertMaterial({color:0xc8b038});
    for(const s of [-1,1]){const bx=x+ux*s*13,bz=z+uz*s*13;parts.push(box(bx,gh(bx,bz),bz,10,16,10,m));
      const cab=box(bx,gh(bx,bz)+16,bz,11,2,11,steelM);parts.push(cab);}
    parts.push(box(x,g0+15,z,30,2.6,5,m));
    const pivot=new THREE.Group();pivot.position.set(x-ux*9,g0+3,z-uz*9);   // the barrier arm, hinged at the kerb
    const bar=new THREE.Mesh(new THREE.BoxGeometry(0.6,0.6,16).translate(0,0,8),y);bar.rotation.y=-a;pivot.add(bar);parts.push(pivot);
    const lamp=new THREE.Mesh(new THREE.SphereGeometry(0.7,8,6),new THREE.MeshBasicMaterial({color:0xff4020}));lamp.position.set(x,g0+18,z);parts.push(lamp);
    const g=group(L,parts);g.rotation.y=0;
    animHooks.push(now=>{const t=(now/9000)%1,lift=smooth(0.45,0.55,t)-smooth(0.9,0.98,t);pivot.rotation.x=-1.25*lift;lamp.visible=(now%1400)<700;});
    return g;},
  watchtower(L,x,z){   // a mast on the wall with a sweeping light
    const g0=gh(x,z),H=L.height||34,parts=[],m=new THREE.MeshLambertMaterial({color:0x585852});
    parts.push(box(x,g0,z,3.4,H,3.4,m),box(x,g0+H,z,8,3,8,m));
    for(const s of [-1,1])parts.push(box(x+s*2.4,g0+H*0.4,z,0.8,H*0.6,0.8,m));
    const beamM=new THREE.MeshBasicMaterial({color:0xfff0c0,transparent:true,opacity:0.14,side:THREE.DoubleSide,depthWrite:false});
    const swivel=new THREE.Group();swivel.position.set(x,g0+H+1.5,z);
    const beam=new THREE.Mesh(new THREE.ConeGeometry(11,150,12,1,true).rotateZ(Math.PI/2).translate(75,0,0),beamM);
    beam.rotation.z=-0.3;swivel.add(beam);parts.push(swivel);
    const head=new THREE.Mesh(new THREE.SphereGeometry(1.3,10,8),new THREE.MeshBasicMaterial({color:0xfff4d4}));head.position.set(x,g0+H+1.5,z);parts.push(head);
    const g=group(L,parts);
    animHooks.push(now=>{const n=nightF(hour());swivel.visible=head.visible=n>0.25;beamM.opacity=0.16*n;swivel.rotation.y=now*0.00035;});
    return g;},
  screen(L,x,z){   // a blank public screen on a mast
    const g0=gh(x,z),parts=[],m=new THREE.MeshLambertMaterial({color:0x4a4a48});
    const faceM=new THREE.MeshBasicMaterial({color:0x22262b});
    parts.push(box(x-4,g0,z,1,14,1,m),box(x+4,g0,z,1,14,1,m));
    const face=box(x,g0+13,z,11,6.5,0.6,faceM);parts.push(face,box(x,g0+12.6,z-0.4,12,7.3,0.5,m));
    const g=group(L,parts);
    animHooks.push(now=>{const n=nightF(hour()),f=0.06+0.5*n*(0.85+0.15*Math.sin(now*0.006));faceM.color.setRGB(f*0.55,f*0.72,f*0.9);});
    return g;},
  stacks(L,x,z){   // chimneys and a water tower over an industrial yard, with smoke
    const n=L.stacks||3,parts=[],m=new THREE.MeshLambertMaterial({color:0x8a7f70}),band=new THREE.MeshLambertMaterial({color:0xb04a3a});
    const puffs=[],smokeM=new THREE.MeshLambertMaterial({color:0xb8b4ae,transparent:true,opacity:0.32,depthWrite:false});
    for(let k=0;k<n;k++){const sx=x+(k-(n-1)/2)*26,sz=z+(k%2)*14,g0=gh(sx,sz),H=44+k*9;
      const st=new THREE.Mesh(new THREE.CylinderGeometry(2.6,4.4,H,12).translate(0,H/2,0),m);st.position.set(sx,g0,sz);parts.push(st);
      parts.push(box(sx,g0+H-6,sz,6.2,1.6,6.2,band));
      for(let q=0;q<3;q++){const p=new THREE.Mesh(new THREE.SphereGeometry(5,8,6),smokeM.clone());p.position.set(sx,g0+H,sz);p.userData.b=[sx,g0+H,sz,q/3+k*0.17];puffs.push(p);parts.push(p);}}
    const wx=x+40,wz=z-26,wg=gh(wx,wz);parts.push(box(wx,wg,wz,2,26,2,steelM));
    const tank=new THREE.Mesh(new THREE.CylinderGeometry(7,7,9,14).translate(0,4.5,0),m);tank.position.set(wx,wg+26,wz);parts.push(tank);
    const g=group(L,parts);
    animHooks.push(now=>{for(const p of puffs){const [bx,by,bz,ph]=p.userData.b,t=((now/9000)+ph)%1;p.position.set(bx+t*46,by+t*34,bz+t*10);p.scale.setScalar(1+t*3.4);p.material.opacity=0.3*(1-t);}});
    return g;},
  };
}
