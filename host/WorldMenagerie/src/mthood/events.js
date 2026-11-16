// ---------- what happens on Mount Hood ----------
// Every minute or two something happens, and the Events button fires any of them now (src/core/happenings.js). Each sets
// the day, the hour and the weather it needs, and puts back what it found when it ends.
//   alpenglow  sunrise from Trillium Lake: the summit pink before the forest is lit, upside down in the water
//   cap        a lenticular cap cloud over the summit, the sign of a storm coming in off the Pacific
//   oldmaid    the Old Maid eruption (about 1781-1793): Crater Rock's dome, block-and-ash flows, lahars down the White
//              River and the Sandy to Old Maid Flat; told with the story of Wy'east, Pahto, Loowit and the Bridge of the Gods
//   clark      Lewis and Clark see the mountain from the Columbia, October 1805
//   climbers   the alpine start: headlamps from Timberline up the Palmer, past Crater Rock, up the Hogsback to the summit at dawn
//   snow       the first snow of autumn
//   flowers    Paradise Park in flower, then the huckleberries ripening
//   fdr        Franklin Roosevelt dedicates Timberline Lodge, 28 September 1937
//   palmer     summer skiing on the Palmer Snowfield in July
//   smoke      an August afternoon in wildfire smoke
// C.hoodEvents: {first, every, views}. Nothing here is in the layout fingerprint.
import { createHappenings } from '../core/happenings.js';
import {hash3} from '../core/rng.js';

