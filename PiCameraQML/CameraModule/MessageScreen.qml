import QtQuick 2.0

Rectangle {
    id:messageScreen
    anchors.fill: parent
    property string message: "message"
    property string imageTag: ""
    property bool   show: false
    property int    timeoutInterval: 3000
    color:"#C0212126"

    state:"hide"
    opacity: 0.0
    visible: opacity != 0.0

    MouseArea {
        anchors.fill: parent
    }

    Text {
        width: parent.width
        height: parent.height * 0.4
        anchors.verticalCenter:parent.verticalCenter
        anchors.horizontalCenter: parent.horizontalCenter
        fontSizeMode :  Text.Fit
        horizontalAlignment: Text.AlignHCenter
        verticalAlignment: Text.AlignVCenter
        color: "white"
        text:message
        minimumPixelSize: 30
        font.pixelSize: 80
    }

    Text {
        color: "white"
        anchors.horizontalCenter: parent.horizontalCenter
        anchors.top : parent.top
        anchors.topMargin: 20
        height: parent.height * 0.3
        font.family: "FontAwesome"
        fontSizeMode: Text.Fit
        font.pixelSize: height
        text: imageTag
    }

    states: [
        State {
            name: "hide"
        },
        State {
            name: "show"
            PropertyChanges { target: messageScreen; opacity: 1.0}
        },
        State {
            name: "showNoTimer"
            PropertyChanges { target: messageScreen; opacity: 1.0}
        }

    ]

    transitions: [
        Transition {
            from: 'hide'; to: 'show'
            NumberAnimation {
                target: messageScreen; properties:'opacity'; duration: 400; easing.type: 'OutQuart'
            }
        },
        Transition {
            from: 'hide'; to: 'showNoTimer'
            NumberAnimation {
                target: messageScreen; properties:'opacity'; duration: 400; easing.type: 'OutQuart'
            }
        }
    ]

    onStateChanged: {
        if (state == "show") {
            t.start()
        }
    }

    Timer {
        id:t
        interval: timeoutInterval; running: false; repeat: false
        onTriggered: {
            timeoutInterval = 3000
            imageTag = ""
            messageScreen.state = "hide"
        }
    }
}
