// ================================================================= DALAB CITY — the painted ground: albedo, buildable mask, classes, the road list
// Everything the layout decides is painted here first (the Iziz city's scheme); placement then READS these canvases
// and the ROADS list, and the terrain mesh wears the albedo. 2048 px over WORLD m ≈ 0.47 px/m.
const CS=2048,PXS=CS/CITY.WORLD,px=v=>(v+CITY.WORLD/2)*PXS;
const gcv=document.createElement('canvas');gcv.width=gcv.height=CS;const cg=gcv.getContext('2d');
const mv=document.createElement('canvas');mv.width=mv.height=CS;const mg=mv.getContext('2d');
const kv=document.createElement('canvas');kv.width=kv.height=CS;const kg=kv.getContext('2d');
const KL={none:0,plaza:1,park:2,highway:3,street:4,lane:5,avenue:6,farm:7,water:8,court:9,building:10,rock:11,field:12,mound:13};
const KLCOL=k=>'rgb('+k+','+k+','+k+')';
const ROADS=[];const PRECINCTS=[];
function cstroke(ctx,pts,w,col){if(pts.length<2)return;ctx.lineWidth=Math.max(1,w*PXS);ctx.strokeStyle=col;ctx.lineCap='round';ctx.lineJoin='round';ctx.beginPath();pts.forEach((p,i)=>i?ctx.lineTo(px(p[0]),px(p[1])):ctx.moveTo(px(p[0]),px(p[1])));ctx.stroke();}
function cdisc(ctx,x,z,r,col){ctx.beginPath();ctx.arc(px(x),px(z),r*PXS,0,7);ctx.fillStyle=col;ctx.fill();}
function cpoly(ctx,pts,col){ctx.beginPath();pts.forEach((p,i)=>i?ctx.lineTo(px(p[0]),px(p[1])):ctx.moveTo(px(p[0]),px(p[1])));ctx.closePath();ctx.fillStyle=col;ctx.fill();}
const ROADCOL={3:'#8a7a62',4:'#8f8068',5:'#8a8070',6:'#7a6a56'};   // packed earth; the highway a shade darker
// a road: albedo, blocked in the mask (a little wider), classed, and remembered
function road(pts,w,cls,opt){opt=opt||{};cstroke(cg,pts,w,opt.col||ROADCOL[cls]||'#8a7a62');if(cls===KL.highway||cls===KL.avenue){cstroke(cg,pts,w*.36,'#9a8a70');cstroke(cg,pts,w*.08,'#7a6a52');}else if(cls===KL.street){cstroke(cg,pts,w*.3,'#968670');}cstroke(mg,pts,w+2.4,'#000');cstroke(kg,pts,w+1.2,KLCOL(cls));   /* the mask is 2.15 m/px: a w+3 stroke ate the frontage's first metres (round 10) */
 const r={pts,w,cls,id:ROADS.length,zone:opt.zone||null};ROADS.push(r);return r;}
