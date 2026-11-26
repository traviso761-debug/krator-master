// ---------- what happens at Crater Lake ----------
// Every minute or two something happens, and the Events button fires any of them now (src/core/happenings.js).
//   boat      the tour boat from Cleetwood Cove, the one place a trail reaches the water, across to Wizard Island
//   oldman    the Old Man of the Lake, the hemlock trunk that has floated upright since at least 1896
//   mazama    7,700 years ago: Mount Mazama as it stood, the eruption, and the summit falling into the emptied
//             chamber; told with the Klamath people's account of it (C.craterEvents.mazama: the cone)
//   winter    the park under its snow, some 13 m a year: the ground goes white, the lake stays blue
//   sunset    the evening from the Watchman, over Wizard Island
//   stars     the night over the rim, far from any town's light
import { createHappenings } from '../core/happenings.js';

export function events(api){
  const {THREE,C,scene,groundH,P}=api;const K=C.craterEvents||{};
  const R=Math.random;
  let H=null;const run=fn=>H.run(fn),notice=(...a)=>H.notice(...a);
  const setH=h=>{const f=api.setHour||window.setHour;if(f)f(h);};
  const tag=o=>{o.traverse(q=>{q.userData.noFingerprint=true;q.userData.noWire=true;});return o;};
  const WY=()=>api.ctx.waterLevel||0.05,LK=()=>api.ctx.lake;
  const soft=(()=>{const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d'),gr=g.createRadialGradient(32,32,0,32,32,32);
    gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(0.35,'rgba(255,255,255,0.5)');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.fillRect(0,0,64,64);return new THREE.CanvasTexture(c);})();
  const puff=(col,s,op,add)=>{const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:soft,color:col,transparent:true,opacity:op,depthWrite:false,blending:add?THREE.AdditiveBlending:THREE.NormalBlending}));sp.scale.setScalar(s);return tag(sp);};
  const cap=document.createElement('div');
  cap.style.cssText='position:fixed;left:50%;bottom:70px;transform:translateX(-50%);max-width:min(660px,calc(100vw - 32px));padding:9px 14px;background:rgba(8,14,26,.82);color:#eef2f6;font:14px/1.45 Georgia,serif;border-left:3px solid #2a5ad8;display:none;z-index:11;pointer-events:none';
  document.body.appendChild(cap);
  const captions=list=>{let shown='';return t=>{let c='';for(const [a,b,text] of list)if(t>=a&&t<b)c=text;if(c!==shown){shown=c;cap.textContent=c;cap.style.display=c?'block':'none';}};};
  const hideCap=()=>{cap.style.display='none';};
  const ll=(a,dy=0)=>{const [x,z]=P(a);return [x,groundH(x,z)+dy,z];};

  // ---- the tour boat: Cleetwood Cove to Wizard Island ----
  function boat(){const L=LK();if(!L||!L.boats.length)return;setH(10.5);
    const want=K.ride||['Cleetwood Cove','Wizard Island'];let b=L.boats.find(q=>q.r.from===want[0]&&q.r.to===want[1])||L.boats[0];b.s=b.r.len*0.03;b.wait=0;let t=0;
    const CAP=captions([[0,14,'Cleetwood Cove is the one place a trail reaches the water: a mile and a tenth of switchbacks, 700 feet down the wall. The boats were brought in by helicopter and live on the lake.'],
      [14,30,'The water is so clear that a white disc lowered into it stays in sight for 30 metres or more; with no river in or out, it is rain and snow, and little else. Its blue is the blue of very deep, very clean water.'],
      [30,48,'Wizard Island ahead: a cinder cone that grew out of the floor of the caldera after it collapsed, standing 230 m out of the water, with a crater 30 m deep at its top.'],
      [48,62,'At 594 m the lake is the deepest in the United States. The bottom is a landscape of its own: more cones, lava flows, hot springs, and mats of bacteria on the floor.']]);
    const view=()=>{const q=b.q||L.boatAt(b),s=Math.sin(q.ry),c=Math.cos(q.ry);return [q.x-s*14+c*6,L.WY+4.5,q.z-c*14-s*6,q.x+s*80,L.WY+8,q.z+c*80];};
    notice('The boat tour','from Cleetwood Cove across to Wizard Island.',view,()=>{const q=b.q||L.boatAt(b);return [q.x,L.WY,q.z];});
    run((now,dt)=>{t+=dt;CAP(t);if(t>64){hideCap();return false;}return true;});}

  // ---- the Old Man of the Lake ----
  function oldman(){const O=api.ctx.oldMan;if(!O)return;setH(11);let t=0;
    const CAP=captions([[0,16,'The Old Man of the Lake: a mountain hemlock\'s trunk some nine metres long, floating upright, its top a metre out of the water, bleached white. It was first written about in 1896.'],
      [16,32,'It drifts with the wind. In 1938 a naturalist followed it for three months, and it travelled more than 60 miles round the lake.'],
      [32,46,'The stones that once lodged in its roots are thought to have held it upright until it was waterlogged enough to stay so. The boat crews say that when it is tied up, the weather turns bad.']]);
    const view=()=>{const [x,z]=O.pos();return [x+14,WY()+3.5,z+10,x,WY()+0.6,z];};
    notice('The Old Man of the Lake','the floating hemlock, upright since 1896.',view,()=>{const [x,z]=O.pos();return [x,WY(),z];});
    run((now,dt)=>{t+=dt;CAP(t);if(t>48){hideCap();return false;}return true;});}

  // ---- Mazama: the mountain, the eruption, the collapse ----
  function mazama(){const M=K.mazama||{},[cx,cz]=P(M.at||[42.941,-122.106]),wy=WY(),top=M.top||1800,r0=M.base||8500,g=tag(new THREE.Group());scene.add(g);setH(14);
    // the camera stays inside the map's bounds: from outside them the engine's horizon shows as a dome
    // the cone as it stood, its rim drawn from the caldera's own: a ghost over the lake, a little transparent
    const cone=new THREE.Mesh(new THREE.ConeGeometry(r0,top,48,1,true).translate(0,top/2,0),new THREE.MeshLambertMaterial({color:0x5a564e,transparent:true,opacity:0,side:THREE.DoubleSide,depthWrite:false}));
    cone.position.set(cx,wy+150,cz);g.add(cone);const snow=new THREE.Mesh(new THREE.ConeGeometry(r0*0.28,top*0.28,48,1,true).translate(0,top*0.86,0),new THREE.MeshLambertMaterial({color:0xf2f4f6,transparent:true,opacity:0,side:THREE.DoubleSide,depthWrite:false}));
    snow.position.copy(cone.position);g.add(snow);
    const plume=[];for(let i=0;i<220;i++){const s=puff(i%5?0x4e4842:0x6a625a,400,0,false);g.add(s);plume.push({s,u:R(),ph:R()*6,sp:0.6+R()*0.8,dx:(R()-0.5),dz:(R()-0.5)});}
    const glow=puff(0xff6a20,520,0,false);glow.position.set(cx,wy+150+top*0.98,cz);g.add(glow);let t=0;
    const CAP=captions([[0,14,'About 7,700 years ago a volcano stood here, Mount Mazama, some 3,700 m high and snow-capped: one of the Cascade peaks, like Shasta or Rainier.'],
      [14,30,'Then it erupted, among the largest eruptions in North America since the last ice age. A column of ash rose more than 40 km; the ash fell across eight of today\'s states and into Canada.'],
      [30,46,'Emptied of some 50 cubic km of magma, the top of the mountain fell into the chamber beneath it, leaving a basin 9 km across and more than a kilometre deep.'],
      [46,62,'People saw it. The Klamath tell of Llao, the spirit of the world below, who stood on the mountain, and Skell, the spirit of the world above; they fought, and Llao was driven back down under the mountain, which fell in on him.'],
      [62,78,'Over the centuries rain and snow filled the basin. There is no river in or out; the lake holds steady where what falls on it is matched by what evaporates and seeps away.']]);
    notice('Mount Mazama','7,700 years ago: the mountain, the eruption and the collapse.',()=>[cx+5500,wy+1300,cz+7000,cx,wy+1300,cz],()=>[cx,wy+800,cz]);
    run((now,dt)=>{t+=dt;CAP(t);
      const show=t<14?Math.min(1,t/5):t<34?1:Math.max(0,1-(t-34)/10);cone.material.opacity=0.85*show;snow.material.opacity=0.92*show;cone.position.y=wy+150-(t>32?Math.min(1,(t-32)/12)*top*0.7:0);snow.position.y=cone.position.y;
      const erupt=t>14&&t<46?Math.min(1,(t-14)/4)*(t>40?Math.max(0,1-(t-40)/6):1):0;glow.material.opacity=erupt*0.8;glow.position.y=cone.position.y+top*0.98;
      for(const p of plume){const k=((t*0.06*p.sp+p.u)%1),h=k*(top+16000),spread=200+k*5000;p.s.position.set(cx+p.dx*spread,wy+top*0.9+h,cz+p.dz*spread);p.s.scale.setScalar(1600+k*7000);p.s.material.opacity=erupt*0.75*Math.pow(1-k,1.6);}
      if(t>14&&t<46)setH(14-Math.min(4,(t-14)*0.4)*erupt);else if(t>=46)setH(Math.min(14,10+(t-46)*0.5));
      if(t>80){scene.remove(g);hideCap();setH(14);return false;}return true;});}

  // ---- winter ----
  function winter(){const G=api.ctx.ground;if(!G)return;const [vx,vy,vz]=ll(K.winterView||[42.9095,-122.1385],0);setH(12);let t=0;
    const CAP=captions([[0,16,'Crater Lake is one of the snowiest places in America that people live through the winter: about 13 m of snow a year, and drifts on the rim deep enough to bury the lodge\'s first floor.'],
      [16,32,'The lodge closes; the road round the rim closes; the park headquarters stays open, and people come up on snowshoes and skis.'],
      [32,48,'The lake almost never freezes. It holds so much water, warmed in the summer, that the cold cannot take the heat out of it fast enough. It last froze over in 1949.']]);
    notice('Winter','the park under its snow, the lake still blue.',()=>[vx,vy+40,vz-60,vx+600,WY(),vz+2200],()=>[vx,vy,vz]);
    G.winter(1);run((now,dt)=>{t+=dt;CAP(t);if(t>50){G.winter(0);hideCap();return false;}return true;});}

  // ---- sunset from the Watchman ----
  function sunset(){const [vx,vy,vz]=ll(K.sunsetView||[42.94295,-122.17246],0),[tx,ty,tz]=ll(K.sunsetAt||[42.9395,-122.1462],0);setH(18.6);let t=0;
    const CAP=captions([[0,16,'From the Watchman the whole lake lies under you, and Wizard Island almost below. The lookout on the summit was built in 1932 to watch for fires, and is still kept.'],
      [16,32,'In the evening the inner wall to the east catches the last light, grey and pink and rust: the layers of lava and ash the old mountain was built of, cut through by the collapse.']]);
    notice('Sunset','the evening from the Watchman, over Wizard Island.',()=>[vx,vy+16,vz,tx,WY()+40,tz],()=>[tx,ty,tz]);   // over the lookout's roof, above the trees
    run((now,dt)=>{t+=dt;CAP(t);setH(18.6+Math.min(1.3,t*0.04));if(t>36){hideCap();return false;}return true;});}

  // ---- the night: the stars over the rim ----
  function stars(){const [vx,vy,vz]=ll(K.starsView||[42.9105,-122.1440],0);setH(23.3);let t=0;const g=tag(new THREE.Group());scene.add(g);
    // the Milky Way: a band of faint stars across the sky, over whatever stars the sky already has
    const N=2600,pos=new Float32Array(N*3);for(let i=0;i<N;i++){const band=i<N*0.6,a=R()*Math.PI*2,e=band?(R()-0.5)*0.35:Math.asin(R()*2-1);
      const v=new THREE.Vector3(Math.cos(a)*Math.cos(e),Math.sin(e),Math.sin(a)*Math.cos(e)).applyAxisAngle(new THREE.Vector3(1,0,0.4).normalize(),1.1);if(v.y<0.02)v.y=-v.y+0.02;
      pos.set([vx+v.x*18000,vy+v.y*18000,vz+v.z*18000],i*3);}
    const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(pos,3));
    const pts=new THREE.Points(geo,new THREE.PointsMaterial({color:0xdfe8ff,size:1.6,sizeAttenuation:false,transparent:true,opacity:0,fog:false,depthWrite:false}));g.add(pts);
    const CAP=captions([[0,16,'Far from any town, the park is one of the darkest places left in the country: on a clear night the Milky Way stands over the rim, and the lake gives the stars back.'],
      [16,30,'At 1,883 m, in the thin dry air of the Cascades in summer, the stars hardly twinkle.']]);
    notice('The night sky','the stars over the rim.',()=>[vx,vy+4,vz,vx+800,vy+900,vz+2400],()=>[vx,vy,vz]);
    run((now,dt)=>{t+=dt;CAP(t);pts.material.opacity=Math.min(0.9,t/5)*(t>30?Math.max(0,1-(t-30)/4):1);if(t>34){scene.remove(g);hideCap();setH(10);return false;}return true;});}

  H=createHappenings(api,{events:{boat:['The boat tour',boat],oldman:['The Old Man of the Lake',oldman],mazama:['Mount Mazama',mazama],winter:['Winter',winter],sunset:['Sunset',sunset],stars:['The night sky',stars]},
    order:['boat','oldman','sunset','mazama','winter','stars'],first:K.first||40000,every:K.every||[70000,130000],
    colours:{bg:'rgba(8,14,26,.86)',fg:'#eef2f6',edge:'#2a5ad8',btn:'rgba(20,34,70,.9)',btnEdge:'#3a6ae8'}});
}
