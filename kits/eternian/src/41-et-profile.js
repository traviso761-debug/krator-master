// prefix: et
// ================================================================= THE PROFILE HELPERS (kits/eternian/PLAN.md section 2, P1)
// The grammar the generator follows, as helpers that draw in the current frame (front +z): the stepped pier bundle, the
// lancet and the lancet bundle, the tracery grid (a grid first, a Gothic figure second), the cast pattern block, and the
// owner's sheets as surfaces: the pierced bronze screen, the circuit-maze band, the face frieze, the banner of the sign.
// 'screen' and 'maze' have alternate takes, picked per placed instance (38-et-alt.js).

/* ---------------------------------------------------------------- the stepped pier bundle: the master mass
   n piers across a front w wide and d deep, stepping up toward the middle in organ-pipe ranks (Grundtvig's Church,
   Hallgrimskirkja): a pier `rank` places in from the ends stands h0 + rank*step; every other pier projects 0.25 m, so the
   bundle reads as piers and not as a stepped slab; each pier ends in two set-backs. o.niches cuts a dark niche under each
   pier top for a figure (the head generator's, P2: R.niches holds each niche's foot); o.spire puts a spire of that height on the middle, a pier-head base
   and a four-sided verdigris needle. Returns {top, spireTop, xs, tops} (the piers' centres and their tops). */
function etPierBundle(o){o=o||{};const n=o.n||7,w=o.w||12,d=o.d||5,h0=o.h0==null?8:o.h0,st=o.step==null?1.6:o.step,mk=o.mk||'brick',col=o.col||P('brick');
 const pw=w/n,mid=(n-1)/2,R={xs:[],tops:[],top:0,spireTop:0,niches:[],pw:pw};
 for(let i=0;i<n;i++){const rank=mid-Math.abs(i-mid),h=h0+rank*st,x=-w/2+pw*(i+.5),pj=i%2?.25:0,cap1=pw*.35,cap2=pw*.3;
  box(mk,x,0,pj/2,pw*.98,h,d+pj,col);
  box(mk,x,h,pj/2,pw*.8,cap1,d*.8+pj,col);box(mk,x,h+cap1,pj/2,pw*.55,cap2,d*.6+pj,col);
  if(o.niches){box('stone',x,h-pw*1.5,(d+pj)/2+.005,pw*.52,pw*1.0,.04,P('stoneD'));R.niches.push([x,h-pw*1.5,(d+pj)/2]);}
  R.xs.push(x);R.tops.push(h+cap1+cap2);R.top=Math.max(R.top,h+cap1+cap2);}
 if(o.spire){const sb=pw*1.3,sh=o.spire;box(mk,0,R.top,0,sb,sh*.22,sb,col);
  cone(o.spireMk||'verdigris',0,R.top+sh*.22,0,sb*.66,sh*.78,o.spireCol||P('verdigris'),4);R.spireTop=R.top+sh;}
 return R;}

/* ---------------------------------------------------------------- the lancet: an equilateral pointed window
   w wide, h tall to its apex, its sill at y, centred on x, in the plane z: the points of its outline (the head's two
   arcs, each centred on the opposite spring), from the sill's left corner round */
function etLancetPts(x,y,w,h,z,seg){seg=seg||6;const ys=y+Math.max(0,h-w*.866),pts=[[x-w/2,y,z],[x+w/2,y,z],[x+w/2,ys,z]];
 for(let k=1;k<=seg;k++){const a=k/seg*PI/3;pts.push([x-w/2+w*Math.cos(a),ys+w*Math.sin(a),z]);}
 for(let k=1;k<seg;k++){const a=PI*2/3+k/seg*PI/3;pts.push([x+w/2+w*Math.cos(a),ys+w*Math.sin(a),z]);}
 pts.push([x-w/2,ys,z]);return pts;}
/* the height of the pointed head over xx (for clipping the tracery's mullions into it) */
function etLancetTop(x,y,w,h,xx){const ys=y+Math.max(0,h-w*.866),c=xx>=x?x-w/2:x+w/2;return ys+Math.sqrt(Math.max(0,w*w-(xx-c)*(xx-c)));}
/* a flat outline (a fan from its first point) with UVs in the wall's metres over the key's tile, so a library sheet maps
   onto it (poly() writes no UVs) */
function etPoly(mk,pts,col){const tl=TILE[mk]||1,pos=[],nor=[],uv=[],idx=[];const a=pts[0],b=pts[1],c=pts[2];
 const n=new THREE.Vector3().crossVectors(new THREE.Vector3(b[0]-a[0],b[1]-a[1],b[2]-a[2]),new THREE.Vector3(c[0]-a[0],c[1]-a[1],c[2]-a[2])).normalize();
 for(const p of pts){pos.push(p[0],p[1],p[2]);nor.push(n.x,n.y,n.z);uv.push(p[0]/tl,p[1]/tl);}for(let i=1;i<pts.length-1;i++)idx.push(0,i,i+1);
 emit(mk,fixWind(mkGeo(pos,nor,uv,idx)),null,col);}
/* one lancet set in a wall face at z: the dark reveal, the light (o.light: 'onyx', 'alabaster' or 'glass'), the tracery */
function etLancet(x,y,z,w,h,o){o=o||{};
 etPoly('stone',etLancetPts(x,y-.12,w+.24,h+.22,z+.01),P('stoneD'));
 const lt=o.light||'onyx';etPoly(lt,etLancetPts(x,y,w,h,z+.03),lt==='glass'?P('glass'):new THREE.Color(1,1,1));
 if(o.tracery!==false)etTracery(x,y,z+.06,w,h,{head:'pointed',mw:o.mw,th:o.th,col:o.barCol});}
