// ================================================================= HOST — the ground (the Bowl)
// One ground mesh (the 640-cell lattice, the delta's window at half that), painted from the fields (45) and the library's
// layers laid over it by weight per vertex (stations/bowl/materials.json, the 'bowl' pack): the white polygonal salt of the
// flat, the efflorescence at the shore and in the hollows, the soda crust between them, the ochre salt rim out in the
// shallows, the delta's reed bed and cracked silt, the popcorn clay of the halo, the rippled sand of the dunes and the pale
// silt of the kaluts. On the kaluts' steep faces the kit's strata shader (35-core-strata) draws the old lake's beds in a pale
// badland palette (PLAN-BOWL.md section 5). Without the pack (?mat=proc) the ground is the painted one.
REGISTER({name:LAKE.name,x:0,z:-2400,y:LAKE.level-6,r:1500,h:8,lake:true});
REGISTER({name:'The ochre salt rim: crust ridges in the shallows',x:-900,z:zS(-900)-450,y:LAKE.level-2,r:420,h:4});
REGISTER({name:'The salt flat (white polygonal crust)',x:-1500,z:zS(-1500)+600,y:LAKE.level-2,r:650,h:8});
REGISTER({name:'The Bowl river 2\'s delta',x:DELTA.apex[0],z:(DELTA.apex[1]+zS(DELTA.apex[0]))/2,y:LAKE.level-3,r:900,h:12,delta:true});
REGISTER({name:'The halophyte belt (saxaul, saltbush, tamarisk, brine lamps)',x:-200,z:zS(-200)+1750,y:terrainH(-200,zS(-200)+1750)-4,r:900,h:14});
REGISTER({name:'The kaluts: yardangs in the old lake silt, along the wind',x:-2100,z:900,y:terrainH(-2100,900)-6,r:900,h:50,yardangs:true});
REGISTER({name:'The dunes downwind of the flat',x:1900,z:2300,y:terrainH(1900,2300)-6,r:800,h:24,dunes:true});

// ---------------------------------------------------------------- the paint
const K=hx=>new THREE.Color(hx);
const PAINT={SALT:K(0xeee8dc),SALT2:K(0xe2d9c8),EFF:K(0xf6f2ea),SODA:K(0xe0c8b0),OCHRE:K(0xc8945a),OCHRE2:K(0xd8a868),BED:K(0xb89a72),
 MUD:K(0x6e6252),SILT:K(0x8e8270),SILT2:K(0xa49478),REED:K(0x6e7048),SAND:K(0xc8ae88),SAND2:K(0xb89c78),GRAV:K(0x9a7660),GRAV2:K(0x86624e),
 DUNE:K(0xdcae7c),DUNE2:K(0xe8c094),YARD:K(0xd8c4a0),STRAND:K(0xcfc0a4)};
const _t=new THREE.Color();
function paintAt(c,x,z,at,n,n2){const sa=at('salt'),de=at('delta'),ha=at('halo'),rg=at('reg'),dm=at('damp'),yd=at('yard'),dn=at('dune'),lk=at('lake'),rd=at('ridge'),fa=at('fan'),fl=at('flow');
 c.copy(PAINT.GRAV).lerp(PAINT.GRAV2,clamp(.5+n*1.8,0,1));                                       /* the reg's gravel */
 _t.copy(PAINT.SAND).lerp(PAINT.SAND2,clamp(.5+n*1.6,0,1));c.lerp(_t,clamp(ha+(1-rg),0,1)*.85);       /* the halo's saline sand */
 _t.copy(PAINT.SALT).lerp(PAINT.SALT2,clamp(.5+n*2,0,1)).lerp(PAINT.SODA,smooth(.55,.7,BIO.fn.fbm(x*.0016,z*.0016,8401,2))*.6);c.lerp(_t,sa);   /* the flat */
 c.lerp(PAINT.STRAND,at('strand')*.5);
 _t.copy(PAINT.SILT).lerp(PAINT.SILT2,clamp(.5+n*1.6,0,1)).lerp(PAINT.REED,smooth(.5,.9,de)*.45);c.lerp(_t,Math.max(de,fa*.4));   /* the delta */
 c.lerp(PAINT.MUD,Math.max(fl*.9,dm*.55));c.lerp(PAINT.EFF,dm*(1-fl)*smooth(.3,.7,sa)*.45);         /* wet silt, the efflorescence round the hollows */
 _t.copy(PAINT.DUNE).lerp(PAINT.DUNE2,clamp(.5+n*1.5,0,1));c.lerp(_t,dn);
 c.lerp(PAINT.YARD,Math.max(yd*.9,at('plat')*(1-dn)*.65));   /* the old lake silt of the kaluts' plateau, buff */
 _t.copy(PAINT.OCHRE).lerp(PAINT.OCHRE2,clamp(.5+n*1.8,0,1));c.lerp(_t,Math.max(rd,lk*.85));          /* the ochre rim, and the bed under the shallows */
 return c;}
