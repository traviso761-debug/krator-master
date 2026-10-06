// ================================================================= NORTH-WEST BAY — floor
// Everything under the trees, by zone, from the same climate fields the tree
// pass reads (NWBAY.zones):
//   the BAY JUNGLE   ferns and giant ferns, splay-lets, shrubs, a club-moss
//                    and moss carpet where it is damp, mushroom troops, blooms
//                    fallen from the epiphytes, mossed logs, boulders
//   the RAINFOREST   the same mix, greener: more ferns, fewer mushrooms
//   the UPPER SLOPES dry grass, dragon-tree saplings, rosettes, frond shrubs,
//                    puffballs, boulders
//   the LOWLAND      grass, shrubs, blooms: the open ground the flame-crowns stand in
//   the SHORE        reeds in the bay's own blue-green, sedge, splay-lets,
//                    SEA-GRAPE and SALT SCRUB, driftwood
//   the TIDAL RIM    salt scrub, sea-grape, reeds, PNEUMATOPHORES in the mud
//   the KARST TOPS   ferns, moss, rosettes, cliff scrub, limestone boulders
//   the LAVA         black lava boulders, cinder scrub, dry grass, pine saplings
//   the BANKS        ferns, giant ferns, lotus flowers at the water's edge
//   still WATER      LILY PADS and lotus flowers on the lagoons and the lowland reach
// Three LOD bands along the spine (near / mid / far) at 8 / 15 / 32 m cells.
(function(){const {TAU,clamp,lerp,mix,smooth,reseed,rng,rr,ri,pick,h3,vnoise,fbm,qEuler,qFacing,qUp}=BIO.fn;
const PAL=NWBAY.PAL,zones=NWBAY.zones,blocked=NWBAY.blocked;
const T3=BIO.host.THREE,C=h=>new T3.Color(h);
const {bright,shade,vary,tint,means}=NWBAY;
const Y=(x,z)=>BIO.terrainH(x,z);
const leafCol=(set,k,dh)=>bright(vary(pick(set),dh==null?.05:dh,.14,.07),k==null?1.3:k);
const rockTint=(set,k)=>tint(vary(pick(set||PAL.rock),.02,.06,.06),means().rock,k==null?rr(.35,.6):k);
const rodCol=(hex)=>shade(vary(hex,.02,.08,.06),rr(-.45,-.2));
const capCol=()=>bright(vary(pick(PAL.shroom),.03,.1,.08),1.15);

// ---------------------------------------------------------------- fields local to the floor
const shroomK=(x,z)=>smooth(.48,.62,fbm(x*.0044+3,z*.0044-8,2121,2));      // the mushroom troops come in patches
const dampK=(x,z)=>fbm(x*.0062+21,z*.0062+13,777,2);
const okGround=(x,z,pad)=>!blocked(x,z,pad)&&BIO.clearOf(x,z,pad);

// ---------------------------------------------------------------- small plants
function card(x,y,z,s,sy,col,tilt){BIO.put('ucard',[x,y,z],qEuler(rr(-(tilt||.2),tilt||.2),rr(0,TAU),rr(-(tilt||.2),tilt||.2)),[s,sy==null?s:sy,s],col);}
function tuft(item,x,y,z,h,w,col){BIO.put(item,[x,y-.05,z],qEuler(rr(-.06,.06),rr(0,TAU),rr(-.06,.06)),[w||h*.8,h,w||h*.8],col);}
function groundMoss(x,y,z,r){BIO.put('mossmat',[x,y+.06,z],qEuler(rr(-.06,.06),rr(0,TAU),rr(-.06,.06)),r,leafCol(PAL.moss,.95,.03));}
function blooms(x,y,z,r,n,set,sz){const c=bright(vary(pick(set||PAL.bloom),.03,.1,.08),1.15);
 for(let i=0;i<n;i++){const a=rr(0,TAU),d=r*Math.sqrt(rng()),s=sz?rr(sz[0],sz[1]):rr(.16,.34);BIO.put('bloom',[x+Math.cos(a)*d,y+rr(0,.4),z+Math.sin(a)*d],qEuler(rr(-.4,.4),rr(0,TAU),rr(-.4,.4)),s,c);}}
function frondCrown(x,y,z,Rf,n,p0,p1,col,item){const a0=rr(0,TAU);
 for(let k=0;k<n;k++){const a=a0+k/n*TAU+rr(-.25,.25),L=Rf*rr(.8,1.1);BIO.put(item||'frond',[x,y,z],qEuler(rr(-.18,.18),-a,rr(p0,p1)),[L,L*rr(.85,1.05),L*rr(1.1,1.5)],bright(col,rr(.86,1.1)));}}
function fern(x,y,z,lv,set){const hc=vary(pick(set||PAL.fern),.06,.14,.07);
 frondCrown(x,y-.1,z,rr(1.8,3.6),lv===2?ri(5,7):lv===1?4:3,.08,.45,bright(hc,1.7));}
function giantFern(x,y,z,lv){const hc=vary(pick(PAL.fern),.05,.14,.07),R=rr(3,5.5);
 frondCrown(x,y-.1,z,R,lv===2?ri(6,8):4,-.02,.4,bright(hc,1.6),'bigfrond');
 if(lv===2)frondCrown(x,y+.3,z,R*.5,3,.6,1.0,bright(shade(hc,.1),1.6),'bigfrond');}
function splaylet(x,y,z,lv){const hc=vary(pick(PAL.paddle),.03,.08,.06),L=rr(1.4,2.8),n=lv===2?ri(5,7):4,a0=rr(0,TAU);
 for(let k=0;k<n;k++){const a=a0+k/n*TAU+rr(-.2,.2);BIO.put('paddle',[x,y+.2,z],qEuler(rr(-.06,.06),-a,rr(.4,.95)),[L,L*rr(.85,1),L*rr(.7,.9)],bright(vary(hc,.02,.06,.05),rr(1.05,1.3)));}}
function shrub(x,y,z,lv,set){const hc=vary(pick(set||PAL.shrub),.07,.14,.07),Rs=rr(1.4,3.2);
 if(lv===2){if(rng()<.5)BIO.put('lobe',[x,y-.3,z],qEuler(0,rr(0,TAU),0),[Rs,Rs*rr(.7,1),Rs],shade(vary(hc,.03,.1,.05),-.15));
  for(let i=0;i<2;i++){const a=rr(0,TAU),d=i?Rs*rr(.3,.7):0;card(x+Math.cos(a)*d,y+Rs*rr(.45,.7),z+Math.sin(a)*d,Rs*rr(1.5,1.9),Rs*rr(1.1,1.5),bright(vary(hc,.04,.1,.06),1.45),.25);}}
 else{const s=Rs*1.7;card(x,y+s*.35,z,s,s*.75,bright(hc,1.4));}}
function clubmoss(x,y,z,lv){const t=rng(),set=t<.6?PAL.fern:t<.85?PAL.moss:PAL.epiDull,h=rr(.35,.7)*(lv===0?1.8:1);
 tuft('clubmoss',x,y,z,h,h*2.2,leafCol(set,1.35,.03));}
// a troop of mushrooms: a cluster in one colour, sizes falling off from the biggest
function troop(x,y,z,lv,st){const col=capCol(),n=lv===2?ri(2,6):lv===1?ri(1,3):1,h0=rr(.4,1.2);
 for(let k=0;k<n;k++){const a=rr(0,TAU),d=k?rr(.4,1.8):0,px=x+Math.cos(a)*d,pz=z+Math.sin(a)*d,py=k?Y(px,pz):y,h=h0*(k?rr(.35,.8):1);
  if(k&&py<.3)continue;BIO.put('shroom',[px,py-.04,pz],qEuler(rr(-.15,.15),rr(0,TAU),rr(-.15,.15)),[h*rr(.9,1.2),h,h*rr(.9,1.2)],bright(vary(col,.02,.06,.06),rr(.9,1.1)));st.shrooms++;}}
function reed(x,y,z,lv){const set=rng()<.45?PAL.shoreAccent:PAL.reedGreen,h=rr(1.6,3.2)*(lv===0?1.6:1),n=lv===2?ri(3,5):lv===1?2:1;
 for(let k=0;k<n;k++){const a=rr(0,TAU),d=k?rr(.8,2.6):0,hx=x+Math.cos(a)*d,hz=z+Math.sin(a)*d;if(k&&Y(hx,hz)<-.4)continue;
  tuft('reed',hx,y,hz,h*rr(.75,1.1),h*rr(.7,1.1),leafCol(set,1.35,.025));}}
function sedge(x,y,z,lv){const h=rr(.6,1.3)*(lv===0?1.5:1);tuft('grass',x,y,z,h,h*1.3,leafCol(rng()<.7?PAL.fern:PAL.reedGreen,1.35,.03));}
function drygrass(x,y,z,lv){const h=rr(.9,1.7)*(lv===0?1.7:1),n=lv===2?ri(3,5):lv===1?2:1;for(let k=0;k<n;k++){const a=rr(0,TAU),d=k?rr(.8,2.4):0;tuft('grass',x+Math.cos(a)*d,y,z+Math.sin(a)*d,h*rr(.8,1.1),h*1.4,leafCol(PAL.savgrass,1.3,.03));}}
function rosette(x,y,z,lv,set,k){const R=rr(.35,.9)*(k||1),c=vary(pick(set||PAL.succulent),.03,.1,.06);
 BIO.put('rosette',[x,y-.02,z],qEuler(rr(-.06,.06),rr(0,TAU),rr(-.06,.06)),[R,R*.8,R],bright(c,1.05));
 if(lv===2&&rng()<.15){BIO.beam('rod',[x,y,z],[x+rr(-.2,.2),y+R*2.2,z+rr(-.2,.2)],.03,.02,rodCol(0x8a6a4a));blooms(x,y+R*2.2,z,.25,ri(3,6),PAL.bloom,[.08,.16]);}}
function dragonlet(x,y,z,lv){const hc=vary(pick(PAL.sword),.03,.08,.06),h=rr(.6,2.2),s=rr(1,2);
 if(lv>=1)BIO.beam('rod',[x,y-.1,z],[x,y+h,z],.12,.09,rodCol(0x8a7a68));
 BIO.put('sword',[x,y+h+s*.15,z],qEuler(rr(-.2,.2),rr(0,TAU),rr(-.2,.2)),[s,s*.55,s],bright(hc,1.25),{n:[0,1,0]});}
function frondShrub(x,y,z,lv){const hc=vary(pick(PAL.savleaf),.05,.12,.06),Rs=rr(1.2,2.4);
 if(lv===2)BIO.put('lobe',[x,y-.3,z],qEuler(0,rr(0,TAU),0),[Rs*.7,Rs*.6,Rs*.7],shade(vary(hc,.03,.1,.05),-.2));
 frondCrown(x,y+Rs*.4,z,Rs*1.3,lv===2?ri(5,7):4,.15,.6,bright(hc,1.5));}
function puffball(x,y,z,lv){const R=rr(.4,1.3);BIO.put('lobe',[x,y-.05,z],qEuler(rr(-.1,.1),rr(0,TAU),rr(-.1,.1)),[R,R*1.1,R],bright(vary(0xd8d0b8,.02,.06,.08),1.1));
 if(lv===2&&rng()<.5)BIO.put('lobe',[x+rr(-1,1)*R*1.5,y-.05,z+rr(-1,1)*R*1.5],qEuler(0,rr(0,TAU),0),[R*.6,R*.65,R*.6],bright(vary(0xd8d0b8,.02,.06,.08),1.1));}
function boulder(x,y,z,lv,set,st,k){const n=lv===2?ri(1,2):1,Rb=rr(1,3)*(k||1);
 for(let i=0;i<n;i++){const a=rr(0,TAU),d=i?Rb*rr(.7,1.2):0,r=Rb*(i?rr(.35,.7):1),bx=x+Math.cos(a)*d,bz=z+Math.sin(a)*d,by=Y(bx,bz),h=r*rr(.55,.95);
  BIO.put('boulder',[bx,by+h*.3,bz],qEuler(rr(-.25,.25),rr(0,TAU),rr(-.25,.25)),[r*rr(.9,1.3),h*.8,r*rr(.9,1.3)],rockTint(set,set===PAL.lava?rr(.12,.22):set===PAL.lime?rr(.6,.9):null));st.boulders++;
  if(set===PAL.rock&&lv>=1){BIO.put('mossmat',[bx+rr(-.15,.15)*r,by+h*1.05,bz+rr(-.15,.15)*r],qEuler(rr(-.2,.2),rr(0,TAU),rr(-.2,.2)),r*rr(.6,.9),leafCol(PAL.moss,.95));st.moss++;}
  if(lv===2&&set!==PAL.lava&&rng()<.3){const s=rr(.5,1);BIO.put('epi',[bx,by+h*1.1,bz],qUp([rr(-.2,.2),1,rr(-.2,.2)]),[s,s*.8,s],bright(vary(pick(PAL.epi),.02,.1,.06),1.2));}}}
// SEA-GRAPE: a sprawling shore shrub of big round glossy leaves, a few of them gone red
function seagrape(x,y,z,lv,st){const hc=vary(pick(PAL.seagrape),.03,.08,.05),Rs=rr(1.2,2.6);
 if(lv===2)BIO.put('lobe',[x,y-.3,z],qEuler(0,rr(0,TAU),0),[Rs,Rs*.55,Rs],shade(vary(hc,.03,.1,.05),-.2));
 for(let i=0,n=lv===2?ri(3,5):2;i<n;i++){const a=rr(0,TAU),d=i?Rs*rr(.3,.8):0,red=rng()<.18;
  BIO.put('glossy',[x+Math.cos(a)*d,y+Rs*rr(.3,.6),z+Math.sin(a)*d],qEuler(rr(-.3,.3),rr(0,TAU),rr(-.3,.3)),[Rs*1.2,Rs*.8,Rs*1.2],bright(red?vary(pick(PAL.seagrapeRed),.02,.06,.05):vary(hc,.03,.08,.05),1.35),{n:[rr(-.3,.3),1,rr(-.3,.3)]});}st.shrubs++;}
// SALT SCRUB: low grey-green cushions and wiry tufts, salt-burnt
function saltscrub(x,y,z,lv,st){const hc=vary(pick(PAL.saltscrub),.03,.08,.06),Rs=rr(.6,1.6);
 BIO.put('lobe',[x,y-.1,z],qEuler(0,rr(0,TAU),0),[Rs,Rs*.5,Rs],bright(hc,1.0));
 if(lv>=1)for(let k=0,m=lv===2?ri(1,3):1;k<m;k++){const a=rr(0,TAU),d=Rs*rr(.6,1.4);tuft('grass',x+Math.cos(a)*d,y,z+Math.sin(a)*d,rr(.4,.9),.8,bright(vary(hc,.02,.08,.06),1.2));}st.scrub++;}
// PNEUMATOPHORES: the mangrove's breathing roots, a field of thin cones standing out of the mud
function pneumatophores(x,y,z,lv,st){const c=shade(C(0x4a4038),-.1),n=lv===2?ri(6,14):4;
 for(let k=0;k<n;k++){const px=x+rr(-2.2,2.2),pz=z+rr(-2.2,2.2),py=Y(px,pz);if(py>.6)continue;const h=rr(.3,.8);BIO.put('cone',[px,Math.max(py,-.9),pz],qEuler(rr(-.1,.1),rr(0,TAU),rr(-.1,.1)),[.12,h,.12],bright(vary(c,.02,.05,.05),1.0));}st.knees++;}
// CINDER SCRUB: dark hardy cushions and a pine sapling now and then on the lava
function cinderscrub(x,y,z,lv,st){const hc=vary(pick(PAL.cinder),.03,.08,.05),Rs=rr(.6,1.5);
 BIO.put('lobe',[x,y-.1,z],qEuler(0,rr(0,TAU),0),[Rs,Rs*.55,Rs],bright(hc,1.1));
 if(lv===2&&rng()<.3){const h=rr(1,3);BIO.beam('rod',[x+1,y-.1,z],[x+1.2,y+h,z+.2],.08,.05,shade(C(0x2a2624),.1));BIO.put('cneedle',[x+1.2,y+h,z+.2],qEuler(0,rr(0,TAU),0),[1.2,.7,1.2],bright(hc,1.2),{n:[0,1,0]});}st.scrub++;}
// LILY PADS on still water, lotus flowers standing out of them
function lilies(x,y,z,lv,st){const R2=rr(.5,1.3);BIO.put('lilypad',[x,.03,z],qEuler(rr(-.02,.02),rr(0,TAU),rr(-.02,.02)),[R2,1,R2],bright(vary(C(pick(PAL.pad)),.02,.06,.05),1.05));st.lilies++;
 if(lv>=1&&rng()<.18){const col=bright(C(pick(PAL.lotus)),1.1),h=rr(.2,.7);BIO.put('cup',[x+rr(-.3,.3),h,z+rr(-.3,.3)],qEuler(rr(-.1,.1),rr(0,TAU),rr(-.1,.1)),rr(.35,.6),col);st.lotus++;}}
// a fallen tree: a mossed tube with brackets, mushrooms and ferns along its back
function log(x,y,z,st,dry){const a=rr(0,TAU),L=rr(16,44),r0=rr(.8,1.8),hx=Math.cos(a),hz=Math.sin(a),n=Math.ceil(L/8)+1,pts=[];
 for(let i=0;i<n;i++){const t=i/(n-1),px=x+hx*(t-.5)*L,pz=z+hz*(t-.5)*L;if(BIO.mask(px,pz)<=0||!okGround(px,pz,2))return false;
  pts.push({x:px,y:Y(px,pz)+r0*.35,z:pz,r:mix(r0,r0*.5,t),col:tint(pick(PAL.deadwood),means().wood,rr(.7,1)).lerp(C(PAL.moss[i%3]),!dry&&rng()<.4?.5:0)});}
 BIO.tube('wood',pts,pts[0].col,{seg:8,cap:true});st.logs++;
 for(let s=3;s<L-2;s+=rr(3,6)){const t=s/L,i=Math.min(n-2,Math.floor(t*(n-1))),f=t*(n-1)-i,A=pts[i],Bq=pts[i+1],px=mix(A.x,Bq.x,f),pz=mix(A.z,Bq.z,f),py=mix(A.y,Bq.y,f),r=mix(A.r,Bq.r,f);
  const k=rng();if(dry){if(k<.5){const sb=rr(.3,.8);BIO.put('fungus',[px+hz*r*.9,py+rr(-.2,.3),pz-hx*r*.9],qEuler(rr(-.3,.3),rr(0,TAU),rr(-.3,.3)),[sb,sb*.4,sb],C(pick(PAL.fungus)));}continue;}
  if(k<.35){BIO.put('mossmat',[px,py+r*.95,pz],qEuler(rr(-.1,.1),rr(0,TAU),rr(-.1,.1)),r*rr(.6,1),leafCol(PAL.moss,.95));st.moss++;}
  else if(k<.6){const sb=rr(.4,1.1);BIO.put('fungus',[px+hz*r*.9,py+rr(-.2,.4),pz-hx*r*.9],qEuler(rr(-.3,.3),rr(0,TAU),rr(-.3,.3)),[sb,sb*.4,sb],C(pick(PAL.fungus)));}
  else if(k<.8){const h=rr(.3,.8),col=capCol();for(let q=0,m=ri(2,4);q<m;q++)BIO.put('shroom',[px+rr(-.4,.4),py+r*.9,pz+rr(-.4,.4)],qEuler(rr(-.2,.2),rr(0,TAU),rr(-.2,.2)),[h,h,h],bright(vary(col,.02,.06,.06),1.05));st.shrooms++;}
  else frondCrown(px+rr(-.3,.3),py+r*.9,pz+rr(-.3,.3),rr(1,2),5,.05,.4,leafCol(PAL.fern,1.7));}
 return true;}

// ---------------------------------------------------------------- the zone planters
// Each takes (x,y,z,Z,lv,st) and places one plant of the zone's mix.
function plantJungle(x,y,z,Z,lv,st,rain){const t=rng(),damp=dampK(x,z),sk=shroomK(x,z)*(rain?.6:1)*.6;
 if(t<.24){if(lv>=1&&okGround(x,z,2.5)){giantFern(x,y,z,lv);st.ferns++;}else{fern(x,y,z,lv);st.ferns++;}}
 else if(t<.40){fern(x,y,z,lv);st.ferns++;}
 else if(t<.50){if(lv>=1){splaylet(x,y,z,lv);st.splaylets++;}else{fern(x,y,z,lv);st.ferns++;}}
 else if(t<.62){shrub(x,y,z,lv);st.shrubs++;}
 else if(t<.62+.18*sk+.03){troop(x,y,z,lv,st);}
 else if(t<.86){if(damp>.5&&lv>=1){groundMoss(x,y,z,rr(1.4,3));st.moss++;}else{clubmoss(x,y,z,lv);st.clubmoss++;if(lv===2)clubmoss(x+rr(-2,2),y,z+rr(-2,2),lv);}}
 else if(t<.93){blooms(x,y,z,rr(.8,1.8),ri(3,8),PAL.bloom);st.blooms++;if(lv===2)clubmoss(x,y,z,lv);}
 else{boulder(x,y,z,lv,PAL.rock,st);}}
function plantRidge(x,y,z,Z,lv,st){const t=rng();
 if(t<.36){drygrass(x,y,z,lv);st.tufts++;if(lv===2&&rng()<.4)drygrass(x+rr(-1.5,1.5),y,z+rr(-1.5,1.5),lv);}
 else if(t<.66){drygrass(x,y,z,lv);st.tufts++;}
 else if(t<.74){dragonlet(x,y,z,lv);st.dragonlets++;}
 else if(t<.84){frondShrub(x,y,z,lv);st.shrubs++;}
 else if(t<.90){rosette(x,y,z,lv,rng()<.5?PAL.savleaf:PAL.succulent,1.3);st.rosettes++;}
 else if(t<.94){puffball(x,y,z,lv);st.shrooms++;}
 else if(t<.97){blooms(x,y,z,rr(.6,1.5),ri(2,6),PAL.bloom);st.blooms++;}
 else{boulder(x,y,z,lv,rng()<.5?PAL.lava:PAL.rock,st);}}
function plantLow(x,y,z,Z,lv,st){const t=rng();
 if(t<.45){drygrass(x,y,z,lv);st.tufts++;}
 else if(t<.6){sedge(x,y,z,lv);st.tufts++;}
 else if(t<.75){shrub(x,y,z,lv,PAL.savleaf);st.shrubs++;}
 else if(t<.85){fern(x,y,z,lv);st.ferns++;}
 else if(t<.95){blooms(x,y,z,rr(.8,2),ri(3,9),rng()<.4?PAL.flame:PAL.bloom);st.blooms++;}
 else{boulder(x,y,z,lv,PAL.rock,st);}}
function plantShore(x,y,z,Z,lv,st){const t=rng();
 if(t<.32){reed(x,y,z,lv);st.reeds++;}
 else if(t<.48){sedge(x,y,z,lv);st.tufts++;}
 else if(t<.62){if(lv>=1){seagrape(x,y,z,lv,st);}else{sedge(x,y,z,lv);st.tufts++;}}
 else if(t<.74){saltscrub(x,y,z,lv,st);}
 else if(t<.84){if(lv>=1){splaylet(x,y,z,lv);st.splaylets++;}else{sedge(x,y,z,lv);st.tufts++;}}
 else if(t<.92){fern(x,y,z,lv);st.ferns++;}
 else{blooms(x,y,z,rr(.6,1.4),ri(2,5),PAL.bloom);st.blooms++;}}
function plantTidal(x,y,z,Z,lv,st){const t=rng();
 if(y<.4){if(t<.6){pneumatophores(x,y,z,lv,st);}else{reed(x,Math.max(y,-.5),z,lv);st.reeds++;}return;}
 if(t<.35){saltscrub(x,y,z,lv,st);}
 else if(t<.6){if(lv>=1){seagrape(x,y,z,lv,st);}else{saltscrub(x,y,z,lv,st);}}
 else if(t<.8){reed(x,y,z,lv);st.reeds++;}
 else{sedge(x,y,z,lv);st.tufts++;}}
function plantTop(x,y,z,Z,lv,st){const t=rng(),damp=dampK(x,z);
 if(t<.3){fern(x,y,z,lv);st.ferns++;}
 else if(t<.42){if(lv>=1&&okGround(x,z,2.5)){giantFern(x,y,z,lv);st.ferns++;}else{fern(x,y,z,lv);st.ferns++;}}
 else if(t<.56){shrub(x,y,z,lv);st.shrubs++;}
 else if(t<.68){if(damp>.45&&lv>=1){groundMoss(x,y,z,rr(1.2,2.6));st.moss++;}else{clubmoss(x,y,z,lv);st.clubmoss++;}}
 else if(t<.78){rosette(x,y,z,lv,PAL.succulent,1.1);st.rosettes++;}
 else if(t<.86){if(lv>=1){splaylet(x,y,z,lv);st.splaylets++;}else{fern(x,y,z,lv);st.ferns++;}}
 else if(t<.92){blooms(x,y,z,rr(.6,1.4),ri(2,6),PAL.bloom);st.blooms++;}
 else{boulder(x,y,z,lv,PAL.lime,st);}}
function plantCinder(x,y,z,Z,lv,st){const t=rng();
 if(t<.34){boulder(x,y,z,lv,PAL.lava,st,rr(.8,1.4));}
 else if(t<.6){cinderscrub(x,y,z,lv,st);}
 else if(t<.8){drygrass(x,y,z,lv);st.tufts++;}
 else if(t<.9){saltscrub(x,y,z,lv,st);}
 else{rosette(x,y,z,lv,PAL.succulent,1.0);st.rosettes++;}}
function plantBank(x,y,z,Z,lv,st){const t=rng();
 if(t<.3){if(lv>=1&&okGround(x,z,2.5)){giantFern(x,y,z,lv);st.ferns++;}else{fern(x,y,z,lv);st.ferns++;}}
 else if(t<.55){fern(x,y,z,lv);st.ferns++;}
 else if(t<.7){sedge(x,y,z,lv);st.tufts++;}
 else if(t<.82){reed(x,y,z,lv);st.reeds++;}
 else if(t<.92){const col=bright(C(pick(PAL.lotus)),1.1);for(let k=0,m=lv===2?ri(2,4):1;k<m;k++)BIO.put('cup',[x+rr(-1,1),y+rr(.2,.6),z+rr(-1,1)],qEuler(rr(-.1,.1),rr(0,TAU),rr(-.1,.1)),rr(.4,.7),col);st.lotus++;}
 else{groundMoss(x,y,z,rr(1,2));st.moss++;}}

// ---------------------------------------------------------------- the pass
NWBAY.buildFloor=function(R,q){
 reseed(600021);q=q==null?1:q;R=R||2400;means();
 const st={ferns:0,shrubs:0,splaylets:0,reeds:0,tufts:0,rosettes:0,dragonlets:0,blooms:0,moss:0,clubmoss:0,boulders:0,shrooms:0,scrub:0,knees:0,lilies:0,lotus:0,logs:0};
 // one plant of the right zone's mix at (x,z); density by zone
 function plant(x,y,z,lv){if(!okGround(x,z,.8))return;const Z=zones(x,z);
  const w=[Z.hyper*1.3,Z.rain*1.2,Z.ridge*1.0,Z.shore*.9,Z.tidal*.9,Z.top*1.1,Z.cinder*.8,Z.low*.9,Z.bank*1.0],n=w.length;let tot=0;for(let i=0;i<n;i++)tot+=w[i];if(tot<=0)return;
  let r=rng()*Math.max(1,tot),k=0;for(;k<n-1;k++){if(r<w[k])break;r-=w[k];}if(k>=n-1&&r>w[n-1])return;
  if(k===0)plantJungle(x,y,z,Z,lv,st,false);else if(k===1)plantJungle(x,y,z,Z,lv,st,true);else if(k===2)plantRidge(x,y,z,Z,lv,st);else if(k===3)plantShore(x,y,z,Z,lv,st);
  else if(k===4)plantTidal(x,y,z,Z,lv,st);else if(k===5)plantTop(x,y,z,Z,lv,st);else if(k===6)plantCinder(x,y,z,Z,lv,st);else if(k===7)plantLow(x,y,z,Z,lv,st);else plantBank(x,y,z,Z,lv,st);}
 // three bands along the LOD spine
 const bands=[[8,450,0],[15,1200,450],[32,1e9,1200]];
 bands.forEach((b,bi)=>{const lv=2-bi;
  BIO.grid(b[0],0,R,(x,z,d)=>{const ld=BIO.lodD(x,z);if(ld>=b[1]||ld<b[2])return 0;return .64*q*(lv===0?.6:1);},(x,y,z,d)=>plant(x,y,z,lv),{patch:.75,patchScale:.014,pad:.6});});
 // the tidal mud: pneumatophores and reeds standing in the shallows (past the host mask)
 BIO.grid(10,0,R,(x,z,d)=>{const ld=BIO.lodD(x,z);if(ld>=1200)return 0;const h=Y(x,z);if(h>.35||h<-1.2)return 0;const Z=zones(x,z);if(Z.karst>.03)return 0;return .5*q*smooth(-1.2,-.3,h)*smooth(.6,.85,Z.wet)*(1-Z.flow*.5);},
  (x,y,z,d)=>{if(!BIO.clearOf(x,z,1))return;const Z=zones(x,z),lv=BIO.lodD(x,z)<600?2:1;if(Z.tidal>.3&&rng()<.5)pneumatophores(x,y,z,lv,st);else{reed(x,Math.max(y,-.6),z,lv);st.reeds++;}},{patch:.8,patchScale:.02,noMask:true,pad:.5});
 // still water: lily pads and lotus flowers on the lagoons and the lowland reach, where the river's fresh water reaches
 BIO.grid(6,0,R,(x,z,d)=>{const ld=BIO.lodD(x,z);if(ld>=1000)return 0;const h=Y(x,z);if(h>-.15||h<-2.4)return 0;const Z=zones(x,z);if(Z.karst>.03)return 0;
   return .55*q*smooth(.08,.35,Z.flow)*(1-smooth(.6,.95,Z.flow))*smooth(.46,.62,fbm(x*.006+1,z*.006-2,808,2));},
  (x,y,z,d)=>{if(!BIO.clearOf(x,z,1))return;lilies(x,y,z,BIO.lodD(x,z)<600?2:1,st);},{patch:.6,patchScale:.02,noMask:true,pad:.3});
 // fallen trees in the jungle and the rainforest, driftwood on the shore, dead wood on the dry slopes
 BIO.grid(150,0,R,(x,z,d)=>{if(BIO.lodD(x,z)>1500)return 0;const Z=zones(x,z);return (Z.hyper*.8+Z.rain*.6+Z.shore*.4+Z.ridge*.15+Z.top*.3)*q;},(x,y,z,d)=>{const Z=zones(x,z),dry=Z.ridge>.5||Z.cinder>.5;for(let t=0;t<4;t++)if(log(x+rr(-30,30),y,z+rr(-30,30),st,dry))break;},{patch:0,pad:3});
 return{under:st};};
})();
