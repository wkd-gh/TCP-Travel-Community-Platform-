/**
 * 고급웹프로그래밍, 과제#final, 서장호, 60192346
 */

const Sequelize = require('sequelize');

module.exports = class Hashtag extends Sequelize.Model {
  // Hashtag 모델 초기화
  static init(sequelize) {
    return super.init({
      // 해시태그 제목
      title: {
        type: Sequelize.STRING(15),
        allowNull: false,
        unique: true, // 제목은 고유해야 함
      },
    }, {
      // 시퀄라이즈 인스턴스
      sequelize,
      // 생성 및 수정 시간 자동 기록
      timestamps: true,
      // 언더스코어 대신 카멜 케이스 사용
      underscored: false,
      // 모델 이름
      modelName: 'Hashtag',
      // 테이블 이름
      tableName: 'hashtags',
      // 삭제시 실제 데이터 삭제
      paranoid: false,
      // 문자 인코딩 설정
      charset: 'utf8mb4',
      collate: 'utf8mb4_general_ci',
    });
  }

  // 관계 설정
  static associate(db) {
    // 해시태그는 여러 게시물과 다대다 관계
    db.Hashtag.belongsToMany(db.Post, { through: 'PostHashtag' });
  }
};
