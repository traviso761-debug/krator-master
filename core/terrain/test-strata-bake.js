// node core/terrain/test-strata-bake.js — the varied contacts baked for the shaders (35d-core-strata-bake.js): the JS twin
// against V.yy within the bake's stated error, the clamp outside the box, identity with no contacts, a wrong bake caught, and
// the GLSL text run in core/water/glsl-interp.js against the twin (alone, and patched into the shared strata shader's text).
// Each check has a negative.
'use strict';
const fs=require('fs'),path=require('path');
global.window=global;
const rd=f=>fs.readFileSync(path.join(__dirname,f),'utf8');
eval(fs.readFileSync(path.join(__dirname,'..','rand','08-core-rand.js'),'utf8'));
eval(rd('35-core-strata.js'));eval(rd('35c-core-strata-vary.js'));
const {glslProgram}=require(path.join(__dirname,'..','water','glsl-interp.js'));
const K=KSTRATA;
let bad=0;const ok=(name,pass,neg)=>{const r=!!pass&&!neg;if(!r)bad++;console.log((r?'PASS  ':'FAIL  ')+name+(neg?' (its negative passed)':''));};
const throws=f=>{try{f();return false;}catch(e){return true;}};
let seed=12345;const rnd=()=>{seed=(Math.imul(seed,1103515245)+12345)>>>0;return seed/4294967296;};

// ---- loading it changes nothing
const S=K.create({seed:11,formations:[{recipe:'tibasalt',base:0,top:200},{recipe:'loess',base:200,top:320},{recipe:'outland-tuff',base:320,top:420}]});
const V=K.vary(S,{contacts:[{at:1,by:{noise:{amp:25,wl:420},plane:[.02,-.01]}},{at:2,by:{pts:[[100,-50,30],[-250,200,-20]],r:350}}]});
const snap=()=>{const o=[];for(let i=0;i<80;i++){const x=i*13-500,y=i*5,z=i*-7+200;o.push(S.yy(x,y,z),V.yy(x,y,z),V.contact(x,z,1));}return o.join('|');};
const before=snap();eval(rd('35d-core-strata-bake.js'));const fn=K.varyBake;eval(rd('35d-core-strata-bake.js'));
ok('loaded (twice), KSTRATA and KSTRATA.vary answer exactly as before; the second load is a no-op',snap()===before&&K.varyBake===fn,false);
const src=rd('35d-core-strata-bake.js').replace(/\/\/[^\n]*/g,'');
ok('the data side touches no THREE, DOM, Math.random, sin, cos, exp or pow',!/THREE\.|document\.|Math\.(random|sin|cos|exp|pow)\b/.test(src),!/Math\.(sin)\b/.test('Math.sin(1)'));

// the error of the twin against V.yy at a point: e times the local stretch (flat thickness over the varied one)
function stretch(Vv,x,z,yy){const fs=Vv.formations;let k=0;for(let i=0;i<fs.length;i++)if(fs[i].base<=yy)k=i;
  const th=Vv.thickness(x,z,k);return th>1e-9?(fs[k].top-fs[k].base)/th:Infinity;}
function agree(B,Vv,box,n,fac){let worst=0,seen=0,over=0;
  for(let i=0;i<n;i++){const x=box[0]+(box[2]-box[0])*rnd(),z=box[1]+(box[3]-box[1])*rnd(),y=-40+500*rnd(),yy=Vv.yy(x,y,z),r=stretch(Vv,x,z,yy);
    if(!(r<20))continue;seen++;const d=Math.abs(K.varyBakedYY(B,x,y,z)-yy),tol=fac*(B.err+B.q)*r+1e-6;worst=Math.max(worst,d/tol);if(d>tol)over++;}
  return {worst,seen,over,pass:over===0&&seen>n/2};}
const BOX=[-600,-500,600,500];

// ---- a plane and a constant: bilinear reproduces them, so the error is the 16-bit step
const Vp=K.vary(S,{contacts:[{at:1,by:{plane:[.03,.015],d:-4}},{at:3,by:{d:12}}]});
const Bp=K.varyBake(Vp,{box:BOX,step:25});
const ap=agree(Bp,Vp,BOX,1500,1);
ok('plane + constant: twin = V.yy within q x stretch (err '+Bp.err.toExponential(2)+' m, q '+Bp.q.toExponential(2)+' m, '+ap.seen+' points)',ap.pass&&Bp.err<=Bp.q,Bp.err>0.05);
ok('only the moved contacts get a channel (2 of 4); the rest are literals',Bp.nc===2&&Bp.ch[0]===-1&&Bp.ch[2]===-1&&Bp.ch[1]===0&&Bp.ch[3]===1&&Bp.bands===1&&Bp.H===Bp.nz,Bp.nc===4);