const paintTex=(W,x0,z0,S)=>BIO.canvasTex(W,W,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;const c=new THREE.Color();
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;const wx=x0+(x/w)*S,wz=z0+(y/h)*S;
  const n=BIO.fn.fbm(wx*.03,wz*.03,.3,2)-.5,n2=(BIO.fn.h3(x,y,3)-.5);
  paintAt(c,wx,wz,k=>FC.at(FC.a[k],wx,wz),n,n2);const k=1+n*.1+n2*.05;
  d[i]=clamp(c.r*255*k,0,255);d[i+1]=clamp(c.g*255*k,0,255);d[i+2]=clamp(c.b*255*k,0,255);d[i+3]=255;}
 g.putImageData(id,0,0);});
const TEX_DETAIL=BIO.canvasTex(256,256,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4,v=232+(BIO.fn.fbm(x/9,y/9,5,2)-.5)*34+(BIO.fn.h3(x,y,9)-.5)*20;d[i]=d[i+1]=d[i+2]=clamp(v,0,255);d[i+3]=255;}
 g.putImageData(id,0,0);});
// the kaluts' beds: the kit's strata shader in a pale badland palette, a 40 m column, nearly level
const STRATA=BIO.strata({seed:8402,columnM:40,dip:[1,.3,.006],palette:{sand:[0xd8c4a0,0xe2d0ae,0xcbb48e,0xd4bc94],shale:[0xa89478,0x9c8a72,0xb0987a],
 bleach:[0xece2cc,0xf0e6d4,0xe6d8bc],mud:[0xb89e80,0xc0a888,0xae9476],green:[0xb4b098,0xa8a690]}});
// THE LIBRARY LAYERS: the full-colour sets replace the paint (x their gain), the tintable ones multiply it (over their mean)
const GL_FULL=['salt','ochre','soda','efflor'],GL_TINT=['dune','yard','playa','reedbed','popcorn'];
const GLAY=(function(){if(typeof KMAT==='undefined'||KMAT.mode!=='lib')return null;const o={};
 for(const k of GL_FULL.concat(GL_TINT)){const P=KMAT.packed('bowl','ground.'+k);if(!P)return null;
  o[k]={map:KMAT.textures(P,{aniso:8}).map,k:1/P.scale[0],m:Math.pow(P.tint&&P.tint.mean!=null?P.tint.mean:.78,2.2)};}return o;})();
