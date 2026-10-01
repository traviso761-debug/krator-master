// ---------- under the mountain ----------
// Fan work from Tolkien.
//
// Inside, the sun is gone. When the camera is under the ground it is in the halls (or in the rock), and the light
// becomes what the halls have: in Moria almost nothing, a lantern of your own and the fire in the chasm; in
// Khazad-dum as it was, the lamps of crystal on every pillar. The sky's own lights are turned right down, the fog
// closes in black so the far end of a hall is lost in dark, and a light goes with the camera - the light of a
// staff held up. lerpSky sets the light every frame (01-scene), so this only adjusts what it has just set.
//
// "See inside" makes the mountain glass: the ground drawn faint, so the halls can be seen where they lie in it.
import { FLOOR } from './plan.js';

export function deep(api){
  const {THREE,ctx,scene,camera,sun,hemi,ambient,renderer,groundH,animHooks,onUI}=api;
  // ---- only draw what can be seen ----
  // The halls and the city are hundreds of thousands of triangles inside the rock, and the mountains are the
  // better part of half a million more over the top of them; drawing both every frame, from wherever the camera
  // is, is more than a laptop's graphics can keep up with at full resolution (it brought the browser down). So
  // everything under the mountain goes into one group, drawn only when the camera is under the ground, near a
  // gate, or the mountain is glass; and under the mountain, away from the gates, the mountains are not drawn.
  // Lights stay where they are: taking a light out of the scene recompiles every material that it lit.
  const UNDER=new THREE.Group();UNDER.name='under the mountain';
  {const mark=(ctx.moria&&ctx.moria.mark)||scene.children.length;
   for(const o of scene.children.slice(mark))if(!o.isLight){scene.remove(o);UNDER.add(o);}
   scene.add(UNDER);}
  // (at the Dimrill Gate the First Hall is seen through the open arch; the Doors of Durin show what is behind
  // them only when they stand open, in Khazad-dum)
  const nearGate=p=>Math.hypot(p.x-5600,p.z)<200||(ctx.war===false&&Math.hypot(p.x+6000,p.z-900)<200);
  const lantern=new THREE.PointLight(0xcfe0ff,0,190,1.3);scene.add(lantern);
  const baseDensity=scene.fog.density,black=new THREE.Color(0x040405),gloom=new THREE.Color(0x0e0d10);
  let u=0,last=performance.now();
  animHooks.push(now=>{const dt=Math.min(0.1,(now-last)/1000);last=now;
    const p=camera.position,below=p.y<groundH(p.x,p.z)-3,under=below&&!xray,gate=nearGate(p);
    UNDER.visible=below||xray||gate;
    const showTer=!below||xray||gate;if(showTer!==terOn){terOn=showTer;for(const m of ter)m.visible=showTer;}
    u+=((under?1:0)-u)*Math.min(1,dt*4);
    if(u<0.002){lantern.intensity=0;return;}
    const glory=ctx.war===false;
    sun.intensity*=1-u;hemi.intensity*=1-u*(glory?0.7:0.88);ambient.intensity*=1-u*(glory?0.5:0.75);
    scene.fog.color.lerp(glory?gloom:black,u);renderer.setClearColor(scene.fog.color);
    scene.fog.density=baseDensity+(glory?3.5e-4:2.4e-3)*u;
    lantern.position.set(p.x,p.y+2,p.z);lantern.intensity=u*(glory?0.6:1.6);});
  // the fog's density is ours only while we are under; above, give it back
  animHooks.push(()=>{if(u<0.002)scene.fog.density=baseDensity;});

  let xray=false,terOn=true;const ter=[];
  scene.traverse(o=>{if(o.isMesh&&(o.name==='terrain'||o.userData.wireCat==='ground'))ter.push(o);});
  const setX=on=>{xray=on;if(shaft)shaft.visible=on;if(stair)stair.visible=on;for(const m of ter){const mat=m.material;mat.transparent=on;mat.opacity=on?0.18:1;mat.depthWrite=!on;mat.needsUpdate=true;}};
  // ---- the Endless Stair ----
  // From the lowest dungeon to the peak, "ascending in unbroken spiral in many thousand steps", and out at the
  // top in Durin's Tower. A spiral in a shaft under the peak, from the Deeps to the tower; in the rock it is only seen with the mountain made glass, and then the
  // shaft of it shows as a thread of light.
  // (the stair itself is drawn only then too: it is thirteen thousand steps nobody can otherwise see)
  const T=ctx.durinsTower;let shaft=null,endless=0,stair=null;
  if(T){const r=3.4,perTurn=18,rise=0.22,y0=FLOOR-400,n=Math.floor((T.y-6-y0)/rise);endless=n;
    const im=new THREE.InstancedMesh(new THREE.BoxGeometry(2.6,0.24,1.1).translate(r*0.5+0.5,0,0),new THREE.MeshLambertMaterial({color:0x8a857c,flatShading:true}),n),D=new THREE.Object3D();
    for(let i=0;i<n;i++){D.position.set(T.x,y0+i*rise,T.z);D.rotation.set(0,i/perTurn*Math.PI*2,0);D.updateMatrix();im.setMatrixAt(i,D.matrix);}
    im.frustumCulled=false;im.visible=false;scene.add(im);stair=im;
    const core=new THREE.Mesh(new THREE.CylinderGeometry(0.8,0.8,T.y-y0,8).translate(0,(T.y-y0)/2,0),new THREE.MeshLambertMaterial({color:0x6a665e}));core.position.set(T.x,y0,T.z);scene.add(core);
    shaft=new THREE.Mesh(new THREE.CylinderGeometry(7,7,T.y-y0,14,1,true).translate(0,(T.y-y0)/2,0),new THREE.MeshBasicMaterial({color:0xffe2a0,transparent:true,opacity:0.22,depthWrite:false,side:THREE.DoubleSide}));
    shaft.position.set(T.x,y0,T.z);shaft.visible=false;scene.add(shaft);}
  // #xray opens with the mountain already glass
  onUI(({mkBtn,ui})=>{const b=mkBtn('See inside',ui,()=>{setX(!xray);b.setAttribute('aria-pressed',String(xray));});
    if(/(^|&)xray/.test(api.HASH0||''))setX(true);b.setAttribute('aria-pressed',String(xray));b.title='Make the mountain glass, to see the halls where they lie inside it';});
  ctx.deep={get under(){return u>0.5;},lantern,setX};
  ctx.details=Object.assign(ctx.details||{},{endlessSteps:endless});
}
