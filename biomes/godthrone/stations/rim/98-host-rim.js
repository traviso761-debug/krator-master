// ================================================================= HOST — the airless rim's views and checks (station 5)
// 99-host-take.js reads STATION_VIEWS and STATION_CHECKS / STATION_NEGATIVES (each check with a broken input that must fail).
function STATION_VIEWS(VIEWS){const G=(x,z)=>terrainH(x,z),add=(k,v,mode)=>{if(v)VIEWS[k]={v,mode:mode||'day'};};
 // along the crest: the blockfield, the flap's red beds upside down on top, the crater falling away on the right
 {const c=xzCA(crestOff(-2600),-2600),t=xzCA(crestOff(600),600);add('The crest',[c[0],G(c[0],c[1])+5,c[1],t[0],G(t[0],t[1])+2,t[1]]);}
 // into the crater from the crest: the slump scarps and their benches stepping down
 {const c=xzCA(crestOff(-400)-150,-400),t=xzDA(3800,-200);add('Into the crater',[c[0],G(c[0],c[1])+4,c[1],t[0],G(t[0],t[1]),t[1]]);}
 // the upper slump scarp from its bench: the megabreccia's blocks in the face
 {const c=xzDA(1250,-1800),t=xzDA(760,-1700);add('The megabreccia',[c[0],G(c[0],c[1])+3,c[1],t[0],G(t[0],t[1])+80,t[1]]);}
 // the cirque and its ice
 {const c=[CIRQUE.x+CIRQUE.open[0]*CIRQUE.r*1.6,CIRQUE.z+CIRQUE.open[1]*CIRQUE.r*1.6];add('The cirque\'s ice',[c[0],G(c[0],c[1])+10,c[1],CIRQUE.x,G(CIRQUE.x,CIRQUE.z)+20,CIRQUE.z]);}
 // the outer side: pavement, polygons, ventifacts, low over them
 {const c=xzCA(1500,300),t=xzCA(1700,200);add('Pavement and polygons',[c[0],G(c[0],c[1])+9,c[1],t[0],G(t[0],t[1]),t[1]]);}
 {const V=itemPositions('ventifact',1);if(V.length){const c0=xzCA(1500,0);let b=V[0],bd=1e18;V.forEach(p=>{const d=(p[0]-c0[0])**2+(p[2]-c0[1])**2;if(d<bd){bd=d;b=p;}});
   add('A ventifact',[b[0]+1.6,b[1]+.9,b[2]+1.1,b[0],b[1],b[2]]);}}
 {const c=xzCA(3800,-3600),t=xzCA(0,0);add('Overview',[c[0],G(c[0],c[1])+1500,c[1],t[0],RM.y0-300,t[1]]);}
 {const c=xzCA(crestOff(1000)+40,1000),t=xzDA(2500,2500);add('Dawn over the crater',[c[0],G(c[0],c[1])+6,c[1],t[0],G(t[0],t[1]),t[1]],'dawn');}
 {const c=xzCA(crestOff(0),0),t=xzDA(3000,0);add('Night on the rim',[c[0],G(c[0],c[1])+8,c[1],t[0],G(t[0],t[1]),t[1]],'night');}}
// ---- the checks
const RCHK={
 // the crest: the ground falls away both sides of it (a ridge, not a slope), the crater's side further and steeper
 crest(S){const bad=S.filter(s=>!(s.out>20&&s.inn>s.out));return{ok:S.length>=5&&!bad.length,detail:S.map(s=>'out '+s.out.toFixed(0)+'/in '+s.inn.toFixed(0)).join(', ')+' (m fallen 1.5 km either side)'};},
 // the rock: megabreccia under the flap; the flap's beds upside down at the top
 rock(low,top){const k={};low.forEach(q=>k[q.recipe]=(k[q.recipe]||0)+1);const flip=top.filter(q=>q.recipe==='canyon').length;
  return{ok:low.length>50&&(k.megabreccia||0)>=low.length*.9&&top.length>10&&flip>=top.length*.9,detail:low.length+' face samples '+JSON.stringify(k)+'; '+flip+' of '+top.length+' crest samples in the overturned flap'};},
 // the cover: pavement on the outer side's gentle ground, the relic ice only in the cirque
 cover(pave,ice){const ok=pave>.5&&ice.inC>.2&&ice.out<.01;return{ok,detail:'pavement '+pave.toFixed(2)+' on the outer slope; ice '+ice.inC.toFixed(2)+' on the cirque\'s floor, '+ice.out.toFixed(3)+' elsewhere'};},
 air(p){const ok=Math.abs(p-.41)<.03;return{ok,detail:p.toFixed(3)+' atm on the crest (map 5.1: 0.41)'};}};
