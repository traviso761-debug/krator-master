// ---------- what happens on Lake Atitlán ----------
// Every minute or two something happens, and the Events button fires any of them now (src/core/happenings.js:
// the notice, the Go and look button, the Events panel; #event=<name> fires one on arrival).
//
//   dawn        first light: the mist on the water, the fishermen out in their cayucos, the volcanoes coming out of
//               the dark
//   lancha      a ride in a lancha from Panajachel across the lake to Santiago Atitlán, under the volcanoes
//   xocomil     the Xocomil: the wind that comes up over the lake most afternoons, the whitecaps, the lanchas rolling
//   procession  Holy Week in Santiago Atitlán: the cofradías carry the anda through the streets to the church over
//               carpets of coloured sawdust, the brass band and the incense behind (C.atitlanEvents.procession)
//   cohetes     a fiesta's rockets over a church: the bangs and the puffs of white smoke at noon
//   sunset      the sun going down behind San Pedro's volcano, seen from Panajachel's shore
import { createHappenings } from '../core/happenings.js';

export function events(api){
  const {THREE,C,scene,camera,groundH,P}=api;const K=C.atitlanEvents||{};
  const R=Math.random;
  let H=null;const run=fn=>H.run(fn),notice=(...a)=>H.notice(...a);
  const setH=h=>{const f=api.setHour||window.setHour;if(f)f(h);};
  const tag=o=>{o.traverse(q=>{q.userData.noFingerprint=true;q.userData.noWire=true;});return o;};
  const WY=()=>api.ctx.waterLevel||0.05,LK=()=>api.ctx.lake;
  const soft=(()=>{const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d'),gr=g.createRadialGradient(32,32,0,32,32,32);
    gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(0.35,'rgba(255,255,255,0.5)');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.fillRect(0,0,64,64);return new THREE.CanvasTexture(c);})();
  const puff=(col,s,op,add)=>{const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:soft,color:col,transparent:true,opacity:op,depthWrite:false,blending:add?THREE.AdditiveBlending:THREE.NormalBlending}));sp.scale.setScalar(s);return tag(sp);};
  const cap=document.createElement('div');
  cap.style.cssText='position:fixed;left:50%;bottom:70px;transform:translateX(-50%);max-width:min(660px,calc(100vw - 32px));padding:9px 14px;background:rgba(10,16,20,.8);color:#eef2ee;font:14px/1.45 Georgia,serif;border-left:3px solid #1fa0b0;display:none;z-index:11;pointer-events:none';
  document.body.appendChild(cap);
  const captions=list=>{let shown='';return t=>{let c='';for(const [a,b,text] of list)if(t>=a&&t<b)c=text;if(c!==shown){shown=c;cap.textContent=c;cap.style.display=c?'block':'none';}};};
  const hideCap=()=>{cap.style.display='none';};
  const ll=(a,dy=0)=>{const [x,z]=P(a);return [x,groundH(x,z)+dy,z];};

  // ---- dawn: mist lying on the water round the camera, thinning as the sun comes up ----
  function dawn(){setH(5.6);const [vx,,vz]=ll(K.dawnView||[14.737,-91.16]),wy=WY(),g=tag(new THREE.Group());scene.add(g);const ms=[];
    for(let i=0;i<160;i++){const s=puff(0xdfe6ea,60+R()*90,0,false);s.position.set(vx+(R()-0.5)*1600,wy+3+R()*10,vz-200-R()*1500);g.add(s);ms.push(s);}
    let t=0;const CAP=captions([[0,14,'Before six the lake is flat and the mist lies on it. The fishermen are already out, a man to a cayuco, a dugout cut from one trunk.'],
      [14,30,'They fish for crabs and for black bass, put in the lake in 1958 for sport. The bass ate the small native fish, and with them the poc, the Atitlán grebe, which was found nowhere else; it was gone by 1989.'],
      [30,46,'The sun comes up behind the eastern rim. By nine the lanchas are running, and by noon the wind.']]);
    notice('Dawn','mist on the water and the cayucos out.',()=>[vx,wy+18,vz+40,vx,wy+4,vz-600],()=>[vx,wy,vz-600]);
    run((now,dt)=>{t+=dt;CAP(t);const k=t<6?t/6:t>34?Math.max(0,1-(t-34)/12):1;for(const m of ms)m.material.opacity=0.32*k;if(t>10)setH(5.6+Math.min(1.2,(t-10)*0.03));
      if(t>48){scene.remove(g);hideCap();return false;}return true;});}

  // ---- a lancha from Panajachel to Santiago, the camera riding behind it ----
  function lancha(){const L=LK();if(!L||!L.boats.length)return;setH(9.5);
    const want=K.ride||['Panajachel','Santiago Atitlán'];let b=L.boats.find(q=>q.r.from===want[0]&&q.r.to===want[1])||L.boats[0];
    b.s=b.r.len*0.02;b.wait=0;let t=0;
    const CAP=captions([[0,12,'The lancha from Panajachel to Santiago: an open boat under a tarp, a dozen people on the benches, their baskets and sacks at their feet, forty minutes across.'],
      [12,28,'The lake fills a caldera: the volcano that stood here blew itself apart 84,000 years ago, and the hole filled with water. It is 340 metres deep and has no outlet a river can see.'],
      [28,46,'Ahead, three volcanoes: San Pedro on the right, Tolimán and Atitlán side by side, Atitlán the higher at 3,537 m. Santiago lies in the bay between them.'],
      [46,64,'Santiago Atitlán is the largest of the Tz\'utujil towns. The men still wear the white trousers striped in purple, embroidered with birds; the women wind a long red ribbon round their heads.']]);
    const view=()=>{const q=b.q||L.boatAt(b),s=Math.sin(q.ry),c=Math.cos(q.ry);return [q.x-s*13+c*7,L.WY+4.2,q.z-c*13-s*7,q.x+s*70,L.WY+6,q.z+c*70];};   // behind and off the quarter, over the water ahead
    notice('The lancha','across the lake from Panajachel to Santiago.',view,()=>{const q=b.q||L.boatAt(b);return [q.x,L.WY,q.z];});
    run((now,dt)=>{t+=dt;CAP(t);if(t>66){hideCap();return false;}return true;});}

  // ---- the Xocomil ----
  function xocomil(){const L=LK();if(!L)return;setH(13.4);const [vx,vy,vz]=ll(K.xocomilView||[14.738,-91.17],0);let t=0;
    const CAP=captions([[0,14,'Around noon the wind comes up from the south, over the gaps between the volcanoes: the Xocomil. In Kaqchikel the name is said to mean the wind that carries away sin.'],
      [14,30,'In an hour the flat lake is a chop of whitecaps. The lanchas slow and slam into the waves, and the boatmen will not cross after two if they can help it.'],
      [30,48,'The story is of a couple, lovers parted by their families, who met at last in the middle of the lake; the wind is their quarrel, or their grief. By evening it drops, and the water goes still again.']]);
    notice('The Xocomil','the afternoon wind on the lake.',()=>[vx,L.WY+30,vz+60,vx,L.WY,vz-500],()=>[vx,L.WY,vz-500]);
    L.wind(1);run((now,dt)=>{t+=dt;CAP(t);if(t>40)L.wind(0);if(t>52){hideCap();return false;}return true;});}

  // ---- Holy Week in Santiago: the anda over the alfombras ----
  function procession(){const path=(K.procession||[]).map(a=>P(a));if(path.length<2)return;setH(10);
    const cum=[0];for(let i=1;i<path.length;i++)cum.push(cum[i-1]+Math.hypot(path[i][0]-path[i-1][0],path[i][1]-path[i-1][1]));const LEN=cum[cum.length-1];
    const at=s=>{s=Math.max(0,Math.min(LEN,s));let k=1;while(k<cum.length-1&&cum[k]<s)k++;const a=path[k-1],b=path[k],f=(s-cum[k-1])/((cum[k]-cum[k-1])||1);return [a[0]+(b[0]-a[0])*f,a[1]+(b[1]-a[1])*f,Math.atan2(b[0]-a[0],b[1]-a[1])];};
    const g=tag(new THREE.Group());scene.add(g);
    // the alfombras along the way: carpets of dyed sawdust in panels of colour and pattern
    const CARPET=['#c83a3a','#e8b830','#2a8a5a','#6a3a9a','#1fa0b0','#e86a2a','#f2f0ea'];
    for(let s=20;s<LEN-10;s+=7){const [x,z,a]=at(s);const m=new THREE.Mesh(new THREE.PlaneGeometry(3,6).rotateX(-Math.PI/2),new THREE.MeshLambertMaterial({color:CARPET[Math.floor(R()*CARPET.length)],polygonOffset:true,polygonOffsetFactor:-6,polygonOffsetUnits:-6}));
      m.position.set(x,groundH(x,z)+0.06,z);m.rotation.y=a;g.add(m);const inner=new THREE.Mesh(new THREE.PlaneGeometry(1.8,4.4).rotateX(-Math.PI/2),new THREE.MeshLambertMaterial({color:CARPET[Math.floor(R()*CARPET.length)],polygonOffset:true,polygonOffsetFactor:-8,polygonOffsetUnits:-8}));
      inner.position.set(x,groundH(x,z)+0.08,z);inner.rotation.y=a;g.add(inner);}
    // the anda, its carriers in purple, the band and the people behind
    const anda=new THREE.Group();anda.add(new THREE.Mesh(new THREE.BoxGeometry(3,0.4,7),new THREE.MeshLambertMaterial({color:0x5a2a1a})));
    {const t2=new THREE.Mesh(new THREE.BoxGeometry(2.4,0.8,6),new THREE.MeshLambertMaterial({color:0xcaa13c}));t2.position.y=0.5;anda.add(t2);
      const fig=new THREE.Mesh(new THREE.CylinderGeometry(0.25,0.4,1.8,8),new THREE.MeshLambertMaterial({color:0x4a2a6a}));fig.position.set(0,1.8,0.5);anda.add(fig);
      for(let i=0;i<14;i++){const f=new THREE.Mesh(new THREE.SphereGeometry(0.25,6,4),new THREE.MeshLambertMaterial({color:[0xe83a6a,0xf2f0ea,0xe8b830][i%3]}));f.position.set((i%2?1:-1)*1.0,1.05,-2.6+i*0.4);anda.add(f);}}
    g.add(anda);const N=56,people=new THREE.InstancedMesh(new THREE.BoxGeometry(0.42,1.6,0.3).translate(0,0.8,0),new THREE.MeshLambertMaterial({color:0xffffff}),N);g.add(people);
    const COL=i=>new THREE.Color(i<24?'#4a2a6a':i<32?'#2a2a2e':['#f2f0ea','#c83a3a','#6a3a9a','#1fa0b0','#e8e2d6'][i%5]);for(let i=0;i<N;i++)people.setColorAt(i,COL(i));
    const smoke=[];for(let i=0;i<20;i++){const s=puff(0xd8d4cc,3,0.4,false);g.add(s);smoke.push({s,ph:R()*6});}
    const o=new THREE.Object3D();let t=0,s0=0;const SPD=K.processionSpeed||1.0;
    const CAP=captions([[0,14,'Holy Week in Santiago Atitlán. Through the night the streets have been laid with alfombras: carpets of sawdust dyed in colours, in patterns, flowers and pine needles.'],
      [14,32,'The cofradías carry the anda, the great float, at a slow rocking step, and walk straight over the carpets: they are made to be walked on, once.'],
      [32,52,'Behind, the band and the incense. Somewhere in the town is Maximón, the saint in a hat with a cigar, kept by a cofradía in a different house each year; in Holy Week he is brought to the church to wait for the procession of the buried Christ.']]);
    const viewAt=s=>{const [x,z,a]=at(s+18);return [x+Math.cos(a)*9,groundH(x,z)+6,z-Math.sin(a)*9,...(()=>{const [px,pz]=at(s);return [px,groundH(px,pz)+1.5,pz];})()];};
    notice('Semana Santa','the procession in Santiago Atitlán, over the alfombras.',()=>viewAt(s0),()=>{const [x,z]=at(s0);return [x,groundH(x,z),z];});
    run((now,dt)=>{t+=dt;CAP(t);s0=Math.min(LEN,t*SPD);const [ax,az,aa]=at(s0+2);anda.position.set(ax,groundH(ax,az)+1.25+Math.sin(t*2.4)*0.06,az);anda.rotation.set(0,aa,Math.sin(t*1.2)*0.03);
      for(let i=0;i<N;i++){let s,off;if(i<24){s=s0+(i%12)*0.55-1;off=(i<12?-1.7:1.7);}else{s=s0-3-(i-24)*0.7;off=((i*7)%5-2)*0.7;}const [x,z,a]=at(s);
        o.position.set(x+Math.cos(a)*off,groundH(x,z)+Math.abs(Math.sin(t*2.4+i))*0.04,z-Math.sin(a)*off);o.rotation.set(0,a,0);o.updateMatrix();people.setMatrixAt(i,o.matrix);}
      people.instanceMatrix.needsUpdate=true;
      for(const q of smoke){const k=((t*0.4+q.ph)%3)/3,[x,z]=at(s0-2);q.s.position.set(x+Math.sin(q.ph)*1.5,groundH(x,z)+1.5+k*5,z+Math.cos(q.ph)*1.5);q.s.material.opacity=0.35*(1-k);q.s.scale.setScalar(1.5+k*4);}
      if(t>70||s0>=LEN){scene.remove(g);hideCap();return false;}return true;});}

  // ---- cohetes: rockets and bombas over a church at noon ----
  function cohetes(){const list=K.cohetes||[];if(!list.length)return;const pick=list[Math.floor(R()*list.length)],[cx,cy,cz]=ll(pick.at||pick);setH(12);
    const g=tag(new THREE.Group());scene.add(g);const shots=[];let t=0,nextShot=0;
    notice('¡Cohetes!',(pick.name||'a fiesta')+': rockets over the church.',()=>[cx+120,cy+70,cz+140,cx,cy+60,cz],()=>[cx,cy+60,cz]);
    run((now,dt)=>{t+=dt;if(t>nextShot&&t<26){nextShot=t+0.6+R()*1.6;const tr=puff(0xffffff,1.2,0.9,true);tr.position.set(cx+(R()-0.5)*10,cy+4,cz+(R()-0.5)*10);g.add(tr);shots.push({tr,v:55+R()*20,top:55+R()*40,t:0,boom:null});}
      for(const s of shots){s.t+=dt;if(!s.boom){s.tr.position.y+=s.v*dt;if(s.tr.position.y>cy+s.top){s.boom=puff(0xf2f0ea,2,0.95,false);s.boom.position.copy(s.tr.position);g.add(s.boom);const f=puff(0xffe0a0,10,1,true);f.position.copy(s.tr.position);g.add(f);s.flash=f;s.bt=0;g.remove(s.tr);}}
        else{s.bt+=dt;s.boom.scale.setScalar(2+s.bt*7);s.boom.material.opacity=Math.max(0,0.9-s.bt*0.12);if(s.flash){s.flash.material.opacity=Math.max(0,1-s.bt*6);if(s.bt>0.2){g.remove(s.flash);s.flash=null;}}}}
      if(t>36){scene.remove(g);return false;}return true;});}

  // ---- sunset behind San Pedro ----
  function sunset(){const [vx,vy,vz]=ll(K.sunsetView||[14.7395,-91.1595],0),[tx,ty,tz]=ll(K.sunsetAt||[14.6555,-91.2665],0);setH(17.2);let t=0;
    const CAP=captions([[0,16,'From Panajachel\'s shore the sun goes down behind the volcano of San Pedro, and the lake turns to copper under it.'],
      [16,32,'Aldous Huxley came in 1934 and wrote that Atitlán was Lake Como with the additional embellishment of several immense volcanoes: "It really is too much of a good thing."']]);
    notice('Sunset','the sun going down behind San Pedro.',()=>[vx,WY()+14,vz,tx,ty*0.4+WY()*0.6,tz],()=>[tx,ty,tz]);
    run((now,dt)=>{t+=dt;CAP(t);setH(17.2+Math.min(1.2,t*0.035));if(t>36){hideCap();return false;}return true;});}

  H=createHappenings(api,{events:{dawn:['Dawn',dawn],lancha:['The lancha',lancha],xocomil:['The Xocomil',xocomil],procession:['Semana Santa',procession],cohetes:['Cohetes',cohetes],sunset:['Sunset',sunset]},
    order:['lancha','cohetes','xocomil','sunset','procession','dawn'],first:K.first||40000,every:K.every||[70000,130000],
    colours:{bg:'rgba(10,18,22,.86)',fg:'#eef2ee',edge:'#1fa0b0',btn:'rgba(20,50,60,.9)',btnEdge:'#2ab0c0'}});
}
