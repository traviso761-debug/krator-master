// ================================================================= THE BEACON - the site, as data (PLAN.md section 1; the build's step 1)  [G data]
// The model's ground round the pin sbeacon00001 (gen/69wb-bc-ground.js: the near grid at 20 m, the far square at 500 m, bicubic
// on the scale model with the restored knoll), and the house's levels on it, from the layout (src/30-bc-layout.js, read in place
// as 89b0): the fort on the knoll's crown, the precinct on the saddle 12 m below, the lamp ward rising between them
// (BEACON_LAYOUT.ground). The page's x is the layout's v (east) and its z is u (south), metres from the pin, the lamp at 0,0.
//   The crown: the median of the model's ground under the fort's lot (BC.F); every level of the house is BC.F plus the layout's
//   profile, over the house's lot (its walls and the fort's towers, 6 m round), eased back to the model over BC.EASE metres.
const bcD=(x,d)=>x==null?d:x;
function bcDec(o){const s=atob(o.b64),n=s.length>>1,a=new Float32Array(n);
 for(let i=0;i<n;i++){let v=s.charCodeAt(2*i)|(s.charCodeAt(2*i+1)<<8);if(v>32767)v-=65536;a[i]=o.base+v*o.unit;}return a;}
const BC_NEAR=bcDec(BC_GROUND.near),BC_FAR=bcDec(BC_GROUND.far);
function bcBil(G,a,x,z){const u=Math.min(G.nx-1.0001,Math.max(0,(x-G.x0)/G.step)),v=Math.min(G.nz-1.0001,Math.max(0,(z-G.z0)/G.step));
 const i=Math.floor(u),j=Math.floor(v),fu=u-i,fv=v-j,k=j*G.nx+i;return(a[k]*(1-fu)+a[k+1]*fu)*(1-fv)+(a[k+G.nx]*(1-fu)+a[k+G.nx+1]*fu)*fv;}
/* the model: the near grid inside its box, blended over its last 300 m into the far grid, the far grid beyond */
function bcModel(x,z){const N=BC_GROUND.near,f=bcBil(BC_GROUND.far,BC_FAR,x,z),e=Math.min(x-N.x0,N.x1-x,z-N.z0,N.z1-z);
 if(e<=0)return f;const n=bcBil(N,BC_NEAR,x,z);return e>=300?n:f+(n-f)*e/300;}
const BC=(function(){const L=BEACON_LAYOUT,W=L.fort.ward,EASE=45;
 /* the house's lot: the precinct, the lamp ward and the fort with its towers, 6 m round */
 const lot=[-246-6,22+6,-60-6,60+6];
 /* the crown: the median of the model under the fort's ward and towers */
 const S=[];for(let u=W[0]-4;u<=W[1]+4;u+=4)for(let v=W[2]-4;v<=W[3]+4;v+=4)S.push(bcModel(v,u));S.sort((a,b)=>a-b);
 const F=Math.round(S[S.length>>1]*10)/10;
 const prof=u=>{const G=L.ground;if(u<=G[0][0])return G[0][1];for(let i=0;i+1<G.length;i++){const a=G[i],b=G[i+1];if(u<=b[0])return a[1]+(b[1]-a[1])*(u-a[0])/(b[0]-a[0]);}return G[G.length-1][1];};
 return{L,F,lot,EASE,prof,level:u=>F+prof(u),toPage:(u,v)=>[v,u]};})();
/* how much of the house's levels is here: 1 on the lot, easing to 0 over BC.EASE */
function bcPadW(x,z){const b=BC.lot,dx=Math.max(b[2]-x,0,x-b[3]),dz=Math.max(b[0]-z,0,z-b[1]),d=Math.hypot(dx,dz);
 if(d<=0)return 1;if(d>=BC.EASE)return 0;const t=1-d/BC.EASE;return t*t*(3-2*t);}
/* the ground as drawn: the model with the house's levels cut and filled into it */
function bcGround(x,z){const h=bcModel(x,z),w=bcPadW(x,z);if(!w)return h;const lv=BC.level(Math.max(BC.lot[0],Math.min(BC.lot[1],z)));return h+(lv-h)*w;}
terrainH=function(x,z){return bcGround(x,z);};
window._beaconSite={pin:{model:Math.round(bcModel(0,0)*10)/10,cell:BC_GROUND.cell,patched:BC_GROUND.patched},crown:BC.F,
 cut:Math.round((Math.max(...[[0,-200],[0,0],[40,-120],[-40,-120]].map(p=>bcModel(p[0],p[1])-bcGround(p[0],p[1]))))*10)/10,
 fill:Math.round((Math.max(...[[0,-200],[0,0],[40,-120],[-40,-120]].map(p=>bcGround(p[0],p[1])-bcModel(p[0],p[1]))))*10)/10};
