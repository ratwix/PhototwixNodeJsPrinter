#ifndef NETWORKMANAGER_H
#define NETWORKMANAGER_H

#include <QObject>
#include <QProcess>
#include <QTimer>

class NetworkManager : public QObject
{
    Q_OBJECT
    Q_PROPERTY(QString wlan0IP READ wlan0IP WRITE setWlan0IP NOTIFY wlan0IPChanged)
    Q_PROPERTY(QString eth0IP READ eth0IP WRITE setEth0IP NOTIFY eth0IPChanged)
public:
    NetworkManager();

    QString wlan0IP() const;
    void setWlan0IP(const QString &wlan0IP);

    QString eth0IP() const;
    void setEth0IP(const QString &eth0IP);

private:
    QString     m_wlan0IP;
    QString     m_eth0IP;

    QProcess *          m_eth0CheckIP;
    QProcess *          m_wlan0CheckIP;

    QTimer              m_checkNetworkConnected;
signals:
    void                wlan0IPChanged();
    void                eth0IPChanged();

public slots:
    void    eth0CheckIPTerminate(int exitCode, QProcess::ExitStatus exitStatus);
    void    wlan0CheckIPTerminate(int exitCode, QProcess::ExitStatus exitStatus);
    void    refreshNetworkIP();
};

#endif // NETWORKMANAGER_H
