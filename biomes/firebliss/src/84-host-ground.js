// ================================================================= HOST — the ground (every station): the land as one coarse mesh and a fine patch under the thermal ground
// One ground over the page's square (12 m cells) and a fine patch (2-3 m) over the geyser kit's ground (TBOX, 47: its cones, pools and steps are smaller
// than a coarse cell), the coarse grid holed under it and the patch skirted. Painted from the fields (47) and, on KGROUND (43-core-ground.js), each
// library layer on its documented mask (the review's first line):
//   meadow     ground.grass on aMeadow (the warm floor's grass: the meadow field, off the sinter and the hot ground)
//   soil       ground.ashsoil on aFloor x (1 - aMeadow) (the warm floor where the grass is thin: the groves' floor, the shore's banks)
//   ash        ground.ash on aAsh x (1 - aScree) (the ash slopes over the floor)
//   cinder     ground.cinder on aScree (the steeper ash and the talus: the moraine field)
//   rock       rock.basalt on aRock (the steep: the gorge's walls, the crater's)
//   sinter     ground.sinter on aSinter (the geyser kit's sinter and its dead fringe's silica)
//   mats       ground.mat on aMat (the run-off's film in its warm band: the thermophiles' colours, 30-73 degC)
//   acid       ground.sulphur on aAcid (the acid fields' altered clay and its sulphur)
//   snow, ice  ground.snow on aSnow, ice.glacier on aIce (Mons: the crater's ice and the snow, bare round the vents)
// The water's wet band (aWet: WATER.fieldAt's shore, 89z) and the plume's ash fall (aAshfall: ATMOS.ashPlume's deposit, 89z) darken and grey the paint
// at no texture unit. At most nine library layers on a page (Mons swaps meadow and soil for snow and ice), so the page keeps units for KHORIZON, the
// rain cover and the shadows (ebadlands' 16-unit lesson). ?kground=0 the paint alone, ?relief=0 no relief, ?fine=0 no fine patch.
const GQ=new URLSearchParams(location.search),USE_KG=typeof KGROUND!=='undefined'&&GQ.get('kground')!=='0';
const ICY=!!SITE.iceAt;
// the thermal record at a point (the geyser kit's), 0 off its ground
const TH0={sinter:0,heat:0,film:0,acid:0,dead:0,T:0};
const thAt=(x,z)=>nearT(x,z)?GEYSER.at(x,z,landH(x,z)):TH0;
const TEX_GROUND=BIO.canvasTex(1536,1536,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;const S=TERR.R*2.2;
 const c=new THREE.Color(),t=new THREE.Color(),K=hx=>new THREE.Color(hx);
 const GRASS=K(0x5e7a36),GRASS2=K(0x6e8640),SOIL=K(0x5a4e40),ASH=K(0x4a4844),ASH2=K(0x5e5a54),CIND=K(0x5a4038),ROCK=K(0x4a4644),ROCK2=K(0x3c3a38),SNOW=K(0xeef2f6),ICE=K(0xb4c8d6),SINT=K(0xdcd8cc),DAMP=K(0x3a362e);
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;const wx=(x/w-.5)*S,wz=(y/h-.5)*S,A=n=>FC.at(FC.a[n],wx,wz);
  const n=fbm(x/24,y/24,3,2)-.5,pav=fbm(x/80+5,y/80-2,7,2),rock=A('rock'),mead=A('meadow'),fl=A('floor'),ash=A('ash'),scree=A('moraine'),snow=A('snow'),ice=A('ice'),wet=A('shore');
  c.copy(ASH).lerp(ASH2,smooth(.4,.65,pav));c.lerp(CIND,smooth(.2,.6,scree)*.7);
  c.lerp(t.copy(SOIL),fl);c.lerp(t.copy(GRASS).lerp(GRASS2,smooth(.35,.65,pav)),mead);
  t.copy(ROCK).lerp(ROCK2,clamp(.4+n*1.6,0,1));c.lerp(t,smooth(.25,.6,rock));
  c.lerp(DAMP,smooth(.3,.8,wet)*.5);
  c.lerp(ICE,ice);c.lerp(SNOW,snow);
  const k=1+n*.07;d[i]=clamp(c.r*255*k,0,255);d[i+1]=clamp(c.g*255*k,0,255);d[i+2]=clamp(c.b*255*k,0,255);d[i+3]=255;}
 g.putImageData(id,0,0);});
