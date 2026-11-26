// ---------- Galaxy class: the library computer ----------
// Fan work. Star Trek belongs to Paramount; every ship and people here is this page's own (factions.js, traffic.js).
//
// A panel of what the ship has met and where she has been, kept between visits (localStorage, if the browser
// allows it):
//   Ships and peoples  every class of the fleet's and every people's ship that has come within sensor range (sixty
//                      kilometres), each turning on a small stage of its own when it is chosen: the same model the
//                      page flies, built again (or, for a raider, copied from the one met this visit)
//   Places charted     every place on the chart she has been to, its note, and what the sensors read there: each scan
//                      made at a place is kept as the Sensors panel showed it (its last three)
//
// The stage is drawn by the page's own renderer, not a second one (a second WebGL context could not use the hull's
// environment map, and costs a context): just before each frame, while the panel is open, the model is drawn into a
// corner of the canvas and copied from there into the panel's own small canvas in the same task, and then the
// frame proper is drawn over that corner as usual. It costs one small draw a frame while the panel is open, and
// nothing while it is shut.
import {sidePanel,el,row,button} from './ui.js';
import {PLACES} from './places.js';

const PEOPLES={
  raider:{title:'Raiders',blurb:'Hostile, about 160 m, an arrowhead with engine pods on its wingtips. Nobody has learned who sends them.'},
  varr:{title:'The Varr',blurb:'A warrior people. Their cruiser is a dark bronze wedge of stepped armour about 300 m long with two blade wings swept forward; it hunts from behind a cloak.'},
  lattice:{title:'The Lattice',blurb:'A hive. No front and no back: a dark core under a crust of blocks and spines inside two cages of glowing struts, 1.1 km across. It learns from what it is hit with.'},
  sere:{title:'The Sere',blurb:'A quiet, exact people who keep records of everything: a white survey ship of 350 m, a slim keel under one tall swept fin. They help, a little.'},
  hauler:{title:'Free traders',blurb:'A trader\'s tug, about 400 m, pulling a spine of cargo pods out of the rim.'},
  derelict:{title:'A derelict',blurb:'Two broken halves of something ancient and ribbed, 2.5 km long. A few lights still flicker. Nobody knows whose.'},
  kethri:{title:'The Kethri',blurb:'A swarm people: darts of 40 m, a black needle between two teal vanes, in fives and sixes. Each is weak; the swarm is not.'},
  ossari:{title:'The Ossari',blurb:'A reclusive people who grow their ships: pearl-white pods along a curved spine, sails of faint gold light between them, 600 m.'},
  probe:{title:'A survey probe',blurb:'A long-range probe, forty metres of instruments on a mast, its beacon still blinking.'},
};
const KIND=n=>/raider/i.test(n)?'raider':/varr/i.test(n)?'varr':/lattice/i.test(n)?'lattice':/sere/i.test(n)?'sere':/hauler/i.test(n)?'hauler':/derelict/i.test(n)?'derelict':
  /kethri/i.test(n)?'kethri':/ossari/i.test(n)?'ossari':/probe/i.test(n)?'probe':null;
const KEY='krator-ent-library';

