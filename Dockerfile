# 1. Node.js 베이스 이미지 선택
FROM node:18

# 2. 작업 디렉토리 생성
WORKDIR /app

# 3. 필요한 파일 복사
COPY package*.json ./

# 4. 종속성 설치
RUN npm install

# 5. 애플리케이션 코드 복사
COPY . .

# 6. 환경 변수 파일 복사
# 로컬에 있는 .env 파일을 컨테이너 내부로 복사
COPY .env .env

# 7. 컨테이너의 포트 열기
EXPOSE 3000

# 8. 애플리케이션 실행 명령
CMD ["npm", "start"]
