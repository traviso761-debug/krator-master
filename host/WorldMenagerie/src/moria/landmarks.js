// Moria: what of the Dwarves' work shows outside the mountain. Fan work - every shape is this project's own,
// modelled from the description; nothing from any book, film or game is used. Tolkien's world belongs to the
// Tolkien Estate.
//
// The two gates are cut in cliffs, and a hundred-metre heightfield cannot hold a cliff; so each cliff face is a mesh
// here, standing on the flat the generator leaves in front of it, with the mountain going up behind.
import { mkRng, makeNoise } from '../core/rng.js';

export function landmarks(api){
  const {THREE,ctx,scene,animHooks,gh,group,mergeParts,nightF,hour}=api;
  const byMat=parts=>{const m=new Map();for(const p of parts){let a=m.get(p.material);if(!a){a=[];m.set(p.material,a);}a.push(p);}
    const out=[];for(const [mat,list] of m){const g=mergeParts(list,mat);g.castShadow=true;g.receiveShadow=true;out.push(g);}return out;};
  // a cliff face: a curtain of rock along z at x, facing `dir` (+1 east, -1 west), from `foot` up to `top`, fluted,
  // with an opening cut in it for a gate (w wide, h high, centred on z0)
  // Each column only goes up as far as the ground behind it: a face of fixed height stood up above the ridge as
  // a slab wherever the mountain behind it was lower.
  const cliff=(x,za,zb,foot,top,dir,gate,seed)=>{
    const NZ=makeNoise(mkRng(seed)),P=[],CL=[],IDX=[],c=new THREE.Color(),rock=new THREE.Color(0x8a857c),dark=new THREE.Color(0x5c5850);
    const N=Math.ceil((zb-za)/3),ROWS=16;
    // and it dies away into the slope at both ends rather than stopping dead
    for(let i=0;i<=N;i++){const z=za+(zb-za)*i/N,end=Math.min(1,Math.min(z-za,zb-z)/Math.min(260,(zb-za)/6)),taper=end*end*(3-2*end);
      // and it goes down to the ground in front, wherever that falls away below the flat
      const colFoot=Math.min(foot,gh(x+dir*6,z)-4);
      const colTop=foot+Math.max(0,Math.max(foot+(gate?gate.h*1.6:20),Math.min(top,gh(x-dir*45,z)+3))-foot)*Math.max(0.04,taper);
      for(let r=0;r<=ROWS;r++){const y=r===0?colFoot:foot+(colTop-foot)*r/ROWS;
      const d=5*(NZ.fbm(z/9,y/40)-0.45)+1.2*(NZ.vn(z/2.5,y/9)-0.5);
      // a little lean back as it rises, and flat at the gate, where it was dressed
      const inGate=gate&&Math.abs(z-gate.z)<gate.w*1.6&&y<foot+gate.h*1.5;
      P.push(x+dir*(inGate?0:d)-dir*(r/ROWS)*6,y,z);
      c.copy(rock).lerp(dark,Math.max(0,NZ.fbm(z/14,y/60)*2-0.9));c.multiplyScalar(0.88+0.2*NZ.vn(z/4,y/5));CL.push(c.r,c.g,c.b);}}
    for(let i=0;i<N;i++)for(let r=0;r<ROWS;r++){const a=i*(ROWS+1)+r,b=a+ROWS+1;
      const z=za+(zb-za)*(i+0.5)/N,y=(P[a*3+1]+P[(a+1)*3+1])/2;if(gate&&Math.abs(z-gate.z)<gate.w/2&&y<foot+gate.h)continue;   // the opening
      if(dir>0)IDX.push(a,b,b+1,a,b+1,a+1);else IDX.push(a,b+1,b,a,a+1,b+1);}
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setAttribute('color',new THREE.Float32BufferAttribute(CL,3));g.setIndex(IDX);g.computeVertexNormals();
    const m=new THREE.Mesh(g,new THREE.MeshLambertMaterial({vertexColors:true,flatShading:true,side:THREE.DoubleSide}));m.castShadow=m.receiveShadow=true;return m;};
  return {

  westgate(L,x,z){
    // ---- the Walls of Moria, and the Doors of Durin ----
    // "Before them stood the dark cliffs... two great holly-trees... In between the trees the Doors: ... the lines
    // shone out, faint as the silver veins in stone... an anvil and a hammer surmounted by a crown with seven stars.
    // Beneath them again were two trees, each bearing crescent moons. More clearly than all else there shone forth
    // in the middle of the door a single star with many rays." Ithildin shows only under stars and moon: here it
    // comes up as the light goes. In Moria the Doors are shut; in Khazad-dum they stand open.
    const base=L.base||905,H=L.height||300,parts=[];
    const W=L.span||1400,GW=6.5,GH=11;
    const face=cliff(x,z-W/2,z+W/2,base-6,base+H,-1,{z,w:GW,h:GH},2041);
    // the doors: two leaves in the opening, and the ithildin drawn on them
    const tex=(()=>{const cv=document.createElement('canvas');cv.width=256;cv.height=384;const g=cv.getContext('2d');g.fillStyle='#000';g.fillRect(0,0,256,384);
      g.strokeStyle='#dfe8ff';g.fillStyle='#dfe8ff';g.lineWidth=3;
      // the arch, and the pillars under it
      g.beginPath();g.moveTo(24,384);g.lineTo(24,150);g.arc(128,150,104,Math.PI,0);g.lineTo(232,384);g.stroke();
      for(const px of [44,212]){g.beginPath();g.moveTo(px,384);g.lineTo(px,160);g.stroke();g.beginPath();g.arc(px,150,10,0,7);g.stroke();}
      // the writing round the arch
      g.lineWidth=1.4;for(let k=0;k<44;k++){const a=Math.PI+k/43*Math.PI,r=92;g.beginPath();g.moveTo(128+Math.cos(a)*r,150+Math.sin(a)*r);g.lineTo(128+Math.cos(a)*(r-6),150+Math.sin(a)*(r-6)-3);g.stroke();}
      // the crown, the seven stars, the anvil and hammer
      g.lineWidth=2;g.beginPath();g.moveTo(104,112);g.lineTo(108,96);g.lineTo(116,106);g.lineTo(128,90);g.lineTo(140,106);g.lineTo(148,96);g.lineTo(152,112);g.closePath();g.stroke();
      for(let k=0;k<7;k++){const a=Math.PI*(1.1+0.8*k/6);g.beginPath();g.arc(128+Math.cos(a)*48,112+Math.sin(a)*30,2.4,0,7);g.fill();}
      g.strokeRect(112,126,32,8);g.beginPath();g.moveTo(128,120);g.lineTo(140,108);g.stroke();
      // the two trees, with their crescent moons
      for(const tx of [72,184]){g.beginPath();g.moveTo(tx,380);g.lineTo(tx,210);g.stroke();for(let b=0;b<5;b++){const y=220+b*28;g.beginPath();g.moveTo(tx,y);g.quadraticCurveTo(tx+(tx<128?20:-20),y-14,tx+(tx<128?30:-30),y-6);g.stroke();
        g.beginPath();g.arc(tx+(tx<128?34:-34),y-10,5,Math.PI*0.3,Math.PI*1.6);g.stroke();}}
      // the star of the House of Feanor
      g.lineWidth=1.6;for(let k=0;k<16;k++){const a=k/16*Math.PI*2,r=k%2?14:26;g.beginPath();g.moveTo(128,250);g.lineTo(128+Math.cos(a)*r,250+Math.sin(a)*r);g.stroke();}
      return new THREE.CanvasTexture(cv);})();
    const ith=new THREE.MeshBasicMaterial({map:tex,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false});
    const doorM=new THREE.MeshLambertMaterial({color:0x5c5850,flatShading:true});
    const leaves=[];for(const sd of [-1,1]){const p=new THREE.Group();p.position.set(x-0.4,base,z+sd*GW/2);
      const lf=new THREE.Mesh(new THREE.BoxGeometry(0.8,GH,GW/2).translate(0,GH/2,-sd*GW/4),doorM);p.add(lf);scene.add(p);leaves.push({p,sd});}
    // the tracery, over both leaves and the arch above them, on the face of the cliff
    const panel=new THREE.Mesh(new THREE.PlaneGeometry(GW*1.35,GW*1.35*1.5),ith);panel.position.set(x-1.2,base+GW*1.35*0.75,z);panel.rotation.y=-Math.PI/2;scene.add(panel);
    // the two holly trees before the Doors
    const bark=new THREE.MeshLambertMaterial({color:0x4a3b2c,flatShading:true}),holly=new THREE.MeshLambertMaterial({color:0x22381e,flatShading:true});
    const hollies=[];for(const sd of [-1,1]){const g2=new THREE.Group();g2.position.set(x-14,base,z+sd*14);
      g2.add(new THREE.Mesh(new THREE.CylinderGeometry(0.7,1.2,9,6).translate(0,4.5,0),bark));
      for(let k=0;k<6;k++){const c=new THREE.Mesh(new THREE.IcosahedronGeometry(3.6-k*0.3,0),holly);c.position.set(Math.sin(k)*1.5,7+k*2.1,Math.cos(k*1.7)*1.5);g2.add(c);}
      scene.add(g2);hollies.push(g2);}
    animHooks.push(()=>{ith.opacity=0.08+0.85*nightF(hour());});
    ctx.westgate={x,z,base,GW,GH,leaves,panel,hollies,
      setOpen(open){for(const q of leaves)q.p.rotation.y=open?q.sd*1.35:0;panel.visible=!open;}};
    return group(L,[face]);},

  eastgate(L,x,z){
    // ---- the Dimrill Gate ----
    // The Great Gates of Khazad-dum, on the east, over the Dimrill Stair: a dressed face of rock with the gate in
    // it, tall and square-headed, pillars either side, and the Stair going down from the terrace in front.
    const base=L.base||1450,H=L.height||130,GW=14,GH=20,parts=[];
    const face=cliff(x,z-(L.span||1200)/2,z+(L.span||1200)/2,base-8,base+H,1,{z,w:GW,h:GH},3057);
    const stone=new THREE.MeshLambertMaterial({color:0x7a7468,flatShading:true});
    for(const sd of [-1,1]){const p=new THREE.Mesh(new THREE.BoxGeometry(3,GH+10,3.5).translate(0,(GH+10)/2,0),stone);p.position.set(x+1.4,base,z+sd*(GW/2+2));parts.push(p);}
    const lintel=new THREE.Mesh(new THREE.BoxGeometry(3.4,4,GW+9),stone);lintel.position.set(x+1.5,base+GH+2,z);parts.push(lintel);
    // the doors of the Great Gates, thrown down and lying broken on the threshold
    for(const sd of [-1,1]){const d=new THREE.Mesh(new THREE.BoxGeometry(GH*0.9,1.2,GW/2-0.4),new THREE.MeshLambertMaterial({color:0x4a4640,flatShading:true}));
      d.position.set(x+GH*0.45+2+sd*1.5,base+0.4,z+sd*(GW/4+1.5));d.rotation.set(sd*0.06,sd*0.25,0.05);parts.push(d);}
    // ---- the Dimrill Stair ----
    // Down from the gate, a stair cut in the mountainside into the Dimrill Dale, and beside it a stream
    // going down in falls. The Stair follows the generator's track (tools/make-moria.py); each step is cut level
    // into the slope, so where the slope is steep they are steep.
    const track=[[x+10,z]];for(let k=0;k<13;k++)track.push([x+60+k*70,z+26*Math.sin(k*1.3)]);
    const along=(pts,step,fn)=>{let acc=0;for(let i=1;i<pts.length;i++){const [ax,az]=pts[i-1],[bx,bz]=pts[i],L=Math.hypot(bx-ax,bz-az);
      for(let d=acc;d<L;d+=step)fn(ax+(bx-ax)*d/L,az+(bz-az)*d/L,Math.atan2(bz-az,bx-ax));acc=(acc-L)%step;if(acc<0)acc+=step;}};
    {const spots=[];along(track,1.6,(sx,sz,yaw)=>{if(sx<x+520)spots.push([sx,sz,yaw]);});
     const im=new THREE.InstancedMesh(new THREE.BoxGeometry(1.7,1.4,5.2).translate(0,-0.6,0),stone,spots.length),D=new THREE.Object3D();
     spots.forEach(([sx,sz,yaw],i)=>{D.position.set(sx,gh(sx,sz)+0.25,sz);D.rotation.set(0,-yaw,0);D.updateMatrix();im.setMatrixAt(i,D.matrix);});
     im.receiveShadow=true;scene.add(im);ctx.dimrill={steps:spots.length};}
    // the stream: out of the mountain beside the gate, down beside the Stair in falls, and into the Mirrormere
    {const MX=7500,MZ=380,pts=[];for(const [sx,sz] of track)pts.push([sx+4,sz+20]);pts.push([MX-790,MZ-120],[MX-700,MZ-40]);
     const P=[],I=[],foam=[];let n=0;along(pts,3,(sx,sz,yaw)=>{const nx=-Math.sin(yaw),nz=Math.cos(yaw),y=gh(sx,sz)+0.35;
       P.push(sx-nx*1.6,y,sz-nz*1.6,sx+nx*1.6,y,sz+nz*1.6);if(n)I.push(2*n-2,2*n-1,2*n+1,2*n-2,2*n+1,2*n);n++;
       const drop=gh(sx-Math.cos(yaw)*3,sz-Math.sin(yaw)*3)-gh(sx,sz);if(drop>1.0)foam.push([sx,y+0.2,sz,drop]);});
     const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setIndex(I);g.computeVertexNormals();
     scene.add(new THREE.Mesh(g,new THREE.MeshPhongMaterial({color:0x33434c,specular:0x8aa0b0,shininess:80,side:THREE.DoubleSide,polygonOffset:true,polygonOffsetFactor:-2})));
     const fm=new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1,0),new THREE.MeshLambertMaterial({color:0xe8eef0,transparent:true,opacity:0.85}),foam.length),D=new THREE.Object3D();
     const setFoam=t=>{foam.forEach(([fx,fy,fz,d],i)=>{const k=0.8+0.3*Math.sin(t*6+i*1.7);D.position.set(fx,fy,fz);D.rotation.set(0,i,0);D.scale.set(1.6*k,0.5+Math.min(2,d)*0.5*k,1.6*k);D.updateMatrix();fm.setMatrixAt(i,D.matrix);});fm.instanceMatrix.needsUpdate=true;};
     setFoam(0);scene.add(fm);animHooks.push(now=>setFoam(now/1000));}
    return group(L,[face,...byMat(parts)]);},

  durinstower(L,x,z){
    // ---- Durin's Tower, on the summit of Zirakzigil ----
    // At the top of the Endless Stair, "carved in the living rock of Zirakzigil, the pinnacle of the Silvertine". A
    // small round tower on the very peak, with one window: where Gandalf and the Balrog came out onto the ice. It
    // stands on the highest ground within a hundred metres of where the map puts it.
    let bx=x,bz=z,by=gh(x,z);for(let dx=-100;dx<=100;dx+=10)for(let dz=-100;dz<=100;dz+=10){const y=gh(x+dx,z+dz);if(y>by){by=y;bx=x+dx;bz=z+dz;}}
    const stone=new THREE.MeshLambertMaterial({color:0x8a8680,flatShading:true}),dark=new THREE.MeshLambertMaterial({color:0x111114});
    const parts=[];const t=new THREE.Mesh(new THREE.CylinderGeometry(5,6.5,16,10).translate(0,8,0),stone);t.position.set(bx,by-4,bz);parts.push(t);
    const top=new THREE.Mesh(new THREE.CylinderGeometry(6.5,5,2,10).translate(0,1,0),stone);top.position.set(bx,by+12,bz);parts.push(top);
    for(let k=0;k<10;k++){const a=k/10*Math.PI*2,m=new THREE.Mesh(new THREE.BoxGeometry(1.6,2,1.6),stone);m.position.set(bx+Math.cos(a)*5.8,by+15,bz+Math.sin(a)*5.8);parts.push(m);}
    const win=new THREE.Mesh(new THREE.BoxGeometry(1,2.6,1.4),dark);win.position.set(bx+6.2,by+6,bz);parts.push(win);
    const g=group(L,byMat(parts));
    // the ruin of it, after the fight on the peak: a stump, and the top gone (events.js swaps them)
    const ruin=new THREE.Mesh(new THREE.CylinderGeometry(5.5,6.5,6,10).translate(0,3,0),stone);ruin.position.set(bx,by-4,bz);ruin.visible=false;scene.add(ruin);
    ctx.durinsTower={x:bx,y:by,z:bz,mesh:g,ruin,broken:false,
      breakIt(){g.visible=false;ruin.visible=true;this.broken=true;},mend(){g.visible=true;ruin.visible=false;this.broken=false;}};
    (ctx.onWar=ctx.onWar||[]).push(()=>ctx.durinsTower.mend());
    return g;},

  durinsstone(L,x,z){
    // ---- Durin's Stone, by the Mirrormere: a broken pillar where Durin first looked in the lake ----
    const y=gh(x,z),stone=new THREE.MeshLambertMaterial({color:0x9a958a,flatShading:true});
    const p=new THREE.Mesh(new THREE.CylinderGeometry(0.9,1.1,5.2,8).translate(0,2.6,0),stone);p.position.set(x,y-0.2,z);p.rotation.z=0.05;
    const b=new THREE.Mesh(new THREE.BoxGeometry(3,0.8,3),stone);b.position.set(x,y,z);
    // Kheled-zaram, where the stars show in the water even by day: points of light that stay in the water whatever the
    // sky, and over against the Stone, the crown of seven that Durin saw about his head
    {const MX=7500,MZ=380,ML=1296,P=[],N=90,RS=mkRng(1945);
     for(let i=0;i<N;i++){const a=RS()*Math.PI*2,r=Math.sqrt(RS())*0.88;P.push(MX+Math.cos(a)*r*300*2.3,ML+1.2,MZ+Math.sin(a)*r*300);}
     const cx=x+90,cz=z+70;for(let k=0;k<7;k++){const a=k/7*Math.PI*2;P.push(cx+Math.cos(a)*9,ML+1.2,cz+Math.sin(a)*9);}
     const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));
     const cv=document.createElement('canvas');cv.width=cv.height=32;const c2=cv.getContext('2d'),gr=c2.createRadialGradient(16,16,0,16,16,16);
     gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(0.3,'rgba(230,240,255,0.6)');gr.addColorStop(1,'rgba(230,240,255,0)');c2.fillStyle=gr;c2.fillRect(0,0,32,32);
     const pm=new THREE.PointsMaterial({size:5,sizeAttenuation:false,map:new THREE.CanvasTexture(cv),transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,color:0xeef4ff});
     const pts=new THREE.Points(g,pm);pts.frustumCulled=false;scene.add(pts);
     animHooks.push(now=>{pm.size=4+1.2*Math.sin(now*0.0023);});}
    return group(L,byMat([p,b]));},
  };
}
