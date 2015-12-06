$('#imgConfig').hide();
$('#afterCrop').hide();

var upload = document.getElementsByTagName('input')[0],
    canvas = document.getElementById('myCanvas'),
    context = canvas.getContext('2d'),
    img = new Image(),
    scale = 1,
    isDown = false,
    baseX = 0,
    baseY = 0,
    lastX = 0,
    lastY = 0,
    originalWidth = 0,
    originalHeight = 0,
    scaledWidth = 0,
    scaledHeight = 0,
    canvasWidth = 550;
    cropSize = 200,
    cropOffsetX = (canvasWidth / 2) - (cropSize / 2),
    cropOffsetY = 0;

upload.onchange = function (e) {
  e.preventDefault();

  var file = upload.files[0],    
      imageType = /image.*/;
  
  // if file is an image file
  if (file.type.match(imageType)) {
    $('#imgConfig').show();
    
    reader = new FileReader()
    reader.onload = function (event) {
    	// TODO: reset values in more nice way, scaler in HTML does not update when new image is selected.
    	img = new Image(), scale = 1, lastX = 0, lastY = 0, isDown = false, baseX = 0, baseY = 0, originalWidth = 0, originalHeight = 0;
    	$('#scaleSlider').value = 1;

      img.onload = function () {
        context.canvas.width = canvasWidth;
        // set image size so it will fit in canvas
        originalWidth = img.width;
        originalHeight = img.height;
        img.width = canvas.width;
        img.height = (originalHeight / originalWidth) * img.width;
        cropOffsetY = (img.height / 2) - (cropSize / 2);

        if (img.height < 300) {
          context.canvas.height = 300;
        } else {
          context.canvas.height = img.height;
        }

        drawImage(0, 0);
      }

      img.src = event.target.result;
      
      // append image to canvas
      canvas.innerHTML = '';
      canvas.appendChild(img);
    };
    reader.readAsDataURL(file);

  } else {
    // TODO: make a nicer error thing
    alert('Tegund skráar ekki studd. Vinsamlegast veldu mynd á forminu: .jpg, .jpeg eða .png');
  }

  document.getElementById('scaleSlider').oninput = function (e) {
  	scale = e.target.value;
  	drawImage(lastX, lastY);
  };

  document.getElementById('crop').onclick = function (e) {
  	e.preventDefault();
  	$('#beforeCrop').hide();
  	$('#afterCrop').show();
  	
  	var tmpContext, tmpCanvas, src;
  	tmpCanvas = document.createElement('canvas');
  	tmpContext = tmpCanvas.getContext('2d');
  	tmpCanvas.width = cropSize;
  	tmpCanvas.height = cropSize;
  	tmpContext.drawImage(context.canvas, cropOffsetX, cropOffsetY, cropSize, cropSize, 0, 0, cropSize, cropSize);
  	src = tmpCanvas.toDataURL();
  	document.getElementById('croppedImg').src = src;
  };

  document.getElementById('reset').onclick = function (e) {
  	e.preventDefault();
  	scale = 1, lastX = 0, lastY = 0, isDown = false, baseX = 0, baseY = 0, originalWidth = 0, originalHeight = 0;
  	$('#scaleSlider').value = 1;
  	originalWidth = img.width;
  	originalHeight = img.height;
  	img.width = canvas.width;
  	img.height = (originalHeight / originalWidth) * img.width;
  	drawImage(0, 0);
  };

  document.getElementById('save').onclick = function (e) {
  	// TODO: save cropped image to DB.
  }; 

  document.getElementById('cancel').onclick = function (e) {
  	// TODO: reset and close modal.
  };

  function clearCanvas() {
    context.clearRect(0, 0, canvas.width, canvas.height);    
  };

  function initiateVariables() {

  };

  /* Redraws image on canvas after any change */
  function drawImage(x, y) {
    // clear the canvas
    clearCanvas();
    // to see last coord and move to next coord
    baseX = baseX + (x - lastX);
    baseY = baseY + (y - lastY);
    lastX = x;
    lastY = y;

    scaledWidth = Math.floor(img.width * scale);
    scaledHeight = Math.floor(img.height * scale);
    // draw the image on the canvas
    context.drawImage(img, baseX, baseY, Math.floor(img.width * scale), Math.floor(img.height * scale));
    // the alpha rect over image to show cropped area
    drawCropOverlay();
  };

  function drawCropOverlay() {
    context.fillStyle = 'rgba(242, 242, 242, 0.8)';
    context.beginPath();
    context.rect(0, 0, canvas.width, canvas.height);
    context.moveTo(cropOffsetX, cropOffsetY);
    context.lineTo(cropOffsetX, cropSize + cropOffsetY);
    context.lineTo(cropOffsetX + cropSize, cropOffsetY + cropSize);
    context.lineTo(cropOffsetX + cropSize, cropOffsetY);
    context.closePath();
    context.fill();
  };

  // get x and y coordinates of mouse
  function getMouseCoord(canvas, e) {
    var rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  /* On mouse down */
  canvas.onmousedown = function(e) {
    e.preventDefault();
    var coord = getMouseCoord(canvas, e);
    isDown = true;
    lastX = coord.x;
    lastY = coord.y;
    // console.log("X: ", lastX);
    // console.log("Y: ", lastY);
    // console.log("base x: ", baseX);
    // console.log("base y: ", baseY);
    // console.log("cropOffsetX + cropSize: ", cropOffsetX + cropSize);
    // console.log("cropOffsetY + cropSize: ", cropOffsetY + cropSize);

  };

  /* On mouse move */
  canvas.onmousemove = function(e) {
  	e.preventDefault();
  	if (isDown) {
  		var coord = getMouseCoord(canvas, e);
  		drawImage(coord.x, coord.y);
      if ((baseX >= cropOffsetX) || (baseY >= cropOffsetY) || ((baseX + scaledWidth) <= (cropOffsetX + cropSize)) || (baseY + scaledHeight) <= (cropOffsetY + cropSize)) {
        // TODO: image should not get past this point fix it
        console.log("DO STUFF!");
      }
  	}

      // if (isDown) {
      //   var coord = getMouseCoord(canvas, e);
        
      //   if ((baseX >= cropOffsetX) || (baseY >= cropOffsetY) || ((baseX + scaledWidth) <= (cropOffsetX + cropSize)) || (baseY + scaledHeight) <= (cropOffsetY + cropSize)) {
      //     // TODO: image should not get past this point fix it
      //     console.log("DO STUFF!");
      //   } else {
      //     drawImage(coord.x, coord.y);
      //   }
      // }
      
  };

  /* On mouse up */
  canvas.onmouseup = function(e) {
  	e.preventDefault();
  	isDown = false;
  };


};






// var originalWidth = img.width;
// var originalHeight = img.height;
// var isWider = false;
// if (originalWidth > canvas.width) {
//   img.width = canvas.width;
//   img.height = (originalHeight / originalWidth) * img.width;
//   isWider = true;
// }
// if (originalHeight > canvas.height && !isWider) {
//   img.height = canvas.height;
//   img.width = (originalWidth / originalHeight) * img.height;
// }