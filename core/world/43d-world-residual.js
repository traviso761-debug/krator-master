// ================================================================= OPEN WORLD — 250 m drainage residual D (GRAPHICS-TERRAIN-PROPOSAL.md T2)
// [G data] Plain maths: no THREE, no DOM, no Math.random. Evaluates the signed 250 m stream-power drainage residual
// raster D(wx, wz) in [-400, +400] m by bicubic Catmull-Rom interpolation over world-aligned u16 rasters (step 800/65535
// = 0.012207 m), with optional boundary feathering when a single experimental world tile is mounted inside a larger
// region. Matched to <= 1e-6 by godot/tests/relief/wresidual.gd.
//
//   WRESIDUAL.init({ox, oz, wx0, wz0, cell, nx, nz, lo, hi, u16, coreBox, feather})
//   WRESIDUAL.reset()
//   WRESIDUAL.weight(x, z) -> 0..1       coverage weight at local (x, z)
//   WRESIDUAL.at(x, z, minWave) -> m     signed residual height D in metres
//   WRESIDUAL.grad(x, z, out) -> [gx,gz] analytic Catmull-Rom gradient (dD/dx, dD/dz)
var WRESIDUAL=(function(){'use strict';
const R={version:1,active:false};
let OX=0,OZ=0,WX0=0,WZ0=0,CELL=250,NX=0,NZ=0,LO=-400,HI=400,DATA=null;
let CX0=0,CZ0=0,CX1=0,CZ1=0,FEATHER=0;
const clamp=(v,a,b)=>v<a?a:v>b?b:v;
const smooth=(a,b,x)=>{let t=(x-a)/(b-a);t=t<0?0:t>1?1:t;return t*t*(3-2*t);};
function cr(p0,p1,p2,p3,t){return p1+.5*t*(p2-p0+t*(2*p0-5*p1+4*p2-p3+t*(3*(p1-p2)+p3-p0)));}
function crd(p0,p1,p2,p3,t){return .5*((p2-p0)+t*(2*(2*p0-5*p1+4*p2-p3)+3*t*(3*(p1-p2)+p3-p0)));}

R.reset=function(){R.active=false;DATA=null;NX=0;NZ=0;return R;};

R.init=function(o){
 if(!o){R.reset();return R;}
 OX=o.ox==null?0:o.ox;
 OZ=o.oz==null?0:o.oz;
 WX0=o.wx0==null?0:o.wx0;
 WZ0=o.wz0==null?0:o.wz0;
 CELL=o.cell==null?250:o.cell;
 NX=o.nx==null?0:o.nx;
 NZ=o.nz==null?0:o.nz;
 LO=o.lo==null?-400:o.lo;
 HI=o.hi==null?400:o.hi;
 FEATHER=o.feather==null?0:o.feather;
 const cb=o.coreBox;
 if(cb&&cb.length===4){CX0=cb[0];CZ0=cb[1];CX1=cb[2];CZ1=cb[3];}
 else{CX0=WX0+CELL;CZ0=WZ0+CELL;CX1=WX0+(NX-2)*CELL;CZ1=WZ0+(NZ-2)*CELL;}
 if(o.f64&&o.f64.length===NX*NZ){DATA=o.f64;}
 else if(o.u16&&o.u16.length===NX*NZ){
  const sc=(HI-LO)/65535;DATA=new Float64Array(NX*NZ);
  for(let k=0;k<NX*NZ;k++)DATA[k]=LO+o.u16[k]*sc;
 }else if(typeof o.u16_b64==='string'&&NX>0&&NZ>0){
  const bin=typeof atob==='function'?atob(o.u16_b64):Buffer.from(o.u16_b64,'base64').toString('binary');
  const sc=(HI-LO)/65535;DATA=new Float64Array(NX*NZ);
  for(let k=0;k<NX*NZ;k++){const q=bin.charCodeAt(2*k)|(bin.charCodeAt(2*k+1)<<8);DATA[k]=LO+q*sc;}
 }else{DATA=null;}
 R.active=!!(DATA&&NX>=4&&NZ>=4);
 return R;
};

R.weight=function(x,z){
 if(!R.active)return 0;
 const wx=x+OX,wz=z+OZ;
 if(wx<=CX0||wx>=CX1||wz<=CZ0||wz>=CZ1)return 0;
 if(!(FEATHER>0))return 1;
 const d=Math.min(wx-CX0,CX1-wx,wz-CZ0,CZ1-wz);
 return d>=FEATHER?1:smooth(0,FEATHER,d);
};

function rawAt(wx,wz){
 let u=(wx-WX0)/CELL,v=(wz-WZ0)/CELL;
 u=clamp(u,1,NX-2.0001);v=clamp(v,1,NZ-2.0001);
 const i=Math.floor(u),j=Math.floor(v),fu=u-i,fv=v-j;
 const row=k=>{const o=(j+k)*NX+i;return cr(DATA[o-1],DATA[o],DATA[o+1],DATA[o+2],fu);};
 return cr(row(-1),row(0),row(1),row(2),fv);
}

R.at=function(x,z,minWave){
 if(!R.active)return 0;
 const mw=minWave==null?0:minWave;
 if(mw>=3200)return 0;
 const w=R.weight(x,z);
 if(!(w>0))return 0;
 const lod=mw<=1200?1:1-smooth(1200,3200,mw);
 return w*lod*rawAt(x+OX,z+OZ);
};

R.grad=function(x,z,out){
 out=out||[0,0];
 if(!R.active){out[0]=0;out[1]=0;return out;}
 const w=R.weight(x,z);
 if(!(w>0)){out[0]=0;out[1]=0;return out;}
 let u=(x+OX-WX0)/CELL,v=(z+OZ-WZ0)/CELL;
 u=clamp(u,1,NX-2.0001);v=clamp(v,1,NZ-2.0001);
 const i=Math.floor(u),j=Math.floor(v),fu=u-i,fv=v-j;
 const r0=k=>{const o=(j+k)*NX+i;return cr(DATA[o-1],DATA[o],DATA[o+1],DATA[o+2],fu);};
 const rd=k=>{const o=(j+k)*NX+i;return crd(DATA[o-1],DATA[o],DATA[o+1],DATA[o+2],fu);};
 const gx=cr(rd(-1),rd(0),rd(1),rd(2),fv)/CELL;
 const gz=crd(r0(-1),r0(0),r0(1),r0(2),fv)/CELL;
 out[0]=w*gx;out[1]=w*gz;
 return out;
};

return R;})();
if(typeof module!=='undefined')module.exports=WRESIDUAL;
