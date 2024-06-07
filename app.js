const express = require("express");
const app = express();

const path = require("path");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");

const bcrypt = require("bcrypt");
const userModel = require("./model/user");
const postModel = require("./model/post");

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(cookieParser());

app.get("/", (req, res) => {
  res.render("user/index");
});

app.post("/register", async (req, res) => {
  let { username, email, password } = req.body;

  try {
    let presentUser = await userModel.findOne({ email: email });
    if (presentUser) {
      return res.status(500).send("User already exists");
    }

    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(password, salt, async (err, hash) => {
        let userCreated = await userModel.create({
          username,
          email,
          password: hash,
        });
        let token = jwt.sign({ email, userId: userCreated._id }, "shhhhh");
        res.cookie("token", token);
        res.redirect("/login");
      });
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/login", (req, res) => {
  res.render("user/login");
});

app.post("/login", async (req, res) => {
  let { email, password } = req.body;
  let user = await userModel.findOne({ email: email });
  if (!user) {
    res.status(500).send("something went wrong");
  }

  bcrypt.compare(password, user.password, function (err, result) {
    if (result) {
      let token = jwt.sign({ email, userId: user._id }, "shhhhh");
      res.cookie("token", token);
      res.redirect("/profile");
    } else {
      res.redirect("/login");
    }
  });
});

app.get("/logout", (req, res) => {
  res.cookie("token", "");
  res.redirect("/login");
});

app.get("/profile", HasToken, async (req, res) => { 
     
    let user = await userModel.findOne({ email: req.user.email }).populate("post"); 
    res.render("user/profile", { user });
});

app.get("/like/:id", HasToken, async (req, res) => { 
  try {
      let post = await postModel.findOne({ _id: req.params.id }).populate("user");
      
      if (post.likes.indexOf(req.user.userId) === -1) {
          post.likes.push(req.user.userId);
      } else {
          post.likes.splice(post.likes.indexOf(req.user.userId), 1);
      } 
      await post.save();
      res.redirect('/profile');
  } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
  }
});

app.get("/post/edit/:id", HasToken, async (req, res) => { 
  try {
      let post = await postModel.findOne({ _id: req.params.id }).populate("user"); 
      res.render('post/edit',{post});
  } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
  }
});

app.post("/post/update/:id", HasToken, async (req, res) => { 
  try {
      let post = await postModel.findOneAndUpdate({ _id: req.params.id },{content : req.body.content}); 
       res.redirect('/profile');
  } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
  }
});

function HasToken(req, res, next) {
    var token = req.cookies.token;
    if (!token) {
        return res.redirect('/login');
    }
    
    try {
        let data = jwt.verify(token, "shhhhh");
        req.user = data;
        next();
    } catch (error) {
        console.error(error);
        return res.status(401).send('Invalid token');
    }
}

app.post('/post',HasToken, async (req,res) => {
    let  content = req.body.content;
    let user = await userModel.findOne({ email: req.user.email }); 
    let postCreate = await postModel.create( { user : user._id, content }  )  

    user.post.push(postCreate._id);
    await user.save();
    res.redirect('/profile');

})
app.listen(3000);
