import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserContext } from '../../context/UserContext';
import {
    AppBar,
    Toolbar,
    IconButton,
    Menu,
    MenuItem,
    Button,
    Typography,
    Drawer,
    List,
    ListItem,
    ListItemText
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import MoreVertIcon from '@mui/icons-material/MoreVert';

const Navbar = () => {
    const { user, logout } = useContext(UserContext);
    const navigate = useNavigate();
    const [profileAnchorEl, setProfileAnchorEl] = useState(null);
    const [actionsAnchorEl, setActionsAnchorEl] = useState(null);
    const [drawerOpen, setDrawerOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleProfileMenuOpen = (event) => {
        setProfileAnchorEl(event.currentTarget);
    };

    const handleActionsMenuOpen = (event) => {
        setActionsAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setProfileAnchorEl(null);
        setActionsAnchorEl(null);
    };

    const toggleDrawer = (open) => (event) => {
        if (
            event.type === 'keydown' &&
            (event.key === 'Tab' || event.key === 'Shift')
        ) {
            return;
        }
        setDrawerOpen(open);
    };

    return (
        <AppBar position="static" sx={{ backgroundColor: '#d4af37' }}>
            <Toolbar>
                {/* Hamburger Menu for small screens */}
                <IconButton
                    edge="start"
                    color="#012265"
                    aria-label="menu"
                    onClick={toggleDrawer(true)}
                    sx={{ display: { xs: 'block', md: 'none' } }}
                >
                    <MenuIcon />
                </IconButton>

                {/* Drawer for mobile navigation */}
                <Drawer
                    anchor="left"
                    open={drawerOpen}
                    onClose={toggleDrawer(false)}
                >
                    <List>
                        <ListItem button onClick={() => navigate('/')}>Home</ListItem>
                        {user && (
                            <ListItem button onClick={() => navigate('/MyMatches')}>
                                My Matches
                            </ListItem>
                        )}
                        {user && user.role === 'ADMIN' && (
                            <ListItem button onClick={handleActionsMenuOpen}>
                                Actions
                            </ListItem>
                        )}
                    </List>
                </Drawer>

                {/* Title and main links for larger screens */}
                <Typography
                    variant="h6"
                    component="div"
                    color = "#012265"
                    sx={{ flexGrow: 1, display: { xs: 'none', md: 'block' } }}
                >
                    Excalibur's Scouting System
                </Typography>

                <Button color="#012265" onClick={() => navigate('/')}>Home</Button>
                {user && (
                    <Button color="#012265" onClick={() => navigate('/MyMatches')}>
                        My Matches
                    </Button>
                )}
                {user && user.role === 'ADMIN' && (
                    <Button
                        color="inherit"
                        onClick={handleActionsMenuOpen}
                        endIcon={<MoreVertIcon />}
                    >
                        Actions
                    </Button>
                )}

                {/* Actions Dropdown */}
                <Menu
                    anchorEl={actionsAnchorEl}
                    open={Boolean(actionsAnchorEl)}
                    onClose={handleMenuClose}
                >
                    <MenuItem onClick={() => navigate('/manage-users')}>Manage Users</MenuItem>
                    <MenuItem onClick={() => navigate('/assign')}>Assign Matches</MenuItem>
                </Menu>

                {/* Profile Dropdown */}
                {user ? (
                    <>
                        <IconButton
                            color="inherit"
                            onClick={handleProfileMenuOpen}
                        >
                            <AccountCircleIcon />
                        </IconButton>
                        <Menu
                            anchorEl={profileAnchorEl}
                            open={Boolean(profileAnchorEl)}
                            onClose={handleMenuClose}
                        >
                            <MenuItem onClick={() => navigate('/profile')}>View Profile</MenuItem>
                            <MenuItem onClick={handleLogout}>Logout</MenuItem>
                        </Menu>
                    </>
                ) : (
                    <Button color="inherit" onClick={() => navigate('/login')}>
                        Login
                    </Button>
                )}
            </Toolbar>
        </AppBar>
    );
};

export default Navbar;
