const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/kno-u-kno';

async function main(){
  await mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('Connected to', MONGODB_URI);
  const questionSchema = new mongoose.Schema({ id: Number, title: String, text: String }, { timestamps: true });
  const Question = mongoose.models.Question || mongoose.model('Question', questionSchema);
  const docs = await Question.find().sort({ id: 1 }).lean().exec();
  console.log('Count:', docs.length);
  if(docs.length>0){
    console.log('IDs:', docs.map(d=>d.id).join(', '));
    docs.forEach(d=> console.log(`- id=${d.id} title="${d.title}"`));
  }
  await mongoose.disconnect();
}

main().catch(err=>{
  console.error('Error:', err && err.message || err);
  process.exit(1);
});
