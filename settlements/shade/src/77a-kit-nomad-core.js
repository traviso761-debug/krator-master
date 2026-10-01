// ================================================================= EASTERN NOMAD KIT — core (geometry collector, materials)
// Host-free: THREE and the DOM only. build.py fails the build if a 77 fragment
// names one of the host's layout globals (its FORBID list), and none reads
// terrainH or scene. Every builder returns a THREE.Group, base at y = 0, front
// facing +z; a wall-backed piece has its back plane at z = 0.
//
// The collector keeps one triangle soup per material, with a vertex colour per
// part (a tint, darkened toward the ground) and planar UVs in metres chosen per
// triangle by its normal, so every texture tiles in world units whatever the
// part's size. The host merges all buildings per material (87b): a dozen draw
// calls for the whole settlement.
var NOMAD=(function(){
const TAU=Math.PI*2;
const clamp=(v,a,b)=>v<a?a:v>b?b:v,mix=(a,b,t)=>a+(b-a)*t,smooth=(a,b,x)=>{const t=clamp((x-a)/(b-a),0,1);return t*t*(3-2*t);};
// the kit's own random stream (a builder never draws from the host's or the biome's)
function rngOf(seed){let s=(seed>>>0)||1;return function(){s|=0;s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
// ---------------------------------------------------------------- textures (canvas, grey or neutral so the tint carries the colour)
function canvasTex(w,h,fn){const c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d');fn(g,w,h);
 const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=4;t.encoding=THREE.sRGBEncoding;return t;}
function noiseFill(g,w,h,base,amp,r){const id=g.getImageData(0,0,w,h),d=id.data;for(let i=0;i<d.length;i+=4){const n=(r()-.5)*amp;d[i]=clamp(base[0]+n,0,255);d[i+1]=clamp(base[1]+n,0,255);d[i+2]=clamp(base[2]+n,0,255);d[i+3]=255;}g.putImageData(id,0,0);}
const R0=rngOf(7731);
// adobe plaster: mottled, hand-smoothed, with straw flecks and the odd crack (2 m tile)
const TEX_ADOBE=canvasTex(256,256,(g,w,h)=>{noiseFill(g,w,h,[226,214,200],18,R0);
 for(let i=0;i<70;i++){g.fillStyle='rgba('+(R0()<.5?'190,170,150':'240,232,222')+','+(.12+R0()*.18).toFixed(2)+')';g.beginPath();g.ellipse(R0()*w,R0()*h,8+R0()*30,6+R0()*20,R0()*3,0,TAU);g.fill();}
 g.strokeStyle='rgba(150,120,90,.5)';for(let i=0;i<260;i++){const x=R0()*w,y=R0()*h,a=R0()*TAU,l=2+R0()*5;g.lineWidth=.6;g.beginPath();g.moveTo(x,y);g.lineTo(x+Math.cos(a)*l,y+Math.sin(a)*l);g.stroke();}
 g.strokeStyle='rgba(120,95,75,.35)';for(let i=0;i<5;i++){let x=R0()*w,y=R0()*h;g.lineWidth=.8;g.beginPath();g.moveTo(x,y);for(let k=0;k<6;k++){x+=(R0()-.5)*18;y+=R0()*14;g.lineTo(x,y);}g.stroke();}});
// carved sandstone: tool marks in diagonal bands (the strata come from the shader, by world height) (2 m tile)
const TEX_CHISEL=canvasTex(256,256,(g,w,h)=>{noiseFill(g,w,h,[214,214,214],22,R0);
 for(let i=0;i<900;i++){const x=R0()*w,y=R0()*h;g.strokeStyle='rgba('+(R0()<.5?'170,170,170':'245,245,245')+',.35)';g.lineWidth=.8+R0();g.beginPath();g.moveTo(x,y);g.lineTo(x+5,y+3);g.stroke();}});
// black goat-hair cloth: woven strips a metre wide, sewn edge to edge (1 m tile across the strips)
const TEX_CLOTH=canvasTex(128,128,(g,w,h)=>{noiseFill(g,w,h,[58,50,44],14,R0);
 for(let y=0;y<h;y+=2){g.fillStyle='rgba(0,0,0,'+(.08+R0()*.1).toFixed(2)+')';g.fillRect(0,y,w,1);}
 g.fillStyle='rgba(120,100,80,.55)';g.fillRect(0,0,w,3);g.fillStyle='rgba(20,16,14,.6)';g.fillRect(0,h/2,w,2);});
// striped canvas for awnings and rugs: the tint picks the dye (1.5 m tile)
const TEX_CANVAS=canvasTex(128,128,(g,w,h)=>{noiseFill(g,w,h,[236,230,220],10,R0);
 for(let x=0;x<w;x+=32){g.fillStyle='rgba(120,60,40,.55)';g.fillRect(x,0,14,h);g.fillStyle='rgba(60,40,30,.35)';g.fillRect(x+18,0,3,h);}});
// timber: grain along v (1 m tile)
const TEX_WOOD=canvasTex(64,256,(g,w,h)=>{noiseFill(g,w,h,[150,120,95],16,R0);
 for(let i=0;i<40;i++){const x=R0()*w;g.strokeStyle='rgba(80,55,35,'+(.2+R0()*.3).toFixed(2)+')';g.lineWidth=.6+R0()*1.2;g.beginPath();g.moveTo(x,0);for(let y=0;y<=h;y+=16)g.lineTo(x+Math.sin(y*.05+i)*2,y);g.stroke();}});
// ---------------------------------------------------------------- materials
// The carved stone takes the cliff's strata (the ground shader's six colours,
// 3.4 m bands by world height): a facade cut from the face shows the same
// bands as the rock round it, which is most of what makes it read as carved.
const STRATA=[0xb8683f,0x8f4f3a,0xd4a884,0xa4523a,0x7a4030,0xc98a5e].map(h=>new THREE.Color(h).convertSRGBToLinear());
// A host that has a strata shader hands it over (NOMAD.useStrata(S), before the
// first frame): S.inject(shader) and strataColor(vSWP, vSWN), as the biome core's
// BIO.strata provides. Without one, plain level bands stand in.
let STRATA_IN=null;
function stoneMat(){const m=new THREE.MeshLambertMaterial({map:TEX_CHISEL,vertexColors:true,side:THREE.DoubleSide});
 m.onBeforeCompile=sh=>{
  if(STRATA_IN){STRATA_IN.inject(sh);sh.fragmentShader=sh.fragmentShader.replace('#include <map_fragment>','#include <map_fragment>\n{vec3 bc=strataColor(vSWP,vSWN);diffuseColor.rgb=bc*(0.55+0.55*diffuseColor.rgb);}');return;}
  sh.uniforms.uBands={value:STRATA};
  sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vKWP;').replace('#include <worldpos_vertex>','#include <worldpos_vertex>\nvKWP=(modelMatrix*vec4(transformed,1.0)).xyz;');
  sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nuniform vec3 uBands[6];varying vec3 vKWP;')
   .replace('#include <map_fragment>','#include <map_fragment>\n{float bb=mod(floor(vKWP.y/3.4),6.0);vec3 bc=uBands[0];if(bb>0.5)bc=uBands[1];if(bb>1.5)bc=uBands[2];if(bb>2.5)bc=uBands[3];if(bb>3.5)bc=uBands[4];if(bb>4.5)bc=uBands[5];'+
   'diffuseColor.rgb=bc*(0.55+0.55*diffuseColor.rgb);}');};
 m.customProgramCacheKey=()=>'nomad-stone'+(STRATA_IN?'-strata':'');return m;}
const lam=(map,extra)=>new THREE.MeshLambertMaterial(Object.assign({map,vertexColors:true,side:THREE.DoubleSide},extra||{}));
const MAT={
 stone:{m:stoneMat(),tile:2},
 adobe:{m:lam(TEX_ADOBE),tile:2},
 cloth:{m:lam(TEX_CLOTH),tile:1},
 canvas:{m:lam(TEX_CANVAS),tile:1.5},
 wood:{m:lam(TEX_WOOD),tile:1},
 dark:{m:new THREE.MeshBasicMaterial({color:0x140e0b,side:THREE.DoubleSide}),tile:1},
};
for(const k in MAT)MAT[k].m.name='nomad:'+k;
// the dyes and washes the tints choose from (sRGB hex)
const DYE={madder:0xb0453a,indigo:0x3a4f7a,saffron:0xd4a040,cream:0xece2cc,olive:0x7a7a48,umber:0x7a5034};
// ---------------------------------------------------------------- the collector
function kit(seed){
 const parts=new Map(),rnd=rngOf(seed||1),T=new THREE.Color(1,1,1);
 const P=k=>{let p=parts.get(k);if(!p){p={pos:[],col:[]};parts.set(k,p);}return p;};
 const tint=(hex,k)=>{if(hex==null)T.setRGB(1,1,1);else T.set(hex).convertSRGBToLinear();if(k!=null)T.multiplyScalar(k);return T;};
 let cur=new THREE.Color(1,1,1);
 function color(hex,k){cur=tint(hex,k).clone();return api;}
 function tri(k,a,b,c){const p=P(k);p.pos.push(a[0],a[1],a[2],b[0],b[1],b[2],c[0],c[1],c[2]);for(let i=0;i<3;i++)p.col.push(cur.r,cur.g,cur.b);}
 function quad(k,a,b,c,d){tri(k,a,b,c);tri(k,a,c,d);}
 const _m=new THREE.Matrix4(),_q=new THREE.Quaternion(),_v=new THREE.Vector3(),_s=new THREE.Vector3(1,1,1),_Y=new THREE.Vector3(0,1,0);
 function geo(k,g,M){const n=g.index?g.toNonIndexed():g;if(M)n.applyMatrix4(M);const a=n.attributes.position;
  for(let i=0;i<a.count;i+=3)tri(k,[a.getX(i),a.getY(i),a.getZ(i)],[a.getX(i+1),a.getY(i+1),a.getZ(i+1)],[a.getX(i+2),a.getY(i+2),a.getZ(i+2)]);n.dispose();if(n!==g)g.dispose();}
 const at=(x,y,z,yaw)=>_m.compose(_v.set(x,y,z),_q.setFromAxisAngle(_Y,yaw||0),_s);
 // a box centred at (x, y, z)
 function box(k,x,y,z,w,h,d,yaw){if(w<=0||h<=0||d<=0)return;geo(k,new THREE.BoxGeometry(w,h,d),at(x,y,z,yaw));}
 // a box standing on y0 (the usual case)
 function block(k,x,y0,z,w,h,d,yaw){box(k,x,y0+h/2,z,w,h,d,yaw);}
 function cyl(k,x,y0,z,rt,rb,h,seg,yaw){if(h<=0)return;geo(k,new THREE.CylinderGeometry(rt,rb,h,seg||10,1,false),at(x,y0+h/2,z,yaw));}
 // a rod from a to b (a no-roll basis: the caller never sees it)
 function beam(k,a,b,r,seg){const A=new THREE.Vector3(...a),B=new THREE.Vector3(...b),D=B.clone().sub(A),l=D.length();if(l<1e-3)return;
  _q.setFromUnitVectors(_Y,D.multiplyScalar(1/l));geo(k,new THREE.CylinderGeometry(r,r,l,seg||5,1,true),_m.compose(A.add(B).multiplyScalar(.5),_q,_s));}
 // a solid of revolution from [[r,y],...] (bottom to top), each ring's radius jittered by `rough`
 function lathe(k,x,y0,z,prof,seg,rough){seg=seg||16;const rings=prof.map(p=>{const r=[];for(let s=0;s<seg;s++)r.push(p[0]*(1+(rough?(rnd()-.5)*rough:0)));return r;});
  for(let i=0;i<prof.length-1;i++)for(let s=0;s<seg;s++){const a0=s/seg*TAU,a1=(s+1)/seg*TAU,r0=rings[i][s],r1=rings[i][(s+1)%seg],q0=rings[i+1][s],q1=rings[i+1][(s+1)%seg],y=prof[i][1]+y0,yy=prof[i+1][1]+y0;
   quad(k,[x+Math.sin(a0)*r0,y,z+Math.cos(a0)*r0],[x+Math.sin(a1)*r1,y,z+Math.cos(a1)*r1],[x+Math.sin(a1)*q1,yy,z+Math.cos(a1)*q1],[x+Math.sin(a0)*q0,yy,z+Math.cos(a0)*q0]);}
  const top=prof[prof.length-1];if(top[0]>0){const yy=top[1]+y0;for(let s=0;s<seg;s++){const a0=s/seg*TAU,a1=(s+1)/seg*TAU,i=prof.length-1;tri(k,[x,yy,z],[x+Math.sin(a1)*rings[i][(s+1)%seg],yy,z+Math.cos(a1)*rings[i][(s+1)%seg]],[x+Math.sin(a0)*rings[i][s],yy,z+Math.cos(a0)*rings[i][s]]);}}}
 // a prism: polygon [[x,z],...] extruded from y0 to y1
 function prism(k,poly,y0,y1){const n=poly.length;for(let i=0;i<n;i++){const a=poly[i],b=poly[(i+1)%n];quad(k,[a[0],y0,a[1]],[b[0],y0,b[1]],[b[0],y1,b[1]],[a[0],y1,a[1]]);}
  for(let i=1;i<n-1;i++){tri(k,[poly[0][0],y1,poly[0][1]],[poly[i][0],y1,poly[i][1]],[poly[i+1][0],y1,poly[i+1][1]]);tri(k,[poly[0][0],y0,poly[0][1]],[poly[i+1][0],y0,poly[i+1][1]],[poly[i][0],y0,poly[i][1]]);}}
 // a profile [[z,y],...] in the zy plane extruded along x from x0 to x1 (pediments, wedges)
 function extrudeX(k,prof,x0,x1){const n=prof.length;for(let i=0;i<n;i++){const a=prof[i],b=prof[(i+1)%n];quad(k,[x0,a[1],a[0]],[x0,b[1],b[0]],[x1,b[1],b[0]],[x1,a[1],a[0]]);}
  for(let i=1;i<n-1;i++){tri(k,[x0,prof[0][1],prof[0][0]],[x0,prof[i][1],prof[i][0]],[x0,prof[i+1][1],prof[i+1][0]]);tri(k,[x1,prof[0][1],prof[0][0]],[x1,prof[i+1][1],prof[i+1][0]],[x1,prof[i][1],prof[i][0]]);}}
 // a triangle prism in the xy plane (a pediment), depth along z from z0 to z1
 function pediment(k,x0,x1,y0,h,z0,z1,apexX){const ax=apexX==null?(x0+x1)/2:apexX,A=[x0,y0],B=[x1,y0],C=[ax,y0+h];
  tri(k,[A[0],A[1],z1],[B[0],B[1],z1],[C[0],C[1],z1]);tri(k,[A[0],A[1],z0],[C[0],C[1],z0],[B[0],B[1],z0]);
  quad(k,[A[0],A[1],z0],[A[0],A[1],z1],[C[0],C[1],z1],[C[0],C[1],z0]);quad(k,[B[0],B[1],z1],[B[0],B[1],z0],[C[0],C[1],z0],[C[0],C[1],z1]);}
 // an arch in the xy plane: voussoirs on a half circle of radius r centred (cx, cy), thickness t, from z0 to z1
 function arch(k,cx,cy,r,t,z0,z1,n,pointed){n=n||9;for(let i=0;i<n;i++){const a0=Math.PI*i/n,a1=Math.PI*(i+1)/n,f=a=>{const c=Math.cos(a),s=Math.sin(a),pk=pointed?.18*r*(1-Math.abs(c)):0;return[[cx+c*r,cy+s*r+pk],[cx+c*(r+t),cy+s*(r+t)+pk]];};
  const [i0,o0]=f(a0),[i1,o1]=f(a1);quad(k,[i0[0],i0[1],z1],[o0[0],o0[1],z1],[o1[0],o1[1],z1],[i1[0],i1[1],z1]);quad(k,[i0[0],i0[1],z0],[i1[0],i1[1],z0],[o1[0],o1[1],z0],[o0[0],o0[1],z0]);
  quad(k,[i0[0],i0[1],z0],[i0[0],i0[1],z1],[i1[0],i1[1],z1],[i1[0],i1[1],z0]);quad(k,[o0[0],o0[1],z0],[o1[0],o1[1],z0],[o1[0],o1[1],z1],[o0[0],o0[1],z1]);}}
 // the finished group: per-material meshes with planar metre UVs, the ground-contact shade in the vertex colour
 function finish(data){const G=new THREE.Group(),a=new THREE.Vector3(),b=new THREE.Vector3(),c=new THREE.Vector3(),n=new THREE.Vector3();
  for(const [k,p] of parts){const M=MAT[k],N=p.pos.length/3,uv=new Float32Array(N*2),col=new Float32Array(p.col);
   for(let i=0;i<N;i+=3){a.fromArray(p.pos,i*3);b.fromArray(p.pos,i*3+3);c.fromArray(p.pos,i*3+6);n.subVectors(b,a).cross(c.clone().sub(a));
    const ax=Math.abs(n.x),ay=Math.abs(n.y),az=Math.abs(n.z);
    for(let j=0;j<3;j++){const v=j===0?a:j===1?b:c,o=(i+j)*2;if(ay>=ax&&ay>=az){uv[o]=v.x/M.tile;uv[o+1]=v.z/M.tile;}else if(ax>=az){uv[o]=v.z/M.tile;uv[o+1]=v.y/M.tile;}else{uv[o]=v.x/M.tile;uv[o+1]=v.y/M.tile;}
     const sh=.72+.28*smooth(0,1.6,v.y);col[(i+j)*3]*=sh;col[(i+j)*3+1]*=sh;col[(i+j)*3+2]*=sh;}}
   const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p.pos,3));g.setAttribute('uv',new THREE.BufferAttribute(uv,2));g.setAttribute('color',new THREE.BufferAttribute(col,3));
   g.computeVertexNormals();g.computeBoundingSphere();const m=new THREE.Mesh(g,M.m);m.userData.nomadMat=k;G.add(m);}
  G.userData=data;return G;}
 const api={tri,quad,box,block,cyl,beam,lathe,prism,extrudeX,pediment,arch,color,finish,rnd};
 return api;}
const rect=(w,d,frontAtOrigin)=>frontAtOrigin?[[-w/2,0],[w/2,0],[w/2,d],[-w/2,d]]:[[-w/2,-d/2],[w/2,-d/2],[w/2,d/2],[-w/2,d/2]];
const circle=(r,n)=>{const p=[];for(let i=0;i<n;i++){const a=i*TAU/n;p.push([Math.sin(a)*r,Math.cos(a)*r]);}return p;};
return{kit,MAT,DYE,rect,circle,rngOf,clamp,mix,smooth,TAU,useStrata:S=>{STRATA_IN=S;}};})();
