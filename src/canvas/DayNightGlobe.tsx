import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useTheme } from '../context/ThemeContext';
import type { TimeOfDay } from '../context/ThemeContext';
import { isLand } from '../data/landMask';

// Home marker (Johannesburg, South Africa)
const HOME = { lat: -26.2, lon: 28.0 };

const DESTINATIONS = [
  { lat: 51.5, lon: -0.1 },    // London
  { lat: 40.7, lon: -74.0 },   // New York
  { lat: 25.2, lon: 55.3 },    // Dubai
  { lat: -33.9, lon: 151.2 },  // Sydney
  { lat: 52.4, lon: 4.9 },     // Amsterdam
  { lat: -23.5, lon: -46.6 },  // São Paulo
  { lat: 1.35, lon: 103.8 },   // Singapore
];

// Representative SAST hour for each manual theme, so switching themes sweeps the terminator
const THEME_HOUR_SAST: Record<Exclude<TimeOfDay, 'auto'>, number> = {
  'pre-dawn': 4.5,
  sunrise: 7,
  daytime: 12.5,
  sunset: 17.5,
  dusk: 19.5,
  night: 23,
};

const DEG = Math.PI / 180;

const latLonToVec = (lat: number, lon: number, radius = 1) => {
  const phi = lat * DEG;
  const lambda = lon * DEG;
  return new THREE.Vector3(
    radius * Math.cos(phi) * Math.sin(lambda),
    radius * Math.sin(phi),
    radius * Math.cos(phi) * Math.cos(lambda),
  );
};

// Subsolar point (approximate: ignores the equation of time)
const getSubsolar = (mode: TimeOfDay, activeTimeOfDay: Exclude<TimeOfDay, 'auto'>, now: Date) => {
  const start = Date.UTC(now.getUTCFullYear(), 0, 0);
  const dayOfYear = (now.getTime() - start) / 86400000;
  const declination = -23.44 * Math.cos(((2 * Math.PI) / 365) * (dayOfYear + 10));
  const utcHours = mode === 'auto'
    ? now.getUTCHours() + now.getUTCMinutes() / 60
    : THEME_HOUR_SAST[activeTimeOfDay] - 2;
  return { lat: declination, lon: -(utcHours - 12) * 15 };
};

const pointVertex = /* glsl */ `
  attribute float aRandom;
  uniform vec3 uSun;
  uniform float uTime;
  uniform float uSize;
  uniform float uPixelRatio;
  varying float vDay;
  varying float vFacing;
  varying float vRandom;
  varying float vLat;
  void main() {
    vec3 n = normalize(position);
    vDay = smoothstep(-0.12, 0.22, dot(n, normalize(uSun)));
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vFacing = dot(normalize(normalMatrix * n), normalize(-mvPosition.xyz));
    vRandom = aRandom;
    vLat = n.y;
    gl_PointSize = uSize * uPixelRatio * (0.75 + 0.25 * vFacing) / -mvPosition.z;
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const pointFragment = /* glsl */ `
  uniform vec3 uDayA;
  uniform vec3 uDayB;
  uniform vec3 uNight;
  uniform vec3 uLights;
  uniform float uTime;
  uniform float uNightAlpha;
  varying float vDay;
  varying float vFacing;
  varying float vRandom;
  varying float vLat;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float d = length(c);
    if (d > 0.5) discard;
    float edge = smoothstep(0.5, 0.25, d);

    vec3 day = mix(uDayA, uDayB, clamp(vLat * 0.5 + 0.5, 0.0, 1.0));
    // A few night-side dots twinkle like city lights
    float isLight = step(0.93, vRandom);
    float twinkle = 0.55 + 0.45 * sin(uTime * (1.5 + vRandom * 3.0) + vRandom * 40.0);
    vec3 night = mix(uNight, uLights, isLight * twinkle);
    vec3 color = mix(night, day, vDay);

    float alpha = mix(uNightAlpha + isLight * twinkle * 0.6, 1.0, vDay);
    alpha *= smoothstep(-0.05, 0.35, vFacing) * edge;
    gl_FragColor = vec4(color, alpha);
    #include <colorspace_fragment>
  }
