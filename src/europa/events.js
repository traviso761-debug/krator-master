// ---------- what happens ----------
// Original work. A station on the ice has long quiet stretches, and then something happens. Every minute or two
// one of these does, on its own (the Events button turns that off, and fires any of them now), and a line
// comes up to say what it is with a button to go and look. #event=<name> in the address fires one on arrival.
//
//   lander     a lander comes down on the field, sits, and goes. No sound, no flame to speak of, no smoke:
//              what you see is the ice its exhaust throws sideways in flat sheets, each grain on its own arc
//   icequake   Jupiter's tide flexes the shell every three and a half days and it cracks: the ground shakes,
//              a new crack opens near the station and throws up a line of dust, and it stays
//   surge      the bore hits a pocket and the plume doubles for half a minute
//   linea      a crack out on the plain vents ocean water: a row of jets a kilometre and more high - the
//              plumes the Hubble telescope may have seen, close up
//   impact     a meteorite: a flash, a cone of ejecta flying out and falling back over a minute, and a crater
//   radiation  a surge in Io's plasma torus: the site lights go red and everybody outside goes in
import { mkRng } from '../core/rng.js';
import { G, createGrains, jet } from './grains.js';

export function events(api){
  const {THREE,ctx,scene,animHooks,groundH,HASH0}=api;
  const I=ctx.europaIce;if(!I)return;
  const R=mkRng(Date.now()%100000);                         // what happens, and where, is different every visit

  const spray=createGrains(api,{max:7000,size:1.3,color:0xe8f2fa});
  const vent=createGrains(api,{max:30000,size:14,color:0xdfeefa,opacity:0.8,additive:true});
  const dust=createGrains(api,{max:8000,size:3.2,color:0xdfe6ea});
  const hooks=[];                                              // the running events' own per-frame work
  let last=performance.now();
  animHooks.push(now=>{const dt=Math.min(0.05,(now-last)/1000);last=now;for(let i=hooks.length-1;i>=0;i--)if(hooks[i](now,dt)===false)hooks.splice(i,1);});
  const run=fn=>hooks.push(fn);
  const at=(x,z,up)=>[x,groundH(x,z)+up,z];

  // ---- the notice ----
  const box=document.createElement('div');
  box.style.cssText='position:fixed;left:50%;top:12px;transform:translateX(-50%);z-index:12;max-width:min(560px,92vw);display:none;'+
    'background:rgba(8,14,22,.86);color:#dfe8ef;border:1px solid #4f6a80;padding:9px 12px;font:13px/1.45 Georgia,serif;text-align:center';
  document.body.appendChild(box);
  let boxT=0,lastView=null;
  function notice(title,text,view){lastView=view;box.innerHTML='';const h=document.createElement('b');h.textContent=title;box.append(h,document.createTextNode(' — '+text+' '));
    if(view&&api.setView){const b=document.createElement('button');b.type='button';b.textContent='Go and look';
      b.style.cssText='margin-left:6px;background:rgba(30,50,70,.9);color:#dfe8ef;border:1px solid #6f8ca4;padding:2px 8px;cursor:pointer;font:12px Georgia,serif';
      b.onclick=()=>{api.setView(...view());box.style.display='none';};box.appendChild(b);}
    box.style.display='';clearTimeout(boxT);boxT=setTimeout(()=>{box.style.display='none';},16000);}
  const look=(x,z,dist,h,ty)=>()=>{const a=Math.atan2(z,x)+0.5;return [x+Math.cos(a)*dist,groundH(x,z)+h,z+Math.sin(a)*dist,x,groundH(x,z)+(ty||10),z];};

  // ---- a lander, down and back up ----
  const landerMats={hull:new THREE.MeshPhongMaterial({color:0xa4adb4,specular:0xdce4ea,shininess:50,flatShading:true}),
    gold:new THREE.MeshPhongMaterial({color:0xd8b45a,specular:0xfff0c0,shininess:80,flatShading:true}),steel:new THREE.MeshLambertMaterial({color:0x6e767d,flatShading:true})};
  const glowTex=(()=>{const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d');const gr=g.createRadialGradient(32,32,0,32,32,32);
    gr.addColorStop(0,'rgba(220,235,255,1)');gr.addColorStop(0.3,'rgba(150,190,255,0.45)');gr.addColorStop(1,'rgba(120,160,255,0)');g.fillStyle=gr;g.fillRect(0,0,64,64);return new THREE.CanvasTexture(c);})();
  function makeLander(){const g=new THREE.Group();
    const body=new THREE.Mesh(new THREE.CylinderGeometry(9,13,22,12).translate(0,18,0),landerMats.hull);g.add(body);
    const top=new THREE.Mesh(new THREE.CylinderGeometry(6,9,7,12).translate(0,32.5,0),landerMats.gold);g.add(top);
    for(let k=0;k<4;k++){const a=k/4*Math.PI*2+0.5;const leg=new THREE.Mesh(new THREE.BoxGeometry(1.4,17,1.4).translate(0,8.5,0),landerMats.steel);
      leg.position.set(Math.cos(a)*10,0,Math.sin(a)*10);leg.rotation.set(Math.sin(a)*0.42,0,-Math.cos(a)*0.42);g.add(leg);
      const foot=new THREE.Mesh(new THREE.BoxGeometry(5,1.6,5),landerMats.steel);foot.position.set(Math.cos(a)*17,0,Math.sin(a)*17);g.add(foot);}
    const glow=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex,blending:THREE.AdditiveBlending,depthWrite:false,transparent:true}));glow.scale.setScalar(26);glow.position.y=4;g.add(glow);
    const light=new THREE.Mesh(new THREE.SphereGeometry(0.7,8,6),new THREE.MeshBasicMaterial({color:0xff3a2a}));light.position.y=37;g.add(light);
    g.traverse(o=>{o.userData.noFingerprint=true;if(o.isMesh)o.castShadow=true;});g.userData.glow=glow;g.userData.light=light;return g;}
  function lander(){
    const [px0,pz0]=I.sites.pads,k=1+Math.floor(R()*3),a=0.4+k/4*Math.PI*2+0.4,px=px0+Math.cos(a)*210,pz=pz0+Math.sin(a)*210,gy=groundH(px,pz)+2.4;
    const L=makeLander();scene.add(L);const from=[px-1400,gy+1500,pz+600];let t=0;
    notice('A lander is coming in','to the landing field. No sound and no smoke: what you see is the ice its exhaust throws out sideways in flat sheets, every grain on its own arc.',look(px,pz,160,40,20));
    const DESC=70,SIT=45,ASC=40;
    run((now,dt)=>{t+=dt;let y,x,z,thrust=0;
      if(t<DESC){const u=t/DESC,e=1-Math.pow(1-u,2.4);          // braking all the way down, hardest at the end
        x=from[0]+(px-from[0])*Math.min(1,e*1.25);z=from[2]+(pz-from[2])*Math.min(1,e*1.25);y=from[1]+(gy-from[1])*e;thrust=0.6+0.4*u;}
      else if(t<DESC+SIT){x=px;z=pz;y=gy;thrust=0;}
      else if(t<DESC+SIT+ASC){const u=(t-DESC-SIT)/ASC;x=px+u*u*900;z=pz-u*u*300;y=gy+u*u*1800;thrust=1;}
      else{scene.remove(L);return false;}
      L.position.set(x,y,z);const hgt=y-gy;
      L.userData.glow.material.opacity=thrust*(0.6+0.4*Math.random());L.userData.glow.visible=thrust>0;
      L.userData.light.visible=Math.floor(now/500)%2===0;
      // the blast on the ice: grains thrown out flat and fast, more the closer the engines are to it
      if(thrust>0&&hgt<180){const n=Math.floor((1-hgt/180)*120*dt*60/10);
        for(let i=0;i<n;i++){const aa=R()*Math.PI*2,sp=20+R()*45,r=4+R()*6;spray.emit(px+Math.cos(aa)*r,gy,pz+Math.sin(aa)*r,Math.cos(aa)*sp,1.5+R()*6,Math.sin(aa)*sp,gy-3);}}
      if(t>=DESC&&t-dt<DESC)notice('Down','on the pad. It sits for a while, and then it goes back up the way it came.',look(px,pz,160,40,20));
    });}

  // ---- an icequake: the shell cracks ----
  const cracks=[];
  const crackM=new THREE.MeshBasicMaterial({color:0x2a2622,polygonOffset:true,polygonOffsetFactor:-4,polygonOffsetUnits:-8});
  const shake={amp:0,off:new THREE.Vector3()};
  if(ctx.pushCam)ctx.pushCam((now,ctl)=>{ctl.target.sub(shake.off);if(shake.amp>0.01){shake.off.set((Math.random()-0.5),(Math.random()-0.5)*0.6,(Math.random()-0.5)).multiplyScalar(shake.amp*ctl.dist*0.004);ctl.target.add(shake.off);}else shake.off.set(0,0,0);});
  function icequake(){
    const a=R()*Math.PI*2,d=400+R()*900,cx=Math.cos(a)*d,cz=Math.sin(a)*d,dir=R()*Math.PI,len=300+R()*600;
    notice('Icequake','Jupiter\'s tide flexes the shell every three and a half days, and it cracks. A new one has just opened near the station.',look(cx,cz,420,160,0));
    // the crack: a jagged ribbon laid on the ice, opening over a few seconds and staying
    const n=40,pts=[];let ox=0;for(let i=0;i<=n;i++){ox+=(R()-0.5)*6;const u=(i/n-0.5)*len;pts.push([cx+Math.cos(dir)*u-Math.sin(dir)*ox,cz+Math.sin(dir)*u+Math.cos(dir)*ox]);}
    const geo=new THREE.BufferGeometry(),pos=new Float32Array(n*6*3);geo.setAttribute('position',new THREE.BufferAttribute(pos,3));
    const m=new THREE.Mesh(geo,crackM);m.userData.noFingerprint=true;scene.add(m);cracks.push(m);
    let t=0;
    run((now,dt)=>{t+=dt;shake.amp=Math.max(0,(t<4?1:0)*(1-t/4)*1.6);
      const w=Math.min(1,t/3)*2.4;let k=0;
      for(let i=0;i<n;i++){const [ax,az]=pts[i],[bx,bz]=pts[i+1],L=Math.hypot(bx-ax,bz-az)||1,nx=-(bz-az)/L*w/2,nz=(bx-ax)/L*w/2,wa=w*(0.4+0.6*Math.sin(i/n*Math.PI));
        const A=[ax-nx*wa/w,groundH(ax,az)+0.15,az-nz*wa/w],B=[ax+nx*wa/w,groundH(ax,az)+0.15,az+nz*wa/w],Cc=[bx+nx*wa/w,groundH(bx,bz)+0.15,bz+nz*wa/w],D=[bx-nx*wa/w,groundH(bx,bz)+0.15,bz-nz*wa/w];
        for(const v of [A,B,Cc,A,Cc,D]){pos[k++]=v[0];pos[k++]=v[1];pos[k++]=v[2];}}
      geo.attributes.position.needsUpdate=true;geo.computeBoundingSphere();
      if(t<3)for(let i=0;i<30*dt*60/10;i++){const [x,z]=pts[Math.floor(R()*n)];dust.emit(x,groundH(x,z),z,(R()-0.5)*3,2+R()*6,(R()-0.5)*3,groundH(x,z)-1);}
      return t<5;});}

  // ---- the bore surges ----
  function surge(){if(!ctx.europaPlume)return;ctx.europaPlume.surge(2.2,30);const b=ctx.europaPlume.bore;
    notice('The bore is surging','- the drill has broken into a pocket of meltwater, and for half a minute the plume throws twice as much, twice as high.',look(b.x,b.z,650,120,150));}

  // ---- a linea vents ----
  function linea(){
    // the stretch of the nearest linea closest to the station
    let best=null;for(const [ang,off,w] of I.lineae){if(!best||Math.abs(off)<Math.abs(best[1]))best=[ang,off,w];}
    const [ang,off]=best,c=Math.cos(ang),s=Math.sin(ang),u0=(R()-0.5)*3000,js=[];
    for(let k=0;k<12;k++){const u=u0+(k-5.5)*110+(R()-0.5)*40,x=u*c-off*s,z=u*s+off*c;js.push({x,y:groundH(x,z),z,v0:40,v1:68,side:3.5,rate:55,floor:groundH(x,z)-3});}
    const mid=js[6];
    notice('A linea is venting','- ocean water forced up the crack, boiling and freezing at once, in a row of jets a kilometre and more high. The Hubble telescope may have seen plumes like these from Earth.',
      ()=>{const a=ang+Math.PI/2;return [mid.x+Math.cos(a)*2600,mid.y+500,mid.z+Math.sin(a)*2600,mid.x,mid.y+700,mid.z];});
    let t=0;const acc=js.map(()=>0);
    run((now,dt)=>{t+=dt;const k=t<45?Math.min(1,t/4):Math.max(0,1-(t-45)/10);
      js.forEach((j,i)=>{acc[i]+=j.rate*k*dt*(0.7+0.6*Math.sin(t*0.7+i));while(acc[i]>=1){acc[i]-=1;jet(vent,R,j);}});
      return t<56;});}

  // ---- a meteorite ----
  const flashTex=glowTex;
  const craterM=new THREE.MeshBasicMaterial({color:0x4a4640,transparent:true,opacity:0.8,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-4,polygonOffsetUnits:-8});
  const rimM=new THREE.MeshBasicMaterial({color:0xf4f8fb,transparent:true,opacity:0.9,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-4,polygonOffsetUnits:-8});
  function impact(){
    const a=R()*Math.PI*2,d=1200+R()*2200,x=Math.cos(a)*d,z=Math.sin(a)*d,g=groundH(x,z),rC=14+R()*10;
    notice('An impact','- a meteorite, a few kilograms at twenty kilometres a second. The ejecta goes out in a cone and takes a minute to come back down, and the crater will be here for ever.',look(x,z,520,160,0));
    const fl=new THREE.Sprite(new THREE.SpriteMaterial({map:flashTex,blending:THREE.AdditiveBlending,depthWrite:false,transparent:true,color:0xfff4e0}));fl.position.set(x,g+4,z);scene.add(fl);
    for(let i=0;i<5000;i++){const aa=R()*Math.PI*2,el=0.55+R()*0.45,sp=15+R()*65;
      dust.emit(x,g+0.5,z,Math.cos(aa)*Math.cos(el)*sp,Math.sin(el)*sp,Math.sin(aa)*Math.cos(el)*sp,g-2);}
    const cr=new THREE.Mesh(new THREE.CircleGeometry(rC,24).rotateX(-Math.PI/2),craterM);cr.position.set(x,g+0.2,z);
    const rim=new THREE.Mesh(new THREE.RingGeometry(rC,rC*1.8,32).rotateX(-Math.PI/2),rimM);rim.position.set(x,g+0.18,z);
    const ray=new THREE.Mesh(new THREE.RingGeometry(rC*1.8,rC*9,40).rotateX(-Math.PI/2),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:0.35,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-4,polygonOffsetUnits:-8}));ray.position.set(x,g+0.16,z);
    for(const o of [cr,rim,ray]){o.userData.noFingerprint=true;scene.add(o);}
    let t=0;run((now,dt)=>{t+=dt;fl.scale.setScalar(80*(1+t*4));fl.material.opacity=Math.max(0,1-t/0.6);if(t>0.6&&fl.parent)scene.remove(fl);return t<1;});}

  // ---- a radiation alert ----
  function radiation(){
    const L=ctx.europaLights,crew=ctx.europaCrew;
    notice('Radiation alert','- a surge in the plasma torus Io feeds. Everybody outside goes in, and stays in until it has passed.',null);
    if(crew)crew.recall(true);
    const w0=L?L.warm.color.getHex():0,c0=L?L.cold.color.getHex():0;let t=0;
    run((now,dt)=>{t+=dt;const on=t<50;
      if(L){const blink=Math.floor(now/400)%2===0;L.warm.color.setHex(on?(blink?0xff3020:0x401008):w0);L.cold.color.setHex(on?(blink?0xff3020:0x401008):c0);}
      if(!on){if(crew)crew.recall(false);notice('All clear','- the crew go back out.',null);return false;}});}

  const EVENTS={lander:['A lander',lander],icequake:['Icequake',icequake],surge:['The bore surges',surge],linea:['A linea vents',linea],impact:['A meteorite',impact],radiation:['Radiation alert',radiation]};
  const ORDER=['lander','icequake','surge','linea','lander','impact','surge','radiation'];
  const fire=k=>{try{EVENTS[k][1]();ctx.europaEvents.log.push(k);}catch(e){api.report&&api.report('event '+k,e);}};
  ctx.europaEvents={fire,log:[]};

  // ---- on their own: every minute or two, in an order that does not repeat itself too soon ----
  const auto={on:true,next:performance.now()+25000,i:Math.floor(R()*ORDER.length)};
  animHooks.push(now=>{if(!auto.on||now<auto.next)return;auto.next=now+60000+R()*60000;fire(ORDER[auto.i++%ORDER.length]);});
  // #event=lander fires one on arrival; &eventlook goes straight to where it is happening
  {const m=/(^|&)event=([a-z]+)/.exec(HASH0||'');if(m&&EVENTS[m[2]])setTimeout(()=>{fire(m[2]);if(/(^|&)eventlook(&|$)/.test(HASH0)&&lastView&&api.setView)api.setView(...lastView(),false);},800);}

  // ---- the panel ----
  api.onUI(({ui,mkBtn})=>{
    const panel=document.createElement('div');
    panel.style.cssText='position:fixed;left:10px;bottom:calc(var(--barh,44px) + 14px);z-index:11;display:none;flex-direction:column;gap:4px;background:rgba(8,14,22,.86);border:1px solid #4f6a80;padding:8px;font:12px Georgia,serif;color:#dfe8ef';
    const head=document.createElement('div');head.textContent='Make something happen';panel.appendChild(head);
    for(const [k,[label]] of Object.entries(EVENTS))mkBtn(label,panel,()=>{fire(k);panel.style.display='none';});
    const ab=mkBtn('On their own: on',panel,()=>{auto.on=!auto.on;ab.textContent='On their own: '+(auto.on?'on':'off');if(auto.on)auto.next=performance.now()+20000;});
    document.body.appendChild(panel);
    const b=mkBtn('Events',ui,()=>{const o=panel.style.display==='none';panel.style.display=o?'flex':'none';b.setAttribute('aria-expanded',String(o));});
    b.setAttribute('aria-expanded','false');b.title='A lander, an icequake, a surge, a venting linea, an impact, a radiation alert';});
  ctx.details=Object.assign(ctx.details||{},{events:Object.keys(EVENTS).length});
}
