// Silo 18: the model the page builds. Fan work after Hugh Howey's Wool: the premise of the setting (a buried silo of
// 144 levels round one stair, a screen showing a poisoned outside, fifty silos in a field) drawn as this project's
// own geometry. Nothing is taken from the books' text or the television series' design, and the people are
// anonymous figures.
//
// Modes: 'cut' (the silo in section: a clipping plane through its axis, turned to face the camera, takes away the
// near half of everything but the stair), 'inside' and 'outside' (nothing cut), 'field' (the ground made see-through
// over the fifty silos). A view in the city file says which it wants.
import {makeKits} from './kit.js';
import {LH,Y1,RS,RW,RO,NL,yL,levelAt,kindOf,zoneOf,placeName,buildKits,buildStair,buildTop,buildHall,SCREEN,AIRLOCK,STAIR,FARMV,FARM_NAMES,WATERV} from './levels.js';
import {buildPlant} from './plant.js';
import {buildCrowd,activity} from './crowd.js';
import {buildDigger,MINE_DEPTH,HUB_H} from './digger.js';
import {buildOutside,HILL,EXIT,SENSOR,RC} from './outside.js';
import {buildLife} from './life.js';
import {mkRng} from '../core/rng.js';
const TAU=Math.PI*2,D=Math.PI/180;
const ease=x=>x<=0?0:x>=1?1:x*x*(3-2*x);

