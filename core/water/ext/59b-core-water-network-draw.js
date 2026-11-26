// ================================================================= WATER - ext: drawing a flow network (59-core-water-network.js)
// [draw]. Needs 51 (drawFlow) and ext/55b (drawConfluence, fadeRibbons). Opt-in by path. Nothing runs at load time.
//   WATER.drawNetwork(N, o) -> {flows: [drawFlow drawings], confluences: [drawConfluence drawings]}
//        o.flow: drawFlow's options for every flow; o.flows: [per flow options laid over them] (a flow's own colours, rapids, chute...);
//        o.confluence: drawConfluence's options (default o.flow: a disc is its river's water). Each flow takes its keep fade (a mouth) with
//        refine (its rows follow the fade), and its order (a child over its parent); each disc fades its members' ribbons out inside it
(function(){const W=WATER;
 W.drawNetwork=(N,o)=>{o=o||{};const base=o.flow||{},per=o.flows||[];
  const flows=N.flows.map((S,i)=>W.drawFlow(S,Object.assign({},base,{renderOrder:N.order[i]},per[i]||{},N.keep[i]?{keep:N.keep[i],refine:true}:{})));
  const confluences=N.confluences.map(C=>{const D=W.drawConfluence(C,Object.assign({},o.confluence||base));W.fadeRibbons(C,C.members.map(i=>flows[i]));return D;});
  return{flows,confluences};};
})();
