#include <QGuiApplication>
#include <QQmlApplicationEngine>
#include <QApplication>
#include <QQmlContext>
#include <QtQml>
#include <QCursor>
#include "clog.h"
#include "parameters.h"
#include "cameraworker.h"
#include "networkmanager.h"

int main(int argc, char *argv[])
{
    QCoreApplication::setAttribute(Qt::AA_ShareOpenGLContexts, true);
    CLog::SetLevel(CLog::Debug);

    QGuiApplication app(argc, argv);
    Parameters      parameters(QGuiApplication::applicationDirPath());
    CameraWorker    camera(&parameters);
    NetworkManager  nm;

    qmlRegisterType<CameraWorker>("com.phototwix.components", 1, 0, "CameraWorker");
    qmlRegisterType<NetworkManager>("com.phototwix.components", 1, 0, "NetworkManager");

    QQmlApplicationEngine engine;

    engine.rootContext()->setContextProperty("parameters", &parameters);
    engine.rootContext()->setContextProperty("camera", &camera);
    engine.rootContext()->setContextProperty("networkManager", &nm);
    engine.load(QUrl(QStringLiteral("qrc:/main.qml")));

    //Hide cursor
    QApplication::setOverrideCursor(QCursor(Qt::BlankCursor));

    return app.exec();
}
