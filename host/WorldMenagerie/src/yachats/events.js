// ---------- what happens at Yachats ----------
// Every minute or two something happens, and the Events button fires any of them now (src/core/happenings.js).
//
//   whales    gray whales going by half a kilometre out: some 18,000 pass this shore south in December and January
//             and north again in spring, mothers and calves last, within a mile of the rocks. What you see from the
//             shelf: the blow first, short and bushy and heart-shaped from in front or behind (two blowholes), three
//             to five breaths a few seconds apart as the back rolls over (no dorsal fin: a low hump two-thirds of the
//             way back and a row of knuckles down the tail stock, grey mottled white with barnacles and their scars),
//             then the back arches, the tail stock rises and the flukes lift clear before a dive of minutes. Now and
//             then one breaches, two-thirds out, and falls on its side
//   pelicans  brown pelicans in a line, gliding a wingspan over the swell along the surf, a few beats and a long
//             glide, one at a time following the leader's beat; now and then one folds and plunges
//   hightide  the hour either side of high tide, when Thor's Well, the Spouting Horn and Devil's Churn work: the
//             swell over the shelf, the well filling and draining, the horn and the churn going off with every set
//             (ctx.yaSurge, read by rocks.js). Watched from above: sneaker waves are what kill people on these rocks
//   fog       the marine layer comes in off the sea on a summer afternoon and swallows the cape from the bottom up
import { createHappenings } from '../core/happenings.js';
import { hash3 } from '../core/rng.js';