// ---- noise and bumps: the bilinear error, measured, and the bound holds at random points
const B=K.varyBake(V,{box:BOX,step:10});
const an=agree(B,V,BOX,3000,2);
ok('noise + bumps: twin = V.yy within 2 x (err + q) x stretch at '+an.seen+' random points (err '+B.err.toFixed(4)+' m, worst '+an.worst.toFixed(2)+' of the bound)',an.pass,false);
const Bc=K.varyBake(V,{box:BOX,step:80});
ok('a coarser step has a larger measured error ('+Bc.err.toFixed(3)+' m at 80 m against '+B.err.toFixed(4)+' m at 10 m)',Bc.err>4*B.err,Bc.err<=B.err);
ok('the bound is not slack: at 80 m the error at 10 m\'s tolerance fails',!agree(Bc,V,BOX,1500,2*(B.err+B.q)/(Bc.err+Bc.q)).pass,false);

// ---- the twin keeps V's pinch-outs: a contact pushed past the next
const Vx=K.vary(S,{contacts:[{at:1,by:{plane:[.4,0]}}]});
const Bx=K.varyBake(Vx,{box:BOX,step:20});
let mono=true;for(let i=0;i<200;i++){const x=BOX[0]+i*6,M=K.varyContacts(Bx,x,37);for(let k=1;k<M.length;k++)if(M[k]<M[k-1])mono=false;}
ok('pinched: the twin\'s contacts stay in order and the loess is gone where V says (thickness '+(K.varyContacts(Bx,500,0)[2]-K.varyContacts(Bx,500,0)[1]).toFixed(4)+')',
  mono&&Vx.thickness(500,0,1)===0&&Math.abs(K.varyContacts(Bx,500,0)[2]-K.varyContacts(Bx,500,0)[1])<=Bx.q&&agree(Bx,Vx,BOX,1500,2).pass,Vx.thickness(500,0,1)>0);
let mono2=true;{let p=-Infinity;for(let y=-60;y<480;y+=.37){const v=K.varyBakedYY(Bx,250,y,-80);if(v<p-1e-9)mono2=false;p=v;}}
ok('the baked remap is monotone in height',mono2,false);

// ---- a drape on the bake's own lattice: exact to q
const ground=(x,z)=>260+40*Math.sin(x/300)*Math.cos(z/250);
const Vd=K.vary(S,{contacts:[{at:1,by:K.drape(S,1,ground,{box:BOX,step:20,th:30,min:5})}]}),Bd=K.varyBake(Vd,{box:BOX,step:20});
ok('a drape baked on its own lattice: err '+Bd.err.toExponential(2)+' m (q '+Bd.q.toExponential(2)+')',Bd.err<=Bd.q&&agree(Bd,Vd,BOX,1500,1).pass,false);
const Bd2=K.varyBake(Vd,{box:[BOX[0]+7,BOX[1]+7,BOX[2],BOX[3]],step:20});
ok('the same drape off its lattice (shifted 7 m) has the interpolation error back (err '+Bd2.err.toFixed(3)+')',Bd2.err>10*Bd.err,false);

// ---- outside the box the contacts clamp to the edge
const v0=310;let clampOk=true,differs=false;
for(let i=0;i<40;i++){const z=-480+i*24;if(K.varyRemap(B,BOX[2]+300,z,v0)!==K.varyRemap(B,BOX[2],z,v0)||K.varyRemap(B,BOX[0]-1e4,z,v0)!==K.varyRemap(B,BOX[0],z,v0))clampOk=false;
  const x=BOX[2]+300,y=v0-S.yy(x,0,z);if(Math.abs(K.varyBakedYY(B,x,y,z)-V.yy(x,y,z))>.5)differs=true;}
{const c1=K.varyContacts(B,BOX[0]-50,BOX[1]-50),c2=K.varyContacts(B,BOX[0],BOX[1]);if(c1.join()!==c2.join())clampOk=false;}
ok('outside the box the bake reads the nearest edge (x past either end, a corner)',clampOk,!differs);

// ---- no contacts: identity
const V0=K.vary(S,{contacts:[]}),B0=K.varyBake(V0,{box:BOX,step:50});
let id=true;for(let i=0;i<300;i++){const x=-700+i*5,y=i*1.7-30,z=600-i*4;if(K.varyBakedYY(B0,x,y,z)!==S.yy(x,y,z))id=false;}
ok('no contacts: no channels, the twin is S.yy exactly and the GLSL is the identity',id&&B0.nc===0&&/return v;\}$/.test(K.varyGLSL(B0))&&K.varyGLSL(B0).indexOf('ksVOff')<0,
  K.varyGLSL(B).indexOf('ksVOff')<0);

