// The Olympic Peninsula's landmarks, on the shared landmark kit (src/core/landkit.js), each placed from its entry in
// olympic.json (written by tools/make-olympic.py and tools/olympic_places.py). Nothing else on the site uses them.
//
//   lodge           a national-park lodge of the 1910s and 20s: shingled, gabled, a long porch, stone chimneys
//                   (Lake Crescent, Lake Quinault, Kalaloch, Sol Duc); wings: how many, small: a cabin-sized one
//   visitorcenter   Hurricane Ridge's lodge and the Hoh's: a low timber hall under a broad roof, a deck
//   lighthouse      a white tower and its black or red lantern, the keeper's house beside it (house: 1), and the
//                   beam turning at night
//   floatingbridge  the Hood Canal Bridge: a deck on a line of concrete pontoons across the water, the draw span's
//                   towers in the middle
//   chalet          the Enchanted Valley Chalet, 1930: three storeys of logs in a meadow under the cliffs
//   rootstree       the Tree of Life at Kalaloch: a spruce standing across a gap in the bluff on its bare roots
//   bigtree         the Quinault Big Spruce: the largest Sitka spruce in the world, at its height and girth
//   seaarch         Hole-in-the-Wall: a headland of dark rock with the sea through it
//   waterfall       a fall or a cascade, its sheet streaming, its foam (drop, width, cascade)
//
// Map data (c) OpenStreetMap contributors, ODbL. The geometry here is this project's own.
import {landkit} from '../core/landkit.js';

