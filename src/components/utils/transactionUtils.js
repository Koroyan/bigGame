import api from '../../services/api'; // Assuming api is already set up

// Function to get the authentication configuration
export const getAuthConfig = () => {
    const token = localStorage.getItem('token');
    return {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
};

// Fetch user details (specifically wallet address)
export const fetchUser = async () => {
    try {
        const config = getAuthConfig(); // Get the config with token
        const response = await api.get('/auth/user', config); // Fetch user data

        return { success: true, data: response.data }; // Return successful response
    } catch (err) {
        // Capture the error message, status code, and response data
        const errorMsg = err.response?.data?.message || err.message || 'Unknown error';
        const statusCode = err.response?.status || 'Unknown status code';
        const details = err.response?.data || null; // Include any extra details from the error response

        console.error('Error fetching user data:', errorMsg, 'Status code:', statusCode);

        // Return error response with message, status code, and details
        return {
            success: false,
            error: {
                message: errorMsg,
                statusCode,
                details
            }
        };
    }
};

// Fetch user balance
export const fetchBalance = async () => {
    try {
        const config = getAuthConfig(); // Get config with the token
        const response = await api.get('/transactionstrc20/balance', {
            headers: config.headers
        });

        // Check if the response contains a valid balance value
        if (response.data?.balance !== undefined) {
            return { success: true, data: response.data.balance }; // Return successful response
        } else {
            throw new Error('Balance is not available in the response');
        }
    } catch (err) {
        // Capture the error message, status code, and response data
        const errorMsg = err.response?.data?.message || err.message || 'Unknown error';
        const statusCode = err.response?.status || 'Unknown status code';
        const details = err.response?.data || null; // Include any extra details from the error response

        console.error('Error fetching balance:', errorMsg, 'Status code:', statusCode);

        // Return error response with message, status code, and details
        return {
            success: false,
            error: {
                message: errorMsg,
                statusCode,
                details
            }
        };
    }
};

// Updated withdrawFunds method
export const withdrawFunds = async (toAddress, amount) => {
    try {
        const config = getAuthConfig(); // Get config with the token
        const response = await api.post('/transactionstrc20/withdraw', {
            to: toAddress,
            amount: amount.toString(),
        }, config);

        // If the response indicates failure, throw an error
        if (response.data.error) {
            throw new Error(`Transaction failed: ${response.data.error}`);
        }

        // Assuming the response contains the txid under 'result'
        if (response.data.result?.txid) {
            return { success: true, data: response.data.result.txid }; // Return successful response
        } else {
            throw new Error('No transaction ID returned from server');
        }
    } catch (err) {
        const errorMsg = err.response?.data?.message || err.message || 'Unknown error';
        const statusCode = err.response?.status || 'Unknown status code';
        const details = err.response?.data || null;

        console.error('Error during withdrawal:', errorMsg, 'Status code:', statusCode);

        // Return error response with message, status code, and details
        return {
            success: false,
            error: {
                message: errorMsg,
                statusCode,
                details
            }
        };
    }
};

