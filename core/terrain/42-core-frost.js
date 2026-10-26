// ================================================================= CORE — frost: the periglacial landforms of a heightfield world
// [G data] Plain maths of (x, z) and the world's own ground: no THREE, no DOM, no Math.random, no Math.sin, cos or exp (only + - * /
// floor sqrt abs), the draws from core/rand (KRAND), so a Godot port reproduces it. Needs KRAND (core/rand/08-core-rand.js) loaded
// first. Opt-in: a build lists it by name (core/terrain/42-core-frost.js). Written for the NW outer wall (biomes/nwouterwall/PLAN.md
// section 6: the Yeti's High Country on permafrost); any cold biome takes it (the Throne's glacier, the northern highlands' tops).
//
// The landforms a frozen ground makes, each as height to ADD to the world's ground, and as fields a kit dresses by:
//   ICE-WEDGE POLYGONS and SORTED CIRCLES  a jittered lattice of cells (cell m): the troughs where two cells meet (the ice wedges,
//          a few tens of cm deep, their rims a little raised); the stones gather on the troughs (sorted circles on a stony ground)
//   ALASES  thaw hollows: a flat floor sunk metres into the plateau, steep sides, a lake in the middle that shrinks into a meadow
//          ring (the Yakutian alas). Outline wobbled by noise in the plane (no trig)
//   PINGOS  ice-cored mounds, a dome round a ruptured summit crater
//   AUFEIS  naled: sheets of ice built up on a valley floor every winter by springs and streams overflowing and freezing, flat
//          across, metres thick by spring, along a line (the stream) in patches. A SURFACE of its own (the ice's top), not ground
//   SOLIFLUCTION LOBES  tongues of soil creeping down a slope: a step (riser) at each lobe's front, laid on a lattice and turned
//          to the slope's fall line at the lobe's centre
//   ROCK GLACIERS  a tongue of rock and ice from a cirque's foot down a line: a steep front, transverse ridges and furrows
//
//   const F = KFROST.create({seed, ground:(x,z)=>h, polygons, alases, pingos, aufeis, lobes, rockGlaciers})
//     ground      the world's height before the landforms (the lobes read its fall line; the alases, pingos and aufeis their
//                 rims and floors)
//     polygons    {cell:16, trough:.35 (m), rim:.08 (m), width:.16 (of a cell), where:(x,z)=>0..1}: where the ground is
//                 patterned (0 nowhere); omitted: none
//     alases      [{id, x, z, r, depth:8, floor:.55 (of r: the flat floor), lake:.5 (of the floor: 0 dry, a meadow), wob:.12}]
//     pingos      [{id, x, z, r, h, crater:.28 (of r), craterD:.45 (of h)}]
//     aufeis      [{id, pts:[[x,z],...], w (half-width, m), thick (m), seg:[lo,hi] (patch length, m), gap:[lo,hi], cover:0..1, wob:.35}]:
//                 the line the ice builds along; its patches drawn per line and index from the seed; cover scales every patch
//                 (spring 1, autumn a remnant); wob: how far the outline wanders in from w (a share of it)
//     lobes       {cell:28, h:1.4 (m), where:(x,z)=>0..1}
//     rockGlaciers [{id, a:[x,z], b:[x,z], w (half-width), h (the front's height), ridge:22 (m between ridges)}]
//   F.h(x,z)          the metres to add to the ground (negative in an alas, positive on a pingo, a lobe, a rock glacier)
//   F.sample(x,z,out) {poly (0..1 on a trough), polyId (the cell), alas (0..1 inside an alas's rim), alasId, lake (1 in its
//                     water), meadow (0..1 the floor's ring round the lake), pingo (0..1), aufeis (0..1 under the ice), iceH (the
//                     ice's top over the ground at x,z, 0 where none), lobe (0..1 on a lobe's tread), front (0..1 its riser),
//                     rockG (0..1 on a rock glacier), ridge (0..1 a ridge's crest)}
//   F.alasLevel(id)   an alas lake's water level (the floor's height at its middle, a little under the rim of the lake)
//   F.patches(id)     an aufeis line's patches: [{s0, s1, thick}] (metres along the line)
//   F.records()       every landform as a record {class:'feature', kind, id, x, z, r, ...} (core/tags-ready; plain data)
//   KFROST.version
(function(root){
  'use strict';
  var R=root.KRAND;
  function clamp(v,a,b){return v<a?a:v>b?b:v;}
  function smooth(a,b,x){var t=(x-a)/(b-a);t=t<0?0:t>1?1:t;return t*t*(3-2*t);}
  function unit(seed,a,b,c){return R.unit(R.hash(seed,a,b,c));}

  function create(o){
    if(!R)throw new Error('KFROST needs core/rand (KRAND) loaded first');
    o=o||{};var seed=o.seed==null?1:o.seed,ground=o.ground||function(){return 0;};
    var P=o.polygons?Object.assign({cell:16,trough:.35,rim:.08,width:.16,where:function(){return 1;}},o.polygons):null;
    var A=(o.alases||[]).map(function(a,k){return Object.assign({id:'alas'+k,depth:8,floor:.55,lake:.5,wob:.12},a);});
    var Pg=(o.pingos||[]).map(function(p,k){return Object.assign({id:'pingo'+k,crater:.28,craterD:.45},p);});
    var L=o.lobes?Object.assign({cell:28,h:1.4,where:function(){return 1;}},o.lobes):null;
    var RG=(o.rockGlaciers||[]).map(function(g,k){var dx=g.b[0]-g.a[0],dz=g.b[1]-g.a[1],len=Math.sqrt(dx*dx+dz*dz)||1;
      return Object.assign({id:'rockglacier'+k,ridge:22},g,{len:len,tx:dx/len,tz:dz/len});});

    // ---- the alases: each one's floor height (the ground at its middle less its depth) and lake level, once
    A.forEach(function(a){a.g0=ground(a.x,a.z);a.floorY=a.g0-a.depth;a.level=a.floorY+.05;});
    // ---- the aufeis lines: their length along, the patches drawn per line and index (never from how many came before)
    var AU=(o.aufeis||[]).map(function(l,k){var pts=l.pts,cum=[0];
      for(var i=1;i<pts.length;i++){var dx=pts[i][0]-pts[i-1][0],dz=pts[i][1]-pts[i-1][1];cum.push(cum[i-1]+Math.sqrt(dx*dx+dz*dz));}
      var Lk=Object.assign({id:'aufeis'+k,seg:[180,520],gap:[120,420],cover:1,wob:.35},l,{cum:cum,total:cum[cum.length-1]}),pat=[],s=0,i2=0;
      s=unit(seed,k,0,0xA0F)*Lk.gap[1];
      while(s<Lk.total&&i2<500){var len=Lk.seg[0]+(Lk.seg[1]-Lk.seg[0])*unit(seed,k,i2,0xA1F),th=Lk.thick*(.6+.4*unit(seed,k,i2,0xA2F));
        var c=Lk.cover,l2=len*c;if(l2>8)pat.push({s0:s+(len-l2)*.5,s1:s+(len+l2)*.5,thick:th*(.35+.65*c)});
        s+=len+Lk.gap[0]+(Lk.gap[1]-Lk.gap[0])*unit(seed,k,i2,0xA3F);i2++;}
      Lk.pat=pat;
      // the ice's top along each patch: the ground at the line, never climbing downstream (the overflow freezes level, then spills)
      Lk.top=function(sa){var x=at(Lk,sa);return ground(x[0],x[1]);};
      return Lk;});
    function at(l,s){var c=l.cum,p=l.pts,i=0;while(i<c.length-2&&c[i+1]<s)i++;var t=c[i+1]>c[i]?clamp((s-c[i])/(c[i+1]-c[i]),0,1):0;
      return [p[i][0]+(p[i+1][0]-p[i][0])*t,p[i][1]+(p[i+1][1]-p[i][1])*t];}
    // the nearest point of a line within its half-width: {d, s}. The segments are filed by cell (GC m, each under every cell its box
    // grown by the half-width touches), so a point reads only the few near it; the answer is the scan's over those (a farther
    // segment is past the half-width and never wins)
    var GC=64;
    function nearest(l,x,z){var p=l.pts,best=1e18,bs=0,L=l.cells[Math.floor(x/GC)+','+Math.floor(z/GC)];if(!L)return {d:1e9,s:0};
      for(var k=0;k<L.length;k++){var i=L[k],ax=p[i][0],az=p[i][1],bx=p[i+1][0],bz=p[i+1][1],dx=bx-ax,dz=bz-az,L2=dx*dx+dz*dz||1,
        t=clamp(((x-ax)*dx+(z-az)*dz)/L2,0,1),qx=ax+dx*t-x,qz=az+dz*t-z,d2=qx*qx+qz*qz;if(d2<best){best=d2;bs=l.cum[i]+t*Math.sqrt(L2);}}
      return {d:Math.sqrt(best),s:bs};}
    // a box for each line, to skip it cheaply, and its segments by cell
    AU.forEach(function(l){var x0=1e18,z0=1e18,x1=-1e18,z1=-1e18;l.pts.forEach(function(q){x0=Math.min(x0,q[0]);z0=Math.min(z0,q[1]);x1=Math.max(x1,q[0]);z1=Math.max(z1,q[1]);});
      l.box=[x0-l.w-4,z0-l.w-4,x1+l.w+4,z1+l.w+4];l.cells={};var p=l.pts,pad=l.w+1;
      for(var i=0;i<p.length-1;i++){var i0=Math.floor((Math.min(p[i][0],p[i+1][0])-pad)/GC),i1=Math.floor((Math.max(p[i][0],p[i+1][0])+pad)/GC),
        j0=Math.floor((Math.min(p[i][1],p[i+1][1])-pad)/GC),j1=Math.floor((Math.max(p[i][1],p[i+1][1])+pad)/GC);
        for(var jj=j0;jj<=j1;jj++)for(var ii=i0;ii<=i1;ii++){var k=ii+','+jj;(l.cells[k]||(l.cells[k]=[])).push(i);}}});

    // ---- the polygons: the jittered lattice; the trough distance (F2 - F1 of the two nearest centres)
    function polyAt(x,z,out){var c=P.cell,ix=Math.floor(x/c),iz=Math.floor(z/c),d1=1e18,d2=1e18,id=0;
      for(var j=-1;j<=1;j++)for(var i=-1;i<=1;i++){var a=ix+i,b=iz+j,cx=(a+.15+.7*unit(seed,a,b,0xB01))*c,cz=(b+.15+.7*unit(seed,a,b,0xB02))*c,
        dx=x-cx,dz=z-cz,d=dx*dx+dz*dz;if(d<d1){d2=d1;d1=d;id=a*73856093^b*19349663;}else if(d<d2)d2=d;}
      var e=(Math.sqrt(d2)-Math.sqrt(d1))/c;    // 0 on a trough, ~.5 at a centre
      out.poly=smooth(P.width,0,e);out.polyId=id>>>0;return e;}
    // ---- the lobes: the lattice's cells, each turned to the fall line at its centre (cached by cell)
    var lobeDir={};
    function lobeOf(a,b){var k=a+','+b,v=lobeDir[k];if(v)return v;var c=L.cell,cx=(a+.2+.6*unit(seed,a,b,0xC01))*c,cz=(b+.2+.6*unit(seed,a,b,0xC02))*c,
      e=2,hx=(ground(cx+e,cz)-ground(cx-e,cz))/(2*e),hz=(ground(cx,cz+e)-ground(cx,cz-e))/(2*e),g=Math.sqrt(hx*hx+hz*hz);
      v={cx:cx,cz:cz,dx:g>1e-6?-hx/g:0,dz:g>1e-6?-hz/g:1,g:g,len:c*(.7+.5*unit(seed,a,b,0xC03)),wid:c*(.35+.2*unit(seed,a,b,0xC04)),w:L.where(cx,cz)};
      lobeDir[k]=v;return v;}
    function lobeAt(x,z,out){var c=L.cell,ix=Math.floor(x/c),iz=Math.floor(z/c),h=0,tr=0,fr=0;
      for(var j=-1;j<=1;j++)for(var i=-1;i<=1;i++){var v=lobeOf(ix+i,iz+j);if(v.w<=0||v.g<.06)continue;
        var u=(x-v.cx)*v.dx+(z-v.cz)*v.dz,s=-(x-v.cx)*v.dz+(z-v.cz)*v.dx,U=u/v.len,S=s/v.wid;   // u down the fall line, s across
        // a tongue: round in plan (U^2 + S^2 < 1 with its front blunter), its tread level, its riser at the front (U ~ +1)
        var rr=S*S+(U<0?U*U*.6:U*U);if(rr>=1)continue;
        var k2=smooth(1,.55,rr)*v.w*clamp(v.g*3,0,1),front=smooth(.45,.95,U);
        // the tread holds the soil back: it stands over the slope by its height toward the front and drops at the riser
        var dh=L.h*k2*(smooth(-1,.6,U)-front*front*.3);if(dh>h){h=dh;tr=k2*(1-front);fr=k2*front;}}
      out.lobe=tr;out.front=fr;return h;}
    function alasAt(x,z,a,out){var dx=x-a.x,dz=z-a.z,d=Math.sqrt(dx*dx+dz*dz);if(d>a.r*1.35)return 0;
      var n=R.vnoise(x/(a.r*.45)+a.x*.001,z/(a.r*.45)-a.z*.001,0,seed^0x5A1)-.5,q=d/a.r+a.wob*2*n;   // q 1 at the rim
      if(q>1.25)return 0;
      var inside=smooth(1.12,.9,q),fl=a.floor;
      // the side: a steep fall from the rim to the floor; the floor flat, a little dished toward the lake
      var drop=a.depth*smooth(1.08,fl,q)+.6*smooth(fl,0,q);
      if(inside>out.alas){out.alas=inside;out.alasId=a.id;out.lake=a.lake>0?smooth(a.lake*fl+.03,a.lake*fl-.03,q):0;
        out.meadow=smooth(fl,fl*.92,q)*(1-out.lake);}
      return -drop;}
    function pingoAt(x,z,p,out){var dx=x-p.x,dz=z-p.z,d=Math.sqrt(dx*dx+dz*dz);if(d>=p.r)return 0;
      var t=d/p.r,v=1-t*t,h=p.h*v*Math.sqrt(v);var rc=p.crater;if(t<rc){var u=t/rc;h-=p.h*p.craterD*(1-u*u);}
      out.pingo=Math.max(out.pingo,smooth(1,.6,t));return h;}
    function aufeisAt(x,z,l,out){var b=l.box;if(x<b[0]||z<b[1]||x>b[2]||z>b[3])return;var n=nearest(l,x,z);if(n.d>l.w)return;
      // the sheet's outline wanders in and out (the overflow spreads where the floor lets it): its half-width here, never over l.w
      var W=l.w*(1-l.wob*R.vnoise(x/(l.w*1.3),z/(l.w*1.3),0,seed^0xA5F));if(n.d>W)return;
      for(var i=0;i<l.pat.length;i++){var P2=l.pat[i];if(n.s<P2.s0-l.w||n.s>P2.s1+l.w)continue;
        var end=Math.min(smooth(P2.s0-l.w*.6,P2.s0+l.w*.4,n.s),smooth(P2.s1+l.w*.6,P2.s1-l.w*.4,n.s));
        var edge=smooth(W,W*.55,n.d),k=end*edge;if(k<=0)continue;
        // the ice's top: level across at the line's ground plus the patch's thickness, thinning to its edges
        var c=at(l,n.s),top=ground(c[0],c[1])+P2.thick*(.25+.75*k);
        var over=top-ground(x,z);if(over>out.iceH){out.iceH=over;out.aufeis=k;out.aufeisId=l.id;}}}
    function rgAt(x,z,g,out){var dx=x-g.a[0],dz=z-g.a[1],u=dx*g.tx+dz*g.tz,s=-dx*g.tz+dz*g.tx;if(u<-g.w||u>g.len+g.w*.5)return 0;
      var U=u/g.len,S=Math.abs(s)/(g.w*(.75+.35*smooth(0,1,U)));if(S>=1.05)return 0;   // the tongue spreads toward its front
      var side=smooth(1.05,.75,S),front=smooth(1+g.w*.5/g.len,1,U),k=side*front*smooth(-g.w/g.len,0,U);
      var tri=Math.abs((u/g.ridge+.37*S*S)%1-.5)*2;    // transverse ridges, bowed downstream (a triangle wave: no trig)
      var ridge=smooth(.55,.95,tri)*side;out.rockG=Math.max(out.rockG,k);out.ridge=Math.max(out.ridge,ridge*k);
      return g.h*k*(.75+.25*ridge);}

    var NONE={poly:0,polyId:0,alas:0,alasId:null,lake:0,meadow:0,pingo:0,aufeis:0,aufeisId:null,iceH:0,lobe:0,front:0,rockG:0,ridge:0};
    function sample(x,z,out){out=out||{};for(var k in NONE)out[k]=NONE[k];out._h=0;var h=0;
      for(var i=0;i<A.length;i++)h+=alasAt(x,z,A[i],out);
      for(var j=0;j<Pg.length;j++)h+=pingoAt(x,z,Pg[j],out);
      for(var g=0;g<RG.length;g++)h+=rgAt(x,z,RG[g],out);
      if(L&&!out.alas)h+=lobeAt(x,z,out);
      if(P){var w=P.where(x,z)*(1-out.alas*(1-out.meadow))*(1-out.pingo);if(w>0){polyAt(x,z,out);var q=out.poly;h+=w*(-P.trough*q*q+P.rim*4*q*(1-q));out.poly*=w;}}   /* the wedge's trough, its rims raised either side */
      for(var a=0;a<AU.length;a++)aufeisAt(x,z,AU[a],out);
      out._h=h;return out;}
    var S0={};
    return {
      h:function(x,z){return sample(x,z,S0)._h;},
      sample:sample,
      alases:A,pingos:Pg,aufeis:AU,rockGlaciers:RG,
      alasLevel:function(id){for(var i=0;i<A.length;i++)if(A[i].id===id)return A[i].level;return null;},
      patches:function(id){for(var i=0;i<AU.length;i++)if(AU[i].id===id)return AU[i].pat.slice();return null;},
      records:function(){var out=[];
        A.forEach(function(a){out.push({class:'feature',kind:'alas',id:a.id,x:a.x,z:a.z,r:a.r,depth:a.depth,lake:a.lake,level:a.level});});
        Pg.forEach(function(p){out.push({class:'feature',kind:'pingo',id:p.id,x:p.x,z:p.z,r:p.r,h:p.h});});
        AU.forEach(function(l){l.pat.forEach(function(q,i){var c=at(l,(q.s0+q.s1)/2);out.push({class:'feature',kind:'aufeis',id:l.id+'.'+i,x:c[0],z:c[1],r:(q.s1-q.s0)/2+l.w,thick:q.thick});});});
        RG.forEach(function(g){out.push({class:'feature',kind:'rockglacier',id:g.id,x:(g.a[0]+g.b[0])/2,z:(g.a[1]+g.b[1])/2,r:g.len/2+g.w,h:g.h});});
        return out;}};
  }
  root.KFROST={version:1,create:create};
})(typeof window!=='undefined'?window:globalThis);
