const express = require("express");
const Passage = require("@passageidentity/passage-node");
const dotenv = require("dotenv");
const router = express.Router();

dotenv.config({ path: "./config/config.env" });

// Passage configuration
const passageConfig = {
  appID: process.env.PASSAGE_APP_ID,
  apiKey: process.env.PASSAGE_API_KEY,
};

const passage = new Passage(passageConfig); // initialize Passage

// Custom Passage middleware
const passageAuthMiddleware = async (req, res, next) => {
  try {
    let userID = await passage.authenticateRequest(req);
    if (userID) {
      // User is authenticated
      res.userID = userID;
      next();
    }
  } catch (e) {
    console.log(e);
    res.render("unauthorized.ejs"); // render the unauthorized.ejs file if the user is not authenticated
  }
};

// Login route
router.get("/login", (req, res) => {
  res.render("login.ejs", { appID: passageConfig.appID });
});

// Authenticated route that uses the Passage middleware
router.get("/dashboard", passageAuthMiddleware, async (req, res) => {
  let userID = res.userID;
  let user = await passage.user.get(userID);

  let userIdentifier;
  if (user.email) {
    userIdentifier = user.email;
  } else if (user.phone) {
    userIdentifier = user.phone;
  }

  res.render("dashboard.ejs", { userIdentifier });
});

// Logout route
router.get("/logout", (req, res) => {
  res.clearCookie("passage-session");
  res.redirect("/");
});

// Profile route
router.get("/profile", passageAuthMiddleware, async (req, res) => {
  const userID = res.userID;
  const user = await passage.user.get(userID);
  const appID = passageConfig.appID;

  res.render("profile.ejs", { user, appID });
});

// GET /guest
router.get('/guest', (req, res) => {
    res.render('dashboard-guest');
});

// GET /learn
router.get('/learn', (req, res) => {
    res.render('learn');
});

// GET /learn-guest
router.get('/learn-guest', (req, res) => {
    res.render('learn-guest');
});

// POST /article
router.post('/article', async (req, res) => {
    try {
        res.render('article', { article: req.body.article });
    } catch (err) {
        console.error(err);
        res.redirect('/learn');
    }
});

// GET /article
router.get('/article', (req, res) => {
    res.render('article');
});

// GET /user
router.get('/user', (req, res) => {
    res.render('user');
});

// GET /calendar
router.get('/calendar', passageAuthMiddleware, (req, res) => {
    // console.log('res.userid from calendar ', res.userID);

    res.render('calendar', { user: res.userID });
});

// POST /logcycle
router.post('/logcycle', passageAuthMiddleware, (req, res) => {
    console.log('req.body: ', req.body);
});

module.exports = router;
