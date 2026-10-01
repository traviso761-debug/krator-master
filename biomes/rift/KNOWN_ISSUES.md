# Krator biome kit — the Rift: known issues

Read before changing anything here. `build.py` prints the open count.

## Open

- [ ] PUBLISH AFTER EVERY PASS. The claude.ai artifact is a separate copy of
      `dist/rift.html`; strip everything before `<title>` and the trailing
      `</body></html>` before publishing (00-head.html carries the page wrapper).
- [ ] BUDGET. The scene's ceiling is 25M triangles (raised for the cloud forest and the ridgetop;
      the eastern abyss ran 7.4M), 19M per pass. The last verified build measured 24.1M. The first build measured 27.5M: a 340-tri
      helix put three to six times per curl plant, 9 m brain domes, and a 28-tri capped
      beam item under every tiered tree. `RIFT.build({quality:.6})` is the knob. The
      heaviest items now: rosettes (72 tris), ball vines, boulders, the tiered trees' beams.
- [ ] The highlands (cloud forest, ridgetop) are planted from this kit's fields and could still
      become their own kit; the ridgetop has four species of its own and a garrigue floor.
- [ ] The zone weights (RIFT.zones) are thresholds on the five fields; a world with
      differently scaled fields will want to retune the smooth() bands in 55-trees.
- [ ] The far shore of the lake (the jungle south of it) and the Rift's walls are
      painted on the sky; a world that already draws its horizon as geometry does not
      need the overlay dome (a second 4096x2048 canvas, ~16 MB of texture).
- [ ] The streams have no cataracts and do not climb the ridge: they rise at its south
      foot. The savannah's dry wash is a shallow gravel bed with no bank flora of its own.
- [ ] The water's ripples are shader-only, so the scum mats (at the local water level +.04)
      never bob. Fine at any distance; wrong if a world animates its water mesh.
- [ ] The far impostors are the hyperjungle's blob technique; the small species stop at
      ~1.3 km from the LOD spine instead of becoming impostors. The frill tree's impostor
      is a tall blob and a cap, with no fins.
- [ ] The iridescence of the frill tree's column does not reach its impostor (flat colour
      beyond ~1.1 km), and the leaf iridescence uses world-up as its normal on the fin,
      fan, curl and rosette items (only the clump items carry a real aN).
- [ ] Only one Girder tower dresses. `dress()` samples by triangle area (inherited).
- [ ] No fauna yet.

## Done

- [x] Water-bound heights read the local water (`BIO.waterH`, Oct 2026): the zones' shore height, the
      keep-out above the water, the scum mats, the shallows' reeds and the water band of the floor. With
      this host's level of 0 the geometry is the same bit for bit (mesh fingerprints).

- [x] The Rift's two walls painted twice (dome + overlay in front of the giant), with the
      far lakes east and west and the far jungle / savannah lines by azimuth.
- [x] The ridge's south face benched (two treads), mesas and saddles on the crest, the
      mask zero on cliffs so the faces stay bare rock.
- [x] Thirty-four species built and zoned from five fields; iridescence as the rule.
- [x] The spire cactus replaced by the Rift croton; fan fronds twice the size in a light purple.
- [x] The brain-coral tree replaced by the trumpet tree; a wide-canopy
      parasol tree; the savannah's purple (Vain fronds, heath, pinecone succulents).
- [x] Every bole lathe ends in a dome ring (inherited lesson, kept).
