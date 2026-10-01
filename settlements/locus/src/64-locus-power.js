/* ============================== 16W. LOCUS — power and fuel ==============================
   Two Yuni-style works for the Geomancers, whitewashed with blue mosaic bands, parabolic arches,
   toron and cone pinnacles (the caravanserai's vocabulary rather than the refinery's mud-brown):
     ind_generator_house  an engine hall round a salvaged Ancient engine; a spinning flywheel and a
                          dynamo under an open arcade; a radiator bank, a day-tank, two exhaust stacks,
                          an insulator gantry where the town's lines leave
     trade_fuel_station   a parabolic-arched canopy over three Ancient hand-cranked pumps, an
                          attendant's kiosk under a blue dome, buried-tank caps and vents, a lamp-oil
                          drum cradle and a pole sign
   Both are culture 'geomancer'. Local frame: +z is the front. Moving parts register with LOCUS_ANIM
   ('flywheel', 76-locus-anim.js). Depends only on 64-locus-core.js helpers and the palette.      */
reseed(647001);
(function(){
  var PI=Math.PI, GROUP='Petroleum: generator house and fuel station';
  function coolLamp(F, lx,ly,lz, amp, rad){ var q=F.p(lx,lz); nlLampAdd(q[0], F.y+ly, q[1], amp, rad, true); F.ball(lx,ly,lz, 0.17, PAL.electricBlue, 'glowmat'); }
  function door(F, lx,lz){ var P=F.P(lx,0,lz); (F.doors||(F.doors=[])).push([P.x, F.y, P.z]); }

  /* =============================================================== 1. GENERATOR HOUSE */
  ASSET({ key:'ind_generator_house', name:"Geomancers' generator house", family:'trade', kit:'locus', group:GROUP, culture:'geomancer', types:['industry','infrastructure'],
    districts:['market'], wealth:[0.4,0.9], w:32, d:22, h:18, variants:1,
    build:function(F){
      var wh=WHITEC[0], wh2=WHITEC[1], inner=shade(wh,-0.22), Y=0.6, H=8.5, rust=RUSTC[4], dk=STEELDC[0], pipe=PIPEC[0];
      /* ---- the plinth and the front steps ---- */
      F.box(0, 0, 0.3, 31, Y, 20.4, 0, shade(wh2,-0.12), 'plaster'); F.box(0, Y-0.06, 0.3, 31.2, 0.1, 20.6, 0, PAL.paving[2], 'rock');
      for(var s=0;s<3;s++) F.box(-2, s*0.2, 10.9-s*0.4, 6.4, 0.2, 0.4+(2-s)*0.4, 0, shade(wh2,-0.06), 'plaster');
      /* ---- the engine hall: side and back walls, a flat roof, and a front wall pierced by one great parabolic arch ---- */
      F.box(-2, Y, -7.1, 20, H, 0.8, 0, wh, 'plaster');
      F.box(-11.6, Y, -1.9, 0.8, H, 11.2, 0, wh, 'plaster'); F.box(7.6, Y, -1.9, 0.8, H, 11.2, 0, wh, 'plaster');
      F.box(-2, Y+H-0.4, -1.5, 20, 0.4, 12, 0, wh2, 'plaster'); F.box(-2, Y+H-0.46, -1.5, 18.2, 0.06, 10.6, 0, inner, 'plaster');   /* the ceiling, a shade down */
      F.box(-2, Y, -1.6, 18.4, 0.05, 10.8, 0, CONCRETEC[1], 'concrete');                                                       /* the engine-room floor */
      F.archwall('plaster', -2, Y, 4.1, 0, 20, H, 0.8, 6.0, 6.4, wh, { pointed:2.4, colIn:inner, seg:16 });
      F.archband('mosaic', -2, Y, 4.53, 0, 6.0, 6.4, 0.5, 0.12, MOSBLUEC[0], { pointed:2.4 });
      F.archband('plaster', -2, Y, 4.58, 0, 6.9, 6.85, 0.22, 0.10, WHITEC[2], { pointed:2.4 });
      /* the blue leaves, swung in */
      [-1,1].forEach(function(sd){ F.box(-2+sd*2.7, Y, 3.2, 0.12, 5.0, 1.9, sd*0.9, BLUEDC[0], 'plank'); });
      /* the parapet, the mosaic band under it, pilaster-pinnacles at the corners, toron rows on the facade */
      F.box(-2, Y+H, 4.2, 20.4, 0.9, 0.5, 0, wh, 'plaster'); F.box(-2, Y+H, -7.2, 20.4, 0.9, 0.5, 0, wh, 'plaster');
      F.box(-11.8, Y+H, -1.5, 0.5, 0.88, 11.4, 0, wh, 'plaster'); F.box(7.8, Y+H, -1.5, 0.5, 0.88, 11.4, 0, wh, 'plaster');
      F.box(-2, Y+H-1.35, 4.53, 19.0, 0.7, 0.08, 0, MOSBLUEC[0], 'mosaic'); F.box(-2, Y+H-1.35, -7.53, 19.0, 0.7, 0.08, 0, MOSBLUEC[0], 'mosaic');
      F.box(-12.03, Y+H-1.35, -1.5, 0.08, 0.7, 10.8, 0, MOSBLUEC[0], 'mosaic');
      [[-12.2,4.6],[8.2,4.6],[-12.2,-7.6],[8.2,-7.6]].forEach(function(c){ F.fr5(c[0], Y, c[1], 1.5, H+1.9, 1.5, 0, wh, 'plaster'); F.cone(c[0], Y+H+1.85, c[1], 0.36, 1.3, 0, wh, 'plaster'); });
      for(var tx=-10.6; tx<=6.8; tx+=2.2){ if(Math.abs(tx+2) < 4.2) continue; F.toron(tx, Y+H-2.4, 4.5, 0,1, 0.7); F.toron(tx, Y+3.2, 4.5, 0,1, 0.7); }
      /* tall blue-glass windows either side of the arch (lit cool at night: the hall has its own current) */
      [-8.6, 4.6].forEach(function(wx){ F.window(wx, Y+4.2, 4.52, 0,1, 1.0, 3.2, { cool:true }); F.archband('plaster', wx, Y+5.8, 4.56, 0, 1.2, 0.9, 0.18, 0.08, WHITEC[2], { pointed:2 }); });
      [-9.4,-5.2,1.2,5.4].forEach(function(wz,i){ if(i<2) F.window(-12.02, Y+5.4, wz-2, -1,0, 0.9, 1.6, { cool:true }); else F.window(8.02, Y+6.4, wz-6, 1,0, 0.9, 1.3, { cool:true }); });
      /* the Geomancers' plaque over the arch */
      F.disc(-2, Y+H-1.0, 4.56, 0,1, 0.62, 0.06, BRASSC[1], 'metal'); F.disc(-2, Y+H-1.0, 4.6, 0,1, 0.52, 0.06, GEOBROWNC[0], 'plaster'); F.cone(-2, Y+H-1.3, 4.72, 0.16, 0.5, 0, BRASSC[0], 'metal');
      /* three ventilator domes on drums along the roof, and the two exhaust stacks behind */
      [-8,-2,4].forEach(function(vx){ F.cyl(vx, Y+H-0.1, -1.5, 1.5, 0.8, 0, wh2, 'plaster'); for(var k=0;k<6;k++){ var a=k/6*TAU; F.box(vx+Math.cos(a)*1.45, Y+H+0.12, -1.5+Math.sin(a)*1.45, 0.34, 0.45, 0.2, -a+PI/2, VOIDC[1], 'dark'); }
        F.edome(vx, Y+H+0.7, -1.5, 1.55, 1.25, 1.55, 0, MOSBLUEC[1], 'mosaic'); F.cone(vx, Y+H+1.9, -1.5, 0.12, 0.8, 0, BRASSC[0], 'metal'); });
      [-7.5,-3.5].forEach(function(sx){ F.cyl(sx, Y+H-0.2, -5.6, 0.95, 1.3, 0, wh, 'plaster'); F.cyl(sx, Y+H+0.75, -5.6, 1.0, 0.35, 0, MOSBLUEC[0], 'mosaic');
        F.cyl(sx, Y+H+1.1, -5.6, 0.5, 8.2, 0, rust, 'rust'); F.cyl(sx, Y+H+9.2, -5.6, 0.62, 0.4, 0, STEELDC[3], 'rust'); F.cyl(sx, Y+H+5.4, -5.6, 0.58, 0.3, 0, STEELDC[3], 'rust');
        [[sx-3.2,-7.0],[sx+2.4,-3.0]].forEach(function(g){ F.rod(sx, Y+H+7.0, -5.6, g[0], Y+H+0.1, g[1], 0.025, PAL.people.hair[2], 'timber'); }); });
      /* ---- inside: the Ancient engine on its bed, seen through the arch ---- */
      F.box(-2.5, Y, -2.2, 12.4, 0.55, 3.6, 0, CONCRETEC[2], 'concrete');
      F.box(-3.0, Y+0.55, -2.2, 9.2, 2.1, 2.3, 0, TARNC[0], 'metal'); F.box(-3.0, Y+1.2, -2.2, 9.3, 0.25, 2.4, 0, MOSBLUEC[3], 'mosaic');
      for(var c=0;c<6;c++){ var cx=-6.8+c*1.5; F.box(cx, Y+2.65, -2.2, 1.1, 0.75, 1.7, 0, TARNC[2], 'metal'); F.cyl(cx, Y+3.4, -2.2, 0.16, 0.35, 0, BRASSC[0], 'metal'); }
      F.cyl(2.6, Y+0.55, -2.2, 1.25, 2.4, 0, TARNC[1], 'metal');                                                                /* the gear case at the drive end */
      LOCUS.pipe(F, [[-6.8,Y+3.1,-3.3],[-6.8,Y+3.1,-4.4],[-7.5,Y+3.1,-4.4],[-7.5,Y+H-0.3,-4.4],[-7.5,Y+H-0.3,-5.6]], 0.2, pipe);    /* exhaust manifold to the stacks */
      LOCUS.pipe(F, [[-2.3,Y+3.1,-3.3],[-2.3,Y+3.1,-4.8],[-3.5,Y+3.1,-4.8],[-3.5,Y+H-0.3,-4.8],[-3.5,Y+H-0.3,-5.6]], 0.2, pipe);
      F.rod(3.8, Y+2.0, -2.2, 11.0, Y+2.0, -2.0, 0.16, STEELDC[2], 'rust');                                                  /* the shaft, through the east wall */
      coolLamp(F, -6, Y+H-1.2, -1.5, 1.2, 14); coolLamp(F, 2, Y+H-1.2, -1.5, 1.2, 14);
      /* electric bracket lamps either side of the arch */
      [-6.0, 2.0].forEach(function(lx){ F.rod(lx, Y+5.4, 4.5, lx, Y+5.4, 4.95, 0.04, BRASSC[0], 'metal'); coolLamp(F, lx, Y+5.25, 5.0, 1.1, 12); });
      /* ---- the dynamo annex on the +x side: an open parabolic arcade over the flywheel and the dynamo ---- */
      F.box(11.8, Y, -2, 7.4, 0.05, 10.4, 0, CONCRETEC[1], 'concrete');
      F.arcade('plaster', 15.3, Y, -2, PI/2, 3, 3.4, 5.6, 0.7, wh, { pier:1.0, head:1.1, colIn:inner });
      F.archwall('plaster', 11.8, Y, 3.15, 0, 7.4, 5.6, 0.7, 4.8, 4.4, wh, { pointed:2.2, colIn:inner, seg:12 });
      F.box(11.8, Y+5.6, -2, 7.8, 0.4, 10.6, 0, wh2, 'plaster'); F.box(15.66, Y+4.9, -2, 0.08, 0.6, 10.2, 0, MOSBLUEC[0], 'mosaic'); F.box(11.8, Y+4.9, 3.53, 7.2, 0.6, 0.08, 0, MOSBLUEC[0], 'mosaic');
      [[15.4,3.3],[15.4,-7.2]].forEach(function(c){ F.cone(c[0], Y+6.0, c[1], 0.3, 1.1, 0, wh, 'plaster'); });
      /* the flywheel (static rim + hub; the spokes turn) and the dynamo on its bed */
      (function(){ var FX=10.2, FY=Y+2.0, FZ=-2, R=1.75, pts=[]; for(var k=0;k<=28;k++){ var a=k/28*TAU; pts.push({ x:FX, y:FY+Math.sin(a)*R, z:FZ+Math.cos(a)*R, r:0.17 }); }
        F.tube('rust', pts, STEELDC[1], { seg:6 }); F.rod(FX-0.25, FY, FZ, FX+0.25, FY, FZ, 0.34, STEELDC[2], 'rust');
        F.box(FX, Y, FZ, 0.9, FY-Y-0.3, 0.8, 0, CONCRETEC[2], 'concrete');                                                    /* the bearing pedestal */
        F.box(FX, Y, FZ, 4.4, 0.06, 4.2, 0, VOIDC[1], 'dark');                                                                /* the wheel pit */
        LOCUS.anim(F, 'flywheel', { C:[FX, FY, FZ], R:R-0.1, n:6, speed:F.rr(2.6,3.4), phase:F.rr(0,TAU), col:STEELDC[2] }); })();
      F.box(13.3, Y, -2, 3.0, 1.0, 1.9, 0, CONCRETEC[2], 'concrete');
      F.rod(11.9, Y+2.0, -2, 14.7, Y+2.0, -2, 0.95, TARNC[1], 'metal');
      [12.3, 13.3, 14.3].forEach(function(bx){ F.rod(bx-0.12, Y+2.0, -2, bx+0.12, Y+2.0, -2, 1.0, BRASSC[1], 'metal'); });
      F.rod(14.7, Y+2.0, -2, 15.1, Y+2.0, -2, 0.35, STEELDC[2], 'rust');
      /* the switchboard: a slate panel with dials and knife switches; its cables climb to the roof */
      F.box(11.8, Y, -6.55, 5.0, 2.8, 0.25, 0, 0x2c3032, 'rock');
      [10.4, 11.8, 13.2].forEach(function(dx){ F.disc(dx, Y+2.1, -6.42, 0,1, 0.26, 0.05, 0xece6d4, 'metal'); F.disc(dx, Y+2.1, -6.40, 0,1, 0.30, 0.03, BRASSC[1], 'metal'); });
      for(var ks=0;ks<5;ks++) F.box(10.2+ks*0.8, Y+1.0, -6.38, 0.12, 0.5, 0.12, 0, BRASSC[0], 'metal');
      [10.6, 11.8, 13.0].forEach(function(cx2){ F.rod(cx2, Y+2.8, -6.55, cx2, Y+5.5, -6.55, 0.04, 0x1e1a18, 'timber'); });
      coolLamp(F, 11.8, Y+5.2, -2, 1.0, 12);
      /* ---- the radiator bank on the -x side: fins between header pipes on a whitewashed base ---- */
      F.box(-14, Y, -2, 3.2, 1.0, 8.4, 0, wh2, 'plaster'); F.box(-14, Y+0.9, -2, 3.3, 0.12, 8.5, 0, MOSBLUEC[0], 'mosaic');
      for(var fi=0;fi<16;fi++) F.box(-14, Y+1.05, -5.75+fi*0.5, 2.5, 4.2, 0.07, 0, fi%2?TARNC[1]:STEELDC[1], fi%2?'metal':'rust');
      LOCUS.pipe(F, [[-14,Y+5.35,-6.2],[-14,Y+5.35,2.2]], 0.2, pipe); LOCUS.pipe(F, [[-14,Y+1.2,-6.2],[-14,Y+1.2,2.2]], 0.2, pipe);
      LOCUS.pipe(F, [[-14,Y+5.35,2.2],[-12.0,Y+5.35,2.2]], 0.16, pipe); LOCUS.pipe(F, [[-14,Y+1.2,-6.2],[-12.0,Y+1.2,-6.2]], 0.16, pipe);
      /* ---- the day-tank on whitewashed piers behind the hall, piped in ---- */
      [-10.2,-6.8].forEach(function(px){ F.box(px, Y, -9.4, 0.8, 2.3, 1.6, 0, wh2, 'plaster'); });
      F.tube('rust', [{x:-11.2,y:Y+3.2,z:-9.4,r:1.0},{x:-5.8,y:Y+3.2,z:-9.4,r:1.0}], RUSTC[2], { seg:12, cap:true });
      F.ball(-11.2, Y+3.2, -9.4, 0.98, RUSTC[2], 'rust'); F.ball(-5.8, Y+3.2, -9.4, 0.98, RUSTC[2], 'rust');
      LOCUS.pipe(F, [[-5.8,Y+2.5,-9.4],[-4.6,Y+2.5,-9.4],[-4.6,Y+2.5,-7.6]], 0.1, PIPEC[2]); LOCUS.valve(F, -4.6, Y+2.5, -8.6, 0.09, RUSTC[1]);
      F.cyl(-8.5, Y+4.1, -9.4, 0.2, 0.6, 0, STEELDC[2], 'rust');
      /* ---- the insulator gantry and the first pole of the town line ---- */
      [3.2, 9.2].forEach(function(gx){ F.cyl(gx, Y, -9.4, 0.16, 6.6, 0, dk, 'rust'); });
      F.box(6.2, Y+6.3, -9.4, 6.8, 0.3, 0.3, 0, dk, 'rust');
      [4.4, 6.2, 8.0].forEach(function(ix){ for(var sh=0;sh<3;sh++) F.cyl(ix, Y+6.6+sh*0.22, -9.4, 0.24, 0.06, 0, 0xf2eee4, 'plaster'); F.cyl(ix, Y+6.6, -9.4, 0.1, 0.72, 0, 0xf2eee4, 'plaster');
        F.rod(ix, Y+7.3, -9.4, ix-0.6, Y+8.6, -10.7, 0.03, 0x1e1a18, 'timber'); });
      F.cyl(5.6, -0.25, -10.8, 0.16, Y+9.4, 0, TIMBERC[0], 'timber'); F.box(5.6, Y+8.6, -10.8, 3.0, 0.18, 0.18, 0, TIMBERC[1], 'timber');
      [4.4, 5.6, 6.8].forEach(function(ix){ F.cyl(ix, Y+8.78, -10.8, 0.08, 0.25, 0, 0xf2eee4, 'plaster'); });
      F.rod(11.8, Y+5.6, -6.6, 8.0, Y+7.3, -9.4, 0.035, 0x1e1a18, 'timber');                                                  /* switchboard to gantry */
      /* drums and a lamp-oil jar or two */
      for(var d=0;d<4;d++) LOCUS.drum(F, 12.4+d*0.7, Y, -9.4, RUSTC[d%5]); LOCUS.drum(F, -13.6, Y, 6.8, RUSTC[2]); LOCUS.drum(F, -12.9, Y, 7.4, RUSTC[0]);
      door(F, -2, 11.8); door(F, 11.8, 4.2);
    } });

  /* =============================================================== 2. FUEL STATION */
  ASSET({ key:'trade_fuel_station', name:'Fuel station', family:'trade', kit:'locus', group:GROUP, culture:'geomancer', types:['market/shop','infrastructure'],
    districts:['market'], wealth:[0.3,0.8], w:24, d:18, h:9, variants:1,
    build:function(F){
      var wh=WHITEC[0], wh2=WHITEC[1], inner=shade(wh,-0.18);
      /* ---- the forecourt and the pump island ---- */
      F.box(0, 0, 2.5, 23.6, 0.08, 13.0, 0, PAL.paving[1], 'rock');
      F.box(0, 0.08, 2.5, 10.4, 0.3, 1.7, 0, wh2, 'plaster'); F.box(0, 0.30, 2.5, 10.5, 0.1, 1.8, 0, MOSBLUEC[0], 'mosaic');
      /* three Ancient pumps: white-metal cabinets, a mosaic band, dials front and back, a blue-glass globe, a crank and a hose */
      [-3.4, 0, 3.4].forEach(function(px){ var y=0.4;
        F.box(px, y, 2.5, 0.8, 1.9, 0.55, 0, TARNC[0], 'metal'); F.box(px, y+0.8, 2.5, 0.83, 0.18, 0.58, 0, MOSBLUEC[0], 'mosaic');
        F.box(px, y+1.9, 2.5, 0.95, 0.18, 0.7, 0, TARNC[2], 'metal');
        [1,-1].forEach(function(sd){ F.disc(px, y+1.45, 2.5+sd*0.28, 0,sd, 0.24, 0.04, 0xf0ead8, 'metal'); F.disc(px, y+1.45, 2.5+sd*0.27, 0,sd, 0.28, 0.03, BRASSC[1], 'metal'); });
        F.cyl(px, y+2.08, 2.5, 0.12, 0.2, 0, BRASSC[0], 'metal'); F.ball(px, y+2.5, 2.5, 0.3, GLASSC[1], 'glass'); F.lamp(px, y+2.5, 2.5, 0.35, 5);
        F.rod(px+0.4, y+1.05, 2.5, px+0.72, y+1.05, 2.5, 0.035, STEELDC[2], 'rust'); F.rod(px+0.72, y+1.05, 2.5, px+0.72, y+1.4, 2.5, 0.035, STEELDC[2], 'rust');
        F.tube('rust', [{x:px-0.42,y:y+1.3,z:2.62,r:0.045},{x:px-0.62,y:y+0.35,z:3.0,r:0.045},{x:px-0.46,y:y+1.0,z:2.84,r:0.045}], 0x1e1c1a, { seg:5 });
        F.box(px-0.46, y+0.95, 2.84, 0.1, 0.28, 0.12, 0, BRASSC[0], 'metal'); });
      /* ---- the canopy: two parabolic arch frames carrying a whitewashed slab with a mosaic fascia and pinnacles ---- */
      F.archwall('plaster', 0, 0, 6.6, 0, 17.0, 5.2, 0.7, 14.0, 4.5, wh, { pointed:2.2, colIn:inner, seg:18 });
      F.archwall('plaster', 0, 0, -1.6, 0, 17.0, 5.2, 0.7, 14.0, 4.5, wh, { pointed:2.2, colIn:inner, seg:18 });
      F.archband('mosaic', 0, 0, 6.97, 0, 14.0, 4.5, 0.4, 0.1, MOSBLUEC[0], { pointed:2.2 });
      F.box(0, 5.2, 2.5, 17.4, 0.5, 9.6, 0, wh2, 'plaster'); F.box(0, 5.16, 2.5, 16.4, 0.05, 8.6, 0, inner, 'plaster');
      F.box(0, 5.26, 7.32, 17.5, 0.36, 0.06, 0, MOSBLUEC[0], 'mosaic'); F.box(0, 5.26, -2.32, 17.5, 0.36, 0.06, 0, MOSBLUEC[0], 'mosaic');
      F.box(8.72, 5.26, 2.5, 0.06, 0.36, 9.7, 0, MOSBLUEC[0], 'mosaic'); F.box(-8.72, 5.26, 2.5, 0.06, 0.36, 9.7, 0, MOSBLUEC[0], 'mosaic');
      [[-8.3,-1.9],[8.3,-1.9],[-8.3,6.9],[8.3,6.9]].forEach(function(c){ F.cone(c[0], 5.7, c[1], 0.34, 1.3, 0, wh, 'plaster'); });
      F.fr5(0, 5.7, 7.0, 1.6, 1.3, 0.5, 0, wh, 'plaster'); F.disc(0, 6.2, 7.26, 0,1, 0.42, 0.06, GEOBROWNC[0], 'plaster'); F.disc(0, 6.2, 7.3, 0,1, 0.18, 0.04, BRASSC[1], 'metal');
      [-7.6,-6.0,6.0,7.6].forEach(function(tx){ F.toron(tx, 4.2, 6.95, 0,1, 0.6); F.toron(tx, 4.2, -1.95, 0,-1, 0.6); });
      [-4.0, 4.0].forEach(function(lx){ F.lantern(lx, 4.9, 2.5, 0.9, 12, 0.3); });
      /* ---- the attendant's kiosk under a blue dome ---- */
      var KX=-5.5, KZ=-5.8;
      F.box(KX, 0, KZ, 6, 3.6, 5, 0, wh2, 'plaster'); F.box(KX, 2.95, KZ, 6.06, 0.4, 5.06, 0, MOSBLUEC[0], 'mosaic');
      F.box(KX, 3.6, KZ, 6.3, 0.25, 5.3, 0, wh, 'plaster');
      F.cyl(KX, 3.8, KZ, 1.75, 0.55, 0, wh, 'plaster'); F.edome(KX, 4.3, KZ, 1.85, 1.7, 1.85, 0, MOSBLUEC[1], 'mosaic'); F.cone(KX, 5.9, KZ, 0.14, 0.9, 0, BRASSC[0], 'metal');
      [[-8.4,-3.4],[-2.6,-3.4],[-8.4,-8.2],[-2.6,-8.2]].forEach(function(c){ F.cone(c[0], 3.85, c[1], 0.22, 0.8, 0, wh, 'plaster'); });
      F.door(-7.3, -3.3, 0,1, 1.0, 2.2, BLUEDC[0]);
      F.window(-4.4, 1.85, -3.28, 0,1, 1.9, 1.1); F.box(-4.4, 1.2, -3.1, 2.1, 0.1, 0.45, 0, PLANKC[1], 'plank'); F.box(-4.4, 2.5, -2.85, 2.2, 0.06, 0.9, 0, PLANKC[2], 'plank');
      F.window(-8.52, 2.0, -5.8, -1,0, 0.8, 0.8);
      F.box(-6.9, 0.42, -2.75, 1.7, 0.08, 0.45, 0, PLANKC[0], 'plank'); [-7.6,-6.2].forEach(function(bx){ F.box(bx, 0, -2.75, 0.12, 0.42, 0.4, 0, TIMBERC[1], 'timber'); });
      F.lamp(-4.4, 2.2, -2.6, 0.8, 8);
      /* the price board beside the kiosk */
      [-2.1,-0.9].forEach(function(lx){ F.cyl(lx, 0, -3.8, 0.05, 1.7, 0, TIMBERC[1], 'timber'); });
      F.box(-1.5, 0.75, -3.8, 1.5, 1.05, 0.06, 0, GEOBROWNC[1], 'plaster'); for(var ln=0;ln<4;ln++) F.box(-1.5, 0.9+ln*0.22, -3.76, 1.1, 0.06, 0.02, 0, 0xe8e0c8, 'plaster');
      /* ---- the buried tanks (fill caps, two vents) and the lamp-oil drum cradle ---- */
      [3.2, 4.6, 6.0].forEach(function(cx){ F.cyl(cx, 0.08, -4.6, 0.34, 0.12, 0, STEELDC[1], 'rust'); F.cyl(cx, 0.2, -4.6, 0.12, 0.1, 0, BRASSC[0], 'metal'); });
      [9.6, 10.4].forEach(function(vx){ F.cyl(vx, 0, -7.8, 0.09, 5.6, 0, STEELDC[0], 'rust'); F.cone(vx, 5.6, -7.8, 0.2, 0.3, 0, STEELDC[2], 'rust'); });
      [-7.3, -6.1].forEach(function(cz){ F.box(5.6, 0, cz, 3.4, 0.45, 0.25, 0, TIMBERC[0], 'timber'); });
      for(var dr=0;dr<3;dr++){ LOCUS.drum(F, 4.6+dr*1.0, 0.42, -6.3, RUSTC[(dr+2)%5], true, 0); F.box(4.6+dr*1.0, 0.6, -5.75, 0.12, 0.14, 0.2, 0, BRASSC[0], 'metal'); }
      [[8.0,-5.8],[8.6,-6.4],[7.8,-6.8]].forEach(function(j,i){ F.ball(j[0], 0.32, j[1], 0.32+i*0.03, TILEC[i%TILEC.length], 'adobe'); F.cyl(j[0], 0.58+i*0.03, j[1], 0.12, 0.14, 0, TILEC[(i+1)%TILEC.length], 'adobe'); });
      /* ---- the pole sign at the kerb: a brown disc with a brass rim and a brass flame ---- */
      F.cyl(10.6, 0, 8.2, 0.12, 6.2, 0, STEELDC[0], 'rust');
      [1,-1].forEach(function(sd){ F.disc(10.6, 5.6, 8.2, 0,sd, 0.95, 0.08, BRASSC[1], 'metal'); F.disc(10.6, 5.6, 8.2+sd*0.02, 0,sd, 0.85, 0.08, GEOBROWNC[0], 'plaster');
        F.cone(10.6, 5.25, 8.2+sd*0.1, 0.22, 0.65, 0, BRASSC[0], 'metal'); });
      F.lantern(10.6, 6.6, 8.2, 0.8, 10, 0);
      /* kerb stones along the two sides of the forecourt */
      [-11.6, 11.6].forEach(function(kx){ F.box(kx, 0, 2.5, 0.4, 0.25, 12.6, 0, wh2, 'plaster'); });
      door(F, 0, 9.4); door(F, -7.3, -2.6);
    } });
})();
