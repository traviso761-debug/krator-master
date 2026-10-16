// prefix: lr
// ================================================================= THE RELIQUARY AND ITS ANTECHAMBER
// Isolated from the village and built in the older order's scale (DESIGN.md section 4, and the owner's reliquary references:
// a tall pointed mass over a pointed portal, lower wings, a stepped platform with one axial stair, candle-spires, bronze lines
// converging on the apex). Cyclopean polygonal masonry, battered, windowless; the only way in is one passage wound into the
// mass; one great stela at the mouth with the Coil and the fracture side by side; Rishtowar's breach repaired seamlessly, the
// only sign the cleaner stones. Inside, the antechamber: vast, dusty, tomb-like, the relics (nested bronze rings whose centres
// differ, a whorl-carved sphere, a bronze dodecahedron, the spiked black vessel), the Xanadui footprints leading in and not
// out, and the inner door, shut. Frame: origin on the ground at the plot centre, +z the front.
/* the relics */
function lrRings(x,y,z){W(x,y,z,0,()=>{cyl('stoneP',0,-1.2,0,.6,1.2,P('basaltD'),8);
 for(let i=0;i<5;i++){const R=1.6-i*.26;ring('bronzeC',(i%2?.1:-.08)*i,.08*i,(i%3-1)*.07,R,.045,P('bronze'),i*.5,i*.7+.3,i*.2,28);}});}
function lrSphere(x,y,z,R){W(x,y,z,0,()=>{cyl('stoneP',0,-1.1,0,R*.8,1.1,P('basaltD'),8);sph('stoneP',0,R,0,R,P('basaltD'),1,16);
 for(let k=0;k<4;k++){const ry=k*PI/2;W(0,R,0,ry,()=>tube('stoneP',t=>{const a=t*TAU*1.6,r=R*.95;const ph=t*1.1;return [Math.cos(a)*Math.sin(ph)*r,Math.cos(ph)*r,Math.sin(a)*Math.sin(ph)*r];},t=>[R*.05,R*.05],22,5,P('basaltC'),{caps:true}));}});}
function lrDodec(x,y,z,R){W(x,y,z,0,()=>{cyl('stoneP',0,-1.0,0,R*1.1,1.0,P('basaltD'),8);sph('bronzeC',0,R*.95,0,R*.78,P('bronze'),1,8);
 const g=(1+Math.sqrt(5))/2;const V=[];for(const a of [-1,1])for(const b of [-1,1]){V.push([0,a*g,b/g]);V.push([a/g,0,b*g]);V.push([a*g,b/g,0]);}
 for(const v of V){const L=Math.hypot(v[0],v[1],v[2]);sph('bronzeC',v[0]/L*R,R*.95+v[1]/L*R,v[2]/L*R,R*.1,P('bronze'),1,7);}
 for(let i=0;i<6;i++){const a=i*TAU/6;ring('bronzeC',Math.cos(a)*R*.72,R*.95+(i%2?.3:-.3)*R,Math.sin(a)*R*.72,R*.16,.03,P('bronze'),0,PI/2-a,0,12);}});}
function lrVessel(x,y,z,h){W(x,y,z,0,()=>{lathe('lacq',0,0,[[.1,0],[.34,.08],[.4,h*.3],[.42,h*.62],[.34,h*.86],[.2,h],[0,h]],14,P('lacq'),{});for(const s of [-1,1])beam('lacq',[s*.3,.02,0],[s*.36,-.2,.1],.03,P('lacq'),true,5);
 for(let i=0;i<13;i++){const a=i*TAU/13,yy=h*(.55+.35*Math.sin(i*1.3));lzHorn(Math.cos(a)*.4,yy,Math.sin(a)*.4,Math.atan2(Math.cos(a),Math.sin(a)),.5,.03,{curl:.2,lean:PI/2-.6,mk:'horn',nt:5,ns:5});
  if(i%3===0)lzEye(Math.cos(a)*.43,yy-.25,Math.sin(a)*.43,Math.atan2(Math.cos(a),Math.sin(a)),.08,{mk:'bronze'});}});}
