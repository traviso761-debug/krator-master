// ---------- Mount Hood: the water through the year ----------
//   the lakes     the engine's lake polygons, each at its own level (tools/build-osm-city.py terrain.lakeLevels), freeze
//                 by their own height: Lost Lake (959 m) seldom more than at its edges, Trillium (1098 m) from about
//                 Christmas into March, Mirror Lake (1253 m) and Burnt Lake into April; snow lies on the ice, and as
//                 it goes out in spring it breaks into floes and leads of dark water
//   the streams   OpenStreetMap's 1,000 km of streams and rivers (data/cities/mthood-mtn.json) as ribbons on the ground,
//                 flowing downhill (OSM draws a waterway in the direction it runs), white where they are steep. The
//                 glacial rivers (the Sandy, the Zigzag, the White River, the Muddy Fork, the Eliot and Coe Branches,
//                 Newton Creek) are milky grey-green with rock flour; the rest are clear. Above the season's snow line
//                 they run under the snowpack and are not seen; the intermittent ones are dry gravel in late summer;
//                 all of them run highest in the June melt
//   the falls     every mapped waterfall (51 of them: Ramona Falls' fan of veils over columnar basalt, Tamanawas Falls'
//                 curtain, Yocum Falls, Umbrella, Sahalie, Little Zigzag...): a veil falling down a wet rock face to
//                 its pool, mist at the foot, heavier in the melt, thin in September, frozen to columns of ice in a
//                 hard winter
//   fumaroles     the steam of the Devil's Kitchen, Crater Rock and Hot Rocks, drifting with the wind, plainest on cold
//                 mornings
// Nothing here is in the layout fingerprint. api.ctx.water: {flow, freeze, falls, streamsAt}.
import {hash3} from '../core/rng.js';

const NOISE=`float whHash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float whNoise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(whHash(i),whHash(i+vec2(1,0)),f.x),mix(whHash(i+vec2(0,1)),whHash(i+vec2(1,1)),f.x),f.y);}
`;
// the glacial rivers: milky with the flour the glaciers grind off the mountain
const GLACIAL=/^(Sandy River|Zigzag River|White River|Muddy Fork|Eliot Branch|Coe Branch|Newton Creek|Clark Creek|Little Zigzag River|Lost Creek|Reid Glacier|Ladd Creek|Polallie Creek|Compass Creek)$/;
// the falls' veils, [top width, bottom width] in metres, where they are not the default (a third of their height)
const WIDTH={'Ramona Falls':[9,30],'Tamanawas Falls':[13,18],'Yocum Falls':[5,11],'Umbrella Falls':[6,13],'Sahalie Falls':[5,9],'Little Zigzag Falls':[4,6],
  'Switchback Falls':[4,8],'Paradise Branch Falls':[3,7],'Yocum Ridge Falls':[3,8],'Pencil Falls':[1.2,1.8],'Wallalute Falls':[5,9]};

