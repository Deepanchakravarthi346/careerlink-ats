import os

base_path = "D:/jobportal/frontend/src/components/ui"
os.makedirs(base_path, exist_ok=True)

components = {
    "Button.jsx": """import React from 'react';

const Button = ({ variant = 'primary', children, className = '', ...props }) => {
  return (
    <button className={`btn btn-${variant} ${className}`} {...props}>
      {children}
    </button>
  );
};

export default Button;
""",
    "Input.jsx": """import React from 'react';

const Input = ({ label, error, className = '', ...props }) => {
  return (
    <div className={`input-group ${className}`}>
      {label && <label className="input-label">{label}</label>}
      <input className={`input-field ${error ? 'input-error' : ''}`} {...props} />
      {error && <span className="input-error-msg">{error}</span>}
    </div>
  );
};

export default Input;
""",
    "Select.jsx": """import React from 'react';

const Select = ({ label, error, options, className = '', ...props }) => {
  return (
    <div className={`input-group ${className}`}>
      {label && <label className="input-label">{label}</label>}
      <select className={`input-field ${error ? 'input-error' : ''}`} {...props}>
        {options.map((opt, i) => (
          <option key={i} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {error && <span className="input-error-msg">{error}</span>}
    </div>
  );
};

export default Select;
""",
    "Textarea.jsx": """import React from 'react';

const Textarea = ({ label, error, className = '', ...props }) => {
  return (
    <div className={`input-group ${className}`}>
      {label && <label className="input-label">{label}</label>}
      <textarea className={`input-field ${error ? 'input-error' : ''}`} {...props}></textarea>
      {error && <span className="input-error-msg">{error}</span>}
    </div>
  );
};

export default Textarea;
""",
    "Modal.jsx": """import React from 'react';

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        <div className="modal-body">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
""",
    "Card.jsx": """import React from 'react';

const Card = ({ children, className = '', ...props }) => {
  return (
    <div className={`card ${className}`} {...props}>
      {children}
    </div>
  );
};

export default Card;
""",
    "StatisticCard.jsx": """import React from 'react';
import Card from './Card';

const StatisticCard = ({ title, value, icon, className = '' }) => {
  return (
    <Card className={`stat-card ${className}`}>
      <div className="stat-info">
        <h4 className="stat-title">{title}</h4>
        <span className="stat-value">{value}</span>
      </div>
      {icon && <div className="stat-icon">{icon}</div>}
    </Card>
  );
};

export default StatisticCard;
""",
    "Badge.jsx": """import React from 'react';

const Badge = ({ variant = 'primary', children, className = '' }) => {
  return (
    <span className={`badge badge-${variant} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;
""",
    "Avatar.jsx": """import React from 'react';

const Avatar = ({ src, alt, size = 'md', className = '' }) => {
  return (
    <div className={`avatar avatar-${size} ${className}`}>
      {src ? (
        <img src={src} alt={alt} />
      ) : (
        <div className="avatar-placeholder">{alt ? alt.charAt(0).toUpperCase() : '?'}</div>
      )}
    </div>
  );
};

export default Avatar;
""",
    "Table.jsx": """import React from 'react';

const Table = ({ headers, children, className = '' }) => {
  return (
    <div className={`table-container ${className}`}>
      <table className="table">
        <thead>
          <tr>
            {headers.map((h, i) => <th key={i}>{h}</th>)}
          </tr>
        </thead>
        <tbody>
          {children}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
""",
    "Loader.jsx": """import React from 'react';

const Loader = ({ fullScreen = false }) => {
  if (fullScreen) {
    return (
      <div className="loader-fullscreen">
        <div className="spinner"></div>
      </div>
    );
  }
  return <div className="spinner"></div>;
};

export default Loader;
""",
    "Skeleton.jsx": """import React from 'react';

const Skeleton = ({ type = 'text', count = 1, className = '' }) => {
  const skeletons = Array(count).fill(0);
  return (
    <>
      {skeletons.map((_, i) => (
        <div key={i} className={`skeleton skeleton-${type} ${className}`}></div>
      ))}
    </>
  );
};

export default Skeleton;
""",
    "EmptyState.jsx": """import React from 'react';

const EmptyState = ({ title, description, action, icon }) => {
  return (
    <div className="empty-state">
      {icon && <div className="empty-icon">{icon}</div>}
      <h3 className="empty-title">{title}</h3>
      {description && <p className="empty-desc">{description}</p>}
      {action && <div className="empty-action">{action}</div>}
    </div>
  );
};

export default EmptyState;
""",
    "ErrorState.jsx": """import React from 'react';
import EmptyState from './EmptyState';

const ErrorState = ({ message, onRetry }) => {
  return (
    <EmptyState 
      title="Something went wrong" 
      description={message || "An error occurred while fetching data."}
      action={onRetry && <button className="btn btn-secondary" onClick={onRetry}>Try Again</button>}
    />
  );
};

export default ErrorState;
"""
}

for filename, content in components.items():
    with open(os.path.join(base_path, filename), "w", encoding="utf-8") as f:
        f.write(content)

