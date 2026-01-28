import React from 'react';
import { Box, Typography, Stack, IconButton } from '@mui/material';
import { AspectRatio, Straighten } from '@mui/icons-material';
import {
    KeyboardArrowLeft,
    KeyboardArrowRight,
    TableChart,
} from '@mui/icons-material';

export const StatusBar: React.FC = () => {
    return (
        <Box
            sx={{
                height: 32,
                bgcolor: '#1e293b',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                px: 2,
                justifyContent: 'space-between',
                fontSize: 12,
            }}
        >
            <Stack direction="row" spacing={3} alignItems="center">
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        bgcolor: 'rgba(255,255,255,0.1)',
                        px: 1,
                        py: 0.5,
                        borderRadius: 1,
                        cursor: 'pointer',
                        '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' },
                    }}
                >
                    <TableChart sx={{ fontSize: 14 }} />
                    <Typography variant="caption" fontWeight="bold">
                        Preview Data
                    </Typography>
                </Box>

                <Stack direction="row" spacing={1} alignItems="center">
                    <Typography variant="caption" color="grey.400">
                        Record 1 of 424
                    </Typography>
                    <IconButton size="small" sx={{ color: 'white', p: 0 }}>
                        <KeyboardArrowLeft fontSize="small" />
                    </IconButton>
                    <IconButton size="small" sx={{ color: 'white', p: 0 }}>
                        <KeyboardArrowRight fontSize="small" />
                    </IconButton>
                </Stack>
            </Stack>

            <Stack direction="row" spacing={3}>
                <Stack direction="row" spacing={1} alignItems="center">
                    <Straighten sx={{ fontSize: 14, color: 'grey.400' }} />
                    <Typography variant="caption">
                        X: 24.5mm Y: 32.2mm
                    </Typography>
                </Stack>
                <Stack direction="row" spacing={1} alignItems="center">
                    <AspectRatio sx={{ fontSize: 14, color: 'grey.400' }} />
                    <Typography variant="caption">101.6 x 152.4 mm</Typography>
                </Stack>
            </Stack>
        </Box>
    );
};
