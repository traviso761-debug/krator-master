// ================================================================= HOST — the e rim's own passes (landOwn: 87-host-land.js calls it before the grass)
// PLAN-LANDS.md section 5.1 (J5, 2026-11-08). The cousins are SAVRIM.LANDS.east's (src/52: BIO.kin of eastabyss's and ehighlands' builders,
// read in place); each place a KRAND lattice cell (87's cells), each plant made from a reseed of its cell's hash (the source builders
// draw from their kit stream), registered before the bake. H4 (core/biome 39): the giant at the canon azimuth (BIO.setGiant(66)), the e
// highlands' builders bound to it; the pull toward it a share of each cousin's own lean, 1 at the map's east edge fading to .15 at its west.
// H7: the monsoon ragbark's leaves drop in the dry season and the bolster turns fire-orange (the season on ehighlands' materials, set on
// this page only: the source page draws as before). H1: the savage jungle's comb tree and elephant ear from the west, the abyss's
// horsetails and cycads thicker to the east (BIO.reachW on the land's homes, 44l).
function landOwn(c){const K=SAVRIM.LANDS.east.cousins(),out=c.out,WE=c.W0+5;
 if(BIO.setGiant){BIO.setGiant(66);if(typeof EHIGH!=='undefined'&&EHIGH.setGiant)EHIGH.setGiant(BIO.GIANT_AZ);}
 const pull=x=>.15+.85*smooth(-TERR.R,TERR.R,x),RS={from:'savage',km:14},RA={from:'eastabyss',km:22},rw=(r,x,z)=>BIO.reachW?BIO.reachW(r,x,z):1;
 out.pull=[];out.kin=out.kin.concat(Object.keys(K).filter(k=>K[k]).map(k=>K[k].record));
 // the season on the e highlands' materials (this page only): the rag leaves drop, the cushion skin turns orange
 if(typeof EHIGH!=='undefined'&&EHIGH.MAT&&new URLSearchParams(location.search).get('season')!=='0'){
  const turn=(m,key,sn)=>{if(!m||!m.userData||!m.userData.bio)return;const o=Object.assign({},m.userData.bio.opts,{season:sn}),ck='biofol|'+key;m.onBeforeCompile=BIO.foliageHook(o);m.userData.bio.opts=o;
   m.customProgramCacheKey=function(){return ck+BIO._fx()+(m.alphaToCoverage?'|a2c':'');};m.needsUpdate=true;};
  turn(EHIGH.MAT.rag,'savannarim|monsoonrag',{drop:.9,colour:0x9a7040,k:.5});turn(EHIGH.MAT.cushion,'savannarim|bolster',{colour:0xd86a20,k:.9});out.seasonTurned=true;}
 // the ember spikes flower after the dry-season burn (this season's and last year's, under 1.5 years), then stand as spent torches (to 3
 // years); elsewhere the e highlands' own stages, less their flowering stands (EHIGH.vigilStage on this page only). The spike holds
 // its florets: on this page its item draws as a structure (a vertex-coloured solid, the hyperjungle's lands' G.smat), not a swaying
 // card (the source's M.vsway), so the attachment audit finds what holds them
 if(typeof EHIGH!=='undefined'&&EHIGH.vigilStage){const own=EHIGH.vigilStage;EHIGH.vigilStage=(x,z)=>{const a=burnAge(x,z);if(a<1.5)return'flower';if(a<3)return'torch';const s0=own(x,z);return s0==='flower'?'rosette':s0;};
  const pk=BIO.kit('ehigh');try{if(BIO.defs.spire)BIO.defs.spire.mat=HYPERJUNGLE.LANDS.G.smat();}finally{BIO.kit(pk);}}
 const kinTree=(K,key,x,z,h,lvNear,lvFar,name,r0,lean)=>{reseed(h);if(lean!=null)K.record.lean=lean;const T=K.make(x,terrainH(x,z),z);
  REGISTER({name,key,kind:'tree',label:K.name,x,z,y:T.y0,r:(T.crownR==null?r0:T.crownR)+2,h:T.H+3});
  c.grown(K.grow,T,lvNear,lvFar,x,z);c.S.insert(T,x,z,(T.rb==null?1:T.rb)*1.6+r0*.3);c.cnt(key);return T;};
 // the fire scale-trees on the old burns (three years and more) out on the open grass
 try{if(K.firescale)c.cells(140,0x7a10,(x,z,h,u)=>{const Z=zoneW(x,z);if(Z.sav<.8||burnAge(x,z)<3||u(3)>.35*(.4+.6*rw(RA,x,z))||!c.free(x,z,5))return;
   kinTree(K.firescale,'firescale',x,z,h,BIO.lodD(x,z)<1100?2:1,0,'Fire scale-tree (a cousin of the abyss\'s sigillaria: the corky bark charred)',4);c.closer('scaleAt',x,z,'Fire scale-trees');});}
 catch(e){reportErr('east fire scale-trees: '+e.stack);}
 // the monsoon cycads: flushing on the burns one to five years old (the post-burn flush: brighter the younger the burn)
 try{if(K.monsooncycad)c.cells(50,0x7a20,(x,z,h,u)=>{const Z=zoneW(x,z),a=burnAge(x,z);if(Z.sav<.6||a<.6||a>5.5||u(3)>.5*(.35+.65*rw(RA,x,z))||!c.free(x,z,2.5))return;
   const fl=smooth(5.5,.8,a);K.monsooncycad.record.leaf=[0x2e5a34,0x386a3c,0x4a7a3a,0x2a5030].map(v=>{const C=new THREE.Color(v).lerp(new THREE.Color(0x7ad24a),.55*fl);return C.getHex();});
   kinTree(K.monsooncycad,'monsooncycad',x,z,h,BIO.lodD(x,z)<900?2:1,0,'Monsoon cycad (flushing green after the fire)',2);c.closer('cycadAt',x,z,'The post-burn cycad flush');});}
 catch(e){reportErr('east cycads: '+e.stack);}
 // the dambo horsetails, in the dambos
 try{if(K.dambotail)c.cells(30,0x7a30,(x,z,h,u)=>{const Z=zoneW(x,z);if(Z.dambo<.4||u(3)>.35*Z.dambo*(.4+.6*rw(RA,x,z))||!c.free(x,z,2))return;
   kinTree(K.dambotail,'dambotail',x,z,h,BIO.lodD(x,z)<900?2:1,0,'Dambo horsetail (a cousin of the abyss\'s pipe reed)',2);c.closer('tailAt',x,z,'Dambo horsetails');});}
 catch(e){reportErr('east horsetails: '+e.stack);}
 // the ember spikes: stands on the grass, flowering where it burnt this season or last; leaning to the giant, the pull fading west
 try{if(K.emberspike)c.cells(36,0x7a40,(x,z,h,u)=>{const Z=zoneW(x,z),st=smooth(.05,.2,KN(x,z,.003,840,2));if(Z.sav<.7||u(3)>.5*st||!c.free(x,z,2))return;
   const a=burnAge(x,z),T=kinTree(K.emberspike,'emberspike',x,z,h,BIO.lodD(x,z)<800?2:1,0,a<1.5?'Ember spike (flowering after the burn, leaning toward the giant)':'Ember spike (leaning toward the giant)',2,.38*pull(x));
   out.pull.push([x,K.emberspike.record.lean]);if(a<1.5)c.cnt('emberFlower');c.closer('spikeAt',x,z,'Ember spikes toward the giant');});}
 catch(e){reportErr('east ember spikes: '+e.stack);}
 // the monsoon ragbarks: woods on the slopes and the gallery's edges, their crowns combed toward the giant
 try{if(K.monsoonrag)c.cells(110,0x7a50,(x,z,h,u)=>{const Z=zoneW(x,z),wd=smooth(.0,.18,KN(x,z,.0014,841,3))+.6*smooth(.1,.4,Z.gallery)*smooth(.95,.5,Z.gallery);if(Z.sav<.4&&Z.gallery<.1||u(3)>.5*wd||!c.free(x,z,8))return;
   kinTree(K.monsoonrag,'monsoonrag',x,z,h,BIO.lodD(x,z)<1000?2:1,0,'Monsoon ragbark (deciduous; its crown combed toward the giant)',10,.32*pull(x));c.closer('ragAt',x,z,'Monsoon ragbark woods');});}
 catch(e){reportErr('east ragbarks: '+e.stack);}
 // the bolsters and the glass wands on the ironstone pavements (the laterite), near and mid ranges
 try{const R1=c.LD.mid+60;if(K.bolster)c.cells(9,0x7a60,(x,z,h,u)=>{if(Math.hypot(x,z)>R1)return;const Z=zoneW(x,z);if(Z.lat<.4||u(3)>.3*Z.lat||!c.free(x,z,1.5))return;
   reseed(h);K.bolster.record.lean=.25*pull(x);const T=K.bolster.make(x,terrainH(x,z),z);BIO.owner=[x,z];BIO.range=Math.hypot(x,z)<c.LD.floor?c.LD.floor:c.LD.mid;try{K.bolster.grow(T,2);}finally{BIO.owner=null;BIO.range=null;}
   REGISTER({name:'A bolster (emerald in the rains, fire-orange in the dry)',key:'bolster',kind:'plant',label:'Bolster',x,z,y:T.y0,r:(T.crownR==null?1:T.crownR)+.5,h:(T.H==null?1:T.H)+.5});c.cnt('bolster');c.closer('bolsterAt',x,z,'Bolsters on the ironstone');},R1);
  if(K.glasswand)c.cells(22,0x7a61,(x,z,h,u)=>{if(Math.hypot(x,z)>R1)return;const Z=zoneW(x,z);if(Z.lat<.5||u(3)>.12*Z.lat||!c.free(x,z,1.5))return;
   reseed(h);K.glasswand.record.lean=.2*pull(x);const T=K.glasswand.make(x,terrainH(x,z),z);BIO.owner=[x,z];BIO.range=c.LD.mid;try{K.glasswand.grow(T,2);}finally{BIO.owner=null;BIO.range=null;}
   REGISTER({name:'A glass wand (the glass tower\'s small cousin; wormwick, proposed)',key:'glasswand',kind:'plant',label:'Glass wand',x,z,y:T.y0,r:1.2,h:(T.H==null?2:T.H)+.5});c.cnt('glasswand');c.closer('wandAt',x,z,'Glass wands');},R1);}
 catch(e){reportErr('east pavements: '+e.stack);}
 // from the west by reach (H1): the savage jungle's comb tree on the gallery's edges, its elephant ear in the gullies (the river's banks)
 try{const HL=typeof HYPERJUNGLE!=='undefined'&&HYPERJUNGLE.LANDS&&HYPERJUNGLE.LANDS.savage;if(HL){HL.def();
  c.cells(240,0x7a70,(x,z,h,u)=>{const Z=zoneW(x,z),w=rw(RS,x,z),edge=smooth(.1,.4,Z.gallery)*smooth(.95,.55,Z.gallery);if(u(3)>.9*edge*w||!c.free(x,z,14))return;
   const T=HL.combtree.make(x,terrainH(x,z),z,h);if(!T)return;T.H*=.62;T.rb*=.65;T.crownR*=.75;   /* out of the old growth's soil, two-thirds the size */
   REGISTER({name:'Comb tree (from the savage jungle by reach)',key:'combtree',kind:'tree',label:'Comb tree',x,z,y:T.y0,r:T.crownR+4,h:T.H+6});
   c.grown(HL.combtree.grow,T,BIO.lodD(x,z)<1200?2:1,0,x,z);c.S.insert(T,x,z,T.rb*1.6+6);c.cnt('combtree');c.closer('combAt',x,z,'A comb tree on the gallery\'s edge');});
  c.cells(18,0x7a71,(x,z,h,u)=>{const Z=zoneW(x,z),w=rw(RS,x,z);if(Z.rd<RIVER.w*.6+6||Z.rd>RIVER.w*.6+40||u(3)>.35*w||Math.hypot(x,z)>c.LD.mid||!c.free(x,z,4))return;
   const T=HL.elephantear.make(x,terrainH(x,z),z,h,false);T.L*=.8;REGISTER({name:'Elephant ear (from the savage jungle by reach)',key:'elephantear',kind:'plant',label:'Elephant ear',x,z,y:T.y0,r:T.L*.8,h:T.L*.8});
   BIO.range=c.LD.mid;try{HL.elephantear.grow(T,Math.hypot(x,z)<c.LD.floor?2:1);}finally{BIO.range=null;}c.cnt('elephantear');},c.LD.mid+40);}}
 catch(e){reportErr('east by reach: '+e.stack);}}
