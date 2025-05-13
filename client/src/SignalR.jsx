import * as signalR from "@microsoft/signalr";

class SignalRService {
  constructor() {
    this.connection = null;
    this.connectionPromise = null;
    this.listeners = {};
  }

  async initConnection() {
    console.log("Initializing SignalR connection...");

    if (this.connectionPromise) {
      console.log(
        "Connection already initializing, returning existing promise"
      );
      return this.connectionPromise;
    }

    if (this.connection) {
      console.log("Connection already exists");
      return Promise.resolve(this.connection);
    }

    this.connectionPromise = new Promise((resolve, reject) => {
      try {
        console.log("Creating new SignalR connection");
        this.connection = new signalR.HubConnectionBuilder()
          .withUrl("https://localhost:7133/notificationhub")
          .withAutomaticReconnect()
          .configureLogging(signalR.LogLevel.Debug) // Set to Debug for more detailed logs
          .build();

        // Set up listeners
        this.connection.on("ReceiveNotification", (notification) => {
          console.log("🔔 Received notification:", notification);
          this._notifyListeners("notification", notification);
        });

        // Set up listeners
        this.connection.on("ReceiveAnnouncement", (notification) => {
          console.log("🔔 Received announcement:", notification);
          this._notifyListeners("notification", notification);
        });

        this.connection.on("ReceiveTestMessage", (message) => {
          console.log("📝 Received test message:", message);
          this._notifyListeners("testMessage", message);
        });

        // Connection lifecycle events
        this.connection.onreconnecting((error) => {
          console.warn("⚠️ SignalR reconnecting:", error);
        });

        this.connection.onreconnected((connectionId) => {
          console.log("🔄 SignalR reconnected. Connection ID:", connectionId);
        });

        this.connection.onclose((error) => {
          console.warn("❌ SignalR connection closed:", error);
          this.connection = null;
          this.connectionPromise = null;
        });

        // Start the connection
        console.log("Starting SignalR connection...");
        this.connection
          .start()
          .then(() => {
            console.log(
              "✅ SignalR connected successfully! Connection ID:",
              this.connection.connectionId
            );
            resolve(this.connection);
            this.connectionPromise = null; // Reset promise after successful connection
          })
          .catch((err) => {
            console.error("❌ SignalR connection error:", err);
            this.connection = null;
            this.connectionPromise = null;
            reject(err);
          });
      } catch (err) {
        console.error("❌ SignalR setup error:", err);
        this.connection = null;
        this.connectionPromise = null;
        reject(err);
      }
    });

    return this.connectionPromise;
  }

  // Add a listener for a specific event type
  addListener(eventType, callback) {
    if (!this.listeners[eventType]) {
      this.listeners[eventType] = [];
    }

    this.listeners[eventType].push(callback);

    return () => this.removeListener(eventType, callback);
  }

  // Remove a specific listener
  removeListener(eventType, callback) {
    if (!this.listeners[eventType]) return;

    this.listeners[eventType] = this.listeners[eventType].filter(
      (cb) => cb !== callback
    );
  }

  // Notify all listeners of a specific event type
  _notifyListeners(eventType, data) {
    if (!this.listeners[eventType]) return;

    this.listeners[eventType].forEach((callback) => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error in ${eventType} listener:`, error);
      }
    });
  }

  // Test method to verify connection
  async testConnection() {
    if (
      !this.connection ||
      this.connection.state !== signalR.HubConnectionState.Connected
    ) {
      await this.initConnection();
    }

    console.log("📤 Sending test message to server...");
    try {
      await this.connection.invoke("TestConnection", "Hello from client!");
      console.log("✅ Test message sent successfully");
      return true;
    } catch (err) {
      console.error("❌ Error sending test message:", err);
      return false;
    }
  }

  // Stop the connection
  async stopConnection() {
    if (this.connection) {
      try {
        await this.connection.stop();
        console.log("SignalR connection stopped");
      } catch (err) {
        console.error("Error stopping SignalR connection:", err);
      } finally {
        this.connection = null;
        this.connectionPromise = null;
      }
    }
  }
}

// Create and export a singleton instance
const signalRService = new SignalRService();
export default signalRService;
