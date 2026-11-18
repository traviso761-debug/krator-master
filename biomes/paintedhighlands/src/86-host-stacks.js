// ================================================================= HOST — the danxia fins and hoodoos (PLAN.md section 2: KSTACKS, KSTACKS.contour, KSTACKS.weather)
// Fins of the hard sandstone standing out on the clay below a scarp, in rows along the strike (KSTACKS.row: one line, one lean), each a record first
// (STACKS, registered before it is drawn), then its mesh: KSTACKS.mesh worn by KSTACKS.contour (the profile thinning in and out, the joints) and
// KSTACKS.weather (two grains of KRAND noise, the foot kept on the ground), drawn in THE SAME BEDS as the ground (STRATA_SH: strataColor at the
// world position), so a fin's foot is the badland's clay and its body the danxia's red where the stack puts the contact. ?stacks=0 none.
const STACKS=(function(){if(new URLSearchParams(location.search).get('stacks')==='0'||!SITE.fins)return [];const out=[];
 const P=(u,v)=>[NRM[0]*u+PAINTED_STRIKE[0]*v,NRM[1]*u+PAINTED_STRIKE[1]*v];
 SITE.fins.forEach((r,i)=>{const B=KSTACKS.row({id:SKEY+'-fins-'+i,seed:KRAND.hash(5300+SITE.n,i,0),a:P(r.u[0],r.v[0]),b:P(r.u[1],r.v[1]),n:r.n,kind:'fin',H:r.H,r:[5,11],e:[3,5.5],ground:(x,z)=>L.land(x,z)});
  B.forEach((S,k)=>{S.name='A danxia fin ('+Math.round(S.top-S.y0)+' m: red sandstone on the banded clay)';out.push(S);});});
 return out;})();
ON_STACK=STACKS.length?(x,z)=>{const f=KSTACKS.foot(STACKS,x,z);return !!f&&f.d<1.5;}:null;
(function(){if(!STACKS.length)return;
 const acc={pos:[],idx:[],occ:[]};
 STACKS.forEach(B=>{let m=KSTACKS.mesh(B,{step:2.5});
  if(typeof KSTACKS.contour==='function')KSTACKS.contour(B,m,{profile:.08,crown:.12,wander:.8,joints:[4,7],jointW:[.5,1.2],jointD:[.8,2.2],cleft:false});
  if(typeof KSTACKS.weather==='function')KSTACKS.weather(B,m,{ground:(x,z)=>L.land(x,z),amp:1.4,pit:.4});
  const o=acc.pos.length/3;for(let i=0;i<m.pos.length;i++)acc.pos.push(m.pos[i]);for(let i=0;i<m.idx.length;i++)acc.idx.push(m.idx[i]+o);for(let i=0;i<m.occ.length;i++)acc.occ.push(m.occ[i]);
  REGISTER({name:B.name,key:'rock.fin',x:B.x,z:B.z,y:B.y0,r:B.R,h:B.top-B.y0,tags:{hazard:KHAZ.make(Object.assign({},PAINTED_HAZ.rockfall))}});});
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(acc.pos,3));
 const col=new Float32Array(acc.occ.length*3);for(let i=0;i<acc.occ.length;i++){const v=.62+.38*acc.occ[i];col[i*3]=col[i*3+1]=col[i*3+2]=v;}
 g.setAttribute('color',new THREE.BufferAttribute(col,3));g.setIndex(acc.idx);g.computeVertexNormals();
 const mat=new THREE.MeshStandardMaterial({color:0xffffff,vertexColors:true,roughness:.92,metalness:0});
 mat.onBeforeCompile=sh=>{if(!STRATA_SH)return;STRATA_SH.inject(sh);
  sh.fragmentShader=sh.fragmentShader.replace('#include <map_fragment>','#include <map_fragment>\ndiffuseColor.rgb=mix(diffuseColor.rgb,diffuseColor.rgb*strataColor(vSWP,vSWN)*1.6,0.95);');};
 mat.customProgramCacheKey=()=>'painted-fins';
 const me=new THREE.Mesh(g,mat);me.userData.probePoints=[].concat(...STACKS.map(B=>[B.x,(B.y0+B.top)/2,B.z]));me.userData.host=true;me.userData.rock=true;me.userData.inspectLabel='Danxia fins (KSTACKS: the hard red sandstone weathered out of the clay)';scene.add(me);
 window._stacks={bodies:STACKS.length,tris:acc.idx.length/3};})();