function disc(x,z,r,type,col){cdisc(cg,x,z,r,col||(type==='park'?'#5f8a3a':type==='court'?'#8a7a66':'#a89474'));cdisc(mg,x,z,r,type==='park'?'#00ff00':'#000');cdisc(kg,x,z,r,KLCOL(type==='park'?KL.park:type==='court'?KL.court:type==='mound'?KL.mound:KL.plaza));}
function precinct(x,z,r,name){PRECINCTS.push({x,z,r,name});}
function footprint(pts,col){cpoly(cg,pts,col||'rgba(70,52,34,.5)');cpoly(mg,pts,'#000');cpoly(kg,pts,KLCOL(KL.building));}
function inPrecinct(x,z,pad){for(const p of PRECINCTS)if(Math.hypot(x-p.x,z-p.z)<p.r+(pad||0))return p;return null;}
// a farm field: a quad polygon, painted in a crop colour with furrows, blocked, classed field (nothing builds or roots)
const CROPCOL=['#a08a3c','#8a9a38','#b89a48','#6f8a30','#c4a050','#7f9a44','#9a7a34'];
function field(pts,ci,ry){const col=CROPCOL[ci%CROPCOL.length];cpoly(cg,pts,col);cpoly(mg,pts,'#000');cpoly(kg,pts,KLCOL(KL.field));
 // furrows: stripes across the quad along its ry
 cg.save();cg.beginPath();pts.forEach((p,i)=>i?cg.lineTo(px(p[0]),px(p[1])):cg.moveTo(px(p[0]),px(p[1])));cg.closePath();cg.clip();
 const cx=pts.reduce((a,p)=>a+p[0],0)/pts.length,cz=pts.reduce((a,p)=>a+p[1],0)/pts.length;const R=Math.max(...pts.map(p=>Math.hypot(p[0]-cx,p[1]-cz)))+4;
 cg.strokeStyle='rgba(60,45,25,.28)';cg.lineWidth=Math.max(1,2.2*PXS);for(let d=-R;d<R;d+=7){const a=[cx+Math.cos(ry)*d-Math.sin(ry)*R,cz+Math.sin(ry)*d+Math.cos(ry)*R],b=[cx+Math.cos(ry)*d+Math.sin(ry)*R,cz+Math.sin(ry)*d-Math.cos(ry)*R];
  cg.beginPath();cg.moveTo(px(a[0]),px(a[1]));cg.lineTo(px(b[0]),px(b[1]));cg.stroke();}
 cg.restore();}
function water(pts,w){cstroke(cg,pts,w,'#2a4a44');cstroke(mg,pts,w+6,'#000');cstroke(kg,pts,w+4,KLCOL(KL.water));}
// ---- base paint: lowland grass and earth, a darker forest floor beyond the clearing ----
(function paintBase(){reseed(SEED_CITY+1);
 cg.fillStyle='#7f9a4c';cg.fillRect(0,0,CS,CS);mg.fillStyle='#fff';mg.fillRect(0,0,CS,CS);kg.fillStyle='#000';kg.fillRect(0,0,CS,CS);
 for(let i=0;i<5000;i++){cg.beginPath();cg.arc(rng()*CS,rng()*CS,rr(6,50),0,7);cg.fillStyle=vPick(['rgba(110,140,60,.35)','rgba(140,150,70,.3)','rgba(90,120,50,.35)','rgba(150,120,70,.22)','rgba(120,100,60,.2)']);cg.fill();}
 // the forest floor beyond the clearing: dark litter under the trees
 cg.save();cg.beginPath();cg.rect(0,0,CS,CS);cg.arc(px(0),px(-120),CITY.FOREST_R*PXS,0,7,true);cg.fillStyle='#3a4a26';cg.fill();cg.restore();
 // the river and the channels: water, blocked
 {const pts=[];for(let z=-CITY.WORLD/2;z<=CITY.WORLD/2;z+=40)pts.push([riverX(z),z]);water(pts,52);for(const C of CHANNELS)water(C.pts,C.w-1);}
})();
let mData=null,kData=null,cData=null;
function cityBakeMasks(){mData=mg.getImageData(0,0,CS,CS).data;kData=kg.getImageData(0,0,CS,CS).data;cData=cg.getImageData(0,0,CS,CS).data;}
function maskAt(x,z){const ix=Math.floor(px(x)),iz=Math.floor(px(z));if(ix<0||iz<0||ix>=CS||iz>=CS)return[0,0];const i=(iz*CS+ix)*4;return[mData[i],mData[i+1]];}
function klass(x,z){const ix=Math.floor(px(x)),iz=Math.floor(px(z));if(ix<0||iz<0||ix>=CS||iz>=CS)return 0;return kData[(iz*CS+ix)*4];}
function canBuild(x,z){return maskAt(x,z)[0]>235;}   /* a pixel the stroke touched at all is blocked (round 10): a corner could sit a metre inside a lane at 200 */
function isRoad(x,z){const k=klass(x,z);return k>=3&&k<=6;}
function walkable(x,z){const k=klass(x,z);return k===1||k===2||(k>=3&&k<=6)||k===9;}
