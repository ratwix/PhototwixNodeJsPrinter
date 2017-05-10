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
    Q_PROPERTY(int wlan0Signal READ wlan0Signal WRITE setWlan0Signal NOTIFY wlan0SignalChanged)
public:
    NetworkManager();

    QString wlan0IP() const;
    void setWlan0IP(const QString &wlan0IP);

    QString eth0IP() const;
    void setEth0IP(const QString &eth0IP);

    int wlan0Signal() const;
    void setWlan0Signal(int wlan0Signal);

private:
    QString     m_wlan0IP;
    QString     m_eth0IP;
    int         m_wlan0Signal;

    QProcess *          m_eth0CheckIP;
    QProcess *          m_wlan0CheckIP;
    QProcess *          m_wlan0CheckSignal;

    QTimer              m_checkNetworkConnected;
signals:
    void                wlan0IPChanged();
    void                wlan0SignalChanged();
    void                eth0IPChanged();

public slots:
    void    eth0CheckIPTerminate(int exitCode, QProcess::ExitStatus exitStatus);
    void    wlan0CheckIPTerminate(int exitCode, QProcess::ExitStatus exitStatus);
    void    wlan0CheckSignalTerminate(int exitCode, QProcess::ExitStatus exitStatus);
    void    refreshNetworkIP();
};

#endif // NETWORKMANAGER_H
