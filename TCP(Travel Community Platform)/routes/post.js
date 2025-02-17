/**
 * 고급웹프로그래밍, 과제#final, 서장호, 60192346
 */

const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const { Post, User, Hashtag, Comment } = require('../models');
const { isLoggedIn } = require('./middlewares');

const router = express.Router();

// 모든 요청에 대해 CORS 설정
router.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  next();
});

// uploads 폴더 생성
try {
  fs.readdirSync('uploads');
} catch (error) {
  console.error('uploads 폴더가 없어 uploads 폴더를 생성');
  fs.mkdirSync('uploads');
}

// 이미지 업로드를 위한 multer 설정
const upload = multer({
  storage: multer.diskStorage({
    destination(req, file, cb) {
      cb(null, 'uploads/');
    },
    filename(req, file, cb) {
      const ext = path.extname(file.originalname);
      cb(null, path.basename(file.originalname, ext) + Date.now() + ext);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
});

// 이미지 업로드 라우터
router.post('/img', isLoggedIn, upload.single('img'), (req, res) => {
  console.log(req.file);
  res.json({ url: `/img/${req.file.filename}` });
});

// 게시물 업로드를 위한 multer 설정
const upload2 = multer();
router.post('/', isLoggedIn, upload2.none(), async (req, res, next) => {
  try {
    console.log(req.user);
    const post = await Post.create({
      content: req.body.content,
      img: req.body.url,
      UserId: req.user.id,
    });
    const hashtags = req.body.content.match(/#[^\s#]*/g);
    if (hashtags) {
      const result = await Promise.all(
        hashtags.map(tag => {
          return Hashtag.findOrCreate({
            where: { title: tag.slice(1).toLowerCase() },
          });
        }),
      );
      await post.addHashtags(result.map(r => r[0]));
    }
    res.redirect('/');
  } catch (error) {
    console.error(error);
    next(error);
  }
});

// 게시글 수정
router.post('/:id', isLoggedIn, upload2.none(), async (req, res, next) => {
  try {
    let post = await Post.findOne({ where: { id: req.params.id } });
    let hashtags = post.content.match(/#[^\s#]*/g);
    if (hashtags) {
      const result = await Promise.all(
        hashtags.map(tag => {
          return Hashtag.findOrCreate({
            where: { title: tag.slice(1).toLowerCase() },
          });
        }),
      );
      await post.removeHashtags(result.map(r => r[0]));
    }
    await Post.update({
      content: req.body.content,
      img: req.body.url,
      updatedAt: new Date(),
    }, {
      where: { id: req.params.id },
    });
    post = await Post.findOne({ where: { id: req.params.id } });
    hashtags = req.body.content.match(/#[^\s#]*/g);
    if (hashtags) {
      const result = await Promise.all(
        hashtags.map(tag => {
          return Hashtag.findOrCreate({
            where: { title: tag.slice(1).toLowerCase() },
          });
        }),
      );
      await post.addHashtags(result.map(r => r[0]));
    }
    res.redirect(`/post/${req.params.id}`);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

// 게시글 삭제
router.delete('/:id', isLoggedIn, async (req, res, next) => {
  try {
    let post = await Post.findOne({ where: { id: req.params.id } });
    let hashtags = post.content.match(/#[^\s#]*/g);
    if (hashtags) {
      const result = await Promise.all(
        hashtags.map(tag => {
          return Hashtag.findOrCreate({
            where: { title: tag.slice(1).toLowerCase() },
          });
        }),
      );
      await post.removeHashtags(result.map(r => r[0]));
    }
    await Post.destroy({
      where: { id: req.params.id },
    });
    res.send('success');
  } catch (error) {
    console.error(error);
    next(error);
  }
});

// 게시글 수정 페이지
router.get('/:id/edit', isLoggedIn, async (req, res, next) => {
  try {
    const post = await Post.findOne({
      where: { id: req.params.id },
      include: [{
        model: User,
        attributes: ['id', 'nick'],
      }],
    });
    res.render('edit', {
      title: 'TCP(Travel Community Platform)',
      twit: post,
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
});

// 게시글 상세 페이지
router.get('/:id', async (req, res, next) => {
  try {
    const post = await Post.findOne({
      where: { id: req.params.id },
      include: {
        model: User,
        attributes: ['id', 'nick'],
      },
    });
    const comments = await Comment.findAll({
      where: {
        PostId: req.params.id,
      },
      include: {
        model: User,
        attributes: ['id', 'nick'],
      },
      order: [['createdAt', 'DESC']],
    });
    res.render('detail', {
      title: 'TCP(Travel Community Platform)',
      twit: post,
      comments: comments,
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
});

// 댓글 작성
const upload3 = multer();
router.post('/:id/comment', isLoggedIn, upload3.none(), async (req, res, next) => {
  try {
    const post = await Post.findOne({
      where: { id: req.params.id },
      include: {
        model: User,
        attributes: ['id', 'nick'],
      },
    });
    if (!post) return res.status(404).send('포스트가 존재하지 않습니다.');
    await Comment.create({
      PostId: req.params.id,
      UserId: req.user.id,
      content: req.body.content,
    });
    const comments = await Comment.findAll({
      where: {
        PostId: req.params.id,
      },
      include: {
        model: User,
        attributes: ['id', 'nick'],
      },
      order: [['createdAt', 'DESC']],
    });
    res.render('detail', {
      title: 'TCP(Travel Community Platform)',
      twit: post,
      comments: comments,
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
});

// 좋아요
router.post('/:id/like', async (req, res, next) => {
  try {
    const post = await Post.findOne({ where: { id: req.params.id } });
    await post.addLiker(req.user.id);
    res.send('success');
  } catch (error) {
    console.error(error);
    next(error);
  }
});

// 좋아요 취소
router.delete('/:id/like', async (req, res, next) => {
  try {
    const post = await Post.findOne({ where: { id: req.params.id } });
    await post.removeLiker(req.user.id);
    res.send('success');
  } catch (error) {
    console.error(error);
    next(error);
  }
});

module.exports = router;
