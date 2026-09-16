// ---------- the docks: a stone quay, a main pier with finger piers (six berths), a warehouse, crates and a cargo crane ----------
{const R=mkRng(333),th=LAKE.harborT,S=LAKE.at(1.0,th),I=LAKE.at(0.55,th);let ux=I[0]-S[0],uz=I[1]-S[1];const ul=Math.hypot(ux,uz);ux/=ul;uz/=ul;const vx=-uz,vz=ux;
 const W=(uu,vv)=>[S[0]+ux*uu+vx*vv,S[1]+uz*uu+vz*vv],ryU=-Math.atan2(uz,ux),ryV=-Math.atan2(vz,vx),deck=L+0.95,bed=L-3.2;
 const plank=new THREE.MeshLambertMaterial({color:0x8a6a45});plank.userData.tex='timber';const post=lamC(0x5e3f28),iron=lamC(0x3a3632);
 const quayM=new THREE.MeshLambertMaterial({color:0x9a8a70});quayM.userData.tex='ashlar';quayM.userData.weather=true;
 let q=W(0,0);scene.add(mesh(boxG,quayM,q[0],bed,q[1],58,deck+0.12-bed,12,ryV));   // quay and the paved apron behind it
 for(let uu=6.4;uu<58;uu+=0.8){q=W(uu,0);scene.add(mesh(boxG,plank,q[0],deck-0.15,q[1],0.7,0.15,4,ryU));}
 for(let uu=8;uu<=58;uu+=4)for(const sd of [-1,1]){q=W(uu,sd*2.1);scene.add(mesh(boxG,post,q[0],bed,q[1],0.3,deck+0.35-bed,0.3,ryU));}
 for(const [uu,sd] of [[14,1],[24,1],[34,1],[44,1],[54,1],[34,-1],[44,-1],[54,-1]]){   // the shore curves in close on the -v side, so its fingers start further out

   for(let vv=2.4;vv<12.4;vv+=0.8){q=W(uu,sd*vv);scene.add(mesh(boxG,plank,q[0],deck-0.15,q[1],0.7,0.15,1.8,ryV));}
   for(const vv of [5,9,12]){q=W(uu,sd*vv);scene.add(mesh(boxG,post,q[0],bed,q[1],0.26,deck+0.3-bed,0.26,0));}
   for(const vv of [6.5,11.4]){q=W(uu,sd*vv);scene.add(mesh(cyl(0.18,0.24,0.55,8),iron,q[0],deck+0.27,q[1],1,1,1,0));}}
 const lamps=[];for(const uu of [12,34,57]){q=W(uu,1.7);scene.add(mesh(boxG,post,q[0],deck,q[1],0.2,3.2,0.2,0));const gl=mesh(boxG,glowM,q[0],deck+3.2,q[1],0.45,0.5,0.45,ryU);gl.userData.glowColor=[1,0.75,0.42];gl.userData.glowSize=7;gl.userData.sched=1;gl.userData.lightT=[17.7,25.5,-1];scene.add(gl);const w=W(uu,4.5);lamps.push(w);}
 animHooks.push(()=>{const h=ctx.hour||0,l=litAt(h,17.7,25.5);lamps.forEach((w,k)=>BOAT_POOLS[21+k].set(w[0],w[1],0.8*l,4.5));if(LAKE.fishStall)LAKE.fishStall.visible=h>=5.5&&h<11.5;});
 // warehouse on the shore behind the quay
 {const c=W(-11,12),gy=Math.min(...[[-15,5],[-15,19],[-7,5],[-7,19]].map(a=>meshH(...W(a[0],a[1]))))-0.6;const wm=new THREE.MeshLambertMaterial({color:0xc9b48a});wm.userData.tex='sand';wm.userData.weather=true;
  scene.add(mesh(boxG,wm,c[0],gy,c[1],15,7.2+(deck-gy)*0,9,ryV));const rm=new THREE.MeshLambertMaterial({color:0x6e3f28});rm.userData.tex='shingle';scene.add(mesh(rectFrus(1,0.05),rm,c[0],gy+7.2,c[1],16,3.2,10,ryV));
  const d=W(-6.45,12);scene.add(mesh(boxG,darkM,d[0],gy,d[1],4,4.2,0.1,ryV));const sg=W(-6.4,12);const sign=mesh(boxG,lamC(0x2f8f8a),sg[0],gy+4.8,sg[1],6,0.9,0.12,ryV);scene.add(sign);const sf=W(-6.4+0.07,12);LAKE.whSign={x:sf[0],z:sf[1],y:gy+5.25,ry:Math.atan2(ux,uz)};}
 // crates, barrels and a cargo crane on the quay
 for(let k=0;k<14;k++){const uu=1+R()*4,vv=15+R()*12;q=W(uu,vv);const cc=[0x8a6a45,0x7a5a3a,0x9c7a55,0x6a8a8a][Math.floor(R()*4)];
   if(R()<0.6)scene.add(mesh(boxG,plank,q[0],deck,q[1],1+R()*0.6,0.8+R()*0.7,1+R()*0.6,R()*6.28));else scene.add(mesh(cyl(0.45,0.45,1.1,10),lamC(cc),q[0],deck+0.55,q[1],1,1,1,0));}
 {const cb=W(3.5,9);scene.add(mesh(boxG,post,cb[0],deck,cb[1],0.5,7,0.5,0));const arm=W(6.5,9);scene.add(mesh(boxG,post,arm[0],deck+6.6,arm[1],6.5,0.35,0.35,ryU));
  const hk=W(9.3,9);scene.add(mesh(boxG,iron,hk[0],deck+2.8,hk[1],0.04,3.8,0.04,0));scene.add(mesh(boxG,plank,hk[0],deck+1.9,hk[1],1.3,0.9,1.3,ryU));}
 const slots=[];for(const [uu,sd,fish] of [[39,-1,1],[49,-1,1],[19,1,1],[29,1,0],[39,1,0],[49,1,0]]){const c=W(uu,sd*7.2);slots.push({x:c[0],z:c[1],side:sd,uu,fish:!!fish,hd:Math.atan2(-sd*vx,-sd*vz),appr:W(uu,sd*20),outer:W(72,sd*32),by:null});}
 // nets drying on racks, a fish stall (open 05:30 to 11:30), baskets of catch
 {const netTex=(()=>{const cv=document.createElement('canvas');cv.width=cv.height=64;const g=cv.getContext('2d');g.strokeStyle='rgba(60,50,40,0.95)';g.lineWidth=1.4;for(let k=0;k<=64;k+=8){g.beginPath();g.moveTo(k,0);g.lineTo(k,64);g.stroke();g.beginPath();g.moveTo(0,k);g.lineTo(64,k);g.stroke();}const t=new THREE.CanvasTexture(cv);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(3,2);return t;})();
  const netM=new THREE.MeshLambertMaterial({color:0x8a8070,map:netTex,alphaTest:0.3,transparent:false,side:THREE.DoubleSide});netM.userData.env=true;
  for(const vv of [30,36]){const a1=W(-3,vv-2.2),a2=W(-3,vv+2.2),gy=Math.max(meshH(...a1),meshH(...a2),deck);for(const q2 of [a1,a2])scene.add(mesh(boxG,post,q2[0],gy-0.3,q2[1],0.18,3,0.18,0));
    const ng=new THREE.PlaneGeometry(4.2,2.2);const net=new THREE.Mesh(ng,netM);const c=W(-3,vv);net.position.set(c[0],gy+1.5,c[1]);net.rotation.y=-Math.atan2(vz,vx);net.userData.noWire=true;scene.add(net);scene.add(mesh(boxG,post,c[0],gy+2.62,c[1],4.6,0.1,0.1,ryV));}
  const stall=new THREE.Group();stall.userData.dynamic=true;const sc=W(-1,-2.5);stall.position.set(sc[0],deck,sc[1]);stall.rotation.y=ryV;
  const awn=new THREE.MeshLambertMaterial({color:0x2f8f8a});awn.userData.tex='stripes';
  stall.add(mesh(boxG,plank,0,0,0,3.4,1.0,1.2,0));for(const sx of [-1.6,1.6])for(const sz of [-0.55,0.9])stall.add(mesh(boxG,post,sx,0,sz,0.12,2.6,0.12,0));stall.add(mesh(boxG,awn,0,2.6,0.2,3.8,0.12,2.2,0));
  for(let k=0;k<5;k++)stall.add(mesh(boxG,lamC([0xb8c8d0,0x9aa8b0,0xd0b890][k%3]),-1.2+k*0.6,1.02,0,0.45,0.08,0.25,0));
  scene.add(stall);LAKE.fishStall=stall;
  for(let k=0;k<8;k++){const q2=W(3+R()*2.5,-4-R()*6);scene.add(mesh(cyl(0.35,0.28,0.45,8),lamC(0x9c7a4a),q2[0],deck+0.22,q2[1],1,1,1,0));}}
 const perches=[];for(const [uu,sd] of [[14,1],[24,1],[34,1],[44,1],[54,1],[34,-1],[44,-1],[54,-1]])for(const vv of [6.5,11.4]){const q2=W(uu,sd*vv);perches.push([q2[0],deck+0.62,q2[1],Math.atan2(vx,vz)]);}
 LAKE.harbor={S,u:[ux,uz],v:[vx,vz],W,slots,far:W(84,0),centre:W(28,0),perches};
 {const e=W(46,40),t=W(20,0);SEWER.docksView=[e[0],deck+13,e[1],t[0],deck,t[1]];}}
