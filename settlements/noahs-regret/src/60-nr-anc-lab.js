// prefix: nr
// ================================================================= THE SMALL RELIQUARY: the Ancients' laboratory, Ruephus's headquarters
// A smaller sister of the Ancients kit's "Reliquary" (kits/ancients/src/89-lab.js): three round storeys in an undulating
// white shell, arched windows (an arcade at the ground), undulating balconies, a roof of twisted chimney sculptures round a
// ribbed glass lattice dome, the Moebius needle spire on top, a colonnaded porch at the door. Bloody Ruephus holds court
// in it: his flag, a blood-red jack with a skull over crossed bones, flies from the needle. It stands at the bow, its door
// along the ring toward the beach side. The plan (kits/interiors/sets/noahs-regret.js) is the 12-gon inside the shell.
const NR_REL={R:12,NS:3,PL:.5,SH:3.65,SHELL:13.1};
/* the shell's radius at angle th (x = r sin th, z = r cos th: th 0 is the front) on storey k */
function nrRelR(th,k){return NR_REL.SHELL+.45*Math.sin(7*th+.55*k)+.2*Math.sin(3*th-.38*k);}
function nrRelB(th,k){return nrRelR(th,k)+1.5+.5*Math.sin(7*th+.55*k+1.2);}
/* THE PIRATE FLAG: painted once on a canvas (a decal, not a library texture: it is Ruephus's, not a material) */
let NR_FLAGTEX=null;
function nrFlagTex(){if(NR_FLAGTEX)return NR_FLAGTEX;const c=document.createElement('canvas');c.width=512;c.height=320;const g=c.getContext('2d');
 g.fillStyle='#8a0e10';g.fillRect(0,0,512,320);
 for(let i=0;i<220;i++){g.fillStyle='rgba('+(60+Math.floor(h3(i,1,2)*60))+',0,0,'+(.05+h3(i,2,3)*.12)+')';g.fillRect(h3(i,3,4)*512,h3(i,4,5)*320,4+h3(i,5,6)*40,2+h3(i,6,7)*20);}
 g.fillStyle='#120a0a';g.fillRect(0,0,70,320);                                     // the black band at the hoist
 for(let i=0;i<9;i++){const y=i*36+10;g.beginPath();g.moveTo(70,y);g.lineTo(70+14+h3(i,7,1)*16,y+12);g.lineTo(70,y+26);g.fill();}   // its ragged teeth
 const cx=300,cy=128;g.fillStyle='#efe6d4';
 /* crossed bones */
 g.save();g.translate(cx,cy+86);for(const a of [-.62,.62]){g.save();g.rotate(a);g.fillRect(-120,-11,240,22);for(const e of [-1,1]){g.beginPath();g.arc(e*124,-11,14,0,TAU);g.arc(e*124,11,14,0,TAU);g.fill();}g.restore();}g.restore();
 /* the skull */
 g.beginPath();g.ellipse(cx,cy,70,64,0,0,TAU);g.fill();g.fillRect(cx-42,cy+28,84,52);
 g.fillStyle='#8a0e10';for(const e of [-1,1]){g.beginPath();g.ellipse(cx+e*28,cy+6,20,24,0,0,TAU);g.fill();}
 g.beginPath();g.moveTo(cx,cy+30);g.lineTo(cx-11,cy+50);g.lineTo(cx+11,cy+50);g.fill();
 for(let i=-3;i<=3;i++)g.fillRect(cx+i*11-2,cy+62,4,18);
 /* the blood: drips from the skull's jaw */
 g.fillStyle='#4a0204';for(let i=0;i<5;i++){const x=cx-34+i*17;g.fillRect(x,cy+80,5,14+h3(i,9,9)*30);g.beginPath();g.arc(x+2.5,cy+94+h3(i,9,9)*30,5,0,TAU);g.fill();}
 const t=new THREE.CanvasTexture(c);t.encoding=THREE.sRGBEncoding;t.anisotropy=4;NR_FLAGTEX=t;return t;}
