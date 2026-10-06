// ---------- the country's own plants, its rocks, and its clouds, biome by biome ----------
// Fan work: Breath of the Wild belongs to Nintendo, and every shape here is this project's own.
//
// The engine plants one kind of round tree everywhere, which suits a park. Hyrule's plants change with its biomes
// (biomes.js, laid out by the generator from the map):
//   tundra, snowfield, highland   firs - snow-tipped up high - thinning out over the tundra
//   temperate woods               broadleaves close together, a few firs among them
//   the Lost Woods                big dark trees crowded together, and a fog drifting slowly through them
//   jungle                        tall broad trees in deep greens, palms, ferns on the ground
//   wetland marsh                 reeds in clumps, standing in the wet
//   desert and canyon             cacti with their arms up, dry scrub; palms at the oases
//   volcanic                      dead trees, bare and black
//   autumn                        Akkala's woods in red and orange and gold
//   grassland                     patches of flowers in the grass, white, yellow, blue
// Rocks everywhere, coloured by where they lie; clouds drift over. All instanced: a few draw calls for thousands.
import { mkRng } from '../core/rng.js';
import { biomeKit } from './biomes.js';

export function flora(api){
  const {THREE,ctx,scene,animHooks,groundH}=api;
  const PL=ctx.plan;if(!PL)return;
  const R=mkRng(1987),BK=biomeKit(PL);
  const inLake=(x,z)=>{for(const L of (PL.lakes||[])){let c=false;const p=L.poly;for(let i=0,j=p.length-1;i<p.length;j=i++){if((p[i][1]>z)!==(p[j][1]>z)&&x<(p[j][0]-p[i][0])*(z-p[i][1])/(p[j][1]-p[i][1])+p[i][0])c=!c;}if(c)return true;}
    for(const M of (PL.moats||[])){const d=Math.hypot(x-M.x,z-M.z);if(d>M.r0-6&&d<M.r1+6)return true;}
    for(const [px,pz,r] of (PL.pads||[]))if(Math.hypot(x-px,z-pz)<r)return true;   // and nothing grows in the towns
    return false;};
  // nothing grows on a canyon's floor or up its walls
  const inCanyon=(x,z)=>{for(const cy of (PL.canyons||[])){const P=cy.pts;for(let i=0;i+1<P.length;i++){const [ax,az]=P[i],[bx,bz]=P[i+1],dx=bx-ax,dz=bz-az,l=dx*dx+dz*dz,t=l?Math.max(0,Math.min(1,((x-ax)*dx+(z-az)*dz)/l)):0;
      if(Math.hypot(x-ax-t*dx,z-az-t*dz)<cy.floor+cy.wall)return true;}}return false;};
  const slope=(x,z)=>{const a=groundH(x+6,z)-groundH(x-6,z),b=groundH(x,z+6)-groundH(x,z-6);return Math.hypot(a,b)/12;};
  const dm=new THREE.Object3D(),col=new THREE.Color();
  // a kit of instanced parts, filled as we go and built at the end
  const kit={};
  const part=(name,geo,mat,shadow)=>{kit[name]={geo,mat,list:[],shadow};};
  const put=(name,x,y,z,sx,sy,sz,ry,c,rx,rz)=>kit[name].list.push([x,y,z,sx,sy,sz,ry||0,c,rx||0,rz||0]);
  const L=(c,o)=>new THREE.MeshLambertMaterial(Object.assign({color:c,flatShading:true},o||{}));
  part('trunk',new THREE.CylinderGeometry(0.22,0.32,1,6).translate(0,0.5,0),L(0xffffff));
  part('fir',new THREE.ConeGeometry(1,1,7).translate(0,0.5,0),L(0xffffff));
  part('crown',new THREE.IcosahedronGeometry(1,0),L(0xffffff),true);
  part('frond',new THREE.ConeGeometry(0.16,1,4).rotateZ(Math.PI/2).translate(0.5,0,0),L(0xffffff));
  part('reed',new THREE.ConeGeometry(0.12,1,3).translate(0,0.5,0),L(0xffffff));
  part('cactus',new THREE.CylinderGeometry(0.42,0.5,1,7).translate(0,0.5,0),L(0x5a8a4a));
  part('scrub',new THREE.IcosahedronGeometry(1,0),L(0xffffff));
  part('flower',new THREE.IcosahedronGeometry(1,0),L(0xffffff));
  part('rock',new THREE.IcosahedronGeometry(1,0),L(0xffffff));
  const FIR=[0x2f5a3a,0x3a6a40,0x2a4e36,0x46704a],SNOWFIR=[0xdfe8e4,0xc8d8d0],AUT=[0xc8602a,0xd8823a,0xb0402a,0xe0a040,0xa85a2a],ROCK=[0x8a8478,0x9a948a,0x7a746c,0xa8a094];
  const BROAD=[0x4a7a36,0x5c8c40,0x3e6a30,0x6a9a46],LOST=[0x2a4a2a,0x2e5630,0x24402a],JUNG=[0x2e7a2a,0x3a8a32,0x246a26,0x4a9a3a],FLOW=[0xf4f2ec,0xf0d040,0x6a8ae8,0xe86a8a];
  const pick=a=>a[Math.floor(R()*a.length)];
  const rx=()=>-6100+R()*12200,rz=()=>-5100+R()*10200;
  const fir=(x,y,z,h,snow)=>{put('trunk',x,y,z,1,h*0.35,1);for(let t=0;t<3;t++)put('fir',x,y+h*(0.2+t*0.22),z,h*(0.32-t*0.07),h*0.45,h*(0.32-t*0.07),R()*6,snow&&t===2?pick(SNOWFIR):pick(FIR));};
  const broad=(x,y,z,s,cols)=>{put('trunk',x,y,z,1.4,s*1.3,1.4);put('crown',x,y+s*1.6,z,s,s*0.9,s,R()*6,pick(cols));if(R()<0.4)put('crown',x+s*0.5,y+s*1.25,z+s*0.4,s*0.7,s*0.6,s*0.7,R()*6,pick(cols));};
  const palmAt=(x,z)=>{const y=groundH(x,z);if(y<1.2||inLake(x,z))return false;const h=8+R()*6,lean=(R()-0.5)*0.5;
    put('trunk',x,y,z,0.9,h,0.9,0,null,lean);const tx=x+Math.sin(lean)*h*0.3;for(let f=0;f<7;f++){const a=f/7*Math.PI*2+R();put('frond',tx,y+h,z,4.2,1.2,1.2,a,0x4f8a3a,0,-0.35);}return true;};
  const count={};const n=k=>count[k]=(count[k]||0)+1;

  // ---- the woods and the plants of each biome: sample the country, plant what belongs where it lands ----
  for(let k=0;k<90000;k++){const x=rx(),z=rz(),y=groundH(x,z);if(y<2||inLake(x,z)||inCanyon(x,z))continue;const sl=slope(x,z);if(sl>1.1)continue;
    const b=BK.at(x,z),r=R();
    if(b==='T'||b==='S'||b==='H'){const p=b==='H'?0.32:b==='T'?0.14:(y<700?0.12:0);if(r<p&&sl<0.9){fir(x,y,z,7+R()*9,y>560&&R()<0.7);n('firs');}}
    else if(b==='F'){if(r<0.34){if(R()<0.2)fir(x,y,z,8+R()*8,false);else broad(x,y,z,3.5+R()*3,BROAD);n('woods');}}
    else if(b==='L'){if(r<0.75){broad(x,y,z,5+R()*4,LOST);n('lostwoods');}}
    else if(b==='J'){if(r<0.5){if(R()<0.38)palmAt(x,z);else broad(x,y,z,5+R()*5,JUNG);n('jungle');}
      if(R()<0.4)for(let f=0;f<5;f++){const a=f/5*Math.PI*2+R();put('frond',x+3,y+0.3,z+2,2.4,0.8,1.6,a,pick(JUNG),0,-0.6);}}
    else if(b==='W'){if(r<0.5&&y<60){for(let c=0;c<7;c++)put('reed',x+(R()-0.5)*3,y,z+(R()-0.5)*3,1,1.6+R()*1.6,1,R()*6,R()<0.5?0x8a9a4a:0x6a8a3a,(R()-0.5)*0.3,(R()-0.5)*0.3);n('reeds');}}
    else if(b==='D'||b==='C'){if(r<0.025){const h=2.5+R()*3;put('cactus',x,y,z,1,h,1);for(const s of [-1,1])if(R()<0.7){const ah=h*(0.4+R()*0.3);put('cactus',x+s*0.6,y+ah,z,0.55,0.9,0.55,0,null,0,s*1.2);put('cactus',x+s*1.3,y+ah+0.4,z,0.55,h*0.35,0.55);}n('cacti');}
      else if(r<0.06){put('scrub',x,y+0.3,z,1+R(),0.6+R()*0.4,1+R(),R()*6,R()<0.5?0x8a8a4a:0x9a8a5a);n('scrub');}}
    else if(b==='V'){if(r<0.03&&y<900){const h=5+R()*5;put('trunk',x,y,z,1,h,1,R()*6,0x2a2420);for(let c=0;c<3;c++)put('trunk',x,y+h*(0.5+c*0.15),z,0.6,h*0.4,0.6,R()*6,0x2a2420,(R()-0.5)*1.6,(R()-0.5)*1.6);n('snags');}}
    else if(b==='A'){if(r<0.16&&sl<0.9){broad(x,y,z,3.5+R()*3,AUT);n('autumn');}}
    else if(b==='g'){if(r<0.02&&y<400){const c=pick(FLOW);for(let f=0;f<14;f++)put('flower',x+(R()-0.5)*9,y+0.25,z+(R()-0.5)*9,0.35,0.2,0.35,0,c);n('flowers');}}}
  // reeds along the marshy shores: the wetlands' lake and its islets, and the head of Lake Hylia, standing in the
  // shallows as well as on the bank
  for(const lk of (PL.lakes||[]))if(/Wetlands|Lake Hylia/.test(lk.name)){const p=lk.poly;for(let i=0;i<p.length;i++){const a=p[i],b=p[(i+1)%p.length],L_=Math.hypot(b[0]-a[0],b[1]-a[1]);
      for(let k=0;k<L_/9;k++){const t=R(),x=a[0]+(b[0]-a[0])*t+(R()-0.5)*40,z=a[1]+(b[1]-a[1])*t+(R()-0.5)*40,w=BK.at(x,z);if(w!=='W'&&!/Wetlands/.test(lk.name))continue;
        const y=Math.max(groundH(x,z),lk.level-0.6);for(let c=0;c<7;c++)put('reed',x+(R()-0.5)*4,y,z+(R()-0.5)*4,1,1.8+R()*1.8,1,R()*6,R()<0.5?0x8a9a4a:0x6a8a3a,(R()-0.5)*0.3,(R()-0.5)*0.3);n('reeds');}}}
  for(const [ix,iz] of (PL.wetIslets||[]))for(let k=0;k<6;k++){const x=ix+(R()-0.5)*50,z=iz+(R()-0.5)*50,y=groundH(x,z);for(let c=0;c<6;c++)put('reed',x+(R()-0.5)*4,y,z+(R()-0.5)*4,1,1.6+R()*1.6,1,R()*6,0x7a9a4a,(R()-0.5)*0.3,0);if(R()<0.4)broad(x,y,z,2.6+R()*2,BROAD);}
  // and the high slopes anywhere carry a few firs
  for(let k=0;k<20000;k++){const x=rx(),z=rz(),y=groundH(x,z);if(y<300||y>1000||inLake(x,z)||slope(x,z)>1)continue;const b=BK.at(x,z);if('VDCL'.includes(b)||R()>Math.min(1,(y-300)/300)*0.3)continue;fir(x,y,z,7+R()*8,y>650);n('firs');}

  // ---- palms: the south coast, Lurelin, Eventide and the desert's oasis ----
  for(const s of [PL.sites.lurelin,PL.sites.eventide,PL.sites.kara_kara])if(s)for(let k=0;k<50;k++){if(palmAt(s.x+(R()-0.5)*420,s.z+(R()-0.5)*420))n('palms');}
  for(const [x,z] of (PL.coast||[]))if(z>2500||x>3500)for(let k=0;k<5;k++){const px=x+(R()-0.5)*600,pz=z+(R()-0.5)*600,b=BK.at(px,pz);if(b==='J'||pz>3800)if(palmAt(px,pz))n('palms');}

  // ---- rocks: boulders in the fields, outcrops where the ground is steep, coloured by where they lie ----
  const RC={C:[0xb0704a,0x9a5a3a],D:[0xc8a878,0xb8986a],V:[0x4a423c,0x3a3430],S:[0xd6d8d4,0xc8ccc8],R:[0xa89070,0x98805e]};
  let rocks=0;for(let k=0;k<30000&&rocks<4400;k++){const x=rx(),z=rz(),y=groundH(x,z);if(y<2||inLake(x,z))continue;
    const sl=slope(x,z),b=BK.at(x,z),want=(sl>0.5?0.5:0.06)*(b==='C'||b==='R'?1.8:1);if(R()>want)continue;const s=sl>0.5?4+R()*9:1.2+R()*3.5;
    put('rock',x,y+s*0.15,z,s*(0.8+R()*0.6),s*(0.5+R()*0.5),s*(0.8+R()*0.6),R()*6,y>620&&b!=='V'?0xd6d8d4:RC[b]?pick(RC[b]):pick(ROCK));rocks++;}

  // ---- build the kit ----
  for(const [name,K] of Object.entries(kit)){if(!K.list.length)continue;const im=new THREE.InstancedMesh(K.geo,K.mat,K.list.length);
    const tint=K.list.some(e=>e[7]!=null);
    K.list.forEach(([x,y,z,sx,sy,sz,ry,c,rxx,rzz],i)=>{dm.position.set(x,y,z);dm.rotation.set(rxx,ry,rzz);dm.scale.set(sx,sy,sz);dm.updateMatrix();im.setMatrixAt(i,dm.matrix);
      if(tint)im.setColorAt(i,c!=null?col.setHex(c):col.setHex(name==='trunk'?0x6a4e36:0xffffff));});
    // thousands of firs and rocks are not worth their shadows; the broadleaf crowns cast them
    if(im.instanceColor)im.instanceColor.needsUpdate=true;im.castShadow=!!K.shadow;im.receiveShadow=true;im.userData.noFingerprint=true;im.userData.wireCat='veg';scene.add(im);}

  // ---- the fog of the Lost Woods: soft grey-green sprites drifting slowly among the trees ----
  const fogTex=(()=>{const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d'),gr=g.createRadialGradient(32,32,0,32,32,32);
    gr.addColorStop(0,'rgba(220,235,220,0.75)');gr.addColorStop(1,'rgba(220,235,220,0)');g.fillStyle=gr;g.fillRect(0,0,64,64);return new THREE.CanvasTexture(c);})();
  const fogs=[];const K0=PL.sites.korok;
  if(K0)for(let k=0;k<60;k++){const a=R()*Math.PI*2,r=180+R()*380,x=K0.x+Math.cos(a)*r,z=K0.z+Math.sin(a)*r;if(BK.at(x,z)!=='L')continue;
    const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:fogTex,transparent:true,depthWrite:false,opacity:0.55}));sp.scale.set(90,30,1);sp.userData.noFingerprint=true;sp.userData.noWire=true;scene.add(sp);
    fogs.push({sp,x,z,y:groundH(x,z)+10+R()*14,ph:R()*6.28});}

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
  animHooks.push(now=>{const dt=Math.min(0.1,(now-last)/1000);last=now;const n_=nightF(),t=now/1000;
    for(const c of clouds){c.x+=c.v*dt;if(c.x>9500)c.x=-9500;c.sp.position.set(c.x,c.y,c.z);c.m.color.setScalar(1-0.75*n_);c.m.opacity=0.85-0.35*n_;}
    for(const f of fogs){f.sp.position.set(f.x+Math.sin(t*0.05+f.ph)*40,f.y+Math.sin(t*0.13+f.ph)*3,f.z+Math.cos(t*0.04+f.ph)*40);f.sp.material.color.setScalar(1-0.6*n_);}});
  ctx.details=Object.assign(ctx.details||{},count,{rocks,clouds:clouds.length,fogs:fogs.length});
}
