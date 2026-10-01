// ---------- inspect and follow: click a building or landmark for a card; click a patrol, cart, bird or person to follow it ----------
{
const card=document.getElementById('card');
const KIND={box:'House',tier:'Tiered house',domed:'Domed house',barrel:'Barrel-vault house',tent:'Tent hall',pyr:'Stepped pyramid house',setback:'Setback tower',tyrell:'Sloped tower',wedge:'Wedge block',pent:'Five-sided block',hept:'Seven-sided block',midrise:'Midrise',hall:'Timber hall',stave:'Stave hall',pueblo:'Pueblo',compound:'Walled compound'};
const DIR=['east','south-east','south','south-west','west','north-west','north','north-east'];
const dirOf=(x,z)=>DIR[Math.round(((Math.atan2(z,x)+Math.PI*2)%(Math.PI*2))/(Math.PI/4))%8];
const hhmm=h=>{h=((h%24)+24)%24;return String(Math.floor(h)).padStart(2,'0')+':'+String(Math.floor(h%1*60)).padStart(2,'0');};
const where=(x,z)=>{const p=polar(x,z),r01=p.r/wallR(p.t);if(r01>1.05)return 'beyond the walls, to the '+dirOf(x,z);return (r01<0.3?'the inner city':r01<0.6?'the middle ring':'the outer ring')+', '+dirOf(x,z)+' side';};
const esc=t=>String(t).replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
let FOL=null,shown=null;
const hl=new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(1,1,1)),new THREE.LineBasicMaterial({color:0xffd27a,depthTest:false,transparent:true,opacity:0.9,fog:false}));
hl.visible=false;hl.renderOrder=20;hl.layers.mask=0xffffffff|0;hl.userData.noWire=true;scene.add(hl);
function showCard(info){shown=info;if(info.live&&!info.lines)info.lines=info.live();const lines=(info.lines||[]).map(l=>`<p${l.sub?' class="sub"':''}>${esc(l.t||l)}</p>`).join('');
  card.innerHTML=`<h2>${esc(info.title)}</h2>${info.img?`<img class="izimg" src="${info.img}" alt="${esc(info.imgAlt||'')}">`:''}${lines}<div class="row">${info.follow?`<button data-a="follow">${FOL&&FOL.info===info?'Stop following':'Follow'}</button>`:''}<button data-a="close">Close</button></div>`;
  card.classList.add('on');card.querySelector('[data-a="close"]').onclick=closeCard;
  const fb=card.querySelector('[data-a="follow"]');if(fb)fb.onclick=()=>{if(FOL&&FOL.info===info)stopFollow();else startFollow(info);showCard(info);};}
function closeCard(){card.classList.remove('on');shown=null;hl.visible=false;stopFollow();}
function startFollow(info){FOL={info};if(ctx.stopTour)ctx.stopTour();fly=null;markView('');}
function stopFollow(){if(!FOL)return;FOL=null;if(shown&&shown.follow)showCard(shown);}
ctx.stopFollow=stopFollow;ctx.closeCard=closeCard;ctx.follow=()=>FOL;
let lastF=performance.now(),cardT=0;
animHooks.push(now=>{const dt=Math.min(0.1,(now-lastF)/1000);lastF=now;
  if(FOL){const p=FOL.info.pos();if(!p){stopFollow();return;}const k=1-Math.exp(-dt*3.5);ctl.target.x+=(p[0]-ctl.target.x)*k;ctl.target.y+=(p[1]-ctl.target.y)*k;ctl.target.z+=(p[2]-ctl.target.z)*k;}
  if(shown&&shown.live&&now-cardT>500){cardT=now;const upd=shown.live();if(upd){shown.lines=upd;const keep=shown;showCard(keep);}}});