export function events(api){
  const {THREE,C,ctx,scene,P}=api;const K=C.yachatsEvents||{};
  const R=Math.random;let H=null;const run=fn=>H.run(fn),notice=(...a)=>H.notice(...a);
  const tag=o=>{o.traverse(q=>{q.userData.noFingerprint=true;q.userData.noWire=true;});return o;};
  const WY=ctx.waterLevel==null?0.7:ctx.waterLevel;
  // the coast's x at a given z (the westmost of the mapped coastline there), for keeping things offshore
  const CO=[];for(const f of (ctx.yaLand&&ctx.yaLand.coast)||[])for(let i=0;i<f.length;i+=2)CO.push([f[i]/10,f[i+1]/10]);
  const coastX=z=>{let best=null;for(const [x,cz] of CO)if(Math.abs(cz-z)<60&&(best===null||x<best))best=x;if(best!==null)return best;let bd=1e9,bx=-500;for(const [x,cz] of CO){const d=Math.abs(cz-z);if(d<bd){bd=d;bx=x;}}return bx;};

  // ================================================================ gray whales
  // the body: a lathe along +z (the snout at +z), flattened a little, the head narrow and turned down; vertex
  // colours mottle it, densest on the head where the barnacles are; the hump and the knuckles on the tail stock;
  // the flippers; the flukes on their own pivot so the tail can lift
  const whaleGeo=(()=>{const prof=[];for(let i=0;i<=24;i++){const u=i/24;   // u 0 the snout .. 1 the tail's narrowest
      const r=u<0.28?0.18+0.82*Math.sin(u/0.28*Math.PI/2):u<0.58?1:u<0.9?1-(u-0.58)/0.32*0.8:0.2-(u-0.9)/0.1*0.08;prof.push(new THREE.Vector2(Math.max(0.05,r),(0.5-u)*13));}
    const g=new THREE.LatheGeometry(prof,14).rotateX(Math.PI/2);   // the lathe's axis is y; along z now, snout +z
    const p=g.attributes.position,col=[];const base=[0.42,0.45,0.47],pale=[0.82,0.82,0.78];
    for(let i=0;i<p.count;i++){let x=p.getX(i),y=p.getY(i),z=p.getZ(i);const u=0.5-z/13;
      x*=u<0.3?0.62+0.38*u/0.3:1;y*=0.82;if(u<0.25)y-=(0.25-u)*1.6;   // the narrow head, arched and turned down
      p.setXYZ(i,x*1.45,y*1.45,z);
      const n=hash3(Math.round(x*3),Math.round(y*3),Math.round(z*2)),spot=n>(u<0.3?0.55:0.8),k=spot?0.5+0.5*hash3(i,3,9):0;
      const belly=y<-0.3?0.06:0;col.push(base[0]+(pale[0]-base[0])*k+belly,base[1]+(pale[1]-base[1])*k+belly,base[2]+(pale[2]-base[2])*k+belly);}
    g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));g.computeVertexNormals();return g;})();
  const flukeGeo=(()=>{const s=new THREE.Shape();s.moveTo(0,0);s.quadraticCurveTo(0.9,-0.6,1.7,-1.5);s.quadraticCurveTo(1.1,-1.4,0.3,-1.2);s.lineTo(0,-0.95);s.lineTo(-0.3,-1.2);
      s.quadraticCurveTo(-1.1,-1.4,-1.7,-1.5);s.quadraticCurveTo(-0.9,-0.6,0,0);
      return new THREE.ExtrudeGeometry(s,{depth:0.12,bevelEnabled:false}).translate(0,0,-0.06).rotateX(Math.PI/2).scale(1.0,1,1.05);})();   // back from the pivot; the notch at the middle
  const skinM=new THREE.MeshLambertMaterial({vertexColors:true}),flatM=new THREE.MeshLambertMaterial({color:0x5c6266});
  function makeWhale(scale){const w=new THREE.Group(),body=new THREE.Mesh(whaleGeo,skinM);w.add(body);
    const hump=new THREE.Mesh(new THREE.SphereGeometry(0.5,8,6).scale(1,0.55,1.6),flatM);hump.position.set(0,1.05,-2.2);w.add(hump);   // the hump, two-thirds back
    for(let k=0;k<8;k++){const kn=new THREE.Mesh(new THREE.SphereGeometry(0.22-k*0.015,6,4).scale(1,0.7,1.2),flatM);kn.position.set(0,0.85-k*0.08,-3.0-k*0.42);w.add(kn);}   // the knuckles
    for(const s of [-1,1]){const f=new THREE.Mesh(new THREE.SphereGeometry(1,8,5).scale(0.18,0.08,0.8),flatM);f.position.set(s*1.2,-0.7,3.0);f.rotation.set(0.3,s*0.5,s*0.6);w.add(f);}   // the flippers
    const tail=new THREE.Group();tail.position.set(0,0,-6.4);const fl=new THREE.Mesh(flukeGeo,flatM);tail.add(fl);w.add(tail);
    w.scale.setScalar(scale);return {g:w,tail};}
  // the blow: two plumes from the two blowholes, leaning apart (the heart from in front or behind), bushy, drifting
  const NB=140;
  function makeBlow(){const g=new THREE.BufferGeometry(),p=new Float32Array(NB*3),v=new Float32Array(NB*3);g.setAttribute('position',new THREE.BufferAttribute(p,3));
    const pts=new THREE.Points(g,new THREE.PointsMaterial({color:0xf2f5f7,size:1.1,transparent:true,opacity:0,depthWrite:false}));pts.frustumCulled=false;return {pts,p,v,t:-1};}
  function blowAt(b,x,y,z,yaw,size){for(let i=0;i<NB;i++){const s=i%2?1:-1,lean=0.35*s,up=(5.5+R()*2.5)*size,ax=Math.cos(yaw),az=-Math.sin(yaw);   // the side-to-side of the body
      b.p[i*3]=x+ax*s*0.3;b.p[i*3+1]=y;b.p[i*3+2]=z+az*s*0.3;b.v[i*3]=ax*lean*up*0.5+(R()-0.5)*1.2;b.v[i*3+1]=up*(0.6+R()*0.5);b.v[i*3+2]=az*lean*up*0.5+(R()-0.5)*1.2;}
    b.t=0;b.y0=y;}
  function stepBlow(b,dt,wind){if(b.t<0)return;b.t+=dt;for(let i=0;i<NB;i++){b.v[i*3+1]-=6*dt;b.v[i*3]*=1-1.6*dt;b.v[i*3+2]*=1-1.6*dt;b.v[i*3]+=wind*dt;
      b.p[i*3]+=b.v[i*3]*dt;b.p[i*3+1]=Math.max(b.y0,b.p[i*3+1]+b.v[i*3+1]*dt);b.p[i*3+2]+=b.v[i*3+2]*dt;}
    b.pts.geometry.attributes.position.needsUpdate=true;b.pts.material.opacity=Math.max(0,0.85-b.t*0.2);b.pts.material.size=1.1+b.t*0.6;if(b.t>4.5){b.t=-1;b.pts.material.opacity=0;}}
  // the splash of a breach or a fluke's drip
  const NS=260;
  function makeSplash(){const g=new THREE.BufferGeometry(),p=new Float32Array(NS*3),v=new Float32Array(NS*3);g.setAttribute('position',new THREE.BufferAttribute(p,3));
    const pts=new THREE.Points(g,new THREE.PointsMaterial({color:0xffffff,size:1.4,transparent:true,opacity:0,depthWrite:false}));pts.frustumCulled=false;return {pts,p,v,t:-1};}
  function splash(s,x,z,power){for(let i=0;i<NS;i++){const a=R()*6.28,r=R()*3*power;s.p[i*3]=x+Math.cos(a)*r;s.p[i*3+1]=WY;s.p[i*3+2]=z+Math.sin(a)*r;
      s.v[i*3]=Math.cos(a)*(2+R()*5)*power;s.v[i*3+1]=(3+R()*9)*power;s.v[i*3+2]=Math.sin(a)*(2+R()*5)*power;}s.t=0;}
  function stepSplash(s,dt){if(s.t<0)return;s.t+=dt;for(let i=0;i<NS;i++){s.v[i*3+1]-=9.8*dt;s.p[i*3]+=s.v[i*3]*dt;s.p[i*3+1]=Math.max(WY,s.p[i*3+1]+s.v[i*3+1]*dt);s.p[i*3+2]+=s.v[i*3+2]*dt;}
    s.pts.geometry.attributes.position.needsUpdate=true;s.pts.material.opacity=Math.max(0,0.95-s.t*0.4);if(s.t>2.6){s.t=-1;s.pts.material.opacity=0;}}

  function whales(){const [wx0,wz0]=P(K.whales||[44.30,-124.125]),north=R()<0.5,dir=north?-1:1;   // z runs south: north is -z
    const spring=north,grp=new THREE.Group();scene.add(grp);
    const pod=[];const n=spring?2:2+Math.floor(R()*3);
    for(let i=0;i<n;i++){const calf=spring&&i===1,wh=makeWhale(calf?0.45:0.9+R()*0.2),b=makeBlow(),sp=makeSplash();grp.add(wh.g,b.pts,sp.pts);
      pod.push({wh,b,sp,calf,ty:-3,lat:calf?5:(i-(n-1)/2)*(18+R()*14),lag:calf?2:i*(8+R()*10),off:R()*6,state:'cruise',st:0,breaths:3+Math.floor(R()*3),y:-3,pitch:0,roll:0,tailUp:0});}
    tag(grp);
    const SP=2.0,LEN=1300,OFF=420+R()*250;let t=0;
    const at=s=>{const z=wz0+dir*(s-LEN/2),x=coastX(z)-OFF+Math.sin(s*0.004)*40;return [x,z];};
    notice(spring?'Gray whales, a mother and calf':'Gray whales',
      spring?'going north in spring, the last of the migration: a mother and her calf, born in the lagoons of Baja California, keeping close inshore on the way to the Arctic. You see the blows first, a puff of white over the swell, and then the backs: no fin, a low hump and a row of knuckles, grey mottled white.'
            :'going south between the Arctic and the lagoons of Baja California, half a kilometre out. You see the blows first, short and bushy, and then the backs rolling over: three to five breaths, then the tail stock arches and the flukes lift clear before a dive of minutes.',
      ()=>{const [x,z]=at(t*SP);return [x+130,16,z-dir*90,x,0,z];},()=>{const [x,z]=at(t*SP);return [x,0,z];});
    run((now,dt)=>{t+=dt;const s0=t*SP;
      for(const q of pod){const s=s0-q.lag*SP,[x,z]=at(s),[x2,z2]=at(s+4),yaw=Math.atan2(x2-x,z2-z);q.st+=dt;
        // the round: cruise under, surface for a breath (blow, the back rolls over), and after the last a deep dive
        if(q.state==='cruise'&&q.st>(q.calf?4:7)+q.off){q.state=R()<0.08&&!q.calf?'breach':'breathe';q.st=0;q.off=R()*3;}
        if(q.state==='breathe'){const T=6,u=q.st/T;   // 0..1: head up and blow, the back rolls, the hump and knuckles last
          q.ty=-0.35+Math.sin(Math.min(1,u)*Math.PI)*0.75;q.pitch=0.12-u*0.24;q.tailUp=0;
          if(q.st-dt<0.25&&q.st>=0.25)blowAt(q.b,x+Math.sin(yaw)*5*q.wh.g.scale.x,WY+0.6,z+Math.cos(yaw)*5*q.wh.g.scale.x,yaw,q.calf?0.5:1);
          if(q.st>T){q.breaths--;q.st=0;q.state=q.breaths>0?'cruise':'dive';q.off=-4;}}
        else if(q.state==='dive'){const T=7,u=Math.min(1,q.st/T);   // the back arches, the tail stock rises, the flukes lift and slip under
          q.pitch=-0.15-u*0.75;q.ty=-0.1-u*2.4;q.tailUp=Math.sin(Math.min(1,u*1.3)*Math.PI)*1.1;
          if(q.st-dt<T*0.75&&q.st>=T*0.75)splash(q.sp,x-Math.sin(yaw)*6,z-Math.cos(yaw)*6,0.35);
          if(q.st>T){q.state='deep';q.st=0;}}
        else if(q.state==='deep'){q.ty=-14;q.pitch=0;q.tailUp=0;if(q.st>22+R()*0.1){q.state='cruise';q.st=0;q.breaths=3+Math.floor(R()*3);q.off=0;}}
        else if(q.state==='breach'){const T=4.2,u=q.st/T;   // two-thirds out, a roll onto the side, the fall
          q.pitch=u<0.45?0.9:0.9-(u-0.45)*2.6;q.roll=u<0.45?0:Math.min(1.5,(u-0.45)*4);q.y=q.ty=-2+Math.sin(Math.min(1,u)*Math.PI)*6.5;
          if(q.st-dt<T*0.8&&q.st>=T*0.8)splash(q.sp,x,z,1.2);
          if(q.st>T){q.state='breathe';q.st=0;q.roll=0;}}
        else{q.ty=-3;q.pitch*=1-Math.min(1,dt);}
        if(q.state!=='breach')q.y+=(q.ty-q.y)*Math.min(1,dt*(q.state==='breathe'?4:1.2));
        q.wh.g.position.set(x+Math.cos(yaw)*q.lat,WY+q.y,z-Math.sin(yaw)*q.lat);q.wh.g.rotation.set(0,yaw,0);q.wh.g.rotateX(-q.pitch);q.wh.g.rotateZ(q.roll);
        q.wh.tail.rotation.x=q.tailUp+Math.sin(t*1.4+q.off)*0.12;
        stepBlow(q.b,dt,0.6);stepSplash(q.sp,dt);}
      if(s0>LEN+pod.length*30){scene.remove(grp);return false;}return true;});}

  // ================================================================ brown pelicans
  function pelicans(){const n=6+Math.floor(R()*7),grp=new THREE.Group(),birds=[];
    const body=new THREE.SphereGeometry(1,8,6).scale(0.28,0.24,0.75),wing=new THREE.BoxGeometry(1.0,0.04,0.42).translate(0.5,0,0),neck=new THREE.CylinderGeometry(0.06,0.08,0.45,5).rotateX(-1.1).translate(0,0.14,0.62);
    const head=new THREE.SphereGeometry(0.11,6,5).translate(0,0.26,0.86),bill=new THREE.ConeGeometry(0.05,0.55,4).rotateX(Math.PI/2+0.2).translate(0,0.2,1.15);
    const brown=new THREE.MeshLambertMaterial({color:0x6a6058}),grey=new THREE.MeshLambertMaterial({color:0x8a8680}),white=new THREE.MeshLambertMaterial({color:0xece6c8}),billM=new THREE.MeshLambertMaterial({color:0xb08a5a});
    for(let i=0;i<n;i++){const b=new THREE.Group();b.add(new THREE.Mesh(body,brown),new THREE.Mesh(neck,white),new THREE.Mesh(head,white),new THREE.Mesh(bill,billM));
      const wl=new THREE.Mesh(wing,grey),wr=new THREE.Mesh(wing,grey);wl.rotation.y=Math.PI;b.add(wl,wr);b.scale.setScalar(1.15);grp.add(b);birds.push({b,wl,wr,dive:-1});}
    tag(grp);scene.add(grp);
    const cam=api.camera.position,north=R()<0.5,dir=north?-1:1,z0=cam.z-dir*1400,SP=11,LEN=2800,OFF=70+R()*60;let t=0;
    const at=s=>{const z=z0+dir*s;return [coastX(z)-OFF+Math.sin(s*0.01)*15,z];};
    notice('Brown pelicans','in a line low over the swell, a wingspan off the water: a few beats from the leader, passed down the line, and a long glide on the air the waves push up. Now and then one folds its wings and plunges.',
      ()=>{const [x,z]=at(t*SP);return [x+28,7,z+dir*34,x,3,z];},()=>{const [x,z]=at(t*SP);return [x,4,z];});
    run((now,dt)=>{t+=dt;
      birds.forEach((q,i)=>{const s=t*SP-i*6,[x,z]=at(s),[x2,z2]=at(s+3),yaw=Math.atan2(x2-x,z2-z);
        const beat=((t-i*0.35)%6)<1.4?Math.sin((t-i*0.35)*7):0.08;   // the leader's beats run down the line
        let y=WY+2.2+Math.sin(s*0.05)*0.6;
        if(q.dive<0&&R()<dt*0.004)q.dive=0;
        if(q.dive>=0){q.dive+=dt;const u=q.dive/2.4;y+=u<0.5?u*12:Math.max(-3,6-(u-0.5)*22);q.b.rotation.set(u<0.5?-0.4:1.2,yaw,0);if(u>1.4){q.dive=-1;}}
        else q.b.rotation.set(0,yaw,0);
        q.b.position.set(x,y,z);q.wl.rotation.z=-beat*0.6;q.wr.rotation.z=beat*0.6+0;q.wl.rotation.x=0;});
      if(t*SP>LEN+n*6){scene.remove(grp);return false;}return true;});}

  // ================================================================ high tide at Thor's Well
  function hightide(){let t=0;const D=150;
    notice('High tide at Thor\'s Well','the hour either side of high tide, when the swell comes over the shelf: Thor\'s Well fills from below, spouts and drains, the Spouting Horn blows out of Cook\'s Chasm with every set, and the Churn throws spray up its walls. Watch from above, on the trail: sneaker waves are what kill people on these rocks.',
      ()=>{const [vx,vz]=P(K.tideView||[44.2786,-124.1129]),[wx,wz]=P([44.27842,-124.11352]);return [vx,22,vz,wx,3,wz];});
    run((now,dt)=>{t+=dt;const f=t<15?t/15:t<D-15?1:Math.max(0,(D-t)/15);ctx.yaSurge=1+f*1.1;if(t>D){ctx.yaSurge=1;return false;}return true;});}

  // ================================================================ the marine layer comes in
  function fog(){const F=scene.fog;if(!F||F.density===undefined)return;let t=0;const D=120;
    // soft puffs (a blurred disc on a sprite) in a bank on the sea, rolling in toward the shore and up over it
    const cv=document.createElement('canvas');cv.width=cv.height=64;const g=cv.getContext('2d'),gr=g.createRadialGradient(32,32,2,32,32,32);
    gr.addColorStop(0,'rgba(255,255,255,0.9)');gr.addColorStop(0.5,'rgba(255,255,255,0.45)');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.fillRect(0,0,64,64);
    const tex=new THREE.CanvasTexture(cv),grp=new THREE.Group(),mats=[];
    const [cx,cz]=P([44.295,-124.135]);for(let i=0;i<140;i++){const m=new THREE.SpriteMaterial({map:tex,color:0xe6eaec,transparent:true,opacity:0,depthWrite:false,fog:true});mats.push(m);
      const sp=new THREE.Sprite(m);sp.position.set(cx+(R()-0.5)*1200,8+R()*40,cz+(R()-0.5)*7000);sp.scale.set(260+R()*260,60+R()*50,1);grp.add(sp);}
    tag(grp);scene.add(grp);
    notice('The marine layer','comes in off the sea on a summer afternoon: inland it is hot and clear, and here a grey wall walks in over the surf and swallows the cape from the bottom up.',
      ()=>{const [vx,vz]=P([44.2990,-124.1150]);return [vx,120,vz,vx+1200,40,vz-1800];});
    run((now,dt)=>{t+=dt;const f=t<25?t/25:t<D-25?1:Math.max(0,(D-t)/25);for(const m of mats)m.opacity=f*0.3;grp.position.x=Math.min(t,80)*12;F.density*=1+f*3.2;F.color.lerp(new THREE.Color(0xc8ccd0),f*0.7);
      if(t>D){scene.remove(grp);tex.dispose();return false;}return true;});}

  H=createHappenings(api,{events:{whales:['Gray whales',whales],pelicans:['Brown pelicans',pelicans],hightide:['High tide at Thor\'s Well',hightide],fog:['The marine layer',fog]},
    order:['whales','pelicans','hightide','fog'],first:K.first||40000,every:K.every||[70000,130000]});
}
