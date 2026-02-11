import '../styles/Body.scss';
import { LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function Dashboard() {
  // Sample data for charts
  const monthlyData = [
    { month: 'Jan', requests: 65, completed: 45, pending: 20 },
    { month: 'Feb', requests: 78, completed: 62, pending: 16 },
    { month: 'Mar', requests: 90, completed: 75, pending: 15 },
    { month: 'Apr', requests: 81, completed: 70, pending: 11 },
    { month: 'May', requests: 95, completed: 85, pending: 10 },
    { month: 'Jun', requests: 105, completed: 92, pending: 13 },
  ];

  const weeklyData = [
    { day: 'Mon', value: 25 },
    { day: 'Tue', value: 35 },
    { day: 'Wed', value: 45 },
    { day: 'Thu', value: 30 },
    { day: 'Fri', value: 55 },
    { day: 'Sat', value: 40 },
    { day: 'Sun', value: 20 },
  ];

  console.log('Dashboard component rendered');
  return (
    <main className="content">
      <h1>Dashboard</h1>
      
      <div className="dashboard-grid">
        {/* Stats Cards */}
        <div className="stats-cards">
          <div className="stat-card">
            <h3>Total Requests</h3>
            <p className="stat-number">514</p>
          </div>
          <div className="stat-card">
            <h3>Completed</h3>
            <p className="stat-number">429</p>
          </div>
          <div className="stat-card">
            <h3>Pending</h3>
            <p className="stat-number">85</p>
          </div>
        </div>

        {/* Monthly Requests Line Chart */}
        <div className="chart-container">
          <h2>Monthly Requests Overview</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="completed" stroke="#096B72" strokeWidth={2} />
              <Line type="monotone" dataKey="pending" stroke="#E3655B" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Weekly Activity Bar Chart */}
        <div className="chart-container">
          <h2>Weekly Activity</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#096B72" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Area Chart */}
        <div className="chart-container">
          <h2>Request Trends</h2>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="requests" stackId="1" stroke="#096B72" fill="#096B72" fillOpacity={0.6} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </main>
  );
}

export default Dashboard;