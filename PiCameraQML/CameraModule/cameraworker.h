#ifndef CAMERAWORKER_H
#define CAMERAWORKER_H

#include <QHttpMultiPart>
#include <QNetworkAccessManager>
#include <QNetworkReply>
#include <QNetworkRequest>

#include <QObject>
#include <QProcess>

#include "parameters.h"

// Standard port setting for the camera component

#define PICAM_JPEG_QUALITY  85
#define CAMERA_WIDTH    3280    //2592
#define CAMERA_HEIGHT   2464    //1944
class Parameters;
class CameraWorker : public QObject
{
    Q_OBJECT
public:
    CameraWorker();
    CameraWorker(Parameters *p);

    /**
      * Send a signal to prreview to take the photo and quit
      * */
    Q_INVOKABLE void capturePhoto();

    /**
      * Start a preview and wait a keypress to exit (capturePhoto() )
      * */
    Q_INVOKABLE void startPreview(const QString &fileName, int previewX,
                                                            int previewY,
                                                            int previewWidth,
                                                            int previewHeight);

    Q_INVOKABLE void cleanPhotoList();
    Q_INVOKABLE void pushPhotoUrl(QString url);
    Q_INVOKABLE void sendPhotos();

    Q_INVOKABLE void switchOnLight();
    Q_INVOKABLE void switchOffLight();

    QList<QString> photoList() const;
    void setPhotoList(const QList<QString> &photoList);

private:
    QProcess *      m_previewProcess;
    QString         currentFilename;
    QList<QString>  m_photoList;
    Parameters *    m_parameters;

    QNetworkAccessManager   m_manager;

signals:
    void imageCaptured(const QString &filename);
    void photosUploaded(const QString &error);
public slots:
    void capturePhotoEnd();
    void uploadImageFinished();
};

#endif // CAMERA_H