/* a bundle of n lancets stepping up to the middle like the piers above them (the gate fronts, the ministries' halls),
   under a stepped Deco head, an oculus over the middle (o.oculus). Returns the bundle's top */
function etLancets(x,y,z,o){o=o||{};const n=o.n||5,w=o.w||1.1,g=o.gap==null?.35:o.gap,h=o.h||6,st=o.step==null?.7:o.step,mid=(n-1)/2;
 const W=n*w+(n-1)*g;let top=0;
 for(let i=0;i<n;i++){const hh=h-Math.abs(i-mid)*st,xx=x-W/2+w/2+i*(w+g);etLancet(xx,y,z,w,hh,o);top=Math.max(top,y+hh);}
 etStepHead(x,top+.25,z+.02,W,{col:o.headCol,mk:o.headMk||'lime'});
 if(o.oculus)etOculus(x,top+1.0+o.oculus,z+.06,o.oculus,{mk:o.headMk||'lime',col:o.headCol,lit:true});
 return top+.7;}

/* ---------------------------------------------------------------- the tracery grid: bronze bars over a light w x h at y
   (PLAN.md section 2: nobody can make the Ancients' glass, so a lost glass wall was filled with a bronze grid of small
   panes): mullions every o.mw, transoms every o.th, clipped to the head; o.head 'pointed' (the lancet's two arcs as bars),
   'stepped' (the head steps in), or 'flat' */
function etTracery(x,y,z,w,h,o){o=o||{};const mw=o.mw||.42,th=o.th||.55,bw=o.bw||.045,c=o.col||P('bronze'),head=o.head||'pointed';
 const topAt=xx=>head==='pointed'?etLancetTop(x,y,w,h,xx):head==='stepped'?y+h-Math.floor(Math.abs(xx-x)/(w/6))*.18:y+h;
 const nm=Math.max(1,Math.round(w/mw));
 for(let k=1;k<nm;k++){const xx=x-w/2+k*w/nm;box('bronze',xx,y,z,bw,topAt(xx)-y-bw,bw,c);}
 for(let yy=y+th;yy<y+h-.15;yy+=th){let a=x-w/2,b=x+w/2;
  if(head==='pointed'&&yy>y+Math.max(0,h-w*.866)){const dy=yy-(y+Math.max(0,h-w*.866)),half=w-Math.sqrt(Math.max(0,w*w-dy*dy));a=x-w/2+half;b=x+w/2-half;if(b-a<.1)continue;}
  box('bronze',(a+b)/2,yy,z,b-a,bw,bw,c);}
 if(head==='pointed'){const P2=etLancetPts(x,y,w,h,z).slice(2);for(let k=0;k<P2.length-1;k++)beam('bronze',P2[k],P2[k+1],bw*1.4,c);}
 for(const s of [-1,1])box('bronze',x+s*w/2,y,z,bw*1.4,Math.max(0,h-(head==='pointed'?w*.866:0)),bw*1.4,c);
 box('bronze',x,y,z,w,bw*1.4,bw*1.4,c);}

/* ---------------------------------------------------------------- the cast pattern block (Lloyd Wright's textile block):
   the canal town's breathing wall, in the library's cut stone tinted to block. Geometric, never glyphic */
function etPatternBlock(L,h,y0,z,o){return etBlockScreen(L,h,y0,z,o);}

/* ---------------------------------------------------------------- the owner's sheets as surfaces */
/* a band of a repeating sheet L long and h tall, its bottom at y, centred on x in the plane z: aspect is the sheet's
   width over its height (the maze 3, the frieze 2), so the motif keeps its proportions at any band height */
function etBand(mk,x,y,z,L,h,col,aspect){const m=TF(x,y+h/2,z);m.scale(new THREE.Vector3(L,h,1));emit(mk,gplane(),m,col||new THREE.Color(1,1,1),{su:L/((aspect||1)*h),sv:1});}
function etMazeBand(x,y,z,L,h,col){etBand('maze',x,y,z,L,h,col||P('gold'),3);}
function etFrieze(x,y,z,L,h,col){etBand('frieze',x,y,z,L,h,col||P('lime'),2);}
/* the pierced bronze screen: w x h at y in a bronze frame, one of the two takes per instance */
function etScreen(x,y,z,w,h,o){o=o||{};const m=TF(x,y+h/2,z);m.scale(new THREE.Vector3(w,h,1));
 emit('screen',gplane(),m,new THREE.Color(1,1,1),{su:w/(TILE.screen||2),sv:h/(TILE.screen||2)});
 const c=o.frameCol||P('bronze'),f=o.frame||.12;
 for(const s of [-1,1]){box('bronze',x+s*(w/2+f/2),y,z,f,h,f*1.4,c);box('bronze',x,y+(s<0?-f:h),z,w+2*f,f,f*1.4,c);}}
/* the banner of the sign: w wide, hanging h from its top at y (a cloth: it flutters) */
function etBanner(x,y,z,w,h){const m=TF(x,y-h/2,z+.02);m.scale(new THREE.Vector3(w,h,1));emit('sign',gplane(),m,new THREE.Color(1,1,1),{su:1,sv:1});
 box('bronze',x,y,z,w+.2,.08,.08,P('bronze'));}
