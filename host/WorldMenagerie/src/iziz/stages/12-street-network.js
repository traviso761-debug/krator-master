// ---------- 3. street network ----------
// plazas, parks, precincts first (they block buildings)
disc(0,0,30,'#c9a56b','#000');                         // central plaza
disc(TEMPLE.x,TEMPLE.z,46,'#cfa96c','#000');           // temple ceremonial plaza
disc(PALACE.x,PALACE.z,62,'#a8844e','#000');           // palace precinct
disc(-125,60,22,'#c9a56b','#000');                     // markets
disc(60,150,18,'#c9a56b','#000');
disc(-70,-140,22,'#c9a56b','#000');
disc(NEEDLE.x,NEEDLE.z,22,'#c9a56b','#000');           // observation tower plaza
disc(SPIRE.x,SPIRE.z,9,'#c9a56b','#000');              // crowned column
disc(25,40,20,'#c9a56b','#000');                       // dome hall
disc(-100,-130,24,'#2c6b34','#0f0');                   // parks (green = trees allowed)
disc(120,-150,24,'#2c6b34','#0f0');
disc(-40,170,20,'#2c6b34','#0f0');

// ring roads — wobble grows toward the centre (stretch grid gets irregular)
[0.30,0.52,0.74,0.92].forEach((f,k)=>{
  const pts=[];for(let i=0;i<=160;i++){const t=i/160*Math.PI*2;const wob=(1.05-f)*16*Math.sin(4*t+k*2.1)+(1.05-f)*7*Math.sin(9*t+k);pts.push([(f*wallR(t)+wob)*Math.cos(t),(f*wallR(t)+wob)*Math.sin(t)]);}
  road(pts,f>0.7?7:6);
});
// radial spokes, bending more near the centre
for(let k=0;k<16;k++){
  const t0=k*Math.PI/8+0.12;const pts=[];
  for(let r=34;r<wallR(t0)-2;r+=4){const t=t0+(1-r/wallR(t0))*0.28*Math.sin(r*0.06+k);pts.push([r*Math.cos(t),r*Math.sin(t)]);}
  road(pts,5);
}
// secondary spokes in the outer belt only (regular near the edge)
for(let k=0;k<16;k++){
  const t0=k*Math.PI/8+0.12+Math.PI/16;const pts=[];
  for(let r=0.5*wallR(t0);r<wallR(t0)-2;r+=4){pts.push([r*Math.cos(t0),r*Math.sin(t0)]);}
  road(pts,4);
}
// cartesian grid clipped to the outer belt
function clipped(pf,pred,w){let seg=[];for(let s=-260;s<=260;s+=3){const q=pf(s);if(pred(q))seg.push(q);else{road(seg,w);seg=[];}}road(seg,w);}
const belt=q=>{const p=polar(q[0],q[1]);return p.r>0.74*wallR(p.t)&&p.r<wallR(p.t)-6;};
for(let k=-240;k<=240;k+=28){clipped(s=>[k,s],belt,4);clipped(s=>[s,k],belt,4);}
// grand boulevards to each gate, continuing across the bridge and into the jungle
for(const g of GATES){const pts=[];for(let r=30;r<620;r+=5)pts.push([r*Math.cos(g),r*Math.sin(g)]);road(pts,14);}
// a couple of diagonal avenues in the mid-ring for cross-town movement
[[[-160,-30],[-40,120]],[[40,-170],[150,-40]]].forEach(l=>road([l[0],[(l[0][0]+l[1][0])/2+10,(l[0][1]+l[1][1])/2-8],l[1]],6));

