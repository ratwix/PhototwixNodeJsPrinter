#ifndef CLOG_H
#define CLOG_H

#include <cstdio>
#include <cstdarg>
#include <string>
#include <qstring.h>

using namespace std;

class CLog
{
public:
    enum { All=0, Debug=1, Info=2, Warning=3, Error=4, Fatal=5, None=6 };
    static void Write(int nLevel, const char *szFormat);
    static void Write(int nLevel, const string szFormat);
    static void Write(int nLevel, const QString szFormat);
    static void SetLevel(int nLevel);

protected:
    static void CheckInit();
    static void Init();

private:
    CLog();
    ~CLog();
    static bool m_bInitialised;
    static int  m_nLevel;
};

#endif // CLOG_H
