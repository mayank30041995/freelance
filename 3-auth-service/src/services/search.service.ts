import { elasticSearchClient, getDocumentById } from '@auth/elasticsearch';
import { IHitsTotal, IPaginateProps, IQueryList, ISearchResult, ISellerGig } from '@mayank30041995/jobber-shared';

type SearchResponse = Awaited<ReturnType<typeof elasticSearchClient.search>>;

export async function gigById(index: string, gigId: string): Promise<ISellerGig> {
  const gig: ISellerGig = await getDocumentById(index, gigId);
  return gig;
}

export async function gigsSearch(
  searchQuery: string,
  paginate: IPaginateProps,
  deliveryTime?: string,
  min?: number,
  max?: number
): Promise<ISearchResult> {
  const { from, size, type } = paginate;

  const queryList: IQueryList[] = [
    {
      query_string: {
        fields: ['username', 'title', 'description', 'basicDescription', 'basicTitle', 'categories', 'subCategories', 'tags'],
        query: `*${searchQuery}*`
      }
    },
    {
      term: {
        active: true
      }
    }
  ];

  if (deliveryTime && deliveryTime !== 'undefined') {
    queryList.push({
      query_string: {
        fields: ['expectedDelivery'],
        query: `*${deliveryTime}*`
      }
    });
  }

  const minPrice = Number(min);
  const maxPrice = Number(max);

  if (Number.isFinite(minPrice) && Number.isFinite(maxPrice)) {
    queryList.push({
      range: {
        price: {
          gte: minPrice,
          lte: maxPrice
        }
      }
    });
  }

  const searchOptions: Parameters<typeof elasticSearchClient.search>[0] = {
    index: 'gigs',
    size,
    query: {
      bool: {
        must: queryList
      }
    },
    sort: [
      {
        sortId: type === 'forward' ? 'asc' : 'desc'
      }
    ]
  };

  if (from !== undefined && from !== null && from !== '' && from !== '0') {
    searchOptions.search_after = [from];
  }

  const result: SearchResponse = await elasticSearchClient.search(searchOptions);

  const total: IHitsTotal =
    typeof result.hits.total === 'number'
      ? {
          value: result.hits.total,
          relation: 'eq'
        }
      : (result.hits.total ?? {
          value: 0,
          relation: 'eq'
        });

  return {
    total: total.value,
    hits: result.hits.hits
  };
}
