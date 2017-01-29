TEMPLATE = app

QT += qml quick widgets core concurrent network

CONFIG += c++11

SOURCES += main.cpp \
    cameraworker.cpp \
    clog.cpp \
    parameters.cpp

RESOURCES += qml.qrc

# Additional import path used to resolve QML modules in Qt Creator's code model
QML_IMPORT_PATH =

# Default rules for deployment.
include(deployment.pri)

# TODO: trouver la bonne variable pour pas mettre le path entier $$DESTDIR_TARGET : non
scripts.path += /opt/CameraModule/bin/scripts
scripts.files = scripts/*
INSTALLS += scripts

HEADERS += \
    cameraworker.h \
    clog.h \
    parameters.h

DISTFILES += \
    scripts/light_on.py \
    scripts/light_off.py \
    scripts/util.txt
