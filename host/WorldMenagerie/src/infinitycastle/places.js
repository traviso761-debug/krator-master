// ---------- the places in the castle ----------
// Fan work after Koyoharu Gotouge's Demon Slayer: Kimetsu no Yaiba (Shueisha, 2016-2020) and ufotable's anime and
// films. Nothing of theirs is used; every shape here is this page's own, placed from data/cities/infinitycastle.json
// after what the anime and the films show of them:
//
//   the stage          a broad deck of polished boards on stilts seventy metres tall against the north wall,
//                      where the demons Muzan summons arrive; a stair runs straight up to it from the floor
//   Nakime             on the ledge of a block at the back of the stage, with great studded doors behind her, in
//                      black, the biwa upright in her lap. Her right arm strums (biwa.js)
//   Muzan's lab        hung upside down from the middle of the ceiling at the bottom of a cone of red lights,
//                      with a desk and shelves and glassware: he works standing on the ceiling
//   the way in         in the ceiling: the floor of the Ubuyashiki mansion, where sliding doors opened under the
//                      Demon Slayer Corps, with the mansion burning above them
//   the great floor    polished boards laid on the tatami under the way in, where they come down
//   the cocoon         a hall against the south wall with a flesh cocoon in it, its roots across the floor and
//                      up the walls
//   the stair-well     seventy metres of stairs round a square well against the east wall
//   Doma's lake        on the floor: a lake of lotus lit teal, with a palace on stilts in it - two towers of five
//                      roofs, a hall between them up a red stair - and boardwalks out to it with lamps on posts
//   Akaza's hall       a floor of dark polished boards against the west wall, open to the hall behind a heavy
//                      rail, lamps on the beam over it, the compass of his art drawn on the boards; outside it,
//                      pillars the castle has thrown up at an angle, with water pouring off them
//   the pillar hall    a long hall of great round pillars high on the west wall, lit grey-green
import {Builder,room,hipRoof,KEN,STAIR} from './kit.js';

const V=(THREE,a)=>new THREE.Vector3(a[0],a[1],a[2]);

