import { useNotifications } from '../../context/NotificationContext'

const NotificationSystem = () => {
  const { notifications } = useNotifications()

  console.log('Notification', notifications)

  return (
    <div className="notification-system">
      <div className={'notification-panel'}>
        <div className="notification-header">
          <h3>Notifications</h3>
        </div>

        <div className="notification-content">
          {notifications.size === 0 ? (
            <div className="notification-empty">
              <p>No notifications yet</p>
            </div>
          ) : (
            Array.from(notifications).map((notification) => (
              <div
                key={notification.id}
                className="notification-item"
              >
                <div className="notification-message">
                  {notification.formattedMessage}
                </div>
                <div className="notification-time">
                  {notification.timestamp.toLocaleTimeString()}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
export default NotificationSystem