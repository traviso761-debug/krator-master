// prefix: tn
// ================================================================= THE PARTS: what every form draws through, in the dress
// A builder opens with tnBegin(o, form) (the dress, the wear and the colours for this placement, from core/rand), draws in its
// local frame (+z the front), and closes with tnEnd(). Everything here draws through the engine's primitives (core/engine
// 30-geo.js) in the CURRENT frame.
//   tnBegin(o, form)          -> TN_CUR {dress, wear, seed, coverKey, cover, alt, roofKey, roof, poleKey, poleCol, rope}
//   tnKeys(map, fn)           draw fn with material keys swapped (the toolkit's 'lacq' poles as the dress's, its 'felt' as the
//                             dress's cloth): the engine's GABLE_ALT_K hook, set for the call and restored
//   tnCloth(S, nu, nv, o)     a cover over the surface S(u, v) -> [x, y, z], cut into panels along u coloured by the dress's
//                             pattern (stripes, panels, a border band along v0..v1), its wear's patches and tears on top
//   tnPatches(S, n, o)        patches sewn over S (patched, ragged) and tears (ragged), placed by KRAND from the seed
//   tnFlap(x, z, yaw, w, h)   the door: a core/door leaf in the cover's cloth (core/engine 36o-open.js svLeaf): 'roll' rolls
//                             up into its head (kind lift, roll), 'tieback' two curtains drawn aside (slide, pair), 'flap' a
//                             hide flap thrown up (tilt). The dress's door, else the form's
//   tnFinial(x, y, z)         the dress's finial on a pole top; tnPennant(x, y, z, len) its pennant with the culture's emblem
//   tnFloorOf(fallback)       {key, col} of the floor cloth
//   tnGroundY(x, z)           the ground under a local point, in the local frame (stakes and pegs follow it)
// The toolkit's tkStake and tkGuy are wrapped here (not copied): a stake stands on the ground under it wherever the tent is
// pitched, wears the dress's stake and rope, and is logged in TN_STAKES for the floating-stake audit (verify.py).
let TN_CUR=null;
const TN_STAKES=[];
const TN_STACK=[];
function tnBegin(o,form){o=o||{};const D=tnDress(o.dress),seed=tnSeed(o,0x7e47),wear=o.wear||tnWear(D,seed);
 const cover=tnWorn(o.cover!=null?o.cover:tnPick(D.cover.cols,seed,1),wear),alt=tnWorn(D.alt?tnPick(D.alt,seed,2):null,wear);
 const roof=D.roof?tnWorn(tnPick(D.roof.cols,seed,3),wear):cover;
 TN_STACK.push(TN_CUR);
 TN_CUR={dress:D,wear,seed,form,coverKey:D.cover.key,cover,alt,roofKey:D.roof?D.roof.key:D.cover.key,roof,poleKey:D.pole.key,poleCol:D.pole.col,rope:D.rope,patches:0,tears:0,salt:0};
 return TN_CUR;}
function tnEnd(){TN_CUR=TN_STACK.pop()||null;}
function tnKeys(map,fn){const keep=GABLE_ALT,saved={},ks=Object.keys(map).filter(k=>map[k]&&map[k]!==k);
 for(const k of ks){saved[k]=GABLE_ALT_K[k];GABLE_ALT_K[k]=map[k];}GABLE_ALT=1;
 try{fn();}finally{GABLE_ALT=keep;for(const k of ks){if(saved[k]===undefined)delete GABLE_ALT_K[k];else GABLE_ALT_K[k]=saved[k];}}}
/* the ground under local (x, z), in the local frame: a world that is not flat moves the pegs, not the tent */
const TN_TMP=new THREE.Vector3();
function tnGroundY(x,z){TN_TMP.set(x,0,z).applyMatrix4(CM);return terrainH(TN_TMP.x,TN_TMP.z)-TN_TMP.y;}
function tnLogStake(x,y0,z,y1){if(PLACE_DRY||GTARGET!==GB)return;const a=new THREE.Vector3(x,y0,z).applyMatrix4(CM),b=new THREE.Vector3(x,y1,z).applyMatrix4(CM);
 TN_STAKES.push({key:CURKEY,tid:CURREC?CURREC.tid:null,x:+a.x.toFixed(3),z:+a.z.toFixed(3),foot:+a.y.toFixed(3),top:+b.y.toFixed(3),ground:+terrainH(a.x,a.z).toFixed(3)});}
