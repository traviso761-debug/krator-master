// ================================================================= ŌPAL-PHŌRḌ — the world: the Krator sky, the painted ground, the river
// Runs after 90-scene (renderer, scene, camera and lights exist; the sheet's showcase was skipped: window.CITY). The near ground
// (the town, the flats, both banks and the reach up to the fall) is a mesh at 10 m cells wearing a canvas painted from the plan's
// records: the flats' paddies, the bench's grass, the slope's tilled terraces, the spur's woods, every way at its width, the
// square. The far ground is a coarse mesh coloured by height and slope; the river is a ribbon at its water's height down its
// line (the milky turquoise of Opal Valley's silica), the fall's spray a paler ribbon over it. Nothing reads the canvas back
// (placement is the plan's, never the paint's). The near ground is registered with core/drawn (KDRAWN.grid) for the audits.
// [web]: canvas and three.js.
reseed(OF.SEED+1);const OF_T0=performance.now();
for(const f of FRAME_HOOKS_PRE)FRAME_HOOKS.push(f);
// ---------------------------------------------------------------- the sky and its light (KratorSky, as Phēr's)
const OF_DAY=(function(){const v=Number(new URLSearchParams(location.search).get('day'));return isFinite(v)&&v>0?v:140;})();
const OF_SKY={hour:9.4,day:OF_DAY,dens:1.05};
const OF_WATER_ON=typeof WATER!=='undefined'&&!!WATER.flow&&!!WATER.drawFlow&&typeof ATMOS!=='undefined',OF_RIVER_NEAR=[-1700,3600];   /* the reach core/water draws (90w) */
const OF_SKYG=KratorSky.attach(scene,9000);scene.fog.density=.00014;   /* the dome's group: core/water's skylight captures it (90w) */
const ofHemi=scene.children.find(o=>o.isHemisphereLight);
function ofSkyTick(){KratorSky.update(camera.position,OF_SKY.hour,OF_SKY.day,OF_SKY.dens);const L=KratorSky.lighting();
 sun.position.copy(L.sunDir).multiplyScalar(1500).add(camera.position);sun.target.position.copy(camera.position);sun.target.updateMatrixWorld();sun.intensity=L.sunIntensity;sun.color.copy(L.sunColor);
 fill.intensity=.22*L.dayF+.05;if(ofHemi)ofHemi.intensity=L.ambient;scene.fog.color.copy(L.fog);renderer.setClearColor(L.fog);}
