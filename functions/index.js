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
  // Cojo el objeto que acaba de entrar en collectionSwipes
  const object = change.data()
  // MI id
  const myId = object.myId
  // La id de la otra persona
  const otherId = object.otherId
  // La accion a realizar
  const action = object.action
  if (action === "right") {
    // Right es que me gusta
    // En la subcoleccion de la persona que me gusta le agrego mi objeto 
    await db.collection("users").doc(otherId).collection("whoLikesMe").doc(myId).set(
        {
          userId: myId
        },
        { merge: true }
      );
    // Devuelve una respuesta de un booleano TRUE
    return response.send(true)
  }
})


exports.post = functions.https.onRequest(async (request, response) => {
  // COjo la data del body
  const bodyRaw = request.body;
  // Por si acaso lo parseamos y lo convertimos de JSON a objeto de Javascript
  const bodyParsed = bodyRaw;
  // COjo la peticion
  const peticion = bodyParsed.peticion;
  // Cojo miId
  const myId = bodyParsed.myId;
  // Cojo la id de la otra persona
  const otherId = bodyParsed.otherId;

  // SI la peticion es createMatch, ejecuto esto
  if (peticion === "createMatch") {

    try {
       // EN la id mia añado su id a mi subcoleccion de welikeEachOther
      await db.collection("users").doc(myIdCleaned).collection("weLikeEachOther").doc(otherIdCleaned).set(
          {
            userId: otherIdCleaned
          },
          { merge: true }
        );

      // En la id del otro añado mi id a su coleccion de WeLikeEachOther
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
      // Devuelvo un respnose true
      return response.send(true);
    } catch (e) {
      // SI ha habido algun error entrará en este bloque
      return response.send(false);
    }
  }

  if (peticion === "iLikeAPerson") {

    // Luego tengo que repetir la operacion pero en su coleccion de "whoLikesMe"
    await db
      .collection("users").doc(otherId).collection("whoLikesMe").doc(myId).set(
        {
          userId: myId
        },
        { merge: true }
      );
      return response.send(true)
  }


  if( peticion === "breakMatch"){

    try{
      // El otherId es la concatenacion de las dos ids

      //Elimino de mi colección su ID
      await db.collection('users').doc(myId).collection('weLikeEachOther').doc(otherId).delete()
  
      // Elimino de su coleccion mi ID
      await db.collection('users').doc(otherId).collection('weLikeEachOther').doc(myId).delete()
      // Devuelvo un true si todo ha ido bien
      return response.send(true)
    }catch(e){
      return response.send(false)
    }
  }

  if(peticion === 'dislikePerson'){
    try{
      // De mi subcoleccion de gente que me va detrás, le quito.
     await db.collection('users').doc(myId).collection('whoLikesMe').doc(otherId).delete()
     // SI todo va bien devuelvo un true
     return response.send(true)
    }catch(e){
      // Si hay un error devuelvo un false
      return response.send(false)
    }
  }
});
