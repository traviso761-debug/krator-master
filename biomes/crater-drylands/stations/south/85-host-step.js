// ================================================================= HOST — station 2: the lava step's face in the tibasalt beds (core/terrain KSTRATA)
// BACKPORT.md's row for crater drylands S: "tibasalt strata at the southern edge". The step (45: STEP_H m on stepZ(x), Godstep's first) is
// ground like the rest; its STEEP part (the face, slope over ~.45) is drawn again a hair over it, coloured vertex by vertex from KSTRATA's
// tibasalt recipe at that point (KSTRATA.at: the data half, the bed the shader would draw, 0.6 m apart up the face), times a fine grain.
// Not on the ground's own shader: the core strata shade takes 3-5 more texture units, and this ground already reads 14 of the Arc's 16.
// The face's own mesh: one draw, ~50k vertices, no texture. ?step=0 leaves it to the ground's paint.
const STEP_FACE=(function(){if(new URLSearchParams(location.search).get('step')==='0'||typeof KSTRATA==='undefined')return null;
 const S=KSTRATA.create({seed:KRAND.hash(29,0x57E9,1,0),formations:[{recipe:'tibasalt'}],range:[100,700],dip:[.6,.8,.006],warp:[6,1.6]});
 const R=TERR.R-60,DX=6,DU=.6,U0=-22,U1=16,nx=Math.floor(2*R/DX)+1,nu=Math.round((U1-U0)/DU)+1;
 const pos=new Float32Array(nx*nu*3),col=new Float32Array(nx*nu*3),steep=new Uint8Array(nx*nu),c=new THREE.Color(),out={};
 for(let i=0;i<nx;i++){const x=-R+i*DX,z0=stepZ(x);
  for(let j=0;j<nu;j++){const k=i*nu+j,z=z0+U0+j*DU,y=terrainH(x,z),dy=(terrainH(x,z+.6)-terrainH(x,z-.6))/1.2;
   pos[k*3]=x;pos[k*3+1]=y+.05;pos[k*3+2]=z;steep[k]=Math.abs(dy)>.45?1:0;
   const a=S.at(x,y,z,out),g=.82+.3*(h3(x*1.7,y*2.3,z*1.7)-.5)+.2*(fbm(x*.2,y*.35+z*.05,611,2)-.5);
   c.setRGB(a.colour[0],a.colour[1],a.colour[2]).convertSRGBToLinear();col[k*3]=c.r*g;col[k*3+1]=c.g*g;col[k*3+2]=c.b*g;}}
 const idx=[];for(let i=0;i<nx-1;i++)for(let j=0;j<nu-1;j++){const a=i*nu+j,b=a+nu,cc=b+1,d=a+1;if(!(steep[a]|steep[b]|steep[cc]|steep[d]))continue;idx.push(a,b,d,b,cc,d);}
 if(!idx.length)return null;
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('color',new THREE.BufferAttribute(col,3));g.setIndex(idx);g.computeVertexNormals();
 const mat=new THREE.MeshLambertMaterial({vertexColors:true,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-2});mat.customProgramCacheKey=()=>'craterdry-step';
 const m=new THREE.Mesh(g,mat);m.userData.host=true;m.userData.rock=true;m.userData.inspectLabel='The lava step: titanium basalt in its beds (Godstep\'s first step)';scene.add(m);
 REGISTER({name:'The lava step (Godstep\'s first: titanium basalt)',key:'step',x:0,z:stepZ(0),y:terrainH(0,stepZ(0)-30)-5,r:TERR.R,h:STEP_H+20});
 return{mesh:m,strata:S,tris:idx.length/3};})();
window._stepFace=STEP_FACE?{tris:STEP_FACE.tris}:null;
