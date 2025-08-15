const cron = require("node-cron");
const db = require("../config/firebase");
const { sendSMS } = require("./smsService");

function startDebtChecker() {
  cron.schedule("0 9 * * *", async () => {
    const now = new Date();
    const rentalsSnapshot = await db.collection("rentals")
      .where("payment_due_date", "<", now)
      .where("remaining_debt", ">", 0)
      .get();

    rentalsSnapshot.forEach(async doc => {
      const data = doc.data();
      await db.collection("debts").add({
        rental_id: doc.id,
        client_id: data.client_id,
        due_date: data.payment_due_date,
        remaining_debt: data.remaining_debt
      });
      await sendSMS(data.phone_number, `Qarzingiz ${data.remaining_debt} so‘m. Iltimos, to‘lov qiling.`);
    });

    console.log("Qarzdorlar tekshirildi");
  });
}

module.exports = { startDebtChecker };