/* the toolkit's stake and guy rope (kits/scyvoi/src/40-tk-tentkit.js), wrapped: on the ground, in the dress */
tkStake=function(x,z,col){const g=tnGroundY(x,z),D=TN_CUR&&TN_CUR.dress;const k=D?D.stake.key:'wood',c=D&&D.stake.col!=null?D.stake.col:(col==null?0x8a6a44:col);
 beam(k,[x,g-.05,z],[x+.05,g+.32,z+.02],.05,c,false);tnLogStake(x,g-.05,z,g+.32);};
tkGuy=function(a,gx,gz,col){tkStake(gx,gz);const g=tnGroundY(gx,gz);
 sagRope('rope',a,[gx+.03,g+.28,gz+.01],Math.hypot(a[0]-gx,a[2]-gz)*.012,.012,(TN_CUR&&TN_CUR.rope)||col||TK_ROPE,6);};
/* a peg at the hem of a cover (a tipi's, a wedge's): a short stake driven at (x, z) */
function tnPeg(x,z){const g=tnGroundY(x,z),D=TN_CUR&&TN_CUR.dress;beam(D?D.stake.key:'wood',[x,g-.05,z],[x,g+.16,z],.035,D&&D.stake.col!=null?D.stake.col:0x8a6a44,false);tnLogStake(x,g-.05,z,g+.16);}
/* ---------------------------------------------------------------- covers, panels and wear */
function tnPanelCol(i,n){const C=TN_CUR,p=C.dress.pattern;if(!C.alt)return C.cover;
 if(p==='stripes')return i%2?C.alt:C.cover;if(p==='panels')return (i%3===1)?C.alt:C.cover;return C.cover;}
/* S(u, v): u round or along the cover, v from the hem (0) up (1). o: {key, panels (along u), u0, u1, col (one colour: no
   pattern), band (true: the dress's band along v in [bv0, bv1]), out (the patches' outward point: [x, y, z])} */
function tnCloth(S,nu,nv,o){o=o||{};const C=TN_CUR,key=o.key||C.coverKey,n=o.panels==null?1:o.panels,u0=o.u0==null?0:o.u0,u1=o.u1==null?1:o.u1;
 for(let i=0;i<n;i++){const a=lerp(u0,u1,i/n),b=lerp(u0,u1,(i+1)/n),col=o.col!=null?o.col:tnPanelCol(i,n);
  psurf(key,(u,v)=>S(lerp(a,b,u),v),Math.max(1,Math.round(nu/n)),nv,col);}
 if(o.band&&C.dress.band){const bv0=o.bv0==null?.04:o.bv0,bv1=o.bv1==null?.22:o.bv1,cx=o.out||[0,0,0];
  psurf(C.dress.band,(u,v)=>tnLift(S,lerp(u0,u1,u),lerp(bv0,bv1,v),.012,cx),Math.max(4,nu),1,null);}
 if(o.patches!==false)tnPatches(S,o);}
/* a point on S lifted d metres off the surface, away from cx */
function tnLift(S,u,v,d,cx){const p=S(u,v),e=.002,pu=S(Math.min(1,u+e),v),qu=S(Math.max(0,u-e),v),pv=S(u,Math.min(1,v+e)),qv=S(u,Math.max(0,v-e));
 const du=[pu[0]-qu[0],pu[1]-qu[1],pu[2]-qu[2]],dv=[pv[0]-qv[0],pv[1]-qv[1],pv[2]-qv[2]];let n=[du[1]*dv[2]-du[2]*dv[1],du[2]*dv[0]-du[0]*dv[2],du[0]*dv[1]-du[1]*dv[0]];
 let L=Math.max(1e-9,Math.hypot(n[0],n[1],n[2]));n=[n[0]/L,n[1]/L,n[2]/L];cx=cx||[0,0,0];if((p[0]-cx[0])*n[0]+(p[1]-cx[1])*n[1]+(p[2]-cx[2])*n[2]<0)n=[-n[0],-n[1],-n[2]];
 return [p[0]+n[0]*d,p[1]+n[1]*d,p[2]+n[2]*d];}
