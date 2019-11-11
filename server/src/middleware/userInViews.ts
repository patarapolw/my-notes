import { RequestHandler } from "express";
import "passport";

export default function (): RequestHandler<any> {
  return function (req, res, next) {
    res.locals.user = req.user;
    next();
  };
}
