/**
 * 고급웹프로그래밍, 과제#final, 서장호, 60192346
 */

const Sequelize = require('sequelize');
const env = process.env.NODE_ENV || 'development'; // 현재 환경 설정 (개발 또는 프로덕션)
const config = require('../config/config')[env]; // 환경에 맞는 데이터베이스 설정 불러오기
const User = require('./user'); // User 모델 불러오기
const Post = require('./post'); // Post 모델 불러오기
const Hashtag = require('./hashtag'); // Hashtag 모델 불러오기
const Comment = require('./comment'); // Comment 모델 불러오기

const db = {}; // db 객체 생성
const sequelize = new Sequelize(config.database, config.username, config.password, config); // 시퀄라이즈 인스턴스 생성

db.sequelize = sequelize; // 시퀄라이즈 인스턴스를 db 객체에 할당

db.User = User; // User 모델을 db 객체에 할당
db.Post = Post; // Post 모델을 db 객체에 할당
db.Hashtag = Hashtag; // Hashtag 모델을 db 객체에 할당
db.Comment = Comment; // Comment 모델을 db 객체에 할당

User.init(sequelize); // User 모델 초기화
Post.init(sequelize); // Post 모델 초기화
Hashtag.init(sequelize); // Hashtag 모델 초기화
Comment.init(sequelize); // Comment 모델 초기화

User.associate(db); // User 모델 관계 설정
Post.associate(db); // Post 모델 관계 설정
Hashtag.associate(db); // Hashtag 모델 관계 설정
Comment.associate(db); // Comment 모델 관계 설정

module.exports = db; // db 객체를 모듈로 내보내기
