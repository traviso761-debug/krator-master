// ================================================================= HOST — the far terrain: the scale model's land round the page, to 60 km
// One ring mesh from the page's edge outward (Pinnacle Rock's, without its canopy), its heights the open world's fields
// (WORLD.H, coarser with distance), coloured by the fields' own ground (the Oidong Valley's palette on the valley, snow
// where the mean is under freezing), so the valley's walls rising 1-3 km north and south, the lake 40 km west and the
// ranges round them stand where the scale model has them. Fogged; no registry (it is scenery, not a place).
const FAR=(function(){
 const R0=TERR.R-60,R1=60000,NA=320,rings=[];
 for(let r=R0;r<R1;r*=1.04)rings.push(r);rings.push(R1);
 const NR=rings.length,pos=new Float32Array(NR*NA*3),col=new Float32Array(NR*NA*3),idx=[];
 const C=new THREE.Color(),out=[0,0,0,0];let water=0;
 for(let i=0;i<NR;i++){const r=rings[i],mw=Math.max(60,r*.02);
  for(let k=0;k<NA;k++){const a=k/NA*TAU,x=Math.cos(a)*r,z=Math.sin(a)*r,o=3*(i*NA+k);
   let h=landH(x,z,mw);const w=worldWater(x,z),wet=w>-1e8&&w>=h-.5;
   if(wet){h=w;water++;C.setRGB(.05,.09,.1);}
   else{const S=WORLD.at(x+WX,z+WZ);WORLD.ground(x+WX,z+WZ,S,out);C.setRGB(out[0],out[1],out[2]);}
   // the inner rings sink under the page's own ground where they meet it
   pos[o]=x;pos[o+1]=h-(i===0?3:0);pos[o+2]=z;col[o]=C.r;col[o+1]=C.g;col[o+2]=C.b;}}
 for(let i=0;i<NR-1;i++)for(let k=0;k<NA;k++){const a=i*NA+k,b=i*NA+(k+1)%NA,c=a+NA,d=b+NA;idx.push(a,b,c,b,d,c);}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('color',new THREE.BufferAttribute(col,3));
 g.setIndex(idx);g.computeVertexNormals();
 const m=new THREE.Mesh(g,new THREE.MeshLambertMaterial({vertexColors:true}));
 m.userData.probeSkip=true;m.userData.host=true;m.userData.far=true;m.userData.inspectLabel='The Oidong Valley round Longsong (the scale model, 4 km cells, to 60 km)';
 scene.add(m);
 return {mesh:m,rings:NR,around:NA,water,R0,R1};})();
_mark('far');
