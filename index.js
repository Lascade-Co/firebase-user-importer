const admin = require('firebase-admin');
const fs = require('fs');
const csvWriter = require('csv-writer').createObjectCsvWriter;

//firebase admin configure
const serviceAccount = require('./serviceAccountKey.json');
const outputfile = 'imported_users.csv';

const { createObjectCsvWriter } = require('csv-writer');
const readline = require('readline');

let importedCount = 0;

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
          } else if (provider === 'password') {
            loginType = 'Email/Password';
          } else if (provider === 'phone') {
            loginType = 'Phone';
          } else if (provider === 'twitter.com') {
            loginType = 'Twitter';
          } else if (provider === 'github.com') {
            loginType = 'Github';
          } else if (provider === 'microsoft.com') {
            loginType = 'Microsoft';
          } else if (provider === 'yahoo.com') {
            loginType = 'Yahoo';
          } else if (provider === 'linkedin.com') {
            loginType = 'LinkedIn';
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
        path: outputfile,
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

      for (const user of filteredUsers) {
        await csvWriter.writeRecords([user]);
        importedCount++;
        const spinner = ['|', '/', '-', '\\'];
        let spinnerIndex = 0;

        const animateActivity = () => {
          process.stdout.write(` Imported ${importedCount} email users ${spinner[spinnerIndex]}\r`);
          spinnerIndex = (spinnerIndex + 1) % spinner.length;
        };

        setInterval(animateActivity, 100);
      }

      if (listUsersResult.pageToken) {
        // List next batch of users.
        await listAllUsers(listUsersResult.pageToken);
      }
    } catch (error) {
      console.log('Error listing users:', error);
    }
};

//Delete outputfile if exists
if (fs.existsSync(outputfile)) {
  fs.unlinkSync(outputfile);
}

// Start listing users from the beginning, 1000 at a time.
listAllUsers();