// the land's checks (99 calls LAND.checks)
LAND.checks=function(add,L){const n=L.n||{};
 add('the old lines drawn (the e rim\'s cousins)',(()=>{const need=LAND.need,bad=Object.keys(need).filter(k=>!((n[k]==null?0:n[k])>=need[k]));return{ok:!bad.length,detail:Object.keys(need).map(k=>k+' '+(n[k]==null?0:n[k])).join(', ')+(bad.length?'; short: '+bad.join(', '):'')};})());
 add('the pull toward the giant fades west (H4)',(()=>{const P=L.pull||[];if(P.length<10)return{ok:false,detail:'too few ember spikes'};const E=P.filter(p=>p[0]>1000),Wst=P.filter(p=>p[0]<-1000),m=a=>a.reduce((s,p)=>s+p[1],0)/Math.max(1,a.length);
  return{ok:BIO.GIANT_AZ===66&&(typeof EHIGH==='undefined'||EHIGH.GIANT_AZ===BIO.GIANT_AZ)&&m(E)>m(Wst)*1.5,detail:'giant at '+BIO.GIANT_AZ+' (EHIGH '+(typeof EHIGH==='undefined'?'-':EHIGH.GIANT_AZ)+'); mean lean east '+m(E).toFixed(3)+', west '+m(Wst).toFixed(3)};})());
 add('the ember spikes flower after the burn',(()=>({ok:(n.emberFlower==null?0:n.emberFlower)>0&&n.emberFlower<n.emberspike,detail:(n.emberFlower==null?0:n.emberFlower)+' of '+(n.emberspike==null?0:n.emberspike)+' flowering (on burns under 1.5 years)'}))());
 add('the season on the e highlands\' materials (this page only)',(()=>{const o=typeof EHIGH!=='undefined'&&EHIGH.MAT.rag.userData.bio.opts;return{ok:!!(o&&o.season&&L.seasonTurned),detail:'rag season '+JSON.stringify(o&&o.season)};})());};
LAND.negatives=function(add){add('a reach with no home (weight 0)',(()=>{const w=BIO.reachW?BIO.reachW({from:'nowhere',km:10},0,0):0;return{ok:w>0,detail:'weight '+w};})());};
