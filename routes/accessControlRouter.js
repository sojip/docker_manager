var router = require("express").Router();
var accessControlController = require("../controllers/accessControlController");

router.get(
  "/:ipaddress/capturefinger",
  accessControlController.captureFingerPrint
);
router.get("/:ipaddress/capturecard", accessControlController.captureCardInfo);
router.get(
  "/:ipaddress/events/subscribe",
  accessControlController.subscribeToEvents
);
router.post("/:ipaddress/events/records", accessControlController.getRecords);
router.get(
  "/:ipaddress/events/records/total",
  accessControlController.getRecordsTotal
);

module.exports = router;