export function buildPlaces({THREE,C,kit,shell,mats,T,root,rnd,hall}){
  const P=C.places,M=THREE.Matrix4,Q=THREE.Quaternion,V3=THREE.Vector3,{CEIL}=hall;
  const rr=(a,b)=>a+(b-a)*rnd();
  const reserved=[],hooks=[],glows=[],reds=[],anchors={};
  const res=(p,r)=>reserved.push([p.x,p.y,p.z,r]);
  const glow=(p,c,s=1)=>glows.push([p.x,p.y,p.z,c[0]*s,c[1]*s,c[2]*s]);
  const WARM=[1,0.62,0.3],TEAL=[0.35,0.95,0.9],RED=[1,0.2,0.12];
  // lacquer: the red of the stair and the gate at Doma's palace, and of the rails at the stage
  const red=new THREE.MeshLambertMaterial({color:0x9a2416,emissive:0x3a0804,side:THREE.DoubleSide});
  const dark=new THREE.MeshLambertMaterial({map:T.plank,color:0x5a3a2a,side:THREE.DoubleSide});
  const iron=new THREE.MeshLambertMaterial({color:0x2a1c16});
  const SET=Object.assign({},mats,{red,dark,iron});
  // put a Builder's geometry in the scene, one mesh per material, under a group with this matrix
  function place(B,matrix,name){
    const g=new THREE.Group();g.matrixAutoUpdate=false;g.matrix.copy(matrix);g.userData.kind=name||'place';
    for(const [m,geo] of Object.entries(B.geos(THREE))){const mesh=new THREE.Mesh(geo,SET[m]);mesh.userData.kind=(name||'place')+':'+m;g.add(mesh);}
    root.add(g);return g;}
  const at=(p,yaw=0)=>new M().makeRotationY(yaw).setPosition(p.x,p.y,p.z);
  const T4=(m,x,y,z)=>m.clone().multiply(new M().makeTranslation(x,y,z));
  const tr=(m,v)=>v.clone().applyMatrix4(m);
  const pv=k=>V(THREE,[P[k].x,P[k].y,P[k].z]);

  // ---- the stage, and Nakime ----
  const st=pv('stage');
  {const yaw=P.stage.yaw,m=at(st,yaw),w=P.stage.w/2,d=P.stage.d/2,Y=st.y,B=new Builder();
   // the deck: polished boards on a frame of beams
   B.box('wood',-w,-1.2,-d,w,-0.1,d);B.box('plank',-w+0.1,-0.1,-d+0.1,w-0.1,0,d-0.1,['ny']);
   // the stilts: a lattice of posts to the floor, tied with rails at every six metres, as the great temple
   // stages stand on
   const xs=[],zs=[];for(let x=-w+1;x<=w-0.9;x+=(2*w-2)/6)xs.push(x);for(let z=-d+1;z<=d-0.9;z+=(2*d-2)/4)zs.push(z);
   for(const x of xs)for(const z of zs)B.box('wood',x-0.45,-Y,z-0.45,x+0.45,-1.2,z+0.45);
   for(let y=-Y+6;y<-2;y+=6){for(const x of xs)B.beam('wood',[x,y,-d+1],[x,y,d-1],0.3,0.5);for(const z of zs)B.beam('wood',[-w+1,y,z],[w-1,y,z],0.3,0.5);}
   // a rail round the three open sides, red, with lamps along it
   for(const [a,b] of [[[-w,-d],[-w,d]],[[-w,d],[w,d]],[[w,d],[w,-d]]]){
     B.beam('red',[a[0],1.0,a[1]],[b[0],1.0,b[1]],0.14,0.12);B.beam('red',[a[0],0.2,a[1]],[b[0],0.2,b[1]],0.1,0.1);
     const L=Math.hypot(b[0]-a[0],b[1]-a[1]),n=Math.round(L/KEN);
     for(let i=0;i<=n;i++){const f=i/n,x=a[0]+(b[0]-a[0])*f,z=a[1]+(b[1]-a[1])*f;B.box('red',x-0.08,0,z-0.08,x+0.08,1.1,z+0.08);
       if(i%3===0){B.box('lamp',x-0.16,1.1,z-0.16,x+0.16,1.45,z+0.16);glow(tr(m,new V3(x,1.3,z)),WARM,0.9);}}}
   place(B,m,'stage');
   // Nakime's block at the back of the stage: a box of dark lattice, its roof a ledge she sits on, and behind
   // her the doors - two leaves of boards four storeys high, studded with iron
   const N=new Builder(),bw=13,bd=10,bh=11;
   N.box('wood',-bw,0,-bd,bw,bh,0);
   N.quad('shojiDim',[-bw+1,1,0.02],[bw-1,1,0.02],[bw-1,bh-2.5,0.02],[-bw+1,bh-2.5,0.02]);
   for(let x=-bw+1;x<=bw-1;x+=KEN*1.5)N.box('dark',x-0.12,0.5,-0.05,x+0.12,bh-0.5,0.2);
   N.box('dark',-bw-0.3,bh,-bd-0.3,bw+0.3,bh+0.6,0.6);
   const dh=26,dw=9;N.box('wood',-dw-2,bh+0.6,-bd,dw+2,bh+0.6+dh+3,-bd+4);
   for(const s of [-1,1]){N.box('dark',s>0?0.05:-dw,bh+0.6,-bd+4,s>0?dw:-0.05,bh+0.6+dh,-bd+4.3);
     for(let yy=bh+2;yy<bh+dh;yy+=2.4)for(let xx=0.9;xx<dw;xx+=1.9){const x=s*xx;N.box('iron',x-0.12,yy-0.12,-bd+4.3,x+0.12,yy+0.12,-bd+4.45);}
     N.box('iron',s>0?0.3:-dw+0.3,bh+0.6+dh*0.48,-bd+4.3,s>0?dw-0.3:-0.3,bh+0.6+dh*0.52,-bd+4.4);}
   const nb=T4(m,0,0,-d);place(N,nb,'nakime block');
   for(const x of [-4,4]){const lb=new Builder();lb.box('lamp',x-0.2,bh+0.6,-1.2,x+0.2,bh+1.2,-0.8);place(lb,nb,'nakime lamps');glow(tr(nb,new V3(x,bh+0.9,-1)),WARM,1.4);}
   // her, on the ledge, facing the stage
   const fig=nakime(THREE);fig.group.position.set(0,bh+0.6,-1.2);
   const g=new THREE.Group();g.matrixAutoUpdate=false;g.matrix.copy(nb);g.add(fig.group);g.userData.kind='nakime';root.add(g);
   // the lamps either side of her light her, and the doors behind
   const nl=new THREE.PointLight(0xffb070,1.6,16,1.6);nl.position.copy(tr(nb,new V3(0,bh+2.4,1.5)));root.add(nl);
   anchors.nakime={pos:tr(nb,new V3(0,bh+1.4,-1.2)),yaw,fig};
   // the stair up from the floor, straight, flight after flight, along the front of the wall
   const n=Math.ceil(Y/STAIR.rise),sx=-w-n*STAIR.run;
   const c=kit.cluster(T4(m,sx,-n*STAIR.rise,-d+3).multiply(new M().makeRotationY(Math.PI/2)),{fixed:true,r:n*2.6});
   for(let k=0;k<n;k++)kit.add(c,'stairW',new M().makeTranslation(0,k*STAIR.rise,k*STAIR.run));
   res(st,Math.hypot(w,d)+14);res(new V3(st.x,st.y/2,st.z),Math.hypot(w,d)+4);res(new V3(st.x-w-n*STAIR.run/2,st.y/2,st.z),30);
   anchors.stage={pos:st,yaw,w,d};}

  // ---- Muzan's lab, hung from the ceiling ----
  const lb=pv('lab');
  {const hang=P.lab.drop,yaw=P.lab.yaw,B=new Builder(),w=6*KEN,d=4*KEN;room(B,w,d,{lit:true,roof:false});
   // a desk, shelves along the back, and on and around them glassware: flasks, tubes, and retort stands
   B.box('wood',-1.3,0,-0.6,1.3,0.72,0.4,['ny']);B.box('plank',-1.4,0.72,-0.7,1.4,0.78,0.5);
   B.box('wood',-0.3,0,0.7,0.3,0.45,1.2);B.box('wood',-0.3,0.45,1.1,0.3,1.0,1.2);
   for(let k=0;k<4;k++)B.box('wood',-4.5,0.4+k*0.45,-d/2+0.1,4.5,0.44+k*0.45,-d/2+0.5);
   for(const x of [-4.5,-1.5,1.5,4.5])B.box('wood',x-0.04,0,-d/2+0.1,x+0.04,1.8,-d/2+0.5);
   for(const x of [-2.2,2.0,3.3])B.box('iron',x-0.02,0.78,-0.4,x+0.02,2.3,-0.36);
   const up=new M().makeRotationY(yaw).multiply(new M().makeRotationX(Math.PI));
   const m=new M().setPosition(lb.x,CEIL-hang,lb.z).multiply(up);
   const g=place(B,m,'lab');
   const glass=new THREE.MeshLambertMaterial({color:0xcfe8e0,transparent:true,opacity:0.45,emissive:0x203028,side:THREE.DoubleSide,depthWrite:false});
   const liq=[0x8a1020,0x5a2a80,0x2a7a50].map(c=>new THREE.MeshLambertMaterial({color:c,emissive:c,emissiveIntensity:0.45}));
   const gB=[],lB=[[],[],[]];
   const flask=(x,y,z,r,h)=>{const body=new THREE.SphereGeometry(r,10,8);body.translate(x,y+r,z);const neck=new THREE.CylinderGeometry(r*0.3,r*0.3,h,8,1,true);neck.translate(x,y+2*r+h/2-0.01,z);gB.push(body,neck);
     const l=new THREE.SphereGeometry(r*0.8,8,6,0,Math.PI*2,Math.PI*0.45,Math.PI*0.55);l.translate(x,y+r,z);lB[Math.floor(rnd()*3)].push(l);};
   const tube=(x,y,z,h=0.16)=>{const t=new THREE.CylinderGeometry(0.015,0.015,h,6,1,true);t.translate(x,y+h/2,z);gB.push(t);const l=new THREE.CylinderGeometry(0.013,0.013,h*0.5,6);l.translate(x,y+h*0.25,z);lB[Math.floor(rnd()*3)].push(l);};
   for(let i=0;i<9;i++)flask(rr(-1.2,1.2),0.78,rr(-0.6,0.3),rr(0.04,0.09),rr(0.06,0.14));
   for(let i=0;i<8;i++)tube(-0.9+i*0.05,0.78,0.25);
   for(let k=0;k<4;k++)for(let i=0;i<10;i++)flask(rr(-4.3,4.3),0.44+k*0.45,-d/2+0.3,rr(0.03,0.07),rr(0.04,0.1));
   // the apparatus on the stands: vessels one above another, joined by tubes
   for(const x of [-2.2,2.0,3.3])for(let k=0;k<3;k++){flask(x+0.12,1.0+k*0.45,-0.38,rr(0.07,0.12),0.1);tube(x+0.12,1.25+k*0.45,-0.38,0.25);}
   const merged=list=>{const out=new THREE.BufferGeometry(),P2=[],N2=[];for(const q of list){const gg=q.index?q.toNonIndexed():q;P2.push(...gg.attributes.position.array);N2.push(...gg.attributes.normal.array);}
     out.setAttribute('position',new THREE.Float32BufferAttribute(P2,3));out.setAttribute('normal',new THREE.Float32BufferAttribute(N2,3));return out;};
   g.add(new THREE.Mesh(merged(gB),glass));lB.forEach((l,i)=>{if(l.length)g.add(new THREE.Mesh(merged(l),liq[i]));});
   // the rod it hangs from
   const rod=new Builder();rod.box('iron',-0.25,-0.45,-0.25,0.25,hang-0.4,0.25);
   place(rod,new M().setPosition(lb.x,CEIL-hang,lb.z).multiply(new M().makeRotationX(Math.PI)).multiply(new M().makeTranslation(0,-hang+0.4,0)),'lab rod');
   glow(tr(m,new V3(-w/2+0.45,0.4,-d/2+0.45)),WARM,1);glow(tr(m,new V3(0,1.2,0)),[1,0.5,0.4],1);
   // the red lights: rings in a cone over it, the widest highest, and a scatter across the ceiling round it
   const Rmax=Math.max(...P.lab.rings);
   for(const r of P.lab.rings){const yy=CEIL-1.5-(hang-8)*(1-r/Rmax),n=Math.round(2*Math.PI*r/1.1);
     for(let i=0;i<n;i++){const a=i/n*Math.PI*2;reds.push([lb.x+Math.cos(a)*r,yy+rr(-0.3,0.3),lb.z+Math.sin(a)*r]);}}
   for(let i=0;i<P.lab.scatter;i++){const a=rnd()*Math.PI*2,r=Math.sqrt(rnd())*P.lab.spread;reds.push([lb.x+Math.cos(a)*r,CEIL-rr(0.5,6),lb.z+Math.sin(a)*r]);}
   const rl=new THREE.PointLight(0xff2a1a,1.6,90,1.2);rl.position.set(lb.x,CEIL-hang-3,lb.z);root.add(rl);
   res(new V3(lb.x,CEIL-hang,lb.z),90);res(new V3(lb.x,CEIL-hang-80,lb.z),60);
   anchors.lab={pos:new V3(lb.x,CEIL-hang,lb.z),yaw,m};}

  // ---- the way in, in the ceiling ----
  const wi=V(THREE,[P.wayin.x,CEIL-0.7,P.wayin.z]);
  {const B=new Builder(),h=9,hx=2.73,hz=1.82;
   // the floor of the mansion's room seen from underneath, and the hole where the doors slid open
   B.box('wood',-h,0,-h,-hx,0.6,h);B.box('wood',hx,0,-h,h,0.6,h);B.box('wood',-hx,0,-h,hx,0.6,-hz);B.box('wood',-hx,0,hz,hx,0.6,h);
   for(let x=-h;x<=h;x+=KEN)if(Math.abs(x)>hx+0.1)B.beam('wood',[x,-0.2,-h],[x,-0.2,h],0.18,0.3);
   for(const s of [-1,1])B.quad('fusuma',[-hx,0,s*hz],[hx,0,s*hz],[hx,-KEN,s*(hz+0.25)],[-hx,-KEN,s*(hz+0.25)]);
   place(B,at(wi),'way in');
   const fire=new THREE.Mesh(new THREE.PlaneGeometry(12,9),new THREE.MeshBasicMaterial({map:fireTex(THREE),transparent:true,depthWrite:false,fog:false}));
   fire.rotation.x=Math.PI/2;fire.position.set(wi.x,wi.y+0.55,wi.z);fire.userData.kind='fire';root.add(fire);
   hooks.push(t=>{fire.material.opacity=0.85+0.15*Math.sin(t*9.1)*Math.sin(t*3.3);fire.material.map.offset.x=Math.sin(t*0.7)*0.02;});
   for(let i=0;i<8;i++)glow(new V3(wi.x+rr(-2.5,2.5),wi.y+rr(0,0.5),wi.z+rr(-1.6,1.6)),[1,0.5,0.15],2.2);
   const fl=new THREE.PointLight(0xff8a30,2.4,70,1.4);fl.position.set(wi.x,wi.y-2,wi.z);root.add(fl);
   hooks.push(t=>{fl.intensity=2.0+0.6*Math.sin(t*9.1)*Math.sin(t*3.3);});
   res(new V3(wi.x,CEIL-10,wi.z),26);anchors.wayin=wi;}

  // ---- the great floor, under it ----
  const gf=pv('floor');
  {const w=P.floor.w/2,d=P.floor.d/2,B=new Builder();
   B.box('dark',-w,0,-d,w,0.12,d,['ny']);
   for(let x=-w;x<=w+0.1;x+=12)for(const z of [-d,d]){B.box('wood',x-0.1,0,z-0.1,x+0.1,2.4,z+0.1);B.box('lamp',x-0.22,2.4,z-0.22,x+0.22,3,z+0.22);glow(new V3(gf.x+x,2.7,gf.z+z),WARM,1);}
   for(let z=-d+12;z<d;z+=12)for(const x of [-w,w]){B.box('wood',x-0.1,0,z-0.1,x+0.1,2.4,z+0.1);B.box('lamp',x-0.22,2.4,z-0.22,x+0.22,3,z+0.22);glow(new V3(gf.x+x,2.7,gf.z+z),WARM,1);}
   place(B,at(gf),'great floor');res(new V3(gf.x,8,gf.z),Math.hypot(w,d)*0.7);anchors.floor={pos:gf,w,d};}

  // ---- the cocoon ----
  const cc=pv('cocoon');
  {const B=new Builder(),n=12,w=n*KEN,H=5.46;room(B,w,w,{lit:false,roof:true,H});
   const yaw=P.cocoon.yaw,m=at(cc,yaw);place(B,m,'cocoon hall');
   const vt=veinTex(THREE,rnd);
   const flesh=new THREE.MeshLambertMaterial({color:0x7a1a1e,map:vt,emissive:0xff3322,emissiveMap:vt,emissiveIntensity:0.6});
   const geo=new THREE.IcosahedronGeometry(1,5),pa=geo.attributes.position,v=new V3();
   for(let i=0;i<pa.count;i++){v.fromBufferAttribute(pa,i);const k=1+0.12*Math.sin(v.x*4.1+v.y*2.3)+0.08*Math.sin(v.z*6.7-v.y*3.1)+0.04*Math.sin(v.x*11+v.z*9)-0.12*Math.max(0,-v.y);pa.setXYZ(i,v.x*k,v.y*k,v.z*k);}
   geo.computeVertexNormals();
   const g=new THREE.Group();g.matrixAutoUpdate=false;g.matrix.copy(m);g.userData.kind='cocoon';root.add(g);
   const blob=new THREE.Mesh(geo,flesh);blob.scale.set(1.7,2.3,1.7);blob.position.set(0,2.1,-1);g.add(blob);
   // its roots: out across the tatami, and some of them on up the fusuma and over the ceiling
   for(let i=0;i<16;i++){const a=i/16*Math.PI*2+rr(-0.15,0.15),ca=Math.cos(a),sa=Math.sin(a),edge=w/2-0.15,up=rnd()<0.5;
     const reach=up?edge/Math.max(Math.abs(ca),Math.abs(sa)):rr(5,edge-1);
     const pts=[new V3(ca*1.2,0.5,sa*1.2-1),new V3(ca*2.4,0.1,sa*2.4-1)];
     for(let k=1;k<=4;k++){const f=k/4,wob=Math.sin(f*7+i)*0.8;pts.push(new V3(ca*(2.4+(reach-2.4)*f)-sa*wob,0.06,sa*(2.4+(reach-2.4)*f)+ca*wob-1));}
     if(up){const top=rr(2,H-0.3),e=pts[pts.length-1];pts.push(new V3(e.x,top*0.5,e.z),new V3(e.x+rr(-1,1),top,e.z+rr(-1,1)));}
     const tb=new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),48,rr(0.07,0.2),6,false);g.add(new THREE.Mesh(tb,flesh));}
   const pool=new THREE.Mesh(new THREE.CircleGeometry(3.4,40).rotateX(-Math.PI/2),new THREE.MeshLambertMaterial({color:0x3a0608,emissive:0x2a0404}));pool.position.set(0,0.03,-1);g.add(pool);
   hooks.push(t=>{const b=1+0.035*Math.sin(t*1.9)+0.015*Math.sin(t*5.3);blob.scale.set(1.7*b,2.3*(2-b),1.7*b);flesh.emissiveIntensity=0.45+0.35*Math.max(0,Math.sin(t*1.9));});
   for(let i=0;i<5;i++)glow(tr(m,new V3(rr(-1.5,1.5),rr(0.5,3),rr(-2.5,0.5))),RED,1.4);
   const rl=new THREE.PointLight(0xff3020,1.6,26,1.5);rl.position.copy(tr(m,new V3(0,3.4,1.5)));root.add(rl);
   hooks.push(t=>{rl.intensity=1.1+0.7*Math.max(0,Math.sin(t*1.9));});
   glow(tr(m,new V3(-w/2+0.45,0.4,-w/2+0.45)),WARM,1);
   res(new V3(cc.x,cc.y+3,cc.z),w*0.8);anchors.cocoon={pos:cc,yaw};}

  // ---- the stair-well ----
  const wl=pv('well');
  {const H=P.well.h,inner=17,t=6,yaw=P.well.yaw,q=new Q().setFromAxisAngle(new V3(0,1,0),yaw);
   const m=at(wl,yaw);
   for(const [x,z,W,D] of [[0,-(inner+t)/2,inner+2*t,t],[0,(inner+t)/2,inner+2*t,t],[-(inner+t)/2,0,t,inner],[(inner+t)/2,0,t,inner]]){
     // the side towards the hall is left open for two thirds of its height, so the stairs can be seen
     if(z>0){const lo=H*0.62;shell.box(tr(m,new V3(x,lo+(H-lo)/2,z)),q,W,H-lo,D,{seed:rnd(),mid:true,fixed:true,tag:'well'});continue;}
     shell.box(tr(m,new V3(x,H/2,z)),q,W,H,D,{seed:rnd(),mid:true,fixed:true,tag:'well'});}
   // a square spiral of flights and landings up the middle, turning right at every landing
   const c=kit.cluster(m,{fixed:true});const p=new V3(-2.7,0,-2.7);let h=0;const dir=a=>new V3(Math.sin(a),0,Math.cos(a));
   const n=Math.floor(H/STAIR.rise)-1;
   for(let i=0;i<n;i++){kit.add(c,'stair',new M().makeRotationY(h).setPosition(p.x,p.y,p.z));p.addScaledVector(dir(h),STAIR.run);p.y+=STAIR.rise;
     kit.add(c,'landing',new M().makeRotationY(h).setPosition(p.x,p.y,p.z));const ctr=p.clone().addScaledVector(dir(h),0.65);h-=Math.PI/2;p.copy(ctr).addScaledVector(dir(h),0.65);}
   const Bw=new Builder();for(let y=3;y<H;y+=6){for(const [x,z] of [[-8.3,-8.3],[8.3,-8.3],[-8.3,8.3],[8.3,8.3]]){Bw.box('lamp',x-0.2,y,z-0.2,x+0.2,y+0.6,z+0.2);glow(tr(m,new V3(x,y+0.3,z)),WARM,0.9);}}
   place(Bw,m,'well lamps');
   for(const f of [0.25,0.7]){const wl2=new THREE.PointLight(0xffa860,1.4,50,1.6);wl2.position.copy(tr(m,new V3(0,H*f,0)));root.add(wl2);}
   for(let y=0;y<=H;y+=18)res(tr(m,new V3(0,y,0)),22);anchors.well={pos:wl,yaw,H};}

  // ---- Doma's lake ----
  const dm=pv('doma');
  {const R=P.doma.r,yaw=P.doma.yaw,m=at(dm,yaw);
   // the water, let into the tatami, with a board edge and stones round it
   const Be=new Builder(),nS=120;
   for(let i=0;i<nS;i++){const a0=i/nS*Math.PI*2,a1=(i+1)/nS*Math.PI*2,c0=Math.cos(a0),s0=Math.sin(a0),c1=Math.cos(a1),s1=Math.sin(a1),R1=R+5;
     Be.quad('plank',[c0*R,0.35,s0*R],[c1*R,0.35,s1*R],[c1*R1,0.35,s1*R1],[c0*R1,0.35,s0*R1],[0,1,0]);
     Be.quad('wood',[c0*R1,0,s0*R1],[c1*R1,0,s1*R1],[c1*R1,0.35,s1*R1],[c0*R1,0.35,s0*R1],[c0,0,s0]);
     Be.quad('wood',[c0*R,0.05,s0*R],[c1*R,0.05,s1*R],[c1*R,0.35,s1*R],[c0*R,0.35,s0*R],[-c0,0,-s0]);}
   const g=place(Be,m,'doma edge');
   const water=new THREE.Mesh(new THREE.CircleGeometry(R+0.2,128).rotateX(-Math.PI/2),new THREE.MeshPhongMaterial({color:0x05262a,emissive:0x031a1c,specular:0x2a6a6a,shininess:220}));
   water.position.y=0.08;water.userData.kind='doma water';g.add(water);
   // the palace: a deck on stilts at the back of the lake, a hall up a red stair on a podium, and a tower of
   // five roofs either side of it
   const pz=-R*0.42,D=new Builder();
   D.box('dark',-62,2.9,-34,62,3.4,12,['ny']);D.box('wood',-62,2.2,-34,62,2.9,12);
   for(let x=-60;x<=60;x+=6)for(let z=-32;z<=10;z+=6)D.box('wood',x-0.25,0,z-0.25,x+0.25,2.2,z+0.25);
   D.box('plaster',-18,3.4,-30,18,15,-8);
   for(let x=-17;x<=17;x+=KEN)D.box('wood',x-0.15,3.4,-8.2,x+0.15,15,-7.8);
   // the stair: forty steps, ten metres wide, lacquered red, with a red frame at the top of it
   for(let i=0;i<40;i++){const y=3.4+i*0.29,z=11-i*0.48;D.box('red',-5,y,z-0.48,5,y+0.29,z);}
   for(const s of [-1,1]){D.beam('red',[s*5.3,3.4,11],[s*5.3,15,-8],0.4,0.9);D.box('red',s*5.2-0.3,15,-8.5,s*5.2+0.3,24,-7.9);}
   D.box('red',-7,24,-8.6,7,24.8,-7.8);D.box('red',-6,22.4,-8.5,6,22.9,-7.9);
   place(D,T4(m,0,0,pz),'doma palace');
   const Hh=new Builder();room(Hh,16*KEN,9*KEN,{lit:true,roof:true,rail:true,H:6});place(Hh,T4(m,0,15,pz-19),'doma hall');
   for(const sx of [-38,38]){const Tw=new Builder();let y=0;
     for(let i=0;i<5;i++){const s=(22-3.2*i)/2,h=i===0?9:7;
       Tw.box('dark',-s,y,-s,s,y+h,s);
       for(const f of [[-s,s,s+0.05,0],[-s,s,-s-0.05,1]])Tw.quad('shojiDim',[f[0],y+1.2,f[2]],[f[1],y+1.2,f[2]],[f[1],y+h-1.6,f[2]],[f[0],y+h-1.6,f[2]]);
       Tw.quad('shojiDim',[s+0.05,y+1.2,s],[s+0.05,y+1.2,-s],[s+0.05,y+h-1.6,-s],[s+0.05,y+h-1.6,s]);Tw.quad('shojiDim',[-s-0.05,y+1.2,-s],[-s-0.05,y+1.2,s],[-s-0.05,y+h-1.6,s],[-s-0.05,y+h-1.6,-s]);
       for(const [a,b] of [[[-s,-s],[s,-s]],[[s,-s],[s,s]],[[s,s],[-s,s]],[[-s,s],[-s,-s]]])Tw.beam('red',[a[0],y+h-1.3,a[1]],[b[0],y+h-1.3,b[1]],0.3,0.4);
       hipRoof(Tw,-s-3.2,s+3.2,-s-3.2,s+3.2,y+h,0.22);
       Tw.quad('dark',[-s-3.2,y+h-0.02,-s-3.2],[s+3.2,y+h-0.02,-s-3.2],[s+3.2,y+h-0.02,s+3.2],[-s-3.2,y+h-0.02,s+3.2],[0,-1,0]);
       // red lamps at the corners of every roof, and red light in its windows
       for(const [a,b] of [[1,1],[-1,1],[1,-1],[-1,-1]])glow(tr(m,new V3(sx+a*(s+3),3.4+y+h-0.5,pz-20+b*(s+3))),[1,0.3,0.15],1.4);
       for(const [a,b] of [[0,1],[0,-1],[1,0],[-1,0]])glow(tr(m,new V3(sx+a*(s+0.3),3.4+y+h/2,pz-20+b*(s+0.3))),[1,0.25,0.1],1.1);
       y+=h+1.4;}
     Tw.box('iron',-0.2,y,-0.2,0.2,y+8,0.2);
     place(Tw,T4(m,sx,3.4,pz-20),'doma tower');}
   // boardwalks out across the water to it, with lamps on posts along them
   const piers=[],bw=kit.cluster(m,{fixed:true,tint:0.85});
   for(const x of [-44,-14,14,44])piers.push([[x,R-4],[x,pz+12]]);
   for(const z of [R*0.15,R*0.55])piers.push([[-R*0.8,z],[R*0.8,z]]);
   const Bl=new Builder();
   for(const [[x0,z0],[x1,z1]] of piers){const L=Math.hypot(x1-x0,z1-z0),n=Math.floor(L/(2*KEN)),a=Math.atan2(-(z1-z0),x1-x0);
     for(let k=0;k<n;k++)kit.add(bw,'bridge',new M().makeRotationY(a).setPosition(x0,1.4,z0).multiply(new M().makeTranslation(k*2*KEN,0,0)));
     for(let f=0;f<=L;f+=16){const x=x0+(x1-x0)*f/L,z=z0+(z1-z0)*f/L,ox=-(z1-z0)/L*1.1,oz=(x1-x0)/L*1.1;
       Bl.box('wood',x+ox-0.1,0,z+oz-0.1,x+ox+0.1,4.2,z+oz+0.1);Bl.box('lamp',x+ox-0.3,4.2,z+oz-0.3,x+ox+0.3,5.1,z+oz+0.3);Bl.box('roof',x+ox-0.45,5.1,z+oz-0.45,x+ox+0.45,5.3,z+oz+0.45);
       glow(tr(m,new V3(x+ox,4.65,z+oz)),WARM,1.5);}}
   place(Bl,m,'doma lamps');
   // lotus: pads everywhere the palace and the boardwalks are not, and flowers standing up out of them
   const pad=new THREE.CircleGeometry(1,16,0.3,Math.PI*2-0.5).rotateX(-Math.PI/2);
   const padM=new THREE.MeshLambertMaterial({color:0x2c6a40,emissive:0x0c3a20,side:THREE.DoubleSide});
   const nP=P.doma.pads,pads=new THREE.InstancedMesh(pad,padM,nP);pads.userData.kind='lotus pads';
   const petal=new THREE.SphereGeometry(1,8,6);petal.scale(0.13,0.05,0.3);petal.translate(0,0,0.26);
   const petM=new THREE.MeshLambertMaterial({color:0xf4d4de,emissive:0x5a2a3a});
   const flowers=[],sm=new M();
   const free=(x,z)=>!(x>-64&&x<64&&z>pz-40&&z<pz+14)&&piers.every(([[x0,z0],[x1,z1]])=>{const dx=x1-x0,dz=z1-z0,L2=dx*dx+dz*dz,t=Math.max(0,Math.min(1,((x-x0)*dx+(z-z0)*dz)/L2));return Math.hypot(x-x0-dx*t,z-z0-dz*t)>2.4;});
   for(let i=0;i<nP;i++){let x=0,z=0,k=0;do{const a=rnd()*Math.PI*2,r=Math.sqrt(rnd())*(R-1.5);x=Math.cos(a)*r;z=Math.sin(a)*r;k++;}while(k<30&&!free(x,z));
     const s=rr(0.35,1.2);sm.compose(new V3(x,0.1,z),new Q().setFromAxisAngle(new V3(0,1,0),rnd()*6.3),new V3(s,1,s));pads.setMatrixAt(i,sm);
     if(rnd()<0.12)flowers.push([x+rr(-0.3,0.3),z+rr(-0.3,0.3),rr(0.7,1.3)]);}
   g.add(pads);
   const pets=new THREE.InstancedMesh(petal,petM,flowers.length*12);pets.userData.kind='lotus';
   {let j=0;const e=new THREE.Euler();for(const [x,z,s] of flowers)for(let k=0;k<12;k++){const inner=k>=7,a=(k%7)/(inner?5:7)*Math.PI*2+(inner?0.4:0);
     e.set(0,a,0,'YXZ');const qq=new Q().setFromEuler(e).multiply(new Q().setFromAxisAngle(new V3(1,0,0),-(inner?1.05:0.6)));
     sm.compose(new V3(x,0.16+0.28*s,z),qq,new V3(s,s,s));pets.setMatrixAt(j++,sm);}}
   g.add(pets);
   // teal: the light the water gives, and the one the palace stands in
   for(const [x,y,z,i] of [[0,40,pz-10,1.4],[-R*0.5,40,R*0.3,0.8],[R*0.5,40,R*0.3,0.8]]){const l=new THREE.PointLight(0x40e0d0,i,R*1.3,1.3);l.position.copy(tr(m,new V3(x,y,z)));root.add(l);}
   res(new V3(dm.x,20,dm.z),R+12);res(new V3(dm.x,70,dm.z),R*0.8);anchors.doma={pos:dm,yaw,R,m,pz};}

  // ---- Akaza's hall ----
  const ak=pv('akaza');
  {const w=P.akaza.w/2,d=P.akaza.d/2,H=7.28,yaw=P.akaza.yaw,m=at(ak,yaw),B=new Builder();
   // dark polished boards
   B.box('wood',-w,-1.4,-d,w,-0.1,d);B.box('dark',-w+0.1,-0.1,-d+0.1,w-0.1,0,d-0.1,['ny']);
   // the back is a wall of the castle; the other three sides are open behind a heavy rail, posts every two ken
   B.box('plaster',-w,0,-d-0.4,w,H,-d);
   for(let x=-w;x<=w+0.01;x+=2*KEN)B.box('wood',x-0.25,0,-d-0.1,x+0.25,H,-d+0.4);
   const sides=[[[-w,-d],[-w,d]],[[-w,d],[w,d]],[[w,d],[w,-d]]];
   for(const [a,b] of sides){const L=Math.hypot(b[0]-a[0],b[1]-a[1]),n=Math.round(L/(2*KEN));
     for(let i=0;i<=n;i++){const f=i/n,x=a[0]+(b[0]-a[0])*f,z=a[1]+(b[1]-a[1])*f;B.box('wood',x-0.25,0,z-0.25,x+0.25,H,z+0.25);}
     B.beam('wood',[a[0],1.1,a[1]],[b[0],1.1,b[1]],0.24,0.2);B.beam('wood',[a[0],0.55,a[1]],[b[0],0.55,b[1]],0.12,0.12);B.beam('wood',[a[0],0.12,a[1]],[b[0],0.12,b[1]],0.2,0.24);
     B.beam('wood',[a[0],H-0.4,a[1]],[b[0],H-0.4,b[1]],0.4,0.8);}
   B.beam('wood',[-w,H-0.4,-d],[w,H-0.4,-d],0.4,0.8);
   B.box('plank',-w,H,-d,w,H+0.3,d);
   for(let x=-w+2*KEN;x<w;x+=2*KEN)B.beam('wood',[x,H-0.2,-d],[x,H-0.2,d],0.3,0.4);
   // lamps on the beams, all the way round, a pair to each bay
   for(const [a,b] of sides.concat([[[w,-d],[-w,-d]]])){const L=Math.hypot(b[0]-a[0],b[1]-a[1]),n=Math.round(L/(2*KEN)),nx=-(b[1]-a[1])/L,nz=(b[0]-a[0])/L;
     for(let i=0;i<n;i++){const f=(i+0.5)/n,x=a[0]+(b[0]-a[0])*f+nx*0.45,z=a[1]+(b[1]-a[1])*f+nz*0.45;B.box('lamp',x-0.2,H-1.9,z-0.2,x+0.2,H-1.3,z+0.2);glow(tr(m,new V3(x,H-1.6,z)),WARM,1.1);}}
   place(B,m,'akaza hall');
   const dm2=new THREE.Mesh(new THREE.PlaneGeometry(24,24).rotateX(-Math.PI/2),new THREE.MeshBasicMaterial({map:compassTex(THREE),transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,color:0x9fe8ff}));
   dm2.position.set(ak.x,ak.y+0.03,ak.z);dm2.userData.kind='compass';root.add(dm2);
   hooks.push(t=>{dm2.material.opacity=0.7+0.25*Math.sin(t*1.3);dm2.rotation.y=t*0.05;});
   glow(new V3(ak.x,ak.y+0.6,ak.z),[0.5,0.85,1],2.5);
   const cl2=new THREE.PointLight(0x80d8ff,1.2,34,1.6);cl2.position.set(ak.x,ak.y+2.5,ak.z);root.add(cl2);
   // pillars the castle has thrown up in front of it, not quite upright, with water pouring off them
   const wt=waterTex(THREE,rnd);
   for(let i=0;i<3;i++){const lx=(i-1)*24+rr(-4,4),lz=d+rr(18,30),H2=110,W2=rr(10,14);
     const tilt=new Q().setFromAxisAngle(new V3(0,1,0),yaw).multiply(new Q().setFromEuler(new THREE.Euler(rr(-0.25,0.25),rnd()*Math.PI,rr(-0.25,0.25))));
     const pos=tr(m,new V3(lx,rr(-15,5),lz));shell.box(pos,tilt,W2,H2,W2,{seed:rnd(),mid:true,fixed:true,tag:'pillar'});
     res(pos,W2);
     const top=new V3(0,H2/2,W2/2+0.6).applyQuaternion(tilt).add(pos);
     const fall=new THREE.Mesh(new THREE.PlaneGeometry(W2*0.6,top.y-2,1,1),new THREE.MeshBasicMaterial({map:wt.clone(),color:0xcfeaff,transparent:true,opacity:0.55,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide}));
     fall.material.map.needsUpdate=true;fall.position.set(top.x,top.y/2+1,top.z);fall.lookAt(ak.x,top.y/2+1,ak.z);fall.userData.kind='waterfall';root.add(fall);
     const sp=0.35+rnd()*0.15;hooks.push(t=>{fall.material.map.offset.y=t*sp;});
     glow(top,[0.7,0.85,1],3);glow(new V3(top.x,2,top.z),[0.7,0.85,1],2.5);}
   res(ak,Math.hypot(w,d)+8);anchors.akaza={pos:ak,yaw,w,d};}

  // ---- the pillar hall ----
  const kk=pv('kokushibo');
  {const L=P.kokushibo.l/2,Wd=P.kokushibo.w/2,H=P.kokushibo.h,yaw=P.kokushibo.yaw,m=at(kk,yaw),q=new Q().setFromAxisAngle(new V3(0,1,0),yaw),B=new Builder();
   // the long axis runs back towards the wall: the open end faces the hall
   B.box('wood',-Wd,-1.4,-L,Wd,-0.08,L);B.box('plank',-Wd+0.1,-0.08,-L+0.1,Wd-0.1,0,L-0.1,['ny']);
   B.box('plank',-Wd,H,-L,Wd,H+0.3,L);
   for(let z=-L;z<=L;z+=2*KEN)B.beam('wood',[-Wd,H-0.3,z],[Wd,H-0.3,z],0.4,0.6);
   B.beam('wood',[-Wd+6,H-0.9,-L],[-Wd+6,H-0.9,L],0.5,0.6);B.beam('wood',[Wd-6,H-0.9,-L],[Wd-6,H-0.9,L],0.5,0.6);
   for(let z=-L+3;z<L;z+=6)for(const x of [-Wd+0.4,Wd-0.4]){B.box('lamp',x-0.18,1.4,z-0.18,x+0.18,2,z+0.18);glow(tr(m,new V3(x,1.7,z)),[0.75,0.95,0.8],0.7);}
   place(B,m,'pillar hall');
   const tiers=Math.round(H/3.6);
   for(const s of [-1,1])shell.box(tr(m,new V3(s*(Wd+3),H/2,0)),q.clone().multiply(new Q().setFromAxisAngle(new V3(0,1,0),-s*Math.PI/2)),2*L,tiers*3.6,6,{seed:rnd(),mid:true,fixed:true,tag:'pillar hall'});
   shell.box(tr(m,new V3(0,H/2,-L-3)),q,2*Wd+12,tiers*3.6,6,{seed:rnd(),mid:true,fixed:true,tag:'pillar hall'});
   const pg=new THREE.CylinderGeometry(1.35,1.45,H,24,1,true);{const uv=pg.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)*2*Math.PI*1.4/0.5,uv.getY(i)*H);}
   const cols=[];for(let z=-L+5;z<=L-4;z+=8)for(const x of [-Wd+6,0,Wd-6])cols.push([x,z]);
   const pil=new THREE.InstancedMesh(pg,mats.wood,cols.length);pil.userData.kind='pillars';
   const pm=new M();cols.forEach(([x,z],i)=>{pil.setMatrixAt(i,pm.copy(m).multiply(new M().makeTranslation(x,H/2,z)));});root.add(pil);
   const cut=new THREE.MeshBasicMaterial({map:crescentTex(THREE),transparent:true,depthWrite:false,color:0xffffff});
   for(let i=0;i<7;i++){const dd=new THREE.Mesh(new THREE.PlaneGeometry(rr(2,5),rr(2,5)).rotateX(-Math.PI/2),cut);
     dd.position.copy(tr(m,new V3(rr(-Wd+2,Wd-2),0.02+i*0.001,rr(-L+3,L-3))));dd.rotation.y=rnd()*6.3;dd.userData.kind='cut';root.add(dd);}
   // the light at the top of it is pale and green, not amber
   const gl=new THREE.PointLight(0xb8ffd8,1.3,70,1.4);gl.position.copy(tr(m,new V3(0,H-3,0)));root.add(gl);
   res(kk,Math.hypot(L,Wd)+6);anchors.kokushibo={pos:kk,yaw,L,Wd,H};}

  // the lamps of the places, as a cloud of glows; and Muzan's red lights, as another
  const cloud=(list,size,kind)=>{const pos=new Float32Array(list.length*3),cl=new Float32Array(list.length*3);
    list.forEach((g,i)=>{pos.set(g.slice(0,3),i*3);cl.set(g.length>3?g.slice(3):[1,0.16,0.08],i*3);});
    const gg=new THREE.BufferGeometry();gg.setAttribute('position',new THREE.BufferAttribute(pos,3));gg.setAttribute('color',new THREE.BufferAttribute(cl,3));
    const pts=new THREE.Points(gg,new THREE.PointsMaterial({size,map:T.dot,vertexColors:true,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending}));
    pts.userData.kind=kind;root.add(pts);return pts;};
  cloud(glows,3.2,'place lamps');cloud(reds,2.4,'red lights');

  return {reserved,hooks,anchors};
}

