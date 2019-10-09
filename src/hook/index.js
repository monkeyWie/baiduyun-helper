// import api from '../common/api'

global.test = () => {
  const yunData = {
    ISYEARVIP: 0,
    ISVIP: 0,
    ISSVIP: 0,
    MYUK: 1444206073,
    MYNAME: '唏哩东西',
    MYBDSTOKEN: '5a6fdde6945838d2537c8ca2ee79f311',
    MYBDUSS:
      'pansec_DCb740ccc5511e5e8fedcff06b081203-HpCBrcEXgqfFwY8cxxoRdqO5lcDXfv5Hyo7B1aO47APHbLlEHBsqkgGMF%2FcQLamN4iHOviSZhyNfXcuyMEVOqiwPMKH0%2BxDGq0lzdYX8Wn4ABJYmZrhUch7CQB1htOLpLnKCDU%2BdxGID77gPx%2FRsMOAmT86dWMjqBArNO6nKBp%2FlAlgeskHDyRuzsPAi63RTrAiAv02KHixEcewFOOo7oPRhTsQM5ITfoRbRQcVb%2BQ7xITx7ZXYUy3WpsirNvOqwIU9Mtf5k%2BZYJhRqQWcPtwA%3D%3D',
    LOGINSTATUS: 1,
    sampling: 'disk_trans_pdf,disk_center_change,video_high_speed,disk_timeline',
    task_key: 'f1686664193d7149de7e39c11488483acaed19e3',
    task_time: 1540455356,
    sign1: '21fda99cccc1fed8b8e9385697b164afd9bcf625',
    sign2:
      'function s(j,r){var a=[];var p=[];var o="";var v=j.length;for(var q=0;q<256;q++){a[q]=j.substr((q%v),1).charCodeAt(0);p[q]=q}for(var u=q=0;q<256;q++){u=(u+p[q]+a[q])%256;var t=p[q];p[q]=p[u];p[u]=t}for(var i=u=q=0;q<r.length;q++){i=(i+1)%256;u=(u+p[i])%256;var t=p[i];p[i]=p[u];p[u]=t;k=p[((p[i]+p[u])%256)];o+=String.fromCharCode(r.charCodeAt(q)^k)}return o};',
    sign5: 'd76e889b6aafd3087ac3bd56f4d4053a',
    sign3: 'd76a889b6aafd3o87ac3bd56f4d4053a',
    sign4: 'd76a889b6aafd3o87ac3bd56f4d4053a',
    timestamp: 1540455356,
    faceStatus: 1,
    SERVERTIME: 1540455356392,
    SHOWVIPAD: -1,
    VIPENDTIME: -1,
    MYAVATAR: 'https://ss0.bdstatic.com/7Ls0a8Sm1A5BphGlnYG/sys/portrait/item/9b562610.jpg',
    activity_status: 0,
    CURRACTIVITYCODE: '',
    activity_end_time: '',
    skinName: 'white',
    token:
      '6f9alOZ3WrNKDfEQMMGpuFuZskLHYDMQWf/SsaKCpdQGEScqW55kWb99UufKA3ODyQL0qtCVCx+qCiyirNo3Hq1bXzJ2admbuRKA7/jHL1Zx2pyHgk4PQyiarNFmAjgkMO6tPmNB6zdnDV8hYsAtRR9RmIDY9aQ6OTIf/HqrgZTigDPd9eE+0WBvlXRZ3xySMgRD2pLmyGcyxBSrSbyRm0k4d7ilcli6pKPhe5ViZbUNKUGuTkfjmcSwTh+7jcMhDiuomGnh64N3/Fkr45pHiZVQ3IP/y41CCWM',
    pansuk: '8aWcm97uJBIILKqPdoEwGg',
    volAutoup: '',
    sharedir: 0,
    product: 'yun',
    QUOTAINFOS: { total: 2204391964672, used: 593726783257 }
  }

  const cookie =
    'BAIDUID=E0AB88137011CE9E60E07DAA1B89122F:FG=1; BIDUPSID=E0AB88137011CE9E60E07DAA1B89122F; PSTM=1490246838; panlogin_animate_showed=1; bdshare_firstime=1490766589642; PANWEB=1; pan_login_way=1; __cfduid=d3f4a2a33bd6118b07ef4f9802614c3251536909333; BDUSS=WwzQzl4V0YySDZaRFlHdjIxY1ZyN1d2REtKVzdWazdHWmVqQk5FWWRhaTl-dGRiQVFBQUFBJCQAAAAAAAAAAAEAAACbViYQ3~HBqLarzvcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAL1xsFu9cbBbM; SCRC=2fd23e892ee5817b67785a1b74ab2e7b; STOKEN=df09ee0fb4dc75d2aa38236be7b857e9f3eae62be83221bf2e4a48f6e85f6564; BDCLND=zyW8CRk6TukVoTSVbmjmsHB5Uk%2BYjhbr2u0XOdGhO%2FY%3D; H_PS_PSSID=1431_21083_20719; BDORZ=B490B5EBF6F3CD402E515D22BCDA1598; delPer=0; PSINO=7; MCITY=-340%3A; cflag=15%3A3; BDRCVFR[feWj1Vr5u3D]=I67x6TjHwwYf0; Hm_lvt_7a3960b6f067eb0085b7f96ff5e660b0=1540439598,1540448880,1540449237,1540452698; Hm_lpvt_7a3960b6f067eb0085b7f96ff5e660b0=1540452698; PANPSC=13629639038244241559%3AnSvEWpGhaFrv%2FQbHfd5ZPOn90oj%2BY%2FIsFLEOxSNfYSqtANQvR4L0buRHPx836IpFSrvFsiwiy%2BHrl7yf4dAZY5oeLegwYOb8U3n1vGgkRfVX1A3fWqwiIjI4m7KQu8P3xyxBb%2BtM0p1jbYml1eowNq7IJzS%2Fi2HLfbZ%2FbYW506b%2ByIluCYs1Wp2Zb97G3%2BgS'

  document.cookie = cookie

  api.resolveDownLink('dlink', [{ fs_id: 501081375892725 }], cookie, yunData).then(result => {
    console.log(JSON.stringify(result))
  })
}
/* function test() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(111)
    }, 2000)
  })
}

test().then(r => console.log(r))
console.log(222) */
