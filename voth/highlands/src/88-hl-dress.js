// ================================================================= HIGHLANDS — round-2 dressing pass (signs, carved portals)
// Runs AFTER every builder of the kit has been defined: wraps selected defs' build() so that, when a building is
// placed, it also gets
//   * a trade sign on a signpost at the front corner of the plot (shops, smithies, stables, guilds … that had none),
//   * a carved PORTAL — two carved pillars and a painted lintel — framing its main front door.
// The main door is recorded by vnDoor (below) in the building's local frame. Seeds 24000–24099.
vnDoor=(function(base){return function(x,y,z,ry,w,h){const c=VERN.cur;if(c){(c.doors||(c.doors=[])).push({x,y,z,ry:ry||0,w,h});}return base.apply(this,arguments);};})(vnDoor);
// signpost: a post, an arm toward +x, the trade roundel hanging from it (front of the plot faces +z)
function hnSignPost(x,z,ry,sym,h){h=h||3.2;const I=hC(0x2e2a26),c=hC(vPick(HPAL.tar));vB('vStone',x,0,z,.5,.25,.5,ry,hC(vPick(HPAL.rubble)));vPst('vPost',x,.2,z,.09,h,c);
 kput('hPaintBall',[x,.2+h+.08,z],null,[.13,.13,.13],hC(HPAL.gold[0]));const p=loc(x,z,.05,0,ry+Math.PI/2);hnSign(x,.2+h-.3,z,ry+Math.PI/2,sym,.9);}
// carved portal round a door record d: pillars just outside the jambs, a lintel with a frieze above the door head
function hnPortal(d){const u=d.w/2+.42,top=d.h+.55,rot=d.ry;const P=(lu,lo)=>loc(d.x,d.z,lu,lo,rot);
 for(const s of[-1,1]){const p=P(s*u,.32);hnPillar(p[0],0,p[1],.17,d.y+top,rot,{});}
 const l=P(0,.32);vB('vWood',l[0],d.y+top,l[1],2*u+.7,.26,.5,rot,hC(vPick(HPAL.tar)));hnFrieze(l[0],d.y+top+.03,l[1]+0,rot,2*u+.5,.22);}
const HDRESS={
 sign:['hl_rep_market_hall','hl_rep_smithy_small','hl_rep_smithy_large','hl_rep_stables','hl_rep_warehouse_b','hl_rep_hospital','hl_rep_school',
  'hl_rep_guild_merc','hl_rep_guild_alch','hl_rep_guild_farm','hl_rep_guild_smith','hl_rep_guild_mech','hl_rep_forgehouse','hl_rus_smithy'],
 portal:['hl_rep_tavern_b','hl_rep_inn','hl_rep_school','hl_rep_hospital','hl_rep_guild_farm','hl_rep_house_rich_c','hl_rus_tavern','hl_rus_house_mid_a','hl_rus_farmhouse'],
};
for(const k of new Set([...HDRESS.sign,...HDRESS.portal])){const D=VERN.defs[k];if(!D)continue;const inner=D.build;
 D.build=function buildHlDressed(G,o){inner(G,o);reseed(24001+(o.v|0));const c=VERN.cur;
  if(HDRESS.portal.includes(k)&&c.doors&&c.doors.length){const front=c.doors.filter(d=>Math.abs(Math.sin(d.ry))<.1&&Math.cos(d.ry)>0);if(front.length)hnPortal(front.reduce((a,b)=>b.w>a.w?b:a));}
  if(HDRESS.sign.includes(k))hnSignPost(D.w/2-1.3,D.d/2-.8,0,null,3.2);};}

