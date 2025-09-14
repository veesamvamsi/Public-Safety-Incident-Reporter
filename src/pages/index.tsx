import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import {
  Container,
  Box,
  Typography,
  Button,
  Paper,
  Grid,
  Card,
  CardContent,
  useTheme,
  alpha,
} from '@mui/material';
import {
  DirectionsCar,
  NotificationsActive,
  Security,
  Speed,
  LocationOn,
  Assignment,
} from '@mui/icons-material';
import { useEffect } from 'react';

const features = [
  {
    icon: <NotificationsActive sx={{ fontSize: 40 }} />,
    title: 'Real-Time Reporting',
    description: 'Report incidents as they happen with our easy-to-use interface.',
  },
  {
    icon: <LocationOn sx={{ fontSize: 40 }} />,
    title: 'Precise Location',
    description: 'Automatically capture and share accurate location details.',
  },
  {
    icon: <Security sx={{ fontSize: 40 }} />,
    title: 'Secure Platform',
    description: 'Your data is protected with industry-standard security measures.',
  },
  {
    icon: <Speed sx={{ fontSize: 40 }} />,
    title: 'Quick Response',
    description: 'Fast incident management and emergency response coordination.',
  },
  {
    icon: <Assignment sx={{ fontSize: 40 }} />,
    title: 'Detailed Reports',
    description: 'Comprehensive incident tracking and status updates.',
  },
  {
    icon: <DirectionsCar sx={{ fontSize: 40 }} />,
    title: 'Transport Safety',
    description: 'Promoting safer public transportation for everyone.',
  },
];

export default function Home() {
  const { data: session } = useSession();
  const router = useRouter();
  const theme = useTheme();

  useEffect(() => {
    if (session) {
      router.replace('/dashboard');
    }
  }, [session, router]);

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: `linear-gradient(to bottom, ${alpha(theme.palette.primary.main, 0.05)}, ${alpha(theme.palette.background.default, 1)})`,
    }}>
      {/* Hero Section */}
      <Container maxWidth="lg">
        <Box
          sx={{
            pt: { xs: 8, md: 12 },
            pb: { xs: 8, md: 12 },
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
          }}
        >
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 2, 
            mb: 4 
          }}>
            <DirectionsCar 
              sx={{ 
                fontSize: { xs: 40, md: 60 }, 
                color: 'primary.main' 
              }} 
            />
            <Typography
              variant="h2"
              component="h1"
              sx={{
                fontWeight: 700,
                fontSize: { xs: '2rem', md: '3.5rem' },
                background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                color: 'transparent',
                textAlign: 'center',
              }}
            >
              Transport Incident Reporter
            </Typography>
          </Box>

          <Typography
            variant="h5"
            color="text.secondary"
            sx={{ 
              mb: 6, 
              maxWidth: 'md',
              fontSize: { xs: '1.1rem', md: '1.5rem' },
              lineHeight: 1.4,
            }}
          >
            Empowering communities with real-time incident reporting and response coordination
            for safer public transportation.
          </Typography>

          <Box sx={{ 
            display: 'flex', 
            gap: 2, 
            flexDirection: { xs: 'column', sm: 'row' } 
          }}>
            <Button
              variant="contained"
              size="large"
              onClick={() => router.push('/auth/signin')}
              sx={{
                py: 2,
                px: 4,
                fontSize: '1.1rem',
                borderRadius: 2,
                textTransform: 'none',
                background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                boxShadow: `0 4px 14px ${alpha(theme.palette.primary.main, 0.35)}`,
                '&:hover': {
                  background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
                  boxShadow: `0 6px 20px ${alpha(theme.palette.primary.main, 0.4)}`,
                }
              }}
            >
              Get Started
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={() => router.push('/auth/signup')}
              sx={{
                py: 2,
                px: 4,
                fontSize: '1.1rem',
                borderRadius: 2,
                textTransform: 'none',
                borderWidth: 2,
                '&:hover': {
                  borderWidth: 2,
                }
              }}
            >
              Sign Up
            </Button>
          </Box>
        </Box>

        {/* Features Section */}
        <Box sx={{ py: { xs: 8, md: 12 } }}>
          <Typography
            variant="h3"
            component="h2"
            sx={{
              textAlign: 'center',
              mb: 8,
              fontWeight: 700,
              fontSize: { xs: '2rem', md: '2.5rem' },
            }}
          >
            Key Features
          </Typography>

          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card
                  elevation={0}
                  sx={{
                    height: '100%',
                    backgroundColor: 'transparent',
                    transition: 'transform 0.3s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                    },
                  }}
                >
                  <CardContent sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center',
                    textAlign: 'center',
                    p: 4,
                  }}>
                    <Box sx={{ 
                      color: 'primary.main',
                      mb: 2,
                      p: 2,
                      borderRadius: '50%',
                      backgroundColor: alpha(theme.palette.primary.main, 0.1),
                    }}>
                      {feature.icon}
                    </Box>
                    <Typography
                      variant="h6"
                      component="h3"
                      sx={{ mb: 1, fontWeight: 600 }}
                    >
                      {feature.title}
                    </Typography>
                    <Typography
                      variant="body1"
                      color="text.secondary"
                      sx={{ lineHeight: 1.6 }}
                    >
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Call to Action Section */}
        <Box
          sx={{
            py: { xs: 8, md: 12 },
            textAlign: 'center',
          }}
        >
          <Paper
            elevation={0}
            sx={{
              p: { xs: 4, md: 8 },
              borderRadius: 4,
              background: `linear-gradient(45deg, ${alpha(theme.palette.primary.main, 0.05)}, ${alpha(theme.palette.primary.light, 0.1)})`,
              border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
            }}
          >
            <Typography
              variant="h4"
              component="h2"
              sx={{
                mb: 3,
                fontWeight: 700,
                fontSize: { xs: '1.75rem', md: '2.25rem' },
              }}
            >
              Ready to Make Transportation Safer?
            </Typography>
            <Typography
              variant="h6"
              color="text.secondary"
              sx={{ 
                mb: 4,
                maxWidth: 'md',
                mx: 'auto',
                fontSize: { xs: '1rem', md: '1.25rem' },
                lineHeight: 1.6,
              }}
            >
              Join our community of responsible citizens and officials working together
              to improve public transport safety.
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={() => router.push('/auth/signup')}
              sx={{
                py: 2,
                px: 6,
                fontSize: '1.1rem',
                borderRadius: 2,
                textTransform: 'none',
                background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                boxShadow: `0 4px 14px ${alpha(theme.palette.primary.main, 0.35)}`,
                '&:hover': {
                  background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
                  boxShadow: `0 6px 20px ${alpha(theme.palette.primary.main, 0.4)}`,
                }
              }}
            >
              Create Account
            </Button>
          </Paper>
        </Box>
      </Container>
    </Box>
  );
}
