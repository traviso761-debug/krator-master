// ================================================================= ARCH — the confluence's land profile and its meeting (PLAN.md sections 3.2 and 11)  [G data]
// Plain functions on the site record (41: ARCH_SITES.confluence): no THREE, no DOM. The stage draws its land from ARCH.profile; the water (89w) and the
// curtains (60) read ARCH.meeting's samples; the verify asserts every curtain stands on a sample where ARCH.canStand says yes. Needs 40 (ARCH).
//
//   ARCH.uOf(x, z)                  the distance south-east, (x + z) / sqrt 2: the land falls along it
//   ARCH.profile(site, u)           the bench's height at u: the dome's slope north-west of 0, the bench's gentle fall to the edge fault, the fault's
//                                   step (scarpDrop over scarpU), the sound's floor beyond
//   ARCH.vOf(slope)                 a shallow stream's speed from its bed's slope (m/s): .08 + 6 slope, at most 2.5 (a stand-in for Manning's at these depths)
//   ARCH.meeting(site, o)           the two waters from the meet to the outflow's end, every o.step (10) m:
//        {alk, acid (the waters at the meet: ARCH.spring of the site's springs and solfatara, cooled and aged along their runs), qa, qb (L/s),
//         mixed (ARCH.mix at the flows' ratio), dir [ux, uz], L (m), end (s where the curtains end), samples [{s, x, z, y, slope, v, pHa, pHb, T, stand, mix}]}
//        pHa / pHb: the left (alkaline) and right (acid) halves; while curtains stand they keep apart, closing 1% of the difference per 100 m through the leak;
//        past the last curtain they mix over o.mixLen (80 m). stand: ARCH.canStand on that sample (the curtains' rule)
(function(){'use strict';
 var A=ARCH,S2=Math.SQRT1_2,cl=function(x,a,b){return x<a?a:x>b?b:x;},ss=function(a,b,x){var t=cl((x-a)/(b-a),0,1);return t*t*(3-2*t);};
 A.uOf=function(x,z){return (x+z)*S2;};
 A.profile=function(site,u){var P=site.profile,b=site.base,s0=P.scarpU[0],s1=P.scarpU[1];
  var h=u<0?b-P.dome*u:b-P.bench*Math.min(u,s0);
  /* the kink at u = 0 eased over 120 m: the dome's foot rounds into the bench */
  if(Math.abs(u)<120){var t=(u+120)/240,hd=b-P.dome*u,hb=b-P.bench*u,w=t*t*(3-2*t);h=hd+(hb-hd)*w;}
  if(u>s0)h-=P.scarpDrop*ss(s0,s1,u)+P.bench*Math.min(u-s0,s1-s0)*0;
  if(u>s1)h-=P.floor*(u-s1);
  return h;};
 A.vOf=function(slope){return Math.min(2.5,.08+6*Math.abs(slope));};
 A.meeting=function(site,o){o=o||{};var step=o.step==null?10:o.step,mixLen=o.mixLen==null?80:o.mixLen,seed=site.seed>>>0;
  /* the waters: the springs mixed by flow, cooling to the air over their runs, losing a little pH to the air's CO2 on the terraces */
  var qa=0,al={pH:0,T:0,H2:0,Ca:0,Mg:0,dic:0};site.springs.forEach(function(s,i){var w=A.spring('typeII',seed,i);qa+=s.flow;
   ['pH','T','H2','Ca','Mg','dic'].forEach(function(k){al[k]+=w[k]*s.flow;});});
  ['pH','T','H2','Ca','Mg','dic'].forEach(function(k){al[k]/=qa;});
  al.pH-=.3;al.T=site.soil+(al.T-site.soil)*.35;al.dic+=.05;al.kind='typeII';
  var ac=A.spring('acid',seed,7),qb=site.solfatara.flow;ac.T=site.soil+(ac.T-site.soil)*.25;
  var M=site.meet,E=site.outflow.to,dx=E[0]-M.x,dz=E[1]-M.z,L=Math.hypot(dx,dz),ux=dx/L,uz=dz/L;
  var mixed=A.mix(al,ac,qa/(qa+qb)),samples=[],end=null,pa=al.pH,pb=ac.pH,since=0;
  for(var s=0;s<=L+1e-6;s+=step){var x=M.x+ux*s,z=M.z+uz*s,u=A.uOf(x,z),y=A.profile(site,u),
    y2=A.profile(site,A.uOf(x+ux*step,z+uz*step)),slope=(y-y2)/step,v=A.vOf(slope),T=(al.T*qa+ac.T*qb)/(qa+qb);
   var st=end==null?A.canStand({alk:{pH:pa,v:v,T:al.T},acid:{pH:pb,v:v,T:ac.T}}).ok:false;
   if(st){var d=pa-pb;pa-=.01*d*step/100;pb+=.01*d*step/100;}
   else{if(end==null)end=s;since+=step;var k=ss(0,mixLen,since);pa=pa+(mixed.pH-pa)*k;pb=pb+(mixed.pH-pb)*k;}
   samples.push({s:s,x:x,z:z,y:y,slope:slope,v:v,pHa:pa,pHb:pb,T:T,stand:st,mix:end==null?0:ss(0,mixLen,since)});}
  return {alk:al,acid:ac,qa:qa,qb:qb,mixed:mixed,dir:[ux,uz],L:L,end:end==null?L:end,samples:samples};};
})();
