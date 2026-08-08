import React from 'react';

const Table = ({ headers, children, className = '' }) => {
  return (
    <div className={`ui-table-container ${className}`}>
      <table className="ui-table">
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
