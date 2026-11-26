// ================================================================= HOST — the caldera's walls past the far field (Godshearth, station 1; PLAN.md section 1, "The walls")
// The walls stand 40-100 km off (west 7.9 km high, north 7.6 km, the east rim 5.9 km; the spillway falling south): past the far field's 14 km and the
// camera's 16 km. They are drawn from the MODEL'S HEIGHTS (GH_MODEL, 44r: 2 km cells to 112 km, bilinear) as a RING: each sample at distance d and
// bearing a is put at radius R(d) = 14.6 km + 1.2% of (d - 14 km), its height scaled by R(d)/d about the eye, so its elevation angle from the page is the
// real one and nearer ridges stand in front of farther ones (R grows with d). The ring follows the camera over the ground (a backdrop: a kilometre's
// walk moves a wall 50 km off by about a degree, not drawn). Coloured by height (the floor's turf, the benches' scree, the walls' tibasalt with the
// orange bead horizons, the Godthrone's ice over ~6.2 km), the model's water as the lake's, hazed by the real distance; lit as the far field is (Lambert,
// the sun), its own fog (the scene's would hide it). ?walls=0 without it.
const GH_WALLS=(function(){if(new URLSearchParams(location.search).get('walls')==='0')return null;
 const NA=360,D0=14000,D1=110000,DS=2000,ND=Math.floor((D1-D0)/DS)+1,EYE=3,R0=14600,RK=.012;
 const L=a=>a.map(v=>Math.pow(v/255,2.2)),m=(a,b,t)=>a.map((v,i)=>v+(b[i]-v)*t);
 const TURF=L([96,92,60]),SCREE=L([92,84,70]),BASALT=L([46,44,46]),BEAD=L([150,92,40]),ICE=L([226,232,238]),LAKE=L([52,104,110]),HZ=[HAZE.r,HAZE.g,HAZE.b];
 const pos=new Float32Array(NA*ND*3),col=new Float32Array(NA*ND*3),idx=[];
 for(let ia=0;ia<NA;ia++){const a=ia/NA*TAU,ca=Math.cos(a),sa=Math.sin(a);
  for(let k=0;k<ND;k++){const d=D0+k*DS,x=ca*d,z=sa*d,H=GH_MH(x,z),abs=H+GH_LAKE.abs,wet=GH_MWET(x,z),R=R0+RK*(d-D0),o=(ia*ND+k)*3;
   pos[o]=ca*R;pos[o+1]=EYE+(H-EYE)*R/d;pos[o+2]=sa*R;
   const g=Math.abs(GH_MH(x+DS,z)-GH_MH(x-DS,z))+Math.abs(GH_MH(x,z+DS)-GH_MH(x,z-DS)),steep=smooth(300,1400,g);   /* metres of rise over 4 km either way */
   let c=wet?LAKE:m(TURF,SCREE,smooth(4000,4700,abs));
   if(!wet){c=m(c,BASALT,Math.max(smooth(4600,5400,abs),steep*.8));c=m(c,BEAD,.35*smooth(4600,5200,abs)*smooth(.55,.85,Math.abs(Math.sin(abs/170))));   /* the glass-bead horizons in the faces */
    c=m(c,ICE,smooth(5900,6500,abs)*(1-.55*steep));}
   c=m(c,HZ,clamp(.22+.5*(1-Math.exp(-(d-D0)/45000)),0,.78));
   col[o]=c[0];col[o+1]=c[1];col[o+2]=c[2];}}
 for(let ia=0;ia<NA;ia++){const ib=(ia+1)%NA;for(let k=0;k<ND-1;k++){const a=ia*ND+k,b=ib*ND+k;idx.push(a,b,a+1,b,b+1,a+1);}}
 const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(pos,3));geo.setAttribute('color',new THREE.BufferAttribute(col,3));geo.setIndex(idx);geo.computeVertexNormals();
 const mat=new THREE.MeshLambertMaterial({vertexColors:true,fog:false,side:THREE.DoubleSide});mat.userData.farField=true;mat.userData.noSnow=true;mat.customProgramCacheKey=()=>'godshearth-walls';
 const mesh=new THREE.Mesh(geo,mat);mesh.frustumCulled=false;mesh.userData.host=true;mesh.userData.farField=true;mesh.userData.probeSkip=true;mesh.userData.noSnow=true;
 mesh.userData.inspectLabel='The caldera\'s walls (the scale model\'s heights, 14-110 km off)';scene.add(mesh);
 tick(()=>{mesh.position.x=camera.position.x;mesh.position.z=camera.position.z;});
 // the highest wall on each quarter's bearings, for the check and the words
 const top=[0,1,2,3].map(qd=>{let best={H:-1e9};for(let ia=qd*90;ia<qd*90+90;ia++)for(let k=0;k<ND;k++){const a=ia/NA*TAU,d=D0+k*DS,H=GH_MH(Math.cos(a)*d,Math.sin(a)*d);
  if(H>best.H)best={H,d,az:ia};}return{abs:Math.round(best.H+GH_LAKE.abs),km:Math.round(best.d/1000),az:best.az,deg:+(Math.atan2(best.H-EYE,best.d)*180/Math.PI).toFixed(2)};});
 window._walls={tris:idx.length/3,top};
 return{mesh,top,tris:idx.length/3};})();
