const db = require("../config/firebase");

// Qarzdor qo‘shish
const addDebt = async (req, res) => {
  try {
    const docRef = await db.collection("debts").add(req.body);
    res.send({ id: docRef.id });
  } catch (err) {
    res.status(500).send(err.message);
  }
};

// Qarzdorlar ro‘yxatini olish
const getDebts = async (req, res) => {
  try {
    const snapshot = await db.collection("debts").get();
    const debts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.send(debts);
  } catch (err) {
    res.status(500).send(err.message);
  }
};

module.exports = { addDebt, getDebts };
