import { Router } from "express";
import { getAuth0, PORT } from "../config";
import { URL } from "url";
import request from "request";
import jwt from "jsonwebtoken";

const authRouter = Router();

authRouter.get('/login', (req, res, next) => {
  if (req.session) {
    req.session.returnTo = req.headers.referer;
  }
  next();
}, (req, res) => {
  const auth0 = getAuth0();
  if (auth0) {
    const url = new URL(`https://${auth0.domain}/authorize`);
    const sp = url.searchParams;
    sp.set("response_type", "code");
    sp.set("client_id", auth0.id);
    sp.set("redirect_uri", `http://localhost:${PORT}/api/callback`);
    sp.set("scope", "openid email profile");
    if (req.query.state) {
      sp.set("state", req.query.state);
    }

    res.redirect(url.href);
  } else {
    res.redirect(req.session!.returnTo);
  }
});

authRouter.get('/callback', (req, res, next) => {
  const auth0 = getAuth0()!;
  const { code, state } = req.query;
  request({
    method: "POST",
    url: `https://${auth0.domain}/oauth/token`,
    headers: {'content-type': 'application/x-www-form-urlencoded'},
    form: {
      grant_type: 'authorization_code',
      client_id: auth0.id,
      client_secret: auth0.secret,
      code,
      redirect_uri: `http://localhost:${PORT}/api/callback`
    }
  }, (err, r, body) => {
    if (err) {
      next(err);
    } else {
      const user = jwt.decode(JSON.parse(body).id_token);
      req.session!.user = user;

      const url = new URL(req.session!.returnTo);
      if (state) {
        url.searchParams.set("state", state);
      }
      res.redirect(url.href);
    }
  })
});

authRouter.post('/logout', (req, res, next) => {
  const auth0 = getAuth0();
  if (auth0) {
    request(`https://${auth0.domain}/v2/logout`, (err) => {
      if (err) {
        next(err);
      }
      
      req.session!.user = null;
      res.sendStatus(200);
    });
  } else {
    res.sendStatus(200);
  }
});

authRouter.post('/user', function (req, res, next) {
  const { user } = req.session!;

  if (user) {
    const { _raw, _json, ...userProfile } = user;
    return res.json(userProfile);
  } else {
    return res.json(null);
  }
});

export default authRouter;