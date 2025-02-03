/**
 * 고급웹프로그래밍, 과제#final, 서장호, 60192346
 */

const Sequelize = require('sequelize');

module.exports = class User extends Sequelize.Model {
  // User 모델 초기화
  static init(sequelize) {
    return super.init({
      // 이메일 필드
      email: {
        type: Sequelize.STRING(40),
        allowNull: true,
        unique: true, // 고유한 값이어야 함
      },
      // 닉네임 필드
      nick: {
        type: Sequelize.STRING(15),
        allowNull: false,
      },
      // 비밀번호 필드
      password: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      // 제공자 필드 (local, google 등)
      provider: {
        type: Sequelize.STRING(10),
        allowNull: false,
        defaultValue: 'local', // 기본값은 'local'
      },
      // SNS ID 필드
      snsId: {
        type: Sequelize.STRING(30),
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
      modelName: 'User',
      // 테이블 이름
      tableName: 'users',
      // 삭제시 실제 데이터를 삭제하지 않고 삭제된 것처럼 처리
      paranoid: true,
      // 문자 인코딩 설정
      charset: 'utf8',
      collate: 'utf8_general_ci',
    });
  }

  // 관계 설정
  static associate(db) {
    // 사용자는 여러 개의 게시물을 가짐
    db.User.hasMany(db.Post);
    // 사용자는 여러 개의 댓글을 가짐
    db.User.hasMany(db.Comment);
    // 사용자는 여러 팔로워를 가질 수 있음
    db.User.belongsToMany(db.User, {
      foreignKey: 'followingId',
      as: 'Followers',
      through: 'Follow',
    });
    // 사용자는 여러 팔로잉을 할 수 있음
    db.User.belongsToMany(db.User, {
      foreignKey: 'followerId',
      as: 'Followings',
      through: 'Follow',
    });
    // 사용자는 여러 게시물을 좋아할 수 있음
    db.User.belongsToMany(db.Post, { foreignKey: 'UserId', through: 'Like', as: 'Liked' });
  }
};
