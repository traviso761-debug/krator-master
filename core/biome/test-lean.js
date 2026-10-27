// node core/biome/test-lean.js — the lean toward the giant (39-core-lean.js), each check with a negative.
// ehighlands' EHIGH.setGiant and EHIGH.toward are read IN PLACE (biomes/ehighlands/src/50-biome-ehigh-species.js) and must
// give what BIO.GIANT and BIO.leanTo give, so the kit moves onto core without moving a plant. The shared sky's giant
// (core/atmos/sky/89-atmos-e-skymodel.js) is compared with the canon 66 at ehighlands' site and printed (README.md, "Lean").
'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm');
const REPO=path.join(__dirname,'..','..'),read=f=>fs.readFileSync(path.join(REPO,f),'utf8');
let bad=0;const ok=(name,pass,neg)=>{const r=pass&&!neg;if(!r)bad++;console.log((r?'PASS  ':'FAIL  ')+name+(neg?' (its negative passed)':''));};
const ctx={console,Math};vm.createContext(ctx);
vm.runInContext(read('core/rand/08-core-rand.js'),ctx);
vm.runInContext(read('core/biome/10-core-head.js'),ctx);
vm.runInContext(read('core/biome/39-core-lean.js'),ctx);
const {BIO,KRAND}=ctx,D=Math.PI/180,near=(a,b,e)=>a.every((v,i)=>Math.abs(v-b[i])<(e||1e-12)),len=v=>Math.hypot(v[0],v[1],v[2]);
// ehighlands' own lines, lifted from its fragment by name and run on a stand-in rr that replays the same numbers
const src=read('biomes/ehighlands/src/50-biome-ehigh-species.js');
const grab=re=>{const m=src.match(re);if(!m)throw new Error('ehighlands: not found '+re);return m[0];};
const eh=grab(/EHIGH\.setGiant=function[\s\S]*?EHIGH\.GIANT_YAW=[^\n]*\n/)+grab(/EHIGH\.setGiant\(66\);/)+'\n'+grab(/EHIGH\.toward=function[^\n]*/);
const E={},us=[];let ui=0;const rr=(a,b)=>a+(b-a)*us[ui++];
new Function('EHIGH','rr',eh)(E,rr);
ok('the default giant is ehighlands\': azimuth 66, the same vector and yaw',BIO.GIANT_AZ===66&&BIO.GIANT[0]===E.GIANT[0]&&BIO.GIANT[1]===E.GIANT[1]&&BIO.GIANT_YAW===E.GIANT_YAW,BIO.GIANT[1]>0);
ok('it is north-east: east of north, north of east (x east, z south)',BIO.GIANT[0]>0&&BIO.GIANT[1]<0&&BIO.GIANT[0]>-BIO.GIANT[1],false);
// leanTo from up is EHIGH.toward, bit for bit, over a spread of tilts and scatters (u from KRAND, as a kit would draw it)
let diff=0;for(let i=0;i<2000;i++){const a=KRAND.unit(KRAND.hash(9,i,1))*.9,j=i%3?KRAND.unit(KRAND.hash(9,i,2))*.6:null,u=KRAND.unit(KRAND.hash(9,i,3));
  us.length=0;ui=0;us.push(u);const e=E.toward(a,j);const b=BIO.leanTo(null,a,{jit:j==null?.25:j,u});if(e[0]!==b[0]||e[1]!==b[1]||e[2]!==b[2])diff++;}
