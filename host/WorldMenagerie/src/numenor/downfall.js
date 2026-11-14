// The Downfall (#era=downfall). Fan work from Tolkien, whose world belongs to the Tolkien Estate; every shape and
// every word here is this project's own.
//
// In this era the Hallow is forsaken, Nimloth is a stump and the Temple smokes in Armenelos (landmarks.js), and the
// weather is held fair under a darkened sky. Out of the west, over the sea, come the clouds shaped like eagles, their wings spread
// north and south, lit red underneath at evening. "Begin the Downfall" (or #fall=<second> in the address, which also
// starts it that far in) runs the end: the eagles come over the island, lightning strikes the Temple and its dome
// burns, the Meneltarma takes fire, and the sea rises over everything, the mountain last. Raising the sea is how
// the island goes down: the land is left where it is and the water comes up over it.
//
// In the other era this only adds the way across: a button to the Downfall.
import { softTex, gloomDome, lightning, cloudFigure, plume, risingSea } from '../core/storm.js';

export function downfall(api){
  const {THREE,ctx,scene,camera,animHooks,nightF,hour}=api;
  const land=ctx.nmLand||{},MEN=land.menel||{},MX=(MEN.at||[0,0])[0],MZ=(MEN.at||[0,0])[1],MH=MEN.h||3000;
  const peak=(ctx.menelH?ctx.menelH(MX,MZ):MH)+0;
  // ---- the way between the eras ----
  const css='position:fixed;left:50%;bottom:64px;transform:translateX(-50%);z-index:40;display:flex;gap:8px;font:13px/1.2 Georgia,serif';
  const bar=document.createElement('div');bar.style.cssText=css;document.body.appendChild(bar);
  const btn=(label,fn)=>{const b=document.createElement('button');b.textContent=label;b.style.cssText='padding:7px 13px;border-radius:4px;border:1px solid #8a7a5a;background:rgba(20,18,16,0.78);color:#efe4c8;cursor:pointer;font:inherit';b.onclick=fn;bar.appendChild(b);return b;};
  const goEra=e=>{const q=new URLSearchParams(location.hash.slice(1));q.delete('v');q.delete('view');q.delete('fall');if(e==='height')q.delete('era');else q.set('era',e);location.hash=q.toString();location.reload();};
  if(ctx.era!=='downfall'){btn('The Downfall →',()=>goEra('downfall'));ctx.details=Object.assign(ctx.details||{},{era:'height'});return;}
  btn('← Númenor at its height',()=>goEra('height'));
  const go=btn('Begin the Downfall',()=>start(0));

  let wSet=false;const holdWeather=()=>{const W=ctx.weather;if(!wSet&&W&&W.set){W.set('fair',true);wSet=true;}};
  // the pieces are src/core/storm.js's: the gloom over the sky, lightning, the eagle clouds, the plume, the sea
  const tex=softTex(THREE),gloom=gloomDome(api),bolt=lightning(api,{gloom}),sea=risingSea(api);

  // ---- the eagles of the Lords of the West: three cloud-masses in the shape of eagles, wings north and south ----
  // they wait over the sea west of the island, coming on very slowly; begun, they come over it
  const HOME=[[-330000,-150000,30000],[-290000,0,36000],[-330000,150000,30000]],OVER=[[-60000,-120000,26000],[-30000,0,32000],[-60000,120000,26000]];
  const EAGLES=[0,1,2].map(k=>cloudFigure(api,{shape:'eagle',span:150000*(k===1?1.2:0.9),seed:1441+k,tex}));
  const place=(k,f)=>{const a=HOME[k],b=OVER[k];EAGLES[k].position.set(a[0]+(b[0]-a[0])*f,a[2]+(b[2]-a[2])*f,a[1]+(b[1]-a[1])*f);};

  // ---- the Meneltarma's fire: a glow on the summit and a column of smoke ----
  const fire=plume(api,{x:MX,y:peak+40,z:MZ,tex,count:500,height:6000,spread:1800,glowSize:900});

  const under=document.createElement('div');under.style.cssText='position:fixed;inset:0;pointer-events:none;z-index:29;background:linear-gradient(#1c4a5a,#08202a);opacity:0;transition:opacity 0.3s';document.body.appendChild(under);
  const cap=document.createElement('div');cap.style.cssText='position:fixed;left:50%;top:18%;transform:translateX(-50%);z-index:41;color:#f2e6c8;font:italic 22px/1.3 Georgia,serif;text-shadow:0 2px 8px #000;text-align:center;opacity:0;transition:opacity 1.2s;pointer-events:none;max-width:80vw';document.body.appendChild(cap);
  const say=t=>{cap.textContent=t;cap.style.opacity=t?'1':'0';};
  const setSea=L=>sea.set(L);

  // ---- the end, in seconds from its start ----
  const D=Object.assign({arrive:30,strike:12,mountain:24,rise0:34,rise1:190,end:200},(ctx.downfallTimes||{}));
  const TOPL=peak+120;
  const CAPS=[[1,'Out of the West the clouds came, in the shape of eagles'],[D.strike,'The lightning broke on the Temple, and its dome burned'],[D.mountain,'Fire came out of the Meneltarma'],
    [D.rise0+6,'And the sea rose'],[D.rise1-30,'The Pillar of Heaven, last of all'],[D.end,'Akallabêth: the Downfallen']];
  let t0=null,lastStrike=0,ci=-1;
  function start(at){t0=performance.now()/1000-(at||0);go.textContent='Again';go.onclick=()=>{const q=new URLSearchParams(location.hash.slice(1));q.set('fall','0');location.hash=q.toString();location.reload();};}
  const ease=x=>x<=0?0:x>=1?1:x*x*(3-2*x);
  let last=0;
  animHooks.push(now=>{const dt=Math.min(0.1,(now-(last||now))/1000);last=now;holdWeather();
    const T=t0==null?-1:performance.now()/1000-t0;
    // the eagles: waiting, or coming over
    const f=T<0?0:ease(T/D.arrive);for(let k=0;k<3;k++){place(k,f);const e=EAGLES[k],n=nightF(hour());
      // lit red underneath toward evening, black in the night
      e.material.color.setRGB(1+1.4*n,1+0.1*n,1).multiplyScalar(1-0.5*n);}
    gloom.update(dt);bolt.update(dt);
    if(T<0){setSea(0);return;}
    gloom.alpha=0.45+0.4*Math.min(1,T/D.arrive);
    while(ci+1<CAPS.length&&T>=CAPS[ci+1][0]){ci++;say(CAPS[ci][1]);}
    if(ci>=0&&T>CAPS[ci][0]+7&&ci<CAPS.length-1)say('');
    // lightning: on the Temple first, then on the mountain and anywhere
    if(T>D.strike-0.5&&T-lastStrike>(T<D.rise0?1.4:0.7)*(0.6+Math.random())){lastStrike=T;const tp=ctx.temple,L=ctx.seaLevel||0;
      if(tp&&T<D.strike+1&&L<tp.top)bolt.strike(tp.x,tp.top,tp.z,9000);
      else if(Math.random()<0.4)bolt.strike(MX+(Math.random()-0.5)*800,Math.max(L,peak)+10,MZ+(Math.random()-0.5)*800,9500);
      else{const x=(Math.random()-0.5)*300000,z=(Math.random()-0.5)*260000,g=(ctx.groundH||api.groundH)(x,z);bolt.strike(x,Math.max(L,g),z,8000);}}
    if(ctx.temple&&T>=D.strike)ctx.temple.fire=Math.min(1,(T-D.strike)/4);
    // the mountain's fire
    const mf=T<D.mountain?0:Math.min(1,(T-D.mountain)/6),L=ctx.seaLevel||0,drowned=L>peak;
    fire.strength=drowned?0:mf;fire.update(dt,T);
    // the sea, with a long swell on it as it comes
    const r=(T-D.rise0)/(D.rise1-D.rise0),Ls=r<=0?0:TOPL*Math.pow(Math.min(1,r),1.7)+(r>0&&r<1?Math.sin(T*0.9)*18*r:0);setSea(Math.max(0,Ls));
    // whoever is watching is lifted with the flood and looks out over it (left under it, the view is the sea's
    // surface edge-on and the drowned land through it); the tint is for a camera that dives on purpose
    // (high enough that the camera's near plane, which the engine sets from its height over the ground, does not cut the water away under it)
    {const sl=ctx.seaLevel||0,lift=sl+Math.max(40,camera.near*4)-camera.position.y;if(sl>0&&lift>0){camera.position.y+=lift;if(api.ctl&&api.ctl.target)api.ctl.target.y+=lift;}}
    under.style.opacity=camera.position.y<(ctx.seaLevel||0)-5?'0.72':'0';
    ctx.details.downfall={t:Math.round(T),sea:Math.round(ctx.seaLevel||0),peak:Math.round(peak),drowned};});
  ctx.details=Object.assign(ctx.details||{},{era:'downfall',eagles:EAGLES.length,waters:sea.count});
  // #fall=<second>: begin it already, that far in
  try{const q=new URLSearchParams(location.hash.slice(1));if(q.has('fall'))start(parseFloat(q.get('fall'))||0);}catch(e){}
}