// ---------------------------------------------------------------- RECLAIMED variants (round 3)
// Travis: "add a variant to residential, shop, agricultural, smithies, warehouse, and tavern that uses more
// reclaimed metal". Every such def gets a twin `<key>_reclaimed` ("… (reclaimed)") in the same family row. The twin
// runs the SAME builder with the same seed — so it is visibly the same building — under a salvage filter on kput:
//   * roof skins (shingle, scale, thatch, turf boxes and roof wedges) become corrugate, rusted plate or bleached
//     Ancient panel, with smaller sheets patched over them;
//   * big wall boxes (logs, boards, render, bamboo mat) are either replaced by corrugate / rust or keep their
//     material and get sheets nailed over their faces; gable ends go corrugate;
//   * some posts become rusted pipe;
// then the builder's plot gets a stovepipe and a small scrap pile. The share of metal falls with wealth.
// Choices hash the instance position (h3) instead of drawing from the PRNG, so the base layout is untouched.
kdef('hGableR',VGABLE,MAT.rust);kdef('hHipR',VHIP,MAT.rust);kdef('hPyrR',VPYR,MAT.rust);
const HSALV={
 roofBox:new Set(['vShingleB','hScaleB','hTurfB','vThatchB','vCopperB']),
 roofGable:new Set(['vGableS','vGableT','hGableSc','hGableTurf','vGableCu']),roofHip:new Set(['vHipS','vHipT','hHipSc','hHipTurf','hHipSh','vHipCu']),
 roofPyr:new Set(['vPyrS','vPyrT','vPyrSh','hPyrSc','vPyrCu']),gableEnd:new Set(['vGableW','hGableLog','vGablePl','hGableBM']),
 wall:new Set(['hLogB','vWood','vPlaster','hBMatB','hRUBoardV']),post:new Set(['vPost','vPostB']),
 share:{poor:.75,middle:.5,rich:.25,civic:.3},
};
let _hlSalvBusy=false;
const _hlKputSalv=kput;
kput=function(name,p,q,s,c){const C=VERN.cur;if(_hlSalvBusy||!C||!C.o.salvage)return _hlKputSalv(name,p,q,s,c);
 const sh=HSALV.share[C.D.tags.wealth]||.5,S=Array.isArray(s)?s:[s,s,s],big=Math.max(S[0],S[2]),hh=h3(p[0]*1.3,p[1]*2.1,p[2]*.7),h2=h3(p[2]*.9,p[0]*1.7,p[1]*3.1);
 const put=(n,pp,qq,ss,cc)=>{_hlSalvBusy=true;try{_hlKputSalv(n,pp,qq,ss,cc);}finally{_hlSalvBusy=false;}};
 // sheets laid over a box instance: on its top (roofs) or its sides (walls), a few degrees off square
 const patch=(onTop,n)=>{const Q=q||new THREE.Quaternion();for(let k=0;k<n;k++){const r1=h3(p[0]+k*3.1,p[2],k),r2=h3(p[2]+k*1.7,p[0],k+5),r3=h3(k,p[1],p[0]);
   const item=r3<.45?'vSheet':r3<.8?'vPlate':'vPlateW';
   if(onTop){const lp=new THREE.Vector3((r1-.5)*S[0]*.8,S[1]/2+.03,(r2-.5)*S[2]*.8).applyQuaternion(Q);
    const qq=Q.clone().multiply(qEuler(-Math.PI/2,0,(r3-.5)*.2));put(item,[p[0]+lp.x,p[1]+lp.y,p[2]+lp.z],qq,[rr2(1.2,2.6,r1),rr2(1,2.2,r2),1],null);}
   else{const face=Math.floor(r3*4)%4,ax=face<2?0:2,sg=face%2?-1:1;if(S[ax===0?2:0]<1.4||S[1]<1.4)continue;
    const off=new THREE.Vector3(ax===0?sg*(S[0]/2+.04):(r1-.5)*S[0]*.7,(r2-.5)*S[1]*.6,ax===2?sg*(S[2]/2+.04):(r1-.5)*S[2]*.7).applyQuaternion(Q);
    const face_q=Q.clone().multiply(qEuler(0,ax===0?sg*Math.PI/2:(sg>0?0:Math.PI),(r2-.5)*.18));
    put(item,[p[0]+off.x,p[1]+off.y,p[2]+off.z],face_q,[rr2(1,2.4,r1),rr2(.9,2,r2),1],null);}}};
 const rr2=(a,b,t)=>a+(b-a)*t;
 if(HSALV.roofBox.has(name)&&big>2.4&&hh<sh+.2){const n2=hh<(sh+.2)*.5?'vCorr':h2<.5?'vRustB':'vPanelB';put(n2,p,q,s,null);patch(true,2+Math.floor(h2*3));return;}
 if(HSALV.roofGable.has(name)&&big>2&&hh<sh+.2){put(h2<.6?'vGableC':'hGableR',p,q,s,null);return;}
 if(HSALV.roofHip.has(name)&&big>2&&hh<sh+.2){put(h2<.6?'vHipC':'hHipR',p,q,s,null);return;}
 if(HSALV.roofPyr.has(name)&&big>2&&hh<sh+.2){put(h2<.6?'vPyrC':'hPyrR',p,q,s,null);return;}
 if(HSALV.gableEnd.has(name)&&big>2&&hh<sh){put('vGableC',p,q,s,null);return;}
 if(HSALV.wall.has(name)&&big>2.2&&S[1]>1.6){if(hh<sh*.35){put(h2<.55?'vCorr':'vRustB',p,q,s,null);return;}const r=_hlKputSalv(name,p,q,s,c);if(hh<sh+.25)patch(false,1+Math.floor(h2*3));return r;}
 if(HSALV.post.has(name)&&S[1]>1.2&&hh<sh*.4){put('vPipeR',p,q,s,null);return;}
 return _hlKputSalv(name,p,q,s,c);};
// a stovepipe and a scrap pile at the back corner of the plot, after the building
function hnSalvDress(D){const x=-D.w/2+1.4,z=-D.d/2+1.2;vnChimney(D.w*.18,Math.min(D.h*.55,6),-D.d*.12,2.2,.14,true);
 for(let k=0;k<7;k++){const a=h3(k,D.w,1),b=h3(k,D.d,2);kput(['vPlate','vSheet','vPlateW'][k%3],[x+(a-.5)*1.8,.25+k*.04,z+(b-.5)*1.4],qEuler(-Math.PI/2+(a-.5)*.5,a*3,(b-.5)*.4),[rr(1,1.8),rr(.8,1.4),1],null);}
 vPst('vPipeR',x+.9,0,z+.6,.12,.8,null);vPst('vTankR',x-.6,0,z-.3,.35,.9,null);}
const HSALV_TYPES=['single-family dwelling','multi-family dwelling','market/shop','farm','tavern/inn'];
for(const k of VERN.order.slice()){const D=VERN.defs[k];if(!D.branch||k.endsWith('_reclaimed'))continue;const ty=D.tags.type||[];
 const ok=(ty.some(t=>HSALV_TYPES.includes(t))||/smithy|warehouse/.test(k))&&D.tags.wealth!=='civic'&&!D.tags.landmark;if(!ok)continue;
 const T=Object.assign({},D.tags,{salvage:true});delete T.culture;delete T.kit;
 HL.def({key:k+'_reclaimed',baseKey:k,name:D.name+' (reclaimed)',branch:D.branch,family:D.family,tags:T,w:D.w,d:D.d,h:D.h,
  build:function buildHlReclaimed(G,o){reseed(24051+(o.v|0));o.salvage=true;D.build(G,o);hnSalvDress(D);
   for(let i=VERN.cur.r0;i<REG.length;i++)if(!/reclaimed/.test(REG[i].name))REG[i].name+=' — reclaimed';}});}
