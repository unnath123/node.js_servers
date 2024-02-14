const express = require("express");
const mongoose = require("mongoose")
const userModel = require("./userModel")
const session = require("express-session")
const mongoDbSession = require("connect-mongodb-session")(session);

const app = express();
const mongo_URL = "mongodb+srv://unnath:12345@cluster0.djsaywi.mongodb.net/My_first_DB"
const store = new mongoDbSession({
  uri: mongo_URL,
  collection: "sessions",
});

app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: "I will get a good job soon",
    resave: false,
    saveUninitialized: false,
    store: store,
})
)

mongoose.connect(mongo_URL)
.then(()=>console.log("DB connected"))
.catch((error)=>console.log(error))



app.post("/register-form", async (req,res)=>{
  const {name, email, password} = req.body;
  console.log(name, email, password);

  const obj = new userModel({
    name: name,
    email:email,
    password:password,
  })
  console.log(obj);

  try{
    const userDb = await obj.save();
    console.log("this is session >>> ",req.session)
    //return res.status(201).json("Register success"); to set particular status code on browser
    return res.send({
      status:200,
      message: "User created successfully",
      data: userDb,
    }) 
  }
  catch{
    return res.send("internal server error registration")
  }
  
})

app.get("/register-form", (req, res)=>{
  return res.send(`
  <form action="/register-form" method="POST">
    <div>
        Name: <input type="text" name="name">
    </div>
    <div>
      Email: <input type="text" name="email">
    </div>
    <div>
      Password: <input type="password" name="password">
    </div>
    <button type="submit">submit</button>
  </form>
`)
})

app.get("/login-form", (req, res)=>{
  return res.send(`
  <form action="/login-form" method="POST">
    <div>
      Email: <input type="text" name="email">
    </div>
    <div>
      Password: <input type="password" name="password">
    </div>
    <button type="submit">submit</button>
  </form>
`)
})

app.post("/login-form", async(req, res)=>{
  const {email, password}  = req.body;
  try{
    const userDB = await userModel.findOne({email:email})
    console.log("user",userDB)

    if (!userDB) {
      return res.status(400).json("User not found, Email incorrect");
    }

    if(userDB.password !== password){
      return res.send({
        status:400,
        message:"wrong password"
      })
    }
    req.session.isAuth = true
   return res.send("logged in")
  }
  catch(error){
   return res.send({
      status:500,
      error: "internal server error"
    })

  }
  
})

app.get("/dashboard", (req, res)=>{
  console.log(req.session)
  if(req.session.isAuth===true){
    return res.send("user already present and logged in")
  }
  else{
    return res.send("user not present please logiin")
  }
})


app.listen("8000",()=>{
  console.log("server is running on port 8000")
})