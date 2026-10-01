// ---------- constellations: five figures the people of Iziz named, fixed in the sky ----------
const CONST=(()=>{const D=(az,alt)=>{const a=az*Math.PI/180,e=alt*Math.PI/180;return [Math.cos(a)*Math.cos(e),Math.sin(e),Math.sin(a)*Math.cos(e)];};
  const F=DATA.city.constellations;
  const pos=[],mag=[],lines=[];F.forEach(f=>{const base=pos.length/3;f.s.forEach((q,i)=>{pos.push(...D(q[0],q[1]).map(v=>v*2400));mag.push(i===0?1.4:0.8+0.5*hash3(q[0],q[1],7));});
    f.l.forEach(([a,b])=>{lines.push(...pos.slice((base+a)*3,(base+a)*3+3),...pos.slice((base+b)*3,(base+b)*3+3));});});
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('izMag',new THREE.Float32BufferAttribute(mag,1));
  const sm=new THREE.ShaderMaterial({uniforms:{izNight:ENV.izNight,izRain:ENV.izRain,izFog:ENV.izFog,izTime:ENV.izTime},transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,
    vertexShader:`attribute float izMag;uniform float izNight;uniform float izRain;uniform float izFog;uniform float izTime;varying float vA;void main(){vec4 mv=modelViewMatrix*vec4(position,1.0);
      gl_PointSize=3.0+izMag*2.5;vA=izNight*(1.0-izRain)*(1.0-izFog)*(0.75+0.25*sin(izTime*2.3+position.x))*izMag;gl_Position=projectionMatrix*mv;}`,
    fragmentShader:`varying float vA;void main(){float r=length(gl_PointCoord-0.5);float a=(1.0-smoothstep(0.1,0.5,r))*vA;if(a<0.01)discard;gl_FragColor=vec4(vec3(0.9,0.93,1.0)*a,a);}`});
  const stars=new THREE.Points(g,sm);stars.frustumCulled=false;
  const lg=new THREE.BufferGeometry();lg.setAttribute('position',new THREE.Float32BufferAttribute(lines,3));
  const lm=new THREE.LineBasicMaterial({color:0x8fa0d0,transparent:true,opacity:0,depthWrite:false,fog:false});
  const ls=new THREE.LineSegments(lg,lm);ls.frustumCulled=false;
  const grp=new THREE.Group();grp.add(stars,ls);grp.userData.noWire=true;scene.add(grp);
  return {F,grp,lm};})();
animHooks.push(()=>{CONST.grp.position.copy(camera.position);CONST.lm.opacity=0.16*ENV.izNight.value*(1-ENV.izRain.value)*(1-ENV.izFog.value);});
ctx.skyCard=()=>{if(nightF(ctx.hour||0)<0.5)return null;const ph=p=>['new','a waxing crescent','at first quarter','waxing gibbous','full','waning gibbous','at last quarter','a waning crescent'][Math.round(p*8)%8];
  return {title:'The night sky',lines:[{t:'Constellations: '+CONST.F.map(f=>f.name).join(', ')+'.'},{t:'Nu, the green moon, is '+ph(MOONS.pa||0)+'; Nuis, the pale moon, is '+ph(MOONS.pb||0)+(MOONS.dir2&&MOONS.dir2.y>0?' and above the horizon.':', and below the horizon.'),sub:true}]};};
