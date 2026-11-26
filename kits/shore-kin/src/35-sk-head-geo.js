// ================================================================= FACETED ANCESTOR DOOR-MASK GENERATOR ([G data])
// Pure engine-neutral triangle-list generator adapted from the Eternian closed-eyed household ancestor mask tradition
// (kits/eternian/src/42-et-head.js). Shore-kin mould closed-eyed ancestor masks over doors in fired laterite clay
// ('terracotta'), while clan factors, shrine keepers and the Caretaker House's client hall cast theirs in gleaming
// white copper-nickel-zinc ('paktong'). Zero THREE, zero DOM: seeded strictly through KRAND.hash.

const SK_MASK_ROWS=[0,.07,.16,.24,.32,.41,.5,.58,.67,.78,.89,1];
const SK_MASK_COLS=[0,.32,.66,1.05,1.48];

function skMaskParams(seed,o){
 o=o||{};
 const s0=seed>>>0;
 const u=k=>KRAND.unit(KRAND.hash(s0,0x51a7,k));
 const pickV=(v,d)=>v==null?d:v;
 return {
  long:pickV(o.long,u(1)),
  broad:pickV(o.broad,u(2)),
  aged:pickV(o.aged,u(3)),
  soft:pickV(o.soft,u(4)),
  crest:pickV(o.crest,['step','wave','none'][Math.floor(u(5)*3)]),
  eyes:'closed',
  seed:s0
 };
}

function skMaskTri(G,a,b,c){
 G.pos.push(a[0],a[1],a[2],b[0],b[1],b[2],c[0],c[1],c[2]);
 G.uv.push(a[0]+.5,a[1],b[0]+.5,b[1],c[0]+.5,c[1]);
}

function skMaskQuad(G,a,b,c,d){
 skMaskTri(G,a,b,c);
 skMaskTri(G,a,c,d);
}

function skMaskBox(G,x0,y0,z0,x1,y1,z1){
 const v=[
  [x0,y0,z0],[x1,y0,z0],[x1,y1,z0],[x0,y1,z0],
  [x0,y0,z1],[x1,y0,z1],[x1,y1,z1],[x0,y1,z1]
 ];
 const faces=[[4,5,6,7],[1,0,3,2],[0,4,7,3],[5,1,2,6],[3,7,6,2],[0,1,5,4]];
 for(let i=0;i<faces.length;i++){
  const f=faces[i];
  skMaskQuad(G,v[f[0]],v[f[1]],v[f[2]],v[f[3]]);
 }
}

function skMaskGeo(p){
 p=p||skMaskParams(1);
 const G={pos:[],uv:[],eyes:'closed'};
 const R=SK_MASK_ROWS;
 const C=SK_MASK_COLS.concat(SK_MASK_COLS.slice(1,-1).reverse().map(a=>Math.PI*2-a));
 const NC=C.length;
 const L=p.long,B=p.broad,A=p.aged,S=p.soft,wsc=1-.12*L;

 const halfW=y=>{
  let a;
  if(y<.42)a=.18+(.41-.18)*Math.pow(y/.42,.64)+B*.045*(1-y/.42);
  else if(y<.75)a=.41+.014*Math.sin((y-.42)/.33*Math.PI);
  else a=.41*Math.sqrt(Math.max(.02,1-Math.pow((y-.75)/.26,2)));
  return Math.max(.02,a*wsc);
 };
 const halfD=y=>Math.max(.02,(y<.75?.34:.35*Math.sqrt(Math.max(.02,1-Math.pow((y-.75)/.26,2))))*(y<.26?.85+.4*y:1));

 const F={};
 const at=(ri,ci,dz,dx)=>{const k=ri+','+ci;F[k]=F[k]||[0,0];F[k][0]+=dz;F[k][1]+=dx||0;};
 at(3,0,.08);at(4,0,.18);at(5,0,.13);at(6,0,.08);at(7,0,.04);
 at(3,1,.045);at(4,1,.06);
 at(2,0,.045+S*.018);at(2,1,.025+S*.012);at(1,0,.02);at(2,2,-.03);
 at(1,1,.02);
 /* Closed eyes: calm recessed lids below sculpted brow ridge */
 at(6,1,-.038);at(6,2,-.042);
 at(7,1,.062+A*.025);at(7,2,.055+A*.025);at(7,3,.02);
 at(5,2,.04-A*.018,.014);at(5,3,.025,.025);at(3,2,-A*.035);

 const PT=(ri,j)=>{
  const y=R[ri],ph=C[j],side=Math.sin(ph)<0?-1:1;
  const mIdx=Math.min(j,NC-j);
  const f=F[ri+','+mIdx]||[0,0],front=Math.cos(ph);
  const x=halfW(y)*Math.sin(ph)+side*f[1];
  let z=halfD(y)*(front>0?Math.pow(front,.58):front*.2)+f[0];
  if(front<.15)z=0;
  return [x,y,z];
 };

 for(let i=0;i<R.length-1;i++){
  for(let j=0;j<NC;j++){
   const j1=(j+1)%NC;
   skMaskQuad(G,PT(i,j),PT(i,j1),PT(i+1,j1),PT(i+1,j));
  }
 }
 /* Flat mounting backplate at z = 0 so the mask seats cleanly proud of door lintels */
 skMaskQuad(G,[-.34*wsc,.04,0],[-.34*wsc,.92,0],[.34*wsc,.92,0],[.34*wsc,.04,0]);

 if(p.crest==='step'){
  skMaskBox(G,-.3*wsc,.88,-.02,.3*wsc,.99,.12);
  skMaskBox(G,-.19*wsc,.99,-.02,.19*wsc,1.09,.09);
 }else if(p.crest==='wave'){
  skMaskBox(G,-.32*wsc,.88,-.02,.32*wsc,.96,.11);
  for(let k=-1;k<=1;k++){
   skMaskBox(G,k*.14-.045,.96,-.01,k*.14+.045,1.08+(k===0?.04:0),.08);
  }
 }
 return G;
}

globalThis.skMaskParams=skMaskParams;
globalThis.skMaskGeo=skMaskGeo;
