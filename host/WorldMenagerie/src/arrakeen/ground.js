// ---------- the ground of the basin ----------
// Fan work; Dune belongs to the Herbert estate and every shape and colour here is this project's own.
//
// Arrakis is sand and rock and nothing else, and the look of it is in how the two meet. The films shot the rock
// at Wadi Rum and the sand at Liwa, and that is the palette: the rock a warm red-ochre sandstone in horizontal
// beds, streaked dark down the faces with desert varnish, benched where a hard bed stands over a soft one; the
// sand paler, rippled across the wind, the dune crests lighter than their troughs; the basin between them
// swept stony ground. What people have made is drawn from the plan (data/cities/arrakeen-city.json), so its
// edges are clean at any distance: the paved circle of the city, the landing field fused to a dark glass by
// a thousand take-offs with a scorched ring under every pad, and the plantations the qanats feed, in rows.

export function ground(api){
  const {THREE,ctx,scene}=api;
  const P=ctx.arrakeenCity;if(!P)return;
  const S=P.sites,F=P.fieldRect,pl=P.plantations||[];
  const v3=(a)=>new THREE.Vector3(a[0],a[1],a[2]);
  const U={
    uCity:{value:v3(S.city)},uField:{value:new THREE.Vector4(F[0],F[1],F[2],F[3])},
    uPads:{value:(P.pads||[]).slice(0,4).map(v3)},
    uPlant:{value:[0,1,2,3].map(i=>pl[i]?v3(pl[i]):new THREE.Vector3(0,0,-99))},
    uGarden:{value:new THREE.Vector3(S.residency[0],S.residency[1],0.2)},
    uWind:{value:new THREE.Vector2(0.94,0.34)},
  };
  const mat=new THREE.MeshLambertMaterial({color:0xffffff});
  mat.extensions={derivatives:true};
  mat.onBeforeCompile=sh=>{
    Object.assign(sh.uniforms,U);
    sh.vertexShader='varying vec3 vWP;varying vec3 vWN;\n'+sh.vertexShader.replace('#include <fog_vertex>',
      '#include <fog_vertex>\n vWP=(modelMatrix*vec4(transformed,1.0)).xyz;vWN=normalize(mat3(modelMatrix)*objectNormal);');
    sh.fragmentShader=`varying vec3 vWP;varying vec3 vWN;uniform vec3 uCity;uniform vec4 uField;uniform vec3 uPads[4];uniform vec3 uPlant[4];uniform vec3 uGarden;uniform vec2 uWind;
float h1(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float n2(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(h1(i),h1(i+vec2(1,0)),f.x),mix(h1(i+vec2(0,1)),h1(i+vec2(1,1)),f.x),f.y);}
float fb(vec2 p){return 0.5*n2(p)+0.25*n2(p*2.03+7.1)+0.125*n2(p*4.1+3.3)+0.0625*n2(p*8.3+1.7);}
`+sh.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
 {vec2 q=vWP.xz;float y=vWP.y;float fw=length(fwidth(q));vec3 nrm=normalize(vWN);float slope=1.0-clamp(nrm.y,0.0,1.0);
  // sand: pale ochre, the crests lighter, rippled across the wind (the ripples only where they can be seen)
  float along=dot(q,uWind),across=dot(q,vec2(-uWind.y,uWind.x));
  vec3 sand=mix(vec3(0.80,0.65,0.45),vec3(0.88,0.76,0.56),fb(q*0.0012));
  sand*=0.92+0.1*fb(q*0.02);
  float rip=0.5+0.5*sin((along+2.0*n2(q*0.05))*2.6);sand*=1.0-0.05*rip*(1.0-smoothstep(0.3,1.5,fw));
  sand=mix(sand,sand*1.08,smoothstep(0.08,0.3,slope)*step(0.0,dot(nrm.xz,-uWind)));   // the windward faces catch more light-coloured grains
  sand=mix(sand,sand*vec3(0.86,0.82,0.8),smoothstep(0.15,0.4,slope)*step(0.0,dot(nrm.xz,uWind)));   // the slip faces, on the lee, steeper and a little darker
  // the basin floor: swept stony ground, grey-tan, gravel-speckled
  vec3 floorC=mix(vec3(0.70,0.61,0.48),vec3(0.62,0.55,0.45),fb(q*0.004));floorC*=0.9+0.2*step(0.8,h1(floor(q*0.7)))*0.5;
  float stony=smoothstep(600.0,-200.0,length(q-vec2(-1500.0,2400.0))*0.8-3600.0);   // near the rock the sand gives way to stone
  vec3 c=mix(sand,floorC,clamp(stony,0.0,1.0));
  // rock: red-ochre sandstone in beds, with dark varnish down the faces and paler caps
  float beds=0.5+0.5*sin(y*0.11+2.0*fb(q*0.003))+0.25*sin(y*0.37+1.3);
  vec3 rock=mix(vec3(0.55,0.36,0.24),vec3(0.70,0.50,0.34),clamp(beds*0.7,0.0,1.0));
  rock*=0.85+0.25*fb(vec2(q.x+q.y,y*0.2)*0.05);
  float varnish=smoothstep(0.55,0.8,fb(vec2(dot(q,vec2(0.7,0.7))*0.03,y*0.004)))*smoothstep(0.35,0.7,slope);
  rock=mix(rock,vec3(0.25,0.17,0.13),varnish*0.7);
  float rocky=smoothstep(0.22,0.42,slope)+smoothstep(330.0,420.0,y)*smoothstep(0.08,0.2,slope);
  c=mix(c,rock,clamp(rocky,0.0,1.0));
  // the city's paving, a ring road of it under the wall, and the plaza round the Residency
  float cd=length(q-uCity.xy);float paved=1.0-smoothstep(uCity.z-10.0,uCity.z+30.0,cd);
  vec3 pave=vec3(0.68,0.59,0.47)*(0.9+0.1*step(0.5,fract(q.x*0.25+0.5*step(0.5,fract(q.y*0.25)))))*(0.92+0.1*fb(q*0.03));
  c=mix(c,pave,paved);
  // the landing field: fused dark glass, scorched rings under the pads, the lines of the lanes
  {vec2 d=abs(q-uField.xy)-uField.zw*0.5;float inF=1.0-smoothstep(-10.0,20.0,max(d.x,d.y));
   vec3 glass=vec3(0.30,0.27,0.24)*(0.85+0.2*fb(q*0.01));
   for(int i=0;i<4;i++){float r=length(q-uPads[i].xy);float ring=smoothstep(uPads[i].z*1.4,uPads[i].z*0.6,r);glass=mix(glass,vec3(0.16,0.13,0.11),ring*0.7);
     glass=mix(glass,vec3(0.78,0.62,0.30),(1.0-smoothstep(2.0,5.0+fw,abs(r-uPads[i].z))) );}
   c=mix(c,glass,inF);}
  // the plantations: green in rows along the qanats, ragged at the edges
  for(int i=0;i<4;i++){vec3 P=uPlant[i];if(P.z<-9.0)continue;vec2 d=q-P.xy;float u=d.x*cos(P.z)+d.y*sin(P.z),v=-d.x*sin(P.z)+d.y*cos(P.z);
    float e=length(vec2(u/700.0,v/(190.0*(0.6+0.4*fb(vec2(u*0.004,float(i)))))));float inP=1.0-smoothstep(0.9,1.0,e);
    vec3 green=mix(vec3(0.30,0.36,0.18),vec3(0.42,0.44,0.24),0.5+0.5*sin(v*0.9));c=mix(c,green,inP*0.9);}
  // the Residency's garden
  {vec2 d=q-uGarden.xy;float u=d.x*cos(uGarden.z)+d.y*sin(uGarden.z),v=-d.x*sin(uGarden.z)+d.y*cos(uGarden.z);
   float g=(1.0-smoothstep(140.0,150.0,abs(u)))*(1.0-smoothstep(100.0,110.0,abs(v)));c=mix(c,vec3(0.24,0.40,0.18)*(0.8+0.3*fb(q*0.1)),g);}
  diffuseColor.rgb=c;}`);
  };
  mat.customProgramCacheKey=()=>'arrakeen-ground';
  let n=0;scene.traverse(o=>{if(o.isMesh&&o.name==='terrain'){o.material=mat;if(o.geometry.attributes.color)o.geometry.deleteAttribute('color');n++;}});

  // ---- the sand past the edge of the map ----
  // The engine's far ring starts nine kilometres out, which on a map this size is inside it, and it would lay
  // a flat sheet over the lower dunes. It is put away and the sand carries on instead: the edge of the ground,
  // held and then rolled out into dunes of the same run, under the same shader.
  let rings=0;scene.traverse(o=>{if(o.isMesh&&o.geometry&&o.geometry.type==='RingGeometry'&&o.renderOrder===-1&&o.geometry.parameters.outerRadius>5000){o.visible=false;rings++;}});
  {const B=api.B,HX=B.w/2,HZ=B.d/2,S=400,N=110,L=S*N/2,pos=[],idx=[],groundH=api.groundH;
   const edgeH=(x,z)=>groundH(Math.max(B.cx-HX+1,Math.min(B.cx+HX-1,x)),Math.max(B.cz-HZ+1,Math.min(B.cz+HZ-1,z)));
   for(let j=0;j<=N;j++)for(let i=0;i<=N;i++){const x=B.cx-L+i*S,z=B.cz-L+j*S,out=Math.max(Math.abs(x-B.cx)-HX,Math.abs(z-B.cz)-HZ,0);
     const u=(x*0.94+z*0.34)/900,f=u-Math.floor(u);const dune=(f<0.72?1-Math.pow(1-f,1.7):Math.pow(1-(f-0.72)/0.28,0.8))*60;
     pos.push(x,edgeH(x,z)+Math.min(1,out/1500)*(dune-20)-2,z);}
   for(let j=0;j<N;j++)for(let i=0;i<N;i++){const x=B.cx-L+(i+0.5)*S,z=B.cz-L+(j+0.5)*S;
     if(Math.abs(x-B.cx)<HX-S*0.6&&Math.abs(z-B.cz)<HZ-S*0.6)continue;const a=j*(N+1)+i;idx.push(a,a+N+1,a+1,a+1,a+N+1,a+N+2);}
   const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setIndex(idx);g.computeVertexNormals();
   const m=new THREE.Mesh(g,mat);m.userData.noWire=true;m.receiveShadow=true;scene.add(m);}
  ctx.details=Object.assign(ctx.details||{},{groundTiles:n,farRingsHidden:rings});
}