const TEX_DETAIL=BIO.canvasTex(256,256,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4,v=244+(fbm(x/9,y/9,5,2)-.5)*22+(BIO.fn.h3(x,y,9)-.5)*14;d[i]=d[i+1]=d[i+2]=clamp(v,0,255);d[i+3]=255;}
 g.putImageData(id,0,0);});
const MAT_GROUND=USE_KG?new THREE.MeshStandardMaterial({map:TEX_GROUND,color:0xd8d6d2,roughness:.95,metalness:0}):new THREE.MeshLambertMaterial({map:TEX_GROUND,color:0xd8d6d2});
const GA=['aRock','aMeadow','aFloor','aAsh','aScree','aSinter','aMat','aAcid','aSnow','aIce','aWet','aAshfall'],GV=GA.map(a=>'v'+a.slice(1));
MAT_GROUND.onBeforeCompile=sh=>{sh.uniforms.uDetail={value:TEX_DETAIL};
 sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vGWP;'+GA.map((a,i)=>'attribute float '+a+';varying float '+GV[i]+';').join(''))
  .replace('#include <worldpos_vertex>','#include <worldpos_vertex>\nvGWP=(modelMatrix*vec4(transformed,1.0)).xyz;'+GA.map((a,i)=>GV[i]+'='+a+';').join(''));
 sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\n'+KCOLOR.GLSL+'\nuniform sampler2D uDetail;varying vec3 vGWP;'+GV.map(v=>'varying float '+v+';').join(''))
  .replace('#include <map_fragment>','#include <map_fragment>\n{vec3 dt=sampleSRGB(uDetail,vGWP.xz*0.165).rgb;vec3 dt2=sampleSRGB(uDetail,vGWP.xz*0.021+0.37).rgb;vec3 _gP=diffuseColor.rgb;'+(USE_KG?'\n/*KGROUND*/\n':'')+
  'diffuseColor.rgb*=mix(dt*dt2*1.22,vec3(1.0),max(vIce,vSnow)*0.6);diffuseColor.rgb=mix(diffuseColor.rgb,vec3(0.36,0.35,0.34)*(0.8+0.4*dt.r),vAshfall*0.55);diffuseColor.rgb*=mix(vec3(1.0),vec3(0.62,0.6,0.56),vWet);}');};
/* THE RELIEF (core/README.md 'Adopting KGROUND's relief'): the derivative bump from the layers' blended height, the cavity occlusion and the mesh's own
   hollows (cavityMesh), at no texture unit; the side planes (tri) on Mons' steep walls (SITE.tri). ?relief=0 / ?tri=0 for the before */
