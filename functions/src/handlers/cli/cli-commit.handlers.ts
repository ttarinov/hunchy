import { onRequest, HttpsError } from "firebase-functions/v2/https";
import { container } from "../../invercify.config";
import { FirebaseService } from "../../services/FirebaseService";
import { verifyCliToken } from "./cli-auth.handlers";
interface ProcessCommitRequest {
  diff: string;
  files?: string[];
  branch?: string;
  message?: string;
}
interface CommitProposal {
  id: string;
  message: string;
  description: string;
  files: string[];
  type: string;
}
export const cliProcessCommit = onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Authorization, Content-Type');
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  try {
    const tokenPayload = await verifyCliToken(req.headers.authorization);
    const { diff, files, branch, message } = req.body as ProcessCommitRequest;
    if (!diff) {
      res.status(400).json({ error: 'diff is required' });
      return;
    }
    const firebaseService = container.get(FirebaseService);
    const commitRef = firebaseService.database().ref(`users/${tokenPayload.userId}/commits`).push();
    await commitRef.set({
      diff,
      files: files || [],
      branch: branch || 'main',
      customMessage: message,
      status: 'processing',
      createdAt: Date.now()
    });
    const proposals: CommitProposal[] = [
      {
        id: commitRef.key || 'commit-1',
        message: 'feat: implement CLI commit processing',
        description: 'Add backend handler for processing git commits from CLI',
        files: files || [],
        type: 'feat'
      }
    ];
    await commitRef.update({
      status: 'completed',
      proposals,
      completedAt: Date.now()
    });
    res.json({
      success: true,
      commitId: commitRef.key,
      proposals
    });
  } catch (error) {
    console.error('Error processing commit:', error);
    if (error instanceof HttpsError) {
      res.status(error.httpErrorCode.status).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});
export const cliGetCommits = onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Authorization');
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }
  try {
    const tokenPayload = await verifyCliToken(req.headers.authorization);
    const limit = parseInt(req.query.limit as string || '10');
    const firebaseService = container.get(FirebaseService);
    const commitsRef = firebaseService
      .database()
      .ref(`users/${tokenPayload.userId}/commits`)
      .orderByChild('createdAt')
      .limitToLast(limit);
    const snapshot = await commitsRef.get();
    const commits: any[] = [];
    snapshot.forEach((child) => {
      commits.push({
        id: child.key,
        ...child.val()
      });
    });
    res.json({
      commits: commits.reverse() 
    });
  } catch (error) {
    console.error('Error getting commits:', error);
    if (error instanceof HttpsError) {
      res.status(error.httpErrorCode.status).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});
