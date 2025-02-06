require("dotenv").config();
const cors = require("cors");
const express = require("express");
const morgan = require("morgan");

const app = express();
const router = require("./modules/index.controller");
const errorHandler = require("./middlewares/error.middlewear");

const swaggerUi = require("swagger-ui-express");
const swaggerFile = require("./swagger/swagger-output.json"); // 여기서 json 가져옴

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerFile)); //여기서 실행

app.use(cors());
app.use(morgan("combined"));
app.use(express.json());

app.use(router);
app.use(errorHandler);

app.listen(process.env.PORT || 3000, () => {
  console.log(`Server started`);
});