// descriptions of moving things
const WSTATE={0:'wandering the streets',1:'heading home',3:'walking to the temple stairs',4:'climbing the temple',5:'at the top of the temple',6:'coming down from the temple',7:'heading for the tower lift',8:'waiting for the lift',9:'riding the lift up',10:'strolling the tower balcony',11:'heading back to the lift',12:'riding the lift down'};
function walkerInfo(a,i){return {title:'A townsperson',follow:true,pos:()=>a.st===2?null:[a.x,(a.yo!==undefined?a.yo:meshH(a.x,a.z))+1,a.z],
  live:()=>[{t:a.st===2?'Went indoors.':(a.st===0&&polar(a.x,a.z).r>wallR(polar(a.x,a.z).t)?'Out beyond the walls':(WSTATE[a.st]||'about their day').replace(/^./,c=>c.toUpperCase()))},{t:where(a.x,a.z),sub:true}]};}
function squadInfo(sq,k){const title=sq.guard?'The relief guard':'Patrol squad '+(k+1);return {title,follow:true,pos:()=>sq.guard&&!sq.active?null:[sq.x,meshH(sq.x,sq.z)+1.5,sq.z],
  live:()=>[{t:sq.guard?(sq.leg===1?(sq.wait>0?'Handing over at the palace gate':'Marching to the palace gate'):'Returning to barracks'):(sq.wait>0||!sq.path?'Halted at '+(sq.dest||'its post'):'Marching to '+(sq.dest||'the next post'))},{t:'Twelve soldiers, three abreast · '+where(sq.x,sq.z),sub:true}]};}
function cartInfo(c,k){const GN=['south','west','north-east'];const gi=GATES.indexOf(c.rt.g);return {title:'Hover cart',follow:true,pos:()=>c.hidden>0?null:[c.px,c.py,c.pz],
  live:()=>[{t:(c.dir>0?'Heading out along ':'Heading in along ')+'the '+GN[gi]+' road'},{t:c.side==='gate'?'Passing through the gate':c.side==='out'?'Out on the causeway road':'Inside the walls',sub:true}]};}
function birdInfo(b){const tower=b.f.c[1]>110;return {title:'A bird of the '+(tower?'tower':'temple')+' flock',follow:true,pos:()=>b.p?[b.p[0],b.p[1],b.p[2]]:null,
  live:()=>{const d=b.perch&&b.p?Math.hypot(b.p[0]-b.perch[0],b.p[1]-b.perch[1],b.p[2]-b.perch[2]):99;return [{t:nightF(ctx.hour||0)>0.6?(d<0.2?'Roosting on the battlements':'Flying home to roost'):'Circling '+(tower?'the observation tower':'the temple summit')}];}};}
// fixed places
const IZNAME=DATA.lex.placeNames;
function izCard(key,where){const e=ctx.izE[key];return {title:'Izani: '+e.lines.join(' / '),img:IZ.thumb(key,46),imgAlt:e.lines.join(' / '),lines:[{t:e.means},{t:e.parts,sub:true},{t:'Found '+(where||'in the city'),sub:true}]};}
ctx.izCard=izCard;
function lotInfo(l){const b=bodyOf(l)||{w:l.fx*2,d:l.fz*2,h:l.h},L=buildingLight(l.x,l.z),tall={tier:1.02,domed:1.15,barrel:0.75,tent:0.7,midrise:1.02,setback:1.1,stave:1.6,hall:1.75}[l.kind]||1;
  const extra=[l.ivy&&'ivy on its walls',l.boxes&&'window boxes',l.cistern&&'a rooftop cistern',l.chimney&&'a smoking chimney',l.laundry&&'a washing line across the street',l.garden&&'a rooftop garden',l.baskets&&'hanging baskets by the door',l.sign&&ctx.izE&&('a painted sign: '+ctx.izE[l.sign].lines[0]+' ('+ctx.izE[l.sign].means.split(', ').slice(1).join(', ')+')'),l.graffiti&&'paint on one wall',l.festPoster&&'a festival poster',l.artPrint&&'a framed print of the Iziz painting',l.poster&&'posters on its side walls',l.forge&&'a smithy at its side',l.bath&&'a bathhouse inside'].filter(Boolean);
  hl.position.set(l.x,terrainH(l.x,l.z)-0.6+l.h*tall/2,l.z);hl.scale.set(b.w+0.4,l.h*tall+0.3,b.d+0.4);hl.rotation.set(0,l.ry,0);hl.visible=true;
  return {title:(l.construction?'Building site: ':'')+(KIND[l.kind]||'Building'),lines:[{t:'In '+where(l.x,l.z)+(l.construction?', under scaffolding with a crane beside it':'')},{t:`About ${Math.round(l.h*tall)} m tall · ${DISTRICTS[DGROUP[l.kind]||'houses'][0].toLowerCase()} district colour`},
    {t:'Windows light from '+hhmm(L.on)+(L.off>=29.5?'; some burn all night':', dark again by '+hhmm(L.off))},extra.length?{t:'Has '+extra.join(', '),sub:true}:null].filter(Boolean)};}
