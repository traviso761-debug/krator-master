// TARGET: erewhon — camera presets. [camX,camY,camZ, targetX,targetY,targetZ]
const _eye=(x,z,tx,tz,dy)=>[x,terrainH(x,z)+1.7+(dy||0),z,tx,terrainH(tx,tz)+4,tz];
const _at=k=>DIST.find(d=>d.kind===k||d.name===k);
const _land=key=>PLAN.find(p=>p.key===key);
const VIEWS=(function(){const V={};const pal=_at('palace'),gd=_at('garden'),mm=_at('Main market'),td=_at('temple'),dk=_at('dock'),isl=_at('island'),lh=_at('lighthouse'),pr=_at('prison'),cv=_at('cave'),wh=_at('Wealthy homes (east)');
 V['Opening — from the lake']=[mm.x-200,120,mm.z-700,pal.x+100,terrainH(pal.x,pal.z)+10,pal.z];
 V['Overview']=[0,1500,900,0,100,-100];
 V['Overhead — the town']=[mm.x-150,900,mm.z+1,mm.x-150,0,mm.z];
 V['Overhead — the garden']=[gd.x,420,gd.z+1,gd.x,0,gd.z];
 V['Overhead — the slopes']=[gd.x+80,520,gd.z+161,gd.x+80,0,gd.z+160];
 V['The palace precinct']=[pal.x+220,terrainH(pal.x,pal.z)+140,pal.z+200,pal.x,terrainH(pal.x,pal.z)+20,pal.z];
 V['The garden district']=[gd.x+180,terrainH(gd.x,gd.z)+110,gd.z+160,gd.x,terrainH(gd.x,gd.z),gd.z];
 {const R=GARDEN_RECT,za=R.z-R.d/2+4+7*8;V['Garden district — the rill']=_eye(R.x+R.w/2-6,za,R.x-R.w/2,za,3);V['Garden district — from the ring road']=_eye(R.x+R.w/2+16,za+30,R.x-R.w/4,za,8);}
 {const n=nearestOnLines(ER_LINES.highway,mm.x,mm.z);const dx=n.b[0]-n.a[0],dz=n.b[1]-n.a[1],l=Math.hypot(dx,dz)||1;V['Main market — the highway']=_eye(n.x-dx/l*40,n.z-dz/l*40,n.x+dx/l*60,n.z+dz/l*60);}
 V['Main market — the square']=_eye(mm.x+20,mm.z+22,mm.x-30,mm.z-30,1);
 V['The temple district']=[td.x+200,terrainH(td.x,td.z)+130,td.z+180,td.x,terrainH(td.x,td.z)+10,td.z];
 V['The dockyard']=[dk.x+120,60,dk.z-160,dk.x,10,dk.z];
 V['Pleasure Dome of the Bay']=[isl.x+150,50,isl.z+140,isl.x,14,isl.z];
 V['The lighthouse']=[lh.x+90,40,lh.z-90,lh.x,20,lh.z-20];
 {const p=_land('xa_prison')||pr;V['The prison']=[p.x+60,terrainH(p.x,p.z)+22,p.z-70,p.x,terrainH(p.x,p.z)+10,p.z];}
 {const c=_land('xa_ice_cave')||cv;V['The Caves of Ice']=[c.x+30,terrainH(c.x,c.z)+14,c.z-60,c.x,terrainH(c.x,c.z)+6,c.z];}
 // the avenue stretch (inside the bounds) with the most rich frontage; the east district's centre lies outside them
 {const inAv=[];for(const P of ER_LINES.avenue){let run=[];for(const p of P){if(ER_INCITY(p[0],p[1]))run.push(p);else{if(run.length>1)inAv.push(run);run=[];}}if(run.length>1)inAv.push(run);}
  const B={};let best=null;for(const p of PLAN){if(p.wealth!=='rich'||!p.front)continue;const q=nearestOnLines(inAv,p.front[0],p.front[1]);if(!q||q.d>8)continue;const k=Math.round(q.x/60)+','+Math.round(q.z/60);const c=B[k]||(B[k]={n:0,q});c.n++;if(!best||c.n>best.n)best=c;}
  const n=best?best.q:nearestOnLines(ER_LINES.avenue,wh.x,wh.z);if(n){const dx=n.b[0]-n.a[0],dz=n.b[1]-n.a[1],l=Math.hypot(dx,dz)||1;V['Wealthy homes — the avenue']=_eye(n.x-dx/l*30,n.z-dz/l*30,n.x+dx/l*70,n.z+dz/l*70,1);}else V['Wealthy homes — the avenue']=_eye(wh.x-40,wh.z-60,wh.x+60,wh.z+20);}
 const g=GATES.find(g=>g.kind==='west');if(g)V['West gate — from the highway']=_eye(g.x-70,g.z+10,g.x+20,g.z,3);
 const ge=GATES.find(g=>g.kind==='east');if(ge)V['East gate — from the highway']=_eye(ge.x+70,ge.z-10,ge.x-20,ge.z,3);
 return V;})();
