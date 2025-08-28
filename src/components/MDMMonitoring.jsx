import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config/apiUrl';
import {
    Activity, HardDrive, Cpu, Wifi, Battery, Thermometer,
    Clock, AlertCircle, CheckCircle, XCircle, TrendingUp,
    TrendingDown, Server, Smartphone, Database, BarChart3
} from 'lucide-react';
import { format } from 'date-fns';
import {
    LineChart, Line, AreaChart, Area, BarChart, Bar,
    PieChart, Pie, Cell, ResponsiveContainer,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts';

const MDMMonitoring = ({ devices, propertyId }) => {
    const [metrics, setMetrics] = useState({
        systemHealth: [],
        networkStats: [],
        commandHistory: [],
        errorLogs: [],
        performanceData: []
    });
    const [selectedTimeRange, setSelectedTimeRange] = useState('24h');
    const [loading, setLoading] = useState(true);
    const [selectedMetric, setSelectedMetric] = useState('overview');

    useEffect(() => {
        fetchMonitoringData();
        const interval = setInterval(fetchMonitoringData, 60000); // Update every minute
        return () => clearInterval(interval);
    }, [propertyId, selectedTimeRange]);

    const fetchMonitoringData = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(
                `${API_BASE_URL}/api/mdm/properties/${propertyId}/monitoring?range=${selectedTimeRange}`,
                { headers: { 'Authorization': `Bearer ${token}` }}
            );
            
            if (response.ok) {
                const data = await response.json();
                setMetrics(data.data || metrics);
            }
        } catch (error) {
            console.error('Error fetching monitoring data:', error);
        } finally {
            setLoading(false);
        }
    };

    // Calculate aggregate metrics
    const calculateMetrics = () => {
        const online = devices.filter(d => d.device_status === 'online').length;
        const total = devices.length;
        const uptime = total > 0 ? (online / total * 100).toFixed(1) : 0;
        
        const avgBattery = devices
            .filter(d => d.battery_level)
            .reduce((sum, d) => sum + d.battery_level, 0) / devices.filter(d => d.battery_level).length || 0;
        
        const avgStorage = devices
            .filter(d => d.storage_available && d.storage_total)
            .reduce((sum, d) => sum + (d.storage_available / d.storage_total * 100), 0) / 
            devices.filter(d => d.storage_available).length || 0;

        return {
            uptime,
            avgBattery: avgBattery.toFixed(1),
            avgStorage: avgStorage.toFixed(1),
            online,
            offline: total - online,
            total
        };
    };

    const stats = calculateMetrics();

    // Prepare chart data
    const deviceStatusData = [
        { name: 'Online', value: stats.online, color: '#10b981' },
        { name: 'Offline', value: stats.offline, color: '#ef4444' }
    ];

    const batteryDistribution = devices
        .filter(d => d.battery_level)
        .map(d => ({
            name: d.device_name,
            battery: d.battery_level,
            status: d.battery_level > 20 ? 'good' : 'low'
        }));

    const storageUsage = devices
        .filter(d => d.storage_total)
        .map(d => ({
            name: d.device_name,
            used: ((d.storage_total - d.storage_available) / 1073741824).toFixed(2), // Convert to GB
            free: (d.storage_available / 1073741824).toFixed(2)
        }));

    // Time series data for performance metrics
    const performanceTimeSeries = metrics.performanceData || [];

    const MetricCard = ({ icon: Icon, label, value, trend, color = 'blue' }) => (
        <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between mb-2">
                <Icon className={`h-5 w-5 text-${color}-500`} />
                {trend !== undefined && (
                    trend > 0 ? 
                        <TrendingUp className="h-4 w-4 text-green-500" /> : 
                        <TrendingDown className="h-4 w-4 text-red-500" />
                )}
            </div>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-sm text-gray-600">{label}</p>
        </div>
    );

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Time Range Selector */}
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">System Monitoring</h2>
                <div className="flex space-x-2">
                    {['1h', '24h', '7d', '30d'].map(range => (
                        <button
                            key={range}
                            onClick={() => setSelectedTimeRange(range)}
                            className={`px-3 py-1 rounded ${
                                selectedTimeRange === range
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                        >
                            {range}
                        </button>
                    ))}
                </div>
            </div>

            {/* Key Metrics Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <MetricCard
                    icon={Activity}
                    label="System Uptime"
                    value={`${stats.uptime}%`}
                    color="green"
                />
                <MetricCard
                    icon={Battery}
                    label="Avg Battery"
                    value={`${stats.avgBattery}%`}
                    color="blue"
                />
                <MetricCard
                    icon={HardDrive}
                    label="Avg Storage Free"
                    value={`${stats.avgStorage}%`}
                    color="purple"
                />
                <MetricCard
                    icon={Wifi}
                    label="Connected"
                    value={`${stats.online}/${stats.total}`}
                    color="indigo"
                />
            </div>

            {/* Metric Tabs */}
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                    {['overview', 'performance', 'network', 'storage', 'commands', 'errors'].map(metric => (
                        <button
                            key={metric}
                            onClick={() => setSelectedMetric(metric)}
                            className={`py-2 px-1 border-b-2 font-medium text-sm capitalize ${
                                selectedMetric === metric
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            {metric}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Metric Content */}
            <div className="bg-white rounded-lg shadow p-6">
                {selectedMetric === 'overview' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Device Status Pie Chart */}
                        <div>
                            <h3 className="text-lg font-medium mb-4">Device Status</h3>
                            <ResponsiveContainer width="100%" height={250}>
                                <PieChart>
                                    <Pie
                                        data={deviceStatusData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {deviceStatusData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Device Health Matrix */}
                        <div>
                            <h3 className="text-lg font-medium mb-4">Device Health Matrix</h3>
                            <div className="space-y-2 max-h-64 overflow-y-auto">
                                {devices.map(device => (
                                    <div key={device.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                                        <div className="flex items-center space-x-3">
                                            <div className={`h-2 w-2 rounded-full ${
                                                device.device_status === 'online' ? 'bg-green-500' : 'bg-red-500'
                                            }`} />
                                            <span className="text-sm font-medium">{device.device_name}</span>
                                        </div>
                                        <div className="flex items-center space-x-4 text-xs text-gray-600">
                                            {device.battery_level && (
                                                <span className="flex items-center">
                                                    <Battery className="h-3 w-3 mr-1" />
                                                    {device.battery_level}%
                                                </span>
                                            )}
                                            {device.cpu_usage && (
                                                <span className="flex items-center">
                                                    <Cpu className="h-3 w-3 mr-1" />
                                                    {device.cpu_usage}%
                                                </span>
                                            )}
                                            {device.temperature && (
                                                <span className="flex items-center">
                                                    <Thermometer className="h-3 w-3 mr-1" />
                                                    {device.temperature}°C
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {selectedMetric === 'performance' && (
                    <div>
                        <h3 className="text-lg font-medium mb-4">Performance Metrics</h3>
                        {performanceTimeSeries.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={performanceTimeSeries}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis 
                                        dataKey="timestamp" 
                                        tickFormatter={(time) => format(new Date(time), 'HH:mm')}
                                    />
                                    <YAxis />
                                    <Tooltip 
                                        labelFormatter={(time) => format(new Date(time), 'PPp')}
                                    />
                                    <Legend />
                                    <Line type="monotone" dataKey="cpu" stroke="#8884d8" name="CPU %" />
                                    <Line type="monotone" dataKey="memory" stroke="#82ca9d" name="Memory %" />
                                    <Line type="monotone" dataKey="disk" stroke="#ffc658" name="Disk I/O" />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <p className="text-gray-500">No performance data available for selected time range</p>
                        )}
                    </div>
                )}

                {selectedMetric === 'network' && (
                    <div>
                        <h3 className="text-lg font-medium mb-4">Network Statistics</h3>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div>
                                <h4 className="text-sm font-medium text-gray-700 mb-2">Connection Status</h4>
                                <div className="space-y-2">
                                    {devices.map(device => (
                                        <div key={device.id} className="flex items-center justify-between">
                                            <span className="text-sm">{device.device_name}</span>
                                            <div className="flex items-center space-x-2">
                                                {device.wifi_signal && (
                                                    <div className="flex items-center">
                                                        <Wifi className="h-4 w-4 mr-1 text-gray-600" />
                                                        <span className="text-xs">{device.wifi_signal}dBm</span>
                                                    </div>
                                                )}
                                                <span className={`text-xs px-2 py-1 rounded ${
                                                    device.network_status === 'connected' 
                                                        ? 'bg-green-100 text-green-800' 
                                                        : 'bg-red-100 text-red-800'
                                                }`}>
                                                    {device.network_status || 'unknown'}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <h4 className="text-sm font-medium text-gray-700 mb-2">Data Usage (Last 24h)</h4>
                                {metrics.networkStats?.length > 0 ? (
                                    <ResponsiveContainer width="100%" height={200}>
                                        <AreaChart data={metrics.networkStats}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="time" />
                                            <YAxis />
                                            <Tooltip />
                                            <Area type="monotone" dataKey="download" stackId="1" stroke="#8884d8" fill="#8884d8" />
                                            <Area type="monotone" dataKey="upload" stackId="1" stroke="#82ca9d" fill="#82ca9d" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <p className="text-gray-500">No network data available</p>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {selectedMetric === 'storage' && (
                    <div>
                        <h3 className="text-lg font-medium mb-4">Storage Usage</h3>
                        {storageUsage.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={storageUsage}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis label={{ value: 'GB', angle: -90, position: 'insideLeft' }} />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="used" stackId="a" fill="#ef4444" name="Used (GB)" />
                                    <Bar dataKey="free" stackId="a" fill="#10b981" name="Free (GB)" />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <p className="text-gray-500">No storage data available</p>
                        )}
                    </div>
                )}

                {selectedMetric === 'commands' && (
                    <div>
                        <h3 className="text-lg font-medium mb-4">Command History</h3>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Device</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Command</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {metrics.commandHistory?.map((cmd, idx) => (
                                        <tr key={idx} className="hover:bg-gray-50">
                                            <td className="px-4 py-2 text-sm text-gray-900">
                                                {format(new Date(cmd.timestamp), 'HH:mm:ss')}
                                            </td>
                                            <td className="px-4 py-2 text-sm text-gray-900">{cmd.device_name}</td>
                                            <td className="px-4 py-2 text-sm text-gray-900">{cmd.command_type}</td>
                                            <td className="px-4 py-2">
                                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                                    cmd.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                    cmd.status === 'failed' ? 'bg-red-100 text-red-800' :
                                                    cmd.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-gray-100 text-gray-800'
                                                }`}>
                                                    {cmd.status === 'completed' && <CheckCircle className="h-3 w-3 mr-1" />}
                                                    {cmd.status === 'failed' && <XCircle className="h-3 w-3 mr-1" />}
                                                    {cmd.status === 'pending' && <Clock className="h-3 w-3 mr-1" />}
                                                    {cmd.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-2 text-sm text-gray-900">{cmd.duration || '-'}ms</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {(!metrics.commandHistory || metrics.commandHistory.length === 0) && (
                                <p className="text-center py-4 text-gray-500">No command history available</p>
                            )}
                        </div>
                    </div>
                )}

                {selectedMetric === 'errors' && (
                    <div>
                        <h3 className="text-lg font-medium mb-4">Error Logs</h3>
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                            {metrics.errorLogs?.map((error, idx) => (
                                <div key={idx} className="border-l-4 border-red-500 bg-red-50 p-4 rounded">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                                            <span className="font-medium text-red-900">{error.device_name}</span>
                                        </div>
                                        <span className="text-xs text-gray-500">
                                            {format(new Date(error.timestamp), 'PPp')}
                                        </span>
                                    </div>
                                    <p className="mt-2 text-sm text-red-700">{error.message}</p>
                                    {error.details && (
                                        <pre className="mt-2 text-xs text-gray-600 bg-white p-2 rounded overflow-x-auto">
                                            {JSON.stringify(error.details, null, 2)}
                                        </pre>
                                    )}
                                </div>
                            ))}
                            {(!metrics.errorLogs || metrics.errorLogs.length === 0) && (
                                <p className="text-center py-4 text-gray-500">No errors in selected time range</p>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Real-time Status Indicators */}
            <div className="bg-white rounded-lg shadow p-4">
                <h3 className="text-lg font-medium mb-4">Real-time Status</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="flex items-center space-x-2">
                        <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-sm">System Operational</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Server className="h-4 w-4 text-gray-600" />
                        <span className="text-sm">MDM Server: Connected</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Database className="h-4 w-4 text-gray-600" />
                        <span className="text-sm">Database: Healthy</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Activity className="h-4 w-4 text-gray-600" />
                        <span className="text-sm">Last Update: {format(new Date(), 'HH:mm:ss')}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MDMMonitoring;