/* init */
const canvas = document.createElement('canvas');
document.body.append(canvas);
const ctx = canvas.getContext('2d');

/* resize */
let screenWidth, screenHeight;
function resize() {
    screenWidth = document.body.clientWidth;
    screenHeight = document.body.clientHeight;

    canvas.width = screenWidth;
    canvas.height = screenHeight;
}

resize();
window.addEventListener('resize', resize, false);

/* utils */
function floor(f, p) {
    return Math.floor(f * (10 ** p)) / 10 ** p;
}

function rgba2css(r, g, b, a) {
    return `rgba(${r}, ${g}, ${b}, ${a})`;
}

function loadFile(url, cb) {
    fetch(url).then(cb).catch(console.error);    
}

/* canvas context utilities */
function drawClear(ctx, x, y, w, h) {
    ctx.clearRect(x, y, w, h);
}

function drawLine(ctx, x0, y0, x1, y1, weight, color) {
    ctx.strokeStyle = color;
    ctx.lineWidth = weight;

    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.stroke();
    ctx.closePath();
}

function drawTriangle(ctx, x0, y0, x1, y1, x2, y2, color) {
    ctx.fillStyle = color;
    ctx.lineWidth = 0;

    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineTo(x0, y0);
    ctx.fill();
    ctx.closePath();
}

function drawText(ctx, text, x, y, fontSize, color) {
    ctx.fillStyle = color;
    ctx.font = `${fontSize}px sans-serif`;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.fillText(text, x, y);
    ctx.closePath();
}

/* data-structure */
class Vector4 {
    constructor(x, y, z, w) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w;
    }

    copy(v) {
        return new Vector4(
            this.x,
            this.y,
            this.z,
            this.w
        );
    }

    addv(v) {
        return new Vector4(
            this.x + v.x,
            this.y + v.y,
            this.z + v.z,
            this.w + v.w
        );
    }

    subv(v) {
        return new Vector4(
            this.x - v.x,
            this.y - v.y,
            this.z - v.z,
            this.w - v.w
        );
    }

    mul(s) {
        return new Vector4(
            this.x * s,
            this.y * s,
            this.z * s,
            this.w * s
        );
    }

    div(s) {
        return new Vector4(
            this.x / s,
            this.y / s,
            this.z / s,
            this.w / s
        );
    }

    dot(v) {
        return (
            this.x * v.x +
            this.y * v.y +
            this.z * v.z +
            this.w * v.w
        );
    }

    cross3d(v) {
        return new Vector4(
            this.y * v.z - this.z * v.y,
            this.z * v.x - this.x * v.z,
            this.x * v.y - this.y * v.x,
            0
        );
    }

    size() {
        return Math.sqrt(
            this.x ** 2 +
            this.y ** 2 +
            this.z ** 2 +
            this.w ** 2
        );
    }

    normalize() {
        var size = this.size();
        return this.div(size);
    }
}

class Model3D {
    constructor(vertices, faces, colors) {
        this.vertices = vertices;
        this.faces = faces;
        this.colors = colors;
    }
}

function parse3DFromObj(raw) {
    let vertices = [];
    let faces = [];
    let colors = [];
    
    let lines = raw.split('\n');
    let i, line;
    for(i = 0; i < lines.length; i++) {
        line = lines[i];
        if(line.startsWith("v")) {
            let chunks = line.trim().split(/\s+/);   

            let x = Number(chunks[1]);
            let y = Number(chunks[2]);
            let z = Number(chunks[3]);
            let v = new Vector4(x, y, z, 0);

            vertices.push(v);
        }else if(line.startsWith("f")) {
            let chunks = line.trim().split(/\s+/);

            let iv0 = Number(chunks[1].split("/")[0]);
            let iv1 = Number(chunks[2].split("/")[0]);
            let iv2 = Number(chunks[3].split("/")[0]);
            let iv3 = Number(chunks[4].split("/")[0]);

            faces.push([iv0, iv1, iv2]);
        }
    }

    return new Model3D(vertices, faces, colors);
}

function loadM3DFromObjURL(url, cb) {
    fetch(url)
    .then((res) => {
        res.text()
        .then((raw) => {
            var m3d = parse3DFromObj(raw);
            cb(m3d);
        })
        .catch(console.error);
    })
    .catch(console.error);
}

class Object3D {
    constructor(m3d, vPosition, vRotation, vScale) {
        this.m3d = m3d;
        this.vPos = vPosition;
        this.vRot = vRotation;
        this.vScale = vScale;
    }
}

/* 3d-models */
const m3dCube = new Model3D(
    [
        new Vector4(1, 1, 1, 0),
        new Vector4(1, -1, 1, 0),
        new Vector4(-1, -1, 1, 0),
        new Vector4(-1, 1, 1, 0),
        new Vector4(1, 1, -1, 0),
        new Vector4(1, -1, -1, 0),
        new Vector4(-1, -1, -1, 0),
        new Vector4(-1, 1, -1, 0),
    ],
    [
        /*
            0, 1, 2, 3
            4, 5, 6, 7
        */
        [0, 1, 2], [0, 2, 3], // top
        [4, 6, 5], [4, 7, 6], // bottom
        [0, 4, 5], [0, 5, 1], // sides
        [1, 5, 6], [1, 6, 2],
        [2, 6, 7], [2, 7, 3],
        [3, 7, 4], [3, 4, 0]
    ],
    [
        /* colors of each faces rgba(1, 1, 1, 1)*/
        new Vector4(0, 1, 1, 1),
        new Vector4(0, 1, 1, 1),
        new Vector4(0, 1, 1, 1),
        new Vector4(0, 1, 1, 1),
        new Vector4(0, 1, 1, 1),
        new Vector4(0, 1, 1, 1),
        new Vector4(0, 1, 1, 1),
        new Vector4(0, 1, 1, 1),
        new Vector4(0, 1, 1, 1),
        new Vector4(0, 1, 1, 1),
        new Vector4(0, 1, 1, 1),
        new Vector4(0, 1, 1, 1),
    ]
);

