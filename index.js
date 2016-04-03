
var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var crypto = require('crypto');
var session = require('express-session');
var checkLogin = require('./checkLogin.js');
var moment = require('moment');



//引入验证模块
//var passort = require('passport'),
//    LocalStratege = require('passport-local').Strategy;

//引入mongoose
var mongoose = require('mongoose');

//引入模型
var models = require('./models/models');
var User = models.User;
var Note = models.Note;

//使用mongoose链接服务
mongoose.connect('mongodb://localhost:27017/notes');
mongoose.connection.on('error',console.error.bind(console,'数据库链接失败'));


var app = express();

//view驱动安装
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');



app.use(express.static(path.join(__dirname, 'public')));
//app.use(express.favicon());
//app.use(express.logger('dev'));
//app.use(express.bodyParser());
//app.use(express.methodOverride());
//app.use(express.cookieParser());
//app.use(express.session({secret:'blog.fens.me',cookie:{maxAge:6000}}));


//定义数据解析器
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//建立session模型
app.use(session({
    secret: '1234',
    name: 'mynote',
    cookie: { maxAge: 1000 * 60 * 20 },//设置session的保存时间为20分钟
    resave: false,
    saveUninitialized: true
}));

//app.use('port', process.env.port || 3000);
//app.use(passort.initialize);
//app.use(passort.session());

//passport.use('local', new LocalStrategy(
//    function (username, password, done) {
//        if (username !== user.username) {
//            return done(null, false, { message: '用户名不存在' });
//        }
//        if (password !== user.password) {
//            return done(null, false, { message: '用户名或者密码有误' });
//        }
//        return done(null, user);
//    }
//));

//passport.serializeUser(function (user, done) {//保存user对象
//    done(null, user);//可以通过数据库方式操作
//});
//
//passport.deserializeUser(function (user, done) {//删除user对象
//    done(null, user);//可以通过数据库方式操作
//});


//app.get('/',checkLogin.noLogin);
app.get('/', function (req, res) {
    //Note.find({author:req.session.user.username})
    //    .exec(function(err,allNotes){
    //        if(err)
    //        {
    //            console.log(err);
    //            return res.redirect('/');
    //        }
            res.render('index', {
                user:req.session.user,
                title: '首页',
                //notes:allNotes
            });
        //});
});

app.get('/',checkLogin.noLogin);
app.get('/home', function (req, res) {
    console.log("个人主页");
    Note.find({author:req.session.user.username})
        .exec(function(err,allNotes){
            if(err)
            {
                console.log(err);
                return res.redirect('/');
            }
            res.render('home', {
                user:req.session.user,
                title: '个人主页',
                notes:allNotes,
                moment:moment
            });
        });
});

app.get('/detail/:_id', function (req, res) {
    console.log('查看笔记');

    Note.findOne({_id:req.params._id})
        .exec(function(err,art){
            if(err)
            {
                console.log(err);
                return res.redirect('/');
            }
            if(art)
            {
                console.log("id："+art._id);
                res.render('detail', {
                    user:req.session.user,
                    title: '笔记详情',
                    art:art,
                    moment:moment
                });
            }
        });
   });

/**
 * 通过日记的id进行修改页面
 */
app.get('/update/:_id', function (req, res) {
    console.log('修改笔记');
    Note.findOne({_id:req.params._id})
        .exec(function(err,art){
            if(err)
            {
                console.log(err);
                return res.redirect('/home');
            }
            if(art)
            {
                console.log(req.params._id + "修改页面");
                    res.render('update', {
                        user:req.session.user,
                        title: '笔记修改',
                        art:art,
                        moment:moment
                    });
            }
        });
});

/**
 * 通过日记的id进行修改
 */
app.post('/update/:_id', function (req, res) {
    console.log('修改笔记');
    Note.findOne({_id:req.params._id})
        .exec(function(err,art){
            if(err)
            {
                console.log(err);
                return res.redirect('/home');
            }
            if(art)
            {
                    art.title=req.body.title;
                    art.tag=req.body.tag;
                    art.content=req.body.content;
                art.save(function(err,doc){
                    if(err)
                    {
                        console.log(err);
                        return res.redirect('/home');
                    }
                    console.log("文章修改成功");
                    res.render('detail', {
                        user:req.session.user,
                        title: '笔记修改',
                        art:art,
                        moment:moment
                    });
                });
            }
        });
});

/**
 * 根据id删除日记
 */
app.get('/delete/:_id',function(req,res){
    console.log("删除日记" + req.params._id);
    Note.findOne({_id:req.params._id})
        .exec(function(err,art){
            if(err)
            {
                console.log(err);
                return res.redirect('/home');
            }
            if(art)
            {
                Note.remove({_id:art._id},function(err,result){
                    if(err)
                    {
                        console.log(err);
                    }
                    else{
                        console.log("删除成功"+result +err);
                    }
                    return res.redirect('/home');
                });

            }
        });
});

