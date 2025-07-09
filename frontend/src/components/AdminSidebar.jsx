import React from 'react';
import { Box, List, ListItem, ListItemIcon, ListItemText, Paper } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LocationCityIcon from '@mui/icons-material/LocationCity';
import AddLocationIcon from '@mui/icons-material/AddLocation';
import HotelIcon from '@mui/icons-material/Hotel';
import AddBusinessIcon from '@mui/icons-material/AddBusiness';
import TourIcon from '@mui/icons-material/Tour';
import AddIcon from '@mui/icons-material/Add';

const AdminSidebar = () => {
    const location = useLocation();
    
    const menuItems = [
        {
            text: 'Hồ sơ',
            icon: <AccountCircleIcon />,
            path: '/admin/profile'
        },
        {
            text: 'Quản lý thành phố',
            icon: <LocationCityIcon />,
            path: '/admin/manage-city'
        },
        {
            text: 'Thêm thành phố',
            icon: <AddLocationIcon />,
            path: '/admin/create-city'
        },
        {
            text: 'Quản lý khách sạn',
            icon: <HotelIcon />,
            path: '/admin/manage-hotels'
        },
        {
            text: 'Thêm khách sạn',
            icon: <AddBusinessIcon />,
            path: '/admin/manage-hotels/create-hotel'
        },
        {
            text: 'Quản lý tour',
            icon: <TourIcon />,
            path: '/admin/manage-tours'
        },
        {
            text: 'Thêm tour',
            icon: <AddIcon />,
            path: '/admin/manage-tours/create-tour'
        }
    ];

    return (
        <Paper elevation={3} sx={{ width: 240, height: '100vh', position: 'fixed' }}>
            <Box sx={{ p: 2 }}>
                <List>
                    {menuItems.map((item) => (
                        <ListItem
                            button
                            key={item.text}
                            component={Link}
                            to={item.path}
                            sx={{
                                backgroundColor: location.pathname === item.path ? 'rgba(0, 0, 0, 0.08)' : 'transparent',
                                '&:hover': {
                                    backgroundColor: 'rgba(0, 0, 0, 0.04)'
                                }
                            }}
                        >
                            <ListItemIcon>{item.icon}</ListItemIcon>
                            <ListItemText primary={item.text} />
                        </ListItem>
                    ))}
                </List>
            </Box>
        </Paper>
    );
};

export default AdminSidebar; 
 