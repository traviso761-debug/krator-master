// ---------- what happens in Rome ----------
// Every minute or two something Roman happens, and the Events button fires any of them now (src/core/happenings.js:
// the notice, the Go and look button, the Events panel; #event=<name> fires one on arrival).
//
//   frecce     the Frecce Tricolori, nine Aermacchi in a vee, run in over Via del Corso and the Vittoriano trailing
//              green, white and red smoke, as they do on the Festa della Repubblica (2 June)
//   fumata     a conclave: black smoke from the stove pipe on the Sistine Chapel's roof, and then white - habemus papam
//   girandola  the Girandola, the fireworks over Castel Sant'Angelo for Saints Peter and Paul (29 June)
//   coins      at the Trevi, coins over the left shoulder into the basin, which is how you make sure you come back
//   vespa      Roman Holiday: a pale-green Vespa with two up, from the Colosseum down Via dei Fori Imperiali, round
//              Piazza Venezia and up Via del Corso; the camera rides along behind
//   storni     the starlings: at dusk in winter, a million of them over the Tiber, one shape turning in the air
import { createHappenings } from '../core/happenings.js';
import { joinFast } from '../core/chains.js';

export function events(api){
  const {THREE,C,scene,groundH,P,ROADS}=api;
  const K=C.romeEvents||{};
  const R=Math.random;
  let H=null;const run=fn=>H.run(fn),notice=(...a)=>H.notice(...a);
  const LM=n=>{const l=(C.landmarks||[]).find(l=>l.model===n);return l?P(l.at):null;};
  const look=(x,y,z,dx,dy,dz,ty)=>()=>[x+dx,y+dy,z+dz,x,y+(ty||0),z];
  // a night event by day, or a dusk one at noon, moves the clock (setHour arrives with the interface, after the extras)
  const toHour=(from,to,h)=>{const now=api.hour?api.hour():12;if((now>=from&&now<to)&&api.setHour)api.setHour(h);};
  const tag=o=>{o.traverse(q=>{q.userData.noFingerprint=true;q.userData.noWire=true;});return o;};

  // ---- one pool of points for sparks and coins (small, bright) and one for smoke (big, soft) ----
  function pool(MAXP,size,blend,opacity){const pos=new Float32Array(MAXP*3),col=new Float32Array(MAXP*3),v=new Float32Array(MAXP*3),life=new Float32Array(MAXP),grav=new Float32Array(MAXP),drag=new Float32Array(MAXP);
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('color',new THREE.BufferAttribute(col,3));
    const pts=new THREE.Points(g,new THREE.PointsMaterial({size,vertexColors:true,transparent:true,opacity,depthWrite:false,blending:blend}));pts.frustumCulled=false;tag(pts);scene.add(pts);
    for(let i=0;i<MAXP;i++)pos[i*3+1]=-9999;let next=0,last=performance.now();
    api.animHooks.push(now=>{const dt=Math.min(0.05,(now-last)/1000);last=now;let any=false;
      for(let i=0;i<MAXP;i++){if(life[i]<=0)continue;any=true;life[i]-=dt;if(life[i]<=0){pos[i*3+1]=-9999;continue;}
        const k=1-drag[i]*dt;v[i*3]*=k;v[i*3+1]=v[i*3+1]*k-grav[i]*dt;v[i*3+2]*=k;pos[i*3]+=v[i*3]*dt;pos[i*3+1]+=v[i*3+1]*dt;pos[i*3+2]+=v[i*3+2]*dt;}
      if(any){g.attributes.position.needsUpdate=true;g.attributes.color.needsUpdate=true;}});
    return {emit(x,y,z,vx,vy,vz,c,l,gr=0,dr=0){const i=next;next=(next+1)%MAXP;pos[i*3]=x;pos[i*3+1]=y;pos[i*3+2]=z;v[i*3]=vx;v[i*3+1]=vy;v[i*3+2]=vz;col[i*3]=c.r;col[i*3+1]=c.g;col[i*3+2]=c.b;life[i]=l;grav[i]=gr;drag[i]=dr;},
      burst(x,y,z,n,speed,colour,l,gr){const c=new THREE.Color(colour);for(let k=0;k<n;k++){const u=R()*2-1,a=R()*Math.PI*2,r=Math.sqrt(1-u*u),sp=speed*(0.6+R()*0.4);this.emit(x,y,z,Math.cos(a)*r*sp,u*sp,Math.sin(a)*r*sp,c,l*(0.7+R()*0.6),gr,0.6);}}};}
  const sparks=pool(9000,2.0,THREE.AdditiveBlending,1),smoke=pool(7000,9,THREE.NormalBlending,0.55),fine=pool(3000,0.14,THREE.NormalBlending,1);   // fine: coins and their splashes

  // ---- the Frecce Tricolori ----
  const jetGeo=(()=>{const g=[new THREE.BoxGeometry(11,1.1,1.1),new THREE.BoxGeometry(3.2,0.15,10).translate(-1,0,0),new THREE.BoxGeometry(1.8,1.8,0.12).translate(-5,1,0),new THREE.BoxGeometry(1.6,0.12,4).translate(-5,0,0),new THREE.ConeGeometry(0.55,2,8).rotateZ(-Math.PI/2).translate(6.5,0,0)];
    const pos=[],nor=[];for(const q of g){const n=q.toNonIndexed();pos.push(...n.attributes.position.array);nor.push(...n.attributes.normal.array);}
    const b=new THREE.BufferGeometry();b.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));b.setAttribute('normal',new THREE.Float32BufferAttribute(nor,3));return b;})();
  const jetM=new THREE.MeshLambertMaterial({color:0x2c4fa0});
  function frecce(){const V=LM('vittoriano');if(!V)return;const [vx,vz]=V,a=(K.frecceHeading||155)*Math.PI/180,dx=Math.sin(a),dz=-Math.cos(a),sp=140,ALT=320;
    // in from the north up Via del Corso, over the Vittoriano, and away south
    const x0=vx-dx*2600,z0=vz-dz*2600,jets=[];const SMK=[0x2e9a4a,0x2e9a4a,0x2e9a4a,0xf4f4f0,0xf4f4f0,0xf4f4f0,0xd8302e,0xd8302e,0xd8302e].map(c=>new THREE.Color(c));
    const slot=[[-4,-3],[-3,-2],[-2,-1],[-1,-0.35],[0,0],[-1,0.35],[-2,1],[-3,2],[-4,3]];   // [back, across] in tens of metres: a vee, the leader at its point
    for(let k=0;k<9;k++){const m=tag(new THREE.Mesh(jetGeo,jetM));m.rotation.y=Math.atan2(-dz,dx);scene.add(m);jets.push(m);}
    let t=0;notice('Le Frecce Tricolori','nine Aermacchi in a vee, in over Via del Corso and the Vittoriano, trailing the flag in smoke.',
      ()=>{const ex=vx-dx*170,ez=vz-dz*170,g=groundH(ex,ez);return [ex,g+28,ez,vx-dx*1100,ALT*0.85,vz-dz*1100];});   // from over Piazza Venezia, looking up the Corso as they come
    run((now,dt)=>{t+=dt;const s=t*sp,cx=x0+dx*s,cz=z0+dz*s;
      jets.forEach((m,k)=>{const [b,c]=slot[k],px=cx+dx*b*14-dz*c*14,pz=cz+dz*b*14+dx*c*14;m.position.set(px,ALT+Math.sin(t*0.6+k)*1.2,pz);
        for(let q=0;q<3;q++){const u=R();smoke.emit(px-dx*(6+u*8),ALT+(R()-0.5),pz-dz*(6+u*8),(R()-0.5)*2,-0.6+(R()-0.5)*1.5,(R()-0.5)*2,SMK[k],14+R()*6,0,0.02);}});
      if(s>5400){jets.forEach(m=>scene.remove(m));return false;}return true;});}

  // ---- a conclave: the stove pipe on the Sistine Chapel ----
  function fumata(){const [cx,cz]=P(K.sistine||[41.902996,12.454481]),g=groundH(cx,cz),top=g+(K.sistineRoof||31);
    const pipe=tag(new THREE.Mesh(new THREE.CylinderGeometry(0.22,0.22,4.2,8),new THREE.MeshLambertMaterial({color:0x8a5a3a})));pipe.position.set(cx,top-0.6,cz);scene.add(pipe);
    const black=new THREE.Color(0x1c1c1e),white=new THREE.Color(0xf6f6f2);let t=0,told=false;
    const SQ=LM('stpeterssquare')||[cx+250,cz];const gq=groundH(SQ[0],SQ[1]);
    notice('Fumata','from the stove pipe on the Sistine Chapel: the cardinals have voted. Black smoke - and then white. Habemus papam.',()=>[SQ[0],gq+14,SQ[1],cx,top+6,cz]);   // from the square, as the crowd sees it
    run((now,dt)=>{t+=dt;const c=t<22?black:t<30?null:white;
      if(c)for(let q=0;q<4;q++)smoke.emit(cx+(R()-0.5)*0.3,top+1.6,cz+(R()-0.5)*0.3,0.8+(R()-0.5)*0.8,2.4+R()*1.2,(R()-0.5)*0.8,c,9+R()*5,-0.05,0.08);
      if(t>34&&!told){told=true;H.notice('Habemus papam','white smoke, and the bells of St Peter\'s: the square fills, and everyone waits for the loggia.',null);}
      if(t>75){scene.remove(pipe);return false;}return true;});}

  // ---- the Girandola over Castel Sant'Angelo ----
  function girandola(){const CS=LM('castel');if(!CS)return;const [cx,cz]=CS,g=groundH(cx,cz);
    toHour(6,20.5,21.3);const cols=[0xff5a5a,0xffe08a,0x9adfff,0xffffff,0xff9a3a,0xc890ff];let t=0,next=0;
    notice('La Girandola','fireworks over Castel Sant\'Angelo for Saints Peter and Paul, as Michelangelo is said to have designed them. After dark.',look(cx,g+60,cz,-260,-30,320,20));
    run((now,dt)=>{t+=dt;if(t>next){next=t+0.25+R()*0.9;const x=cx+(R()-0.5)*60,z=cz+(R()-0.5)*60,y=g+80+R()*90;
        sparks.burst(x,y,z,220,26+R()*18,cols[Math.floor(R()*cols.length)],2.2,7);
        if(R()<0.3)for(let k=0;k<30;k++)sparks.emit(cx+(R()-0.5)*20,g+40,cz+(R()-0.5)*20,(R()-0.5)*10,40+R()*20,(R()-0.5)*10,new THREE.Color(0xfff2c0),1.6,18,0.2);}   // the fountain of rockets from the top of the castle
      return t<45;});}

  // ---- coins in the Trevi ----
  function coins(){const TV=(C.landmarks||[]).find(l=>l.model==='trevi');if(!TV)return;const [tx,tz]=P(TV.at),b=(TV.face||140)*Math.PI/180,fx=Math.sin(b),fz=-Math.cos(b),g=groundH(tx,tz),gold=new THREE.Color(0xf0c860),foam=0xe8f4f6;let t=0;
    const cx=tx+fx*10,cz=tz+fz*10;   // the middle of the basin
    notice('Coins in the Trevi','over the left shoulder, into the basin: one coin and you will come back to Rome, two and you will fall in love, three and you will marry.',
      ()=>[cx+fx*34,g+9,cz+fz*34,cx-fx*6,g+3,cz-fz*6]);
    const flying=[];
    run((now,dt)=>{t+=dt;if(t<40&&R()<0.35){const side=(R()-0.5)*36,px=cx+fx*20-fz*side,pz=cz+fz*20+fx*side,tgt=[cx+(R()-0.5)*20,cz+(R()-0.5)*12];
        const T=1.1+R()*0.4,vx=(tgt[0]-px)/T,vz=(tgt[1]-pz)/T,vy=(0.35-1.7)/T+9.8*T/2;flying.push({x:px,y:g+1.7,z:pz,vx,vy,vz});}
      for(let i=flying.length-1;i>=0;i--){const c=flying[i];c.vy-=9.8*dt;c.x+=c.vx*dt;c.y+=c.vy*dt;c.z+=c.vz*dt;fine.emit(c.x,c.y,c.z,0,0,0,gold,0.08);
        if(c.y<g+0.35){fine.burst(c.x,g+0.4,c.z,14,1.6,foam,0.5,6);flying.splice(i,1);}}
      return t<44||flying.length>0;});}

  // ---- Roman Holiday ----
  const vespaGeo=(()=>{const parts=[[new THREE.BoxGeometry(1.3,0.45,0.5),'#a8d0b4',-0.15,0.62,0],[new THREE.BoxGeometry(0.5,0.62,0.42),'#a8d0b4',0.45,0.78,0],[new THREE.CylinderGeometry(0.24,0.24,0.14,10).rotateX(Math.PI/2),'#1a1a1a',-0.6,0.24,0],
      [new THREE.CylinderGeometry(0.24,0.24,0.14,10).rotateX(Math.PI/2),'#1a1a1a',0.62,0.24,0],[new THREE.BoxGeometry(0.1,0.1,0.62),'#c8c8c8',0.6,1.22,0],
      [new THREE.BoxGeometry(0.34,0.66,0.44),'#e8e4dc',-0.05,1.22,0],[new THREE.SphereGeometry(0.15,8,6),'#d9b08c',0.0,1.7,0],[new THREE.SphereGeometry(0.15,8,6),'#2a2018',-0.03,1.76,0],   // him, in a pale suit
      [new THREE.BoxGeometry(0.3,0.58,0.4),'#f0ece4',-0.48,1.18,0],[new THREE.CylinderGeometry(0.3,0.36,0.4,10),'#3a3a3a',-0.48,0.92,0],[new THREE.SphereGeometry(0.14,8,6),'#e2bfa0',-0.48,1.62,0],[new THREE.SphereGeometry(0.15,8,6),'#2a1c14',-0.5,1.67,0]];   // her: white blouse, dark skirt, short dark hair
    const pos=[],nor=[],col=[];for(const [g0,c,x,y,z] of parts){const g=g0.toNonIndexed().translate(x,y,z),cc=new THREE.Color(c);pos.push(...g.attributes.position.array);nor.push(...g.attributes.normal.array);for(let i=0;i<g.attributes.position.count;i++)col.push(cc.r,cc.g,cc.b);}
    const b=new THREE.BufferGeometry();b.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));b.setAttribute('normal',new THREE.Float32BufferAttribute(nor,3));b.setAttribute('color',new THREE.Float32BufferAttribute(col,3));return b;})();
  function vespa(){const names=K.vespaRoute||['Via dei Fori Imperiali','Piazza Venezia','Via del Corso'];
    // the route: waypoints in the config (the avenue is mapped as broken carriageways that will not join), else the named roads joined
    let route=K.vespaWaypoints?K.vespaWaypoints.map(ll=>P(ll)):null;
    if(!route){const lines=ROADS.filter(r=>names.includes(r.name)).map(r=>r.pts.map((p,i)=>[p[0],p[1],r.ys?r.ys[i]:0]));const ch=joinFast(lines,6).sort((a,b)=>b.length-a.length);if(!ch.length)return;route=ch[0];}const CO=LM('colosseum');if(CO){const d0=Math.hypot(route[0][0]-CO[0],route[0][1]-CO[1]),d1=Math.hypot(route[route.length-1][0]-CO[0],route[route.length-1][1]-CO[1]);if(d1<d0)route=route.slice().reverse();}
    const cum=[0];for(let i=0;i+1<route.length;i++)cum.push(cum[i]+Math.hypot(route[i+1][0]-route[i][0],route[i+1][1]-route[i][1]));const len=cum[cum.length-1];
    const m=tag(new THREE.Mesh(vespaGeo,new THREE.MeshLambertMaterial({vertexColors:true})));m.castShadow=true;scene.add(m);let s=0;
    const at=s2=>{let i=0;while(i<cum.length-2&&cum[i+1]<s2)i++;const a=route[i],b=route[i+1],L=cum[i+1]-cum[i]||1,u=(s2-cum[i])/L;return [a[0]+(b[0]-a[0])*u,a[1]+(b[1]-a[1])*u,(b[0]-a[0])/L,(b[1]-a[1])/L];};
    notice('Roman Holiday','a pale-green Vespa, two up: down Via dei Fori Imperiali from the Colosseum, round Piazza Venezia and up the Corso.',
      ()=>{const [x,z,ux,uz]=at(Math.max(0,s-1));const px=x-uz*2.2,pz=z+ux*2.2,g=groundH(px,pz);return [px-ux*9,g+3.2,pz-uz*9,px,g+1.3,pz];},()=>m.position);   // straight behind: the Corso is narrow
    run((now,dt)=>{s+=9*dt;if(s>=len){scene.remove(m);return false;}const [x,z,ux,uz]=at(s),off=2.2;   // on the right
      const px=x-uz*off,pz=z+ux*off;m.position.set(px,groundH(px,pz)+0.02,pz);m.rotation.set(0,Math.atan2(-uz,ux),Math.sin(now*0.004)*0.04);return true;});}

  // ---- the starlings over the Tiber ----
  function storni(){toHour(0,16.3,17.2);toHour(18.6,24,17.2);const N=K.starlings||6000,[sx,sz]=P(K.starlingsAt||[41.8975,12.4705]),g=groundH(sx,sz)+90;
    const pos=new Float32Array(N*3),geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(pos,3));
    const pts=tag(new THREE.Points(geo,new THREE.PointsMaterial({color:0x141418,size:1.5,transparent:true,opacity:0.9,depthWrite:false})));pts.frustumCulled=false;scene.add(pts);
    const B=[];for(let i=0;i<N;i++)B.push({a:R()*6.28,b:R()*6.28,r:R(),ph:R()*6.28});let t=0;
    notice('Gli storni','the starlings, at dusk: a million of them over the Tiber every winter evening, one shape folding and turning in the air.',look(sx,g,sz,-260,-40,260,0));
    run((now,dt)=>{t+=dt;
      // the flock is a body that moves and folds: its centre wanders, its shape a stretched, twisting ellipsoid
      const cx=sx+Math.sin(t*0.23)*160+Math.sin(t*0.61)*40,cz=sz+Math.cos(t*0.19)*120,cy=g+Math.sin(t*0.37)*25,ax=70+40*Math.sin(t*0.5),ay=18+12*Math.sin(t*0.71+1),az=40+30*Math.cos(t*0.43),tw=t*0.6;
      for(let i=0;i<N;i++){const q=B[i],r=Math.cbrt(q.r),u=q.a+Math.sin(t*0.9+q.ph)*0.3,v=q.b+Math.cos(t*0.7+q.ph)*0.3;
        let x=Math.cos(u)*Math.sin(v)*ax*r,y=Math.cos(v)*ay*r,z=Math.sin(u)*Math.sin(v)*az*r;const c=Math.cos(tw+y*0.03),s2=Math.sin(tw+y*0.03);
        pos[i*3]=cx+x*c-z*s2;pos[i*3+1]=cy+y+Math.sin(x*0.05+t*2)*6;pos[i*3+2]=cz+x*s2+z*c;}
      geo.attributes.position.needsUpdate=true;pts.material.opacity=Math.min(0.9,t*0.3,Math.max(0,(70-t)*0.3));
      if(t>70){scene.remove(pts);return false;}return true;});}

  H=createHappenings(api,{events:{frecce:['Le Frecce Tricolori',frecce],fumata:['Fumata bianca',fumata],girandola:['La Girandola',girandola],coins:['Coins in the Trevi',coins],
      vespa:['Roman Holiday',vespa],storni:['The starlings',storni]},
    order:['vespa','coins','frecce','storni','fumata','girandola'],first:K.first||40000,every:K.every||[70000,120000]});
}
