#include <QDebug>
#include <QFile>
#include <QFileInfo>

#include <QString>
#include <string.h>

#include "clog.h"
#include "cameraworker.h"


CameraWorker::CameraWorker() {
    CLog::Write(CLog::Error, "Ca ne devrait jamais arriver");
}

CameraWorker::CameraWorker(Parameters *p)
{
    m_parameters = p;
    m_previewProcess = new QProcess(this);
    connect(m_previewProcess, static_cast<void(QProcess::*)(int, QProcess::ExitStatus)>(&QProcess::finished),
            [=](int exitCode, QProcess::ExitStatus exitStatus){ capturePhotoEnd();});
}

void CameraWorker::startPreview(const QString &fileName, int previewX, int previewY, int previewWidth, int previewHeight)
{
    if (!m_previewProcess->isOpen()) {
        currentFilename = fileName;
        QString program = "raspistill";
        QStringList arguments;

        arguments << "--preview" << QString::number(previewX) + ',' + QString::number(previewY) + ',' + QString::number(previewWidth) + ',' + QString::number(previewHeight);

        arguments << "-h" << QString::number(CAMERA_HEIGHT) << "-w" << QString::number(CAMERA_WIDTH)
                  << "-k" << "-o" << fileName;


        m_previewProcess->start(program, arguments);
    }
}

void CameraWorker::cleanPhotoList()
{
    m_photoList.clear();
}

void CameraWorker::pushPhotoUrl(QString url)
{
    m_photoList.append(url);
}

void CameraWorker::sendPhotos()
{
    QHttpMultiPart *multiPart = new QHttpMultiPart(QHttpMultiPart::FormDataType);

    for (int i = 0; i < m_photoList.length(); i++) {
        QHttpPart imagePart;
        imagePart.setHeader(QNetworkRequest::ContentTypeHeader, QVariant("image/jpeg"));

        QString fileName = m_photoList[i];
        QFile *file = new QFile(fileName);
        QFileInfo fileInfo(*file);
        file->open(QIODevice::ReadOnly);
        imagePart.setHeader(QNetworkRequest::ContentDispositionHeader, QVariant("form-data; name=\"images[]\" ; filename=\"" + fileInfo.fileName() + "\""));
        imagePart.setBodyDevice(file);
        file->setParent(multiPart); // we cannot delete the file now, so delete it with the multiPart
        multiPart->append(imagePart);
    }

    QUrl url(m_parameters->serverUrl() + m_parameters->uploadPhotosPath());
    QNetworkRequest request(url);

    QNetworkReply *reply = m_manager.post(request, multiPart);
    multiPart->setParent(reply);

    connect(reply, static_cast<void(QNetworkReply::*)(QNetworkReply::NetworkError)>(&QNetworkReply::error),
        [=](QNetworkReply::NetworkError code){
            CLog::Write(CLog::Error, "Error upload " + reply->errorString());
            emit photosUploaded(reply->errorString());
    });

    connect(reply, static_cast<void(QNetworkReply::*)()>(&QNetworkReply::finished),
        [=](){
                CLog::Write(CLog::Debug, "Upload Finished");
                //Clean
                QHttpMultiPart* multi = reply->findChildren<QHttpMultiPart *>().at(0);
                QList<QFile *> files = multi->findChildren<QFile *>();
                for (int i = files.length() - 1; i >= 0; i--) {
                    delete files.at(i);
                }
                delete multi;
                emit photosUploaded("");
    });

}

QList<QString> CameraWorker::photoList() const
{
    return m_photoList;
}

void CameraWorker::setPhotoList(const QList<QString> &photoList)
{
    m_photoList = photoList;
}

void CameraWorker::capturePhoto()
{
    //Capture photo and end process by sending x to input chanel
    
    if (m_previewProcess->isOpen()) {
        m_previewProcess->write("x\n");
        //m_previewProcess->closeWriteChannel();
    }
}

void CameraWorker::capturePhotoEnd()
{
    m_previewProcess->close();
    emit imageCaptured(currentFilename);
}

void CameraWorker::uploadImageFinished()
{
    CLog::Write(CLog::Debug, "Upload image finished");
}
