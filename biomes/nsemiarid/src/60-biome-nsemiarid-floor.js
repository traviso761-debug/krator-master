// ================================================================= N SEMIARID — floor
// Everything under the trees, by zone, from the same climate fields the tree pass reads (NSEMIARID.zones). THE WALKING
// STEPPE: most of what grows here travels, and each traveller is placed with its heading (PLAN.md section 7):
//   DOWNWIND (NSEMIARID.WIND)  tumblers roll and pile in drifts on the windward face of anything standing; bead chains
//                              break and string their beads out; mace heads and star-drifter crowns lie where they
//                              rolled or landed; a rolled roll-egg leaves a line of seedlings; seed and cotton drift
//                              in the lee; furlers shut in bands where a gust front is passing
//   DOWNSLOPE (toward water)   crawlers grow at their heads and die behind: a green head, a grey trail upslope of it;
//                              striders step toward water, dead stilt stubs behind them
//   IN PLACE                   step cones (a tier a wet year: on the old beds their height reads the years since the
//                              ground came out of the water, the `dry` field), windows, salt fingers on the pans
// DEW GARDENS: anything standing (a boulder here; a hulk or a dock pile in the overlay) condenses dew at night, so the
// small weird plants gather round the boulders in mixed clumps, as on the owner's reference board.
// The zones' floors:
//   DESERT   crawlers, resurrection balls, wormwood, windows, step cones, strider gardens, horn pipes, balloon pods
//   PAN      salt fingers, windows, step cones, crawlers on its edge, salt-crusted stones
//   STEPPE   drill grass (the cover), wormwood, tumblers, tulips, hitchers, censer caps, sail candelabra, mace heads,
//            bead chains, horn pipes, furlers, roll-eggs, star drifters; basalt and tan stones, dew gardens
//   MED      grass and drill grass, tulips, furlers, star drifters, hitchers, glider gourds scrambling over shrubs
//   FOREST   grass, leaf litter, fern, windfall fruit under the trees, lantern seedlings
//   TUGAI    reeds at the water, grass, cotton drifts, roll-eggs
//   RIP      reeds, grass, sedge, flowers, cobbles
(function(){const {TAU,clamp,lerp,mix,smooth,reseed,rng,rr,ri,pick,h3,vnoise,fbm,qEuler,qFacing,qUp}=BIO.fn;
const PAL=NSEMIARID.PAL,zones=NSEMIARID.zones,blocked=NSEMIARID.blocked,C=NSEMIARID.C;
const {bright,shade,vary,tint,means,leafCol}=NSEMIARID;
const Y=(x,z)=>BIO.terrainH(x,z);
const W=()=>NSEMIARID.WIND;
const rockTint=(set,k)=>tint(vary(pick(set||PAL.rockTan),.02,.06,.06),means().rock,k==null?rr(.4,.65):k);
const rodCol=(hex,f)=>shade(vary(hex,.02,.08,.06),f==null?rr(-.45,-.2):f);
const blooms=(x,y,z,r,n,set,sz,item)=>NSEMIARID.blooms(x,y,z,r,n,set,sz,{flat:true,tilt:.4,item:item});
function around(x,z,n,dLo,dHi,fn){for(let i=0;i<n;i++){const a=rr(0,TAU),d=i?rr(dLo,dHi):0,px=x+Math.cos(a)*d,pz=z+Math.sin(a)*d;if(i&&BIO.mask(px,pz)<=0)continue;fn(px,pz,i,a);}}
const okGround=(x,z,pad)=>!blocked(x,z,pad)&&BIO.clearOf(x,z,pad)&&BIO.mask(x,z)>0;
// downslope at a point (toward water): the ground's gradient over 6 m
function downhill(x,z){const e=6,gx=Y(x+e,z)-Y(x-e,z),gz=Y(x,z+e)-Y(x,z-e),l=Math.hypot(gx,gz);if(l<1e-4){const w=W();return[w[0],w[1]];}return[-gx/l,-gz/l];}
// a gust front's band at a point: stripes across the wind, ~60 m apart, warped (the furlers shut where one is passing)
const gustAt=(x,z)=>{const w=W(),u=x*w[0]+z*w[1],v=-x*w[1]+z*w[0];const p=(u+40*fbm(v*.004,u*.004,4401,2))/60;return smooth(.55,.8,p-Math.floor(p))*smooth(1,.9,p-Math.floor(p));};
const field=(n,x,z)=>BIO.field(n,x,z);

// ---------------------------------------------------------------- small plants
function tuft(item,x,y,z,h,w,col){BIO.put(item,[x,y-.05,z],qEuler(rr(-.06,.06),rr(0,TAU),rr(-.06,.06)),[w||h*.8,h,w||h*.8],col);}
function card(item,x,y,z,s,sy,col,tilt){tilt=tilt==null?.2:tilt;BIO.put(item,[x,y,z],qEuler(rr(-tilt,tilt),rr(0,TAU),rr(-tilt,tilt)),[s,sy==null?s:sy,s],col,{n:[rr(-.2,.2),1,rr(-.2,.2)]});}
function wormwood(x,y,z,lv,k){const hc=vary(pick(PAL.wormwood),.03,.08,.05),Rs=rr(.4,.9)*(k==null?1:k);
 card('small',x,y+Rs*.45,z,Rs*1.4,Rs*.75,bright(hc,1.35),.25);if(lv===2&&rng()<.5)card('small',x+rr(-.4,.4),y+Rs*.35,z+rr(-.4,.4),Rs,Rs*.6,bright(hc,1.25),.25);}
function stipa(x,y,z,lv){const h=rr(.5,1.1)*(lv===0?1.5:1);around(x,z,lv===2?ri(2,4):1,.3,1.2,(px,pz)=>tuft('stipa',px,y,pz,h*rr(.8,1.15),h*1.1,leafCol(PAL.stipa,1.05,.02,.06,.05)));}
function grass(x,y,z,lv,k){const h=rr(.3,.7)*(k==null?1:k)*(lv===0?1.6:1);around(x,z,lv===2?ri(3,6):lv===1?2:1,.4,1.6,(px,pz)=>tuft('grass',px,y,pz,h*rr(.8,1.15),h*1.5,leafCol(PAL.grass,1.25,.04,.12,.06)));}
function reed(x,y,z,lv){const h=rr(1.4,2.8)*(lv===0?1.5:1);around(x,z,lv===2?ri(2,4):lv===1?2:1,.6,2,(hx,hz,k)=>{if(k&&BIO.depth(hx,hz)>.8)return;tuft('reed',hx,y,hz,h*rr(.75,1.1),h*rr(.7,1.0),leafCol(PAL.reed,1.3,.025));});}
function sedge(x,y,z,lv){const h=rr(.4,.9)*(lv===0?1.5:1);tuft('reed',x,y,z,h,h*1.2,leafCol(PAL.sedge,1.3,.03));}
function tulips(x,y,z,lv){blooms(x,y+.25,z,rr(.6,1.6),lv===2?ri(5,12):3,[pick(PAL.tulip)],[.12,.2],'tulip');if(lv===2)around(x,z,ri(2,4),.2,1,(px,pz)=>tuft('grass',px,y,pz,.3,.25,leafCol(PAL.grass,1.2,.03)));}
function stone(x,y,z,lv,set,st,k){if(BIO.mask(x,z)<=0)return;const s=rr(.18,.5)*(k==null?1:k)*(lv===0?1.6:1);BIO.put('stone',[x,y-s*.3,z],qEuler(rr(0,TAU),rr(0,TAU),rr(0,TAU)),[s*rr(.9,1.5),s*rr(.5,.8),s*rr(.9,1.3)],rockTint(set));if(st)st.stones++;}
function boulder(x,y,z,lv,set,st){if(!okGround(x,z,1.5))return null;const s=rr(.9,2.4)*(lv===0?1.3:1);BIO.put('boulder',[x,y-s*.35,z],qEuler(rr(0,TAU),rr(0,TAU),rr(0,TAU)),[s*rr(1,1.5),s*rr(.6,.9),s*rr(1,1.3)],rockTint(set));if(st)st.boulders++;return s;}

// ---------------------------------------------------------------- the travellers
// a TUMBLER: a ball of dry twigs, loose (rolled) or still rooted and green; drifts: a pile against an obstacle's
// windward face, n balls stacked up
function tumbler(x,y,z,lv,st,rooted){const r=rr(.5,1.5)*(rooted?.8:1);BIO.put('tumbler',[x,y+r*(rooted?.85:.7),z],qEuler(rr(0,TAU),rr(0,TAU),rr(0,TAU)),[r,r*rr(.8,1),r],leafCol(rooted?PAL.tumblerGreen:PAL.tumbler,1.2,.03,.08,.06));if(st)st.tumblers++;}
function drift(ox,oz,orad,lv,st){const w=W(),cx=ox-w[0]*(orad+.8),cz=oz-w[1]*(orad+.8),n=lv===2?ri(4,10):ri(2,4);
 for(let i=0;i<n;i++){const side=rr(-1,1)*(orad+1),back=rr(0,1.6),x=cx-w[1]*side-w[0]*back,z=cz+w[0]*side-w[1]*back;if(BIO.mask(x,z)<=0)continue;
  const y=Y(x,z),r=rr(.5,1.3);BIO.put('tumbler',[x,y+r*.7+(i>n*.6?r*.9:0),z],qEuler(rr(0,TAU),rr(0,TAU),rr(0,TAU)),[r,r,r],leafCol(PAL.tumbler,1.15,.03,.08,.06));if(st)st.tumblers++;}
 if(st)st.drifts++;}
// seed and cotton drifts: a pale mat in the lee (downwind) of an obstacle
function seedDrift(ox,oz,orad,st){const w=W(),x=ox+w[0]*(orad+1.2),z=oz+w[1]*(orad+1.2);if(BIO.mask(x,z)<=0)return;
 BIO.put('litter',[x,Y(x,z)+.04,z],qEuler(0,Math.atan2(w[0],w[1]),0),[orad*1.4+.8,1,orad*.8+.6],leafCol(PAL.silk,1.25,.01,.03,.03));if(st)st.seedDrifts++;}
// a CRAWLER (after the creeping devil): a prostrate, ribbed, spiny stem that grows at its head toward water (downslope)
// and dies behind, rooting as it goes. Its head is raised and green, often in flower; behind it the living stem snakes
// along the ground, then the trail: grey, collapsed, rotted through in places; now and then a branch forks off. The
// segments are laid head first, each following the ground between its ends; the spines are drawn on the head and the two
// segments behind it, where a camera close enough to see them looks (2026-10-22: before, a straight row of smooth capsules)
function crawler(x,y,z,lv,st){const d=downhill(x,z),seg=rr(1.1,1.5),n=lv===2?ri(8,14):ri(4,6),live=Math.max(2,Math.round(n*rr(.35,.6)));
 const yaw0=Math.atan2(d[0],d[1]),ph=rr(0,TAU),wig=rr(.2,.45),stemCol=leafCol(PAL.crawler,1.2,.03,.08,.05),deadCol=()=>bright(vary(pick(PAL.crawlerDead),.02,.05,.06),1.0);
 // the path from the head back up the slope: the heading wanders in a slow sine about the downslope
 const lay=(hx,hz,yawB,m,first,branch)=>{let px=hx,pz=hz;
  for(let i=0;i<m;i++){const yw=yawB+wig*Math.sin(i*.55+ph)+rr(-.08,.08),dx=Math.sin(yw),dz=Math.cos(yw),bx=px-dx*seg,bz=pz-dz*seg;
   if(BIO.mask(bx,bz)<=0||BIO.waterH(bx,bz)>Y(bx,bz)-.2)break;
   const isLive=i<(branch?m:live),dead=!isLive;if(dead&&rng()<.12){px=bx;pz=bz;continue;}   // a stretch rotted away
   const head=first&&i===0,r=head?rr(.2,.26):isLive?rr(.17,.22):rr(.13,.18),y0=Y(bx,bz)+r*(dead?.25:.55),y1=Y(px,pz)+r*(dead?.25:.55)+(head?r*1.6:0);
   const pitch=Math.atan2(y1-y0,seg),q=qEuler(Math.PI/2-pitch,yw,rr(-.3,.3)),L=Math.hypot(seg,y1-y0)*1.06,sc=[r*2,L,r*2*(dead?.65:1)];
   BIO.put(dead?'crawlerDead':'crawler',[bx,y0,bz],q,sc,dead?deadCol():head?bright(stemCol,1.12):stemCol);
   if(isLive&&lv===2&&(i<3||branch&&i<1))BIO.put('crawlerSpines',[bx,y0,bz],q,sc,leafCol([0xe8dcb0,0xf0e4c0,0xdcd0a0],1.1,.01,.04,.04));
   // a branch forks off the living stem and runs a few segments of its own
   if(first&&isLive&&i>0&&lv===2&&rng()<.18){const s=rng()<.5?-1:1;lay(bx,bz,yw+s*rr(.5,.9),ri(2,4),false,true);}
   px=bx;pz=bz;}};
 lay(x,z,yaw0,n,true,false);
 if(lv===2&&rng()<.55)blooms(x-Math.sin(yaw0)*.2,Y(x,z)+.62,z-Math.cos(yaw0)*.2,.25,ri(1,3),[0xf0e070,0xf8d060,0xe8c050],[.1,.16]);
 if(st)st.crawlers++;}
// a RESURRECTION BALL: curled brown and blowing about (or, rarely, unfurled green after a rain)
function resurrect(x,y,z,lv,st){const r=rr(.15,.35),green=rng()<.12;BIO.put('ball',[x,y+r*.8,z],qEuler(rr(0,TAU),rr(0,TAU),rr(0,TAU)),[r,r,r],leafCol(green?PAL.resurrectGreen:PAL.resurrect,1.15,.03,.08,.05));if(st)st.balls++;}
// a STRIDER: a ribbed barrel on three or four stilt roots, stepping toward water; dead stubs behind it (upslope)
function strider(x,y,z,lv,st){const d=downhill(x,z),H=rr(.6,1.8),Rb=H*rr(.35,.5),lift=H*rr(.35,.6),n=ri(3,4),blue=rng()<.4;
 const col=leafCol(blue?[PAL.strider[2],PAL.strider[3]]:[PAL.strider[0],PAL.strider[1]],1.2,.03,.08,.05);
 BIO.put('barrel',[x,y+lift,z],qEuler(rr(-.08,.08)+d[1]*.12,rr(0,TAU),rr(-.08,.08)-d[0]*.12),[Rb*2,H,Rb*2],col);
 for(let k=0;k<n;k++){const a=k/n*TAU+rr(-.3,.3),fx=x+Math.cos(a)*Rb*1.5+d[0]*(k===0?Rb*.8:0),fz=z+Math.sin(a)*Rb*1.5+d[1]*(k===0?Rb*.8:0);
  BIO.beam('stilt',[x+Math.cos(a)*Rb*.6,y+lift+H*.1,z+Math.sin(a)*Rb*.6],[fx,Y(fx,fz)-.05,fz],Rb*.22,Rb*.14,rodCol(pick(PAL.striderRoot),-.05));}
 // its trail: dead stubs where it stood, a stride apart, upslope
 if(lv>=1)for(let k=1,m=ri(2,5);k<=m;k++){const t=k*rr(.8,1.3),px=x-d[0]*t,pz=z-d[1]*t;if(BIO.mask(px,pz)<=0)break;
  BIO.put('stub',[px,Y(px,pz)-.05,pz],qEuler(rr(-.15,.15),0,rr(-.15,.15)),[Rb*.3,lift*rr(.3,.6),Rb*.3],rodCol(pick(PAL.striderRoot),-.2));}
 if(lv===2&&rng()<.5)blooms(x,y+lift+H*1.02,z,Rb*.5,ri(2,5),[0xf05a8a,0xf8e040,0xe8402a],[.1,.18]);
 if(st)st.striders++;}
// a MACE HEAD: a knobbed globe on a stalk; ripe heads snap and roll, rooting where they stop (lying downwind)
function mace(x,y,z,lv,st){const h=rr(1.2,2.8),r=h*rr(.2,.3),col=leafCol(PAL.mace,1.2,.03,.08,.05);
 BIO.beam('rod',[x,y,z],[x+rr(-.1,.1),y+h,z+rr(-.1,.1)],r*.35,r*.22,rodCol(0x4a6a5a,-.1));
 BIO.put('mace',[x,y+h+r*.6,z],qEuler(rr(-.2,.2),rr(0,TAU),rr(-.2,.2)),[r,r*1.15,r],col);
 if(lv>=1){const w=W();for(let k=0,m=ri(0,3);k<m;k++){const t=rr(3,14),px=x+w[0]*t+rr(-2,2),pz=z+w[1]*t+rr(-2,2);if(BIO.mask(px,pz)<=0)continue;const rr2=r*rr(.7,.95);
  BIO.put('mace',[px,Y(px,pz)+rr2*.8,pz],qEuler(rr(0,TAU),rr(0,TAU),rr(0,TAU)),[rr2,rr2,rr2],shade(col,-.08));}}
 if(st)st.maces++;}
// a BEAD CHAIN: stems of beads with knob tips; the wind snaps them at their joints and the beads lie strung out downwind
function beads(x,y,z,lv,st){const n=ri(2,4),col=leafCol(PAL.bead,1.2,.03,.08,.05);
 for(let s=0;s<n;s++){const a=rr(0,TAU),m=lv===2?ri(5,9):3,b=rr(.12,.2);let el=rr(.7,1.3),px=x+Math.cos(a)*.15,py=y,pz=z+Math.sin(a)*.15;
  for(let k=0;k<m;k++){const ca=Math.cos(a+k*.2),sa=Math.sin(a+k*.2);BIO.put('bead',[px,py,pz],qEuler(rr(-.3,.3),rr(0,TAU),Math.PI/2-el),[b*2,b*2.2,b*2],k===m-1?leafCol(PAL.beadTip,1.3,.03,.06,.05):col);
   px+=ca*Math.cos(el)*b*2;py+=Math.sin(el)*b*2;pz+=sa*Math.cos(el)*b*2;el-=.08;}}
 if(lv>=1){const w=W(),m=ri(4,10);for(let k=0;k<m;k++){const t=1+k*rr(.4,.9),px=x+w[0]*t+rr(-.3,.3),pz=z+w[1]*t+rr(-.3,.3);if(BIO.mask(px,pz)<=0)break;const b=rr(.1,.18);
  BIO.put('bead',[px,Y(px,pz),pz],qEuler(rr(0,TAU),rr(0,TAU),rr(0,TAU)),[b*2,b*2,b*2],shade(col,-.05));}}
 if(st)st.beads++;}
// a SAIL CANDELABRA: a knobbed ribbed column with arms, its yellow blade leaves; some blades aloft downwind, kiting
function sail(x,y,z,lv,st){const h=rr(1.6,3.4),r=h*rr(.08,.12),col=leafCol(PAL.sail,1.2,.03,.08,.05),bc=leafCol(PAL.sailBlade,1.3,.02,.06,.05);
 BIO.put('column',[x,y-.05,z],qEuler(0,rr(0,TAU),0),[r*2,h,r*2],col);
 for(let k=0,m=ri(1,3);k<m;k++){const a=rr(0,TAU),ay=y+h*rr(.35,.65),ax=x+Math.cos(a)*r*3,az=z+Math.sin(a)*r*3,ah=h*rr(.3,.5);
  BIO.put('column',[x+Math.cos(a)*r,ay,z+Math.sin(a)*r],qEuler(Math.cos(a)*.0,0,0),[r*1.4,r*3,r*1.4],col);
  BIO.put('column',[ax,ay,az],qEuler(0,rr(0,TAU),0),[r*1.4,ah,r*1.4],col);
  for(let b=0;b<2;b++)BIO.put('blade',[ax,ay+ah*rr(.4,.9),az],qEuler(rr(-.2,.2),rr(0,TAU),rr(.1,.5)),[rr(.5,.9),.6,rr(.6,1)],bc);}
 if(lv===2){const w=W();for(let k=0,m=ri(0,3);k<m;k++){const t=rr(4,25),px=x+w[0]*t,pz=z+w[1]*t,py=Y(px,pz)+rr(1,6);BIO.put('blade',[px,py,pz],qEuler(rr(-1,1),rr(0,TAU),rr(-1,1)),[.7,.6,.8],bc);}}
 if(st)st.sails++;}
// a STAR DRIFTER: a pale star of fronds on a thin stalk; the whole crown is the parachute: some stalks stand bare, their
// crowns lying downwind
function star(x,y,z,lv,st){const h=rr(1.2,2.6),bare=rng()<.4,col=leafCol(PAL.star,1.3,.02,.05,.04);
 BIO.beam('rod',[x,y,z],[x+rr(-.08,.08),y+h,z+rr(-.08,.08)],.06,.03,rodCol(0x6a8a6a,-.1));
 if(!bare)BIO.put('star',[x,y+h,z],qEuler(rr(-.15,.15),rr(0,TAU),rr(-.15,.15)),[rr(.7,1.1),.35,rr(.7,1.1)],col,{n:[0,1,0]});
 else if(lv>=1){const w=W(),t=rr(3,18),px=x+w[0]*t,pz=z+w[1]*t;if(BIO.mask(px,pz)>0)BIO.put('star',[px,Y(px,pz)+.2,pz],qEuler(rr(-.8,.8),rr(0,TAU),rr(-.8,.8)),[.8,.3,.8],shade(col,-.05),{n:[0,1,0]});}
 if(st)st.stars++;}
// CENSER CAPS: orange stalks under yellow-orange sponge caps; the wind shakes the seed out of the pores
function censers(x,y,z,lv,st){const n=lv===2?ri(2,5):1,sc=leafCol(PAL.censer,1.2,.02,.06,.05),cc=leafCol(PAL.censerCap,1.25,.02,.06,.05);
 for(let k=0;k<n;k++){const a=rr(0,TAU),d=k?rr(.2,.7):0,px=x+Math.cos(a)*d,pz=z+Math.sin(a)*d,h=rr(.6,1.8),r=h*rr(.25,.4),lean=rr(-.15,.15);
  BIO.put('column',[px,y-.05,pz],qEuler(lean,rr(0,TAU),lean),[r*.7,h,r*.7],sc);BIO.put('censer',[px+lean*h,y+h,pz+lean*h],qEuler(rr(-.15,.15),rr(0,TAU),rr(-.15,.15)),[r,r*.8,r],cc);}
 if(st)st.censers++;}
// HORN PIPES: paired yellow horn tubes; the wind pumps the seed out of them, and they hum
function horns(x,y,z,lv,st){const n=ri(2,4),c=leafCol(PAL.horn,1.25,.02,.06,.05);
 for(let k=0;k<n;k++){const a=rr(0,TAU),h=rr(.6,1.6);BIO.put('horn',[x+Math.cos(a)*.15,y-.05,z+Math.sin(a)*.15],qEuler(rr(-.1,.1),a,rr(-.1,.1)),[h*.9,h,h*.9],c);}
 if(st)st.horns++;}
// a ROLL-EGG: a blue honeycomb egg in a rosette of yellow sword leaves; a fallen egg has rolled downwind, a line of
// seedlings behind it
function rollEgg(x,y,z,lv,st){const s=rr(.7,1.3);BIO.put('sword',[x,y-.05,z],qEuler(0,rr(0,TAU),0),[s*1.4,s*.8,s*1.4],leafCol(PAL.eggLeaf,1.25,.02,.06,.05));
 const ec=leafCol(PAL.egg,1.2,.03,.08,.05);
 if(rng()<.6)BIO.put('egg',[x,y,z],qEuler(rr(-.06,.06),rr(0,TAU),rr(-.06,.06)),[s*1.1,s*1.4,s*1.1],ec);
 else if(lv>=1){const w=W(),t=rr(6,20),ex=x+w[0]*t,ez=z+w[1]*t;if(BIO.mask(ex,ez)>0){BIO.put('egg',[ex,Y(ex,ez)+s*.45,ez],qEuler(Math.PI/2,Math.atan2(w[0],w[1])+rr(-.4,.4),0),[s,s*1.3,s],ec);
   for(let k=1;k<6;k++){const u=k/6*t,px=x+w[0]*u,pz=z+w[1]*u;if(BIO.mask(px,pz)>0)BIO.put('sword',[px,Y(px,pz)-.03,pz],qEuler(0,rr(0,TAU),0),[.25,.18,.25],leafCol(PAL.eggLeaf,1.2,.02,.06,.05));}}}
 if(st)st.eggs++;}
// FURLERS: a red-orange sunburst on a green bulb; open in calm, shut (drawn tall and narrow) where a gust front passes
function furlers(x,y,z,lv,st){const n=lv===2?ri(2,6):1,shut=gustAt(x,z)>.5;
 for(let k=0;k<n;k++){const a=rr(0,TAU),d=k?rr(.3,1.2):0,px=x+Math.cos(a)*d,pz=z+Math.sin(a)*d,s=rr(.4,.8);if(BIO.mask(px,pz)<=0)continue;
  const py=Y(px,pz);BIO.put('bulb',[px,py-.05,pz],qEuler(0,rr(0,TAU),0),[s*.4,s*.45,s*.4],leafCol(PAL.furlerBulb,1.1,.03,.08,.05));
  BIO.put('furler',[px,py+s*.15,pz],qEuler(0,rr(0,TAU),0),shut?[s*.28,s*1.6,s*.28]:[s,s*.9,s],leafCol(PAL.furler,1.25,.02,.06,.05));}
 if(st){st.furlers++;if(shut)st.furlersShut++;}}
// HITCHERS: hooked burr balls, pink and green
function hitchers(x,y,z,lv,st){const n=lv===2?ri(2,5):1;for(let k=0;k<n;k++){const a=rr(0,TAU),d=k?rr(.2,.6):0,r=rr(.18,.4);
  BIO.put('hitcher',[x+Math.cos(a)*d,y+r*.7,z+Math.sin(a)*d],qEuler(rr(0,TAU),rr(0,TAU),rr(0,TAU)),[r,r,r],leafCol(PAL.hitcher,1.2,.03,.08,.05));}
 if(st)st.hitchers++;}
// a STEP CONE: a tier a wet year, so its height reads the years since the ground came out of the water (the `dry` field,
// 0..1 of the overlay's age; off an old bed a cone is old and full grown)
function stepcone(x,y,z,lv,st){const dry=field('bed',x,z)>.3?field('dry',x,z):1,h=mix(.25,2.6,clamp(dry,0,1))*rr(.8,1.15),r=h*rr(.35,.5);
 BIO.put('stepcone',[x,y-.08,z],qEuler(0,rr(0,TAU),0),[r*2,h,r*2],leafCol(PAL.stepcone,1.2,.02,.06,.05));if(st)st.stepcones++;}
function windows(x,y,z,lv,st){const s=rr(.25,.6);BIO.put('window',[x,y-.12,z],qEuler(0,rr(0,TAU),0),[s,s*.8,s],leafCol(PAL.window,1.4,.02,.05,.04));if(st)st.windows++;}
function fingers(x,y,z,lv,st){around(x,z,lv===2?ri(3,7):2,.15,.7,(px,pz)=>{const h=rr(.15,.45);BIO.put('finger',[px,Y(px,pz)-.03,pz],qEuler(rr(-.25,.25),rr(0,TAU),rr(-.25,.25)),[h*.9,h,h*.9],leafCol(PAL.finger,1.2,.03,.08,.05));});if(st)st.fingers++;}
// a BALLOON POD bush (after Calotropis): grey-green, inflated pods; a burst one spills silk
function balloon(x,y,z,lv,st){const R=rr(.6,1.2);card('small',x,y+R*.6,z,R*1.4,R,leafCol(PAL.balloon,1.2,.03,.08,.05),.2);
 if(lv>=1)for(let k=0,m=ri(1,4);k<m;k++){const a=rr(0,TAU),d=R*rr(.2,.6),s=rr(.4,.6);
  if(rng()<.3)BIO.put('silk',[x+Math.cos(a)*d,y+R*rr(.6,1.1),z+Math.sin(a)*d],qEuler(rr(-.3,.3),rr(0,TAU),rr(-.3,.3)),[s,s,s],leafCol(PAL.silk,1.3,.01,.02,.02));
  else BIO.put('balloon',[x+Math.cos(a)*d,y+R*rr(.9,1.2),z+Math.sin(a)*d],qEuler(Math.PI,rr(0,TAU),0),[s*1.4,s*1.3,s*1.4],leafCol(PAL.balloon,1.15,.02,.06,.05));}
 if(st)st.balloons++;}
// a GLIDER GOURD scrambling over a shrub: a lobe of leaves, its curtains and gourds; some winged seeds gliding off
function gourdScramble(x,y,z,lv,st){const R=rr(.8,1.6),hc=leafCol(PAL.gourd,1.15,.03,.08,.05);
 BIO.put('lobe',[x,y-.15,z],qEuler(0,rr(0,TAU),0),[R,R*.75,R],shade(hc,-.25));card('round',x,y+R*.6,z,R*1.7,R*.8,hc,.3);
 if(lv===2){for(let i=0,n=ri(1,3);i<n;i++){const a=rr(0,TAU);NSEMIARID.hangVine(x+Math.cos(a)*R*.8,y+R*.7,z+Math.sin(a)*R*.8,R*.7,rr(.6,1),st);}
  NSEMIARID.seedsAloft('glider',x,y+R,z,ri(2,6),25,[.6,.9],PAL.gourdWing,st);}
 if(st)st.gourds++;}

// a DEAD SAXAUL: a silver twisted stem standing or fallen, a few broken limbs (the crescent grove's wake)
function deadSaxaul(x,y,z,st){const fallen=rng()<.45,h=rr(1.4,3.6),a=rr(0,TAU),r0=rr(.08,.18),pts=[];
 const col=()=>tint(pick(PAL.deadwood),means().wood,rr(.85,1.05));
 for(let k=0;k<=4;k++){const t=k/4,ox=fallen?Math.cos(a)*h*t:rr(-.15,.15)*t*h,oz=fallen?Math.sin(a)*h*t:rr(-.15,.15)*t*h,oy=fallen?r0*.6+rr(0,.15):h*t;
  pts.push({x:x+ox,y:Y(x+ox,z+oz)+oy-(fallen?0:.2),z:z+oz,r:mix(r0,r0*.35,t),col:col()});}
 BIO.tube('wood',pts,pts[0].col,{seg:4,cap:true});
 for(let k=0,m=ri(1,3);k<m;k++){const p=pts[ri(1,3)],b=rr(0,TAU),el=fallen?rr(.2,.9):rr(.2,.9),L=rr(.4,1.2);
  BIO.beam('rod',[p.x,p.y,p.z],[p.x+Math.cos(b)*Math.cos(el)*L,p.y+Math.sin(el)*L,p.z+Math.sin(b)*Math.cos(el)*L],p.r*1.2,.03,col());}
 if(st)st.deadSaxaul++;}
// ---------------------------------------------------------------- dew gardens
// a boulder ringed with a mixed clump of the small and weird (the owner's board: plants on a rock pad)
const GARDEN=[strider,mace,beads,sail,censers,horns,furlers,hitchers,rollEgg,star,windows];
function dewGarden(x,z,lv,st,set){const s=boulder(x,Y(x,z),z,lv,set||PAL.rockBasalt,st);if(!s)return;
 const n=lv===2?ri(4,8):ri(1,3);
 for(let k=0;k<n;k++){const a=rr(0,TAU),d=s*rr(1.3,2.6),px=x+Math.cos(a)*d,pz=z+Math.sin(a)*d;if(!okGround(px,pz,.5))continue;
  pick(GARDEN)(px,Y(px,pz),pz,lv,st);}
 if(lv===2&&rng()<.5)drift(x,z,s,lv,st);
 if(st)st.gardens++;}

// ---------------------------------------------------------------- the zone planters
// Each takes (x,y,z,Z,lv,st) and places one plant of the zone's mix.
function plantDesert(x,y,z,Z,lv,st){const t=rng();
 if(t<.18){crawler(x,y,z,lv,st);}
 else if(t<.3){resurrect(x,y,z,lv,st);if(lv===2)resurrect(x+rr(-2,2),y,z+rr(-2,2),lv,st);}
 else if(t<.46){wormwood(x,y,z,lv,.8);st.shrubs++;}
 else if(t<.54){windows(x,y,z,lv,st);}
 else if(t<.6){stepcone(x,y,z,lv,st);}
 else if(t<.66){strider(x,y,z,lv,st);}
 else if(t<.71){horns(x,y,z,lv,st);}
 else if(t<.77){balloon(x,y,z,lv,st);}
 else if(t<.8){tumbler(x,y,z,lv,st);}
 else if(t<.95){stone(x,y,z,lv,Z.salt>.2?PAL.rockSalt:PAL.rockTan,st);}
 else{stipa(x,y,z,lv);st.tufts++;}}
function plantPan(x,y,z,Z,lv,st){const t=rng();
 if(t<.35){fingers(x,y,z,lv,st);}
 else if(t<.5){windows(x,y,z,lv,st);}
 else if(t<.6){stepcone(x,y,z,lv,st);}
 else if(t<.68&&Z.salt<.75){crawler(x,y,z,lv,st);}
 else if(t<.76){resurrect(x,y,z,lv,st);}
 else{stone(x,y,z,lv,PAL.rockSalt,st,.7);}}
function plantSteppe(x,y,z,Z,lv,st){const t=rng();
 if(t<.32){stipa(x,y,z,lv);st.tufts++;}
 else if(t<.44){wormwood(x,y,z,lv);st.shrubs++;}
 else if(t<.5){tumbler(x,y,z,lv,st,rng()<.5);}
 else if(t<.56){tulips(x,y,z,lv);st.flowers++;}
 else if(t<.6){hitchers(x,y,z,lv,st);}
 else if(t<.64){censers(x,y,z,lv,st);}
 else if(t<.67){sail(x,y,z,lv,st);}
 else if(t<.7){mace(x,y,z,lv,st);}
 else if(t<.73){beads(x,y,z,lv,st);}
 else if(t<.76){horns(x,y,z,lv,st);}
 else if(t<.8){furlers(x,y,z,lv,st);}
 else if(t<.83){rollEgg(x,y,z,lv,st);}
 else if(t<.86){star(x,y,z,lv,st);}
 else if(t<.88){strider(x,y,z,lv,st);}
 else if(t<.97){stone(x,y,z,lv,Z.rock>.3?PAL.rockBasalt:PAL.rockTan,st);}
 else if(lv>=1){dewGarden(x,z,lv,st,Z.rock>.2?PAL.rockBasalt:PAL.rockTan);}}
function plantMed(x,y,z,Z,lv,st){const t=rng();
 if(t<.28){grass(x,y,z,lv,.8);st.tufts++;}
 else if(t<.42){stipa(x,y,z,lv);st.tufts++;}
 else if(t<.52){tulips(x,y,z,lv);st.flowers++;}
 else if(t<.58){furlers(x,y,z,lv,st);}
 else if(t<.63){star(x,y,z,lv,st);}
 else if(t<.67){hitchers(x,y,z,lv,st);}
 else if(t<.75){gourdScramble(x,y,z,lv,st);}
 else if(t<.8){wormwood(x,y,z,lv,.7);st.shrubs++;}
 else if(t<.95){stone(x,y,z,lv,PAL.rockBasalt,st);}
 else if(lv>=1){dewGarden(x,z,lv,st,PAL.rockBasalt);}}
function plantForest(x,y,z,Z,lv,st){const t=rng();
 if(t<.42){grass(x,y,z,lv);st.tufts++;}
 else if(t<.6){BIO.put('litter',[x,y+.03,z],qEuler(0,rr(0,TAU),0),[rr(1,2.4),1,rr(1,2.4)],leafCol([0x8a6a3a,0x9a7a44,0x7a6a3a],1.1,.03,.08,.05));st.litter++;}
 else if(t<.7){blooms(x,y+.2,z,rr(.6,1.4),lv===2?ri(4,9):2,[0xe8e0f0,0x9a6ac8,0xf0c030]);st.flowers++;}
 else if(t<.8){BIO.put('fern',[x,y+.02,z],qEuler(rr(-.08,.08),rr(0,TAU),rr(.2,.6)),[rr(.6,1.1),1,rr(.7,1)],leafCol([0x4e7a34,0x5a8a3a],1.25,.03));st.ferns++;}
 else if(t<.86){gourdScramble(x,y,z,lv,st);}
 else{stone(x,y,z,lv,PAL.rockBasalt,st,.7);}}
function plantTugai(x,y,z,Z,lv,st){const t=rng(),nearW=smooth(.4,.9,Z.flow+Z.wet*.3);
 if(t<.35*nearW+.05){reed(x,y,z,lv);st.reeds++;}
 else if(t<.55){grass(x,y,z,lv);st.tufts++;}
 else if(t<.65){sedge(x,y,z,lv);st.tufts++;}
 else if(t<.72){rollEgg(x,y,z,lv,st);}
 else if(t<.8){BIO.put('litter',[x,y+.04,z],qEuler(0,rr(0,TAU),0),[rr(.8,2),1,rr(.8,2)],leafCol(PAL.silk,1.25,.01,.03,.03));st.seedDrifts++;}
 else if(t<.88){furlers(x,y,z,lv,st);}
 else{stone(x,y,z,lv,PAL.rockTan,st,.6);}}
function plantRip(x,y,z,Z,lv,st){const t=rng(),nearW=smooth(.4,.9,Z.flow);
 if(t<.3*nearW+.05){reed(x,y,z,lv);st.reeds++;}
 else if(t<.5){grass(x,y,z,lv);st.tufts++;}
 else if(t<.6){sedge(x,y,z,lv);st.tufts++;}
 else if(t<.72){blooms(x,y+.2,z,rr(.6,1.4),lv===2?ri(4,9):2,[0xf0c030,0xe8e0f0,0xe8302a]);st.flowers++;}
 else{stone(x,y,z,lv,PAL.rockBasalt,st,.7);}}
NSEMIARID.small={tuft,card,stipa,grass,wormwood,tumbler,drift,crawler,strider,dewGarden};

// ---------------------------------------------------------------- the pass
NSEMIARID.FLOOR_ZONES=['desert','pan','steppe','med','forest','tugai','rip'];
const PLANTERS=[plantDesert,plantPan,plantSteppe,plantMed,plantForest,plantTugai,plantRip];
NSEMIARID.floorWeights=Z=>[Z.desert*.8,Z.pan*.6,Z.steppe*1.0,Z.med*1.1,Z.forest*1.0,Z.tugai*1.2,Z.rip*1.2];
NSEMIARID.buildFloor=function(R,q){
 reseed(800031);q=q==null?1:q;R=R==null?3000:R;means();
 const st={tufts:0,shrubs:0,flowers:0,ferns:0,litter:0,reeds:0,stones:0,boulders:0,tumblers:0,drifts:0,seedDrifts:0,crawlers:0,balls:0,striders:0,maces:0,beads:0,sails:0,stars:0,censers:0,horns:0,eggs:0,
  furlers:0,furlersShut:0,hitchers:0,stepcones:0,windows:0,fingers:0,balloons:0,gourds:0,gardens:0,vines:0,pods:0,aloft:0,windfall:0,deadSaxaul:0};
 function plant(x,y,z,lv){if(blocked(x,z,.6))return;const Z=zones(x,z);if(Z.cliff>.6)return;
  const w=NSEMIARID.floorWeights(Z);let tot=0;for(let i=0;i<w.length;i++)tot+=w[i];if(tot<=0)return;
  let r=rng()*Math.max(1,tot),k=0;for(;k<w.length;k++){if(r<w[k])break;r-=w[k];}if(k>=w.length)return;
  PLANTERS[k](x,y,z,Z,lv,st);}
 const L=BIO.LOD(),bands=[[9,L.floor[0],0],[18,L.floor[1],L.floor[0]],[36,1e9,L.floor[1]]];
 bands.forEach((b,bi)=>{const lv=2-bi;
  BIO.grid(b[0],0,R,(x,z,d)=>{const ld=BIO.lodD(x,z);if(ld>=b[1]||ld<b[2])return 0;return .66*q*(lv===0?.5:1);},(x,y,z,d)=>plant(x,y,z,lv),{patch:.6,patchScale:.014,pad:.6,box:b[1]<1e9?BIO.originBox(b[1]):null});});
 // the drill-grass sea: a close grid of its tufts on the steppe near the spine (the steppe's ground cover), one card each
 BIO.grid(4,0,R,(x,z,d)=>{if(BIO.lodD(x,z)>=L.floor[0])return 0;const Z=zones(x,z);return (Z.steppe*.8+Z.med*.25+Z.desert*.15)*q*smooth(.3,.6,fbm(x*.008+11,z*.008-5,4141,2)+.25);},
  (x,y,z,d)=>{if(blocked(x,z,.4))return;const h=rr(.5,1.0);tuft('stipa',x,y,z,h,h*1.1,leafCol(PAL.stipa,1.05,.02,.06,.05));st.tufts++;},
  {patch:.5,patchScale:.02,pad:.3,box:BIO.originBox(L.floor[0])});
 // the crawler fields: on the old beds' silt and the desert flats, many crawlers all heading the same way downslope
 BIO.grid(14,0,R,(x,z,d)=>{if(BIO.lodD(x,z)>=L.floor[1])return 0;const Z=zones(x,z);return (Z.desert*.35+Z.pan*.15*smooth(.7,.4,Z.salt))*q*smooth(.4,.6,fbm(x*.004-3,z*.004+7,4242,2)+.15);},
  (x,y,z,d)=>{if(blocked(x,z,1))return;crawler(x,y,z,BIO.lodD(x,z)<L.floor[0]?2:1,st);},{patch:.4,patchScale:.02,pad:1});
 // tumbler drifts on the windward faces of the trees in the steppe and the desert, cotton and seed drifts in their lee;
 // WINDFALL under the fruit trees (the fruit on a variant tree is part of its geometry: what lies on the ground is the
 // floor's, one instance each, the catalog's piece once it exists)
 const FRUITC={0:PAL.pistNut,4:[0x8a9a6a,0x9aa478],5:PAL.appleFruit,6:PAL.walnutFruit,7:PAL.apricotFruit,8:PAL.pearFruit,14:PAL.pomFruit};
 for(const T of NSEMIARID.TREES){const ld=BIO.lodD(T.x,T.z);if(ld>=L.floor[1])continue;const Z=zones(T.x,T.z);const lv=ld<L.floor[0]?2:1;
  if((Z.steppe+Z.desert)>.4&&rng()<.2)drift(T.x,T.z,T.rb*1.5+.4,lv,st);
  if((Z.steppe+Z.med+Z.tugai)>.4&&rng()<.18)seedDrift(T.x,T.z,T.rb*1.5+.4,st);
  const fc=FRUITC[T.sp];if(fc&&ld<L.floor[0]&&rng()<.6)for(let k=0,m=ri(2,7);k<m;k++){const a=rr(0,TAU),d=T.crownR*Math.sqrt(rng())*.9,x=T.x+Math.cos(a)*d,z=T.z+Math.sin(a)*d;if(BIO.mask(x,z)<=0)continue;
   const r=T.sp===14?rr(.07,.1):T.sp===0?rr(.035,.05):rr(.04,.07);BIO.put('fruit',[x,Y(x,z)+r*.8,z],qEuler(rr(0,TAU),rr(0,TAU),rr(0,TAU)),[r,r,r],bright(vary(pick(fc),.02,.06,.05),.95));st.windfall++;}}
 // the crescent groves' dead: inside each arc, on its upwind side, the old saxaul trunks the grove left behind as it
 // walked downwind, standing and fallen, silver (tubes in the 'wood' bucket)
 BIO.grid(9,0,R,(x,z,d)=>{if(BIO.lodD(x,z)>=L.floor[1])return 0;const Z=zones(x,z);return (Z.desert+Z.steppe*.3)*(1-Z.pan)*NSEMIARID.crescentAt(x,z)[1]*.7*q;},
  (x,y,z,d)=>{if(blocked(x,z,1.2))return;deadSaxaul(x,y,z,st);},{patch:0,pad:1});
 // dew gardens: boulders with their clumps of the small and weird, scattered over the open country near the spine
 BIO.grid(60,0,R,(x,z,d)=>{if(BIO.lodD(x,z)>=L.floor[1])return 0;const Z=zones(x,z);return (Z.steppe*.5+Z.desert*.45*(1-Z.pan)+Z.med*.3)*q;},
  (x,y,z,d)=>{if(blocked(x,z,3))return;const Z=zones(x,z);dewGarden(x,z,BIO.lodD(x,z)<L.floor[0]?2:1,st,Z.rock>.2||Z.med>.3?PAL.rockBasalt:PAL.rockTan);},{patch:.3,pad:3});
 // reeds standing in the shallows (the host's water window)
 BIO.grid(8,0,R,(x,z,d)=>{const ld=BIO.lodD(x,z);if(ld>=L.mid)return 0;const Z=zones(x,z);return .45*q*Math.max(Z.tugai,Z.rip)*smooth(1.0,.3,BIO.depth(x,z))*(1-Z.salt);},
  (x,y,z,d)=>{const lv=BIO.lodD(x,z)<L.floor[0]*1.2?2:1;reed(x,Math.max(y,BIO.waterH(x,z)-.4),z,lv);st.reeds++;},{patch:.6,patchScale:.03,noMask:true,depth:[-.1,.9],pad:1,box:BIO.window('water')});
 return{under:st};};
})();