css_content = """/* UI Components Design System */

/* Buttons */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-1) var(--spacing-2);
  border-radius: var(--radius-sm);
  font-weight: var(--font-weight-medium);
  font-size: var(--font-size-sm);
  cursor: pointer;
  transition: all var(--transition-normal);
  border: 1px solid transparent;
  gap: var(--spacing-1);
}

.btn-primary {
  background-color: var(--color-primary);
  color: #fff;
}

.btn-primary:hover {
  background-color: var(--color-primary-hover);
  box-shadow: var(--shadow-sm);
}

.btn-secondary {
  background-color: var(--color-bg);
  color: var(--color-text-primary);
  border-color: var(--color-border);
}

.btn-secondary:hover {
  background-color: var(--color-border);
}

.btn-danger {
  background-color: var(--color-danger);
  color: #fff;
}

.btn-danger:hover {
  background-color: var(--color-danger-hover);
}

.btn-success {
  background-color: var(--color-success);
  color: #fff;
}

.btn-success:hover {
  background-color: var(--color-success-hover);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Inputs */
.input-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: var(--spacing-2);
}

.input-label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
}

.input-field {
  padding: var(--spacing-1) var(--spacing-2);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-sm);
  font-family: var(--font-family);
  background-color: var(--color-card);
  color: var(--color-text-primary);
  transition: border-color var(--transition-fast);
}

.input-field:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.2);
}

.input-error {
  border-color: var(--color-danger);
}

.input-error-msg {
  font-size: var(--font-size-xs);
  color: var(--color-danger);
}

/* Cards */
.card {
  background-color: var(--color-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  padding: var(--spacing-3);
}

/* Stat Cards */
.stat-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.stat-title {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  font-weight: var(--font-weight-medium);
  margin-bottom: 4px;
}

.stat-value {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
}

.stat-icon {
  width: 48px;
  height: 48px;
  background-color: var(--color-bg);
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-primary);
}

/* Badges */
.badge {
  display: inline-flex;
  padding: 2px 8px;
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
}

.badge-primary { background: #DBEAFE; color: #1E40AF; }
.badge-success { background: #DCFCE7; color: #166534; }
.badge-warning { background: #FEF3C7; color: #92400E; }
.badge-danger { background: #FEE2E2; color: #991B1B; }
.badge-secondary { background: #F3F4F6; color: #374151; }

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background-color: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: var(--z-modal);
}

.modal-content {
  background: var(--color-card);
  border-radius: var(--radius-md);
  width: 100%;
  max-width: 500px;
  box-shadow: var(--shadow-lg);
  display: flex;
  flex-direction: column;
}

.modal-header {
  padding: var(--spacing-2) var(--spacing-3);
  border-bottom: 1px solid var(--color-border);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
}

.modal-close {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: var(--color-text-secondary);
}

.modal-body {
  padding: var(--spacing-3);
}

/* Table */
.table-container {
  width: 100%;
  overflow-x: auto;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-card);
}

.table {
  width: 100%;
  border-collapse: collapse;
}

.table th, .table td {
  padding: var(--spacing-2) var(--spacing-3);
  text-align: left;
  border-bottom: 1px solid var(--color-border);
}

.table th {
  background-color: var(--color-bg);
  font-weight: var(--font-weight-medium);
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.table tbody tr:last-child td {
  border-bottom: none;
}

.table tbody tr:hover {
  background-color: var(--color-bg);
}

/* Spinner */
.spinner {
  border: 3px solid rgba(0,0,0,0.1);
  border-radius: 50%;
  border-top-color: var(--color-primary);
  width: 24px;
  height: 24px;
  animation: spin 1s ease-in-out infinite;
}

.loader-fullscreen {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-bg);
  z-index: var(--z-modal);
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Skeletons */
.skeleton {
  background: linear-gradient(90deg, var(--color-border) 25%, #f1f3f5 50%, var(--color-border) 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
  border-radius: var(--radius-sm);
}

.skeleton-text {
  height: 16px;
  margin-bottom: 8px;
  width: 100%;
}
.skeleton-title {
  height: 24px;
  margin-bottom: 12px;
  width: 50%;
}
.skeleton-avatar {
  height: 48px;
  width: 48px;
  border-radius: var(--radius-full);
}
.skeleton-card {
  height: 150px;
  width: 100%;
  border-radius: var(--radius-md);
}

@keyframes loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* Empty States */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-5);
  text-align: center;
  color: var(--color-text-secondary);
}

.empty-icon {
  font-size: 48px;
  margin-bottom: var(--spacing-2);
  color: var(--color-border);
}

.empty-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-1);
}

.empty-desc {
  font-size: var(--font-size-sm);
  margin-bottom: var(--spacing-3);
  max-width: 400px;
}

/* Avatar */
.avatar {
  border-radius: var(--radius-full);
  overflow: hidden;
  background-color: var(--color-border);
  display: flex;
  align-items: center;
  justify-content: center;
}
.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.avatar-placeholder {
  color: var(--color-text-secondary);
  font-weight: var(--font-weight-medium);
}
.avatar-sm { width: 32px; height: 32px; font-size: 14px; }
.avatar-md { width: 48px; height: 48px; font-size: 18px; }
.avatar-lg { width: 64px; height: 64px; font-size: 24px; }

"""

with open("D:/jobportal/frontend/src/css/ui.css", "w", encoding="utf-8") as f:
    f.write(css_content)

print("UI Components created successfully!")
