const Router = require("express");
const { postMessage, serveConfig } = require("../controllers/sms.controller.js");

const router = Router();

// Route to Config
router.route("/").get(serveConfig);

// Route to POST Request
router.route("/send-sms").post(postMessage);

module.exports = router;
