// node core/terrain/test-glacier.js — the valley glacier's contract (44g-core-glacier.js), each check with a broken input that must fail.
const fs=require('fs'),path=require('path');
global.window=global;
eval(fs.readFileSync(path.join(__dirname,'..','rand','08-core-rand.js'),'utf8'));
eval(fs.readFileSync(path.join(__dirname,'44g-core-glacier.js'),'utf8'));
let bad=0;const ok=(name,pass,neg)=>{const r=pass&&!neg;if(!r)bad++;console.log((r?'PASS  ':'FAIL  ')+name+(neg?' (its negative passed)':''));};
const K=KGLACIER,smooth=K.smooth,mix=(a,b,t)=>a+(b-a)*t;

// ---- the Throne's glacier (stations/glacier/45), and its formulas as they were written there before the lift
const UP=[.707,.707],PERP=[.707,-.707],uOf=(x,z)=>x*UP[0]+z*UP[1],pOf=(x,z)=>x*PERP[0]+z*PERP[1];
const GL={pg:u=>45*Math.sin(u*.0011+.4)+18*Math.sin(u*.003+1.2),W:u=>mix(290,520,smooth(-600,2400,u)),SNOUT:-300,
 T:u=>(34+24*smooth(-300,500,u)+22*smooth(1400,2300,u))*smooth(-300,-286,u),Dv:u=>36+24*smooth(-600,2200,u)};
const mk=o=>K.create(Object.assign({up:UP,centre:GL.pg,W:GL.W,T:GL.T,snout:GL.SNOUT,trough:{D:GL.Dv},lateral:{h:u=>15+9*smooth(-300,1200,u),end:[1800,1300]},terminal:{},seed:9},o));
const G=mk({});
const TERM=(function(){const p0=GL.pg(GL.SNOUT),W0=GL.W(GL.SNOUT);return{p0,W0,u0:GL.SNOUT-440,bend:80,breach:p0+70,h:20};})();
const termU=p=>TERM.u0+TERM.bend*Math.pow((p-TERM.p0)/TERM.W0,2);
function moraineAt(u,p,a){const W=GL.W(u),aa=Math.abs(a),tu=termU(p);
 const lat=(15+9*smooth(-300,1200,u))*Math.exp(-Math.pow((aa-W-38)/26,2))*smooth(1800,1300,u)*smooth(tu-10,tu+40,u);
 const term=TERM.h*Math.exp(-Math.pow((u-tu)/42,2))*(1-smooth(TERM.W0*1.5,TERM.W0*2.0,Math.abs(p-TERM.p0)))*(1-.92*Math.exp(-Math.pow((p-TERM.breach)/24,2)));
 return Math.max(lat,term);}
const lakeK=(u,p,a)=>smooth(termU(p)+15,termU(p)+70,u)*smooth(GL.SNOUT+260,GL.SNOUT+60,u)*(1-smooth(GL.W(u)*.8,GL.W(u)*1.2,Math.abs(a)));
function iceAt(x,z){const u=uOf(x,z);if(u<GL.SNOUT-2)return 0;const a=pOf(x,z)-GL.pg(u),W=GL.W(u),t=1-Math.pow(a/W,2);return t<=0?0:GL.T(u)*Math.pow(t,.62);}
const trough=(u,a)=>{const W=GL.W(u);return GL.Dv(u)*(1-smooth(W*.85,W*1.55,Math.abs(a)))*smooth(TERM.u0-520,TERM.u0-60,u);};
let same=true,nIce=0,nMor=0,nLake=0;
for(let i=0;i<4000;i++){const x=-2600+((i*977)%5200),z=-2600+((i*613)%5200),u=uOf(x,z),p=pOf(x,z),a=p-GL.pg(u);
 if(G.iceAt(x,z)!==iceAt(x,z)||G.moraine(u,p,a)!==moraineAt(u,p,a)||G.lakeK(u,p,a)!==lakeK(u,p,a)||G.trough(u,a)!==trough(u,a))same=false;
 if(iceAt(x,z)>0)nIce++;if(moraineAt(u,p,a)>1)nMor++;if(lakeK(u,p,a)>.2)nLake++;}
ok('the Throne\'s numbers give its ice, trough, moraines and lake to the bit (4000 points)',same&&nIce>200&&nMor>20,false);
ok('the Throne\'s terminal moraine record is its TERM',JSON.stringify(G.TERM)===JSON.stringify(TERM),false);
const G2=mk({edge:.9});let moved=false;for(let i=0;i<200;i++){const u=i*10-200,c=G.at(u,GL.pg(u)+GL.W(u)*.6);if(G2.iceAt(c[0],c[1])!==G.iceAt(c[0],c[1]))moved=true;}
ok('another edge exponent moves the ice (the check sees a change)',moved,!moved);