app.get('/register', function (req, res) {
    console.log('注册');
    res.render('register', {
        user: req.session.user,
        title: '注册',
        err:''
    });
});
app.post('/register', function (req, res) {
    var username = req.body.username,
        password = req.body.password,
        passwordRepeat = req.body.passwordRepeat;

    //检查输入的用户名是否为空，使用trim去掉两端空格
    if (username.trim().length == 0) {
        console.log("用户名不能为空");
        return res.redirect('/register');
    }
    //检查输入的密码是否为空，使用trim去掉两端空格
    if (password.trim().length == 0) {
        console.log("密码不能为空");
        return res.redirect('/register');
    }
    //检查输入的密码是否一致
    if (password != passwordRepeat) {
        console.log("两次密码输入不一致");
        return res.redirect('/register');
    }

    //检查用户名是否已经存在，如果不存在，则保存该条记录
    User.findOne({ username: username }, function (err, user) {
        if (err) {
            console.log(err);
            return res.redirect('/register');
        }
        if (user) {
            console.log("用户名已经存在");
            return res.redirect('/register');
        }
        //对密码进行加密
        var md5 = crypto.createHash('md5'),
            md5password = md5.update(password).digest('hex');

        //保存数据
        var newUser = new User({
            username: username,
            password: md5password
        });

        newUser.save(function (err, doc) {
            if (err) {
                console.log(err);
                return res.redirect('/register');
            }
            console.log('注册成功');
            return res.redirect('/login');
        });
    });
});

//app.all('/login',isLoggedIn);
app.get('/login', function (req, res) {
    console.log('登录');
    res.render('login', {
        user: req.session.user,
        title: '登录'
    });
});
app.post('/login', function (req, res) {
    var username = req.body.username.toString().trim(),
        password = req.body.password.toString().trim();
    var flag = true;
    var msg = "登录成功";
    User.findOne({ username: username }, function (err, user) {
        if (err) {
            console.log(err);
            return res.redirect('/login');
        }
        if (!user) {
            console.log(username+"用户名不存在");
            //var msg = "用户名不存在";
            //res.locals.message = '<p class="msg success">' + msg + '</p>';
            //res.send('<p class="msg success">' + msg + '</p>');
            msg='用户名或密码不正确';
            //res.send("false");
           return res.redirect('/login');
          //  res.contentType('json');//返回的数据类型
           // res.send({ status:false });//给客户端返回一个json格式的数据
         //   res.end();
            flag = false;
        }
        //对密码进行加密
        var md5 = crypto.createHash('md5'),
            md5password = md5.update(password).digest('hex');

        if(user.password !== md5password){
            console.log(user.password+ "," + md5password + "密码错误");
            //res.send("false");
           return res.redirect('/login');
           // res.contentType('json');//返回的数据类型
           // res.send({ status:false });//给客户端返回一个json格式的数据
          //  res.end();
            msg='用户名或密码不正确';
            flag = false;
        }
        console.log('登录成功');
        user.password = null;
        delete user.password;
        req.session.user = user;

      //  res.contentType('json');//返回的数据类型
       // res.send({ "status":flag,"msg":msg});//给客户端返回一个json格式的数据
       // res.end();
       // res.send("true");
            return res.redirect('/home');
        });
    })

app.get('/post', function (req, res) {
    console.log('发布');
    res.render('post', {
        user: req.session.user,
        title: '发布'
    });
});
app.post('/post', function (req,res) {
    var note = new Note({
        title:req.body.title,
        author:req.session.user.username,
        tag:req.body.tag,
        content:req.body.content
    });

    note.save(function(err,doc){
       if(err)
       {
           console.log(err);
           return res.redirect('/post');
       }
        console.log("文章发表成功");
        return res.redirect('/home');
    });
});



app.get('/quit', function (req, res) {
    req.session.user = null;
    console.log('退出！');
    return res.redirect('/');
  
});

app.get('/test', function (req, res) {
    console.log('ceshi！');
    res.render('test', {
        user:req.session.user,
        title: '测试'
    });

});

/**
 * 验证用户名是否存在
 */
app.get('/usernameValidate',function(req,res,next){
    var username = req.query.username.toString().trim();
    console.log(username+"用户名验证");
    var flag = true;
    var msg = "";
    User.findOne({username:username},function(err,user){
        if(err)
        {
            return res.redirect('/login');
        }
        if(!user)
        {
            console.log("用户不存在");
            flag = false;
            msg = "该用户不存在！";
        }
        res.send({ "status":flag,"msg":msg});//给客户端返回一个json格式的数据
    });

});

app.listen(3000, function (req, res) {
    console.log('App is running at port 3000');
});