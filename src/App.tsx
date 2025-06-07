import { BrowserRouter as Router, Routes, Route } from 'react-router';
import { HabitsListPage } from './components/HabitsListPage/HabitsListPage';
import HabitDetailPage from './components/HabitDetailPage/HabitDetailPage';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HabitsListPage />} />
        <Route path="/detail/:id" element={<HabitDetailPage />} />
      </Routes>
    </Router>
  )
}

export default App;