defBuilding({key:'lz-reliquary',name:'The reliquary',seed:7601,caste:'all',cut:true,w:46,d:40,h:28,budget:220000,
 tags:{types:['religious'],wealth:'rich',role:'reliquary'},
 note:'the older order\'s scale, dwarfing the village: a pointed mass of cyclopean basalt on a three-stepped platform with one axial stair, nested bronze portals seven deep at the mouth of the passage, lower wings with seven candle-spires each, verdigris lines converging on the apex, the breach repaired in cleaner stones on the east flank; inside, the dusty antechamber with the relics, the Xanadui footprints and the shut inner door',
 build(o){const PY=3.0;lzCutFloor(PY);
  /* the platform: three steps, the top 34 x 28; the stair up the front */
  lzNoCut(()=>{for(let i=0;i<3;i++){const w=40-i*3,d=34-i*3;prism('cyclo',[[-w/2,d/2],[w/2,d/2],[w/2,-d/2],[-w/2,-d/2]],i,i+1,P(i%2?'basalt':'basaltD'));}
   /* the stair: solid treads from the ground up, cutting through the three steps, from z = 22 to the top step's edge at z = 14 */
   for(let i=0;i<15;i++){const y=(i+1)*PY/15;box('stoneP',0,0,22-i*8/15-.27,7,y,.56,P('basaltD'));}
   for(const s of [-1,1])W(s*4.2,PY,13.2,0,()=>lzTwist(0,0,3.6,5,.9,.5,.09,{mk:'cyclo'}));
   /* the great stela at the mouth: the Coil and the fracture side by side */
   W(0,PY,0,0,()=>lzStela(-6.5,12.4,0,6.4,1.5,{glyphMk:'bronze',eye:true}));});
  /* the central mass: a battered body 16 x 22 leaning in hard on every face, then a steep stone gable to a ridge at 24 m */
  const bw=16,bd=22,bh=15,T=lzBatterRoom(bw,bd,PY,bh,'cyclo',P('basalt'),{lean:{front:.2,back:.14,left:.18,right:.18},inner:true,
   front:[{s:bw/2,w:lzDoorH(6)*1.55*.62,h:lzDoorH(6)*1.55,door:true}]});
  const rid=PY+bh+9;const gx=(T.xl+T.xr)/2;
  for(const s of [-1,1]){const x0=s>0?T.xr:T.xl;const pts=[[x0,PY+bh,T.zf],[x0,PY+bh,T.zb],[gx,rid,T.zb*.92],[gx,rid,T.zf*.92]];poly('cyclo',s>0?pts:pts.slice().reverse(),P('basalt'),false);
   /* the verdigris lines converging on the apex (the owner's reference): bronze strips laid up the slope */
   for(let k=0;k<5;k++){const t=(k+1)/6;const z0=lerp(T.zb,T.zf,t),z1=lerp(T.zb*.92,T.zf*.92,t);beam('bronzeC',[x0+s*.05,PY+bh,z0],[gx+s*.05,rid+.02,z1],.07,P('verd'),false,undefined,.14);}}
  for(const s of [-1,1]){const zz=s>0?T.zf:T.zb;poly('cyclo',s>0?[[T.xl,PY+bh,zz],[T.xr,PY+bh,zz],[gx,rid,zz*.92]]:[[T.xr,PY+bh,zz],[T.xl,PY+bh,zz],[gx,rid,zz*.92]],P('basalt'),false);}
  /* the gable's bronze lines on the front, converging on the apex; the spiral eye at the apex */
  lzNoCut(()=>{for(let k=0;k<7;k++){const t=(k+.5)/7;const x0=lerp(T.xl,T.xr,t);beam('bronzeC',[x0,PY+bh+.05,T.zf+.03],[gx,rid-.3,T.zf*.92+.03],.07,P('verd'),false,undefined,.14);}
   lzEye(gx,rid-1.6,T.zf*.92+.2,0,.9,{mk:'bronze'});
   /* the portal: the passage mouth, seven nested frames in bronze; the opening a dark triangle */
   const H=lzDoorH(6)*1.55;lzPortal(0,PY,bd/2+.1,0,H,{mk:'bronze',step:.5});
   /* the breach, repaired: a patch of cleaner stones on the east flank */
   W(T.xr*.7+bw/2*.3,PY+4,-2,PI/2,()=>{for(let i=0;i<9;i++)box('cyclo',rr(-2.2,2.2),rr(0,5),.05+.03*i,rr(1,1.8),rr(.7,1.1),.3,P('basaltC'),rr(-.2,.2));});
   /* the wings: lower battered blocks either side, seven candle-spires on each */
   for(const s of [-1,1]){W(s*11.5,PY,-2,0,()=>{const Tw=lzBatterRoom(10,16,0,8,'cyclo',P('basalt'),{lean:{front:.12,back:.1,left:.12,right:.12},inner:false});lzSlab(Tw.T,8,.6,'stoneP',P('basaltD'),.3);
     for(let i=0;i<7;i++){const t=(i+.5)/7;const x=lerp(Tw.xl,Tw.xr,t)*.9;cyl('stoneP',x,8.6,Tw.zf*.7,.22,2.4+(i===3?1.6:0),P('basaltD'),6,.5);sph('bronzeC',x,11.1+(i===3?1.6:0),Tw.zf*.7,.14,P('bronze'),1,7);}
     W(0,8.6,Tw.zb*.75,0,()=>lzLeiwen(7,1.2,{cell:.4,mk:'bronze',back:false}));});}});
  /* the antechamber: the floor of the mass, dust, the relics, the footprints, the inner door */
  box('earthR',0,PY,0,bw-1,.06,bd-1,P('earthP'));
  lrRings(-4.2,PY+1.2,-3);lrSphere(4.4,PY+1.1,-2.6,1.1);lrDodec(-3.8,PY+1,4.2,.9);lrVessel(4,PY,4,1.6);
  /* the guardians and the lamps of the antechamber, from the catalog's court set */
  for(const s of [-1,1]){FURNISH('lizardmen_court_statue',s*5.6,PY,-7.5,s>0?-PI/4:PI/4);FURNISH('lizardmen_court_candelabra',s*2.2,PY,-8.6,0);}
  /* the footprints: 400 years old, in the dust, leading in (toward the inner door) and not out */
  for(let i=0;i<13;i++){const z=bd/2-2-i*.72,x=(i%2?-.3:.3)+Math.sin(i*.7)*.4;box('earth',x,PY+.06,z,.14,.012,.32,P('earth'),.1*(i%2?1:-1));}
  /* the inner door: shut. Nested frames in black lacquer on the back wall, the opening solid */
  W(0,PY,-bd/2+.06*0+.2,0,()=>{const H=lzDoorH(6)*1.3,dw=H*.62;poly('stoneP',[[-dw/2,0,0],[dw/2,0,0],[0,H,0]],P('basaltD'),true);lzPortal(0,0,.1,0,H,{mk:'lacq',step:.08});});
  /* the dust falls upward, slowly, in still air: a particle layer over the antechamber's floor (lrDustBox, below) */
  lrDustBox(-6.5,PY+.2,-9,13,10.5,18);
  /* the distortion: a faint recursive shimmer growing toward the inner door, seven translucent nested triangles that
     converge on it (lrShim, below: additive, breathing with the clock) */
  {const H=lzDoorH(6)*1.3;for(let k=0;k<7;k++){const t=k/6,z=lerp(5.5,-bd/2+1.5,t),Hs=lerp(9.5,H*1.04,t),ws=Hs*.62*lerp(1.5,1,t);
   poly('lrShim',[[-ws/2,PY+.04,z],[ws/2,PY+.04,z],[0,PY+.04+Hs,z]],P('glowC').multiplyScalar(lerp(.4,1,t)),false);}}
  lzThreshold(0,bd/2+.5,0,4);}});
