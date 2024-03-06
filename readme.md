# Firebase User Importer

This project is a Node.js script that allows you to import user data from Firebase Authentication using the Firebase Admin SDK.

## Prerequisites

Before running this script, make sure you have completed the following steps:

1. Download the Firebase Admin SDK service account key from the Firebase console.
2. Save the service account key JSON file to a secure location in your project directory.

## Installation

1. Clone this repository to your local machine.
2. Install the required dependencies by running the following command:

   ```shell
   npm install
    ```

## Configuration
Assign variable serviceAccount with the service account key JSON file path in the index.js file.

   ```javascript
   const serviceAccount = require('path/to/serviceAccountKey.json');
   ```

## Run the script

To run the script, use the following command:

    ```shell
    npm start
    ```

## Result
The script will import the user Authentication data from Firebase to the imported_users.csv file in the root directory of the project.
