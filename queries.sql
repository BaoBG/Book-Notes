CREATE TABLE books(
	id SERIAL PRIMARY KEY,
	title VARCHAR(255) NOT NULL UNIQUE,
	author VARCHAR(255),
	isbn VARCHAR(20)
);

CREATE TABLE book_reviews(
	review_id SERIAL PRIMARY KEY,
	rating INTEGER CHECK(rating >= 1 AND rating <= 10),
	review_text TEXT,
	review_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	book_id INTEGER REFERENCES books(id)
);
