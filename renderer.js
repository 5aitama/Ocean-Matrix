const t = require('three')
const fastnoisejs = require('fastnoisejs')

// -- Parameters --
const width           = window.innerWidth
const height          = window.innerHeight
const cameraRatio     = width / height
const cameraFov       = 45
const cameraNear      = 0.1
const cameraFar       = 1000

const antialias       = true
const backgroundColor = 0xF1C40F

const terrainWidth  = 50
const terrainDepth  = 100
const terrainRes    = 0.5

const noiseSeed     = 2304
const noiseSize     = 20
const noisePower    = 1
const noiseType     = fastnoisejs.Perlin
const noise         = fastnoisejs.Create(noiseSeed)

const drawPoints    = true
const drawLines     = true
// -- end parameters --

const scene       = new t.Scene()
const camera      = new t.PerspectiveCamera(cameraFov, cameraRatio, cameraNear, cameraFar)
const fog         = new t.Fog(backgroundColor, cameraNear, (terrainDepth * terrainRes) / 1.2)
const renderer    = new t.WebGLRenderer( { antialias: antialias } )
const clock       = new t.Clock(true)

renderer.setClearColor(backgroundColor)
renderer.setSize(width, height)
renderer.setPixelRatio(window.devicePixelRatio)

document.body.appendChild(renderer.domElement)

noise.SetNoiseType(noiseType)

scene.fog = fog

camera.position.z = (terrainDepth * terrainRes) / 2
camera.position.y = 2

let pointsVertex = new Float32Array(terrainWidth * terrainDepth * 3)

for(var i = 0, index = 0; i < terrainWidth; i++) {
    for(var j = 0; j < terrainDepth; j++, index += 3) {
        
        const x = (i - terrainWidth / 2) * terrainRes
        const z = (j - terrainDepth / 2) * terrainRes

        pointsVertex[index    ] = x
        pointsVertex[index + 1] = 0
        pointsVertex[index + 2] = z
    }
}

const pointsBufferAttribute   = new t.BufferAttribute(pointsVertex, 3)
const pointsBufferGeometry    = new t.BufferGeometry()

pointsBufferAttribute.setDynamic(true)
pointsBufferGeometry.addAttribute('position', pointsBufferAttribute)
const points = new t.Points(pointsBufferGeometry, new t.PointsMaterial({ color: 0xFFFFFF, size: 0.05 }))

if(drawPoints) {
    scene.add(points)
}

let linesVertex = []

for(var i = 0, index = 0; i < terrainWidth; i++) {
    for(var j = 0; j < terrainDepth; j++, index += 3) {
        if(i + 1 < terrainWidth && j + 1 < terrainDepth) {
            linesVertex.push(
                pointsVertex[index + 0],
                pointsVertex[index + 1],
                pointsVertex[index + 2],

                pointsVertex[index + 0 + terrainDepth * 3],
                pointsVertex[index + 1 + terrainDepth * 3],
                pointsVertex[index + 2 + terrainDepth * 3],

                pointsVertex[index + 0 + terrainDepth * 3],
                pointsVertex[index + 1 + terrainDepth * 3],
                pointsVertex[index + 2 + terrainDepth * 3],

                pointsVertex[index + 0 + (terrainDepth * 3) + 3],
                pointsVertex[index + 1 + (terrainDepth * 3) + 3],
                pointsVertex[index + 2 + (terrainDepth * 3) + 3],
                
                pointsVertex[index + 0 + (terrainDepth * 3) + 3],
                pointsVertex[index + 1 + (terrainDepth * 3) + 3],
                pointsVertex[index + 2 + (terrainDepth * 3) + 3],

                pointsVertex[index + 0 + 3],
                pointsVertex[index + 1 + 3],
                pointsVertex[index + 2 + 3],

                pointsVertex[index + 0 + 3],
                pointsVertex[index + 1 + 3],
                pointsVertex[index + 2 + 3],

                pointsVertex[index + 0],
                pointsVertex[index + 1],
                pointsVertex[index + 2],
            )
        }
    }
}

const linesBufferAttribute  = new t.BufferAttribute(new Float32Array(linesVertex), 3)
const linesBufferGeometry   = new t.BufferGeometry()

linesBufferAttribute.setDynamic(true)
linesBufferGeometry.addAttribute('position', linesBufferAttribute)

const lines = new t.LineSegments(linesBufferGeometry, new t.LineBasicMaterial({ 
    color: 0xffffff,
 }), 4)

if(drawLines) {
    scene.add(lines)
}

let time = 0

function loop() {

    const delta = clock.getDelta()
    time += delta

    requestAnimationFrame(loop)

    const ns = []

    for(var i = 0; i < pointsBufferAttribute.array.length; i += 3) {
        const x = pointsBufferAttribute.array[i + 0]
        const z = pointsBufferAttribute.array[i + 2]

        const p = noise.GetPerlin((x + time) * noiseSize, (z + time) * noiseSize) * noisePower
        
        ns[`${x}, ${z}`] = p
        if(drawPoints) {
            pointsBufferAttribute.array[i + 1] = p
        }
    }

    if(drawPoints) {
        pointsBufferAttribute.needsUpdate = true
    }

    if(drawLines) {
        for(var i = 0; i < linesBufferAttribute.array.length; i += 18) {

            for(var j = 0; j < 8; j++) {
                const _x = linesBufferAttribute.array[i + (j * 3) + 0]
                const _z = linesBufferAttribute.array[i + (j * 3) + 2]

                linesBufferAttribute.array[i + (j * 3) + 1] = ns[`${_x}, ${_z}`]
            }
        }
        linesBufferAttribute.needsUpdate = true
    }

    renderer.render(scene, camera)
    
}

loop()