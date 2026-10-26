// ================================================================= HOST — the steppe fringe: the views, handed to core/host
// The inspector's words and the checks are the Bowl's (98-host-checks.js: no lake and no water in the wadi here); this station adds
// its own: the rare three and the alien three are drawn and tagged, and the sun-dials face the sun.
const gh=(x,z,dy)=>Math.max(terrainH(x,z),waterH(x,z))+(dy||0);
const look=(cx,cz,dyc,tx,tz,dyt)=>[cx,gh(cx,cz,dyc),cz,tx,gh(tx,tz,dyt),tz];
function nearTree(key,x,z,minH){const sp=SEDESERT.SPECIES.indexOf(SEDESERT.byKey[key]);return SEDESERT.nearestTree(sp,x,z,minH)||{x,z,y0:gh(x,z),H:6,crownR:4};}
function atTree(T,d,az,dy){const cx=T.x+Math.cos(az)*d,cz=T.z+Math.sin(az)*d;return[cx,Math.max(gh(cx,cz,1.8),T.y0+(dy==null?T.H*.45:dy)),cz,T.x,T.y0+T.H*.55,T.z];}
const K0=KOPJES[0],F0=FAIRY[0],TOR=ROCK.filter(B=>B.kind==='balanced')[0]||ROCK[0];
const VIEWS={
 'The steppe after the rains':look(200,700,1.8,1400,200,4),
 'Fairy circles':[F0.x+60,gh(F0.x+60,F0.z+80,26),F0.z+80,F0.x-40,gh(F0.x-40,F0.z-40),F0.z-40],
 'A kopje and its tors':look(K0.x+K0.r*1.6,K0.z+K0.r*.9,3,K0.x,K0.z,K0.h*.8),
 'A balanced tor':[TOR.x+TOR.R*3.2,TOR.y0+(TOR.top-TOR.y0)*.4,TOR.z+TOR.R*2.4,TOR.x,TOR.y0+(TOR.top-TOR.y0)*.6,TOR.z],
 'Honeycomb in the granite':[TOR.x+TOR.R*1.6,Math.max(gh(TOR.x+TOR.R*1.6,TOR.z+TOR.R*1.2,1.7),TOR.y0+1.5),TOR.z+TOR.R*1.2,TOR.x,TOR.y0+(TOR.top-TOR.y0)*.35,TOR.z],
 'The pan':look(PAN.x+PAN.r*1.3,PAN.z+PAN.r*.6,3,PAN.x,PAN.z,0),
 'Old twoleaf on the pavement':look(-2050,60,2.4,-2150,-40,0),
 'Umbrella thorns along the wadi':look(CHAN[0].pts[150][0]+60,CHAN[0].pts[150][1]+50,2.2,CHAN[0].pts[130][0],CHAN[0].pts[130][1],4),
 'Steppe dragons':atTree(nearTree('dragon',0,0),18,.9),
 'Frankincense and myrrh':atTree(nearTree('myrrh',-300,300),7,1.6,1.4),
 'Whistle reeds at the pan':look(PAN.x-PAN.r*.9,PAN.z+PAN.r*.75,1.8,PAN.x-PAN.r*.4,PAN.z+PAN.r*.3,1),
 'The desert\'s edge':look(-1700,-1500,8,EDGE.x,EDGE.z,25),
 'From afar':[2900,H0+420,2900,-300,H0,-300],
};
// the sun-dials: a getter, so the view finds a drift of them where the build put it (the first disc's place)
Object.defineProperty(VIEWS,'Sun-dials',{enumerable:true,get(){const M=scene.getObjectByName('biome:dialdisc');if(!M)return look(-200,1500,1.6,100,1300,1);
 const m=new THREE.Matrix4();M.getMatrixAt(Math.floor(M.count/2),m);const e=m.elements,S=BIO.SUN.value||new THREE.Vector3(0,1,0);
 return[e[12]+S.x*9,gh(e[12]+S.x*9,e[14]+S.z*9,1.4),e[14]+S.z*9,e[12],e[13],e[14]];}});
const RARE={twoleaf:15,whistle:100,lantern:60};
function rareCheck(N,dials){const low=Object.keys(RARE).filter(k=>!((N[k]||0)>=RARE[k]));const st=(window._biome||{}).steppe||{};
 const ok=!low.length&&(st.rockfig||0)>=8&&(st.pebbles||0)>=50&&(dials||0)>=200;
 return{ok,detail:Object.keys(RARE).map(k=>k+' '+(N[k]||0)).join(', ')+', rock figs '+(st.rockfig||0)+', pebble colonies '+(st.pebbles||0)+', sun-dials '+(dials||0)+(low.length?'; TOO FEW: '+low.join(', '):'')};}
