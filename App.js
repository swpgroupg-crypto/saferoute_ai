import React, { useState, useEffect } from "react";
import axios from "axios";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "./App.css";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const API_URL = process.env.REACT_APP_BACKEND_URL
  ? process.env.REACT_APP_BACKEND_URL + "/api"
  : "http://localhost:8001/api";

const SA_CENTER = [-28.5, 24.5];
const SA_BOUNDS = [
  [-35, 16],
  [-22, 33],
];

function App() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("login");
  const [showRegister, setShowRegister] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      axios
        .get(`${API_URL}/auth/me`)
        .then((res) => {
          setUser(res.data);
          setActiveTab("dashboard");
        })
        .catch(() => {
          localStorage.removeItem("token");
          delete axios.defaults.headers.common["Authorization"];
        });
    }
  }, []);
 
  const logout = () => {
    localStorage.removeItem("token");
    delete axios.defaults.headers.common["Authorization"];
    setUser(null);
    setActiveTab("login");
  };

  if (!user) {
    return showRegister ? (
      
      <RegisterPage
        onBack={() => setShowRegister(false)}
        onSuccess={() => setShowRegister(false)}
      />
      
    ) : (
      <LoginPage
        onRegister={() => setShowRegister(true)}
        onLogin={(userData) => {
          setUser(userData);
          setActiveTab("dashboard");
          console.log("i entered");
        }}
      />
    );
    
  }
 

  return (
    <div className="app">
      <header className="header">
        <div className="header-left">
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
            />
          </svg>
          <div>
            <h1>SafeRoute AI</h1>
            <span>South Africa</span>
          </div>
        </div>
        <nav className="nav">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={activeTab === "dashboard" ? "active" : ""}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab("events")}
            className={activeTab === "events" ? "active" : ""}
          >
            Events
          </button>
          <button
            onClick={() => setActiveTab("routes")}
            className={activeTab === "routes" ? "active" : ""}
          >
            Routes
          </button>
          <button
            onClick={() => setActiveTab("alerts")}
            className={activeTab === "alerts" ? "active" : ""}
          >
            Alerts
          </button>
          <button
            onClick={() => setActiveTab("chat")}
            className={activeTab === "chat" ? "active" : ""}
          >
            AI Chat
          </button>
        </nav>
        <div className="header-right">
          <div className="user-info">
            <span>{user.full_name}</span>
            <small>{user.role}</small>
          </div>
          <button onClick={logout} className="logout-btn">
            Logout
          </button>
        </div>
      </header>

      <main className="main-content">
        {activeTab === "dashboard" && <Dashboard />}
        {activeTab === "events" && <Events user={user} />}
        {activeTab === "routes" && <Routes user={user} />}
        {activeTab === "alerts" && <Alerts user={user} />}
        {activeTab === "chat" && <AIChat />}
      </main>
    </div>
  );
}

