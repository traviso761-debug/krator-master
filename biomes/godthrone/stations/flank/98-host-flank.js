// ================================================================= HOST — the high flank's views and checks (station 2)
// 99-host-take.js reads STATION_VIEWS (the views, found in the built scene: along the rille, at a pit of the chain, at the old
// vent) and the checks flankChecks / flankNegatives (each check with a broken input that must fail).
function STATION_VIEWS(VIEWS){const G=(x,z)=>terrainH(x,z),add=(k,v,mode)=>{if(v)VIEWS[k]={v,mode:mode||'day'};};
 const RP=RILLE.pts,ri=f=>RP[Math.max(0,Math.min(RP.length-1,Math.round(f*(RP.length-1))))];
 const side=(p,q,d)=>{const dx=q.x-p.x,dz=q.z-p.z,l=Math.hypot(dx,dz)||1;return[p.x-dz/l*d,p.z+dx/l*d];};
 // the plain from upslope: the flank falling away, the rille and the pits in it, the rings
 {const c=xzDA(-4300,-300),t=xzDA(2000,300);add('The high flank',[c[0],G(c[0],c[1])+90,c[1],t[0],G(t[0],t[1]),t[1]]);}
 // the rille from its rim, looking down it; and from its floor
 {const p=ri(.32),q=ri(.38),c=side(p,q,RILLE.w+30);add('The rille',[c[0],G(c[0],c[1])+6,c[1],q.x,q.y+20,q.z]);}
 {const p=ri(.45),q=ri(.5);add('In the rille',[p.x,p.y+2.5,p.z,q.x,q.y+25,q.z]);}
 // the pit chain, along the tube; and down into one pit
 {const P=TUBE.pits.filter(q=>q&&q.kind==='collapse');if(P.length>1){const a=P[0],b=P[Math.min(P.length-1,3)],dx=b.x-a.x,dz=b.z-a.z,l=Math.hypot(dx,dz)||1,c=[a.x-dx/l*80+dz/l*30,a.z-dz/l*80-dx/l*30];
   add('The pit chain',[c[0],G(c[0],c[1])+14,c[1],b.x,G(b.x,b.z)-10,b.z]);
   const q=P[Math.floor(P.length/2)],cq=[q.x+q.r*1.4,q.z+q.r*.4];add('A pit',[cq[0],G(cq[0],cq[1])+3,cq[1],q.x,q.y,q.z]);}}
 // the old vent, its cone and the rille's head
 {const V=VENT,c=[V.x-V.r*1.6,V.z-V.r*.6];add('The old vent',[c[0],G(c[0],c[1])+4,c[1],V.x,V.top,V.z]);}
 // the field of dark rings from high over the plain
 {const c=xzDA(-2400,-2600);add('The dark rings',[c[0],G(c[0],c[1])+1400,c[1],xzDA(0,0)[0],FL.y0-200,xzDA(0,0)[1]]);}
 {const p=ri(.6),q=ri(.64),c=side(p,q,-(RILLE.w+20));add('Dawn, frost in the rille',[c[0],G(c[0],c[1])+8,c[1],q.x,q.y+15,q.z],'dawn');}
 // the flows at dawn, low over them: their lobate fronts and levees in the long shadows
 {let best=null,o={};for(let k=0;k<4000&&!best;k++){const x=-3500+(k*977)%7000,z=-3500+(k*613)%7000;FLOWS.at(x,z,o);if(o.levee>2&&inMap(x,z))best=[x,z];}
  if(best){const c=[best[0]-120,best[1]-60];add('Dawn, the flows',[c[0],G(c[0],c[1])+12,c[1],best[0]+200,G(best[0]+200,best[1]+80)+2,best[1]+80],'dawn');
   add('The flows',[c[0],G(c[0],c[1])+12,c[1],best[0]+200,G(best[0]+200,best[1]+80)+2,best[1]+80]);}}
 {const c=xzDA(-1200,900),t=xzDA(1500,600);add('Night, the flank',[c[0],G(c[0],c[1])+20,c[1],t[0],G(t[0],t[1])+30,t[1]],'night');}}
