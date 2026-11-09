export default function Table({ columns, children }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-hairline">
      <table className="w-full min-w-[640px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-hairline bg-surface-soft">
            {columns.map((col) => (
              <th key={col} className="whitespace-nowrap px-4 py-3 font-medium text-muted">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-hairline-soft">{children}</tbody>
      </table>
    </div>
  );
}
