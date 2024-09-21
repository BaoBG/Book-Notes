import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/review", express.static("public")); //To create a virtual path prefix (where the path does not actually exist in the file system) for files that are served by the function, specify a mount path for the static directory, as shown below:express.static
app.use("/review/:id/edit", express.static("public"));

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "book",
  password: "2001",
  port: 5432,
});
db.connect();

//get review book items order by sort type
async function getAllBookReview() {
  let sortQuery = 'id ASC';
  if (sort === 'title') {
    sortQuery = 'title ASC';
  } else if (sort === 'rating') {
    sortQuery = 'rating DESC';
  } else if (sort === 'recency') {
    sortQuery = 'review_date DESC';
  }

  try {
    const response = await db.query(
      `SELECT * FROM books
            JOIN book_reviews
            ON books.id = book_reviews.book_id
            ORDER BY ${sortQuery};`//default: order by id of book
    );

    if (response.rows.length) {
      return response.rows;
    }
    return [];
  } catch (error) {
    console.log("Error fetching items data from databases.", error);
    return [];
  }
}

//sort items order by
let sort = 'title';
app.post("/sort", async (req, res) => {
  sort = req.body.sort;
  res.redirect("/");
});

app.get("/", async (req, res) => {
  try {
    console.log(sort);
    const items = await getAllBookReview();

    res.render("index.ejs", {
      books: items,
      sortSelected: sort,
    });
  } catch (error) {
    console.log("Error fetching items data from databases.", error);
  }
});

app.get("/review/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    // console.log(id);
    let result = [];
    try {
      const response = await db.query(
        `SELECT * FROM books
                JOIN book_reviews
                ON books.id = book_reviews.book_id
                WHERE book_reviews.review_id = $1`,
        [id] //default: order by id of book
      );

      result = response.rows;
    } catch (error) {
      console.log("Error fetching items data from databases.", error);
    }
    // console.log(result);
    res.render("detail.ejs", {
      book: result[0],
    });
  } catch (error) {
    console.log("Error fetching items data from databases.", error);
  }
});

app.get("/review/:id/edit", async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    let result = [];
    try {
      const response = await db.query(
        `SELECT * FROM books
                JOIN book_reviews
                ON books.id = book_reviews.book_id`
      );

      result = response.rows.find((review) => review.review_id === id);
    } catch (error) {
      console.log("Error fetching items data from databases.", error);
    }

    res.render("edit.ejs", { book: result });
  } catch (error) {
    console.log("Error fetching items data from databases.", error);
  }
});

app.post("/review/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const newRating = req.body["edit_rating"];
    const newReviewText = req.body["edit_review"];
    let result = [];
    try {
      await db.query(
        `UPDATE book_reviews
                SET rating = $1, review_text = $2, review_date = CURRENT_TIMESTAMP
                WHERE review_id = $3
                `,
        [newRating, newReviewText, id]
      );

      const response = await db.query(
        `SELECT * FROM books
                JOIN book_reviews
                ON books.id = book_reviews.book_id
                WHERE book_reviews.review_id = $1`,
        [id] //default: order by id of book
      );

      result = response.rows;
    } catch (error) {
      console.log("Error fetching items data from databases.", error);
    }

    res.render("detail.ejs", { book: result[0] });
    // res.redirect(`/review/${id}`, {});
  } catch (error) {
    console.log("Error fetching items data from databases.", error);
  }
});

app.get("/add", (req, res) => {
  res.render("add.ejs");
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
