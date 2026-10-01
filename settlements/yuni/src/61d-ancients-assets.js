/* ------------------------------------------------------------------ ASSETS (hand-written; tools/anc_assets.js) */
/* INHABITATION DRESSING, in the engine's own kit: lean-tos, mud-brick infill, balconies, ladders, awnings, lanterns.
   walls = [[lx,ly,lz,nx,nz]...] samples of near-vertical ancient fabric (F-local metres). */
function ancDress(F, walls, W, D, light){
  if(!walls.length) return;
  /* keep the OUTER shell only: per angular sector, the samples near the largest radius */
  var NS=16, rmax=[]; walls.forEach(function(s){ var k=(Math.floor((Math.atan2(s[4],s[3])+Math.PI)/(2*Math.PI)*NS)%NS+NS)%NS, band=s[1]<3.5?0:(s[1]<9?1:2);
    s.k=k=k*3+band; s.r=s[0]*s[3]+s[2]*s[4];                                     /* how far out this face sits along its OWN normal */
    if(!(rmax[k]>s.r)) rmax[k]=s.r; });
  var outer=walls.filter(function(s){ return s.r >= rmax[s.k]-Math.max(1.5, 0.10*Math.abs(rmax[s.k])); });
  function inside(x,z,m){ return Math.abs(x)<W/2-m && Math.abs(z)<D/2-m; }
  function spaced(list, min, n, test){ var out=[]; for(var i=0;i<list.length && out.length<n;i++){ var s=list[i]; if(test && !test(s)) continue; var ok=true; for(var j=0;j<out.length;j++) if(Math.hypot(out[j][0]-s[0],out[j][2]-s[2])<min){ ok=false; break; } if(ok) out.push(s); } return out; }
  var per=2*(W+D), nLean=Math.max(3,Math.min(10,Math.round(per/(light?55:30)))), used=[];
  /* A. lean-tos against the base */
  var cand=spaced(outer, 7, nLean, function(s){ return s[1]<3.4; });
  if(cand.length<nLean) cand=cand.concat(spaced(outer, 7, nLean-cand.length, function(s){ return s[1]>=3.4 && s[1]<7 && cand.indexOf(s)<0; }));
  cand.forEach(function(s,i){
    var nx=s[3], nz=s[4], tx=nz, tz=-nx, yaw=Math.atan2(nx,nz), w=F.rr(4.2,6.5), h=F.rr(2.6,3.3), dd=F.rr(2.5,3.1);
    var cx=s[0]+nx*(dd/2-0.6), cz=s[2]+nz*(dd/2-0.6), fx=s[0]+nx*(dd-0.6), fz=s[2]+nz*(dd-0.6);
    if(!inside(fx+tx*w/2,fz+tz*w/2,0.15) || !inside(fx-tx*w/2,fz-tz*w/2,0.15)) return;
    var white=F.chance(0.6), col=white?F.pick(WHITEC):F.pick(ADOBEC), fam=white?'plaster':'adobe'; used.push(s);
    F.box(cx,0,cz, w,h,dd, yaw, col, fam); F.box(cx,h,cz, w+0.25,0.32,dd+0.25, yaw, shade(col,-0.10), fam);
    if(white) F.box(cx,0,cz, w+0.1,0.7,dd+0.1, yaw, PAL.paintBlack[1], 'plaster');
    /* THE JOIN TO THE HOST. Mud fillets packed into the angle at both sides, a mud roll sealing the
       roof to the Ancient wall, a render patch where the wall was made good above it, and a
       footing course round the three free sides, so the lean-to reads as built ONTO the old fabric. */
    var jc=shade(col,-0.07), mud=F.pick(ADOBEC);
    for(var e0=-1;e0<=1;e0+=2){ F.box(s[0]+tx*e0*(w/2+0.12)+nx*0.12, 0, s[2]+tz*e0*(w/2+0.12)+nz*0.12, 0.34, h+0.18, 0.62, yaw, jc, fam);
      F.box(s[0]+tx*e0*(w/2+0.12)+nx*0.5, 0, s[2]+tz*e0*(w/2+0.12)+nz*0.5, 0.24, h*0.55, 0.3, yaw, shade(jc,-0.05), fam); }
    F.beam(s[0]+nx*0.05, h+0.32, s[2]+nz*0.05, s[0]+nx*0.42, h+0.30, s[2]+nz*0.42, w+0.6, 0.26, shade(mud,-0.08), 'adobe');
    F.box(s[0]+nx*0.03+tx*F.rr(-0.6,0.6), h+0.55, s[2]+nz*0.03+tz*F.rr(-0.6,0.6), w*F.rr(0.45,0.7), F.rr(0.7,1.3), 0.08, yaw, mud, 'adobe');
    [[0, dd-0.6+0.08, w+0.16, 0.16],[-1, 0, 0.16, dd],[1, 0, 0.16, dd]].forEach(function(q){
      var ox = q[0] ? q[0]*(w/2+0.02) : 0, oz = q[0] ? (dd/2-0.6) : q[1];
      F.box(s[0]+tx*ox+nx*oz, 0, s[2]+tz*ox+nz*oz, q[2], 0.32, q[3], yaw, F.pick(ROCKC), 'rock'); });
    F.box(fx+nx*0.03, h-0.9, fz+nz*0.03, 0.12, 0.9, 0.06, yaw, shade(col,-0.25), fam);       /* the drip stain under the spout */
    if(i%3===1){ /* an upper room, set back against the ancient wall, with its own lit window and a laundry line */
      var uw=w*0.6, ux=cx-tx*w*0.18-nx*0.3, uz=cz-tz*w*0.18-nz*0.3, uc=white?F.pick(BLUELC):F.pick(ADOBEREDC);
      F.box(ux,h+0.3,uz, uw,2.5,dd-0.5, yaw, uc, fam); F.box(ux,h+2.8,uz, uw+0.2,0.28,dd-0.3, yaw, shade(uc,-0.1), fam);
      F.window(ux+nx*(dd/2-0.25), h+1.7, uz+nz*(dd/2-0.25), nx,nz, 0.7,0.8);
      F.rod(ux+tx*uw/2,h+2.4,uz+tz*uw/2, cx+tx*w/2,h+1.6,cz+tz*w/2, 0.03, TIMBERC[0], 'timber');
      F.box(cx+tx*w*0.36,h+0.95,cz+tz*w*0.36, 0.04,0.9,1.2, yaw, F.pick(CLOTHC), 'cloth'); }
    var sgn=i%2?1:-1, dx=fx+tx*sgn*w*0.22, dz=fz+tz*sgn*w*0.22;
    F.door(dx,dz, nx,nz, 1.0,2.0, PLANKC[i%4]); F.window(fx-tx*sgn*w*0.24, 1.75, fz-tz*sgn*w*0.24, nx,nz, 0.7,0.8);
    F.box(dx+nx*0.75, 2.25, dz+nz*0.75, 2.2,0.06,1.5, [0.28,yaw,0], F.pick(AWNINGC), 'cloth');
    F.lantern(dx+tx*0.9+nx*0.35, 2.35, dz+tz*0.9+nz*0.35, 0.8, 12, 0);
    for(var t=0;t<4;t++) F.toron(fx+tx*(t-1.5)*w*0.2, h-0.45, fz+tz*(t-1.5)*w*0.2, nx,nz, 0.8);
    if(i%2===0){ /* a ladder to the lean-to's roof terrace */
      var lx=fx-tx*sgn*w*0.42, lz=fz-tz*sgn*w*0.42;
      for(var e=-1;e<=1;e+=2) F.rod(lx+tx*e*0.25+nx*1.0,0,lz+tz*e*0.25+nz*1.0, lx+tx*e*0.25+nx*0.08,h+0.9,lz+tz*e*0.25+nz*0.08, 0.05, TIMBERC[0], 'timber');
      for(var r=1;r<=5;r++){ var q=r/6.2, ox=nx*(1.0-0.92*q), oz=nz*(1.0-0.92*q); F.rod(lx-tx*0.3+ox,(h+0.9)*q,lz-tz*0.3+oz, lx+tx*0.3+ox,(h+0.9)*q,lz+tz*0.3+oz, 0.035, TIMBERC[1], 'timber'); }
      F.box(cx+tx*0.8,h+0.32,cz+tz*0.8, 0.7,0.6,0.7, yaw, PAL.adobeDark?PAL.adobeDark[0]:ADOBEC[0], 'adobe'); } });
  /* B. mud-brick infill in the broken openings, each with a small lit window */
  if(!light) spaced(outer, 5, Math.round(nLean*2.2), function(s){ return s[1]>1.6 && s[1]<9 && used.indexOf(s)<0; }).forEach(function(s){
    var nx=s[3], nz=s[4], yaw=Math.atan2(nx,nz), w=F.rr(2.6,3.8), h=F.rr(2.4,3.2); used.push(s);
    F.box(s[0]-nx*0.15, s[1]-h/2, s[2]-nz*0.15, w,h,0.8, yaw, F.pick(ADOBEC), 'adobe');
    F.window(s[0]+nx*0.27, s[1]+0.2, s[2]+nz*0.27, nx,nz, 0.7,0.85); });
  /* C. timber balconies with laundry */
  if(!light) spaced(outer, 7, Math.round(nLean*1.4), function(s){ return s[1]>4.5 && s[1]<14 && used.indexOf(s)<0 && inside(s[0]+s[3]*2,s[2]+s[4]*2,0.4); }).forEach(function(s,i){
    var nx=s[3], nz=s[4], tx=nz, tz=-nx, yaw=Math.atan2(nx,nz), w=F.rr(2.6,3.6), y=s[1]-1.0, bx=s[0]+nx*0.7, bz=s[2]+nz*0.7;
    F.box(s[0]-nx*0.1, y+0.15, s[2]-nz*0.1, 1.1,2.0,0.5, yaw, VOIDC[0], 'dark');
    F.box(bx,y,bz, w,0.16,1.5, yaw, PLANKC[i%4], 'plank');
    F.box(bx+nx*0.72,y+0.16,bz+nz*0.72, w,0.85,0.07, yaw, TIMBERC[i%3], 'timber');
    for(var e=-1;e<=1;e+=2) F.beam(bx+tx*e*w*0.42+nx*0.6,y,bz+tz*e*w*0.42+nz*0.6, s[0]+tx*e*w*0.42-nx*0.1,y-1.3,s[2]+tz*e*w*0.42-nz*0.1, 0.12,0.12, TIMBERC[0], 'timber');
    F.box(bx+nx*0.80,y-0.05,bz+nz*0.80, w*0.7,0.95,0.04, yaw, F.pick(CLOTHC), 'cloth');
    if(i%2===0) F.lantern(bx+tx*w*0.4, y+1.9, bz+tz*w*0.4, 0.7, 10, 0.4); });
}

