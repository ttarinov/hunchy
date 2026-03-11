import { onRequest, HttpsError } from "firebase-functions/v2/https";
import { container } from "../../invercify.config";
import { FirebaseService } from "../../services/FirebaseService";
import { verifyCliToken } from "./cli-auth.handlers";
export const cliGetUsage = onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Authorization');
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }
  try {
    const tokenPayload = await verifyCliToken(req.headers.authorization);
    const firebaseService = container.get(FirebaseService);
    const usageRef = firebaseService.database().ref(`usage/${tokenPayload.userId}`);
    const snapshot = await usageRef.get();
    const usageData = snapshot.val() || {};
    res.json({
      userId: tokenPayload.userId,
      usage: {
        commits: usageData.commits || 0,
        apiCalls: usageData.apiCalls || 0,
        lastActivity: usageData.lastActivity || null
      },
      limits: {
        commitsPerMonth: usageData.limits?.commitsPerMonth || 100,
        apiCallsPerDay: usageData.limits?.apiCallsPerDay || 1000
      }
    });
  } catch (error) {
    console.error('Error getting usage:', error);
    if (error instanceof HttpsError) {
      res.status(error.httpErrorCode.status).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});
export const cliRecordUsage = onRequest(async (req, res) => {
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
    const { type, metadata } = req.body;
    if (!type) {
      res.status(400).json({ error: 'type is required' });
      return;
    }
    const firebaseService = container.get(FirebaseService);
    const usageRef = firebaseService.database().ref(`usage/${tokenPayload.userId}`);
    const updates: any = {
      lastActivity: Date.now()
    };
    if (type === 'commit') {
      updates.commits = (await usageRef.child('commits').get()).val() + 1 || 1;
    } else if (type === 'api_call') {
      updates.apiCalls = (await usageRef.child('apiCalls').get()).val() + 1 || 1;
    }
    await usageRef.update(updates);
    await firebaseService
      .database()
      .ref(`usageHistory/${tokenPayload.userId}`)
      .push({
        type,
        metadata: metadata || {},
        timestamp: Date.now()
      });
    res.json({
      success: true,
      recorded: type
    });
  } catch (error) {
    console.error('Error recording usage:', error);
    if (error instanceof HttpsError) {
      res.status(error.httpErrorCode.status).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});
