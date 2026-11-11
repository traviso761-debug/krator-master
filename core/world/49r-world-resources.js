// ================================================================= OPEN WORLD: the region's resources (census, layers, markers)
// [G data] No THREE, no DOM: the same numbers in the page, in node and in Godot. The geology is the scale model's
// (kits/resources/data/geology.json: provinces and a prospectivity byte 0-255 per family per 4 km cell, cropped to the
// region by core/world/world_data.py geology_crop; RES_GEO = KRES reads it, kits/resources/GEOLOGY.md); the farmland is
// read from the world's own fields (WORLD.at: temperature, rain, slope, rock, dune, salt, cold, flow), as no layer of the
// model holds it. A region's frame is local (x = (px - cx) x 2000): RES_GEO is asked in the map's frame.
//   WRES.families                     [{f, group, label, value}] the families the census reports, by group
//   WRES.byte(f, x, z)                a family's prospectivity there (0..255)
//   WRES.farm(x, z)                   farmland 0..1 (warmth x water x flat x soil); 0 in water, outside the region
//   WRES.layers                       [{id, label, at(x, z) -> 0..1, ramp: [[r,g,b] low, [r,g,b] high]}] what a map paints
//   WRES.census(o)                    the region's resources: {area_km2, step_m, provinces {name: km2}, families {f: {mean,
//                                     good_km2 (>= 100), rich_km2 (>= 170), peak {byte, x, z}, nodes (expected node
//                                     candidates kept: sum of p/255 over the family's own placement cells)}}, farm {mean,
//                                     good_km2 (>= .5), best_km2 (>= .7), peak}, placers {gold, tin}, ruin_km2, vents}
//                                     o: {step (m, 4000: the data's cell)}; cached
//   WRES.markers(o)                   the richest spots: [{id, kind: 'mining'|'farm'|'unique', family, x, z, score, label,
//                                     why}]: mining the best ore cells (value-weighted, 25 km apart), farm the best
//                                     farmland (30 km apart), unique the high-grade placers, vents, rare rocks, ruin ground
//   WRES.assess(x, z, reach_m)        a site's ground: {at, farm, families (mean within reach, top first), rich, nodes, ...}
var WRES=(function(){'use strict';
const KR=typeof RES_GEO!=='undefined'?RES_GEO:(typeof KRES!=='undefined'?KRES:null);
const M=WORLD_DATA.meta,O=M.frame.origin_px,OX=O[0]*2000,OZ=O[1]*2000;
const sm=(a,b,v)=>{const t=Math.max(0,Math.min(1,(v-a)/(b-a)));return t*t*(3-2*t);};
/* the families the census reports: value is what a rich deposit is worth to a region against iron's 1 (rarity, trade:
   LORE.md 184, gold, petrol and the rest) */
const FAM=[['iron','metal','iron ore',1],['copper','metal','copper',1.15],['tin','metal','tin',1.2],['nickel','metal','nickel',1.2],
 ['gold','metal','gold',1.6],['silver','metal','silver',1.35],['rare-earth','metal','rare earths',1.4],
 ['coal','fuel','coal',.95],['oil','fuel','oil',1.35],
 ['sulfur','mineral','sulfur',.85],['saltpeter','mineral','saltpeter',.85],['halite','mineral','rock salt',.8],['gypsum','mineral','gypsum',.6],
 ['potash','mineral','potash',.9],['alkali','mineral','soda (alkali)',.85],['marble','mineral','marble',.75],
 ['stone','basic','building stone',.3],['clay','basic','clay',.35],['wood','basic','timber',.5],['water','basic','fresh water',.4],
 ['limestone','rock','limestone (karst)',.4],['impactite','rock','impactite',.5],['ultramafic','rock','ultramafic rock',.6],
 ['tuff','rock','tuff (volcanic ash)',.4],['skarn','rock','skarn',.7],['glass','rock','blast glass',1]]
 .map(r=>({f:r[0],group:r[1],label:r[2],value:r[3]}));
const ORES=FAM.filter(F=>F.group==='metal'||F.group==='fuel'||F.group==='mineral');
const has=f=>!!(typeof RES_GEODATA!=='undefined'&&RES_GEODATA.layers&&RES_GEODATA.layers[f]);
function byte(f,x,z){return KR&&has(f)?KR.prospect(f,x+OX,z+OZ):0;}
function farm(x,z){if(!WORLD.inside(x,z))return 0;const A=WORLD.at(x,z);if(WORLD.water(x,z)>A.h-.5)return 0;
 const warm=sm(2,9,A.temp)*sm(38,29,A.temp);
 const water=Math.max(sm(200,800,A.rain)*sm(4500,2600,A.rain)*.95+.05,A.flow*.9);   /* rain-fed, or watered from a river */
 const flat=sm(.2,.04,A.slope),soil=(1-A.rock)*(1-A.dune)*(1-A.salt)*(1-.85*A.cold)*(1-.8*A.canyon);
 return Math.max(0,Math.min(1,warm*water*flat*soil*(.85+.15*byte('clay',x,z)/255)));}
/* the layers a map paints (each 0..1 and a ramp low -> high) */
const RAMP={ore:[[40,30,30],[255,120,40]],farm:[[60,50,30],[90,230,80]],wood:[[50,40,30],[40,170,60]],stone:[[40,40,45],[220,220,230]],
 water:[[40,35,30],[70,160,255]],fam:[[35,30,40],[250,210,70]]};
const bestOre=(x,z)=>{let b=0;for(const F of ORES){const v=byte(F.f,x,z)/255*Math.min(1,F.value);if(v>b)b=v;}return b;};
const layers=[{id:'ore',label:'mining: the best ore',at:bestOre,ramp:RAMP.ore},{id:'farm',label:'farmland',at:farm,ramp:RAMP.farm},
 {id:'wood',label:'timber',at:(x,z)=>byte('wood',x,z)/255,ramp:RAMP.wood},{id:'stone',label:'building stone',at:(x,z)=>byte('stone',x,z)/255,ramp:RAMP.stone},
 {id:'water',label:'fresh water',at:(x,z)=>byte('water',x,z)/255,ramp:RAMP.water}]
 .concat(ORES.concat(FAM.filter(F=>F.group==='rock')).map(F=>({id:F.f,label:F.label,at:(x,z)=>byte(F.f,x,z)/255,ramp:RAMP.fam})));
/* the region's cells: the box on a step grid, each inside the polygon */
function cells(step){const B=M.frame.box_px,out=[];
 for(let z=(B[1]-O[1])*2000+step/2;z<(B[3]-O[1])*2000;z+=step)for(let x=(B[0]-O[0])*2000+step/2;x<(B[2]-O[0])*2000;x+=step)if(WORLD.inside(x,z))out.push([x,z]);
 return out;}
let CEN=null;
function census(o){o=o||{};const step=o.step==null?4000:o.step;if(CEN&&CEN.step_m===step)return CEN;
 const C=cells(step),a=step*step/1e6,fam={},prov={};let fs=0,fg=0,fb=0,fpk=null,ruin=0;
 const cellsOf=f=>(RES_GEODATA&&RES_GEODATA.field&&RES_GEODATA.field.cells[f])||0;
 for(const F of FAM)fam[F.f]={mean:0,good_km2:0,rich_km2:0,peak:null,nodes:0};
 for(const [x,z] of C){const g=KR?KR.at(x+OX,z+OZ):null;
  if(g){const pn=g.province||'?';prov[pn]=(prov[pn]||0)+a;if(g.ruin)ruin+=a;}
  for(const F of FAM){const v=byte(F.f,x,z),E=fam[F.f];E.mean+=v;if(v>=100)E.good_km2+=a;if(v>=170)E.rich_km2+=a;
   if(!E.peak||v>E.peak.byte)E.peak={byte:v,x,z};const c=cellsOf(F.f);if(c)E.nodes+=v/255*step*step/(c*c);}
  const fv=farm(x,z);fs+=fv;if(fv>=.5)fg+=a;if(fv>=.7)fb+=a;if(!fpk||fv>fpk.v)fpk={v:fv,x,z};}
 for(const F of FAM){const E=fam[F.f];E.mean=C.length?Math.round(E.mean/C.length*10)/10:0;E.good_km2=Math.round(E.good_km2);E.rich_km2=Math.round(E.rich_km2);E.nodes=Math.round(E.nodes);}
 for(const k in prov)prov[k]=Math.round(prov[k]);
 const B=M.frame.box_px,pl={gold:0,tin:0};
 for(const p of (typeof RES_GEODATA!=='undefined'&&RES_GEODATA.placers)||[]){const x=p.x-OX,z=p.z-OZ;if(WORLD.inside(x,z))pl[p.kind]=(pl[p.kind]||0)+1;}
 CEN={area_km2:Math.round(C.length*a),step_m:step,provinces:prov,families:fam,
  farm:{mean:C.length?Math.round(fs/C.length*1000)/1000:0,good_km2:Math.round(fg),best_km2:Math.round(fb),peak:fpk&&{score:Math.round(fpk.v*1000)/1000,x:fpk.x,z:fpk.z}},
  placers:pl,ruin_km2:Math.round(ruin),vents:(M.vents||[]).length+(M.volcano?1:0),geology:!!KR};
 return CEN;}
/* the richest spots: greedy picks of the best-scored cells, each at least `sep` from the picks before it */
function pick(C,score,n,sep,famOf,cap){const S=C.map(([x,z])=>({x,z,s:score(x,z)})).filter(q=>q.s>0).sort((a,b)=>b.s-a.s||a.z-b.z||a.x-b.x),out=[],per={};
 for(const q of S){if(out.length>=n)break;if(!out.every(p=>Math.hypot(p.x-q.x,p.z-q.z)>=sep))continue;
  if(famOf){const f=famOf(q.x,q.z);if((per[f]||0)>=cap)continue;per[f]=(per[f]||0)+1;}out.push(q);}return out;}
const GROUPW={metal:'Ore',fuel:'Fuel',mineral:'Mineral'};
const word=v=>v>=220?'very rich':v>=170?'rich':v>=120?'good':'modest';
let MK=null;
function markers(o){o=o||{};if(MK)return MK;const C=cells(o.step==null?4000:o.step),out=[];
 /* mining: the best ore cell by value (the family that wins there names it) */
 const oreAt=(x,z)=>{let b=null;for(const F of ORES){const v=byte(F.f,x,z),s=v*F.value;if(v>=120&&(!b||s>b.s))b={s,F,v};}return b;};
 for(const q of pick(C,(x,z)=>{const b=oreAt(x,z);return b?b.s:0;},o.mining==null?7:o.mining,25000,(x,z)=>oreAt(x,z).F.f,1)){const b=oreAt(q.x,q.z);
  out.push({id:'res-mining-'+b.F.f+'-'+Math.round(q.x/1000)+'-'+Math.round(q.z/1000),kind:'mining',family:b.F.f,x:q.x,z:q.z,score:b.v,
   label:GROUPW[b.F.group]+': '+b.F.label+' ('+word(b.v)+', '+b.v+'/255)',why:'the scale model\'s geology: '+b.F.label+' prospectivity '+b.v+' on '+(((KR&&KR.at(q.x+OX,q.z+OZ))||{}).province||'?')+' ground'});}
 /* farmland: the best cells, smoothed over their neighbours (a farming district, not one field) */
 const st=o.step==null?4000:o.step,fs=(x,z)=>{let s=0,n=0;for(const d of [[0,0],[st,0],[-st,0],[0,st],[0,-st]]){s+=farm(x+d[0],z+d[1]);n++;}return s/n;};
 for(const q of pick(C,fs,o.farm==null?4:o.farm,30000))if(q.s>=.3){const A=WORLD.at(q.x,q.z);
  out.push({id:'res-farm-'+Math.round(q.x/1000)+'-'+Math.round(q.z/1000),kind:'farm',family:'farmland',x:q.x,z:q.z,score:Math.round(q.s*100)/100,
   label:'Farmland: '+(q.s>=.7?'the best':q.s>=.5?'good':'fair')+' ('+Math.round(q.s*100)+'%, '+Math.round(A.rain)+' mm, '+Math.round(A.temp)+' °C)',
   why:'warm, watered, flat and deep-soiled ('+(A.clim||'?')+')'});}
 /* unique: the high-grade placers, the vents, the rare rocks' peaks, the Ancients' ruin ground */
 const U=[];
 for(const p of (typeof RES_GEODATA!=='undefined'&&RES_GEODATA.placers)||[]){const x=p.x-OX,z=p.z-OZ;if(p.grade==='high'&&WORLD.inside(x,z))U.push({s:300+p.load*100,x,z,family:p.kind,label:'Placer '+p.kind+' (high grade, river '+p.river+')',why:'a '+p.kind+' placer the rivers carried down ('+p.why+')'});}
 for(const v of M.vents||[]){const x=v.x!=null?v.x:(v.px[0]-O[0])*2000,z=v.z!=null?v.z:(v.px[1]-O[1])*2000;if(WORLD.inside(x,z))U.push({s:280,x,z,family:'vent',label:(v.kind==='geyser'?'Geysers':'A volcanic vent'),why:'heat, sulfur and hot springs'});}
 for(const F of FAM.filter(F=>F.group==='rock'||F.f==='rare-earth'||F.f==='gold'||F.f==='oil')){const pk=pick(C,(x,z)=>byte(F.f,x,z),1,1)[0];
  if(pk&&pk.s>=170)U.push({s:pk.s*F.value,x:pk.x,z:pk.z,family:F.f,label:'The richest '+F.label+' ('+pk.s+'/255)',why:'the region\'s peak of '+F.label});}
 if(KR){const rg=C.filter(([x,z])=>{const g=KR.at(x+OX,z+OZ);return g&&g.ruin;});if(rg.length){const c=rg[Math.floor(rg.length/2)];U.push({s:260,x:c[0],z:c[1],family:'ruin',label:'Ancient ruin ground ('+Math.round(rg.length*16)+' km²)',why:'within 12 km of an Ancient ruin: salvage, relics'});}}
 U.sort((a,b)=>b.s-a.s||a.z-b.z||a.x-b.x);const kept=[],per={};   /* at most two of a kind (a river's placers, a field of geysers) */
 for(const u of U){if(kept.length>=(o.unique==null?6:o.unique))break;if((per[u.family]||0)>=2)continue;
  if(kept.concat(out).every(p=>Math.hypot(p.x-u.x,p.z-u.z)>=15000)){kept.push(u);per[u.family]=(per[u.family]||0)+1;}}
 for(const u of kept)out.push({id:'res-unique-'+u.family+'-'+Math.round(u.x/1000)+'-'+Math.round(u.z/1000),kind:'unique',family:u.family,x:u.x,z:u.z,score:Math.round(u.s),label:u.label,why:u.why});
 MK=out;return out;}
/* a site's ground, for a proposal: the families' means within its reach, the best of them, the farmland */
function assess(x,z,reach){reach=reach==null?15000:reach;const step=Math.max(1000,reach/6),fam={},A=WORLD.at(x,z);let n=0,fsum=0,fgood=0;
 for(const F of FAM)fam[F.f]={mean:0,max:0};
 for(let dz=-reach;dz<=reach+1;dz+=step)for(let dx=-reach;dx<=reach+1;dx+=step){const px=x+dx,pz=z+dz;if(!WORLD.inside(px,pz))continue;n++;
  for(const F of FAM){const v=byte(F.f,px,pz);fam[F.f].mean+=v;if(v>fam[F.f].max)fam[F.f].max=v;}const fv=farm(px,pz);fsum+=fv;if(fv>=.5)fgood++;}
 for(const F of FAM)fam[F.f].mean=n?Math.round(fam[F.f].mean/n):0;
 const top=FAM.filter(F=>F.group!=='basic').map(F=>({f:F.f,label:F.label,mean:fam[F.f].mean,max:fam[F.f].max,score:fam[F.f].max*F.value})).filter(q=>q.max>=100).sort((a,b)=>b.score-a.score).slice(0,6);
 const b=WORLD.biomeAt?WORLD.biomeAt(x,z):null,g=KR?KR.at(x+OX,z+OZ):null;
 return{x:Math.round(x),z:Math.round(z),px:Math.round(WORLD.px(x)*10)/10,py:Math.round(WORLD.py(z)*10)/10,h:Math.round(A.h),slope:Math.round(A.slope*100)/100,
  rain:Math.round(A.rain),temp:Math.round(A.temp*10)/10,clim:A.clim||null,biome:b?b.name:null,province:g?g.province:null,ruin:!!(g&&g.ruin),
  inside:!!A.inside,dry:!(WORLD.water(x,z)>A.h-.5),reach_m:reach,farm:{mean:n?Math.round(fsum/n*100)/100:0,good_share:n?Math.round(fgood/n*100)/100:0},
  basics:{stone:fam.stone.mean,clay:fam.clay.mean,wood:fam.wood.mean,water:fam.water.mean},top};}
/* the checks a verify reads, each with a negative: the geology loaded and read (the negative: a census that finds no
   family), every marker inside the region (the negative: the markers moved off the map) */
function checks(neg){const R=[],C=census(),Mk=markers();
 const fams=neg==='geology'?[]:Object.keys(C.families).filter(f=>C.families[f].mean>0);
 R.push({name:'the resources: the region\'s geology is loaded and the census reads it',ok:!!KR&&C.area_km2>0&&fams.length>=4,
  detail:(KR?'':'no RES_GEO; ')+C.area_km2+' km², '+fams.length+' families present, '+Object.keys(C.provinces).length+' provinces, farmland mean '+C.farm.mean});
 const bad=[];for(const m of (neg==='markers'?Mk.map(m=>Object.assign({},m,{x:m.x+1e7})):Mk)){if(!WORLD.inside(m.x,m.z))bad.push(m.id+' outside');}
 const kinds=['mining','farm','unique'].filter(k=>Mk.some(m=>m.kind===k));
 R.push({name:'the resources: the richest spots marked inside the region',ok:!bad.length&&Mk.length>0,detail:bad.length?bad.slice(0,4).join('; '):Mk.length+' markers ('+kinds.join(', ')+')'});
 return R;}
return{families:FAM,byte,farm,layers,census,markers,assess,checks,cells};})();
