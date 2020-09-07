import './main.css';

import cubeUrl from './models/robot/robotBase.obj';
import cubeMaterialUrl from './models/robot/robotBase.mtl';

import vertexShaderCode from './shaders/example.vert';
import fragmentShaderCode from './shaders/example.frag';

import { loadObjFile } from './libs/objLoader/index';

import { mat4 } from 'gl-matrix';

function createWebGLProgram(gl: WebGLRenderingContext, vertexShaderCode: string, fragmentShaderCode: string): WebGLProgram | null {
  const vertexShader = gl.createShader(gl.VERTEX_SHADER);

  if (!vertexShader) {
    return null;
  }

  gl.shaderSource(vertexShader, vertexShaderCode);
  gl.compileShader(vertexShader);

  if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
    throw new Error('Vertex Shader Failed To Compile' + gl.getShaderInfoLog(vertexShader));
  }

  const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

  if (!fragmentShader) {
    return null;
  }

  gl.shaderSource(fragmentShader, fragmentShaderCode);
  gl.compileShader(fragmentShader);

  if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
    throw new Error('Fragment Shader Failed To Compile' + gl.getShaderInfoLog(fragmentShader));
  }

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

  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data.triangles.vertices), gl.STATIC_DRAW);

  const positionLocation = gl.getAttribLocation(program, 'a_position');
  gl.enableVertexAttribArray(positionLocation);
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);

  const colorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data.triangles.colors), gl.STATIC_DRAW);

  const colorLocation = gl.getAttribLocation(program, 'a_color');
  gl.enableVertexAttribArray(colorLocation);
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, 0, 0);

  gl.useProgram(program);
  gl.enable(gl.DEPTH_TEST);

  const uniformLocations = {
    matrix: gl.getUniformLocation(program, 'u_matrix'),
  };

  const modelMatrix = mat4.create();
  const viewMatrix = mat4.create();

  const projectionMatrix = mat4.create();

//   mat4.ortho(projectionMatrix, -1.0, 1.0, -1.0, 1.0, -1.0, 1.0);
  mat4.perspective(
    projectionMatrix,
    75 * Math.PI/180,
    canvas.width/canvas.height,
    1e-4,
    1e4,
  );

  const mvMatrix = mat4.create();
  const mvpMatrix = mat4.create();

  mat4.translate(modelMatrix, modelMatrix, [0, 0, -10]);
  mat4.translate(viewMatrix, viewMatrix, [0, 0, 1.5]);
  mat4.invert(viewMatrix, viewMatrix);

    mat4.rotateZ(modelMatrix, modelMatrix, Math.PI / 16);
    mat4.rotateX(modelMatrix, modelMatrix, Math.PI / 16);

    let count = 0;

  function renderStage() {
    mat4.rotateY(modelMatrix, modelMatrix, Math.PI / 200);
    // mat4.rotateZ(modelMatrix, modelMatrix, Math.PI / 400);
    // mat4.rotateX(modelMatrix, modelMatrix, Math.PI / 800);

    mat4.multiply(mvMatrix, viewMatrix, modelMatrix);
    mat4.multiply(mvpMatrix, projectionMatrix, mvMatrix);
    gl!.uniformMatrix4fv(uniformLocations.matrix, false, mvpMatrix);

    gl!.drawArrays(gl!.LINES, 0, Math.min(++count, (data.triangles.vertices.length / 3)));
    requestAnimationFrame(renderStage);
  }

  renderStage();
});
