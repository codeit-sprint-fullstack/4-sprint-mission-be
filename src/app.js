require("dotenv").config();
const cors = require("cors");

const express = require("express");

const morgan = require("morgan");
const router = require("./modules/index.controller");
const errorHandler = require("./middlewares/error.middlewear");

const app = express();

app.use(
  cors()
  //   {
  //   origin: [
  //     "https://4-sprint-mission-fe-c56s.vercel.app",
  //     "http://localhost:3000",
  //     "https://4-sprint-mission-fe-8ens-l8drmvvos-sungmins-projects-b79f4630.vercel.app",
  //   ],
  // }
);

app.use(morgan("combined"));
app.use(express.json());

app.use(router);
app.use(errorHandler);

app.listen(process.env.PORT || 3000, () => {
  console.log(`Server started`);
});
