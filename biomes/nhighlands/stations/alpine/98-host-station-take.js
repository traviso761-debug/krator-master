// ================================================================= HOST — station 4, the alpine: its views, its checks (read by src/99-host-take.js)
// Replaces station 2's file of the same name.
const STATION_SKIP=['tower-hung-with-growth','trumpets-and-glow-found','every-species-placed','night-raises-the-glow'];   /* no glow above the tree line */
const STATION_FRUIT=[];   /* no catalog fruit up here (the whitebark's nuts are no catalog piece: the fruit check's list names them) */
const STATION_SPECIES=['whitebark','foxtail','windspruce'];
const STATION_VIEWS=function(add,G){const P=(s,t)=>xzOf(s,t),T=k=>NHL.TREES.filter(T=>T.sp===NHL.KEY[k]&&T.lv===2).sort((a,b)=>BIO.lodD(a.x,a.z)-BIO.lodD(b.x,b.z));
 {const c=P(-2200,-500),t=P(2000,100);add('Overview: up to the cirque',[c[0],G(c[0],c[1])+90,c[1],t[0],G(t[0],t[1])+40,t[1]]);}
 {const a=Math.atan2(TARN.z,TARN.x)+Math.PI,cx=TARN.x+Math.cos(a)*(TARN.r+90),cz=TARN.z+Math.sin(a)*(TARN.r+90);add('The cirque tarn',[cx,G(cx,cz)+8,cz,TARN.x+(TARN.x-cx)*.8,TARN.level+40,TARN.z+(TARN.z-cz)*.8]);}
 {const w=T('whitebark')[0];if(w){const cx=w.x+18,cz=w.z+12;add('Whitebark pines at the tree line',[cx,G(cx,cz)+2,cz,w.x,w.y0+w.H*.5,w.z]);}}
 {const f=T('foxtail')[0];if(f){const cx=f.x+10,cz=f.z-8;add('The old foxtail pines',[cx,G(cx,cz)+1.6,cz,f.x,f.y0+f.H*.45,f.z]);}}
 {let b=null,bt=0;for(let z=-TERR.R+60;z<TERR.R;z+=120)for(let x=-TERR.R+60;x<TERR.R;x+=120){const v=FIELD.talus(x,z);if(v>bt&&BIO.lodD(x,z)<900){bt=v;b=[x,z];}}
  if(b){const cx=b[0]-40,cz=b[1]-40;add('Talus under the step',[cx,G(cx,cz)+4,cz,b[0],G(b[0],b[1])+3,b[1]]);}}
 {let b=null,bs=0;for(let z=-TERR.R+60;z<TERR.R;z+=120)for(let x=-TERR.R+60;x<TERR.R;x+=120){const v=FIELD.fell(x,z);if(v>bs&&BIO.lodD(x,z)<900){bs=v;b=[x,z];}}
  if(b){const cx=b[0]+30,cz=b[1]+30;add('Fell-field',[cx,G(cx,cz)+2.5,cz,b[0],G(b[0],b[1]),b[1]]);}}
 if(STREAM.falls.length){const f=STREAM.falls[STREAM.falls.length-1],i=Math.min(STREAM.P.length-1,f+10),p=STREAM.P[i],q=STREAM.P[Math.max(0,f-1)];add('The outflow\'s fall',[p[0],STREAM.level[i]+4,p[1],q[0],STREAM.level[Math.max(0,f-3)]+2,q[1]]);}
 {const c=P(1200,-300),t=P(2600,200);add('Dawn under the headwall',[c[0],G(c[0],c[1])+5,c[1],t[0],G(t[0],t[1])+60,t[1]],'dawn');}};
const STATION_CHK={
 placed(trees,keys){const miss=keys.filter(k=>!trees.some(T=>T.sp===NHL.KEY[k]));return{ok:!miss.length,detail:miss.length?'never placed: '+miss.join(', '):keys.map(k=>k+':'+trees.filter(T=>T.sp===NHL.KEY[k]).length).join(' ')};},
 // a tree line, not a forest to the top: nothing over 4 m where the cold is past .95 (the fell-field)
 line(trees){const bad=trees.filter(T=>T.H>4&&FIELD.cold(T.x,T.z)>.95);return{ok:!bad.length,detail:bad.length?bad.length+' trees over 4 m above the tree line (first '+NHL.SPECIES[bad[0].sp].key+')':'nothing over 4 m above the line'};},
 // the cirque: the tarn sits under a headwall at least 40 m above its water within 400 m upslope
 cirque(){let hi=-1e9;for(let a=0;a<Math.PI*2;a+=.2)for(let r=TARN.r+50;r<TARN.r+400;r+=50)hi=Math.max(hi,terrainH(TARN.x+Math.cos(a)*r,TARN.z+Math.sin(a)*r));
  return{ok:hi-TARN.level>=40,detail:'the ground rises '+(hi-TARN.level).toFixed(0)+' m over the tarn within 400 m'};}};
const STATION_CHECKS=function(){const R=[],add=(name,r)=>R.push({name,ok:r.ok,detail:r.detail}),neg=(name,r)=>R.push({name:'negative: '+name,ok:!r.ok,detail:(!r.ok?'fails as it must: ':'PASSED A BROKEN INPUT: ')+r.detail});
 add('the tree line\'s species are placed',STATION_CHK.placed(NHL.TREES,STATION_SPECIES));
 add('a tree line (nothing tall on the fell-field)',STATION_CHK.line(NHL.TREES));
 add('the tarn sits in a cirque',STATION_CHK.cirque());
 neg('no foxtail pine placed',STATION_CHK.placed(NHL.TREES.filter(T=>T.sp!==NHL.KEY.foxtail),STATION_SPECIES));
 {let b=[0,0],bc=0;for(let z=-TERR.R+60;z<TERR.R;z+=120)for(let x=-TERR.R+60;x<TERR.R;x+=120){const c=FIELD.cold(x,z);if(c>bc){bc=c;b=[x,z];}}
  neg('a 20 m fir on the summit',STATION_CHK.line([{H:20,sp:NHL.KEY.frostfir,x:b[0],z:b[1]}]));}
 return R;};