function placeInfo(x,y,z,obj){const p=polar(x,z),R=wallR(p.t),ro=p.r-R;hl.visible=false;
  if(obj&&obj.userData.greatTree&&ctx.greatTrees){let best=null,bd=1e9;for(const T of ctx.greatTrees){const d=Math.hypot(T.x-x,T.z-z)/T.cr;if(d<bd){bd=d;best=T;}}
    if(best&&bd<1.4){const K=[['a broad shade tree','saliz','"house-tree", it shelters like a roof'],['a tall tree','noriz','"tall tree"'],['a weeping tree','vaeliz','"water-tree", it grows best by pools and wells'],['a blossom tree','shaeliz','"light-tree", for its pale flowers']][best.kind];
      if(best.first)return {title:'Izor, the great tree',img:IZ.thumb('st_izor',46),imgAlt:'Izor / Iziz iz',lines:[{t:'Said to be the first tree of Iziz: the first house was raised beside it, and the city grew outward from its shade'+(Math.hypot(best.x-PALACE.x,best.z-PALACE.z)<135?'. It stands on the hill below the Salor.':'.')},{t:`About ${Math.round(best.h+best.cr*0.6)} m tall, its crown ${Math.round(best.cr*2)} m across. The Izan say it is older than the city.`,sub:true},{t:'In Izani: Izor, iz "tree" + -or "great"',sub:true}]};
      return {title:'An old tree: '+K[0].replace(/^an? /,''),lines:[{t:`${best.wild?'One of the old giants of the forest':'Grown up inside the walls'}, perhaps ${best.age} years old. About ${Math.round(best.h+best.cr*0.5)} m tall, its crown ${Math.round(best.cr*2)} m across.`},{t:'In '+where(best.x,best.z)},{t:`In Izani: ${K[1]}, ${K[2]}`,sub:true}]};}}
  const near=(cx,cz,r)=>Math.hypot(x-cx,z-cz)<r;
  if(near(PALACE.x,PALACE.z,70))return {title:'The Palace',lines:[{t:'Terraced keep with the stepped watchtower, behind its own curtain wall.'},{t:'Two gates with gun towers, four barracks; most windows burn all night. The guard changes at 06:00 and 18:00.',sub:true}]};
  if(near(TEMPLE.x,TEMPLE.z,46))return {title:'The Temple',lines:[{t:'A stepped pyramid raised on four legs, with an assembly hall beneath.'},{t:'Braziers at the summit after dusk; bells ring at 06, 12, 18 and 00.',sub:true}]};
  {const ex=(x-ARENA.x)/60,ez=(z-ARENA.z)/52;if(ex*ex+ez*ez<1)return {title:'The Arena',lines:[{t:'Evening sessions under floodlights from about 17:00.'},{t:'Fighters on the sand, crowds on the tiers.',sub:true}]};}
  if(near(NEEDLE.x,NEEDLE.z,22))return {title:'The observation tower',lines:[{t:'A lift runs every 14 seconds to the balcony, '+Math.round((ctx.needle||{H:80}).H+7)+' m up.'},{t:'Birds circle the top by day.',sub:true}]};
  if(near(SP.x,SP.z,SPR))return {title:'The spaceport',lines:[{t:'Freighter pad, six landing pads, a control tower with a turning beacon.'},{t:'Steam vents at the fuel farm; apron floods come on at dusk.',sub:true}]};
  if(near(25,40,20))return {title:'The dome hall',lines:[{t:'A domed assembly hall near the centre.'}]};
  if(near(0,0,30))return {title:'The central square',lines:[{t:'A ring pool around the statue, benches, twelve lamp columns and four light masts.'}]};
  if(near(AMPH.x,AMPH.z,26))return {title:'The amphitheatre',lines:[{t:'An open-air stage in the park; the band plays in the evening.'}]};
  for(const b of BARRACKS)if(near(b.x,b.z,22))return {title:'Barracks',lines:[{t:'Quarters for the palace guard, built into the curtain wall.'}]};
  if(SEWER.sg&&near(...wpt(SEWER.sg,0,6.5),12))return {title:'The sewer outfall',lines:[{t:'The city\u2019s drains empty through a grated culvert into the moat.'},{t:'A drain channel runs down the nearest outer street to meet it.',sub:true}]};
  const gi=GATES.findIndex(g=>angDiff(p.t,g)<0.12);
  if(Math.abs(ro)<16&&gi>=0)return {title:['The south gate','The west gate','The north-east gate'][gi],lines:[{t:'A sloped gatehouse with a 22 m throughway; the doors drop from 22:00 to 06:00.'},{t:'Two guards inside the mouth, spotlights on the bridge after dark.',sub:true}]};
  if(ro>-10&&ro<12&&y>meshH(x,z)+1)return {title:'The outer wall',lines:[{t:'22 m of battered stone with towers every third segment, merlons, sentries and their shelters.'},{t:'Searchlights on some towers; ivy thickest on the far side.',sub:true}]};
  if(ctx.bridgeY&&ctx.bridgeY(x,z)!==null)return {title:'The rope bridge',lines:[{t:'A plank footbridge where the jungle path crosses the river.'},{t:'Fishing lanterns burn at each end until about 23:30.',sub:true}]};
  if(ro>30&&riverHit(x,z,1))return ro<47?{title:'The falls',lines:[{t:'The river drops about 8 m down the chasm wall into the moat.'}]}:{title:'The river',lines:[{t:'Runs out of the lake in the south-east corner to feed the moat.'},{t:'Reeds at the banks, lily pads in the slack water.',sub:true}]};
  if(DOCKROAD.inn&&Math.hypot(x-DOCKROAD.inn[0],z-DOCKROAD.inn[1])<9)return {title:'The waystation',lines:[{t:'A small inn halfway along the dock road, with a hitching rail and a lamp.'}]};
  if(roadD(x,z)<6)return {title:'The dock road',lines:[{t:'A paved road from the lake docks to the south causeway, with lamps and milestones.'},{t:'Dock carts carry the catch and cargo up to the southern market.',sub:true}]};
  if(LAKE.harbor&&Math.hypot(x-LAKE.harbor.centre[0],z-LAKE.harbor.centre[1])<42)return {title:'The docks',lines:[{t:'A stone quay and a timber pier with six berths, a warehouse and a cargo crane.'},{t:'Fishing boats tie up here at dusk and leave at dawn; sailing boats put in now and then.',sub:true}]};
  if(lakeE(x,z)<1.05)return {title:'The lake',lines:[{t:'A reedy lake in the south-east corner; the river drains it towards the city.'},{t:'Sailing boats and a pleasure barge by day, fishing boats at anchor, a jetty with a lamp.',sub:true}]};
  if(ro>6&&ro<38&&y<-8)return {title:'The moat',lines:[{t:'Fed by the river; lights on the wall reflect in it at night.'}]};
  return null;}
