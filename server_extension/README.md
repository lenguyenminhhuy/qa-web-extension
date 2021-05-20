# Database for rating feature of HHM’S QUESTION ANSWERING WEB EXTENSION
### Best answer collection database made in Postgresql

## Tools:
- pgAdmin 4

## Installation and Create database in local:
1. Install Postgresql (refer: https://www.postgresqltutorial.com/install-postgresql/), remember to include pgAdmin in installing process.
2. Turn on pgAdmin.
3. Choose the server you want to create the database.
4. Right-click to the 'Databases' on the list down and choose 'Create' -> 'Database' to create the new database to use.
5. Create the data with name 'best_answer_collection'.
6. Right-click to 'best_answer_collection' database you just made and choose 'Query Tool'.
7. Go to path /server_extension/database.txt and copy all 'queries to create tables', then paste to Query Editor which you just open in pgAdmin and run.
8. The database for rating is created successfully now.

## Config:
Make sure that your device already has these dependencies: express, body-parser, cors, pg
1. Open Terminal.
2. Go to the directory of server_extension.
3. Type nodemon to run the server.
4. Success.

