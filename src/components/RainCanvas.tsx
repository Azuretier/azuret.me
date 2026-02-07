'use client'

import { useEffect, useRef } from 'react'

const VERTEX_SHADER = `
attribute vec2 a_position;
varying vec2 vUv;
void main() {
    vUv = a_position * 0.5 + 0.5;
    gl_Position = vec4(a_position, 0.0, 1.0);
}
`

const FRAGMENT_SHADER = `
#ifdef GL_ES
precision highp float;
#endif

varying vec2 vUv;
uniform sampler2D u_tex0;
uniform vec2 u_tex0_resolution;
uniform float u_time;
uniform vec2 u_resolution;
uniform float u_speed;
uniform float u_intensity;
uniform float u_normal;
uniform float u_brightness;
uniform float u_blur_intensity;
uniform float u_zoom;
uniform int u_blur_iterations;
uniform bool u_panning;
uniform bool u_post_processing;
uniform bool u_lightning;
uniform bool u_texture_fill;

#define S(a, b, t) smoothstep(a, b, t)

vec3 N13(float p) {
    vec3 p3 = fract(vec3(p) * vec3(.1031, .11369, .13787));
    p3 += dot(p3, p3.yzx + 19.19);
    return fract(vec3((p3.x + p3.y) * p3.z, (p3.x + p3.z) * p3.y, (p3.y + p3.z) * p3.x));
}

vec4 N14(float t) {
    return fract(sin(t * vec4(123., 1024., 1456., 264.)) * vec4(6547., 345., 8799., 1564.));
}
float N(float t) {
    return fract(sin(t * 12345.564) * 7658.76);
}

float Saw(float b, float t) {
    return S(0., b, t) * S(1., b, t);
}

vec2 DropLayer2(vec2 uv, float t) {
    vec2 UV = uv;
    uv.y += t * 0.75;
    vec2 a = vec2(6., 1.);
    vec2 grid = a * 2.;
    vec2 id = floor(uv * grid);
    float colShift = N(id.x);
    uv.y += colShift;
    id = floor(uv * grid);
    vec3 n = N13(id.x * 35.2 + id.y * 2376.1);
    vec2 st = fract(uv * grid) - vec2(.5, 0);
    float x = n.x - .5;
    float y = UV.y * 20.;
    float wiggle = sin(y + sin(y));
    x += wiggle * (.5 - abs(x)) * (n.z - .5);
    x *= .7;
    float ti = fract(t + n.z);
    y = (Saw(.85, ti) - .5) * .9 + .5;
    vec2 p = vec2(x, y);
    float d = length((st - p) * a.yx);
    float mainDrop = S(.4, .0, d);
    float r = sqrt(S(1., y, st.y));
    float cd = abs(st.x - x);
    float trail = S(.23 * r, .15 * r * r, cd);
    float trailFront = S(-.02, .02, st.y - y);
    trail *= trailFront * r * r;
    y = UV.y;
    float trail2 = S(.2 * r, .0, cd);
    float droplets = max(0., (sin(y * (1. - y) * 120.) - st.y)) * trail2 * trailFront * n.z;
    y = fract(y * 10.) + (st.y - .5);
    float dd = length(st - vec2(x, y));
    droplets = S(.3, 0., dd);
    float m = mainDrop + droplets * r * trailFront;
    return vec2(m, trail);
}

float StaticDrops(vec2 uv, float t) {
    uv *= 40.;
    vec2 id = floor(uv);
    uv = fract(uv) - .5;
    vec3 n = N13(id.x * 107.45 + id.y * 3543.654);
    vec2 p = (n.xy - .5) * .7;
    float d = length(uv - p);
    float fade = Saw(.025, fract(t + n.z));
    float c = S(.3, 0., d) * fract(n.z * 10.) * fade;
    return c;
}

vec2 Drops(vec2 uv, float t, float l0, float l1, float l2) {
    float s = StaticDrops(uv, t) * l0;
    vec2 m1 = DropLayer2(uv, t) * l1;
    vec2 m2 = DropLayer2(uv * 1.85, t) * l2;
    float c = s + m1.x + m2.x;
    c = S(.3, 1., c);
    return vec2(c, max(m1.y * l0, m2.y * l1));
}

float N21(vec2 p) {
    p = fract(p * vec2(123.34, 345.45));
    p += dot(p, p + 34.345);
    return fract(p.x * p.y);
}

void main() {
    vec2 uv = (gl_FragCoord.xy - .5 * u_resolution.xy) / u_resolution.y;
    vec2 UV = gl_FragCoord.xy / u_resolution.xy;
    float T = u_time;

    if(u_texture_fill) {
        float screenAspect = u_resolution.x / u_resolution.y;
        float textureAspect = u_tex0_resolution.x / u_tex0_resolution.y;
        float scaleX = 1., scaleY = 1.;
        if(textureAspect > screenAspect)
            scaleX = screenAspect / textureAspect;
        else
            scaleY = textureAspect / screenAspect;
        UV = vec2(scaleX, scaleY) * (UV - 0.5) + 0.5;
    }

    float t = T * .2 * u_speed;
    float rainAmount = u_intensity;
    float zoom = u_panning ? -cos(T * .2) : 0.;
    uv *= (.7 + zoom * .3) * u_zoom;

    float staticDrops = S(-.5, 1., rainAmount) * 2.;
    float layer1 = S(.25, .75, rainAmount);
    float layer2 = S(.0, .5, rainAmount);

    vec2 c = Drops(uv, t, staticDrops, layer1, layer2);
    vec2 e = vec2(.001, 0.) * u_normal;
    float cx = Drops(uv + e, t, staticDrops, layer1, layer2).x;
    float cy = Drops(uv + e.yx, t, staticDrops, layer1, layer2).x;
    vec2 n = vec2(cx - c.x, cy - c.x);

    vec3 col = texture2D(u_tex0, UV + n).rgb;
    vec4 texCoord = vec4(UV.x + n.x, UV.y + n.y, 0, 1.0 * 25. * 0.01 / 7.);

    if(u_blur_iterations != 1) {
        float blur = u_blur_intensity;
        blur *= 0.01;
        float a = N21(gl_FragCoord.xy) * 6.2831;
        for(int m = 0; m < 64; m++) {
            if(m > u_blur_iterations)
                break;
            vec2 offs = vec2(sin(a), cos(a)) * blur;
            float d = fract(sin((float(m) + 1.) * 546.) * 5424.);
            d = sqrt(d);
            offs *= d;
            col += texture2D(u_tex0, texCoord.xy + vec2(offs.x, offs.y)).xyz;
            a++;
        }
        col /= float(u_blur_iterations);
    }

    t = (T + 3.) * .5;
    if(u_post_processing) {
        col *= mix(vec3(1.), vec3(.8, .9, 1.3), 1.);
    }
    float fade = S(0., 10., T);

    if(u_lightning) {
        float lightning = sin(t * sin(t * 10.));
        lightning *= pow(max(0., sin(t + sin(t))), 10.);
        col *= 1. + lightning * fade * mix(1., .1, 0.);
    }
    col *= 1. - dot(UV -= .5, UV) * 1.;

    gl_FragColor = vec4(col * u_brightness, 1);
}
`

