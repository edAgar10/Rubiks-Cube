uniform vec3 cubePosition;
varying vec3 fragNormal;    // Normal at the current fragment (passed from vertex shader)

void main() {
	vec3 color = vec3(0.0, 0.0, 0.0);
    bool isOuterFace = false;
    

	// Determine the color based on the normal direction
	if (abs(fragNormal.z) > 0.9) {
		// Front face (normal facing positive Z direction)
		if (fragNormal.z > 0.0) {
			color = vec3(1.0, 0.0, 0.0);  // Red
		} else {
			color = vec3(1.0, 0.5, 0.0);  // Orange
		}
	}
	// Back face (normal facing negative Z direction)
	else if (abs(fragNormal.z) < -0.9) {
		if (fragNormal.z < 0.0) {
			color = vec3(1.0, 0.5, 0.0);  // Orange
		}
	}
	// Right face (normal facing positive X direction)
	else if (abs(fragNormal.x) > 0.9) {
		if (fragNormal.x > 0.0) {
			color = vec3(0.0, 0.0, 1.0);  // Blue
		} else {
			color = vec3(0.0, 1.0, 0.0);  // Green
		}
	}
	// Left face (normal facing negative X direction)
	else if (abs(fragNormal.x) < -0.9) {
		if (fragNormal.x < 0.0) {
			color = vec3(0.0, 1.0, 0.0);  // Green
		}
	}
	// Top face (normal facing positive Y direction)
	else if (abs(fragNormal.y) > 0.9) {
		if (fragNormal.y > 0.0) {
			color = vec3(1.0, 1.0, 1.0);  // White
		} else {
			color = vec3(1.0, 1.0, 0.0);  // Yellow
		}
	}
	// Bottom face (normal facing negative Y direction)
	else if (abs(fragNormal.y) < -0.9) {
		if (fragNormal.y < 0.0) {
			color = vec3(1.0, 1.0, 0.0);  // Yellow
		}
	}


    gl_FragColor = vec4(color, 1.0);
}