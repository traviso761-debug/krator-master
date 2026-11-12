// ================================================================= LOJ TWENNY: THE LIFE (the clock, the sim, the people, the count wall)
// [web] The world clock is core/clock's day (a world minute every 3 real seconds: KCLOCK.DAY_SECONDS / 1440 motion seconds a
// minute). The hold's sim is declared from the plan (40-lt-sim.js), the branch shuttle on it (42-lt-ride.js, its cars walk
// frames), and SIM steps once a world minute (catching up after a jump of the clock). The people are instanced figures at
// SIM.pose, coloured by their work (the bedsmen amber, the miners rust, the Fixers green, the watch pale, the elders grey,
// children small), hidden indoors; the porters carry a crate. THE COUNT WALL in the loj hall is painted from LTS.countWall():
// the hold's stocks in the loj's columns, and the hands raised (the shadows counted) while the Big Meeting sits.
const LTCLOCK=KCLOCK.make({hour:(()=>{const m=/[?&]hour=([\d.]+)/.exec(location.search);return m?+m[1]:8.4;})(),running:true,scale:1});
const LT_SPM=KCLOCK.DAY_SECONDS/1440;
const LT_LIFE={L:null,minute:null,snap0:null,figs:null,ids:[]};
LTS.declare(LTCLOCK);
LT_LIFE.L=LTR.declare({cars:KratorVehicles,secPerMinute:LT_SPM,at:LTCLOCK.t});
LTR.walk(KWALK,LT_LIFE.L);
ltTrainBuild(LT_LIFE.L);
LT_LIFE.step=function(){const m=SIM.minute();if(LT_LIFE.minute==null)LT_LIFE.minute=m-1;let n=0;
 while(LT_LIFE.minute<m&&n<240){LT_LIFE.minute++;SIM.step();n++;if(!LT_LIFE.snap0)LT_LIFE.snap0=SIM.ledgerSnap();}if(LT_LIFE.minute<m)LT_LIFE.minute=m;};
LT_LIFE.tick=function(t){LT_LIFE.step();LTR.doors(LT_LIFE.L,t,KWALK);KWALKFRAME.at(KWALK,t);};
/* the world run fast (the verify): minute by minute, the motion clock with it */
LT_LIFE.run=function(minutes){const C=LTCLOCK;for(let i=0;i<minutes;i++){C.t+=LT_SPM;const m=C.day*1440+Math.round(C.hour*60)+1;C.day=Math.floor(m/1440);C.hour=(m%1440)/60+1e-7;LT_LIFE.tick(C.t);}};
/* ---------------------------------------------------------------- the people */
(function(){const A=SIM.all('actor').filter(a=>!a.driven||a.cls==='cart');LT_LIFE.ids=A.map(a=>a.id).concat(SIM.all('role').length?[]:[]);
 const N=LT_LIFE.ids.length+16,col={bedsman:0xd8a050,miner:0xb4552e,fixer:0x4fb06a,fanman:0xc8a070,watch:0xd8d8d0,stoord:0xc8783e,trader:0x8a7ac0,keeper:0x6a6a7a,child:0xe0c890,elder:0x8a8680,cart:0x7a6448,porter:0xa06040};
 const g=new THREE.CylinderGeometry(.2,.24,1.52,8).translate(0,.76,0);
 LT_LIFE.figs=new THREE.InstancedMesh(g,new THREE.MeshStandardMaterial({roughness:.8}),N);LT_LIFE.figs.name='the people of Loj Twenny (SIM.pose)';LT_LIFE.figs.frustumCulled=false;
 const c=new THREE.Color();for(let i=0;i<N;i++){const a=SIM.R.actor[LT_LIFE.ids[i]];LT_LIFE.figs.setColorAt(i,c.set(a&&col[a.role]!=null?col[a.role]:0xa06040));}
 LT_LIFE.N=N;scene.add(LT_LIFE.figs);})();