export function library(W){
  const {THREE,renderer,animHooks,ROOT}=W,V=()=>new THREE.Vector3();
  let rec={met:{},places:{}};
  try{const s=JSON.parse(localStorage.getItem(KEY)||'null');if(s&&s.met&&s.places)rec=s;}catch(e){}
  const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(rec));}catch(e){}};
  const live={};   // models met this visit that cannot be built again (a raider's mesh lives in hostile.js)

  // ---- what has been met ----
  function meet(key,title,blurb,kind,proto){
    if(proto&&!live[key])live[key]=proto.clone();
    if(rec.met[key])return;rec.met[key]={title,blurb,kind,t:Date.now()};save();
    W.toast&&W.toast('Library','New entry: '+title+'.');if(P.open())draw();
  }
  const pos=V();
  function look(){
    if(W.traffic)for(const t of W.traffic.here()){if(t.g.getWorldPosition(pos).distanceTo(ROOT.position)>60000)continue;
      const k=KIND(t.cls)||t.cls;
      if(PEOPLES[k])meet('p:'+k,PEOPLES[k].title,PEOPLES[k].blurb,'people');
      else meet('c:'+t.cls,W.traffic.classTitle(t.cls)||t.cls,(t.info.info||'').replace(t.task&&t.task.say||'\u0000','').trim(),'class');}
    for(const o of W.FX.children){const i=o.userData&&o.userData.info;if(!i||!i.name)continue;const k=KIND(i.name);if(!k)continue;
      if(o.getWorldPosition(pos).distanceTo(ROOT.position)>60000)continue;
      meet('p:'+k,PEOPLES[k].title,PEOPLES[k].blurb,'people',k==='raider'?o:null);}
  }
  setInterval(look,2000);

  // ---- where she has been, and what the sensors read there ----
  const visit=pl=>{const P=pl.P;if(!rec.places[P.id]){rec.places[P.id]={name:P.name,note:P.note||'',scans:[],t:Date.now()};save();}};
  visit(W.homePlace);W.arriveHooks.push(visit);
  W.on('scan',({place})=>{
    const card=document.querySelector('#ent-sensors .card');if(!card)return;
    const pl=PLACES.find(p=>p.id===place)||{id:place,name:place};if(!rec.places[place])rec.places[place]={name:pl.name,note:pl.note||'',scans:[],t:Date.now()};
    const title=(card.querySelector('b')||{}).textContent||'Scan',rows=[...card.querySelectorAll('.row')].map(r=>[...r.children].map(c=>c.textContent));
    const S=rec.places[place].scans;const j=S.findIndex(s=>s.title===title);if(j>=0)S.splice(j,1);S.unshift({title,rows:rows.slice(0,8)});S.length=Math.min(S.length,3);save();
    if(P.open())draw();});

  // ---- the panel ----
  const P=sidePanel('ent-library','Library computer',o=>{W.onLibToggle&&W.onLibToggle(o);if(o)draw();});
  {const st=document.createElement('style');st.textContent=`#ent-library .tabs{display:flex;gap:4px;margin-bottom:6px}
#ent-library canvas{display:block;width:100%;height:auto;background:#000;border-radius:0 18px 0 18px;border-left:10px solid #cc99cc;box-sizing:border-box;margin:4px 0}
#ent-library .list{display:flex;flex-wrap:wrap;gap:4px;margin:6px 0}
#ent-library .list button{font-size:12px;padding:3px 8px}
#ent-library .cap{font-size:12px;color:#cfe0f0;margin:2px 0 6px}`;document.head.appendChild(st);}
  let tab='ships',sel=null;
  const cv=document.createElement('canvas');cv.width=480;cv.height=270;const cx=cv.getContext('2d');
  function draw(){
    P.body.innerHTML='';
    const tabs=el('div','tabs',[button('Ships and peoples',()=>{tab='ships';draw();}),button('Places charted',()=>{tab='places';draw();})]);
    tabs.children[0].setAttribute('aria-pressed',String(tab==='ships'));tabs.children[1].setAttribute('aria-pressed',String(tab==='places'));
    P.body.append(tabs);
    if(tab==='ships'){
      const keys=Object.keys(rec.met).sort((a,b)=>rec.met[a].kind.localeCompare(rec.met[b].kind)||rec.met[a].title.localeCompare(rec.met[b].title));
      if(!keys.length){P.body.append(el('div','say','Nothing on file yet. Ships and peoples are entered when they come within sensor range.'));setModel(null);return;}
      if(!sel||!rec.met[sel])sel=keys[0];
      const m=rec.met[sel];
      P.body.append(cv,el('div','card',[el('b',null,m.title),el('div','cap',m.blurb||''),el('small',null,(m.kind==='people'?'A people met':'A starship class')+', first on file '+new Date(m.t).toLocaleDateString())]));
      const list=el('div','list');for(const k of keys){const b=button(rec.met[k].title,()=>{sel=k;draw();});b.setAttribute('aria-pressed',String(k===sel));list.append(b);}
      P.body.append(el('small',null,keys.length+' on file'),list);
      setModel(sel);
    }else{
      setModel(null);
      const ids=PLACES.map(p=>p.id).filter(id=>rec.places[id]).concat(Object.keys(rec.places).filter(id=>!PLACES.some(p=>p.id===id)));
      P.body.append(el('small',null,ids.length+' of '+PLACES.length+' places charted'));
      for(const id of ids){const r=rec.places[id],c=el('div','card'+(r.scans.length?' ok':''),[el('b',null,r.name)]);
        if(r.note)c.append(el('div','cap',r.note));
        if(!r.scans.length)c.append(el('small',null,'No scans on file. N scans.'));
        for(const s of r.scans){const d=el('details','record',[el('summary',null,s.title)]);for(const [k,v] of s.rows)d.append(row(k,v||''));c.append(d);}
        P.body.append(c);}
    }
  }

  // ---- the stage ----
  const scene=new THREE.Scene(),cam=new THREE.PerspectiveCamera(30,16/9,1,200000),turn=new THREE.Group();scene.add(turn);
  {const k=new THREE.DirectionalLight(0xfff4e2,3.0);k.position.set(1,0.8,0.6);scene.add(k);const f=new THREE.DirectionalLight(0x6a8ab0,0.7);f.position.set(-1,-0.3,-0.8);scene.add(f);
   scene.add(new THREE.AmbientLight(0x3a4658,1.1));}
  let model=null,modelKey=null;
  function build(key){
    const k=key.slice(2);
    try{if(key[0]==='c')return W.traffic.make(k);
      if(live[key])return live[key].clone();
      if(W.FA&&W.FA[k])return W.FA[k]().g;}catch(e){}
    return null;
  }
  function setModel(key){
    if(key===modelKey)return;modelKey=key;
    if(model){turn.remove(model);model=null;}
    if(!key)return;
    model=build(key);
    if(!model){cx.fillStyle='#000';cx.fillRect(0,0,cv.width,cv.height);cx.fillStyle='#ff9966';cx.font='16px Helvetica,Arial,sans-serif';cx.fillText('No recording on file.',24,40);return;}
    model.position.set(0,0,0);model.rotation.set(0,0,0);model.scale.setScalar(1);model.visible=true;model.traverse(o=>{o.visible=true;});
    turn.add(model);
    const b=new THREE.Box3().setFromObject(model),c=b.getCenter(V()),r=Math.max(10,b.getSize(V()).length()*0.5);
    model.position.sub(c);cam.position.set(0,r*0.45,r/Math.sin(cam.fov*Math.PI/360)*0.72);cam.near=r*0.05;cam.far=r*20;cam.updateProjectionMatrix();cam.lookAt(0,0,0);
  }
  const vp=new THREE.Vector4();
  animHooks.push(now=>{
    if(!P.open()||!model||tab!=='ships')return;
    turn.rotation.y=now*0.0004;
    // into the canvas's lower left corner, copied out at once; the frame drawn after covers it again
    const pr=renderer.getPixelRatio(),w=Math.min(cv.width,Math.floor(renderer.domElement.width/pr)),h=Math.round(w*cv.height/cv.width);
    renderer.getViewport(vp);const sc=renderer.getScissorTest(),ac=renderer.autoClear;
    renderer.setRenderTarget(null);renderer.setViewport(0,0,w,h);renderer.setScissor(0,0,w,h);renderer.setScissorTest(true);renderer.autoClear=true;
    renderer.render(scene,cam);
    cx.clearRect(0,0,cv.width,cv.height);cx.drawImage(renderer.domElement,0,renderer.domElement.height-h*pr,w*pr,h*pr,0,0,cv.width,cv.height);
    renderer.setScissorTest(sc);renderer.setViewport(vp);renderer.autoClear=ac;
  });
  W.openLibrary=o=>{W.audio&&W.audio();P.toggle(o);};
  // (the stage's mean brightness, for the probe: a stage that draws nothing reads 0)
  const lum=()=>{try{const d=cx.getImageData(0,0,cv.width,cv.height).data;let s=0;for(let i=0;i<d.length;i+=16)s+=d[i]+d[i+1]+d[i+2];return Math.round(s/(d.length/16)/3);}catch(e){return -1;}};
  return {toggle:o=>P.toggle(o),state:()=>({met:Object.keys(rec.met).length,places:Object.keys(rec.places).length,open:P.open(),stage:P.open()&&model?lum():null,sel})};
}