const ray=new THREE.Raycaster(),ndc=new THREE.Vector2(),v3=new THREE.Vector3();
const skipHit=o=>{for(let q=o;q;q=q.parent){if(q.userData.isWire||q.userData.noWire&&!q.userData.cat)return true;}const m=o.material,t=m&&m.userData&&m.userData.tex;return o===sky||t==='leaf'||t==='canopy'||t==='bark'||(m&&m.blending===THREE.AdditiveBlending);};
ctx.inspectClick=e=>{
  ndc.set(e.clientX/innerWidth*2-1,-(e.clientY/innerHeight)*2+1);ray.setFromCamera(ndc,camera);ray.layers.mask=camera.layers.mask;
  const hits=ray.intersectObjects(scene.children,true).filter(h=>!skipHit(h.object));const first=hits[0];const hitD=first?first.distance:1e9;
  // moving things: nearest on screen within reach, unless something solid is clearly in front
  let best=null,bd=1;const cand=(x,y,z,make,reach)=>{v3.set(x,y,z);const d=v3.distanceTo(camera.position);if(d>hitD+4)return;v3.project(camera);if(v3.z>1)return;
    const sx=(v3.x+1)/2*innerWidth,sy=(1-v3.y)/2*innerHeight,sd=Math.hypot(sx-e.clientX,sy-e.clientY)/reach;if(sd<bd){bd=sd;best=make;}};   // reach in pixels: bigger things are easier to hit
  if(DISPLAY.life){(ctx.patrol?ctx.patrol.squads:[]).forEach((sq,k)=>{if(sq.guard&&!sq.active)return;cand(sq.x,meshH(sq.x,sq.z)+1.2,sq.z,()=>squadInfo(sq,k),34);const q=ctx.patrol.rankAt(sq,6.7);cand(q[0],meshH(q[0],q[1])+1.2,q[1],()=>squadInfo(sq,k),34);});
    (ctx.cartList||[]).forEach((c,k)=>{if(c.hidden<=0&&c.px!==undefined)cand(c.px,c.py,c.pz,()=>cartInfo(c,k),30);});
    (ctx.boats||[]).forEach(b=>{if(b.pos)cand(b.pos[0],b.pos[1],b.pos[2],()=>ctx.boatInfo(b),34);});
    (ctx.traffic||[]).forEach(c=>{if(c.phase!=='away')cand(c.sh.position.x,c.sh.position.y+2,c.sh.position.z,()=>ctx.trafficInfo(c),36);});
    (ctx.caravans||[]).forEach(c=>{if(c.pos&&c.phase!=='away')cand(c.pos[0],c.pos[1],c.pos[2],()=>ctx.caravanInfo(c),34);});
    (ctx.birds||[]).forEach(b=>{if(b.p)cand(b.p[0],b.p[1],b.p[2],()=>birdInfo(b),24);});
    (ctx.agents||[]).forEach((a,i)=>{if(a.st!==2)cand(a.x,(a.yo!==undefined?a.yo:meshH(a.x,a.z))+1,a.z,()=>walkerInfo(a,i),14);});}
  if(best){const info=best();hl.visible=false;showCard(info);return true;}
  if(first){const o=first.object,lot=o.userData.lotOf&&first.instanceId!==undefined?o.userData.lotOf[first.instanceId]:null;
    if(lot){stopFollow();showCard(lotInfo(lot));return true;}
    if(o.userData.izInfo&&first.instanceId!==undefined){const inf=o.userData.izInfo[first.instanceId];if(inf){stopFollow();hl.visible=false;showCard(izCard(inf.key,inf.where));return true;}}
    const pl=placeInfo(first.point.x,first.point.y,first.point.z,o);if(pl){stopFollow();const nm=IZNAME[pl.title];if(nm&&ctx.izE&&ctx.izE[nm]){const e=ctx.izE[nm];pl.img=IZ.thumb(nm,46);pl.imgAlt=e.lines.join(' / ');pl.lines=[{t:'In Izani: '+e.lines[0]+' ('+e.parts.split(' · ')[0]+')'}].concat(pl.lines||[]);}showCard(pl);return true;}}
  if(!first&&ctx.skyCard){const sc=ctx.skyCard();if(sc){stopFollow();hl.visible=false;showCard(sc);return true;}}
  if(card.classList.contains('on')&&!FOL)closeCard();
  return false;};
}