// the sun-dials face the sun: the mean angle between a disc's face and the sun, by day (the disc's +z)
function dialCheck(M){if(!M)return{ok:false,detail:'no sun-dials'};const S=BIO.SUN.value;if(!S||S.y<.1)return{ok:true,detail:'the sun is down: the dials fold'};
 const m=new THREE.Matrix4(),q=new THREE.Quaternion(),p=new THREE.Vector3(),s=new THREE.Vector3(),f=new THREE.Vector3();let sum=0,n=Math.min(M.count,300);
 for(let i=0;i<n;i++){M.getMatrixAt(i,m);m.decompose(p,q,s);f.set(0,0,1).applyQuaternion(q);sum+=Math.acos(clamp(f.dot(S),-1,1));}const deg=sum/n*57.3;
 return{ok:deg<30,detail:'mean '+deg.toFixed(1)+' degrees between a disc\'s face and the sun ('+n+' dials)'};}
const dialMesh=()=>scene.getObjectByName('biome:dialdisc');
KHOST.on(skyView,'view');
KHOST.take({build:'sedesert-steppe',title:'Krator biome — the steppe fringe (the eastern desert, station 3)',
 hint:'The steppe fringe: bunchgrass, umbrella thorns and steppe dragons, kopjes with balanced tors and honeycomb faces, fairy circles, a seasonal pan; old twoleafs, rock figs, pebble plants; sun-dials, whistle reeds, drift lanterns',
 scene,camera,renderer,ground:terrainH,clear:1.8,registry:REG,views:VIEWS,ticks:TICKS,
 clock:{hour:SKY_HOUR0},draw:(s,c,dt)=>HEAT.render(dt),
 clampCam(cp){const g=terrainH(cp.x,cp.z)+1.6;if(cp.y<g)cp.y=g;},
 inspect:describe,stats:()=>'inst '+window._instances+(HEAT.active?'\nheat '+HEAT.U.uK.value.toFixed(2):''),
 layers:{'flora and fauna':{match:o=>!!(o.userData&&o.userData.biome)},'rock and far country':{match:o=>!!(o.userData&&o.userData.host)},'sky':{objects:()=>[SKY.mesh]}},
 exporters:{biome:()=>BIO.export()},
 minimap:{title:'The steppe fringe'},
 budget:BUDGET,types:()=>BIO.stats,
 api:{hostChecks:()=>hostChecks().concat([Object.assign({name:'the rare and the alien plants drawn'},rareCheck(itemCounts(),dialMesh()?dialMesh().count:0)),Object.assign({name:'the sun-dials face the sun'},dialCheck(dialMesh()))]),
 hostNegatives:()=>hostNegatives().concat([{name:'no twoleafs',...(r=>({failed:!r.ok,detail:r.detail}))(rareCheck(Object.assign(itemCounts(),{twoleaf:0}),dialMesh()?dialMesh().count:0))},
  {name:'the sun-dials turned away from the sun',...(r=>({failed:!r.ok,detail:r.detail}))((()=>{const M=dialMesh();if(!M)return{ok:true,detail:''};const S=BIO.SUN.value;if(!S)return{ok:true,detail:''};
   const keep=BIO.SUN.value.clone();BIO.SUN.value.set(-S.x,S.y,-S.z);const r=(()=>{const m=new THREE.Matrix4(),q=new THREE.Quaternion(),p=new THREE.Vector3(),s=new THREE.Vector3(),f=new THREE.Vector3();let sum=0,n=Math.min(M.count,300);
    for(let i=0;i<n;i++){M.getMatrixAt(i,m);m.decompose(p,q,s);f.set(0,0,1).applyQuaternion(q);sum+=Math.acos(clamp(f.dot(BIO.SUN.value),-1,1));}return{ok:sum/n*57.3<30,detail:'mean '+(sum/n*57.3).toFixed(1)+' degrees against a sun moved round'};})();
   BIO.SUN.value.copy(keep);return S.y<.1?{ok:false,detail:'the sun is down'}:r;})())}]),
 get totals(){const t=BIO.totals();return {tris:t.tris,inst:t.inst,meshes:t.meshes,registered:REG.length,types:Object.keys(BIO.stats).length};},
 biome:()=>window._biome}});
