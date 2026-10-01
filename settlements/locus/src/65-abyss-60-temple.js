/* ============================== 16X-T. ABYSS — the temple of the altar ==============================
   A square sacred precinct (~70 x 70 m). At its centre the great stepped ALTAR (ABYSS.altar: 14 x 14 m, four steps,
   stairs in the middle of every side, salt-white top with a tin-mirror border, the fire bowl and the ring of blue
   crystals). Round it an open court of salt stone with inlaid concentric squares, then a SQUARE AMBULATORY — a covered
   walk on all four sides under swoop-and-horn thatch on lacquered posts. The GREAT GATE on +z carries the tallest
   swoop-and-horn roof in the kit; tin-mirror cone towers stand at the four corners. Nothing stands on the axis
   between the gate and the altar. sim: WORSHIP, focus = the altar's top centre (local).                           */
reseed(656001);
(function(){
  var PI=Math.PI, S=33, AMB0=26, AMB1=32, PH=4.4, ALT=14, ALTH=3.6;
  ASSET({ key:'abyss_temple', name:'Temple of the Altar', family:'civic', kit:'abyss', group:'Temple', culture:'abyssal-desert', types:['religious','civic'],
    wealth:[0.8,1.0], w:76, d:78, h:30, variants:1, sim:{ activity:'WORSHIP', capacity:200, focus:[0, ALTH, 0] },
    build:function(F){ var lac=PAL.abLacquer, gild=PAL.abGild, salt=PAL.abSalt, tc=F.pick(TIMBERC);
      /* the court: salt paving with inlaid concentric squares round the altar (lacquer, teal, gold) */
      F.box(0,0,0, 2*S,0.12,2*S, 0, salt, 'plaster');
      [[11,lac],[13.5,PAL.abBrightTeal],[16,gild],[21,lac]].forEach(function(b){ var r=b[0], t=0.7;
        [[0,r,2*r+t,t],[0,-r,2*r+t,t],[r,0,t,2*r-t],[-r,0,t,2*r-t]].forEach(function(q){ F.box(q[0],0.12,q[1], q[2],0.02,q[3], 0, b[1], 'plaster'); }); });
      /* the altar and its registration as a part (the life layer's focus) */
      var A=ABYSS.altar(F, 0,0, ALT, ALTH, { steps:4 });
      ABYSS.part(F, 'The Altar', 0,0,0, ALT*0.71, ALTH+2.5, 'sacred · the altar of the abyss · WORSHIP focus');
      /* the ambulatory: a raised walk on all four sides, lacquered posts on both edges, a back wall, swoop-and-horn roofs */
      var mid=(AMB0+AMB1)/2, dep=AMB1-AMB0;
      [[0,1],[0,-1],[1,0],[-1,0]].forEach(function(d){ var along=d[0]===0, yaw=along?0:PI/2;
        var runs = (d[1]===1) ? [[-(AMB1+0),-8],[8,AMB1]] : [[-AMB1,AMB1]];                              /* the front walk is split by the gate */
        runs.forEach(function(r){ var c0=(r[0]+r[1])/2, L=r[1]-r[0], cx=along?c0:d[0]*mid, cz=along?d[1]*mid:c0;
          F.box(cx,0,cz, along?L:dep, 0.5, along?dep:L, 0, PAL.abRubble, 'rubble'); F.box(cx,0.5,cz, along?L:dep, 0.06, along?dep:L, 0, salt, 'plaster');
          /* posts on the inner and outer edges, ~4.4 m apart */
          var n=Math.max(2,Math.round(L/4.4)); for(var i=0;i<=n;i++){ var t=mix(r[0]+0.4,r[1]-0.4,i/n);
            [AMB0+0.4, AMB1-0.4].forEach(function(e,k){ var px=along?t:d[0]*e, pz=along?d[1]*e:t;
              F.cyl(px,0.5,pz, 0.32,PH, 0, lac, 'plaster'); F.cyl(px,0.5+PH-0.3,pz, 0.42,0.3, 0, gild, 'metal'); F.box(px,0.5,pz, 0.9,0.5,0.9, 0, shade(lac,-0.2), 'plaster'); }); }
          /* the back wall closing the precinct (outer edge) */
          var wx=along?c0:d[0]*(AMB1+0.25), wz=along?d[1]*(AMB1+0.25):c0; F.box(wx,0.5,wz, along?L:0.5, 3.0, along?0.5:L, 0, lac, 'plaster');
          F.box(wx,0.5,wz, along?L:0.6, 0.6, along?0.6:L, 0, gild, 'relief'); F.box(wx,2.6,wz, along?L:0.6, 0.3, along?0.6:L, 0, PAL.abBrightTeal, 'relief');
          /* its roof: a long swoop-and-horn saddle along the walk */
          var q0=Math.max(r[0],-AMB1+6.8), q1=Math.min(r[1],AMB1-6.8), qc=(q0+q1)/2;                         /* the roof stops short of the corner towers */
          ABYSS.swoopRoof(F, along?qc:cx, along?cz:qc, q1-q0-1.0, dep-1.0, 4.4, { y0:0.5+PH, yaw:yaw, horn:d[1]===1?2.2:2.8, over:1.0, gable:false, col:THATCHC[1] });
          /* lit lanterns hung under the inner eave */
          for(var k2=1;k2<n;k2+=2){ var t2=mix(r[0]+0.4,r[1]-0.4,k2/n); ABYSS.lantern(F, along?t2:d[0]*(AMB0+0.4), 0.5+PH-0.6, along?d[1]*(AMB0+0.4):t2, true, 0.6); } }); });
      /* the four corner towers: rubble drums carrying tin-mirror cone shells */
      [[-1,-1],[1,-1],[1,1],[-1,1]].forEach(function(c){ var x=c[0]*(AMB1-1.5), z=c[1]*(AMB1-1.5);
        F.lathe('rubble', x,z, [[5.0,0],[4.6,5.0]], PAL.abRubble, { seg:20 }); F.lathe('relief', x,z, [[4.7,4.8],[4.7,5.4]], lac, { seg:20 });
        ABYSS.coneShell(F, x,z, 4.6, 16, { y0:5.4, fam:'tinmirror', col:PAL.abTin, k:1.15, arch:null, ring:gild, thick:0.3 }); });
      /* the great gate on +z: two lacquered pylons on a banded plinth, carved claw buttresses, a broad stair, and the
         tallest swoop-and-horn roof in the kit */
      var gz=mid, gw=8.0;
      F.box(0,0,gz, 30,1.2,dep+4, 0, lac, 'plaster'); [0.3,0.75].forEach(function(y,i){ F.box(0,y,gz, 30.1,0.14,dep+4.1, 0, i?gild:PAL.abBrightTeal, 'relief'); });
      [-1,1].forEach(function(s){ var px=s*(gw/2+3.0);
        F.box(px,1.2,gz, 6,9.0,dep+1, 0, lac, 'plaster'); F.box(px,1.2,gz, 6.2,1.0,dep+1.2, 0, shade(lac,-0.25), 'plaster');
        for(var b=0;b<3;b++) F.box(px,3.4+b*2.2,gz, 6.08,0.22,dep+1.08, 0, b%2?gild:PAL.abBrightTeal, 'relief');
        /* claw buttresses: tapering curved spurs at the pylon's outer corners, gilded tips */
        [-1,1].forEach(function(e){ var bx=px+s*3.0, bz=gz+e*(dep/2+0.5), pts=[]; for(var k=0;k<=6;k++){ var t=k/6; pts.push({ x:bx+s*(0.2+2.6*Math.pow(t,1.4)), y:1.2+6.0*(1-t)-0.2, z:bz+e*0.8*t, r:0.7*(1-0.85*t) }); }
          F.tube('plaster', pts, lac, { seg:8, cap:true }); F.cone(pts[6].x, 0.9, pts[6].z, 0.18, 0.7, [0,0,s*-1.2], gild, 'metal'); }); });
      F.box(0,8.4,gz, gw,1.8,dep+1, 0, lac, 'plaster'); F.box(0,8.4,gz, gw+0.1,0.3,dep+1.1, 0, gild, 'relief');
      ABYSS.swoopRoof(F, 0,gz, 18, dep+2, 11, { y0:10.4, horn:6.5, over:1.6, col:THATCHC[0], eaveLift:1.6, saddle:2.6 });
      /* stair from the front ground up onto the gate plinth (1.2 m) */
      for(var s2=0;s2<5;s2++) F.box(0,0,gz+(dep+4)/2+2.2-s2*0.45, gw+4, 0.24*(s2+1), 0.45, 0, s2%2?salt:shade(salt,-0.05), 'plaster');
      ABYSS.furn(F, 'abyss_brazier', -gw/2+0.6,gz+(dep+4)/2+3.4, 0, { variant:1 }); ABYSS.furn(F, 'abyss_brazier', gw/2-0.6,gz+(dep+4)/2+3.4, 0, { variant:1 });
      ABYSS.lantern(F, 0, 8.2, gz+dep/2+0.2, true, 1.0);
      /* the court's lantern posts, set on the diagonals so the gate-to-altar axis stays clear */
      [[-1,-1],[1,-1],[1,1],[-1,1]].forEach(function(c){ ABYSS.furn(F, 'abyss_lantern_post', c[0]*18,c[1]*18, Math.atan2(-c[0],-c[1]), { variant:1 }); ABYSS.furn(F, 'abyss_brazier', c[0]*9.6,c[1]*9.6, 0, { variant:1 }); });
      ABYSS.furn(F, 'abyss_bench', -20,4, PI/2, { variant:1 }); ABYSS.furn(F, 'abyss_bench', 20,4, -PI/2, { variant:1 }); ABYSS.furn(F, 'abyss_bench', -20,-4, PI/2, { variant:1 }); ABYSS.furn(F, 'abyss_bench', 20,-4, -PI/2, { variant:1 });
    } });
})();
