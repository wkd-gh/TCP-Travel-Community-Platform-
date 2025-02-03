/**
 * 고급웹프로그래밍, 과제#final, 서장호, 60192346
 */

const Sequelize = require('sequelize');

module.exports = class Post extends Sequelize.Model {
  // Post 모델 초기화
  static init(sequelize) {
    return super.init({
      // 게시물 내용
      content: {
        type: Sequelize.STRING(140),
        allowNull: false,
      },
      // 이미지 URL
      img: {
        type: Sequelize.STRING(200),
        allowNull: true,
      },
    }, {
      // 시퀄라이즈 인스턴스
      sequelize,
      // 생성 및 수정 시간 자동 기록
      timestamps: true,
      // 언더스코어 대신 카멜 케이스 사용
      underscored: false,
      // 모델 이름
      modelName: 'Post',
      // 테이블 이름
      tableName: 'posts',
      // 삭제시 실제 데이터를 삭제하지 않고 삭제된 것처럼 처리
      paranoid: true,
      // 문자 인코딩 설정
      charset: 'utf8mb4',
      collate: 'utf8mb4_general_ci',
    });
  }

  // 관계 설정
  static associate(db) {
    // 게시물은 하나의 사용자에 속함
    db.Post.belongsTo(db.User);
    // 게시물은 여러 개의 댓글을 가짐
    db.Post.hasMany(db.Comment);
    // 게시물은 여러 개의 해시태그와 다대다 관계
    db.Post.belongsToMany(db.Hashtag, { through: 'PostHashtag' });
    // 게시물은 여러 사용자가 좋아할 수 있음
    db.Post.belongsToMany(db.User, { through:'Like', as:'Liker' });
  }
};
