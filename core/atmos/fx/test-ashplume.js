// node core/atmos/test-ashplume.js — a volcanic plume as a weather source (fx/89-atmos-fx-ashplume.js), each check with a negative.
// Plain data: no THREE, no page. core/rand for the far sprites' sources.
const fs=require('fs'),path=require('path'),ATM=path.join(__dirname,'..');
const FRAGS=['../shader/06-core-khook.js','../shader/06b-core-kcolor.js','../rand/08-core-rand.js'].concat(fs.readdirSync(ATM).filter(f=>/^89-atmos-.*\.js$/.test(f)).sort());
global.window=global;eval(FRAGS.map(f=>fs.readFileSync(path.join(ATM,f),'utf8')).join('\n')+';global.ATMOS=ATMOS;');
const A=ATMOS;
let bad=0;const ok=(name,pass,neg)=>{const r=pass&&!neg;if(!r)bad++;console.log((r?'PASS  ':'FAIL  ')+name+(neg?' (its negative passed)':''));};
const throws=f=>{try{f();return false;}catch(e){return true;}};
const SRC=fs.readFileSync(path.join(ATM,'fx','89-atmos-fx-ashplume.js'),'utf8');
ok('without the file there is no ashPlume (it is opt-in)',typeof A.ashPlume==='undefined',false);
eval(SRC);const first=A.ashPlume;eval(SRC);
ok('loading it twice is a no-op',A.ashPlume===first&&typeof A.ashPlumeLoad==='function',A.ashPlume!==first);
const E=Math.PI/2,S=Math.PI;   /* downwind bearings: east (+x), south (+z) */
const mk=(top,o)=>A.ashPlume(Object.assign({vents:[{id:'v',x:0,z:0,y:0,top}],azimuth:E,world:'firebliss'},o||{}));
const P=mk(2000);
// ---- the ash fall
const dn=P.under(10000,0),up=P.under(-10000,0),ac=P.under(0,10000),ac2=P.under(10000,3000);
ok('more ash downwind than upwind and across',dn>.5&&up===0&&ac<1e-6&&ac2<dn,up>=dn||ac>=dn);
ok('the lobe peaks U top / settle downwind (20 km) and is 0..1',Math.abs(P.under(20000,0)-1)<1e-9&&P.under(20000,0)>=P.under(15000,0)&&P.under(20000,0)>=P.under(25000,0),P.under(20000,0)>1);
ok('nothing past reach (30 km), something just inside it',P.under(30001,0)===0&&P.under(40000,0)===0&&P.under(29000,0)>0,P.under(30001,0)>0);
const cen=Q=>{let a=0,b=0;for(let s=0;s<=30000;s+=250){const u=Q.under(s,0);a+=u*s;b+=u;}return a/b;};
const lo=mk(1000),hi=mk(3000),cL=cen(lo),cH=cen(hi);
ok('a taller column lands its ash farther ('+Math.round(cL)+' m -> '+Math.round(cH)+' m)',cH>cL+3000&&hi.under(20000,0)>lo.under(20000,0)&&lo.under(4000,0)>hi.under(4000,0),cH<=cL);
ok('a slower settling (finer) ash lands farther',cen(mk(1000,{settle:.5}))>cL,cen(mk(1000,{settle:2}))>=cL);
// ---- turning the wind turns the footprint
const T=mk(2000,{azimuth:S});
ok('turning the azimuth turns the footprint (east -> south)',T.under(0,10000)>.5&&T.under(10000,0)<1e-6&&Math.abs(T.under(0,10000)-dn)<1e-9,T.under(10000,0)>=T.under(0,10000));
const N=mk(2000,{azimuth:0});ok('azimuth 0 is north (-z)',N.under(0,-10000)>.5&&N.under(0,10000)===0,N.under(0,10000)>0);
const Q=mk(2000);Q.aim(S);ok('P.aim turns it in place',Q.under(0,10000)===T.under(0,10000)&&Q.under(10000,0)===T.under(10000,0),Q.under(10000,0)>.1);
const Wv=A.ashPlume({vents:[{x:0,z:0,top:2000}],wind:[0,10]});ok('wind [vx, vz]: downwind its direction, its length the speed',Math.abs(Wv.under(0,10000)-dn)<1e-9,Wv.under(10000,0)>0);
/* 'atmos': each vent follows ATMOS.windAt (stand-in uniforms; ATMOS.init makes them on a page) */
const ow=A.windAt;A.U={wind:{value:{x:0,y:2}},gustAmp:{value:0},hour:{value:12}};A.windAt=()=>[0,2];
const At=A.ashPlume({vents:[{x:0,z:0,top:2000}],wind:'atmos'});const atS=At.under(0,10000);A.windAt=()=>[-2,0];At.update(5);
ok("wind 'atmos' follows ATMOS.windAt (x unit = 10 m/s), and update re-reads it",Math.abs(atS-dn)<1e-9&&At.under(-10000,0)>.5&&At.under(0,10000)<1e-6,At.under(0,10000)>.5);
A.windAt=ow;delete A.U;
ok("wind 'atmos' without ATMOS.init throws",throws(()=>A.ashPlume({vents:[{x:0,z:0,top:2000}],wind:'atmos'})),false);
// ---- the plume in the air
ok('the column rises from the vent, leaning (200 m downwind at half its height); the umbrella drifts at its top',P.fog(200,1000,0)>.9&&P.fog(0,1000,0)<P.fog(200,1000,0)&&P.fog(10000,2000,0)>.01&&P.fog(10000,2000,0)>10*P.fog(10000,2000,4000)&&P.fog(10000,200,0)<P.fog(10000,2000,0),P.fog(-10000,2000,0)>0);
ok('nothing upwind, nothing past reach',P.fog(-5000,2000,0)===0&&P.fog(31000,2000,0)===0,P.fog(-5000,2000,0)>0);
let dil=true;for(let s=3000;s<25000;s+=2000)if(P.fog(s+2000,2000,0)>P.fog(s,2000,0))dil=false;ok('the umbrella thins as it widens',dil,false);
// ---- the shade: a point 3 km north of the plume's axis, 10 km downwind; the plume 2 km up
const toward=[0,2000,3000],away=[0,2000,-3000],sh=P.shade(10000,-3000,toward),sa=P.shade(10000,-3000,away);
ok('shade with the sun behind the plume ('+sh.toFixed(2)+'), none with it on the other side ('+sa.toFixed(3)+')',sh>.3&&sa<.01,sa>=sh);
ok('right under it with the sun high the sun is mostly gone; far upwind not at all',P.shade(5000,0,[0,1,0])>.6&&P.shade(-20000,0,[0,1,0])===0&&P.shade(10000,0,{x:0,y:1,z:0})===P.shade(10000,0,[0,1,0]),P.shade(-20000,0,[0,1,0])>0);
ok('the sun down: no shade',P.shade(5000,0,[0,-1,0])===0,false);
// ---- the deposit
ok('the deposit: thickest at the vent, a lobe downwind, none upwind past the coarse fall',P.deposit(0,0)===1&&P.deposit(10000,0)>P.deposit(-10000,0)&&P.deposit(-10000,0)<.05&&P.deposit(15000,0)>.5,P.deposit(-10000,0)>=P.deposit(10000,0));
// ---- two vents, weighed by rate
const two=A.ashPlume({vents:[{x:0,z:0,top:2000,rate:400},{x:0,z:20000,top:2000,rate:100}],azimuth:E});
ok('two vents: each weighs rate / the largest',Math.abs(two.under(10000,0)-dn)<1e-9&&Math.abs(two.under(10000,20000)-.25*dn)<1e-9,two.under(10000,20000)===two.under(10000,0));
// ---- export and load: identical answers
const R=JSON.parse(JSON.stringify(two.export())),L=A.ashPlumeLoad(R);let same=true,cnt=0;
for(let x=-6000;x<=32000;x+=1900)for(let z=-5000;z<=25000;z+=2300){cnt++;
 if(L.under(x,z)!==two.under(x,z)||L.deposit(x,z)!==two.deposit(x,z)||L.fog(x,1500,z)!==two.fog(x,1500,z)||L.shade(x,z,[.3,.8,.2],0)!==two.shade(x,z,[.3,.8,.2],0))same=false;}
