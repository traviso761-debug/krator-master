// node core/terrain/test-relief-lava.js — tumuli and pressure ridges, and the rille over a tube (38b-core-relief-lava.js), each
// check with a negative.
'use strict';
const fs=require('fs'),path=require('path');
global.window=global;
eval(fs.readFileSync(path.join(__dirname,'..','rand','08-core-rand.js'),'utf8'));
eval(fs.readFileSync(path.join(__dirname,'38-core-relief.js'),'utf8'));
let bad=0;const ok=(name,pass,neg)=>{const r=!!pass&&!neg;if(!r)bad++;console.log((r?'PASS  ':'FAIL  ')+name+(neg?' (its negative passed)':''));};
const throws=f=>{try{f();return false;}catch(e){return true;}};
const R=KRELIEF;
// the old kinds' answers before and after: nothing may move
const g0=(x,z)=>100-.02*z+3*Math.sin(x/90),T=R.tube({pts:[[0,0],[200,40],[420,60],[640,30]],ground:g0,r:6,roof:5,seed:3}),pit=R.pit({c:[300,300],r:60,depth:20,ground:g0,seed:2});
const probe=()=>{const o=[];for(let i=0;i<60;i++){const x=i*11,z=(i*37)%400;o.push(R.shape(T,x,z,g0(x,z)),R.shape(pit,x,z,g0(x,z)),JSON.stringify(R.at(T,x,z,g0(x,z))));}return JSON.stringify(o)+R.kinds().join();};
const before=probe(),kinds0=R.kinds();
eval(fs.readFileSync(path.join(__dirname,'38b-core-relief-lava.js'),'utf8'));
ok('loaded, the old kinds answer exactly as before',probe()===before.replace(kinds0.join(),kinds0.concat(['tumulus','tuberille']).join()),false);
ok('kinds lists the two new ones',R.kinds().includes('tumulus')&&R.kinds().includes('tuberille'),false);

// ---- tumuli on a ponded lobe: a thick flat disc whose margin falls away
const nx=81,F={x0:0,z0:0,cell:10,nx,nz:nx,dh:new Float32Array(nx*nx)};
for(let j=0;j<nx;j++)for(let i=0;i<nx;i++){const r=Math.hypot(i-40,j-40)*10;F.dh[j*nx+i]=r<250?8:r<330?8*(330-r)/80:0;}
const U=R.tumuli({field:F,world:5});
const tum=U.filter(t=>t.form==='tumulus'),rid=U.filter(t=>t.form==='ridge');
ok('tumuli on the ponded floor, pressure ridges on its margin ('+tum.length+' and '+rid.length+')',tum.length>5&&rid.length>0&&tum.every(t=>Math.hypot(t.x-400,t.z-400)<255)&&rid.every(t=>{const r=Math.hypot(t.x-400,t.z-400);return r>240&&r<335;}),tum.some(t=>Math.hypot(t.x-400,t.z-400)>340));
ok('none where no lava lies',R.tumuli({field:{x0:0,z0:0,cell:10,nx:5,nz:5,dh:new Float32Array(25)},world:5}).length===0,false);
const rr=rid[0],ang=Math.atan2(rr.z-400,rr.x-400),dr=Math.abs(Math.cos(rr.ry-ang));
ok('a ridge runs along the margin, across the slope (|cos| '+dr.toFixed(2)+')',dr<.3,dr>.9);
const t0=tum[0],flat=()=>50,top=R.shape(t0,t0.x,t0.z,50),edge=R.shape(t0,t0.x+Math.cos(t0.ry)*t0.L*.49,t0.z+Math.sin(t0.ry)*t0.L*.49,50);
ok('a tumulus swells the ground, its crack splits the crest',top<50+t0.H&&top>=50+t0.H-t0.crack.d-1e-9&&R.at(t0,t0.x,t0.z,50).part==='crack'&&edge>50&&edge<50+t0.H*.2,top<=50);
const off=Math.max(t0.W*.3,t0.crack.w*1.2),side=R.shape(t0,t0.x-Math.sin(t0.ry)*off,t0.z+Math.cos(t0.ry)*off,50);
ok('beside the crack the crest stands higher than in it',side>top,false);
ok('outside it the ground is untouched',R.shape(t0,t0.x+t0.L,t0.z+t0.L,50)===50&&R.at(t0,t0.x+t0.L,t0.z+t0.L,50)===null,false);
const T2=R.tumuli({field:F,world:5,crack:false});ok('crack false: no crack',T2.every(t=>t.crack===null),false);
const tile=R.tumuli({field:Object.assign({},F),world:5}).filter(t=>t.x<200);ok('the same field and world, the same tumuli (by cell)',JSON.stringify(tile)===JSON.stringify(U.filter(t=>t.x<200)),false);
ok('another world, others',JSON.stringify(R.tumuli({field:F,world:6}))!==JSON.stringify(U),false);
ok('apply composes them with the old kinds',R.apply(flat,[t0])(t0.x,t0.z)===top,false);
ok('a bad field, size, or hand-placed tumulus throws',throws(()=>R.tumuli({field:{}}))&&throws(()=>R.tumuli({field:F,size:[5,1]}))&&throws(()=>R.tumulus({x:0,z:0,L:2,W:3,H:1}))&&throws(()=>R.tumulus({x:0,z:0,L:3,W:2,H:1,form:'blister'})),throws(()=>R.tumulus({x:0,z:0,L:3,W:2,H:1})));

