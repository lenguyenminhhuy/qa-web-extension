const Pool = require("pg").Pool;
const pool = new Pool({
    user: "postgres",
    host: "localhost",
    database: "sepm_rating",
    password: "RMit2461599",
    port: 5432,
});

const addBestAnswer = (request, response) => {
    const { article_header, question, best_answer } = request.body;

    pool.query(
        "INSERT INTO rating_answer (article_header, question, best_answer) VALUES ($1, $2, $3)",
        [article_header, question, best_answer],
        (error, results) => {
            if (error) {
                throw error;
            }
            console.log(results);
            response.status(201).json({ msg: "success" });
        }
    );
};

module.exports = {
    addBestAnswer,
};
