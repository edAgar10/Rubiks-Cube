import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { Pass, FullScreenQuad } from 'three/examples/jsm/postprocessing/Pass.js';
import vertexShader from './Shaders/outlineVer.glsl?raw'
import fragmentShader from './Shaders/outlineFrg.glsl?raw'
import { EffectComposer } from 'three/examples/jsm/Addons.js';
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";


const scene = new THREE.Scene();

const renderer = new THREE.WebGLRenderer({canvas: document.querySelector('canvas')});
renderer.setPixelRatio(window.devicePixelRatio);


const camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 0.1, 1000 ); 
camera.updateProjectionMatrix();
const controls = new OrbitControls(camera, renderer.domElement);
controls.maxDistance = 30;
controls.minDistance = 25;

const depthTexture = new THREE.DepthTexture();
const renderTarget = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, {depthTexture: depthTexture, depthBuffer:true});

const CUBESIZE = 3;
const SPACING = 0.5;
const DIMENSIONS = 3;

const geometry = new THREE.BoxGeometry( CUBESIZE, CUBESIZE, CUBESIZE ); 
const material = new THREE.MeshBasicMaterial( { color: 0xffffff } );
// const cube = new THREE.Mesh( geometry, material ); 
// scene.add(cube); 

var increment = CUBESIZE + SPACING
var allCubes = [];



function newCube(x,y,z) {
    var cube = new THREE.Mesh(geometry, material)
    cube.position.set(x,y,z)
    scene.add(cube)
    allCubes.push(cube)
}

var positionOffset = (DIMENSIONS - 1) / 2;
for(var i=0; i<DIMENSIONS; i++){
    for(var j = 0; j < DIMENSIONS; j ++) {
        for(var k = 0; k < DIMENSIONS; k ++) {
            
            var x = (i-positionOffset) * increment
            var y = (j-positionOffset) * increment
            var z = (k-positionOffset) * increment
            

            newCube(x,y,z)
        }
    }
}

scene.rotateY +=50
camera.position.z = 20;

class CustomOutlinePass extends Pass {
    constructor(resolution,scene, camera) {
        super();

        this.renderScene = scene;
        this.renderCamera = camera;
        this.resolution = new THREE.Vector2(resolution.x, resolution.y)

        this.fsQuad = new FullScreenQuad(null);
        this.fsQuad.material = this.createOutlineMaterial();
        console.log(this.fsQuad.material.uniforms)

        const normalTarget = new THREE.WebGLRenderTarget(
            this.resolution.x,
            this.resolution.y
        );
        normalTarget.texture.format = THREE.RGBFormat;
        normalTarget.texture.minFilter = THREE.NearestFilter;
        normalTarget.texture.magFilter = THREE.NearestFilter;
        normalTarget.texture.generateMipmaps = false;
        normalTarget.stencilBuffer = false;
        this.normalTarget = normalTarget;

        this.normalOverrideMaterial = new THREE.MeshNormalMaterial();

        }
        dispose() {
            this.normalTarget.dispose();
            this.fsQuad.dispose();
        }
        setSize(width,height){
            this.normalTarget.setSize(width, height);
            this.resolution.set(width,height);
            this.fsQuad.material.uniforms.screenSize.value.set(
                this.resolution.x,
                this.resolution.y,
                1 / this.resolution.x,
                1 / this.resolution.y
            );
        }
        render(renderer, writeBuffer, readBuffer){
            const depthBufferValue = writeBuffer.depthBuffer;
            writeBuffer.depthBuffer = false;

            renderer.setRenderTarget(this.normalTarget);

            const overrideMaterialValue = this.renderScene.overrideMaterial;
            this.renderScene.overrideMaterial = this.normalOverrideMaterial;
            renderer.render(this.renderScene, this.renderCamera);
            this.renderScene.overrideMaterial = overrideMaterialValue;

            this.fsQuad.material.uniforms["depthBuffer"].value = readBuffer.depthTexture;
            this.fsQuad.material.uniforms["normalBuffer"].value = this.normalTarget.texture;
            this.fsQuad.material.uniforms["sceneColorBuffer"].value = readBuffer.texture;

            if (this.renderToScreen) {
                renderer.setRenderTarget(null);
                this.fsQuad.render(renderer)
            } else {
                renderer.setRenderTarget(writeBuffer);
                this.fsQuad.render(renderer)
            }

            writeBuffer.depthBuffer = depthBufferValue;


        }
        createOutlineMaterial() {
            return new THREE.ShaderMaterial({
                uniforms: {
                    debugVisualize: { value: 0},
                    sceneColorBuffer: {},
                    depthBuffer: {},
                    normalBuffer: {},
                    outlineColor: {value: new THREE.Color(0xffffff)},
                    multiplierParameters: {value: new THREE.Vector4(1,1,1,1)},
                    cameraNear: {value: this.renderCamera.near},
                    cameraFar: {value: this.renderCamera.far},
                    screenSize:{
                        value: new THREE.Vector4(
                            this.resolution.x,
                            this.resolution.y,
                            1 / this.resolution.x,
                            1 / this.resolution.y
                        )
                    },
                },
                vertexShader: vertexShader,
                fragmentShader: fragmentShader
            });
        }
}
    
const composer = new EffectComposer(renderer, renderTarget);
const pass = new RenderPass(scene, camera);
composer.addPass(pass);

const customOutline = new CustomOutlinePass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    scene,
    camera
);
composer.addPass(customOutline)

function update() {
    requestAnimationFrame(update);
    composer.render();
}
update();


function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
  
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
    customOutline.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener("resize", onWindowResize, false);

// function resizeCanvas() {
// 	const canvas = renderer.domElement;
// 	const width = canvas.clientWidth;
// 	const height = canvas.clientHeight;
// 	if (canvas.width !== width || canvas.height !== height) {
// 		renderer.setSize(width, height, false);
// 		camera.aspect = width/height;
// 		camera.updateProjectionMatrix();
// 	}
	
// }

// function animate() { 
//     controls.update();
//     resizeCanvas();
//     renderer.render( scene, camera ); 
// } 
// renderer.setAnimationLoop( animate );