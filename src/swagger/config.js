const swaggerAutogen = require("swagger-autogen")();

const doc = {
  info: {
    title: "Panda-Market-Api",
    description: "Panda Market Project API",
  },
  host: "localhost:3100", //임시
  schemes: ["http"],
  //태그 설정 가능 , endpointsfiles과 배열을 맞추면 되는거 같음음
};

const outputFile = "./src/swagger/swagger-output1.json"; // 생성될 파일위치
const endpointsFiles = ["./src/modules/index.controller.js"]; // 모든 라우터가 있는곳

swaggerAutogen(outputFile, endpointsFiles, doc);
