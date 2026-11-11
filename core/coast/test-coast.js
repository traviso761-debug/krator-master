// core/coast: node test (core/coast/PLAN.md section 6). `node core/coast/test-coast.js` prints 'all passed';
// --write rewrites golden.json after a meant change.
// A synthetic body: a 60 km square at 500 m texels whose water is a staircase of 4 km cells (the scale model's pixel
// coast) with a one-cell island; the land gentle and soft in the south, steep and hard in the north.
const fs=require('fs'),path=require('path');
require(path.join(__dirname,'..','rand','08-core-rand.js'));
require(path.join(__dirname,'..','mask','25-core-mask.js'));require(path.join(__dirname,'..','mask','27-core-mask-distance.js'));
require(path.join(__dirname,'30-core-coast.js'));
const KC=globalThis.KCOAST,KR=globalThis.KRAND;
let fails=0;const ok=(c,name,detail)=>{console.log((c?'  PASS  ':'  FAIL  ')+name+(detail?' : '+detail:''));if(!c)fails++;};
const neg=(c,name,detail)=>{console.log((c?'  PASS  negative ':'  MISSED negative ')+name+(detail?' : '+detail:''));if(!c)fails++;};

const NX=120,CELL=500,X0=-30000,Z0=-30000,LV=0;
const cellWater=(I,J)=>(I+J<7)&&!(I===1&&J===2);   // 4 km cells (8 texels): a diagonal staircase and a one-cell island
const data=new Uint8Array(NX*NX);for(let j=0;j<NX;j++)for(let i=0;i<NX;i++)data[j*NX+i]=cellWater(i>>3,j>>3)?255:0;
const MASK={x0:X0,z0:Z0,cell:CELL,cellZ:CELL,nx:NX,nz:NX,data};
// the land: the staircase's own distance (cells), gentle (1 %) in the south, steep (15 %) in the north
const north=(x,z)=>(x+18000)/4000<0?0:(x+18000)/4000>1?1:(x+18000)/4000;   // 0..1: the eastern half of the diagonal coast is steep and hard (eased over 4 km)
function stairD(x,z){const u=(x-X0)/4000,v=(z-Z0)/4000;return (u+v-7)*4000/Math.SQRT2;}
function bare(x,z){const d=stairD(x,z),ix=x-(X0+6000),iz=z-(Z0+10000),isl=24*Math.max(0,1-Math.hypot(ix,iz)/2600);return d*(.01+.14*north(x,z))-2+isl;}
function detail(x,z){return bare(x,z)+(KR.vnoise(x/600,.5,z/600,7)-.5)*6;}
const sample={bare,rock:(x,z)=>.15+.75*north(x,z),wet:()=>.8,temp:()=>22};
const C=KC.build({id:0,level:LV,mask:MASK,seed:1234,sample});

// ---- order-free
{const s=KR.stream(99),pts=[];for(let k=0;k<2000;k++)pts.push([s.range(-25000,25000),s.range(-25000,25000)]);
 const a=pts.map(p=>KC.shape(C,p[0],p[1],detail(p[0],p[1]),0));
 const idx=pts.map((p,i)=>i);for(let i=idx.length-1;i>0;i--){const j=s.int(0,i);[idx[i],idx[j]]=[idx[j],idx[i]];}
 const b=new Array(pts.length);for(const i of idx)b[i]=KC.shape(C,pts[i][0],pts[i][1],detail(pts[i][0],pts[i][1]),0);
 const r=pts.slice().reverse().map(p=>KC.shape(C,p[0],p[1],detail(p[0],p[1]),0)).reverse();
 let bad=0;for(let i=0;i<pts.length;i++)if(a[i]!==b[i]||a[i]!==r[i])bad++;
 ok(bad===0,'order-free: the shape at 2000 points is the same in order, shuffled and reversed',bad+' differ');}

