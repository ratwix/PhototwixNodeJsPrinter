
var nbAllowedSelected = 0;
var allowedSelected = [];

function hidePhoto() {
  $('#camera').hide();
  $('cameraResultPreview').hide();
}

function showPhoto() {
  $('#camera').show();
}

function showCamera() {
  $('#gallery').hide();
  $('#camera').show();
}

function updateNbAllowedSelected() {
  nbAllowedSelected = 0;
  for (var i = 0; i <= 4; i++) {
    allowedSelected[i] = false;
  }
  if (param.render.onePhotoLandscape.active) {
    nbAllowedSelected = 1;
    allowedSelected[1] = true;
  }
  if (param.render.onePhotoPortrait.active) {
    nbAllowedSelected = 1;
    allowedSelected[1] = true;
  }
  if (param.render.twoPhotos.active) {
    nbAllowedSelected = 2;
    allowedSelected[2] = true;
  }
  if (param.render.threePhotos.active) {
    nbAllowedSelected = 3;
    allowedSelected[3] = true;
  }
  if (param.render.fourPhotos.active) {
    nbAllowedSelected = 4;
    allowedSelected[4] = true;
  }
}

//Select a photo if the max number of photo is not selected
function updateCameraPhotoClick() {
  //click on camera images
  $('.cameraSelectedItem').click(function(event) {
    event.stopPropagation();
    event.preventDefault();
    if ($(this).hasClass('cameraSelected')) {
        $(this).toggleClass('cameraSelected');
        updateCameraPreview();
    } else {
      var nb = $('.cameraSelected').length;
      if (nb < nbAllowedSelected) {
        $(this).toggleClass('cameraSelected');
        updateCameraPreview();
      }
    }
  });
}

//Update preview
function updateCameraPreview() {
  var numSelected = $('.cameraSelected').length;
  if ((numSelected == 0) || (!allowedSelected[numSelected])) { //Nb photo selected not ok. Build message
    var msg = "Choisisez";
    var t = [];
    var j = 0;
    for (var i = 0; i <= 4; i++) {
        if (allowedSelected[i]) {t[j++] = i}
    }
    for (var i = 0; i < t.length; i++) {
      if (i == 0) {
        msg += ' ' + t[i].toString()
      } else if (i + 1 < t.length) {
        msg += ', ' + t[i].toString()
      } else {
        msg += ' ou ' + t[i].toString()
      }
    }
    msg += " photos";
    $('#cameraMessage').html(msg);
    $('#cameraResult').hide();
    $('#cameraMessage').show();
  } else { //build the image
    $('#cameraResultSelected1').hide();
    $('#cameraResultSelected2').hide();
    $('#cameraResultSelected3').hide();
    $('#cameraResultSelected4').hide();
    if (numSelected == 1) { //TODO Portrait
      $('#cameraResultTemplateImg').attr("src","/templates/" + param.render.onePhotoLandscape.templateFile);
      $('#cameraResultSelected1').attr("src", $('.cameraSelected:eq(0)').parent().children(".cameraPreview").attr("src"));
      $('#cameraResultSelected1').show();
    }
    if (numSelected == 2) {
      $('#cameraResultTemplateImg').attr("src","/templates/" + param.render.twoPhotos.templateFile);
      $('#cameraResultSelected1').attr("src", $('.cameraSelected:eq(0)').parent().children(".cameraPreview").attr("src"));
      $('#cameraResultSelected1').show();
      $('#cameraResultSelected2').attr("src", $('.cameraSelected:eq(1)').parent().children(".cameraPreview").attr("src"));
      $('#cameraResultSelected2').show();
    }
    if (numSelected == 3) {
      $('#cameraResultTemplateImg').attr("src","/templates/" + param.render.threePhotos.templateFile);
      $('#cameraResultSelected1').attr("src", $('.cameraSelected:eq(0)').parent().children(".cameraPreview").attr("src"));
      $('#cameraResultSelected1').show();
      $('#cameraResultSelected2').attr("src", $('.cameraSelected:eq(1)').parent().children(".cameraPreview").attr("src"));
      $('#cameraResultSelected2').show();
      $('#cameraResultSelected3').attr("src", $('.cameraSelected:eq(2)').parent().children(".cameraPreview").attr("src"));
      $('#cameraResultSelected3').show();
    }
    if (numSelected == 4) {
      $('#cameraResultTemplateImg').attr("src","/templates/" + param.render.fourPhotos.templateFile);
      $('#cameraResultSelected1').attr("src", $('.cameraSelected:eq(0)').parent().children(".cameraPreview").attr("src"));
      $('#cameraResultSelected1').show();
      $('#cameraResultSelected2').attr("src", $('.cameraSelected:eq(1)').parent().children(".cameraPreview").attr("src"));
      $('#cameraResultSelected2').show();
      $('#cameraResultSelected3').attr("src", $('.cameraSelected:eq(2)').parent().children(".cameraPreview").attr("src"));
      $('#cameraResultSelected3').show();
      $('#cameraResultSelected4').attr("src", $('.cameraSelected:eq(3)').parent().children(".cameraPreview").attr("src"));
      $('#cameraResultSelected4').show();
    }

    $('#cameraMessage').hide();
    $('#cameraResult').show();
  }
}

function printCamera() {
  var msg = {};
  msg.photos = [];
  $('.cameraSelected').each(function (index) {
    msg.photos.push("camera/" + $(this).parent().children(".cameraPreview").attr("basicsrc"));
  });
  $.post("/gallery/printCamera", msg, {dataType:"json"})
    .done(function( data ) {
      //TODO add modale message
      console.debug("Votre photo va s'imprimer");
    });
  //create a message with all selected images
}

function cleanCamera() {
  $('.cameraSelected').removeClass("cameraSelected");
  updateCameraPreview();
}