// ---- Nakime ----
// As the anime draws her: kneeling, in a black kimono with a white collar and a striped obi, black hair to the
// floor with a fringe over her eyes, and the biwa standing upright in her lap, its neck by her head and the
// pegbox bent back. Her right arm holds the plectrum (bachi) and is what strums.
function nakime(THREE){
  const L=(c,o)=>new THREE.MeshLambertMaterial(Object.assign({color:c},o||{}));
  const kim=L(0x17141a),white=L(0xe8e2d8),hair=L(0x0a090b,{side:THREE.DoubleSide}),skin=L(0xeadfd6),wood=L(0x9a6232),dark=L(0x4a2a14);
  const oc=document.createElement('canvas');oc.width=16;oc.height=64;const o=oc.getContext('2d');
  for(let i=0;i<8;i++){o.fillStyle=i%2?'#c9a24a':'#3a2a18';o.fillRect(0,i*8,16,8);}
  const obi=L(0xffffff,{map:new THREE.CanvasTexture(oc)});
  const g=new THREE.Group();g.userData.kind='nakime';
  const add=(geo,mat,x,y,z,rx=0,ry=0,rz=0,par=g)=>{const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);m.rotation.set(rx,ry,rz);par.add(m);return m;};
  // kneeling: the kimono spread round her knees
  const lap=add(new THREE.SphereGeometry(1,20,12,0,Math.PI*2,0,Math.PI/2),kim,0,0.02,0.08);lap.scale.set(0.36,0.26,0.38);
  add(new THREE.CylinderGeometry(0.16,0.26,0.56,14),kim,0,0.5,-0.05);
  add(new THREE.CylinderGeometry(0.2,0.215,0.15,14),obi,0,0.42,-0.05);
  // the white collar, crossed at the front
  for(const s of [-1,1])add(new THREE.BoxGeometry(0.035,0.26,0.02),white,s*0.05,0.66,0.12,0.2,0,s*0.5);
  add(new THREE.SphereGeometry(0.105,14,10),skin,0,0.88,-0.03);
  const lips=add(new THREE.BoxGeometry(0.03,0.008,0.01),L(0x9a1a2a),0,0.83,0.07);void lips;
  // her hair: over the crown and down her back to the floor, and a fringe over her eyes
  add(new THREE.SphereGeometry(0.125,14,10,0,Math.PI*2,0,Math.PI/2),hair,0,0.9,-0.03);
  add(new THREE.CylinderGeometry(0.125,0.3,0.92,18,1,true,Math.PI*0.3,Math.PI*1.4),hair,0,0.47,-0.03);
  add(new THREE.BoxGeometry(0.22,0.07,0.04),hair,0,0.9,0.075,-0.25);
  // the biwa, upright: a pear of pale wood with a dark face-board, a short neck up past her cheek, the
  // pegbox bent sharply back, and its pegs
  const bw=new THREE.Group();bw.position.set(0.03,0.16,0.26);bw.rotation.set(-0.12,0,-0.22);g.add(bw);
  const body=add(new THREE.SphereGeometry(1,20,14),wood,0,0.3,0,0,0,0,bw);body.scale.set(0.19,0.32,0.06);
  const face=add(new THREE.SphereGeometry(1,20,14,0,Math.PI*2,0,Math.PI/2),dark,0,0.3,0.035,Math.PI/2,0,0,bw);face.scale.set(0.16,0.28,0.02);
  add(new THREE.BoxGeometry(0.05,0.36,0.04),wood,0,0.78,0,0,0,0,bw);
  const peg=add(new THREE.BoxGeometry(0.055,0.16,0.04),wood,0,0.98,-0.05,-1.2,0,0,bw);void peg;
  for(let i=0;i<4;i++)add(new THREE.CylinderGeometry(0.008,0.01,0.14,6),dark,(i%2?0.05:-0.05),0.94+Math.floor(i/2)*0.05,-0.08-Math.floor(i/2)*0.03,0,0,Math.PI/2,bw);
  const sg=new THREE.BufferGeometry().setFromPoints([-0.02,-0.007,0.007,0.02].flatMap(x=>[new THREE.Vector3(x,0.08,0.05),new THREE.Vector3(x*0.6,0.95,0.025)]));
  bw.add(new THREE.LineSegments(sg,new THREE.LineBasicMaterial({color:0xe8dcc0})));
  // left arm up to the neck, the white of the under-sleeve at the wrist
  add(new THREE.BoxGeometry(0.1,0.1,0.34),kim,-0.14,0.72,0.12,-0.9,0.3,0);
  add(new THREE.BoxGeometry(0.07,0.07,0.04),white,-0.08,0.86,0.26);
  const arm=new THREE.Group();arm.position.set(0.24,0.68,-0.02);g.add(arm);
  const sleeve=add(new THREE.BoxGeometry(0.2,0.44,0.28),kim,0.04,-0.2,0.02,0,0,0,arm);void sleeve;
  add(new THREE.BoxGeometry(0.08,0.08,0.3),kim,-0.06,-0.3,0.2,0,0.4,0,arm);
  add(new THREE.BoxGeometry(0.06,0.06,0.04),white,-0.12,-0.3,0.34,0,0,0,arm);
  const bachi=add(new THREE.ConeGeometry(0.09,0.17,3),L(0xe6dcc4),-0.16,-0.3,0.38,0,0,Math.PI,arm);bachi.scale.z=0.15;
  arm.rotation.x=-0.25;
  return {group:g,arm};
}

