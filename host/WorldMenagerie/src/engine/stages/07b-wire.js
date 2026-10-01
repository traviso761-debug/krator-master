// ---------- the wireframe, and the hidden-line view ----------
// Iziz has had this since the first version of that page and it is the most useful control on it: the model
// drawn as its own edges, over the solid or instead of it. Every city on the shared engine gets it here.
// The work of building it happens the first time it is asked for (src/core/wire.js).
section('wire',()=>{
  const wire=createWire({THREE,scene,animHooks});
  installWireUI({ui,mkBtn,wire,hash:HASH0});
  ctx.wire=wire;
});
