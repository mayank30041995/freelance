import type { estypes } from '@elastic/elasticsearch';

export interface ISearchResult {
  hits: estypes.SearchHit[];
  total: number;
}

export interface IHitsTotal {
  value: number;
  relation: string;
}

export interface IQueryList {
  query_string?: IQueryString;
  range?: Partial<Record<estypes.Field, estypes.QueryDslRangeQuery>>;
  term?: ITerm;
}

export interface IQueryString {
  fields: string[];
  query: string;
}

export interface ITerm {
  active: boolean;
}

export interface IPaginateProps {
  from: string;
  size: number;
  type: string;
}
