const axios = require("axios");
const { getEskizToken } = require("../config/eskiz");

async function sendSMS(phone, message) {
  const token = await getEskizToken(process.env.ESKIZ_EMAIL, process.env.ESKIZ_PASSWORD);
  await axios.post("https://notify.eskiz.uz/api/message/sms/send", {
    mobile_phone: phone,
    message,
    from: "4546"
  }, {
    headers: { Authorization: `Bearer ${token}` }
  });
}

module.exports = { sendSMS };
