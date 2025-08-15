const express = require("express");
const router = express.Router();
const { addRental, getRentals } = require("../controllers/rentalsController");

router.post("/", addRental);
router.get("/", getRentals);

module.exports = router;
