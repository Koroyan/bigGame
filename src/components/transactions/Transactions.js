import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../bottomnav/BottomNav';
import '../../styles/Transactions.css';
import { getAuthConfig, fetchBalance, withdrawFunds, fetchUser } from '../utils/transactionUtils';

const Transactions = () => {
    const [form, setForm] = useState({
        amount: '1',
        toAddress: 'TR3EnoaAyoAzSDQpA41KoBn8dEAnYX8TVo'
    });
    const [balance, setBalance] = useState(0);
    const [from, setFrom] = useState('');
    const [gasFee, setGasFee] = useState(0);
    const [receivedAmount, setReceivedAmount] = useState(0);
    const [error, setError] = useState('');
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const userResponse = await fetchUser();
                if (userResponse.success) {
                    setIsLoggedIn(true);
                    const userWalletAddress = userResponse.data.walletAddress;
                    setFrom(userWalletAddress);

                    const userBalance = await fetchBalance();
                    if (userBalance && userBalance.data !== undefined) {
                        setBalance(userBalance.data);
                    }
                } else {
                    setIsLoggedIn(false);
                }
            } catch (err) {
                console.error(err);
                setIsLoggedIn(false);
            }
        };

        fetchUserData();
    }, []);

    const handleChange = (e) => {
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
        const fee = amount ? parseFloat(amount) * 0.01 : 0;
        setGasFee(fee);
        setReceivedAmount(amount ? amount - fee : 0);
    };

    const handleSubmitWithdraw = async (e) => {
        e.preventDefault();
        if (error || !form.toAddress || !form.amount) return;

        const amountToWithdraw = parseFloat(form.amount);
        if (isNaN(amountToWithdraw) || amountToWithdraw <= 0) {
            alert('Please enter a valid amount to withdraw.');
            return;
        }

        try {
            const result = await withdrawFunds(form.toAddress, amountToWithdraw);
            if (result.success) {
                alert('Withdrawal successful! txid: ' + result.data);
            } else {
                alert('Error during withdrawal: ' + result.error.message);
            }
        } catch (err) {
            console.error('Error during withdrawal:', err);
            alert('An unexpected error occurred during the withdrawal process. Please try again later.');
        }
    };

    const copyToClipboard = () => {
        const walletAddress = from;

        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard
                .writeText(walletAddress)
                .then(() => alert('Wallet address copied to clipboard!'))
                .catch((err) => console.error('Failed to copy: ', err));
        } else {
            const textArea = document.createElement('textarea');
            textArea.value = walletAddress;
            document.body.appendChild(textArea);
            textArea.select();
            try {
                document.execCommand('copy');
                alert('Wallet address copied to clipboard!');
            } catch (err) {
                console.error('Failed to copy: ', err);
            }
            document.body.removeChild(textArea);
        }
    };



    return (
        <div className="transaction-page">
            <header className="header-section">
                <h1 className="main-title">Manage Your USDT TRON Wallet</h1>
                <p className="main-subtitle">Easily deposit and withdraw USDT securely</p>
            </header>
            <div className="marketing-banner">
                <h3>Make Transactions Easy with USDT TRC20</h3>
                <p>
                    Your USDT TRON Wallet Address for Deposit:
                    <strong onClick={copyToClipboard} className="copy-address">
                        {' '}
                        {from}
                    </strong>
                </p>
                <p>Fast, low-fee transactions that ensure your funds reach their destination.</p>
            </div>

            <div className="transaction-form-container">
                <div className="game-card">
                    <h2 className="game-card-title">Withdraw Funds</h2>
                    <form onSubmit={handleSubmitWithdraw}>
                        <input
                            name="amount"
                            type="number"
                            placeholder="Enter amount"
                            value={form.amount}
                            onChange={handleChange}
                            required
                        />
                        {error && <p className="error-message">{error}</p>}
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
                        <button type="submit" className="game-card-btn">
                            Withdraw
                        </button>
                    </form>
                </div>

                <div className="game-card">
                    <h2 className="game-card-title">Deposit Funds</h2>
                    <p>Send your USDT (TRC20) to the following address:</p>
                    <div className="wallet-address">
                        <p>
                            <strong>{from}</strong>
                        </p>
                    </div>
                    <p>Ensure you are sending USDT via TRC20 to avoid loss of funds.</p>
                    <p>Your current balance: {balance} USDT</p>
                </div>
            </div>

            <BottomNav />
        </div>
    );
};

export default Transactions;
