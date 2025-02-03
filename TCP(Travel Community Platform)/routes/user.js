/**
 * 고급웹프로그래밍, 과제#final, 서장호, 60192346
 */

const express = require('express');

const { isLoggedIn } = require('./middlewares'); // 로그인 여부를 확인하는 미들웨어
const User = require('../models/user'); // User 모델

const router = express.Router();

// 팔로우
router.post('/:id/follow', isLoggedIn, async (req, res, next) => {
  try {
    const user = await User.findOne({ where: { id: req.user.id } });
    if (user) {
      await user.addFollowing(parseInt(req.params.id, 10)); // 팔로우 추가
      res.send('success');
    } else {
      res.status(404).send('no user'); // 사용자를 찾을 수 없는 경우
    }
  } catch (error) {
    console.error(error);
    next(error);
  }
});

// 언팔로우
router.delete('/:id/follow', isLoggedIn, async (req, res, next) => {
  try {
    const user = await User.findOne({ where: { id: req.user.id } });
    if (user) {
      await user.removeFollowing(parseInt(req.params.id, 10)); // 팔로우 제거
      res.send('success');
    } else {
      res.status(404).send('no user'); // 사용자를 찾을 수 없는 경우
    }
  } catch (error) {
    console.error(error);
    next(error);
  }
});

module.exports = router;
