const functions = require("firebase-functions");


// Modulo admin de Firebase
const admin = require("firebase-admin")

// Inicializamos la aplicacion
admin.initializeApp()

// Cargo el modulo de la base de datos
const db = admin.firestore()

 


// Obtener todos los usuarios
exports.getUsers = functions.https.onRequest(async (request, response) => {
    const usersDocs =  await db.collection('users').get()
    console.log('userdocs', usersDocs)
    console.log('is Undefined?', usersDocs.docs)
    const userData = usersDocs.docs.map((eachDoc)=>{
      return eachDoc.data()
    })
    console.log('userData', userData)
    response.send(userData);
});

// OBtener solo un usuario

exports.getUser = functions.https.onRequest(async (request, response) => {


  const uid = request.query.uid
  console.log('uid', uid)
  const user = await (await db.collection('users').doc(uid).get()).data()

  response.send(user);
});


// Endpoint que me devuelva todos mis matches

exports.getMyMatches = functions.https.onRequest(async (request, response) => {


  const uid = request.query.uid
  console.log('uid', uid)
  const arrayOfDocs = await db.collection('users').doc(uid).collection('weLikeEachOther').get()
  const arrayOfData = arrayOfDocs.docs.map((eachDoc)=> eachDoc.data())

  response.send(arrayOfData);
});

