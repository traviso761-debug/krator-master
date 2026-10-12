// ---------- what happens in Fort Worth ----------
// Every minute or two something happens, and the Events button fires any of them now (src/core/happenings.js).
//
//   cattledrive  the Fort Worth Herd: longhorn steers driven down Exchange Avenue by drovers on horseback, as at
//                half past eleven and four every day at the Stockyards, where the Chisholm Trail came through
//   storm        a North Texas thunderstorm: the sky goes green-black from the west, lightning walks across the city,
//                and it is gone in twenty minutes
import { createHappenings } from '../core/happenings.js';

export function events(api){
  const {THREE,C,scene,groundH,P}=api;const K=C.fortworthEvents||{};
  const R=Math.random;let H=null;const run=fn=>H.run(fn),notice=(...a)=>H.notice(...a);
  const tag=o=>{o.traverse(q=>{q.userData.noFingerprint=true;q.userData.noWire=true;});return o;};
  const M=c=>new THREE.MeshLambertMaterial({color:c});
  const place=(m,x,y,z,rx=0,rz=0)=>{m.position.set(x,y,z);m.rotation.set(rx,0,rz);return m;};
  const toHour=(from,to,h)=>{const now=api.hour?api.hour():12,inside=from<to?now>=from&&now<to:now>=from||now<to;if(inside&&api.setHour)api.setHour(h);};

  // ---- the cattle drive ----
  function cattledrive(){const path=(K.drive||[[32.78880,-97.34420],[32.78880,-97.35200]]).map(p=>P(p));toHour(19,8,16);
    const L=[0];for(let i=0;i+1<path.length;i++)L.push(L[i]+Math.hypot(path[i+1][0]-path[i][0],path[i+1][1]-path[i][1]));const total=L[L.length-1];
    const at=s=>{s=Math.max(0,Math.min(total,s));let i=0;while(i<path.length-2&&L[i+1]<s)i++;const f=(s-L[i])/((L[i+1]-L[i])||1),[ax,az]=path[i],[bx,bz]=path[i+1];return [ax+(bx-ax)*f,az+(bz-az)*f,Math.atan2(bx-ax,bz-az)];};
    const grp=new THREE.Group(),herd=[];const COATS=[0x8a4a2a,0xe8dcc8,0x2a1e18,0xa86a3a,0x6a3a24],horn=M(0xe8dcb8);
    for(let i=0;i<18;i++){const e=new THREE.Group(),c=M(COATS[i%COATS.length]);
      e.add(place(new THREE.Mesh(new THREE.BoxGeometry(0.85,0.9,2.1),c),0,1.25,0));e.add(place(new THREE.Mesh(new THREE.BoxGeometry(0.45,0.5,0.7),c),0,1.35,1.3,0.3));
      e.add(place(new THREE.Mesh(new THREE.CylinderGeometry(0.05,0.09,2.4,5),horn),0,1.55,1.4,0,Math.PI/2));   // the horns, two metres tip to tip
      for(const [a,b] of [[-0.3,0.8],[0.3,0.8],[-0.3,-0.8],[0.3,-0.8]])e.add(place(new THREE.Mesh(new THREE.BoxGeometry(0.14,0.85,0.14),M(0x2a1e18)),a,0.42,b));
      grp.add(e);herd.push({e,lag:i*2.6+R()*2,off:(R()-0.5)*6,ph:R()*6});}
    for(let i=0;i<4;i++){const h=new THREE.Group();h.add(place(new THREE.Mesh(new THREE.BoxGeometry(0.7,0.8,2.0),M(i%2?0x5a3a24:0x3a2a1c)),0,1.4,0));h.add(place(new THREE.Mesh(new THREE.BoxGeometry(0.35,0.9,0.5),M(0x5a3a24)),0,2.0,1.0,-0.6));
      h.add(place(new THREE.Mesh(new THREE.CylinderGeometry(0.22,0.26,0.8,8),M(0x4a6a8a)),0,2.2,0));h.add(place(new THREE.Mesh(new THREE.CylinderGeometry(0.45,0.45,0.1,10),M(0xd8c8a0)),0,2.85,0));   // the drover and his hat
      for(const [a,b] of [[-0.25,0.75],[0.25,0.75],[-0.25,-0.75],[0.25,-0.75]])h.add(place(new THREE.Mesh(new THREE.BoxGeometry(0.12,1.0,0.12),M(0x2a1e18)),a,0.5,b));
      grp.add(h);herd.push({e:h,lag:i<2?-4:48+i*4,off:i%2?5:-5,ph:R()*6,rider:true});}
    tag(grp);scene.add(grp);let t=0;const SP=1.6;
    const lead=()=>{const [x,z]=at(t*SP);return [x,groundH(x,z)+1.5,z];};
    notice('The cattle drive','the Fort Worth Herd: longhorns driven down Exchange Avenue by drovers on horseback, twice a day, where the Chisholm Trail came through and the stockyards shipped the West\'s cattle east.',
      ()=>{const [x,y,z]=lead(),ry=at(t*SP)[2];return [x+Math.sin(ry)*28+10,y+6,z+Math.cos(ry)*28,x,y,z];},lead);
    run((now,dt)=>{t+=dt;for(const q of herd){const s=t*SP-q.lag,[x,z,ry]=at(s);const ox=Math.cos(ry)*q.off,oz=-Math.sin(ry)*q.off;
      q.e.position.set(x+ox,groundH(x+ox,z+oz)+Math.abs(Math.sin(t*3+q.ph))*0.04,z+oz);q.e.rotation.y=ry;q.e.visible=s>0&&s<total;}
      if(t*SP>total+80){scene.remove(grp);return false;}return true;});}

  // ---- a thunderstorm ----
  function storm(){const F=scene.fog;if(!F||F.density===undefined)return;let t=0,next=2;const D=70;
    const flash=new THREE.AmbientLight(0xdfe8ff,0);scene.add(flash);
    const bolts=[];const bm=new THREE.LineBasicMaterial({color:0xf0f4ff,transparent:true,opacity:0});
    notice('A thunderstorm','off the plains from the west: the sky goes green-black, the lightning walks across the city, the rain comes down in a sheet, and in twenty minutes it is gone east.',
      ()=>{const [vx,vz]=P(K.stormView||[32.7535,-97.3316]);return [vx-400,140,vz+600,vx,60,vz];});
    run((now,dt)=>{t+=dt;const f=t<10?t/10:t<D-10?1:Math.max(0,(D-t)/10);F.density*=1+f*1.6;F.color.lerp(new THREE.Color(0x5a6660),f*0.5);if(scene.background&&scene.background.isColor)scene.background.lerp(new THREE.Color(0x4a5652),f*0.55);
      if(t>next&&f>0.5){next=t+1.5+R()*4;const c=api.camera.position,a=R()*6.28,d=1500+R()*3000,bx=c.x+Math.cos(a)*d,bz=c.z+Math.sin(a)*d,pts=[];let x=bx,y=1800,z=bz;const g0=groundH(bx,bz);
        while(y>g0){pts.push(new THREE.Vector3(x,y,z));x+=(R()-0.5)*90;z+=(R()-0.5)*90;y-=60+R()*90;pts.push(new THREE.Vector3(x,Math.max(y,g0),z));}
        const l=new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(pts),bm.clone());l.material.opacity=1;tag(l);scene.add(l);bolts.push({l,a:0});flash.intensity=2.2;}
      flash.intensity*=Math.pow(0.02,dt);for(let i=bolts.length-1;i>=0;i--){const b=bolts[i];b.a+=dt;b.l.material.opacity=Math.max(0,1-b.a*3)*(0.6+0.4*Math.sin(b.a*60));if(b.a>0.4){scene.remove(b.l);bolts.splice(i,1);}}
      if(t>D){scene.remove(flash);return false;}return true;});}

  H=createHappenings(api,{events:{cattledrive:['The cattle drive',cattledrive],storm:['A thunderstorm',storm]},order:['cattledrive','storm'],first:K.first||40000,every:K.every||[70000,130000]});
}
