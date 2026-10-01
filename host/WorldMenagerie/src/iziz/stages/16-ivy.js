// ---------- ivy: leaf-sheet panels (three variants in one atlas, ragged at the top) and leafy clumps ----------
// vines rooted along the bottom edge, thinning out towards their tips (hanging panels use it upside down)
const ivyTex=(()=>{const cv=document.createElement('canvas');cv.width=768;cv.height=256;const g=cv.getContext('2d');const R=mkRng(4242);
  const leaf=(x,y,sz,a,l)=>{g.save();g.translate(x,y);g.rotate(a);g.fillStyle=`rgb(${l-40},${l},${l-55})`;g.beginPath();
    g.moveTo(0,sz*0.9);g.lineTo(-sz*0.5,sz*0.15);g.lineTo(-sz,-sz*0.3);g.lineTo(-sz*0.35,-sz*0.28);g.lineTo(0,-sz);g.lineTo(sz*0.35,-sz*0.28);g.lineTo(sz,-sz*0.3);g.lineTo(sz*0.5,sz*0.15);g.closePath();g.fill();
    g.strokeStyle='rgba(30,50,25,0.5)';g.lineWidth=0.7;g.beginPath();g.moveTo(0,sz*0.9);g.lineTo(0,-sz*0.7);g.stroke();g.restore();};
  for(let v=0;v<3;v++){const ox=v*256,stems=[];
    for(let k=0;k<6+Math.floor(R()*3);k++){const x0=ox+28+R()*200,top=256*(0.03+0.62*R()),pts=[];let x=x0,y=256,ph=R()*6;
      while(y>top){pts.push([x,y]);y-=6;x=Math.max(ox+16,Math.min(ox+240,x+Math.sin(y*0.05+ph)*2.2+(R()-0.5)*3));}stems.push(pts);}
    g.lineCap='round';
    for(const st of stems){g.strokeStyle='rgba(74,56,38,0.95)';g.lineWidth=2.2;g.beginPath();st.forEach((q,i)=>i?g.lineTo(q[0],q[1]):g.moveTo(q[0],q[1]));g.stroke();
      for(let i=0;i<5;i++){const q=st[Math.floor(R()*st.length)];let x=q[0],y=q[1];g.lineWidth=1.1;g.beginPath();g.moveTo(x,y);for(let j=0;j<5;j++){x+=(R()-0.5)*14;y-=R()*6;g.lineTo(Math.max(ox+10,Math.min(ox+246,x)),y);}g.stroke();}}
    // leaves: a loose clump where each stem roots, then thinning out towards its tip
    for(const st of stems){const x0=st[0][0];
      for(let i=0;i<46;i++){const r=28*Math.sqrt(R()),a=R()*6.283,x=x0+Math.cos(a)*r*1.3,y=250+Math.sin(a)*r*0.9;if(x<ox+8||x>ox+248)continue;leaf(x,y,6+R()*4,R()*6.283,150+Math.floor(R()*80));}
      st.forEach((q,i)=>{const f=1-i/st.length;if(R()>0.6+0.4*f)return;const n=1+(R()<0.3+f?1:0);
        for(let j=0;j<n;j++){const x=q[0]+(R()-0.5)*(8+14*f),y=q[1]+(R()-0.5)*8;if(x<ox+8||x>ox+248)continue;leaf(x,y,5+R()*3+3*f,R()*6.283,155+Math.floor(R()*80));}});}}
  const t=new THREE.CanvasTexture(cv);t.anisotropy=4;return t;})();
function ivyMat(hang){const m=new THREE.MeshLambertMaterial({color:0xffffff,map:ivyTex,alphaTest:0.35,side:THREE.DoubleSide});
  return setEnv(m,{id:hang?'ivyH':'ivyC',hang:hang?0.28:0,uvVar:true,vpars:'attribute float izVar;\n'});}
function withVar(g,n){const c=g.clone();c.setAttribute('izVar',new THREE.InstancedBufferAttribute(new Float32Array(n),1));return c;}
const ivyClimbG=new THREE.PlaneGeometry(1,1);ivyClimbG.translate(0,0.5,0);
const ivyHangG=new THREE.PlaneGeometry(1,1);ivyHangG.translate(0,-0.5,0);{const uv=ivyHangG.attributes.uv;for(let i=0;i<uv.count;i++)uv.setY(i,1-uv.getY(i));}
const ivyClimb=new THREE.InstancedMesh(withVar(ivyClimbG,2600),ivyMat(false),2600),ivyHang=new THREE.InstancedMesh(withVar(ivyHangG,900),ivyMat(true),900);
const ivyClumpM=new THREE.MeshLambertMaterial({color:0xffffff});ivyClumpM.userData.tex='canopy';
const ivyClumps=new THREE.InstancedMesh(sph(1,6,4),ivyClumpM,2400);
let nIvC=0,nIvH=0,nIvK=0;
const IVYG=[0x3f9a4c,0x4cb35a,0x3a8a6a,0x52a870,0x62c488,0x6fb04a,0x80bf5a];
const IVYP=[],FLOWIDX=[];
function ivyPanel(hang,x,y,z,w,h,heading,tilt){const im=hang?ivyHang:ivyClimb,n=hang?nIvH:nIvC;if(n>=(hang?900:2600))return;if(!hang)IVYP.push([x,y,z,w,h,heading,tilt]);
  putE(im,n,x,y,z,w,h,1,tilt,heading,0,xpick(IVYG));im.geometry.attributes.izVar.array[n]=Math.floor(xr()*3);if(hang)nIvH++;else nIvC++;}
