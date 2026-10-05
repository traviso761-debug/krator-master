// ---------- the country's own trees, its rocks, and its clouds ----------
// Fan work: Breath of the Wild belongs to Nintendo, and every shape here is this project's own.
//
// The engine plants one kind of round tree everywhere, which suits a park. Hyrule's woods change with the land: firs
// on Hebra and Tabantha and up any high slope, palms along the south coast and round Lurelin and the desert's oases,
// Akkala's woods in autumn red and orange, and the round broadleaves the engine already draws everywhere else. Rocks
// stand about everywhere - boulders on the fields, outcrops on the slopes. And clouds drift over, soft and white,
// the way the game paints them. All instanced: a few draw calls for thousands of each.
import { mkRng } from '../core/rng.js';

export function flora(api){
  const {THREE,ctx,scene,animHooks,groundH}=api;
  const PL=ctx.plan;if(!PL)return;
  const R=mkRng(1987),RG=PL.regions||{};
  const inR=(k,x,z)=>{const r=RG[k];if(!r)return 0;const dx=(x-r[0][0])/r[1],dz=(z-r[0][1])/r[2],d=Math.sqrt(dx*dx+dz*dz);return d>=1?0:1-d*d;};
  const inLake=(x,z)=>{for(const L of (PL.lakes||[])){let c=false;const p=L.poly;for(let i=0,j=p.length-1;i<p.length;j=i++){if((p[i][1]>z)!==(p[j][1]>z)&&x<(p[j][0]-p[i][0])*(z-p[i][1])/(p[j][1]-p[i][1])+p[i][0])c=!c;}if(c)return true;}
    for(const M of (PL.moats||[])){const d=Math.hypot(x-M.x,z-M.z);if(d>M.r0-6&&d<M.r1+6)return true;}
    for(const [px,pz,r] of (PL.pads||[]))if(Math.hypot(x-px,z-pz)<r)return true;   // and nothing grows in the towns
    return false;};
  const slope=(x,z)=>{const a=groundH(x+6,z)-groundH(x-6,z),b=groundH(x,z+6)-groundH(x,z-6);return Math.hypot(a,b)/12;};
  const dm=new THREE.Object3D(),col=new THREE.Color();
  // a kit of instanced parts, filled as we go and built at the end
  const kit={};
  const part=(name,geo,mat)=>{kit[name]={geo,mat,list:[]};};
  const put=(name,x,y,z,sx,sy,sz,ry,c)=>kit[name].list.push([x,y,z,sx,sy,sz,ry||0,c]);
  const L=(c,o)=>new THREE.MeshLambertMaterial(Object.assign({color:c,flatShading:true},o||{}));
  part('trunk',new THREE.CylinderGeometry(0.22,0.32,1,6).translate(0,0.5,0),L(0x6a4e36));
  part('fir',new THREE.ConeGeometry(1,1,7).translate(0,0.5,0),L(0xffffff));
  part('crown',new THREE.IcosahedronGeometry(1,0),L(0xffffff));
  part('frond',new THREE.ConeGeometry(0.16,1,4).rotateZ(Math.PI/2).translate(0.5,0,0),L(0x4f8a3a));
  part('rock',new THREE.IcosahedronGeometry(1,0),L(0xffffff));
  const FIR=[0x2f5a3a,0x3a6a40,0x2a4e36,0x46704a],SNOWFIR=[0xdfe8e4,0xc8d8d0],AUT=[0xc8602a,0xd8823a,0xb0402a,0xe0a040,0xa85a2a],ROCK=[0x8a8478,0x9a948a,0x7a746c,0xa8a094];
  const pick=a=>a[Math.floor(R()*a.length)];

  // ---- firs: the cold north and west, and any high slope ----
  let firs=0;for(let k=0;k<26000&&firs<5200;k++){const x=-6100+R()*12200,z=-5100+R()*10200,y=groundH(x,z);
    const cold=Math.max(inR('hebra',x,z),inR('gerudo_high',x,z)*0.6),high=y>260?Math.min(1,(y-260)/250):0;
    if(y<3||y>1050||inLake(x,z)||slope(x,z)>1.1)continue;if(R()>Math.max(cold*0.8,high*0.55))continue;
    const h=7+R()*9,snow=y>650&&R()<0.7;put('trunk',x,y,z,1,h*0.35,1);
    for(let t=0;t<3;t++)put('fir',x,y+h*(0.2+t*0.22),z,h*(0.32-t*0.07),h*0.45,h*(0.32-t*0.07),R()*6,snow&&t===2?pick(SNOWFIR):pick(FIR));firs++;}

  // ---- Akkala's woods in autumn ----
  let aut=0;for(let k=0;k<12000&&aut<1500;k++){const x=-6100+R()*12200,z=-5100+R()*10200,ak=inR('akkala',x,z);if(ak<=0||R()>ak)continue;
    const y=groundH(x,z);if(y<3||inLake(x,z)||slope(x,z)>0.9)continue;const s=3.5+R()*3;
    put('trunk',x,y,z,1.4,s*1.3,1.4);put('crown',x,y+s*1.6,z,s,s*0.9,s,R()*6,pick(AUT));if(R()<0.4)put('crown',x+s*0.5,y+s*1.25,z+s*0.4,s*0.7,s*0.6,s*0.7,R()*6,pick(AUT));aut++;}

  // ---- palms: the south coast, Lurelin, and the desert's oases ----
  const palmAt=(x,z)=>{const y=groundH(x,z);if(y<1.2||y>60||inLake(x,z))return false;const h=8+R()*6,lean=(R()-0.5)*0.5;
    put('trunk',x,y,z,0.9,h,0.9,lean);const tx=x+Math.sin(lean)*h*0.3;for(let f=0;f<7;f++){const a=f/7*Math.PI*2+R();put('frond',tx,y+h,z,4.2,1.2,1.2,a);}return true;};
  let palms=0;
  for(const s of [PL.sites.lurelin,PL.sites.gerudo_town,PL.sites.eventide])if(s)for(let k=0;k<60;k++){if(palmAt(s.x+(R()-0.5)*420,s.z+(R()-0.5)*420))palms++;}
  for(const [x,z] of (PL.coast||[]))if(z>2500||x>3500)for(let k=0;k<5;k++){const px=x+(R()-0.5)*600,pz=z+(R()-0.5)*600;if(inR('faron',px,pz)>0||pz>3800)if(palmAt(px,pz))palms++;}

  // ---- rocks: boulders in the fields, outcrops where the ground is steep ----
  let rocks=0;for(let k=0;k<30000&&rocks<4200;k++){const x=-6100+R()*12200,z=-5100+R()*10200,y=groundH(x,z);if(y<2||inLake(x,z))continue;
    const sl=slope(x,z),want=sl>0.5?0.5:0.06;if(R()>want)continue;const s=sl>0.5?4+R()*9:1.2+R()*3.5;
    put('rock',x,y+s*0.15,z,s*(0.8+R()*0.6),s*(0.5+R()*0.5),s*(0.8+R()*0.6),R()*6,y>620?0xd6d8d4:inR('deathmountain',x,z)>0.2?0x4a423c:inR('desert',x,z)>0.2?0xc8a878:pick(ROCK));rocks++;}

  // ---- build the kit ----
  for(const [name,K] of Object.entries(kit)){if(!K.list.length)continue;const im=new THREE.InstancedMesh(K.geo,K.mat,K.list.length);
    K.list.forEach(([x,y,z,sx,sy,sz,ry,c],i)=>{dm.position.set(x,y,z);dm.rotation.set(name==='trunk'?ry*0.4:0,name==='trunk'?0:ry,name==='frond'?-0.35:0);dm.scale.set(sx,sy,sz);dm.updateMatrix();im.setMatrixAt(i,dm.matrix);
      if(c!=null)im.setColorAt(i,col.setHex(c));else if(K.list.some(e=>e[7]!=null))im.setColorAt(i,col.copy(K.mat.color));});
    // thousands of firs and rocks are not worth their shadows; the autumn crowns are few and big
    if(im.instanceColor)im.instanceColor.needsUpdate=true;im.castShadow=name==='crown';im.receiveShadow=true;im.userData.noFingerprint=true;im.userData.wireCat='veg';scene.add(im);}

  // ---- clouds: soft white heaps drifting east, high over the country ----
  const tex=(()=>{const c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d');
    for(let k=0;k<14;k++){const x=20+Math.random()*88,y=40+Math.random()*50,r=18+Math.random()*26,gr=g.createRadialGradient(x,y,0,x,y,r);
      gr.addColorStop(0,'rgba(255,255,255,0.9)');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.fillRect(0,0,128,128);}
    return new THREE.CanvasTexture(c);})();
  const clouds=[];for(let k=0;k<70;k++){const m=new THREE.SpriteMaterial({map:tex,transparent:true,depthWrite:false,opacity:0.85,color:0xffffff});
    const sp=new THREE.Sprite(m);const s=500+R()*900;sp.scale.set(s,s*0.45,1);sp.userData.noFingerprint=true;sp.userData.noWire=true;scene.add(sp);
    clouds.push({sp,m,x:-9000+R()*18000,z:-7000+R()*14000,y:1500+R()*900,v:6+R()*6});}
  const nightF=()=>api.nightF&&api.hour?api.nightF(api.hour()):0;
  let last=performance.now();
  animHooks.push(now=>{const dt=Math.min(0.1,(now-last)/1000);last=now;const n=nightF();
    for(const c of clouds){c.x+=c.v*dt;if(c.x>9500)c.x=-9500;c.sp.position.set(c.x,c.y,c.z);c.m.color.setScalar(1-0.75*n);c.m.opacity=0.85-0.35*n;}});
  ctx.details=Object.assign(ctx.details||{},{firs,autumnTrees:aut,palms,rocks,clouds:clouds.length});
}
