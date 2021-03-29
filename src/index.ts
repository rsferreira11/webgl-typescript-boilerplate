import './main.css';

import { createProgramFromShadersString, resizeCanvasToDisplaySize } from './utils/shaderHelpers';
import vertexShaderCode from './shaders/example.vert';
import fragmentShaderCode from './shaders/example.frag';

import sampleImage from './images/test.jpg';

import { mat3 } from 'gl-matrix';

function logMatrix(mat: mat3) {
  console.log(`
${mat[0]}, ${mat[1]}, ${mat[2]},
${mat[3]}, ${mat[4]}, ${mat[5]},
${mat[6]}, ${mat[7]}, ${mat[8]},
  `)
}

function loadImagePromise(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve) => {
    const image = new Image();

    image.src = url;
    image.onload = () => {
      resolve(image);
    };
  });
}

function createAndSetupTexture(gl: WebGL2RenderingContext): WebGLTexture {
  // Create a texture.
  const texture = gl.createTexture();

  if (!texture) {
    throw new Error('No texture.');
  }

  // Bind it to texture unit 0' 2D bind point
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // Set the parameters so we don't need mips and so we're not filtering
  // and we don't repeat at the edges
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

  return texture;
}

(async function () {
  const canvas = document.querySelector('canvas');

  if (!canvas) {
    throw new Error('Canvas not found');
  }

  const gl = canvas.getContext('webgl2');

  if (!gl) {
    throw new Error('WebGL not supported');
  }

  const image = await loadImagePromise(sampleImage);

  const program = createProgramFromShadersString(gl, vertexShaderCode, fragmentShaderCode);

  var positionAttributeLocation = gl.getAttribLocation(program, "a_position");
  var texCoordAttributeLocation = gl.getAttribLocation(program, "a_texCoord");

  // lookup uniforms
  var imageLocation = gl.getUniformLocation(program, "u_image");

  // Create a vertex array object (attribute state)
  var vao = gl.createVertexArray();

  // and make it the one we're currently working with
  gl.bindVertexArray(vao);

  // Create a buffer and put a single pixel space rectangle in
  // it (2 triangles)
  var positionBuffer = gl.createBuffer();

  // Turn on the attribute
  gl.enableVertexAttribArray(positionAttributeLocation);

  // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  // Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
  var size = 2;          // 2 components per iteration
  var type = gl.FLOAT;   // the data is 32bit floats
  var normalize = false; // don't normalize the data
  var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
  var offset = 0;        // start at the beginning of the buffer
  gl.vertexAttribPointer(
      positionAttributeLocation, size, type, normalize, stride, offset);

  // Set a rectangle the same size as the image.
  setRectangle(gl, 0, 0, 1, 1);

  // provide texture coordinates for the rectangle.
  var texCoordBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      0.0,  0.0,
      1.0,  0.0,
      0.0,  1.0,
      0.0,  1.0,
      1.0,  0.0,
      1.0,  1.0,
  ]), gl.STATIC_DRAW);

  // Turn on the attribute
  gl.enableVertexAttribArray(texCoordAttributeLocation);

  // Tell the attribute how to get data out of texCoordBuffer (ARRAY_BUFFER)
  var size = 2;          // 2 components per iteration
  var type = gl.FLOAT;   // the data is 32bit floats
  var normalize = false; // don't normalize the data
  var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
  var offset = 0;        // start at the beginning of the buffer
  gl.vertexAttribPointer(
      texCoordAttributeLocation, size, type, normalize, stride, offset);

  createAndSetupTexture(gl);

  // make unit 0 the active texture uint
  // (ie, the unit all other texture commands will affect
  gl.activeTexture(gl.TEXTURE0 + 0);

  // Upload the image into the texture.
  var mipLevel = 0;               // the largest mip
  var internalFormat = gl.RGBA;   // format we want in the texture
  var srcFormat = gl.RGBA;        // format of data we are supplying
  var srcType = gl.UNSIGNED_BYTE; // type of data we are supplying
  gl.texImage2D(gl.TEXTURE_2D,
                mipLevel,
                internalFormat,
                srcFormat,
                srcType,
                image);

  resizeCanvasToDisplaySize(canvas);

  // Tell WebGL how to convert from clip space to pixels
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  // Clear the canvas
  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // Tell it to use our program (pair of shaders)
  gl.useProgram(program);

  // Bind the attribute/buffer set we want.
  gl.bindVertexArray(vao);

  const resolutionLocation = gl.getUniformLocation(program, "u_matrix");
  const matrix = [
    1,  0,  0,
    0,  -1,  0,
    -1,  1,  1,
  ] as mat3;
  logMatrix(matrix);

  // mat3.projection(matrix, canvas.clientWidth, canvas.clientHeight);

  // Pass in the canvas resolution so we can convert from
  // pixels to clipspace in the shader
  gl.uniformMatrix3fv(resolutionLocation, false, matrix);

  // Tell the shader to get the texture from texture unit 0
  gl.uniform1i(imageLocation, 0);

  // Bind the position buffer so gl.bufferData that will be called
  // in setRectangle puts data in the position buffer
  // gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  // Draw the rectangle.
  var primitiveType = gl.TRIANGLES;
  var offset = 0;
  var count = 6;
  gl.drawArrays(primitiveType, offset, count);
})();

function setRectangle(gl: WebGL2RenderingContext, x: number, y: number, width: number, height: number) {
  var x1 = x;
  var x2 = x + width;
  var y1 = y;
  var y2 = y + height;
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
     x1, y1,
     x2, y1,
     x1, y2,
     x1, y2,
     x2, y1,
     x2, y2,
  ]), gl.STATIC_DRAW);
}