FRAME_HOOKS.push(ofSkyTick);ofSkyTick();
// ---------------------------------------------------------------- the near ground's extent and its painted canvas
const OFG={x0:-900,x1:2100,z0:-1700,z1:3600,cell:10};OFG.W=OFG.x1-OFG.x0;OFG.H=OFG.z1-OFG.z0;
const OFG_PX=4096/Math.max(OFG.W,OFG.H),ogx=x=>(x-OFG.x0)*OFG_PX,ogz=z=>(z-OFG.z0)*OFG_PX;
const ofCv=document.createElement('canvas');ofCv.width=Math.ceil(OFG.W*OFG_PX);ofCv.height=Math.ceil(OFG.H*OFG_PX);
const ofSlope=(x,z)=>{const e=6;return Math.hypot(ofH(x+e,z)-ofH(x-e,z),ofH(x,z+e)-ofH(x,z-e))/(2*e);};
(function ofPaint(){const g=ofCv.getContext('2d'),W=ofCv.width,H=ofCv.height,img=g.createImageData(W,H),D=img.data,N=OF.NE;
 // the ground's colour by place: the river's bed, the bank's gravel, the flats, the riser and the bench's grass, the slope's
 // tilled ground, the spur's woods; rock on steep ground
 const col=(x,z)=>{const y=ofH(x,z),w=ofW(z),c=ofRiverX(z),hw=ofHW(z),d=x-c,e=Math.abs(d)-hw,s=ofSlope(x,z);
  if(e<0)return y<w-1.2?[92,110,100]:[150,142,120];
  let k;if(e<8)k=[158,148,122];
  else if(d<0)k=e<OF.SW.flats?[118,128,82]:[78,98,58];
  else if(e<N.riser[0])k=[122,132,84];else if(e<N.slopeAt)k=[110,124,72];
  else{const f=Math.floor((e+9*Math.sin(z/310))/37)%3;k=f===0?[126,126,80]:f===1?[118,128,76]:[112,124,70];}   /* the slope's terraces: bands along its contours */
  const r=Math.min(1,Math.max(0,(s-.3)/.35));return[k[0]+(120-k[0])*r,k[1]+(110-k[1])*r,k[2]+(96-k[2])*r];};
 for(let j=0;j<H;j+=2)for(let i=0;i<W;i+=2){const c=col(OFG.x0+(i+1)/OFG_PX,OFG.z0+(j+1)/OFG_PX);
  for(const [a,b] of[[0,0],[1,0],[0,1],[1,1]]){if(i+a>=W||j+b>=H)continue;const k=((j+b)*W+i+a)*4;D[k]=c[0];D[k+1]=c[1];D[k+2]=c[2];D[k+3]=255;}}
 g.putImageData(img,0,0);
 const path=(P,closed)=>{g.beginPath();P.forEach((p,i)=>i?g.lineTo(ogx(p[0]),ogz(p[1])):g.moveTo(ogx(p[0]),ogz(p[1])));if(closed)g.closePath();};
 const line=(P,w)=>{g.lineWidth=w*OFG_PX;path(P);g.stroke();};
 g.lineCap='round';g.lineJoin='round';
 // the paddies: each basin's still water over its mud, its bund a lighter rim
 for(const q of OF_WORKS.paddies){path(q.poly,true);g.fillStyle='#5f7f6c';g.fill();g.lineWidth=2.2*OFG_PX;g.strokeStyle='#9c9a74';g.stroke();}
 // the mill's race and its tail back to the river
 g.strokeStyle='#5c8f8a';line(OF_WORKS.race,4);line(OF_WORKS.tail,4);
 // the square (packed earth), the ways at their widths: the avenue and the roads in packed gravel, the streets and lanes cobbled
 const SQ=OF.SQUARE;g.fillStyle='#a69a84';g.fillRect(ogx(SQ.x[0]),ogz(SQ.z[0]),(SQ.x[1]-SQ.x[0])*OFG_PX,(SQ.z[1]-SQ.z[0])*OFG_PX);
 /* the Iridescent Order's house: its pavings (the Bow Terrace, the forecourt, the terraces' walks, the pool's ledge) in pale stone, its tank */
 if(OF_HOUSE){g.fillStyle='#b8b1a0';for(const q of OF_HOUSE.pavings){path(q.poly,true);g.fill();}g.fillStyle='#5f8f8c';path(OF_HOUSE.tank,true);g.fill();}
 for(const w of OF.ways){g.strokeStyle=w.cls==='road'?'#a39a82':w.cls==='avenue'?'#a8a194':w.cls==='main'?'#9b9386':'#8f887b';line(w.pts,w.w);}
 // a dooryard of trodden earth under every building, a shade darker than the ground (none under the spans and the boats)
 g.fillStyle='rgba(92,80,64,.35)';for(const p of OF_PLACE){if(p.kind==='bridge'||p.kind==='boat')continue;const b=p.bo,c=Math.cos(p.ry),s=Math.sin(p.ry),hw=b.hw+2,hd=b.hd+2;
  path([[-hw,-hd],[hw,-hd],[hw,hd],[-hw,hd]].map(q=>[p.x+q[0]*c+q[1]*s,p.z-q[0]*s+q[1]*c]),true);g.fill();}})();
