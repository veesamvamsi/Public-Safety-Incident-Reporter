import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { connectToDatabase } from '../../../lib/db';
import { ObjectId } from 'mongodb';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const session = await getServerSession(req, res, authOptions);

    if (!session) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    // Check if user is an official
    if (session.user?.userType !== 'official') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { id } = req.query;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ message: 'Invalid notification ID' });
    }

    const { db } = await connectToDatabase();

    // Handle PATCH request (marking notification as read)
    if (req.method === 'PATCH') {
      const { read } = req.body;

      if (typeof read !== 'boolean') {
        return res.status(400).json({ message: 'Invalid read status' });
      }

      const result = await db.collection('notifications').updateOne(
        {
          _id: new ObjectId(id),
          recipientEmail: session.user.email,
        },
        {
          $set: { read },
        }
      );

      if (result.matchedCount === 0) {
        return res.status(404).json({ message: 'Notification not found' });
      }

      return res.status(200).json({ message: 'Notification updated successfully' });
    }

    return res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    console.error('Error handling notification:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
} 