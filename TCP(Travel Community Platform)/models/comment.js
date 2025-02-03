/**
 * 고급웹프로그래밍, 과제#final, 서장호, 60192346
 */

const Sequelize = require('sequelize');

module.exports = class Comment extends Sequelize.Model {
    // Comment 모델 초기화
    static init(sequelize) {
        return super.init({
            // 댓글 내용
            content: {
                type: Sequelize.STRING(140),
                allowNull: false,
            }
        }, {
            // 시퀄라이즈 인스턴스
            sequelize,
            // 생성 및 수정 시간 자동 기록
            timestamps: true,
            // 언더스코어 대신 카멜 케이스 사용
            underscored: false,
            // 모델 이름
            modelName: 'Comment',
            // 테이블 이름
            tableName: 'comments',
            // 삭제시 실제 데이터 삭제
            paranoid: false,
            // 문자 인코딩 설정
            charset: 'utf8mb4',
            collate: 'utf8mb4_general_ci',
        });
    }

    // 관계 설정
    static associate(db) {
        // 댓글은 하나의 사용자에 속함
        db.Comment.belongsTo(db.User);
        // 댓글은 하나의 게시물에 속함
        db.Comment.belongsTo(db.Post);
    }
};
