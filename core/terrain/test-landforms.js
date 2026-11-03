// node core/terrain/test-landforms.js — the landform kinds of 38c-core-landforms.js (LANDFORMS.md): slump, runout, gully,
// terraces, maar, relay, stepcut. Each check carries a negative that must fail (a broken input, or the plain ground).
'use strict';
const fs=require('fs'),path=require('path');
global.window=global;
eval(fs.readFileSync(path.join(__dirname,'..','rand','08-core-rand.js'),'utf8'));
eval(fs.readFileSync(path.join(__dirname,'38-core-relief.js'),'utf8'));
let bad=0;const ok=(name,pass,neg)=>{const r=!!pass&&!neg;if(!r)bad++;console.log((r?'PASS  ':'FAIL  ')+name+(neg?' (its negative passed)':''));};
const throws=f=>{try{f();return false;}catch(e){return true;}};
const R=KRELIEF;

// ---- loading it moves nothing: the old kinds answer exactly as before
const g0=(x,z)=>100-.02*z+3*Math.sin(x/90),sc=R.scarp({pts:[[0,0],[800,0]],h:120,run:200,seed:2}),W=R.wadi({pts:[[0,0],[300,80],[600,60]],ground:g0,seed:3});
const probe=()=>{const o=[];for(let i=0;i<80;i++){const x=i*9,z=(i*37)%300-150;o.push(R.shape(sc,x,z,g0(x,z)),R.shape(W,x,z,g0(x,z)),JSON.stringify(R.at(sc,x,z)),JSON.stringify(R.at(W,x,z,g0(x,z))));}return JSON.stringify(o);};
const before=probe(),kinds0=R.kinds();
eval(fs.readFileSync(path.join(__dirname,'38c-core-landforms.js'),'utf8'));
const NEW=['slump','runout','gully','terraces','maar','relay','stepcut'];
ok('loaded, the old kinds answer exactly as before',probe()===before,false);
ok('kinds lists the seven new ones after the old',JSON.stringify(R.kinds())===JSON.stringify(kinds0.concat(NEW)),false);
ok('loading it twice changes nothing',(()=>{const k=R.kinds().length;eval(fs.readFileSync(path.join(__dirname,'38c-core-landforms.js'),'utf8'));return R.kinds().length===k;})(),false);
const json=r=>JSON.parse(JSON.stringify(r)),flat=()=>0,y=(rec,x,z,g)=>R.shape(rec,x,z,g==null?0:g);
const same=(a,b,pts)=>pts.every(p=>Math.abs(y(a,p[0],p[1])-y(b,p[0],p[1]))<1e-9);
const grid=(x0,x1,z0,z1,n)=>{const o=[];for(let i=0;i<=n;i++)for(let j=0;j<=n;j++)o.push([x0+(x1-x0)*i/n,z0+(z1-z0)*j/n]);return o;};

