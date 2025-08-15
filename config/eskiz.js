const axios = require("axios");

async function getEskizToken(email, password) {
  const res = await axios.post("https://notify.eskiz.uz/api/auth/login", {
    email,
    password
  });
  return res.data.data.token;
}

module.exports = { getEskizToken };
