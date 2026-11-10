// ================================================================= HOST — Krator's sky: the shared sky (core/atmos, SKY-PLAN.md section 9)  [web]
// At core/atmos's default site with the clouds' mood compiled in: the stage hands the solids' tints to ATMOS.cloudMood (90-xp-stage.js),
// so the sky over a solid takes its colour. The valley's own sky and height fog come with the valley.
const SKY=ATMOS.skyBiome({renderer,camera,scene,sun:sun,preset:{air:{pressure:1.1,humidity:.5},clouds:{cover:.45,mood:true},fogDensity:.0007}});
