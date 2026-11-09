// ================================================================= HOST - the keepers (feral robots at a thousand-year routine)
// [web] PLAN.md section 6 and section 12's station-0 vision: "a keeper robot at its routine". kits/mechs read as a bundle (39k: the Iziz
// culture, whose Hoist is an Ancient walking crane, the Fossor an Ancient excavating walker and the Catulus an Ancient survey drone): each
// keeper walks a round of one avenue block near a view's eye, stops at its corners as if to work, and goes on; a crane that loads nothing.
// Rusted like the towers (avRust). The rounds are lattice records (the block's four avenue corners); the walk is the kit's gait on the
// page's ground. The valley's own robot chassis (the stilt tripod, the shrouded walker) are a kit file to come (PLAN.md section 6).
const AV_KEEPERS=(function(){if(typeof KratorMechs==='undefined')return [];const L=STAGE.lattice,A=STAGE.avenueLines(),out=[];
 const toXZ=(u,v)=>[u*L.c-v*L.s,u*L.s+v*L.c],toUV=(x,z)=>[x*L.c+z*L.s,-x*L.s+z*L.c];
 /* the avenue block round (cx, cz): the two avenue lines about it each way, its four corners on dry ground; failing that, the next block out */
 const round=(cx,cz)=>{const uv=toUV(cx,cz);for(let tr=0;tr<6;tr++){const du=tr*L.pitch*3*(tr%2?1:-1),u=uv[0]+du,v=uv[1];
   let i=A.findIndex(a=>a>u);if(i<1)continue;const u0=A[i-1],u1=A[i];let j=A.findIndex(a=>a>v);if(j<1)continue;const v0=A[j-1],v1=A[j];
   const R=[toXZ(u0,v0),toXZ(u1,v0),toXZ(u1,v1),toXZ(u0,v1)];if(R.every(p=>Math.hypot(p[0],p[1])<STAGE.R-200&&terrainH(p[0],p[1])>STAGE.lakeY+2&&STAGE.F.scar(p[0],p[1])<.9))return R;}return null;};
 const mk=(key,cx,cz,seed)=>{const route=round(cx,cz);if(!route)return;let g;try{g=KratorMechs.build(key,{seed});}catch(e){reportErr('keeper '+key+': '+(e.message||e));return;}
  avRust(g,'keeper.broken');g.traverse(m=>{if(m.isMesh){m.castShadow=m.receiveShadow=!!MP.shadow;m.userData.host=true;m.userData.inspectLabel='a keeper at its round: '+g.userData.name;}});
  const i0=seed%4,p0=route[i0];g.position.set(p0[0],terrainH(p0[0],p0[1]),p0[1]);const p1=route[(i0+1)%4];g.rotation.y=Math.atan2(p1[0]-p0[0],p1[1]-p0[1]);scene.add(g);
  KratorMechs.update(g,0,{ground:terrainH});KratorMechs.setState(g,'walk');
  const cx0=(route[0][0]+route[2][0])/2,cz0=(route[0][1]+route[2][1])/2,gs=route.map(p=>terrainH(p[0],p[1])),g0=Math.min(...gs),g1=Math.max(...gs);REGISTER({name:'a keeper at its round: '+g.userData.name,kind:'keeper',x:cx0,z:cz0,y:g0-3,r:Math.hypot(route[0][0]-cx0,route[0][1]-cz0)+30,h:g1-g0+(g.userData.h==null?6:g.userData.h)+8,tags:{kind:'keeper',mech:key,corners:route.length}});
  out.push({g,key,route,i:(i0+1)%4,wait:0,seed});};
 /* the crane on the Overlook's line of sight (800 m out, where the second viaduct crosses it), the drone before the residential street's eye, a second
    crane on the shelf's south-east, the digger at the dead lobe's edge */
 const N=STAGE.near;mk('iz_hoist',-300,700,11);mk('iz_catulus',N.x-300,N.z+380,12);mk('iz_hoist',900,900,13);mk('iz_fossor',1250,-120,14);
 const clock={t:performance.now()};
 tick(function(){const now=performance.now(),dt=Math.min(.1,(now-clock.t)/1000);clock.t=now;if(dt<=0)return;
  for(const k of out){const g=k.g,T=k.route[k.i],dx=T[0]-g.position.x,dz=T[1]-g.position.z,d=Math.hypot(dx,dz);
   if(k.wait>0){k.wait-=dt;if(k.wait<=0)KratorMechs.setState(g,'walk');}
   else if(d<3){k.i=(k.i+1)%k.route.length;k.wait=5+4*KRAND.unit(KRAND.hash(k.seed,k.i,7,0));KratorMechs.setState(g,'idle');}
   else{const want=Math.atan2(dx,dz);let a=want-g.rotation.y;a=Math.atan2(Math.sin(a),Math.cos(a));g.rotation.y+=Math.max(-1.1*dt,Math.min(1.1*dt,a));
    const sp=KratorMechs.speed(g)*Math.max(0,Math.cos(a));g.position.x+=Math.sin(g.rotation.y)*sp*dt;g.position.z+=Math.cos(g.rotation.y)*sp*dt;}
   g.position.y=terrainH(g.position.x,g.position.z);KratorMechs.update(g,dt,{ground:terrainH});}
  /* the follow mode (the owner, 2026-11-09): the camera rides behind and above the chosen keeper, through the host's own view setter */
  const F=AV_FOLLOW;if(F.i!=null&&out[F.i]&&typeof KHOST!=='undefined'&&KHOST.setView){const g=out[F.i].g,h=g.userData.h==null?6:g.userData.h,back=Math.max(14,h*3.2),up=h*1.3+3;
   const tx=g.position.x,ty=g.position.y+h*.55,tz=g.position.z,wx=tx-Math.sin(g.rotation.y)*back,wy=g.position.y+up,wz=tz-Math.cos(g.rotation.y)*back;
   if(!F.cam)F.cam=[wx,wy,wz];const k=Math.min(1,dt*2.5);F.cam[0]+=(wx-F.cam[0])*k;F.cam[1]+=(wy-F.cam[1])*k;F.cam[2]+=(wz-F.cam[2])*k;
   const gy=terrainH(F.cam[0],F.cam[2])+2;if(F.cam[1]<gy)F.cam[1]=gy;KHOST.setView(F.cam[0],F.cam[1],F.cam[2],tx,ty,tz);}});
 return out;})();
/* R rides with the next keeper (the first on the first press, none after the last); Escape, a drag or the wheel lets go. AV_FOLLOW.follow(i|null) does the same */
const AV_FOLLOW={i:null,cam:null,follow(i){this.i=(i==null||!AV_KEEPERS[i])?null:i;this.cam=null;const el=document.getElementById('errs');if(this.i!=null&&AV_KEEPERS[this.i])console.log('riding with '+AV_KEEPERS[this.i].g.userData.name);return this.i;}};
window.addEventListener('keydown',e=>{if(e.target&&/INPUT|TEXTAREA|SELECT/.test(e.target.tagName))return;if(e.key==='r'||e.key==='R'){const n=AV_KEEPERS.length;if(!n)return;AV_FOLLOW.follow(AV_FOLLOW.i==null?0:(AV_FOLLOW.i+1<n?AV_FOLLOW.i+1:null));}else if(e.key==='Escape')AV_FOLLOW.follow(null);});
['pointerdown','wheel'].forEach(ev=>window.addEventListener(ev,e=>{if(AV_FOLLOW.i!=null&&e.target&&e.target.tagName==='CANVAS')AV_FOLLOW.follow(null);},{passive:true}));