// ---------------------------------------------------------------- the ground's texture: the library's sets over the paint
// As Phēr's ground (its phGroundShader), from the Vale of Xanadu biome's own pack ('xanadu-bio', which Xanadu's page carries):
// a detail map over everything (two scales), the river's sand and pebbles on the bank's strip, its gravel on the shoals and
// under the water, and on steep ground the rock banded by height. Per-vertex masks from the ground's closed form. [web]: a shader hook.
function ofGroundShader(g,m,cx,cz){const T3=THREE,sm=ofSm,p=g.attributes.position;
 const lay=new Float32Array(p.count*4),gm=new Float32Array(p.count);
 for(let i=0;i<p.count;i++){const x=p.getX(i)+cx,z=-p.getY(i)+cz,c=ofRiverX(z),hw=ofHW(z),e=Math.abs(x-c)-hw,s=ofSlope(x,z);
  const bank=sm(-6,1,e)*sm(16,4,e),peb=sm(.42,.62,fbm(x*.012+4,z*.012-1,617,2));
  lay[i*4]=bank*(1-peb);lay[i*4+1]=bank*peb;lay[i*4+2]=sm(2,-3,e);lay[i*4+3]=0;gm[i]=sm(.32,.7,s);}
 g.setAttribute('aGL',new T3.BufferAttribute(lay,4));g.setAttribute('aGM',new T3.BufferAttribute(gm,1));
 const P=n=>(typeof KMAT!=='undefined'&&KMAT.packed)?KMAT.packed('xanadu-bio',n):null,TX=L=>KMAT.textures(L,{aniso:8}).map;
 const dL=P('groundDetail'),a=P('ground.shore'),b=P('ground.pebble'),c=P('ground.gravel'),LIB=!!(dL&&a&&b&&c);window._ofGround={lib:LIB};if(!LIB)return;
 const det=TX(dL);det.wrapS=det.wrapT=T3.RepeatWrapping;const L={shore:TX(a),shoreK:1/a.scale[0],peb:TX(b),pebK:1/b.scale[0],grav:TX(c),gravK:1/c.scale[0]};
 for(const k of['shore','peb','grav']){L[k].wrapS=L[k].wrapT=T3.RepeatWrapping;}
 const f4=v=>v.toFixed(4),tri=(u,k)=>'mix(pow(texture2D('+u+',p*'+f4(k)+').rgb,vec3(2.2)),pow(texture2D('+u+',q*'+f4(k*.47)+'+vec2(0.31,0.17)).rgb,vec3(2.2)),mt)';
 m.onBeforeCompile=sh=>{Object.assign(sh.uniforms,{uDetail:{value:det},uLShore:{value:L.shore},uLPeb:{value:L.peb},uLGrav:{value:L.grav}});
  sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nattribute vec4 aGL;attribute float aGM;varying vec4 vGL;varying float vGM;varying vec3 vGWP;')
   .replace('#include <worldpos_vertex>','#include <worldpos_vertex>\nvGL=aGL;vGM=aGM;vGWP=(modelMatrix*vec4(transformed,1.0)).xyz;');
  sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nuniform sampler2D uDetail;uniform sampler2D uLShore;uniform sampler2D uLPeb;uniform sampler2D uLGrav;varying vec4 vGL;varying float vGM;varying vec3 vGWP;')
   .replace('#include <map_fragment>',['#include <map_fragment>',
    '{vec3 dt=texture2D(uDetail,vGWP.xz*0.165).rgb;vec3 dt2=texture2D(uDetail,vGWP.xz*0.021+0.37).rgb;diffuseColor.rgb*=mix(vec3(1.0),dt*dt2*1.12,0.8);',
    'vec2 p=vGWP.xz,q=mat2(0.799,-0.602,0.602,0.799)*p;float mt=smoothstep(-0.3,0.3,sin(p.x*0.017+2.0*sin(p.y*0.011))*sin(p.y*0.013+1.3));',
    'vec3 ts='+tri('uLShore',L.shoreK)+';vec3 tp='+tri('uLPeb',L.pebK)+';vec3 tg='+tri('uLGrav',L.gravK)+';',
    'diffuseColor.rgb=mix(diffuseColor.rgb,diffuse*ts*1.3,0.8*vGL.x);diffuseColor.rgb=mix(diffuseColor.rgb,diffuse*tp*1.3,0.8*vGL.y);diffuseColor.rgb=mix(diffuseColor.rgb,diffuse*tg*1.3,0.8*vGL.z);',
    ' float y=vGWP.y+6.0*sin(vGWP.x*0.004+vGWP.z*0.003)+2.0*sin(vGWP.x*0.031);float b1=0.5+0.5*sin(y*0.21),b2=smoothstep(0.6,0.95,sin(y*0.07+1.3));',
    ' vec3 st=mix(vec3(0.34,0.30,0.24),vec3(0.44,0.36,0.26),b1);st=mix(st,vec3(0.28,0.26,0.26),b2*0.7);st*=0.85+0.3*texture2D(uDetail,vec2(vGWP.x+vGWP.z,vGWP.y*3.0)*0.05).r;',
    ' diffuseColor.rgb=mix(diffuseColor.rgb,st,vGM*0.55);}'].join('\n'));};
 m.customProgramCacheKey=()=>'of-ground';}
