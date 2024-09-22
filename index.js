import express from "express";
import bodyParser from "body-parser";
import axios from "axios";
import pg from "pg";

const app = express();
const port = 3000;

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/book/:id", express.static("public")); //To create a virtual path prefix (where the path does not actually exist in the file system) for files that are served by the function, specify a mount path for the static directory, as shown below:express.static
app.use("/book/:id/edit", express.static("public"));

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "book",
  password: "2001",
  port: 5432,
});
db.connect();

//get review book items order by sort type
async function getReviews() {
  let sortQuery = "title ASC";
  if (sort === "rating") {
    sortQuery = "rating DESC";
  } else if (sort === "recency") {
    sortQuery = "review_date DESC";
  }

  try {
    const response = await db.query(
      `SELECT * FROM books
            JOIN book_reviews
            ON id = book_reviews.book_id
            ORDER BY ${sortQuery};`
    );

    if (response.rows.length) {
      return response.rows;
    }
    return []; //if have no data
  } catch (error) {
    console.log("Error fetching items data from databases.", error);
    return [];
  }
}

//Get book and review by id
async function getBookById(id) {
  try {
    const response = await db.query(
      "SELECT * FROM books JOIN book_reviews JOIN id = book_reviews.book_id WHERE id = $1",
      [id]
    );
    return response.rows[0];
  } catch (error) {
    console.log("Error fetching items data from databases.", error);
  }
}

//SORT REVIEW FOLLOW: rating || title || recency
let sort = "title";
app.post("/sort", async (req, res) => {
  sort = req.body.sort;
  res.redirect("/");
});

//SEARCH Item
app.post("/search", async (req, res) => {
  try {
    const searchReq = req.body.search;

    const result = await db.query(
      `SELECT * FROM books 
      JOIN book_reviews 
      ON id = book_reviews.book_id
      WHERE books.title ILIKE $1 OR books.author ILIKE $1
      LIMIT 5`,
      [`%${searchReq}%`]
    );

    res.render("index.ejs", {bookSearch : res.rows});
  } catch (error) {
    console.log("Error fetching items data from databases.", error);
  }
});

//HOME-PAGE
app.get("/", async (req, res) => {
  try {
    const items = await getReviews();
    res.render("index.ejs", {
      books: items,
      sortSelected: sort,
    });
  } catch (error) {
    console.log("Error fetching items data from databases.", error);
  }
});

//DETAIL-REVIEW
app.get("/book/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const result = await getBookById(id);

    res.render("detail.ejs", { book: result });
  } catch (error) {
    console.log("Error fetching items data from databases.", error);
  }
});

//GET EDIT-PAGE
app.get("/book/:id/edit", async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    const result = await getBookById(id);

    res.render("edit.ejs", { book: result });
  } catch (error) {
    console.log("Error fetching items data from databases.", error);
  }
});

//EXECUTE EDIT
app.post("/book/:id/edit", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const newRating = req.body.rating;
    const newReviewText = req.body.review;
    await db.query(
      `UPDATE book_reviews
                SET rating = $1, review_text = $2, review_date = CURRENT_TIMESTAMP
                WHERE book_id = $3
                `,
      [newRating, newReviewText, id]
    );
    const result = await getBookById(id);

    res.render("detail.ejs", { book: result });
  } catch (error) {
    console.log("Error fetching items data from databases.", error);
  }
});

app.get("/add", (req, res) => {
  res.render("add.ejs");
});

app.post("/add", async (req, res) => {
  try {
    const newTitle = req.body.title;
    const newAuthor = req.body.author;
    const newIsbn = req.body.isbn;
    const newRating = req.body.rating;
    const newReview = req.body.review;

    // Ensure rating is a valid integer and set to default if not
    const ratingValue = parseInt(newRating, 10);
    if (isNaN(ratingValue) || ratingValue < 1 || ratingValue > 10) {
      return res.status(400).send("Invalid rating value");
    }

    const response = await db.query(
      `INSERT INTO books (title, author, isbn)
        VALUES ($1, $2, $3)
        RETURNING id`,
      [newTitle, newAuthor, newIsbn]
    );
    const book_id = response.rows[0].id; //get id of book to insert review

    await db.query(
      `INSERT INTO book_reviews (rating, review_text, book_id)
        VALUES ($1, $2, $3)`,
      [ratingValue, newReview, book_id]
    );

    res.redirect("/");
  } catch (error) {
    await db.query("ROLLBACK"); // Rollback transaction on error
    console.error(error);
    res.status(500).send("Server error");
  }
});

app.post("/delete/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    await db.query(`DELETE FROM book_reviews WHERE book_id = ${id}`);
    await db.query(`DELETE FROM books WHERE id = ${id}`);
    res.redirect("/");
  } catch (error) {
    await db.query("ROLLBACK");
    console.log("An error occured: ", error);
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
