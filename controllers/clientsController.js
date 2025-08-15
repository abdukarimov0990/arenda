const db = require("../config/firebase");

const addClient = async (req, res) => {
  try {
    const docRef = await db.collection("clients").add(req.body);
    res.send({ id: docRef.id });
  } catch (err) {
    res.status(500).send(err.message);
  }
};

const getClients = async (req, res) => {
  const snapshot = await db.collection("clients").get();
  res.send(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
};

module.exports = { addClient, getClients };
