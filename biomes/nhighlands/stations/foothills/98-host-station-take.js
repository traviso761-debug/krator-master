// ================================================================= HOST — station 3, the Mediterranean foothills: its views, its checks (read by src/99-host-take.js)
// Replaces station 2's file of the same name. The trees that make this station are swlowlands' (87-host-station-kin.js: STATION_KIN), so its checks read them.
const STATION_SKIP=['tower-hung-with-growth','trumpets-and-glow-found','every-species-placed','stream-descends'];   /* a foothill creek on rolling ground has no falls */
const STATION_FRUIT=['mast'];   /* the black oaks' acorns (the kit's); swlowlands' oaks carry their own */
const STATION_KIN_KEYS=['sprawloak','coastoak','corkoak','sycamore','madrone','manzanita'];
const STATION_VIEWS=function(add,G){const P=(s,t)=>xzOf(s,t),K=k=>(STATION_KIN[k]||[]).filter(T=>T.lv===2).sort((a,b)=>BIO.lodD(a.x,a.z)-BIO.lodD(b.x,b.z));
 {const c=P(2800,-500),t=P(-1300,300);add('Overview: the foothills',[c[0],G(c[0],c[1])+110,c[1],t[0],G(t[0],t[1])+10,t[1]]);}
 {const T=K('sprawloak')[0];if(T){const cx=T.x+T.crownR*1.4,cz=T.z+T.crownR*.6;add('A sprawl oak on the golden grass',[cx,G(cx,cz)+2,cz,T.x,T.y0+T.H*.4,T.z]);}}
 {const T=K('coastoak')[0];if(T){const cx=T.x+30,cz=T.z-20;add('Oak woodland',[cx,G(cx,cz)+2,cz,T.x,T.y0+T.H*.4,T.z]);}}
 {const T=K('manzanita')[0];if(T){const cx=T.x+24,cz=T.z+18;add('Chaparral',[cx,G(cx,cz)+3,cz,T.x,G(T.x,T.z)+1.5,T.z]);}}
 {const T=K('sycamore')[0];if(T){const cx=T.x+22,cz=T.z+14;add('The sycamore creek',[cx,G(cx,cz)+2,cz,T.x,T.y0+T.H*.4,T.z]);}}
 {const T=K('corkoak')[0];if(T){const cx=T.x+18,cz=T.z+12;add('The cork grove',[cx,G(cx,cz)+1.8,cz,T.x,T.y0+T.H*.3,T.z]);}}
 {const a=1.1,cx=TARN.x+Math.cos(a)*(TARN.r+25),cz=TARN.z+Math.sin(a)*(TARN.r+25);add('The stock pond',[cx,G(cx,cz)+3,cz,TARN.x,TARN.level+1,TARN.z]);}
 {const c=P(-600,700),t=P(1200,-300);add('Evening light on the hills',[c[0],G(c[0],c[1])+8,c[1],t[0],G(t[0],t[1])+20,t[1]],'dawn');}};
const STATION_CHK={
 // swlowlands' trees grew here, each kind
 kin(K,keys){const miss=keys.filter(k=>!(K[k]&&K[k].length));return{ok:!miss.length,detail:miss.length?'never grown: '+miss.join(', ')+' (swlowlands read in place)':keys.map(k=>k+':'+K[k].length).join(' ')};},
 // and none of them stands in the water or on a sheer face
 dry(K){const all=[].concat(...Object.values(K)),bad=all.filter(T=>BIO.depth(T.x,T.z)>0||(NHL.SHORE&&NHL.SHORE(T.x,T.z)<0)||FC.at(FC.a.slope,T.x,T.z)>1.5);
  return{ok:!bad.length,detail:bad.length?bad.length+' of '+all.length+' in the water or on a cliff (first at '+[bad[0].x|0,bad[0].z|0]+')':all.length+' read-in-place trees, all on dry ground'};},
 // the savanna stays open: lone oaks, not a wood (the grass between them at least 30 m a tree)
 open(K){let A=0;for(let z=-TERR.R+100;z<TERR.R;z+=200)for(let x=-TERR.R+100;x<TERR.R;x+=200)if(FIELD.savanna(x,z)>.6)A+=4e4;
  const n=[].concat(...Object.values(K),NHL.TREES).filter(T=>T.H>8&&FIELD.savanna(T.x,T.z)>.6).length,sp=n?Math.sqrt(A/n):1e9;
  return{ok:sp>=30,detail:n+' trees over 8 m on '+(A/1e6).toFixed(2)+' km2 of savanna: one per '+(sp>1e8?'-':sp.toFixed(1))+' m'};}};
const STATION_CHECKS=function(){const R=[],add=(name,r)=>R.push({name,ok:r.ok,detail:r.detail}),neg=(name,r)=>R.push({name:'negative: '+name,ok:!r.ok,detail:(!r.ok?'fails as it must: ':'PASSED A BROKEN INPUT: ')+r.detail});
 add('swlowlands\' oaks, sycamore and chaparral grow here (read in place)',STATION_CHK.kin(STATION_KIN,STATION_KIN_KEYS));
 add('the read-in-place trees on dry ground',STATION_CHK.dry(STATION_KIN));
 add('the savanna stays open',STATION_CHK.open(STATION_KIN));
 neg('no cork oak grown',STATION_CHK.kin(Object.assign({},STATION_KIN,{corkoak:[]}),STATION_KIN_KEYS));
 neg('a sycamore in the stock pond',STATION_CHK.dry({x:[{x:TARN.x,z:TARN.z}]}));
 {let b=[0,0];for(let z=-TERR.R+50;z<TERR.R;z+=100)for(let x=-TERR.R+50;x<TERR.R;x+=100)if(FIELD.savanna(x,z)>.9){b=[x,z];break;}
  neg('a closed wood on the savanna',STATION_CHK.open({x:Array.from({length:20000},()=>({H:20,x:b[0],z:b[1]}))}));}
 return R;};
