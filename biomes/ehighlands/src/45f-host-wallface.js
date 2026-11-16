// ================================================================= HOST — a piece of the eastern Inner Wall's windward face (stations 4-6; 2026-11-09)
// The generator the face's upper stations share (mixed, montane, treeline; station 2's land is its own, the first of them). Station 1 never
// calls it. WALLFACE(o) returns the land's functions; the station's 46-host-land.js names them as every land does (TERR, terrainH, waterH,
// fieldsAt...). The face climbs east: o.y0 at the west edge (m over the station's datum) and o.slope a metre; o.scarps slump scarps (o.P apart,
// o.rise each, half width o.hw), the stream leaving each over a fall at its lip; o.ribs rocky ribs running down the face (z of each, height
// o.ribH), a gully between each pair; the stream in the gully nearest z 0; o.crest (x where the face rounds over the crest, the dry side
// beyond); fields: cold from the absolute height (o.coldAt), the belts' fields from o.belts(abs height, ctx) -> {forest, taiga, mixed}.
function WALLFACE(o){const R=o.R,DATUM=o.datum,X0=o.X0==null?-1300:o.X0,P=o.P==null?1600:o.P,RISE=o.rise==null?0:o.rise,HW=o.hw==null?120:o.hw;
 const wig=z=>90*Math.sin(z*.0013+.6)+30*Math.sin(z*.0051+2.2);
 function steps(x,z,lip){if(!RISE)return 0;const s=(x-X0-wig(z))/P,n=Math.floor(s),f=(s-n)*P;
  const one=f=>lip?.5*smooth(HW-15,HW,f)+.5*smooth(-HW,HW-15,f):smooth(-HW,HW,f);return RISE*(n+one(f)+one(f-P));}
 const RIBS=(o.ribs||[]).map((z0,i)=>({z0,ph:i*1.7+.4})),ribZ=(r,x)=>r.z0+90*Math.sin(x*.0009+r.ph)+25*Math.sin(x*.004+r.ph*2);
 const RS=RIBS.slice().sort((a,b)=>a.z0-b.z0);
 /* the stream's gully: midway between the two ribs nearest z 0 */
 const GI=(function(){const s=RIBS.slice().sort((a,b)=>a.z0-b.z0);for(let i=0;i<s.length-1;i++)if(s[i].z0<0&&s[i+1].z0>=0)return[s[i],s[i+1]];return null;})();
 const zs=x=>GI?(ribZ(GI[0],x)+ribZ(GI[1],x))/2:140*Math.sin(x*.0011+.9)+40*Math.sin(x*.0043+1.3);   /* down the middle gully's floor */
 const crestCut=x=>o.crest==null?0:-(x-o.crest)*(x>o.crest?o.slope*2.2:0);
 function surf(x,z){let h=o.y0+o.slope*(x+R)+steps(x,z,false)+crestCut(x)+30*(fbm(z*.002+3,x*.0006,o.seed,3)-.5)+7*(fbm(x*.012,z*.012,o.seed+1,2)-.5);
  let rib=0,gul=0;for(const r of RIBS){const d=Math.abs(z-ribZ(r,x));rib=Math.max(rib,smooth(70,10,d));}
  /* a gully: the strip midway between two neighbouring ribs (the ribs sorted by z) */
  for(let i=0;i<RS.length-1;i++){const m=(ribZ(RS[i],x)+ribZ(RS[i+1],x))/2;gul=Math.max(gul,smooth(90,15,Math.abs(z-m)));}
  h+=(o.ribH==null?22:o.ribH)*rib*(.7+.3*fbm(x*.01,z*.01,o.seed+2,2))-14*gul;return{h,rib,gul};}
 const bedH=x=>{const z=zs(x);return o.y0+o.slope*(x+R)+steps(x,z,true)+crestCut(x)+30*(fbm(z*.002+3,x*.0006,o.seed,3)-.5)-14-3;};
 const SW=o.streamW==null?3:o.streamW;
 const _tm={x:NaN,z:NaN,h:0};
 function terrainH0(x,z){let h=surf(x,z).h;
  if(o.stream!==false){const d=Math.abs(z-zs(x));if(d<120){const b=bedH(x),dep=Math.max(4,h-b),wb=SW+2,wt=wb+Math.max(7,dep*.3);h-=(h-b+.8)*smooth(wt,wb,d);}}
  for(const Pq of POOLS)if(Math.hypot(x-Pq.x,z-Pq.z)<Pq.r*1.5)h-=1.3*smooth(Pq.r*1.4,Pq.r*.5,Math.hypot(x-Pq.x,z-Pq.z));
  return h;}
 function terrainH(x,z){if(x===_tm.x&&z===_tm.z)return _tm.h;const h=terrainH0(x,z);_tm.x=x;_tm.z=z;_tm.h=h;return h;}
 /* a few tarns or sag ponds where the land asks (o.pools: [[x,z,r]]) */
 const POOLS=(o.pools||[]).map(p=>({x:p[0],z:p[1],r:p[2]}));
 POOLS.forEach(Pq=>{let lo=1e9;for(let k=0;k<12;k++){const a=k/12*TAU;lo=Math.min(lo,terrainH0(Pq.x+Math.cos(a)*Pq.r*1.15,Pq.z+Math.sin(a)*Pq.r*1.15));}Pq.y=lo-.15;});
 function waterH(x,z){for(const Pq of POOLS)if(Math.hypot(x-Pq.x,z-Pq.z)<Pq.r*1.2)return Pq.y;
  if(o.stream!==false&&Math.abs(z-zs(x))<SW+1)return bedH(x)+.5;return -1e9;}
 const FLOWS=o.stream===false?[]:(function(){const pts=[];let y=1e9;for(let x=R*1.05;x>=-R*1.05;x-=6){y=Math.min(y,bedH(x)+.5);pts.push([x,zs(x),y]);}
  return[{name:o.streamName||'The stream',pts,width:SW*2+2,speed:1.5}];})();
 const SUNH=(function(){const l=Math.hypot(SUNP[0],SUNP[2]);return[SUNP[0]/l,SUNP[2]/l];})();
 function fieldsAt(x,z,h,slope,gx,gz){const S=surf(x,z),ds=o.stream===false?1e9:Math.abs(z-zs(x)),flow=smooth(SW+12,SW*.6,ds),abs=DATUM+h;
  const pond=POOLS.reduce((m,Pq)=>Math.max(m,smooth(Pq.r*2,Pq.r,Math.hypot(x-Pq.x,z-Pq.z))),0);
  const rock=clamp(Math.max(smooth(.6,.88,slope)*.9,S.rib*.55*smooth(.15,.4,slope)),0,1),cold=o.coldAt(abs);
  const gl=Math.hypot(gx,gz)||1,sunF=clamp(-(gx*SUNH[0]+gz*SUNH[1])/gl,0,1)*smooth(.08,.3,slope);
  const B=o.belts(abs,{rock,flow,gul:S.gul,rib:S.rib,cold,x,z});
  return Object.assign({wet:clamp(o.wet+.25*flow+.2*S.gul+.3*pond+.15*(fbm(x*.0015,z*.0015,o.seed+3,2)-.5),0,1),flow,upland:clamp(h/1000,0,1),rock,slope,cold,bog:0,mother:0,geo:0,
   gully:B.gully==null?0:B.gully,sun:sunF,tarn:0,tor:rock*.5,forest:0,taiga:0,mixed:0,canyon:0,rim:0,dune:0,oasis:0,abyss:0,salt:0,barren:0},B);}
 return{steps,surf,bedH,zs,RIBS,ribZ,POOLS,terrainH,terrainH0,waterH,FLOWS,fieldsAt,farH:(x,z)=>o.y0+o.slope*(x+R)+steps(x,z,false)+crestCut(x)};}
