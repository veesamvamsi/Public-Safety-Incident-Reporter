import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth/[...nextauth]';
import { connectToDatabase } from '../../lib/db';
import { ObjectId } from 'mongodb';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';

export const config = {
  api: {
    bodyParser: false, // Disable the default body parser
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  const { db } = await connectToDatabase();

  // Handle GET request for fetching incidents
  if (req.method === 'GET') {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = (page - 1) * limit;
      const search = req.query.search as string;

      // Build query
      let query: any = {};
      
      // Add search filter if provided
      if (search) {
        query.$or = [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { 'location.address': { $regex: search, $options: 'i' } }
        ];
      }

      // Add user filter if userOnly parameter is true
      if (req.query.userOnly === 'true') {
        query.reportedBy = { email: session.user.email };
      }

      // Get total count for pagination
      const total = await db.collection('incidents').countDocuments(query);

      // Get incidents with pagination
      const incidents = await db.collection('incidents')
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray();

      return res.status(200).json({
        incidents,
        total,
        page,
        totalPages: Math.ceil(total / limit)
      });
    } catch (error) {
      console.error('Error fetching incidents:', error);
      return res.status(500).json({ message: 'Error fetching incidents' });
    }
  }

  // Handle POST request for creating new incidents
  if (req.method === 'POST') {
    try {
      const form = formidable({
        uploadDir: path.join(process.cwd(), 'public', 'uploads'),
        keepExtensions: true,
        maxFileSize: 5 * 1024 * 1024, // 5MB
      });

      // Ensure upload directory exists
      const uploadDir = path.join(process.cwd(), 'public', 'uploads');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      // Parse the form data
      const [fields, files] = await new Promise((resolve, reject) => {
        form.parse(req, (err, fields, files) => {
          if (err) reject(err);
          resolve([fields, files]);
        });
      });

      // Validate required fields
      if (!fields.title || !fields.location || !fields.type) {
        return res.status(400).json({
          message: 'Missing required fields',
          details: {
            title: !fields.title ? 'Title is required' : null,
            location: !fields.location ? 'Location is required' : null,
            type: !fields.type ? 'Incident type is required' : null,
          }
        });
      }

      // Create new incident
      const newIncident = {
        title: fields.title[0],
        description: fields.description ? fields.description[0] : '',
        location: {
          address: fields.location[0],
          coordinates: null // You can add geocoding here if needed
        },
        type: fields.type[0], // Store as type to match the interface
        severity: fields.severity ? fields.severity[0] : 'medium',
        photoUrl: files.photo ? `/uploads/${path.basename(files.photo[0].filepath)}` : null,
        reportedBy: {
          email: session.user.email,
          name: session.user.name
        },
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = await db.collection('incidents').insertOne(newIncident);

      // Create notifications for officials
      try {
        // Get all officials
        const officials = await db.collection('users').find({ userType: 'official' }).toArray();

        if (officials.length > 0) {
          const notifications = officials.map(official => ({
            title: `New Incident: ${newIncident.title}`,
            message: `${newIncident.type} - ${newIncident.severity} severity reported at ${newIncident.location.address}`,
            incidentId: result.insertedId,
            recipientEmail: official.email,
            read: false,
            createdAt: new Date(),
          }));

          await db.collection('notifications').insertMany(notifications);
        }
      } catch (error) {
        console.error('Error creating notifications:', error);
        // Don't fail the incident creation if notification creation fails
      }

      return res.status(201).json({
        message: 'Incident reported successfully',
        incident: { ...newIncident, _id: result.insertedId }
      });
    } catch (error) {
      console.error('Error creating incident:', error);
      return res.status(500).json({ message: 'Error creating incident' });
    }
  }

  // Handle DELETE request
  if (req.method === 'DELETE') {
    const { id } = req.query;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ message: 'Invalid incident ID' });
    }

    try {
      // First, get the incident to check ownership
      const incident = await db.collection('incidents').findOne({
        _id: new ObjectId(id)
      });

      if (!incident) {
        return res.status(404).json({ message: 'Incident not found' });
      }

      // Check if user is authorized to delete (owner or admin/official)
      if (
        incident.reportedBy.email !== session.user.email &&
        session.user.userType !== 'admin' &&
        session.user.userType !== 'official'
      ) {
        return res.status(403).json({ message: 'Not authorized to delete this incident' });
      }

      // Delete the incident
      const result = await db.collection('incidents').deleteOne({
        _id: new ObjectId(id)
      });

      if (result.deletedCount === 0) {
        return res.status(404).json({ message: 'Incident not found' });
      }

      return res.status(200).json({ message: 'Incident deleted successfully' });
    } catch (error) {
      console.error('Error deleting incident:', error);
      return res.status(500).json({ message: 'Error deleting incident' });
    }
  }

  // Return 405 for other methods
  res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
  return res.status(405).json({ message: `Method ${req.method} not allowed` });
}
