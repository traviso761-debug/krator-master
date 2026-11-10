// node core/atmos/test-radiation.js — the radiation glow (fx/89-atmos-fx-radiation.js): the chord integral against a numeric sum,
// its limits (1 through the heart, 0 at the limb, stopped by a wall), the point density, the heat raster for the shimmer pass,
// the chunk. Each check with a negative that must fail.
'use strict';
const fs=require('fs'),path=require('path');global.window=global;
const D=__dirname,files=['89-atmos-0-core.js','89-atmos-0p-presets.js','fx/89-atmos-fx-radiation.js'].map(f=>path.join(D,f));
eval(files.map(f=>fs.readFileSync(f,'utf8')).join('\n')+';global.ATMOS=ATMOS;');
const A=global.ATMOS;let bad=0;const ok=(n,p,neg)=>{const r=p&&!neg;if(!r)bad++;console.log((r?'PASS  ':'FAIL  ')+n+(neg?' (its negative passed)':''));};
const near=(a,b,e)=>Math.abs(a-b)<=(e==null?1e-9:e);
const Z={x:1000,y:20,z:-400,r:300,strength:.16,shimmer:.35};
const dir=(a,b)=>{const d=[b[0]-a[0],b[1]-a[1],b[2]-a[2]],l=Math.hypot(...d);return[d.map(v=>v/l),l];};
const num=(ro,rd,L)=>{let s=0;const n=40000;for(let i=0;i<n;i++){const t=L*(i+.5)/n,x=ro[0]+rd[0]*t-Z.x,y=ro[1]+rd[1]*t-Z.y,z=ro[2]+rd[2]*t-Z.z;s+=Math.max(0,1-(x*x+y*y+z*z)/(Z.r*Z.r))*L/n;}return s/(4/3*Z.r);};
{const ro=[0,20,-400],[rd]=dir(ro,[Z.x,Z.y,Z.z]);
 ok('a ray through the heart of a zone, seen from outside, sums to 1; one that misses it to 0',near(A.radChord(ro,rd,1e9,Z),1,1e-9)&&A.radChord(ro,[0,1,0],1e9,Z)===0,near(A.radChord(ro,[0,1,0],1e9,Z),1,.5));
 ok('...stopped at the centre (a wall there) it is half; stopped short of the zone, nothing',near(A.radChord(ro,rd,1000,Z),.5,1e-9)&&A.radChord(ro,rd,600,Z)===0,near(A.radChord(ro,rd,600,Z),.5,.2));
 let worst=0;for(const [P,L] of [[[1400,90,-300],2000],[[900,-40,-700],1100],[[1250,200,-380],5000],[[1000,20,-400],700]]){const [d]=dir(ro,P),a=A.radChord(ro,d,L,Z),b=num(ro,d,L);worst=Math.max(worst,Math.abs(a-b));}
 ok('the closed form is the numeric sum of the density along the ray (4 rays, within 1e-4)',worst<1e-4,worst===0&&false);
 const inside=[1000,20,-400],[di]=dir(inside,[1300,20,-400]);
 ok('from the centre looking out it is half; from inside, a near wall gives little (2% at 10 m of 300)',near(A.radChord(inside,di,1e9,Z),.5,1e-9)&&A.radChord(inside,di,10,Z)<.03&&A.radChord(inside,di,10,Z)>.02,A.radChord(inside,di,10,Z)>.2);
 const limb=[[0,20,-400+299],[0,20,-400+150]].map(p=>{const [d]=dir(p,[2000,20,p[2]]);return A.radChord(p,d,1e9,Z);});
 ok('it falls smoothly to nothing at the limb: '+limb[1].toFixed(3)+' at half the radius off-axis, '+limb[0].toExponential(1)+' at the edge',limb[1]>.3&&limb[1]<.8&&limb[0]<1e-3&&limb[0]>0,limb[0]>.1);}
