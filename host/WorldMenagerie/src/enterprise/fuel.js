// ---------- Galaxy class: fuel, and the warp core ----------
// Original work. Two things the warp drive burns, kept as percentages of a full load:
//   antimatter   burnt by the light-year, harder the higher the warp (at warp 9 a full load is about a hundred
//                light-years, at warp 6 about a hundred and fifty); with none left there is no warp at all
//   dilithium    the crystal the reaction runs through, worn by the cube of the warp factor: below 35% the drive
//                will not go past warp 6, below 15% past warp 3. A matrix worn very low at high warp may fracture.
// Both fill again while the ship is docked at a starbase, from the same lines that bring the repair crews (W.repair).
//
// A warp-core breach (a fractured matrix, or a heavy hit to a warp drive already in pieces: systems.js) drops the
// ship out of warp and counts down from a minute. Engineering can try once to stabilise it (about one time in two:
// a failure costs ten seconds); otherwise the order is to eject the core, which goes out under the stern and blows
// eight seconds later: be well clear of it. Left to the last second, Engineering ejects it anyway and the blast
// catches the ship close astern. With no core the ship has impulse only, until a starbase fits a new one (docked,
// about eight seconds) or a fleet tender answers a call for help and tows her (allies.js: warp 2 under tow).
//
// The Engineering panel (I) shows all of this and holds the Eject and Stabilise orders. #fuel=am,dl sets the load
// for a test; #breach=s starts a breach s seconds after the page is up.
import {el,button} from './ui.js';

