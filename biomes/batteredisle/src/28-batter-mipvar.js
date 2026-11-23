// ================================================================= BATTERED ISLE — precomputed M2 normal mipVariance table [G data]
// Toksvig/Kaplanyan mip normal variance (1 - ||E[n]||)/||E[n]|| across 8 mip levels for Battered Isle rock surfaces,
// shared identically between WebGL2 (KMAT_M1.GLSL_COMMON km1RoughAA) and Godot 4.7.2 without runtime image decoding.
var KMAT_MIPVAR = {
 'rock.basalt':     [0.0, 0.0114, 0.0268, 0.0512, 0.0845, 0.1260, 0.1715, 0.2180],
 'rock.scoria':     [0.0, 0.0185, 0.0410, 0.0765, 0.1190, 0.1680, 0.2210, 0.2690],
 'rock.palagonite': [0.0, 0.0132, 0.0304, 0.0580, 0.0940, 0.1385, 0.1840, 0.2310],
 'rock.coal':       [0.0, 0.0086, 0.0198, 0.0385, 0.0640, 0.0965, 0.1320, 0.1710],
 'rock.garnierite': [0.0, 0.0124, 0.0282, 0.0540, 0.0880, 0.1310, 0.1765, 0.2240]
};
if (typeof window !== 'undefined') window.KMAT_MIPVAR = KMAT_MIPVAR;
if (typeof module !== 'undefined' && module.exports) module.exports = KMAT_MIPVAR;
