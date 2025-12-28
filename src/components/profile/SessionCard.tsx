import React from 'react';

interface SessionCardProps {
  session: {
    id: string;
    deviceInfo: string;
    createdAt: string;
    isCurrent: boolean;
  };
  onRevoke: (sessionId: string) => void;
  revoking?: boolean;
}

const SessionCard: React.FC<SessionCardProps> = ({ session, onRevoke, revoking }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const parseDeviceInfo = (deviceInfo: string) => {
    // Try to extract browser and OS from user agent
    const ua = deviceInfo.toLowerCase();
    let browser = 'Unknown';
    let os = 'Unknown';

    // Browser detection
    if (ua.includes('chrome') && !ua.includes('edg')) browser = 'Chrome';
    else if (ua.includes('firefox')) browser = 'Firefox';
    else if (ua.includes('safari') && !ua.includes('chrome')) browser = 'Safari';
    else if (ua.includes('edg')) browser = 'Edge';
    else if (ua.includes('opera')) browser = 'Opera';

    // OS detection
    if (ua.includes('windows')) os = 'Windows';
    else if (ua.includes('mac')) os = 'macOS';
    else if (ua.includes('linux')) os = 'Linux';
    else if (ua.includes('android')) os = 'Android';
    else if (ua.includes('ios') || ua.includes('iphone') || ua.includes('ipad')) os = 'iOS';

    return { browser, os, full: deviceInfo };
  };

  const device = parseDeviceInfo(session.deviceInfo);

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <div style={styles.deviceInfo}>
          <div style={styles.deviceName}>
            {device.browser} on {device.os}
            {session.isCurrent && <span style={styles.currentBadge}>Current</span>}
          </div>
          <div style={styles.deviceDetails}>{device.full}</div>
        </div>
        {!session.isCurrent && (
          <button
            onClick={() => onRevoke(session.id)}
            disabled={revoking}
            style={styles.revokeButton}
          >
            {revoking ? 'Revoking...' : 'Revoke'}
          </button>
        )}
      </div>
      <div style={styles.footer}>
        <span style={styles.date}>Active since: {formatDate(session.createdAt)}</span>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  card: {
    border: '1px solid #ddd',
    borderRadius: '8px',
    padding: '16px',
    backgroundColor: 'white',
    marginBottom: '12px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '12px',
  },
  deviceInfo: {
    flex: 1,
  },
  deviceName: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#333',
    marginBottom: '4px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  currentBadge: {
    fontSize: '12px',
    padding: '2px 8px',
    backgroundColor: '#28a745',
    color: 'white',
    borderRadius: '12px',
    fontWeight: '500',
  },
  deviceDetails: {
    fontSize: '12px',
    color: '#666',
    wordBreak: 'break-all',
  },
  revokeButton: {
    padding: '6px 12px',
    fontSize: '14px',
    fontWeight: '600',
    color: 'white',
    backgroundColor: '#dc3545',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  footer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: '12px',
    borderTop: '1px solid #eee',
  },
  date: {
    fontSize: '12px',
    color: '#666',
  },
};

export default SessionCard;

