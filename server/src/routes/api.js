const express = require("express");
const c = require("../controllers/api.controller");
const { validate } = require("../middleware/middleware");

const router = express.Router();

router.get("/health", c.health);
router.get("/currencies", c.listCurrencies);
router.get("/rates", c.getRates);
router.post("/convert", validate(["from", "to", "amount"]), c.convert);
router.get("/history", c.history);

router.get("/favorites", c.listFavorites);
router.post("/favorites", c.addFavorite);
router.delete("/favorites/:id", c.removeFavorite);

router.get("/trends", c.trend);
router.post("/budget", validate(["amount"]), c.budget);

module.exports = router;
