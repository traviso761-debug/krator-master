// ---------- what happens at Yachats ----------
// Every minute or two something happens, and the Events button fires any of them now (src/core/happenings.js).
//
//   whales   gray whales going by, a few hundred metres out: the migration passes Yachats twice a year, south in
//            December and January and north again in spring, and from the shelf you see the blows first
//   storm    a winter storm with a king tide: the sky closes in grey, the swell doubles, and Thor's Well, the
//            Spouting Horn and Devil's Churn go off as they only do in winter (ctx.yaSurge, read by coast.js)
//   fog      the marine layer comes in off the sea on a summer afternoon and swallows the cape from the bottom up
import { createHappenings } from '../core/happenings.js';

export function events(api){
  const {THREE,C,ctx,scene,groundH,P}=api;const K=C.yachatsEvents||{};
  const R=Math.random;let H=null;const run=fn=>H.run(fn),notice=(...a)=>H.notice(...a);
  const tag=o=>{o.traverse(q=>{q.userData.noFingerprint=true;q.userData.noWire=true;});return o;};
  const M=c=>new THREE.MeshLambertMaterial({color:c});

  // ---- gray whales going by ----
  function whales(){const [wx,wz]=P(K.whales||[44.30,-124.125]),dir=R()<0.5?1:-1,pod=[];const grp=new THREE.Group();
    const body=new THREE.SphereGeometry(1,12,8).scale(2.2,1,7),fluke=new THREE.BoxGeometry(5,0.3,1.8),skin=M(0x5a6064),blowM=new THREE.PointsMaterial({color:0xf4f6f8,size:1.4,transparent:true,opacity:0.8,depthWrite:false});
    for(let i=0;i<3;i++){const w=new THREE.Group();w.add(new THREE.Mesh(body,skin));const f=new THREE.Mesh(fluke,skin);f.position.set(0,0,-8);w.add(f);w.scale.setScalar(0.9+R()*0.3);
      const bg=new THREE.BufferGeometry(),bp=new Float32Array(60*3);bg.setAttribute('position',new THREE.BufferAttribute(bp,3));const blow=new THREE.Points(bg,blowM.clone());blow.frustumCulled=false;
      grp.add(w,blow);pod.push({w,f,blow,bp,off:(R()-0.5)*60,lag:i*25+R()*10,ph:R()*6,bt:-1});}
    tag(grp);scene.add(grp);let t=0;const SP=2.2,L=3600;
    const at=s=>[wx+Math.sin(s*0.002)*80,wz+dir*(s-L/2)];
    notice('Gray whales','going by a few hundred metres out, on the way between the lagoons of Baja California and the Arctic: from the shore you see the blows first, a puff of white over the swell, and then the backs.',
      ()=>{const [x,z]=at(t*SP);return [x+260,40,z-dir*160,x,0,z];},()=>{const [x,z]=at(t*SP);return [x,0,z];});
    run((now,dt)=>{t+=dt;for(const q of pod){const s=t*SP-q.lag,[x,z]=at(s);const cyc=(t+q.ph)%14,up=cyc<4;
        q.w.position.set(x+q.off,up?-0.6+Math.sin(cyc/4*Math.PI)*1.2:-6,z);q.w.rotation.y=dir>0?0:Math.PI;q.w.rotation.x=up?(cyc/4-0.5)*0.3:0;
        q.f.rotation.x=cyc>3&&cyc<5?-(cyc-3)*0.6:0;
        if(cyc<0.05&&q.bt<0)q.bt=0;   // the blow, as the back breaks the surface
        if(q.bt>=0){q.bt+=dt;for(let i=0;i<60;i++){const a=i*2.4,r=q.bt*1.5*(i%5)/5;q.bp[i*3]=x+q.off+Math.cos(a)*r;q.bp[i*3+1]=1+q.bt*4*(0.6+(i%7)/10)-q.bt*q.bt*0.8;q.bp[i*3+2]=z+Math.sin(a)*r;}
          q.blow.geometry.attributes.position.needsUpdate=true;q.blow.material.opacity=Math.max(0,0.85-q.bt*0.3);if(q.bt>3)q.bt=-1;}}
      if(t*SP>L+120){scene.remove(grp);return false;}return true;});}

  // ---- a winter storm and a king tide ----
  function storm(){const F=scene.fog;if(!F||F.density===undefined)return;let t=0;const D=90;
    notice('A winter storm','in off the Pacific with a king tide behind it: the swell doubles, the sky closes in, and Thor\'s Well, the Spouting Horn and Devil\'s Churn go off as they only do in winter. Watch from above: the sneaker waves are what kills people on these rocks.',
      ()=>{const [vx,vz]=P(K.stormView||[44.2784,-124.1133]);return [vx+90,30,vz-70,vx,2,vz];});
    run((now,dt)=>{t+=dt;const f=t<12?t/12:t<D-12?1:Math.max(0,(D-t)/12);ctx.yaSurge=1+f*1.4;F.density*=1+f*1.8;F.color.lerp(new THREE.Color(0x6a7074),f*0.55);
      if(scene.background&&scene.background.isColor)scene.background.lerp(new THREE.Color(0x5e6468),f*0.6);
      if(t>D){ctx.yaSurge=1;return false;}return true;});}

  // ---- the marine layer comes in ----
  function fog(){const F=scene.fog;if(!F||F.density===undefined)return;let t=0;const D=110;
    // a bank of low cloud on the sea, rolling in toward the shore and up over it
    const grp=new THREE.Group(),puff=new THREE.SphereGeometry(1,18,10),mat=new THREE.MeshLambertMaterial({color:0xe8ecee,transparent:true,opacity:0.0,depthWrite:false});
    const [cx,cz]=P([44.295,-124.135]);for(let i=0;i<70;i++){const m=new THREE.Mesh(puff,mat);m.position.set(cx+(R()-0.5)*900,10+R()*35,cz+(R()-0.5)*6000);m.scale.set(120+R()*160,18+R()*20,120+R()*160);grp.add(m);}
    tag(grp);scene.add(grp);
    notice('The marine layer','comes in off the sea on a summer afternoon: inland it is hot and clear, and here a grey wall walks in over the surf and swallows the cape from the bottom up, and the foghorn mood of the coast comes back.',
      ()=>{const [vx,vz]=P([44.2990,-124.1150]);return [vx,120,vz,vx+1200,40,vz-1800];});
    run((now,dt)=>{t+=dt;const f=t<20?t/20:t<D-20?1:Math.max(0,(D-t)/20);mat.opacity=f*0.55;grp.position.x=Math.min(t,60)*14;F.density*=1+f*3.5;F.color.lerp(new THREE.Color(0xc8ccd0),f*0.7);
      if(t>D){scene.remove(grp);return false;}return true;});}

  H=createHappenings(api,{events:{whales:['Gray whales',whales],storm:['A winter storm',storm],fog:['The marine layer',fog]},order:['whales','storm','fog'],first:K.first||40000,every:K.every||[70000,130000]});
}
