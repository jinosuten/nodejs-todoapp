const express = require('express');
const router = express.Router();
const knex = require('../db/knex');
const bcrypt = require("bcrypt");

router.get('/', function (req, res, next) {
  const isAuth = req.session.userid ? true : false;
  res.render('signup', {
    title: 'Sign up',
    isAuth: isAuth,
  });
});

router.post('/', async function (req, res, next) {
  const username = req.body.username;
  const password = req.body.password;
  const repassword = req.body.repassword;

  try {
    const existingUser = await knex("users").where({ name: username }).select("*");
    if (existingUser.length !== 0) {
      res.render("signup", {
        title: "Sign up",
        errorMessage: ["このユーザ名は既に使われています"],
        isAuth: req.session.userid ? true : false,
      });
    } else if (password === repassword) {
      const hashedPassword = await bcrypt.hash(password, 10);
      await knex("users").insert({ name: username, password: hashedPassword });
      res.redirect("/signin");
    } else {
      res.render("signup", {
        title: "Sign up",
        errorMessage: ["パスワードが一致しません"],
        isAuth: req.session.userid ? true : false,
      });
    }
  } catch (err) {
    console.error(err);
    res.render("signup", {
      title: "Sign up",
      errorMessage: [err.sqlMessage],
      isAuth: req.session.userid ? true : false,
    });
  }
});

module.exports = router;