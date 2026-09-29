/* ============================== 14. UNDERGROUND (test wing) ==============================
   PLANNER-OWNED. The tunnel from the great door and the single round,
   technological ANTECHAMBER under the butte — the first room of what will be
   a whole complex. Everything here is built with the ordinary kit, but into
   its OWN buckets, emitted at once and tagged userData.under, so that the
   'Underground' view (88-underview.js) can hide the surface and keep this.
   All faces point INTO the rooms and are single-sided: from outside, the walls
   nearest the camera are culled, which is the cutaway.                      */
reseed(540001);
var UNDER_MESHES = [];
(function(){
  if(SHEET) return;
  var savedB=BUCKET, savedM=MBK, n0=scene.children.length; BUCKET={}; MBK={};
  var A=ANTE, T=TUNNEL, FY=A.floorY, PF=platFrame(A.x,A.z,0), MET=METALC, LIT=PAL.electric, BLU=PAL.electricBlue;
  function ELEC(x,y,z,amp,rad){ nlLampAdd(x,y,z,amp,rad,true); }

  /* ---- antechamber: floor, drum wall, ribbed parabolic dome with an oculus of light ---- */
  SECTOR('metal', PF, 0, A.R, 0, TAU, FY-1, FY, MET[1], { faces:'t', step:6 });
  [[0.30,BLU],[0.62,LIT],[0.93,BLU]].forEach(function(q){ SECTOR('glowmat', PF, A.R*q[0]-0.18, A.R*q[0]+0.18, 0, TAU, FY, FY+0.03, q[1], { faces:'t', step:3 }); });
  SECTOR('mosaic', PF, A.R*0.32, A.R*0.60, 0, TAU, FY, FY+0.015, MOSBLUEC[2], { faces:'t', step:5 });
  var DOORS=[]; for(var d=0; d<6; d++) DOORS.push(d/6*TAU + Math.PI/6 + Math.PI/2);        /* six sealed doors; the tunnel arrives due north (angle 270 deg) between two of them */
  var WH=13, arr=-Math.PI/2, segs=72;
  for(var i=0;i<segs;i++){ var a0=i/segs*TAU, a1=(i+1)/segs*TAU, am=(a0+a1)/2;
    if(angDist(am,arr) < (T.w/2+0.5)/A.R) continue;                                         /* the tunnel mouth */
    SECTOR('metal', PF, A.R, A.R+1.5, a0, a1, FY, FY+WH, (i%6<1)?TARNC[1]:MET[i%3], { faces:'i' });
    if(i%6===0){ var p=platXZ(PF,A.R-0.35,a0); BOX(p[0], FY, p[1], 0.9, WH, 0.7, -a0+Math.PI/2, TARNC[0], 'metal');                   /* pilaster */
                 BOX(p[0]-Math.cos(a0)*0.4, FY+0.6, p[1]-Math.sin(a0)*0.4, 0.22, WH-1.2, 0.12, -a0+Math.PI/2, LIT, 'glowmat'); ELEC(p[0]-Math.cos(a0)*2, FY+WH*0.55, p[1]-Math.sin(a0)*2, 1.2, 22); }
  }
  SECTOR('glowmat', PF, A.R-0.5, A.R-0.1, 0, TAU, FY+WH-0.25, FY+WH, LIT, { faces:'ib', step:3 });                                   /* cove light at the springing */
  /* dome: ribs + panels, all facing inward */
  var NR=24, NV=12, domeY=function(t){ return FY+WH + (A.H-WH)*(1-Math.pow(1-t,2)); }, domeR=function(t){ return A.R*(1-t*0.90); };
  for(var v=0; v<NV; v++){ var t0=v/NV, t1=(v+1)/NV; for(var u=0; u<NR*2; u++){ var b0=u/(NR*2)*TAU, b1=(u+1)/(NR*2)*TAU;
      var p00=platXZ(PF,domeR(t0),b0), p01=platXZ(PF,domeR(t0),b1), p10=platXZ(PF,domeR(t1),b0), p11=platXZ(PF,domeR(t1),b1);
      QF((u%2)?'metal':'concrete', [p00[0],domeY(t0),p00[1]],[p01[0],domeY(t0),p01[1]],[p11[0],domeY(t1),p11[1]],[p10[0],domeY(t1),p10[1]], (u%2)?MET[(v+u)%3]:CONCRETEC[v%3], [A.x-p00[0], -0.6*A.R, A.z-p00[1]]); } }
  for(var r=0;r<NR;r++){ var ra=r/NR*TAU, pts=[]; for(var k=0;k<=8;k++){ var t=k/8, pr=platXZ(PF,domeR(t)-0.5,ra); pts.push({ x:pr[0], y:domeY(t)-0.45, z:pr[1], r:0.42 }); }
    TUBE('metal', pts, TARNC[2], { seg:6 }); if(r%2===0){ var pl=platXZ(PF,domeR(0.45)-1.2,ra); BOX(pl[0], domeY(0.45)-1.4, pl[1], 0.5, 0.14, 2.6, -ra+Math.PI/2, LIT, 'glowmat'); ELEC(pl[0], domeY(0.45)-3, pl[1], 1.0, 22); } }
  SECTOR('glowmat', PF, 0, A.R*0.10+0.2, 0, TAU, FY+A.H-0.4, FY+A.H-0.2, LIT, { faces:'b', step:2 }); ELEC(A.x, FY+A.H-5, A.z, 2.6, 46);
  REGISTER({ name:A.name, kind:'underground', label:'round technological antechamber, R '+A.R+' m — first room of the complex', x:A.x, y:FY-1, z:A.z, r:A.R+1, h:A.H+2 });

  /* ---- six sealed doors: parabolic frames of light round blue-glass leaves (future wings) ---- */
  DOORS.forEach(function(a,i){ var p=platXZ(PF,A.R-0.2,a), ry=Math.atan2(-Math.cos(a),-Math.sin(a));
    ARCHBAND('glowmat', p[0],p[1], ry, FY, 7.0, 10.5, 0.35, 0, BLU); ARCHBAND('metal', p[0]-Math.cos(a)*0.05,p[1]-Math.sin(a)*0.05, ry, FY, 7.7, 10.85, 0.9, 0, TARNC[0]);
    BOX(p[0]-Math.cos(a)*0.1, FY, p[1]-Math.sin(a)*0.1, 6.4, 8.2, 0.2, -a+Math.PI/2, GLASSC[i%4], 'glass');
    REGISTER({ name:'Sealed door '+'ABCDEF'[i], kind:'underground', label:'future wing (not yet built)', x:p[0], y:FY, z:p[1], r:4.2, h:11 }); });

  /* ---- the dais: a relic plinth under a column of light, ringed by touch-consoles ---- */
  SECTOR('concrete', PF, 0, 7.5, 0, TAU, FY, FY+0.6, CONCRETEC[2], { faces:'to', step:3 }); SECTOR('metal', PF, 0, 5.0, 0, TAU, FY+0.6, FY+1.2, MET[0], { faces:'to', step:3 });
  SECTOR('glowmat', PF, 5.0, 5.25, 0, TAU, FY+0.6, FY+0.66, BLU, { faces:'t', step:2 });
  TUBE('glowmat', [{x:A.x,y:FY+1.2,z:A.z,r:0.9},{x:A.x,y:FY+4,z:A.z,r:0.35},{x:A.x,y:FY+9,z:A.z,r:0.18}], BLU, { seg:10 });
  TUBE('metal', [{x:A.x,y:FY+1.2,z:A.z,r:1.6},{x:A.x,y:FY+2.0,z:A.z,r:1.2},{x:A.x,y:FY+2.3,z:A.z,r:1.5}], TARNC[1], { seg:12 });
  ELEC(A.x, FY+4, A.z, 2.2, 26);
  REGISTER({ name:'Relic dais', kind:'underground', label:'plinth + light column', x:A.x, y:FY, z:A.z, r:7.5, h:10 });
  for(var c=0;c<12;c++){ var ca=c/12*TAU+0.13, cp=platXZ(PF,A.R*0.62+2.2,ca); if(angDist(ca,arr)<0.3) continue;
    BOX(cp[0], FY, cp[1], 2.6, 0.95, 1.0, -ca+Math.PI/2, TARNC[c%3], 'metal'); BOX(cp[0]-Math.cos(ca)*0.12, FY+0.95, cp[1]-Math.sin(ca)*0.12, 2.3, 0.06, 0.7, [0.32,-ca+Math.PI/2,0], c%3?BLU:LIT, 'glowmat');
    REGISTER({ name:'Touch console '+(c+1), kind:'underground', label:'Ancient control desk', x:cp[0], y:FY, z:cp[1], r:1.6, h:1.4 }); }

  /* ---- the tunnel: a parabolic-vaulted ramp from the great door down to the chamber ---- */
  var NS=22, L=Math.hypot(T.z1-T.z0, T.y1-T.y0);
  for(var s=0;s<NS;s++){ var f0=s/NS, f1=(s+1)/NS, z0=mix(T.z0,T.z1,f0), z1=mix(T.z0,T.z1,f1), y0=mix(T.y0,T.y1,f0), y1=mix(T.y0,T.y1,f1), NA=10;
    QF('metal', [T.x0-T.w/2,y0,z0],[T.x0+T.w/2,y0,z0],[T.x0+T.w/2,y1,z1],[T.x0-T.w/2,y1,z1], MET[s%3], [0,1,0]);
    for(var q=0;q<NA;q++){ var u0=q/NA*2-1, u1=(q+1)/NA*2-1, hx0=T.w/2*u0, hx1=T.w/2*u1, e0=T.h*(1-Math.pow(Math.abs(u0),2.6)), e1=T.h*(1-Math.pow(Math.abs(u1),2.6));
      QF((s%4===0)?'concrete':'metal', [T.x0+hx0,y0+e0,z0],[T.x0+hx1,y0+e1,z0],[T.x0+hx1,y1+e1,z1],[T.x0+hx0,y1+e0,z1], (s%4===0)?CONCRETEC[1]:TARNC[(q+s)%3], [-(hx0+hx1), -1, 0]); }
    [-1,1].forEach(function(sd){ BOX(T.x0+sd*(T.w/2-0.9), (y0+y1)/2+0.5, (z0+z1)/2, 0.14, 0.14, (z1-z0)*0.8, 0, LIT, 'glowmat'); });
    if(s%3===1) ELEC(T.x0, (y0+y1)/2+T.h*0.6, (z0+z1)/2, 1.6, 24);
  }
  REGISTER({ name:T.name, kind:'underground', label:'ramped tunnel, '+Math.round(L)+' m', x:T.x0, y:Math.min(T.y0,T.y1)-1, z:(T.z0+T.z1)/2, hx:T.w/2+1, hz:Math.abs(T.z1-T.z0)/2, h:Math.abs(T.y1-T.y0)+T.h+2 });

  /* emit into the scene now, tag, and keep these lit at all hours (they never see the sun) */
  emitBuckets(); emitMerged();
  for(var m=n0; m<scene.children.length; m++){ var o=scene.children[m]; o.userData.under=true; o.castShadow=false; UNDER_MESHES.push(o);
    (function(mat){ var old=mat.onBeforeCompile; if(!old || mat.isMeshBasicMaterial) return;
      mat.onBeforeCompile=function(sh){ old(sh); sh.uniforms.uNlNight={ value:1.0 }; };
      var ok=mat.customProgramCacheKey; mat.customProgramCacheKey=function(){ return (ok?ok.call(mat):'')+'|under'; }; })(o.material); }
  BUCKET=savedB; MBK=savedM;
  window._under = { meshes:UNDER_MESHES.length };
})();