// ---- the shape
const mid=G.at(800,GL.pg(800));ok('the ice is thickest down the middle and gone past its edge',G.iceAt(mid[0],mid[1])>G.iceAt(...G.at(800,GL.pg(800)+GL.W(800)*.8))&&G.iceAt(...G.at(800,GL.pg(800)+GL.W(800)*1.05))===0,G.iceAt(mid[0],mid[1])===0);
ok('no ice below the snout',G.iceAt(...G.at(GL.SNOUT-10,GL.pg(GL.SNOUT-10)))===0,G.iceAt(...G.at(GL.SNOUT+50,GL.pg(GL.SNOUT+50)))===0);
const lat=G.moraine(800,GL.pg(800)+GL.W(800)+38,GL.W(800)+38),inn=G.moraine(800,GL.pg(800),0);
ok('a lateral moraine crests just outside the ice, none down the middle',lat>15&&inn<.5,inn>lat);
const tp=TERM.p0,tu=termU(tp);ok('the terminal moraine crosses below the snout, breached for the river',G.moraine(tu,tp,tp-GL.pg(tu))>15&&G.moraine(termU(TERM.breach),TERM.breach,0)<TERM.h*.2,G.moraine(tu,tp,0)<1);
ok('the lake lies between the terminal moraine and the snout',G.lakeK(GL.SNOUT-120,TERM.p0,0)>.9&&G.lakeK(GL.SNOUT+400,TERM.p0,0)===0&&G.lakeK(tu-30,TERM.p0,0)===0,G.lakeK(GL.SNOUT-120,TERM.p0,0)<.5);
const N=mk({lake:null,terminal:null,lateral:null,trough:null});
ok('lake, moraines and trough are optional (null: none)',N.lakeK(GL.SNOUT-120,TERM.p0,0)===0&&N.moraine(800,GL.pg(800)+GL.W(800)+38,GL.W(800)+38)===0&&N.trough(0,0)===0&&N.iceAt(mid[0],mid[1])===G.iceAt(mid[0],mid[1]),N.iceAt(mid[0],mid[1])===0);
{const q=G.at(-200,TERM.p0+40),u=uOf(q[0],q[1]),p=pOf(q[0],q[1]),a=p-GL.pg(u);ok('bed() is the Throne\'s order: less the trough, plus the moraines, less the lake basin',G.bed(q[0],q[1],100)===100-trough(u,a)+moraineAt(u,p,a)-9*lakeK(u,p,a),G.bed(q[0],q[1],100)===100);}
let threw=false;try{K.create({up:UP});}catch(e){threw=true;}ok('create without the shape throws',threw,!threw);

// ---- placement: KRAND per kind and index
const S=G.seracs({u:[1300,1725]}),S2=mk({}).seracs({u:[1300,1725]}),S3=mk({seed:10}).seracs({u:[1300,1725]});
ok('seracs: the same seed places the same, a new seed others',S.length>100&&JSON.stringify(S)===JSON.stringify(S2)&&JSON.stringify(S)!==JSON.stringify(S3),S.length===0);
ok('seracs stand on ice at least minIce thick, in the icefall\'s rows',S.every(r=>G.iceAt(r.x,r.z)>=8&&G.uOf(r.x,r.z)>1290&&G.uOf(r.x,r.z)<1740),false);
const half=mk({}).seracs({u:[1300,1500]}),capped=mk({}).seracs({u:[1300,1725],max:50});ok('a serac\'s draws do not hang on how many came before (a shorter run is a prefix)',half.length<S.length&&half.every((r,i)=>JSON.stringify(r)===JSON.stringify(S[i]))&&capped.length===50,!half.length);
const B=G.bergs({level:5000});ok('bergs float in the lake basin, at its level',B.length===16&&B.every(r=>G.lakeAt(r.x,r.z)>=.6&&r.y===5000),B.length===0);
const B0=mk({lake:null}).bergs({level:5000});ok('no lake, no bergs',B0.length===0,B.length===0);
const Bw=mk({lake:null}).bergs({level:5000,water:(x,z)=>x*UP[0]+z*UP[1]<GL.SNOUT});ok('a host\'s own water takes the bergs a snout calves (no lake of the module\'s)',Bw.length===16&&Bw.every(r=>r.x*UP[0]+r.z*UP[1]<GL.SNOUT),Bw.length===0);
const Cr=G.crevasses({u:[400,1200]});ok('crevasses lie across the ice, inside it',Cr.length>20&&Cr.every(r=>G.iceAt(r.x,r.z)>6&&r.len>=18&&r.len<=60),Cr.length===0);
const Cv=G.caves([{x:10,z:20,R:14,H:11,face:1}],{floor:(x,z)=>x+z});ok('caves take their floor from the ground',Cv[0].floor===30&&Cv[0].kind==='icecave'&&Cv[0].mouth===.36,Cv[0].floor!==30);
const R=G.records();ok('records: the glacier and everything placed, plain data with ids',R[0].kind==='glacier'&&R.length===1+S.length+B.length+Cr.length+1&&R.every(r=>r.class==='feature'&&r.id)&&JSON.parse(JSON.stringify(R)).length===R.length,false);
const src=fs.readFileSync(path.join(__dirname,'44g-core-glacier.js'),'utf8').replace(/\/\/[^\n]*/g,'');
ok('no Math.random, THREE or document in the data half',!/Math\.random|THREE|document\./.test(src),false);

console.log(bad?bad+' FAILED':'all passed');process.exit(bad?1:0);
