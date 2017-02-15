#ifndef PARAMETERS_H
#define PARAMETERS_H

#include <QObject>
#include <QUrl>

class Parameters : public QObject
{
    Q_OBJECT

    Q_PROPERTY(QString serverUrl READ serverUrl WRITE setServerUrl NOTIFY serverUrlChange)
    Q_PROPERTY(QString templatePath READ templatePath WRITE setTemplatePath NOTIFY templatePathChange)
    Q_PROPERTY(QString messagePrint READ messagePrint WRITE setMessagePrint NOTIFY messagePrintChange)
    Q_PROPERTY(QString messageUpload READ messageUpload WRITE setMessageUpload NOTIFY messageUploadChange)
    Q_PROPERTY(QString uploadPhotosPath READ uploadPhotosPath WRITE setUploadPhotosPath NOTIFY uploadPhotosPathChange)
    Q_PROPERTY(int delayCountdown READ delayCountdown WRITE setDelayCountdown NOTIFY delayCountdownChange)
    Q_PROPERTY(int delayPhotoResult READ delayPhotoResult WRITE setDelayPhotoResult NOTIFY delayPhotoResultChange)
public:
    Parameters(QUrl appDirPath);


    QString serverUrl() const;
    void setServerUrl(const QString &serverUrl);

    QString templatePath() const;
    void setTemplatePath(const QString &templatePath);

    QString messagePrint() const;
    void setMessagePrint(const QString &messagePrint);

    int delayCountdown() const;
    void setDelayCountdown(int delayCountdown);

    int delayPhotoResult() const;
    void setDelayPhotoResult(int delayPhotoResult);

    QUrl applicationDirPath() const;
    void setApplicationDirPath(const QUrl &applicationDirPath);

    QString uploadPhotosPath() const;
    void setUploadPhotosPath(const QString &uploadPhotosPath);

    QString messageUpload() const;
    void setMessageUpload(const QString &messageUpload);

private:
    QUrl        m_applicationDirPath;

    QString         m_serverUrl;
    QString         m_templatePath;
    QString         m_uploadPhotosPath;
    QString         m_messageUpload;
    QString         m_messagePrint;

    int         m_delayCountdown;
    int         m_delayPhotoResult;

    void        unserialize();

signals:
    void        serverUrlChange();
    void        templatePathChange();
    void        messagePrintChange();
    void        delayCountdownChange();
    void        delayPhotoResultChange();
    void        uploadPhotosPathChange();
    void        messageUploadChange();
};

#endif // PARAMETERS_H