export function water(api){
  const {THREE,C,scene,P,groundH,animHooks,camera}=api;const M=api.ctx.mtn||{},S=api.ctx.season,G=api.ctx.ground;
  if(!G||!G.patchMaterial)return;
  const sm=(a,b,x)=>{const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t);},bump=(a,b,c,d,x)=>sm(a,b,x)*(1-sm(c,d,x));
  const W={uTime:{value:0},uIceWin:{value:0},uFlow:{value:0.6},uFreeze:{value:0},uDry:{value:0},uWind:{value:new THREE.Vector2(1,0)},uScale:{value:600},uCold:{value:0.5},uRefl:{value:null},uRM:{value:new THREE.Matrix4()},uRK:{value:0},uMirY:{value:-1e4},uWindK:{value:0.2}};
  const tag=o=>{o.userData.noFingerprint=true;o.userData.noShadow=true;return o;};

  // ---- the lakes: ice by their own height ----
  // the engine's lakes and ponds are one material (waterM) on the meshes it calls 'river'
  let lakeMat=null;scene.traverse(m=>{if(!lakeMat&&m.isMesh&&m.name==='river'&&m.material&&m.material.isMeshPhongMaterial)lakeMat=m.material;});
  const iceGLSL=`float whSm(float a,float b,float x){float t=clamp((x-a)/(b-a),0.0,1.0);return t*t*(3.0-2.0*t);}
float whIce(float h){return whSm(h-60.0,h-260.0,uSnowLine)*uIceWin;}
`;
  if(lakeMat)G.patchMaterial(lakeMat,'mhlakes',sh=>{Object.assign(sh.uniforms,W);
    sh.vertexShader='varying vec3 vWhW;\n'+sh.vertexShader.replace('#include <project_vertex>','#include <project_vertex>\nvWhW=(modelMatrix*vec4(transformed,1.0)).xyz;');
    sh.fragmentShader='uniform float uSnowLine,uFresh,uIceWin,uTime,uRK,uMirY,uWindK;uniform sampler2D uRefl;uniform mat4 uRM;varying vec3 vWhW;float whIceK=0.0;\n'+NOISE+iceGLSL+sh.fragmentShader
      .replace('#include <color_fragment>',`#include <color_fragment>
{float ice=whIce(vWhW.y);
 // as it goes out: floes and leads, the ice rotten and grey before it goes
 float n=whNoise(vWhW.xz*0.018)*0.6+whNoise(vWhW.xz*0.07)*0.3+whNoise(vWhW.xz*0.3)*0.1;
 float k=smoothstep(n-0.06,n+0.06,ice*1.2-0.1);whIceK=k;
 float snowy=smoothstep(0.55,0.95,ice)*(0.75+0.25*whNoise(vWhW.xz*0.05))+uFresh*0.5;
 vec3 iceC=mix(vec3(0.46,0.54,0.58),vec3(0.70,0.76,0.80),whNoise(vWhW.xz*0.11));
 iceC=mix(iceC,vec3(0.92,0.94,0.97),clamp(snowy,0.0,1.0));
 // a fringe of slush round each floe
 iceC=mix(iceC,vec3(0.36,0.44,0.48),(1.0-smoothstep(0.0,0.12,abs(ice*1.2-0.1-n)))*step(ice,0.9)*0.6);
 diffuseColor.rgb=mix(diffuseColor.rgb,iceC,k);}`)
      .replace('#include <lights_phong_fragment>','#include <lights_phong_fragment>\nmaterial.specularColor*=1.0-whIceK*0.92;material.specularShininess=mix(material.specularShininess,4.0,whIceK);')
      // the mirror: only on the lake whose plane it was rendered for, not where it is frozen; rippled by the wind
      .replace('gl_FragColor = vec4( outgoingLight, diffuseColor.a );',`if(uRK>0.0&&abs(vWhW.y-uMirY)<0.6){vec4 rc=uRM*vec4(vWhW,1.0);
  vec2 rp=vec2(whNoise(vWhW.xz*0.21+vec2(uTime*0.6,0.0))-0.5,whNoise(vWhW.xz*0.19-vec2(0.0,uTime*0.5))-0.5)+vec2(whNoise(vWhW.xz*0.9+uTime*1.3)-0.5,0.0)*0.4;
  vec2 ruv=rc.xy/rc.w+rp*(0.004+0.03*uWindK);vec3 rf=texture2D(uRefl,clamp(ruv,0.001,0.999)).rgb*0.88;
  float c=clamp(dot(normal,normalize(vViewPosition)),0.0,1.0),fr=0.06+0.94*pow(1.0-c,4.0);
  outgoingLight=mix(outgoingLight,rf,clamp(fr*uRK*(1.0-whIceK)*(1.0-0.5*uWindK),0.0,0.9));}
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`);});

  // ---- the streams ----
  const dec=a=>{const o=[];for(let i=0;i<a.length;i+=2)o.push([a[i]/10,a[i+1]/10]);return o;};
  const TS=3000,tiles=new Map();
  const tileOf=(x,z,big)=>{const k=(big?'R':'s')+Math.floor(x/TS)+','+Math.floor(z/TS);let t=tiles.get(k);if(!t){t={big,cx:(Math.floor(x/TS)+0.5)*TS,cz:(Math.floor(z/TS)+0.5)*TS,p:[],a:[],b:[],idx:[]};tiles.set(k,t);}return t;};
  const segs=[];let km=0;   // every stream's segments, for finding which way a waterfall faces
  for(const s of M.streams||[]){const pts=dec(s.p);if(pts.length<2)continue;const w=Math.max(1.6,s.w||2.5),big=w>=6,step=big?18:12,glac=GLACIAL.test(s.n||'')?1:0;
    // resample along the line
    const R=[pts[0]];for(let i=0;i+1<pts.length;i++){const [ax,az]=pts[i],[bx,bz]=pts[i+1],L=Math.hypot(bx-ax,bz-az),n=Math.max(1,Math.round(L/step));
      segs.push([ax,az,bx,bz]);for(let k=1;k<=n;k++)R.push([ax+(bx-ax)*k/n,az+(bz-az)*k/n]);}
    // the water's height: the lowest of the ground across the bed, and never climbing downstream (a little ponding is better
    // than a stream that runs up a bump of the 40 m grid), lifted clear of it
    const lift=big?0.45:0.6,Y=[];let dist=[0];
    for(let i=0;i<R.length;i++){const [x,z]=R[i],a=R[Math.max(0,i-1)],b=R[Math.min(R.length-1,i+1)],dx=b[0]-a[0],dz=b[1]-a[1],l=Math.hypot(dx,dz)||1,nx=-dz/l*w*0.5,nz=dx/l*w*0.5;
      Y.push(Math.min(groundH(x,z),groundH(x+nx,z+nz)+0.3,groundH(x-nx,z-nz)+0.3));if(i)dist.push(dist[i-1]+Math.hypot(x-R[i-1][0],z-R[i-1][1]));}
    for(let i=1;i<Y.length;i++)Y[i]=Math.min(Y[i],Y[i-1]+0.4);   // at most a little ponding over a bump of the grid
    km+=dist[dist.length-1]/1000;
    for(let i=0;i+1<R.length;i++){const [x0,z0]=R[i],[x1,z1]=R[i+1],dx=x1-x0,dz=z1-z0,l=Math.hypot(dx,dz)||1,nx=-dz/l*w*0.5,nz=dx/l*w*0.5,
        steep=Math.min(1,Math.max(0,(Y[i]-Y[i+1])/l)*4),t=tileOf(x0,z0,big),base=t.p.length/3,ww=w*(0.9+hash3(i,7,31)*0.2);
      const q=(x,z,y,d,ac)=>{t.p.push(x,y+lift,z);t.a.push(d,ac,steep,ww);t.b.push(glac,s.int?1:0,hash3(i,3,32),0);};
      q(x0+nx,z0+nz,Y[i],dist[i],-1);q(x0-nx,z0-nz,Y[i],dist[i],1);q(x1+nx,z1+nz,Y[i+1],dist[i+1],-1);q(x1-nx,z1-nz,Y[i+1],dist[i+1],1);
      t.idx.push(base,base+2,base+1,base+1,base+2,base+3);}}
  const streamMat=new THREE.MeshPhongMaterial({color:0x1d3a40,specular:0x9fb8c8,shininess:70,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-4});
  G.patchMaterial(streamMat,'mhstreams',sh=>{Object.assign(sh.uniforms,W);
    sh.vertexShader='attribute vec4 aFlow;attribute vec4 aKind;varying vec4 vF;varying vec4 vK;varying vec3 vWhW;\n'+sh.vertexShader.replace('#include <project_vertex>','#include <project_vertex>\nvF=aFlow;vK=aKind;vWhW=(modelMatrix*vec4(transformed,1.0)).xyz;');
    sh.fragmentShader='uniform float uSnowLine,uFresh,uTime,uFlow,uDry;varying vec4 vF;varying vec4 vK;varying vec3 vWhW;\n'+NOISE+sh.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
{// under the snowpack above the snow line
 float sl=uSnowLine+(whNoise(vWhW.xz*0.004)-0.5)*240.0-uFresh*400.0;if(vWhW.y>sl+40.0)discard;
 float d=vF.x,ac=vF.y,steep=vF.z,w=vF.w,glac=vK.x;
 // the bed: the narrow stream shows its stones, an edge of a darker bank
 float edge=smoothstep(0.62,1.0,abs(ac));
 vec3 clear=mix(vec3(0.10,0.22,0.24),vec3(0.24,0.30,0.26),whNoise(vWhW.xz*0.4)*0.6);
 vec3 milky=mix(vec3(0.46,0.52,0.48),vec3(0.56,0.60,0.56),whNoise(vWhW.xz*0.2));
 vec3 c=mix(clear,milky,glac);
 // the flow: streaks moving downstream, faster and whiter where it is steep, more of it in the melt
 float sp=1.6+steep*7.0;float s=whNoise(vec2(ac*w*0.6,d*0.18-uTime*sp*0.18))*0.6+whNoise(vec2(ac*w*1.7,d*0.6-uTime*sp*0.6))*0.4;
 float foam=smoothstep(0.78-steep*0.55-uFlow*0.12,1.0,s)*(0.35+steep)+edge*0.35*(0.3+steep);
 c=mix(c,vec3(0.90,0.94,0.95),clamp(foam,0.0,1.0)*(0.6+0.4*uFlow));
 c=mix(c,vec3(0.30,0.30,0.26),edge*0.45);
 // an intermittent stream in late summer: a bed of dry gravel and boulders
 float dry=vK.y*uDry*step(vK.z,0.85);c=mix(c,mix(vec3(0.50,0.47,0.42),vec3(0.62,0.60,0.55),whNoise(vWhW.xz*0.7)),dry);
 // narrow ribbons fade at their sides, so a 2 m stream on a 12 m grid reads as a line of water, not a strip of paint
 diffuseColor.rgb=c;}`)
      .replace('#include <lights_phong_fragment>','#include <lights_phong_fragment>\nmaterial.specularColor*=1.0-vK.y*uDry*0.9;');});
  const streamMeshes=[];
  for(const t of tiles.values()){if(!t.idx.length)continue;const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(t.p,3));
    g.setAttribute('aFlow',new THREE.Float32BufferAttribute(t.a,4));g.setAttribute('aKind',new THREE.Float32BufferAttribute(t.b,4));g.setIndex(t.idx);g.computeVertexNormals();g.computeBoundingSphere();
    const m=tag(new THREE.Mesh(g,streamMat));m.name='streams';m.userData.wireCat='water';m.receiveShadow=true;scene.add(m);streamMeshes.push({m,t});}

  // ---- the waterfalls ----
  // which way a fall faces: the stream it is on, as OSM draws it downstream; or else straight down the slope
  const segAt=(x,z)=>{let best=null,bd=60;for(const [ax,az,bx,bz] of segs){if(Math.abs(ax-x)>400&&Math.abs(bx-x)>400)continue;const dx=bx-ax,dz=bz-az,L=dx*dx+dz*dz||1,u=Math.max(0,Math.min(1,((x-ax)*dx+(z-az)*dz)/L)),d=Math.hypot(ax+dx*u-x,az+dz*u-z);if(d<bd){bd=d;best=[dx,dz];}}return best;};
  const FP=[],FA=[],FB=[],FI=[],RP=[],RC=[],RI=[],mist=[],pools=[];const falls=[];
  const rockC=[new THREE.Color('#2e2c2a'),new THREE.Color('#3a3632'),new THREE.Color('#26282a')],cc=new THREE.Color();
  for(const f of M.falls||[]){const [lx,lz]=f.at,h=f.h==null?8:f.h,wd=WIDTH[f.n]||[Math.max(1.5,h*0.22),Math.max(2.5,h*0.36)];
    let d=segAt(lx,lz);if(!d){const e=8;d=[-(groundH(lx+e,lz)-groundH(lx-e,lz)),-(groundH(lx,lz+e)-groundH(lx,lz-e))];}
    const dl=Math.hypot(d[0],d[1])||1,dx=d[0]/dl,dz=d[1]/dl,px=-dz,pz=dx;let top=groundH(lx,lz)+0.4;
    // how far out the foot is: the first point downstream the ground has fallen most of the fall's height
    let s=h*0.25;for(let k=1;k<=40;k++){const q=h*0.12*k;if(groundH(lx+dx*q,lz+dz*q)<=top-h*0.9){s=q;break;}s=q;}
    s=Math.max(h*0.12,Math.min(s,h*0.35));   // water falls nearly straight: the headwall below makes up what the ground lacks
    // the survey's ground (10 m, smoothed to the grid) never has the whole cliff: where it has not fallen the fall's height
    // by its foot, the lip is raised on a headwall of basalt, up to six tenths of the height, so the fall is as tall as it is
    const footG=groundH(lx+dx*s,lz+dz*s),lift=Math.max(0,Math.min(h*0.6,footG+h*0.92-top));top+=lift;const bot=Math.max(top-h,footG-0.6);
    if(lift>1){const bw=Math.max(wd[0],wd[1])*1.4+4,bd=lift*1.6+4,bh=top-footG+3,box=new THREE.BoxGeometry(bw,bh,bd,3,3,1).toNonIndexed(),bp=box.attributes.position,
        ry=Math.atan2(-dx,-dz),M4=new THREE.Matrix4().makeRotationY(ry).setPosition(lx-dx*bd*0.5,footG-3+bh/2,lz-dz*bd*0.5),v3=new THREE.Vector3(),rb=RP.length/3;
      for(let k=0;k<bp.count;k++){v3.set(bp.getX(k)*(1+(hash3(k,lx,43)-0.5)*0.12),bp.getY(k),bp.getZ(k)*(1+(hash3(k,lz,44)-0.5)*0.12)).applyMatrix4(M4);RP.push(v3.x,v3.y,v3.z);
        cc.copy(rockC[Math.floor(hash3(Math.floor(k/6),lx,45)*3)]).multiplyScalar(0.75+0.5*hash3(k>>1,lz,46));RC.push(cc.r,cc.g,cc.b);RI.push(rb+k);}}
    // the veil: a grid across and down, bowing out a little as water does over a lip, wider at the foot (Ramona's fan)
    const NU=6,NV=10,b0=FP.length/3,seed=hash3(lx,lz,33);
    for(let j=0;j<=NV;j++)for(let i=0;i<=NU;i++){const v=j/NV,u=i/NU,wd2=wd[0]+(wd[1]-wd[0])*Math.pow(v,0.8),out=s*Math.pow(v,0.7),y=top+(bot-top)*v,a=(u-0.5)*wd2,
        x=lx+dx*out+px*a,z=lz+dz*out+pz*a;FP.push(x,y,z);FA.push(u,v,wd2,top-bot);FB.push(seed,f.ele==null?1200:f.ele,hash3(i,j,34),0);}
    for(let j=0;j<NV;j++)for(let i=0;i<NU;i++){const a=b0+j*(NU+1)+i,b=a+1,c=a+NU+1,e=c+1;FI.push(a,c,b,b,c,e);}
    // the rock face behind: the same shape set back and wider, its basalt in columns
    const r0=RP.length/3,NU2=8;for(let j=0;j<=NV;j++)for(let i=0;i<=NU2;i++){const v=j/NV,u=i/NU2,wd2=(wd[0]+(wd[1]-wd[0])*Math.pow(v,0.8))*1.5+2,out=s*Math.pow(v,0.7)-1.4,y=top+(bot-top)*v-(j===NV?3:0)+0.6*(1-v),a=(u-0.5)*wd2,
        x=lx+dx*out+px*a,z=lz+dz*out+pz*a;RP.push(x,y,z);cc.copy(rockC[(i+Math.floor(hash3(i,j,35)*2))%3]).multiplyScalar(0.8+0.4*hash3(i,lx,36)*(1-0.3*v));RC.push(cc.r,cc.g,cc.b);}
    for(let j=0;j<NV;j++)for(let i=0;i<NU2;i++){const a=r0+j*(NU2+1)+i,b=a+1,c=a+NU2+1,e=c+1;RI.push(a,c,b,b,c,e);}
    // the pool, and its mist
    const fx=lx+dx*s,fz=lz+dz*s,pr=Math.max(2.5,wd[1]*0.6);pools.push([fx+dx*pr*0.4,fz+dz*pr*0.4,bot+0.15,pr]);
    const nm=Math.round(6+Math.min(30,h*0.5)*(wd[1]>10?1.6:1));for(let k=0;k<nm;k++)mist.push([fx,bot,fz,hash3(k,lx,37),wd[1],h]);
    falls.push({n:f.n,x:lx,z:lz,top,bot,h,face:[dx,dz]});}
  // the veils' shader: streaks falling and speeding, the colour of white water; frozen, still columns of blue-white ice
  const veilMat=new THREE.ShaderMaterial({transparent:true,depthWrite:false,side:THREE.DoubleSide,fog:true,
    uniforms:Object.assign(THREE.UniformsUtils.clone(THREE.UniformsLib.fog),W,{uSnowLine:G.U.uSnowLine}),
    vertexShader:`attribute vec4 aV;attribute vec4 aS;varying vec4 vV;varying vec4 vS;varying vec3 vP;
#include <fog_pars_vertex>
void main(){vV=aV;vS=aS;vec4 mvPosition=modelViewMatrix*vec4(position,1.0);vP=position;gl_Position=projectionMatrix*mvPosition;
#include <fog_vertex>
}`,
    fragmentShader:`uniform float uTime,uFlow,uFreeze,uSnowLine;varying vec4 vV;varying vec4 vS;varying vec3 vP;
#include <common>
#include <fog_pars_fragment>
`+NOISE+`void main(){float u=vV.x,v=vV.y,w=vV.z,h=vV.w,seed=vS.x,ele=vS.y;
 // frozen in a hard winter: the cold reaches a fall once the snow has lain a few hundred metres under it
 float frz=uFreeze*(1.0-smoothstep(ele-420.0,ele-120.0,uSnowLine));
 float side=smoothstep(0.0,0.12,u)*smoothstep(1.0,0.88,u);
 float fall=uTime*(5.0+v*9.0);
 float s=whNoise(vec2(u*w*0.9+seed*40.0,v*h*0.22-fall*0.22))*0.55+whNoise(vec2(u*w*2.3,v*h*0.7-fall*0.7))*0.45;
 float a=(0.28+0.62*smoothstep(0.35-uFlow*0.25,0.95,s))*(0.45+0.75*uFlow)*side;
 a*=smoothstep(0.0,0.04,v);
 vec3 c=mix(vec3(0.80,0.86,0.88),vec3(0.97,0.98,0.99),s);
 // ice: columns hanging from the lip, icicles at their feet
 float col=whNoise(vec2(u*w*1.4+seed*9.0,0.5));float reach=0.55+0.45*col;
 float ia=step(v,reach)*(0.55+0.4*whNoise(vec2(u*w*3.0,v*h*0.4)))*smoothstep(0.0,0.1,u)*smoothstep(1.0,0.9,u);
 vec3 ic=mix(vec3(0.62,0.78,0.86),vec3(0.92,0.96,0.98),whNoise(vec2(u*w*2.0,v*h*0.3)));
 c=mix(c,ic,frz);a=mix(a,ia*0.92,frz);
 if(a<0.02)discard;gl_FragColor=vec4(c,a);
#include <fog_fragment>
}`});
  if(FP.length){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(FP,3));g.setAttribute('aV',new THREE.Float32BufferAttribute(FA,4));g.setAttribute('aS',new THREE.Float32BufferAttribute(FB,4));g.setIndex(FI);g.computeBoundingSphere();
    const m=tag(new THREE.Mesh(g,veilMat));m.name='falls';m.renderOrder=2;m.frustumCulled=false;scene.add(m);
    const rg=new THREE.BufferGeometry();rg.setAttribute('position',new THREE.Float32BufferAttribute(RP,3));rg.setAttribute('color',new THREE.Float32BufferAttribute(RC,3));rg.setIndex(RI);rg.computeVertexNormals();
    const rm=new THREE.Mesh(rg,new THREE.MeshLambertMaterial({vertexColors:true,side:THREE.DoubleSide}));rm.name='falls: rock';rm.userData.noFingerprint=true;rm.receiveShadow=true;G.snowOnTop(rm.material,{k:'rock',k2:'0.7'});scene.add(rm);}
  // the pools: discs of the lakes' own water, so they freeze with them
  if(pools.length&&lakeMat){const P2=[],I2=[];for(const [x,z,y,r] of pools){const b=P2.length/3;P2.push(x,y,z);for(let k=0;k<=16;k++){const a=k/16*Math.PI*2;P2.push(x+Math.cos(a)*r*(0.85+hash3(k,x,38)*0.3),y,z+Math.sin(a)*r*(0.85+hash3(k,z,39)*0.3));}for(let k=1;k<=16;k++)I2.push(b,b+k+1,b+k);}
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P2,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(P2.map((v,i)=>i%3===1?1:0),3));g.setIndex(I2);
    const m=tag(new THREE.Mesh(g,lakeMat));m.name='falls: pools';m.userData.wireCat='water';scene.add(m);}

  // ---- mist and steam: soft points that rise and spread, in world units ----
  const soft=(()=>{const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d'),gr=g.createRadialGradient(32,32,0,32,32,32);
    gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(0.4,'rgba(255,255,255,0.45)');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.fillRect(0,0,64,64);return new THREE.CanvasTexture(c);})();
  function puffs(list,o){   // list: [x,y,z,seed,spread,height]
    const P3=new Float32Array(list.length*3),A=new Float32Array(list.length*4);list.forEach(([x,y,z,s,w,h],i)=>{P3.set([x,y,z],i*3);A.set([s,w,h,i],i*4);});
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(P3,3));g.setAttribute('aP',new THREE.BufferAttribute(A,4));g.computeBoundingSphere();
    const U2=Object.assign(THREE.UniformsUtils.clone(THREE.UniformsLib.fog),W,{uMap:{value:soft},uAlpha:{value:1},uCol:{value:new THREE.Color(o.colour||'#ffffff')},uTint:{value:new THREE.Color(o.tint||'#ffffff')}});
    const m=new THREE.Points(g,new THREE.ShaderMaterial({transparent:true,depthWrite:false,fog:true,uniforms:U2,
      vertexShader:`attribute vec4 aP;uniform float uTime,uScale,uFlow,uFreeze;uniform vec2 uWind;varying float vA;varying float vT;
#include <fog_pars_vertex>
void main(){float s=aP.x,w=aP.y,h=aP.z;float ph=fract(uTime*${o.rate}+s*7.31);vT=ph;
 vec3 p=position+vec3((fract(s*13.7)-0.5)*w,0.0,(fract(s*29.3)-0.5)*w);
 p.y+=ph*${o.rise}*h;p.xz+=uWind*ph*${o.drift}*h+vec2(sin(s*40.0+uTime*0.3),cos(s*31.0+uTime*0.25))*ph*w*0.3;
 vA=sin(ph*3.14159)*${o.alpha};
 vec4 mvPosition=modelViewMatrix*vec4(p,1.0);gl_PointSize=clamp((${o.size})*(0.5+ph*1.2)*uScale/max(1.0,-mvPosition.z),1.0,512.0);gl_Position=projectionMatrix*mvPosition;
#include <fog_vertex>
}`,
      fragmentShader:`uniform sampler2D uMap;uniform float uAlpha;uniform vec3 uCol,uTint;varying float vA;varying float vT;
#include <common>
#include <fog_pars_fragment>
void main(){vec4 t=texture2D(uMap,gl_PointCoord);float a=t.a*vA*uAlpha;if(a<0.004)discard;gl_FragColor=vec4(mix(uTint,uCol,smoothstep(0.0,0.35,vT)),a);
#include <fog_fragment>
}`}));
    m.frustumCulled=false;tag(m);m.renderOrder=3;scene.add(m);return m;}
  const mistPts=mist.length?puffs(mist,{rate:'0.09',rise:'0.35',drift:'0.15',alpha:'0.32*uFlow*(1.0-uFreeze*0.85)',size:'2.0+w*0.35+h*0.08'}):null;
  if(mistPts)mistPts.name='falls: mist';
  // the fumaroles: the Devil's Kitchen between Crater Rock and Steel Cliff, Crater Rock's own vents, Hot Rocks
  const FUM=(C.hoodWater&&C.hoodWater.fumaroles)||[[45.3672,-121.6930,14,'The Devil’s Kitchen'],[45.3685,-121.6975,8,'Crater Rock'],[45.3684,-121.6992,6,'Hot Rocks']];
  const fl=[];for(const [la,lo,n] of FUM){const [x,z]=P([la,lo]);for(let k=0;k<n*3;k++){const ox=(hash3(k,la*1e4,40)-0.5)*40,oz=(hash3(k,lo*1e4,41)-0.5)*40;fl.push([x+ox,groundH(x+ox,z+oz)+1,z+oz,hash3(k,n,42),10,60]);}}
  const steam=fl.length?puffs(fl,{rate:'0.035',rise:'1.0',drift:'0.9',alpha:'0.55',size:'6.0+ph*30.0',colour:'#f4f4f2',tint:'#e8e2b8'}):null;
  if(steam)steam.name='fumaroles';

  // ---- the mirror: Hood upside down in Trillium, Mirror Lake and Lost Lake ----
  // (src/atitlan/waves.js's reflected camera, with its plane at the level of the lake nearest the camera: each lake has
  // its own height.) The big meshes (the ground, the fine ground over the mountain, the far Cascades, the sky, the cloud)
  // go on layer 1 and a camera reflected in the lake's plane renders them at a third of the screen every second frame;
  // nothing is rendered when no lake is within 3 km, the camera is high over it, or the lake is frozen.
  const LAKES=[];for(const w of (api.OSM&&api.OSM.water)||[]){if(w.y==null||!w.o||w.o.length<6)continue;let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9;
    for(let i=0;i<w.o.length;i+=2){const x=w.o[i]/10,z=w.o[i+1]/10;x0=Math.min(x0,x);x1=Math.max(x1,x);z0=Math.min(z0,z);z1=Math.max(z1,z);}if((x1-x0)*(z1-z0)<3000)continue;LAKES.push({n:w.n,y:w.y,x0,x1,z0,z1});}
  const renderer=api.renderer;let rt=null,rcam=null,frame=0,scanAt=0,mirror=null;const clip=[new THREE.Plane(new THREE.Vector3(0,1,0),0)],TM=new THREE.Matrix4().set(0.5,0,0,0.5,0,0.5,0,0.5,0,0,0.5,0.5,0,0,0,1);
  const fwd=new THREE.Vector3(),up=new THREE.Vector3(),tgt=new THREE.Vector3(),bs=new THREE.Vector2();
  const scan=()=>{scene.traverse(m=>{if(m.isLight)m.layers.enable(1);});
    // only what is known to be big and drawable from below: the ground, the fine ground, the far Cascades, the sky and the far ring
    scene.traverse(m=>{if(!m.isMesh||(m.layers.mask&2))return;const g=m.geometry;
      if(m.isInstancedMesh){if(m.userData.wireCat==='trees')m.layers.enable(1);return;}   // the forest on the shore (ground.js's tiles), so the far bank stands in the water
      if(m.name==='terrain'||/^fine:/.test(m.name)||m.name==='backdrop'||(m.material&&m.material.isShaderMaterial&&g.type==='SphereGeometry')||g.type==='RingGeometry')m.layers.enable(1);});};
  if(lakeMat&&renderer&&LAKES.length&&!/(^|&)nomirror/.test(api.HASH0||'')){rcam=new THREE.PerspectiveCamera();rcam.layers.set(1);
    animHooks.push(now=>{const p=camera.position;
      // the nearest lake, by the distance to its box, and how frozen it is
      let best=null,bd=3000;for(const L of LAKES){const dx=Math.max(L.x0-p.x,0,p.x-L.x1),dz=Math.max(L.z0-p.z,0,p.z-L.z1),d=Math.hypot(dx,dz);if(d<bd){bd=d;best=L;}}
      const ice=best&&S?S.iceAt(best.y):0;
      if(!best||p.y<best.y+0.3||p.y-best.y>1600||ice>0.97){W.uRK.value=0;mirror=null;return;}
      mirror=best;W.uMirY.value=best.y;W.uRK.value=1;clip[0].constant=-best.y;
      if(now>scanAt){scanAt=now+2500;scan();}if((frame++%2)!==0)return;
      renderer.getDrawingBufferSize(bs);const w=Math.max(64,Math.round(bs.x*0.36)),h=Math.max(64,Math.round(bs.y*0.36));
      if(!rt||rt.width!==w||rt.height!==h){if(rt)rt.dispose();rt=new THREE.WebGLRenderTarget(w,h,{minFilter:THREE.LinearFilter,magFilter:THREE.LinearFilter});W.uRefl.value=rt.texture;}
      const WY=best.y;camera.updateMatrixWorld();camera.getWorldDirection(fwd);up.set(0,1,0).applyQuaternion(camera.quaternion);
      rcam.position.set(p.x,2*WY-p.y,p.z);tgt.copy(p).add(fwd);tgt.y=2*WY-tgt.y;rcam.up.set(up.x,-up.y,up.z);rcam.lookAt(tgt);
      rcam.fov=camera.fov;rcam.aspect=camera.aspect;rcam.near=camera.near;rcam.far=camera.far;rcam.updateProjectionMatrix();rcam.updateMatrixWorld();
      W.uRM.value.copy(TM).multiply(rcam.projectionMatrix).multiply(rcam.matrixWorldInverse);
      const oldRT=renderer.getRenderTarget(),oldClip=renderer.clippingPlanes,oldSh=renderer.shadowMap.autoUpdate;
      renderer.shadowMap.autoUpdate=false;renderer.clippingPlanes=clip;renderer.setRenderTarget(rt);renderer.clear();renderer.render(scene,rcam);
      renderer.setRenderTarget(oldRT);renderer.clippingPlanes=oldClip;renderer.shadowMap.autoUpdate=oldSh;});}

  // ---- the clock: the season's water ----
  let last=performance.now(),t=0;const sz=new THREE.Vector2();
  animHooks.push(now=>{const dt=Math.min(0.1,(now-last)/1000);last=now;t+=dt;W.uTime.value=t;
    const d=S?S.doy:200;
    // the melt: low through the winter, highest in June, thin by September, the autumn rains bring some back
    W.uFlow.value=Math.min(1,0.3+0.7*bump(105,150,185,250,d)+0.18*bump(285,310,345,365,d));
    W.uIceWin.value=d>=340||d<=105?1:d>310&&d<340?sm(310,340,d):sm(125,105,d);
    W.uFreeze.value=d>=345||d<=50?1:d>320&&d<345?sm(320,345,d):sm(75,50,d);
    W.uDry.value=bump(205,235,285,305,d);
    const wd=api.ctx.weather,wv=wd?wd.wind:0.2;W.uWind.value.set(0.9,0.25).multiplyScalar(0.3+wv*1.6);W.uWindK.value=Math.min(1,wv+(wd?wd.rain*0.6:0));
    if(api.renderer){api.renderer.getSize(sz);W.uScale.value=sz.y*0.5*camera.projectionMatrix.elements[5]*(api.renderer.getPixelRatio?api.renderer.getPixelRatio():1);}
    // steam shows best in cold air: winter, and the early morning
    if(steam){const h=api.hour?api.hour():12,cold=0.35+0.4*(1-sm(150,200,d)*(1-sm(250,290,d)))+0.3*(1-sm(7,11,h))+0.2*sm(18,21,h);steam.material.uniforms.uAlpha.value=Math.min(1,cold);}
    // only the streams within reach: the rivers to 16 km, the streams to 5 (and none from high above)
    const p=camera.position,hh=p.y-groundH(p.x,p.z);
    for(const {m,t:T} of streamMeshes){const dd=Math.hypot(T.cx-p.x,T.cz-p.z)-TS*0.7;m.visible=T.big?dd<16000:(dd<5000&&hh<4500);}
    api.ctx.details.water={streamsKm:Math.round(km),falls:falls.length,lakes:!!lakeMat,flow:+W.uFlow.value.toFixed(2),ice:+W.uIceWin.value.toFixed(2),mirror:mirror?mirror.n||'a lake':null};});
  api.ctx.water={get flow(){return W.uFlow.value;},get freeze(){return W.uFreeze.value;},falls,uniforms:W};
  api.ctx.details=Object.assign(api.ctx.details||{},{water:{streamsKm:Math.round(km),falls:falls.length,lakes:!!lakeMat}});
  api.ctx.details.fallsAt=falls.filter(f=>/^(Ramona|Tamanawas|Yocum|Umbrella|Sahalie|Little Zigzag) Falls$/.test(f.n)).map(f=>[f.n,Math.round(f.x),Math.round(f.top),Math.round(f.z),Math.round(f.bot),+f.face[0].toFixed(2),+f.face[1].toFixed(2)]);
}