// ---- slump: a crown along z = 0, the slope falling toward -z (side -1: n = (0,1) is +z, so the blocks lie at -z)
const S=R.slump({pts:[[-4000,0],[4000,0]],side:-1,n:3,bw:600,h:120,tilt:8,seed:4,wobble:0});
ok('upslope of the crown the ground is untouched (bar the sackung trench)',y(S,0,1000)===0&&R.at(S,0,1000)===null,y(S,0,-1000)===0);
ok('the sackung: a trench behind the crown, its uphill-facing side the steeper',y(S,0,300)<-10&&R.at(S,0,300).part==='trench'&&Math.abs(y(S,0,300+25)-y(S,0,300))<Math.abs(y(S,0,300-25)-y(S,0,300)),y(R.slump({pts:S.pts,side:-1,sackung:false,seed:4}),0,300)<-1);
const prof=[];for(let d=0;d<=2400;d+=5)prof.push(y(S,1500,-d));
const head=(Math.abs(prof[0]-prof[Math.round(S.face/5)])/S.face),blockSlope=Math.abs(prof[Math.round(450/5)]-prof[Math.round(500/5)])/50;
ok('the head scarp is steep ('+head.toFixed(2)+') and the blocks gentle ('+blockSlope.toFixed(2)+')',head>.5&&blockSlope<.4,head<blockSlope);
let ups=0;for(let k=0;k<3;k++){const a=600*k+80,b=600*k+560;if(prof[Math.round(b/5)]>prof[Math.round(a/5)]+20)ups++;}
ok('each block is back-tilted: its front stands over its back ('+ups+' of 3)',ups===3,false);
const anti=R.slump({pts:S.pts,side:-1,n:3,bw:600,h:120,seed:4,wobble:0,ponds:false}),noAnti=R.slump({pts:S.pts,side:-1,n:3,bw:600,h:120,seed:4,wobble:0,ponds:false,anti:false});
const step=(rec)=>y(rec,1500,-(330+12))-y(rec,1500,-(330-12));
ok('an uphill-facing scarp: the ground steps UP going downslope across it ('+step(anti).toFixed(1)+' m)',step(anti)>15&&R.at(anti,1500,-330).part==='anti',step(noAnti)>15);
ok('the levels step down block by block, n*h in all',y(S,1500,-590)<y(S,1500,10)-100&&y(S,1500,-1790)<-300,false);
ok('past the last block a toe bulges over the old ground, then nothing',Math.max(y(S,1500,-1800-180),y(S,1500,-1800-120))>10&&y(S,1500,-1800-600)===0&&R.at(S,1500,-1800-150).part==='toe',y(S,1500,-1800-600)!==0);
ok('sag ponds lie at the blocks\' backs, at names them',S.ponds.length>3&&S.ponds.every(p=>R.at(S,p.x,p.z).part==='pond'),R.at(S,0,1000)!==null);
const Wt=R.waters(S,flat);
ok('waters gives each pond a level over its bed',Wt.length===S.ponds.length&&Wt.every((w,i)=>w.y>y(S,S.ponds[i].x,S.ponds[i].z)),false);
ok('the slump dies past the line\'s ends',y(S,4000+700,-900)===0&&y(S,4000+100,-900)<0,y(S,4000+100,-900)===0);
ok('a record is JSON-safe: its JSON draws the same ground',same(S,json(S),grid(-3000,3000,-2500,500,12)),false);
ok('the same seed, the same ponds; another, others',JSON.stringify(R.slump({pts:S.pts,side:-1,seed:4,wobble:0}).ponds)===JSON.stringify(S.ponds)&&JSON.stringify(R.slump({pts:S.pts,side:-1,seed:5,wobble:0}).ponds)!==JSON.stringify(S.ponds),false);
ok('bad slumps throw (no line, a face over half a block)',throws(()=>R.slump({pts:[[0,0]]}))&&throws(()=>R.slump({pts:S.pts,bw:100,face:80})),throws(()=>R.slump({pts:S.pts})));

