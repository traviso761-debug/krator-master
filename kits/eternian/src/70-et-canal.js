// prefix: et
// ================================================================= THE CANAL STREET (PLAN.md sections 4 and 11, P3): the canal,
// the bridge, and the mixed street that puts every tier of dwelling on its quays. The canal town's streets are water:
// the quays stand on made ground ET_QUAY above the sheet's ground, the canal sunk between stone walls. The lock, the
// quays of Farport and the reservoir come with the hydraulics (P5).
const ET_QUAY=1.2,ET_CANAL_W=8;

/* a canal segment 20 m long: the bed, the water, the quay walls with their copings, bronze bollards, a water stair down
   the north wall. Its quays' made ground is the street's */
defBuilding({key:'et_canal',name:'Canal',seed:7701,cls:'feature',kind:'canal',w:20,d:10.2,h:2,budget:20000,
 front:{x:0,z:5.1,yaw:0},tags:{types:['infrastructure']},
 note:'a canal segment: stone quay walls with copings, the water 0.65 m below the quay, bronze bollards, a water stair',
 build(o){const L=20,Q=ET_QUAY,hw=ET_CANAL_W/2,sd=P('stoneD');
  box('stone',0,0,0,L,.05,ET_CANAL_W,new THREE.Color(sd).multiplyScalar(.55));box('water',0,.05,0,L,.5,ET_CANAL_W,new THREE.Color(ET_WATER));
  for(const s of [-1,1]){box('stone',0,0,s*(hw+.3),L,Q,.6,sd);box('stone',0,Q,s*(hw+.3),L,.12,.8,new THREE.Color(sd).multiplyScalar(1.15));
   for(let x=-L/2+2.5;x<L/2;x+=5){cyl('bronze',x,Q+.12,s*(hw+.25),.11,.45,P('bronze'),8);sph('bronze',x,Q+.6,s*(hw+.25),.13,P('bronze'));}}
  for(let k=0;k<4;k++)box('stone',L/2-4+k*.36,0,-hw+.5,.36,Q-.2*(k+1),1.0,sd);}});

/* the bridge: a pointed arch across the canal from quay to quay, spandrels of dark stone, a paved deck rising over the
   crown between stone parapets, a bronze head on each keystone, eyes closed, and a verdigris lamp at each end */
defBuilding({key:'et_bridge',name:'Canal bridge',seed:7702,cls:'feature',kind:'bridge',w:4,d:13,h:4.4,budget:30000,
 front:{x:0,z:6.4,yaw:0},tags:{types:['infrastructure']},
 note:'a pointed arch across the canal, dark stone spandrels, a paved deck between parapets, a bronze head on each keystone, verdigris lamps at the ends',
 build(o){const Q=ET_QUAY,hw=ET_CANAL_W/2,BW=1.6,sd=P('stoneD'),pv=P('paving');
  const DZ=[-6.2,-4.3,-2,0,2,4.3,6.2],DY=[Q,Q+.55,Q+1.2,Q+1.45,Q+1.2,Q+.55,Q];
  const top=z=>{for(let i=0;i<DZ.length-1;i++)if(z<=DZ[i+1]){const f=(z-DZ[i])/(DZ[i+1]-DZ[i]);return DY[i]+(DY[i+1]-DY[i])*f+.15;}return Q+.15;};
  const ai=z=>.55+1.5*Math.sqrt(Math.max(0,25-(Math.abs(z)+1)*(Math.abs(z)+1)))/Math.sqrt(24);   /* the pointed intrados */
  for(let i=0;i<DZ.length-1;i++){etSheet('paving',[-BW,DY[i],DZ[i]],[BW,DY[i],DZ[i]],[-BW,DY[i+1],DZ[i+1]],.3,pv);
   for(const s of [-1,1])beam('stone',[s*(BW-.12),top(DZ[i])+.45,DZ[i]],[s*(BW-.12),top(DZ[i+1])+.45,DZ[i+1]],.26,sd,false,undefined,.9);}
  const N=16;for(let k=0;k<N;k++){const z0=-hw+k*ET_CANAL_W/N,z1=z0+ET_CANAL_W/N,a=ai(z0),b=ai(z1);
   etPoly('stone',[[BW,a,z0],[BW,top(z0)-.15,z0],[BW,top(z1)-.15,z1],[BW,b,z1]],sd);
   etPoly('stone',[[-BW,a,z0],[-BW,b,z1],[-BW,top(z1)-.15,z1],[-BW,top(z0)-.15,z0]],sd);
   etSheet('stone',[-BW,a,z0],[BW,a,z0],[-BW,b,z1],.1,new THREE.Color(sd).multiplyScalar(.8));}
  for(const s of [-1,1]){box('stone',0,0,s*5.15,2*BW,Q+.25,2.1,sd);
   etHead(s*(BW+.18),2.06,0,.55,{metal:'bronze',ry:s*PI/2});
   for(const sx of [-1,1]){box('stone',sx*(BW-.12),Q,s*6.05,.42,1.25,.42,sd);
    cyl('verdigris',sx*(BW-.12),Q+1.25,s*6.05,.06,1.6,P('verdigris'),6);box('glass',sx*(BW-.12),Q+2.85,s*6.05,.24,.34,.24,P('glassLit'));
    cone('verdigris',sx*(BW-.12),Q+3.19,s*6.05,.2,.3,P('verdigris'),4);}}}});

