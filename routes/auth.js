/** POST /login - login: {username, password} => {token}
 *
 * Make sure to update their last-login!
 *
 **/

/** POST /register - register user: registers, logs in, and returns token.
 *
 * {username, password, first_name, last_name, phone} => {token}.
 *
 *  Make sure to update their last-login!
 */

const express = require("express");
const router = express.Router();
const User = require("../models/user");

router.post("/register", async (req, res, next) => {
  try {
    let user = await User.register(req.body);
    return res.status(201).json(user);
  } catch (e) {
    next(e);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const user = await User.get(username);
    let token = await User.authenticate(username, password);
    user.last_login_at = new Date();
    await user.updateLoginTimestamp();
    return res.json({ username, _token: token });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
