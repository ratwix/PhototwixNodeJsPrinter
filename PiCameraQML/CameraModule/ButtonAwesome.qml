import QtQuick 2.0

Rectangle {
    id:buttonAwesomeMain
    property int    size: 30
    property string code: "\uf1ae" //Default
    signal clicked

    height: size
    width: size
    color:"#212126"
    radius:size / 7

    Text {
        color: "white"
        height: parent.height
        width: parent.height
        fontSizeMode: Text.Fit
        font.pixelSize: height * 0.8
        font.family: "FontAwesome"
        horizontalAlignment: Text.AlignHCenter
        verticalAlignment: Text.AlignVCenter
        text: code
    }


    MouseArea {
        anchors { fill: parent;  }
        onClicked: buttonAwesomeMain.clicked()
    }
}
