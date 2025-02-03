/**
 * 고급웹프로그래밍, 과제#final, 서장호, 60192346
 */

const passport = require('passport');
const local = require('./localStrategy'); // 로컬 로그인 전략
const kakao = require('./kakaoStrategy'); // 카카오 로그인 전략
const User = require('../models/user'); // User 모델
const Post = require('../models/post'); // Post 모델

module.exports = () => {
  // 사용자 정보를 세션에 저장
  passport.serializeUser((user, done) => {
    done(null, user.id); // 사용자 id만 세션에 저장
  });

  // 세션에 저장된 사용자 정보를 이용해 사용자 정보 복구
  passport.deserializeUser((id, done) => {
    User.findOne({
      where: { id }, // 저장된 id를 이용해 사용자 정보 검색
      include: [{
        model: User,
        attributes: ['id', 'nick'],
        as: 'Followers', // 팔로워 정보 포함
      }, {
        model: User,
        attributes: ['id', 'nick'],
        as: 'Followings', // 팔로잉 정보 포함
      }, {
        model: Post,
        attributes: ['id'],
        as: 'Liked', // 좋아요 누른 게시물 정보 포함
        through: 'PostLike' // 중간 테이블
      }]
    })
      .then(user => done(null, user)) // 사용자 정보를 복구하여 done 호출
      .catch(err => done(err)); // 에러 발생 시 done 호출
  });

  local(); // 로컬 로그인 전략 등록
  kakao(); // 카카오 로그인 전략 등록
};
