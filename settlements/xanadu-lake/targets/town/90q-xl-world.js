// ================================================================= THE LAKE TOWNS — the world: the Krator sky, the painted ground, the lake and the stream
// Runs after 90-scene (renderer, scene, camera and lights exist; the sheet's showcase was skipped: window.CITY). The town's
// ground is a mesh at 5 m cells wearing a canvas painted from the plan's records (89zq XL_TOWN: the beach, the slope's grass,
// the benches' fields in their furrows, every way at its width, the market square, a dooryard under every building, the
// stream's bed); the far ground a coarse mesh of xlH (the region's own ground beyond the town's core: 89zp) coloured by
// height and slope; both registered with core/drawn (KDRAWN). The water is core/water's: the lake (WATER.open at the
// level, its bed baked round the town) and the stream (WATER.flow down its ravine). Nothing reads the canvas back
// (placement is the plan's, never the paint's). [web]: canvas and three.js.
const XL_T0=performance.now();reseed(XL.seed(XL.KEY)>>>8);
for(const f of FRAME_HOOKS_PRE)FRAME_HOOKS.push(f);
const XLK=XL.KEY,XLT=XL_TOWN||{place:[],ways:[],fields:[],greens:[],geo:xlGeo(XLK)},XLG=XLT.geo;
camera.near=.5;camera.far=40000;camera.updateProjectionMatrix();
// ---------------------------------------------------------------- the sky and its light (KratorSky, as Phēr's)
const XL_SKY={hour:9.4,day:120,dens:1.1};
const xlSkyGroup=KratorSky.attach(scene,12000);xlSkyGroup.traverse(o=>{o.userData.probeSkip=true;});scene.fog.density=.00014;
const xlHemi=scene.children.find(o=>o.isHemisphereLight);
function xlSkyTick(){KratorSky.update(camera.position,XL_SKY.hour,XL_SKY.day,XL_SKY.dens);const L=KratorSky.lighting();
 sun.position.copy(L.sunDir).multiplyScalar(1500).add(camera.position);sun.target.position.copy(camera.position);sun.target.updateMatrixWorld();sun.intensity=L.sunIntensity;sun.color.copy(L.sunColor);
 fill.intensity=.22*L.dayF+.05;if(xlHemi)xlHemi.intensity=L.ambient;scene.fog.color.copy(L.fog);renderer.setClearColor(L.fog);}
FRAME_HOOKS.push(xlSkyTick);xlSkyTick();
// ---------------------------------------------------------------- core/atmos for the water: the clock, the wave field, the sky in the water
// (a copy of the Krator sky, given to the water only: Kirstabal's way, settlements/kirstabal/targets/town/90k-ks-world.js)
ATMOS.init({THREE,scene,camera,hour:()=>XL_SKY.hour,onFrame:fn=>FRAME_HOOKS.push(fn),ground:(x,z)=>terrainH(x,z),seed:(XL.seed(XLK)>>>12),
 err:m=>console.warn(m),viewH:()=>innerHeight,pixelRatio:()=>renderer.getPixelRatio()});
const XL_SKYS=new THREE.Scene(),XL_ENV={environment:null},XL_SKYC=xlSkyGroup.clone();XL_SKYS.add(XL_SKYC);
ATMOS.hook(()=>{XL_SKYC.position.set(0,0,0);xlSkyGroup.children.forEach((o,i)=>{const c=XL_SKYC.children[i];if(!c)return;
 c.position.copy(o.position);c.quaternion.copy(o.quaternion);c.scale.copy(o.scale);c.visible=o.visible;});});
ATMOS.skylight({renderer,sky:XL_SKYS,scene:XL_ENV,ground:()=>new THREE.Color(0x4a5a3a)});
// ---------------------------------------------------------------- the town's ground: its box and its painted canvas
const XLB=(function(){const L=XLT.spec?XLT.spec.layout:XL.SPECS[XLK].layout,top=XLG.benches.length?XLG.benches[XLG.benches.length-1].d1:L.rows[L.rows.length-1];
 return{x0:-L.half-360,x1:XLG.stream.x+360,z0:xlShoreZ(XLK,0)-top-320,z1:xlShoreZ(XLK,0)+420};})();XLB.W=XLB.x1-XLB.x0;XLB.H=XLB.z1-XLB.z0;
