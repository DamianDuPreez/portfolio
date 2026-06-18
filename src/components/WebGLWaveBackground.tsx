import React, { useRef, useEffect } from 'react';

// --- Utility: Convert Hex to RGB [0..1] ---
const hexToRgb = (hex: string): [number, number, number] => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [
        parseInt(result[1], 16) / 255,
        parseInt(result[2], 16) / 255,
        parseInt(result[3], 16) / 255,
      ]
    : [0, 0, 0];
};

// --- Shaders ---
const vertexShaderSource = `
  attribute vec2 a_position;
  varying vec2 v_uv;
  void main() {
    v_uv = a_position * 0.5 + 0.5;
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`;

const fragmentShaderSource = `
  precision highp float;
  varying vec2 v_uv;
  uniform float u_time;
  uniform vec2 u_resolution;
  uniform vec3 u_color1;
  uniform vec3 u_color2;
  uniform vec3 u_color3;
  uniform vec3 u_color4;

  void main() {
    vec2 rawUV = gl_FragCoord.xy / u_resolution.xy;
    
    // Sped up by 50%
    float t = u_time * 0.225;
    
    // Complex overlapping folds for a 3D flag/ribbon effect
    float fold1 = sin(rawUV.y * 4.0 + rawUV.x * 2.0 + t);
    float fold2 = cos(rawUV.x * 5.0 - rawUV.y * 3.0 - t * 1.2);
    
    // Warp the coordinates to create sweeping, wavy curves (less like straight lines)
    float warp = fold1 * 0.15 + fold2 * 0.1;
    
    // Calculate the diagonal gradient value 'v'
    // Increased warp influence to make the boundaries very wavy and organic
    float v = (1.0 - rawUV.x) * 1.8 + rawUV.y * 1.2 + warp * 1.5 - 0.6;

    // Smoothly mix the base colors based on v
    vec3 color = u_color4; // Bright orange base
    
    color = mix(color, u_color3, smoothstep(0.2, 0.5, v));  // Orange -> Purple
    color = mix(color, u_color2, smoothstep(0.4, 0.8, v));  // Purple -> Pink
    color = mix(color, u_color1, smoothstep(0.8, 1.5, v));  // Pink -> Blue

    // --- 3D Shading & Washing Effect ---
    // Simulate directional lighting by shifting the phase of the folds by pi/2 (approx 1.57)
    float light1 = sin(rawUV.y * 4.0 + rawUV.x * 2.0 + t + 1.57);
    float light2 = cos(rawUV.x * 5.0 - rawUV.y * 3.0 - t * 1.2 + 1.57);
    float shading = light1 * 0.15 + light2 * 0.1; 
    
    // Apply lighting: darkens valleys, brightens peaks. 
    // Base is 0.85 to dim the overall brightness as requested.
    color *= (0.85 + shading * 0.6);
    
    // Wash the colors out to make them softer and less solid
    vec3 mutedTone = vec3(0.88, 0.85, 0.88); // Soft warm grey
    color = mix(color, mutedTone, 0.25); // Blend 25% to wash out

    // Fade to white on the right/bottom-right
    vec3 white = vec3(1.0);
    // This creates the sweeping, soft border between color and white
    color = mix(white, color, smoothstep(0.1, 0.45, v));
    
    // Add subtle, high-frequency film grain for a premium texture
    float grain = fract(sin(dot(rawUV.xy, vec2(12.9898, 78.233))) * 43758.5453);
    color += (grain - 0.5) * 0.04;

    gl_FragColor = vec4(color, 1.0);
  }
`;

function createShader(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error('Shader compile error:', gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function createProgram(gl: WebGLRenderingContext, vertexShader: WebGLShader, fragmentShader: WebGLShader) {
  const program = gl.createProgram();
  if (!program) return null;
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error('Program link error:', gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    return null;
  }
  return program;
}

const WebGLWaveBackground: React.FC<{ className?: string }> = ({ className = '' }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const gl = canvas.getContext('webgl');
    if (!gl) {
      console.warn('WebGL not supported');
      return;
    }

    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
    if (!vertexShader || !fragmentShader) return;

    const program = createProgram(gl, vertexShader, fragmentShader);
    if (!program) return;

    gl.useProgram(program);

    // Geometry (full screen quad)
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      -1.0, -1.0,
       1.0, -1.0,
      -1.0,  1.0,
      -1.0,  1.0,
       1.0, -1.0,
       1.0,  1.0,
    ]), gl.STATIC_DRAW);

    const positionLocation = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    // Uniforms
    const timeLocation = gl.getUniformLocation(program, "u_time");
    const resolutionLocation = gl.getUniformLocation(program, "u_resolution");
    const color1Location = gl.getUniformLocation(program, "u_color1");
    const color2Location = gl.getUniformLocation(program, "u_color2");
    const color3Location = gl.getUniformLocation(program, "u_color3");
    const color4Location = gl.getUniformLocation(program, "u_color4");

    // Hardcoded Reference Colors
    const c1 = hexToRgb('#7ca8ff'); // Soft blue
    const c2 = hexToRgb('#ff5ebd'); // Deep pink
    const c3 = hexToRgb('#8c52ff'); // Vivid purple
    const c4 = hexToRgb('#ff8e52'); // Bright orange

    const resize = () => {
      // Adjust resolution by dpr for high-dpi screens
      const dpr = window.devicePixelRatio || 1;
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
    };

    window.addEventListener('resize', resize);
    resize();

    let animationFrameId: number;
    let startTime = performance.now();
    let isVisible = true;

    const render = (time: number) => {
      if (!isVisible) {
        animationFrameId = requestAnimationFrame(render);
        return; // Skip drawing when not visible or hidden
      }

      gl.uniform1f(timeLocation, (time - startTime) * 0.001); // Standard multiplier, slowed inside shader
      gl.uniform3f(color1Location, c1[0], c1[1], c1[2]);
      gl.uniform3f(color2Location, c2[0], c2[1], c2[2]);
      gl.uniform3f(color3Location, c3[0], c3[1], c3[2]);
      gl.uniform3f(color4Location, c4[0], c4[1], c4[2]);

      gl.drawArrays(gl.TRIANGLES, 0, 6);
      animationFrameId = requestAnimationFrame(render);
    };
    
    animationFrameId = requestAnimationFrame(render);

    // Performance optimizations: Stop WebGL calculation when not visible
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        isVisible = entry.isIntersecting && !document.hidden;
      });
    }, { threshold: 0.1 });
    
    observer.observe(canvas);

    const handleVisibilityChange = () => {
      isVisible = !document.hidden;
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener('resize', resize);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      observer.disconnect();
      cancelAnimationFrame(animationFrameId);
      
      // Cleanup WebGL resources
      gl.deleteBuffer(positionBuffer);
      gl.deleteProgram(program);
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className={`w-full h-full block ${className}`} 
      style={{ touchAction: 'none' }}
    />
  );
};

export default WebGLWaveBackground;
