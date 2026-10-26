// ================================================================= HOST — the kit's probe checks and inspector, for any stage
// Split from 99-host-take.js (2026-10-23) so an overlay's stage (biomes/scablands) can take the kit with its own views and
// its own list of checks: what is here names no place on this showcase (a stage hands a check its records and places),
// only the kit (NSEMIARID), the core (BIO, FIELD) and the host (terrainH, waterH, NSWIND, TICKS).
const gh=(x,z,dy)=>terrainH(x,z)+(dy||0);
const look=(cx,cz,dyc,tx,tz,dyt)=>[cx,gh(cx,cz,dyc),cz,tx,gh(tx,tz,dyt),tz];
const SPI=k=>NSEMIARID.SPECIES.indexOf(NSEMIARID.byKey[k]);
function nearTree(key,x,z,minH,pred){return NSEMIARID.nearestTree(SPI(key),x,z,minH,pred)||{x:x,z:z,y0:gh(x,z),H:8,crownR:5};}
function atTree(T,d,az,dy){const cx=T.x+Math.cos(az)*d,cz=T.z+Math.sin(az)*d;return[cx,Math.max(gh(cx,cz,2),T.y0+(dy==null?T.H*.45:dy)),cz,T.x,T.y0+T.H*.6,T.z];}
const W0=NSEMIARID.WIND,UPW=Math.atan2(-W0[1],-W0[0]);   // the camera upwind of a subject sees its downwind trail
// ---------------------------------------------------------------- the inspector's words
function describe(hit){const p=hit.point,o=hit.object;
 let best=null;for(const r of REG){if(r.r>1500)continue;if(regHas(r,p.x,p.y,p.z)&&(!best||r.r<best.r))best=r;}
 const lab=o.userData.inspectLabel||o.name||'mesh',isItem=o.isInstancedMesh&&o.userData.biome;
 let name=isItem?lab+(best?'  (under '+best.name+')':''):(best?best.name+'  ·  '+lab:lab);
 // a stage's own plants (an overlay's flora: biomes/scablands) answer through STAGE_PLANTS {plantOfItem, kit}
 const item=isItem?(o.name||'').replace(/^biome:/,''):null,KIT=item&&NSEMIARID.plantOfItem(item),SP=!KIT&&item&&typeof STAGE_PLANTS!=='undefined'?STAGE_PLANTS.plantOfItem(item):null,PLT=KIT||SP;
 const S=o.userData.species?NSEMIARID.byKey[o.userData.species]:(best&&best.key&&NSEMIARID.byKey[best.key]),tg=S?S.tags:(PLT?PLT.tags:null);
 if(o.userData.species)name=S.name+'  ·  a variant ('+o.name.replace('variant:','')+')';
 if(PLT&&!S)name=PLT.name+'  ·  '+lab+(PLT.travel&&PLT.travel!=='none'?'  ·  travels: '+PLT.travel:'');
 if(S&&S.travel)name+='  ·  travels: '+S.travel;
 const cls=SP?'flora · '+STAGE_PLANTS.kit:S||isItem?'flora · n semiarid'+(S&&S.alien?' · alien (Krator\'s own)':''):'terrain / water';
 return name+'\n'+cls+(tg?'\n'+tg.climate+' · '+tg.aridity+' · riparian '+tg.riparian+' · abyssal '+tg.abyssal+' · Koppen '+tg.koppen.join(' '):'')+
  (tg&&tg.harvest?'\nharvest: wood '+tg.harvest.wood+' · edible '+(tg.harvest.edible.join(', ')||'none')+(tg.harvest.medicinal?' · medicinal':'')+(tg.harvest.fruit?' · catalog '+tg.harvest.fruit:''):'')+
  '\n'+p.x.toFixed(0)+', '+p.y.toFixed(0)+', '+p.z.toFixed(0)+'  range '+camera.position.distanceTo(p).toFixed(0)+' m';}
