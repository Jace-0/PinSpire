class NotificationService {
    constructor(wss) {
        this.wss = wss;
        this.clients = new Map(); // Map to store client connections by userId
    }

    // Add a new client connection
    addClient(userId, ws) {
        this.clients.set(userId, ws);
    }

    // Remove a client connection
    removeClient(userId) {
        this.clients.delete(userId);
    }

    // Send notification to a specific user
    async createNotification(notification) {
        try {
            const ws = this.clients.get(notification.userId);
            
            if (ws && ws.readyState === ws.OPEN) {
                ws.send(JSON.stringify(notification));
            }
            
        } catch (error) {
            console.error('Error sending notification:', error);
        }
    }

}