function nrFlagMat(){if(MAT.pflag)return MAT.pflag;const m=new THREE.MeshStandardMaterial({map:nrFlagTex(),roughness:.9,side:THREE.DoubleSide,vertexColors:true});
 MAT.pflag=m;TILE.pflag=1;SV_CLOTH.pflag=1;
 matHook(m,'flut',sh=>{sh.uniforms.uTime=ANIMU.uTime;sh.uniforms.uWind=ANIMU.uWind;
  sh.vertexShader='uniform float uTime;uniform float uWind;attribute vec3 aFlut;\n'+sh.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\n{float ph=dot(position,vec3(.9,.7,1.3));float s=.62*sin(uTime*3.1+ph*1.7)+.38*sin(uTime*5.3+ph*3.1+1.7);transformed+=aFlut*s*uWind;}');});
 nrCutHook(m,false);return m;}
/* a flag on a pole: the pole from (x, y0, z) to height h, the flag w x hh at its top, flying toward local +x */
function nrPirateFlag(x,y0,z,h,w,hh,ry){nrFlagMat();cyl('paint',x,y0,z,.07,h,hc(0x2a2a2a),8,.05);sph('brass',x,y0+h+.05,z,.14,P('brass'),1,8);
 WX(x,y0+h-.1,z,ry||0,0,0,()=>withCloth(clothFlag(w,.5),()=>psurf('pflag',(u,v)=>[u*w,-v*hh,Math.sin(u*PI*1.5)*.18*u],12,8,WHITE,{uvf:(u,v)=>[u,1-v]})));}
function nrReliquary(o){const C=NR_REL,inst=nrPlanOf('nr-anc-reliquary'),top=C.PL+C.NS*C.SH;
 nrBuilt(o,'nr-anc-reliquary','nr-anc-reliquary',32,32);
 const outl=(f,n)=>{const out=[];n=n||84;for(let i=0;i<n;i++){const th=i/n*TAU,r=f(th);out.push([r*Math.sin(th),r*Math.cos(th)]);}return out;};
 const gon=inst.buildings[0].levels[0].outer||KratorInteriors.sets.shape.circle(C.R,12);
 nrPlanSlab('white',outl(()=>16.4,60),null,C.PL,C.PL,P('white'));                       // the plinth
 nrPlanSlab('marble',outl(th=>nrRelR(th,0)-.3,84),null,C.PL+.02,.02,P('marble'));
 nrDrawPlan(inst,{floor:['conc',hc(0xb8b2a6)],part:['plaster',hc(0xe8e2d6)],door:['timber',hc(0x4a2a1a)]});
 for(let k=0;k<C.NS;k++){const y=C.PL+k*C.SH,H=C.SH,n=k===0?14:20,s0=k===0?0:1.0,s1=k===0?3.0:2.7,ww=k===0?1.3:.75,ofs=k===0?0:.5;
  const R=th=>nrRelR(th,k),shell=(rf,th0,th1,ya,yb,flip)=>psurf('white',(u,v)=>{const th=lerp(th0,th1,u),r=rf(th);return [r*Math.sin(th),lerp(ya,yb,v),r*Math.cos(th)];},Math.max(2,Math.ceil((th1-th0)/TAU*96)),1,P('white'),{flip});
  /* the bands below and above the windows, outer face and inner liner */
  for(const [ya,yb] of [[y,y+s0],[y+s1,y+H]]){if(yb-ya<.01)continue;shell(R,0,TAU,ya,yb,false);shell(th=>R(th)-.3,0,TAU,ya,yb,true);}
  /* the piers between the windows, the glass in them (none in the front door's arch on the ground floor) */
  for(let i=0;i<n;i++){const thc=(i+ofs)/n*TAU,hw=ww/C.SHELL,thn=(i+1+ofs)/n*TAU;
   shell(R,thc+hw,thn-hw,y+s0,y+s1,false);shell(th=>R(th)-.3,thc+hw,thn-hw,y+s0,y+s1,true);
   if(!(k===0&&i===0))psurf('glass',(u,v)=>{const th=lerp(thc-hw,thc+hw,u),r=R(th)-.15;return [r*Math.sin(th),lerp(y+s0,y+s1,v),r*Math.cos(th)];},3,1,hc(k===0?0x5a7a88:0x4a6a78));
   /* the arch's head: a half-round of white over the opening */
   for(let j=0;j<6;j++){const a0=j/6*PI,a1=(j+1)/6*PI;const p=th=>[R(th)*Math.sin(th),R(th)*Math.cos(th)];
    const q0=p(thc-hw*Math.cos(a0)),q1=p(thc-hw*Math.cos(a1));const y0=y+s1-hw*C.SHELL*Math.sin(a0)*.7,y1=y+s1-hw*C.SHELL*Math.sin(a1)*.7;
    beam('white',[q0[0],y0,q0[1]],[q1[0],y1,q1[1]],.16,P('white'));}}
  /* the undulating balcony above this storey */
  if(k<C.NS-1){const yk=y+H,bal=outl(th=>nrRelB(th,k+1),96);nrPlanSlab('conc',bal,[gon],yk,.3,P('conc'));nrRibbon('white',bal,yk-.5,yk+1.05,P('white'),.18);}}
 /* the roof: a slab, a wavy glyph parapet, four twisted chimney sculptures with helmet caps */
 const roofO=outl(th=>nrRelR(th,C.NS-1)+.4,96);nrPlanSlab('conc',roofO,null,top,.35,P('conc'));
 psurf('glyph',(u,v)=>{const th=u*TAU,r=nrRelR(th,C.NS-1)+.4;return [r*Math.sin(th),top+v*(1.2+.5*Math.sin(5*th)),r*Math.cos(th)];},96,1,WHITE);
 for(let i=0;i<4;i++){const a=i/4*TAU+PI/4,cx=9.8*Math.sin(a),cz=9.8*Math.cos(a);
  psurf('white',(u,v)=>{const th=u*TAU,r=(.85-.25*v)*(1+.28*Math.cos(4*th+v*3.2));return [cx+r*Math.sin(th),top+v*5.4,cz+r*Math.cos(th)];},32,10,P('white'));
  sph('white',cx,top+5.4,cz,1.3,P('white'),.6,14);}
 /* the lattice dome: blue glass inside, white ribs and rings outside, a collar at its foot */
 const Rd=6.4,Hd=8.2,dR=yy=>Rd*Math.pow(clamp(1-Math.pow(yy/Hd,2),0,1),.62);
 lathe('glass',0,0,Array.from({length:13},(_,i)=>[dR(i/12*Hd)*.95,top+.3+i/12*Hd]),40,hc(0x5a8aa8));
 for(let i=0;i<24;i++){const a=i/24*TAU;for(let j=0;j<12;j++){const y0=j/12*Hd,y1=(j+1)/12*Hd;beam('white',[Math.sin(a)*dR(y0),top+.3+y0,Math.cos(a)*dR(y0)],[Math.sin(a)*dR(y1),top+.3+y1,Math.cos(a)*dR(y1)],.14,P('white'));}}
 for(const yy of [1.5,3.8,5.9])ring('white',0,top+.3+yy,0,dR(yy),.12,P('white'));
 cyl('white',0,top,0,Rd+.3,.5,P('white'),40);
 /* the Moebius needle: a fluted spire from the dome's crown with rings, the flagstaff at its tip */
 const AH=22,aR=yy=>1.2*Math.pow(clamp(1-yy/AH,0,1),.75)+.18,y0=top+Hd-.6;
 psurf('white',(u,v)=>{const th=u*TAU,yy=v*AH,r=aR(yy)*(1+.2*Math.cos(6*th+yy*.25));return [r*Math.sin(th),y0+yy,r*Math.cos(th)];},24,20,P('white'));
 for(let yy=5;yy<AH-4;yy+=5)ring('white',0,y0+yy,0,aR(yy)*1.9,.13,P('white'));
 nrPirateFlag(0,y0+AH-.4,0,6.5,6.2,4.0,PI/2);
 /* the colonnaded porch from the door: three pairs of columns, a wavy canopy, steps down to the deck */
 for(const z of [14.4,18.2,22])for(const x of [-3.3,3.3]){cyl('white',x,C.PL,z,.42,5.6,P('white'),16,.36);cyl('white',x,C.PL+5.6,z,.65,.35,P('white'),16);}
 psurf('white',(u,v)=>{const x=lerp(-4.4,4.4,u),z=lerp(12.6,23.4,v);return [x,C.PL+5.95+.35*Math.sin(v*PI*3)+.25*Math.sin(u*PI),z];},10,18,P('white'),{up:true});
 nrPlanSlab('marble',[[-4.6,12.4],[4.6,12.4],[4.6,23.6],[-4.6,23.6]],null,C.PL+.03,.03,P('marble'));
 for(let i=0;i<3;i++)box('white',0,0,23.7+i*.4,9.2,C.PL-i*C.PL/3,.4,P('white'));
 /* Ruephus's standard at the porch, smaller flags on the balcony */
 nrPirateFlag(4.4,C.PL,23.8,8,3.4,2.2,PI/2);nrPirateFlag(-4.4,C.PL,23.8,8,3.4,2.2,PI/2);}
defBuilding({key:'nr-anc-reliquary',name:'The small Reliquary (Ancient laboratory)',seed:5400,cls:'building',kind:'laboratory',
 tags:{types:['civic'],wealth:'rich',style:"Ancient organic: an undulating drum, a lattice dome, the Moebius needle"},
 w:33,d:44,h:NR_REL.PL+NR_REL.NS*NR_REL.SH+8.2+22+7,budget:500000,
 front:{x:0,z:11.59,yaw:0},note:"the Ancients' laboratory, a smaller sister of the Reliquary; Bloody Ruephus's headquarters, his flag on the needle (set noahs-regret)",
 build(o){nrReliquary(o);}});
