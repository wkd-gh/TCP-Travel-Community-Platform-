/**
 * 고급웹프로그래밍, 과제#final, 서장호, 60192346
 */

const express = require('express');
const passport = require('passport');
const bcrypt = require('bcrypt');
const { isLoggedIn, isNotLoggedIn } = require('./middlewares'); // 로그인 여부를 확인하는 미들웨어
const User = require('../models/user'); // User 모델

const router = express.Router();

// 회원가입 라우터
router.post('/join', isNotLoggedIn, async (req, res, next) => {
  const { email, nick, password } = req.body;
  try {
    // 이미 존재하는 사용자 확인
    const exUser = await User.findOne({ where: { email } });
    if (exUser) {
      return res.redirect('/join?error=exist');
    }
    // 비밀번호 해시화
    const hash = await bcrypt.hash(password, 12);
    // 새로운 사용자 생성
    await User.create({
      email,
      nick,
      password: hash,
    });
    return res.redirect('/');
  } catch (error) {
    // 에러 발생 시 로그 출력 및 다음 미들웨어 호출
    console.error(error);
    return next(error);
  }
});

// 로그인 라우터
router.post('/login', isNotLoggedIn, (req, res, next) => {
  // 로컬 전략을 사용하여 인증
  passport.authenticate('local', (authError, user, info) => {
    if (authError) {
      console.error(authError);
      return next(authError);
    }
    if (!user) {
      return res.redirect(`/?loginError=${info.message}`);
    }
    // 로그인 처리
    return req.login(user, (loginError) => {
      if (loginError) {
        console.error(loginError);
        return next(loginError);
      }
      return res.redirect('/');
    });
  })(req, res, next); // 미들웨어 내의 미들웨어에는 (req, res, next)를 붙임
});

// 로그아웃 라우터
router.get('/logout', isLoggedIn, (req, res) => {
  req.logout(); // 로그아웃
  req.session.destroy(); // 세션 삭제
  res.redirect('/'); // 메인 페이지로 리디렉션
});

// 카카오 로그인 라우터
router.get('/kakao', passport.authenticate('kakao'));

// 카카오 로그인 콜백 라우터
router.get('/kakao/callback', passport.authenticate('kakao', {
  failureRedirect: '/', // 실패 시 메인 페이지로 리디렉션
}), (req, res) => {
  res.redirect('/'); // 성공 시 메인 페이지로 리디렉션
});

module.exports = router;
