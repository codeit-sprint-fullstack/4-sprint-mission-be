import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const swaggerAutogen = require('swagger-autogen')({ openapi: '3.0.3' });
// 버전 지정을 하려면 require를 사용해야하므로 위의 3줄과 같이 변형

const options = {
  info: {
    title: '판다마켓 API 문서(by 조형민)',
    description:
      '코드잇 스프린트 FS4 스프린트 미션 10에서 진행한 swagger 문서입니다.',
  },
  servers: [
    {
      url: 'http://localhost:5500',
    },
  ],
  schemes: ['http'],
  securityDefinitions: {
    bearerAuth: {
      type: 'http',
      scheme: 'bearer',
      in: 'header',
      bearerFormat: 'JWT',
    },
  },
};

const outputFile = './swagger-output.json';
const endpointsFiles = ['../server.js'];

swaggerAutogen(outputFile, endpointsFiles, options);
