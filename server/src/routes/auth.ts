import { Router } from "express";
import passport from "passport";

const authRouter = Router();

// Perform the login, after login Auth0 will redirect to callback
authRouter.get('/login', (req, res, next) => {
  if (req.session) {
    req.session.returnTo = req.headers.referer;
  }

  next();
}, passport.authenticate('auth0', {
  scope: 'openid email profile'
}), function (req, res) {
  res.redirect('/');
});

// Perform the final stage of authentication and redirect to previously requested URL or '/user'
authRouter.get('/callback', function (req, res, next) {
  passport.authenticate('auth0', function (err, user, info) {
    if (err) { return next(err); }
    if (!user) { return res.redirect('/api/login'); }
    req.logIn(user, function (err) {
      if (err) { return next(err); }
      const returnTo = req.session!.returnTo;
      delete req.session!.returnTo;
      res.redirect(returnTo || '/api/user');
    });
  })(req, res, next);
});

// Perform session logout and redirect to homepage
authRouter.get('/logout', (req, res) => {
  req.logout();

  var returnTo = req.protocol + '://' + req.hostname;
  var port = req.connection.localPort;
  if (port !== undefined && port !== 80 && port !== 443) {
    returnTo += ':' + port;
  }
  var logoutURL = new URL(`https://${process.env.AUTH0_DOMAIN}/v2/logout`);
  logoutURL.searchParams.append("client_id", process.env.AUTH0_CLIENT_ID!);
  logoutURL.searchParams.append("returnTo", returnTo);
  res.redirect(logoutURL.href);
});

authRouter.get('/user', function (req, res, next) {
  const { user } = req as any;

  if (user) {
    const { _raw, _json, ...userProfile } = user;
    return res.json(userProfile);
  } else {
    return res.json(null);
  }
});

export default authRouter;