`;

const arcVertex = /* glsl */ `
  attribute float aT;
  varying float vT;
  varying float vFacing;
  void main() {
    vT = aT;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vFacing = dot(normalize(normalMatrix * normalize(position)), normalize(-mvPosition.xyz));
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const arcFragment = /* glsl */ `
  uniform vec3 uColor;
  uniform float uHead;
  varying float vT;
  varying float vFacing;
  void main() {
    float tail = 0.45;
    float a = smoothstep(uHead - tail, uHead, vT) * step(vT, uHead);
    a *= smoothstep(-0.25, 0.2, vFacing);
    gl_FragColor = vec4(uColor, a * 0.9);
    #include <colorspace_fragment>
  }
`;

const atmosphereVertex = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vNormal = normalize(normalMatrix * normal);
    vView = normalize(-mvPosition.xyz);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const atmosphereFragment = /* glsl */ `
  uniform vec3 uColor;
  uniform float uStrength;
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    // Rendered on the back faces of a larger shell: d is ~-0.48 at the globe's edge and 0 at the shell's edge,
    // so the glow peaks just outside the globe and fades outwards
    float d = dot(vNormal, vView);
    float outer = smoothstep(-0.18, -0.46, d);
    float inner = smoothstep(-0.62, -0.46, d);
    float glow = outer * inner * uStrength;
    gl_FragColor = vec4(uColor, glow * glow * 0.6);
    #include <colorspace_fragment>
  }
`;

const bodyFragment = /* glsl */ `
  uniform vec3 uColor;
  uniform float uAlpha;
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    float facing = clamp(dot(vNormal, vView), 0.0, 1.0);
    // Slightly denser towards the limb for a subtle spherical shading
    float a = uAlpha * (0.55 + 0.45 * pow(1.0 - facing, 1.5));
    gl_FragColor = vec4(uColor, a);
    #include <colorspace_fragment>
  }
`;

const buildLandPoints = () => {
  const total = 22000;
  const positions: number[] = [];
  const randoms: number[] = [];
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < total; i++) {
    const y = 1 - (i / (total - 1)) * 2;
    const lat = Math.asin(y) / DEG;
    const lon = ((((i * golden) / DEG) % 360) + 360) % 360 - 180;
    if (!isLand(lat, lon)) continue;
    const v = latLonToVec(lat, lon, 1);
    positions.push(v.x, v.y, v.z);
    randoms.push(Math.random());
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('aRandom', new THREE.Float32BufferAttribute(randoms, 1));
  return geometry;
};

const buildArc = (from: THREE.Vector3, to: THREE.Vector3) => {
  const segments = 80;
  const angle = from.angleTo(to);
  const height = 0.08 + (angle / Math.PI) * 0.35;
  const positions: number[] = [];
  const ts: number[] = [];
  const q = new THREE.Quaternion();
  const axis = new THREE.Vector3().crossVectors(from, to).normalize();
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    q.setFromAxisAngle(axis, angle * t);
    const p = from.clone().applyQuaternion(q).multiplyScalar(1.005 + height * Math.sin(Math.PI * t));
    positions.push(p.x, p.y, p.z);
    ts.push(t);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('aT', new THREE.Float32BufferAttribute(ts, 1));
  return geometry;
};

// Written by the parent's pointer handlers, read-only here
export interface GlobeDrag {
  total: number;      // running sum of dragged yaw (radians)
  dragging: boolean;
}

interface Props {
  drag: React.MutableRefObject<GlobeDrag>;
}

const DayNightGlobe: React.FC<Props> = ({ drag }) => {
  const { palette, mode, activeTimeOfDay } = useTheme();

  const spinRef = useRef<THREE.Group>(null);
  const markerRingRef = useRef<THREE.Mesh>(null);
  const pointMat = useRef<THREE.ShaderMaterial>(null);
  const atmoMat = useRef<THREE.ShaderMaterial>(null);
  const bodyMat = useRef<THREE.ShaderMaterial>(null);
  const bodyUniforms = useMemo(() => ({
    uColor: { value: new THREE.Color(palette.primary) },
    uAlpha: { value: 0.08 },
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), []);
  const arcGroupRef = useRef<THREE.Group>(null);
  const spin = useRef({ offset: 0, velocity: 0, lastTotal: 0 });

  const landGeometry = useMemo(() => buildLandPoints(), []);
  const home = useMemo(() => latLonToVec(HOME.lat, HOME.lon, 1), []);
  const arcs = useMemo(
    () => DESTINATIONS.map((d, i) => ({
      geometry: buildArc(home, latLonToVec(d.lat, d.lon, 1)),
      delay: i * 0.9,
      duration: 3.2 + (i % 3) * 0.6,
    })),
    [home],
  );

  const pointUniforms = useMemo(() => ({
    uSun: { value: new THREE.Vector3(0, 0, 1) },
    uTime: { value: 0 },
    uSize: { value: 7 },
    uPixelRatio: { value: Math.min(window.devicePixelRatio || 1, 2) },
    uDayA: { value: new THREE.Color(palette.primary) },
    uDayB: { value: new THREE.Color(palette.secondary) },
    uNight: { value: new THREE.Color('#64748b') },
    uLights: { value: new THREE.Color('#fcd34d') },
    uNightAlpha: { value: 0.35 },
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), []);

  const arcMaterials = useMemo(
    () => arcs.map(() => new THREE.ShaderMaterial({
      vertexShader: arcVertex,
      fragmentShader: arcFragment,
      uniforms: { uColor: { value: new THREE.Color(palette.primary) }, uHead: { value: 0 } },
      transparent: true,
      depthWrite: false,
    })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [arcs],
  );

  const arcLines = useMemo(
    () => arcs.map((arc, i) => new THREE.Line(arc.geometry, arcMaterials[i])),
    [arcs, arcMaterials],
  );

  const atmosphereUniforms = useMemo(() => ({
    uColor: { value: new THREE.Color(palette.primary) },
    uStrength: { value: 0.9 },
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), []);

  const sunTarget = useRef(new THREE.Vector3());
  const sunCurrent = useRef<THREE.Vector3 | null>(null);
  const targetColors = useRef({
    a: new THREE.Color(), b: new THREE.Color(), night: new THREE.Color(),
  });

  // Centre the view on home: yaw brings its longitude to the front, a partial pitch tilts it up
  const baseYaw = -HOME.lon * DEG;
  const basePitch = HOME.lat * DEG * 0.55;

  useFrame((state, delta) => {
    const pu = pointMat.current?.uniforms;
    const au = atmoMat.current?.uniforms;
    const tc = targetColors.current;
    if (!pu || !au) return;
    const t = state.clock.getElapsedTime();
    const dt = Math.min(delta, 0.05);

    // Sun direction eases towards the target so theme switches sweep the terminator across the globe
    const sub = getSubsolar(mode, activeTimeOfDay, new Date());
    sunTarget.current.copy(latLonToVec(sub.lat, sub.lon, 1));
    if (!sunCurrent.current) sunCurrent.current = sunTarget.current.clone();
    sunCurrent.current.lerp(sunTarget.current, 1 - Math.exp(-dt * 1.6)).normalize();
    pu.uSun.value.copy(sunCurrent.current);
    pu.uTime.value = t;

    // Theme colours blend smoothly like the rest of the site
    tc.a.set(palette.primary);
    tc.b.set(palette.secondary);
    tc.night.set(palette.isDark ? '#cbd5e1' : '#64748b');
    const k = 1 - Math.exp(-dt * 2);
    pu.uDayA.value.lerp(tc.a, k);
    pu.uDayB.value.lerp(tc.b, k);
    pu.uNight.value.lerp(tc.night, k);
    pu.uNightAlpha.value += ((palette.isDark ? 0.8 : 0.5) - pu.uNightAlpha.value) * k;
    au.uColor.value.lerp(tc.a, k);
    au.uStrength.value += ((palette.isDark ? 0.9 : 0.55) - au.uStrength.value) * k;
    const bu = bodyMat.current?.uniforms;
    if (bu) {
      bu.uColor.value.lerp(tc.b, k);
      bu.uAlpha.value += ((palette.isDark ? 0.08 : 0.05) - bu.uAlpha.value) * k;
    }

    // Idle sway around home, plus whatever the user dragged in (which slowly drifts back)
    const s = spin.current;
    const input = drag.current;
    const moved = input.total - s.lastTotal;
    s.lastTotal = input.total;
    if (input.dragging) {
      s.offset += moved;
      s.velocity = moved;
    } else {
      s.offset += s.velocity;
      s.velocity *= Math.pow(0.94, dt * 60);
      // Once the spin settles, drift gently back towards home
      if (Math.abs(s.velocity) < 0.002) s.offset -= s.offset * (1 - Math.exp(-dt * 0.35));
    }
    if (spinRef.current) {
      spinRef.current.rotation.y = baseYaw + Math.sin(t * 0.12) * 0.32 + s.offset;
    }

    // Arcs fire from home in a staggered loop
    arcGroupRef.current?.children.forEach((child, i) => {
      const arc = arcs[i];
      const uniforms = ((child as THREE.Line).material as THREE.ShaderMaterial).uniforms;
      const cycle = arc.duration + 2.2;
      const local = ((t - arc.delay) % cycle + cycle) % cycle;
      uniforms.uHead.value = t < arc.delay ? 0 : (local / arc.duration) * 1.45;
      uniforms.uColor.value.lerp(tc.a, k);
    });

    if (markerRingRef.current) {
      const pulse = (t * 0.6) % 1;
      markerRingRef.current.scale.setScalar(0.6 + pulse * 2.2);
      (markerRingRef.current.material as THREE.MeshBasicMaterial).opacity = (1 - pulse) * 0.8;
    }
  });

  const markerQuaternion = useMemo(
    () => new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), home.clone().normalize()),
    [home],
  );

  return (
    <group rotation={[basePitch, 0, 0]}>
      <group ref={spinRef}>
        {/* Atmosphere rim */}
        <mesh scale={1.14}>
          <sphereGeometry args={[1, 64, 64]} />
          <shaderMaterial
            vertexShader={atmosphereVertex}
            fragmentShader={atmosphereFragment}
            ref={atmoMat}
            uniforms={atmosphereUniforms}
            transparent
            depthWrite={false}
            side={THREE.BackSide}
          />
        </mesh>

        {/* Faint body so the globe reads as a solid object */}
        <mesh scale={0.985}>
          <sphereGeometry args={[1, 64, 64]} />
          <shaderMaterial
            ref={bodyMat}
            vertexShader={atmosphereVertex}
            fragmentShader={bodyFragment}
            uniforms={bodyUniforms}
            transparent
            depthWrite={false}
          />
        </mesh>

        {/* Land dots */}
        <points geometry={landGeometry}>
          <shaderMaterial
            vertexShader={pointVertex}
            fragmentShader={pointFragment}
            ref={pointMat}
            uniforms={pointUniforms}
            transparent
            depthWrite={false}
          />
        </points>

        {/* Arcs */}
        <group ref={arcGroupRef}>
          {arcLines.map((line, i) => (
            <primitive key={i} object={line} />
          ))}
        </group>

        {/* Home marker */}
        <group position={home.clone().multiplyScalar(1.01)} quaternion={markerQuaternion}>
          <mesh>
            <circleGeometry args={[0.022, 24]} />
            <meshBasicMaterial color={palette.primary} />
          </mesh>
          <mesh ref={markerRingRef}>
            <ringGeometry args={[0.03, 0.038, 40]} />
            <meshBasicMaterial color={palette.primary} transparent depthWrite={false} />
          </mesh>
        </group>
      </group>
    </group>
  );
};

export default DayNightGlobe;
