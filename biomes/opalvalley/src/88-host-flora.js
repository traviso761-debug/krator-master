// ================================================================= HOST — the station's placement (89z runs STATION_BUILD; PLAN.md sections 3.2 and 6)
// The Xanadu kin (OPAL.buildKin: Xanadu's own builders, BIO.kin) and the station's edge species (the Rift's at the mouth), the kit's own plants
// (OPAL.buildOwn), and on the cold stations Oidong's high country read in place (OIDONG.buildHigh: cushions, the snow lotus, sky poppies) off the water,
// the ice and the warm ground. The diggings and the sites are kept bare (their pits, spoil, timber and stakes).
const HIGH_ON={glacier:1,upperbed:1}[SKEY]&&typeof OIDONG!=='undefined'&&!!OIDONG.buildHigh;
const GRASS={glacier:.4,upperbed:.6,middlebed:.55,lowerbed:.45,riftmouth:.5}[SKEY];
const DRY=(x,z)=>{const w=waterH(x,z);return w<-1e8||terrainH(x,z)>w+.3?1:0;};
const KEEP=(x,z)=>{if(!DRY(x,z))return 0;for(const r of DIGS){const d=Math.hypot(x-r.x,z-r.z);if(d<(r.kind==='placer'?r.r+3:r.kind==='adit'?9:r.kind==='sluice'?r.len*.6+2:8))return 0;
  const s=r.spoil;if(s&&Math.hypot(x-s.x,z-s.z)<Math.max(s.len,s.w)*.55)return 0;}
 for(const s of SITE.sites||[])if(Math.hypot(x-s.x,z-s.z)<s.r)return 0;return 1;};
/* the lakes' pads only on the lakes (not the steps' small pools, not the streams) */
const ON_LAKE=(x,z)=>{if(!TREADS)return 0;const ti=FLOOR.tread(x);return ti>=0&&TREADS[ti].kind==='lake'?1:0;};
const _BM=[0,0,0,0,0];   /* the ground's masks (84): its sinter channel keeps the ferns off the crust */
const STATION_BUILD=function(Q){Q=Q==null?1:Q;const st={};
 try{BIO.cur='opalvalley/kin';st.kin=OPAL.buildKin(TERR.R-150,Q,{station:SKEY,keep:KEEP});}catch(e){reportErr('kin: '+e.stack);}
 try{BIO.cur='opalvalley/own';Object.assign(st,OPAL.buildOwn(TERR.R-150,Q,{station:SKEY,keep:KEEP,water:waterH,heat:HEAT_AT,grass:GRASS,lake:ON_LAKE,bare:(x,z)=>{masksAt(x,z,0,_BM);return _BM[0];}}));}catch(e){reportErr('own: '+e.stack);}
 if(HIGH_ON){try{BIO.cur='oidong/high';st.high=OIDONG.buildHigh(TERR.R-150,Q*(SKEY==='glacier'?.8:.5),{cairns:[],walls:[],keep:(x,z)=>KEEP(x,z)&&ICE(x,z)<.3&&HEAT_AT(x,z)<12?1:0});
  if(OIDONG.COUNTS)OIDONG.COUNTS=OIDONG.SPECIES.map(()=>0);if(OIDONG.TREES)OIDONG.TREES.length=0;if(OIDONG.STONES)OIDONG.STONES.length=0;}catch(e){reportErr('oidong high: '+e.stack);}}
 BIO.cur=null;return st;};
