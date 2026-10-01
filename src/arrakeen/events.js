// ---------- what happens on Arrakis ----------
// Fan work; Dune belongs to the Herbert estate and every shape here is this project's own.
//
// Every minute or two one of these comes round on its own (src/core/happenings.js: the notice, the Events
// button, #event=<name> in the address):
//
//   wormsign   a ridge of sand running at a harvester. The carryall comes in, drops its grapples, fills its
//              bags and lifts the harvester clear - and where the harvester was, the sand opens and the worm
//              comes up, a ring of segments and a crown of teeth, and goes down again. The carryall sets the
//              harvester down somewhere else and the work goes on. The one time the worm is drawn.
//   storm      a Coriolis storm off the deep desert: a wall of dust coming across the basin, the light going
//              brown, static lightning in it, and then it has passed
//   blow       a spice blow: the pre-spice mass under the sand goes off, a fountain of sand and melange
//              standing up out of the dunes, and a rust-red stain where it comes down
//   patrol     a flight of ornithopters off the Residency's platform, out over the town to the Shield Wall and
//              back, wings a blur
//   lighter    a Guild lighter coming down on the landing field on its suspensors, dust blowing out from under
//              it in a ring, and going back up
import { mkRng } from '../core/rng.js';
import { createHappenings } from '../core/happenings.js';
import { makeThopter, makeCarryall, makeMaw } from './machines.js';
import { createDust } from '../core/dust.js';