const XL_PX=3072/Math.max(XLB.W,XLB.H),xgx=x=>(x-XLB.x0)*XL_PX,xgz=z=>(z-XLB.z0)*XL_PX;
const xlCv=document.createElement('canvas');xlCv.width=Math.ceil(XLB.W*XL_PX);xlCv.height=Math.ceil(XLB.H*XL_PX);
const xlSlope=(x,z)=>{const e=4;return Math.hypot(xlH(XLK,x+e,z)-xlH(XLK,x-e,z),xlH(XLK,x,z+e)-xlH(XLK,x,z-e))/(2*e);};
(function xlPaint(){const g=xlCv.getContext('2d'),W=xlCv.width,H=xlCv.height,img=g.createImageData(W,H),D=img.data,lastRow=XLT.spec?XLT.spec.layout.rows.slice(-1)[0]:300;
 // the ground's colour by place: the bed, the wet beach, the sand, the slope's grass, the wall above; stone on the risers
 const col=(x,z)=>{const y=xlH(XLK,x,z),d=xlShoreZ(XLK,x)-z,s=xlSlope(x,z);
  if(y<-.25)return[78,98,92];if(y<.9)return[150,138,112];
  let c=d<20?[176,160,128]:d<lastRow+30?[104,118,70]:[92,110,64];
  const r=Math.min(1,Math.max(0,(s-.22)/.3));return[c[0]+(118-c[0])*r,c[1]+(110-c[1])*r,c[2]+(96-c[2])*r];};
 for(let j=0;j<H;j+=3)for(let i=0;i<W;i+=3){const c=col(XLB.x0+(i+1.5)/XL_PX,XLB.z0+(j+1.5)/XL_PX);
  for(let b=0;b<3;b++)for(let a=0;a<3;a++){if(i+a>=W||j+b>=H)continue;const k=((j+b)*W+i+a)*4;D[k]=c[0];D[k+1]=c[1];D[k+2]=c[2];D[k+3]=255;}}
 g.putImageData(img,0,0);
 const path=(P,closed)=>{g.beginPath();P.forEach((p,i)=>i?g.lineTo(xgx(p[0]),xgz(p[1])):g.moveTo(xgx(p[0]),xgz(p[1])));if(closed)g.closePath();};
 const line=(P,w,closed)=>{g.lineWidth=w*XL_PX;path(P,closed);g.stroke();};
 g.lineCap='round';g.lineJoin='round';
 // the benches' fields: tilled earth, the furrows along the bench, a crop's green in rows
 for(const F of XLT.fields){g.fillStyle=F.crop==='amaranth'?'#8a6a48':'#7a7448';path(F.poly,true);g.fill();
  g.save();path(F.poly,true);g.clip();g.strokeStyle=F.crop==='amaranth'?'rgba(150,60,70,.55)':'rgba(96,140,64,.7)';g.lineWidth=1.1*XL_PX;
  const B=XLG.benches[F.bench];for(let d=B.d0+44;d<B.d1;d+=2.4){const P=[];for(let x=B.x0;x<=B.x1;x+=20)P.push([x,xlShoreZ(XLK,x)-d]);path(P,false);g.stroke();}g.restore();}
 // the stream's bed and its water's line
 g.strokeStyle='#5a6a60';line(xlStream(XLK).pts,9);g.strokeStyle='#3f6f78';line(xlStream(XLK).pts,3.5);
 // the market square (packed earth), the ways at their widths: the shore road in setts, the rows and stairs in cobbles
 g.fillStyle='#a69a84';for(const G_ of XLT.greens){path(G_.poly,true);g.fill();}
 for(const w of XLT.ways){g.strokeStyle=w.cls==='main'?'#9b9386':w.cls==='lane'?'#8a7a62':'#8f887b';line(w.pts,w.w,w.closed);}
 // a dooryard of trodden earth under every building, a shade darker than the ground
 g.fillStyle='rgba(92,80,64,.35)';for(const p of XLT.place){const b=p.bo,c=Math.cos(p.ry),s=Math.sin(p.ry),hw=b.hw+2,hd=b.hd+2;
  g.beginPath();[[-hw,-hd],[hw,-hd],[hw,hd],[-hw,hd]].forEach((q,i)=>{const x=p.x+q[0]*c+q[1]*s,z=p.z-q[0]*s+q[1]*c;i?g.lineTo(xgx(x),xgz(z)):g.moveTo(xgx(x),xgz(z));});g.closePath();g.fill();}})();
