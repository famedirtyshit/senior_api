const firebase = require("firebase/app");

const initFirebase = () => {
    let firebaseAdmin = firebase.initializeApp({
        apiKey: process.env.FB_APIKEY,
        authDomain: process.env.FB_AUTHDOMAIN,
        projectId: process.env.FB_PROJECTID,
        storageBucket: process.env.FB_STORAGEBUCKET,
        messagingSenderId: process.env.FB_MESSAGINGSENDERID,
        appId: process.env.FB_APPID,
        measurementId: process.env.FB_MEASUREMENTID
    })
    return firebaseAdmin
};


module.exports = initFirebase;