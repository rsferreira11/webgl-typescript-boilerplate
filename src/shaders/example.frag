precision mediump float;
varying vec2 vUV;
uniform sampler2D textureID;

void main() {
    gl_FragColor = texture2D(textureID, vUV);
}
