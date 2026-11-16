// ================================================================= HOST — station 2, the dry-summer montane: its views, its checks, its still (read by src/99-host-take.js)
// Stations 3 and 4 replace this file (the same name). STATION_SKIP: station 1's own invariants this station has no feature for (the tower, the trumpet
// colonies, every species placed: it places its own, checked below). STATION_CHECKS: each with a broken input that must fail.
const STATION_SKIP=['tower-hung-with-growth','trumpets-and-glow-found','every-species-placed'];
const STATION_FRUIT=['mast'];   /* the black oaks' acorns; no yew, rowan berries are few, no trumpet colonies for pods */
const STATION_SPECIES=NHL.SPECIES.filter(S=>S.station==='montane').map(S=>S.key).concat(['whitefir','copperpine']).filter((k,i,a)=>a.indexOf(k)===i);
const STATION_VIEWS=function(add,G){const P=(s,t)=>xzOf(s,t),T=k=>NHL.TREES.filter(T=>T.sp===NHL.KEY[k]&&T.lv===2).sort((a,b)=>BIO.lodD(a.x,a.z)-BIO.lodD(b.x,b.z));
 {const c=P(2700,-400),t=P(-1200,300);add('Overview: the dry-summer montane',[c[0],G(c[0],c[1])+140,c[1],t[0],G(t[0],t[1])+20,t[1]]);}
 {const D=DOMES[0],a=2.4,cx=D.x+Math.cos(a)*(D.R+260),cz=D.z+Math.sin(a)*(D.R+260);add('A sandstone dome',[cx,G(cx,cz)+25,cz,D.x,G(D.x,D.z)-D.h*.3,D.z]);}
 {const g=T('embergiant')[0];if(g){const cx=g.x+34,cz=g.z+22;add('Ember giants in a draw',[cx,G(cx,cz)+2,cz,g.x,g.y0+g.H*.55,g.z]);}}
 {const p=T('copperpine')[3]||T('copperpine')[0];if(p){const cx=p.x-40,cz=p.z+30;add('The copper pine park',[cx,G(cx,cz)+2.2,cz,p.x,p.y0+p.H*.35,p.z]);}}
 {let best=null,bm=0;for(let i=0;i<400;i++){const x=-TERR.R*.8+(i%20)*TERR.R*.08,z=-TERR.R*.8+Math.floor(i/20)*TERR.R*.08,m=FIELD.meadow(x,z);if(m>bm){bm=m;best=[x,z];}}
  if(best){const cx=best[0]+30,cz=best[1]+30;add('A meadow of corn lilies',[cx,G(cx,cz)+2,cz,best[0],G(best[0],best[1])+.5,best[1]]);}}
 {const o=T('blackoak')[0];if(o){const cx=o.x+20,cz=o.z-16;add('Black oaks',[cx,G(cx,cz)+2,cz,o.x,o.y0+o.H*.4,o.z]);}}
 {const s=T('burnsnag')[0];if(s){const cx=s.x+30,cz=s.z+24;add('An old burn',[cx,G(cx,cz)+3,cz,s.x,G(s.x,s.z)+5,s.z]);}}
 if(STREAM.falls.length){const f=STREAM.falls[0],i=Math.min(STREAM.P.length-1,f+10),p=STREAM.P[i],q=STREAM.P[Math.max(0,f-1)];add('The creek\'s fall',[p[0],STREAM.level[i]+4,p[1],q[0],STREAM.level[Math.max(0,f-3)]+2,q[1]]);}
 {const a=1.1,cx=TARN.x+Math.cos(a)*(TARN.r+30),cz=TARN.z+Math.sin(a)*(TARN.r+30);add('The meadow pond',[cx,G(cx,cz)+4,cz,TARN.x,TARN.level+1,TARN.z]);}
 {const c=P(-600,700),t=P(1200,-300);add('Dawn on the dry side',[c[0],G(c[0],c[1])+6,c[1],t[0],G(t[0],t[1])+20,t[1]],'dawn');}};
const STATION_CHK={
 // the station's own species stand here
 placed(trees,keys){const miss=keys.filter(k=>!trees.some(T=>T.sp===NHL.KEY[k]));return{ok:!miss.length,detail:miss.length?'never placed: '+miss.join(', '):keys.map(k=>k+':'+trees.filter(T=>T.sp===NHL.KEY[k]).length).join(' ')};},
 // a park, not a closed wood: the open slopes keep their floor (mean tree spacing over the dry, sunny ground at least 14 m)
 open(trees){let n=0,A=0;for(let z=-TERR.R+100;z<TERR.R;z+=200)for(let x=-TERR.R+100;x<TERR.R;x+=200)if(FIELD.open(x,z)>.6&&FIELD.meadow(x,z)<.2&&FIELD.dome(x,z)<.2)A+=200*200;
  const big=trees.filter(T=>T.H>12&&FIELD.open(T.x,T.z)>.6&&FIELD.meadow(T.x,T.z)<.2&&FIELD.dome(T.x,T.z)<.2).length,sp=A&&big?Math.sqrt(A/big):1e9;n=sp;
  return{ok:sp>=14,detail:big+' trees over 12 m on '+(A/1e6).toFixed(2)+' km2 of open sunny slope: one per '+(n>1e8?'-':n.toFixed(1))+' m'};},
 // the meadows stay open: no tree over 8 m where the meadow is full
 meadow(trees){const bad=trees.filter(T=>T.H>8&&FIELD.meadow(T.x,T.z)>.6);return{ok:!bad.length,detail:bad.length?bad.length+' tall trees in the meadows (first '+NHL.SPECIES[bad[0].sp].key+')':'the meadows open'};},
 corn(n){return{ok:n>=50,detail:n+' corn lilies drawn'};}};
const cornN=()=>{let n=0;BIO.baked.forEach(o=>{if(o.isInstancedMesh&&o.name==='biome:cornlily')n+=o.count;});return n;};
const STATION_CHECKS=function(){const R=[],add=(name,r)=>R.push({name,ok:r.ok,detail:r.detail}),neg=(name,r)=>R.push({name:'negative: '+name,ok:!r.ok,detail:(!r.ok?'fails as it must: ':'PASSED A BROKEN INPUT: ')+r.detail});
 add('the station\'s species are placed',STATION_CHK.placed(NHL.TREES,STATION_SPECIES));
 add('a park, not a closed wood',STATION_CHK.open(NHL.TREES));
 add('the meadows stay open',STATION_CHK.meadow(NHL.TREES));
 add('corn lilies in the meadows',STATION_CHK.corn(cornN()));
 neg('no ember giant placed',STATION_CHK.placed(NHL.TREES.filter(T=>T.sp!==NHL.KEY.embergiant),STATION_SPECIES));
 {const T0=NHL.TREES.find(T=>FIELD.open(T.x,T.z)>.6&&FIELD.meadow(T.x,T.z)<.2&&FIELD.dome(T.x,T.z)<.2)||{x:0,z:0};
  neg('a closed wood on the open slopes',STATION_CHK.open(NHL.TREES.concat(Array.from({length:40000},(_,i)=>({H:30,x:T0.x,z:T0.z})))));}
 {let best=[0,0],bm=-1;for(let z=-TERR.R+50;z<TERR.R;z+=50)for(let x=-TERR.R+50;x<TERR.R;x+=50){const m=FIELD.meadow(x,z);if(m>bm){bm=m;best=[x,z];}}
  neg('a white fir in the middle of a meadow',STATION_CHK.meadow([{H:30,sp:NHL.KEY.whitefir,x:best[0],z:best[1]}]));}
 neg('no corn lilies',STATION_CHK.corn(0));
 return R;};
