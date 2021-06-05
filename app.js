const express = require("express");
bodyParser = require("body-parser");
const app = express();
const OpenTok = require("opentok");
const mongoose = require("mongoose");

require("dotenv").config();

const User = require("./models/user");
var cors = require("cors");
const port = process.env.PORT || 3000;

const API_KEY = process.env.API_KEY;
const PROJECT_SECRET = process.env.PROJECT_SECRET;

app.use(cors());
app.use(bodyParser.json());

opentok = new OpenTok(API_KEY, PROJECT_SECRET);

mongoose
  .connect(
    `mongodb+srv://${process.env.MONGODB_USER_NAME}:${process.env.MONGODB_USER_PASSWORD}@cluster0.kxplt.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`,
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(() => {
    app.listen(port, () => {
      console.log("server is running on port" + port);
    });
  });

app.get("/", (req, res) => {
  res.send("hello world");
});

app.post("/api/user", async (req, res) => {
  const adminPassword = process.env.ADMIN_PASSWORD;
  const userPassword = process.env.USER_PASSWORD;

  console.log(req.body);
  console.log("/api/user>>>>>>>>>>");

  if (typeof req.body.name == "undefined") {
    return res.status(400).json({
      success: false,
      message: "band request ",
    });
  }

  try {
    console.log(">>>>>>>>");

    const generateCredential = async () => {
      const deleteRoom = await User.deleteMany({ name: req.body.name });

      opentok.createSession(async (err, session) => {
        if (err) return console.log(err);
        const sessionId = session.sessionId;

        tokenAdmin = session.generateToken({
          role: "moderator",
          expireTime: new Date().getTime() / 1000 + 7 * 24 * 60 * 60, // in one week
          data: "name=lipu",
          initialLayoutClassList: ["lipu"],
        });

        const user = new User({
          session: sessionId,
          apiKey: session.ot.apiKey,
          name: req.body.name,
          tokenAdmin: tokenAdmin,
        });

        await user.save();

        return res.status(200).json({
          session: session,
          tokenAdmin: tokenAdmin,
        });
      });
    };

    const addUserToTheRoom = async () => {
      const room = await User.find({ name: adminPassword });

      token = opentok.generateToken(room[0].session);
      console.log();
      return res.status(200).json({
        success: true,
        message: "data coming",
        data: room,
        session: {
          ot: {
            apiKey: room[0].apiKey,
          },
          sessionId: room[0].session,
        },
        tokenAdmin: token,
      });
    };

    if (req.body.name == adminPassword) {
      generateCredential();
    } else if (req.body.name == userPassword) {
      addUserToTheRoom();
    } else {
      return res.status(400).json({
        success: false,
        message: "band request ",
      });
    }
  } catch (error) {
    console.log(error.message);
  }
});
