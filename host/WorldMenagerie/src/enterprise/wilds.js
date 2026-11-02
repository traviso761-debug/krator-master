// ---------- Galaxy class: the wilder places ----------
// Original work. Builders for places.js, as exotic.js's are (each takes THREE, the place's group and the kit and
// returns its solids and an update):
//
//   storm   an ion storm: a violet murk of gas lit from inside by lightning that jumps from cloud to cloud, thickest
//           round its eye, a calm hollow a few kilometres across where the readings are worth having.
//   ring    an ancient ring: a megastructure seventy kilometres across that nobody alive built, dark metal banded
//           with seams of light, turning once in a quarter of an hour round a hub that glows. Its hub can be orbited
//           (an away team can go down into it); the ring is not solid to the helm, which flies through its middle.
const dirOf=(az,el)=>[Math.cos(az)*Math.cos(el),Math.sin(el),Math.sin(az)*Math.cos(el)];
const at=(az,el,d)=>dirOf(az,el).map(x=>x*d);

export function storm(THREE,g,kit){
  const C=new THREE.Vector3(...at(0.2,0.05,30000)),rnd=kit.rnd;
  // the murk: puffs round the eye, fewer far off, none in the eye itself (sixty, a little denser each: a hundred and
  // fifty were 3.5 ms a frame of overdraw on a laptop's GPU)
  for(let i=0;i<60;i++){const a=rnd()*6.283,el=(rnd()-0.5)*0.9,r=7000+Math.pow(rnd(),0.7)*60000;
    const s=kit.sprite(rnd()<0.3?0x6a3aa8:rnd()<0.5?0x4a3a90:0x8a50b8,12000+rnd()*24000,0.08+rnd()*0.1);
    s.position.copy(C).add(new THREE.Vector3(Math.cos(a)*Math.cos(el)*r,Math.sin(el)*r*0.5,Math.sin(a)*Math.cos(el)*r));g.add(s);}
  // lightning: flashes that come and go, and bolts between two puffs
  const flashes=[];for(let i=0;i<24;i++){const a=rnd()*6.283,r=9000+rnd()*40000;const s=kit.sprite(0xd8c8ff,9000+rnd()*9000,0);
    s.position.copy(C).add(new THREE.Vector3(Math.cos(a)*r,(rnd()-0.5)*14000,Math.sin(a)*r));g.add(s);flashes.push({s,next:rnd()*6,on:0});}
  const boltM=new THREE.LineBasicMaterial({color:0xeee0ff,transparent:true,opacity:0,toneMapped:false,fog:false,blending:THREE.AdditiveBlending,depthWrite:false});
  const bolts=[];for(let i=0;i<6;i++){const n=12,pos=new Float32Array(n*3),geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(pos,3));
    const l=new THREE.Line(geo,boltM.clone());g.add(l);bolts.push({l,pos,next:rnd()*5,on:0});}
  const eye=kit.sprite(0xb8a0ff,9000,0.25);eye.position.copy(C);g.add(eye);
  const zig=b=>{const a=flashes[Math.floor(rnd()*flashes.length)].s.position,c=flashes[Math.floor(rnd()*flashes.length)].s.position,n=b.pos.length/3;
    for(let i=0;i<n;i++){const u=i/(n-1),j=i&&i<n-1?2500:0;b.pos[i*3]=a.x+(c.x-a.x)*u+(rnd()-0.5)*j;b.pos[i*3+1]=a.y+(c.y-a.y)*u+(rnd()-0.5)*j;b.pos[i*3+2]=a.z+(c.z-a.z)*u+(rnd()-0.5)*j;}
    b.l.geometry.attributes.position.needsUpdate=true;b.l.geometry.computeBoundingSphere();};
  let last=0;
  return {solids:[{name:'the eye of the storm',c:C.clone(),r:2500}],update:t=>{const dt=Math.min(0.1,Math.max(0,t-last));last=t;
    for(const f of flashes){f.next-=dt;if(f.next<=0){f.on=0.25;f.next=1+rnd()*7;}f.on=Math.max(0,f.on-dt);f.s.material.opacity=f.on>0?0.5*(f.on/0.25)*(0.6+0.4*Math.sin(t*90)):0;}
    for(const b of bolts){b.next-=dt;if(b.next<=0){zig(b);b.on=0.18;b.next=1.5+rnd()*5;}b.on=Math.max(0,b.on-dt);b.l.material.opacity=b.on>0?0.9:0;}
    eye.material.opacity=0.2+0.06*Math.sin(t*0.8);}};
}

export function ring(THREE,g,kit){
  const C=new THREE.Vector3(...at(-0.25,0.08,90000)),R=35000;
  const tilt=new THREE.Group();tilt.position.copy(C);tilt.rotation.set(1.1,0.4,0.15);g.add(tilt);
  const spin=new THREE.Group();tilt.add(spin);
  const metal=new THREE.MeshStandardMaterial({color:0x3a3c42,metalness:0.7,roughness:0.5});
  const band=new THREE.Mesh(new THREE.TorusGeometry(R,1600,12,180),metal);band.userData.toned=true;spin.add(band);
  // the seams of light: thin rings either side, and lit gaps every so often round it
  const seamM=new THREE.MeshBasicMaterial({color:0x9fe8ff,toneMapped:false});
  for(const o of [-1,1]){const s=new THREE.Mesh(new THREE.TorusGeometry(R+o*1650,90,4,240),seamM);spin.add(s);}
  for(let i=0;i<24;i++){const a=i/24*Math.PI*2,s=kit.sprite(i%3?0x9fe8ff:0xffe0a0,5000,0.6);s.position.set(Math.cos(a)*R,0,Math.sin(a)*R);spin.add(s);}
  // spokes of faint light in to the hub, and the hub
  const spokeM=new THREE.MeshBasicMaterial({color:0x6ab8e0,transparent:true,opacity:0.15,blending:THREE.AdditiveBlending,depthWrite:false,toneMapped:false});
  for(let i=0;i<3;i++){const sp=new THREE.Mesh(new THREE.BoxGeometry(R*2,120,120),spokeM);sp.rotation.y=i*Math.PI/3;spin.add(sp);}
  const hub=new THREE.Mesh(new THREE.SphereGeometry(4000,40,28),new THREE.MeshStandardMaterial({color:0x2c2e34,metalness:0.8,roughness:0.4,emissive:0x0a2030}));
  hub.userData.toned=true;tilt.add(hub);const glow=kit.sprite(0x9fe8ff,30000,0.45);tilt.add(glow);
  return {solids:[{name:'the hub',c:C.clone(),r:4000,orbit:true}],update:(t)=>{spin.rotation.y=t*0.007;glow.material.opacity=0.38+0.08*Math.sin(t*0.5);}};
}