/* the canal street: sixty metres of canal between quays of made ground, the bridge at its middle, verdigris lamps along
   the quays, and every tier of dwelling facing the water: on the north quay the corner turret, a canal house, the
   merchant's house, a second canal house and a canal row; on the south the block hut, the reed house, a canal row, the
   court house and a canal house. The houses are nested records of the street (place() inside a builder) */
const ET_STREET={L:60,north:['et_corner_turret','et_canal_house','et_merchant_house',{key:'et_canal_house',v:1},'et_canal_row'],
 south:['et_block_hut','et_reed_house','et_canal_row','et_court_house','et_canal_house']};
defBuilding({key:'et_canal_street',name:'The canal street',seed:7703,cls:'feature',kind:'street',w:66,d:50,h:18,budget:1800000,
 front:{x:0,z:25,yaw:0},tags:{types:['infrastructure']},
 note:'a canal between quays of made ground, a bridge at the middle, lamps along the quays, and every tier of dwelling facing the water',
 build(o){const L=ET_STREET.L,Q=ET_QUAY,hw=ET_CANAL_W/2,sd=P('stoneD'),FZ=hw+.6+4;
  for(const s of [-1,1]){box('stone',0,0,s*(hw+.6+10),L,Q,20,sd);box('paving',0,Q-.03,s*(hw+.6+10),L,.04,20,P('paving'));
   for(const ex of [-1,1])for(let k=0;k<5;k++)box('stone',ex*(L/2+.175+k*.35),0,s*(hw+2.6),.35,Q-.2*(k+1),4,sd);   /* the steps down at the ends */
   box('stone',s*(L/2+.2),0,0,.4,Q+.15,ET_CANAL_W,sd);}                                     /* the canal's end walls */
  for(const x of [-20,0,20])place('et_canal',x,0,0,{y:0});
  place('et_bridge',0,0,0,{y:0});
  for(const s of [-1,1])for(const x of [-25,-15,-5,5,15,25]){const z=s*(hw+1.0);
   cyl('verdigris',x,Q,z,.08,3.3,P('verdigris'),6);beam('verdigris',[x,Q+3.1,z],[x,Q+3.1,z-s*.6],.05,P('verdigris'));
   box('glass',x,Q+2.7,z-s*.6,.26,.36,.26,P('glassLit'));cone('verdigris',x,Q+3.06,z-s*.6,.22,.28,P('verdigris'),4);}
  // the houses: a row on each quay, fronts on the quay's inner line, facing the canal
  for(const [side,s] of [['north',-1],['south',1]]){const ks=ET_STREET[side].map(k=>typeof k==='string'?{key:k}:k);
   const ws=ks.map(k=>DEFS[k.key].w),tot=ws.reduce((a,c)=>a+c,0)+(ks.length-1)*1.0;let x=-tot/2;
   ks.forEach((k,i)=>{const D=DEFS[k.key];place(k.key,x+ws[i]/2,s*(FZ+D.d/2),s<0?0:PI,{y:Q,v:k.v|0});x+=ws[i]+1.0;});}}});