const KG_RELIEF=GQ.get('relief')!=='0',KG_TRI=!!SITE.tri&&GQ.get('tri')!=='0';
const L_=(fam,w,o)=>KGROUND.layer('firebliss',fam,Object.assign({w,amt:.85,gain:1.0},o));
if(USE_KG)KGROUND.hook(MAT_GROUND,{key:'firebliss-'+SITE.key+'-ground'+(KG_RELIEF?'r':'')+(KG_TRI?'t':''),at:'/*KGROUND*/',
 ...(KG_RELIEF?{relief:{bump:.075,cavity:.8,mesh:1}}:{}),...(KG_TRI?{tri:{from:.35,to:.7}}:{}),layers:(ICY?[
 L_('ground.ash','vAsh*(1.0-vScree)*(1.0-vSnow)*(1.0-vIce)',{name:'ash'}),
 L_('ground.cinder','vScree*(1.0-vSnow)*(1.0-vIce)',{name:'cinder and talus'}),
 L_('rock.basalt','vRock*(1.0-vSnow*0.7)*(1.0-vIce)',{tint:'_gP*1.5',name:'basaltic andesite'}),
 L_('ice.glacier','vIce*(1.0-vSnow)',{amt:.9,name:'the crater\'s ice'}),
 L_('ground.snow','vSnow',{amt:.9,name:'snow and firn'}),
 L_('ground.mat','vMat*(1.0-vSnow)',{name:'the vents\' warm mats (the cold lineage)'}),
 L_('ground.sulphur','vAcid*(1.0-vSnow)',{name:'sulphur and altered clay'}),
 L_('ground.sinter','vSinter*(1.0-vSnow)',{name:'sinter'})]:[
 L_('ground.grass','vMeadow*(1.0-vSinter)*(1.0-vAcid)',{amt:.8,name:'the warm meadow'}),
 L_('ground.ashsoil','vFloor*(1.0-vMeadow)*(1.0-vSinter)*(1.0-vRock)',{name:'the floor\'s ashy soil'}),
 L_('ground.ash','vAsh*(1.0-vScree)*(1.0-vFloor)*(1.0-vRock)',{name:'ash'}),
 L_('ground.cinder','vScree*(1.0-vFloor)*(1.0-vRock)',{name:'cinder and talus'}),
 L_('rock.basalt','vRock',{tint:'_gP*1.5',name:'basaltic andesite and tuff'}),
 L_('ground.sinter','vSinter*(1.0-vMat*0.6)',{amt:.9,name:'sinter'}),
 L_('ground.mat','vMat',{amt:.85,name:'thermophile mats (the run-off\'s warm band)'}),
 L_('ground.sulphur','vAcid',{name:'acid clay and sulphur'})])});
const G_ATTR=(x,z,h)=>{const A=n=>FC.at(FC.a[n],x,z),th=thAt(x,z);
 const sinter=Math.max(th.sinter,th.dead*.6),mat=th.film>0?clamp(th.film*2.5,0,1)*smooth(28,40,th.T)*smooth(78,68,th.T):0;
 return[smooth(.3,.65,A('rock')),A('meadow')*(1-sinter)*(1-smooth(.1,.3,A('therm'))),A('floor'),A('ash'),A('moraine'),sinter,mat,th.acid,A('snow'),A('ice'),0,0];};
// a grid of cells over [x0,z0,x1,z1] (nx x nz cells), its quads skipped where hole(cx,cz) says, a skirt dropped round its edge when asked
function groundGrid(x0,z0,x1,z1,nx,nz,hole,skirt){const cx=(x1-x0)/nx,cz=(z1-z0)/nz,vx=nx+1,vz=nz+1,nv=vx*vz,ns=skirt?2*(nx+nz):0;
 const pos=new Float32Array((nv+ns*2)*3),uv=new Float32Array((nv+ns*2)*2),A=GA.map(()=>new Float32Array(nv+ns*2)),S=TERR.R*2.2;
 const put=(k,x,z,y,src)=>{pos[k*3]=x;pos[k*3+1]=y;pos[k*3+2]=z;uv[k*2]=x/S+.5;uv[k*2+1]=.5-z/S;const a=src||G_ATTR(x,z,y);for(let q=0;q<GA.length;q++)A[q][k]=a[q];return a;};
 for(let j=0;j<vz;j++)for(let i=0;i<vx;i++){const x=x0+i*cx,z=z0+j*cz;put(j*vx+i,x,z,terrainH(x,z));}
 const idx=[];for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){if(hole&&hole(x0+(i+.5)*cx,z0+(j+.5)*cz))continue;const a=j*vx+i,b=a+vx,c=b+1,d=a+1;idx.push(a,b,d,b,c,d);}
 if(skirt){let k=nv;const ring=[];for(let i=0;i<nx;i++)ring.push(i);for(let j=0;j<nz;j++)ring.push(j*vx+nx);for(let i=nx;i>0;i--)ring.push(nz*vx+i);for(let j=nz;j>0;j--)ring.push(j*vx);
  ring.push(ring[0]);for(let r=0;r+1<ring.length;r++){const p=ring[r],q=ring[r+1],kp=k++,kq=k++;
   const ap=GA.map((_,g)=>A[g][p]),aq=GA.map((_,g)=>A[g][q]);put(kp,pos[p*3],pos[p*3+2],pos[p*3+1]-3,ap);put(kq,pos[q*3],pos[q*3+2],pos[q*3+1]-3,aq);idx.push(p,kp,q,q,kp,kq,p,q,kp,q,kq,kp);}}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('uv',new THREE.BufferAttribute(uv,2));
 GA.forEach((a,i)=>g.setAttribute(a,new THREE.BufferAttribute(A[i],1)));g.setIndex(idx);g.computeVertexNormals();
 const m=new THREE.Mesh(g,MAT_GROUND);m.receiveShadow=true;m.userData.probeSkip=true;m.userData.inspectLabel=SITE.region;scene.add(m);
 if(USE_KG&&KG_RELIEF&&KGROUND.cavityMesh)KGROUND.cavityMesh(m,{rings:[3,18],depth:[.5,4]});   /* aKGAO, the hollows relief.mesh reads */
 return{mesh:m,x0,z0,cx,cz,nx,nz,vx};}
