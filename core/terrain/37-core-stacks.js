// ================================================================= CORE — stacks (rock standing on a heightfield: mesas, buttes, spires, fins)  [G data]
// Bedded rock bodies for any heightfield world: the necanyons' benches, caps and stacks (biomes/necanyons), Pinnacle Rock's
// mesa and its North Fins and Garden (settlements/pinnacle-rock/PLAN.md section 2), and any desert's hoodoo country. Grown
// from nwbay's karst stacks (biomes/nwbay/src/45-host-stage.js: one footprint function and one top function make the field,
// the height and the mesh agree, so a plant's foot is on the drawn rock), generalised to BEDS: a body is a pile of beds,
// each an irregular disc with its own centre, radii, strike, a notch at its foot (the soft parting weathers back) and a
// chamfer at its top edge. A bed narrower than the one below leaves a LEDGE; a cap wider than its neck is a balanced rock.
//
// No THREE, no DOM: plain maths, node-tested (test-stacks.js). Every draw is integer-hashed from core/rand (KRAND), by the
// body's seed and its bed's index, never by how many draws came before it. Axes: y up, metres, x east, z south.
//
//   KSTACKS.make({id, kind:'mesa'|'butte'|'spire'|'fin'|'balanced', x, z, y0 (the ground at the foot), seed, ...})
//        mesa/butte: tiers:[{h (the tier's rise), r (radius), e (elongation, 1 round), ry (strike, radians), dx, dz (the
//                    tier's centre from the body's)}], bed:[lo,hi] (bed thickness, m), lobes (.16: how ragged the outline)
//                    weather (.6; 0 clean-cut walls): flutes down the cliff, gullies notching the rim, each bed a metre or two
//                    in or proud; shoulder {h, back, bed} (the top tier: thin beds stepping back, a 30-45 degree slope of ledges)
//        spire/balanced/fin: H (height), r (radius at the foot), e (fin: 3..6), ry (strike), lean (radians), taper (.45),
//                    crown (the top bed's radius at its crest over its foot's: .8, a balanced cap .9; .5 a point, 1 a flat head)
//                    plates:[lo,hi] (RORAIMA'S KIND: the stack is a pile of thin beds lo..hi m thick, each plate its own
//                    width (jitter .25 of the radius), its parting weathered deep and its top rounded, knobbier outlines,
//                    no run-on taper between plates, a top-heavy crown; the record carries plates:true)
//        -> a record {id, kind, x, z, y0, seed, beds:[{k, y, h, cx, cz, rx, rz, ry, ch (chamfer), nt (notch), lob, ns, tier,
//           tp, tx, tz (a stack's taper and lean up the bed, run on into the next: one column, not a pile of drums),
//           wr, wn, gu (a mesa's weathering: the bed's own retreat in metres and its noise seed, its tier's gullies)}],
//           top, R (bounding radius about x,z)}
//   KSTACKS.footR(b, ang)      the bed's footprint radius at an angle about its own centre (the one footprint function)
//   KSTACKS.topH(b, x, z)      the bed's top surface at x,z (flat, a little rough: the one top function)
//   KSTACKS.at(list, x, z)     {S, b, top, d} the highest bed top over (x,z) (d its signed distance to that top's edge,
//                              negative inside), or null; KSTACKS.topAt(list,x,z) the height alone (-Infinity off the rock)
//   KSTACKS.foot(list, x, z)   {S, d} the nearest body's foot: d the signed distance to its lowest bed's footprint
//   KSTACKS.ledge(list, x, z)  {S, b, w} when (x,z) is on a ledge (a bed's top out from under the bed above), else null
//   KSTACKS.ring(S, y, n)      the outline at height y: n [x,z] points (the roost placer fits a deck to it), or null
//   KSTACKS.mesh(S, opt)       {pos, uv, idx, part, bed, occ}: walls, tops and an overhang's underside; CCW from outside.
//                              part 0 wall, 1 top, 2 underside; occ 0..1 (the notch and the underside dark); uv in metres
//                              (walls: arc length and y; tops: x and z). opt.step (5 m: the wall's segment length);
//                              opt.topRings (5: rings in from a top's edge) and opt.segMax (160: the most segments round
//                              a bed) for a top that carries relief of its own through a wrapped topH (finer than 5 rings)
//   KSTACKS.row({id, seed, a:[x,z], b:[x,z], n, kind:'fin', H:[lo,hi], r:[lo,hi], e:[lo,hi], ground})   fins along a
//                              strike: one line, one lean
//   KSTACKS.cluster({id, seed, c:[x,z], rad, n, kinds:{spire,balanced,fin}, H, r, gap, ground, accept})   a garden of stacks
//        VARIETY (both layouts, each optional; a layout without them draws exactly as before, so a page that does not ask
//        for them does not move): taper:[lo,hi], lean:[lo,hi] (radians), e:[lo,hi] (a spire's elongation; a row's fins
//        had e already), crown:[lo,hi], each drawn per stack from a stream of its own (hash(seed, i, 406)); plates:[lo,hi]
//        with platesShare (.5): that share of the stacks are piles of plates (Roraima's kind); lift:(x,z,r)=>m
//        adds metres to a stack's height (a stack on a slope: its foot is set under the lowest ground round it, so the
//        uphill side buries that much of it; lift by the drop and the stack stands as tall above the uphill ground)
//   KSTACKS.export(list) / KSTACKS.load(json)   {format:'krator-stacks', version:1, bodies}
//   KSTACKS.hash(mesh)         a fingerprint of a mesh's arrays (determinism)
(function(root){
  'use strict';
  var KR=root.KRAND;
  if(!KR) throw new Error('37-core-stacks: load core/rand/08-core-rand.js first');
  var TAU=Math.PI*2;
  function clamp(v,a,b){return v<a?a:v>b?b:v;}
  function sm(a,b,v){var t=clamp((v-a)/(b-a),0,1);return t*t*(3-2*t);}
  function S(seed){return KR.stream(seed>>>0);}

  // ---------------------------------------------------------------- the one footprint function
  // an ellipse (rx along the strike ry, rz across), its radius moved by two octaves of noise round the angle: coarse lobes
  // (the mesa's alcoves and points) and a fine fret. A bed's own noise seed ns; beds of one tier share it and both octaves (the
// wall is one wall; the beds show by their partings)
  function footR(b,ang){var a=ang-b.ry,c=Math.cos(a)/b.rx,s=Math.sin(a)/b.rz,R=1/Math.sqrt(c*c+s*s);
    var ca=Math.cos(ang),sa=Math.sin(ang);
    var n=KR.fbm(ca*1.6+40,sa*1.6+40,b.tier*3.1,2,b.ns)-.5,f=KR.fbm(ca*5.5+80,sa*5.5+80,b.tier*.73,1,b.ns+7)-.5;   // the fret shared by a tier's beds too: one face, not a pile of bulges
    R=R*(1+b.lob*2*n+b.lob*.35*f);
    // WEATHERING (a mesa's or a butte's beds): each bed weathers back by its own metres (wr: its own noise, so the edge is
    // ragged and stepped, not one clean cut: a soft bed retreats under a harder one), and the tier's gullies (gu: [angle,
    // half-width (rad), depth (m)]) notch it, deepest at the rim, dying out down the cliff
    // FLUTES (fl, shared by the tier's beds: one face): vertical grooves and buttresses down the cliff, ~22 m apart, cut
    // where the joints run (a Monument Valley wall's)
    if(b.wr||b.gu||b.fl){var rec=b.wr?b.wr*(.5+2.2*(KR.fbm(ca*5+11,sa*5+11,b.k*.9,1,b.wn)-.5)):0;   // -.6..1.6 x wr: in or proud
      if(b.fl){var Rf=b.fr||R/22,u2=KR.fbm(ca*Rf+3,sa*Rf+3,b.tier*1.3,2,b.ns+23);rec+=b.fl*(1-Math.pow(Math.abs(2*u2-1),.6));}
      if(b.gu)for(var i=0;i<b.gu.length;i++){var g=b.gu[i],d=Math.atan2(Math.sin(ang-g[0]),Math.cos(ang-g[0]))/g[1];rec+=g[2]*Math.exp(-d*d);}
      R=Math.max(R*.3,R-rec);}
    return R;}
  // the bed's top: flat, with a little roughness (rock pans and knobs); the mesh's top vertices are on it exactly
  function topH(b,x,z){return b.y+b.h+.7*(KR.fbm(x*.045+b.ns%97,z*.045,b.k,2,b.ns+11)-.5);}
  // the wall's radius factor up a bed (u 0 at its foot, 1 at its top): the notch weathered back at the parting, the chamfer
  function prof(b,u){var n=u<.2?1-b.nt*Math.pow(1-u/.2,2):1,c=u>.78?1-b.ch*Math.pow((u-.78)/.22,1.6):1;return n*c;}

  // ---------------------------------------------------------------- the bodies
  var KINDS={mesa:1,butte:1,spire:1,fin:1,balanced:1};
  // tp: the bed's radius at its top over its foot's, tx/tz: its centre's shift up the bed (a stack's taper and lean, run
  // on into the bed above, so a spire is one tapering, leaning column with its partings drawn as lines, not a pile of
  // drums); 1, 0, 0 for a mesa's or a butte's beds (their walls stand straight)
  function bed(k,y,h,cx,cz,rx,rz,ry,ch,nt,lob,ns,tier){return {k:k,y:y,h:h,cx:cx,cz:cz,rx:rx,rz:rz,ry:ry,ch:ch,nt:nt,lob:lob,ns:ns>>>0,tier:tier,tp:1,tx:0,tz:0,wr:0,wn:0,gu:null,fl:0};}
  // a bed's outline at height share u (0 its foot, 1 its top): its centre and its radius factor (the footprint function
  // footR times this) there
  function cAt(b,u){return [b.cx+(b.tx||0)*u,b.cz+(b.tz||0)*u];}
  function tAt(b,u){return 1+((b.tp==null?1:b.tp)-1)*u;}
  function make(o){
    if(!o||!KINDS[o.kind]) throw new Error('KSTACKS.make: kind must be mesa, butte, spire, fin or balanced');
    if(o.id==null) throw new Error('KSTACKS.make: a body needs an id');
    var seed=(o.seed==null?KR.child(1,String(o.id)):o.seed)>>>0,x=o.x||0,z=o.z||0,y0=o.y0==null?0:o.y0,beds=[];
    if(o.kind==='mesa'||o.kind==='butte'){
      var tiers=o.tiers||[{h:o.H==null?120:o.H,r:o.r==null?150:o.r,e:o.e==null?1.3:o.e,ry:o.ry||0}];
      var bl=o.bed||[14,34],lob=o.lobes==null?.16:o.lobes,y=y0,k=0,W=o.weather==null?.6:o.weather;   // weather 0: clean-cut walls
      for(var t=0;t<tiers.length;t++){var T=tiers[t],rs=S(KR.hash(seed,t,101)),ns=KR.hash(seed,t,7),top=y+T.h,e=T.e==null?1.3:T.e;
        var cx=x+(T.dx||0),cz=z+(T.dz||0),rx=T.r*Math.sqrt(e),rz=T.r/Math.sqrt(e),ry=T.ry==null?(o.ry||0):T.ry;
        // THE SHOULDER (o.shoulder {h, back, bed:[lo,hi]}, the top tier only): over its last h metres the beds are thin and
        // each steps back from the cliff, `back` metres in all (h/back 0.6..1: a rough 30-45 degree slope of ledges up to the
        // cap rock, as a Monument Valley butte's top), the top inside it flat and whole
        var SH=t===tiers.length-1&&o.shoulder?o.shoulder:null,shY=SH?top-SH.h:Infinity,sbl=SH&&SH.bed?SH.bed:[3,7];
        while(y<top-1){var inSh=y>=shY-.01,b0=inSh?sbl:bl,h=Math.min(rs.range(b0[0],b0[1]),top-y);if(top-y-h<b0[0]*.6)h=top-y;
          if(!inSh&&y+h>shY+b0[0]*.4)h=Math.max(shY-y,1);   // the cliff's last bed ends where the shoulder starts
          var last=y+h>=top-.01,j=1+rs.range(-.012,.012)+(last?.012:0),M=Math.max(rx,rz);   // the cap rock stands a little proud: harder
          var dS=0;if(inSh){var sb=(y+h-shY)/SH.h;j=1+rs.range(-.002,.002);dS=Math.min(M*.5,SH.back*sb+rs.range(-.12,.12)*SH.back/Math.max(2,SH.h/5));}   // metres back, both axes; each ledge a step
          // the chamfer and the notch are metres (a parting weathers back a metre or two whatever the mesa's size), kept as
          // fractions of the bed's radius
          beds.push(bed(k++,y,h,cx,cz,rx*j-dS,rz*j-dS,ry,(last?rs.range(1.5,3):rs.range(.4,1.2))/M,(last?rs.range(2,4):rs.range(.5,1.8))/M,lob,ns,t));y+=h;}
        // the tier weathered: its beds' own retreat (the cap rock, harder, least) and its gullies, a few per 200 m of rim
        if(W>0){var t0=y-T.h,M2=Math.max(rx,rz),per=TAU*Math.sqrt((rx*rx+rz*rz)/2),ng=Math.round(per/130*W),gs=S(KR.hash(seed,t,131)),G=[];
          for(var q=0;q<ng;q++)G.push([gs.range(0,TAU),gs.range(7,22)/M2,Math.min(gs.range(18,55)*W,M2*.3)]);
          for(var bi=0;bi<beds.length;bi++){var bb=beds[bi];if(bb.tier!==t)continue;var top2=bb.y+bb.h>=y-.01;
            bb.wr=Math.min(W*gs.range(.6,2.6)*(top2?.6:1),M2*.05);bb.wn=KR.hash(seed,t,bb.k,137)>>>0;bb.fl=Math.min(W*6,M2*.04);bb.fr=M2/22;   // one flute scale for the tier: its beds' grooves line up
            var f=sm(.1,.95,(bb.y+bb.h-t0)/T.h);if(f>.02&&G.length)bb.gu=G.map(function(g){return [g[0],g[1],g[2]*f];});}}}
    }else{
      var r=S(KR.hash(seed,0,202)),H=o.H==null?60:o.H,r0=o.r==null?12:o.r,e2=o.kind==='fin'?(o.e==null?4:o.e):(o.e==null?1.15:o.e);
      var ry2=o.ry==null?r.range(0,TAU):o.ry,lean=o.lean==null?r.range(0,.06):o.lean,la=o.kind==='fin'?ry2+(r.chance(.5)?0:Math.PI):r.range(0,TAU);
      var PL=o.plates&&o.plates.length===2?o.plates:null,jit=o.jitter==null?(PL?.3:0):o.jitter;   // plates: Roraima's piles
      var taper=o.taper==null?(o.kind==='fin'?.35:PL?.3:.45):o.taper,n=Math.max(3,Math.round(H/(PL?r.range(PL[0],PL[1]):r.range(12,20)))),yy=y0,hs=[],sum=0,i;
      for(i=0;i<n;i++){var w=r.range(PL?.4:.7,PL?1.8:1.3);hs.push(w);sum+=w;}   // plates: thin and thick ones in one pile
      var neck=o.kind==='balanced'?n-2:-1,lobS=o.kind==='fin'?.07:PL?.16:.1;
      for(i=0;i<n;i++){var hh=H*hs[i]/sum,u=(yy-y0)/H,rr=r0*(1-taper*u)*(PL?r.range(1-jit,1+jit):r.range(.97,1.03)),off=Math.tan(lean)*(yy-y0);
        var ccx=x+Math.cos(la)*off,ccz=z+Math.sin(la)*off,cap=i===n-1;
        if(i===neck)rr*=r.range(.45,.6);
        if(cap&&o.kind==='balanced'){rr=r0*r.range(.95,1.25);hh=Math.max(hh,rr*r.range(.7,1.1));}
        var rm=Math.max(rr*Math.sqrt(e2),rr/Math.sqrt(e2)),fine=i===neck||(cap&&o.kind==='balanced');   // metres again: a stack's partings are fine, a neck's deep; a plate's deep and its top rounded
        beds.push(bed(i,yy,hh,ccx,ccz,rr*Math.sqrt(e2),rr/Math.sqrt(e2),ry2+r.range(-.02,.02),(PL?r.range(.25,.7):fine?r.range(.6,1.2):r.range(.15,.4))/rm,(PL?r.range(1.2,2.8):fine?r.range(.5,1):r.range(.1,.35))/rm,lobS,KR.hash(seed,PL?i+1:0,9),0));yy+=hh;}   // a plate's outline is its own (its own noise seed): knobs, not one fret   // one outline up the stack (one noise seed, one tier): its beds differ in the fret only
      // the taper and the lean run on: each bed's top meets the next bed's foot (a balanced rock's neck keeps its own width
      // under the cap); the crest narrows (its shoulders weathered round)
      for(i=0;i<n;i++){var b0=beds[i],b1=beds[i+1];
        if(b1&&!(o.kind==='balanced'&&i===n-2)){b0.tp=PL?1:Math.min(b1.rx/b0.rx,1.15);b0.tx=b1.cx-b0.cx;b0.tz=b1.cz-b0.cz;}   // a plate keeps its width: the parting steps
        else if(!b1)b0.tp=o.crown==null?(o.kind==='balanced'?.9:PL?1:.8):o.crown;}
    }
    var R=0;beds.forEach(function(b){var m=Math.max(b.rx,b.rz)*(1+2.5*b.lob)+Math.hypot(b.cx-x,b.cz-z);if(m>R)R=m;});
    var tp=beds[beds.length-1];
    var rec={id:String(o.id),kind:o.kind,x:x,z:z,y0:y0,seed:seed,beds:beds,top:tp.y+tp.h,R:R+2};if(o.plates&&o.plates.length===2)rec.plates=true;return rec;
  }

  // ---------------------------------------------------------------- queries
  function inBed(b,x,z,shrink){var dx=x-b.cx,dz=z-b.cz,dist=Math.hypot(dx,dz),R=footR(b,Math.atan2(dz,dx))*shrink;return dist-R;}
  // the same at the bed's top (its taper and lean): where its top surface is
  function inTop(b,x,z,shrink){var c=cAt(b,1),dx=x-c[0],dz=z-c[1];return Math.hypot(dx,dz)-footR(b,Math.atan2(dz,dx))*tAt(b,1)*shrink;}
  function at(list,x,z){var best=null;
    for(var i=0;i<list.length;i++){var B=list[i];if(Math.abs(x-B.x)>B.R||Math.abs(z-B.z)>B.R)continue;
      for(var k=B.beds.length-1;k>=0;k--){var b=B.beds[k],d=inTop(b,x,z,1-b.ch);if(d<0){var t=topH(b,x,z);if(!best||t>best.top)best={S:B,b:b,top:t,d:d};break;}}}
    return best;}
  function topAt(list,x,z){var a=at(list,x,z);return a?a.top:-Infinity;}
  function foot(list,x,z){var best=null;
    for(var i=0;i<list.length;i++){var B=list[i];if(Math.abs(x-B.x)>B.R+400||Math.abs(z-B.z)>B.R+400)continue;
      var d=inBed(B.beds[0],x,z,1);if(!best||d<best.d)best={S:B,d:d};}
    return best;}
  // on a ledge: on bed k's top and outside the foot of bed k+1 (its notch counted), w the distance in from the ledge's lip
  function ledge(list,x,z){var a=at(list,x,z);if(!a)return null;var B=a.S,k=a.b.k;if(k>=B.beds.length-1)return null;
    var up=B.beds[k+1],dUp=inBed(up,x,z,1-up.nt);if(dUp<=0)return null;return {S:B,b:a.b,w:-a.d,out:dUp};}
  function ring(B,y,n){n=n||48;var b=null;for(var k=0;k<B.beds.length;k++){var q=B.beds[k];if(y>=q.y&&y<=q.y+q.h){b=q;break;}}
    if(!b)return null;var u=(y-b.y)/b.h,f=prof(b,u)*tAt(b,u),c=cAt(b,u),out=[];
    for(var i=0;i<n;i++){var a=i/n*TAU,R=footR(b,a)*f;out.push([c[0]+Math.cos(a)*R,c[1]+Math.sin(a)*R]);}return out;}

  // ---------------------------------------------------------------- the mesh
  // Rows of `seg` vertices round a bed (the angle runs clockwise seen from above, rows rising or closing in, so the quads (a, a+1, b) are CCW from
  // outside: test-stacks.js checks the outward share); a seam column is duplicated so the arc-length uv does not wrap.
  function mesh(B,opt){opt=opt||{};var step=opt.step||5,pos=[],uv=[],idx=[],part=[],bedA=[],occ=[];
    // the top function THROUGH THE EXPORT, so a host that wraps KSTACKS.topH (Korona's hoar table: knolls and the tarn's
    // basin added to the tops) draws what its field says; unwrapped it is this module's own (the same mesh as before)
    var TH=(root.KSTACKS&&root.KSTACKS.topH)||topH,NR=opt.topRings||5,SMAX=opt.segMax||160,rhos=[1,.8,.55,.3,.08];
    if(NR!==5){rhos=[];for(var q=0;q<NR;q++)rhos.push(1-(q/(NR-1))*.98);}
    function grid(rows,seg,p,bk,flip){var base=pos.length/3;
      for(var r=0;r<rows.length;r++)for(var s=0;s<=seg;s++){var q=rows[r](s);pos.push(q[0],q[1],q[2]);uv.push(q[3],q[4]);part.push(p);bedA.push(bk);occ.push(q[5]);}
      for(r=0;r<rows.length-1;r++)for(s=0;s<seg;s++){var a=base+r*(seg+1)+s,c=a+seg+1;
        if(flip)idx.push(a,c,a+1,a+1,c,c+1);else idx.push(a,a+1,c,a+1,c+1,c);}}
    for(var k=0;k<B.beds.length;k++){var b=B.beds[k],per=TAU*Math.max(b.rx,b.rz)*(1+b.lob),seg=Math.max(16,Math.min(SMAX,Math.round(per/step)));
      var ang=function(s){return -s/seg*TAU;};                                        // clockwise from above
      var arc=[0];for(var s=1;s<=seg;s++){var a0=ang(s-1),a1=ang(s),r0=footR(b,a0),r1=footR(b,a1);arc.push(arc[s-1]+Math.hypot(Math.cos(a1)*r1-Math.cos(a0)*r0,Math.sin(a1)*r1-Math.sin(a0)*r0));}
      var us=[0,.06,.2,.5,.78,.9,1],c1=cAt(b,1),t1=tAt(b,1),wall=us.map(function(u){return function(s){var a=ang(s),c=cAt(b,u),R=footR(b,a)*prof(b,u)*tAt(b,u),y=b.y+u*b.h;
        return [c[0]+Math.cos(a)*R,y,c[1]+Math.sin(a)*R,arc[s],y,u<.2?.55+.45*(u/.2):1];};});
      wall[wall.length-1]=(function(){return function(s){var a=ang(s),R=footR(b,a)*(1-b.ch)*t1,x=c1[0]+Math.cos(a)*R,z=c1[1]+Math.sin(a)*R;return [x,TH(b,x,z),z,arc[s],b.y+b.h,1];};})();
      grid(wall,seg,0,k,false);
      // the top: rings in from the chamfer's edge to the centre, on topH exactly
      var tops=rhos.map(function(rho){return function(s){var a=ang(s),R=footR(b,a)*(1-b.ch)*t1*rho,x=c1[0]+Math.cos(a)*R,z=c1[1]+Math.sin(a)*R;return [x,TH(b,x,z),z,x,z,1];};});
      grid(tops,seg,1,k,false);
      // an overhang's underside (a balanced cap, a bed wider than the top below it): a disc facing down at its foot
      var below=k>0?B.beds[k-1]:null,over=false;
      // (any overhang at all: a weathered bed standing proud of the one under it leaves a slit to the sky otherwise)
      if(below)for(s=0;s<seg&&!over;s++){var aa=ang(s);if(footR(b,aa)*(1-b.nt)>footR(below,aa)*(1-below.ch)*tAt(below,1)+.05)over=true;}
      if(over){var und=[1,.6,.25].map(function(rho){return function(s){var a=ang(s),R=footR(b,a)*(1-b.nt)*rho,x=b.cx+Math.cos(a)*R,z=b.cz+Math.sin(a)*R;return [x,b.y,z,x,z,.35];};});
        grid(und,seg,2,k,true);}
    }
    return {pos:new Float32Array(pos),uv:new Float32Array(uv),idx:new Uint32Array(idx),part:new Uint8Array(part),bed:new Uint8Array(bedA),occ:new Float32Array(occ)};}

  // ---------------------------------------------------------------- layouts
  // the optional variety of a layout's stack i (taper, lean, e, crown ranges; lift), from its own stream: nothing is drawn
  // from it unless a range is given, and the layout's main stream is never touched
  function variety(o,i,x,z,rad,into){var v=null,keys=['taper','lean','e','crown'];
    for(var q=0;q<keys.length;q++){var k=keys[q],rg=o[k];if(!rg||rg.length!==2)continue;if(!v)v=S(KR.hash(o.seed,i,406));into[k]=v.range(rg[0],rg[1]);}
    if(o.plates&&o.plates.length===2){if(!v)v=S(KR.hash(o.seed,i,406));if(v.chance(o.platesShare==null?.5:o.platesShare))into.plates=o.plates;}
    if(o.lift)into.H+=o.lift(x,z,rad);return into;}
  function row(o){var n=o.n||5,a=o.a,b=o.b,out=[],str=Math.atan2(b[1]-a[1],b[0]-a[0]),g=o.ground||function(){return 0;};
    var lean=S(KR.hash(o.seed,0,303)).range(0,.07);
    for(var i=0;i<n;i++){var r=S(KR.hash(o.seed,i,304)),t=(i+.5+r.range(-.3,.3))/n,x=a[0]+(b[0]-a[0])*t,z=a[1]+(b[1]-a[1])*t;
      x+=Math.cos(str+Math.PI/2)*r.range(-1,1)*(o.jitter||8);z+=Math.sin(str+Math.PI/2)*r.range(-1,1)*(o.jitter||8);
      var HH=r.range(o.H[0],o.H[1]),rr=r.range(o.r[0],o.r[1]),spec={id:o.id+'-'+i,kind:o.kind||'fin',x:x,z:z,y0:g(x,z)-1,seed:KR.hash(o.seed,i,305),H:HH,
        r:rr,e:o.e?r.range(o.e[0],o.e[1]):4,ry:str+r.range(-.08,.08),lean:lean};   // (the draws in their old order: H, r, e, ry)
      out.push(make(variety({seed:o.seed,taper:o.taper,lean:o.lean,crown:o.crown,plates:o.plates,platesShare:o.platesShare,lift:o.lift},i,x,z,rr,spec)));}
    return out;}
  function cluster(o){var n=o.n||8,out=[],g=o.ground||function(){return 0;},K=o.kinds||{spire:.6,balanced:.25,fin:.15},keys=Object.keys(K),tot=0;
    keys.forEach(function(k){tot+=K[k];});
    for(var i=0;i<n;i++){for(var tr=0;tr<24;tr++){var r=S(KR.hash(o.seed,i,tr,404)),ang=r.range(0,TAU),d=o.rad*Math.sqrt(r.next()),x=o.c[0]+Math.cos(ang)*d,z=o.c[1]+Math.sin(ang)*d;
        var rad=r.range(o.r[0],o.r[1]),ok=!o.accept||o.accept(x,z,rad);
        for(var j=0;j<out.length&&ok;j++)if(Math.hypot(out[j].x-x,out[j].z-z)<rad+out[j]._r+(o.gap==null?6:o.gap))ok=false;
        if(!ok)continue;var u=r.next()*tot,kind=keys[0];for(var q=0;q<keys.length;q++){u-=K[keys[q]];if(u<=0){kind=keys[q];break;}}
        var B=make(variety(o,i,x,z,rad,{id:o.id+'-'+i,kind:kind,x:x,z:z,y0:g(x,z)-1,seed:KR.hash(o.seed,i,405),H:r.range(o.H[0],o.H[1]),r:rad}));B._r=rad;out.push(B);break;}}
    out.forEach(function(B){delete B._r;});return out;}

  function exp(list){return {format:'krator-stacks',version:1,bodies:list.map(function(B){return JSON.parse(JSON.stringify(B));})};}
  function load(j){if(!j||j.format!=='krator-stacks')throw new Error('KSTACKS.load: not a krator-stacks export');return j.bodies.map(function(B){return JSON.parse(JSON.stringify(B));});}
  function hash(m){var h=KR.hash(1,m.pos.length,m.idx.length);
    for(var i=0;i<m.pos.length;i+=7)h=KR.hash(h,Math.round(m.pos[i]*1000));for(i=0;i<m.idx.length;i+=11)h=KR.hash(h,m.idx[i]);return h>>>0;}

  root.KSTACKS={make:make,footR:footR,topH:topH,prof:prof,at:at,topAt:topAt,foot:foot,ledge:ledge,ring:ring,mesh:mesh,row:row,cluster:cluster,
    export:exp,load:load,hash:hash};
})(typeof globalThis!=='undefined'?globalThis:this);
