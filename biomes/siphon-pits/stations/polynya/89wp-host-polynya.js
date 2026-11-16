// ================================================================= HOST — station 14's lake: the polynya and the bay's ice (PLAN.md section 8.3)
// After 89w (the qanats, the springs, the lake's record). The polynya is a WATER.still on KTHERM's 7 degC contour (48: POLYNYA), 8 m under the ice's
// edge; the ice (WATER.ice, core/water ext/54, listed by stations/polynya/station.json) covers the rest of the bay in two pieces either side of the line
// through the polynya's middle across the shore, each a simple polygon clipped to the square. Then the frost smoke's mist on both (89a)
if(SKEY==='polynya'){const LV=SITE.lake.level,R1=TERR.R*1.1,W_P={};
 const clip=(P,b)=>{let out=P;const sides=[[0,-b,1],[0,b,-1],[1,-b,1],[1,b,-1]];   /* Sutherland-Hodgman against the square |x|, |z| <= b */
  for(const[k,v,s]of sides){const inp=out;out=[];const IN=p=>s*(p[k]-v)>=0;for(let i=0;i<inp.length;i++){const A=inp[i],B=inp[(i+1)%inp.length];
    if(IN(B)){if(!IN(A)){const t=(v-A[k])/(B[k]-A[k]);out.push([A[0]+(B[0]-A[0])*t,A[1]+(B[1]-A[1])*t]);}out.push(B);}
    else if(IN(A)){const t=(v-A[k])/(B[k]-A[k]);out.push([A[0]+(B[0]-A[0])*t,A[1]+(B[1]-A[1])*t]);}}}return out;};
 if(POLYNYA&&!POLYNYA.missing){const c=POLYNYA.c,ac=L.aOf(c[0],c[1]);
  const poly=POLYNYA.pts.map(p=>{const dx=p[0]-c[0],dz=p[1]-c[1],l=Math.hypot(dx,dz)||1;return[p[0]+dx/l*8,p[1]+dz/l*8];});   /* 8 m under the ice's edge */
  const S=WATER.still({name:'The polynya (open water over the fault springs)',level:LV,poly});
  const D=WATER.drawStill(S,{color:0x2e434a,roughness:.05,metalness:.05,envMapIntensity:.9,renderOrder:1,pick:true});
  D.mesh.userData.inspectLabel='The polynya: open water kept from freezing by the fault springs under it (28-42 degC at the vents)';
  // the ice: either side of the line through the polynya's middle across the shore, the lake from the waterline out, less the polynya's half
  const DA=POLYNYA.pts.map(p=>[L.dOf(p[0],p[1]),L.aOf(p[0],p[1])]),X=[];
  for(let i=0;i<DA.length;i++){const p=DA[i],q=DA[(i+1)%DA.length];if((p[1]-ac)*(q[1]-ac)<0){const t=(ac-p[1])/(q[1]-p[1]);X.push({i,d:p[0]+(q[0]-p[0])*t});}}
  W_P.cuts=X.length;
  if(X.length===2){const[n0,f0]=X[0].d<X[1].d?[X[0],X[1]]:[X[1],X[0]],N=DA.length;
   const chain=(from,to)=>{const o=[];for(let k=(from.i+1)%N;;k=(k+1)%N){o.push(DA[k]);if(k===to.i)break;}return o;};
   const cA=chain(n0,f0),cB=chain(f0,n0).reverse(),mid=q=>q[Math.floor(q.length/2)][1];   /* both near to far */
   const AM=6000,DF=7000,shoreLine=sgn=>{const o=[];for(let a=ac;Math.abs(a-ac)<=AM;a+=sgn*30)o.push([L.shoreD(a)-2,a]);return o;};
   const half=sgn=>{const ch=(Math.sign(mid(cA)-ac)===sgn?cA:cB).slice().reverse();   /* far to near */
    const P=shoreLine(sgn).concat([[DF,ac+sgn*AM],[DF,ac],[f0.d,ac]],ch,[[n0.d,ac]]);return clip(P.map(q=>L.xz(q[0],q[1])),R1);};
   const ICE_O={level:LV+.05,colours:{ice:'#9aaeb6',crack:'#e2eaee',snow:'#eff3f5'},cracks:{cell:26,jitter:.8,width:.05},
    drifts:{wind:-45,spacing:11,chance:.55,len:[6,20],wid:[2,4.5],depth:[.06,.22]}};
   W_P.ice=[];[-1,1].forEach((sg,k)=>{const P=half(sg);if(P.length<3)return;
    const I=WATER.ice(Object.assign({name:'Lake Ostrukh\'s bay ice ('+(sg<0?'north-west':'south-east')+' of the polynya)',poly:P,seed:9890+k},ICE_O));
    I.levelAt=()=>I.level;   /* core/water ext/60 (WATER.fields) reads a surface's levelAt; ext/54's ice has none (KNOWN_ISSUES.md) */
    const DI=WATER.drawIce(I,{cell:4,pick:true});DI.mesh.userData.inspectLabel='Lake ice: drifted pack over the bay (white with hoar, cracked in plates)';
    W_P.ice.push({pts:P.length,drifts:I.drifts.length});});}
  REGISTER({name:'The polynya (open water at the ice\'s edge: it drowns)',x:c[0],z:c[1],y:LV-SITE.bed.depth-4,r:Math.min(600,POLYNYA.width*.55),h:SITE.bed.depth+8,tags:{hazard:{kind:'drown',danger:.8}}});
  // the frost smoke (89a's mist) on the open water and the ice: ATMOS.heightFogScene skips the water's meshes, so the two kinds drawn here take it by name
  W_P.fogged=0;if(ATMOS.heightFogOn&&ATMOS.U&&ATMOS.U.fogH)scene.traverse(o=>{if(o.isMesh&&/^water:(The polynya|Lake Ostrukh)/.test(o.name||'')&&o.material.fog!==false){ATMOS.heightFogOn(o.material);W_P.fogged++;}});
  W_P.polynya={width:Math.round(POLYNYA.width),area:Math.round(POLYNYA.area),pts:POLYNYA.pts.length};}
 else W_P.polynya=POLYNYA?'missing: no closed '+SITE.polynya.open+' degC contour round its middle':'no therm';
 Object.assign(window._water,W_P,{surfaces:WATER.surfaces.length});}
