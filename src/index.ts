import './main.css';

import cubeUrl from './models/cube/cube.obj';
import cubeMaterialUrl from './models/cube/model_cube.mtl';

import vertexShaderCode from './shaders/exemple.vert';
import fragmentShaderCode from './shaders/exemple.frag';

import { loadObjFile } from './libs/objLoader/index';

function createWebGLProgram(gl: WebGLRenderingContext, vertexShaderCode: string, fragmentShaderCode: string): WebGLProgram | null {
  const vertexShader = gl.createShader(gl.VERTEX_SHADER);

  if (!vertexShader) {
    return null;
  }

  gl.shaderSource(vertexShader, vertexShaderCode);
  gl.compileShader(vertexShader);

  const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

  if (!fragmentShader) {
    return null;
  }

  gl.shaderSource(fragmentShader, fragmentShaderCode);
  gl.compileShader(fragmentShader);

  const program = gl.createProgram();

  if (!program) {
    return null;
  }

  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  return program;
}

loadObjFile(cubeUrl, [ cubeMaterialUrl ], (err, data) => {
  if (err) {
    throw new Error("Failed to load model data.");
  }

  const canvas = document.querySelector('canvas');

  if (!canvas)  {
    throw new Error('Canvas not found');
  }

  const gl = canvas.getContext('webgl');

  if (!gl) {
    throw new Error('WebGL not supported');
  }

  const program = createWebGLProgram(gl, vertexShaderCode, fragmentShaderCode);

  if (!program) {
    throw new Error("WebGL program failed.");
  }
});
