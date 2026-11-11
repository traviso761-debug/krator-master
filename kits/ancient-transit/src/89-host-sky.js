// ================================================================= HOST — Krator's sky: the shared sky (core/atmos, SKY-PLAN.md section 9)
// At core/atmos's default site, a clear noon: a test bed, so the air takes nothing from the lines. The valley's own sky and height fog come with the valley.
const SKY=ATMOS.skyBiome({renderer,camera,scene,sun:sun,preset:{air:{pressure:1.2,humidity:.4},clouds:{cover:.15},fogDensity:.00012}});
