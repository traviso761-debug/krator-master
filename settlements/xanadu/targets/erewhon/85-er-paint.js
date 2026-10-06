// ================================================================= EREWHON — the painted ground: albedo, buildable mask, street classes, the road list
// 2048 px over the map's long side (2320 m) ≈ .88 px/m. Everything the layout decides is painted here; placement
// reads the canvases (mask / klass) and the ROADS list; the terrain mesh wears the albedo.
const CS=2048,PXS=CS/ER.W,px=v=>(v+ER.W/2)*PXS,pz=v=>(v+ER.H/2)*PXS;
const gcv=document.createElement('canvas');gcv.width=gcv.height=CS;const cg=gcv.getContext('2d');
// the mask and the classes are core/mask grids (KMASK.canvas: the same calls, hard-edged, identical in every browser and
// in Godot; GODOT-PLAN.md Phase 2 item 5), so placement no longer depends on the canvas; only the albedo is one
const mv=KMASK.canvas(CS,CS);const mg=mv.getContext('2d');
const kv=KMASK.canvas(CS,CS);const kg=kv.getContext('2d');
const KL={none:0,plaza:1,park:2,boulevard:3,minor:4,stair:5,lane:6,farm:7,water:8,court:9,building:10,rock:11,field:12,garden:13};
const KLCOL=k=>'rgb('+k+','+k+','+k+')';
const ROADS=[];const PRECINCTS=[];
function cstroke(ctx,pts,w,col){if(pts.length<2)return;ctx.lineWidth=Math.max(1,w*PXS);ctx.strokeStyle=col;ctx.lineCap='round';ctx.lineJoin='round';ctx.beginPath();pts.forEach((p,i)=>i?ctx.lineTo(px(p[0]),pz(p[1])):ctx.moveTo(px(p[0]),pz(p[1])));ctx.stroke();}
function cdisc(ctx,x,z,r,col){ctx.beginPath();ctx.arc(px(x),pz(z),r*PXS,0,7);ctx.fillStyle=col;ctx.fill();}
function cpoly(ctx,pts,col){ctx.beginPath();pts.forEach((p,i)=>i?ctx.lineTo(px(p[0]),pz(p[1])):ctx.moveTo(px(p[0]),pz(p[1])));ctx.closePath();ctx.fillStyle=col;ctx.fill();}
const ROADCOL={3:'#8a7a62',4:'#9a8a70',5:'#a89880',6:'#8a8068'};
function road(pts,w,cls,opt){opt=opt||{};cstroke(cg,pts,w,opt.col||ROADCOL[cls]||'#8a7a62');cstroke(mg,pts,w+.6,'#000');cstroke(kg,pts,w+1,KLCOL(cls));const r={pts,w,cls,id:ROADS.length,zone:opt.zone||null,lights:!!opt.lights};ROADS.push(r);if(opt.bench)benchAdd(pts);return r;}
function disc(x,z,r,type,col){cdisc(cg,x,z,r,col||(type==='park'?'#3a7a3c':type==='court'?'#a89a80':'#c9a56b'));cdisc(mg,x,z,r,type==='park'?'#00ff00':'#000');cdisc(kg,x,z,r,KLCOL(type==='park'?KL.park:type==='court'?KL.court:KL.plaza));}
function precinct(x,z,r,name){PRECINCTS.push({x,z,r,name});}
function footprint(pts,col){cpoly(cg,pts,col||'rgba(70,55,40,.5)');cpoly(mg,pts,'#000');cpoly(kg,pts,KLCOL(KL.building));}
function inPrecinct(x,z,pad){for(const p of PRECINCTS){if(p.rect){const R=p.rect;if(Math.abs(x-R.x)<R.w/2+(pad||0)+2&&Math.abs(z-R.z)<R.d/2+(pad||0)+2)return p;}else if(Math.hypot(x-p.x,z-p.z)<p.r+(pad||0))return p;}return null;}
// ---- base paint from the class field and the height: the lake bed, the flats (grass), the slopes (forest floor),
// the ridge (ochre grass and earth), the unbuildable (scree), the cliffs (pale rock); buildable = flat / steep / ridge
(function paintBase(){reseed(SEED_ER+1);const img=cg.createImageData(CS,CS),d=img.data,mi=mg.createImageData(CS,CS),md=mi.data,ki=kg.createImageData(CS,CS),kd=ki.data;
 const COL=[[26,70,120],[150,168,86],[70,122,62],[160,122,84],[118,112,104],[176,172,164]];
 for(let j=0;j<CS;j++)for(let i=0;i<CS;i++){const x=i/PXS-ER.W/2,z=j/PXS-ER.H/2;const o=(j*CS+i)*4;
  if(!onMap(x,z)){d[o]=110;d[o+1]=106;d[o+2]=98;d[o+3]=255;md[o]=0;md[o+1]=0;md[o+2]=0;md[o+3]=255;kd[o]=KL.rock;kd[o+1]=kd[o+2]=KL.rock;kd[o+3]=255;continue;}
  const c=erClass(x,z),h=terrainBase(x,z),s=erSlope(x,z);const n=(Math.sin(i*.37)*Math.sin(j*.29)+Math.sin(i*.11+j*.07))*8;
  let col=COL[c];if(c===1&&h>150)col=[140,150,80];if(c===2&&s>.9)col=[92,108,70];
  d[o]=clamp(col[0]+n,0,255);d[o+1]=clamp(col[1]+n,0,255);d[o+2]=clamp(col[2]+n,0,255);d[o+3]=255;
  const ok=(c===1||c===2||c===3)&&s<.95&&h>1.2;md[o]=ok?255:0;md[o+1]=0;md[o+2]=0;md[o+3]=255;
  const k=c===0?KL.water:(c>=4?KL.rock:0);kd[o]=kd[o+1]=kd[o+2]=k;kd[o+3]=255;}
 cg.putImageData(img,0,0);mg.putImageData(mi,0,0);kg.putImageData(ki,0,0);})();
// ---- samplers (call erBakeMasks() after the last paint) ----
let mData=null,kData=null;
function erBakeMasks(){mData=mg.getImageData(0,0,CS,CS).data;kData=kg.getImageData(0,0,CS,CS).data;}
function maskAt(x,z){const ix=Math.floor(px(x)),iz=Math.floor(pz(z));if(ix<0||iz<0||ix>=CS||iz>=CS)return[0,0];const i=(iz*CS+ix)*4;return[mData[i],mData[i+1]];}
function klass(x,z){const ix=Math.floor(px(x)),iz=Math.floor(pz(z));if(ix<0||iz<0||ix>=CS||iz>=CS)return 0;return kData[(iz*CS+ix)*4];}
function canBuild(x,z){return maskAt(x,z)[0]>200;}
function isRoad(x,z){const k=klass(x,z);return k>=3&&k<=6;}
function walkable(x,z){const k=klass(x,z);return k===1||k===2||(k>=3&&k<=6)||k===9||k===13;}
