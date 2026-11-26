// ---------- Galaxy class: places that change the rules ----------
// Original work. Three places are not like the others:
//
//   The emission nebula   its ionised gas shorts the shield grid: the shields drop on arrival and cannot be raised
//                         while she is there; and the sensors lose any ship further off than eight kilometres in the
//                         glow (planets and the like still show). A fight in here is hull to hull.
//   The shattered world   a minefield across its approach, laid in the war that broke it: fourteen mines, dark until
//                         a sensor sweep there (N, then Sweep) or a tachyon net (Y) shows them. A mine that comes
//                         within nine hundred metres of the ship wakes and runs at her; on the shields it is a heavy
//                         blow, on the hull worse. Shown, they can be shot (Space or T: the weapons take the nearest
//                         shown mine within twenty kilometres when no hostile is in range; a torpedo's blast takes
//                         every mine within half a kilometre), or flown round.
//   The asteroid belt     at more than six kilometres a second the small rocks come faster than the deflector can push
//                         them aside, and they strike the forward shields; the faster, the more. A chase through it
//                         (the 'chase' orders) is a choice between catching her and keeping the shields.
//
// W.hazard: noShields() (the reason, or ''), mines(place) {left, total, shown}, nearestMine(), lay(place).
// W.emit('mine') as each goes, 'minesclear' when a field is gone.
import {PLACES} from './places.js';