export function events(api){
  const {THREE,ctx,scene,groundH,sun,ambient,hemi,renderer}=api;
  const P=ctx.arrakeenCity;if(!P)return;
  const R=mkRng(Date.now()%100000);
  const sand=createDust(api,{max:9000,size:26,color:0xc9a878,drag:0.5,gravity:3,wind:[4,0,2]});
  const spice=createDust(api,{max:5000,size:30,color:0xa65a2c,drag:0.45,gravity:4,wind:[3,0,1.5]});
  const storm=createDust(api,{max:7000,size:320,color:0xb88a5a,drag:0.2,gravity:-0.3,wind:[18,0,9]});
  const lerp=(a,b,t)=>a+(b-a)*t,ease=t=>t*t*(3-2*t),clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const look=(x,y,z,dist,up,a)=>()=>{const aa=a===undefined?Math.atan2(z,x)+0.6:a;return [x+Math.cos(aa)*dist,y+up,z+Math.sin(aa)*dist,x,y+10,z];};
  let H=null;

  // ---- wormsign, and the carryall ----
  const maw=makeMaw(THREE,{radius:70});maw.visible=false;scene.add(maw);
  maw.traverse(o=>{o.userData.noFingerprint=true;});
  function wormsign(){
    const D=ctx.arrakeenDesert;if(!D||!D.rigs.length)return;
    const rig=D.rigs[Math.floor(R()*D.rigs.length)],cay=D.flyers.find(f=>f.big&&!f.held)||null;
    if(rig.held)return;
    const [hx,hz]=rig.cur||[rig.x,rig.z],hy=groundH(hx,hz),hs=rig.g.userData.size;
    rig.held=true;if(cay)cay.held=true;
    const ca=cay?cay.g:makeCarryall(THREE);if(!cay)scene.add(ca);
    const from=ca.position.clone(),a0=R()*Math.PI*2,wx0=hx+Math.cos(a0)*2600,wz0=hz+Math.sin(a0)*2600;
    // the ridge: sand heaped over something moving, and dust thrown off it
    const ridge=new THREE.Group();const rM=new THREE.MeshLambertMaterial({color:0xcbb083,flatShading:true});
    for(let i=0;i<18;i++){const seg=new THREE.Mesh(new THREE.SphereGeometry(Math.max(8,34-Math.abs(i-6)*1.8),10,7),rM);seg.scale.set(1.8,0.4,1.1);seg.position.x=(i-6)*18;ridge.add(seg);}
    ridge.traverse(o=>{o.userData.noFingerprint=true;});scene.add(ridge);
    H.notice('Wormsign!','- a ridge of sand running at a harvester, and it is not slowing down. The carryall is coming in to lift it clear; whatever is under the sand is coming for the vibration.',look(hx,hy,hz,900,320));
    const drop0=4,ty=hy+hs.H+26;let t=0,setX=0,setZ=0;
    H.run((now,dt)=>{t+=dt;
      // the worm: 2.6 km in 32 s, rising as it comes
      const u=clamp(t/32,0,1),wx=lerp(wx0,hx,u),wz=lerp(wz0,hz,u);
      ridge.position.set(wx,groundH(wx,wz)-6+10*Math.min(1,t/4),wz);ridge.rotation.y=-Math.atan2(hz-wz0,hx-wx0);ridge.visible=t<32;
      if(t<32&&R()<0.9)for(let k=0;k<3;k++)sand.emit(wx+(R()-0.5)*40,groundH(wx,wz)+4,wz+(R()-0.5)*40,(R()-0.5)*6,4+R()*8,(R()-0.5)*6,5+R()*4,30);
      // the carryall: in over the harvester by 16 s, grapples down by 22, lifting by 25, clear by 31
      let cx,cy,cz,drop=drop0,fill=0.3,thrust=0.7,lift=0;
      if(t<16){const e=ease(t/16);cx=lerp(from.x,hx,e);cz=lerp(from.z,hz,e);cy=lerp(from.y,ty+80,e);}
      else if(t<22){const e=ease((t-16)/6);cx=hx;cz=hz;cy=lerp(ty+80,ty+18,e);drop=lerp(4,24,e);thrust=0.9;}
      else if(t<31){const e=ease((t-22)/9);cx=hx;cz=hz;cy=lerp(ty+18,ty+260,e);drop=24;fill=Math.min(1,(t-22)/3);thrust=1;lift=cy-(ty+18);}
      else if(t<62){const e=ease((t-31)/31);if(!setX){const b=a0+Math.PI+(R()-0.5);setX=hx+Math.cos(b)*1400;setZ=hz+Math.sin(b)*1400;}
        cx=lerp(hx,setX,e);cz=lerp(hz,setZ,e);cy=lerp(ty+260,groundH(cx,cz)+hs.H+42,ease(clamp((t-48)/14,0,1)));drop=24;fill=1-0.6*clamp((t-52)/10,0,1);thrust=1;lift=1;}
      else if(t<70){cx=setX;cz=setZ;cy=groundH(cx,cz)+hs.H+42+(t-62)*6;drop=lerp(24,4,(t-62)/8);fill=0.4;thrust=0.8;}
      else{rig.x=setX-Math.cos(rig.rot)*((performance.now()/1000*0.5)%180);rig.z=setZ-Math.sin(rig.rot)*((performance.now()/1000*0.5)%180);rig.held=false;
        if(cay)cay.held=false;else scene.remove(ca);scene.remove(ridge);return false;}
      ca.position.set(cx,cy,cz);ca.rotation.set(0,-Math.atan2(hz-from.z,hx-from.x),0);ca.userData.update(now,{drop,fill,thrust});
      // the downwash on the sand while it is low over it
      if(cy-groundH(cx,cz)<140)for(let k=0;k<4;k++){const aa=R()*Math.PI*2;sand.emit(cx+Math.cos(aa)*20,groundH(cx,cz)+2,cz+Math.sin(aa)*20,Math.cos(aa)*18,2+R()*3,Math.sin(aa)*18,4+R()*3,24);}
      // the harvester: on the ground until the grapples take it, then hanging under the carryall
      if(t>=22&&t<70){const hgy=t<62?cy-drop-hs.H-6:groundH(cx,cz);rig.g.position.set(cx,Math.max(groundH(cx,cz),hgy),cz);rig.plume.visible=rig.smoke.visible=false;}
      else rig.plume.visible=rig.smoke.visible=true;
      // the worm: up through where the harvester was, as the harvester leaves it
      if(t>=30&&t<44){const k=t<34?ease((t-30)/4):t<38?1:1-ease((t-38)/6);maw.visible=true;maw.position.set(hx,hy-110+k*160,hz);maw.rotation.y=t*0.1;
        if(t<33)for(let n=0;n<6;n++){const aa=R()*Math.PI*2,rr=80+R()*40;sand.emit(hx+Math.cos(aa)*rr,hy+10+R()*40,hz+Math.sin(aa)*rr,Math.cos(aa)*(6+R()*14),10+R()*22,Math.sin(aa)*(6+R()*14),6+R()*5,40);}
        if(t>=30&&t-dt<30)H.notice('The worm','- up through the sand where the harvester was standing a few seconds ago. It will go down again as fast as it came up.',look(hx,hy,hz,520,140));}
      else maw.visible=false;
      if(t>=62&&t-dt<62)H.notice('Set down','- a kilometre and a half away. The harvester starts work again; the spice is worth it.',null);
    });}

  // ---- a Coriolis storm ----
  function coriolis(){
    const [dx,dz]=P.sites.desert,dir=Math.atan2(-dz,-dx),ux=Math.cos(dir),uz=Math.sin(dir),px=-uz,pz=ux;
    H.notice('A Coriolis storm','- a wall of dust off the deep desert, coming across the basin faster than a man can run. The Shield Wall takes the worst of it; the basin gets the rest.',()=>[ux*3500-px*800,groundH(0,0)+400,uz*3500-pz*800,-ux*2000,groundH(0,0)+250,-uz*2000]);
    const base={fogD:scene.fog.density},SC=new THREE.Color(0x9a6a3c);let t=0,flash=0;
    H.run((now,dt)=>{t+=dt;const T=80;if(t>T){return false;}
      // the front: from out in the desert, across the basin at 110 m/s
      const s=-7000+t*110;
      for(let k=0;k<60*dt*10;k++){const v=(R()-0.5)*16000,x=s*ux+v*px,z=s*uz+v*pz;storm.emit(x,groundH(x,z)+R()*120,z,ux*110+(R()-0.5)*20,20+R()*30,uz*110+(R()-0.5)*20,14+R()*8,240+R()*200);}
      // inside it: the light goes brown and short, and the static discharges
      const inside=clamp((t-45)/10,0,1)*(1-clamp((t-68)/10,0,1));
      scene.fog.density=base.fogD*(1+inside*90);scene.fog.color.lerp(SC,inside);renderer.setClearColor(scene.fog.color);
      if(api.sky&&api.sky.material.uniforms){api.sky.material.uniforms.hor.value.lerp(SC,inside);api.sky.material.uniforms.top.value.lerp(SC,inside*0.9);}
      sun.intensity*=1-0.85*inside;hemi.intensity*=1-0.5*inside;
      if(inside>0.3&&R()<0.012)flash=1;flash*=0.8;ambient.intensity+=flash*1.6;
    });}

  // ---- a spice blow ----
  const stainM=new THREE.MeshBasicMaterial({color:0x9a4a22,transparent:true,opacity:0.65,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-4,polygonOffsetUnits:-8});
  function blow(){
    const [dx,dz]=P.sites.desert,x=dx+(R()-0.5)*5000,z=dz+(R()-0.5)*5000,y=groundH(x,z);
    H.notice('A spice blow','- the pre-spice mass under the sand has gone off. Sand and melange thrown a few hundred metres into the air, and where it comes down, the richest ground on the planet. Every harvester on the planet will be there by tomorrow.',look(x,y,z,1500,380));
    let t=0;const st=new THREE.Mesh(new THREE.CircleGeometry(1,40).rotateX(-Math.PI/2),stainM);st.position.set(x,y+0.4,z);st.scale.setScalar(1);st.userData.noFingerprint=true;scene.add(st);
    H.run((now,dt)=>{t+=dt;
      if(t<9){const k=t<1?t:1-(t-1)/8;for(let n=0;n<Math.floor(60*k);n++){const aa=R()*Math.PI*2,sp=R()*14;const d=R()<0.5?spice:sand;
        d.emit(x+Math.cos(aa)*8,y,z+Math.sin(aa)*8,Math.cos(aa)*sp,40+R()*70,Math.sin(aa)*sp,9+R()*8,30+R()*30);}}
      st.scale.setScalar(Math.min(260,20+t*30));return t<14;});}

  // ---- a thopter patrol ----
  function patrol(){
    const pad=ctx.residencyPad||[-430,groundH(-430,-560)+60,-560],gap=[Math.cos(0.3)*7600-2200,0,Math.sin(0.3)*7600-3400];gap[1]=groundH(gap[0],gap[2])+160;
    const fl=[];for(let k=0;k<4;k++){const g=makeThopter(THREE,{scale:1});g.traverse(o=>{o.userData.noFingerprint=true;});scene.add(g);fl.push({g,off:[(k%2?-1:1)*(18+k*14),k*6,-k*22]});}
    H.notice('A patrol','- four ornithopters off the Residency\'s platform, out over the town to the gap in the Shield Wall and back, the way they go every day at this hour.',()=>[pad[0]+260,pad[1]+140,pad[2]+260,pad[0],pad[1]+40,pad[2]]);
    let t=0;const T=110;
    H.run((now,dt)=>{t+=dt;if(t>T){for(const f of fl)scene.remove(f.g);return false;}
      // lift off, out, round, back, down
      const u=t/T;let x,y,z,beat=1;
      const out=[lerp(pad[0],gap[0],0.5),pad[1]+260,lerp(pad[2],gap[2],0.5)];
      if(u<0.08){const e=ease(u/0.08);x=pad[0];z=pad[2];y=lerp(pad[1],pad[1]+60,e);beat=e;}
      else if(u<0.5){const e=ease((u-0.08)/0.42);x=lerp(pad[0],gap[0],e);z=lerp(pad[2],gap[2],e);y=lerp(pad[1]+60,gap[1],e)+Math.sin(e*Math.PI)*200;}
      else if(u<0.92){const e=ease((u-0.5)/0.42),a=e*Math.PI;x=lerp(gap[0],pad[0],e)+Math.sin(a)*900;z=lerp(gap[2],pad[2],e)-Math.sin(a)*600;y=lerp(gap[1],pad[1]+60,e)+Math.sin(a)*150;}
      else{const e=ease((u-0.92)/0.08);x=pad[0];z=pad[2];y=lerp(pad[1]+60,pad[1],e);beat=1-e;}
      const hd=u<0.5?Math.atan2(gap[2]-pad[2],gap[0]-pad[0]):Math.atan2(pad[2]-gap[2],pad[0]-gap[0]);
      for(const f of fl){const c=Math.cos(hd),s=Math.sin(hd),[a,b,cc]=f.off,sp=(u<0.08||u>0.92)?0.25:1;
        f.g.position.set(x+(c*cc-s*a)*sp,y+b*sp,z+(s*cc+c*a)*sp);f.g.rotation.set(0,-hd,Math.sin(now*0.001+a)*0.05);f.g.userData.update(now,beat);}
      if(u<0.08||u>0.92){for(let k=0;k<3;k++){const aa=R()*Math.PI*2;sand.emit(x+Math.cos(aa)*14,pad[1],z+Math.sin(aa)*14,Math.cos(aa)*14,1+R()*2,Math.sin(aa)*14,3,14);}}
    });}

  // ---- a Guild lighter ----
  function lighter(){
    const pad=P.pads[Math.floor(R()*P.pads.length)],[x,z]=pad,y=groundH(x,z);
    const g=new THREE.Group();const hull=new THREE.MeshPhongMaterial({color:0x6f6a62,specular:0x8a857c,shininess:30,flatShading:true}),dark=new THREE.MeshLambertMaterial({color:0x2e2b27,flatShading:true});
    g.add(new THREE.Mesh(new THREE.CylinderGeometry(70,90,260,16).translate(0,150,0),hull));
    g.add(new THREE.Mesh(new THREE.SphereGeometry(70,16,8,0,Math.PI*2,0,Math.PI/2).translate(0,280,0),hull));
    for(let k=0;k<8;k++){const a=k/8*Math.PI*2;const fin=new THREE.Mesh(new THREE.BoxGeometry(8,120,40).translate(0,60,0),dark);fin.position.set(Math.cos(a)*86,0,Math.sin(a)*86);fin.rotation.y=-a;g.add(fin);}
    for(let k=0;k<5;k++){const band=new THREE.Mesh(new THREE.CylinderGeometry(92-k*4,92-k*4,5,16),dark);band.position.y=40+k*50;g.add(band);}
    g.traverse(o=>{o.userData.noFingerprint=true;if(o.isMesh)o.castShadow=true;});scene.add(g);
    H.notice('A Guild lighter','- coming down on the landing field on its suspensors, from a Heighliner nobody will ever see. It will sit an hour of its own time, and go.',look(x,y,z,1600,300));
    let t=0;const T=90;
    H.run((now,dt)=>{t+=dt;let h;
      if(t<34)h=lerp(2600,0,ease(t/34));else if(t<60)h=0;else h=lerp(0,3000,Math.pow((t-60)/30,2));
      g.position.set(x,y+h,z);g.visible=t<T;
      if(h<400)for(let k=0;k<Math.floor(30*(1-h/400));k++){const aa=R()*Math.PI*2;sand.emit(x+Math.cos(aa)*110,y+2,z+Math.sin(aa)*110,Math.cos(aa)*(30+R()*25),2+R()*5,Math.sin(aa)*(30+R()*25),6+R()*4,50);}
      if(t>=T){scene.remove(g);return false;}});}

  H=createHappenings(api,{
    events:{wormsign:['Wormsign',wormsign],storm:['A Coriolis storm',coriolis],blow:['A spice blow',blow],patrol:['A thopter patrol',patrol],lighter:['A Guild lighter',lighter]},
    order:['patrol','wormsign','blow','lighter','storm','wormsign','patrol','blow'],
    colours:{bg:'rgba(28,20,12,.86)',fg:'#f0e2c8',edge:'#8a6a44',btn:'rgba(70,50,30,.9)',btnEdge:'#b08a5a'}});
  ctx.details=Object.assign(ctx.details||{},{events:5});
}
