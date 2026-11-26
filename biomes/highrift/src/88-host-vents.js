// ================================================================= HOST — the station's placement (89z runs STATION_BUILD; PLAN.md sections 4 and 5)
// On the heat (48: KTHERM's bake): the Hearths' fields on every vent hot enough to hold one (biomes/hearths, read in place: HEARTH.layout, the 'rim' dress:
// High Rift's vents stand on 1.0-1.16 atm ground, between Oidong's cold rim and the Rift rim), the rift's own life (HRIFT.buildRift: opal cane, bead cap,
// verdigris wort, steam heath, tussock), the high country on the cold stations (biomes/oidong, read in place: OIDONG.buildHigh's cushions, snow lotus
// and sky poppies off the warm ground and the water), a station's own (STATION_EXTRA: the Mirror's larch), and the singing crystals on the gja's walls.
const HEARTH_ON=typeof HEARTH!=='undefined'&&new URLSearchParams(location.search).get('hearths')!=='0';
const HIGH_ON={wedge:1,coulee:1,gjar:1}[SKEY]&&typeof OIDONG!=='undefined'&&!!OIDONG.buildHigh;
const GRASS={cataract:.9,mirror:.7,wedge:.45,coulee:.6,gjar:.25}[SKEY];   /* the gjar and the Mirror thinned to the showcase budget (15.4M and 7.1M tris in the first pass) */
const DRY=(x,z)=>{const w=waterH(x,z);return w<-1e8||terrainH(x,z)>w+.3?1:0;};
// the crystals' wall points: along each fissure of the swarm (and the master gja's inner walls), both walls, at depths down the slot
function comboWalls(){const out=[];if(SKEY!=='gjar')return out;const st=SITE.strike,nrm=[st[1],-st[0]];
 L.SW.forEach((F,fi)=>{for(let l=-F.len/2+40;l<F.len/2-40;l+=7){for(const side of [-1,1]){reseed(KRAND.hash(7400+fi,Math.round(l),side+2));if(rng()>.55)continue;
   const a=side*(F.w/2-1.2),x=F.x+st[0]*l+nrm[0]*a,z=F.z+st[1]*l+nrm[1]*a,top=L.plateau(x,z),y=top-rr(1.5,Math.min(F.d*.7,24));
   out.push({x,y,z,nx:-side*nrm[0],nz:-side*nrm[1],s:rr(.7,1.4)});}}});
 for(let l=-1800;l<=1800;l+=40){for(const side of [-1,1]){reseed(KRAND.hash(7499,Math.round(l),side+2));if(rng()>.5)continue;const hw=L.mHalf(l),a=L.mOff(l)+side*(hw-78),x=st[0]*l+nrm[0]*a,z=st[1]*l+nrm[1]*a;
  out.push({x,y:terrainH(x,z)+rr(2,12),z,nx:-side*nrm[0],nz:-side*nrm[1],s:rr(1.4,2.6)});}}
 return out;}
const STATION_BUILD=function(Q){Q=Q==null?1:Q;const st={};
 if(HEARTH_ON){HEARTH.parts('rim');BIO.cur='hearths/field';st.hearths=[];
  SITE.vents.filter(v=>v.reach>=150).forEach((v,i)=>{try{const F=HEARTH.layout({therm:THERM_F,at:[v.x,v.z],R:Math.min(260,v.reach*1.1),dress:'rim',seed:KRAND.hash(7120,SITE.px[0]+i,SITE.px[1]),toward:{az:0,alt:40},
   ground:terrainH,mask:(x,z)=>BIO.mask(x,z)*DRY(x,z),deadRings:[v.reach*.8,v.reach*1.05],q:Q});st.hearths.push(F.counts);}catch(e){reportErr('hearths: '+e.stack);}});}
 BIO.cur='highrift/rift';Object.assign(st,HRIFT.buildRift(TERR.R-150,Q,{heat:HEAT_AT,acid:ACID_AT,grass:GRASS,keep:DRY}));
 if(HIGH_ON){BIO.cur='oidong/high';const cairns=(SITE.cairns||[]).map(c=>[c[0],c[1],c[2]]);
  st.high=OIDONG.buildHigh(TERR.R-150,Q*(SKEY==='wedge'?1:SKEY==='gjar'?.45:.7),{cairns,walls:[],keep:(x,z)=>HEAT_AT(x,z)<8&&DRY(x,z)?1:0});
  if(OIDONG.COUNTS)OIDONG.COUNTS=OIDONG.SPECIES.map(()=>0);if(OIDONG.TREES)OIDONG.TREES.length=0;if(OIDONG.STONES)OIDONG.STONES.length=0;}
 if(typeof STATION_EXTRA==='function'){try{st.extra=STATION_EXTRA(Q);}catch(e){reportErr('station extra: '+e.stack);}}
 if(SKEY==='gjar'){BIO.cur='highrift/crystals';st.crystals=HRIFT.combs(comboWalls(),Q);}
 BIO.cur=null;return st;};
