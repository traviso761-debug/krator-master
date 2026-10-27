// ================================================================= HOST — stage: the renderer, the lights, the stand-in ground
// The page's frame is the layout's: world x = u (downstream), world z = v (the right bank, +z), y = y (the rim at 0).
// SPAN_FRAME is what SPAN.toWorld takes; the station's page will hand its own (the canyon turned onto Pan Riba's course).
//
// THE GROUND is a stand-in: SPAN.groundAt (31-span-rules.js), the layout's own section (the benches, the bay, the slot, the
// head, the lake's bed, the cuts), meshed on a grid whose rows fall on the walls' break lines so the benches stand sheer.
// It is replaced by the swhighlands station's carve (core/terrain: KRELIEF.rille and pit, KSTRATA pillar, KCARVE) when that
// lands (PLAN.md section 5); nothing else on the page reads it but through SPAN.groundAt.
const SPAN_FRAME={x:0,z:0,ang:0,y0:0};
const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setSize(innerWidth,innerHeight);
renderer.outputEncoding=THREE.sRGBEncoding;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;document.body.appendChild(renderer.domElement);
const scene=new THREE.Scene();scene.fog=new THREE.FogExp2(0xb9c4c4,.00012);
const camera=new THREE.PerspectiveCamera(50,innerWidth/innerHeight,.5,40000);
const hemi=new THREE.HemisphereLight(0xd6e2e4,0x5a4a3c,.62);scene.add(hemi);
const sun=new THREE.DirectionalLight(0xfff0d8,1.3);sun.position.set(-3000,4200,-1800);scene.add(sun);
const fill=new THREE.DirectionalLight(0xbfd2ff,.25);fill.position.set(2000,1500,2600);scene.add(fill);
// the kit's night switch (kits/ancients 92-camera.js); its salvage fires read it each frame. No night state here yet.
let NIGHT=false;

const SPAN_GROUND=(function(){const L=SPAN_LAYOUT,U0=-2700,U1=1300,V0=-850,V1=850,DU=6,DV=8;
 const us=[];for(let u=U0;u<=U1;u+=DU)us.push(u);
 // the rows: a regular grid plus a pair either side of every wall line, so a bench's face is sheer, not a 8 m ramp
 const vs=new Set();for(let v=V0;v<=V1;v+=DV)vs.add(v);
 Object.keys(L.half).forEach(k=>{const h=L.half[k];[h,-h].forEach(b=>{vs.add(b-.02);vs.add(b+.02);});});
 L.cuts.forEach(c=>{[c.box[2],c.box[3]].forEach(b=>{vs.add(b-.02);vs.add(b+.02);});});
 const V=[...vs].sort((a,b)=>a-b),nu=us.length,nv=V.length,P=new Float32Array(nu*nv*3),C=new Float32Array(nu*nv*3);
 for(let j=0;j<nv;j++)for(let i=0;i<nu;i++){const u=us[i],v=V[j],w=SPAN.toWorld(SPAN_FRAME,u,v,SPAN.groundAt(L,u,v)),k=(j*nu+i)*3;P[k]=w[0];P[k+1]=w[1];P[k+2]=w[2];}
 const I=[];for(let j=0;j<nv-1;j++)for(let i=0;i<nu-1;i++){const a=j*nu+i,b=a+1,c=a+nu,d=c+1;I.push(a,c,b,b,c,d);}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(P,3));g.setIndex(I);g.computeVertexNormals();
 // the colours: the tableland's turf, the pillar sandstone's red and bleached beds on the faces (a bed every ~14 m,
 // wandering by KRAND's noise), moss on the benches, sand and scrub on the floors, the lake's mud
 const N=g.attributes.normal;
 for(let k=0;k<nu*nv;k++){const x=P[k*3],y=P[k*3+1],z=P[k*3+2],ny=N.getY(k),n=KRAND.fbm(x/60,y/40,z/60,3,2820),
  lake=SPAN.inPoly(L.lake.pts,x,z)&&y<L.lake.level+.5;let r,gg,b;
  if(lake){r=.33;gg=.30;b=.25;}
  else if(ny>.82){if(y>-1){r=.40+.08*n;gg=.47+.06*n;b=.27;}else if(y>-140){r=.36+.06*n;gg=.42+.05*n;b=.28;}else{r=.55+.06*n;gg=.47+.05*n;b=.36;}}
  else{const bed=Math.floor((y+n*9)/14)&1;r=bed?.86:.64;gg=bed?.80:.31;b=bed?.72:.25;const s=.88+.18*n;r*=s;gg*=s;b*=s;}
  C[k*3]=Math.pow(r,2.2);C[k*3+1]=Math.pow(gg,2.2);C[k*3+2]=Math.pow(b,2.2);}   /* the colours above are sRGB; vertex colours are linear */
 g.setAttribute('color',new THREE.BufferAttribute(C,3));
 const m=new THREE.Mesh(g,new THREE.MeshStandardMaterial({vertexColors:true,roughness:1,metalness:0}));m.userData.probeSkip=true;m.userData.ground=true;scene.add(m);
 return m;})();
