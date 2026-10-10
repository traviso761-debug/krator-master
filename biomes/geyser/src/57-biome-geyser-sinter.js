// ================================================================= GEYSER — the sinter: the cones and the geyserite
// The cone geysers' cones (lathes in the 'sinter' bucket: a lumpy beaded mound narrowing to the vent's lip, its throat
// going down into the dark; the Lantern a tall spire stepped like a castle; the Twins two), and the geyserite: beads and
// knobs of sinter where the splash dries, round each cone's foot, each spouter's and fountain's pool, each funnel's rim.
(function(){const {TAU,clamp,lerp,mix,smooth,reseed,rng,rr,ri,pick,h3,fbm,qEuler}=BIO.fn;
const PAL=GEYSER.PAL,C=GEYSER.C;
GEYSER.buildSinter=function(q){reseed(570631);q=q==null?1:q;const R=GEYSER.R,M=GEYSER.means(),st={cones:0,beads:0,tris:0};
 const col=k=>GEYSER.bk(pick(PAL.cone),k||1,M.sinter);
 function cone(x,z,c,y0,seed){const h=c.h,r=c.r,top=y0+h,lip=r*(c.spire?.22:.34),rings=[];
  // up the outside: a convex mound (or the spire's steps), then over the lip and down the throat
  const N=c.spire?14:9;
  for(let i=0;i<=N;i++){const t=i/N;let rr0=mix(r,lip,c.spire?t:Math.pow(t,.7)),y=y0-.3+(h+.3)*(c.spire?(Math.floor(t*5)+smooth(.55,.95,t*5-Math.floor(t*5)))/5:1-Math.pow(1-t,1.6));
   rings.push({x,y,z,r:rr0,yy:t,col:col(t>.85?1.08:1)});}
  rings.push({x,y:top+.05,z,r:lip*.82,yy:1,col:col(.9)},{x,y:top-.25,z,r:lip*.55,yy:1,col:col(.6)},{x,y:top-1.4,z,r:lip*.42,yy:1,col:col(.3)});
  st.tris+=BIO.lathe('sinter',rings,18,2,1,(Rg,a)=>Rg.r*(1+.16*(fbm(Math.cos(a)*1.3+seed,Math.sin(a)*1.3+Rg.yy*2.2,5701,2)-.5)+.05*Math.sin(a*9+Rg.yy*20+seed)),null);st.cones++;
  // the beads round the foot, thicker toward the lip on a spire
  for(let k=0,n=Math.round((40+r*12)*q);k<n;k++){const a=rr(0,TAU),t=Math.pow(rng(),.7),rad=mix(r*1.02,r*2.6,t),bx=x+Math.cos(a)*rad,bz=z+Math.sin(a)*rad,by=BIO.terrainH(bx,bz);
   BIO.put('bead',[bx,by+.02,bz],qEuler(rr(0,1),rr(0,TAU),rr(0,1)),[rr(.12,.42)*(1-.5*t),rr(.08,.25),rr(.12,.42)*(1-.5*t)],col(1.05));st.beads++;}}
 R.geysers.forEach((g,i)=>{if(g.kind==='cone')g.vents.forEach((v,j)=>{const c=j?Object.assign({},g.cone,{r:g.cone.r*.9,h:g.cone.h*.9}):g.cone,y0=BIO.terrainH(v[0],v[1]);if(j)g.top2=y0+c.h;cone(v[0],v[1],c,y0,i*3.1+j);});
  else{const pr=g.pool||2;for(let k=0,n=Math.round((g.kind==='spouter'?40:70)*q);k<n;k++){const a=rr(0,TAU),rad=pr*rr(1.05,2.2),bx=g.x+Math.cos(a)*rad,bz=g.z+Math.sin(a)*rad;
    BIO.put('bead',[bx,BIO.terrainH(bx,bz)+.02,bz],qEuler(rr(0,1),rr(0,TAU),rr(0,1)),[rr(.1,.35),rr(.06,.2),rr(.1,.35)],col(1.05));st.beads++;}}
  BIO.register({name:g.name,geyser:g.key,x:g.x,z:g.z,y:g.base-2,r:Math.max(4,(g.cone?g.cone.r:g.pool||3)*1.5),h:(g.cone?g.cone.h:2)+6});});
 R.springs.forEach(s=>{if(s.kind!=='funnel')return;for(let k=0,n=Math.round(24*q);k<n;k++){const a=rr(0,TAU),rad=s.r*rr(1.02,1.5),bx=s.x+Math.cos(a)*rad,bz=s.z+Math.sin(a)*rad;
  BIO.put('bead',[bx,BIO.terrainH(bx,bz)+.02,bz],qEuler(rr(0,1),rr(0,TAU),rr(0,1)),[rr(.08,.25),rr(.05,.14),rr(.08,.25)],col(1.08));st.beads++;}});
 return{sinter:st};};
})();
