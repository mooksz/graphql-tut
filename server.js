const express = require("express");
const { graphqlHTTP } = require("express-graphql");
const {
	GraphQLSchema,
	GraphQLObjectType,
	GraphQLString,
	GraphQLInt,
	GraphQLNonNull,
	GraphQLList,
} = require("graphql");
const { authors, books } = require("./sample-data.js");

const app = express();

const BookType = new GraphQLObjectType({
	name: "Book",
	description: "This is a book",
	fields: () => {
		return {
			id: { type: GraphQLNonNull(GraphQLInt) },
			name: { type: GraphQLNonNull(GraphQLString) },
			authorId: { type: GraphQLNonNull(GraphQLInt) },
			author: {
				type: AuthorType,
				resolve: (book) => {
					return authors.find((author) => author.id === book.authorId);
				},
			},
		};
	},
});

const AuthorType = new GraphQLObjectType({
	name: "Author",
	description: "This is a author",
	fields: () => {
		return {
			id: { type: GraphQLNonNull(GraphQLInt) },
			name: { type: GraphQLNonNull(GraphQLString) },
			books: {
				type: new GraphQLList(BookType),
				resolve: (author) => {
					return books.filter((book) => author.id === book.authorId);
				},
			},
		};
	},
});

const RootQueryType = new GraphQLObjectType({
	name: "query",
	description: "Root query",
	fields: () => {
		return {
			books: {
				type: new GraphQLList(BookType),
				description: "List of books",
				resolve: () => {
					return books;
				},
			},
			book: {
				type: BookType,
				description: "A book",
				args: {
					id: { type: GraphQLInt },
				},
				resolve: (parent, args) => {
					return books.find((book) => args.id === book.id);
				},
			},
			authors: {
				type: new GraphQLList(AuthorType),
				description: "List of authors",
				resolve: () => {
					return authors;
				},
			},
			author: {
				type: AuthorType,
				description: "A author",
				args: {
					id: { type: GraphQLInt },
				},
				resolve: (parent, args) => {
					console.log("🙋‍♂️", authors);
					return authors.find((author) => args.id === author.id);
				},
			},
		};
	},
});

const RootMutationType = new GraphQLObjectType({
	name: "mutation",
	description: "Root mutation",
	fields: () => {
		return {
			addBook: {
				type: BookType,
				description: "Add a book",
				args: {
					name: { type: GraphQLNonNull(GraphQLString) },
					authorId: { type: GraphQLNonNull(GraphQLInt) },
				},
				resolve: (parent, args) => {
					const book = {
						id: books.length + 1,
						name: args.name,
						authorId: args.authorId,
					};

					books.push(book);

					return book;
				},
			},
			addAuthor: {
				type: AuthorType,
				description: "Add an author",
				args: {
					name: { type: GraphQLNonNull(GraphQLString) },
				},
				resolve: (parent, args) => {
					const author = {
						id: authors.length + 1,
						name: args.name,
					};

					authors.push(author);

					return author;
				},
			},
		};
	},
});

const schema = new GraphQLSchema({
	query: RootQueryType,
	mutation: RootMutationType,
});

app.use(
	"/graphql",
	graphqlHTTP({
		schema: schema,
		graphiql: true,
	})
);

app.listen(5000, () => console.log("running"));