disc(ARENA.x,ARENA.z,58,'#c9a56b','#000');              // arena and its forecourt
disc(TPAD.x,TPAD.z,10,'#c9a56b','#000');disc(APAD.x,APAD.z,10,'#c9a56b','#000');   // shuttle pads kept clear
disc(AMPH.x,AMPH.z,19,'#c9a56b','#000');   // amphitheatre and its apron
{const pts=[];for(let i=0;i<=72;i++){const t=i/72*Math.PI*2;pts.push([21*Math.cos(t),21*Math.sin(t)]);}stroke(c,pts,3,'#a8884e');for(let k=0;k<8;k++){const t=k*Math.PI/4;stroke(c,[[13*Math.cos(t),13*Math.sin(t)],[27*Math.cos(t),27*Math.sin(t)]],1.5,'#a8884e');}}   // paving pattern on the central square
{const pts=[];for(let i=0;i<=48;i++){const t=i/48*Math.PI*2;pts.push([NEEDLE.x+15*Math.cos(t),NEEDLE.z+15*Math.sin(t)]);}stroke(c,pts,2.5,'#a8884e');}
for(const st of STATUES){if(st[5])continue;m.beginPath();m.arc(px(st[0]),px(st[1]),(st[2]*0.3+1.5)*S,0,7);m.fillStyle='#000';m.fill();}   // statue plinths kept clear
// spaceport tarmac, pads and taxiway ring (mask black: nothing grows or builds here)
disc(SP.x,SP.z,SPR,'#56524c','#000');
{const pts=[];for(let i=0;i<=64;i++){const t=i/64*Math.PI*2;pts.push([SP.x+46*Math.cos(t),SP.z+46*Math.sin(t)]);}stroke(c,pts,5,'#3f3c38');}
for(let i=0;i<6;i++){const t=i/6*Math.PI*2+Math.PI/4;disc(SP.x+46*Math.cos(t),SP.z+46*Math.sin(t),12,'#6e6a62','#000');disc(SP.x+46*Math.cos(t),SP.z+46*Math.sin(t),3,'#c9a56b','#000');}
disc(BPAD.x,BPAD.z,18,'#6e6a62','#000');disc(BPAD.x,BPAD.z,4,'#c9a56b','#000');   // freighter pad
const mData=m.getImageData(0,0,CS,CS).data;
poly(c,t=>LAKE.at(1.14,t),160,'#6e6444');poly(c,t=>LAKE.at(1.0,t),160,'#2a4442');poly(c,t=>LAKE.at(0.7,t),160,'#1c3036');
stroke(c,DOCKROAD.pts,9,'#5e5a52');stroke(c,DOCKROAD.pts,7,'#77736b');   // the dock road: paved, so townspeople can walk it   // lake: muddy shore, shallows, deep water
{const bank=[],bed=[];for(let r=200;r<=RIVER.rEnd;r+=3){const t=RIVER.tc(r),ro=r-wallR(t);if(ro<34)continue;bank.push([r*Math.cos(t),r*Math.sin(t)]);}
 for(let r=200;r<=RIVER.rEnd;r+=3){const t=RIVER.tc(r),ro=r-wallR(t);if(ro<34)continue;const w=RIVER.hw(ro);stroke(c,[[r*Math.cos(t),r*Math.sin(t)],[(r+3)*Math.cos(RIVER.tc(r+3)),(r+3)*Math.sin(RIVER.tc(r+3))]],2*(w+7),'#5e5a3c');}
 for(let r=200;r<=RIVER.rEnd;r+=3){const t=RIVER.tc(r),ro=r-wallR(t);if(ro<34)continue;const w=RIVER.hw(ro);stroke(c,[[r*Math.cos(t),r*Math.sin(t)],[(r+3)*Math.cos(RIVER.tc(r+3)),(r+3)*Math.sin(RIVER.tc(r+3))]],2*w,'#2c3a34');}
 // the footpath is sand-coloured, so townspeople who leave by the south gate can wander along it; over the water only the bridge line counts
 stroke(c,TRAIL.pts,3.2,'#a08a62');
 for(let r=TRAIL.rb-30;r<=TRAIL.rb+30;r+=3){const t=RIVER.tc(r),ro=r-wallR(t),w=RIVER.hw(ro);stroke(c,[[r*Math.cos(t),r*Math.sin(t)],[(r+3)*Math.cos(RIVER.tc(r+3)),(r+3)*Math.sin(RIVER.tc(r+3))]],2*w,'#2c3a34');}
 {const B=riverBridge();stroke(c,[B.e0,B.e1],2.4,'#a08a62');}}
