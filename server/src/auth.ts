import passport from "passport";
import { Strategy } from "passport-auth0";
import { PORT } from "./config";

const strategy = new Strategy(
  {
    domain: process.env.AUTH0_DOMAIN!,
    clientID: process.env.AUTH0_CLIENT_ID!,
    clientSecret: process.env.AUTH0_CLIENT_SECRET!,
    callbackURL: `http://localhost:${PORT}/api/callback`
  },
  function (accessToken, refreshToken, extraParams, profile, done) {
    return done(null, profile);
  }
);

passport.use(strategy);

passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (user, done) {
  done(null, user);
});