const { initializeApp } = require("firebase/app");
const { getStorage } = require( "firebase/storage");


const firebaseConfig = {
    "type": "service_account",
    "project_id": "providercrm-29c64",
    "private_key_id": "bafccae22cf59f910144004554f3c8ab23673899",
    "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDnI4q477jZk7KH\nw9MNqyMra2XjMTfho3wAeg+yGjgk7hJIoS7eNVZYqOwEHUyNYtWMtfjAas+w1eOB\nbsNSzPM2IERy7otS7H8G+3KPcXZbLfDrNxAL87K2Zem8cXEeDg9NnzusxkyCGUMM\ns3+XCLuYpziPFXoF1j2BezB81TWwSBGPqb5n2mZ3OAdnptk2RTvxjietfQLLs6cZ\n2HBnRqT8HOSGDUPOlJKtGwX3bk2m/GiT2Su7VttmGU8OUmBrhjENCQJk5/b0pIyQ\nLiyHYsvXZ/K49yGzhoZ+32cw4ESbmLH2P8B8lQtJFnQWrw2h+WVpx0KNdfqWTuuv\np/OlJVilAgMBAAECggEAJQWtHl6tZ9JPvg3IdC/FiBqhfQDA7+gZAFWMxo0LEaU9\ncfs5T9fQvw49kZIk1R+vz2RFVgK1xiAYWv7EE/LmgPStqhAZ6lwdo59qc93rZILp\nDC/rZtKvvSX5SJkOEo+TdW4sJ4oyroL/2Zy1stov/C1KsqZwv1cXznHOLCyVdyji\nCDj6o5VQk1Ik8z/fbTGba6T9srJZTyAkkIbqk0Wkgrlrj8Wf/ztfM6srqXHD3y7z\n8EoYbxu9k4SO8rvH3bGrUjYPQVJ2pAE6PW0SgVf20SxVxQLf5rljcslZd99AcwXP\nBqI167GGFPm4B063hNVvvVBF/q5ZYQyecacnmGmoqQKBgQD70WdzdmE+oieKaj9O\na5kldKogEVNC8zWkhJlwONTDbopE0N/StM5KXi1ihU+RVnWS0jCRiLos2CNDeV3N\nYx/zmdBsbBNDIYmNK04mHBEuZ3ejIUaHSm4/a6avV2a4vhQk0ZSYxQbIl6DMW0mW\n78yzbY3U2NGRIHjnwacIwwbmbQKBgQDq+jiXB71yzs9OdI8pQ91Biy2DOx/tYKEv\nJx6TQ1I5uotw341ThbdSiz3EZwgdXw9Klx7Cd+qmV4Z5V5dbf1LI4Bt5aUT7j45F\nRz/CXk8UtM+aUCC2wiZ8MtnL4mhKYnvDveaRRhtunvRXW1dABLJDTzVBwsENrMfd\nYP5bXLU4GQKBgQCOy1j5bXiJVtRLNiJ96p/mUHikRI7NWTLi/tove9qSk91OVo+F\nYUfVfgAIbQYIqVl0j0JBVKIWCd49RdY+QGZ+8Yrx4HsvxxXD+nmPPL01bjC2TYk7\n8KYByp6zsUEro4WytzGnS5qkJu9k0qMxNvwCBy61MtnrjNliujpoyobgJQKBgQDp\nB9HLZi+phhPteIbpo5XvhHlUZfRZ07TGMIOQA/mtqqTTAcEEjd2qjNBq0MspZbai\ngJBOx+H7qV2BRS6j3Pdao3Zbx9xTpqCvb+N5fVHr9QzVupVW6eCE12FLY3OOIXEg\nRFo+xEo8QIONhtZWdNHdEtZ8KwqN50Ym9CQMszo9MQKBgB8XeD2UIFNsV/by+EXp\nSj5DAUa1ZU1/fifCw0atUo4i9L+K1qq9cApg9i3Y5DKRy2WuGgxOx3/4LADqmgkG\n36Jy6lPlQtHMKGJmoJQWR2CkhImddnNz/3y/hbPohc07IqazxnNt3Qgsl8BKVKnK\nea3E0CpOahZr/B/mSs4ou7Jc\n-----END PRIVATE KEY-----\n",
    "client_email": "firebase-adminsdk-q9v33@providercrm-29c64.iam.gserviceaccount.com",
    "client_id": "102095700721097006906",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-q9v33%40providercrm-29c64.iam.gserviceaccount.com",
    "universe_domain": "googleapis.com",
    "storageBucket": "gs://providercrm-29c64.appspot.com"
}
const app = initializeApp(firebaseConfig);
const ImgStorage = getStorage(app);
export default ImgStorage;

