// ================================================================= HOST — the orange belt's views and checks (station 3)
// 99-host-take.js reads STATION_VIEWS and STATION_CHECKS / STATION_NEGATIVES (each check with a broken input that must fail).
function STATION_VIEWS(VIEWS){const G=(x,z)=>terrainH(x,z),add=(k,v,mode)=>{if(v)VIEWS[k]={v,mode:mode||'day'};},P=(d,a)=>xzDA(d,a);
 // down the slope from above the line: the black flows going ochre, the cliff's lip, the ridges and the ice below
 {const c=P(-2900,-300),t=P(1800,200);add('The dry-cold line',[c[0],G(c[0],c[1])+60,c[1],t[0],G(t[0],t[1]),t[1]]);}
 // the cliff from its foot: palagonite tuff under the black flows, tafoni, the talus
 {const c=P(800,150),t=P(470,40);add('The palagonite cliff',[c[0],G(c[0],c[1])+3,c[1],t[0],G(t[0],t[1])+45,t[1]]);}
 {const c=P(560,-700),t=P(470,-640);add('Tafoni, close',[c[0],G(c[0],c[1])+2,c[1],t[0],G(t[0],t[1])+20,t[1]]);}
 // along a gully between knife-edged ridges, its snow in the shade
 {let best=null,o={};for(let a=-2000;a<2000&&!best;a+=7){const p=P(2100,a);ridgeAt(p[0],p[1],o);if(o.t>.92&&o.k>.8)best=a;}
  if(best!=null){const c=P(1800,best),t=P(2500,best);add('The palagonite ridges',[c[0],G(c[0],c[1])+4,c[1],t[0],G(t[0],t[1])+8,t[1]]);
   const h=P(2300,best+RIDGE.sp*.5);add('A knife-edged ridge',[c[0],G(c[0],c[1])+30,c[1],h[0],G(h[0],h[1]),h[1]]);}}
 // the debris-covered ice: its lobate snout from below, its ridged and pitted surface from above
 {const T=TONGUES[0],s=P(T.d1+220,T.a+120),t=P(T.d1-100,T.a);add('The debris-covered ice',[s[0],G(s[0],s[1])+6,s[1],t[0],G(t[0],t[1])+10,t[1]]);
  const o=P(T.d0+900,T.a-250),q=P(T.d0+1500,T.a);add('On the buried ice',[o[0],G(o[0],o[1])+3,o[1],q[0],G(q[0],q[1]),q[1]]);}
 // a split stone and its endolith band (the nearest to the cliff's foot)
 {const S=itemPositions('splitstone',1);if(S.length){const c0=P(700,0);let b=S[0],bd=1e18;S.forEach(p=>{const d=(p[0]-c0[0])**2+(p[2]-c0[1])**2;if(d<bd){bd=d;b=p;}});
   add('The endolith band',[b[0]+2.2,b[1]+1.4,b[2]+1.6,b[0],b[1],b[2]]);}}
 // overview high over the belt; dawn on the cliff; night
 {const c=P(-3800,-3600),t=P(1200,500);add('Overview',[c[0],G(c[0],c[1])+1600,c[1],t[0],OB.y0-500,t[1]]);}
 {const c=P(1100,600),t=P(500,300);add('Dawn, the cliff',[c[0],G(c[0],c[1])+12,c[1],t[0],G(t[0],t[1])+40,t[1]],'dawn');}
 {const c=P(-1200,0),t=P(1500,0);add('Night, the belt',[c[0],G(c[0],c[1])+40,c[1],t[0],G(t[0],t[1]),t[1]],'night');}}
// ---- the checks
const OCHK={
 // the dry-cold line: palagonite on the ground under 8.4 km, none over 8.6 km (where it is not rock or ice)
 line(S){let up=0,upN=0,dn=0,dnN=0;S.forEach(q=>{if(q.y>8650){upN++;up+=q.p;}else if(q.y<8300&&!q.ice){dnN++;dn+=q.p;}});const a=up/Math.max(1,upN),b=dn/Math.max(1,dnN);
  return{ok:upN>50&&dnN>50&&a<.05&&b>.45,detail:'palagonite '+a.toFixed(2)+' over 8,650 m ('+upN+' samples), '+b.toFixed(2)+' under 8,300 m ('+dnN+')'};},
 // the rock: the cliff's faces are the palagonite tuff; the flows over the line are fresh tibasalt (no bed altered over 8.7 km)
 rock(face,high){const k={};face.forEach(q=>k[q.recipe]=(k[q.recipe]||0)+1);const alt=high.filter(q=>q.kind==='palagonite').length;
  return{ok:face.length>40&&(k['palagonite-tuff']||0)>=face.length*.8&&alt===0&&high.length>40,detail:face.length+' cliff samples '+JSON.stringify(k)+'; '+alt+' of '+high.length+' beds over 9 km altered'};},
 // the cliff stands: its rim over its foot by most of its height, the foot downslope
 cliff(rim,foot){const ok=rim-foot>60;return{ok,detail:'rim '+rim.toFixed(0)+' m over a foot at '+foot.toFixed(0)+' ('+(rim-foot).toFixed(0)+' m)'};},
 // the ridges: knife-edged (the crest narrow: the ground 20 m off the crest at least 6 m under it) and the gullies deep (20 m+)
 ridges(R){const ok=R.n>5&&R.sharp>=R.n*.7&&R.deep>=R.n*.7;return{ok,detail:R.n+' crests sampled: '+R.sharp+' sharp, '+R.deep+' over a gully 20 m+ deep'};},
 // the ice: both tongues on the map, under rubble (ice shows on under half of each) and standing over the ground beside it
 ice(I){const ok=I.length===2&&I.every(t=>t.n>30&&t.bare<.5&&t.over>8);return{ok,detail:I.map(t=>t.n+' samples, '+(t.bare*100).toFixed(0)+'% bare ice, '+t.over.toFixed(1)+' m over the ground beside').join('; ')};},
 air(p){const ok=Math.abs(p-.56)<.03;return{ok,detail:p.toFixed(3)+' atm at the site (map 5.1: 0.56)'};}};
