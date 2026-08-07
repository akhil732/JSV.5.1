import React, { ReactNode, TableHTMLAttributes, HTMLAttributes, forwardRef } from 'react';

/**
 * Table Component - Main Container
 */
interface TableProps extends TableHTMLAttributes<HTMLTableElement> {
  children: ReactNode;
  dense?: boolean;
  striped?: boolean;
  hoverable?: boolean;
}

export const Table = forwardRef<HTMLTableElement, TableProps>(
  ({ dense = false, striped = true, hoverable = true, className = '', ...props }, ref) => {
    return (
      <div className="w-full overflow-x-auto rounded-lg border border-royal-navy/5 dark:border-outline-variant/20">
        <table
          ref={ref}
          className={`
            w-full
            border-collapse
            text-left
            ${className}
          `.trim()}
          {...props}
        />
      </div>
    );
  }
);

Table.displayName = 'Table';

/**
 * Table Header Component
 */
interface TableHeaderProps extends TableHTMLAttributes<HTMLTableSectionElement> {
  children: ReactNode;
}

export const TableHeader = forwardRef<HTMLTableSectionElement, TableHeaderProps>(
  ({ children, ...props }, ref) => (
    <thead ref={ref} {...props}>
      {children}
    </thead>
  )
);

TableHeader.displayName = 'TableHeader';

/**
 * Table Header Cell Component
 */
interface TableHeaderCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
  sorted?: 'asc' | 'desc' | null;
  onSort?: () => void;
}

export const TableHeaderCell = forwardRef<HTMLTableCellElement, TableHeaderCellProps>(
  (
    {
      align = 'left',
      sortable = false,
      sorted = null,
      onSort,
      children,
      className = '',
      ...props
    },
    ref
  ) => {
    const alignClass = {
      left: 'text-left',
      center: 'text-center',
      right: 'text-right',
    }[align];

    return (
      <th
        ref={ref}
        className={`
          bg-secondary-container dark:bg-secondary-container/50
          text-on-secondary-container dark:text-on-secondary-container
          px-4 py-3
          text-label-caps
          font-bold
          tracking-widest
          border-b border-on-surface-variant/20
          ${alignClass}
          ${sortable ? 'cursor-pointer hover:bg-secondary-container/80 transition-colors' : ''}
          ${className}
        `.trim()}
        onClick={sortable ? onSort : undefined}
        {...props}
      >
        <div className="flex items-center gap-2">
          {children}
          {sortable && sorted === 'asc' && (
            <span className="text-xs">↑</span>
          )}
          {sortable && sorted === 'desc' && (
            <span className="text-xs">↓</span>
          )}
        </div>
      </th>
    );
  }
);

TableHeaderCell.displayName = 'TableHeaderCell';

/**
 * Table Body Component
 */
interface TableBodyProps extends TableHTMLAttributes<HTMLTableSectionElement> {
  children: ReactNode;
}

export const TableBody = forwardRef<HTMLTableSectionElement, TableBodyProps>(
  ({ children, ...props }, ref) => (
    <tbody ref={ref} {...props}>
      {children}
    </tbody>
  )
);

TableBody.displayName = 'TableBody';

/**
 * Table Row Component
 */
interface TableRowProps extends HTMLAttributes<HTMLTableRowElement> {
  isAlternate?: boolean;
  isHighlighted?: boolean;
  children: ReactNode;
}

export const TableRow = forwardRef<HTMLTableRowElement, TableRowProps>(
  ({ isAlternate = false, isHighlighted = false, children, className = '', ...props }, ref) => (
    <tr
      ref={ref}
      className={`
        border-b border-on-surface-variant/10
        transition-colors duration-150
        ${
          isAlternate
            ? 'bg-surface-container/50 dark:bg-surface-container/30'
            : 'bg-transparent'
        }
        ${
          isHighlighted
            ? 'bg-primary-fixed/20 dark:bg-primary-fixed/10'
            : 'hover:bg-surface-container/80 dark:hover:bg-surface-container/60'
        }
        ${className}
      `.trim()}
      {...props}
    >
      {children}
    </tr>
  )
);

TableRow.displayName = 'TableRow';

