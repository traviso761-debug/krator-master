// node core/atmos/fx/test-slopewind.js — cold-air, katabatic, anabatic and gap wind (fx/89-atmos-fx-slopewind.js), each check with a
// negative. Plain data: no THREE, no page; ATMOS's own windAt is driven by stand-in uniforms for attach and detach.
const fs=require('fs'),path=require('path'),ATM=path.join(__dirname,'..');
const FRAGS=['../shader/06-core-khook.js','../shader/06b-core-kcolor.js'].concat(fs.readdirSync(ATM).filter(f=>/^89-atmos-.*\.js$/.test(f)).sort());
global.window=global;eval(FRAGS.map(f=>fs.readFileSync(path.join(ATM,f),'utf8')).join('\n')+';global.ATMOS=ATMOS;');
const A=ATMOS;
let bad=0;const ok=(name,pass,neg)=>{const r=pass&&!neg;if(!r)bad++;console.log((r?'PASS  ':'FAIL  ')+name+(neg?' (its negative passed)':''));};
const throws=f=>{try{f();return false;}catch(e){return true;}};
const SRC=fs.readFileSync(path.join(ATM,'fx','89-atmos-fx-slopewind.js'),'utf8');
ok('without the file there is no slopeWind (it is opt-in)',typeof A.slopeWind==='undefined',false);
eval(SRC);const first=A.slopeWind;eval(SRC);
ok('loading it twice is a no-op',A.slopeWind===first&&typeof A.slopeWindLoad==='function',A.slopeWind!==first);
const BOX=[-1200,-1200,1200,1200];
// ---- a cone: 500 m high, slope 0.5 (27 degrees: past `full`, so the whole wind)
const cone=(x,z)=>Math.max(0,500-.5*Math.hypot(x,z)),C=A.slopeWind({ground:cone,box:BOX,cell:20,world:'cone'});
const n=C.windAt(400,0,23),d=C.windAt(400,0,13);
ok('by night the air runs down the cone (outward), by day up it (inward)',n[0]>3.9&&Math.abs(n[1])<1e-6&&d[0]<-2.4&&Math.abs(d[1])<1e-6,n[0]<0||d[0]>0);
ok('night 4 m/s, day 2.5 m/s at full slope: the day the weaker',Math.abs(n[0]-4)<.05&&Math.abs(d[0]+2.5)<.05&&Math.abs(d[0])<Math.abs(n[0]),false);
const nz=C.windAt(0,-400,23);ok('every side drains outward (north side runs north)',nz[1]<-3.9&&Math.abs(nz[0])<1e-6,nz[1]>0);
ok('in the lull between (dusk at 18, mid morning at 8.5) there is none',C.windAt(400,0,18)[0]===0&&C.windAt(400,0,8.5)[0]===0,C.windAt(400,0,23)[0]===0);
const S5=A.slopeWind({ground:(x,z)=>-.05*x,box:BOX,cell:20}),g10=S5.windAt(0,0,23)[0];
ok('a gentle slope (3 degrees) gets sqrt(sin a / sin 20) of it',Math.abs(g10-4*Math.sqrt((.05/Math.sqrt(1.0025))/Math.sin(20*Math.PI/180)))<.02,g10>=3.99);
ok('nothing outside the box, faded at its edge (the last 40 m)',S5.windAt(5000,0,23)[0]===0&&S5.windAt(1199,0,23)[0]<S5.windAt(1100,0,23)[0]&&S5.windAt(1199,0,23)[0]>0,S5.windAt(1100,0,23)[0]!==g10);
// ---- level ground: no wind of its own
const F=A.slopeWind({ground:()=>100,box:BOX,cell:40});let flat=true;for(const h of [0,3,6,9,12,15,18,21,23.5])for(const p of [[0,0],[300,-700],[-900,400]]){const v=F.windAt(p[0],p[1],h);if(v[0]!==0||v[1]!==0)flat=false;}
ok('zero on level ground at every hour',flat,!(C.windAt(400,0,23)[0]!==0));
// ---- lag: the cold front reaches the foot later
const L=A.slopeWind({ground:cone,box:BOX,cell:20,katabatic:{lag:2}});
ok('with lag the low ground starts later (2 h a km: the foot an hour late)',L.windAt(200,0,19.75)[0]>0&&L.windAt(900,0,19.75)[0]===0&&L.windAt(900,0,21.5)[0]>0,L.windAt(900,0,19.75)[0]>0);
// ---- a gap on level ground: along its axis, reversing by day, falling off across
const G=A.slopeWind({ground:()=>0,box:BOX,cell:20,gaps:[{id:'bellows',pts:[[-800,0],[800,0]],w:200,max:12}]});
const gn=G.windAt(0,0,2),gd=G.windAt(0,0,13);
ok('a gap blows along its axis by night (12 m/s) and back by day (6)',Math.abs(gn[0]-12)<1e-9&&Math.abs(gd[0]+6)<1e-9&&gn[1]===0,gd[0]>0);
const g1=G.windAt(0,150,2)[0];ok('it falls off across: whole within w/2, part at 150 m, nothing past w',G.windAt(0,99,2)[0]===12&&g1>0&&g1<12&&G.windAt(0,250,2)[0]===0,G.windAt(0,250,2)[0]>0);
const Gn=A.slopeWind({ground:()=>0,box:BOX,cell:20,gaps:[{pts:[[-800,0],[800,0]],day:null}]});ok('day: null stills it by day',Gn.windAt(0,0,13)[0]===0&&Gn.windAt(0,0,2)[0]>0,Gn.windAt(0,0,13)[0]!==0);
/* 'down' follows the ground, not the order of pts: the ground rises to +x, so the night runs to -x */
const Gt=A.slopeWind({ground:x=>.01*x,box:BOX,cell:20,gaps:[{pts:[[-800,0],[800,0]]}]});
ok("'down' runs from the high end to the low end whatever the order of pts",Gt.windAt(0,0,2)[0]<-9.9&&Gt.windAt(0,0,13)[0]>4.9,Gt.windAt(0,0,2)[0]>0);
// ---- the cold pool: a bowl 300 m deep, 550 m to its rim, a plateau round it
const bowl=(x,z)=>Math.min(300,(x*x+z*z)/1000),B=A.slopeWind({ground:bowl,box:BOX,cell:20,pool:{reach:300,drop:10,depth:40}});
const floor=B.coldAt(0,0,5),rim=B.coldAt(800,0,5);
ok('the bowl\'s floor pools the cold by dawn (10 C), the plateau beyond its rim none',Math.abs(floor-10)<1e-9&&rim===0,rim>=floor);
ok('zero by day',B.coldAt(0,0,13)===0&&B.coldAt(0,0,10)===0,B.coldAt(0,0,5)===0);
ok('it fills through the evening: less at 20 h than at 2 h',B.coldAt(0,0,20)>0&&B.coldAt(0,0,20)<B.coldAt(0,0,2),false);
ok('above the pool\'s top nothing; at the ground all of it',B.coldAt(0,0,5,1)===floor&&B.coldAt(0,0,5,200)===0,B.coldAt(0,0,5,200)>0);
ok('the air lies still in the hollow at night, never on the flank',B.still(0,0,5)>.9&&C.still(400,0,23)===0&&B.still(0,0,13)<B.still(0,0,5),B.still(0,0,5)<.5);
// ---- attach and detach: ATMOS.windAt with stand-in uniforms (ATMOS.init makes them on a page)
A.U={wind:{value:{x:.8,y:.35}},gustAmp:{value:.55},hour:{value:23}};
const orig=A.windAt,b0=orig(7.5,400,0),bOut=orig(7.5,5000,0);C.attach(A);
const a0=A.windAt(7.5,400,0),aOut=A.windAt(7.5,5000,0);
ok('attached, windAt adds the local field in ATMOS units (4 m/s / 5)',Math.abs(a0[0]-b0[0]-.8)<1e-9&&Math.abs(a0[1]-b0[1])<1e-9,a0[0]===b0[0]);
ok('where the local field is zero windAt is the base vector bit for bit',Object.is(aOut[0],bOut[0])&&Object.is(aOut[1],bOut[1]),false);
ok('a second attach throws',throws(()=>C.attach(A)),false);
C.detach();const c0=A.windAt(7.5,400,0);
ok('detached, windAt is the original function and bit-identical',A.windAt===orig&&Object.is(c0[0],b0[0])&&Object.is(c0[1],b0[1]),A.windAt!==orig);
/* a wrapper put on after ours: detach cannot take ours out of the chain, so it passes through */
C.attach(A,()=>23);const mine=A.windAt,outer=(t,x,z)=>mine(t,x,z);A.windAt=outer;C.detach();const p0=A.windAt(7.5,400,0);
ok('under another wrapper detach passes through',A.windAt===outer&&Object.is(p0[0],b0[0]),!Object.is(p0[0],b0[0]));A.windAt=orig;
// ---- bake, export and load: identical answers
const E=JSON.parse(JSON.stringify(B.export())),BL=A.slopeWindLoad(E);
const GE=A.slopeWindLoad(JSON.parse(JSON.stringify(Gt.export())));
let same=true,cnt=0;for(const h of [1,5,9.5,13,19.6,23])for(let x=-1150;x<=1150;x+=137)for(let z=-1150;z<=1150;z+=211){cnt++;
 const a=B.windAt(x,z,h),b=BL.windAt(x,z,h),c=Gt.windAt(x,z,h),e=GE.windAt(x,z,h);
 if(a[0]!==b[0]||a[1]!==b[1]||c[0]!==e[0]||c[1]!==e[1]||B.coldAt(x,z,h)!==BL.coldAt(x,z,h)||B.coldAt(x,z,h,40)!==BL.coldAt(x,z,h,40)||B.still(x,z,h)!==BL.still(x,z,h))same=false;}