var ANC_TABLE = [
  /* key, name, kit type, scale s, kit-unit centre cx,cz, footprint w,d,h (metres, measured after scaling).
     v = variant list; the default is the full set worn / patched & inhabited / ruin. */
  { key:'ancient_lab',        name:'Ancient laboratory, "the Reliquary"',        type:'lab',  s:0.45, cx:38.5, cz:-6,  w:76,  d:46,  h:56, segk:0.4, thin:2 },
  { key:'ancient_lab_compact', name:'Ancient laboratory, "the Reliquary" (compact)', type:'lab', s:0.45, cx:0, cz:0, w:40, d:40, h:56, segk:0.4, thin:2, tight:true, v:['worn'], vn:['worn, compact'] },
  { key:'ancient_factory',    name:'Ancient factory hall, "the Foundry"',        type:'fac',  s:0.36, cx:-8,   cz:0,   w:146, d:92,  h:58, segk:0.38, thin:3, thinNames:['ovalD','ringR'] },
  { key:'ancient_silo',       name:'Ancient clover silo',                        type:'fac',  s:0.6,  cx:72,   cz:0,   w:28,  d:28,  h:39, segk:0.35, thin:2 },
  { key:'ancient_great_silo', name:'Ancient great silo (mushroom tank)',         type:'gsilo',s:0.45, cx:110,  cz:-60, yoff:-6, w:50, d:50, h:70, segk:0.4 },
  { key:'ancient_fuel',       name:'Ancient fuel station, "the Well"',           type:'fuel', s:0.55, cx:-4,   cz:-7,  w:56,  d:54,  h:13 },
  { key:'ancient_datacenter', name:'Ancient data vault (windowless cyclopean)',  type:'dc',   s:0.36, cx:0,    cz:0,   w:141, d:141, h:42, segk:0.4 },
  { key:'ancient_robotics',   name:'Ancient robotics works, "the Assembler"',    type:'robo', s:0.40, cx:-18.5,cz:-26, w:132, d:62,  h:39, segk:0.4 },
  { key:'ancient_radar',      name:'Ancient radar tower, "the Listener"',        type:'radar',s:0.70, cx:-12,  cz:15,  w:36,  d:38,  h:69 },
  { key:'ancient_dish',       name:'Ancient dish, "the Ear"',                    type:'dish', s:0.45, cx:18,   cz:26,  w:64,  d:58,  h:40, v:['worn','dishok','patched','ruin'] },
  /* the towers: scale 0.34-0.37, so a tower and its plinth fit a 100 m plot inside the walled city */
  { key:'ancient_tower_cono', name:'Ancient tower, "the Conocylinder"',          type:'skyA', s:0.34, cx:0, cz:0, w:100, d:100, h:165, segk:0.3, thin:3, uvk:0.42 , plants:0.6 },
  { key:'ancient_tower_scallop', name:'Ancient tower, "the Scallop Stack"',      type:'skyB', s:0.36, cx:0, cz:0, w:100, d:100, h:124,  segk:0.25, thinNames:['winSmD','winSmI','cell'], thin:4, uvk:0.42 , plants:0.6 },
  { key:'ancient_tower_monolith', name:'Ancient tower, "the Monolith"',          type:'skyD', s:0.36, cx:0, cz:0, w:100, d:100, h:127,  segk:0.3, thin:3, uvk:0.42 , plants:0.6 },
  { key:'ancient_tower_warden', name:'Ancient tower, "the Warden"',              type:'skyH', s:0.37, cx:0, cz:0, w:100, d:100, h:138,  segk:0.3, thin:3, uvk:0.42 , plants:0.6 },
  { key:'ancient_tower_fallen', name:'Ancient tower, toppled ("the Sail", fallen east)', type:'skyE', s:0.36, cx:68, cz:-4, w:180, d:104, h:34, segk:0.3, thin:3, uvk:0.42, v:['ruin2'] },
  { key:'ancient_apartments_terrace', name:'Ancient apartments, terrace stack',  type:'apt',  s:0.60, cx:1.5,  cz:3,   w:48,  d:45,  h:35, segk:0.35, thin:2 },
  { key:'ancient_apartments_comb',    name:'Ancient apartments, honeycomb wall', type:'apt',  s:0.60, cx:150,  cz:9,   w:74,  d:26,  h:38, segk:0.35, thin:2 },
  { key:'ancient_apartments_comb_short', name:'Ancient apartments, honeycomb block', type:'combShort', s:1.0, cx:0, cz:0, w:64, d:54, h:21, segk:0.8, thin:2 },
  { key:'ancient_apartments_cobs',    name:'Ancient apartments, corn-cob cluster', type:'apt',s:0.60, cx:342.5,cz:-6,  w:48,  d:42,  h:31, segk:0.35, thin:2 },
  { key:'ancient_quad',       name:'Ancient academic quadrangle, "the Cloisters"', type:'quad', s:1.0, cx:0, cz:0, w:124, d:104, h:38, segk:0.5, court:[-38,38,-28,26,9] },
  { key:'ancient_hospital',   name:'Ancient hospital, "the Cloister"',           type:'hosp', s:0.45, cx:0,    cz:5.3,   w:68,  d:54,  h:31, segk:0.4, thin:2 },
  { key:'ancient_library',    name:'Ancient library, "the Crown"',               type:'lib',  s:0.50, cx:26.5, cz:0,   w:74,  d:47,  h:33, segk:0.4 },
  { key:'ancient_starport_ruin', name:'Ruined starport, "the Starfish"',         type:'port', s:0.50, cx:1,    cz:18,  w:248, d:236, h:37, segk:0.4, thin:2, v:['ruin'], districts:['summit'] },
];
/* the three decay states. worn = the intact fabric, whole, only weathered; patched = the ruin, re-roofed and lived in;
   ruin = the kit's ruin. 'ruin2' is the toppled builder. */
