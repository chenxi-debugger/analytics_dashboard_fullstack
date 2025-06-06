import { styled } from '@mui/material/styles';
import { Box } from '@mui/material';

// Single styled component with props to handle different sections
const StyledFooter = styled(Box)(({ theme, variant }) => ({
  ...(variant === 'container' && {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px',
    backgroundColor: theme.palette.background.paper, // Use theme background
    position: 'fixed',
    bottom: 0,
    width: '100vw',
    boxSizing: 'border-box',
    paddingRight: '180px',
    paddingLeft: '28px',
  }),
  ...(variant === 'left' && {
    display: 'flex',
    alignItems: 'center',
  }),
  ...(variant === 'links' && {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '10px',
  }),
}));

export default StyledFooter;