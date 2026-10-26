// node core/terrain/test-scour.js — a megaflood's channels' contract (41-core-scour.js), each check with a broken input that must fail.
const fs=require('fs'),path=require('path');
global.window=global;
eval(fs.readFileSync(path.join(__dirname,'..','rand','08-core-rand.js'),'utf8'));
eval(fs.readFileSync(path.join(__dirname,'41-core-scour.js'),'utf8'));
let bad=0;const ok=(name,pass,neg)=>{const r=pass&&!neg;if(!r)bad++;console.log((r?'PASS  ':'FAIL  ')+name+(neg?' (its negative passed)':''));};
const K=KSCOUR;

// ---- a straight course 100 km east, its bed falling 600 -> 200 m with a steep reach (80 m in 8 km) at 40 km; and a
// gentle one with no steep reach
const pts=[];for(let x=0;x<=100000;x+=2000)pts.push([x,0]);
const bedSteep=[],bedFlat=[];for(let i=0;i<=50;i++){const x=i*2000;bedFlat.push(600-x*.004);bedSteep.push(600-x*.0032-(x<36000?0:x>44000?80:(x-36000)*.01));}
const S=K.create({courses:[{name:'steep',pts:pts,bed:bedSteep,floor:12000,walls:8000,depth:150}],seed:3});
const G=K.create({courses:[{name:'gentle',pts:pts,bed:bedFlat,floor:12000,walls:8000,depth:150}],seed:3});
const ground=(x,z)=>600-x*.004+Math.abs(z)*.012;   // a valley along the course, its floor a little over the bed

const L=S.locate(30000,3000,{});
ok('locate: along and across the course (right of the flow is +: south of an eastward course)',L.k===0&&Math.abs(L.s-30000)<1&&Math.abs(L.d-3000)<1e-6,Math.abs(L.d+3000)<1e-6);
ok('locate: nothing past the reach',S.locate(30000,20000,{}).k===-1&&S.locate(30000,13000,{}).k===0,S.locate(30000,20000,{}).k===0);
const c=S.sample(20000,0,ground(20000,0),{});
ok('the floor under the flood is scoured in full',c.scour>.99,c.scour<.5);
ok('the walls fade it out; past them nothing',S.sample(20000,10000,ground(20000,10000)-100,{}).scour<c.scour&&S.sample(20000,15000,ground(20000,15000),{}).scour===0,S.sample(20000,15000,0,{}).scour>0);
ok('ground over the flood\'s surface is not scoured',S.sample(20000,0,1200,{}).scour===0,S.sample(20000,0,300,{}).scour===0);

// ---- dry falls
const F=S.courses[0].falls;
ok('a dry fall stands where the bed steepens',F.length>=1&&F.some(f=>f.s>34000&&f.s<46000),G.courses[0].falls.length>0);
const f0=F.find(f=>f.s>34000&&f.s<46000);
ok('its height grows with the steepness, within 40..110 m',f0.h>=40&&f0.h<=110,false);
const N=K.create({courses:[{name:'steep',pts:pts,bed:bedSteep,floor:12000,walls:8000,depth:150}],seed:3,falls:{count:0}});
const lipX=f0.x-f0.r*.6,up=S.land(lipX-400,0,500)-N.land(lipX-400,0,500),dn=S.land(lipX+400,0,500)-N.land(lipX+400,0,500);
ok('below the lip the ground drops by the fall (its basin); above it nothing changes',Math.abs(up)<1e-9&&-dn>f0.h*.95,-dn<10);
const mid=S.sample(f0.x-f0.r*.6,0,500,{}),edge=S.sample(f0.x-f0.r*.6,f0.r*.7,500,{});
ok('the lip bows upstream in the middle (a horseshoe)',mid.fall>.5&&edge.fall<.5,mid.fall<.5);
ok('the basin under a fall is marked as a pool',S.sample(lipX+500,0,500,{}).pool>.5,S.sample(lipX-500,0,500,{}).pool>0);

// ---- islands, bars, ripples, potholes
let isl=null,bar=null;
for(let x=4000;x<96000&&!(isl&&bar);x+=97)for(let z=-5800;z<=5800;z+=211){const s=S.sample(x,z,500,{});
  if(!isl&&s.island>.99&&s.pothole===0&&s.bar===0&&s.fall===0&&s.pool===0)isl=[x,z];if(!bar&&s.bar>.99&&s.island===0)bar=[x,z];}
ok('streamlined islands stand in the floor, kept at the ground\'s height',isl&&Math.abs(S.land(isl[0],isl[1],500)-500)<1e-9,!isl);
let lenA=0,lenC=0;if(isl){for(let d=0;d<30000;d+=100){if(S.sample(isl[0]+d,isl[1],500,{}).island>.5)lenA=d;else break;}
  for(let d=0;d<30000;d+=100){if(S.sample(isl[0],isl[1]+d,500,{}).island>.5)lenC=d;else break;}}
