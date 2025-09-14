import React, { useState, useEffect } from 'react';
import {
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Typography,
  Box,
} from '@mui/material';
import { NotificationsOutlined } from '@mui/icons-material';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { formatDistanceToNow } from 'date-fns';

interface Notification {
  _id: string;
  title: string;
  message: string;
  recipientEmail: string;
  read: boolean;
  createdAt: string;
  incidentId: string;
}

export const NotificationBell = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/notifications');
      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
        setUnreadCount(data.filter((n: Notification) => !n.read).length);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  useEffect(() => {
    if (session?.user?.userType === 'official') {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [session]);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationClick = async (notification: Notification) => {
    try {
      // Mark as read
      const response = await fetch(`/api/notifications?id=${notification._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ read: true }),
      });

      if (response.ok) {
        // Update the local state
        setNotifications(notifications.map(n => 
          n._id === notification._id 
            ? { ...n, read: true }
            : n
        ));
        setUnreadCount(prev => Math.max(0, prev - 1));

        // Close the menu
        handleClose();

        // Check if we're already on the incident page
        const currentIncidentId = router.query.id;
        const targetPath = `/incidents/${notification.incidentId}`;

        if (currentIncidentId !== notification.incidentId) {
          // Only navigate if we're not already on the page
          router.push(targetPath);
        } else {
          // If we're on the same page, we could optionally refresh the data
          // or show a message that we're already viewing this incident
          window.location.reload(); // Optional: refresh the page data
        }
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  if (session?.user?.userType !== 'official') {
    return null;
  }

  return (
    <Box>
      <IconButton
        color="inherit"
        onClick={handleClick}
        aria-label={`${unreadCount} new notifications`}
      >
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsOutlined />
        </Badge>
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          style: {
            maxHeight: '400px',
            width: '300px',
          },
        }}
      >
        {notifications.length === 0 ? (
          <MenuItem>
            <Typography>No notifications</Typography>
          </MenuItem>
        ) : (
          notifications.map((notification) => (
            <MenuItem
              key={notification._id}
              onClick={() => handleNotificationClick(notification)}
              sx={{
                backgroundColor: notification.read ? 'inherit' : 'action.hover',
                display: 'block',
                py: 1.5,
              }}
            >
              <Typography variant="subtitle2" gutterBottom>
                {notification.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {notification.message}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
              </Typography>
            </MenuItem>
          ))
        )}
      </Menu>
    </Box>
  );
}; 