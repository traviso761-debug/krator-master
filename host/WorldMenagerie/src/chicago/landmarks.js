// Chicago's own landmarks: Cloud Gate, the Pritzker Pavilion, the Centennial Wheel and Wrigley Field.
// Nowhere else on the site has any of them, so they are not in the engine. This folder holds two things that
// should not be confused: the engine every city page runs on (build.js, assembled from stages/), and Chicago's
// own page (main.js and this file). Nothing in the engine imports this; main.js hands it over as ctx.models.

// Each of these is handed (L,x,z) exactly as one of the engine's own models is: L is the landmark's entry in the
// city file, x and z are where it stands. Everything they draw with comes out of the engine's api.
export function landmarks(api){
  const {THREE,P,AREAS,animHooks,scene,camera,renderer,nightF,hour,box,group,gh,roofAt,poi,areaNamed,steelM,chromeM,whiteM,redM,greenM}=api;
  return {
  bean(L,x,z){   // Cloud Gate: a mirrored bean on AT&T Plaza, raised on its two ends over the arch, aligned with its mapped outline
    const p=poi('Cloud Gate'),ang=p?p.ang:0;if(p){x=p.x;z=p.z;}
    const g=new THREE.SphereGeometry(1,64,36),v=g.attributes.position;
    for(let k=0;k<v.count;k++){let px=v.getX(k),py=v.getY(k),pz=v.getZ(k);if(py<0)py*=0.55;px*=1+0.12*Math.max(0,py);const arch=Math.max(0,1-Math.abs(px)/0.55);if(py<0)py+=arch*arch*0.62*(-py+0.2)*1.2;v.setXYZ(k,px,py,pz);}
    g.computeVertexNormals();
    const rt=new THREE.WebGLCubeRenderTarget(256,{format:THREE.RGBFormat,generateMipmaps:true,minFilter:THREE.LinearMipmapLinearFilter});const cube=new THREE.CubeCamera(1,3000,rt);cube.position.set(x,6,z);scene.add(cube);
    const beanM=new THREE.MeshPhongMaterial({color:0xdfe4ea,specular:0xffffff,shininess:220,envMap:rt.texture,combine:THREE.MixOperation,reflectivity:0.92});
    const b=new THREE.Mesh(g,beanM);b.position.set(x,gh(x,z)+L.h*0.5,z);b.scale.set(L.w/2,L.h*0.5,L.d/2);b.rotation.y=-ang;
    const grp=group(L,[b]);let lastR=-1e9;animHooks.push(now=>{if(now-lastR<2500||camera.position.distanceTo(b.position)>700)return;lastR=now;b.visible=false;cube.update(renderer,scene);b.visible=true;});return grp;},
  pavilion(L,x,z){   // Pritzker: steel ribbons over the stage house (the stage itself is the OSM building), the trellis over the Great Lawn east of it
    const parts=[],g0=gh(x,z),top=Math.max(roofAt(x,z),g0+18);
    for(let k=0;k<9;k++){const r=new THREE.Mesh(new THREE.TorusGeometry(10+k*1.6,0.35,3,18,Math.PI*(0.7+0.05*k)),chromeM);r.position.set(x-4-k*0.8,top+k*1.6,z+(k-4)*3.2);r.rotation.set(0.3*(k%3-1),Math.PI/2+0.25*(k-4),0.6+0.1*k);r.scale.set(1,1.4,3);parts.push(r);}
    const lawn=areaNamed(/Great Lawn/i,x,z)||areaNamed(/Pritzker/i,x,z);let lx0=x+20,lx1=x+130,lz0=z-55,lz1=z+55;if(lawn){lx0=lawn.bb.x0;lx1=lawn.bb.x1;lz0=lawn.bb.z0;lz1=lawn.bb.z1;}
    for(let k=0;k<=6;k++){const ax=lx0+(lx1-lx0)*k/6,arc=new THREE.Mesh(new THREE.TorusGeometry((lz1-lz0)/2,0.4,3,24,Math.PI),steelM);arc.position.set(ax,gh(ax,(lz0+lz1)/2),(lz0+lz1)/2);arc.rotation.y=Math.PI/2;arc.scale.set(1,0.42,1);parts.push(arc);}
    for(let k=-3;k<=3;k++)parts.push(box((lx0+lx1)/2,gh((lx0+lx1)/2,(lz0+lz1)/2)+(lz1-lz0)/2*0.42*Math.cos(k/3.4*Math.PI/2)-0.3,(lz0+lz1)/2+k*(lz1-lz0)/7.2,lx1-lx0,0.5,0.5,steelM));
    return group(L,parts);},
  wheel(L,x,z){const p=poi('Centennial Wheel');if(p){x=p.x;z=p.z;}const R=L.r||30,g0=gh(x,z),parts=[],wheel=new THREE.Group();
    wheel.add(new THREE.Mesh(new THREE.TorusGeometry(R,0.8,6,64),steelM));for(let k=0;k<21;k++){const a=k/21*Math.PI*2,sp=new THREE.Mesh(new THREE.BoxGeometry(0.4,R*2,0.4),steelM);sp.rotation.z=a;wheel.add(sp);
      const car=new THREE.Mesh(new THREE.BoxGeometry(2.4,2.4,2.4),new THREE.MeshLambertMaterial({color:0xe8f0ff}));car.position.set(Math.cos(a)*R,Math.sin(a)*R,0);wheel.add(car);}
    wheel.position.set(x,g0+R+4,z);parts.push(wheel);for(const s of [-1,1]){const leg=box(x+s*6,g0+2,z,1.6,R+4,1.6,steelM);leg.rotation.z=-s*0.18;parts.push(leg);}
    const g=group(L,parts);animHooks.push(now=>{wheel.rotation.z=now*0.00009;});return g;},
  // bridges drawn by OSM as road decks: find where the named road crosses the water, then add the structure there
  wrigley(L,x,z){   // the red marquee at Clark and Addison, the hand-turned scoreboard over the centre-field bleachers, light towers; ivy on the outfield wall
    const parts=[],field=AREAS.find(a=>a.kind==='pitch'&&Math.hypot((a.bb.x0+a.bb.x1)/2-x,(a.bb.z0+a.bb.z1)/2-z)<150);
    const [mx,mz]=P(L.marquee||[41.94736,-87.65641]),gm=gh(mx,mz);parts.push(box(mx,gm+6,mz,0.6,4,11,redM),box(mx,gm,mz-4,0.5,6,0.5,steelM),box(mx,gm,mz+4,0.5,6,0.5,steelM));
    const [sx,sz]=P(L.scoreboard||[41.94886,-87.65461]),gs=gh(sx,sz);parts.push(box(sx,gs+12,sz,24,11,3,greenM),box(sx,gs+23,sz,3,5,2,greenM));
    const [cxx,czz]=field?[(field.bb.x0+field.bb.x1)/2,(field.bb.z0+field.bb.z1)/2]:[x,z];
    for(let k=0;k<6;k++){const a=k/6*Math.PI*2+0.3,lx=cxx+Math.cos(a)*120,lz=czz+Math.sin(a)*105,gl=gh(lx,lz);parts.push(box(lx,gl,lz,1.2,40,1.2,steelM),box(lx,gl+40,lz,6,3,1,whiteM));}
    const g=group(L,parts);animHooks.push(()=>{const w=nightF(hour());redM.emissive.setRGB(0.3+0.5*w,0.02,0.02);});return g;},
  };
}