// ---------------------------------------------------------------- the ground's texture: the library's sets over the paint (Phēr's phGroundShader)
// From the Vale of Xanadu biome's own pack ('xanadu-bio', which Xanadu's page carries): a detail map over everything, the
// shore's sand and pebbles on the beach band, the stream's gravel down its channel, the wall's rock on steep ground. [web]
function xlGroundShader(g,m,cx,cz){const T3=THREE,sm=(a,b,x)=>{const t=Math.min(1,Math.max(0,(x-a)/(b-a)));return t*t*(3-2*t);},p=g.attributes.position;
 const lay=new Float32Array(p.count*4),gm=new Float32Array(p.count);
 for(let i=0;i<p.count;i++){const x=p.getX(i)+cx,z=-p.getY(i)+cz,d=xlShoreZ(XLK,x)-z,y=xlH(XLK,x,z),s=xlSlope(x,z);
  const shore=sm(-12,2,d)*sm(40,8,d),peb=sm(.42,.62,fbm(x*.012+4,z*.012-1,617,2)),sd=Math.abs(x-xlStreamXd(XLG,d));
  lay[i*4]=shore*(1-peb);lay[i*4+1]=shore*peb;lay[i*4+2]=sm(10,3,sd)*(y>-.5&&d<XLG.stream.to?1:0);lay[i*4+3]=0;gm[i]=sm(.32,.7,s);}
 g.setAttribute('aGL',new T3.BufferAttribute(lay,4));g.setAttribute('aGM',new T3.BufferAttribute(gm,1));
 const P=n=>(typeof KMAT!=='undefined'&&KMAT.packed)?KMAT.packed('xanadu-bio',n):null,TX=L=>KMAT.textures(L,{aniso:8}).map;
 const dL=P('groundDetail'),a=P('ground.shore'),b=P('ground.pebble'),c=P('ground.gravel'),LIB=!!(dL&&a&&b&&c);window._xlGround={lib:LIB};if(!LIB)return;
 const det=TX(dL);det.wrapS=det.wrapT=T3.RepeatWrapping;const L={shore:TX(a),shoreK:1/a.scale[0],peb:TX(b),pebK:1/b.scale[0],grav:TX(c),gravK:1/c.scale[0]};
 for(const k of['shore','peb','grav']){L[k].wrapS=L[k].wrapT=T3.RepeatWrapping;}
 const f4=v=>v.toFixed(4),tri=(u,k)=>'mix(pow(texture2D('+u+',p*'+f4(k)+').rgb,vec3(2.2)),pow(texture2D('+u+',q*'+f4(k*.47)+'+vec2(0.31,0.17)).rgb,vec3(2.2)),mt)';
 m.onBeforeCompile=sh=>{Object.assign(sh.uniforms,{uDetail:{value:det},uLShore:{value:L.shore},uLPeb:{value:L.peb},uLGrav:{value:L.grav}});
  sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nattribute vec4 aGL;attribute float aGM;varying vec4 vGL;varying float vGM;varying vec3 vGWP;')
   .replace('#include <worldpos_vertex>','#include <worldpos_vertex>\nvGL=aGL;vGM=aGM;vGWP=(modelMatrix*vec4(transformed,1.0)).xyz;');
  sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nuniform sampler2D uDetail;uniform sampler2D uLShore;uniform sampler2D uLPeb;uniform sampler2D uLGrav;varying vec4 vGL;varying float vGM;varying vec3 vGWP;')
   .replace('#include <map_fragment>',['#include <map_fragment>',
    '{vec3 dt=pow(texture2D(uDetail,vGWP.xz*0.165).rgb,vec3(2.2));vec3 dt2=pow(texture2D(uDetail,vGWP.xz*0.021+0.37).rgb,vec3(2.2));diffuseColor.rgb*=mix(vec3(1.0),dt*dt2*1.7,0.8);',   /* the detail map decoded (sRGB), its mean held near 1 */
    'vec2 p=vGWP.xz,q=mat2(0.799,-0.602,0.602,0.799)*p;float mt=smoothstep(-0.3,0.3,sin(p.x*0.017+2.0*sin(p.y*0.011))*sin(p.y*0.013+1.3));',
    'vec3 ts='+tri('uLShore',L.shoreK)+';vec3 tp='+tri('uLPeb',L.pebK)+';vec3 tg='+tri('uLGrav',L.gravK)+';',
    'diffuseColor.rgb=mix(diffuseColor.rgb,diffuse*ts*1.3,0.8*vGL.x);diffuseColor.rgb=mix(diffuseColor.rgb,diffuse*tp*1.3,0.8*vGL.y);diffuseColor.rgb=mix(diffuseColor.rgb,diffuse*tg*1.3,0.8*vGL.z);',
    ' float y=vGWP.y+6.0*sin(vGWP.x*0.004+vGWP.z*0.003)+2.0*sin(vGWP.x*0.031);float b1=0.5+0.5*sin(y*0.21),b2=smoothstep(0.6,0.95,sin(y*0.07+1.3));',
    ' vec3 st=mix(vec3(0.34,0.30,0.24),vec3(0.44,0.36,0.26),b1);st=mix(st,vec3(0.28,0.26,0.26),b2*0.7);st*=0.85+0.3*pow(texture2D(uDetail,vec2(vGWP.x+vGWP.z,vGWP.y*3.0)*0.05).r,2.2)*1.3;',
    ' diffuseColor.rgb=mix(diffuseColor.rgb,st,vGM*0.55);}'].join('\n'));};
 m.customProgramCacheKey=()=>'xl-ground';}
