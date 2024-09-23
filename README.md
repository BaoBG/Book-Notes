# Book reviews (book-reviews)
***
The **book-reviews** website is designed to display a list of books reviews and of course add new reviews, edit them or delete them.

## Technologies used
Built with Node.js, Express.js, EJS and with the help of some Javascript, it uses the [openlibrary.org ISBN API ](https://openlibrary.org/dev/docs/api/books) to get the book covers. The openlibrary.org has several book's search APIs and all of them are public and can be accessed without authentication.  

## How to clone and build it
To get the site up and running on your local machine, follow these steps: 
1. Clone the repository:  
    `git clone https://github.com/BaoBG/Book-Notes.git`

2. Install Dependencies (after you're sure that you have Node.js installed):  
	`npm install`

3. Download and install PostgreSQL on your developemnt machine from:  
	`https://www.enterprisedb.com/downloads/postgres-postgresql-downloads`

4. Create a database and name it whatever you like. For example:  
	`book`  

5. Create 2 tables on the database you created on step 4 and name them:  
	`books`  
	and  
	`book_reviews`  
	To help you, I've added a file in the root of this repository called queries.sql, with the 2 queries to create this tables. Just copy them and paste them in a pgAdmin Query editor window and execute them.  

6. Add all the express modules required (they are listed in the package.json file) by building the project with:  
	`npm i`  

7. Start the server (you can use node or nodemon):  
	`node index.js`  
	or  
	`nodemon index.js`
8. Open your browser:  
	`Navigate to 'http://localhost:3000' to view the app.`

## Motivation for this project
The reason for developing this project is to complete the capstone project of the section on learning how to use postgreSQL as a repository that is part of the course "The Complete 2024 Web Development Bootcamp" available on Udemy.
