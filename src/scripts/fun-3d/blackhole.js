// The black hole for the sun's collapse (fun-blackhole.js): event horizon, photon ring, a tilted
// accretion disk with banded, Doppler-bright gas in stepped colors, its far side lensed into a halo
// around the hole, and debris spiraling in. Drawn at a third of the screen resolution and scaled up
// pixelated, to match the rest of the art. Created for the sequence and disposed right after.
import * as THREE from 'three';

const SCALE = 3;

const diskMaterial = (lensed) =>
  new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    uniforms: { uTime: { value: 0 }, uGain: { value: lensed ? 0.75 : 1 } },
    vertexShader: /* glsl */ `
      varying vec2 vPos;
      void main() {
        vPos = position.xy;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }`,
    fragmentShader: /* glsl */ `
      uniform float uTime;
      uniform float uGain;
      varying vec2 vPos;
      float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      float noise(vec2 p) {
        vec2 i = floor(p), f = fract(p);
        f = f * f * (3.0 - 2.0 * f);
        return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y);
      }
      void main() {
        float r = length(vPos);
        float a = atan(vPos.y, vPos.x);
        float t = clamp((r - 6.5) / 16.0, 0.0, 1.0);
        // Gas orbits faster near the hole; bands and clumps stream around.
        float swirl = a + uTime * (2.4 / (0.4 + t * 2.0));
        float bands = 0.6 + 0.4 * sin(r * 2.1 - uTime * 1.5) * noise(vec2(swirl * 2.0, r * 0.6));
        float heat = pow(1.0 - t, 1.6) * bands;
        // Doppler: the side moving toward us is brighter.
        heat *= 0.55 + 0.9 * smoothstep(-1.0, 1.0, -cos(a));
        heat *= uGain;
        // Stepped palette, like the pixel art.
        vec3 col = heat > 0.85 ? vec3(1.0, 0.96, 0.84) : heat > 0.6 ? vec3(0.99, 0.72, 0.07) : heat > 0.38 ? vec3(0.91, 0.39, 0.12) : vec3(0.56, 0.17, 0.10);
        float alpha = smoothstep(0.08, 0.2, heat) * smoothstep(1.0, 0.85, t);
        gl_FragColor = vec4(col * alpha, alpha);
      }`,
  });

function glowTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const g = c.getContext('2d');
  const grad = g.createRadialGradient(32, 32, 8, 32, 32, 32);
  grad.addColorStop(0, 'rgba(253,184,19,0.5)');
  grad.addColorStop(1, 'rgba(253,184,19,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(c);
}

/** Open the hole centered on screen point (x, y). Returns { swallow(), dispose() }. */
export function open({ x, y }) {
  const canvas = document.createElement('canvas');
  canvas.className = 'blackhole3d';
  canvas.setAttribute('aria-hidden', 'true');
  document.body.append(canvas);
  const W = Math.ceil(innerWidth / SCALE);
  const H = Math.ceil(innerHeight / SCALE);
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false });
  renderer.setPixelRatio(1);
  renderer.setSize(W, H, false);
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, W / H, 0.1, 500);
  camera.position.z = 70;
  // Shift the view so the hole's center sits on the sun's spot.
  camera.setViewOffset(W, H, W / 2 - x / SCALE, H / 2 - y / SCALE, W, H);

  const hole = new THREE.Group();
  scene.add(hole);

  const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexture(), depthWrite: false, blending: THREE.AdditiveBlending }));
  glow.scale.setScalar(70);
  hole.add(glow);

  // Far side of the disk, bent over and under the horizon (drawn facing us, behind the hole).
  const lensMat = diskMaterial(true);
  const lens = new THREE.Mesh(new THREE.RingGeometry(6.6, 13, 128, 3), lensMat);
  lens.position.z = -2;
  hole.add(lens);

  const horizon = new THREE.Mesh(new THREE.SphereGeometry(6, 32, 16), new THREE.MeshBasicMaterial({ color: '#000000' }));
  hole.add(horizon);

  const photon = new THREE.Mesh(new THREE.RingGeometry(6.05, 6.7, 96), new THREE.MeshBasicMaterial({ color: '#fff4d6', transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
  photon.position.z = 6.2;
  hole.add(photon);

  // Near side of the disk, tilted toward us; it passes in front of the horizon's lower half.
  const diskMat = diskMaterial(false);
  const disk = new THREE.Mesh(new THREE.RingGeometry(6.5, 24, 160, 4), diskMat);
  disk.rotation.x = -1.32;
  hole.add(disk);

  // Debris spiraling in along the disk plane.
  const N = 500;
  const pos = new Float32Array(N * 3);
  const orbit = Array.from({ length: N }, () => ({ r: 8 + Math.random() * 30, a: Math.random() * Math.PI * 2, h: (Math.random() - 0.5) * 1.5 }));
  const dustGeo = new THREE.BufferGeometry();
  dustGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const dust = new THREE.Points(dustGeo, new THREE.PointsMaterial({ color: '#ffd98a', size: 1, sizeAttenuation: false, transparent: true, opacity: 0.9, depthWrite: false }));
  dust.rotation.x = disk.rotation.x;
  hole.add(dust);

  hole.scale.setScalar(0.001);
  let t = 0;
  let last = performance.now();
  let swallowAt = -1;
  let frame = 0;

  const loop = (now) => {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    t += dt;
    // Grows open over 0.9 s, with a little overshoot.
    const g = Math.min(1, t / 0.9);
    const grow = 1 - Math.pow(1 - g, 3) + Math.sin(g * Math.PI) * 0.08;
    // Swallowing: the camera dives in and the hole fills the screen.
    const s = swallowAt < 0 ? 0 : Math.min(1, (t - swallowAt) / 2.4);
    hole.scale.setScalar(Math.max(0.001, grow * (1 + s * s * 5)));
    hole.rotation.z = Math.sin(t * 0.4) * 0.04;
    diskMat.uniforms.uTime.value = t;
    lensMat.uniforms.uTime.value = t;
    glow.material.opacity = 0.8 + Math.sin(t * 3) * 0.1;
    orbit.forEach((o, i) => {
      o.a += dt * (14 / Math.pow(o.r, 1.2));
      o.r -= dt * (1.5 + 24 / o.r);
      if (o.r < 6.5) {
        o.r = 26 + Math.random() * 12;
        o.a = Math.random() * Math.PI * 2;
      }
      pos[i * 3] = Math.cos(o.a) * o.r;
      pos[i * 3 + 1] = Math.sin(o.a) * o.r;
      pos[i * 3 + 2] = o.h;
    });
    dustGeo.attributes.position.needsUpdate = true;
    renderer.render(scene, camera);
    frame = requestAnimationFrame(loop);
  };
  frame = requestAnimationFrame(loop);

  return {
    swallow() {
      swallowAt = t;
    },
    dispose() {
      cancelAnimationFrame(frame);
      scene.traverse((o) => {
        o.geometry?.dispose();
        o.material?.map?.dispose();
        o.material?.dispose();
      });
      renderer.dispose();
      renderer.forceContextLoss();
      canvas.remove();
    },
  };
}
