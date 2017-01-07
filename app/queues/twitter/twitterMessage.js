//TODO : inherite from generique message

function TwitterMessage() {
  this.messageType = 'twitter';
  this.id = "";
  this.text = "";
  this.media_url = [];
  this.media_downloaded = [];
  this.userName = "";
  this.userId = "";
  this.userScreenName = "";
  this.resultFile = "";
  this.validate_status = 'pending'; //'pending', 'validated', 'rejected'
}

module.exports = TwitterMessage;
