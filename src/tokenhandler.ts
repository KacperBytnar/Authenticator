// tokenhandler.ts

import cookieParser from "cookie-parser";
import { Request, Response } from "express";

class TokenHandler { 

  setToken(response: Response):  void { 
    response.cookie("login", "ok", { 
      maxAge: 60000,
      httpOnly: true, 
      sameSite: "strict"
    });
  } 

  verifyToken(request: Request): boolean {
    return request.cookies["login"] === "ok"; 
  } 
} 

export = TokenHandler;
