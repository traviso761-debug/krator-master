// ================================================================= HOST — station 6, the Tiguantin cloud-terraces: its views, its checks (read by src/99-host-take.js)
// Replaces station 2's file of the same name. STATION_CHECKS: each with a broken input that must fail. core/ruins' own check (every stone of the terraces
// and of the First Monastery's cells stands on the ground or on stone, every fallen stone lies on its lowest points) runs in every verify (KRUINS.watch, 88t).
const STATION_SKIP=['tower-hung-with-growth','trumpets-and-glow-found','every-species-placed','night-raises-the-glow'];   /* no trumpets, no bulbs: the cloud forest has no glow */
const STATION_FRUIT=['berry','mast'];   /* the rowans' berries on the treads, the gnarled oaks' acorns on the spur */
const STATION_SPECIES=['shadowhemlock','silverfir','mossmaple','foglaurel','gnarloak','rowan'];
const STATION_EXPORT_BOX=(function(){const c=TIG.xzOf(0,TIG.TS(0));return[Math.round(c[0]-150),Math.round(c[1]-150),Math.round(c[0]+150),Math.round(c[1]+150)];})();   /* the gully at the terraces: the stream, a cistern */
const STATION_VIEWS=function(add,G){const T=TIG,P=(s,t)=>T.xzOf(s,t),K0=SITE.knolls[0];
 // the plan's framing: from the spur's gully side, looking SSW across the gully to the half-exhumed terraces, the red line, the cliff, the sheet beyond
 {const c=P(-112,T.TS(-112)+96),t=P(30,T.TS(30)-60);add('Across the gully to the terraces',[c[0],G(c[0],c[1])+4,c[1],t[0],T.C(30)-5,t[1]]);}
 {const c=P(-60,T.TS(-60)-28),t=P(30,T.TS(30)-T.G);add('The terraces under the red line',[c[0],G(c[0],c[1])+1.7,c[1],t[0],T.C(30)+3,t[1]]);}
 {const c=P(-10,T.TS(-10)-T.G+3),t=P(60,T.TS(60)-T.G-2);add('The column at the cliff\'s foot',[c[0],G(c[0],c[1])+1.7,c[1],t[0],T.C(60)+8,t[1]]);}
 {const S=T.SKY,a=Math.atan2(S.z-T.V.z,S.x-T.V.x),cx=S.x+Math.cos(a)*30,cz=S.z+Math.sin(a)*30;add('The skylight and the winches',[cx,G(cx,cz)+5,cz,S.x,G(S.x,S.z)-6,S.z]);}
 {const S=T.SKY;add('Down the skylight',[S.x+3,G(S.x,S.z)+14,S.z+2,S.x-1,T.V.floor+3,S.z-1]);}
 {const S=T.SKY,V=T.V,dx=V.x-S.x,dz=V.z-S.z,l=Math.hypot(dx,dz)||1,cx=S.x+dx/l*46,cz=S.z+dz/l*46,y=STATION_FLOOR(cx,cz);add('The archive vault (cav_monks_archive)',[cx,y+1.8,cz,S.x,T.V.floor+8,S.z]);}
 {const c=P(420,-420),t=P(260,-300);add('The cloud forest on the sheet',[c[0],G(c[0],c[1])+2,c[1],t[0],G(t[0],t[1])+8,t[1]]);}
 {const c=P(-1500,600),t=P(150,-60);add('Overview: the shoulder and the gully',[c[0],G(c[0],c[1])+260,c[1],t[0],G(t[0],t[1]),t[1]]);}
 {const c=P(-112,T.TS(-112)+96),t=P(260,-120);add('Dawn: the fog belt from the spur',[c[0],G(c[0],c[1])+6,c[1],t[0],G(t[0],t[1])+10,t[1]],'dawn');}
 if(STREAM.falls.length){const f=STREAM.falls[0],i=Math.min(STREAM.P.length-1,f+10),p=STREAM.P[i],q=STREAM.P[Math.max(0,f-1)];add('The stream\'s fall down the shoulder',[p[0],STREAM.level[i]+4,p[1],q[0],STREAM.level[Math.max(0,f-3)]+2,q[1]]);}};