ok('an island is drawn out along the flow',lenA>lenC,lenA<lenC);
let rmax=0,rmin=1;if(bar)for(let d=0;d<400;d+=5){const r=S.sample(bar[0]+d,bar[1],500,{}).ripple;rmax=Math.max(rmax,r);rmin=Math.min(rmin,r);}
ok('giant current ripples cross the bars along the flow',bar&&rmax>.9&&rmin<.1,!bar);
const lb=bar?S.land(bar[0],bar[1],500)-500:0;
ok('a bar is heaped gravel',lb>10,lb<0);
let ph=null;for(let x=10000;x<30000&&!ph;x+=13)for(let z=-3000;z<3000;z+=13){const s=S.sample(x,z,500,{});if(s.pothole>.5&&s.island===0&&s.bar===0){ph=[x,z];break;}}
ok('potholes are drilled in the scoured floor',ph&&S.land(ph[0],ph[1],500)<S.land(ph[0]+60,ph[1]+60,500)+50,!ph);
const S2=K.create({courses:[{name:'other',pts:[[0,50000],[100000,50000]],bed:[600,200]},{name:'steep',pts:pts,bed:bedSteep,floor:12000,walls:8000,depth:150}],seed:3});
ok('a pothole is keyed on its place, not on the courses\' order',ph&&S2.sample(ph[0],ph[1],500,{}).pothole===S.sample(ph[0],ph[1],500,{}).pothole,false);
ok('land has no state: the same point gives the same height whatever came before',S.land(25000,1200,480)===(S.land(70000,-900,300),S.land(25000,1200,480)),false);
let cutMax=0;for(let x=4000;x<30000;x+=37)cutMax=Math.max(cutMax,500-S.land(x,0,500));
ok('butte-and-basin: the floor cut down by tens of metres somewhere, never more than 45 m bar a pothole',cutMax>15&&cutMax<=45+15+1e-9,cutMax<5);

// ---- the rock
const st=K.strata({basaltTop:1400,basaltBase:600,seed:7}),r=h=>st.rock(h,{});
ok('cover over the basalt, basalt flows in the middle, the sedimentary basement under it',r(1500).kind==='cover'&&r(1000).flow>=0&&/basalt|interbed/.test(r(1000).kind)&&/sandstone|limestone/.test(r(500).kind),r(500).kind==='basalt');
const t3=st.tops[3],t2=st.tops[2];
ok('each flow topped by its interbed, its foot in columns',r(t3-1).kind==='interbed'&&r(t3-5).kind==='basalt'&&r(t2+1).colonnade>.9&&r(t3-6).colonnade<.1,r(t3-1).kind==='basalt');
ok('flows are 15..50 m thick',st.tops.every((t,i)=>{const b=i?st.tops[i-1]:600;return t-b<=50+1e-9&&(t-b>=15-1e-9||t===1400);}),false);
ok('the same seed gives the same strata',JSON.stringify(K.strata({seed:7}).tops)===JSON.stringify(st.tops),JSON.stringify(K.strata({seed:8}).tops)===JSON.stringify(st.tops));

// ---- from region.json "palaeo"
const SR=K.fromRegion({floods:[{name:'w',m:pts,bed_m:bedSteep,floor_km:12,walls_km:8}]},{seed:3});
ok('fromRegion reads the extractor\'s courses (km to m)',SR.courses[0].floor===12000&&SR.courses[0].walls===8000&&SR.courses[0].falls.length===F.length,SR.courses[0].floor===12);
let threw=false;try{K.create({courses:[{pts:[[0,0]],bed:[1,0]}]});}catch(e){threw=true;}
ok('a course of one point is refused',threw,false);

// ---- a station's scales (2026-10-23, biomes/scablands): a short course takes small islands and no fan
{const sp=[[0,0],[8000,0]],sb=[560,555,550,545,440,436,432],mk=o=>K.create({seed:5,courses:[Object.assign({name:'coulee',pts:sp,bed:sb,floor:2400,walls:1200},o)],falls:{count:1,spacing:2000,taper:1500,min:35,max:35}});
 const A=mk({islandL:1400,islandW:420,fan:0}),C=mk({islandL:1400,islandW:420}),bar=(S,x)=>S.sample(x,0,S.locate(x,0,{}).bed,{}).bar;
 const isl=S=>{let n=0,t=0;for(let x=200;x<7800;x+=50)for(let z=-1000;z<=1000;z+=50){t++;if(S.sample(x,z,500,{}).island>.5)n++;}return n/t;};
 ok('fan 0: no bar on the floor\'s middle at the course\'s end; the default fans it',bar(A,7900)===0&&bar(C,7900)>.5,bar(A,7900)>0);
 // the world's scale over 8 km is near-uniform noise (all island or none): a station takes its own
 ok('islands at a station\'s scale: blobs over part of the floor (3 to 50 per cent of it)',isl(A)>.03&&isl(A)<.5,isl(A)===0);
 ok('a station\'s fall: one, where the bed steps, its basin as deep as asked',A.courses[0].falls.length===1&&Math.abs(A.courses[0].falls[0].s-4000)<1400&&A.courses[0].falls[0].h===35,A.courses[0].falls.length===0);}

{const S2=K.create({seed:9,courses:[{name:'p',pts:[[0,0],[20000,0]],bed:[500,400],floor:4000,walls:1000}]}),P=S2.potholes(2000,-1500,18000,1500);
 const deepest=P.every(p=>{const c=S2.sample(p.x,p.z,450,{}).pothole;return c>0&&[[3,0],[-3,0],[0,3],[0,-3]].every(([dx,dz])=>S2.sample(p.x+dx,p.z+dz,450,{}).pothole<=c+1e-9);});
 ok('potholes(): each centre the deepest of its bowl, about one cell in four',P.length>700&&P.length<1000&&deepest,P.length===0);}

console.log(bad?bad+' FAILED':'all passed');process.exit(bad?1:0);
