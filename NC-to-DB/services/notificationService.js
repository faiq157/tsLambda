const {addMessageToNotificationSqs} = require("../utils/lib/aws");

exports.sendRowAnomalyNotifications = async (notificationType, snapAddr, rowNo, duration, alertCleared) => {
  const payload = {notificationType, snapAddr, params: {rowNo, duration, alertCleared}};
  await addMessageToNotificationSqs(payload);
};
exports.sendMobileQCNotifications = async (snapAddr, eventTitle) => {
  const notificationType ='mobile_qc'
  const payload = {notificationType, snapAddr, eventTitle};
  await addMessageToNotificationSqs(payload);
};
