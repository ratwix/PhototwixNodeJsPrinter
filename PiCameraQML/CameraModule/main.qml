import QtQuick 2.7
import QtQuick.Window 2.2


Window {
    visible: true
    //width: 800
    //height: 480
    visibility: Window.FullScreen
    title: qsTr("Phototwix")

    QtObject {
        id:globalVar
        property color      backColor:               "#6C6F70"
        property color      backColorTemplate:       "#005A8C"
        property int        countdown_delay : 0
        property int        currentPhoto : 0
        property int        nb_photos : 0
        property int        nb_photo_print : 1
    }

    ListModel {
        id:templateList
    }

    ListModel {
        id:resultList
    }

    Rectangle {
        id:cameraItem
        anchors.fill: parent
        color: globalVar.backColor
        state: "TEMPLATE_MODE"



        Item {
            id: chooseTemplateItem
            height: parent.height * 0.9
            width: parent.width
            anchors.verticalCenter: parent.verticalCenter
            anchors.left: parent.left
            visible: true

            MouseArea {
                anchors.fill: parent
                onClicked: {}
            }

            Component {
                id: templateDelegate

                Item {
                    id:templateItem
                    height: chooseTemplateItem.height
                    width: templateImg.paintedWidth

                    Rectangle {
                        color:globalVar.backColorTemplate
                        anchors.fill: templateImg
                    }

                    Image {
                        id: templateImg
                        source: url
                        height: templateItem.height
                        fillMode: Image.PreserveAspectFit
                        cache: true
                        asynchronous: false
                        antialiasing: true
                    }

                    MouseArea {
                        anchors.fill: parent
                        onClicked: {
                            startGlobalPhotoProcess(number)
                        }
                    }
                }
            }

            ListView {
                anchors.fill: parent
                spacing: 10
                orientation: Qt.Horizontal
                layoutDirection: Qt.LeftToRight
                delegate: templateDelegate
                model:templateList
                visible: templateList.count > 0
            }

            ButtonAwesome {
                id:refreshButton
                size:parent.height * 0.5
                anchors.horizontalCenter: parent.horizontalCenter
                anchors.verticalCenter: parent.verticalCenter
                code:"\uf021"
                onClicked: {
                    templateList.clear();
                    getTemplates();
                }
                visible: templateList.count <= 0
            }

            Item {
                id:eth0Info
                anchors.bottom: parent.bottom
                anchors.bottomMargin: 10
                anchors.right: parent.right
                anchors.rightMargin: 10
                height: 40
                width: height * 5
                visible: templateList.count <= 0

                Text {
                    width: height
                    height: parent.height
                    anchors.left: parent.left
                    font.pixelSize: height
                    font.family: "FontAwesome"
                    horizontalAlignment: Text.AlignHCenter
                    verticalAlignment: Text.AlignVCenter
                    text: "\uf1e6"
                    color:(networkManager.eth0IP != "") ? "green" :  "black"
                }

                Text {
                    //height: parent.height
                    //width: height * 4
                    anchors.verticalCenter: parent.verticalCenter
                    anchors.right: parent.right
                    horizontalAlignment: Text.AlignHCenter
                    verticalAlignment: Text.AlignVCenter
                    text:"IP:" + networkManager.eth0IP
                }
            }

            Item {
                id:wlan0Info
                anchors.bottom: eth0Info.top
                anchors.bottomMargin: 10
                anchors.right: parent.right
                anchors.rightMargin: 10
                height: 40
                width: height * 5
                visible: templateList.count <= 0

                Text {
                    width: height
                    height: parent.height
                    anchors.left: parent.left
                    font.pixelSize: height
                    font.family: "FontAwesome"
                    horizontalAlignment: Text.AlignHCenter
                    verticalAlignment: Text.AlignVCenter
                    text: "\uf1eb"
                    color:(networkManager.wlan0IP != "") ? (networkManager.wlan0Signal > 80 ? "green" : (networkManager.wlan0Signal > 40 ? "orange" : "red")) :  "black"
                }

                Text {
                    //height: parent.height
                    //width: height * 4
                    anchors.verticalCenter: parent.verticalCenter
                    anchors.right: parent.right
                    horizontalAlignment: Text.AlignHCenter
                    verticalAlignment: Text.AlignVCenter
                    text:"IP:" + networkManager.wlan0IP
                }
            }
        }

        Item {
            id: photoProcessItem
            anchors.fill: parent

            MouseArea {
                anchors.fill: parent
                onClicked: {}
            }

            Text {
                id: countdown
                text: globalVar.countdown_delay
                anchors.left: parent.left
                anchors.top: parent.top
                anchors.bottom: parent.bottom
                anchors.leftMargin: 10
                horizontalAlignment: Text.AlignHCenter
                verticalAlignment: Text.AlignVCenter
                fontSizeMode: Text.Fit; minimumPixelSize: 10; font.pixelSize: 72
                color: "white"
                width: parent.width - parent.height * 4 / 3 - 10
            }
        }

        Item {
            id: photoResultItem
            anchors.fill: parent

            MouseArea {
                anchors.fill: parent
                onClicked: {}
            }

            Image {
                id:photoResult

                anchors.verticalCenter: parent.verticalCenter
                anchors.horizontalCenter: parent.horizontalCenter
                height: parent.height * 0.8
                antialiasing: true
                rotation: 5
                fillMode: Image.PreserveAspectFit
            }
        }

        Item {
            id: photoGlobalResultItem
            anchors.fill: parent

            MouseArea {
                anchors.fill: parent
                onClicked: {}
            }

            Component {
                id: resultDelegate

                Image {
                    source: "file:///" + url
                    width: resultListView.width
                    fillMode: Image.PreserveAspectFit
                    asynchronous: false
                }
            }

            ListView {
                id:resultListView
                width: parent.width * 0.7
                height: parent.height
                anchors.left: parent.left
                anchors.top: parent.top
                spacing: 10
                delegate: resultDelegate
                model:resultList
            }

            Column {
                anchors.right: parent.right
                anchors.rightMargin: 20
                anchors.verticalCenter: parent.verticalCenter
                spacing: 20
                width: parent.width * 0.2

                ButtonAwesome {
                    id:printButton
                    size:parent.width
                    code:"\uf02f"
                    onClicked: {
                        if (networkManager.wlan0Signal < 20) {
                            mbox.message = parameters.messagePoorWifi
                            mbox.imageTag = "\uf093"
                            mbox.state = "show"
                        } else {
                            sendToPrinter();
                            mbox.message = parameters.messageUpload
                            mbox.imageTag = "\uf093"
                            mbox.timeoutInterval = 30000
                            mbox.state = "show"
                        }
                    }
                }

                Item {
                    id:numberPrint
                    width: parent.width
                    height: width / 3
                    ButtonAwesome {
                        id:minusButton
                        size:parent.height
                        anchors.left: parent.left
                        code:"\uf068"
                        onClicked: {
                            if (globalVar.nb_photo_print > 1) {
                                globalVar.nb_photo_print = globalVar.nb_photo_print - 1
                            }
                        }
                    }
                    Text {
                        id: photoNumberPrint
                        height: parent.height
                        width: height
                        font.pixelSize: height
                        anchors.horizontalCenter: parent.horizontalCenter
                        horizontalAlignment: Text.AlignHCenter
                        verticalAlignment: Text.AlignVCenter
                        text:globalVar.nb_photo_print
                    }
                    ButtonAwesome {
                        id:plusButton
                        size:parent.height
                        anchors.right: parent.right
                        code:"\uf067"
                        onClicked: {
                            if (globalVar.nb_photo_print < 6) {
                                globalVar.nb_photo_print = globalVar.nb_photo_print + 1
                            }
                        }
                    }
                }

                ButtonAwesome {
                    id:homeButton
                    size:parent.width
                    code:"\uf015"
                    onClicked: {
                        cameraItem.state = "TEMPLATE_MODE";
                    }
                }
            }



        }


        Text {
            width: height
            height: parent.height * 0.1
            anchors.right: parent.right
            anchors.rightMargin: 10
            anchors.top: parent.top
            anchors.topMargin: 10
            font.pixelSize: height
            font.family: "FontAwesome"
            horizontalAlignment: Text.AlignHCenter
            verticalAlignment: Text.AlignVCenter
            visible: templateList.count > 0
            text: "\uf1eb"
            color:(networkManager.wlan0IP != "") ? (networkManager.wlan0Signal > 80 ? "green" : (networkManager.wlan0Signal > 40 ? "orange" : "red")) :  "black"
        }


        states: [
            State {
                name: "TEMPLATE_MODE"
                PropertyChanges { target: chooseTemplateItem; visible:true}
                PropertyChanges { target: photoProcessItem; visible: false }
                PropertyChanges { target: photoResultItem; visible: false }
                PropertyChanges { target: photoGlobalResultItem; visible: false }
            },
            State {
                name: "PHOTO_MODE"
                PropertyChanges { target: chooseTemplateItem; visible:false}
                PropertyChanges { target: photoProcessItem; visible: true }
                PropertyChanges { target: photoResultItem; visible: false }
                PropertyChanges { target: photoGlobalResultItem; visible: false }
            },
            State {
                name: "PHOTO_RESULT"
                PropertyChanges { target: chooseTemplateItem; visible:false}
                PropertyChanges { target: photoProcessItem; visible: false }
                PropertyChanges { target: photoResultItem; visible: true }
                PropertyChanges { target: photoGlobalResultItem; visible: false }
            },
            State {
                name: "PHOTO_FINAL_RESULT"
                PropertyChanges { target: chooseTemplateItem; visible:false}
                PropertyChanges { target: photoProcessItem; visible: false }
                PropertyChanges { target: photoResultItem; visible: false }
                PropertyChanges { target: photoGlobalResultItem; visible: true }
            }
        ]
    }

    Component.onCompleted: {

    }

    FontLoader {
        source: "resources/font/Gabrielle.ttf"
    }

    FontLoader {
        source: "resources/font/FontAwesome.otf"
    }

    MessageScreen {
        id:mbox
    }

    //Start global photo process
    function startGlobalPhotoProcess(photoNumber) {
        //camera.switchOnLight();
        globalVar.nb_photos = photoNumber;
        globalVar.currentPhoto = 0;
        resultList.clear();
        startPhotoProcess(0);
    }

    //for each photo, start single photo process
    function startPhotoProcess(photoNumber) {
        camera.switchOnLight();
        cameraItem.state = "PHOTO_MODE";
        globalVar.countdown_delay = parameters.delayCountdown
        //Display preview
        var camera_height = photoProcessItem.height;
        var camera_width = photoProcessItem.width - countdown.width;
        var camera_y = 0;
        var camera_x = countdown.width;
        var cd = new Date();
        var photo_name = "/tmp/phototwix_" + cd.getFullYear() + "_" + cd.getMonth() + 1 + "_" + cd.getDate() + "_" + cd.getHours() + "-" + cd.getMinutes() + "-" + cd.getSeconds() + ".jpg"
        camera.startPreview(photo_name, camera_x, camera_y, camera_width, camera_height);
        takePhotoTimer.start();
    }

    Timer {
        id:takePhotoTimer
        interval: 1000;
        running: false;
        repeat: true
        onTriggered: {
            globalVar.countdown_delay--;
            if (globalVar.countdown_delay <= 0) {
                takePhotoTimer.stop();
                takePhoto();
            }
        }
    }

    //Take the photo
    function takePhoto(photoNumber) {
        camera.capturePhoto();
        //showPhotoResult("D:/Perso/PhototwixNodeJsPrinter/public/photos/single/camera/Desert.jpg"); //TODO: test
    }

    //When photo is taken
    Connections {
        target: camera
        onImageCaptured : {
            camera.switchOffLight();
            showPhotoResult(filename);
        }
        onPhotosUploaded : {
            camera.switchOffLight();
            if (error == "") {
                mbox.message = parameters.messagePrint
            } else {
                mbox.message = "Erreur : " + error
            }
            mbox.imageTag = "\uf02f"
            mbox.state = "hide"
            mbox.timeoutInterval = 3000
            mbox.state = "show"
            cameraItem.state = "TEMPLATE_MODE"
        }
    }

    function showPhotoResult(filename) {
        photoResult.source = "file:///" + filename;
        var data = {'photo_number' : globalVar.currentPhoto, 'url' : filename};
        resultList.append(data);
        cameraItem.state = "PHOTO_RESULT"
        showPhotoTimer.start();
    }

    //Temps durant lequel on affiche la photo de résultat
    Timer {
        id:showPhotoTimer
        interval: parameters.delayPhotoResult * 1000;
        running: false;
        repeat: false
        onTriggered: {
            globalVar.currentPhoto++;
            if (globalVar.currentPhoto < globalVar.nb_photos) {
                startPhotoProcess(globalVar.currentPhoto)
            } else {
                endGlobalPhotoProcess();
            }
        }
    }

    //End of photo process
    function endGlobalPhotoProcess() {
        console.log("End global Photo Process");
        globalVar.nb_photo_print = 1;
        //camera.switchOffLight();
        cameraItem.state = "PHOTO_FINAL_RESULT";
    }

    ////////////////////////////////////////////
    ////////////////////////////////////////////

    function getTemplates() {
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function(o) {
            if (xhr.readyState == xhr.DONE) {
                if ( xhr.status == 200) {
                    console.log(xhr.responseText);
                    var json = JSON.parse(xhr.responseText);

                    for (var i = 0; i < json.templates.length; i++) {
                        var template = {
                            number: json.templates[i].nb,
                            url: parameters.serverUrl + json.templates[i].templateUrl
                        };
                        templateList.append(template);
                    }
                }
            }
        }
        xhr.open('GET', parameters.serverUrl + parameters.templatePath, true);
        xhr.send();
    }

    function sendToPrinter() {
        camera.cleanPhotoList();
        for (var i = 0; i < resultList.count; i++) {
            camera.pushPhotoUrl(resultList.get(i).url);
        }
        camera.sendPhotos(globalVar.nb_photo_print);
    }

}
