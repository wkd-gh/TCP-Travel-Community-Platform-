/**
 * 고급웹프로그래밍, 과제#final, 서장호, 60192346
 */

// 로그인 여부를 확인하는 미들웨어
exports.isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    next(); // 사용자가 로그인되어 있으면 다음 미들웨어로 넘어감
  } else {
    res.status(403).send('로그인 필요'); // 사용자가 로그인되어 있지 않으면 403 상태 코드와 함께 응답
  }
};

// 로그인하지 않은 상태를 확인하는 미들웨어
exports.isNotLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    next(); // 사용자가 로그인되어 있지 않으면 다음 미들웨어로 넘어감
  } else {
    const message = encodeURIComponent('로그인한 상태입니다.'); // 이미 로그인된 상태면 메시지 인코딩
    res.redirect(`/?error=${message}`); // 메인 페이지로 리디렉션하면서 에러 메시지 전달
  }
};
