// ---------- what happens in Tokyo ----------
// Every minute or two something happens, and the Events button fires any of them now (src/core/happenings.js:
// the notice, the Go and look button, the Events panel; #event=<name> fires one on arrival).
//
//   hanabi    the Sumidagawa Hanabi: fireworks from the two launch barges on the Sumida by Sakurabashi and
//             Komagata-bashi, peonies and gold willows over the river, the last Saturday of July. After dark.
//   matsuri   the Sanja Matsuri: a mikoshi, a portable shrine of black lacquer and gold, shouldered by its bearers
//             in indigo happi up Nakamise from the Kaminarimon to the hall and back, swaying and bobbing as they shout
//   scramble  Shibuya at the rush: the lights go red for every car at once and the whole junction crosses, every
//             way and both diagonals, a thousand people in a minute
//   godzilla  Godzilla, over the Hotel Gracery in Kabukichō, lets go his atomic breath into the night
import { createHappenings } from '../core/happenings.js';

export function events(api){
  const {THREE,C,scene,groundH,P}=api;const K=C.tokyoEvents||{};
  const R=Math.random;
  let H=null;const run=fn=>H.run(fn),notice=(...a)=>H.notice(...a);
  const LMK=n=>(C.landmarks||[]).find(l=>l.model===n);
  const core=(C.metro&&C.metro.core||[])[0],inCore=(x,z)=>{if(!core)return true;const [la,lo]=api.toLatLon(x,z);return la>core[0]&&la<core[2]&&lo>core[1]&&lo<core[3];};
  const ground=(x,z)=>inCore(x,z)?groundH(x,z):(api.METRO_GH?api.METRO_GH(x,z):groundH(x,z));
  const toHour=(from,to,h)=>{const now=api.hour?api.hour():12;if((now>=from&&now<to)&&api.setHour)api.setHour(h);};
  const tag=o=>{o.traverse(q=>{q.userData.noFingerprint=true;q.userData.noWire=true;});return o;};
  // ---- a pool of points for the sparks (as Rome's) ----
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
  const sparks=pool(16000,4,THREE.AdditiveBlending,1);
  // people: a body of boxes coloured by vertex, instanced (the bearers, the crowd at the crossing)
  function person(shirt){const parts=[[new THREE.BoxGeometry(0.22,0.85,0.34),'#26262c',0,0.43,0],[new THREE.BoxGeometry(0.3,0.68,0.46),shirt,0,1.18,0],[new THREE.SphereGeometry(0.13,6,4),'#d9b08c',0,1.66,0]];
    const pos=[],nor=[],col=[];for(const [g0,c,x,y,z] of parts){const g=g0.toNonIndexed().translate(x,y,z),p=g.attributes.position,n=g.attributes.normal,cc=new THREE.Color(c);for(let i=0;i<p.count;i++){pos.push(p.getX(i),p.getY(i),p.getZ(i));nor.push(n.getX(i),n.getY(i),n.getZ(i));col.push(cc.r,cc.g,cc.b);}}
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(nor,3));g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));return g;}
  const pmat=new THREE.MeshLambertMaterial({vertexColors:true});

  // ---- the Sumidagawa Hanabi ----
  function hanabi(){const sites=(K.hanabi||[[35.7130,139.8040],[35.7065,139.7975]]).map(p=>P(p));toHour(5,19,19.6);
    const COLS=[0xff4a6a,0xffd860,0x7ad8ff,0xffffff,0xff8a2a,0xc87aff,0x6aff9a],GOLD=0xffc860;let t=0,next=0;
    const [ax,az]=sites[0],wy=ground(ax,az);
    notice('Sumidagawa Hanabi','the fireworks on the Sumida: twenty thousand shells from the barges by Sakurabashi and Komagata-bashi, the banks full of yukata. After dark.',
      ()=>{const [vx,vz]=P(K.hanabiView||[35.7030,139.7955]);return [vx,ground(vx,vz)+35,vz,ax,wy+180,az];});
    run((now,dt)=>{t+=dt;if(t>next){next=t+0.25+R()*0.7;const [sx,sz]=sites[Math.floor(R()*sites.length)],x=sx+(R()-0.5)*80,z=sz+(R()-0.5)*80,y=wy+150+R()*130,kind=R();
        if(kind<0.25){sparks.burst(x,y,z,420,30,GOLD,4.2,5,1.1);}   // a shidare, the gold willow: slow and falling
        else if(kind<0.4){const c=COLS[Math.floor(R()*COLS.length)];sparks.burst(x,y,z,260,38,c,2.2,6);sparks.burst(x,y,z,160,20,COLS[Math.floor(R()*COLS.length)],2.0,6);}   // a peony with a heart
        else sparks.burst(x,y,z,300,34+R()*12,COLS[Math.floor(R()*COLS.length)],2.3,6);
        // the rising shell's trail
        for(let k=0;k<14;k++)sparks.emit(x+(R()-0.5),wy+5+k*((y-wy)/14),z+(R()-0.5),0,-2,0,new THREE.Color(0xffe8b0),0.5+k*0.04,0,0);}
      if(t>40&&t<46&&R()<0.5)for(const [sx,sz] of sites)sparks.burst(sx+(R()-0.5)*120,wy+120+R()*160,sz+(R()-0.5)*120,200,30,COLS[Math.floor(R()*COLS.length)],2,6);   // the finale
      return t<50;});}

  // ---- the Sanja Matsuri ----
  function matsuri(){const S=LMK('sensoji');if(!S)return;
    // the route: K.matsuriPath (up Nakamise, through the Hōzōmon, to the hall), or gate to hall
    const route=(K.matsuriPath||[S.at,S.hall]).map(p=>P(p)),cum=[0];for(let i=0;i+1<route.length;i++)cum.push(cum[i]+Math.hypot(route[i+1][0]-route[i][0],route[i+1][1]-route[i][1]));const len=cum[cum.length-1];
    const along=s=>{s=Math.max(0,Math.min(len,s));let i=0;while(i<cum.length-2&&cum[i+1]<s)i++;const [ax,az]=route[i],[bx,bz]=route[i+1],L=cum[i+1]-cum[i]||1,t=(s-cum[i])/L;return [ax+(bx-ax)*t,az+(bz-az)*t,(bx-ax)/L,(bz-az)/L];};
    const [gx,gz]=route[0];
    // the mikoshi: a black lacquered shrine on its poles, the gold roof, the phoenix on top
    const mk=new THREE.Group(),M=(geo,c,x,y,z)=>{const m=new THREE.Mesh(geo,new THREE.MeshLambertMaterial({color:c}));m.position.set(x,y,z);m.castShadow=true;mk.add(m);return m;};
    M(new THREE.BoxGeometry(5.6,0.18,0.22),0x6a4a2a,0,1.85,-0.9);M(new THREE.BoxGeometry(5.6,0.18,0.22),0x6a4a2a,0,1.85,0.9);M(new THREE.BoxGeometry(0.22,0.18,3.6),0x6a4a2a,-1.4,1.85,0);M(new THREE.BoxGeometry(0.22,0.18,3.6),0x6a4a2a,1.4,1.85,0);
    M(new THREE.BoxGeometry(1.5,0.3,1.5),0xc8a030,0,2.05,0);M(new THREE.BoxGeometry(1.1,1.0,1.1),0x1a1416,0,2.7,0);
    M(new THREE.ConeGeometry(1.25,0.9,4).rotateY(Math.PI/4),0xd8b040,0,3.65,0);M(new THREE.SphereGeometry(0.22,8,6),0xe8c050,0,4.25,0);M(new THREE.ConeGeometry(0.12,0.5,4),0xe8c050,0,4.6,0);
    tag(mk);scene.add(mk);
    const N=K.bearers||36,HP=['#1e2a5a','#24305e','#f2f0ea'],people=new THREE.InstancedMesh(person('#1e2a5a'),pmat,N),cols=HP.map(c=>new THREE.Color(c));people.frustumCulled=false;
    for(let i=0;i<N;i++)people.setColorAt(i,cols[i%7===0?2:i%2]);tag(people);scene.add(people);
    // where each bearer is under the poles, and a crowd following
    const slots=[];for(let i=0;i<N;i++){const row=i%2?-1:1,k=Math.floor(i/2);slots.push(k<12?[-2.4+((k%6)*0.95),row*(k<6?0.9:1.5)]:[-5-(k-12)*0.9,row*(1+R()*2)]);}
    let t=28;const d=new THREE.Object3D(),SPD=0.9;   // starting 25 m in, clear of the gate
    notice('Sanja Matsuri','the mikoshi of Asakusa Shrine, shouldered up Nakamise by its bearers, swaying and bobbing to the shout of "wasshoi".',
      ()=>{const [px,pz,ux,uz]=along(t*SPD);return [px-ux*22+uz*6,ground(px,pz)+11,pz-uz*22-ux*6,px,ground(px,pz)+2,pz];},
      ()=>{const s=t*SPD,[px,pz]=along(s<len?s:Math.max(0,2*len-s));return [px,ground(px,pz)+2,pz];});
    run((now,dt)=>{t+=dt;const s=t*SPD,u=s<len?s:Math.max(0,2*len-s),dir=s<len?1:-1,[px,pz,ux,uz]=along(u),fx=ux*dir,fz=uz*dir,g=ground(px,pz),bob=Math.abs(Math.sin(t*4.2))*0.35,sway=Math.sin(t*1.7)*0.12;
      mk.position.set(px,g+bob,pz);if(/eventdebug/.test(api.HASH0||''))api.ctx.details.mikoshi=[Math.round(px),Math.round(g*10)/10,Math.round(pz),Math.round(s),api.camera.position.toArray().map(Math.round)];mk.rotation.set(sway,Math.atan2(-fz,fx),0);
      slots.forEach(([a,b],i)=>{const x=px+fx*a-fz*b,z=pz+fz*a+fx*b;d.position.set(x,ground(x,z)+(i<24?bob*0.6:Math.abs(Math.sin(t*4.2+i))*0.15),z);d.rotation.set(0,Math.atan2(-fz,fx),0);d.updateMatrix();people.setMatrixAt(i,d.matrix);});
      people.instanceMatrix.needsUpdate=true;
      if(s>2*len+5){scene.remove(mk,people);return false;}return true;});}

  // ---- Shibuya at the rush ----
  function scramble(){const S=LMK('scramble');if(!S)return;const [cx,cz]=P(S.at),r=(S.radius||17)+4,N=K.crossers||700;
    const SHIRTS=['#1e2026','#2a2c34','#e8e6e0','#3a4a6a','#c84a5a','#8a8a92','#f2f0ea','#5a4a3e','#e8c040'].map(c=>new THREE.Color(c));
    const im=new THREE.InstancedMesh(person('#ffffff'),pmat,N);im.frustumCulled=false;for(let i=0;i<N;i++)im.setColorAt(i,SHIRTS[Math.floor(R()*SHIRTS.length)]);tag(im);scene.add(im);
    // each crosser from a corner to another corner (one in four on a diagonal), all on the same green
    const corners=[0.3,1.85,3.45,5.0].map(a=>a+(S.cornerTurn||0)),walk=[];
    const newPhase=()=>{walk.length=0;for(let i=0;i<N;i++){const c0=Math.floor(R()*4),c1=(c0+(R()<0.25?2:R()<0.5?1:3))%4,a0=corners[c0]+(R()-0.5)*0.35,a1=corners[c1]+(R()-0.5)*0.35;
        walk.push({x0:cx+Math.cos(a0)*r,z0:cz+Math.sin(a0)*r,x1:cx+Math.cos(a1)*r,z1:cz+Math.sin(a1)*r,v:1.1+R()*0.6,delay:R()*5});}};
    newPhase();let t=0,phase=0;const d=new THREE.Object3D();
    notice('Shibuya Scramble','the lights go red for every car at once, and the whole junction crosses: every way, both diagonals, a thousand people in a minute.',
      ()=>{const g=groundH(cx,cz);return [cx-28,g+36,cz+40,cx,g,cz];});
    run((now,dt)=>{t+=dt;const tp=t-phase*45;if(tp>45){phase++;newPhase();}
      walk.forEach((w,i)=>{const L=Math.hypot(w.x1-w.x0,w.z1-w.z0),s=Math.max(0,Math.min(L,(tp-w.delay)*w.v)),f=s/L,x=w.x0+(w.x1-w.x0)*f,z=w.z0+(w.z1-w.z0)*f;
        d.position.set(x,groundH(x,z)+0.12,z);d.rotation.set(0,Math.atan2(-(w.z1-w.z0),w.x1-w.x0),0);d.updateMatrix();im.setMatrixAt(i,d.matrix);});
      im.instanceMatrix.needsUpdate=true;if(t>90){scene.remove(im);return false;}return true;});}

  // ---- Godzilla's atomic breath ----
  function godzilla(){const G=LMK('godzilla');if(!G)return;const [gx,gz]=P(G.at),g=groundH(gx,gz),y=g+(G.terrace||40)+11,a=(G.face||200)*Math.PI/180,dx=Math.sin(a),dz=-Math.cos(a);toHour(5,18.5,20.5);
    const blue=new THREE.Color(0x7ad8ff),white=new THREE.Color(0xe8f8ff);let t=0;
    notice('Godzilla','over the Hotel Gracery, Kabukichō: the dorsal plates light up blue, and he lets go.',()=>[gx+dx*120-dz*60,g+30,gz+dz*120+dx*60,gx,y,gz]);
    run((now,dt)=>{t+=dt;if(t>3&&t<14)for(let k=0;k<40;k++){const u=R();sparks.emit(gx+dx*3,y+u*0.4,gz+dz*3,dx*(140+R()*30)+(R()-0.5)*6,30+(R()-0.5)*6,dz*(140+R()*30)+(R()-0.5)*6,u<0.3?white:blue,1.6+R()*0.6,0,0.05);}
      else if(t<3)for(let k=0;k<6;k++)sparks.emit(gx+(R()-0.5)*4,y-14+R()*14,gz+(R()-0.5)*4,0,1,0,blue,0.5,0,0);   // the plates, charging
      return t<18;});}

  H=createHappenings(api,{events:{hanabi:['Sumidagawa Hanabi',hanabi],matsuri:['Sanja Matsuri',matsuri],scramble:['Shibuya Scramble',scramble],godzilla:['Godzilla',godzilla]},
    order:['scramble','matsuri','godzilla','hanabi'],first:K.first||45000,every:K.every||[70000,120000]});
}
