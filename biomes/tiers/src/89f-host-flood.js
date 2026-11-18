// ================================================================= HOST — the gorge flood, drawn (44g: TIERS_FLOOD; the station's STATION.FLOODS)
// Each flood segment is one ribbon of muddy water over its channel's bed, flat across (the lower bank of each pair), raised to its crest as its
// own hazard record's state rises (KHAZ.state: the same cycle, the same authored offset, so what is drawn is what hurts) and hidden when it is
// dry. The clock is the biome's (BIO.WIND.t, the one the export pins). A page with floods compresses the dry wait (KHAZ.speed = LAND.floodSpeed,
// 3): a storm every ~16 minutes instead of every 40, long enough for one wave to clear its channel before the next. window._floods: each flood's segments, its front speed, and the check's numbers.
const FLOODS=(function(){const F=(typeof STATION!=='undefined'&&STATION.FLOODS)||[];if(!F.length||typeof KHAZ==='undefined')return null;
 try{
  KHAZ.speed=LAND.floodSpeed==null?3:LAND.floodSpeed;
  const MUD=new THREE.Color(0x4a3524).convertSRGBToLinear(),FOAM=new THREE.Color(0xd8ccb8).convertSRGBToLinear();
  const mat=new THREE.MeshStandardMaterial({color:0xffffff,vertexColors:true,roughness:.12,metalness:.08,transparent:true,opacity:.88,depthWrite:true,side:THREE.DoubleSide});   /* either winding reads from above */
  const segs=[];
  F.forEach(FL=>FL.records.forEach((R,i)=>{const hz=KHAZ.make({kind:R.kind,danger:R.danger,shape:R.shape,cycle:R.cycle,move:R.move,tell:R.tell});
   const rec={id:FL.id+':flood:'+i,at:[R.x,R.y,R.z],tags:{hazard:hz}},rib=FL.ribbons[i],pos=[],idx=[],col=[];
   /* where the water pours over a dry fall (the ribbon steeper than ~1 in 2) it is white water: the foam's colour by the slope to the pair before
      or after, whichever is steeper */
   const ys=[];for(let j=0;j<rib.length;j+=2)ys.push(Math.min(rib[j][2],rib[j+1][2])+FL.depth);
   for(let j=0,k=0;j<rib.length;j+=2,k++){const a=rib[j],b=rib[j+1],y=ys[k],run=8;let st=0;if(k)st=Math.max(st,Math.abs(y-ys[k-1])/run);if(k<ys.length-1)st=Math.max(st,Math.abs(ys[k+1]-y)/run);
    const f=Math.max(0,Math.min(1,(st-.4)/1.1)),c=MUD.clone().lerp(FOAM,f*f*(3-2*f));pos.push(a[0],y,a[1],b[0],y,b[1]);col.push(c.r,c.g,c.b,c.r,c.g,c.b);
    if(j)idx.push(j-2,j,j-1,j-1,j,j+1);}
   const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));g.setIndex(idx);g.computeVertexNormals();
   const m=new THREE.Mesh(g,mat);m.userData.host=true;m.userData.probeSkip=true;m.userData.inspectLabel=R.name;m.visible=false;m.renderOrder=2;scene.add(m);
   segs.push({rec,m,depth:FL.depth});}));
  /* ?floodt=<s>: the flood's clock pinned there (a still of the flood for a review; verify.py --query) */
  const QT=new URLSearchParams(location.search).get('floodt'),pin=QT==null?null:+QT;
  const t0=()=>pin!=null&&isFinite(pin)?pin:BIO.WIND&&BIO.WIND.t?BIO.WIND.t.value:performance.now()/1000;
  const upd=tt=>{const t=typeof tt==='number'?tt:t0();for(const S of segs){const k=KHAZ.state(S.rec,t,KHAZ.speed).k;S.m.visible=k>.02;if(S.m.visible)S.m.position.y=-(1-k)*(S.depth+.4);}};
  upd();(BIO.host&&BIO.host.ticks?BIO.host.ticks:(f=>KHOST.on(f,'view')))(()=>upd());   /* a tick passes dt: never take it for the clock */
  window._floods=F.map(FL=>({id:FL.id,segments:FL.records.length,length:Math.round(FL.L),front:FL.front}));
  /* the drawing's own check: at the moment the head is at its crest (its warn and rise past) the head's water stands at its crest and shows, and
     the channel's far end, which the front has not reached, is dry; then the clock is given back */
  const drawn=()=>{const F0=F[0],c=F0.cycle,t=F0.startOf(0,KHAZ.speed)+c.warn+c.ramp+5;upd(t);const h=segs[0],far=segs[F0.records.length-1],
    travel=F0.records[F0.records.length-1].flood.s0/F0.front;
    const r={headUp:h.m.visible&&Math.abs(h.m.position.y)<.05,farDry:travel>c.ramp+10?!far.m.visible:true,travel:Math.round(travel)};upd();return r;};
  return{segs,floods:F,upd,drawn};
 }catch(e){reportErr('the flood: '+(e&&e.stack||e));return null;}})();
/* THE FLOOD'S CHECK (99 adds it, with its fault): the front runs downstream at its speed. For each flood, the time each segment's warning starts
   (its offset's phase in the cycle, KHAZ.speed applied) grows down the channel by the distance over the front's speed, within a second */
const FLOOD_CHK=function(FL,speed){if(!FL||!FL.length)return{ok:false,detail:'no floods'};let bad=0,n=0,worst=0;
 for(const F of FL){const L2=F.cycle.warn+2*F.cycle.ramp+F.cycle.on+F.cycle.after+(F.cycle.period-F.cycle.warn-2*F.cycle.ramp-F.cycle.on-F.cycle.after)/(speed>0?speed:1);
  for(let i=1;i<F.records.length;i++){const a=F.startOf(i-1,speed),b=F.startOf(i,speed),R=F.records,ds=(R[i].flood.s0+R[i].flood.s1-R[i-1].flood.s0-R[i-1].flood.s1)/2;
   let dt=b-a;if(dt<0)dt+=L2;const err=Math.abs(dt-ds/F.front);worst=Math.max(worst,err);n++;if(err>1)bad++;}}
 return{ok:!bad&&n>0,detail:FL.length+' flood(s), '+n+' steps down the channel, '+bad+' out of time (worst '+worst.toFixed(2)+' s)'};};
const FLOOD_DRAWN_CHK=d=>({ok:!!(d&&d.headUp&&d.farDry),detail:d?'head '+(d.headUp?'up':'NOT up')+', far end '+(d.farDry?'dry':'WET')+' (the front '+d.travel+' s down the channel)':'no flood'});
