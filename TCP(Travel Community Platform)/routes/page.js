/**
 * 고급웹프로그래밍, 과제#final, 서장호, 60192346
 */
const express = require('express');
const { isLoggedIn, isNotLoggedIn } = require('./middlewares'); // 로그인 여부를 확인하는 미들웨어
const { Post, User, Hashtag } = require('../models'); // 데이터베이스 모델
const { Op } = require("sequelize"); // Sequelize의 연산자

const router = express.Router();

// 로그인 사용자 정보와 팔로우/좋아요 정보를 로컬 변수로 설정
router.use((req, res, next) => {
  res.locals.user = req.user;
  res.locals.followerCount = req.user ? req.user.Followers.length : 0;
  res.locals.followingCount = req.user ? req.user.Followings.length : 0;
  res.locals.followerIdList = req.user ? req.user.Followings.map(f => f.id) : [];
  res.locals.likerIdList = req.user ? req.user.Liked.map(f => f.id) : [];
  next();
});

// 프로필 페이지 렌더링, 팔로잉 추천
router.get('/profile', isLoggedIn, async (req, res, next) => {
  try {
    const suggestions = await User.findAll();
    const like = await User.findOne({ where: { id: req.user.id } });
    console.log('~~like' + like.id);
    const likes = await like.getLiked();
    const posts = await Post.findAll({
      include: [{
        model: User,
        attributes: ['id', 'nick'],
      }],
      order: [['createdAt', 'DESC']],
    });
    const lists = await User.findAll({});
    res.render('profile', {
      title: 'TCP(Travel Community Platform)',
      likes: likes,
      twits: posts,
      lists: lists,
      suggestions: suggestions,
    });
  } catch (err) {
    console.log(err);
    next(err);
  }
});

// 회원가입 페이지 렌더링
router.get('/join', isNotLoggedIn, (req, res) => {
  res.render('join', { title: 'Join to - TCP(Travel Community Platform)' });
});

// 메인 페이지 렌더링
router.get('/', async (req, res, next) => {
  try {
    const suggestions = await User.findAll();
    const posts = await Post.findAll({
      include: [{
        model: User,
        attributes: ['id', 'nick'],
      }, {
        model: User,
        attributes: ['id'],
        as: 'Liker',
        through: 'PostLike'
      }],
      order: [['createdAt', 'DESC']],
    });
    res.render('main', {
      title: 'TCP(Travel Community Platform)',
      twits: posts,
      suggestions: suggestions,
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
});

// 해시태그 및 사용자 아이디 검색
router.get('/search', async (req, res, next) => {
  const suggestions = await User.findAll();
  let query = req.query.search;
 
  if (!query) {
    return res.redirect('/');
  }
  try {
    let hashtag;
    let user;

    if (query.match(/@/)) {
      query = query.replace("@", "");
      user = await User.findOne({ where: { nick: query } });
    } else {
      hashtag = await Hashtag.findOne({ where: { title: query } });
    }

    console.log(user, hashtag);
    let posts = [];

    if (hashtag) {
      posts = await hashtag.getPosts({ include: [{ model: User }] });
    } else if (user) {
      posts = await user.getPosts({ include: [{ model: User }] });
    }

    return res.render('main', {
      title: `${query} | TCP(Travel Community Platform)`,
      twits: posts,
      suggestions: suggestions,
    });
  } catch (error) {
    console.error(error);
    return next(error);
  }
});

module.exports = router;
