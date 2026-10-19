// ================================================================= KORONA — the hell (flora with a trap record and a danger)
// The man-eaters and their company, placed by THE RULE: hell = poor x wet x warm (the host's fields through the core).
// Each dangerous plant is registered one by one in core/tags as class 'flora' with its `trap` (the danger is the hazard
// the inspector, the fauna kit and the game read), the harmless ones by patch. The safe path through a hollow (the host's
// STAGE.path) keeps every trap off its first few metres and is lined with cairns.
//   THE WALLS' FEET and the LEDGES: great sundews where the seeps run; staghorn ferns on the wet wall under every seep line
//   THE FLOOR, where the hell field is high: cobra lilies at the seeps' outflow, blood trumpets, ground stars, blood bulbs,
//     snare flowers; then, where it is highest, the MAN-EATERS with their lures and the coil tendrils
//   THE SUCKING POOLS (a station's pools of that kind): trap pads floating on them
(function(){const {TAU,clamp,lerp,mix,smooth,reseed,rng,rr,ri,pick,h3,fbm}=BIO.fn;const qEuler=KORONA.qEuler;
const PAL=KORONA.PAL,C=KORONA.C,P=KORONA.PLANTS,TRAPS=KORONA.TRAPS,K=KSTACKS,SEED=0x0C0A2;
const {bright,vary}=BIO.col;
const col=(slot,set,k)=>KORONA.libCol(slot,bright(vary(pick(set),.03,.08,.06),k==null?1.2:k));
const NAMES=[];KORONA.TRAPPED=[];KORONA.NAMED=[];
function reg(key,x,y,z,r,h,zone,id){const o={name:P[key].name,key,kind:'flora',x,y,z,r,h,tags:{trap:TRAPS[key],zone}};BIO.register(o);
 NAMES.push({name:P[key].name,plant:key,x,y,z,r,h});KORONA.TRAPPED.push({id,key,x,y,z,r,zone,trap:TRAPS[key]});}
const SPACE=KSPACE.create({cell:16});
const blocked=(x,z,pad)=>SPACE.some(x,z,pad,o=>Math.hypot(x-o.x,z-o.z)<o.r+pad)||KORONA.blocked(x,z,pad)||NECANYONS.blocked(x,z,pad);
const offPath=(x,z)=>smooth(3,9,KORONA.pathD(x,z));
// the cobra meadow is a station's extra (the hollow's edge): 0 without one, unlike a bias
const meadow=(x,z,Z)=>{const H=BIO.host.korona,b=H&&H.bias&&H.bias.cobraMeadow;return b==null?0:typeof b==='function'?b(x,z,Z):b;};
const extra=(k,x,z,Z)=>{const H=BIO.host.korona,b=H&&H.bias&&H.bias[k];return b==null?0:typeof b==='function'?b(x,z,Z):b;};

// ---------------------------------------------------------------- the plants
const tuft=(item,x,z,h,w,c,y)=>BIO.put(item,[x,(y==null?BIO.terrainH(x,z):y)-.04,z],qEuler(rr(-.08,.08),rr(0,TAU),rr(-.08,.08)),[w,h,w],c);
const two=n=>n+(rng()<.5?'0':'1');
function greatsundew(x,y,z,lv,st,id){const n=lv===2?ri(7,11):5,a0=rr(0,TAU),L=rr(1.8,3.4),c=col('gsundew',PAL.gsundew,1.1);
 for(let k=0;k<n;k++){const a=a0+k*TAU/n+rr(-.2,.2),tilt=rr(.35,.75);
  BIO.put(two('gsundew'),[x+Math.cos(a)*.25,y-.05,z+Math.sin(a)*.25],qEuler(-tilt,Math.PI/2-a,0),[L*.6,L,L*.6],c);}
 st.greatsundew++;}
function cobra(x,y,z,lv,st){const n=lv===2?ri(3,7):2;
 for(let i=0;i<n;i++){const a=rr(0,TAU),d=i?rr(.3,1.2):0,px=x+Math.cos(a)*d,pz=z+Math.sin(a)*d,h=rr(.8,1.6);
  tuft(rng()<.5?two('cobra'):two('cobrab'),px,pz,h,h*.7,col(rng()<.5?'cobra':'cobrab',PAL.cobra));st.cobra++;}}
function trumpet(x,y,z,lv,st){const n=lv===2?ri(2,4):1;
 for(let i=0;i<n;i++){const a=rr(0,TAU),d=i?rr(.4,1):0,px=x+Math.cos(a)*d,pz=z+Math.sin(a)*d,h=rr(.7,1.3);tuft(two('trumpet'),px,pz,h,h*.8,col('trumpet',PAL.trumpet));st.trumpet++;}}
function groundstar(x,y,z,lv,st,id){const r=rr(.6,1.3);BIO.put(two('star'),[x,y+.04,z],qEuler(0,rr(0,TAU),0),[r*2,1,r*2],col('star',PAL.star,1.1),{aTrap:[KTRAPS.phase(id),1,rr(1.1,1.4),0]});st.star++;return r;}
function bulbs(x,y,z,lv,st){const n=lv===2?ri(2,5):lv===1?2:1;
 for(let i=0;i<n;i++){const a=rr(0,TAU),d=i?rr(.2,1):0,px=x+Math.cos(a)*d,pz=z+Math.sin(a)*d,h=rr(.9,1.7);tuft(two('bulb'),px,pz,h,h*.5,col('bulb',PAL.bulb,1.15));st.bulb++;}}
function snare(x,y,z,lv,st){const h=rr(1,1.9);tuft('snare',x,z,h,h*.8,col('snare',PAL.snare));st.snare++;}
function lure(x,y,z,h,st){BIO.put('stalk',[x,y+h/2,z],null,[.035,h,.035],bright(pick(PAL.stalk),1));const s=rr(.45,.7);
 BIO.put(two('lure'),[x,y+h-.05,z],qEuler(rr(-.1,.1),rr(0,TAU),0),[s,s,s],col('lure',PAL.lure,1.15));st.lure++;}
// THE MAN-EATER: a lathe (the pitcher: bucket 'pitcher', the owner's mottled skin), its throat a second lathe inside it (the
// hairy skin, normals inward: the rings run top down), a hood leaning back off the mouth, and a lure on a stalk beside it
function maneater(x,y,z,lv,st,id){const H=rr(2.1,3.2),R=H*.42,a=rr(0,TAU),lean=rr(0,.1),cx=Math.cos(a)*lean*H,cz=Math.sin(a)*lean*H;
 const skin=col('pitcher',PAL.pitcher,.95),spot=bright(pick(PAL.pitcherSpot),.9),thr=col('throat',PAL.throat,1);
 const prof=[[0,.2],[.1,.5],[.28,.84],[.5,1],[.7,.9],[.84,.78],[.93,.86],[1,1.06]];
 const ring=(u,k,r,c)=>({x:x+cx*u,y:y+u*H,z:z+cz*u,yy:u*H,r:R*k*r,col:c});
 const outer=prof.map(([u,k])=>ring(u,k,1,u>.85?spot:skin));
 st.tris+=BIO.lathe('pitcher',outer,lv===2?16:10,2,1.4,(rg,ang)=>rg.r*(1+.05*Math.sin(ang*6+rg.yy*2)),(rg,ang)=>.8+.2*smooth(0,.4,rg.yy/H));
 const inner=prof.filter(([u])=>u>=.28).reverse().map(([u,k])=>ring(u,k,.9,thr));
 st.tris+=BIO.lathe('throat',inner,lv===2?14:8,1,1,(rg,ang)=>rg.r,(rg,ang)=>.55+.45*smooth(0,1,rg.yy/H));
 // the hood: a dome leaning back from the mouth's far side (open)
 const hood=[];for(let k=0;k<=4;k++){const t=k/4,back=R*(.4+.9*t),up=R*(.25+.95*t)*.8;hood.push({x:x+cx-Math.cos(a)*back,y:y+H+up,z:z+cz-Math.sin(a)*back,yy:H+up,r:R*1.08*Math.sqrt(Math.max(0,1-t*t))+.02,col:skin});}
 st.tris+=BIO.lathe('pitcher',hood,lv===2?12:8,2,1.4,(rg,ang)=>rg.r,null);
 // the fluid in the throat (a dark disc half way down): the plant's own instance, inside its registered volume
 BIO.put('mouth',[x+cx*.5,y+H*.5,z+cz*.5],null,[R*1.7,1,R*1.7],C(0x1a2210));
 if(lv===2){const la=a+rr(1.2,2.4),d=R*1.15;lure(x+Math.cos(la)*d,BIO.terrainH(x+Math.cos(la)*d,z+Math.sin(la)*d),z+Math.sin(la)*d,rr(1.6,H+.4),st);}
 st.maneater++;return {R,H};}
// THE COIL TENDRIL: a spiral lying on the floor, lifting at its end; a tube in the banded skin
function tendril(x,y,z,lv,st,id){const n=lv===2?26:14,turns=rr(1.3,2),r0=rr(2,3.2),dir=rng()<.5?1:-1,a0=rr(0,TAU),pts=[];
 for(let i=0;i<=n;i++){const t=i/n,ang=a0+dir*t*TAU*turns,rho=r0*(1-.65*t),px=x+Math.cos(ang)*rho,pz=z+Math.sin(ang)*rho;
  pts.push({x:px,y:BIO.terrainH(px,pz)+.14+2.4*t*t*t,z:pz,r:.24-.13*t});}
 st.tris+=BIO.tube('tendril',pts,col('tendril',PAL.tendril,1),{seg:lv===2?8:5,cap:true});
 BIO.put('mouth',[x,y+.02,z],qEuler(0,rr(0,TAU),0),[.6,1,.6],C(0x1a2a12));st.tendril++;return r0;}
// THE PUNJI PIT: a lid of dead leaves flush with the floor with the spikes just through it; a third stand open, the lid
// thrown back, the mouth black, the spikes round its rim (the owner, 2026-10-19: a pitcher that lives under the ground)
function punji(x,y,z,lv,st,id){const r=rr(.5,.85),open=KTRAPS.phase(id+'/o')<.35,bone=bright(pick([0xd8d0b8,0xc8c0a8,0xe0d8c0]),1),n=lv===2?ri(7,12):5;
 const spike=(px,pz,py,h,tilt,ta)=>BIO.put('spike',[px,py+h*.5,pz],qEuler(tilt*Math.cos(ta),0,tilt*Math.sin(ta)),[.022,h,.022],bone);
 if(!open){BIO.put('lid',[x,y+.05,z],qEuler(0,rr(0,TAU),0),[r*2.1,1,r*2.1],col('lid',[0x3a3020,0x4a3a28,0x2e261a],1));
  for(let k=0;k<n;k++){const a=rr(0,TAU),d=r*.75*Math.sqrt(rng()),h=rr(.22,.45);spike(x+Math.cos(a)*d,z+Math.sin(a)*d,y,h,rr(.05,.3),a+Math.PI);}}
 else{BIO.put('mouth',[x,y+.03,z],qEuler(0,rr(0,TAU),0),[r*1.9,1,r*1.9],C(0x07100a));const la=rr(0,TAU);
  BIO.put('lid',[x+Math.cos(la)*r*1.05,y+r*.55,z+Math.sin(la)*r*1.05],qEuler(-1.15,-la+Math.PI/2,0),[r*2,1,r*2],col('lid',[0x3a3020,0x4a3a28],1));
  for(let k=0;k<n;k++){const a=rr(0,TAU),h=rr(.3,.55);spike(x+Math.cos(a)*r*.92,z+Math.sin(a)*r*.92,y-.05,h,rr(.35,.6),a+Math.PI);}}
 st.punji++;return r;}
// THE BEAR TRAP: two toothed jaws hinged on the ground, open nearly flat (aTrap: phase, side, open angle), a stub between
function beartrap(x,y,z,lv,st,id){const w=rr(.9,1.45),a=rr(0,TAU),ph=KTRAPS.phase(id),op=rr(1.15,1.4),c=KORONA.libCol('jaw',bright(pick([0xa8202a,0xc83a30,0xb8c050]),1.1));
 for(const side of[1,-1])BIO.put('jaw',[x,y+.04,z],qEuler(0,-a,0),[w,w*.62,1],c,{aTrap:[ph,side,op,0]});
 BIO.put('stalk',[x,y-.2,z],null,[.09,.5,.09],bright(pick(PAL.stalk),.9));st.beartrap++;return w*.6;}
// A TRAP PAD punched up (the owner, 2026-10-19): bigger, a ring of inward teeth round its rim, a dark red maw at its middle;
// one in four caught half-folded on something
function trapPad(x,y,z,r,lv,st,k,id){const fold=false,ry=rr(0,TAU),c=col('giantpad',PAL.pad,1.1);
 BIO.put('pad',[x,y+.03,z],qEuler(0,ry,0),[r*2,1,r*2],c,{aTrap:[KTRAPS.phase(id),1,rr(1,1.3),0]});
 BIO.put('mouth',[x,y+.045,z],qEuler(0,ry,0),[r*.5,1,r*.5],C(0x4a0a10));
 const n=lv===2?Math.round(r*9):Math.round(r*4),bone=bright(pick([0xd8d0b8,0xc8b8a0]),1);
 for(let i=0;i<n;i++){const a=i/n*TAU+rr(-.1,.1),h=rr(.18,.32)*r;if(fold&&Math.sin(a-ry)>0)continue;
  BIO.put('spike',[x+Math.cos(a)*r*.94,y+.04+h*.4,z+Math.sin(a)*r*.94],qEuler(-.9*Math.sin(a),0,.9*Math.cos(a)),[.03*r,h,.03*r],bone);}
 st.pad++;}
// THE LASH FLOWER, the numb thorn (the owner, 2026-10-19, after the Jumanji plant): a thick segmented green stalk out of a
// rosette of leaves, leaning; on it a flower of four big pleated orange petals round a hot-pink throat, and from the
// throat a long tongue that lashes at what comes near: its touch numbs a limb in a minute. The petals fold over the
// throat when it goes off (the hinge hook on 'petal'); the tongue is a tube and stays
function numbthorn(x,y,z,lv,st,id){const H=rr(1.5,2.5),la=rr(0,TAU),lean=rr(.08,.22),sc=bright(pick([0x5a8a30,0x4e7a2a,0x6a9a38]),1),ph=KTRAPS.phase(id);
 const pts=[];for(let k=0;k<=4;k++){const t=k/4,s=Math.sin(t*1.6);pts.push({x:x+Math.cos(la)*lean*H*s,y:y-.1+H*t,z:z+Math.sin(la)*lean*H*s,r:.1-.035*t});}
 st.tris+=BIO.tube('tendril',pts,sc,{seg:lv===2?7:5,cap:true});
 const top=pts[4],n=lv===2?5:3;
 for(let k=0;k<n;k++){const a=rr(0,TAU),s=rr(.5,.85);BIO.put('staghorn',[x+Math.cos(a)*.15,y+.02,z+Math.sin(a)*.15],qEuler(-1.15,Math.atan2(Math.cos(a),Math.sin(a)),0),[s,s,s],col('staghorn',PAL.stag,1.15));}
 BIO.put('mouth',[top.x,top.y+.02,top.z],qEuler(0,rr(0,TAU),0),[.5,1,.5],C(0xe0206a));
 const pc=KORONA.libCol('petal',bright(pick([0xf0a040,0xe89030,0xf8b050]),1.05)),pw=rr(.55,.85),ph2=rr(.8,1.2);
 for(let k=0;k<4;k++){const a=k*Math.PI/2+rr(-.2,.2);BIO.put('petal',[top.x+Math.cos(a)*.14,top.y+.03,top.z+Math.sin(a)*.14],qEuler(0,Math.PI/2-a,0),[pw,ph2,1],pc,{aTrap:[ph,1,rr(.85,1.05),0]});}
 // the tongue: out of the throat, arching down and out, a red sting at its end
 const ta=la+rr(-.8,.8),L=rr(1.2,2.1),tp=[];for(let k=0;k<=5;k++){const t=k/5;tp.push({x:top.x+Math.cos(ta)*L*t,y:top.y+.15+L*(.35*Math.sin(t*2.6)-.45*t),z:top.z+Math.sin(ta)*L*t,r:.04-.02*t});}
 st.tris+=BIO.tube('tendril',tp,bright(0x8ab040,1),{seg:5});const e=tp[5];BIO.put('spike',[e.x,e.y,e.z],qEuler(rr(0,1),rr(0,TAU),0),[.03,.14,.03],C(0xc01828));
 st.numbthorn++;return Math.max(.9,L*.6);}
// THE COLD TRAPS (station 6, the hoar table; the owner, 2026-10-19): where the only wet is meltwater on frost-shattered rock.
// A FROST TANK: a small pitcher that holds meltwater, freezes at night and splits in spring to drop a winter's catch (a
// tank, danger .2: a foot through its ice). BUTTERWORTS: sticky pale rosettes flat on the melt pools' margins (flypaper,
// insects). Placed only where a station says (extras, 0 without): the hoar table's bias gives them its pools and bogs
function frosttank(x,y,z,lv,st,id){const H=rr(.8,1.3),R=H*.36,a=rr(0,TAU),skin=KORONA.libCol('pitcher',bright(pick([0xb8d0c8,0xc8dcd4,0xa8c4bc]),1.05)),ice=C(0xe8f4f8);
 const prof=[[0,.3],[.15,.6],[.4,.9],[.65,1],[.85,.86],[1,.95]];
 const rings=prof.map(([u,k])=>({x,y:y+u*H,z,yy:u*H,r:R*k,col:skin}));
 st.tris+=BIO.lathe('pitcher',rings,lv===2?12:8,2,1.4,(rg,ang)=>rg.r*(1+.04*Math.sin(ang*5+rg.yy*3)),null);
 BIO.put('mouth',[x,y+H*.88,z],null,[R*1.7,1,R*1.7],ice);st.frosttank++;return R*1.2;}
function butterwort(x,y,z,lv,st){const n=lv===2?ri(3,7):2;
 for(let k=0;k<n;k++){const a=rr(0,TAU),d=k?rr(.15,.7):0,px=x+Math.cos(a)*d,pz=z+Math.sin(a)*d,r=rr(.1,.22);
  BIO.put('pad',[px,BIO.terrainH(px,pz)+.025,pz],qEuler(0,rr(0,TAU),0),[r*2,1,r*2],KORONA.libCol('giantpad',bright(pick([0xb8d070,0xc8dc80,0xa8c468]),1.1)),{aTrap:[0,1,0,0]});st.butterwort++;}}
function cairnAt(x,z,st){const y=BIO.terrainH(x,z),n=ri(3,5);for(let k=0;k<n;k++){const r=rr(.16,.3)*(1-.12*k);BIO.put('cairn',[x+rr(-.08,.08),y+k*.22+r*.6,z+rr(-.08,.08)],qEuler(rr(0,TAU),rr(0,TAU),0),[r*1.3,r*.8,r*1.3],bright(pick(PAL.cairn),1));}st.cairn++;}

// ---------------------------------------------------------------- the passes
KORONA.buildCarnivores=function(R,q){q=q==null?1:q;R=R==null?1500:R;const L=BIO.radii(),H=BIO.host.korona||{};
 const st={greatsundew:0,cobra:0,trumpet:0,star:0,bulb:0,snare:0,maneater:0,lure:0,tendril:0,pad:0,stag:0,cairn:0,punji:0,beartrap:0,numbthorn:0,frosttank:0,butterwort:0,tris:0};
 NAMES.length=0;KORONA.TRAPPED.length=0;SPACE.clear();
 const lvOf=(x,z)=>{const d=BIO.lodD(x,z);return d<L.hero?2:d<L.mid?1:0;};
 const F=KORONA.F,hell=KORONA.hell,bias=KORONA.bias;
 // STAGHORNS on the wet wall under every seep line (the necanyons layout's SEEPS)
 NECANYONS.SEEPS.forEach((s,i)=>{const lv=lvOf(s.x,s.z);if(lv===0)return;reseed(KRAND.hash(SEED,1,i));
  if(rng()>s.seep*.8*q*bias('wallfern',s.x,s.z,null))return;const B=NECANYONS.bodies()[s.body],q0=B.beds[s.bed],a=s.a,n=lv===2?ri(2,4):1;
  for(let k=0;k<n;k++){const u=rr(.55,.96),w=NECANYONS.wall(B,q0,a+rr(-.012,.012),u),sz=rr(.7,1.3);
   BIO.put('staghorn',[w.x+w.nx*.12,w.y,w.z+w.nz*.12],qEuler(rr(.1,.35),Math.atan2(w.nx,w.nz),0),[sz,sz,sz],col('staghorn',PAL.stag,1.2));st.stag++;}});
 // GREAT SUNDEWS: the walls' wet feet, the seeping ledges, the wettest poor floor
 KORONA.place(7,201,(x,z,Z)=>{const w=F('wet',x,z),p=F('poor',x,z);
  return(Z.zone==='foot'?smooth(3,8,Z.footD)*smooth(42,22,Z.footD)*smooth(.35,.7,w)*.45:Z.zone==='ledge'?.5*Z.seep:Z.zone==='floor'?.12*smooth(.4,.7,hell(x,z)):0)*bias('greatsundew',x,z,Z)*q;},(x,y,z,Z,i,j)=>{const lv=lvOf(x,z);if(blocked(x,z,2.5))return;
  const id='gsun:'+i+','+j;greatsundew(x,y,z,lv,st,id);SPACE.insert({x,z,r:2.2},x,z,3);if(lv===2)reg('greatsundew',x,y,z,2.4,2.2,Z.zone,id);},{R,lodMax:L.mid});
 // COBRA LILIES: where the seeps run out at a wall's foot (and a hollow's edge, by the station's bias)
 KORONA.place(4,202,(x,z,Z)=>((Z.zone==='foot'?smooth(2,5,Z.footD)*smooth(30,14,Z.footD)*smooth(.2,.5,Z.seep)*.6:Z.zone==='floor'?.04*smooth(.3,.6,hell(x,z)):0)*bias('cobralily',x,z,Z)+(Z.zone==='floor'?meadow(x,z,Z)*.75:0))*offPath(x,z)*q,(x,y,z,Z,i,j)=>{const lv=lvOf(x,z);if(blocked(x,z,.8))return;
  cobra(x,y,z,lv,st);if(lv===2&&(i+j)%5===0)reg('cobralily',x,y,z,1.4,1.6,Z.zone,'cobra:'+i+','+j);},{R,lodMax:L.mid});
 // BLOOD TRUMPETS, GROUND STARS, SNARE FLOWERS and BLOOD BULBS on the hell floor, by the hell field and the station's bias
 KORONA.place(5,203,(x,z,Z)=>(Z.zone==='floor'||Z.zone==='foot')?smooth(.3,.6,hell(x,z))*.4*bias('bloodtrumpet',x,z,Z)*offPath(x,z)*q:0,(x,y,z,Z,i,j)=>{const lv=lvOf(x,z);if(blocked(x,z,.8))return;
  trumpet(x,y,z,lv,st);if(lv===2&&(i+j)%4===0)reg('bloodtrumpet',x,y,z,1.2,1.3,Z.zone,'trumpet:'+i+','+j);},{R,lodMax:L.mid});
 KORONA.place(8,204,(x,z,Z)=>(Z.zone==='floor'||Z.zone==='foot')?smooth(.45,.7,hell(x,z))*.35*bias('groundstar',x,z,Z)*offPath(x,z)*q:0,(x,y,z,Z,i,j)=>{const lv=lvOf(x,z);if(blocked(x,z,1.4))return;
  const id='star:'+i+','+j,r=groundstar(x,y,z,lv,st,id);SPACE.insert({x,z,r},x,z,r+1);if(lv>=1)reg('groundstar',x,y,z,r,.3,Z.zone,id);},{R,lodMax:L.mid});
 KORONA.place(10,205,(x,z,Z)=>(Z.zone==='floor'||Z.zone==='foot')?smooth(.45,.75,hell(x,z))*.3*bias('snareflower',x,z,Z)*offPath(x,z)*q:0,(x,y,z,Z,i,j)=>{const lv=lvOf(x,z);if(blocked(x,z,1))return;
  snare(x,y,z,lv,st);if(lv===2&&(i+j)%3===0)reg('snareflower',x,y,z,1,1.9,Z.zone,'snare:'+i+','+j);},{R,lodMax:L.mid});
 KORONA.place(2.8,206,(x,z,Z)=>(Z.zone==='floor'||Z.zone==='foot')?smooth(.25,.55,hell(x,z))*.5*bias('bloodbulb',x,z,Z)*offPath(x,z)*q:0,(x,y,z,Z,i,j)=>{const lv=lvOf(x,z);if(blocked(x,z,.4))return;
  bulbs(x,y,z,lv,st);if(lv===2&&(i+j)%9===0)reg('bloodbulb',x,y,z,1.2,1.7,Z.zone,'bulb:'+i+','+j);},{R,lodMax:L.floor[1]});
 // PUNJI PITS and BEAR TRAPS on the hell floor, hidden among the rest
 KORONA.place(14,209,(x,z,Z)=>(Z.zone==='floor'||Z.zone==='foot')?smooth(.4,.7,hell(x,z))*.35*bias('punjipit',x,z,Z)*offPath(x,z)*q:0,(x,y,z,Z,i,j)=>{const lv=lvOf(x,z);if(blocked(x,z,1.6))return;
  const id='punji:'+i+','+j,r=punji(x,y,z,lv,st,id);SPACE.insert({x,z,r:r+.4},x,z,r+1);reg('punjipit',x,y,z,r+.3,.8,Z.zone,id);},{R,lodMax:L.mid});
 KORONA.place(12,210,(x,z,Z)=>(Z.zone==='floor'||Z.zone==='foot')?smooth(.35,.65,hell(x,z))*.35*bias('beartrap',x,z,Z)*offPath(x,z)*q:0,(x,y,z,Z,i,j)=>{const lv=lvOf(x,z);if(blocked(x,z,1.4))return;
  const id='bear:'+i+','+j,r=beartrap(x,y,z,lv,st,id);SPACE.insert({x,z,r},x,z,r+1);reg('beartrap',x,y,z,r+.3,.5,Z.zone,id);},{R,lodMax:L.mid});
 KORONA.place(11,211,(x,z,Z)=>(Z.zone==='floor'||Z.zone==='foot')?smooth(.3,.6,hell(x,z))*.3*bias('numbthorn',x,z,Z)*offPath(x,z)*q:0,(x,y,z,Z,i,j)=>{const lv=lvOf(x,z);if(blocked(x,z,1.2))return;
  const id='thorn:'+i+','+j,r=numbthorn(x,y,z,lv,st,id);SPACE.insert({x,z,r},x,z,r+1);if(lv>=1)reg('numbthorn',x,y,z,r+.3,2,Z.zone,id);},{R,lodMax:L.mid});
 // THE MAN-EATERS and THE COIL TENDRILS: only where the hell is near full
 KORONA.place(14,207,(x,z,Z)=>(Z.zone==='floor'||Z.zone==='foot')?smooth(.5,.8,hell(x,z))*.55*bias('maneater',x,z,Z)*offPath(x,z)*q:0,(x,y,z,Z,i,j)=>{const lv=lvOf(x,z);if(lv===0||blocked(x,z,2.5))return;
  const id='maneater:'+i+','+j,m=maneater(x,y,z,lv,st,id);SPACE.insert({x,z,r:m.R*1.3},x,z,m.R*2);reg('maneater',x,y,z,m.R*1.5,m.H+.6,Z.zone,id);},{R,lodMax:L.mid});
 KORONA.place(22,208,(x,z,Z)=>(Z.zone==='floor'||Z.zone==='foot')?smooth(.55,.85,hell(x,z))*.5*bias('coiltendril',x,z,Z)*offPath(x,z)*q:0,(x,y,z,Z,i,j)=>{const lv=lvOf(x,z);if(lv===0||blocked(x,z,3.5))return;
  const id='tendril:'+i+','+j,r=tendril(x,y,z,lv,st,id);SPACE.insert({x,z,r},x,z,r+1);reg('coiltendril',x,y,z,r+.3,2.8,Z.zone,id);},{R,lodMax:L.mid});
 // THE COLD TRAPS (the hoar table): frost tanks and butterworts round the melt pools, where the station's extras say
 const bogH=(x,z)=>BIO.host.bogAt?BIO.host.bogAt(x,z):0;
 KORONA.place(5,212,(x,z,Z)=>(Z.zone==='cap'||Z.zone==='bench')?smooth(.55,.85,bogH(x,z))*.45*extra('butterwort',x,z,Z)*q:0,(x,y,z,Z,i,j)=>{const lv=lvOf(x,z);butterwort(x,y,z,lv,st);if(lv===2&&(i+j)%6===0)reg('butterwort',x,y,z,1,.2,Z.zone,'butter:'+i+','+j);},{R,lodMax:L.floor[1]});
 KORONA.place(12,213,(x,z,Z)=>(Z.zone==='cap'||Z.zone==='bench')?smooth(.45,.8,bogH(x,z))*.45*extra('frosttank',x,z,Z)*q:0,(x,y,z,Z,i,j)=>{const lv=lvOf(x,z);if(lv===0||blocked(x,z,1))return;
  const id='frost:'+i+','+j,r=frosttank(x,y,z,lv,st,id);SPACE.insert({x,z,r},x,z,r+1);reg('frosttank',x,y,z,r+.2,1.4,Z.zone,id);},{R,lodMax:L.mid});
 // THE SUCKING POOLS: registered as traps, trap pads floating on them
 (H.pools||[]).forEach((p,i)=>{if(!p.bed)return;reseed(KRAND.hash(SEED,8,i));const lv=lvOf(p.x,p.z);
  reg('bladderpool',p.x,p.y,p.z,p.r,.6,'floor','pool:'+i);
  for(let k=0,n=Math.round(p.r*.3*q);k<n;k++){const a=rr(0,TAU),d=p.r*Math.sqrt(rng())*.78,x=p.x+Math.cos(a)*d,z=p.z+Math.sin(a)*d,r=rr(1.4,3);
   trapPad(x,p.y,z,r,lv,st,k,'pad:'+i+','+k);if(lv===2&&k%2===0)reg('trappad',x,p.y,z,r,.6,'floor','pad:'+i+','+k);}});
 // THE SAFE PATH: cairns every twenty metres along it
 if(H.path&&H.path.length>1){reseed(KRAND.hash(SEED,9,0));const Pth=H.path;let acc=0;
  for(let i=1;i<Pth.length;i++){const ax=Pth[i-1][0],az=Pth[i-1][1],bx=Pth[i][0],bz=Pth[i][1],L2=Math.hypot(bx-ax,bz-az);
   for(let s=0;s<L2;s+=1){if(acc>=20){acc=0;const t=s/L2,x=ax+(bx-ax)*t+rr(-1.2,1.2),z=az+(bz-az)*t+rr(-1.2,1.2);if(BIO.mask(x,z)>0&&!NECANYONS.rockAt(x,z))cairnAt(x,z,st);}acc+=1;}}
  BIO.register({name:'The safe path (keep to the cairns)',key:'path',x:Pth[0][0],z:Pth[0][1],y:BIO.terrainH(Pth[0][0],Pth[0][1]),r:12,h:3});}
 KORONA.NAMED=NAMES.slice();BIO.nameSet('korona.carnivores',NAMES.slice());
 return{hell:st};};
})();
