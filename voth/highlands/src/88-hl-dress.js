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
 D.build=function(G,o){inner(G,o);reseed(24001+(o.v|0));const c=VERN.cur;
  if(HDRESS.portal.includes(k)&&c.doors&&c.doors.length){const front=c.doors.filter(d=>Math.abs(Math.sin(d.ry))<.1&&Math.cos(d.ry)>0);if(front.length)hnPortal(front.reduce((a,b)=>b.w>a.w?b:a));}
  if(HDRESS.sign.includes(k))hnSignPost(D.w/2-1.3,D.d/2-.8,0,null,3.2);};}