// ---------------------------------------------------------------- the meshes: the town's ground, the far ground (both in core/drawn)
function xlGroundMesh(B,cell,name,mat,sinkIn,colour){const nx=Math.round((B.x1-B.x0)/cell),nz=Math.round((B.z1-B.z0)/cell),W=B.x1-B.x0,Hh=B.z1-B.z0;
 const geo=new THREE.PlaneGeometry(W,Hh,nx,nz),p=geo.attributes.position,uv=geo.attributes.uv,cx=(B.x0+B.x1)/2,cz=(B.z0+B.z1)/2,hs=new Float32Array(p.count),col=colour?new Float32Array(p.count*3):null;
 for(let i=0;i<p.count;i++){const x=p.getX(i)+cx,z=-p.getY(i)+cz;let y=xlH(XLK,x,z);if(sinkIn&&x>sinkIn.x0+cell&&x<sinkIn.x1-cell&&z>sinkIn.z0+cell&&z<sinkIn.z1-cell)y-=3;
  p.setZ(i,y);hs[i]=y;uv.setXY(i,(x-B.x0)/W,1-(z-B.z0)/Hh);if(col){const c=colour(x,z,y);col[i*3]=c[0];col[i*3+1]=c[1];col[i*3+2]=c[2];}}
 if(col)geo.setAttribute('color',new THREE.BufferAttribute(col,3));
 geo.computeVertexNormals();const m=new THREE.Mesh(geo,mat);m.rotation.x=-Math.PI/2;m.position.set(cx,0,cz);
 m.userData.isGround=true;m.userData.ground=true;m.userData.probeSkip=true;m.name=name;scene.add(m);
 if(typeof KDRAWN!=='undefined')KDRAWN.add(KDRAWN.grid({x0:B.x0,z0:B.z0,dx:W/nx,dz:Hh/nz,nx,nz,h:hs}));
 return m;}