export function events(api){
  const {THREE,C,scene,groundH,P}=api;const K=C.hoodEvents||{},S=api.ctx.season,M=api.ctx.mtn||{};
  let H=null,want=null;const notice=(...a)=>H.notice(...a);
  const setH=h=>{want=h;const f=api.setHour||window.setHour;if(f)f(((h%24)+24)%24);};
  // an event fired on arrival (#event=) starts before the page has read its own hour from the address: hold the event's
  // hour for its first seconds so the page's does not win
  const run=fn=>{let tt=0;const w=want;H.run((now,dt)=>{tt+=dt;if(tt<4&&w!=null&&want===w)setH(w);return fn(now,dt);});};
  const hourNow=()=>api.hour?api.hour():12;
  const tag=o=>{o.traverse(q=>{q.userData.noFingerprint=true;q.userData.noWire=true;q.userData.noShadow=true;});return o;};
  const ll=(a,dy=0)=>{const [x,z]=P(a);return [x,groundH(x,z)+dy,z];};
  const R=(i,s)=>hash3(i,s,77);
  const soft=(()=>{const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d'),gr=g.createRadialGradient(32,32,0,32,32,32);
    gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(0.35,'rgba(255,255,255,0.5)');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.fillRect(0,0,64,64);return new THREE.CanvasTexture(c);})();
  const puff=(col,s,op,add)=>{const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:soft,color:col,transparent:true,opacity:op,depthWrite:false,blending:add?THREE.AdditiveBlending:THREE.NormalBlending}));sp.scale.setScalar(s);return tag(sp);};
  const cap=document.createElement('div');
  cap.style.cssText='position:fixed;left:50%;bottom:70px;transform:translateX(-50%);max-width:min(660px,calc(100vw - 32px));padding:9px 14px;background:rgba(14,20,24,.84);color:#eef2f4;font:14px/1.45 Georgia,serif;border-left:3px solid #c86a3a;display:none;z-index:11;pointer-events:none';
  document.body.appendChild(cap);
  const captions=list=>{let shown='';return t=>{let c='';for(const [a,b,text] of list)if(t>=a&&t<b)c=text;if(c!==shown){shown=c;cap.textContent=c;cap.style.display=c?'block':'none';}};};
  const hideCap=()=>{cap.style.display='none';};
  // what an event changes, and putting it back
  const save=()=>{const W=api.ctx.weather;return {doy:S?S.doy:null,turning:S?S.turning:false,hour:hourNow(),auto:W?W.auto:true,state:W?W.state:null};};
  const restore=o=>{if(S&&o.doy!=null){S.set(o.doy);if(o.turning)S.setTurning(true);}setH(o.hour);const W=api.ctx.weather;if(W){if(o.auto)W.setAuto(true);else if(o.state)W.set(o.state);}};
  // the present hidden for a scene in the past: the objects the named stages added (stamped in main.js), and back after
  const hideStages=names=>{const N=new Set(names),hid=new Set();let on=true,k=0;
    const scan=()=>scene.traverse(o=>{if(o!==scene&&N.has(o.userData.stage)&&!(o.parent&&N.has(o.parent.userData.stage)))hid.add(o);});scan();
    // the stages add tiles as the camera moves and show their meshes by distance each frame: rescan now and then, hold them hidden every frame
    api.animHooks.push(()=>{if(!on)return;if(++k%30===0)scan();for(const o of hid)o.visible=false;});return ()=>{on=false;for(const o of hid)o.visible=true;};};
  const day=d=>{if(S){if(S.turning)S.setTurning(false);S.set(d);}};
  const sky=k=>{const W=api.ctx.weather;if(W)W.set(k);};
  // a view [lat,lon,h] pair from the config, or the fallback given
  const VIEW=(n,fb)=>{const v=(K.views&&K.views[n])||(C.views&&C.views[n])||fb,[a,b]=v,[fx,fz]=P(a),[tx,tz]=P(b);return [fx,a[2],fz,tx,b[2],tz];};
  const SUMMIT=[45.37351,-121.69588],[sx,sz]=P(SUMMIT),sy=groundH(sx,sz);
  const sunrise=()=>{const d=api.ctx.details&&api.ctx.details.season;return d&&d.sunrise!=null?d.sunrise:6;};
  // a river as one line from its source down: its OSM ways chained end to start, from the highest start
  const river=name=>{const ways=(M.streams||[]).filter(s=>s.n===name).map(s=>{const o=[];for(let i=0;i<s.p.length;i+=2)o.push([s.p[i]/10,s.p[i+1]/10]);return o;}).filter(w=>w.length>1);
    if(!ways.length)return [];ways.sort((a,b)=>groundH(b[0][0],b[0][1])-groundH(a[0][0],a[0][1]));const out=ways.shift().slice();
    for(;;){const [ex,ez]=out[out.length-1];let k=-1,bd=80;ways.forEach((w,i)=>{const d=Math.hypot(w[0][0]-ex,w[0][1]-ez);if(d<bd){bd=d;k=i;}});if(k<0)break;out.push(...ways.splice(k,1)[0].slice(1));}
    // resampled every 25 m, with the distance along it
    const o=[[out[0][0],out[0][1],0]];for(let i=0;i+1<out.length;i++){const [ax,az]=out[i],[bx,bz]=out[i+1],L=Math.hypot(bx-ax,bz-az),n=Math.max(1,Math.round(L/25));for(let k=1;k<=n;k++){const p=o[o.length-1];const x=ax+(bx-ax)*k/n,z=az+(bz-az)*k/n;o.push([x,z,p[2]+Math.hypot(x-p[0],z-p[1])]);}}return o;};
  const along=(line,d)=>{if(!line.length)return [0,0];let lo=0,hi=line.length-1;if(d<=0)return line[0];if(d>=line[hi][2])return line[hi];while(hi-lo>1){const m=(lo+hi)>>1;if(line[m][2]<d)lo=m;else hi=m;}const a=line[lo],b=line[hi],u=(d-a[2])/((b[2]-a[2])||1);return [a[0]+(b[0]-a[0])*u,a[1]+(b[1]-a[1])*u];};
  // small people, an instanced box each, for a crowd or skiers
  const folk=(n,cols)=>{const m=new THREE.InstancedMesh(new THREE.BoxGeometry(0.5,1.7,0.35).translate(0,0.85,0),new THREE.MeshLambertMaterial(),n);const c=new THREE.Color();
    for(let i=0;i<n;i++){c.set(cols[Math.floor(R(i,5)*cols.length)]);m.setColorAt(i,c);}m.frustumCulled=false;return tag(m);};
  const dummy=new THREE.Object3D();

  // ---- (a) alpenglow from Trillium Lake ----
  function alpenglow(){const sv=save(),r=sunrise();const v=VIEW('Mount Hood from Trillium Lake',[[45.2648,-121.7402,1104],[45.37351,-121.69588,3150]]);
    const glow=new THREE.DirectionalLight(0xff7a8a,0);glow.position.set(sx+30000,sy+1500,sz+4000);glow.target.position.set(sx,sy,sz);scene.add(glow,glow.target);let t=0;
    setH(r-0.45);sky('clear');
    const CAP=captions([[0,14,'Before sunrise at Trillium Lake. The sun is still under the horizon here, but at 3,429 m the summit already stands in its light.'],
      [14,30,'Alpenglow: the first light comes through so much air that only the red is left, and the snow on the summit turns pink while the forest and the lake are still in shadow.'],
      [30,44,'On a still morning Trillium is a mirror, and the mountain stands in it upside down: the most photographed view of Mount Hood. The lake is a reservoir, dammed in 1960 on Mud Creek.']]);
    notice('Alpenglow','sunrise on the summit, from Trillium Lake.',()=>v,()=>[sx,sy,sz]);
    run((now,dt)=>{t+=dt;CAP(t);const h=r-0.45+Math.min(1.3,t*0.03);setH(h);
      const k=Math.max(0,1-Math.abs(h-(r+0.05))/0.55);glow.intensity=k*1.1;
      if(t>46){scene.remove(glow,glow.target);hideCap();restore(sv);return false;}return true;});}

  // ---- (b) a lenticular cap cloud ----
  function cap_(){const sv=save();day(298);setH(12.5);sky('fair');const g=tag(new THREE.Group());scene.add(g);
    // two lenses stacked, each a pile of soft horizontal layers whose radius follows a lens's profile: from the side a smooth
    // lens with no hard edge, from below a soft disc
    const mat=new THREE.MeshBasicMaterial({map:soft,color:0xf2f4f6,transparent:true,opacity:0,depthWrite:false,side:THREE.DoubleSide,fog:false});
    const discs=[];[[0,1900,200],[300,1300,130]].forEach(([dy,r0,hh],j)=>{for(let i=0;i<14;i++){const u=(i/13)*2-1,r=r0*Math.sqrt(1-u*u*0.92);
      const m=new THREE.Mesh(new THREE.CircleGeometry(1,40),mat);m.rotation.x=-Math.PI/2;m.scale.set(r*1.3,r,1);m.position.set(sx+250+j*80,sy+260+dy+u*hh*0.5,sz+100);g.add(m);discs.push(m);}});
    const v=VIEW('Timberline Lodge',[[45.3288,-121.7140,1840],[45.33113,-121.71124,1822]]),vv=[v[0]-200,v[1]+60,v[2]+1200,sx,sy+250,sz];let t=0;
    const CAP=captions([[0,15,'A lenticular cloud forming over the summit: moist air from the Pacific, lifted over the mountain, cools until its water condenses, then sinks and clears again in the lee.'],
      [15,30,'The cloud stays put while the wind blows through it, a lens standing on the wave the mountain makes in the air. Several stack up when the air is layered.'],
      [30,46,'Climbers and skiers read it as a warning: a cap on Hood means wet, windy weather is on its way, often within a day. Here it comes.']]);
    notice('A cap cloud','a lenticular cloud over the summit: weather coming.',()=>vv,()=>[sx,sy+300,sz]);
    run((now,dt)=>{t+=dt;CAP(t);mat.opacity=0.32*Math.min(1,t/10)*(t>40?Math.max(0,1-(t-40)/6):1);discs.forEach((m,i)=>{m.rotation.z+=dt*0.003*(i%2?1:-1);});
      if(t>30&&t<31)sky('cloud');if(t>38&&t<39)sky('rain');
      if(t>48){scene.remove(g);hideCap();restore(sv);return false;}return true;});}

  // ---- (c) the Old Maid eruption ----
  function oldmaid(){const sv=save();day(200);setH(19.4);sky('clear');const g=tag(new THREE.Group());scene.add(g);
    const [cx,cy,cz]=ll([45.36998,-121.7003],0);
    const dome=new THREE.Mesh(new THREE.SphereGeometry(1,24,12,0,Math.PI*2,0,Math.PI/2),new THREE.MeshLambertMaterial({color:0x3a2a22,emissive:0xff4a10,emissiveIntensity:0}));dome.scale.set(170,1,150);dome.position.set(cx,cy-20,cz);g.add(dome);
    const light=new THREE.PointLight(0xff6a2a,0,6000,1.2);light.position.set(cx,cy+120,cz);g.add(light);
    const plume=[];for(let i=0;i<120;i++){const s=puff(i%4?0x5a524a:0x7a6e62,200,0,false);g.add(s);plume.push({s,u:R(i,1),sp:0.6+R(i,2)*0.8,dx:R(i,3)-0.5,dz:R(i,4)-0.5});}
    // the flows: block-and-ash clouds down the first kilometres; lahars as grey-brown mud filling the valleys to Old Maid Flat
    const lines=['White River','Sandy River'].map(river).filter(l=>l.length>2);
    const flows=[];lines.forEach((L,j)=>{for(let i=0;i<40;i++){const s=puff(0x8a7e70,120,0,false);g.add(s);flows.push({s,L,o:R(i,10+j)*1200,sp:0.7+R(i,20+j)*0.6});}});
    const mudMat=new THREE.MeshLambertMaterial({color:0x6e6254,polygonOffset:true,polygonOffsetFactor:-4,polygonOffsetUnits:-8});const muds=[];
    for(const L of lines){const p=[],idx=[];L.forEach((q,i)=>{const a=L[Math.max(0,i-1)],b=L[Math.min(L.length-1,i+1)],dx=b[0]-a[0],dz=b[1]-a[1],l=Math.hypot(dx,dz)||1,w=40+Math.min(1,q[2]/12000)*90,nx=-dz/l*w,nz=dx/l*w,y=groundH(q[0],q[1])+2.5;
        p.push(q[0]+nx,Math.max(y,groundH(q[0]+nx,q[1]+nz)+0.6),q[1]+nz,q[0]-nx,Math.max(y,groundH(q[0]-nx,q[1]-nz)+0.6),q[1]-nz);if(i)idx.push(2*i-2,2*i,2*i-1,2*i-1,2*i,2*i+1);});
      const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(p,3));geo.setIndex(idx);geo.computeVertexNormals();geo.setDrawRange(0,0);const m=new THREE.Mesh(geo,mudMat);m.frustumCulled=false;g.add(m);muds.push({m,L});}
    const [ox,,oz]=ll([45.3900,-121.7900],0);let t=0;
    const CAP=captions([[0,16,'The story the peoples of the Columbia tell: the Great Spirit\'s sons Wy\'east and Pahto both loved Loowit. They fought across the river, hurling fire and stones, and the Bridge of the Gods fell into the Columbia.'],
      [16,32,'Wy\'east became this mountain, Pahto became Mount Adams, and Loowit, Mount St. Helens. Wy\'east still breathes: the steam of the Devil\'s Kitchen, below the summit.'],
      [32,48,'About 1781 it woke again. A dome of lava pushed up where Crater Rock stands, shedding hot blocks and ash that poured down the mountain\'s south side.'],
      [48,64,'The snow and ice they melted made lahars, rivers of mud and boulders. They ran down the White River and the Sandy and buried the valley floor at Old Maid Flat, where dead snags stood in the grey mud.'],
      [64,80,'In 1805 Lewis and Clark found the Sandy so choked with sand and gravel that they called it the Quicksand River. The trees on Old Maid Flat are still younger than the eruption.']]);
    notice('The Old Maid eruption','about 1781: Crater Rock\'s dome, the flows and the lahars to Old Maid Flat.',()=>[ox,groundH(ox,oz)+1700,oz+2500,cx,cy-300,cz],()=>[cx,cy,cz]);
    run((now,dt)=>{t+=dt;CAP(t);const erupt=t>32&&t<74?Math.min(1,(t-32)/4)*(t>66?Math.max(0,1-(t-66)/8):1):0;
      dome.scale.y=Math.min(1,Math.max(0,(t-30)/10))*110+1;dome.material.emissiveIntensity=erupt*0.9;light.intensity=erupt*2.5;
      for(const p of plume){const k=(t*0.04*p.sp+p.u)%1,h=k*5000;p.s.position.set(cx+p.dx*(100+k*2500)+k*2000,cy+80+h,cz+p.dz*(100+k*1500));p.s.scale.setScalar(250+k*2600);p.s.material.opacity=erupt*0.7*Math.pow(1-k,1.4);}
      for(const f of flows){const d=((t-34)*60*f.sp+f.o)%5000;const [x,z]=along(f.L,Math.max(0,d));f.s.position.set(x,groundH(x,z)+40,z);f.s.scale.setScalar(160+d*0.05);f.s.material.opacity=erupt*0.75*(1-d/5000)*(t>34?1:0);}
      for(const {m,L} of muds){const reach=Math.max(0,(t-48)*600),n=L.findIndex(q=>q[2]>reach);m.geometry.setDrawRange(0,(n<0?L.length-1:Math.max(0,n-1))*6);}
      if(t>32)setH(19.4+Math.min(0.6,(t-32)*0.015));
      if(t>82){scene.remove(g);hideCap();restore(sv);return false;}return true;});}

  // ---- (d) Lewis and Clark see the mountain, October 1805 ----
  function clark(){const sv=save();day(290);setH(15.5);sky('fair');
    // the Columbia is beyond the map's north edge, 40 km off: the view stands at the edge, on the line to it
    const [vx,,vz]=ll([45.488,-121.640],0),vy=groundH(vx,vz)+700;let t=0;
    const CAP=captions([[0,16,'18 October 1805. Coming down the Columbia, William Clark writes of a high mountain to the south-west, covered in snow and shaped like a sugar loaf: Mount Hood.'],
      [16,32,'It already had its English name. Lieutenant William Broughton of Vancouver\'s expedition saw it from the river in October 1792 and named it after Admiral Samuel Hood.'],
      [32,48,'The Corps passed the mouth of the Hood River (Clark\'s Labiche River) and portaged round the Cascades of the Columbia: the rapids where, in the story, the Bridge of the Gods had fallen.'],
      [48,62,'They found the mountain\'s rivers changed by its eruption a few years before: the Sandy, its mouth choked with sediment, they named the Quicksand River.']]);
    notice('Lewis and Clark','October 1805: the mountain seen from the Columbia.',()=>[vx,vy,vz,sx,sy-500,sz],()=>[sx,sy,sz]);
    run((now,dt)=>{t+=dt;CAP(t);if(t>64){hideCap();restore(sv);return false;}return true;});}

  // ---- (e) the climbers' alpine start ----
  function climbers(){const sv=save();day(150);setH(1.5);sky('clear');
    const route=[[45.33113,-121.71124],[45.34462,-121.70952],[45.3566,-121.7040],[45.3640,-121.7030],[45.36998,-121.7003],[45.3715,-121.6975],[45.3728,-121.6965],SUMMIT].map(a=>P(a));
    const segL=[];let tot=0;for(let i=0;i+1<route.length;i++){const l=Math.hypot(route[i+1][0]-route[i][0],route[i+1][1]-route[i][1]);segL.push(l);tot+=l;}
    const at=d=>{d=Math.max(0,Math.min(tot,d));for(let i=0;i<segL.length;i++){if(d<=segL[i]){const u=d/segL[i];return [route[i][0]+(route[i+1][0]-route[i][0])*u,route[i][1]+(route[i+1][1]-route[i][1])*u];}d-=segL[i];}return route[route.length-1];};
    const N=48,pos=new Float32Array(N*3),geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(pos,3));
    const pts=tag(new THREE.Points(geo,new THREE.PointsMaterial({color:0xfff2c8,size:4,sizeAttenuation:false,transparent:true,opacity:1,depthWrite:false,blending:THREE.AdditiveBlending,fog:false})));pts.frustumCulled=false;scene.add(pts);
    const ropes=Array.from({length:N},(_,i)=>({s:R(i,30)*0.35+Math.floor(i/4)*0.012,w:(R(i,31)-0.5)*14}));
    const v=VIEW('Silcox Hut and the Palmer',[[45.3415,-121.7120,2130],[45.3566,-121.7040,2450]]),vv=[v[0]-300,v[1]+150,v[2]+500,sx,sy-500,sz];let t=0;
    const CAP=captions([[0,15,'Half past one in the morning at Timberline Lodge. The climbers set out now so as to be up and down before the sun loosens the ice and rock above them.'],
      [15,30,'Up the Palmer Snowfield by headlamp, some riding a snowcat to its top, then past Illumination Rock and on to Crater Rock and the steaming Devil\'s Kitchen, where the air smells of sulphur.'],
      [30,46,'The Hogsback: a ridge of snow curving up toward the Pearly Gates, the gaps through the rime-coated rock below the summit. Rockfall and falling ice are the danger here once the sun is up.'],
      [46,62,'Some ten thousand people try the south side each year. From the top at dawn the shadow of Mount Hood lies across the land to the west.']]);
    notice('The alpine start','headlamps on the south side, Timberline to the summit by dawn.',()=>vv,()=>[sx,sy-400,sz]);
    run((now,dt)=>{t+=dt;CAP(t);const h=1.5+t*(4.4/62);setH(h);
      for(let i=0;i<N;i++){const r=ropes[i],d=(r.s+t/62*0.75)*tot,[x,z]=at(d),q=at(d+5),dx=q[0]-x,dz=q[1]-z,l=Math.hypot(dx,dz)||1;pos.set([x-dz/l*r.w,groundH(x-dz/l*r.w,z+dx/l*r.w)+2,z+dx/l*r.w],i*3);}
      geo.attributes.position.needsUpdate=true;pts.material.opacity=Math.max(0.2,1-Math.max(0,h-4.8)*0.8);
      if(t>64){scene.remove(pts);hideCap();restore(sv);return false;}return true;});}

  // ---- (f) the first snow of autumn ----
  function snow(){const sv=save(),G=api.ctx.ground;day(292);setH(11);sky('snow');const v=VIEW('Timberline Lodge',[[45.3288,-121.7140,1840],[45.33113,-121.71124,1822]]);let t=0;
    const CAP=captions([[0,16,'Late October: the first storm of the winter comes in from the Pacific, and the snow comes down to the lodge and below it.'],
      [16,32,'Mount Hood gets some 13 m of snow a year at Timberline. The first falls often melt off again; by Thanksgiving the snowpack has usually begun to stay.'],
      [32,46,'Above, the old snow of the glaciers and the Palmer, grey with a summer\'s dust, goes white again overnight.']]);
    notice('The first snow','the first snow of the autumn.',()=>[v[0]-150,v[1]+50,v[2]+250,sx,sy-600,sz],()=>[v[3],v[4],v[5]]);
    run((now,dt)=>{t+=dt;CAP(t);const k=Math.min(1,t/22);if(G&&G.winter)G.winter(k);else if(S.freshSnow)S.freshSnow(k);if(t>34&&t<35)sky('fair');
      if(t>48){if(G&&G.winter)G.winter(0);else if(S.freshSnow)S.freshSnow(0);hideCap();restore(sv);return false;}return true;});}

  // ---- (g) Paradise Park in flower, the huckleberries ripening ----
  function flowers(){const sv=save();day(205);setH(10.5);sky('clear');const v=VIEW('Paradise Park',[[45.3500,-121.7500,1720],[45.37351,-121.69588,3150]]);let t=0;
    const CAP=captions([[0,16,'Late July in Paradise Park, on the Timberline Trail: the meadows flower in the weeks between the snow melting off them and the first frosts.'],
      [16,32,'Lupine, magenta paintbrush, western pasqueflower gone to its shaggy seed heads, avalanche lilies at the snow\'s edge, and the tall white plumes of beargrass.'],
      [32,48,'Lower, in the forest\'s edge and old burns, the huckleberries ripen in August. The peoples of the Columbia came up to the berry fields each summer, and still do; the Forest Service keeps some for them.'],
      [48,60,'The flowers move up the mountain behind the melting snow, so a walker can follow the spring for two months.']]);
    notice('Paradise Park','the meadows in flower, then the huckleberries.',()=>v,()=>[v[3],v[4],v[5]]);
    run((now,dt)=>{t+=dt;CAP(t);if(t>32&&S)S.set(205+Math.min(35,(t-32)*1.5));if(t>62){hideCap();restore(sv);return false;}return true;});}

  // ---- (h) Roosevelt dedicates Timberline Lodge ----
  function fdr(){const sv=save();day(270);setH(11.5);sky('fair');const unhide=hideStages(['parked-cars','traffic','lifts','streetscape']);const [lx,ly,lz]=ll([45.33113,-121.71124],0);const g=tag(new THREE.Group());scene.add(g);
    const N=320,crowd=folk(N,['#2a2a2e','#3c3a36','#5a4a3a','#6a6a70','#4a3a2e','#8a6a4a','#22283a']);g.add(crowd);
    for(let i=0;i<N;i++){const a=Math.PI*(0.15+0.7*R(i,40)),r=28+R(i,41)*30,x=lx+Math.cos(a)*r,z=lz+Math.sin(a)*r;dummy.position.set(x,groundH(x,z),z);dummy.rotation.y=Math.atan2(lx-x,lz-z);dummy.updateMatrix();crowd.setMatrixAt(i,dummy.matrix);}
    crowd.instanceMatrix.needsUpdate=true;let t=0;
    const CAP=captions([[0,16,'28 September 1937. President Franklin Roosevelt comes up the new road from Government Camp to dedicate Timberline Lodge, and speaks to the crowd from the lodge.'],
      [16,32,'The lodge was built in 1936-38 by the Works Progress Administration: hundreds of men out of work in the Depression, quarrying the mountain\'s stone and hewing its timber by hand.'],
      [32,48,'Inside, everything was made for it: the wrought-iron, the hand-woven drapes and hooked rugs, the furniture, the carved newel posts of animals, the paintings and mosaics.'],
      [48,60,'It is a National Historic Landmark, and was the outside of the Overlook Hotel in the film of The Shining.']]);
    notice('Timberline Lodge, 1937','Franklin Roosevelt dedicates the lodge.',()=>[lx,ly+30,lz+130,lx,ly+10,lz],()=>[lx,ly,lz]);
    run((now,dt)=>{t+=dt;CAP(t);if(t>62){unhide();scene.remove(g);hideCap();restore(sv);return false;}return true;});}

  // ---- (i) summer skiing on the Palmer ----
  function palmer(){const sv=save();day(193);setH(9.5);sky('clear');const [ax,az]=P([45.3566,-121.7040]),[bx,bz]=P([45.34462,-121.70952]);const g=tag(new THREE.Group());scene.add(g);
    const N=36,skiers=folk(N,['#d83a2a','#2a6ad8','#1a1a1e','#e8c22a','#2aa86a','#e86aa8']);g.add(skiers);const sk=Array.from({length:N},(_,i)=>({o:R(i,50),sp:0.025+R(i,51)*0.02,w:30+R(i,52)*50,f:0.6+R(i,53)*0.8,lane:(R(i,54)-0.5)*260}));
    const dx=bx-ax,dz=bz-az,L=Math.hypot(dx,dz),ux=dx/L,uz=dz/L,px=-uz,pz=ux;
    let t=0;
    const CAP=captions([[0,16,'July, and people are skiing. The Palmer Snowfield above Timberline holds its snow through the summer, and the lift runs into the autumn in a good year.'],
      [16,32,'Timberline is the only lift-served skiing in North America open nearly all year. Race teams and snowboard camps come from all over to train here in the summer.'],
      [32,46,'They ski in the morning: by afternoon the July sun turns the snow to slush, and the lifts close at half past one.']]);
    const mx=ax+dx*0.45+px*170,mz=az+dz*0.45+pz*170,tx=ax+dx*0.55,tz=az+dz*0.55;
    notice('Summer skiing','July on the Palmer Snowfield.',()=>[mx,groundH(mx,mz)+45,mz,tx,groundH(tx,tz),tz],()=>[tx,groundH(tx,tz),tz]);
    run((now,dt)=>{t+=dt;CAP(t);for(let i=0;i<N;i++){const s=sk[i],u=(s.o+t*s.sp)%1,d=u*L,side=s.lane+Math.sin(d/s.w*Math.PI*s.f)*s.w*0.5,x=ax+ux*d+px*side,z=az+uz*d+pz*side;
        dummy.position.set(x,groundH(x,z),z);dummy.rotation.set(0.35*Math.cos(d/s.w*Math.PI*s.f),Math.atan2(ux,uz),0);dummy.updateMatrix();skiers.setMatrixAt(i,dummy.matrix);}
      skiers.instanceMatrix.needsUpdate=true;if(t>48){scene.remove(g);hideCap();restore(sv);return false;}return true;});}

  // ---- (j) an August afternoon in wildfire smoke ----
  function smoke(){const sv=save();day(228);setH(15);sky('haze');const sun=api.sun,sc=sun?sun.color.clone():null;const g=tag(new THREE.Group());scene.add(g);
    const pall=[];for(let i=0;i<60;i++){const s=puff(i%3?0x8a7058:0xa48a6a,4000,0,false);g.add(s);pall.push({s,a:R(i,60)*Math.PI*0.6+Math.PI*0.2,r:9000+R(i,61)*6000,h:2500+R(i,62)*2500,ph:R(i,63)*6});}
    const v=VIEW('Mount Hood from Trillium Lake',[[45.2648,-121.7402,1104],[45.37351,-121.69588,3150]]);let t=0;
    const CAP=captions([[0,16,'An August afternoon in a fire summer. Smoke from fires across the Cascades fills the valleys, and the mountain fades to a shape in brown air.'],
      [16,32,'The sun is an orange disc, and the light it gives is brown and shadowless. The air quality warnings go out across Portland and Hood River.'],
      [32,48,'Fire is part of this forest. In August 2011 the Dollar Lake Fire, started by lightning, burned some 2,500 hectares on the mountain\'s north side, and its silver snags still stand along the Timberline Trail.']]);
    notice('Wildfire smoke','an August afternoon in wildfire smoke.',()=>v,()=>[sx,sy,sz]);
    run((now,dt)=>{t+=dt;CAP(t);const k=Math.min(1,t/8)*(t>44?Math.max(0,1-(t-44)/4):1);
      if(sun&&sc)sun.color.copy(sc).lerp(new THREE.Color(0xff9a50),k*0.7);
      for(const p of pall){p.s.position.set(sx+Math.cos(p.a+t*0.003)*p.r,p.h+Math.sin(t*0.1+p.ph)*80,sz+Math.sin(p.a+t*0.003)*p.r);p.s.material.opacity=k*0.5;}
      if(t>48){if(sun&&sc)sun.color.copy(sc);scene.remove(g);hideCap();restore(sv);return false;}return true;});}

  H=createHappenings(api,{events:{alpenglow:['Alpenglow',alpenglow],cap:['A cap cloud',cap_],oldmaid:['The Old Maid eruption',oldmaid],clark:['Lewis and Clark',clark],
      climbers:['The alpine start',climbers],snow:['The first snow',snow],flowers:['Paradise Park in flower',flowers],fdr:['Timberline Lodge, 1937',fdr],palmer:['Summer skiing',palmer],smoke:['Wildfire smoke',smoke]},
    order:K.order||['alpenglow','flowers','cap','climbers','palmer','smoke','fdr','snow','clark','oldmaid'],first:K.first||45000,every:K.every||[80000,150000],
    colours:{bg:'rgba(14,20,24,.86)',fg:'#eef2f4',edge:'#c86a3a',btn:'rgba(40,30,24,.9)',btnEdge:'#d87a4a'}});
}
