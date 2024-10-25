# Techuplabs Assignment

This angular assignment is a simple application that allows you to add customers and pins with various attributes.

1. I have used local storage to store the data and sqlite to store the images in a database.
2. In order to render the data, signals are used.
3. Services are used to apply a layer of abstraction to seperate out the business logic and handle the data.
4. Bootstrap is used to style the whole application.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Running the Application](#running-the-application)
- [Development](#development)

## Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (version 14.x or later)
- npm (usually comes with Node.js)
- Angular CLI (version 18.x)

## Installation

1. Clone the repository:

   ```
   git clone https://github.com/your-username/techuplabs.git
   cd techuplabs
   ```

2. Install dependencies:
   ```
   npm install
   ```

## Running the Application

To spin up a development server:

1. Run the following command:

   ```
   ng serve
   ```

2. Open your browser and navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

To run the server:

1. Run the following command:
   ```
   node server.js
   ```

## Development

- To generate a new component:

  ```
  ng generate component component-name
  ```

- You can also use `ng generate` for other Angular artifacts:
  ```
  ng generate directive|pipe|service|class|guard|interface|enum|module
  ```
