// ---------- Galaxy class: things met on the way ----------
// Original work. On a long jump (four light-years or more, with a course laid in) there is about one chance in four
// that something pulls her out of warp part of the way there, into interstellar space:
//
//   a distress call   a Starfleet ship, disabled, her crew alive: beam them off (B) and go on.
//   a lure            what looks like the same, until she comes within six kilometres (or half a minute passes):
//                     an empty hulk with a distress beacon wired to it, and raiders coming out of warp.
//   a derelict        an ancient hulk, drifting, worth a scan (N).
//   a nest            the same hulk, with a Kethri swarm sleeping in it, that wakes.
//   a snare           a warp snare: raiders' work, and the raiders waiting by it.
//
// When it is over (the crew aboard, the derelict scanned, the hostiles gone, or a minute on with nothing doing) the
// course she was on is laid in again and she goes on, unless the captain has set another meanwhile. #enc=<kind>
// forces one on the next jump of any length (for tests); #noenc never. The orders' test captain (#mauto) meets none
// unless #enc asks for one, so the missions' smoke tests stay repeatable.
export function encounters(W){
  const {THREE,ROOT,animHooks}=W,F=W.fx,S=W.flight,V=()=>new THREE.Vector3();
  const h=new URLSearchParams(location.hash.slice(1));
  let force=h.get('enc'),off=h.has('noenc')||(h.has('mauto')&&!force);
  const KINDS=['distress','lure','derelict','nest','snare'];
  let trip=null,enc=null,lastT=-1e9,count=0;
  const note=m=>F.note(m),here=()=>W.herePlace().P.id;
  // a new jump: whether something happens on it, and where (as a fraction of the way)
  animHooks.push(()=>{
    if(S.warp&&W.course&&W.course.dest){const dest=W.course.dest,d=S.map.distanceTo(new THREE.Vector2(...dest.ly));
      if(!trip||trip.dest!==dest){trip={dest,d0:d,at:0.35+Math.random()*0.3,go:!off&&(force?true:d>=4&&F.T()-lastT>180&&Math.random()<0.25)};}
      if(trip.go&&!enc&&d<trip.d0*(1-trip.at)&&d>0.6){trip.go=false;start(force&&KINDS.includes(force)?force:KINDS[Math.floor(Math.random()*KINDS.length)],dest);force=null;}}
    else if(!S.warp)trip=null;
    if(enc)tick();});

  function start(kind,dest){lastT=F.T();count++;
    enc={kind,dest,t0:F.T(),stuff:[],fought:false,done:false,saw:false};
    W.course.clear();W.dropOut();enc.pid=here();
    const q=ROOT.getWorldQuaternion(new THREE.Quaternion()),ahead=(d,s)=>F.shipCentre().add(V().set(d,300,s).applyQuaternion(q));
    // the things are put once she has slowed from her run out of warp (as the orders do), or fifteen seconds on
    const put=fn=>{const t0=F.T(),iv=setInterval(()=>{if(enc&&enc.kind===kind&&(S.v<1500||F.T()-t0>15)){clearInterval(iv);fn();}else if(!enc)clearInterval(iv);},250);};
    if(kind==='distress'||kind==='lure'){
      const [nm,reg,cls]=[['USS Harrow','NCC-70233','kestrel'],['USS Linnet','NCC-66140','tamar'],['USS Coldwater','NCC-71877','meridian']][Math.floor(Math.random()*3)];
      note('Dropping out of warp: a distress call on a Starfleet frequency, the '+nm+'. She has lost main power.');
      put(()=>{const pl=W.herePlace(),at=pl.group.worldToLocal(ahead(8000,2200));
        const w=W.traffic.wreck(pl,cls,at,[nm,reg,cls]);w.task.crew=kind==='lure'?0:30+Math.floor(Math.random()*90);w.task.life=10+Math.round(Math.random()*15);
        if(kind==='lure'){w.task.saved=true;w.task.say='Dark, and empty: a distress beacon wired to her hull.';}enc.stuff.push(w);enc.ship=w;});}
    else if(kind==='derelict'||kind==='nest'){note('Dropping out of warp: long-range sensors have something drifting off our course. Something old.');
      put(()=>{W.HO.derelict();enc.wreck=true;});}
    else{note('A warp snare! Something has pulled us out of warp.');put(()=>{W.HO.contact();setTimeout(()=>W.HO.contact(),2200);if(Math.random()<0.4)setTimeout(()=>W.HO.contact('varr'),5000);enc.fought=true;});}
    W.emit&&W.emit('encounter',{kind});
  }
  // the rest of it, each frame, until it is over
  function tick(){const e=enc,t=F.T()-e.t0,foes=W.foes?W.foes().length:0;
    // she went on her way meanwhile (a course of the captain's own): it is left behind
    if(S.warp||here()!==e.pid){end(false);return;}
    if(e.kind==='lure'&&e.ship&&!e.sprung&&(t>30||e.ship.g.getWorldPosition(V()).distanceTo(ROOT.position)<6000)){e.sprung=true;e.fought=true;
      note('There is no one aboard her: the distress call was a lure! Raiders, coming out of warp.');W.HO.contact();setTimeout(()=>W.HO.contact(),1800);}
    if(e.kind==='nest'&&e.wreck&&!e.sprung&&t>22){e.sprung=true;e.fought=true;W.HO.swarm(4);}
    // over: the crew taken off, the derelict scanned (or a minute of looking), the fight won, or nothing for a minute
    const over=foes?false:e.kind==='distress'?e.ship&&(!W.traffic.all.includes(e.ship)||e.ship.task.saved)||t>75:
      e.kind==='derelict'?e.saw||t>60:e.fought?(e.sprung||e.kind==='snare')&&t>8:t>75;
    if(over&&!e.done){e.done=true;setTimeout(()=>{if(enc===e)end(true);},4000);}}
  W.on('scan',d=>{if(enc&&(!d.c||/derelict/i.test(d.c.name||'')))enc.saw=true;});
  W.on('rescued',t=>{if(enc&&t===enc.ship){note('All of the '+t.name+'\'s crew are aboard. We can go on.');}});
  function end(resume){const e=enc;enc=null;
    for(const t of e.stuff)if(W.traffic.all.includes(t))W.traffic.remove(t);
    if(resume&&!W.course.dest&&!S.warp&&e.dest){note('Resuming course for '+e.dest.name.replace(/^Home: .*/,'home').replace(/^An? /,'the ').toLowerCase()+'.');W.course.set(e.dest);}
    W.emit&&W.emit('encounterdone',{kind:e.kind});}
  return {act:{encounter:()=>{force=force||'distress';off=false;}},
    hud:()=>enc?({distress:'distress call',lure:'distress call',derelict:'a derelict',nest:'a derelict',snare:'warp snare'}[enc.kind]):'',
    state:()=>({enc:enc&&enc.kind,count,trip:trip&&{d0:+trip.d0.toFixed(2),go:trip.go}})};
}