/* ---------------------------------------------------------------- the antechamber's air (browser side: the only motion in the reliquary)
   The dust: a THREE.Points layer (after 93-anim.js's smoke) over each box a builder records with lrDustBox; every mote climbs
   its box's height in about a minute and starts again at the floor, drifting a hand's width sideways. The shimmer: a translucent
   additive material whose alpha breathes with ANIMU.uTime along the depth of the room (the screens drawn above). ?t= pins both. */
const LR_DUST={boxes:[],world:null,built:null,pts:null,N:110};
function lrDustBox(x,y,z,w,h,d){if(GTARGET!==GB)return;if(LR_DUST.world!==WORLD){LR_DUST.boxes=[];LR_DUST.world=WORLD;}
 const p=new THREE.Vector3(x+w/2,y,z+d/2).applyMatrix4(CM);LR_DUST.boxes.push({x:p.x-w/2,y:p.y,z:p.z-d/2,w,h,d});}
const LR_DUSTTEX=(()=>{const c=document.createElement('canvas');c.width=c.height=32;const g=c.getContext('2d');const gr=g.createRadialGradient(16,16,0,16,16,16);
 gr.addColorStop(0,'rgba(236,228,206,.9)');gr.addColorStop(.5,'rgba(236,228,206,.35)');gr.addColorStop(1,'rgba(236,228,206,0)');g.fillStyle=gr;g.fillRect(0,0,32,32);return new THREE.CanvasTexture(c);})();
