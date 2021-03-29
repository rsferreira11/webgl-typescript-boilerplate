export function createShader(gl: WebGL2RenderingContext, type: number, source: string): WebGLShader | null {
  const shader = gl.createShader(type);

  if (shader == null) {
    return null;
  }

  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);

  if (success) {
    return shader;
  }

  console.log(gl.getShaderInfoLog(shader));
  gl.deleteShader(shader);

  return null;
}

export function createProgram(gl: WebGL2RenderingContext, vertexShader: WebGLShader, fragmentShader: WebGLShader): WebGLProgram | null {
  const program = gl.createProgram();

  if (program == null) {
    return null;
  }

  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  var success = gl.getProgramParameter(program, gl.LINK_STATUS);

  if (success) {
    return program;
  }

  console.log(gl.getProgramInfoLog(program));
  gl.deleteProgram(program);

  return null;
}

export function createProgramFromShadersString(gl: WebGL2RenderingContext, vertexShaderString: string, fragmentShaderString: string): WebGLProgram {
  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderString);

  if (vertexShader == null) {
    throw new Error('Vertex Shader failed to compile');
  }

  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderString);

  if (fragmentShader == null) {
    throw new Error('Fragment Shader failed to compile');
  }

  const program = createProgram(gl, vertexShader, fragmentShader);

  if (program == null) {
    throw new Error('Program failed to be created');
  }

  return program;
}

export function resizeCanvasToDisplaySize(canvas: HTMLCanvasElement) {
  // Lookup the size the browser is displaying the canvas in CSS pixels.
  const displayWidth  = canvas.clientWidth;
  const displayHeight = canvas.clientHeight;

  // Check if the canvas is not the same size.
  const needResize = canvas.width  !== displayWidth ||
    canvas.height !== displayHeight;

  if (needResize) {
    // Make the canvas the same size
    canvas.width  = displayWidth;
    canvas.height = displayHeight;
  }
}