/**
 * Table Cell Component
 */
interface TableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
  align?: 'left' | 'center' | 'right';
  variant?: 'default' | 'numeric' | 'muted';
  monospace?: boolean;
}

export const TableCell = forwardRef<HTMLTableCellElement, TableCellProps>(
  (
    {
      align = 'left',
      variant = 'default',
      monospace = false,
      children,
      className = '',
      ...props
    },
    ref
  ) => {
    const alignClass = {
      left: 'text-left',
      center: 'text-center',
      right: 'text-right',
    }[align];

    const variantClass = {
      default: 'text-body-md text-on-surface',
      numeric: 'text-body-md text-on-surface font-semibold',
      muted: 'text-body-sm text-on-surface-variant',
    }[variant];

    return (
      <td
        ref={ref}
        className={`
          px-4 py-3
          ${alignClass}
          ${variantClass}
          ${monospace ? 'font-mono' : ''}
          ${className}
        `.trim()}
        {...props}
      >
        {children}
      </td>
    );
  }
);

TableCell.displayName = 'TableCell';

/**
 * Convenience Hook for Creating Table Rows with Alternating Backgrounds
 */
export function useTableRows<T extends Record<string, any>>(
  data: T[],
  renderRow: (item: T, index: number) => React.ReactNode
) {
  return data.map((item, index) => (
    <TableRow key={index} isAlternate={index % 2 === 0}>
      {renderRow(item, index)}
    </TableRow>
  ));
}

/**
 * Data Table Component - All-in-one Table Builder
 */
interface Column<T> {
  key: keyof T;
  label: string;
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
  render?: (value: any, item: T) => ReactNode;
  numeric?: boolean;
}

interface DataTableProps<T extends Record<string, any>> {
  data: T[];
  columns: Column<T>[];
  dense?: boolean;
  onRowClick?: (item: T, index: number) => void;
  sortable?: boolean;
}

export const DataTable = React.forwardRef<
  HTMLTableElement,
  DataTableProps<any>
>(
  (
    {
      data,
      columns,
      dense = false,
      onRowClick,
      sortable = false,
    },
    ref
  ) => {
    const [sortColumn, setSortColumn] = React.useState<string | null>(null);
    const [sortDirection, setSortDirection] = React.useState<'asc' | 'desc'>('asc');

    const handleSort = (columnKey: string) => {
      if (sortColumn === columnKey) {
        setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
      } else {
        setSortColumn(columnKey);
        setSortDirection('asc');
      }
    };

    let sortedData = [...data];
    if (sortable && sortColumn) {
      sortedData.sort((a, b) => {
        const aVal = a[sortColumn as keyof typeof a];
        const bVal = b[sortColumn as keyof typeof b];

        if (typeof aVal === 'string') {
          return sortDirection === 'asc'
            ? aVal.localeCompare(bVal)
            : bVal.localeCompare(aVal);
        }

        return sortDirection === 'asc'
          ? (aVal as number) - (bVal as number)
          : (bVal as number) - (aVal as number);
      });
    }

    return (
      <Table ref={ref} dense={dense}>
        <TableHeader>
          <TableRow>
            {columns.map((col) => (
              <TableHeaderCell
                key={String(col.key)}
                align={col.align || 'left'}
                sortable={sortable && col.sortable}
                sorted={
                  sortColumn === String(col.key) ? sortDirection : null
                }
                onSort={() => handleSort(String(col.key))}
              >
                {col.label}
              </TableHeaderCell>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedData.map((item, rowIndex) => (
            <TableRow
              key={rowIndex}
              isAlternate={rowIndex % 2 === 0}
              onClick={() => onRowClick?.(item, rowIndex)}
              className={onRowClick ? 'cursor-pointer' : ''}
            >
              {columns.map((col) => (
                <TableCell
                  key={String(col.key)}
                  align={col.align || 'left'}
                  variant={col.numeric ? 'numeric' : 'default'}
                  monospace={col.numeric}
                >
                  {col.render
                    ? col.render(item[col.key], item)
                    : item[col.key]}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  }
);

DataTable.displayName = 'DataTable';

export default Table;
