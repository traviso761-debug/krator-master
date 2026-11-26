// ================================================================= HOST — the cloud slopes' own passes (station 2; stationBuild, called by 89z after XANADU.build)
// The kit's passes have already placed the Vale's species by its zones from this land's fields (45b): the belt's tree-ferns, cloud frills and beard trees
// (the `cloud` zone), the face's forest below the belt, the crest's crag pines, the shoulders' garrigue (the `dry` zone). This pass adds the station's own:
//   COUSINS of the kit's species, grown into cloud-forest forms by BIO.kin on XANADU.make/grow (core/biome 32), each loaded with epiphytes on its bole:
//     xanadu.lotustrumpet -> 'cloudtrumpet', Cloud trumpet: taller (x1.3), a broader bole (x1.1), beard moss and moss mats on its fluted bole; the belt
//     xanadu.hazeblossom  -> 'cloudhaze', Cloud haze blossom: taller and narrower in the forest (H x1.25, crown x.8), hung with beards; the belt's lower half
//     xanadu.cloudfern    -> 'mistfern', Mist tree-fern: the cloud tree-fern grown big in the wettest air (H x1.35, crown x1.15); the belt and the ravines
//   THE MONKS' PLANTS from oidong (EXCHANGES.md "oidong ↔ xanadu", oidong as vendor; its fragments on the page by station.json "kin"):
//     oidong.cherry -> 'cloudcherry', Cloud cherry, a cousin, the blossom a DEEPER rose (Oidong paled Xanadu's five trees, so Xanadu deepens Oidong's cherry):
//                      the terraces of the leeward shoulders and the face's clearings, 1.5-2.6 km. The builder reads OIDONG.PAL, not its record, so its
//                      blush is swapped for the rose while it grows (and the procedural blossom card used, as the library's is white-tinted), then put back
//     oidong 'tea'  -> Mist tea, read in place: oidong's own items ('lobe' and 'teabush' under its registry) in oidong's teaBush recipe, wild on the wet face
//                      below the belt (Cfb, 1.5-2.1 km), in loose drifts
// Every placement is a cell of its own lattice, KRAND.hash(the station's seed, i, j, salt), and a tree's numbers come from a reseed of the same hash: nothing
// the kit placed moves. Clear of the kit's trees (core/space), the obstacles, the stream. A hero within XANADU.LOD.tree of its chunk, its far blob past it,
// as the kit's own trees. ?kin=0 grows none of them.
const CLOUD_KIN={};
function stationBuild(){if(!XQ_ON('kin')||!BIO.kin)return null;
 const W=0xC10D2,out={cloudtrumpet:0,cloudhaze:0,mistfern:0,cloudcherry:0,tea:0,epiphytes:0};
 const K={trumpet:BIO.kin('xanadu.lotustrumpet',{key:'cloudtrumpet',name:'Cloud trumpet',scale:{H:1.3,rb:1.1,crownR:1.1},tags:{koppen:['Cfb'],humid:true}}),
  haze:BIO.kin('xanadu.hazeblossom',{key:'cloudhaze',name:'Cloud haze blossom',scale:{H:1.25,crownR:.8},tags:{koppen:['Cfb']}}),
  fern:BIO.kin('xanadu.cloudfern',{key:'mistfern',name:'Mist tree-fern',scale:{H:1.35,rb:1.1,crownR:1.15},tags:{koppen:['Cfb']}}),
  cherry:typeof OIDONG!=='undefined'?BIO.kin('oidong.cherry',{key:'cloudcherry',name:'Cloud cherry',tags:{koppen:['Cfb','Csb'],shared:'oidong'}}):null};
 Object.assign(CLOUD_KIN,K);
 const S=KSPACE.create({cell:40});(XANADU.TREES||[]).forEach(T=>S.insert(T,T.x,T.z,(T.rb==null?.5:T.rb)*1.4+2));
 const clear=(x,z,r)=>!S.some(x,z,r,()=>true)&&BIO.clearOf(x,z,r)&&BIO.mask(x,z)>.6&&LAND.mask(x,z);
 const R=TERR.R-150,F=(n,x,z)=>BIO.field(n,x,z),SL=(x,z)=>FC.at(FC.a.slope,x,z),PL=[];CLOUD_KIN.placed=PL;
 const rr2=(h,k,a,b)=>a+(b-a)*KRAND.unit(KRAND.hash(h,k,7,0));
 /* the bole's epiphytes: beard moss hanging from the bole's surface and moss mats on it, both held by the bole (never in the crown's air) */
 function epiphytes(T,h,n){const k0=BIO.kit('xanadu');for(let k=0;k<n;k++){const a=rr2(h,10+k,0,TAU),y=T.y0+T.H*rr2(h,40+k,.18,.55),r=(T.rb==null?.6:T.rb)*.92,px=T.x+Math.cos(a)*r,pz=T.z+Math.sin(a)*r;
   if(k%3===2){const s=rr2(h,70+k,.35,.7);BIO.put('mossmat',[px,y,pz],qUp([Math.cos(a),.25,Math.sin(a)]),[s,1,s],new THREE.Color().setHSL(.24+rr2(h,90+k,-.03,.03),.45,.3));}
   else BIO.put('beard',[px,y,pz],qEuler(0,a,0),[rr2(h,100+k,.5,.9),Math.min(y-T.y0-.6,rr2(h,130+k,1.6,4.2)),1],new THREE.Color().setHSL(.2+rr2(h,160+k,-.03,.04),.38,.42));
   out.epiphytes++;}BIO.kit(k0);}
 function lattice(KK,name,cell,salt,accept,minR,after){if(!KK)return 0;let n=0;const N=Math.ceil(R/cell);
  for(let j=-N;j<=N;j++)for(let i=-N;i<=N;i++){const h=KRAND.hash(W,i,j,salt),u=k=>KRAND.unit(KRAND.hash(h,k,0,salt)),x=(i+u(1))*cell,z=(j+u(2))*cell;
   if(Math.abs(x)>R||Math.abs(z)>R||u(3)>accept(x,z)||!clear(x,z,minR))continue;
   const y=terrainH(x,z);reseed(h);const T=KK.make(x,y,z);const lv=BIO.lodD(x,z)<XANADU.LOD.tree?2:0;
   BIO.owner=[x,z];if(lv===2){BIO.range=XANADU.LOD.tree;BIO.minRange=0;reseed(h);KK.grow(T,2);if(after)after(T,h);BIO.range=1e9;BIO.minRange=XANADU.LOD.tree;reseed(h);KK.grow(Object.assign({},T),0);}
   else{BIO.range=null;BIO.minRange=0;reseed(h);KK.grow(T,0);}
   BIO.owner=null;BIO.range=null;BIO.minRange=0;
   S.insert(T,x,z,(T.rb==null?1:T.rb)*1.4+2);PL.push({key:name,x,z,y,lv});REGISTER({name:KK.name,kind:'tree',label:KK.name,x,z,y:T.y0,r:T.crownR==null?3:T.crownR,h:T.H});n++;}
  return n;}
 const belt=(x,z)=>F('mist',x,z),hAt=(x,z)=>terrainH(x,z),wind=(x,z)=>windK(x,z);
 BIO.cur='xanadu/trees';
 out.cloudtrumpet=lattice(K.trumpet,'cloudtrumpet',64,0xc11,(x,z)=>.55*smooth(.45,.75,belt(x,z))*smooth(.6,.3,SL(x,z)),4,(T,h)=>epiphytes(T,h,8));
 out.cloudhaze=lattice(K.haze,'cloudhaze',56,0xc12,(x,z)=>{const y=hAt(x,z);return .5*smooth(.3,.6,belt(x,z))*smooth(2450,2200,y)*smooth(.6,.3,SL(x,z));},3.5,(T,h)=>epiphytes(T,h,5));
 out.mistfern=lattice(K.fern,'mistfern',26,0xc13,(x,z)=>.55*Math.max(smooth(.5,.8,belt(x,z)),.8*smooth(.5,.85,F('wet',x,z))*wind(x,z)*smooth(1550,1800,hAt(x,z)))*smooth(.75,.4,SL(x,z))*smooth(2720,2640,hAt(x,z)),2.2);
 /* the cherry: the leeward terraces (CL.terraceK) and the face's clearings below the belt, 1.5-2.6 km; its blush swapped for the rose while it grows */
 if(K.cherry){const P=OIDONG.PAL,keep={blush:P.blush.slice(),ivory:P.ivory?P.ivory.slice():null},card=OIDONG.CARD.cherrybloom,ROSE=[0xd8607e,0xe0708c,0xcf5272,0xe68aa0];
  try{P.blush.splice(0,P.blush.length,...ROSE);if(P.ivory)P.ivory.splice(0,P.ivory.length,0xf0b8c6,0xeaa6b8);OIDONG.CARD.cherrybloom=false;
   out.cloudcherry=lattice(K.cherry,'cloudcherry',52,0xc14,(x,z)=>{const y=hAt(x,z);if(y<1500||y>2600)return 0;return .7*Math.max(CL.terraceK(x,z),.4*wind(x,z)*smooth(.35,.1,belt(x,z))*smooth(.45,.65,fbm(x*.003+1,z*.003-2,74,2)))*smooth(.5,.25,SL(x,z));},3);}
  finally{P.blush.splice(0,P.blush.length,...keep.blush);if(keep.ivory)P.ivory.splice(0,P.ivory.length,...keep.ivory);OIDONG.CARD.cherrybloom=card;}}
 /* the tea: oidong's items in its registry, its teaBush recipe on KRAND numbers; the wet face below the belt, in drifts round a few seeds */
 if(typeof OIDONG!=='undefined'){const k0=BIO.kit('oidong'),cell=14,N=Math.ceil(R/cell),CEL=[0x9cc4a8,0xa8d0b0,0x8cb89c];BIO.cur='xanadu/floor';
  for(let j=-N;j<=N;j++)for(let i=-N;i<=N;i++){const h=KRAND.hash(W,i,j,0xc15),u=k=>KRAND.unit(KRAND.hash(h,k,0,0xc15)),x=(i+u(1))*cell,z=(j+u(2))*cell;if(Math.abs(x)>R||Math.abs(z)>R)continue;
   const y=hAt(x,z),a=.6*wind(x,z)*smooth(1500,1600,y)*smooth(2150,1950,y)*smooth(.7,.85,F('wet',x,z))*smooth(.52,.62,fbm(x*.004-3,z*.004+5,75,2))*smooth(.5,.3,SL(x,z));
   if(u(3)>a||BIO.lodD(x,z)>600||!BIO.clearOf(x,z,1.2)||BIO.mask(x,z)<.6||!LAND.mask(x,z))continue;
   const Rb=.5+.4*u(4),hc=new THREE.Color(CEL[(u(5)*3)|0]),yy=drawnH(x,z);BIO.owner=[x,z];BIO.range=600;BIO.minRange=0;
   BIO.put('lobe',[x,yy-.1,z],qEuler(0,u(6)*TAU,0),[Rb,Rb*.8,Rb],hc.clone().lerp(new THREE.Color(0x101410),.3));
   for(let k=0;k<4;k++){const aa=u(10+k)*TAU,d=Rb*.5;BIO.put('teabush',[x+Math.cos(aa)*d,yy+Rb*.6,z+Math.sin(aa)*d],qEuler((u(20+k)-.5)*.6,u(30+k)*TAU,(u(40+k)-.5)*.6),[Rb*1.1,Rb*.7,Rb*1.1],hc.clone().multiplyScalar(1.15),{n:[0,1,0]});}
   PL.push({key:'tea',x,z,y,lv:2});out.tea++;}
  BIO.owner=null;BIO.range=null;BIO.minRange=0;BIO.kit(k0);}
 BIO.cur=null;return out;}