/* the wear's patches (a square of another cloth or the same faded, sewn on) and tears (a dark rent): KRAND from the seed and a
   salt per call (counted within the tent, from tnBegin), so a tent keeps its patches wherever it is pitched */
function tnPatches(S,o){o=o||{};const C=TN_CUR;if(!C||(C.wear!=='patched'&&C.wear!=='ragged'))return;const salt=0x9a7c+(C.salt++)*17;
 const np=C.wear==='ragged'?5:3,nt=C.wear==='ragged'?3:0,u0=o.u0==null?0:o.u0,u1=o.u1==null?1:o.u1,cx=o.out||[0,0,0];
 const r=k=>KRAND.unit(KRAND.hash(C.seed,salt,k));
 for(let i=0;i<np+nt;i++){const tear=i>=np,du=(tear?.03:.06)+r(i*5)*.05,dv=(tear?.05:.12)+r(i*5+1)*.12,uc=lerp(u0+du,u1-du,r(i*5+2)),vc=lerp(.12+dv,.85-dv,r(i*5+3));
  const col=tear?0x1a1612:(C.alt&&r(i*5+4)<.5?C.alt:tnWorn(C.cover,'ragged'));
  psurf(tear?'plain':(o.key||C.coverKey),(u,v)=>tnLift(S,uc+(u-.5)*2*du,vc+(v-.5)*2*dv,tear?.006:.01,cx),2,2,col);
  if(tear)C.tears++;else C.patches++;}}
/* ---------------------------------------------------------------- the door, the pole top, the pennant, the floor */
function tnFlap(x,z,yaw,w,h,form){const C=TN_CUR,st=C.dress.door||TN_FORMS[form||C.form].door;if(!st||st==='leaf')return null;
 const o={mk:C.coverKey,col:C.cover,t:.03,split:false,name:'tent flap ('+st+')'};
 if(st==='roll')Object.assign(o,{kind:'lift',roll:true});
 else if(st==='tieback')Object.assign(o,{kind:'slide',pair:true});
 else Object.assign(o,{kind:'tilt'});
 if(st==='roll')beam(C.coverKey,[x-w/2,h+.08,z+.04],[x+w/2,h+.08,z+.04],.07,tnWorn(C.cover,'worn'),true,8);   // the rolled cloth over the head, tied
 return svLeaf(x,0,z,yaw==null?0:yaw,w,h,o);}
function tnFinial(x,y,z){const F=TN_CUR.dress.finial||{kind:'none'};if(F.kind==='none')return;const k=F.key||'brass',c=F.col;
 if(F.kind==='ball'){sph(k,x,y+.08,z,.09,c,1,10);}
 else if(F.kind==='spear'){sph(k,x,y+.05,z,.05,c,1,8);cone(k,x,y+.09,z,.045,.32,c,6);}
 else if(F.kind==='horns'){for(const s of [-1,1])beam(k,[x,y+.02,z],[x+s*.16,y+.22,z+.03],.035,c,true,5,.012),beam(k,[x+s*.16,y+.22,z+.03],[x+s*.1,y+.36,z+.02],.022,c,true,5,.008);}}
function tnPennant(x,y,z,len){const D=TN_CUR.dress;if(!D.emblem)return;const k='emb_'+D.key;if(!MAT[k])return;len=len==null?.9:len;const tl=TILE[k]==null?1:TILE[k];
 beam(TN_CUR.poleKey,[x,y-.6,z],[x,y+.08,z],.025,TN_CUR.poleCol,true,6);
 withCloth(clothFlag(len),()=>W(x,y,z,0,()=>psurf(k,(u,v)=>[u*len,-v*len*.6*(1-u*.4),0],6,3,0xffffff,{uvf:(u,v)=>[u*tl,(1-v)*tl]})));}
function tnFloorOf(){const F=TN_CUR.dress.floor||{key:'earth'};return {key:F.key,col:F.col==null?null:tnWorn(F.col,TN_CUR.wear==='new'?'new':'worn')};}
/* a scalloped valance in the dress's colours (or none), along a polyline */
function tnValance(pts,drop,per){const V=TN_CUR.dress.valance;if(!V)return;tkValance(pts,drop,'flag',tnWorn(tnPick(V.cols,TN_CUR.seed,7),TN_CUR.wear),{per:per==null?1.6:per,tassels:V.tassels});}