var ANC_MODE = {
  worn:   { bd:0, holes:0,    repair:false, weather:true,  worn:true, tintMat:'white', tint:[0.90,0.87,0.81], dress:'light', vn:'worn but whole' },
  patched:{ bd:1, holes:0.55, repair:true,  weather:false, tintMat:'rust',  tint:[1.22,1.20,1.16], dress:'full',  vn:'patched & inhabited' },
  ruin:   { bd:1, holes:1,    repair:false, weather:false, tintMat:'rust',  tint:null,             dress:null,    vn:'ruin' },
  dishok: { bd:1, holes:0.45, repair:true,  weather:false, dishWhole:true, tintMat:'rust', tint:[1.22,1.20,1.16], dress:'full', vn:'reclaimed, dish intact' },
  ruin2:  { bd:2, holes:1,    repair:false, weather:false, tintMat:'rust',  tint:null,             dress:null,    vn:'ruin' }
};
ANC_TABLE.forEach(function(T){
  var V=(T.v||['worn','patched','ruin']).map(function(k){ return ANC_MODE[k]; });
  ASSET({ key:T.key, name:T.name, family:'ancient', districts:T.districts||['core'], wealth:[0.2,0.9], w:T.w, d:T.d, h:T.h, variants:V.length,
    variantNames:T.vn || V.map(function(M){ return M.vn; }),
    build:function(F){ var M=V[F.variant%V.length];
      var r=ANC_build(T.type, F, 0, T.s, { key:T.key+'/'+F.variant, bd:M.bd, holes:M.holes, repair:M.repair, weather:M.weather,
        fw:T.w, fd:T.d, cx:T.cx, cz:T.cz, yoff:T.yoff, yaw0:T.yaw0, segk:T.segk, thin:T.thin, thinNames:T.thinNames, uvk:T.uvk, tight:T.tight,
        tint:M.tint, tintMat:M.tintMat, worn:M.worn, dishWhole:M.dishWhole, plants:(M.worn?(T.plants||0):1), walls:M.dress?(M.dress==='light'?700:1400):0 });
      if(r && M.dress) ancDress(F, r.walls, T.w, T.d, M.dress==='light');
      if(T.court){ var C=T.court;                 /* a planted court: UFM's forested campus, in the engine's own flora */
        for(var t2=0;t2<C[4];t2++){ var tx=F.rr(C[0],C[1]), tz=F.rr(C[2],C[3]);
          F.tree(tx,tz, F.pick(['cypress','olive','pine','palm']), F.rr(7,13), 0.3); }
        for(var b2=0;b2<4;b2++) F.box(F.rr(C[0],C[1]), 0.3, F.rr(C[2],C[3]), F.rr(2,4),0.45,F.rr(1.2,2), F.rr(0,3), PAL.lane?PAL.lane[1]:ROCKC[0], 'rock'); } } });
});
window.ANC_measure=function(list){ var o={}; list.forEach(function(L){ var r=ANC_build(L.type,null,L.d,L.s||1,L); if(r&&isFinite(r.box.min.x)) o[(L.key||L.type)+'/'+L.d]=[r.box.min.x,r.box.max.x,r.box.min.z,r.box.max.z,r.box.max.y].map(Math.round).concat([Math.round(r.tris), JSON.stringify(r.byName).replace(/"/g,'')]); }); return o; };
})();
