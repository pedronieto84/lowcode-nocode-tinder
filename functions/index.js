// Cargo modulo de firebase- functions
const functions = require("firebase-functions");

// Modulo admin de Firebase
const admin = require("firebase-admin");

// Inicializamos la aplicacion
admin.initializeApp();


// Cargo el modulo de la base de datos
const db = admin.firestore();


// Funcion que detecte una inserción en la colección de SwippeableAction

exports.onDocCreated = functions.firestore.document('collectionSwipes/{docId}').onCreate(async (change, context)=>{
  const object = change.data()
  const myId = object.myId
  const otherId = object.otherId
  const action = object.action
  if (action === "right") {
    // Luego tengo que repetir la operacion pero en su coleccion de "whoLikesMe"
    await db.collection("users").doc(otherId).collection("whoLikesMe").doc(myId).set(
        {
          userId: myId,
          docRef: `users/${otherId}/whoLikesMe/${myId}`,
        },
        { merge: true }
      );
      return response.send(true)
  }
})


exports.post = functions.https.onRequest(async (request, response) => {
  const bodyRaw = request.body;
  const bodyParsed = bodyRaw;
  const peticion = bodyParsed.peticion;
  const myId = bodyParsed.myId;
  const otherId = bodyParsed.otherId;

  if (peticion === "createMatch") {

    try {
      let myIdCleaned = cleanId(myId)
      let otherIdCleaned = cleanId(otherId)
      await db
        .collection("users").doc(myIdCleaned).collection("weLikeEachOther").doc(otherIdCleaned).set(
          {
            userId: otherIdCleaned
            
          },
          { merge: true }
        );


      await db
        .collection("users").doc(otherIdCleaned).collection("weLikeEachOther").doc(myIdCleaned).set(
          {
            userId: myIdCleaned
          },
          { merge: true }
        );

      // TEngo que quitarlo de mis likes o wholikesme
      await db
        .collection("users").doc(myIdCleaned).collection("whoLikesMe").doc(otherIdCleaned).delete();


      // Tengo que quitarlo de sus likes
      await db
        .collection("users").doc(otherIdCleaned).collection("whoLikesMe").doc(myIdCleaned).delete();

      return response.send(true);
    } catch (e) {
      return response.send({error:e});
    }
  }

  if (peticion === "iLikeAPerson") {

    // Luego tengo que repetir la operacion pero en su coleccion de "whoLikesMe"
    await db
      .collection("users").doc(otherId).collection("whoLikesMe").doc(myId).set(
        {
          userId: myId,
          docRef: `users/${otherId}/whoLikesMe/${myId}`,
        },
        { merge: true }
      );
      return response.send(true)
  }


  if( peticion === "breakMatch"){
    // Primero tengo que quitar a ese usuario de mi subcoleccion de weLikeEachOther

    try{

      // El otherId es la concatenacion de las dos ids

      //const 
      //Elimino de mi colección su ID
      await db.collection('users').doc(myId).collection('weLikeEachOther').doc(otherId).delete()
  
      // Elimino de su coleccion mi ID
      await db.collection('users').doc(otherId).collection('weLikeEachOther').doc(myId).delete()
      return response.send(true)

    }catch(e){
      return response.send(false)
    }
  }

  if(peticion === 'dislikePerson'){
    try{
     await db.collection('users').doc(myId).collection('whoLikesMe').doc(otherId).delete()
     return response.send(true)
    }catch(e){
      return response.send(false)
    }
  }
});
