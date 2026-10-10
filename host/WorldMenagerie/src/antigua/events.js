// ---------- what happens in Antigua ----------
// Every minute or two something happens, and the Events button fires any of them now (src/core/happenings.js:
// the notice, the Go and look button, the Events panel; #event=<name> fires one on arrival).
//
//   paroxysm    Fuego in paroxysm: explosion after explosion for a minute, the column climbing, blocks of lava
//               rolling down every side of the cone. After dark (it goes to night if it is day), seen from the camp
//               on Acatenango, which is where everyone wants to be for it
//   procession  a Holy Week procession: the anda, the great carried float of Jesús Nazareno, shouldered by eighty
//               cucuruchos in purple, the incense and the band behind, walking down C.antiguaEvents.procession
//               over the alfombras laid for it - carpets of dyed sawdust, which it walks straight across
//   cohetes     cohetes and bombas: a fiesta's rockets off a church's atrium, bangs and puffs of white smoke at noon
//   cap         a cloud cap forms on Agua's summit in the afternoon, as it does most days, and goes again
import { createHappenings } from '../core/happenings.js';

export function events(api){
  const {THREE,C,scene,groundH,P}=api;const K=C.antiguaEvents||{};
  const R=Math.random;
  let H=null;const run=fn=>H.run(fn),notice=(...a)=>H.notice(...a);
  const toHour=(from,to,h)=>{const now=api.hour?api.hour():12,inside=from<to?now>=from&&now<to:now>=from||now<to;if(inside&&api.setHour)api.setHour(h);};   // from..to may wrap midnight
  const tag=o=>{o.traverse(q=>{q.userData.noFingerprint=true;q.userData.noWire=true;});return o;};
  const V=api.ctx.volcanoes||{};

  // ---- Fuego in paroxysm ----
  function paroxysm(){const F=V.fuego;if(!F)return;toHour(5.5,19,21.5);let t=0,next=0;
    const camp=K.campView||[14.5003,-90.8728];
    notice('Fuego in paroxysm','explosion after explosion, the column climbing a kilometre over the crater, and blocks of lava rolling down every side of the cone. Seen from the camp on Acatenango, across the saddle.',
      ()=>{const [vx,vz]=P(camp);return [vx,groundH(vx,vz)+6,vz,F.x,F.y+250,F.z];});
    run((now,dt)=>{t+=dt;if(t>next){next=t+1.2+R()*2.5;F.blast(1.2+R()*0.8);}return t<60;});}

  // ---- a Holy Week procession ----
  function procession(){const path=(K.procession||[]).map(p=>P(p));if(path.length<2)return;
    const seg=[],len=[0];for(let i=0;i+1<path.length;i++){const d=Math.hypot(path[i+1][0]-path[i][0],path[i+1][1]-path[i][1]);seg.push(d);len.push(len[i]+d);}
    const total=len[len.length-1],at=s=>{s=Math.max(0,Math.min(total,s));let i=0;while(i<seg.length-1&&len[i+1]<s)i++;const f=(s-len[i])/(seg[i]||1),[ax,az]=path[i],[bx,bz]=path[i+1];return [ax+(bx-ax)*f,az+(bz-az)*f,Math.atan2(bx-ax,bz-az)];};
    const M=c=>new THREE.MeshLambertMaterial({color:c}),grp=new THREE.Group();tag(grp);scene.add(grp);
    const place=(m,x,y,z,rx=0)=>{m.position.set(x,y,z);m.rotation.x=rx;return m;};   // (a mesh's position cannot be assigned, only set)
    // the alfombras: a run of carpets down the middle of the street, each its own pattern of coloured bands
    const CARPET=[0x7a2a8a,0xe8c030,0xc83a2a,0x2a8a4a,0xf0ece0,0x2a5ab0,0xe87a2a];const carpets=[];
    for(let s=20;s<total;s+=7){const [x,z,ry]=at(s),c=new THREE.Group();
      for(let b=0;b<4;b++){const m=new THREE.Mesh(new THREE.BoxGeometry(3.2,0.06,1.4),M(CARPET[(b+Math.floor(s))%CARPET.length]));m.position.set(0,0.04,-2.1+b*1.4);c.add(m);}
      c.position.set(x,groundH(x,z),z);c.rotation.y=ry;grp.add(c);carpets.push({c,s});}
    // the anda: a long float on its frame, the figure under a canopy, carried on the shoulders of the cucuruchos
    const anda=new THREE.Group(),L=14;
    anda.add(place(new THREE.Mesh(new THREE.BoxGeometry(3.2,0.5,L),M(0x5a3a1a)),0,1.5,0));
    anda.add(place(new THREE.Mesh(new THREE.BoxGeometry(2.6,0.9,L-2),M(0xc8a040)),0,2.2,0));
    anda.add(place(new THREE.Mesh(new THREE.CylinderGeometry(0.35,0.5,1.8,8),M(0x5a2a6a)),0,3.5,0));   // Jesús Nazareno in his purple robe
    anda.add(place(new THREE.Mesh(new THREE.SphereGeometry(0.22,8,6),M(0xb08060)),0,4.55,0));
    anda.add(place(new THREE.Mesh(new THREE.BoxGeometry(0.2,0.2,3.4),M(0x4a3020)),0.3,4.1,-0.6,0.7));   // the cross on his shoulder
    for(const [a,b] of [[-1,-1],[1,-1],[-1,1],[1,1]])anda.add(place(new THREE.Mesh(new THREE.BoxGeometry(0.4,1.6,0.4),M(0xc8a040)),a*1.1,3,b*(L/2-1.5)));
    const robe=M(0x4a2060),face=M(0xd8c8a0);
    for(let r=0;r<20;r++)for(const sd of [-1,1])for(const e of [-0.5,0.5]){const p=new THREE.Group();p.add(new THREE.Mesh(new THREE.CylinderGeometry(0.2,0.28,1.25,6).translate(0,0.62,0),robe));
      p.add(place(new THREE.Mesh(new THREE.ConeGeometry(0.17,0.4,6),face),0,1.42,0));p.position.set(sd*(1.1+e*0.9),0,-L/2+0.4+r*(L-0.8)/19);anda.add(p);}
    grp.add(anda);
    // the band behind, in black, and the incense ahead
    const band=new THREE.Group();for(let i=0;i<24;i++){const p=new THREE.Mesh(new THREE.CylinderGeometry(0.22,0.24,1.7,6).translate(0,0.85,0),M(0x1a1a1e));p.position.set(((i%4)-1.5)*1.1,0,-Math.floor(i/4)*1.3);band.add(p);}grp.add(band);
    const smoke=[];for(let i=0;i<30;i++){const s=new THREE.Mesh(new THREE.SphereGeometry(0.8,6,5),new THREE.MeshLambertMaterial({color:0xe8e4dc,transparent:true,opacity:0.35,depthWrite:false}));grp.add(s);smoke.push({s,ph:i/30});}
    let t=0,s0=0;const SPD=K.processionSpeed||0.9;
    const pos=()=>{const [x,z]=at(s0);return [x,groundH(x,z)+3,z];};
    notice('A procession','Holy Week: the anda of Jesús Nazareno on the shoulders of eighty cucuruchos in purple, the incense before it and the band behind, walking over the alfombras the street laid for it all night.',
      ()=>{const [x,y,z]=pos(),ry=at(s0)[2];return [x+Math.sin(ry)*24+6,y+8,z+Math.cos(ry)*24,x,y,z];},pos);   // from ahead of it, a little to one side
    run((now,dt)=>{t+=dt;s0=Math.min(total,s0+dt*SPD);const [x,z,ry]=at(s0),y=groundH(x,z);
      anda.position.set(x,y+Math.abs(Math.sin(t*1.6))*0.08,z);anda.rotation.set(0,ry,Math.sin(t*0.8)*0.03);   // the rocking walk of the cargadores
      {const [bx,bz,bry]=at(s0-14);band.position.set(bx,groundH(bx,bz),bz);band.rotation.y=bry;}
      for(const q of smoke){const k=(t*0.15+q.ph)%1,[ix,iz]=at(s0+12+k*4);q.s.position.set(ix+Math.sin(q.ph*20)*0.8,groundH(ix,iz)+1.5+k*6,iz);q.s.scale.setScalar(0.6+k*2.5);q.s.material.opacity=0.35*(1-k);}
      for(const q of carpets)if(q.s<s0-8&&q.c.visible){q.c.children.forEach(m=>m.material.color.lerp(new THREE.Color(0x7a6a58),0.6));q.c.visible=q.s>s0-60;}   // walked over, scuffed, swept away
      if(s0>=total||t>240){scene.remove(grp);return false;}return true;});}

  // ---- cohetes ----
  function cohetes(){const [cx,cz]=P(K.cohetes||[14.5616,-90.7345]),cy=groundH(cx,cz);toHour(19,5,12);let t=0,next=0;
    const puffs=[];const pm=new THREE.MeshLambertMaterial({color:0xf4f2ee,transparent:true,opacity:0.7,depthWrite:false});
    notice('Cohetes','a fiesta: rockets and bombas off the atrium, a bang that rattles the windows and a puff of white smoke for each, all through the morning.',
      ()=>[cx+70,cy+30,cz+90,cx,cy+60,cz]);
    run((now,dt)=>{t+=dt;if(t>next&&t<30){next=t+0.6+R()*1.8;const p=new THREE.Mesh(new THREE.SphereGeometry(2,8,6),pm.clone());const h=60+R()*60;p.position.set(cx+(R()-0.5)*40,cy+h,cz+(R()-0.5)*40);tag(p);scene.add(p);puffs.push({p,a:0});}
      for(let i=puffs.length-1;i>=0;i--){const q=puffs[i];q.a+=dt;q.p.scale.setScalar(1+q.a*1.8);q.p.material.opacity=0.75*Math.max(0,1-q.a/7);q.p.position.y+=dt*0.6;if(q.a>7){scene.remove(q.p);puffs.splice(i,1);}}
      return t<30||puffs.length>0;});}

  // ---- Agua's cloud cap ----
  function cap(){const G=V.agua;if(!G)return;toHour(19,6,15);let t=0;const D=90;
    const cm=new THREE.MeshLambertMaterial({color:0xf2f2f4,transparent:true,opacity:0,depthWrite:false}),grp=new THREE.Group(),cl=[];
    for(let i=0;i<34;i++){const a=i/34*Math.PI*2,r=320+R()*260,m=new THREE.Mesh(new THREE.SphereGeometry(140+R()*120,10,7),cm);m.scale.y=0.45;m.position.set(Math.cos(a)*r,-120+R()*140,Math.sin(a)*r);grp.add(m);cl.push(m);}
    grp.position.set(G.x,G.y,G.z);tag(grp);scene.add(grp);
    notice('A cap on Agua','the afternoon cloud: it gathers round the summit, sits there like a hat, and is gone before evening.',
      ()=>{const [vx,vz]=P(K.capView||[14.5572,-90.7337]);return [vx,groundH(vx,vz)+40,vz,G.x,G.y,G.z];});
    run((now,dt)=>{t+=dt;const f=t<20?t/20:t<D-20?1:Math.max(0,(D-t)/20);cm.opacity=0.85*f;grp.rotation.y+=dt*0.01;if(t>D){scene.remove(grp);return false;}return true;});}

  H=createHappenings(api,{events:{paroxysm:['Fuego in paroxysm',paroxysm],procession:['A procession',procession],cohetes:['Cohetes',cohetes],cap:['A cap on Agua',cap]},
    order:['cohetes','paroxysm','procession','cap'],first:K.first||45000,every:K.every||[70000,130000]});
}
