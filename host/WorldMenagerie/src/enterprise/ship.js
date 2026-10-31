// ---------- Galaxy class ----------
// Fan work. Star Trek belongs to Paramount; nothing from any film, series or game is used, and every shape and
// texture here is this project's own, built from published dimensions and from measurements of the silhouettes
// of published orthographic drawings (dims.js says which, and how).
//
//   dims.js   the numbers: the saucer's plan and profiles, the stations of the engineering hull and the
//             nacelles, the neck, the pylons, the deflector
//   hull.js   every part as a surface function of (u, v), and the meshes made from them
//   skin.js   the textures, painted texel by texel from those same functions: plates, panel lines, windows,
//             phaser strips, lettering
//   this      the ship put together: materials, the glows, the running lights, how it is lit
//
// Three things the drawings say that a ship built from the published figures alone gets wrong:
//
//   - The saucer is an ellipse, 384 m long and 464 across, not a circle, and aft it pulls in to a tail.
//   - The engineering hull starts under the middle of the saucer's after half, and the nose it starts with leans
//     back at thirty degrees, with the deflector set into it looking forward and down.
//   - The ship is 141 m tall, not the published 195: every drawing agrees on it, and so does the studio model.
//
// The light: physically based materials, a star with shadows (the nacelles shade the pylons, the saucer the
// neck), an environment map of the planet's glow and the dark, and ACES tone mapping for the hull only, so the
// backdrop keeps the colours it has on the other ship pages.
import {SAUCER,NACELLE,DEFLECTOR,BAYS} from './dims.js';
import {surface,saucerSurf,rimSurf,engSurf,neckSurf,nacSurf,pylonSurf,patch,nacPhi,nacHalf,rho,saucerTop,saucerBot,
        deflPlane,smooth,ND0,ND1,NACZ,NACY} from './hull.js';
import {saucerTextures,loftTex,hullPainter,hullMaterial,planUV} from './skin.js';

