# Xanadu's works sheet: known issues

- **The adits are stand-ins.** `xa_adit` is core/hamlet's pending box (the kit has no adit piece): a rock mound with a dark
  mouth at its box. The mine head (`xa_mine_head`) draws an adit of its own beside its winding gear.
- **The ground is a flat sheet.** The camps' points, links and resources are the sheet's, not the model's; W4 puts them on
  Gōlḍ-Mārch's and Ōpal-Bhālī's ground when the vertical stack cuts those regions. The mill camp's stream and the landing's lake
  are the sheet's.
- **The Glaziers' houses stand on blocks of rock.** On the sheet a Glazier house is its front (`TG.gz.draw`, `facade: true`)
  on a block of the potch line's outcrop the size of its rooms; at the diggings proper they are cut into the outcrop (core/terrain's
  cavern, as Lāiṭwāl cuts them).
- **Run on SwiftShader so far** (2026-11-23: this machine has no GPU lane). The GPU verify is owed (the commit's report).