function compileShader(gl: WebGLRenderingContext, type: number, source: string): WebGLShader | null {
  const shader = gl.createShader(type)
  if (!shader) return null
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error('Shader compile error:', gl.getShaderInfoLog(shader))
    gl.deleteShader(shader)
    return null
  }
  return shader
}

function linkProgram(gl: WebGLRenderingContext, vs: WebGLShader, fs: WebGLShader): WebGLProgram | null {
  const program = gl.createProgram()
  if (!program) return null
  gl.attachShader(program, vs)
  gl.attachShader(program, fs)
  gl.linkProgram(program)
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error('Program link error:', gl.getProgramInfoLog(program))
    gl.deleteProgram(program)
    return null
  }
  return program
}

function generateBackgroundTexture(width: number, height: number): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')!

  // Dark moody gradient background
  const grad = ctx.createLinearGradient(0, 0, width * 0.4, height)
  grad.addColorStop(0, '#0d0d1f')
  grad.addColorStop(0.4, '#0a0818')
  grad.addColorStop(0.7, '#0e0820')
  grad.addColorStop(1, '#080614')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, width, height)

  // Bokeh circles - simulates out-of-focus city lights behind rainy glass
  const colors = [
    '#5b6ee1', '#e1a05b', '#e15b8a', '#5be1c4', '#e1d75b',
    '#7b8ef1', '#f0c070', '#ff6b9d', '#4dd4ac', '#fff176',
    '#a78bfa', '#f9a8d4',
  ]

  for (let i = 0; i < 60; i++) {
    const x = Math.random() * width
    const y = Math.random() * height
    const r = 10 + Math.random() * 90
    const color = colors[Math.floor(Math.random() * colors.length)]

    const gradient = ctx.createRadialGradient(x, y, 0, x, y, r)
    gradient.addColorStop(0, color + '28')
    gradient.addColorStop(0.3, color + '14')
    gradient.addColorStop(0.6, color + '08')
    gradient.addColorStop(1, color + '00')

    ctx.fillStyle = gradient
    ctx.beginPath()
    ctx.arc(x, y, r, 0, Math.PI * 2)
    ctx.fill()
  }

  return canvas
}

