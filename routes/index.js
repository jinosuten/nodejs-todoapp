const express = require('express');
const router = express.Router();
const knex = require('../db/knex');

// ユーザー認証状態をチェックするミドルウェア
const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.userid) {
    // セッションにユーザーIDが存在する場合は認証済みとみなす
    return next();
  }
  // 認証されていない場合はログインページにリダイレクト
  res.redirect('/signin');
};

// GETルート
router.get('/', isAuthenticated, function (req, res, next) {
  const userId = req.session.userid;
  knex("items")
    .select("*")
    .where({ user_id: userId })
    .then(function (results) {
      res.render('index', {
        title: 'ToDo App',
        items: results,
        isAuth: true, // ユーザーは認証済み
      });
    })
    .catch(function (err) {
      console.error(err);
      res.render('index', {
        title: 'ToDo App',
        isAuth: true, // ユーザーは認証済み
        errorMessage: [err.sqlMessage],
      });
    });
});

// POSTルート
router.post('/', isAuthenticated, function (req, res, next) {
  const userId = req.session.userid;
  const todo = req.body.add;
  knex("items")
    .insert({ user_id: userId, content: todo })
    .then(function () {
      res.redirect('/');
    })
    .catch(function (err) {
      console.error(err);
      res.render('index', {
        title: 'ToDo App',
        isAuth: true, // ユーザーは認証済み
        errorMessage: [err.sqlMessage],
      });
    });
});

// 他のルート（signup, signin, logout）を含むルーターの設定
router.use('/signup', require('./signup'));
router.use('/signin', require('./signin'));
router.use('/logout', require('./logout'));

module.exports = router;