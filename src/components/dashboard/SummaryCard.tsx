import React from 'react';

interface SummaryCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: string;
  variant?: 'primary' | 'success' | 'warning' | 'info' | 'default';
  onClick?: () => void;
}

const SummaryCard: React.FC<SummaryCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  variant = 'default',
  onClick,
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          borderColor: '#3b82f6',
          backgroundColor: '#eff6ff',
          valueColor: '#1e40af',
        };
      case 'success':
        return {
          borderColor: '#10b981',
          backgroundColor: '#ecfdf5',
          valueColor: '#065f46',
        };
      case 'warning':
        return {
          borderColor: '#f59e0b',
          backgroundColor: '#fffbeb',
          valueColor: '#92400e',
        };
      case 'info':
        return {
          borderColor: '#06b6d4',
          backgroundColor: '#ecfeff',
          valueColor: '#164e63',
        };
      default:
        return {
          borderColor: '#e5e7eb',
          backgroundColor: '#ffffff',
          valueColor: '#111827',
        };
    }
  };

  const variantStyles = getVariantStyles();

  return (
    <div
      style={{
        ...styles.card,
        borderColor: variantStyles.borderColor,
        backgroundColor: variantStyles.backgroundColor,
        cursor: onClick ? 'pointer' : 'default',
      }}
      onClick={onClick}
      onMouseEnter={(e) => {
        if (onClick) {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.15)';
        }
      }}
      onMouseLeave={(e) => {
        if (onClick) {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
        }
      }}
    >
      <div style={styles.header}>
        <h3 style={styles.title}>{title}</h3>
        {icon && <span style={styles.icon}>{icon}</span>}
      </div>
      <div style={{ ...styles.value, color: variantStyles.valueColor }}>
        {value}
      </div>
      {subtitle && <div style={styles.subtitle}>{subtitle}</div>}
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  card: {
    padding: '20px',
    borderRadius: '8px',
    border: '2px solid',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
  },
  title: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#6b7280',
    margin: 0,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  icon: {
    fontSize: '20px',
  },
  value: {
    fontSize: '28px',
    fontWeight: 'bold',
    marginBottom: '4px',
  },
  subtitle: {
    fontSize: '12px',
    color: '#9ca3af',
    marginTop: '4px',
  },
};

export default SummaryCard;

