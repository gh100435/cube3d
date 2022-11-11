/* init */
const canvas = document.createElement('canvas');
document.body.append(canvas);
const ctx = canvas.getContext('2d');

let screenWidth, screenHeight;
function resize() {
    screenWidth = document.body.clientWidth;
    screenHeight = document.body.clientHeight;

    canvas.width = screenWidth;
    canvas.height = screenHeight;
}

resize();
window.addEventListener('resize', resize);

/* utils */
function copyArr(arr) {
    let tmparr = [];
    let i;
    for(i = 0; i < arr.length; i++) {
        tmparr[i] = Object.assign({}, arr[i]);
    }
    return tmparr;
}

/* constants */
const COLORS = {
    BG: '#ffffff',
    CUBE: '#ff0000'
}

/* data-structure */
class Vector4 {
    constructor(x, y, z, w) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w;
    }
}

class Model3D {
    constructor(vertices, edges, faces) {
        this.vertices = vertices;
        this.edges = edges;
        this.faces = faces;
    }
}

class Object3D {
    constructor(m3d, vPos, vRot, vScale) {
        this.m3d = m3d;
        this.vPos = vPos;
        this.vRot = vRot;
        this.vScale = vScale;
    }

    computeRenders() {
        let vertices = this.m3d.vertices;
        vertices = this.computePosition(vertices);
        vertices = this.computeRotation(vertices);
        vertices = this.computeScale(vertices);

        return vertices;
    }

    computePosition(_vertices) {
        let vertices = copyArr(_vertices);
        let vPos = this.vPos;

        let i, v4;
        for(i = 0; i < vertices.length; i++) {
            v4 = vertices[i];
            v4.x += vPos.x;
            v4.y += vPos.y;
            v4.z += vPos.z;

            vertices[i] = v4;
        }

        return vertices;
    }

    computeRotation(_vertices) {
        let vertices = copyArr(_vertices);
        let vRot = this.vRot;
        let vPos = this.vPos;

        let i, v4, dx, dy, dz;
        // rotate x
        for(i = 0; i < vertices.length; i++) {
            v4 = vertices[i];
 
            dy = v4.y - vPos.y;
            dz = v4.z - vPos.z;

            v4.y = dy * Math.cos(vRot.x) - dz * Math.sin(vRot.x);
            v4.z = dy * Math.sin(vRot.x) + dz * Math.cos(vRot.x);

            v4.y += vPos.y;
            v4.z += vPos.z;

            vertices[i] = v4;
        }
        // rotate y
        for(i = 0; i < vertices.length; i++) {
            v4 = vertices[i];
 
            dz = v4.z - vPos.z;
            dx = v4.x - vPos.x;

            v4.z = dz * Math.cos(vRot.y) - dx * Math.sin(vRot.y);
            v4.x = dz * Math.sin(vRot.y) + dx * Math.cos(vRot.y);

            v4.z += vPos.z;
            v4.x += vPos.x;

            vertices[i] = v4;
        }
        // rotate z
        for(i = 0; i < vertices.length; i++) {
            v4 = vertices[i];
 
            dx = v4.x - vPos.x;
            dy = v4.y - vPos.y;

            v4.x = dx * Math.cos(vRot.z) - dy * Math.sin(vRot.z);
            v4.y = dx * Math.sin(vRot.z) + dy * Math.cos(vRot.z);

            v4.x += vPos.x;
            v4.y += vPos.y;

            vertices[i] = v4;
        }

        return vertices;
    }

    computeScale(_vertices) {
        let vertices = copyArr(_vertices);
        let vScale = this.vScale;
        let vPos = this.vPos;

        let i, v4, dx, dy, dz;
        for(i = 0; i < vertices.length; i++) {
            v4 = vertices[i];

            dx = v4.x - vPos.x;
            dy = v4.y - vPos.y;
            dz = v4.z - vPos.z;

            dx = dx * vScale.x;
            dy = dy * vScale.y;
            dz = dz * vScale.z;

            v4.x = dx + vPos.x;
            v4.y = dy + vPos.y;
            v4.z = dz + vPos.z;

            vertices[i] = v4;
        }

        return vertices;
    }
}