// ---- natural: the share of the shoreline's length within 5 degrees of the grid's axes (marching squares at 100 m)
function axisShare(cf,x0,z0,x1,z1,st){let tot=0,ax=0;const nx=Math.round((x1-x0)/st),nz=Math.round((z1-z0)/st),V=new Float64Array((nx+1)*(nz+1));
 for(let j=0;j<=nz;j++)for(let i=0;i<=nx;i++)V[j*(nx+1)+i]=cf(x0+i*st,z0+j*st);
 const lerpP=(a,b,va,vb)=>[a[0]+(b[0]-a[0])*va/(va-vb),a[1]+(b[1]-a[1])*va/(va-vb)];
 for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const p=[[i,j],[i+1,j],[i+1,j+1],[i,j+1]],v=p.map(q=>V[q[1]*(nx+1)+q[0]]),cr=[];
  for(let e=0;e<4;e++){const a=v[e],b=v[(e+1)%4];if((a<0)!==(b<0))cr.push(lerpP(p[e],p[(e+1)%4],a,b));}
  for(let k=0;k+1<cr.length;k+=2){const dx=cr[k+1][0]-cr[k][0],dz=cr[k+1][1]-cr[k][1],L=Math.hypot(dx,dz);if(L<1e-9)continue;
   let ang=Math.abs(Math.atan2(dz,dx))*180/Math.PI%90;ang=Math.min(ang,90-ang);tot+=L;if(ang<5)ax+=L;}}
 return tot?ax/tot:1;}
{const A={cls:new Float32Array(5)};
 const raw=axisShare((x,z)=>{const i=Math.floor((x-X0)/CELL),j=Math.floor((z-Z0)/CELL);return data[j*NX+i]>=128?-1:1;},-20000,-20000,20000,20000,137);
 const now=axisShare((x,z)=>KC.at(C,x,z,0,A).c,-20000,-20000,20000,20000,100);
 const off=KC.build({id:0,level:LV,mask:MASK,seed:1234,sample,opts:{sig:1,warp:{a1:0,l1:7000,a2:0,l2:2300,k:[0,0,0,0,0]},fine:{a1:0,l1:300,a2:0,l2:60,k:[0,0,0,0,0]}}});
 const offS=axisShare((x,z)=>KC.at(off,x,z,0,A).c,-20000,-20000,20000,20000,100);
 ok(raw>.95,'natural: the mask\'s own edge runs on the grid\'s axes',(raw*100).toFixed(1)+' %');
 ok(now<.25,'natural: the coast field\'s shoreline runs on the axes for under 25 % of its length',(now*100).toFixed(1)+' %');
 neg(offS>.8,'(no blur, no warp) the shoreline stays on the axes',(offS*100).toFixed(1)+' %');}

// ---- sign-safe, and the mask consistent
const NM=KC.mask(C);
function maskAt(G,x,z){let u=(x-G.x0)/G.cell-.5,v=(z-G.z0)/G.cellZ-.5;if(u<-.5||v<-.5||u>G.nx-.5||v>G.nz-.5)return 0;u=Math.min(Math.max(u,0),G.nx-1.0001);v=Math.min(Math.max(v,0),G.nz-1.0001);
 const i=Math.floor(u),j=Math.floor(v),fu=u-i,fv=v-j,o=j*G.nx+i,d=G.data;return((d[o]*(1-fu)+d[o+1]*fu)*(1-fv)+(d[o+G.nx]*(1-fu)+d[o+G.nx+1]*fu)*fv)/255;}
function signCheck(Co){const A={cls:new Float32Array(5)},s=KR.stream(7);let n=0,bad=0;
 for(let k=0;k<20000;k++){const x=s.range(-26000,26000),z=s.range(-26000,26000),a=KC.at(Co,x,z,0,A);if(!a.band||Math.abs(a.c)<1)continue;
  if(a.c>=Co.P.band.lift||a.c<=-Co.P.band.water*.7)continue;n++;const h=KC.shape(Co,x,z,detail(x,z),0);if((h>LV)!==(a.c>0))bad++;}
 return{n,bad};}
{const r=signCheck(C);ok(r.bad===0&&r.n>500,'sign-safe: in the band the ground is over the level exactly where c > 0',r.bad+' of '+r.n+' points disagree');
 const off=KC.build({id:0,level:LV,mask:MASK,seed:1234,sample,opts:{sign:false}}),r2=signCheck(off);
 neg(r2.bad>0,'(the sign rule off) points disagree',r2.bad+' of '+r2.n);}
function maskCheck(G){const s=KR.stream(11);let wetOut=0,n=0,edgeLow=0,ne=0;
 for(let k=0;k<30000;k++){const x=s.range(-26000,26000),z=s.range(-26000,26000),h=KC.shape(C,x,z,detail(x,z),0),m=maskAt(G,x,z);
  if(h<LV){n++;if(m<=.5)wetOut++;}
  if(Math.abs(m-.5)<.08){ne++;if(h<=LV)edgeLow++;}}
 return{wetOut,n,edgeLow,ne};}
{const r=maskCheck(NM);ok(r.wetOut===0&&r.edgeLow===0&&r.n>1000,'mask consistent: every point under the level is in the new mask, and its edge lies on dry ground',
  r.wetOut+' of '+r.n+' wet points outside, '+r.edgeLow+' of '+r.ne+' edge points under the level');
 const r2=maskCheck(MASK);neg(r2.wetOut+r2.edgeLow>0,'(the old mask)',r2.wetOut+' wet points outside, '+r2.edgeLow+' edge points under the level');}

