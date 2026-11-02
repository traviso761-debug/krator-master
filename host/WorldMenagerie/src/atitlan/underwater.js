// ---------- Lake Atitlán: under the water ----------
// The lake's bed is real (terrain.lakeBed, from the surveys: tools/grid-xyz.py), and the camera may go down to it
// (Q lowers the target to the ground, which under the lake is the bed). Above the water nothing here runs. Below it
// (C.underwater):
//   the water   the air's fog becomes the water's: `visibility` metres to where it is whole (the lake's clarity), in
//               `colour`, dimmed by the light of the hour and by depth (a tenth of the light is left every `fade` m,
//               never below `floor`, or the deep bed would be black and the survey's shapes lost)
//   the light   the sun and the sky's light are dimmed the same, and the ambient light takes the water's colour
//   the surface the lake sheet is drawn from below as well, and the sky dome is hidden, so looking up is the
//               underside of the water, not the sky through it
//   the basin   (C.underwater.basin) a button that drains the lake: the water, its surf and what floats on it go,
//               (every mesh in the lake's material: the map's other water goes with it) and the bed is drawn coloured by depth (shallow turquoise to deep navy, shaded from the north-west)
//               with a contour every `minor` m and a white one every `major` m, so the shape of the whole basin can
//               be seen and flown over; `view` ([[lat, lon, h], [lat, lon, h]], camera and target) is where the camera
//               goes when it drains. The button fills it again; #drain in the address opens the page drained (and
//               leaves the camera where the address puts it, if it says)
// Leaving the water puts back the fog's density, the sheet's side and the sky. Nothing here is in the layout fingerprint.