// ---- canvases for the places ----
function cv(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;return [c,c.getContext('2d')];}
function fireTex(THREE){const [c,g]=cv(256,192);
  const gr=g.createRadialGradient(128,96,10,128,96,140);gr.addColorStop(0,'rgba(255,240,180,1)');gr.addColorStop(0.3,'rgba(255,150,40,0.95)');gr.addColorStop(0.7,'rgba(150,30,5,0.8)');gr.addColorStop(1,'rgba(20,5,0,0.9)');
  g.fillStyle=gr;g.fillRect(0,0,256,192);
  // the mansion's beams, black against it
  g.fillStyle='rgba(10,4,2,0.9)';for(let i=0;i<5;i++)g.fillRect(i*56+10,0,9,192);g.fillRect(0,40,256,8);g.fillRect(0,130,256,6);
  return new THREE.CanvasTexture(c);}
function veinTex(THREE,rnd){const [c,g]=cv(256,256);g.fillStyle='#3a0508';g.fillRect(0,0,256,256);
  const vein=(x,y,a,w,d)=>{if(d>6||w<0.4)return;const l=20+rnd()*40,x2=x+Math.cos(a)*l,y2=y+Math.sin(a)*l;
    g.strokeStyle=`rgba(255,${60+rnd()*60|0},${40+rnd()*30|0},${0.5+0.4*rnd()})`;g.lineWidth=w;g.beginPath();g.moveTo(x,y);g.quadraticCurveTo(x+(rnd()-0.5)*20,y+(rnd()-0.5)*20,x2,y2);g.stroke();
    vein(x2,y2,a+(rnd()-0.5)*0.9,w*0.72,d+1);if(rnd()<0.5)vein(x2,y2,a+(rnd()<0.5?0.8:-0.8),w*0.5,d+1);};
  for(let i=0;i<14;i++)vein(rnd()*256,rnd()*256,rnd()*6.3,3+rnd()*3,0);
  const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;return t;}