const presAt=y=>ATMOS.airPressureAt(SKY.preset||{air:{pressure:1.6,thin:{y0:0,scale:8000}}},y);
const lineSamples=()=>{const S=[];for(let k=0;k<1600;k++){const x=TERR.X0+200+(k*613)%(TERR.R*2-400),z=TERR.Z0+200+(k*389)%(TERR.R*2-400);
 S.push({y:terrainH(x,z),p:FIELD.palag(x,z),ice:FIELD.ice(x,z)>.05||iceAt(x,z,{}).k>0});}return S;};
const cliffFaces=()=>{const o=[];for(let a=-3800;a<3800;a+=40)for(let d=470;d<620;d+=8){const p=xzDA(d,a),c=KRELIEF.at(CLIFF,p[0],p[1],slopeH(p[0],p[1]));if(c&&c.part==='face'){const y=terrainH(p[0],p[1]),r=STRATA.at(p[0],y,p[1]);o.push({recipe:r.recipe,kind:r.kind});}}return o;};
const highBeds=()=>{const o=[];for(let k=0;k<300;k++){const p=xzDA(-1600-(k*37)%2600,-3600+(k*97)%7200),y=terrainH(p[0],p[1]);if(y<9000)continue;for(let h=0;h<30;h+=5){const r=STRATA.at(p[0],y-h,p[1]);o.push({kind:r.kind});}}return o;};
const cliffStep=()=>{let rim=0,foot=0,n=0;for(let a=-3000;a<=3000;a+=500){let hi=-1e9,lo=1e9;for(let d=300;d<800;d+=5){const p=xzDA(d,a),y=terrainH(p[0],p[1])+OB.slope*d;hi=Math.max(hi,y);lo=Math.min(lo,y);}rim+=hi;foot+=lo;n++;}return[rim/n,foot/n];};
const ridgeSamples=()=>{let n=0,sharp=0,deep=0,o={};for(let a=-3000;a<3000&&n<40;a+=13){const p=xzDA(2400,a);ridgeAt(p[0],p[1],o);if(o.t>.04||o.k<.8)continue;n++;
  const yc=terrainH(p[0],p[1]),q1=xzDA(2400,a+20),q2=xzDA(2400,a-20),y1=terrainH(q1[0],q1[1]),y2=terrainH(q2[0],q2[1]);if(yc-y1>6&&yc-y2>6)sharp++;
  const g1=xzDA(2400,a+RIDGE.sp*.5),g2=xzDA(2400,a-RIDGE.sp*.5);if(yc-Math.min(terrainH(g1[0],g1[1]),terrainH(g2[0],g2[1]))>20)deep++;}return{n,sharp,deep};};
const iceSamples=(fld)=>TONGUES.map(T=>{let n=0,bare=0,over=0;for(let d=T.d0+300;d<T.d1-100;d+=60)for(let a=-T.w*.6;a<=T.w*.6;a+=40){const c=T.a+60*Math.sin(d*.0018+T.i*2),p=xzDA(d,c+a);if(!inMap(p[0],p[1]))continue;n++;if(fld(p[0],p[1])>.5)bare++;}
 for(let d=T.d0+500;d<T.d1-200;d+=200){const c=T.a+60*Math.sin(d*.0018+T.i*2),p=xzDA(d,c),q=xzDA(d,c+T.w*1.5);if(inMap(q[0],q[1]))over=Math.max(over,terrainH(p[0],p[1])-terrainH(q[0],q[1]));}
 return{n,bare:bare/Math.max(1,n),over};});
function STATION_CHECKS(){const R=[],add=(n,r)=>R.push(Object.assign({name:n},r));
 add('the dry-cold line: palagonite under it, none over it',OCHK.line(lineSamples()));
 add('the rock: palagonite tuff in the cliff, fresh flows over the line',OCHK.rock(cliffFaces(),highBeds()));
 const st=cliffStep();add('the palagonite cliff stands',OCHK.cliff(st[0],st[1]));
 add('the ridges: knife-edged, deep gullies',OCHK.ridges(ridgeSamples()));
 add('the debris-covered ice: two tongues under rubble',OCHK.ice(iceSamples(FIELD.ice)));
 add('the air at 8.3 km',OCHK.air(presAt(OB.y0)));
 return R;}
function STATION_NEGATIVES(){const R=[],add=(n,r)=>R.push({name:n,failed:!r.ok,detail:r.detail});
 add('palagonite over the line too',OCHK.line(lineSamples().map(q=>Object.assign({},q,{p:.8}))));
 add('the cliff in fresh basalt',OCHK.rock(cliffFaces().map(q=>Object.assign({},q,{recipe:'tibasalt'})),highBeds()));
 add('no cliff (the slope alone)',OCHK.cliff(0,0));
 add('the ridges smoothed away',OCHK.ridges({n:20,sharp:2,deep:1}));
 add('bare ice (no debris cover)',OCHK.ice(iceSamples(()=>1)));
 add('the summit\'s air on the belt',OCHK.air(presAt(25000)));
 return R;}
