// ================================================================= LONGSONG — the culture marks (core/sockets)
// [draw] Each building declares where its marks go (sockets, in its own frame: +z out of the wall, +x along it, y up) and
// a culture's pack draws them (LSSOCK, 63s: core/sockets' packs, 2026-10-20): the Order of Historians' (saffron, the
// maroon edge, the scroll with the wheel written on it) on the Order's own: the Great Gate's pylons and arch, the Lower
// Gate, the Order's works and houses in the ward; Xanadu's (rose, the white lotus) on the valley's lay buildings in the
// ward: the market, the hostel, the lay servants' houses, the caravanserai, the dairy, the travellers' infirmary. The
// Geomancers' lodge keeps Yuni's colours on its own door (64).
const LSMARKS=(function(){const O={n:0,byCulture:{order:0,xanadu:0}};if(typeof LSSOCK==='undefined')return O;
 const mark=(cult,F,L,key)=>{LSSOCK.mark(cult,F,L,key);O.n+=L.length;O.byCulture[cult]=(O.byCulture[cult]||0)+L.length;};
 const XAN=new Set(['market','hostel','servants','caravanserai','dairy','infirmary']);
 const TRADE={market:'FOOD',hostel:'INN',caravanserai:'INN',dairy:'FOOD','dye-house':'DYE',carpenters:'TINKER',smithy:'WEAPONS',infirmary:'ALCHEMIST',
  'paper-mill':'GENERAL','granary-w':'GENERAL'};
 // ---------------------------------------------------------------- the ward: over each door an awning, beside it a sign (its trade)
 // and on its other side a banner (the doors face the avenue: 64)
 LS.BUILDINGS.filter(B=>B.base==='ward'&&(B.kind==='house'||B.kind==='court')&&B.id!=='geomancers').forEach(B=>{
  const y=LS.baseY(B),nx=B.x<0?1:-1,court=B.kind==='court',dw=court?3:1.8,dh=court?3.6:2.9;
  const L=[['awning',0,dh+.35,0,0,{w:dw+1.4,d:1.1,drop:.35,h:dh}],['banner',-(dw/2+1.5),dh+2.4,0,0,{w:1,h:2.6}]];
  if(TRADE[B.id])L.push(['sign',dw/2+1.7,dh*.72,0,0,{w:1.6,h:.6,trade:TRADE[B.id]}]);
  mark(XAN.has(B.id)?'xanadu':'order',{x:B.x+nx*(B.w/2+.06),y,z:B.z,ry:Math.atan2(nx,0)},L,B.id);});
 // ---------------------------------------------------------------- the Great Gate: the Order's banners down both pylons, outside and
 // in, and its emblem over the arch on both faces
 {const B=LS.building('gatehouse'),y=LS.baseY(B),th=B.d,yg=minG(0,B.z,B.w,th)-.5,Hp=y-yg+30,dAt=k=>th+2-2*1.4*(y-yg+k)/Hp;
  for(const s of [-1,1]){const zf=B.z+s*(dAt(13)/2+.05),ry=s<0?Math.PI:0;
   mark('order',{x:0,y,z:zf,ry},[['banner',-11.2,22,0,0,{w:2.4,h:9}],['banner',11.2,22,0,0,{w:2.4,h:9}]],'gatehouse');
   mark('order',{x:0,y,z:B.z+s*(th/2+.06),ry},[['emblem',0,18.4,0,0,{w:2.6,h:2.6}]],'gatehouse');}}
 // ---------------------------------------------------------------- the Lower Gate: the emblem over its door, a banner either side
 {const B=LS.building('lower-gate'),y=LS.baseY(B);
  mark('order',{x:B.x,y,z:B.z-B.d/2-.06,ry:Math.PI},[['emblem',0,5.4,0,0,{w:1.8,h:1.8}],['banner',-4.2,8.6,0,0,{w:1.2,h:3.4}],['banner',4.2,8.6,0,0,{w:1.2,h:3.4}]],'lower-gate');}
 window._marks={get n(){return O.n;},get byCulture(){return Object.assign({},O.byCulture);}};
 return O;})();
_mark('marks');
