/* ================================================================= HOST — neighbour cousins via BIO.kin (swlowlands read in place; [web])
   Grows stunted collar oaks (swlowlands.corkoak -> domecorkoak) and seepage-fen alder-willows (swlowlands.willow -> moatalder)
   exclusively on Station 2 (moat) collar benches and outer exfoliation step-risers, never on bare unfractured dome aprons!
   ?kin=0 disables borrowed cousins cleanly.
*/
function growDomeKin(q){
 if(new URLSearchParams(location.search).get('kin')==='0'||typeof BIO.kin!=='function'||typeof SWLOW==='undefined')return{domecorkoak:0,moatalder:0};
 const qual=q==null?1:q;
 const OAK=BIO.kin('swlowlands.corkoak',{
  key:'domecorkoak',
  name:'Collar Stunted Oak',
  scale:{H:0.56,rb:0.68,crownR:0.58},
  tags:{climate:'temperate',aridity:'subhumid',borrowed:true}
 });
 const ALD=BIO.kin('swlowlands.willow',{
  key:'moatalder',
  name:'Ring-Moat Seepage Alder-Willow',
  scale:{H:0.58,rb:0.68,crownR:0.58},
  tags:{climate:'subtropic',aridity:'humid',riparian:'yes',borrowed:true}
 });
 const out={domecorkoak:0,moatalder:0};
 if(!OAK&&!ALD)return out;

 const prevCur=BIO.cur;
 BIO.cur='thedome/kin';
 try{
  if(SKEY==='moat'){
   const cell=34.0,N=Math.ceil(260/cell);
   for(let j=-N;j<=N;j++)for(let i=-N;i<=N;i++){
    const h=KRAND.hash(SITE.seed+701,i,j,0x771);
    if(KRAND.unit(h)>0.36*qual)continue;
    const u=s=>KRAND.unit(KRAND.hash(h,s,0,0x772));
    const x=(i+0.2+0.6*u(1))*cell,z=(j+0.2+0.6*u(2))*cell;
    /* Strictly on moat collar / fen perimeter (z < apronToeZ - 6), clear of reserves, rills & open fen water! */
    if(z>SITE.apronToeZ-6||Math.hypot(x-158,z+42)<106||inFlowChannel(x,z,8))continue;
    const y=DRAWN_H(x,z),w=waterH(x,z);
    if((w>-1e8&&y<w+0.85)||FIELD.slope(x,z)>0.46)continue;
    if(SPACE.some(x,z,8.5,()=>true))continue;

    const useAlder=(z>-56&&z<24&&ALD);
    const K=useAlder?ALD:OAK;
    if(!K)continue;
    reseed(h);
    const T=K.make(x,y,z);
    BIO.owner=[x,z];
    if(BIO.lodD(x,z)<320){
     BIO.range=420;BIO.minRange=0;K.grow(T,1);
     BIO.range=1800;BIO.minRange=420;K.grow(Object.assign({},T),0);
    }else{
     BIO.range=1800;BIO.minRange=0;K.grow(T,0);
    }
    BIO.owner=null;BIO.range=null;BIO.minRange=0;
    SPACE.insert({kind:'kin-tree',id:K.key+'-'+i+'-'+j},x,z,4.5);
    out[K.key]=(out[K.key]==null?0:out[K.key])+1;
    REGISTER({
     name:K.name,key:K.key,kind:'tree',label:K.name+' (BIO.kin: '+K.from+')',
     x:x,y:y,z:z,r:Math.max(3,T.crownR==null?4:T.crownR),h:T.H==null?8:T.H
    });
   }
  }else if(SKEY==='apron'&&OAK){
   /* A few wind-pruned stunted oaks tucked strictly into deep shellStep01 >= 0.78 outer risers */
   const pts=[[-145,-165],[152,-148],[-168,85],[164,92]];
   for(let k=0;k<pts.length;k++){
    const px=pts[k][0],pz=pts[k][1];
    const sh=DOME_PHYS.shellAt(px,pz,SITE);
    if(sh.shellStep01<0.72)continue;
    const py=DRAWN_H(px,pz),h=KRAND.hash(SITE.seed+709,k,1,0x779);
    reseed(h);
    const T=OAK.make(px,py,pz);
    BIO.owner=[px,pz];BIO.range=1600;BIO.minRange=0;OAK.grow(T,0);
    BIO.owner=null;BIO.range=null;BIO.minRange=0;
    out.domecorkoak++;
   }
  }
 }finally{
  BIO.cur=prevCur;
 }
 return out;
}
