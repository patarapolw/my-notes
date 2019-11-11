import { RequestHandler } from "express";

export default function (): RequestHandler<any> {
  return function secured (req, res, next) {
    if (req.user) { return next(); }
    req.session!.returnTo = req.originalUrl;
    res.redirect('/api/login');
  };
}