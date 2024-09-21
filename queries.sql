CREATE TABLE books(
	id SERIAL PRIMARY KEY,
	title VARCHAR(255) NOT NULL UNIQUE,
	author VARCHAR(255) NOT NULL,
	isbn VARCHAR(20)
);
-- only has one Title of book -> one book
CREATE TABLE book_reviews(
	review_id SERIAL PRIMARY KEY,
	rating INTEGER CHECK(rating >= 1 AND rating <= 10),
	review_text TEXT NOT NULL,
	review_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	book_id INTEGER REFERENCES books(id)
);
-- has many reviews of one book