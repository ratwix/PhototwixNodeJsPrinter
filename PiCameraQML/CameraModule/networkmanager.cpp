#include "networkmanager.h"

NetworkManager::NetworkManager()
{
    m_eth0IP = "";
    m_wlan0IP = "";

    m_eth0CheckIP = new QProcess(this);
    connect(m_eth0CheckIP, static_cast<void(QProcess::*)(int, QProcess::ExitStatus)>(&QProcess::finished),
            [=](int exitCode, QProcess::ExitStatus exitStatus){ eth0CheckIPTerminate(exitCode, exitStatus);});

    m_wlan0CheckIP = new QProcess(this);
    connect(m_wlan0CheckIP, static_cast<void(QProcess::*)(int, QProcess::ExitStatus)>(&QProcess::finished),
            [=](int exitCode, QProcess::ExitStatus exitStatus){ wlan0CheckIPTerminate(exitCode, exitStatus);});

    connect(&m_checkNetworkConnected, SIGNAL(timeout()), this, SLOT(refreshNetworkIP()));
    m_checkNetworkConnected.start(4000); //Check wifi connected each 4s

}

QString NetworkManager::wlan0IP() const
{
    return m_wlan0IP;
}

void NetworkManager::setWlan0IP(const QString &wlan0IP)
{
    m_wlan0IP = wlan0IP;
    emit wlan0IPChanged();
}

QString NetworkManager::eth0IP() const
{
    return m_eth0IP;
}

void NetworkManager::setEth0IP(const QString &eth0IP)
{
    m_eth0IP = eth0IP;
    emit eth0IPChanged();
}

void NetworkManager::refreshNetworkIP()
{
    //Rafraichissement de l'IP eth0
    if (m_eth0CheckIP->state() == QProcess::Running) {
        m_eth0CheckIP->terminate();
    }

    QString program = "bash";
    QStringList arguments;
    arguments << "-c" << "ifconfig eth0 | grep 'inet addr:' | cut -d: -f2 | awk '{ print $1}'";
    m_eth0CheckIP->start(program, arguments);

    //Rafraichissement de l'IP de wlan0

    QString program2 = "bash";
    QStringList arguments2;
    arguments2 << "-c" << "ifconfig wlan0 | grep 'inet addr:' | cut -d: -f2 | awk '{ print $1}'";
    m_wlan0CheckIP->start(program2, arguments2);
}

void NetworkManager::eth0CheckIPTerminate(int exitCode, QProcess::ExitStatus exitStatus)
{
    QString output(m_eth0CheckIP->readAllStandardOutput());
    if (m_eth0IP != output) {
        setEth0IP(output);
    }

}

void NetworkManager::wlan0CheckIPTerminate(int exitCode, QProcess::ExitStatus exitStatus)
{
    QString output(m_wlan0CheckIP->readAllStandardOutput());
    if (m_wlan0IP != output) {
        setWlan0IP(output);
    }

}
