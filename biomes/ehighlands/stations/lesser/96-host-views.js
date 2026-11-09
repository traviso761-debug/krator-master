// ================================================================= HOST — station 3's preset views, its negatives' points, its own check (the Lesser Throne)
const HI=[Math.sin(A_HI)*rimR(A_HI)*.99,-Math.cos(A_HI)*rimR(A_HI)*.99],LO=[Math.sin(A_LO)*rimR(A_LO),-Math.cos(A_LO)*rimR(A_LO)];
const OASIS=(function(){let b=null;for(const T of EHIGH.TREES){if(T.lv<2)continue;if(!b||BIO.lodD(T.x,T.z)<BIO.lodD(b.x,b.z))b=T;}return b||{x:VENTS[7].x,z:VENTS[7].z,y0:terrainH(VENTS[7].x,VENTS[7].z),H:1,crownR:2};})();
const VIEWS={
 'The caldera from the high rim':[HI[0],terrainH(HI[0],HI[1])+3,HI[1],CONE.x,FLOOR+60,CONE.z],
 'The young cone steaming':(function(){const x=CONE.x-700,z=CONE.z+420;return[x,gh(x,z,6),z,CONE.x,FLOOR+CONE.h*.7,CONE.z];})(),
 "Into the cone's crater":(function(){const x=CONE.x+CONE.cr*1.25,z=CONE.z;return[x,gh(x,z,2),z,CONE.x-20,FLOOR+CONE.h-CONE.cd+5,CONE.z];})(),
 'A fumarole oasis - cushions turned to the giant':(function(){const T=OASIS;return atTree(T,Math.max(4,T.crownR*3),GAZ+Math.PI,1.5,.2);})(),
 'The frozen lake under the high rim':(function(){const x=TARN.x+TARN.r*2.2,z=TARN.z+TARN.r*.8;return[x,gh(x,z,4),z,TARN.x,TARNL+2,TARN.z];})(),
 'The breach and the flow':(function(){const x=LO[0]-500,z=LO[1]-250;return[x,gh(x,z,25),z,LO[0]+300,gh(LO[0]+300,LO[1]+120,0),LO[1]+120];})(),
 "The skylight of the buried archive":(function(){const x=SKY_HOLE.x-30,z=SKY_HOLE.z+18;return[x,gh(x,z,3),z,SKY_HOLE.x,terrainH(SKY_HOLE.x,SKY_HOLE.z)-4,SKY_HOLE.z];})(),
 'From afar':look(-4000,3600,420,0,0,200),
};
const NEG={wet:[TARN.x,TARNL-3,TARN.z],
 cliff:(function(){let bx=0,bz=0,bs=-1;for(let z=-3600;z<=3600;z+=16)for(let x=-3600;x<=3600;x+=16){const s=FIELD.slope(x,z)*FIELD.rock(x,z);if(s>bs){bs=s;bx=x;bz=z;}}return[bx,bz];})(),
 env:[[CONE.x,CONE.z],[TARN.x+400,TARN.z],[VENTS[8].x,VENTS[8].z]]};
/* the station's own check: nothing lives but on the warm ground (every plant within the vents' warmth: warm over .1) */
const OASES=T=>{const bad=T.filter(t=>warmAt(t.x,t.z)<.1);return{name:'life only on the vents\' warm ground',ok:T.length>0&&!bad.length,detail:bad.length?bad.length+' of '+T.length+' plants on cold ash (first at '+[bad[0].x|0,bad[0].z|0]+')':T.length+' plants, every one on warm ground'};};
STAGE.checks=[()=>OASES(EHIGH.TREES)];
STAGE.negatives=[()=>Object.assign(OASES([{x:HI[0],z:HI[1]}]),{name:'a plant on the high rim\'s snow'})];