ok('export -> JSON -> ashPlumeLoad answers identically ('+cnt+' points x 4 fields)',same&&R.format==='krator-ashplume'&&R.vents.length===2,!same);
ok('a bad record will not load',throws(()=>A.ashPlumeLoad({format:'x'}))&&throws(()=>A.ashPlumeLoad(Object.assign({},R,{vents:[{x:0,z:0,top:1}]}))),throws(()=>A.ashPlumeLoad(R)));
// ---- KFAR.sprites' sources
const s1=P.sources(),s2=mk(2000).sources(),s3=mk(2000,{world:'godthrone'}).sources();
ok('sources are deterministic: the same plume the same list, another world another jitter',JSON.stringify(s1)===JSON.stringify(s2)&&JSON.stringify(s1)!==JSON.stringify(s3)&&s1.length===12,JSON.stringify(s1)!==JSON.stringify(s2));
let lagUp=true,downwind=true;for(let i=1;i<s1.length;i++){if(s1[i].lag<s1[i-1].lag)lagUp=false;if(s1[i].x<s1[i-1].x-1e-6)downwind=false;}
ok('the column first, then the drift downwind; the lag grows along it',lagUp&&downwind&&Math.abs(s1[0].x)<300&&s1[11].x>15000&&s1[11].size[0]>s1[0].size[0],!lagUp);
ok('each source has what KFAR.sprites reads',s1.every(q=>['x','z','y','r','n','alpha','lag'].every(k=>typeof q[k]==='number'&&isFinite(q[k]))&&q.size.length===2&&q.rise.length===2&&q.tint.length===3),false);
const KR=global.KRAND;delete global.KRAND;const noK=throws(()=>P.sources());global.KRAND=KR;ok('sources without core/rand throws',noK,false);
// ---- core/hazard
const got={},KH={provide:(f,fn)=>{got[f]=fn;}};P.provide(KH,{mg:120,weather:()=>.5});
ok("provide registers 'ash': mg x weather x the fall or the cloud",Math.abs(got.ash(20000,0,0,0)-60)<1e-9&&got.ash(-10000,0,0,0)===0&&got.ash(200,1000,0,0)>50,got.ash(-10000,0,0,0)>0);
ok('provide wants KHAZ',throws(()=>P.provide({})),false);
// ---- bad options
ok('no vents, a bad top, no azimuth or a calm wind vector throw',throws(()=>A.ashPlume({azimuth:0}))&&throws(()=>A.ashPlume({vents:[{x:0,z:0,top:0}],azimuth:0}))&&
 throws(()=>A.ashPlume({vents:[{x:0,z:0,top:100}]}))&&throws(()=>A.ashPlume({vents:[{x:0,z:0,top:100}],wind:[0,0]}))&&throws(()=>A.ashPlume({vents:[{x:0,z:0,top:100}],azimuth:0,reach:0})),
 throws(()=>A.ashPlume({vents:[{x:0,z:0,top:100}],azimuth:0})));
console.log(bad?bad+' FAILED':'all passed');process.exit(bad?1:0);