export function landmarks(api){
  const {THREE,animHooks,gh,nightF,hour,group,WATERWAYS}=api;
  const {Model,turn}=landkit(api,{shingle:0x6a5a48,shingleDark:0x4e4236,cedar:0x8a6a4a,trim:0xe8e2d4,greenTrim:0x3a5a3e,stone:0x7a766e,roofGrey:0x4a4e52,roofGreen:0x3e5a46,
    glassDark:0x2a3440,white:0xf4f2ec,lanternBlack:0x2a2a2a,lanternRed:0xa8302a,concrete:0xa8a8a2,steel:0x6a7076,asphalt:0x3e3f43,log:0x7a5a3a,logDark:0x5a422c,
    bark:0x5a4636,moss:0x5a6a3a,needles:0x2a4a2e,rock:0x4a4640,rockDark:0x34302c,water:0x4a7a80});
  const lightNow=()=>0.3+0.7*(1-nightF(hour()));
  const roof=(M,k,x,y,z,w,d,h,ry=0)=>{const s=new THREE.Shape();s.moveTo(-d/2,0);s.lineTo(d/2,0);s.lineTo(0,h);s.closePath();M.put(k,new THREE.ExtrudeGeometry(s,{depth:w,bevelEnabled:false}).translate(0,0,-w/2).rotateY(Math.PI/2),x,y,z,ry);};
  // a shingled block with its gable roof and windows along both long sides
  function block(M,x,z,w,d,h,rh,k='shingle',rk='roofGreen'){M.box(k,x,0,z,w,h,d);roof(M,rk,x,h,z,w+1,d+1.4,rh);
    for(const s of [-1,1])for(let u=-w/2+2;u<w/2-1;u+=3){for(let y=1.2;y<h-1;y+=3.2)M.box('glassDark',x+u,y,z+s*(d/2+0.05),1.2,1.6,0.1);M.box('trim',x+u,1.0,z+s*(d/2+0.08),1.5,0.12,0.12);}}

  return {

  // ================================================================ a park lodge
  lodge(L,x,z){const g0=gh(x,z),M=Model(),S=L.small?0.6:1,W=34*S,D=12*S,H=(L.small?4:8)*1,RH=6*S;
    block(M,0,0,W,D,H,RH);
    // the porch along the front, on posts, and the stone chimneys at the gables
    M.box('cedar',0,0,D/2+2.2,W*0.8,0.3,4.2);for(let u=-W*0.4;u<=W*0.4;u+=3)M.box('log',u,0,D/2+4,0.35,3.2,0.35);M.box('roofGreen',0,3.2,D/2+2.4,W*0.82,0.25,4.8);
    for(const s of [-1,1])M.box('stone',s*(W/2+0.8),0,0,1.8,H+RH+1.5,2.2);
    for(let k=0;k<(L.wings||0);k++){const s=k?-1:1;block(M,s*(W/2+6*S),-D*0.9,12*S,18*S,H*0.8,RH*0.8);}
    // a dormer row on the main roof
    for(let u=-W/2+4;u<W/2-3;u+=5){M.box('shingle',u,H+0.4,D/4,2,1.8,2);roof(M,'roofGreen',u,H+2.2,D/4,2.4,2.6,1.1,Math.PI/2);M.box('glassDark',u,H+0.8,D/4+1.02,1,1,0.08);}
    return M.finish(L,x,g0,z,L.turn||0);},

  // ================================================================ a visitor center
  visitorcenter(L,x,z){const g0=gh(x,z),M=Model(),S=L.small?0.6:1,W=46*S,D=20*S,H=6*S;
    M.box('cedar',0,0,0,W,H,D);M.box('stone',0,0,0,W+0.6,1.4,D+0.6);
    // the broad low roof, its eaves well out, and a tall glazed gable to the view
    roof(M,'roofGrey',0,H,0,W+3,D+5,6*S);M.box('glassDark',0,1.4,D/2+0.06,W*0.4,H-1.4,0.1);
    {const s=new THREE.Shape();s.moveTo(-D*0.35,0);s.lineTo(D*0.35,0);s.lineTo(0,5*S);s.closePath();M.put('glassDark',new THREE.ShapeGeometry(s),0,H,D/2+2.4);}
    M.box('cedar',0,0,D/2+5,W*0.7,0.4,8);for(let u=-W*0.33;u<=W*0.33;u+=4)M.box('log',u,0.4,D/2+8.8,0.15,1.1,0.15);M.box('cedar',0,1.5,D/2+8.8,W*0.7,0.12,0.15);   // the deck and its rail
    return M.finish(L,x,g0,z,L.turn||0);},

  // ================================================================ a lighthouse
  lighthouse(L,x,z){const g0=Math.max(0,gh(x,z)),M=Model(),H=L.height||18,top=L.top==='#a8302a'?'lanternRed':'lanternBlack';
    M.cyl('white',0,0,0,2.6,1.8,H,14);M.cyl(top,0,H,0,2.2,2.2,0.4,14);M.cyl('glassDark',0,H+0.4,0,1.5,1.5,2.4,10);M.put(top,new THREE.ConeGeometry(1.8,1.6,10).translate(0,0.8,0),0,H+2.8,0);
    M.cyl(top,0,H+4.4,0,0.12,0.12,1.2,6);for(let i=0;i<10;i++){const a=i/10*Math.PI*2;M.box(top,Math.cos(a)*2.1,H+0.4,Math.sin(a)*2.1,0.08,1.0,0.08);}
    if(L.house){M.box('white',8,0,0,9,5,7);roof(M,'lanternRed',8,5,0,9.6,7.8,2.6);}
    const g=M.finish(L,x,g0,z,0);
    // the beam: two long cones from the lantern, turning, lit after dark
    const bm=new THREE.MeshBasicMaterial({color:0xfff2c0,transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide});
    const beam=new THREE.Group();for(const s of [0,Math.PI]){const c=new THREE.Mesh(new THREE.ConeGeometry(60,2400,16,1,true).translate(0,-1200,0).rotateZ(Math.PI/2),bm);c.rotation.y=s;beam.add(c);}
    beam.position.set(x,g0+H+1.6,z);beam.userData.noWire=true;beam.traverse(o=>{o.userData.noFingerprint=true;});api.scene.add(beam);
    const glow=new THREE.PointLight(0xfff0c0,0,600,1.5);glow.position.copy(beam.position);api.scene.add(glow);
    animHooks.push(now=>{const n=nightF(hour());beam.rotation.y=now*0.0006;bm.opacity=0.16*n;glow.intensity=1.6*n;});
    return g;},

  // ================================================================ the Hood Canal Bridge
  floatingbridge(L,x,z){const M=Model(),LEN=L.length||2400,N=Math.round(LEN/110);
    // the pontoons: concrete hulls end to end, the deck on columns over them, the draw span's towers at the middle
    for(let i=0;i<N;i++){const u=-LEN/2+(i+0.5)*LEN/N;M.box('concrete',u,-2,0,LEN/N-1.5,3.6,18);
      for(const s of [-1,1])M.box('concrete',u,1.6,s*5,1.4,4,1.4);}
    M.box('asphalt',0,5.6,0,LEN,0.6,12);M.box('concrete',0,5.2,0,LEN,0.4,13);for(const s of [-1,1])M.box('concrete',0,6.2,s*6.2,LEN,0.8,0.3);
    for(const s of [-1,1]){M.box('steel',s*90,6,0,4,26,4);M.box('steel',s*90,30,0,6,3,16);}
    // the approach spans down to each shore
    for(const s of [-1,1])for(let k=0;k<6;k++){const u=s*(LEN/2+k*45+22);M.box('concrete',u,-4,0,3,10+k*2,3);M.box('asphalt',u,5.6+k*2,0,46,0.6,12);}
    return M.finish(L,x,0,z,L.turn||0);},

  // ================================================================ the Enchanted Valley Chalet
  chalet(L,x,z){const g0=gh(x,z),M=Model(),W=18,D=10,H=9;
    M.box('log',0,0,0,W,H,D);for(let y=0.4;y<H;y+=0.55)for(const s of [-1,1])M.box('logDark',0,y,s*(D/2+0.05),W+0.6,0.12,0.12);   // the courses
    roof(M,'shingleDark',0,H,0,W+1.6,D+2.4,5);M.box('logDark',0,H,0,W*0.25,3,D*0.3);
    for(const s of [-1,1])for(let u=-W/2+2;u<W/2;u+=3.5)for(const y of [1.2,4.4])M.box('glassDark',u,y,s*(D/2+0.12),1,1.4,0.08);
    M.box('log',0,0,D/2+1.8,W*0.7,0.3,3.6);return M.finish(L,x,g0,z,L.turn||0);},

  // ================================================================ the Tree of Life
  rootstree(L,x,z){const g0=gh(x,z),M=Model(),H=32;
    // the gap the creek cut, and the tree over it on its roots, splayed to the banks either side
    M.box('rockDark',0,-6,0,8,6,4);M.cyl('bark',0,2.5,0,0.9,1.2,H-2,9);M.put('needles',new THREE.ConeGeometry(5,H*0.6,8).translate(0,H*0.3,0),0,H*0.45,0);
    for(let i=0;i<9;i++){const a=i/9*Math.PI*2,len=4+((i*37)%5);M.put('bark',new THREE.CylinderGeometry(0.18,0.35,len,6).translate(0,-len/2,0),Math.cos(a)*0.8,2.8,Math.sin(a)*0.8,a,0,0.6+((i*13)%4)*0.12);}
    return M.finish(L,x,g0,z,0);},

  // ================================================================ the Quinault Big Spruce
  bigtree(L,x,z){const g0=gh(x,z),M=Model(),H=L.height||58,R0=(L.girth||5.9)/2;
    M.cyl('bark',0,0,0,R0*1.35,R0*0.55,H*0.65,12);M.cyl('moss',0,0,0,R0*1.42,R0*1.2,2.5,12);   // the buttressed foot, mossed
    for(let k=0;k<5;k++){const y=H*(0.45+k*0.1),r=(1-k*0.17)*9;M.put('needles',new THREE.ConeGeometry(r,H*0.18,9).translate(0,H*0.09,0),((k*7)%3-1)*0.6,y,((k*5)%3-1)*0.6);}
    M.box('cedar',0,0,R0*1.6+3,8,0.8,2.5);   // the sign
    return M.finish(L,x,g0,z,0);},

  // ================================================================ Hole-in-the-Wall
  seaarch(L,x,z){const M=Model();
    // two buttresses of dark rock and the lintel over the gap, the headland running inland behind
    for(const s of [-1,1])M.put('rock',new THREE.DodecahedronGeometry(1,0),s*16,6,0,s*0.4,0,0,[9,13,14]);
    M.put('rock',new THREE.DodecahedronGeometry(1,0),0,20,0,0.2,0,0,[26,7,13]);M.put('needles',new THREE.ConeGeometry(4,10,6).translate(0,5,0),-6,25,2);M.put('needles',new THREE.ConeGeometry(3,8,6).translate(0,4,0),7,24,-1);
    M.put('rock',new THREE.DodecahedronGeometry(1,0),0,4,-30,0.1,0,0,[22,14,30]);
    return M.finish(L,x,-2,z,L.turn||0);},

  // ================================================================ a waterfall
  waterfall(L,x,z){
    let dir=null,bestD=400;
    for(const w of WATERWAYS){const p=w.pts;for(let i=0;i+1<p.length;i++){const ax=p[i][0],az=p[i][1],bx=p[i+1][0],bz=p[i+1][1],ddx=bx-ax,ddz=bz-az,l2=ddx*ddx+ddz*ddz;if(!l2)continue;
      const t=Math.max(0,Math.min(1,((x-ax)*ddx+(z-az)*ddz)/l2)),d=Math.hypot(x-ax-t*ddx,z-az-t*ddz);if(d<bestD){bestD=d;const l=Math.sqrt(l2);dir=[ddx/l,ddz/l];}}}
    if(!dir)dir=[Math.cos(L.turn||0),Math.sin(L.turn||0)];
    const DROP=L.drop||20,Wd=L.width||8,CAS=!!L.cascade,[dx,dz]=dir,px=-dz,pz=dx;
    const top=Math.max(gh(x,z),gh(x-dx*30,z-dz*30)),rows=14,cols=5,pos=[],uv=[],idx=[];
    for(let r=0;r<=rows;r++){const v=r/rows,fwd=CAS?DROP*1.1*v:DROP*0.14*Math.sqrt(v)+2*v,y=top-DROP*v;
      for(let c=0;c<=cols;c++){const u=c/cols-0.5,w=Wd*(1+0.25*v);pos.push(x+dx*fwd+px*u*w,y,z+dz*fwd+pz*u*w);uv.push(c/cols,v);}}
    for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){const a=r*(cols+1)+c;idx.push(a,a+cols+1,a+1,a+1,a+cols+1,a+cols+2);}
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();
    const m=new THREE.ShaderMaterial({transparent:true,side:THREE.DoubleSide,depthWrite:false,fog:true,
      uniforms:Object.assign({uTime:{value:0},uLight:{value:1},uLen:{value:DROP/Wd}},THREE.UniformsLib.fog),
      vertexShader:`varying vec2 vUv;
#include <fog_pars_vertex>
void main(){vUv=uv;vec4 mvPosition=modelViewMatrix*vec4(position,1.0);gl_Position=projectionMatrix*mvPosition;
#include <fog_vertex>
}`,
      fragmentShader:`uniform float uTime;uniform float uLight;uniform float uLen;varying vec2 vUv;
#include <fog_pars_fragment>
float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}
void main(){float s=n(vec2(vUv.x*22.0,vUv.y*uLen*3.0-uTime*(2.5+vUv.y*3.0)))*0.6+n(vec2(vUv.x*60.0,vUv.y*uLen*8.0-uTime*6.0))*0.4;
 float edge=smoothstep(0.0,0.14,vUv.x)*smoothstep(1.0,0.86,vUv.x);
 vec3 c=mix(vec3(0.72,0.82,0.80),vec3(0.98,0.99,1.0),smoothstep(0.35,0.75,s));
 gl_FragColor=vec4(c*uLight,edge*mix(0.75,0.95,s)*(0.55+0.45*(1.0-vUv.y*0.5)));
#include <fog_fragment>
}`});
    const sheet=new THREE.Mesh(g,m);sheet.userData.noShadow=true;
    const fwdEnd=CAS?DROP*1.1:DROP*0.14+2,bx=x+dx*fwdEnd,bz=z+dz*fwdEnd,by=top-DROP;
    const foam=new THREE.Mesh(new THREE.CircleGeometry(1,24).rotateX(-Math.PI/2),new THREE.MeshLambertMaterial({color:0xf2f6f6,transparent:true,opacity:0.8,depthWrite:false}));
    foam.scale.set(Wd*0.9,1,Wd*0.6);foam.rotation.y=-Math.atan2(dz,dx);foam.position.set(bx+dx*Wd*0.3,Math.max(by,gh(bx,bz))+0.4,bz+dz*Wd*0.3);
    animHooks.push(now=>{m.uniforms.uTime.value=now/1000;m.uniforms.uLight.value=lightNow();foam.material.opacity=0.65+0.2*Math.sin(now*0.004);});
    return group(L,[sheet,foam]);},
  };
}
