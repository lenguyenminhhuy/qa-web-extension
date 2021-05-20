const Pool = require("pg").Pool;
const pool = new Pool({
    user: "postgres",
    host: "localhost",
    database: "best_answer_collection",
    password: "124569",
    port: 5432,
});

const postBestAnswer = async (request, response) => {
    const { article_url, question, best_answer } = request.body;

    var queryURL = "INSERT INTO context_urls (url) VALUES ($1) RETURNING id";
    var queryAnswer =
        "INSERT INTO rated_answers (answer) VALUES ($1) RETURNING id";
    var queryQuestion =
        'INSERT INTO questions (question, rated_answer_id) VALUES ($1, $2) RETURNING id';
    var queryQuestionContext =
        "INSERT INTO question_context_url (question_id, context_url_id) VALUES ($1, $2) RETURNING id";

    var context_urls = await pool.query(queryURL, [article_url]);

    var rated_answers = await pool.query(queryAnswer, [best_answer]);

    var questions = await pool.query(queryQuestion, [
        question,
        rated_answers.rows[0].id,
    ]);

    var question_context_url = await pool.query(queryQuestionContext, [
        questions.rows[0].id,
        context_urls.rows[0].id,
    ]);

    response.json({ msg: "Add rated answer successfully" });
};

module.exports = {
    postBestAnswer,
};
