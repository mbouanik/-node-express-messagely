/** User class for message.ly */

/** User of the site. */
const db = require("../db");
const ExpressError = require("../expressError");
const bcrypt = require("bcrypt");
const { BCRYPT_WORK_FACTOR, SECRET_KEY } = require("../config");
const jwt = require("jsonwebtoken");

class User {
  /** register new user -- returns
   *    {username, password, first_name, last_name, phone}
   */
  constructor(username, first_name, last_name, phone, join_at, last_login_at) {
    this.username = username;
    this.first_name = first_name;
    this.last_name = last_name;
    this.phome = phone;
    this.join_at = join_at;
    this.last_login_at = last_login_at;
  }

  static async register({ username, password, first_name, last_name, phone }) {
    const hash_password = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);
    const result = await db.query(
      `
    INSERT INTO users (username, password, first_name, last_name, phone, join_at) 
    VALUES ($1, $2, $3, $4, $5, $6) RETURNING 
    username, first_name, last_name, phone join_at, last_login_at`,
      [username, hash_password, first_name, last_name, phone, new Date()],
    );
    return new User(
      result.rows[0].username,
      result.rows[0].first_name,
      result.rows[0].last_name,
      result.rows[0].phone,
    );
  }

  /** Authenticate: is this username/password valid? Returns boolean. */

  static async authenticate(username, password) {
    try {
      if (!username || !password) {
        throw new ExpressError("username and password required", 400);
      }

      const result = await db.query(
        `SELECT username, password, last_login_at FROM users WHERE username=$1`,
        [username],
      );

      const user = result.rows[0];

      if (user) {
        if (await bcrypt.compare(password, user.password)) {
          const token = jwt.sign({ username }, SECRET_KEY);
          return token;
        }
      }
      throw new ExpressError("username/password do not match", 404);
    } catch (e) {}
  }

  /** Update last_login_at for user */

  async updateLoginTimestamp() {
    await db.query(`UPDATE users SET last_login_at=$1 WHERE username=$2`, [
      this.last_login_at,
      this.username,
    ]);
  }

  /** All: basic info on all users:
   * [{username, first_name, last_name, phone}, ...] */

  static async all() {
    const result = await db.query(
      `SELECT username, first_name, last_name, phone, last_login_at, join_at FROM users`,
    );
    const users = result.rows.map((r) => {
      return new User(r.username, r.first_name, r.last_name, r.phone);
    });
    return users;
  }

  /** Get: get user by username
   *
   * returns {username,
   *          first_name,
   *          last_name,
   *          phone,
   *          join_at,
   *          last_login_at } */

  static async get(username) {
    const result = await db.query(
      `SELECT username, first_name, last_name, phone, last_login_at, join_at FROM users WHERE username = $1`,
      [username],
    );
    const user = result.rows[0];
    if (user) {
      return new User(
        user.username,
        user.first_name,
        user.last_name,
        user.phone,
        user.last_login_at,
        user.join_at,
      );
    }
  }

  /** Return messages from this user.
   *
   * [{id, to_user, body, sent_at, read_at}]
   *
   * where to_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesFrom(username) {
    const result = await db.query(
      `SELECT id, to_username, body, sent_at, read_at FROM messages WHERE from_username = $1`,
      [username],
    );
    const messages = Promise.all(
      result.rows.map(async (r) => {
        return {
          id: r.id,
          body: r.body,
          sent_at: r.sent_at,
          read_at: r.read_at,
          to_username: await User.get(r.to_username),
        };
      }),
    );
    return messages;
  }

  /** Return messages to this user.
   *
   * [{id, from_user, body, sent_at, read_at}]
   *
   * where from_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesTo(username) {
    const result = await db.query(
      `SELECT id, from_username, body, sent_at, read_at FROM messages WHERE to_username = $1`,
      [username],
    );
    const messages = Promise.all(
      result.rows.map(async (r) => {
        return {
          id: r.id,
          body: r.body,
          sent_at: r.sent_at,
          read_at: r.read_at,
          from_username: await User.get(r.to_username),
        };
      }),
    );
    return messages;
  }
}

module.exports = User;