function LoginPage({ onRegister, onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/auth/login`, {
        email,
        password,
      });
      localStorage.setItem("token", res.data.access_token);
      axios.defaults.headers.common["Authorization"] =
        `Bearer ${res.data.access_token}`;
      onLogin(res.data.user);
    } catch (error) {
      alert(
        "Login failed: " +
          (error.response?.data?.detail || "Check credentials"),
      );
    }
    setLoading(false);
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="logo">
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
            />
          </svg>
          <h1>SafeRoute AI</h1>
        </div>
        <p className="subtitle">South Africa Risk Prediction Platform</p>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
        <button onClick={onRegister} className="register-link">
          Create New Account
        </button>
      </div>
    </div>
  );
}

function RegisterPage({ onBack, onSuccess }) {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    full_name: "",
    phone: "",
    role: "Public User",
    institution: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${API_URL}/auth/register`, {
        ...formData,
        is_active: true,
      });
      alert("Registration successful! Please login.");
      onSuccess();
    } catch (error) {
      console.error("Registration error:", error);
      alert(
        "Registration failed: " + (error.response?.data?.detail || error.message || "Try again"),
      );
    }
    setLoading(false);
  };

  return (
    <div className="login-container">
      <div className="login-box register-box">
        <h2>Create Account</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Full Name"
            value={formData.full_name}
            onChange={(e) =>
              setFormData({ ...formData, full_name: e.target.value })
            }
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            required
          />
          <input
            type="password"
            placeholder="Password (min 6 characters)"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            required
            minLength={6}
          />
          <input
            type="tel"
            placeholder="Phone (optional)"
            value={formData.phone}
            onChange={(e) =>
              setFormData({ ...formData, phone: e.target.value })
            }
          />
          <select
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
          >
            <option value="Public User">Public User</option>
            <option value="Institution Admin">Institution Admin</option>
            <option value="Government Authority">Government Authority</option>
            <option value="Transport Operator">Transport Operator</option>
          </select>
          {(formData.role === "Institution Admin" ||
            formData.role === "Government Authority") && (
            <input
              type="text"
              placeholder="Institution/Organization"
              value={formData.institution}
              onChange={(e) =>
                setFormData({ ...formData, institution: e.target.value })
              }
            />
          )}
          <button type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create Account"}
          </button>
        </form>
        <button onClick={onBack} className="back-link">
          Back to Login
        </button>
      </div>
    </div>
  );
}