const ltM=new THREE.Matrix4(),ltQ=new THREE.Quaternion(),ltE=new THREE.Euler(),ltV=new THREE.Vector3(),ltS1=new THREE.Vector3(1,1,1),ltSc=new THREE.Vector3(.7,.7,.7);
LT_LIFE.draw=function(t){let i=0;const live=SIM.all('actor').filter(a=>a.present!==false);
 for(const a of live){if(i>=LT_LIFE.N)break;const p=SIM.pose(a,t);if(!p||p.hidden){continue;}
  ltQ.setFromEuler(ltE.set(0,p.h||0,0));ltM.compose(ltV.set(p.x,p.y,p.z),ltQ,a.role==='child'?ltSc:ltS1);LT_LIFE.figs.setMatrixAt(i,ltM);
  if(a._ci!==i){a._ci=i;LT_LIFE.figs.setColorAt(i,new THREE.Color({bedsman:0xd8a050,miner:0xb4552e,fixer:0x4fb06a,fanman:0xc8a070,watch:0xd8d8d0,stoord:0xc8783e,trader:0x8a7ac0,keeper:0x6a6a7a,child:0xe0c890,elder:0x8a8680,cart:0x7a6448,porter:0xa06040}[a.role]||0xa06040));LT_LIFE.figs.instanceColor.needsUpdate=true;}
  i++;}
 LT_LIFE.shown=i;for(;i<LT_LIFE.N;i++){ltM.makeScale(0,0,0);LT_LIFE.figs.setMatrixAt(i,ltM);}LT_LIFE.figs.instanceMatrix.needsUpdate=true;};
/* ---------------------------------------------------------------- the count wall: painted from the hold's stocks */
LT_LIFE.wall=(function(){const s=SIM.R.place['lt.loj-hall']&&LT.plan().byId['lt.loj-hall'];if(!s)return null;
 const c=document.createElement('canvas');c.width=1024;c.height=420;const tx=new THREE.CanvasTexture(c);tx.encoding=THREE.sRGBEncoding;
 const m=new THREE.Mesh(new THREE.PlaneGeometry(10.4,4.2),new THREE.MeshBasicMaterial({map:tx,transparent:true}));m.name='the count wall: the hold\'s stocks';m.userData.deck=0;
 /* in the hall's frame: the back wall at local z -16.62, centred, 0.5 to 4.7 m up */
 const cs=Math.cos(s.ry),sn=Math.sin(s.ry),lz=-16.38;m.position.set(s.x+lz*sn,s.y+2.65,s.z+lz*cs);m.rotation.y=s.ry;scene.add(m);
 const paint=()=>{const g=c.getContext('2d'),W=LTS.countWall();g.clearRect(0,0,1024,420);g.fillStyle='rgba(40,34,30,.86)';g.font='bold 34px monospace';
  const rows=[['FUNGUS',W.fungus],['GRAIN',W.grain],['WAX',W.wax],['ORE',W.ore],['PLATE',W.plate],['ICE',W.ice]];
  g.fillText('HANDS '+W.hands+'   ON SHIFT '+W.people+(W.happy!=null?'   HEART '+W.happy+' '+String(W.stage).toUpperCase():''),40,46);
  rows.forEach(([k,v],i)=>{const x=40+(i%3)*330,y=112+Math.floor(i/3)*120;g.fillText(k,x,y);g.fillText(String(v),x,y+46);
   /* the tallies in fives under each, a stroke a ten */
   const n=Math.min(40,Math.round(v/10));for(let j=0;j<n;j++){const tx0=x+(j%20)*12+(j%5===4?-48:0);if(j%5===4){g.fillRect(x+Math.floor(j/5)%4*60-4,y+62+Math.floor(j/20)*14,58,3);}else g.fillRect(tx0,y+52+Math.floor(j/20)*14,3,18);}});
  tx.needsUpdate=true;LT_LIFE.wallRead=W;};
 paint();return {mesh:m,paint};})();
