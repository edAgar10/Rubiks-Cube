varying vec2 vUv;
varying vec3 fragNormal;

void main() {
    vUv = uv;
    fragNormal = normal;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}