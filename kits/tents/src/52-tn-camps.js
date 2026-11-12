// prefix: tn
// ================================================================= TWO SAMPLE CAMPS, pitched by core/camp (KCAMP)
// The camps are laid out by core/camp as plain records (KCAMP.tentProgram + KCAMP.pitch for a band, KCAMP.halt for a caravan)
// from the kit's declared boxes (tnDims, grown by each role's yard: KCAMP.tentDims); each record is then placed as a child of
// the camp's def with its role, its trade and its people's dress. The camp's records, census and check are kept (TN_CAMPS) for
// the probe (verify.py).
//   tn-camp-band   a Scyvoi band's ring: the chief's great yurt opposite the way in, the council marquee, five family yurts,
//                  two sleeping yurts, the smith's, the hidemaker's and the seer's tents, the supply tent, the guard's, the mess;
//                  the stable fly and the latrine screen downwind
//   tn-camp-halt   an Iziz merchant house's caravan at its night halt: eight wagons in a laager round the house's marquee, the
//                  mess fly and two trade awnings inside, the guards' wedges at the gate, the picket line behind, the latrine
function tnCampDims(pkey){return tnDims(KCAMP.tentParse(pkey).key);}
const TN_CAMPS={};
function tnCampLay(id){const dims=KCAMP.tentDims(tnCampDims),ground={ok:()=>true};
 if(id==='band'){const P=KCAMP.tentProgram({id:'band',culture:'scyvoi',households:5,sleeping:2,council:true,trades:['smith','hide','seer'],supply:1,guard:1,mess:1,stable:1,latrine:1});
  const camp=KCAMP.pitch({id:'band',world:0,culture:P.culture,program:P.program,site:{x:0,z:0},dims,ground,way:[0,1],formation:'ring'});
  camp.dress=KCAMP.TENTS.CULTURES[P.row.tents].dress;camp.census=KCAMP.census({id:'band',world:0,culture:P.culture,program:P.program});camp.program=P.program;camp.check=KCAMP.check(camp,ground);return camp;}
 const camp=KCAMP.halt({id:'halt',world:0,culture:'iziz',wagons:8,site:{x:0,z:0},way:[0,1],formation:'laager',dims,ground});
 camp.dress=KCAMP.TENTS.CULTURES[camp.culture].dress;camp.check=KCAMP.check(camp,ground,1.2);return camp;}
function tnCampBox(camp){let x=0,z=0;for(const r of camp.records)for(const q of KCAMP.box(r))x=Math.max(x,Math.abs(q[0])),z=Math.max(z,Math.abs(q[1]));return {w:2*x+4,d:2*z+4};}
function tnCampDraw(id){const camp=TN_CAMPS[id],D=tnDress(camp.dress),cell=KRAND.child(0,'camp:'+id)&0xffff;
 camp.records.forEach((r,i)=>{const q=KCAMP.tentParse(r.key),f=tnParse(q.key).form;
  place(q.key,r.x,r.z,r.ry,{y:tnGroundY(r.x,r.z),role:q.role,trade:q.trade,dress:D.key,world:0,cell,index:i,name:r.id,tags:tnTags(q.role,q.trade,D,f)});});
 const C=tnBegin({dress:D.key,world:0,cell,index:9999},'screen');
 try{if(id==='band'){const k=tnGearKey(['{c}_fire_pit','scyvoi_fire_pit','ashnomad_fire_pit']);if(k)FURNISH(k,0,tnGroundY(0,0),0,0,{setting:'outdoor'});
   const s=tnGearKey(['{c}_floor_cushion','scyvoi_floor_cushion','nomad_floor_cushion']);if(s)for(let i=0;i<8;i++){const a=i/8*TAU;FURNISH(s,Math.cos(a)*2.6,tnGroundY(Math.cos(a)*2.6,Math.sin(a)*2.6),Math.sin(a)*2.6,Math.atan2(-Math.cos(a),-Math.sin(a)),{setting:'outdoor'});}}
  else{const k=tnGearKey(['{c}_fire_pit','scyvoi_fire_pit','ashnomad_fire_pit']);if(k)FURNISH(k,4,tnGroundY(4,0),-1,0,{setting:'outdoor'});}}
 finally{tnEnd();}}
for(const id of ['band','halt']){const camp=TN_CAMPS[id]=tnCampLay(id),B=tnCampBox(camp),D=tnDress(camp.dress);
 defBuilding(Object.assign({key:'tn-camp-'+id,front:{x:0,z:+(B.d/2).toFixed(1),yaw:0},seed:id==='band'?7901:7907,cls:'feature',kind:'camp',w:+B.w.toFixed(1),d:+B.d.toFixed(1),h:9,budget:2500000,frag:'kits/tents',
  tags:{culture:D.culture,role:id==='band'?'camp':'caravan-halt',style:camp.formation},build(){tnCampDraw(id);}},
  id==='band'?{name:'A nomad band (KCAMP ring, Scyvoi dress)',note:'core/camp pitched: KCAMP.tentProgram + KCAMP.pitch, ring formation; every tent a child record'}
   :{name:'A caravan halt (KCAMP laager, Iziz dress)',note:'core/camp pitched: KCAMP.halt, laager formation; every tent and wagon a child record'}));}
