const mongoose = require('mongoose');

const User = require('./User');
const Payment = require('./Payment');

const { Schema } = mongoose;

function createCollectionModel(modelName, collectionName, extraDefinition = {}) {
  const schema = new Schema(
    {
      publicId: {
        type: String,
        index: true,
      },
      userPublicId: {
        type: String,
        index: true,
      },
      email: {
        type: String,
        trim: true,
        lowercase: true,
      },
      title: {
        type: String,
        trim: true,
      },
      value: {
        type: Schema.Types.Mixed,
      },
      payload: {
        type: Schema.Types.Mixed,
      },
      status: {
        type: String,
        default: 'active',
      },
      ...extraDefinition,
    },
    {
      timestamps: true,
      collection: collectionName,
    }
  );

  return mongoose.models[modelName] || mongoose.model(modelName, schema);
}

const Title = createCollectionModel('Title', 'title');
const Login = createCollectionModel('Login', 'login', {
  ipAddress: String,
});
const Register = createCollectionModel('Register', 'register', {
  name: String,
});
const Print = createCollectionModel('Print', 'print');
const Save = createCollectionModel('Save', 'save');
const Question = createCollectionModel('Question', 'question');
const Grade = createCollectionModel('Grade', 'grade');
const Rated = createCollectionModel('Rated', 'rated');
const Answers = createCollectionModel('Answers', 'answers');
const Average = createCollectionModel('Average', 'average');
const Delete = createCollectionModel('Delete', 'delete');
const Email = createCollectionModel('Email', 'email');

const adminCollections = {
  payment: Payment,
  title: Title,
  login: Login,
  register: Register,
  print: Print,
  save: Save,
  question: Question,
  grade: Grade,
  rated: Rated,
  answers: Answers,
  average: Average,
  delete: Delete,
  email: Email,
};

module.exports = {
  User,
  Payment,
  Title,
  Login,
  Register,
  Print,
  Save,
  Question,
  Grade,
  Rated,
  Answers,
  Average,
  Delete,
  Email,
  adminCollections,
};
