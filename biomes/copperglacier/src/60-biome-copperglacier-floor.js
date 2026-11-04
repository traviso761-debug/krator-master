// ================================================================= COPPER GLACIER — placement (every station)
// COPPERG.build(R, q): what grows and lies off the ice, by the host's fields (BIO.field: ice, moraine, snow, copper, flat, shore, wet, rock, slope, cold).
// New placement throughout: every cell is seeded from KRAND.cell(seed + salt, ix, iz), never from how many draws came before it. [G data]
//   FROST CORAL   on the moraines and the shore, under the station's coral line (cold field), never on the ice, the water or steep rock; a tree's
//                 limbs are polylines grown from its foot, each child limb joined to its parent by BIO.flareJoin (31j), drawn by BIO.tube in one scope
//                 (BIO.tree: the tips are held by their limbs); fewer forks with distance
//   CUSHIONS      domes on the moraine gravel and the tundra, verdigris where the copper field is high
//   COPPER FLOWERS only on copper ground (the copper field over .35: the resource data's skarn, the nodes' discs)
//   MOSS, SEDGE   the wet ground: the streams' banks and the water's edge (the shore field), the frost's flats
//   BOULDERS      on the moraines and under the steeps (talus), malachite and gossan on the copper ground; lichen on their tops
//   STONES        the gravel's loose stones
(function(){const {TAU,clamp,lerp,mix,smooth,reseed,rng,rr,ri,pick,qEuler,qFacing,qUp}=BIO.fn;
const PAL=COPPERG.PAL,C=COPPERG.C,vary=COPPERG.vary;
const Y=(x,z)=>BIO.terrainH(x,z),F=n=>(x,z)=>BIO.field(n,x,z);
const ice=F('ice'),mor=F('moraine'),snow=F('snow'),cu=F('copper'),flat=F('flat'),shore=F('shore'),wet=F('wet'),rock=F('rock'),slope=F('slope'),cold=F('cold'),cave=F('cave');
// a FROST CORAL: a short stem, then limbs forking two or three ways, each bending up as it goes, thinner at each fork; the limb's points pass through
// BIO.flareJoin so it swells into its parent; an iridescent bulb at each tip
function coral(x,z,lv,st){const y0=Y(x,z),k=cu(x,z),H=rr(2,4.8)*(lv===0?.85:1),maxD=lv===2?3:2,col=vary(C(pick(k>.3?PAL.coralCu:PAL.coral)),.02,.06,.05);
 const tipC=vary(C(pick(PAL.coralTip)),.01,.04,.03),seg=r=>r>.15?7:5;
 const limb=(p,d,len,r,depth,parentR)=>{const pts=[{x:p[0],y:p[1],z:p[2],r}];let dx=d[0],dy=d[1],dz=d[2],q=p.slice();
  /* the limb tapers: a third off by its fork (a child takes over there), and a last limb narrows to a point under its bulb (2026-11-03, the owner: blunt) */
  const last=depth>=maxD,tp=last?.2:.11;
  for(let i=1;i<=3;i++){dx+=rr(-.12,.12);dz+=rr(-.12,.12);dy+=.22;const L=Math.hypot(dx,dy,dz);dx/=L;dy/=L;dz/=L;q=[q[0]+dx*len/3,q[1]+dy*len/3,q[2]+dz*len/3];pts.push({x:q[0],y:q[1],z:q[2],r:r*(1-tp*i)});}
  if(last){const e=pts[pts.length-1];pts.push({x:e.x+dx*len*.22,y:e.y+dy*len*.22,z:e.z+dz*len*.22,r:r*.14});}
  const P=depth>0&&BIO.flareJoin?BIO.flareJoin(pts,{parentR}):pts;BIO.tube('coral',P,col,{seg:seg(r),cap:depth>=maxD});st.limbs++;
  const end=pts[pts.length-1];
  if(depth>=maxD){const s=Math.max(r*1.05,.05);   /* a bead of iridescence at the point, not a knob */BIO.put('coraltip',[end.x,end.y,end.z],qEuler(rr(-.3,.3),rr(0,TAU),rr(-.3,.3)),[s,s*1.3,s],tipC,{c2:C(pick(PAL.tipIrid))});st.tips++;return;}
  const n=depth===0?ri(3,4):ri(2,3),a0=rr(0,TAU);
  for(let c=0;c<n;c++){const a=a0+c/n*TAU+rr(-.4,.4),sp=rr(.45,.85),nd=[dx*.5+Math.cos(a)*sp,dy*.5+.35,dz*.5+Math.sin(a)*sp],nl=Math.hypot(...nd);
   limb([end.x,end.y,end.z],[nd[0]/nl,nd[1]/nl,nd[2]/nl],len*rr(.7,.88),end.r*rr(.66,.78),depth+1,end.r);}};
 BIO.tree(x,z,()=>{const r0=.1+.045*H;limb([x,y0-.15,z],[rr(-.15,.15),1,rr(-.15,.15)],H*.34,r0,0,r0*2);});
 st.coral++;BIO.register({name:'A frost coral (Krator\'s cold lineage)',x,z,y:y0-.3,r:H*.6,h:H+.5,kind:'flora'});}
COPPERG.coral=coral;
COPPERG.build=function(R,q){q=q==null?1:q;R=R||2500;
 const st={coral:0,limbs:0,tips:0,cushions:0,flowers:0,moss:0,sedge:0,boulders:0,malachite:0,gossan:0,lichen:0,stones:0},seed=KRAND.child(620023,'copperglacier/'+BIO.host.tags);
 const L=BIO.LOD(),c0=BIO.center(),site=COPPERG.SITE||{};   /* the host hands its site's lines (89z: the coral line) */
 const ok=(x,z)=>BIO.mask(x,z)>0&&ice(x,z)<.2&&cave(x,z)<.05;
 const cellPass=(cell,salt,maxD,fn)=>{const N=Math.ceil(R*2/cell);for(let iz=0;iz<N;iz++)for(let ix=0;ix<N;ix++){
  const x=c0[0]-R+(ix+.5)*cell,z=c0[1]-R+(iz+.5)*cell;if(Math.abs(x-c0[0])>R||Math.abs(z-c0[1])>R)continue;const ld=BIO.lodD(x,z);if(ld>maxD)continue;
  reseed(KRAND.cell(seed+salt,ix,iz));const px=x+rr(-.5,.5)*cell,pz=z+rr(-.5,.5)*cell;if(!ok(px,pz))continue;
  fn(px,Y(px,pz),pz,ld<L.floor[0]?2:ld<L.floor[1]?1:0);}};
 const coralLine=site.coral||[0,0];
 // the frost coral: on the moraine and the shore below the coral line, thinning toward it; never on steep rock or deep snow
 if(coralLine[1]>coralLine[0])cellPass(24,1,L.mid*1.6,(x,y,z,lv)=>{const a=.5*(site.coralK==null?1:site.coralK)*(1-cold(x,z))*clamp(.25+mor(x,z)*.8+shore(x,z)*.6+flat(x,z)*.3,0,1)*(1-smooth(.35,.6,rock(x,z)))*(1-smooth(.4,.7,snow(x,z)))*q;
  if(y>coralLine[1]||rng()>a)return;coral(x,z,lv,st);   /* a thicket: a few more round it */
  if(lv>=1)for(let k=0,m=ri(0,4);k<m;k++){const ang=rr(0,TAU),d=rr(3,9),px=x+Math.cos(ang)*d,pz=z+Math.sin(ang)*d;if(ok(px,pz)&&rock(px,pz)<.5)coral(px,pz,lv,st);}});
 // the cushions: domes on the gravel, verdigris on copper ground
 cellPass(6,2,L.floor[1]*1.5,(x,y,z,lv)=>{const a=(.42-.3*cold(x,z))*(1-smooth(.4,.75,rock(x,z)))*(1-smooth(.45,.8,snow(x,z)))*clamp(.4+mor(x,z)+flat(x,z),0,1)*q*(lv===0?.5:1);if(rng()>a)return;
  const k=cu(x,z),n=lv===2?ri(1,3):1;for(let i=0;i<n;i++){const ang=rr(0,TAU),d=i?rr(.4,1.3):0,px=x+Math.cos(ang)*d,pz=z+Math.sin(ang)*d,Rr=rr(.2,.9);if(!ok(px,pz))continue;
   const c=C(pick(PAL.cushion)).lerp(C(pick(PAL.cushionCu)),smooth(.2,.6,k));BIO.put('cushion',[px,Y(px,pz)-.05,pz],qEuler(0,rr(0,TAU),0),[Rr,Rr,Rr],vary(c,.02,.05,.05));st.cushions++;}});
 // the copper flowers: only on the copper ground
 cellPass(5,3,L.floor[1],(x,y,z,lv)=>{const k=cu(x,z);if(k<.35)return;const a=.45*smooth(.35,.75,k)*(1-smooth(.5,.8,snow(x,z)))*(1-smooth(.7,.9,slope(x,z)))*q;if(rng()>a)return;
  const n=lv===2?ri(3,7):2,col=C(pick(PAL.cuflower));for(let i=0;i<n;i++){const ang=rr(0,TAU),d=i?rr(.3,1.6):0,px=x+Math.cos(ang)*d,pz=z+Math.sin(ang)*d,h=rr(.35,.75);if(!ok(px,pz))continue;
   BIO.put('copperflower',[px,Y(px,pz)-.03,pz],qEuler(rr(-.06,.06),rr(0,TAU),rr(-.06,.06)),[h*.55,h,h*.55],vary(col,.02,.05,.05));st.flowers++;}});
 // moss and sedge on the wet ground
 cellPass(4,4,L.floor[1],(x,y,z,lv)=>{const w=Math.max(shore(x,z),flat(x,z)*.6*wet(x,z));const a=.85*smooth(.25,.7,w)*(1-smooth(.5,.8,snow(x,z)))*(1-rock(x,z))*q;if(rng()>a)return;
  if(rng()<.55){const Rm=rr(.6,1.8);BIO.put('mossmat',[x,y+.03,z],qEuler(rr(-.05,.05),rr(0,TAU),rr(-.05,.05)),[Rm,1,Rm],vary(C(pick(PAL.moss)),.02,.05,.05));st.moss++;}
  else{const n=lv===2?ri(2,4):1;for(let i=0;i<n;i++){const ang=rr(0,TAU),d=i?rr(.3,1):0,px=x+Math.cos(ang)*d,pz=z+Math.sin(ang)*d,h=rr(.3,.7);if(!ok(px,pz))continue;
   BIO.put('sedge',[px,Y(px,pz)-.04,pz],qEuler(rr(-.06,.06),rr(0,TAU),rr(-.06,.06)),[h*1.1,h,h*1.1],vary(C(pick(PAL.sedge)),.02,.05,.05));st.sedge++;}}});
 // the boulders: on the moraines and under the steeps; malachite and gossan on the copper ground; lichen on the tops
 cellPass(10,5,L.mid,(x,y,z,lv)=>{const t=clamp(mor(x,z)*.9+smooth(.4,.8,slope(x,z))*rock(x,z)*.7,0,1)*q;if(rng()>t*.75)return;
  const k=cu(x,z),it=k>.35&&rng()<.55*k?(rng()<.4?'gossan':'malachite'):'boulder',r=rr(.5,2.4)*(lv===0?1.2:1),h=r*rr(.6,.9);
  const col=it==='boulder'?vary(C(pick(rng()<.5?PAL.granite:PAL.gneiss)),.01,.03,.05):it==='malachite'?vary(C(pick(PAL.malachite)),.02,.06,.05):vary(C(pick(PAL.gossan)),.02,.06,.05);
  BIO.put(it,[x,y+h*.25,z],qEuler(rr(-.3,.3),rr(0,TAU),rr(-.3,.3)),[r*rr(.9,1.3),h,r*rr(.9,1.3)],col);st[it==='boulder'?'boulders':it]++;
  if(lv>=1&&it==='boulder'&&rng()<.6*(1-snow(x,z))){const s=r*rr(.5,.9);BIO.put('lichen',[x+rr(-.2,.2)*r,y+h*.92,z+rr(-.2,.2)*r],qEuler(rr(-.12,.12),rr(0,TAU),rr(-.12,.12)),[s,1,s],vary(C(pick(PAL.lichen)),.02,.06,.05));st.lichen++;}});
 // the loose stones
 cellPass(5,6,L.floor[0],(x,y,z,lv)=>{if(rng()>.4*q*(1-snow(x,z)*.7))return;const r=rr(.1,.4),k=cu(x,z),it=k>.45&&rng()<.4?'malachite':'stone';
  BIO.put(it,[x,y+r*.15,z],qEuler(rr(-.5,.5),rr(0,TAU),rr(-.5,.5)),[r*rr(.9,1.4),r*.7,r*rr(.9,1.4)],vary(C(pick(it==='stone'?PAL.granite:PAL.malachite)),.01,.03,.05));st.stones++;});
 return st;};
})();
