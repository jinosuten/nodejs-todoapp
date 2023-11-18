const express = require('express');
const router = express.Router();
const knex = require('../db/knex');
const bcrypt = require("bcrypt");

router.get('/', function (req, res, next) {
  const isAuth = req.session.userid ? true : false;
  res.render('signin', {
    title: 'Sign in',
    isAuth: isAuth,
  });
});

router.post('/', function (req, res, next) {
  const username = req.body.username;
  const password = req.body.password;
  knex("users")
    .where({ name: username })
    .select("*")
    .then(async function (results) {
      if (results.length === 0) {
        res.render("signin", {
          title: "Sign in",
          errorMessage: ["ユーザが見つかりません"],
          isAuth: req.session.userid ? true : false,
        });
      } else if (await bcrypt.compare(password, results[0].password)) {
        req.session.userid = results[0].id;
        res.redirect('/');
      } else {
        res.render("signin", {
          title: "Sign in",
          errorMessage: ["パスワードが間違っています"],
          isAuth: req.session.userid ? true : false,
        });
      }
    })
    .catch(function (err) {
      console.error(err);
      res.render("signin", {
        title: "Sign in",
        errorMessage: [err.sqlMessage],
        isAuth: req.session.userid ? true : false,
      });
    });
});

module.exports = router;
