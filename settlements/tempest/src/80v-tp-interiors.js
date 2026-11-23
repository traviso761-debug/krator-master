// ================================================================= THE HOUSE OF THE TEMPEST — the interiors (step 3)
// The House's stacks hollow and furnished, as the Xanadui fort's are (kits/xanadu/src/80g-xa-fort.js, F4: xfIxItems and the set
// `xanadu-fort`): one item per ward def, written from TEMPEST's plan, each building the wards draw as a battered stack an INSET body
// on the footprint its storeys share, its doors where the builder draws them, a room programme per storey from the blueprint's
// sheets (settlements/strongwall/tempest: T1, T2 and U). A page with Xanadu's interiors on (settlements/xanadu 89y, and this page's
// targets/house/89xs) then draws those bodies hollow, unlocks their doors, plans, furnishes and floors the rooms in core/walk.
// Only a KEPT House is furnished. The towers, gatehouses, the utse's chapel and the Storm Tower stay solid; the granary, the hay
// sheds and the cisterns have no rooms. The violet monastery's own rooms are the Qiblai kit's (KNOWN_ISSUES.md). [G data] records.
const TP_IXKEY={outer:'xa_tempest_outer',inner:'xa_tempest_inner'},TP_IXSTATE={state:null};
function tpIxItems(){const R3=v=>Math.round(v*1000)/1000;
 /* the fort's inset() and stack(), on the kit's own batter (xnBatterK) */
 const inset=(P,id,o)=>{const w=R3(P[1]-P[0]),d=R3(P[3]-P[2]),cx=R3((P[0]+P[1])/2),cz=R3((P[2]+P[3])/2);
  const doors=(o.doors||[]).map(D=>{const x=D.at[0],z=D.at[1],ex=Math.min(Math.abs(x-P[0]),Math.abs(x-P[1])),ez=Math.min(Math.abs(z-P[2]),Math.abs(z-P[3]));
   const outX=x<P[0]||x>P[1],outZ=z<P[2]||z>P[3],onX=outX&&!outZ?true:outZ&&!outX?false:ex<ez;
   const at=onX?[x<cx?P[0]:P[1],Math.max(P[2]+.6,Math.min(P[3]-.6,z))]:[Math.max(P[0]+.6,Math.min(P[1]-.6,x)),z<cz?P[2]:P[3]];
   return Object.assign({},D,{at:[R3(at[0]),R3(at[1])]});});
  return Object.assign({id,poly:[[cx-w/2,cz-d/2],[cx+w/2,cz-d/2],[cx+w/2,cz+d/2],[cx-w/2,cz+d/2]].map(p=>[R3(p[0]),R3(p[1])]),y:o.y==null?0:o.y,
   levels:o.hs.map(h=>({h})),wall:.45,roof:'flat',doors,program:o.program,inset:true},o.windows===false?{windows:false}:{});};
 const stack=(cx,cz,w,d,hs,o)=>{let ww=w,dd=d;hs.forEach(h=>{const k=xnBatterK(ww,h,dd);ww*=k;dd*=k;});return inset([cx-ww/2,cx+ww/2,cz-dd/2,cz+dd/2],o.id,Object.assign({},o,{hs}));};
 /* the rooms of each range, storey by storey (the blueprint's T1 below, T2 above; a range's bays share its length) */
 const n=L=>Math.max(2,Math.round(L/8.5)),rep=(k,m)=>Array.from({length:m},()=>k);
 const RANGE={
  'east.n':m=>[['guard','armoury','armoury','study'],['barracks','store','armoury','bedroom']],   /* the gate's guard, the Sword Hall, the Marshal's Hall; the gate watch, the Bow Loft, the Quiver House, the Marshal */
  'east.s':m=>[['guard','stable','stable','living'],['barracks','store','store','bedroom']],     /* the guard, the Gate Stable, the guest house; the grooms, the hay loft, the guest chambers */
  'novices.n':m=>[['school','school','hall','kitchen'],['dormitory','dormitory','dormitory','dormitory']],
  'novices.w':m=>[['study','armoury','bath'],['dormitory','dormitory','dormitory']],
  'novices.s':m=>[['hall','hall','hall'],['dormitory','dormitory','study']],                       /* the Hall of the Bow; the elder novices, the masters of arms */
  refectory:m=>[['hall','hall','hall','hall'],['gallery','gallery','gallery','gallery']],          /* the Great Refectory, its gallery under the roof */
  kitchens:m=>[['kitchen','kitchen','kitchen','store'],['dormitory','dormitory','dormitory','dormitory']],   /* the great kitchen, the bakehouse; the lay brothers */
  larder:m=>[['store','store','store','store'],['study','store','store','store']],                 /* the larder, the dairy; the Cellarer */
  infirmary:m=>[['hall','hall','hall','hall','study','store'],['dormitory','dormitory','dormitory','dormitory','study','bedroom']]};
 const STABLES=m=>[rep('stable',m),rep('barracks',m-1).concat(['study'])];   /* the stalls below; a company's hall and its captain above */
 const SMALL={smithy:'smithy',bowyers:'workshop',apothecary:'study',bath:'bath'};
 const UTSE=[['guard','lobby','store'],['war_room','study'],['hall','antechamber'],['audience','bedroom','study'],['signals','store']];   /* sheet U: the inner gate's keepers and the runners; the War Room and the raid ledger; the Hall of the Banner; the Prismarch; the signal codes */
 const items=(Q,key,utse)=>{const B=[];
  for(const b of Q.buildings){const x=b.at[0],z=b.at[1],w=b.w,d=b.d,h=b.h,front=z>0?-1:1;
   if(b.kind==='range'||b.kind==='stable-range'){const alongZ=d>w,L=alongZ?d:w,D=alongZ?w:d,ry=alongZ?Math.PI/2:0,face=alongZ?(x>0?-1:1):(z>0?-1:1),nd=Math.max(1,Math.round(L/9)),doors=[];   /* xfRange: two storeys on a 0.6 m plinth, a door a bay on the ward face */
    for(let i=0;i<nd;i++){const q=loc(x,z,-L/2+L*(i+.5)/nd,face*(D/2),ry);doors.push({at:[R3(q[0]),R3(q[1])],w:1.2});}
    const prog=b.kind==='stable-range'?STABLES(n(L)):(RANGE[b.id]||(m=>[rep('store',m),rep('store',m)]))(n(L));
    B.push(stack(x,z,w,d,[3.3,3.1],{id:b.id,y:.6,doors,program:prog}));}
   else if(SMALL[b.id]||b.kind==='smithy')B.push(stack(x,z,w,d,[h],{id:b.id,y:0,doors:[{at:[x,z+front*d/2],w:1.8}],program:[SMALL[b.id]||'workshop']}));}
  if(utse){const U=utse,hs=[4.8,4.3,4.3,4.3,4.3];   /* xfKeep: five storeys on its 1.2 m plinth, its door on the +z (east) face */
   B.push(stack(U.at[0],U.at[1],U.w,U.d,hs,{id:'utse',y:1.2,doors:[{at:[U.at[0],U.at[1]+U.d/2],w:1.8}],program:UTSE}));}
  const name=VERN.defs[key]?VERN.defs[key].name:key;
  return{key,name,culture:'xanadu',wealth:.7,types:['military','religious','multi-family dwelling'],lot:[Q.w==null?200:Q.w,Q.d==null?300:Q.d],bodies:B,
   note:'the House\'s stacks hollow (settlements/tempest 80v, step 3): the ranges, the companies\' halls over the stables, the novices\' court, the refectory block, the utse, the inner ward\'s buildings; towers, gatehouses and the chapel solid'};};
 return[items(TP_OUTER,TP_IXKEY.outer,TP_PLAN.utse),items(TP_INNER,TP_IXKEY.inner,null)];}
/* the set, on a page that has the interiors core (KratorInteriors: Xanadu's 69d bundle, on with ?interiors=1 or targets/house/89xs);
   a skip while the House being placed is damaged or ruined (TP_IXSTATE, set before each placement: the hollow wrap reads the
   item as the def is built) */
if(typeof KratorInteriors!=='undefined'&&KratorInteriors.sets&&!KratorInteriors.sets.byName['xanadu-tempest']){
 const S=KratorInteriors.sets.add({set:'xanadu-tempest',title:'Xanadu: the House of the Tempest (step 3)',culture:'xanadu',items:tpIxItems()});
 for(const it of S.items)if(!it.skip)Object.defineProperty(it,'skip',{configurable:true,enumerable:true,
  get:()=>TP_IXSTATE.state&&TP_IXSTATE.state!=='kept'?'the House is '+TP_IXSTATE.state+': its stacks have lost storeys or stand as low walls':undefined});
 const p0=VERN.place;VERN.place=function(sc,key,x,z,ry,o){if(!VERN.cur&&/^xa_tempest_(outer|inner)$/.test(key))TP_IXSTATE.state=(o&&o.state)||XF_STATES[xV(o||{})]||'kept';return p0.apply(this,arguments);};}
