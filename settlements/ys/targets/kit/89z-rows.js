// TARGET: kit — the Hykkousoi kit sheet: every HYK.def laid out by row with its presets. TITLE is read by build.py.
// Free-standing rows run east–west on the land, fronts (+z) toward the camera, marching north from z = -40; the Harbour
// and Spans rows stand at the shore with their fronts to the water; grown-on rows hang on Scallop Stack hosts sunk in
// the sea to the east, one host per eleven pieces, pods on the plate at +37.25 in the lobe troughs, each host with its
// own way-in pod. Presets per piece: '<name> — front', '<name> — eye level', and '<name> inside' for anything lived in.
const TITLE='Ys — kit';
const GROUND_C=0;
const SITES=[];
const PORT_LAYOUT_DEF={items:[],stamps:[],runs:[]};
const KIT_ROWS=['Housing — poor','Housing — middle','Housing — rich','Grown-on housing','Shops','Grown-on shops','Hospitality','Sacred','Markets','Civic','Harbour','Industry','Military','Agriculture','Spans'];
const KIT_HOST_SINK=-25,KIT_POD_Y=37.25,KIT_WAY_A=-5*Math.PI/12;
function kitHostR(y,a){const yl=y-KIT_HOST_SINK;if(yl<32)return 16.5;return (26+10*Math.pow(clamp((yl-32)/300,0,1),1.4))*(a==null?1.28:1+.3*(.5+.5*Math.cos(12*a)));}
function kitHasInside(D){return D.inside===true||(D.tags.type||[]).some(t=>/dwelling|tavern|military/.test(t));}
const SHEET={rows:[],hosts:[],views:{}};
(function layout(){
 // a grown def in any row goes to a host under '<row> (grown)'; the two Grown-on rows are grown by name
 const byRow={};for(const k of HYK.order){const D=HYK.defs[k];let r=D.row||'Civic';if(D.grown&&!/^Grown-on/.test(r))r+=' (grown)';(byRow[r]||(byRow[r]=[])).push(D);}
 const rows=KIT_ROWS.concat(Object.keys(byRow).filter(r=>KIT_ROWS.indexOf(r)<0));
 const shoreZ={'Harbour':8,'Spans':-18};let z=-40;
 for(const r of rows){const items=byRow[r]||[];if(!items.length)continue;
  if(/^Grown-on|\(grown\)$/.test(r)){SHEET.rows.push({row:r,grown:true,items,hosts:[]});continue;}
  const depth=Math.max(16,...items.map(D=>D.d))+14,gap=10;const W=items.reduce((s,D)=>s+D.w+gap,0);
  const rz=shoreZ[r]!=null?shoreZ[r]:z;let x=-W/2;const rec={row:r,z:rz,x0:-W/2,x1:W/2,items:[]};
  for(const D of items){rec.items.push({D,x:x+D.w/2,z:rz});x+=D.w+gap;}
  SHEET.rows.push(rec);if(shoreZ[r]==null)z-=depth;}
 // the furniture row: every FURN piece on the ground, 4 m apart, with close presets
 if(typeof FURNS!=='undefined'&&FURNS.length){const gap=4;const W=FURNS.reduce((s,F)=>s+Math.max(F.w,F.d)+gap,0);let x=-W/2;const rec={row:'Furniture',z,x0:-W/2,x1:W/2,items:[],furn:true};
  for(const F of FURNS){const s=Math.max(F.w,F.d);rec.items.push({F,x:x+s/2,z});x+=s+gap;}SHEET.rows.push(rec);z-=24;}
 // the troughs of a Scallop Stack host (cos 12a = -1), minus the one its own way-in pod takes
 const TR=[];for(let k=0;k<12;k++){const a=Math.PI/12+k*Math.PI/6;if(Math.abs(Math.atan2(Math.sin(a-KIT_WAY_A),Math.cos(a-KIT_WAY_A)))<.1)continue;TR.push(a);}
 let hx=560,hz=-60;
 for(const rec of SHEET.rows.filter(r=>r.grown)){let i=0;while(i<rec.items.length){const H={x:hx,z:hz,n:'Kit host '+(SHEET.hosts.length+1),items:[],ways:[]};
   for(let k=0;k<TR.length&&i<rec.items.length;k++,i++){const D=rec.items[i];const a=TR[k];H.items.push({D,a,y:KIT_POD_Y,level:'L2',into:!!D.into});if(D.into)H.ways.push({a,y:KIT_POD_Y,R:D.w/2});}
   SHEET.hosts.push(H);rec.hosts.push(H);hz-=220;}}
 // presets
 const V=SHEET.views;V['Kit — overview']=[0,260,320,0,0,-220];V['Kit — the hosts']=[hx+260,120,-60+260,hx,30,-170];
 for(const rec of SHEET.rows){if(rec.grown)continue;const cx=(rec.x0+rec.x1)/2;V[rec.row+' — row']=[cx,rec.furn?12:34,rec.z+(rec.furn?30:95),cx,3,rec.z];
  if(rec.furn){for(const it of rec.items){const F=it.F,y0=3.2;const s=Math.max(F.w,F.d,F.h);V[F.name+' — front']=[it.x,y0+F.h*.6+.6,it.z+F.d/2+s*2+1.5,it.x,y0+F.h*.45,it.z];V[F.name+' — eye level']=[it.x+s*1.4+1,y0+1.6,it.z+s*1.4+1,it.x,y0+F.h*.5,it.z];}continue;}
  for(const it of rec.items){const D=it.D,y0=3.2;const dist=Math.max(D.w,D.h)*1.5+8;
   V[D.name+' — front']=[it.x,y0+D.h*.45+2,it.z+D.d/2+dist,it.x,y0+D.h*.35,it.z];
   V[D.name+' — eye level']=[it.x+D.w*.9+6,y0+1.7,it.z+D.d*.9+6,it.x,y0+1.6,it.z];
   if(kitHasInside(D))V[D.name+' inside']=[it.x+D.w*.8+4,y0+D.h+8,it.z+D.d*.8+5,it.x,y0+1.2,it.z,null,null,true];}}
 for(const H of SHEET.hosts){V[H.n+' — the host']=[H.x+170,70,H.z+170,H.x,30,H.z];
  for(const it of H.items){const D=it.D;const rs=kitHostR(it.y,it.a);const nx=Math.cos(it.a),nz=Math.sin(it.a);const px=H.x+rs*nx,pz=H.z+rs*nz;const R=Math.max(D.w,D.h)/2;
   V[D.name+' — front']=[px+nx*(R*3+8),it.y+R*.6+2,pz+nz*(R*3+8),px+nx*R*.5,it.y+R*.5,pz+nz*R*.5];
   V[D.name+' — eye level']=[px+nx*(R*2.2+3)-nz*(R+3),it.y+1.7,pz+nz*(R*2.2+3)+nx*(R+3),px+nx*R*.6,it.y+1.4,pz+nz*R*.6];
   if(kitHasInside(D))V[D.name+' inside']=[px+nx*R*2+R,it.y+R*2+6,pz+nz*R*2+R,px+nx*R*.4,it.y+1,pz+nz*R*.4,null,null,true];}}
})();
const YS_BUILD=[];
YS_BUILD.push(function(scene){
 for(const rec of SHEET.rows){if(rec.grown)continue;if(rec.furn){for(const it of rec.items){TSTAT.cur='furn/'+it.F.key;placeFurn(it.F.key,it.x,it.z,0,{y:terrainH(it.x,it.z),seed:3});}continue;}
  for(const it of rec.items){const D=it.D;TSTAT.cur=D.key+'/0';HYK.place(scene,D.key,it.x,it.z,0,{y:terrainH(it.x,it.z)});}}
 TSTAT.cur=null;
 for(const H of SHEET.hosts){const host=ysPlaceHost(scene,{key:'skyB',builder:buildSkyB,x:H.x,z:H.z,y:KIT_HOST_SINK,d:1,cutY:80,podium:52,cap:{hw:74},rAt:kitHostR,name:H.n,
   floors:{y0:37,pitch:5,top:.25},ways:[{a:KIT_WAY_A,y:KIT_POD_Y,R:4.0}].concat(H.ways),ring:2});
  hykTideline(host);hykAccrete(host,[{a:KIT_WAY_A,R:4.0,wealth:'middle',level:'L2',into:true}]);
  for(const it of H.items){TSTAT.cur=it.D.key+'/0';HYK.placeOn(scene,it.D.key,host,{y:it.y,a:it.a,level:it.level,into:it.into});}TSTAT.cur=null;}
 window._sheet={rows:SHEET.rows.length,defs:HYK.order.length,hosts:SHEET.hosts.length,views:Object.keys(SHEET.views).length};
});
