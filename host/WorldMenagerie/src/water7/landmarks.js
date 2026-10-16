// Water 7: the shapes the city is known by, on the shared landmark kit (src/core/landkit.js), each placed from its
// entry in water7.json. Fan work after Eiichiro Oda's One Piece; the geometry is this project's own.
//
//   fountain   the Great Fountain on top of the city: basins in tiers on arcades, a jet from the top, the water
//              falling from each basin into the one under it; lit at night
//   galleyla   the Galley-La Company's headquarters on Up Town: a long block of offices under a clock tower
//   dock       a Galley-La dock: the gate over its mouth with the number on it, a gantry crane over the slipway,
//              a ship in frame on the ways
//   station    Blue Station and the sea train's track: rails on a trestle laid on the sea, out to the horizon
//   franky     Franky House on Scrap Island: a shack of salvage with its sign, the junk round it
//   merry      the Going Merry: a caravel with a ram's head, one mast, a lateen-and-square sail with the jolly roger
//   sunny      the Thousand Sunny: a brig with the lion's head, the lawn on its deck, the crow's nest
import {landkit} from '../core/landkit.js';

export function landmarks(api){
  const {THREE,animHooks,gh,nightF,hour}=api;
  const {Model,mat,turn}=landkit(api,{whiteStone:0xf2ece0,cream:0xe8dcc0,terracotta:0xc8503a,blueTile:0x3a6aa8,water:0x3aa0d8,gold:0xe0b040,
    steel:0x8a9096,rust:0x8a4a32,wood:0x8a5a3a,woodDark:0x5a3a24,sail:0xf4f0e6,black:0x1a1a1c,sheep:0xf8f6f0,lion:0xf0c020,mane:0xe07020,lawn:0x5aa040,
    red:0xc8302a,glass:0x2a4050,signRed:0xb8302a,junk:0x6a6a6e,green:0x3a8a5a,crate:0x9a7a52,brickRed:0x9a4a32,adam:0x4a2e1c});
  const V3=THREE.Vector3,Q=new THREE.Quaternion(),E=new THREE.Euler(),UP=new V3(0,0,1);
  function beam(M,k,a,b,t){const d=new V3().subVectors(b,a),len=d.length();if(len<0.01)return;Q.setFromUnitVectors(UP,d.normalize());E.setFromQuaternion(Q,'YXZ');
    M.put(k,new THREE.BoxGeometry(t,t,len),(a.x+b.x)/2,(a.y+b.y)/2,(a.z+b.z)/2,E.y,E.x,E.z);}
  const waterMat=()=>{const m=new THREE.MeshPhongMaterial({color:0x5ab8e8,emissive:0x0a2a3a,transparent:true,opacity:0.78,shininess:80,specular:0xffffff,depthWrite:false});return m;};
  // a ship's hull: a box with a pointed bow (along +x) and a raised stern
  function hull(M,k,L,B,D,y=0){const s=new THREE.Shape();s.moveTo(-L/2,-B/2);s.lineTo(L*0.25,-B/2);s.quadraticCurveTo(L*0.45,-B*0.35,L/2,0);s.quadraticCurveTo(L*0.45,B*0.35,L*0.25,B/2);s.lineTo(-L/2,B/2);s.closePath();
    M.put(k,new THREE.ExtrudeGeometry(s,{depth:D,bevelEnabled:false}).rotateX(-Math.PI/2),0,y,0);}

  return {

  // ================================================================ the Great Fountain
  // The city is a fountain, and this is its head: a stack of basins on arcades over a pool two hundred metres across,
  // each spilling a curtain of water into the one under it; a column up the middle to a gilded crown, and out of the
  // crown the jet, three hundred metres of it, falling back as spray into the top basins; eight arcs of water from the
  // second basin into the pool; from the pool's rim eight runnels across Up Town to the heads of the grand canals.
  // Lit from below at night. (Built in metres: L.scale stretches it.)
  fountain(L,x,z){const g0=gh(x,z),M=Model(),SC=L.scale||1,T=[[190,0,4],[132,4,22],[92,26,20],[62,46,18],[38,64,16],[20,80,14]],TOPY=94;
    for(let i=0;i<T.length;i++){const [r,y,h]=T[i];
      M.cyl('whiteStone',0,y,0,r,r,h>4?2.2:1.8,64);M.put('cream',new THREE.TorusGeometry(r+0.6,1.3,8,96).rotateX(Math.PI/2),0,y+(h>4?2.4:2.0),0);   // the basin, its moulded lip
      if(i>0){const n=Math.round(r*2*Math.PI/9),rr=r*0.7,base=T[i-1][1]+2.2;for(let k=0;k<n;k++){const a=k/n*Math.PI*2;M.cyl('cream',Math.cos(a)*rr,base,Math.sin(a)*rr,1.6,1.4,y-base,12);}   // the arcade under it
        M.cyl('blueTile',0,y-2.6,0,rr+2.4,rr+2.4,2.6,64);M.cyl('gold',0,y-2.9,0,rr+2.5,rr+2.5,0.35,64);}}                     // the frieze over the arcade
    M.cyl('cream',0,80,0,8,11,14,24);for(let k=0;k<8;k++){const a=k/8*Math.PI*2;M.cyl('whiteStone',Math.cos(a)*10,80,Math.sin(a)*10,1.1,1.1,14,10);}   // the pedestal on the top basin
    M.cyl('cream',0,94,0,9,10,6,24);M.cyl('whiteStone',0,100,0,6,8,10,24);M.cyl('gold',0,110,0,9,5,4,24);                  // the column and its crown
    for(let k=0;k<12;k++){const a=k/12*Math.PI*2;M.put('gold',new THREE.ConeGeometry(1.2,6,6),Math.cos(a)*8.4,115,Math.sin(a)*8.4);}
    for(let k=0;k<8;k++){const a=(22.5+45*k)*Math.PI/180;for(const s of [-1,1])M.box('whiteStone',Math.cos(a)*240-Math.sin(a)*s*7,0,Math.sin(a)*240+Math.cos(a)*s*7,1.6,1.4,104,-a);}   // the runnels' kerbs
    const g=M.finish(L,x,g0,z,0);g.scale.setScalar(SC);
    // ---- the water: curtains, pools, the jet and its plume, the arcs, the runnels ----
    const sheetTex=(()=>{const c=document.createElement('canvas');c.width=64;c.height=256;const k=c.getContext('2d');k.fillStyle='#bfe6f6';k.fillRect(0,0,64,256);
      for(let i=0;i<220;i++){k.fillStyle=`rgba(255,255,255,${0.2+Math.random()*0.6})`;k.fillRect(Math.random()*64,Math.random()*256,1+Math.random()*2,8+Math.random()*40);}
      const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;return t;})();
    const W=new THREE.MeshPhongMaterial({color:0x8ad0f0,emissive:0x0a2a3a,transparent:true,opacity:0.8,shininess:90,specular:0xffffff,depthWrite:false,side:THREE.DoubleSide});
    // each water its own way: the curtains fall (their streaks running down), the jet rises, the arcs and the runnels run
    // along their length (streaks lengthwise, from the basin's lip to the pool, from the pool out to the canals)
    const jetTex=sheetTex.clone();jetTex.needsUpdate=true;jetTex.repeat.set(6,3);
    const flowTex=(()=>{const c=document.createElement('canvas');c.width=256;c.height=64;const k=c.getContext('2d');k.fillStyle='#bfe6f6';k.fillRect(0,0,256,64);
      for(let i=0;i<220;i++){k.fillStyle=`rgba(255,255,255,${0.2+Math.random()*0.6})`;k.fillRect(Math.random()*256,Math.random()*64,8+Math.random()*40,1+Math.random()*2);}
      const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(4,1);return t;})();
    const wm=map=>new THREE.MeshPhongMaterial({color:0xe8f6ff,map,emissive:0x0a2a3a,transparent:true,opacity:0.82,shininess:60,depthWrite:false,side:THREE.DoubleSide});
    const Wf=wm(sheetTex),Wj=wm(jetTex),Wa=wm(flowTex);sheetTex.repeat.set(40,1);
    const tagW=m=>{m.userData.noFingerprint=true;m.userData.noWire=true;g.add(m);return m;};
    for(let i=0;i<T.length;i++){const [r,y]=T[i];tagW(new THREE.Mesh(new THREE.CircleGeometry(r-0.5,72).rotateX(-Math.PI/2),W)).position.y=y+(i?2.0:1.6);
      if(i>0){const below=T[i-1],h=y+2.2-(below[1]+1.8),sh=tagW(new THREE.Mesh(new THREE.CylinderGeometry(r+1.6,r+3.4,h,96,1,true),Wf));sh.position.y=below[1]+1.8+h/2;}}
    const jet=tagW(new THREE.Mesh(new THREE.CylinderGeometry(4,10,190,24,1,true),Wj));jet.position.y=117+95;
    const core=tagW(new THREE.Mesh(new THREE.CylinderGeometry(2,5.5,200,16,1,true),W));core.position.y=117+100;
    // eight arcs from the second basin's lip out into the pool
    const arcs=[];for(let k=0;k<8;k++){const a=k/8*Math.PI*2,p0=new THREE.Vector3(Math.cos(a)*134,7,Math.sin(a)*134),p2=new THREE.Vector3(Math.cos(a)*176,1.8,Math.sin(a)*176),p1=new THREE.Vector3(Math.cos(a)*158,30,Math.sin(a)*158);
      const tube=tagW(new THREE.Mesh(new THREE.TubeGeometry(new THREE.QuadraticBezierCurve3(p0,p1,p2),24,1.4,8),Wa));arcs.push(tube);}
    // the runnels: water across the square to each grand canal's head
    for(let k=0;k<8;k++){const a=(22.5+45*k)*Math.PI/180,m=tagW(new THREE.Mesh(new THREE.PlaneGeometry(104,12).rotateX(-Math.PI/2),Wa));m.position.set(Math.cos(a)*242,0.9,Math.sin(a)*242);m.rotation.y=-a;}
    // the plume: spray thrown up and out of the jet, falling back into the basins
    const NP=900,ppos=new Float32Array(NP*3),pg=new THREE.BufferGeometry();pg.setAttribute('position',new THREE.BufferAttribute(ppos,3));
    const mist=(()=>{const c=document.createElement('canvas');c.width=c.height=64;const k=c.getContext('2d'),gr=k.createRadialGradient(32,32,0,32,32,32);gr.addColorStop(0,'rgba(255,255,255,0.9)');gr.addColorStop(0.5,'rgba(240,250,255,0.35)');gr.addColorStop(1,'rgba(240,250,255,0)');k.fillStyle=gr;k.fillRect(0,0,64,64);return new THREE.CanvasTexture(c);})();
    const pm=new THREE.Points(pg,new THREE.PointsMaterial({map:mist,size:14,sizeAttenuation:true,transparent:true,depthWrite:false,opacity:0.75})),P=[];
    for(let i=0;i<NP;i++)P.push({t:Math.random()*7,a:Math.random()*6.28,v:3+Math.random()*15,u:Math.random()*12});pm.frustumCulled=false;tagW(pm);
    // the lights under the water at night
    const lights=[];for(let k=0;k<6;k++){const a=k/6*Math.PI*2,lt=new THREE.PointLight(0x7ac8ff,0,320,1.6);lt.position.set(Math.cos(a)*60,30,Math.sin(a)*60);g.add(lt);lights.push(lt);}
    let last=0;animHooks.push(now=>{const t=now/1000,dt=last?Math.min(0.1,t-last):0;last=t;sheetTex.offset.y=t*0.9;jetTex.offset.y=-t*1.4;flowTex.offset.x=-t*0.8;
      const pulse=0.92+0.08*Math.sin(t*1.7)+0.04*Math.sin(t*4.3);jet.scale.set(1,pulse,1);jet.position.y=117+95*pulse;core.scale.set(1,pulse,1);core.position.y=117+100*pulse;
      const top=117+190*pulse;
      for(let i=0;i<NP;i++){const p=P[i];p.t+=dt;if(p.t>7){p.t=0;p.a=Math.random()*6.28;p.v=4+Math.random()*16;p.u=Math.random()*10;}
        const r=p.v*p.t,y=top+p.u*p.t-4.9*p.t*p.t;ppos[i*3]=Math.cos(p.a)*r;ppos[i*3+1]=y<TOPY?-1e4:y;ppos[i*3+2]=Math.sin(p.a)*r;}
      pg.attributes.position.needsUpdate=true;
      const n=nightF(hour());W.emissive.setRGB(0.04+n*0.2,0.16+n*0.4,0.24+n*0.55);for(const m of [Wf,Wj,Wa])m.emissive.setRGB(0.04+n*0.3,0.16+n*0.5,0.24+n*0.7);for(let k=0;k<lights.length;k++){const lt=lights[k];lt.intensity=n*2.6;lt.color.setHSL(((t*0.02+k/lights.length)%1),0.7,0.6);}});   // cycling through the colours at night
    return g;},

  // ================================================================ the Galley-La Company
  galleyla(L,x,z){const g0=gh(x,z),M=Model(),W=L.width||70,D=L.depth||36;
    M.box('whiteStone',0,0,0,D,22,W);for(const s of [-1,1]){M.box('whiteStone',0,0,s*(W/2+8),D-6,18,16);M.cyl('terracotta',0,18,s*(W/2+8),12,0.5,7,4,Math.PI/4);}
    M.cyl('terracotta',0,22,0,Math.hypot(D,W)/2*0.72,0.5,9,4,Math.PI/4);
    for(let u=-W/2+3;u<=W/2-3;u+=4)for(const h of [3,8.5,14])M.box('glass',D/2+0.06,h,u,0.1,3,1.8);
    // the clock tower over the entrance, and the company's mark on it
    M.box('whiteStone',D/2-2,0,0,12,40,12);M.cyl('blueTile',D/2-2,40,0,8,0.4,10,4,Math.PI/4);M.put('cream',new THREE.CylinderGeometry(3,3,0.3,24).rotateZ(Math.PI/2),D/2+4.1,33,0);
    M.box('signRed',D/2+4.15,24,0,0.2,4,9);M.box('glass',D/2+4.2,0,0,0.2,6,5);
    return M.finish(L,x,g0,z,turn(L.face||0));},

  // ================================================================ a Galley-La dock
  // A dock in the sea wall's line: the gate towers either side of its mouth and the beam over it, its number painted
  // big on a red board, Galley-La's flags; inland, a slipway down into the basin with a ship on it at whatever stage
  // the dock has her (L.stage: 0 the keel and ribs, 1 half planked, 2 planked and masted), her scaffolding, two jib
  // cranes slewing over her (each with its load), stacks of timber on the quays.
  dock(L,x,z){const g0=0.7,M=Model(),W=L.width||80,N=L.number||1,stage=L.stage??(N===1?2:(N%3)),big=N===1;
    for(const s of [-1,1]){M.box('whiteStone',0,-2,s*(W/2+6),12,34,12);M.cyl('terracotta',0,32,s*(W/2+6),8.5,0.4,7,4,Math.PI/4);
      M.cyl('woodDark',0,32,s*(W/2+6),0.25,0.25,16,6);M.box('signRed',0.2,42,s*(W/2+6)+s*2.4,0.15,3,4.6);}                    // the flags on the towers
    M.box('whiteStone',0,24,0,8,8,W+12);M.box('whiteStone',0,31.6,0,9,1.2,W+14);
    // the basin's walls: stone from the gate back to the dock's head, so the dock is a clean cut in the quay
    for(const s of [-1,1])M.box('whiteStone',-176,-10,s*(W/2+1.2),336,13.6,2.4);M.box('whiteStone',-345,-10,0,2.4,13.6,W+4.8);
    for(const s of [-1,1])M.box('cream',-176,3.4,s*(W/2+1.2),336,0.6,3);
    // the slipway: a timber ramp from the inland end down into the basin, the ways on it
    const SL=big?170:120,S0=-60-SL,HS=6.5,HE=-3,pitch=Math.atan2(HS-HE,SL);
    M.put('wood',new THREE.BoxGeometry(SL,1.2,big?30:22),S0+SL/2,(HS+HE)/2-0.6,0,0,0,-pitch);for(const s of [-1,1])M.put('woodDark',new THREE.BoxGeometry(SL,0.6,1.2),S0+SL/2,(HS+HE)/2+0.2,s*(big?6:4.5),0,0,-pitch);
    for(let u=S0+6;u<S0+SL;u+=12){const y=HS-(u-S0)/SL*(HS-HE);M.box('woodDark',u,y-14,-(big?12:9),1,14,1);M.box('woodDark',u,y-14,(big?12:9),1,14,1);}
    // the ship on the ways: lofted hull sections; frames, planking, deck, masts by stage
    const Ls=big?92:62,Bs=big?20:14,Ds=big?13:9.5,kx=S0+SL*0.55,ky=HS-(kx-S0)/SL*(HS-HE)+1.2,NS=28;
    const half=t=>Bs/2*Math.pow(Math.max(0,Math.sin(Math.PI*Math.min(1,0.08+t*0.92))),0.55)*(t<0.2?0.82+t*0.9:1),sec=(t,th)=>[half(t)*Math.sin(th),Ds*(1-Math.cos(th))];
    const P=(t,th)=>{const [w,y]=sec(t,th);return new THREE.Vector3(kx-Ls/2+t*Ls,ky+y+Math.sin(-pitch)*(t-0.5)*Ls,w);};
    const MS=Model();   // the ship is her own group (api.DOCKSHIPS), so a launch can send her down the ways
    for(let i=0;i<=NS;i++){const t=i/NS;for(let j=-6;j<6;j++){const a=j/6*Math.PI/2,b=(j+1)/6*Math.PI/2;beam(MS,'woodDark',P(t,a),P(t,b),0.45);}}       // the ribs
    beam(MS,'woodDark',P(0,0),P(1,0),1.2);                                                                                              // the keel
    if(stage>=1){const top=stage>=2?Math.PI/2:Math.PI/3.2,geo=new THREE.BufferGeometry(),pos=[],idx=[],NJ=10,NI=40;
      for(let i=0;i<=NI;i++)for(let j=0;j<=NJ;j++){const p=P(i/NI,-top+2*top*j/NJ);pos.push(p.x,p.y,p.z);}
      for(let i=0;i<NI;i++)for(let j=0;j<NJ;j++){const a=i*(NJ+1)+j,b=a+NJ+1;idx.push(a,b,a+1,b,b+1,a+1);}
      geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geo.setIndex(idx);geo.computeVertexNormals();MS.put('wood',geo.toNonIndexed());}
    if(stage>=2){MS.put('wood',new THREE.BoxGeometry(Ls*0.86,0.5,Bs*0.86),kx,ky+Ds-0.2,0,0,0,-pitch);MS.box('woodDark',kx-Ls*0.36,ky+Ds,0,Ls*0.18,5,Bs*0.82);
      for(const [u,h] of [[-0.2,big?40:28],[0.08,big?46:32],[0.32,big?30:22]]){MS.cyl('woodDark',kx+u*Ls,ky+Ds-2,0,0.7,0.45,h,8);MS.box('woodDark',kx+u*Ls,ky+Ds+h*0.7,0,0.5,0.5,Bs*0.9);}}
    // the scaffolding: poles in rows down both sides, a deck of planks at each lift
    const ph=stage>=2?Ds+3:Ds+1;for(const s of [-1,1])for(let u=-Ls/2+3;u<=Ls/2-3;u+=6){const px=kx+u,py=ky+Math.sin(-pitch)*u-2,pz=s*(Bs/2+2.6);
      M.cyl('woodDark',px,py,pz,0.18,0.18,ph+3,5);for(let l=1;l*3.4<ph;l++)M.box('wood',px,py+l*3.4,pz,6.2,0.25,1.6);}
    // the timber on the quays, either side of the basin
    for(const s of [-1,1])for(let k=0;k<5;k++){const u=S0+20+k*24;for(let r=0;r<3;r++)for(let c=0;c<4-r;c++)M.put('wood',new THREE.CylinderGeometry(0.5,0.5,14,8).rotateZ(Math.PI/2),u,4.2+r*0.9,s*(W/2+16+c*1.05+r*0.5));}
    const g=M.finish(L,x,g0,z,turn(L.face||0)),sg=MS.finish(L,0,0,0,0);g.add(sg);
    // the number, painted on its board over the gate (both faces)
    const nb=(()=>{const c=document.createElement('canvas');c.width=256;c.height=128;const k=c.getContext('2d');k.fillStyle='#b8302a';k.fillRect(0,0,256,128);k.strokeStyle='#f4e8c8';k.lineWidth=8;k.strokeRect(6,6,244,116);
      k.fillStyle='#f8f0dc';k.font='bold 92px Georgia, serif';k.textAlign='center';k.textBaseline='middle';k.fillText(String(N),128,68);return new THREE.CanvasTexture(c);})();
    for(const sd of [-1,1]){const m=new THREE.Mesh(new THREE.PlaneGeometry(Math.min(30,W*0.36),Math.min(15,W*0.18)),new THREE.MeshLambertMaterial({map:nb}));m.position.set(sd*4.2,28,0);m.rotation.y=sd*Math.PI/2;m.userData.noFingerprint=true;g.add(m);}
    // the cranes: a lattice tower each side, the jib slewing over the ship, a load swinging on its line
    const cranes=[];for(const s of [-1,1]){const cx2=kx+s*Ls*0.22,cz2=s*(W/2-6),H=big?52:40,cr=new THREE.Group(),steel=new THREE.MeshLambertMaterial({color:0x8a4a32});
      for(const [dx,dz] of [[-1.6,-1.6],[1.6,-1.6],[-1.6,1.6],[1.6,1.6]]){const leg=new THREE.Mesh(new THREE.BoxGeometry(0.5,H,0.5),steel);leg.position.set(dx,H/2,dz);cr.add(leg);}
      for(let h=4;h<H;h+=4){const r1=new THREE.Mesh(new THREE.BoxGeometry(3.7,0.3,0.3),steel);r1.position.set(0,h,-1.6);cr.add(r1);const r2=r1.clone();r2.position.z=1.6;cr.add(r2);}
      const head=new THREE.Group();head.position.y=H;cr.add(head);const jib=new THREE.Mesh(new THREE.BoxGeometry(big?44:34,1.6,1.6),steel);jib.position.x=(big?44:34)/2-8;head.add(jib);
      const cab=new THREE.Mesh(new THREE.BoxGeometry(5,3.4,3.4),new THREE.MeshLambertMaterial({color:0xe8dcc0}));cab.position.set(-4,-1.8,0);head.add(cab);
      const cw=new THREE.Mesh(new THREE.BoxGeometry(4,3,3),new THREE.MeshLambertMaterial({color:0x4a4a4a}));cw.position.set(-9,0,0);head.add(cw);
      const line=new THREE.Mesh(new THREE.CylinderGeometry(0.06,0.06,1,4).translate(0,-0.5,0),new THREE.MeshLambertMaterial({color:0x222222}));head.add(line);
      const load=new THREE.Mesh(new THREE.BoxGeometry(10,1.2,1.4),new THREE.MeshLambertMaterial({color:0x8a5a3a}));head.add(load);
      const turnA=-turn(L.face||0),wx=Math.cos(turnA)*cx2-Math.sin(turnA)*cz2,wz=Math.sin(turnA)*cx2+Math.cos(turnA)*cz2;
      cr.position.set(cx2,g0-0.7+3,cz2);cr.traverse(o=>{o.castShadow=true;o.userData.noFingerprint=true;});g.add(cr);cranes.push({head,line,load,ph:Math.random()*6,s,big});}
    animHooks.push(now=>{const t=now/1000;for(const c of cranes){const a=c.s*(0.6+0.55*Math.sin(t*0.07+c.ph)),r=(c.big?28:20)+6*Math.sin(t*0.05+c.ph),drop=12+10*(0.5+0.5*Math.sin(t*0.11+c.ph*2));
      c.head.rotation.y=a;c.line.position.x=r;c.line.scale.y=drop;c.load.position.set(r,-drop-0.6,0);c.load.rotation.y=Math.sin(t*0.3+c.ph)*0.3;}});
    (api.DOCKSHIPS||(api.DOCKSHIPS={}))[N]={g:sg,dock:g,kx,ky,pitch,Ls,Bs,Ds,SL,W,stage,S0,HS,HE,slipHalf:big?15:11,big};return g;},

  // ================================================================ Blue Station and the sea train's line
  // The station on the quay: its hall under a blue barrel roof, a clock tower, the platform under its canopy, the
  // track out on a trestle across the moat and through the sea wall's gate; past the wall the rails lie on the sea
  // itself (src/water7/life.js lays them, riding the swell). At the line's far end Shift Station, a lighthouse on a
  // platform alone in the sea.
  station(L,x,z){const g0=gh(x,z),M=Model(),len=L.track||2600;
    M.box('whiteStone',0,0,0,40,12,60);M.put('blueTile',new THREE.CylinderGeometry(22,22,70,24,1,false,0,Math.PI).rotateZ(Math.PI/2).rotateY(Math.PI/2),0,12,0);
    M.box('signRed',20.2,8,0,0.2,2.6,18);for(let u=-24;u<=24;u+=6)M.box('glass',20.1,2,u,0.1,5,3);
    M.box('whiteStone',-8,0,34,10,34,10);M.cyl('blueTile',-8,34,34,7.5,0.3,9,4,Math.PI/4);M.put('cream',new THREE.CylinderGeometry(3.2,3.2,0.3,24).rotateZ(Math.PI/2),-2.8,28,34);   // the clock tower
    // the platform and its canopy, the train shed's roof over the track
    M.box('whiteStone',60,0,-4,120,1.4,9);for(let u=10;u<=110;u+=10)M.cyl('steel',u,1.4,-1.2,0.2,0.2,6,6);M.box('blueTile',60,7.4,-6,120,0.5,14);
    for(let u=10;u<=110;u+=20){M.put('steel',new THREE.TorusGeometry(10,0.35,6,20,Math.PI),u,7,-12,Math.PI/2);}
    // the trestle across the moat to the wall's gate
    const TR=Math.max(240,(L.trestle||230));for(let u=10;u<TR;u+=16){M.box('woodDark',u,-8,-15,1.2,9.6,1.2);M.box('woodDark',u,-8,-9,1.2,9.6,1.2);}
    M.box('wood',TR/2,1.2,-12,TR,0.6,7);for(const s of [-0.75,0.75])M.box('steel',TR/2,1.8,-12+s,TR,0.25,0.16);
    // Shift Station at the end of the line: the platform on piles, the keepers' house, the lighthouse and its lamp
    {const u=len-40,zz=-12;M.box('whiteStone',u,-6,zz-14,40,8,16);M.box('cream',u-8,2,zz-16,12,7,9);M.cyl('terracotta',u-8,9,zz-16,8,0.4,4,4,Math.PI/4);
      M.cyl('whiteStone',u+10,2,zz-18,3.2,2.6,24,16);for(let k=0;k<6;k++)M.cyl(k%2?'whiteStone':'signRed',u+10,2+k*4,zz-18,3.25-k*0.1,3.2-k*0.1,4,16);
      M.cyl('glass',u+10,26,zz-18,2.2,2.2,3,12);M.cyl('signRed',u+10,29,zz-18,2.6,0.3,2.4,12);M.box('signRed',u-14,2,zz-7,0.5,6,0.5);M.box('gold',u-14,8,zz-7,1,1.6,1);}
    const g=M.finish(L,x,g0,z,turn(L.face||0));
    const lamp=new THREE.PointLight(0xfff0c0,0,900,1.4);lamp.position.set(len-30,28,-30);g.add(lamp);animHooks.push(()=>{lamp.intensity=3*nightF(hour());});
    return g;},

  // ================================================================ Scrap Island and Franky House
  // The island of wrecks: the hulls of hundreds of scrapped ships piled into land, broken and rusting, masts snapped,
  // iron plate and chain and anchors, a salvage crane; rocks round the shore. Franky House on it, built of what the sea
  // brought in, its planks every colour, FRANKY HOUSE in gold letters across it, a pair of great mechanical arms
  // hanging off its sides, barrels of cola stacked by the door. Tom's Workers' old office, a brick warehouse by the
  // bridge's landing, its sign faded; the slipway where the Sunny was built, its scaffold still up, Adam wood stacked.
  franky(L,x,z){const g0=gh(x,z),M=Model();let sd=31;const R=()=>{sd=(sd*16807)%2147483647;return sd/2147483647;};
    // a ship's hull, lofted: length, beam, depth; t0..t1 the part of her that is left
    const hullGeo=(Ln,B,D,t0=0,t1=1)=>{const NI=18,NJ=8,pos=[],idx=[];for(let i=0;i<=NI;i++){const t=t0+(t1-t0)*i/NI,w=B/2*Math.pow(Math.max(0.05,Math.sin(Math.PI*Math.min(1,0.06+t*0.94))),0.55);
      for(let j=0;j<=NJ;j++){const th=-Math.PI/2+Math.PI*j/NJ;pos.push(-Ln/2+t*Ln,D*(1-Math.cos(th)),w*Math.sin(th));}}
      for(let i=0;i<NI;i++)for(let j=0;j<NJ;j++){const a=i*(NJ+1)+j,b=a+NJ+1;idx.push(a,b,a+1,b,b+1,a+1);}
      const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setIndex(idx);g.computeVertexNormals();return g.toNonIndexed();};
    // ---- the wrecks: round the island, half buried, heeled over, some broken off ----
    const WK=['wood','woodDark','rust','junk','woodDark','rust'];
    for(let i=0;i<26;i++){const a=i/26*Math.PI*2+R()*0.2,r=40+R()*95,cx=Math.cos(a)*r,cz=Math.sin(a)*r;if(cx>40&&cz<10&&cz>-80)continue;   // clear of the house and the landing
      const Ln=24+R()*40,B=Ln*(0.24+R()*0.08),D=B*0.65,broken=R()<0.5,t0=broken?R()*0.3:0,t1=broken?0.55+R()*0.3:1,k=WK[i%WK.length];
      const geo=hullGeo(Ln,B,D,t0,t1);M.put(k,geo,cx,-D*0.12+R()*1.5,cz,R()*6.28,(R()-0.5)*0.3,(R()<0.5?-1:1)*(0.25+R()*0.55));
      if(R()<0.55){const mh=6+R()*16;M.put('woodDark',new THREE.CylinderGeometry(0.35,0.5,mh,6).translate(0,mh/2,0),cx+(R()-0.5)*6,0,cz+(R()-0.5)*6,R()*6.28,(R()-0.5)*0.9,(R()-0.5)*0.9);}}
    // mounds of junk: earth and rust and broken timber heaped up between the hulls
    for(let i=0;i<12;i++){const a=R()*6.28,r=25+R()*90,cx=Math.cos(a)*r,cz=Math.sin(a)*r;if(cx>30&&cz<30&&cz>-100)continue;const rr=7+R()*9;
      M.put(R()<0.5?'junk':'rust',new THREE.SphereGeometry(rr,10,6,0,Math.PI*2,0,Math.PI/2).scale(1,0.35+R()*0.25,1),cx,-0.5,cz);
      for(let k=0;k<6;k++)M.put('woodDark',new THREE.BoxGeometry(5+R()*6,0.4,0.6),cx+(R()-0.5)*rr,rr*0.25+R()*1.5,cz+(R()-0.5)*rr,R()*6,(R()-0.5)*0.8,(R()-0.5)*0.8);}
    // iron plate, chain, anchors, barrels, crates in heaps between them
    for(let i=0;i<60;i++){const a=R()*6.28,r=20+R()*120,cx=Math.cos(a)*r,cz=Math.sin(a)*r;if(cx>40&&cz<10&&cz>-80)continue;const kind=R();
      if(kind<0.3)M.put('rust',new THREE.BoxGeometry(3+R()*5,0.25,2+R()*4),cx,0.4+R()*1.5,cz,R()*6.28,(R()-0.5)*0.8,(R()-0.5)*0.8);
      else if(kind<0.55){for(let b=0;b<3+R()*4;b++)M.cyl(R()<0.5?'woodDark':'rust',cx+(R()-0.5)*4,0,cz+(R()-0.5)*4,0.55,0.6,1.3,10);}
      else if(kind<0.75)M.box(R()<0.5?'wood':'crate',cx,0,cz,1.5+R()*2,1.2+R()*1.6,1.5+R()*2,R()*6.28);
      else if(kind<0.85){M.box('black',cx,0.4,cz,0.6,4,0.6,R()*3);M.put('black',new THREE.TorusGeometry(1.5,0.3,6,14,Math.PI),cx,1.2,cz,R()*3,Math.PI,0);}   // an anchor
      else for(let c=0;c<8;c++)M.put('black',new THREE.TorusGeometry(0.4,0.1,5,10),cx+c*0.65,0.2,cz,c%2?Math.PI/2:0,Math.PI/2,0);}   // a run of chain
    // a salvage crane over the wrecks: an A-frame, its jib, the hook
    {const cx=-70,cz=40;for(const s of [-1,1]){beam(M,'rust',new V3(cx-8,0,cz+s*5),new V3(cx,26,cz),1.2);}beam(M,'rust',new V3(cx,26,cz),new V3(cx+30,30,cz+8),0.9);beam(M,'rust',new V3(cx-12,0,cz),new V3(cx,26,cz),0.8);
      M.box('black',cx+30,10,cz+8,0.15,20,0.15);M.box('rust',cx+30,8,cz+8,4,2,3);}
    // rocks round the shore
    for(let i=0;i<70;i++){const a=R()*6.28,r=140+R()*30,s=1.5+R()*4;M.put('junk',new THREE.DodecahedronGeometry(s,0),Math.cos(a)*r,-1.5-R()*2,Math.sin(a)*r,R()*6,R()*6,R()*6);}
    // ---- Franky House: two storeys of salvage, every plank a colour, by the bridge's landing ----
    {const hx=78,hz=-36,W=40,D=20,cols=['signRed','lion','blueTile','green','wood','sail','mane'];
      for(let u=-W/2+0.6;u<W/2;u+=1.2){const c=cols[Math.floor(R()*cols.length)];M.box(c,hx+u,0,hz-D/2,1.25,11,0.6);M.box(cols[Math.floor(R()*cols.length)],hx+u,0,hz+D/2,1.25,11,0.6);}
      for(let u=-D/2+0.6;u<D/2;u+=1.2){M.box(cols[Math.floor(R()*cols.length)],hx-W/2,0,hz+u,0.6,11,1.25);M.box(cols[Math.floor(R()*cols.length)],hx+W/2,0,hz+u,0.6,11,1.25);}
      M.box('woodDark',hx,11,hz,W+1,0.6,D+1);M.box('junk',hx-4,11.6,hz,W*0.6,7,D*0.8);M.box('rust',hx-4,18.6,hz,W*0.66,0.5,D*0.9);M.box('lion',hx-4,19.1,hz,4,6,0.4);   // the upper storey, the tin roof
      M.cyl('rust',hx+10,11.6,hz-5,0.9,0.9,11,10);M.cyl('woodDark',hx-4,25,hz,0.3,0.3,14,6);                                                                                    // the stovepipe
      M.box('black',hx+W/2+0.3,0,hz,0.3,6,5);M.box('glass',hx+W/2+0.32,5,hz-6,0.2,3,4);M.box('glass',hx+W/2+0.32,5,hz+6,0.2,3,4);   // the door, the windows (the end to the bridge)
      // cola: barrels stacked by the door, red with a white band
      for(const zz of [7,-8])for(let r=0;r<3;r++)for(let c=0;c<4-r;c++){M.cyl('signRed',hx+W/2+3+c*1.3+r*0.65,r*1.3,hz+zz,0.6,0.6,1.3,12);M.cyl('sail',hx+W/2+3+c*1.3+r*0.65,r*1.3+0.5,hz+zz,0.62,0.62,0.3,12);}}
    // ---- Tom's Workers' old office: a brick warehouse at the bridge's landing ----
    M.box('brickRed',118,0,-62,30,9,16,0.4);{const sh=new THREE.Shape();sh.moveTo(-8.6,0);sh.lineTo(8.6,0);sh.lineTo(0,4.5);sh.closePath();M.put('rust',new THREE.ExtrudeGeometry(sh,{depth:31,bevelEnabled:false}).translate(0,0,-15.5).rotateY(Math.PI/2),118,9,-62,0.4);}
    // ---- the slipway the Sunny was built on, its scaffold, the Adam wood ----
    {const sx=-20,sz=-110,ry=-1.9;M.put('wood',new THREE.BoxGeometry(60,1,14),sx,0.2,sz,ry,0,-0.06);
      for(let u=-24;u<=24;u+=6)for(const s2 of [-1,1]){const px=sx+Math.cos(-ry)*u-Math.sin(-ry)*s2*9,pz=sz+Math.sin(-ry)*u+Math.cos(-ry)*s2*9;M.cyl('woodDark',px,0,pz,0.2,0.2,14,5);for(let l=1;l<4;l++)M.box('wood',px,l*3.4,pz,6,0.25,1.5,ry);}
      for(let r=0;r<3;r++)for(let c=0;c<5-r;c++)M.put('adam',new THREE.CylinderGeometry(0.9,0.9,16,10).rotateZ(Math.PI/2),sx+28,0.9+r*1.7,sz+18+c*1.9+r*0.9,0.2);}
    const g=M.finish(L,x,g0,z,turn(L.face??180));
    // the signs: FRANKY HOUSE in gold across the house's front, TOM'S WORKERS faded on the warehouse
    const sign=(txt,w,h,bg,fg,font)=>{const c=document.createElement('canvas');c.width=1024;c.height=256;const k=c.getContext('2d');k.fillStyle=bg;k.fillRect(0,0,1024,256);
      k.font=font;k.textAlign='center';k.textBaseline='middle';k.lineWidth=14;k.strokeStyle='#2a1a10';k.strokeText(txt,512,136);k.fillStyle=fg;k.fillText(txt,512,136);
      const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshLambertMaterial({map:new THREE.CanvasTexture(c),transparent:bg==='rgba(0,0,0,0)'}));m.userData.noFingerprint=true;return m;};
    {const s1=sign('FRANKY HOUSE',32,8,'#8a1a1a','#f0c030','bold 118px Georgia, serif');s1.position.set(78,14.8,-36+10.4);g.add(s1);
      const s2=sign('FRANKY HOUSE',18,4.6,'#8a1a1a','#f0c030','bold 118px Georgia, serif');s2.position.set(78+20.4,14.6,-36);s2.rotation.y=Math.PI/2;g.add(s2);
      const s3=sign("TOM'S WORKERS",20,3,'#6a3a2a','#d8c8a0','bold 104px Georgia, serif');s3.position.set(118+Math.cos(0.4)*0+0,7,-62);s3.rotation.y=-0.4+Math.PI/2;s3.position.x+=Math.cos(0.4)*15.2;s3.position.z+=-Math.sin(0.4)*15.2;g.add(s3);}
    // the mechanical arms hanging off the house's sides: shoulder, upper arm, forearm, a three-fingered claw
    {const steel=new THREE.MeshLambertMaterial({color:0x7a8288}),dark=new THREE.MeshLambertMaterial({color:0x3a3e44}),blue=new THREE.MeshLambertMaterial({color:0x2a6ab8});
      for(const s3 of [-1,1]){const arm=new THREE.Group();arm.position.set(78,12,-36+s3*10.6);arm.scale.setScalar(1.3);
        const sh=new THREE.Mesh(new THREE.SphereGeometry(1.6,12,10),blue);arm.add(sh);
        const up=new THREE.Mesh(new THREE.CylinderGeometry(0.9,1.1,6,12),steel);up.position.set(0,-3.2,s3*0.6);up.rotation.x=s3*0.2;arm.add(up);
        const el=new THREE.Mesh(new THREE.SphereGeometry(1.1,10,8),dark);el.position.set(0,-6.4,s3*1.2);arm.add(el);
        const fo=new THREE.Mesh(new THREE.CylinderGeometry(0.8,0.95,5,12),steel);fo.position.set(1.4,-8,s3*1.6);fo.rotation.z=0.5;arm.add(fo);
        for(let f=0;f<3;f++){const cl=new THREE.Mesh(new THREE.BoxGeometry(0.4,2.2,0.5),dark);const fa=f/3*Math.PI*2;cl.position.set(2.8+Math.cos(fa)*0.5,-9.8,s3*1.6+Math.sin(fa)*0.5);cl.rotation.set(Math.sin(fa)*0.4,0,0.5+Math.cos(fa)*0.4);arm.add(cl);}
        arm.traverse(o=>{o.castShadow=true;o.userData.noFingerprint=true;});g.add(arm);}}
    // the Franky Family's flag on the house's mast; the King Bulls, Sodom and Gomorrah, in the water by the landing;
    // the Family's houseboat moored behind them
    {const fc=document.createElement('canvas');fc.width=256;fc.height=160;const k=fc.getContext('2d');k.fillStyle='#1a1a1c';k.fillRect(0,0,256,160);k.fillStyle='#f4f0e6';
      k.beginPath();k.arc(128,70,34,0,7);k.fill();k.fillStyle='#1a1a1c';k.fillRect(108,58,14,14);k.fillRect(134,58,14,14);k.fillStyle='#2a6ab8';k.beginPath();k.moveTo(92,40);k.lineTo(164,40);k.lineTo(128,18);k.closePath();k.fill();
      k.strokeStyle='#f4f0e6';k.lineWidth=12;k.beginPath();k.moveTo(78,120);k.lineTo(178,140);k.moveTo(178,120);k.lineTo(78,140);k.stroke();
      const fl=new THREE.Mesh(new THREE.PlaneGeometry(7,4.4),new THREE.MeshLambertMaterial({map:new THREE.CanvasTexture(fc),side:THREE.DoubleSide}));fl.position.set(74+3.5,36,-36);fl.userData.noFingerprint=true;g.add(fl);
      animHooks.push(now=>{fl.rotation.y=Math.sin(now/700)*0.25;});}
    {const bull=(col)=>{const b=new THREE.Group(),m=new THREE.MeshLambertMaterial({color:col}),a=(geo,mm,px,py,pz)=>{const me=new THREE.Mesh(geo,mm);me.position.set(px,py,pz);b.add(me);};
        a(new THREE.SphereGeometry(1,16,12).scale(9,4.4,4.4),m,0,1,0);a(new THREE.SphereGeometry(1,14,10).scale(4.4,4,3.8),m,9,5,0);for(const s4 of [-1,1])a(new THREE.SphereGeometry(1,10,8),new THREE.MeshLambertMaterial({color:0xf4f4f4}),12.2,7,s4*2);
        a(new THREE.ConeGeometry(2.4,5,10),new THREE.MeshLambertMaterial({color:0xe0a040}),6.5,9,0);a(new THREE.BoxGeometry(5,0.4,10),m,-2,1,0);b.traverse(o=>{o.castShadow=true;o.userData.noFingerprint=true;});return b;};
      const bulls=[bull(0x3a7a8a),bull(0x4a8a6a)];bulls[0].position.set(190,0,-6);bulls[0].rotation.y=0.3;bulls[1].position.set(196,0,22);bulls[1].rotation.y=-0.2;   // off the beach, in the water
      const hb=new THREE.Group(),hm=(c)=>new THREE.MeshLambertMaterial({color:c});{const a=(geo,mm,px,py,pz)=>{const me=new THREE.Mesh(geo,mm);me.position.set(px,py,pz);hb.add(me);};
        a(new THREE.BoxGeometry(26,3,11),hm(0x6a4a30),0,0,0);a(new THREE.BoxGeometry(16,6,9),hm(0xc84a3a),-2,4.5,0);a(new THREE.BoxGeometry(17,0.6,10),hm(0x3a6aa8),-2,7.8,0);a(new THREE.BoxGeometry(6,4,7),hm(0xe8c040),8,3.5,0);}
      hb.position.set(176,0,48);hb.rotation.y=0.5;hb.traverse(o=>{o.castShadow=true;o.userData.noFingerprint=true;});
      for(const o of [...bulls,hb])g.add(o);
      animHooks.push(now=>{const t=now/1000;for(const [o,ph] of [[bulls[0],0],[bulls[1],1.7],[hb,0.8]]){const wp=new THREE.Vector3();o.getWorldPosition(wp);const y=(api.SEA?api.SEA.y(wp.x,wp.z):0.7)-g.position.y;o.position.y=y-0.6+Math.sin(t*0.8+ph)*0.15;}});}
    return g;},

  // ================================================================ the Going Merry
  merry(L,x,z){const M=Model(),y=-1.6;
    hull(M,'wood',30,8,5.4,y);M.box('sheep',0,y+5.2,0,26,0.5,7.6);M.box('woodDark',-12,y+5.4,0,6,3,7.6);M.box('sheep',-12,y+8.4,0,6.4,0.5,8);   // the hull, the white rail, the stern cabin
    M.put('sheep',new THREE.SphereGeometry(1.6,12,10),16.4,y+6.2,0);for(const s of [-1,1])M.put('sheep',new THREE.TorusGeometry(0.7,0.28,8,12),16.2,y+6.8,s*1.3);   // the ram's head and its horns
    M.cyl('woodDark',1,y+5,0,0.45,0.32,20,8);M.box('woodDark',1,y+18,0,0.4,0.4,11);
    M.box('sail',1.6,y+10,0,0.2,9,10);M.box('black',1.75,y+12.5,0,0.1,3.2,3.2);M.put('sail',new THREE.SphereGeometry(1.1,10,8),1.85,y+13,0);   // the sail and the jolly roger on it
    M.cyl('woodDark',1,y+21,0,1.4,1.2,1.2,10);                                                                // the crow's nest
    return M.finish(L,x,0.7,z,turn(L.face||0));},

  // ================================================================ the Thousand Sunny
  sunny(L,x,z){const M=Model(),y=-2.2;
    hull(M,'wood',36,11,7,y);M.box('cream',-2,y+6.8,0,30,0.3,10.4);M.box('lawn',-1,y+7.1,0,18,0.2,9);         // the hull, the deck, the lawn
    M.box('cream',-14,y+7,0,8,5,10);M.box('green',-14,y+12,0,8.4,0.6,10.4);M.box('glass',-9.9,y+8.5,0,0.2,2,6);   // the stern cabin and the aquarium bar
    // the lion: a sun of a mane round a round yellow face
    M.put('lion',new THREE.SphereGeometry(2.6,16,12),19,y+8.5,0);for(let i=0;i<14;i++){const a=i/14*Math.PI*2;M.put('mane',new THREE.ConeGeometry(0.9,2.4,6).rotateX(Math.PI/2).rotateY(Math.PI/2),19.3,y+8.5+Math.sin(a)*3.4,Math.cos(a)*3.4,0,0,-a);}
    M.cyl('woodDark',0,y+7,0,0.6,0.4,24,10);M.box('sail',0.8,y+13,0,0.2,10,13);M.box('black',0.95,y+16,0,0.1,4,4);M.put('sail',new THREE.SphereGeometry(1.3,10,8),1.05,y+16.6,0);
    M.cyl('cream',0,y+27,0,2.2,1.8,2.6,14);M.cyl('mane',0,y+29.6,0,2.4,0.3,1.4,14);                          // the crow's nest
    return M.finish(L,x,0.7,z,turn(L.face||0));},

  };
}