function waterTex(THREE,rnd){const [c,g]=cv(64,256);g.clearRect(0,0,64,256);
  for(let i=0;i<60;i++){const x=rnd()*64,w=1+rnd()*4;const gr=g.createLinearGradient(0,0,0,256);const o=rnd();
    gr.addColorStop(0,'rgba(255,255,255,0)');gr.addColorStop(o*0.5,`rgba(255,255,255,${0.3+0.5*rnd()})`);gr.addColorStop(Math.min(1,o*0.5+0.4),'rgba(255,255,255,0)');
    g.fillStyle=gr;g.fillRect(x,0,w,256);}
  const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(2,3);return t;}
// Akaza's compass: rings, twelve needles, and the branches off them that make it a snowflake as well
function compassTex(THREE){const S=1024,[c,g]=cv(S,S),cx=S/2,R=S*0.47;
  g.strokeStyle='rgba(200,240,255,0.95)';g.shadowColor='rgba(120,210,255,1)';g.shadowBlur=14;
  const ring=(r,w)=>{g.lineWidth=w;g.beginPath();g.arc(cx,cx,r,0,Math.PI*2);g.stroke();};
  ring(R,5);ring(R*0.93,2);ring(R*0.5,3);ring(R*0.12,4);
  for(let i=0;i<12;i++){const a=i/12*Math.PI*2,ca=Math.cos(a),sa=Math.sin(a),long=i%3===0?R*0.99:R*0.9;
    g.lineWidth=i%3===0?6:3;g.beginPath();g.moveTo(cx+ca*R*0.12,cx+sa*R*0.12);g.lineTo(cx+ca*long,cx+sa*long);g.stroke();
    for(const f of [0.4,0.62,0.8]){const px=cx+ca*R*f,py=cx+sa*R*f,l=R*0.09*(1.2-f);g.lineWidth=2.5;
      for(const s of [-1,1]){const b=a+s*Math.PI/3;g.beginPath();g.moveTo(px,py);g.lineTo(px+Math.cos(b)*l,py+Math.sin(b)*l);g.stroke();}}
    // the diamond of a needle's point
    const tip=R*0.72,w=R*0.035;g.lineWidth=2;g.beginPath();g.moveTo(cx+ca*R*0.52,cx+sa*R*0.52);g.lineTo(cx+ca*tip-sa*w,cx+sa*tip+ca*w);g.lineTo(cx+ca*R*0.9,cx+sa*R*0.9);g.lineTo(cx+ca*tip+sa*w,cx+sa*tip-ca*w);g.closePath();g.stroke();}
  for(let i=0;i<60;i++){const a=i/60*Math.PI*2;g.lineWidth=1.5;g.beginPath();g.moveTo(cx+Math.cos(a)*R*0.93,cx+Math.sin(a)*R*0.93);g.lineTo(cx+Math.cos(a)*R,cx+Math.sin(a)*R);g.stroke();}
  return new THREE.CanvasTexture(c);}
function crescentTex(THREE){const [c,g]=cv(256,256);g.clearRect(0,0,256,256);
  g.fillStyle='rgba(12,6,10,0.85)';g.beginPath();g.arc(128,128,110,0.2,Math.PI-0.2);g.arc(128,96,96,Math.PI-0.35,0.35,true);g.closePath();g.fill();
  g.strokeStyle='rgba(150,90,170,0.35)';g.lineWidth=2;g.stroke();
  return new THREE.CanvasTexture(c);}
