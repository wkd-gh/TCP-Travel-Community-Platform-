/**
 * 고급웹프로그래밍, 과제#final, 서장호, 60192346
 */

const passport = require('passport');
const KakaoStrategy = require('passport-kakao').Strategy;

const User = require('../models/user');

module.exports = () => {
  // 카카오 로그인 전략 설정
  passport.use(new KakaoStrategy({
    clientID: process.env.KAKAO_ID, // 카카오 앱의 클라이언트 ID
    callbackURL: '/auth/kakao/callback', // 카카오 로그인 후 리디렉션될 URL
  }, async (accessToken, refreshToken, profile, done) => {
    // 카카오 프로필 정보 로그 출력
    console.log('kakao profile', profile);
    try {
      // 기존에 카카오를 통해 가입한 사용자가 있는지 확인
      const exUser = await User.findOne({
        where: { snsId: profile.id, provider: 'kakao' },
      });
      if (exUser) {
        // 기존 사용자가 있으면 해당 사용자 정보로 로그인 처리
        done(null, exUser);
      } else {
        // 기존 사용자가 없으면 새로운 사용자 생성
        const newUser = await User.create({
          email: profile._json && profile._json.kakao_account_email, // 카카오 계정 이메일
          nick: profile.displayName, // 카카오 프로필 닉네임
          snsId: profile.id, // 카카오 프로필 ID
          provider: 'kakao', // 제공자: 카카오
        });
        // 새로운 사용자 정보로 로그인 처리
        done(null, newUser);
      }
    } catch (error) {
      // 에러 발생 시 로그 출력 및 done 호출
      console.error(error);
      done(error);
    }
  }));
};