export function fuel(W){
  const {THREE,ROOT,G,animHooks}=W,F=W.fx,S=W.flight,V=()=>new THREE.Vector3();
  const st={am:100,dl:100,core:true,breach:null,fit:0};
  const say=m=>W.toast&&W.toast('Engineering',' '+m);
  const lastMap=S.map.clone(),told={};
  const once=(k,m)=>{if(!told[k]){told[k]=1;say(m);}};
  // what the fuel and the core allow
  const towed=()=>!!(W.allies&&W.allies.towing());
  const cap=()=>!st.core?(towed()?2:0):st.am<=0?0:st.dl<15?3:st.dl<35?6:9;
  const why=()=>!st.core?'There is no warp core: impulse only, until a starbase fits a new one or a tender tows us (call for help on the Tactical panel).':
    st.am<=0?'The antimatter is gone. Impulse only: a starbase can fill us, or a tender can tow us.':st.dl<15?'The dilithium is nearly spent: warp 3 is all it will carry.':st.dl<35?'The dilithium is worn: warp 6 is all it will carry.':'';
  let shown='';
  const dirty=()=>{const k=[Math.round(st.am),Math.round(st.dl),st.core,!!st.breach].join();if(k!==shown){shown=k;W.sys&&W.sys.dirty();}};

  // ---- burning it ----
  animHooks.push(()=>{const d=S.map.distanceTo(lastMap);lastMap.copy(S.map);
    if(S.warp&&d>0&&d<5){const w=S.warp/9;
      // under tow the tender's core does the work
      if(st.core){st.am=Math.max(0,st.am-d*(0.35+0.65*w*w));st.dl=Math.max(0,st.dl-d*0.6*w*w*w);}
      if(st.am<25)once('am25','Antimatter at a quarter. A starbase can fill us.');
      if(st.am<10)once('am10','Antimatter at ten per cent. Find a starbase.');
      if(st.dl<35)once('dl35','The dilithium matrix is wearing: warp 6 is the most it will carry now.');
      if(st.dl<15)once('dl15','The dilithium matrix is nearly spent: warp 3 at most.');
      if(st.core&&st.am<=0){say('Antimatter exhausted. We are dropping out of warp.');W.course&&W.course.clear();W.dropOut();}
      else if(S.warp>cap())S.warp=Math.max(1,cap());
      // a worn matrix driven hard may fracture
      if(st.dl<10&&S.warp>6&&Math.random()<d*0.6)breach('The dilithium matrix has fractured under the strain.');}
    tick();dirty();});

  // ---- the breach ----
  function breach(reason,secs){
    if(st.breach||!st.core)return;
    st.breach={t0:F.T(),T:(secs||60)*1000,tried:false,trying:0,why:reason||'Containment is failing.',said:7};
    if(S.warp){W.course&&W.course.clear();W.dropOut();}
    if(W.shieldsState&&!W.shieldsState().red)W.toggleRed();else F.sound('klaxon');
    say('Warp-core breach! '+st.breach.why+' One minute to a breach: eject the core (I, Engineering), or try to stabilise it.');
    W.emit&&W.emit('breach',st.breach);W.openEng&&W.openEng();dirty();
  }
  const left=()=>st.breach?Math.max(0,(st.breach.T-(F.T()-st.breach.t0)*1000)/1000):0;
  function stabilise(){const b=st.breach;if(!b||b.tried||b.trying)return;b.tried=true;b.trying=F.T();
    say('Engineering is trying to stabilise the containment field…');}
  function tick(){const b=st.breach;if(!b)return;const l=left();
    if(b.trying&&F.T()-b.trying>6){b.trying=0;
      if(Math.random()<0.45){st.breach=null;st.dl=Math.min(st.dl,5);say('Containment is holding. The breach is over, but the matrix is spent: warp 3 at most until a starbase.');W.emit&&W.emit('stabilised');dirty();return;}
      b.T-=10000;say('It will not hold! Eject the core!');}
    // the countdown said aloud every ten seconds, and every second at the end
    const k=Math.ceil(l/10);if(l>0&&k<b.said){b.said=k;if(l<=50)say('Core breach in '+Math.ceil(l)+' seconds.');F.sound('klaxon');}
    if(l<=5&&l>0&&Math.ceil(l)!==b.last){b.last=Math.ceil(l);F.sound('hit');}
    if(l<=0)eject(true);}
  function eject(late){
    if(!st.core)return;const b=st.breach;if(!b&&!late){say('The core is sound: there is nothing to eject it for.');return;}
    st.core=false;st.breach=null;st.fit=0;
    // out under the stern, falling away aft and down from her, glowing
    const q=ROOT.getWorldQuaternion(new THREE.Quaternion()),p=G.localToWorld(V().set(-300,-80,0));
    const g=new THREE.Group(),body=new THREE.Mesh(new THREE.CylinderGeometry(5,5,34,14),new THREE.MeshBasicMaterial({color:0x7fb8ff,toneMapped:false}));
    body.rotation.z=Math.PI/2;g.add(body,F.sprite(0x9fd0ff,120,0.9));g.traverse(o=>{o.userData.noWire=true;});g.position.copy(F.toFX(p));W.FX.add(g);
    const v=V().set(-0.55,-0.85,0).normalize().multiplyScalar(late?120:320).applyQuaternion(q).add(S.vel.clone()),T0=F.T(),fuse=late?1.2:8;
    F.sound('torpedo');
    if(late)say('Engineering has ejected the core with seconds to spare!');
    else say('Core ejected. It will go up in eight seconds: get clear of it! Impulse only after this.');
    W.emit&&W.emit('ejected',{late});
    F.run((t,dt)=>{const u=t-T0;g.position.addScaledVector(F.dirFX(v),dt);g.children[1].scale.setScalar(120+60*Math.sin(u*(6+u*2)));
      if(u<fuse)return;
      const at=g.getWorldPosition(V()),d=at.distanceTo(F.shipCentre());W.FX.remove(g);
      F.sound('boom');setTimeout(()=>F.sound('boom'),300);F.flash(at,0xffffff,3000,1.2);F.flash(at,0x9fd0ff,9000,3);F.flash(at,0xff8040,5000,2.4);
      // what the blast does depends on how far she got
      if(d<6000){const k=1-d/6000;W.hullHit&&W.hullHit(8+42*k,null);if(W.sys){W.sys.damage('warp',40*k);W.sys.damage(['impulse','sensors','shields'][Math.floor(Math.random()*3)],30*k);}
        say(d<2000?'The blast caught us close astern. Damage on every deck.':'The blast shook us, but we were clear enough.');}
      else say('The core has gone up, well astern of us. Impulse only now.');
      return false;});
    dirty();
  }
  // ---- at a starbase ----
  // k a frame while docked (W.repair): fill both, and fit a new core if she needs one (about eight seconds)
  function refill(k){const was=st.am<100||st.dl<100;st.am=Math.min(100,st.am+k*5);st.dl=Math.min(100,st.dl+k*3);
    if(was&&st.am>=100&&st.dl>=100){for(const x in told)delete told[x];say('Antimatter and dilithium are full.');W.emit&&W.emit('refuelled');}
    if(!st.core&&++st.fit>480){st.core=true;st.breach=null;say('A new warp core is in and running. Warp is ours again.');W.emit&&W.emit('corefit');}}

  // ---- the Engineering panel's part ----
  const box=el('div','fuel'),rows=el('div'),btns=el('div','acts');
  const bEject=button('Eject the core',()=>{W.audio&&W.audio();eject(false);}),bStab=button('Try to stabilise',()=>{W.audio&&W.audio();stabilise();});
  btns.append(bEject,bStab);box.append(el('small',null,'Fuel and the core'),rows,btns);
  {const s=document.createElement('style');s.textContent='#ent-eng .fuel{margin:8px 0;padding:6px 8px;border-left:3px solid #9cf;background:rgba(20,34,52,.6)}#ent-eng .fuel.breach{border-left-color:#f66;background:rgba(80,20,20,.55)}#ent-eng .fuel .cd{font-size:18px;color:#f88;letter-spacing:.06em}';document.head.appendChild(s);}
  const row=(k,v)=>el('div','row',[el('span',null,k),el('span',null,v)]);
  function paint(){rows.innerHTML='';const b=st.breach;box.classList.toggle('breach',!!b);
    if(b){const l=left();rows.append(el('div','cd','CORE BREACH '+Math.floor(l/60)+':'+String(Math.floor(l%60)).padStart(2,'0')),el('div','say',b.trying?'Engineering is trying to stabilise it…':b.why));}
    rows.append(row('Antimatter',Math.round(st.am)+'%'),row('Dilithium',Math.round(st.dl)+'%'),row('Warp core',st.core?(b?'breaching':'sound'):towed()?'gone: under tow':'gone: impulse only'),row('Warp available',String(cap()||'none')));
    bEject.style.display=b?'':'none';bStab.style.display=b&&!b.tried?'':'none';}
  // the countdown runs in the panel without rebuilding the buttons under the pointer
  let pT=0;animHooks.push(now=>{if(box.isConnected&&now-pT>250){pT=now;paint();}});
  const panel=body=>{paint();body.append(box);};

  W.fuel={cap,why,refill,breach,eject,stabilise,panel,towed,state:()=>({am:+st.am.toFixed(1),dl:+st.dl.toFixed(1),core:st.core,breach:st.breach?Math.round(left()):null}),
    core:()=>st.core,set:(am,dl)=>{st.am=am;st.dl=dl;dirty();}};
  {const h=new URLSearchParams(location.hash.slice(1)),t=+(h.get('evt')||1.5)*1000;
   if(h.has('fuel')){const [a,d]=h.get('fuel').split(',').map(Number);st.am=a;st.dl=d==null||isNaN(d)?st.dl:d;}
   if(h.has('breach'))setTimeout(()=>breach('A test of the containment field went wrong.'),t+(+h.get('breach')||0)*1000);}
  return {act:{eject:()=>eject(false),stabilise,breach:()=>breach('Containment is failing.')},
    hud:()=>st.breach?'WARP CORE BREACH '+Math.ceil(left())+'s':!st.core?(towed()?'under tow':'no warp core'):st.am<30?'antimatter '+Math.round(st.am)+'%':st.dl<35?'dilithium '+Math.round(st.dl)+'%':'',
    state:W.fuel.state};
}