function ivyClump(x,y,z,sz){if(nIvK>=2400)return;put(ivyClumps,nIvK++,x,y,z,sz,sz*0.7,sz,xr()*6.28,xpick(IVYG));}
// window boxes
const fbM=new THREE.MeshLambertMaterial({color:0xffffff});fbM.userData.tex='timber';fbM.userData.lod=[230,290];
const smallLeafM=new THREE.MeshLambertMaterial({color:0xffffff});smallLeafM.userData.tex='canopy';smallLeafM.userData.lod=[230,290];
const flowerBoxes=new THREE.InstancedMesh(boxG,fbM,1600),flowerLeaves=new THREE.InstancedMesh(sph(1,6,4),smallLeafM,1600),flowers=new THREE.InstancedMesh(boxG,Object.assign(new THREE.MeshLambertMaterial({color:0xffffff}),{userData:{lod:[230,290]}}),4000);
let nFB=0,nFL=0,nFw=0;
const FLOWER=[0xff5fa2,0xffd34a,0xe8443a,0xf4f0e6,0xb06adf,0xff8a3a];
function flowerBox(x,y,z,ry,w){if(nFB>=1600)return;if(curLot)curLot.boxes=true;
  put(flowerBoxes,nFB++,x,y,z,w,0.38,0.46,ry,xpick([0xa8552a,0x8a5a3a,0x9c6a4a]));
  if(nFL<1600)put(flowerLeaves,nFL++,x,y+0.36,z,w*0.5,0.32,0.26,ry,xpick(IVYG));
  const n=3+Math.floor(xr()*4);for(let i=0;i<n&&nFw<4000;i++){const o=loc(x,z,(xr()-0.5)*w*0.85,(xr()-0.3)*0.2,ry);const fy=y+0.45+xr()*0.25,fr=xr()*6.28,fi=Math.floor(xr()*FLOWER.length);FLOWIDX[nFw]=fi;put(flowers,nFw++,o[0],fy,o[1],0.16,0.16,0.16,fr,FLOWER[fi]);}}
// rooftop cisterns
const tankG=new THREE.CylinderGeometry(1,1,1,10);tankG.translate(0,0.5,0);
const lidG=new THREE.CylinderGeometry(0.12,1.05,1,10);lidG.translate(0,0.5,0);
const tankM=new THREE.MeshLambertMaterial({color:0xffffff});tankM.userData.tex='timber';
const tanks=new THREE.InstancedMesh(tankG,tankM,400),hoops=new THREE.InstancedMesh(tankG,lamC(0x3a3632),800),lids=new THREE.InstancedMesh(lidG,lamC(0x5a4a3a),400);
let nTk=0,nHp=0,nLd=0;
function cistern(x,y,z,r,h){if(nTk>=400)return;if(curLot)curLot.cistern=true;put(tanks,nTk++,x,y,z,r,h,r,0,xpick([0x8a6a4a,0x9c7a55,0x7a5a3a]));
  put(hoops,nHp++,x,y+h*0.22,z,r*1.04,0.12,r*1.04,0);put(hoops,nHp++,x,y+h*0.72,z,r*1.04,0.12,r*1.04,0);put(lids,nLd++,x,y+h,z,r,r*0.45,r,0);}
const GLOWFERNS=[],TREES=[];   // TREES: [x,y,z,height,width,type,colour] for the distant cut-outs   // where the glowing plants are: fireflies gather there at night
const SMOKE=[];   // chimney tops and vents: [x,y,z,kind]  kind 0 smoke, 1 steam, 2 spray
const LANTERNS=[];const SEWER={};const WALL_LEAN=3/22;
const STAIRS={G:0.7,O:-270,N:772,top:null};   // stair tread heights on a fine grid (NaN where there are none)

const NEON=[0x3ee0ff,0xff7a2a,0xff3fa6,0xffd34a,0x7dff5a];
const ADOBE=[0xc98f5c,0xd6a06a,0xb87d4c,0xe0b07a,0xa9713f];
const TIMBER=0x5e3f28,TIMBER2=0x74513a;
