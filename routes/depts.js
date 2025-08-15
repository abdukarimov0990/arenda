const express = require("express");
const router = express.Router();
const { addDebt, getDebts } = require("../controllers/debtsController");

router.post("/", addDebt);
router.get("/", getDebts);

module.exports = router;