const STATION_CHK={
 placed(trees,keys){const miss=keys.filter(k=>!trees.some(T=>T.sp===NHL.KEY[k]));return{ok:!miss.length,detail:miss.length?'never placed: '+miss.join(', '):keys.map(k=>k+':'+trees.filter(T=>T.sp===NHL.KEY[k]).length).join(' ')};},
 // the column: the gully's foot is the paleosol's base, carbonate-shelf under it, the ignimbrite over it, the tibasalt at the sheet's top (KSTRATA's CPU twin)
 column(S,dz){if(!S||!S.at)return{ok:false,detail:'no KSTRATA stack on the page'};const bad=[];let n=0;
  for(let s=-300;s<=340;s+=80){const p=TIG.xzOf(s,TIG.TS(s)-TIG.G),g=terrainH(p[0],p[1])+(dz||0),r=y=>S.at(p[0],y,p[1]).recipe;n++;
   const got=[r(g-1.2),r(g+.7),r(g+8),r(TIG.ramp(s)+TIG.sheet-3)];if(got.join()!=='carbonate-shelf,tig-paleosol,tig-ignimbrite,tibasalt')bad.push(s+': '+got.join('/'));}
  return{ok:!bad.length,detail:bad.length?bad.length+' of '+n+' sections off the column: '+bad.slice(0,2).join('; '):n+' sections: carbonate-shelf under the red paleosol at the cliff\'s foot, welded ignimbrite over it, tibasalt at the top'};},
 // the terraces: the SW flank in steps (at least three treads, each flat to 0.4 m over 4 m, risers of 2.5-3.5 m) at every section
 steps(h){const bad=[];let n=0;for(let s=-260;s<=260;s+=65){n++;const L=[];let prev=null,run=0;
   for(let d=30;d<=TIG.G-1;d+=.5){const p=TIG.xzOf(s,TIG.TS(s)-d),y=h(p[0],p[1]);if(prev!=null&&Math.abs(y-prev)<.05){run+=.5;}else{if(run>=4)L.push(prev);run=0;}prev=y;}if(run>=4)L.push(prev);
   const lv=L.filter((v,i)=>!i||Math.abs(v-L[i-1])>1);let ok=lv.length>=3;for(let i=1;i<lv.length;i++){const r=lv[i]-lv[i-1];if(r<2.5||r>3.5)ok=false;}if(!ok)bad.push(s+' ('+lv.length+' treads)');}
  return{ok:!bad.length,detail:bad.length?'unstepped sections: '+bad.join(', '):n+' sections, each with three or more treads 3 m apart'};},
 // the vault entombed: rock over it everywhere but the skylight (KCAVERN), the skylight open down to the cone
 tomb(C,sky){if(!C)return{ok:false,detail:'no cavern'};const leaks=C.skyLeaks?C.skyLeaks(4).filter(p=>Math.hypot(p[0]-sky.x,p[2]-sky.z)>sky.r+sky.rim+2):[];
  let open=true;const g=terrainH(sky.x,sky.z);for(let y=g-2;y>TIG.V.floor+8;y-=1)if(C.sdf(sky.x,y,sky.z)<=0)open=false;
  return{ok:!leaks.length&&open&&!!C.holeAt(sky.x,sky.z),detail:(leaks.length?leaks.length+' points of the voids open to the sky away from the skylight; ':'no void open to the sky but the skylight; ')+(open?'the skylight open from the lip to the cone':'the skylight is shut')};},
 // nothing grows on the skylight's lip, in the winch camp or on the cliffs
 clear(trees){const bad=trees.filter(T=>T.lv>0&&(FIELD.keep(T.x,T.z)>.5||FIELD.cliff(T.x,T.z)>.6));return{ok:!bad.length,detail:bad.length?bad.length+' trees on the lip or the cliffs (first at '+[bad[0].x|0,bad[0].z|0]+')':'the lip, the camp and the cliffs clear'};},
 // the Throne's cloud trees, read in place
 kin(K){const n=k=>(K&&K[k]?K[k].length:0);return{ok:n('elfin')>=50&&n('treefern')>=30,detail:'elfin '+n('elfin')+', tree ferns '+n('treefern')+', veil trees '+n('veil')};}};
const STATION_CHECKS=function(){const R=[],add=(name,r)=>R.push({name,ok:r.ok,detail:r.detail}),neg=(name,r)=>R.push({name:'negative: '+name,ok:!r.ok,detail:(!r.ok?'fails as it must: ':'PASSED A BROKEN INPUT: ')+r.detail});
 const S=TIGX.S,K=typeof STATION_KIN!=='undefined'?STATION_KIN:null;
 add('the cloud forest\'s species are placed',STATION_CHK.placed(NHL.TREES,STATION_SPECIES));
 add('the gully\'s foot is the column\'s red paleosol line (KSTRATA)',STATION_CHK.column(S,0));
 add('the terraces step down the SW flank',STATION_CHK.steps(terrainH));
 add('the archive vault is entombed but for its skylight (KCAVERN)',STATION_CHK.tomb(TIGX.C,TIG.SKY));
 add('nothing grows on the skylight\'s lip or the cliffs',STATION_CHK.clear(NHL.TREES));
 add('the Throne\'s cloud trees grow here (read in place)',STATION_CHK.kin(K));
 neg('no fog laurel placed',STATION_CHK.placed(NHL.TREES.filter(T=>T.sp!==NHL.KEY.foglaurel),STATION_SPECIES));
 neg('the contact read 6 m high',STATION_CHK.column(S,6));
 neg('the flank as it was before the terraces',STATION_CHK.steps((x,z)=>{const s=TIG.sOf(x,z),dv=TIG.tOf(x,z)-TIG.TS(s);return TIG.ramp(s)-TIG.vd*Math.exp(-(dv*dv)/(TIG.wv*TIG.wv));}));
 neg('the skylight looked for 40 m off',STATION_CHK.tomb(TIGX.C,{x:TIG.SKY.x+40,z:TIG.SKY.z,r:TIG.SKY.r,rim:TIG.SKY.rim}));
 neg('a hemlock on the skylight\'s lip',STATION_CHK.clear([{x:TIG.SKY.x+TIG.SKY.r+4,z:TIG.SKY.z,lv:2}]));
 neg('no elfin trees',STATION_CHK.kin({treefern:K&&K.treefern}));
 return R;};
