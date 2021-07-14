const express = require("express");
const { graphqlHTTP } = require("express-graphql");
const {
	GraphQLSchema,
	GraphQLObjectType,
	GraphQLString,
	GraphQLInt,
	GraphQLNonNull,
	GraphQLList,
	GraphQLFloat,
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
					return authors.find((author) => args.id === author.id);
				},
			},
		};
	},
});

const schema = new GraphQLSchema({
	query: RootQueryType,
});

app.use(
	"/graphql",
	graphqlHTTP({
		schema: schema,
		graphiql: true,
	})
);

app.listen(5000, () => console.log("running"));
