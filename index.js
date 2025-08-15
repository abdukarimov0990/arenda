const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use("/clients", require("./routes/clients"));
app.use("/rentals", require("./routes/rentals"));
app.use("/debts", require("./routes/debts"));

// Cron job ishga tushirish
const { startDebtChecker } = require("./services/cronService");
startDebtChecker();

app.listen(process.env.PORT, () => {
  console.log(`Server ${process.env.PORT} portda ishlayapti`);
});