// THE STATION'S CHECKS (verify.py --assert runs them through hostChecks): each cousin grows in its own band, and the monks' plants where the row puts them
const CLOUD_BANDS={cloudtrumpet:[1850,2700],cloudhaze:[1800,2500],mistfern:[1450,2750],cloudcherry:[1500,2600],tea:[1500,2150]};
function cloudBands(P){const bad=[],n={};(P||[]).forEach(p=>{n[p.key]=(n[p.key]||0)+1;const b=CLOUD_BANDS[p.key];if(b&&(p.y<b[0]||p.y>b[1]))bad.push(p.key+'@'+Math.round(p.y));});
 const min={cloudtrumpet:20,cloudhaze:20,mistfern:60,cloudcherry:10,tea:20},few=Object.keys(min).filter(k=>(n[k]||0)<min[k]);
 return{ok:!bad.length&&!few.length,detail:JSON.stringify(n)+(bad.length?'; out of band: '+bad.slice(0,6).join(', '):'')+(few.length?'; too few: '+few.join(', '):'')};}
function stationChecks(add){add('the cloud slopes: each cousin and the monks\' plants in their bands (EXCHANGES.md oidong rows)',cloudBands(CLOUD_KIN.placed));}
function stationNegatives(add){add('a cloud cherry above the terraces (3.1 km)',cloudBands((CLOUD_KIN.placed||[]).concat([{key:'cloudcherry',x:0,z:0,y:3100,lv:2}])));}
