//TODO : inherite from generique message

function guid() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
    s4() + '-' + s4() + s4() + s4();
}

function Message() {
  this.messageType = '';
  this.internalId = guid();
  this.id = "";
  this.text = "";
  this.media_url = [];
  this.media_downloaded = [];
  this.userName = "";
  this.userId = "";
  this.userScreenName = "";
  this.resultFile = "";
  this.validate_status = 'pending'; //'pending', 'validated', 'rejected'
  this.print = true;
  this.nbPhotoPrint = 1;
}

module.exports = Message;
