import React, { useState } from 'react';
import {
  IconButton,
  Menu,
  MenuItem,
  Typography,
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Link,
  Tooltip,
} from '@mui/material';
import {
  LocalHospital,
  LocalPolice,
  Phone,
  Warning as Emergency,
  LocalPharmacy,
  DirectionsRun,
} from '@mui/icons-material';

const emergencyContacts = [
  {
    category: 'Emergency Numbers',
    contacts: [
      { name: 'Police Emergency', number: '100', icon: <LocalPolice /> },
      { name: 'Ambulance', number: '108', icon: <LocalHospital /> },
      { name: 'Fire Emergency', number: '101', icon: <DirectionsRun /> },
      { name: 'National Emergency', number: '112', icon: <Emergency /> },
    ]
  },
  {
    category: 'Healthcare',
    contacts: [
      { name: 'Government Hospital', number: '011-2658-7444', icon: <LocalHospital /> },
      { name: 'Blood Bank', number: '011-2658-8888', icon: <LocalPharmacy /> },
      { name: 'Mental Health Helpline', number: '1800-599-0019', icon: <LocalHospital /> },
    ]
  },
  {
    category: 'Law Enforcement',
    contacts: [
      { name: 'Police Control Room', number: '011-2301-1111', icon: <LocalPolice /> },
      { name: 'Traffic Police', number: '011-2584-4444', icon: <LocalPolice /> },
      { name: 'Women Helpline', number: '1091', icon: <Phone /> },
    ]
  }
];

export const EmergencyContacts = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedContact, setSelectedContact] = useState<{ name: string; number: string } | null>(null);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleContactClick = (contact: { name: string; number: string }) => {
    setSelectedContact(contact);
  };

  const handleDialogClose = () => {
    setSelectedContact(null);
  };

  return (
    <Box component="span">
      <Tooltip title="Emergency Contacts">
        <IconButton
          color="primary"
          onClick={handleClick}
          sx={{ 
            backgroundColor: 'rgba(37, 99, 235, 0.1)',
            '&:hover': {
              backgroundColor: 'rgba(37, 99, 235, 0.2)',
            }
          }}
        >
          <Phone />
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          style: {
            maxHeight: '500px',
            width: '320px',
          },
        }}
      >
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Emergency color="error" />
            Emergency Contacts
          </Typography>
        </Box>
        <Divider />
        
        {emergencyContacts.map((section, index) => (
          <Box key={section.category}>
            <Typography variant="subtitle1" sx={{ px: 2, py: 1, bgcolor: 'action.hover' }}>
              {section.category}
            </Typography>
            <List dense>
              {section.contacts.map((contact) => (
                <ListItem
                  key={contact.name}
                  button
                  onClick={() => handleContactClick(contact)}
                  sx={{
                    '&:hover': {
                      backgroundColor: 'action.hover',
                    },
                  }}
                >
                  <ListItemIcon>
                    {contact.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={contact.name}
                    secondary={contact.number}
                  />
                </ListItem>
              ))}
            </List>
            {index < emergencyContacts.length - 1 && <Divider />}
          </Box>
        ))}
      </Menu>

      <Dialog
        open={Boolean(selectedContact)}
        onClose={handleDialogClose}
        maxWidth="xs"
        fullWidth
      >
        {selectedContact && (
          <>
            <DialogTitle>
              Contact {selectedContact.name}
            </DialogTitle>
            <DialogContent>
              <Typography variant="body1" gutterBottom>
                Would you like to call {selectedContact.name}?
              </Typography>
              <Typography variant="h6" color="primary">
                {selectedContact.number}
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleDialogClose}>Cancel</Button>
              <Button
                variant="contained"
                color="primary"
                component={Link}
                href={`tel:${selectedContact.number}`}
                onClick={handleDialogClose}
              >
                Call Now
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
}; 