export function model(api){
  const {THREE,scene,renderer,animHooks,C}=api;
  const G=new THREE.Group();
  // the ship's own frame has the saucer's centre at the origin; the page turns round the middle of the ship
  G.position.set(129.25,34.5,0);
  const LEN=642.5;

  // ---------- the light ----------
  // The backdrop was made for the page's plain output: it is left out of the tone mapping.
  scene.traverse(o=>{if(o.material)for(const m of [].concat(o.material))m.toneMapped=false;});
  renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=0.95;
  renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  const dir=(a,e)=>new THREE.Vector3(Math.cos(a)*Math.cos(e),Math.sin(e),Math.sin(a)*Math.cos(e));
  const SL=C.space&&C.space.starLight||{},B0=(C.space&&C.space.bodies||[])[0];
  let key=null;scene.traverse(o=>{if(!key&&o.isDirectionalLight)key=o;});
  if(key){
    key.castShadow=true;key.shadow.mapSize.set(4096,4096);
    const sc=key.shadow.camera;sc.left=sc.bottom=-400;sc.right=sc.top=400;sc.near=9000;sc.far=11000;sc.updateProjectionMatrix();
    key.shadow.bias=-0.0004;key.shadow.normalBias=0.6;key.target.position.set(0,0,0);scene.add(key.target);
  }
  // The environment: what a polished hull would show of its surroundings. Nearly all of it is black; the world
  // below fills a quarter of the sky with blue, and the star is a point.
  const env=(()=>{
    const s=new THREE.Scene(),sun=dir(SL.az===undefined?-0.8:SL.az,SL.el===undefined?0.45:SL.el),pl=B0?dir(B0.az,B0.el):new THREE.Vector3(0,-1,0);
    const m=new THREE.ShaderMaterial({side:THREE.BackSide,depthWrite:false,uniforms:{uS:{value:sun},uP:{value:pl},uR:{value:B0?Math.sin((B0.deg||20)*Math.PI/360)*1.8:0.3}},
      vertexShader:'varying vec3 vD;void main(){vD=normalize(position);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
      fragmentShader:`varying vec3 vD;uniform vec3 uS,uP;uniform float uR;
        void main(){vec3 d=normalize(vD);float p=dot(d,normalize(uP)),pc=cos(uR);
          vec3 c=vec3(0.004,0.005,0.009)+vec3(0.006,0.007,0.012)*max(0.,d.y);
          c+=vec3(0.10,0.17,0.28)*smoothstep(pc-0.25,pc+0.02,p)+vec3(0.03,0.05,0.08)*smoothstep(-0.2,pc,p);
          c+=vec3(6.,5.6,5.)*smoothstep(0.9990,0.9998,dot(d,normalize(uS)))+vec3(0.08,0.07,0.06)*pow(max(0.,dot(d,normalize(uS))),24.);
          gl_FragColor=vec4(c,1.);}`});
    s.add(new THREE.Mesh(new THREE.SphereGeometry(100,48,24),m));
    const pm=new THREE.PMREMGenerator(renderer),t=pm.fromScene(s,0).texture;pm.dispose();m.dispose();
    return t;
  })();

  // ---------- the hull ----------
  const parts=[];
  const add=(geo,mat,info,o={})=>{const m=new THREE.Mesh(geo,mat);m.castShadow=o.cast!==false;m.receiveShadow=o.receive!==false;
    if(info)m.userData.info=info;G.add(m);parts.push(m);return m;};
  const T=saucerTextures(THREE,renderer);
  const INFO={
    saucer:{name:'The saucer',info:'The primary hull: an ellipse 384 m long and 464 across, sixteen decks at the middle and two at the rim. It can be separated from the rest of the ship, and land.'},
    bridge:{name:'The main bridge',info:'Deck 1, on top of the saucer, a little aft of its centre.'},
    eng:{name:'The engineering hull',info:'The stardrive section: the warp core, the deflector, the main shuttlebay at its stern. About 300 m long.'},
    neck:{name:'The neck',info:'The interconnecting dorsal, leaning forward as it rises to the saucer. Aft, its back slopes down from the impulse deck to the spine of the engineering hull.'},
    nacelle:{name:'A warp nacelle',info:'246 m long, wider than it is tall. The red Bussard collector is at its nose and the warp field grilles run along both its flat sides.'},
    pylon:{name:'A nacelle pylon',info:'Out level from the engineering hull and up round a bend into the nacelle: the U you see head on.'},
    defl:{name:'The main deflector',info:'Sweeps the ship\'s path clear of dust and gas. It is set into the engineering hull\'s sloping nose, looking forward and down.'},
    bussard:{name:'A Bussard collector',info:'A magnetic scoop for interstellar hydrogen, glowing red.'},
    impulse:{name:'The main impulse engine',info:'Across the trailing edge of the saucer, under the dorsal stem.'},
  };
  const saucerMat=t=>hullMaterial(THREE,t,env);
  {const g=surface(THREE,saucerSurf(true),384,128,false);planUV(g);add(g,saucerMat(T.top),INFO.saucer);}
  {const g=surface(THREE,saucerSurf(false),384,112,true);planUV(g);add(g,saucerMat(T.bot),INFO.saucer);}
  add(surface(THREE,rimSurf,1024,8,false),hullMaterial(THREE,T.rim,env,{bump:0.25}),INFO.saucer);
  // the stardrive: the engineering hull and the neck share one painter, so the decks run on across the join
  const DF=DEFLECTOR;
  const nearDefl=p=>Math.pow((p.y-DF.y)/DF.ry,2)+Math.pow(p.z/DF.rz,2)<2.2&&p.x>DF.x-12;
  const engLetters=(ctx,W,H)=>{
    // the registry on both sides of the raised after body, over the pylons
    for(const side of [1,-1]){
      const u=0.84,v=side>0?0.12:0.38;
      ctx.save();ctx.translate(u*W,v*H);if(side>0)ctx.rotate(Math.PI);ctx.scale(W/300*0.95,H/360*1.0);
      ctx.font='700 6px "Arial Narrow","Helvetica Neue",Arial,sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';
      ctx.fillStyle='rgb(38,42,50)';ctx.fillText('NCC-1701-D',0,0);ctx.restore();}
  };
  const engT=loftTex(THREE,renderer,engSurf,true,2048,1024,hullPainter({seed:51,skip:nearDefl}),engLetters);
  add(surface(THREE,engSurf,256,128,true),hullMaterial(THREE,engT,env),INFO.eng);
  const neckT=loftTex(THREE,renderer,neckSurf,false,1024,1024,hullPainter({seed:51}));
  add(surface(THREE,neckSurf,96,128,false),hullMaterial(THREE,neckT,env),INFO.neck);
  // the nacelles and pylons: one texture each, both sides
  const nacT=loftTex(THREE,renderer,nacSurf(1),true,2048,512,hullPainter({windows:false,seed:71,cw:12,ch:5}));
  const pyT=loftTex(THREE,renderer,pylonSurf(1),false,512,256,hullPainter({windows:false,seed:81,cw:10,ch:6}));
  const nacMat=hullMaterial(THREE,nacT,env,{metal:0.22}),pyMat=hullMaterial(THREE,pyT,env);
  for(const side of [1,-1]){
    add(surface(THREE,nacSurf(side),320,96,side>0),nacMat,INFO.nacelle);
    add(surface(THREE,pylonSurf(side),96,48,side<0),pyMat,INFO.pylon);
  }

  // ---------- the lights it makes ----------
  const glowTex=(()=>{const c=document.createElement('canvas');c.width=c.height=128;const x=c.getContext('2d'),g=x.createRadialGradient(64,64,0,64,64,64);
    g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(0.18,'rgba(255,255,255,0.55)');g.addColorStop(0.5,'rgba(255,255,255,0.12)');g.addColorStop(1,'rgba(255,255,255,0)');
    x.fillStyle=g;x.fillRect(0,0,128,128);return new THREE.CanvasTexture(c);})();
  const glows=[];
  const glow=(x,y,z,col,size,k)=>{const s=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex,color:col,blending:THREE.AdditiveBlending,depthWrite:false,transparent:true,toneMapped:false,opacity:k===undefined?1:k}));
    s.position.set(x,y,z);s.scale.setScalar(size);s.userData.noWire=true;G.add(s);glows.push(s);return s;};
  const basic=(o)=>new THREE.MeshBasicMaterial(Object.assign({toneMapped:false},o));
  const stripes=(w,h,draw)=>{const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;return t;};
  const lit=(geo,mat,info)=>{const m=new THREE.Mesh(geo,mat);if(info)m.userData.info=info;G.add(m);return m;};

  // The Bussard collectors: the nose of each nacelle and an oval back along both its sides, glowing, with a slow
  // swirl turning in them.
  const bussTex=stripes(256,64,(x,w,h)=>{const g=x.createLinearGradient(0,0,w,0);g.addColorStop(0,'#ff4a24');g.addColorStop(0.5,'#e02c14');g.addColorStop(1,'#a8180a');
    x.fillStyle=g;x.fillRect(0,0,w,h);x.globalCompositeOperation='lighter';
    for(let i=0;i<6;i++){x.strokeStyle='rgba(255,120,60,0.09)';x.lineWidth=5;x.beginPath();x.moveTo(0,i/6*h);x.bezierCurveTo(w*0.3,i/6*h+h*0.25,w*0.6,i/6*h-h*0.15,w,i/6*h+h*0.12);x.stroke();}});
  const bussMat=basic({map:bussTex});
  for(const side of [1,-1]){
    const f=nacSurf(side),d0=ND0,d1=425,span=ND1-ND0;
    // u along the nose from its tip to the oval's after end, which is further aft at the middle of the side
    const map=(u,v,m)=>{const a=v*Math.PI*2,yf=Math.sin(a),k=Math.sqrt(Math.max(0,1-Math.pow(yf/0.62,2)));
      const d=d0+u*(4+(d1-d0-4)*k);m[0]=dToU(d);m[1]=v;};
    const dToU=d=>{let lo=0,hi=1;for(let i=0;i<30;i++){const u=(lo+hi)/2,t=0.5-0.5*Math.cos(Math.PI*u),dd=ND0+span*(0.4*u+0.6*t);if(dd<d)lo=u;else hi=u;}return lo;};
    lit(surface(THREE,patch(f,side>0,map,0.25),48,96,side>0),bussMat,INFO.bussard);
    {const tip=new THREE.Mesh(new THREE.SphereGeometry(1.4,12,8),bussMat);tip.position.set(192-ND0-0.3,NACY,side*NACZ);tip.userData.noWire=true;G.add(tip);}
    glow(-206,NACY,side*NACZ,0xff5a2a,95,0.9);
    // the gold rings behind it
    for(const d of [429,433.5,438]){
      const ring=patch(f,side>0,(u,v,m)=>{m[0]=dToU(d-1.4+u*2.8);m[1]=v;},0.2);
      add(surface(THREE,ring,2,96,side>0),new THREE.MeshStandardMaterial({color:0xc89a48,metalness:0.85,roughness:0.32,envMap:env,envMapIntensity:1.4}),INFO.nacelle,{cast:false});
    }
    // The warp field grilles along both flat sides: blue, in slats, widening at their forward ends.
    for(const inboard of [false,true]){
      const GR=NACELLE.grille,fy0=GR.y0-NACY,fy1=GR.y1-NACY,dA=192-GR.x1,dB=192-GR.x0;
      const mapG=(u,v,m)=>{const d=dA+(dB-dA)*u,hh=nacHalf(d)[1],flare=1+0.7*(1-smooth(0,0.16,u)),mid=(fy0+fy1)/2,half=(fy1-fy0)/2*flare;
        m[0]=dToU(d);let ph=nacPhi((mid+(v*2-1)*half)/hh,inboard)/(Math.PI*2);if(ph<0)ph+=1;m[1]=ph;};
      lit(surface(THREE,patch(f,side>0,mapG,0.22),96,8,(side>0)!==inboard),grilleMat(),INFO.nacelle);
    }
  }
  function grilleMat(){
    if(grilleMat.m)return grilleMat.m;
    const t=stripes(16,64,(x,w,h)=>{x.fillStyle='#2a5cc8';x.fillRect(0,0,w,h);for(let i=0;i<8;i++){x.fillStyle='#8cc8ff';x.fillRect(0,i*8+2,w,4);}});
    t.repeat.set(1,1);return grilleMat.m=basic({map:t,side:THREE.DoubleSide});
  }

  // The deflector: a shallow elliptical dish in the nose's flat, copper rings round a glowing core.
  {
    const tl=DF.tilt,up=new THREE.Vector3(Math.sin(tl),Math.cos(tl),0),nrm=new THREE.Vector3(Math.cos(tl),-Math.sin(tl),0);
    const c0=new THREE.Vector3(deflPlane(DF.y),DF.y,0);
    const f=(u,v,p)=>{const a=v*Math.PI*2,r=u;const dd=-DF.depth*(1-r*r)+0.35;
      p.x=c0.x+up.x*DF.ry*r*Math.sin(a)+nrm.x*dd;p.y=c0.y+up.y*DF.ry*r*Math.sin(a)+nrm.y*dd;p.z=DF.rz*r*Math.cos(a);};
    const t=stripes(256,8,(x,w,h)=>{const g=x.createLinearGradient(0,0,w,0);
      g.addColorStop(0,'#fff1c8');g.addColorStop(0.12,'#ffc060');g.addColorStop(0.3,'#d0782a');g.addColorStop(0.55,'#8a4a1c');g.addColorStop(0.8,'#b06428');g.addColorStop(1,'#5a3418');
      x.fillStyle=g;x.fillRect(0,0,w,h);for(let i=1;i<9;i++){x.fillStyle='rgba(30,14,6,0.55)';x.fillRect(i/9*w,0,2,h);}});
    t.wrapS=THREE.ClampToEdgeWrapping;
    lit(surface(THREE,f,24,96,true),basic({map:t,side:THREE.DoubleSide}),INFO.defl);
    const gp=c0.clone().addScaledVector(nrm,4);glow(gp.x,gp.y,gp.z,0xffa040,70,0.75);
  }

  // The main impulse engine: two red-lit grilles across the saucer's trailing edge, either side of the stem.
  {
    const mat=basic({map:stripes(8,32,(x,w,h)=>{const g=x.createLinearGradient(0,0,0,h);g.addColorStop(0,'#ff8a50');g.addColorStop(0.5,'#ff2a0a');g.addColorStop(1,'#801006');x.fillStyle=g;x.fillRect(0,0,w,h);})});
    for(const [a0,a1] of [[Math.PI-0.30,Math.PI-0.06],[Math.PI+0.06,Math.PI+0.30]]){
      const f=patch(rimSurf,false,(u,v,m)=>{m[0]=(a0+(a1-a0)*u)/(Math.PI*2);m[1]=0.08+0.42*v;},0.3);
      lit(surface(THREE,f,24,4,false),mat,INFO.impulse);
      const a=(a0+a1)/2,r=rho(a);glow(r*Math.cos(a)-4,2,r*Math.sin(a),0xff3a14,40,0.7);
    }
  }
  // The main shuttlebay: the door in the engineering hull's transom, lit round its edges.
  {
    const b=BAYS.main,door=new THREE.Mesh(new THREE.PlaneGeometry(b.w*0.62,b.h*0.55),basic({color:0x2a3038}));
    door.position.set(b.x-1.2,b.y,0);door.rotation.y=-Math.PI/2;door.userData.noWire=true;G.add(door);
    glow(b.x-3,b.y,0,0xfff0d0,26,0.35);
  }

  // ---------- the running lights ----------
  // Red to port, green to starboard at the saucer's widest; white strobes at the nacelles' after ends and on the
  // saucer above and below. A navigation light at this scale is a lamp, not a beacon.
  const steady=[],strobes=[];
  const lamp=(x,y,z,col,size,arr)=>{const m=new THREE.Mesh(new THREE.SphereGeometry(0.8,8,6),basic({color:col}));m.position.set(x,y,z);m.userData.noWire=true;G.add(m);
    const g=glow(x,y,z,col,size,0.9);arr.push(m,g);};
  lamp(0,0.4,-(SAUCER.b+1.6),0xff2a1a,22,steady);lamp(0,0.4,SAUCER.b+1.6,0x2aff5a,22,steady);
  for(const side of [1,-1])lamp(192-ND1+3,NACY+12,side*NACZ,0xffffff,30,strobes);
  lamp(-40,saucerTop(-40,0)+0.8,0,0xffffff,24,strobes);lamp(10,saucerBot(10,0)-3,0,0xffffff,24,strobes);
  animHooks.push(now=>{const on=(now%1600)<110;for(const s of strobes)s.visible=on;
    bussTex.offset.y=(now*0.00006)%1;});

  scene.add(G);
  const pick=parts.slice();
  return {radius:LEN*0.5,group:G,pick,minD:60};
}
