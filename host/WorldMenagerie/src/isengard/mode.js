// ---------- Saruman's Isengard, or the Treegarth ----------
// The page opens on Isengard as it was in the war: the plain paved and bored, the furnaces going, the hosts on the
// road. The switch takes it to what the Ents made of it afterwards - the Treegarth of Orthanc, the works gone and
// the plain green with trees, and the tower standing in an orchard.
//
// It is Minas Tirith's war switch (src/minastirith/war.js) under another name, and it drives the same flags, so
// everything shared that already knows about ctx.war - the hosts, the events - needs nothing new: ctx.war is true
// for Saruman's Isengard, and ctx.warParts and ctx.peaceParts are what each state shows. #war=off opens on the
// Treegarth.
export function mode(api){
  const {ctx,onUI,HASH0}=api;
  const set=on=>{
    ctx.war=on;
    for(const o of ctx.warParts||[])o.visible=on;
    for(const o of ctx.peaceParts||[])o.visible=!on;
    if(ctx.details)ctx.details.mode=on?'saruman':'treegarth';
    for(const f of ctx.onWar||[])try{f(on);}catch(e){api.report&&api.report('mode',e);}
  };
  set(!/(^|&)war=off/.test(HASH0||''));
  onUI(({mkBtn,ui})=>{
    const label=()=>ctx.war?'Saruman':'Treegarth';
    const b=mkBtn(label(),ui,()=>{set(!ctx.war);b.textContent=label();b.setAttribute('aria-pressed',String(!!ctx.war));});
    b.setAttribute('aria-pressed',String(!!ctx.war));
    b.title='Isengard in the war, or the Treegarth of Orthanc that the Ents made of it afterwards';
  });
}
