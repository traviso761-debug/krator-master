// ================================================================= CORE — doors (core/door; MODULARITY-PLAN.md step 2b)
// Doors that open and shut, as plain records keyed by stable ids, with open / close / toggle / nearest as plain functions
// that a player's key, an NPC, a quest or a save game calls, and each door's walk blocks in core/walk (KWALK): shut, the
// doorway is blocked; open, it is clear. Lifted from Iziz's IZDOOR (kits/iziz-vernacular/src/69e5-iziz-openings.js and
// settlements/iziz/src/95j-iziz-doors.js, the owner's doors of 2026-10-19/20), whose leaves now register here.
// Plain maths, no THREE, no DOM: the drawing of a leaf (its mesh, its matrix) is the host's (90-core-door-host.js).
//
// Axes: y up, metres, x east, z south. A door's yaw is the face's OUTWARD yaw (the builders' ry: +z of the face's frame).
//
//   const D=KDOOR                       the shared registry (KDOOR.create() makes an independent one)
//   D.add({id, at, hinge, yaw, w, h, t, sign, p0, locked, key, kind, pair, both, spring, walk, style, preset})  a door
//        id      stable id (a building's key and an index, say); default 'door.<n>'
//        at      [x,y,z] the middle of the doorway's line at the sill, world
//        hinge   [x,y,z] the hinge line's foot, world (the jamb the leaf turns on; default the -x jamb, +x when sign -1)
//        yaw     the face's outward yaw; sign +1 (hinged on the -x jamb, the default) or -1 (on +x: a double door's right leaf)
//        w h t   the doorway's width (a pair's two leaves share it), the leaf's height and thickness (world)
//        p0      [x,y,z] the leaf's centre when shut (default at, raised h/2); pose() turns it about the hinge
//        locked  a door that does not open (a solid body's door: nothing behind it); key: the owner (a def's key)
//        open    0..1: how far open it stands as built (a gate drawn open; default 0, shut). A locked door is shut
//        pivot   true: the leaf turns about its own middle (hinge = at), not a jamb (a triangle leaf); kept on the record
//        kind    how the leaf moves: 'swing' (default: about the hinge's vertical line), 'slide' (along the doorway's line,
//                toward the hinge jamb: a pocket or barn door), 'lift' (straight up: a portcullis; roll true: a roller shutter
//                that rolls into its head; drop true: sinks into the floor, a floodgate, a bollard gate; rise: how far it goes, default
//                its height), 'tilt' (hinged at its head, swings up and out: an up-and-over door, a flap, a hatch in a wall),
//                'fold' (two panels that fold to the hinge jamb: a bifold), 'iris' (shrinks to its
//                middle), 'hatch' (lies in a floor or a roof, hinged on its edge, turning up about the doorway's line: a trapdoor;
//                at is the middle of the hinge edge, h the hatch's depth from it along the yaw's outward direction)
//        pair    two leaves meeting in the middle, each w/2: a double door, a bi-parting slide, a double bifold; a lift's pair
//                meets across the doorway's middle height, each h/2, the top rising and the bottom sinking (blast doors)
//        rate    how fast it moves against the registry's RATE (default 1; a blast door .35, a portcullis .5)
//        both    double-acting: swings away from whoever opens it (open's o.from), either way (a saloon's, a kitchen's)
//        swing   the angle a swing, fold or hatch opens to (rad; default the registry's SWING, a fold PI/2)
//        spring  seconds it stays open before it shuts itself, every time it is opened (a saloon's, a sprung gate)
//        walk    false: no walk blocks (a saloon's half leaves a walker pushes through; a hatch, whose way is a floor's)
//        style   the leaf's look for the host (90-core-door-host.js leafGeometry: 'plank', 'panel', 'glazed', 'half',
//                'louvre', 'grille', 'slat', 'disc'); the record keeps it, nothing here reads it
//        preset  a named set of the above (KDOOR.PRESET: single, double, saloon, slide, pocket, barn, biparting, portcullis,
//                roller, garage, flap, blast, blastside, floodgate, bifold, iris, hatch); the record's own fields win
//        any other field is kept on the record (a host's draw handle, a builder's own index)
//   D.get(id)                           the record (or the record itself)
//   D.open(id, {by, auto, from}) / close(id, {by}) / toggle(id, o)   false when locked or missing. by: 'player' | 'npc' | a
//                                       name; auto: seconds the door stays open before it shuts itself (default its spring);
//                                       from [x,z]: where the opener stands (a double-acting door swings away from it)
//   D.lock(id, on, o)                   lock (shutting it) or unlock; o.asBuilt: the world was built so (a door found to open
//                                       on a furnished room), so state() keeps no delta for it
//   D.nearest(x, y, z, r)               the nearest unlocked door whose sill is within r (2.2) in plan and 2.2 in height
//   D.step(dt)                          ease every moving door (RATE rad/s over SWING rad); switch its walk blocks as it
//                                       passes half open; returns the doors that moved (the host poses those)
//   D.leaves(rec)                       every leaf's pose now: [{p:[x,y,z] its centre, ax: 'y' or [x,y,z] a world axis, ang:
//                                       the turn about it from shut (rad), s:[x,y,z] its scale over its shut size, size:[w,h,t]
//                                       its shut size}]; the host draws leaf i at p, turned Q(ax, ang) times its shut rotation
//   D.leafSize(rec)                     [w,h,t] of one leaf (a pair's is w/2), D.leafCount(rec) how many leaves (a fold has two
//                                       panels a side)
//   D.angle(rec)                        the leaf's swing now (rad, signed); D.pose(rec) -> [x, y, z, a]: the first leaf's centre
//                                       and its turn about y (the single swing door's whole pose)
//   D.walk(W)                           once the world is built: each door's doorway as small blocks along its line in W
//                                       (core/walk), on for a door built shut, off for one built open (step() then switches them as
//                                       the door passes half open, and on again when it is shut); returns the number of doors
//   D.clearDoorways(W, o)               switch off any OTHER block standing in an unlocked doorway (a room wall whose gap is
//                                       narrower or set beside the door); a locked door's line is left alone (a solid body's
//                                       face: its mass block stays). o.locked true clears those too. Returns how many
//   D.prune(keep)                       drop the doors keep(rec) refuses (a placement that was unwound), in place
//   D.state() / D.load(state)           the deltas a save keeps: {id: {open, locked}} for every door not shut and unlocked
//   D.export()                          {format:'krator-doors', version, doors:[...]}: the records for Godot (no draw handles)
(function(root){
  var PRESET={single:{},double:{pair:true},saloon:{pair:true,both:true,spring:1.4,walk:false,swing:1.35,style:'louvre'},
    slide:{kind:'slide'},pocket:{kind:'slide'},barn:{kind:'slide',style:'plank'},biparting:{kind:'slide',pair:true},
    portcullis:{kind:'lift',style:'grille',rate:.5},roller:{kind:'lift',roll:true,style:'slat'},bifold:{kind:'fold'},
    garage:{kind:'tilt',style:'slat',rate:.6},flap:{kind:'tilt',style:'plank'},blast:{kind:'lift',pair:true,style:'plate',rate:.35},
    blastside:{kind:'slide',pair:true,style:'plate',rate:.35},floodgate:{kind:'lift',drop:true,style:'plate',rate:.4},
    iris:{kind:'iris',style:'disc'},hatch:{kind:'hatch',walk:false,style:'plank'}};
  var KINDS={swing:1,slide:1,lift:1,tilt:1,fold:1,iris:1,hatch:1};
  function ease(s){return s*s*(3-2*s);}
  function rotY(v,a){var c=Math.cos(a),s=Math.sin(a);return[v[0]*c+v[2]*s,v[1],-v[0]*s+v[2]*c];}
  function rotAx(v,k,a){var c=Math.cos(a),s=Math.sin(a),d=k[0]*v[0]+k[1]*v[1]+k[2]*v[2],x=[k[1]*v[2]-k[2]*v[1],k[2]*v[0]-k[0]*v[2],k[0]*v[1]-k[1]*v[0]];
    return[v[0]*c+x[0]*s+k[0]*d*(1-c),v[1]*c+x[1]*s+k[1]*d*(1-c),v[2]*c+x[2]*s+k[2]*d*(1-c)];}
  function create(o){
    o=o||{};
    var list=[],byId=new Map(),W=null;
    var K={list:list,SWING:o.swing==null?1.75:o.swing,RATE:o.rate==null?1.6:o.rate,PRESET:PRESET};
    var CORE={id:1,at:1,hinge:1,yaw:1,sign:1,w:1,h:1,t:1,p0:1,open:1,target:1,locked:1,by:1,auto:1,key:1,blocks:1,
      kind:1,pair:1,both:1,swing:1,spring:1,walk:1,style:1,roll:1,dir:1,preset:1,drop:1,rise:1,rate:1};
    function add(r){
      if(r&&r.preset!=null){var P=PRESET[r.preset];if(!P)throw new Error('KDOOR.add: no preset '+r.preset);r=Object.assign({},P,r);}
      if(!r||!r.at||!(r.w>0)||!(r.h>0))throw new Error('KDOOR.add: at, w and h required');
      var kind=r.kind==null?'swing':r.kind;if(!KINDS[kind])throw new Error('KDOOR.add: no kind '+kind);
      var yaw=r.yaw==null?0:r.yaw,sign=r.sign==null?1:(r.sign<0?-1:1),ux=Math.cos(yaw),uz=-Math.sin(yaw);
      var D={id:r.id==null?'door.'+list.length:String(r.id),at:r.at.slice(),
        hinge:r.hinge?r.hinge.slice():[r.at[0]-sign*ux*r.w/2,r.at[1],r.at[2]-sign*uz*r.w/2],yaw:yaw,
        sign:sign,w:r.w,h:r.h,t:r.t==null?.07:r.t,
        p0:r.p0?r.p0.slice():kind==='hatch'?[r.at[0]+Math.sin(yaw)*r.h/2,r.at[1],r.at[2]+Math.cos(yaw)*r.h/2]:[r.at[0],r.at[1]+r.h/2,r.at[2]],
        open:0,target:0,locked:!!r.locked,by:null,auto:0,key:r.key==null?null:r.key,blocks:[],
        kind:kind,pair:!!r.pair,both:!!r.both,swing:r.swing==null?null:r.swing,spring:r.spring==null?0:r.spring,
        walk:r.walk==null?kind!=='hatch':!!r.walk,style:r.style==null?null:r.style,roll:!!r.roll,dir:1,
        drop:!!r.drop,rise:r.rise==null?null:r.rise,rate:r.rate==null?1:r.rate};
      if(r.open!=null&&!D.locked)D.open=D.target=Math.max(0,Math.min(1,+r.open||0));
      if(byId.has(D.id))throw new Error('KDOOR.add: id '+D.id+' is taken');
      for(var k in r)if(!CORE[k])D[k]=r[k];
      list.push(D);byId.set(D.id,D);return D;}
    function get(id){return id&&typeof id==='object'?id:byId.get(String(id))||null;}
    function open(id,op){var D=get(id);if(!D||D.locked)return false;op=op||{};
      if(D.both&&op.from&&D.open===0){var nx=Math.sin(D.yaw),nz=Math.cos(D.yaw);D.dir=((op.from[0]-D.at[0])*nx+(op.from[1]-D.at[2])*nz)>=0?1:-1;}
      D.target=1;D.by=op.by||'player';D.auto=op.auto!=null?op.auto:D.spring||0;return true;}
    function close(id,op){var D=get(id);if(!D)return false;D.target=0;D.by=(op&&op.by)||D.by;D.auto=0;return true;}
    function toggle(id,op){var D=get(id);if(!D)return false;return D.target>.5?close(D,op):open(D,op);}
    function lock(id,on,op){var D=get(id);if(!D)return false;D.locked=!!on;if(on){D.target=0;D.auto=0;}if(op&&op.asBuilt)D.locked0=D.locked;return true;}
    function nearest(x,y,z,r){r=r==null?2.2:r;var best=null,bd=r*r;
      for(var i=0;i<list.length;i++){var D=list[i];if(D.locked||Math.abs(y-D.at[1])>2.2)continue;
        var dx=x-D.at[0],dz=z-D.at[2],d=dx*dx+dz*dz;if(d<bd){bd=d;best=D;}}return best;}
    function setWalk(D,on){if(W&&W.setBlock)for(var i=0;i<D.blocks.length;i++)W.setBlock(D.blocks[i],on);}
    function step(dt){var moved=[];
      for(var i=0;i<list.length;i++){var D=list[i];
        if(D.auto&&D.target===1&&D.open>=1){D.auto-=dt;if(D.auto<=0){D.auto=0;D.target=0;}}
        if(D.open===D.target)continue;var was=D.open,v=dt*K.RATE/K.SWING*1.2*(D.rate==null?1:D.rate);
        D.open=D.target>D.open?Math.min(D.target,D.open+v):Math.max(D.target,D.open-v);
        if((was<.5)!==(D.open<.5)||D.open===0)setWalk(D,D.open<.5);
        if(D.open===0)D.dir=1;
        moved.push(D);}
      return moved;}
    function swingMax(D){return D.swing!=null?D.swing:D.kind==='fold'||D.kind==='tilt'?Math.PI/2*.94:K.SWING;}
    function angle(D){return(D.sign==null?1:D.sign)*(D.dir||1)*swingMax(D)*ease(D.open);}
    function leafCount(D){return(D.kind==='fold'?2:1)*((D.pair===true)?2:1);}
    function leafSize(D){if(D.kind==='lift'&&(D.pair===true))return[D.w,D.h/2,D.t];var w=(D.pair===true)?D.w/2:D.w;if(D.kind==='fold')w/=2;return[w,D.h,D.t];}
    // every leaf's pose (see the header). Shut: the leaves stand at p0 (a pair's at p0 -/+ a quarter of the width along the line)
    function leaves(D){var e=ease(D.open),yaw=D.yaw,u=[Math.cos(yaw),0,-Math.sin(yaw)],P0=D.p0,sz=leafSize(D),out=[];
      // a lift's pair: the halves meet across the middle height, the top rising its half, the bottom sinking into the floor
      if(D.kind==='lift'&&(D.pair===true)){var hh=D.h/4,r2=(D.rise==null?D.h/2:D.rise/2)*e;
        return[{p:[P0[0],P0[1]+hh+r2,P0[2]],ax:'y',ang:0,s:[1,1,1],size:sz},{p:[P0[0],P0[1]-hh-r2,P0[2]],ax:'y',ang:0,s:[1,1,1],size:sz}];}
      var sides=(D.pair===true)?[-1,1]:[D.sign<0?1:-1];   // the jamb each leaf (or panel set) is hung on: -1 the -x jamb, +1 the +x
      for(var si=0;si<sides.length;si++){var j=sides[si],half=(D.pair===true)?D.w/2:D.w,
          c0=(D.pair===true)?[P0[0]+u[0]*D.w/4*j,P0[1],P0[2]+u[2]*D.w/4*j]:P0.slice(),
          J=(D.pair===true)?[P0[0]+u[0]*D.w/2*j,P0[1],P0[2]+u[2]*D.w/2*j]:(D.kind==='swing'?[D.hinge[0],P0[1],D.hinge[2]]:[P0[0]+u[0]*half/2*j,P0[1],P0[2]+u[2]*half/2*j]),
          a=-j*(D.dir||1)*swingMax(D)*e;   // a leaf hung on the -x jamb turns +a (into the room), one on the +x jamb -a
        if(D.kind==='swing'){var v=rotY([c0[0]-J[0],0,c0[2]-J[2]],a);out.push({p:[J[0]+v[0],c0[1],J[2]+v[2]],ax:'y',ang:a,s:[1,1,1],size:sz});}
        else if(D.kind==='slide'){var d=half*e*j;out.push({p:[c0[0]+u[0]*d,c0[1],c0[2]+u[2]*d],ax:'y',ang:0,s:[1,1,1],size:sz});}
        else if(D.kind==='lift'){var rise=(D.rise==null?D.h:D.rise)*e*(D.drop?-1:1);
          if(D.roll){var r=Math.min(e,.97);out.push({p:[c0[0],c0[1]+D.h*r/2,c0[2]],ax:'y',ang:0,s:[1,1-r,1],size:sz});}
          else out.push({p:[c0[0],c0[1]+rise,c0[2]],ax:'y',ang:0,s:[1,1,1],size:sz});}
        else if(D.kind==='tilt'){var Hd=[c0[0],c0[1]+D.h/2,c0[2]],vt=[0,-D.h/2,0],bt=swingMax(D)*e,nx=Math.sin(yaw),nz=Math.cos(yaw),
            tp=rotAx(vt,u,.1),sg=(tp[0]*nx+tp[2]*nz)>0?1:-1,wt=rotAx(vt,u,sg*bt);   // the foot swings OUT (the outward side) and up
          out.push({p:[Hd[0]+wt[0],Hd[1]+wt[1],Hd[2]+wt[2]],ax:u,ang:sg*bt,s:[1,1,1],size:sz});}
        else if(D.kind==='iris'){var k=1-Math.min(e,.98);out.push({p:c0.slice(),ax:'y',ang:0,s:[k,k,1],size:sz});}
        else if(D.kind==='fold'){var q=sz[0],a1=a,v1=rotY([-j*u[0]*q,0,-j*u[2]*q],a1),E=[J[0]+v1[0],J[1],J[2]+v1[2]],v2=rotY([-j*u[0]*q,0,-j*u[2]*q],-a1);
          out.push({p:[J[0]+v1[0]/2,J[1],J[2]+v1[2]/2],ax:'y',ang:a1,s:[1,1,1],size:sz});
          out.push({p:[E[0]+v2[0]/2,E[1],E[2]+v2[2]/2],ax:'y',ang:-a1,s:[1,1,1],size:sz});}
        else if(D.kind==='hatch'){var H=D.at,vv=[c0[0]-H[0],c0[1]-H[1],c0[2]-H[2]],b=swingMax(D)*e,
            up=rotAx(vv,u,.1)[1]>vv[1]?1:-1,w2=rotAx(vv,u,up*b);
          out.push({p:[H[0]+w2[0],H[1]+w2[1],H[2]+w2[2]],ax:u,ang:up*b,s:[1,1,1],size:sz});}}
      return out;}
    function pose(D){var L=leaves(D)[0];return[L.p[0],L.p[1],L.p[2],L.ax==='y'?L.ang:0];}
    function walk(Wk){W=Wk||null;if(!W)return list.length;
      for(var i=0;i<list.length;i++){var D=list[i];if(D.walk===false)continue;var n=Math.max(2,Math.ceil(D.w/.3)),ux=Math.cos(D.yaw),uz=-Math.sin(D.yaw),hw=D.w/n/2,ht=Math.max(D.t,.3)/2;
        for(var j=0;j<n;j++){var u=-D.w/2+(j+.5)*D.w/n,cx=D.at[0]+ux*u,cz=D.at[2]+uz*u,r=Math.max(hw,ht);
          D.blocks.push(W.block([cx-r,cx+r,cz-r,cz+r,D.at[1],D.at[1]+D.h],'door:'+D.id));}
        if(D.open>0)setWalk(D,false);}   // a door built standing open (however far: the builder drew it passable): its doorway clear
      return list.length;}
    function clearDoorways(Wk,o){if(Wk&&!Wk.block&&o==null){o=Wk;Wk=null;}Wk=Wk||W;if(!Wk)return 0;var cleared=0,on=new Map(),i,j,all=!!(o&&o.locked);
      for(i=0;i<list.length;i++)for(j=0;j<list[i].blocks.length;j++){var B=list[i].blocks[j];on.set(B,!B.off);Wk.setBlock(B,false);}   // the leaves' own blocks aside while looking
      for(i=0;i<list.length;i++){var D=list[i];if((D.locked&&!all)||D.kind==='hatch')continue;var ux=Math.cos(D.yaw),uz=-Math.sin(D.yaw),n=Math.max(2,Math.ceil(D.w/.15));
        for(j=0;j<=n;j++){var u=-D.w/2+.08+(D.w-.16)*j/n,x=D.at[0]+ux*u,z=D.at[2]+uz*u,ys=[.3,1.2];
          for(var k=0;k<ys.length;k++){var b,g=0;while((b=Wk.blocked(x,D.at[1]+ys[k],z,.04,.05))&&g++<8){Wk.setBlock(b,false);cleared++;}}}}
      on.forEach(function(v,B){Wk.setBlock(B,v);});
      return cleared;}
    function prune(keep){var w=0;byId.clear();
      for(var i=0;i<list.length;i++)if(keep(list[i])){list[w++]=list[i];byId.set(list[i].id,list[i]);}
      list.length=w;return w;}
    function state(){var s={};for(var i=0;i<list.length;i++){var D=list[i];if(D.target>0||D.locked!==!!D.locked0)s[D.id]={open:D.target,locked:D.locked};}return s;}
    function load(s){for(var id in s){var D=byId.get(id);if(!D)continue;D.locked=!!s[id].locked;D.target=s[id].open>.5?1:0;}}
    function exp(){return{format:'krator-doors',version:1,convention:'y up, metres, x east, z south; yaw outward',
      swing:K.SWING,rate:K.RATE,
      doors:list.map(function(D){return{id:D.id,at:D.at,hinge:D.hinge,yaw:D.yaw,sign:D.sign,w:D.w,h:D.h,t:D.t,locked:D.locked,key:D.key,open:D.target,pivot:!!D.pivot,
        kind:D.kind,pair:D.pair===true,both:D.both,swing:D.swing,spring:D.spring,walk:D.walk,style:D.style,roll:D.roll,drop:D.drop,rise:D.rise,rate:D.rate};})};}
    K.add=function(r){var D=add(r);D.locked0=D.locked;return D;};
    K.get=get;K.leaves=leaves;K.leafSize=leafSize;K.leafCount=leafCount;K.open=open;K.close=close;K.toggle=toggle;K.lock=lock;K.nearest=nearest;K.step=step;K.angle=angle;K.pose=pose;
    K.walk=walk;K.clearDoorways=clearDoorways;K.prune=prune;K.state=state;K.load=load;K.export=exp;
    K.clear=function(){list.length=0;byId.clear();W=null;};
    return K;
  }
  var D=create();D.create=create;
  root.KDOOR=D;
})(typeof window!=='undefined'?window:globalThis);
