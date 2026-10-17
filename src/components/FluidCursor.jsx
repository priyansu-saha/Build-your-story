import { useEffect, useRef } from "react";

/* WebGL2 "stable fluids" simulation: moving the cursor (or finger) stirs pastel liquid ink.
   Falls back to nothing (plain white) if WebGL2 / float render targets aren't available
   or the user prefers reduced motion. */

const VERT = `#version 300 es
in vec2 a;
out vec2 vUv, vL, vR, vT, vB;
uniform vec2 texel;
void main(){
  vUv = a * .5 + .5;
  vL = vUv - vec2(texel.x, 0.); vR = vUv + vec2(texel.x, 0.);
  vT = vUv + vec2(0., texel.y); vB = vUv - vec2(0., texel.y);
  gl_Position = vec4(a, 0., 1.);
}`;

const HEAD = `#version 300 es
precision highp float; precision highp sampler2D;
in vec2 vUv, vL, vR, vT, vB;
out vec4 o;
uniform vec2 texel;
`;

const FRAG = {
  advect: `uniform sampler2D uVel, uSrc; uniform float dt, diss;
    void main(){
      vec2 c = vUv - dt * texture(uVel, vUv).xy * texel;
      o = texture(uSrc, c) / (1. + diss * dt);
    }`,
  divergence: `uniform sampler2D uVel;
    void main(){
      float L = texture(uVel, vL).x, R = texture(uVel, vR).x, T = texture(uVel, vT).y, B = texture(uVel, vB).y;
      vec2 C = texture(uVel, vUv).xy;
      if (vL.x < 0.) L = -C.x; if (vR.x > 1.) R = -C.x; if (vT.y > 1.) T = -C.y; if (vB.y < 0.) B = -C.y;
      o = vec4(.5 * (R - L + T - B), 0., 0., 1.);
    }`,
  curl: `uniform sampler2D uVel;
    void main(){
      float L = texture(uVel, vL).y, R = texture(uVel, vR).y, T = texture(uVel, vT).x, B = texture(uVel, vB).x;
      o = vec4(.5 * (R - L - T + B), 0., 0., 1.);
    }`,
  vorticity: `uniform sampler2D uVel, uCurl; uniform float strength, dt;
    void main(){
      float L = texture(uCurl, vL).x, R = texture(uCurl, vR).x, T = texture(uCurl, vT).x, B = texture(uCurl, vB).x, C = texture(uCurl, vUv).x;
      vec2 f = .5 * vec2(abs(T) - abs(B), abs(R) - abs(L));
      f /= length(f) + .0001; f *= strength * C; f.y *= -1.;
      vec2 v = clamp(texture(uVel, vUv).xy + f * dt, -1000., 1000.);
      o = vec4(v, 0., 1.);
    }`,
  pressure: `uniform sampler2D uP, uDiv;
    void main(){
      float L = texture(uP, vL).x, R = texture(uP, vR).x, T = texture(uP, vT).x, B = texture(uP, vB).x;
      o = vec4((L + R + B + T - texture(uDiv, vUv).x) * .25, 0., 0., 1.);
    }`,
  gradient: `uniform sampler2D uP, uVel;
    void main(){
      float L = texture(uP, vL).x, R = texture(uP, vR).x, T = texture(uP, vT).x, B = texture(uP, vB).x;
      o = vec4(texture(uVel, vUv).xy - vec2(R - L, T - B), 0., 1.);
    }`,
  clear: `uniform sampler2D uT; uniform float value;
    void main(){ o = value * texture(uT, vUv); }`,
  splat: `uniform sampler2D uT; uniform float aspect, radius; uniform vec3 color; uniform vec2 point;
    void main(){
      vec2 p = vUv - point; p.x *= aspect;
      o = vec4(texture(uT, vUv).rgb + exp(-dot(p, p) / radius) * color, 1.);
    }`,
  /* dye stores light *absorption*; white paper minus ink = pastel liquid, plus a soft specular sheen */
  display: `uniform sampler2D uDye;
    void main(){
      vec3 d = min(texture(uDye, vUv).rgb, vec3(.9));
      float l = dot(d, vec3(.3333));
      float lx = dot(texture(uDye, vR).rgb - texture(uDye, vL).rgb, vec3(.3333));
      float ly = dot(texture(uDye, vT).rgb - texture(uDye, vB).rgb, vec3(.3333));
      vec3 n = normalize(vec3(-lx * 9., -ly * 9., 1.));
      float spec = pow(max(dot(n, normalize(vec3(-.35, .5, .8))), 0.), 30.);
      vec3 c = vec3(1.) - d + spec * .25 * smoothstep(0., .08, l);
      o = vec4(clamp(c, 0., 1.), 1.);
    }`
};

const SIM_RES = 128, DYE_RES = 512;
const hsv = (h, s, v) => {
  const i = Math.floor(h * 6), f = h * 6 - i, p = v * (1 - s), q = v * (1 - f * s), t = v * (1 - (1 - f) * s);
  return [[v, t, p], [q, v, p], [p, v, t], [p, q, v], [t, p, v], [v, p, q]][i % 6];
};

