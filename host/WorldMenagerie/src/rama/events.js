// ---------- Rama: what happens ----------
// The novel as ten scenes, each one a few dozen seconds long, played from the Events panel or from the address
// (#event=dawn). Each sets the world to where the story had got to - dark or lit, ice or water - puts the
// camera where the scene is best seen, and plays its own motion under captions. "Play the story" runs the ten in
// order. Times are compressed: the Dragonfly's flight took hours, the thaw days.
//
//   rendezvous   Endeavour comes in along the axis, matches the four-minute spin and docks at the hub
//   dark         through the airlock into total darkness; flares falling away down the Northern Bowl
//   dawn         at Camp Alpha, the six Straight Valleys light, one after another
//   thaw         the Sea's ice breaks up; cloud gathers toward the axis; the storm
//   lightning    Jimmy Pak flies the Dragonfly down the axis; the horns discharge; he comes down
//   crab         a crab biot dismantles the wreck; the flower; the jump from the southern cliff
//   wave         Rama changes course and the Sea is thrown south; Resolution rides it; the sharks
//   spiders      the three-legged spiders inspect Camp Alpha
//   missile      the Hermian missile, and Rodrigo
//   departure    the suns go down, Endeavour casts off, and Rama goes on its way
import {mkRng} from '../core/rng.js';

