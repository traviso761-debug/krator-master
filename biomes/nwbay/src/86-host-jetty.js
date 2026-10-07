// ================================================================= HOST — a ruined jetty
// the tower's (or jetty's) concrete, iron and stone from the material library (materials.json towerConcrete, towerRust, jettyStone)
// when this page carries the kit's pack; the UVs are world metres / 6, so one UV unit is 6 m of the set
function hostJettyLib(n,fb){const L=(typeof KMAT!=='undefined'&&KMAT.mode==='lib'&&KMAT.packed)?KMAT.packed('nwbay',n):null;if(!L)return fb;
 const t=KMAT.textures(L,{aniso:8}).map;t.repeat.set(6/L.scale[0],6/L.scale[1]);return t;}
// A second structure for the biome to grow on: a stone causeway running from
// the bay's NW shore 150 m out over the water on squat piers, its deck broken
// away toward the end, a roofless kiosk at the landward head. Host-only, no
// plant is placed here: the host merges the shells and hands them to
// NWBAY.dress() like the tower's, with counts to match its size.
function buildJetty(){
 // from the NW shore, running SE (down u) over the water toward the sea stack
 // off the shore: the head is found by marching down u at v0 until the ground
 // meets the water
 const v0=-250,DIR=[SQ,SQ];let u0=BAY.a+120;while(u0>200&&bayIn(XZ(u0,v0)[0],XZ(u0,v0)[1])>10)u0-=5;u0+=14;
 const head=XZ(u0,v0),yD=2.6,W=6,L=150;
 const stone=[];
 const box=(x,y,z,w,h,d,rot)=>{const g=new THREE.BoxGeometry(w,h,d);if(rot)g.rotateY(rot);g.translate(x,y+h/2,z);stone.push(g);};
 const along=(s,side)=>[head[0]+DIR[0]*s+(-DIR[1])*side,head[1]+DIR[1]*s+DIR[0]*side];
 const ang=Math.atan2(DIR[0],DIR[1]);
 // the deck in 6 m slabs, more of them missing toward the end
 for(let s=0;s<L;s+=6){const p=along(s+3,0),miss=s>L*.55&&rng()<(s-L*.55)/(L*.45)*.8;if(miss)continue;
  box(p[0],yD-.5,p[1],6.05,.5,W,ang);
  if(rng()<.35){const q=along(s+3,(rng()<.5?1:-1)*(W/2-.35));box(q[0],yD,q[1],rr(1.5,4),rr(.5,1.1),.7,ang);}}   // bits of parapet
 // the piers, down to the bed, every 12 m
 for(let s=6;s<L;s+=12){for(let side=-1;side<=1;side+=2){const p=along(s,side*(W/2-.9)),yb=groundH(p[0],p[1])-1.5;box(p[0],yb,p[1],1.8,yD-.5-yb,1.8,ang);}}
 // the kiosk at the head: four walls, one fallen, no roof
 const k=along(-9,0);[[0,-1],[0,1],[-1,0]].forEach(f=>{const c=[k[0]+(-DIR[1])*f[1]*4.5+DIR[0]*f[0]*4.5,k[1]+DIR[0]*f[1]*4.5+DIR[1]*f[0]*4.5];
  box(c[0],groundH(k[0],k[1])-.5,c[1],f[0]?9.6:.8,rr(3.2,4.6),f[0]?.8:9.6,ang);});
 for(let i=0;i<9;i++){const p=along(rr(-14,8),rr(-9,9));box(p[0],groundH(p[0],p[1])-.3,p[1],rr(1,2.6),rr(.6,1.4),rr(1,2.2),rng()*TAU);}   // rubble
 for(let i=0;i<7;i++){const p=along(rr(L*.6,L+20),rr(-6,6));box(p[0],groundH(p[0],p[1])-.6,p[1],rr(1.2,3),rr(.6,1.6),rr(1.2,2.6),rng()*TAU);}   // fallen slabs in the shallows
 const TEXS=BIO.canvasTex(256,256,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4,v=140+(fbm(x/16,y/16,4.4,3)-.5)*60+(fbm(x/3,y/3,7,1)-.5)*18,m=(y%64<3||x%96<3)?.78:1;d[i]=v*.9*m;d[i+1]=v*.9*m;d[i+2]=v*.82*m;d[i+3]=255;}g.putImageData(id,0,0);});
 const pos=[],nor=[],uv=[];
 stone.forEach(g=>{const ng=g.toNonIndexed();const p=ng.attributes.position.array,n=ng.attributes.normal.array;for(let i=0;i<p.length;i++){pos.push(p[i]);nor.push(n[i]);}for(let i=0;i<p.length;i+=3)uv.push((p[i]+p[i+2])/4,p[i+1]/4);});
 const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geo.setAttribute('normal',new THREE.Float32BufferAttribute(nor,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
 const m=new THREE.Mesh(geo,new THREE.MeshLambertMaterial({map:hostJettyLib('jettyStone',TEXS),color:0x9a968a}));m.userData.inspectLabel='The jetty — stone';m.userData.host=true;scene.add(m);
 const mid=along(L/2,0);OBSTACLES.push({x:head[0],z:head[1],r:14,y0:-4,y1:8});OBSTACLES.push({x:mid[0],z:mid[1],r:L/2+8,y0:-6,y1:yD+3});
 REGISTER({name:'The jetty (ruined causeway)',x:mid[0],z:mid[1],y:-4,r:L/2+8,h:12});
 window.JETTY={head:head,dir:DIR,L:L};
 return [geo];}
