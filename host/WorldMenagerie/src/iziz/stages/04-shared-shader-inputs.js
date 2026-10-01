// ---------- shared shader inputs (updated once per frame) and the light/weather chunk every lit material receives (src/core/env.js) ----------
const {ENV,GLSL_LIT,litAt,applyEnv,setEnv,lampHook,withLightT,setLT}=createEnv();
const glowT=[];   // per glow point: [on,off,seed] when it follows its own light
