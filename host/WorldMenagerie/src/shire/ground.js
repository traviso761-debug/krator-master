// ---------- the ground of the Shire: the patchwork, and the lanes across it ----------
// Fan work; Tolkien's world belongs to the Tolkien Estate and every shape and colour here is this project's own.
//
// Tolkien paints the country round Hobbiton as a patchwork: fields in a dozen greens and yellows and the
// brown of plough, each with its rows running its own way, hedges between them, and the lanes in them sandy
// yellow. tools/make-shire.py paints the fields into data/cities/shire-fields.png - four metres a pixel, the
// field's colour in RGB, the direction of its rows in alpha - and this shader reads it: the colour, furrows
// or mown stripes in the field's own direction, and a little noise so no field is flat paint. The garden
// strips on the Hill are the alpha 40 pixels.
//
// Past the edge of the box the country goes on (the engine's flat horizon plate is replaced, as in
// Rivendell): the same shader, making up fields of its own from a cell pattern, on low rolling hills.

export function ground(api){
  const {THREE,ctx,scene}=api;
  const V=ctx.plan;if(!V)return;
  const F=V.fields;
  const tex=new THREE.TextureLoader().load(F.image);
  tex.flipY=false;   // row 0 of the image is the north edge, z0: unflipped, or the patchwork is mirrored and misses its hedges
  tex.magFilter=THREE.NearestFilter;tex.minFilter=THREE.NearestFilter;tex.generateMipmaps=false;
  const U={uFields:{value:tex},uF:{value:new THREE.Vector4(F.x0,F.z0,F.w,F.d)}};
  const mat=new THREE.MeshLambertMaterial({color:0xffffff});
  mat.extensions={derivatives:true};
  mat.onBeforeCompile=sh=>{
    Object.assign(sh.uniforms,U);
    sh.vertexShader='varying vec3 vWP;varying vec3 vWN;\n'+sh.vertexShader.replace('#include <fog_vertex>',
      '#include <fog_vertex>\n vWP=(modelMatrix*vec4(transformed,1.0)).xyz;vWN=normalize(mat3(modelMatrix)*objectNormal);');
    sh.fragmentShader=`varying vec3 vWP;varying vec3 vWN;uniform sampler2D uFields;uniform vec4 uF;
float h1(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float n2(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(h1(i),h1(i+vec2(1,0)),f.x),mix(h1(i+vec2(0,1)),h1(i+vec2(1,1)),f.x),f.y);}
float fb(vec2 p){return 0.5*n2(p)+0.25*n2(p*2.03+7.1)+0.125*n2(p*4.1+3.3);}
float rows(float s,float w,float fw){float d=abs(fract(s/w)-0.5)*2.0;return smoothstep(0.35,0.75,d)*(1.0-smoothstep(0.3,1.0,fw/w));}
`+sh.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
 {
 vec2 q=vWP.xz;float fw=length(fwidth(q));
 vec2 uv=(q-uF.xy)/uF.zw;
 vec3 c;float a;
 if(uv.x>0.0&&uv.x<1.0&&uv.y>0.0&&uv.y<1.0){vec4 t=texture2D(uFields,vec2(uv.x,uv.y));c=t.rgb;a=t.a*255.0;}
 else{
   // beyond the box: fields of the shader's own, on the same slant as the real ones
   float r=0.244;vec2 rq=vec2(q.x*cos(r)+q.y*sin(r),-q.x*sin(r)+q.y*cos(r));
   rq+=vec2(fb(q*0.0018),fb(q*0.0018+3.0))*110.0;
   vec2 cid=floor(rq/vec2(210.0,262.0));float k=h1(cid);
   c=k<0.42?vec3(0.41,0.59,0.24):k<0.58?vec3(0.63,0.67,0.33):k<0.72?vec3(0.8,0.71,0.36):k<0.8?vec3(0.52,0.39,0.27):vec3(0.46,0.56,0.28);
   c*=0.9+0.2*h1(cid+7.0);a=255.0;
   vec2 e=abs(fract(rq/vec2(210.0,262.0))-0.5)*vec2(210.0,262.0);
   c=mix(c,vec3(0.18,0.30,0.14),(1.0-smoothstep(1.5,4.0,min(105.0-e.x,131.0-e.y)))*(1.0-smoothstep(4.0,20.0,fw)));   // their hedges, drawn in
 }
 // rows: furrows, drills, or mown swathes, the way the field runs
 if(a<254.0){
   if(a<45.0){float s=q.x;c*=0.9+0.1*rows(s,1.6,fw);}                    // garden strips on the Hill
   else{float th=(a-50.0)/200.0*3.14159;float s=dot(q,vec2(cos(th),sin(th)));
     c*=0.93+0.08*rows(s,a>200.0?5.0:2.4,fw);}
 }
 c*=0.88+0.16*fb(q*0.05)+0.06*(fb(q*0.6)-0.5);
 // wear: where the ground is steep it is rougher and a shade darker
 float slope=1.0-clamp(normalize(vWN).y,0.0,1.0);
 c=mix(c,c*vec3(0.85,0.82,0.78),smoothstep(0.15,0.4,slope));
 diffuseColor.rgb=c;
 }`);
  };
  mat.customProgramCacheKey=()=>'shire-ground';
  scene.traverse(o=>{if(o.isMesh&&o.name==='terrain'){o.material=mat;if(o.geometry.attributes.color)o.geometry.deleteAttribute('color');}});

  // ---- the country beyond the box ----
  let ring=null;scene.traverse(o=>{if(o.isMesh&&o.geometry&&o.geometry.type==='RingGeometry'&&o.renderOrder===-1)ring=o;});
  if(ring)ring.visible=false;
  const B=api.B,HX=B.w/2,HZ=B.d/2,groundH=api.groundH;
  {const S=200,N=110,L=S*N/2,pos=[],idx=[];
   const edgeH=(x,z)=>groundH(Math.max(-HX+1,Math.min(HX-1,x)),Math.max(-HZ+1,Math.min(HZ-1,z)));
   for(let j=0;j<=N;j++)for(let i=0;i<=N;i++){const x=B.cx-L+i*S,z=B.cz-L+j*S;
     const out=Math.max(Math.abs(x-B.cx)-HX,Math.abs(z-B.cz)-HZ,0);
     const y=edgeH(x,z)+Math.min(1,out/1500)*(22*Math.sin(x/1700+z/2300)+14*Math.sin(x/900-z/1300)+18)-1.5;
     pos.push(x,y,z);}
   for(let j=0;j<N;j++)for(let i=0;i<N;i++){const x=B.cx-L+(i+0.5)*S,z=B.cz-L+(j+0.5)*S;
     if(Math.abs(x-B.cx)<HX-S*0.6&&Math.abs(z-B.cz)<HZ-S*0.6)continue;const a=j*(N+1)+i;idx.push(a,a+N+1,a+1,a+1,a+N+1,a+N+2);}
   const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setIndex(idx);g.computeVertexNormals();
   const m=new THREE.Mesh(g,mat);m.userData.noWire=true;scene.add(m);}

  // ---- the lanes: sandy, with a grass crown between the wheel-ruts on the smaller ones ----
  const laneM=new THREE.MeshLambertMaterial({color:0xffffff,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-4});
  laneM.onBeforeCompile=sh=>{
    sh.vertexShader='attribute vec2 aUV;varying vec2 vUV;\n'+sh.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\n vUV=aUV;');
    sh.fragmentShader='varying vec2 vUV;\nfloat lh(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}\n'+sh.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
 {float v=abs(vUV.y);vec3 sand=vec3(0.80,0.69,0.47)*(0.9+0.12*lh(floor(vUV*vec2(0.8,6.0))));
  float crown=(1.0-smoothstep(0.1,0.25,v))*step(0.5,vUV.x*0.0+1.0)*diffuseColor.r;   // the grass crown: diffuse.r carries whether this lane has one
  vec3 c=mix(sand,vec3(0.42,0.56,0.26),crown);
  c=mix(c,vec3(0.45,0.58,0.28),smoothstep(0.82,1.0,v));                           // grass at the verges
  diffuseColor.rgb=c;}`);
  };
  laneM.customProgramCacheKey=()=>'shire-lane';
  const laneCrownM=laneM.clone();laneCrownM.color=new THREE.Color(1,1,1);laneCrownM.onBeforeCompile=laneM.onBeforeCompile;laneCrownM.customProgramCacheKey=laneM.customProgramCacheKey;
  laneM.color=new THREE.Color(0,1,1);
  for(const L of V.lanes){
    const p=L.p,pos=[],uv=[],idx=[];let u=0;const dense=[];
    for(let i=0;i+1<p.length;i++){const [ax,az]=p[i],[bx,bz]=p[i+1],n=Math.max(1,Math.ceil(Math.hypot(bx-ax,bz-az)/4));
      for(let k=0;k<n;k++){const t=k/n;dense.push([ax+(bx-ax)*t,az+(bz-az)*t]);}}
    dense.push(p[p.length-1]);
    for(let i=0;i<dense.length;i++){const a=dense[Math.max(0,i-1)],b=dense[Math.min(dense.length-1,i+1)],[x,z]=dense[i];
      let dx=b[0]-a[0],dz=b[1]-a[1];const l=Math.hypot(dx,dz)||1;dx/=l;dz/=l;if(i>0)u+=Math.hypot(x-dense[i-1][0],z-dense[i-1][1]);
      for(const v of [-1,0,1]){const px=x-dz*v*L.w/2,pz=z+dx*v*L.w/2;pos.push(px,groundH(px,pz)+0.12,pz);uv.push(u,v);}}
    for(let i=0;i<dense.length-1;i++)for(let k=0;k<2;k++){const a=i*3+k;idx.push(a,a+1,a+3,a+1,a+4,a+3);}   // wound to face up
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('aUV',new THREE.Float32BufferAttribute(uv,2));
    g.setIndex(idx);g.computeVertexNormals();
    const m=new THREE.Mesh(g,(L.k==='lane'||L.k==='track')?laneCrownM:laneM);m.receiveShadow=true;m.userData.wireCat='road';scene.add(m);
  }
}
