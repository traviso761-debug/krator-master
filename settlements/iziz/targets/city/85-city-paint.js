// ================================================================= IZIZ CITY — the painted ground: albedo, buildable mask, street classes, the road list
// Everything the layout decides is painted here first; placement then READS these canvases (mask/klass) and the ROADS
// list, and the terrain mesh wears the albedo canvas. 2048 px over WORLD m ≈ 1.08 px/m.
const CS=2048,PXS=CS/CITY.WORLD,px=v=>(v+CITY.WORLD/2)*PXS;
const gcv=document.createElement('canvas');gcv.width=gcv.height=CS;const cg=gcv.getContext('2d');
const mv=document.createElement('canvas');mv.width=mv.height=CS;const mg=mv.getContext('2d');
const kv=document.createElement('canvas');kv.width=kv.height=CS;const kg=kv.getContext('2d');
const KL={none:0,plaza:1,park:2,boulevard:3,minor:4,ancient:5,settler:6,farm:7,water:8,court:9,building:10,rock:11,field:12};
const KLCOL=k=>'rgb('+k+','+k+','+k+')';
const ROADS=[];           // {pts,w,cls,id} in world metres — the frontage placer walks these
const PRECINCTS=[];       // discs nothing may be built in: {x,z,r,name}
function cstroke(ctx,pts,w,col){if(pts.length<2)return;ctx.lineWidth=Math.max(1,w*PXS);ctx.strokeStyle=col;ctx.lineCap='round';ctx.lineJoin='round';ctx.beginPath();pts.forEach((p,i)=>i?ctx.lineTo(px(p[0]),px(p[1])):ctx.moveTo(px(p[0]),px(p[1])));ctx.stroke();}
function cdisc(ctx,x,z,r,col){ctx.beginPath();ctx.arc(px(x),px(z),r*PXS,0,7);ctx.fillStyle=col;ctx.fill();}
function cpoly(ctx,pts,col){ctx.beginPath();pts.forEach((p,i)=>i?ctx.lineTo(px(p[0]),px(p[1])):ctx.moveTo(px(p[0]),px(p[1])));ctx.closePath();ctx.fillStyle=col;ctx.fill();}
const ROADCOL={3:'#4e4a46',4:'#5a5652',5:'#6a6058',6:'#6c645a'};   // boulevard dark asphalt-ish, ancient grid = pale cracked slabs, settler = packed earth
// a road: albedo, blocked in the mask (a little wider), classed, and remembered
function road(pts,w,cls,opt){opt=opt||{};cstroke(cg,pts,w,opt.col||ROADCOL[cls]||'#5a5652');cstroke(mg,pts,w+2.5,'#000');cstroke(kg,pts,w+1.5,KLCOL(cls));
 const r={pts,w,cls,id:ROADS.length,zone:opt.zone||null};ROADS.push(r);return r;}
