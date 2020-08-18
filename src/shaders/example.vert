precision mediump float;

attribute vec3 position;
attribute vec2 uv;

varying vec2 vUV;

uniform mat4 matrix;

void main() {
  vUV = uv;
  gl_Position = matrix * vec4(position, 1);
}