ok('export -> JSON -> slopeWindLoad answers identically ('+cnt+' points x 3 fields, a gap too)',same&&E.format==='krator-slopewind'&&E.h.length===E.nx*E.nz,!same);
ok('the bake is plain arrays',Array.isArray(B.bake().h)&&Array.isArray(B.bake().hollow)&&B.bake().nx===121,false);
ok('a bad record will not load',throws(()=>A.slopeWindLoad({format:'x'}))&&throws(()=>A.slopeWindLoad(Object.assign({},E,{h:[1,2]}))),throws(()=>A.slopeWindLoad(E)));
// ---- provide: KHAZ's temperature = the base minus the pool
const got={},KH={provide:(f,fn)=>{got[f]=fn;}};B.provide(KH,()=>10,()=>5);
ok('provide registers temperature: base minus the pool',Math.abs(got.temperature(0,0,0,0)-0)<1e-9&&got.temperature(800,300,0,0)===10&&got.temperature(0,250,0,0)===10,got.temperature(0,0,0,0)===10);
ok('provide wants KHAZ and a base',throws(()=>B.provide({},()=>0,()=>1))&&throws(()=>B.provide(KH,null,()=>1)),false);
// ---- bad options
ok('no ground, a bad box, a bad gap or a negative max throw',throws(()=>A.slopeWind({box:BOX}))&&throws(()=>A.slopeWind({ground:cone,box:[0,0]}))&&
 throws(()=>A.slopeWind({ground:cone,box:BOX,gaps:[{pts:[[0,0]]}]}))&&throws(()=>A.slopeWind({ground:cone,box:BOX,gaps:[{pts:[[0,0],[1,1]],night:'sideways'}]}))&&
 throws(()=>A.slopeWind({ground:cone,box:BOX,katabatic:{max:-1}}))&&throws(()=>C.windAt(0,0,NaN)),throws(()=>A.slopeWind({ground:cone,box:BOX})));
console.log(bad?bad+' FAILED':'all passed');process.exit(bad?1:0);
