import { ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  useTheme,
  useMediaQuery,
  ListItemIcon,
  ListItemText,
  Avatar,
  Fab,
  Dialog,
  Tooltip,
} from '@mui/material';
import {
  AccountCircle,
  DirectionsCar,
  Menu as MenuIcon,
  Dashboard,
  Article,
  Gavel,
  Person,
  LocationOn,
  Close as CloseIcon,
  Phone,
} from '@mui/icons-material';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/router';
import GeoLocation from './GeoLocation';
import { NotificationBell } from './NotificationBell';
import { EmergencyContacts } from './EmergencyContacts';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileMenuAnchorEl, setMobileMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [userMenuAnchorEl, setUserMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [isLocationDialogOpen, setIsLocationDialogOpen] = useState(false);

  const handleMobileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMobileMenuAnchorEl(event.currentTarget);
  };

  const handleMobileMenuClose = () => {
    setMobileMenuAnchorEl(null);
  };

  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setUserMenuAnchorEl(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchorEl(null);
  };

  const handleProfileClick = () => {
    router.push('/profile');
    handleUserMenuClose();
    handleMobileMenuClose();
  };

  const navigateToArticles = () => {
    router.push('/articles');
    handleMobileMenuClose();
  };

  const navigateToDashboard = () => {
    router.push('/dashboard');
    handleMobileMenuClose();
  };

  const navigateToLegalAssistant = () => {
    router.push('/law-chatbot');
    handleMobileMenuClose();
  };

  const handleLocationClick = () => {
    setIsLocationDialogOpen(true);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar
        position="fixed"
        sx={{
          backgroundColor: 'white',
          color: 'text.primary',
          boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
        }}
      >
        <Toolbar>
          {session && isMobile && (
            <IconButton
              color="inherit"
              edge="start"
              onClick={handleMobileMenuOpen}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          <DirectionsCar sx={{ mr: 2, color: 'primary.main' }} />
          <Typography
            variant="h6"
            component="div"
            sx={{
              flexGrow: 1,
              fontWeight: 600,
              '& a': { textDecoration: 'none', color: 'inherit' },
            }}
          >
            <Link href="/">Transport Incident Reporter</Link>
          </Typography>

          {!isMobile && (
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              {session ? (
                <>
                  <Button
                    color="primary"
                    onClick={navigateToDashboard}
                    startIcon={<Dashboard />}
                  >
                    Dashboard
                  </Button>
                  <Button
                    color="primary"
                    onClick={navigateToArticles}
                    startIcon={<Article />}
                  >
                    Safety Resources
                  </Button>
                  <Button
                    color="primary"
                    onClick={navigateToLegalAssistant}
                    startIcon={<Gavel />}
                  >
                    Legal Assistant
                  </Button>
                  <Tooltip title="View Location">
                    <IconButton
                      color="primary"
                      onClick={handleLocationClick}
                      sx={{ 
                        backgroundColor: 'rgba(37, 99, 235, 0.1)',
                        '&:hover': {
                          backgroundColor: 'rgba(37, 99, 235, 0.2)',
                        }
                      }}
                    >
                      <LocationOn />
                    </IconButton>
                  </Tooltip>
                  <EmergencyContacts />
                  {session.user?.userType === 'official' && <NotificationBell />}
                  <IconButton
                    size="large"
                    onClick={handleUserMenuOpen}
                    color="primary"
                  >
                    <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                      {session.user?.name?.[0] || 'U'}
                    </Avatar>
                  </IconButton>
                </>
              ) : (
                <>
                  <Tooltip title="View Location">
                    <IconButton
                      color="primary"
                      onClick={handleLocationClick}
                      sx={{ 
                        backgroundColor: 'rgba(37, 99, 235, 0.1)',
                        '&:hover': {
                          backgroundColor: 'rgba(37, 99, 235, 0.2)',
                        }
                      }}
                    >
                      <LocationOn />
                    </IconButton>
                  </Tooltip>
                  <EmergencyContacts />
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => router.push('/auth/signin')}
                  >
                    Sign In
                  </Button>
                </>
              )}
            </Box>
          )}
        </Toolbar>
      </AppBar>

      {/* Mobile Menu */}
      <Menu
        anchorEl={mobileMenuAnchorEl}
        open={Boolean(mobileMenuAnchorEl)}
        onClose={handleMobileMenuClose}
        sx={{ mt: 5 }}
      >
        <MenuItem onClick={navigateToDashboard}>
          <ListItemIcon>
            <Dashboard fontSize="small" />
          </ListItemIcon>
          <ListItemText>Dashboard</ListItemText>
        </MenuItem>
        <MenuItem onClick={navigateToArticles}>
          <ListItemIcon>
            <Article fontSize="small" />
          </ListItemIcon>
          <ListItemText>Safety Resources</ListItemText>
        </MenuItem>
        <MenuItem onClick={navigateToLegalAssistant}>
          <ListItemIcon>
            <Gavel fontSize="small" />
          </ListItemIcon>
          <ListItemText>Legal Assistant</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleLocationClick}>
          <ListItemIcon>
            <LocationOn fontSize="small" />
          </ListItemIcon>
          <ListItemText>View Location</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleProfileClick}>
          <ListItemIcon>
            <Person fontSize="small" />
          </ListItemIcon>
          <ListItemText>Profile</ListItemText>
        </MenuItem>
        <MenuItem>
          <ListItemIcon>
            <Phone fontSize="small" />
          </ListItemIcon>
          <ListItemText>Emergency Contacts</ListItemText>
        </MenuItem>
      </Menu>

      {/* User Menu */}
      <Menu
        anchorEl={userMenuAnchorEl}
        open={Boolean(userMenuAnchorEl)}
        onClose={handleUserMenuClose}
        sx={{ mt: 1 }}
      >
        <MenuItem onClick={handleProfileClick}>
          <ListItemIcon>
            <Person fontSize="small" />
          </ListItemIcon>
          <ListItemText>Profile</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleLocationClick}>
          <ListItemIcon>
            <LocationOn fontSize="small" />
          </ListItemIcon>
          <ListItemText>View Location</ListItemText>
        </MenuItem>
      </Menu>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          mt: 8,
          backgroundColor: '#f5f6fa',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Box
          sx={{
            width: '100%',
            maxWidth: 'lg',
            mx: 'auto',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 3,
          }}
        >
          {children}
        </Box>
      </Box>

      {/* Location FAB for quick access */}
      <Fab
        color="primary"
        aria-label="location"
        onClick={handleLocationClick}
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
        }}
      >
        <LocationOn />
      </Fab>

      {/* Location Dialog */}
      <Dialog
        open={isLocationDialogOpen}
        onClose={() => setIsLocationDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            maxWidth: 450,
          }
        }}
      >
        <Box sx={{ position: 'relative', p: 2 }}>
          <IconButton
            onClick={() => setIsLocationDialogOpen(false)}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              zIndex: 1,
            }}
          >
            <CloseIcon />
          </IconButton>
          <GeoLocation />
        </Box>
      </Dialog>
    </Box>
  );
}
