/**
 * 고급웹프로그래밍, 과제#final, 서장호, 60192346
 */

const express = require('express');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const path = require('path');
const session = require('express-session');
const nunjucks = require('nunjucks');
const dotenv = require('dotenv');
const passport = require('passport');

dotenv.config(); // 환경 변수 설정
const pageRouter = require('./routes/page');
const authRouter = require('./routes/auth');
const postRouter = require('./routes/post');
const userRouter = require('./routes/user');
const { sequelize } = require('./models'); // 시퀄라이즈 설정
const passportConfig = require('./passport'); // 패스포트 설정

const app = express();
passportConfig(); // 패스포트 설정 호출
app.set('port', process.env.PORT || 8001); // 포트 설정
app.set('view engine', 'html');
nunjucks.configure('views', {
  express: app,
  watch: true,
});
sequelize.sync({ force: false }) // 데이터베이스 연결
  .then(() => {
    console.log('데이터베이스 연결 성공');
  })
  .catch((err) => {
    console.error(err);
  });

app.use(morgan('dev')); // HTTP 요청 로깅
app.use(express.static(path.join(__dirname, 'public'))); // 정적 파일 제공
app.use('/img', express.static(path.join(__dirname, 'uploads'))); // 이미지 파일 제공
app.use(express.json()); // JSON 요청 처리
app.use(express.urlencoded({ extended: false })); // URL-encoded 요청 처리
app.use(cookieParser(process.env.COOKIE_SECRET)); // 쿠키 파서 설정
app.use(session({
  resave: false,
  saveUninitialized: false,
  secret: process.env.COOKIE_SECRET,
  cookie: {
    httpOnly: true,
    secure: false,
    maxAge: 1000 * 60 * 30 // 30분 유지
  },
}));
app.use(passport.initialize()); // 패스포트 초기화
app.use(passport.session()); // 패스포트 세션 설정

// 라우터 설정
app.use('/', pageRouter);
app.use('/auth', authRouter);
app.use('/post', postRouter);
app.use('/user', userRouter);

// 없는 라우터 처리
app.use((req, res, next) => {
  const error =  new Error(`${req.method} ${req.url} 라우터가 없습니다.`);
  error.status = 404;
  next(error);
});

// 에러 처리 미들웨어
app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = process.env.NODE_ENV !== 'production' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});

// 서버 시작
app.listen(app.get('port'), () => {
  console.log(app.get('port'), '번 포트에서 대기중');
});
