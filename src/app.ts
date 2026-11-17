// app.ts

import express, { Request, Response } from "express";
import cookieParser from "cookie-parser"; 
import path from "path"; 

import PasswordHandler from "./passwordhandler"; 
const passwordHandler = new PasswordHandler();

import TokenHandler from "./tokenhandler"; 
const tokenHandler = new TokenHandler();

export const app = express();
app.use(express.json());
app.use(cookieParser()); 

const myDir: string = path.resolve(); 

// There are four endpoints 

// The "private" authenticator page
// (if the user is not authenticated, the login-or-register page is served instead)

app.get("/authenticator.html", (request: Request, response: Response): void => {
  if (tokenHandler.verifyToken(request)) {
    response.status(200).sendFile(path.join(myDir,"/src/authenticator.html"));
  } else {
    response.status(200).sendFile(path.join(myDir,"/src/loginorregister.html"));
  }
  // status
}); 

// Login endpoint
app.post( "/login", async (request: Request, response: Response): Promise<void> => {
  const username: string = request.body.username;
  const password: string = request.body.password;
  const loginresult: string = await passwordHandler.login( username, password ); 
  if (loginresult === "login succeeded") {
    tokenHandler.setToken(response);
  } response.json({ loginstatus: loginresult });
});

// Registration endpoint
app.post( "/register", async (request: Request, response: Response): Promise<void> => {
  const username: string = request.body.username;
  const password: string = request.body.password;
  const registerresult: string = await passwordHandler.register( username, password ); 
  response.json({ registerstatus: registerresult }); 
});

// The app icon
app.get("/favicon.png", (request: Request, response: Response): void => { 
  response.status(200).sendFile(path.join(myDir,"/src/favicon.png")); // status??
} ); 
