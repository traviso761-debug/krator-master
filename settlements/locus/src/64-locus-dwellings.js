/* ============================== 16M. LOCUS — abyssal-desert dwellings, tents and shades ==============================
   The new style: Moorish / Berber / Persian by way of a salt marsh. Houses stand on piles above the flood, walls
   are reed mat or a pastel lime-wash over mud, openings are parabolic like Yuni's, and the real architecture is
   the SHADE — canvas canopies on poles, sails over roof terraces, wind-catchers, rolled tent walls. Pastel, never
   saturated, so it sits beside Yuni's ochre and blue without a clash.                                          */
reseed(641001);
(function(){
  var PI=Math.PI, GROUP_H='Abyssal-desert dwellings (stilt houses)', GROUP_T='Abyssal-desert canvas: tents and sun shades';
  function past(F,i){ return PASTELC[(i==null?Math.floor(F.rnd()*PASTELC.length):i)%PASTELC.length]; }
  function deep(F,i){ return PASTELDC[i%PASTELDC.length]; }
  /* a small rain jar and a fish-drying rack: the things that stand beside a marsh house */
  function jar(F,x,y,z,s){ F.lathe('adobe', x,z, [[0.25*s,y],[0.42*s,y+0.35*s],[0.36*s,y+0.8*s],[0.22*s,y+0.95*s],[0.26*s,y+1.05*s]], F.pick(ADOBEREDC), { seg:8 }); }
  function dryRack(F,x,z,yaw,L){ var c=Math.cos(yaw), s=Math.sin(yaw), tc=F.pick(TIMBERC);
    [-1,1].forEach(function(e){ F.cyl(x+c*e*L/2, 0, z-s*e*L/2, 0.05, 1.9, 0, tc, 'timber'); });
    [1.0,1.5].forEach(function(h){ F.rod(x-c*L/2,h,z+s*L/2, x+c*L/2,h,z-s*L/2, 0.025, tc, 'timber'); });
    for(var i=0;i<Math.floor(L/0.35);i++){ var t=(i+0.5)/Math.floor(L/0.35)-0.5; F.box(x+c*t*L, 1.05, z-s*t*L, 0.10,0.42,0.03, yaw, F.pick(PAL.people.skin), 'cloth'); } }
  function ridgeRoof(F, cx,cz, w,d, y, h, over, col, fam){ /* a gabled canvas / thatch roof: ridge along x */
    var a=[cx-w/2-over, y, cz-d/2-over], b=[cx+w/2+over, y, cz-d/2-over], c=[cx+w/2+over, y, cz+d/2+over], dd=[cx-w/2-over, y, cz+d/2+over];
    var r0=[cx-w/2-over, y+h, cz], r1=[cx+w/2+over, y+h, cz], c2=shade(col,-0.10);
    F.quad(fam, a,b,r1,r0, col, [0,1,-1]); F.quad(fam, dd,c,r1,r0, c2, [0,1,1]);
    F.quad(fam, [a[0],a[1]-0.04,a[2]],[b[0],b[1]-0.04,b[2]],[r1[0],r1[1]-0.04,r1[2]],[r0[0],r0[1]-0.04,r0[2]], shade(col,-0.35), [0,-1,1]);
    F.quad(fam, [dd[0],dd[1]-0.04,dd[2]],[c[0],c[1]-0.04,c[2]],[r1[0],r1[1]-0.04,r1[2]],[r0[0],r0[1]-0.04,r0[2]], shade(col,-0.35), [0,-1,-1]);
    F.tri(fam, [cx-w/2,y,cz-d/2],[cx-w/2,y,cz+d/2],[cx-w/2,y+h*(1-over/(d/2+over)),cz], shade(col,-0.2), [-1,0,0]);   /* gable ends closed with the same fabric */
    F.tri(fam, [cx+w/2,y,cz-d/2],[cx+w/2,y,cz+d/2],[cx+w/2,y+h*(1-over/(d/2+over)),cz], shade(col,-0.2), [1,0,0]);
    F.rod(cx-w/2-over-0.1, y+h, cz, cx+w/2+over+0.1, y+h, cz, 0.06, F.pick(TIMBERC), 'timber'); }

  /* =============================================================== 1. POOR STILT HOUSE */
  ASSET({ key:'stilt_poor', name:'Marsh stilt house', family:'poor', kit:'locus', group:GROUP_H, culture:'abyssal-desert', types:['single-family dwelling'],
    districts:['poor'], wealth:[0,0.35], w:11, d:10, h:8, variants:3, variantNames:['reed mats, thatch hip','washed mud, canvas gable','two rooms, flat roof and sail'],
    build:function(F){
      var v=F.variant, H=[2.1,2.4,2.0][v]+F.rr(-0.15,0.15), pc=F.pick(PILEC), pk=F.pick(PLANKC);
      var DW=[7.6,7.8,8.4][v], DD=6.4, dz=-0.9;                                         /* deck centre sits back; the stair comes forward */
      var hutW=[5.4,5.6,6.6][v], hutD=4.2, hz=dz-1.0;                                    /* hut on the back of the deck, porch in front */
      LOCUS.pileGrid(F, -DW/2+0.5, DW/2-0.5, dz-DD/2+0.4, dz+DD/2-0.4, 4, 3, H, { col:pc });
      LOCUS.deck(F, 0,dz, DW,DD, H, pk);
      var wall = v===0 ? F.pick(REEDMATC) : past(F, [1,6,2][v]+F.variant), wallFam = v===0 ? 'thatch' : 'plaster', WH=[2.5,2.6,2.7][v];
      var band = deep(F, v+2);
      if(v===0){ /* reed-mat walls on a post frame */
        [[0,1,hutW],[0,-1,hutW],[1,0,hutD],[-1,0,hutD]].forEach(function(n){ LOCUS.matWall(F, n[0]*hutW/2, H, hz+n[1]*hutD/2, n[2], WH, n[0],n[1], wall); });
        [[-1,-1],[1,-1],[1,1],[-1,1]].forEach(function(c){ F.cyl(c[0]*hutW/2, H, hz+c[1]*hutD/2, 0.09, WH+0.2, 0, F.pick(TIMBERC), 'timber'); });
        F.pyr(0, H+WH, hz, hutW+2.2, 2.2, hutD+2.2, 0, F.pick(THATCHC), 'thatch');
        F.box(0, H+WH-0.02, hz, hutW+2.4, 0.06, hutD+2.4, 0, shade(THATCHC[3],-0.3), 'thatch');           /* the underside of the eaves */ }
      else { F.box(0, H, hz, hutW, WH, hutD, 0, wall, wallFam);
        F.box(0, H, hz, hutW+0.08, 0.5, hutD+0.08, 0, band, 'plaster');                                  /* the pastelDeep plinth band */
        if(v===1){ ridgeRoof(F, 0,hz, hutW,hutD, H+WH, 1.6, 0.8, F.pick(CANVASDYEC), 'canvas'); }
        else { F.box(0, H+WH, hz, hutW-0.3, 0.14, hutD-0.3, 0, pk, 'plank'); LOCUS.parapet(F, 0,H+WH,hz, hutW,hutD, 0.2,0.55, wall, band);
          /* a sail over the roof on three poles */
          var ph=H+WH+2.3; LOCUS.pole(F, -hutW/2+0.4, hz-hutD/2+0.4, ph, 0.07, null, true); LOCUS.pole(F, hutW/2-0.4, hz-hutD/2+0.4, ph, 0.07, null, true); LOCUS.pole(F, 0, hz+hutD/2+0.9, ph-0.3, 0.07, null, true);
          LOCUS.canopy(F, [[-hutW/2+0.4,ph,hz-hutD/2+0.4],[hutW/2-0.4,ph,hz-hutD/2+0.4],[0,ph-0.3,hz+hutD/2+0.9]], past(F,3), { sag:0.3 });
          F.rod(-hutW/2+0.2, H+WH+1.5, hz+0.5, hutW/2-0.2, H+WH+1.5, hz+0.5, 0.015, PAL.people.hair[2], 'timber');                  /* washing line */
          for(var k=0;k<4;k++) F.box(-hutW/2+1.0+k*1.1, H+WH+0.85, hz+0.5, 0.6,0.65,0.03, 0, F.pick(CLOTHC), 'cloth'); } }
      /* door + windows on the front (+z) face of the hut, and a side window */
      var fz=hz+hutD/2; F.door(-1.2, fz+0.02, 0,1, 0.95, 1.95, PLANKC[(v+1)%4], H);
      LOCUS.shutterWin(F, 1.4, H+1.5, fz+0.02, 0,1, 0.7, 0.7, F.pick(PLANKC));
      LOCUS.shutterWin(F, hutW/2+0.02, H+1.5, hz-0.6, 1,0, 0.7, 0.7, F.pick(PLANKC));
      if(v===2){ F.window(-2.2, H+1.5, fz+0.02, 0,1, 0.7,0.7); }
      /* the porch canopy: two poles at the deck's front corners, tied back to the hut's eave */
      var pz=dz+DD/2-0.3, ey=H+WH+(v===0?-0.2:0.15), py=H+2.35;
      LOCUS.pole(F, -DW/2+0.45, pz, py, 0.08, null, false); LOCUS.pole(F, DW/2-0.45, pz, py, 0.08, null, false);
      LOCUS.canopy(F, [[-hutW/2-0.5, ey, fz+0.05],[hutW/2+0.5, ey, fz+0.05],[DW/2-0.45, py, pz],[-DW/2+0.45, py, pz]], v===0 ? CANVASDYEC[3] : past(F, v*3+1), { sag:0.28 });
      LOCUS.rail(F, -DW/2, dz+DD/2, -DW/2, dz-DD/2, H, F.pick(TIMBERC), 0.95); LOCUS.rail(F, DW/2, dz-DD/2, DW/2, dz+DD/2, H, F.pick(TIMBERC), 0.95);
      LOCUS.rail(F, -DW/2, dz+DD/2, -0.9, dz+DD/2, H, F.pick(TIMBERC), 0.95); LOCUS.rail(F, 0.9, dz+DD/2, DW/2, dz+DD/2, H, F.pick(TIMBERC), 0.95);
      /* the stair, straight down the front, and the ground clutter */
      LOCUS.stair(F, 0, dz+DD/2+H*1.15, 0,-1, H, 1.2, pk);
      jar(F, DW/2-1.0, H, dz+DD/2-0.9, 0.9); jar(F, -DW/2-0.6, 0, dz-1.5, 1.1);
      if(F.chance(0.8)) dryRack(F, -DW/2-0.2, dz+DD/2+1.6, 0.4, 2.6);
      if(F.chance(0.6)) F.cyl(DW/2-0.6, 0, dz+DD/2+2.2, 0.55, 0.18, 0, shade(pk,-0.2), 'plank');            /* a coiled net / basket stand */
      F.lantern(-0.2, H+2.05, fz+0.30, 0.6, 9, 0);
    } });

  /* =============================================================== 2. MIDDLE-CLASS STILT HOUSE */
  ASSET({ key:'stilt_mid', name:'Pastel stilt house', family:'mid', kit:'locus', group:GROUP_H, culture:'abyssal-desert', types:['single-family dwelling'],
    districts:['prosper','market','poor'], wealth:[0.3,0.75], w:16, d:16, h:12, variants:3, variantNames:['wind-catcher and loggia','two storeys under a sail','L-plan with wrapping verandah'],
    build:function(F){
      var v=F.variant, H=2.8+F.rr(-0.1,0.2), pc=PILEC[3], pk=F.pick(PLANKC), tc=F.pick(TIMBERC);
      var DW=13.4, DD=11.2, dz=-0.6, wall=past(F,[2,0,4][v]), wall2=past(F,[3,1,5][v]), band=deep(F,[2,0,4][v]), WH=3.4;
      LOCUS.pileGrid(F, -DW/2+0.6, DW/2-0.6, dz-DD/2+0.6, dz+DD/2-0.6, 5, 4, H, { col:pc, r:0.21 });
      LOCUS.deck(F, 0,dz, DW,DD, H, pk);
      F.box(0, H-0.30, dz, DW+0.1, 0.3, DD+0.1, 0, shade(pk,-0.25), 'timber');                                /* edge beam */
      /* the house body */
      var BW=[8.6,8.6,8.6][v], BD=[6.6,6.6,6.6][v], bx=[0,0,-1.6][v], bz=dz-1.4, fz=bz+BD/2;
      F.box(bx, H, bz, BW, WH, BD, 0, wall, 'plaster'); F.box(bx, H, bz, BW+0.1, 0.6, BD+0.1, 0, band, 'plaster');
      if(v===2){ /* the L: a wing on the right, set back, with its own small windows */
        var wx=bx+BW/2+1.6, wz=bz-1.0, WW=3.3, WD=BD-2.0; F.box(wx, H, wz, WW, WH, WD, 0, wall2, 'plaster'); F.box(wx, H, wz, WW+0.1, 0.6, WD+0.1, 0, band, 'plaster');
        F.box(wx, H+WH, wz, WW-0.3, 0.14, WD-0.3, 0, pk, 'plank'); LOCUS.parapet(F, wx, H+WH, wz, WW, WD, 0.2, 0.6, wall2, band);
        F.window(wx, H+1.9, wz+WD/2+0.02, 0,1, 0.8, 1.1); F.window(wx+WW/2+0.02, H+1.9, wz, 1,0, 0.8, 1.1); }
      var top=H+WH;
      if(v===1){ F.box(bx, top, bz, BW-0.6, WH-0.3, BD-0.6, 0, wall2, 'plaster'); F.box(bx, top, bz, BW-0.5, 0.35, BD-0.5, 0, band, 'relief'); top+=WH-0.3; }
      /* loggia along the front: parabolic arcade on the ground floor, lattice screens above */
      F.arcade('plaster', bx, H, fz+0.9, 0, 3, 2.6, WH-0.15, 0.4, wall2, { pier:1.0, head:0.9, colIn:shade(wall2,-0.2) });
      F.box(bx, H+WH-0.15, fz+0.9, 7.9, 0.15, 1.9, 0, pk, 'plank');                                             /* the loggia's roof slab, a balcony above on v1 */
      if(v===1){ F.arcade('plaster', bx, H+WH, fz+0.9, 0, 3, 2.6, WH-0.45, 0.35, wall, { pier:1.05, head:0.85, colIn:shade(wall,-0.2) }); F.box(bx, top-0.3, fz+0.9, 7.9, 0.3, 1.9, 0, band, 'plaster'); }
      F.box(bx, H, fz+0.02, 0.9, 2.3, 0.4, 0, VOIDC[1], 'dark'); F.door(bx, fz+0.02, 0,1, 1.1, 2.3, PLANKC[3], H);
      LOCUS.lattice(F, bx-2.6, H+1.9, fz+0.02, 0,1, 1.2, 1.4, tc); LOCUS.lattice(F, bx+2.6, H+1.9, fz+0.02, 0,1, 1.2, 1.4, tc);
      LOCUS.lattice(F, bx-BW/2-0.02, H+1.9, bz+0.8, -1,0, 1.1, 1.3, tc); LOCUS.lattice(F, bx+BW/2+0.02, H+1.9, bz-1.2, 1,0, 1.1, 1.3, tc);
      F.window(bx-1.5, H+1.9, bz-BD/2-0.02, 0,-1, 0.8, 1.1); F.window(bx+1.5, H+1.9, bz-BD/2-0.02, 0,-1, 0.8, 1.1);
      if(v===1){ [-2.6,0,2.6].forEach(function(o){ F.window(bx+o, H+WH+1.6, bz-BD/2-0.02, 0,-1, 0.8, 1.2); }); LOCUS.lattice(F, bx-BW/2+0.28, H+WH+1.6, bz, -1,0, 1.2, 1.3, tc); }
      /* roof terrace: parapet, then the great sail on four poles */
      LOCUS.parapet(F, bx, top, bz, BW, BD, 0.22, 0.75, wall, band);
      F.box(bx, top-0.05, bz, BW-0.5, 0.1, BD-0.5, 0, PAL.pavingRich[1], 'adobe');
      var sy=top+3.0, sp=[[bx-BW/2+0.5, bz-BD/2+0.5],[bx+BW/2-0.5, bz-BD/2+0.5],[bx+BW/2-0.5, bz+BD/2-0.5],[bx-BW/2+0.5, bz+BD/2-0.5]];
      sp.forEach(function(p,i){ LOCUS.pole(F, p[0], p[1], sy+(i%2?0.3:0), 0.09, tc, true); });
      LOCUS.canopy(F, sp.map(function(p,i){ return [p[0], sy+(i%2?0.3:0), p[1]]; }), v===1 ? CANVASDYEC[1] : past(F, [1,0,8][v]), { sag:0.6 });
      if(v===0) LOCUS.badgir(F, bx-BW/2+1.6, top, bz-BD/2+1.5, 1.8, 4.6, wall2, VOIDC[1]);
      /* verandah down one side (the left side and the wing's front on v2), under a striped awning tied to the wall */
      var sides = v===2 ? [-1] : [1];
      sides.forEach(function(s){ var ax=bx+s*BW/2, ex=s>0 ? DW/2-0.4 : -DW/2+0.4, ay=H+2.9, py=H+2.45;
        LOCUS.pole(F, ex, bz-BD/2+0.3, py, 0.08, tc, false); LOCUS.pole(F, ex, bz+BD/2-0.3, py, 0.08, tc, false); LOCUS.pole(F, ex, bz, py, 0.08, tc, false);
        LOCUS.stripes(F, [ax+s*0.05, ay, bz-BD/2+0.2],[ax+s*0.05, ay, bz+BD/2-0.2],[ex, py, bz+BD/2-0.3],[ex, py, bz-BD/2+0.3], 6, past(F,3+v), CANVASC[2], { sag:0.2 }); });
      if(v===2){ var wx2=bx+BW/2+1.6, wf=bz-1.0+(BD-2.0)/2, py2=H+2.45; LOCUS.pole(F, wx2-1.5, dz+DD/2-0.35, py2, 0.08, tc, false); LOCUS.pole(F, wx2+1.5, dz+DD/2-0.35, py2, 0.08, tc, false);
        LOCUS.stripes(F, [wx2-1.6, H+2.9, wf+0.05],[wx2+1.6, H+2.9, wf+0.05],[wx2+1.5, py2, dz+DD/2-0.35],[wx2-1.5, py2, dz+DD/2-0.35], 5, past(F,6), CANVASC[2], { sag:0.2 }); }
      /* rails on every deck edge, with gaps for the two stairs */
      LOCUS.rail(F, -DW/2, dz-DD/2, DW/2, dz-DD/2, H, tc, 1.0);
      LOCUS.rail(F, DW/2, dz-DD/2, DW/2, dz+DD/2, H, tc, 1.0);
      LOCUS.rail(F, -DW/2, dz-DD/2, -DW/2, dz-1.6, H, tc, 1.0); LOCUS.rail(F, -DW/2, dz+1.4, -DW/2, dz+DD/2, H, tc, 1.0);
      LOCUS.rail(F, -DW/2, dz+DD/2, -1.4, dz+DD/2, H, tc, 1.0); LOCUS.rail(F, 1.4, dz+DD/2, DW/2, dz+DD/2, H, tc, 1.0);
      /* stairs: the main one straight down the front, a second beside the left edge to the water side */
      LOCUS.stair(F, 0, dz+DD/2+H*1.15, 0,-1, H, 1.5, pk);
      LOCUS.stair(F, -DW/2-0.6, dz+1.0-H*1.15, 0,1, H, 1.0, pk);
      /* the yard under and around: a mud skirt under the front piles, jars, a shaded bench, a cistern */
      F.fr8(0, 0, dz+DD/2-0.3, DW-1.0, 0.5, 0.8, 0, band, 'adobe');
      F.lathe('adobe', DW/2-2.2, dz-DD/2-0.4, [[1.0,0],[1.1,0.9],[0.9,1.35]], F.pick(MUDBROWNC), { seg:10 }); F.cyl(DW/2-2.2, 1.2, dz-DD/2-0.4, 0.85, 0.1, 0, SALTWATERC[1], 'plaster');
      jar(F, bx+BW/2+0.6, H, fz+1.4, 1.1); jar(F, bx-BW/2-0.5, H, fz+1.2, 0.9);
      for(var k=0;k<3;k++) F.ball(bx-BW/2-0.5+k*0.8, H+0.3, fz+2.2, 0.36, PAL.shrub[k], 'leafy');                   /* potted plants along the loggia */
      F.lantern(bx-1.5, H+2.5, fz+0.35, 0.8, 12, 0); F.lantern(bx+1.5, H+2.5, fz+0.35, 0.8, 12, 0);
    } });

  /* =============================================================== 3. THE GREAT PAVILION TENT */
  ASSET({ key:'tent_pavilion', name:'Great pavilion tent', family:'prop', kit:'locus', group:GROUP_T, culture:'abyssal-desert', types:['prop','tavern/inn'],
    districts:['market','poor'], wealth:[0.1,0.7], w:18, d:14, h:7, variants:3, variantNames:['striped ridge tent','sand-and-rose with rolled walls','round bell tent'],
    build:function(F){
      var v=F.variant, tc=F.pick(TIMBERC), c1=[CANVASDYEC[0],PASTELC[5],CANVASC[0]][v], c2=[CANVASC[2],PASTELC[0],CANVASDYEC[3]][v];
      if(v<2){ var W=14, D=10, RH=5.6, EH=2.5, over=0.6;
        LOCUS.pole(F, -3.6, 0, RH+0.4, 0.13, tc, true); LOCUS.pole(F, 3.6, 0, RH+0.4, 0.13, tc, true);
        F.rod(-W/2, RH, 0, W/2, RH, 0, 0.07, tc, 'timber');                                                        /* the ridge pole */
        for(var i=0;i<=6;i++){ var x=-W/2+i*W/6; [-1,1].forEach(function(s){ LOCUS.pole(F, x, s*D/2, EH, 0.08, tc, false); LOCUS.guy(F, x, EH, s*D/2, x, s*(D/2+1.6)); }); }
        /* the two roof slopes, striped across the ridge */
        LOCUS.stripes(F, [-W/2-over, EH, -D/2-over],[W/2+over, EH, -D/2-over],[W/2+over, RH, 0],[-W/2-over, RH, 0], 12, c1, c2, { sag:0.35 });
        LOCUS.stripes(F, [-W/2-over, RH, 0],[W/2+over, RH, 0],[W/2+over, EH, D/2+over],[-W/2-over, EH, D/2+over], 12, c1, c2, { sag:0.35 });
        /* the ends: a canvas triangle each, the front one open with its flaps tied back */
        F.tri('canvas', [-W/2, EH, -D/2],[-W/2, RH, 0],[-W/2, EH, D/2], c2, [-1,0,0]); F.tri('canvas', [-W/2-0.03, EH, -D/2],[-W/2-0.03, RH, 0],[-W/2-0.03, EH, D/2], shade(c2,-0.25), [1,0,0]);
        F.tri('canvas', [W/2, EH, -D/2],[W/2, RH, 0],[W/2, EH, D/2-2.2], c2, [1,0,0]); F.tri('canvas', [W/2+0.03, EH, -D/2],[W/2+0.03, RH, 0],[W/2+0.03, EH, D/2-2.2], shade(c2,-0.25), [-1,0,0]);
        /* side walls: hung on the back, rolled up on the front */
        LOCUS.hang(F, -W/2, -D/2, W/2, -D/2, EH-0.05, EH-0.1, c2);
        if(v===0){ LOCUS.roll(F, -W/2, EH-0.25, D/2+0.2, W/2, EH-0.25, D/2+0.2, 0.24, c2); }
        else { LOCUS.hang(F, -W/2, D/2, -W/2+4.5, D/2, EH-0.05, EH-0.1, c2); LOCUS.roll(F, -W/2+4.5, EH-0.25, D/2+0.2, W/2, EH-0.25, D/2+0.2, 0.24, c2); }
        /* inside: a polychrome rug, cushions, a low table, a brazier */
        F.box(0, 0.02, 0.6, 7.5, 0.05, 4.6, 0, 0xf0e6d0, 'paintcol');
        for(var k=0;k<6;k++){ var a=k/6*TAU; F.ball(Math.cos(a)*2.3, 0.02, 0.6+Math.sin(a)*1.5, 0.42, CLOTHC[k%7], 'cloth'); }
        F.cyl(0, 0, 0.6, 0.9, 0.42, 0, PLANKC[1], 'plank'); F.cyl(3.8, 0, -2.6, 0.32, 0.5, 0, BRASSC[0], 'metal'); F.lamp(3.8, 0.7, -2.6, 0.9, 10);
        F.lantern(-3.6, RH-1.2, 0, 0.9, 14, 0.4); F.lantern(3.6, RH-1.2, 0, 0.9, 14, 0.4); }
      else { /* the bell tent: a centre pole, a canvas cone, a low canvas wall, a tied-open door */
        var R=6.0, WH=1.9, CH=6.2; LOCUS.pole(F, 0, 0, CH+0.3, 0.14, tc, true);
        F.mcone('canvas', 0, WH, 0, R+0.3, 0.25, CH-WH, c1, 18, { under:true, underDy:-0.2 });
        F.lathe('canvas', 0,0, [[R+0.34,WH+0.1],[R+0.34-0.9*0.72,WH+0.1+0.9*(CH-WH)/(R+0.3)*0.72+0.0]], c2, { seg:18 });     /* a dyed band round the skirt of the cone */
        F.lathe('cloth', 0,0, [[R,0.0],[R,WH]], c2, { seg:18 });
        F.box(0, 0, R-0.05, 1.6, WH, 0.4, 0, VOIDC[1], 'dark');
        for(var g=0;g<12;g++){ var ga=g/12*TAU; LOCUS.guy(F, Math.cos(ga)*R, WH, Math.sin(ga)*R, Math.cos(ga)*(R+1.6), Math.sin(ga)*(R+1.6)); F.cyl(Math.cos(ga)*R, 0, Math.sin(ga)*R, 0.05, WH, 0, tc, 'timber'); }
        F.box(0, 0.02, 0, 5.5, 0.05, 5.5, PI/4, 0xf0e6d0, 'paintcol'); F.cyl(0, 0, -2.6, 0.32, 0.5, 0, BRASSC[0], 'metal'); F.lamp(0, 0.7, -2.6, 0.9, 10); }
    } });

  /* =============================================================== 4. SUN SHADES */
  ASSET({ key:'sunshade_poles', name:'Four-pole sun shade', family:'prop', kit:'locus', group:GROUP_T, culture:'abyssal-desert', types:['prop'],
    districts:['core','prosper','market','poor'], wealth:[0,1], w:9, d:9, h:4.5, variants:3, variantNames:['square canvas','twin sails','striped with a bench'],
    build:function(F){
      var v=F.variant, tc=F.pick(TIMBERC), h=3.4, c1=past(F, v*2), c2=v===2 ? CANVASC[0] : past(F, v*2+5);
      if(v===0){ [[-3.5,-3.5],[3.5,-3.5],[3.5,3.5],[-3.5,3.5]].forEach(function(p,i){ LOCUS.pole(F, p[0],p[1], h+(i%2?0.35:0), 0.08, tc, true); LOCUS.guy(F, p[0], h+(i%2?0.35:0), p[1], p[0]*1.22, p[1]*1.22); });
        LOCUS.canopy(F, [[-3.5,h,-3.5],[3.5,h+0.35,-3.5],[3.5,h,3.5],[-3.5,h+0.35,3.5]], c1, { sag:0.55 }); }
      else if(v===1){ [[-4,-3.6],[4,-3.6],[0,3.6],[4,3.6],[-4,3.6]].forEach(function(p,i){ LOCUS.pole(F, p[0],p[1], h+[0.3,0,0.8,0.2,0.5][i], 0.08, tc, true); LOCUS.guy(F, p[0], h+[0.3,0,0.8,0.2,0.5][i], p[1], p[0]*1.22, p[1]*1.22); });
        LOCUS.canopy(F, [[-4,h+0.3,-3.6],[4,h,-3.6],[0,h+0.8,3.6]], c1, { sag:0.35 }); LOCUS.canopy(F, [[4,h+0.2,3.6],[-4,h+0.5,3.6],[0,h+0.8,3.6-0.02]], c2, { sag:0.25 });
        LOCUS.canopy(F, [[-4,h+0.5,3.6],[-4,h+0.3,-3.6],[0,h+0.8,3.6]], shade(c1,0.08), { sag:0.3 }); LOCUS.canopy(F, [[4,h,-3.6],[4,h+0.2,3.6],[0,h+0.8,3.6]], shade(c2,0.08), { sag:0.3 }); }
      else { [[-4,-3],[4,-3],[4,3],[-4,3]].forEach(function(p){ LOCUS.pole(F, p[0],p[1], h, 0.08, tc, true); LOCUS.guy(F, p[0], h, p[1], p[0]*1.2, p[1]*1.25); });
        LOCUS.stripes(F, [-4.4,h,-3.4],[4.4,h,-3.4],[4.4,h,3.4],[-4.4,h,3.4], 8, c1, c2, { sag:0.4 });
        for(var k=0;k<9;k++) F.box(-4+k*1.0, h-0.5, -3.45, 0.85, 0.5, 0.03, 0, k%2?c1:c2, 'cloth');                                     /* a fringe of hanging flaps on the sunny edge */
        F.box(0, 0.42, 1.2, 4.4, 0.10, 0.6, 0, F.pick(PLANKC), 'plank'); [-1.8,1.8].forEach(function(x){ F.box(x, 0, 1.2, 0.4, 0.42, 0.5, 0, F.pick(MUDBROWNC), 'adobe'); });
        for(var j=0;j<3;j++) F.ball(-1.5+j*1.5, 0.02, -1.0, 0.4, CLOTHC[(j+2)%7], 'cloth'); }
      F.lantern(0, h-0.6, 0, 0.7, 10, 0.5);
    } });
})();
