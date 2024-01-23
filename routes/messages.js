const express = require("express");
const router = express.Router();
const Message = require("../models/message");
const { ensureLoggedIn } = require("../middleware/auth");
/** GET /:id - get detail of message.
 *
 * => {message: {id,
 *               body,
 *               sent_at,
 *               read_at,
 *               from_user: {username, first_name, last_name, phone},
 *               to_user: {username, first_name, last_name, phone}}
 *
 * Make sure that the currently-logged-in users is either the to or from user.
 *
 **/
router.get("/:id", async (req, res, next) => {
  const result = await Message.get(req.params.id);
  return res.json({ message: result });
});

/** POST / - post message.
 *
 * {to_username, body} =>
 *   {message: {id, from_username, to_username, body, sent_at}}
 *
 **/

router.post("", async (req, res, next) => {
  const result = await Message.create(req.body);
  return res.status(201).json({ message: result });
});
/** POST/:id/read - mark message as read:
 *
 *  => {message: {id, read_at}}
 *
 * Make sure that the only the intended recipient can mark as read.
 *
 **/
router.post("/:id/read", async (req, res, next) => {
  console.log(req.user);
  const message_to_user = await Message.get(req.params.id);
  if (message_to_user.to_user === req.user) {
    const result = await Message.markRead(message_to_user.id);
    return res.status(201).json({ message: result });
  }
});
module.exports = router;
