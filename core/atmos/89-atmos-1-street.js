// ================================================================= ATMOS — street furniture: lamp posts, lamp rows, banners, planters, fountains
// All positions are world metres; y defaults to the host's ground. Returns what a host may want to register.
(function(){const A=ATMOS;
 const iron=()=>A.lam(0x2e2a26,.6),wood=()=>A.lam(0x4a3a2a,.9),stone=()=>A.lam(0xcdb48a,.95);
 const headMat=()=>A.mat('lampHead',()=>{const m=new A.T.MeshBasicMaterial({color:0xffe0a0});const day=new A.T.Color(0x6a6458),lit=new A.T.Color(0xffe0a0);
  A.hook(()=>{m.color.copy(day).lerp(lit,A.U.night.value);});return m;});
 // a boulevard lamp: iron pole, a short arm, a lamp head that glows from its hour on to its hour off
 A.lamp=(x,z,o)=>{o=o||{};const y=o.y!=null?o.y:A.ground(x,z)-.2,h=o.h||6.2,hd=o.heading||0;A.set('lampPole','post',iron());A.set('lampHead','box',headMat());A.set('lampArm','box',iron());
  A.put('lampPole',[x,y,z,.13,h,.13,0]);const ax=x+Math.sin(hd)*.55,az=z+Math.cos(hd)*.55;A.put('lampArm',[(x+ax)/2,y+h-.1,(z+az)/2,.08,.08,1.1,hd]);
  A.put('lampHead',[ax,y+h-.45,az,.55,.5,.55,hd]);const on=o.on!=null?o.on:17.6,off=o.off!=null?o.off:29.6;A.lampGlow.push(A.glow.length);A.glowAdd(ax,y+h-.5,az,[1,.85,.45],o.glow||6,on,off);
  A.lamps.push([ax,y+h-.45,az,on,off]);return[ax,y+h-.45,az];};   // A.lamps: every lamp head and its hours (moths use them); A.lampGlow: its halo's index in A.glow
 // lamps both sides of a polyline every `step` m, `off` m out from its centre line; ok(x,z) vetoes a spot.
 // The evening runs down the row: the far end (fraction 1) lights `spread` hours after the near end.
 A.lampRow=(pts,o)=>{o=o||{};const step=o.step||16,off=o.off||9.5,spread=o.spread==null?.5:o.spread;let L=0;const seg=[];for(let i=0;i<pts.length-1;i++){const l=Math.hypot(pts[i+1][0]-pts[i][0],pts[i+1][1]-pts[i][1]);seg.push(l);L+=l;}
  const out=[];let acc=0;for(let i=0;i<pts.length-1;i++){const a=pts[i],b=pts[i+1],l=seg[i];if(l<1){continue;}const ux=(b[0]-a[0])/l,uz=(b[1]-a[1])/l;
   for(let s=Math.ceil((acc-step/2)/step)*step+step/2-acc;s<l;s+=step){if(s<0)continue;const f=(acc+s)/Math.max(1,L);for(const sd of(o.sides||[-1,1])){const x=a[0]+ux*s-uz*off*sd,z=a[1]+uz*s+ux*off*sd;if(o.ok&&!o.ok(x,z))continue;
     A.lamp(x,z,{heading:Math.atan2(uz*sd,-ux*sd),on:(o.on||17.55)+spread*f+(sd>0?.02:0),off:(o.off2||29.55)+spread*(1-f)});out.push([x,z,sd,f,ux,uz]);}}acc+=l;}return out;};
 // a planter: timber box and a mound of leaves
 A.planter=(x,z,ry,o)=>{o=o||{};const y=A.ground(x,z)-.1;A.set('planter','box',A.lam(0x8a6a3a,.9));A.set('planterLeaf','ball',A.lam(0x4f8a3e,.9));
  A.put('planter',[x,y+.6,z,o.w||2.2,1.2,o.d||1.2,ry]);A.put('planterLeaf',[x,y+1.25,z,(o.w||2.2)*.48,.5,(o.d||1.2)*.48,ry]);};
 // the FLAG cloth: a box subdivided down and across, its lower part pushed downwind (the wind across the flag's face, with
 // the gust at its pole) and rippling; the top stays on its crossbar. One material for every banner.
 const flagGeo=()=>A.geo('flag')||(A.geoPut('flag',new A.T.BoxGeometry(1,1,1,1,12,6)));
 const flagMat=()=>A.mat('flag',()=>{const m=new A.T.MeshStandardMaterial({color:0xffffff,roughness:.95,metalness:0});
  m.onBeforeCompile=sh=>{sh.uniforms.time=A.U.time;sh.uniforms.wind=A.U.wind;sh.uniforms.gustAmp=A.U.gustAmp;
   sh.vertexShader='uniform float time;uniform vec2 wind;uniform float gustAmp;\n'+A.GLSL_WIND+'\n'+sh.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>
   #ifdef USE_INSTANCING
   vec3 fN=normalize((instanceMatrix*vec4(1.0,0.0,0.0,0.0)).xyz);vec3 fP=(instanceMatrix*vec4(0.0,0.0,0.0,1.0)).xyz;float fS=max(length(instanceMatrix[0].xyz),1e-3);
   vec2 fw=atmWind(time,fP.xz,wind,gustAmp);float hf=clamp(0.5-position.y,0.0,1.0);float sway=clamp(dot(fw,fN.xz)*0.55,-1.7,1.7);
   float rip=sin(time*(2.2+0.5*length(fw))+position.z*4.5+position.y*6.0+fP.x*0.37)*(0.12+0.1*length(fw));
   transformed.x+=hf*sqrt(hf)*(sway+rip)/fS;
   #endif`);};m.customProgramCacheKey=()=>'atmos-flag';return m;});
 // a banner: an 11 m pole, a cloth flag hung square across the bearing `ry` (radians, x toward z: the flag faces along it), a cap
 A.banner=(x,z,ry,hex,o)=>{o=o||{};const y=A.ground(x,z)-.2,h=o.h||11;A.set('bannerPole','post',wood());A.set('bannerFlag',flagGeo(),flagMat());A.set('bannerCap','box',A.lam(0xc8a868,.8));
  A.rec('banner',{at:[x,y,z],bearing:ry,h,color:typeof hex==='number'?'#'+new A.T.Color(hex).getHexString():hex,cloth:[2.2,h*.6],note:'cloth hangs from a crossbar; it swings downwind and ripples (flag shader)'});
  A.put('bannerPole',[x,y,z,.22,h,.22,0]);A.put('bannerFlag',[x,y+h*.32+3.2,z,.2,h*.6,2.2,-ry,hex]);A.put('bannerCap',[x,y+h-.35,z,.45,.45,2.8,-ry]);};
 // a fountain: stone basin, rippling water, a fluted column, a top bowl, a lit spout
 A.fountain=(x,z,o)=>{o=o||{};const r=o.r||4,y=(o.y!=null?o.y:A.ground(x,z))-.15;A.set('fountainStone','post16',stone());
  const water=A.mat('fountainWater',()=>{const m=new A.T.MeshStandardMaterial({color:0x4aa8d8,roughness:.08,metalness:.1,transparent:true,opacity:.82});
   A.hook(t=>{m.emissive.setRGB(.05,.12+.04*Math.sin(t*2.3),.2);});return m;});A.set('fountainWater','post16',water);
  A.put('fountainStone',[x,y,z,r,1.1,r,0]);A.put('fountainStone',[x,y+1.05,z,r+.25,.2,r+.25,0]);A.put('fountainWater',[x,y+1.0,z,r-.4,.14,r-.4,0]);
  A.put('fountainStone',[x,y+1,z,r*.14,3.2,r*.14,0]);A.put('fountainStone',[x,y+4.1,z,r*.34,.35,r*.34,0]);A.put('fountainWater',[x,y+4.35,z,r*.3,.08,r*.3,0]);
  A.set('fountainJet','cone',A.mat('fountainJet',()=>new A.T.MeshBasicMaterial({color:0xcfeeff,transparent:true,opacity:.55,depthWrite:false})));A.put('fountainJet',[x,y+4.3,z,.25,1.4,.25,0]);
  A.glowAdd(x,y+4.9,z,[.6,.85,1],4,-1,30);A.rec('fountain',{at:[x,y,z],r,spout:[x,y+4.3,z],basinY:y+1.07});return{x,y,z,r:r+.4,h:5.8};};
})();
