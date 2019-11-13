const canvas = document.getElementById('glcanvas');

const vsSource = `
attribute vec4 aVertexPosition;
attribute vec2 aTextureCoord;

uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;

varying highp vec2 vTextureCoord;

void main(void) {
  gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
  vTextureCoord = aTextureCoord;
}
`;

const fsSource = `
varying highp vec2 vTextureCoord;

uniform sampler2D uSampler;

void main(void) {
  gl_FragColor = texture2D(uSampler, vTextureCoord);
}
`;

const loadShader = (gl, type, source)=>{
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}

const initShader = (gl, vsSource, fsSource )=>{
    const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);
    const shaderProgram = gl.createProgram();

    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);

    gl.linkProgram(shaderProgram);
    
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
      alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
      return null;
    }
    
  return shaderProgram;
}

const initBuffers = gl=>{
  const positionBuffer = gl.createBuffer();
  const textureCoordBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);

  const textureCoordinates = 
  [-1.0,  1.0,
    1.0,  1.0,
   -1.0, -1.0,
    1.0, -1.0,];

  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array(textureCoordinates),//los shader trabajan con array flotantes
    gl.STATIC_DRAW);

  return {
    position: positionBuffer,
    textureCoord: textureCoordBuffer,
  };
}


let squareRotation = 0.0;

const drawScene = (gl, programInfo, buffers, texture, deltaTime) =>{
  /*RENDER*/ 
  gl.clearColor(0, 0, 0, 1.0);
  gl.clearDepth(1);//sirve para limpiar todo
  gl.enable(gl.DEPTH_TEST);//depth es profundidad
  gl.depthFunc(gl.LEQUAL);//lo de atrás se oscurece 

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  /*CAMERA*/
  const fieldOfView = 45 * Math.PI / 180;
  const aspect = gl.canvas.clientWidth  / gl.canvas.clientHeight;
  const zNear = 0.1;
  const zFar = 100;
  
  const projectionMatrix = mat4.create();

  mat4.perspective(
    projectionMatrix, 
    fieldOfView, 
    aspect, 
    zNear, 
    zFar
    );

  const modelViewMatrix = mat4.create();

  mat4.translate(
    modelViewMatrix,
    modelViewMatrix,
    [0, 0, -6]
    );
  mat4.rotate(
    modelViewMatrix,
    modelViewMatrix,
    squareRotation,
    [0.1,0,1]
  );
    //cada frame tiene su tiempo "then"...
    

  {
    const num = 2; // every coordinate composed of 2 values
    const type = gl.FLOAT; // the data in the buffer is 32 bit float
    const normalize = false; // don't normalize
    const stride = 0; // how many bytes to get from one set to the next
    const offset = 0; // how many bytes inside the buffer to start from
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.textureCoord);
    gl.vertexAttribPointer(programInfo.attribLocations.textureCoord, num, type, normalize, stride, offset);
    gl.enableVertexAttribArray(programInfo.attribLocations.textureCoord);
  }

  {
    const numComponents = 2;  
    const type = gl.FLOAT;    
    const normalize = false;  
    const stride = 0;
    const offset = 0;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
    gl.vertexAttribPointer(
      programInfo.attribLocations.vertexPosition,
      numComponents,
      type,
      normalize,
      stride,
      offset
    );

    gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);
  }

  gl.useProgram(programInfo.program);

  gl.uniformMatrix4fv(
    programInfo.uniformLocations.projectionMatrix,
    false,
    projectionMatrix
  );

  gl.uniformMatrix4fv(
    programInfo.uniformLocations.modelViewMatrix,
    false,
    modelViewMatrix
  );

   // Tell WebGL we want to affect texture unit 0
   gl.activeTexture(gl.TEXTURE0);

   // Bind the texture to texture unit 0
   gl.bindTexture(gl.TEXTURE_2D, texture);
 
   // Tell the shader we bound the texture to texture unit 0
   gl.uniform1i(programInfo.uniformLocations.uSampler, 0);

  {
    const offset = 0;
    const vertexCount = 4;
    gl.drawArrays(gl.TRIANGLE_STRIP, offset, vertexCount);
  }
  
  //squareRotation += deltaTime;
}

let then = 0;
const isPowerOf2 = value => {

  return (value & (value - 1)) == 0; 
}

const loadTexture = (gl, url) =>{

  const texture = gl.createTexture();
  
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // Because images have to be download over the internet
  // they might take a moment until they are ready.
  // Until then put a single pixel in the texture so we can
  // use it immediately. When the image has finished downloading
  // we'll update the texture with the contents of the image.
  const level = 0;
  const internalFormat = gl.RGBA;
  const width = 1;
  const height = 1;
  const border = 0;
  const srcFormat = gl.RGBA;
  const srcType = gl.UNSIGNED_BYTE;
  const pixel = new Uint8Array([0, 0, 255, 255]);  // opaque blue
  gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
                width, height, border, srcFormat, srcType,
                pixel);

  const image = new Image();
  image.crossOrigin = "anonymous";
  image.onload = function() {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
                  srcFormat, srcType, image);

    // WebGL1 has different requirements for power of 2 images
    // vs non power of 2 images so check if the image is a
    // power of 2 in both dimensions.
    if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
       // Yes, it's a power of 2. Generate mips.
       gl.generateMipmap(gl.TEXTURE_2D);
    } else {
       // No, it's not a power of 2. Turn off mips and set
       // wrapping to clamp to edge
       gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
       gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
       gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    }
  };
  image.src = url;

  return texture;
}

const render = now =>{
  const gl = canvas.getContext("webgl2");

  if (!gl)/*(gl === null)*/ {
      alert("Unable to initialize WebGL. Your browser or machine may not support it.");
      return;
  }

  const shaderProgram = initShader(gl,vsSource, fsSource);

  const programInfo = {
    program : shaderProgram, //con dos puntos se almacena en la 
    attribLocations:{
      vertexPosition : gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
      textureCoord: gl.getAttribLocation(shaderProgram, 'aTextureCoord'),
   },
    uniformLocations: {
      projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
      modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
      uSampler: gl.getUniformLocation(shaderProgram, 'uSampler'),
    },
  }; 

  const buffers = initBuffers(gl);

  // Load texture
  const texture = loadTexture(gl, photoTexture);

  now *= 0.09;
  const deltaTime = now - then;
  then = now;

  drawScene(gl, programInfo, buffers, texture, deltaTime);

  requestAnimationFrame(render);
  //gl.clearColor(0,0,0,1);//RGBA(A=Alpha)
  //gl.clear(gl.COLOR_BUFFER_BIT);

}

requestAnimationFrame(render);