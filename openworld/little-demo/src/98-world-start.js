// ================================================================= OPEN WORLD — start: decode the region, then stream every frame
// [web] The rasters are PNGs inside the page; the browser decodes them (asynchronously), WORLD.init takes them as typed
// arrays, the LATE modules are defined, the camera goes to its first view, and the frame loop streams: the terrain's
// chunks, the flora's tiles and their instances, the nursery's prototypes and the near floor, each in a time budget
// (larger while the first view loads behind the curtain).
var START={ready:false,frames:0,t0:performance.now()};
(function(){
const M=WORLD_DATA.meta,$=id=>document.getElementById(id),msg=t=>{$('loadmsg').textContent=t;};
function decode(b64){return new Promise((res,rej)=>{const i=new Image();i.onload=()=>res(i);i.onerror=()=>rej(new Error('a raster did not decode'));i.src='data:image/png;base64,'+b64;});}
function pixels(img){const c=document.createElement('canvas');c.width=img.width;c.height=img.height;const g=c.getContext('2d',{willReadFrequently:true});g.drawImage(img,0,0);return g.getImageData(0,0,img.width,img.height).data;}
const ch=(px,n)=>{const a=new Uint8Array(n);for(let i=0;i<n;i++)a[i]=px[i*4];return a;};
async function start(){
 msg('decoding the scale model ('+M.frame.size_px.join(' x ')+' px at 2 km)');
 const im={};for(const k in WORLD_DATA.png)im[k]=await decode(WORLD_DATA.png[k]);
 const lo=M.heights.lo,hi=M.heights.hi,nh=im.elev.width*im.elev.height,nm=im.biome.width*im.biome.height;
 const e=pixels(im.elev),w=pixels(im.wlev),R={elev:new Float32Array(nh),wlev:new Float32Array(nh),whas:new Uint8Array(nh),wflag:new Uint8Array(nh)};
 for(let i=0;i<nh;i++){R.elev[i]=lo+((e[i*4]<<8)|e[i*4+1])/65535*(hi-lo);R.wflag[i]=e[i*4+2]>127?1:0;R.whas[i]=w[i*4+2]>127?1:0;R.wlev[i]=R.whas[i]?lo+((w[i*4]<<8)|w[i*4+1])/65535*(hi-lo):lo;}
 for(const k of ['clim','rain','temp','biome','mask'])R[k]=ch(pixels(im[k]),nm);
 // the escarpments, on the height grid: the floor's and the plateau's levels (16 bits in R,G) and the weight
 const d16=img=>{const p=pixels(img),a=new Float32Array(nh);for(let i=0;i<nh;i++)a[i]=lo+((p[i*4]<<8)|p[i*4+1])/65535*(hi-lo);return a;};
 R.scarpL=d16(im.scarpl);R.scarpU=d16(im.scarpu);R.scarpW=new Float32Array(ch(pixels(im.scarpw),nh));
 WORLD.init(R);
 msg('laying out the land');for(const f of LATE)f();
 CAM.paintBase(R);
 // the first view: the sedesert plateau west of Shade, looking east over the scrub toward the abyss's rim
 const sh=PLACES.list.find(p=>p.name==='Shade')||{x:0,z:0};
 CAM.setView(sh.x-6000,sh.z+2500,140,0,-.12);CAM.lookAt(sh.x,WORLD.H(sh.x,sh.z)+60,sh.z);
 requestAnimationFrame(frame);}
let last=performance.now(),fpsN=0,fpsT=performance.now(),fps=0,lastDraw=null;
const camera=HOST.camera,renderer=HOST.renderer,scene=HOST.scene;
// one step of the streaming; big=true while the curtain is down
function pump(big){TERRAIN.update(big?60:5);FLORA.residency(camera.position,big?40:3);NURSERY.update(big?120:7);FLOOR.update(big?40:2);}
START.pump=pump;
function frame(){requestAnimationFrame(frame);
 const now=performance.now(),dt=Math.min(.1,(now-last)/1000);last=now;START.frames++;
 try{CAM.update(dt);
  pump(!START.ready);
  const P=camera.position;if(!lastDraw||START.frames%6===0||P.distanceTo(lastDraw)>25){FLORA.draw();lastDraw=(lastDraw||P.clone()).copy(P);}
  // the haze thins with height above the ground: thick at the ground (the dust), clear from orbit
  {const agl=Math.max(0,P.y-WORLD.H(P.x,P.z,400));scene.fog.density=1/(90000+agl*12);}
  for(const f of HOST.TICKS)f(dt,now/1000);
  SKY.follow();WATER.frame();PLACES.update();if(START.frames%8===0)CAM.drawMap();
  renderer.render(scene,camera);}
 catch(e){reportErr('frame: '+(e.stack||e));throw e;}
 fpsN++;if(now-fpsT>1000){fps=fpsN*1000/(now-fpsT);fpsN=0;fpsT=now;hud();}
 if(!START.ready&&(TERRAIN.pending()===0&&NURSERY.queued()===0||now-START.t0>45000)){START.ready=true;$('load').style.display='none';}
 else if(!START.ready)msg('terrain chunks to build: '+TERRAIN.pending()+' · plants growing: '+NURSERY.queued());}
const r0=v=>Math.round(v),f1=v=>Math.round(v*10)/10;
function hud(){const P=camera.position,g=WORLD.H(P.x,P.z),b=WORLD.biomeAt(P.x,P.z),cl=WORLD.climate(P.x,P.z),T=TERRAIN.stats,F=FLORA.stats,N=NURSERY.stats,L=FLOOR.stats,ri=renderer.info.render;
 $('hud').textContent=[
  'x '+r0(P.x)+'  z '+r0(P.z)+'  (map px '+f1(WORLD.px(P.x))+', '+f1(WORLD.py(P.z))+')'+(CAM.st.walk?'  walking':''),
  'ground '+r0(g)+' m  above it '+r0(P.y-g)+' m  '+(Math.round(WORLD.pressure(g)*100)/100)+' atm',
  (b?b.name:'?')+(b&&b.kit?' (kit '+b.kit+')':' (no kit yet)')+' · '+(cl?cl.code+' '+cl.name:'')+' · '+r0(WORLD.temp(P.x,P.z))+' °C · '+r0(WORLD.rain(P.x,P.z))+' mm/yr',
  'terrain '+T.drawn+' chunks drawn, '+T.chunks+' held, '+T.queue+' queued',
  'flora '+F.drawn+' drawn (hero '+F.levels[2]+', mid '+F.levels[1]+', far '+F.levels[0]+') of '+F.records+' records in '+F.tiles+' tiles; '+F.pools+' prototypes',
  'nursery '+N.trees+' trees, '+N.patches+' floor patches grown, '+NURSERY.queued()+' queued · floor '+L.chunks+' chunks',
  r0(fps)+' fps · '+ri.calls+' draws · '+(Math.round(ri.triangles/1e5)/10)+' M tris'].join('\n');}
start().catch(e=>reportErr('start: '+(e.stack||e)));
})();
