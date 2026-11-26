// ---------- Galaxy class: the other ships' pages (Deep Space 9 on the chart, Voyager in traffic) ----------
// Fan work. Star Trek belongs to Paramount; the models are this collection's own, from src/ds9 and src/voyager.
//
// Deep Space 9 is a place on the chart (places.js, 'ds9', out past the ice world on the western frontier), drawn by
// the DS9 page's own model (src/ds9/station.js), built here into a place the way the other places are built. It is a
// station like the starbases (W.stations): K docks, approach control brings the ship in to a berth beside the docking
// ring, and once she is in the clamps a panel offers the station's own page (/ds9). Its wormhole opens now and then,
// as it does on that page.
//
// Voyager is met as traffic: the Voyager page's model (src/voyager/ship.js) is a class of its own for traffic.js
// (W.FA.intrepid), and each run of orders (W.runSeed) puts her at one place on the chart, often Deep Space 9. Hail
// her (comms.js reads her lines) and her card offers her page (/voyager); she will form up like any Federation ship.
import {model as stationModel} from '../ds9/station.js';
import {model as voyagerModel} from '../voyager/ship.js';
import {fold,hullPalette} from '../starship/parts.js';
import {sidePanel,el,button,seeded} from './ui.js';

const api=(THREE,scene,hooks)=>({THREE,scene,animHooks:hooks,C:{},fold:(g,p)=>fold(THREE,g,p),palette:o=>hullPalette(THREE,o)});
// where the station sits in its place, and where its centre is from the berth: starbases.js docks at (1050,-520,330)
// in a station's frame, with the arm along +x; the wrapper is turned so that the berth faces the way the ship comes in
const AT=[16000,600,4000],CORE=[-170,-520,330];

// places.js's builder for the place: the station, its solids, and its own animation (its lights, its wormhole)
export function ds9Place(THREE,g){
  const hooks=[],wrap=new THREE.Group(),inner=new THREE.Group();wrap.name='ds9-wrap';
  stationModel(api(THREE,inner,hooks));
  inner.position.set(...CORE);wrap.add(inner);wrap.position.set(...AT);wrap.rotation.y=Math.PI;g.add(wrap);
  // lit like a hull, not like a nebula (makePlace leaves tone mapping on what says so)
  wrap.traverse(o=>{if(o.isMesh&&o.material&&!o.material.isMeshBasicMaterial)o.userData.toned=true;});
  wrap.updateMatrix();const c=new THREE.Vector3(...CORE).applyMatrix4(wrap.matrix);
  return {solids:[{name:'Deep Space 9',c,r:620,station:true}],update:t=>{const now=t*1000;for(const h of hooks)h(now);}};
}

const VOYAGER=['This is Voyager. We have been a long way from home; it is good to hear a Federation voice on the channel.',
  'Voyager here. Our astrometrics lab would very much like a copy of your charts, if you can spare them.',
  'Voyager to Enterprise: a Galaxy class! Half our crew are at the windows. The other half are pretending not to be.',
  'Taking on supplies, and the crew on shore leave. They have earned it, several times over.',
  'Our nacelles fold up for warp, Enterprise. Yours are very handsome where they are.'];

export function neighbours(W){
  const {THREE}=W,V=()=>new THREE.Vector3();
  // ---- Deep Space 9: a station to dock at ----
  const NOTE='A Cardassian-built station, run by Starfleet, at the mouth of its own wormhole: the frontier. K docks; it has a page of its own.';
  W.placeHooks.push(pl=>{if(pl.P.id!=='ds9')return;const wrap=pl.group.getObjectByName('ds9-wrap');if(!wrap)return;
    wrap.userData.info={name:'Deep Space 9',info:NOTE};W.pickable(wrap);
    W.stations.push({n:'ds9',name:'Deep Space 9',note:NOTE,place:pl,g:wrap,beacons:[],craft:[]});});
  const P=sidePanel('ent-ds9','Deep Space 9',()=>{});
  function card(){P.body.innerHTML='';
    const a=el('a',null,'Open the station\'s own page');a.href='ds9.html';a.target='_blank';a.rel='noopener';a.style.color='#9fc8f0';
    P.body.append(el('div','card ok',[el('b',null,'Docked at Deep Space 9'),
      el('div','say','Ops sends its welcome, and a list of what the Promenade has that a starbase does not. The wormhole is quiet; it will not stay that way.'),
      el('div','acts',[a])]),el('small',null,'The station is drawn by its own page\'s model. K casts off.'));
    P.toggle(true);}
  W.on('docked',st=>{if(st&&st.n==='ds9')card();});
  W.openDS9=()=>card();

  // ---- Voyager: a ship in traffic ----
  if(W.FA)W.FA.intrepid=()=>{const g=new THREE.Group();voyagerModel(api(THREE,g,[]));
    const lights=[];g.traverse(o=>{if(o.isLight)lights.push(o);o.userData.noWire=true;});for(const l of lights)l.parent.remove(l);   // a light more would recompile every material
    return {g};};
  const where=['ds9','ds9','ds9','colony','nebula','ocean','giant','binary','farside'],VP=where[Math.floor(seeded('voyager'+(W.runSeed||''))()*where.length)];
  let voy=null;
  function meet(pl){if(voy&&W.traffic.all.includes(voy))return;
    const st=W.stations.find(s=>s.place===pl),c=st?st.g.position.clone():V().set(12000,400,-3000),R=st?4200:3200;
    voy=W.traffic.spawn(pl,'intrepid',{kind:'loop',c:()=>c,r:R,w:240/R,a:1,n:V().set(0,1,0),say:'Back from a very long voyage, and taking her time about the last of it.'},['USS Voyager','NCC-74656','intrepid']);
    voy.lines=VOYAGER;voy.link={href:'voyager.html',label:'Her own page'};}
  W.arriveHooks.push(pl=>{if(pl.P.id===VP&&W.traffic)meet(pl);});
  return {act:{ds9:()=>card(),voyager:()=>meet(W.herePlace())},hud:()=>'',state:()=>({voyagerAt:VP,voyager:!!voy,ds9:W.stations.some(s=>s.n==='ds9')})};
}
