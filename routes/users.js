const express = require("express");
const router = express.Router();
const User = require("../models/user");
/** GET / - get list of users.
 *
 * => {users: [{username, first_name, last_name, phone}, ...]}
 *
 **/

router.get("", async (req, res, next) => {
  const users = await User.all();
  return res.json({ users: users });
});
/** GET /:username - get detail of users.
 *
 * => {user: {username, first_name, last_name, phone, join_at, last_login_at}}
 *
 **/
router.get("/:username", async (req, res, next) => {
  const username = req.params.username;
  console.log(username);
  const user = await User.get(username);
  return res.json({ user: user });
});

/** GET /:username/to - get messages to user
 *
 * => {messages: [{id,
 *                 body,
 *                 sent_at,
 *                 read_at,
 *                 from_user: {username, first_name, last_name, phone}}, ...]}
 *
 **/
router.get("/:username/to", async (req, res, next) => {
  const result = await User.messagesFrom(req.params.username);
  return res.json({ messages: result });
});

/** GET /:username/from - get messages from user
 *
 * => {messages: [{id,
 *                 body,
 *                 sent_at,
 *                 read_at,
 *                 to_user: {username, first_name, last_name, phone}}, ...]}
 *
 **/

router.get("/:username/from", async (req, res, next) => {
  const result = await User.messagesFrom(req.params.username);
  return res.json({ messages: result });
});
module.exports = router;