// ---- the checks
const FCHK={
 // the rille: its floor never climbs downstream, and the drawn ground on its centre line is its floor (to a metre and a half)
 rille(P,ground){let up=0,off=0;for(let i=1;i<P.length;i++)if(P[i].y>P[i-1].y+1e-6)up++;
  const S=P.filter((p,i)=>i%6===0&&inMap(p.x,p.z));S.forEach(p=>{if(Math.abs(ground(p.x,p.z)-p.y)>1.5)off++;});
  return{ok:!up&&!off&&S.length>5,detail:P.length+' points, '+up+' climbing; '+off+' of '+S.length+' on the map off the drawn floor; it falls '+(P[0].y-P[P.length-1].y).toFixed(0)+' m'};},
 // the pit chain: at least three collapse pits on the map, each drawn as a hole (its centre well under the plain)
 pits(P,ground){const on=P.filter(q=>q&&q.kind==='collapse'&&inMap(q.x,q.z)),holes=on.filter(q=>flowGround(q.x,q.z)-ground(q.x,q.z)>TUBE.roof);
  return{ok:on.length>=3&&holes.length===on.length,detail:on.length+' collapse pits on the map, '+holes.length+' drawn as holes; '+P.filter(q=>q&&q.kind==='skylight').length+' skylights'};},
 // the dark rings: round each old vent the beads are thicker a radius or two out than six out
 rings(V,halo){const bad=V.filter(v=>!(halo(v.x+v.r*1.5,v.z)>halo(v.x+v.r*6,v.z)+.12));
  return{ok:!bad.length,detail:V.map(v=>halo(v.x+v.r*1.5,v.z).toFixed(2)+'/'+halo(v.x+v.r*6,v.z).toFixed(2)).join(', ')+' (1.5 r / 6 r)'};},
 // the flows (KLAVA.bake): every eruption froze; on the map they cover a good share of the plain, with levees and channels cut
 flows(F,box){const E=F.B.eruptions,done=E.every(e=>e.done||e.quenched),o={};let n=0,cov=0,lev=0,chn=0;
  for(let z=box[1];z<box[3];z+=60)for(let x=box[0];x<box[2];x+=60){n++;F.at(x,z,o);if(o.th>.5)cov++;if(o.levee>1)lev++;if(o.channel>1)chn++;}
  const share=cov/n;return{ok:done&&share>.15&&lev>50&&chn>20,detail:E.length+' eruptions, '+E.map(e=>(e.frozen/1e6).toFixed(1)+' Mm3'+(e.done?'':' (quenched)')).join(', ')+'; '+(share*100).toFixed(0)+'% of the map under flows; '+lev+' samples on a levee, '+chn+' in a channel; baked in '+F.ms+' ms'};},
 // the beds downwind: the rille's walls show the summit's ash between the flows (ROCK-PROPOSAL.md's tuff aprons), all fresh (no palagonite)
 ash(samples){const k={};samples.forEach(q=>k[q.kind]=(k[q.kind]||0)+1);const ash=(k.ash||0)+(k.ignimbrite||0);
  return{ok:samples.length>100&&ash>=samples.length*.04&&!k.palagonite,detail:samples.length+' wall samples: '+JSON.stringify(k)};},
 // the air: four tenths of an atmosphere at the old vent (the model's law); the cold: about -40 C (the plan's table)
 air(p,t){const ok=Math.abs(p-.40)<.02&&t>-60&&t<-20;return{ok,detail:p.toFixed(3)+' atm and '+t.toFixed(0)+' C at the old vent'};}};
/* the rille's walls: strata samples down its faces (the beds a reader sees), from 8 m over its floor to 4 m under the rim, on both
   walls across the rille's line. The rille's record (KRELIEF.rille) keeps no depth (its depth is the ground over its floor), so the
   wall's height is read at each point: the plain's ground (flowGround, before the cut) over the floor. It read RILLE.depth, which is
   undefined, so the check sampled nothing (GPU verify 2026-11-08: "0 wall samples") */
const rilleWall=()=>{const o=[],P=RILLE.pts;for(let i=0;i<P.length;i+=2){const p=P[i],a0=P[Math.max(0,i-1)],a1=P[Math.min(P.length-1,i+1)],
  tx=a1.x-a0.x,tz=a1.z-a0.z,l=Math.hypot(tx,tz)||1,D=flowGround(p.x,p.z)-p.y;
  for(let d=-1;d<=1;d+=2)for(let h=8;h<D-4;h+=3.5){const x=p.x-tz/l*d*RILLE.w*.42,z=p.z+tx/l*d*RILLE.w*.42,a=STRATA.at(x,p.y+h,z);if(inMap(x,z))o.push({kind:a.kind});}}return o;};
const presAt=y=>ATMOS.airPressureAt(SKY.preset||{air:{pressure:1.6,thin:{y0:0,scale:8000}}},y);
function flankChecks(){const R=[],add=(n,r)=>R.push(Object.assign({name:n},r)),h=KHAZ.here(VENT.x,VENT.top,VENT.z,0);
 add('the rille: its floor falls and is drawn',FCHK.rille(RILLE.pts,terrainH));
 add('the pit chain: its pits are holes',FCHK.pits(TUBE.pits,terrainH));
 add('the old vents\' dark rings',FCHK.rings(OLDVENTS,FIELD.halo));
 add('the flows: frozen, with levees and channels',FCHK.flows(FLOWS,[TERR.X0,TERR.Z0,TERR.X1,TERR.Z1]));
 add('the air at 11 km',FCHK.air(presAt(VENT.top),tempMean(VENT.top)));
 add('the beds downwind: ash between the flows',FCHK.ash(rilleWall()));
 return R;}
function flankNegatives(){const R=[],add=(n,r)=>R.push({name:n,failed:!r.ok,detail:r.detail});
 add('the rille run uphill',FCHK.rille(RILLE.pts.slice().reverse(),terrainH));
 add('the pits filled in',FCHK.pits(TUBE.pits,(x,z)=>flowGround(x,z)));
 add('no rings (a flat halo)',FCHK.rings(OLDVENTS,()=>.5));
 add('flows with no levees or channels',FCHK.flows({B:FLOWS.B,ms:0,at:(x,z,o)=>{FLOWS.at(x,z,o);o.levee=0;o.channel=0;return o;}},[TERR.X0,TERR.Z0,TERR.X1,TERR.Z1]));
 add('the summit\'s air on the flank',FCHK.air(presAt(25000),-75));
 add('the upwind beds (no ash)',FCHK.ash(rilleWall().map(q=>q.kind==='ash'||q.kind==='ignimbrite'?Object.assign({},q,{kind:'flow'}):q)));
 return R;}
const STATION_CHECKS=flankChecks,STATION_NEGATIVES=flankNegatives;   // 99-host-take.js reads these