/* 3D modelings */
const m3dCube = new Model3D(
    [
        new Vector4(1, 1, 1),
        new Vector4(1, -1, 1),
        new Vector4(-1, -1, 1),
        new Vector4(-1, 1, 1),
        new Vector4(1, 1, -1),
        new Vector4(1, -1, -1),
        new Vector4(-1, -1, -1),
        new Vector4(-1, 1, -1)
    ],
    [
        [0, 1], [1, 2], [2, 3], [3, 0],
        [4, 5], [5, 6], [6, 7], [7, 4],
        [0, 4], [1, 5], [2, 6], [3, 7],
        [0, 5], [1, 6], [2, 7], [3, 4], [0, 2], [4, 6]
    ],
    [
        // TODO
    ]
);

/* (mvc) model */
// TODO 일단 야매로 코드
let cubes3d = [];

function setCubes3D() {
    cubes3d = [];

    let rows = 10;
    let columns = 10;
    let cubeSize = 20;
    let offset = 60;

    let startRow = -rows * offset / 2;
    let startColumn = -columns * offset / 2;

    let i, j, k;
    for(i = 0; i < rows; i++) {
        for(j = 0; j < columns; j++) {
            cubes3d.push(
                new Object3D(
                    m3dCube,
                    new Vector4(startColumn + i * offset, startRow + j * offset, 0, 0),
                    new Vector4(0, 0, 0, 0),
                    new Vector4(cubeSize, cubeSize, cubeSize, 0)
                )
            );
        }
    }
}

setCubes3D();


/* (mvc) controller */
function RotateXCubes(rad) {
    let i, cube3d;
    for(i = 0; i < cubes3d.length; i++) {
        cube3d = cubes3d[i];
        cube3d.vRot.x += rad * i;
    }
}

function RotateZCubes(rad) {
    let i, cube3d;
    for(i = 0; i < cubes3d.length; i++) {
        cube3d = cubes3d[i];
        cube3d.vRot.z += rad * i;
    }
}

function ScaleCubes(s) {
    let i, cube3d;
    for(i = 0; i < cubes3d.length; i++) {
        cube3d = cubes3d[i];
        cube3d.vScale.x += s;
        cube3d.vScale.y += s;
        cube3d.vScale.z += s;
    }
}

/* (mvc) controller input */
const KEY_CODE = {
    UP: 'ArrowUp',
    DOWN: 'ArrowDown',
    LEFT: 'ArrowLeft',
    RIGHT: 'ArrowRight',
    SPACE: 'Space'
}

function onKeyDown(e) {
    switch(e.code) {
        case KEY_CODE.UP:
            RotateXCubes(0.1);
            break;
        case KEY_CODE.DOWN:
            RotateXCubes(-0.1);
            break;
        case KEY_CODE.LEFT:
            RotateZCubes(0.1);
            break;
        case KEY_CODE.RIGHT:
            RotateZCubes(-0.1);
            break;
        case KEY_CODE.SPACE:
            ScaleCubes(1);
            break;
        default:
            break;
    }
}
window.addEventListener('keydown', onKeyDown, false);

/* (mvc) view */
function animate() {
    requestAnimationFrame(animate);
    ctx.clearRect(0, 0, screenWidth, screenHeight);

    const colors = {
        bg: COLORS.BG,
        cube: COLORS.CUBE
    };

    ctx.beginPath();
    ctx.fillStyle = colors.bg;
    ctx.fillRect(0, 0, screenWidth, screenHeight);
    ctx.closePath();

    let i;
    for(i = 0; i < cubes3d.length; i++){
        draw3D(cubes3d[i], colors.cube);
    }
}

function draw3D(o3d, color) {
    const originX = screenWidth / 2;
    const originY = screenHeight / 2;
    const renderVertices = o3d.computeRenders(); 
    
    let i, sv, ev, sx, sy, ex, ey;
    for(i = 0; i < o3d.m3d.edges.length; i++) {
        sv = renderVertices[o3d.m3d.edges[i][0]];
        ev = renderVertices[o3d.m3d.edges[i][1]];

        sx = sv.x + originX;
        sy = sv.y + originY;
        ex = ev.x + originX;
        ey = ev.y + originY;

        ctx.moveTo(sx, sy);
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(ex, ey);
        ctx.strokeStyle = color;
        ctx.stroke();
        ctx.closePath();
    }
}

requestAnimationFrame(animate);