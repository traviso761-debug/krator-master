// ---------- what happens in Edinburgh ----------
// Every minute or two something happens, and the Events button fires any of them now (src/core/happenings.js:
// the notice, the Go and look button, the Events panel; #event=<name> fires one on arrival).
//
//   tattoo   the Royal Edinburgh Military Tattoo's finale: fireworks off the Castle's ramparts over the Esplanade,
//            as every August night. After dark.
//   gun      the One O'Clock Gun from the Mills Mount Battery, every day but Sunday since 1861: the flash, the
//            smoke, the bang across the New Town (and the time ball dropping on the Nelson Monument)
//   haar     the haar: the sea fog off the Forth, rolling in over Leith and the New Town until the Castle is gone,
//            and then lifting
//   piper    a piper on the Royal Mile by St Giles', in the kilt, playing
import { createHappenings } from '../core/happenings.js';

export function events(api){
  const {THREE,C,scene,groundH,P}=api;const K=C.edinburghEvents||{};
  const R=Math.random;
  let H=null;const run=fn=>H.run(fn),notice=(...a)=>H.notice(...a);
  const LMK=n=>(C.landmarks||[]).find(l=>l.model===n);
  const toHour=(from,to,h)=>{const now=api.hour?api.hour():12;if((now>=from&&now<to)&&api.setHour)api.setHour(h);};
  const tag=o=>{o.traverse(q=>{q.userData.noFingerprint=true;q.userData.noWire=true;});return o;};
  function pool(MAXP,size,blend,opacity){const pos=new Float32Array(MAXP*3),col=new Float32Array(MAXP*3),v=new Float32Array(MAXP*3),life=new Float32Array(MAXP),grav=new Float32Array(MAXP),drag=new Float32Array(MAXP);
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('color',new THREE.BufferAttribute(col,3));
    const pts=new THREE.Points(g,new THREE.PointsMaterial({size,vertexColors:true,transparent:true,opacity,depthWrite:false,blending:blend}));pts.frustumCulled=false;tag(pts);scene.add(pts);
    for(let i=0;i<MAXP;i++)pos[i*3+1]=-9999;let next=0,last=performance.now();
    api.animHooks.push(now=>{const dt=Math.min(0.05,(now-last)/1000);last=now;let any=false;
      for(let i=0;i<MAXP;i++){if(life[i]<=0)continue;any=true;life[i]-=dt;if(life[i]<=0){pos[i*3+1]=-9999;continue;}
        const k=1-drag[i]*dt;v[i*3]*=k;v[i*3+1]=v[i*3+1]*k-grav[i]*dt;v[i*3+2]*=k;pos[i*3]+=v[i*3]*dt;pos[i*3+1]+=v[i*3+1]*dt;pos[i*3+2]+=v[i*3+2]*dt;}
      if(any){g.attributes.position.needsUpdate=true;g.attributes.color.needsUpdate=true;}});
    return {emit(x,y,z,vx,vy,vz,c,l,gr=0,dr=0){const i=next;next=(next+1)%MAXP;pos[i*3]=x;pos[i*3+1]=y;pos[i*3+2]=z;v[i*3]=vx;v[i*3+1]=vy;v[i*3+2]=vz;col[i*3]=c.r;col[i*3+1]=c.g;col[i*3+2]=c.b;life[i]=l;grav[i]=gr;drag[i]=dr;},
      burst(x,y,z,n,speed,colour,l,gr,dr=0.6){const c=new THREE.Color(colour);for(let k=0;k<n;k++){const u=R()*2-1,a=R()*Math.PI*2,r=Math.sqrt(1-u*u),sp=speed*(0.85+R()*0.15);this.emit(x,y,z,Math.cos(a)*r*sp,u*sp,Math.sin(a)*r*sp,c,l*(0.8+R()*0.4),gr,dr);}}};}
  const sparks=pool(12000,4,THREE.AdditiveBlending,1),smoke=pool(3000,10,THREE.NormalBlending,0.6);
  const castle=LMK('castle'),[cx,cz]=castle?P(castle.at):[0,0],ctop=castle?castle.top:100;

  // ---- the Tattoo's fireworks ----
  function tattoo(){toHour(5,21.5,22.4);const COLS=[0xff4a4a,0xffffff,0x4a8aff,0xffd860,0x7aff9a,0xff8a2a],GOLD=0xffd070;let t=0,next=0;
    notice('The Tattoo','the Royal Edinburgh Military Tattoo ends, as every August night, with fireworks off the Castle ramparts over the Esplanade and the massed pipes and drums.',
      ()=>{const [vx,vz]=P(K.tattooView||[55.95185,-3.19870]);return [vx,groundH(vx,vz)+4,vz,cx,ctop+70,cz];});
    run((now,dt)=>{t+=dt;if(t>next){next=t+0.3+R()*0.6;const x=cx+(R()-0.5)*160,z=cz+(R()-0.5)*80,y=ctop+50+R()*110,k=R();
        if(k<0.25)sparks.burst(x,y,z,380,28,GOLD,4,5,1.1);else sparks.burst(x,y,z,280,34+R()*10,COLS[Math.floor(R()*COLS.length)],2.2,6);
        for(let q=0;q<10;q++)sparks.emit(x,ctop+8+q*((y-ctop-8)/10),z,0,-2,0,new THREE.Color(0xffe8b0),0.5+q*0.04,0,0);}
      if(t>32&&R()<0.3)sparks.burst(cx+(R()-0.5)*200,ctop+60+R()*120,cz+(R()-0.5)*90,260,34,COLS[Math.floor(R()*COLS.length)],2.2,6);   // the finale
      return t<40;});}

  // ---- the One O'Clock Gun ----
  function gun(){const [gx,gz]=P(K.gun||[55.94915,-3.20010]),gy=ctop-4;if(api.setHour)api.setHour(12.98);let t=0,fired=false;
    notice("The One O'Clock Gun","from the Mills Mount Battery, at one o'clock every day but Sunday since 1861: a time signal for the ships in the Forth. The New Town checks its watches.",
      ()=>[gx-60,gy+10,gz-160,gx,gy,gz]);
    run((now,dt)=>{t+=dt;if(t>2&&!fired){fired=true;sparks.burst(gx,gy+1,gz-3,90,14,0xfff0c0,0.25,0,2);
        for(let k=0;k<160;k++)smoke.emit(gx+(R()-0.5)*2,gy+1,gz-3,(R()-0.5)*5,1+R()*4,-6-R()*8,new THREE.Color(0xd8d8d4),4+R()*3,-0.2,0.6);}
      return t<10;});}

  // ---- the haar ----
  function haar(){const F=scene.fog;if(!F||F.density===undefined)return;let t=0;const D=60;
    notice('The haar','the sea fog off the Forth: in over Leith, up through the New Town, until the Castle is gone. It lifts as fast as it came.',
      ()=>{const [vx,vz]=P([55.95550,-3.18360]);return [vx,groundH(vx,vz)+14,vz,cx,ctop,cz];});
    // the engine sets the fog each frame from the hour: this runs after it and thickens it, then hands it back
    run((now,dt)=>{t+=dt;const f=t<15?t/15:t<D-15?1:Math.max(0,(D-t)/15);F.density*=1+f*14;F.color.lerp(new THREE.Color(0xc8ccc8),f*0.8);if(scene.background&&scene.background.isColor)scene.background.lerp(new THREE.Color(0xc8ccc8),f*0.8);return t<D;});}

  // ---- a piper on the Royal Mile ----
  function piper(){const [px,pz]=P(K.piper||[55.94935,-3.19130]),g=groundH(px,pz),M=c=>new THREE.MeshLambertMaterial({color:c}),grp=new THREE.Group();
    const add=(geo,c,x,y,z,rz=0)=>{const m=new THREE.Mesh(geo,M(c));m.position.set(x,y,z);m.rotation.z=rz;m.castShadow=true;grp.add(m);return m;};
    for(const s of [-1,1]){add(new THREE.BoxGeometry(0.13,0.1,0.28),0x111111,0,0.05,s*0.1);add(new THREE.CylinderGeometry(0.06,0.055,0.45,8),0xe8e4dc,0,0.32,s*0.1);}   // brogues and hose
    add(new THREE.CylinderGeometry(0.2,0.27,0.5,12),0x2a4a3a,0,0.78,0);for(let i=0;i<6;i++)add(new THREE.BoxGeometry(0.02,0.48,0.02),0xa83a2a,0.2,0.78,-0.15+i*0.06);   // the kilt, a red line in the tartan
    add(new THREE.BoxGeometry(0.24,0.62,0.44),0x1a1a22,0,1.32,0);add(new THREE.SphereGeometry(0.12,10,8),0xe2b896,0,1.78,0);add(new THREE.CylinderGeometry(0.13,0.13,0.08,10),0x1a1a22,0,1.9,0);   // the jacket, the head, the glengarry
    add(new THREE.SphereGeometry(0.2,10,8).scale(1,0.8,1.2),0x2a4a3a,0.18,1.3,-0.2);for(const [z,h] of [[0,0.5],[-0.1,0.6],[0.1,0.55]])add(new THREE.CylinderGeometry(0.02,0.02,h,6),0x2a1a12,0.1,1.6+h/2-0.1,z,0.3);   // the bag and the drones
    add(new THREE.CylinderGeometry(0.02,0.02,0.4,6),0x2a1a12,0.3,1.2,0,1.2);   // the chanter
    grp.position.set(px,g,pz);tag(grp);scene.add(grp);let t=0;
    notice('A piper','on the Royal Mile by St Giles\', in the kilt, playing: Scotland the Brave, then Flower of Scotland, and the hat at his feet filling up.',()=>[px+9,g+3,pz+6,px,g+1.3,pz]);
    run((now,dt)=>{t+=dt;grp.rotation.y=Math.sin(t*0.6)*0.25;grp.position.y=g+Math.abs(Math.sin(t*3.2))*0.03;if(t>70){scene.remove(grp);return false;}return true;});}

  H=createHappenings(api,{events:{gun:["The One O'Clock Gun",gun],piper:['A piper',piper],haar:['The haar',haar],tattoo:['The Tattoo',tattoo]},
    order:['piper','gun','haar','tattoo'],first:K.first||40000,every:K.every||[70000,120000]});
}