const MAT_GROUND=new THREE.MeshLambertMaterial({map:null,color:0xb4aca4});
MAT_GROUND.onBeforeCompile=sh=>{STRATA.inject(sh);sh.uniforms.uDetail={value:TEX_DETAIL};
 if(GLAY)GL_FULL.concat(GL_TINT).forEach(k=>sh.uniforms['uG_'+k]={value:GLAY[k].map});
 sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vGWP;attribute vec4 aL0,aL1;attribute vec2 aL2;varying vec4 vL0,vL1;varying vec2 vL2;')
  .replace('#include <worldpos_vertex>','#include <worldpos_vertex>\nvGWP=(modelMatrix*vec4(transformed,1.0)).xyz;vL0=aL0;vL1=aL1;vL2=aL2;');
 const W={salt:'vL0.x',ochre:'vL0.y',soda:'vL0.z',efflor:'vL0.w',dune:'vL1.x',yard:'vL1.y',playa:'vL1.z',reedbed:'vL1.w',popcorn:'vL2.x'};
 let decl='uniform sampler2D uDetail;varying vec3 vGWP;varying vec4 vL0,vL1;varying vec2 vL2;',body='{vec2 p=vGWP.xz,q=mat2(0.799,-0.602,0.602,0.799)*p;'+
  'vec3 dt=texture2D(uDetail,p*0.15).rgb,dt2=texture2D(uDetail,p*0.019+0.37).rgb;';
 if(GLAY){decl+='uniform sampler2D '+GL_FULL.concat(GL_TINT).map(k=>'uG_'+k).join(',')+';';
  /* two tiles of each set, one turned, mixed by a slow field so no grid shows; a custom sampler is not decoded from sRGB */
  body+='float mt=smoothstep(-0.3,0.3,sin(p.x*0.017+2.0*sin(p.y*0.011))*sin(p.y*0.013+1.3));vec3 L;';
  const lay=k=>'L=mix(pow(texture2D(uG_'+k+',p*'+GLAY[k].k.toFixed(4)+').rgb,vec3(2.2)),pow(texture2D(uG_'+k+',q*'+(GLAY[k].k*.47).toFixed(4)+'+vec2(0.31,0.17)).rgb,vec3(2.2)),mt);';
  body+=GL_TINT.map(k=>lay(k)+'diffuseColor.rgb=mix(diffuseColor.rgb,diffuseColor.rgb*L/'+GLAY[k].m.toFixed(4)+','+W[k]+');').join('');
  body+=GL_FULL.map(k=>lay(k)+'diffuseColor.rgb=mix(diffuseColor.rgb,diffuse*L*1.18,'+W[k]+');').join('');
  body+='diffuseColor.rgb*=mix(vec3(1.0),dt*1.06,0.35);';}
 else body+='diffuseColor.rgb*=mix(vec3(1.0),dt*dt2*1.12,0.8);';
 body+='diffuseColor.rgb=mix(diffuseColor.rgb,strataColor(vSWP,vSWN)*(0.88+0.24*dt.r),vL2.y);}';
 sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\n'+decl).replace('#include <map_fragment>','#include <map_fragment>\n'+body);};
MAT_GROUND.customProgramCacheKey=()=>'bowl-ground'+(GLAY?'-lib':'');
const GROUND=(function(){const N=GRID.N,S=GRID.S,cs=GRID.cs,M=GRID.M;MAT_GROUND.map=paintTex(2048,-S/2,-S/2,S);
 const axis=(lo,hi)=>{const o=[];for(let i=0;i<=N;i++){const a=-S/2+i*cs;o.push(a);if(i<N&&a+cs>lo&&a<hi)for(let k=1;k<M;k++)o.push(a+cs*k/M);}return o;};
 const X=axis(GRID.win.x[0],GRID.win.x[1]),Z=axis(GRID.win.z[0],GRID.win.z[1]),nx=X.length,nz=Z.length;
 const pos=new Float32Array(nx*nz*3),uv=new Float32Array(nx*nz*2),L0=new Float32Array(nx*nz*4),L1=new Float32Array(nx*nz*4),L2=new Float32Array(nx*nz*2);
 for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const k=j*nx+i,x=X[i],z=Z[j],y=terrainH(x,z);pos[k*3]=x;pos[k*3+1]=y;pos[k*3+2]=z;uv[k*2]=x/S+.5;uv[k*2+1]=.5-z/S;
  const at=n=>FC.at(FC.a[n],x,z),sa=at('salt'),de=at('delta'),dm=at('damp'),fl=at('flow'),yd=at('yard'),dn=at('dune'),rd=at('ridge'),lk=at('lake'),ha=at('halo'),fa=at('fan'),sl=at('slope');
  const crust=sa*(1-de*.55)*(1-lk),wetEdge=Math.max(dm*.7,smooth(LAKE.level+.9,LAKE.level+.15,y)*(1-lk));
  L0[k*4]=crust*(1-wetEdge)*.85;                                   /* the white polygons */
  L0[k*4+1]=Math.max(rd,lk*.8)*.9;                                 /* the ochre rim; the bed under the shallows */
  L0[k*4+2]=crust*smooth(.55,.7,BIO.fn.fbm(x*.0016,z*.0016,8401,2))*.6*(1-wetEdge);   /* the soda crust's curled plates */
  L0[k*4+3]=crust*wetEdge*.8+ha*(1-dn)*(1-yd)*smooth(.62,.78,BIO.fn.fbm(x*.005,z*.005,8403,2))*.5;   /* efflorescence */
  L1[k*4]=dn*.9;L1[k*4+1]=yd*.8;L1[k*4+2]=fa*(1-fl)*(1-crust)*smooth(.2,.6,de)*.6;L1[k*4+3]=de*smooth(.45,.85,at('wet'))*(1-fl)*.55;
  L2[k*2]=ha*(1-yd)*(1-dn)*.55;L2[k*2+1]=yd*smooth(.22,.5,sl)*.95;}
 const idx=new Uint32Array((nx-1)*(nz-1)*6);let t=0;
 for(let j=0;j<nz-1;j++)for(let i=0;i<nx-1;i++){const a=j*nx+i,b=a+nx,c=b+1,d=a+1;idx[t++]=a;idx[t++]=b;idx[t++]=d;idx[t++]=b;idx[t++]=c;idx[t++]=d;}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('uv',new THREE.BufferAttribute(uv,2));
 g.setAttribute('aL0',new THREE.BufferAttribute(L0,4));g.setAttribute('aL1',new THREE.BufferAttribute(L1,4));g.setAttribute('aL2',new THREE.BufferAttribute(L2,2));
 g.setIndex(new THREE.BufferAttribute(idx,1));g.computeVertexNormals();const m=new THREE.Mesh(g,MAT_GROUND);m.userData.probeSkip=true;m.userData.inspectLabel='The Bowl';scene.add(m);return m;})();
_mark('ground');