// ---- runout: from (0,0) to (6000,0)
const U=R.runout({a:[0,0],b:[6000,0],h:40,seed:7,blocks:{n:4},lake:true});
ok('the deposit lies on the ground: thick inside, nothing outside',y(U,3000,0)>20&&y(U,3000,3000)===0&&y(U,-500,0)===0,y(U,3000,3000)>0);
let rimH=0,midH=0;for(let q=-900;q<=900;q+=10){const v=y(U,3500,q);if(Math.abs(q)<100)midH=Math.max(midH,v);}
const Wd=960*(.3+.7)*.9;for(let q=-Wd*1.05;q<=Wd*1.05;q+=5)rimH=Math.max(rimH,y(R.runout({a:[0,0],b:[6000,0],h:40,seed:7,hummocks:{h:0},grooves:{d:0},blocks:{n:0}}),3500,q));
ok('its margins stand as a rim over the middle ('+rimH.toFixed(1)+' m over a 40 m deposit)',rimH>48,R.runout({a:[0,0],b:[6000,0],h:40,rim:0,hummocks:{h:0},grooves:{d:0},blocks:{n:0}}).rim>0);
const lon=[];for(let q=-300;q<=300;q+=4)lon.push(y(R.runout({a:[0,0],b:[6000,0],h:40,seed:7,hummocks:{h:0},blocks:{n:0}}),2500,q));
const swing=Math.max(...lon)-Math.min(...lon);
ok('longitudinal grooves ripple across the lobe ('+swing.toFixed(1)+' m)',swing>6,(()=>{const l=[];for(let q=-300;q<=300;q+=4)l.push(y(R.runout({a:[0,0],b:[6000,0],h:40,seed:7,hummocks:{h:0},grooves:{d:0},blocks:{n:0}}),2500,q));return Math.max(...l)-Math.min(...l)>6;})());
const H0=R.runout({a:[0,0],b:[6000,0],h:40,seed:7,grooves:{d:0},blocks:{n:0}}),H1=R.runout({a:[0,0],b:[6000,0],h:40,seed:7,grooves:{d:0},blocks:{n:0},hummocks:{h:0}});
let hd=0;for(let x=3000;x<4000;x+=7)hd=Math.max(hd,y(H0,x,40)-y(H1,x,40));
ok('hummocks stand on the distal lobe ('+hd.toFixed(1)+' m)',hd>5,false);
const Mb=U.blocks[0];ok('megablocks stand over the deposit, at names them',U.blocks.length===4&&y(U,Mb.x,Mb.z)>y(R.runout({a:[0,0],b:[6000,0],h:40,seed:7,blocks:{n:0}}),Mb.x,Mb.z)+20&&R.at(U,Mb.x,Mb.z,0).part==='megablock',false);
const oldU=R.runout({a:[0,0],b:[6000,0],h:40,seed:7,fresh:false,blocks:{n:0}});
ok('an old runout is softer: its hummocks and grooves smaller',oldU.hum.h<U.hum.h&&oldU.groove.d<U.groove.d,false);
ok('a lake is dammed beside the lobe; waters gives its level',U.lake&&R.at(U,U.lake.x,U.lake.z,0).part==='lake'&&R.waters(U,flat)[0].y>0&&y(U,U.lake.x,U.lake.z)===0,R.waters(R.runout({a:[0,0],b:[6000,0]}),flat).length>0);
ok('JSON-safe, and a bad runout throws',same(U,json(U),grid(-200,6600,-1200,1200,14))&&throws(()=>R.runout({a:[0,0],b:[0,0]})),throws(()=>R.runout({a:[0,0],b:[100,0]})));