ctx.lake={cx:Math.round(LAKE.cx),cz:Math.round(LAKE.cz),level:+L.toFixed(2),riverIn:Math.round(RIVER.rIn)};
});
await stage('dockroad');
section('dockroad',()=>{
const P=DOCKROAD.pts,R=mkRng(1501);const stone=new THREE.MeshLambertMaterial({color:0xb8a888});stone.userData.tex='ashlar';
const post=lamC(0x4a3a2a),dark=lamC(0x3a3632);
const at=(i,off)=>{const a=P[Math.max(0,i-1)],b=P[Math.min(P.length-1,i+1)];let tx=b[0]-a[0],tz=b[1]-a[1];const l=Math.hypot(tx,tz)||1;tx/=l;tz/=l;return {x:P[i][0]-tz*off,z:P[i][1]+tx*off,ry:-Math.atan2(tz,tx)};};
let lamps=0;
for(let i=4;i<P.length-3;i+=10){const q=at(i,(i/10)%2?5.2:-5.2),y=meshH(q.x,q.z);scene.add(mesh(boxG,post,q.x,y,q.z,0.3,5,0.3,0));
  const k=lamps++,gl=mesh(boxG,glowM,q.x,y+5,q.z,0.45,0.6,0.45,q.ry);gl.userData.glowColor=[1,0.8,0.45];gl.userData.glowSize=7;gl.userData.sched=1;gl.userData.lightT=[17.8+k*0.03,24.8-k*0.02,-1];scene.add(gl);}
DOCKROAD.milestones=[];
for(let i=10;i<P.length-5;i+=20){const q=at(i,4.6),y=meshH(q.x,q.z);DOCKROAD.milestones.push({x:q.x,z:q.z,y,ry:q.ry});scene.add(mesh(boxG,stone,q.x,y-0.2,q.z,0.5,1.3,0.35,q.ry));scene.add(mesh(boxG,dark,q.x,y+0.7,q.z,0.54,0.12,0.39,q.ry));}
// signpost where the road meets the south causeway
{const q=at(P.length-3,6),y=meshH(q.x,q.z);scene.add(mesh(boxG,post,q.x,y,q.z,0.25,3.4,0.25,0));
 const sign=lamC(0xd9c49a);scene.add(mesh(boxG,sign,q.x+0.9,y+2.9,q.z,1.8,0.35,0.08,0));scene.add(mesh(boxG,sign,q.x,y+2.4,q.z-0.9,0.08,0.35,1.8,0));DOCKROAD.signpost={x:q.x,y,z:q.z};}
// a waystation halfway: a small inn with a lamp, a hitching rail and a bench
{const mid=Math.floor(P.length*0.5),q=at(mid,15),y=Math.min(...[[-3,-3],[3,-3],[-3,3],[3,3]].map(o=>meshH(q.x+o[0],q.z+o[1])))-0.4;
 const wm=new THREE.MeshLambertMaterial({color:0xd9c49a});wm.userData.tex='sand';wm.userData.weather=true;const rm=new THREE.MeshLambertMaterial({color:0x7a3d2a});rm.userData.tex='shingle';
 scene.add(mesh(boxG,wm,q.x,y,q.z,9,4.6,6.5,q.ry));scene.add(mesh(rectFrus(1,0.05),rm,q.x,y+4.6,q.z,10,2.6,7.5,q.ry));
 const f=at(mid,11.5);scene.add(mesh(boxG,darkM,f.x,y+0.3,f.z,1.4,2.4,0.1,f.ry));
 const w1=at(mid-2,11.6),w2=at(mid+2,11.6);for(const w of [w1,w2]){scene.add(mesh(boxG,lamC(0x14100c),w.x,y+2,w.z,1,1,0.1,w.ry));}
 const lp=at(mid+4,10.5),gy=meshH(lp.x,lp.z);scene.add(mesh(boxG,post,lp.x,gy,lp.z,0.2,3.4,0.2,0));const gl=mesh(boxG,glowM,lp.x,gy+3.4,lp.z,0.4,0.5,0.4,lp.ry);gl.userData.glowColor=[1,0.75,0.4];gl.userData.glowSize=6;gl.userData.sched=1;gl.userData.lightT=[17.5,25.5,-1];scene.add(gl);
 const hr=at(mid-5,9);const hy=meshH(hr.x,hr.z);scene.add(mesh(boxG,post,hr.x,hy+1,hr.z,3.5,0.15,0.15,hr.ry));for(const o of [-1.6,1.6]){const pp=at(mid-5,9);scene.add(mesh(boxG,post,pp.x+Math.cos(-pp.ry)*o,hy,pp.z+Math.sin(-pp.ry)*o,0.18,1.15,0.18,0));}
 const bn=at(mid+1,10.4);scene.add(mesh(boxG,post,bn.x,meshH(bn.x,bn.z)+0.45,bn.z,2.2,0.12,0.6,bn.ry));
 SEWER.innView=[q.x+30,y+12,q.z+22,q.x,y+2,q.z];DOCKROAD.inn=[q.x,q.z];DOCKROAD.innSign={x:q.x-Math.sin(q.ry)*3.33,z:q.z-Math.cos(q.ry)*3.33,y:y+3.5,ry:q.ry+Math.PI};}
ctx.dockroad={points:P.length,lamps};
});
await stage('ivy-finish');
section('ivy-finish',()=>{
for(const [im,n] of [[ivyClimb,nIvC],[ivyHang,nIvH],[ivyClumps,nIvK]]){im.count=n;if(im!==ivyClumps)im.userData.noWire=true;im.instanceMatrix.needsUpdate=true;if(im.instanceColor)im.instanceColor.needsUpdate=true;im.geometry.attributes.izVar&&(im.geometry.attributes.izVar.needsUpdate=true);im.userData.noShadow=true;im.userData.cat='veg';if(n>0)scene.add(im);}
ctx.ivy={climb:nIvC,hang:nIvH,clumps:nIvK,flowerBoxes:nFB,cisterns:nTk,chimneys:SMOKE.filter(e=>e[3]===0).length};
});

await stage('spaceport');
section('spaceport',()=>{
