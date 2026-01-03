import { fallback } from '@tanstack/zod-adapter';
import * as UiReact from 'tinybase/ui-react/with-schemas';
import z from 'zod';

export const SearchSchema = z.object({
  search: fallback(z.string(), '').default(''),
})

export const tablesSchema = {
  manuscripts: {
    manuscriptId: { type: 'string' },
    author: { type: 'string' },
    title: { type: 'string' },
    type: { type: 'string' },
    editor: { type: 'string' },
    daysWithEditor: { type: 'number' },
    initialSubmissionDate: { type: 'number' },
    initialSubmissionDateRaw: { type: 'string' },
    editorialStatus: { type: 'string' },
  },
  history: {
    manuscriptId: { type: 'string' },
    reviewerName: { type: 'string' },
    dateInvited: { type: 'number' },
    dateInvitedRaw: { type: 'string' },
    agreeDate: { type: 'number' },
    agreeDateRaw: { type: 'string' },
    reviewComplete: { type: 'string' },
    recommendation: { type: 'string' },
    revision: { type: 'string' },
  },
} as const

export const valuesSchema = {
  theme: { type: 'string', default: 'light' },
} as const

const UiReactWithSchemas = UiReact as UiReact.WithSchemas<
  [typeof tablesSchema, typeof valuesSchema]
>

export const {
  Provider: TinyBaseProvider,
  useCreateIndexes,
  useCreateRelationships,
  useCreatePersister,
  useCreateQueries,
  useCreateStore,
  CellProps,
  useTable,
  useTablesListener,
  useTableListener,
  useResultTable,
  useResultRow,
  RowView,
  useRow,
  RowProps,
  useAddRowCallback,
  useCell,
  useValue,
  useHasValue,
  useHasRow,
  useDelRowCallback,
  useRowIds,
  useSetPartialRowCallback,
  useRowListener,
  useSetPartialValuesCallback,
  useRelationships,
  RemoteRowView,
  useQueries,
  useResultCell,
  useResultSortedRowIds,
  useResultRowIds,
  useResultTableCellIds,
  useSetCellCallback,
  useSliceIds,
  useIndexes,
  IndexView,
  useSliceRowIds,
  SliceProps,
  SliceView,
  useStore,
  useLocalRowIds,
  CellView,
  ResultCellProps,
  ResultCellView,
  ResultRowView,
  useRowIdsListener,
} = UiReactWithSchemas;