export function makeEvents(api,O){
  const {THREE,scene,animHooks}=api;
  const {G,S,LS,IN,spinAt}=O;
  const TAU=Math.PI*2;

  // ---------- Endeavour ----------
  // A survey ship of about 150 m: a long hull with the docking collar forward, drop tanks, two pairs of
  // radiators and the drive aft, and the floodlights it shone into the hub. Built along +y with its nose at -y,
  // so that docked at the north hub it points at it.
  const P=(c,o)=>new THREE.MeshPhongMaterial(Object.assign({color:c,specular:0x333333,shininess:20,flatShading:true},o||{}));
  const lit=c=>new THREE.MeshBasicMaterial({color:c});
  const endeavour=new THREE.Group();
  {const white=P(0xd8d8d4),grey=P(0x8a8c90),dark=P(0x3a3c40),rad=P(0x3a5070,{side:THREE.DoubleSide,shininess:60}),gold=P(0xb89a50);
    const lathe=(prof,mat,seg)=>new THREE.Mesh(new THREE.LatheGeometry(prof.map(([r,y])=>new THREE.Vector2(r,y)),seg||24),mat);
    endeavour.add(lathe([[0.1,-78],[6,-76],[7,-70],[9,-66],[9,40],[12,46],[12,58],[8,64],[0.1,66]],white));
    endeavour.add(lathe([[7,-82],[9,-80],[9,-74],[7,-72]],grey));                          // the docking collar
    endeavour.add(lathe([[4,64],[9,72],[16,86],[16.5,88]],dark,20));                         // the drive's bell
    for(const sd of [-1,1]){const t=new THREE.Mesh(new THREE.CylinderGeometry(5,5,40,14),gold);t.position.set(sd*15,10,0);endeavour.add(t);}
    for(let k=0;k<4;k++){const a=k*TAU/4+TAU/8,r=new THREE.Mesh(new THREE.BoxGeometry(46,30,0.6),rad);r.position.set(Math.cos(a)*32,24,Math.sin(a)*32);r.rotation.y=-a;endeavour.add(r);}
    const mast=new THREE.Mesh(new THREE.CylinderGeometry(0.6,0.6,26,6),grey);mast.position.set(0,-30,10);mast.rotation.x=Math.PI/2;endeavour.add(mast);
    const dish=new THREE.Mesh(new THREE.SphereGeometry(7,16,8,0,TAU,0,Math.PI/2.4),white);dish.position.set(0,-30,23);dish.rotation.x=-Math.PI/2;endeavour.add(dish);
    for(const [x,z,c] of [[9.3,0,0xff3a2a],[-9.3,0,0x3aff6a],[0,9.3,0xffffff]]){const b=new THREE.Mesh(new THREE.SphereGeometry(0.9,8,6),lit(c));b.position.set(x,-60,z);endeavour.add(b);}
    // its floodlights, aimed into the hub
    const glowT=IN.soft;for(const sd of [-1,1]){const s=new THREE.Sprite(new THREE.SpriteMaterial({map:glowT,color:0xfff2d0,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false}));s.position.set(sd*8,-80,0);s.scale.setScalar(26);endeavour.add(s);}}
  endeavour.traverse(o=>{o.userData.noWire=true;});
  endeavour.userData.info={name:'Endeavour',info:'The solar survey ship, Commander William Norton: the only ship close enough to reach Rama before it swung round the Sun. About 150 m long in this model. Docked at the hub, on the axis, it turns with Rama once every four minutes.'};
  G.add(endeavour);O.pick.push(endeavour);
  const DOCK=S.L2+222+82;
  const E={y:DOCK,docked:true,roll:0};
  animHooks.push(now=>{endeavour.position.set(0,E.y,0);endeavour.rotation.set(0,E.docked?spinAt(now):E.roll,0);});

  // ---------- the missile and Rodrigo's scooter ----------
  const missile=new THREE.Group();
  {const body=new THREE.Mesh(new THREE.CylinderGeometry(1.1,1.1,16,12),P(0xc8c4bc));missile.add(body);
    const nose=new THREE.Mesh(new THREE.ConeGeometry(1.1,4,12),P(0x8a2a22));nose.position.y=10;missile.add(nose);
    for(let k=0;k<3;k++){const f=new THREE.Mesh(new THREE.BoxGeometry(0.2,4,3),P(0x6a6a6a));const a=k*TAU/3;f.position.set(Math.cos(a)*1.4,-6,Math.sin(a)*1.4);f.rotation.y=-a;missile.add(f);}
    const flame=new THREE.Sprite(new THREE.SpriteMaterial({map:IN.soft,color:0xbfd8ff,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false}));flame.position.y=-11;flame.scale.setScalar(40);missile.add(flame);missile.userData.flame=flame;}
  missile.scale.setScalar(5);          // drawn five times life size, or from kilometres off it is not there at all
  missile.visible=false;missile.traverse(o=>{o.userData.noWire=true;});scene.add(missile);
  const scooter=new THREE.Group();{const b=new THREE.Mesh(new THREE.BoxGeometry(2,1,3),P(0xe8e4dc));scooter.add(b);const l=new THREE.Sprite(new THREE.SpriteMaterial({map:IN.soft,color:0xffe0a0,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false}));l.scale.setScalar(30);scooter.add(l);}
  scooter.visible=false;scooter.traverse(o=>{o.userData.noWire=true;});scene.add(scooter);

  // ---------- things inside ----------
  // Small, so baked like everything else in there and multiplied by Rama's light (IN.vM).
  const make=(build)=>{const b=IN.Batch();build((geo,M,c,amb)=>b.add(geo,M||new THREE.Matrix4(),new THREE.Color(c),amb===undefined?0.55:amb));const g=new THREE.Group();g.add(b.mesh(IN.vM()));g.traverse(o=>{o.userData.noWire=true;});g.visible=false;IN.group.add(g);return g;};
  const T=(x,y,z)=>new THREE.Matrix4().makeTranslation(x,y,z);
  const TR=(x,y,z,rx,ry,rz)=>new THREE.Matrix4().compose(new THREE.Vector3(x,y,z),new THREE.Quaternion().setFromEuler(new THREE.Euler(rx||0,ry||0,rz||0)),new THREE.Vector3(1,1,1));
  // the Dragonfly: a pedalled frame, a seat, and long wings either side - enormous next to the rider
  const dragonfly=make(add=>{add(new THREE.BoxGeometry(0.3,0.3,4),T(0,0,0),'#d8d4c8');add(new THREE.BoxGeometry(0.6,1.2,0.6),T(0,0.7,0.3),'#c84a30');
    add(new THREE.SphereGeometry(0.22,8,6),T(0,1.5,0.3),'#e8c8a8');
    for(const sd of [-1,1]){add(new THREE.BoxGeometry(5.5,0.04,1.4),TR(sd*3,0.4,-0.6,0,sd*0.08,sd*0.06),'#e8f0f4',0.8);add(new THREE.BoxGeometry(4,0.04,1),TR(sd*2.3,0.4,1.3,0,-sd*0.1,sd*0.06),'#e8f0f4',0.8);}
    add(new THREE.CylinderGeometry(0.6,0.6,0.08,12).rotateZ(Math.PI/2),T(0,0.2,-2.2),'#9aa0a6');});
  dragonfly.scale.setScalar(3);           // seen from a hundred metres it would be a speck; it is drawn three times life size
  // the wreck: the same parts, broken and lying flat
  const wreck=make(add=>{add(new THREE.BoxGeometry(0.3,0.3,4),TR(0,0.2,0,0,0.6,0),'#d8d4c8');for(let k=0;k<5;k++)add(new THREE.BoxGeometry(2+k*0.4,0.05,1.2),TR(Math.sin(k*2.1)*3,0.1,Math.cos(k*1.7)*3,0,k,0.1),'#e8f0f4',0.8);
    add(new THREE.CylinderGeometry(0.6,0.6,0.08,12),T(1.5,0.1,1),'#9aa0a6');});
  // a crab biot: a flat body a couple of metres across, six legs, two claws, a turret of three eyes
  const crabOf=()=>make(add=>{add(new THREE.CylinderGeometry(1.2,1.4,0.6,6),T(0,0.9,0),'#8a4a32');add(new THREE.CylinderGeometry(0.25,0.25,0.5,3),T(0,1.4,0),'#3a3030');
    for(let k=0;k<3;k++){const a=k*TAU/3;add(new THREE.SphereGeometry(0.12,6,4),T(Math.cos(a)*0.2,1.7,Math.sin(a)*0.2),'#e8e0a0',1);}
    for(let k=0;k<6;k++){const a=(k+0.5)*TAU/6;add(new THREE.BoxGeometry(1.4,0.12,0.12),TR(Math.cos(a)*1.6,0.6,Math.sin(a)*1.6,0,-a,-0.6),'#6a3a28');}
    for(const sd of [-1,1])add(new THREE.BoxGeometry(0.3,0.3,1.2),T(sd*0.6,0.9,1.6),'#a85a3a');});
  const crabs=[crabOf(),crabOf()];
  // a spider biot: a small ball on three long thin legs, three eyes
  const spiderOf=()=>make(add=>{add(new THREE.SphereGeometry(0.35,10,8),T(0,1.6,0),'#2e2c2a');for(let k=0;k<3;k++){const a=k*TAU/3;
      add(new THREE.CylinderGeometry(0.03,0.04,2.1,4),TR(Math.cos(a)*0.55,0.85,Math.sin(a)*0.55,Math.sin(a)*0.45,0,-Math.cos(a)*0.45),'#4a4642');
      add(new THREE.SphereGeometry(0.07,6,4),T(Math.cos(a+1)*0.3,1.75,Math.sin(a+1)*0.3),'#d8f0ff',1);}});
  const spiders=[0,1,2,3,4].map(spiderOf);spiders.forEach(s=>s.scale.setScalar(1.6));
  // the sharks' fins
  const fins=[0,1].map(()=>make(add=>{add(new THREE.CylinderGeometry(0.01,1.4,2.6,3).scale(0.25,1,1),T(0,1.0,0),'#2a3a40');}));
  // the raft Resolution: a deck of floats, a cabin, a mast, Barnes at the helm
  const raft=make(add=>{add(new THREE.BoxGeometry(5,0.6,9),T(0,0.3,0),'#c8b48a');for(const sd of [-1,1])add(new THREE.CylinderGeometry(0.6,0.6,9,10).rotateX(Math.PI/2),T(sd*2.4,0,0),'#e8e4d8');
    add(new THREE.BoxGeometry(2.4,1.8,2.4),T(0,1.5,-1.5),'#e8e8e0');add(new THREE.CylinderGeometry(0.08,0.08,7,5),T(0,4,1),'#9a9a96');
    add(new THREE.BoxGeometry(0.5,1.7,0.5),T(0,1.45,3),'#3a5a8a');add(new THREE.SphereGeometry(0.2,8,6),T(0,2.5,3),'#e8c8a8');});
  raft.scale.setScalar(2);
  // Jimmy, standing, for the jump; and the flower
  const jimmy=make(add=>{add(new THREE.BoxGeometry(0.5,1.1,0.3),T(0,1.1,0),'#c84a30');add(new THREE.BoxGeometry(0.4,0.8,0.25),T(0,0.4,0),'#3a3a40');add(new THREE.SphereGeometry(0.15,8,6),T(0,1.85,0),'#e8c8a8');});
  jimmy.scale.setScalar(3);
  const flower=make(add=>{add(new THREE.CylinderGeometry(0.02,0.02,0.6,4),T(0,0.3,0),'#4a7a3a');for(let k=0;k<3;k++){const a=k*TAU/3;add(new THREE.BoxGeometry(0.06,0.02,0.22),TR(Math.cos(a)*0.1,0.62,Math.sin(a)*0.1,0,-a+Math.PI/2,0),'#8a5ad8',1);}
    add(new THREE.SphereGeometry(0.05,6,4),T(0,0.64,0),'#ffe060',1);});
  flower.scale.setScalar(6);
  const SITE={a:0.55,y:-9000};      // where the Dragonfly comes down
  const rest=()=>{for(const g of [dragonfly,wreck,...crabs,...spiders,...fins,jimmy])g.visible=false;
    raft.visible=true;IN.orient(raft,S.NYA+0.02,S.SH-140,S.SEA,0);flower.visible=true;IN.orient(flower,SITE.a+0.0016,SITE.y-30,S.RS,0);};
  rest();

  // ---------- the captions and the panel ----------
  const cap=document.createElement('div');cap.id='ramacaption';
  cap.style.cssText='position:fixed;left:50%;bottom:64px;transform:translateX(-50%);max-width:min(680px,calc(100vw - 32px));padding:10px 16px;background:rgba(10,11,14,.78);color:#f0e6cc;font:15px/1.45 Georgia,serif;border-left:3px solid #e8c98a;display:none;z-index:7;pointer-events:none';
  document.body.appendChild(cap);
  const panel=document.createElement('div');panel.id='ramaevents';
  panel.style.cssText='position:fixed;left:10px;top:46px;display:none;flex-direction:column;gap:3px;z-index:6;font:12px Helvetica,Arial,sans-serif;max-width:min(300px,calc(100vw - 32px));max-height:calc(100vh - 140px);overflow:auto';
  document.body.appendChild(panel);

  // ---------- helpers for the scenes ----------
  const ease=t=>t<0?0:t>1?1:t*t*(3-2*t);
  const span=(t,a,b)=>ease((t-a)/(b-a));
  const state=o=>{Object.assign(LS,{sun:1,ice:0,cloud:0.35,lightning:0,sunEach:null},o);};
  // turn the walker to look at a point in Rama's frame
  const lookAt=(W,p)=>{const r=Math.max(25,S.ground(W.y,W.a)-W.h),ex=Math.cos(W.a)*r,ez=Math.sin(W.a)*r;
    const dx=p.x-ex,dy=p.y-W.y,dz=p.z-ez,L=Math.hypot(dx,dy,dz)||1;
    const rd=(-Math.sin(W.a)*dx+Math.cos(W.a)*dz)/L,up=(-(Math.cos(W.a)*dx+Math.sin(W.a)*dz))/L;
    W.yaw=Math.atan2(rd,dy/L);W.pitch=Math.asin(Math.max(-1,Math.min(1,up)));};
  const P3=(a,y,r)=>new THREE.Vector3(Math.cos(a)*r,y,Math.sin(a)*r);
  const outside=v=>{if(IN.active())IN.exit();O.setCut(false);api.view(v);};
  const inside=start=>{O.setCut(false);IN.enter(start);};

  // ---------- the scenes ----------
  const EVS=[
    {id:'rendezvous',name:'Rendezvous',blurb:'Endeavour comes in along the axis and docks at the hub.',dur:36,
      start(){state({sun:0,ice:1,cloud:0});E.docked=false;E.y=DOCK+9000;outside({az:0.75,el:0.3,d:3600,tx:S.L2+1600,ty:0,tz:0});},
      tick(t,now){E.y=DOCK+9000*(1-ease(Math.min(1,t/26)));E.roll=spinAt(now)*span(t,12,24)+0.6*(1-span(t,12,24));if(t>=26)E.docked=true;},
      caps:[[0,'2131. Spaceguard\'s radar finds object 31/439 falling in toward the Sun. It is fifty kilometres long, it turns once every four minutes, and it is not an asteroid. They name it Rama.'],
        [9,'The survey ship Endeavour, Commander Norton, is the only ship that can reach it in time.'],
        [16,'Rama has no lights, no ports and no antennas. Only the hub, on the axis, turns slowly enough to land on. Endeavour matches its spin.'],
        [26,'And docks. The airlock doors open from outside, with a wheel.']]},
    {id:'dark',name:'Into the dark',blurb:'Through the airlock into blackness; flares falling down the Northern Bowl.',dur:32,
      start(){state({sun:0,ice:1,cloud:0});inside({y:S.HUBY-200,a:S.STAIRS[0].a,r:200,yaw:Math.PI,pitch:-0.42});},
      tick(t,now){for(const [k,at] of [[0,3],[1,8],[2,13],[3,19]])if(t>=at&&!this['f'+k]){this['f'+k]=1;IN.fireFlare(now,k);}},
      reset(){for(let k=0;k<4;k++)this['f'+k]=0;},
      caps:[[0,'Through the triple airlock, into the hub. Beyond it, total darkness - and air: cold, thin, breathable.'],
        [5,'A flare falls slowly away from the hub. Its light finds a ladder, then a stairway, going down and down to a curving plain eight kilometres below.'],
        [14,'Three stairways, a third of the way round from each other: they name them Alpha, Beta and Gamma. At the top there is no weight at all. At the bottom, six-tenths of a gravity.'],
        [23,'Below, a band of white rings the whole world: a sea, frozen. And in it an island of towers.']]},
    {id:'dawn',name:'The Dawn',blurb:'At Camp Alpha, the six Straight Valleys light one after another.',dur:26,
      start(){state({sun:0,ice:1,cloud:0,sunEach:[0,0,0,0,0,0]});inside({y:S.PE-260,a:S.STAIRS[0].a+0.0006,h:1.7,yaw:Math.PI,pitch:0.32});},
      tick(t){if(t>8.5){LS.sunEach=null;LS.sun=1;return;}if(!LS.sunEach)LS.sunEach=[0,0,0,0,0,0];const at=[4,4.5,5,6.4,6.9,7.4];let sum=0;for(let i=0;i<6;i++){const v=span(t,at[i],at[i]+0.35);if(v>0&&!this['s'+i]){this['s'+i]=1;LS.flash=Math.max(LS.flash,0.7);}LS.sunEach[i]=v;sum+=v;}
        LS.sun=sum/6;},
      reset(){for(let i=0;i<6;i++)this['s'+i]=0;},
      caps:[[0,'Camp Alpha, at the foot of the stairway. Still dark.'],[4,'Then, without any warning: the Dawn.'],
        [9,'Six lines of light, three to each plain, running the length of the world. The Straight Valleys were never canals. They are Rama\'s suns.'],
        [16,'For the first time the crew see the whole of Rama at once: the plains curving up on either side to meet overhead, the cities, the Sea, and at the far end, the horns.']]},
    {id:'thaw',name:'The thaw and the storm',blurb:'The Sea breaks up; cloud gathers toward the axis.',dur:32,
      start(){state({sun:1,ice:1,cloud:0});inside({y:S.SH+40,a:S.NYA+0.07,h:1.7,yaw:Math.PI,pitch:0.14});},
      tick(t){LS.ice=1-span(t,4,20);LS.cloud=span(t,8,20)*(1-0.55*span(t,24,31));},
      caps:[[0,'Rama is falling toward the Sun, and inside the air is warming.'],[6,'The ice of the Sea breaks up, groaning and cracking, and turns to open water.'],
        [13,'Warm air rising toward the axis makes cloud, and Norton fears a hurricane: everyone back up the stairways.'],
        [23,'The storm blows itself out. The Sea is open water - a soup of organic compounds, alive with microorganisms - and New York stands in the middle of it.']]},
    {id:'lightning',name:'Dragonfly and the lightning',blurb:'Jimmy Pak flies down the axis toward the horns.',dur:48,
      start(){state({});dragonfly.visible=true;dragonfly.scale.setScalar(3);
        inside({y:S.HUBY-1300,a:SITE.a,r:400,yaw:Math.PI,pitch:-0.1});IN.follow((now,W)=>{const t=this.t;const p=dfPos(t);
          if(t<31){W.y=p.y+90;W.a=p.a+0.00;W.h=S.ground(W.y,W.a)-(p.r-28);lookAt(W,P3(p.a,p.y-200,p.r));}
          else{W.y=-12600;W.a=SITE.a+0.06;W.h=S.ground(W.y,W.a)-1250;lookAt(W,P3(p.a,p.y,p.r));}});},
      tick(t,now){const p=dfPos(t);IN.orient(dragonfly,p.a,p.y,p.r,Math.PI+(t>31?(t-31)*2.2:0),t>31?-0.6:0);
        if(t>31)dragonfly.scale.set(3,3*(1-0.5*span(t,31,33)),3*(1-0.4*span(t,31,33)));
        LS.lightning=t<24?0:t<31?0.3:t<34?1:t<44?0.4:0;if(t>=31&&!this.hit){this.hit=1;IN.strike(now);LS.flash=1.2;}
        if(t>44.5){dragonfly.visible=false;wreck.visible=true;IN.orient(wreck,SITE.a,SITE.y,S.RS,0.7);}},
      reset(){this.hit=0;},
      caps:[[0,'Jimmy Pak brought a sky-bike aboard, logged as sports equipment: the Dragonfly, a pedalled frame with wings of a few grams to the square metre.'],
        [7,'At the axis there is no weight at all, and there is air: he can fly the length of the world. (The flight is shortened here: it took him hours.)'],
        [15,'Over the Sea and New York, the first person ever to see the south of Rama close.'],
        [24,'At the south pole the horns are charging. The air crackles and his hair stands up.'],
        [31,'Lightning, between the horns. The shock wave crumples the Dragonfly\'s wings.'],
        [38,'He comes down on the Southern Plain, alive - on the wrong side of a five-hundred-metre cliff, with no way back.']]},
    {id:'crab',name:'The crab, the flower and the jump',blurb:'A crab biot tidies the wreck away; Jimmy jumps from the southern cliff.',dur:40,
      start(){state({});wreck.visible=true;IN.orient(wreck,SITE.a,SITE.y,S.RS,0.7);crabs.forEach(c=>c.visible=true);IN.orient(raft,SITE.a,-S.SH+140,S.SEA,0);
        inside({y:SITE.y-14,a:SITE.a+26/S.RS,h:1.7,yaw:-Math.PI/2,pitch:-0.08});},
      tick(t){// the crabs walk in, take the wreck apart, and carry it off north to the cliff
        for(let i=0;i<2;i++){const c=crabs[i],ph=i*1.4;let a,y,head;
          if(t<9){const u=span(t,0,9);a=SITE.a-(160-150*u)/S.RS+i*5/S.RS;y=SITE.y-20+i*8;head=Math.PI/2;}
          else if(t<17){a=SITE.a-(10-3*Math.sin(t*2+ph))/S.RS+i*5/S.RS;y=SITE.y-10+i*8+2*Math.sin(t*1.7+ph);head=Math.PI/2+0.3*Math.sin(t*3+ph);}
          else{const u=span(t,17,30);a=SITE.a-7/S.RS+i*5/S.RS;y=SITE.y-2+i*8+u*400;head=0;}
          IN.orient(c,a,y,S.RS,head);c.visible=t<30;}
        if(t>=10&&t<17)wreck.scale.setScalar(1-span(t,10,17)*0.95);if(t>=17)wreck.visible=false;
        // the flower, then the cliff and the jump
        if(t>=15&&t<22&&!this.fl){this.fl=1;IN.W.yaw=-Math.PI*0.6;const W=IN.W;lookAt(W,P3(SITE.a+0.0016,SITE.y-30,S.RS));}
        if(t>=22&&!this.cl){this.cl=1;IN.enter({y:-S.SH-18,a:SITE.a+30/S.RS,h:1.7,yaw:0,pitch:-0.5});jimmy.visible=true;}
        if(t>=22){const u=Math.max(0,t-26),y=-S.SH-6+Math.min(1,u/0.6)*30,fall=Math.min(500,0.5*4.4*u*u*1.6),r=S.RS+(u>0.5?fall:0);
          IN.orient(jimmy,SITE.a,y,Math.min(S.SEA,r),0,u>0.5?0.4:0);if(r>=S.SEA)jimmy.visible=t<38;lookAt(IN.W,P3(SITE.a,y+40,Math.min(S.SEA,r)));}},
      reset(){this.fl=0;this.cl=0;wreck.scale.setScalar(1);},
      caps:[[0,'Something is crossing the Southern Plain toward the wreck: a thing like a crab, a couple of metres across, walking on six legs.'],
        [9,'It takes the Dragonfly apart, neatly, piece by piece, and carries the pieces away. It is not hostile. It is tidying up.'],
        [15,'Waiting for rescue, Jimmy finds a flower growing between the tiles: three petals, and the only thing in Rama that looks as if it grew by itself.'],
        [22,'The raft Resolution is waiting below the southern cliff. Five hundred metres, at about half a gravity, into water.'],
        [27,'He jumps.']]},
    {id:'wave',name:'The wave',blurb:'Rama changes course; the Sea surges south; Resolution rides it.',dur:40,
      start(){state({cloud:0.2});fins.forEach(f=>f.visible=true);raft.visible=true;
        inside({y:-2500,a:SITE.a,h:0,yaw:0,pitch:0.05});IN.follow((now,W)=>{const t=this.t,y=raftY(t);W.y=y+10;W.a=SITE.a;W.h=6+waveAt(SITE.a,y+10,t);W.yaw=0;W.pitch=0.04+0.08*Math.sin(t*0.9);});},
      tick(t,now){IN.setWave((a,y)=>waveAt(a,y,t));const y=raftY(t),h=waveAt(SITE.a,y,t);IN.orient(raft,SITE.a,y,S.SEA-h,0,(waveAt(SITE.a,y+20,t)-waveAt(SITE.a,y-20,t))/40);
        for(let i=0;i<2;i++){const ang=t*0.5+i*Math.PI,ra=SITE.a+Math.cos(ang)*40/S.SEA,ry=y+Math.sin(ang)*40;IN.orient(fins[i],ra,ry,S.SEA-waveAt(ra,ry,t),ang+Math.PI/2);fins[i].visible=t>24;}},
      end(){IN.setWave(null);},
      caps:[[0,'Out on the Sea, aboard Resolution, Sergeant Barnes at the helm.'],[5,'Rama changes course: a gentle push toward its north pole. The whole Sea is thrown south.'],
        [11,'A wall of water comes down the Sea toward them. Barnes turns the raft into it.'],[20,'It breaks against the southern cliff - which is what the cliff is for - and comes back, smaller.'],
        [27,'Things are swimming round the raft: the Sea\'s biots, the crew call them sharks.']]},
    {id:'spiders',name:'The spiders',blurb:'Three-legged biots come to look at Camp Alpha.',dur:30,
      start(){state({});spiders.forEach(s=>s.visible=true);inside({y:S.PE-200,a:S.STAIRS[0].a-0.0016,h:1.7,yaw:Math.PI*0.75,pitch:-0.05});},
      tick(t){const R=mkRng(77);for(let i=0;i<spiders.length;i++){const ph=R()*TAU,sp=0.6+R()*0.5,cx=S.STAIRS[0].a+(R()-0.5)*0.008,cy=S.PE-160+(R()-0.5)*80;
          const u=t*sp+ph,jit=Math.floor(t*3+i)%3===0?0:1;const a=cx+Math.cos(u)*28/S.RI*jit+Math.sin(u*2.3)*8/S.RI,y=cy+Math.sin(u)*30+Math.cos(u*1.7)*10;
          IN.orient(spiders[i],a,y,S.RI,u+Math.PI/2);spiders[i].visible=t>2+i*0.8;}},
      caps:[[0,'Camp Alpha. Rama\'s creatures have come to look at the visitors.'],[5,'Spiders: three long legs, three eyes on a small round body, as fast as a running man. They examine everything, and touch nothing.'],
        [14,'Surgeon-Commander Laura Ernst dissects one that died: it is part animal, part machine, grown for a job. The crew call them biots.'],
        [22,'None of them pays the crew the least attention.']]},
    {id:'missile',name:'The missile',blurb:'Mercury launches a nuclear missile; Rodrigo goes out to meet it.',dur:34,
      start(){state({});missile.visible=true;scooter.visible=false;const {dir,hub,stop}=missileWay(),mid=hub.clone().lerp(stop,0.6);
        outside({az:Math.atan2(dir.z,dir.x)+1.25,el:0.3,d:9000,tx:mid.x,ty:mid.y,tz:mid.z});},
      tick(t){// in from sunward, slowing, stopping 6 km off the hub
        const {dir,hub,stop,far}=missileWay();
        const u=1-Math.pow(1-Math.min(1,t/16),2.4);missile.position.lerpVectors(far,stop,u);
        if(t>24){missile.position.addScaledVector(dir.clone().cross(new THREE.Vector3(0,1,0)).normalize(),(t-24)*30);missile.rotation.z+=0.004;missile.rotation.x+=0.002;}
        else missile.lookAt(hub),missile.rotateX(Math.PI/2);
        missile.userData.flame.visible=t<16;
        scooter.visible=t>7&&t<30;if(scooter.visible){const v=span(t,7,16);scooter.position.lerpVectors(hub,stop.clone().addScaledVector(dir,-30),v);}},
      end(){missile.visible=false;scooter.visible=false;},
      caps:[[0,'The Hermians, the colonists of Mercury, decide Rama is a danger to the inner planets. They launch a missile with a nuclear warhead at it.'],
        [7,'Lieutenant Boris Rodrigo goes out on Endeavour\'s scooter to meet it. The radio lag from Mercury gives him minutes before anyone there can stop him.'],
        [16,'He reaches it, and cuts its firing circuits by hand.'],
        [24,'The missile drifts away, harmless. Rama never notices it was there.']]},
    {id:'departure',name:'Departure',blurb:'The suns go down, Endeavour casts off, and Rama leaves.',dur:46,
      start(){state({});G.position.set(0,0,0);inside({y:S.HUBY-300,a:S.STAIRS[0].a,r:260,yaw:Math.PI,pitch:-0.3});},
      tick(t,now){LS.sun=1-span(t,2,12)*0.97;
        if(t>=14&&!this.out){this.out=1;outside({az:2.6,el:0.25,d:62000,tx:0,ty:0,tz:0});E.docked=false;E.roll=spinAt(now);}
        if(t>=22){const u=t-22;G.position.x=0.5*900*u*u;}
        // Endeavour backs off in the world's frame, not Rama's: it does not go where Rama goes
        if(t>=14)E.y=DOCK+Math.pow(Math.max(0,t-15),2)*40-G.position.x;},
      reset(){this.out=0;},
      end(){G.position.set(0,0,0);E.y=DOCK;E.docked=true;state({});},
      caps:[[0,'The crew climb the stairways for the last time. Behind them, the suns are going down.'],[7,'The biots walk into the Sea, to be taken apart and used again. Rama is tidying itself away.'],
        [14,'Endeavour casts off.'],[21,'Rama swings past the Sun, takes what it came for, and sets off for the Large Magellanic Cloud. It never noticed them at all.'],
        [34,'"The Ramans do everything in threes."']]},
  ];
  // the Dragonfly's flight, in Rama's frame: down the axis, out toward the horns, struck, and falling to the plain
  function dfPos(t){
    if(t<31){const u=ease(t/31);return {a:SITE.a,y:S.HUBY-1300+(-12800-(S.HUBY-1300))*u,r:380+1100*span(t,18,31)};}
    const u=Math.min(1,(t-31)/13),y=-12800+(SITE.y+12800)*ease(u),r=1480+(S.RS-0.5-1480)*u*u;return {a:SITE.a+0.02*Math.sin(u*3),y,r};}
  // the wave: a hump coming down the Sea from the north shore, thrown back by the southern cliff, dying away
  function waveAt(a,y,t){if(t<6)return 0.6*Math.sin(y*0.02+t*1.3);const tt=t-6,v=600,L=2*S.SH;
    let d=L-tt*v;const back=d<0;if(back)d=-d;const pos=S.SH-d;           // the front's y: north shore down to the south, then back
    const A=(back?22:40)*Math.exp(-tt/30),w=back?520:420;return A*Math.exp(-(((y-pos)/w)**2))+0.8*Math.sin(y*0.02+t*1.3)+0.5*Math.sin(a*900+t);}
  // Between the scenes Rama is not empty: three spiders range round Camp Alpha, two crabs work the Southern Plain
  // near where the Dragonfly fell, and Resolution swings at her mooring under the northern cliff. Each goes a
  // slow loop of its own; the heading is the way it is going.
  function wander(o,a0,y0,R,ra,ry,sp,ph,t){const f=t*sp+ph,a=a0+Math.sin(f)*ra/R+Math.sin(f*2.3)*ra*0.3/R,y=y0+Math.cos(f*0.8)*ry+Math.sin(f*1.7)*ry*0.25;
    const da=(Math.cos(f)*ra/R+Math.cos(f*2.3)*2.3*ra*0.3/R)*R,dy=-Math.sin(f*0.8)*0.8*ry+Math.cos(f*1.7)*1.7*ry*0.25;IN.orient(o,a,y,R,Math.atan2(da,dy));o.visible=true;}
  function idle(now){const t=now/1000;
    for(let i=0;i<3;i++)wander(spiders[i],S.STAIRS[0].a,S.PE-450,S.RI,160+i*60,220,0.05+i*0.013,i*2.1,t);
    for(let i=0;i<2;i++)wander(crabs[i],SITE.a,SITE.y+200,S.RS,120,260,0.02+i*0.008,i*3,t);
    IN.orient(raft,S.NYA+0.02+0.0006*Math.sin(t*0.05),S.SH-140+6*Math.sin(t*0.07),S.SEA-0.4*Math.sin(t*0.8),0.15*Math.sin(t*0.05));}
  // the missile comes in from sunward, out of the glare, and stops 6 km off the hub
  function missileWay(){const SL=(api.C.space&&api.C.space.starLight)||{},a=SL.az===undefined?-0.55:SL.az,e=SL.el===undefined?0.22:SL.el;
    const dir=new THREE.Vector3(Math.cos(a)*Math.cos(e),Math.sin(e),Math.sin(a)*Math.cos(e));
    const hub=new THREE.Vector3(S.L2+300,0,0);return {dir,hub,stop:hub.clone().addScaledVector(dir,6000),far:hub.clone().addScaledVector(dir,60000)};}
  function raftY(t){return -2500+40*Math.sin(t*0.2);}

  // ---------- running them ----------
  let cur=null,t0=0,lastNow=0,queue=[],shown='';
  const byId=Object.fromEntries(EVS.map(e=>[e.id,e]));
  function stop(){if(!cur)return;if(cur.end)cur.end();IN.follow(null);cur=null;cap.style.display='none';rest();}
  function play(id,chain){stop();const e=byId[id];if(!e)return;if(!chain)queue=[];cur=e;t0=lastNow;e.t=0;if(e.reset)e.reset();rest();e.start();shown='';mark();}
  animHooks.push(now=>{lastNow=now;if(!cur){idle(now);return;}const t=(now-t0)/1000;cur.t=t;cur.tick(t,now);
    let c='';for(const [at,text] of cur.caps)if(t>=at)c=text;if(t>cur.dur-1.2)c='';
    if(c!==shown){shown=c;cap.textContent=c;cap.style.display=c?'block':'none';}
    if(t>cur.dur){const next=queue.shift();if(next)play(next,true);else{stop();mark();}}});
  // the panel
  const BT={};
  const mkB=(label,sub,fn)=>{const b=document.createElement('button');b.type='button';b.style.cssText='background:rgba(14,16,20,.9);color:#efe6d0;border:1px solid #5a5446;padding:6px 9px;cursor:pointer;text-align:left;font:12px Helvetica,Arial,sans-serif';
    b.innerHTML='';const h=document.createElement('div');h.textContent=label;h.style.fontWeight='600';b.appendChild(h);if(sub){const s=document.createElement('div');s.textContent=sub;s.style.cssText='color:#b8b0a0;margin-top:2px';b.appendChild(s);}
    b.onclick=fn;panel.appendChild(b);return b;};
  mkB('Play the story','All ten scenes, in order (about six minutes).',()=>{queue=EVS.map(e=>e.id);play(queue.shift(),true);panel.style.display='none';});
  EVS.forEach((e,i)=>{BT[e.id]=mkB((i+1)+'. '+e.name,e.blurb,()=>{play(e.id);panel.style.display='none';});});
  mkB('Stop','Back to Rama as it was explored: lit, the Sea thawed.',()=>{queue=[];stop();state({});G.position.set(0,0,0);E.y=DOCK;E.docked=true;mark();});
  function mark(){for(const [k,b] of Object.entries(BT))b.style.borderColor=cur&&cur.id===k?'#e8c98a':'#5a5446';}

  return {play,stop,toggle:()=>{panel.style.display=panel.style.display==='flex'?'none':'flex';},
    camFrame:()=>false,
    hudTail:()=>cur?' · '+cur.name+' '+Math.floor(cur.t)+'/'+cur.dur+' s':''};
}
