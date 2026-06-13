import type { ShaderPattern } from "../../types";
import { glslNoiseHeader } from "../atoms/shaderHeaders";

export const lumenHoloDicePattern: ShaderPattern = {
    id: "lumen-holo-dice",
    name: "Holo Foil Dice",
    category: "Lumen Borrowed",
    description: "Iridescent holographic foil TTRPG dice simulation, featuring 3D wireframe raymarched faces.",
    thumbnailUrl: "/thumbnails/lumen-holo-dice.png",
    previewSnapshotUrl: "/thumbnails/lumen-holo-dice.png",
    renderEngine: "webgl2",
    tags: ["animated", "raymarch", "holo", "dice"],
    useCases: ["Background visuals", "Holographic cards"],
    defaultPalette: {
      id: "p21",
      name: "Iridescent",
      stops: [
        { id: "s1", color: "#f8f9fa", position: 0.0 },
        { id: "s2", color: "#ff66cc", position: 0.25 },
        { id: "s3", color: "#66ccff", position: 0.5 },
        { id: "s4", color: "#ccff66", position: 0.75 },
        { id: "s5", color: "#ff9966", position: 1.0 }
      ],
      interpolation: "smooth"
    },
    defaultParameters: [
      { key: "seed", label: "Seed", type: "float", value: 1205, min: 0, max: 9999, step: 1, group: "Form", designerSafe: false },
      { key: "scale", label: "Zoom", type: "float", value: 1.0, min: 0.5, max: 3.0, step: 0.01, group: "Form", designerSafe: true },
      { key: "sides", label: "Glitter Pattern", type: "float", value: 6.0, min: 2.0, max: 12.0, step: 1.0, group: "Form", designerSafe: true },
      { key: "shape", label: "Shape", type: "float", value: 0.9, min: 0.0, max: 1.5, step: 0.05, group: "Form", designerSafe: true },
      { key: "original", label: "Use Original Colors", type: "boolean", value: false, min: 0.0, max: 1.0, step: 1.0, group: "Form", designerSafe: true }
    ],
    shaderSource: `${glslNoiseHeader}
// SPDX-License-Identifier: CC-BY-NC-SA-4.0
// Copyright (c) 2026 @Jaenam
//[LICENSE] https://creativecommons.org/licenses/by-nc-sa/4.0/

/*================================
=         Holofoil Dice          =
=         Author: Jaenam         =
================================*/

uniform vec3 u_mouse;
uniform float u_seed;
uniform float u_sides;
uniform float u_shape;
uniform float u_original;

#define A_ORIG(C, Z) \\
for (float d, i, c, e, sc, h, a, s, sf; i++ < 80.;) { \\
    vec3 p = vec3((I + I - r.xy) / r.y*d, d - 8.) * (1.1 / max(u_scale, 0.15)); vec3 g, f, k; \\
    if (abs(p.x) > 5.) break; \\
    p.xz *= Rx; \\
    u_mouse.z > 0. ? p.yz *= Ry : p.xy *= Ry; \\
    g = floor(p * u_sides); \\
    f = fract(p * u_sides) - .5; \\
    h = step(length(f), fract(sin(dot(g, vec3(127.1, 311.7, 74.7))) * 43758.5) * .3 + .1); \\
    a = fract(sin(dot(g, vec3(43.7, 78.2, 123.4))) * 127.1) * 6.28; \\
    e = 1., sc = 2.; \\
    for (int j = 0; j < 3; j++) { \\
        g = abs(mod(p * sc, 2.) - 1.); \\
        e = min(e, min(max(g.x, g.y), min(max(g.y, g.z), max(g.x, g.z))) / sc); \\
        sc *= .6; \\
    } \\
    c = max(max(max(abs(p.x), abs(p.y)), abs(p.z)), dot(abs(p), vec3(.577)) * u_shape) - 3.; \\
    d += s = .01 + .15 * abs(max(max(c, e - .1),length(sin(c))-.3) + Z * .02 - i / 130.); \\
    sf = smoothstep(.02, .01, s); \\
    fragColor.C += 1.6 / s * (.5 + .5 * sin(i * .3 + Z * 5.) + sf * 4. * h * sin(a + i * .4 + Z * 5.));\\
}

void main() {
    vec2 I = gl_FragCoord.xy;
    vec3 r = vec3(u_resolution, 1.0);
    vec2 m = u_mouse.z > 0. ? (-u_mouse.xy / r.xy - .5) * 6.28 : vec2(u_time / 2. + u_seed * 0.05);
    mat2 Rx = mat2(cos(m.x + vec4(0, 33, 11, 0)));
    mat2 Ry = mat2(cos(m.y + vec4(0, 33, 11, 0)));
    fragColor = vec4(0.0);

    if (u_original > 0.5) {
        A_ORIG(r, -1.)A_ORIG(g, 0.)A_ORIG(b, 1.)
        fragColor = tanh(fragColor * fragColor / 1e7);
        fragColor.a = 1.0;
    } else {
        float d = 0.0;
        for (float i = 0.0; i < 80.0; i++) {
            vec3 p = vec3((I + I - r.xy) / r.y * d, d - 8.0) * (1.1 / max(u_scale, 0.15));
            vec3 g, f, k;
            if (abs(p.x) > 5.0) break;
            p.xz *= Rx;
            u_mouse.z > 0.0 ? p.yz *= Ry : p.xy *= Ry;
            g = floor(p * u_sides);
            f = fract(p * u_sides) - 0.5;
            float h = step(length(f), fract(sin(dot(g, vec3(127.1, 311.7, 74.7))) * 43758.5) * 0.3 + 0.1);
            float a = fract(sin(dot(g, vec3(43.7, 78.2, 123.4))) * 127.1) * 6.28;
            float e = 1.0, sc = 2.0;
            for (int j = 0; j < 3; j++) {
                g = abs(mod(p * sc, 2.0) - 1.0);
                e = min(e, min(max(g.x, g.y), min(max(g.y, g.z), max(g.x, g.z))) / sc);
                sc *= 0.6;
            }
            float c = max(max(max(abs(p.x), abs(p.y)), abs(p.z)), dot(abs(p), vec3(0.577)) * u_shape) - 3.0;
            float s = 0.01 + 0.15 * abs(max(max(c, e - 0.1), length(sin(c)) - 0.3) - i / 130.0);
            d += s;
            float sf = smoothstep(0.02, 0.01, s);
            
            float intensity = 1.6 / s * (0.5 + 0.5 * sin(i * 0.3) + sf * 4.0 * h * sin(a + i * 0.4));
            float colIndex = fract(i * 0.02 + d * 0.04 + a * 0.05);
            vec3 baseColor = getPaletteColor(colIndex);
            
            fragColor.rgb += intensity * baseColor;
        }

        fragColor = tanh(fragColor * fragColor / 1e7);
        fragColor.a = 1.0;
    }
}
`
  };