export function underwater(api){
  const {THREE,C,scene,camera,renderer,animHooks,inWater,groundH,OSM,P}=api;const K=C.underwater;if(!K||!scene.fog)return;
  const WY=api.ctx.waterLevel||0.05,VIS=K.visibility||30,FADE=K.fade||60,FLOOR=K.floor==null?0.2:K.floor;
  let waterM=null;scene.traverse(m=>{if(!waterM&&m.isMesh&&(m.name==='water'||m.name==='river')&&m.material.isMeshPhongMaterial)waterM=m.material;});   // the lake sheet, or the tiles the map's water is drawn in (waves.js finds it the same way)
  const base=new THREE.Color(K.colour||'#1f5a6a'),c=new THREE.Color(),lum=x=>0.299*x.r+0.587*x.g+0.114*x.b;
  const dayL=lum(new THREE.Color((C.sky&&C.sky.day&&C.sky.day.hor)||'#d4e2ec'));
  let under=false,density=0,side=null;const amb0=new THREE.Color();
  function enter(){under=true;density=scene.fog.density;if(waterM){side=waterM.side;waterM.side=THREE.DoubleSide;waterM.needsUpdate=true;}if(api.sky)api.sky.visible=false;if(api.ambient){amb0.copy(api.ambient.color);api.ambient.color.copy(base).lerp(amb0,0.35);}}
  function leave(){under=false;scene.fog.density=density;if(waterM){waterM.side=side;waterM.needsUpdate=true;}if(api.sky)api.sky.visible=true;if(api.ambient)api.ambient.color.copy(amb0);renderer.setClearColor(scene.fog.color);}
  let drained=false;
  animHooks.push(()=>{const p=camera.position,now=!drained&&p.y<WY-0.2&&inWater(p.x,p.z);
    if(now!==under){now?enter():leave();}if(!under)return;
    // the engine set the fog to the sky's horizon this frame: its brightness is the light the water has to work with
    const light=Math.min(1.1,lum(scene.fog.color)/Math.max(0.05,dayL)),depth=WY-p.y;
    const k=Math.max(FLOOR,Math.pow(0.1,depth/FADE));c.copy(base).multiplyScalar(Math.max(0.03,light*k));
    // the engine set the lights' strength this frame too, so this scales it once
    if(api.sun)api.sun.intensity*=k*0.8;if(api.hemi)api.hemi.intensity*=k;
    scene.fog.color.copy(c);scene.fog.density=1.73/VIS;renderer.setClearColor(c);});
  // ---- the basin: the lake drained, its bed coloured by depth with contours ----
  const BK=K.basin;let basin=null;
  function buildBasin(){let x0=1e9,z0=1e9,x1=-1e9,z1=-1e9;
    for(const w of (OSM.water||[])){if(C.lake&&C.lake.name&&w.n!==C.lake.name)continue;for(let i=0;i+1<w.o.length;i+=2){const x=w.o[i]/10,z=w.o[i+1]/10;x0=Math.min(x0,x);x1=Math.max(x1,x);z0=Math.min(z0,z);z1=Math.max(z1,z);}}
    if(!(x1>x0))return null;const S=BK.step||(C.terrain&&C.terrain.step)||30,nx=Math.ceil((x1-x0)/S)+3,nz=Math.ceil((z1-z0)/S)+3;x0-=S;z0-=S;
    const pos=new Float32Array(nx*nz*3),dep=new Float32Array(nx*nz),idx=[];
    for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const k=j*nx+i,x=x0+i*S,z=z0+j*S,g=groundH(x,z),d=inWater(x,z)?WY-g:Math.min(0,WY-g);pos[k*3]=x;pos[k*3+1]=g+0.03;pos[k*3+2]=z;dep[k]=d;}
    // where it is steep the ground's triangles and these cross: lifted by half the fall to the steepest neighbour past
    // 2 m a cell, the ground stays under it (gentle ground is not lifted, so a low wall on it still shows: Samabaj's top)
    const lift=new Float32Array(nx*nz);for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const k=j*nx+i,y=pos[k*3+1];let f=0;
      for(const [di,dj] of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,-1],[1,-1],[-1,1]]){const ii=i+di,jj=j+dj;if(ii<0||jj<0||ii>=nx||jj>=nz)continue;f=Math.max(f,Math.abs(pos[(jj*nx+ii)*3+1]-y));}lift[k]=Math.max(0,f-2)*0.5;}
    for(let k=0;k<nx*nz;k++)pos[k*3+1]+=lift[k];
    for(let j=0;j+1<nz;j++)for(let i=0;i+1<nx;i++){const a=j*nx+i,b=a+1,c=a+nx,d=c+1;if(Math.max(dep[a],dep[b],dep[c],dep[d])>0.3)idx.push(a,c,b,b,c,d);}
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('depth',new THREE.BufferAttribute(dep,1));g.setIndex(idx);g.computeVertexNormals();
    let mx=0;for(const v of dep)mx=Math.max(mx,v);const col=h=>new THREE.Color(h);
    // on the ground, held over it by the polygon offset, so a low wall on the bed stands out of it (Samabaj's)
    const m=new THREE.ShaderMaterial({extensions:{derivatives:true},polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-2,
      uniforms:{uMax:{value:BK.deep||mx},uMajor:{value:BK.major||100},uMinor:{value:BK.minor||20},
        uC0:{value:col('#9ae8e0')},uC1:{value:col('#3ab0d8')},uC2:{value:col('#1a5ab0')},uC3:{value:col('#0a1a4a')}},
      vertexShader:'attribute float depth;varying float vD;varying vec3 vN;void main(){vD=depth;vN=normal;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
      fragmentShader:`uniform float uMax,uMajor,uMinor;uniform vec3 uC0,uC1,uC2,uC3;varying float vD;varying vec3 vN;
        void main(){if(vD<0.15)discard;float t=clamp(vD/uMax,0.0,1.0);
          vec3 c=t<0.15?mix(uC0,uC1,t/0.15):t<0.5?mix(uC1,uC2,(t-0.15)/0.35):mix(uC2,uC3,(t-0.5)/0.5);
          c*=0.5+0.65*max(0.0,dot(normalize(vN),normalize(vec3(-0.5,0.8,-0.35))));
          float fw=max(fwidth(vD),1e-4);
          float mn=1.0-smoothstep(0.0,fw*1.2,abs(fract(vD/uMinor+0.5)-0.5)*uMinor);
          float mj=1.0-smoothstep(0.0,fw*1.6,abs(fract(vD/uMajor+0.5)-0.5)*uMajor);
          c=mix(c,c*0.45,mn*0.6);c=mix(c,vec3(0.94,0.96,0.98),mj*0.75);gl_FragColor=vec4(c,1.0);}`});
    const mesh=new THREE.Mesh(g,m);mesh.name='basin';mesh.userData.noFingerprint=true;mesh.userData.noWire=true;mesh.frustumCulled=false;mesh.visible=false;scene.add(mesh);return mesh;}
  const HIDE=['water','surf','lake',...(BK&&BK.hide||[])],hidden=[];
  function drain(on,fly=true){if(!BK||on===drained)return;if(on&&!basin)basin=buildBasin();if(!basin){api.ctx.details=Object.assign(api.ctx.details||{},{basin:'no lake to drain'});return;}
    drained=on;if(under&&on)leave();basin.visible=on;api.ctx.details=Object.assign(api.ctx.details||{},{basin:{drained:on,tris:basin.geometry.index.count/3}});
    // off the camera's layer, not invisible: the engine and the lake set .visible every frame (levels of detail, distance)
    if(on){hidden.length=0;scene.traverse(o=>{if(HIDE.includes(o.name)||(waterM&&o.material===waterM))o.traverse(q=>{hidden.push([q,q.layers.mask]);q.layers.set(7);});});}else{for(const [q,m] of hidden)q.layers.mask=m;hidden.length=0;}
    if(btn){btn.textContent=on?'Fill the lake':'Drain the lake';btn.setAttribute('aria-pressed',String(on));}
    if(on&&fly&&BK.view&&api.setView){const [a,b]=BK.view,[px,pz]=P([a[0],a[1]]),[tx,tz]=P([b[0],b[1]]);api.setView(px,a[2],pz,tx,b[2],tz);}}
  let btn=null;
  if(BK)api.onUI&&api.onUI(({ui,mkBtn})=>{btn=mkBtn('Drain the lake',ui,()=>drain(!drained));btn.setAttribute('aria-pressed','false');
    btn.title='Take the water away and see the basin: the bed coloured by depth, with a contour every '+(BK.minor||20)+' m';
    const h=location.hash;if(/(^|[#&])drain(&|=|$)/.test(h)){const fly=!/(^|[#&])(v|view)=/.test(h);setTimeout(()=>drain(true,fly),60);}});   // read now: the camera rewrites the address once it is moving
  api.ctx.underwater={isUnder:()=>under,drain,drained:()=>drained};
}