// ---- a deliberately wrong bake fails the same check
const Bw=Object.assign({},B,{data:B.data.slice()});for(let t=0;t<Bw.data.length;t+=4*37)Bw.data[t]^=0x40;
Object.defineProperty(Bw,'stack',{value:S});
const Bs=Object.assign({},B,{x0:B.x0+B.step*2});Object.defineProperty(Bs,'stack',{value:S});
ok('corrupt bytes, or a box registered two cells off, fail the agreement check',!agree(Bw,V,BOX,1500,2).pass&&!agree(Bs,V,BOX,1500,2).pass,agree(B,V,BOX,500,2).pass===false);
ok('JSON-safe: B carries no functions, its stack is left out',JSON.stringify(B).indexOf('"stack"')<0&&Object.keys(B).every(k=>typeof B[k]!=='function'),false);
ok('bad input throws (no vary stack, no box, step 0, a box too fine for a texture)',throws(()=>K.varyBake(S,{box:BOX}))&&throws(()=>K.varyBake(V,{}))&&
  throws(()=>K.varyBake(V,{box:BOX,step:0}))&&throws(()=>K.varyBake(V,{box:[0,0,1e5,10],step:1})),false);

// ---- the GLSL, run as text, against the twin on the same bytes
function env(Bb){return {uKSVary:'vary',KSFETCH:(s,i,j,w,h)=>{if(s!=='vary')throw new Error('KSFETCH '+s);
  if(i!==Math.floor(i)||j!==Math.floor(j)||i<0||j<0||i>=Bb.W||j>=Bb.H||w!==Bb.W||h!==Bb.H)throw new Error('KSFETCH off the texture: '+i+','+j);
  const t=(j*Bb.W+i)*4;return [Bb.data[t]/255,Bb.data[t+1]/255,Bb.data[t+2]/255,Bb.data[t+3]/255];}};}
function glslAgrees(text,Bb,Bt){const P=glslProgram(text,env(Bb));let worst=0;
  for(let i=0;i<400;i++){const x=-900+1800*rnd(),z=-800+1600*rnd(),v=-80+580*rnd();worst=Math.max(worst,Math.abs(P.run('ksVaryYY',[x,z],v)-K.varyRemap(Bt,x,z,v)));}
  return worst;}
const g1=glslAgrees(K.varyGLSL(B),B,B),g2=glslAgrees(K.varyGLSL(Bx),Bx,Bx),g3=glslAgrees(K.varyGLSL(Bp),Bp,Bp);
const gNeg=glslAgrees(K.varyGLSL(Bc),Bc,B);
ok('the GLSL ksVaryYY equals the twin on the same bytes (worst '+Math.max(g1,g2,g3).toExponential(1)+' m over three bakes, in and out of the box)',Math.max(g1,g2,g3)<1e-9,gNeg<1e-3);
ok('the GLSL writes only float literals (no bare integers, no "--")',!/[^\w.]\d+[,;)]/.test(K.varyGLSL(B).replace(/^#.*$/gm,'').replace(/\d+\.\d+(e[-+]?\d+)?/g,'F'))&&K.varyGLSL(B).indexOf('--')<0,false);

// ---- the patch into the shared strata shader's text (host/35-core-strata-shade.js, loaded with no BIO: it only defines)
eval(fs.readFileSync(path.join(__dirname,'host','35-core-strata-shade.js'),'utf8'));
const G=K.GLSL,Pt=K.varyPatch(G,B);
ok('varyPatch: ksVaryYY before strataColor, the yy line rewritten, nothing else touched',Pt.indexOf('float ksVaryYY(')<Pt.indexOf('vec3 strataColor(')&&Pt.indexOf(K.VARY_ANCHOR)<0&&
  Pt.indexOf('ksVaryYY(wp.xz,ksV0)')>0&&Pt.replace(K.varyGLSL(B)+'\n','').replace(/float ksV0=ksYY\(wp,w1\),ksVd=ksVaryYY\(wp\.xz,ksV0\)-ksV0;float yy=ksV0\+ksVd\+wsh,wy=wp\.y\+ksVd\+wsh,/,K.VARY_ANCHOR)===G,
  !throws(()=>K.varyPatch('void main(){}',B)));
ok('patching twice throws (the anchor is gone), so a page cannot stack two bakes',throws(()=>K.varyPatch(Pt,B)),false);
ok('in the patched shader\'s full text, ksVaryYY still equals the twin',glslAgrees(Pt,B,B)<1e-9,false);
ok('varyKey differs between bakes and is stable for one',K.varyKey(B)===K.varyKey(B)&&K.varyKey(B)!==K.varyKey(Bc)&&/^[0-9a-f]{8}$/.test(K.varyKey(B)),false);

console.log(bad?bad+' FAILED':'all passed');process.exit(bad?1:0);
