// ================================================================= CORE HOST — geodes drawn (KGEODE.draw)  [web]
// Draws KGEODE's records (39f-core-geode.js) and decides nothing: every piece is where its record put it, its mineral the record's
// (KGEODE.MINERALS: the crust's habit and the rind's palette). Instanced, one draw a piece and material:
//   NODULES    a whole geode (a loose one not broken): a knobbly rough ovoid, its skin grey-brown (the basalt's weathered rind)
//   SHELLS     a broken geode's half: a bowl, the skin outside
//   FACES      the cut face across a broken half: the rind's bands (agate, chalk, chrysocolla, watermelon, aura, metal) round the cavity,
//              wavy and parallel, in the vertex colour; one mesh a palette
//   DRUSE      the cavity inside the bands: a bowl of small faceted crystals pointing in (a white quartz band at the rim, the mineral's
//              colour deepening and darkening inward); chalcedony's a smooth botryoidal bowl instead
//   CRYSTALS   the larger ones in the cavity, by the mineral's crust: points (quartz and amethyst), blades (celestine), pillars
//              (chalcedony, standing up as stalactites grow), prisms (watermelon tourmaline, green at the foot, pink at the tip,
//              standing out of the face), hoppers (bismuth's stepped cubes); and every lining point KGEODE.line gave (the walk-in
//              geode's, graded by its depth: white at the rim, deep purple at the back)
// The gems are translucent with a cheap fake glow (no refraction) brighter at a grazing view and near the lamp; aura and bismuth take a
// thin-film iridescence instead (a hue by view angle). A broken geode stands proud of its ground: its cut face out along n by .62 of its
// radius. Colours per mineral are this file's MC (the host may pass o.colors to override one).
//
//   const G = KGEODE.draw(recs, {THREE, points (KGEODE.line's), maps {skin, agate, amethyst} (THREE textures or null), lamp (a uniform
//        {value} 0..1: a light near the eye's glow), tint (amethyst's colour, 0x8a5cc8), colors {mineral: {...MC row}}, chunk (240 m), range (1: a scale on the pieces'
//        ranges: shells and nodules 240 m, faces 170, druse and tourmaline 90, the other crystals 60)})
//     -> {group (not added), counts {name: instances}, tris, meshes, update(eye) (the host's tick: hides the chunks out of range)}
(function(root){
  'use strict';
  var K=root.KGEODE;if(!K)throw new Error('host/39g-core-geode-draw: load core/terrain/39f-core-geode.js first');
  /* the minerals' colours: bowl (the druse), gem (the crystals' foot), tip (their tip), iri (thin film) */
  var MC={amethyst:{bowl:0x8a5cc8,gem:0x8a5fc8,tip:0x5a2a9a},quartz:{bowl:0xdfe3ea,gem:0xe8ecf2,tip:0xf6f8fb},
    celestine:{bowl:0x5a88c0,gem:0xa8d0f4,tip:0xd8ecfa},chalcedony:{bowl:0x5fa8cc,gem:0x74c0dc,tip:0xb0e0ec},
    watermelon:{bowl:0xb49ad6,gem:0x2f8a52,tip:0xe0508a},aura:{bowl:0x2a3a8a,gem:0x3048a0,tip:0x3048a0,iri:2},bismuth:{bowl:0x707078,gem:0x9a9aa0,tip:0x9a9aa0,iri:1}};
  /* the rinds' bands, inner to outer: [r0, r1, rgb] on the unit face (the druse inside .66) */
  var RIND={
    agate:[[.66,.74,[.9,.9,.92]],[.74,.79,[.62,.68,.78]],[.79,.82,[.88,.88,.9]],[.82,.88,[.56,.53,.5]],[.88,.93,[.58,.42,.26]],[.93,.97,[.3,.27,.25]]],
    chalk:[[.66,.76,[.92,.93,.94]],[.76,.86,[.8,.8,.78]],[.86,.97,[.7,.7,.68]]],
    chrysocolla:[[.66,.71,[.76,.89,.93]],[.71,.74,[.92,.94,.95]],[.74,.84,[.14,.55,.56]],[.84,.92,[.1,.44,.3]],[.92,.97,[.42,.48,.42]]],
    watermelon:[[.66,.71,[.9,.86,.93]],[.71,.8,[.86,.44,.6]],[.8,.82,[.94,.92,.92]],[.82,.88,[.36,.58,.42]],[.88,.93,[.14,.3,.25]],[.93,.97,[.36,.38,.4]]],
    aura:[[.66,.97,[.2,.55,.62]]],
    metal:[[.66,.97,[.4,.4,.43]]]};
  var SEG=14;
  function wob(a){return 1+.035*Math.sin(3*a+.7)+.025*Math.sin(5*a+2.1);}   /* the bands' shared wave (the druse's rim takes it too) */
  K.draw=function(recs,o){o=o||{};var T=o.THREE||root.THREE;if(!T)throw new Error('KGEODE.draw: THREE');var R=root.KRAND,M=o.maps||{},pts=o.points||[];
    var col=function(min,k){var c=(o.colors&&o.colors[min]&&o.colors[min][k]!=null)?o.colors[min][k]:(min==='amethyst'&&k!=='tip'&&o.tint!=null?o.tint:(MC[min]||MC.amethyst)[k]);return new T.Color(c);};
    var u=function(id,k){var h=0;for(var i=0;i<id.length;i++)h=(h*31+id.charCodeAt(i))|0;return R.unit(R.hash(h,k));};
    // ---- the unit pieces (radius 1, the cut face on y = 0 looking +y; a crystal along +y, 0..1)
    function knobbly(g,amt){var p=g.attributes.position,v=new T.Vector3();for(var i=0;i<p.count;i++){v.fromBufferAttribute(p,i);var k=1+amt*(Math.sin(v.x*7.1+v.y*3.3)*Math.sin(v.z*6.7-v.y*5.1));p.setXYZ(i,v.x*k,v.y*k,v.z*k);}g.computeVertexNormals();return g;}
    function soup(P,A,name){var g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(P,3));g.setAttribute(name,new T.Float32BufferAttribute(A,1));
      var U=[];for(var i=0;i<P.length;i+=3)U.push(P[i]*.5+.5,P[i+2]*.5+.5+P[i+1]*.3);g.setAttribute('uv',new T.Float32BufferAttribute(U,2));g.computeVertexNormals();return g;}
    var gNod=knobbly(new T.IcosahedronGeometry(1,1),.08);
    var gShell=knobbly(new T.SphereGeometry(1,SEG,4,0,Math.PI*2,Math.PI/2,Math.PI/2),.05);   /* the lower half: a bowl under y = 0, open upward */
    /* a face: the rind's bands as flat-coloured annuli, all on one wave */
    function face(bands){var P=[],C=[],I=[],U=[],v0=0;bands.forEach(function(b){for(var s=0;s<=SEG;s++){var a=s/SEG*Math.PI*2,w=wob(a);
        [b[0],b[1]].forEach(function(rr){P.push(Math.cos(a)*rr*w,0,Math.sin(a)*rr*w);C.push(b[2][0],b[2][1],b[2][2]);U.push(Math.cos(a)*rr*.5+.5,Math.sin(a)*rr*.5+.5);});}
      for(var t=0;t<SEG;t++){var a0=v0+t*2,b0=a0+2;I.push(a0,a0+1,b0,b0,a0+1,b0+1);}v0+=(SEG+1)*2;});
      var g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(P,3));g.setAttribute('color',new T.Float32BufferAttribute(C,3));g.setAttribute('uv',new T.Float32BufferAttribute(U,2));
      g.setIndex(I);g.computeVertexNormals();return g;}
    /* the druse: a bowl (radius .66, squashed to .85 deep) whose every quad is a little pyramid pointing in; aDepth 0 at the rim, 1 at the bottom */
    var RB=.66,BY=.85;
    function bowlPt(s,v,V){var a=s/SEG*Math.PI*2,th=Math.PI/2*(1-v/V),w=wob(a)*RB;return [Math.cos(a)*Math.sin(th)*w,-Math.cos(th)*RB*BY,Math.sin(a)*Math.sin(th)*w,Math.cos(th)];}
    var gDruse=(function(){var V=4,P=[],A=[];for(var v=0;v<V;v++)for(var s=0;s<SEG;s++){var q=[bowlPt(s,v,V),bowlPt(s+1,v,V),bowlPt(s+1,v+1,V),bowlPt(s,v+1,V)];
        var c=[0,0,0,0];q.forEach(function(p){for(var k=0;k<4;k++)c[k]+=p[k]/4;});var kin=.05+.09*R.unit(R.hash(0x6E5,v,s));var ap=[c[0]*(1-kin),c[1]*(1-kin*.6),c[2]*(1-kin),c[3]];
        for(var e=0;e<4;e++){var p0=q[e],p1=q[(e+1)%4];[p0,ap,p1].forEach(function(p){P.push(p[0],p[1],p[2]);A.push(p[3]);});}}   /* wound so the face looks in */
      return soup(P,A,'aDepth');})();
    var gBotry=(function(){var V=6,S=SEG*2,pos=[],A=[],I=[];for(var v=0;v<=V;v++)for(var s=0;s<=S;s++){var a=s/S*Math.PI*2,th=Math.PI/2*(1-v/V)+(v===V?.0:0),w=wob(a)*RB;
        var b=1-.07*Math.abs(Math.sin(a*7+v*1.3)*Math.sin(th*9));pos.push(Math.cos(a)*Math.sin(th)*w*b,-Math.cos(th)*RB*BY*b,Math.sin(a)*Math.sin(th)*w*b);A.push(Math.cos(th));}
      for(v=0;v<V;v++)for(s=0;s<S;s++){var i0=v*(S+1)+s,i1=i0+1,i2=i0+S+1,i3=i2+1;I.push(i0,i1,i2,i1,i3,i2);}
      var g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setAttribute('aDepth',new T.Float32BufferAttribute(A,1));
      var U=[];for(var k=0;k<pos.length;k+=3)U.push(pos[k]+.5,pos[k+2]+.5);g.setAttribute('uv',new T.Float32BufferAttribute(U,2));g.setIndex(I);g.computeVertexNormals();return g;})();
    /* a crystal: an n-sided prism 0..h0 (radius .5, z squashed by sz) and its tip to 1 (ht 0: a flat cap); aAlong 0 at the foot, 1 at the tip */
    function prism(n,h0,sz,flat){var P=[],A=[],rim=function(k,y){var a=k/n*Math.PI*2+Math.PI/n;return [Math.cos(a)*.5,y,Math.sin(a)*.5*sz];};
      var tri=function(a,b,c){[a,b,c].forEach(function(p){P.push(p[0],p[1],p[2]);A.push(Math.max(0,Math.min(1,p[1])));});};
      for(var k=0;k<n;k++){var a0=rim(k,0),a1=rim(k+1,0),b0=rim(k,h0),b1=rim(k+1,h0);tri(a0,b0,a1);tri(a1,b0,b1);
        if(flat)tri(b0,[0,h0,0],b1);else tri(b0,[0,1,0],b1);}
      return soup(P,A,'aAlong');}
    var gPoint=prism(6,.7,1,false),gBlade=prism(4,.82,.32,false),gPrism=prism(6,1,1,true);
    var gPillar=(function(){var g=new T.LatheGeometry([new T.Vector2(0.001,0),new T.Vector2(.5,0),new T.Vector2(.5,.78),new T.Vector2(.44,.9),new T.Vector2(.28,.98),new T.Vector2(0.001,1)],8);
      var p=g.attributes.position,A=[];for(var i=0;i<p.count;i++)A.push(p.getY(i));g.setAttribute('aAlong',new T.Float32BufferAttribute(A,1));return g;})();
    /* a bismuth hopper: square frames stepping down and in (the hollowed faces of a hopper crystal), as boxes in a triangle soup */
    var gHopper=(function(){var P=[],A=[];function box(x0,x1,y0,y1,z0,z1){var c=[[x0,y0,z0],[x1,y0,z0],[x1,y1,z0],[x0,y1,z0],[x0,y0,z1],[x1,y0,z1],[x1,y1,z1],[x0,y1,z1]];
        [[0,3,2,1],[4,5,6,7],[0,1,5,4],[3,7,6,2],[0,4,7,3],[1,2,6,5]].forEach(function(f){[[f[0],f[1],f[2]],[f[0],f[2],f[3]]].forEach(function(t){t.forEach(function(i){P.push(c[i][0],c[i][1],c[i][2]);A.push(c[i][1]);});});});}
      for(var k=0;k<4;k++){var o2=.5-k*.11,i2=o2-.08,y1=.55-k*.13;box(-o2,o2,0,y1,-o2,-i2);box(-o2,o2,0,y1,i2,o2);box(-o2,-i2,0,y1,-i2,i2);box(i2,o2,0,y1,-i2,i2);}
      box(-.06,.06,0,.06,-.06,.06);return soup(P,A,'aAlong');})();
    // ---- the materials: one KHOOK layer each, from what the material reads (aDepth, aAlong + aCol2, aIri), with the glow it takes
    var lamp=o.lamp||{value:0},G=root.KHOOK.glf;
    /* aIri: 0 none, 1 a full rainbow film (bismuth's oxide), 2 aura's (teal, blue, violet, a little gold) */
    var KPAL='vec3 kPal(float h){h=fract(h)*4.0;vec3 a=vec3(0.08,0.62,0.68),b=vec3(0.12,0.28,0.9),c=vec3(0.5,0.18,0.82),d=vec3(0.82,0.66,0.22);'+
      'return h<1.0?mix(a,b,h):h<2.0?mix(b,c,h-1.0):h<3.0?mix(c,d,h-2.0):mix(d,a,h-3.0);}\n';
    function mk(name,base,f){var m=new T.MeshStandardMaterial(base),vh='attribute float aIri;varying float vIri;\n',va='vIri=aIri;',fh='uniform float uLamp;varying float vIri;\n'+KPAL,cf='',ef='';
      if(f.depth){vh+='attribute float aDepth;varying float vDepth;\n';va+='vDepth=aDepth;';fh+='varying float vDepth;\n';
        cf+='diffuseColor.rgb=mix(diffuseColor.rgb,vec3(0.86,0.86,0.9),(1.0-smoothstep(0.03,0.16,vDepth))*(1.0-min(vIri,1.0)));diffuseColor.rgb*=mix(1.0,0.3,smoothstep(0.5,1.0,vDepth));';}
      if(f.along){vh+='attribute float aAlong;attribute vec3 aCol2;varying float vAlong;varying vec3 vCol2;\n';va+='vAlong=aAlong;vCol2=aCol2;';fh+='varying float vAlong;varying vec3 vCol2;\n';
        cf+='diffuseColor.rgb=mix(diffuseColor.rgb,diffuseColor.rgb/max(vColor,vec3(0.02))*vCol2,smoothstep(0.6,0.82,vAlong));';}
      ef='{vec3 V=normalize(vViewPosition);float c=abs(dot(normalize(normal),V));float th=1.0-c;'+
        'float iw=min(vIri,1.0),hh=fract(1.4*c+1.1*(vViewPosition.x+0.7*vViewPosition.y));vec3 ir=vIri>1.5?kPal(hh):0.5+0.5*cos(6.2832*(hh+vec3(0.0,0.33,0.67)));'+
        'diffuseColor.rgb=mix(diffuseColor.rgb,ir*ir*0.55,iw*0.95);totalEmissiveRadiance+=ir*ir*0.06*iw;';
      if(f.glow)ef+='totalEmissiveRadiance+=diffuseColor.rgb*('+G(f.glow*.16)+'+'+G(f.glow*.9)+'*uLamp*exp(-length(vViewPosition)/9.0))*(0.35+0.65*th*th)*(1.0-iw)'+(f.depth?'*(1.0-0.8*vDepth)':'')+';';
      ef+='}';var at=[];if(cf)at.push({at:'color_fragment',after:'{'+cf+'}'});at.push({at:'emissivemap_fragment',after:ef});
      root.KHOOK.add(m,name,{uniforms:function(){return {uLamp:lamp};},vertex:{head:vh,at:[{at:'begin_vertex',after:va}]},fragment:{head:fh,at:at}},{key:name});return m;}
    var mSkin=new T.MeshStandardMaterial({color:0x8a8078,roughness:.95,metalness:0,map:M.skin||null});
    var mShell=new T.MeshStandardMaterial({color:0x7a726c,roughness:.95,metalness:0,map:M.skin||null,side:T.DoubleSide});
    var mFace=mk('kgeode-face',{color:0xffffff,roughness:.35,metalness:0,vertexColors:true,map:M.agate||null,side:T.DoubleSide},{});
    var mDruse=mk('kgeode-druse',{color:0xffffff,roughness:.25,metalness:.05,map:M.amethyst||null,flatShading:true,side:T.DoubleSide},{depth:true,glow:.7});
    var mBotry=mk('kgeode-botryoidal',{color:0xffffff,roughness:.45,metalness:0,side:T.DoubleSide},{depth:true,glow:.5});
    var mGem=mk('kgeode-gem',{color:0xffffff,roughness:.12,metalness:0,map:M.amethyst||null,transparent:true,opacity:.86,flatShading:true},{along:true,glow:1});
    var mPillar=mk('kgeode-pillar',{color:0xffffff,roughness:.4,metalness:0,transparent:true,opacity:.9},{along:true,glow:.6});
    var mMetal=mk('kgeode-hopper',{color:0xffffff,roughness:.22,metalness:.85,flatShading:true,side:T.DoubleSide},{along:true});
    // ---- the instances, in buckets (a piece and a material) split into chunks (o.chunk m square, 240): each chunk one mesh, shown while the eye
    //      is within the bucket's range of it (update(eye), the host's tick); its instance colour, second colour and film
    var CH=o.chunk==null?240:o.chunk,RS=o.range==null?1:o.range;
    var B={},m4=new T.Matrix4(),q=new T.Quaternion(),q2=new T.Quaternion(),up=new T.Vector3(0,1,0),v=new T.Vector3(),sc=new T.Vector3(),dn=new T.Vector3(),WH=new T.Color(1,1,1);
    function bucket(key,geo,mat,label,range){return B[key]||(B[key]={geo:geo,mat:mat,label:label,range:range*RS,ch:{}});}
    function rot(dir,spin){dn.set(dir[0],dir[1],dir[2]).normalize();q.setFromUnitVectors(up,dn);q2.setFromAxisAngle(dn,spin);return q.premultiply(q2);}
    function put(b,x,y,z,qq,sx,sy,sz,c,c2,iri){var ci=Math.floor(x/CH),cj=Math.floor(z/CH),key=ci+','+cj,h=b.ch[key]||(b.ch[key]={i:ci,j:cj,M:[],C:[],C2:[],I:[]});
      m4.compose(v.set(x,y,z),qq,sc.set(sx,sy,sz));h.M.push(m4.toArray());c=c||WH;c2=c2||c;h.C.push(c.r,c.g,c.b);h.C2.push(c2.r,c2.g,c2.b);h.I.push(+iri||0);}
    var faceB={};Object.keys(RIND).forEach(function(k){faceB[k]=bucket('face:'+k,face(RIND[k]),mFace,'A geode broken open (its rind: '+k+')',170);});
    var bNod=bucket('nodules',gNod,mSkin,'A geode, whole (a knobbly nodule weathered out of the flow top)',240),bShell=bucket('shells',gShell,mShell,'A geode broken open (its shell)',240);
    var bDruse=bucket('druse',gDruse,mDruse,'A geode broken open (its druse)',90),bBotry=bucket('botryoidal',gBotry,mBotry,'A geode broken open (botryoidal chalcedony)',90);
    var bPoint=bucket('points',gPoint,mGem,'Crystal points',60),bBlade=bucket('blades',gBlade,mGem,'Celestine blades',60),bPrism=bucket('prisms',gPrism,mGem,'Watermelon tourmaline',90),
      bPillar=bucket('pillars',gPillar,mPillar,'Chalcedony pillars',60),bHopper=bucket('hoppers',gHopper,mMetal,'Bismuth hoppers',60);
    /* one broken half: its frame (centre, rotation, scales), its shell, face, druse and crystals */
    var lp=new T.Vector3(),ld=new T.Vector3(),gm=new T.Matrix4(),gq=new T.Quaternion();
    function half(r,id,cx,cy,cz,dir,spin){var min=K.MINERALS[r.mineral]?r.mineral:'amethyst',MI=K.MINERALS[min],mc=MC[min]||MC.amethyst,iri=mc.iri||0,sh=r.shape||[1,1];
      var sx=r.r*sh[0],sz=r.r*sh[1],qq=rot(dir,spin).clone();gq.copy(qq);gm.compose(v.set(cx,cy,cz),gq,sc.set(sx,r.r,sz));
      put(bShell,cx,cy,cz,qq,sx,r.r,sz);put(faceB[MI.rind]||faceB.agate,cx,cy,cz,qq,sx,r.r,sz,null,null,MI.rind==='aura'?2:0);
      put(MI.crust==='pillars'?bBotry:bDruse,cx,cy,cz,qq,sx,r.r,sz,col(min,'bowl'),null,iri);
      var n=Math.max(3,Math.min(7,Math.round(2+r.r*9))),gem=col(min,'gem'),tip=col(min,'tip');
      for(var k=0;k<n;k++){var a=k/n*Math.PI*2+u(id,k)*1.3,th=(MI.crust==='hoppers'?1.3:1.0)*u(id,10+k);
        var w=wob(a)*RB;lp.set(Math.cos(a)*Math.sin(th)*w,-Math.cos(th)*RB*BY,Math.sin(a)*Math.sin(th)*w);
        var inward=[-lp.x,-lp.y*.6+.35,-lp.z];ld.set(inward[0],inward[1],inward[2]).normalize().applyQuaternion(gq);lp.multiplyScalar(.97).applyMatrix4(gm);
        var t=u(id,30+k),sp=u(id,40+k)*6.3;
        if(MI.crust==='points'){var L=r.r*(.36+.36*t);put(bPoint,lp.x,lp.y,lp.z,rot([ld.x,ld.y,ld.z],sp),L*.36,L,L*.36,gem,tip,iri);}
        else if(MI.crust==='blades'){if(k>=5)continue;var Lb=r.r*(.45+.4*t);put(bBlade,lp.x,lp.y,lp.z,rot([ld.x,ld.y,ld.z],sp),Lb*.62,Lb,Lb*.62,gem,tip,false);}
        else if(MI.crust==='pillars'){var Lp=r.r*(.22+.3*t);put(bPillar,lp.x,lp.y,lp.z,rot([0,1,0],sp),r.r*.13,Lp,r.r*.13,gem,tip,false);}
        else if(MI.crust==='prisms'){if(k>=6)continue;lp.set(Math.cos(a)*.2*t,-.42,Math.sin(a)*.2*t).applyMatrix4(gm);ld.set(Math.cos(a)*.07+.2,1,Math.sin(a)*.07).normalize().applyQuaternion(gq);
          var Lt=r.r*(1.05+.55*t);put(bPrism,lp.x,lp.y,lp.z,rot([ld.x,ld.y,ld.z],sp),Lt*.11,Lt,Lt*.11,gem,tip,false);}
        else if(MI.crust==='hoppers'){var Lh=r.r*(.22+.22*t);put(bHopper,lp.x,lp.y,lp.z,rot([ld.x,ld.y,ld.z],sp),Lh,Lh,Lh,WH,WH,true);}}}
    recs.forEach(function(r){var n=r.n||[0,1,0],sh=r.shape||[1,1];
      if(!r.split){var tl=r.tilt||0;put(bNod,r.x,r.y+r.r*.55,r.z,rot([Math.sin(tl)*Math.cos(r.az),Math.cos(tl),Math.sin(tl)*Math.sin(r.az)],r.az),r.r*sh[0],r.r*.85,r.r*sh[1]);return;}
      /* a broken half: its face along n (a wall geode's out of the cliff; a loose one's up, tipped a little); half proud of its ground: the face
         out by .62 of its radius (the druse's bottom clear of the ground), half the bowl still in the rock (the ground's mesh is not cut: a cavity under it would not show) */
      var dir=r.kind==='wall'?n:[Math.sin(r.tilt)*Math.cos(r.az)*.6,1,Math.sin(r.tilt)*Math.sin(r.az)*.6],dl0=Math.hypot(dir[0],dir[1],dir[2]);dir=[dir[0]/dl0,dir[1]/dl0,dir[2]/dl0];
      var out=r.r*.62;half(r,r.id,r.x+dir[0]*out,r.y+dir[1]*out,r.z+dir[2]*out,dir,r.az);
      /* its other half beside it (the record's pair), its face tipped away from the first */
      if(r.pair){var px=r.pair.x-r.x,pz=r.pair.z-r.z,pl=Math.hypot(px,pz)||1,d2=[px/pl*.45,1,pz/pl*.45],l2=Math.hypot(d2[0],d2[1],d2[2]);d2=[d2[0]/l2,d2[1]/l2,d2[2]/l2];
        half(r,r.id+'/2',r.pair.x+d2[0]*out,r.pair.y+d2[1]*out,r.pair.z+d2[2]*out,d2,r.az+Math.PI);}});
    /* the lining (KGEODE.line's): white quartz at the rim, the mineral's colour deepening to the back */
    pts.forEach(function(p){var min=MC[p.mineral]?p.mineral:'amethyst',dp=p.depth==null?.6:p.depth,g=new T.Color(0xe4e2ea).lerp(col(min,'gem'),Math.min(1,dp*2.4)).lerp(col(min,'tip'),Math.max(0,dp-.45)*1.4);
      put(bPoint,p.x-p.d[0]*.02,p.y-p.d[1]*.02,p.z-p.d[2]*.02,rot(p.d,p.spin),p.len*p.w,p.len,p.len*p.w,g,g.clone().multiplyScalar(.82),MC[min].iri||0);});
    // ---- the meshes: one a bucket's chunk, its centre and reach kept for update()
    var grp=new T.Group();grp.name='geodes';var tris=0,counts={},live=[];
    Object.keys(B).forEach(function(key){var b=B[key];counts[key]=0;Object.keys(b.ch).sort().forEach(function(ck){var h=b.ch[ck],n=h.M.length;if(!n)return;counts[key]+=n;
      var geo=b.geo.clone();geo.setAttribute('aIri',new T.InstancedBufferAttribute(new Float32Array(h.I),1));geo.setAttribute('aCol2',new T.InstancedBufferAttribute(new Float32Array(h.C2),3));
      var im=new T.InstancedMesh(geo,b.mat,n);for(var i=0;i<n;i++)im.instanceMatrix.array.set(h.M[i],i*16);im.instanceMatrix.needsUpdate=true;
      im.instanceColor=new T.InstancedBufferAttribute(new Float32Array(h.C),3);if(im.computeBoundingSphere)im.computeBoundingSphere();
      im.name='geodes:'+key+'@'+ck;im.userData.host=true;im.userData.geode=true;im.userData.inspectLabel=b.label;if(b.mat.transparent)im.renderOrder=2;grp.add(im);
      var cy=0;for(i=0;i<n;i++)cy+=h.M[i][13]/n;live.push({m:im,x:(h.i+.5)*CH,y:cy,z:(h.j+.5)*CH,r:b.range+CH*.75});
      tris+=n*(geo.index?geo.index.count:geo.attributes.position.count)/3;});});
    /* update(eye): each chunk shown while the eye is within its bucket's range of the chunk (a whole chunk at once: no pop inside one) */
    function update(e){if(!e)return;for(var i=0;i<live.length;i++){var L=live[i],dx=e.x-L.x,dy=e.y-L.y,dz=e.z-L.z;L.m.visible=dx*dx+dy*dy+dz*dz<L.r*L.r;}}
    return {group:grp,counts:counts,tris:Math.round(tris),meshes:live.length,update:update};};
})(typeof window!=='undefined'?window:globalThis);