// THE FINE PATCHES, each snapped out to the coarse lattice (12 m) and the coarse grid holed inside it: TBOX at 2 m (3 m where it is large), and a
// gorge's walls (a river with SITE.river.gorge) in boxes along it at 4 m (its walls are steeper than a coarse cell can draw; hyperjungle's lesson:
// a channel wants cells finer than itself). The boxes must not overlap: a gorge box that meets TBOX is cut back to the coarse cells round it
const GN=480,GS=TERR.R*2.2,GC=GS/GN,snap=v=>Math.round(v/GC)*GC,clampB=b=>[Math.max(-GS/2,b[0]),Math.max(-GS/2,b[1]),Math.min(GS/2,b[2]),Math.min(GS/2,b[3])];
const FINES=(function(){if(GQ.get('fine')==='0')return[];const L=[];
 if(TBOX){const b=clampB([snap(TBOX[0]-GC),snap(TBOX[1]-GC),snap(TBOX[2]+GC),snap(TBOX[3]+GC)]);L.push({box:b,cell:(b[2]-b[0])*(b[3]-b[1])>900*900?3:2});}
 if(RIVER&&RIVER.gorge){const P=RIVER.pts,pad=RIVER.gorge.reach+12,seg=40;
  for(let i=0;i<P.length-1;i+=seg){const S=P.slice(i,Math.min(P.length,i+seg+1));let b=[1e9,1e9,-1e9,-1e9];S.forEach(p=>{b=[Math.min(b[0],p[0]-pad),Math.min(b[1],p[1]-pad),Math.max(b[2],p[0]+pad),Math.max(b[3],p[1]+pad)];});
   b=clampB([snap(b[0]),snap(b[1]),snap(b[2]),snap(b[3])]);
   /* not over a box already listed: trim it to the side away from each */
   for(const F of L){const o=F.box;if(b[0]<o[2]&&b[2]>o[0]&&b[1]<o[3]&&b[3]>o[1]){if(b[1]>=o[1])b[1]=Math.max(b[1],o[3]);else b[3]=Math.min(b[3],o[1]);}}
   if(b[2]-b[0]>=GC*2&&b[3]-b[1]>=GC*2)L.push({box:b,cell:4});}}
 return L;})();
const inFine=(x,z)=>{for(const F of FINES){const b=F.box;if(x>b[0]&&x<b[2]&&z>b[1]&&z<b[3])return F;}return null;};
const GROUND_G=groundGrid(-GS/2,-GS/2,GS/2,GS/2,GN,GN,FINES.length?(x,z)=>!!inFine(x,z):null,false),GROUND=GROUND_G.mesh;
const GFINES=FINES.map(F=>{const g=groundGrid(F.box[0],F.box[1],F.box[2],F.box[3],Math.round((F.box[2]-F.box[0])/F.cell),Math.round((F.box[3]-F.box[1])/F.cell),null,true);F.grid=g;return g;});
const GFINE=GFINES[0]||null;
const GROUND_MESHES=[GROUND].concat(GFINES.map(g=>g.mesh));