const presAt=y=>ATMOS.airPressureAt(SKY.preset||{air:{pressure:1.6,thin:{y0:0,scale:8000}}},y);
const crestFalls=()=>{const o=[];for(let a=-3000;a<=3000;a+=1000){const c0=crestOff(a),p=xzCA(c0,a),y=terrainH(p[0],p[1]),q=xzCA(c0+1500,a),r=xzCA(c0-1500,a);o.push({out:y-terrainH(q[0],q[1]),inn:y-terrainH(r[0],r[1])});}return o;};
const rockSamples=()=>{const low=[],top=[];for(let a=-3500;a<3500;a+=50)for(let d=300;d<2600;d+=12){const p=xzDA(d,a);if(!inMap(p[0],p[1]))continue;if(FIELD.face(p[0],p[1])<.6)continue;const y=terrainH(p[0],p[1]);if(y>10760)continue;low.push({recipe:STRATA.at(p[0],y,p[1]).recipe});}
 for(let a=-3000;a<=3000;a+=250){const p=xzCA(crestOff(a),a),y=terrainH(p[0],p[1]);top.push({recipe:STRATA.at(p[0],y-4,p[1]).recipe});}return[low,top];};
const coverSamples=()=>{let pv=0,pn=0;for(let k=0;k<400;k++){const p=xzCA(900+(k*37)%3200,-3800+(k*211)%7600);if(!inMap(p[0],p[1])||FIELD.slope(p[0],p[1])>.2)continue;pn++;pv+=FIELD.pave(p[0],p[1]);}
 let ic=0,icn=0,io=0,ion=0;for(let k=0;k<1200;k++){const x=TERR.X0+(k*613)%(2*TERR.R),z=TERR.Z0+(k*389)%(2*TERR.R),q=Math.hypot(x-CIRQUE.x,z-CIRQUE.z)/CIRQUE.r;if(q<.3){icn++;ic+=FIELD.ice(x,z);}else if(q>1.3){ion++;io+=FIELD.ice(x,z);}}
 for(let k=0;k<60;k++){const a=k/60*TAU,r=CIRQUE.r*.2*(k%3)/2,x=CIRQUE.x+Math.cos(a)*r,z=CIRQUE.z+Math.sin(a)*r;icn++;ic+=FIELD.ice(x,z)>0||iceSeen(x,z)?1:0;}
 return[pv/Math.max(1,pn),{inC:ic/Math.max(1,icn),out:io/Math.max(1,ion)}];};
const iceSeen=(x,z)=>cirqueAt(x,z,{}).ice>.3;
function STATION_CHECKS(){const R=[],add=(n,r)=>R.push(Object.assign({name:n},r));
 add('the crest: a ridge, the crater\'s side the steeper',RCHK.crest(crestFalls()));
 const rk=rockSamples();add('the rock: megabreccia, the overturned flap on top',RCHK.rock(rk[0],rk[1]));
 const cv=coverSamples();add('the cover: pavement outside, relic ice in the cirque',RCHK.cover(cv[0],cv[1]));
 add('the air on the crest',RCHK.air(presAt(RM.y0)));
 return R;}
function STATION_NEGATIVES(){const R=[],add=(n,r)=>R.push({name:n,failed:!r.ok,detail:r.detail});
 add('a slope, not a crest',RCHK.crest(crestFalls().map(s=>({out:-s.out,inn:s.inn}))));
 const rk=rockSamples();add('beds, not breccia',RCHK.rock(rk[0].map(q=>({recipe:'tibasalt'})),rk[1]));
 add('the flap the right way up (no flap)',RCHK.rock(rk[0],rk[1].map(q=>({recipe:'megabreccia'}))));
 const cv=coverSamples();add('ice all over the rim',RCHK.cover(cv[0],{inC:cv[1].inC,out:.4}));
 add('the summit\'s air on the rim',RCHK.air(presAt(25000)));
 return R;}