// ---- the rille over a tube: the roof has worn thin in the middle (the ground dips over it)
const gd=(x,z)=>100-.02*z-14*Math.exp(-Math.pow((x-420)/90,2)),Tb=R.tube({pts:[[0,0],[200,40],[420,60],[640,30],[840,30]],ground:(x,z)=>100-.02*z,r:6,roof:5,seed:3,p:0});
const Rl=R.tubeRille(Tb,{ground:gd,id:'r1'});
ok('the fallen span is where the roof is thin ('+Rl.spans.map(S=>S.s0.toFixed(0)+'-'+S.s1.toFixed(0)).join(', ')+')',Rl.spans.length===1&&Rl.spans[0].s0>250&&Rl.spans[0].s1<600,Rl.spans.length===0);
const mid=Tb.pts[2],fy=mid.y,g=gd(mid.x,mid.z),cut=R.shape(Rl,mid.x,mid.z,g);
ok('in it the trench is cut to the tube\'s floor ('+cut.toFixed(2)+' over '+fy.toFixed(2)+')',Math.abs(cut-fy)<.05&&R.at(Rl,mid.x,mid.z,g).part==='floor',cut>g-1);
const nrm=(()=>{const a=Tb.pts[1],b=Tb.pts[3],L=Math.hypot(b.x-a.x,b.z-a.z);return [-(b.z-a.z)/L,(b.x-a.x)/L];})(),wx=mid.x+nrm[0]*Rl.w*.9,wz=mid.z+nrm[1]*Rl.w*.9;
ok('talus at the wall\'s foot, the rim outside it untouched',R.shape(Rl,wx,wz,gd(wx,wz))>fy+.1&&R.at(Rl,wx,wz,gd(wx,wz)).part==='talus'&&R.shape(Rl,mid.x+nrm[0]*(Rl.w+3),mid.z+nrm[1]*(Rl.w+3),55)===55,false);
const far=Tb.pts[0];ok('where the roof stands the ground is untouched',R.shape(Rl,far.x,far.z,gd(far.x,far.z))===gd(far.x,far.z)||Rl.skylights.length>0,false);
ok('walls recorded for the carve, one a side',Rl.walls.length===2&&Rl.walls.every(w=>w.depth>5&&w.overhang===.25),false);
const R2=R.tubeRille(Tb,{ground:(x,z)=>100-.02*z,spans:[[100,140]]});
ok('a span given by hand falls even under a thick roof',R2.spans.length===1&&R2.spans[0].s0<=100.5&&R2.spans[0].s1>=139,false);
const R3=R.tubeRille(Tb,{ground:(x,z)=>100-.02*z+(x>600?-7:0),skylight:{every:30,p:1,under:20}});
ok('skylights where the roof stands but thin, with KCAVERN openings ('+R3.skylights.length+')',R3.skylights.length>0&&R3.openings.length===R3.skylights.length&&R3.openings.every(o=>o.kind==='well'),false);
ok('a bad tube, ground or widen throws',throws(()=>R.tubeRille({kind:'pit'},{ground:gd}))&&throws(()=>R.tubeRille(Tb,{}))&&throws(()=>R.tubeRille(Tb,{ground:gd,widen:.5})),throws(()=>R.tubeRille(Tb,{ground:gd})));
eval(fs.readFileSync(path.join(__dirname,'38b-core-relief-lava.js'),'utf8'));
ok('loading it twice does not wrap twice',R.kinds().filter(k=>k==='tumulus').length===1,false);
console.log(bad?bad+' FAILED':'all passed');process.exit(bad?1:0);
