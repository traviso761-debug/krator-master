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
//   D.add({id, at, hinge, yaw, w, h, t, sign, p0, locked, key})  a door; returns its record
//        id      stable id (a building's key and an index, say); default 'door.<n>'
//        at      [x,y,z] the middle of the doorway's line at the sill, world
//        hinge   [x,y,z] the hinge line's foot, world (the jamb the leaf turns on)
//        yaw     the face's outward yaw; sign +1 (hinged on the -x jamb, the default) or -1 (on +x: a double door's right leaf)
//        w h t   the leaf's width, height and thickness (world)
//        p0      [x,y,z] the leaf's centre when shut (default at, raised h/2); pose() turns it about the hinge
//        locked  a door that does not open (a solid body's door: nothing behind it); key: the owner (a def's key)
//        any other field is kept on the record (a host's draw handle, a builder's own index)
//   D.get(id)                           the record (or the record itself)
//   D.open(id, {by, auto}) / close(id, {by}) / toggle(id, o)   false when locked or missing. by: 'player' | 'npc' | a name;
//                                       auto: seconds the door stays open before it shuts itself
//   D.lock(id, on)                      lock (shutting it) or unlock
//   D.nearest(x, y, z, r)               the nearest unlocked door whose sill is within r (2.2) in plan and 2.2 in height
//   D.step(dt)                          ease every moving door (RATE rad/s over SWING rad); switch its walk blocks as it
//                                       passes half open; returns the doors that moved (the host poses those)
//   D.angle(rec)                        the leaf's swing now (rad, signed); D.pose(rec) -> [x, y, z, a]: its centre and swing
//   D.walk(W)                           once the world is built: each door's doorway as small blocks along its line in W
//                                       (core/walk), shut = on; returns the number of doors
//   D.clearDoorways(W)                  switch off any OTHER block standing in a doorway (a room wall whose gap is narrower
//                                       or set beside the door); returns how many were switched off
//   D.prune(keep)                       drop the doors keep(rec) refuses (a placement that was unwound), in place
//   D.state() / D.load(state)           the deltas a save keeps: {id: {open, locked}} for every door not shut and unlocked
//   D.export()                          {format:'krator-doors', version, doors:[...]}: the records for Godot (no draw handles)
(function(root){
  function create(o){
    o=o||{};
    var list=[],byId=new Map(),W=null;
    var K={list:list,SWING:o.swing==null?1.75:o.swing,RATE:o.rate==null?1.6:o.rate};
    var CORE={id:1,at:1,hinge:1,yaw:1,sign:1,w:1,h:1,t:1,p0:1,open:1,target:1,locked:1,by:1,auto:1,key:1,blocks:1};
    function add(r){
      if(!r||!r.at||!r.hinge||!(r.w>0)||!(r.h>0))throw new Error('KDOOR.add: at, hinge, w and h required');
      var D={id:r.id==null?'door.'+list.length:String(r.id),at:r.at.slice(),hinge:r.hinge.slice(),yaw:r.yaw==null?0:r.yaw,
        sign:r.sign==null?1:(r.sign<0?-1:1),w:r.w,h:r.h,t:r.t==null?.07:r.t,
        p0:r.p0?r.p0.slice():[r.at[0],r.at[1]+r.h/2,r.at[2]],
        open:0,target:0,locked:!!r.locked,by:null,auto:0,key:r.key==null?null:r.key,blocks:[]};
      if(byId.has(D.id))throw new Error('KDOOR.add: id '+D.id+' is taken');
      for(var k in r)if(!CORE[k])D[k]=r[k];
      list.push(D);byId.set(D.id,D);return D;}
    function get(id){return id&&typeof id==='object'?id:byId.get(String(id))||null;}
    function open(id,op){var D=get(id);if(!D||D.locked)return false;op=op||{};D.target=1;D.by=op.by||'player';D.auto=op.auto||0;return true;}
    function close(id,op){var D=get(id);if(!D)return false;D.target=0;D.by=(op&&op.by)||D.by;D.auto=0;return true;}
    function toggle(id,op){var D=get(id);if(!D)return false;return D.target>.5?close(D,op):open(D,op);}
    function lock(id,on){var D=get(id);if(!D)return false;D.locked=!!on;if(on){D.target=0;D.auto=0;}return true;}
    function nearest(x,y,z,r){r=r==null?2.2:r;var best=null,bd=r*r;
      for(var i=0;i<list.length;i++){var D=list[i];if(D.locked||Math.abs(y-D.at[1])>2.2)continue;
        var dx=x-D.at[0],dz=z-D.at[2],d=dx*dx+dz*dz;if(d<bd){bd=d;best=D;}}return best;}
    function setWalk(D,on){if(W&&W.setBlock)for(var i=0;i<D.blocks.length;i++)W.setBlock(D.blocks[i],on);}
    function step(dt){var moved=[];
      for(var i=0;i<list.length;i++){var D=list[i];
        if(D.auto&&D.target===1&&D.open>=1){D.auto-=dt;if(D.auto<=0){D.auto=0;D.target=0;}}
        if(D.open===D.target)continue;var was=D.open,v=dt*K.RATE/K.SWING*1.2;
        D.open=D.target>D.open?Math.min(D.target,D.open+v):Math.max(D.target,D.open-v);
        if((was<.5)!==(D.open<.5)||D.open===0)setWalk(D,D.open<.5);
        moved.push(D);}
      return moved;}
    function angle(D){var s=D.open;return(D.sign==null?1:D.sign)*K.SWING*(s*s*(3-2*s));}
    function pose(D){var a=angle(D),c=Math.cos(a),s=Math.sin(a),H=D.hinge,dx=D.p0[0]-H[0],dz=D.p0[2]-H[2];
      return[H[0]+dx*c+dz*s,D.p0[1],H[2]-dx*s+dz*c,a];}
    function walk(Wk){W=Wk||null;if(!W)return list.length;
      for(var i=0;i<list.length;i++){var D=list[i],n=Math.max(2,Math.ceil(D.w/.3)),ux=Math.cos(D.yaw),uz=-Math.sin(D.yaw),hw=D.w/n/2,ht=Math.max(D.t,.3)/2;
        for(var j=0;j<n;j++){var u=-D.w/2+(j+.5)*D.w/n,cx=D.at[0]+ux*u,cz=D.at[2]+uz*u,r=Math.max(hw,ht);
          D.blocks.push(W.block([cx-r,cx+r,cz-r,cz+r,D.at[1],D.at[1]+D.h],'door:'+D.id));}}
      return list.length;}
    function clearDoorways(Wk){Wk=Wk||W;if(!Wk)return 0;var cleared=0,on=new Map(),i,j;
      for(i=0;i<list.length;i++)for(j=0;j<list[i].blocks.length;j++){var B=list[i].blocks[j];on.set(B,!B.off);Wk.setBlock(B,false);}   // the leaves' own blocks aside while looking
      for(i=0;i<list.length;i++){var D=list[i],ux=Math.cos(D.yaw),uz=-Math.sin(D.yaw),n=Math.max(2,Math.ceil(D.w/.15));
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
      doors:list.map(function(D){return{id:D.id,at:D.at,hinge:D.hinge,yaw:D.yaw,sign:D.sign,w:D.w,h:D.h,t:D.t,locked:D.locked,key:D.key};})};}
    K.add=function(r){var D=add(r);D.locked0=D.locked;return D;};
    K.get=get;K.open=open;K.close=close;K.toggle=toggle;K.lock=lock;K.nearest=nearest;K.step=step;K.angle=angle;K.pose=pose;
    K.walk=walk;K.clearDoorways=clearDoorways;K.prune=prune;K.state=state;K.load=load;K.export=exp;
    K.clear=function(){list.length=0;byId.clear();W=null;};
    return K;
  }
  var D=create();D.create=create;
  root.KDOOR=D;
})(typeof window!=='undefined'?window:globalThis);