function Dashboard() {
  const [status, setStatus] = useState(null);
  const [events, setEvents] = useState([]);
  const [weather, setWeather] = useState({});
  const [traffic, setTraffic] = useState([]);

  useEffect(() => {
    axios
      .get(`${API_URL}/dashboard/status`)
      .then((res) => setStatus(res.data))
      .catch(console.error);
    axios
      .get(`${API_URL}/events?limit=50`)
      .then((res) => setEvents(res.data))
      .catch(console.error);
    axios
      .get(`${API_URL}/weather`)
      .then((res) => setWeather(res.data))
      .catch(() => {});
    axios
      .get(`${API_URL}/traffic`)
      .then((res) => setTraffic(res.data.traffic_incidents || []))
      .catch(() => {});
  }, []);

  if (!status) return <div className="loading">Loading...</div>;

  const activeEvents = events.filter(
    (e) => e.status === "ACTIVE" && e.latitude && e.longitude,
  );

  return (
    <div className="dashboard">
      <h2>South Africa Risk Dashboard</h2>
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Threat Level</h3>
          <div
            className={`threat-level ${status.overall_threat_level.toLowerCase()}`}
          >
            {status.overall_threat_level}
          </div>
        </div>
        <div className="stat-card">
          <h3>Active Events</h3>
          <div className="stat-value">{status.active_events_count}</div>
        </div>
        <div className="stat-card">
          <h3>High Risk</h3>
          <div className="stat-value danger">
            {status.high_risk_events_count}
          </div>
        </div>
        <div className="stat-card">
          <h3>Routes</h3>
          <div className="stat-value">{status.routes_monitored}</div>
        </div>
      </div>

      <h3>South Africa Incident Map</h3>
      <div
        className="map-container"
        style={{ height: "500px", marginBottom: "2rem" }}
      >
        <MapContainer
          center={SA_CENTER}
          zoom={6}
          minZoom={5}
          maxBounds={SA_BOUNDS}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap"
          />
          {activeEvents.map((event) => (
            <Marker key={event.id} position={[event.latitude, event.longitude]}>
              <Popup>
                <div className="map-popup">
                  <strong>{event.title}</strong>
                  <br />
                  <span
                    className={`severity-badge ${event.severity.toLowerCase()}`}
                  >
                    {event.severity}
                  </span>
                  <br />
                  {event.location}
                  <br />
                  <small>{event.event_type}</small>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      <h3>Recent Risk Updates</h3>
      <div className="events-list">
        {events
          .filter((e) => e.status === "ACTIVE")
          .slice(0, 5)
          .map((event) => (
            <div key={event.id} className="event-card">
              <span
                className={`severity-badge ${event.severity.toLowerCase()}`}
              >
                {event.severity}
              </span>
              <div className="event-info">
                <h4>{event.title}</h4>
                <p>{event.description}</p>
                <small>{event.location}</small>
              </div>
            </div>
          ))}
      </div>

      <div className="info-grid">
        <div className="info-section">
          <h3>Weather Conditions</h3>
          <div className="weather-grid">
            {Object.entries(weather).map(([city, data]) => (
              <div key={city} className="weather-card">
                <h4>{data.city}</h4>
                <div className="weather-temp">{data.temperature}°C</div>
                <div className="weather-condition">{data.conditions}</div>
                <small>
                  Humidity: {data.humidity}% | Wind: {data.wind_speed} km/h
                </small>
              </div>
            ))}
          </div>
        </div>

        <div className="info-section">
          <h3>Live Traffic Updates</h3>
          <div className="traffic-list">
            {traffic.slice(0, 4).map((incident) => (
              <div key={incident.id} className="traffic-item">
                <span
                  className={`severity-badge ${incident.severity.toLowerCase()}`}
                >
                  {incident.type}
                </span>
                <div>
                  <strong>{incident.location}</strong>
                  <p>{incident.description}</p>
                  <small>Delay: ~{incident.estimated_delay_min} min</small>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Events({ user }) {
  const [events, setEvents] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    event_type: "Traffic Congestion",
    severity: "MODERATE",
    location: "",
    latitude: "",
    longitude: "",
  });

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = () => {
    axios.get(`${API_URL}/events`).then((res) => setEvents(res.data));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/events`, {
        ...formData,
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
      });
      alert("Event created successfully!");
      setShowForm(false);
      setFormData({
        title: "",
        description: "",
        event_type: "Traffic Congestion",
        severity: "MODERATE",
        location: "",
        latitude: "",
        longitude: "",
      });
      loadEvents();
    } catch (error) {
      alert("Failed to create event");
    }
  };

  const updateStatus = (id, status) => {
    axios.put(`${API_URL}/events/${id}`, { status }).then(() => loadEvents());
  };

  const deleteEvent = (id) => {
    if (window.confirm("Delete this event?")) {
      axios.delete(`${API_URL}/events/${id}`).then(() => loadEvents());
    }
  };

  return (
    <div className="events">
      <div className="section-header">
        <h2>Events Management</h2>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          {showForm ? "Cancel" : "+ Add Event"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="event-form">
          <input
            type="text"
            placeholder="Title"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            required
          />
          <textarea
            placeholder="Description"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            required
          />
          <select
            value={formData.event_type}
            onChange={(e) =>
              setFormData({ ...formData, event_type: e.target.value })
            }
          >
            <option value="Traffic Congestion">Traffic Congestion</option>
            <option value="Accident">Accident</option>
            <option value="Protest">Protest</option>
            <option value="Police Activity">Police Activity</option>
            <option value="Construction">Construction</option>
            <option value="Weather Alert">Weather Alert</option>
          </select>
          <select
            value={formData.severity}
            onChange={(e) =>
              setFormData({ ...formData, severity: e.target.value })
            }
          >
            <option value="LOW">Low</option>
            <option value="MODERATE">Moderate</option>
            <option value="HIGH">High</option>
            <option value="CRITICAL">Critical</option>
          </select>
          <input
            type="text"
            placeholder="Location"
            value={formData.location}
            onChange={(e) =>
              setFormData({ ...formData, location: e.target.value })
            }
            required
          />
          <input
            type="number"
            step="any"
            placeholder="Latitude (optional)"
            value={formData.latitude}
            onChange={(e) =>
              setFormData({ ...formData, latitude: e.target.value })
            }
          />
          <input
            type="number"
            step="any"
            placeholder="Longitude (optional)"
            value={formData.longitude}
            onChange={(e) =>
              setFormData({ ...formData, longitude: e.target.value })
            }
          />
          <button type="submit" className="btn-primary">
            Create Event
          </button>
        </form>
      )}

      <div className="events-grid">
        {events.map((event) => (
          <div key={event.id} className="event-item">
            <div className="event-header">
              <span
                className={`severity-badge ${event.severity.toLowerCase()}`}
              >
                {event.severity}
              </span>
              <span className={`status-badge ${event.status.toLowerCase()}`}>
                {event.status}
              </span>
            </div>
            <h3>{event.title}</h3>
            <p>{event.description}</p>
            <div className="event-meta">
              <span className="location">{event.location}</span>
              <span className="type">{event.event_type}</span>
            </div>
            {event.ai_analysis && (
              <div className="ai-analysis">
                <strong>AI Risk Analysis:</strong>
                <p>{event.ai_analysis}</p>
              </div>
            )}
            {event.latitude && event.longitude && (
              <button
                onClick={() => setSelectedEvent(event)}
                className="btn-small"
              >
                View on Map
              </button>
            )}
            <div className="event-actions">
              {event.status === "ACTIVE" && (
                <button
                  onClick={() => updateStatus(event.id, "RESOLVED")}
                  className="btn-small"
                >
                  Mark Resolved
                </button>
              )}
              <button
                onClick={() => deleteEvent(event.id)}
                className="btn-small btn-danger"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {selectedEvent && (
        <div className="modal" onClick={() => setSelectedEvent(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>{selectedEvent.title}</h3>
            <div style={{ height: "400px", marginTop: "1rem" }}>
              <MapContainer
                center={[selectedEvent.latitude, selectedEvent.longitude]}
                zoom={13}
                style={{ height: "100%", width: "100%" }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution="&copy; OpenStreetMap"
                />
                <Marker
                  position={[selectedEvent.latitude, selectedEvent.longitude]}
                >
                  <Popup>
                    <strong>{selectedEvent.title}</strong>
                    <br />
                    {selectedEvent.location}
                    <br />
                    Severity: {selectedEvent.severity}
                  </Popup>
                </Marker>
              </MapContainer>
            </div>
            <button
              onClick={() => setSelectedEvent(null)}
              className="btn-primary"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Routes({ user }) {
  const [routes, setRoutes] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    origin: "",
    destination: "",
    distance_km: "",
    estimated_time_min: "",
  });

  useEffect(() => {
    axios.get(`${API_URL}/routes`).then((res) => setRoutes(res.data));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/routes`, {
        ...formData,
        distance_km: formData.distance_km
          ? parseFloat(formData.distance_km)
          : null,
        estimated_time_min: formData.estimated_time_min
          ? parseInt(formData.estimated_time_min)
          : null,
      });
      alert("Route created! AI analyzing safety...");
      setShowForm(false);
      setFormData({
        name: "",
        origin: "",
        destination: "",
        distance_km: "",
        estimated_time_min: "",
      });
      setTimeout(
        () => axios.get(`${API_URL}/routes`).then((res) => setRoutes(res.data)),
        2000,
      );
    } catch (error) {
      alert("Failed to create route");
    }
  };

  return (
    <div className="routes">
      <div className="section-header">
        <h2>Safe Routes - South Africa</h2>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          {showForm ? "Cancel" : "+ Request Safe Route"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="route-form">
          <input
            type="text"
            placeholder="Route Name (e.g., Joburg to Pretoria)"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <input
            type="text"
            placeholder="Origin (e.g., Sandton, Johannesburg)"
            value={formData.origin}
            onChange={(e) =>
              setFormData({ ...formData, origin: e.target.value })
            }
            required
          />
          <input
            type="text"
            placeholder="Destination (e.g., Pretoria CBD)"
            value={formData.destination}
            onChange={(e) =>
              setFormData({ ...formData, destination: e.target.value })
            }
            required
          />
          <input
            type="number"
            step="0.1"
            placeholder="Distance (km)"
            value={formData.distance_km}
            onChange={(e) =>
              setFormData({ ...formData, distance_km: e.target.value })
            }
          />
          <input
            type="number"
            placeholder="Est. Time (min)"
            value={formData.estimated_time_min}
            onChange={(e) =>
              setFormData({ ...formData, estimated_time_min: e.target.value })
            }
          />
          <button type="submit" className="btn-primary">
            Get Safe Route
          </button>
        </form>
      )}

      <div className="routes-grid">
        {routes.map((route) => (
          <div key={route.id} className="route-card">
            <h3>{route.name}</h3>
            <div className="route-details">
              <div>
                <strong>From:</strong> {route.origin}
              </div>
              <div>
                <strong>To:</strong> {route.destination}
              </div>
              {route.distance_km && (
                <div>
                  <strong>Distance:</strong> {route.distance_km} km
                </div>
              )}
              {route.estimated_time_min && (
                <div>
                  <strong>Time:</strong> {route.estimated_time_min} min
                </div>
              )}
              <div>
                <strong>Risk:</strong>{" "}
                <span className={`risk-${route.risk_level.toLowerCase()}`}>
                  {route.risk_level}
                </span>
              </div>
            </div>
            {route.ai_recommendations && (
              <div className="recommendations">
                <strong>AI Safety Recommendations:</strong>
                <p>{route.ai_recommendations}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function Alerts({ user }) {
  const [alerts, setAlerts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    severity: "MODERATE",
  });

  useEffect(() => {
    axios.get(`${API_URL}/alerts`).then((res) => setAlerts(res.data));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/alerts`, formData);
      alert("Alert created!");
      setShowForm(false);
      setFormData({ title: "", message: "", severity: "MODERATE" });
      axios.get(`${API_URL}/alerts`).then((res) => setAlerts(res.data));
    } catch (error) {
      alert("Failed to create alert");
    }
  };

  return (
    <div className="alerts">
      <div className="section-header">
        <h2>Safety Alerts</h2>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          {showForm ? "Cancel" : "+ Create Alert"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="alert-form">
          <input
            type="text"
            placeholder="Alert Title (e.g., High Risk Area Warning)"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            required
          />
          <textarea
            placeholder="Message"
            value={formData.message}
            onChange={(e) =>
              setFormData({ ...formData, message: e.target.value })
            }
            required
          />
          <select
            value={formData.severity}
            onChange={(e) =>
              setFormData({ ...formData, severity: e.target.value })
            }
          >
            <option value="LOW">Low</option>
            <option value="MODERATE">Moderate</option>
            <option value="HIGH">High</option>
            <option value="CRITICAL">Critical</option>
          </select>
          <button type="submit" className="btn-primary">
            Send Alert
          </button>
        </form>
      )}

      <div className="alerts-list">
        {alerts.map((alert) => (
          <div key={alert.id} className="alert-card">
            <div className="alert-header">
              <span
                className={`severity-badge ${alert.severity.toLowerCase()}`}
              >
                {alert.severity}
              </span>
            </div>
            <h3>{alert.title}</h3>
            <p>{alert.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function AIChat() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hello! I am SafeRoute AI Assistant for South Africa. How can I help you with safety and route information?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await axios.post(`${API_URL}/chat`, { message: input });
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: res.data.response },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I had trouble responding. Please try again.",
        },
      ]);
    }
    setLoading(false);
  };

  return (
    <div className="chat-container">
      <h2>AI Assistant - South Africa</h2>
      <div className="chat-messages">
        {messages.map((msg, idx) => (
          <div key={idx} className={`message ${msg.role}`}>
            <div className="message-content">{msg.content}</div>
          </div>
        ))}
        {loading && (
          <div className="message assistant loading">Thinking...</div>
        )}
      </div>
      <form onSubmit={handleSubmit} className="chat-input">
        <input
          type="text"
          placeholder="Ask about safety in Johannesburg, Cape Town, Durban..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
        />
        <button type="submit" disabled={loading || !input.trim()}>
          Send
        </button>
      </form>
    </div>
  );
}

export default App;
