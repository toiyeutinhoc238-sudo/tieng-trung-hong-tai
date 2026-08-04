import mongoose from 'mongoose';

const mongoUri = 'mongodb+srv://phanphiphu04_db_user:uUKZYTAZ5p9uvfw6@cluster0.2vvxpwn.mongodb.net/tiengtrunghongtai?retryWrites=true&w=majority&appName=Cluster0';

async function checkDatabase() {
  try {
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB Atlas successfully!');

    const userSchema = new mongoose.Schema({
      _id: String,
      name: String,
      picture: String,
      progress: Object,
      stats: Object
    }, { strict: false });

    const User = mongoose.model('User', userSchema);

    const users = await User.find({});
    console.log(`\n=== MONGODB DATABASE USERS REPORT (${users.length} users) ===\n`);

    if (users.length === 0) {
      console.log('No users found in MongoDB! All users and progress are 0.');
    } else {
      users.forEach((u, i) => {
        const prog = u.progress || {};
        let memorizedCount = 0;
        Object.keys(prog).forEach(k => {
          if (prog[k] && prog[k].isMemorized) memorizedCount++;
        });
        console.log(`User #${i + 1}:`);
        console.log(`  ID / Email: ${u._id}`);
        console.log(`  Name: ${u.name}`);
        console.log(`  Points (Memorized Words Count): ${memorizedCount}`);
        console.log(`  Stats:`, u.stats);
        console.log(`  Progress keys count:`, Object.keys(prog).length);
        console.log('---');
      });
    }

    await mongoose.disconnect();
  } catch (err) {
    console.error('Error checking MongoDB:', err);
  }
}

checkDatabase();