// species that yield something edible the kit does not draw as a catalog fruit: named, not hidden (the catalog owes the
// fruit trees' pieces: KNOWN_ISSUES.md)
const FRUIT_NOT_DRAWN=['pistachio','judas','almond','apple','walnut','apricot','pear','poplar','frill','trumpet','pomegranate','foxtail','dandelion'];
const inst=(pat)=>{const o=[],m=new THREE.Matrix4(),p=new THREE.Vector3(),q=new THREE.Quaternion(),sc=new THREE.Vector3();
 scene.traverse(M=>{if(!M.isInstancedMesh||!M.userData.biome)return;if(pat&&!pat.test(M.name))return;for(let i=0;i<M.count;i++){M.getMatrixAt(i,m);m.decompose(p,q,sc);o.push([p.x,p.y,p.z,M.name,sc.y]);}});return o;};
const near2=(A,x,z,r)=>A.filter(a=>Math.abs(a[0]-x)<r&&Math.abs(a[2]-z)<r);
// The host's own checks (verify.py runs them when present), each with a broken input that must fail.
const HCHK={
 placed(C){const zero=NSEMIARID.SPECIES.filter((S,i)=>!(C[i]>0)).map(S=>S.key);
  return{ok:C.length===NSEMIARID.SPECIES.length&&!zero.length,detail:zero.length?'never placed: '+zero.join(', '):C.length+' species, the scarcest '+Math.min(...C)};},
 tagged(SP){const reg=Object.keys(NSEMIARID.KOPPEN),bad=[];
  for(const S of SP){const t=S.tags||{},k=t.koppen||[];if(!t.climate||!t.aridity||t.abyssal==null||!t.riparian||!k.length||k.some(c=>reg.indexOf(c)<0))bad.push(S.key);}
  return{ok:!bad.length,detail:bad.length?'untagged or tagged outside the region: '+bad.join(', '):SP.length+' species tagged (climate, aridity, abyssal, riparian, Koppen)'};},
 dry(P){const bad=P.filter(p=>{const w=waterH(p[0],p[2]);return w>-1e8&&p[1]<w-1.0;});
  return{ok:!bad.length,detail:bad.length?bad.length+' under the water (first '+bad[0][3]+' at '+bad[0].slice(0,3).map(v=>v|0)+')':P.length+' instances, none drowned'};},
 cliffs(T){const bad=T.filter(t=>FIELD.slope(t.x,t.z)>.97&&FIELD.rock(t.x,t.z)>.6);
  return{ok:!bad.length,detail:bad.length?bad.length+' trees on cliff faces':T.length+' trees, none on a bare rock face'};},
 fruit(SP,PL,P){const miss=SP.filter(S=>S.tags.harvest&&S.tags.harvest.edible.length&&!S.tags.harvest.fruit&&FRUIT_NOT_DRAWN.indexOf(S.key)<0).map(S=>S.key);
  const n=P.filter(p=>/fruit|gourd/.test(p[3])).length,untagged=SP.filter(S=>!S.tags.harvest).map(S=>S.key).concat(Object.keys(PL).filter(k=>!PL[k].tags.harvest));
  return{ok:!miss.length&&!untagged.length&&n>=150,detail:(miss.length?'edible but not named: '+miss.join(', ')+'; ':'')+(untagged.length?'no harvest tag: '+untagged.join(', ')+'; ':'')+n+' fruit and gourd instances drawn'};},
 variants(V,T){if(!window._variants)return{ok:true,detail:'unique trees (?unique=1)'};const P=V.protos,sps=new Set(T.map(r=>r.sp)),miss=[];
  for(const sp of sps)for(const lv of [2,1,0])for(let v=0;v<V.K;v++)if(!P.has(sp+'|n|'+v+'|'+lv)&&!P.has(sp+'|s|'+v+'|'+lv)&&!P.has(sp+'|d|'+v+'|'+lv))miss.push(NSEMIARID.SPECIES[sp].key+' v'+v+' lv'+lv);
  return{ok:!miss.length&&V.stats.drawn>0,detail:(miss.length?'missing: '+miss.slice(0,6).join(', ')+'; ':'')+P.size+' prototypes for '+T.length+' trees; '+V.stats.drawn+' drawn here, '+V.stats.tris+' triangles, grown in '+V.stats.growMs+' ms'};},
 camerasOut(C){const bad=C.filter(c=>c.y<terrainH(c.x,c.z)+.5);return{ok:!bad.length,detail:bad.length?'under the ground: '+bad.map(c=>c.view).join(', '):C.length+' cameras above the ground'};},
 // THE WALKING STEPPE: the travellers keep their headings
 // a crawler's trail runs upslope of its head (it grows toward water): the nearest dead segment stands higher
 crawlers(H,D){let ok=0,n=0;for(const h of H){const d=near2(D,h[0],h[2],3);if(!d.length)continue;let b=d[0],bd=1e9;for(const q of d){const e=Math.hypot(q[0]-h[0],q[2]-h[2]);if(e<bd){bd=e;b=q;}}n++;if(terrainH(b[0],b[2])>=terrainH(h[0],h[2])-.02)ok++;}
  return{ok:n>=30&&ok/n>=.8,detail:n?ok+' of '+n+' crawler heads lie downslope of their trails':'no crawlers'};},
 // tumbler drifts pile on the windward (upwind) face of the trees, the wind read where each tree stands
 drifts(Tb,T,wf){let up=0,n=0;for(const t of T){const near=near2(Tb,t.x,t.z,4),w=wf(t.x,t.z);for(const b of near){const dx=b[0]-t.x,dz=b[2]-t.z;if(Math.hypot(dx,dz)>4)continue;n++;if(dx*w[0]+dz*w[1]<0)up++;}}
  return{ok:n>=20&&up/n>=.75,detail:n?up+' of '+n+' tumblers by a tree lie on its windward side':'no drifts'};},
 // step cones on the old bed: taller where the ground has been dry longer (a tier a wet year)
 cones(S){const pts=S.filter(s=>FIELD.bed(s[0],s[2])>.5);if(pts.length<30)return{ok:false,detail:pts.length+' step cones on the bed'};
  const xs=pts.map(s=>FIELD.dry(s[0],s[2])),ys=pts.map(s=>s[4]),mx=xs.reduce((a,b)=>a+b)/xs.length,my=ys.reduce((a,b)=>a+b)/ys.length;
  let sxy=0,sxx=0,syy=0;for(let i=0;i<xs.length;i++){sxy+=(xs[i]-mx)*(ys[i]-my);sxx+=(xs[i]-mx)**2;syy+=(ys[i]-my)**2;}const r=sxy/Math.sqrt(sxx*syy||1);
  return{ok:r>.5,detail:pts.length+' step cones on the bed, height against years dry r = '+r.toFixed(2)};},
 // the saxaul stands only on its groves' crescents
 crescents(T){const bad=T.filter(t=>NSEMIARID.crescentAt(t.x,t.z)[0]<=0);return{ok:T.length>0&&!bad.length,detail:bad.length?bad.length+' saxaul off a crescent':T.length+' saxaul, every one on a grove\'s arc'};},
  // the stream SHOWS (2026-10-23: the ground mesh bridged it in long gaps): the drawn ground's own height (its triangles,
 // not terrainH) under the water's centreline, every 10 m: under the water nearly everywhere
 shows(F,drop,skip){const P=F.pts,g=GROUND.geometry,pa=g.attributes.position.array,ix=g.index.array;
  const zs=P.map(p=>p.z),z0=Math.min(...zs)-30,z1=Math.max(...zs)+30,K=[];
  for(let t=0;t<ix.length;t+=3){const zz=pa[ix[t]*3+2];if(zz>=z0&&zz<=z1)K.push(ix[t],ix[t+1],ix[t+2]);}
  const at=(x,z)=>{for(let t=0;t<K.length;t+=3){const a=K[t]*3,b=K[t+1]*3,c=K[t+2]*3;
    if(Math.max(pa[a+2],pa[b+2],pa[c+2])<z||Math.min(pa[a+2],pa[b+2],pa[c+2])>z||Math.max(pa[a],pa[b],pa[c])<x||Math.min(pa[a],pa[b],pa[c])>x)continue;
    const d=(pa[b+2]-pa[c+2])*(pa[a]-pa[c])+(pa[c]-pa[b])*(pa[a+2]-pa[c+2]),l1=((pa[b+2]-pa[c+2])*(x-pa[c])+(pa[c]-pa[b])*(z-pa[c+2]))/d,l2=((pa[c+2]-pa[a+2])*(x-pa[c])+(pa[a]-pa[c])*(z-pa[c+2]))/d,l3=1-l1-l2;
    if(l1>=-1e-6&&l2>=-1e-6&&l3>=-1e-6)return l1*pa[a+1]+l2*pa[b+1]+l3*pa[c+1];}return null;};
  let n=0,bad=0,worst=0;for(const p of P){if(skip&&skip(p.x,p.z))continue;const h=at(p.x,p.z);if(h==null)continue;n++;const over=h-(p.y-(drop||0));if(over>-.05)bad++;worst=Math.max(worst,over);}
  return{ok:n>100&&bad<=n*.02,detail:n+' points down the stream; the drawn ground over the water at '+bad+(bad?' (worst '+worst.toFixed(2)+' m)':'')};},
 // the DUST (core/atmos 3d-dust): over the dry bed, none in a calm, some in high wind; mask: the page's own, or a test one
 dust(pts,mask){const m=mask||NS_DUST_MASK;
  const mode=NSWIND.mode,sc=ATMOS.windScale;
  const run=md=>{NSWIND.set(md);ATMOS.windScale=NSWIND.SCALE[md];let s=0,c=0;for(let i=0;i<40;i++){for(const f of TICKS.slice())f(.15,0);
    if(i%4===3)for(const p of pts){s+=ATMOS.dustLift(p[0],p[1],m(p[0],p[1]));c++;}}return s/c;};
  let calm,high;try{calm=run('calm');high=run('high');}finally{NSWIND.set(mode);ATMOS.windScale=sc;}
  return{ok:calm===0&&high>.15,detail:'the dust over the dry ground (mean lift 0..1): '+calm.toFixed(3)+' in a calm, '+high.toFixed(3)+' in high wind'};},
 // THE WATER (core/water): a stream sits in its channel, both banks over its surface a pace either side of its line
 banks(F,halfW,lift){const P=F.pts;let bad=0,n=0,worst=0;for(let i=0;i<P.length;i+=2){const p=P[i],y=p.y+(lift||0),s=Math.max(y-terrainH(p.x-halfW*1.05,p.z),y-terrainH(p.x+halfW*1.05,p.z));n++;if(s>.15)bad++;worst=Math.max(worst,s);}
  return{ok:n>50&&bad/n<=.02,detail:bad+' of '+n+' stream sections spill over a bank (worst '+worst.toFixed(1)+' m)'};},
 // THE WIND (core/atmos): stepped on the module's own clock, a gale tears the winged seeds loose and a calm holds them
 gale(at,hold){if(typeof FLIGHT==='undefined'||!FLIGHT)return{ok:false,detail:'no seed flight (?seeds=0)'};
  const B=FLIGHT.BEAR,keep={},mode=NSWIND.mode,sc=ATMOS.windScale,heli=()=>(window._seeds.bySpecies.trumpet||0)+(window._seeds.bySpecies.samara||0);
  if(hold!=null)for(const k in B){keep[k]=B[k].hold;B[k].hold=B[k].calm?-hold:hold;}   // a calm-lifting kind (the lanterns) the other way
  const lan=()=>window._seeds.bySpecies.lantern||0;
  const run=m=>{NSWIND.set(m);ATMOS.windScale=NSWIND.SCALE[m];const h0=heli(),a0=window._seeds.released,l0=lan();for(let i=0;i<80;i++)for(const f of TICKS.slice())f(.15,0);return[heli()-h0,window._seeds.released-a0,lan()-l0];};   // 12 s of the module's clock a run
  const tr=nearTree('trumpet',at[0],at[1]),ln=nearTree('lantern',at[0],at[1]);
  let calm,high,lc,lh;try{FLIGHT.pin={x:tr.x,z:tr.z};calm=run('calm');high=run('high');   // a trumpet grove, wherever the camera is
   FLIGHT.pin={x:ln.x,z:ln.z};lc=run('calm');lh=run('high');}   // and a stand of drift lanterns: they go the other way
  finally{for(const k in keep)B[k].hold=keep[k];NSWIND.set(mode);ATMOS.windScale=sc;FLIGHT.pin=null;}
  return{ok:calm[0]===0&&high[0]>=20&&lc[2]>=3&&lh[2]===0,detail:'12 s of calm: '+calm[0]+' winged seeds loose ('+calm[1]+' in all); 12 s of high wind: '+high[0]+' ('+high[1]+' in all); lanterns lifting: '+lc[2]+' in the calm, '+lh[2]+' in the gale'};},
 // the frill's fins: a breeze leaves them on the column, a gale tears them off (12 s of the module's clock a run, at a
 // frill near `at`); hold: the fins' hold replaced (a negative: one no wind reaches)
 fins(at,hold){if(typeof FLIGHT==='undefined'||!FLIGHT)return{ok:false,detail:'no seed flight (?seeds=0)'};
  const B=FLIGHT.BEAR.frillFin,keep=B.hold,mode=NSWIND.mode,sc=ATMOS.windScale,n=()=>window._seeds.fins||0;if(hold!=null)B.hold=hold;
  const run=m=>{NSWIND.set(m);ATMOS.windScale=NSWIND.SCALE[m];const f0=n();for(let i=0;i<80;i++)for(const f of TICKS.slice())f(.15,0);return n()-f0;};
  const T=nearTree('frill',at[0],at[1]);let br,hi;try{FLIGHT.pin={x:T.x,z:T.z};br=run('breeze');hi=run('high');}finally{B.hold=keep;NSWIND.set(mode);ATMOS.windScale=sc;FLIGHT.pin=null;}
  return{ok:br===0&&hi>=3,detail:'fins torn off the frills: '+br+' in 12 s of a breeze, '+hi+' in 12 s of high wind'};},
 // the trumpets' crowns are drawn with their pivot, so the spin turns them about the stalk
 // (every grown trumpet prototype with a crown, near or mid, carries the pivot; the far impostor has no crown)
 spin(protos){if(!window._variants)return{ok:true,detail:'unique trees (?unique=1): drawn still'};const sp=SPI('trumpet');let n=0,ok=0;
  for(const [k,P] of protos){const [s,,,lv]=k.split('|');if(+s!==sp||lv==='0')continue;n++;if(P.parts.some(q=>q.geo.attributes.aPivot))ok++;}
  return{ok:n>0&&ok===n,detail:ok+' of '+n+' trumpet prototypes turn their crown on its pivot'};},
 // the wind-shaped trees (the saxaul's lean, the frill's shed side, the dandelion's balding) are drawn turned so the wind
 // they were grown in lies along the wind where they stand: R = [x, z, the turn drawn]
 facing(R){const w0=NSEMIARID.windAt(0,0),p0=Math.atan2(w0[1],w0[0]);let bad=0;
  for(const r of R){const w=NSEMIARID.windAt(r[0],r[1]);let d=(p0-r[2])-Math.atan2(w[1],w[0]);d=Math.atan2(Math.sin(d),Math.cos(d));if(Math.abs(d)>.4)bad++;}
  return{ok:R.length>=20&&!bad,detail:bad?bad+' of '+R.length+' wind-shaped trees turned off the wind':R.length+' wind-shaped trees drawn here, each within 0.4 rad of the wind where it stands'};},
 // the furlers: placed open and shut by the gusts on the GPU (the material carries core/atmos's gust)
 furlers(meshes,shut){const live=meshes.filter(m=>m.userData.liveGusts).length;
  return{ok:meshes.length>0&&live===meshes.length&&shut===0,detail:meshes.length+' furler meshes, '+live+' shutting with core/atmos\'s gusts; '+shut+' placed shut as a still frame'};},
 // dead golden poplars stand on the salt behind the living forest
 deadPoplars(T){const bad=T.filter(t=>t.dead&&FIELD.salt(t.x,t.z)<.2&&NSEMIARID.zones(t.x,t.z).pan<.2);const dead=T.filter(t=>t.dead).length;
  return{ok:dead>0&&!bad.length,detail:bad.length?bad.length+' dead poplars off the salt':dead+' dead poplars, all on the salt'};}};
// the wind-shaped trees drawn now, [x, z, the turn], from the variants' pools; and the furlers' meshes
function windShapedDrawn(){const o=[];for(const p of VARIANTS.pools.values()){if(!NSEMIARID.SPECIES[p.sp].windShaped)continue;
 for(let i=0;i<p.n;i++){const m=p.arr,k=i*16;o.push([m[k+12],m[k+14],Math.atan2(m[k+8],m[k])]);}}return o;}
function furlerMeshes(){const o=[];scene.traverse(m=>{if(m.isInstancedMesh&&m.name==='biome:furler')o.push(m);});return o;}