// ---- gully: a tableland at 3000 m tilting gently east, the trunk running east to the bench's edge
const tab=(x,z)=>3000-.01*x;
const Gl=R.gully({pts:[[0,0],[800,60],[1600,-40],[2400,0]],ground:tab,depth:150,seed:9});
const tr=Gl.lines[0].pts;
ok('the trunk\'s floor never climbs downstream, and is deepest at the mouth',tr.every((p,i)=>!i||p[2]<=tr[i-1][2])&&tab(2400,0)-tr[tr.length-1][2]>=149,false);
const mid=[1200,10],gm=tab(...mid),ym=y(Gl,mid[0],mid[1],gm);
ok('the gully is cut to its floor ('+(gm-ym).toFixed(0)+' m deep there)',gm-ym>100&&R.at(Gl,mid[0],mid[1],gm).part==='floor',false);
const Gy=R.gully({pts:[[0,0],[800,60],[1600,-40],[2400,0]],ground:tab,depth:150,seed:9,tops:'yuan'});let wallRun=null;for(let q=0;q<200;q+=1){const v=y(Gy,1200,10+q,gm);if(v>gm-1.5){wallRun=q;break;}}
ok('its walls are sheer: the full depth within '+wallRun+' m',wallRun!=null&&wallRun<60,false);
ok('branches with amphitheatre heads; a head is wider than the floor',Gl.lines.length>6&&Gl.heads.length===Gl.lines.length&&Gl.heads.slice(1).every(h=>R.at(Gl,h.x,h.z,tab(h.x,h.z))&&['head','floor'].includes(R.at(Gl,h.x,h.z,tab(h.x,h.z)).part)),false);
const H=Gl.heads[1],Lh=Gl.lines[H.line];let hw=0;for(let q=0;q<120;q++){const px=H.x+Math.cos(H.dir)*8-Math.sin(H.dir)*q,pz=H.z+Math.sin(H.dir)*8+Math.cos(H.dir)*q;if(R.at(Gl,px,pz,tab(px,pz)).part!=='head'&&R.at(Gl,px,pz,tab(px,pz)).part!=='floor'){hw=q;break;}}
ok('the head\'s bowl is wider than the gully\'s floor ('+hw+' m against '+Lh.w.toFixed(0)+')',hw>Lh.w*1.3,false);
ok('a head\'s floor is shallower than the mouth\'s',Gl.heads.slice(1).every(h=>tab(h.x,h.z)-h.y<=150*.56+1e-6),false);
const far=[1200,1500];ok('far from every gully the table is untouched',y(Gl,far[0],far[1],tab(...far))===tab(...far)&&R.at(Gl,far[0],far[1],tab(...far))===null,false);
const Y=R.gully({pts:Gl.lines[0].pts.map(p=>[p[0],p[1]]),ground:tab,depth:150,seed:9,tops:'yuan'}),M=R.gully({pts:Gl.lines[0].pts.map(p=>[p[0],p[1]]),ground:tab,depth:150,seed:9,tops:'mao'});
ok('yuan: fewer branches, flat tops to the rim; liang: rounded shoulders',Y.lines.length<Gl.lines.length&&Y.shoulder===0&&Gl.shoulder>0,false);
let rounded=0;for(let q=40;q<160;q+=10){const a=y(Gl,1200,10+q,gm),b=y(Y,1200,10+q,gm);if(a<b-1)rounded++;}
ok('a liang\'s top rounds over beside its gully where a yuan\'s stays flat ('+rounded+' samples)',rounded>2,false);
let kn=0;for(let x=0;x<2400;x+=40)for(let z=-300;z<=300;z+=40){const a=y(M,x,z,tab(x,z)),b=y(R.gully({pts:[[0,0],[2400,0]],ground:tab,depth:150,seed:9,tops:'liang',branches:0}),x,z,tab(x,z));if(a<b-5)kn++;}
ok('mao: the ridges broken into knolls ('+kn+' samples lowered)',kn>10,false);
const tAt=R.at(Gl,1200,10+150,gm);ok('at names the tops by the tableland kind',tAt&&['liang','rim'].includes(tAt.part)&&R.at(Y,1200,10+900,gm)?.part!=='liang',false);
ok('JSON-safe, the same seed the same net; bad gullies throw',same(Gl,json(Gl),grid(0,2400,-600,600,10).map(p=>p))&&JSON.stringify(R.gully({pts:[[0,0],[800,60],[1600,-40],[2400,0]],ground:tab,seed:9}).lines)===JSON.stringify(Gl.lines)&&throws(()=>R.gully({pts:[[0,0],[1,1]]}))&&throws(()=>R.gully({pts:[[0,0],[9,9]],ground:tab,tops:'mesa'})),throws(()=>R.gully({pts:[[0,0],[100,0]],ground:tab})));

