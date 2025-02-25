import * as THREE from 'three'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js'
import GUI from 'lil-gui'
import {FontLoader} from 'three/examples/jsm/loaders/FontLoader.js'
import {TextGeometry} from "three/examples/jsm/geometries/TextGeometry.js";
import {timerDelta} from "three/nodes";

console.time('loadingTime')
/**
 * Base
 */
// Debug
const gui = new GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader()
const matcapTexture = textureLoader.load('/textures/matcaps/8.png')
matcapTexture.ColorSpace = THREE.SRGBColorSpace

/**
 * Fonts
 */
const fontLoader = new FontLoader()

fontLoader.load(
    '/fonts/red_hat_display.typeface.json',
    (font) => {
        const vars = {
            text: 'Mandara'
        }
        gui.add(vars, 'text').onFinishChange((newText) => {
            vars.text = newText
            updateText()
        })

        let textGeometry = new TextGeometry(
            vars.text,
            {
                font: font,
                size: 0.5,
                depth: 0.2,

                curveSegments: 6,
                bevelEnabled: true,
                bevelThickness: 0.03,
                bevelSize: 0.02,
                bevelOffset: 0,
                bevelSegments: 4
            }
        )
        textGeometry.center()

        const material = new THREE.MeshMatcapMaterial({matcap: matcapTexture})

        let text = new THREE.Mesh(textGeometry, material)
        scene.add(text)

        function updateText() {
            console.time('updateText')
            text.geometry.dispose()
            scene.remove(text)

            textGeometry = new TextGeometry(
                vars.text,
                {
                    font: font,
                    size: 0.5,
                    depth: 0.2,

                    curveSegments: 6,
                    bevelEnabled: true,
                    bevelThickness: 0.03,
                    bevelSize: 0.02,
                    bevelOffset: 0,
                    bevelSegments: 4
                }
            )
            textGeometry.center()

            text = new THREE.Mesh(textGeometry, material)
            scene.add(text)
            console.timeEnd('updateText')
        }

        const donutGeometry = new THREE.TorusGeometry(0.3, 0.15, 20, 45)

        for (let i = 0; i < 300; i++) {
            const donut = new THREE.Mesh(donutGeometry, material)

            donut.position.x = (Math.random() - 0.5) * 10
            donut.position.y = (Math.random() - 0.5) * 10
            donut.position.z = (Math.random() - 0.5) * 10

            donut.rotation.x = Math.random() * Math.PI
            donut.rotation.y = Math.random() * Math.PI

            const scale = Math.random() * (1 - 0.1) + 0.1
            donut.scale.set(scale, scale, scale)

            if (donut.position.distanceTo(text.position) > 1.5) {
                scene.add(donut)
            }
        }
    }
)

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
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 1
camera.position.y = 1
camera.position.z = 2
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () => {
    const elapsedTime = clock.getElapsedTime()

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()

console.timeEnd('loadingTime')