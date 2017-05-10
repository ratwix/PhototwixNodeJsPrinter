#include <fstream>
#include "parameters.h"
#include "rapidjson/document.h"
#include "clog.h"


#define CONFIG_FILE string(m_applicationDirPath.toString().toStdString() + "/config.json").c_str()

using namespace std;
using namespace rapidjson;

Parameters::Parameters(QUrl appDirPath)
{
    m_applicationDirPath = appDirPath;
    m_serverUrl = "http://localhost:2000";
    m_templatePath = "/camera/getTemplates";
    m_uploadPhotosPath = "/camera/uploadPhotos";
    m_delayCountdown = 5;
    m_delayPhotoResult = 4;
    m_messagePrint = "";
    unserialize();
}

QString Parameters::serverUrl() const
{
    return m_serverUrl;
}

void Parameters::setServerUrl(const QString &serverUrl)
{
    m_serverUrl = serverUrl;
    emit serverUrlChange();
}

QString Parameters::templatePath() const
{
    return m_templatePath;
}

void Parameters::setTemplatePath(const QString &templatePath)
{
    m_templatePath = templatePath;
    emit templatePathChange();
}

QString Parameters::messagePrint() const
{
    return m_messagePrint;
}

void Parameters::setMessagePrint(const QString &messagePrint)
{
    m_messagePrint = messagePrint;
    emit messagePrintChange();
}

int Parameters::delayCountdown() const
{
    return m_delayCountdown;
}

void Parameters::setDelayCountdown(int delayCountdown)
{
    m_delayCountdown = delayCountdown;
    emit delayCountdownChange();
}

int Parameters::delayPhotoResult() const
{
    return m_delayPhotoResult;
}

void Parameters::setDelayPhotoResult(int delayPhotoResult)
{
    m_delayPhotoResult = delayPhotoResult;
    emit delayPhotoResultChange();
}

QUrl Parameters::applicationDirPath() const
{
    return m_applicationDirPath;
}

void Parameters::setApplicationDirPath(const QUrl &applicationDirPath)
{
    m_applicationDirPath = applicationDirPath;
}

QString Parameters::uploadPhotosPath() const
{
    return m_uploadPhotosPath;
}

void Parameters::setUploadPhotosPath(const QString &uploadPhotosPath)
{
    m_uploadPhotosPath = uploadPhotosPath;
    emit uploadPhotosPathChange();
}

QString Parameters::messageUpload() const
{
    return m_messageUpload;
}

void Parameters::setMessageUpload(const QString &messageUpload)
{
    m_messageUpload = messageUpload;
    emit messageUploadChange();
}

QString Parameters::messagePoorWifi() const
{
    return m_messagePoorWifi;
}

void Parameters::setMessagePoorWifi(const QString &messagePoorWifi)
{
    m_messagePoorWifi = messagePoorWifi;
    emit messagePoorWifiChange();
}

void Parameters::unserialize()
{
    ifstream jsonFile(CONFIG_FILE, ios::in);
    
    if (!jsonFile) {
        CLog::Write(CLog::Info, "JSON File not exist");
        return;
    }

    std::string str;
    jsonFile.seekg(0, std::ios::end);
    str.reserve(jsonFile.tellg());
    jsonFile.seekg(0, std::ios::beg);

    str.assign((std::istreambuf_iterator<char>(jsonFile)),
                std::istreambuf_iterator<char>());

    Document document;
    document.Parse(str.c_str());
    jsonFile.close();
    m_delayPhotoResult = 4;
    if (document.HasMember("serverUrl")) {
        m_serverUrl = QString(document["serverUrl"].GetString());
    }
    if (document.HasMember("templatePath")) {
        m_templatePath = QString(document["templatePath"].GetString());
    }
    if (document.HasMember("messagePrint")) {
        m_messagePrint = QString(document["messagePrint"].GetString());
    }
    if (document.HasMember("uploadPhotosPath")) {
        m_uploadPhotosPath = QString(document["uploadPhotosPath"].GetString());
    }
    if (document.HasMember("delayCountdown")) {
        m_delayCountdown = document["delayCountdown"].GetInt();
    }
    if (document.HasMember("delayPhotoResult")) {
        m_delayPhotoResult = document["delayPhotoResult"].GetInt();
    }
    if (document.HasMember("messageUpload")) {
        m_messageUpload = QString(document["messageUpload"].GetString());
    }
    if (document.HasMember("messagePoorWifi")) {
        m_messagePoorWifi = QString(document["messagePoorWifi"].GetString());
    }
}
