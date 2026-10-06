// ---------- the small things that make the town look lived in ----------
// Fan work; Steven Universe belongs to Rebecca Sugar and Cartoon Network, and every shape here is this project's own.
//
// The engine draws each building as a painted box with a roof. This dresses them: on every house a front door
// facing its street, framed windows on each floor (some lit after dark), a porch on some and a chimney on others,
// a picket fence along the front with a gap and a path to the door, and a mailbox; on every shop a glass front,
// a striped awning, a sign board, and on the flat roofs air-conditioning units. Along Main Street and Boardwalk
// Street: benches, bins and fire hydrants. At the back of the ocean beach: tufts of dune grass. And the sea, a
// clearer blue than the engine's.
//
// It is all instanced - one mesh per kind of thing, with a colour per copy where it varies - so the whole town's
// worth of doors and windows is about a dozen draw calls. The plan (tools/make-beachcity.py) says where each
// building is, how big, and which way its front faces.
import { mkRng } from '../core/rng.js';

export function details(api){
  const {THREE,ctx,scene,animHooks,groundH}=api;
  const PL=ctx.plan;if(!PL||!PL.buildings)return;
  const R=mkRng(2014);
  const nightF=()=>api.nightF&&api.hour?api.nightF(api.hour()):0;

  // ---- a kit of instanced parts: add(kind, matrix, colour) as we go, build them all at the end ----
  const KIT={},m4=new THREE.Matrix4(),q=new THREE.Quaternion(),sc=new THREE.Vector3(),ps=new THREE.Vector3(),UPV=new THREE.Vector3(0,1,0);
  function kind(name,geo,mat){KIT[name]={geo,mat,list:[]};}
  // put a part: centre (x,y,z), turned by yaw about y, scaled (sx,sy,sz) from a unit shape, coloured c (or the material's)
  function put(name,x,y,z,yaw,sx,sy,sz,c){KIT[name].list.push([x,y,z,yaw,sx,sy,sz,c]);}
  const box=new THREE.BoxGeometry(1,1,1),cyl=new THREE.CylinderGeometry(0.5,0.5,1,8);
  const L=(c,o)=>new THREE.MeshLambertMaterial(Object.assign({color:c},o||{}));
  kind('door',box,L(0xffffff));
  kind('frame',box,L(0xf6f2ea));
  kind('glass',box,L(0x2e3c48,{emissive:0x000000}));
  const litM=L(0x2e3c48,{emissive:0xffcc78,emissiveIntensity:0});kind('lit',box,litM);
  kind('front',box,L(0x3a4a58,{emissive:0xffe0a8,emissiveIntensity:0}));
  kind('awning',box,L(0xffffff));
  kind('board',box,L(0xffffff));
  kind('trim',box,L(0xf6f2ea));
  kind('porch',box,L(0xffffff));
  kind('chimney',box,L(0x9a5a48));
  kind('unit',box,L(0xb8bcc0));
  kind('fence',box,L(0xf6f4ee));
  kind('path',box,L(0xcfc8b8));
  kind('mail',box,L(0xffffff));
  kind('post',cyl,L(0x5a4a3a));
  kind('bench',box,L(0x7a5a3a));
  kind('bin',cyl,L(0x3a5a4a));
  kind('hydrant',cyl,L(0xd83a3a));
  kind('grass',new THREE.ConeGeometry(0.5,1,5).translate(0,0.5,0),L(0xb8b070,{flatShading:true}));
  const DOORS=[0xc0392b,0x2a6aa8,0x2e7a4a,0x7a4a2a,0xf2c84a,0x8a3a7a,0xffffff],AWN=[0xe8504a,0x48a8e0,0x2e9a6a,0xf6a03a,0xd85a9a,0x6a5ad0],
        BOARD=[0x2a4a6a,0x8a2a2a,0x2a6a4a,0xf6e8c8,0x4a3a2a],PORCH=[0xf6f2ea,0xe8dcc8,0xd8e8e8];
  const pick=a=>a[Math.floor(R()*a.length)];

  // ---- the buildings ----
  for(const [x,z,w,d,rot,h,shop,fx,fz,flatRoof] of PL.buildings){
    const lx=[Math.cos(rot),Math.sin(rot)],lz=[-Math.sin(rot),Math.cos(rot)];   // the footprint's own axes
    const alongX=Math.abs(fx*lx[0]+fz*lx[1])>0.7;                              // is the front one of the x faces?
    const half=alongX?w/2:d/2,width=alongX?d:w;
    const n=alongX?(fx*lx[0]+fz*lx[1]>0?lx:[-lx[0],-lx[1]]):(fx*lz[0]+fz*lz[1]>0?lz:[-lz[0],-lz[1]]);   // the front's outward normal
    const t=[-n[1],n[0]];                                                       // along the front
    const yaw=Math.atan2(n[0],n[1]);                                            // a part facing +z, turned to face n
    const g0=Math.min(groundH(x+lx[0]*w/2+lz[0]*d/2,z+lx[1]*w/2+lz[1]*d/2),groundH(x-lx[0]*w/2-lz[0]*d/2,z-lx[1]*w/2-lz[1]*d/2),groundH(x,z));
    const F=(u,off)=>[x+n[0]*(half+off)+t[0]*u,z+n[1]*(half+off)+t[1]*u];       // a point on the front: u along it, off out from it
    const floors=Math.max(1,Math.round(h/3.1));
    const doorU=shop?0:(R()<0.5?-1:1)*width*0.22;
    if(shop){
      // the shop front: glass across most of the ground floor, the door in it, an awning, a sign board
      let [px,pz]=F(0,0.08);put('front',px,g0+1.35,pz,yaw,width*0.78,2.3,0.12);
      [px,pz]=F(doorU,0.14);put('door',px,g0+1.1,pz,yaw,1.3,2.2,0.08,0x2a3a44);
      [px,pz]=F(0,0.7);put('awning',px,g0+2.75,pz,yaw,width*0.86,0.14,1.4,pick(AWN));
      [px,pz]=F(0,0.12);put('board',px,g0+3.45,pz,yaw,width*0.6,0.8,0.14,pick(BOARD));
      for(let f=1;f<floors;f++)for(let u=-width/2+2.2;u<=width/2-2.2;u+=2.6){[px,pz]=F(u,0.05);const y=g0+f*3.1+1.6;
        put('frame',px,y,pz,yaw,1.4,1.6,0.1);[px,pz]=F(u,0.1);put(R()<0.35?'lit':'glass',px,y,pz,yaw,1.1,1.3,0.06);}
      if(flatRoof)for(let k=0;k<1+Math.floor(R()*3);k++)put('unit',x+(R()-0.5)*w*0.5,g0+h+0.5,z+(R()-0.5)*d*0.5,rot,1.6,1,1.2);
    }else{
      // the door, a step, and the windows on each floor of the front, avoiding the door
      let [px,pz]=F(doorU,0.06);put('door',px,g0+1.05,pz,yaw,1.0,2.1,0.1,pick(DOORS));
      [px,pz]=F(doorU,0.5);put('path',px,g0+0.1,pz,yaw,1.6,0.2,1.0);
      for(let f=0;f<floors;f++)for(const u of width>9?[-width*0.32,0,width*0.32]:[-width*0.28,width*0.28]){
        if(f===0&&Math.abs(u-doorU)<1.6)continue;[px,pz]=F(u,0.05);const y=g0+f*3.1+1.7;
        put('frame',px,y,pz,yaw,1.3,1.5,0.1);[px,pz]=F(u,0.1);put(R()<0.3?'lit':'glass',px,y,pz,yaw,1.0,1.2,0.06);}
      // a window on each side wall, each floor
      for(const s of [-1,1])for(let f=0;f<floors;f++){const sx=x+t[0]*s*(width/2+0.05),sz=z+t[1]*s*(width/2+0.05),y=g0+f*3.1+1.7,sy=Math.atan2(t[0]*s,t[1]*s);
        put('frame',sx,y,sz,sy,1.2,1.4,0.1);put(R()<0.3?'lit':'glass',x+t[0]*s*(width/2+0.1),y,z+t[1]*s*(width/2+0.1),sy,0.9,1.1,0.06);}
      // a porch on some: a roof on two posts over the door
      if(R()<0.45){const pc=pick(PORCH);[px,pz]=F(doorU,1.4);put('porch',px,g0+2.75,pz,yaw,3.4,0.18,2.6,pc);
        for(const s of [-1,1]){const [ax,az]=F(doorU+s*1.5,2.5);put('trim',ax,g0+1.35,az,yaw,0.18,2.7,0.18);}
        [px,pz]=F(doorU,1.4);put('porch',px,g0+0.15,pz,yaw,3.4,0.3,2.6,pc);}
      // a chimney on some, up through the roof at one end
      if(R()<0.4){const e=(R()<0.5?-1:1)*width*0.3;put('chimney',x+t[0]*e-n[0]*half*0.3,g0+h+1.6,z+t[1]*e-n[1]*half*0.3,yaw,0.9,3.4,0.9);}
      // the front garden: a picket fence across it with a gap for the path, and the mailbox by the gap
      if(!flatRoof&&R()<0.75){const off=4.5,fw=width+3;
        for(const s of [-1,1]){const segW=fw/2-1.2,u=doorU+s*(1.2+segW/2);if(Math.abs(u)>fw/2+2)continue;[px,pz]=F(u,off);put('fence',px,g0+0.45,pz,yaw,segW,0.9,0.08);}
        [px,pz]=F(doorU,off/2+0.6);put('path',px,g0+0.08,pz,yaw,1.2,0.16,off-1.2);
        const [mx,mz]=F(doorU+1.8,off+0.6);put('post',mx,g0+0.55,mz,0,0.12,1.1,0.12);put('mail',mx,g0+1.2,mz,yaw,0.35,0.35,0.55,pick([0x3a5aa8,0xf6f4ee,0x2a2a2a,0xc0392b]));}
    }
  }

  // ---- street furniture along Main Street and Boardwalk Street ----
  for(const r of (api.ROADS||[]))if(/^(Main|Boardwalk) Street$/.test(r.name)){let run=12;
    for(let i=0;i+1<r.pts.length;i++){const [ax,az]=r.pts[i],[bx,bz]=r.pts[i+1],Lg=Math.hypot(bx-ax,bz-az);if(!Lg)continue;const ux=(bx-ax)/Lg,uz=(bz-az)/Lg;
      for(let s=run;s<Lg;s+=26){const k=Math.floor(R()*3);for(const side of [-1,1]){const off=r.w/2+1.6,px=ax+ux*s-uz*off*side,pz=az+uz*s+ux*off*side,y=groundH(px,pz),yw=Math.atan2(-uz*side,ux*side);
          if(k===0){put('bench',px,y+0.45,pz,yw+Math.PI/2,1.8,0.12,0.55,null);put('bench',px-uz*side*0.25,y+0.8,pz+ux*side*0.25,yw+Math.PI/2,1.8,0.5,0.08,null);}
          else if(k===1)put('bin',px,y+0.45,pz,0,0.6,0.9,0.6);
          else put('hydrant',px,y+0.4,pz,0,0.35,0.8,0.35);}}
      run=(run+Lg)%26;}}

  // ---- dune grass along the back of the ocean beach ----
  const S0=(PL.surf||[[]])[0].filter((p,i,a)=>i===0||p[0]>a[i-1][0]);
  for(const [sx,sz] of S0){if(sx<-1100)continue;for(let k=0;k<4;k++){const x=sx+(R()-0.5)*20,z=sz-86-R()*14;
    if(PL.boardwalk&&PL.boardwalk.length&&x>PL.boardwalk[0][0]-4&&x<PL.boardwalk[PL.boardwalk.length-1][0]+4)continue;   // the boardwalk is there
    const y=groundH(x,z);if(y>4)continue;const hh=0.5+R()*0.8;put('grass',x,y,z,R()*6,0.7+R()*0.6,hh,0.7+R()*0.6,R()<0.5?0xb8b070:0x8aa060);}}

  // ---- build the kit ----
  const col=new THREE.Color();let n=0;
  for(const [name,K] of Object.entries(KIT)){if(!K.list.length)continue;
    const im=new THREE.InstancedMesh(K.geo,K.mat,K.list.length);
    K.list.forEach(([x,y,z,yw,sx,sy,sz,c],i)=>{ps.set(x,y,z);q.setFromAxisAngle(UPV,yw);sc.set(sx,sy,sz);m4.compose(ps,q,sc);im.setMatrixAt(i,m4);
      if(c!=null)im.setColorAt(i,col.setHex(c));else if(im.instanceColor||K.list.some(e=>e[7]!=null))im.setColorAt(i,col.copy(K.mat.color));});
    if(im.instanceColor)im.instanceColor.needsUpdate=true;
    im.castShadow=name!=='glass'&&name!=='lit'&&name!=='grass';im.receiveShadow=true;im.userData.noFingerprint=true;im.userData.wireCat='building';scene.add(im);n+=K.list.length;}
  // lit windows and shop fronts come on at dusk
  animHooks.push(()=>{const f=nightF();litM.emissiveIntensity=0.05+1.1*f;KIT.front.mat.emissiveIntensity=0.9*f;});

  // ---- the sea, and where its level is ----
  // The engine's water is a flat deep navy. Here it is replaced with a water you can see into: a little transparent,
  // so the sand shows through in the shallows and the water darkens as the sea bed falls away under it, with a
  // ripple texture drifting across it (a normal map, so the sun glints off the ripples). The engine's water mesh has
  // no texture coordinates; they are added here in world space, so the ripples tile at the same size everywhere.
  //
  // Its level is not fixed. ctx.sea holds:
  //   tide   follows the clock (high water at the engine's 0.7 m, half a metre lower twice a day), or is held low or
  //          high by the Tide button; it eases towards where it is going rather than jumping
  //   swell  a slow rise and fall of a few centimetres, so the waterline is never quite still
  //   drain  what the ocean tower event takes out of the sea (events.js): up to fourteen metres
  //   surge  the sea coming back in after the tower, running up the beach as a sheet of foam (life.js reads it)
  // and every frame the water and the plate of sea past the edge of the map are moved to ctx.sea.level. The surf, the
  // boats and the swimmers follow it (life.js).
  const BASE=0.7,water=[],farPlates=[];
  // the ripples: a tileable height field of a few waves at whole-number frequencies, turned into a normal map
  const ripple=(()=>{const N=512,c=document.createElement('canvas');c.width=c.height=N;const g=c.getContext('2d'),img=g.createImageData(N,N);
    // two dozen waves at random angles (whole-number frequencies, so it still tiles), the longer ones stronger: few
    // waves make a grid you can see from a distance, many make a sea
    const W=[];for(let k=0;k<40;k++){const f=3+Math.floor(R()*30),a=R()*Math.PI*2;W.push([Math.round(Math.cos(a)*f),Math.round(Math.sin(a)*f),R()*6.28,1/Math.pow(f,0.9)]);}
    const H=(i,j)=>{const x=i/N*Math.PI*2,y=j/N*Math.PI*2;let h=0;for(const [a,b,p,amp] of W)h+=Math.sin(x*a+y*b+p)*amp;return h;};
    for(let j=0;j<N;j++)for(let i=0;i<N;i++){const dx=H((i+1)%N,j)-H((i+N-1)%N,j),dy=H(i,(j+1)%N)-H(i,(j+N-1)%N),s=5.5,
        nx=-dx*s,ny=-dy*s,nz=1,l=Math.hypot(nx,ny,nz),k=(j*N+i)*4;
      img.data[k]=(nx/l*0.5+0.5)*255;img.data[k+1]=(ny/l*0.5+0.5)*255;img.data[k+2]=(nz/l*0.5+0.5)*255;img.data[k+3]=255;}
    g.putImageData(img,0,0);const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=8;return t;})();
  const seaM=new THREE.MeshPhongMaterial({color:0x2f86b4,specular:0xd8f0ff,shininess:90,transparent:true,opacity:0.8,
    normalMap:ripple,normalScale:new THREE.Vector2(0.45,0.45),polygonOffset:true,polygonOffsetFactor:-3,polygonOffsetUnits:-6});
  scene.traverse(o=>{if(!o.isMesh)return;
    if(o.name==='river'&&o.geometry&&o.geometry.attributes.position){
      const P=o.geometry.attributes.position,uv=new Float32Array(P.count*2);
      for(let k=0;k<P.count;k++){uv[2*k]=P.getX(k)/160;uv[2*k+1]=P.getZ(k)/160;}
      o.geometry.setAttribute('uv',new THREE.BufferAttribute(uv,2));
      o.material=seaM;water.push(o);o.renderOrder=1;}
    else if(o.geometry&&o.geometry.type==='RingGeometry'&&o.renderOrder===-1){farPlates.push([o,o.position.y]);}});
  // the ground under the water, by depth: wet sand at the edge, paler sand in the shallows, then mud, then a deep
  // blue-grey, rather than the land's greens (which is what a falling tide or a drained ocean would otherwise
  // uncover). Seen through the water, this is what makes the shallows turquoise and the deep water dark.
  const STOPS=[[0.7,0xc8b48a],[-1.5,0xd8c89a],[-5,0x8a8a72],[-11,0x3e5a66],[-24,0x1c3442]].map(([y,c])=>[y,new THREE.Color(c)]);
  const seaBed=(y,out)=>{for(let k=0;k+1<STOPS.length;k++){const [y0,c0]=STOPS[k],[y1,c1]=STOPS[k+1];if(y>=y1)return out.copy(c0).lerp(c1,Math.max(0,Math.min(1,(y0-y)/(y0-y1))));}return out.copy(STOPS[STOPS.length-1][1]);};
  const tmpC=new THREE.Color();
  scene.traverse(o=>{if(!o.isMesh||o.name!=='terrain'||!o.geometry.attributes.color)return;
    const P=o.geometry.attributes.position,C=o.geometry.attributes.color;
    for(let k=0;k<P.count;k++){const y=P.getY(k);if(y>1.05)continue;seaBed(y,tmpC);
      const blend=Math.max(0,Math.min(1,(1.05-y)/0.35));C.setXYZ(k,C.getX(k)+(tmpC.r-C.getX(k))*blend,C.getY(k)+(tmpC.g-C.getY(k))*blend,C.getZ(k)+(tmpC.b-C.getZ(k))*blend);}
    C.needsUpdate=true;});
  const sea=ctx.sea={tide:0,tideTo:0,mode:'auto',swell:0,drain:0,surge:0,level:BASE,base:BASE};
  const tideAt=h=>-0.5*(0.5-0.5*Math.cos(2*Math.PI*(h-3)/12.42));       // 0 at high water, -0.5 at low
  {let last=performance.now();animHooks.push(now=>{const dt=Math.min(0.1,(now-last)/1000),t=now/1000;last=now;
    const h=api.hour?api.hour():12;
    sea.tideTo=sea.mode==='low'?-0.5:sea.mode==='high'?0:tideAt(h);
    sea.tide+=(sea.tideTo-sea.tide)*Math.min(1,dt*0.35);                    // a few seconds to come in or go out
    sea.swell=Math.sin(t*0.42)*0.05+Math.sin(t*0.17+1.3)*0.04;
    sea.surge=Math.max(0,sea.surge-dt*0.12);
    sea.level=BASE+sea.tide+sea.swell-sea.drain;const dy=sea.level-BASE;
    for(const w of water)w.position.y=dy;
    for(const [o,y0] of farPlates)o.position.y=y0+Math.min(0,dy);
    // the ripples drift with the wind, and the water is clearer when the sea has drained to a puddle
    ripple.offset.set((t*0.012)%1,(t*0.007)%1);seaM.opacity=0.8+0.12*Math.min(1,sea.drain/6);});}
  // the Tide button: follow the clock, or hold the water low or high to see the difference
  api.onUI(({ui,mkBtn})=>{const L={auto:'Tide: by the clock',low:'Tide: low',high:'Tide: high'},next={auto:'low',low:'high',high:'auto'};
    const b=mkBtn(L.auto,ui,()=>{sea.mode=next[sea.mode];b.textContent=L[sea.mode];});b.title='The tide comes and goes with the time of day; this holds it low or high';});
  ctx.details=Object.assign(ctx.details||{},{dressing:n});
}