(function xlTerrain(){const tex=new THREE.CanvasTexture(xlCv);tex.encoding=THREE.sRGBEncoding;tex.anisotropy=8;
 const gmat=new THREE.MeshStandardMaterial({map:tex,roughness:.95,metalness:0});
 groundM=xlGroundMesh(XLB,5,'terrain',gmat,null,null);xlGroundShader(groundM.geometry,gmat,(XLB.x0+XLB.x1)/2,(XLB.z0+XLB.z1)/2);
 // the far ground: 40 m cells round the town out to the region's ground, a few metres under the town's mesh where they meet
 const lin=c=>Math.pow(c/255,2.2),F={x0:-6000,x1:6000,z0:XLB.z0-5200,z1:XLB.z1+5200};
 const far=xlGroundMesh(F,40,'far ground',new THREE.MeshStandardMaterial({vertexColors:true,roughness:1,metalness:0}),XLB,(x,z,y)=>{const s=xlSlope(x,z),
  c=y<0?[78,98,92]:s>.3?[112,108,92]:y<8?[164,150,118]:y<300?[92,112,62]:[116,122,72];return[lin(c[0]),lin(c[1]),lin(c[2])];});})();
// ---------------------------------------------------------------- the water: the lake (core/water) and the stream down its ravine
const xlLinC=c=>new THREE.Color(c).convertSRGBToLinear();
const XL_LAKE=(function(){try{const W=WATER.open({name:'Erewhon\'s lake',level:0,field:.12,bounds:[-6000,XLB.z0-5200,6000,XLB.z1+5200],bed:terrainH,bedBox:[XLB.x0,XLB.z0,XLB.x1,XLB.z1+1200],bedCell:12});
  const D=WATER.draw(W,{renderOrder:1,roughness:.08,metalness:.05,envMapIntensity:.45,surf:false,breakers:false,pick:true,shallow:xlLinC(0x5f8a84),deep:xlLinC(0x1f4a56)});
  D.mesh.userData.inspectLabel='Erewhon\'s lake (-520 m)';D.mesh.userData.probeSkip=true;return D;}catch(e){reportErr('lake: '+(e&&e.stack||e));return null;}})();
const XL_STREAM=(function(){const S=xlStream(XLK),pts=S.pts.slice().reverse().map(p=>[p[0],p[1],Math.max(.15,xlH(XLK,p[0],p[1])+.3)]);
 for(let i=1;i<pts.length;i++)pts[i][2]=Math.min(pts[i][2],pts[i-1][2]);   /* never climbing downstream */
 try{const F=WATER.flow({name:'the stream',pts,width:pts.map((p,i)=>2.4+2.2*i/pts.length),speed:1.1,densify:10});
  const D=WATER.drawFlow(F,{shallow:xlLinC(0x7a8a6c),deep:xlLinC(0x3a5a50),color:0xffffff,roughness:.14,metalness:.05,envMapIntensity:.45,step:6,across:4,margin:1.5,renderOrder:2});
  if(D&&D.mesh){D.mesh.userData.inspectLabel='the stream (the page\'s own: the model has none)';D.mesh.userData.probeSkip=true;}return{F,D,n:pts.length};}
 catch(e){reportErr('the stream: '+(e&&e.stack||e));return null;}})();
window._worldMs=Math.round(performance.now()-XL_T0);
window._xlWater={lake:!!XL_LAKE,stream:!!(XL_STREAM&&XL_STREAM.D),streamPts:XL_STREAM?XL_STREAM.n:0};
