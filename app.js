const express = require('express');
const connection = require('./db/db');
const app = express();
const cookieSession = require("cookie-session");
const secret = "secretCuisine123";


app.use(express.static('public'));
app.use(express.urlencoded({extended: false}));
app.set('view engine', 'ejs');
app.use(
  cookieSession({
    name: "session",
    keys: [secret],
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  })
);

app.get('/top',(req,res)=>{
  res.render('top.ejs');
});

app.get('/index',(req,res)=>{
  const userId = req.session.userid;
  const isAuth = Boolean(userId);
  connection.query(
   'SELECT * FROM items',
   (error, results)=>{
    res.render('index.ejs', {items: results, isAuth: isAuth});
   }
  );
});

app.get('/new',(req,res)=>{
  res.render('new.ejs');
});

app.post('/create', (req, res) => {
  const itemName = req.body.itemName;
  const itemRank = req.body.itemRank;
  const itemDeadline = req.body.itemDeadline;
  const userId = req.session.userid;
  connection.query(
    'INSERT INTO items (user_id, name, `rank`, deadline) VALUES (?, ?, ?, ?)',
    [userId,itemName, itemRank, itemDeadline],
    (error, results) => {
        res.redirect('/index');
    }
  );
});




app.post('/delete/:id',(req,res)=>{
  connection.query(
    'DELETE FROM items WHERE id=?',
    [req.params.id],
    (error,results)=>{
      res.redirect('/index');
    }
  );
});

app.get('/edit/:id',(req,res)=>{
  connection.query(
    'SELECT * FROM items WHERE id=?',
    [req.params.id],
    (error,results)=>{
      res.render('edit.ejs',{item:results[0]});
    }
  );
});

app.post('/update/:id', (req, res) => {
  // HTMLフォームから受け取った日付文字列（'yyyy-mm-dd'形式）をJavaScriptのDateオブジェクトに変換
  const dateStr = req.body.itemDeadline;
  const dateObj = new Date(dateStr);

  // 時間情報を削除し、'yyyy-mm-dd'形式に変換
  const formattedDate = dateObj.toISOString().split('T')[0];

  connection.query(
    'UPDATE items SET name=?, `rank`=?, deadline=? WHERE id=?',
    [req.body.itemName, req.body.itemRank, formattedDate, req.params.id],
    (error, results) => {
      if (error) {
        console.error('データベースエラー:', error);
        res.status(500).send('データベースエラーが発生しました。');
      } else {
        res.redirect('/index');
      }
    }
  );
});

app.use('/', require('./routes/index')); // index.js ルーターへのパス
app.use('/signup', require('./routes/signup')); // signup.js ルーターへのパス





app.listen(3000);