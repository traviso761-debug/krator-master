// ================================================================= HOST — the far terrain: the scale model's land round the page, to 60 km
// One ring mesh from the page's edge outward, its heights the open world's fields (42: WORLD.H, coarser with distance), so
// the K'etsaal Baatar's valley to the south, the land falling away east and the Inner Wall rising north stand where the
// scale model has them. The forest is drawn as a canopy surface over the ground (the hyperjungle's 150-270 m crowns: no
// trees out here), opened over the rivers; ground the forest leaves (Korona's coronae, the Inner Wall's rock) takes the
// fields' own ground colour. Fogged like everything else; no shadows, no registry (it is scenery, not a place).
const FAR=(function(){
 const R0=TERR.R-50,R1=60000,NA=288,rings=[];
 for(let r=R0;r<R1;r*=1.045)rings.push(r);rings.push(R1);
 const NR=rings.length,pos=new Float32Array(NR*NA*3),col=new Float32Array(NR*NA*3),idx=[];
 // the rivers as polylines (the channels the fields carved): the canopy opens over them
 const RIV=WORLD.riverLines(250).map(L=>L.pts);
 const riverD=(x,z)=>{let d=1e9;for(const L of RIV)for(let i=1;i<L.length;i++){const a=L[i-1],b=L[i],dx=b[0]-a[0],dz=b[1]-a[1],ll=dx*dx+dz*dz||1,
   t=clamp(((x-a[0])*dx+(z-a[1])*dz)/ll,0,1);d=Math.min(d,Math.hypot(x-a[0]-dx*t,z-a[1]-dz*t));}return d;};
 const C=new THREE.Color(),CAN=[new THREE.Color(0x31502c),new THREE.Color(0x46663a),new THREE.Color(0x2a4426)].map(c=>c.convertSRGBToLinear()),out=[0,0,0,0];
 let water=0;
 for(let i=0;i<NR;i++){const r=rings[i],mw=Math.max(60,r*.02);
  for(let k=0;k<NA;k++){const a=k/NA*TAU,x=Math.cos(a)*r,z=Math.sin(a)*r,o=3*(i*NA+k);
   let h=WORLD.H(x,z,mw)-WORLD_H0;const w=WORLD.water(x,z),wet=w>-1e8&&w-WORLD_H0>=h-.5;
   // the forest's share here: the hyperjungle's overlay, thinned on steep or high ground (the Inner Wall's flanks)
   const S=WORLD.at(x,z),jungle=WORLD.kitW(0,x,z)*smooth(2600,1800,h+WORLD_H0)*(1-smooth(.35,.7,S.slope||0));
   const rd=riverD(x,z),open=smooth(40,160,rd)*(wet?0:1),canopy=jungle*open*(150+50*(fbm(x*.0004,z*.0004,61,2)-.5));
   if(wet){h=w-WORLD_H0;water++;}
   // the canopy rises from the page's edge over 700 m: the page's own forest stands in front of the ramp
   pos[o]=x;pos[o+1]=h+canopy*smooth(R0,R0+700,r);pos[o+2]=z;
   if(wet)C.setRGB(.04,.07,.08);
   else{WORLD.ground(x,z,S,out);C.setRGB(out[0],out[1],out[2]);   // the fields' ground (linear)
    const u=fbm(x*.00025+7,z*.00025-3,62,3),cc=u<.45?CAN[2]:u<.58?CAN[0]:CAN[1];C.lerp(cc,clamp(jungle*open,0,1));}   // stands of a kind, kilometres across
   col[o]=C.r;col[o+1]=C.g;col[o+2]=C.b;}}
 for(let i=0;i<NR-1;i++)for(let k=0;k<NA;k++){const a=i*NA+k,b=i*NA+(k+1)%NA,c=a+NA,d=b+NA;idx.push(a,b,c,b,d,c);}   // CCW from above: the normals up
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('color',new THREE.BufferAttribute(col,3));
 g.setIndex(idx);g.computeVertexNormals();
 const m=new THREE.Mesh(g,new THREE.MeshLambertMaterial({vertexColors:true}));
 m.userData.probeSkip=true;m.userData.host=true;m.userData.far=true;m.userData.inspectLabel='The land round the knoll (the scale model, 4 km cells, to 60 km)';
 scene.add(m);
 return {mesh:m,rings:NR,around:NA,water,R0,R1};})();
_mark('far');
