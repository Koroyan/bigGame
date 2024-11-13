import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import BottomNav from '../bottomnav/BottomNav'; // Import BottomNav
import { useNavigate } from 'react-router-dom';
import '../../styles/Transactions.css'; // Ensure your CSS is linked

const Transactions = () => {
    const [form, setForm] = useState({
        amount: '', // Amount of tokens to withdraw
        toAddress: '' // Wallet address for withdrawal (Binance or external)
    });

    const [balance, setBalance] = useState(0); // User's balance
    const [from, setFrom] = useState(0); // User's balance
    const [gasFee, setGasFee] = useState(0); // Gas fee for withdrawal
    const [receivedAmount, setReceivedAmount] = useState(0); // Amount after gas fee
    const [error, setError] = useState(''); // Error message for withdrawal

    const navigate = useNavigate();

    // Create a config object with the Authorization header
    const token = localStorage.getItem('token'); // Retrieve stored token after login
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };

    useEffect(() => {
        // Fetch user balance from API (assuming there's an endpoint for it)
        const fetchUser = async () => {
            try {
                const userResponse = await api.get('/auth/user', config);
                const { walletAddress: from, privateKey, balance } = userResponse.data;
        
                setBalance(balance);
                setFrom(from);
            } catch (err) {
                console.error(err);
                // Check if the error response status is 403 (Forbidden)
                if (err.response && err.response.status === 403) {
                    alert('Access forbidden. Please check your credentials or token.');
                } else {
                    alert('Failed to fetch user data.');
                }
            }
        };
        

        fetchUser();
    }, [config]); // Add config as a dependency to useEffect

    const handleChange = e => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });

        if (name === 'amount') {
            const amount = parseFloat(value);
            calculateGasFees(amount);
            validateAmount(amount);
        }
    };

    const validateAmount = (amount) => {
        if (amount > balance) {
            setError('Withdrawal amount exceeds your balance.');
        } else {
            setError('');
        }
    };

    const calculateGasFees = (amount) => {
        const fee = amount ? parseFloat(amount) * 0.01 : 0; // Assuming 1% gas fee for withdrawal
        setGasFee(fee);
        setReceivedAmount(amount ? amount - fee : 0);
    };

    const handleSubmitWithdraw = async e => {
        e.preventDefault();
        if (error || !form.toAddress || !form.amount) return; // Prevent submission if there's an error or empty fields
    
        const amountToWithdraw = parseFloat(form.amount);
        if (isNaN(amountToWithdraw) || amountToWithdraw <= 0) {
            alert('Please enter a valid amount to withdraw.');
            return;
        }
    
        const token = localStorage.getItem('token'); // Retrieve stored token
        const config = {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        };
    
        try {
            console.log("Withdrawal Request:", {
                to: form.toAddress,
                amount: amountToWithdraw
            });
    
            const res = await api.post('/transactions/withdraw', {
                to: form.toAddress,  // Recipient address
                amount: amountToWithdraw.toString()
            }, config); // Pass config here with the token
    
            alert('Withdrawal successful! Transaction Hash: ' + res.data.receipt.transactionHash);
            navigate('/'); // Redirect after successful withdrawal
        } catch (err) {
            alert(err.response?.data?.error || 'Withdrawal failed!');
        }
    };
    
    const copyToClipboard = () => {
        const walletAddress = 'TDjfx3E8DfA1Mmz56FKH8XmNXxxxxxxx'; // Your wallet address

        if (navigator.clipboard && window.isSecureContext) {
            // Use clipboard API if available
            navigator.clipboard.writeText(walletAddress)
                .then(() => alert('Wallet address copied to clipboard!'))
                .catch(err => console.error('Failed to copy: ', err));
        } else {
            // Fallback for older browsers or when clipboard API is not available
            const textArea = document.createElement('textarea');
            textArea.value = walletAddress;
            document.body.appendChild(textArea);
            textArea.select();
            try {
                document.execCommand('copy'); // Attempt to copy the text
                alert('Wallet address copied to clipboard!');
            } catch (err) {
                console.error('Failed to copy: ', err);
            }
            document.body.removeChild(textArea);
        }
    };

    return (
        <div className="deposit-withdraw-page">
            <header className="header-section">
                <h1 className="main-title">Manage Your USDT TRON Wallet</h1>
                <p className="main-subtitle">Quickly deposit and withdraw your USDT securely</p>
            </header>

            <div className="marketing-banner">
                <h3>Make Transactions Easier with USDT TRC20</h3>
                <p>Your USDT TRON Wallet Address for Deposit: 
                    <strong onClick={copyToClipboard} className="copy-address"> {from}</strong>
                    <button onClick={copyToClipboard} className="copy-button">Copy</button>
                </p>
                <p>Fast, low-fee transactions that ensure your funds reach their destination.</p>
            </div>

            <div className="action-sections">
                <div className="withdraw-section">
                    <h2>Withdraw Funds</h2>
                    <form onSubmit={handleSubmitWithdraw}>
                        <input
                            name="amount"
                            type="number"
                            placeholder="Enter amount"
                            value={form.amount}
                            onChange={handleChange}
                            required
                        />
                        {error && <p className="error-message">{error}</p>} {/* Display error message */}
                        <input
                            name="toAddress"
                            type="text"
                            placeholder="Enter your wallet address"
                            value={form.toAddress}
                            onChange={handleChange}
                            required
                        />
                        <p>Gas Fee: {gasFee.toFixed(4)} USDT</p>
                        <p>Amount received: {receivedAmount.toFixed(4)} USDT</p>
                        <button type="submit" className="action-button withdraw-button">Withdraw</button>
                    </form>
                </div>

                <div className="deposit-section">
                    <h2>Deposit Funds</h2>
                    <p>Send your USDT (TRC20) to the following address:</p>
                    <div className="wallet-address">
                        <p><strong>{from}</strong></p>
                    </div>
                    <p>Ensure you are sending USDT via TRC20 to avoid loss of funds.</p>
                    <p>Your current balance: {balance} USDT</p>
                    <line />
                </div>
            </div>
            <BottomNav />
        </div>
    );
};

export default Transactions;