// a plaza / park / court disc
function disc(x,z,r,type,col){cdisc(cg,x,z,r,col||(type==='park'?'#2c6b34':type==='court'?'#8a7a66':'#c9a56b'));cdisc(mg,x,z,r,type==='park'?'#00ff00':'#000');cdisc(kg,x,z,r,KLCOL(type==='park'?KL.park:type==='court'?KL.court:KL.plaza));}
function precinct(x,z,r,name){PRECINCTS.push({x,z,r,name});}
// a building footprint (world-space polygon): blocked in the mask, classed, a foundation shadow on the albedo
function footprint(pts,col){cpoly(cg,pts,col||'rgba(60,45,30,.55)');cpoly(mg,pts,'#000');cpoly(kg,pts,KLCOL(KL.building));}
// an annulus (rock escarpment, farm field ring...): stroked as a thick circle
function annulus(ctx,x,z,r0,r1,col){ctx.lineWidth=Math.max(1,(r1-r0)*PXS);ctx.strokeStyle=col;ctx.beginPath();ctx.arc(px(x),px(z),(r0+r1)/2*PXS,0,7);ctx.stroke();}
function inPrecinct(x,z,pad){for(const p of PRECINCTS)if(Math.hypot(x-p.x,z-p.z)<p.r+(pad||0))return p;return null;}
// ---- base paint: sandstone plateau inside the wall, dark jungle litter outside the moat, rock in between ----
(function paintBase(){reseed(SEED_CITY+1);
 cg.fillStyle='#1c3a22';cg.fillRect(0,0,CS,CS);mg.fillStyle='#fff';mg.fillRect(0,0,CS,CS);kg.fillStyle='#000';kg.fillRect(0,0,CS,CS);
 for(let i=0;i<2400;i++){cg.beginPath();cg.arc(rng()*CS,rng()*CS,rr(6,40),0,7);cg.fillStyle=vPick(['rgba(20,80,40,.45)','rgba(50,110,60,.35)','rgba(30,60,50,.4)','rgba(70,60,30,.25)']);cg.fill();}
 const outer=[],inner=[],wallb=[];for(let i=0;i<=240;i++){const t=i/240*TAU;outer.push([(wallR(t)+48)*Math.cos(t),(wallR(t)+48)*Math.sin(t)]);inner.push([(wallR(t)+4)*Math.cos(t),(wallR(t)+4)*Math.sin(t)]);}
 cpoly(cg,outer,'#3a2818');cpoly(mg,outer,'#000');cpoly(cg,inner,'#b88a5a');cpoly(mg,inner,'#fff');
 cg.save();cg.beginPath();inner.forEach((q,i)=>i?cg.lineTo(px(q[0]),px(q[1])):cg.moveTo(px(q[0]),px(q[1])));cg.closePath();cg.clip();
 for(let i=0;i<3000;i++){const x=rr(-540,540),z=rr(-540,540);cg.beginPath();cg.arc(px(x),px(z),rr(5,34),0,7);cg.fillStyle=vPick(['rgba(160,100,50,.35)','rgba(110,60,30,.4)','rgba(190,130,70,.3)','rgba(80,50,30,.35)','rgba(120,100,60,.25)']);cg.fill();}
 cg.restore();
 // the wall band: nothing grows or builds from 16 m inside the wall to the far side of the moat
 const band=[];for(let i=0;i<=240;i++){const t=i/240*TAU;const r=wallR(t)+16;band.push([r*Math.cos(t),r*Math.sin(t)]);}cstroke(mg,band,66,'#000');cstroke(kg,band,66,KLCOL(KL.water));
 // gate causeways stay clear
 for(const g of GATES){const R=wallR(g);road([[(R-30)*Math.cos(g),(R-30)*Math.sin(g)],[(R+240)*Math.cos(g),(R+240)*Math.sin(g)]],16,KL.boulevard);}
})();
// ---- samplers (call cityBakeMasks() after the last paint) ----
let mData=null,kData=null,cData=null;
function cityBakeMasks(){mData=mg.getImageData(0,0,CS,CS).data;kData=kg.getImageData(0,0,CS,CS).data;cData=cg.getImageData(0,0,CS,CS).data;}
function maskAt(x,z){const ix=Math.floor(px(x)),iz=Math.floor(px(z));if(ix<0||iz<0||ix>=CS||iz>=CS)return[0,0];const i=(iz*CS+ix)*4;return[mData[i],mData[i+1]];}
function klass(x,z){const ix=Math.floor(px(x)),iz=Math.floor(px(z));if(ix<0||iz<0||ix>=CS||iz>=CS)return 0;return kData[(iz*CS+ix)*4];}
function canBuild(x,z){return maskAt(x,z)[0]>200;}
function isRoad(x,z){const k=klass(x,z);return k>=3&&k<=6;}
function walkable(x,z){const k=klass(x,z);return k===1||k===2||(k>=3&&k<=6)||k===9;}
