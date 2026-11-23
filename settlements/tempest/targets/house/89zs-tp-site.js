// ================================================================= THE HOUSE OF THE TEMPEST — the site, as data (step 1)  [G data]
// The model's ground round the pin (gen/69t-tp-ground.js: the near grid at 20 m, the far square at 500 m, bicubic on the scale
// model), the House's place on it and the pad it stands on. Plain maths: the page's world (90q) draws this ground and the build
// (90r) stands the House on it.
//   The House: TEMPEST's plan (src/80t), its front (the Main Gate) turned to face east toward Strongwall (ry = pi/2: the plan's +z
//   to the page's +x, its +x to the page's -z, north), its middle on the pin. x east, z south, metres from the pin.
//   The pad: the ground under the House's lot levelled to one height (the median of the model's ground there), eased back to the
//   model's ground over TPS.EASE metres round it. The crest is flat (35 m a km at 2 km a pixel), so the cut and fill are small.
const tpD=(x,d)=>x==null?d:x;
function tpDec(o){const s=atob(o.b64),n=s.length>>1,a=new Float32Array(n);
 for(let i=0;i<n;i++){let v=s.charCodeAt(2*i)|(s.charCodeAt(2*i+1)<<8);if(v>32767)v-=65536;a[i]=o.base+v*o.unit;}return a;}
const TP_NEAR=tpDec(TP_GROUND.near),TP_FAR=tpDec(TP_GROUND.far);
function tpBil(G,a,x,z){const u=Math.min(G.nx-1.0001,Math.max(0,(x-G.x0)/G.step)),v=Math.min(G.nz-1.0001,Math.max(0,(z-G.z0)/G.step));
 const i=Math.floor(u),j=Math.floor(v),fu=u-i,fv=v-j,k=j*G.nx+i;return(a[k]*(1-fu)+a[k+1]*fu)*(1-fv)+(a[k+G.nx]*(1-fu)+a[k+G.nx+1]*fu)*fv;}
/* the model: the near grid inside its box, blended over its last 300 m into the far grid, the far grid beyond */
function tpModel(x,z){const N=TP_GROUND.near,f=tpBil(TP_GROUND.far,TP_FAR,x,z),e=Math.min(x-N.x0,N.x1-x,z-N.z0,N.z1-z);
 if(e<=0)return f;const n=tpBil(N,TP_NEAR,x,z);return e>=300?n:f+(n-f)*e/300;}
/* the House's place: its middle on the pin, its front east */
const TPS=(function(){const P=TP_PLAN,ry=Math.PI/2,cx=0,cz=0,EASE=60;
 const toPage=(lx,lz)=>[cx+lz,cz-lx];   /* ry = pi/2: x' = lz, z' = -lx */
 const xs=P.wards[0].poly.map(p=>p[0]),zs=P.wards[0].poly.map(p=>p[1]);
 const lx0=Math.min(...xs)-14,lx1=Math.max(...xs)+14,lz0=Math.min(...zs)-16,lz1=P.barbican.at[1]+P.barbican.d/2+4;   /* the outer curtain with its towers, the Storm Tower and the barbican */
 const a=toPage(lx0,lz0),b=toPage(lx1,lz1),box=[Math.min(a[0],b[0]),Math.min(a[1],b[1]),Math.max(a[0],b[0]),Math.max(a[1],b[1])];
 const S=[];for(let x=box[0];x<=box[2];x+=10)for(let z=box[1];z<=box[3];z+=10)S.push(tpModel(x,z));S.sort((p,q)=>p-q);
 const pad=Math.round(S[S.length>>1]*10)/10,cut=Math.round((S[S.length-1]-pad)*10)/10,fill=Math.round((pad-S[0])*10)/10;
 return{P,x:cx,z:cz,ry,box,pad,cut,fill,EASE,toPage,inner:P.inner.y};})();
/* how much of the pad is here: 1 on the lot (and 6 m round it), easing to 0 over TPS.EASE */
function tpPadW(x,z){const b=TPS.box,dx=Math.max(b[0]-6-x,0,x-b[2]-6),dz=Math.max(b[1]-6-z,0,z-b[3]-6),d=Math.hypot(dx,dz);
 if(d<=0)return 1;if(d>=TPS.EASE)return 0;const t=1-d/TPS.EASE;return t*t*(3-2*t);}
/* the ground as drawn: the model with the pad cut and filled into it */
function tpGround(x,z){const h=tpModel(x,z),w=tpPadW(x,z);return w?h+(TPS.pad-h)*w:h;}
terrainH=function(x,z){return tpGround(x,z);};
window._tempestSite={pin:{model:Math.round(tpModel(0,0)*10)/10,cell:TP_GROUND.cell},pad:TPS.pad,cut:TPS.cut,fill:TPS.fill,lot:[Math.round(TPS.box[2]-TPS.box[0]),Math.round(TPS.box[3]-TPS.box[1])]};