// ---------------------------------------------------------------- the meshes: the near ground, the far ground, the river
(function ofTerrain(){const cell=OFG.cell,NX=Math.round(OFG.W/cell),NZ=Math.round(OFG.H/cell),geo=new THREE.PlaneGeometry(OFG.W,OFG.H,NX,NZ);
 const p=geo.attributes.position,uv=geo.attributes.uv,cx=(OFG.x0+OFG.x1)/2,cz=(OFG.z0+OFG.z1)/2;
 for(let i=0;i<p.count;i++){const x=p.getX(i)+cx,z=-p.getY(i)+cz;p.setZ(i,ofH(x,z));uv.setXY(i,ogx(x)/ofCv.width,1-ogz(z)/ofCv.height);}
 geo.computeVertexNormals();const tex=new THREE.CanvasTexture(ofCv);tex.encoding=THREE.sRGBEncoding;tex.anisotropy=8;
 const gmat=new THREE.MeshStandardMaterial({map:tex,roughness:.95,metalness:0});ofGroundShader(geo,gmat,cx,cz);
 groundM=new THREE.Mesh(geo,gmat);groundM.rotation.x=-Math.PI/2;groundM.position.set(cx,0,cz);
 groundM.userData.isGround=true;groundM.userData.probeSkip=true;groundM.name='terrain';scene.add(groundM);
 /* the drawn ground for the audits (core/drawn): the same heights at the same vertices, rows along +z */
 if(typeof KDRAWN!=='undefined'){const h=new Float32Array((NX+1)*(NZ+1));for(let j=0;j<=NZ;j++)for(let i=0;i<=NX;i++)h[j*(NX+1)+i]=ofH(OFG.x0+i*cell,OFG.z0+j*cell);
  KDRAWN.add(KDRAWN.grid({x0:OFG.x0,z0:OFG.z0,dx:cell,dz:cell,nx:NX,nz:NZ,h}));}
 // the far ground: 80 m cells down the valley and up both its sides, coloured by height and slope, 3 m under the near mesh where they meet
 const F={x0:-9000,x1:9000,z0:-9000,z1:12000},fc=80,fx=Math.round((F.x1-F.x0)/fc),fz=Math.round((F.z1-F.z0)/fc),fg=new THREE.PlaneGeometry(F.x1-F.x0,F.z1-F.z0,fx,fz);
 const fp=fg.attributes.position,fcx=(F.x0+F.x1)/2,fcz=(F.z0+F.z1)/2,cols=new Float32Array(fp.count*3),lin=c=>Math.pow(c/255,2.2);
 for(let i=0;i<fp.count;i++){const x=fp.getX(i)+fcx,z=-fp.getY(i)+fcz,inNear=x>OFG.x0+20&&x<OFG.x1-20&&z>OFG.z0+20&&z<OFG.z1-20,y=ofH(x,z)-(inNear?3:0);fp.setZ(i,y);
  const s=Math.abs(ofH(x,z-40)-ofH(x,z+40))/80+Math.abs(ofH(x-40,z)-ofH(x+40,z))/80,e=Math.abs(x-ofRiverX(z))-ofHW(z);
  const c=e<0?[96,140,134]:s>.25?[112,108,92]:x<ofRiverX(z)?[78,98,58]:e<OF.NE.slopeAt?[112,124,72]:[124,126,78];
  cols[i*3]=lin(c[0]);cols[i*3+1]=lin(c[1]);cols[i*3+2]=lin(c[2]);}
 fg.setAttribute('color',new THREE.BufferAttribute(cols,3));fg.computeVertexNormals();
 const far=new THREE.Mesh(fg,new THREE.MeshStandardMaterial({vertexColors:true,roughness:1,metalness:0}));far.rotation.x=-Math.PI/2;far.position.set(fcx,0,fcz);
 far.userData.probeSkip=true;far.name='far ground';scene.add(far);
 // the river: a ribbon at the water's height down its line, 1 m into each bank (the bank rises over its edge), from the far
 // ground's lower edge to its upper; a paler ribbon of white water over the rapids and the fall
 const ribbon=(z0,z1,step,widen,lift,mat,name)=>{const n=Math.round((z1-z0)/step),pos=new Float32Array((n+1)*6),idx=[];
  for(let k=0;k<=n;k++){const z=z0+k*step,c=ofRiverX(z),hw=ofHW(z)+widen,y=ofW(z)+lift(z);pos.set([c-hw,y,z,c+hw,y,z],k*6);
   if(k<n){const a=k*2;idx.push(a,a+2,a+1,a+1,a+2,a+3);}}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setIndex(idx);g.computeVertexNormals();
  const M=new THREE.Mesh(g,mat);M.userData.probeSkip=true;M.name=name;scene.add(M);return M;};
 /* the near reach (OF_RIVER_NEAR) is core/water's flow and fall (90w); the ribbon draws the river beyond it, or the whole of it
    when core/water is not on the page */
 const rm=new THREE.MeshStandardMaterial({color:0x6fa39a,roughness:.12,metalness:.25,transparent:true,opacity:.9,side:THREE.DoubleSide});
 if(OF_WATER_ON){ribbon(F.z0,OF_RIVER_NEAR[0]+12,6,1,()=>0,rm,'the Sitār Ḍrāi (below)');ribbon(OF_RIVER_NEAR[1]-12,F.z1,6,1,()=>0,rm,'the Sitār Ḍrāi (above)');return;}
 ribbon(F.z0,F.z1,6,1,()=>0,rm,'the Sitār Ḍrāi');
 const Fl=OF.REACH.fall,white=z=>Math.max(ofSm(Fl.z-Fl.len,Fl.z,z)*ofSm(Fl.z+Fl.len,Fl.z,z),.35*ofSm(OF.REACH.slack[1],OF.REACH.slack[1]+200,z),.3*ofSm(OF.REACH.slack[0],OF.REACH.slack[0]-200,z));
 const wm=new THREE.MeshStandardMaterial({color:0xe8f0ec,roughness:.6,metalness:0,transparent:true,opacity:.55,depthWrite:false,side:THREE.DoubleSide});
 ribbon(Fl.z-Fl.len*1.2,Fl.z+Fl.len*1.2,3,-2,z=>.08+.02*white(z),wm,'the fall\'s white water');})();
window._worldMs=Math.round(performance.now()-OF_T0);
