// ---------- war and peace ----------
// This page is drawn at the one moment everybody knows it from: the host on the Pelennor, the city burning
// in patches, and the Rohirrim not yet moved. That is a choice, and it is worth being able to unmake it -
// the same stone city with nothing outside it is a different place, and the only way to see what the siege
// is adding is to take it away.
//
// Nothing is rebuilt when the switch is thrown. Every module that makes something warlike pushes it onto
// ctx.warParts as it builds, and the tree's blossom goes on ctx.peaceParts; this turns one list off and the
// other on, and tells the animation hooks to stop, which is also most of the frame cost. The city itself -
// its houses, its banners, its cooking smoke, its market stalls - belongs to both and never moves.
//
// War is what the page opens on. #war=off opens on the other one.
export function warmode(api){
  const {ctx,onUI,HASH0}=api;

  const set=on=>{
    ctx.war=on;
    for(const o of ctx.warParts||[])o.visible=on;
    for(const o of ctx.peaceParts||[])o.visible=!on;
    if(ctx.details)ctx.details.mode=on?'war':'peace';
    // anything that changed the war while it ran - a gate broken, ships moored - puts itself back here
    for(const f of ctx.onWar||[])try{f(on);}catch(e){api.report&&api.report('war',e);}
  };
  const off=/(^|&)war=off/.test(HASH0||'');
  set(!off);

  onUI(({mkBtn,ui})=>{
    const b=mkBtn(ctx.war?'War':'Peace',ui,()=>{
      set(!ctx.war);
      b.textContent=ctx.war?'War':'Peace';
      b.setAttribute('aria-pressed',String(!!ctx.war));
    });
    b.setAttribute('aria-pressed',String(!!ctx.war));
    b.title='The siege, or the city without it: the host, the engines, the fires and the damage go, and the White Tree comes into flower';
  });
}
