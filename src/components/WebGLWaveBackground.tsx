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
  uniform vec3 u_color1; // Soft Blue
  uniform vec3 u_color2; // Deep Pink
  uniform vec3 u_color3; // Vivid Purple
  uniform vec3 u_color4; // Bright Orange

  void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    float t = u_time * 0.2;

    // Background is stark white
    vec3 finalColor = vec3(1.0);

    // Array of colors for the 4 ribbon layers
    // We draw from back to front: Orange, Purple, Pink, Blue
    vec3 colors[4];
    colors[0] = u_color4; 
    colors[1] = u_color3; 
    colors[2] = u_color2; 
    colors[3] = u_color1; 

    // Iterate through layers
    for(int i = 0; i < 4; i++) {
        float fi = float(i);
        
        // Independent movement for each ribbon
        float speed = t * (0.8 + fi * 0.2);
        float freqX = 1.5 + fi * 0.4;
        
        // High-amplitude intersecting waves so ribbons overlap and hide/reveal each other
        float wave1 = sin(uv.x * freqX + speed) * 0.35;
        float wave2 = cos(uv.x * (freqX * 0.7) - speed * 1.3) * 0.25;
        float wave = wave1 + wave2;

        // Base sweeping curve
        // Small vertical offset (fi * 0.15) ensures they stay roughly in order but easily intersect due to the massive wave amplitude
        float baseCurve = (1.0 - uv.x) * 2.0 - 0.4 + (fi * 0.15);
        
        // The Y-coordinate of this ribbon's top edge
        float edgeY = baseCurve + wave;

        // Mask: 1.0 if pixel is below the ribbon's edge
        float edgeWidth = 0.015; // Smooth anti-aliased edge
        float mask = smoothstep(edgeWidth, -edgeWidth, uv.y - edgeY);

        // Specular Highlights ("White lines" for 3D realism)
        // High intensity right at the edge, fading downwards
        float highlight = smoothstep(edgeWidth * 4.0, 0.0, edgeY - uv.y) * 0.65;
        // Add a shimmer effect so the highlight rolls along the ribbon
        highlight *= (sin(uv.x * 8.0 + speed * 2.5) * 0.5 + 0.5);

        // Drop Shadow cast onto the background/layers underneath
        // Casts slightly above the edge
        float shadow = smoothstep(0.15, 0.0, uv.y - edgeY) * 0.4;
        
        // Apply shadow to whatever is currently behind this ribbon
        vec3 bgWithShadow = finalColor * (1.0 - shadow);

        // Calculate final color of this ribbon pixel
        vec3 ribbonColor = colors[i] + vec3(highlight);
        
        // Wash out the color slightly for that premium pastel/matte look
        ribbonColor = mix(ribbonColor, vec3(0.9, 0.88, 0.9), 0.15);

        // Composite the ribbon over the background
        finalColor = mix(bgWithShadow, ribbonColor, mask);
    }

    // Subtle film grain overlay
    float grain = fract(sin(dot(uv.xy, vec2(12.9898, 78.233))) * 43758.5453);
    finalColor += (grain - 0.5) * 0.04;

    gl_FragColor = vec4(finalColor, 1.0);
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
