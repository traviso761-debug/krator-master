/* ==== 30. THE SITE'S FURNITURE ==== */
/* the wireframe every other page has (src/core/wire.js), in Voth's own panel; #wire=edges in the address opens with it */
(function(){
  var ui = document.getElementById('ui');
  var mk = function(label, parent, fn){ return mkBtn(label, parent, fn); };
  var wire = createWire({ THREE:THREE, scene:scene, animHooks:animHooks });
  installWireUI({ ui:ui, mkBtn:mk, wire:wire, hash:location.hash.slice(1) });
  window._voth = Object.assign(window._voth || {}, { wire:wire });
})();
