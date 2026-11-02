// ---------- Galaxy class: the transporter ----------
// Original work. B energises. What it does depends on where the ship is:
//   - beside a disabled ship (within five kilometres): its survivors are beamed aboard, a few cycles of them;
//   - in standard orbit: an away team beams down to the world below, and B again brings them back up (they report
//     what they found while they are down);
//   - near another ship or a starbase: a courtesy party goes across and back;
//   - otherwise nothing is in range, and the transporter chief says so.
// Each end of the beam is a column of sparkling light that rises, holds and fades, with a rising shimmer of sound;
// the far end is drawn bigger than life so that it can be seen from a few kilometres. Told to the orders as
// W.emit('beam') ('rescued' for a ship's crew, 'away' and 'aboard' for the away team).
import {typing,seeded} from './ui.js';

export function transporter(W){
  const {THREE,ROOT,SYS,animHooks}=W,F=W.fx,S=W.flight,V=()=>new THREE.Vector3();
  let busy=null,away=null,count=0,rescued=0;
  // one column: points in a cylinder, twinkling, rising and fading through the effect
  const N=260,base=new Float32Array(N*4);for(let i=0;i<N;i++){const a=Math.random()*6.283,r=Math.sqrt(Math.random());base[i*4]=Math.cos(a)*r;base[i*4+1]=Math.random();base[i*4+2]=Math.sin(a)*r;base[i*4+3]=Math.random()*20;}
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(new Float32Array(N*3),3));geo.setAttribute('a',new THREE.BufferAttribute(base,4));
  const mat=()=>new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,uniforms:{uU:{value:0},uT:{value:0},uC:{value:new THREE.Color(0xffd890)},uH:{value:W.renderer.domElement.height}},
    vertexShader:`uniform float uU,uT,uH;attribute vec4 a;varying float vB;void main(){
        vec3 p=vec3(a.x,a.y,a.z);p.y+=fract(uT*0.4+a.w)*0.15;
        float on=smoothstep(0.,0.25,uU)*smoothstep(1.,0.7,uU);vB=on*(0.5+0.5*sin(uT*23.+a.w*7.));
        vec4 mv=modelViewMatrix*vec4(p,1.);gl_Position=projectionMatrix*mv;gl_PointSize=clamp(uH*0.05*length(modelMatrix[1].xyz)/-mv.z,1.5,9.);}`,
    fragmentShader:`uniform vec3 uC;varying float vB;void main(){float k=smoothstep(0.5,0.,length(gl_PointCoord-0.5));gl_FragColor=vec4(mix(uC,vec3(1.),0.4)*vB*k*1.6,vB*k);}`});
  function column(pos,size,col){
    const p=new THREE.Points(geo,mat());p.material.uniforms.uC.value.set(col||0xffd890);p.userData.noWire=true;p.frustumCulled=false;
    p.scale.set(size*0.3,size,size*0.3);W.FX.add(p);const glow=F.sprite(col||0xffd890,size*1.4,0);glow.userData.noWire=true;W.FX.add(glow);
    return {p,glow,pos,size};}
  function hum(T){const A=W.audio&&W.audio();if(!A)return;const {a,master}=A,t=a.currentTime;
    for(const f of [660,990,1320,1760]){const o=a.createOscillator(),g=a.createGain(),lfo=a.createOscillator(),lg=a.createGain();o.type='sine';o.frequency.setValueAtTime(f,t);o.frequency.linearRampToValueAtTime(f*1.5,t+T);
      lfo.frequency.value=13+f/200;lg.gain.value=0.02;lfo.connect(lg);lg.connect(g.gain);o.connect(g);g.connect(master);
      g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(0.025,t+0.5);g.gain.setValueAtTime(0.025,t+T-0.6);g.gain.linearRampToValueAtTime(0,t+T);o.start(t);lfo.start(t);o.stop(t+T+0.05);lfo.stop(t+T+0.05);}}
  // run one beam: from (a function of) here to there; a few cycles for a crowd
  function energise(there,size,cycles,done,col){
    const T=3.2;busy={t0:F.T(),T:T*cycles,ends:[column(()=>F.shipCentre().add(V().set(0,40,0).applyQuaternion(ROOT.quaternion)),60,col),column(there,size,col)],cyc:T,done};
    hum(T*cycles);
  }
  animHooks.push(()=>{if(!busy)return;const t=F.T()-busy.t0,u=(t%busy.cyc)/busy.cyc;
    for(const e of busy.ends){const p=e.pos();e.p.position.copy(F.toFX(p)).add(V().set(0,-e.size*0.5,0));e.glow.position.copy(F.toFX(p));
      e.p.material.uniforms.uU.value=u;e.p.material.uniforms.uT.value=t;e.glow.material.opacity=0.5*Math.sin(Math.PI*u);}
    if(t>=busy.T){for(const e of busy.ends){W.FX.remove(e.p);W.FX.remove(e.glow);e.p.material.dispose();e.glow.material.dispose();}const d=busy.done;busy=null;count++;d&&d();}});

  const note=m=>W.toast&&W.toast('Transporter room',' '+m);
  const km=m=>m<1000?Math.round(m)+' m':(m/1000).toFixed(1)+' km';
  function beam(target){
    W.audio&&W.audio();
    if(busy){note('Still energising.');return;}
    const cs=W.contacts?W.contacts():[];
    // a ship's crew off a wreck
    const wreck=target&&target.ship&&target.ship.task.kind==='wreck'?target:cs.filter(c=>c.kind==='ship'&&c.ship.task.kind==='wreck').sort((a,b)=>a.d-b.d)[0];
    if(wreck&&!wreck.ship.task.saved){
      if(wreck.d>5000){note(wreck.name+' is '+km(wreck.d)+' off: bring us within five kilometres.');return;}
      const t=wreck.ship,n=t.task.crew||40,cyc=Math.max(2,Math.min(4,Math.ceil(n/18)));
      note('Locking on to '+n+' life signs aboard '+t.name+'. Energising: '+cyc+' cycles.');
      energise(()=>t.g.getWorldPosition(V()),220,cyc,()=>{t.task.saved=true;t.task.crew=0;t.task.say='Abandoned: her crew are aboard the Enterprise.';
        W.traffic.setTask(t,t.task);rescued+=n;note('All '+n+' aboard. Sickbay is taking the injured.');W.emit&&W.emit('rescued',t);W.emit&&W.emit('beam',{kind:'rescue',t});});
      return;}
    // the away team
    const orb=S.orbit&&S.orbit.b;
    if(away&&away.pl===W.herePlace()){
      if(!orb||orb.name!==away.body){note('The away team is on '+away.body+': put us back in orbit over it to bring them up.');return;}
      note('Energising. Four to beam up.');
      energise(()=>F.shipCentre().add(V().set(0,-160,0).applyQuaternion(ROOT.quaternion)),80,1,()=>{note('Away team aboard. '+away.found);W.emit&&W.emit('aboard',away);W.emit&&W.emit('beam',{kind:'aboard'});away=null;},0x9fd0ff);
      return;}
    if(orb){const r=seeded(orb.name+W.herePlace().P.id),pk=a=>a[Math.floor(r()*a.length)];
      const found=/gas giant/.test(orb.name)?'They never got there: it is gas all the way down. (They are fine: the beam would not lock.)':
        pk(['They found the ruins of a settlement nobody had charted, and brought back pictures.','They took core samples and a frightened lizard, which they have been told to put back.',
          'They report air that is breathable, water that is not, and a view they would like to describe at length.','They found a cave full of crystals that hum when the sun is on them.']);
      away={pl:W.herePlace(),body:orb.name,found};
      note('Away team: four, led by the first officer. Energising.');
      energise(()=>F.shipCentre().add(V().set(0,-200,0).applyQuaternion(ROOT.quaternion)),80,1,()=>{note('The away team is down on '+orb.name+'. B to bring them back.');W.emit&&W.emit('away',away);W.emit&&W.emit('beam',{kind:'away',body:orb.name});},0x9fd0ff);
      return;}
    // a courtesy party across to a ship or a starbase
    const near=target&&(target.kind==='ship'||target.kind==='station')?target:cs.filter(c=>c.kind==='ship'||c.kind==='station').sort((a,b)=>a.d-b.d)[0];
    if(near&&near.d<4000){note('A courtesy party across to '+near.name+'.');
      energise(()=>near.world?SYS.localToWorld(near.local.clone()):near.world,200,1,()=>{note('The party is back, with '+(near.kind==='station'?'fresh coffee from the starbase.':'the other ship\'s compliments.'));W.emit&&W.emit('beam',{kind:'party',c:near});});return;}
    note(near?'Nothing within four kilometres: '+near.name+' is '+km(near.d)+' off.':'Nothing in transporter range.');
  }
  W.beam=beam;
  addEventListener('keydown',e=>{if(e.repeat||typing(e))return;if(e.key==='b'||e.key==='B')beam();});
  return {act:{beam:()=>beam()},hud:()=>busy?'transporter: energising':away?'away team on '+away.body:'',state:()=>({busy:!!busy,away:away&&away.body,count,rescued})};
}
