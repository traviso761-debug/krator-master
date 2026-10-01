/* ============================== 16X-K. ABYSS — the Headman's palace and its plaza ==============================
   ("the Headman" stands in for the ruler's title until the brief names it.)
   PALACE: the largest building in the kit. A raised deck compound on piles over the water; a central great hall on a
   lacquered plinth under the GRANDEST swoop-and-horn roof (the widest and deepest; the temple gate's is the tallest);
   tin-mirror cone towers at the four corners of the deck; sail-roofed loggias either side of the front stair; a
   private dock at the back. PLAZA: a separate asset so the world can place it on its own: salt-white paving with a
   mosaic of concentric squares (lacquer, teal, gold — the temple court's motif), an overhead canopy of strung lanterns
   and umbrellas on masts round the edge, benches. LINE-UP: put the plaza at local (0, +PALACE_D/2 + PLAZA_D/2) = (0, +67)
   in the palace's frame, same yaw: the footprints touch, and the palace's front stair (foot at z = +30.8) leaves a 5 m apron
   of open ground before the plaza's back edge (z = +36), where the back row of benches is broken for it.                    */
reseed(657001);
(function(){
  var PI=Math.PI, PW=92, PD=72, ZD=62;
  ABYSS.PALACE_PLAZA_OFFSET = [0, PD/2+ZD/2];

  ASSET({ key:'abyss_palace', name:"The Headman's palace", family:'rich', kit:'abyss', group:'Palace and plaza', culture:'abyssal-desert', types:['civic','single-family dwelling'],
    wealth:[0.9,1.0], w:PW, d:PD, h:34, variants:1, sim:{ activity:'GOVERN', capacity:300, focus:[0,5.4,-6] },
    build:function(F){ var H=2.4, lac=PAL.abLacquer, gild=PAL.abGild, salt=PAL.abSalt, X0=-42, X1=42, Z0=-26, Z1=28;
      ABYSS.water(F, 0,-1, PW,PD-2);
      ABYSS.platform(F, X0,X1, Z0,Z1, H, { span:4.0, r:0.24 });
      F.box(0,H-0.02,0, X1-X0-0.4,0.04,Z1-Z0-0.4, 0, shade(F.pick(PLANKC),0.05), 'plank');
      ABYSS.railRect(F, X0,X1,Z0,Z1, H, [['f',-9,9],['b',-4,4]]);
      /* the great hall: a lacquered plinth with banded courses, lime-wash walls between lacquered posts, lattice screens */
      var hw=40, hd=22, hz=-6, P=H+1.4, WH=7.0;
      F.box(0,H,hz, hw+3,1.4,hd+3, 0, lac, 'plaster'); [0.35,0.95].forEach(function(y,i){ F.box(0,H+y,hz, hw+3.1,0.16,hd+3.1, 0, i?gild:PAL.abBrightTeal, 'relief'); });
      F.box(0,P,hz, hw,WH,hd, 0, PASTELC[6], 'plaster');
      var np=10; for(var i=0;i<=np;i++){ var x=-hw/2+hw*i/np; [hz-hd/2-0.1, hz+hd/2+0.1].forEach(function(z){ F.cyl(x,P,z, 0.42,WH, 0, lac, 'plaster'); F.cyl(x,P+WH-0.4,z, 0.55,0.4, 0, gild, 'metal'); }); }
      for(var j=0;j<np;j++){ var xm=-hw/2+hw*(j+0.5)/np; if(Math.abs(xm)<3) continue; LOCUS.lattice(F, xm,P+4.6,hz+hd/2+0.04, 0,1, 2.4,3.0); ABYSS.trim(F, xm,P+3.1,hz+hd/2+0.04, 0,1, 2.4,3.0); }
      [-1,1].forEach(function(s){ for(var k=-2;k<=2;k++) LOCUS.lattice(F, s*(hw/2+0.04),P+4.6,hz+k*4, s,0, 2.4,3.0); });
      F.door(0, hz+hd/2+0.05, 0,1, 3.2, 5.2, gild, P); ABYSS.trim(F, 0,P,hz+hd/2+0.08, 0,1, 3.4,5.4);
      F.box(0,P+WH,hz, hw+0.8,0.5,hd+0.8, 0, lac, 'relief');
      /* the grandest roof */
      ABYSS.swoopRoof(F, 0,hz, hw, hd, 12.5, { y0:P+WH+0.5, horn:7.5, over:2.4, col:THATCHC[0], eaveLift:2.0, saddle:3.0 });
      /* the front stair: broad, from the plaza ground up to the deck, then to the hall's plinth */
      LOCUS.stair(F, 0, Z1+H*1.15, 0,-1, H, 16);
      ABYSS.flight(F, 0,hz+hd/2+1.5+1.4*1.15, 0,-1, H,P, 8);
      /* the four corner towers: rubble drums under tin-mirror cones; the front pair taller, open-arched at the base */
      [[-36,-21,0],[36,-21,0],[-36,22,1],[36,22,1]].forEach(function(t){ var x=t[0], z=t[1], fr=t[2];
        F.lathe('rubble', x,z, [[5.6,0],[5.2,H+3.2]], PAL.abRubble, { seg:22 }); F.lathe('relief', x,z, [[5.3,H+3.0],[5.3,H+3.6]], lac, { seg:22 });
        ABYSS.coneShell(F, x,z, 5.2, fr?22:18, { y0:H+3.6, fam:'tinmirror', col:PAL.abTin, k:1.2, arch:fr?{ w:3.2, h:4.6 }:null, archCol:gild, ring:gild, thick:0.3, face:Math.atan2(-z,-x) });
        F.lamp(x, H+8, z, 1.0, 16); });
      /* sail-roofed loggias either side of the front stair */
      [-1,1].forEach(function(s){ var cx=s*22, cz=17, w=20, d=11, M=[[cx-w/2,H+8.0,cz-d/2],[cx+w/2,H+7.0,cz-d/2],[cx+w/2,H+8.0,cz+d/2],[cx-w/2,H+7.0,cz+d/2]];
        M.forEach(function(m){ ABYSS.mast(F, m[0],m[2], m[1], { r:0.2, finial:gild, prop:true, lit:true }); });
        ABYSS.sail(F, M, PAL.abSailOrange, { swoop:1.6, band:PAL.abSailOrange, bandW:0.9 });
        ABYSS.furn(F, 'abyss_bench', cx-4,cz, PI/2, { ly:H, variant:1 }); ABYSS.furn(F, 'abyss_bench', cx+4,cz, -PI/2, { ly:H, variant:1 }); ABYSS.furn(F, 'abyss_table_stools', cx,cz, 0, { ly:H, variant:1 });
        ABYSS.furn(F, 'abyss_brazier', cx+s*7,cz+3, 0, { ly:H, variant:1 }); [-6,0,6].forEach(function(o){ ABYSS.lantern(F, cx+o, H+5.6, cz, true); }); });
      /* behind the hall: the women's court and stores (pastel pavilions), the Headman's crystal shrine */
      [-1,1].forEach(function(s){ var c=s<0?PASTELC[0]:PASTELC[3]; F.box(s*26,H,-19, 14,4.2,8, 0, c, 'plaster'); F.box(s*26,H,-19, 14.1,0.5,8.1, 0, shade(c,-0.3), 'plaster');
        LOCUS.parapet(F, s*26,H+4.2,-19, 14,8, 0.2,0.6, c, shade(c,-0.3)); [-4,0,4].forEach(function(o){ LOCUS.lattice(F, s*26+o,H+2.8,-15+0.02, 0,1, 1.4,1.6); }); });
      ABYSS.furn(F, 'abyss_crystal_ring', 0,-21, 0, { ly:H, variant:1 }); ABYSS.furn(F, 'abyss_fire_bowl', 0,-21, 0, { ly:H, variant:1 });
      /* the private dock out of the back gap, over the water, and the Headman's barge */
      ABYSS.platform(F, -4,4, -35,-26, H-0.6, { span:3.0 }); [-3.6,3.6].forEach(function(x){ ABYSS.mast(F, x,-34.6, H+3.4, { lantern:'lit', finial:gild }); });
      F.edome(9,0.05,-31, 2.0,0.8,4.6, 0, lac, 'plank'); F.box(9,0.6,-31, 3.0,0.12,6.0, 0, gild, 'metal');
      ABYSS.sail(F, [[7.4,4.0,-33.5],[10.6,4.0,-33.5],[10.6,3.4,-28.5],[7.4,3.4,-28.5]], PAL.abSailOrange, { swoop:0.4, band:PAL.abSailOrange, bandW:0.4 });
      [7.4,10.6].forEach(function(x){ [-33.5,-28.5].forEach(function(z,i){ F.cyl(x,0.6,z, 0.06, i?2.8:3.4, 0, gild, 'metal'); }); });
      ABYSS.plant(F, 'abyss_lily_pads', -14,-31, 0, { variant:1 }); ABYSS.plant(F, 'abyss_lily_pads', 20,-32, 0, { variant:1 });
      [-30,-14,14,30].forEach(function(x){ ABYSS.furn(F, 'abyss_lantern_post', x,Z1-1.0, PI, { ly:H, variant:1 }); });
      ABYSS.antenna(F, 30,H,-24, 'lattice', { h:9 });
    } });

  ASSET({ key:'abyss_palace_plaza', name:"The Headman's plaza", family:'civic', kit:'abyss', group:'Palace and plaza', culture:'abyssal-desert', types:['civic','market/shop'],
    wealth:[0.8,1.0], w:92, d:ZD, h:9, variants:1, sim:{ activity:'GOVERN', capacity:3000, focus:[0,0,0] },
    build:function(F){ var W=90, D=60, salt=PAL.abSalt, lac=PAL.abLacquer, gild=PAL.abGild, teal=PAL.abBrightTeal;
      F.box(0,0,0, W,0.15,D, 0, salt, 'plaster');
      /* the mosaic: concentric squares, alternately framed and filled, round a gold centre */
      var rings=[[27,lac,1.2],[23,teal,0.8],[19.5,gild,0.6],[16,lac,1.6],[12,teal,0.8],[9,gild,0.6],[6,lac,1.2],[3,teal,0.6]];
      rings.forEach(function(r,i){ var R=r[0], t=r[2], y=0.15+0.002*i;
        [[0,R-t/2,2*R,t],[0,-R+t/2,2*R,t],[R-t/2,0,t,2*R-2*t],[-R+t/2,0,t,2*R-2*t]].forEach(function(q){ F.box(q[0],y,q[1], q[2],0.03,q[3], 0, r[1], 'mosaic'); }); });
      F.box(0,0.15,0, 2.4,0.04,2.4, PI/4, gild, 'mosaic');
      /* the edge canopy: strung lanterns along the front and back, umbrella bays down the sides */
      for(var i=0;i<6;i++){ var x=-37.5+i*15; ABYSS.furn(F, 'abyss_lantern_string', x,D/2-1.2, 0, { variant:1 }); ABYSS.furn(F, 'abyss_lantern_string', x,-D/2+1.2, 0, { variant:1 }); }
      for(var k=0;k<4;k++){ var z=-15+k*10; ABYSS.furn(F, 'abyss_umbrella_canopy', -W/2+5.4,z, 0, { variant:k%2 }); ABYSS.furn(F, 'abyss_umbrella_canopy', W/2-5.4,z, 0, { variant:(k+1)%2 }); }
      /* benches facing the centre, braziers on the diagonals, a gap at the back for the palace stair */
      for(var b=0;b<5;b++){ var bx=-24+b*12; ABYSS.furn(F, 'abyss_bench', bx,D/2-5, PI, { variant:1 }); if(Math.abs(bx)>9) ABYSS.furn(F, 'abyss_bench', bx,-D/2+5, 0, { variant:1 }); }
      [[-1,-1],[1,-1],[1,1],[-1,1]].forEach(function(c){ ABYSS.furn(F, 'abyss_brazier', c[0]*30,c[1]*22, 0, { variant:1 }); });
      /* two lacquered standards with gilded discs at the front corners */
      [-1,1].forEach(function(s){ F.cyl(s*(W/2-2),0,D/2-2, 0.35,8.5, 0, lac, 'plaster'); F.disc(s*(W/2-2),8.0,D/2-2, 0,1, 0.9, 0.12, gild, 'metal'); });
    } });
})();
