"use strict";

var canvas;
var gl;

var bufferCone, bufferRect, triVertices, bufferSquare;
var coneVertices, rectVertices, squareVertices;
var vPosition;
var modelMatrixLoc, viewMatrixLoc, projectionMatrixLoc;
var colorLoc;

var translateX = 0;
var translateY = 0;
var translateZ = 0;

var scale = 1;

var angleX = 0;
var angleY = 0;
var angleZ = 0;

var cameraX = 0;
var cameraY = 0;
var cameraZ = 4;

var targetX = 0;
var targetY = 0;
var targetZ = 0;

var fovy = 45;

var wingSpeed = 0.5;
var currentRotation = 0;

var coneRed = 0.0;
var coneGreen = 0.0;
var coneBlue = 0.0;

window.onload = function init() {
    canvas = document.getElementById("gl-canvas");

    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) {
        alert("WebGL isn't available");
    }

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.enable(gl.DEPTH_TEST);

    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);


    coneVertices = [
        vec3(-0.14, -0.35, -0.1),
        vec3(0.14, -0.35, -0.1),
        vec3(0, 0.2, -0.1),

    ];

    rectVertices = [
        vec3(-0.04, 0.2, 0),
        vec3(0.04, 0.2, 0),
        vec3(-0.04, 0.45, 0),
        vec3(0.04, 0.45, 0)
    ];

    squareVertices = [
        vec3(-1, -1, -1),
        vec3(1, -1, -1),
        vec3(1, -1, 1),
        vec3(-1, -1, 1)
    ];

    bufferCone = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferCone);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(coneVertices), gl.STATIC_DRAW);

    bufferRect = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferRect);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(rectVertices), gl.STATIC_DRAW);

    bufferSquare = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferSquare);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(squareVertices), gl.STATIC_DRAW);

    vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    modelMatrixLoc = gl.getUniformLocation(program, "modelMatrix");
    viewMatrixLoc = gl.getUniformLocation(program, "viewMatrix");
    projectionMatrixLoc = gl.getUniformLocation(program, "projectionMatrix");
    colorLoc = gl.getUniformLocation(program, "color");

    document.getElementById("inp_objX").oninput = function (event) {
        translateX = parseFloat(event.target.value);
    };

    document.getElementById("inp_objY").oninput = function (event) {
        translateY = parseFloat(event.target.value);
    };

    document.getElementById("inp_objZ").oninput = function (event) {
        translateZ = parseFloat(event.target.value);
    };

    document.getElementById("inp_obj_scale").oninput = function (event) {
        scale = parseFloat(event.target.value);
    };

    document.getElementById("inp_obj_rotationX").oninput = function (event) {
        angleX = parseFloat(event.target.value);
    };

    document.getElementById("inp_obj_rotationY").oninput = function (event) {
        angleY = parseFloat(event.target.value);
    };

    document.getElementById("inp_obj_rotationZ").oninput = function (event) {
        angleZ = parseFloat(event.target.value);
    };

    document.getElementById("cameraX").oninput = function (event) {
        cameraX = parseFloat(event.target.value);
    };

    document.getElementById("cameraY").oninput = function (event) {
        cameraY = parseFloat(event.target.value);
    };

    document.getElementById("cameraZ").oninput = function (event) {
        cameraZ = parseFloat(event.target.value);
    };

    document.getElementById("targetX").oninput = function (event) {
        targetX = parseFloat(event.target.value);
    };

    document.getElementById("targetY").oninput = function (event) {
        targetY = parseFloat(event.target.value);
    };

    document.getElementById("targetZ").oninput = function (event) {
        targetZ = parseFloat(event.target.value);
    };

    document.getElementById("fovy").oninput = function (event) {
        fovy = parseFloat(event.target.value);
    };

    document.getElementById("inp_wing_speed").oninput = function (event) {
        wingSpeed = parseFloat(event.target.value);
    };

    document.getElementById("cone_red").oninput = function (event) {
        coneRed = parseFloat(event.target.value);
    };

    document.getElementById("cone_green").oninput = function (event) {
        coneGreen = parseFloat(event.target.value);
    };

    document.getElementById("cone_blue").oninput = function (event) {
        coneBlue = parseFloat(event.target.value);
    };

    animate();
};

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    let viewMatrix = lookAt(vec3(cameraX, cameraY, cameraZ), vec3(targetX, targetY, targetZ), vec3(0, 1, 0));
    let projectionMatrix = perspective(fovy, 1, 0.1, 100);

    gl.uniformMatrix4fv(viewMatrixLoc, false, flatten(viewMatrix));
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));

    // Draw Square
    let squareMatrix = mat4();
    gl.uniformMatrix4fv(modelMatrixLoc, false, flatten(squareMatrix));
    gl.uniform4fv(colorLoc, vec4(0.5, 0.5, 0.5, 1.0));
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferSquare);
    gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);

    // Draw Cone
    let transformationMatrix = mat4();
    transformationMatrix = mult(transformationMatrix, translate(translateX, translateY - .65, translateZ));
    transformationMatrix = mult(transformationMatrix, rotateX(angleX));
    transformationMatrix = mult(transformationMatrix, rotateY(angleY));
    transformationMatrix = mult(transformationMatrix, rotateZ(angleZ));
    transformationMatrix = mult(transformationMatrix, scalem(scale, scale, scale));

    gl.uniformMatrix4fv(modelMatrixLoc, false, flatten(transformationMatrix));
    gl.uniform4fv(colorLoc, vec4(coneRed, coneGreen, coneBlue, 1.0));
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferCone);
    gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
    gl.drawArrays(gl.TRIANGLES, 0, 3);  // Düzeltme: 3 vertex için

    // Draw Rectangular Wings
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferRect);
    gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);

    const wingColors = [vec4(1, 0, 0, 1.0), vec4(0, 1, 0, 1.0), vec4(0, 0, 1, 1.0)];
    const wingRotations = [currentRotation, currentRotation + 120, currentRotation + 240];
    for (let i = 0; i < 3; i++) {
        drawWing(transformationMatrix, wingRotations[i], wingColors[i]);
    }
}

function drawWing(baseMatrix, rotation, color) {
    let wingMatrix = mat4();
    wingMatrix = mult(wingMatrix, baseMatrix);
    wingMatrix = mult(wingMatrix, translate(0, 0.1, 0));
    wingMatrix = mult(wingMatrix, rotateZ(rotation));
    wingMatrix = mult(wingMatrix, translate(0, -0.2, 0));

    gl.uniformMatrix4fv(modelMatrixLoc, false, flatten(wingMatrix));
    gl.uniform4fv(colorLoc, color);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
}

function animate() {
    currentRotation += wingSpeed;
    if (currentRotation >= 360) currentRotation -= 360;

    render();
    requestAnimFrame(animate);
}

