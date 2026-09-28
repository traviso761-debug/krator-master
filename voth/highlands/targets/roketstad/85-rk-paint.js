// ================================================================= ROKETSTAD — the painted ground: albedo, buildable mask, classes, roads
// (after the Iziz city's 85-city-paint.js) Everything the layout decides is painted here first; placement then READS
// these canvases and the ROADS list, and the terrain mesh wears the albedo. 3072 px over 3400 m ≈ .9 px/m.
const CS=3072,PXS=CS/RK.WORLD,px=v=>(v+RK.WORLD/2)*PXS;
const gcv=document.createElement('canvas');gcv.width=gcv.height=CS;const cg=gcv.getContext('2d');
const mv=document.createElement('canvas');mv.width=mv.height=CS;const mg=mv.getContext('2d');
const kv=document.createElement('canvas');kv.width=kv.height=CS;const kg=kv.getContext('2d');
// mask: R = buildable (255) or not; G = 'green' (the biome may put understorey here even where R is 0)
const KL={none:0,plaza:1,park:2,highway:3,main:4,street:5,lane:6,farm:7,water:8,court:9,building:10,rock:11,field:12,port:13,wall:14};
const KLCOL=k=>'rgb('+k+','+k+','+k+')';
const ROADS=[];const PRECINCTS=[];
function cstroke(ctx,pts,w,col){if(pts.length<2)return;ctx.lineWidth=Math.max(1,w*PXS);ctx.strokeStyle=col;ctx.lineCap='round';ctx.lineJoin='round';ctx.beginPath();pts.forEach((p,i)=>i?ctx.lineTo(px(p[0]),px(p[1])):ctx.moveTo(px(p[0]),px(p[1])));ctx.stroke();}
function cdisc(ctx,x,z,r,col){ctx.beginPath();ctx.arc(px(x),px(z),r*PXS,0,7);ctx.fillStyle=col;ctx.fill();}
function cpoly(ctx,pts,col){ctx.beginPath();pts.forEach((p,i)=>i?ctx.lineTo(px(p[0]),px(p[1])):ctx.moveTo(px(p[0]),px(p[1])));ctx.closePath();ctx.fillStyle=col;ctx.fill();}
const ROADCOL={3:'#6c6256',4:'#7a6e60',5:'#86796a',6:'#8e8070'};   // cobbled highways darker, lanes packed earth
function road(pts,w,cls,opt){opt=opt||{};cstroke(cg,pts,w,opt.col||ROADCOL[cls]||'#7a6e60');cstroke(mg,pts,w+2.5,'#000');cstroke(kg,pts,w+1.5,KLCOL(cls));
 const r={pts,w,cls,id:ROADS.length,zone:opt.zone||null};ROADS.push(r);return r;}
function disc(x,z,r,type,col){cdisc(cg,x,z,r,col||(type==='park'?'#4a6b3a':'#9a8a72'));cdisc(mg,x,z,r,type==='park'?'#00ff00':'#000');cdisc(kg,x,z,r,KLCOL(type==='park'?KL.park:type==='port'?KL.port:KL.plaza));}
function precinct(x,z,r,name){PRECINCTS.push({x,z,r,name});}
function footprint(pts,col){cpoly(cg,pts,col||'rgba(60,50,40,.5)');cpoly(mg,pts,'#000');cpoly(kg,pts,KLCOL(KL.building));}
function inPrecinct(x,z,pad){for(const p of PRECINCTS)if(Math.hypot(x-p.x,z-p.z)<p.r+(pad||0))return p;return null;}
// ---- base paint: meadow and forest litter on the shelf; packed earth and cobble inside the wall; the port table ----
(function paintBase(){reseed(SEED_RK+1);
 cg.fillStyle='#4a5e34';cg.fillRect(0,0,CS,CS);mg.fillStyle='#fff';mg.fillRect(0,0,CS,CS);kg.fillStyle='#000';kg.fillRect(0,0,CS,CS);
 for(let i=0;i<9000;i++){cg.beginPath();cg.arc(rng()*CS,rng()*CS,rr(6,60)*PXS*2,0,7);cg.fillStyle=vPick(['rgba(70,96,48,.45)','rgba(96,110,60,.35)','rgba(58,78,40,.45)','rgba(110,96,62,.25)','rgba(84,104,70,.3)']);cg.fill();}
 // the town: an earthen ground inside the wall (the streets, yards and gardens between the houses)
 const inner=[];for(let i=0;i<=240;i++){const t=i/240*TAU;inner.push(townPt(t,wallR(t)+6));}
 cpoly(cg,inner,'#8a7a60');
 cg.save();cg.beginPath();inner.forEach((q,i)=>i?cg.lineTo(px(q[0]),px(q[1])):cg.moveTo(px(q[0]),px(q[1])));cg.closePath();cg.clip();
 for(let i=0;i<4000;i++){const p=townPt(rng()*TAU,Math.sqrt(rng())*(TC.R+30));cg.beginPath();cg.arc(px(p[0]),px(p[1]),rr(3,20)*PXS,0,7);cg.fillStyle=vPick(['rgba(110,96,70,.35)','rgba(80,90,50,.3)','rgba(130,112,84,.3)','rgba(96,80,60,.35)']);cg.fill();}
 cg.restore();
 // the wall band: nothing builds from 12 m inside the wall to 10 m outside it
 const band=[];for(let i=0;i<=240;i++){const t=i/240*TAU;band.push(townPt(t,wallR(t)));}cstroke(mg,band,24,'#000');cstroke(kg,band,24,KLCOL(KL.wall));
 // the port table: pale ruined paving over the whole top
 cdisc(cg,PC.x,PC.z,PC.top+10,'#8c8a80');for(let i=0;i<1500;i++){const a=rng()*TAU,r=Math.sqrt(rng())*PC.top;cg.beginPath();cg.arc(px(PC.x+r*Math.cos(a)),px(PC.z+r*Math.sin(a)),rr(4,26)*PXS,0,7);cg.fillStyle=vPick(['rgba(110,108,98,.45)','rgba(80,86,64,.35)','rgba(140,136,122,.35)','rgba(96,100,70,.3)']);cg.fill();}
})();
// ---- samplers (call cityBakeMasks() after the last paint) ----
let mData=null,kData=null;
function cityBakeMasks(){mData=mg.getImageData(0,0,CS,CS).data;kData=kg.getImageData(0,0,CS,CS).data;}
function maskAt(x,z){const ix=Math.floor(px(x)),iz=Math.floor(px(z));if(ix<0||iz<0||ix>=CS||iz>=CS)return[0,0];const i=(iz*CS+ix)*4;return[mData[i],mData[i+1]];}
function klass(x,z){const ix=Math.floor(px(x)),iz=Math.floor(px(z));if(ix<0||iz<0||ix>=CS||iz>=CS)return 0;return kData[(iz*CS+ix)*4];}
function canBuild(x,z){return maskAt(x,z)[0]>200;}
function isRoad(x,z){const k=klass(x,z);return k>=3&&k<=6;}