ok('the glow is the strength times the chord, summed over the zones, never negative',(()=>{const ro=[0,20,-400],[rd]=dir(ro,[Z.x,Z.y,Z.z]),g=A.radGlow(ro,rd,1e9,[Z,Object.assign({},Z,{strength:.1})]);return near(g,.26,1e-9)&&A.radGlow(ro,[0,1,0],1e9,[Z])===0;})(),false);
{const ro=[0,20,-400],[rd]=dir(ro,[Z.x,Z.y,Z.z]);
 ok('the haze\'s strength: what lies behind a zone swims (.7 through the heart at shimmer .35), what stands in front of it holds still, a strong zone caps at 1',near(A.radHazeK(ro,rd,1e9,[Z]),.7,1e-9)&&A.radHazeK(ro,rd,600,[Z])===0&&A.radHazeK(ro,rd,1e9,[Object.assign({},Z,{shimmer:1})])===1&&A.radHazeK(ro,[0,1,0],1e9,[Z])===0,A.radHazeK(ro,rd,600,[Z])>0);}
{let lo=9,hi=0,d=0;for(let t=0;t<120;t+=.05){const p=A.radPulse(t,.15,0);lo=Math.min(lo,p);hi=Math.max(hi,p);d=Math.max(d,Math.abs(p-A.radPulse(t+.05,.15,0)));}
 ok('the pulse: the glow breathes within 15% either way ('+lo.toFixed(2)+'..'+hi.toFixed(2)+'), slowly (under 1% a twentieth of a second), zones out of step, pulse 0 steady',lo>=.85-1e-9&&hi<=1.15+1e-9&&hi-lo>.2&&d<.01&&Math.abs(A.radPulse(3,.15,0)-A.radPulse(3,.15,1))>.01&&A.radPulse(7,0,2)===1&&/atmRadK\[i\]\.z\*\(0\.65\*sin/.test(A.radGLSL()),hi-lo<.05);}
ok('the density at a point: 1 at the centre, 3/4 at half the radius, 0 at the edge and beyond',A.radAt([Z],1000,20,-400)===1&&near(A.radAt([Z],1150,20,-400),.75)&&A.radAt([Z],1300,20,-400)===0&&A.radAt([Z],5000,0,0)===0&&A.radAt([],0,0,0)===0,A.radAt([Z],1300,20,-400)>0);
{const F=A.radiationHeat([Z],{cell:10}),at=(x,z)=>F.T[Math.round((z-F.z0)/F.cell)*F.nx+Math.round((x-F.x0)/F.cell)];
 ok('the heat raster for the shimmer pass covers the zone: 70 degrees at its centre, 25 at its edge, '+F.nx+' x '+F.nz+' cells of 10 m',F.x0===700&&F.z0===-700&&F.nx===61&&F.nz===61&&near(at(1000,-400),70,1e-3)&&near(at(700,-400),25,1e-3)&&F.T.length===61*61,at(700,-400)>30);}
{const g=A.radGLSL();ok('the chunk: guarded, the chord in closed form (no loop but the four zones), the shimmer, the sum',/#ifndef ATM_RAD_CHUNK/.test(g)&&/float atmRadChord\(/.test(g)&&/float atmRadShim\(/.test(g)&&/vec3 atmRad\(vec3 ro,vec3 rd,float L\)/.test(g)&&(g.match(/for\(/g)||[]).length===2&&/float atmRadHazeK\(/.test(g)&&/min\(1\.0,k\*2\.0\)/.test(g)&&/atmRadZ\[4\]/.test(g),!/atmRadChord/.test(g));}
// the host against a small three.js stub: uniforms follow the zones, the master strength and the off switch
{class V4{constructor(){this.x=this.y=this.z=this.w=0;}set(x,y,z,w){this.x=x;this.y=y;this.z=z;this.w=w;return this;}}class V3{set(x,y,z){this.x=x;this.y=y;this.z=z;return this;}}
 class Obj{constructor(g,m){this.material=m;this.userData={};this.position=new V3();this.scale={setScalar:v=>{this.s=v;}};this.visible=true;}}
 const T={Vector4:V4,Vector3:V3,Vector2:V3,Color:class{},Group:class{constructor(){this.children=[];}add(o){this.children.push(o);}},Mesh:Obj,ShaderMaterial:class{constructor(o){Object.assign(this,o);}},SphereGeometry:class{},BackSide:1,AdditiveBlending:2};
 A.init({THREE:T,scene:{add(){}},camera:{position:{x:0,y:0,z:0}},hour:()=>12,onFrame:()=>{},ground:()=>0,seed:1});
 const R=A.radiation({zones:[Z,{x:0,z:0,r:100}]});
 ok('ATMOS.radiation: two zones in the uniforms with their defaults (strength .16, shimmer .35), two sky shells shown, a record',A.U.radZ.value[0].w===300&&A.U.radZ.value[1].w===100&&A.U.radZ.value[2].w===0&&near(A.U.radK.value[1].x,.16)&&near(A.U.radK.value[1].y,.35)&&near(A.U.radK.value[1].z,.15)&&near(A.U.radK.value[1].w,2.1)&&R.shells.length===4&&R.shells[0].visible&&R.shells[1].visible&&!R.shells[2].visible&&R.shells[0].s===300&&A.fx.some(r=>r.type==='radiation'&&r.zones.length===2),A.U.radZ.value[2].w>0);
 R.k=.5;R.set();const half=A.U.radK.value[0].x;R.off=true;R.set();
 ok('...the master strength scales it and the off switch clears it (no zone, no shell)',near(half,.08)&&A.U.radZ.value[0].w===0&&!R.shells[0].visible,A.U.radZ.value[0].w>0);
 ok('at most four zones are kept',A.radiation({zones:new Array(7).fill(Z)}).zones.length===4,false);}
console.log(bad?bad+' FAILED':'all passed');process.exit(bad?1:0);
