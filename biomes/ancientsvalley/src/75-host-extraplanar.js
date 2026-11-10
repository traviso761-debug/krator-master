// ================================================================= HOST - the extraplanars (kits/extraplanar: the hunters, the phenomena, the portals)
// [web] PLAN.md section 6 and the themes table of section 9: city3 Dorado, the drowned city, is the extraplanars' (portals in the drowned halls,
// phenomena over the water, the lake's steam as their weather), and this page is the lake's near shore, so a few have come through here.
// kits/extraplanar read as a bundle (39x: KratorExtraplanar, built by the session valley-extraplanar on 2026-11-09; the mechs machinery inside its
// own closure). THE HUNTERS, three, each on a round of one avenue block like the keepers (72): the Stilter where the lake's pull is strongest
// to the south (the lake), the Haloed over the drowned inlet to the north-west, the Crawler deep in the wild half; the kit's gait on the page's
// ground, the attack (the shared tell first, then the blow; the Haloed's gaze flown as the robots' beam) at the corners of the round. THE
// PHENOMENA as records on the kit's registry (core/tags through BIO.tagReg(), core/space) BEFORE they are drawn: a void drifting over the water
// of the drowned inlet (its `at` on the water surface, `h` its hover, the water under its whole drift), a humming solid in a plaza of the foul
// half, a presence in the park gone feral; their weather goes on the page's core/atmos after the binding (89x-host-xp-weather.js). THE PORTALS:
// three drowned-hall portals on the shore under the towers, their floor under the lake and their arch above it (the lake's line cuts the arch),
// each leading to city3; and a tear standing alone on the dead lobe. R rides with a hunter as with a keeper (AV_FOLLOW.more). Everything placed
// is a record first: the hunters' rounds through REGISTER, the phenomena and portals through the kit's registry on the page's core/tags (their
// probe volumes pushed to REG by hand, since REGISTER would file a second tags record for the same thing).
const AV_XP=(function(){const out={hunters:[],drawn:[],registry:null,t:0,hum:0,fx:[],views:{},spots:{},ok:false};if(typeof KratorExtraplanar==='undefined')return out;
 const KE=KratorExtraplanar,L=STAGE.lattice,A=STAGE.avenueLines(),T=STAGE.transit,LY=STAGE.lakeY,F=STAGE.F,R=STAGE.R,seed0=(STAGE.seed|0)+7500;
 const toXZ=(u,v)=>[u*L.c-v*L.s,u*L.s+v*L.c],toUV=(x,z)=>[x*L.c+z*L.s,-x*L.s+z*L.c];
 const dry=(x,z)=>terrainH(x,z)>LY+2,lakeK=(x,z)=>T?T.lakeK(x,z):0,wet=(x,z)=>STAGE.rawGround(x,z)<LY-1;
 const DOR=(STAGE.cities||[]).find(c=>c.n===3)||null;   /* Dorado, the drowned city (city3), by its place in this page's frame: what the portals face */
 /* the avenue block round about (cx, cz), as the keepers' (72): the two avenue lines about it each way, its four corners on dry ground off the scar;
    failing that, the next block out */
 const round=(cx,cz)=>{const uv=toUV(cx,cz);for(let tr=0;tr<6;tr++){const du=tr*L.pitch*3*(tr%2?1:-1),u=uv[0]+du,v=uv[1];
   let i=A.findIndex(a=>a>u);if(i<1)continue;const u0=A[i-1],u1=A[i];let j=A.findIndex(a=>a>v);if(j<1)continue;const v0=A[j-1],v1=A[j];
   const Q=[toXZ(u0,v0),toXZ(u1,v0),toXZ(u1,v1),toXZ(u0,v1)];if(Q.every(p=>Math.hypot(p[0],p[1])<R-200&&dry(p[0],p[1])&&F.scar(p[0],p[1])<.9))return Q;}return null;};
 /* a hunter's block: the block centres of the page scored by a want (dry, off the scar, 500 m from the hunters placed before), the best that has a round */
 const taken=[];const pickRound=want=>{const c=[];for(let x=-R+300;x<=R-300;x+=L.pitch)for(let z=-R+300;z<=R-300;z+=L.pitch){if(Math.hypot(x,z)>R-300||!dry(x,z)||F.scar(x,z)>.3)continue;
   if(taken.some(p=>Math.hypot(p[0]-x,p[1]-z)<500))continue;const w=want(x,z);if(w>0)c.push([w,x,z]);}
  c.sort((a,b)=>b[0]-a[0]);for(const q of c.slice(0,40)){const Q=round(q[1],q[2]);if(Q){taken.push([q[1],q[2]]);return Q;}}return null;};
 /* ---- the hunters */
 const mk=(key,route,seed)=>{if(!route){reportErr('extraplanar '+key+': no block for its round');return;}let g;try{g=KE.build(key,{seed});}catch(e){reportErr('extraplanar '+key+': '+(e.message||e));return;}
  const E=KE.get?KE.get(key):null,name=g.userData.name||(E&&E.name)||key,label='an extraplanar hunter on its round: '+name,sil=KE.silhouetteOf(key);
  g.traverse(m=>{if(m.isMesh){m.castShadow=m.receiveShadow=!!MP.shadow;m.userData.host=true;m.userData.inspectLabel=label;}});
  const i0=seed%4,p0=route[i0],p1=route[(i0+1)%4];g.position.set(p0[0],terrainH(p0[0],p0[1]),p0[1]);g.rotation.y=Math.atan2(p1[0]-p0[0],p1[1]-p0[1]);
  const cx0=(route[0][0]+route[2][0])/2,cz0=(route[0][1]+route[2][1])/2,gs=route.map(p=>terrainH(p[0],p[1])),g0=Math.min(...gs),g1=Math.max(...gs),h=g.userData.h==null?(E?E.h:8):g.userData.h;
  REGISTER({name:label,kind:'hunter',x:cx0,z:cz0,y:g0-3,r:Math.hypot(route[0][0]-cx0,route[0][1]-cz0)+30,h:g1-g0+h+8,tags:{kind:'hunter',origin:'extraplanar',mech:key,corners:route.length,silhouette:sil?sil.set:null,lake:Math.round(lakeK(cx0,cz0)*100)/100}});
  scene.add(g);KE.update(g,0,{ground:terrainH});KE.setState(g,'walk');
  out.hunters.push({g,key,name,route,i:(i0+1)%4,wait:0,seed,sil});};
 const south=(x,z)=>smooth(0,900,z),north=(x,z)=>smooth(0,-700,z);
 mk('xp_stilter',pickRound((x,z)=>lakeK(x,z)*south(x,z)),71);                                   /* the lake to the south: the pull strongest there */
 mk('xp_haloed',pickRound((x,z)=>lakeK(x,z)*north(x,z)),72);                                    /* the drowned inlet to the north-west, under the viaduct */
 mk('xp_crawler',pickRound((x,z)=>F.wild(x,z)*F.feral(x,z)*(1-lakeK(x,z))*(1-F.density(x,z)*.5)),73);   /* deep in the wild half, inland */
 /* ---- the phenomena and the portals: records on the kit's registry (the page's core/tags, a core/space grid) first */
 const REGY=out.registry=KE.registry.create({tags:BIO.tagReg(),cell:32,build:'ancientsvalley'});
 /* a water point for the void: water under its whole drift (12 bearings at the drift's reach), nearest the drowned inlet the viaduct crosses; failing
    that, the nearest water anywhere on the page */
 const waterAt=(ax,az,reach)=>{let best=null,bd=1e9;for(let x=-R+150;x<=R-150;x+=30)for(let z=-R+150;z<=R-150;z+=30){if(Math.hypot(x,z)>R-150||!wet(x,z))continue;let ok=true;
   for(let a=0;a<12&&ok;a++)if(!wet(x+Math.cos(a/12*TAU)*reach,z+Math.sin(a/12*TAU)*reach))ok=false;if(!ok)continue;const d=Math.hypot(x-ax,z-az);if(d<bd){bd=d;best=[x,z];}}return best;};
 const VDRIFT=24,VR=2.2,vw=waterAt(-1200,-1500,VDRIFT+VR+6)||waterAt(0,0,VDRIFT+VR+6);
 const recs=[];
 if(vw){recs.push(KE.phenomenon('void',{at:[vw[0],LY,vw[1]],seed:seed0+1,r:VR,h:3.5,drift:'wander',driftR:VDRIFT,speed:1.1,eyes:7,name:'a void with eyes, over the drowned inlet'}));out.spots.void=vw;}
 else reportErr('extraplanar: no water on the page for the void');
 /* the solid's plaza: open paved ground of the foul half's floor, off every plinth (built 0 at the point and 25 m about it), off the streets and the scar */
 {let best=null,bs=0;for(let x=-R+200;x<=R-200;x+=40)for(let z=-R+200;z<=R-200;z+=40){if(Math.hypot(x,z)>R-200||!dry(x,z)||F.scar(x,z)>.1||F.foul(x,z)<.6||F.zone(x,z)!=='floor')continue;
   if(STAGE.street(x,z)>.05||STAGE.built(x,z)>.02||STAGE.built(x+25,z)>.02||STAGE.built(x-25,z)>.02||STAGE.built(x,z+25)>.02||STAGE.built(x,z-25)>.02||Math.hypot(x-STAGE.near.x,z-STAGE.near.z)<STAGE.near.r)continue;
   const s=F.foul(x,z)*F.density(x,z)*(1-STAGE.forest(x,z))*(1-Math.hypot(x,z)/(2*R));if(s>bs){bs=s;best=[x,z];}}
  if(best){recs.push(KE.phenomenon('solid',{at:[best[0],terrainH(best[0],best[1]),best[1]],seed:seed0+2,drift:'orbit',driftR:8,form:'icosahedron',name:'a solid with its own weather, humming in a plaza of the foul half'}));out.spots.solid=best;}
  else reportErr('extraplanar: no plaza in the foul half for the solid');}
 /* the presence in the park gone feral: a third of the way from the view's mark toward its eye, on open ground */
 {const PV=STAGE.views()['A park gone feral'];if(PV){const tx=PV[3],tz=PV[5],ex=PV[0],ez=PV[2];let at=null;for(const k of [.3,.45,.6,.15]){const x=tx+(ex-tx)*k,z=tz+(ez-tz)*k;if(dry(x,z)&&STAGE.built(x,z)<.05&&STAGE.street(x,z)<.3){at=[x,z];break;}}
   if(at){recs.push(KE.phenomenon('presence',{at:[at[0],terrainH(at[0],at[1]),at[1]],seed:seed0+3,name:'a haloed presence, in the park gone feral'}));out.spots.presence=at;}}}
 /* the drowned-hall portals: the shore under the towers (a plinth within 150 m), the floor 2 to 3.5 m under the lake so the arch (6.5 m) stands out
    of the water, 400 m apart, the densest shore first; each faces Dorado, the drowned city it leads to (city3's own frame: its centre and two halls) */
 {const PD=STAGE.pads,pq=[],cands=[];for(let x=-R+150;x<=R-150;x+=30)for(let z=-R+150;z<=R-150;z+=30){if(Math.hypot(x,z)>R-150)continue;const y=STAGE.rawGround(x,z);if(y>LY-2||y<LY-3.5)continue;
   pq.length=0;PD.query(x,z,150,pq);let near=1e9;for(const P of pq){if(P.family==='engine')continue;near=Math.min(near,Math.hypot(x-P.x,z-P.z)-P.padR);}if(near>150)continue;
   cands.push([F.density(x,z)*(1-near/200)+.5*lakeK(x,z),x,z,y]);}
  cands.sort((a,b)=>b[0]-a[0]);const got=[],leads=[[0,0,0],[160,0,90],[-140,0,60]];
  for(const c of cands){if(got.length>=3)break;if(got.some(g=>Math.hypot(g[0]-c[1],g[1]-c[2])<400))continue;got.push([c[1],c[2]]);
   const ry=DOR?Math.atan2(DOR.x-c[1],DOR.z-c[2]):KRAND.unit(KRAND.hash(seed0,got.length,5,0))*TAU;
   recs.push(KE.portal('drowned',{at:[c[1],c[3],c[2]],ry,seed:seed0+10+got.length,state:got.length===2?'flicker':'open',leads:{station:'city3',at:leads[got.length-1]},name:'a drowned-hall portal to the drowned city'}));}
  out.spots.drowned=got;if(got.length<2)reportErr('extraplanar: '+got.length+' shore spots for the drowned portals');}
 /* the tear standing alone: on the dead lobe's melt glass, some 160 m before the dead lobe's eye along its look */
 {const DV=STAGE.views()['The dead lobe'];if(DV){const ex=DV[0],ez=DV[2],dx=DV[3]-ex,dz=DV[5]-ez,l=Math.max(1e-6,Math.hypot(dx,dz)),fx=dx/l,fz=dz/l;let best=null,bs=1e9;
   for(let x=ex-450;x<=ex+450;x+=20)for(let z=ez-450;z<=ez+450;z+=20){if(!dry(x,z)||F.scar(x,z)<.6||STAGE.built(x,z)>.02)continue;const px=x-ex,pz=z-ez,d=Math.hypot(px,pz);if(d<40||(px*fx+pz*fz)/d<.92)continue;const s=Math.abs(d-160);if(s<bs){bs=s;best=[x,z];}}
   if(best){recs.push(KE.portal('tear',{at:[best[0],terrainH(best[0],best[1]),best[1]],ry:Math.atan2(ex-best[0],ez-best[1]),seed:seed0+20,size:[1.2,6],state:'flicker',leads:null,name:'a tear standing alone on the dead lobe'}));out.spots.tear=best;}}}
 for(const r of recs)REGY.add(r);
 /* ---- drawn, after: the groups; a probe volume for each (REG by hand: the tags record is the registry's own) */
 for(const r of REGY.all()){const g=r.kind==='phenomenon'?KE.draw.phenomenon(r,REGY):KE.draw.portal(r,REGY);g.userData.host=true;
  g.traverse(m=>{if(m.isMesh){m.userData.host=true;m.userData.inspectLabel=r.name;}});scene.add(g);out.drawn.push(g);
  REG.push({name:r.name,key:r.key,kind:r.kind,x:r.at[0],y:r.at[1]-(r.kind==='portal'?1:0),z:r.at[2],r:r.r+(r.drift?r.drift.r:0)+1,h:r.h+(r.hover||0)+2,tags:r.tags});}
 /* the weather on core/atmos: bound by 89x-host-xp-weather.js, after ATMOS.bindHost (89a) and before ATMOS.finish */
 out.weather=function(){if(out.weathered)return;for(const g of out.drawn)if(g.userData.kind==='phenomenon')g.userData.weather=KE.draw.weather(g,ATMOS);out.weathered=true;};
 /* ---- the views the station adds for them (46z merges AV_XP.views): the eye on dry ground, off the plinths */
 /* a view's eye `back` m from the target (widening if it must), off the plinths and the streets; on dry ground, or (water true) on the water too, as
    the stage's own view from the water stands, its height over whichever is higher */
 const stand=(tx,tz,back,up,ty,water)=>{for(const m of [1,1.5,2.2,3.2,4.5])for(let k=0;k<24;k++){const a=k/24*TAU,x=tx+Math.sin(a)*back*m,z=tz+Math.cos(a)*back*m;
   if(Math.hypot(x,z)<R-60&&(water?(wet(x,z)||dry(x,z)):dry(x,z))&&STAGE.built(x,z)<.05&&STAGE.street(x,z)<.5)return[x,Math.max(terrainH(x,z),LY)+up,z,tx,ty,tz];}return null;};
 if(out.spots.drowned&&out.spots.drowned[0]){const p=out.spots.drowned[0],v=stand(p[0],p[1],24,2.4,LY+3,true);if(v)out.views['A drowned hall: the portal on the shore']=v;}
 if(out.spots.void){const p=out.spots.void,v=stand(p[0],p[1],45,5,LY+4,true);if(v)out.views['The void over the inlet']=v;}
 if(out.spots.solid){const p=out.spots.solid,v=stand(p[0],p[1],34,3,terrainH(p[0],p[1])+6);if(v)out.views['The solid in its plaza']=v;}
 /* 46z's views() merges these into the station's list (the stage's own are made after the build). A fourteen-view tour ran the renderer out of
    V8's 4 GB heap at first (2026-11-09: every view kept its transit cells and wreck looks); since the heap diet (74, 73) it holds 1.4 to 1.8 GB */
 STAGE.extraViews=out.views;
 /* ---- the frame: the rounds, the attacks at the corners, the gaze flown, the phenomena posed, the hum at the eye */
 let GAZE=null;const loose=ev=>{const o=(GAZE||(GAZE=KE.projectile('gaze'))).clone(),v=new THREE.Vector3().fromArray(ev.dir).multiplyScalar(ev.speed==null?60:ev.speed);o.position.fromArray(ev.pos);o.lookAt(o.position.clone().add(v));o.userData.host=true;scene.add(o);out.fx.push({o,v,t:0,life:1.2});};
 const clock={t:performance.now()};
 tick(function(){const now=performance.now(),dt=Math.min(.1,(now-clock.t)/1000);clock.t=now;if(dt<=0)return;out.t+=dt;
  for(const k of out.hunters){const g=k.g,Tg=k.route[k.i],dx=Tg[0]-g.position.x,dz=Tg[1]-g.position.z,d=Math.hypot(dx,dz);
   if(k.wait>0){k.wait-=dt;if(k.wait<=0)KE.setState(g,'walk');}
   else if(d<3){k.i=(k.i+1)%k.route.length;let len=0;try{const n=KE.attack(g);len=n==null?0:n;}catch(e){len=0;}k.wait=len+2+3*KRAND.unit(KRAND.hash(k.seed,k.i,9,0));if(!len)KE.setState(g,'idle');}   /* the tell, then the blow, at the corner */
   else{const want=Math.atan2(dx,dz);let a=want-g.rotation.y;a=Math.atan2(Math.sin(a),Math.cos(a));g.rotation.y+=Math.max(-1.1*dt,Math.min(1.1*dt,a));
    const sp=KE.speed(g)*Math.max(0,Math.cos(a));g.position.x+=Math.sin(g.rotation.y)*sp*dt;g.position.z+=Math.cos(g.rotation.y)*sp*dt;}
   g.position.y=terrainH(g.position.x,g.position.z);const ev=KE.update(g,dt,{ground:terrainH});if(ev)for(const e of ev)if(e.type==='fire')loose(e);}
  const eye=[camera.position.x,camera.position.z];for(const g of out.drawn)KE.draw.tick(g,out.t,eye);
  for(let i=out.fx.length-1;i>=0;i--){const f=out.fx[i];f.t+=dt;f.o.position.addScaledVector(f.v,dt);if(f.t>=f.life){scene.remove(f.o);out.fx.splice(i,1);}}
  out.hum=KE.humAt(eye[0],eye[1],out.t,REGY);});
 /* R rides with a hunter too (72's follow mode takes AV_FOLLOW.more after the keepers) */
 if(typeof AV_FOLLOW!=='undefined'&&AV_FOLLOW.more)for(const k of out.hunters)AV_FOLLOW.more.push(k);
 out.ok=true;return out;})();
