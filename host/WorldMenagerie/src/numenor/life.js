// What moves on Numenor: ships putting out from the havens and coming home, and the fishing boats off Nindamos. An
// extra, after the landmarks (which make ctx.shipParts) and nature. Fan work from Tolkien, whose world belongs to the
// Tolkien Estate; every ship is this project's own design.
//
// A ship's way out is open water: from Romenna it goes down the firth (its centre line is in the land file), from
// the others along the bearing with the longest run of open sea from the quay. It sails out forty kilometres and
// more, turns, and comes home; at a map this size that is a long way, so they are grown with distance to stay in sight.
import { mkRng } from '../core/rng.js';

export function life(api){
  const {THREE,ctx,C,scene,camera,animHooks,inWater,groundH}=api;
  const land=ctx.nmLand,make=ctx.shipParts;if(!land||!make)return;
  const Y=C.numenor||{},R=mkRng(3255),gH=ctx.groundH||groundH,wet=(x,z)=>gH(x,z)<-2;
  const HAVENS={Romenna:0.34,Andunie:0.22,Eldalonde:0.12,Nindamos:0.1,'Moriondë':0.1,Hyarastorni:0.12};
  const routes={};
  for(const name in HAVENS){const p=land.places[name];if(!p)continue;const [hx,hz]=p;let best=null;
    if(name==='Romenna'&&land.firth){const f=land.firth.map(([x,z])=>[x,z]);const [ax,az]=f[f.length-2],[bx,bz]=f[f.length-1],dx=bx-ax,dz=bz-az,l=Math.hypot(dx,dz);
      f.push([bx+dx/l*40000,bz+dz/l*40000]);best=f;}
    else{let bl=0,ba=0,bs=null;
      for(let a=0;a<360;a+=4){const ux=Math.sin(a*Math.PI/180),uz=-Math.cos(a*Math.PI/180);let t=0;while(t<6000&&!wet(hx+ux*t,hz+uz*t))t+=60;if(t>=6000)continue;
        const s=[hx+ux*(t+250),hz+uz*(t+250)];let run=0;while(run<60000&&wet(s[0]+ux*run,s[1]+uz*run))run+=500;
        if(run>bl){bl=run;ba=a;bs=s;}}
      if(bs){const ux=Math.sin(ba*Math.PI/180),uz=-Math.cos(ba*Math.PI/180);best=[bs,[bs[0]+ux*bl*0.95,bs[1]+uz*bl*0.95]];}}
    if(best)routes[name]=best;}
  const N=Y.ships===undefined?34:Y.ships,ships=[];
  const lenOf=pts=>{let L=0;for(let i=1;i<pts.length;i++)L+=Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]);return L;};
  const at=(pts,s)=>{for(let i=1;i<pts.length;i++){const [ax,az]=pts[i-1],[bx,bz]=pts[i],l=Math.hypot(bx-ax,bz-az);if(s<=l||i===pts.length-1){const t=Math.min(1,s/l);return [ax+(bx-ax)*t,az+(bz-az)*t,Math.atan2(bz-az,bx-ax)];}s-=l;}return [pts[0][0],pts[0][1],0];};
  const names=Object.keys(routes);
  for(let k=0;k<N&&names.length;k++){let r=R(),name=names[0];for(const n of names){r-=HAVENS[n];if(r<=0){name=n;break;}}
    const pts=routes[name],L=lenOf(pts),len=30+R()*40,o=make(len,len>48?3:2,R()<0.25?0xe8d8b8:0xf6f2ea);
    o.traverse(m=>{if(m.isMesh){m.castShadow=true;m.userData.noWire=true;}});scene.add(o);
    ships.push({o,pts,L,len,s:R()*L*2,v:(5+R()*4)*(Y.shipPace||12),name});}
  // fishing boats: small, one mast, milling about off the haven they belong to
  const boats=[];for(const name of ['Nindamos','Andunie','Romenna','Moriondë']){const rt=routes[name];if(!rt)continue;const [sx,sz]=rt[0],[ex,ez]=rt[rt.length-1];
    for(let k=0;k<6;k++){const f=0.15+R()*0.35,cx=sx+(ex-sx)*f*0.4,cz=sz+(ez-sz)*f*0.4,o=make(12+R()*6,1,0xe0d0b0);o.traverse(m=>{if(m.isMesh)m.userData.noWire=true;});scene.add(o);
      boats.push({o,cx,cz,r:400+R()*1200,a:R()*6.28,w:(R()<0.5?-1:1)*(0.004+R()*0.006)});}}
  let last=0;
  animHooks.push(now=>{const dt=Math.min(0.1,(now-(last||now))/1000);last=now;
    const fovK=Math.tan(camera.fov*Math.PI/360)*2/innerHeight;
    for(const sh of ships){sh.s=(sh.s+sh.v*dt)%(sh.L*2);const out=sh.s<sh.L,s=out?sh.s:2*sh.L-sh.s,[x,z,a]=at(sh.pts,s);
      sh.o.position.set(x,(ctx.seaLevel||0)+0.4,z);sh.o.rotation.y=-(out?a:a+Math.PI);
      const d=camera.position.distanceTo(sh.o.position),need=d*fovK*5/sh.len;sh.o.scale.setScalar(Math.max(1,need));
      sh.o.visible=d<160000;}
    for(const b of boats){b.a+=b.w*dt*12;const x=b.cx+Math.cos(b.a)*b.r,z=b.cz+Math.sin(b.a)*b.r;
      if(!(ctx.seaLevel>2)&&!wet(x,z)){b.w=-b.w;continue;}b.o.position.set(x,(ctx.seaLevel||0)+0.4,z);b.o.rotation.y=-(b.a+Math.sign(b.w)*Math.PI/2);b.o.visible=camera.position.distanceTo(b.o.position)<30000;}});
  ctx.details=Object.assign(ctx.details||{},{ships:ships.length,boats:boats.length,routes:Object.fromEntries(Object.entries(routes).map(([k,v])=>[k,Math.round(lenOf(v)/1000)+' km']))});
}
