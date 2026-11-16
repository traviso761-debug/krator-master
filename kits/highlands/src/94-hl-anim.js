// ---------------------------------------------------------------- animation: orreries turn, clocks keep time (round 5)
// Runs after the scene is built. HLANIM (77b) lists groups that turn at w rad/s about their local z (or y);
// HLCLOCKS (88) lists every clock face in world space.
const HLHANDS=(function(){const n=HLCLOCKS.length;if(!n)return null;const geo=new THREE.BoxGeometry(1,1,1).translate(0,.5,0),mat=new THREE.MeshStandardMaterial({color:0x1c1a1c,roughness:.5,metalness:.3});
 const hr=new THREE.InstancedMesh(geo,mat,n),mn=new THREE.InstancedMesh(geo,mat,n);hr.frustumCulled=mn.frustumCulled=false;hr.userData.probeSkip=mn.userData.probeSkip=true;scene.add(hr);scene.add(mn);
 return{hr,mn};})();
function hlHour(){if(typeof window.HL_HOUR==='number')return((window.HL_HOUR%24)+24)%24;const d=new Date();return d.getHours()+d.getMinutes()/60+d.getSeconds()/3600;}
const _hlM=new THREE.Matrix4(),_hlQ=new THREE.Quaternion(),_hlZ=new THREE.Vector3(0,0,1),_hlP=new THREE.Vector3(),_hlS=new THREE.Vector3();
function hlSetHands(){if(!HLHANDS)return;const h=hlHour(),am=(h%1)*TAU,ah=(h%12)/12*TAU;
 HLCLOCKS.forEach((c,i)=>{const n=_hlZ.clone().applyQuaternion(c.q);
  for(const [im,a,len,wd,off] of[[HLHANDS.hr,ah,.55,.075,.03],[HLHANDS.mn,am,.82,.045,.05]]){_hlQ.copy(c.q).multiply(new THREE.Quaternion().setFromAxisAngle(_hlZ,-a));
   _hlP.copy(c.p).addScaledVector(n,off*c.r+.02);_hlS.set(wd*c.r,len*c.r,.03*c.r+.01);_hlM.compose(_hlP,_hlQ,_hlS);im.setMatrixAt(i,_hlM);}});
 HLHANDS.hr.instanceMatrix.needsUpdate=HLHANDS.mn.instanceMatrix.needsUpdate=true;}
hlSetHands();let _hlClockT=0;
FRAME_HOOKS.push((dt)=>{for(const a of HLANIM){if(a.axis==='y')a.o.rotation.y+=a.w*dt;else a.o.rotation.z+=a.w*dt;}
 _hlClockT+=dt;if(_hlClockT>1){_hlClockT=0;hlSetHands();}});
window._clocks=HLCLOCKS.length;window._orreryParts=HLANIM.length;
// LEVEL OF DETAIL (core/lod): the orreries and clock hands above turn, so 97-lod-auto.js leaves them out
window.LOD_OPTIONS=Object.assign(window.LOD_OPTIONS||{},{skipUnder:()=>HLANIM.map(a=>a.o).concat(HLHANDS?[HLHANDS.hr,HLHANDS.mn]:[])});
