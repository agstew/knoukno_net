import mongoose from 'mongoose';
import { config } from '../config/env.js';

mongoose.set('bufferCommands', false);

const workbookSnapshotSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    titleId: { type: String, required: true },
    title: { type: mongoose.Schema.Types.Mixed, required: true },
    owner: { type: mongoose.Schema.Types.Mixed, required: true },
    generatedAt: { type: Date, required: true },
    items: { type: [mongoose.Schema.Types.Mixed], required: true },
  },
  { timestamps: true, versionKey: false },
);

workbookSnapshotSchema.index({ userId: 1, titleId: 1 }, { unique: true });

const WorkbookSnapshot = mongoose.model('WorkbookSnapshot', workbookSnapshotSchema);

export async function connectMongo() {
  if (!config.mongoUri) return false;
  if (mongoose.connection.readyState === 1) return true;
  await mongoose.connect(config.mongoUri, { serverSelectionTimeoutMS: 5000 });
  return true;
}

export async function saveWorkbookSnapshot(snapshot) {
  if (!(await connectMongo())) return false;
  await WorkbookSnapshot.findOneAndUpdate(
    { userId: snapshot.userId, titleId: snapshot.titleId },
    snapshot,
    { upsert: true, runValidators: true },
  );
  return true;
}

export async function disconnectMongo() {
  if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
}