// ---- terraces: a slope rising 30 m per 100 m to the north (-z)
const slope=(x,z)=>-.3*z;
const Tc=R.terraces({rise:3,riser:.25,seed:2});
let treads=0,riserMax=0;const prv=[];for(let z=0;z>=-200;z-=.5){const v=y(Tc,0,z,slope(0,z));prv.push(v);}
for(let i=1;i<prv.length;i++){const d=prv[i]-prv[i-1];if(Math.abs(d)<.02)treads++;riserMax=Math.max(riserMax,d/.5);}
ok('the slope is cut into flat treads ('+treads+' flat samples) and steep risers (max '+riserMax.toFixed(2)+')',treads>200&&riserMax>.9,(()=>{let t=0;for(let z=0;z>-200;z-=.5)if(Math.abs(slope(0,z-.5)-slope(0,z))<.02)t++;return t>200;})());
let mean=0;for(let z=0;z>=-300;z-=1)mean+=y(R.terraces({rise:3,riser:.25,bund:0,wobble:0}),0,z,slope(0,z))-slope(0,z);mean/=301;
ok('cut and fill balance: the terraced ground keeps the slope\'s level ('+mean.toFixed(2)+' m)',Math.abs(mean)<.5,Math.abs((()=>{let m=0;for(let z=0;z>=-300;z-=1)m+=y(R.terraces({rise:3,riser:.25,bund:0,wobble:0,fill:0}),0,z,slope(0,z))-slope(0,z);return m/301;})())<.5);
ok('the treads follow the height lines: one level along the contour',Math.abs(y(R.terraces({rise:3,wobble:0}),-100,-50,15)-y(R.terraces({rise:3,wobble:0}),100,-50,15))<1e-9,false);
const Z=R.terraces({rise:3,zone:{c:[0,-100],r:200},fade:30,band:[10,50]});
ok('a zone and a band hold them: outside, the plain slope',y(Z,0,-400,120)===120&&y(Z,500,-100,30)===30&&y(Z,0,-100,30)!==30,y(Z,0,-100,30)===30);
ok('at names treads, risers and bunds, and a field by its level and cell',(()=>{const s=new Set();for(let z=0;z>-60;z-=.25){const a=R.at(Tc,0,z,slope(0,z));if(a)s.add(a.part);}return s.has('tread')&&s.has('riser')&&s.has('bund');})()&&/^\d+:-?\d+,-?\d+$/.test(R.at(Tc,0,-50,15).field),false);
ok('a polygon zone, and bad terraces throw',y(R.terraces({rise:3,zone:{poly:[[-50,-50],[50,-50],[50,50],[-50,50]]},fade:5}),0,0,7.3)!==7.3&&y(R.terraces({rise:3,zone:{poly:[[-50,-50],[50,-50],[50,50],[-50,50]]},fade:5}),200,0,7.3)===7.3&&throws(()=>R.terraces({riser:1.2}))&&throws(()=>R.terraces({zone:{}})),throws(()=>R.terraces({})));

// ---- maar: Mid Basin's flagship, breached to the north (-z), a spring at its foot
const gb=(x,z)=>2200+.02*z,Mr=R.maar({c:[0,0],r:600,dir:-Math.PI/2,ground:gb,spring:true,seed:1});
ok('the crater floor lies its depth under the old surface',Math.abs(Mr.g0-Mr.floorY-600*.28)<1e-6&&Math.abs(y(Mr,150,150,gb(150,150))-Mr.floorY)<1,false);
const ringS=Math.max(...[1.0,1.05,1.1,1.15].map(k=>y(Mr,0,600*k,gb(0,600*k))-gb(0,600*k)));
ok('a tuff ring stands round the south rim ('+ringS.toFixed(0)+' m)',ringS>50&&R.at(Mr,0,600*1.15,gb(0,600*1.15)).part==='ring'&&R.at(Mr,0,600*1.15,gb(0,600*1.15)).rock==='tuff',false);
const north=y(Mr,0,-600*1.08,gb(0,-600*1.08));
ok('the north rim is cleaved open: the gorge runs out at the floor\'s level ('+(north-Mr.floorY).toFixed(0)+' m over the floor)',north<Mr.floorY+5&&R.at(Mr,0,-600*1.08,gb(0,-600*1.08)).part==='gorge',y(R.maar({c:[0,0],r:600,ground:gb,breach:false,seed:1}),0,-600*1.08,gb(0,-600*1.08))<Mr.floorY+5);
ok('the fault\'s trace is marked, and its record suits KSTRATA',R.at(Mr,0,-600*1.3,gb(0,-600*1.3)).fault===true&&Mr.fault.a[1]>0&&Mr.fault.b[1]<0&&R.at(Mr,300,600*1.15,gb(300,600*1.15)).fault===false,false);
const wallAt=(rr)=>R.at(Mr,0,rr,gb(0,rr));
ok('in the wall: breccia inside the pipe, baked rock at its contact, country rock beyond, tuff on top',wallAt(200).rock==='breccia'&&(()=>{const s=new Set();for(let r=200;r<640;r+=2){const a=wallAt(r);if(a)s.add(a.rock);}return s.has('baked')&&s.has('country')&&s.has('tuff');})(),wallAt(560)&&wallAt(560).rock==='breccia');
const Wm=R.waters(Mr,gb);
ok('the spring\'s pool sits dished in the floor, its outflow runs north down the gorge, never climbing',Wm.length===1&&Wm[0].y<Mr.floorY&&y(Mr,0,0,gb(0,0))<Wm[0].y&&Wm[0].out.length>10&&Wm[0].out.every((p,i)=>!i||(p[2]<=Wm[0].out[i-1][2]+1e-9&&p[1]<Wm[0].out[i-1][1])),R.waters(R.maar({c:[0,0],r:600,ground:gb,seed:1}),gb).length>0);
ok('far off, the ground is untouched',y(Mr,5000,5000,7)===7&&R.at(Mr,5000,5000,7)===null,false);
ok('JSON-safe; a bad maar throws',same(Mr,json(Mr),grid(-900,900,-1800,900,12))&&throws(()=>R.maar({c:[0,0],ground:gb,floor:9999}))&&throws(()=>R.maar({c:[0,0]})),throws(()=>R.maar({c:[0,0],ground:gb})));

