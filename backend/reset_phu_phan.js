import mongoose from 'mongoose';

const mongoUri = 'mongodb+srv://phanphiphu04_db_user:uUKZYTAZ5p9uvfw6@cluster0.2vvxpwn.mongodb.net/tiengtrunghongtai?retryWrites=true&w=majority&appName=Cluster0';

async function resetPhuPhan() {
  try {
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(mongoUri);

    const userSchema = new mongoose.Schema({
      _id: String,
      name: String,
      progress: Object,
      stats: Object
    }, { strict: false });

    const User = mongoose.model('User', userSchema);

    // Reset progress and stats for phanphiphu04@gmail.com (Phú Phan)
    const res = await User.updateOne(
      { _id: 'phanphiphu04@gmail.com' },
      {
        $set: {
          progress: {},
          'stats.streak': 0,
          'stats.studyTime': 0,
          'stats.lastActiveDate': null
        }
      }
    );

    console.log('MongoDB update result for Phú Phan:', res);

    // Verify after reset
    const user = await User.findById('phanphiphu04@gmail.com');
    if (user) {
      console.log('\n=== VERIFICATION AFTER RESET ===');
      console.log('User Name:', user.name);
      console.log('User Email:', user._id);
      console.log('Progress:', user.progress);
      console.log('Stats:', user.stats);
    }

    await mongoose.disconnect();
    console.log('\nPhú Phan progress & points successfully reset to 0 in MongoDB!');
  } catch (err) {
    console.error('Reset error:', err);
  }
}

resetPhuPhan();