/* rendering pipe line - return vertices */
function pipeline(vertices, vResolution, vPosition, vRotation, vScale) {
    var vertices = Object.assign([], vertices);

    let i;
    for(i = 0; i < vertices.length; i++) {
        vertices[i] = vertexShader(vertices[i], vResolution, vPosition, vRotation, vScale);
    }

    return vertices;
}

function vertexShader(vertex, vResolution, vPosition, vRotation, vScale) {
    let v = vertex.copy();

    let rx = vRotation.x;
    let ry = vRotation.y;
    let rz = vRotation.z;

    let sx = vScale.x;
    let sy = vScale.y;
    let sz = vScale.z;
    
    let vd;

    /* Rotate X */
    vd = v.subv(vPosition);
    vd.y = v.y * Math.cos(rx) - v.z * Math.sin(rx);
    vd.z = v.y * Math.sin(rx) + v.z * Math.cos(rx);
    v = vd.addv(vPosition);

    /* Rotate Y */
    vd = v.subv(vPosition);
    vd.z = v.z * Math.cos(ry) - v.x * Math.sin(ry);
    vd.x = v.z * Math.sin(ry) + v.x * Math.cos(ry);
    v = vd.addv(vPosition);

    /* Rotate Z */
    vd = v.subv(vPosition);
    vd.x = v.x * Math.cos(rz) - v.y * Math.sin(rz);
    vd.y = v.x * Math.sin(rz) + v.y * Math.cos(rz);
    v = vd.addv(vPosition);

    /* Scale X, Y, Z */
    vd = v.subv(vPosition);
    vd.x *= sx;
    vd.y *= sy;
    vd.z *= sz;
    v = vd.addv(vPosition);

    v = v.addv(vPosition);
    v = v.addv(vResolution);

    return v;
}

/* vNormal utils */
function computeNormal(v0, v1, v2) {
    let v01 = v1.subv(v0);
    let v12 = v2.subv(v1);

    let vCross = v01.cross3d(v12);
    let vNormal = vCross.normalize();

    return vNormal;
}

/* model(mvc) */
var cube = new Object3D(
    m3dCube,
    new Vector4(0, 0, 0, 0),
    new Vector4(0, 0, 0, 0),
    new Vector4(100, 100, 100, 0)
);

/*
loadM3DFromObjURL('./dog.obj', (m3d) => {
    cube = new Object3D(
        m3d,
        new Vector4(0, 0, 0, 0),
        new Vector4(0, 0, 0, 0),
        new Vector4(10, 10, 10, 0)
    );

    console.log(cube);
});
*/

/* rendering loops */
let vResolution = new Vector4(screenWidth / 2, screenHeight / 2, 0, 0);

function render() {
    let vertices = pipeline(cube.m3d.vertices, vResolution, cube.vPos, cube.vRot, cube.vScale);
    drawClear(ctx, 0, 0, screenWidth, screenHeight);
    
    let i, v0, v1, v2, vNormal, face;
    for(i = 0; i < cube.m3d.faces.length; i++) {
        face = cube.m3d.faces[i];

        v0 = vertices[face[0]];
        v1 = vertices[face[1]];
        v2 = vertices[face[2]];

        vNormal = computeNormal(v0, v1, v2);

        if(vNormal.z > 0) {
            var color = rgba2css(
                0,
                vNormal.z * 255 + 10,
                vNormal.z * 255 + 10,
                1
            );

            drawTriangle(
                ctx,
                v0.x, v0.y,
                v1.x, v1.y,
                v2.x, v2.y,
                color
            );
        }
    }

    for(i = 0; i < vertices.length; i++) {
        v0 = vertices[i];

        var x = floor(v0.x, 1);
        var y = floor(v0.y, 1);
        var z = floor(v0.z, 1);

        var text = `v[${i}](${x}, ${y}, ${z})`;
        var fontSize = 10;
        var color = '#FFFFFF';

        drawText(ctx, text, v0.x, v0.y, 10, color);
    }
}

function animate() {
    requestAnimationFrame(animate);
    render();
}

animate();

/* keyboard-events */
const KEY_CODES = {
    UP: 'ArrowUp',
    DOWN: 'ArrowDown',
    LEFT: 'ArrowLeft',
    RIGHT: 'ArrowRight',
    SPACE: 'Space',
    A: 'KeyA',
    S: 'KeyS',
    W: 'KeyW',
    D: 'KeyD'
};

function onKeyDown(e) {
    switch(e.code) {
        case KEY_CODES.UP:
            cube.vRot.x -= 0.1;
            break;
        case KEY_CODES.DOWN:
            cube.vRot.x += 0.1;
            break;
        case KEY_CODES.LEFT:
            cube.vRot.y += 0.1;
            break;
        case KEY_CODES.RIGHT:
            cube.vRot.y -= 0.1;
            break;
        case KEY_CODES.SPACE:
            break;
        case KEY_CODES.A:
            cube.vPos.x -= 0.1;
            break;
        case KEY_CODES.S:
            cube.vPos.y += 0.1;
            break;
        case KEY_CODES.W:
            cube.vPos.y -= 0.1;
            break;
        case KEY_CODES.D:
            cube.vPos.x += 0.1;
            break;
        default:
            break;
    }
}

window.addEventListener('keydown', onKeyDown, false);