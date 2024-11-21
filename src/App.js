// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Register from './components/auth/register';
import Login from './components/auth/login';
import LandingPage from './components/games/LandingPage';
import TableList from './components/tables/TableList';
import JoinTable from './components/tables/JoinTable';
import Profile from './components/profile/Profile'
import TransactionHistory from './components/transactions/TransactionHistory';
import Transactions from './components/transactions/Transactions';
import Dashboard from './components/Dashboard';
import Game from './components/games/Game';
import BonusWheel from './components/games/BonusWheel';
import LotteryNumberDraw from './components/games/LotteryNumberDraw';
import FlashGridGame from './components/games/FlashGridGame';
import EntryFeeGame from './components/games/EntryFeeGame';
import SpinWheel from './components/games/SpeenWheel';
import CountdownTimer from './components/games/CountDownTimer';
import GameList from './components/games/GameList';
import RouletteGame from './components/games/RouletteGame';
import ChatGame from './components/games/ChatGame';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/tables" element={<TableList />} />
        <Route path='/account' element={<Profile/>}/>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<LandingPage />} />
        <Route path="/join/:tableId" element={<JoinTable />} />
        <Route path="/transactionsHistory" element={<TransactionHistory />} />
        <Route path="/transactions" element={<Transactions />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/game" element={<Game />} />
        <Route path="/chatgame" element={<ChatGame />} />
        <Route path='/roulette' element={<BonusWheel/>}/>
        <Route path='/roulettewheel' element={<RouletteGame/>}/>
        <Route path='/lotterynumberdraw' element = {<LotteryNumberDraw/>}/>
        <Route path='/FlashGridGame' element = {<FlashGridGame/>}/>
        <Route path='/entryFee' element = {<EntryFeeGame/>}/>
        <Route path='/spinwheel' element = {<SpinWheel/>}/>
        <Route path='/newyearbigprize' element = {<CountdownTimer/>}/>
        <Route path='/games' element = {<GameList/>}/>
      </Routes>
    </Router>
  );
}

export default App;
