// The stairs check (the owner, 2026-10-19: "make sure everything respects core/walk because many stairs don't work"). Run in a
// built Iziz page (verify.py --eval "()=>JSON.stringify(IZWALKCHECK())" or the browser console): every strip in core/walk (a
// stair's flight, a ramp, steps) is walked from 0.4 m before its foot to 0.4 m past its top (a walker steps off by its radius), every 0.15 m, as the host's walker
// moves (radius 0.35, 1.7 tall, a step of 0.6): at each point there must be a floor within a step of where the walker is, and
// no block in its way. A strip that fails is listed with where (t: 0 its foot, 1 its top) and why.
window.IZWALKCHECK=function(o){o=o||{};const W=KWALK,ex=W.export(),R=o.r||.35,H=o.h||1.7,STEP=.6,fails=[],byTag={};let n=0;
 /* a door opens (E, or an NPC): its leaf's blocks do not count */
 const blockedNoDoor=(x,y,z)=>{const off=[];let bl;while((bl=W.blocked(x,y,z,R,H))&&/^door:/.test(bl.tag||'')){W.setBlock(bl,false);off.push(bl);}for(const d of off)W.setBlock(d,true);return bl;};
 for(const f of ex.floors){if(f.kind!=='strip')continue;n++;const a=f.a,b=f.b,dx=b[0]-a[0],dz=b[1]-a[1],L=Math.hypot(dx,dz)||1,ext=.4/L,N=Math.max(40,Math.ceil((L+.8)/.15));let y=a[2],bad=null;
  for(let i=0;i<=N&&!bad;i++){const t=-ext+(1+2*ext)*i/N,x=a[0]+dx*t,z=a[1]+dz*t,fb=W.floorBelow(x,z,y,STEP);
   if(!fb){if(t<0&&a[2]<.6||t>1&&b[2]<.6)continue;bad={t:+t.toFixed(2),why:'no floor'};break;}   /* at the street the ground is the floor; a walk that ends a step higher went on up the next flight */
   if(fb[0]<y-STEP-.05&&t>=0&&t<=1){bad={t:+t.toFixed(2),why:'drops '+(y-fb[0]).toFixed(2)+' m'};break;}
   y=fb[0];const bl=blockedNoDoor(x,y,z);if(bl){bad={t:+t.toFixed(2),why:'blocked ('+(bl.tag||'?')+')',at:[+x.toFixed(2),+z.toFixed(2),+y.toFixed(2)],box:bl.box.map(v=>+v.toFixed(2))};break;}}
  if(!bad&&(y<b[2]-.3||y>b[2]+STEP))bad={t:1,why:'ends at '+y.toFixed(2)+', not the top '+b[2].toFixed(2)};
  if(bad){fails.push(Object.assign({name:f.name,tag:f.tag,a:a.map(v=>+v.toFixed(2)),b:b.map(v=>+v.toFixed(2))},bad));const k=(f.tag||'').split('.').slice(0,2).join('.');byTag[k]=(byTag[k]||0)+1;}}
 return{strips:n,fails:fails.length,byTag,first:fails.slice(0,o.list||12)};};
