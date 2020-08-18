import './main.css';

import testTexture from './images/default_tree.png';

import { imageImportTest } from './examples/imageImportTest';
import vertexShaderCode from './shaders/example.vert';
import fragmentShaderCode from './shaders/example.frag';

import { mat4 } from 'gl-matrix';

imageImportTest();

function loadTexture(gl: WebGLRenderingContext, url: string) {
  const texture = gl.createTexture();
  const image = new Image();

  image.onload = () => {
      gl.bindTexture(gl.TEXTURE_2D, texture);

      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

      gl.generateMipmap(gl.TEXTURE_2D);
  };

  image.src = url;
  return texture;
}

(function() {
  const canvas = document.querySelector('canvas');

  if (!canvas)  {
    throw new Error('Canvas not found');
  }

  const gl = canvas.getContext('webgl');

  if (!gl) {
    throw new Error('WebGL not supported');
  }

  //#region Vertex Data
  const vertexData = [
    // Front
    0.5, 0.5, 0.5,
    0.5, -.5, 0.5,
    -.5, 0.5, 0.5,
    -.5, 0.5, 0.5,
    0.5, -.5, 0.5,
    -.5, -.5, 0.5,

    // Left
    -.5, 0.5, 0.5,
    -.5, -.5, 0.5,
    -.5, 0.5, -.5,
    -.5, 0.5, -.5,
    -.5, -.5, 0.5,
    -.5, -.5, -.5,

    // Back
    -.5, 0.5, -.5,
    -.5, -.5, -.5,
    0.5, 0.5, -.5,
    0.5, 0.5, -.5,
    -.5, -.5, -.5,
    0.5, -.5, -.5,

    // Right
    0.5, 0.5, -.5,
    0.5, -.5, -.5,
    0.5, 0.5, 0.5,
    0.5, 0.5, 0.5,
    0.5, -.5, 0.5,
    0.5, -.5, -.5,

    // Top
    0.5, 0.5, 0.5,
    0.5, 0.5, -.5,
    -.5, 0.5, 0.5,
    -.5, 0.5, 0.5,
    0.5, 0.5, -.5,
    -.5, 0.5, -.5,

    // Bottom
    0.5, -.5, 0.5,
    0.5, -.5, -.5,
    -.5, -.5, 0.5,
    -.5, -.5, 0.5,
    0.5, -.5, -.5,
    -.5, -.5, -.5,
  ];
  //#endregion

  function repeat(numberOfTimes: number, pattern: number[]) {
    return [ ...Array(numberOfTimes) ]
      .reduce(acc => acc.concat(pattern), []);
  }

  const uvData = repeat(6, [
      1, 1, // top right
      1, 0, // bottom right
      0, 1, // top left

      0, 1, // top left
      1, 0, // bottom right
      0, 0  // bottom left
  ]);

  //#region buffers
  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexData), gl.STATIC_DRAW);

  const uvBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uvData), gl.STATIC_DRAW);
  //#endregion

  const image = loadTexture(gl, testTexture);
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, image);

  //#region Vertex shader
  const vertexShader = gl.createShader(gl.VERTEX_SHADER);

  if (!vertexShader) {
    return;
  }

  gl.shaderSource(vertexShader, vertexShaderCode);
  gl.compileShader(vertexShader);
  //#endregion

  //#region Fragment shader
  const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

  if (!fragmentShader) {
    return;
  }

  gl.shaderSource(fragmentShader, fragmentShaderCode);
  gl.compileShader(fragmentShader);
  //#endregion

  //#region Program
  const program = gl.createProgram();

  if (!program) {
    return;
  }

  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  //#endregion

  //#region Bind Buffers
  const positionLocation = gl.getAttribLocation(program, 'position');
  gl.enableVertexAttribArray(positionLocation);
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);

  const uvLocation = gl.getAttribLocation(program, `uv`);
  gl.enableVertexAttribArray(uvLocation);
  gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
  gl.vertexAttribPointer(uvLocation, 2, gl.FLOAT, false, 0, 0);
  //#endregion

  gl.useProgram(program);
  gl.enable(gl.DEPTH_TEST);

  const uniformLocations = {
    matrix: gl.getUniformLocation(program, 'matrix'),
    textureID: gl.getUniformLocation(program, 'textureID'),
  };

  gl.uniform1i(uniformLocations.textureID, 0);

  const modelMatrix = mat4.create();
  const viewMatrix = mat4.create();

  const projectionMatrix = mat4.create();
  mat4.perspective(
    projectionMatrix,
    75 * Math.PI/180,
    canvas.width/canvas.height,
    1e-4,
    1e4,
  );

  const mvMatrix = mat4.create();
  const mvpMatrix = mat4.create();

  mat4.translate(modelMatrix, modelMatrix, [0, 0, -2]);
  mat4.translate(viewMatrix, viewMatrix, [0, 0, 1.5]);
  mat4.invert(viewMatrix, viewMatrix);

  function draw() {
    mat4.rotateY(modelMatrix, modelMatrix, Math.PI / 200);
    mat4.rotateZ(modelMatrix, modelMatrix, Math.PI / 400);
    mat4.rotateX(modelMatrix, modelMatrix, Math.PI / 800);


    mat4.multiply(mvMatrix, viewMatrix, modelMatrix);
    mat4.multiply(mvpMatrix, projectionMatrix, mvMatrix);
    gl!.uniformMatrix4fv(uniformLocations.matrix, false, mvpMatrix);
    gl!.drawArrays(gl!.TRIANGLES, 0, vertexData.length / 3);
    requestAnimationFrame(draw);
  }

  draw();
})();
