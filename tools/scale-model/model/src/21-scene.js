  // ---- scene ----
  const stage=document.getElementById('stage');
  const renderer=new THREE.WebGLRenderer({antialias:true});
  renderer.setPixelRatio(Math.min(devicePixelRatio,2)); stage.appendChild(renderer.domElement);
  const scene=new THREE.Scene(); scene.background=new THREE.Color(0x0d1210);
  scene.fog=new THREE.Fog(0x0d1210, 1800, 4200);
  const camera=new THREE.PerspectiveCamera(42,1,1,20000);
  const sun=new THREE.DirectionalLight(0xfff1dc,1.25); sun.position.set(-900,700,-600); scene.add(sun);
  scene.add(new THREE.HemisphereLight(0xbfd0e8,0x2a2418,0.75));

  // world units: 1 unit = 1 full-res map pixel (2 km).
  const Wkm=DATA.fullW, Hkm=DATA.fullH;
  const MSTRIDE=(VW>1000)?2:1;
  const MW=Math.floor((VW-1)/MSTRIDE)+1, MH=Math.floor((VH-1)/MSTRIDE)+1;
  const geo=new THREE.PlaneGeometry(Wkm,Hkm,MW-1,MH-1);
  geo.rotateX(-Math.PI/2);
  const pos=geo.attributes.position; const base=new Float32Array(pos.count);
  for(let j=0;j<MH;j++) for(let i=0;i<MW;i++){
    const sx=Math.min(VW-1,i*MSTRIDE), sy=Math.min(VH-1,j*MSTRIDE);
    base[j*MW+i]=elev[sy*VW+sx]/1000;
  }
  const [tImg,rtImg,ctImg,stImg]=await Promise.all([
    loadImg('data:image/jpeg;base64,'+DATA.t),
    loadImg('data:image/jpeg;base64,'+DATA.rt),
    loadImg('data:image/jpeg;base64,'+DATA.ct),
    loadImg('data:image/jpeg;base64,'+DATA.st)
  ]);
  const makeTex=img=>{const t=new THREE.Texture(img);t.anisotropy=8;t.needsUpdate=true;return t;};
  const tex=makeTex(tImg), rtex=makeTex(rtImg), ctex=makeTex(ctImg), stex=makeTex(stImg);
