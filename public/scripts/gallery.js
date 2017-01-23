
var serverUrl = window.location.protocol + '//' + window.location.host + "/gallery"

var iogallery = io.connect(serverUrl);

iogallery.on('addPhoto', function(data) {
  addPhoto(data);
});

function hideLeftMenu() {
  if(!$("#wrapper").hasClass("toggled")){
    $("#wrapper").addClass("toggled");
  }
}

function showLeftMenu() {
  $("#wrapper").removeClass("toggled");
}


function showGallery() {
  $('#camera').hide();
  $('#gallery').show();
}


function addPhoto(photo) {
  var photoHtml = $(`<div class="gallery-item container col-sm-4 col-md-3 col-lg-2 text-center">
                      <img src="/photos/result/${photo}?height=250" basicsrc="${photo}" class="img-responsive photoGallery"></img>
                    </div>`);
  $('#gallery').append(photoHtml);

  $('.photoGallery').click(function(event) {
    $("#photoResult").attr('src', "/photos/result/" + event.target.attributes.basicsrc.nodeValue);
    $("#photoResult").attr('basicsrc', event.target.attributes.basicsrc.nodeValue);
    $("#photoModal").modal('show');
  });
}

function deletePhoto(photo) {
  var photo = $("#photoResult").attr('basicsrc');
  $("#alertMessage").html("La photo est supprimée");
  $("#photoModal").modal('hide');
  $.post( "/gallery/deletePhoto", {"photo": photo})
    .done(function( data ) {
      var element = $('.photoGallery[basicsrc="' + photo + '"]').parent().remove();
      $("#alertModal").modal('show');
  });
}

function viewPhoto(photo) {
  var photo = $("#photoResult").attr('basicsrc');
  $("#alertMessage").html("La photo va s'afficher");
  $("#photoModal").modal('hide');
  $.post( "/gallery/viewPhoto", {"photo": photo})
    .done(function( data ) {
        $("#alertModal").modal('show');
  });
}

function printPhoto(photo) {
  $("#alertMessage").html("La photo va s'imprimée");
  $("#photoModal").modal('hide');
  $.post( "/gallery/printPhoto", {"photo": photo})
    .done(function( data ) {
        $("#alertModal").modal('show');
  });
}
