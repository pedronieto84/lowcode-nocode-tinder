const functions = require("firebase-functions");

// Modulo admin de Firebase
const admin = require("firebase-admin");

// Inicializamos la aplicacion
admin.initializeApp();

// Cargo el modulo de la base de datos
const db = admin.firestore();

// Funcion global para obtener las subcolecciones de cada tipo
const getSubCollectionData = async (myId, subCollectionName) => {
  const docs = await db
    .collection("users")
    .doc(myId)
    .collection(subCollectionName)
    .get();
  const users = docs.docs.map((d) => d.get("userId"));
  return users;
};


// Metodo para limpiar un string

const cleanId = ( id ) =>{
    const hayArrayIcon = id.split('[')
    const isArray = Array.isArray(id)
    if((hayArrayIcon.length > 0) || isArray  ){
      // Hay que limpiarlo
      let cleanId = id.replace('[', '')
      cleanIdFinal = cleanId.replace(']', '')
      return cleanIdFinal
    }else {
      return id
    }
}

// Funcion que detecte una inserción en la colección de SwippeableAction

exports.onDocCreated = functions.firestore.document('collectionSwipes/{docId}').onCreate(async (change, context)=>{
  console.log('ha entrado algo')

  const object = change.data()
  const myId = object.myId
  const otherId = object.otherId
  const action = object.action

  if (action === "right") {
   
    console.log('I like a person llamado desde front', otherId, myId, action)

    // Luego tengo que repetir la operacion pero en su coleccion de "whoLikesMe"
    await db
      .collection("users")
      .doc(otherId)
      .collection("whoLikesMe")
      .doc(myId)
      .set(
        {
          userId: myId,
          docRef: `users/${otherId}/whoLikesMe/${myId}`,
        },
        { merge: true }
      );

      return response.send(true)
  }



})


// OBtener solo un usuario

exports.get = functions.https.onRequest(async (request, response) => {
  const myId = request.query.myId;
  const idToGet = request.query.idToGet;
  const peticion = request.query.peticion;
  console.log('lo que me viene', myId, idToGet, peticion)

  if (peticion === "allUsers") {
   response.send(true)
  }

  if (peticion === "oneUser") {
    const user = await (await db.collection("users").doc(idToGet).get()).data();
    return response.send(user);
  }

  if (peticion === "myMatches") {
    console.log('my matches')
    const myMatches = await getSubCollectionData(myId, "weLikeEachOther");
    console.log('my matches', myMatches)
    return response.send(myMatches);
  }

  if (peticion === "theyLikeMe") {
    console.log('myId', myId)
    const myLikes = await getSubCollectionData(myId, "whoLikesMe");
    console.log('myLikes', myLikes)
    return response.send(myLikes);
  }
});

exports.post = functions.https.onRequest(async (request, response) => {
  const bodyRaw = request.body;
  
  const bodyParsed = bodyRaw;
  const peticion = bodyParsed.peticion;
  const myId = bodyParsed.myId;
  const otherId = bodyParsed.otherId;
  //const idToGet = body.idToGet
  console.log(myId, otherId, peticion);
  if (peticion === "idsOfChat") {

    const idsArray = [myId, otherId];

    console.log("isArray", idsArray);
    idsArray.sort();

    console.log("idsArray Sorted", idsArray);

    const stringIdChat = `chats/${idsArray[0]}-${idsArray[1]}/mensajes`;

    console.log("sringIdChat", stringIdChat);

    return response.send({ stringIdChat, chatDocRef: `chats/${idsArray[0]}-${idsArray[1]}`, idsConcatenated: `${idsArray[0]}-${idsArray[1]}`, idsArray });
  }

  if (peticion === "createMatch") {
    console.log(133)
    try {
      // Añadirle en mi array de weLikeEachOther
       
      // Primero lo meto en mi coleccion de personas que me gustan

      // Limpiar las IDS en caso de que me vengan dentro de un array
      let myIdCleaned = cleanId(myId)
      console.log(141)
      let otherIdCleaned = cleanId(otherId)
      console.log(143)
      console.log('ids cleaned', myIdCleaned, otherIdCleaned)
      const res1 = await db
        .collection("users")
        .doc(myIdCleaned)
        .collection("weLikeEachOther")
        .doc(otherIdCleaned)
        .set(
          {
            userId: otherIdCleaned
            
          },
          { merge: true }
        );
        console.log('res1', res1)

      // Luego tengo que repetir la operacion pero en su coleccion de "whoLikesMe"
      const res2 = await db
        .collection("users")
        .doc(otherIdCleaned)
        .collection("weLikeEachOther")
        .doc(myIdCleaned)
        .set(
          {
            userId: myIdCleaned
          },
          { merge: true }
        );
        console.log('res2', res2)

      // TEngo que quitarlo de mis likes o wholikesme
      const res3 = await db
        .collection("users")
        .doc(myIdCleaned)
        .collection("whoLikesMe")
        .doc(otherIdCleaned)
        .delete();

        console.log('res3', res3)

      // Tengo que quitarlo de sus likes
      const res5 = await db
        .collection("users")
        .doc(otherIdCleaned)
        .collection("whoLikesMe")
        .doc(myIdCleaned)
        .delete();

        console.log('res5', res5)

      const idsArray = [myIdCleaned, otherIdCleaned];
      console.log('idsarray', idsArray)
      idsArray.sort();
      const stringIdChat = `${idsArray[0]}-${idsArray[1]}`;
          console.log('198', stringIdChat)
      const res7 = await db.collection("chats").doc(stringIdChat).set({
        person1: myIdCleaned,
        person2: otherIdCleaned,
      });
      console.log('res7', res7)

      return response.send(true);
    } catch (e) {
      console.log('error', e)
      return response.send({error:e});
    }
  }

  if (peticion === "iLikeAPerson") {
   
    console.log('I like a person llamado desde front', otherId, myId, peticion)

    // Luego tengo que repetir la operacion pero en su coleccion de "whoLikesMe"
    await db
      .collection("users")
      .doc(otherId)
      .collection("whoLikesMe")
      .doc(myId)
      .set(
        {
          userId: myId,
          docRef: `users/${otherId}/whoLikesMe/${myId}`,
        },
        { merge: true }
      );

      return response.send(true)
  }

  if (peticion === "iDontLikeAPerson") {
   
  }

  if( peticion === "breakMatch"){
    // Primero tengo que quitar a ese usuario de mi subcoleccion de weLikeEachOther

    try{

      // El otherId es la concatenacion de las dos ids

      const ids = otherId.split('-')
      const res1 = await db.collection('users').doc(ids[0]).collection('weLikeEachOther').doc(ids[1]).delete()
  
      // Tengo que quitarme a mi de su subcoleccion de weLikeEachOther
      const res2 = await db.collection('users').doc(ids[1]).collection('weLikeEachOther').doc(ids[0]).delete()
  
      console.log('respuestas', res1, res2)
  
      return response.send(true)

    }catch(e){
      console.log('error',e)
      return response.send(false)
    }
  }

  if(peticion === 'dislikePerson'){

    try{

     const res = await db.collection('users').doc(myId).collection('whoLikesMe').doc(otherId).delete()
     console.log('res', res)
     return response.send(true)

    }catch(e){
      console.log('error',e)
      return response.send(false)
    }
  }

 
});
