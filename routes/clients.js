const db = require("../config/firebase");

// Ijara qo‘shish
const addRental = async (req, res) => {
  try {
    const docRef = await db.collection("rentals").add(req.body);
    res.send({ id: docRef.id });
  } catch (err) {
    res.status(500).send(err.message);
  }
};

// Ijaralar ro‘yxatini olish
const getRentals = async (req, res) => {
  try {
    const snapshot = await db.collection("rentals").get();
    const rentals = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.send(rentals);
  } catch (err) {
    res.status(500).send(err.message);
  }
};

module.exports = { addRental, getRentals };