export default function RainCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const gl = canvas.getContext('webgl', { antialias: false, alpha: false })
    if (!gl) return

    const vs = compileShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER)
    const fs = compileShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER)
    if (!vs || !fs) return

    const program = linkProgram(gl, vs, fs)
    if (!program) return

    // Fullscreen quad
    const buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      -1, -1, 1, -1, -1, 1,
      -1, 1, 1, -1, 1, 1,
    ]), gl.STATIC_DRAW)

    const posLoc = gl.getAttribLocation(program, 'a_position')

    // Generate background texture
    const texW = 1024
    const texH = 1024
    const texCanvas = generateBackgroundTexture(texW, texH)

    const texture = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_2D, texture)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texCanvas)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)

    // Uniform locations
    const loc = {
      u_tex0: gl.getUniformLocation(program, 'u_tex0'),
      u_tex0_resolution: gl.getUniformLocation(program, 'u_tex0_resolution'),
      u_time: gl.getUniformLocation(program, 'u_time'),
      u_resolution: gl.getUniformLocation(program, 'u_resolution'),
      u_speed: gl.getUniformLocation(program, 'u_speed'),
      u_intensity: gl.getUniformLocation(program, 'u_intensity'),
      u_normal: gl.getUniformLocation(program, 'u_normal'),
      u_brightness: gl.getUniformLocation(program, 'u_brightness'),
      u_blur_intensity: gl.getUniformLocation(program, 'u_blur_intensity'),
      u_zoom: gl.getUniformLocation(program, 'u_zoom'),
      u_blur_iterations: gl.getUniformLocation(program, 'u_blur_iterations'),
      u_panning: gl.getUniformLocation(program, 'u_panning'),
      u_post_processing: gl.getUniformLocation(program, 'u_post_processing'),
      u_lightning: gl.getUniformLocation(program, 'u_lightning'),
      u_texture_fill: gl.getUniformLocation(program, 'u_texture_fill'),
    }

    function resize() {
      const dpr = Math.min(window.devicePixelRatio, 2)
      canvas!.width = canvas!.clientWidth * dpr
      canvas!.height = canvas!.clientHeight * dpr
      gl!.viewport(0, 0, canvas!.width, canvas!.height)
    }

    resize()
    window.addEventListener('resize', resize)

    const t0 = performance.now()

    function render() {
      const time = (performance.now() - t0) / 1000

      gl!.useProgram(program)

      gl!.activeTexture(gl!.TEXTURE0)
      gl!.bindTexture(gl!.TEXTURE_2D, texture)
      gl!.uniform1i(loc.u_tex0, 0)

      gl!.uniform2f(loc.u_tex0_resolution, texW, texH)
      gl!.uniform1f(loc.u_time, time)
      gl!.uniform2f(loc.u_resolution, canvas!.width, canvas!.height)
      gl!.uniform1f(loc.u_speed, 1.0)
      gl!.uniform1f(loc.u_intensity, 0.4)
      gl!.uniform1f(loc.u_normal, 0.8)
      gl!.uniform1f(loc.u_brightness, 0.65)
      gl!.uniform1f(loc.u_blur_intensity, 0.5)
      gl!.uniform1f(loc.u_zoom, 1.2)
      gl!.uniform1i(loc.u_blur_iterations, 16)
      gl!.uniform1i(loc.u_panning, 0)
      gl!.uniform1i(loc.u_post_processing, 1)
      gl!.uniform1i(loc.u_lightning, 0)
      gl!.uniform1i(loc.u_texture_fill, 1)

      gl!.bindBuffer(gl!.ARRAY_BUFFER, buffer)
      gl!.enableVertexAttribArray(posLoc)
      gl!.vertexAttribPointer(posLoc, 2, gl!.FLOAT, false, 0, 0)

      gl!.drawArrays(gl!.TRIANGLES, 0, 6)

      animRef.current = requestAnimationFrame(render)
    }

    render()

    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(animRef.current)
      gl.deleteProgram(program)
      gl.deleteShader(vs)
      gl.deleteShader(fs)
      gl.deleteBuffer(buffer)
      gl.deleteTexture(texture)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full"
      style={{ zIndex: -1 }}
    />
  )
}
