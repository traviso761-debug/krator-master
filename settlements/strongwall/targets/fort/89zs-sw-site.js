// ================================================================= STRONGWALL — the site, as data (PLAN.md section 3, S1)  [G data]
// The model's ground round the pin (gen/69w-sw-ground.js: the near grid at 20 m, the far square at 500 m, bicubic on the scale
// model), the fort's place on it and the pad the fort stands on. Plain maths: the page's world (90q) draws this ground and the
// build (90r) stands the fort on it.
//   The fort: XFORT's march plan (kits/xanadu/src/80f-xa-fort-data.js), turned so its front (the Qiblai Gate) faces north down the
//   bench and its back (the gorge wall, the Gold Gate, the water gate) stands at the pin, the mouth of Kruk Gill's gorge, with the
//   scarp rising behind it. x east, z south, metres from the pin.
//   The pad: the ground under the fort's lot levelled to one height (the median of the model's ground there), eased back to the
//   model's ground over SW.EASE metres round it: the cut on the scarp side, the fill toward the bench.
const swD=(x,d)=>x==null?d:x;
function swDec(o){const s=atob(o.b64),n=s.length>>1,a=new Float32Array(n);
 for(let i=0;i<n;i++){let v=s.charCodeAt(2*i)|(s.charCodeAt(2*i+1)<<8);if(v>32767)v-=65536;a[i]=o.base+v*o.unit;}return a;}
const SW_NEAR=swDec(SW_GROUND.near),SW_FAR=swDec(SW_GROUND.far);
function swBil(G,a,x,z){const u=Math.min(G.nx-1.0001,Math.max(0,(x-G.x0)/G.step)),v=Math.min(G.nz-1.0001,Math.max(0,(z-G.z0)/G.step));
 const i=Math.floor(u),j=Math.floor(v),fu=u-i,fv=v-j,k=j*G.nx+i;return(a[k]*(1-fu)+a[k+1]*fu)*(1-fv)+(a[k+G.nx]*(1-fu)+a[k+G.nx+1]*fu)*fv;}
/* the model: the near grid inside its box, blended over its last 300 m into the far grid, the far grid beyond */
function swModel(x,z){const N=SW_GROUND.near,f=swBil(SW_GROUND.far,SW_FAR,x,z),e=Math.min(x-N.x0,N.x1-x,z-N.z0,N.z1-z);
 if(e<=0)return f;const n=swBil(N,SW_NEAR,x,z);return e>=300?n:f+(n-f)*e/300;}
/* the fort's place: its plan, turned half round (ry = pi: the plan's +z, the Qiblai Gate, faces north), the gorge wall's line on
   the pin's row and its middle on the pin's column */
const SW=(function(){const P=XFORT.plan({size:'march'}),gw=P.curtains.find(c=>c.id==='gorge.w'),ge=P.curtains.find(c=>c.id==='gorge.e');
 const gx=(gw.b[0]+ge.a[0])/2,gz=gw.a[1],ry=Math.PI;
 /* the page's point of a plan point: (cx - lx, cz - lz) for ry = pi */
 const cx=gx,cz=gz,W=P.w+12,D=P.d+12,EASE=45;
 const box=[cx-W/2,cz-D/2,cx+W/2,cz+D/2];
 const S=[];for(let x=box[0];x<=box[2];x+=10)for(let z=box[1];z<=box[3];z+=10)S.push(swModel(x,z));S.sort((a,b)=>a-b);
 const pad=Math.round(S[S.length>>1]*10)/10,cut=Math.round((S[S.length-1]-pad)*10)/10,fill=Math.round((pad-S[0])*10)/10;
 return{P,key:'xa_fort_march',x:cx,z:cz,ry,W,D,box,pad,cut,fill,EASE,seed:20261116,
  toPage:(lx,lz)=>[cx-lx,cz-lz]};})();
/* how much of the pad is here: 1 on the lot (and 6 m round it), easing to 0 over SW.EASE */
function swPadW(x,z){const b=SW.box,dx=Math.max(b[0]-6-x,0,x-b[2]-6),dz=Math.max(b[1]-6-z,0,z-b[3]-6),d=Math.hypot(dx,dz);
 if(d<=0)return 1;if(d>=SW.EASE)return 0;const t=1-d/SW.EASE;return t*t*(3-2*t);}
/* the ground as drawn: the model with the pad cut and filled into it */
function swGround(x,z){const h=swModel(x,z),w=swPadW(x,z);return w?h+(SW.pad-h)*w:h;}
terrainH=function(x,z){return swGround(x,z);};
window._strongwallSite={pin:{model:Math.round(swModel(0,0)*10)/10,cell:SW_GROUND.cell},pad:SW.pad,cut:SW.cut,fill:SW.fill,fort:[Math.round(SW.x),Math.round(SW.z)],lot:[SW.W,SW.D]};