ok('leanTo(null, k, {jit, u}) is EHIGH.toward(k, jit), bit for bit (2000 stems)',diff===0,false);
us.length=0;ui=0;us.push(.9);ok('a different scatter number is seen by that comparison',true,(()=>{const e=E.toward(.4,.25),b=BIO.leanTo(null,.4,{jit:.25,u:.1});return e[0]===b[0]&&e[2]===b[2];})());
// the geometry
const up=BIO.leanTo(null,.3),gen=BIO.leanTo([0,1,0],.3);
ok('from up, the general path agrees with the closed form',near(up,gen,1e-14),false);
ok('a lean is a unit vector tilted by k toward the giant',Math.abs(len(up)-1)<1e-14&&Math.abs(Math.acos(up[1])-.3)<1e-12&&Math.abs(BIO.leanOf(up)-.3)<1e-12,BIO.leanOf(up)<0);
ok('k < 0 leans away',BIO.leanOf(BIO.leanTo(null,-.3))<0&&Math.abs(BIO.leanOf(BIO.leanTo(null,-.3))+.3)<1e-12,BIO.leanOf(BIO.leanTo(null,-.3))>0);
ok('k = 0 leaves a stem as it is (0 is a value)',near(BIO.leanTo(null,0),[0,1,0])&&near(BIO.leanTo([.6,.8,0],0),[.6,.8,0]),false);
const side=[0,0,1];const sideL=BIO.leanTo(side,.2);
ok('a stem already leaning keeps its length and turns about the ground axis square to the giant',Math.abs(len(sideL)-1)<1e-14&&!near(sideL,side,1e-6),near(sideL,side,1e-6));
const ax=[BIO.GIANT[1],0,-BIO.GIANT[0]],along=BIO.leanTo(ax,.7);
ok('a stem along that axis does not move',near(along,ax,1e-14),false);
ok('toward overrides the bearing',BIO.leanOf(BIO.leanTo(null,.3,{toward:[0,1]}),[0,1])>.29,BIO.leanOf(BIO.leanTo(null,.3,{toward:[0,1]}))>.29);
// the quaternion: it turns +y into leanTo(null, k)
const q=BIO.leanQ(.45,{jit:.2,u:.3}),[qx,qy,qz,qw]=q,rot=v=>{const tx=2*(qy*v[2]-qz*v[1]),ty=2*(qz*v[0]-qx*v[2]),tz=2*(qx*v[1]-qy*v[0]);
  return[v[0]+qw*tx+(qy*tz-qz*ty),v[1]+qw*ty+(qz*tx-qx*tz),v[2]+qw*tz+(qx*ty-qy*tx)];};
ok('leanQ turns +y into the lean',near(rot([0,1,0]),BIO.leanTo(null,.45,{jit:.2,u:.3}),1e-14)&&Math.abs(Math.hypot(...q)-1)<1e-14,near(rot([0,1,0]),[0,1,0],1e-3));
// setGiant / giantFromSky
BIO.setGiant(90);ok('setGiant(90) points east',near(BIO.GIANT,[1,0],1e-15),BIO.GIANT[1]<-.1);
const az=BIO.giantFromSky([Math.sin(120*D)*.8,.6,-Math.cos(120*D)*.8]);ok('giantFromSky reads the azimuth of a sky direction',Math.abs(az-120)<1e-9&&Math.abs(BIO.GIANT_AZ-120)<1e-9,Math.abs(az-60)<1e-9);
BIO.setGiant(66);
// the shared sky's giant at ehighlands' site (89-host-sky.js: px 839, py 542), by the hour over a day
const sky={console,Math};vm.createContext(sky);vm.runInContext('var ATMOS={};'+read('core/atmos/sky/89-atmos-e-skymodel.js')+'\nthis.ATMOS=ATMOS;',sky);
const A=sky.ATMOS,site=A.siteAt(839,542);let azs=[];for(let h=0;h<24;h++){const g=A.skyState(site,h,0).giantDir;azs.push(A.skyVec.altAz(g).az);}
const mean=azs.reduce((a,b)=>a+b)/azs.length,lo=Math.min(...azs),hi=Math.max(...azs),alt=A.skyVec.altAz(A.skyState(site,12,0).giantDir).alt;
console.log('INFO  the shared sky puts ehighlands\' giant at azimuth '+mean.toFixed(1)+' (a day\'s swing '+lo.toFixed(1)+'..'+hi.toFixed(1)+'), altitude '+alt.toFixed(1)+
  '; the canon BIO.GIANT is 66 ('+(66-mean).toFixed(1)+' degrees east of the sky\'s; README.md, "Lean toward the giant")');
ok('the sky\'s giant is in the north-east at ehighlands, within 10 degrees of the canon',Math.abs(mean-66)<10&&alt>0,false);
ok('giantFromSky on the sky\'s mean direction puts BIO.GIANT on it',Math.abs(BIO.giantFromSky(A.skyState(site,12,0).giantDir)-azs[12])<1e-9,false);
BIO.setGiant(66);
console.log(bad?bad+' FAILED':'all passed');process.exit(bad?1:0);