// ---- continuous: no step along 50 lines across the coast: every 1 m interval that changes more than 0.5 m is bisected
// to 1 mm, and a jump still over 0.2 m there is a step (a cliff's face is steep, not a step)
function stepCheck(f){const s=KR.stream(5);let worst=0;
 for(let L=0;L<50;L++){const a=s.range(0,Math.PI),x0=s.range(-26000,-6000),z0=-32000-x0+s.range(-1500,1500),cx=Math.cos(a),sz=Math.sin(a),g=t=>f(x0+t*cx,z0+t*sz);
  let prev=g(-2500);for(let t=-2499;t<=2500;t+=1){const v=g(t);if(Math.abs(v-prev)>.5){let lo=t-1,hi=t,vl=prev,vh=v;
    for(let b=0;b<10;b++){const m=(lo+hi)/2,vm=g(m);if(Math.abs(vm-vl)>Math.abs(vh-vm)){hi=m;vh=vm;}else{lo=m;vl=vm;}}
    const d=Math.abs(vh-vl);if(d>worst){worst=d;if(process.env.DBG){const A={cls:new Float32Array(5)},xa=x0+lo*cx,za=z0+lo*sz,xb=x0+hi*cx,zb=z0+hi*sz;console.log('step',d.toFixed(2),'at',xa.toFixed(1),za.toFixed(1),'h',vl.toFixed(2),vh.toFixed(2),'c',KC.at(C,xa,za,0,A).c.toFixed(2),KC.at(C,xb,zb,0,A).c.toFixed(2),'band',A.band,'detail',detail(xa,za).toFixed(2));}}}prev=v;}}
 return worst;}
{const f=(x,z)=>KC.shape(C,x,z,detail(x,z),0);const w=stepCheck(f);ok(w<.2,'continuous: no step (over 0.2 m in 1 mm) along 50 lines across the coast','worst '+w.toFixed(3)+' m');
 const w2=stepCheck((x,z)=>f(x,z)+(x>-5000?3:0));neg(w2>2,'(a 3 m step put in)','worst '+w2.toFixed(2)+' m');}

// ---- the classes
{const o=new Float32Array(5),cl=(r,h,e,w,t,s)=>{KC.classify(r,h,e,w,t,!!s,o);return Array.from(o);},top=a=>KC.CLASSES[a.indexOf(Math.max(...a))];
 const cases=[['cliff',cl(80,.9,.5,.5,15)],['marsh',cl(1,.1,.1,.9,25)],['shingle',cl(6,.1,.6,.3,0)],['sand',cl(2,.1,.4,.3,25)],['rock',cl(12,.9,.7,.4,15)],['marsh',cl(1,.1,.9,.1,30,true)]];
 for(const [want,a] of cases){const sum=a.reduce((s,v)=>s+v,0);ok(top(a)===want&&Math.abs(sum-1)<1e-6,'classes: '+want,a.map(v=>v.toFixed(2)).join(' '));}
 const st=KC.stats(C);ok(st.classes.cliff>.15&&st.classes.sand+st.classes.marsh>.15,'classes on the body: cliffs in the steep hard north, beach or marsh in the gentle south',JSON.stringify(st.classes));}

// ---- the fields
{const F={};KC.fields(C,-18000,-18000+0,F);const keys=KC.FIELDS.every(k=>k in F);ok(keys,'fields: '+KC.FIELDS.join(', '),'');}

// ---- golden
{const g={field:KC.hash(C),mask:(()=>{let h=0x811C9DC5>>>0;for(const b of NM.data){h^=b;h=Math.imul(h,0x01000193)>>>0;}return('0000000'+h.toString(16)).slice(-8);})()};
 const fn=path.join(__dirname,'golden.json');
 if(process.argv.includes('--write')){fs.writeFileSync(fn,JSON.stringify(g,null,1)+'\n');console.log('  wrote golden.json',JSON.stringify(g));}
 else{const o=fs.existsSync(fn)?JSON.parse(fs.readFileSync(fn,'utf8')):null;ok(o&&o.field===g.field&&o.mask===g.mask,'golden: the field and the mask hash as golden.json',JSON.stringify(g));}}
console.log('build '+C.ms+' ms; '+JSON.stringify(KC.stats(C)));
console.log(fails?fails+' FAILED':'all passed');process.exit(fails?1:0);
