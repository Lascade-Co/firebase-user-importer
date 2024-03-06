const admin = require('firebase-admin');
const fs = require('fs');
const csvWriter = require('csv-writer').createObjectCsvWriter;

//firebase admin configure
const serviceAccount = require('./rent80_serviceAccountKey.json');
const { createObjectCsvWriter } = require('csv-writer');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// Function to list all users and write to CSV
const listAllUsers = async (nextPageToken) => {
    try {
      const listUsersResult = await admin.auth().listUsers(1000, nextPageToken);
      const users = listUsersResult.users.map((userRecord) => {
        let loginType = 'Anonymous';
        if (userRecord.providerData && userRecord.providerData.length > 0) {
          const provider = userRecord.providerData[0].providerId;
          if (provider === 'google.com') {
            loginType = 'Google';
          } else if (provider === 'apple.com') {
            loginType = 'Apple';
          } else if (provider === 'facebook.com') {
            loginType = 'Facebook';
          }
        }
        return {
          uid: userRecord.uid,
          email: userRecord.email,
          displayName: userRecord.displayName,
          phoneNumber: userRecord.phoneNumber,
          createdAt: userRecord.metadata.creationTime,
          loginType: loginType,
        };
      });

      const filteredUsers = users.filter(user => user.email);
      const csvWriter = createObjectCsvWriter({
        path: 'imported_users.csv',
        header: [
          { id: 'uid', title: 'UID' },
          { id: 'email', title: 'Email' },
          { id: 'displayName', title: 'Display Name' },
          { id: 'phoneNumber', title: 'Phone Number' },
          { id: 'createdAt', title: 'Created At' },
          { id: 'loginType', title: 'Login Type' },
        ],
        append: true, // Append records to the existing file
      });

      await csvWriter.writeRecords(filteredUsers);

      if (listUsersResult.pageToken) {
        // List next batch of users.
        await listAllUsers(listUsersResult.pageToken);
      }
    } catch (error) {
      console.log('Error listing users:', error);
    }
};

// Start listing users from the beginning, 1000 at a time.
listAllUsers();
