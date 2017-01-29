#include "clog.h"
#include <iostream>
#include <qstring.h>

bool CLog::m_bInitialised = false;
int  CLog::m_nLevel = CLog::Error;

void CLog::Write(int nLevel, const char *szFormat)
{
    if (nLevel >= m_nLevel)
    {
        switch (nLevel) {
            case CLog::Debug:
                cout << "DEBUG:";
            break;
            case CLog::Info:
                cout << "INFO:";
            break;
            case CLog::Error:
                cout << "ERROR:";
            break;
            case CLog::Fatal:
                cout << "FATAL:";
            break;
            default:
                cout << "LOG:";
            break;
        }
        cout << szFormat << endl;
    }
}

void CLog::Write(int nLevel, const string szFormat) {
    Write(nLevel, szFormat.c_str());
}

void CLog::Write(int nLevel, const QString szFormat) {
    Write(nLevel, szFormat.toStdString().c_str());
}

void CLog::SetLevel(int nLevel)
{
    m_nLevel = nLevel;
    m_bInitialised = true;
}

CLog::CLog()
{

}

CLog::~CLog()
{

}

