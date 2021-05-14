const express = require("express");
const bodyParser = require("body-parser");
var cors = require("cors");
const app = express();
const db = require("./queries");
const port = 3000;

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(require("body-parser").json());
app.use(require("body-parser").urlencoded({ extended: true }));

app.get("/best_answer_collection", (request, response) => {
    response.json({ info: "extension" });
});

app.post("/best_answer_collection", db.postBestAnswer);

app.listen(port, () => {
    console.log(`App running on port ${port}.`);
});