// grass verges: bare earth right beside a street turns green in patches (colour canvas only; streets and plazas stay as they are)
const VERGE=new Uint8Array(CS*CS);
const GROUND_IMG=c.getImageData(0,0,CS,CS);   // the painted ground, read back once here and reused by the jungle and great-tree passes
{const img=GROUND_IMG,d=img.data,isRoad=i=>{const r=d[i],g=d[i+1],b=d[i+2];return Math.abs(r-g)<14&&Math.abs(g-b)<14&&r>55&&r<150;};
 const earth=i=>{const r=d[i],g=d[i+1],b=d[i+2];return r<150&&g<r*0.75&&g>=b-4&&!(r>150&&g>110&&r-b>55);};   // only the dark earth of the city ground, never sand, plazas or streets
 const RAD=[];for(let dy=-3;dy<=3;dy++)for(let dx=-3;dx<=3;dx++)if(dx*dx+dy*dy<=9&&(dx||dy))RAD.push(dy*CS+dx);
 const lo=Math.floor(px(-280)),hi=Math.ceil(px(280));
 for(let y=lo;y<hi;y++)for(let x=lo;x<hi;x++){const wx=(x+0.5)/S-WORLD/2,wz=(y+0.5)/S-WORLD/2,pp=polar(wx,wz);if(pp.r>wallR(pp.t)-8)continue;
   const k=y*CS+x,i=k*4;if(!earth(i))continue;if(vn(wx*0.045+11,wz*0.045+7)<0.52)continue;
   let near=false;for(const o of RAD){if(isRoad((k+o)*4)){near=true;break;}}if(!near)continue;VERGE[k]=1;}
 for(let k=0;k<CS*CS;k++)if(VERGE[k]){const i=k*4,v=hash3(k%CS,(k/CS)|0,5);d[i]=38+v*22;d[i+1]=88+v*34;d[i+2]=34+v*16;}
 c.putImageData(img,0,0);}
const vergeAt=(x,z)=>{const ix=Math.floor(px(x)),iz=Math.floor(px(z));return ix>=0&&iz>=0&&ix<CS&&iz<CS&&VERGE[iz*CS+ix]===1;};
function riverBridge(){const rb=TRAIL.rb,tb=RIVER.tc(rb),cx=rb*Math.cos(tb),cz=rb*Math.sin(tb),t2=RIVER.tc(rb+1);let tx=(rb+1)*Math.cos(t2)-cx,tz=(rb+1)*Math.sin(t2)-cz;const L=Math.hypot(tx,tz);tx/=L;tz/=L;
  const nx=-tz,nz=tx,half=RIVER.hw(rb-wallR(tb))+5;return {c:[cx,cz],n:[nx,nz],a:[tx,tz],half,e0:[cx-nx*half,cz-nz*half],e1:[cx+nx*half,cz+nz*half],S:RIVER.S(rb-wallR(tb))};}
function mask(x,z){const ix=Math.floor(px(x)),iz=Math.floor(px(z));if(ix<0||iz<0||ix>=CS||iz>=CS)return [0,0];const i=(iz*CS+ix)*4;return [mData[i],mData[i+1]];}

const groundTex=new THREE.CanvasTexture(cv);groundTex.anisotropy=8;
const tg=new THREE.PlaneGeometry(WORLD,WORLD,360,360);tg.rotateX(-Math.PI/2);
{const tp=tg.attributes.position;for(let i=0;i<tp.count;i++)tp.setY(i,terrainH(tp.getX(i),tp.getZ(i)));tg.computeVertexNormals();}
// height of the rendered ground (the triangles, not the analytic field), for things that must sit exactly on it
const TPOS=tg.attributes.position,TSEG=360,TSTEP=WORLD/TSEG;
function meshH(x,z){const fx=(x+WORLD/2)/TSTEP,fz=(z+WORLD/2)/TSTEP;const ix=clamp(Math.floor(fx),0,TSEG-1),iz=clamp(Math.floor(fz),0,TSEG-1);const u=fx-ix,v=fz-iz;
  const H=(i,j)=>TPOS.getY(j*(TSEG+1)+i);const ha=H(ix,iz),hb=H(ix,iz+1),hc=H(ix+1,iz+1),hd=H(ix+1,iz);
  return u+v<=1?ha+(hd-ha)*u+(hb-ha)*v:hc+(hb-hc)*(1-u)+(hd-hc)*(1-v);}
const terrainMat=new THREE.MeshLambertMaterial({map:groundTex});const terrainMesh=new THREE.Mesh(tg,terrainMat);scene.add(terrainMesh);

