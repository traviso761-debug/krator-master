// ================================================================= THE BEACON - the signal line on the page: the Rim Post (the build's step P4)
// The Rim Post (kits/xanadu 80g xa_fort_post, kept, answering to the Beacon's fort) at the relay's place (src/42-bc-relay.js as
// BEACON_RELAY: the middle volcano's summit, 17 km north-north-east), on the far land as it is drawn: its base on the highest of
// its corners and centre (a ray down onto the far mesh), its footing past the lowest. Its fire basket's light shows while the
// lamp's signal slot is to it (BEACON_RELAY.answering at the page's clock, as the lamp's): a fire and a glow that keeps a few
// pixels at 17 km. The line on to the Eye Post (56 km east) is off the far land's square: not drawn. [web]: three.js.
const BC_RELAY=(function(){const P=BEACON_RELAY.posts.find(p=>p.id==='rimpost'),XP=XFORT.post(),XT=XP.tower,G=new THREE.Group();G.name='The Beacon - the Rim Post';scene.add(G);
 scene.updateMatrixWorld(true);const ray=new THREE.Raycaster(),down=new THREE.Vector3(0,-1,0);
 const drawn=(x,z)=>{ray.set(new THREE.Vector3(x,6000,z),down);ray.far=12000;const h=ray.intersectObject(BC_FARMESH,false)[0];return h?6000-h.distance:null;};   /* the far land as drawn */
 const [x,z]=P.at,pts=[[0,0],[-XP.w/2,-XP.d/2],[XP.w/2,-XP.d/2],[XP.w/2,XP.d/2],[-XP.w/2,XP.d/2]],gs=pts.map(p=>drawn(x+p[0],z+p[1]));
 const hi=Math.max(...gs),lo=Math.min(...gs),y=hi+.05,drop=hi-lo+.35;
 TSTAT.cur='xa_fort_post/0';const r0=REG.length,g=VERN.place(G,'xa_fort_post',x,z,0,{y,drop,v:0,fort:'beacon'});for(let i=r0;i<REG.length;i++)REG[i].type='xa_fort_post';TSTAT.cur=null;
 BC_PLACED.xa_fort_post=(BC_PLACED.xa_fort_post|0)+1;
 g.updateMatrixWorld(true);const L=g.localToWorld(new THREE.Vector3(XT.at[0],XT.h+.15+XP.basket.h+.6,XT.at[1]));   /* the basket's fire, over the tower */
 kbake(G);
 /* the light: the fire in the basket and its glow (a sprite of fixed size on the screen, so it reads at 17 km) */
 const cv=document.createElement('canvas');cv.width=cv.height=64;const cx=cv.getContext('2d'),gr=cx.createRadialGradient(32,32,0,32,32,32);
 gr.addColorStop(0,'rgba(255,236,190,1)');gr.addColorStop(.25,'rgba(255,170,80,.75)');gr.addColorStop(1,'rgba(255,120,40,0)');cx.fillStyle=gr;cx.fillRect(0,0,64,64);
 const glow=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(cv),transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,sizeAttenuation:false}));
 glow.scale.set(.018,.018,1);glow.position.copy(L);glow.userData.probeSkip=true;glow.userData.lodSkip=true;glow.name='the Rim Post\'s light';scene.add(glow);
 const fire=new THREE.Mesh(new THREE.SphereGeometry(.5,10,8),new THREE.MeshBasicMaterial({color:0xffb050}));fire.position.copy(L);fire.userData.probeSkip=true;scene.add(fire);
 function tick(){const t=bcClockS(),a=BEACON_RELAY.answering('rimpost',t,BC_ENV);glow.visible=fire.visible=a.lit;
  window._beaconRelay.lit=a.lit;window._beaconRelay.why=a.why;window._beaconRelay.shown=glow.visible;window._beaconRelay.t=Math.round(t);}
 window._beaconRelay={id:P.id,at:[x,Math.round(y*100)/100,z],drop:Math.round(drop*100)/100,ground:gs.map(v=>Math.round(v*100)/100),light:[L.x,L.y,L.z].map(v=>Math.round(v*100)/100),km:Math.round(P.km*100)/100,bearing:Math.round(P.bearing*10)/10};
 FRAME_HOOKS.push(tick);tick();return{G,g,glow,fire,drawn,tick};})();
