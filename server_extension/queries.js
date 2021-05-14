const Pool = require("pg").Pool;
const pool = new Pool({
    user: "postgres",
    host: "localhost",
    database: "sepm_rating",
    password: "RMit2461599",
    port: 5432,
});

const postBestAnswer = (request, response) => {
    const { article_header, article_url, question, best_answer } = request.body;

    pool.query(
        "INSERT INTO best_answer_collection (article_header, article_url, question, best_answer) VALUES ($1, $2, $3, $4)",
        [article_header, article_url, question, best_answer],
        (error, results) => {
            if (error) {
                throw error;
            }
            console.log(results);
            response.status(201).json({ msg: "Post data SUCCESS" });
        }
    );
};

module.exports = {
    postBestAnswer,
};