const LR_DUSTMAT=new THREE.PointsMaterial({size:.16,map:LR_DUSTTEX,transparent:true,depthWrite:false,opacity:.8,sizeAttenuation:true,color:0xd8ccb0});
FRAME_HOOKS.push(dt=>{const D=LR_DUST;if(!D.boxes.length||!D.world)return;
 if(D.built!==D.world){if(D.pts){if(D.pts.parent)D.pts.parent.remove(D.pts);D.pts.geometry.dispose();}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(new Float32Array(D.boxes.length*D.N*3),3));
  D.pts=new THREE.Points(g,LR_DUSTMAT);D.pts.frustumCulled=false;D.pts.userData.probeSkip=true;D.pts.raycast=()=>{};D.world.add(D.pts);D.built=D.world;}
 const a=D.pts.geometry.attributes.position.array,t=ANIMU.uTime.value;let k=0;
 for(let i=0;i<D.boxes.length;i++){const b=D.boxes[i];for(let j=0;j<D.N;j++){const h1=h3(i,j,2),h2=h3(i,j,3),ph=(t*(.014+.008*h3(i,j,5))+h3(i,j,4))%1;
  a[k++]=b.x+b.w*h1+.12*Math.sin(t*.31+j*1.3);a[k++]=b.y+b.h*ph;a[k++]=b.z+b.d*h2+.12*Math.cos(t*.27+j*2.1);}}
 D.pts.geometry.attributes.position.needsUpdate=true;});
MAT.lrShim=new THREE.MeshBasicMaterial({vertexColors:true,transparent:true,opacity:.05,depthWrite:false,side:THREE.DoubleSide,blending:THREE.AdditiveBlending});MAT.lrShim.toneMapped=false;TILE.lrShim=1;
matHook(MAT.lrShim,'lrshim',sh=>{sh.uniforms.uTime=ANIMU.uTime;
 sh.vertexShader='varying vec3 vShW;\n'+sh.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvShW=(modelMatrix*vec4(transformed,1.)).xyz;');
 sh.fragmentShader='uniform float uTime;varying vec3 vShW;\n'+sh.fragmentShader.replace('#include <color_fragment>','#include <color_fragment>\n{float w=.55+.45*sin(uTime*.7-vShW.z*2.1+vShW.y*.6);float r=.6+.4*sin(uTime*.23+vShW.x*1.3+vShW.y*2.7);diffuseColor.a*=w*r;}');});
