import React, { createContext, useContext, useCallback } from "react";
import { SnackbarProvider, useSnackbar, closeSnackbar } from "notistack";

// Create a context for easier access
const NotifierContext = createContext(null);

const NotifierProvider = ({ children }) => {
    const { enqueueSnackbar } = useSnackbar();

    // wrapper function to call anywhere
    const notify = useCallback((message, variant = "default") => {
        enqueueSnackbar(message, {
            variant,
            preventDuplicate: true,
            dense: true,
            style: {
                fontWeight: 300,
                fontSize: '1.2rem',
                minWidth: 500,
                textAlign: 'center',
            }
        });
    }, [enqueueSnackbar]);

    return (
        <NotifierContext.Provider value={notify}>
            {children}
        </NotifierContext.Provider>
    );
};

// Hook to use in components
export const useNotifier = () => {
    return useContext(NotifierContext);
};

// Wrap your app with this provider
export const Notifier = ({ children }) => (
    <SnackbarProvider
        maxSnack={5}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        autoHideDuration={3000}
        style={{
            fontSize: '16px',  // Adjust text size
        }}
        sx={{
            '& .SnackbarContent-root': {
                minWidth: '200px',       // Minimum width
                maxWidth: '350px',       // Maximum width
                padding: '8px 16px',     // Inner padding
                borderRadius: '8px',     // Rounded corners
                marginTop: '20px',       // Top margin
                marginRight: '20px',     // Right margin
            }
        }}
    >
        <NotifierProvider>{children}</NotifierProvider>
    </SnackbarProvider>
);
