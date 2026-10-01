# Brief: POOR QUARTERS — mud and thatch   (agent "poor")
Read `_common.md` (same folder) first.

## You own
`src/57-poor.js` (open with `reseed(570001);`, one IIFE). family: `'poor'` (and `'prop'` for the small things).

## Goal (the user's words)
"in poorer areas simple mud buildings and even thatched huts (like in 'eavillage') predominate." The poor district "gets
progressively poorer as one moves further away from the market district and turns into simple mud and thatched buildings."
Less wealthy areas keep "the general forms" of the rich city (curves, parabolic arches, domes) but "paint and mosaics
become much more sparse".

Look at: refimg/06-musgum-shell-dome.webp, 05-mandara-thatched-cone-hamlet.webp, 15-eavillage-painted-egg-huts.jpg,
01-tiebele-painted-towers.jpg, 08-djenne-great-mosque.webp.

## Assets to deliver (names are suggestions — keep them specific and human)
1. **Musgum shell house** — tall catenary mud dome (8-9 m), raised inverted-V / rib relief pattern over the whole shell
   (the ribs are climbing footholds), keyhole-shaped door with a moulded surround, smoke hole at the top. 3 variants
   (single tall; a pair joined by a low wall; a squat wide one). Use F.lathe for the shell; relief as rows of small
   tapered boxes/cones lying on the surface, or a second slightly larger lathe in bands.
2. **Painted egg hut** ('eavillage'): egg-shaped mud shell, 5-7 m, with a small thatched or gabled porch over a
   parabolic door; variants: bare mud / whitewashed base with paintbw bands / fully painted (paintbw, paintcol tint) —
   paint appears only at F.wealth > 0.2.
3. **Thatched cone hut cluster** (Mandara): 3-6 round stone-and-mud drums (2.5-4 m across) under steep, tall, slightly
   ragged thatch cones with a topknot, packed tightly on a rough rock/stone footing, a granary among them. 3 variants by
   count/arrangement. Footprint ~14 x 12.
4. **Flat-roofed mud house**: 1 storey, battered adobe walls, rounded parapet corners with small horn pinnacles, wooden
   spouts, toron rows, ladder to the roof, pots and a sleeping mat/awning on the roof. 4 variants incl. an L-shape and a
   two-room with a walled yard.
5. **Family compound (poor)**: low curved mud yard wall (Tiebele-style, 1.2-1.6 m, with a stile gap), 2-3 round or
   rectangular rooms, a central cooking place (F.lamp for the fire), a granary. ~18 x 16. 2 variants.
6. **Granary on stilts**: mud jar body on stone/timber legs with a removable thatch cap. prop-sized (3 x 3).
7. **Shade shelter (hangar)**: forked posts, pole roof, loose thatch/mat cover, a bench. prop (5 x 4).
8. **Animal pen**: thorn/pole fence ring with a lean-to. prop (8 x 8).
9. **Well** with a mud kerb, pole-and-crossbar hoist, water jars. prop (4 x 4).
10. **Lean-to shack**: the very poorest: salvaged Ancient panel (family 'rust' or 'metal', TARNC) + poles + matting against
    a mud back wall. 2 variants. (5 x 4).
Budget: houses/huts <= 350 tris each (a lathe with seg 12 and 8 points = 168 tris — spend the rest wisely), clusters and
compounds <= 1500.
