// ---------- Chernobyl: the radiation, as a layer on the ground and a dosimeter ----------
// The dose rate today, in microsieverts an hour, is a background and a sum of sources (C.radiation.sources:
// [lat, lon, peak, sigma along, sigma across (m), bearing of the long axis (deg), name]), each a Gaussian: the plant
// site, the Red Forest and its hottest ground, the plume's traces to the west and the north, Pripyat, the basement of
// hospital MSCh-126, Kopachi, the drained cooling pond. An approximation drawn from published maps, not a survey:
// the real ground is patchy, a few metres apart can differ tenfold.
// The Radiation button (or #radiation) paints the ground by dose (green under 0.3, yellow 1, orange 3, red 10, purple
// 30 and over, a dark line at each step) and shows the 10 km zone's ring, the checkpoints (C.radiation.checkpoints)
// and a dosimeter reading the ground at the middle of the screen. api.ctx.dose(x, z) and api.ctx.dose.here() for the
// Geiger counter (sound.js).
export function radiation(api){
  const {THREE,C,P,groundH,scene,camera,animHooks}=api;const K=C.radiation||{};if(!K.sources)return;
  const BG=K.background==null?0.12:K.background;
  const SRC=K.sources.map(([la,lo,peak,sa,sc,deg])=>{const [x,z]=P([la,lo]),b=deg*Math.PI/180;return {x,z,peak,ia:1/(2*sa*sa),ic:1/(2*sc*sc),ex:Math.sin(b),ez:-Math.cos(b)};});
  function dose(x,z){let d=BG;for(const s of SRC){const dx=x-s.x,dz=z-s.z,a=dx*s.ex+dz*s.ez,c=-dx*s.ez+dz*s.ex,e=a*a*s.ia+c*c*s.ic;if(e<12)d+=s.peak*Math.exp(-e);}return d;}
  // the ground at the middle of the screen: march along the view ray until it goes under the ground
  const ray=new THREE.Raycaster(),mid=new THREE.Vector2(0,0),q=new THREE.Vector3();
  function here(){ray.setFromCamera(mid,camera);const o=ray.ray.origin,d=ray.ray.direction;let s=0;
    for(let i=0;i<400;i++){q.copy(o).addScaledVector(d,s);if(q.y<=groundH(q.x,q.z))return [q.x,q.z];s+=Math.max(2,(q.y-groundH(q.x,q.z))*0.5);if(s>30000)break;}
    return [camera.position.x,camera.position.z];}
  dose.here=()=>{const [x,z]=here();return dose(x,z);};
  dose.at=here;api.ctx.dose=dose;
  // ---- the layer: the terrain's vertex colours, kept and repainted ----
  const RAMP=[[-1,0x2f7a3a],[-0.5,0x6aa83a],[0,0xe8d040],[0.5,0xe88a2a],[1,0xc8301e],[1.5,0x8a2a8a]].map(([v,c])=>[v,new THREE.Color(c)]);
  const ramp=(v,out)=>{if(v<=RAMP[0][0])return out.copy(RAMP[0][1]);for(let i=1;i<RAMP.length;i++)if(v<=RAMP[i][0]){const [a,ca]=RAMP[i-1],[b,cb]=RAMP[i];return out.copy(ca).lerp(cb,(v-a)/(b-a));}return out.copy(RAMP[RAMP.length-1][1]);};
  const kept=new Map(),c=new THREE.Color(),o=new THREE.Color();
  function paint(on){scene.traverse(m=>{if(!m.isMesh||!(m.name==='terrain'||/^terrain/.test(m.name))||!m.geometry.attributes.color)return;const g=m.geometry,p=g.attributes.position,cl=g.attributes.color;
    if(!kept.has(m))kept.set(m,cl.array.slice());const a=kept.get(m);
    if(!on){cl.array.set(a);cl.needsUpdate=true;return;}
    for(let i=0;i<p.count;i++){const x=p.getX(i),z=p.getZ(i),v=Math.log10(dose(x,z)),f=(v*2+20)%1;ramp(v,c);
      o.setRGB(a[i*3],a[i*3+1],a[i*3+2]);const l=(o.r+o.g+o.b)/3;c.multiplyScalar(0.55+l*0.9);if(f<0.05||f>0.95)c.multiplyScalar(0.45);cl.setXYZ(i,c.r,c.g,c.b);}
    cl.needsUpdate=true;});}
  // ---- the 10 km zone's ring and the checkpoints ----
  const extra=new THREE.Group();extra.visible=false;scene.add(extra);extra.traverse(x=>{x.userData.noFingerprint=true;});
  const [cx,cz]=P(K.centre||[51.38955,30.09909]);
  {const pts=[];for(let a=0;a<=Math.PI*2+1e-6;a+=Math.PI/600){const x=cx+Math.sin(a)*10000,z=cz-Math.cos(a)*10000;pts.push(new THREE.Vector3(x,groundH(x,z)+4,z));}
    const l=new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),new THREE.LineBasicMaterial({color:0xd83a2a}));l.userData.noFingerprint=true;extra.add(l);}
  function label(t,x,z,col){const cv=document.createElement('canvas');cv.width=512;cv.height=64;const g=cv.getContext('2d');g.fillStyle='rgba(18,18,14,0.82)';g.fillRect(0,0,512,64);
    g.fillStyle=col;g.fillRect(0,0,8,64);g.fillStyle='#eeeadc';g.font='28px Georgia, serif';g.textBaseline='middle';g.fillText(t,20,33,480);
    const s=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(cv),depthTest:false,transparent:true,fog:false}));s.scale.set(320,40,1);s.position.set(x,groundH(x,z)+70,z);s.renderOrder=10;s.userData.noFingerprint=true;extra.add(s);}
  for(const [la,lo,t] of K.checkpoints||[]){const [x,z]=P([la,lo]);label(t,x,z,'#d8b030');}
  {const a=K.ringLabelAt==null?200:K.ringLabelAt,r=a*Math.PI/180;label('10 km zone',cx+Math.sin(r)*10000,cz-Math.cos(r)*10000,'#d83a2a');}
  // ---- the dosimeter and the legend ----
  const box=document.createElement('div');box.style.cssText='position:fixed;left:16px;bottom:70px;padding:8px 12px;background:rgba(18,18,14,.86);color:#eeeadc;font:13px/1.5 Georgia,serif;border-left:3px solid #d8b030;z-index:11;display:none;max-width:calc(100vw - 32px)';
  const read=document.createElement('div');read.style.cssText='font-size:15px';const key=document.createElement('div');
  key.innerHTML=[['#2f7a3a','0.1'],['#6aa83a','0.3'],['#e8d040','1'],['#e88a2a','3'],['#c8301e','10'],['#8a2a8a','30+']].map(([c,v])=>`<span style="display:inline-block;width:12px;height:10px;background:${c};margin:0 3px 0 8px"></span>${v}`).join('')+' &micro;Sv/h';
  const note=document.createElement('div');note.style.cssText='font-size:11px;color:#bdb8a8';note.textContent='Today, approximately, from published maps: the real ground is patchier.';
  box.append(read,key,note);document.body.appendChild(box);
  let on=false,btn=null,next=0;
  function set(v){on=v;paint(on);extra.visible=on;box.style.display=on?'':'none';if(btn)btn.setAttribute('aria-pressed',String(on));}
  animHooks.push(now=>{if(!on||now<next)return;next=now+400;const d=dose.here();read.textContent='Dosimeter: '+(d<10?d.toFixed(2):d.toFixed(0))+' µSv/h'+(d>=0.5?'  ('+(d/0.27).toFixed(0)+' times the world’s average natural background)':'');});
  api.onUI&&api.onUI(({ui,mkBtn})=>{btn=mkBtn('Radiation',ui,()=>set(!on));btn.title='Paint the ground by dose rate today, with the 10 km zone and its checkpoints, and a dosimeter';btn.setAttribute('aria-pressed','false');
    if(/(^|[#&])radiation(&|$)/.test(location.hash))setTimeout(()=>set(true),60);});
}
