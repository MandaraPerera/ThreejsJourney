import * as THREE from 'three'
import {OrbitControls, GLTFLoader, DRACOLoader, Sky} from 'three/addons'
import GUI from 'lil-gui'

/**
 * Base
 */
const parameters = {
    speed: 3
}

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader()

// Floor
const alphaTexture = textureLoader.load('/floor/floorAlpha.webp')

const displacementTexture = textureLoader.load('/floor/gray_rocks_1k/gray_rocks_disp_1k.webp')
displacementTexture.repeat.set(2, 8)
displacementTexture.wrapS = THREE.RepeatWrapping
displacementTexture.wrapT = THREE.RepeatWrapping

/**
 * Models
 */
const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('/draco/')

const gltfLoader = new GLTFLoader()
gltfLoader.setDRACOLoader(dracoLoader)

let mixer = null
const animations = {};

gltfLoader.load(
    '/models/Fox/glTF/Fox.gltf',
    (gltf) => {
        mixer = new THREE.AnimationMixer(gltf.scene)

        gltf.animations.forEach((clip) => {
            animations[clip.name] = mixer.clipAction(clip);
        });
        playAnimation('Walk');

        gltf.scene.scale.set(0.025, 0.025, 0.025)

        gltf.scene.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true
            }
        })

        scene.add(gltf.scene)

    }
)

function playAnimation(name) {
    if (animations[name]) {
        Object.values(animations).forEach((action) => action.stop());
        animations[name].reset().play();
    }
}

/**
 * Floor
 */
const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(25, 100, 100, 400),
    new THREE.MeshStandardMaterial({
        color: '#5d7141',
        transparent: true,
        alphaMap: alphaTexture,
        displacementMap: displacementTexture,
        displacementScale: 0.7,
        displacementBias: -0.2,
        flatShading: true
    })
)
floor.receiveShadow = true
floor.rotation.x = -Math.PI * 0.5
scene.add(floor)

/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xffd4b8, 1)
scene.add(ambientLight)

const directionalLight = new THREE.DirectionalLight(0xffd700, 1)
directionalLight.castShadow = true
directionalLight.shadow.mapSize.set(1024, 1024)
directionalLight.shadow.camera.far = 25
directionalLight.shadow.camera.left = -4
directionalLight.shadow.camera.top = 4
directionalLight.shadow.camera.right = 4
directionalLight.shadow.camera.bottom = -4
directionalLight.position.set(-10, 8, -10)
scene.add(directionalLight)


/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () => {
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 50)
camera.position.set(2.8, 0.5, 4)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.target.set(-0.25, 1, 0)
controls.enableDamping = true
controls.maxPolarAngle = Math.PI * 0.53
controls.enablePan = false
controls.maxDistance = 8
controls.minDistance = 2.6

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Sky
 */
const sky = new Sky()
sky.scale.set(100, 100, 100)
scene.add(sky)

sky.material.uniforms['turbidity'].value = 10
sky.material.uniforms['rayleigh'].value = 3
sky.material.uniforms['mieCoefficient'].value = 0.1
sky.material.uniforms['mieDirectionalG'].value = 0.95
const c = new THREE.Vector3(-100, -5, -100)
sky.material.uniforms['sunPosition'].value.copy(c)

/**
 * Fog
 */
scene.fog = new THREE.FogExp2('#02343f', 0.07)

/**
 * Animate
 */
const clock = new THREE.Clock()
let previousTime = 0

const tick = () => {
    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - previousTime
    previousTime = elapsedTime

    // Animate floor
    if (floor.position.z < -25) {
        floor.position.z = 25
        floor.position.z -= deltaTime * parameters.speed
    } else {
        floor.position.z -= deltaTime * parameters.speed
    }

    // Update mixer
    if (mixer) {
        mixer.update(deltaTime)
    }

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()

// Debug
const actions = {
    stop: () => {
        parameters.speed = 0
        playAnimation('Survey')
    },
    walk: () => {
        parameters.speed = 3
        playAnimation('Walk')
    },
    run: () => {
        parameters.speed = 5.5
        playAnimation('Run')
    }
}

const gui = new GUI()
gui.add(actions, 'stop')
gui.add(actions, 'walk')
gui.add(actions, 'run')