// ---- relay: two en-echelon scarps facing north (-z), overlapping over 2 km, each 400 m of throw
const Rl=R.relay({faults:[{pts:[[-6000,0],[1000,0]],throw:400,side:-1,tip:.3},{pts:[[-1000,-1500],[6000,-1500]],throw:400,side:-1,tip:.3}],seed:3});
ok('above the first scarp the plateau stands; under each scarp\'s own reach the ground has dropped its throw',y(Rl,-3000,2000)>-1&&Math.abs(y(Rl,-3000,-4000)+400)<5&&Math.abs(y(Rl,3000,-4000)+400)<5&&y(Rl,3000,-750)>-5,false);
let rampMono=true,lastV=Infinity;for(let x=800;x>=-800;x-=50){const v=y(Rl,x,-750);if(v>lastV+1)rampMono=false;lastV=v;}
const rampDrop=y(Rl,800,-750)-y(Rl,-800,-750);
ok('between them a relay ramp falls along the strike, with no cliff ('+rampDrop.toFixed(0)+' m over 1.6 km)',rampMono&&rampDrop>100&&R.at(Rl,0,-750).part==='ramp',false);
let maxStep=0;for(let x=-800;x<=800;x+=10)maxStep=Math.max(maxStep,Math.abs(y(Rl,x,-750)-y(Rl,x+10,-750)));
ok('the ramp is continuous (largest step '+maxStep.toFixed(1)+' m in 10 m)',maxStep<25,false);
ok('at names the scarp, the crest, the foot and the bench',R.at(Rl,-3000,-100).part==='scarp'&&R.at(Rl,-3000,50).part==='crest'&&R.at(Rl,-3000,-260).part==='foot'&&R.at(Rl,-3000,-1200).part==='bench'&&R.at(Rl,-3000,-1200).bench===1,R.at(Rl,-3000,5000)!==null);
const Mid=R.relay({faults:[0,1,2].map(k=>({pts:[[-9000,-1500*k],[9000,-1500*k]],throw:[900,900,1000][k],side:-1,tip:.15}))});
ok('Mid Basin\'s stack: three benches stepping 2800 m down from the plateau',Math.abs(y(Mid,0,-4500,4350)-1550)<5&&R.at(Mid,0,-4500).bench===3&&R.at(Mid,0,-2200).bench===2,false);
ok('the bench sags at the scarp\'s foot (back-tilted)',y(Rl,-3000,-260)<y(Rl,-3000,-1200),y(R.relay({faults:[{pts:[[-6000,0],[1000,0]],throw:400,side:-1}],tilt:0}),-3000,-260)<y(R.relay({faults:[{pts:[[-6000,0],[1000,0]],throw:400,side:-1}],tilt:0}),-3000,-1200)-1);
ok('JSON-safe; bad relays throw',same(Rl,json(Rl),grid(-5000,5000,-4000,2000,12))&&throws(()=>R.relay({faults:[]}))&&throws(()=>R.relay({faults:[{pts:[[0,0],[1,0]],throw:0}]})),throws(()=>R.relay({faults:[{pts:[[0,0],[1,0]],throw:5}]})));

