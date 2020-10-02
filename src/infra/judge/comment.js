const DriveJudge = require('./driveJudge');

class Comment extends DriveJudge{
    deliberate(){
        this.assert(true,"",50);
        this.get_comments()
            .then(comments=>this.assert(comments.lenght>0,"não existe comentários no arquivo anexado",50))
            .finally(()=>this.outcome().publish());
    }    
}

module.exports = Comment;