export function hazards(W){
  const {THREE,ROOT,animHooks}=W,F=W.fx,S=W.flight,V=()=>new THREE.Vector3();
  const here=()=>W.herePlace().P.id,note=m=>F.note(m);
  const visible=()=>W.herePlace().group.visible&&!S.warp;

  // ---- the nebula ----
  const noShields=()=>here()==='nebula'&&visible()?'The nebula\'s ionised gas shorts the shield grid: no shields in here.':'';
  // short-range sensors: wrap the contacts list (cartography.js) so every module that reads it is short-sighted too
  {const c0=W.contacts;if(c0)W.contacts=()=>{const cs=c0();return here()!=='nebula'?cs:cs.filter(c=>!(c.kind==='ship'||c.kind==='foe')||c.d<8000);};}

  // ---- the minefield ----
  const fields={};
  const mineGeo=new THREE.IcosahedronGeometry(7,0),spikeGeo=new THREE.CylinderGeometry(0.4,1.4,7,5),
    mineMat=new THREE.MeshStandardMaterial({color:0x3a3430,roughness:0.6,metalness:0.6});
  function lay(pid){
    const pl=W.placeOf(PLACES.find(p=>p.id===pid));if(fields[pid])for(const m of fields[pid].mines)if(m.g.parent)m.g.parent.remove(m.g);
    // seeded by the place, so the same field is in the same place
    let s=[...pid].reduce((a,c)=>a*31+c.charCodeAt(0),99)>>>0;const rnd=()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296;};
    const mines=[];
    for(let i=0;i<14;i++){const g=new THREE.Group(),b=new THREE.Mesh(mineGeo,mineMat);g.add(b);
      for(const a of [[0,0,0],[Math.PI/2,0,0],[0,0,Math.PI/2]]){const sp=new THREE.Mesh(spikeGeo,mineMat);sp.rotation.set(...a);sp.scale.y=3.2;g.add(sp);}
      const lamp=F.sprite(0xff3020,90,0);g.add(lamp);
      g.position.set(12000+rnd()*9000,(rnd()-0.5)*2400,-1000+rnd()*10000);g.traverse(o=>{o.userData.noWire=true;});
      g.userData.info={name:'A mine',info:'A Varr gravitic mine, left over from the war that broke this world. It wakes for anything that comes within a kilometre.'};
      pl.group.add(g);mines.push({g,lamp,shown:false,armed:false,gone:false,hp:10,ph:Math.random()*6});}
    fields[pid]={mines,total:mines.length,told:false};return fields[pid];}
  const live=pid=>fields[pid]?fields[pid].mines.filter(m=>!m.gone):[];
  function show(pid,test){let n=0;for(const m of live(pid))if(!m.shown&&(!test||test(m.g.getWorldPosition(V())))){m.shown=true;n++;}return n;}
  function blow(pid,m,quiet){if(m.gone)return;m.gone=true;const p=m.g.getWorldPosition(V());if(m.g.parent)m.g.parent.remove(m.g);
    if(!quiet){F.sound('boom');F.flash(p,0xffd0a0,500,1);F.flash(p,0xff5020,900,1.6);}
    W.emit&&W.emit('mine',{pid});
    if(!live(pid).length){note('The last of the mines is gone. The approach is clear.');W.emit&&W.emit('minesclear',{pid});}}
  // shown by a sweep there, or by a tachyon net (what is in its fan)
  W.on('scan',d=>{if(!d.c&&fields[d.place]){const n=show(d.place);if(n)note('The sweep shows '+live(d.place).length+' mines across the approach. Shoot them (Space), or go round.');}});
  W.on('tachyon',n=>{const pid=here();if(!fields[pid])return;const k=show(pid,p=>{const r=p.clone().sub(n.o),d=r.length();return d<n.L&&r.normalize().dot(n.fw)>0.7;});if(k)note('The tachyon net shows '+k+' mines.');});
  // the nearest shown one within twenty kilometres, for the weapons
  function nearestMine(){const pid=here(),c=F.shipCentre();let b=null;for(const m of live(pid))if(m.shown){const p=m.g.getWorldPosition(V()),d=p.distanceTo(c);if(!b||d<b.d)b={m,p,d,pid};}return b;}
  W.targets&&W.targets.push(()=>{if(!visible())return null;const b=nearestMine();if(!b||b.d>20000)return null;
    return {p:b.p,fuse:200,r:20000,hit:(dmg,w,at)=>{if(w==='tp'){for(const m of live(b.pid))if(m.g.getWorldPosition(V()).distanceTo(at)<500)blow(b.pid,m);}else if((b.m.hp-=dmg)<=0)blow(b.pid,b.m);}};});

  // ---- what happens each frame ----
  let last=null,beltT=-99,beltTold=false;
  animHooks.push(now=>{const dt=last==null?0:Math.min(0.1,(now-last)/1000);last=now;if(!dt||!visible())return;const pid=here(),c=F.shipCentre(),t=now*0.001;
    // the mines: dark, or blinking once shown; awake and running at her inside nine hundred metres
    const f=fields[pid];
    if(f){if(!f.told){f.told=true;note('Sensors: something across the approach, cold and small and many. A minefield, perhaps. Sweep (N) to see it.');}
      for(const m of live(pid)){const p=m.g.getWorldPosition(V()),d=p.distanceTo(c);
        m.lamp.material.opacity=m.armed?(Math.sin(t*20)>0?1:0.2):m.shown?(Math.sin(t*3+m.ph)>0.4?0.9:0.15):d<3000?0.3:0;
        if(!m.armed&&d<900){m.armed=true;m.shown=true;note('A mine has woken: it is coming for us!');F.sound('klaxon');}
        if(m.armed){const to=c.clone().sub(p).normalize().multiplyScalar(700).add(S.vel||V());p.addScaledVector(to,dt);m.g.position.copy(m.g.parent.worldToLocal(p.clone()));
          if(d<(W.shieldsState&&W.shieldsState().up?380:160)){blow(pid,m,true);W.incoming&&W.incoming(p,{dmg:1.8,colour:0xff4020,size:1.6});}}}}
    // the belt's grit at speed
    if(pid==='belt'&&S.on&&S.v>6000&&Math.random()<dt*(S.v-6000)/14000*1.4&&t-beltT>0.4){beltT=t;
      const q=ROOT.getWorldQuaternion(new THREE.Quaternion()),from=c.clone().add(V().set(1600,(Math.random()-0.5)*300,(Math.random()-0.5)*500).applyQuaternion(q));
      W.incoming&&W.incoming(from,{dmg:0.35,colour:0xd8c8b0,size:0.45});
      if(!beltTold){beltTold=true;note('Rocks! At this speed in the belt they come faster than the deflector can push them aside. The forward shields are taking it.');}}});
  // the shattered world's own field, made with the place the first time it is wanted
  W.placeHooks.push(pl=>{if(pl.P.id==='shattered'&&!fields.shattered)lay('shattered');});
  W.arriveHooks.push(pl=>{beltTold=false;if(pl.P.id==='nebula'){note('Inside the nebula: the shields will not hold in this gas, and the sensors reach only eight kilometres.');}});

  W.hazard={noShields,lay:pid=>lay(pid),nearestMine,mines:pid=>{const f=fields[pid];return f?{left:live(pid).length,total:f.total,shown:live(pid).filter(m=>m.shown).length}:{left:0,total:0,shown:0};}};
  return {hud:()=>{const pid=here(),f=fields[pid];return [noShields()?'nebula: no shields, short-range sensors':'',f&&live(pid).length&&visible()?'mines '+live(pid).filter(m=>m.shown).length+' shown of '+live(pid).length:''].filter(Boolean).join(' · ');},
    state:()=>({fields:Object.fromEntries(Object.keys(fields).map(k=>[k,live(k).length]))})};
}
