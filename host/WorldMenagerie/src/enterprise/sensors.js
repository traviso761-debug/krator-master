// ---------- Galaxy class: sensors ----------
// Original work. N (or Scan on a chart's card) scans: a pulse goes out from the ship as a shell of light, and when
// it has passed the target the readout comes up in the Sensors panel. The target is what was asked for, or else
// whatever is nearest the middle of the view (within forty degrees), or else the nearest thing here. With nothing
// in range, it is a sweep of the place: what is here, and how far.
//
// Readings are made up but steady: they come from a hash of the thing's name, so the same world reads the same
// every time. A hostile's shields and hull are its real ones. Each scan is told to the orders (W.emit('scan')).
import {sidePanel,el,row,button,typing,seeded} from './ui.js';

export function sensors(W){
  const {THREE,ROOT,animHooks,camera}=W,F=W.fx,S=W.flight,V=()=>new THREE.Vector3();
  const P=sidePanel('ent-sensors','Sensors');
  const scanned=new Set();let busy=null,last=null,count=0;
  // the pulse: a shell, bright at its rim, growing out from the ship and fading
  const shell=new THREE.Mesh(new THREE.SphereGeometry(1,48,32),new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide,
    uniforms:{uA:{value:0}},vertexShader:`varying vec3 vN,vV;void main(){vec4 mv=modelViewMatrix*vec4(position,1.);vN=normalize(normalMatrix*normal);vV=normalize(-mv.xyz);gl_Position=projectionMatrix*mv;}`,
    fragmentShader:`uniform float uA;varying vec3 vN,vV;void main(){float f=1.-abs(dot(vN,vV));float k=pow(f,3.)*uA;gl_FragColor=vec4(vec3(0.45,0.85,1.)*k,k);}`}));
  shell.userData.noWire=true;shell.visible=false;shell.frustumCulled=false;W.FX.add(shell);
  function ping(){const A=W.audio&&W.audio();if(!A)return;const {a,master}=A,t=a.currentTime;
    for(const [f,dt] of [[1760,0],[2350,0.09],[1760,0.6]]){const o=a.createOscillator(),g=a.createGain();o.type='sine';o.frequency.value=f;o.connect(g);g.connect(master);
      g.gain.setValueAtTime(0,t+dt);g.gain.linearRampToValueAtTime(0.12,t+dt+0.01);g.gain.exponentialRampToValueAtTime(0.0001,t+dt+0.5);o.start(t+dt);o.stop(t+dt+0.55);}}

  // what to scan
  const pc=V();
  function pick(){
    const cs=W.contacts?W.contacts():[];if(!cs.length)return null;
    let best=null,bs=1e9;camera.updateMatrixWorld();
    for(const c of cs){pc.copy(c.world).applyMatrix4(camera.matrixWorldInverse);if(pc.z>=0)continue;
      const ang=Math.acos(Math.min(1,-pc.z/pc.length()));if(ang>0.7)continue;const sc=ang+c.d/400000;if(sc<bs){bs=sc;best=c;}}
    return best||cs.slice().sort((a,b)=>a.d-b.d)[0];
  }
  function scan(target){
    if(busy)return;W.audio&&W.audio();
    const c=target||pick(),R=c?Math.min(60000,Math.max(3000,c.d+(c.kind==='body'?0:c.r)+500)):30000,T=Math.min(3.2,0.9+R/25000);
    busy={c,t0:F.T(),T,R};ping();shell.visible=true;
    if(!P.open())P.toggle(true);show({wait:true,c});
  }
  W.scan=scan;
  animHooks.push(()=>{if(!busy)return;const u=(F.T()-busy.t0)/busy.T;
    shell.position.copy(F.toFX(F.shipCentre()));shell.scale.setScalar(200+busy.R*Math.min(1,u));shell.material.uniforms.uA.value=Math.max(0,1-u)*1.4;
    if(u>=1){shell.visible=false;const c=busy.c;busy=null;count++;last=read(c);last.c=c;show(last);
      if(c){scanned.add(c.name);W.emit&&W.emit('scan',{c,place:W.herePlace().P.id});}else W.emit&&W.emit('scan',{c:null,place:W.herePlace().P.id});}});

  const pct=x=>Math.round(x)+'%',num=x=>Math.round(x).toLocaleString('en'),km=m=>m<1000?Math.round(m)+' m':num(m/1000)+' km';
  function read(c){
    const pl=W.herePlace();
    if(!c){const cs=W.contacts?W.contacts():[];
      return {title:S.warp?'At warp':'Sweep: '+pl.P.name,kind:'sweep',rows:[['contacts',String(cs.length)],...cs.slice(0,8).map(x=>[x.name,km(x.d)])],
        say:S.warp?'Long-range sensors only at warp: the subspace wake, nothing more.':cs.length?'Everything here in range.':'Nothing within sensor range but dust.'};}
    const r=seeded(c.name+pl.P.id),rr=(a,b)=>a+r()*(b-a);
    if(c.kind==='foe'){const f=c.foe;return {title:'The '+c.name,kind:'foe',meters:[['shields',f.sh/f.sh0*100],['hull',f.hp/f.hp0*100]],
      rows:[['range',km(c.d)],['crew',num(f.K.name==='Lattice ship'?rr(2000,9000):rr(30,400))],['weapons','energy bolts'+(f.K.volley?', in pairs':'')],
        ['adapting',f.adapt&&f.K.adapt?(f.adapt.ph>f.adapt.tp?'to phasers':'to torpedoes'):'no']],
      say:f.hp/f.hp0<0.4?'Their hull is failing: they may break off, or give up if hailed.':'Hostile, armed, and ready to fight.'};}
    if(c.kind==='station'){const st=c.st;return {title:st.name,kind:'station',rows:[['range',km(c.d)],['crew',num(rr(900,4200))],['docking ports',String(4+Math.floor(r()*6))],
      ['fuel stores',pct(rr(55,98))],['shields','up'],['traffic',String((W.traffic?W.traffic.here().length:0))+' ships here']],say:st.note||''};}
    if(c.kind==='ship'){const t=c.ship,w=t.task.kind==='wreck';
      return {title:t.info.name,kind:w?'foe':'ship',rows:[['range',km(c.d)],['class',t.info.info.split(',')[0]],['crew',w?num(t.task.crew||0)+' alive':num(rr(80,900))],
        ['status',w?'disabled':t.task.kind==='escort'?'in formation':'under way'],...(w?[['life support',pct(t.task.life==null?rr(10,40):t.task.life)],['hull breach','amidships']]:[['shields','down, at rest']])],
        say:t.task.say};}
    if(c.kind==='gate')return {title:'The wormhole',kind:'gate',rows:[['range',km(c.d)],['mouth','4.8 km across'],['throat','stable'],['far end',(pl.P.link==='farside'?'28.5, 8':'-1.6, 3.6')+' on the chart'],
      ['negative energy density','holding']],say:'A traversable wormhole, held open by something nobody here built. Fly into the mouth.'};
    const big=c.kind==='body',R=c.r;
    if(big){const name=c.name,ice=/ice/.test(name+pl.P.id),gas=/giant/.test(name),lava=/lava/.test(name),moon=/moon/.test(name),un=/uncharted/.test(name);
      const cls=gas?'a gas giant':ice?'an ice world':lava?'a lava world':moon?'airless rock':un?'class M, or near it':pl.P.id==='ocean'?'an ocean world':'class M';
      const g=gas?rr(1.8,2.6):moon?rr(0.12,0.2):rr(0.7,1.3),temp=lava?rr(900,1400):ice?rr(-140,-60):gas?rr(-150,-110):moon?rr(-170,110):rr(-10,32);
      const life=gas||lava||moon?'none':ice?'microbial, under the ice':un?'yes: a great deal, and unknown':pl.P.id==='home'?'nine billion':'abundant';
      return {title:name.replace(/^the /,'The '),kind:'body',rows:[['class',cls],['diameter',num(R*2/1000*(gas?11:1.5))+' km'],['range',km(c.d)],['gravity',g.toFixed(2)+' g'],
        ['surface',(temp>0?'+':'')+Math.round(temp)+' °C'],['atmosphere',gas?'hydrogen, helium':moon?'none':lava?'sulphur dioxide':ice?'thin nitrogen':'nitrogen, oxygen'],['life signs',life],
        ['resources',gas?'deuterium':lava?'heavy metals':ice?'water, ammonia':'ores, water']],say:pl.P.note};}
    return {title:c.name.replace(/^the /,'The '),kind:'object',rows:[['range',km(c.d)],['size',km(R*2)]],say:pl.P.note};
  }
  function show(x){P.body.innerHTML='';
    if(x.wait){P.body.append(el('div','card',[el('b',null,'Scanning…'),el('div',null,x.c?x.c.name+', '+km(x.c.d):'Everything in range')]));return;}
    const card=el('div','card'+(x.kind==='foe'?' foe':x.kind==='body'?' ok':''),[el('b',null,x.title)]);
    for(const [k,v] of (x.meters||[])){card.append(row(k,pct(v)));const m=el('div','meter');const i=el('i');i.style.width=Math.max(0,Math.min(100,v))+'%';
      i.style.background=v<35?'#ff6a5a':v<65?'#e8c98a':'#7fc8a0';m.append(i);card.append(m);}
    for(const [k,v] of x.rows)card.append(row(k,v));
    if(x.say)card.append(el('div','say',x.say));
    P.body.append(card,el('div','acts',[button('Scan again',()=>W.scan(x.c||undefined)),button('Sweep the place',()=>W.scan(null)),button('Cartography',()=>{W.openCarto&&W.openCarto();})]),
      el('small',null,'N scans what is ahead; a chart\'s card scans what it shows.'));
  }
  // a sweep of the place, on purpose
  const sweep=()=>{if(busy)return;busy={c:null,t0:F.T(),T:2.4,R:60000};ping();shell.visible=true;if(!P.open())P.toggle(true);show({wait:true,c:null});};
  const s0=scan;W.scan=c=>c===null?sweep():s0(c);
  addEventListener('keydown',e=>{if(e.repeat||typing(e))return;if(e.key==='n'||e.key==='N')W.scan();else if(e.key==='Escape'&&P.open())P.toggle(false);});
  return {act:{scan:()=>W.scan(),sweep},hud:()=>busy?'scanning':'',state:()=>({count,busy:!!busy,last:last&&last.title,scanned:[...scanned]}),scanned};
}
