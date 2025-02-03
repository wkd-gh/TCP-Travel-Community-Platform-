/**
 * 고급웹프로그래밍, 과제#final, 서장호, 60192346
 */
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy; // 로컬 로그인 전략
const bcrypt = require('bcrypt'); // 비밀번호 암호화 라이브러리

const User = require('../models/user'); // User 모델

module.exports = () => {
  // 로컬 로그인 전략 설정
  passport.use(new LocalStrategy({
    usernameField: 'email', // 로그인 시 사용할 사용자명 필드
    passwordField: 'password', // 로그인 시 사용할 비밀번호 필드
  }, async (email, password, done) => {
    try {
      // 이메일로 사용자 찾기
      const exUser = await User.findOne({ where: { email } });
      if (exUser) {
        // 비밀번호 비교
        const result = await bcrypt.compare(password, exUser.password);
        if (result) {
          // 비밀번호가 일치하면 사용자 정보로 로그인 처리
          done(null, exUser);
        } else {
          // 비밀번호가 일치하지 않으면 에러 메시지 전달
          done(null, false, { message: '잘못된 비밀번호입니다.' });
        }
      } else {
        // 사용자가 없으면 에러 메시지 전달
        done(null, false, { message: '가입 정보가 없습니다.' });
      }
    } catch (error) {
      // 에러 발생 시 로그 출력 및 done 호출
      console.error(error);
      done(error);
    }
  }));
};
