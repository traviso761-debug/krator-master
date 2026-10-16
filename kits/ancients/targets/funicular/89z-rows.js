// TARGET: funicular — the rusted, broken remnants of a massive Ancient funicular (src/8ap-funicular.js),
// on a synthetic escarpment: a 400 m incline dropping 221 m from a plateau to the floor. It reviews the
// structure type Verge (settlements/verge) takes up at full size (1.7 km, 860 m). Nothing here is used by
// Verge: the ground function, the terrain and the views are this showcase's own.
const TITLE='The Funicular — remnants of an Ancient incline railway';
const GROUND_C=0;
const DECAYS=[1];
const ROWS={fun:{z:0,s:0,r:900}};
const RUINS=[[0,0,1]];                       // no green: a desert escarpment
// The track runs east (+x) from the upper station at x=-200 (deck 224) to the lower at x=+200 (deck 3).
// The ground is drawn along the line as a profile the incline cuts into at the lip, flies over on piers
// down the face (5-37 m), and meets on an embankment at the foot; off the line it is rougher, and the
// escarpment tapers to the floor at the edges of the patch.
const FUNT={seed:1,A:[-200,224,0],B:[200,3,0],rec:null,
 prof:[[-9,222],[0,222],[.05,217],[.12,192],[.2,165],[.3,128],[.4,98],[.5,80],[.6,66],[.7,52],[.8,38],[.88,24],[.95,11],[1,1.5],[1.1,.5],[9,.3]]};
function funtProf(t){const P=FUNT.prof;for(let i=0;i+1<P.length;i++){const a=P[i],b=P[i+1];
  if(t<=b[0]){const u=(t-a[0])/(b[0]-a[0]),w=u*u*(3-2*u);return a[1]+(b[1]-a[1])*w;}}return .3;}
function funtGround(x,z){const az=Math.abs(z), near=clamp((az-14)/60,0,1);
 // the face bends back away from the line, so the incline climbs a shallow gully
 const t=(x+200-near*.12*Math.min(az,300))/400;
 let y=funtProf(t)+(fbm(x/70,z/70,3.3,3)-.5)*(3+16*near)+(fbm(x/14,z/14,8.1,2)-.5)*(.6+3*near);
 const m=Math.min(clamp((680-az)/220,0,1),clamp((x+760)/200,0,1));
 const fl=.35+(fbm(x/90,z/90,1.7,2)-.5)*.5;
 return fl+(Math.max(y,fl)-fl)*m*m*(3-2*m);}
function funtTerrain(rec,parent){const X0=-760,X1=640,Z=680,nu=280,nv=150,P=[],C=[],I=[];
 const zOf=v=>{const w=2*v-1;return Z*(.85*w*w*w+.15*w);};
 for(let j=0;j<=nv;j++)for(let i=0;i<=nu;i++){const x=X0+(X1-X0)*i/nu, z=zOf(j/nv), g=funtGround(x,z), y=FUNICULAR.carveY(rec,x,z,g);
  P.push(x,y,z);const n=fbm(x/9,z/9,4.4,2), h=clamp(y/220,0,1);
  C.push(.40+n*.16-h*.03,.24+n*.10-h*.02,.15+n*.06);}
 for(let j=0;j<nv;j++)for(let i=0;i<nu;i++){const a=j*(nu+1)+i,b=a+1,c=a+nu+1,d=c+1;I.push(a,c,b,b,c,d);}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));
 g.setAttribute('color',new THREE.Float32BufferAttribute(C,3));g.setIndex(I);g.computeVertexNormals();
 // steep faces read as rock: darken and redden by slope
 const N=g.attributes.normal, Cc=g.attributes.color;
 for(let k=0;k<N.count;k++){const s=clamp((.92-N.getY(k))*2.2,0,1);Cc.setXYZ(k,Cc.getX(k)*(1-.35*s),Cc.getY(k)*(1-.5*s),Cc.getZ(k)*(1-.5*s));}
 // world UVs (one tile = 24 m) for a grit map, so the slope has a grain at walking distance
 const U=[];for(let k=0;k<P.length;k+=3)U.push(P[k]/24,(P[k+2]+P[k+1]*.6)/24);
 g.setAttribute('uv',new THREE.Float32BufferAttribute(U,2));
 const m=mesh(g,new THREE.MeshStandardMaterial({map:FUNT_GRIT,vertexColors:true,roughness:1,metalness:0}),parent);m.userData.probeSkip=true;return m;}
const FUNT_GRIT=canvasTex(256,256,(g,w,h)=>{
 const id=g.createImageData(w,h),px=id.data;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4, v=200+(fbm(x/26,y/26,2.2,3)-.5)*70+(fbm(x/4,y/4,6.6,1)-.5)*50;
  px[i]=v;px[i+1]=v-6;px[i+2]=v-14;px[i+3]=255;}
 g.putImageData(id,0,0);});
function funtSite(scene,gx,gz,d){const G=new THREE.Group();scene.add(G);
 const rec=FUNICULAR.plan({a:FUNT.A,b:FUNT.B,ground:funtGround,seed:FUNT.seed,width:12,pierStep:30});
 FUNT.rec=rec;window._fun=rec;
 const k0=TSTAT.cur;TSTAT.cur='funGround/1';try{funtTerrain(rec,G);}finally{TSTAT.cur=k0;}
 FUNICULAR.draw(rec,G);
 return G;}
const EXTRA_BUILDERS={fun:funtSite};
