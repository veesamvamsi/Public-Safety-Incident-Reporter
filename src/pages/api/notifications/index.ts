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

    const { db } = await connectToDatabase();

    if (req.method === 'GET') {
      // Get notifications for the official
      const notifications = await db
        .collection('notifications')
        .find({
          recipientEmail: session.user.email,
        })
        .sort({ createdAt: -1 }) // Sort by newest first
        .toArray();

      return res.status(200).json(notifications);
    }

    // Handle PATCH request (marking notification as read)
    if (req.method === 'PATCH') {
      const { id } = req.query;
      const { read } = req.body;

      if (!id) {
        return res.status(400).json({ message: 'Notification ID is required' });
      }

      const result = await db.collection('notifications').updateOne(
        {
          _id: new ObjectId(id as string),
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

    // Handle POST request (creating a new notification)
    if (req.method === 'POST') {
      const { title, type, incidentId } = req.body;

      if (!title || !type || !incidentId) {
        return res.status(400).json({ message: 'Missing required fields' });
      }

      // Get all officials
      const officials = await db
        .collection('users')
        .find({ userType: 'official' })
        .toArray();

      // Create notifications for all officials
      const notifications = officials.map((official) => ({
        title,
        type,
        incidentId: new ObjectId(incidentId),
        recipientEmail: official.email,
        read: false,
        createdAt: new Date(),
      }));

      await db.collection('notifications').insertMany(notifications);

      return res.status(201).json({ message: 'Notifications created successfully' });
    }

    return res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    console.error('Error handling notifications:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
} 