export default function FluidCursor({ active = true }) {
  const canvasRef = useRef(null);
  const activeRef = useRef(active);
  useEffect(() => { activeRef.current = active; }, [active]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const gl = canvas.getContext("webgl2", { alpha: false, antialias: false, depth: false, stencil: false });
    if (!gl || !(gl.getExtension("EXT_color_buffer_float") || gl.getExtension("EXT_color_buffer_half_float"))) return;

    let raf = 0, dead = false, ro = null;
    const cleanups = [];
    try {
      /* ---------- programs ---------- */
      const compile = (type, src) => {
        const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s);
        if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
        return s;
      };
      const vs = compile(gl.VERTEX_SHADER, VERT);
      const program = (body) => {
        const p = gl.createProgram();
        gl.attachShader(p, vs); gl.attachShader(p, compile(gl.FRAGMENT_SHADER, HEAD + body));
        gl.bindAttribLocation(p, 0, "a"); gl.linkProgram(p);
        if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
        const u = {};
        for (let i = 0; i < gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS); i++) {
          const name = gl.getActiveUniform(p, i).name;
          u[name] = gl.getUniformLocation(p, name);
        }
        return { p, u };
      };
      const P = Object.fromEntries(Object.entries(FRAG).map(([k, v]) => [k, program(v)]));

      /* fullscreen quad */
      gl.bindVertexArray(gl.createVertexArray());
      gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
      gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

      /* ---------- render targets ---------- */
      const fbo = (w, h) => {
        const tex = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, w, h, 0, gl.RGBA, gl.HALF_FLOAT, null);
        const f = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, f);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
        if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) throw new Error("fbo incomplete");
        gl.viewport(0, 0, w, h); gl.clearColor(0, 0, 0, 1); gl.clear(gl.COLOR_BUFFER_BIT);
        return { tex, fbo: f, w, h, texel: [1 / w, 1 / h] };
      };
      const pair = (w, h) => {
        const d = { read: fbo(w, h), write: fbo(w, h) };
        d.swap = () => { const t = d.read; d.read = d.write; d.write = t; };
        return d;
      };
      const res = (r) => {
        const asp = Math.max(canvas.width / canvas.height, canvas.height / canvas.width);
        const lo = Math.round(r), hi = Math.round(r * asp);
        return canvas.width > canvas.height ? [hi, lo] : [lo, hi];
      };
      let vel, dye, curl, div, press;
      const build = () => {
        const [sw, sh] = res(SIM_RES), [dw, dh] = res(DYE_RES);
        vel = pair(sw, sh); dye = pair(dw, dh);
        curl = fbo(sw, sh); div = fbo(sw, sh); press = pair(sw, sh);
      };
      const resize = () => {
        const w = Math.max(2, Math.floor(canvas.clientWidth)), h = Math.max(2, Math.floor(canvas.clientHeight));
        if (w === canvas.width && h === canvas.height && vel) return;
        canvas.width = w; canvas.height = h; build();
      };

      /* ---------- drawing ---------- */
      const draw = (prog, uniforms, target) => {
        gl.useProgram(prog.p);
        let unit = 0;
        for (const k in uniforms) {
          const loc = prog.u[k], v = uniforms[k];
          if (loc === undefined || loc === null) continue;
          if (v && v.tex) { gl.activeTexture(gl.TEXTURE0 + unit); gl.bindTexture(gl.TEXTURE_2D, v.tex); gl.uniform1i(loc, unit++); }
          else if (Array.isArray(v)) v.length === 2 ? gl.uniform2f(loc, v[0], v[1]) : gl.uniform3f(loc, v[0], v[1], v[2]);
          else gl.uniform1f(loc, v);
        }
        if (target) { gl.bindFramebuffer(gl.FRAMEBUFFER, target.fbo); gl.viewport(0, 0, target.w, target.h); }
        else { gl.bindFramebuffer(gl.FRAMEBUFFER, null); gl.viewport(0, 0, canvas.width, canvas.height); }
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      };

      const splat = (x, y, dx, dy, rgb, radius = 0.0034) => {
        const aspect = canvas.width / canvas.height;
        draw(P.splat, { uT: vel.read, aspect, radius, point: [x, y], color: [dx, dy, 0] }, vel.write); vel.swap();
        draw(P.splat, { uT: dye.read, aspect, radius, point: [x, y], color: rgb }, dye.write); dye.swap();
      };

      const step = (dt) => {
        gl.disable(gl.BLEND);
        const t = vel.read.texel;
        draw(P.curl, { texel: t, uVel: vel.read }, curl);
        draw(P.vorticity, { texel: t, uVel: vel.read, uCurl: curl, strength: 9, dt }, vel.write); vel.swap();
        draw(P.divergence, { texel: t, uVel: vel.read }, div);
        draw(P.clear, { uT: press.read, value: 0.8 }, press.write); press.swap();
        for (let i = 0; i < 20; i++) { draw(P.pressure, { texel: t, uP: press.read, uDiv: div }, press.write); press.swap(); }
        draw(P.gradient, { texel: t, uP: press.read, uVel: vel.read }, vel.write); vel.swap();
        draw(P.advect, { texel: t, uVel: vel.read, uSrc: vel.read, dt, diss: 0.35 }, vel.write); vel.swap();
        draw(P.advect, { texel: t, uVel: vel.read, uSrc: dye.read, dt, diss: 1.4 }, dye.write); dye.swap();
        draw(P.display, { texel: dye.read.texel, uDye: dye.read }, null);
      };

      /* ---------- input ---------- */
      const hexToAbsorption = (hex) => {
        if (!hex) return null;
        let c = hex.replace("#", "");
        if (c.length === 3) c = c.split("").map((ch) => ch + ch).join("");
        const num = parseInt(c, 16);
        if (isNaN(num)) return null;
        const r = ((num >> 16) & 255) / 255;
        const g = ((num >> 8) & 255) / 255;
        const b = (num & 255) / 255;
        const k = 0.18;
        return [(1 - r) * k, (1 - g) * k, (1 - b) * k];
      };

      const ink = (x) => {
        const [r, g, b] = hsv((performance.now() * 0.00004 + x * 0.35) % 1, 0.55, 1);
        const k = 0.16;
        return [(1 - r) * k, (1 - g) * k, (1 - b) * k];
      };
      let last = null;
      const move = (e) => {
        if (!activeRef.current) { last = null; return; }
        const x = e.clientX / window.innerWidth, y = 1 - e.clientY / window.innerHeight;
        if (last) {
          const dx = (x - last.x) * 2000, dy = (y - last.y) * 2000;
          if (Math.abs(dx) + Math.abs(dy) > 1) splat(x, y, dx, dy, ink(x), 0.0022);
        }
        last = { x, y };
      };
      const down = (e) => {
        if (!activeRef.current) return;
        const x = e.clientX / window.innerWidth, y = 1 - e.clientY / window.innerHeight;
        splat(x, y, (Math.random() - 0.5) * 400, (Math.random() - 0.5) * 400, ink(x).map((c) => c * 1.4), 0.0035);
        last = { x, y };
      };
      const leave = () => { last = null; };

      const onCustomSplat = (e) => {
        if (!activeRef.current) return;
        const d = e.detail || {};
        const x = typeof d.x === "number" ? d.x : 0.5;
        const y = typeof d.y === "number" ? d.y : 0.5;
        const customColor = d.hexColor ? hexToAbsorption(d.hexColor) : (d.rgb || ink(x).map((c) => c * 1.5));
        const count = d.count || 3;
        const radius = d.radius || 0.004;
        const speed = d.velocity || 700;
        for (let i = 0; i < count; i++) {
          const angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.4;
          const mag = speed * (0.6 + Math.random() * 0.6);
          splat(x, y, Math.cos(angle) * mag, Math.sin(angle) * mag, customColor, radius);
        }
      };

      window.addEventListener("pointermove", move);
      window.addEventListener("pointerdown", down);
      document.addEventListener("pointerleave", leave);
      window.addEventListener("fluid-splat", onCustomSplat);
      cleanups.push(() => {
        window.removeEventListener("pointermove", move);
        window.removeEventListener("pointerdown", down);
        document.removeEventListener("pointerleave", leave);
        window.removeEventListener("fluid-splat", onCustomSplat);
      });

      /* ---------- loop ---------- */
      resize();
      ro = new ResizeObserver(resize); ro.observe(canvas);
      const seed = () => {
        for (let i = 0; i < 2; i++) {
          const x = 0.3 + Math.random() * 0.4, y = 0.3 + Math.random() * 0.4;
          splat(x, y, (Math.random() - 0.5) * 600, (Math.random() - 0.5) * 600, ink(x).map((c) => c * 1.2), 0.003);
        }
      };
      seed();
      let prev = performance.now(), ambient = prev + 5000;
      const frame = (now) => {
        if (dead) return;
        raf = requestAnimationFrame(frame);
        const dt = Math.min((now - prev) / 1000, 1 / 30);
        prev = now;
        if (!activeRef.current || document.hidden) return;
        if (now > ambient) { // a very gentle drift
          ambient = now + 7000 + Math.random() * 5000;
          const x = Math.random(), y = Math.random(), a = Math.random() * 6.283;
          splat(x, y, Math.cos(a) * 240, Math.sin(a) * 240, ink(x).map((c) => c * 0.6), 0.0024);
        }
        step(dt);
      };
      raf = requestAnimationFrame(frame);
    } catch (err) {
      console.warn("Fluid cursor disabled:", err);
    }
    return () => {
      dead = true;
      cancelAnimationFrame(raf);
      ro && ro.disconnect();
      cleanups.forEach((fn) => fn());
    };
  }, []);

  return <canvas ref={canvasRef} className="fluid-canvas" aria-hidden="true" style={{ opacity: active ? 0.75 : 0 }} />;
}

export function triggerFluidSplat({
  x = 0.5,
  y = 0.5,
  hexColor = "#4285f4",
  radius = 0.004,
  count = 3,
  velocity = 700,
} = {}) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("fluid-splat", {
        detail: { x, y, hexColor, radius, count, velocity },
      })
    );
  }
}

