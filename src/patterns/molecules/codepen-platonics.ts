import type { ShaderPattern } from "../../types";
import { glslNoiseHeader } from "../atoms/shaderHeaders";

export const codepenPlatonicsPattern: ShaderPattern = {
    id: "codepen-platonics",
    name: "Platonics",
    category: "Animated Shaders",
    description: "Liam Egan / shubniggurath CodePen-inspired raymarched platonic box forms blending and separating through a glossy lit field.",
    thumbnailUrl: "/thumbnails/platonics.png",
    previewSnapshotUrl: "/thumbnails/platonics.png",
    renderEngine: "webgl2",
    tags: ["animated", "raymarch", "codepen", "platonic"],
    useCases: ["Experimental hero", "Generative 3D motion"],
    defaultPalette: {
      id: "p-platonics-1",
      name: "Graphite Glass",
      stops: [
        { id: "s1", color: "#0f1117", position: 0.0 },
        { id: "s2", color: "#596070", position: 0.35 },
        { id: "s3", color: "#cfd6df", position: 0.72 },
        { id: "s4", color: "#ffe0a3", position: 1.0 }
      ],
      interpolation: "smooth"
    },
    defaultParameters: [
      { key: "speed", label: "Speed", type: "float", value: 1.0, min: 0.0, max: 3.0, step: 0.01, group: "Motion", designerSafe: true },
      { key: "scale", label: "Zoom", type: "float", value: 1.0, min: 0.7, max: 1.6, step: 0.01, group: "Form", designerSafe: true },
      { key: "spread", label: "Separation", type: "float", value: 0.25, min: 0.0, max: 0.55, step: 0.01, group: "Form", designerSafe: true },
      { key: "softness", label: "Blend Softness", type: "float", value: 28.0, min: 8.0, max: 90.0, step: 0.5, group: "Form", designerSafe: true },
      { key: "exposure", label: "Exposure", type: "float", value: 1.15, min: 0.4, max: 2.2, step: 0.01, group: "Lighting", designerSafe: true },
      { key: "glow", label: "Reflection", type: "float", value: 0.45, min: 0.0, max: 1.0, step: 0.01, group: "Lighting", designerSafe: true }
    ],
    shaderSource: `${glslNoiseHeader}
// Adapted from Liam Egan / shubniggurath's CodePen "Platonics".
// Original used WebGL1, a cubemap, and an external noise texture.
const float MAX_TRACE_DISTANCE = 8.0;
const float INTERSECTION_PRECISION = 0.001;
const int NUM_OF_TRACE_STEPS = 100;
const float STEP_MULTIPLIER = 0.8;

uniform float u_spread;

struct Camera {
  vec3 ro;
  vec3 rd;
  vec3 forward;
  vec3 right;
  vec3 up;
  float FOV;
};

struct Surface {
  float len;
  vec3 position;
  vec3 colour;
  float id;
  float steps;
  float AO;
};

struct Model {
  float dist;
  vec3 colour;
  float id;
};

float morphT = 0.0;

vec2 getScreenSpace() {
  return (gl_FragCoord.xy - 0.5 * u_resolution.xy) / min(u_resolution.y, u_resolution.x) / max(u_scale, 0.001);
}

float easeInOutExpo(float k) {
  if (k <= 0.0) return 0.0;
  if (k >= 1.0) return 1.0;
  k *= 2.0;
  if (k < 1.0) return 0.5 * pow(1024.0, k - 1.0);
  return 0.5 * (-pow(2.0, -10.0 * (k - 1.0)) + 2.0);
}

float smin(float a, float b, float k) {
  float res = exp(-k * a) + exp(-k * b);
  return -log(res) / k;
}

mat4 rotationMatrix(vec3 axis, float angle) {
  axis = normalize(axis);
  float s = sin(angle);
  float c = cos(angle);
  float oc = 1.0 - c;
  return mat4(
    oc * axis.x * axis.x + c,          oc * axis.x * axis.y - axis.z * s, oc * axis.z * axis.x + axis.y * s, 0.0,
    oc * axis.x * axis.y + axis.z * s, oc * axis.y * axis.y + c,          oc * axis.y * axis.z - axis.x * s, 0.0,
    oc * axis.z * axis.x - axis.y * s, oc * axis.y * axis.z + axis.x * s, oc * axis.z * axis.z + c,          0.0,
    0.0,                               0.0,                               0.0,                               1.0
  );
}

float udBox(vec3 p, vec3 b) {
  return length(max(abs(p) - b, 0.0));
}

Model model(vec3 p) {
  float d = 100.0;
  vec3 colour2 = getPaletteColor(0.12);
  vec3 colour1 = getPaletteColor(0.82);
  vec3 colour = getPaletteColor(0.5);
  vec3 endpos1 = vec3(-u_spread, 0.0, 0.0);
  vec3 endpos2 = vec3(u_spread, 0.0, 0.0);
  vec3 pos1 = mix(vec3(0.0), endpos1, morphT);
  vec3 pos2 = mix(vec3(0.0), endpos2, morphT);
  vec3 source = p;

  for (int i = 0; i < 3; i++) {
    vec3 c = colour;
    vec3 pos = vec3(0.0);
    if (i == 1) {
      pos = pos1;
      c = colour2;
    }
    if (i == 2) {
      pos = pos2;
      c = colour1;
    }

    p = source + pos;
    float fi = float(i) + 1.0;
    float t5 = u_time * u_speed / 5.0 * fi;
    p = (rotationMatrix(vec3(cos(t5), sin(t5), 0.5), u_time * u_speed / 3.0) * vec4(p, 1.0)).xyz;

    float d1 = udBox(p, vec3(0.1));
    if (i == 0) {
      d = d1;
    } else {
      float ddiff = (d1 - d) / max(d1, 0.0001);
      d = smin(d, d1, mix(u_softness, 20.0, morphT));
      colour = mix(c, colour, smoothstep(0.0, 1.0, ddiff * 0.7));
    }
  }

  return Model(d, colour, 1.0);
}

Model map(vec3 p) {
  return model(p);
}

Surface calcIntersection(in Camera cam) {
  float h = INTERSECTION_PRECISION * 2.0;
  float rayDepth = 0.0;
  float hitDepth = -1.0;
  float id = -1.0;
  float steps = 0.0;
  float ao = 0.0;
  vec3 position = cam.ro;
  vec3 colour = vec3(0.0);

  for (int i = 0; i < NUM_OF_TRACE_STEPS; i++) {
    if (abs(h) < INTERSECTION_PRECISION || rayDepth > MAX_TRACE_DISTANCE) break;
    position = cam.ro + cam.rd * rayDepth;
    Model m = map(position);
    h = m.dist;
    rayDepth += h * STEP_MULTIPLIER;
    id = m.id;
    steps += 1.0;
    ao += max(h, 0.0);
    colour = m.colour;
  }

  if (rayDepth < MAX_TRACE_DISTANCE) hitDepth = rayDepth;
  if (rayDepth >= MAX_TRACE_DISTANCE) id = -1.0;
  return Surface(hitDepth, position, colour, id, steps, max(ao, 0.001));
}

Camera getCamera(in vec2 uv, in vec3 pos, in vec3 target) {
  vec3 forward = normalize(target - pos);
  vec3 right = normalize(vec3(forward.z, 0.0, -forward.x));
  vec3 up = normalize(cross(forward, right));
  float FOV = 0.6;
  return Camera(pos, normalize(forward + FOV * uv.x * right + FOV * uv.y * up), forward, right, up, FOV);
}

float calcAO(in vec3 pos, in vec3 nor) {
  float occ = 0.0;
  float sca = 1.0;
  for (int i = 0; i < 5; i++) {
    float hr = 0.01 + 0.12 * float(i) / 4.0;
    vec3 aopos = nor * hr + pos;
    float dd = map(aopos).dist;
    occ += -(dd - hr) * sca;
    sca *= 0.95;
  }
  return clamp(1.0 - 3.0 * occ, 0.0, 1.0);
}

vec3 proceduralEnvironment(vec3 r) {
  float horizon = 0.5 + 0.5 * r.y;
  vec3 cold = getPaletteColor(0.18) * 0.7;
  vec3 warm = getPaletteColor(0.92);
  float bands = 0.5 + 0.5 * sin(18.0 * atan(r.z, r.x) + u_time * u_speed);
  return mix(cold, warm, horizon) + bands * 0.08;
}

vec3 shade(Surface surface, vec3 nor, vec3 ref, Camera cam) {
  vec3 col = surface.colour;
  vec3 pos = surface.position;
  vec3 I = normalize(pos - cam.ro);
  vec3 R = reflect(I, nor);
  vec3 reflection = proceduralEnvironment(R);
  float occ = calcAO(pos, nor);
  vec3 lig = normalize(vec3(-0.6, 0.7, 0.0));
  float amb = clamp(0.5 + 0.5 * nor.y, 0.0, 1.0);
  float dif = clamp(dot(nor, lig), 0.0, 1.0);
  float bac = clamp(dot(nor, normalize(vec3(-lig.x, 0.0, -lig.z))), 0.0, 1.0) * clamp(1.0 - pos.y, 0.0, 1.0);
  float fre = pow(clamp(1.0 + dot(nor, cam.rd), 0.0, 1.0), 2.0);
  float spe = pow(clamp(dot(ref, lig), 0.0, 1.0), 4.0);

  vec3 lin = vec3(0.0);
  lin += 1.20 * dif * vec3(0.95, 0.80, 0.60);
  lin += 1.20 * spe * vec3(1.00, 0.85, 0.55) * dif;
  lin += 0.80 * amb * vec3(0.50, 0.70, 0.80) * occ;
  lin += 0.30 * bac * vec3(0.25) * occ;
  lin += 0.20 * fre * vec3(1.00) * occ;
  col = col * lin;
  col += reflection * u_glow;
  return col;
}

vec3 calcNormal(in vec3 pos) {
  vec3 eps = vec3(0.001, 0.0, 0.0);
  vec3 nor = vec3(
    map(pos + eps.xyy).dist - map(pos - eps.xyy).dist,
    map(pos + eps.yxy).dist - map(pos - eps.yxy).dist,
    map(pos + eps.yyx).dist - map(pos - eps.yyx).dist
  );
  return normalize(nor);
}

vec3 render(Surface surface, Camera cam, vec2 uv) {
  vec3 colour = vec3(0.4, 0.4, 0.45);
  vec3 colourB = getPaletteColor(0.0) * 0.35;
  colour = mix(colourB, colour, smoothstep(1.0, 0.0, (length(uv) - surface.steps / 100.0) * (1.0 + smoothstep(-1.0, -1.5, -abs(cam.ro.z)) * 0.5)));

  if (surface.id == 1.0) {
    vec3 surfaceNormal = calcNormal(surface.position);
    vec3 ref = reflect(cam.rd, surfaceNormal);
    colour = shade(surface, surfaceNormal, ref, cam);
  }

  return colour * u_exposure;
}

void main() {
  vec2 uv = getScreenSpace();
  morphT = easeInOutExpo(smoothstep(0.0, 1.0, sin(u_time * u_speed * 0.25) * 2.0));
  float camd = mix(0.8, 1.5, morphT);
  float c = cos(u_time * u_speed * 0.18);
  float s = sin(u_time * u_speed * 0.18);
  mat3 xrot = mat3(c, 0.0, s, 0.0, 1.0, 0.0, -s, 0.0, c);
  vec3 campos = vec3(0.0, 0.0, camd) * xrot;
  Camera cam = getCamera(uv, campos, vec3(0.0));
  Surface surface = calcIntersection(cam);
  vec3 color = render(surface, cam, uv);
  fragColor = vec4(color, 1.0);
}
`
  };
