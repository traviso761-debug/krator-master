// ================================================================= HOST — station 14's lake: the open bay and the shore ice (PLAN.md section 8.3)
// After 89w (the qanats, the springs, the lake's record). The lake is open at the winter dawn (the model's climate, the owner, 2026-11-16): the bay is a
// WATER.still over the lake's part of the square (from the waterline out, clipped to the square); the only ice is the fringe in the shallows that 48
// found (SHORE_ICE: under SITE.shoreIce.depth m and under SITE.shoreIce.open degrees), drawn with WATER.ice (core/water ext/54, listed by
// stations/polynya/station.json: this page only). Then the frost smoke's mist (89a) on both: ATMOS.heightFogScene skips the water's meshes
if(SKEY==='polynya'){const LV=SITE.lake.level,R1=TERR.R*1.1,W_P={};
 const clip=(P,b)=>{let out=P;const sides=[[0,-b,1],[0,b,-1],[1,-b,1],[1,b,-1]];   /* Sutherland-Hodgman against the square |x|, |z| <= b */
  for(const[k,v,s]of sides){const inp=out;out=[];const IN=p=>s*(p[k]-v)>=0;for(let i=0;i<inp.length;i++){const A=inp[i],B=inp[(i+1)%inp.length];
    if(IN(B)){if(!IN(A)){const t=(v-A[k])/(B[k]-A[k]);out.push([A[0]+(B[0]-A[0])*t,A[1]+(B[1]-A[1])*t]);}out.push(B);}
    else if(IN(A)){const t=(v-A[k])/(B[k]-A[k]);out.push([A[0]+(B[0]-A[0])*t,A[1]+(B[1]-A[1])*t]);}}}return out;};
 // THE BAY: the waterline (2 m inland of it, under the beach) from one end of the square to the other, then out past the square's far side
 const AM=R1+400,DF=R1+4000,line=[];for(let a=-AM;a<=AM;a+=25)line.push([L.shoreD(a)-2,a]);
 const bayPoly=clip(line.concat([[DF,AM],[DF,-AM]]).map(q=>L.xz(q[0],q[1])),R1);
 const S=WATER.still({name:'Lake Ostrukh\'s bay (open water, steaming at the dawn)',level:LV,poly:bayPoly});
 const D=WATER.drawStill(S,{color:0x2e434a,roughness:.05,metalness:.05,envMapIntensity:.9,renderOrder:1,pick:true});
 D.mesh.userData.inspectLabel='Lake Ostrukh: open water; the fault springs under the bay warm it, and it steams in the cold dawn';
 W_P.bay={pts:bayPoly.length};
 // THE SHORE ICE: one record a cold run of the shallows, thin and wet (little snow on it), clear of the leads
 W_P.ice=[];if(SHORE_ICE){SHORE_ICE.polys.forEach((P0,k)=>{const P=clip(P0,R1);if(P.length<3)return;
  const I=WATER.ice({name:'The shore ice (a fringe in the shallows, '+(k+1)+')',poly:P,level:LV+.04,seed:9890+k,colours:{ice:'#7e939b',crack:'#dfe8ec',snow:'#edf2f4'},
   cracks:{cell:9,jitter:.8,width:.06},drifts:{wind:-15,spacing:7,chance:.3,len:[2,6],wid:[.8,2],depth:[.02,.06]}});
  const DI=WATER.drawIce(I,{cell:1.5,pick:true});DI.mesh.userData.inspectLabel='Shore ice: a fringe on the shallows at the coldest dawn (the bay itself stays open)';
  W_P.ice.push({pts:P.length,drifts:I.drifts.length});});
  W_P.leads=SHORE_ICE.leads;}
 REGISTER({name:'The warm bay over the fault springs (open water: it drowns)',x:SHORE_ICE?SHORE_ICE.c[0]:L.xz(SITE.shore.d+SITE.bay.d,SITE.bay.a)[0],z:SHORE_ICE?SHORE_ICE.c[1]:L.xz(SITE.shore.d+SITE.bay.d,SITE.bay.a)[1],
  y:LV-SITE.bed.depth-4,r:500,h:SITE.bed.depth+8,tags:{hazard:{kind:'drown',danger:.8}}});
 // the frost smoke (89a's mist) on the open water and the ice
 W_P.fogged=0;if(ATMOS.heightFogOn&&ATMOS.U&&ATMOS.U.fogH)scene.traverse(o=>{if(o.isMesh&&/^water:(Lake Ostrukh|The shore ice)/.test(o.name||'')&&o.material.fog!==false){ATMOS.heightFogOn(o.material);W_P.fogged++;}});
 Object.assign(window._water,W_P,{surfaces:WATER.surfaces.length});}
