// ================================================================= HOST - the cosmetic distortions of space and time (PLAN-ANOMALIES.md section 5)
// [web] The owner, 2026-11-09: "more cosmetic distortions of space-time" (with the House, a later page). Three kinds, records first (AV_ANOM.records,
// each registered), drawn by ONE vertex warp on every material the scene draws (core/shader KWARP, opt-in, written for this valley's Bend) and a time
// scale; none changes collision, placement or the walker's ground:
//   THE BEND (round the Gyre, the engine that turns): as the eye comes within the zone the land rises round it like the inside of a bowl,
//     y += k * d^2 with d the horizontal distance from the eye, so the far city climbs the sky while the ground under the feet stays true
//   THE LENS (over the Strider): a small dark body hangs over the engine and bends what lies behind it outward round itself, like a mass
//     bending light: a point seen at angle theta from the body's direction is turned away from it by thetaE^2 / theta (eased out by 0.55 rad and
//     for what stands nearer than the body), so the city behind wraps round a ring; read from across the valley (to 4 km)
//   THE TIME POCKET (the park gone feral): inside it the world slows to a fifth, the rain, the clouds, the steam, the sway (core/atmos's clock
//     scale) and the keepers' rounds, eased over its edge
// KWARP installs once the city, the transit and the bakes are done (it recompiles every material once); W.sweep() every few seconds takes in what
// is built later (heroes, transit cells). The sky dome and the lens's own body are left unbent. Godot: the records port as data; the warp is the
// same expression in a global shader include, the time scale the Atmos autoload's (GODOT-PLAN.md).
const AV_ANOM=(function(){if(typeof KWARP==='undefined'||typeof KHOOK==='undefined')return null;
 const E=STAGE.engines||[],gy=E.find(e=>e.key==='gyre'),st=E.find(e=>e.key==='strider'),V=STAGE.views(),pk=V['A park gone feral'];
 const recs=[];
 if(gy)recs.push({id:'anom.bend.gyre',kind:'bend',x:gy.x,z:gy.z,r:(gy.r==null?150:gy.r)+650,k:.00009});
 if(st)recs.push({id:'anom.lens.strider',kind:'lens',x:st.x,y:st.y+(st.h==null?150:st.h)+140,z:st.z,te:.05,reach:4200,body:9});
 if(pk)recs.push({id:'anom.time.park',kind:'time',x:pk[3],z:pk[5],r:260,scale:.2});
 recs.forEach(a=>REGISTER({name:a.kind==='bend'?'the bend: the land rising round the Gyre':a.kind==='lens'?'the lens: a dark body bending the light over the Strider':'a time pocket in the park',
  kind:'anomaly',x:a.x,z:a.z,y:(a.y==null?terrainH(a.x,a.z):a.y)-(a.kind==='lens'?a.body+2:4),r:a.kind==='lens'?a.body+4:a.r,h:a.kind==='lens'?2*a.body+4:40,tags:{kind:'anomaly',anomaly:a.kind,id:a.id}}));
 /* the lens's body: dark, with a faint violet rim; left unbent (it is the lens) */
 const L=recs.find(a=>a.kind==='lens');let body=null;
 if(L){const g=new THREE.Group(),core=new THREE.Mesh(new THREE.SphereGeometry(L.body,24,16),new THREE.MeshBasicMaterial({color:0x050308}));
  const rim=new THREE.Mesh(new THREE.SphereGeometry(L.body*1.25,24,16),new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,
   vertexShader:'varying vec3 vN;varying vec3 vV;void main(){vec4 mv=modelViewMatrix*vec4(position,1.0);vN=normalize(normalMatrix*normal);vV=normalize(-mv.xyz);gl_Position=projectionMatrix*mv;}',
   fragmentShader:'varying vec3 vN;varying vec3 vV;void main(){float f=pow(1.0-abs(dot(vN,vV)),3.0);gl_FragColor=vec4(vec3(0.55,0.35,0.9)*f,f);}'}));
  g.add(core);g.add(rim);g.position.set(L.x,L.y,L.z);g.name='the lens';g.userData.inspectLabel='the lens: a dark body bending the light';core.userData.avNoWarp=rim.userData.avNoWarp=true;core.material.userData.avNoWarp=rim.material.userData.avNoWarp=true;scene.add(g);body=g;}
 const U={uAvBend:{value:0},uAvLens:{value:new THREE.Vector4(0,0,0,0)}};
 const GLSL=['uniform float uAvBend;uniform vec4 uAvLens;',
  'vec3 kWarp(vec3 p){vec3 e=kEye();vec2 d=p.xz-e.xz;p.y+=uAvBend*dot(d,d);',
  ' if(uAvLens.w>0.0){vec3 L=uAvLens.xyz-e;float dL=length(L);vec3 v=p-e;float dv=length(v);',
  '  if(dL>1.0&&dv>1e-3){vec3 l=L/dL,u=v/dv;float th=acos(clamp(dot(l,u),-1.0,1.0)),te=uAvLens.w;',
  '   float a=min(0.35,te*te/max(th,te*0.25))*(1.0-smoothstep(0.25,0.55,th))*smoothstep(0.6*dL,dL,dv);',
  '   vec3 ax=cross(l,u);float al=length(ax);if(a>1e-5&&al>1e-6){ax/=al;float ca=cos(a),sa=sin(a);p=e+(u*ca+cross(ax,u)*sa+ax*dot(ax,u)*(1.0-ca))*dv;}}}',
  ' return p;}'].join('\n');
 let W=null,lastSweep=0;const S={records:recs,body,U,warp:null,state:{bend:0,lens:0,time:1},installed:false};
 window.AV_TIME=1;
 const ss=(a,b,x)=>{const t=Math.min(1,Math.max(0,(x-a)/(b-a)));return t*t*(3-2*t);};
 tick(function(){const ready=(typeof AVC==='undefined'||AVC.ready)&&(typeof AVTR==='undefined'||AVTR.ready)&&!(window._texPending>0);
  if(!S.installed&&ready){try{W=KWARP.install({key:'avanom',glsl:GLSL,uniforms:U,scene,skip:(m)=>{if(m.isRawShaderMaterial)return 'a raw shader';if(m.side===1&&m.depthWrite===false)return 'the sky dome';if(m.userData&&m.userData.avNoWarp)return 'the lens body';}});W.sweep();S.warp=W;}catch(err){reportErr('anomaly warp: '+(err.message||err));}S.installed=true;lastSweep=performance.now();}
  if(W&&performance.now()-lastSweep>3000){lastSweep=performance.now();try{W.sweep();}catch(err){}}
  const e=camera.position;let bend=0,lens=0,time=1;
  for(const a of recs){const d=Math.hypot(e.x-a.x,e.z-a.z);
   if(a.kind==='bend'){const w=ss(a.r*1.6,a.r,d);bend=Math.max(bend,a.k*w);}
   else if(a.kind==='lens'){const w=ss(a.reach,a.reach*.75,Math.hypot(d,e.y-a.y));if(w>lens){lens=w;U.uAvLens.value.set(a.x,a.y,a.z,a.te*w);}}
   else if(a.kind==='time'){const w=ss(a.r*1.4,a.r*.7,d);time=Math.min(time,1+(a.scale-1)*w);}}
  U.uAvBend.value=bend;if(lens<=0)U.uAvLens.value.w=0;S.state={bend,lens,time};
  if(ATMOS.clock)ATMOS.clock.scale=time;window.AV_TIME=time;});
 return S;})();
