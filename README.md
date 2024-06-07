# nodejsBasic

for hashing password npm i bcrypt
for createing a cookie token we use npm i jsonwebtoken
for storeing cookies npm i cookie-parser

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

mongo db connection 

const mongoose = require('mongoose'); // get 
mongoose.connect('mongodb://127.0.0.1:27017/minproject'); /// creating db { db name : minproject , mdb port :mongodb://127.0.0.1:27017}

const userSchema = mongoose.Schema({   // creating schema for collections (table)
    username : String,
    email : String,
    password : String,  
    post : [
        {type : mongoose.Schema.Types.ObjectId , ref : "post"} // refrencing id
    ]
})

module.exports = mongoose.model("user",userSchema); // mongoose.model == creating collection || ("user(collection name)",userSchema)

// then export it module.exports


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

///// express ////////

const express = require("express");
const app = express();

app.get("/", (req, res) => {
  res.render("user/index");
});

//// simple route

app.listen(3000); //calling port wor work


const path = require("path");
app.use(express.static(path.join(__dirname, "public"))); // use to indicate static path for public folder for images css js etc

app.use(express.json());
app.use(express.urlencoded({ extended: true }));  // use for form submission 


app.set("view engine", "ejs"); //for creating ejs templets 

const cookieParser = require("cookie-parser");
app.use(cookieParser()); //for storing cookie

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

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

// bcrypt uses to create hash of password 
// jwt uses to token for cookies by which it will be easy to verify user

app.post("/login", async (req, res) => { // exprees says it a async funtion
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

//// middleware 

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


/////////methods for crud 

findOne /// for finding single 
find // for finding all
create // for creating data
findAndUpdate // for updating perticuler data 
findAndDelete // for deleting perticuler data