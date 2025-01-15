import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { FXAAShader } from "three/examples/jsm/shaders/FXAAShader.js";

import { CustomOutlinePass } from "./CustomOutlinePass.js";
import FindSurfaces from "./FindSurfaces.js";



const scene = new THREE.Scene();
scene.background = new THREE.Color("rgb(113, 113, 113)");
const renderer = new THREE.WebGLRenderer({canvas: document.querySelector('canvas')});
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth / 2, window.innerHeight / 2)

//red to orange = z(blue)
//blue to green = x(red)
//white to yellow = y(green)
// const axesHelper = new THREE.AxesHelper( 25 );
// scene.add( axesHelper );


const camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 0.1, 1000 ); 
camera.updateProjectionMatrix();
const controls = new OrbitControls(camera, renderer.domElement);
controls.maxDistance = 20;
controls.minDistance = 20;


const CUBESIZE =2;
const SPACING = 0.5;
const DIMENSIONS = 3;



// const material = [
//     new THREE.MeshBasicMaterial( { color: 0x00b029 } ), //green +x
//     new THREE.MeshBasicMaterial( { color: 0x0a78ff } ), //blue  -x
//     new THREE.MeshBasicMaterial( { color: 0xffeb52 } ), //yellow 
//     new THREE.MeshBasicMaterial( { color: 0xFFFFFF } ), //white
//     new THREE.MeshBasicMaterial( { color: 0xc40014 } ), //red
//     new THREE.MeshBasicMaterial( { color: 0xFF5800 } ), //orange
// ]




// const cube = new THREE.Mesh( geometry, material ); 
// scene.add(cube); 

var increment = CUBESIZE + SPACING
var allCubes = [];


const geometry = new THREE.BoxGeometry( CUBESIZE, CUBESIZE, CUBESIZE); 

// Blue - Green - Yellow - White - Orange - Red
var colors = [0x0a78ff, 0x00b029, 0xffeb52, 0xFFFFFF, 0xfc7830, 0xc40014]

function getAxisColours(val, posCol, negCol) {
    if (val < 0) {return [new THREE.MeshBasicMaterial( { color: 0x000000 } ), new THREE.MeshBasicMaterial( { color: negCol } )]}
    if (val > 0) {return [new THREE.MeshBasicMaterial( { color: posCol } ), new THREE.MeshBasicMaterial( { color: 0x000000 } )]}
    return [new THREE.MeshBasicMaterial( { color: 0x000000 } ), new THREE.MeshBasicMaterial( { color: 0x000000 } )]
}

function newCube(x,y,z) {
    let material = [
        ...getAxisColours(x, colors[0], colors[1]), // x-axis
        ...getAxisColours(y, colors[2], colors[3]), // y-axis
        ...getAxisColours(z, colors[4], colors[5])  // z-axis
    ]

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
            
            

            if(!(x==0 && y==0 && z==0)){
                console.log(x,y,z)
                newCube(x,y,z)
            }
            
        }
    }
}

camera.position.z = 20;

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

window.addEventListener( 'pointermove', onPointerMove );

function onPointerMove(event) {
    
    pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    pointer.y = - (event.clientY / window.innerHeight) * 2 + 1;

    return raycaster.intersectObjects(scene.children, true).length > 0;
    

}


const depthTexture = new THREE.DepthTexture();
const renderTarget = new THREE.WebGLRenderTarget(
  window.innerWidth,
  window.innerHeight,
  {
    depthTexture: depthTexture,
    depthBuffer: true,
  }
);

const composer = new EffectComposer(renderer, renderTarget);
composer.setSize(window.innerWidth / 2, window.innerHeight / 2);
const renderPass = new RenderPass(scene,camera);
composer.addPass(renderPass);

const customOutline = new CustomOutlinePass(new THREE.Vector2(window.innerWidth, window.innerHeight), scene, camera);
composer.addPass(customOutline)


const effectFXAA = new ShaderPass(FXAAShader);
effectFXAA.uniforms["resolution"].value.set(
  1 / window.innerWidth,
  1 / window.innerHeight
);
composer.addPass(effectFXAA);


const surfaceFinder = new FindSurfaces();
surfaceFinder.surfaceId = 0;
scene.traverse((node) => {
    if (node.type == "Mesh") {
        const colorsTypedArray = surfaceFinder.getSurfaceIdAttribute(node);
        node.geometry.setAttribute("color", new THREE.BufferAttribute(colorsTypedArray, 4));
    }
});

customOutline.updateMaxSurfaceId(surfaceFinder.surfaceId + 1);

scene.rotation.x += 10;



function update() {

    scene.rotation.y +=0.002;
    requestAnimationFrame(update);
    composer.render();
}
update();


function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
  
    renderer.setSize(window.innerWidth / 2, window.innerHeight / 2);
    composer.setSize(window.innerWidth / 2, window.innerHeight / 2);
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