export function model(api){
  const {THREE,scene,camera,renderer,animHooks,C}=api;
  renderer.localClippingEnabled=true;
  const PL=new THREE.Plane(new THREE.Vector3(1,0,0),1e7),clip=[PL];
  const K=makeKits(THREE),M={K,clip},R=mkRng(18);
  const root=new THREE.Group();scene.add(root);
  scene.fog=new THREE.FogExp2(0x6b6258,0.00012);

  // ---- materials: one lit, painted by vertex colour; the lamps and the lit windows of each third apart, so a
  //      third can go dark on its own ----
  const BASE=new THREE.MeshLambertMaterial({vertexColors:true,side:THREE.DoubleSide,clippingPlanes:clip});
  const STAIRM=new THREE.MeshLambertMaterial({vertexColors:true,side:THREE.DoubleSide});
  // each part of the silo its own light: sodium amber up top, magenta-white over the farms, cold blue-white in IT,
  // the mids plain and warm, red-orange working light down deep. PAL.lamp tints the lamps, PAL.tint the rooms.
  const PAL={top:{lamp:[1,0.82,0.58],tint:[1.05,0.95,0.8]},farm:{lamp:[1,0.82,1],tint:[1.0,0.9,1.02]},it:{lamp:[0.72,0.88,1.2],tint:[0.82,0.92,1.08]},
    mid:{lamp:[1,0.94,0.82],tint:[0.98,1.0,0.93]},deep:{lamp:[1,0.55,0.3],tint:[0.86,0.72,0.58]},
    // the farm floors by how they are lit: the grain under old sodium lamps amber, the animals and the floor that needs
    // no light under plain working lamps (the magenta 'farm' is the LED floors')
    farmsod:{lamp:[1,0.78,0.5],tint:[1.0,0.95,0.86]},farmplain:{lamp:[1,0.97,0.9],tint:[0.98,0.98,0.95]}};
  const lampM={},glowM={};for(const z in PAL){lampM[z]=new THREE.MeshBasicMaterial({vertexColors:true,clippingPlanes:clip});glowM[z]=new THREE.MeshBasicMaterial({vertexColors:true,clippingPlanes:clip});}
  const BLINK=new THREE.MeshBasicMaterial({vertexColors:true,clippingPlanes:clip});
  const SPILL=new THREE.MeshBasicMaterial({vertexColors:true,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,clippingPlanes:clip});
  const AIRM=new THREE.MeshBasicMaterial({vertexColors:true,clippingPlanes:clip});
  const matFor=(key,z)=>key==='base'?BASE:key==='stair'?STAIRM:key==='lamp'?lampM[z]:key==='glow'?glowM[z]:key==='airlock'?AIRM:key==='blink'?BLINK:key==='spill'?SPILL:key==='pipes'?STAIRM:BASE;

  // ---- the levels: each kind built once, drawn as instances in chunks of eight levels, each chunk shown only
  //      when it is in view ----
  // each level turned its own way, so no two line up and the cut never meets the same wall twice
  const turn=[];for(let n=0;n<=NL;n++)turn.push(R()*TAU);
  M.turn=turn;const kits=buildKits(K,R),chunks=[],o=new THREE.Object3D(),tint=new THREE.Color();
  // each band of eight levels painted its own way over the years; some levels let go, some kept proud
  const SCHEME=[[1,1,1],[1.06,0.98,0.9],[0.92,0.98,1.04],[1.03,1.02,0.92],[0.97,0.93,0.92],[0.94,1.03,0.96],[1.05,0.95,0.97]];
  const care=n=>{const h=(n*2654435761>>>0)%11;return h<2?0.8:h===10?1.1:1;};
  {const groups=new Map();
    // the homes come in three versions, chosen level by level, so neighbouring floors differ
    for(let n=2;n<NL-2;n++){const k0=kindOf(n),kd=k0==='home'?'home'+((n*7+Math.floor(n/8))%3):k0==='farm'?'farm'+FARMV[n]:k0==='water'?'water'+(WATERV[n]?WATERV[n]:''):k0;if(!kits[kd])continue;const pz=k0==='it'?k0:k0==='water'?'farmplain':k0==='farm'?['farm','farm','farm','farmsod','farmplain','farmplain'][FARMV[n]]:zoneOf(n),key=kd+'|'+pz+'|'+Math.floor((n-1)/8);let g=groups.get(key);if(!g)groups.set(key,g={kd,z:pz,ns:[]});g.ns.push(n);}
    for(const g of groups.values()){const geo=kits[g.kd],ys=g.ns.map(yL),lo=Math.min(...ys),hi=Math.max(...ys)+LH,list=[];
      for(const [key,G] of Object.entries(geo)){const im=new THREE.InstancedMesh(G,matFor(key,g.z),g.ns.length);
        g.ns.forEach((n,i)=>{o.position.set(0,yL(n),0);o.rotation.set(0,turn[n],0);o.updateMatrix();im.setMatrixAt(i,o.matrix);
          im.userData.detail=key==='fbase';if(key==='base'||key==='fbase'){const r=(0.88+((n*37)%13)/13*0.2)*care(n),T=PAL[g.z].tint,S=SCHEME[Math.floor((n-1)/8)%SCHEME.length];tint.setRGB(r*T[0]*S[0],r*T[1]*S[1]*(0.97+((n*11)%5)*0.01),r*T[2]*S[2]*(0.95+((n*5)%7)*0.01));im.setColorAt(i,tint);}});
        im.frustumCulled=false;root.add(im);list.push(im);}
      chunks.push({list,sph:new THREE.Sphere(new THREE.Vector3(0,(lo+hi)/2,0),Math.hypot(RO,(hi-lo)/2))});}}
  // the stair, every level the same turn, and the column it winds round
  {const SG=buildStair(K);for(let c=0;c<NL-1;c+=12){const n=Math.min(12,NL-1-c),list=[];
      for(const [key,sg] of Object.entries(SG)){const im=new THREE.InstancedMesh(sg,key==='rail'?BASE:key==='slamp'?lampM[(m=>kindOf(m)==='farm'||kindOf(m)==='it'?kindOf(m):zoneOf(m))(c+1+(n>>1))]:STAIRM,n);
      for(let i=0;i<n;i++){o.position.set(0,yL(c+i+1),0);o.rotation.set(0,0,0);o.updateMatrix();im.setMatrixAt(i,o.matrix);if(key==='rail')im.setColorAt(i,tint.setRGB(1,1,1));}im.frustumCulled=false;root.add(im);list.push(im);}
      chunks.push({list,sph:new THREE.Sphere(new THREE.Vector3(0,yL(c+1)-n*LH/2,0),Math.hypot(10,n*LH/2+2))});}
    // no column: the stair's eye is open from top to bottom, with the cables and pipes hung down it
    // cables and pipes down the column
    const k=K.kit();for(let i=0;i<4;i++){const a=(i+0.5)/4*TAU;k.add('p',K.G.cyl6,i%2?'#2a2c2e':'#7a5a38',Math.cos(a)*3.25,(yL(1)+yL(NL))/2,Math.sin(a)*3.25,{sx:0.07,sy:yL(1)-yL(NL),sz:0.12});}
    root.add(new THREE.Mesh(k.build().p,new THREE.MeshLambertMaterial({vertexColors:true})));}
  // the silo's wall, its roof slab and its floor
  {const wm=new THREE.MeshLambertMaterial({color:'#6f6a62',side:THREE.DoubleSide,clippingPlanes:clip});
    // in three bands, so the airlock's corridor (level 1) and the mines (level 144) can pass through it
    const w2m=new THREE.MeshLambertMaterial({color:'#6e6a62',side:THREE.DoubleSide,clippingPlanes:clip});
    const band=(y0,y1,gaps)=>{const cuts=gaps.map(a=>[a,0.055]).sort((p,q)=>p[0]-q[0]);
      // the spans between the gaps, as angles round from the first gap's far edge
      const spans=[];if(!cuts.length)spans.push([0,TAU]);else for(let i=0;i<cuts.length;i++){const a0=cuts[i][0]+cuts[i][1],nx=cuts[(i+1)%cuts.length],a1=nx[0]-nx[1]+(i+1===cuts.length?TAU:0);spans.push([a0,a1-a0]);}
      for(const [a0,len] of spans)for(const [r,m] of [[RO,wm],[RO+1.6,w2m]]){
        // a cylinder's angle θ puts a point at (r sin θ, r cos θ), so our angle a is θ = π/2 - a, run backwards
        const g=new THREE.CylinderGeometry(r,r,y1-y0,Math.max(4,Math.ceil(len/TAU*96)),1,true,Math.PI/2-a0-len,len);const mm=new THREE.Mesh(g,m);mm.position.y=(y0+y1)/2;root.add(mm);}};
    const yb=yL(NL)-1,ym=yL(NL)+4.6,yt=yL(1)-0.6,ytop=yL(1)+LH+1.8;
    band(yb,ym,[40,130,220,310].map(d=>d*D));band(ym,yt,[]);band(yt,ytop,[AIRLOCK]);
    const roof=new THREE.Mesh(new THREE.CylinderGeometry(RO+1.6,RO+1.6,1.8,96),wm);roof.position.y=yL(1)+LH+0.4;root.add(roof);
    // the floors' edges against the wall, a band a level, so the section reads as storeys
    const bands=new THREE.InstancedMesh(new THREE.CylinderGeometry(RO+0.05,RO+0.05,0.5,96,1,true),new THREE.MeshLambertMaterial({color:'#5e5a52',side:THREE.DoubleSide,clippingPlanes:clip}),NL);
    for(let n=1;n<=NL;n++){o.position.set(0,yL(n)-0.25,0);o.rotation.set(0,0,0);o.updateMatrix();bands.setMatrixAt(n-1,o.matrix);}bands.frustumCulled=false;root.add(bands);}
  // the flats' numbers on enamel plates over their doors, in three styles from three eras, one instanced mesh
  {const c=document.createElement('canvas');c.width=c.height=512;const x=c.getContext('2d'),CW=512/6;
    for(let i=0;i<36;i++){const cx=(i%6)*CW,cy=Math.floor(i/6)*CW,st=i%3;x.fillStyle=['#2a4a7a','#b89a50','#e8e4d8'][st];x.fillRect(cx+3,cy+20,CW-6,CW-40);
      x.strokeStyle='rgba(0,0,0,0.4)';x.lineWidth=3;x.strokeRect(cx+6,cy+23,CW-12,CW-46);x.fillStyle=['#f0ece0','#1c1a16','#1c1a16'][st];x.font='bold 34px '+(st===1?'serif':'monospace');
      x.textAlign='center';x.textBaseline='middle';x.fillText(String(i+1),cx+CW/2,cy+CW/2+2);x.fillStyle='rgba(60,40,20,0.3)';for(let q=0;q<4;q++)x.fillRect(cx+8+((i*29+q*17)%60),cy+24+((i*13+q*11)%30),3+q,2);}
    const t=new THREE.CanvasTexture(c),pos=[],uv=[],step=TAU/36;
    for(let i=0;i<36;i++){const a=i*step+step*0.28,r=RW-0.17,w=0.2,c0=Math.cos(a),s0=Math.sin(a),tx=-s0,tz=c0,px=c0*r,pz=s0*r,u0=(i%6)/6,v1=1-Math.floor(i/6)/6,v0=v1-1/6,y0=2.45,y1=2.7;
      const L=[px-tx*w,pz-tz*w],Rr=[px+tx*w,pz+tz*w];pos.push(L[0],y0,L[1],Rr[0],y0,Rr[1],Rr[0],y1,Rr[1],L[0],y0,L[1],Rr[0],y1,Rr[1],L[0],y1,L[1]);
      uv.push(u0,v0+0.04,u0+1/6,v0+0.04,u0+1/6,v1-0.04,u0,v0+0.04,u0+1/6,v1-0.04,u0,v1-0.04);}
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.computeVertexNormals();
    const ns=[];for(let n=2;n<NL-2;n++){const kd=kindOf(n);if(kd==='home'||kd==='bazaar')ns.push(n);}
    const im=new THREE.InstancedMesh(g,new THREE.MeshLambertMaterial({map:t,side:THREE.DoubleSide,clippingPlanes:clip}),ns.length);
    ns.forEach((n,i)=>{o.position.set(0,yL(n),0);o.rotation.set(0,turn[n],0);o.updateMatrix();im.setMatrixAt(i,o.matrix);});im.frustumCulled=false;root.add(im);}

  // the level numbers, stencilled on a plate either side of every landing, facing the stair: one atlas texture
  // (twelve by twelve cells), one merged mesh of 288 quads
  {const N=12,CW=1024/N,c=document.createElement('canvas');c.width=c.height=1024;const x=c.getContext('2d');
    for(let n=1;n<=NL;n++){const cx=((n-1)%N)*CW,cy=Math.floor((n-1)/N)*CW;
      x.fillStyle=n<=48?'#c8a03a':n<=96?'#b8b0a0':'#b8582a';x.fillRect(cx+2,cy+12,CW-4,CW-24);
      x.fillStyle='rgba(40,30,20,0.25)';for(let q=0;q<6;q++)x.fillRect(cx+2+((n*37+q*13)%70),cy+14+((n*11+q*29)%50),3+q,2);
      x.fillStyle='#1c1a18';x.textAlign='center';x.textBaseline='middle';x.font='bold 15px monospace';x.fillText('LEVEL',cx+CW/2,cy+26);
      x.font='bold 40px monospace';x.fillText(String(n),cx+CW/2,cy+CW/2+10);}
    const t=new THREE.CanvasTexture(c);t.anisotropy=4;
    const pos=[],uv=[],nor=[];
    for(let n=1;n<=NL;n++){const u0=((n-1)%N)/N,v1=1-Math.floor((n-1)/N)/N,v0=v1-1/N,y0=yL(n)+1.35,y1=y0+1.5;
      for(const a of [9*D,-9*D]){const r=RW-0.16,w=0.75,c0=Math.cos(a),s0=Math.sin(a),tx=-s0,tz=c0,px=c0*r,pz=s0*r;
        // seen from the stair, looking out, the right-hand side is along the tangent (the larger angle)
        const L=[px-tx*w,pz-tz*w],Rr=[px+tx*w,pz+tz*w];
        pos.push(L[0],y0,L[1],Rr[0],y0,Rr[1],Rr[0],y1,Rr[1],L[0],y0,L[1],Rr[0],y1,Rr[1],L[0],y1,L[1]);
        uv.push(u0,v0,u0+1/N,v0,u0+1/N,v1,u0,v0,u0+1/N,v1,u0,v1);for(let q=0;q<6;q++)nor.push(-c0,0,-s0);}}
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setAttribute('normal',new THREE.Float32BufferAttribute(nor,3));
    g.computeBoundingSphere();root.add(new THREE.Mesh(g,new THREE.MeshLambertMaterial({map:t,side:THREE.DoubleSide,clippingPlanes:clip})));}

  // level 1, and the generator hall
  const top=buildTop(K);for(const [key,G] of Object.entries(top))root.add(new THREE.Mesh(G,matFor(key,'top')));
  const hall=buildHall(K);for(const [key,G] of Object.entries(hall.geo))root.add(new THREE.Mesh(G,matFor(key,'deep')));
  // the plant at the bottom: the turbine set and everything round it (src/silo/plant.js)
  const plant=buildPlant(THREE,K,key=>matFor(key,'deep'),clip);root.add(plant.group);
  let genRun=1;

  // ---- the airlock's doors, and the gas that floods it ----
  const doors={};{const a=AIRLOCK,c=Math.cos(a),s=Math.sin(a),y=yL(1),m=new THREE.MeshLambertMaterial({color:'#6a6e70',clippingPlanes:clip});
    for(const [k,r] of [['inner',51.6],['outer',62.4]]){const d=new THREE.Mesh(new THREE.BoxGeometry(0.4,3.4,4.6),m);d.position.set(c*r,y+1.7,s*r);d.rotation.y=-a;d.userData.y0=y+1.7;root.add(d);doors[k]=d;}
    const n=300,g=new THREE.BufferGeometry(),p=new Float32Array(n*3);g.setAttribute('position',new THREE.BufferAttribute(p,3));
    const gas=new THREE.Points(g,new THREE.PointsMaterial({color:'#e8ecf0',size:0.5,transparent:true,opacity:0,depthWrite:false}));gas.frustumCulled=false;gas.userData.noWire=true;root.add(gas);
    doors.gas=gas;doors.gp=p;}

  // ---- the outside, the field, the people ----
  const out=buildOutside(api,M),life=buildLife(api,M),crowd=buildCrowd(THREE,K,M);for(const m of crowd.meshes)root.add(m);
  const dig=buildDigger(THREE,K,key=>matFor(key,'deep'),clip,out);root.add(dig.group);

  // the cleaning suit, hung by the inner door, waiting
  {const sm=new THREE.Mesh(life.suit.geometry,life.suit.material.clone());sm.material.clippingPlanes=clip;const a=AIRLOCK,c=Math.cos(a),s=Math.sin(a);
    sm.position.set(c*46.6+s*1.8,yL(1)+0.25,s*46.6-c*1.8);sm.rotation.y=-a;root.add(sm);}

  // ---- the screen: the cameras on the cap, drawn live into a texture on the cafeteria wall ----
  const SH=3.3,sAng=SCREEN[1]-SCREEN[0],sW=sAng*(RO-0.6);
  const rt=new THREE.WebGLRenderTarget(1280,Math.round(1280*SH/sW),{depthBuffer:true});
  const scam=new THREE.PerspectiveCamera(8,sW/SH,2,40000);scam.layers.set(1);
  // it looks out past the hill (left of centre) to the city on the horizon
  scam.position.set(SENSOR.x,out.ground(SENSOR.x,SENSOR.z)+6,SENSOR.z-5);scam.lookAt(-60,out.ground(SENSOR.x,SENSOR.z)+6+85,-2000);
  {const g=new THREE.CylinderGeometry(RO-0.6,RO-0.6,SH,48,1,true,Math.PI/2-SCREEN[1],sAng),uv=g.attributes.uv;for(let i=0;i<uv.count;i++)uv.setX(i,1-uv.getX(i));
    const scr=new THREE.Mesh(g,new THREE.MeshBasicMaterial({map:rt.texture,color:new THREE.Color(1.45,1.4,1.3),side:THREE.BackSide,clippingPlanes:clip,fog:false}));scr.position.y=yL(1)+0.55+SH/2;root.add(scr);
    // the grime on it: dust that builds up between cleanings
    const c=document.createElement('canvas');c.width=512;c.height=64;const x=c.getContext('2d');
    for(let i=0;i<900;i++){const r=1+R()*9;x.fillStyle=`rgba(${90+R()*40|0},${80+R()*30|0},${60+R()*20|0},${0.05+R()*0.12})`;x.beginPath();x.arc(R()*512,R()*64,r,0,TAU);x.fill();}
    x.fillStyle='rgba(80,70,55,0.25)';x.fillRect(0,0,512,64);
    const gm=new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(c),transparent:true,opacity:0.32,side:THREE.BackSide,depthWrite:false,clippingPlanes:clip,fog:false});
    const grime=new THREE.Mesh(new THREE.CylinderGeometry(RO-0.7,RO-0.7,SH,48,1,true,Math.PI/2-SCREEN[1],sAng),gm);grime.position.y=scr.position.y;root.add(grime);out.grime=gm;}

  // ---- the cut's face: the rock and dirt the section is cut through, either side of the shaft the silo is sunk in.
  //      Two strips on the cutting plane, from the bottom of the rock up to the ground, rebuilt when the plane turns ----
  //      A slot is left open through it at the mines' depth (WB..WT), out to UWIN each side, so the section shows the
  //      mines' hall, the drifts and the digger's tunnel lying under the plant; a dark back and floor close the slot ----
  const face=(()=>{const NU=48,NA=8,NB=10,UMAX=7000,FY=-1500,tex=out.strataTex,V=y=>(y-FY)/-FY;
    const y0m=yL(NL)-MINE_DEPTH,WB=y0m-1.0,WT=y0m+HUB_H+1.2,UWIN=280,uAt=(sd,i)=>{const f=i/NU;return (sd?1:-1)*(RO+1.62+(UMAX-RO-1.62)*(0.15*f+0.85*f*f*f));};
    // rows as well as columns: with a logarithmic depth buffer a long triangle's depth sags between its corners
    const W=NA+NB+2,n=2*(NU+1)*W,pos=new Float32Array(n*3),uv=new Float32Array(n*2),idx=[];
    for(let sd=0;sd<2;sd++)for(let i=0;i<NU;i++){const open=Math.abs(uAt(sd,i))<UWIN||Math.abs(uAt(sd,i+1))<UWIN;
      for(let j=0;j<W-1;j++){if(j===NA&&open)continue;const b=(sd*(NU+1)+i)*W+j;idx.push(b,b+W,b+1,b+1,b+W,b+W+1);}}
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('uv',new THREE.BufferAttribute(uv,2));g.setIndex(idx);
    const m=new THREE.MeshLambertMaterial({map:tex,color:'#ffffff',emissive:'#000000',side:THREE.DoubleSide});const mesh=new THREE.Mesh(g,m);mesh.frustumCulled=false;mesh.visible=false;root.add(mesh);
    // under the silo: the rock it stands on, from its floor down
    const bw=2*(RO+1.62),slab=(y0,y1)=>{const bh=y1-y0,bg=new THREE.PlaneGeometry(bw,bh,6,6),bu=bg.attributes.uv;
      for(let i=0;i<bu.count;i++){bu.setXY(i,(bu.getX(i)-0.5)*bw/90,V(y0+bu.getY(i)*bh));}const s=new THREE.Mesh(bg,m);s.frustumCulled=false;s.userData.y=(y0+y1)/2;root.add(s);return s;};
    const below=slab(FY,WB),between=slab(WT,yL(NL)-1.2);
    // the slot's back, floor and roof: plain dark rock, cut by the same plane as everything else
    const sm=new THREE.MeshLambertMaterial({color:'#3a332c',side:THREE.DoubleSide,clippingPlanes:clip});
    const slot=new THREE.Group();{const bk=new THREE.Mesh(new THREE.CylinderGeometry(UWIN,UWIN,WT-WB,96,1,true),sm);bk.position.y=(WB+WT)/2;slot.add(bk);}
    for(const yy of [WB,WT]){const r=new THREE.Mesh(new THREE.RingGeometry(RO+1.62,UWIN,96,1).rotateX(-Math.PI/2),sm);r.position.y=yy;slot.add(r);}
    root.add(slot);
    // over it: the dirt between its roof and the ground
    const lt=yL(1)+LH+1.3,lg=new THREE.PlaneGeometry(bw,-lt,6,2),lu=lg.attributes.uv;
    for(let i=0;i<lu.count;i++){lu.setXY(i,(lu.getX(i)-0.5)*bw/90,V(lt-lu.getY(i)*lt));}
    const lid=new THREE.Mesh(lg,m);lid.frustumCulled=false;root.add(lid);
    let last=null;
    return {mesh,update(){mesh.visible=below.visible=between.visible=slot.visible=lid.visible=mode==='cut';out.shell.visible=out.shellFloor.visible=mode==='inside';if(!mesh.visible)return;const nx=PL.normal.x,nz=PL.normal.z;if(last&&Math.abs(last[0]-nx)+Math.abs(last[1]-nz)<1e-4)return;last=[nx,nz];
      const tx=-nz,tz=nx,ox=nx*0.05,oz=nz*0.05;let k=0;for(const b of [below,between]){b.position.set(ox,b.userData.y,oz);b.rotation.set(0,-Math.atan2(tz,tx),0);}lid.position.set(ox,lt/2-0.25,oz);lid.rotation.copy(below.rotation);
      for(let sd=0;sd<2;sd++)for(let i=0;i<=NU;i++){const f=i/NU,u=(sd?1:-1)*(RO+1.62+(UMAX-RO-1.62)*(0.15*f+0.85*f*f*f)),x=tx*u+ox,z=tz*u+oz,top=out.ground(tx*u,tz*u)-0.3;
        for(let j=0;j<W;j++){const y=j<=NA?FY+(WB-FY)*j/NA:WT+(top-WT)*(j-NA-1)/NB;pos.set([x,y,z],k*3);uv.set([u/90,V(y)],k*2);k++;}}
      g.attributes.position.needsUpdate=g.attributes.uv.needsUpdate=true;g.computeVertexNormals();g.computeBoundingSphere();}};})();

  // ---- the cards: a section of the silo is a tall invisible ring the click finds; each says its levels ----
  const picks=[];
  {const span=(n0,n1)=>[yL(n0)+LH-0.5,yL(n1)];
    const Z=[[1,1,'Silo 18 — level 1, the top','The top level sits a few metres under the dirt. Most of it is the cafeteria, and on its outer wall a long screen shows the outside as the cameras on the cap see it: the hill, the dead city, the weather. Along the ring are the sheriff\'s office and the mayor\'s, and at the end of a short corridor the airlock, the one door out.'],
      [2,33,'Silo 18 — levels 2 to 33, up top','Offices near the top, then homes. Up top is closest to the screen and furthest from the machines; people here think of the mids as a long walk and of the deep as another country.'],
      [34,35,'Silo 18 — levels 34 and 35, IT','Racks of servers behind locked doors, humming. IT keeps the silo\'s records and its machines, and keeps to itself.'],
      [36,48,'Silo 18 — levels 36 to 48, up top','Homes and workshops: the lower end of the top third.'],
      [49,56,'Silo 18 — levels 49 to 56, the upper farms','Beds of crops in rings under grow lights that run on the day\'s schedule. Most of what the silo eats grows on these levels and the lower farms.'],
      [57,70,'Silo 18 — levels 57 to 70, the mids','Homes, schools, workshops. The middle third, a long walk from either end.'],
      [71,74,'Silo 18 — levels 71 to 74, the bazaar','Stalls round the landing under coloured awnings: food, cloth, tools, things mended and things traded.'],
      [75,76,'Silo 18 — levels 75 and 76, the mids','Homes between the bazaar and the lower farms.'],
      [77,84,'Silo 18 — levels 77 to 84, the lower farms','More beds under more lights: grain, beans, greens, and the plants that make cloth.'],
      [85,96,'Silo 18 — levels 85 to 96, the mids','Homes and workshops at the bottom of the middle third.'],
      [97,108,'Silo 18 — levels 97 to 108, down deep','The deep begins: homes for the people who work the machines, the air a little warmer, the lights a little more orange.'],
      [109,112,'Silo 18 — levels 109 to 112, supply','Shelves and crates. What the deep makes is stored here and carried up the stair, on porters\' backs, to wherever it is wanted.'],
      [113,122,'Silo 18 — levels 113 to 122, down deep','Homes and workshops of the deep.'],
      [123,128,'Silo 18 — levels 123 to 128, water treatment','Tanks and pipe runs: the silo\'s water, cleaned and sent back up.'],
      [129,134,'Silo 18 — levels 129 to 134, the casting rooms','Furnaces and moulds. Ore from the mines becomes the silo\'s metal here.'],
      [135,141,'Silo 18 — levels 135 to 141, mechanical','Pumps, machines, pipes: the people who keep everything else running.'],
      [142,144,'Silo 18 — levels 142 to 144, the generator hall','Three levels open as one hall round a turbine-generator set on a concrete bed: the turbine stepping up from its small high-pressure end to the big ribbed low-pressure end, coupled to the generator and its exciter. It burns what is refined from the well under the floor; an overhead crane runs on rails across the hall; the boards along the wall show every line in the plant. If it stops, the whole silo goes dark']];
    const pm=new THREE.MeshBasicMaterial({visible:false,side:THREE.DoubleSide,clippingPlanes:clip});
    for(const [a,b,name,info] of Z){const [y0,y1]=span(a,b),m=new THREE.Mesh(new THREE.CylinderGeometry(RO-0.5,RO-0.5,y0-y1,24,1,true),pm);m.position.y=(y0+y1)/2;m.userData.info={name,info};root.add(m);picks.push(m);}
    const st=new THREE.Mesh(new THREE.CylinderGeometry(9.6,9.6,yL(1)-yL(NL),16,1,true),new THREE.MeshBasicMaterial({visible:false,side:THREE.DoubleSide}));st.position.y=(yL(1)+yL(NL))/2;
    st.userData.info={name:'Silo 18 — the stair','info':'One spiral stair, one turn a level, 144 levels from the top to the generator. There are no lifts: everything and everyone goes up and down it on foot, and porters carry loads for a living.'};root.add(st);picks.unshift(st);
    const mn=new THREE.Mesh(new THREE.CylinderGeometry(RO+1,RO+1,HUB_H,24,1,true),pm);mn.position.y=yL(NL)-MINE_DEPTH+HUB_H/2;mn.userData.info={name:'Silo 18 — the mines','info':'Forty metres under the plant, down a shaft with a cage: a hall cut in the rock under the silo\'s footing, pillars left to hold the roof, a loop of track round it. Four drifts go out from it, timbered, with rails and ore carts, for the ore the casting rooms melt down. Off one, behind a welded bulkhead, a lined tunnel runs toward Silo 17, and at its end an old boring machine stands where it stopped.'};root.add(mn);picks.push(mn);
    for(const p of [out.terrain,out.housing,out.city,out.hill])picks.push(p);}

  // ---- modes ----
  let mode='cut';
  function setMode(m){mode=m;const field=m==='field';
    out.field.visible=field;
    for(const x of out.surface.concat([out.housing]))x.visible=!field;
    const i=picks.indexOf(out.fieldPick);if(field&&i<0)picks.unshift(out.fieldPick);if(!field&&i>=0)picks.splice(i,1);
    const ti=picks.indexOf(out.terrain);if(field&&ti>=0)picks.splice(ti,1);if(!field&&ti<0)picks.push(out.terrain);
    if(m!=='cut')PL.constant=1e7;}
  if(!picks.includes(out.fieldPick))scene.add(out.fieldPick);

  // ---- the clock: an hour every fifteen seconds; the lamps dim at night on a schedule ----
  const H=new URLSearchParams(location.hash.slice(1));let hour=H.has('hour')?+H.get('hour'):9.5,clockRate=1/15;
  // the clock can be run faster to watch a day go by: the lamps coming up, the shift change on the stair, meals in the
  // cafeteria, the lamps going down (T, or the button, steps through the speeds; #speed= in the address)
  const SPEEDS=[1,10,60];let speedI=Math.max(0,SPEEDS.indexOf(+(H.get('speed')||1)));
  const faster=()=>{speedI=(speedI+1)%SPEEDS.length;say(speedI?'The clock runs '+SPEEDS[speedI]+' times faster: a day in '+Math.round(24*15/SPEEDS[speedI])+' seconds.':'The clock back at its own pace: an hour every fifteen seconds.');};
  const lightF=h=>{const a=ease((h-5.5)/1),b=1-ease((h-21.5)/1);return 0.28+0.72*Math.max(0,Math.min(a,b));};
  const dayOut=h=>0.22+0.78*Math.max(0,Math.sin((h-6)/12*Math.PI));
  // the page's lights: the ambient made warm (it is bluish, for space), the sun and fill (dimmed with the day),
  // and the lamp that follows the camera (dimmed with the silo's lights when underground)
  const lights={dirs:[]};scene.traverse(x=>{if(x.isAmbientLight)lights.amb=x;else if(x.isDirectionalLight)lights.dirs.push([x,x.intensity]);});
  if(lights.amb)lights.amb.color.set('#7a7064');
  // the screen's camera sees only layer 1 (the outside), and three.js lights only what is on a camera's layers
  if(lights.amb)lights.amb.layers.enable(1);for(const [l] of lights.dirs)l.layers.enable(1);
  const amb0=lights.amb?lights.amb.intensity:0.5;

  // ---- the happenings ----
  const EV={clean:null,porter:null,dark:null,storm:null,dig:null};let pendingEv=null,pendingFly=false;let msg='',msgT=0;
  const say=s=>{msg=s;msgT=7;};
  const views=C.views||{};
  // a view may name a room on a level instead of a point ({n, i, rooms, r, frac, cr, h, el}): the levels are turned at
  // random, so where that room is comes from the level's turn; the camera stands at radius cr looking out through it
  for(const v of Object.values(views))if(v.dig){const q=v.dig,{F,y0,AX}=dig.frame,[tx,tz]=F(q.ts,q.tw||0),[cx,cz]=F(q.s,q.w||0),ty=y0+(q.th==null?AX:q.th),cy=y0+q.h,dh=Math.hypot(cx-tx,cz-tz);
    Object.assign(v,{tx,ty,tz,az:Math.atan2(cz-tz,cx-tx),el:Math.atan2(cy-ty,dh),d:Math.hypot(dh,cy-ty)});}
  for(const v of Object.values(views))if(v.room){const q=v.room,wa=(q.i+(q.frac==null?0.5:q.frac))/q.rooms*TAU-turn[q.n],r=q.r,cr=q.cr==null?r-5:q.cr,da=q.da||0;
    const tx=Math.cos(wa)*r,tz=Math.sin(wa)*r,cx=Math.cos(wa+da)*cr,cz=Math.sin(wa+da)*cr,el=q.el==null?0.12:q.el,dh=Math.hypot(cx-tx,cz-tz);
    Object.assign(v,{tx,ty:yL(q.n)+(q.h==null?1.6:q.h),tz,az:Math.atan2(cz-tz,cx-tx),el,d:dh/Math.cos(el)});}
  const go=name=>{const v=views[name];if(!v)return;if(v.mode)setMode(v.mode);api.view(v);};
  // fly from the field into the silo (from the field view: the page keeps its turntable to itself)
  let flight=null;
  // the fly-in: from the field, down over Silo 18's cap, through it into the top of the shaft, and down the stair's eye
  // to stand on the stair at level 3. Each leg eases in and out; the mode changes as the camera crosses the ground.
  const FLY=[[views['The field of fifty silos'],0,null],[{az:1.15,el:0.95,d:520,tx:0,ty:0,tz:0},3.0,'outside'],[{az:1.15,el:1.5,d:60,tx:0,ty:-2,tz:0},2.4,null],
    [{az:1.15,el:1.555,d:70,tx:-0.6,ty:-80,tz:-1.0},2.6,'inside'],[views['On the stair, level 3'],3.0,null]];
  function flyIn(){flight={i:1,t:0};}
  const cleaning=()=>{if(EV.clean)return;EV.clean={t:0,phase:0};out.grime.opacity=Math.max(out.grime.opacity,0.32);life.suit.visible=false;go('The airlock');say('An alarm up top: someone is going out to clean the lenses.');};
  const porter=()=>{if(EV.porter){EV.porter=null;go('The stair, mid-descent');return;}go('The stair, mid-descent');EV.porter={L:1.02,t:0};say('A porter sets off from the top with a load for supply, level 110.');};
  const blackout=()=>{if(EV.dark)return;EV.dark={t:0};say('The generator falters. Down deep, the lights go out.');};
  const intoSilo=()=>{go('The field of fifty silos');setTimeout(flyIn,400);};
  const digger=()=>{if(EV.dig)return;EV.dig={t:0};go('The digger');say('Past the mines, behind a bulkhead no one opens, the old boring machine stirs: its lamps come on, its belt starts, its head turns.');};
  const storm=()=>{if(EV.storm)return;EV.storm={t:0};say('A dust storm rolls in over the hill.');};

  // ---- every frame ----
  const fr=new THREE.Frustum(),pm4=new THREE.Matrix4();let last=0,t=0,frameN=0;
  const suitPath=[];{const a=AIRLOCK,c=Math.cos(a),s=Math.sin(a),y=yL(1),g=out.ground;
    const P=(x,yy,z)=>suitPath.push(new THREE.Vector3(x,yy,z));
    P(c*57,y,s*57);P(c*63.5,y,s*63.5);P(c*110,0,s*110);P(c*117,g(c*117,s*117),s*117);P(-40,g(-40,-30),-30);P(SENSOR.x,g(0,-18),-18);
    P(HILL.x+30,g(HILL.x+30,HILL.z+150),HILL.z+150);}
  animHooks.push(now=>{const dt=Math.min(0.1,(now-(last||now))/1000);last=now;t+=dt;frameN++;
    hour=(hour+dt*clockRate*SPEEDS[speedI])%24;
    // the cut faces the camera
    if(mode==='cut'){const cx=camera.position.x,cz=camera.position.z,l=Math.hypot(cx,cz)||1;PL.normal.set(-cx/l,0,-cz/l);PL.constant=0;}
    // chunks out of view are not drawn
    pm4.multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse);fr.setFromProjectionMatrix(pm4);
    // and inside, the far ones neither (from the top of the shaft you would see all 144 levels at once)
    const far=mode==='inside'?260:1e9;
    for(const c of chunks){const dd=c.sph.center.distanceTo(camera.position)-c.sph.radius,v=fr.intersectsSphere(c.sph)&&dd<far;
      // the rooms' furniture only near to (it is most of the triangles, and from far off it is a few pixels)
      // (by height: a chunk's sphere is far wider than the chunk is tall, so it would count the floors above and below as near)
      const half=Math.sqrt(Math.max(0,c.sph.radius*c.sph.radius-RO*RO)),dy=Math.abs(camera.position.y-c.sph.center.y)-half,near=mode==='inside'?dy<6&&Math.hypot(camera.position.x,camera.position.z)<RO+5:dd<50;
      for(const m of c.list)m.visible=v&&(!m.userData.detail||near);}
    {const near=Math.hypot(camera.position.x,camera.position.z)<RO+260&&camera.position.y<60;for(const m of life.residents)m.visible=near&&mode!=='field';}
    // lights: the schedule, and a blackout down deep
    const lf=lightF(hour);let deepF=1;
    if(EV.dark){const e=EV.dark;e.t+=dt;deepF=e.t<1.5?(Math.sin(e.t*40)>0?0.8:0.1):e.t<26?0:e.t<29?(Math.sin(e.t*30)>0?1:0.2):1;if(e.t>29)EV.dark=null;}
    const hum=0.95+0.05*genRun*Math.sin(t*31)*Math.sin(t*7.3);for(const z in PAL){const f=z==='deep'?deepF*hum:1,L=PAL[z].lamp;lampM[z].color.setRGB(L[0]*lf*f,L[1]*lf*f,L[2]*lf*f);glowM[z].color.setScalar((0.6+0.4*(1-lf))*f);}
    BLINK.color.setScalar(Math.sin(t*5.3)>0.2?1:0.15);SPILL.color.setScalar(0.5+0.5*(1-lf));
    if(deepF===0)lampM.deep.color.setRGB(0.22,0.02,0.02);
    // the generator's speed: it winds down over a dozen seconds when it fails, and runs up again when it is restarted
    {const e=EV.dark;genRun=!e?Math.min(1,genRun+dt*0.5):e.t<1?1:e.t<26?Math.max(0,1-(e.t-1)/12):Math.min(1,(e.t-26)/3);
      const pc=camera.position;if(pc.y<yL(136)&&Math.hypot(pc.x,pc.z)<RO+40)plant.tick(t,dt,genRun);}
    const above=camera.position.y>-2;
    // the outside's day, and the storm
    let st=0;if(EV.storm){const e=EV.storm;e.t+=dt;st=ease(e.t/8)*(1-ease((e.t-45)/10));if(e.t>56)EV.storm=null;}
    const day=dayOut(hour),sk=day*(1-0.25*st);out.sky.material.color.setScalar(sk);
    scene.fog.density=0.00012+st*0.0026;scene.fog.color.setRGB(0.545*sk,0.502*sk,0.439*sk);   // the sky's colour at the horizon, so the far things fade into it
    if(lights.amb)lights.amb.intensity=above||mode==='field'?amb0*(0.4+0.6*day):amb0*2.1*(0.4+0.6*lf);
    let kf=above||mode==='field'?day*(1-0.5*st):1.1*lf;
    // a blackout darkens the deep for anyone looking at it from there
    if(deepF<0.5&&camera.position.y<yL(97)&&mode!=='field'){if(lights.amb)lights.amb.intensity*=0.3;kf*=0.3;}
    for(const [l,i0] of lights.dirs)l.intensity=i0*kf;
    out.veils.tick(dt,st);
    if(mode==='field')out.fieldWalls(camera.position);
    {const d=out.dust,p=d.geometry.attributes.position;d.material.opacity=st*0.8;if(st>0.01){d.position.set(camera.position.x,Math.max(0,camera.position.y-25),camera.position.z);
      for(let i=0;i<p.count;i++){let x=p.getX(i)+dt*(28+(i%7)*4);if(x>200)x-=400;p.setX(i,x);}p.needsUpdate=true;}}
    // the screen, a few times a second, while anyone could be looking at it
    if(frameN%5===0&&camera.position.y<10&&camera.position.y>-60&&mode!=='field'){const pc=PL.constant,fd=scene.fog.density;PL.constant=1e7;scene.fog.density=fd*0.6;renderer.setRenderTarget(rt);renderer.render(scene,scam);scene.fog.density=fd;renderer.setRenderTarget(null);PL.constant=pc;}
    face.update();
    // the stair's people, and a porter's run
    if(EV.porter){const e=EV.porter;e.t+=dt;e.L=Math.min(110,e.L+dt*(0.1+0.5*Math.min(1,Math.max(0,(e.t-12)/10))*Math.min(1,Math.max(0,(110-e.L)/3))));if(e.L>=110&&!e.done){e.done=true;e.end=e.t;say('Delivered to supply, level 110. Most of a day\'s walk down, in a few minutes.');}if(e.done&&e.t-e.end>3){EV.porter=null;go('Supply');}}
    // the stair is busiest at the change of shift, quiet at night
    life.walkers.active=Math.round(150*Math.min(1,activity(hour)*1.1));life.walkers.tick(t,dt,EV.porter);
    crowd.tick(camera,hour,t,dt,mode!=='field');
    // the digger: it wakes when asked, shaking the ground near it while it cuts
    {if(EV.dig){EV.dig.t+=dt;if(EV.dig.t>64)EV.dig=null;}const pc=camera.position;dig.group.visible=pc.y<yL(125)||mode==='cut';
      const cut=dig.tick(t,dt,EV.dig?EV.dig.t:null,camera),h=dig.headAt(),dd=Math.hypot(pc.x-h.x,pc.y-h.y,pc.z-h.z),amp=cut*0.05*Math.max(0,1-dd/90);
      root.position.set(amp?(Math.random()-0.5)*amp:0,amp?(Math.random()-0.5)*amp:0,amp?(Math.random()-0.5)*amp:0);}
    // the cleaning
    if(EV.clean){const e=EV.clean;e.t+=dt;const blink=Math.sin(e.t*7)>0?1:0.25;AIRM.color.setScalar(blink);
      const din=doors.inner,dout=doors.outer;
      din.position.y=din.userData.y0+(e.t<6?3.4:e.t<10?3.4*(1-ease((e.t-6)/4)):0);
      dout.position.y=dout.userData.y0+(e.t<18?0:e.t<22?3.4*ease((e.t-18)/4):e.t<40?3.4:3.4*(1-ease((e.t-40)/4)));
      if(e.t>3&&e.t<6.2){life.suit.visible=true;life.suit.position.copy(suitPath[0]);life.suit.rotation.y=-AIRLOCK;}
      {const g=doors.gas,p=doors.gp,on=e.t>10&&e.t<19;g.material.opacity=on?0.7*Math.min(1,(e.t-10)/2,(19-e.t)/2):0;
        if(on)for(let i=0;i<p.length/3;i++){const a=AIRLOCK,u=((i*0.618+e.t*0.3)%1);p[i*3]=Math.cos(a)*(52.5+((i*7)%19)/2)+Math.sin(a)*(((i*13)%9)/2-2.2);p[i*3+1]=yL(1)+u*3.6;p[i*3+2]=Math.sin(a)*(52.5+((i*7)%19)/2)-Math.cos(a)*(((i*13)%9)/2-2.2);}
        g.geometry.attributes.position.needsUpdate=true;}
      if(e.t>22){// walking the path, a pause at the lenses to wipe them
        const sp=3.6;let d=(e.t-22)*sp,i=0;const seg=k=>suitPath[k].distanceTo(suitPath[k+1]);
        const wipeAt=suitPath.slice(0,6).reduce((s,_,k)=>k<5?s+seg(k):s,0);if(d>wipeAt)d=Math.max(wipeAt,d-10*sp);
        if(!e.wiped&&d>=wipeAt&&(e.t-22)*sp>wipeAt+9*sp){e.wiped=true;out.grime.opacity=0.06;}
        while(i<suitPath.length-2&&d>seg(i)){d-=seg(i);i++;}const a=suitPath[i],b=suitPath[i+1],u=Math.min(1,d/seg(i));
        const s=life.suit;s.position.lerpVectors(a,b,u);s.position.y=Math.max(s.position.y,s.position.x*s.position.x+s.position.z*s.position.z>110*110?out.ground(s.position.x,s.position.z):s.position.y);
        s.rotation.y=-Math.atan2(b.z-a.z,b.x-a.x);s.position.y+=Math.abs(Math.sin(e.t*5))*0.06;
        if(i===suitPath.length-2&&u>=1){s.scale.y=0.62;if(!e.knelt){e.knelt=e.t;say('At the hill, the one in the suit kneels and does not get up. The screen is clean again.');}}
        if(e.phase===0&&i>=2){e.phase=1;go('The cap and the exit');}
        if(e.phase===1&&e.knelt&&e.t-e.knelt>6){e.phase=2;go('The cafeteria and the screen');}
        if(e.phase===2&&e.t-e.knelt>16){EV.clean=null;AIRM.color.setScalar(1);}}}
    else AIRM.color.setScalar(0.6);
    // flying between views
    if(flight){const f=flight,[B,dur,md]=FLY[f.i],A=FLY[f.i-1][0];f.t+=dt;const u=ease(f.t/dur),lerp=(a,b)=>a+(b-a)*u;
      const daz=((B.az-A.az)%TAU+TAU*1.5)%TAU-TAU/2;
      api.view({az:A.az+daz*u,el:lerp(A.el,B.el),d:Math.exp(lerp(Math.log(A.d),Math.log(B.d))),tx:lerp(A.tx||0,B.tx||0),ty:lerp(A.ty||0,B.ty||0),tz:lerp(A.tz||0,B.tz||0)});
      if(md&&u>0.5&&mode!==md)setMode(md);
      if(f.t>=dur){f.i++;f.t=0;if(f.i>=FLY.length)flight=null;}}
    if(msgT>0)msgT-=dt;
    if(pendingEv&&t>2){const f={cleaning,porter,blackout,storm,digger,fly:intoSilo,lookup:()=>look(1),lookdown:()=>look(-1),eyes:()=>{if(mode==='inside'){fpStart();FP.pitch=0.35;}}}[pendingEv];pendingEv=null;if(f)f();}
    // for the probe: what is happening, and the hour
    if(frameN%30===0){const d=window._details=window._details||{};d.happening=Object.keys(EV).filter(k=>EV[k]).join(',')||'none';d.hour=+hour.toFixed(2);d.mode=mode;d.hud=hudText();d.drawn=crowd.meshes.map(m=>m.count).join(',');}});

  // the opening view (the page sets only az, el and d from view0, so the target is set here, once)
  {let first=true;const hv=/(^|&)(view|v)=/.test(location.hash.slice(1));animHooks.unshift(()=>{if(!first)return;first=false;if(!hv&&C.view0)api.view(C.view0);});}

  // ---- the porter's run takes the camera: it follows them down the stair, a few treads behind and a little above,
  //      looking down the flight past them. Slow at first, then quicker (a day's walk in a few minutes), slowing
  //      again for the landing at supply ----
  const cp=new THREE.Vector3(),cl=new THREE.Vector3();let camInit=false;
  const camFrame=()=>{const e=EV.porter;if(!e){camInit=false;return false;}
    const R0=STAIR.rout,back=life.stairAt(e.L-0.075,R0-1.6,0),p=life.stairAt(e.L,R0-0.8,0),ahead=life.stairAt(e.L+0.09,R0-1.2,0);
    const want=new THREE.Vector3(back.x,back.y+2.1,back.z),look=new THREE.Vector3((p.x+ahead.x)/2,(p.y+ahead.y)/2+0.9,(p.z+ahead.z)/2);
    if(!camInit){cp.copy(want);cl.copy(look);camInit=true;}else{cp.lerp(want,0.25);cl.lerp(look,0.3);}
    camera.position.copy(cp);camera.up.set(0,1,0);camera.lookAt(cl);if(camera.near>0.3){camera.near=0.3;camera.updateProjectionMatrix();}return true;};

  // ---- looking straight up or down the shaft: U and J (or the buttons, or a double-click inside the silo) carry the
  //      camera to the stair's eye at its height and turn it to the axis; L levels it again. The camera is set by
  //      yaw and pitch (never by lookAt at the pole), so it cannot roll or spin; a drag while snapped turns and tilts it ----
  const LK={on:false,back:false,dir:1,yaw:0,pitch:0,t:1,pos:new THREE.Vector3(),p0:new THREE.Vector3(),q0:new THREE.Quaternion(),qt:new THREE.Quaternion(),e:new THREE.Euler(0,0,0,'YXZ'),last:0};
  function look(dir){EV.porter=null;flight=null;if(mode!=='inside')setMode('inside');
    const p=camera.position,y=Math.max(yL(NL)+1.7,Math.min(yL(1)+1.7,p.y)),f=new THREE.Vector3();camera.getWorldDirection(f);
    if(Math.hypot(f.x,f.z)>1e-3)LK.yaw=Math.atan2(-f.x,-f.z);
    LK.p0.copy(p);LK.q0.copy(camera.quaternion);LK.pos.set(0,y,0);LK.dir=dir;LK.pitch=dir*Math.PI/2;LK.t=0;LK.on=true;LK.back=false;
    api.view({az:LK.yaw,el:0,d:2,tx:0,ty:y,tz:0});}
  function level(){if(!LK.on)return;LK.p0.copy(camera.position);LK.q0.copy(camera.quaternion);LK.pos.copy(camera.position);LK.pitch=0;LK.t=0;LK.back=true;}
  const lookFrame=now=>{if(!LK.on)return false;const dt=Math.min(0.1,(now-(LK.last||now))/1000);LK.last=now;
    LK.t=Math.min(1,LK.t+dt/0.6);const u=LK.t<0.5?2*LK.t*LK.t:1-Math.pow(-2*LK.t+2,2)/2;
    LK.e.set(LK.pitch,LK.yaw,0,'YXZ');LK.qt.setFromEuler(LK.e);
    camera.position.lerpVectors(LK.p0,LK.pos,u);camera.quaternion.slerpQuaternions(LK.q0,LK.qt,u);
    if(camera.near>0.3){camera.near=0.3;camera.updateProjectionMatrix();}
    if(LK.back&&LK.t>=1){// back to the eyes: the same spot, looking the same way, level
      LK.on=false;FP.pos.copy(camera.position);FP.yaw=LK.yaw;FP.pitch=0;FP.vy=null;FP.on=true;FP.last=0;}
    return true;};
  {const cv=renderer.domElement;let px=null,py=null;
    cv.addEventListener('pointerdown',e=>{px=e.clientX;py=e.clientY;});cv.addEventListener('pointerup',()=>{px=null;});
    cv.addEventListener('pointermove',e=>{if(px===null||!LK.on||LK.back||LK.t<1)return;const dx=e.clientX-px,dy=e.clientY-py;px=e.clientX;py=e.clientY;
      LK.yaw-=dx*0.005*LK.dir;LK.pitch=LK.dir*Math.PI/2;   // held square up (or down): a drag turns the view round the axis, never tilts it
      LK.e.set(LK.pitch,LK.yaw,0,'YXZ');camera.quaternion.setFromEuler(LK.e);LK.q0.copy(camera.quaternion);});
    cv.addEventListener('dblclick',()=>{const p=camera.position;if(mode==='inside'&&Math.hypot(p.x,p.z)<RO&&p.y<yL(1)+4&&p.y>yL(NL))look(1);});
    addEventListener('keydown',e=>{const t=e.target;if(t&&(t.tagName==='INPUT'||t.tagName==='TEXTAREA'||t.isContentEditable)||e.ctrlKey||e.metaKey||e.altKey)return;
      const kk=e.key.toLowerCase();if(kk==='u')look(1);else if(kk==='j')look(-1);else if(kk==='l')level();else if(kk==='t')faster();});}

  // ---- inside the silo the camera is a pair of eyes, not a turntable: a drag looks round from where it stands with
  //      the horizon always level (no roll, never quite straight up or down, so it cannot flip); W/S walk the way it
  //      faces along the floor, A/D step aside, E climbs a level and Q drops one (or Page Up/Down), the wheel walks,
  //      Shift hurries. Esc, a chosen view or leaving 'inside' hands the camera back to the turntable. ----
  const FP={on:false,yaw:0,pitch:0,pos:new THREE.Vector3(),e:new THREE.Euler(0,0,0,'YXZ'),keys:new Set(),vy:null,last:0};
  const fpStart=()=>{const f=new THREE.Vector3();camera.getWorldDirection(f);if(Math.hypot(f.x,f.z)>1e-4)FP.yaw=Math.atan2(-f.x,-f.z);
    FP.pitch=Math.max(-1.3,Math.min(1.3,Math.asin(Math.max(-1,Math.min(1,f.y)))));FP.pos.copy(camera.position);FP.vy=null;FP.on=true;FP.last=0;};
  const fpStop=()=>{if(!FP.on)return;FP.on=false;const fx=-Math.sin(FP.yaw)*Math.cos(FP.pitch),fy=Math.sin(FP.pitch),fz=-Math.cos(FP.yaw)*Math.cos(FP.pitch),d=6,p=FP.pos;
    api.view({az:Math.atan2(-fz,-fx),el:Math.max(-1.4,Math.min(1.4,-Math.asin(fy))),d,tx:p.x+fx*d,ty:p.y+fy*d,tz:p.z+fz*d});};
  const fpFrame=now=>{if(!FP.on)return false;if(mode!=='inside'||LK.on||EV.porter||flight){FP.on=false;return false;}
    const dt=Math.min(0.1,(now-(FP.last||now))/1000);FP.last=now;const K_=FP.keys,sp=(K_.has('shift')?16:4.5)*dt,fx=-Math.sin(FP.yaw),fz=-Math.cos(FP.yaw);
    let mx=0,mz=0;if(K_.has('w')){mx+=fx;mz+=fz;}if(K_.has('s')){mx-=fx;mz-=fz;}if(K_.has('d')){mx-=fz;mz+=fx;}if(K_.has('a')){mx+=fz;mz-=fx;}
    const ml=Math.hypot(mx,mz);if(ml>0){FP.pos.x+=mx/ml*sp;FP.pos.z+=mz/ml*sp;}
    if(FP.vy!=null){const dy=FP.vy-FP.pos.y;FP.pos.y+=Math.sign(dy)*Math.min(Math.abs(dy),dt*Math.max(3,Math.abs(dy)*4));if(Math.abs(dy)<0.01)FP.vy=null;}
    FP.e.set(FP.pitch,FP.yaw,0,'YXZ');camera.position.copy(FP.pos);camera.up.set(0,1,0);camera.quaternion.setFromEuler(FP.e);
    if(camera.near>0.2){camera.near=0.2;camera.updateProjectionMatrix();}return true;};
  const climb=dir=>{if(!FP.on)fpStart();const n=Math.max(1,Math.min(NL,levelAt(FP.pos.y)-dir));FP.vy=yL(n)+1.7;};
  {const cv=renderer.domElement;let px=null,py=null;
    cv.addEventListener('pointerdown',e=>{if(mode!=='inside'||LK.on||EV.porter||flight||e.button!==0||e.shiftKey)return;if(!FP.on)fpStart();px=e.clientX;py=e.clientY;});
    addEventListener('pointerup',()=>{px=null;});
    cv.addEventListener('pointermove',e=>{if(px===null||!FP.on)return;const dx=e.clientX-px,dy=e.clientY-py;px=e.clientX;py=e.clientY;
      FP.yaw-=dx*0.0045;FP.pitch=Math.max(-1.3,Math.min(1.3,FP.pitch-dy*0.0045));});
    cv.addEventListener('wheel',e=>{if(!FP.on)return;const s=-Math.sign(e.deltaY)*Math.min(4,Math.abs(e.deltaY)*0.01+0.5);FP.pos.x+=-Math.sin(FP.yaw)*s;FP.pos.z+=-Math.cos(FP.yaw)*s;},{passive:true});
    const kname=e=>e.key==='Shift'?'shift':e.key.toLowerCase();
    addEventListener('keydown',e=>{const t=e.target;if(t&&(t.tagName==='INPUT'||t.tagName==='TEXTAREA'||t.isContentEditable)||e.ctrlKey||e.metaKey||e.altKey)return;
      const k=kname(e);if(mode!=='inside'||LK.on)return;
      if('wasd'.includes(k)&&k.length===1){if(!FP.on)fpStart();FP.keys.add(k);}else if(k==='shift')FP.keys.add(k);
      else if(k==='e'||k==='pageup'){climb(1);e.preventDefault();}else if(k==='q'||k==='pagedown'){climb(-1);e.preventDefault();}
      else if(k==='escape'&&FP.on)fpStop();});
    addEventListener('keyup',e=>FP.keys.delete(kname(e)));addEventListener('blur',()=>FP.keys.clear());}
  // which way the eyes look, for the readout: up or down from level, so a view never loses which way is up
  const facing=()=>{const f=new THREE.Vector3();camera.getWorldDirection(f);const deg=Math.round(Math.asin(Math.max(-1,Math.min(1,f.y)))*180/Math.PI);
    return Math.abs(deg)<4?'looking level':deg>0?'looking '+deg+'° up':'looking '+(-deg)+'° down';};

  const hh=()=>{const h=Math.floor(hour),m=Math.floor((hour-h)*60);return String(h).padStart(2,'0')+':'+String(m).padStart(2,'0')+(speedI?' (×'+SPEEDS[speedI]+')':'');};
  setMode((C.view0&&C.view0.mode)||'cut');
  {const vn=(H.get('view')||'').toLowerCase();for(const [n,v] of Object.entries(views))if(n.toLowerCase()===vn){if(v.mode)setMode(v.mode);if(v.fly)pendingFly=true;}
    if(H.has('mode'))setMode(H.get('mode'));}
  // a happening from the address (#event=cleaning, porter, blackout, storm), once the page is up
  pendingEv=H.get('event')||(pendingFly?'fly':null);
  api.ctx.details=Object.assign(api.ctx.details||{},{levels:NL,chunks:chunks.length,residents:crowd.total,silos:out.silos.length});
  return {radius:700,minD:2,adaptiveNear:true,pick:picks,group:root,
    onView:(name,v)=>{flight=null;LK.on=false;FP.on=false;if(EV.porter)EV.porter=null;if(v.silo){const s=out.silos.find(q=>q.n===v.silo);if(s){v.tx=s.x;v.tz=s.z;}}if(v.mode)setMode(v.mode);
      if(v.fly)setTimeout(flyIn,0);},
    camFrame:now=>lookFrame(now)||fpFrame(now)||camFrame(now),ownsInput:()=>!!EV.porter||LK.on||FP.on,
    hashExtra:()=>'&mode='+mode,
    buttons:{'Cutaway':()=>setMode(mode==='cut'?'inside':'cut'),'The field':()=>{if(mode==='field')go('Silo 18 in section');else go('The field of fifty silos');},
      'Into Silo 18':intoSilo,'Look up (U)':()=>look(1),'Look down (J)':()=>look(-1),'Level (L)':level,'Clock speed (T)':()=>faster(),
      'A cleaning':cleaning,'A porter\'s run':porter,'Generator failure':blackout,'Dust storm':storm,'The digger wakes':digger},
    hud:()=>hudText()};
  function hudText(){{if(msgT>0)return msg;const p=camera.position,r=Math.hypot(p.x,p.z);
      if(mode==='field')return 'The field: fifty silos · Silo 18 in amber, Silo 1 in blue · '+hh();
      if(p.y>-2)return 'Silo 18 · on the surface'+(r>RC?', '+Math.round(r)+' m out':'')+' · '+hh()+(EV.storm?' · dust storm':'');
      if(p.y<yL(NL)-2||(p.y<yL(141)&&r>RO+0.5))return 'Silo 18 — '+dig.where(p)+' · '+hh()+(EV.dig?' · the digger is cutting':'');
      const n=levelAt(p.y),lf=lightF(hour);
      return 'Silo 18 — '+(n>NL?'the mines':'level '+Math.max(1,n)+', '+placeName(Math.max(1,n))+' · '+crowd.count(Math.max(1,n))+' residents')+(mode==='inside'?' · '+facing():'')+(r>RO?' (in section)':'')+' · '+hh()+' · '+(EV.dark&&n>96?'blackout':lf>0.9?'lights full':lf<0.35?'night lights':'lights dimming');}}
}
