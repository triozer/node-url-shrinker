# Node URL Shrinker

A simple and efficient URL shortener built with Node.js, Bun, and Hono.

## Features

- Create short URLs with custom or auto-generated slugs
- Update existing links
- Track visits to shortened URLs
- RESTful API for easy integration

## Tech Stack

- [Bun](https://bun.sh/) - JavaScript runtime and package manager
- [Hono](https://hono.dev/) - Lightweight web framework
- [Drizzle ORM](https://orm.drizzle.team/) - TypeScript ORM
- [SQLite](https://www.sqlite.org/) - Embedded database

## Getting Started

### Prerequisites

Make sure you have [Bun](https://bun.sh/) installed on your system.

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/node-url-shrinker.git
   cd node-url-shrinker
   ```

2. Install dependencies:
   ```bash
   bun install
   ```

3. Set up the database:
   ```bash
   bun drizzle-kit migrate
   ```

### Running the Application

To start the development server:
    ```bash
    bun dev
    ```

The server will start running on `http://localhost:3000` (or the port specified in your environment).

## API Endpoints

- `GET /:slug`: Redirect to the original URL
- `POST /links`: Create a new shortened URL
- `GET /links`: Get all links or a specific link by slug
- `GET /links/:id`: Get a specific link by ID
- `PATCH /links/:id`: Update an existing link
- `DELETE /links/:id`: Delete a link
- `GET /links/:id/visits`: Get all visits for a specific link
- `GET /links/:id/visits/:visitId`: Get a specific visit for a link

For more details on the API endpoints and their usage, please refer to the comments in the `src/routes/*.ts` file.
