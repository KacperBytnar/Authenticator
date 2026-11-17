// passwordhandler.ts

import { Client, QueryResult } from "pg";
import crypto, { createHash } from "crypto";

const dbname = "passwords"; // change this to the database you are usi

interface PasswordRow {
  username: string;
  salt: string;
  hashed_password: string;
}

// change the values of database, user and password
// in the constructor of class PasswordHandler

class PasswordHandler {
  protected con: Client;

  constructor() {
    this.con = new Client({
      host: "localhost",
      port: 5432,
      database: "passwords",  // change this
      user: "nielsj",       // change this
      password: "pizza"     // change this
    });

    this.con.connect()
      .catch((err) => {
        console.error("connect() failed: ", err);
      });
  }

  // login() and register() are called from the app

  // login() returns a text that may be shown in the web browser

  async login(username: string, password: string): Promise<string> {
    const res = await this.findUserByName(username);
    if (res === null) return "unknown db error"; 
      // null indicates some unknown db error
    if (res.rows.length === 0) return "login failed (unknown user)";
      // no rows returned indicates that no such user
    const row = res.rows[0];  
      // read salt and hashed password from password table row
    if ( (typeof row !== "undefined") 
	&& (typeof row.salt !== "undefined")
        && (typeof row.hashed_password !== "undefined")) {
      const salt = row.salt;
      const oldhash = row.hashed_password;
      if (await this.verifyPassword(password, salt, oldhash)) return "login succeeded";
    }
    return "login failed (wrong password)";
  }

  // hashPassword() and verifyPassword() are defined as asynchronous functions.
  // This is not strictly necessary because the library hash funtion called in hasshPassword()
  // is createHash("sha256).update() which is synchronous (and fairly fast).
  // However if you instead call a slow asynchronous library function, say, scrypt,
  // defining the top functions as asynchronous is required.

  async hashPassword(salt: string, password: string): Promise<string> {
    const hash = await createHash("sha256").update(salt + password).digest("hex");
    return hash;
  }

  async verifyPassword(password: string, salt: string, oldhash: string): Promise<boolean> {
    const newhash = await this.hashPassword(salt, password);
    return (newhash === oldhash);
  }

  async findUserByName(username: string): Promise<QueryResult<PasswordRow> | null> {
    const q = `SELECT * FROM password WHERE username = '${username}'`;
    // console.log("query: " + q);
    try {
      const res = await this.con.query<PasswordRow>(q);
      return res;
    } catch (err) {
      return null;
    }
  }

  // register() returns a string that may be shown in the web browser

  async register(username: string, password: string): Promise<string> {
    if (this.passwordIsWeak(username, password)) return "password too weak";
    const salt = this.generateSalt();
    const hashedpassword = await this.hashPassword(salt, password);
    const registerresult = await this.registerUser(username, salt, hashedpassword); 
    return registerresult;
  }

  generateSalt(): string {
    return crypto.randomBytes(8).toString("hex");
  }

  passwordIsWeak(username: string, password: string) : boolean {
    return (password.length < 5);
  }

  async registerUser(username: string, salt: string, hashedpassword: string): Promise<string> {
    const q = `INSERT INTO password VALUES ('${username}', '${salt}', '${hashedpassword}')`;
    // console.log("query: " + q);
    try { 
      const res = await this.con.query(q);
      return "Registration succeeded";  // because SQL INSERT succeeded
    } catch (err) {
         // If an error has occurred, an error message with "duplicate key"
	 // will indicate that there is already a row with this username
	 // (which is defined as a primary key, so duplicates not allowed)
      if (err instanceof Error && err.message.includes("duplicate key")) 
	return "registration failed (user already registered)";
      else return "registration failed";
    }
  }
}

export = PasswordHandler 