// ---- stepcut: a pit and a graben, sheer stepped walls
const P=R.stepcut({disc:{c:[0,0],r:200},depth:60,steps:3,tread:20,riser:1,seed:5});
ok('the pit\'s floor is the full depth down',y(P,0,0)===-60&&R.at(P,0,0).part==='floor',false);
const pp=[];for(let r=210;r>=100;r-=.25)pp.push(y(P,r,0));let sheer=0,flatN=0;for(let i=1;i<pp.length;i++){const d=Math.abs(pp[i]-pp[i-1])/.25;if(d>5)sheer++;if(d<1e-9)flatN++;}
ok('its walls are sheer risers (slope over 5 for '+sheer+' samples) between flat treads',sheer>=6&&flatN>100&&P.drops.length===3&&Math.abs(P.drops.reduce((a,b)=>a+b)-1)<1e-9,false);
ok('outside the edge there is no falloff: the ground is untouched a metre out',y(P,201,0)===0&&R.at(P,204,0)===null,y(R.stepcut({disc:{c:[0,0],r:200},depth:60}),199,0)===0);
const Gr=R.stepcut({line:{pts:[[-1000,0],[1000,0]],w:50},depth:40,steps:2,tread:15,riser:1.5,seed:5});
ok('a graben: the floor between stepped walls on both sides',y(Gr,0,0)===-40&&y(Gr,0,30)===-40&&y(Gr,0,-30)===-40&&R.at(Gr,0,58).part==='tread'&&R.at(Gr,0,-58).part==='tread'&&y(Gr,0,80)===0,y(Gr,0,80)!==0);
const Fa=R.stepcut({disc:{c:[0,0],r:200},floor:-30,steps:2});ok('an absolute floor: the cut ends at that level',y(Fa,0,0,10)===-30&&y(Fa,0,0,-50)===-50,false);
const El=R.stepcut({ell:{c:[0,0],rx:300,rz:120,ry:.4},depth:20,warp:{amp:15}});ok('an ellipse, its edge warped',y(El,0,0)===-20&&y(El,500,0)===0,false);
ok('JSON-safe; a pit too small for its steps throws',same(P,json(P),grid(-250,250,-250,250,20))&&throws(()=>R.stepcut({disc:{c:[0,0],r:20},tread:20,steps:3}))&&throws(()=>R.stepcut({depth:5})),throws(()=>R.stepcut({disc:{c:[0,0],r:200}})));

// ---- the composition: apply takes the new kinds with the old, in order
const ap=R.apply(g0,[sc,P]);ok('apply composes old and new kinds in order',ap(0,0)===R.shape(P,0,0,R.shape(sc,0,0,g0(0,0)))&&ap(0,0)!==R.shape(sc,0,0,g0(0,0)),false);
ok('waters is [] for a kind with no water, old or new',R.waters(P,flat).length===0&&R.waters(sc,flat).length===0,false);
ok('a record of an unknown kind still throws',throws(()=>R.shape({kind:'mesa'},0,0,0)),!throws(()=>R.shape({kind:'mesa'},0,0,0)));
ok('the fragment uses no THREE, no DOM and no Math.random',!/THREE\.|document\.|window\.|Math\.random\(/.test(fs.readFileSync(path.join(__dirname,'38c-core-landforms.js'),'utf8')),!/Math\.random\(/.test('Math.random()'));

console.log(bad?bad+' FAILED':'all passed');process.exit(bad?1:0);