// moat water (only visible in the chasm)
// at night the moat carries a warm glitter from the wall and a pool under each wall light; rain rings when it rains
const MOAT_POOLS=[];for(let i=0;i<20;i++)MOAT_POOLS.push(new THREE.Vector4(0,0,0,1));
const BOAT_POOLS=[];for(let i=0;i<24;i++)BOAT_POOLS.push(new THREE.Vector4(0,0,0,1));   // moving lantern reflections (boats)
const FW_GLSL=sh=>`{float izFd=distance(izWp.xz,izFw.xy);totalEmissiveRadiance+=izFwC*izFw.z*(0.3+0.7*${sh})/(1.0+izFd/izFw.w);}
`;   // firework bursts light up the water
const BOAT_LOOP=acc=>`for(int j=0;j<24;j++){
  vec4 Q=izBoatPools[j];
  if(Q.z<=0.001)continue;
  vec2 bv=izWp.xz-Q.xy;vec2 bc=normalize(cameraPosition.xz-Q.xy+vec2(0.0001));
  float ba=dot(bv,bc);float bp=bv.x*bc.y-bv.y*bc.x;
  ${acc}+=vec3(1.0,0.8,0.5)*Q.z*exp(-(bp*bp)/(Q.w*Q.w*0.15)-(ba*ba)/(Q.w*Q.w*4.0))*step(-Q.w*0.3,ba);
}
`;
const moatM=new THREE.MeshLambertMaterial({color:0x1b2f80,transparent:true,opacity:0.88});moatM.userData.env=true;moatM.customProgramCacheKey=()=>'moat';
moatM.onBeforeCompile=sh=>{sh.uniforms.izFw=ENV.izFw;sh.uniforms.izFwC=ENV.izFwC;sh.uniforms.izPools={value:MOAT_POOLS};sh.uniforms.izBoatPools={value:BOAT_POOLS};applyEnv(sh,{fpars:`uniform vec4 izPools[20];uniform vec4 izBoatPools[24];uniform vec4 izFw;uniform vec3 izFwC;
float izWallR(float t){return 235.0+22.0*sin(3.0*t+1.0)+10.0*sin(7.0*t+2.0)+6.0*sin(11.0*t);}
`,fbody:`{
float izT=atan(izWp.z,izWp.x);float izRo=length(izWp.xz)-izWallR(izT);
float izBand=smoothstep(5.0,8.5,izRo)*(1.0-smoothstep(9.0,22.0,izRo));
float izSh=sin(izWp.x*0.83+izTime*1.9)*sin(izWp.z*0.71-izTime*1.4)+0.6*sin((izWp.x-izWp.z)*2.3+izTime*3.1);
izSh=pow(max(izSh,0.0),3.0);
vec3 izRef=vec3(1.0,0.68,0.36)*izBand*(0.05+0.35*izSh);
for(int i=0;i<20;i++){
  vec4 P=izPools[i];
  if(P.z<=0.001)continue;
  vec2 v=izWp.xz-P.xy;vec2 toCam=normalize(cameraPosition.xz-P.xy+vec2(0.0001));
  float a=dot(v,toCam);float pp=v.x*toCam.y-v.y*toCam.x;
  float gg=exp(-(pp*pp)/(P.w*P.w*0.2)-(a*a)/(P.w*P.w*5.0))*step(-P.w*0.3,a);
  izRef+=vec3(1.0,0.85,0.6)*P.z*gg*(0.35+0.65*izSh);
}
${BOAT_LOOP('izRef')}
totalEmissiveRadiance+=izRef*izNight;
${FW_GLSL('izSh')}
vec2 izCell=floor(izWp.xz*0.5);vec2 izF=fract(izWp.xz*0.5)-0.5;
float izHr=fract(sin(dot(izCell,vec2(12.9898,78.233)))*43758.5453);
float izAge=fract(izTime*0.9+izHr);
float izRing=(1.0-smoothstep(0.0,0.05,abs(length(izF)-izAge*0.45)))*(1.0-izAge);
totalEmissiveRadiance+=vec3(0.5,0.6,0.75)*izRing*izRain*0.35*(0.3+0.7*izDay);
}
`});};
{const wg=new THREE.PlaneGeometry(WORLD,WORLD);wg.rotateX(-Math.PI/2);const w=new THREE.Mesh(wg,moatM);w.position.y=-9.5;w.userData.cat='water';scene.add(w);}
