import { Search } from 'lucide-react';
import type { PaginatedRecords } from '../lib/api';
import type { Dispatch, SetStateAction } from 'react';

interface RecordsTableProps {
  records: PaginatedRecords;
  setPage: Dispatch<SetStateAction<number>>;
  filter: string;
  setFilter: Dispatch<SetStateAction<string>>;
  search: string;
  setSearch: Dispatch<SetStateAction<string>>;
}

export default function RecordsTable({
  records,
  setPage,
  filter,
  setFilter,
  search,
  setSearch
}: RecordsTableProps) {

  const humanize = (str: string) => {
    return str
      .replace(/_/g, ' ')
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/\b\w/g, (c) => c.toUpperCase());
  };

  return (
    <div className="card">
      <div className="flex items-center gap-4 mb-4">
        <div className="flex gap-2">
          <select className="select" value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">All Records</option>
            <option value="valid">Valid Only</option>
            <option value="invalid">Invalid Only</option>
            <option value="duplicate">Duplicates Only</option>
          </select>
        </div>
        <div style={{ position: 'relative' }}>
          <input
            type="text"
            className="input"
            placeholder="Search by name, email, company, city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: '36px', width: '320px' }}
          />
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '10px', color: 'var(--color-text-muted)' }} />
        </div>
      </div>

      {records.records.length === 0 ? (
        <div className="text-center py-6" style={{ color: 'var(--color-text-muted)' }}>
          No records found matching filters.
        </div>
      ) : (
        <>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th style={{ width: '60px' }}>Row</th>
                  <th style={{ width: '100px' }}>Status</th>
                  <th>Data</th>
                  <th style={{ width: '250px' }}>Reasons</th>
                </tr>
              </thead>
              <tbody>
                {records.records.map((record) => (
                  <tr key={record.id}>
                    <td style={{ fontWeight: 600 }}>{record.row_number}</td>
                    <td>
                      {record.is_duplicate ? (
                        <span className="badge badge-warning">Duplicate</span>
                      ) : record.is_valid ? (
                        <span className="badge badge-success">Valid</span>
                      ) : (
                        <span className="badge badge-error">Invalid</span>
                      )}
                    </td>
                    <td style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(record.raw_data).map(([key, value]) => {
                          return (
                            <span key={key} style={{ fontSize: '13px', color: 'var(--color-text-main)', backgroundColor: 'var(--color-bg)', padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--color-border)' }}>
                              <strong style={{ color: 'var(--color-text-muted)', marginRight: '4px' }}>{humanize(key)}:</strong>
                              {String(value)}
                            </span>
                          );
                        })}
                      </div>
                    </td>
                    <td>
                      {record.validation_reasons.length > 0 ? (
                        <div className="flex flex-col gap-1">
                          {record.validation_reasons.map((reason, i) => (
                            <span key={i} style={{ fontSize: '12px', color: 'var(--color-error)' }}>
                              • {reason}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span style={{ color: 'var(--color-success)', fontSize: '12px', fontWeight: 600 }}>Perfect</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between mt-4" style={{ fontSize: '14px' }}>
            <span style={{ color: 'var(--color-text-muted)' }}>
              Showing {((records.page - 1) * records.limit) + 1} to {Math.min(records.page * records.limit, records.total)} of {records.total}
            </span>
            <div className="flex gap-2">
              <button
                className="btn btn-outline"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={records.page === 1}
              >
                Previous
              </button>
              <button
                className="btn btn-outline"
                onClick={() => setPage(p => p + 1)}
                disabled={records.page * records.limit >= records.total}
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
